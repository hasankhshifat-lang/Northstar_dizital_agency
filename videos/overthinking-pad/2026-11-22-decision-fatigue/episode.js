// The Overthinking Pad, episode 2026-11-22: "Is Decision Fatigue Real? What the Hungry Judges Study Got Wrong".
// Storyboard + drawings per scene (purpose, shot, sfx per scene). Layout: row 0 = cold open (the office at 4 p.m.; the ending whips back to it), rows 1-5 = chapters 1-5.
// Recurring objects: the saw-tooth parole chart, the willpower battery, the fork (think it through vs the default).
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

const LONG = {};
const def = (F, id, block, o, draw) => { F[id] = { block, ...o, draw }; };
// the office at 4 p.m. (cold open + callback): desk, laptop, email pile, the asker on the right. returns the two people
function office(L, x, y, t0, o = {}) {
  const k = o.k || 1;
  desk(L, x + 120, y + 640, 620, t0, { h: 860 - 640 });
  const P = L.person(x + 330, y + 860, 1.6, t0 + 0.1, { pose: 'sit', you: true, kind: o.kind || 'bored', look: [0.6, -0.2], hair: 'tuft', k: 0.9 * k });
  laptop(L, x + 560, y + 640, 1.1, t0 + 0.4);
  for (let i = 0; i < (o.mails ?? 6); i++) envelope(L, x + 200 + (i % 3) * 30, y + 610 - i * 34, 0.9, t0 + 0.5 + i * 0.06);
  L.clock(x + 1380, y + 160, 70, t0 + 0.3); L.TXT('4:00 PM', x + 1380, y + 280, 42, { f: 'KB', align: 'center' }, t0 + 0.5, 0.4);
  return P;
}

// ===== cold open: 4 p.m. =====
def(LONG, 'hook1', blk(0, 1), { purpose: 'hook: the 4 p.m. freeze, shown before it is named', shot: 'opens close on the tired face at the desk from frame 0, pulls back as the day piles up (emails, lunch, meeting), holds wide when the dinner question lands; the spinner over the head = the brain stops', sfx: 'office hum; a mail ping per email; a soft "pop" on the question; silence on "stops"', noAutoCam: true }, (S, L) => {
  const B = blk(0, 1), [x, y] = B, c = S.fit(B);
  S.cam(S.t0 - 0.01, x + 360, y + 560, 2.2, 0.01); S.cam(S.at('emails') - 0.4, x + 600, y + 520, 1.3, 1.4, 'io'); S.cam(S.at('dinner') - 1.2, c.x, c.y, c.z * 1.02, 1.4, 'io');
  const P = office(L, x, y, S.t0 - 1.2, { kind: 'bored' });
  L.TXT('40', x + 420, y + 390, 54, { f: 'KB', align: 'center' }, S.at('forty') - 0.1, 0.3); L.TXT('emails', x + 420, y + 440, 34, { f: 'PH', align: 'center', col: L.INK2 }, S.at('emails') - 0.1, 0.3);
  L.cup(x + 690, y + 600, 0.7, S.at('lunch') - 0.3); L.check(x + 760, y + 560, 1.4, S.at('lunch'));
  L.bubble(x + 820, y + 360, 300, 90, S.at('meeting') - 0.4, { text: 'meeting? ...yes', size: 32, tail: [x + 700, y + 470] });
  const Q = L.person(x + 1250, y + 860, 1.5, S.at('asks') - 0.5, { pose: 'point', kind: 'smile', look: [-1, 0], hair: 'long', k: 0.7, dir: -1 });
  L.bubble(x + 900, y + 470, 460, 130, S.at('dinner') - 0.5, { text: 'what do you want for dinner?', size: 32, tail: [Q.head[0] - 30, Q.head[1] - 20], tint: 'rgba(255,205,40,0.25)' });
  L.react(P, S.at('brain') - 0.1, { kind: 'shock', look: [1, -0.3] });
  spinner(L, P.head[0], P.head[1] - P.head[2] * 2.1, 40, S.at('stops') - 0.2);
});
def(LONG, 'hook2', blk(0, 2), { purpose: 'name it + the famous study: judges, parole, meals', shot: 'pan right; the label first, then the bench and the plate; push on the clock between the plate and the gavel', sfx: 'a gavel tap on "parole"; a plate clink on "meal"' }, (S, L) => {
  const [x, y] = blk(0, 2);
  tag(L, x + 800, y + 110, 'DECISION FATIGUE', 72, S.at('decision') - 0.3, { tint: L.YEL });
  bench(L, x + 160, y + 820, 640, 300, S.at('judges') - 0.5);
  const J = L.person(x + 480, y + 520, 1.3, S.at('judges') - 0.3, { pose: 'hold', kind: 'neutral', look: [1, 0.3], hair: 'messy', k: 0.6 });
  gavel(L, J.hand[1][0] + 30, J.hand[1][1] - 20, 0.9, S.at('parole') - 0.2, { bang: true });
  L.TXT('PAROLE?', x + 480, y + 680, 56, { f: 'KB', align: 'center' }, S.at('parole'), 0.4);
  plate(L, x + 1200, y + 640, 1.3, S.at('meal') - 0.8); L.clock(x + 1200, y + 380, 80, S.at('long') - 0.2);
  L.TXT('time since the last meal', x + 1200, y + 790, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('last') - 0.2, 0.6);
  L.inkArrow([[x + 1080, y + 380], [x + 860, y + 420]], { w: 4 }, S.at('meal'), 0.3);
});
def(LONG, 'hook3', blk(0, 3), { purpose: 'the twist: the study and the theory got checked; some did not survive', shot: 'pan right; the study card is stamped CHECKED, a magnifier sweeps it; push on the torn half', sfx: 'stamp thud on "checked"; paper tear on "survive"' }, (S, L) => {
  const [x, y] = blk(0, 3);
  card(L, x + 160, y + 160, 520, 340, S.t0 + 0.1, { lines: [['the hungry judges', 46], ['2011', 40, 'PH']] });
  card(L, x + 160, y + 540, 520, 300, S.at('theory') - 0.3, { lines: [['the willpower battery', 40], ['1998', 40, 'PH']] });
  L.TXT('almost nobody mentions...', x + 1150, y + 160, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('mentions') - 0.5, 0.6);
  const mx = x + 1150, my = y + 400; L.INK_(L.ell(mx, my, 110, 110, 0, L.TAU, 40), { closed: true, w: 5, amp: 0.4 }, S.at('checked') - 0.4, 0.2); L.INK_(L.line(mx + 78, my + 78, mx + 190, my + 190), { w: 10, amp: 0.2, passes: 1 }, S.at('checked') - 0.25, 0.1);
  tag(L, x + 420, y + 330, 'CHECKED', 54, S.at('checked'), { tint: L.YEL });
  tag(L, x + 420, y + 700, 'CHECKED', 54, S.at('theory') + 0.4, { tint: L.YEL });
  L.qmark(mx, my + 40, 140, S.at("didn't") - 0.2);
  L.TXT("some didn't survive", x + 1150, y + 720, 56, { f: 'KB', align: 'center' }, S.at('survive') - 0.4, 0.6); L.swash(x + 900, y + 745, x + 1400, S.at('survive') + 0.3, 0.3);
});
def(LONG, 'hook4', blk(0, 4), { purpose: 'the promise: real or myth? stranger than yes/no; which parts to believe + what helps', shot: 'pan right; two boxes REAL / MYTH, the pen hovers then draws a third box in between; push on it', sfx: 'pen taps on each box; a kalimba on "helps"' }, (S, L) => {
  const [x, y] = blk(0, 4);
  L.TXT('is decision fatigue real?', x + 800, y + 140, 64, { f: 'KB', align: 'center' }, S.at('real') - 0.8, 0.8);
  const bx = (cx, lab, t) => { L.box(cx - 160, y + 300, 320, 160, t, 0.25, { r: 18 }); L.TXT(lab, cx, y + 400, 60, { f: 'KB', align: 'center' }, t + 0.2, 0.3); };
  bx(x + 300, 'YES', S.at('yes') - 0.4); bx(x + 1300, 'NO', S.at('no') - 0.4);
  L.box(x + 560, y + 280, 480, 200, S.at('stranger') - 0.2, 0.3, { r: 22, tint: 'rgba(255,205,40,0.3)' }); L.TXT('it\'s stranger', x + 800, y + 400, 60, { f: 'KB', align: 'center' }, S.at('stranger'), 0.5);
  notepad(L, x + 520, y + 560, 560, 300, S.at('end') - 0.3, ['which parts to believe', 'what actually helps'], { it: [S.at('believe') - 0.5, S.at('helps') - 0.5], size: 40 });
  L.check(x + 561, y + 627, 1.3, S.at('believe') + 0.2); L.check(x + 561, y + 691, 1.3, S.at('helps') + 0.2);
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

// ===== chapter 1: the hungry judges =====
chapter(LONG, 'ch1', 1, 1, 'THE HUNGRY JUDGES');
def(LONG, 'c1a', blk(1, 1), { purpose: 'who and where: Danziger, Levav, Avnaim-Pesso, 2011, Israeli parole hearings', shot: 'pan right from the banner; the three researcher heads are written in, then the place tag; slow push', sfx: 'pen; page tap on "Israel"' }, (S, L) => {
  const [x, y] = blk(1, 1);
  tag(L, x + 800, y + 110, '2011', 60, S.at('twenty') - 0.2);
  const names = [['Shai Danziger', 'shai', 'tuft'], ['Jonathan Levav', 'jonathan', 'curly'], ['Liora Avnaim-Pesso', 'liora', 'long']];
  names.forEach(([n, cue, hair], i) => { const cx = x + 300 + i * 500, t = S.at(cue) - 0.4; L.head(cx, y + 360, 90, t, { hair, kind: 'think', look: [0, 0.3], k: 0.7 }); L.TXT(n, cx, y + 530, 44, { f: 'KB', align: 'center' }, t + 0.3, 0.6); });
  bench(L, x + 600, y + 860, 400, 160, S.at('parole') - 0.4); L.TXT('parole hearings · Israel', x + 800, y + 640, 48, { f: 'PH', align: 'center', col: L.INK2 }, S.at('israel') - 0.8, 0.8);
});
def(LONG, 'c1b', blk(1, 2), { purpose: 'the data: 1,000+ rulings, 8 judges, 10 months; the day = 3 sessions split by 2 food breaks', shot: 'pan right; the stack of rulings grows on the left, then the day bar is drawn left to right with the two meals dropped in', sfx: 'paper flicks for the stack; a cup clink and a plate clink' }, (S, L) => {
  const [x, y] = blk(1, 2);
  for (let i = 0; i < 8; i++) L.sheet(x + 120 + (i % 2) * 14, y + 520 - i * 40, 220, 120, S.at('thousand') - 0.4 + i * 0.06, { lines: 2 });
  L.TXT('1,000+ rulings', x + 240, y + 720, 48, { f: 'KB', align: 'center' }, S.at('rulings') - 0.2, 0.5);
  for (let i = 0; i < 8; i++) L.head(x + 520 + i * 70, y + 240, 24, S.at('eight') - 0.2 + i * 0.05, { hair: ['tuft', 'long', 'cap', 'curly'][i % 4], kind: 'neutral', k: 0.3 });
  L.TXT('8 judges · 10 months', x + 765, y + 330, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('months') - 0.6, 0.6);
  const dy = y + 560, x0 = x + 480, w = 1000;
  L.INK_(L.rrect(x0, dy - 50, w, 100, 20), { closed: true, w: 3, amp: 0.5 }, S.at('day') - 0.3, 0.3);
  ['session 1', 'session 2', 'session 3'].forEach((t, i) => L.TXT(t, x0 + w * (i + 0.5) / 3, dy + 14, 38, { f: 'KB', align: 'center' }, S.at('three') + i * 0.15, 0.3));
  L.INK_(L.line(x0 + w / 3, dy - 70, x0 + w / 3, dy + 70), { w: 4, amp: 0.3, passes: 1 }, S.at('snack') - 0.4, 0.1); L.cup(x0 + w / 3, dy + 150, 0.8, S.at('snack') - 0.2); L.TXT('snack', x0 + w / 3, dy + 240, 36, { f: 'PH', align: 'center', col: L.INK2 }, S.at('snack'), 0.2);
  L.INK_(L.line(x0 + w * 2 / 3, dy - 70, x0 + w * 2 / 3, dy + 70), { w: 4, amp: 0.3, passes: 1 }, S.at('lunch') - 0.4, 0.1); plate(L, x0 + w * 2 / 3, dy + 150, 0.6, S.at('lunch') - 0.2); L.TXT('lunch', x0 + w * 2 / 3, dy + 240, 36, { f: 'PH', align: 'center', col: L.INK2 }, S.at('lunch'), 0.2);
});
// the chart block for c1c-c1x: one big chart drawn across four scenes (row 1, col 3)
const CH = blk(1, 3), CX = CH[0] + 240, CY = CH[1] + 760, CW = 1200, CHH = 560;
def(LONG, 'c1c', CH, { purpose: 'set up the one measure: chance of parole by position in the session', shot: 'pan right; empty axes are drawn and labelled (the viewer reads the question before the data)', sfx: 'ruler-straight pen strokes' }, (S, L) => {
  L.INK_(L.line(CX, CY, CX + CW, CY), { w: 3.4, amp: 0.4 }, S.t0 + 0.2, 0.3); L.INK_(L.line(CX, CY, CX, CY - CHH), { w: 3.4, amp: 0.4 }, S.t0 + 0.35, 0.3);
  L.TXT('chance of parole', CX + 10, CY - CHH - 30, 42, { f: 'KB' }, S.at('chance') - 0.2, 0.6);
  L.TXT('position of the case in the session  →', CX + CW / 2, CY + 110, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('where') - 0.3, 0.8);
  L.TXT('first', CX + 60, CY + 50, 34, { f: 'PH', align: 'center', col: L.INK2 }, S.at('session') - 0.2, 0.2); L.TXT('last', CX + CW / 3 - 60, CY + 50, 34, { f: 'PH', align: 'center', col: L.INK2 }, S.at('session'), 0.2);
});
const lvC = v => CY - CHH * v / 0.8, swC = CW / 3;
function slide(L, i, t, d) { const x0 = CX + i * swC + 12, x1 = CX + (i + 1) * swC - 36, P = []; for (let q = 0; q <= 24; q++) { const u = q / 24; P.push([x0 + (x1 - x0) * u, lvC(0.65 - 0.6 * u + 0.03 * Math.sin(q * 1.7 + i))]); } L.MST(P, { w: 9, col: L.INK, amp: 0.6 }, t, d); return P; }
def(LONG, 'c1d', CH, { purpose: 'session 1: 65% at the start, sliding to near zero before the break', shot: 'the camera stays on the chart and follows the pen down the slope (the drop is the story)', sfx: 'a descending pluck under the slope', camFit: [CH[0], CH[1], 900, 900], push: 0.06 }, (S, L) => {
  L.INK_(L.line(CX - 14, lvC(0.65), CX + CW, lvC(0.65)), { w: 1.8, amp: 0.4, passes: 1, dash: [10, 10], alpha: 0.6 }, S.at('sixty') - 0.3, 0.3);
  L.TXT('65%', CX - 24, lvC(0.65) + 12, 40, { f: 'KB', align: 'right' }, S.at('sixty') - 0.1, 0.2); L.TXT('0', CX - 24, CY + 10, 40, { f: 'KB', align: 'right' }, S.at('zero') - 0.3, 0.1);
  L.MRK([L.ell(CX + 14, lvC(0.65), 18, 18, 0, L.TAU, 16)], { col: L.YEL, w: 12, edge: false }, S.at('start') - 0.1, 0.1);
  slide(L, 0, S.at('case') - 0.2, Math.max(1.2, S.at('zero') - S.at('case')));
  L.TXT('≈ 0', CX + swC - 30, lvC(0.05) - 40, 40, { f: 'KB', align: 'center' }, S.at('zero') - 0.1, 0.2);
});
def(LONG, 'c1e', CH, { purpose: 'the break: they eat, the rate jumps back to 65% and slides again', shot: 'slow pan right along the chart to the second session; the plate is dropped in at the gap; the line jumps', sfx: 'plate clink on "ate"; an upward pluck on the jump', camFit: [CH[0] + 300, CH[1], 1100, 900], push: 0.04 }, (S, L) => {
  const bx = CX + swC - 12; L.INK_(L.line(bx, CY - 4, bx, CY - CHH * 0.95), { w: 2, amp: 0.4, passes: 1, dash: [8, 8], alpha: 0.6 }, S.at('break') - 0.3, 0.2);
  L.cup(bx, CY - CHH * 0.98, 0.7, S.at('ate') - 0.3); L.TXT('snack', bx, CY + 50, 34, { f: 'PH', align: 'center', col: L.INK2 }, S.at('ate'), 0.2);
  L.inkArrow([[bx - 18, lvC(0.06)], [bx + 4, lvC(0.6)]], { w: 4 }, S.at('jumped') - 0.2, 0.2);
  slide(L, 1, S.at('sliding') - 0.4, 1.6);
});
def(LONG, 'c1x', CH, { purpose: 'the full saw: three sessions, three slides, three jumps (the picture people remember)', shot: 'pull back to the whole chart as the third slide is drawn; hold on the saw-tooth shape', sfx: 'third descending pluck; a low cold note on "chill"', camFit: [CH[0], CH[1] - 50, 1600, 1000], push: 0.02 }, (S, L) => {
  const bx = CX + swC * 2 - 12; L.INK_(L.line(bx, CY - 4, bx, CY - CHH * 0.95), { w: 2, amp: 0.4, passes: 1, dash: [8, 8], alpha: 0.6 }, S.at('three') - 0.2, 0.2);
  plate(L, bx, CY - CHH * 0.98, 0.5, S.at('three')); L.TXT('lunch', bx, CY + 50, 34, { f: 'PH', align: 'center', col: L.INK2 }, S.at('three') + 0.2, 0.2);
  slide(L, 2, S.at('slides') - 0.3, 1.4);
  L.TXT('the saw', CX + CW - 60, CY - CHH - 20, 52, { f: 'KB', align: 'center' }, S.at('saw') - 0.3, 0.4); L.swash(CX + CW - 180, CY - CHH + 6, CX + CW + 60, S.at('saw') + 0.2, 0.3);
});
def(LONG, 'c1f', blk(1, 4), { purpose: 'the authors\' reading: worn down → fall back on the easy option = say no, keep the status quo', shot: 'pan right; the judge slumps as rulings stack, the fork appears and the yellow default path lights on "say no"', sfx: 'paper flicks; a stamp on "no"' }, (S, L) => {
  const [x, y] = blk(1, 4);
  bench(L, x + 100, y + 860, 520, 260, S.t0 + 0.1);
  const J = L.person(x + 360, y + 600, 1.3, S.t0 + 0.2, { pose: 'hold', kind: 'neutral', look: [1, 0.3], hair: 'messy', k: 0.6 });
  for (let i = 0; i < 5; i++) L.sheet(x + 480, y + 560 - i * 26, 120, 70, S.at('ruling') + i * 0.12, { lines: 1 });
  L.react(J, S.at('down') - 0.1, { kind: 'bored', look: [0.5, 0.6] });
  fork(L, x + 800, y + 640, 640, S.at('easy') - 0.6, { hard: 'grant parole: think, weigh, explain', easy: 'NO · keep things as they are', easyT: Math.max(0.5, S.at('no') - S.at('easy') + 0.4), ls: 36 });
  tag(L, x + 1150, y + 130, 'the easy option', 52, S.at('option') - 0.2);
});
def(LONG, 'c1g', blk(1, 5), { purpose: 'it went everywhere: books, talks, blogs, Kahneman; "your freedom depends on lunch"', shot: 'pan right; a burst of media icons around the saw thumbnail; push on the headline', sfx: 'quick pen pops for each icon' }, (S, L) => {
  const [x, y] = blk(1, 5);
  sawChart(L, x + 620, y + 560, 360, 220, S.t0 + 0.1, { ts: [S.t0 + 0.2, S.t0 + 0.4, S.t0 + 0.6], d: 0.25, ls: 26, blab: false });
  const it = [['BOOKS', 'books', 260, 220], ['TALKS', 'talks', 1340, 220], ['BLOGS', 'blogs', 260, 660], ['best seller', 'seller', 1340, 660]];
  it.forEach(([t, cue, dx, dy]) => { tag(L, x + dx, y + dy, t, 46, S.at(cue) - 0.3); L.inkArrow([[x + dx + (dx < 800 ? 140 : -140), y + dy], [x + (dx < 800 ? 600 : 1000), y + 450]], { w: 3 }, S.at(cue) - 0.1, 0.2); });
  L.TXT('Daniel Kahneman', x + 1340, y + 740, 36, { f: 'PH', align: 'center', col: L.INK2 }, S.at('kahneman') - 0.2, 0.5);
  L.TXT('"your freedom depends on lunch"', x + 800, y + 860, 52, { f: 'KB', align: 'center' }, S.at('freedom') - 0.3, 1.0);
});
def(LONG, 'c1h', blk(1, 6), { purpose: 'the bridge: it fit a theory that willpower is a battery (open question into ch 2)', shot: 'pan right; the head is drawn, a battery slides into it; push on the battery', sfx: 'a battery click on "battery"' }, (S, L) => {
  const [x, y] = blk(1, 6);
  L.head(x + 480, y + 460, 190, S.t0 + 0.2, { you: true, kind: 'think', look: [1, -0.3], k: 1 });
  L.TXT('a theory, 10+ years in the making', x + 1100, y + 200, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('decade') - 0.6, 0.8);
  battery(L, x + 1100, y + 480, 360, 170, 0.75, S.at('battery') - 0.8);
  L.TXT('willpower = a battery?', x + 1100, y + 720, 60, { f: 'KB', align: 'center' }, S.at('willpower') - 0.2, 0.8);
  L.inkArrow([[x + 900, y + 480], [x + 700, y + 460]], { w: 4 }, S.at('battery') - 0.2, 0.25);
});

// ===== chapter 2: the willpower battery =====
chapter(LONG, 'ch2', 2, 2, 'THE WILLPOWER BATTERY');
def(LONG, 'c2a', blk(2, 1), { purpose: 'the 1998 experiment set-up: hungry students, a lab smelling of cookies', shot: 'pan right; the lab door, the smell lines curling out of the oven tray toward the student\'s nose', sfx: 'oven ding; a sniff' }, (S, L) => {
  const [x, y] = blk(2, 1);
  tag(L, x + 300, y + 110, '1998', 56, S.at('nineteen') - 0.2); L.TXT('Roy Baumeister & colleagues', x + 300, y + 200, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('baumeister') - 0.3, 0.6);
  const P = L.person(x + 380, y + 840, 1.7, S.at('students') - 0.5, { pose: 'walk', you: true, kind: 'neutral', look: [1, -0.2], k: 0.8 });
  L.TXT('hungry', P.head[0], P.head[1] - 110, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('hungry') - 0.2, 0.3);
  desk(L, x + 900, y + 600, 560, S.at('lab') - 0.4, { h: 240 });
  for (let i = 0; i < 6; i++) cookie(L, x + 980 + (i % 3) * 120, y + 570 - Math.floor(i / 3) * 50, 40, S.at('cookies') - 0.6 + i * 0.06);
  for (let i = 0; i < 3; i++) L.MST(L.bez([x + 1000 + i * 120, y + 470], [x + 960 + i * 120, y + 400], [x + 1040 + i * 120, y + 360], [x + 990 + i * 120, y + 280]), { w: 4, col: L.GRYD, amp: 1 }, S.at('smelled') - 0.2 + i * 0.1, 0.4);
  L.react(P, S.at('chocolate'), { kind: 'grin', look: [1, -0.5] });
});
def(LONG, 'c2b', blk(2, 2), { purpose: 'the two groups: cookies allowed vs sit in front of them and eat radishes', shot: 'pan right; split frame, left group happy with cookies, right group stares at the cookies while holding a radish (the contrast)', sfx: 'a crunch; a sad crunch' }, (S, L) => {
  const [x, y] = blk(2, 2);
  L.INK_(L.line(x + 800, y + 80, x + 800, y + 860), { w: 2.4, amp: 1, passes: 1, dash: [12, 10], alpha: 0.6 }, S.t0 + 0.1, 0.3);
  const A = L.person(x + 380, y + 820, 1.6, S.at('allowed') - 0.5, { pose: 'hold', kind: 'grin', look: [0.5, 0], k: 0.7 }); cookie(L, A.hand[1][0] + 10, A.hand[1][1] - 20, 40, S.at('cookies') - 0.2);
  L.TXT('cookies', x + 380, y + 200, 56, { f: 'KB', align: 'center' }, S.at('cookies') - 0.1, 0.4);
  const B = L.person(x + 1220, y + 820, 1.6, S.at('others') - 0.3, { pose: 'hold', you: true, kind: 'sad', look: [-1, 0.2], k: 0.7, dir: -1 });
  for (let i = 0; i < 3; i++) cookie(L, x + 920 + i * 90, y + 600, 34, S.at('front') - 0.3 + i * 0.05);
  radish(L, B.hand[0][0], B.hand[0][1] - 30, 1.1, S.at('radishes') - 0.3);
  L.TXT('radishes', x + 1220, y + 200, 56, { f: 'KB', align: 'center' }, S.at('radishes') - 0.1, 0.4);
  L.react(B, S.at('instead'), { kind: 'worry', look: [-1, 0.4] });
});
def(LONG, 'c2c', blk(2, 3), { purpose: 'the unsolvable puzzle and the stopwatch (what was really measured)', shot: 'pan right; the puzzle drawn, the hidden "impossible" note revealed, then the stopwatch starts', sfx: 'puzzle clatter; stopwatch click' }, (S, L) => {
  const [x, y] = blk(2, 3);
  student(L, x + 380, y + 820, 1.6, S.at('puzzle') - 0.6, { kind: 'think', look: [1, 0.4], hair: 'tuft' });
  puzzle(L, x + 760, y + 420, 2.2, S.at('puzzle') - 0.2); puzzle(L, x + 940, y + 480, 1.6, S.at('puzzle'), { col: L.GRY });
  L.TXT('(it could not be solved)', x + 860, y + 640, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('solved') - 0.6, 0.6); L.MRK([[[x + 640, y + 640], [x + 1080, y + 640]]], { col: L.YEL, w: 16, edge: false }, S.at('solved') - 0.2, 0.3);
  L.clock(x + 1320, y + 400, 110, S.at('timed') - 0.3); L.INK_(L.rrect(x + 1300, y + 260, 40, 30, 6), { closed: true, w: 3, amp: 0.2, passes: 1 }, S.at('timed') - 0.1, 0.05);
  L.TXT('how long until they quit?', x + 1250, y + 620, 42, { f: 'KB', align: 'center' }, S.at('trying') - 0.8, 0.8);
});
def(LONG, 'c2d', blk(2, 4), { purpose: 'the result: radish eaters quit at ~8 min, cookie eaters ~20 min', shot: 'pan right; two bars grow, push on the short radish bar', sfx: 'two rising plucks, the first cut short' }, (S, L) => {
  const [x, y] = blk(2, 4);
  bars(L, x + 360, y + 760, 880, 560, [{ v: 0.38, label: 'radish eaters', top: '≈ 8 min', col: 'rgba(214,80,110,0.45)', t: S.at('radish') - 0.2 }, { v: 0.9, label: 'cookie eaters', top: '≈ 20 min', col: 'rgba(200,150,80,0.45)', t: S.at('cookie') - 0.2 }], S.t0 + 0.1, { ls: 40, ts: 52 });
  radish(L, x + 300, y + 840, 0.9, S.at('radish')); cookie(L, x + 1300, y + 840, 34, S.at('cookie'));
  L.TXT('minutes trying', x + 360, y + 150, 40, { f: 'PH', col: L.INK2 }, S.t0 + 0.2, 0.5);
});
def(LONG, 'c2x', blk(2, 5), { purpose: 'the only difference: a few minutes of not eating cookies', shot: 'pan right; the two students side by side, identical; one detail circled (the radish)', sfx: 'pen circle squeak' }, (S, L) => {
  const [x, y] = blk(2, 5);
  student(L, x + 300, y + 780, 1.4, S.at('same') - 0.5, { kind: 'neutral', look: [1, 0.4], hair: 'tuft' }); student(L, x + 900, y + 780, 1.4, S.at('same') - 0.3, { kind: 'neutral', look: [1, 0.4], hair: 'tuft' });
  L.TXT('same students · same puzzle', x + 800, y + 140, 54, { f: 'KB', align: 'center' }, S.at('puzzle') - 0.6, 0.8);
  cookie(L, x + 420, y + 640, 30, S.at('difference') - 0.3); radish(L, x + 1020, y + 640, 0.8, S.at('difference') - 0.2);
  L.loop(x + 1020, y + 640, 90, 80, S.at('minutes') - 0.2, 0.4);
  L.TXT('a few minutes of NOT eating', x + 1150, y + 380, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('not') - 0.3, 0.6);
});
def(LONG, 'c2e', blk(2, 6), { purpose: 'the theory named: ego depletion, a limited resource; spend some → less left', shot: 'pan right; the battery drains in steps as each "hard thing" icon takes a bite', sfx: 'battery clicks down' }, (S, L) => {
  const [x, y] = blk(2, 6);
  tag(L, x + 800, y + 110, 'EGO DEPLETION', 70, S.at('ego') - 0.2, { tint: L.YEL });
  battery(L, x + 400, y + 450, 360, 170, 0.9, S.at('limited') - 0.6); L.TXT('full', x + 400, y + 600, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('limited'), 0.3);
  cookie(L, x + 800, y + 450, 46, S.at('cookies') - 0.3); L.cross(x + 800, y + 450, 3, S.at('cookies')); L.TXT('resist', x + 800, y + 560, 36, { f: 'PH', align: 'center', col: L.INK2 }, S.at('resisting') - 0.2, 0.3);
  battery(L, x + 1200, y + 450, 360, 170, 0.3, S.at('less') - 0.5); L.TXT('less left', x + 1200, y + 600, 40, { f: 'KB', align: 'center' }, S.at('left') - 0.2, 0.3);
  L.inkArrow([[x + 600, y + 450], [x + 720, y + 450]], { w: 4 }, S.at('spend') - 0.1, 0.2); L.inkArrow([[x + 880, y + 450], [x + 1000, y + 450]], { w: 4 }, S.at('less') - 0.2, 0.2);
  puzzle(L, x + 1200, y + 760, 1.3, S.at('hard') - 0.3); L.qmark(x + 1320, y + 770, 90, S.at('thing'));
});
def(LONG, 'c2f', blk(2, 7), { purpose: 'choosing itself drains: choosers (products, courses) vs lookers', shot: 'pan right; a menu of options; the chooser ticks boxes frantically, the looker just looks; then both face the next task', sfx: 'tick tick tick; a quiet page turn for the looker' }, (S, L) => {
  const [x, y] = blk(2, 7);
  L.TXT('choosing itself?', x + 800, y + 110, 60, { f: 'KB', align: 'center' }, S.at('choosing') - 0.4, 0.6);
  notepad(L, x + 140, y + 220, 520, 440, S.at('choices') - 0.6, ['mug or pen?', 'red or blue?', 'history or art?', 'this or that?'], { it: [S.at('choices') - 0.3, S.at('products') - 0.3, S.at('college') - 0.3, S.at('courses')], size: 36 });
  for (let i = 0; i < 4; i++) L.check(x + 181, y + 287 + i * 64, 1.2, S.at('products') + i * 0.25);
  const A = L.person(x + 400, y + 860, 1.0, S.at('choices'), { pose: 'point', you: true, kind: 'worry', look: [0, -1], k: 0.5 });
  const B = L.person(x + 1200, y + 860, 1.0, S.at('looked') - 0.5, { pose: 'stand', kind: 'content', look: [-0.6, -0.6], hair: 'long', k: 0.5 });
  L.sheet(x + 1060, y + 250, 280, 300, S.at('looked') - 0.6, { lines: 5 }); L.TXT('only looked', x + 1200, y + 620, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('looked') - 0.1, 0.4);
  battery(L, x + 800, y + 760, 200, 90, 0.25, S.at('less') - 0.4); L.TXT('less self-control after', x + 800, y + 860, 36, { f: 'KB', align: 'center' }, S.at('afterwards') - 0.4, 0.6);
});
def(LONG, 'c2g', blk(2, 8), { purpose: 'the sugar claim: fuel = blood glucose; lemonade tops it up', shot: 'pan right; a glass of lemonade is poured, a straw plugs into the battery; push in', sfx: 'pour; a fizz' }, (S, L) => {
  const [x, y] = blk(2, 8);
  const g = [[x + 380, y + 300], [x + 600, y + 300], [x + 570, y + 760], [x + 410, y + 760]]; L.FILL(g, S.at('lemonade') - 0.6); L.INK_(g, { closed: true, w: 3, amp: 0.3 }, S.at('lemonade') - 0.6, 0.2);
  L.MRK([[[x + 395, y + 400], [x + 585, y + 400], [x + 568, y + 750], [x + 412, y + 750]]], { col: L.YEL, w: 18 }, S.at('lemonade') - 0.3, 0.4);
  L.TXT('sugar', x + 490, y + 220, 50, { f: 'KB', align: 'center' }, S.at('sugar') - 0.2, 0.4);
  L.MST(L.bez([x + 560, y + 330], [x + 700, y + 160], [x + 900, y + 200], [x + 1000, y + 400]), { w: 8, col: L.GRYD }, S.at('top') - 0.8, 0.5);
  battery(L, x + 1150, y + 480, 320, 160, 0.95, S.at('battery') - 0.4);
  L.TXT('"top it back up"', x + 1150, y + 680, 52, { f: 'KB', align: 'center' }, S.at('back') - 0.2, 0.6);
});
def(LONG, 'c2h', blk(2, 9), { purpose: 'it became famous (hundreds of studies) — which is why it got tested properly (bridge to the turn)', shot: 'pan right; the paper stack grows to a tower; a magnifier arrives at the top on "testing"', sfx: 'paper flicks building; a single low note on "properly"' }, (S, L) => {
  const [x, y] = blk(2, 9);
  for (let i = 0; i < 12; i++) L.sheet(x + 300 + (i % 2) * 16, y + 760 - i * 46, 240, 110, S.at('hundreds') - 0.4 + i * 0.07, { lines: 2 });
  L.TXT('hundreds of studies', x + 420, y + 900, 44, { f: 'KB', align: 'center' }, S.at('studies') - 0.2, 0.5);
  L.TXT('one of the best known ideas', x + 1100, y + 240, 50, { f: 'KB', align: 'center' }, S.at('known') - 0.5, 0.8);
  const mx = x + 1100, my = y + 520; L.INK_(L.ell(mx, my, 120, 120, 0, L.TAU, 40), { closed: true, w: 5, amp: 0.4 }, S.at('testing') - 0.4, 0.2); L.INK_(L.line(mx + 85, my + 85, mx + 200, my + 200), { w: 10, amp: 0.2, passes: 1 }, S.at('testing') - 0.25, 0.1);
  L.TXT('tested properly', mx, my + 14, 40, { f: 'KB', align: 'center' }, S.at('properly') - 0.2, 0.5);
});

// ===== chapter 3: the check =====
chapter(LONG, 'ch3', 3, 3, 'THE CHECK');
def(LONG, 'c3a', blk(3, 1), { purpose: 'the reply: Weinshall-Margel & Shapard, same journal, within months', shot: 'pan right; a letter is pinned next to the saw chart (the reply arrives)', sfx: 'pin tap; paper' }, (S, L) => {
  const [x, y] = blk(3, 1);
  sawChart(L, x + 200, y + 620, 520, 340, S.t0 + 0.1, { ts: [S.t0 + 0.2, S.t0 + 0.5, S.t0 + 0.8], d: 0.3, ls: 30, blab: false });
  L.TXT('the judges', x + 460, y + 200, 50, { f: 'KB', align: 'center' }, S.at('judges') - 0.2, 0.4);
  card(L, x + 900, y + 240, 560, 420, S.at('reply') - 1.2, { lines: [['A REPLY', 54], ['Keren Weinshall-Margel', 36, 'PH'], ['John Shapard', 36, 'PH'], ['same journal, 2011', 34, 'PH']], lt: [S.at('reply') - 0.8, S.at('keren') - 0.2, S.at('john') - 0.2, S.at('journal') - 0.3] });
  L.inkArrow([[x + 880, y + 460], [x + 760, y + 460]], { w: 4 }, S.at('journal'), 0.2);
});
def(LONG, 'c3b', blk(3, 2), { purpose: 'the catch: case order not random; prisoners without lawyers heard last, less likely to get parole anyway', shot: 'pan right; a queue of prisoners walks to the bench; the ones at the back lose their lawyer figures; push on the end of the queue', sfx: 'footsteps; a pen circle on the last in line' }, (S, L) => {
  const [x, y] = blk(3, 2);
  bench(L, x + 1200, y + 820, 300, 260, S.t0 + 0.1); L.TXT('break', x + 1080, y + 300, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('session') - 0.2, 0.3);
  L.TXT('order of the cases', x + 520, y + 140, 54, { f: 'KB', align: 'center' }, S.at('order') - 0.3, 0.6); L.TXT('not random', x + 520, y + 220, 46, { f: 'PH', align: 'center', col: L.INK2 }, S.at('random') - 0.2, 0.4);
  for (let i = 0; i < 5; i++) { const px = x + 1060 - i * 190, last = i < 2, t = S.at('order') + i * 0.12; L.person(px, y + 820, 0.9, t, { pose: 'stand', kind: last ? 'worry' : 'neutral', look: [1, 0], hair: ['tuft', 'cap', 'curly', 'long', 'messy'][i], k: 0.4 });
    if (!last) { L.person(px + 70, y + 820, 0.7, S.at('lawyer') - 0.4 + i * 0.08, { kind: 'smile', look: [1, 0], hair: 'cap', k: 0.3 }); } }
  L.loop(x + 960, y + 700, 220, 190, S.at('last') - 0.2, 0.4); L.TXT('no lawyer → heard last', x + 960, y + 440, 42, { f: 'KB', align: 'center' }, S.at('last') - 0.1, 0.6);
  L.TXT('less likely to get parole anyway', x + 760, y + 920, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('anyway') - 0.8, 0.8);
});
def(LONG, 'c3c', blk(3, 3), { purpose: 'the original authors push back; doubts keep coming', shot: 'pan right; two speech bubbles trade back and forth; question marks pile up', sfx: 'pen taps per question mark' }, (S, L) => {
  const [x, y] = blk(3, 3);
  const A = L.person(x + 340, y + 820, 1.5, S.t0 + 0.1, { pose: 'point', kind: 'neutral', look: [1, 0], hair: 'tuft', k: 0.6 }); L.TXT('original authors', x + 340, y + 880, 36, { f: 'PH', align: 'center', col: L.INK2 }, S.t0 + 0.4, 0.4);
  L.bubble(x + 420, y + 260, 420, 120, S.at('replied') - 0.2, { text: "doesn't explain it", size: 38, tail: [A.head[0] + 40, A.head[1] - 40] });
  for (let i = 0; i < 5; i++) L.qmark(x + 1000 + (i % 3) * 160, y + 330 + Math.floor(i / 3) * 220, 120, S.at('doubts') - 0.2 + i * 0.15);
});
def(LONG, 'c3d', blk(3, 4), { purpose: 'Glöckner 2016 simulation: granting takes longer; a judge near the break avoids starting a long case', shot: 'pan right; two case files of different thickness and two timers; the clock to the break ticks; the judge eyes the thick file and pushes it to after the break', sfx: 'clock ticks; a file slide' }, (S, L) => {
  const [x, y] = blk(3, 4);
  tag(L, x + 300, y + 110, '2016 · Andreas Glöckner', 46, S.at('glockner') - 0.5); L.TXT('simulations', x + 300, y + 190, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('simulations') - 0.2, 0.4);
  for (let i = 0; i < 4; i++) L.sheet(x + 200 + i * 10, y + 320 + i * 10, 260, 150, S.at('granting') - 0.4 + i * 0.04, { lines: 3 }); L.TXT('grant: longer', x + 340, y + 560, 42, { f: 'KB', align: 'center' }, S.at('longer') - 0.2, 0.4);
  L.sheet(x + 200, y + 640, 260, 60, S.at('refusing') - 0.3, { lines: 1 }); L.TXT('refuse: shorter', x + 340, y + 760, 42, { f: 'KB', align: 'center' }, S.at('refusing'), 0.4);
  bench(L, x + 900, y + 840, 420, 220, S.at('picture') - 0.4);
  const J = L.person(x + 1110, y + 620, 1.2, S.at('judge') - 0.3, { pose: 'hold', kind: 'think', look: [1, -0.4], hair: 'messy', k: 0.5 });
  L.clock(x + 1400, y + 300, 80, S.at('break') - 0.4); L.TXT('break in 5 min', x + 1400, y + 430, 36, { f: 'PH', align: 'center', col: L.INK2 }, S.at('break'), 0.4);
  L.react(J, S.at('long') - 0.2, { kind: 'worry', look: [-1, 0.3] });
  L.bubble(x + 840, y + 230, 360, 110, S.at("doesn't") - 0.3, { thought: true, text: 'not a long one now...', size: 30, tail: [J.head[0] - 20, J.head[1] - 50] });
});
def(LONG, 'c3e', blk(3, 5), { purpose: 'scheduling alone can make much of the drop; and a 65%→0 swing would be one of the biggest effects in psychology', shot: 'pan right; a second saw chart made by scheduling only (no tired faces) overlays the first; then a size ruler dwarfs normal effects', sfx: 'a matching descending pluck; a low "whoa" note' }, (S, L) => {
  const [x, y] = blk(3, 5);
  sawChart(L, x + 180, y + 560, 560, 340, S.at('scheduling') - 0.6, { ts: [S.at('scheduling') - 0.3, S.at('scheduling') + 0.1, S.at('scheduling') + 0.5], d: 0.4, ls: 30, blab: false });
  L.TXT('scheduling only', x + 460, y + 140, 48, { f: 'KB', align: 'center' }, S.at('scheduling'), 0.5); L.TXT('no tiredness at all', x + 460, y + 680, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('tiredness') - 0.2, 0.5);
  L.check(x + 760, y + 300, 2, S.at('drop') - 0.2);
  L.TXT('size of the effect', x + 1200, y + 140, 44, { f: 'KB', align: 'center' }, S.at('swing') - 0.6, 0.6);
  bars(L, x + 920, y + 760, 560, 520, [{ v: 0.12, label: 'typical', t: S.at('swing') - 0.2 }, { v: 0.2, label: 'large', t: S.at('swing') + 0.2 }, { v: 0.95, label: 'judges', col: L.YEL, top: '!', t: S.at('largest') - 0.4 }], S.at('swing') - 0.3, { ls: 34 });
});
def(LONG, 'c3f', blk(3, 6), { purpose: 'the honest middle: not proof the judges weren\'t tired; the number is probably too big', shot: 'pan right; a scale: a small weight labelled "fatigue?" against the big famous number', sfx: 'scale creak' }, (S, L) => {
  const [x, y] = blk(3, 6);
  L.TXT("doesn't prove they weren't tired", x + 800, y + 140, 50, { f: 'PH', align: 'center', col: L.INK2 }, S.at('proves') - 0.4, 0.8);
  L.INK_(L.line(x + 800, y + 780, x + 800, y + 360), { w: 5, amp: 0.2, passes: 1 }, S.at('famous') - 1.0, 0.2); L.INK_([[x + 700, y + 790], [x + 800, y + 740], [x + 900, y + 790]], { closed: true, w: 3, amp: 0.2 }, S.at('famous') - 1.0, 0.15);
  L.INK_(L.line(x + 440, y + 300, x + 1160, y + 420), { w: 5, amp: 0.2, passes: 1 }, S.at('famous') - 0.8, 0.2);
  tag(L, x + 480, y + 230, 'the famous number', 46, S.at('number') - 0.3, { tint: L.YEL });
  tag(L, x + 1130, y + 360, 'real fatigue?', 34, S.at('fatigue') - 0.3);
  L.TXT('probably much bigger than', x + 800, y + 880, 46, { f: 'KB', align: 'center' }, S.at('bigger') - 0.4, 0.6);
});
def(LONG, 'c3g', blk(3, 7), { purpose: 'the battery tested: 2016, 23 labs, method agreed in advance, 2,000+ people', shot: 'pan right; a world doodle, 23 lab icons pop in around it one by one, then a crowd fills', sfx: 'a light pop per lab' }, (S, L) => {
  const [x, y] = blk(3, 7);
  tag(L, x + 800, y + 100, '2016', 56, S.at('twenty') - 0.2);
  const g = L.ell(x + 500, y + 480, 260, 260, 0, L.TAU, 60); L.FILL(g, S.at('world') - 0.6); L.MRK([g], { col: L.GRY2, w: 14 }, S.at('world') - 0.5, 0.2); L.INK_(g, { closed: true, w: 3, amp: 0.4 }, S.at('world') - 0.6, 0.3);
  for (let i = 0; i < 23; i++) { const a = i / 23 * L.TAU; lab(L, x + 500 + Math.cos(a) * 330, y + 480 + Math.sin(a) * 330, 0.55, S.at('labs') - 0.3 + i * 0.05); }
  L.TXT('23 labs', x + 500, y + 500, 60, { f: 'KB', align: 'center' }, S.at('labs'), 0.3);
  notepad(L, x + 960, y + 220, 460, 200, S.at('agreed') - 0.6, ['method agreed in advance'], { size: 34 });
  crowd(L, x + 1000, y + 520, 40, 10, 40, S.at('thousand') - 0.4, 0.02); L.TXT('2,000+ people', x + 1180, y + 760, 44, { f: 'KB', align: 'center' }, S.at('people') - 0.3, 0.4);
});
def(LONG, 'c3h', blk(3, 8, 1000, 700), { purpose: 'the punch: close to zero (a beat of silence on screen)', shot: 'whip-short pan to an almost empty block; the camera pushes in on one tiny bar', sfx: 'silence; one tiny pluck', push: 0.12 }, (S, L) => {
  const [x, y] = blk(3, 8, 1000, 700);
  L.INK_(L.line(x + 150, y + 520, x + 850, y + 520), { w: 3.4, amp: 0.4 }, S.t0 + 0.1, 0.2);
  L.MRK([[[x + 460, y + 520], [x + 540, y + 520], [x + 540, y + 505], [x + 460, y + 505]]], { col: L.YELD, w: 14, edge: false }, S.at('zero') - 0.3, 0.2);
  L.TXT('≈ 0', x + 500, y + 440, 110, { f: 'KB', align: 'center' }, S.at('zero') - 0.1, 0.3);
});
def(LONG, 'c3x', blk(3, 9), { purpose: 'contrast: not small, close to zero; the originals were many times larger', shot: 'pan right; the original bar towers beside the new tiny bar', sfx: 'a rising pluck, then the tiny one' }, (S, L) => {
  const [x, y] = blk(3, 9);
  bars(L, x + 400, y + 760, 800, 560, [{ v: 0.85, label: 'original studies', top: 'big', t: S.at('original') - 0.3 }, { v: 0.04, label: 'the big test', col: L.YEL, top: '≈ 0', t: S.at('zero') - 0.3 }], S.t0 + 0.1, { ls: 40 });
  L.TXT('not small', x + 1300, y + 200, 50, { f: 'KB', align: 'center' }, S.at('small') - 0.3, 0.4); L.cross(x + 1300, y + 280, 2, S.at('small') + 0.1);
  L.TXT('many times larger', x + 500, y + 140, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('larger') - 0.4, 0.6);
});
def(LONG, 'c3i', blk(3, 10), { purpose: 'the second, bigger test: 2021, 36 labs, 3,000+ people, barely different from nothing', shot: 'pan right; a bigger ring of labs, a bigger crowd, and a bar you can barely see', sfx: 'pops; a tiny pluck' }, (S, L) => {
  const [x, y] = blk(3, 10);
  tag(L, x + 300, y + 110, '2021', 56, S.at('twenty') - 0.2);
  labGrid(L, x + 160, y + 280, 36, 9, 70, S.at('labs') - 0.6, 0.03, { s: 0.6 }); L.TXT('36 labs', x + 440, y + 600, 50, { f: 'KB', align: 'center' }, S.at('labs'), 0.4);
  crowd(L, x + 880, y + 260, 60, 12, 46, S.at('thousand') - 0.5, 0.015); L.TXT('3,000+ people', x + 1130, y + 540, 46, { f: 'KB', align: 'center' }, S.at('people') - 0.3, 0.4);
  L.INK_(L.line(x + 600, y + 800, x + 1100, y + 800), { w: 3, amp: 0.4 }, S.at('small') - 0.5, 0.2); L.MRK([[[x + 820, y + 800], [x + 880, y + 800], [x + 880, y + 788], [x + 820, y + 788]]], { col: L.YELD, w: 12, edge: false }, S.at('small') - 0.2, 0.2);
  L.TXT('barely different from nothing', x + 850, y + 720, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('barely') - 0.3, 0.7);
});
def(LONG, 'c3j', blk(3, 11), { purpose: 'the sugar idea checked: the brain\'s extra glucose use is tiny, too small to be the fuel gauge', shot: 'pan right; the lemonade glass returns; a big fuel gauge with a needle that barely moves', sfx: 'a needle tick' }, (S, L) => {
  const [x, y] = blk(3, 11);
  const g = [[x + 220, y + 320], [x + 400, y + 320], [x + 375, y + 700], [x + 245, y + 700]]; L.FILL(g, S.t0 + 0.1); L.MRK([[[x + 235, y + 420], [x + 385, y + 420], [x + 372, y + 690], [x + 248, y + 690]]], { col: L.YEL, w: 16 }, S.t0 + 0.2, 0.3); L.INK_(g, { closed: true, w: 3, amp: 0.3 }, S.t0 + 0.1, 0.2);
  L.TXT('the sugar?', x + 310, y + 240, 50, { f: 'KB', align: 'center' }, S.at('sugar') - 0.3, 0.4);
  L.head(x + 800, y + 480, 130, S.at("brain's") - 0.4, { you: true, kind: 'think', look: [1, 0], k: 0.7 });
  const G = gauge(L, x + 1220, y + 560, 220, S.at('glucose') - 0.4, { v: 0.5, lo: 'rest', hi: 'hard task', label: 'glucose use' }); G.needle(0.54, S.at('tiny') - 0.2);
  L.TXT('a tiny change', x + 1220, y + 700, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('tiny'), 0.4);
  L.TXT('too small to be the fuel gauge', x + 800, y + 860, 46, { f: 'KB', align: 'center' }, S.at('gauge') - 0.8, 0.8);
});
def(LONG, 'c3k', blk(3, 12), { purpose: 'the turn: case closed? no — outside the lab, in real jobs, something keeps showing up', shot: 'pan right; a CASE CLOSED stamp is crossed out; a door opens from the lab onto a street of workplaces', sfx: 'stamp; a door creak' }, (S, L) => {
  const [x, y] = blk(3, 12);
  tag(L, x + 400, y + 200, 'CASE CLOSED?', 58, S.at('case') - 0.3); tag(L, x + 400, y + 330, 'MYTH?', 58, S.at('myth') - 0.3);
  L.MST(L.line(x + 180, y + 390, x + 640, y + 140), { w: 10, col: L.INK }, S.at('fast') - 0.3, 0.2);
  door(L, x + 820, y + 820, 220, 400, S.at('lab') - 0.6, { open: 0.7 }); L.TXT('the lab', x + 930, y + 380, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('lab') - 0.3, 0.3);
  house(L, x + 1200, y + 820, 1.2, S.at('real') - 0.2); house(L, x + 1380, y + 820, 1.0, S.at('jobs') - 0.2);
  L.TXT('real jobs', x + 1290, y + 560, 50, { f: 'KB', align: 'center' }, S.at('jobs'), 0.4);
  L.qmark(x + 1290, y + 450, 110, S.at('showing') - 0.2);
});

// ===== chapter 4: the drift =====
chapter(LONG, 'ch4', 4, 4, 'THE DRIFT');
def(LONG, 'c4a', blk(4, 1), { purpose: 'field study 1 set-up: Boston, ~22,000 visits for coughs/colds/sore throats; mostly viral, antibiotics don\'t help', shot: 'pan right; doctor and coughing patient across a desk; a virus is drawn and the pill is crossed out', sfx: 'a cough; a pen cross' }, (S, L) => {
  const [x, y] = blk(4, 1);
  tag(L, x + 800, y + 100, '2014 · BOSTON', 54, S.at('twenty') - 0.2); L.TXT('≈ 22,000 visits', x + 800, y + 190, 46, { f: 'KB', align: 'center' }, S.at('thousand') - 0.2, 0.5);
  desk(L, x + 400, y + 620, 500, S.at('doctor') - 0.5, { h: 240 });
  const D = L.person(x + 300, y + 860, 1.5, S.at('doctor') - 0.4, { pose: 'sit', kind: 'neutral', look: [1, 0], hair: 'bun', k: 0.6 });
  const P = L.person(x + 1000, y + 860, 1.5, S.at('coughs') - 0.4, { pose: 'sit', you: true, kind: 'sad', look: [-1, 0], hair: 'tuft', k: 0.6, dir: -1 });
  L.motion(P.head[0] - 80, P.head[1] + 10, -60, 3, S.at('coughs')); L.TXT('cough · cold · sore throat', x + 1000, y + 520, 36, { f: 'PH', align: 'center', col: L.INK2 }, S.at('throats') - 0.6, 0.6);
  virus(L, x + 1300, y + 380, 50, S.at('viruses') - 0.3); L.TXT('virus', x + 1300, y + 480, 36, { f: 'PH', align: 'center', col: L.INK2 }, S.at('viruses'), 0.2);
  pill(L, x + 1450, y + 620, 1.2, S.at('antibiotics', 1) - 0.3); L.cross(x + 1450, y + 620, 2.2, S.at('help') - 0.2);
});
def(LONG, 'c4b', blk(4, 2), { purpose: 'the drift: prescribing rises through the session; 4th hour odds ~ a quarter higher than the 1st', shot: 'pan right; four hour columns with Rx pads that pile higher hour by hour; push on hour 4', sfx: 'pad tear per prescription, faster as it climbs' }, (S, L) => {
  const [x, y] = blk(4, 2);
  bars(L, x + 260, y + 760, 1080, 560, [{ v: 0.62, label: 'hour 1', t: S.at('session') - 0.3 }, { v: 0.63, label: 'hour 2', t: S.at('antibiotics') }, { v: 0.7, label: 'hour 3', t: S.at('often') - 0.2 }, { v: 0.78, label: 'hour 4', col: L.YEL, top: '+ ~¼ odds', t: S.at('fourth') - 0.2 }], S.t0 + 0.1, { ls: 36, ts: 40 });
  rxPad(L, x + 180, y + 340, 0.9, S.at('prescribed') - 0.3);
  L.TXT('antibiotic prescriptions', x + 800, y + 120, 46, { f: 'KB', align: 'center' }, S.at('prescribed') - 0.1, 0.6);
  L.TXT('(odds, compared with hour 1)', x + 1200, y + 880, 32, { f: 'PH', align: 'center', col: L.INK2 }, S.at('first') - 0.3, 0.5);
});
def(LONG, 'c4c', blk(4, 3), { purpose: 'why: writing the prescription is the quick exit; saying no and explaining takes effort (the fork again)', shot: 'pan right; the fork from chapter 1 returns with new labels; the yellow default path lights', sfx: 'pen; a soft chime on the yellow path' }, (S, L) => {
  const [x, y] = blk(4, 3);
  const D = L.person(x + 220, y + 820, 1.4, S.t0 + 0.1, { pose: 'hold', kind: 'bored', look: [1, -0.2], hair: 'bun', k: 0.5 });
  rxPad(L, D.hand[1][0] + 40, D.hand[1][1] - 40, 0.6, S.at('prescription') - 0.2);
  fork(L, x + 480, y + 640, 900, S.at('quick') - 0.6, { hard: 'say no, explain why', easy: 'write the prescription', easyT: 0.6, ls: 40 });
  L.TXT('effort', x + 1180, y + 160, 50, { f: 'KB', align: 'center' }, S.at('effort') - 0.3, 0.3);
});
def(LONG, 'c4d', blk(4, 4), { purpose: 'field study 2: 4,000+ hospital caregivers, soap-dispenser sensors; hand washing falls ~9 points over a 12-hour shift', shot: 'pan right; dispenser with its sensor, a 12-hour clock band, the line slopes down', sfx: 'soap pump squelch; a sensor blip' }, (S, L) => {
  const [x, y] = blk(4, 4);
  soap(L, x + 260, y + 380, 1.6, S.at('sensors') - 0.4); L.TXT('sensor', x + 260, y + 600, 36, { f: 'PH', align: 'center', col: L.INK2 }, S.at('sensors'), 0.3);
  crowd(L, x + 120, y + 700, 18, 9, 34, S.at('thousand') - 0.6, 0.03); L.TXT('4,000+ caregivers', x + 260, y + 820, 40, { f: 'KB', align: 'center' }, S.at('caregivers') - 0.3, 0.5);
  L.INK_(L.line(x + 560, y + 720, x + 1460, y + 720), { w: 3.4, amp: 0.4 }, S.at('twelve') - 0.6, 0.2);
  L.TXT('start of shift', x + 620, y + 780, 34, { f: 'PH', align: 'center', col: L.INK2 }, S.at('twelve') - 0.3, 0.3); L.TXT('12 hours later', x + 1380, y + 780, 34, { f: 'PH', align: 'center', col: L.INK2 }, S.at('shift') - 0.2, 0.3);
  L.MST(L.bez([x + 600, y + 300], [x + 900, y + 330], [x + 1200, y + 400], [x + 1420, y + 450]), { w: 9, col: L.INK, amp: 0.6 }, S.at('hand') - 0.3, 1.0);
  L.TXT('hand washing', x + 700, y + 250, 42, { f: 'KB', align: 'center' }, S.at('washing') - 0.2, 0.4);
  L.TXT('− ~9 points', x + 1350, y + 380, 50, { f: 'KB', align: 'center' }, S.at('nine') - 0.2, 0.4); L.loop(x + 1350, y + 365, 150, 60, S.at('points'), 0.4);
});
def(LONG, 'c4e', blk(4, 5), { purpose: 'field study 3: analysts later in the day copy the consensus or repeat their own number', shot: 'pan right; an analyst at a screen, forecast cards stack; the last ones are photocopies of the crowd\'s number', sfx: 'keyboard clacks; a copier whirr' }, (S, L) => {
  const [x, y] = blk(4, 5);
  screen(L, x + 160, y + 300, 420, 260, S.t0 + 0.1); L.MST([[x + 200, y + 500], [x + 300, y + 440], [x + 400, y + 470], [x + 540, y + 360]], { w: 6, col: L.INK }, S.t0 + 0.3, 0.4);
  const A = L.person(x + 700, y + 860, 1.4, S.at('analysts') - 0.4, { pose: 'sit', kind: 'bored', look: [-1, -0.3], hair: 'cap', k: 0.5, dir: -1 });
  L.TXT('forecast #1  #2  #3  #4 ...', x + 1150, y + 200, 42, { f: 'KB', align: 'center' }, S.at('several') - 0.4, 0.8);
  card(L, x + 900, y + 300, 220, 140, S.at('copy') - 0.4, { lines: [['crowd: 2.10', 30]] }); card(L, x + 1180, y + 300, 220, 140, S.at('copy') - 0.1, { lines: [['me: 2.10', 30]] }); L.TXT('copy the consensus', x + 1150, y + 500, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('consensus') - 0.2, 0.5);
  card(L, x + 900, y + 580, 220, 140, S.at('repeat') - 0.4, { lines: [['earlier: 1.95', 28]] }); card(L, x + 1180, y + 580, 220, 140, S.at('repeat') - 0.1, { lines: [['now: 1.95', 28]] }); L.TXT('repeat yourself', x + 1150, y + 780, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('earlier') - 0.1, 0.5);
  tag(L, x + 1150, y + 880, 'the low effort answer', 40, S.at('low') - 0.3, { tint: L.YEL });
});
def(LONG, 'c4f', blk(4, 6), { purpose: 'the pattern: nobody collapsed; they drifted toward the default', shot: 'pan right; three small figures (doctor, nurse, analyst) on a flat road all slide down a gentle slope to a yellow DEFAULT sign', sfx: 'a soft slide whistle, very gentle' }, (S, L) => {
  const [x, y] = blk(4, 6);
  L.TXT('nobody collapsed', x + 400, y + 140, 50, { f: 'KB', align: 'center' }, S.at('collapsed') - 0.4, 0.5); L.TXT('nobody froze', x + 1200, y + 140, 50, { f: 'KB', align: 'center' }, S.at('unable') - 0.4, 0.5);
  L.INK_(L.bez([x + 100, y + 400], [x + 600, y + 420], [x + 1000, y + 600], [x + 1450, y + 760]), { w: 4, amp: 0.4 }, S.at('drifted') - 0.6, 0.4);
  ['bun', 'long', 'cap'].forEach((h, i) => L.person(x + 400 + i * 300, y + 440 + i * 90, 0.9, S.at('drifted') - 0.3 + i * 0.25, { pose: 'walk', kind: 'neutral', look: [1, 0.3], hair: h, k: 0.4 }));
  tag(L, x + 1380, y + 680, 'DEFAULT', 52, S.at('default') - 0.2, { tint: L.YEL });
  L.TXT('the option that takes the least thinking', x + 800, y + 880, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('least') - 0.6, 0.8);
});
def(LONG, 'c4g', blk(4, 7), { purpose: 'the modern reading (Inzlicht): not an empty tank, a shift in motivation and attention; the easy option looks good', shot: 'pan right; the battery is crossed out; a balance tips from "worth the effort?" toward "easy"', sfx: 'pen cross; scale creak' }, (S, L) => {
  const [x, y] = blk(4, 7);
  battery(L, x + 300, y + 300, 260, 120, 0.1, S.at('tank') - 0.5); L.cross(x + 300, y + 300, 4, S.at('tank') - 0.1); L.TXT('not an empty tank', x + 300, y + 440, 40, { f: 'KB', align: 'center' }, S.at('tank'), 0.4);
  L.TXT('Michael Inzlicht', x + 300, y + 130, 38, { f: 'PH', align: 'center', col: L.INK2 }, S.at('inzlicht') - 0.3, 0.5);
  L.head(x + 850, y + 420, 150, S.at('motivation') - 0.6, { you: true, kind: 'think', look: [1, 0.2], k: 0.7 });
  L.TXT('motivation + attention shift', x + 850, y + 680, 46, { f: 'KB', align: 'center' }, S.at('attention') - 0.4, 0.6);
  L.INK_(L.line(x + 1300, y + 760, x + 1300, y + 420), { w: 5, amp: 0.2, passes: 1 }, S.at('pickier') - 0.6, 0.2);
  L.INK_(L.line(x + 1100, y + 380, x + 1500, y + 500), { w: 5, amp: 0.2, passes: 1 }, S.at('pickier') - 0.4, 0.2);
  tag(L, x + 1120, y + 320, 'worth it?', 34, S.at('deserves') - 0.3); tag(L, x + 1480, y + 450, 'easy', 40, S.at('easy') - 0.2, { tint: L.YEL });
});
def(LONG, 'c4h', blk(4, 8), { purpose: 'honest limits: records, not experiments; time pressure, a filling waiting room; but the drift repeats across jobs', shot: 'pan right; a "caution" note pinned; a waiting room fills with heads; then three job icons line up with the same down arrow', sfx: 'a pin; a door bell per arrival' }, (S, L) => {
  const [x, y] = blk(4, 8);
  card(L, x + 120, y + 120, 600, 260, S.t0 + 0.1, { lines: [['real world records,', 42], ['not experiments', 42]], tint: 'rgba(255,205,40,0.2)' });
  L.clock(x + 300, y + 560, 80, S.at('pressure') - 0.4); L.TXT('time pressure', x + 300, y + 690, 38, { f: 'PH', align: 'center', col: L.INK2 }, S.at('pressure') - 0.1, 0.4);
  for (let i = 0; i < 6; i++) seat(L, x + 520 + i * 90, y + 820, 0.5, S.at('waiting') - 0.4 + i * 0.05);
  crowd(L, x + 520, y + 700, 6, 6, 90, S.at('filling') - 0.2, 0.12); L.TXT('a filling waiting room', x + 740, y + 880, 36, { f: 'PH', align: 'center', col: L.INK2 }, S.at('room') - 0.2, 0.5);
  [['Rx', 'same'], ['soap', 'drift'], ['$', 'different']].forEach(([lab0, cue], i) => { tag(L, x + 1100 + i * 160, y + 300, lab0, 44, S.at(cue) - 0.2); L.inkArrow([[x + 1100 + i * 160, y + 360], [x + 1100 + i * 160, y + 520]], { w: 4 }, S.at(cue), 0.2); });
  L.TXT('same drift', x + 1260, y + 600, 46, { f: 'KB', align: 'center' }, S.at('jobs') - 0.3, 0.4);
});
def(LONG, 'c4i', blk(4, 9), { purpose: 'the twist: Job, Dweck & Walton 2010: belief that willpower runs out → depletion; belief it doesn\'t → mostly not', shot: 'pan right; two people with thought bubbles (an emptying battery vs an open loop); then their result lines', sfx: 'two different chimes' }, (S, L) => {
  const [x, y] = blk(4, 9);
  tag(L, x + 800, y + 100, '2010 · Job, Dweck & Walton', 46, S.at('veronika') - 0.4);
  const A = L.person(x + 420, y + 840, 1.4, S.at('believed') - 0.5, { pose: 'stand', you: true, kind: 'worry', look: [0, -1], k: 0.6 });
  L.bubble(x + 220, y + 240, 400, 180, S.at('runs') - 0.4, { thought: true, tail: [A.head[0], A.head[1] - 60] }); battery(L, x + 420, y + 330, 180, 80, 0.15, S.at('runs') - 0.2);
  L.TXT('"willpower runs out"', x + 420, y + 480, 36, { f: 'PH', align: 'center', col: L.INK2 }, S.at('out') - 0.2, 0.5);
  L.TXT('depleted', x + 420, y + 900, 40, { f: 'KB', align: 'center' }, S.at('classic') - 0.2, 0.4);
  const B = L.person(x + 1180, y + 840, 1.4, S.at('while') - 0.4, { pose: 'stand', kind: 'content', look: [0, -1], hair: 'long', k: 0.6 });
  L.bubble(x + 980, y + 240, 400, 180, S.at("doesn't") - 0.4, { thought: true, tail: [B.head[0], B.head[1] - 60] }); L.loop(x + 1180, y + 330, 110, 50, S.at("doesn't") - 0.1, 0.4);
  L.TXT('"it doesn\'t"', x + 1180, y + 480, 36, { f: 'PH', align: 'center', col: L.INK2 }, S.at("doesn't"), 0.4);
  L.TXT("mostly didn't", x + 1180, y + 900, 40, { f: 'KB', align: 'center' }, S.at('mostly') - 0.2, 0.4);
});
def(LONG, 'c4j', blk(4, 10), { purpose: 'flag: needs replication; the uncomfortable question: the day or the story we tell ourselves?', shot: 'pan right; a "needs replication" stamp, then a person at the end of the day with two speech options; push on the question', sfx: 'stamp; a quiet low note' }, (S, L) => {
  const [x, y] = blk(4, 10);
  tag(L, x + 400, y + 140, 'needs more replication', 46, S.at('replication') - 0.4, { tint: 'rgba(255,205,40,0.35)' });
  const P = L.person(x + 400, y + 840, 1.5, S.at('question') - 0.5, { pose: 'shrug', you: true, kind: 'think', look: [1, -0.6], k: 0.6 });
  L.bubble(x + 560, y + 300, 520, 120, S.at('tired') - 0.5, { text: "I'm too tired to decide", size: 40, tail: [P.head[0] + 40, P.head[1] - 30] });
  card(L, x + 760, y + 520, 300, 160, S.at('day') - 0.4, { lines: [['the day?', 44]] }); card(L, x + 1140, y + 520, 360, 160, S.at('story') - 0.4, { lines: [['the story?', 44]], tint: 'rgba(255,205,40,0.25)' });
  L.qmark(x + 1100, y + 820, 120, S.at('ourselves') - 0.2);
});

// ===== chapter 5: what actually helps =====
chapter(LONG, 'ch5', 5, 5, 'WHAT ACTUALLY HELPS');
def(LONG, 'c5a', blk(5, 1), { purpose: 'set up three evidence-tied ideas, each with limits', shot: 'pan right; a notepad with three empty numbered lines is drawn (the viewer sees the shape of the list)', sfx: 'pen; three taps' }, (S, L) => {
  const [x, y] = blk(5, 1);
  [1, 2, 3].forEach((n, i) => { numDot(L, x + 400 + i * 400, y + 400, n, S.at('three') + i * 0.2, 70); });
  L.TXT('each tied to the evidence', x + 800, y + 620, 50, { f: 'KB', align: 'center' }, S.at('evidence') - 0.4, 0.6);
  L.TXT('...each with its limits', x + 800, y + 720, 46, { f: 'PH', align: 'center', col: L.INK2 }, S.at('limits') - 0.4, 0.5);
});
def(LONG, 'c5b', blk(5, 2), { purpose: 'idea 1: move the decisions that matter earlier; decide fresh or sleep on it', shot: 'pan right; a day timeline; the big decision card is lifted from 6 PM and placed at 9 AM; a moon for "sleep on it"', sfx: 'card slide; a soft chime' }, (S, L) => {
  const [x, y] = blk(5, 2);
  numDot(L, x + 140, y + 120, 1, S.t0 + 0.1, 50); L.TXT('move the decisions that matter', x + 760, y + 140, 54, { f: 'KB', align: 'center' }, S.at('move') - 0.2, 0.7);
  L.INK_(L.line(x + 200, y + 600, x + 1400, y + 600), { w: 4, amp: 0.4 }, S.at('drift') - 0.4, 0.3);
  ['9 AM', '12', '3 PM', '6 PM'].forEach((t, i) => { L.INK_(L.line(x + 260 + i * 360, y + 580, x + 260 + i * 360, y + 620), { w: 3, amp: 0.1, passes: 1 }, S.at('drift') - 0.2 + i * 0.05, 0.04); L.TXT(t, x + 260 + i * 360, y + 680, 38, { f: 'PH', align: 'center', col: L.INK2 }, S.at('drift') + i * 0.05, 0.2); });
  card(L, x + 1220, y + 380, 280, 150, S.at('hardest') - 0.4, { lines: [['BIG ONE', 40]] }); L.cross(x + 1360, y + 455, 3, S.at('end') - 0.2);
  card(L, x + 120, y + 380, 280, 150, S.at('fresh') - 0.5, { lines: [['BIG ONE', 40]], tint: L.YEL }); L.inkArrow(L.bez([x + 1300, y + 360], [x + 1000, y + 220], [x + 600, y + 220], [x + 330, y + 360]), { w: 4 }, S.at('fresh') - 0.8, 0.5);
  moon(L, x + 1400, y + 820, 50, S.at('sleep') - 0.3); L.TXT('or sleep on it', x + 1180, y + 840, 42, { f: 'PH', align: 'center', col: L.INK2 }, S.at('sleep') - 0.1, 0.4);
});
def(LONG, 'c5c', blk(5, 3), { purpose: 'idea 2: decide once (Obama: only gray or blue suits, "pare down decisions"); you don\'t need a uniform', shot: 'pan right; a rail with two suits (grey, blue), the quote card; then a cross over a uniform icon', sfx: 'hanger clinks' }, (S, L) => {
  const [x, y] = blk(5, 3);
  numDot(L, x + 140, y + 120, 2, S.t0 + 0.1, 50); L.TXT('decide once, not every time', x + 760, y + 140, 54, { f: 'KB', align: 'center' }, S.at('once') - 0.2, 0.7);
  L.INK_(L.line(x + 160, y + 300, x + 700, y + 300), { w: 5, amp: 0.2 }, S.at('obama') - 0.4, 0.2);
  suit(L, x + 300, y + 330, 1.3, S.at('gray') - 0.3, { col: L.GRY2 }); suit(L, x + 560, y + 330, 1.3, S.at('blue') - 0.3, { col: 'rgba(80,120,200,0.4)' });
  L.TXT('gray', x + 300, y + 620, 36, { f: 'PH', align: 'center', col: L.INK2 }, S.at('gray'), 0.2); L.TXT('blue', x + 560, y + 620, 36, { f: 'PH', align: 'center', col: L.INK2 }, S.at('blue'), 0.2);
  card(L, x + 820, y + 300, 640, 300, S.at('trying') - 0.6, { lines: [['"I\'m trying to pare', 40], ['down decisions."', 40], ['Barack Obama, Vanity Fair, 2012', 28, 'PH']] });
  L.TXT("you don't need a uniform", x + 1140, y + 760, 46, { f: 'KB', align: 'center' }, S.at('uniform') - 0.5, 0.6);
});
def(LONG, 'c5d', blk(5, 4), { purpose: 'the evidence: if-then plans help follow-through (~100 studies, Gollwitzer & Sheeran 2006)', shot: 'pan right; an IF / THEN card is written, the gym bag appears on Monday; a stack of ~100 tiny papers', sfx: 'pen; a zip of the gym bag' }, (S, L) => {
  const [x, y] = blk(5, 4);
  L.box(x + 120, y + 180, 760, 400, S.at('plan') - 0.6, 0.3, { r: 24 });
  L.TXT('IF  it\'s Monday', x + 500, y + 320, 56, { f: 'KB', align: 'center' }, S.at('monday') - 0.4, 0.5); L.TXT('THEN  gym, straight after work', x + 500, y + 460, 46, { f: 'KB', align: 'center' }, S.at('gym') - 0.3, 0.7);
  L.MRK([[[x + 200, y + 330], [x + 280, y + 330]]], { col: L.YEL, w: 18, edge: false }, S.at('monday'), 0.2);
  for (let i = 0; i < 10; i++) L.sheet(x + 1050 + (i % 5) * 70, y + 260 + Math.floor(i / 5) * 110, 60, 90, S.at('hundred') - 0.6 + i * 0.05, { lines: 2 });
  L.TXT('≈ 100 studies', x + 1220, y + 560, 48, { f: 'KB', align: 'center' }, S.at('studies') - 0.3, 0.4);
  L.TXT('helped people follow through', x + 800, y + 760, 46, { f: 'PH', align: 'center', col: L.INK2 }, S.at('follow') - 0.4, 0.6);
});
def(LONG, 'c5x', blk(5, 5, 1300, 700), { purpose: 'the why: fewer on-the-spot decisions → fewer chances to drift', shot: 'pan right; a row of small question marks gets erased down to one', sfx: 'eraser swipes' }, (S, L) => {
  const [x, y] = blk(5, 5, 1300, 700);
  for (let i = 0; i < 6; i++) L.qmark(x + 200 + i * 180, y + 330, 120, S.t0 + 0.1 + i * 0.08);
  L.COVER([[x + 300, y + 180], [x + 1260, y + 180], [x + 1260, y + 380], [x + 300, y + 380]], S.at('fewer', 2) - 0.2);
  L.TXT('fewer chances to drift', x + 650, y + 560, 60, { f: 'KB', align: 'center' }, S.at('drift') - 0.4, 0.5); L.swash(x + 340, y + 585, x + 960, S.at('drift') + 0.2, 0.3);
});
def(LONG, 'c5e', blk(5, 6), { purpose: 'idea 3: real breaks; longer rest between shifts → more hand washing afterwards', shot: 'pan right; a bed between two shift bars; the next shift\'s line starts higher', sfx: 'a yawn; a rising pluck' }, (S, L) => {
  const [x, y] = blk(5, 6);
  numDot(L, x + 140, y + 120, 3, S.t0 + 0.1, 50); L.TXT('take real breaks', x + 700, y + 140, 56, { f: 'KB', align: 'center' }, S.at('breaks') - 0.3, 0.6);
  L.TXT('watch the default', x + 700, y + 230, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('default') - 0.3, 0.5);
  L.INK_(L.rrect(x + 160, y + 400, 400, 120, 16), { closed: true, w: 3, amp: 0.4 }, S.at('hospital') - 0.4, 0.2); L.TXT('shift', x + 360, y + 480, 44, { f: 'KB', align: 'center' }, S.at('hospital') - 0.2, 0.3);
  bed(L, x + 620, y + 620, 300, S.at('rest') - 0.6, { s: 0.6, kind: 'side', k: 0.6 }); L.TXT('longer rest', x + 790, y + 680, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('rest'), 0.3);
  L.INK_(L.rrect(x + 1040, y + 400, 400, 120, 16), { closed: true, w: 3, amp: 0.4 }, S.at('shifts') - 0.2, 0.2); L.TXT('next shift', x + 1240, y + 480, 44, { f: 'KB', align: 'center' }, S.at('shifts'), 0.3);
  soap(L, x + 1240, y + 720, 0.9, S.at('washed') - 0.4); L.inkArrow([[x + 1360, y + 800], [x + 1360, y + 640]], { w: 5 }, S.at('more') - 0.2, 0.2); L.TXT('more hand washing', x + 1240, y + 880, 40, { f: 'KB', align: 'center' }, S.at('afterwards') - 0.3, 0.5);
});
def(LONG, 'c5f', blk(5, 7), { purpose: 'the habit to build: at the end of a long day, reaching for the easy answer = a cue to pause, not proof it is right', shot: 'pan right; the fork again; the viewer\'s hand stops at the yellow path, a PAUSE sign pops up', sfx: 'a gentle bell on "pause"' }, (S, L) => {
  const [x, y] = blk(5, 7);
  fork(L, x + 400, y + 640, 900, S.at('easy') - 0.6, { hard: 'think it through', easy: 'the easy answer', easyT: 0.4, ls: 40 });
  const P = L.person(x + 260, y + 640, 1.4, S.at('catch') - 0.4, { pose: 'walk', you: true, kind: 'bored', look: [1, 0], k: 0.6 });
  L.clock(x + 220, y + 200, 70, S.at('long') - 0.3); L.TXT('end of a long day', x + 220, y + 320, 36, { f: 'PH', align: 'center', col: L.INK2 }, S.at('day') - 0.2, 0.4);
  L.box(x + 520, y + 720, 320, 130, S.at('pause') - 0.4, 0.25, { r: 20, tint: L.YEL }); L.TXT('PAUSE', x + 680, y + 805, 64, { f: 'KB', align: 'center' }, S.at('pause') - 0.2, 0.3);
  L.react(P, S.at('pause'), { kind: 'think', look: [1, -0.5] });
  L.TXT('not proof it\'s right', x + 1100, y + 880, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('proof') - 0.3, 0.5);
});
def(LONG, 'c5g', blk(5, 8), { purpose: 'a gentle fourth: careful with the battery story (self-fulfilling)', shot: 'pan right; the battery label "out of willpower" is erased and redrawn as a question', sfx: 'eraser; pen' }, (S, L) => {
  const [x, y] = blk(5, 8);
  numDot(L, x + 140, y + 120, 4, S.t0 + 0.1, 46); L.TXT('a gentle fourth', x + 600, y + 140, 50, { f: 'KB', align: 'center' }, S.at('gentle') - 0.3, 0.5);
  battery(L, x + 600, y + 460, 420, 190, 0.15, S.at('battery') - 0.5);
  L.TXT('"I\'m out of willpower"', x + 600, y + 680, 48, { f: 'KB', align: 'center' }, S.at('willpower') - 0.6, 0.6);
  L.MST(L.line(x + 330, y + 665, x + 870, y + 665), { w: 8, col: L.INK }, S.at('truer') - 0.3, 0.2);
  L.TXT('might make it truer than it needs to be', x + 800, y + 820, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('truer') - 0.2, 0.7);
  L.head(x + 1250, y + 460, 120, S.at('telling') - 0.4, { you: true, kind: 'think', look: [-1, 0], k: 0.6 });
});

// ===== ending =====
def(LONG, 'end1', blk(0, 1), { purpose: 'payoff: back to 4 p.m. and the dinner question (callback); it is the default pull, and you notice it', shot: 'a long whip back up the page to the opening office, then a slow push on the face; the spinner is replaced by a small yellow PAUSE', sfx: 'long paper whoosh; office hum returns', noAutoCam: true }, (S, L) => {
  const B = blk(0, 1), [x, y] = B, c = S.fit(B);
  S.cam(S.t0 - 0.2, (x + 800 + blk(5, 8)[0] + 800) / 2, (y + 450 + 5 * GY + 450) / 2, 0.14, 1.1, 'io');
  S.cam(S.t0 + 0.9, c.x, c.y, c.z, 1.2, 'io');
  S.cam(S.at('leaning') - 0.5, x + 500, y + 520, c.z * 1.35, Math.max(1, S.end - S.at('leaning')), 'sin');
  L.loop(x + 1130, y + 535, 260, 90, S.at('dinner') - 0.4, 0.5);
  L.box(x + 230, y + 230, 220, 90, S.at('notice') - 0.6, 0.25, { r: 16, tint: L.YEL }); L.TXT('PAUSE', x + 340, y + 292, 50, { f: 'KB', align: 'center' }, S.at('notice') - 0.4, 0.3);
  L.TXT('not out of fuel', x + 900, y + 820, 42, { f: 'PH', align: 'center', col: L.INK2 }, S.at('fuel') - 0.2, 0.5);
});
def(LONG, 'end2', blk(0, 6), { purpose: 'the line to remember: not a myth, smaller and stranger; the judges vs you at 4 p.m.', shot: 'whip right along the top row; the MYTH box is crossed, the saw chart shrinks to a small wobble; push on "a little more likely"', sfx: 'whoosh; a small pluck', ease: 'q' }, (S, L) => {
  const [x, y] = blk(0, 6);
  tag(L, x + 300, y + 150, 'MYTH', 60, S.t0 + 0.2); L.cross(x + 300, y + 150, 4, S.at('myth') + 0.1);
  L.TXT('smaller', x + 800, y + 150, 64, { f: 'KB', align: 'center' }, S.at('smaller') - 0.2, 0.4); L.TXT('& stranger', x + 1250, y + 150, 64, { f: 'KB', align: 'center' }, S.at('stranger') - 0.2, 0.4);
  sawChart(L, x + 160, y + 640, 520, 300, S.at('judges') - 0.6, { ts: [S.at('judges') - 0.4, S.at('judges') - 0.1, S.at('judges') + 0.2], d: 0.3, ls: 28, blab: false });
  L.TXT('not ruled by lunch', x + 420, y + 760, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('lunch') - 0.3, 0.5);
  const P = L.person(x + 1150, y + 820, 1.4, S.at('afternoon') - 0.6, { pose: 'sit', you: true, kind: 'bored', look: [1, 0.2], k: 0.6 });
  L.clock(x + 1400, y + 360, 60, S.at('four') - 0.2);
  L.TXT('a little more likely to take the easy way', x + 1100, y + 900, 40, { f: 'KB', align: 'center' }, S.at('little') - 0.2, 0.9);
});
def(LONG, 'end3', blk(0, 7), { purpose: 'one specific comment question + one subscribe line', shot: 'pan right; the question card fills the frame', sfx: 'pen; a kalimba on "subscribe"' }, (S, L) => {
  const [x, y] = blk(0, 7);
  L.bubble(x + 160, y + 120, 1280, 330, S.t0 + 0.2, { tint: 'rgba(255,205,40,0.25)', tail: [x + 400, y + 560] });
  L.TXT('What decision do you always put off', x + 800, y + 250, 58, { f: 'KB', align: 'center' }, S.at('decision') - 0.6, 0.9);
  L.TXT("until you're too tired to make it?", x + 800, y + 350, 58, { f: 'KB', align: 'center' }, S.at('tired') - 0.6, 0.8);
  L.TXT('psychology, with the receipts', x + 800, y + 560, 50, { f: 'PH', align: 'center', col: L.INK2 }, S.at('receipts') - 0.4, 0.8);
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
function people3(L, x, y, n, t0, o = {}) {   // 3 small people, the first n marked (granted)
  for (let i = 0; i < 3; i++) { const P = L.person(x + i * 200, y, 0.9, t0 + i * 0.1, { pose: i < n ? 'arms_up' : 'stand', kind: i < n ? 'grin' : 'sad', look: [0, -0.3], hair: ['tuft', 'cap', 'curly'][i], k: 0.4 }); if (i < n) L.check(x + i * 200, y + 50, 2, t0 + 0.3 + i * 0.1, { col: L.YELD }); else L.cross(x + i * 200, y + 50, 2, t0 + 0.3 + i * 0.1); }
}
def(SHORT, 's1', sblk(0), { purpose: 'hook in the first second (study-first, EXP-001 control): a judge with a gavel mid-ruling, then the scale of the data', shot: 'opens close on the judge and gavel from frame 0, pulls back to reveal the stack of 1,000+ rulings (reveal)', sfx: 'gavel bang on frame 0; paper flicks', noAutoCam: true }, (S, L) => {
  const B = sblk(0), [x, y] = B, c = S.fit(B);
  S.cam(S.t0, x + 450, y + 560, c.z * 1.7, 0.01); S.cam(S.t0 + 1.0, c.x, c.y, c.z * 1.03, 1.6, 'io');
  bench(L, x + 200, y + 900, 500, 280, S.t0 - 1.4);
  const J = L.person(x + 450, y + 620, 1.6, S.t0 - 1.2, { pose: 'hold', kind: 'neutral', look: [1, 0.3], hair: 'messy', k: 0.6 });
  gavel(L, J.hand[1][0] + 30, J.hand[1][1] - 20, 1.1, S.t0 - 0.3, { bang: true });
  tag(L, x + 450, y + 110, '2011 · ISRAEL', 60, S.at('twenty') - 0.1);
  for (let i = 0; i < 6; i++) L.sheet(x + 60 + (i % 2) * 12, y + 300 - i * 30, 170, 90, S.at('thousand') - 0.4 + i * 0.05, { lines: 2 });
  L.TXT('1,000+ parole rulings', x + 450, y + 1030, 56, { f: 'KB', align: 'center' }, S.at('rulings') - 0.3, 0.6);
});
def(SHORT, 's2', sblk(1), { purpose: 'start of a session: 2 of 3 granted; just before the break: almost none', shot: 'pan right; the three figures at the top, the slope drawn down to a near-empty bottom row', sfx: 'two cheerful plucks, then a descending pluck' }, (S, L) => {
  const [x, y] = sblk(1);
  L.TXT('start of a session', x + 450, y + 90, 54, { f: 'KB', align: 'center' }, S.at('start') - 0.3, 0.5);
  people3(L, x + 250, y + 420, 2, S.at('two') - 0.4);
  L.TXT('2 out of 3: parole', x + 450, y + 520, 46, { f: 'PH', align: 'center', col: L.INK2 }, S.at('parole') - 0.3, 0.5);
  L.MST(L.bez([x + 120, y + 600], [x + 400, y + 640], [x + 600, y + 760], [x + 780, y + 880]), { w: 10, col: L.INK }, S.at('before') - 0.6, 0.9);
  plate(L, x + 450, y + 960, 1.0, S.at('food') - 0.3); L.TXT('just before the break', x + 450, y + 1080, 46, { f: 'KB', align: 'center' }, S.at('break') - 0.3, 0.5);
  L.TXT('almost none', x + 760, y + 820, 46, { f: 'KB', align: 'center' }, S.at('none') - 0.3, 0.4);
});
def(SHORT, 's3', sblk(2), { purpose: 'after the break: back to 2 of 3; the internet\'s story "hungry judges say no"', shot: 'pan right; the full saw chart, then the meme tag stamped over it; push on the tag', sfx: 'upward pluck; a stamp' }, (S, L) => {
  const [x, y] = sblk(2);
  sawChart(L, x + 140, y + 560, 680, 380, S.t0 + 0.05, { ts: [S.t0 + 0.1, S.at('back') - 0.3, S.at('back') + 0.4], d: 0.5, ls: 34, blab: false });
  L.TXT('after the break', x + 450, y + 90, 54, { f: 'KB', align: 'center' }, S.t0 + 0.1, 0.5);
  L.TXT('decision fatigue', x + 450, y + 720, 60, { f: 'KB', align: 'center' }, S.at('decision') - 0.3, 0.6);
  tag(L, x + 450, y + 880, 'HUNGRY JUDGES SAY NO', 54, S.at('hungry') - 0.3, { tint: L.YEL });
});
def(SHORT, 's4', sblk(3), { purpose: 'the check: cases not random (no lawyer → last); not starting a long case before the break can make much of the drop', shot: 'pan right; magnifier sweeps a queue; the last two have no lawyer; then the clock and a thick file pushed aside', sfx: 'magnifier swoosh; clock ticks; a file slide' }, (S, L) => {
  const [x, y] = sblk(3);
  L.TXT('then they checked', x + 450, y + 90, 56, { f: 'KB', align: 'center' }, S.at('checked') - 0.3, 0.5);
  for (let i = 0; i < 4; i++) { const px = x + 740 - i * 190, last = i < 2; L.person(px, y + 500, 0.85, S.at('order') - 0.3 + i * 0.1, { kind: last ? 'worry' : 'neutral', look: [1, 0], hair: ['tuft', 'cap', 'curly', 'long'][i], k: 0.35 }); if (!last) L.person(px + 66, y + 500, 0.65, S.at('lawyer') - 0.4, { kind: 'smile', look: [1, 0], hair: 'cap', k: 0.3 }); }
  L.TXT('no lawyer → often last', x + 450, y + 590, 46, { f: 'KB', align: 'center' }, S.at('last') - 0.3, 0.5);
  L.clock(x + 230, y + 800, 80, S.at('simulations') - 0.4);
  for (let i = 0; i < 4; i++) L.sheet(x + 420 + i * 8, y + 720 + i * 8, 220, 130, S.at('long') - 0.3 + i * 0.04, { lines: 3 }); L.inkArrow([[x + 680, y + 800], [x + 820, y + 800]], { w: 5 }, S.at('break') - 0.3, 0.2);
  L.TXT('a long case? after the break', x + 450, y + 1010, 42, { f: 'PH', align: 'center', col: L.INK2 }, S.at('break') - 0.2, 0.6);
});
def(SHORT, 's5', sblk(4), { purpose: 'the honest verdict: tired judges may be real; the famous number is probably far too big', shot: 'pan right; a scale tips: a small "real fatigue?" weight vs the huge famous number', sfx: 'scale creak' }, (S, L) => {
  const [x, y] = sblk(4);
  L.TXT('tired judges: maybe real', x + 450, y + 120, 54, { f: 'KB', align: 'center' }, S.at('tired') - 0.3, 0.6);
  L.INK_(L.line(x + 450, y + 820, x + 450, y + 400), { w: 5, amp: 0.2, passes: 1 }, S.at('famous') - 1.0, 0.2); L.INK_([[x + 360, y + 830], [x + 450, y + 780], [x + 540, y + 830]], { closed: true, w: 3, amp: 0.2 }, S.at('famous') - 1.0, 0.15);
  L.INK_(L.line(x + 140, y + 340, x + 760, y + 460), { w: 5, amp: 0.2, passes: 1 }, S.at('famous') - 0.8, 0.2);
  tag(L, x + 220, y + 270, 'the famous number', 40, S.at('number') - 0.3, { tint: L.YEL }); tag(L, x + 720, y + 400, 'fatigue', 34, S.at('number'));
  L.TXT('probably far too big', x + 450, y + 980, 60, { f: 'KB', align: 'center' }, S.at('big') - 0.4, 0.5); L.swash(x + 160, y + 1005, x + 740, S.at('big') + 0.2, 0.3);
});
def(SHORT, 's6', sblk(5), { purpose: 'loop back to the judge + one comment question (morning or night?)', shot: 'pan right; the judge returns small at the top; sun vs moon; hold on the question', sfx: 'pen; closing kalimba' }, (S, L) => {
  const [x, y] = sblk(5);
  bench(L, x + 300, y + 330, 300, 150, S.t0 + 0.05); L.person(x + 450, y + 200, 0.7, S.t0 + 0.1, { pose: 'hold', kind: 'think', look: [0, 0.3], hair: 'messy', k: 0.4 });
  L.bubble(x + 60, y + 440, 780, 260, S.t0 + 0.2, { tint: 'rgba(255,205,40,0.25)' });
  L.TXT('Your big decisions:', x + 450, y + 540, 56, { f: 'KB', align: 'center' }, S.at('big') - 0.4, 0.6);
  L.TXT('morning or night?', x + 450, y + 630, 56, { f: 'KB', align: 'center' }, S.at('morning') - 0.2, 0.6);
  const sx = x + 260, sy = y + 870, sc = L.ell(sx, sy, 60, 60, 0, L.TAU, 30); L.FILL(sc, S.at('morning')); L.MRK([sc], { col: L.YEL, w: 14 }, S.at('morning') + 0.05, 0.1); L.INK_(sc, { closed: true, w: 3, amp: 0.3 }, S.at('morning'), 0.1); L.sparks(sx, sy, 75, 105, [0, 0.8, 1.6, 2.4, 3.2, 4, 4.8, 5.6], S.at('morning') + 0.1, 0.15);
  moon(L, x + 640, y + 870, 60, S.at('night') - 0.1);
  L.TXT('tell me below', x + 450, y + 1060, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('night') + 0.3, 0.5);
});

export default { long: { scenes: LONG }, short: { scenes: SHORT } };
