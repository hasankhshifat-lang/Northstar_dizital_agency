// The Overthinking Pad, episode 2026-11-23: "Why Worrying Feels Like Doing Something".
// Storyboard + drawings per scene (purpose, shot, sfx per scene). Layout: row 0 = cold open (the bedroom at 11 p.m.; the ending whips back to it), rows 1-5 = chapters 1-5.
// Recurring objects: the "what if" loop, the rain dance, the 100-square grid (91%), the drop chart (calm vs worried), the shield.
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
  let t = t0 + 0.2; items.forEach((s, i) => { const yy = y + 80 + i * (o.lh || 64); const bx = L.rrect(x + 26, yy - 30, 30, 30, 4); L.INK_(bx, { closed: true, w: 2.4, amp: 0.2, passes: 1 }, (o.it ? o.it[i] : t), 0.05); if (s) t = L.TXT(s, x + 72, yy, o.size || 38, { f: 'PH' }, (o.it ? o.it[i] : t) + 0.05, null); else L.INK_(L.line(x + 72, yy - 10, x + w - 30, yy - 12), { w: 2, amp: 0.6, passes: 1 }, t, 0.1); });
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
// ---------- this episode's parts ----------
function desk(L, x, y, w, t0, o = {}) {   // a desk seen from the front: top at y, legs to y + 150
  const top = [[x, y], [x + w, y], [x + w, y + 22], [x, y + 22]];
  L.FILL(top, t0); L.MRK([top], { col: L.GRY2, w: 10 }, t0 + 0.06, 0.06); L.INK_(top, { closed: true, w: 3, amp: 0.4 }, t0, 0.14);
  L.INK_(L.line(x + 20, y + 22, x + 20, y + (o.h || 150)), { w: 3, amp: 0.2, passes: 1 }, t0 + 0.1, 0.05); L.INK_(L.line(x + w - 20, y + 22, x + w - 20, y + (o.h || 150)), { w: 3, amp: 0.2, passes: 1 }, t0 + 0.12, 0.05);
  return t0 + 0.2;
}
function laptop(L, cx, y, s, t0) {   // y = desk top
  const sc = [[cx - 90 * s, y - 10 * s], [cx - 80 * s, y - 130 * s], [cx + 80 * s, y - 130 * s], [cx + 90 * s, y - 10 * s]];
  L.FILL(sc, t0); L.MRK([sc], { col: L.GRY2, w: 10 }, t0 + 0.06, 0.06); L.INK_(sc, { closed: true, w: 3, amp: 0.3 }, t0, 0.12);
  L.INK_(L.line(cx - 110 * s, y - 4, cx + 110 * s, y - 4), { w: 4, amp: 0.2, passes: 1 }, t0 + 0.1, 0.05);
  return t0 + 0.18;
}
function envelope(L, cx, cy, s, t0, o = {}) {
  const b = L.rrect(cx - 40 * s, cy - 26 * s, 80 * s, 52 * s, 4); L.FILL(b, t0); if (o.tint) L.MRK([b], { col: o.tint, w: 8, edge: false }, t0 + 0.04, 0.04);
  L.INK_(b, { closed: true, w: 2.4, amp: 0.2, passes: 1 }, t0, 0.06); L.INK_([[cx - 40 * s, cy - 26 * s], [cx, cy + 4 * s], [cx + 40 * s, cy - 26 * s]], { w: 2.2, amp: 0.2, passes: 1 }, t0 + 0.05, 0.05);
  return t0 + 0.1;
}
function bench(L, x, y, w, h, t0) {   // a judge's bench (front panel), y = floor
  const b = [[x, y], [x, y - h], [x + w, y - h], [x + w, y]];
  L.FILL(b, t0); L.MRK([b], { col: L.GRY, w: 16, ang: 1.1 }, t0 + 0.08, 0.1); L.INK_(b, { closed: true, w: 3.4, amp: 0.4 }, t0, 0.18);
  L.INK_(L.line(x - 20, y - h, x + w + 20, y - h), { w: 5, amp: 0.3, passes: 1 }, t0 + 0.12, 0.08);
  L.INK_(L.rrect(x + w * 0.2, y - h * 0.75, w * 0.6, h * 0.45, 8), { closed: true, w: 2.4, amp: 0.3, passes: 1, alpha: 0.7 }, t0 + 0.16, 0.08);
  return t0 + 0.26;
}
function gavel(L, cx, cy, s, t0, o = {}) {
  const hd = L.rrect(cx - 40 * s, cy - 20 * s, 80 * s, 40 * s, 8 * s); L.FILL(hd, t0); L.MRK([hd], { col: L.GRYD, w: 10 }, t0 + 0.05, 0.05); L.INK_(hd, { closed: true, w: 3, amp: 0.2, passes: 1 }, t0, 0.08);
  L.INK_(L.line(cx, cy + 20 * s, cx + 30 * s, cy + 110 * s), { w: 6 * s, amp: 0.2, passes: 1 }, t0 + 0.08, 0.06);
  if (o.bang) L.sparks(cx - 10 * s, cy + 40 * s, 40 * s, 70 * s, [2.2, 2.7, 3.2], t0 + 0.15, 0.1);
  return t0 + 0.16;
}
// the famous saw-tooth: 3 sessions, each sliding from 65% to ~0; o.ts = [start of each slide], o.d = slide seconds
function sawChart(L, x, y, w, h, t0, o = {}) {
  L.INK_(L.line(x, y, x + w, y), { w: 3.4, amp: 0.4 }, t0, 0.18); L.INK_(L.line(x, y, x, y - h), { w: 3.4, amp: 0.4 }, t0 + 0.05, 0.18);
  const lv = v => y - h * v / 0.8, sw = w / 3;
  L.INK_(L.line(x - 14, lv(0.65), x + w, lv(0.65)), { w: 1.8, amp: 0.4, passes: 1, dash: [10, 10], alpha: 0.6 }, t0 + 0.2, 0.2);
  L.TXT('65%', x - 24, lv(0.65) + 12, o.ls || 36, { f: 'KB', align: 'right' }, t0 + 0.3, 0.2);
  L.TXT('0', x - 24, y + 10, o.ls || 36, { f: 'KB', align: 'right' }, t0 + 0.3, 0.1);
  if (o.ylab) L.TXT(o.ylab, x + 10, y - h - 24, o.ls || 36, { f: 'PH', col: L.INK2 }, t0 + 0.35, 0.4);
  const ts = o.ts || [t0 + 0.5, t0 + 1.5, t0 + 2.5], n = o.n ?? 3;
  for (let i = 0; i < n; i++) {
    const x0 = x + i * sw + 12, x1 = x + (i + 1) * sw - 36, P = [];
    for (let q = 0; q <= 24; q++) { const u = q / 24; P.push([x0 + (x1 - x0) * u, lv(0.65 - 0.6 * u + 0.03 * Math.sin(q * 1.7))]); }
    L.MST(P, { w: o.lw || 8, col: L.INK, amp: 0.6 }, ts[i], o.d || 1.2);
    if (i < 2 && (o.breaks ?? true)) { const bx = x + (i + 1) * sw - 12; L.INK_(L.line(bx, y - 4, bx, y - h * 0.95), { w: 2, amp: 0.4, passes: 1, dash: [8, 8], alpha: 0.6 }, (o.bt ? o.bt[i] : ts[i] + (o.d || 1.2)), 0.12); if (o.blab !== false) L.TXT(i ? 'lunch' : 'snack', bx, y + 46, (o.ls || 36) * 0.9, { f: 'PH', align: 'center', col: L.INK2 }, (o.bt ? o.bt[i] : ts[i] + (o.d || 1.2)) + 0.1, 0.2); }
  }
  return { lv, sw, end: ts[n - 1] + (o.d || 1.2) };
}
function battery(L, cx, cy, w, h, lvl, t0, o = {}) {
  const b = L.rrect(cx - w / 2, cy - h / 2, w, h, 14), nub = L.rrect(cx + w / 2, cy - h * 0.18, 18, h * 0.36, 4);
  L.FILL(b, t0); L.INK_(b, { closed: true, w: 3.4, amp: 0.4 }, t0, 0.16); L.FILL(nub, t0 + 0.1); L.INK_(nub, { closed: true, w: 3, amp: 0.2, passes: 1 }, t0 + 0.1, 0.05);
  const fx = cx - w / 2 + 12, fw = (w - 24) * lvl, fill = [[fx, cy - h / 2 + 12], [fx + fw, cy - h / 2 + 12], [fx + fw, cy + h / 2 - 12], [fx, cy + h / 2 - 12]];
  if (lvl > 0) L.MRK([fill], { col: o.col || L.YELD, w: 18, ang: 0.4 }, t0 + 0.2, 0.3);
  return t0 + 0.5;
}
function cookie(L, cx, cy, r, t0) {
  const c = []; for (let i = 0; i <= 40; i++) { const a = i / 40 * L.TAU, q = r * (1 + 0.05 * Math.sin(i * 2.7)); c.push([cx + Math.cos(a) * q, cy + Math.sin(a) * q]); }
  L.FILL(c, t0); L.MRK([c], { col: 'rgba(200,150,80,0.45)', w: 12 }, t0 + 0.05, 0.06); L.INK_(c, { closed: true, w: 2.8, amp: 0.3, passes: 1 }, t0, 0.08);
  for (let i = 0; i < 5; i++) { const a = i * 1.3, d = r * 0.5; const ch = L.ell(cx + Math.cos(a) * d, cy + Math.sin(a) * d, r * 0.12, r * 0.1, 0, L.TAU, 10); L.MRK([ch], { col: L.INKM(0.85), w: 5, edge: false, op: 'source-over' }, t0 + 0.08 + i * 0.02, 0.03); }
  return t0 + 0.2;
}
function radish(L, cx, cy, s, t0) {
  const b = L.bez([cx, cy - 30 * s], [cx - 40 * s, cy - 30 * s], [cx - 30 * s, cy + 20 * s], [cx, cy + 50 * s]).concat(L.bez([cx, cy + 50 * s], [cx + 30 * s, cy + 20 * s], [cx + 40 * s, cy - 30 * s], [cx, cy - 30 * s]));
  L.FILL(b, t0); L.MRK([b], { col: 'rgba(214,80,110,0.45)', w: 10 }, t0 + 0.05, 0.05); L.INK_(b, { closed: true, w: 2.6, amp: 0.3, passes: 1 }, t0, 0.08);
  for (const d of [-14, 0, 14]) L.INK_(L.quad([cx, cy - 30 * s], [cx + d * s, cy - 50 * s], [cx + d * 1.6 * s, cy - 70 * s]), { w: 2.6, amp: 0.3, passes: 1 }, t0 + 0.08, 0.04);
  return t0 + 0.16;
}
function lab(L, cx, cy, s, t0, o = {}) {   // a tiny lab: a flask in a box (one lab in a multi-lab study)
  const bx = L.rrect(cx - 34 * s, cy - 34 * s, 68 * s, 68 * s, 8 * s); L.FILL(bx, t0); if (o.tint) L.MRK([bx], { col: o.tint, w: 8, edge: false }, t0 + 0.03, 0.03); L.INK_(bx, { closed: true, w: 2.2, amp: 0.2, passes: 1 }, t0, 0.05);
  L.INK_([[cx - 6 * s, cy - 22 * s], [cx - 6 * s, cy - 4 * s], [cx - 20 * s, cy + 22 * s], [cx + 20 * s, cy + 22 * s], [cx + 6 * s, cy - 4 * s], [cx + 6 * s, cy - 22 * s]], { w: 2.2, amp: 0.2, passes: 1 }, t0 + 0.03, 0.05);
  return t0 + 0.08;
}
function labGrid(L, x, y, n, cols, gap, t0, dt, o = {}) { for (let i = 0; i < n; i++) lab(L, x + (i % cols) * gap, y + Math.floor(i / cols) * gap, o.s || 0.8, t0 + i * dt, o); return t0 + n * dt; }
function crowd(L, x, y, n, cols, gap, t0, dt, o = {}) {   // a block of tiny heads (people in a study)
  for (let i = 0; i < n; i++) { const cx = x + (i % cols) * gap, cy = y + Math.floor(i / cols) * gap, c = L.ell(cx, cy, gap * 0.3, gap * 0.32, 0, L.TAU, 14), t = t0 + i * dt; L.FILL(c, t); L.MRK([c], { col: L.GRY, w: 6, edge: false }, t, 0.02); L.INK_(c, { closed: true, w: 1.6, amp: 0.2, passes: 1 }, t, 0.03); }
  return t0 + n * dt;
}
// the fork: a steep winding "think" path and a flat straight "default" path
function fork(L, x, y, w, t0, o = {}) {
  L.INK_(L.line(x, y, x + w * 0.3, y), { w: 4, amp: 0.4 }, t0, 0.12);
  const hard = L.bez([x + w * 0.3, y], [x + w * 0.5, y - 40], [x + w * 0.45, y - 220], [x + w * 0.7, y - 260]).concat(L.bez([x + w * 0.7, y - 260], [x + w * 0.85, y - 280], [x + w * 0.8, y - 340], [x + w, y - 360]));
  L.INK_(hard, { w: 4, amp: 0.6 }, t0 + 0.15, 0.3); L.TXT(o.hard || 'think it through', x + w * 0.75, y - 400, o.ls || 40, { f: 'PH', align: 'center', col: L.INK2 }, t0 + 0.4, 0.4);
  L.MST(L.line(x + w * 0.3, y, x + w, y), { w: 18, col: o.easyCol || L.YEL }, t0 + (o.easyT || 0.5), 0.3); L.inkArrow([[x + w * 0.3, y], [x + w + 30, y]], { w: 4 }, t0 + (o.easyT || 0.5), 0.25);
  L.TXT(o.easy || 'the default', x + w * 0.8, y + 60, o.ls || 40, { f: 'KB', align: 'center' }, t0 + (o.easyT || 0.5) + 0.2, 0.4);
  return t0 + (o.easyT || 0.5) + 0.6;
}
function soap(L, cx, cy, s, t0) {   // a wall soap dispenser with a sensor dot
  const b = L.rrect(cx - 50 * s, cy - 80 * s, 100 * s, 160 * s, 14 * s); L.FILL(b, t0); L.MRK([b], { col: L.GRY2, w: 12 }, t0 + 0.05, 0.06); L.INK_(b, { closed: true, w: 3, amp: 0.3 }, t0, 0.12);
  L.INK_(L.rrect(cx - 16 * s, cy + 80 * s, 32 * s, 20 * s, 4), { closed: true, w: 2.4, amp: 0.2, passes: 1 }, t0 + 0.1, 0.05);
  const d = L.ell(cx, cy - 40 * s, 10 * s, 10 * s, 0, L.TAU, 14); L.MRK([d], { col: L.YELD, w: 8, edge: false }, t0 + 0.15, 0.05); L.INK_(d, { closed: true, w: 2, amp: 0.1, passes: 1 }, t0 + 0.15, 0.04);
  return t0 + 0.2;
}
function rxPad(L, cx, cy, s, t0) {
  const b = [[cx - 70 * s, cy - 90 * s], [cx + 70 * s, cy - 90 * s], [cx + 70 * s, cy + 90 * s], [cx - 70 * s, cy + 90 * s]]; L.FILL(b, t0); L.dropShadow(b, 6, 7, t0 + 0.08, 0.05); L.INK_(b, { closed: true, w: 2.8, amp: 0.3 }, t0, 0.1);
  L.TXT('Rx', cx - 30 * s, cy - 30 * s, 50 * s, { f: 'KB', align: 'center' }, t0 + 0.1, 0.15);
  for (let i = 0; i < 3; i++) L.INK_(L.line(cx - 50 * s, cy + 10 * s + i * 24 * s, cx + 50 * s, cy + 10 * s + i * 24 * s), { w: 1.8, amp: 0.5, passes: 1, alpha: 0.7 }, t0 + 0.2 + i * 0.04, 0.05);
  return t0 + 0.3;
}
function pill(L, cx, cy, s, t0) { const p = L.rrect(cx - 40 * s, cy - 16 * s, 80 * s, 32 * s, 16 * s); L.FILL(p, t0); L.MRK([[[cx - 40 * s, cy - 16 * s], [cx, cy - 16 * s], [cx, cy + 16 * s], [cx - 40 * s, cy + 16 * s]]], { col: L.YEL, w: 10, edge: false }, t0 + 0.04, 0.04); L.INK_(p, { closed: true, w: 2.6, amp: 0.2, passes: 1 }, t0, 0.06); L.INK_(L.line(cx, cy - 16 * s, cx, cy + 16 * s), { w: 2, amp: 0.1, passes: 1 }, t0 + 0.05, 0.03); return t0 + 0.1; }
function virus(L, cx, cy, r, t0) { const c = L.ell(cx, cy, r, r, 0, L.TAU, 24); L.FILL(c, t0); L.MRK([c], { col: L.GRY, w: 8 }, t0 + 0.04, 0.04); L.INK_(c, { closed: true, w: 2.6, amp: 0.3, passes: 1 }, t0, 0.06); for (let i = 0; i < 8; i++) { const a = i / 8 * L.TAU; L.INK_(L.line(cx + Math.cos(a) * r, cy + Math.sin(a) * r, cx + Math.cos(a) * r * 1.4, cy + Math.sin(a) * r * 1.4), { w: 2.4, amp: 0.1, passes: 1 }, t0 + 0.06 + i * 0.01, 0.02); } return t0 + 0.16; }
function suit(L, cx, cy, s, t0, o = {}) {   // a suit on a hanger
  L.INK_([[cx, cy - 20 * s], [cx, cy - 40 * s], [cx + 12 * s, cy - 50 * s]], { w: 2.4, amp: 0.2, passes: 1 }, t0, 0.04); L.INK_([[cx - 70 * s, cy + 20 * s], [cx, cy - 20 * s], [cx + 70 * s, cy + 20 * s]], { w: 2.8, amp: 0.2, passes: 1 }, t0 + 0.04, 0.05);
  const b = [[cx - 70 * s, cy + 20 * s], [cx - 20 * s, cy + 10 * s], [cx, cy + 90 * s], [cx + 20 * s, cy + 10 * s], [cx + 70 * s, cy + 20 * s], [cx + 66 * s, cy + 180 * s], [cx - 66 * s, cy + 180 * s]];
  L.FILL(b, t0 + 0.08); L.MRK([b], { col: o.col || L.GRY, w: 14 }, t0 + 0.12, 0.08); L.INK_(b, { closed: true, w: 2.8, amp: 0.3 }, t0 + 0.08, 0.12);
  return t0 + 0.24;
}
function moon(L, cx, cy, r, t0) { const P = L.ell(cx, cy, r, r, Math.PI * 0.5, Math.PI * 1.5, 30).concat(L.ell(cx + r * 0.35, cy, r * 0.75, r * 0.95, Math.PI * 1.5, Math.PI * 0.5, 30)); L.FILL(P, t0); L.MRK([P], { col: L.YEL, w: 10 }, t0 + 0.05, 0.05); L.INK_(P, { closed: true, w: 2.6, amp: 0.2, passes: 1 }, t0, 0.1); return t0 + 0.16; }
function plate(L, cx, cy, s, t0) { const o1 = L.ell(cx, cy, 90 * s, 34 * s, 0, L.TAU, 36), o2 = L.ell(cx, cy, 60 * s, 22 * s, 0, L.TAU, 30); L.FILL(o1, t0); L.INK_(o1, { closed: true, w: 2.8, amp: 0.3 }, t0, 0.1); L.INK_(o2, { closed: true, w: 2, amp: 0.2, passes: 1 }, t0 + 0.08, 0.06); L.INK_(L.line(cx - 120 * s, cy - 30 * s, cx - 120 * s, cy + 30 * s), { w: 3, amp: 0.1, passes: 1 }, t0 + 0.1, 0.04); L.INK_(L.line(cx + 120 * s, cy - 30 * s, cx + 120 * s, cy + 30 * s), { w: 3, amp: 0.1, passes: 1 }, t0 + 0.12, 0.04); return t0 + 0.18; }
function spinner(L, cx, cy, r, t0) { for (let i = 0; i < 8; i++) { const a = i / 8 * L.TAU; L.INK_(L.line(cx + Math.cos(a) * r * 0.5, cy + Math.sin(a) * r * 0.5, cx + Math.cos(a) * r, cy + Math.sin(a) * r), { w: 5, amp: 0.1, passes: 1, alpha: 0.25 + i * 0.09 }, t0 + i * 0.05, 0.04); } return t0 + 0.45; }
function screen(L, x, y, w, h, t0) { const b = L.rrect(x, y, w, h, 12); L.FILL(b, t0); L.INK_(b, { closed: true, w: 3, amp: 0.4 }, t0, 0.14); L.INK_(L.line(x + w / 2, y + h, x + w / 2, y + h + 50), { w: 3, amp: 0.2, passes: 1 }, t0 + 0.1, 0.04); L.INK_(L.line(x + w / 2 - 60, y + h + 50, x + w / 2 + 60, y + h + 50), { w: 3, amp: 0.2, passes: 1 }, t0 + 0.12, 0.04); return t0 + 0.2; }

// ---------- this episode's parts ----------
const LONG = {};
const def = (F, id, block, o, draw) => { F[id] = { block, ...o, draw }; };
// a "what if?" loop: n small thought bubbles on a ring, linked by arrows; the last arrow returns to the first
function whatIfLoop(L, cx, cy, r, t0, dt, o = {}) {
  const labels = o.labels || ['what if...?', 'what if...?', 'what if...?', 'what if...?'], n = labels.length, sz = o.size || 34;
  const pos = i => { const a = -Math.PI / 2 + i / n * L.TAU; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r * (o.squash || 0.62)]; };
  let t = t0;
  labels.forEach((s, i) => { const [px, py] = pos(i), w = Math.max(180, s.length * sz * 0.5), tt = t0 + i * dt; L.bubble(px - w / 2, py - sz * 1.1, w, sz * 2.2, tt, { text: s, size: sz, thought: true, shadow: false }); t = tt + 0.3; });
  for (let i = 0; i < n; i++) { const a0 = -Math.PI / 2 + (i + 0.3) / n * L.TAU, a1 = -Math.PI / 2 + (i + 0.7) / n * L.TAU, P = []; for (let q = 0; q <= 12; q++) { const a = a0 + (a1 - a0) * q / 12; P.push([cx + Math.cos(a) * r * 1.05, cy + Math.sin(a) * r * (o.squash || 0.62) * 1.05]); } L.inkArrow(P, { w: 3.4, col: i === n - 1 && o.hot ? L.YELD : L.INK }, t0 + i * dt + dt * 0.6, 0.2); }
  return t0 + n * dt + 0.3;
}
// a 10 × 10 grid of small squares; the first `hit` squares get a yellow tick (came true), the rest a grey cross
function grid100(L, x, y, cell, t0, d, o = {}) {
  const hit = o.hit ?? 9; let t = t0;
  for (let i = 0; i < 100; i++) {
    const cx = x + (i % 10) * cell, cy = y + Math.floor(i / 10) * cell, tt = t0 + d * i / 100, b = L.rrect(cx + 4, cy + 4, cell - 8, cell - 8, 4);
    L.INK_(b, { closed: true, w: 2, amp: 0.2, passes: 1 }, tt, 0.02);
    if (i >= 100 - hit) L.MRK([b], { col: L.YEL, w: 10, edge: false }, tt + 0.02, 0.02);
    else L.INK_(L.line(cx + 12, cy + 12, cx + cell - 12, cy + cell - 12), { w: 2, amp: 0.1, passes: 1, alpha: 0.45 }, tt + 0.02, 0.01);
    t = tt;
  }
  return t + 0.1;
}
// a heart-rate trace: flat, then a spike of height h at the cue time
function trace(L, x, y, w, h, t0, d, o = {}) {
  const P = []; for (let q = 0; q <= 80; q++) { const u = q / 80, sp = Math.abs(u - 0.6) < 0.05 ? Math.sin((u - 0.55) / 0.1 * Math.PI) * h : 0, sm = Math.abs(u - 0.25) < 0.02 ? 10 : 0; P.push([x + w * u, y - sp - sm + Math.sin(q * 1.3) * 3]); }
  return L.MST(P, { w: o.w || 5, col: o.col || L.INK, amp: 0.4 }, t0, d);
}
// a car seen from the side (x = rear, y = road); returns the brake-foot position
function car(L, x, y, w, t0, o = {}) {
  const body = [[x, y - 40], [x, y - 110], [x + w * 0.25, y - 120], [x + w * 0.38, y - 190], [x + w * 0.72, y - 190], [x + w * 0.85, y - 120], [x + w, y - 110], [x + w, y - 40]];
  L.FILL(body, t0); L.MRK([body], { col: o.you ? L.YEL : L.GRY2, w: 14 }, t0 + 0.1, 0.12); L.INK_(body, { closed: true, w: 3.2, amp: 0.5 }, t0, 0.24);
  for (const wx of [x + w * 0.2, x + w * 0.8]) { const c = L.ell(wx, y - 34, 34, 34, 0, L.TAU, 24); L.FILL(c, t0 + 0.2); L.MRK([c], { col: L.INKM(0.8), w: 8, edge: false, op: 'source-over' }, t0 + 0.22, 0.05); L.INK_(c, { closed: true, w: 3, amp: 0.2, passes: 1 }, t0 + 0.2, 0.06); }
  const win = [[x + w * 0.42, y - 120], [x + w * 0.45, y - 175], [x + w * 0.68, y - 175], [x + w * 0.78, y - 120]]; L.FILL(win, t0 + 0.25); L.INK_(win, { closed: true, w: 2.4, amp: 0.2, passes: 1 }, t0 + 0.25, 0.08);
  return t0 + 0.35;
}
// a two-line "emotion over time" chart: calm line high then a big drop, worried line low then a small drop
function dropChart(L, x, y, w, h, t0, o = {}) {
  L.INK_(L.line(x, y, x + w, y), { w: 3, amp: 0.3 }, t0, 0.2); L.INK_(L.line(x, y, x, y - h), { w: 3, amp: 0.3 }, t0 + 0.1, 0.2);
  L.TXT('feeling okay', x + 10, y - h - 24, 32, { f: 'PH', col: L.INK2 }, t0 + 0.2, 0.3); L.TXT('time  →', x + w - 60, y + 50, 30, { f: 'PH', align: 'center', col: L.INK2 }, t0 + 0.25, 0.2);
  const ev = x + w * 0.55; L.INK_(L.line(ev, y - 4, ev, y - h), { w: 2, amp: 0.3, passes: 1, dash: [8, 8], alpha: 0.6 }, t0 + 0.3, 0.2);
  if (o.evLabel !== false) L.TXT(o.evLabel || 'bad news', ev, y + 50, 32, { f: 'KB', align: 'center' }, t0 + 0.35, 0.3);
  const ln = (hi, lo, col, tt, wd) => { const P = [[x + 10, y - h * hi], [ev - 10, y - h * hi], [ev + 30, y - h * lo], [x + w - 10, y - h * lo]]; return L.MST(P, { w: wd, col, amp: 0.5 }, tt, 0.6); };
  if (o.calm !== false) { ln(0.85, 0.12, L.GRYD, o.tc ?? t0 + 0.5, 9); L.TXT('calm', x + w * 0.2, y - h * 0.85 - 22, 34, { f: 'KB', align: 'center' }, (o.tc ?? t0 + 0.5) + 0.3, 0.3); }
  if (o.worry !== false) { ln(0.32, 0.12, L.YELD, o.tw ?? t0 + 1.0, 11); L.TXT('worried', x + w * 0.2, y - h * 0.32 - 22, 34, { f: 'KB', align: 'center' }, (o.tw ?? t0 + 1.0) + 0.3, 0.3); }
  return { ev };
}
// a bedroom at 11 p.m. (cold open + callback): bed, the clock, the window with the moon. returns the bed's head
function bedroom(L, x, y, t0, o = {}) {
  const B = bed(L, x + 140, y + 820, 640, t0, { you: true, kind: o.kind || 'worry', look: o.look || [0.4, -1], k: o.k || 0.9 });
  const wn = L.rrect(x + 1080, y + 120, 300, 240, 10); L.FILL(wn, t0 + 0.3); L.INK_(wn, { closed: true, w: 3, amp: 0.4 }, t0 + 0.3, 0.12); L.INK_(L.line(x + 1230, y + 120, x + 1230, y + 360), { w: 2.4, amp: 0.2, passes: 1 }, t0 + 0.38, 0.04);
  moon(L, x + 1160, y + 210, 36, t0 + 0.42);
  L.clock(x + 1000, y + 620, 60, t0 + 0.5); L.TXT('11:00 PM', x + 1000, y + 720, 36, { f: 'KB', align: 'center' }, t0 + 0.6, 0.3);
  return B;
}
function calendar(L, x, y, w, h, n, cols, t0, d, o = {}) {   // a month grid; o.mark(i) → mark style
  const b = L.rrect(x, y, w, h, 14); L.FILL(b, t0); L.dropShadow(b, 7, 8, t0 + 0.1, 0.06); L.INK_(b, { closed: true, w: 3, amp: 0.4 }, t0, 0.16);
  L.MRK([[[x, y], [x + w, y], [x + w, y + 60], [x, y + 60]]], { col: L.GRY2, w: 14, edge: false }, t0 + 0.1, 0.08); L.TXT(o.title || 'DAY', x + w / 2, y + 44, 34, { f: 'KB', align: 'center' }, t0 + 0.15, 0.2);
  const rows = Math.ceil(n / cols), cw = w / cols, chh = (h - 70) / rows;
  for (let i = 0; i < n; i++) { const cx = x + (i % cols) * cw, cy = y + 66 + Math.floor(i / cols) * chh, tt = t0 + 0.2 + d * i / n; L.INK_(L.rrect(cx + 5, cy + 3, cw - 10, chh - 8, 4), { closed: true, w: 1.6, amp: 0.15, passes: 1, alpha: 0.7 }, tt, 0.02); if (o.mark) o.mark(i, cx + cw / 2, cy + chh / 2 - 2, tt + 0.03, Math.min(cw, chh)); }
  return t0 + 0.3 + d;
}
function brick(L, cx, cy, w, h, t0, o = {}) { const b = L.rrect(cx - w / 2, cy - h / 2, w, h, 8); L.FILL(b, t0); L.MRK([b], { col: o.col || L.GRY2, w: 12 }, t0 + 0.06, 0.06); L.INK_(b, { closed: true, w: 3, amp: 0.3 }, t0, 0.1); if (o.text) L.TXT(o.text, cx, cy + (o.size || 34) * 0.35, o.size || 34, { f: o.f || 'KB', align: 'center' }, t0 + 0.12, 0.3); return t0 + 0.2; }
function shield(L, cx, cy, s, t0, o = {}) { const P = L.bez([cx, cy - 120 * s], [cx + 60 * s, cy - 100 * s], [cx + 100 * s, cy - 110 * s], [cx + 100 * s, cy - 110 * s]).concat(L.bez([cx + 100 * s, cy - 110 * s], [cx + 110 * s, cy + 10 * s], [cx + 60 * s, cy + 80 * s], [cx, cy + 120 * s])).concat(L.bez([cx, cy + 120 * s], [cx - 60 * s, cy + 80 * s], [cx - 110 * s, cy + 10 * s], [cx - 100 * s, cy - 110 * s])).concat(L.bez([cx - 100 * s, cy - 110 * s], [cx - 100 * s, cy - 110 * s], [cx - 60 * s, cy - 100 * s], [cx, cy - 120 * s])); L.FILL(P, t0); L.MRK([P], { col: o.col || L.YEL, w: 16 }, t0 + 0.1, 0.12); L.INK_(P, { closed: true, w: 3.4, amp: 0.4 }, t0, 0.2); return t0 + 0.3; }
function rainDance(L, x, y, s, t0, o = {}) {   // a dancer with arms up under a rain cloud; the cloud rains at o.rainT
  const P = L.person(x, y, s, t0, { pose: 'arms_up', kind: o.kind || 'grin', look: [0, -1], hair: o.hair || 'tuft', k: 0.6, you: o.you });
  L.motion(x - 90 * s, y - 200 * s, 40 * s, 3, t0 + 0.3); L.motion(x + 60 * s, y - 200 * s, 40 * s, 3, t0 + 0.35);
  cloud(L, x, y - 380 * s, 300 * s, 120 * s, o.cloudT ?? t0 + 0.4, { tint: L.GRY2 });
  if (o.rainT) for (let i = 0; i < 7; i++) L.INK_(L.line(x - 110 * s + i * 36 * s, y - 310 * s, x - 120 * s + i * 36 * s, y - 250 * s), { w: 3, amp: 0.2, passes: 1 }, o.rainT + i * 0.05, 0.05);
  return P;
}
// a little bar of "relief": an arrow up from a tense dot to a calm dot
function chain(L, x, y, n, gap, t0, dt) { let t = t0; for (let i = 0; i < n; i++) { const c = L.ell(x + i * gap, y, gap * 0.36, gap * 0.22, 0, L.TAU, 24); L.INK_(c, { closed: true, w: 4, amp: 0.3, passes: 1 }, t0 + i * dt, 0.08); t = t0 + i * dt + 0.08; } return t; }
function sun(L, cx, cy, r, t0) { const c = L.ell(cx, cy, r, r, 0, L.TAU, 30); L.FILL(c, t0); L.MRK([c], { col: L.YEL, w: 14 }, t0 + 0.05, 0.1); L.INK_(c, { closed: true, w: 3, amp: 0.3 }, t0, 0.1); L.sparks(cx, cy, r * 1.25, r * 1.75, [0, 0.8, 1.6, 2.4, 3.2, 4, 4.8, 5.6], t0 + 0.1, 0.15); return t0 + 0.3; }

// ===== cold open: 11 p.m. =====
def(LONG, 'hook1', blk(0, 1), { purpose: 'hook: the night-before worry loop, shown before it is named', shot: 'opens close on the wide-eyed face in bed from frame 0, pulls up and back as the three "what if" bubbles appear over the bed (the loop forms), holds wide on "freeze"', sfx: 'room tone, a clock tick; a soft pop per "what if"; tick stops on "freeze"', noAutoCam: true }, (S, L) => {
  const B = blk(0, 1), [x, y] = B, c = S.fit(B);
  S.cam(S.t0 - 0.01, x + 260, y + 640, 2.3, 0.01); S.cam(S.at('running') - 0.6, x + 560, y + 520, 1.25, 1.6, 'io'); S.cam(S.at('freeze') - 1.6, c.x, c.y, c.z * 1.02, 1.4, 'io');
  const H = bedroom(L, x, y, S.t0 - 1.4, { kind: 'worry', look: [0.3, -1] });
  L.TXT('tomorrow:', x + 560, y + 120, 44, { f: 'KB', align: 'center' }, S.at('tomorrow') - 0.2, 0.4);
  ['the big meeting', 'the test results', 'the conversation'].forEach((s, i) => L.TXT(s, x + 560, y + 190 + i * 56, 38, { f: 'PH', align: 'center', col: L.INK2 }, S.at(['meeting', 'results', 'conversation'][i]) - 0.4, 0.5));
  const qs = [['what if they ask...?', 'numbers'], ['what if it\'s bad news?', 'news'], ['what if I freeze?', 'freeze']];
  qs.forEach(([s, cue], i) => { const bx = x + 140 + i * 300, by = y + 420 - (i % 2) * 40; L.bubble(bx, by, 290, 90, S.at(cue) - 0.8, { text: s, size: 26, thought: true, tail: [H.head[0] + 40, H.head[1] - 60], shadow: false }); });
  L.react({ head: H.head }, S.at('freeze') - 0.1, { kind: 'shock', look: [0.3, -1] });
});
def(LONG, 'hook2', blk(0, 2), { purpose: 'the feeling: exhausting but "responsible"; stopping feels unsafe', shot: 'pan right; "you" at a desk-like pillow pile with a hard hat, a clipboard of worries; the gap in a fence where "something bad" would slip through', sfx: 'pencil scratch on "working"; a low pluck on "slip through"' }, (S, L) => {
  const [x, y] = blk(0, 2);
  const P = L.person(x + 380, y + 840, 1.7, S.t0 + 0.1, { pose: 'hold', you: true, kind: 'bored', look: [1, 0.3], hair: 'tuft', k: 0.8 });
  L.sheet(P.hand[1][0] - 70, P.hand[1][1] - 110, 140, 170, S.t0 + 0.6, { lines: 5 });
  L.TXT('exhausting', x + 380, y + 230, 48, { f: 'KB', align: 'center' }, S.at('exhausting') - 0.3, 0.4);
  L.react(P, S.at('responsible') - 0.2, { kind: 'proud', look: [1, 0.2] });
  tag(L, x + 380, y + 120, 'RESPONSIBLE', 54, S.at('responsible') - 0.1, { tint: L.YEL });
  for (let i = 0; i < 6; i++) { if (i === 3) continue; const fx = x + 820 + i * 120; L.INK_(L.line(fx, y + 820, fx, y + 560), { w: 4, amp: 0.3, passes: 1 }, S.at('stopped') - 0.6 + i * 0.05, 0.06); }
  L.INK_(L.line(x + 800, y + 620, x + 1460, y + 620), { w: 3, amp: 0.4, passes: 1 }, S.at('stopped') - 0.2, 0.15); L.INK_(L.line(x + 800, y + 740, x + 1460, y + 740), { w: 3, amp: 0.4, passes: 1 }, S.at('stopped') - 0.1, 0.15);
  cloud(L, x + 1180, y + 380, 200, 110, S.at('bad') - 0.3, { tint: L.GRY2 }); L.TXT('something bad', x + 1180, y + 392, 30, { f: 'KB', align: 'center' }, S.at('bad') - 0.1, 0.3);
  L.inkArrow([[x + 1180, y + 450], [x + 1180, y + 690]], { w: 4 }, S.at('slip') - 0.2, 0.3);
});
def(LONG, 'hook3', blk(0, 3), { purpose: 'the surprise: tracked for a month, ~9 in 10 never came true; the question', shot: 'pan right; ten worry slips drop into a box, nine get crossed out, one is ticked; push on the question', sfx: 'paper flicks; nine soft cross-outs; a "hm" pluck on the question' }, (S, L) => {
  const [x, y] = blk(0, 3);
  L.TXT('tracked for a month', x + 420, y + 120, 48, { f: 'KB', align: 'center' }, S.at('tracked') - 0.3, 0.6);
  for (let i = 0; i < 10; i++) { const cx = x + 140 + (i % 5) * 120, cy = y + 260 + Math.floor(i / 5) * 170; L.sheet(cx, cy, 100, 130, S.at('worries') - 0.4 + i * 0.05, { lines: 3 }); if (i < 9) L.cross(cx + 50, cy + 65, 2.2, S.at('nine') + i * 0.08); else L.check(cx + 50, cy + 65, 2.2, S.at('true') + 0.2, { col: L.YELD }); }
  L.TXT('9 in 10 never came true', x + 420, y + 680, 46, { f: 'KB', align: 'center' }, S.at('never') - 0.2, 0.6);
  L.head(x + 1180, y + 420, 140, S.at('why') - 0.8, { you: true, kind: 'think', look: [-0.5, -0.3], k: 0.8 });
  L.qmark(x + 1380, y + 260, 120, S.at('useful') - 0.4);
  L.TXT('so why does it feel useful?', x + 1180, y + 720, 48, { f: 'KB', align: 'center' }, S.at('useful') - 0.6, 0.8);
});
def(LONG, 'hook4', blk(0, 4), { purpose: 'the promise: worry does do something, not what you think; what it does + three things that help', shot: 'pan right; the label "prediction" is crossed out and a shield is drawn in its place; three numbered slots below', sfx: 'pen strike; a kalimba on "help"' }, (S, L) => {
  const [x, y] = blk(0, 4);
  L.TXT('worry does do something', x + 800, y + 120, 60, { f: 'KB', align: 'center' }, S.at('something') - 0.6, 0.8);
  L.TXT('predicting?', x + 440, y + 380, 60, { f: 'KB', align: 'center' }, S.at('just') - 0.2, 0.5); L.INK_(L.line(x + 280, y + 360, x + 600, y + 370), { w: 6, amp: 0.4, passes: 1 }, S.at('think') - 0.1, 0.2);
  shield(L, x + 1100, y + 380, 1.2, S.at('actually') - 0.6); L.qmark(x + 1100, y + 410, 120, S.at('actually') - 0.2);
  [0, 1, 2].forEach(i => { numDot(L, x + 480 + i * 320, y + 700, i + 1, S.at('three') + i * 0.25, 44); L.INK_(L.line(x + 540 + i * 320, y + 720, x + 720 + i * 320, y + 720), { w: 2, amp: 0.4, passes: 1, alpha: 0.6 }, S.at('help') + i * 0.1, 0.1); });
  L.TXT('three things that help', x + 800, y + 840, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('help') - 0.2, 0.5);
});
def(LONG, 'sting', blk(0, 5, 1300, 600), { purpose: 'channel sting (≤ 2 s, after the hook)', shot: 'whip right across empty dots to the banner', sfx: 'paper whoosh + one kalimba note', ease: 'q', move: 0.6 }, (S, L) => {
  const [x, y] = blk(0, 5, 1300, 600);
  L.ribbon(x + 650, y + 280, 860, 120, 'THE OVERTHINKING PAD', 64, S.t0 + 0.2, { d: 0.35, td: 0.9 });
  L.MST(L.bez([x + 520, y + 420], [x + 600, y + 520], [x + 740, y + 380], [x + 800, y + 470]), { w: 4, col: L.INK, amp: 1 }, S.t0 + 1.2, 0.4);
});
const chapter = (F, id, row, n, title) => def(F, id, banner(row), { purpose: `chapter ${n} title`, shot: 'whip across the page to the numbered banner (a jump in thought)', sfx: 'paper whoosh, kalimba note', ease: 'q', move: 0.75 }, (S, L) => {
  const [x, y] = banner(row);
  const w = Math.min(960, Math.max(560, title.length * 44));
  numDot(L, x + 180, y + 280, n, S.t0 + 0.25, 64);
  L.ribbon(x + 370 + w / 2, y + 280, w, 120, title, 70, S.t0 + 0.45, { d: 0.3, td: 0.9 });
});

// ===== chapter 1: what worry is =====
chapter(LONG, 'ch1', 1, 1, 'WHAT WORRY IS');
def(LONG, 'c1a', blk(1, 1), { purpose: 'who: Thomas Borkovec, Penn State, early 1980s, studying heavy worriers', shot: 'pan right from the banner; the researcher with a clipboard faces a row of worried people; slow push', sfx: 'pen; page tap on "definition"' }, (S, L) => {
  const [x, y] = blk(1, 1);
  tag(L, x + 800, y + 110, 'EARLY 1980s · PENN STATE', 52, S.at('nineteen') - 0.2);
  const R = L.person(x + 300, y + 840, 1.6, S.at('borkovec') - 0.6, { pose: 'hold', kind: 'think', look: [1, 0], hair: 'curly', k: 0.7 });
  L.sheet(R.hand[1][0] - 50, R.hand[1][1] - 80, 110, 130, S.at('borkovec') - 0.1, { lines: 4 });
  L.TXT('Thomas Borkovec', x + 300, y + 330, 44, { f: 'KB', align: 'center' }, S.at('thomas') - 0.2, 0.6);
  for (let i = 0; i < 4; i++) { const P = L.person(x + 760 + i * 200, y + 840, 1.25, S.at('worried') - 0.5 + i * 0.12, { kind: 'worry', look: [-1, 0.2], hair: ['tuft', 'long', 'cap', 'messy'][i], k: 0.4 }); L.sweat && 0; cloud(L, P.head[0], P.head[1] - 120, 110, 56, S.at('lot') + i * 0.08, { tint: L.GRY }); }
  L.TXT('a definition still used today', x + 1060, y + 330, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('definition') - 0.3, 0.7);
});
def(LONG, 'c1b', blk(1, 2), { purpose: 'the definition, written as a card: chain of thoughts and images, negative, hard to control; mental problem-solving on an uncertain, maybe bad outcome', shot: 'pan right; the card is written line by line, a chain of links drawn above it; push on the last line', sfx: 'a chain clink on "chain"; pen' }, (S, L) => {
  const [x, y] = blk(1, 2);
  chain(L, x + 360, y + 120, 9, 110, S.at('chain') - 0.3, 0.06);
  L.box(x + 140, y + 220, 1320, 620, S.t0 + 0.2, 0.3, { r: 22 });
  const rows = [['a chain of thoughts & images', 'chain'], ['loaded with negative feeling', 'negative'], ['relatively hard to control', 'control'], ['= trying to solve a problem in your head', 'solve'], ['outcome uncertain... might be bad', 'uncertain']];
  rows.forEach(([s, cue], i) => L.TXT(s, x + 200, y + 320 + i * 110, i === 3 ? 52 : 46, { f: i === 3 ? 'KB' : 'PH', col: i === 3 ? L.INK : L.INK2 }, S.at(cue) - 0.3, 0.8));
  L.MRK([[[x + 190, y + 610], [x + 1240, y + 610], [x + 1240, y + 650], [x + 190, y + 650]]], { col: L.YEL, w: 20, edge: false }, S.at('solve') + 0.6, 0.4);
  L.TXT('Borkovec et al., 1983', x + 1400, y + 800, 30, { f: 'PH', align: 'right', col: L.INK2 }, S.at('wrote') - 0.2, 0.4);
});
def(LONG, 'c1c', blk(1, 3), { purpose: 'why it feels like work: same machinery as planning (scan the future, spot dangers, rehearse)', shot: 'pan right; "you" with a telescope looking at a road ahead; danger signs drawn on the road; a speech bubble rehearsal', sfx: 'telescope click; three pen taps for the dangers' }, (S, L) => {
  const [x, y] = blk(1, 3);
  const P = L.person(x + 260, y + 820, 1.6, S.t0 + 0.1, { pose: 'hold', you: true, kind: 'think', look: [1, -0.2], hair: 'tuft', k: 0.7 });
  const tx = P.hand[1][0], ty = P.hand[1][1] - 30; L.INK_([[tx - 10, ty + 10], [tx + 160, ty - 40], [tx + 166, ty - 18], [tx - 4, ty + 32]], { closed: true, w: 3, amp: 0.2 }, S.at('scan') - 0.6, 0.15);
  L.TXT('feels like work', x + 300, y + 150, 50, { f: 'KB', align: 'center' }, S.at('work') - 0.3, 0.5);
  L.INK_(L.bez([x + 600, y + 820], [x + 900, y + 700], [x + 1100, y + 620], [x + 1500, y + 560]), { w: 3, amp: 0.6 }, S.at('future') - 0.5, 0.4); L.INK_(L.bez([x + 700, y + 860], [x + 1000, y + 760], [x + 1200, y + 680], [x + 1500, y + 640]), { w: 3, amp: 0.6 }, S.at('future') - 0.3, 0.4);
  [[900, 690], [1120, 620], [1330, 580]].forEach(([dx, dy], i) => { const t = S.at('dangers') - 0.3 + i * 0.15; L.INK_([[x + dx, y + dy - 90], [x + dx + 50, y + dy], [x + dx - 50, y + dy]], { closed: true, w: 3, amp: 0.2 }, t, 0.1); L.TXT('!', x + dx, y + dy - 14, 50, { f: 'KB', align: 'center' }, t + 0.1, 0.1); });
  tag(L, x + 1050, y + 200, 'same machinery as planning', 44, S.at('planning') - 0.4, { tint: L.YEL });
  L.bubble(x + 840, y + 300, 380, 100, S.at('rehearse') - 0.4, { text: '"so, about the numbers..."', size: 28, shadow: false });
});
def(LONG, 'c1d', blk(1, 4), { purpose: 'the difference: planning ends at a next step; worry reaches the last what-if and loops back', shot: 'pan right; left: a straight arrow to a ticked step box; right: the what-if ring drawn with the last arrow back to the first (yellow)', sfx: 'a check tick; then a circling whoosh' }, (S, L) => {
  const [x, y] = blk(1, 4);
  L.TXT('PLANNING', x + 360, y + 130, 54, { f: 'KB', align: 'center' }, S.at('planning') - 0.3, 0.4);
  L.inkArrow([[x + 120, y + 420], [x + 460, y + 420]], { w: 5 }, S.at('step') - 0.6, 0.3); L.box(x + 480, y + 350, 160, 140, S.at('step') - 0.2, 0.2, { r: 14 }); L.check(x + 560, y + 420, 2.6, S.at('take') - 0.1, { col: L.YELD });
  L.TXT('next step → done', x + 360, y + 590, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('lets') - 0.4, 0.5);
  L.INK_(L.line(x + 780, y + 100, x + 780, y + 820), { w: 2.4, amp: 1, passes: 1, dash: [12, 10], alpha: 0.6 }, S.at('difference') - 0.2, 0.3);
  L.TXT('WORRY', x + 1180, y + 130, 54, { f: 'KB', align: 'center' }, S.at('worry') - 0.3, 0.4);
  whatIfLoop(L, x + 1180, y + 500, 280, S.at("doesn't") - 0.4, 0.45, { hot: true, size: 28 });
  L.TXT('...and back to the first', x + 1180, y + 860, 38, { f: 'PH', align: 'center', col: L.INK2 }, S.at('loops') - 0.2, 0.6);
});
def(LONG, 'c1e', blk(1, 5), { purpose: 'the clue: worried-about problems are described more vaguely than others ("what if it all goes wrong?" vs "what would I do on Tuesday?")', shot: 'pan right; two thought bubbles side by side: a foggy scribble cloud vs a sharp calendar page with Tuesday circled', sfx: 'a soft fog hiss; a crisp pen circle' }, (S, L) => {
  const [x, y] = blk(1, 5);
  L.TXT('problems you worry about', x + 400, y + 130, 42, { f: 'KB', align: 'center' }, S.at('worry') - 0.3, 0.6);
  L.TXT("problems you don't", x + 1200, y + 130, 42, { f: 'KB', align: 'center' }, S.at("don't") - 0.3, 0.6);
  cloud(L, x + 400, y + 420, 560, 300, S.at('vaguer') - 0.5, { tint: L.GRY2 });
  for (let i = 0; i < 5; i++) L.INK_(L.bez([x + 220 + i * 60, y + 380 + (i % 2) * 40], [x + 260 + i * 60, y + 330], [x + 300 + i * 60, y + 480], [x + 340 + i * 60, y + 420]), { w: 2.4, amp: 1.2, passes: 1, alpha: 0.5 }, S.at('abstract') - 0.4 + i * 0.06, 0.1);
  L.TXT('vague · abstract', x + 400, y + 640, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('abstract') - 0.1, 0.4);
  L.TXT('"what if it all goes wrong?"', x + 400, y + 780, 40, { f: 'KB', align: 'center' }, S.at('wrong') - 0.8, 0.7);
  calendar(L, x + 960, y + 240, 480, 360, 7, 7, S.at("don't") + 0.2, 0.4, { title: 'NEXT WEEK', mark: (i, cx, cy, t, c) => { if (i === 1) { L.INK_(L.ell(cx, cy, c * 0.45, c * 0.45, 0, L.TAU, 24), { closed: true, w: 4, amp: 0.4, passes: 1, col: L.YELD }, S.at('tuesday') - 0.2, 0.2); } } });
  L.TXT('"what exactly would I do on Tuesday?"', x + 1200, y + 780, 36, { f: 'KB', align: 'center' }, S.at('exactly') - 0.4, 0.8);
});
def(LONG, 'c1f', blk(1, 6), { purpose: 'name the theory (reduced concreteness, Stöber & Borkovec), flag it as unsettled, and the takeaway: a vague problem has no first step', shot: 'pan right; theory card with a "NOT SETTLED" tag; a staircase with the first step missing; "you" circles at its foot', sfx: 'a stamp on "settled"; footsteps circling' }, (S, L) => {
  const [x, y] = blk(1, 6);
  card(L, x + 120, y + 100, 700, 260, S.at('reduced') - 0.6, { lines: [['reduced concreteness theory', 40], ['Stöber & Borkovec', 34, 'PH', L.INK2]] });
  tag(L, x + 1180, y + 160, 'NOT SETTLED', 50, S.at('settled') - 0.2, { tint: L.YEL });
  L.TXT('some studies: worry is more concrete', x + 1180, y + 290, 32, { f: 'PH', align: 'center', col: L.INK2 }, S.at('later') - 0.2, 0.7);
  const sx = x + 760, sy = y + 860; for (let i = 1; i < 5; i++) L.INK_([[sx + i * 140, sy - i * 90], [sx + i * 140, sy - (i + 1) * 90], [sx + (i + 1) * 140, sy - (i + 1) * 90]], { w: 4, amp: 0.3, passes: 1 }, S.at('vague') - 0.4 + i * 0.1, 0.08);
  L.INK_(L.line(sx, sy, sx + 840, sy), { w: 3, amp: 0.4, passes: 1 }, S.at('vague') - 0.5, 0.1);
  L.qmark(sx + 140, sy - 90, 80, S.at('first') - 0.1); L.TXT('no first step', sx + 160, sy - 210, 36, { f: 'KB', align: 'center' }, S.at('step') - 0.1, 0.4);
  const P = L.person(x + 460, y + 860, 1.4, S.at('feel') - 0.4, { pose: 'walk', you: true, kind: 'worry', look: [1, -0.4], hair: 'tuft', k: 0.6 });
  spiral(L, x + 460, y + 870, 160, S.at('circling') - 0.6, 0.8, { turns: 2, squash: 0.25, col: L.YELD, w: 6 });
});
def(LONG, 'c1g', blk(1, 7), { purpose: 'bridge: if worry rarely solves anything, why keep doing it? ask the worriers', shot: 'pan right; Borkovec holds out a clipboard to a worried student; a big question mark between them', sfx: 'a clipboard tap' }, (S, L) => {
  const [x, y] = blk(1, 7);
  L.TXT('so why keep doing it?', x + 800, y + 140, 62, { f: 'KB', align: 'center' }, S.at('keep') - 0.6, 0.6);
  const R = L.person(x + 500, y + 840, 1.6, S.at('borkovec') - 0.6, { pose: 'point', kind: 'think', look: [1, 0], hair: 'curly', k: 0.7 });
  const W = L.person(x + 1100, y + 840, 1.6, S.at('ask') - 0.5, { pose: 'stand', kind: 'worry', look: [-1, 0], hair: 'long', k: 0.7, dir: -1 });
  L.sheet(R.hand[1][0] + 10, R.hand[1][1] - 70, 110, 130, S.at('ask') - 0.2, { lines: 4 });
  L.qmark(x + 800, y + 420, 140, S.at('themselves') - 0.3);
  L.react(W, S.at('themselves'), { kind: 'think', look: [-1, -0.3] });
});

// ===== chapter 2: why we think it helps =====
chapter(LONG, 'ch2', 2, 2, 'WHY WE THINK IT HELPS');
def(LONG, 'c2a', blk(2, 1), { purpose: 'the 1995 study: Borkovec & Roemer give heavy worriers a list of reasons and a rating scale', shot: 'pan right; the questionnaire on a desk, a student with a pencil, a 1-to-5 scale drawn under each line', sfx: 'pencil ticks' }, (S, L) => {
  const [x, y] = blk(2, 1);
  tag(L, x + 360, y + 110, '1995', 56, S.at('nineteen') - 0.2); L.TXT('Borkovec & Lizabeth Roemer', x + 360, y + 200, 38, { f: 'PH', align: 'center', col: L.INK2 }, S.at('roemer') - 0.4, 0.6);
  const P = L.student(x + 380, y + 840, 1.6, S.at('students') - 0.5, { you: false, kind: 'think', look: [1, 0.4], hair: 'tuft', k: 0.7 });
  L.box(x + 760, y + 200, 700, 620, S.at('list') - 0.4, 0.3, { r: 16 }); L.TXT('Why do you worry?', x + 1110, y + 280, 44, { f: 'KB', align: 'center' }, S.at('reasons') - 0.3, 0.4);
  for (let i = 0; i < 5; i++) { const ly = y + 360 + i * 90; L.INK_(L.line(x + 800, ly, x + 1130, ly), { w: 2, amp: 0.5, passes: 1, alpha: 0.7 }, S.at('reasons') + i * 0.1, 0.1); for (let q = 0; q < 5; q++) L.INK_(L.ell(x + 1180 + q * 52, ly - 6, 14, 14, 0, L.TAU, 14), { closed: true, w: 2, amp: 0.1, passes: 1 }, S.at('rate') - 0.3 + i * 0.05, 0.02); L.MRK([L.ell(x + 1180 + ((i * 2 + 1) % 5) * 52, ly - 6, 12, 12, 0, L.TAU, 12)], { col: L.YEL, w: 10, edge: false }, S.at('typical') + i * 0.12, 0.05); }
});
def(LONG, 'c2b', blk(2, 2), { purpose: 'the familiar reasons: motivates, prepares for the worst, avoids/prevents bad outcomes', shot: 'pan right; three reason cards are pinned one by one, each with a small icon (a running figure, an umbrella, a stop hand)', sfx: 'a pin tap per card' }, (S, L) => {
  const [x, y] = blk(2, 2);
  const cards = [['motivates me', 'motivates'], ['prepares me for the worst', 'prepare'], ['avoids or prevents bad outcomes', 'avoid']];
  cards.forEach(([s, cue], i) => { const cx = x + 120 + i * 480, t = S.at(cue) - 0.6; L.box(cx, y + 220, 420, 520, t, 0.25, { r: 18 }); L.TXT('"worry...', cx + 210, y + 300, 36, { f: 'PH', align: 'center', col: L.INK2 }, t + 0.2, 0.3); const ww = s.split(' '), mid = Math.ceil(ww.length / 2); L.TXT(ww.slice(0, mid).join(' '), cx + 210, y + 640, 38, { f: 'KB', align: 'center' }, t + 0.3, 0.4); L.TXT(ww.slice(mid).join(' ') + '"', cx + 210, y + 690, 38, { f: 'KB', align: 'center' }, t + 0.5, 0.4); });
  L.person(x + 330, y + 560, 1.0, S.at('motivates') - 0.2, { pose: 'walk', kind: 'grin', look: [1, 0], hair: 'tuft', k: 0.4 });
  const ux = x + 810, uy = y + 420; L.INK_(L.ell(ux, uy, 110, 70, Math.PI, L.TAU, 30).concat([[ux - 110, uy]]), { closed: true, w: 3, amp: 0.3 }, S.at('worst') - 0.2, 0.15); L.MRK([L.ell(ux, uy, 110, 70, Math.PI, L.TAU, 30).concat([[ux - 110, uy]])], { col: L.GRY2, w: 12 }, S.at('worst'), 0.08); L.INK_(L.quad([ux, uy], [ux, uy + 120], [ux - 30, uy + 120]), { w: 3, amp: 0.2, passes: 1 }, S.at('worst') + 0.1, 0.08);
  const hx = x + 1290, hy = y + 460; L.INK_(L.rrect(hx - 60, hy - 60, 120, 140, 30), { closed: true, w: 3, amp: 0.4 }, S.at('prevent') - 0.3, 0.12); for (let i = 0; i < 4; i++) L.INK_(L.line(hx - 45 + i * 30, hy - 60, hx - 45 + i * 30, hy - 120), { w: 3, amp: 0.2, passes: 1 }, S.at('prevent') - 0.2 + i * 0.03, 0.04);
  L.TXT('Borkovec & Roemer, 1995', x + 1460, y + 850, 28, { f: 'PH', align: 'right', col: L.INK2 }, S.t0 + 1, 0.4);
});
def(LONG, 'c2c', blk(2, 3), { purpose: 'the magical reason: worrying makes it less likely to happen (worry as a protective charm)', shot: 'pan right; "you" holds a thought bubble shaped like a shield over a little house; push on the shield', sfx: 'a tiny chime on "magical"' }, (S, L) => {
  const [x, y] = blk(2, 3);
  L.TXT('...a little more magical', x + 800, y + 120, 54, { f: 'KB', align: 'center' }, S.at('magical') - 0.5, 0.6);
  const P = L.person(x + 400, y + 840, 1.7, S.t0 + 0.1, { pose: 'arms_up', you: true, kind: 'worry', look: [1, -0.6], hair: 'tuft', k: 0.7 });
  house(L, x + 1100, y + 840, 2.2, S.at('happen') - 0.4);
  shield(L, x + 1100, y + 480, 1.4, S.at('protection') - 1.2, { col: L.YEL });
  L.MST(L.bez([P.hand[1][0], P.hand[1][1]], [x + 700, y + 300], [x + 900, y + 320], [x + 980, y + 420]), { w: 4, col: L.YELD, amp: 1 }, S.at('protection') - 0.8, 0.4);
  L.TXT('"worrying makes it less likely to happen"', x + 800, y + 230, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('less') - 0.4, 0.9);
  L.sparks(x + 1100, y + 480, 170, 220, [-2.4, -1.57, -0.7, 0.2, 3.0], S.at('protection'), 0.2);
});
def(LONG, 'c2d', blk(2, 4), { purpose: 'the reason that comes back later: worry distracts from more emotional things (rated highest by the GAD-level worriers)', shot: 'pan right; the worry cloud is drawn in front of a darker box labelled "feelings"; a bar chart shows the GAD group\'s bar highest; a yellow pin "comes back"', sfx: 'a curtain swish; bars rise' }, (S, L) => {
  const [x, y] = blk(2, 4);
  L.box(x + 140, y + 260, 460, 380, S.at('emotional') - 0.6, 0.3, { r: 18, tint: L.GRY2 }); L.TXT('more emotional', x + 370, y + 600, 34, { f: 'PH', align: 'center', col: L.INK2 }, S.at('emotional') - 0.2, 0.4);
  heart(L, x + 370, y + 440, S.at('emotional') - 0.1, 9);
  cloud(L, x + 470, y + 360, 360, 200, S.at('distracts') - 0.4, { tint: L.GRY }); L.TXT('worry', x + 470, y + 372, 40, { f: 'KB', align: 'center' }, S.at('distracts') - 0.1, 0.3);
  L.TXT('"worry distracts me from more emotional things"', x + 800, y + 140, 40, { f: 'KB', align: 'center' }, S.at('distracts') - 0.6, 1.0);
  L.bars(x + 820, y + 760, 600, 380, [{ v: 0.35, label: 'other groups', t: S.at('rated') - 0.3 }, { v: 0.9, label: 'GAD-level worriers', col: L.YEL, t: S.at('generalized') - 0.2 }], S.at('stood') - 0.6, { ls: 30 });
  tag(L, x + 1120, y + 860, 'it comes back', 40, S.at('comes') - 0.3, { tint: L.YEL });
});
def(LONG, 'c2e', blk(2, 5), { purpose: 'the trap: the bad thing usually doesn\'t happen; the brain concludes "the worry worked"', shot: 'pan right; night bed (worry) → morning bed (nothing happened) → the head with a checkmark labelled "it worked"', sfx: 'a rooster-free morning chirp; a check tick' }, (S, L) => {
  const [x, y] = blk(2, 5);
  bed(L, x + 60, y + 560, 380, S.at('worried') - 0.6, { you: true, kind: 'worry', look: [0, -1], s: 0.7, k: 0.6 }); moon(L, x + 300, y + 220, 40, S.at('worried') - 0.3);
  L.inkArrow([[x + 560, y + 420], [x + 680, y + 420]], { w: 5 }, S.at('then') - 0.2, 0.2);
  bed(L, x + 720, y + 560, 380, S.at('nothing') - 0.5, { you: true, kind: 'smile', look: [0, -1], s: 0.7, k: 0.6 }); sun(L, x + 980, y + 220, 40, S.at('nothing') - 0.3);
  L.TXT('nothing happened', x + 900, y + 660, 40, { f: 'KB', align: 'center' }, S.at('happened') - 0.2, 0.5);
  L.head(x + 1340, y + 420, 110, S.at('brain') - 0.5, { you: true, kind: 'proud', look: [-0.3, -0.3], k: 0.6 });
  tag(L, x + 1340, y + 680, 'THE WORRY WORKED', 44, S.at('worked') - 0.3, { tint: L.YEL }); L.check(x + 1440, y + 300, 3, S.at('worked'), { col: L.YELD });
});
def(LONG, 'c2f', blk(2, 6), { purpose: 'the rain-dance analogy: credit goes to the dance; superstitious avoidance; relief rewards worry', shot: 'pan right; a dancer under a cloud, rain falls on "comes", a gold star stuck on the dancer; then the loop arrow worry → relief → worry', sfx: 'drum taps; rain patter on "rain comes"; a reward chime on "rewards"' }, (S, L) => {
  const [x, y] = blk(2, 6);
  const P = rainDance(L, x + 340, y + 840, 1.5, S.at('dance') - 0.6, { rainT: S.at('comes') - 0.2, cloudT: S.at('rains') - 0.4 });
  L.TXT('it rains anyway', x + 340, y + 150, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('anyway') - 0.3, 0.5);
  L.TXT('credit → the dance', x + 340, y + 930, 40, { f: 'KB', align: 'center' }, S.at('credit') - 0.3, 0.5);
  tag(L, x + 1090, y + 130, 'superstitious avoidance', 44, S.at('superstitious') - 0.3);
  const cx = x + 1090, cy = y + 520;
  brick(L, cx, cy - 170, 260, 80, S.at('relief') - 0.6, { text: 'worry' }); brick(L, cx + 200, cy + 110, 260, 80, S.at('relief') - 0.2, { text: 'nothing happens' }); brick(L, cx - 200, cy + 110, 260, 80, S.at('relief') + 0.2, { text: 'relief', col: L.YEL });
  L.inkArrow([[cx + 140, cy - 150], [cx + 230, cy + 50]], { w: 4 }, S.at('relief') - 0.3, 0.2); L.inkArrow([[cx + 60, cy + 120], [cx - 60, cy + 120]], { w: 4 }, S.at('relief') + 0.1, 0.2); L.inkArrow([[cx - 230, cy + 50], [cx - 140, cy - 150]], { w: 4, col: L.YELD }, S.at('rewards') - 0.1, 0.25);
  L.TXT('...so you do it again', cx, cy + 300, 38, { f: 'PH', align: 'center', col: L.INK2 }, S.at('again') - 0.4, 0.5);
});
def(LONG, 'c2g', blk(2, 7), { purpose: 'bridge: how often does the feared thing really not happen? someone counted', shot: 'pan right; a tally sheet and a pencil; tally marks begin; push on the tally', sfx: 'pencil tally scratches' }, (S, L) => {
  const [x, y] = blk(2, 7);
  L.TXT('how often does it really not happen?', x + 800, y + 160, 54, { f: 'KB', align: 'center' }, S.at('really') - 0.6, 0.8);
  L.box(x + 460, y + 300, 680, 480, S.at('counted') - 1.0, 0.3, { r: 16 });
  for (let g = 0; g < 3; g++) for (let i = 0; i < 5; i++) { const gx = x + 560 + g * 190, t = S.at('counted') - 0.4 + (g * 5 + i) * 0.08; if (i < 4) L.INK_(L.line(gx + i * 30, y + 420, gx + i * 30, y + 620), { w: 5, amp: 0.3, passes: 1 }, t, 0.04); else L.INK_(L.line(gx - 20, y + 600, gx + 110, y + 440), { w: 5, amp: 0.3, passes: 1 }, t, 0.05); }
  L.TXT('someone finally counted', x + 800, y + 720, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('finally') - 0.2, 0.5);
});

// ===== chapter 3: what the worries predicted =====
chapter(LONG, 'ch3', 3, 3, 'WHAT REALLY HAPPENED');
def(LONG, 'c3a', blk(3, 1), { purpose: 'who: LaFreniere & Newman, Penn State, 2020; 29 students with GAD (explain GAD in plain words)', shot: 'pan right; two researcher heads, then a block of 29 small heads; a label for GAD', sfx: 'pen pops for the heads' }, (S, L) => {
  const [x, y] = blk(3, 1);
  tag(L, x + 800, y + 110, '2020 · PENN STATE', 56, S.at('twenty') - 0.2);
  [['Lucas LaFreniere', 'lucas', 'tuft'], ['Michelle Newman', 'michelle', 'long']].forEach(([n, cue, hair], i) => { const cx = x + 300 + i * 420; L.head(cx, y + 330, 80, S.at(cue) - 0.4, { hair, kind: 'think', look: [0.3, 0.3], k: 0.6 }); L.TXT(n, cx, y + 470, 38, { f: 'KB', align: 'center' }, S.at(cue) - 0.1, 0.5); });
  crowd(L, x + 1020, y + 240, 29, 6, 72, S.at('twenty-nine') - 0.5, 0.04, { hair: true });
  L.TXT('29 students', x + 1200, y + 680, 44, { f: 'KB', align: 'center' }, S.at('students') - 0.2, 0.4);
  L.TXT('generalized anxiety disorder: worry that is constant, hard to switch off', x + 800, y + 820, 34, { f: 'PH', align: 'center', col: L.INK2 }, S.at('pattern') - 0.6, 1.2);
});
def(LONG, 'c3b', blk(3, 2), { purpose: 'the method: 10 days × 4 prompts — write the worry + the prediction; then 30 days of checking', shot: 'pan right; a phone buzzes, the student writes on a note; a 10-day strip with 4 dots per day; then a 30-day calendar with a question mark', sfx: 'four phone buzzes; pen; page flip on "checked"' }, (S, L) => {
  const [x, y] = blk(3, 2);
  phone(L, x + 220, y + 400, 1.2, S.at('prompted') - 0.5); for (let i = 0; i < 3; i++) L.INK_(L.ell(x + 220, y + 400, 120 + i * 24, 180 + i * 24, -0.6, 0.6, 12), { w: 2.4, amp: 0.2, passes: 1 }, S.at('prompted') - 0.1 + i * 0.05, 0.04);
  L.TXT('4× a day', x + 220, y + 640, 40, { f: 'KB', align: 'center' }, S.at('four') - 0.2, 0.4);
  calendar(L, x + 440, y + 160, 520, 240, 10, 10, S.at('ten') - 0.5, 0.5, { title: '10 DAYS', mark: (i, cx, cy, t) => { for (let q = 0; q < 4; q++) L.MRK([L.ell(cx - 12 + (q % 2) * 24, cy - 12 + Math.floor(q / 2) * 24, 7, 7, 0, L.TAU, 10)], { col: L.YELD, w: 8, edge: false }, t + 0.3, 0.02); } });
  L.sheet(x + 480, y + 470, 440, 260, S.at('write') - 0.4, { lines: 0 });
  L.TXT('worry: ______', x + 510, y + 540, 36, { f: 'PH' }, S.at('worrying') - 0.4, 0.4); L.TXT('prediction: ______', x + 510, y + 620, 36, { f: 'PH' }, S.at('predicted') - 0.4, 0.4);
  calendar(L, x + 1020, y + 160, 480, 440, 30, 6, S.at('thirty') - 0.5, 0.6, { title: '30 DAYS' });
  L.TXT('did it come true?', x + 1260, y + 720, 44, { f: 'KB', align: 'center' }, S.at('true') - 0.6, 0.6);
});
def(LONG, 'c3c', blk(3, 3), { purpose: 'the result: ~91% did not come true; the most common per-person result was 100%; 7 people had none come true', shot: 'pan right; the 100-square grid fills, 91 crossed out and 9 yellow; push on "91%"; then 7 small people with zero ticks', sfx: 'a fast pencil rattle over the grid; a single low note on "ninety-one"' }, (S, L) => {
  const [x, y] = blk(3, 3);
  grid100(L, x + 140, y + 160, 60, S.t0 + 0.2, Math.max(1.5, S.at('percent') - S.t0 - 0.5), { hit: 9 });
  L.TXT('91%', x + 1060, y + 340, 160, { f: 'KB', align: 'center' }, S.at('ninety-one') - 0.2, 0.5); L.swash(x + 900, y + 380, x + 1220, S.at('ninety-one') + 0.4, 0.3);
  L.TXT('did not come true', x + 1060, y + 450, 46, { f: 'KB', align: 'center' }, S.at('not') - 0.2, 0.5);
  L.TXT('most common result per person: 100%', x + 1060, y + 560, 34, { f: 'PH', align: 'center', col: L.INK2 }, S.at('common') - 0.3, 0.9);
  for (let i = 0; i < 7; i++) L.person(x + 860 + i * 66, y + 820, 0.6, S.at('seven') - 0.3 + i * 0.06, { kind: 'shock', look: [0, -0.3], hair: ['tuft', 'long', 'cap', 'curly'][i % 4], k: 0.25 });
  L.TXT('7 people: zero came true', x + 1060, y + 880, 36, { f: 'KB', align: 'center' }, S.at('one', 2) - 0.3, 0.5);
});
def(LONG, 'c3d', blk(3, 4), { purpose: 'even the worries that came true: about 3 in 10 turned out better than expected', shot: 'pan right; the 9 yellow squares are pulled out; 3 of them get a smiley "better than expected"', sfx: 'three soft plucks' }, (S, L) => {
  const [x, y] = blk(3, 4);
  L.TXT('the worries that did come true', x + 800, y + 140, 54, { f: 'KB', align: 'center' }, S.at('did') - 0.4, 0.7);
  for (let i = 0; i < 10; i++) { const cx = x + 220 + i * 120, cy = y + 420, b = L.rrect(cx - 46, cy - 46, 92, 92, 10), t = S.at('worries') - 0.2 + i * 0.05; L.INK_(b, { closed: true, w: 3, amp: 0.3 }, t, 0.06); L.MRK([b], { col: L.YEL, w: 12, edge: false }, t + 0.04, 0.04); if (i < 3) L.face(cx, cy, 34, S.at('better') - 0.2 + i * 0.15, { kind: 'grin', k: 0.5 }); }
  L.TXT('about 3 in 10: better than expected', x + 800, y + 640, 50, { f: 'KB', align: 'center' }, S.at('expected') - 0.8, 0.8); L.swash(x + 420, y + 670, x + 1180, S.at('expected'), 0.3);
});
def(LONG, 'c3e', blk(3, 5), { purpose: 'the honest caveats: small sample, mostly young white female students, only month-long worries', shot: 'pan right; a caveats notepad is ticked line by line beside a magnifier over the small crowd', sfx: 'pen ticks per caveat' }, (S, L) => {
  const [x, y] = blk(3, 5);
  tag(L, x + 800, y + 110, 'HONEST CAVEATS', 56, S.at('caveats') - 0.3, { tint: L.YEL });
  notepad(L, x + 160, y + 230, 820, 520, S.at('caveats'), ['small study: 29 people', 'mostly young, white, female students', 'only worries you can check within a month'], { it: [S.at('small') - 0.3, S.at('mostly') - 0.3, S.at('tracked') - 0.3], size: 38, lh: 120 });
  crowd(L, x + 1120, y + 340, 12, 4, 80, S.at('small') - 0.1, 0.04, {}); const mx = x + 1240, my = y + 440; L.INK_(L.ell(mx, my, 160, 160, 0, L.TAU, 40), { closed: true, w: 5, amp: 0.4 }, S.at('study') - 0.2, 0.2); L.INK_(L.line(mx + 112, my + 112, mx + 230, my + 230), { w: 12, amp: 0.2, passes: 1 }, S.at('study'), 0.1);
});
def(LONG, 'c3f', blk(3, 6), { purpose: 'the gap: felt like a forecast, was mostly a false alarm; least-true worriers improved most', shot: 'pan right; a weather-forecast board "STORM" vs the window showing sun; a smoke alarm going off over toast; then a small chart rising', sfx: 'a fake alarm beep (soft) on "false alarm"' }, (S, L) => {
  const [x, y] = blk(3, 6);
  L.box(x + 120, y + 200, 460, 340, S.at('forecast') - 0.6, 0.3, { r: 16 }); L.TXT('FORECAST', x + 350, y + 270, 40, { f: 'KB', align: 'center' }, S.at('forecast') - 0.4, 0.3); cloud(L, x + 350, y + 400, 220, 110, S.at('forecast') - 0.2, { tint: L.GRY2, rain: true });
  L.inkArrow([[x + 620, y + 370], [x + 740, y + 370]], { w: 5 }, S.at('mostly') - 0.4, 0.2);
  sun(L, x + 900, y + 370, 80, S.at('false') - 0.4);
  tag(L, x + 900, y + 600, 'FALSE ALARM', 48, S.at('alarm') - 0.2, { tint: L.YEL });
  L.INK_(L.line(x + 1100, y + 760, x + 1480, y + 760), { w: 3, amp: 0.3 }, S.at('least') - 0.5, 0.2); L.INK_(L.line(x + 1100, y + 760, x + 1100, y + 420), { w: 3, amp: 0.3 }, S.at('least') - 0.4, 0.2);
  L.MST([[x + 1120, y + 720], [x + 1460, y + 470]], { w: 9, col: L.YELD }, S.at('improved') - 0.3, 0.5);
  L.TXT('fewer came true → more improvement', x + 1290, y + 830, 32, { f: 'PH', align: 'center', col: L.INK2 }, S.at('most') - 0.4, 0.7);
});
def(LONG, 'c3g', blk(3, 7), { purpose: 'the bridge question: if worry predicts badly, maybe predicting isn\'t its job', shot: 'pan right; a crystal ball labelled "job: predicting?" gets crossed; a blank card "its real job: ___"; push', sfx: 'pen strike' }, (S, L) => {
  const [x, y] = blk(3, 7);
  const bx = x + 480, by = y + 460; L.INK_(L.ell(bx, by, 170, 170, 0, L.TAU, 40), { closed: true, w: 4, amp: 0.4 }, S.at('predicts') - 0.4, 0.2); L.MRK([L.ell(bx, by, 170, 170, 0, L.TAU, 40)], { col: L.GRY, w: 14 }, S.at('predicts') - 0.2, 0.1); L.INK_(L.rrect(bx - 130, by + 160, 260, 60, 14), { closed: true, w: 3, amp: 0.3 }, S.at('predicts'), 0.1);
  L.TXT('job: predicting?', bx, by + 320, 46, { f: 'KB', align: 'center' }, S.at('job') - 0.4, 0.5); L.cross(bx, by, 6, S.at("isn't") - 0.1);
  card(L, x + 900, y + 300, 560, 320, S.at('else') - 1.2, { lines: [['its real job:', 50], ['?', 90]] });
});

// ===== chapter 4: worry as a shield =====
chapter(LONG, 'ch4', 4, 4, 'WORRY AS A SHIELD');
def(LONG, 'c4a', blk(4, 1), { purpose: 'the 1990 experiment: Borkovec & Shao Hu, people afraid of public speaking', shot: 'pan right; a small stage with a lectern; a nervous speaker at the side', sfx: 'a microphone thump' }, (S, L) => {
  const [x, y] = blk(4, 1);
  tag(L, x + 360, y + 110, '1990', 56, S.at('nineteen') - 0.2); L.TXT('Borkovec & Shao Hu', x + 360, y + 200, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('shao') - 0.3, 0.5);
  L.stage(x + 700, y + 820, 760, S.at('experiment') - 0.5);
  const lx = x + 1080, ly = y + 820 - 60; L.INK_([[lx - 60, ly], [lx - 40, ly - 200], [lx + 40, ly - 200], [lx + 60, ly]], { closed: true, w: 3, amp: 0.3 }, S.at('public') - 0.4, 0.12);
  const P = L.person(x + 380, y + 840, 1.6, S.at('afraid') - 0.6, { pose: 'hide', kind: 'worry', look: [1, 0], hair: 'tuft', k: 0.6, you: true });
  L.TXT('afraid of public speaking', x + 1080, y + 300, 44, { f: 'KB', align: 'center' }, S.at('speaking') - 0.4, 0.6);
});
def(LONG, 'c4b', blk(4, 2), { purpose: 'the three conditions (relax / neutral / worry), then imagine the speech while heart rate is measured', shot: 'pan right; three seated people with their own thought bubble (beach, a cup, a storm); then a heart-rate monitor wire to each', sfx: 'waves; a spoon clink; thunder; then a monitor beep' }, (S, L) => {
  const [x, y] = blk(4, 2);
  const lab = [['relaxed', 'relaxed', 'side'], ['neutral', 'neutral', 'neutral'], ['worried', 'worried', 'worry']];
  lab.forEach(([s, cue, kind], i) => { const px = x + 260 + i * 520, t = S.at(cue) - 0.5; const P = L.person(px, y + 820, 1.4, t, { pose: 'sit', kind, look: [0, -0.3], hair: ['long', 'cap', 'tuft'][i], k: 0.5 }); L.TXT(s, px, y + 860, 38, { f: 'KB', align: 'center' }, t + 0.3, 0.3); const bx = px - 130, by = y + 220; L.bubble(bx, by, 260, 150, t + 0.2, { thought: true, tail: [px, P.head[1] - 50], shadow: false }); if (i === 0) sun(L, px, by + 75, 34, t + 0.4); if (i === 1) L.cup(px, by + 85, 0.7, t + 0.4); if (i === 2) cloud(L, px, by + 70, 140, 70, t + 0.4, { tint: L.GRY2, rain: true }); });
  L.TXT('then: imagine giving a speech, again and again', x + 800, y + 140, 42, { f: 'KB', align: 'center' }, S.at('imagined') - 0.4, 0.8);
  [0, 1, 2].forEach(i => { const mx = x + 340 + i * 520, my = y + 520; L.INK_(L.rrect(mx, my, 160, 100, 10), { closed: true, w: 2.6, amp: 0.3 }, S.at('heart') - 0.4 + i * 0.1, 0.1); trace(L, mx + 10, my + 60, 140, 26, S.at('heart') - 0.2 + i * 0.1, 0.6, { w: 3 }); L.INK_(L.line(mx, my + 80, x + 290 + i * 520, y + 640), { w: 1.8, amp: 0.6, passes: 1, alpha: 0.6 }, S.at('heart') + i * 0.1, 0.1); });
});
def(LONG, 'c4c', blk(4, 3), { purpose: 'the result: worriers\' heart rate jumped least, but they reported more fear than the neutral group', shot: 'pan right; three heart traces stacked, the speech cue line; the worry trace spike is smallest (yellow); then a fear thermometer beside it, higher', sfx: 'three monitor beeps, the last muted; a low note on "more fear"' }, (S, L) => {
  const [x, y] = blk(4, 3);
  L.TXT('heart-rate jump when the speech scene came', x + 560, y + 120, 38, { f: 'KB', align: 'center' }, S.at('expect') - 0.4, 0.8);
  const rows = [['relaxed', 200, L.GRYD], ['neutral', 150, L.GRYD], ['worried', 50, L.YELD]];
  rows.forEach(([s, h, col], i) => { const ty = y + 340 + i * 200, t = i === 2 ? S.at('least') - 0.8 : S.at("didn't") - 0.4 + i * 0.3; L.TXT(s, x + 200, ty + 10, 36, { f: 'KB', align: 'right' }, t, 0.3); trace(L, x + 240, ty, 700, h * 0.8, t, 0.7, { col: i === 2 ? L.INK : L.INK, w: 4 }); if (i === 2) L.MRK([[[x + 640, ty - 60], [x + 720, ty - 60], [x + 720, ty + 20], [x + 640, ty + 20]]], { col: L.YEL, w: 14, edge: false }, t + 0.6, 0.1); });
  L.INK_(L.line(x + 660, y + 180, x + 660, y + 800), { w: 2, amp: 0.3, passes: 1, dash: [8, 8], alpha: 0.6 }, S.at('scene') - 0.3, 0.2);
  thermo(L, x + 1280, y + 700, 420, 0.8, S.at('fear') - 0.6, { label: 'fear (worried)', ls: 34 }); thermo(L, x + 1460, y + 700, 420, 0.55, S.at('neutral') - 0.4, { label: 'neutral', ls: 30 });
  L.TXT('more fear, not less', x + 1370, y + 210, 42, { f: 'KB', align: 'center' }, S.at('less') - 0.5, 0.5);
});
def(LONG, 'c4d', blk(4, 4), { purpose: 'Borkovec\'s explanation: worry is words, not pictures; it mutes the body\'s alarm (relief) but may keep fear from being felt and fading; callback to "distracts from emotional things"', shot: 'pan right; a head full of word-scribbles (not pictures); a body alarm bell with a mute sock; then the fear stays locked in a box; yellow callback pin to ch 2', sfx: 'a muffled bell; a box lid click; a kalimba on the callback' }, (S, L) => {
  const [x, y] = blk(4, 4);
  const H = L.head(x + 300, y + 380, 150, S.t0 + 0.1, { you: true, kind: 'worry', look: [1, 0], k: 0.7 });
  for (let i = 0; i < 4; i++) L.INK_(L.bez([x + 220, y + 300 + i * 40], [x + 260, y + 285 + i * 40], [x + 320, y + 315 + i * 40], [x + 380, y + 300 + i * 40]), { w: 2.6, amp: 0.8, passes: 1 }, S.at('words') - 0.3 + i * 0.08, 0.1);
  L.TXT('words, not pictures', x + 300, y + 640, 40, { f: 'KB', align: 'center' }, S.at('picturing') - 0.4, 0.5);
  const bx = x + 780, by = y + 380; L.INK_(L.bez([bx - 80, by + 80], [bx - 80, by - 100], [bx + 80, by - 100], [bx + 80, by + 80]).concat([[bx - 90, by + 80]]), { closed: true, w: 3.4, amp: 0.3 }, S.at('alarm') - 0.5, 0.2); L.MRK([L.bez([bx - 80, by + 80], [bx - 80, by - 100], [bx + 80, by - 100], [bx + 80, by + 80])], { col: L.GRY2, w: 14 }, S.at('alarm') - 0.3, 0.1);
  L.TXT("the body's alarm", bx, by + 180, 38, { f: 'KB', align: 'center' }, S.at('alarm') - 0.2, 0.4); L.TXT('muted', bx, by + 240, 36, { f: 'PH', align: 'center', col: L.INK2 }, S.at('mute') - 0.1, 0.3); L.INK_(L.line(bx - 110, by - 110, bx + 110, by + 110), { w: 6, amp: 0.3, passes: 1 }, S.at('mute'), 0.15);
  L.box(x + 1060, y + 260, 380, 280, S.at('fading') - 1.4, 0.3, { r: 14 }); L.TXT('fear', x + 1250, y + 420, 50, { f: 'KB', align: 'center' }, S.at('felt') - 0.4, 0.3); L.INK_(L.rrect(x + 1220, y + 220, 60, 60, 10), { closed: true, w: 3.4, amp: 0.2 }, S.at('felt'), 0.1);
  L.TXT('never fully felt → never fades', x + 1250, y + 620, 32, { f: 'PH', align: 'center', col: L.INK2 }, S.at('fading') - 0.2, 0.6);
  tag(L, x + 800, y + 820, 'remember: "distracts me from more emotional things"', 34, S.at('remember') - 0.2, { tint: L.YEL });
});
def(LONG, 'c4e', blk(4, 5), { purpose: 'contrast avoidance (Newman & Llera): the fear of the sudden drop from okay to awful', shot: 'pan right; "you" on a high ledge looking down a cliff; a label for the drop; push on the drop', sfx: 'a wind gust on "drop"' }, (S, L) => {
  const [x, y] = blk(4, 5);
  card(L, x + 120, y + 100, 600, 220, S.at('model') - 0.6, { lines: [['contrast avoidance', 46], ['Newman & Llera, 2011', 32, 'PH', L.INK2]] });
  const cl = [[x + 200, y + 460], [x + 760, y + 460], [x + 790, y + 520], [x + 770, y + 640], [x + 800, y + 800], [x + 820, y + 860], [x + 200, y + 860]]; L.FILL(cl, S.at('drop') - 1.2); L.MRK([cl], { col: L.GRY2, w: 14 }, S.at('drop') - 1.1, 0.1); L.INK_(cl, { closed: true, w: 3.4, amp: 0.6 }, S.at('drop') - 1.2, 0.3);
  L.INK_(L.line(x + 820, y + 860, x + 1480, y + 860), { w: 3, amp: 0.4, passes: 1 }, S.at('drop') - 0.8, 0.2);
  const P = L.person(x + 640, y + 460, 1.2, S.at('fear') - 0.5, { pose: 'stand', you: true, kind: 'worry', look: [1, 1], hair: 'tuft', k: 0.5 });
  L.TXT('okay', x + 400, y + 540, 44, { f: 'KB', align: 'center' }, S.at('okay') - 0.3, 0.3); L.TXT('awful', x + 1150, y + 830, 44, { f: 'KB', align: 'center' }, S.at('awful') - 0.3, 0.3);
  L.inkArrow([[x + 900, y + 470], [x + 960, y + 800]], { w: 6, col: L.YELD }, S.at('sudden') - 0.1, 0.4);
  L.TXT('not only the bad event... the sudden drop', x + 1150, y + 250, 36, { f: 'PH', align: 'center', col: L.INK2 }, S.at('only') - 0.4, 0.9);
});
def(LONG, 'c4f', blk(4, 6), { purpose: 'the experiment: worry / relax / neutral first, then upsetting clips; worriers felt less of a jump (already down there)', shot: 'pan right; a little TV with a scary clip; then the two-line drop chart (calm line high, worried line low) drawn as the narration explains', sfx: 'a TV click; a dramatic sting from the clip (quiet); a soft thud for the small drop' }, (S, L) => {
  const [x, y] = blk(4, 6);
  screen(L, x + 160, y + 200, 360, 240, S.at('film') - 0.6); L.TXT('upsetting clip', x + 340, y + 340, 34, { f: 'KB', align: 'center' }, S.at('clips') - 0.2, 0.4);
  ['worried', 'relaxed', 'neutral'].forEach((s, i) => L.TXT(s, x + 340, y + 600 + i * 60, 36, { f: 'PH', align: 'center', col: L.INK2 }, S.at(s) - 0.2, 0.3));
  dropChart(L, x + 680, y + 780, 820, 560, S.at('first') - 0.8, { evLabel: 'the clip', tc: S.at('jump') - 0.6, tw: S.at('already') - 0.6 });
  L.TXT('less distance to fall', x + 1090, y + 120, 44, { f: 'KB', align: 'center' }, S.at('distance') - 0.4, 0.5);
});
def(LONG, 'c4f2', blk(4, 7), { purpose: 'the surprise: people with GAD who relaxed first found the sudden switch harder to bear', shot: 'pan right; a relaxed person on a hammock-like chair, then the clip hits and the face re-draws in shock; the big gap line marked in yellow', sfx: 'a gentle hum, then a jolt sting' }, (S, L) => {
  const [x, y] = blk(4, 7);
  tag(L, x + 800, y + 110, 'the part that surprised them', 46, S.at('surprised') - 0.4, { tint: L.YEL });
  const P = L.person(x + 380, y + 820, 1.6, S.at('relaxed') - 0.6, { pose: 'sit', kind: 'side', look: [0, 0], hair: 'long', k: 0.6 });
  L.TXT('relaxed first', x + 380, y + 880, 38, { f: 'KB', align: 'center' }, S.at('relaxed') - 0.1, 0.3);
  L.react(P, S.at('switch') - 0.1, { kind: 'shock', look: [1, 0] }); L.sparks(P.head[0], P.head[1], P.head[2] * 1.4, P.head[2] * 2, [-2.4, -1.57, -0.7], S.at('switch'), 0.15);
  dropChart(L, x + 700, y + 780, 760, 480, S.at('switch') - 0.8, { worry: false, evLabel: 'the switch', tc: S.at('switch') - 0.4 });
  L.TXT('calm made the drop feel worse', x + 1080, y + 240, 40, { f: 'KB', align: 'center' }, S.at('worse') - 0.8, 0.7);
  L.TXT('Llera & Newman, 2014', x + 1460, y + 880, 28, { f: 'PH', align: 'right', col: L.INK2 }, S.at('bear') - 0.2, 0.4);
});
def(LONG, 'c4g', blk(4, 8), { purpose: 'analogy: riding with a foot on the brake the whole time; no jolt, no enjoyment, tense evening for nothing', shot: 'pan right along a road; the car creeps with the brake light on; a "you" inside with a tense face; tracking the car left to right (it moves, we follow)', sfx: 'a soft engine hum; brake squeak; a sigh on "for nothing"', noAutoCam: true }, (S, L) => {
  const B = blk(4, 8), [x, y] = B, c = S.fit(B);
  S.cam(S.t0 - 0.25, c.x - 120, c.y, c.z * 1.05, 1.1, 'io'); S.cam(S.t0 + 1.0, c.x + 120, c.y, c.z * 1.08, Math.max(1, S.end - S.t0 - 1.4), 'sin');
  L.INK_(L.line(x + 40, y + 760, x + 1560, y + 760), { w: 3, amp: 0.5 }, S.t0 + 0.1, 0.3); for (let i = 0; i < 7; i++) L.INK_(L.line(x + 80 + i * 220, y + 820, x + 180 + i * 220, y + 820), { w: 4, amp: 0.2, passes: 1, alpha: 0.6 }, S.t0 + 0.2 + i * 0.04, 0.04);
  car(L, x + 560, y + 760, 520, S.t0 + 0.3, { you: true }); L.head(x + 870, y + 640, 34, S.t0 + 0.6, { you: true, kind: 'worry', look: [1, 0], k: 0.4 });
  const bl = L.ell(x + 560, y + 690, 14, 22, 0, L.TAU, 14); L.MRK([bl], { col: L.YELD, w: 14, edge: false }, S.at('brake') - 0.2, 0.1); L.sparks(x + 550, y + 690, 30, 60, [2.6, 3.14, 3.7], S.at('brake'), 0.1);
  tag(L, x + 820, y + 200, 'one foot on the brake', 50, S.at('brake') - 0.4, { tint: L.YEL });
  L.TXT('no jolt...', x + 360, y + 400, 44, { f: 'KB', align: 'center' }, S.at('jolts') - 0.3, 0.4); L.TXT('...no enjoying the drive', x + 1200, y + 400, 44, { f: 'KB', align: 'center' }, S.at('enjoy') - 0.3, 0.6);
  L.TXT('tense all evening, for nothing', x + 820, y + 900, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('tense') - 0.3, 0.7);
});
def(LONG, 'c4h', blk(4, 9), { purpose: 'fairness note: the model is still being tested (GAD, labs); it explains why worry feels like protection — narrowly, it is', shot: 'pan right; "STILL BEING TESTED" stamp on the model card; the shield drawn again, small, with "narrow" written beside it; push', sfx: 'a stamp; a kalimba on "it is"' }, (S, L) => {
  const [x, y] = blk(4, 9);
  card(L, x + 140, y + 160, 620, 260, S.t0 + 0.2, { lines: [['contrast avoidance', 46], ['a model', 34, 'PH', L.INK2]] });
  tag(L, x + 450, y + 500, 'STILL BEING TESTED', 46, S.at('tested') - 0.3, { tint: L.YEL });
  L.TXT('mostly GAD · mostly labs', x + 450, y + 620, 36, { f: 'PH', align: 'center', col: L.INK2 }, S.at('labs') - 0.6, 0.6);
  shield(L, x + 1140, y + 440, 1.5, S.at('protection') - 0.6);
  L.TXT('why it feels like protection', x + 1140, y + 720, 40, { f: 'KB', align: 'center' }, S.at('protection') - 0.3, 0.6);
  L.TXT('in a narrow sense... it is', x + 1140, y + 820, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('narrow') - 0.2, 0.6);
});

// ===== chapter 5: what to try =====
chapter(LONG, 'ch5', 5, 5, 'WHAT TO TRY');
def(LONG, 'c5a', blk(5, 1), { purpose: 'the upside (Sweeny & Dooley 2017): moderate worry linked to protective actions (screening, sunscreen)', shot: 'pan right; a dial "worry" with the middle zone yellow; a clinic clipboard and a sunscreen bottle drawn next to the middle zone', sfx: 'a dial click; a bottle pop' }, (S, L) => {
  const [x, y] = blk(5, 1);
  tag(L, x + 400, y + 110, '2017', 56, S.at('twenty') - 0.2); L.TXT('Kate Sweeny & Michael Dooley', x + 400, y + 200, 38, { f: 'PH', align: 'center', col: L.INK2 }, S.at('kate') - 0.3, 0.6);
  const G = gauge(L, x + 420, y + 640, 280, S.at('upsides') - 0.6, { v: 0.5, lo: 'low', hi: 'high', label: 'worry' });
  L.MST(L.ell(x + 420, y + 640, 230, 230, Math.PI * 1.38, Math.PI * 1.62, 20), { w: 22, col: L.YEL }, S.at('moderate') - 0.3, 0.3);
  L.TXT('moderate worry', x + 420, y + 300, 44, { f: 'KB', align: 'center' }, S.at('moderate') - 0.1, 0.4);
  L.inkArrow([[x + 760, y + 500], [x + 900, y + 500]], { w: 5 }, S.at('protective') - 0.3, 0.2);
  L.sheet(x + 960, y + 350, 200, 260, S.at('screening') - 0.6, { lines: 5 }); L.INK_(L.line(x + 1060, y + 390, x + 1060, y + 450), { w: 6, amp: 0.1, passes: 1 }, S.at('screening') - 0.3, 0.05); L.INK_(L.line(x + 1030, y + 420, x + 1090, y + 420), { w: 6, amp: 0.1, passes: 1 }, S.at('screening') - 0.25, 0.05); L.TXT('health screening', x + 1060, y + 680, 34, { f: 'KB', align: 'center' }, S.at('screening') - 0.1, 0.4);
  const bx = x + 1340, by = y + 480, b = L.rrect(bx - 60, by - 100, 120, 220, 30); L.FILL(b, S.at('sunscreen') - 0.6); L.MRK([b], { col: L.YEL, w: 14 }, S.at('sunscreen') - 0.5, 0.08); L.INK_(b, { closed: true, w: 3, amp: 0.3 }, S.at('sunscreen') - 0.6, 0.15); L.INK_(L.rrect(bx - 30, by - 150, 60, 50, 8), { closed: true, w: 3, amp: 0.2 }, S.at('sunscreen') - 0.4, 0.08); L.TXT('SPF', bx, by + 20, 40, { f: 'KB', align: 'center' }, S.at('sunscreen') - 0.3, 0.2); L.TXT('sunscreen', bx, by + 200, 34, { f: 'KB', align: 'center' }, S.at('sunscreen') - 0.1, 0.4);
});
def(LONG, 'c5b', blk(5, 2), { purpose: 'the difference: useful worry ends in an action and lets go; useless worry has no exit', shot: 'pan right; two tracks: one arrow runs into a door marked "action" (open), the other is a closed loop with no door; push on the door', sfx: 'a door click; a circling whoosh' }, (S, L) => {
  const [x, y] = blk(5, 2);
  L.TXT('where does the worry go?', x + 800, y + 120, 54, { f: 'KB', align: 'center' }, S.at('goes') - 0.6, 0.6);
  L.TXT('useful', x + 400, y + 240, 46, { f: 'KB', align: 'center' }, S.at('useful') - 0.2, 0.3);
  L.inkArrow([[x + 160, y + 520], [x + 520, y + 520]], { w: 6, col: L.YELD }, S.at('something') - 0.4, 0.3); L.door(x + 560, y + 700, 160, 340, S.at('something') - 0.2, { open: 0.7 }); L.TXT('action', x + 640, y + 760, 40, { f: 'KB', align: 'center' }, S.at('do'), 0.3);
  L.TXT('your skin → buy sunscreen → let go', x + 400, y + 840, 34, { f: 'PH', align: 'center', col: L.INK2 }, S.at('buy') - 0.5, 0.8);
  L.INK_(L.line(x + 820, y + 220, x + 820, y + 860), { w: 2.4, amp: 1, passes: 1, dash: [12, 10], alpha: 0.6 }, S.at('useless') - 0.4, 0.2);
  L.TXT('useless', x + 1180, y + 240, 46, { f: 'KB', align: 'center' }, S.at('useless') - 0.2, 0.3);
  spiral(L, x + 1180, y + 540, 230, S.at('exit') - 0.4, 1.0, { turns: 3, squash: 0.6, col: L.INK, w: 5 });
  L.TXT('no exit', x + 1180, y + 840, 40, { f: 'KB', align: 'center' }, S.at('exit') - 0.1, 0.3);
});
def(LONG, 'c5c', blk(5, 3), { purpose: 'tip 1 (information, not treatment): make it concrete — ask "what is the next physical step?"; write it with a time, or recognise the loop', shot: 'pan right; the foggy cloud from ch 1 is turned into a sharp note card "next step: call the clinic, Tue 9:00"; a hand writes it', sfx: 'pen on card; a check tick' }, (S, L) => {
  const [x, y] = blk(5, 3);
  tag(L, x + 380, y + 110, 'information, not treatment', 40, S.at('information') - 0.3);
  numDot(L, x + 160, y + 270, 1, S.at('first') - 0.3, 54); L.TXT('make it concrete', x + 520, y + 290, 60, { f: 'KB', align: 'center' }, S.at('concrete') - 0.3, 0.5);
  cloud(L, x + 360, y + 560, 380, 220, S.at('looping') - 0.6, { tint: L.GRY2 }); L.TXT('what if...?', x + 360, y + 575, 40, { f: 'KB', align: 'center' }, S.at('looping') - 0.4, 0.3);
  L.inkArrow([[x + 580, y + 560], [x + 760, y + 560]], { w: 5 }, S.at('question') - 0.3, 0.2);
  L.TXT('"What is the next physical step?"', x + 1120, y + 390, 44, { f: 'KB', align: 'center' }, S.at('physical') - 0.8, 0.8);
  card(L, x + 820, y + 450, 600, 290, S.at('write') - 0.8, { lines: [['next step:', 40, 'PH', L.INK2], ['call the clinic', 48], ['Tuesday, 9:00', 40, 'KB']] });
  L.check(x + 1380, y + 490, 3, S.at('time') - 0.1, { col: L.YELD });
  L.TXT("no step? this loop isn't solving anything", x + 1120, y + 820, 36, { f: 'PH', align: 'center', col: L.INK2 }, S.at('sign') - 0.4, 0.8);
});
def(LONG, 'c5d', blk(5, 4), { purpose: 'tip 2: give worry an appointment (stimulus control, Borkovec 1983): set time and place, ~30 min, postpone daytime worries', shot: 'pan right; a clock face with a yellow 30-minute wedge, an armchair labelled "worry chair"; daytime worries are jotted on sticky notes and moved into the wedge', sfx: 'a clock tick; sticky-note peel sounds' }, (S, L) => {
  const [x, y] = blk(5, 4);
  numDot(L, x + 160, y + 130, 2, S.at('second') - 0.3, 54); L.TXT('give worry an appointment', x + 640, y + 150, 58, { f: 'KB', align: 'center' }, S.at('appointment') - 0.6, 0.6);
  L.TXT('stimulus control · Borkovec et al., 1983', x + 640, y + 230, 34, { f: 'PH', align: 'center', col: L.INK2 }, S.at('borkovec') - 0.2, 0.6);
  const cx = x + 460, cy = y + 560; L.clock(cx, cy, 200, S.at('time') - 0.6); L.MST(L.ell(cx, cy, 120, 120, -Math.PI / 2 + Math.PI, -Math.PI / 2 + Math.PI * 2, 20).concat([[cx, cy]]), { w: 30, col: L.YEL }, S.at('thirty') - 0.3, 0.4);
  L.TXT('30 min, same time & place', cx, cy + 290, 38, { f: 'KB', align: 'center' }, S.at('evening') - 0.4, 0.6);
  for (let i = 0; i < 4; i++) { const nx = x + 900 + (i % 2) * 260, ny = y + 360 + Math.floor(i / 2) * 230, b = [[nx, ny], [nx + 200, ny], [nx + 200, ny + 170], [nx, ny + 170]], t = S.at('jot') - 0.4 + i * 0.12; L.FILL(b, t); L.MRK([b], { col: L.YEL, w: 14 }, t + 0.05, 0.06); L.INK_(b, { closed: true, w: 2.6, amp: 0.3 }, t, 0.08); L.TXT(['bills?', 'that email?', 'the test?', 'mom?'][i], nx + 100, ny + 95, 34, { f: 'PH', align: 'center' }, t + 0.1, 0.3); }
  L.inkArrow([[x + 880, y + 600], [x + 700, y + 580]], { w: 5 }, S.at('postpone') - 0.1, 0.3); L.TXT('later, in the slot', x + 1130, y + 860, 36, { f: 'PH', align: 'center', col: L.INK2 }, S.at('slot') - 0.4, 0.5);
});
def(LONG, 'c5e', blk(5, 5), { purpose: 'the evidence, honestly: a 2024 trial found less worry after < 1 week (GAD); another study found no clear effect → an experiment, not a promise', shot: 'pan right; a scale: a "2024 trial: worry ↓" weight vs "another study: no clear effect"; the scale stays level-ish; tag EXPERIMENT', sfx: 'a scale creak' }, (S, L) => {
  const [x, y] = blk(5, 5);
  L.INK_(L.line(x + 800, y + 780, x + 800, y + 360), { w: 5, amp: 0.2, passes: 1 }, S.at('trial') - 0.8, 0.2); L.INK_([[x + 700, y + 790], [x + 800, y + 740], [x + 900, y + 790]], { closed: true, w: 3, amp: 0.2 }, S.at('trial') - 0.8, 0.15);
  L.INK_(L.line(x + 380, y + 380, x + 1220, y + 340), { w: 5, amp: 0.2, passes: 1 }, S.at('trial') - 0.6, 0.2);
  card(L, x + 180, y + 400, 400, 230, S.at('trial') - 0.3, { lines: [['2024 trial', 40], ['worry ↓ in < 1 week', 32, 'PH', L.INK2]] });
  card(L, x + 1020, y + 360, 400, 230, S.at('another') - 0.4, { lines: [['another study', 40], ['no clear effect', 32, 'PH', L.INK2]] });
  tag(L, x + 800, y + 160, 'MIXED EVIDENCE', 50, S.at('mixed') - 0.2);
  tag(L, x + 800, y + 880, 'an experiment, not a promise', 46, S.at('experiment') - 0.3, { tint: L.YEL });
});
def(LONG, 'c5f', blk(5, 6), { purpose: 'tip 3: keep score — write the worry as a dated prediction, check later (like the Penn State students); your own false alarms', shot: 'pan right; a worry journal page with columns PREDICTION · DATE · DID IT HAPPEN?; rows fill, mostly "no"; push on the handwriting', sfx: 'pen; small ticks' }, (S, L) => {
  const [x, y] = blk(5, 6);
  numDot(L, x + 160, y + 130, 3, S.at('third') - 0.3, 54); L.TXT('keep score', x + 500, y + 150, 60, { f: 'KB', align: 'center' }, S.at('score') - 0.4, 0.4);
  L.box(x + 160, y + 240, 1280, 560, S.at('prediction') - 0.8, 0.3, { r: 16 });
  const cols = [['prediction', 420], ['date', 820], ['did it happen?', 1180]]; cols.forEach(([s, cx], i) => L.TXT(s, x + cx, y + 320, 40, { f: 'KB', align: 'center' }, S.at(['prediction', 'date', 'check'][i]) - 0.3, 0.4));
  L.INK_(L.line(x + 180, y + 350, x + 1420, y + 350), { w: 3, amp: 0.3, passes: 1 }, S.at('date') - 0.2, 0.2);
  const rows = [['"I\'ll freeze in the meeting"', 'Nov 24', 'no'], ['"the results are bad"', 'Nov 28', 'no'], ['"they\'re mad at me"', 'Dec 2', 'no']];
  rows.forEach(([a, b, c], i) => { const ry = y + 440 + i * 110, t = S.at('later') - 0.4 + i * 0.5; L.TXT(a, x + 420, ry, 34, { f: 'PH', align: 'center' }, t, 0.6); L.TXT(b, x + 820, ry, 34, { f: 'PH', align: 'center' }, t + 0.4, 0.3); L.TXT(c, x + 1180, ry, 38, { f: 'KB', align: 'center' }, S.at('false') - 0.6 + i * 0.3, 0.3); });
  L.TXT('example entries', x + 1420, y + 780, 26, { f: 'PH', align: 'right', col: L.INK2 }, S.at('later') + 0.4, 0.3);
  L.MRK([[[x + 1100, y + 400], [x + 1260, y + 400], [x + 1260, y + 690], [x + 1100, y + 690]]], { col: L.YEL, w: 20, edge: false }, S.at('handwriting') - 0.4, 0.4);
});
def(LONG, 'c5g', blk(5, 7), { purpose: 'the care line: if worry takes over days, sleep or health, talk to a doctor or licensed therapist; very treatable', shot: 'pan right; a calm, clear card with a doctor figure and "you" talking; held steady (no playful moves here)', sfx: 'quiet; a single warm pad note', push: 0.01 }, (S, L) => {
  const [x, y] = blk(5, 7);
  const P = L.person(x + 460, y + 820, 1.5, S.at('talk') - 0.8, { pose: 'stand', you: true, kind: 'neutral', look: [1, 0], hair: 'tuft', k: 0.6 });
  const D = L.person(x + 760, y + 820, 1.5, S.at('doctor') - 0.6, { pose: 'wave', kind: 'smile', look: [-1, 0], hair: 'long', k: 0.6, dir: -1 });
  L.TXT('days · sleep · health', x + 600, y + 250, 44, { f: 'KB', align: 'center' }, S.at('days') - 0.3, 0.8);
  card(L, x + 940, y + 280, 520, 420, S.at('talk') - 0.4, { lines: [['talk to a doctor', 40], ['or a licensed therapist', 34, 'PH', L.INK2], ['very treatable', 44]] });
  L.TXT('US: call or text 988', x + 1200, y + 790, 36, { f: 'PH', align: 'center', col: L.INK2 }, S.at('treatable') - 0.2, 0.5);
});

// ===== ending: back to 11 p.m. (row 0, after the sting) =====
def(LONG, 'end1', blk(0, 6), { purpose: 'payoff to the opening: same bed, same what-ifs; now we know: not predicting, bracing (keeping you a little down)', shot: 'whip back to the 11 p.m. bedroom (callback); the what-if bubbles return; then the drop chart\'s worried line is drawn over the bed as a low "brace"', sfx: 'paper whoosh; the clock tick returns; a soft brace thud', ease: 'q', move: 0.9 }, (S, L) => {
  const [x, y] = blk(0, 6);
  const H = bedroom(L, x, y, S.t0 + 0.1, { kind: 'worry', look: [0.3, -1], k: 0.7 });
  [['what if...?', 0], ['what if...?', 1]].forEach(([s, i]) => L.bubble(x + 300 + i * 340, y + 400 - i * 30, 260, 84, S.at('ifs') - 0.4 + i * 0.2, { text: s, size: 28, thought: true, tail: [H.head[0] + 40, H.head[1] - 60], shadow: false }));
  L.TXT('not predicting', x + 560, y + 130, 46, { f: 'KB', align: 'center' }, S.at('predicting') - 0.3, 0.4); L.INK_(L.line(x + 400, y + 115, x + 720, y + 118), { w: 5, amp: 0.3, passes: 1 }, S.at('predicting') + 0.4, 0.2);
  tag(L, x + 560, y + 230, 'BRACING', 54, S.at('bracing') - 0.2, { tint: L.YEL });
  L.react({ head: H.head }, S.at('bracing') + 0.2, { kind: 'think', look: [0.3, -1] });
  L.TXT('a little bit down, so a fall won\'t feel so far', x + 800, y + 900, 38, { f: 'PH', align: 'center', col: L.INK2 }, S.at('fall') - 0.8, 0.9);
});
def(LONG, 'end2', blk(0, 7), { purpose: 'the practical close: thank it, ask "what\'s the next step?"; write it down, or let it wait for its appointment', shot: 'pan right; "you" sits up in bed and writes on the bedside notepad; the clock with the yellow 30-minute wedge sits beside it', sfx: 'pen on paper; a lamp click off at the end' }, (S, L) => {
  const [x, y] = blk(0, 7);
  const P = L.person(x + 470, y + 820, 1.6, S.t0 + 0.1, { pose: 'hold', you: true, kind: 'smile', look: [1, 0.4], hair: 'tuft', k: 0.7, reach2: [x + 690, y + 510] });
  L.INK_(L.line(x + 690, y + 510, x + 740, y + 480), { w: 5, amp: 0.1, passes: 1 }, S.at('write') - 0.2, 0.08);
  L.TXT('thanks for trying', x + 420, y + 250, 44, { f: 'KB', align: 'center' }, S.at('thank') - 0.2, 0.5);
  L.bubble(x + 660, y + 220, 520, 110, S.at('step') - 0.8, { text: "what's the next step?", size: 40, tint: 'rgba(255,205,40,0.25)', tail: [P.head[0] + 50, P.head[1] - 20] });
  notepad(L, x + 640, y + 420, 440, 320, S.at('write') - 0.6, ['next step: ______'], { size: 34 });
  L.clock(x + 1300, y + 560, 110, S.at("isn't") - 0.4); L.MST(L.ell(x + 1300, y + 560, 66, 66, Math.PI / 2, Math.PI * 1.5, 16).concat([[x + 1300, y + 560]]), { w: 20, col: L.YEL }, S.at('wait') - 0.2, 0.3);
  L.TXT('or: its appointment', x + 1300, y + 740, 36, { f: 'PH', align: 'center', col: L.INK2 }, S.at('appointment') - 0.4, 0.5);
});
def(LONG, 'end3', blk(0, 8), { purpose: 'one specific comment question + one subscribe line', shot: 'pan right; the question card fills the frame', sfx: 'pen; a kalimba on "subscribe"' }, (S, L) => {
  const [x, y] = blk(0, 8);
  L.bubble(x + 160, y + 120, 1280, 330, S.t0 + 0.2, { tint: 'rgba(255,205,40,0.25)', tail: [x + 400, y + 560] });
  L.TXT('What did you worry about last month', x + 800, y + 250, 58, { f: 'KB', align: 'center' }, S.at('worried') - 0.6, 0.9);
  L.TXT('that never happened?', x + 800, y + 350, 58, { f: 'KB', align: 'center' }, S.at('never') - 0.4, 0.7);
  L.TXT('psychology, with the receipts', x + 800, y + 560, 50, { f: 'PH', align: 'center', col: L.INK2 }, S.at('receipts') - 0.4, 0.8);
  L.box(x + 560, y + 660, 480, 120, S.at('subscribe') - 0.4, 0.3, { r: 30, tint: L.YEL });
  L.TXT('SUBSCRIBE', x + 800, y + 742, 60, { f: 'KB', align: 'center' }, S.at('subscribe') - 0.2, 0.5);
});
def(LONG, 'card', blk(0, 9, 1400, 700), { purpose: 'end card', shot: 'pan right to the card, then hold', sfx: 'closing chord (harp, glockenspiel, vibraphone)', push: 0.02 }, (S, L) => {
  const [x, y] = blk(0, 9, 1400, 700);
  L.ribbon(x + 700, y + 230, 860, 120, 'THE OVERTHINKING PAD', 62, S.t0 + 0.2, { d: 0.35, td: 0.9 });
  L.TXT('why your brain does this, on one page', x + 700, y + 420, 48, { f: 'PH', align: 'center', col: L.INK2 }, S.t0 + 1.3, 1.0);
  L.TXT('new pages Mon · Tue · Thu · Sat', x + 700, y + 520, 50, { f: 'KB', align: 'center' }, S.t0 + 2.4, 1.0);
  L.loop(x + 700, y + 230, 520, 110, S.t0 + 3.6, 0.6);
});

// ---------- the Short (9:16): blocks are tall, 900 × 1150 ----------
const SBW = 900, SBH = 1150, sblk = i => [i * 1050, 0, SBW, SBH];
const SHORT = {};
def(SHORT, 's1', sblk(0), { purpose: 'hook in the first second (EXP-001 treatment: your-moment-first): you, awake in bed with the worry cloud, then morning and "nothing happened"', shot: 'opens close on the worried face in bed from frame 0 (fully drawn), pulls back to show the night window; the moon is swapped for a sun on "nothing"', sfx: 'clock tick on frame 0; a soft morning chime on "nothing"', noAutoCam: true }, (S, L) => {
  const B = sblk(0), [x, y] = B, c = S.fit(B);
  S.cam(S.t0, x + 260, y + 700, c.z * 1.9, 0.01); S.cam(S.t0 + 0.9, c.x, c.y, c.z * 1.03, 1.6, 'io');
  const H = bed(L, x + 60, y + 840, 620, S.t0 - 1.4, { you: true, kind: 'worry', look: [0.4, -1], k: 0.7 });
  cloud(L, x + 340, y + 470, 380, 190, S.t0 - 0.6, { tint: L.GRY2 }); L.TXT('what if...?', x + 340, y + 486, 48, { f: 'KB', align: 'center' }, S.t0 - 0.4, 0.3);
  moon(L, x + 160, y + 160, 50, S.t0 - 0.5); L.TXT('all night', x + 420, y + 180, 50, { f: 'KB', align: 'center' }, S.at('night') - 0.3, 0.4);
  sun(L, x + 750, y + 160, 60, S.at('nothing') - 0.2);
  L.react({ head: H.head }, S.at('nothing'), { kind: 'shock', look: [0.4, -1] });
  tag(L, x + 450, y + 990, 'nothing happened', 52, S.at('happened') - 0.3, { tint: L.YEL });
});
def(SHORT, 's2', sblk(1), { purpose: 'the study: Penn State, worriers wrote worries 4× a day for 10 days, then checked for a month', shot: 'pan right; a phone buzz and a note being written; the 10-day strip; the 30-day calendar with a question mark', sfx: 'four phone buzzes; pen; page flip' }, (S, L) => {
  const [x, y] = sblk(1);
  tag(L, x + 450, y + 90, 'PENN STATE · 2020', 50, S.at('penn') - 0.2);
  phone(L, x + 200, y + 330, 1.1, S.at('write') - 0.6); for (let i = 0; i < 3; i++) L.INK_(L.ell(x + 200, y + 330, 110 + i * 22, 170 + i * 22, -0.6, 0.6, 12), { w: 2.4, amp: 0.2, passes: 1 }, S.at('four') - 0.2 + i * 0.05, 0.04);
  L.TXT('4× a day', x + 200, y + 540, 44, { f: 'KB', align: 'center' }, S.at('four') - 0.1, 0.4);
  L.sheet(x + 420, y + 220, 400, 260, S.at('worries') - 0.5, { lines: 0 }); L.TXT('my worry:', x + 450, y + 300, 40, { f: 'PH' }, S.at('worries') - 0.3, 0.3); L.TXT('it will...', x + 450, y + 380, 40, { f: 'PH' }, S.at('worries') - 0.1, 0.3);
  calendar(L, x + 120, y + 620, 660, 140, 10, 10, S.at('ten') - 0.5, 0.4, { title: '10 DAYS' });
  calendar(L, x + 120, y + 800, 660, 260, 30, 10, S.at('month') - 0.6, 0.5, { title: 'THEN A MONTH OF CHECKING' });
  L.qmark(x + 830, y + 900, 90, S.at('true') - 0.3);
});
def(SHORT, 's3', sblk(2), { purpose: 'the payoff number: ~91% never happened; 7 people had none come true', shot: 'pan right; the 100-square grid fills; push on "91%"; seven tiny people below', sfx: 'a fast pencil rattle; a single low note on "ninety-one"' }, (S, L) => {
  const [x, y] = sblk(2);
  grid100(L, x + 180, y + 60, 54, S.t0 + 0.05, Math.max(1.2, S.at('ninety-one') - S.t0 - 0.2), { hit: 9 });
  L.TXT('91%', x + 450, y + 910, 140, { f: 'KB', align: 'center' }, S.at('ninety-one') - 0.2, 0.5);
  L.TXT('never happened', x + 450, y + 990, 50, { f: 'KB', align: 'center' }, S.at('never') - 0.2, 0.4); L.swash(x + 250, y + 1012, x + 650, S.at('happened') + 0.2, 0.3);
  for (let i = 0; i < 7; i++) L.person(x + 250 + i * 66, y + 730, 0.5, S.at('seven') - 0.3 + i * 0.05, { kind: 'shock', look: [0, -0.3], hair: ['tuft', 'long', 'cap', 'curly'][i % 4], k: 0.2 });
  L.TXT('7 people: zero came true', x + 450, y + 785, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('single') - 0.3, 0.5);
});
def(SHORT, 's4', sblk(3), { purpose: 'why it still feels useful: relief feels like proof; the brain credits the worry; the rain dance', shot: 'pan right; the loop worry → nothing happens → relief (yellow); then the rain dancer below as the analogy', sfx: 'a relieved sigh; a reward chime; rain patter' }, (S, L) => {
  const [x, y] = sblk(3);
  L.TXT('so why does it feel useful?', x + 450, y + 90, 46, { f: 'KB', align: 'center' }, S.at('useful') - 0.5, 0.5);
  brick(L, x + 450, y + 200, 300, 80, S.at('bad') - 0.4, { text: 'worry' }); brick(L, x + 690, y + 400, 300, 80, S.at("doesn't") - 0.2, { text: 'nothing happens', size: 30 }); brick(L, x + 210, y + 400, 300, 80, S.at('relief') - 0.2, { text: 'relief', col: L.YEL });
  L.inkArrow([[x + 600, y + 240], [x + 680, y + 350]], { w: 4 }, S.at("doesn't"), 0.2); L.inkArrow([[x + 530, y + 400], [x + 370, y + 400]], { w: 4 }, S.at('relief'), 0.2); L.inkArrow([[x + 220, y + 350], [x + 300, y + 240]], { w: 4, col: L.YELD }, S.at('credit') - 0.2, 0.25);
  tag(L, x + 450, y + 530, 'relief feels like proof', 40, S.at('proof') - 0.3);
  rainDance(L, x + 450, y + 1000, 1.2, S.at('dance') - 0.6, { rainT: S.at('rains') - 0.1 });
});
def(SHORT, 's5', sblk(4), { purpose: 'one practical line: write the worry as a prediction with a date, then check it', shot: 'pan right; a hand-held card: PREDICTION / DATE / CHECK, filled as narrated; push on the check box', sfx: 'pen; a check tick' }, (S, L) => {
  const [x, y] = sblk(4);
  L.TXT('try this', x + 450, y + 120, 60, { f: 'KB', align: 'center' }, S.at('try') - 0.2, 0.4);
  L.box(x + 100, y + 230, 700, 660, S.at('write') - 0.4, 0.3, { r: 18 });
  L.TXT('prediction:', x + 150, y + 340, 42, { f: 'KB' }, S.at('prediction') - 0.4, 0.3); L.TXT('"I\'ll freeze"', x + 200, y + 420, 44, { f: 'PH' }, S.at('prediction') - 0.1, 0.4);
  L.TXT('date:', x + 150, y + 540, 42, { f: 'KB' }, S.at('date') - 0.3, 0.2); L.TXT('Nov 24', x + 300, y + 540, 44, { f: 'PH' }, S.at('date') - 0.1, 0.3);
  L.TXT('did it happen?', x + 150, y + 680, 42, { f: 'KB' }, S.at('check') - 0.4, 0.3); L.INK_(L.rrect(x + 560, y + 630, 70, 70, 8), { closed: true, w: 3, amp: 0.2 }, S.at('check') - 0.3, 0.1); L.check(x + 595, y + 665, 2.6, S.at('check') + 0.2, { col: L.YELD });
  L.TXT('example', x + 780, y + 860, 30, { f: 'PH', align: 'right', col: L.INK2 }, S.at('check') + 0.2, 0.2);
});
def(SHORT, 's6', sblk(5), { purpose: 'loop back to the bed + one comment question', shot: 'pan right; the bed returns small at the top (callback to frame 0); hold on the question', sfx: 'pen; closing kalimba' }, (S, L) => {
  const [x, y] = sblk(5);
  bed(L, x + 180, y + 360, 460, S.t0 + 0.05, { you: true, kind: 'think', look: [0.4, -1], s: 0.8, k: 0.5 }); moon(L, x + 760, y + 120, 40, S.t0 + 0.2);
  L.bubble(x + 60, y + 470, 780, 300, S.t0 + 0.2, { tint: 'rgba(255,205,40,0.25)' });
  L.TXT('What did you worry about', x + 450, y + 580, 50, { f: 'KB', align: 'center' }, S.at('worry') - 0.4, 0.6);
  L.TXT('last month...', x + 450, y + 660, 50, { f: 'KB', align: 'center' }, S.at('month') - 0.2, 0.4);
  L.TXT('that never happened?', x + 450, y + 740, 50, { f: 'KB', align: 'center' }, S.at('never') - 0.2, 0.5);
  L.TXT('tell me below', x + 450, y + 960, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('happened') + 0.3, 0.5);
});

export default { long: { scenes: LONG }, short: { scenes: SHORT } };
