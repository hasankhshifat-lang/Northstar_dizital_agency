// The Overthinking Pad, episode 2026-11-24: "Why Your Brain Reads Short Texts as Angry" (overthinking a text message).
// Storyboard + drawings per scene (purpose, shot, sfx per scene). Row 0 = cold open (the couch and the "ok."; the ending whips back to it), rows 1-4 = chapters 1-4.
// Recurring objects: the phone with "ok.", the voice wave vs the flat line, the tape recorder (opposite-tone trick), the coin flip.
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


// ---------- this episode's parts (2026-11-24, overthinking a text) ----------
// a big phone (front). returns the screen rect [x, y, w, h]
function bigPhone(L, cx, cy, s, t0, o = {}) {
  const w = 300 * s, h = 560 * s, b = L.rrect(cx - w / 2, cy - h / 2, w, h, 40 * s), sc = [cx - w / 2 + 18 * s, cy - h / 2 + 50 * s, w - 36 * s, h - 110 * s];
  L.FILL(b, t0); L.MRK([b], { col: L.GRY2, w: 14 }, t0 + 0.08, 0.1); L.dropShadow(b, 10 * s, 12 * s, t0 + 0.2, 0.06); L.INK_(b, { closed: true, w: 3.4, amp: 0.5 }, t0, 0.2);
  const sp = L.rrect(sc[0], sc[1], sc[2], sc[3], 12 * s); L.FILL(sp, t0 + 0.15); L.INK_(sp, { closed: true, w: 2.4, amp: 0.3, passes: 1 }, t0 + 0.15, 0.1);
  L.INK_(L.line(cx - 30 * s, cy - h / 2 + 26 * s, cx + 30 * s, cy - h / 2 + 26 * s), { w: 3, amp: 0.1, passes: 1 }, t0 + 0.2, 0.04);
  const hb = L.ell(cx, cy + h / 2 - 30 * s, 14 * s, 14 * s, 0, L.TAU, 16); L.INK_(hb, { closed: true, w: 2.2, amp: 0.1, passes: 1 }, t0 + 0.22, 0.04);
  if (o.name) L.TXT(o.name, cx, sc[1] + 40 * s, 30 * s, { f: 'PH', align: 'center', col: L.INK2 }, t0 + 0.25, 0.3);
  return sc;
}
// a chat bubble; mine = right side yellow, theirs = left side grey
function msg(L, x, y, w, h, text, t0, o = {}) {
  const b = L.rrect(x, y, w, h, Math.min(26, h / 2));
  L.FILL(b, t0); L.MRK([b], { col: o.mine ? 'rgba(255,205,40,0.55)' : L.GRY, w: 14, edge: false }, t0 + 0.05, 0.08);
  L.INK_(b, { closed: true, w: 2.6, amp: 0.4, passes: 1 }, t0, 0.12);
  if (o.lines) { for (let i = 0; i < o.lines; i++) L.INK_(L.line(x + 18, y + 22 + i * 22, x + w - 18 - (i === o.lines - 1 ? w * 0.35 : 0), y + 22 + i * 22), { w: 2.4, amp: 0.5, passes: 1, alpha: 0.7 }, t0 + 0.1 + i * 0.05, 0.08); return t0 + 0.2 + o.lines * 0.05; }
  return L.TXT(text, x + w / 2, y + h / 2 + (o.size || 34) * 0.34, o.size || 34, { f: o.f || 'KB', align: 'center' }, t0 + 0.1, o.td ?? 0.25);
}
function buzz(L, cx, cy, r, t0) { for (const sd of [-1, 1]) for (let i = 0; i < 2; i++) L.INK_(L.ell(cx, cy, r + i * 24, r * 1.6 + i * 30, sd < 0 ? Math.PI * 0.8 : -Math.PI * 0.2, sd < 0 ? Math.PI * 1.2 : Math.PI * 0.2, 10), { w: 3, amp: 0.2, passes: 1 }, t0 + i * 0.08, 0.06); return t0 + 0.25; }
function coin(L, cx, cy, r, t0, o = {}) {
  const c = L.ell(cx, cy, r, r * (o.edge ? 0.35 : 1), 0, L.TAU, 36); L.FILL(c, t0); L.MRK([c], { col: L.YEL, w: 12 }, t0 + 0.06, 0.08); L.INK_(c, { closed: true, w: 3, amp: 0.3 }, t0, 0.12);
  if (!o.edge) { L.INK_(L.ell(cx, cy, r * 0.75, r * 0.75, 0, L.TAU, 30), { closed: true, w: 2, amp: 0.2, passes: 1 }, t0 + 0.1, 0.08); L.TXT(o.face || '50%', cx, cy + r * 0.18, r * 0.5, { f: 'KB', align: 'center' }, t0 + 0.15, 0.2); }
  return t0 + 0.3;
}
function recorder(L, cx, cy, s, t0) {   // a tape recorder (the voice channel)
  const b = L.rrect(cx - 110 * s, cy - 60 * s, 220 * s, 120 * s, 12 * s); L.FILL(b, t0); L.MRK([b], { col: L.GRY2, w: 12 }, t0 + 0.06, 0.08); L.INK_(b, { closed: true, w: 3, amp: 0.3 }, t0, 0.14);
  for (const d of [-50, 50]) { const r = L.ell(cx + d * s, cy - 6 * s, 28 * s, 28 * s, 0, L.TAU, 24); L.FILL(r, t0 + 0.1); L.INK_(r, { closed: true, w: 2.4, amp: 0.2, passes: 1 }, t0 + 0.1, 0.06); L.INK_(L.ell(cx + d * s, cy - 6 * s, 8 * s, 8 * s, 0, L.TAU, 12), { closed: true, w: 2, amp: 0.1, passes: 1 }, t0 + 0.14, 0.03); }
  L.INK_(L.line(cx - 50 * s, cy + 22 * s, cx + 50 * s, cy + 22 * s), { w: 2, amp: 0.2, passes: 1 }, t0 + 0.16, 0.04);
  return t0 + 0.24;
}
function wave(L, x, y, w, amp, t0, d = 0.4, o = {}) {   // a voice wave (pitch, pauses, laughs)
  const P = []; for (let i = 0; i <= 80; i++) { const u = i / 80; P.push([x + w * u, y + Math.sin(u * 22) * amp * (0.4 + 0.6 * Math.abs(Math.sin(u * 5)))]); }
  return L.MST(P, { w: o.w || 6, col: o.col || L.INK, amp: 0.6 }, t0, d);
}
function flatline(L, x, y, w, t0, d = 0.3) { return L.MST(L.line(x, y, x + w, y), { w: 6, col: L.INK, amp: 0.3 }, t0, d); }
function stamp(L, cx, cy, text, size, t0, o = {}) {   // a tilted rubber stamp mark
  const ctx = L.G.ctx; ctx.save(); ctx.font = `${size}px KB`; const w = ctx.measureText(text).width + size; ctx.restore();
  const h = size * 1.5, a = o.rot ?? -0.12, c = Math.cos(a), s = Math.sin(a);
  const pts = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]].map(([px, py]) => [cx + px * c - py * s, cy + px * s + py * c]);
  L.INK_(pts, { closed: true, w: 5, amp: 0.8, col: o.col || L.YELD }, t0, 0.12); L.MRK([pts], { col: 'rgba(255,205,40,0.35)', w: 14, edge: false }, t0 + 0.05, 0.08);
  return L.TXT(text, cx, cy + size * 0.34, size, { f: 'KB', align: 'center' }, t0 + 0.08, 0.25);
}
function ear(L, cx, cy, s, t0) { const P = L.bez([cx, cy - 50 * s], [cx + 50 * s, cy - 60 * s], [cx + 50 * s, cy + 20 * s], [cx + 10 * s, cy + 50 * s]); L.INK_(P, { w: 3.4, amp: 0.3 }, t0, 0.12); L.INK_(L.bez([cx + 6 * s, cy - 24 * s], [cx + 30 * s, cy - 26 * s], [cx + 28 * s, cy + 4 * s], [cx + 12 * s, cy + 12 * s]), { w: 2.6, amp: 0.3, passes: 1 }, t0 + 0.1, 0.08); return t0 + 0.2; }
function dot(L, cx, cy, r, t0) { const c = L.ell(cx, cy, r, r, 0, L.TAU, 20); L.MRK([c], { col: L.INKM(0.9), w: 8, edge: false, op: 'source-over' }, t0, 0.05); return t0 + 0.08; }
function gift(L, cx, cy, s, t0) { const b = [[cx - 50 * s, cy - 40 * s], [cx + 50 * s, cy - 40 * s], [cx + 50 * s, cy + 50 * s], [cx - 50 * s, cy + 50 * s]]; L.FILL(b, t0); L.MRK([b], { col: L.YEL, w: 12 }, t0 + 0.05, 0.06); L.INK_(b, { closed: true, w: 3, amp: 0.3 }, t0, 0.12); L.INK_(L.line(cx, cy - 40 * s, cx, cy + 50 * s), { w: 3, amp: 0.2, passes: 1 }, t0 + 0.1, 0.04); for (const sd of [-1, 1]) L.INK_(L.ell(cx + sd * 18 * s, cy - 54 * s, 18 * s, 12 * s, 0, L.TAU, 14), { closed: true, w: 2.6, amp: 0.2, passes: 1 }, t0 + 0.14, 0.05); return t0 + 0.22; }
function handPhone(L, P, t0, s = 1) {   // a small phone held in the person's front hand (contact at P.hand[1])
  const [hx, hy] = P.hand[1], b = L.rrect(hx - 22 * s, hy - 74 * s, 44 * s, 80 * s, 8 * s);
  L.FILL(b, t0); L.MRK([b], { col: L.GRY2, w: 8 }, t0 + 0.04, 0.04); L.INK_(b, { closed: true, w: 2.6, amp: 0.2, passes: 1 }, t0, 0.08);
  const hc = L.ell(hx, hy, 6.5 * P.s, 6.5 * P.s, 0, L.TAU, 14); L.FILL(hc, t0 + 0.1); L.INK_(hc, { closed: true, w: 2.4, amp: 0.2, passes: 1 }, t0 + 0.1, 0.03);   // thumb over the phone edge
  return [hx, hy - 34 * s];
}
// the scene "you on the couch with the phone" (cold open + callback)
function couch(L, x, y, w, t0) {
  const seat = L.rrect(x, y - 110, w, 70, 20), back = L.rrect(x - 10, y - 260, w + 20, 160, 30);
  L.FILL(back, t0); L.MRK([back], { col: L.GRY, w: 14 }, t0 + 0.06, 0.08); L.INK_(back, { closed: true, w: 3, amp: 0.5 }, t0, 0.16);
  L.FILL(seat, t0 + 0.08); L.MRK([seat], { col: L.GRY2, w: 12 }, t0 + 0.12, 0.06); L.INK_(seat, { closed: true, w: 3, amp: 0.4 }, t0 + 0.08, 0.12);
  for (const xx of [x + 20, x + w - 20]) L.INK_(L.line(xx, y - 40, xx, y), { w: 3, amp: 0.2, passes: 1 }, t0 + 0.16, 0.04);
  return t0 + 0.22;
}

const LONG = {};
const def = (F, id, block, o, draw) => { F[id] = { block, ...o, draw }; };
const OKP = 'ok.';

// ===== cold open: the "ok." =====
def(LONG, 'hook1', blk(0, 1), { purpose: 'hook: the reply lands, "ok." with a period, shown before it is explained', shot: 'opens close on the phone screen from frame 0 (your long message already there), the reply bubble pops in; pull back to you holding the phone on the couch when the period lands (the reveal of who is reading it)', sfx: 'phone buzz on frame 0; a soft pop on the bubble; one hard pen tap on the period', noAutoCam: true }, (S, L) => {
  const B = blk(0, 1), [x, y] = B, c = S.fit(B);
  S.cam(S.t0 - 0.01, x + 1120, y + 470, 1.45, 0.01); S.cam(S.at('period') - 0.6, c.x, c.y, c.z * 1.02, 1.5, 'io');
  couch(L, x + 120, y + 860, 620, S.t0 - 1.0);
  const P = L.person(x + 420, y + 860, 1.7, S.t0 - 1.2, { pose: 'sit', you: true, kind: 'neutral', look: [1, -0.2], hair: 'tuft', k: 0.6 });
  L.INK_(L.quad(P.hand[1], [P.hand[1][0] + 120, P.hand[1][1] - 120], [x + 960, y + 600]), { w: 2, amp: 0.5, passes: 1, alpha: 0.4, dash: [8, 10] }, S.t0 - 0.3, 0.2);
  handPhone(L, P, S.t0 - 0.4, 1.1);
  const sc = bigPhone(L, x + 1120, y + 450, 1.25, S.t0 - 1.4, { name: 'Sam' });
  msg(L, sc[0] + sc[2] - 270, sc[1] + 80, 250, 150, '', S.t0 - 0.9, { mine: true, lines: 5 });
  L.TXT('sent 1 hour ago', sc[0] + sc[2] - 145, sc[1] + 262, 22, { f: 'PH', align: 'center', col: L.INK2 }, S.t0 - 0.5, 0.2);
  buzz(L, x + 1120, y + 450, 200, S.t0 + 0.05);
  msg(L, sc[0] + 20, sc[1] + 320, 120, 70, 'ok', S.at('okay') - 0.3, { size: 40 });
  dot(L, sc[0] + 116, sc[1] + 368, 6, S.at('period') - 0.1);
  L.loop(sc[0] + 80, sc[1] + 355, 90, 55, S.at('period') + 0.1, 0.4);
  L.react(P, S.at('period') + 0.3, { kind: 'worry', look: [1, -0.3] });
});
def(LONG, 'hook2', blk(0, 2), { purpose: 'the spiral: re-reading, the questions, two letters become a story (always a bad one)', shot: 'pan right; the "ok." is written again and again in a column (each re-read), the questions orbit the head, then a dolly-in on the story cloud as it darkens', sfx: 'a page tap per re-read; rising plucks under the questions; a low note on "never a good one"' }, (S, L) => {
  const [x, y] = blk(0, 2);
  for (let i = 0; i < 5; i++) L.TXT(OKP, x + 160, y + 180 + i * 110, 70 - i * 6, { f: 'KB', align: 'center' }, S.at('again') - 0.9 + i * 0.32, 0.2);
  const H = L.head(x + 640, y + 560, 120, S.at('read') - 0.4, { you: true, kind: 'worry', look: [-1, -0.4], k: 0.6 });
  L.bubble(x + 820, y + 140, 330, 90, S.at('annoyed') - 0.5, { text: 'annoyed?', size: 40, thought: true, tail: [x + 720, y + 440] });
  L.bubble(x + 1000, y + 300, 470, 90, S.at('wrong') - 0.7, { text: 'did I say something?', size: 36, thought: true, tail: [x + 760, y + 470] });
  L.bubble(x + 860, y + 470, 330, 90, S.at('why') - 0.2, { text: 'why the .', size: 40, thought: true, tail: [x + 770, y + 540] });
  cloud(L, x + 1060, y + 740, 600, 220, S.at('story') - 0.5, { tint: L.GRY2 });
  L.TXT('a whole story', x + 1060, y + 750, 50, { f: 'KB', align: 'center' }, S.at('story') - 0.2, 0.5);
  L.TXT('(never a good one)', x + 1060, y + 905, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('never') - 0.2, 0.6);
  L.react({ head: [x + 640, y + 560, 120] }, S.at('never'), { kind: 'sad', look: [1, 0.5] });
});
def(LONG, 'hook3', blk(0, 3), { purpose: 'the strange part: it has been tested; the answer is about the reader, not the message', shot: 'pan right; a lab card is written, a magnifier slides from the phone to the reader\'s head (the real subject); push on the head', sfx: 'pen; a magnifier whoosh on "brain"' }, (S, L) => {
  const [x, y] = blk(0, 3);
  card(L, x + 120, y + 140, 560, 260, S.at('tested') - 0.5, { lines: [['tested:', 40, 'PH'], ['reading tone in text', 42]] });
  const sc = bigPhone(L, x + 400, y + 680, 0.6, S.at('message') - 0.6); msg(L, sc[0] + 10, sc[1] + 120, 80, 46, 'ok.', S.at('message') - 0.3, { size: 26 });
  const H = L.head(x + 1180, y + 560, 150, S.at('brain') - 0.8, { you: true, kind: 'think', look: [-1, 0], k: 0.6 });
  L.inkArrow([[x + 600, y + 680], [x + 980, y + 600]], { w: 4 }, S.at('brain') - 0.4, 0.3);
  const mx = x + 1180, my = y + 560; L.INK_(L.ell(mx, my, 210, 210, 0, L.TAU, 50), { closed: true, w: 6, amp: 0.4 }, S.at('reading') - 0.4, 0.25); L.INK_(L.line(mx + 150, my + 150, mx + 260, my + 260), { w: 12, amp: 0.2, passes: 1 }, S.at('reading') - 0.2, 0.1);
  L.TXT('less about the message', x + 400, y + 1010, 38, { f: 'PH', align: 'center', col: L.INK2 }, S.at('less') - 0.2, 0.5);
  L.TXT('more about the reader', x + 1180, y + 860, 44, { f: 'KB', align: 'center' }, S.at('more') - 0.2, 0.5);
});
def(LONG, 'hook4', blk(0, 4), { purpose: 'the promise: why the verdict, how often right, what to do next time', shot: 'pan right; "ok." becomes a judge\'s verdict card, a 3-item notepad is ticked on each question; slow push', sfx: 'gavel tap on "verdict"; pen ticks' }, (S, L) => {
  const [x, y] = blk(0, 4);
  L.TXT(OKP, x + 260, y + 300, 140, { f: 'KB', align: 'center' }, S.t0, 0.3);
  L.fatArrow(x + 400, y + 260, x + 620, S.at('verdict') - 0.6);
  stamp(L, x + 900, y + 270, 'VERDICT: ANGRY', 60, S.at('verdict') - 0.2);
  notepad(L, x + 400, y + 470, 860, 380, S.at('right') - 1.2, ['why your brain does it', 'how often it\'s right', 'what to do next time'], { it: [S.at('why') - 0.2, S.at('right') - 0.6, S.at('should') - 0.3], size: 44, lh: 90 });
  L.check(x + 441, y + 535, 1.3, S.at('verdict') + 0.2); L.check(x + 441, y + 625, 1.3, S.at('right') + 0.1); L.check(x + 441, y + 715, 1.3, S.at('screen'));
});
def(LONG, 'sting', blk(0, 5, 1300, 600), { purpose: 'channel sting (≤ 2 s, after the hook)', shot: 'whip right across empty dots to the banner', sfx: 'paper whoosh + one kalimba note', ease: 'q', move: 0.6 }, (S, L) => {
  const [x, y] = blk(0, 5, 1300, 600);
  L.ribbon(x + 650, y + 280, 860, 120, 'THE OVERTHINKING PAD', 64, S.t0 + 0.2, { d: 0.35, td: 0.9 });
  L.MST(L.bez([x + 520, y + 420], [x + 600, y + 520], [x + 740, y + 380], [x + 800, y + 470]), { w: 4, col: L.INK, amp: 1 }, S.t0 + 1.2, 0.4);
});
const chapter = (F, id, row, n, title) => {
  const big = title.length > 24, w = Math.max(560, title.length * (big ? 36 : 44)), B = [-200, row * GY + 180, Math.max(1400, 480 + w + 120), 560];
  def(F, id, B, { purpose: `chapter ${n} title`, shot: 'whip across the page to the numbered banner (a jump in thought)', sfx: 'paper whoosh, kalimba note', ease: 'q', move: 0.75 }, (S, L) => {
    const [x, y] = B;
    numDot(L, x + 180, y + 280, n, S.t0 + 0.25, 64);
    L.ribbon(x + 400 + w / 2, y + 280, w, 120, title, big ? 58 : 70, S.t0 + 0.45, { d: 0.3, td: 0.9 });
  });
};

// ===== chapter 1: the missing voice =====
chapter(LONG, 'ch1', 1, 1, 'THE MISSING VOICE');
def(LONG, 'c1a', blk(1, 1), { purpose: 'who, when, where: Kruger & Epley 2005; 60 Cornell students in pairs', shot: 'pan right from the banner; the two researcher name cards, the year tag, then the students arrive in pairs; slow push', sfx: 'pen; a door click as the pairs come in' }, (S, L) => {
  const [x, y] = blk(1, 1);
  tag(L, x + 800, y + 110, '2005', 72, S.at('thousand') - 0.4, { tint: L.YEL });
  card(L, x + 140, y + 220, 560, 160, S.at('kruger') - 0.4, { lines: [['Justin Kruger', 46]] });
  card(L, x + 900, y + 220, 560, 160, S.at('epley') - 0.4, { lines: [['Nicholas Epley', 46]] });
  L.TXT('60 students · Cornell', x + 800, y + 520, 56, { f: 'KB', align: 'center' }, S.at('sixty') - 0.3, 0.6);
  for (let i = 0; i < 3; i++) { const px = x + 360 + i * 440; const A = L.person(px, y + 860, 1.0, S.at('pairs') - 0.9 + i * 0.15, { kind: 'smile', look: [1, 0], hair: ['tuft', 'long', 'cap'][i], k: 0.4 }); L.person(px + 110, y + 860, 1.0, S.at('pairs') - 0.8 + i * 0.15, { kind: 'neutral', look: [-1, 0], hair: ['curly', 'bun', 'messy'][i], k: 0.4 }); }
});
def(LONG, 'c1b', blk(1, 2), { purpose: 'the task: sarcastic vs serious sentences; get the real meaning across', shot: 'pan right; a sentence card is written, then split into two readings (eye-roll face vs straight face); push on the split', sfx: 'pen; a "hmm" pluck' }, (S, L) => {
  const [x, y] = blk(1, 2);
  L.box(x + 300, y + 150, 1000, 160, S.at('list') - 0.5, 0.3, { r: 20 });
  L.TXT('"Great weather today."', x + 800, y + 252, 60, { f: 'KB', align: 'center' }, S.at('sentences') - 0.2, 0.6);
  L.inkArrow([[x + 640, y + 330], [x + 440, y + 500]], { w: 4 }, S.at('sarcastically') - 0.4, 0.2); L.inkArrow([[x + 960, y + 330], [x + 1160, y + 500]], { w: 4 }, S.at('seriously') - 0.4, 0.2);
  L.head(x + 400, y + 640, 100, S.at('sarcastically') - 0.3, { kind: 'bored', look: [0, -1], hair: 'messy', k: 0.6 }); L.TXT('sarcastic', x + 400, y + 820, 46, { f: 'KB', align: 'center' }, S.at('sarcastically'), 0.4);
  L.head(x + 1200, y + 640, 100, S.at('seriously') - 0.3, { kind: 'smile', look: [0, 0], hair: 'long', k: 0.6 }); L.TXT('serious', x + 1200, y + 820, 46, { f: 'KB', align: 'center' }, S.at('seriously'), 0.4);
  L.TXT('get the real meaning across', x + 800, y + 900, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('meaning') - 0.4, 0.6);
});
def(LONG, 'c1c', blk(1, 3), { purpose: 'the manipulation: half typed an email, half read aloud into a tape recorder', shot: 'pan right; the page splits down the middle: left a typing student at a laptop, right a student speaking into a recorder; same card on both sides', sfx: 'keyboard clicks left; a tape-recorder clunk right' }, (S, L) => {
  const [x, y] = blk(1, 3);
  L.INK_(L.line(x + 800, y + 60, x + 800, y + 880), { w: 3, amp: 0.8, dash: [16, 12] }, S.at('half') - 0.4, 0.3);
  desk(L, x + 160, y + 640, 520, S.at('typed') - 0.6, { h: 860 - 640 });
  const A = L.person(x + 300, y + 860, 1.5, S.at('typed') - 0.8, { pose: 'sit', kind: 'think', look: [1, 0.4], hair: 'tuft', k: 0.5 }); laptop(L, x + 540, y + 640, 1.0, S.at('email') - 0.4);
  envelope(L, x + 540, y + 460, 1.3, S.at('email'));
  L.TXT('EMAIL', x + 420, y + 140, 64, { f: 'KB', align: 'center' }, S.at('email') - 0.2, 0.3);
  const B2 = L.person(x + 1100, y + 860, 1.5, S.at('loud') - 0.6, { pose: 'hold', kind: 'grin', look: [1, 0.3], hair: 'long', k: 0.5 });
  recorder(L, B2.hand[1][0] + 90, B2.hand[1][1] - 10, 0.8, S.at('recorder') - 0.4);
  wave(L, x + 1180, y + 420, 220, 30, S.at('loud') - 0.1, 0.5);
  L.TXT('VOICE', x + 1180, y + 140, 64, { f: 'KB', align: 'center' }, S.at('loud') - 0.2, 0.3);
  L.TXT('same sentences', x + 800, y + 960, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('same') - 0.2, 0.4);
});
def(LONG, 'c1d', blk(1, 4), { purpose: 'the prediction: email senders as confident as voice senders', shot: 'pan right; two confidence bars rise to the same height side by side; push on the equal tops', sfx: 'two rising plucks, same pitch' }, (S, L) => {
  const [x, y] = blk(1, 4);
  L.TXT('senders predicted:', x + 800, y + 120, 54, { f: 'KB', align: 'center' }, S.at('predicted') - 0.4, 0.5);
  L.bars(x + 400, y + 780, 800, 520, [{ v: 0.9, label: 'email', col: L.YEL }, { v: 0.9, label: 'voice', col: L.GRYD }], S.at('email') - 0.3, { gap: 0.4 });
  L.TXT('just as confident', x + 800, y + 920, 48, { f: 'KB', align: 'center' }, S.at('confident') - 0.3, 0.5);
});
def(LONG, 'c1e', blk(1, 5), { purpose: 'the result: listeners ~3 of 4; readers = a coin flip', shot: 'pan right; four ears, three ticked; then a coin spins in on the reader side and lands on 50%; push on the coin', sfx: 'three ticks; a coin spin and clink' }, (S, L) => {
  const [x, y] = blk(1, 5);
  L.TXT('listeners', x + 400, y + 140, 56, { f: 'KB', align: 'center' }, S.at('listeners') - 0.3, 0.4);
  for (let i = 0; i < 4; i++) { const ex = x + 160 + i * 160; ear(L, ex, y + 380, 1.2, S.at('three') - 0.6 + i * 0.1); if (i < 3) L.check(ex + 20, y + 500, 1.6, S.at('right') - 0.3 + i * 0.1); else L.cross(ex + 20, y + 500, 1.4, S.at('right')); }
  L.TXT('≈ 3 in 4', x + 400, y + 660, 64, { f: 'KB', align: 'center' }, S.at('four') - 0.2, 0.4);
  L.TXT('readers', x + 1200, y + 140, 56, { f: 'KB', align: 'center' }, S.at('readers') - 0.3, 0.4);
  coin(L, x + 1200, y + 330, 50, S.at('coin') - 0.9, { edge: true });
  coin(L, x + 1200, y + 470, 120, S.at('flip') - 0.2);
  L.TXT('a coin flip', x + 1200, y + 680, 58, { f: 'KB', align: 'center' }, S.at('flip'), 0.4);
});
def(LONG, 'c1f', blk(1, 6), { purpose: 'the readers did not know: ~9 in 10 sure, coin-flip accurate', shot: 'pan right; a reader with a big confident grin and a thumbs-up; the confidence meter at 9/10 beside the 50% coin; push on the gap between them', sfx: 'a cheerful pluck, then a deflating note' }, (S, L) => {
  const [x, y] = blk(1, 6);
  const P = L.person(x + 320, y + 860, 1.7, S.t0 + 0.05, { pose: 'arms_up', kind: 'grin', look: [1, -0.2], hair: 'cap', k: 0.6 });
  L.TXT('"got it!"', x + 320, y + 300, 48, { f: 'KB', align: 'center' }, S.at('idea') - 0.2, 0.3);
  const g = gauge(L, x + 900, y + 520, 220, S.at('sure') - 0.5, { v: 0.9, lo: 'unsure', hi: 'certain', label: 'feels sure' });
  L.TXT('9 in 10', x + 900, y + 640, 54, { f: 'KB', align: 'center' }, S.at('nine') - 0.2, 0.4);
  coin(L, x + 1350, y + 520, 90, S.at('coin') - 0.4);
  L.TXT('actual', x + 1350, y + 680, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('accuracy') - 0.2, 0.3);
  L.MST(L.bez([x + 1000, y + 820], [x + 1100, y + 860], [x + 1250, y + 860], [x + 1340, y + 800]), { w: 6, col: L.YELD }, S.at('accuracy'), 0.4);
});
def(LONG, 'c1g', blk(1, 7), { purpose: 'the key idea: text doesn\'t FEEL hard; the brain stamps its reading CERTAIN', shot: 'pan right; "hard to read" is written then crossed, "doesn\'t feel hard" underneath; a brain hands over a card and a stamp comes down: CERTAIN', sfx: 'pen strike; a heavy stamp thud on "certain"' }, (S, L) => {
  const [x, y] = blk(1, 7);
  L.TXT('text is hard to read', x + 520, y + 180, 54, { f: 'KB', align: 'center' }, S.at('hard') - 0.6, 0.6);
  L.MST(L.line(x + 220, y + 165, x + 820, y + 165), { w: 8, col: L.INK }, S.at("doesn't") - 0.3, 0.2);
  L.TXT("it doesn't FEEL hard", x + 520, y + 300, 60, { f: 'KB', align: 'center' }, S.at('feel') - 0.3, 0.5); L.swash(x + 300, y + 325, x + 760, S.at('feel') + 0.4, 0.3);
  const H = L.head(x + 360, y + 620, 120, S.at('brain') - 0.5, { you: true, kind: 'proud', look: [1, 0], k: 0.6 });
  card(L, x + 620, y + 500, 520, 240, S.at('interpretation') - 0.4, { lines: [['"they\'re annoyed"', 46]] });
  stamp(L, x + 1180, y + 760, 'CERTAIN', 70, S.at('certain') - 0.2);
});
def(LONG, 'c1g2', blk(1, 8), { purpose: 'even the easy study: expected 97%, got 84% (confident and off)', shot: 'pan right; two bars: 97 predicted vs 84 actual; push on the gap', sfx: 'two plucks; a small drop' }, (S, L) => {
  const [x, y] = blk(1, 8);
  L.TXT('their smallest study', x + 800, y + 120, 54, { f: 'KB', align: 'center' }, S.at('smallest') - 0.3, 0.5);
  L.bars(x + 450, y + 780, 700, 520, [{ v: 0.97, label: 'expected 97%', col: L.GRYD }, { v: 0.84, label: 'actual 84%', col: L.YEL }], S.at('ninety') - 0.4, { gap: 0.4 });
  L.TXT('confident... and off', x + 800, y + 930, 48, { f: 'KB', align: 'center' }, S.at('off') - 0.4, 0.5);
});
def(LONG, 'c1h', blk(1, 9), { purpose: 'the objection: surely friends can read each other', shot: 'pan right; two friends arm in arm, a heart between their phones; a question mark hovers', sfx: 'a warm pluck; a question "boing"' }, (S, L) => {
  const [x, y] = blk(1, 9);
  const A = L.person(x + 600, y + 860, 1.6, S.at('strangers') - 0.5, { pose: 'hold', you: true, kind: 'smile', look: [1, 0], hair: 'tuft', k: 0.5 });
  const B2 = L.person(x + 1000, y + 860, 1.6, S.at("friend's") - 0.6, { pose: 'hold', kind: 'grin', look: [-1, 0], hair: 'curly', k: 0.5 });
  handPhone(L, A, S.at("friend's") - 0.2); handPhone(L, B2, S.at("friend's"));
  heart(L, x + 800, y + 420, S.at('texts') - 0.2);
  L.TXT('best friend = easy?', x + 800, y + 160, 60, { f: 'KB', align: 'center' }, S.at('best') - 0.3, 0.6);
  L.qmark(x + 800, y + 320, 110, S.at('wondered') - 0.3);
});
def(LONG, 'c1i', blk(1, 10), { purpose: 'the bigger test: Illinois, 154 pairs, friends vs strangers, 4 tones', shot: 'pan right; a crowd grid fills, split into FRIENDS and STRANGERS; the four tone tags drop in', sfx: 'pen dots; four tag taps' }, (S, L) => {
  const [x, y] = blk(1, 10);
  tag(L, x + 800, y + 100, 'University of Illinois', 52, S.at('illinois') - 0.4);
  L.TXT('154 pairs', x + 800, y + 230, 60, { f: 'KB', align: 'center' }, S.at('fifty') - 0.3, 0.4);
  crowd(L, x + 180, y + 320, 32, 8, 70, S.at('pairs') - 0.2, 0.03); crowd(L, x + 900, y + 320, 32, 8, 70, S.at('pairs'), 0.03);
  L.TXT('strangers', x + 420, y + 640, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('strangers') - 0.2, 0.3); L.TXT('friends', x + 1140, y + 640, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('friends') - 0.2, 0.3);
  ['sarcasm', 'serious', 'anger', 'sadness'].forEach((w, i) => tag(L, x + 260 + i * 360, y + 800, w, 40, S.at(['sarcasm', 'seriousness', 'anger', 'sadness'][i]) - 0.3, { tint: i === 0 ? L.YEL : null }));
});
def(LONG, 'c1j', blk(1, 11), { purpose: 'result: thought ~9 in 10, got ~6 in 10; friends = strangers', shot: 'pan right; "thought" vs "got" bars; then the friends/strangers bars come out equal; push on the equal sign', sfx: 'plucks; a sting chord on "friends did no better"' }, (S, L) => {
  const [x, y] = blk(1, 11);
  L.bars(x + 140, y + 700, 600, 480, [{ v: 0.89, label: 'thought 89%', col: L.GRYD }, { v: 0.63, label: 'got 63%', col: L.YEL }], S.at('believed') - 0.4, { gap: 0.4 });
  L.TXT('over email', x + 440, y + 120, 48, { f: 'KB', align: 'center' }, S.at('email') - 0.3, 0.4);
  const F = L.person(x + 1000, y + 700, 1.3, S.at('friends') - 0.4, { kind: 'shock', look: [1, 0], hair: 'curly', k: 0.4 }); const St = L.person(x + 1380, y + 700, 1.3, S.at('strangers') - 0.4, { kind: 'neutral', look: [-1, 0], hair: 'cap', k: 0.4 });
  L.TXT('=', x + 1190, y + 560, 120, { f: 'KB', align: 'center' }, S.at('accurate') - 0.2, 0.2);
  L.TXT('friends = strangers', x + 1190, y + 860, 50, { f: 'KB', align: 'center' }, S.at('strangers'), 0.5);
});
def(LONG, 'c1k', blk(1, 12), { purpose: 'years of friendship didn\'t fix it; open question: where does the tone come from?', shot: 'pan right; a calendar of years flips, the "ok." sits alone; a big arrow from the text to a question mark over a head (the curiosity loop into ch.2)', sfx: 'calendar flips; a question pluck' }, (S, L) => {
  const [x, y] = blk(1, 12);
  for (let i = 0; i < 4; i++) L.sheet(x + 160 + i * 26, y + 160 + i * 20, 260, 200, S.at('years') - 0.6 + i * 0.1, { lines: 2 });
  L.TXT('years', x + 330, y + 470, 50, { f: 'KB', align: 'center' }, S.at('years'), 0.3);
  L.cross(x + 340, y + 280, 4, S.at('fix') - 0.1);
  L.TXT("the tone isn't in the text", x + 900, y + 260, 56, { f: 'KB', align: 'center' }, S.at('tone') - 0.3, 0.6);
  L.head(x + 1200, y + 620, 130, S.at('brain') - 0.6, { you: true, kind: 'think', look: [-0.5, -1], k: 0.6 });
  L.qmark(x + 1200, y + 400, 140, S.at('from') - 0.3);
  L.TXT('so where does it come from?', x + 900, y + 930, 46, { f: 'PH', align: 'center', col: L.INK2 }, S.at('getting') - 0.4, 0.6);
});

// ===== chapter 2: your brain fills the gap =====
chapter(LONG, 'ch2', 2, 2, 'YOUR BRAIN FILLS THE GAP');
def(LONG, 'c2a', blk(2, 1), { purpose: 'what a voice/face carries vs what text strips away', shot: 'pan right; a rich voice wave + a face with an eyebrow and smile on the left, a flat line + bare letters on the right; push on the flat line', sfx: 'a little laugh-like pluck; then silence on "strips"' }, (S, L) => {
  const [x, y] = blk(2, 1);
  wave(L, x + 140, y + 300, 560, 70, S.at('pitch') - 0.4, 0.8);
  L.TXT('pitch · pauses · a laugh', x + 420, y + 450, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('pauses') - 0.3, 0.6);
  L.head(x + 420, y + 690, 120, S.at('face') - 0.4, { kind: 'smile', look: [1, 0], hair: 'long', k: 0.6 });
  L.INK_(L.quad([x + 440, y + 560], [x + 480, y + 540], [x + 510, y + 560]), { w: 4, amp: 0.1, passes: 1 }, S.at('eyebrow') - 0.1, 0.1);
  L.fatArrow(x + 760, y + 450, x + 900, S.at('text') - 0.5);
  flatline(L, x + 960, y + 300, 500, S.at('strips') - 0.4, 0.4);
  L.TXT(OKP, x + 1210, y + 690, 140, { f: 'KB', align: 'center' }, S.at('away') - 0.4, 0.3);
  L.TXT('text', x + 1210, y + 450, 50, { f: 'KB', align: 'center' }, S.at('text') - 0.2, 0.3);
});
def(LONG, 'c2b', blk(2, 2), { purpose: 'the brain hates a gap, so it fills it, with YOUR voice', shot: 'pan right; a gap between "o" "k" "." is bridged by a yellow speech wave coming from your own head; push on the head (the voice is yours)', sfx: 'a rising whoosh; a soft pop on "yours"' }, (S, L) => {
  const [x, y] = blk(2, 2);
  L.TXT('o', x + 260, y + 380, 160, { f: 'KB', align: 'center' }, S.t0 + 0.05, 0.2); L.TXT('k.', x + 760, y + 380, 160, { f: 'KB', align: 'center' }, S.t0 + 0.15, 0.2);
  L.INK_(L.rrect(x + 360, y + 230, 280, 200, 20), { closed: true, w: 3, amp: 1, dash: [14, 12] }, S.at('gap') - 0.3, 0.3);
  L.TXT('gap', x + 500, y + 480, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('gap'), 0.3);
  wave(L, x + 380, y + 330, 240, 40, S.at('fills') - 0.2, 0.5, { col: L.YELD, w: 10 });
  const H = L.head(x + 1250, y + 560, 150, S.at('voice') - 0.6, { you: true, kind: 'neutral', look: [-1, -0.3], k: 0.6 });
  L.INK_(L.bez([x + 1100, y + 520], [x + 950, y + 420], [x + 800, y + 480], [x + 640, y + 340]), { w: 3, amp: 0.6, dash: [10, 10] }, S.at('fill') - 0.2, 0.4);
  L.TXT("it's yours", x + 1250, y + 830, 60, { f: 'KB', align: 'center' }, S.at('yours') - 0.3, 0.4); L.swash(x + 1110, y + 855, x + 1390, S.at('yours') + 0.2, 0.3);
});
def(LONG, 'c2c', blk(2, 3), { purpose: 'the sender side: you hear the sarcasm in your head as you type', shot: 'pan right; a person typing with a thought bubble that has an eye-roll face and the wave; the screen shows plain words; push on the gap between bubble and screen', sfx: 'typing; a sly pluck' }, (S, L) => {
  const [x, y] = blk(2, 3);
  desk(L, x + 200, y + 680, 600, S.at("sender's") - 0.6, { h: 900 - 680 });
  const P = L.person(x + 380, y + 900, 1.6, S.at("sender's") - 0.8, { pose: 'sit', kind: 'grin', look: [1, 0.3], hair: 'messy', k: 0.6 });
  laptop(L, x + 640, y + 680, 1.1, S.at('type') - 0.4);
  L.bubble(x + 160, y + 140, 560, 220, S.at('hear') - 0.5, { thought: true, tail: [x + 380, y + 560] });
  L.head(x + 300, y + 250, 60, S.at('sarcasm') - 0.3, { kind: 'bored', look: [0, -1], hair: 'messy', k: 0.5 }); wave(L, x + 400, y + 250, 260, 30, S.at('head') - 0.2, 0.4, { col: L.YELD });
  L.box(x + 980, y + 300, 520, 160, S.at('obvious') - 0.6, 0.25, { r: 18 }); L.TXT('"love that for us"', x + 1240, y + 395, 44, { f: 'KB', align: 'center' }, S.at('obvious') - 0.4, 0.5);
  L.TXT('obvious... to you', x + 1240, y + 640, 54, { f: 'KB', align: 'center' }, S.at('you') - 0.3, 0.5);
});
def(LONG, 'c2d', blk(2, 4), { purpose: 'the fix in the lab: read your own message aloud in the opposite tone', shot: 'pan right; the sender at the tape recorder, two arrows swap labels (sarcastic ⇄ serious); push on the swap', sfx: 'tape clunk; a swap swish' }, (S, L) => {
  const [x, y] = blk(2, 4);
  const P = L.person(x + 340, y + 880, 1.6, S.at('senders') - 0.5, { pose: 'hold', kind: 'think', look: [1, 0.2], hair: 'messy', k: 0.6 });
  recorder(L, P.hand[1][0] + 100, P.hand[1][1] - 10, 0.9, S.at('loud') - 0.3);
  L.TXT('read it aloud', x + 360, y + 180, 50, { f: 'KB', align: 'center' }, S.at('loud') - 0.3, 0.4);
  L.TXT('in the OPPOSITE tone', x + 1060, y + 180, 54, { f: 'KB', align: 'center' }, S.at('opposite') - 0.3, 0.5);
  tag(L, x + 900, y + 420, 'sarcastic', 46, S.at('sarcastic') - 0.3); L.inkArrow([[x + 1060, y + 420], [x + 1200, y + 420]], { w: 4 }, S.at('seriously') - 0.3, 0.15); tag(L, x + 1340, y + 420, 'serious', 46, S.at('seriously') - 0.1, { tint: L.YEL });
  tag(L, x + 900, y + 620, 'serious', 46, S.at('serious') - 0.3); L.inkArrow([[x + 1060, y + 620], [x + 1200, y + 620]], { w: 4 }, S.at('sarcastically') - 0.3, 0.15); tag(L, x + 1340, y + 620, 'sarcastic', 46, S.at('sarcastically') - 0.1, { tint: L.YEL });
});
def(LONG, 'c2e', blk(2, 5), { purpose: 'result: the overconfidence disappeared; predictions matched reality', shot: 'pan right; predicted bar shrinks onto the actual bar until they match; push on the match', sfx: 'a deflating slide, then a neat "click" as the bars align' }, (S, L) => {
  const [x, y] = blk(2, 5);
  L.TXT('overconfidence', x + 800, y + 130, 60, { f: 'KB', align: 'center' }, S.at('overconfidence') - 0.4, 0.5);
  L.MST(L.line(x + 520, y + 110, x + 1080, y + 110), { w: 8, col: L.INK }, S.at('disappeared') - 0.2, 0.2);
  L.bars(x + 450, y + 760, 700, 460, [{ v: 0.63, label: 'predicted', col: L.GRYD }, { v: 0.63, label: 'actual', col: L.YEL }], S.at('heard') - 0.4, { gap: 0.4 });
  L.check(x + 800, y + 260, 2.4, S.at('matched') - 0.1, { col: L.YELD });
  L.TXT('heard it like a stranger would', x + 800, y + 900, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('stranger') - 0.3, 0.6);
});
def(LONG, 'c2f', blk(2, 6), { purpose: 'flip it: as the reader YOU supply the voice; it depends on mood, history, fears', shot: 'pan right; you holding the phone; three dials around your head (mood, history, fear) feed into the speech wave; push on the fear dial', sfx: 'three dial clicks; a low note on "afraid"' }, (S, L) => {
  const [x, y] = blk(2, 6);
  const P = L.person(x + 400, y + 900, 1.8, S.at('flip') - 0.5, { pose: 'hold', you: true, kind: 'worry', look: [1, 0.3], hair: 'tuft', k: 0.6 });
  handPhone(L, P, S.at('lands') - 0.3, 1.2);
  L.TXT("you supply the voice", x + 800, y + 120, 56, { f: 'KB', align: 'center' }, S.at('supplying') - 0.4, 0.6);
  [['mood', 'mood'], ['history', 'history'], ['fear', 'afraid']].forEach(([lab, w], i) => { const g = gauge(L, x + 900 + i * 240, y + 460, 100, S.at(w) - 0.5, { v: i === 2 ? 0.92 : 0.55 }); L.TXT(lab, x + 900 + i * 240, y + 540, 40, { f: 'KB', align: 'center' }, S.at(w) - 0.2, 0.3); });
  L.MST(L.ell(x + 1380, y + 430, 140, 110, 0, L.TAU, 40), { w: 6, col: L.YELD, amp: 1 }, S.at('afraid') + 0.1, 0.4);
  wave(L, x + 800, y + 760, 600, 30, S.at('depends') - 0.3, 0.6, { col: L.GRYD });
});
def(LONG, 'c2g', blk(2, 7), { purpose: 'example: worrying a friend is upset → "ok." reads as cold', shot: 'pan right; a storm cloud over your head, the "ok." inside the phone grows icicles; push on the icy "ok."', sfx: 'a chilly wind chime on "cold"' }, (S, L) => {
  const [x, y] = blk(2, 7);
  const P = L.person(x + 420, y + 900, 1.8, S.t0 + 0.05, { pose: 'hold', you: true, kind: 'worry', look: [1, 0], hair: 'tuft', k: 0.6 });
  storm(L, P, S.at('worrying') - 0.2);
  L.TXT('"Are they upset?"', x + 420, y + 170, 46, { f: 'KB', align: 'center' }, S.at('upset') - 0.3, 0.5);
  const sc = bigPhone(L, x + 1150, y + 500, 1.0, S.at('reads') - 0.8);
  msg(L, sc[0] + 20, sc[1] + 200, 140, 80, 'ok.', S.at('reads') - 0.3, { size: 46 });
  for (let i = 0; i < 4; i++) L.INK_([[sc[0] + 40 + i * 30, sc[1] + 280], [sc[0] + 50 + i * 30, sc[1] + 320], [sc[0] + 60 + i * 30, sc[1] + 280]], { w: 2.4, amp: 0.1, passes: 1 }, S.at('cold') - 0.1 + i * 0.05, 0.05);
  L.TXT('COLD', x + 1150, y + 880, 70, { f: 'KB', align: 'center' }, S.at('cold'), 0.3);
});
def(LONG, 'c2h', blk(2, 8), { purpose: 'Byron 2008 (review): readers see messages as more negative or neutral than meant', shot: 'pan right; the review card, then a dial labelled "sent" at warm and "read" swinging toward cold; push on the swing', sfx: 'pen; a needle swing' }, (S, L) => {
  const [x, y] = blk(2, 8);
  card(L, x + 140, y + 140, 640, 280, S.at('review') - 0.5, { lines: [['Kristin Byron, 2008', 44], ['review: emotion by email', 36, 'PH']] });
  const g1 = gauge(L, x + 1150, y + 420, 220, S.at('negative') - 1.2, { v: 0.8, lo: 'cold', hi: 'warm', label: 'as sent' });
  const g2 = gauge(L, x + 1150, y + 860, 220, S.at('negative') - 0.6, { v: 0.8, lo: 'cold', hi: 'warm', label: 'as read' }); g2.needle(0.35, S.at('neutral') - 0.3);
  L.TXT('more negative,', x + 460, y + 620, 52, { f: 'KB', align: 'center' }, S.at('negative') - 0.2, 0.4); L.TXT('or more neutral', x + 460, y + 700, 52, { f: 'KB', align: 'center' }, S.at('neutral') - 0.2, 0.4);
  L.TXT('than the sender meant', x + 460, y + 800, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('meant') - 0.3, 0.5);
});
def(LONG, 'c2i', blk(2, 9), { purpose: 'honest label: a theory paper, not one big experiment; small evidence: the period', shot: 'pan right; a "THEORY" tag on the card, then a giant period is drawn and the camera pushes on it', sfx: 'a tag tap; one heavy pen dot' }, (S, L) => {
  const [x, y] = blk(2, 9);
  tag(L, x + 420, y + 200, 'a theory paper', 56, S.at('theory') - 0.3);
  L.TXT('not one big experiment', x + 420, y + 340, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('experiment') - 0.4, 0.5);
  L.TXT('small pieces of evidence', x + 420, y + 560, 46, { f: 'KB', align: 'center' }, S.at('small') - 0.2, 0.6);
  dot(L, x + 1150, y + 500, 90, S.at('period') - 0.3);
  L.TXT('the period', x + 1150, y + 720, 60, { f: 'KB', align: 'center' }, S.at('period'), 0.4);
});
def(LONG, 'c2j', blk(2, 10), { purpose: 'Gunraj et al. 2016 (Binghamton, 126 students): one-word text reply ending in a period = less sincere', shot: 'pan right; two phones side by side: "okay" vs "okay." with sincerity meters; push on the lower meter', sfx: 'two message pops; a down-pluck on "less sincere"' }, (S, L) => {
  const [x, y] = blk(2, 10);
  tag(L, x + 800, y + 90, 'Binghamton University · 126 students', 44, S.at('binghamton') - 0.4);
  const a = bigPhone(L, x + 450, y + 480, 0.85, S.at('exchanges') - 0.6), b = bigPhone(L, x + 1150, y + 480, 0.85, S.at('exchanges') - 0.4);
  msg(L, a[0] + 20, a[1] + 140, 150, 70, 'okay', S.at('okay') - 0.2, { size: 40 }); msg(L, b[0] + 20, b[1] + 140, 150, 70, 'okay.', S.at('yup') - 0.2, { size: 40 });
  L.MST(L.line(x + 330, y + 860, x + 570, y + 860), { w: 22, col: L.YEL }, S.at('rated') - 0.3, 0.3); L.MST(L.line(x + 1030, y + 860, x + 1130, y + 860), { w: 22, col: L.GRYD }, S.at('sincere') - 0.3, 0.3);
  L.TXT('sincere', x + 450, y + 930, 38, { f: 'PH', align: 'center', col: L.INK2 }, S.at('rated') - 0.1, 0.3); L.TXT('less sincere', x + 1150, y + 930, 40, { f: 'KB', align: 'center' }, S.at('sincere'), 0.3);
});
def(LONG, 'c2k', blk(2, 11), { purpose: 'on paper the period didn\'t matter; modest study, one age group; how much we pour into one dot', shot: 'pan right; a handwritten note "okay." with a level meter; the "modest study" tag; then a funnel pours words into one dot (push on the dot)', sfx: 'pencil scratch; a pour/glug' }, (S, L) => {
  const [x, y] = blk(2, 11);
  L.sheet(x + 160, y + 160, 420, 300, S.at('handwritten') - 0.5, { lines: 0 }); L.TXT('okay.', x + 370, y + 330, 70, { f: 'KB', align: 'center' }, S.at('note') - 0.2, 0.3);
  L.TXT('no difference', x + 370, y + 560, 46, { f: 'KB', align: 'center' }, S.at('difference') - 0.3, 0.4);
  tag(L, x + 370, y + 760, 'modest study · one age group', 36, S.at('modest') - 0.3);
  ['annoyed', 'done', 'cold', 'fine?'].forEach((w, i) => L.TXT(w, x + 960 + (i % 2) * 300, y + 200 + Math.floor(i / 2) * 90, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('meaning') - 0.4 + i * 0.12, 0.3));
  L.INK_([[x + 900, y + 380], [x + 1400, y + 380], [x + 1180, y + 620], [x + 1120, y + 620]], { closed: true, w: 3, amp: 0.5 }, S.at('pour') - 0.4, 0.25);
  dot(L, x + 1150, y + 760, 40, S.at('dot') - 0.3); L.loop(x + 1150, y + 760, 80, 70, S.at('dot'), 0.3);
});
def(LONG, 'c2l', blk(2, 12), { purpose: 'sum-up + the key question: when your brain guesses wrong, which way does it lean?', shot: 'pan right; a seesaw labelled "too warm" / "too cold" with a big "?" on the pivot; push on the question', sfx: 'a creak; a question pluck' }, (S, L) => {
  const [x, y] = blk(2, 12);
  L.TXT('it fills the gap...', x + 800, y + 140, 56, { f: 'KB', align: 'center' }, S.at('fills') - 0.3, 0.5);
  L.TXT('...with something worse', x + 800, y + 240, 56, { f: 'KB', align: 'center' }, S.at('worse') - 0.3, 0.5);
  L.INK_([[x + 720, y + 760], [x + 800, y + 640], [x + 880, y + 760]], { closed: true, w: 3, amp: 0.3 }, S.at('guesses') - 0.6, 0.15);
  L.INK_(L.line(x + 380, y + 600, x + 1220, y + 680), { w: 6, amp: 0.3, passes: 1 }, S.at('guesses') - 0.4, 0.2);
  tag(L, x + 440, y + 520, 'too warm', 44, S.at('wrong') - 0.2); tag(L, x + 1160, y + 600, 'too cold', 44, S.at('wrong'));
  L.qmark(x + 800, y + 560, 150, S.at('lean') - 0.4);
});

// ===== chapter 3: they like you more than you think =====
chapter(LONG, 'ch3', 3, 3, 'THEY LIKE YOU MORE THAN YOU THINK');
def(LONG, 'c3a', blk(3, 1), { purpose: 'the turn: errors aren\'t random here, they have a direction', shot: 'pan right; scattered arrows (random) are erased and redrawn all pointing one way; push on the bundle', sfx: 'eraser swipe; a single firm pluck' }, (S, L) => {
  const [x, y] = blk(3, 1);
  for (let i = 0; i < 8; i++) { const a = i * 0.8 + 0.3, cx = x + 320 + (i % 4) * 110, cy = y + 380 + Math.floor(i / 4) * 160; L.inkArrow([[cx, cy], [cx + Math.cos(a) * 70, cy + Math.sin(a) * 70]], { w: 3 }, S.at('random') - 0.5 + i * 0.05, 0.08); }
  L.TXT('random?', x + 480, y + 220, 50, { f: 'KB', align: 'center' }, S.at('random') - 0.2, 0.3);
  L.COVER([[x + 200, y + 260], [x + 760, y + 260], [x + 760, y + 620], [x + 200, y + 620]], S.at('direction') - 0.8);
  for (let i = 0; i < 6; i++) L.inkArrow([[x + 900, y + 300 + i * 60], [x + 1400, y + 340 + i * 60]], { w: 4, col: i === 2 ? L.YELD : L.INK }, S.at('direction') - 0.6 + i * 0.06, 0.12);
  L.TXT('a direction', x + 1150, y + 760, 64, { f: 'KB', align: 'center' }, S.at('direction'), 0.4); L.swash(x + 960, y + 785, x + 1340, S.at('direction') + 0.4, 0.3);
});
def(LONG, 'c3b', blk(3, 2), { purpose: 'Boothby, Cooney, Sandstrom & Clark 2018: strangers talk, then rate liking and guess partner\'s liking', shot: 'pan right; two strangers chat across a table (they look at each other, one gestures on "conversation"); then each holds a rating card; push on the guess card', sfx: 'murmur of talk; card flips' }, (S, L) => {
  const [x, y] = blk(3, 2);
  tag(L, x + 800, y + 90, '2018 · Boothby, Cooney, Sandstrom & Clark', 40, S.at('eighteen') - 0.4);
  const A = L.person(x + 520, y + 760, 1.6, S.at('paired') - 0.5, { pose: 'point', kind: 'smile', look: [1, 0], hair: 'tuft', k: 0.5 });
  const B2 = L.person(x + 1080, y + 760, 1.6, S.at('paired') - 0.3, { pose: 'stand', kind: 'grin', look: [-1, 0], hair: 'bun', k: 0.5, dir: -1 });
  L.bubble(x + 620, y + 240, 360, 80, S.at('conversation') - 0.3, { text: '...and then!', size: 34, tail: [x + 560, y + 450] });
  card(L, x + 120, y + 800, 520, 120, S.at('liked') - 0.4, { lines: [['I like them: 8/10', 34]] });
  card(L, x + 960, y + 800, 560, 120, S.at('guessed') - 0.4, { lines: [['they like me: ?', 34]], tint: 'rgba(255,205,40,0.3)' });
});
def(LONG, 'c3c', blk(3, 3), { purpose: 'the result: people underestimated how much they were liked → THE LIKING GAP', shot: 'pan right; two bars: "they liked you" tall, "you guessed" shorter; the gap between them is bracketed in yellow and labelled; push on the gap', sfx: 'pluck up, pluck down; a soft "aha" chime on the name' }, (S, L) => {
  const [x, y] = blk(3, 3);
  L.bars(x + 300, y + 820, 700, 600, [{ v: 0.85, label: 'they liked you', col: L.YEL }, { v: 0.6, label: 'you guessed', col: L.GRYD }], S.at('underestimated') - 0.4, { gap: 0.4 });
  L.INK_([[x + 1080, y + 310], [x + 1110, y + 310], [x + 1110, y + 460], [x + 1080, y + 460]], { w: 4, amp: 0.2, passes: 1 }, S.at('more') - 0.2, 0.15);
  L.ribbon(x + 1300, y + 390, 380, 100, 'THE LIKING GAP', 44, S.at('liking') - 0.4, { d: 0.25, td: 0.5 });
});
def(LONG, 'c3d', blk(3, 4), { purpose: 'it held up: dorm mates for months; adults at a workshop', shot: 'pan right; a dorm door with two roommates and a calendar of months; then a workshop circle of adults; slow push', sfx: 'door creak; calendar page flips' }, (S, L) => {
  const [x, y] = blk(3, 4);
  L.door(x + 160, y + 760, 200, 400, S.at('dorm') - 0.6);
  L.person(x + 480, y + 760, 1.2, S.at('dorm') - 0.4, { kind: 'smile', look: [1, 0], hair: 'cap', k: 0.4 }); L.person(x + 620, y + 760, 1.2, S.at('dorm') - 0.3, { kind: 'think', look: [-1, 0], hair: 'curly', k: 0.4 });
  L.TXT('dorm mates', x + 420, y + 860, 46, { f: 'KB', align: 'center' }, S.at('mates') - 0.2, 0.4);
  for (let i = 0; i < 4; i++) L.sheet(x + 300 + i * 22, y + 130 + i * 16, 200, 150, S.at('months') - 0.6 + i * 0.08, { lines: 2 }); L.TXT('months', x + 400, y + 380, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('months'), 0.3);
  for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * L.TAU / 5; L.person(x + 1200 + Math.cos(a) * 200, y + 640 + Math.sin(a) * 120, 0.9, S.at('workshop') - 0.6 + i * 0.08, { kind: 'smile', look: [-Math.cos(a), 0], hair: ['tuft', 'long', 'bun', 'cap', 'messy'][i], k: 0.3 }); }
  L.TXT('adults at a workshop', x + 1200, y + 900, 46, { f: 'KB', align: 'center' }, S.at('workshop') - 0.2, 0.5);
});
def(LONG, 'c3d2', blk(3, 5), { purpose: 'why (the researchers\' best guess): busy judging our own performance, we miss their enjoyment', shot: 'pan right; you on a tiny stage with a scorecard in your own hand, eyes down; the partner beside you smiling (missed); push on the missed smile', sfx: 'a nervous tick-tick; a warm pluck on "enjoying"' }, (S, L) => {
  const [x, y] = blk(3, 5);
  tag(L, x + 800, y + 100, "the researchers' best guess", 44, S.at('guess') - 0.4);
  const A = L.person(x + 520, y + 820, 1.7, S.at('judging') - 0.6, { pose: 'hold', you: true, kind: 'worry', look: [0, 1], hair: 'tuft', k: 0.6 });
  L.sheet(A.hand[1][0] - 20, A.hand[1][1] - 70, 120, 90, S.at('performance') - 0.4, { lines: 2 }); L.TXT('6/10', A.hand[1][0] + 40, A.hand[1][1] - 30, 30, { f: 'KB', align: 'center' }, S.at('performance') - 0.1, 0.2);
  const B2 = L.person(x + 1060, y + 820, 1.7, S.at('miss') - 0.6, { pose: 'wave', kind: 'grin', look: [-1, 0], hair: 'bun', k: 0.6 });
  L.sparks(B2.head[0], B2.head[1], B2.head[2] * 1.4, B2.head[2] * 1.9, [-2.4, -1.57, -0.7], S.at('enjoying') - 0.2, 0.15);
  L.TXT('(missed it)', x + 1060, y + 920, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('enjoying'), 0.4);
});
def(LONG, 'c3e', blk(3, 6), { purpose: 'apply it: the sender of "ok." probably thinks better of you than you assume', shot: 'pan right; the phone with "ok." on the left; on the right the sender (Sam) seen fondly thinking of you, a heart in their thought bubble; push on the heart', sfx: 'a soft buzz; a warm chord' }, (S, L) => {
  const [x, y] = blk(3, 6);
  const sc = bigPhone(L, x + 380, y + 480, 1.0, S.t0 + 0.05, { name: 'Sam' }); msg(L, sc[0] + 20, sc[1] + 200, 140, 80, 'ok.', S.at('okay') - 0.3, { size: 46 });
  const B2 = L.person(x + 1150, y + 880, 1.6, S.at('someone') - 0.5, { pose: 'hold', kind: 'content', look: [-1, -0.3], hair: 'curly', k: 0.6 });
  L.bubble(x + 960, y + 160, 400, 240, S.at('thinks') - 0.5, { thought: true, tail: [B2.head[0], B2.head[1] - B2.head[2] * 1.2] });
  heart(L, x + 1160, y + 300, S.at('better') - 0.2);
  L.TXT('on average', x + 800, y + 960, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('average') - 0.2, 0.4);
});
def(LONG, 'c3f', blk(3, 7), { purpose: 'a second gap: Liu et al. 2022, people sent a short note or small gift to someone in their circle', shot: 'pan right; the year/author tag, a note and a small gift travel along a dotted arc from sender to receiver; slow push', sfx: 'a paper flutter; a ribbon rustle' }, (S, L) => {
  const [x, y] = blk(3, 7);
  tag(L, x + 800, y + 100, '2022 · Peggy Liu & colleagues', 46, S.at('liu') - 0.5);
  const A = L.person(x + 300, y + 860, 1.5, S.at('send') - 0.6, { pose: 'point', you: true, kind: 'worry', look: [1, 0], hair: 'tuft', k: 0.5 });
  const B2 = L.person(x + 1300, y + 860, 1.5, S.at('circle') - 0.6, { pose: 'stand', kind: 'neutral', look: [-1, 0], hair: 'long', k: 0.5 });
  L.INK_(L.bez([x + 420, y + 600], [x + 600, y + 300], [x + 1000, y + 300], [x + 1180, y + 600]), { w: 3, amp: 0.5, dash: [12, 12] }, S.at('note') - 0.4, 0.4);
  envelope(L, x + 640, y + 380, 1.4, S.at('note') - 0.1); gift(L, x + 960, y + 380, 1.1, S.at('gift') - 0.2);
  L.TXT('a short note · a small gift', x + 800, y + 560, 44, { f: 'KB', align: 'center' }, S.at('gift'), 0.5);
});
def(LONG, 'c3g', blk(3, 8), { purpose: 'senders guessed appreciation; receivers reported; senders underestimated, again and again', shot: 'pan right; guess vs real meters side by side, the real one higher; repeated small tick marks for each experiment; push on the higher meter', sfx: 'pen ticks; a rising pluck' }, (S, L) => {
  const [x, y] = blk(3, 8);
  L.bars(x + 300, y + 780, 700, 560, [{ v: 0.55, label: 'senders guessed', col: L.GRYD }, { v: 0.85, label: 'how it felt', col: L.YEL }], S.at('guessed') - 0.4, { gap: 0.4 });
  for (let i = 0; i < 6; i++) L.check(x + 1150 + (i % 3) * 90, y + 360 + Math.floor(i / 3) * 110, 1.4, S.at('over') - 0.2 + i * 0.1);
  L.TXT('again and again', x + 1240, y + 640, 44, { f: 'KB', align: 'center' }, S.at('underestimated') - 0.3, 0.5);
});
def(LONG, 'c3h', blk(3, 9), { purpose: 'biggest gap when it\'s a surprise: the text out of the blue you keep not sending', shot: 'pan right; a phone with a typed, unsent message and a hovering thumb over SEND; push on the unsent message', sfx: 'a gentle surprise "ting"; a held note' }, (S, L) => {
  const [x, y] = blk(3, 9);
  L.TXT('biggest when it\'s a surprise', x + 800, y + 120, 54, { f: 'KB', align: 'center' }, S.at('surprise') - 0.4, 0.6);
  const sc = bigPhone(L, x + 800, y + 560, 1.0, S.at('blue') - 0.8, { name: 'old friend' });
  msg(L, sc[0] + sc[2] - 230, sc[1] + 200, 210, 80, 'hey! been a while', S.at('blue') - 0.3, { mine: true, size: 26 });
  L.box(sc[0] + 70, sc[1] + 340, 160, 60, S.at('sending') - 0.6, 0.2, { r: 20 }); L.TXT('SEND', sc[0] + 150, sc[1] + 382, 34, { f: 'KB', align: 'center' }, S.at('sending') - 0.5, 0.2);
  L.TXT('(still not sent)', x + 1300, y + 700, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('sending') - 0.2, 0.4);
});
def(LONG, 'c3i', blk(3, 10), { purpose: 'put it together: text hides tone → brain fills it with fears → fears run darker than the truth', shot: 'pan right; a three-step chain of boxes connected by arrows, each lit in turn; push on the last', sfx: 'three pen taps' }, (S, L) => {
  const [x, y] = blk(3, 10);
  const step = (i, s1, w) => { const bx = x + 120 + i * 480; L.box(bx, y + 300, 420, 260, S.at(w) - 0.5, 0.25, { r: 22, tint: i === 2 ? 'rgba(255,205,40,0.35)' : null }); L.TXT(s1, bx + 210, y + 450, 40, { f: 'KB', align: 'center' }, S.at(w) - 0.3, 0.5); if (i) L.inkArrow([[bx - 50, y + 430], [bx - 10, y + 430]], { w: 4 }, S.at(w) - 0.5, 0.1); };
  step(0, 'text hides tone', 'hides'); step(1, 'brain adds your fears', 'fears'); step(2, 'fears run darker', 'darker');
  L.TXT('than the truth', x + 1200, y + 680, 46, { f: 'PH', align: 'center', col: L.INK2 }, S.at('truth') - 0.3, 0.4);
});
def(LONG, 'c3j', blk(3, 11), { purpose: 'honest caveat: averages; sometimes it IS upset; confidence ≠ evidence', shot: 'pan right; a crowd dot grid with a few marked "really upset"; then "confidence ≠ evidence" written large; push on the ≠', sfx: 'pen; a firm tap on "evidence"' }, (S, L) => {
  const [x, y] = blk(3, 11);
  tag(L, x + 420, y + 120, 'an honest caveat', 50, S.at('caveat') - 0.3);
  crowd(L, x + 160, y + 260, 30, 6, 90, S.at('averages') - 0.4, 0.02);
  L.TXT('averages', x + 380, y + 760, 46, { f: 'KB', align: 'center' }, S.at('averages'), 0.3);
  for (const i of [3, 17]) L.loop(x + 160 + (i % 6) * 90, y + 260 + Math.floor(i / 6) * 90, 40, 40, S.at('upset') - 0.2, 0.2);
  L.TXT('confidence', x + 1150, y + 380, 66, { f: 'KB', align: 'center' }, S.at('confidence') - 0.3, 0.4);
  L.TXT('=', x + 1150, y + 520, 90, { f: 'KB', align: 'center' }, S.at("isn't", 2) - 0.1, 0.2); L.INK_(L.line(x + 1180, y + 440, x + 1120, y + 530), { w: 6, amp: 0.2, passes: 1 }, S.at("isn't", 2) + 0.1, 0.08);
  L.TXT('evidence', x + 1150, y + 620, 66, { f: 'KB', align: 'center' }, S.at('evidence') - 0.3, 0.4); L.swash(x + 1000, y + 645, x + 1300, S.at('evidence') + 0.3, 0.3);
});

// ===== chapter 4: what actually helps =====
chapter(LONG, 'ch4', 4, 4, 'WHAT ACTUALLY HELPS');
def(LONG, 'c4a', blk(4, 1), { purpose: 'set-up: three things, each tied to the research', shot: 'pan right; the spinning head on the left, a 3-line notepad on the right; slow push', sfx: 'pen' }, (S, L) => {
  const [x, y] = blk(4, 1);
  const H = L.head(x + 400, y + 520, 140, S.t0 + 0.05, { you: true, kind: 'worry', look: [1, 0], k: 0.6 }); spinner(L, x + 400, y + 260, 50, S.at('spinning') - 0.3);
  notepad(L, x + 760, y + 240, 680, 420, S.at('three') - 0.5, ['1.', '2.', '3.'], { size: 50, lh: 100 });
  L.TXT('each tied to a study', x + 1100, y + 800, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('research') - 0.4, 0.5);
});
def(LONG, 'c4b', blk(4, 2), { purpose: 'idea 1: read it again in a different voice (callback to the opposite-tone senders)', shot: 'pan right; numbered "1", the recorder from ch.2 reappears small with the swap arrows (callback); slow push', sfx: 'tape clunk (callback)' }, (S, L) => {
  const [x, y] = blk(4, 2);
  numDot(L, x + 140, y + 130, 1, S.t0 + 0.1, 50); L.TXT('read it in a different voice', x + 800, y + 150, 58, { f: 'KB', align: 'center' }, S.at('different') - 0.4, 0.6);
  recorder(L, x + 500, y + 520, 1.3, S.at('remember') - 0.3);
  tag(L, x + 1050, y + 440, 'sarcastic', 40, S.at('opposite') - 0.4); L.inkArrow([[x + 1180, y + 440], [x + 1260, y + 440]], { w: 4 }, S.at('opposite') - 0.2, 0.1); tag(L, x + 1370, y + 440, 'serious', 40, S.at('opposite'), { tint: L.YEL });
  L.TXT('how a stranger might hear it', x + 800, y + 840, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('stranger') - 0.4, 0.6);
});
def(LONG, 'c4c', blk(4, 3), { purpose: 'the reader\'s version: warm voice, rushed voice at a red light; all fit → words don\'t decide', shot: 'pan right; "ok." in the middle, three heads around it saying it three ways (warm smile, driver at a traffic light, cold); push on "all fit"', sfx: 'three different plucks; a car indicator tick under the red light' }, (S, L) => {
  const [x, y] = blk(4, 3);
  L.TXT(OKP, x + 800, y + 480, 150, { f: 'KB', align: 'center' }, S.t0 + 0.05, 0.3);
  L.head(x + 300, y + 300, 100, S.at('warmest') - 0.4, { kind: 'smile', look: [1, 0.3], hair: 'curly', k: 0.5 }); L.TXT('warm', x + 300, y + 470, 44, { f: 'KB', align: 'center' }, S.at('warmest'), 0.3);
  L.head(x + 1300, y + 300, 100, S.at('rushed') - 0.4, { kind: 'neutral', look: [-1, 0.3], hair: 'curly', k: 0.5 }); L.TXT('rushed', x + 1300, y + 470, 44, { f: 'KB', align: 'center' }, S.at('rushed'), 0.3);
  const tl = L.rrect(x + 1420, y + 560, 70, 180, 14); L.FILL(tl, S.at('red') - 0.3); L.INK_(tl, { closed: true, w: 3, amp: 0.2 }, S.at('red') - 0.3, 0.1); L.MRK([L.ell(x + 1455, y + 600, 22, 22, 0, L.TAU, 16)], { col: 'rgba(220,60,60,0.7)', w: 10, edge: false }, S.at('red'), 0.1);
  L.TXT('all of them fit', x + 800, y + 760, 54, { f: 'KB', align: 'center' }, S.at('fit') - 0.3, 0.5);
  L.TXT("the words alone don't decide", x + 800, y + 880, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('alone') - 0.3, 0.6);
});
def(LONG, 'c4d', blk(4, 4), { purpose: 'not pretending: the cold version was one of several, and you picked it', shot: 'pan right; four reading cards fan out; the hand of "you" holds the cold one (contact on its edge); push on the held card', sfx: 'card fan; a soft tap' }, (S, L) => {
  const [x, y] = blk(4, 4);
  L.TXT("not pretending it's fine", x + 800, y + 130, 54, { f: 'KB', align: 'center' }, S.at('pretending') - 0.3, 0.6);
  ['warm', 'rushed', 'neutral', 'cold'].forEach((w, i) => card(L, x + 160 + i * 330, y + 260, 280, 160, S.at('several') - 0.8 + i * 0.12, { lines: [[w, 44]], tint: i === 3 ? 'rgba(255,205,40,0.3)' : null }));
  const P = L.person(x + 1100, y + 900, 1.6, S.at('picked') - 0.8, { pose: 'stand', you: true, kind: 'think', look: [0.5, -1], hair: 'tuft', k: 0.6, reach2: [x + 1150, y + 430] });
  L.TXT('...and you picked it', x + 560, y + 700, 50, { f: 'KB', align: 'center' }, S.at('picked') - 0.2, 0.5);
});
def(LONG, 'c4e', blk(4, 5), { purpose: 'idea 2: if it matters, ask ("all good?"): ten seconds vs hours; even friends misread (Illinois)', shot: 'pan right; you type "all good?" and a quick reply "yes! just busy"; a 10-second timer vs an hour clock crossed out; push on the reply', sfx: 'send whoosh; a happy reply pop' }, (S, L) => {
  const [x, y] = blk(4, 5);
  numDot(L, x + 140, y + 130, 2, S.t0 + 0.1, 50); L.TXT('if it matters, ask', x + 700, y + 150, 58, { f: 'KB', align: 'center' }, S.at('ask') - 0.4, 0.5);
  const sc = bigPhone(L, x + 500, y + 560, 0.95, S.at('quick') - 0.6);
  msg(L, sc[0] + sc[2] - 170, sc[1] + 140, 150, 64, 'all good?', S.at('good') - 0.3, { mine: true, size: 30 });
  msg(L, sc[0] + 12, sc[1] + 240, 200, 64, 'yes! just busy', S.at('seconds') - 0.2, { size: 26 });
  L.clock(x + 1000, y + 480, 70, S.at('ten') - 0.3); L.TXT('10 seconds', x + 1000, y + 600, 40, { f: 'KB', align: 'center' }, S.at('seconds'), 0.3);
  L.clock(x + 1300, y + 480, 70, S.at('hours') - 0.3); L.cross(x + 1300, y + 480, 3, S.at('hours') + 0.1); L.TXT('hours', x + 1300, y + 600, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('hours'), 0.3);
  L.TXT("asking isn't needy. it's accurate.", x + 1150, y + 820, 42, { f: 'KB', align: 'center' }, S.at('needy') - 0.3, 0.7);
});
def(LONG, 'c4f', blk(4, 6), { purpose: 'idea 3: use your voice. Kumar & Epley 2021, 200 people reconnect with an old friend by email or phone', shot: 'pan right; a person between an envelope and a phone handset, choosing; slow push', sfx: 'a phone ring (soft) on "phone"' }, (S, L) => {
  const [x, y] = blk(4, 6);
  numDot(L, x + 140, y + 130, 3, S.t0 + 0.1, 50); L.TXT('when it matters, use your voice', x + 800, y + 150, 56, { f: 'KB', align: 'center' }, S.at('voice') - 0.4, 0.6);
  tag(L, x + 800, y + 290, '2021 · Amit Kumar & Nicholas Epley · 200 people', 36, S.at('kumar') - 0.4);
  const P = L.person(x + 800, y + 900, 1.6, S.at('reconnect') - 0.6, { pose: 'shrug', you: true, kind: 'think', look: [-1, -0.2], hair: 'tuft', k: 0.6 });
  envelope(L, P.hand[0][0] - 60, P.hand[0][1] - 40, 1.4, S.at('email') - 0.2); L.TXT('email', x + 400, y + 820, 44, { f: 'KB', align: 'center' }, S.at('email'), 0.3);
  bigPhone(L, P.hand[1][0] + 60, P.hand[1][1] - 60, 0.3, S.at('phone') - 0.2); L.TXT('phone', x + 1200, y + 820, 44, { f: 'KB', align: 'center' }, S.at('phone'), 0.3);
  L.TXT('an old friend', x + 800, y + 440, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('friend') - 0.3, 0.4);
});
def(LONG, 'c4g', blk(4, 7), { purpose: 'expected awkward → chose email; callers felt a stronger bond, no more awkward', shot: 'pan right; an "awkward" meter predicted high, actual same as email; a bond meter higher for the call; push on the bond bar', sfx: 'a nervous tick, then a warm chord' }, (S, L) => {
  const [x, y] = blk(4, 7);
  L.TXT('expected: awkward', x + 420, y + 130, 50, { f: 'KB', align: 'center' }, S.at('awkward') - 0.4, 0.5);
  const H = L.head(x + 420, y + 400, 110, S.at('expected') - 0.4, { kind: 'worry', look: [0, 0], hair: 'tuft', k: 0.5, sweat: true });
  L.bars(x + 760, y + 700, 680, 460, [{ v: 0.5, label: 'email', col: L.GRYD }, { v: 0.85, label: 'phone call', col: L.YEL }], S.at('bond') - 0.4, { gap: 0.4 });
  L.TXT('bond', x + 1100, y + 180, 48, { f: 'KB', align: 'center' }, S.at('bond') - 0.2, 0.3);
  L.TXT('no more awkward', x + 420, y + 700, 50, { f: 'KB', align: 'center' }, S.at("didn't") - 0.2, 0.5); L.react({ head: [x + 420, y + 400, 110] }, S.at("didn't") + 0.2, { kind: 'smile', look: [0, 0] });
});
def(LONG, 'c4h', blk(4, 8), { purpose: 'second study: text vs audio vs video; voice → more connected; video adds little', shot: 'pan right; three panels (chat bubbles, a sound wave, a video frame) with connection bars: low, high, high; push on audio', sfx: 'type clicks, a voice murmur, a camera blip' }, (S, L) => {
  const [x, y] = blk(4, 8);
  const panel = (i, lab, w) => { const bx = x + 140 + i * 460; L.box(bx, y + 160, 400, 300, S.at(w) - 0.5, 0.25, { r: 20 }); L.TXT(lab, bx + 200, y + 530, 44, { f: 'KB', align: 'center' }, S.at(w) - 0.2, 0.3); return bx; };
  const a = panel(0, 'text', 'text'); msg(L, a + 40, y + 200, 200, 60, '', S.at('text'), { lines: 1 }); msg(L, a + 160, y + 300, 200, 60, '', S.at('text') + 0.2, { lines: 1, mine: true });
  const b = panel(1, 'audio', 'audio'); wave(L, b + 40, y + 310, 320, 50, S.at('audio') - 0.1, 0.4);
  const c = panel(2, 'video', 'video'); L.head(c + 200, y + 310, 80, S.at('video') - 0.1, { kind: 'smile', look: [0, 0], hair: 'long', k: 0.4 });
  L.MST(L.line(x + 240, y + 680, x + 380, y + 680), { w: 22, col: L.GRYD }, S.at('connected') - 0.4, 0.3);
  L.MST(L.line(x + 700, y + 680, x + 1000, y + 680), { w: 22, col: L.YEL }, S.at('connected') - 0.2, 0.3);
  L.MST(L.line(x + 1160, y + 680, x + 1480, y + 680), { w: 22, col: L.YEL }, S.at('much') - 0.3, 0.3);
  L.TXT('connection', x + 160, y + 760, 36, { f: 'PH', col: L.INK2 }, S.at('connected'), 0.3);
  L.TXT("video didn't add much more", x + 1260, y + 860, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('adding') - 0.2, 0.6);
});
def(LONG, 'c4i', blk(4, 9), { purpose: 'the voice is the missing piece; put it back', shot: 'pan right; a jigsaw with a missing piece shaped like a sound wave slots in; push as it clicks', sfx: 'a satisfying click' }, (S, L) => {
  const [x, y] = blk(4, 9);
  puzzle(L, x + 520, y + 460, 2.2, S.t0 + 0.05); puzzle(L, x + 700, y + 460, 2.2, S.t0 + 0.15);
  puzzle(L, x + 880, y + 460, 2.2, S.at('back') - 0.3, { col: 'rgba(255,205,40,0.6)' }); wave(L, x + 830, y + 460, 100, 16, S.at('back'), 0.3);
  L.TXT('the voice is the missing piece', x + 800, y + 760, 54, { f: 'KB', align: 'center' }, S.at('missing') - 0.4, 0.6);
  L.TXT('most of the guessing goes away', x + 800, y + 860, 42, { f: 'PH', align: 'center', col: L.INK2 }, S.at('guessing') - 0.3, 0.6);
});
def(LONG, 'c4j', blk(4, 10), { purpose: 'bonus for senders: add the tone yourself (warm words, "ha", an emoji)', shot: 'pan right; you type "sounds good" then add "ha, can\'t wait :)"; the bubble turns warm yellow; push on the added words', sfx: 'typing; a bright pluck on the emoji' }, (S, L) => {
  const [x, y] = blk(4, 10);
  tag(L, x + 800, y + 100, 'bonus: when you send', 50, S.at('bonus') - 0.3, { tint: L.YEL });
  const P = L.person(x + 300, y + 900, 1.6, S.at('sender') - 0.5, { pose: 'hold', you: true, kind: 'smile', look: [1, 0], hair: 'tuft', k: 0.6 }); handPhone(L, P, S.at('sender') - 0.2, 1.1);
  msg(L, x + 640, y + 280, 420, 90, 'sounds good', S.at('ways') - 0.3, { size: 40 });
  msg(L, x + 640, y + 420, 620, 90, 'sounds good, ha! can\'t wait :)', S.at('warm') - 0.4, { mine: true, size: 38 });
  L.TXT('add the tone yourself', x + 950, y + 700, 52, { f: 'KB', align: 'center' }, S.at('yourself') - 0.3, 0.5);
});
def(LONG, 'c4k', blk(4, 11), { purpose: 'safety note: not therapy; if anxious for days, talk to someone; for the everyday ok, these habits help', shot: 'pan right; a small speech bubble between two people (talking it through), then the three habits ticked; slow push', sfx: 'soft pen; three ticks' }, (S, L) => {
  const [x, y] = blk(4, 11);
  L.TXT('not therapy', x + 420, y + 140, 54, { f: 'KB', align: 'center' }, S.at('therapy') - 0.3, 0.4);
  L.person(x + 280, y + 760, 1.3, S.at('talking') - 0.6, { kind: 'worry', look: [1, 0], hair: 'tuft', k: 0.4 }); L.person(x + 560, y + 760, 1.3, S.at('talking') - 0.5, { kind: 'content', look: [-1, 0], hair: 'bun', k: 0.4, dir: -1 });
  L.bubble(x + 240, y + 300, 360, 90, S.at('talking') - 0.2, { text: 'talk it through', size: 34, tail: [x + 520, y + 500] });
  notepad(L, x + 860, y + 260, 600, 380, S.at('everyday') - 0.6, ['read it in another voice', 'ask', 'call'], { size: 40, lh: 90 });
  L.check(x + 901, y + 325, 1.3, S.at('three') - 0.1); L.check(x + 901, y + 415, 1.3, S.at('habits') - 0.1); L.check(x + 901, y + 505, 1.3, S.at('long'));
});

// ===== ending =====
def(LONG, 'end1', blk(0, 1), { purpose: 'payoff: back to the couch and the "ok." (callback); the brain had to pick a voice and picked the fear', shot: 'a long whip back up the page to the opening couch, then a slow push on the phone; the cold "ok." is ringed', sfx: 'long paper whoosh; the phone buzz returns', noAutoCam: true }, (S, L) => {
  const B = blk(0, 1), [x, y] = B, c = S.fit(B);
  S.cam(S.t0 - 0.2, (x + 800 + blk(4, 11)[0] + 800) / 2, (y + 450 + 4 * GY + 450) / 2, 0.14, 1.1, 'io');
  S.cam(S.t0 + 0.9, c.x, c.y, c.z, 1.2, 'io');
  S.cam(S.at('afraid') - 1.5, x + 1000, y + 500, c.z * 1.25, Math.max(1, S.end - S.at('afraid') + 1.5), 'sin');
  L.TXT('it had to pick a voice', x + 400, y + 140, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('pick') - 0.3, 0.5);
  L.TXT('...it picked your fear', x + 1000, y + 900, 46, { f: 'KB', align: 'center' }, S.at('afraid') - 0.4, 0.5);
});
def(LONG, 'end2', blk(0, 6), { purpose: 'the line to remember: that voice is often wrong, predictably; they probably like you more, and were just busy', shot: 'whip right along the top row; Sam drawn at a busy desk mid-task, typing "ok." one-handed while holding a coffee; push on Sam\'s smile', sfx: 'whoosh; office bustle; a warm final pluck', ease: 'q' }, (S, L) => {
  const [x, y] = blk(0, 6);
  L.TXT('often wrong,', x + 500, y + 140, 56, { f: 'KB', align: 'center' }, S.at('wrong') - 0.3, 0.4); L.TXT('in a predictable direction', x + 1100, y + 140, 50, { f: 'KB', align: 'center' }, S.at('predictable') - 0.3, 0.6);
  desk(L, x + 500, y + 660, 700, S.at('person') - 0.8, { h: 880 - 660 }); laptop(L, x + 1000, y + 660, 1.0, S.at('person') - 0.6);
  const P = L.person(x + 720, y + 880, 1.6, S.at('person') - 1.0, { pose: 'sit', kind: 'content', look: [1, 0.3], hair: 'curly', k: 0.6 });
  L.cup(P.hand[1][0] + 10, P.hand[1][1] - 20, 0.6, S.at('sent') - 0.2);
  L.TXT('Sam', x + 720, y + 940, 36, { f: 'PH', align: 'center', col: L.INK2 }, S.at('sent'), 0.2);
  heart(L, x + 720, y + 360, S.at('likes') - 0.1);
  for (let i = 0; i < 4; i++) envelope(L, x + 1250 + (i % 2) * 40, y + 620 - i * 40, 0.9, S.at('busy') - 0.6 + i * 0.06);
  L.TXT('...just busy', x + 1300, y + 400, 50, { f: 'KB', align: 'center' }, S.at('busy') - 0.2, 0.4);
});
def(LONG, 'end3', blk(0, 7), { purpose: 'one specific comment question + one subscribe line', shot: 'pan right; the question card fills the frame', sfx: 'pen; a kalimba on "subscribe"' }, (S, L) => {
  const [x, y] = blk(0, 7);
  L.bubble(x + 160, y + 120, 1280, 330, S.t0 + 0.2, { tint: 'rgba(255,205,40,0.25)', tail: [x + 400, y + 560] });
  L.TXT("What's the shortest text that ever", x + 800, y + 250, 58, { f: 'KB', align: 'center' }, S.at('shortest') - 0.6, 0.9);
  L.TXT('sent your brain into a spiral?', x + 800, y + 350, 58, { f: 'KB', align: 'center' }, S.at('spiral') - 0.6, 0.8);
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
def(SHORT, 's1', sblk(0), { purpose: 'hook in the first second (EXP-overthinkingpad-001 TREATMENT: your-moment-first): the "ok." already on the phone, re-read marks piling up', shot: 'opens close on the phone screen with "ok." from frame 0, pulls back to you holding it, tally marks of re-reads (reveal: it is you)', sfx: 'phone buzz on frame 0; a pen tick per re-read', noAutoCam: true }, (S, L) => {
  const B = sblk(0), [x, y] = B, c = S.fit(B);
  S.cam(S.t0, x + 450, y + 360, c.z * 1.9, 0.01); S.cam(S.at('fourteen') - 0.3, c.x, c.y, c.z * 1.03, 1.4, 'io');
  const sc = bigPhone(L, x + 450, y + 360, 0.9, S.t0 - 1.0);
  msg(L, sc[0] + 16, sc[1] + 170, 130, 76, 'ok.', S.t0 - 0.3, { size: 46 });
  buzz(L, x + 450, y + 360, 150, S.t0 + 0.02);
  const P = L.person(x + 450, y + 1000, 1.3, S.at('read') - 0.4, { pose: 'hold', you: true, kind: 'worry', look: [0, -1], hair: 'tuft', k: 0.5 });
  for (let i = 0; i < 14; i++) { const gx = x + 90 + (i % 5) * 26 + Math.floor(i / 5) * 0, gy = y + 700 + Math.floor(i / 5) * 70; if (i % 5 === 4) L.INK_(L.line(gx - 110, gy + 40, gx + 6, gy - 6), { w: 3, amp: 0.2, passes: 1 }, S.at('times') - 0.6 + i * 0.05, 0.04); else L.INK_(L.line(gx, gy - 10, gx, gy + 40), { w: 3, amp: 0.2, passes: 1 }, S.at('fourteen') - 0.5 + i * 0.05, 0.04); }
  L.TXT('x14', x + 160, y + 940, 50, { f: 'KB', align: 'center' }, S.at('times'), 0.3);
  L.TXT('colder', x + 740, y + 760, 50, { f: 'KB', align: 'center' }, S.at('colder') - 0.3, 0.3);
});
def(SHORT, 's2', sblk(1), { purpose: 'the study: sarcastic vs serious sentences; half voice, half typed', shot: 'pan right; the card at the top, split: speaker + recorder vs typist + laptop', sfx: 'tape clunk; keyboard clicks' }, (S, L) => {
  const [x, y] = sblk(1);
  L.TXT('psychologists tested this', x + 450, y + 100, 52, { f: 'KB', align: 'center' }, S.at('tested') - 0.4, 0.5);
  tag(L, x + 260, y + 240, 'sarcastic', 44, S.at('sarcastic') - 0.3); tag(L, x + 640, y + 240, 'serious', 44, S.at('serious') - 0.3);
  const A = L.person(x + 230, y + 760, 1.2, S.at('voice') - 0.5, { pose: 'hold', kind: 'grin', look: [1, 0.3], hair: 'long', k: 0.4 }); recorder(L, A.hand[1][0] + 70, A.hand[1][1] - 10, 0.6, S.at('voice') - 0.2);
  L.TXT('VOICE', x + 250, y + 860, 50, { f: 'KB', align: 'center' }, S.at('voice'), 0.3);
  desk(L, x + 520, y + 640, 320, S.at('typed') - 0.5, { h: 120 }); L.person(x + 600, y + 760, 1.1, S.at('typed') - 0.6, { pose: 'sit', kind: 'think', look: [1, 0.4], hair: 'tuft', k: 0.4 }); laptop(L, x + 760, y + 640, 0.7, S.at('typed') - 0.2);
  L.TXT('TYPED', x + 680, y + 860, 50, { f: 'KB', align: 'center' }, S.at('typed'), 0.3);
});
def(SHORT, 's3', sblk(2), { purpose: 'result: listeners ~3 in 4; readers a coin flip; readers just as sure', shot: 'pan right; ears with ticks, then a coin lands on 50%, then a grinning confident reader; push on the coin', sfx: 'ticks; coin clink; cheerful pluck' }, (S, L) => {
  const [x, y] = sblk(2);
  for (let i = 0; i < 4; i++) { ear(L, x + 180 + i * 180, y + 200, 1.0, S.at('listeners') - 0.3 + i * 0.08); if (i < 3) L.check(x + 200 + i * 180, y + 300, 1.4, S.at('four') - 0.3 + i * 0.08); else L.cross(x + 200 + i * 180, y + 300, 1.2, S.at('four')); }
  L.TXT('≈ 3 in 4', x + 450, y + 420, 60, { f: 'KB', align: 'center' }, S.at('right') - 0.3, 0.3);
  coin(L, x + 300, y + 640, 110, S.at('coin') - 0.3); L.TXT('readers: a coin flip', x + 450, y + 830, 50, { f: 'KB', align: 'center' }, S.at('flip') - 0.2, 0.5);
  const P = L.person(x + 680, y + 760, 0.9, S.at('sure') - 0.6, { pose: 'arms_up', kind: 'grin', look: [-1, 0], hair: 'cap', k: 0.4 });
  L.TXT('...and just as sure', x + 450, y + 960, 48, { f: 'PH', align: 'center', col: L.INK2 }, S.at('sure') - 0.2, 0.4);
});
def(SHORT, 's4', sblk(3), { purpose: 'friends no better than strangers; text has no voice, so your brain supplies one: the one you fear', shot: 'pan right; friends = strangers; then a flat line becomes a dark wave from your own head; push on the head', sfx: 'a sting; a low note on "afraid"' }, (S, L) => {
  const [x, y] = sblk(3);
  L.person(x + 250, y + 420, 1.0, S.at('friends') - 0.4, { kind: 'shock', look: [1, 0], hair: 'curly', k: 0.4 }); L.TXT('=', x + 450, y + 330, 100, { f: 'KB', align: 'center' }, S.at('accurate') - 0.2, 0.2); L.person(x + 650, y + 420, 1.0, S.at('strangers') - 0.4, { kind: 'neutral', look: [-1, 0], hair: 'cap', k: 0.4 });
  L.TXT('friends = strangers', x + 450, y + 120, 54, { f: 'KB', align: 'center' }, S.at('strangers') - 0.1, 0.4);
  flatline(L, x + 120, y + 560, 300, S.at('voice') - 0.4, 0.3); L.TXT('no voice', x + 270, y + 630, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('voice'), 0.3);
  const H = L.head(x + 640, y + 800, 120, S.at('supplies') - 0.5, { you: true, kind: 'worry', look: [-1, -0.5], k: 0.5 });
  wave(L, x + 120, y + 800, 360, 40, S.at('supplies') - 0.1, 0.5, { col: L.GRYD });
  L.TXT("the one you're afraid of", x + 450, y + 1010, 48, { f: 'KB', align: 'center' }, S.at('afraid') - 0.4, 0.5);
});
def(SHORT, 's5', sblk(4), { purpose: 'what to do: read it in the warmest voice, or ask, or call', shot: 'pan right; three stacked cards drawn one by one, each with its doodle (smile, "all good?", handset)', sfx: 'three pen taps' }, (S, L) => {
  const [x, y] = sblk(4);
  card(L, x + 100, y + 120, 700, 220, S.at('warmest') - 0.8, { lines: [['read it in the warmest voice', 38]], tint: 'rgba(255,205,40,0.3)' });
  card(L, x + 100, y + 420, 700, 220, S.at('ask') - 0.4, { lines: [['or ask: "all good?"', 42]] });
  card(L, x + 100, y + 720, 700, 220, S.at('call') - 0.4, { lines: [['or call', 46]] });
});
def(SHORT, 's6', sblk(5), { purpose: 'loop back to the hook: that "ok." probably meant... ok', shot: 'pan right; the same phone and "ok." from frame 0, now ringed in friendly yellow; push on it', sfx: 'the buzz again (loop); a warm pluck' }, (S, L) => {
  const [x, y] = sblk(5);
  const sc = bigPhone(L, x + 450, y + 480, 1.0, S.t0 + 0.05); msg(L, sc[0] + 20, sc[1] + 190, 140, 80, 'ok.', S.at('okay') - 0.3, { size: 46 });
  L.loop(sc[0] + 90, sc[1] + 230, 110, 70, S.at('meant') - 0.2, 0.4);
  L.TXT('it probably meant...', x + 450, y + 900, 50, { f: 'PH', align: 'center', col: L.INK2 }, S.at('probably') - 0.2, 0.5);
  L.TXT('ok', x + 450, y + 1030, 80, { f: 'KB', align: 'center' }, S.at('okay', 2) - 0.1, 0.3);
});
def(SHORT, 's7', sblk(6), { purpose: 'one comment question', shot: 'pan right; hold on the question bubble', sfx: 'pen; closing kalimba' }, (S, L) => {
  const [x, y] = sblk(6);
  L.head(x + 450, y + 230, 90, S.t0 + 0.05, { you: true, kind: 'think', look: [0, 0.3], hair: 'tuft', k: 0.5 });
  L.bubble(x + 60, y + 400, 780, 300, S.t0 + 0.2, { tint: 'rgba(255,205,40,0.25)', tail: [x + 450, y + 330] });
  L.TXT('the shortest text that', x + 450, y + 520, 50, { f: 'KB', align: 'center' }, S.at('shortest') - 0.3, 0.5);
  L.TXT('sent you spiraling?', x + 450, y + 610, 54, { f: 'KB', align: 'center' }, S.at('spiraling') - 0.4, 0.5);
  L.TXT('tell me below', x + 450, y + 900, 46, { f: 'PH', align: 'center', col: L.INK2 }, S.at('spiraling') + 0.3, 0.5);
});

export default { long: { scenes: LONG }, short: { scenes: SHORT } };
