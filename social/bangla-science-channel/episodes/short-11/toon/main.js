// Scientific Bithi Short 11 × Sci-Fi Sitcom Toon (9:16): "দা-এর কি অসুখ হয়েছে?" — rusting (মরিচা). No scientist.
// Setting: a village-haat blacksmith shed (কামারশালা) by a river: tin roof on bamboo posts, brick forge with coals,
// an anvil on a log, daos on the back wall, a workbench, the river with a painted launch through the open side.
import { clamp, lerp, seg, ss, eo, ei, back, hash, TAU } from '/core/lib.js';
import { W, H, INK, init, frame, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, rr, rect, spline, dot, text, reset, bands, noodle } from './toon.js';
import { mama, bithi, boltu, PAL, MAMA, BOLTU, BITHI } from './chars.js';

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
const FLOOR = 1500, TTOP = 1240, CL = 300, CR = 660, MX = 190, BX = 820, TIX = 700;
const JX = [380, 480, 580], JY = TTOP - 18;            // three jars on the bench (bottom centres)

// —— the blacksmith shed (কামারশালা) by the river ——
function launchBoat(x, y, s = 1) {   // painted river launch (red hull band, white decks): returns in the puzzle
  push(); translate(x, y); scale(s);
  shape([[-260, 0], [260, 0], [300, -60], [-300, -60]], { fill: '#d8343c', lw: 6, shade: () => fillOnly(rect(-300, -24, 600, 10), '#f4f1ea', { boil: .2 }) });
  shape(rect(-220, -150, 420, 90), { fill: '#f4f1ea', lw: 6, shade: () => { for (let k = 0; k < 7; k++) fillOnly(rect(-200 + k * 58, -130, 34, 30), '#2b67c9', { boil: .2 }); } });
  shape(rect(-150, -220, 280, 70), { fill: '#f4f1ea', lw: 6, shade: () => { for (let k = 0; k < 5; k++) fillOnly(rect(-136 + k * 54, -204, 30, 26), '#2b67c9', { boil: .2 }); } });
  shape(rect(40, -290, 40, 70), { fill: '#f2c230', lw: 5 });
  pop();
}
function shed(t, { launchX = null } = {}) {
  bands(['#bfe6f2', '#a9dcee', '#94d2ea'], -900, 760);                                       // morning sky
  // river + far bank
  shape(rect(-600, 700, 2400, 260), { fill: '#3f97b8', lw: 7, shade: () => { for (let k = 0; k < 6; k++) stroke([[-600 + ((t * 30 + k * 300) % 2400), 760 + k * 30], [-520 + ((t * 30 + k * 300) % 2400), 760 + k * 30]], 4, { line: '#8fd0e6' }); } });
  shape(rect(-600, 650, 2400, 60), { fill: '#5aa04a', lw: 6 });
  for (let i = 0; i < 6; i++) { const x = -300 + i * 330; stroke([[x, 650], [x + 6, 520]], 6, { line: '#6b4a2a' }); shape(ell(x + 6, 510, 70, 34, 18), { fill: '#3f8a3a', lw: 5 }); }
  shape(rect(-600, 950, 2400, 230), { fill: '#7fae4a', lw: 6, shade: () => { fillOnly(rect(-600, 950, 2400, 30), '#a58a5a', { boil: .2 }); for (let i = 0; i < 14; i++) stroke([[-560 + i * 170, 1060], [-550 + i * 170, 1030]], 4, { line: '#5e8f34' }); } });   // near bank: grass down to the shed floor (no undrawn gap)
  const lx = launchX ?? (1400 - ((t * 25) % 2200));
  launchBoat(lx, 820, .7);
  // the shed: back wall (bamboo mat, left part), tin roof, bamboo posts
  shape(rect(-600, 360, 1020, 800), { fill: '#c9a46a', lw: 7, shade: () => { for (let x = -600; x < 420; x += 36) stroke([[x, 360], [x, 1160]], 3, { line: '#a8844a' }); for (let y = 380; y < 1160; y += 36) stroke([[-600, y], [420, y]], 2, { line: '#b8945a' }); } });
  // tools hanging on the back wall: daos and a sickle
  for (const [x, r] of [[-60, .1], [40, -.08], [140, .12]]) { push(); translate(x, 500); rotate(r); shape(rect(-6, 0, 12, 70), { fill: '#7a4a28', lw: 5 }); shape(spline([[-14, 70], [18, 70], [26, 200], [4, 230], [-14, 190]]), { fill: '#9aa3a8', lw: 5 }); pop(); }
  push(); translate(260, 520); shape(arc(0, 60, 60, 60, Math.PI * 1.1, Math.PI * 2.1, 14).concat(arc(0, 60, 44, 48, Math.PI * 2.1, Math.PI * 1.1, 14)), { fill: '#9aa3a8', lw: 5 }); pop();
  shape([[-700, -900], [1800, -900], [1800, 330], [-700, 380]], { fill: '#8e979c', lw: 7, shade: () => { for (let x = -700; x < 1800; x += 50) fillOnly(rect(x, 270, 22, 110), '#737b80', { boil: .2 }); } });
  for (const px of [420, 1020]) shape(rect(px, 340, 40, 1170), { fill: '#c9b06a', lw: 6, shade: () => { for (let y = 420; y < 1500; y += 140) stroke([[px, y], [px + 40, y]], 4, { line: '#8a7438' }); fillOnly(rect(px + 24, 340, 16, 1170), '#a8904a', { boil: .2 }); } });
  // floor: packed earth
  shape(rect(-600, 1160, 2400, 1400), { fill: '#b08a5c', lw: 7, shade: () => { for (let k = 0; k < 7; k++) stroke([[-600, 1200 + k * k * 22], [1800, 1200 + k * k * 22]], 3, { line: '#977249' }); } });
}
// brick forge with coals + bellows, anvil on a log (left back, behind Mama)
function forge(t) {
  shape(rect(-260, 960, 300, 230), { fill: '#b5532e', lw: 7, shade: () => { for (let y = 990; y < 1190; y += 34) for (let x = -260 + ((y / 34) % 2) * 30; x < 40; x += 60) stroke(rect(x, y, 56, 30), 2.5, { line: '#8e3c1e', closed: true }); } });
  shape(ell(-110, 962, 140, 24, 30), { fill: '#3a2a2a', lw: 6, shade: () => { for (let i = 0; i < 7; i++) fillOnly(ell(-190 + i * 26, 958 + (i % 2) * 6, 16, 9, 10), (Math.floor(t * 6 + i) % 3) ? '#ff7a1f' : '#ffb03a', { boil: .5 }); } });
  for (let i = 0; i < 2; i++) { const u = (t * .5 + i / 2) % 1; fillOnly(ell(-110 + Math.sin(u * 6 + i) * 20, 930 - u * 160, 14 + u * 20, 10 + u * 12, 14), `rgba(120,110,110,${.45 * (1 - u)})`, { boil: .6 }); }
  shape(rect(60, 1080, 90, 110), { fill: '#8a5a2b', lw: 6, shade: () => fillOnly(rect(110, 1080, 40, 110), '#6b4420', { boil: .2 }) });   // log
  shape([[30, 1040], [190, 1040], [170, 1080], [40, 1080]], { fill: '#4a4f57', lw: 6, shade: () => fillOnly(rect(120, 1036, 70, 48), '#363a41', { boil: .2 }) });   // anvil
}
function bench(t) {
  shape(rect(CL, TTOP, CR - CL, FLOOR - TTOP), { fill: '#a8703c', lw: 7, shade: () => { fillOnly(rect(CR - 70, TTOP, 70, 300), '#87562a', { boil: .3 }); for (let y = TTOP + 60; y < FLOOR; y += 60) stroke([[CL, y], [CR, y]], 3.5, { line: '#74481f' }); } });
  shape(rect(CL - 16, TTOP - 18, CR - CL + 32, 22), { fill: '#6b4420', lw: 6 });
}

// —— props ——
// dao: (x,y) = where the handle meets the blade; blade points along +x (rot turns it); rust 0..1
function dao(x, y, rot = 0, s = 1, { rust = 0, glint = 0 } = {}) {
  push(); translate(x, y); rotate(rot); scale(s);
  shape(rr(-90, -12, 92, 24, 8), { fill: '#7a4a28', lw: 5, shade: () => fillOnly(rect(-90, 2, 92, 10), '#5a3418', { boil: .2 }) });
  const col = rust > .5 ? '#b5612a' : '#a9b2b8';
  shape(spline([[0, -18], [120, -26], [210, -40], [250, -20], [236, 18], [120, 22], [0, 14]]), { fill: col, lw: 6, shade: () => {
    if (rust > 0) for (let i = 0; i < 12; i++) fillOnly(ell(20 + hash(i * 3.1) * 220, -20 + hash(i * 7.7) * 40, 10 + hash(i) * 16, 6 + hash(i + 2) * 8, 10), ['#c46a2a', '#8e3c1e', '#d98a3a'][i % 3], { boil: .3, alpha: Math.min(1, rust * 1.4) });
    else fillOnly(rect(10, -30, 240, 12), '#e4ecf0', { boil: .2 });
  } });
  if (glint > 0) { const gx = 180, gy = -22; for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; stroke([[gx + Math.cos(a) * 8, gy + Math.sin(a) * 8], [gx + Math.cos(a) * 30 * glint, gy + Math.sin(a) * 30 * glint]], 5, { line: '#fff6c8' }); } }
  pop();
}
function tongs(hp, tip, open = .1) {   // blacksmith's tongs from the hand to the jaw point
  const a = Math.atan2(tip[1] - hp[1], tip[0] - hp[0]), nx = -Math.sin(a), ny = Math.cos(a);
  for (const sd of [-1, 1]) stroke([[hp[0] + nx * sd * 8, hp[1] + ny * sd * 8], [tip[0] + nx * sd * (6 + open * 20), tip[1] + ny * sd * (6 + open * 20)]], 9, { line: '#2a2a30' });
}
function nail(x, y, rot = 0, s = 1, rust = 0) {   // (x,y) = head; points along +y
  push(); translate(x, y); rotate(rot); scale(s);
  const col = rust > 0 ? `rgb(${Math.round(lerp(150, 180, rust))},${Math.round(lerp(160, 90, rust))},${Math.round(lerp(168, 40, rust))})` : '#9aa3a8';
  shape([[-5, 4], [5, 4], [4, 80], [0, 96], [-4, 80]], { fill: col, lw: 4 });
  shape(rr(-13, -4, 26, 10, 4), { fill: col, lw: 4 });
  if (rust > .3) for (let i = 0; i < 5; i++) fillOnly(ell(hash(i * 5.3) * 8 - 4, 14 + i * 14, 6, 4, 8), '#8e3c1e', { boil: .3, alpha: clamp((rust - .3) * 2) });
  pop();
}
// jar kinds: 1 = dry air (drying powder, lid on), 2 = boiled water + oil layer (lid on), 3 = water + air (open)
const JH = 170, JW = 44;
function jar(x, y, kind, rust = 0, { label = false } = {}) {
  shape(rr(x - JW, y - JH, JW * 2, JH, 14), { fill: '#eaf8ff', lw: 6, shade: () => {
    if (kind === 1) { fillOnly(rect(x - JW, y - 34, JW * 2, 40), '#ffffff', { boil: .3 }); for (let i = 0; i < 8; i++) dot(x - 34 + i * 10, y - 26 + (i % 2) * 8, 3, '#d9d9cf'); }
    if (kind === 2) { fillOnly(rect(x - JW, y - JH * .72, JW * 2, JH), '#bfe0f2', { boil: .3 }); fillOnly(rect(x - JW, y - JH * .72 - 16, JW * 2, 18), '#f2c84a', { boil: .3 }); }
    if (kind === 3) { fillOnly(rect(x - JW, y - JH * .5, JW * 2, JH), '#bfe0f2', { boil: .3 }); }
    fillOnly(rect(x - JW + 10, y - JH + 14, 8, JH - 30), 'rgba(255,255,255,.9)', { boil: .2 });
  } });
  nail(x - 8, y - JH + 40, .12, 1.05, kind === 3 ? rust : 0);
  if (kind !== 3) shape(rr(x - JW - 6, y - JH - 18, JW * 2 + 12, 22, 6), { fill: kind === 1 ? '#d8343c' : '#2b67c9', lw: 5 });
  shape(rr(x - 24, y - 70, 48, 40, 8), { fill: '#fff6dc', lw: 4 });
  text(['১', '২', '৩'][kind - 1], x, y - 48, { font: '800 34px "Baloo"' });
}
function tray(x, y) { shape([[x - 170, y - 14], [x + 170, y - 14], [x + 150, y + 6], [x - 150, y + 6]], { fill: '#c9954f', lw: 6 }); }
function bucket(x, y, s = 1) { push(); translate(x, y); scale(s); shape([[-60, -110], [60, -110], [46, 0], [-46, 0]], { fill: '#2f8fd8', lw: 6, shade: () => fillOnly(rect(16, -120, 50, 130), '#2370ad', { boil: .2 }) }); shape(ell(0, -110, 60, 12, 24), { fill: '#bfe0f2', lw: 5 }); stroke(arc(0, -110, 62, 70, Math.PI, TAU, 14), 4); pop(); }
function mask(t, x, headY, o = 0, s = 1) {   // gamchha tied over Mama's nose and mouth like a mask; it puffs when he talks
  const cy = headY + 52 * s, h = (54 + o * 10) * s, w = 100 * s;
  shape(spline([[x - w, cy - h * .5], [x, cy - h * .62], [x + w, cy - h * .5], [x + w * .96, cy + h * .45], [x, cy + h * .6 + o * 8], [x - w * .96, cy + h * .45]]), { fill: PAL.gam, lw: 6, shade: () => { for (let k = 0; k < 4; k++) fillOnly(rect(x - w * 1.1, cy - h * .4 + k * h * .3, w * 2.2, 5 * s), '#ffffff', { boil: .2 }); fillOnly(rect(x - 20 * s, cy - h, 6 * s, h * 2), '#ffffff', { boil: .2 }); } });
  for (const sd of [-1, 1]) stroke([[x + sd * w, cy - h * .3], [x + sd * (w + 26 * s), cy - h * .55]], 5);
}
// —— poses ——
const REST = { L: { h: [-16, 150], bend: -14 }, R: { h: [16, 150], bend: 14 } };
function M(t, o = {}) { const m = talk('mama', t); return { x: MX, y: FLOOR, s: 1, t, look: [.5, .2], mouth: { o: m.o, w: m.w, sm: .25 }, headTilt: m.talking ? (m.o - .3) * .06 : Math.sin(q(t) * 1.6) * .02, sq: 1 + .008 * Math.sin(q(t) * 2.3), blink: blinks(t, 1), ...o }; }
function Bo(t, o = {}) { const m = talk('boltu', t); return { x: BX, y: FLOOR, s: 1, t, look: [-.5, .2], mouth: { o: m.o * 1.15, w: m.w, sm: .1 }, headTilt: m.talking ? (m.o - .3) * .08 : 0, sq: 1 + .012 * Math.sin(q(t) * 3.1), blink: blinks(t, 2), armL: { h: [-14, 104], bend: -12 }, armR: { h: [14, 104], bend: 12 }, ...o }; }
function Bi(t, o = {}) { const m = talk('bithi', t); return { x: TIX, y: FLOOR, s: 1, t, look: [-.4, .1], mouth: { o: m.o, w: m.w, sm: .35 }, headTilt: m.talking ? (m.o - .3) * .06 : 0, sq: 1 + .008 * Math.sin(q(t) * 2.1), blink: blinks(t, 3), armL: { h: [-12, 140], bend: -12 }, armR: { h: [12, 140], bend: 12 }, ...o }; }
const lerpArm = (a, b, u) => ({ h: [lerp(a.h[0], b.h[0], u), lerp(a.h[1], b.h[1], u)], bend: lerp(a.bend, b.bend, u), fist: u > .5 ? b.fist : a.fist });
const poseTrack = (tq, keys) => { let p = keys[0][1]; for (let i = 0; i < keys.length - 1; i++) { const [ta, a] = keys[i], [tb, b] = keys[i + 1]; if (tq >= ta && tq < tb) return lerpArm(a, b, ss(seg(tq, ta, Math.min(tb, ta + .3)))); if (tq >= tb) p = b; } return p; };
const walk = (tq, on, amp = 18) => on ? [[Math.sin(tq * 12) * amp, -Math.max(0, Math.cos(tq * 12)) * 12], [-Math.sin(tq * 12) * amp, -Math.max(0, -Math.cos(tq * 12)) * 12]] : [[0, 0], [0, 0]];
// arm vector from a character's front shoulder to a world point (face = 1: right shoulder; face = -1: mirrored)
const reach = (D, x, face, wx, wy, s = 1) => { const sx = x + face * D.shW * s, sy = FLOOR - D.shY * s; return [(wx - sx) * face / s, (wy - sy) / s]; };
function strip(x0, y0, x1, y1, w = 22) { const a = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0); push(); translate(x0, y0); rotate(a); shape(rect(0, -w / 2, L, w), { fill: 'rgba(236,214,160,.92)', lw: 4, line: '#8a6a3a' }); pop(); }

// —— subtitles + labels ——
const NAME = { mama: ['মামা', '#f5b81c'], boltu: ['বল্টু', '#e2453a'], bithi: ['বিথী', '#2b67c9'], };
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

const cap = (v, L) => { const l = Math.hypot(v[0], v[1]); return l > L ? [v[0] * L / l, v[1] * L / l] : v; };   // pointing arms keep their length
// —— shots ——
const SH = {};
const set = (t, o) => { shed(t, o); forge(t); };
const HEADY = FLOOR - MAMA.headY;                         // Mama's head centre (s = 1, no lean)
const masked = (t, P) => { mama({ ...P, headTilt: 0 }); mask(t, P.x, HEADY, talk('mama', t).o); };
// Mama holding the rusty dao out with tongs in his right (front) hand
const TONG = { h: [150, -40], bend: 18 };
const tongHand = () => [MX + MAMA.shW + TONG.h[0], FLOOR - MAMA.shY + TONG.h[1]];
function rustyOut(t, shakeAmp = 0) {
  const hp = tongHand(), jit = shakeAmp ? Math.sin(q(t) * 40) * shakeAmp : 0;
  const tip = [hp[0] + 90, hp[1] - 40 + jit];
  dao(tip[0] + 10, tip[1] + 4, -.35, .8, { rust: 1 });
  tongs(hp, tip, .05);
  return tip;
}
function flakes(t, t0, x, y, n = 3) {   // rust flakes dropping from the blade to the floor / bench
  for (let i = 0; i < n; i++) { const k = t - t0 - i * .35; if (k < 0) continue; const yy = y + k * k * 900, xx = x + i * 26 + Math.sin(k * 9 + i) * 8; if (yy > FLOOR) continue; push(); translate(xx, yy); rotate(k * 6 + i); shape([[-9, -5], [8, -7], [10, 5], [-6, 7]], { fill: '#b5612a', lw: 3 }); pop(); }
}
SH.open = t => {   // HOOK: Mama in a gamchha "mask" holds a rusty dao at arm's length with tongs; a flake drops
  cam(370, 1090, 1.9);
  set(t); bench(t);
  const k = t - T.flake;
  masked(t, M(t, { look: [.9, -.1], brow: 1.2, eyeS: 1.15, nerv: .3, sweat: t * .9, armR: TONG, armL: { h: [-40, 120], bend: -20 }, sq: 1 - .02 * ss(clamp(k / .2)) }));
  const tip = rustyOut(t, .8);
  flakes(t, T.flake, tip[0] + 60, tip[1] + 10, 3);
};
SH.boltuQ = t => {   // Boltu steps in and points at the mask; Mama turns his eyes to him
  const tq = q(t), u = seg(t, LN.b1.t0 - .1, LN.b1.t0 + .5);
  cam(470, 1150, 1.35);
  set(t); bench(t);
  masked(t, M(t, { look: u > .5 ? [.9, .2] : [.9, -.1], brow: .6, armR: TONG, armL: { h: [-40, 120], bend: -20 } }));
  rustyOut(t);
  const bx = lerp(1000, 760, eo(u));
  boltu(Bo(t, { x: bx, face: -1, look: [.8, -.3], brow: .8, legL: walk(tq, u > 0 && u < 1)[0], legR: walk(tq, u > 0 && u < 1)[1],
    armR: u >= 1 ? { h: cap(reach(BOLTU, bx, -1, MX + 40, HEADY + 40), 125), bend: 6 } : { h: [14, 104], bend: 12 } }));
};
SH.hide = t => {   // "ছোঁয়াচে!": he whips the shiny new dao behind his back (left hand), chin up
  const tq = q(t), k = t - T.hide, zin = ss(seg(t, LN.m2.t0 + .1, LN.m2.t0 + .6));
  cam(270, 1110, lerp(1.8, 2.15, zin));
  set(t); bench(t);
  const back = ss(clamp(k / .25));
  const hl = [lerp(-150, -30, back), lerp(-60, 110, back)];            // left-hand vector from the back shoulder
  const hp = [MX - MAMA.shW + hl[0], FLOOR - MAMA.shY + hl[1]];
  dao(hp[0], hp[1], lerp(-2.6, Math.PI - .25, back), .8, { glint: k > .25 ? clamp((k - .25) / .2) * (1 - clamp((k - .9) / .3)) : 0 });   // drawn before Mama: behind his body
  masked(t, M(t, { look: k < .3 ? [-.6, .2] : [.2, -.5], brow: k < .3 ? .4 : -.4, armR: TONG, armL: { h: hl, bend: -10 } }));
  rustyOut(t);
  if (k > 0 && k < .25) for (let i = 0; i < 3; i++) stroke([[MX - 150 - i * 12, 1150 + i * 30], [MX - 190 - i * 12, 1150 + i * 30]], 4);
};
function trayLoad(cx, cy, s = 1, rust3 = 0) { push(); translate(cx, cy); scale(s); tray(0, 0); for (let i = 0; i < 3; i++) jar((i - 1) * 100, -14, i + 1, i === 2 ? rust3 : 0); pop(); }
SH.enter = t => {   // wide: Bithi walks in with the tray of jars; Boltu turns to her as he asks
  const tq = q(t), u = seg(t, LN.b2.t0 - .3, LN.b2.t1 + .3);
  cam(540, 1150, 1.05);
  set(t); bench(t);
  masked(t, M(t, { look: u > .4 ? [.9, 0] : [.9, .2], brow: -.3, armR: TONG, armL: { h: [-30, 110], bend: -10 } }));
  rustyOut(t);
  boltu(Bo(t, { x: 790, face: u > .1 ? 1 : -1, look: u > .1 ? [.7, -.2] : [-.8, -.3], brow: .9, armR: talk('boltu', t).talking && u > .1 ? { h: [60, -20], bend: 16 } : { h: [14, 104], bend: 12 } }));
  const bx = lerp(1250, 980, eo(u));
  const cx = bx - 175, cy = FLOOR - 230;                                   // tray carried level at waist height
  const P = Bi(t, { x: bx, face: -1, look: [.5, 0], brow: .2, legL: walk(tq, u > 0 && u < 1)[0], legR: walk(tq, u > 0 && u < 1)[1],
    armR: { h: reach(BITHI, bx, -1, cx + 60, cy + 4), bend: 10 }, armL: { h: [-(cx + 120 - (bx + BITHI.shW)), cy - (FLOOR - BITHI.shY)], bend: -8 } });
  bithi(P); trayLoad(cx, cy, .55);
};
SH.tray = t => {   // she sets the tray on the bench, then holds up a nail
  const tq = q(t), k = t - T.setDown;
  cam(540, 1170, 1.55);
  set(t); bench(t);
  masked(t, M(t, { look: [.9, .3], brow: .2, armR: TONG, armL: { h: [-30, 110], bend: -10 } }));
  rustyOut(t);
  boltu(Bo(t, { x: 900, face: -1, look: [.7, .4], brow: .5, lean: -.06 }));
  const down = ss(clamp((k + .6) / .6)), cy = lerp(FLOOR - 230, JY, down), cx = 480;
  const lift = ss(seg(t, T.setDown + .5, T.setDown + 1.0));
  const nailAt = [TIX - 110, FLOOR - 470];
  const armR = lift > 0 ? lerpArm({ h: reach(BITHI, TIX, -1, cx + 170, cy - 6), bend: 10 }, { h: reach(BITHI, TIX, -1, nailAt[0], nailAt[1]), bend: 18 }, lift) : { h: reach(BITHI, TIX, -1, cx + 170, cy - 6), bend: 10 };
  const P = Bi(t, { face: -1, look: lift > .5 ? [.2, -.6] : [.6, .6], brow: .3, armR, armL: k < .3 ? { h: [-(cx + 140 - (TIX + BITHI.shW)) * 0 + 150, cy - (FLOOR - BITHI.shY)], bend: -8 } : { h: [-12, 140], bend: -12 } });
  if (lift > .3) P.holdR = hp => nail(hp[0] + 4, hp[1] - 30, .1, 1.1);
  bithi(P);
  if (k > -.05) { tray(cx, JY + 14); for (let i = 0; i < 3; i++) jar(JX[i], JY, i + 1, 0); } else trayLoad(cx, cy, 1);
};
const rust3 = t => ss(seg(t, T.lapse0 + .3, T.lapse1 - .2));
function jarTags(t) {
  if (t > T.j1 + .2) tag('পানি নেই', 240, 470, { bg: '#d8343c', fg: '#fff', size: 40 });
  if (t > T.j2 + .2) tag('বাতাস নেই', 540, 380, { bg: '#2b67c9', fg: '#fff', size: 40 });
  if (t > T.j3 + .2) tag('পানি + বাতাস', 830, 470, { bg: '#ffd65a', fg: INK, size: 40 });
}
SH.jarCU = t => {   // the fair test: her fingertip touches jar 1, 2, 3 as she names them
  cam(480, TTOP - 100, 3.0);
  set(t); bench(t);
  tray(480, JY + 14); for (let i = 0; i < 3; i++) jar(JX[i], JY, i + 1, 0);
  const keys = [[T.j1 - .3, 0], [T.j2 - .3, 1], [T.j3 - .3, 2]];
  let fx = JX[0], idx = 0;
  for (let i = 0; i < keys.length; i++) if (t >= keys[i][0]) idx = i;
  const prev = Math.max(0, idx - 1), u = ss(clamp((t - keys[idx][0]) / .3));
  fx = idx === 0 ? JX[0] : lerp(JX[prev], JX[idx], u);
  const tipX = fx + JW * .35, tipY = JY - 112, enter = ss(seg(t, LN.t2.t0 - .1, LN.t2.t0 + .25));
  const ox = lerp(160, 0, enter);
  shape(noodle([tipX + 260 + ox, tipY + 150], [tipX + 30 + ox, tipY + 6], 8, 34, 30), { fill: PAL.shirt, lw: 5 });   // sleeve
  shape(noodle([tipX + 34 + ox, tipY + 8], [tipX + ox, tipY], 0, 12, 11), { fill: PAL.skinT, lw: 4 });               // finger
  shape(ell(tipX + 40 + ox, tipY + 10, 22, 19, 16), { fill: PAL.skinT, lw: 5 });
  jarTags(t);
};
SH.lapse = t => {   // a few days later: sun and moon sweep, only nail 3 rusts
  cam(480, TTOP - 100, 3.0);
  set(t); bench(t);
  tray(480, JY + 14); for (let i = 0; i < 3; i++) jar(JX[i], JY, i + 1, rust3(t));
  const u = seg(t, T.lapse0, T.lapse1), night = Math.max(0, Math.sin(u * TAU * 2 - Math.PI / 2) * .5 + .5) * (1 - u * .2);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = .45 * night; g.fillStyle = '#10204a'; g.fillRect(0, 0, W, H); g.globalAlpha = 1;
  const a = (u * 2 % 1) * Math.PI; reset(); fillOnly(ell(540 - Math.cos(a) * 420, 330 - Math.sin(a) * 180, 46, 46, 30), night > .5 ? '#eef2ff' : '#ffd65a', { boil: .3 });
  tag('কয়েক দিন পর…', 540, 170, { size: 46 });
  jarTags(t + 99);
};
SH.boltuCU = t => {   // reaction close-up: only jar 3 rusted
  const m = talk('boltu', t);
  cam(BX - 80, FLOOR - 270, 2.3);
  set(t); bench(t);
  tray(480, JY + 14); for (let i = 0; i < 3; i++) jar(JX[i], JY, i + 1, 1);
  boltu(Bo(t, { face: -1, look: [.8, .6], eyeS: 1.22, pupil: 2.6, brow: 1.2, mouth: { o: m.o * 1.2 + (m.talking ? .08 : .4), w: m.w, sm: .1 }, armR: { h: cap(reach(BOLTU, BX, -1, JX[2] + 60, JY - 90), 140), bend: -6 } }));
};
SH.board = t => {   // the mechanism: oxygen from the air + water land on iron → orange rust that flakes off
  const a = LN.t3.t0, d = LN.t3.t1 - a, k = t - (a - .3);
  cam(540, 960, 1);
  bands(['#2e6f7a', '#2a6370', '#265866'], -100, 2100);
  reset(); shape(rr(70, 90, 940, 1100, 30), { fill: '#16343c', lw: 9 });
  const N = 14, hitAt = i => .4 + i * (d * .5 / N);
  let hits = [];
  for (let i = 0; i < N; i++) {
    const x = 170 + (i * 53) % 740, isO = i % 2 === 0, th = hitAt(i);
    if (k < th) { const y = lerp(260, 860, clamp(k / th) ** 1.5); reset(); if (isO) { dot(x - 13, y, 16, '#5aa9ff'); dot(x + 13, y, 16, '#5aa9ff'); } else shape(spline([[x, y - 22], [x + 14, y + 4], [x, y + 16], [x - 14, y + 4]]), { fill: '#bfe9ff', lw: 4 }); }
    else hits.push(x);
  }
  // iron block; each hit leaves an orange patch that grows; late patches flake upward
  reset(); shape(rect(140, 880, 800, 220), { fill: '#9aa3a8', lw: 7, shade: () => {
    fillOnly(rect(140, 880, 800, 26), '#c3cbd0', { boil: .2 });
    hits.forEach((x, j) => fillOnly(ell(x, 892, 30 + Math.min(40, (k - hitAt(j)) * 40), 22, 16), '#b5612a', { boil: .3 }));
  } });
  if (k > d * .6) for (let i = 0; i < 5; i++) { const kk = k - d * .6 - i * .25; if (kk > 0) { reset(); push(); translate(260 + i * 140, 870 - kk * 120); rotate(kk * 4); shape([[-12, -6], [10, -9], [13, 6], [-8, 9]], { fill: '#b5612a', lw: 3 }); pop(); } }
  tag('লোহা', 540, 1150, { bg: '#c3cbd0', fg: INK, size: 38 });
  if (k > .5) { tag('অক্সিজেন', 330, 180, { bg: '#5aa9ff', fg: INK, size: 36 }); tag('পানি', 760, 180, { bg: '#bfe9ff', fg: INK, size: 36 }); }
  if (k > d * .35) tag('লোহা + অক্সিজেন + পানি → মরিচা', 540, 330, { bg: '#ffd65a', fg: INK, size: 40 });
  if (t > a + d * .55) tag('রাসায়নিক বিক্রিয়া', 540, 520, { bg: '#ff6b5a', fg: '#fff', size: 60 });
  if (t > a + d * .82) { tag('রোগ', 540, 680, { bg: '#f4f1ea', fg: INK, size: 50 }); reset(); stroke([[460, 700], [620, 655]], 12, { line: '#d8343c' }); }
};
SH.gosol = t => {   // "then I'll never bathe!": he shoves the water bucket away (hand on the rim), crosses his arms
  const tq = q(t), k = t - T.bucket;
  cam(300, 1160, 1.7);
  set(t); bench(t);
  const slide = ss(clamp((k - .05) / .45)) * 170, bxp = 400 + slide;
  const rim = [bxp - 58, FLOOR - 108];
  const crossed = ss(clamp((k - .5) / .3));
  const push_ = k < .5 ? { h: reach(MAMA, MX, 1, k < 0 ? 380 : rim[0], k < 0 ? FLOOR - 200 : rim[1]), bend: 10 } : lerpArm({ h: reach(MAMA, MX, 1, rim[0], rim[1]), bend: 10 }, { h: [-70, -140], bend: -30 }, crossed);
  masked(t, M(t, { look: k < .5 ? [.8, .6] : [.1, -.7], brow: k < .5 ? .8 : -.6, armR: push_, armL: k < .5 ? { h: [-30, 120], bend: -10 } : lerpArm({ h: [-30, 120], bend: -10 }, { h: [130, -140], bend: 30 }, crossed) }));
  bucket(bxp, FLOOR);
  if (k > .05 && k < .5) for (let i = 0; i < 3; i++) stroke([[bxp + 70 + i * 4, FLOOR - 90 + i * 30], [bxp + 110 + i * 4, FLOOR - 90 + i * 30]], 4);
  if (k > 0 && k < .5) for (let i = 0; i < 2; i++) { const kk = k * 2 - i * .2; if (kk > 0) shape(ell(bxp - 20 + i * 30, FLOOR - 120 - kk * 60 + kk * kk * 90, 7, 9, 10), { fill: '#bfe9ff', lw: 3 }); }
};
SH.pause = t => {   // cold pause: Boltu and Bithi stare at Mama, one slow blink
  const tq = q(t), a = T.shots.find(s => s[2] === 'pause')[0];
  cam(780, 1150, 1.9);
  set(t); bench(t);
  const bl = tq > a + .55 && tq < a + .8;
  bithi(Bi(t, { face: -1, look: [.7, 0], lid: .4, blink: bl, brow: -.2, mouth: { o: 0, w: .7, sm: -.1 } }));
  boltu(Bo(t, { x: 900, face: -1, look: [.7, -.1], lid: .45, blink: bl, mouth: { o: 0, w: .7, sm: -.2 } }));
};
SH.deadpan = t => {   // "Mama, you're not made of iron." Mama's crossed arms drop
  const tq = q(t), k = t - LN.b4.t1;
  cam(500, 1150, 1.35);
  set(t); bench(t);
  bucket(570, FLOOR);
  const drop = ss(clamp((k + .2) / .4));
  masked(t, M(t, { look: k > -.2 ? [.3, .6] : [.8, 0], brow: k > -.2 ? -1 : -.4, worry: true, lid: .3, armR: lerpArm({ h: [-70, -140], bend: -30 }, REST.R, drop), armL: lerpArm({ h: [130, -140], bend: 30 }, REST.L, drop) }));
  boltu(Bo(t, { x: 780, face: -1, look: [.8, 0], lid: .5, brow: -.3, mouth: { ...talk('boltu', t), sm: -.1 } }));
};
SH.puzzle = t => {   // Bithi points back at the painted launch on the river, then turns to the viewer
  const tq = q(t), a = LN.t4.t0;
  const lx = 300 + (t - a) * 40;
  cam(TIX - 90, 1130, 1.9);
  set(t, { launchX: lx });
  bench(t);
  const turn = tq > a + 2.2;
  bithi(Bi(t, { face: -1, look: turn ? [0, 0] : [.6, -.6], headTilt: turn ? 0 : .05, brow: .5, armR: turn ? { h: [12, 140], bend: 12 } : { h: [110, -130], bend: 20 } }));
  if (t > a + .1) tag('ধাঁধা!', 540, 220, { bg: '#ffd65a', fg: INK, size: 64 });
  if (t > a + 1.2) { g.setTransform(1, 0, 0, 1, 0, 0); g.font = '800 150px "Baloo"'; g.textAlign = 'center'; g.lineWidth = 16; g.strokeStyle = INK; g.strokeText('?', 900, 560); g.fillStyle = '#ffd65a'; g.fillText('?', 900, 560); }
};
SH.end = t => {
  cam(540, 960, 1);
  bands(['#1d4c63', '#236178', '#2a7690'], -100, 2100);
  const pu0 = back(clamp((t - T.VEND) / .4), 1.6);
  reset(); push(); translate(540, 760); scale(pu0 * 2.2); rotate(.5); nail(0, -50, 0, 1, 1); pop();
  g.setTransform(1, 0, 0, 1, 0, 0); g.font = '800 120px "Baloo"'; g.textAlign = 'center'; g.textBaseline = 'middle';
  const kk = Math.floor(t * 12) % 3, jx = [0, 1.5, -1][kk], jy = [0, -1, 1.5][kk];
  const pu = back(clamp((t - T.VEND - .15) / .4), 1.6);
  g.save(); g.translate(540 + jx, 360 + jy); g.scale(pu, pu);
  g.lineWidth = 22; g.lineJoin = 'round'; g.strokeStyle = INK; g.strokeText('সাইন্টিফিক বিথী', 0, 0); g.fillStyle = '#ffd65a'; g.fillText('সাইন্টিফিক বিথী', 0, 0); g.restore();
  reset();
  mama(M(t, { x: 230, y: 1500, s: .66, look: [0, 0], mouth: { o: 0, w: 1, sm: .8 } }));
  bithi(Bi(t, { x: 540, y: 1500, s: .66, look: [0, 0], mouth: { o: 0, w: 1, sm: .8 } }));
  boltu(Bo(t, { x: 830, y: 1500, s: .7, look: [0, 0], mouth: { o: 0, w: 1, sm: .8 } }));
};
let lastSub = null;
const THUMB = new URLSearchParams(location.search).get('thumb');
window.render = t => {
  frame(t); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#b08a5c'; g.fillRect(0, 0, W, H);
  if (THUMB) {   // thumbnail cutouts: one character on a flat key colour, amazed (arms up, mouth open)
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#00ff00'; g.fillRect(0, 0, W, H); reset(); translate(540, 1700); scale(2.6); translate(-540, -1500);
    const amazed = { look: [.3, -.2], eyeS: 1.25, pupil: 2.8, brow: 1.2, mouth: { o: .75, w: .75, sm: .3 }, armL: { h: [-70, -130], bend: -20 }, armR: { h: [70, -130], bend: 20 }, blink: false };
    if (THUMB === 'bithi') bithi(Bi(0, { x: 540, ...amazed }));
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
