// Scientific Bithi Short 9 × Sci-Fi Sitcom Toon (9:16): "টেবিলক্লথ টানলে প্লেট পড়ে না কেন?" — inertia, Newton cameo.
// Setting: a Bangladeshi wedding pandal (বিয়েবাড়ির প্যান্ডেল): striped shamiana, marigold strings, fairy lights, red plastic chairs.
import { clamp, lerp, seg, ss, eo, ei, back, hash, TAU } from '/core/lib.js';
import { W, H, INK, init, frame, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, rr, rect, spline, dot, text, reset, bands, noodle } from './toon.js';
import { mama, bithi, boltu, newton, PAL, MAMA, BOLTU, NEWTON } from './chars.js';

init(document.getElementById('c'));
const J = async f => { try { const r = await fetch(f); if (r.ok) return await r.json(); } catch (e) { } return null; };
const TL = await J('timeline.json'), LIPS = (await J('voices/lips.json')) || {}, T = await J('cues.json');
const LN = Object.fromEntries(TL.lines.map(l => [l.id, l]));
window.DUR = T.DUR;
const q = t => Math.floor(t * 12 + 1e-6) / 12;          // characters on twos

function talk(who, t) {
  const tq = q(t);
  for (const L of TL.lines) {
    if (L.who !== who || tq < L.t0 || tq >= L.t1) continue;
    const k = Math.floor((tq - L.t0) * 24), lp = LIPS[L.id];
    const o = lp ? (lp.o[k] ?? 0) : 0, b = lp ? (lp.b[k] ?? .5) : .5;
    return { o, w: .8 + .45 * b - .2 * o, talking: true };
  }
  return { o: 0, w: 1, talking: false };
}
const blinks = (t, seed) => { const k = Math.floor(t * 12), c = Math.floor(k / 30); return hash(c * 7.1 + seed) > .35 && (k % 30 === Math.floor(hash(c + seed) * 20)); };
function cam(cx, cy, z, shake = 0, t = 0) {
  reset(); translate(W / 2, H / 2);
  if (shake) { const f = Math.floor(t * 24); translate((hash(f) - .5) * shake * 2, (hash(f + 77) - .5) * shake * 2); }
  scale(z); translate(-cx, -cy);
}

// —— layout ——
const FLOOR = 1500, TLX = T.TLX, TRX = T.TRX, TTOP = T.TTOP, MX = 120, BX = 800, TIX = 975, PX = 700, PY = FLOOR - 215;
const STEEL = '#c9d2db', STEELS = '#97a3ae';

// —— the wedding pandal ——
function pandal(t, { amb = 0 } = {}) {
  // shamiana wall: vertical red / yellow stripes
  fillOnly(rect(-600, -900, 2400, 2500), '#f2c230', { boil: 0 });
  for (let x = -600; x < 1800; x += 120) fillOnly(rect(x, -900, 60, 2400), '#d8343c', { boil: .2 });
  fillOnly(rect(-600, 1180, 2400, 330), 'rgba(0,0,0,.12)', { boil: 0 });
  // scalloped valance (green with a white trim)
  shape(rect(-600, 560, 2400, 70), { fill: '#2f9b55', lw: 6 });
  for (let x = -600; x < 1800; x += 80) shape(arc(x + 40, 630, 40, 34, 0, Math.PI, 10), { fill: '#2f9b55', lw: 5, closed: true });
  stroke([[-600, 600], [1800, 600]], 4, { line: '#fff' });
  // marigold strings: swags + drops
  for (let k = 0; k < 4; k++) {
    const x0 = -160 + k * 360, pts = spline([[x0, 690], [x0 + 180, 790], [x0 + 360, 690]], false, 10);
    for (let i = 0; i < pts.length; i += 2) dot(pts[i][0], pts[i][1], 13, i % 4 ? '#ff9a1f' : '#ffd23a');
    for (let j = 0; j < 7; j++) dot(x0 + 360, 700 + j * 24, 12, j % 2 ? '#ff9a1f' : '#ffd23a');
  }
  // fairy lights (they twinkle: the pandal is alive, nothing else moves)
  const fl = spline([[-300, 880], [100, 940], [540, 900], [980, 950], [1400, 890]], false, 12);
  stroke(fl, 3, { line: '#3a3040' });
  for (let i = 0; i < fl.length; i += 3) { const on = hash(i + Math.floor(t * 3)) > .25; dot(fl[i][0], fl[i][1] + 8, 7, on ? ['#ff5d6c', '#7ee0ff', '#fff27a', '#9dff8a'][i % 4] : '#5a4e60'); }
  // back: the flower stage gate (right) and stacked red plastic chairs (left)
  shape(rect(840, 1330, 700, 180), { fill: '#b8323a', lw: 6, shade: () => { fillOnly(rect(840, 1330, 700, 26), '#e8b93a', { boil: .2 }); for (let x = 860; x < 1540; x += 40) shape(arc(x, 1356, 20, 16, 0, Math.PI, 8), { fill: '#e8b93a', lw: 3, closed: true }); } });
  for (const px_ of [880, 1260]) shape(rect(px_, 1000, 30, 330), { fill: '#e8b93a', lw: 5 });
  shape([...arc(1085, 1010, 205, 190, Math.PI, TAU, 18), ...arc(1085, 1010, 170, 155, TAU, Math.PI, 18)], { fill: '#ff9a1f', lw: 6, shade: () => { for (let i = 0; i < 11; i++) { const a = Math.PI + i / 10 * Math.PI; fillOnly(ell(1085 + Math.cos(a) * 188, 1010 + Math.sin(a) * 172, 17, 17, 10), i % 2 ? '#ffd23a' : '#ff5d6c', { boil: .3 }); } } });
  for (const [x, y] of [[-150, 1180], [-110, 1150]]) {
    shape([[x, y], [x + 120, y], [x + 110, y + 40], [x + 10, y + 40]], { fill: '#d8343c', lw: 6 });
    shape([[x + 10, y], [x + 20, y - 110], [x + 100, y - 110], [x + 110, y]], { fill: '#e2453a', lw: 6, shade: () => fillOnly(rect(x + 40, y - 90, 40, 50), '#b9262e', { boil: .2 }) });
    stroke([[x + 14, y + 40], [x, y + 330]], 7, { line: '#a61f2a' }); stroke([[x + 106, y + 40], [x + 120, y + 330]], 7, { line: '#a61f2a' });
  }
  // floor: maroon carpet with a cream border pattern
  shape(rect(-600, FLOOR - 10, 2400, 1400), { fill: '#8e2236', lw: 7, shade: () => { stroke([[-600, FLOOR + 60], [1800, FLOOR + 60]], 5, { line: '#e8c98a' }); for (let x = -600; x < 1800; x += 60) dot(x, FLOOR + 30, 6, '#e8c98a'); for (let k = 0; k < 6; k++) stroke([[-600, FLOOR + 140 + k * k * 30], [1800, FLOOR + 140 + k * k * 30]], 3, { line: '#741a2b' }); } });
  if (amb) fillOnly(rect(-600, -900, 2400, 3800), `rgba(90,230,255,${.12 * amb})`, { boil: 0 });
}

// —— props ——
function plate(x, y, s = 1, { rot = 0, steel = false } = {}) {   // (x,y) = bottom centre
  push(); translate(x, y); rotate(rot); scale(s);
  shape([[-50, -12], [50, -12], [36, 0], [-36, 0]], { fill: steel ? STEEL : '#ffffff', lw: 6, shade: () => fillOnly(rect(10, -14, 50, 16), steel ? STEELS : '#dfe3ea', { boil: .2 }) });
  if (!steel) shape(spline([[-34, -12], [-20, -34], [0, -40], [22, -32], [34, -12]]), { fill: '#f5b81c', lw: 5, shade: () => { dot(-8, -24, 5, '#c7681c'); dot(12, -20, 4, '#e8e0c8'); dot(2, -30, 4, '#9a3b1c'); } });   // biryani
  pop();
}
function glass(x, y, s = 1, { rot = 0, steel = false, fill = 1 } = {}) {
  push(); translate(x, y); rotate(rot); scale(s);
  const P = [[-26, -90], [26, -90], [20, 0], [-20, 0]];
  if (steel) shape(P, { fill: STEEL, lw: 6, shade: () => fillOnly(rect(6, -95, 30, 100), STEELS, { boil: .2 }) });
  else shape(P, { fill: '#eaf8ff', lw: 6, shade: () => { if (fill > 0) fillOnly(rect(-40, -90 * fill * .8, 80, 100), '#d9ecc0', { boil: .3 }); fillOnly(rect(-16, -84, 6, 70), '#ffffff', { boil: .2 }); } });   // borhani
  pop();
}
function jug(x, y, s = 1, { rot = 0 } = {}) {
  push(); translate(x, y); rotate(rot); scale(s);
  shape(spline([[-30, 0], [-38, -50], [-24, -96], [-30, -110], [24, -110], [30, -96], [40, -50], [30, 0]]), { fill: '#3aa0c8', lw: 6, shade: () => fillOnly(rect(10, -120, 40, 130), '#2a7fa3', { boil: .2 }) });
  stroke(arc(42, -60, 22, 30, -Math.PI / 2, Math.PI / 2, 10), 7); shape([[-30, -110], [-48, -118], [-30, -100]], { fill: '#3aa0c8', lw: 5 });
  pop();
}
function shards(x, y, seed, col, n = 6, spread = 1) {
  for (let i = 0; i < n; i++) { const a = hash(seed + i) * Math.PI, d = (20 + 70 * hash(seed + i * 3.1)) * spread, sx = x + Math.cos(a) * d * (i % 2 ? 1 : -1), sy = y + 6 + hash(seed + i * 7) * 14; shape([[sx - 12, sy], [sx + 2, sy - 14 - 8 * hash(i + seed)], [sx + 14, sy + 2]], { fill: col, lw: 4 }); }
}
function card(x, y, rot = 0) { push(); translate(x, y); rotate(rot); shape(rr(-56, -7, 112, 8, 2), { fill: '#ff6b5a', lw: 5 }); pop(); }
function coin(x, y) { shape(ell(x, y - 6, 15, 6, 18), { fill: '#e8b93a', lw: 5, shade: () => fillOnly(ell(x + 6, y - 4, 10, 4, 10), '#c8962a', { boil: .2 }) }); }

// —— the table + cloth. dx = how far the cloth has been pulled to the left ——
const CLOTHL = TLX - 14, CLOTHR = TRX + 14;
function tableBack() {
  shape(rect(TLX + 20, TTOP, 18, FLOOR - TTOP), { fill: '#7a4a28', lw: 6 }); shape(rect(TRX - 38, TTOP, 18, FLOOR - TTOP), { fill: '#7a4a28', lw: 6 });
  shape(rect(TLX - 6, TTOP - 16, TRX - TLX + 12, 18), { fill: '#a8703c', lw: 6 });
}
function cloth(dx, hand, t, { fly = 0 } = {}) {
  const a = Math.max(TLX - 6, CLOTHL - dx), b = CLOTHR - dx;
  if (b > TLX - 6) {
    const sc = []; for (let x = b; x >= a; x -= 30) sc.push([x, TTOP + 118 + 8 * Math.sin(x * .1)]);
    shape([[a, TTOP - 20], [b, TTOP - 20], [b, TTOP + 4], ...(b - a > 40 ? [[b + 4, TTOP + 118], ...sc, [a, TTOP + 118]] : [[a, TTOP + 4]])], {
      fill: '#ffffff', lw: 6, shade: () => { fillOnly(rect(a, TTOP + 4, b - a, 12), '#e4e6ee', { boil: .2 }); for (let x = a + 40; x < b; x += 70) stroke([[x, TTOP + 16], [x - 4, TTOP + 110]], 3, { line: '#dfe2ea' }); }
    });
  }
  // the pulled part: from the table edge (or the cloth's tail) to Mama's hands
  if (hand) {
    const ex = Math.min(b, TLX - 6), w = fly ? 26 + 30 * fly : 22;
    const wv = fly ? Math.sin(t * 30) * 30 * fly : 0;
    if (dx > 2) shape([[ex, TTOP - 20], [ex, TTOP + (b > TLX ? 118 : 10)], [hand[0] + wv * .3, hand[1] + w + wv], [hand[0] - wv * .2, hand[1] - w]], { fill: '#ffffff', lw: 6, shade: () => fillOnly(rect(hand[0] - 40, hand[1], Math.abs(ex - hand[0]) + 80, 200), '#e4e6ee', { boil: .2 }) });
  }
}
// slow pull of the hook
const dxSlow = t => { const u = clamp((t - T.ps) / T.pd); return T.DXM * u * u * (3 - 2 * u); };
function itemPose(it, t) {   // dishes ride the cloth, tip over the edge, fall, smash
  const d = dxSlow(t);
  if (t < it.te) return { x: it.x0 - d, y: TTOP - 20, rot: 0, broken: false };
  const k = t - it.te;
  if (t < it.tl) return { x: TLX - it.v * k * .6, y: TTOP - 20 + .5 * T.G * k * k, rot: -k * 7, broken: false };
  return { x: TLX - it.v * (it.tl - it.te) * .6, y: FLOOR + 30, rot: 0, broken: true, k: t - it.tl };
}
function drawItem(kind, p, i, { steel = false } = {}) {
  if (p.broken) { const col = { plate: '#ffffff', glass: '#eaf8ff', jug: '#3aa0c8' }[kind]; shards(p.x, p.y, i * 9, col, kind === 'plate' ? 6 : 5, clamp(.4 + p.k * 6)); if (kind === 'plate') dot(p.x + 10, p.y + 10, 16, '#f5b81c'); if (kind !== 'plate' && kind !== 'jug') fillOnly(ell(p.x, p.y + 16, 50, 10, 16), 'rgba(217,236,192,.8)', { boil: .3 }); return; }
  ({ plate, glass, jug })[kind](p.x, p.y, 1, { rot: p.rot, steel });
}
const SHARDS_ON_FLOOR = () => T.items.forEach((it, i) => drawItem(it.kind, { ...itemPose(it, T.items[3].tl + 1), k: 1 }, i));

// —— portal: cyan ring + gold sparks (the only glowing thing) ——
function portal(cx, cy, r, t, open = 1) {
  if (open <= .001) return;
  const R = r * open;
  push(); translate(cx, cy); scale(.78, 1);
  fillOnly(ell(0, 0, R * 1.55, R * 1.45, 48), 'rgba(80,220,255,.16)', { boil: .6 });
  fillOnly(ell(0, 0, R * 1.28, R * 1.22, 48), 'rgba(255,210,90,.16)', { boil: .6 });
  const rim = []; for (let i = 0; i < 22; i++) { const a = i / 22 * TAU, k = 1 + .07 * Math.sin(a * 5 + t * 6) + .05 * Math.sin(a * 3 - t * 4); rim.push([Math.cos(a) * R * k, Math.sin(a) * R * k]); }
  shape(spline(rim), {
    fill: '#19a9d8', lw: 8, shade: () => {
      fillOnly(ell(0, 0, R * .9, R * .9, 40), '#3fd0f2', { boil: .3 });
      for (let k = 0; k < 5; k++) {
        const a1 = [], a2 = [];
        for (let j = 0; j <= 22; j++) { const u = j / 22, rr_ = R * (1 - u) * .95, a = k / 5 * TAU + u * 3.6 + t * 2.6; a1.push([Math.cos(a) * rr_, Math.sin(a) * rr_]); const b = a + .55 * (1 - u * .7); a2.push([Math.cos(b) * rr_, Math.sin(b) * rr_]); }
        fillOnly([...a1, ...a2.reverse()], k % 2 ? '#ffd65a' : '#1188c4', { boil: .4 });
      }
      fillOnly(ell(0, 0, R * .3, R * .3, 24), '#c8f6ff', { boil: .5 }); fillOnly(ell(0, 0, R * .13, R * .13, 16), '#ffffff', { boil: .5 });
    }
  });
  for (let i = 0; i < 12; i++) { const a = hash(i) * TAU + t * (1.5 + hash(i + 4) * 2), d = R * (1.05 + .25 * ((t * .8 + hash(i + 9)) % 1)); dot(Math.cos(a) * d, Math.sin(a) * d, 5 + hash(i + 2) * 4, i % 3 ? '#ffd65a' : '#ffffff'); }
  pop();
}
const popOpen = x => x <= 0 ? 0 : back(clamp(x / .32), 1.7);

// —— poses ——
const REST = { L: { h: [-16, 150], bend: -14 }, R: { h: [16, 150], bend: 14 } };
function M(t, o = {}) { const m = talk('mama', t); return { x: MX, y: FLOOR, s: 1, t, look: [.4, 0], mouth: { o: m.o, w: m.w, sm: .25 }, headTilt: m.talking ? (m.o - .3) * .06 : Math.sin(q(t) * 1.6) * .02, sq: 1 + .008 * Math.sin(q(t) * 2.3), blink: blinks(t, 1), ...o }; }
function Bo(t, o = {}) { const m = talk('boltu', t); return { x: BX, y: FLOOR, s: 1, t, look: [-.5, -.1], mouth: { o: m.o * 1.15, w: m.w, sm: .1 }, headTilt: m.talking ? (m.o - .3) * .08 : 0, sq: 1 + .012 * Math.sin(q(t) * 3.1), blink: blinks(t, 2), armL: { h: [-14, 104], bend: -12 }, armR: { h: [14, 104], bend: 12 }, ...o }; }
function Bi(t, o = {}) { const m = talk('bithi', t); return { x: TIX, y: FLOOR, s: 1, t, look: [-.4, 0], mouth: { o: m.o, w: m.w, sm: .35 }, headTilt: m.talking ? (m.o - .3) * .06 : 0, sq: 1 + .008 * Math.sin(q(t) * 2.1), blink: blinks(t, 3), armL: { h: [-12, 140], bend: -12 }, armR: { h: [12, 140], bend: 12 }, ...o }; }
function Nw(t, o = {}) { const m = talk('newton', t); return { x: PX, y: FLOOR, s: 1, t, look: [0, 0], lid: .42, mouth: { o: m.o, w: m.w, sm: 0 }, headTilt: m.talking ? (m.o - .3) * .05 : 0, sq: 1 + .006 * Math.sin(q(t) * 1.9), blink: blinks(t, 4), armL: { h: [-14, 150], bend: -12 }, armR: { h: [14, 150], bend: 12 }, ...o }; }
const lerpArm = (a, b, u) => ({ h: [lerp(a.h[0], b.h[0], u), lerp(a.h[1], b.h[1], u)], bend: lerp(a.bend, b.bend, u), fist: u > .5 ? b.fist : a.fist });
const poseTrack = (tq, keys) => { let p = keys[0][1]; for (let i = 0; i < keys.length - 1; i++) { const [ta, a] = keys[i], [tb, b] = keys[i + 1]; if (tq >= ta && tq < tb) return lerpArm(a, b, ss(seg(tq, ta, Math.min(tb, ta + .3)))); if (tq >= tb) p = b; } return p; };
const walk = (tq, on, amp = 18) => on ? [[Math.sin(tq * 12) * amp, -Math.max(0, Math.cos(tq * 12)) * 12], [-Math.sin(tq * 12) * amp, -Math.max(0, -Math.cos(tq * 12)) * 12]] : [[0, 0], [0, 0]];
// Mama gripping the cloth corner: both hands at a world point; returns pose + the world grip point
function mamaGrip(t, x, { lean = 0, extra = {} } = {}) {
  const sh = [x + MAMA.shW, FLOOR - MAMA.shY], grip = [x + MAMA.shW + 62, FLOOR - 212];
  return { P: M(t, { x, lean, armR: { h: [grip[0] - sh[0], grip[1] - sh[1]], bend: 20, fist: true }, armL: { h: [grip[0] - sh[0] + 120, grip[1] - sh[1] + 6], bend: 30, fist: true }, ...extra }), grip };
}

// —— subtitles + labels ——
const NAME = { mama: ['মামা', '#f5b81c'], boltu: ['বল্টু', '#e2453a'], bithi: ['বিথী', '#2b67c9'], newton: ['নিউটন', '#7a4a28'] };
function chunks(L) {
  const parts = L.text.split(/(?<=[!?।…])\s+/).filter(Boolean); const tot = parts.reduce((a, p) => a + p.length, 0); let t = L.t0; const d = L.t1 - L.t0;
  return parts.map(p => { const c = { t0: t, t1: t + d * p.length / tot, text: p }; t = c.t1; return c; });
}
const SUBS = TL.lines.flatMap(L => chunks(L).map(c => ({ ...c, who: L.who })));
function subtitle(t) {
  const s = SUBS.find(c => t >= c.t0 - .05 && t < c.t1 + .25); if (!s) return null;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.font = '800 56px "Baloo"'; g.textAlign = 'center'; g.textBaseline = 'middle';
  const words = s.text.split(' '), linesOut = []; let cur = '';
  for (const w of words) { const tr = cur ? cur + ' ' + w : w; if (g.measureText(tr).width > 940 && cur) { linesOut.push(cur); cur = w; } else cur = tr; }
  linesOut.push(cur);
  const y0 = 1440 - (linesOut.length - 1) * 34;
  const [nm, col] = NAME[s.who];
  reset(); shape(rr(540 - 80, y0 - 102, 160, 52, 22), { fill: col, lw: 5 });
  g.setTransform(1, 0, 0, 1, 0, 0); g.font = '800 34px "Baloo"'; g.fillStyle = '#fff'; g.lineWidth = 6; g.strokeStyle = INK; g.strokeText(nm, 540, y0 - 75); g.fillText(nm, 540, y0 - 75);
  g.font = '800 56px "Baloo"';
  linesOut.forEach((l, i) => { const y = y0 + i * 68; g.lineWidth = 11; g.lineJoin = 'round'; g.strokeStyle = INK; g.strokeText(l, 540, y); g.fillStyle = '#fff'; g.fillText(l, 540, y); });
  return { text: s.text, y0: y0 - 102, y1: y0 + linesOut.length * 68 };
}
function tag(str, x, y, { bg = '#1b1422', fg = '#ffd65a', size = 42, w = null } = {}) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.font = `800 ${size}px "Baloo"`; const tw = w ?? g.measureText(str).width + 50;
  reset(); shape(rr(x - tw / 2, y - size * .75, tw, size * 1.5, 18), { fill: bg, lw: 6 });
  g.setTransform(1, 0, 0, 1, 0, 0); g.font = `800 ${size}px "Baloo"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = fg; g.fillText(str, x, y + 2);
}
function arrow(x0, y0, x1, y1, col, w = 14) {
  const a = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0);
  push(); translate(x0, y0); rotate(a);
  shape([[0, -w / 2], [L - 30, -w / 2], [L - 30, -w * 1.5], [L, 0], [L - 30, w * 1.5], [L - 30, w / 2], [0, w / 2]], { fill: col, lw: 5 });
  pop();
}

// —— shots ——
const SH = {};
const tableSet = (t, { steel = false, dx = 0, hand = null, fly = 0, jig = 0 } = {}) => {   // a fresh, laid table (reset/yank)
  tableBack(); cloth(dx, hand, t, { fly });
  const k = t - T.yank, wob = jig && k > 0 ? Math.exp(-k * 6) * Math.sin(k * 40) * .06 : 0, sh = jig && k > 0 ? -6 * clamp(k / .16) : 0;
  plate(330 + sh, TTOP - 20, 1, { steel, rot: wob }); glass(420 + sh * .8, TTOP - 20, 1, { steel, rot: -wob }); plate(515 + sh, TTOP - 20, 1, { steel, rot: wob * .7 }); glass(590 + sh * .6, TTOP - 20, 1, { steel, rot: wob });
};
SH.open = t => {
  const tq = q(t), d = dxSlow(t);
  cam(lerp(420, 370, ss(seg(t, T.ps, T.ps + T.pd))), 1250, 1.32);
  pandal(t);
  const x = MX - d * .35, lean = -clamp(d / 200) * .12;
  const { P, grip } = mamaGrip(t, x, { lean, extra: { look: t < T.ps ? [-.2, .1] : [.7, .5], brow: t < T.items[0].tl ? .6 : 1.2, mouth: t > T.items[0].tl ? { o: .65, w: .7, sm: -.4 } : M(t).mouth, eyeS: t > T.items[0].tl ? 1.2 : 1, legL: walk(tq, d > 4 && d < T.DXM - 4, 14)[0], legR: walk(tq, d > 4 && d < T.DXM - 4, 14)[1] } });
  tableBack(); cloth(d, grip, t);
  T.items.forEach((it, i) => drawItem(it.kind, itemPose(it, t), i));
  mama(P);
  const scared = t > T.items[0].te;
  boltu(Bo(t, { x: 735, look: scared ? [-.8, .5] : [-.6, -.1], nerv: scared ? .8 : .2, eyeS: scared ? 1.15 : 1, brow: scared ? 1.2 : .5, mouth: scared ? { o: .5, w: .7, sm: -.3 } : Bo(t).mouth, armL: scared ? { h: [-40, -60], bend: -20 } : { h: [-14, 104], bend: -12 }, armR: scared ? { h: [40, -60], bend: 20 } : { h: [14, 104], bend: 12 } }));
};
SH.boltuCU = t => {
  const m = talk('boltu', t);
  cam(BX - 40, FLOOR - 270, 2.3);
  pandal(t);
  boltu(Bo(t, { look: [-.8, .7], nerv: .9, eyeS: 1.2, pupil: 2.6, brow: 1.3, mouth: { o: m.o * 1.2 + (m.talking ? .1 : .4), w: m.w, sm: -.2 }, armL: { h: [-46, -150], bend: -30 }, armR: { h: [46, -150], bend: 30 } }));   // hands on head
};
SH.mamaCU = t => {
  const tq = q(t), d = T.DXM;
  cam(MX - 60, FLOOR - 400, 2.05);
  pandal(t); tableBack(); SHARDS_ON_FLOOR();
  const x = MX - d * .35;
  // holds the pulled cloth out at his side and shakes it at "the cloth is bad"; other fist on the hip
  const shake = tq > LN.m2.t0 && tq < LN.m2.t0 + 1.1 ? Math.sin(tq * 26) * 12 : 0;
  const P = M(t, { x, look: tq < LN.m2.t0 + 1.2 ? [.7, .2] : [.8, -.1], brow: -.6, mouth: { ...M(t).mouth, sm: -.1, skew: .3 }, headTilt: -.06,
    armL: { h: [-40, 90], bend: -40, fist: true }, armR: { h: [150, -10 + shake], bend: -10, fist: true } });
  P.holdR = hp => shape([[hp[0] - 22, hp[1] - 6], [hp[0] + 24, hp[1] - 10], [hp[0] + 40 + shake, hp[1] + 250], [hp[0] - 34 + shake * .6, hp[1] + 240]], { fill: '#ffffff', lw: 6, shade: () => fillOnly(rect(hp[0] + 5, hp[1], 60, 270), '#e4e6ee', { boil: .2 }) });
  mama(P);
};
SH.enter = t => {
  const tq = q(t), u = seg(t, LN.b2.t0 - .6, LN.b2.t0 + .5);
  cam(880, 1306, 1.75);
  pandal(t); tableBack();
  boltu(Bo(t, { look: u > .2 ? [.7, -.3] : [-.5, .3], headTilt: .05, armR: { h: [60, -20], bend: 20 } }));   // turns to Bithi, open palm question
  const bx = lerp(1180, TIX, eo(u));
  bithi(Bi(t, { x: bx, look: [-.6, .1], legL: walk(tq, u > 0 && u < 1)[0], legR: walk(tq, u > 0 && u < 1)[1], brow: .3 }));
};
SH.summon = t => {
  const tq = q(t), s0 = LN.t1.t0, d = LN.t1.t1 - s0;
  cam(TIX - 30, FLOOR - 380, 2.05);
  pandal(t);
  const arms = poseTrack(tq, [[s0, REST.R], [s0 + .1, { h: [40, 30], bend: 40 }], [s0 + d * .12, { h: [70, 60], bend: 30 }], [s0 + d * .2, { h: [40, -150], bend: 20, fist: true }], [s0 + d * .36, { h: [100, -140], bend: 10 }]]);
  bithi(Bi(t, { look: tq < s0 + d * .15 ? [-.2, .3] : tq < s0 + d * .3 ? [-.3, -.8] : [-.5, -.1], armR: arms, armL: tq > s0 + d * .3 ? { h: [-arms.h[0], arms.h[1]], bend: -arms.bend } : REST.L, brow: tq < s0 + d * .15 ? -.3 : .7, headTilt: tq < s0 + d * .15 ? .08 : 0 }));
};
SH.summonWide = t => {
  const tq = q(t), s0 = LN.t1.t0, d = LN.t1.t1 - s0;
  cam(lerp(760, 770, seg(t, s0, T.pOpen + .35)), 1266, 1.45);
  pandal(t); tableBack(); SHARDS_ON_FLOOR();
  boltu(Bo(t, { look: [.7, -.2], brow: .4 }));
  const arms = poseTrack(tq, [[s0, { h: [100, -140], bend: 10 }], [s0 + d * .55, { h: [30, 60], bend: 40 }], [s0 + d * .82, { h: [-20, 40], bend: 40 }], [s0 + d + .3, { h: [80, -150], bend: 10 }]]);
  bithi(Bi(t, { look: tq > LN.t1.t1 ? [-.9, -.3] : [-.5, -.4], armR: arms, armL: { h: [-arms.h[0], arms.h[1]], bend: -arms.bend }, brow: .6 }));
  portal(PX, PY, 190, t, popOpen(t - T.pOpen) * .8);
};
SH.portal = t => {
  const tq = q(t);
  cam(560, 1180, 1.02);
  const op = t < T.pClose ? Math.max(.8, popOpen(t - T.pOpen)) : 1 - ei(seg(t, T.pClose, T.pClose + .3));
  pandal(t, { amb: op }); tableBack(); SHARDS_ON_FLOOR();
  mama(M(t, { x: MX - T.DXM * .35 + 60, look: [.9, -.1], eyeS: 1.15, pupil: 3, brow: 1, mouth: { o: .5, w: .8, sm: 0 }, armL: { h: [60, -60], bend: 20, fist: true } }));
  portal(PX, PY, 190, t, op);
  const u = seg(t, T.nOut[0], T.nOut[1]);
  if (t >= T.nOut[0]) newton(Nw(t, { s: lerp(.35, 1, eo(u)), y: lerp(PY + 60, FLOOR, eo(u)), legL: walk(tq, u < 1)[0], legR: walk(tq, u < 1)[1], look: [-.4, 0] }));
  const hop = seg(tq, T.pOpen + .4, T.pOpen + .8);
  boltu(Bo(t, { x: BX + 70 * eo(hop), y: FLOOR - Math.sin(hop * Math.PI) * 60, look: [-.8, 0], nerv: 1, eyeS: 1.2, pupil: 2.6, mouth: { o: .7, w: .7, sm: -.4 }, armL: hop > 0 && hop < 1 ? { h: [-50, -110], bend: -30 } : { h: [-40, 70], bend: -20 }, armR: hop > 0 && hop < 1 ? { h: [50, -110], bend: 30 } : { h: [40, 70], bend: 20 } }));
  bithi(Bi(t, { look: [-.8, 0], mouth: { o: .3, w: .9, sm: .8 }, armR: { h: [80, -150], bend: 10 }, armL: { h: [-80, -150], bend: -10 } }));
  if (t > T.label) tag('আইজ্যাক নিউটন (১৬৪৩–১৭২৭)', 540, 210, { size: 44 });
};
SH.newtonCU = t => {
  const tq = q(t), a = LN.n1.t0, d = LN.n1.t1 - a;
  cam(PX - 120, FLOOR - 400, 1.9);
  pandal(t); tableBack();
  // palm flat and still ("stays still"), then points to the table for "inertia"
  const arm = poseTrack(tq, [[a, { h: [14, 150], bend: 12 }], [a + .3, { h: [-110, 20], bend: -10 }], [a + d * .55, { h: [-110, 20], bend: -10 }], [a + d * .62, { h: [-140, -20], bend: 0 }]]);
  newton(Nw(t, { x: PX + 70, look: tq < a + d * .55 ? [-.3, .1] : [-.7, .4], armR: { h: [arm.h[0] * -1, arm.h[1]], bend: -arm.bend }, face: -1 }));
  if (t > a + d * .6) tag('জড়তা', 260, 1060, { bg: '#ffd65a', fg: INK, size: 46 });
};
// close insert on the bare table: glass, card, coin; Newton's hand flicks the card
const GX = 440, GY = TTOP - 16;
function coinRig(t, { live = true } = {}) {
  const k = t - T.coinFlick;
  const cx = k < 0 ? GX : GX - 3600 * k * k - 900 * k, crot = k < 0 ? 0 : -k * 9;
  const fall = clamp((t - T.coinFlick - .03) / (T.coinLand - T.coinFlick - .03));
  const coinY = k < .03 ? GY - 90 - 7 : lerp(GY - 97, GY - 14, fall * fall);
  glass(GX, GY, 1, { fill: 0 });
  if (cx > GX - 600) card(cx, GY - 92, crot);
  coin(GX, coinY);
  if (t > T.coinLand && t < T.coinLand + .4) for (let i = 0; i < 4; i++) stroke([[GX + (i - 1.5) * 18, GY - 120 - 10 * (t - T.coinLand) * 40], [GX + (i - 1.5) * 26, GY - 140 - 10 * (t - T.coinLand) * 40]], 4, { line: '#ffd65a' });
}
SH.coin = t => {
  const tq = q(t), k = t - T.coinFlick;
  cam(GX + 40, GY - 90, 3.4, k > 0 && k < .2 ? 8 : 0, t);
  pandal(t); tableBack();
  coinRig(t);
  // hand: arrives, rests the finger behind the card edge, flicks (finger snaps left), withdraws
  const arr = seg(t, T.coinFlick - 1.0, T.coinFlick - .45), wd = seg(t, T.coinFlick + .35, T.coinFlick + .8);
  const hx = lerp(GX + 260, GX + 92, eo(arr)) + (k > 0 ? -26 * clamp(k / .05) : 0) + 200 * ei(wd), hy = GY - 92;
  shape(noodle([hx + 200, hy + 60], [hx + 30, hy + 4], 10, 30, 26), { fill: PAL.coat, lw: 6 });
  shape(noodle([hx + 40, hy + 10], [hx - 6, hy], 0, 16, 16), { fill: PAL.skinN, lw: 6 });   // finger
  shape(ell(hx + 34, hy + 8, 26, 22, 18), { fill: PAL.skinN, lw: 6 });
  shape(noodle([hx + 200, hy + 70], [hx + 70, hy + 20], 8, 46, 40), { fill: '#ffffff', lw: 6 });   // cuff lace
  if (k > 0 && k < .25) for (let i = 0; i < 3; i++) stroke([[GX - 80 - i * 40, GY - 100 + i * 8], [GX - 180 - i * 40, GY - 100 + i * 8]], 4, { line: 'rgba(27,20,34,.6)' });
};
SH.replay = t => {
  const a = LN.t2.t0;
  cam(540, 960, 1);
  bands(['#2e6f7a', '#2a6370', '#265866'], -100, 2100);
  shape(rr(70, 90, 940, 1000, 30), { fill: '#16343c', lw: 9, shade: () => { for (let y = 100; y < 1090; y += 8) fillOnly(rect(70, y, 940, 2), 'rgba(255,255,255,.035)', { boil: 0 }); } });
  tag('স্লো-মো রিপ্লে', 540, 150, { bg: '#ffd65a', fg: INK, size: 40 });
  // strobe in screen space: glass at centre, card snapshots fly left with growing gaps, the coin stays put then drops
  const N = 5, shown = Math.floor(clamp((t - a - .1) / 2.2) * (N + 2) + 1e-6);
  reset(); translate(540, 720); scale(2.4); translate(-GX, -(GY - 60));
  glass(GX, GY, 1, { fill: 0 });
  for (let kk = 0; kk <= Math.min(N, shown); kk++) { g.globalAlpha = kk === Math.min(N, shown) ? 1 : .3; card(GX - 160 * (kk / N) ** 2 * 1.6, GY - 92, -kk * .05); g.globalAlpha = 1; }
  const dropU = clamp((shown - N) / 2);
  coin(GX, lerp(GY - 97, GY - 14, dropU));
  if (shown <= N) { reset(); translate(540, 720); scale(2.4); translate(-GX, -(GY - 60)); stroke([[GX, GY - 150], [GX, GY - 104]], 3, { line: '#ffd65a' }); }
  if (t > a + 1.2) tag('কার্ড সরে যায় →  কয়েন থাকে', 540, 290, { bg: '#ff6b5a', fg: '#fff', size: 40 });
  if (t > a + 2.6) tag('স্থিতি জড়তা', 540, 1010, { size: 46 });
};
SH.explain = t => {
  const a = LN.t3.t0, d = LN.t3.t1 - a, mid = a + d * .55;
  cam(540, 960, 1);
  bands(['#2e6f7a', '#2a6370', '#265866'], -100, 2100);
  const panel = (y0, title, t0, dur, slow, label) => {
    reset(); shape(rr(70, y0, 940, 470, 30), { fill: '#16343c', lw: 9 });
    tag(title, 300, y0 + 60, { bg: slow ? '#bfe9ff' : '#ffd65a', fg: INK, size: 40 });
    const u = clamp((t - t0) / dur), cdx = (slow ? ss(u) * 380 : ei(clamp(u * 5)) * 520);
    const px = slow ? 600 - cdx : 600 - 6 * clamp(u * 5);
    reset(); translate(0, 0);
    shape(rect(150, y0 + 330, 780, 22), { fill: '#a8703c', lw: 6 });                               // table top
    if (cdx < 520) shape(rect(Math.max(150, 330 - cdx), y0 + 312, Math.max(0, 600 - Math.max(0, cdx - 180)), 20), { fill: '#ffffff', lw: 5 });   // cloth
    plate(px, y0 + 312, 1.5);
    if (t > t0 && (slow ? u < 1 : u < .2)) arrow(px + 40, y0 + 250, px - 90, y0 + 250, '#ff6b5a', 12);   // friction on the plate, for as long as the cloth moves
    if (t > t0 && (slow ? u < 1 : u < .2)) { g.setTransform(1, 0, 0, 1, 0, 0); g.font = '800 34px "Baloo"'; g.fillStyle = '#ff9b8e'; g.textAlign = 'center'; g.fillText('ঘর্ষণ', px - 20, y0 + 205); }
    // how long the pull lasts: a bar
    reset(); shape(rr(620, y0 + 40, 330, 40, 12), { fill: '#24464f', lw: 5 });
    fillOnly(rr(626, y0 + 46, (slow ? 318 : 34) * clamp(u * (slow ? 1 : 5)), 28, 10), slow ? '#bfe9ff' : '#ffd65a', { boil: .2 });
    tag(label, 785, y0 + 120, { bg: '#24464f', fg: '#fff', size: 32 });
  };
  panel(110, 'আস্তে টান', a + .2, 2.2, true, 'টান: অনেকক্ষণ');
  if (t > mid - .3) panel(620, 'এক ঝটকায়', mid, 1.6, false, 'টান: এক মুহূর্ত');
};
SH.reset = t => {
  const tq = q(t), a = LN.n2.t0;
  cam(500, 1240, 1.22);
  pandal(t); SHARDS_ON_FLOOR();
  const { P, grip } = mamaGrip(t, MX, { extra: { look: tq < a + .8 ? [.9, -.2] : [.6, .4], brow: .8, mouth: { ...M(t).mouth, sm: .3 } } });
  tableSet(t, { steel: true, hand: null });
  // Boltu has just reset the table with steel plates: his hand leaves the last glass
  const bsh = [720 - BOLTU.shW, FLOOR - BOLTU.shY], gp = [590 + 4, TTOP - 70];
  const away = ss(seg(t, a - .1, a + .5));
  boltu(Bo(t, { x: 720, face: -1, look: [.5, 0], armR: away < 1 ? lerpArm({ h: [-(gp[0] - bsh[0]), gp[1] - bsh[1]], bend: 10 }, { h: [14, 104], bend: 12 }, away) : { h: [14, 104], bend: 12 } }));
  newton(Nw(t, { x: 870, look: [-.6, .1], face: -1, armR: poseTrack(tq, [[a, { h: [14, 150], bend: 12 }], [a + .3, { h: [130, 40], bend: -20 }]]) }));
  mama(P);
};
SH.yank = t => {
  const tq = q(t), k = t - T.yank, u = clamp(k / .16);
  const dx = ei(u) * 560;
  cam(360, 1270, 1.45, k > 0 && k < .25 ? 10 : 0, t);
  pandal(t); SHARDS_ON_FLOOR();
  const back_ = k > 0 ? 70 * eo(clamp(k / .35)) - 20 * Math.max(0, Math.sin(clamp((k - .35) / .4) * Math.PI)) : 0;
  const { P, grip } = mamaGrip(t, MX - back_, { lean: k > 0 ? -.14 * Math.exp(-k * 2) : .04, extra: { look: k > .4 ? [.8, .4] : [.7, .5], brow: k > 0 ? 1.3 : .9, eyeS: k > .3 ? 1.25 : 1, mouth: k > .3 ? { o: .55, w: .7, sm: .4 } : M(t).mouth, legL: k > 0 && k < .5 ? [-24, 0] : [0, 0] } });
  if (k > 0) { P.armR = { h: [30, 60], bend: 20, fist: true }; P.armL = { h: [90, 70], bend: 20, fist: true }; }
  tableSet(t, { steel: true, dx, hand: k > 0 ? null : grip, jig: true });
  mama(P);
  if (k > 0) {   // the cloth trails from his fists toward the table, flutters, then drops to hang
    const hx = MX - back_ + MAMA.shW + 30, hy = FLOOR - MAMA.shY + 60, u2 = clamp(k / .9), len = 300 * (1 - .55 * eo(u2)), dr = 40 + 200 * eo(u2);
    const top = [], bot = [];
    for (let i = 0; i <= 8; i++) { const f = i / 8, w = Math.sin(tq * 22 - f * 6) * 22 * f * (1 - u2 * .7); top.push([hx + len * f, hy + dr * f * f + w]); bot.push([hx + len * f - 30 * f * u2, hy + 110 + dr * f * f * 1.1 + w]); }
    shape([...top, ...bot.reverse()], { fill: '#ffffff', lw: 6, shade: () => fillOnly(rect(hx, hy + 70, 400, 200), '#e4e6ee', { boil: .2 }) });
  }
  if (k > 0 && k < .3) for (let i = 0; i < 4; i++) stroke([[TRX - i * 90, TTOP - 50 + i * 20], [TRX - i * 90 + 140, TTOP - 50 + i * 20]], 5, { line: 'rgba(27,20,34,.55)' });
};
SH.boltuWow = t => {
  const m = talk('boltu', t);
  cam(720, FLOOR - 330, 2.1);
  pandal(t); tableSet(t, { steel: true, dx: 600 });
  boltu(Bo(t, { x: 780, look: [-.8, .5], eyeS: 1.25, pupil: 2.6, brow: 1.2, mouth: { o: m.o * 1.2 + (m.talking ? .05 : .35), w: m.w, sm: .5 }, armL: { h: [-60, -130], bend: -20 }, armR: { h: [60, -130], bend: 20 } }));
};
SH.pause = t => {
  const tq = q(t), a = LN.m4.t0;
  cam(MX - 40, FLOOR - 380, lerp(1.9, 2.05, seg(t, LN.b3.t1, a)));
  pandal(t); SHARDS_ON_FLOOR();
  const P = M(t, { x: MX - 50, look: tq < a - .2 ? [-.4, .9] : [0, 0], lid: tq < a - .2 ? .3 : .5, brow: tq < a - .2 ? .2 : -.5, mouth: tq < a ? { o: 0, w: .8, sm: -.3 } : { ...M(t).mouth, sm: -.2 }, blink: false,
    armL: { h: [-10, 140], bend: -20, fist: true }, armR: { h: [16, 150], bend: 14 } });
  P.holdL = hp => shape([[hp[0] - 20, hp[1]], [hp[0] + 20, hp[1]], [hp[0] + 30, hp[1] + 200], [hp[0] - 34, hp[1] + 190]], { fill: '#ffffff', lw: 6 });
  mama(P);
};
function bus(x, y, s, t) {
  push(); translate(x, y); scale(s);
  shape(rr(-180, -150, 360, 130, 24), { fill: '#2f9b55', lw: 7, shade: () => { fillOnly(rect(-180, -70, 360, 20), '#d8343c', { boil: .2 }); } });
  for (let i = 0; i < 5; i++) shape(rr(-160 + i * 64, -132, 50, 46, 8), { fill: '#bfe9ff', lw: 5 });
  for (let i = 0; i < 4; i++) { push(); translate(-130 + i * 64, -100); rotate(.45); shape(ell(0, 0, 10, 10, 12), { fill: PAL.skinB, lw: 4 }); pop(); }   // passengers' heads tipped forward (direction of travel = right)
  for (const wx of [-110, 110]) shape(ell(wx, -18, 30, 30, 20), { fill: '#2a2230', lw: 6 });
  for (let i = 0; i < 3; i++) stroke([[-230 - i * 30, -110 + i * 30], [-290 - i * 30, -110 + i * 30]], 5, { line: 'rgba(27,20,34,.5)' });
  pop();
}
SH.puzzle = t => {
  const tq = q(t), a = LN.t4.t0;
  cam(540, 960, 1);
  pandal(t);
  fillOnly(rect(0, 0, 1080, 1920), 'rgba(22,52,60,.55)', { boil: 0 });
  tag('ধাঁধা!', 540, 200, { bg: '#ffd65a', fg: INK, size: 64 });
  reset(); shape(rr(90, 300, 900, 480, 30), { fill: '#16343c', lw: 9 });
  reset(); shape(rect(110, 700, 860, 14), { fill: '#7d8288', lw: 4 });
  const u = seg(t, a + .6, a + 2.0);
  reset(); bus(lerp(380, 560, eo(u)), 700, 1.3, t);
  if (t > a + 2.0) { tag('হঠাৎ ব্রেক!', 790, 380, { bg: '#ff6b5a', fg: '#fff', size: 40 }); }
  if (t > a + 2.6) { g.setTransform(1, 0, 0, 1, 0, 0); g.font = '800 150px "Baloo"'; g.textAlign = 'center'; g.lineWidth = 16; g.strokeStyle = INK; g.strokeText('?', 880, 610); g.fillStyle = '#ffd65a'; g.fillText('?', 880, 610); }
  reset(); bithi(Bi(t, { x: 220, y: 1560, s: .9, look: [.4, -.4], armR: poseTrack(tq, [[a, { h: [12, 140], bend: 12 }], [a + .3, { h: [120, -160], bend: 10 }], [LN.t4.t1 - 1.2, { h: [120, -160], bend: 10 }], [LN.t4.t1 - .9, { h: [90, 40], bend: 30 }]]) }));
};
SH.end = t => {
  cam(540, 960, 1);
  bands(['#1d4c63', '#236178', '#2a7690'], -100, 2100);
  portal(540, 760, 230, t, popOpen(t - T.VEND));
  g.setTransform(1, 0, 0, 1, 0, 0); g.font = '800 120px "Baloo"'; g.textAlign = 'center'; g.textBaseline = 'middle';
  const k = Math.floor(t * 12) % 3, jx = [0, 1.5, -1][k], jy = [0, -1, 1.5][k];
  const pu = back(clamp((t - T.VEND - .15) / .4), 1.6);
  g.save(); g.translate(540 + jx, 360 + jy); g.scale(pu, pu);
  g.lineWidth = 22; g.lineJoin = 'round'; g.strokeStyle = INK; g.strokeText('সাইন্টিফিক বিথী', 0, 0); g.fillStyle = '#ffd65a'; g.fillText('সাইন্টিফিক বিথী', 0, 0); g.restore();
  reset();
  mama(M(t, { x: 170, y: 1500, s: .62, look: [0, 0], mouth: { o: 0, w: 1, sm: .8 } }));
  bithi(Bi(t, { x: 420, y: 1500, s: .62, look: [0, 0], mouth: { o: 0, w: 1, sm: .8 } }));
  boltu(Bo(t, { x: 650, y: 1500, s: .66, look: [0, 0], mouth: { o: 0, w: 1, sm: .8 } }));
  newton(Nw(t, { x: 890, y: 1500, s: .6, look: [0, 0], lid: .55, mouth: { o: 0, w: 1, sm: 0 } }));
};

let lastSub = null;
const THUMB = new URLSearchParams(location.search).get('thumb');
window.render = t => {
  frame(t);
  if (THUMB) {   // thumbnail cutouts: one character on a flat key colour, amazed (arms up, mouth open)
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#00ff00'; g.fillRect(0, 0, W, H); reset(); translate(540, 1700); scale(2.6); translate(-540, -1500);
    const amazed = { look: [.3, -.2], eyeS: 1.25, pupil: 2.8, brow: 1.2, mouth: { o: .75, w: .75, sm: .3 }, armL: { h: [-70, -130], bend: -20 }, armR: { h: [70, -130], bend: 20 }, blink: false };
    if (THUMB === 'bithi') bithi(Bi(0, { x: 540, ...amazed }));
    if (THUMB === 'newton') newton(Nw(0, { x: 540, look: [-.4, 0], lid: .4, mouth: { o: 0, w: 1, sm: .3 }, armR: { h: [110, -60], bend: 10 }, blink: false }));
    lastSub = null; return;
  }
  const s = T.shots.find(s => t >= s[0] && t < s[1]) || T.shots[T.shots.length - 1];
  SH[s[2]](t);
  lastSub = (s[2] === 'end') ? null : subtitle(t);
};
window.TEXTS = t => { window.render(t); return lastSub ? [{ id: lastSub.text, text: lastSub.text, x0: 60, y0: lastSub.y0, x1: 1020, y1: lastSub.y1 }] : []; };
window.EV = [];
await document.fonts.load('800 54px "Baloo"', 'সাইন্টিফিক বিথী AMB');
await document.fonts.ready;
window.READY = true;
