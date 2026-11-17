// The Overthinking Pad, episode 2026-11-17: "Why Your Brain Replays That Awkward Moment at 2 A.M." (rumination).
// Storyboard + drawings per scene. Each scene: block [x, y, w, h] on the endless sheet, purpose, shot (camera move and
// why), sfx, draw(S, L). S.at('word', nth) = when that word is spoken; S.f(u) = fraction of the line; S.t0 / S.end.
// Layout: row 0 = cold open (the bed at 2 a.m.; the ending whips back to it), rows 1-5 = chapters 1-5, left to right.
// Recurring objects: the bed + ceiling "memory screen" (the replay), the two seats (front row vs back of the room).
const BW = 1600, BH = 900, GX = 1800, GY = 1150;
const blk = (row, col, w = BW, h = BH) => [1500 + (col - 1) * GX, row * GY, w, h];
const banner = row => [-200, row * GY + 180, 1400, 560];
const WARM = 'rgba(255,205,40,0.42)';

// ---------- shared parts ----------
function tag(L, x, y, text, size, t0, o = {}) {   // dark-outlined label box with text
  const ctx = L.G.ctx; ctx.save(); ctx.font = `${size}px ${o.f || 'KB'}`; const w = ctx.measureText(text).width + size * 1.1; ctx.restore();
  const h = size * 1.5, x0 = o.align === 'left' ? x : x - w / 2;
  L.box(x0, y - h / 2, w, h, t0, 0.22, { r: 14, tint: o.tint || null, shadow: o.shadow ?? true });
  return L.TXT(text, x0 + w / 2, y + size * 0.34, size, { f: o.f || 'KB', align: 'center' }, t0 + 0.2, o.td ?? null);
}
function numDot(L, cx, cy, n, t0, r = 40) { const c = L.ell(cx, cy, r, r, 0, L.TAU, 30); L.FILL(c, t0); L.MRK([c], { col: L.YEL, w: 12 }, t0 + 0.1, 0.1); L.INK_(c, { closed: true, w: 3, amp: 0.5 }, t0, 0.14); return L.TXT(String(n), cx, cy + r * 0.42, r * 1.25, { f: 'KB', align: 'center' }, t0 + 0.14, 0.2); }
function heart(L, hx, hy, t0, w = 7) { L.MST(L.bez([hx, hy + 30], [hx - 40, hy - 20], [hx - 10, hy - 50], [hx, hy - 20]).concat(L.bez([hx, hy - 20], [hx + 10, hy - 50], [hx + 40, hy - 20], [hx, hy + 30])), { w, col: L.YELD }, t0, 0.3); }
// a bed seen from the side, the sleeper on their back. x = headboard, y = floor. returns a person-like {head, end}
function bed(L, x, y, w, t0, o = {}) {
  const k = o.k || 1, s = o.s || 1, r = 44 * s;
  const hb = [[x, y], [x, y - 250 * s], [x + 26 * s, y - 250 * s], [x + 26 * s, y]];
  L.FILL(hb, t0); L.MRK([hb], { col: L.GRY2, w: 10 }, t0 + 0.06, 0.06); L.INK_(hb, { closed: true, w: 3, amp: 0.4 }, t0, 0.12 * k);
  const mat = L.rrect(x + 26 * s, y - 120 * s, w, 46 * s, 12 * s);
  L.FILL(mat, t0 + 0.1); L.INK_(mat, { closed: true, w: 3, amp: 0.6 }, t0 + 0.1, 0.16 * k);
  L.INK_(L.line(x + w + 10 * s, y - 74 * s, x + w + 10 * s, y), { w: 3, amp: 0.3, passes: 1 }, t0 + 0.2, 0.05);
  const hx = x + 100 * s, hy = y - 120 * s - r * 0.8;
  const pil = L.ell(hx - 6 * s, y - 128 * s, 70 * s, 26 * s, 0, L.TAU, 36);
  L.FILL(pil, t0 + 0.2); L.INK_(pil, { closed: true, w: 2.6, amp: 0.5 }, t0 + 0.2, 0.1 * k);
  let t = L.head(hx, hy, r, t0 + 0.28, { hair: o.hair || 'tuft', kind: o.kind || 'neutral', look: o.look || [0, -1], k: 0.8 * k, you: o.you });
  const bl = L.bez([x + 150 * s, y - 120 * s], [x + 170 * s, y - 210 * s], [x + w * 0.6, y - 200 * s], [x + w + 20 * s, y - 150 * s]).concat([[x + w + 30 * s, y - 92 * s], [x + 140 * s, y - 92 * s]]);
  L.FILL(bl, t); L.MRK([bl], { col: o.you ? L.YEL : L.GRY, w: 16 }, t + 0.1, 0.12); L.INK_(bl, { closed: true, w: 3, amp: 0.7 }, t, 0.2 * k);
  for (let i = 0; i < 3; i++) L.INK_(L.quad([x + (260 + i * 120) * s, y - 190 * s + i * 4], [x + (300 + i * 120) * s, y - 150 * s], [x + (290 + i * 120) * s, y - 100 * s]), { w: 1.8, amp: 0.4, passes: 1, alpha: 0.5 }, t + 0.2 + i * 0.04, 0.06);
  return { head: [hx, hy, r], end: t + 0.3 * k };
}
// the projector beam from the head to a "memory screen" on the ceiling; inner(t) draws what plays on it
function memScreen(L, x, y, w, h, t0, o = {}) {
  const b = L.rrect(x, y, w, h, 16);
  L.FILL(b, t0); L.MRK([b], { col: 'rgba(255,205,40,0.16)', w: 18, edge: false }, t0 + 0.1, 0.2);
  L.INK_(b, { closed: true, w: 3, amp: 1, dash: o.dash || null }, t0, 0.24);
  if (o.from) { const [fx, fy] = o.from; L.MRK([[[fx, fy], [x + w * 0.08, y + h], [x + w * 0.92, y + h]]], { col: WARM, w: 24, ang: 1.2, edge: false }, t0 + 0.15, 0.35); }
  if (o.rec !== false) { const c = L.ell(x + 34, y + 30, 11, 11, 0, L.TAU, 16); L.MRK([c], { col: L.YELD, w: 8, edge: false }, t0 + 0.3, 0.05); L.TXT('REPLAY', x + 54, y + 42, 30, { f: 'KB' }, t0 + 0.32, 0.3); }
  return t0 + 0.4;
}
// the party memory: you mid-sentence, a listener reacting (drawn small inside the screen)
function partyMemory(L, x, y, s, t0, o = {}) {
  const A = L.person(x, y, s, t0, { pose: 'wave', you: true, kind: o.kind || 'grin', look: [1, 0], hair: 'tuft', k: 0.6 });
  const B = L.person(x + 170 * s, y, s, t0 + 0.2, { pose: 'hold', kind: 'neutral', look: [-1, 0], hair: 'long', k: 0.6 });
  L.cup(B.hand[1][0], B.hand[1][1] - 14 * s, 0.45 * s, t0 + 0.35);
  L.bubble(x - 40 * s, y - 330 * s, 150 * s, 70 * s, t0 + 0.35, { text: o.text || 'ha... wait', size: 22 * s, tail: [x + 6 * s, y - 210 * s], shadow: false });
  if (o.react !== false) L.react(B, o.react ?? t0 + 0.9, { kind: 'shock', look: [-1, 0] });
  return { A, B };
}
function filmStrip(L, x, y, n, fw, fh, t0, o = {}) {   // a horizontal strip of n frames with sprocket holes
  const W = n * fw + 20, b = [[x, y], [x + W, y], [x + W, y + fh + 40], [x, y + fh + 40]];
  L.FILL(b, t0); L.MRK([b], { col: L.GRY2, w: 12 }, t0 + 0.1, 0.12); L.INK_(b, { closed: true, w: 3, amp: 0.6 }, t0, 0.2);
  for (let i = 0; i < n; i++) {
    const fx = x + 10 + i * fw, fr = L.rrect(fx + 6, y + 20, fw - 12, fh, 6); L.FILL(fr, t0 + 0.2 + i * 0.05); L.INK_(fr, { closed: true, w: 2.2, amp: 0.3, passes: 1 }, t0 + 0.2 + i * 0.05, 0.06);
    for (let q = 0; q < 3; q++) { L.INK_(L.rrect(fx + 10 + q * fw / 3, y + 5, 12, 9, 2), { closed: true, w: 1.6, amp: 0.1, passes: 1 }, t0 + 0.25, 0.02); L.INK_(L.rrect(fx + 10 + q * fw / 3, y + fh + 26, 12, 9, 2), { closed: true, w: 1.6, amp: 0.1, passes: 1 }, t0 + 0.25, 0.02); }
    if (o.frame) o.frame(fx + fw / 2, y + 20 + fh / 2, i, t0 + 0.3 + i * 0.08);
  }
  return t0 + 0.4 + n * 0.08;
}
function keys(L, cx, cy, s, t0) {
  const ring = L.ell(cx, cy, 22 * s, 22 * s, 0, L.TAU, 24); L.INK_(ring, { closed: true, w: 3, amp: 0.3, passes: 1 }, t0, 0.08);
  const kb = L.ell(cx + 40 * s, cy + 24 * s, 18 * s, 18 * s, 0, L.TAU, 20); L.FILL(kb, t0 + 0.08); L.MRK([kb], { col: L.GRY2, w: 8 }, t0 + 0.1, 0.04); L.INK_(kb, { closed: true, w: 2.6, amp: 0.2, passes: 1 }, t0 + 0.08, 0.06);
  L.INK_([[cx + 54 * s, cy + 36 * s], [cx + 110 * s, cy + 84 * s], [cx + 100 * s, cy + 96 * s], [cx + 92 * s, cy + 86 * s], [cx + 84 * s, cy + 92 * s]], { w: 3, amp: 0.2, passes: 1 }, t0 + 0.12, 0.08);
  return t0 + 0.22;
}
// a dial: arc from 180° to 360°, value v in 0..1 sets the needle; optional warning light
function gauge(L, cx, cy, r, t0, o = {}) {
  const v = o.v ?? 0.7;
  const arc = L.ell(cx, cy, r, r, Math.PI, L.TAU, 50); const face = arc.concat([[cx + r, cy], [cx - r, cy]]);
  L.FILL(face, t0); L.dropShadow(face, 8, 9, t0 + 0.2, 0.08); L.INK_(arc, { w: 3.4, amp: 0.5 }, t0, 0.24); L.INK_(L.line(cx - r, cy, cx + r, cy), { w: 3, amp: 0.4, passes: 1 }, t0 + 0.1, 0.1);
  L.MST(L.ell(cx, cy, r * 0.82, r * 0.82, Math.PI * 1.05, Math.PI * 1.32, 20), { w: 12, col: L.GRYD }, t0 + 0.2, 0.15);
  for (let i = 0; i <= 8; i++) { const a = Math.PI + i * Math.PI / 8; L.INK_(L.line(cx + Math.cos(a) * r * 0.86, cy + Math.sin(a) * r * 0.86, cx + Math.cos(a) * r * 0.98, cy + Math.sin(a) * r * 0.98), { w: 2.4, amp: 0.1, passes: 1 }, t0 + 0.2 + i * 0.02, 0.02); }
  if (o.lo) L.TXT(o.lo, cx - r * 0.72, cy - 18, r * 0.16, { f: 'PH', align: 'center', col: L.INK2 }, t0 + 0.3, 0.3);
  if (o.hi) L.TXT(o.hi, cx + r * 0.72, cy - 18, r * 0.16, { f: 'PH', align: 'center', col: L.INK2 }, t0 + 0.35, 0.3);
  const needle = (vv, t, cover) => { const a = Math.PI + vv * Math.PI; if (cover) L.COVER(L.ell(cx, cy - r * 0.32, r * 0.74, r * 0.4, 0, L.TAU, 40).map(([px, py]) => [px, Math.min(py, cy - 6)]), t); L.INK_(L.line(cx, cy, cx + Math.cos(a) * r * 0.72, cy + Math.sin(a) * r * 0.72), { w: 5, amp: 0.2, passes: 1 }, t, 0.1); const hub = L.ell(cx, cy, 12, 12, 0, L.TAU, 14); L.FILL(hub, t); L.INK_(hub, { closed: true, w: 3, amp: 0.1, passes: 1 }, t, 0.04); };
  needle(v, t0 + 0.45, false);
  if (o.label) L.TXT(o.label, cx, cy + r * 0.3, r * 0.2, { f: 'KB', align: 'center' }, t0 + 0.5, 0.5);
  return { end: t0 + 0.6, needle: (vv, t) => needle(vv, t, true) };
}
function warnLight(L, cx, cy, r, t0) {
  const c = L.ell(cx, cy, r, r, 0, L.TAU, 28); L.FILL(c, t0); L.INK_(c, { closed: true, w: 3, amp: 0.4 }, t0, 0.1);
  L.MRK([c], { col: L.YEL, w: 14 }, t0 + 0.1, 0.1); L.sparks(cx, cy, r * 1.3, r * 1.8, [-2.4, -1.57, -0.7, 0, 3.14], t0 + 0.2, 0.15);
  return L.TXT('!', cx, cy + r * 0.45, r * 1.3, { f: 'KB', align: 'center' }, t0 + 0.12, 0.15);
}
function phone(L, cx, cy, s, t0, o = {}) {
  const b = L.rrect(cx - 70 * s, cy - 130 * s, 140 * s, 260 * s, 22 * s), sc = L.rrect(cx - 58 * s, cy - 104 * s, 116 * s, 196 * s, 8 * s);
  L.FILL(b, t0); L.MRK([b], { col: L.GRY2, w: 12 }, t0 + 0.08, 0.08); L.dropShadow(b, 8 * s, 9 * s, t0 + 0.16, 0.06); L.INK_(b, { closed: true, w: 3, amp: 0.4 }, t0, 0.14);
  L.FILL(sc, t0 + 0.12); L.INK_(sc, { closed: true, w: 2.2, amp: 0.2, passes: 1 }, t0 + 0.12, 0.08);
  return t0 + 0.24;
}
function fly(L, cx, cy, s, t0) {   // a doodle fly (the fly on the wall)
  for (const sd of [-1, 1]) { const wg = L.ell(cx + sd * 16 * s, cy - 14 * s, 18 * s, 10 * s, 0, L.TAU, 18, sd * 0.6); L.FILL(wg, t0); L.MRK([wg], { col: L.GRY, w: 8, edge: false }, t0 + 0.04, 0.04); L.INK_(wg, { closed: true, w: 2, amp: 0.2, passes: 1 }, t0, 0.05); }
  const bd = L.ell(cx, cy, 10 * s, 16 * s, 0, L.TAU, 18); L.FILL(bd, t0 + 0.05); L.MRK([bd], { col: L.INKM(0.85), w: 6, edge: false, op: 'source-over' }, t0 + 0.08, 0.04); L.INK_(bd, { closed: true, w: 2.2, amp: 0.1, passes: 1 }, t0 + 0.05, 0.04);
  for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) L.INK_(L.line(cx + sd * 8 * s, cy - 4 * s + i * 8 * s, cx + sd * 20 * s, cy + i * 10 * s), { w: 1.6, amp: 0.1, passes: 1 }, t0 + 0.1, 0.02);
  return t0 + 0.16;
}
function seat(L, x, y, s, t0, o = {}) {   // a cinema seat seen from behind/side (x = centre, y = floor)
  const back = L.rrect(x - 50 * s, y - 170 * s, 100 * s, 120 * s, 18 * s), base = L.rrect(x - 56 * s, y - 70 * s, 112 * s, 30 * s, 8 * s);
  L.FILL(back, t0); L.MRK([back], { col: L.GRY2, w: 12 }, t0 + 0.06, 0.06); L.INK_(back, { closed: true, w: 3, amp: 0.4 }, t0, 0.1);
  L.FILL(base, t0 + 0.06); L.INK_(base, { closed: true, w: 2.6, amp: 0.3, passes: 1 }, t0 + 0.06, 0.06);
  L.INK_(L.line(x - 40 * s, y - 40 * s, x - 40 * s, y), { w: 2.6, amp: 0.2, passes: 1 }, t0 + 0.1, 0.03); L.INK_(L.line(x + 40 * s, y - 40 * s, x + 40 * s, y), { w: 2.6, amp: 0.2, passes: 1 }, t0 + 0.1, 0.03);
  return t0 + 0.14;
}
function spiral(L, cx, cy, r, t0, d = 0.8, o = {}) {   // a tightening loop (the rumination track)
  const P = []; for (let i = 0; i <= 160; i++) { const u = i / 160, a = u * Math.PI * 2 * (o.turns || 3), rr = r * (1 - u * 0.75); P.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * (o.squash || 0.5)]); }
  return L.MST(P, { w: o.w || 7, col: o.col || L.GRYD, amp: 1 }, t0, d);
}
function cloud(L, cx, cy, w, h, t0, o = {}) {
  const P = []; const n = 9; for (let i = 0; i <= n * 8; i++) { const a = i / (n * 8) * L.TAU, bump = 1 + 0.12 * Math.abs(Math.sin(a * n / 2)); P.push([cx + Math.cos(a) * w / 2 * bump, cy + Math.sin(a) * h / 2 * bump]); }
  L.FILL(P, t0); if (o.tint) L.MRK([P], { col: o.tint, w: 16 }, t0 + 0.1, 0.1); L.INK_(P, { closed: true, w: 3, amp: 0.8 }, t0, 0.22);
  if (o.rain) for (let i = 0; i < 5; i++) L.INK_(L.line(cx - w * 0.3 + i * w * 0.15, cy + h * 0.6, cx - w * 0.33 + i * w * 0.15, cy + h * 0.6 + 40), { w: 2.6, amp: 0.2, passes: 1 }, t0 + 0.25 + i * 0.05, 0.05);
  return t0 + 0.3;
}
function card(L, x, y, w, h, t0, o = {}) { L.box(x, y, w, h, t0, 0.28, { r: 20, tint: o.tint || null }); let t = t0 + 0.3; (o.lines || []).forEach(([s, sz, f, col], i) => { t = L.TXT(s, x + w / 2, y + (o.ty || 0) + h * (i + 1) / ((o.lines.length) + 1) + sz * 0.34, sz, { f: f || 'KB', align: 'center', col: col || L.INK }, (o.lt ? o.lt[i] : t), null); }); return t; }
function notepad(L, x, y, w, h, t0, items, o = {}) {
  const p = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]; L.FILL(p, t0); L.dropShadow(p, 7, 8, t0 + 0.1, 0.06); L.INK_(p, { closed: true, w: 2.8, amp: 0.4 }, t0, 0.14);
  for (let i = 0; i < 5; i++) L.INK_(L.ell(x + 30 + i * (w - 60) / 4, y, 8, 12, 0, L.TAU, 12), { closed: true, w: 2, amp: 0.1, passes: 1 }, t0 + 0.1, 0.02);
  let t = t0 + 0.2; items.forEach((s, i) => { const yy = y + 80 + i * (o.lh || 64); const bx = L.rrect(x + 26, yy - 30, 30, 30, 4); L.INK_(bx, { closed: true, w: 2.4, amp: 0.2, passes: 1 }, (o.it ? o.it[i] : t), 0.05); t = L.TXT(s, x + 72, yy, o.size || 38, { f: 'PH' }, (o.it ? o.it[i] : t) + 0.05, null); });
  return t;
}
function storm(L, P, t0) {   // an angry scribble cloud above a person's head
  const [hx, hy, r] = P.head; cloud(L, hx, hy - r * 2.3, r * 2.6, r * 1.2, t0, { tint: L.GRY2 });
  L.INK_([[hx - r * 0.3, hy - r * 1.8], [hx - r * 0.05, hy - r * 1.45], [hx - r * 0.25, hy - r * 1.4], [hx + r * 0.05, hy - r * 1.05]], { w: 4, amp: 0.2, passes: 1, col: L.YELD }, t0 + 0.3, 0.1);
}
function thermo(L, x, y, h, v, t0, o = {}) {   // a doodle thermometer, filled to v (0..1) with yellow
  const tube = L.rrect(x - 22, y - h, 44, h, 22), bulb = L.ell(x, y + 20, 38, 38, 0, L.TAU, 30);
  L.FILL(tube, t0); L.FILL(bulb, t0); L.INK_(tube, { closed: true, w: 3, amp: 0.3 }, t0, 0.14); L.INK_(bulb, { closed: true, w: 3, amp: 0.3 }, t0 + 0.05, 0.1);
  const fill = [[x - 12, y], [x - 12, y - h * v], [x + 12, y - h * v], [x + 12, y]];
  L.addEl(t0 + 0.3, 0.7, 'marker', p => { const e = L.eo(p), top = y - h * v * e; const c = L.G.ctx; c.save(); c.beginPath(); c.rect(x - 30, top, 60, h * v + 80); c.clip(); L.markerDraw([fill, L.ell(x, y + 20, 28, 28, 0, L.TAU, 24)], { col: L.YELD, w: 16, ang: -0.3 }, 1); c.restore(); }, [x - 40, y - h - 10, x + 40, y + 70]);
  for (let i = 1; i < 5; i++) L.INK_(L.line(x + 22, y - h * i / 5, x + 36, y - h * i / 5), { w: 2, amp: 0.1, passes: 1 }, t0 + 0.2, 0.02);
  if (o.label) L.TXT(o.label, x, y + 110, o.ls || 40, { f: 'KB', align: 'center' }, t0 + 0.4, null);
  return t0 + 1.0;
}
function house(L, cx, y, s, t0) { const b = [[cx - 60 * s, y], [cx - 60 * s, y - 80 * s], [cx, y - 130 * s], [cx + 60 * s, y - 80 * s], [cx + 60 * s, y]]; L.FILL(b, t0); L.MRK([b], { col: L.GRY, w: 10 }, t0 + 0.06, 0.06); L.INK_(b, { closed: true, w: 3, amp: 0.4 }, t0, 0.14); L.INK_(L.rrect(cx - 14 * s, y - 44 * s, 28 * s, 44 * s, 3), { closed: true, w: 2.4, amp: 0.1, passes: 1 }, t0 + 0.12, 0.04); return t0 + 0.2; }
function note(L, cx, cy, s, t0) { L.INK_(L.line(cx, cy, cx, cy - 60 * s), { w: 3, amp: 0.2, passes: 1 }, t0, 0.05); L.INK_(L.quad([cx, cy - 60 * s], [cx + 20 * s, cy - 50 * s], [cx + 26 * s, cy - 30 * s]), { w: 3, amp: 0.2, passes: 1 }, t0 + 0.05, 0.04); const h = L.ell(cx - 10 * s, cy, 12 * s, 9 * s, 0, L.TAU, 14, -0.4); L.FILL(h, t0); L.MRK([h], { col: L.INKM(0.9), w: 6, edge: false, op: 'source-over' }, t0 + 0.02, 0.03); return t0 + 0.12; }
function puzzle(L, cx, cy, s, t0, o = {}) {   // a jigsaw piece (problem solving)
  const P = []; const a = 40 * s;
  const side = (x0, y0, dx, dy, nx, ny, out) => { for (let i = 0; i <= 20; i++) { const u = i / 20; let bx = x0 + dx * u, by = y0 + dy * u; const bump = Math.abs(u - 0.5) < 0.2 ? Math.cos((u - 0.5) / 0.2 * Math.PI / 2) * 18 * s * out : 0; P.push([bx + nx * bump, by + ny * bump]); } };
  side(cx - a, cy - a, 2 * a, 0, 0, -1, 1); side(cx + a, cy - a, 0, 2 * a, 1, 0, 1); side(cx + a, cy + a, -2 * a, 0, 0, 1, -1); side(cx - a, cy + a, 0, -2 * a, -1, 0, -1);
  L.FILL(P, t0); L.MRK([P], { col: o.col || L.GRY2, w: 14 }, t0 + 0.08, 0.08); L.INK_(P, { closed: true, w: 3, amp: 0.4 }, t0, 0.16);
  return t0 + 0.2;
}

// ---------- the long film ----------
const LONG = {};
const def = (F, id, block, o, draw) => { F[id] = { block, ...o, draw }; };

// ===== cold open: the bed at 2 a.m. =====
def(LONG, 'hook1', blk(0, 1), { purpose: 'hook: the feeling, shown before it is explained (the replay starts)', shot: 'opens close on the face on the pillow (eyes closing), pulls up to reveal the ceiling screen as the memory plays (reveal)', sfx: 'room tone; a clock tick; a soft projector click on "play"; pen', noAutoCam: true }, (S, L) => {
  const B = blk(0, 1), [x, y] = B, c = S.fit(B);
  S.cam(S.t0 - 0.01, x + 330, y + 640, 2.3, 0.01); S.cam(S.at('play') - 0.6, x + 560, y + 560, 1.5, 1.4, 'io'); S.cam(S.at('party') - 0.3, c.x, c.y, c.z * 1.02, 1.6, 'io');
  const P = bed(L, x + 200, y + 860, 760, S.t0, { kind: 'side', you: true, k: 1.2 });
  L.clock(x + 1420, y + 720, 70, S.t0 + 0.6); L.TXT('2:00', x + 1420, y + 840, 46, { f: 'KB', align: 'center' }, S.t0 + 0.9, 0.4);
  L.TXT('z', x + 400, y + 560, 44, { f: 'PH', col: L.INK2 }, S.at('asleep') - 0.2, 0.2);
  L.react(P, S.at('play') - 0.1, { kind: 'shock', look: [0.5, -1] });
  memScreen(L, x + 560, y + 70, 700, 380, S.at('play'), { from: [P.head[0] + 30, P.head[1] - 40] });
  partyMemory(L, x + 800, y + 410, 0.95, S.at('party') - 0.2, { text: 'ha... wait', react: S.at('word') });
  L.TXT('6 YEARS AGO', x + 1150, y + 120, 34, { f: 'KB', align: 'center' }, S.at('years') - 0.2, 0.4);
  L.react(P, S.at('wince') - 0.15, { kind: 'worry', look: [0.3, -1], sweat: true });
  L.motion(P.head[0] - 70, P.head[1] - 30, -50, 3, S.at('wince'));
});
def(LONG, 'hook2', blk(0, 2), { purpose: 'the paradox: forgets the keys, keeps a perfect copy of this', shot: 'pan right; the lost keys on the left, the film strip on the right (contrast read left to right), push as it loops', sfx: 'key jingle; film strip clatter; loop whoosh' }, (S, L) => {
  const [x, y] = blk(0, 2);
  keys(L, x + 230, y + 330, 1.6, S.at('keys') - 0.3); L.qmark(x + 420, y + 330, 150, S.at('keys') + 0.2);
  L.TXT('where are my keys?', x + 300, y + 520, 46, { f: 'PH', align: 'center', col: L.INK2 }, S.at('morning') - 0.6, 0.8);
  L.INK_(L.line(x + 640, y + 120, x + 640, y + 780), { w: 2.4, amp: 1, passes: 1, dash: [12, 10], alpha: 0.6 }, S.at('but') - 0.2, 0.3);
  filmStrip(L, x + 720, y + 230, 4, 190, 140, S.at('perfect') - 0.3, { frame: (fx, fy, i, t) => { L.person(fx - 20, fy + 60, 0.42, t, { pose: i === 3 ? 'hide' : 'wave', you: true, kind: i === 3 ? 'worry' : 'grin', k: 0.3 }); L.person(fx + 40, fy + 60, 0.42, t + 0.05, { kind: i >= 2 ? 'shock' : 'neutral', look: [-1, 0], hair: 'long', k: 0.3 }); } });
  L.TXT('perfect copy', x + 1100, y + 520, 56, { f: 'KB', align: 'center' }, S.at('copy') - 0.2, 0.5);
  L.inkArrow(L.ell(x + 1100, y + 310, 430, 230, Math.PI * 0.15, Math.PI * 0.85, 30), { w: 4 }, S.at('again') - 0.3, 0.5);
  L.inkArrow(L.ell(x + 1100, y + 310, 430, 230, Math.PI * 1.15, Math.PI * 1.85, 30), { w: 4 }, S.at('again', 2) - 0.2, 0.5);
  L.TXT('again... and again', x + 1100, y + 640, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('again', 2) - 0.1, 0.8);
});
def(LONG, 'hook3', blk(0, 3), { purpose: 'the counterintuitive claim: replaying feels like working it out but makes mood and problem solving worse', shot: 'pan right; the gear turns into a spiral; push on the two down arrows (the twist)', sfx: 'gear tick, then a descending pluck on each arrow' }, (S, L) => {
  const [x, y] = blk(0, 3);
  L.head(x + 330, y + 420, 120, S.t0 + 0.1, { you: true, kind: 'think', look: [1, -0.6], k: 0.8 });
  L.bubble(x + 460, y + 110, 330, 120, S.at('working') - 0.4, { thought: true, tail: [x + 400, y + 300], text: 'figuring it out', size: 36 });
  spiral(L, x + 330, y + 720, 190, S.at('experiments') - 0.3, 0.9);
  L.TXT('turning it over...', x + 330, y + 850, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('turning') - 0.1, 0.8);
  const rows = [['mood', 'worse', 'worse'], ['problem solving', 'solving', 'too']];
  rows.forEach(([lab, cue], i) => { const yy = y + 380 + i * 250, t = S.at(cue) - 0.4; L.TXT(lab, x + 1020, yy, 54, { f: 'KB', align: 'center' }, t, 0.5); L.inkArrow([[x + 1300, yy - 70], [x + 1300, yy + 40]], { w: 5 }, t + 0.4, 0.25); L.MST(L.line(x + 1260, yy + 50, x + 1340, yy + 50), { w: 8, col: L.YELD }, t + 0.6, 0.15); });
  L.TXT('in experiments', x + 1100, y + 200, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('experiments') - 0.1, 0.6);
});
def(LONG, 'hook4', blk(0, 4), { purpose: 'the promise: same memory, a way of thinking that cools it; the key is where you stand', shot: 'pan right; the two seats read front → back; push slightly to the back seat on "where you stand"', sfx: 'seat creak; a cool chime on the back seat' }, (S, L) => {
  const [x, y] = blk(0, 4);
  memScreen(L, x + 80, y + 120, 420, 260, S.at('memory') - 0.4, { rec: false });
  partyMemory(L, x + 220, y + 350, 0.55, S.at('memory') - 0.1, { react: false, text: '...' });
  L.TXT('same memory', x + 290, y + 450, 42, { f: 'PH', align: 'center', col: L.INK2 }, S.at('same') - 0.2, 0.6);
  thermo(L, x + 660, y + 720, 300, 0.85, S.at('heat') - 0.5, { label: 'hot' });
  L.inkArrow([[x + 760, y + 560], [x + 900, y + 560]], { w: 4 }, S.at('thinking') - 0.3, 0.2);
  L.TXT('not less thinking', x + 1180, y + 160, 50, { f: 'KB', align: 'center' }, S.at('less') - 0.3, 0.6);
  seat(L, x + 1020, y + 860, 1.1, S.at('stand') - 0.6); seat(L, x + 1360, y + 860, 1.1, S.at('stand') - 0.45);
  L.head(x + 1360, y + 640, 48, S.at('stand') - 0.3, { you: true, kind: 'content', look: [-1, -0.3], k: 0.6 });
  L.TXT('front row', x + 1020, y + 360, 38, { f: 'PH', align: 'center', col: L.INK2 }, S.at('stand') - 0.1, 0.4); L.TXT('a few steps back', x + 1360, y + 360, 38, { f: 'PH', align: 'center', col: L.INK2 }, S.at('stand') + 0.2, 0.5);
  L.TXT('where you stand', x + 1190, y + 280, 56, { f: 'KB', align: 'center' }, S.at('where') - 0.2, 0.6); L.swash(x + 1000, y + 300, x + 1380, S.at('think', 2), 0.3);
});
def(LONG, 'sting', blk(0, 5, 1300, 600), { purpose: 'channel sting (≤ 2 s, after the hook)', shot: 'whip right across empty dots to the banner', sfx: 'paper whoosh + one kalimba note', ease: 'q', move: 0.6 }, (S, L) => {
  const [x, y] = blk(0, 5, 1300, 600);
  L.ribbon(x + 650, y + 280, 860, 120, 'THE OVERTHINKING PAD', 64, S.t0 + 0.2, { d: 0.35, td: 0.9 });
  L.MST(L.bez([x + 520, y + 420], [x + 600, y + 520], [x + 740, y + 380], [x + 800, y + 470]), { w: 4, col: L.INK, amp: 1 }, S.t0 + 1.2, 0.4);
});

const chapter = (F, id, row, n, title) => def(F, id, banner(row), { purpose: `chapter ${n} title`, shot: 'whip across the page to the numbered banner (a jump in thought)', sfx: 'paper whoosh, kalimba note', ease: 'q', move: 0.75 }, (S, L) => {
  const [x, y] = banner(row);
  numDot(L, x + 180, y + 280, n, S.t0 + 0.25, 64);
  L.ribbon(x + 760, y + 280, Math.max(560, title.length * 44), 120, title, 70, S.t0 + 0.45, { d: 0.3, td: 0.9 });
});

// ===== chapter 1: the replay button =====
chapter(LONG, 'ch1', 1, 1, 'THE REPLAY BUTTON');
def(LONG, 'c1a', blk(1, 1), { purpose: 'name it: involuntary memories pop up without a search', shot: 'pan right from the banner; push on the bubble popping out of the head', sfx: 'a soft "pop" on "pop"; pen' }, (S, L) => {
  const [x, y] = blk(1, 1);
  const P = L.person(x + 400, y + 840, 1.7, S.t0 + 0.1, { pose: 'hold', kind: 'neutral', look: [1, -0.5], hair: 'tuft', you: true, k: 0.9 });
  L.cup(P.hand[1][0] + 6, P.hand[1][1] - 26, 0.9, S.t0 + 0.6);
  L.TXT('involuntary memories', x + 1060, y + 160, 64, { f: 'KB', align: 'center' }, S.at('involuntary') - 0.3, 0.9);
  L.bubble(x + 600, y + 260, 360, 200, S.at('pop') - 0.2, { thought: true, tail: [P.head[0] + 50, P.head[1] - 50] });
  partyMemory(L, x + 720, y + 430, 0.45, S.at('pop'), { react: false, text: '!' });
  L.react(P, S.at('pop') + 0.3, { kind: 'shock', look: [1, -0.8] });
  const mx = x + 1240, my = y + 560; L.INK_(L.ell(mx, my, 60, 60, 0, L.TAU, 30), { closed: true, w: 4, amp: 0.4 }, S.at('looking') - 0.4, 0.15); L.INK_(L.line(mx + 42, my + 42, mx + 110, my + 110), { w: 7, amp: 0.2, passes: 1 }, S.at('looking') - 0.25, 0.1);
  L.cross(mx, my, 2.4, S.at('looking') + 0.1);
  L.TXT('no searching', x + 1260, y + 760, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('looking') + 0.2, 0.6);
});
def(LONG, 'c1b', blk(1, 2), { purpose: 'who studied them: Berntsen, diaries; common (a few times a week)', shot: 'pan right; close on the diary as entries are written, then the week strip', sfx: 'page turn; tally strokes' }, (S, L) => {
  const [x, y] = blk(1, 2);
  tag(L, x + 330, y + 110, 'DENMARK · 1990s', 54, S.at('nineteen') - 0.2);
  L.head(x + 330, y + 300, 80, S.at('dorthe') - 0.4, { hair: 'long', kind: 'think', look: [0.6, 0.4], k: 0.7 });
  L.TXT('Dorthe Berntsen', x + 330, y + 440, 46, { f: 'KB', align: 'center' }, S.at('berntsen') - 0.2, 0.6);
  const dx = x + 220, dy = y + 520, dp = [[dx, dy], [dx + 240, dy - 10], [dx + 250, dy + 300], [dx + 10, dy + 310]];
  L.FILL(dp, S.at('diaries') - 0.4); L.dropShadow(dp, 8, 9, S.at('diaries') - 0.2); L.INK_(dp, { closed: true, w: 3, amp: 0.5 }, S.at('diaries') - 0.4, 0.2);
  L.TXT('memory diary', dx + 125, dy + 60, 32, { f: 'KB', align: 'center' }, S.at('diaries') - 0.1, 0.4);
  for (let i = 0; i < 4; i++) L.INK_(L.line(dx + 30, dy + 110 + i * 46, dx + 210 - (i % 2) * 40, dy + 112 + i * 46), { w: 2, amp: 0.6, passes: 1, alpha: 0.7 }, S.at('diaries') + 0.2 + i * 0.08, 0.1);
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'], hit = [0, 2, 3, 5];
  days.forEach((d, i) => { const cx = x + 700 + i * 120, t = S.at('surveyed') + i * 0.08; L.box(cx - 46, y + 380, 92, 110, t, 0.15, { r: 10, shadow: false }); L.TXT(d, cx, y + 420, 32, { f: 'KB', align: 'center' }, t + 0.1, 0.1); if (hit.includes(i)) L.MRK([L.ell(cx, y + 455, 22, 22, 0, L.TAU, 18)], { col: L.YEL, w: 12, edge: false }, S.at('few') + hit.indexOf(i) * 0.15, 0.1); });
  L.TXT('most students: a few times a week', x + 1060, y + 640, 48, { f: 'KB', align: 'center' }, S.at('week') - 0.9, 1.0);
  L.underline(x + 860, y + 665, x + 1260, S.at('week'), 0.3);
});
def(LONG, 'c1c', blk(1, 3), { purpose: 'not random: cues set them off (place, object, phrase, body, mood)', shot: 'pan right; the cues ring the memory frame and arrows fire inward one by one', sfx: 'a light tap per cue' }, (S, L) => {
  const [x, y] = blk(1, 3);
  const mx = x + 800, my = y + 470;
  memScreen(L, mx - 200, my - 130, 400, 260, S.at('random') - 0.3, { rec: false });
  partyMemory(L, mx - 60, my + 100, 0.5, S.at('random'), { react: false, text: '...' });
  L.TXT('not random', mx, my - 180, 48, { f: 'KB', align: 'center' }, S.at('random') - 0.1, 0.5);
  const cues = [['place', 'place', (cx, cy, t) => house(L, cx, cy + 60, 0.9, t), -560, -220], ['object', 'object', (cx, cy, t) => L.cup(cx, cy, 1.4, t), 560, -220], ['phrase', 'phrase', (cx, cy, t) => L.bubble(cx - 70, cy - 40, 140, 80, t, { text: '"..."', size: 34, shadow: false }), -560, 220], ['the body', 'body', (cx, cy, t) => L.person(cx, cy + 80, 0.6, t, { kind: 'worry', k: 0.4 }), 560, 220], ['a mood', 'mood', (cx, cy, t) => cloud(L, cx, cy, 160, 90, t, { tint: L.GRY2, rain: true }), 0, 340]];
  cues.forEach(([lab, w, fn, dx, dy]) => { const t = S.at(w) - 0.3, cx = mx + dx, cy = my + dy; fn(cx, cy, t); L.TXT(lab, cx, cy + (dy === 340 ? 0 : 130) + (dy === 340 ? 0 : 0), 38, { f: 'PH', align: 'center', col: L.INK2 }, t + 0.2, 0.4); if (dy !== 340) L.inkArrow([[cx - Math.sign(dx) * 100, cy], [mx + Math.sign(dx) * 230, my + Math.sign(dy) * 60]], { w: 3.4 }, t + 0.3, 0.2); });
});
def(LONG, 'c1d', blk(1, 4), { purpose: 'the 2 a.m. trigger can be tiny: a song, the quiet, a flash of today', shot: 'pan right; medium on the bed again (continuity), push toward the head as the triggers arrive', sfx: 'three soft cues: a hummed note, silence, a tiny sting' }, (S, L) => {
  const [x, y] = blk(1, 4);
  const P = bed(L, x + 180, y + 830, 700, S.t0 + 0.05, { kind: 'neutral', you: true, look: [0.5, -1], k: 0.8 });
  L.TXT('2 A.M.', x + 1300, y + 160, 70, { f: 'KB', align: 'center' }, S.at('am') - 0.3, 0.4);
  note(L, x + 470, y + 430, 1.3, S.at('song') - 0.2); note(L, x + 540, y + 380, 1.1, S.at('song'));
  L.TXT('a song', x + 520, y + 300, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('song'), 0.4);
  L.TXT('. . .', x + 840, y + 400, 60, { f: 'KB', align: 'center' }, S.at('quiet') - 0.2, 0.4); L.TXT('the quiet', x + 840, y + 300, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('quiet'), 0.4);
  L.box(x + 1060, y + 290, 380, 220, S.at('flash') - 0.3, 0.25, { r: 16, tint: 'rgba(255,205,40,0.25)' });
  L.TXT('earlier today', x + 1250, y + 360, 40, { f: 'KB', align: 'center' }, S.at('flash'), 0.4);
  L.person(x + 1200, y + 490, 0.5, S.at('embarrassment') - 0.3, { pose: 'hide', you: true, kind: 'worry', k: 0.4 }); L.person(x + 1310, y + 490, 0.5, S.at('embarrassment') - 0.2, { kind: 'smile', look: [-1, 0], hair: 'bun', k: 0.4 });
  L.react(P, S.at('embarrassment'), { kind: 'worry', look: [1, -1] });
});
def(LONG, 'c1e', blk(1, 5), { purpose: 'why that memory: emotional moments are stored more strongly', shot: 'pan right; two memory cards side by side; push on the bold one as it locks', sfx: 'a padlock click on "lock"' }, (S, L) => {
  const [x, y] = blk(1, 5);
  L.TXT('why that memory?', x + 800, y + 120, 64, { f: 'KB', align: 'center' }, S.at('why') - 0.3, 0.6);
  for (let i = 0; i < 5; i++) { const cx = x + 180 + i * 110, cy = y + 320 + (i % 2) * 40, t = S.at('hundred') + i * 0.08; L.box(cx - 46, cy - 36, 92, 72, t, 0.12, { r: 8, shadow: false }); L.face(cx, cy, 24, t + 0.1, { kind: 'smile', k: 0.3 }); }
  L.TXT('a hundred nice moments', x + 400, y + 450, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('nice') - 0.1, 0.6);
  L.box(x + 280, y + 560, 260, 180, S.at('neutral') - 0.3, 0.2, { r: 12, shadow: false });
  L.TXT('neutral', x + 410, y + 665, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('neutral'), 0.4);
  L.box(x + 850, y + 260, 560, 400, S.at('emotional') - 0.3, 0.3, { r: 18, tint: 'rgba(255,205,40,0.3)' });
  partyMemory(L, x + 1050, y + 560, 0.7, S.at('emotional'), { text: 'ha... wait' });
  L.TXT('stored more strongly', x + 1130, y + 740, 48, { f: 'KB', align: 'center' }, S.at('strongly') - 0.3, 0.7);
  const lx = x + 1410, ly = y + 300, lk = L.rrect(lx - 40, ly, 80, 66, 8); L.FILL(lk, S.at('lock') - 0.3); L.MRK([lk], { col: L.YEL, w: 12 }, S.at('lock') - 0.2, 0.06); L.INK_(lk, { closed: true, w: 3, amp: 0.3 }, S.at('lock') - 0.3, 0.1); L.INK_(L.ell(lx, ly, 26, 34, Math.PI, L.TAU, 16), { w: 4, amp: 0.2, passes: 1 }, S.at('lock') - 0.1, 0.1);
  L.TXT('arousal', x + 1260, y + 840, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('arousal') - 0.1, 0.5);
});
def(LONG, 'c1f', blk(1, 6), { purpose: 'embarrassment is special: Leary\'s sociometer', shot: 'pan right; medium on the gauge being drawn, push into the needle', sfx: 'a needle tick; pen' }, (S, L) => {
  const [x, y] = blk(1, 6);
  tag(L, x + 280, y + 110, 'MARK LEARY · 1995', 50, S.at('leary') - 0.3);
  L.TXT('self-esteem works like a gauge', x + 800, y + 230, 54, { f: 'KB', align: 'center' }, S.at('works') - 0.4, 0.9);
  const G = gauge(L, x + 800, y + 680, 330, S.at('gauge') - 0.3, { v: 0.7, lo: 'left out', hi: 'accepted', label: 'SOCIOMETER' });
  L.MST(L.line(x + 640, y + 760, x + 960, y + 760), { w: 9, col: L.YELD }, S.at('sociometer') + 0.5, 0.2);
  L.TXT('how accepted am I?', x + 800, y + 860, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('accepted') - 0.3, 0.7);
});
def(LONG, 'c1g', blk(1, 7), { purpose: 'the experiment: left out for personal reasons vs at random; the gauge reacts to rejection', shot: 'pan right; two panels side by side, each with its own small gauge (compare)', sfx: 'needle drops with a low pluck on the left; stays on the right' }, (S, L) => {
  const [x, y] = blk(1, 7);
  const panel = (px, lab, cue, why, drop) => {
    const t = S.at(cue) - 0.4; L.box(px, y + 120, 680, 700, t, 0.3, { r: 20 });
    L.TXT(lab, px + 340, y + 200, 46, { f: 'KB', align: 'center' }, t + 0.2, 0.6);
    [[px + 150, 'bun'], [px + 250, 'curly'], [px + 350, 'cap']].forEach(([gx, hair], i) => L.person(gx, y + 560, 0.75, t + 0.3 + i * 0.1, { kind: 'neutral', look: [-1, 0], hair, k: 0.3 }));
    const Y = L.person(px + 560, y + 560, 0.75, t + 0.5, { you: true, kind: 'neutral', look: [-1, 0], k: 0.3 });
    L.TXT(why, px + 340, y + 640, 34, { f: 'PH', align: 'center', col: L.INK2 }, t + 0.6, 0.5);
    const G = gauge(L, px + 340, y + 780, 110, t + 0.7, { v: 0.72 });
    if (drop) { G.needle(0.18, S.at('lowered') - 0.1); L.react(Y, S.at('lowered'), { kind: 'sad', look: [-1, 0.4] }); } else L.check(px + 500, y + 730, 2, S.at("didn't"));
  };
  panel(x + 40, 'left out: "it\'s you"', 'personal', 'personal reasons', true);
  panel(x + 880, 'left out: at random', 'random', 'a coin flip', false);
  L.TXT('it reacts to rejection', x + 800, y + 80, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('rejected') - 0.5, 0.7);
});
def(LONG, 'c1h', blk(1, 8), { purpose: 'so an awkward moment reads as a warning light: am I still in?', shot: 'pan right; the gauge and warning light, then the two questions arrive as thought bubbles', sfx: 'a soft alarm blink (two beeps)' }, (S, L) => {
  const [x, y] = blk(1, 8);
  L.TXT('in that view...', x + 220, y + 120, 44, { f: 'PH', col: L.INK2 }, S.at('view') - 0.3, 0.6);
  const G = gauge(L, x + 480, y + 620, 260, S.t0 + 0.3, { v: 0.65, lo: 'out', hi: 'in' });
  G.needle(0.3, S.at('warning') - 0.3);
  warnLight(L, x + 480, y + 250, 60, S.at('warning'));
  L.TXT('warning light', x + 480, y + 400, 40, { f: 'KB', align: 'center' }, S.at('light') - 0.1, 0.4);
  const P = L.person(x + 1200, y + 840, 1.4, S.at('like') - 0.8, { pose: 'hold', you: true, kind: 'worry', look: [-0.5, -0.8], k: 0.6 });
  L.bubble(x + 850, y + 140, 420, 110, S.at('like') - 0.3, { thought: true, tail: [P.head[0] - 30, P.head[1] - 50], text: 'did they like me less?', size: 36 });
  L.bubble(x + 1080, y + 300, 330, 100, S.at('still') - 0.3, { thought: true, tail: [P.head[0] + 10, P.head[1] - 50], text: 'am I still in?', size: 38 });
  L.TXT('a social species', x + 1150, y + 500, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('species') - 0.3, 0.6);
});
def(LONG, 'c1i', blk(1, 9), { purpose: 'bridge: why it is kept vs why at that hour (open question into chapter 2)', shot: 'pan right; push in on the clock and the question mark', sfx: 'clock tick, then a page tap' }, (S, L) => {
  const [x, y] = blk(1, 9);
  L.box(x + 160, y + 300, 380, 260, S.t0 + 0.1, 0.25, { r: 18 }); L.TXT('kept', x + 350, y + 450, 70, { f: 'KB', align: 'center' }, S.at('kept') - 0.2, 0.4); L.check(x + 480, y + 400, 2.2, S.at('kept') + 0.3);
  L.clock(x + 1050, y + 440, 170, S.at('hour') - 0.8); L.TXT('2:00', x + 1050, y + 700, 60, { f: 'KB', align: 'center' }, S.at('worst') - 0.2, 0.4);
  L.qmark(x + 1300, y + 420, 200, S.at('hour') - 0.1);
  L.TXT('but why now?', x + 1050, y + 820, 46, { f: 'PH', align: 'center', col: L.INK2 }, S.at('shows') - 0.2, 0.6);
});

// ===== chapter 2: why 2 a.m. =====
chapter(LONG, 'ch2', 2, 2, 'WHY 2 A.M.');
def(LONG, 'c2a', blk(2, 1), { purpose: 'day vs night: a busy mind vs an empty one', shot: 'pan right; the day half, then a slow push into the empty night half', sfx: 'busy pings, then silence' }, (S, L) => {
  const [x, y] = blk(2, 1);
  L.TXT('DAY', x + 380, y + 110, 60, { f: 'KB', align: 'center' }, S.at('day') - 0.2, 0.3);
  const P = L.person(x + 380, y + 800, 1.3, S.at('day'), { pose: 'hold', you: true, kind: 'think', look: [0.5, -0.4], k: 0.6 });
  phone(L, P.hand[1][0] + 6, P.hand[1][1] - 60, 0.45, S.at('messages') - 0.3);
  [['messages', -230, 260], ['traffic', 220, 240], ['conversations', -240, 420], ['next thing', 230, 400]].forEach(([w, dx, dy], i) => L.bubble(x + 380 + dx - 110, y + dy - 50, 220, 80, S.at(w.split(' ')[0]) - 0.2, { text: w, size: 28, shadow: false }));
  L.INK_(L.line(x + 800, y + 100, x + 800, y + 840), { w: 2.4, amp: 1, passes: 1, dash: [12, 10], alpha: 0.6 }, S.at('now') - 0.2, 0.3);
  L.TXT('2 A.M.', x + 1200, y + 110, 60, { f: 'KB', align: 'center' }, S.at('am') - 0.2, 0.3);
  bed(L, x + 900, y + 830, 560, S.at('nothing') - 0.4, { s: 0.85, kind: 'neutral', look: [0, -1], you: true, k: 0.6 });
  L.TXT('no task', x + 1200, y + 300, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('task') - 0.2, 0.4); L.TXT('nobody to talk to', x + 1200, y + 360, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('nobody') - 0.1, 0.5);
  L.INK_(L.line(x + 880, y + 220, x + 1520, y + 220), { w: 3, amp: 0.6 }, S.at('ceiling') - 0.3, 0.3); L.TXT('the ceiling', x + 1200, y + 200, 34, { f: 'PH', align: 'center', col: L.INK2 }, S.at('ceiling'), 0.4);
});
def(LONG, 'c2b', blk(2, 2), { purpose: 'the 2010 app study: random pings, three questions', shot: 'pan right; medium on the phone in a hand (contact), the three questions written on its screen', sfx: 'a phone ping per question' }, (S, L) => {
  const [x, y] = blk(2, 2);
  tag(L, x + 300, y + 110, 'HARVARD · 2010', 54, S.at('harvard') - 0.3);
  L.TXT('Killingsworth & Gilbert', x + 300, y + 210, 42, { f: 'PH', align: 'center', col: L.INK2 }, S.at('killingsworth') - 0.2, 0.8);
  const P = L.person(x + 330, y + 860, 1.6, S.at('app') - 0.6, { pose: 'hold', kind: 'neutral', look: [0.6, 0.4], hair: 'curly', k: 0.6 });
  phone(L, P.hand[1][0] + 8, P.hand[1][1] - 70, 0.6, S.at('app') - 0.2);
  L.TXT('PING', P.hand[1][0] + 80, P.hand[1][1] - 180, 40, { f: 'KB' }, S.at('pinged') - 0.1, 0.3); L.sparks(P.hand[1][0] + 8, P.hand[1][1] - 150, 70, 100, [-2.2, -1.5, -0.9], S.at('pinged'), 0.12);
  for (let i = 0; i < 12; i++) L.head(x + 640 + (i % 6) * 70, y + 330 + Math.floor(i / 6) * 80, 24, S.at('thousands') + i * 0.04, { k: 0.2, hair: ['tuft', 'bun', 'cap', 'long', 'curly', 'messy'][i % 6] });
  L.TXT('thousands of people', x + 815, y + 510, 36, { f: 'PH', align: 'center', col: L.INK2 }, S.at('thousands') + 0.3, 0.5);
  const Q = [['1. How do you feel?', 'feel'], ['2. What are you doing?', 'doing'], ['3. Thinking about something else?', 'something']];
  L.box(x + 1100, y + 280, 480, 430, S.at('three') - 0.3, 0.3, { r: 20 });
  Q.forEach(([q, w], i) => L.TXT(q, x + 1340, y + 380 + i * 120, i === 2 ? 30 : 36, { f: 'KB', align: 'center' }, S.at(w) - 0.3, 0.7));
});
def(LONG, 'c2c', blk(2, 3), { purpose: 'result: minds wandered in ~47% of samples; wandering ≠ happier', shot: 'pan right; push on the pie as it fills to just under half, then the three faces', sfx: 'marker swish around the pie; three soft taps' }, (S, L) => {
  const [x, y] = blk(2, 3);
  const cx = x + 400, cy = y + 450, r = 250, pie = L.ell(cx, cy, r, r, 0, L.TAU, 70);
  L.FILL(pie, S.t0 + 0.1); L.INK_(pie, { closed: true, w: 3.4, amp: 0.6 }, S.t0 + 0.1, 0.3);
  const wedge = [[cx, cy]].concat(L.ell(cx, cy, r - 6, r - 6, -Math.PI / 2, -Math.PI / 2 + L.TAU * 0.469, 60));
  L.MRK([wedge], { col: L.YEL, w: 22 }, S.at('half') - 0.2, 0.6); L.INK_([[cx, cy - r], [cx, cy], wedge[wedge.length - 1]], { w: 3, amp: 0.3, passes: 1 }, S.at('half') + 0.3, 0.15);
  L.TXT('47%', cx + 120, cy + 30, 90, { f: 'KB', align: 'center' }, S.at('forty') - 0.1, 0.4);
  L.TXT('mind elsewhere', cx, cy + r + 80, 44, { f: 'KB', align: 'center' }, S.at('wandered') - 0.2, 0.6);
  const F = [['pleasant thought', 'pleasant', 'neutral', 'no happier'], ['neutral thought', 'neutral', 'bored', 'unhappier'], ['unpleasant thought', 'unpleasant', 'sad', 'unhappier']];
  F.forEach(([lab, w, kind, res], i) => { const yy = y + 230 + i * 220, t = S.at(w) - 0.3; L.head(x + 900, yy, 60, t, { kind, look: [0, 0], k: 0.5 }); L.TXT(lab, x + 1000, yy - 10, 40, { f: 'PH', col: L.INK2 }, t + 0.2, 0.5); L.TXT(res, x + 1000, yy + 50, 44, { f: 'KB' }, t + 0.5, 0.4); });
  L.MST(L.line(x + 1000, y + 510, x + 1260, y + 510), { w: 8, col: L.YELD }, S.at('unpleasant') + 0.5, 0.2);
});
def(LONG, 'c2d', blk(2, 4), { purpose: 'at night there is nothing to wander away from; the mind drifts somewhere not nice', shot: 'pan right; follow the dotted thought path from the pillow up and across to the grey cloud (tracking)', sfx: 'a slow descending glide' }, (S, L) => {
  const [x, y] = blk(2, 4);
  const P = bed(L, x + 120, y + 840, 600, S.t0 + 0.05, { s: 0.9, kind: 'neutral', look: [1, -1], you: true, k: 0.6 });
  const path = L.bez([P.head[0] + 40, P.head[1] - 60], [x + 500, y + 200], [x + 900, y + 600], [x + 1180, y + 300], 50);
  L.INK_(path, { w: 3, amp: 0.6, passes: 1, dash: [10, 12] }, S.at('wander') - 0.2, 1.2);
  L.TXT('nothing to wander away from', x + 800, y + 120, 48, { f: 'KB', align: 'center' }, S.at('nothing') - 0.2, 0.9);
  L.TXT('completely free...', x + 640, y + 470, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('free') - 0.3, 0.6);
  cloud(L, x + 1290, y + 290, 360, 200, S.at('nice') - 0.9, { tint: L.GRY2, rain: true });
  memScreen(L, x + 1190, y + 230, 200, 120, S.at('nice') - 0.4, { rec: false });
  L.react(P, S.at('nice'), { kind: 'worry', look: [1, -1] });
});
def(LONG, 'c2e', blk(2, 5), { purpose: 'Harvey\'s insomnia model: bedtime worry/rumination keeps the mind switched on', shot: 'pan right; medium on the bed with a switched-on bulb above the head; push as the clock hands advance', sfx: 'bulb click; clock ticks' }, (S, L) => {
  const [x, y] = blk(2, 5);
  tag(L, x + 330, y + 110, 'ALLISON HARVEY · 2002', 46, S.at('harvey') - 0.3);
  L.TXT('a model of insomnia', x + 330, y + 210, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('insomnia') - 0.4, 0.7);
  const P = bed(L, x + 140, y + 840, 620, S.t0 + 0.2, { s: 0.9, kind: 'worry', look: [0, -1], you: true, k: 0.6 });
  const bx = P.head[0] + 20, by = P.head[1] - 220, bulb = L.ell(bx, by, 50, 56, 0, L.TAU, 30); L.FILL(bulb, S.at('worry') - 0.3); L.MRK([bulb], { col: L.YEL, w: 14 }, S.at('switched') - 0.2, 0.1); L.INK_(bulb, { closed: true, w: 3, amp: 0.3 }, S.at('worry') - 0.3, 0.12); L.INK_(L.rrect(bx - 22, by + 52, 44, 30, 4), { closed: true, w: 2.6, amp: 0.1, passes: 1 }, S.at('worry') - 0.15, 0.05);
  L.sparks(bx, by, 72, 100, [-2.6, -1.9, -1.2, -0.5], S.at('switched'), 0.12);
  L.TXT('worry + rumination = switched on', x + 1180, y + 320, 42, { f: 'KB', align: 'center' }, S.at('rumination') - 0.4, 0.9);
  L.clock(x + 1180, y + 560, 120, S.at('awake') - 0.6);
  [['12', -0.0], ['1', 0.4], ['2', 0.8]].forEach(([h], i) => L.TXT(h + ':00', x + 1000 + i * 180, y + 760, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('longer') + i * 0.4, 0.3));
  L.TXT('more airtime for the replay', x + 1180, y + 840, 40, { f: 'KB', align: 'center' }, S.at('airtime') - 0.3, 0.7);
});
def(LONG, 'c2f', blk(2, 6), { purpose: 'recap the perfect setup (memory + quiet mind + nothing competing) and open the real question', shot: 'pan right; the three ingredients add up; push into the question', sfx: 'three taps; then a held note under the question' }, (S, L) => {
  const [x, y] = blk(2, 6);
  const items = [['strongly stored', 'stored'], ['a quiet mind', 'quiet'], ['no competition', 'compete']];
  items.forEach(([lab, w], i) => { const cx = x + 260 + i * 420, t = S.at(w) - 0.5; L.box(cx - 170, y + 160, 340, 220, t, 0.25, { r: 18 }); L.TXT(lab, cx, y + 290, 40, { f: 'KB', align: 'center' }, t + 0.25, 0.5); if (i < 2) L.TXT('+', cx + 210, y + 300, 70, { f: 'KB', align: 'center' }, t + 0.4, 0.2); });
  L.TXT('= the perfect setup', x + 1450, y + 300, 44, { f: 'KB', align: 'center' }, S.at('setup') - 0.2, 0.6);
  L.box(x + 300, y + 500, 1000, 260, S.at('question') - 0.4, 0.3, { r: 26, tint: 'rgba(255,205,40,0.25)' });
  L.TXT("why can't you just let it go?", x + 800, y + 650, 62, { f: 'KB', align: 'center' }, S.at("can't") - 0.4, 1.0);
});

// ===== chapter 3: the trap =====
chapter(LONG, 'ch3', 3, 3, 'THE TRAP');
def(LONG, 'c3a', blk(3, 1), { purpose: 'define rumination: going round a bad feeling, causes and consequences, no action', shot: 'pan right; medium on the person walking the spiral track; labels orbit it', sfx: 'footsteps on the loop; pen' }, (S, L) => {
  const [x, y] = blk(3, 1);
  tag(L, x + 330, y + 110, 'SUSAN NOLEN-HOEKSEMA', 44, S.at('susan') - 0.3);
  L.TXT('rumination', x + 1100, y + 130, 80, { f: 'KB', align: 'center' }, S.at('rumination') - 0.3, 0.6); L.swash(x + 900, y + 160, x + 1300, S.at('rumination') + 0.4, 0.3);
  spiral(L, x + 760, y + 620, 420, S.at('over') - 0.5, 1.2, { turns: 2.4, squash: 0.36 });
  L.person(x + 560, y + 620, 1.1, S.at('over') - 0.2, { pose: 'walk', you: true, kind: 'worry', look: [1, 0.3], k: 0.6, dir: 1 });
  cloud(L, x + 960, y + 560, 180, 100, S.at('feeling') - 0.3, { tint: L.GRY2 });
  L.TXT('causes', x + 360, y + 420, 44, { f: 'PH', col: L.INK2 }, S.at('causes') - 0.2, 0.4); L.TXT('consequences', x + 1060, y + 420, 44, { f: 'PH', col: L.INK2 }, S.at('consequences') - 0.3, 0.6);
  L.box(x + 1180, y + 700, 320, 120, S.at('doing') - 0.6, 0.25, { r: 16 }); L.TXT('action?', x + 1340, y + 775, 44, { f: 'KB', align: 'center' }, S.at('doing') - 0.4, 0.4); L.cross(x + 1460, y + 760, 1.8, S.at('anything'));
});
def(LONG, 'c3b', blk(3, 2), { purpose: 'the natural experiment: Loma Prieta 1989; students measured two weeks before', shot: 'pan right; the seismograph line jolts across the block (pattern interrupt), then the calendar', sfx: 'a low rumble under the jagged line' }, (S, L) => {
  const [x, y] = blk(3, 2);
  tag(L, x + 330, y + 110, 'OCTOBER 1989', 54, S.at('october') - 0.3);
  const P = []; for (let i = 0; i <= 200; i++) { const u = i / 200, amp = u > 0.45 && u < 0.75 ? 110 * Math.sin((u - 0.45) / 0.3 * Math.PI) : 8; P.push([x + 100 + u * 1400, y + 330 + Math.sin(i * 1.7) * amp * (0.6 + 0.4 * Math.sin(i * 0.9))]); }
  L.INK_(P, { w: 3, amp: 0.3, passes: 1 }, S.at('earthquake') - 0.6, 1.2);
  L.TXT('San Francisco Bay Area', x + 1100, y + 110, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('bay') - 0.3, 0.7);
  const cx = x + 360, cy = y + 560, cal = [[cx - 150, cy], [cx + 150, cy], [cx + 150, cy + 260], [cx - 150, cy + 260]];
  L.FILL(cal, S.at('coincidence') - 0.2); L.dropShadow(cal, 7, 8, S.at('coincidence')); L.INK_(cal, { closed: true, w: 3, amp: 0.4 }, S.at('coincidence') - 0.2, 0.2);
  L.MRK([[[cx - 150, cy], [cx + 150, cy], [cx + 150, cy + 50], [cx - 150, cy + 50]]], { col: L.GRY2, w: 12, edge: false }, S.at('coincidence'), 0.1);
  L.TXT('2 weeks before', cx, cy + 170, 42, { f: 'KB', align: 'center' }, S.at('weeks') - 0.3, 0.6);
  for (let i = 0; i < 6; i++) L.student(x + 760 + i * 130, y + 830, 0.8, S.at('students') - 0.3 + i * 0.08, { hair: ['bun', 'tuft', 'long', 'cap', 'curly', 'messy'][i], kind: 'neutral', look: [0.6, 0.6], k: 0.3 });
  L.TXT('moods + coping styles', x + 1100, y + 560, 42, { f: 'PH', align: 'center', col: L.INK2 }, S.at('moods') - 0.3, 0.7);
});
def(LONG, 'c3c', blk(3, 3), { purpose: 'follow-up: those who already ruminated had more symptoms at 10 days and 7 weeks', shot: 'pan right; a timeline reads left to right; push on the taller ruminator bars', sfx: 'two checkpoint taps; marker on bars' }, (S, L) => {
  const [x, y] = blk(3, 3);
  L.INK_(L.line(x + 120, y + 240, x + 1480, y + 240), { w: 3.4, amp: 0.6 }, S.t0 + 0.1, 0.4);
  [['before', 220, null], ['10 days', 760, 'ten'], ['7 weeks', 1300, 'seven']].forEach(([lab, px, w]) => { const t = w ? S.at(w) - 0.3 : S.t0 + 0.2; L.INK_(L.ell(x + px, y + 240, 16, 16, 0, L.TAU, 16), { closed: true, w: 4, amp: 0.2, passes: 1 }, t, 0.06); L.TXT(lab, x + px, y + 190, 44, { f: 'KB', align: 'center' }, t + 0.1, 0.4); });
  L.TXT('quake', x + 480, y + 300, 34, { f: 'PH', align: 'center', col: L.INK2 }, S.t0 + 0.6, 0.3);
  L.INK_([[x + 440, y + 240], [x + 460, y + 220], [x + 480, y + 262], [x + 500, y + 218], [x + 520, y + 240]], { w: 3, amp: 0.2, passes: 1 }, S.t0 + 0.5, 0.15);
  const tb = S.at('symptoms') - 0.5;
  [[760, 'ten'], [1300, 'seven']].forEach(([px], i) => L.bars(x + px - 220, y + 760, 440, 380, [{ v: 0.38, label: 'others', col: L.GRY2, t: tb + i * 0.5 }, { v: 0.78, label: 'ruminators', col: L.YEL, t: tb + 0.3 + i * 0.5 }], tb + i * 0.5, { k: 0.6 }));
  L.TXT('already distressed + ruminating', x + 300, y + 480, 38, { f: 'PH', align: 'center', col: L.INK2 }, S.at('already') - 0.3, 0.8);
  L.TXT('(sketch, not to scale)', x + 300, y + 820, 30, { f: 'PH', align: 'center', col: L.INK2 }, S.at('symptoms') + 0.4, 0.5);
});
def(LONG, 'c3d', blk(3, 4), { purpose: 'honest pivot: correlation, not proof → into the lab', shot: 'pan right; a stamp card, then the lab door swings open', sfx: 'a stamp thud; door creak' }, (S, L) => {
  const [x, y] = blk(3, 4);
  card(L, x + 160, y + 260, 620, 300, S.t0 + 0.1, { lines: [['correlation', 64], ['is not proof', 64]], lt: [S.at('correlation') - 0.3, S.at('proof') - 0.3] });
  L.door(x + 1050, y + 780, 200, 440, S.at('lab') - 0.8, { open: 0.75, k: 0.8 });
  L.TXT('THE LAB', x + 1150, y + 280, 54, { f: 'KB', align: 'center' }, S.at('lab') - 0.3, 0.4);
  L.person(x + 1380, y + 780, 1.3, S.at('colleagues') - 0.3, { pose: 'point', kind: 'think', look: [-1, 0], hair: 'long', k: 0.6, dir: -1 });
});
def(LONG, 'c3e', blk(3, 5), { purpose: 'the lab task: feeling low → think about yourself vs think about neutral scenes', shot: 'pan right; two seated people side by side, their thought bubbles fill (compare)', sfx: 'pen; two soft taps' }, (S, L) => {
  const [x, y] = blk(3, 5);
  L.TXT('already feeling low', x + 800, y + 110, 50, { f: 'KB', align: 'center' }, S.at('low') - 0.4, 0.6);
  const A = L.student(x + 420, y + 820, 1.3, S.at('minutes') - 0.5, { kind: 'sad', look: [0.3, -0.6], hair: 'tuft', k: 0.5 });
  L.bubble(x + 180, y + 220, 440, 230, S.at('feelings') - 0.3, { thought: true, tail: [A.head[0], A.head[1] - 50] });
  L.TXT('me... my feelings...', x + 400, y + 320, 38, { f: 'PH', align: 'center' }, S.at('feelings') - 0.1, 0.6); L.TXT('why am I like this?', x + 400, y + 390, 36, { f: 'PH', align: 'center', col: L.INK2 }, S.at('themselves') - 0.2, 0.6);
  L.TXT('A', x + 300, y + 880, 40, { f: 'KB', align: 'center' }, S.at('feelings'), 0.2);
  const B = L.student(x + 1100, y + 820, 1.3, S.at('neutral') - 0.5, { kind: 'neutral', look: [0.3, -0.6], hair: 'bun', k: 0.5 });
  L.bubble(x + 880, y + 220, 440, 230, S.at('neutral') - 0.2, { thought: true, tail: [B.head[0], B.head[1] - 50] });
  cloud(L, x + 1020, y + 330, 130, 70, S.at('scenes') - 0.2); house(L, x + 1180, y + 380, 0.6, S.at('scenes'));
  L.TXT('B', x + 980, y + 880, 40, { f: 'KB', align: 'center' }, S.at('scenes'), 0.2);
  L.TXT('nothing to do with them', x + 1100, y + 500, 34, { f: 'PH', align: 'center', col: L.INK2 }, S.at('nothing') - 0.2, 0.6);
});
def(LONG, 'c3f', blk(3, 6), { purpose: 'results: ruminators got more down, distracted felt better; ruminators solved social problems worse', shot: 'pan right; the two characters return and react (continuity), then the puzzle pieces', sfx: 'a falling pluck, a rising pluck; puzzle click' }, (S, L) => {
  const [x, y] = blk(3, 6);
  const A = L.person(x + 260, y + 560, 1.1, S.t0 + 0.1, { hair: 'tuft', kind: 'sad', look: [0.4, 0.3], k: 0.5 });
  const B = L.person(x + 560, y + 560, 1.1, S.t0 + 0.3, { hair: 'bun', kind: 'neutral', look: [-0.4, 0.3], k: 0.5 });
  L.TXT('A', x + 260, y + 640, 36, { f: 'KB', align: 'center' }, S.t0 + 0.2, 0.2); L.TXT('B', x + 560, y + 640, 36, { f: 'KB', align: 'center' }, S.t0 + 0.4, 0.2);
  L.inkArrow([[x + 150, y + 250], [x + 150, y + 380]], { w: 5 }, S.at('down') - 0.3, 0.2); L.TXT('more down', x + 260, y + 220, 40, { f: 'KB', align: 'center' }, S.at('down') - 0.1, 0.4); L.react(A, S.at('down'), { kind: 'sad', look: [0, 0.6] });
  L.inkArrow([[x + 680, y + 380], [x + 680, y + 250]], { w: 5 }, S.at('better') - 0.3, 0.2); L.TXT('felt better', x + 560, y + 220, 40, { f: 'KB', align: 'center' }, S.at('better') - 0.1, 0.4); L.react(B, S.at('better'), { kind: 'smile', look: [0, 0] });
  L.INK_(L.line(x + 800, y + 140, x + 800, y + 820), { w: 2.4, amp: 1, passes: 1, dash: [12, 10], alpha: 0.6 }, S.at('studies') - 0.4, 0.3);
  L.TXT('Lyubomirsky & Nolen-Hoeksema', x + 1180, y + 160, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('lyubomirsky') - 0.3, 0.8);
  L.TXT('everyday social problems', x + 1180, y + 250, 42, { f: 'KB', align: 'center' }, S.at('social') - 0.4, 0.7);
  puzzle(L, x + 1000, y + 450, 1.3, S.at('weaker') - 0.6, { col: L.GRY }); L.TXT('ruminators', x + 1000, y + 580, 36, { f: 'PH', align: 'center', col: L.INK2 }, S.at('weaker') - 0.3, 0.4);
  puzzle(L, x + 1360, y + 450, 1.3, S.at('everyone') - 0.4, { col: L.YEL }); L.TXT('everyone else', x + 1360, y + 580, 36, { f: 'PH', align: 'center', col: L.INK2 }, S.at('everyone') - 0.1, 0.4);
  L.TXT('weaker solutions', x + 1000, y + 680, 44, { f: 'KB', align: 'center' }, S.at('solutions') - 0.2, 0.5);
});
def(LONG, 'c3g', blk(3, 7), { purpose: 'the punchline, held: feels like solving, makes it worse', shot: 'pan right; a held, centred card (reading time); slow push', sfx: 'silence, then one marker squeak on "worse"' }, (S, L) => {
  const [x, y] = blk(3, 7);
  L.TXT('feels like problem solving', x + 800, y + 330, 70, { f: 'KB', align: 'center' }, S.at('feels') - 0.3, 0.9);
  L.TXT('...made it worse', x + 800, y + 520, 90, { f: 'KB', align: 'center' }, S.at('worse') - 0.6, 0.6);
  L.swash(x + 470, y + 545, x + 1130, S.at('worse') + 0.1, 0.35);
  puzzle(L, x + 230, y + 700, 1, S.at('think') - 0.1, { col: L.GRY2 }); L.cross(x + 230, y + 700, 2.4, S.at('worse') + 0.2);
});
def(LONG, 'c3h', blk(3, 8), { purpose: 'why we keep doing it: it feels useful (positive beliefs, Papageorgiou & Wells)', shot: 'pan right; over-the-shoulder interview: interviewer with clipboard, patient answering in bubbles', sfx: 'pen on clipboard' }, (S, L) => {
  const [x, y] = blk(3, 8);
  L.TXT('it feels useful', x + 800, y + 110, 58, { f: 'KB', align: 'center' }, S.at('useful') - 0.4, 0.6);
  L.TXT('Papageorgiou & Wells · 2001', x + 800, y + 190, 38, { f: 'PH', align: 'center', col: L.INK2 }, S.at('papageorgiou') - 0.3, 0.9);
  const I = L.person(x + 340, y + 830, 1.4, S.at('interviewed') - 0.6, { pose: 'hold', kind: 'think', look: [1, 0], hair: 'cap', k: 0.6 });
  const cb = [[I.hand[1][0] - 10, I.hand[1][1] - 70], [I.hand[1][0] + 70, I.hand[1][1] - 74], [I.hand[1][0] + 74, I.hand[1][1] + 30], [I.hand[1][0] - 6, I.hand[1][1] + 34]];
  L.FILL(cb, S.at('interviewed') - 0.2); L.INK_(cb, { closed: true, w: 2.8, amp: 0.3 }, S.at('interviewed') - 0.2, 0.1);
  const Pt = L.person(x + 1150, y + 830, 1.4, S.at('depression') - 0.6, { pose: 'shrug', kind: 'worry', look: [-1, 0], hair: 'long', k: 0.6 });
  L.bubble(x + 820, y + 300, 460, 100, S.at('understand') - 0.6, { tail: [Pt.head[0] - 20, Pt.head[1] - 50], text: 'it helps me understand', size: 36 });
  L.bubble(x + 1000, y + 430, 420, 100, S.at('coping') - 0.6, { tail: [Pt.head[0] + 10, Pt.head[1] - 50], text: "it's how I cope", size: 36 });
  L.TXT('every single one', x + 520, y + 360, 44, { f: 'KB', align: 'center' }, S.at('every') - 0.2, 0.6); L.check(x + 720, y + 345, 2, S.at('single'));
});
def(LONG, 'c3i', blk(3, 9), { purpose: 'honest note: harm mainly in people already low; tired at night it is easy to be low', shot: 'pan right; a fine-print card held for reading, then the bed in the corner (callback)', sfx: 'quiet pen' }, (S, L) => {
  const [x, y] = blk(3, 9);
  L.box(x + 140, y + 130, 820, 560, S.t0 + 0.1, 0.4, { r: 26 });
  L.TXT('an honest note', x + 550, y + 230, 54, { f: 'KB', align: 'center' }, S.at('honest') - 0.3, 0.5);
  L.TXT('harm showed up mainly', x + 550, y + 360, 46, { f: 'PH', align: 'center' }, S.at('harm') - 0.3, 0.7);
  L.TXT('in people already low', x + 550, y + 430, 46, { f: 'PH', align: 'center' }, S.at('already') - 0.3, 0.7);
  L.MST(L.line(x + 360, y + 450, x + 740, y + 450), { w: 8, col: L.YELD }, S.at('low') + 0.2, 0.2);
  L.TXT('good mood: little effect', x + 550, y + 570, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('good') - 0.3, 0.7);
  bed(L, x + 1040, y + 840, 420, S.at('tired') - 0.8, { s: 0.65, kind: 'sad', look: [0, -1], you: true, k: 0.5 });
  L.TXT('tired, in the dark', x + 1270, y + 560, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('dark') - 0.4, 0.6);
});
def(LONG, 'c3j', blk(3, 10), { purpose: 'bridge: so stop thinking? not quite → the next experiment', shot: 'pan right; the question is crossed out; push toward the arrow pointing on', sfx: 'pen scratch on the cross-out' }, (S, L) => {
  const [x, y] = blk(3, 10);
  L.TXT('just stop thinking about it?', x + 800, y + 360, 66, { f: 'KB', align: 'center' }, S.at('stop') - 0.6, 0.9);
  L.MST(L.line(x + 330, y + 340, x + 1270, y + 350), { w: 6, col: L.INK }, S.at('quite') - 0.3, 0.3);
  L.TXT('not quite.', x + 800, y + 520, 70, { f: 'KB', align: 'center' }, S.at('quite') - 0.1, 0.4);
  L.fatArrow(x + 1100, y + 700, x + 1400, S.at('surprising') - 0.5);
  L.TXT('the next experiment', x + 800, y + 720, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('experiment') - 0.3, 0.6);
});

// ===== chapter 4: where you stand =====
chapter(LONG, 'ch4', 4, 4, 'WHERE YOU STAND');
def(LONG, 'c4a', blk(4, 1), { purpose: 'the 2005 experiment set-up: recall a time of overwhelming anger', shot: 'pan right; medium on the student; the memory of the argument forms above (storm)', sfx: 'a low rumble on "anger"' }, (S, L) => {
  const [x, y] = blk(4, 1);
  tag(L, x + 300, y + 110, '2005', 54, S.at('two') - 0.3);
  L.TXT('Kross, Ayduk & Mischel', x + 300, y + 210, 42, { f: 'PH', align: 'center', col: L.INK2 }, S.at('kross') - 0.3, 0.8);
  const P = L.student(x + 380, y + 840, 1.5, S.at('students') - 0.4, { kind: 'neutral', look: [0.8, -0.6], you: true, k: 0.6 });
  L.TXT('recall a time you were furious', x + 1060, y + 160, 44, { f: 'KB', align: 'center' }, S.at('recall') - 0.3, 0.9);
  memScreen(L, x + 760, y + 240, 600, 380, S.at('recall') + 0.2, { rec: false, from: [P.head[0] + 40, P.head[1] - 30] });
  const A = L.person(x + 960, y + 560, 0.9, S.at('time') - 0.1, { pose: 'point', you: true, kind: 'angry', look: [1, 0], k: 0.5 });
  const B = L.person(x + 1170, y + 560, 0.9, S.at('felt') - 0.2, { pose: 'shrug', kind: 'neutral', look: [-1, 0], hair: 'cap', k: 0.5, dir: -1 });
  storm(L, A, S.at('anger') - 0.3);
  L.react(P, S.at('anger'), { kind: 'angry', look: [0.8, -0.6] });
});
def(LONG, 'c4b', blk(4, 2), { purpose: 'the two instructions: relive it up close vs step back and watch the distant you', shot: 'pan right; left half close and cramped (inside the frame), right half wide (the viewer at the back) — the contrast is the idea', sfx: 'a heartbeat thump on the left; a cool airy chime on the right' }, (S, L) => {
  const [x, y] = blk(4, 2);
  L.box(x + 20, y + 100, 740, 760, S.at('relive') - 0.6, 0.3, { r: 20, tint: 'rgba(255,205,40,0.18)' });
  L.TXT('relive it', x + 390, y + 180, 56, { f: 'KB', align: 'center' }, S.at('relive') - 0.3, 0.5);
  const A = L.person(x + 300, y + 780, 2.0, S.at('relive'), { pose: 'point', you: true, kind: 'angry', look: [1, 0], k: 0.6 });
  L.person(x + 640, y + 780, 2.0, S.at('happening') - 0.3, { pose: 'shrug', kind: 'neutral', look: [-1, 0], hair: 'cap', k: 0.6, dir: -1 });
  L.TXT('as if it\'s happening again', x + 390, y + 250, 34, { f: 'PH', align: 'center', col: L.INK2 }, S.at('again') - 0.4, 0.6);
  L.TXT('a few steps back', x + 1210, y + 180, 56, { f: 'KB', align: 'center' }, S.at('steps') - 0.4, 0.6);
  memScreen(L, x + 1000, y + 260, 420, 260, S.at('watch') - 0.4, { rec: false });
  L.person(x + 1150, y + 480, 0.6, S.at('scene') - 0.2, { pose: 'point', you: true, kind: 'angry', look: [1, 0], k: 0.3 }); L.person(x + 1270, y + 480, 0.6, S.at('scene'), { kind: 'neutral', look: [-1, 0], hair: 'cap', k: 0.3 });
  seat(L, x + 1210, y + 840, 1.0, S.at('distant') - 0.6);
  L.head(x + 1210, y + 630, 46, S.at('distant') - 0.4, { you: true, kind: 'think', look: [0, -1], k: 0.5 });
  L.TXT('the distant you', x + 1210, y + 580 - 30, 34, { f: 'PH', align: 'center', col: L.INK2 }, S.at('version') - 0.3, 0.6);
});
def(LONG, 'c4c', blk(4, 3), { purpose: 'second split: what you feel vs why you feel it (a 2×2)', shot: 'pan right; a 2×2 grid is ruled, rows and columns labelled in order', sfx: 'four ruler strokes' }, (S, L) => {
  const [x, y] = blk(4, 3);
  const gx = x + 520, gy = y + 220, cw = 480, ch = 280;
  L.INK_(L.line(gx, gy, gx + 2 * cw, gy), { w: 3, amp: 0.4 }, S.t0 + 0.1, 0.2); L.INK_(L.line(gx, gy + ch, gx + 2 * cw, gy + ch), { w: 3, amp: 0.4 }, S.t0 + 0.2, 0.2); L.INK_(L.line(gx, gy + 2 * ch, gx + 2 * cw, gy + 2 * ch), { w: 3, amp: 0.4 }, S.t0 + 0.3, 0.2);
  L.INK_(L.line(gx, gy, gx, gy + 2 * ch), { w: 3, amp: 0.4 }, S.t0 + 0.3, 0.2); L.INK_(L.line(gx + cw, gy, gx + cw, gy + 2 * ch), { w: 3, amp: 0.4 }, S.t0 + 0.4, 0.2); L.INK_(L.line(gx + 2 * cw, gy, gx + 2 * cw, gy + 2 * ch), { w: 3, amp: 0.4 }, S.t0 + 0.5, 0.2);
  L.TXT('up close', gx - 40, gy + ch / 2 + 14, 44, { f: 'KB', align: 'right' }, S.t0 + 0.4, 0.4); L.TXT('from a distance', gx - 40, gy + ch * 1.5 + 14, 44, { f: 'KB', align: 'right' }, S.t0 + 0.6, 0.5);
  L.TXT('WHAT I feel', gx + cw / 2, gy - 40, 48, { f: 'KB', align: 'center' }, S.at('what') - 0.3, 0.5);
  L.TXT('WHY I feel it', gx + cw * 1.5, gy - 40, 48, { f: 'KB', align: 'center' }, S.at('why') - 0.3, 0.5);
  L.MST(L.line(gx + cw * 1.5 - 150, gy - 20, gx + cw * 1.5 + 150, gy - 20), { w: 8, col: L.YELD }, S.at('way') - 0.1, 0.2);
});
def(LONG, 'c4d', blk(4, 4), { purpose: 'the result: "why" hurt up close but helped from a distance (distanced-why lowest anger)', shot: 'pan right; four thermometers fill in turn; push on the cool one', sfx: 'four rising fills; a cool chime on the last' }, (S, L) => {
  const [x, y] = blk(4, 4);
  L.TXT('"why?" = the classic rumination question', x + 800, y + 100, 46, { f: 'KB', align: 'center' }, S.at('classic') - 0.6, 1.0);
  const T = [['close · what', 0.75, 'reliving'], ['close · why', 0.8, 'help'], ['far · what', 0.62, 'distance'], ['far · why', 0.32, 'less']];
  T.forEach(([lab, v, w], i) => { const tx = x + 260 + i * 360; thermo(L, tx, y + 640, 360, v, S.at(w) - 0.6 + (i === 3 ? 0.2 : 0), { label: lab, ls: 36 }); });
  L.TXT('anger', x + 80, y + 460, 40, { f: 'PH', col: L.INK2 }, S.at('reliving') - 0.4, 0.4);
  L.loop(x + 1340, y + 560, 150, 280, S.at('emotion') - 0.2, 0.5);
  L.TXT('(sketch, not to scale)', x + 800, y + 880, 30, { f: 'PH', align: 'center', col: L.INK2 }, S.at('less') + 0.4, 0.5);
});
def(LONG, 'c4e', blk(4, 5), { purpose: 'what they wrote: recounting blow by blow vs reconstruing (making sense, closure)', shot: 'pan right; two pages side by side; push on the right page as the bulb lights', sfx: 'scribble on the left; a bulb click on the right' }, (S, L) => {
  const [x, y] = blk(4, 5);
  const page = (px, t) => { const p = [[px, y + 200], [px + 520, y + 190], [px + 530, y + 820], [px + 10, y + 830]]; L.FILL(p, t); L.dropShadow(p, 8, 9, t + 0.2); L.INK_(p, { closed: true, w: 3, amp: 0.5 }, t, 0.2); };
  page(x + 160, S.at('recounted') - 0.8); L.TXT('up close: recounting', x + 420, y + 140, 44, { f: 'KB', align: 'center' }, S.at('recounted') - 0.5, 0.6);
  [['"then she said..."', 'said'], ['"and I felt..."', 'felt'], ['"and then..."', 'blow']].forEach(([s, w], i) => L.TXT(s, x + 420, y + 320 + i * 120, 40, { f: 'PH', align: 'center' }, S.at(w) - 0.2, 0.5));
  for (let i = 0; i < 3; i++) L.INK_(L.line(x + 220, y + 680 + i * 40, x + 640, y + 682 + i * 40), { w: 2, amp: 1.2, passes: 1, alpha: 0.7 }, S.at('blow', 2) + i * 0.1, 0.15);
  page(x + 900, S.at('distance') - 0.4); L.TXT('far: reconstruing', x + 1160, y + 140, 44, { f: 'KB', align: 'center' }, S.at('reconstrued') - 0.4, 0.6);
  const bx = x + 1160, by = y + 380, bulb = L.ell(bx, by, 64, 72, 0, L.TAU, 30); L.FILL(bulb, S.at('sense') - 0.4); L.MRK([bulb], { col: L.YEL, w: 14 }, S.at('sense') - 0.1, 0.12); L.INK_(bulb, { closed: true, w: 3, amp: 0.3 }, S.at('sense') - 0.4, 0.15); L.INK_(L.rrect(bx - 26, by + 66, 52, 36, 4), { closed: true, w: 2.6, amp: 0.1, passes: 1 }, S.at('sense') - 0.2, 0.05);
  L.TXT('made sense of it', x + 1160, y + 580, 42, { f: 'KB', align: 'center' }, S.at('sense') + 0.1, 0.6);
  L.TXT('closure', x + 1120, y + 700, 44, { f: 'KB', align: 'center' }, S.at('closure') - 0.3, 0.4); L.check(x + 1260, y + 685, 2, S.at('closure') + 0.1);
});
def(LONG, 'c4f', blk(4, 6), { purpose: 'the turn stated: not thinking about it, thinking from inside it — same memory, different seat', shot: 'pan right; reverse angle from the back of a cinema: the front-row seat in the glare, the back seat calm; push to the back seat on "different seat"', sfx: 'loud muffled replay at the front, quieter at the back' }, (S, L) => {
  const [x, y] = blk(4, 6);
  memScreen(L, x + 280, y + 90, 1040, 360, S.t0 + 0.1, { rec: true });
  partyMemory(L, x + 700, y + 410, 0.95, S.t0 + 0.3, { react: S.at('memory') - 0.2 });
  L.MRK([[[x + 300, y + 450], [x + 1300, y + 450], [x + 500, y + 700], [x + 340, y + 700]]], { col: 'rgba(255,205,40,0.35)', w: 26, ang: 1.2, edge: false }, S.at('inside') - 0.2, 0.3);
  seat(L, x + 420, y + 800, 1.0, S.at('inside') - 0.5); const F = L.head(x + 420, y + 590, 46, S.at('inside') - 0.3, { you: true, kind: 'shock', look: [0, -1], k: 0.5 });
  L.TXT('sound all the way up', x + 420, y + 870, 34, { f: 'PH', align: 'center', col: L.INK2 }, S.at('sound') - 0.2, 0.6);
  [700, 900, 1100].forEach((sx, i) => seat(L, x + sx, y + 830, 0.85, S.at('memory', 2) - 0.6 + i * 0.1));
  seat(L, x + 1300, y + 830, 0.85, S.at('seat') - 0.8); L.head(x + 1300, y + 650, 40, S.at('seat') - 0.6, { you: true, kind: 'content', look: [-0.4, -1], k: 0.5 });
  L.TXT('same memory', x + 800, y + 520, 50, { f: 'KB', align: 'center' }, S.at('memory', 2) - 0.2, 0.5);
  L.TXT('different seat', x + 1300, y + 500, 50, { f: 'KB', align: 'center' }, S.at('seat') - 0.4, 0.5); L.swash(x + 1160, y + 525, x + 1440, S.at('seat') + 0.2, 0.3);
});
def(LONG, 'c4g', blk(4, 7), { purpose: 'Watkins: judging "why me" questions keep low mood going; concrete "how" questions help', shot: 'pan right; the heavy grey card sinks, the yellow card lifts (cause → effect)', sfx: 'a low thud for the grey card, a light pluck for the yellow' }, (S, L) => {
  const [x, y] = blk(4, 7);
  tag(L, x + 330, y + 110, 'EDWARD WATKINS · EXETER', 42, S.at('watkins') - 0.3);
  card(L, x + 100, y + 260, 660, 260, S.at('judging') - 0.4, { tint: L.GRY2, lines: [['"why does this always', 44], ['happen to me?"', 44]], lt: [S.at('always') - 0.4, S.at('happen') - 0.2] });
  L.TXT('keeps a low mood going', x + 430, y + 600, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('going') - 0.4, 0.6); L.inkArrow([[x + 430, y + 640], [x + 430, y + 760]], { w: 5 }, S.at('going'), 0.2);
  card(L, x + 860, y + 260, 660, 260, S.at('concrete') - 0.4, { tint: 'rgba(255,205,40,0.3)', lines: [['"how did it unfold?', 44], ['what can I do next?"', 44]], lt: [S.at('unfold') - 0.5, S.at('next') - 0.4] });
  L.TXT('tends to help', x + 1190, y + 600, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('help') - 0.4, 0.5); L.inkArrow([[x + 1190, y + 760], [x + 1190, y + 640]], { w: 5 }, S.at('help'), 0.2);
});
def(LONG, 'c4h', blk(4, 8), { purpose: 'his study with depressed patients: concrete thinking → better problem solving', shot: 'pan right; two puzzles; the concrete one clicks together', sfx: 'puzzle click' }, (S, L) => {
  const [x, y] = blk(4, 8);
  L.TXT('a study with depressed patients', x + 800, y + 140, 50, { f: 'KB', align: 'center' }, S.at('patients') - 0.6, 0.9);
  puzzle(L, x + 420, y + 450, 1.6, S.at('concrete') - 0.3, { col: L.YEL }); puzzle(L, x + 560, y + 450, 1.6, S.at('better') - 0.4, { col: L.YEL }); L.check(x + 500, y + 620, 2.4, S.at('solving'));
  L.TXT('concrete', x + 490, y + 720, 52, { f: 'KB', align: 'center' }, S.at('concrete') - 0.1, 0.4);
  puzzle(L, x + 1040, y + 450, 1.6, S.at('abstract') - 0.4, { col: L.GRY }); puzzle(L, x + 1260, y + 500, 1.6, S.at('brooding') - 0.4, { col: L.GRY }); L.qmark(x + 1150, y + 640, 90, S.at('brooding'));
  L.TXT('abstract brooding', x + 1150, y + 760, 52, { f: 'KB', align: 'center' }, S.at('brooding') - 0.1, 0.5);
});
def(LONG, 'c4i', blk(4, 9), { purpose: 'honest limits + the takeaway: judging questions keep you stuck, observing ones help', shot: 'pan right; fine print first, then the two-line takeaway gets the yellow', sfx: 'pen; one marker squeak' }, (S, L) => {
  const [x, y] = blk(4, 9);
  L.box(x + 160, y + 100, 1280, 300, S.t0 + 0.1, 0.35, { r: 22 });
  L.TXT('modest effects · mostly lab studies with students', x + 800, y + 210, 42, { f: 'PH', align: 'center' }, S.at('modest') - 0.3, 1.0);
  L.TXT('much of it from a few research groups', x + 800, y + 300, 42, { f: 'PH', align: 'center' }, S.at('groups') - 0.9, 0.9);
  L.TXT('questions that judge you → stuck', x + 800, y + 560, 58, { f: 'KB', align: 'center' }, S.at('judge') - 0.4, 0.9);
  L.TXT('questions that observe → help', x + 800, y + 700, 58, { f: 'KB', align: 'center' }, S.at('observe') - 0.4, 0.9);
  L.MST(L.line(x + 420, y + 720, x + 1180, y + 720), { w: 10, col: L.YELD }, S.at('help') + 0.1, 0.3);
});

// ===== chapter 5: change your seat =====
chapter(LONG, 'ch5', 5, 5, 'CHANGE YOUR SEAT');
def(LONG, 'c5a', blk(5, 1), { purpose: 'promise: three things to try, each tied to research', shot: 'pan right; the list frame (empty slots set up the next minutes)', sfx: 'three bullet dots' }, (S, L) => {
  const [x, y] = blk(5, 1);
  L.TXT('3 THINGS TO TRY', x + 800, y + 200, 90, { f: 'KB', align: 'center' }, S.at('three') - 0.3, 0.8);
  L.swash(x + 450, y + 230, x + 1150, S.at('three') + 0.6, 0.35);
  ['step back', 'why to how', 'a short distraction'].forEach((s, i) => { numDot(L, x + 360 + i * 440, y + 480, i + 1, S.at('research') - 0.4 + i * 0.25, 56); L.TXT(s, x + 360 + i * 440, y + 640, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('research') - 0.2 + i * 0.25, 0.5); });
  L.TXT('at 2 a.m.', x + 800, y + 790, 46, { f: 'PH', align: 'center', col: L.INK2 }, S.at('am') - 0.2, 0.5);
});
def(LONG, 'c5b', blk(5, 2), { purpose: '1 · step back: picture it from across the room, like a fly on the wall', shot: 'a dolly-out: starts close on the memory, pulls back past the fly on the wall to the observer (the camera does the stepping back)', sfx: 'a fly buzz (quiet); airy whoosh on the pull-back', noAutoCam: true }, (S, L) => {
  const B = blk(5, 2), [x, y] = B, c = S.fit(B);
  S.cam(S.t0 - 0.3, x + 1050, y + 470, c.z * 2.0, 0.9); S.cam(S.at('across') - 0.3, c.x, c.y, c.z, 2.2, 'io');
  numDot(L, x + 110, y + 110, 1, S.t0 + 0.1, 46); L.TXT('STEP BACK', x + 190, y + 135, 66, { f: 'KB' }, S.at('step') - 0.2, 0.5);
  memScreen(L, x + 820, y + 260, 480, 300, S.t0 + 0.2, { rec: false });
  partyMemory(L, x + 980, y + 530, 0.6, S.t0 + 0.4, { react: false, text: 'ha... wait' });
  L.INK_(L.line(x + 640, y + 150, x + 640, y + 860), { w: 3.4, amp: 0.8 }, S.at('room') - 0.4, 0.3);
  fly(L, x + 660, y + 300, 1.6, S.at('fly') - 0.2); L.TXT('fly on the wall', x + 470, y + 260, 38, { f: 'PH', align: 'center', col: L.INK2 }, S.at('wall') - 0.3, 0.6);
  const O = L.person(x + 330, y + 840, 1.4, S.at('watching') - 0.6, { you: true, kind: 'think', look: [1, -0.3], k: 0.6 });
  L.INK_(L.line(O.head[0] + 50, O.head[1], x + 820, y + 420), { w: 2.4, amp: 0.6, passes: 1, dash: [10, 10] }, S.at('observer') - 0.4, 0.3);
  L.bubble(x + 140, y + 380, 380, 100, S.at('observer') - 0.2, { thought: true, tail: [O.head[0], O.head[1] - 50], text: 'what would I see?', size: 34 });
  L.react(O, S.at('see') - 0.1, { kind: 'content', look: [1, -0.3] });
});
def(LONG, 'c5c', blk(5, 3), { purpose: 'the 2014 self-talk study: "I" vs own name / "you" before a stressful speech', shot: 'pan right; medium on two speakers backstage, each with a thought bubble (compare)', sfx: 'mic tap; murmuring room' }, (S, L) => {
  const [x, y] = blk(5, 3);
  tag(L, x + 300, y + 110, '2014', 54, S.at('two') - 0.3); L.TXT('Kross & colleagues', x + 300, y + 200, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('kross') - 0.2, 0.6);
  L.TXT('a speech, under pressure', x + 1080, y + 130, 50, { f: 'KB', align: 'center' }, S.at('speech') - 0.4, 0.7);
  const pod = (px, t) => { const p = [[px - 80, y + 600], [px + 80, y + 600], [px + 64, y + 840], [px - 64, y + 840]]; L.FILL(p, t); L.MRK([p], { col: L.GRY, w: 12 }, t + 0.06, 0.06); L.INK_(p, { closed: true, w: 3, amp: 0.4 }, t, 0.14); };
  const A = L.person(x + 520, y + 840, 1.4, S.at('nerves') - 0.6, { pose: 'hold', kind: 'worry', look: [0.4, -0.6], hair: 'tuft', k: 0.6 }); pod(x + 520, S.at('nerves') - 0.4);
  L.bubble(x + 300, y + 300, 420, 120, S.at('word') - 0.3, { thought: true, tail: [A.head[0], A.head[1] - 50], text: '"I can\'t do this"', size: 38 });
  L.TXT('"I"', x + 520, y + 260, 52, { f: 'KB', align: 'center' }, S.at('i') - 0.1, 0.3);
  const Bp = L.person(x + 1150, y + 840, 1.4, S.at('others') - 0.5, { pose: 'hold', kind: 'think', look: [-0.4, -0.6], hair: 'long', k: 0.6 }); pod(x + 1150, S.at('others') - 0.3);
  L.bubble(x + 930, y + 300, 440, 120, S.at('name') - 0.3, { thought: true, tail: [Bp.head[0], Bp.head[1] - 50], text: '"Alex, you\'ve got this"', size: 36, tint: 'rgba(255,205,40,0.25)' });
  L.TXT('own name / "you"', x + 1150, y + 260, 46, { f: 'KB', align: 'center' }, S.at('name') - 0.1, 0.5);
});
def(LONG, 'c5d', blk(5, 4), { purpose: 'results (less distress, better rated, less beating themselves up) + the line to try', shot: 'pan right; three checks fill a list; then a close-up of the bubble with the line to try', sfx: 'three checkmark ticks' }, (S, L) => {
  const [x, y] = blk(5, 4);
  L.TXT('the name group:', x + 330, y + 140, 50, { f: 'KB', align: 'center' }, S.at('group') - 0.3, 0.5);
  [['less distressed', 'distressed'], ['judges: better speeches', 'judges'], ['less beating themselves up', 'beating']].forEach(([s, w], i) => { const yy = y + 280 + i * 110; L.check(x + 110, yy - 14, 2, S.at(w) - 0.2); L.TXT(s, x + 160, yy, 42, { f: 'PH' }, S.at(w) - 0.1, 0.6); });
  L.TXT('instead of:', x + 1100, y + 160, 42, { f: 'PH', align: 'center', col: L.INK2 }, S.at('instead') - 0.2, 0.4);
  L.TXT('"why did I say that?"', x + 1100, y + 240, 48, { f: 'KB', align: 'center' }, S.at('why') - 0.2, 0.6); L.MST(L.line(x + 880, y + 225, x + 1320, y + 230), { w: 5, col: L.INK }, S.at('try') - 0.2, 0.2);
  L.bubble(x + 760, y + 380, 700, 220, S.at('try') - 0.1, { tint: 'rgba(255,205,40,0.3)' });
  L.TXT('"Okay, Alex.', x + 1110, y + 470, 52, { f: 'KB', align: 'center' }, S.at('okay') - 0.2, 0.5); L.TXT('What actually happened there?"', x + 1110, y + 550, 44, { f: 'KB', align: 'center' }, S.at('actually') - 0.3, 0.8);
  L.TXT('(use your own name)', x + 1110, y + 680, 36, { f: 'PH', align: 'center', col: L.INK2 }, S.at('alex') + 0.3, 0.6);
  const P = L.person(x + 470, y + 860, 1.0, S.at('okay') - 0.6, { you: true, kind: 'think', look: [1, -0.5], k: 0.4 });
});
def(LONG, 'c5e', blk(5, 5), { purpose: '2 · swap why-me for how; if there is a next step, write it down for the morning', shot: 'pan right; the "why me?" card flips to "how?", then the hand writes on the notepad by the bed (contact)', sfx: 'card flip; pencil scratch' }, (S, L) => {
  const [x, y] = blk(5, 5);
  numDot(L, x + 110, y + 110, 2, S.t0 + 0.1, 46); L.TXT('WHY ME → HOW', x + 190, y + 135, 66, { f: 'KB' }, S.at('swap') - 0.2, 0.7);
  card(L, x + 120, y + 260, 420, 180, S.at('why') - 0.4, { tint: L.GRY2, lines: [['why me?', 56]] });
  L.cross(x + 330, y + 350, 3.2, S.at('how') - 0.1);
  card(L, x + 120, y + 500, 600, 260, S.at('exactly') - 0.4, { tint: 'rgba(255,205,40,0.3)', lines: [['what exactly happened?', 40], ['anything I want to do?', 40]], lt: [S.at('exactly') - 0.2, S.at('anything') - 0.2] });
  const P = L.person(x + 1000, y + 860, 1.4, S.at('message') - 0.8, { pose: 'hold', you: true, kind: 'think', look: [1, 0.6], k: 0.6, reach2: [x + 1130, y + 640] });
  const nx = x + 1090, ny = y + 560; notepad(L, nx, ny - 160, 360, 300, S.at('message') - 0.5, ['message', 'apologize', 'note for next time'], { size: 32, lh: 70, it: [S.at('message'), S.at('apology'), S.at('note')] });
  L.INK_(L.line(x + 1130, y + 640, x + 1170, y + 590), { w: 5, amp: 0.1, passes: 1 }, S.at('message') - 0.2, 0.05);
  L.TXT('for the morning', x + 1270, y + 820, 44, { f: 'KB', align: 'center' }, S.at('morning') - 0.4, 0.6);
});
def(LONG, 'c5f', blk(5, 6), { purpose: 'support: Baylor sleep-lab study, to-do list before bed → fell asleep faster', shot: 'pan right; medium on the bed with the list on the nightstand; the clock and "faster" arrow', sfx: 'pencil; a soft clock tick; a sleepy "z"' }, (S, L) => {
  const [x, y] = blk(5, 6);
  tag(L, x + 330, y + 110, 'BAYLOR · SLEEP LAB', 50, S.at('baylor') - 0.3);
  const P = bed(L, x + 140, y + 840, 640, S.at('lab') - 0.4, { s: 0.9, kind: 'side', look: [0, -1], you: true, k: 0.6 });
  const st = [[x + 900, y + 840], [x + 900, y + 620], [x + 1100, y + 620], [x + 1100, y + 840]]; L.FILL(st, S.at('five') - 0.4); L.MRK([st], { col: L.GRY, w: 12 }, S.at('five') - 0.3, 0.06); L.INK_(st, { closed: true, w: 3, amp: 0.3 }, S.at('five') - 0.4, 0.12);
  notepad(L, x + 920, y + 440, 160, 170, S.at('to-do') - 0.4, ['', ''], { size: 24, lh: 50 });
  L.TXT('to-do list', x + 1000, y + 410, 38, { f: 'KB', align: 'center' }, S.at('list') - 0.2, 0.4); L.TXT('5 min', x + 1000, y + 740, 38, { f: 'KB', align: 'center' }, S.at('minutes') - 0.2, 0.3);
  L.TXT('z z z', x + 420, y + 520, 50, { f: 'PH', col: L.INK2 }, S.at('asleep') - 0.1, 0.5);
  L.TXT('fell asleep faster', x + 1330, y + 300, 46, { f: 'KB', align: 'center' }, S.at('faster') - 0.3, 0.6);
  L.TXT('than writing about done things', x + 1330, y + 370, 32, { f: 'PH', align: 'center', col: L.INK2 }, S.at('done') - 0.4, 0.6);
  L.TXT('get it onto paper', x + 1330, y + 560, 42, { f: 'KB', align: 'center' }, S.at('paper') - 0.4, 0.6); L.underline(x + 1180, y + 585, x + 1480, S.at('down') - 0.2, 0.3);
});
def(LONG, 'c5g', blk(5, 7), { purpose: '3 · a short absorbing distraction lets the alarm settle; look later from a better seat', shot: 'pan right; medium on hands holding a puzzle book (contact), the warning light dims; push to the seat at the end', sfx: 'page turn; the alarm blink slows and stops' }, (S, L) => {
  const [x, y] = blk(5, 7);
  numDot(L, x + 110, y + 110, 3, S.t0 + 0.1, 46); L.TXT('SOMETHING ELSE TO HOLD', x + 190, y + 135, 56, { f: 'KB' }, S.at('hold') - 0.6, 0.8);
  const P = L.person(x + 420, y + 860, 1.7, S.at('mind') - 0.4, { pose: 'hold', you: true, kind: 'think', look: [0, 0.8], k: 0.6 });
  const [h1, h2] = P.hand, bk = [[h1[0] - 70, h1[1] - 20], [h2[0] + 70, h2[1] - 20], [h2[0] + 66, h2[1] + 50], [h1[0] - 66, h1[1] + 50]];
  L.FILL(bk, S.at('hold') - 0.2); L.MRK([bk], { col: L.GRY, w: 10 }, S.at('hold') - 0.1, 0.06); L.INK_(bk, { closed: true, w: 3, amp: 0.3 }, S.at('hold') - 0.2, 0.12); L.INK_(L.line((h1[0] + h2[0]) / 2, h1[1] - 20, (h1[0] + h2[0]) / 2, h1[1] + 50), { w: 2.4, amp: 0.1, passes: 1 }, S.at('hold'), 0.05);
  for (let i = 0; i < 3; i++) for (let q = 0; q < 3; q++) L.INK_(L.rrect(h2[0] + 4 + q * 18, h2[1] - 8 + i * 16, 14, 12, 2), { closed: true, w: 1.4, amp: 0.1, passes: 1 }, S.at('hold') + 0.1, 0.02);
  L.TXT('a few absorbing minutes', x + 420, y + 330, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('minutes') - 0.3, 0.7);
  warnLight(L, x + 950, y + 360, 56, S.at('distraction') - 0.4);
  L.TXT('low moods lifted', x + 950, y + 520, 42, { f: 'KB', align: 'center' }, S.at('lifted') - 0.4, 0.5);
  L.COVER(L.ell(x + 950, y + 360, 100, 100, 0, L.TAU, 30), S.at('settle') - 0.1); const c2 = L.ell(x + 950, y + 360, 56, 56, 0, L.TAU, 28); L.INK_(c2, { closed: true, w: 3, amp: 0.4 }, S.at('settle'), 0.1);
  L.TXT('the alarm settles', x + 950, y + 600, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('settle') + 0.1, 0.6);
  seat(L, x + 1350, y + 840, 1.0, S.at('later') - 0.3); L.TXT('later, from a better seat', x + 1300, y + 560, 38, { f: 'KB', align: 'center' }, S.at('better') - 0.6, 0.8);
});
def(LONG, 'c5h', blk(5, 8), { purpose: 'callback to episode 1: they noticed less and judged less harshly; HD replay vs blurry thumbnail', shot: 'pan right; two screens compared: the big sharp one (you) and a tiny blurry one (them)', sfx: 'a crisp click; a soft smudge' }, (S, L) => {
  const [x, y] = blk(5, 8);
  L.TXT('remember the last episode', x + 800, y + 110, 46, { f: 'PH', align: 'center', col: L.INK2 }, S.at('remember') - 0.2, 0.8);
  L.TXT('they noticed less · judged less harshly', x + 800, y + 200, 46, { f: 'KB', align: 'center' }, S.at('noticed') - 0.4, 1.2);
  memScreen(L, x + 120, y + 300, 760, 440, S.at('replay') - 0.5, { rec: false });
  partyMemory(L, x + 400, y + 690, 1.05, S.at('replay') - 0.3, { react: S.at('definition') - 0.3 });
  L.TXT('YOUR REPLAY: HD', x + 500, y + 810, 44, { f: 'KB', align: 'center' }, S.at('definition') - 0.3, 0.5);
  const tb = L.rrect(x + 1080, y + 440, 260, 160, 10); L.FILL(tb, S.at('theirs') - 0.3); L.INK_(tb, { closed: true, w: 2.6, amp: 0.6 }, S.at('theirs') - 0.3, 0.1);
  L.MRK([L.ell(x + 1170, y + 520, 30, 50, 0, L.TAU, 20), L.ell(x + 1250, y + 520, 30, 50, 0, L.TAU, 20)], { col: L.GRY2, w: 22, edge: false }, S.at('exists') - 0.2, 0.2);
  L.TXT('theirs: a blurry thumbnail', x + 1210, y + 680, 38, { f: 'KB', align: 'center' }, S.at('thumbnail') - 0.5, 0.7);
  L.qmark(x + 1380, y + 440, 80, S.at('exists'));
});
def(LONG, 'c5i', blk(5, 9), { purpose: 'care line: when to talk to a doctor or therapist', shot: 'pan right; a calm, centred card (no movement beyond the push)', sfx: 'quiet pen' }, (S, L) => {
  const [x, y] = blk(5, 9);
  L.box(x + 220, y + 140, 1160, 620, S.t0 + 0.1, 0.4, { r: 30 });
  L.TXT('constant? weeks? night after night?', x + 800, y + 300, 54, { f: 'KB', align: 'center' }, S.at('constant') - 0.3, 1.2);
  L.TXT('talk to a doctor or a therapist', x + 800, y + 430, 58, { f: 'KB', align: 'center' }, S.at('doctor') - 0.6, 0.8);
  L.TXT('US: call or text 988', x + 800, y + 540, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('therapist') + 0.2, 0.6);
  L.TXT('rumination is something they help with', x + 800, y + 660, 42, { f: 'PH', align: 'center', col: L.INK2 }, S.at('rumination') - 0.3, 0.9);
  heart(L, x + 800, y + 110, S.t0 + 0.5);
});

// ===== ending: back to the bed =====
def(LONG, 'end1', blk(0, 1), { purpose: 'payoff: back to 2 a.m., the same bed and screen (callback)', shot: 'a long whip back up the page to the opening bed, then hold on the ceiling screen', sfx: 'long paper whoosh; the clock tick from the opening', noAutoCam: true }, (S, L) => {
  const B = blk(0, 1), [x, y] = B, c = S.fit(B);
  S.cam(S.t0 - 0.2, (x + 800 + blk(5, 9)[0] + 800) / 2, (y + 450 + 5 * GY + 450) / 2, 0.14, 1.1, 'io');
  S.cam(S.t0 + 0.9, c.x, c.y, c.z, 1.2, 'io');
  S.cam(S.t0 + 2.2, x + 900, y + 300, c.z * 1.25, Math.max(1, S.end - S.t0 - 2.2), 'sin');
  L.loop(x + 1420, y + 720, 110, 110, S.at('ceiling') - 0.4, 0.4);
  L.loop(x + 910, y + 260, 360, 210, S.at('said') - 0.4, 0.5);
});
def(LONG, 'end2', blk(0, 6), { purpose: 'the line to remember: you kept it because you care; step back and it is just a scene', shot: 'whip right along the top row; starts close on the front-row seat in the glare, dolly-out to the back of the room as "step back" lands (the camera steps back with the viewer)', sfx: 'whoosh; the replay sound fades as the camera pulls back', ease: 'q', noAutoCam: true }, (S, L) => {
  const B = blk(0, 6), [x, y] = B, c = S.fit(B);
  S.cam(S.t0 - 0.3, x + 560, y + 420, c.z * 1.9, 0.9, 'q'); S.cam(S.at('step') - 0.3, c.x, c.y, c.z, 2.4, 'io');
  memScreen(L, x + 300, y + 120, 600, 320, S.t0 + 0.1, { rec: false });
  partyMemory(L, x + 520, y + 400, 0.8, S.t0 + 0.3, { react: false, text: 'ha... wait' });
  heart(L, x + 600, y + 80, S.at('belonging') - 0.2, 6);
  L.TXT('it cares about belonging', x + 1250, y + 140, 44, { f: 'KB', align: 'center' }, S.at('belonging') - 0.6, 0.8);
  L.TXT("not a flaw", x + 1250, y + 220, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('flaw') - 0.3, 0.5);
  seat(L, x + 600, y + 800, 1.0, S.t0 + 0.4); L.TXT('front row', x + 600, y + 860, 34, { f: 'PH', align: 'center', col: L.INK2 }, S.at('row') - 0.3, 0.4);
  seat(L, x + 1250, y + 820, 1.1, S.at('step') - 0.4);
  const P = L.person(x + 1250, y + 820, 1.2, S.at('step') - 0.2, { pose: 'sit', you: true, kind: 'content', look: [-1, -0.6], k: 0.6, dir: -1 });
  L.TXT('just a scene', x + 1250, y + 380, 60, { f: 'KB', align: 'center' }, S.at('scene') - 0.3, 0.5); L.swash(x + 1080, y + 405, x + 1420, S.at('scene') + 0.3, 0.3);
  L.TXT('starring someone you\'ve grown past', x + 1180, y + 470, 34, { f: 'PH', align: 'center', col: L.INK2 }, S.at('starring') - 0.2, 1.0);
});
def(LONG, 'end3', blk(0, 7), { purpose: 'one specific, low-exposure comment question + one subscribe line', shot: 'pan right; the question card fills the frame', sfx: 'pen; a kalimba on "subscribe"' }, (S, L) => {
  const [x, y] = blk(0, 7);
  L.bubble(x + 160, y + 120, 1280, 330, S.t0 + 0.2, { tint: 'rgba(255,205,40,0.25)', tail: [x + 400, y + 560] });
  L.TXT("What moment does your brain replay?", x + 800, y + 250, 60, { f: 'KB', align: 'center' }, S.at('moment') - 0.6, 0.9);
  L.TXT('How many YEARS old is it?', x + 800, y + 360, 64, { f: 'KB', align: 'center' }, S.at('years') - 0.6, 0.8);
  L.TXT('just the number of years', x + 800, y + 560, 50, { f: 'PH', align: 'center', col: L.INK2 }, S.at('details') - 0.4, 0.8);
  L.box(x + 560, y + 660, 480, 120, S.at('subscribe') - 0.4, 0.3, { r: 30, tint: L.YEL });
  L.TXT('SUBSCRIBE', x + 800, y + 742, 60, { f: 'KB', align: 'center' }, S.at('subscribe') - 0.2, 0.5);
});
def(LONG, 'card', blk(0, 8, 1400, 700), { purpose: 'end card', shot: 'pan right to the card, then hold', sfx: 'closing chord (harp, glockenspiel, vibraphone)', push: 0.02 }, (S, L) => {
  const [x, y] = blk(0, 8, 1400, 700);
  L.ribbon(x + 700, y + 230, 860, 120, 'THE OVERTHINKING PAD', 62, S.t0 + 0.2, { d: 0.35, td: 0.9 });
  L.TXT('why your brain does this, on one page', x + 700, y + 420, 48, { f: 'PH', align: 'center', col: L.INK2 }, S.t0 + 1.3, 1.0);
  L.TXT('new pages Mon · Tue · Thu · Sat', x + 700, y + 520, 50, { f: 'KB', align: 'center' }, S.t0 + 2.4, 1.0);
  L.loop(x + 700, y + 230, 520, 110, S.t0 + 3.6, 0.6);
});

// ---------- the Short (9:16): blocks are tall, 900 × 1150 ----------
const SBW = 900, SBH = 1150, sblk = i => [i * 1050, 0, SBW, SBH];
const SHORT = {};
def(SHORT, 's1', sblk(0), { purpose: 'hook in the first second (study-first, EXP-001 control): a furious memory on the screen, two ways to relive it', shot: 'opens close on the angry face from frame 0, pulls back to the memory screen and the "2 WAYS" label (reveal)', sfx: 'pen from frame 0; a low rumble on "furious"', noAutoCam: true }, (S, L) => {
  const B = sblk(0), [x, y] = B, c = S.fit(B);
  S.cam(S.t0, x + 450, y + 820, c.z * 1.6, 0.01); S.cam(S.t0 + 1.1, c.x, c.y, c.z * 1.05, 1.6, 'io');
  const P = L.person(x + 450, y + 1110, 1.9, S.t0, { pose: 'hold', you: true, kind: 'angry', look: [0, -0.8], k: 0.9 });
  memScreen(L, x + 120, y + 180, 660, 360, S.at('relive') - 0.4, { rec: true, from: [P.head[0], P.head[1] - 60] });
  const A = L.person(x + 340, y + 500, 0.85, S.at('moment') - 0.2, { pose: 'point', you: true, kind: 'angry', look: [1, 0], k: 0.4 });
  L.person(x + 560, y + 500, 0.85, S.at('moment'), { pose: 'shrug', kind: 'neutral', look: [-1, 0], hair: 'cap', k: 0.4, dir: -1 });
  storm(L, A, S.at('furious') - 0.2);
  L.TXT('2 WAYS', x + 450, y + 120, 84, { f: 'KB', align: 'center' }, S.at('two') - 0.2, 0.4);
});
def(SHORT, 's2', sblk(1), { purpose: 'way 1: relive it up close, as if it is happening now', shot: 'pan right; close and cramped: the memory fills the block, the viewer pressed against it', sfx: 'a heartbeat thump' }, (S, L) => {
  const [x, y] = sblk(1);
  L.TXT('HALF: UP CLOSE', x + 450, y + 110, 70, { f: 'KB', align: 'center' }, S.t0 + 0.05, 0.5);
  L.box(x + 30, y + 190, 840, 760, S.t0 + 0.2, 0.3, { r: 20, tint: 'rgba(255,205,40,0.2)' });
  L.person(x + 280, y + 900, 2.3, S.at('go') - 0.2, { pose: 'point', you: true, kind: 'angry', look: [1, 0], k: 0.6 });
  L.person(x + 680, y + 900, 2.3, S.at('live') - 0.2, { pose: 'shrug', kind: 'neutral', look: [-1, 0], hair: 'cap', k: 0.6, dir: -1 });
  L.TXT('"live it again"', x + 450, y + 1080, 56, { f: 'KB', align: 'center' }, S.at('again') - 0.3, 0.6);
});
def(SHORT, 's3', sblk(2), { purpose: 'way 2: a few steps back, watch the distant you (fly on the wall)', shot: 'pan right; wide: the memory small on a far screen, the viewer in the back seat', sfx: 'airy chime; a quiet fly buzz' }, (S, L) => {
  const [x, y] = sblk(2);
  L.TXT('HALF: STEP BACK', x + 450, y + 110, 70, { f: 'KB', align: 'center' }, S.t0 + 0.05, 0.5);
  memScreen(L, x + 250, y + 220, 400, 250, S.at('steps') - 0.3, { rec: false });
  L.person(x + 400, y + 430, 0.55, S.at('watch') - 0.2, { pose: 'point', you: true, kind: 'angry', look: [1, 0], k: 0.3 }); L.person(x + 510, y + 430, 0.55, S.at('watch'), { kind: 'neutral', look: [-1, 0], hair: 'cap', k: 0.3 });
  L.TXT('the distant you', x + 450, y + 540, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('distant') - 0.2, 0.5);
  fly(L, x + 760, y + 300, 1.8, S.at('fly') - 0.2); L.INK_(L.line(x + 820, y + 180, x + 820, y + 1000), { w: 3, amp: 0.6 }, S.at('fly') - 0.4, 0.2);
  seat(L, x + 450, y + 1000, 1.3, S.at('watch') + 0.4);
  L.head(x + 450, y + 740, 60, S.at('watch') + 0.6, { you: true, kind: 'think', look: [0, -1], k: 0.5 });
});
def(SHORT, 's4', sblk(3), { purpose: 'both asked "why did I feel that way?" (the classic overthinking question)', shot: 'pan right; push in on the question card (reading time)', sfx: 'a page tap on the question mark' }, (S, L) => {
  const [x, y] = sblk(3);
  L.TXT('then both asked:', x + 450, y + 160, 56, { f: 'PH', align: 'center', col: L.INK2 }, S.t0 + 0.1, 0.6);
  L.box(x + 60, y + 300, 780, 380, S.at('why') - 0.6, 0.3, { r: 26, tint: 'rgba(255,205,40,0.25)' });
  L.TXT('"Why did I', x + 450, y + 450, 80, { f: 'KB', align: 'center' }, S.at('why') - 0.2, 0.5);
  L.TXT('feel that way?"', x + 450, y + 570, 80, { f: 'KB', align: 'center' }, S.at('feel') - 0.2, 0.6);
  L.TXT('the classic overthinking question', x + 450, y + 790, 42, { f: 'PH', align: 'center', col: L.INK2 }, S.at('classic') - 0.2, 0.8);
  L.qmark(x + 450, y + 1060, 200, S.at('way') + 0.1);
});
def(SHORT, 's5', sblk(4), { purpose: 'the reveal: up close the why did not help; from a distance less anger and making sense', shot: 'pan right; two thermometers fill; push on the cool one, the bulb lights', sfx: 'two fills; a cool chime and a bulb click' }, (S, L) => {
  const [x, y] = sblk(4);
  thermo(L, x + 260, y + 700, 420, 0.82, S.at('close') - 0.4, { label: 'up close', ls: 46 });
  thermo(L, x + 640, y + 700, 420, 0.3, S.at('distance') - 0.4, { label: 'step back', ls: 46 });
  L.TXT('anger', x + 450, y + 160, 60, { f: 'KB', align: 'center' }, S.t0 + 0.1, 0.4);
  L.TXT('less anger', x + 640, y + 220, 50, { f: 'KB', align: 'center' }, S.at('anger') - 0.4, 0.5); L.loop(x + 640, y + 560, 110, 240, S.at('anger') - 0.1, 0.4);
  L.TXT('making sense,', x + 450, y + 960, 60, { f: 'KB', align: 'center' }, S.at('sense') - 0.4, 0.6); L.TXT('not reliving', x + 450, y + 1050, 60, { f: 'KB', align: 'center' }, S.at('reliving') - 0.4, 0.5);
  L.swash(x + 200, y + 1075, x + 700, S.at('reliving') + 0.3, 0.3);
});
def(SHORT, 's6', sblk(5), { purpose: 'payoff + loop back to the 2 a.m. replay + one comment question', shot: 'pan right; the bed returns small at the top, "CHANGE YOUR SEAT", hold on the question', sfx: 'pen; closing kalimba' }, (S, L) => {
  const [x, y] = sblk(5);
  bed(L, x + 90, y + 400, 560, S.t0 + 0.05, { s: 0.75, kind: 'worry', look: [0.6, -1], you: true, k: 0.6 });
  memScreen(L, x + 450, y + 60, 380, 200, S.at('replays') - 0.3, { rec: true });
  L.TXT('2 A.M.', x + 230, y + 120, 50, { f: 'KB', align: 'center' }, S.at('am') - 0.2, 0.3);
  L.TXT("don't fight it.", x + 450, y + 540, 54, { f: 'PH', align: 'center', col: L.INK2 }, S.at('fight') - 0.3, 0.5);
  L.TXT('CHANGE YOUR SEAT', x + 450, y + 650, 76, { f: 'KB', align: 'center' }, S.at('change') - 0.2, 0.6); L.swash(x + 140, y + 675, x + 760, S.at('seat') + 0.3, 0.3);
  L.bubble(x + 60, y + 760, 780, 270, S.at("what's") - 0.5, { tint: 'rgba(255,205,40,0.25)' });
  L.TXT('What moment does', x + 450, y + 870, 54, { f: 'KB', align: 'center' }, S.at("what's") - 0.2, 0.7);
  L.TXT('your brain replay?', x + 450, y + 950, 54, { f: 'KB', align: 'center' }, S.at('replay') - 0.2, 0.7);
});

export default { long: { scenes: LONG }, short: { scenes: SHORT } };
