// The Overthinking Pad, episode 2026-11-26: "Impostor Syndrome: Why Capable People Feel Like Frauds" (impostor feelings).
// Storyboard + drawings per scene (purpose, shot, sfx per scene). Row 0 = cold open (payoff first, then the good-news letter and
// the quiet voice on the shoulder; the ending whips back to it), rows 1-5 = chapters 1-5.
// Recurring objects: the smiling mask held over a worried face, the good-news letter with a gold star, the small grey "quiet voice"
// on the shoulder, the impostor cycle wheel, inside-vs-outside (scribbled head vs polished cardboard cut-outs), the doctor + patient.
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


// ---------- this episode's parts (2026-11-26, impostor feelings) ----------
function star(L, cx, cy, r, t0, o = {}) {   // a five-point star, yellow
  const P = []; for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; P.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
  L.FILL(P, t0); L.MRK([P], { col: o.col || L.YEL, w: 12 }, t0 + 0.05, 0.08); L.INK_(P, { closed: true, w: 2.8, amp: 0.3, passes: 1 }, t0, 0.12);
  return t0 + 0.2;
}
// the smiling mask on a stick, held in front of the face (contact: the stick ends in the hand)
function mask(L, cx, cy, s, t0, o = {}) {
  const m = L.ell(cx, cy, 62 * s, 74 * s, 0, L.TAU, 40);
  L.FILL(m, t0); L.MRK([m], { col: o.tint || 'rgba(255,205,40,0.35)', w: 14 }, t0 + 0.06, 0.08); L.INK_(m, { closed: true, w: 3, amp: 0.3 }, t0, 0.14);
  for (const d of [-1, 1]) { const e = L.ell(cx + d * 22 * s, cy - 14 * s, 12 * s, 7 * s, 0, L.TAU, 14); L.MRK([e], { col: L.INKM(0.85), w: 6, edge: false, op: 'source-over' }, t0 + 0.12, 0.03); }
  L.INK_(L.quad([cx - 30 * s, cy + 22 * s], [cx, cy + 50 * s], [cx + 30 * s, cy + 22 * s]), { w: 3.4, amp: 0.2, passes: 1 }, t0 + 0.15, 0.06);
  if (o.stick) L.INK_(L.line(cx + 10 * s, cy + 74 * s, o.stick[0], o.stick[1]), { w: 4, amp: 0.2, passes: 1 }, t0 + 0.05, 0.06);
  return t0 + 0.24;
}
// the good-news letter: an open envelope with a card and a gold star
function letter(L, cx, cy, s, t0, o = {}) {
  const card0 = [[cx - 70 * s, cy - 110 * s], [cx + 70 * s, cy - 110 * s], [cx + 70 * s, cy + 10 * s], [cx - 70 * s, cy + 10 * s]];
  L.FILL(card0, t0); L.INK_(card0, { closed: true, w: 2.6, amp: 0.3, passes: 1 }, t0, 0.1);
  star(L, cx, cy - 66 * s, 26 * s, t0 + 0.1);
  for (let i = 0; i < 2; i++) L.INK_(L.line(cx - 50 * s, cy - 24 * s + i * 16 * s, cx + 50 * s - i * 30 * s, cy - 24 * s + i * 16 * s), { w: 1.8, amp: 0.4, passes: 1, alpha: 0.7 }, t0 + 0.16, 0.04);
  const b = L.rrect(cx - 90 * s, cy - 20 * s, 180 * s, 110 * s, 6); L.FILL(b, t0 + 0.2); L.MRK([b], { col: L.GRY2, w: 10 }, t0 + 0.22, 0.05); L.INK_(b, { closed: true, w: 2.8, amp: 0.3 }, t0 + 0.2, 0.1);
  L.INK_([[cx - 90 * s, cy - 20 * s], [cx, cy + 40 * s], [cx + 90 * s, cy - 20 * s]], { w: 2.4, amp: 0.2, passes: 1 }, t0 + 0.26, 0.06);
  if (o.text) L.TXT(o.text, cx, cy + 150 * s, 34 * s, { f: 'KB', align: 'center' }, t0 + 0.3, 0.3);
  return t0 + 0.34;
}
// the quiet voice: a small grey scribble figure on the shoulder, with a small speech bubble
function whisper(L, x, y, s, t0, text, o = {}) {
  const h = L.ell(x, y, 22 * s, 24 * s, 0, L.TAU, 24); L.FILL(h, t0); L.MRK([h], { col: L.GRYD, w: 10 }, t0 + 0.04, 0.05); L.INK_(h, { closed: true, w: 2.4, amp: 0.4, passes: 1 }, t0, 0.06);
  const bd = L.bez([x - 16 * s, y + 20 * s], [x - 20 * s, y + 60 * s], [x + 20 * s, y + 60 * s], [x + 16 * s, y + 20 * s]); L.FILL(bd, t0 + 0.05); L.MRK([bd], { col: L.GRYD, w: 10 }, t0 + 0.08, 0.05); L.INK_(bd, { w: 2.4, amp: 0.4, passes: 1 }, t0 + 0.05, 0.06);
  L.INK_(L.line(x - 8 * s, y - 4 * s, x - 4 * s, y - 2 * s), { w: 2, amp: 0.1, passes: 1 }, t0 + 0.1, 0.02); L.INK_(L.line(x + 4 * s, y - 2 * s, x + 8 * s, y - 4 * s), { w: 2, amp: 0.1, passes: 1 }, t0 + 0.1, 0.02);
  if (text) L.bubble(x + (o.bx ?? 40) * s, y - (o.by ?? 150) * s, (o.bw || 300) * s, 70 * s, t0 + 0.2, { text, size: (o.size || 30) * s, tail: [x + 10 * s, y - 26 * s], shadow: false, tint: 'rgba(150,150,150,0.18)' });
  return t0 + 0.4;
}
function trophy(L, cx, y, s, t0) {   // y = base
  const cup0 = L.bez([cx - 60 * s, y - 200 * s], [cx - 60 * s, y - 110 * s], [cx - 20 * s, y - 90 * s], [cx, y - 90 * s]).concat(L.bez([cx, y - 90 * s], [cx + 20 * s, y - 90 * s], [cx + 60 * s, y - 110 * s], [cx + 60 * s, y - 200 * s]));
  L.FILL(cup0, t0); L.MRK([cup0], { col: L.YEL, w: 14 }, t0 + 0.06, 0.08); L.INK_(cup0, { closed: true, w: 3, amp: 0.3 }, t0, 0.14);
  for (const d of [-1, 1]) L.INK_(L.quad([cx + d * 60 * s, y - 185 * s], [cx + d * 100 * s, y - 170 * s], [cx + d * 55 * s, y - 130 * s]), { w: 3, amp: 0.2, passes: 1 }, t0 + 0.12, 0.05);
  L.INK_(L.line(cx, y - 90 * s, cx, y - 40 * s), { w: 4, amp: 0.1, passes: 1 }, t0 + 0.16, 0.04);
  const base = L.rrect(cx - 50 * s, y - 40 * s, 100 * s, 40 * s, 6); L.FILL(base, t0 + 0.18); L.MRK([base], { col: L.GRY2, w: 10 }, t0 + 0.2, 0.05); L.INK_(base, { closed: true, w: 2.8, amp: 0.2, passes: 1 }, t0 + 0.18, 0.06);
  return t0 + 0.26;
}
function scroll(L, cx, cy, s, t0) {   // a rolled diploma with a ribbon
  const b = L.rrect(cx - 90 * s, cy - 18 * s, 180 * s, 36 * s, 18 * s); L.FILL(b, t0); L.INK_(b, { closed: true, w: 2.8, amp: 0.3 }, t0, 0.1);
  L.INK_(L.ell(cx - 90 * s, cy, 8 * s, 18 * s, 0, L.TAU, 14), { closed: true, w: 2, amp: 0.1, passes: 1 }, t0 + 0.08, 0.03);
  L.MST(L.line(cx - 10 * s, cy - 20 * s, cx - 10 * s, cy + 20 * s), { w: 12 * s, col: L.YELD }, t0 + 0.12, 0.06);
  L.INK_([[cx - 10 * s, cy + 18 * s], [cx - 26 * s, cy + 50 * s]], { w: 2.6, amp: 0.2, passes: 1 }, t0 + 0.16, 0.04); L.INK_([[cx - 10 * s, cy + 18 * s], [cx + 8 * s, cy + 50 * s]], { w: 2.6, amp: 0.2, passes: 1 }, t0 + 0.18, 0.04);
  return t0 + 0.22;
}
// a clipboard questionnaire with n numbered rows of 1-5 answer dots
function clipboard(L, x, y, w, h, n, t0, o = {}) {
  const p = L.rrect(x, y, w, h, 12); L.FILL(p, t0); L.MRK([p], { col: L.GRY2, w: 12 }, t0 + 0.06, 0.06); L.dropShadow(p, 8, 9, t0 + 0.1, 0.06); L.INK_(p, { closed: true, w: 3, amp: 0.4 }, t0, 0.14);
  const cl = L.rrect(x + w / 2 - 60, y - 18, 120, 40, 8); L.FILL(cl, t0 + 0.1); L.MRK([cl], { col: L.GRYD, w: 10 }, t0 + 0.12, 0.04); L.INK_(cl, { closed: true, w: 2.6, amp: 0.2, passes: 1 }, t0 + 0.1, 0.05);
  const pp = L.rrect(x + 24, y + 40, w - 48, h - 64, 4); L.FILL(pp, t0 + 0.14); L.INK_(pp, { closed: true, w: 2, amp: 0.2, passes: 1 }, t0 + 0.14, 0.06);
  const lh = (h - 100) / n; let t = t0 + 0.2;
  for (let i = 0; i < n; i++) { const yy = y + 70 + i * lh; L.INK_(L.line(x + 44, yy, x + w * 0.5, yy), { w: 1.6, amp: 0.4, passes: 1, alpha: 0.7 }, t, 0.03); for (let q = 0; q < 5; q++) { const c = L.ell(x + w * 0.58 + q * (w * 0.32 / 4), yy, 6, 6, 0, L.TAU, 10); L.INK_(c, { closed: true, w: 1.6, amp: 0.1, passes: 1 }, t + 0.01, 0.02); if (q === ((i * 3 + 1) % 5) && o.filled) L.MRK([c], { col: L.INKM(0.85), w: 5, edge: false, op: 'source-over' }, t + 0.02, 0.02); } t += o.dt ?? 0.03; }
  return t;
}
// a horizontal 0-100% ruler; returns xAt(v)
function ruler(L, x, y, w, t0, o = {}) {
  L.INK_(L.line(x, y, x + w, y), { w: 3.4, amp: 0.4 }, t0, 0.16);
  for (let i = 0; i <= 10; i++) L.INK_(L.line(x + w * i / 10, y - (i % 5 ? 12 : 22), x + w * i / 10, y + (i % 5 ? 12 : 22)), { w: 2.2, amp: 0.1, passes: 1 }, t0 + 0.1 + i * 0.02, 0.02);
  L.TXT('0%', x, y + 70, o.ls || 36, { f: 'PH', align: 'center', col: L.INK2 }, t0 + 0.3, 0.2); L.TXT('100%', x + w, y + 70, o.ls || 36, { f: 'PH', align: 'center', col: L.INK2 }, t0 + 0.3, 0.2);
  return v => x + w * v / 100;
}
// a polished cardboard cut-out (the "outside" everyone shows): big smile, on a little stand
function cutout(L, cx, y, s, t0, o = {}) {
  const P = L.person(cx, y - 30 * s, s, t0, { pose: o.pose || 'stand', kind: 'grin', look: o.look || [0, 0.2], hair: o.hair || 'cap', k: 0.4 });
  L.INK_(L.line(cx - 50 * s, y, cx + 50 * s, y), { w: 3, amp: 0.2, passes: 1 }, t0 + 0.2, 0.04); L.INK_(L.line(cx, y - 30 * s, cx + 30 * s, y), { w: 2.4, amp: 0.2, passes: 1 }, t0 + 0.22, 0.04);
  L.sparks(cx, y - 168 * s, 50 * s, 70 * s, [-2.6, -0.5], t0 + 0.4, 0.08);
  return P;
}
// scribbles inside a head (the messy "inside")
function scribble(L, cx, cy, r, t0, d = 0.6) { const P = []; for (let i = 0; i <= 90; i++) { const u = i / 90, a = u * 23; P.push([cx + Math.cos(a) * r * (0.3 + 0.6 * Math.abs(Math.sin(u * 7))), cy + Math.sin(a * 1.3) * r * 0.55]); } return L.MST(P, { w: 3, col: L.GRYD, amp: 1.2 }, t0, d); }
// a stethoscope on a person's chest (doctor), drawn from the neck
function stetho(L, P, t0) { const [hx, hy, r] = P.head, ny = hy + r * 1.1; L.INK_(L.bez([hx - r * 0.5, ny], [hx - r * 0.6, ny + r * 1.4], [hx + r * 0.6, ny + r * 1.4], [hx + r * 0.5, ny]), { w: 3, amp: 0.2, passes: 1 }, t0, 0.08); const c = L.ell(hx + r * 0.3, ny + r * 1.55, r * 0.18, r * 0.18, 0, L.TAU, 14); L.FILL(c, t0 + 0.08); L.MRK([c], { col: L.GRY2, w: 6 }, t0 + 0.1, 0.03); L.INK_(c, { closed: true, w: 2.4, amp: 0.1, passes: 1 }, t0 + 0.08, 0.03); return t0 + 0.14; }
// the impostor cycle: a ring of arrows with stations at angles; returns pos(a)
function ring(L, cx, cy, r, t0, d = 1.0) {
  for (let i = 0; i < 4; i++) { const a0 = -Math.PI / 2 + i * Math.PI / 2 + 0.25, a1 = a0 + Math.PI / 2 - 0.5; const P = L.ell(cx, cy, r, r * 0.8, a0, a1, 24); L.inkArrow(P, { w: 4 }, t0 + i * d / 4, d / 4); }
  return a => [cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.8];
}
function nod(L, cx, cy, s, t0) { for (let i = 0; i < 2; i++) L.INK_(L.quad([cx + 30 * s + i * 14 * s, cy - 20 * s], [cx + 44 * s + i * 14 * s, cy], [cx + 30 * s + i * 14 * s, cy + 20 * s]), { w: 2.6, amp: 0.2, passes: 1 }, t0 + i * 0.06, 0.05); return t0 + 0.16; }
function gaze(L, a, b, t0) { return L.INK_(L.line(a[0], a[1], b[0], b[1]), { w: 2.4, amp: 0.4, passes: 1, dash: [10, 10], alpha: 0.7 }, t0, 0.2); }
function hourglass(L, cx, cy, s, t0) { const P = [[cx - 40 * s, cy - 60 * s], [cx + 40 * s, cy - 60 * s], [cx + 6 * s, cy], [cx + 40 * s, cy + 60 * s], [cx - 40 * s, cy + 60 * s], [cx - 6 * s, cy]]; L.FILL(P, t0); L.INK_(P, { closed: true, w: 3, amp: 0.3 }, t0, 0.12); L.MRK([[[cx - 30 * s, cy + 56 * s], [cx + 30 * s, cy + 56 * s], [cx, cy + 20 * s]]], { col: L.YELD, w: 8, edge: false }, t0 + 0.1, 0.06); L.INK_(L.line(cx - 52 * s, cy - 62 * s, cx + 52 * s, cy - 62 * s), { w: 4, amp: 0.1, passes: 1 }, t0 + 0.14, 0.03); L.INK_(L.line(cx - 52 * s, cy + 62 * s, cx + 52 * s, cy + 62 * s), { w: 4, amp: 0.1, passes: 1 }, t0 + 0.16, 0.03); return t0 + 0.2; }

const LONG = {};
const def = (F, id, block, o, draw) => { F[id] = { block, ...o, draw }; };
const chapter = (F, id, row, n, title) => {
  const big = title.length > 22, w = Math.max(560, title.length * (big ? 36 : 44)), B = [-200, row * GY + 180, Math.max(1400, 480 + w + 120), 560];
  def(F, id, B, { purpose: `chapter ${n} title`, shot: 'whip across the page to the numbered banner (a jump in thought)', sfx: 'paper whoosh, kalimba note', ease: 'q', move: 0.75 }, (S, L) => {
    const [x, y] = B;
    numDot(L, x + 180, y + 280, n, S.t0 + 0.25, 64);
    L.ribbon(x + 400 + w / 2, y + 280, w, 120, title, big ? 56 : 70, S.t0 + 0.45, { d: 0.3, td: 0.9 });
  });
};

// ===== cold open (EXP-overthinkingpad-002 TREATMENT #1: payoff first, then the scene) =====
def(LONG, 'hook1', blk(0, 1), { purpose: 'payoff first: the feeling named, then what the research says (common; men and women; rated better with others)', shot: 'opens close on the worried face behind the smiling mask from frame 0; pull back as the three findings are written beside it (the reveal: a whole crowd behind masks)', sfx: 'a soft paper flick on frame 0; three pen taps on the findings', noAutoCam: true }, (S, L) => {
  const B = blk(0, 1), [x, y] = B, c = S.fit(B);
  S.cam(S.t0 - 0.01, x + 330, y + 470, 1.6, 0.01); S.cam(S.at('research') - 0.4, c.x, c.y, c.z * 1.02, 1.6, 'io');
  const P = L.person(x + 330, y + 860, 2.1, S.t0 - 1.4, { pose: 'hold', you: true, kind: 'worry', look: [0.6, -0.2], hair: 'tuft', k: 0.6 });
  const [hx, hy, r] = P.head;
  mask(L, hx + r * 0.55, hy + r * 0.1, 1.15, S.t0 - 0.6, { stick: P.hand[1] });
  L.bubble(x + 40, y + 60, 560, 90, S.at('fraud') - 0.3, { text: 'they\'ll find out...', size: 40, thought: true, tail: [hx - 10, hy - r * 1.3] });
  card(L, x + 760, y + 150, 760, 150, S.at('common') - 0.4, { lines: [['common', 56]] });
  card(L, x + 760, y + 350, 760, 150, S.at('men') - 0.4, { lines: [['men + women, teens to seniors', 40]] });
  card(L, x + 760, y + 550, 760, 170, S.at('rated') - 0.4, { lines: [['rated BETTER with others', 46]], tint: 'rgba(255,205,40,0.35)' });
  L.TXT('(one 2022 study)', x + 1140, y + 790, 34, { f: 'PH', align: 'center', col: L.INK2 }, S.at('worse') - 0.3, 0.4);
});
def(LONG, 'hook2', blk(0, 2), { purpose: 'the scene: good news arrives, one second of joy, then the quiet voice on the shoulder', shot: 'pan right; the letter is opened in the hands, a smile; the grey voice appears on the shoulder and the face falls; slow push on the face', sfx: 'envelope tear; a bright pluck on "happy"; a low note when the voice speaks' }, (S, L) => {
  const [x, y] = blk(0, 2);
  const P = L.person(x + 620, y + 880, 2.0, S.at('picture') - 0.3, { pose: 'hold', you: true, kind: 'smile', look: [0.3, 0.4], hair: 'tuft', k: 0.6 });
  letter(L, P.hand[1][0] + 20, P.hand[1][1] - 40, 1.0, S.at('news') - 0.3);
  L.TXT('promotion', x + 1160, y + 180, 44, { f: 'KB', align: 'center' }, S.at('promotion') - 0.2, 0.3);
  L.TXT('acceptance letter', x + 1240, y + 270, 44, { f: 'KB', align: 'center' }, S.at('acceptance') - 0.2, 0.4);
  L.TXT('"great job"', x + 1180, y + 360, 44, { f: 'KB', align: 'center' }, S.at('compliment') - 0.2, 0.3);
  L.react(P, S.at('happy') - 0.2, { kind: 'grin', look: [0.3, 0.3] });
  const [hx, hy, r] = P.head;
  whisper(L, hx + r * 1.7, hy + r * 1.1, 1.5, S.at('quiet') - 0.4, null);
  L.bubble(x + 960, y + 470, 560, 90, S.at('mistake') - 0.4, { text: 'they made a mistake', size: 38, tail: [hx + r * 1.9, hy + r * 0.6], shadow: false, tint: 'rgba(150,150,150,0.18)' });
  L.bubble(x + 1000, y + 590, 460, 80, S.at('lucky') - 0.3, { text: 'you just got lucky', size: 34, tail: [hx + r * 1.9, hy + r * 0.7], shadow: false, tint: 'rgba(150,150,150,0.18)' });
  L.react(P, S.at('mistake'), { kind: 'worry', look: [1, 0.2] });
  L.TXT('wait until they see the real you', x + 900, y + 780, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('real') - 0.4, 0.6);
});
def(LONG, 'hook3', blk(0, 3), { purpose: 'the promise: four questions, ticked off as the episode will answer them', shot: 'pan right; a notepad with four questions written one by one; slow push', sfx: 'pen; four ticks' }, (S, L) => {
  const [x, y] = blk(0, 3);
  notepad(L, x + 260, y + 100, 1080, 720, S.t0, ['where the voice comes from', "why success doesn't help", 'is "70%" real?', 'what you can do'], { it: [S.at('voice') - 0.3, S.at('success') - 0.3, S.at('seventy') - 0.3, S.at('actually') - 0.3], size: 52, lh: 140 });
  whisper(L, x + 1240, y + 640, 1.6, S.at('voice') + 0.3, null);
  L.TXT('70%', x + 1180, y + 420, 80, { f: 'KB', align: 'center' }, S.at('number') - 0.2, 0.3); L.qmark(x + 1300, y + 430, 90, S.at('real'));
});
def(LONG, 'sting', blk(0, 4, 1300, 600), { purpose: 'channel sting (≤ 2 s, after the hook)', shot: 'whip right across empty dots to the banner', sfx: 'paper whoosh + one kalimba note', ease: 'q', move: 0.6 }, (S, L) => {
  const [x, y] = blk(0, 4, 1300, 600);
  L.ribbon(x + 650, y + 280, 860, 120, 'THE OVERTHINKING PAD', 64, S.t0 + 0.2, { d: 0.35, td: 0.9 });
  L.MST(L.bez([x + 520, y + 420], [x + 600, y + 520], [x + 740, y + 380], [x + 800, y + 470]), { w: 4, col: L.INK, amp: 1 }, S.t0 + 1.2, 0.4);
});

// ===== chapter 1: where the name came from =====
chapter(LONG, 'ch1', 1, 1, 'WHERE THE NAME CAME FROM');
def(LONG, 'c1a', blk(1, 1), { purpose: 'who, when, where: Clance & Imes, Georgia State, 1978', shot: 'pan right from the banner; the year tag, then two name cards and a small office door with the university sign; slow push', sfx: 'pen; a door click' }, (S, L) => {
  const [x, y] = blk(1, 1);
  tag(L, x + 800, y + 110, '1978', 72, S.at('seventy') - 0.4, { tint: L.YEL });
  L.door(x + 160, y + 300, 220, 420, S.at('georgia') - 0.6);
  L.TXT('Georgia State University', x + 270, y + 800, 38, { f: 'PH', align: 'center', col: L.INK2 }, S.at('university') - 0.3, 0.5);
  card(L, x + 560, y + 260, 460, 150, S.at('clance') - 0.4, { lines: [['Pauline Clance', 44]] });
  card(L, x + 1080, y + 260, 460, 150, S.at('imes') - 0.4, { lines: [['Suzanne Imes', 44]] });
  sheet(L, x + 820, y + 500, 260, 320, S.at('paper') - 0.4, { lines: 7 });
  L.bubble(x + 1130, y + 560, 380, 110, S.at('hearing') - 0.4, { text: '"I fooled them"', size: 40 });
});
function sheet(L, x, y, w, h, t0, o) { return L.sheet(x, y, w, h, t0, o); }
def(LONG, 'c1b', blk(1, 2), { purpose: 'the people: 150+ highly successful women with degrees, honors, respected jobs', shot: 'pan right; a row of women doodles appears with their achievements (scroll, trophy, star) above them; push on the row', sfx: 'a soft pluck per achievement' }, (S, L) => {
  const [x, y] = blk(1, 2);
  L.TXT('150+ highly successful women', x + 800, y + 110, 60, { f: 'KB', align: 'center' }, S.at('hundred') - 0.4, 0.6);
  const hairs = ['long', 'bun', 'curly', 'long', 'bun'];
  for (let i = 0; i < 5; i++) L.person(x + 240 + i * 280, y + 860, 1.25, S.at('women') - 0.6 + i * 0.12, { kind: 'smile', look: [0, 0], hair: hairs[i], k: 0.4 });
  scroll(L, x + 240, y + 420, 1.0, S.at('degrees') - 0.3);
  star(L, x + 520, y + 420, 50, S.at('honors') - 0.2);
  trophy(L, x + 800, y + 480, 0.9, S.at('honors') + 0.1);
  L.INK_(L.rrect(x + 1010, y + 380, 140, 100, 10), { closed: true, w: 3, amp: 0.3 }, S.at('jobs') - 0.3, 0.12); L.TXT('JOB', x + 1080, y + 445, 40, { f: 'KB', align: 'center' }, S.at('jobs') - 0.1, 0.2);
  L.TXT('"great!"', x + 1360, y + 440, 46, { f: 'KB', align: 'center' }, S.at('praise') - 0.2, 0.3);
});
def(LONG, 'c1c', blk(1, 3), { purpose: 'what they said: not bright, fooled everyone; success = mistake, luck, overestimated, anything but ability', shot: 'pan right; one woman lifts the smiling mask to her face; around her, three labels point at the trophy; ABILITY is written and crossed out; push on the cross-out', sfx: 'pen; a hard scratch on the cross-out' }, (S, L) => {
  const [x, y] = blk(1, 3);
  const P = L.person(x + 380, y + 860, 1.9, S.t0 - 0.2, { pose: 'hold', kind: 'worry', look: [1, -0.2], hair: 'long', k: 0.5 });
  const [hx, hy, r] = P.head; mask(L, hx + r * 0.5, hy + r * 0.1, 1.05, S.at('fooled') - 0.5, { stick: P.hand[1] });
  L.TXT('"not really bright"', x + 1000, y + 140, 46, { f: 'KB', align: 'center' }, S.at('bright') - 0.4, 0.5);
  trophy(L, x + 1050, y + 640, 1.1, S.at('success') - 0.4);
  L.TXT('a mistake', x + 760, y + 360, 42, { f: 'KB', align: 'center' }, S.at('mistake') - 0.2, 0.3); L.inkArrow([[x + 800, y + 390], [x + 990, y + 470]], { w: 3 }, S.at('mistake'), 0.15);
  L.TXT('luck', x + 1380, y + 340, 46, { f: 'KB', align: 'center' }, S.at('luck') - 0.2, 0.2); L.inkArrow([[x + 1350, y + 370], [x + 1120, y + 470]], { w: 3 }, S.at('luck'), 0.15);
  L.TXT('they overrate me', x + 1320, y + 760, 40, { f: 'KB', align: 'center' }, S.at('overestimating') - 0.4, 0.4);
  L.TXT('ABILITY', x + 1050, y + 870, 56, { f: 'KB', align: 'center' }, S.at('anything') - 0.3, 0.3); L.INK_(L.line(x + 930, y + 850, x + 1170, y + 840), { w: 6, amp: 0.4, passes: 1 }, S.at('ability') - 0.05, 0.15);
});
def(LONG, 'c1d', blk(1, 4), { purpose: 'the name: impostor phenomenon; not a syndrome, not a disorder, an experience', shot: 'pan right; the name is lettered big, then SYNDROME and DISORDER are written and struck out, EXPERIENCE ringed in yellow; push on the ring', sfx: 'pen; two scratches; a warm pluck on "experience"' }, (S, L) => {
  const [x, y] = blk(1, 4);
  L.TXT('the impostor phenomenon', x + 800, y + 220, 84, { f: 'KB', align: 'center' }, S.at('impostor') - 0.4, 0.8);
  L.swash(x + 420, y + 250, x + 1180, S.at('notice') - 0.2, 0.3);
  L.TXT('syndrome', x + 420, y + 480, 54, { f: 'PH', align: 'center' }, S.at('syndrome') - 0.3, 0.3); L.cross(x + 420, y + 465, 3.4, S.at('syndrome') + 0.1);
  L.TXT('disorder', x + 1180, y + 480, 54, { f: 'PH', align: 'center' }, S.at('disorder') - 0.3, 0.3); L.cross(x + 1180, y + 465, 3.4, S.at('disorder') + 0.1);
  L.TXT('an experience', x + 800, y + 720, 70, { f: 'KB', align: 'center' }, S.at('experience') - 0.4, 0.4); L.loop(x + 800, y + 700, 300, 80, S.at('lots') - 0.2, 0.4);
  for (let i = 0; i < 6; i++) L.head(x + 260 + i * 216, y + 880, 34, S.at('people') - 0.3 + i * 0.05, { kind: 'neutral', look: [0, -1], hair: ['tuft', 'long', 'cap', 'curly', 'bun', 'messy'][i], k: 0.3 });
});
def(LONG, 'c1e', blk(1, 5), { purpose: 'still true: not a recognized psychiatric diagnosis (not in the DSM); a pattern, not an illness', shot: 'pan right; a thick manual drawn closed, a magnifier searches its index and finds nothing; a "thoughts + feelings" thought cloud beside it', sfx: 'page flips; a small "nope" pluck' }, (S, L) => {
  const [x, y] = blk(1, 5);
  const bk = L.rrect(x + 200, y + 220, 420, 540, 16); L.FILL(bk, S.at('recognized') - 0.6); L.MRK([bk], { col: L.GRY, w: 16 }, S.at('recognized') - 0.5, 0.1); L.INK_(bk, { closed: true, w: 3.4, amp: 0.4 }, S.at('recognized') - 0.6, 0.2);
  L.TXT('DIAGNOSTIC', x + 410, y + 420, 46, { f: 'KB', align: 'center' }, S.at('manual') - 0.4, 0.3); L.TXT('MANUAL', x + 410, y + 490, 46, { f: 'KB', align: 'center' }, S.at('manual') - 0.2, 0.3);
  L.INK_(L.ell(x + 560, y + 660, 110, 110, 0, L.TAU, 40), { closed: true, w: 6, amp: 0.4 }, S.at('find') - 0.3, 0.2); L.INK_(L.line(x + 640, y + 740, x + 720, y + 820), { w: 12, amp: 0.2, passes: 1 }, S.at('find') - 0.1, 0.1);
  L.TXT('not in it', x + 410, y + 860, 46, { f: 'KB', align: 'center' }, S.at('use') - 0.2, 0.3);
  cloud(L, x + 1170, y + 420, 560, 260, S.at('pattern') - 0.5, { tint: 'rgba(255,205,40,0.25)' });
  L.TXT('thoughts + feelings', x + 1170, y + 435, 46, { f: 'KB', align: 'center' }, S.at('thoughts') - 0.3, 0.5);
  L.TXT('not an illness', x + 1170, y + 720, 50, { f: 'KB', align: 'center' }, S.at('illness') - 0.4, 0.4);
});
def(LONG, 'c1e2', blk(1, 6), { purpose: 'how it is measured: the 20-item Clance Impostor Phenomenon Scale; statistics come from scale scores', shot: 'pan right; a clipboard questionnaire with twenty rows fills in row by row; a score arrow points to a big number; push on the score', sfx: 'pen ticks running down the page' }, (S, L) => {
  const [x, y] = blk(1, 6);
  clipboard(L, x + 200, y + 100, 560, 760, 20, S.at('twenty') - 0.5, { filled: true, dt: 0.07 });
  L.TXT('20 items', x + 480, y + 70, 44, { f: 'KB', align: 'center' }, S.at('item') - 0.2, 0.3);
  L.TXT('Clance Impostor', x + 1180, y + 220, 52, { f: 'KB', align: 'center' }, S.at('scale') - 0.8, 0.5); L.TXT('Phenomenon Scale', x + 1180, y + 300, 52, { f: 'KB', align: 'center' }, S.at('scale') - 0.4, 0.5);
  L.TXT('the most used tool', x + 1180, y + 420, 42, { f: 'PH', align: 'center', col: L.INK2 }, S.at('used') - 0.2, 0.4);
  L.fatArrow(x + 820, y + 640, x + 1000, S.at('statistic') - 0.4);
  tag(L, x + 1200, y + 640, 'a score', 60, S.at('score') - 0.4, { tint: L.YEL });
});
def(LONG, 'c1f', blk(1, 7), { purpose: 'honesty: the 1978 paper was clinical observation, not a controlled experiment; a starting point; real test = measuring', shot: 'pan right; a notebook of session notes vs an empty lab beaker with a dashed outline; a START flag; push on the flag', sfx: 'pen; a flag flap' }, (S, L) => {
  const [x, y] = blk(1, 7);
  sheet(L, x + 180, y + 160, 380, 480, S.at('clinical') - 0.6, { lines: 9 });
  L.TXT('observations', x + 370, y + 720, 46, { f: 'KB', align: 'center' }, S.at('observations') - 0.3, 0.4);
  lab(L, x + 900, y + 400, 2.4, S.at('controlled') - 0.4); L.cross(x + 900, y + 400, 4.0, S.at('experiment') - 0.1);
  L.TXT('not an experiment', x + 900, y + 620, 44, { f: 'KB', align: 'center' }, S.at('experiment') - 0.1, 0.4);
  L.INK_(L.line(x + 1300, y + 800, x + 1300, y + 300), { w: 4, amp: 0.2, passes: 1 }, S.at('starting') - 0.4, 0.1);
  const fl = [[x + 1300, y + 300], [x + 1470, y + 350], [x + 1300, y + 400]]; L.FILL(fl, S.at('starting') - 0.3); L.MRK([fl], { col: L.YEL, w: 12 }, S.at('starting') - 0.25, 0.06); L.INK_(fl, { closed: true, w: 3, amp: 0.2 }, S.at('starting') - 0.3, 0.1);
  L.TXT('START', x + 1300, y + 860, 46, { f: 'KB', align: 'center' }, S.at('point') - 0.2, 0.3);
  L.TXT('then: measure it', x + 900, y + 860, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('measuring') - 0.4, 0.4);
});
def(LONG, 'c1g', blk(1, 8, 1300, 800), { purpose: 'bridge: the first big surprise was who has it', shot: 'pan right; a big question mark over a row of very different silhouettes; hold', sfx: 'a rising pluck' }, (S, L) => {
  const [x, y] = blk(1, 8, 1300, 800);
  L.qmark(x + 650, y + 280, 260, S.t0 + 0.1);
  const hs = ['cap', 'long', 'tuft', 'bun', 'messy']; for (let i = 0; i < 5; i++) L.person(x + 170 + i * 240, y + 760, 0.9 + (i % 2) * 0.25, S.at('who') - 0.5 + i * 0.06, { kind: 'neutral', look: [0, -1], hair: hs[i], k: 0.3 });
  L.TXT('who has it?', x + 650, y + 470, 56, { f: 'KB', align: 'center' }, S.at('who') - 0.2, 0.4);
});

// ===== chapter 2: who feels like a fraud =====
chapter(LONG, 'ch2', 2, 2, 'WHO FEELS LIKE A FRAUD');
def(LONG, 'c2a', blk(2, 1), { purpose: 'Bravata et al. 2020 systematic review: 62 studies, 14,000+ people', shot: 'pan right; the year tag and name card, then 62 small paper sheets stack into a pile and a crowd of tiny heads fills in; push on the crowd', sfx: 'a fast riffle of paper; a soft crowd hum' }, (S, L) => {
  const [x, y] = blk(2, 1);
  tag(L, x + 300, y + 100, '2020', 70, S.at('twenty') - 0.4, { tint: L.YEL });
  card(L, x + 520, y + 40, 620, 130, S.at('bravata') - 0.4, { lines: [['Dena Bravata · Stanford', 44]] });
  L.TXT('systematic review', x + 1350, y + 120, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('review') - 0.3, 0.4);
  for (let i = 0; i < 12; i++) L.sheet(x + 160 + (i % 6) * 70, y + 300 + Math.floor(i / 6) * 40 - (i % 6) * 6, 120, 150, S.at('sixty') - 0.6 + i * 0.05, { lines: 3 });
  L.TXT('62 studies', x + 380, y + 640, 64, { f: 'KB', align: 'center' }, S.at('studies') - 0.2, 0.3);
  crowd(L, x + 840, y + 300, 60, 10, 62, S.at('fourteen') - 0.8, 0.02);
  L.TXT('14,161 people', x + 1120, y + 780, 64, { f: 'KB', align: 'center' }, S.at('people') - 0.3, 0.3);
});
def(LONG, 'c2b', blk(2, 2), { purpose: 'men and women: Clance saw it in men too; studies split ~half women higher, half no difference', shot: 'pan right; a man and a woman each lift the same smiling mask; below, a split tally 16 | 17; push on the tally', sfx: 'pen; two tally scratches' }, (S, L) => {
  const [x, y] = blk(2, 2);
  const A = L.person(x + 330, y + 700, 1.6, S.at('men') - 0.5, { pose: 'hold', kind: 'worry', look: [1, 0], hair: 'cap', k: 0.5 });
  const B2 = L.person(x + 760, y + 700, 1.6, S.at('women') - 0.5, { pose: 'hold', kind: 'worry', look: [-1, 0], hair: 'long', k: 0.5 });
  mask(L, A.head[0] + A.head[2] * 0.5, A.head[1] + A.head[2] * 0.1, 0.85, S.at('men', 2) - 0.2, { stick: A.hand[1] });
  mask(L, B2.head[0] - B2.head[2] * 0.5, B2.head[1] + B2.head[2] * 0.1, 0.85, S.at('women', 2) - 0.2, { stick: B2.hand[1] });
  L.TXT('both', x + 545, y + 120, 64, { f: 'KB', align: 'center' }, S.at('both') - 0.2, 0.3);
  L.bubble(x + 960, y + 120, 560, 140, S.at('certainly') - 0.5, { text: '"seen it in men too"', size: 40 });
  L.TXT('Clance', x + 1240, y + 310, 34, { f: 'PH', align: 'center', col: L.INK2 }, S.at('certainly'), 0.2);
  L.box(x + 960, y + 420, 560, 360, S.at('review') - 0.3, 0.3, { r: 20 });
  L.TXT('women higher', x + 1100, y + 520, 38, { f: 'KB', align: 'center' }, S.at('reported') - 0.3, 0.4); L.TXT('16', x + 1100, y + 640, 80, { f: 'KB', align: 'center' }, S.at('more') - 0.1, 0.2);
  L.INK_(L.line(x + 1240, y + 450, x + 1240, y + 750), { w: 3, amp: 0.4, passes: 1 }, S.at('about') - 0.2, 0.1);
  L.TXT('no difference', x + 1385, y + 520, 38, { f: 'KB', align: 'center' }, S.at('difference') - 0.4, 0.4); L.TXT('17', x + 1385, y + 640, 80, { f: 'KB', align: 'center' }, S.at('difference') - 0.1, 0.2);
  L.TXT('(of 33 studies that compared)', x + 1240, y + 840, 32, { f: 'PH', align: 'center', col: L.INK2 }, S.at('all') - 0.1, 0.4);
});
def(LONG, 'c2c', blk(2, 3), { purpose: 'across ages and jobs; especially high in ethnic minority groups in several studies; experience alone does not switch it off', shot: 'pan right; a timeline from a school backpack kid to a grey-haired professional, job badges popping above it; a light switch drawn that stays ON; push on the switch', sfx: 'a pluck per badge; a switch click that fails' }, (S, L) => {
  const [x, y] = blk(2, 3);
  L.inkArrow([[x + 120, y + 560], [x + 1480, y + 560]], { w: 4 }, S.at('ages') - 0.4, 0.4);
  L.person(x + 220, y + 540, 0.9, S.at('teenagers') - 0.4, { kind: 'worry', look: [1, 0], hair: 'messy', k: 0.3 }); L.TXT('teens', x + 220, y + 610, 34, { f: 'PH', align: 'center', col: L.INK2 }, S.at('school'), 0.2);
  L.person(x + 1380, y + 540, 1.2, S.at('careers') - 0.5, { kind: 'worry', look: [-1, 0], hair: 'bun', k: 0.3 }); L.TXT('late career', x + 1380, y + 610, 34, { f: 'PH', align: 'center', col: L.INK2 }, S.at('careers'), 0.3);
  const jobs = [['nursing students', 'nursing'], ['doctors', 'doctors'], ['teachers', 'teachers'], ['managers', 'managers'], ['accountants', 'accountants']];
  jobs.forEach(([t, w], i) => tag(L, x + 300 + i * 250, y + 180 + (i % 2) * 110, t, 30, S.at(w) - 0.3, {}));
  L.TXT('especially high in several', x + 560, y + 720, 38, { f: 'PH', align: 'center', col: L.INK2 }, S.at('especially') - 0.3, 0.4); L.TXT('ethnic minority groups', x + 560, y + 780, 44, { f: 'KB', align: 'center' }, S.at('ethnic') - 0.2, 0.4);
  const sw = L.rrect(x + 1180, y + 680, 120, 180, 14); L.FILL(sw, S.at('experience') - 0.5); L.INK_(sw, { closed: true, w: 3, amp: 0.3 }, S.at('experience') - 0.5, 0.1);
  L.MST(L.line(x + 1240, y + 730, x + 1240, y + 770), { w: 22, col: L.YELD }, S.at('switch') - 0.3, 0.1); L.TXT('ON', x + 1240, y + 830, 34, { f: 'KB', align: 'center' }, S.at('off') - 0.2, 0.2);
});
def(LONG, 'c2d', blk(2, 4), { purpose: 'the famous number: "70% of people" everywhere (articles, talks, posters)', shot: 'pan right; a poster, a newspaper and a stage talk all show 70%; push on the poster', sfx: 'three paper slaps' }, (S, L) => {
  const [x, y] = blk(2, 4);
  L.TXT('70%', x + 800, y + 200, 160, { f: 'KB', align: 'center' }, S.at('seventy') - 0.3, 0.3);
  L.TXT('"will feel like an impostor"', x + 800, y + 330, 46, { f: 'PH', align: 'center', col: L.INK2 }, S.at('impostor') - 0.3, 0.5);
  sheet(L, x + 180, y + 450, 300, 360, S.at('articles') - 0.4, { lines: 6 }); L.TXT('70%', x + 330, y + 540, 60, { f: 'KB', align: 'center' }, S.at('articles') - 0.1, 0.2);
  L.stage(x + 620, y + 760, 380, S.at('talks') - 0.5, { rows: 1, per: 4 }); L.TXT('70%', x + 810, y + 620, 60, { f: 'KB', align: 'center' }, S.at('talks') - 0.1, 0.2);
  const po = [[x + 1140, y + 430], [x + 1440, y + 450], [x + 1430, y + 820], [x + 1130, y + 800]]; L.FILL(po, S.at('posters') - 0.4); L.MRK([po], { col: 'rgba(255,205,40,0.35)', w: 14 }, S.at('posters') - 0.3, 0.06); L.INK_(po, { closed: true, w: 3, amp: 0.3 }, S.at('posters') - 0.4, 0.12);
  L.TXT('70%!', x + 1285, y + 660, 80, { f: 'KB', align: 'center' }, S.at('posters') - 0.1, 0.2);
});
def(LONG, 'c2e', blk(2, 5), { purpose: 'the reveal: no single number; 9% to 82% depending on the study', shot: 'pan right; a 0-100% ruler is drawn; markers drop at 9 and 82 and a yellow band stretches between them; push on the band', sfx: 'pen; a stretching marker squeak' }, (S, L) => {
  const [x, y] = blk(2, 5);
  L.TXT('one number?', x + 800, y + 140, 60, { f: 'KB', align: 'center' }, S.at('number') - 0.3, 0.3); L.cross(x + 1040, y + 120, 2.4, S.at('number') + 0.2);
  const X = ruler(L, x + 160, y + 520, 1280, S.at('depending') - 0.6);
  L.MST(L.line(X(9), y + 520, X(82), y + 520), { w: 34, col: L.YEL }, S.at('eighty') - 0.2, 0.6);
  L.inkArrow([[X(9), y + 380], [X(9), y + 490]], { w: 4 }, S.at('nine') - 0.2, 0.15); L.TXT('9%', X(9), y + 350, 70, { f: 'KB', align: 'center' }, S.at('nine') - 0.1, 0.2);
  L.inkArrow([[X(82), y + 380], [X(82), y + 490]], { w: 4 }, S.at('eighty') - 0.2, 0.15); L.TXT('82%', X(82), y + 350, 70, { f: 'KB', align: 'center' }, S.at('two') - 0.1, 0.2);
  L.TXT('depending on the study', x + 800, y + 760, 46, { f: 'PH', align: 'center', col: L.INK2 }, S.at('study') - 0.2, 0.4);
});
def(LONG, 'c2f', blk(2, 6), { purpose: 'why so wide: questionnaires and cutoffs; move the line, the number moves', shot: 'pan right; a row of 20 little heads; a dashed cutoff line slides left and the count of yellow heads above it grows; push on the count', sfx: 'a slide whoosh; a counter tick' }, (S, L) => {
  const [x, y] = blk(2, 6);
  L.TXT('who counts?', x + 800, y + 110, 60, { f: 'KB', align: 'center' }, S.at('counts') - 0.3, 0.3);
  const sc = [3, 9, 5, 14, 7, 11, 2, 16, 8, 12, 6, 15, 10, 4, 13, 17, 1, 18, 19, 20];
  for (let i = 0; i < 20; i++) { const cx = x + 140 + i * 66, cy = y + 620 - sc[i] * 16, c = L.ell(cx, cy, 22, 24, 0, L.TAU, 18); L.FILL(c, S.at('questionnaires') - 0.6 + i * 0.03); L.INK_(c, { closed: true, w: 2.2, amp: 0.2, passes: 1 }, S.at('questionnaires') - 0.6 + i * 0.03, 0.04); if (sc[i] > 14) L.MRK([c], { col: L.YEL, w: 10, edge: false }, S.at('cutoffs') + 0.1, 0.05); if (sc[i] > 7 && sc[i] <= 14) L.MRK([c], { col: L.YEL, w: 10, edge: false }, S.at('moves') - 0.1, 0.05); }
  L.INK_(L.line(x + 110, y + 620 - 14.5 * 16, x + 1490, y + 620 - 14.5 * 16), { w: 3, amp: 0.4, passes: 1, dash: [14, 10] }, S.at('cutoffs') - 0.2, 0.2); L.TXT('5 of 20', x + 1560, y + 620 - 14.5 * 16 + 14, 36, { f: 'KB', align: 'right' }, S.at('cutoffs') + 0.2, 0.2);
  L.INK_(L.line(x + 110, y + 620 - 7.5 * 16, x + 1490, y + 620 - 7.5 * 16), { w: 3, amp: 0.4, passes: 1, dash: [14, 10] }, S.at('line') - 0.2, 0.2); L.TXT('12 of 20', x + 1560, y + 620 - 7.5 * 16 + 14, 36, { f: 'KB', align: 'right' }, S.at('moves') - 0.1, 0.2);
  L.TXT('move the line → the number moves', x + 800, y + 820, 46, { f: 'KB', align: 'center' }, S.at('number') - 0.3, 0.6);
});
def(LONG, 'c2f2', blk(2, 7), { purpose: 'balance: even 9% is a lot of people; the exact number is softer than posters suggest', shot: 'pan right; a grid of 100 tiny heads with 9 in yellow; the 70% poster drawn soft and wobbly (dashed); push on the 9', sfx: 'nine soft taps' }, (S, L) => {
  const [x, y] = blk(2, 7);
  for (let i = 0; i < 100; i++) { const cx = x + 180 + (i % 10) * 56, cy = y + 190 + Math.floor(i / 10) * 56, c = L.ell(cx, cy, 18, 19, 0, L.TAU, 14), t = S.at('rare') - 0.6 + i * 0.008; L.FILL(c, t); L.INK_(c, { closed: true, w: 1.6, amp: 0.2, passes: 1 }, t, 0.03); if ([3, 17, 26, 38, 44, 59, 63, 78, 91].includes(i)) L.MRK([c], { col: L.YELD, w: 10, edge: false }, S.at('nine') + (i % 9) * 0.05, 0.04); }
  L.TXT('9 in 100 = a lot of people', x + 460, y + 820, 44, { f: 'KB', align: 'center' }, S.at('lot') - 0.3, 0.5);
  const po = [[x + 1000, y + 250], [x + 1400, y + 270], [x + 1390, y + 680], [x + 990, y + 660]]; L.INK_(po, { closed: true, w: 3, amp: 1.4, dash: [12, 10] }, S.at('softer') - 0.5, 0.3);
  L.TXT('70%', x + 1195, y + 500, 110, { f: 'KB', align: 'center', col: L.INK2 }, S.at('softer') - 0.3, 0.3); L.TXT('softer than it looks', x + 1195, y + 760, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('posters') - 0.3, 0.4);
});
def(LONG, 'c2g', blk(2, 8), { purpose: 'where 70% comes from: a 2007 newspaper article quoting a researcher; original study hard to find; rough guess, not fact', shot: 'pan right; a newspaper with 2007 and 70% in the headline; a dotted arrow back to a box with a question mark (the missing study); ROUGH GUESS stamp; push on the stamp', sfx: 'newspaper rustle; a stamp thump' }, (S, L) => {
  const [x, y] = blk(2, 8);
  const np = [[x + 160, y + 160], [x + 720, y + 160], [x + 720, y + 760], [x + 160, y + 760]]; L.FILL(np, S.at('traced') - 0.6); L.dropShadow(np, 8, 9, S.at('traced') - 0.4, 0.06); L.INK_(np, { closed: true, w: 3, amp: 0.4 }, S.at('traced') - 0.6, 0.16);
  L.TXT('2007', x + 300, y + 240, 52, { f: 'KB', align: 'center' }, S.at('seven') - 0.2, 0.2); L.TXT('"70% of people..."', x + 440, y + 340, 48, { f: 'KB', align: 'center' }, S.at('newspaper') - 0.2, 0.4);
  for (let i = 0; i < 6; i++) L.INK_(L.line(x + 200, y + 420 + i * 50, x + 680 - (i % 3) * 40, y + 420 + i * 50), { w: 1.8, amp: 0.4, passes: 1, alpha: 0.7 }, S.at('quoting') - 0.2 + i * 0.04, 0.05);
  L.INK_(L.quad([x + 740, y + 400], [x + 900, y + 300], [x + 1060, y + 400]), { w: 3, amp: 0.4, passes: 1, dash: [10, 10] }, S.at('original') - 0.4, 0.3);
  const bx = L.rrect(x + 1060, y + 320, 300, 260, 14); L.INK_(bx, { closed: true, w: 3, amp: 1, dash: [14, 10] }, S.at('original') - 0.2, 0.2); L.qmark(x + 1210, y + 500, 150, S.at('hard') - 0.2);
  L.TXT('original study?', x + 1210, y + 640, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('find') - 0.2, 0.4);
  stamp(L, x + 1000, y + 820, 'ROUGH GUESS', 56, S.at('rough') - 0.2);
});
def(LONG, 'c2h', blk(2, 9), { purpose: 'what is clear: often alongside anxiety and depression; linked to burnout, lower job satisfaction; it weighs on people', shot: 'pan right; the masked figure carries a backpack that fills with labelled weights; push on the bent posture', sfx: 'three heavy thuds, low' }, (S, L) => {
  const [x, y] = blk(2, 9);
  L.TXT('what the review shows', x + 800, y + 100, 52, { f: 'KB', align: 'center' }, S.at('clearly') - 0.3, 0.5);
  const P = L.person(x + 460, y + 860, 1.9, S.at('impostor') - 0.5, { pose: 'walk', kind: 'sad', look: [1, 0.5], hair: 'tuft', k: 0.5 });
  const [hx, hy, r] = P.head; const pk = L.rrect(hx - r * 2.4, hy + r * 1.3, r * 1.6, r * 2.2, 14); L.FILL(pk, S.at('alongside') - 0.4); L.MRK([pk], { col: L.GRY, w: 14 }, S.at('alongside') - 0.3, 0.08); L.INK_(pk, { closed: true, w: 3, amp: 0.4 }, S.at('alongside') - 0.4, 0.14);
  tag(L, x + 1050, y + 260, 'anxiety', 44, S.at('anxiety') - 0.3, {}); tag(L, x + 1300, y + 360, 'depression', 44, S.at('depression') - 0.3, {});
  tag(L, x + 1040, y + 480, 'burnout', 44, S.at('burnout') - 0.3, {}); tag(L, x + 1260, y + 590, 'lower job satisfaction', 36, S.at('satisfaction') - 0.4, {});
  L.TXT('(often found together)', x + 1170, y + 700, 34, { f: 'PH', align: 'center', col: L.INK2 }, S.at('linked') - 0.2, 0.4);
  L.TXT('not just a quirk', x + 1170, y + 830, 50, { f: 'KB', align: 'center' }, S.at('quirk') - 0.4, 0.4);
});
def(LONG, 'c2i', blk(2, 10, 1300, 800), { purpose: 'the question into chapter 3: they succeed, so why does success not convince them?', shot: 'pan right; a trophy with an arrow to a head that bounces off; a question mark; hold', sfx: 'a little bounce boing' }, (S, L) => {
  const [x, y] = blk(2, 10, 1300, 800);
  trophy(L, x + 300, y + 560, 1.4, S.at('succeeding') - 0.5);
  const H = L.head(x + 950, y + 420, 110, S.at('succeeding'), { you: true, kind: 'worry', look: [-1, 0], k: 0.5 });
  L.inkArrow([[x + 420, y + 380], [x + 780, y + 380]], { w: 4 }, S.at('success') - 0.3, 0.25); L.INK_(L.quad([x + 790, y + 380], [x + 700, y + 250], [x + 600, y + 300]), { w: 3, amp: 0.4, passes: 1, dash: [10, 8] }, S.at('convince') - 0.3, 0.2);
  L.TXT("why doesn't it convince?", x + 650, y + 720, 52, { f: 'KB', align: 'center' }, S.at('convince') - 0.2, 0.5);
});

// ===== chapter 3: why success doesn't help =====
chapter(LONG, 'ch3', 3, 3, "WHY SUCCESS DOESN'T HELP");
def(LONG, 'c3a', blk(3, 1), { purpose: 'Clance later described the impostor cycle (1985); set up the wheel', shot: 'pan right; an empty ring of four arrows is drawn round the page centre; push in as it closes', sfx: 'a long circular pen stroke' }, (S, L) => {
  const [x, y] = blk(3, 1);
  ring(L, x + 800, y + 470, 420, S.at('cycle') - 0.8, 1.2);
  L.TXT('the impostor cycle', x + 800, y + 490, 70, { f: 'KB', align: 'center' }, S.at('cycle') - 0.2, 0.6);
  L.TXT('Clance, 1985', x + 800, y + 590, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('described') - 0.2, 0.4);
});
def(LONG, 'c3b', blk(3, 2), { purpose: 'station 1: the task (presentation, exam, project) and a wave of doubt', shot: 'pan right; three task objects appear (screen, exam sheet, folder), the masked character in front of them, a wave of doubt drawn over the head; push on the wave', sfx: 'a pluck per task; a low swell on "doubt"' }, (S, L) => {
  const [x, y] = blk(3, 2);
  numDot(L, x + 120, y + 100, 1, S.at('task') - 0.4, 44);
  L.TXT('the task', x + 330, y + 120, 56, { f: 'KB', align: 'center' }, S.at('task') - 0.2, 0.3);
  screen(L, x + 160, y + 260, 320, 200, S.at('presentation') - 0.4);
  L.sheet(x + 640, y + 250, 220, 280, S.at('exam') - 0.3, { lines: 6 }); L.TXT('EXAM', x + 750, y + 590, 36, { f: 'KB', align: 'center' }, S.at('exam'), 0.2);
  const fo = L.rrect(x + 1000, y + 300, 260, 190, 10); L.FILL(fo, S.at('project') - 0.3); L.MRK([fo], { col: L.GRY2, w: 12 }, S.at('project') - 0.25, 0.06); L.INK_(fo, { closed: true, w: 3, amp: 0.3 }, S.at('project') - 0.3, 0.12);
  const P = L.person(x + 1380, y + 880, 1.4, S.at('wave') - 0.6, { kind: 'worry', look: [-1, -0.3], hair: 'tuft', you: true, k: 0.4 });
  const [hx, hy, r] = P.head; wave(L, hx - 200, hy - r * 2.2, 400, 30, S.at('doubt') - 0.3, 0.5, { col: L.GRYD });
  L.TXT('"what if they find out?"', x + 760, y + 760, 46, { f: 'PH', align: 'center', col: L.INK2 }, S.at('find') - 0.4, 0.6);
});
def(LONG, 'c3c', blk(3, 3), { purpose: 'path A: over-preparing (three times harder, checking again and again)', shot: 'pan right; the road forks; on the left path a desk with a towering stack and the character re-checking with a magnifier, ×3 tag; push on the stack', sfx: 'a page riffle, repeated' }, (S, L) => {
  const [x, y] = blk(3, 3);
  L.INK_(L.line(x + 100, y + 160, x + 500, y + 160), { w: 4, amp: 0.4 }, S.at('ways') - 0.6, 0.15); L.inkArrow([[x + 500, y + 160], [x + 760, y + 300]], { w: 4 }, S.at('ways') - 0.4, 0.2); L.INK_(L.line(x + 500, y + 160, x + 1500, y + 160), { w: 3, amp: 0.4, passes: 1, dash: [12, 10], alpha: 0.5 }, S.at('ways') - 0.3, 0.2);
  L.TXT('A: over-prepare', x + 900, y + 330, 56, { f: 'KB', align: 'center' }, S.at('prepare') - 0.3, 0.4);
  desk(L, x + 300, y + 700, 760, S.at('work') - 0.6, { h: 880 - 700 });
  for (let i = 0; i < 10; i++) L.sheet(x + 420 + (i % 2) * 6, y + 680 - i * 28, 220, 30, S.at('harder') - 0.6 + i * 0.05, { lines: 0 });
  const P = L.person(x + 860, y + 880, 1.5, S.at('work') - 0.5, { pose: 'sit', kind: 'worry', look: [-1, 0.3], hair: 'tuft', you: true, dir: -1, k: 0.4 });
  tag(L, x + 1300, y + 460, '× 3', 70, S.at('three') - 0.2, { tint: L.YEL });
  L.TXT('check... check... check', x + 1260, y + 640, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('checking') - 0.3, 0.6);
});
def(LONG, 'c3d', blk(3, 4), { purpose: 'path B: putting it off, then rushing at the last minute', shot: 'pan right; the character on a couch beside an hourglass, then a sprint with motion lines toward a clock at 11:59; push on the clock', sfx: 'a lazy pluck; a ticking clock speeds up; a whoosh' }, (S, L) => {
  const [x, y] = blk(3, 4);
  L.TXT('B: put it off', x + 500, y + 120, 56, { f: 'KB', align: 'center' }, S.at('off') - 0.3, 0.4);
  couch(L, x + 160, y + 760, 520, S.t0 - 0.3);
  L.person(x + 420, y + 760, 1.5, S.t0 - 0.1, { pose: 'sit', kind: 'bored', look: [1, 0], hair: 'tuft', you: true, k: 0.4 });
  hourglass(L, x + 760, y + 560, 1.3, S.at('off'));
  L.TXT('...then rush', x + 1150, y + 120, 56, { f: 'KB', align: 'center' }, S.at('rush') - 0.3, 0.3);
  const R2 = L.person(x + 1150, y + 860, 1.5, S.at('rush') - 0.1, { pose: 'walk', kind: 'shock', look: [1, 0], hair: 'tuft', you: true, k: 0.3 }); L.motion(x + 900, y + 600, 160, 4, S.at('rush') + 0.1);
  L.clock(x + 1420, y + 420, 110, S.at('last') - 0.4); L.TXT('last minute', x + 1420, y + 600, 40, { f: 'KB', align: 'center' }, S.at('minute') - 0.2, 0.3);
});
def(LONG, 'c3e', blk(3, 5), { purpose: 'success → relief, then the credit goes to effort (A) or luck (B)', shot: 'pan right; a big tick and RELIEF; the trophy in the middle; two arrows carry its credit away to "hard work" and "luck" boxes; push on the empty ABILITY box below', sfx: 'a bright chord on "relief"; two zips' }, (S, L) => {
  const [x, y] = blk(3, 5);
  L.check(x + 260, y + 180, 4, S.at('well') - 0.3); L.TXT('relief!', x + 460, y + 200, 64, { f: 'KB', align: 'center' }, S.at('relief') - 0.2, 0.3);
  trophy(L, x + 800, y + 520, 1.3, S.at('credit') - 0.5);
  card(L, x + 140, y + 420, 400, 170, S.at('preparer') - 0.4, { lines: [['"I worked so hard"', 36]] }); L.inkArrow([[x + 690, y + 420], [x + 550, y + 480]], { w: 4 }, S.at('worked') - 0.3, 0.2);
  card(L, x + 1060, y + 420, 400, 170, S.at('procrastinator') - 0.4, { lines: [['"I got lucky"', 40]] }); L.inkArrow([[x + 910, y + 420], [x + 1050, y + 480]], { w: 4 }, S.at('lucky') - 0.3, 0.2);
  const ab = L.rrect(x + 600, y + 680, 400, 140, 14); L.INK_(ab, { closed: true, w: 3, amp: 1, dash: [12, 10] }, S.at('lucky') + 0.2, 0.2); L.TXT('ability: empty', x + 800, y + 765, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('lucky') + 0.4, 0.3);
});
def(LONG, 'c3e2', blk(3, 6), { purpose: 'an "Imagine" example: a week to prepare a 10-minute talk; praise lands on the effort; next time two weeks', shot: 'pan right; a calendar with 7 days crossed, the boss says "great!", the character\'s thought bubble shows "need 2 weeks" calendar; push on the bubble', sfx: 'seven pen strikes; a pluck on "great"' }, (S, L) => {
  const [x, y] = blk(3, 6);
  L.TXT('imagine...', x + 160, y + 90, 40, { f: 'PH', col: L.INK2 }, S.at('imagine') - 0.2, 0.3);
  const cal = L.rrect(x + 150, y + 160, 520, 300, 12); L.FILL(cal, S.at('week') - 0.6); L.INK_(cal, { closed: true, w: 3, amp: 0.3 }, S.at('week') - 0.6, 0.12);
  for (let i = 0; i < 7; i++) { const cx = x + 200 + i * 66, cy = y + 320; L.INK_(L.rrect(cx - 26, cy - 40, 52, 80, 6), { closed: true, w: 2, amp: 0.2, passes: 1 }, S.at('week') - 0.4 + i * 0.04, 0.03); L.cross(cx, cy, 1.4, S.at('preparing') - 0.2 + i * 0.08); }
  L.TXT('10-minute talk', x + 410, y + 530, 42, { f: 'KB', align: 'center' }, S.at('talk') - 0.3, 0.3);
  const boss = L.person(x + 860, y + 880, 1.4, S.at('boss') - 0.5, { pose: 'point', kind: 'grin', look: [1, 0], hair: 'cap', k: 0.4 });
  L.bubble(x + 700, y + 380, 300, 90, S.at('great') - 0.3, { text: '"great!"', size: 44, tail: [x + 860, y + 600] });
  const P = L.person(x + 1150, y + 880, 1.5, S.at('hears') - 0.6, { kind: 'worry', look: [-1, 0], hair: 'long', k: 0.4 });
  L.bubble(x + 1080, y + 160, 440, 260, S.at('next') - 0.4, { thought: true, tail: [x + 1150, y + 560] });
  L.TXT('next time:', x + 1300, y + 250, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('next') - 0.1, 0.3); L.TXT('2 WEEKS', x + 1300, y + 340, 64, { f: 'KB', align: 'center' }, S.at('two') - 0.1, 0.3);
  L.TXT('praise → effort, never her', x + 1000, y + 940, 38, { f: 'PH', align: 'center', col: L.INK2 }, S.at('never') - 0.3, 0.5);
});
def(LONG, 'c3f', blk(3, 7), { purpose: 'the loop closes: success never filed under ability; next task starts with the same doubt; success feeds the cycle', shot: 'pan right; the full wheel again with its 4 stations labelled (task, doubt, over-prepare/put off, success → effort/luck) and an arrow back to the start; a yellow ring spins around; push on the arrow back', sfx: 'a circling whoosh, then a click on "feeds"' }, (S, L) => {
  const [x, y] = blk(3, 7);
  const pos = ring(L, x + 800, y + 470, 380, S.t0, 0.8);
  const st = [['task', -Math.PI / 2], ['doubt', 0], ['over-prepare / put off', Math.PI / 2], ['success → "effort" or "luck"', Math.PI]];
  st.forEach(([t, a], i) => { const [px, py] = pos(a); tag(L, px, py, t, 34, S.t0 + 0.3 + i * 0.3, i === 3 ? { tint: L.YEL } : {}); });
  L.TXT('ability?', x + 800, y + 470, 50, { f: 'KB', align: 'center' }, S.at('ability') - 0.3, 0.3); L.cross(x + 800, y + 455, 3.0, S.at('ability') + 0.1);
  L.loop(x + 800, y + 470, 470, 380, S.at('feeds') - 0.4, 0.7, { w: 8 });
  L.TXT('success feeds it', x + 800, y + 960, 52, { f: 'KB', align: 'center' }, S.at('feeds') - 0.2, 0.4);
});
def(LONG, 'c3f2', blk(3, 8), { purpose: 'more success can make it louder: a promotion = new people, higher stakes, a new chance to be found out', shot: 'pan right; a staircase; the character climbs one step, the steps grow taller, new faces appear at the top; the quiet voice on the shoulder grows bigger; push on the voice', sfx: 'footstep plucks rising; a low note' }, (S, L) => {
  const [x, y] = blk(3, 8);
  for (let i = 0; i < 4; i++) { const sx = x + 200 + i * 280, sy = y + 860 - i * 150; L.INK_([[sx, sy], [sx, sy - 150], [sx + 280, sy - 150]], { w: 3.4, amp: 0.3 }, S.at('success') - 0.4 + i * 0.12, 0.1); }
  const P = L.person(x + 640, y + 560, 1.3, S.at('promotion') - 0.5, { pose: 'walk', kind: 'worry', look: [1, -0.3], hair: 'tuft', you: true, k: 0.4 });
  for (let i = 0; i < 3; i++) L.head(x + 1180 + i * 110, y + 230, 34, S.at('people') - 0.3 + i * 0.08, { kind: 'neutral', look: [-1, 0.4], hair: ['cap', 'bun', 'curly'][i], k: 0.3 });
  L.TXT('new people', x + 1290, y + 130, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('people'), 0.3);
  L.TXT('higher stakes', x + 1300, y + 620, 44, { f: 'KB', align: 'center' }, S.at('stakes') - 0.3, 0.3);
  const [hx, hy, r] = P.head; whisper(L, hx - r * 1.8, hy + r * 0.2, 2.0, S.at('louder') - 0.4, null);
  L.TXT('louder', x + 350, y + 400, 60, { f: 'KB', align: 'center' }, S.at('louder') - 0.1, 0.3);
  L.TXT('a new chance to be "found out"', x + 760, y + 960, 42, { f: 'PH', align: 'center', col: L.INK2 }, S.at('found') - 0.4, 0.5);
});
def(LONG, 'c3g', blk(3, 9), { purpose: 'second trap: your doubts seen from inside, everyone else shows only their outside', shot: 'pan right; your head drawn as a cut-away full of scribbles; beside you, two polished cardboard cut-outs with big smiles; push between them', sfx: 'a messy scribble sound; two bright ticks' }, (S, L) => {
  const [x, y] = blk(3, 9);
  const H = L.head(x + 400, y + 420, 170, S.at('trap') - 0.4, { you: true, kind: 'worry', look: [1, 0], k: 0.5 });
  scribble(L, x + 400, y + 390, 150, S.at('inside') - 0.6, 0.8);
  L.TXT('your inside', x + 400, y + 700, 50, { f: 'KB', align: 'center' }, S.at('inside') - 0.1, 0.3);
  cutout(L, x + 1000, y + 820, 1.6, S.at('everyone') - 0.4, { hair: 'cap' }); cutout(L, x + 1340, y + 820, 1.6, S.at('everyone') - 0.2, { hair: 'long' });
  L.TXT('their outside', x + 1170, y + 920, 50, { f: 'KB', align: 'center' }, S.at('outside') - 0.3, 0.3);
});
def(LONG, 'c3h', blk(3, 10), { purpose: 'Jordan et al. 2011 (Stanford): negative feelings are more hidden than positive ones', shot: 'pan right; year tag, name card; a person with a sunny bubble shown openly and a storm cloud hidden behind their back; push on the hidden cloud', sfx: 'pen; a hush' }, (S, L) => {
  const [x, y] = blk(3, 10);
  tag(L, x + 260, y + 100, '2011', 66, S.at('eleven') - 0.4, { tint: L.YEL });
  card(L, x + 480, y + 30, 640, 130, S.at('jordan') - 0.4, { lines: [['Alexander Jordan · Stanford', 42]] });
  L.TXT('good and bad days', x + 1360, y + 110, 38, { f: 'PH', align: 'center', col: L.INK2 }, S.at('everyday') - 0.2, 0.4);
  const P = L.person(x + 800, y + 880, 1.8, S.at('negative') - 0.6, { pose: 'hold', kind: 'smile', look: [0, 0.2], hair: 'curly', k: 0.4 });
  L.bubble(x + 960, y + 280, 380, 120, S.at('positive') - 0.4, { text: 'great day!', size: 42 }); 
  cloud(L, x + 470, y + 620, 300, 160, S.at('hidden') - 0.4, { tint: L.GRY2 }); L.TXT('hidden', x + 470, y + 460, 46, { f: 'KB', align: 'center' }, S.at('hidden'), 0.3);
  L.TXT('bad feelings: kept private', x + 800, y + 960, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('positive') + 0.2, 0.5);
});
def(LONG, 'c3i', blk(3, 11), { purpose: 'people underestimated peers\' hard moments, even close peers; biggest under-estimators tended to feel lonelier', shot: 'pan right; two bars: "your guess" short vs "real" tall; a lone figure on a bench with a small cloud; push on the gap between the bars', sfx: 'two bar plucks, the second higher; a quiet note' }, (S, L) => {
  const [x, y] = blk(3, 11);
  L.bars(x + 160, y + 720, 620, 520, [{ v: 0.35, label: 'guessed', top: 'low', t: S.at('underestimated') - 0.3 }, { v: 0.8, label: 'real', top: 'higher', col: L.YEL, t: S.at('hard') - 0.2 }], S.at('underestimated') - 0.5, { ls: 38, ts: 44 });
  L.TXT("peers' hard moments", x + 470, y + 820, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('peers') - 0.3, 0.4);
  L.TXT('even close friends', x + 470, y + 120, 46, { f: 'KB', align: 'center' }, S.at('well') - 0.3, 0.4);
  const bn = L.rrect(x + 1000, y + 700, 400, 30, 8); L.INK_(bn, { closed: true, w: 3, amp: 0.3 }, S.at('lonelier') - 0.8, 0.1);
  const P = L.person(x + 1200, y + 860, 1.4, S.at('lonelier') - 0.7, { pose: 'sit', kind: 'sad', look: [0, 0.6], hair: 'messy', k: 0.4 });
  L.TXT('tended to feel lonelier', x + 1200, y + 960, 40, { f: 'KB', align: 'center' }, S.at('lonelier') - 0.2, 0.4);
});
def(LONG, 'c3j', blk(3, 12), { purpose: 'the punchline: messy inside vs polished outside → you look like the fraud', shot: 'pan right; a balance scale: your scribbled head on one side, a shiny cut-out on the other; the scale tips; the FRAUD? label lands on you; push on the label', sfx: 'a creak as the scale tips; a soft thud' }, (S, L) => {
  const [x, y] = blk(3, 12);
  L.INK_(L.line(x + 800, y + 860, x + 800, y + 320), { w: 5, amp: 0.2, passes: 1 }, S.at('compare') - 0.5, 0.1);
  L.INK_(L.line(x + 380, y + 400, x + 1220, y + 260), { w: 5, amp: 0.2, passes: 1 }, S.at('compare') - 0.4, 0.12);
  L.head(x + 380, y + 520, 90, S.at('messy') - 0.4, { you: true, kind: 'worry', look: [1, -0.3], k: 0.4 }); scribble(L, x + 380, y + 500, 80, S.at('messy') - 0.1, 0.4);
  cutout(L, x + 1220, y + 620, 1.2, S.at('polished') - 0.4, { hair: 'cap' });
  stamp(L, x + 380, y + 760, 'FRAUD?', 60, S.at('fraud') - 0.3);
  L.TXT('an unfair comparison', x + 800, y + 960, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('course') - 0.2, 0.5);
});

// ===== chapter 4: the surprising upside =====
chapter(LONG, 'ch4', 4, 4, 'THE SURPRISING UPSIDE');
def(LONG, 'c4a', blk(4, 1), { purpose: 'the twist set-up: Tewfik (MIT) 2022: what do impostor thoughts do at work?', shot: 'pan right; the year tag and name card, a work desk with a question mark over it; slow push', sfx: 'pen; a curious pluck' }, (S, L) => {
  const [x, y] = blk(4, 1);
  tag(L, x + 280, y + 120, '2022', 70, S.at('twenty') - 0.4, { tint: L.YEL });
  card(L, x + 500, y + 50, 660, 140, S.at('tewfik') - 0.4, { lines: [['Basima Tewfik · MIT', 46]] });
  desk(L, x + 400, y + 700, 800, S.at('question') - 0.6, { h: 880 - 700 }); laptop(L, x + 800, y + 700, 1.3, S.at('question') - 0.4);
  L.qmark(x + 800, y + 480, 160, S.at('work') - 0.3);
  L.TXT('impostor thoughts → at work?', x + 800, y + 330, 50, { f: 'KB', align: 'center' }, S.at('impostor') - 0.3, 0.6);
});
def(LONG, 'c4b', blk(4, 2), { purpose: 'study 1: an investment firm; more impostor thoughts → rated more effective with others by supervisors, no less productive', shot: 'pan right; an office worker with the small grey voice, a supervisor holding a rating card with 5 stars; a productivity bar unchanged; push on the stars', sfx: 'five star plings' }, (S, L) => {
  const [x, y] = blk(4, 2);
  L.TXT('investment firm', x + 800, y + 100, 54, { f: 'KB', align: 'center' }, S.at('investment') - 0.2, 0.4);
  const P = L.person(x + 360, y + 860, 1.6, S.at('employees') - 0.5, { pose: 'hold', kind: 'worry', look: [1, 0], hair: 'tuft', k: 0.4 }); whisper(L, P.head[0] - 110, P.head[1] + 30, 1.2, S.at('reported') - 0.2, null);
  const Q = L.person(x + 860, y + 860, 1.6, S.at('supervisors') - 0.5, { pose: 'hold', kind: 'content', look: [-1, 0], hair: 'cap', k: 0.4 });
  const rc = L.rrect(Q.hand[1][0] - 20, Q.hand[1][1] - 120, 300, 130, 12); L.FILL(rc, S.at('supervisors') - 0.2); L.INK_(rc, { closed: true, w: 3, amp: 0.3 }, S.at('supervisors') - 0.2, 0.1);
  for (let i = 0; i < 5; i++) star(L, Q.hand[1][0] + 20 + i * 56, Q.hand[1][1] - 56, 22, S.at('effective') - 0.2 + i * 0.08);
  L.TXT('better with people', x + 1300, y + 300, 46, { f: 'KB', align: 'center' }, S.at('people') - 0.2, 0.4);
  L.TXT('productivity:', x + 1300, y + 520, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('productive') - 0.5, 0.3); battery(L, x + 1300, y + 620, 240, 90, 0.8, S.at('productive') - 0.3); L.TXT('no less', x + 1300, y + 760, 46, { f: 'KB', align: 'center' }, S.at('productive') - 0.1, 0.3);
});
def(LONG, 'c4c', blk(4, 3), { purpose: 'study 2: doctors in training filmed with patients; patients rated those with more impostor thoughts as more empathetic, better listeners, better at drawing out information', shot: 'pan right; a camera on a tripod films a doctor (stethoscope) and patient across a desk; three rating ticks appear beside the patient; push on the ticks', sfx: 'a camera beep; three ticks' }, (S, L) => {
  const [x, y] = blk(4, 3);
  const cam = L.rrect(x + 120, y + 280, 150, 100, 12); L.FILL(cam, S.at('filmed') - 0.5); L.MRK([cam], { col: L.GRY2, w: 10 }, S.at('filmed') - 0.45, 0.05); L.INK_(cam, { closed: true, w: 3, amp: 0.2 }, S.at('filmed') - 0.5, 0.1);
  L.INK_([[x + 195, y + 380], [x + 150, y + 600]], { w: 3, amp: 0.1, passes: 1 }, S.at('filmed') - 0.4, 0.04); L.INK_([[x + 195, y + 380], [x + 240, y + 600]], { w: 3, amp: 0.1, passes: 1 }, S.at('filmed') - 0.4, 0.04);
  const rd = L.ell(x + 140, y + 300, 8, 8, 0, L.TAU, 10); L.MRK([rd], { col: L.YELD, w: 8, edge: false }, S.at('appointments') - 0.2, 0.04);
  desk(L, x + 520, y + 700, 560, S.at('doctors') - 0.6, { h: 880 - 700 });
  const D = L.person(x + 560, y + 880, 1.6, S.at('doctors') - 0.5, { pose: 'sit', kind: 'smile', look: [1, 0], hair: 'tuft', k: 0.4 }); stetho(L, D, S.at('training') - 0.2);
  const Pt = L.person(x + 1060, y + 880, 1.6, S.at('patients') - 0.5, { pose: 'sit', kind: 'content', look: [-1, 0], hair: 'bun', dir: -1, k: 0.4 });
  L.TXT('patients rated:', x + 1340, y + 220, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('rated') - 0.3, 0.3);
  [['more empathetic', 'empathetic'], ['better listeners', 'listeners'], ['draw out more info', 'information']].forEach(([t, w], i) => { L.check(x + 1170, y + 300 + i * 80, 1.4, S.at(w) - 0.1); L.TXT(t, x + 1200, y + 312 + i * 80, 36, { f: 'KB' }, S.at(w) - 0.2, 0.3); });
});
def(LONG, 'c4d', blk(4, 4), { purpose: 'on video: more eye contact, nodding, open hand gestures: paying attention', shot: 'pan right; close two-shot of doctor and patient faces; dotted gaze line, nod marks, open palms appear on cue; push on the gaze line', sfx: 'three soft taps on cue' }, (S, L) => {
  const [x, y] = blk(4, 4);
  const D = L.person(x + 500, y + 900, 2.4, S.t0 - 0.2, { pose: 'shrug', kind: 'smile', look: [1, 0], hair: 'tuft', k: 0.4 }); stetho(L, D, S.t0);
  const Pt = L.person(x + 1100, y + 900, 2.4, S.t0 - 0.1, { pose: 'stand', kind: 'content', look: [-1, 0], hair: 'bun', k: 0.4 });
  gaze(L, [D.head[0] + 30, D.head[1]], [Pt.head[0] - 30, Pt.head[1]], S.at('eye') - 0.2); L.TXT('eye contact', x + 800, D.head[1] - 120, 44, { f: 'KB', align: 'center' }, S.at('contact') - 0.2, 0.3);
  nod(L, D.head[0] + D.head[2], D.head[1] - 10, 1.6, S.at('nodded') - 0.2); L.TXT('nods', D.head[0] + 170, D.head[1] - 120, 40, { f: 'KB', align: 'center' }, S.at('nodded'), 0.2);
  L.TXT('open hands', x + 260, y + 520, 40, { f: 'KB', align: 'center' }, S.at('gestures') - 0.3, 0.3); L.sparks(D.hand[0][0], D.hand[0][1], 30, 50, [-2.6, -2.0], S.at('open') - 0.1, 0.1);
  L.TXT('paying attention', x + 800, y + 140, 54, { f: 'KB', align: 'center' }, S.at('attention') - 0.3, 0.4);
});
def(LONG, 'c4e', blk(4, 5), { purpose: 'the mechanism: "not enough" → attention turns outward → more questions, listening; in 2 experiments, impostor thoughts led to more questions', shot: 'pan right; an arrow from a worried head turns outward toward other people; question marks pour out; two small lab boxes tick; push on the outward arrow', sfx: 'a turning whoosh; a cascade of plucks for the questions' }, (S, L) => {
  const [x, y] = blk(4, 5);
  const H = L.head(x + 320, y + 420, 130, S.at('feel') - 0.4, { you: true, kind: 'worry', look: [1, 0], k: 0.4 });
  L.TXT('"not enough?"', x + 320, y + 210, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('enough') - 0.3, 0.4);
  L.inkArrow(L.bez([x + 470, y + 420], [x + 640, y + 300], [x + 820, y + 300], [x + 980, y + 420]), { w: 6 }, S.at('outward') - 0.4, 0.4);
  L.TXT('attention → outward', x + 720, y + 230, 48, { f: 'KB', align: 'center' }, S.at('outward') - 0.2, 0.4);
  for (let i = 0; i < 3; i++) L.head(x + 1080 + i * 140, y + 460, 50, S.at('outward') + i * 0.08, { kind: 'smile', look: [-1, 0], hair: ['cap', 'long', 'curly'][i], k: 0.3 });
  for (let i = 0; i < 5; i++) L.qmark(x + 560 + i * 90, y + 560 + (i % 2) * 40, 60, S.at('questions') - 0.3 + i * 0.07);
  L.TXT('listen harder', x + 720, y + 720, 46, { f: 'KB', align: 'center' }, S.at('listen') - 0.2, 0.3);
  labGrid(L, x + 1160, y + 760, 2, 2, 120, S.at('experiments') - 0.3, 0.1, { s: 1.4 }); L.TXT('2 experiments: more questions', x + 1240, y + 900, 34, { f: 'PH', align: 'center', col: L.INK2 }, S.at('too') - 0.4, 0.5);
});
def(LONG, 'c4f', blk(4, 6), { purpose: 'Tewfik\'s caveat: no reason to want them; they lower self-esteem; better ways exist', shot: 'pan right; a warning sign; a self-esteem gauge needle drops; a calm figure learning to listen another way (a book) beside it; push on the gauge', sfx: 'a caution ding; a falling slide' }, (S, L) => {
  const [x, y] = blk(4, 6);
  warnLight(L, x + 200, y + 200, 60, S.at('clear') - 0.3);
  L.TXT("not a reason to want them", x + 760, y + 210, 54, { f: 'KB', align: 'center' }, S.at('want') - 0.4, 0.5);
  const g = gauge(L, x + 480, y + 680, 250, S.at('esteem') - 1.0, { v: 0.75, lo: 'low', hi: 'high', label: 'self-esteem' }); g.needle(0.2, S.at('lower') + 0.1);
  const P = L.person(x + 1150, y + 860, 1.6, S.at('better') - 0.5, { pose: 'hold', kind: 'content', look: [0, 0.4], hair: 'curly', k: 0.4 });
  const bk = L.rrect(P.hand[1][0] - 60, P.hand[1][1] - 70, 120, 80, 6); L.FILL(bk, S.at('ways') - 0.2); L.MRK([bk], { col: L.YEL, w: 10 }, S.at('ways') - 0.15, 0.05); L.INK_(bk, { closed: true, w: 3, amp: 0.2 }, S.at('ways') - 0.2, 0.08);
  L.TXT('better ways to get good with people', x + 1150, y + 420, 36, { f: 'PH', align: 'center', col: L.INK2 }, S.at('far') - 0.2, 0.6);
  L.TXT('(without losing your peace of mind)', x + 1150, y + 480, 32, { f: 'PH', align: 'center', col: L.INK2 }, S.at('peace') - 0.3, 0.6);
});
def(LONG, 'c4g', blk(4, 7), { purpose: 'takeaway: the feeling is not evidence; feeling like a fraud ≠ being one', shot: 'pan right; FEELING and BEING written on two cards with a big ≠ between them; the evidence folder is empty under FEELING; push on the ≠', sfx: 'pen; a firm tap on the ≠' }, (S, L) => {
  const [x, y] = blk(4, 7);
  L.TXT('the feeling is not evidence', x + 800, y + 140, 62, { f: 'KB', align: 'center' }, S.at('evidence') - 0.4, 0.6);
  card(L, x + 120, y + 330, 580, 300, S.at('feeling', 2) - 0.4, { lines: [['feeling', 46, 'PH'], ['like a fraud', 54]] });
  card(L, x + 900, y + 330, 580, 300, S.at('being') - 0.4, { lines: [['being', 46, 'PH'], ['a fraud', 54]] });
  L.TXT('≠', x + 800, y + 520, 160, { f: 'KB', align: 'center' }, S.at('different') - 0.3, 0.3);
  L.swash(x + 640, y + 560, x + 960, S.at('different'), 0.2);
  L.TXT('two very different things', x + 800, y + 800, 46, { f: 'PH', align: 'center', col: L.INK2 }, S.at('things') - 0.3, 0.5);
});
def(LONG, 'c4h', blk(4, 8), { purpose: 'the strange part: the feeling can make you the person who pays most attention to others', shot: 'pan right; a meeting table from above, everyone talking (bubbles) and one masked figure leaning in with a yellow attention halo; push on them', sfx: 'room chatter, then quiet on "attention"' }, (S, L) => {
  const [x, y] = blk(4, 8);
  const tb = L.ell(x + 800, y + 560, 420, 160, 0, L.TAU, 50); L.FILL(tb, S.t0); L.MRK([tb], { col: L.GRY2, w: 14 }, S.t0 + 0.1, 0.1); L.INK_(tb, { closed: true, w: 3.4, amp: 0.4 }, S.t0, 0.2);
  const seats = [[-1, -0.8], [0, -1.1], [1, -0.8], [1, 0.8], [-1, 0.8]];
  seats.forEach(([sx, sy], i) => { const hx = x + 800 + sx * 470, hy = y + 560 + sy * 230; L.head(hx, hy, 50, S.at('feeling') - 0.4 + i * 0.08, { kind: 'grin', look: [-sx, -sy], hair: ['cap', 'long', 'curly', 'bun', 'messy'][i], k: 0.3 }); L.bubble(hx - 60, hy - 140, 120, 60, S.at('feeling') + i * 0.1, { text: 'blah', size: 26, shadow: false }); });
  const hx = x + 800, hy = y + 820; L.head(hx, hy, 60, S.at('room') - 0.4, { you: true, kind: 'think', look: [0, -1], k: 0.3 });
  L.loop(hx, hy, 110, 100, S.at('attention') - 0.3, 0.5, { w: 10 });
  L.TXT('pays the most attention', x + 800, y + 120, 54, { f: 'KB', align: 'center' }, S.at('attention') - 0.2, 0.5);
});

// ===== chapter 5: what you can try =====
chapter(LONG, 'ch5', 5, 5, 'WHAT YOU CAN TRY');
def(LONG, 'c5a', blk(5, 1), { purpose: 'honest note: no published treatment studies (Bravata 2020); research-grounded ideas, not a cure', shot: 'pan right; an empty shelf labelled TREATMENT STUDIES: 0; then a notepad of three ideas appears; push on the "not a cure" line', sfx: 'an empty knock; pen' }, (S, L) => {
  const [x, y] = blk(5, 1);
  L.INK_(L.line(x + 140, y + 420, x + 760, y + 420), { w: 5, amp: 0.3 }, S.at('review') - 0.4, 0.15);
  L.TXT('treatment studies:', x + 450, y + 260, 46, { f: 'KB', align: 'center' }, S.at('treatment') - 0.3, 0.4); L.TXT('0', x + 450, y + 380, 110, { f: 'KB', align: 'center' }, S.at('published') - 0.1, 0.2);
  L.TXT('(2020 review)', x + 450, y + 500, 36, { f: 'PH', align: 'center', col: L.INK2 }, S.at('testing') - 0.2, 0.3);
  notepad(L, x + 900, y + 140, 560, 460, S.at('ideas') - 0.6, ['idea 1', 'idea 2', 'idea 3'], { size: 44, lh: 110 });
  L.TXT('ideas from the research... not a cure', x + 800, y + 800, 46, { f: 'KB', align: 'center' }, S.at('cure') - 0.6, 0.6);
});
def(LONG, 'c5b', blk(5, 2), { purpose: 'idea 1: call it a thought, not a fact; notice it ("there\'s that impostor thought again")', shot: 'pan right; the grey voice speaks "you got lucky", the character labels its bubble with a tag THOUGHT and the bubble floats away; push on the tag', sfx: 'pen; a light float whoosh' }, (S, L) => {
  const [x, y] = blk(5, 2);
  numDot(L, x + 120, y + 100, 1, S.at('one') - 0.3, 44); L.TXT('a thought, not a fact', x + 560, y + 120, 56, { f: 'KB', align: 'center' }, S.at('fact') - 0.3, 0.4);
  const P = L.person(x + 420, y + 880, 1.9, S.at('thoughts') - 0.5, { pose: 'point', kind: 'think', look: [1, -0.4], hair: 'tuft', you: true, k: 0.4 });
  whisper(L, P.head[0] + P.head[2] * 1.6, P.head[1] + P.head[2] * 0.9, 1.4, S.at('voice') - 0.4, null);
  L.bubble(x + 820, y + 320, 420, 90, S.at('lucky') - 0.4, { text: 'you got lucky', size: 40, tail: [P.head[0] + P.head[2] * 1.8, P.head[1] + P.head[2] * 0.5], shadow: false, tint: 'rgba(150,150,150,0.18)' });
  tag(L, x + 1340, y + 300, 'THOUGHT', 40, S.at('notice') - 0.2, { tint: L.YEL });
  L.TXT('"there\'s that impostor thought again"', x + 900, y + 620, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('again') - 0.6, 0.6);
  L.TXT('thoughts come and go', x + 1100, y + 780, 44, { f: 'KB', align: 'center' }, S.at('come') - 0.2, 0.4);
});
def(LONG, 'c5c', blk(5, 3), { purpose: 'idea 2: say it to someone you trust; Clance: learning + talking helps people recognize it; "misery has more company"; "me too"', shot: 'pan right; two people on a bench; one lowers the mask while talking, the other answers "me too" and lowers theirs; push on the two masks in their laps', sfx: 'soft voices; a warm pluck on "me too"' }, (S, L) => {
  const [x, y] = blk(5, 3);
  numDot(L, x + 120, y + 100, 2, S.at('two') - 0.3, 44); L.TXT('say it out loud', x + 520, y + 120, 56, { f: 'KB', align: 'center' }, S.at('loud') - 0.3, 0.4);
  const bn = L.rrect(x + 380, y + 760, 700, 34, 8); L.FILL(bn, S.at('trust') - 0.4); L.INK_(bn, { closed: true, w: 3, amp: 0.3 }, S.at('trust') - 0.4, 0.1);
  const A = L.person(x + 560, y + 900, 1.6, S.at('trust') - 0.3, { pose: 'sit', kind: 'worry', look: [1, 0], hair: 'tuft', you: true, k: 0.4 });
  const B2 = L.person(x + 900, y + 900, 1.6, S.at('trust') - 0.1, { pose: 'sit', kind: 'neutral', look: [-1, 0], hair: 'long', dir: -1, k: 0.4 });
  mask(L, A.hand[1][0], A.hand[1][1] + 10, 0.6, S.at('talking') - 0.3);
  L.bubble(x + 300, y + 260, 460, 100, S.at('learning') - 0.4, { text: 'I feel like a fraud', size: 38, tail: [A.head[0], A.head[1] - 40] });
  L.TXT('Clance: learning + talking helps', x + 1220, y + 300, 34, { f: 'PH', align: 'center', col: L.INK2 }, S.at('recognize') - 0.4, 0.5);
  card(L, x + 1000, y + 380, 500, 160, S.at('misery') - 0.5, { lines: [['"misery has more company', 30], ['than people think"', 30]] });
  L.react(B2, S.at('me') - 0.4, { kind: 'smile', look: [-1, 0] });
  L.bubble(x + 1000, y + 580, 260, 90, S.at('me') - 0.3, { text: 'me too', size: 44, tail: [B2.head[0], B2.head[1] - 30], tint: 'rgba(255,205,40,0.3)' });
  mask(L, B2.hand[1][0], B2.hand[1][1] + 10, 0.6, S.at('too') - 0.1);
});
def(LONG, 'c5d', blk(5, 4), { purpose: 'idea 3: break the cycle at the credit step; write down what you did (skill, decision), not just hours or luck; keep it visible', shot: 'pan right; the cycle wheel small at left with its "credit" station circled; a phone note lists "skill used / decision made"; push on the note', sfx: 'a snip on the wheel; pen writing' }, (S, L) => {
  const [x, y] = blk(5, 4);
  numDot(L, x + 120, y + 100, 3, S.at('three') - 0.3, 44); L.TXT('fix the credit step', x + 560, y + 120, 56, { f: 'KB', align: 'center' }, S.at('credit') - 0.3, 0.4);
  const pos = ring(L, x + 380, y + 500, 200, S.at('cycle') - 0.4, 0.6); const [cx0, cy0] = pos(Math.PI); L.loop(cx0, cy0, 80, 60, S.at('credit') + 0.1, 0.3, { w: 8 });
  L.TXT('credit', cx0, cy0 + 100, 36, { f: 'KB', align: 'center' }, S.at('credit') + 0.2, 0.2);
  const sc = bigPhone(L, x + 1100, y + 520, 1.0, S.at('write') - 0.6);
  L.TXT('what I did:', sc[0] + 20, sc[1] + 60, 30, { f: 'KB' }, S.at('did') - 0.2, 0.3);
  L.TXT('• the skill I used', sc[0] + 20, sc[1] + 130, 26, { f: 'PH' }, S.at('skill') - 0.2, 0.3);
  L.TXT('• the decision I made', sc[0] + 20, sc[1] + 190, 26, { f: 'PH' }, S.at('decision') - 0.2, 0.3);
  L.TXT('hours', x + 560, y + 820, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('hours') - 0.2, 0.2); L.TXT('luck', x + 720, y + 820, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('luck') - 0.2, 0.2); L.TXT('+ not just', x + 640, y + 760, 36, { f: 'PH', align: 'center', col: L.INK2 }, S.at('just') - 0.2, 0.2);
  L.TXT('a record that\'s harder to argue with', x + 1100, y + 940, 38, { f: 'KB', align: 'center' }, S.at('record') - 0.3, 0.6);
});
def(LONG, 'c5e', blk(5, 5), { purpose: 'bigger picture: Feenstra et al. 2020: environment matters; places that signal you don\'t belong; not only inside your head', shot: 'pan right; zoom-out framing: the character inside a room drawn around them with a "you don\'t belong" sign on the wall; the room\'s walls get the yellow highlight (the fix is also the room); slow push', sfx: 'a room tone; a pen circle round the walls' }, (S, L) => {
  const [x, y] = blk(5, 5);
  card(L, x + 120, y + 60, 620, 140, S.at('feenstra') - 0.4, { lines: [['Sanne Feenstra et al. · 2020', 38]] });
  const rm = [[x + 600, y + 300], [x + 1400, y + 300], [x + 1400, y + 880], [x + 600, y + 880]]; L.INK_(rm, { closed: true, w: 4, amp: 0.4 }, S.at('environment') - 0.4, 0.3);
  L.MRK([rm], { col: 'rgba(255,205,40,0.3)', w: 20, edge: true }, S.at('matters') - 0.1, 0.3);
  L.TXT('the environment matters', x + 1000, y + 250, 46, { f: 'KB', align: 'center' }, S.at('environment') - 0.2, 0.4);
  const sg = L.rrect(x + 1060, y + 380, 300, 110, 8); L.FILL(sg, S.at('signal') - 0.4); L.INK_(sg, { closed: true, w: 3, amp: 0.3 }, S.at('signal') - 0.4, 0.1); L.TXT("don't belong", x + 1210, y + 448, 36, { f: 'KB', align: 'center' }, S.at('belong') - 0.3, 0.3);
  L.person(x + 860, y + 860, 1.6, S.at('place') - 0.4, { kind: 'worry', look: [1, -0.4], hair: 'curly', k: 0.4 });
  L.head(x + 340, y + 560, 120, S.at('head') - 0.6, { you: true, kind: 'think', look: [1, 0], k: 0.4 }); L.TXT('not only in here', x + 340, y + 760, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('head') - 0.2, 0.4);
});
def(LONG, 'c5f', blk(5, 6), { purpose: 'safety line: anxiety or low mood that won\'t lift → doctor or licensed therapist; not failing, the right tool', shot: 'pan right; two people talking calmly in two chairs; a toolbox with the right tool picked; slow push', sfx: 'soft pen; a gentle chord' }, (S, L) => {
  const [x, y] = blk(5, 6);
  L.person(x + 400, y + 860, 1.6, S.at('talking') - 0.6, { pose: 'sit', kind: 'neutral', look: [1, 0], hair: 'tuft', you: true, k: 0.4 });
  L.person(x + 760, y + 860, 1.6, S.at('therapist') - 0.6, { pose: 'sit', kind: 'content', look: [-1, 0], hair: 'bun', dir: -1, k: 0.4 });
  L.bubble(x + 300, y + 300, 560, 120, S.at('doctor') - 0.3, { text: 'doctor or licensed therapist', size: 34, tail: [x + 760, y + 620] });
  L.TXT("if it won't lift", x + 580, y + 160, 50, { f: 'KB', align: 'center' }, S.at('lift') - 0.3, 0.3);
  const tb = L.rrect(x + 1050, y + 560, 400, 200, 16); L.FILL(tb, S.at('tool') - 0.8); L.MRK([tb], { col: L.GRY2, w: 14 }, S.at('tool') - 0.7, 0.08); L.INK_(tb, { closed: true, w: 3, amp: 0.3 }, S.at('tool') - 0.8, 0.14);
  L.MST(L.line(x + 1180, y + 540, x + 1330, y + 380), { w: 14, col: L.YELD }, S.at('right') - 0.2, 0.15);
  L.TXT('not failing', x + 1250, y + 300, 46, { f: 'KB', align: 'center' }, S.at('failing') - 0.3, 0.3); L.TXT('the right tool', x + 1250, y + 860, 46, { f: 'KB', align: 'center' }, S.at('tool') - 0.2, 0.3);
});

// ===== ending =====
def(LONG, 'end1', blk(0, 2), { purpose: 'payoff: whip back to the good-news moment and the quiet voice (callback to hook2)', shot: 'a long whip back up the page to the opening letter scene, then a slow push on the grey voice on the shoulder', sfx: 'long paper whoosh; the low note of the voice returns', noAutoCam: true }, (S, L) => {
  const B = blk(0, 2), [x, y] = B, c = S.fit(B);
  S.cam(S.t0 - 0.2, (x + 800 + blk(5, 6)[0] + 800) / 2, (y + 450 + 5 * GY + 450) / 2, 0.13, 1.1, 'io');
  S.cam(S.t0 + 0.9, c.x, c.y, c.z, 1.2, 'io');
  S.cam(S.at('mistake') - 1.2, x + 1000, y + 480, c.z * 1.3, Math.max(1, S.end - S.at('mistake') + 1.2), 'sin');
  L.TXT('the same quiet voice...', x + 330, y + 120, 42, { f: 'PH', align: 'center', col: L.INK2 }, S.at('quiet') - 0.3, 0.5);
});
def(LONG, 'end2', blk(0, 5), { purpose: 'the line to remember: common, not a diagnosis, ignores evidence, not the truth; you probably did the work', shot: 'whip right; the character lowers the mask and puts it down on a desk beside the letter; the grey voice shrinks to a dot; the trophy gets a label "you did this"; push on the face', sfx: 'whoosh; a soft clack as the mask is put down; a warm final pluck', ease: 'q' }, (S, L) => {
  const [x, y] = blk(0, 5);
  ['common', 'not a diagnosis', 'ignores evidence', 'not the truth'].forEach((t, i) => tag(L, x + 260 + (i % 2) * 380, y + 140 + Math.floor(i / 2) * 110, t, 38, S.at(['common', 'diagnosis', 'evidence', 'truth'][i]) - 0.3, i === 3 ? { tint: L.YEL } : {}));
  desk(L, x + 760, y + 660, 700, S.at('fool') - 0.8, { h: 880 - 660 });
  const P = L.person(x + 560, y + 880, 1.9, S.at('fool') - 1.0, { pose: 'stand', kind: 'content', look: [1, 0.3], hair: 'tuft', you: true, k: 0.5 });
  mask(L, x + 900, y + 620, 0.9, S.at('fool') - 0.4);
  letter(L, x + 1100, y + 600, 0.9, S.at('fool') - 0.2);
  trophy(L, x + 1340, y + 660, 1.0, S.at('work') - 0.8); L.TXT('you did the work', x + 1220, y + 440, 46, { f: 'KB', align: 'center' }, S.at('work') - 0.4, 0.4);
  L.react(P, S.at('work'), { kind: 'smile', look: [1, 0.3] });
});
def(LONG, 'end3', blk(0, 6), { purpose: 'one specific comment question + one subscribe line', shot: 'pan right; the question card fills the frame', sfx: 'pen; a kalimba on "subscribe"' }, (S, L) => {
  const [x, y] = blk(0, 6);
  L.bubble(x + 160, y + 120, 1280, 330, S.t0 + 0.2, { tint: 'rgba(255,205,40,0.25)', tail: [x + 400, y + 560] });
  L.TXT("What's one success you still", x + 800, y + 250, 58, { f: 'KB', align: 'center' }, S.at('success') - 0.6, 0.9);
  L.TXT('secretly put down to luck?', x + 800, y + 350, 58, { f: 'KB', align: 'center' }, S.at('luck') - 0.6, 0.8);
  L.TXT('psychology, with the receipts', x + 800, y + 560, 50, { f: 'PH', align: 'center', col: L.INK2 }, S.at('receipts') - 0.4, 0.8);
  L.box(x + 560, y + 660, 480, 120, S.at('subscribe') - 0.4, 0.3, { r: 30, tint: L.YEL });
  L.TXT('SUBSCRIBE', x + 800, y + 742, 60, { f: 'KB', align: 'center' }, S.at('subscribe') - 0.2, 0.5);
});
def(LONG, 'card', blk(0, 7, 1400, 700), { purpose: 'end card (last ~20 s kept clear of key info for the YouTube end screen)', shot: 'pan right to the card, then hold', sfx: 'closing chord (harp, glockenspiel, vibraphone)', push: 0.02 }, (S, L) => {
  const [x, y] = blk(0, 7, 1400, 700);
  L.ribbon(x + 700, y + 230, 860, 120, 'THE OVERTHINKING PAD', 62, S.t0 + 0.2, { d: 0.35, td: 0.9 });
  L.TXT('why your brain does this, on one page', x + 700, y + 420, 48, { f: 'PH', align: 'center', col: L.INK2 }, S.t0 + 1.3, 1.0);
  L.TXT('new pages Mon · Tue · Thu · Sat', x + 700, y + 520, 50, { f: 'KB', align: 'center' }, S.t0 + 2.4, 1.0);
  L.loop(x + 700, y + 230, 520, 110, S.t0 + 3.6, 0.6);
});

// ---------- the Short (9:16): blocks are tall, 900 × 1150 ----------
const SBW = 900, SBH = 1150, sblk = i => [i * 1050, 0, SBW, SBH];
const SHORT = {};
def(SHORT, 's1', sblk(0), { purpose: 'hook in the first second (EXP-overthinkingpad-001 CONTROL: study-first): a camera filming a doctor and patient, the doctor\'s worried thought "fraud?"', shot: 'opens close on the camera\'s red light and lens from frame 0, pulls back to reveal the doctor and patient it films (reveal: who is being measured)', sfx: 'a camera beep on frame 0; pen', noAutoCam: true }, (S, L) => {
  const B = sblk(0), [x, y] = B, c = S.fit(B);
  S.cam(S.t0, x + 200, y + 260, c.z * 2.0, 0.01); S.cam(S.at('patients') - 0.5, c.x, c.y, c.z * 1.03, 1.4, 'io');
  const cam = L.rrect(x + 110, y + 200, 180, 120, 14); L.FILL(cam, S.t0 - 1.0); L.MRK([cam], { col: L.GRY2, w: 10 }, S.t0 - 0.9, 0.05); L.INK_(cam, { closed: true, w: 3, amp: 0.2 }, S.t0 - 1.0, 0.1);
  const lens = L.ell(x + 300, y + 260, 40, 40, 0, L.TAU, 24); L.FILL(lens, S.t0 - 0.8); L.INK_(lens, { closed: true, w: 3, amp: 0.2 }, S.t0 - 0.8, 0.08);
  const rd = L.ell(x + 140, y + 225, 10, 10, 0, L.TAU, 12); L.MRK([rd], { col: L.YELD, w: 10, edge: false }, S.t0 + 0.02, 0.04);
  L.TXT('REC', x + 200, y + 180, 34, { f: 'KB', align: 'center' }, S.t0 + 0.05, 0.2);
  const D = L.person(x + 260, y + 1000, 1.5, S.at('doctors') - 0.4, { pose: 'sit', kind: 'worry', look: [1, 0], hair: 'tuft', k: 0.4 }); stetho(L, D, S.at('training') - 0.2);
  L.person(x + 680, y + 1000, 1.5, S.at('patients') - 0.4, { pose: 'sit', kind: 'content', look: [-1, 0], hair: 'bun', dir: -1, k: 0.4 });
  L.bubble(x + 120, y + 460, 340, 90, S.at('frauds') - 0.6, { text: 'fraud?', size: 44, thought: true, tail: [D.head[0], D.head[1] - 50] });
  L.TXT('who feels like a fraud?', x + 450, y + 120, 52, { f: 'KB', align: 'center' }, S.at('measured') - 0.2, 0.5);
});
def(SHORT, 's2', sblk(1), { purpose: 'who: Basima Tewfik (MIT); measured impostor thoughts per doctor', shot: 'pan right; name card, then a row of doctors each with a small meter above the head filling to different levels; push on the fullest meter', sfx: 'pen; three rising plucks' }, (S, L) => {
  const [x, y] = sblk(1);
  card(L, x + 80, y + 80, 740, 150, S.at('tewfik') - 0.4, { lines: [['Basima Tewfik · MIT', 50]] });
  [0.3, 0.9, 0.6].forEach((v, i) => { const P = L.person(x + 180 + i * 270, y + 900, 1.2, S.at('doctor') - 0.5 + i * 0.12, { kind: v > 0.8 ? 'worry' : 'neutral', look: [0, -0.5], hair: ['tuft', 'long', 'cap'][i], k: 0.3 }); stetho(L, P, S.at('doctor') - 0.2 + i * 0.12); thermo(L, x + 180 + i * 270, y + 560, 180, v, S.at('impostor') - 0.3 + i * 0.1); });
  L.TXT('impostor thoughts', x + 450, y + 300, 50, { f: 'KB', align: 'center' }, S.at('thoughts') - 0.3, 0.4);
  L.TXT('"not as good as people think"', x + 450, y + 1060, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('good') - 0.4, 0.6);
});
def(SHORT, 's3', sblk(2), { purpose: 'result: patients rated the high-impostor doctors more empathetic and better listeners', shot: 'pan right; a patient holds a rating card, stars fill beside the doctor with the full meter; two ticks; push on the stars', sfx: 'star plings; two ticks' }, (S, L) => {
  const [x, y] = sblk(2);
  const Pt = L.person(x + 650, y + 900, 1.5, S.at('patients') - 0.5, { pose: 'hold', kind: 'content', look: [-1, 0], hair: 'bun', k: 0.4 });
  const D = L.person(x + 230, y + 900, 1.5, S.at('more') - 0.6, { kind: 'worry', look: [1, 0], hair: 'long', k: 0.4 }); stetho(L, D, S.at('more') - 0.3);
  for (let i = 0; i < 5; i++) star(L, x + 230 + i * 110, y + 200, 40, S.at('rated') + i * 0.08);
  L.check(x + 120, y + 380, 2, S.at('empathetic') - 0.2); L.TXT('more empathetic', x + 170, y + 400, 50, { f: 'KB' }, S.at('empathetic') - 0.3, 0.4);
  L.check(x + 120, y + 480, 2, S.at('listeners') - 0.2); L.TXT('better listeners', x + 170, y + 500, 50, { f: 'KB' }, S.at('listeners') - 0.3, 0.4);
});
def(SHORT, 's4', sblk(3), { purpose: 'why: more eye contact and nodding; unsure → focus on the patient', shot: 'pan right; big two-shot faces, a dotted gaze line and nod marks; the attention arrow points out from the doctor to the patient; push on the arrow', sfx: 'two soft taps; a whoosh outward' }, (S, L) => {
  const [x, y] = sblk(3);
  const D = L.head(x + 220, y + 420, 120, S.t0, { kind: 'smile', look: [1, 0], hair: 'tuft', k: 0.4 });
  L.head(x + 680, y + 420, 120, S.t0 + 0.1, { kind: 'content', look: [-1, 0], hair: 'bun', k: 0.4 });
  gaze(L, [x + 300, y + 400], [x + 600, y + 400], S.at('eye') - 0.2); L.TXT('eye contact', x + 450, y + 240, 48, { f: 'KB', align: 'center' }, S.at('contact') - 0.2, 0.3);
  nod(L, x + 320, y + 500, 1.6, S.at('nodded') - 0.2); L.TXT('nods', x + 300, y + 650, 44, { f: 'KB', align: 'center' }, S.at('nodded'), 0.2);
  L.inkArrow([[x + 200, y + 800], [x + 700, y + 800]], { w: 6 }, S.at('focus') - 0.4, 0.3);
  L.TXT('focus on the patient', x + 450, y + 900, 52, { f: 'KB', align: 'center' }, S.at('patient') - 0.4, 0.4);
});
def(SHORT, 's5', sblk(4), { purpose: 'caveat + lesson: don\'t wish for it (lower self-esteem); feeling like a fraud ≠ being one', shot: 'pan right; the self-esteem gauge drops; then FEELING ≠ BEING cards; push on the ≠', sfx: 'a falling slide; a firm tap' }, (S, L) => {
  const [x, y] = sblk(4);
  const g = gauge(L, x + 450, y + 380, 230, S.at('wish') - 0.6, { v: 0.75, lo: 'low', hi: 'high', label: 'self-esteem' }); g.needle(0.2, S.at('lowered') + 0.1);
  L.TXT("don't wish for it", x + 450, y + 90, 54, { f: 'KB', align: 'center' }, S.at('wish') - 0.3, 0.4);
  card(L, x + 60, y + 600, 340, 220, S.at('feeling') - 0.4, { lines: [['feeling', 36, 'PH'], ['a fraud', 46]] });
  card(L, x + 500, y + 600, 340, 220, S.at('evidence') - 0.4, { lines: [['being', 36, 'PH'], ['a fraud', 46]] });
  L.TXT('≠', x + 450, y + 740, 110, { f: 'KB', align: 'center' }, S.at('evidence') - 0.1, 0.2);
});
def(SHORT, 's6', sblk(5), { purpose: 'loop back to the hook: the doctor behind the camera\'s gaze; "they\'ll find out" → "someone who listens"', shot: 'pan right; the same camera and REC light; the doctor\'s thought bubble changes from "fraud?" to a listening ear; push on the ear', sfx: 'the camera beep again (loop); a warm pluck' }, (S, L) => {
  const [x, y] = sblk(5);
  const cam = L.rrect(x + 110, y + 160, 180, 120, 14); L.FILL(cam, S.t0); L.MRK([cam], { col: L.GRY2, w: 10 }, S.t0 + 0.05, 0.05); L.INK_(cam, { closed: true, w: 3, amp: 0.2 }, S.t0, 0.1);
  const rd = L.ell(x + 140, y + 185, 10, 10, 0, L.TAU, 12); L.MRK([rd], { col: L.YELD, w: 10, edge: false }, S.t0 + 0.1, 0.04);
  const D = L.person(x + 450, y + 1000, 1.8, S.t0 + 0.1, { kind: 'content', look: [0, 0], hair: 'tuft', k: 0.4 }); stetho(L, D, S.t0 + 0.3);
  L.bubble(x + 420, y + 160, 400, 90, S.at('voice') - 0.3, { text: "they'll find out", size: 40, shadow: false, tint: 'rgba(150,150,150,0.18)' });
  ear(L, x + 450, y + 470, 1.8, S.at('listens') - 0.5);
  L.TXT('someone who listens', x + 450, y + 680, 56, { f: 'KB', align: 'center' }, S.at('listens') - 0.3, 0.4);
});
def(SHORT, 's7', sblk(6), { purpose: 'one comment question', shot: 'pan right; hold on the question bubble', sfx: 'pen; closing kalimba' }, (S, L) => {
  const [x, y] = sblk(6);
  L.head(x + 450, y + 230, 90, S.t0 + 0.05, { you: true, kind: 'think', look: [0, 0.3], hair: 'tuft', k: 0.5 });
  L.bubble(x + 60, y + 400, 780, 320, S.t0 + 0.2, { tint: 'rgba(255,205,40,0.25)', tail: [x + 450, y + 330] });
  L.TXT('where does it hit you most?', x + 450, y + 520, 46, { f: 'KB', align: 'center' }, S.at('most') - 0.4, 0.5);
  L.TXT('school · work · somewhere else', x + 450, y + 620, 42, { f: 'KB', align: 'center' }, S.at('school') - 0.3, 0.6);
});

export default { long: { scenes: LONG }, short: { scenes: SHORT } };
