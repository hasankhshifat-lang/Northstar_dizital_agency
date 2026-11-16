// The Overthinking Pad: drawing library (notebook doodle look, built on the lemo-opuscar Sketchnote engine, MIT).
// Pen (fineliner), grey marker in three strengths, one yellow; hand lettering written along glyph skeletons.
// Every element is registered on a stroke timeline (addEl) with a fixed seed; only the pen wobble boils (on twos).
// The channel's doodle vocabulary (people with faces that react, rooms, bubbles, bars, icons) lives at the bottom.
export const FPS = 24;
export const G = { W: 1920, H: 1080, ctx: null, octx: null, OC: null, GLY: null };

// ---------- palette (fixed for the channel) ----------
export const PL = { paper: '#fbfaf6', ink: [30, 30, 34], ink2: '#5b5852', acc: [255, 205, 40], accA: 0.80, accD: [245, 170, 0], accS: [232, 140, 0],
  shd: [100, 100, 110], shd2: [80, 80, 92], shd3: [52, 52, 64], dot: [150, 144, 132] };
export const rgba = (c, a) => `rgba(${c.map(v => Math.round(v)).join(',')},${a})`;
const hex = c => '#' + c.map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
export const PAPER = PL.paper, DOT = rgba(PL.dot, 0.55), INK = hex(PL.ink), INK2 = PL.ink2;
export const YEL = rgba(PL.acc, PL.accA), YELD = rgba(PL.accD, 0.95), YELS = rgba(PL.accS, 0.22);
export const GRY = rgba(PL.shd, 0.16), GRY2 = rgba(PL.shd2, 0.28), GRYD = rgba(PL.shd3, 0.45);
export const INKM = a => rgba(PL.ink, a);
export const TAU = Math.PI * 2;

// ---------- seeded randomness ----------
export const R = { SEED: 1, BOIL: 0 };
export function rnd() { let s = R.SEED | 0; s = s + 0x6D2B79F5 | 0; R.SEED = s; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
export const rr = (a, b) => a + (b - a) * rnd();
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const eio = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
export const eo = t => 1 - Math.pow(1 - clamp(t), 3);
export const e5 = t => { t = clamp(t); return t < .5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2; };
const BO = [0, 1, -0.8];

// ---------- geometry ----------
export function resample(pts, step = 3) {
  const out = [pts[0].slice()];
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / step));
    for (let k = 1; k <= n; k++) out.push([x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n]);
  }
  return out;
}
export function plen(pts) { let s = 0; for (let i = 1; i < pts.length; i++) s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return s; }
function noiseFn(amp) {
  const ks = [[amp, rr(0.003, 0.008), rr(0, TAU), rr(0.35, 0.7)], [amp * 0.5, rr(0.012, 0.022), rr(0, TAU), rr(0.35, 0.7)], [amp * 0.22, rr(0.035, 0.06), rr(0, TAU), rr(0.35, 0.7)]];
  const b = BO[R.BOIL];
  return s => ks.reduce((a, [A, f, p, d]) => a + A * Math.sin(f * s + p + d * b), 0);
}
export function jitter(pts, amp) {
  const P = resample(pts, 3), n = noiseFn(amp), out = []; let s = 0;
  for (let i = 0; i < P.length; i++) {
    if (i) s += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
    const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1]; const L = Math.hypot(tx, ty) || 1; tx /= L; ty /= L;
    const d = n(s); out.push([P[i][0] - ty * d, P[i][1] + tx * d]);
  }
  return out;
}
export const line = (x1, y1, x2, y2) => [[x1, y1], [x2, y2]];
export function ell(cx, cy, rx, ry, a0 = 0, a1 = TAU, n = 60, rot = 0) { const p = [], c = Math.cos(rot), s = Math.sin(rot); for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n, x = rx * Math.cos(a), y = ry * Math.sin(a); p.push([cx + x * c - y * s, cy + x * s + y * c]); } return p; }
export function rrect(x, y, w, h, r) {
  const p = []; r = Math.min(r, w / 2, h / 2);
  const arc = (cx, cy, a0) => { for (let i = 0; i <= 8; i++) { const a = a0 + Math.PI / 2 * i / 8; p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } };
  arc(x + w - r, y + r, -Math.PI / 2); arc(x + w - r, y + h - r, 0); arc(x + r, y + h - r, Math.PI / 2); arc(x + r, y + r, Math.PI);
  return p;
}
export function bez(p0, p1, p2, p3, n = 30) { const o = []; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; o.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]); } return o; }
export function quad(p0, p1, p2, n = 24) { const o = []; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; o.push([u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]]); } return o; }
export const shift = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy]);
export function pathOf(pts, close = true) { const p = new Path2D(); p.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]); if (close) p.closePath(); return p; }
export function bbox(pts) { let a = 1e9, b = 1e9, c = -1e9, d = -1e9; for (const [x, y] of pts) { a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); } return [a, b, c, d]; }

// ---------- pen ----------
export function inkDraw(pts, o, prog) {
  const ctx = G.ctx;
  let { w = 3, amp = 1.5, passes = 2, col = INK, closed = false, alpha = 1, dash = null } = o;
  w *= 1.2; let base;
  if (closed) {
    base = resample(pts.concat([pts[0]]), 3);
    const st = Math.floor(rr(0, base.length)); base = base.slice(st).concat(base.slice(1, st + 1));
    base = base.concat(base.slice(1, 2 + Math.floor(base.length * rr(0.02, 0.05))));
  } else base = resample(pts, 3);
  ctx.save(); ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (let p = 0; p < passes; p++) {
    const P = jitter(base, amp * (p ? 1.4 : 1)); const n = Math.max(2, Math.floor(P.length * prog));
    const wn = noiseFn(0.22); ctx.globalAlpha = alpha * (p ? 0.5 : 0.94);
    let s = 0;
    for (let i = 0; i < n - 1; i += 6) {
      let on = true;
      if (dash) on = (s % (dash[0] + dash[1])) < dash[0];
      const end = Math.min(n - 1, i + 6);
      for (let j = i + 1; j <= end; j++) s += Math.hypot(P[j][0] - P[j - 1][0], P[j][1] - P[j - 1][1]);
      if (!on) continue;
      ctx.beginPath(); ctx.moveTo(P[i][0], P[i][1]); for (let j = i + 1; j <= end; j++) ctx.lineTo(P[j][0], P[j][1]);
      ctx.lineWidth = w * (p ? 0.62 : 1) * (1 + wn(i * 3)); ctx.stroke();
    }
  }
  ctx.restore();
}
export function markerDraw(clips, o, prog) {
  const ctx = G.ctx;
  const { col = GRY, w = 18, ang = -0.55, gap = 0.62, amp = 2.2, edge = true, op = 'multiply' } = o;
  const region = jitter(clips[0].concat([clips[0][0]]), amp);
  const [x0, y0, x1, y1] = bbox(region), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, Rr = Math.hypot(x1 - x0, y1 - y0) / 2 + w;
  const strokes = []; for (let o2 = -Rr; o2 < Rr; o2 += w * gap * rr(0.85, 1.15)) strokes.push([o2, w * rr(0.9, 1.08), rr(-4, 4), rr(-6, 6), rr(-6, 6), rr(-2, 2)]);
  ctx.save();
  ctx.clip(pathOf(region));
  if (clips.length > 1) { const p = pathOf(region); for (let i = 1; i < clips.length; i++) p.addPath(pathOf(clips[i])); ctx.clip(p, 'evenodd'); }
  ctx.globalCompositeOperation = op; ctx.strokeStyle = col; ctx.lineCap = 'round';
  ctx.translate(cx, cy); ctx.rotate(ang);
  const stop = -Rr + 2 * Rr * prog;
  for (const [o2, lw, bow, a, b, c] of strokes) {
    if (o2 >= stop) break;
    ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(-Rr + a, o2); ctx.quadraticCurveTo(0, o2 + bow, Rr + b, o2 + c); ctx.stroke();
  }
  ctx.restore();
  if (edge && prog >= 1) { ctx.save(); ctx.clip(pathOf(region)); ctx.globalCompositeOperation = 'multiply'; ctx.strokeStyle = col; ctx.globalAlpha = 0.45; ctx.lineWidth = 4; ctx.stroke(pathOf(region)); ctx.restore(); }
}
export function mstrokeDraw(pts, o, prog) {
  const ctx = G.ctx;
  const { col = YEL, w = 8, amp = 1 } = o; const P = jitter(pts, amp); const n = Math.max(2, Math.ceil(P.length * prog));
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.stroke(pathOf(P.slice(0, n), false)); ctx.restore();
}

// ---------- hand lettering ----------
export function textLayout(s, x, y, size, o = {}) {
  const ctx = G.ctx;
  const { f = 'PH', align = 'left', jit = 1, sp = 0.98, rot = 0 } = o;
  ctx.save(); ctx.font = `${size}px ${f}`;
  const ch = [...s], ws = ch.map(c => ctx.measureText(c).width * sp); ctx.restore();
  const tot = ws.reduce((a, b) => a + b, 0);
  let cx = align === 'center' ? -tot / 2 : align === 'right' ? -tot : 0;
  const Gf = G.GLY[f] || G.GLY.KB, chars = []; let L = 0;
  ch.forEach((c, i) => {
    const dy = rr(-1, 1) * jit * size * 0.03, r = rr(-1, 1) * jit * 0.045, k = rr(-1, 1);
    const sk = (Gf.g[c] || []).map(a => { const P = []; for (let j = 0; j < a.length; j += 2) P.push([a[j] * size, a[j + 1] * size]); return P; });
    const lens = sk.map(plen); const len = lens.reduce((a, b) => a + b, 0) + sk.length * size * 0.12;
    chars.push({ c, ox: cx, dy, r, sk, lens, len, L0: L }); L += len;
    cx += ws[i] * (1 + k * 0.02);
  });
  return { s, x, y, size, f, rot, chars, L, hw: Gf.hw * size, tot, col: o.col || INK, align };
}
export function textDraw(T, prog) {
  const ctx = G.ctx, octx = G.octx, W = G.W, H = G.H;
  const target = prog * T.L;
  ctx.save(); ctx.translate(T.x, T.y); ctx.rotate(T.rot);
  ctx.font = `${T.size}px ${T.f}`; ctx.fillStyle = T.col; ctx.textBaseline = 'alphabetic';
  for (const C of T.chars) {
    if (C.L0 >= target) break;
    const part = target - C.L0;
    ctx.save(); ctx.translate(C.ox, C.dy); ctx.rotate(C.r);
    if (part >= C.len || !C.sk.length) { ctx.fillText(C.c, 0, 0); ctx.restore(); continue; }
    const m = ctx.getTransform();
    octx.setTransform(1, 0, 0, 1, 0, 0); octx.clearRect(0, 0, W, H);
    octx.setTransform(m); octx.font = ctx.font; octx.fillStyle = T.col; octx.textBaseline = 'alphabetic';
    octx.fillText(C.c, 0, 0);
    octx.globalCompositeOperation = 'destination-in'; octx.lineCap = 'round'; octx.lineJoin = 'round'; octx.lineWidth = T.hw * 2.9 + 1.5; octx.strokeStyle = '#000';
    let left = part;
    octx.beginPath();
    for (let k = 0; k < C.sk.length && left > 0; k++) {
      const P = C.sk[k]; octx.moveTo(P[0][0], P[0][1]); if (P.length === 1) octx.lineTo(P[0][0] + 0.1, P[0][1]);
      for (let j = 1; j < P.length && left > 0; j++) {
        const d = Math.hypot(P[j][0] - P[j - 1][0], P[j][1] - P[j - 1][1]);
        if (d <= left) { octx.lineTo(P[j][0], P[j][1]); left -= d; }
        else { const u = left / d; octx.lineTo(P[j - 1][0] + (P[j][0] - P[j - 1][0]) * u, P[j - 1][1] + (P[j][1] - P[j - 1][1]) * u); left = 0; }
      }
      left -= T.size * 0.12;
    }
    octx.stroke(); octx.globalCompositeOperation = 'source-over';
    ctx.restore(); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(G.OC, 0, 0); ctx.restore();
  }
  ctx.restore();
}

// ---------- stroke timeline ----------
// EL: every pen/marker action. bb = world bounding box (for culling); until = time the element is covered for good
export const EL = [], PAGE_TEXTS = [];
let BSEED = 1000;
export const TS = { k: 1, o: 0 };   // time scaling for a part (slow())
export function addEl(t0, d, kind, draw, bb, extra = {}) {
  if (TS.k !== 1) { t0 = TS.o + (t0 - TS.o) * TS.k; d *= TS.k; }
  EL.push({ t0, d: Math.max(d, 1 / FPS), kind, draw, seed: (BSEED += 7919), bb, ...extra }); return t0 + d;
}
export function slow(o, k, fn) { const p = { ...TS }; TS.o = o; TS.k = k; const r = fn(); TS.o = p.o; TS.k = p.k; return r; }
const pad = (b, m) => [b[0] - m, b[1] - m, b[2] + m, b[3] + m];
export const INK_ = (pts, o, t0, d) => addEl(t0, d, 'pen', p => inkDraw(pts, o, p), pad(bbox(pts), 12));
export const MRK = (clips, o, t0, d) => addEl(t0, d, 'marker', p => markerDraw(clips, o, p), pad(bbox(clips[0]), 14));
export const MST = (pts, o, t0, d) => addEl(t0, d, 'marker', p => mstrokeDraw(pts, o, p), pad(bbox(pts), (o.w || 8) + 4));
export const FILL = (pts, t0, col = PAPER) => addEl(t0, 0, 'fill', () => { const c = G.ctx; c.save(); c.fillStyle = col; c.fill(pathOf(pts)); c.restore(); }, pad(bbox(pts), 4));
export function TXT(s, x, y, size, o = {}, t0 = 0, d = null) {
  const T = textLayout(s, x, y, size, o);
  const x0 = x + T.chars[0].ox, bb = [x0 - 10, y - size * 1.0, x0 + T.tot + 10, y + size * 0.4];
  const dd = d == null ? T.L / (o.cps || 1800) : d;
  const end = addEl(t0, dd, 'write', p => textDraw(T, p), bb);
  PAGE_TEXTS.push({ T, t0: EL[EL.length - 1].t0, bb, pass: !!o.pass });
  return end;
}
// draw over an area with paper (a pen "redraw": the old drawing is covered, the new one drawn on top)
export const COVER = (pts, t0) => FILL(pts, t0);

// ---------- composite parts ----------
export function dropShadow(pts, dx, dy, t0, d = 0.12, o = {}) { MRK([shift(pts, dx, dy), pts], { col: GRY2, w: 12, ...o }, t0, d); }
export function box(x, y, w, h, t0, d = 0.32, o = {}) {
  const p = rrect(x, y, w, h, o.r ?? 28);
  if (o.fill !== false) FILL(p, t0);
  if (o.shadow !== false) dropShadow(p, 9, 10, t0 + d * 0.9);
  if (o.tint) MRK([p], { col: o.tint, w: 18 }, t0 + d * 0.8, d * 0.6);
  return INK_(p, { closed: true, w: o.w || 3.2, amp: 1.6, dash: o.dash || null }, t0, d) + 0.12;
}
export function ribbon(cx, cy, w, h, label, size, t0, o = {}) {
  const { fill = YEL, arc = 3, f = 'KB', d = 0.3 } = o;
  const dy = h * 0.34, tl = h * 0.95;
  for (const sd of [-1, 1]) {
    const xe = cx + sd * w / 2;
    const tp = [[xe - sd * h * 0.4, cy - h / 2 + dy], [xe + sd * tl, cy - h / 2 + dy], [xe + sd * (tl - h * 0.36), cy + dy], [xe + sd * tl, cy + h / 2 + dy], [xe - sd * h * 0.4, cy + h / 2 + dy]];
    FILL(tp, t0 + d * 0.5); MRK([tp], { col: GRY2, w: 14, ang: 0.9 }, t0 + d * 0.7, d * 0.3);
    INK_(tp, { closed: true, w: 2.8, amp: 0.9 }, t0 + d * 0.5, d * 0.35);
    const fold = [[xe, cy + h / 2 - 2], [xe, cy + h / 2 + dy], [xe - sd * h * 0.4, cy + h / 2 + dy]];
    MRK([fold], { col: GRYD, w: 8, edge: false }, t0 + d * 0.8, d * 0.2);
  }
  const body = []; const N = 40;
  for (let i = 0; i <= N; i++) { const u = i / N; body.push([cx - w / 2 + w * u, cy - h / 2 - arc * Math.sin(Math.PI * u)]); }
  for (let i = N; i >= 0; i--) { const u = i / N; body.push([cx - w / 2 + w * u, cy + h / 2 - arc * Math.sin(Math.PI * u)]); }
  FILL(body, t0);
  if (fill) MRK([body], { col: fill, w: 20 }, t0 + d * 0.55, d * 0.45);
  INK_(body, { closed: true, w: 3.2, amp: 1 }, t0, d * 0.6);
  let end = t0 + d;
  if (label) end = TXT(label, cx, cy + size * 0.36 - arc, size, { f, align: 'center', jit: 0.7 }, t0 + d * 0.8, o.td);
  return end;
}
export function fatArrow(x1, y, x2, t0, o = {}) {
  const h = o.h || 30, hh = o.hh || 36, hl = o.hl || 36, d = o.d || 0.22, sd = Math.sign(x2 - x1) || 1;
  const p = [[x1, y - h / 2], [x2 - sd * hl, y - h / 2 - 2], [x2 - sd * hl + sd * 2, y - hh], [x2, y], [x2 - sd * hl + sd * 2, y + hh], [x2 - sd * hl, y + h / 2 + 2], [x1, y + h / 2]];
  dropShadow(p, 5, 6, t0 + d, 0.08, { w: 10 });
  FILL(p, t0); MRK([p], { col: o.col || YEL, w: 14 }, t0 + d * 0.6, d * 0.5);
  return INK_(p, { closed: true, w: 3, amp: 0.9 }, t0, d * 0.7) + d * 0.4;
}
export function arrowHead(x, y, ang, s, o, t0, d = 0.05) {
  return INK_([[x + Math.cos(ang + 2.6) * s, y + Math.sin(ang + 2.6) * s], [x, y], [x + Math.cos(ang - 2.6) * s, y + Math.sin(ang - 2.6) * s]], { w: 3, amp: 0.5, passes: 1, ...o }, t0, d);
}
export function inkArrow(pts, o, t0, d) {
  const P = resample(pts, 3); const e = INK_(P, o, t0, d);
  const a = P[P.length - 1], b = P[Math.max(0, P.length - 6)];
  return arrowHead(a[0], a[1], Math.atan2(a[1] - b[1], a[0] - b[0]), o.head || 14, { w: o.w || 3 }, e);
}
export function sparks(cx, cy, r1, r2, angs, t0, d = 0.12, col = YELD) {
  angs.forEach((a, i) => MST(line(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, cx + Math.cos(a) * r2, cy + Math.sin(a) * r2), { w: 6, col }, t0 + i * d * 0.25, d * 0.5));
  return t0 + d;
}
export function swash(x1, y, x2, t0, d = 0.25, o = {}) { return MST(bez([x1, y + 4], [x1 + (x2 - x1) * 0.3, y - 6], [x1 + (x2 - x1) * 0.7, y + 8], [x2, y - 2]), { w: o.w || 22, col: o.col || YEL, amp: 1.5 }, t0, d); }
export function loop(cx, cy, rx, ry, t0, d = 0.4, o = {}) { return MST(ell(cx, cy, rx, ry, -0.4, TAU + 0.5, 70, o.rot || -0.06), { w: o.w || 6, col: o.col || YELD, amp: 2 }, t0, d); }
export function underline(x1, y, x2, t0, d = 0.2, o = {}) { return INK_(bez([x1, y], [x1 + (x2 - x1) * 0.35, y + 4], [x1 + (x2 - x1) * 0.7, y - 3], [x2, y + 2]), { w: o.w || 3, amp: 0.8 }, t0, d); }

// ---------- doodle vocabulary ----------
// face kinds: neutral, smile, grin, worry, shock, sad, bored, think, side (eyes closed / content), proud
// look: [dx, dy] in -1..1, where the pupils point
export function face(cx, cy, r, t0, o = {}) {
  const { kind = 'neutral', look = [0, 0], k = 1, sweat = false, blush = false } = o;
  const ex = r * 0.36, ey = r * -0.08, er = r * 0.16, lx = look[0] * er * 0.45, ly = look[1] * er * 0.45;
  let t = t0;
  if (kind === 'side' || kind === 'content') {
    for (const sd of [-1, 1]) INK_(ell(cx + sd * ex, cy + ey + er * 0.2, er * 0.9, er * 0.6, Math.PI * 1.1, Math.PI * 1.9, 12), { w: 2.6, amp: 0.25, passes: 1 }, t, 0.05 * k);
  } else {
    const big = kind === 'shock' ? 1.35 : 1;
    for (const sd of [-1, 1]) {
      const e = ell(cx + sd * ex, cy + ey, er * big, er * big * 1.1, 0, TAU, 20);
      FILL(e, t); INK_(e, { closed: true, w: 2.2, amp: 0.2, passes: 1 }, t, 0.05 * k);
      const pu = ell(cx + sd * ex + lx * big, cy + ey + ly * big + er * 0.1, er * 0.48, er * 0.52, 0, TAU, 14);
      MRK([pu], { col: INKM(0.92), w: 5, edge: false, op: 'source-over', amp: 0.2 }, t + 0.05 * k, 0.03);
    }
  }
  t += 0.1 * k;
  const bw = r * 0.22, by = cy + ey - er * 1.7;
  const brow = { neutral: [0, 0], smile: [0, -0.1], grin: [0, -0.15], worry: [0.35, 0], shock: [0, -0.45], sad: [0.4, 0.1], bored: [-0.1, 0.25], think: [-0.25, -0.1], side: [0, -0.1], content: [0, -0.1], proud: [-0.15, -0.1], angry: [-0.45, 0.15] }[kind] || [0, 0];
  for (const sd of [-1, 1]) {
    const x0 = cx + sd * ex - bw * 0.6, x1 = cx + sd * ex + bw * 0.6;
    const yin = by + brow[1] * r * 0.3 - brow[0] * r * 0.12, yout = by + brow[1] * r * 0.3 + brow[0] * r * 0.12;
    const pin = sd < 0 ? [x1, yin] : [x0, yin], pout = sd < 0 ? [x0, yout] : [x1, yout];
    INK_([pout, pin], { w: 2.6, amp: 0.2, passes: 1 }, t, 0.04 * k);
  }
  t += 0.06 * k;
  const my = cy + r * 0.42, mw = r * 0.34;
  let m;
  if (kind === 'smile' || kind === 'content' || kind === 'proud') m = quad([cx - mw, my - r * 0.04], [cx, my + r * 0.2], [cx + mw, my - r * 0.04]);
  else if (kind === 'grin') { m = quad([cx - mw * 1.1, my - r * 0.08], [cx, my + r * 0.34], [cx + mw * 1.1, my - r * 0.08]); m = m.concat([[cx - mw * 1.1, my - r * 0.08]]); }
  else if (kind === 'worry') m = bez([cx - mw, my + r * 0.04], [cx - mw * 0.4, my - r * 0.06], [cx + mw * 0.3, my + r * 0.08], [cx + mw, my - r * 0.02]);
  else if (kind === 'shock') m = ell(cx, my + r * 0.04, r * 0.14, r * 0.18, 0, TAU, 20);
  else if (kind === 'sad' || kind === 'angry') m = quad([cx - mw, my + r * 0.1], [cx, my - r * 0.12], [cx + mw, my + r * 0.1]);
  else if (kind === 'bored') m = line(cx - mw * 0.8, my + r * 0.02, cx + mw * 0.6, my);
  else if (kind === 'think') m = line(cx - mw * 0.2, my + r * 0.02, cx + mw * 0.7, my - r * 0.06);
  else m = line(cx - mw * 0.7, my, cx + mw * 0.7, my + r * 0.02);
  if (kind === 'shock') { MRK([m], { col: INKM(0.85), w: 5, edge: false, op: 'source-over', amp: 0.2 }, t + 0.05, 0.04); }
  INK_(m, { w: 2.6, amp: 0.25, passes: 1, closed: kind === 'shock' }, t, 0.06 * k);
  t += 0.07 * k;
  if (sweat) { const sx = cx + r * 0.85, sy = cy - r * 0.55, d = [[sx, sy - r * 0.2], [sx + r * 0.1, sy + r * 0.02], [sx, sy + r * 0.1], [sx - r * 0.1, sy + r * 0.02]]; const dr = bez(d[0], [sx + r * 0.16, sy], [sx + r * 0.1, sy + r * 0.14], [sx, sy + r * 0.12], 10).concat(bez([sx, sy + r * 0.12], [sx - r * 0.1, sy + r * 0.14], [sx - r * 0.16, sy], d[0], 10)); FILL(dr, t); MRK([dr], { col: GRY, w: 6 }, t, 0.04); INK_(dr, { closed: true, w: 2, amp: 0.2, passes: 1 }, t, 0.06 * k); t += 0.06 * k; }
  if (blush) for (const sd of [-1, 1]) MRK([ell(cx + sd * r * 0.55, cy + r * 0.22, r * 0.16, r * 0.09)], { col: GRY2, w: 6, edge: false }, t, 0.05);
  return t;
}
// a head (circle, simple hair) with a face. hair: 'none'|'tuft'|'bun'|'long'|'cap'|'curly'|'messy'
export function head(cx, cy, r, t0, o = {}) {
  const { k = 1, hair = 'tuft', you = false } = o;
  const hc = ell(cx, cy, r, r * 1.04, 0, TAU, 48);
  FILL(hc, t0);
  dropShadow(hc, r * 0.12, r * 0.14, t0 + 0.16 * k, 0.06);
  INK_(hc, { closed: true, w: 3, amp: 0.7 }, t0, 0.14 * k);
  let t = t0 + 0.12 * k;
  if (hair === 'tuft') INK_(bez([cx - r * 0.25, cy - r * 0.98], [cx - r * 0.1, cy - r * 1.3], [cx + r * 0.1, cy - r * 1.25], [cx + r * 0.05, cy - r * 1.02]), { w: 2.6, amp: 0.3, passes: 1 }, t, 0.05 * k);
  else if (hair === 'bun') { const b = ell(cx + r * 0.1, cy - r * 1.12, r * 0.32, r * 0.26); FILL(b, t); MRK([b], { col: GRY2, w: 8 }, t + 0.03, 0.05); INK_(b, { closed: true, w: 2.6, amp: 0.3, passes: 1 }, t, 0.05 * k); }
  else if (hair === 'long') { const hp = ell(cx, cy - r * 0.15, r * 1.08, r * 1.0, Math.PI * 0.95, Math.PI * 2.05, 30); INK_(hp, { w: 2.8, amp: 0.4, passes: 1 }, t, 0.07 * k); INK_(line(cx - r * 1.07, cy - r * 0.1, cx - r * 1.0, cy + r * 0.85), { w: 2.6, amp: 0.4, passes: 1 }, t + 0.05 * k, 0.04 * k); INK_(line(cx + r * 1.07, cy - r * 0.1, cx + r * 1.0, cy + r * 0.85), { w: 2.6, amp: 0.4, passes: 1 }, t + 0.06 * k, 0.04 * k); MRK([hp.concat([[cx + r * 0.6, cy - r * 0.6], [cx - r * 0.6, cy - r * 0.6]])], { col: GRY2, w: 8, edge: false }, t + 0.08 * k, 0.05); }
  else if (hair === 'cap') { const c = ell(cx, cy - r * 0.35, r * 1.02, r * 0.75, Math.PI, TAU, 24); c.push([cx + r * 1.5, cy - r * 0.35]); FILL(c, t); MRK([c], { col: GRY2, w: 8 }, t + 0.04, 0.05); INK_(c, { closed: true, w: 2.6, amp: 0.3, passes: 1 }, t, 0.06 * k); }
  else if (hair === 'curly') { for (let i = 0; i < 6; i++) { const a = Math.PI * (1.1 + i * 0.16); INK_(ell(cx + Math.cos(a) * r * 0.95, cy + Math.sin(a) * r * 0.95, r * 0.2, r * 0.2, 0, TAU, 12), { w: 2.2, amp: 0.2, passes: 1 }, t + i * 0.01, 0.03 * k); } }
  else if (hair === 'messy') { for (let i = 0; i < 7; i++) { const a = Math.PI * (1.15 + i * 0.12), x0 = cx + Math.cos(a) * r * 0.95, y0 = cy + Math.sin(a) * r * 0.95; INK_(quad([x0, y0], [x0 + Math.cos(a + 0.6) * r * 0.25, y0 + Math.sin(a + 0.6) * r * 0.35], [x0 + Math.cos(a - 0.3) * r * 0.42, y0 + Math.sin(a - 0.3) * r * 0.42]), { w: 2.4, amp: 0.3, passes: 1 }, t + i * 0.012, 0.03 * k); } }
  t += 0.07 * k;
  if (you) MRK([hc], { col: YEL, w: 14 }, t, 0.1 * k);
  return face(cx, cy + r * 0.05, r, t, o);
}
// a standing / walking / sitting person; returns {end, head:[x,y,r], hand:[[x,y],[x,y]]}
// pose: stand | walk | sit | wave | point | shrug | arms_up | hold (hands in front at chest height)
export function person(x, y, s, t0, o = {}) {
  const { k = 1, pose = 'stand', you = false, shirt = null, dir = 1 } = o;
  const r = 34 * s, hx = x, hy = y - 168 * s;               // y = feet line
  const neck = [x, hy + r * 1.02], hip = [x, y - 72 * s];
  // torso: a rounded bean
  const tw = 30 * s, tt = hy + r * 1.05, tb = hip[1] + 6 * s;
  const torso = bez([x - tw * 0.8, tt + 6 * s], [x - tw * 1.25, tt + 40 * s], [x - tw * 1.1, tb - 6 * s], [x - tw * 0.85, tb]).concat(bez([x + tw * 0.85, tb], [x + tw * 1.1, tb - 6 * s], [x + tw * 1.25, tt + 40 * s], [x + tw * 0.8, tt + 6 * s]));
  let t = t0;
  // legs first (behind), then the torso over them
  const leg = (fx, kx) => INK_(quad([x + kx * 0.3, hip[1]], [x + kx, (hip[1] + y) / 2], [fx, y]), { w: 3.2, amp: 0.4, passes: 1 }, t, 0.06 * k);
  if (pose === 'sit') {
    INK_([[x - 10 * s, hip[1]], [x + 34 * s * dir, hip[1] + 4 * s], [x + 36 * s * dir, y]], { w: 3.2, amp: 0.4, passes: 1 }, t, 0.07 * k);
    INK_([[x + 6 * s, hip[1]], [x + 46 * s * dir, hip[1] + 2 * s], [x + 50 * s * dir, y]], { w: 3.2, amp: 0.4, passes: 1 }, t + 0.02, 0.07 * k);
  } else if (pose === 'walk') { leg(x - 26 * s * dir, -12 * s * dir); leg(x + 30 * s * dir, 18 * s * dir); }
  else { leg(x - 12 * s, -8 * s); leg(x + 12 * s, 8 * s); }
  t += 0.07 * k;
  const tor = torso.concat([torso[0]]);
  FILL(tor, t); MRK([tor], { col: you ? YEL : GRY, w: 14 }, t + 0.1 * k, 0.08 * k);
  dropShadow(tor, 6 * s, 7 * s, t + 0.14 * k, 0.05);
  INK_(tor, { closed: true, w: 3, amp: 0.6 }, t, 0.1 * k);
  t += 0.1 * k;
  if (shirt) t = shirtPrint(x, (tt + tb) / 2 - 4 * s, s, t, shirt, o);
  // arms
  const sh = [[x - tw * 0.95, tt + 14 * s], [x + tw * 0.95, tt + 14 * s]];
  const AR = {
    stand: [[x - tw * 1.3, hip[1] + 6 * s], [x + tw * 1.3, hip[1] + 6 * s]],
    sit: [[x + 14 * s * dir, hip[1] - 6 * s], [x + 30 * s * dir, hip[1] - 10 * s]],
    walk: [[x - tw * 1.6 * dir, hip[1] - 2 * s], [x + tw * 1.5 * dir, hip[1] - 8 * s]],
    wave: [[x - tw * 1.3, hip[1] + 6 * s], [x + tw * 2.2, tt - 26 * s]],
    point: [[x - tw * 1.3, hip[1] + 6 * s], [x + tw * 3.2 * dir, tt + 10 * s]],
    shrug: [[x - tw * 2.4, tt + 4 * s], [x + tw * 2.4, tt + 4 * s]],
    arms_up: [[x - tw * 2.2, tt - 40 * s], [x + tw * 2.2, tt - 40 * s]],
    hold: [[x - tw * 0.3, tt + 44 * s], [x + tw * 0.3, tt + 44 * s]],
    hide: [[x - r * 0.5, hy + r * 0.2], [x + r * 0.5, hy + r * 0.2]],
  }[pose] || [[x - tw * 1.3, hip[1]], [x + tw * 1.3, hip[1]]];
  if (o.reach) AR[0] = o.reach;                 // one arm reaches to a contact point (prop / another character)
  if (o.reach2) AR[1] = o.reach2;
  const elbow = (a, b, sd) => [(a[0] + b[0]) / 2 + sd * 10 * s, (a[1] + b[1]) / 2 + 8 * s];
  INK_(quad(sh[0], elbow(sh[0], AR[0], -1), AR[0]), { w: 3.2, amp: 0.4, passes: 1 }, t, 0.06 * k);
  INK_(quad(sh[1], elbow(sh[1], AR[1], 1), AR[1]), { w: 3.2, amp: 0.4, passes: 1 }, t + 0.03 * k, 0.06 * k);
  for (const hnd of AR) { const hc = ell(hnd[0], hnd[1], 6.5 * s, 6.5 * s, 0, TAU, 14); FILL(hc, t + 0.07 * k); INK_(hc, { closed: true, w: 2.4, amp: 0.2, passes: 1 }, t + 0.07 * k, 0.03 * k); }
  t += 0.1 * k;
  if (pose === 'shrug') { /* palms up */ }
  t = head(hx, hy, r, t, { ...o, you: false });
  return { end: t, head: [hx, hy, r], hand: AR, torso: tor, x, y, s };
}
// something printed on the shirt: 'face' (a cartoon face portrait), 'star', 'heart', 'stain'
export function shirtPrint(x, y, s, t0, kind, o = {}) {
  const k = o.k || 1;
  if (kind === 'face') {
    const r = 15 * s, f = ell(x, y, r, r * 1.1, 0, TAU, 30);
    FILL(f, t0); INK_(f, { closed: true, w: 2, amp: 0.3, passes: 1 }, t0, 0.06 * k);
    INK_(bez([x - r * 1.05, y - r * 0.2], [x - r * 1.2, y - r * 1.5], [x + r * 1.2, y - r * 1.5], [x + r * 1.05, y - r * 0.2], 18), { w: 2.4, amp: 0.3, passes: 1 }, t0 + 0.04, 0.05 * k);
    INK_(line(x - r * 0.45, y - r * 0.1, x - r * 0.2, y - r * 0.1), { w: 2, amp: 0.1, passes: 1 }, t0 + 0.07, 0.02);
    INK_(line(x + r * 0.2, y - r * 0.1, x + r * 0.45, y - r * 0.1), { w: 2, amp: 0.1, passes: 1 }, t0 + 0.08, 0.02);
    INK_(quad([x - r * 0.4, y + r * 0.45], [x, y + r * 0.7], [x + r * 0.4, y + r * 0.45]), { w: 2, amp: 0.1, passes: 1 }, t0 + 0.09, 0.03);
    return t0 + 0.13 * k;
  }
  if (kind === 'star') { const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr2 = (i % 2 ? 7 : 16) * s; p.push([x + Math.cos(a) * rr2, y + Math.sin(a) * rr2]); } FILL(p, t0); INK_(p, { closed: true, w: 2.2, amp: 0.3, passes: 1 }, t0, 0.08 * k); return t0 + 0.1 * k; }
  if (kind === 'stain') { const p = []; for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, q = (i % 2 ? 7 : 11) * s * (0.8 + 0.4 * Math.sin(i * 2.3)); p.push([x + 8 * s + Math.cos(a) * q, y + Math.sin(a) * q]); } MRK([p], { col: 'rgba(120,80,40,0.45)', w: 6, edge: false }, t0, 0.08); INK_(p, { closed: true, w: 1.8, amp: 0.3, passes: 1 }, t0, 0.07 * k); return t0 + 0.1 * k; }
  return t0;
}
// redraw a person's face (reaction): paper over the old face, new expression drawn on top
export function react(P, t0, o = {}) {
  const [cx, cy, r] = P.head, f = ell(cx, cy + r * 0.12, r * 0.9, r * 0.8, 0, TAU, 40);
  COVER(f, t0);
  return face(cx, cy + r * 0.05, r, t0, o);
}
// a seated person at a small desk with a sheet of paper (a questionnaire)
export function student(x, y, s, t0, o = {}) {
  const k = o.k || 1, dir = o.dir || 1;
  const P = person(x, y, s, t0, { ...o, pose: 'sit', dir });
  const dx = x + 70 * s * dir, dy = y - 70 * s;
  const top = [[dx - 40 * s, dy], [dx + 40 * s, dy], [dx + 40 * s, dy + 6 * s], [dx - 40 * s, dy + 6 * s]];
  FILL(top, P.end); MRK([top], { col: GRY2, w: 6, edge: false }, P.end + 0.04, 0.04);
  INK_(top, { closed: true, w: 2.6, amp: 0.3, passes: 1 }, P.end, 0.06 * k);
  INK_(line(dx - 32 * s, dy + 6 * s, dx - 32 * s, y), { w: 2.6, amp: 0.3, passes: 1 }, P.end + 0.04, 0.04 * k);
  INK_(line(dx + 32 * s, dy + 6 * s, dx + 32 * s, y), { w: 2.6, amp: 0.3, passes: 1 }, P.end + 0.05, 0.04 * k);
  const sheet = [[dx - 24 * s, dy - 2 * s], [dx + 14 * s, dy - 6 * s], [dx + 20 * s, dy - 1 * s], [dx - 20 * s, dy + 2 * s]];
  FILL(sheet, P.end + 0.08); INK_(sheet, { closed: true, w: 2, amp: 0.2, passes: 1 }, P.end + 0.08, 0.04 * k);
  // chair
  INK_([[x - 26 * s * dir, y - 120 * s], [x - 26 * s * dir, y - 66 * s], [x + 30 * s * dir, y - 66 * s]], { w: 2.6, amp: 0.3, passes: 1, alpha: 0.85 }, t0 - 0.02, 0.06 * k);
  INK_(line(x - 22 * s * dir, y - 66 * s, x - 22 * s * dir, y), { w: 2.4, amp: 0.3, passes: 1, alpha: 0.85 }, t0, 0.04 * k);
  return { ...P, end: P.end + 0.14 * k, desk: [dx, dy] };
}
export function door(x, y, w, h, t0, o = {}) {
  const k = o.k || 1, open = o.open ?? 0.0;
  const fr = [[x, y], [x, y - h], [x + w, y - h], [x + w, y]];
  INK_(fr, { w: 3.4, amp: 0.6 }, t0, 0.14 * k);
  const dw = w * (1 - open * 0.75), lf = [[x, y], [x, y - h], [x + dw, y - h + open * 18], [x + dw, y - open * 18]];
  FILL(lf, t0 + 0.1 * k); MRK([lf], { col: GRY, w: 14, ang: 1.1 }, t0 + 0.16 * k, 0.08 * k);
  INK_(lf, { closed: true, w: 2.8, amp: 0.5 }, t0 + 0.1 * k, 0.12 * k);
  INK_(ell(x + dw * 0.85, y - h * 0.48, 5, 5, 0, TAU, 12), { closed: true, w: 2.4, amp: 0.1, passes: 1 }, t0 + 0.2 * k, 0.03);
  return t0 + 0.24 * k;
}
export function spotlight(x, ytop, xb, yb, wb, t0, o = {}) {
  const k = o.k || 1;
  const cone = [[x - 16, ytop], [x + 16, ytop], [xb + wb / 2, yb], [xb - wb / 2, yb]];
  MRK([cone], { col: o.col || 'rgba(255,205,40,0.42)', w: 26, ang: o.ang ?? 1.3, edge: false }, t0, 0.3 * k);
  INK_([[x - 16, ytop], [xb - wb / 2, yb]], { w: 2.2, amp: 0.6, passes: 1, dash: [14, 10] }, t0, 0.12 * k);
  INK_([[x + 16, ytop], [xb + wb / 2, yb]], { w: 2.2, amp: 0.6, passes: 1, dash: [14, 10] }, t0 + 0.04, 0.12 * k);
  const pool = ell(xb, yb, wb / 2, wb * 0.11, 0, TAU, 40);
  MRK([pool], { col: YEL, w: 12, edge: false }, t0 + 0.2 * k, 0.1);
  // the lamp
  const lamp = [[x - 30, ytop - 4], [x + 30, ytop - 4], [x + 18, ytop - 40], [x - 18, ytop - 40]];
  FILL(lamp, t0 - 0.12); MRK([lamp], { col: GRY2, w: 10 }, t0 - 0.06, 0.06); INK_(lamp, { closed: true, w: 3, amp: 0.4 }, t0 - 0.12, 0.1 * k);
  return t0 + 0.34 * k;
}
export function bubble(x, y, w, h, t0, o = {}) {   // speech bubble (tail to [tx,ty]) or thought bubble
  const k = o.k || 1, thought = !!o.thought;
  const b = rrect(x, y, w, h, o.r ?? Math.min(36, h / 2));
  let t = t0;
  if (o.tail) {
    const [tx, ty] = o.tail, bx = clamp(tx, x + 30, x + w - 30), by = ty > y + h / 2 ? y + h : y;
    if (thought) { [0.35, 0.65].forEach((u, i) => { const c = ell(lerp(bx, tx, u), lerp(by, ty, u), 10 - i * 4, 8 - i * 3, 0, TAU, 14); FILL(c, t); INK_(c, { closed: true, w: 2.2, amp: 0.2, passes: 1 }, t + i * 0.04, 0.04 * k); }); }
    else { const tl = [[bx - 16, by], [tx, ty], [bx + 16, by]]; FILL(tl.concat([[bx, by + (by === y ? 6 : -6)]]), t); INK_(tl, { w: 2.8, amp: 0.4, passes: 1 }, t + 0.08 * k, 0.06 * k); }
  }
  FILL(b, t); if (o.shadow !== false) dropShadow(b, 7, 8, t + 0.12 * k, 0.06);
  if (o.tint) MRK([b], { col: o.tint, w: 16 }, t + 0.14 * k, 0.1 * k);
  INK_(b, { closed: true, w: 3, amp: thought ? 2.4 : 1, dash: o.dash || null }, t, 0.16 * k);
  t += 0.18 * k;
  if (o.text) t = TXT(o.text, x + w / 2, y + h / 2 + (o.size || 34) * 0.34, o.size || 34, { f: o.f || 'KB', align: 'center' }, t, o.td);
  return t;
}
// marker bars growing from a base line: bars = [{v (0..1), label, col}]
export function bars(x, y, w, h, list, t0, o = {}) {
  const k = o.k || 1, n = list.length, bw = w / (n * 1.6), gap = (w - bw * n) / (n + 1);
  INK_(line(x - 10, y, x + w + 10, y), { w: 3.2, amp: 0.6 }, t0, 0.14 * k);
  let t = t0 + 0.16 * k;
  list.forEach((b, i) => {
    const bx = x + gap + i * (bw + gap), bh = h * b.v, tb = b.t ?? t;
    const rect = [[bx, y], [bx, y - bh], [bx + bw, y - bh], [bx + bw, y]];
    addEl(tb, 0.6 * k, 'marker', p => { const e = eo(p), top = y - bh * e; const c = G.ctx; c.save(); c.beginPath(); c.rect(bx - 20, top, bw + 40, bh + 30); c.clip(); markerDraw([rect], { col: b.col || GRY2, w: 18, ang: -0.3 }, 1); c.restore(); }, [bx - 10, y - bh - 10, bx + bw + 10, y + 10]);
    INK_([[bx, y], [bx, y - bh], [bx + bw, y - bh], [bx + bw, y]], { w: 2.8, amp: 0.6, passes: 1 }, tb + 0.5 * k, 0.16 * k);
    if (b.label) TXT(b.label, bx + bw / 2, y + 44, o.ls || 32, { f: 'PH', align: 'center', col: INK2 }, tb + 0.1, null);
    if (b.top) TXT(b.top, bx + bw / 2, y - bh - 18, o.ts || 44, { f: 'KB', align: 'center' }, tb + 0.65 * k, null);
    t = tb + 0.7 * k;
  });
  return t;
}
export function eyeIcon(cx, cy, s, t0, o = {}) {
  const k = o.k || 1, lk = o.look || [0, 0];
  const up = quad([cx - 30 * s, cy], [cx, cy - 26 * s], [cx + 30 * s, cy]), lo = quad([cx + 30 * s, cy], [cx, cy + 26 * s], [cx - 30 * s, cy]);
  const sh = up.concat(lo); FILL(sh, t0);
  INK_(sh, { closed: true, w: 2.6, amp: 0.3, passes: 1 }, t0, 0.08 * k);
  const ir = ell(cx + lk[0] * 8 * s, cy + lk[1] * 4 * s, 10 * s, 10 * s, 0, TAU, 20);
  MRK([ir], { col: INKM(0.9), w: 6, edge: false, op: 'source-over', amp: 0.2 }, t0 + 0.08 * k, 0.04);
  return t0 + 0.12 * k;
}
export function qmark(x, y, size, t0, o = {}) { return TXT('?', x, y, size, { f: 'KB', align: 'center', ...o }, t0, o.d ?? 0.25); }
export function check(x, y, s, t0, o = {}) { return INK_([[x - 14 * s, y], [x - 3 * s, y + 12 * s], [x + 18 * s, y - 16 * s]], { w: 4, amp: 0.4, passes: 1, col: o.col || INK }, t0, 0.12); }
export function cross(x, y, s, t0) { INK_(line(x - 14 * s, y - 14 * s, x + 14 * s, y + 14 * s), { w: 4, amp: 0.4, passes: 1 }, t0, 0.07); return INK_(line(x + 14 * s, y - 14 * s, x - 14 * s, y + 14 * s), { w: 4, amp: 0.4, passes: 1 }, t0 + 0.08, 0.07); }
export function motion(x, y, len, n, t0, o = {}) { for (let i = 0; i < n; i++) INK_(line(x, y + i * 14, x + len * (1 - i * 0.2), y + i * 14), { w: 2.4, amp: 0.3, passes: 1, alpha: 0.8 }, t0 + i * 0.04, 0.06); return t0 + n * 0.04 + 0.06; }
export function anchor(cx, cy, s, t0, o = {}) {
  const k = o.k || 1;
  const ring = ell(cx, cy - 70 * s, 14 * s, 14 * s, 0, TAU, 20);
  INK_(ring, { closed: true, w: 3.4, amp: 0.3 }, t0, 0.06 * k);
  INK_(line(cx, cy - 56 * s, cx, cy + 60 * s), { w: 5, amp: 0.4 }, t0 + 0.06 * k, 0.1 * k);
  INK_(line(cx - 34 * s, cy - 30 * s, cx + 34 * s, cy - 30 * s), { w: 4, amp: 0.4 }, t0 + 0.14 * k, 0.06 * k);
  INK_(ell(cx, cy + 10 * s, 56 * s, 52 * s, 0.15 * Math.PI, 0.85 * Math.PI, 30), { w: 5, amp: 0.4 }, t0 + 0.2 * k, 0.12 * k);
  arrowHead(cx + 52 * s, cy + 22 * s, -1.2, 16 * s, { w: 4 }, t0 + 0.32 * k);
  arrowHead(cx - 52 * s, cy + 22 * s, Math.PI + 1.2, 16 * s, { w: 4 }, t0 + 0.34 * k);
  const shape = [[cx - 6 * s, cy - 56 * s], [cx + 6 * s, cy - 56 * s], [cx + 6 * s, cy + 58 * s], [cx - 6 * s, cy + 58 * s]];
  MRK([shape], { col: GRY2, w: 8, edge: false }, t0 + 0.38 * k, 0.05);
  return t0 + 0.42 * k;
}
export function mirror(cx, cy, w, h, t0, o = {}) {
  const k = o.k || 1, fr = ell(cx, cy, w / 2, h / 2, 0, TAU, 50), gl = ell(cx, cy, w / 2 - 12, h / 2 - 12, 0, TAU, 50);
  FILL(fr, t0); MRK([fr, gl], { col: GRY2, w: 10 }, t0 + 0.1 * k, 0.08);
  INK_(fr, { closed: true, w: 3.2, amp: 0.5 }, t0, 0.14 * k); INK_(gl, { closed: true, w: 2.2, amp: 0.3, passes: 1 }, t0 + 0.08 * k, 0.1 * k);
  INK_(line(cx - w * 0.22, cy - h * 0.28, cx - w * 0.08, cy - h * 0.38), { w: 3, amp: 0.2, passes: 1, col: '#ffffff', alpha: 0.9 }, t0 + 0.2 * k, 0.04);
  INK_(line(cx, cy + h / 2, cx, cy + h / 2 + 90), { w: 4, amp: 0.3 }, t0 + 0.16 * k, 0.06 * k);
  return t0 + 0.24 * k;
}
export function scar(cx, cy, s, t0, o = {}) {
  const k = o.k || 1, p = [[cx - 18 * s, cy - 10 * s], [cx + 16 * s, cy + 12 * s]];
  INK_(p, { w: 3.4, amp: 0.4, passes: 1 }, t0, 0.08 * k);
  for (let i = 0; i < 4; i++) { const u = (i + 0.5) / 4, x = lerp(p[0][0], p[1][0], u), y = lerp(p[0][1], p[1][1], u); INK_(line(x - 5 * s, y + 6 * s, x + 5 * s, y - 6 * s), { w: 2.4, amp: 0.1, passes: 1 }, t0 + 0.08 + i * 0.03, 0.03); }
  return t0 + 0.22 * k;
}
export function brush(x, y, s, t0, o = {}) {   // a makeup brush held at [x,y] (the ferrule end), pointing up-right
  const k = o.k || 1, a = o.ang ?? -0.7, c = Math.cos(a), sn = Math.sin(a);
  const P = (u, v) => [x + c * u - sn * v, y + sn * u + c * v];
  const handle = [P(-70 * s, -4 * s), P(0, -6 * s), P(0, 6 * s), P(-70 * s, 4 * s)];
  const tip = [P(0, -7 * s), P(20 * s, -10 * s), P(40 * s, -4 * s), P(44 * s, 0), P(40 * s, 4 * s), P(20 * s, 10 * s), P(0, 7 * s)];
  FILL(handle, t0); MRK([handle], { col: GRYD, w: 6, edge: false }, t0 + 0.04, 0.04); INK_(handle, { closed: true, w: 2.4, amp: 0.2, passes: 1 }, t0, 0.06 * k);
  FILL(tip, t0 + 0.06); MRK([tip], { col: GRY, w: 6, edge: false }, t0 + 0.1, 0.04); INK_(tip, { closed: true, w: 2.4, amp: 0.3, passes: 1 }, t0 + 0.06, 0.06 * k);
  return t0 + 0.14 * k;
}
export function stage(x, y, w, t0, o = {}) {   // a stage edge + rows of audience heads (seen from behind)
  const k = o.k || 1, rows = o.rows || 2, per = o.per || 7;
  INK_(line(x, y, x + w, y), { w: 3.6, amp: 0.8 }, t0, 0.16 * k);
  INK_(line(x + 10, y + 20, x + w - 10, y + 20), { w: 2.4, amp: 0.6, passes: 1 }, t0 + 0.1 * k, 0.12 * k);
  const fr = [[x, y], [x + w, y], [x + w - 10, y + 20], [x + 10, y + 20]]; MRK([fr], { col: GRY2, w: 10, edge: false }, t0 + 0.2 * k, 0.08);
  let t = t0 + 0.24 * k;
  for (let rw = 0; rw < rows; rw++) for (let i = 0; i < per; i++) {
    const hx = x + (i + 0.5 + (rw % 2) * 0.4) * w / per, hy = y + 90 + rw * 70, hr = 24 + rw * 4;
    const hd = ell(hx, hy, hr, hr * 1.05, 0, TAU, 24), sh = ell(hx, hy + hr * 2.1, hr * 1.5, hr * 0.9, Math.PI, TAU, 20);
    FILL(hd, t); FILL(sh.concat([[hx + hr * 1.5, hy + hr * 2.6], [hx - hr * 1.5, hy + hr * 2.6]]), t);
    MRK([hd], { col: GRY, w: 8 }, t + 0.03, 0.03);
    INK_(hd, { closed: true, w: 2.4, amp: 0.3, passes: 1 }, t, 0.04 * k); INK_(sh, { w: 2.4, amp: 0.3, passes: 1 }, t + 0.02, 0.04 * k);
    t += 0.025 * k;
  }
  return t;
}
export function controller(cx, cy, s, t0, o = {}) {
  const k = o.k || 1, b = rrect(cx - 60 * s, cy - 28 * s, 120 * s, 56 * s, 26 * s);
  FILL(b, t0); MRK([b], { col: GRY, w: 10 }, t0 + 0.08, 0.06); INK_(b, { closed: true, w: 3, amp: 0.4 }, t0, 0.12 * k);
  INK_(line(cx - 40 * s, cy, cx - 20 * s, cy), { w: 3, amp: 0.1, passes: 1 }, t0 + 0.12, 0.03); INK_(line(cx - 30 * s, cy - 10 * s, cx - 30 * s, cy + 10 * s), { w: 3, amp: 0.1, passes: 1 }, t0 + 0.14, 0.03);
  INK_(ell(cx + 24 * s, cy + 6 * s, 6 * s, 6 * s, 0, TAU, 12), { closed: true, w: 2.4, amp: 0.1, passes: 1 }, t0 + 0.16, 0.03);
  INK_(ell(cx + 38 * s, cy - 6 * s, 6 * s, 6 * s, 0, TAU, 12), { closed: true, w: 2.4, amp: 0.1, passes: 1 }, t0 + 0.18, 0.03);
  return t0 + 0.22 * k;
}
export function ball(cx, cy, r, t0, o = {}) {
  const k = o.k || 1, c = ell(cx, cy, r, r, 0, TAU, 36);
  FILL(c, t0); MRK([c], { col: GRY2, w: 10 }, t0 + 0.08, 0.06); INK_(c, { closed: true, w: 3, amp: 0.4 }, t0, 0.1 * k);
  INK_(line(cx - r, cy, cx + r, cy), { w: 2, amp: 0.2, passes: 1 }, t0 + 0.1, 0.04); INK_(ell(cx, cy, r * 0.45, r, -Math.PI / 2, Math.PI / 2, 20), { w: 2, amp: 0.2, passes: 1 }, t0 + 0.12, 0.04);
  return t0 + 0.18 * k;
}
export function cup(cx, cy, s, t0, o = {}) {
  const k = o.k || 1, b = [[cx - 26 * s, cy - 34 * s], [cx + 26 * s, cy - 34 * s], [cx + 20 * s, cy + 30 * s], [cx - 20 * s, cy + 30 * s]];
  FILL(b, t0); MRK([b], { col: GRY, w: 10 }, t0 + 0.08, 0.05); INK_(b, { closed: true, w: 3, amp: 0.4 }, t0, 0.1 * k);
  INK_(ell(cx + 30 * s, cy - 4 * s, 12 * s, 14 * s, -Math.PI / 2, Math.PI / 2, 14), { w: 3, amp: 0.2, passes: 1 }, t0 + 0.1, 0.05);
  for (let i = 0; i < 2; i++) INK_(bez([cx - 8 * s + i * 14 * s, cy - 44 * s], [cx - 16 * s + i * 14 * s, cy - 58 * s], [cx + i * 14 * s, cy - 66 * s], [cx - 8 * s + i * 14 * s, cy - 82 * s], 12), { w: 2, amp: 0.4, passes: 1, alpha: 0.7 }, t0 + 0.14 + i * 0.04, 0.06);
  return t0 + 0.24 * k;
}
export function clock(cx, cy, r, t0, o = {}) {
  const k = o.k || 1, c = ell(cx, cy, r, r, 0, TAU, 40);
  FILL(c, t0); INK_(c, { closed: true, w: 3, amp: 0.4 }, t0, 0.12 * k);
  INK_(line(cx, cy, cx, cy - r * 0.62), { w: 3, amp: 0.1, passes: 1 }, t0 + 0.12, 0.04); INK_(line(cx, cy, cx + r * 0.45, cy + r * 0.1), { w: 3, amp: 0.1, passes: 1 }, t0 + 0.15, 0.04);
  return t0 + 0.2 * k;
}
export function lamp(x, y, t0, o = {}) { const p = [[x - 30, y], [x + 30, y], [x + 18, y - 40], [x - 18, y - 40]]; FILL(p, t0); MRK([p], { col: GRY2, w: 10 }, t0 + 0.06, 0.06); return INK_(p, { closed: true, w: 3, amp: 0.4 }, t0, 0.1); }
// a hand-drawn page-like card with lines of "writing" (no real text)
export function sheet(x, y, w, h, t0, o = {}) {
  const k = o.k || 1, p = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  FILL(p, t0); dropShadow(p, 6, 7, t0 + 0.1, 0.05); INK_(p, { closed: true, w: 2.6, amp: 0.4 }, t0, 0.1 * k);
  const n = o.lines ?? 4; for (let i = 0; i < n; i++) INK_(line(x + 12, y + 20 + i * (h - 30) / n, x + w - 12 - (i === n - 1 ? w * 0.3 : 0), y + 20 + i * (h - 30) / n), { w: 1.8, amp: 0.4, passes: 1, alpha: 0.7 }, t0 + 0.1 + i * 0.03, 0.05);
  return t0 + 0.14 * k + n * 0.03;
}
