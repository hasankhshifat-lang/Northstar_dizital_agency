// Scientific Bithi Short 10 × Sci-Fi Sitcom Toon (9:16): "ঠান্ডা গ্লাসের গায়ে পানি কোথা থেকে?" — condensation (ঘনীভবন). No scientist.
// Setting: a railway platform tea stall on a hot afternoon (রেলস্টেশনের প্ল্যাটফর্মের চায়ের দোকান): tin roof, green pillars,
// a waiting train, the stall counter with a kettle steaming on a clay stove, biscuit jars, a banana bunch.
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
const FLOOR = 1500, TTOP = 1240, CL = 300, CR = 640, GX = 450, G2X = 560, MX = 190, BX = 800, TIX = 700;
const GH = 140, GW = 38;              // glass height, half-width at the top

// —— the railway platform tea stall ——
function platform(t) {
  bands(['#ffe9a8', '#ffe09a', '#ffd88a'], -900, 700);                                       // hot hazy sky
  fillOnly(ell(980, 120, 110, 110, 36), '#fff6c8', { boil: .3 });
  // the waiting train: green coach with a yellow stripe, barred windows
  shape(rr(-500, 520, 2300, 700, 30), { fill: '#2f7d5a', lw: 7, shade: () => { fillOnly(rect(-500, 960, 2300, 34), '#f2c230', { boil: .2 }); fillOnly(rect(-500, 520, 2300, 60), '#246548', { boil: .2 }); } });
  for (let x = -440; x < 1700; x += 210) { shape(rr(x, 640, 150, 170, 14), { fill: '#1f3442', lw: 6, shade: () => { for (let k = 1; k < 5; k++) fillOnly(rect(x + k * 30 - 3, 630, 6, 190), '#8fa4ad', { boil: .2 }); } }); }
  for (const dx_ of [380, 1250]) shape(rr(dx_, 610, 170, 380, 10), { fill: '#246548', lw: 6, shade: () => fillOnly(rect(dx_ + 70, 610, 8, 380), '#1b4b36', { boil: .2 }) });
  // tin roof edge + green pillars
  shape([[-600, -900], [1800, -900], [1800, 360], [-600, 360]], { fill: '#9aa3a8', lw: 7, shade: () => { for (let x = -600; x < 1800; x += 50) fillOnly(rect(x, 300, 22, 60), '#7f878c', { boil: .2 }); } });
  for (const px of [-120, 880, 1700]) shape(rect(px, 350, 46, 1160), { fill: '#2e8a4e', lw: 6, shade: () => fillOnly(rect(px + 26, 350, 20, 1160), '#226b3b', { boil: .2 }) });
  shape(rr(830, 420, 150, 90, 10), { fill: '#f4f1ea', lw: 6 }); text('প্ল্যাটফর্ম ২', 905, 466, { font: '800 30px "Baloo"' });
  // platform floor: concrete, yellow safety line
  shape(rect(-600, 1180, 2400, 1400), { fill: '#c9c2b4', lw: 7, shade: () => { fillOnly(rect(-600, 1180, 2400, 26), '#f2c230', { boil: .2 }); for (let k = 0; k < 7; k++) stroke([[-600, 1240 + k * k * 22], [1800, 1240 + k * k * 22]], 3, { line: '#b0a998' }); } });
  // heat shimmer above the platform (hot day: the reason the iced water is cold and the air is humid)
  for (let i = 0; i < 5; i++) { const x0 = -200 + i * 330, y0 = 1120 - ((t * 40 + i * 90) % 200); stroke(spline([[x0, y0], [x0 + 20, y0 - 30], [x0, y0 - 60], [x0 + 20, y0 - 90]], false, 6), 3, { line: 'rgba(255,255,255,.55)', boil: .5 }); }
}
// the stall behind the counter: awning, shelf with biscuit jars, banana bunch; the counter itself; kettle on a clay stove
function stallBack(t) {
  shape(rect(CL - 40, 720, CR - CL + 80, 520), { fill: '#a8703c', lw: 6, shade: () => fillOnly(rect(CL - 40, 720, CR - CL + 80, 30), '#7a4a28', { boil: .2 }) });
  shape(rect(CL - 20, 900, CR - CL + 40, 16), { fill: '#7a4a28', lw: 5 });
  for (let i = 0; i < 4; i++) { const x = CL + 30 + i * 80; shape(rr(x, 820, 60, 80, 10), { fill: '#eaf8ff', lw: 5, shade: () => fillOnly(rr(x + 6, 845, 48, 50, 8), ['#e8b05a', '#d8343c', '#f2c230', '#c98a5a'][i], { boil: .3 }) }); shape(rect(x + 8, 808, 44, 14), { fill: '#d8343c', lw: 4 }); }
  for (let k = 0; k < 6; k++) { push(); translate(CR - 10 + (k % 3) * 18, 960 + Math.floor(k / 3) * 26); rotate(.5); shape(spline([[-8, -22], [8, -24], [12, 20], [-6, 24]]), { fill: '#f5d23a', lw: 4 }); pop(); }
  stroke([[CR + 10, 750], [CR + 10, 950]], 4);
  // striped awning
  shape([[CL - 70, 640], [CR + 70, 640], [CR + 90, 740], [CL - 90, 740]], { fill: '#f4f1ea', lw: 6, shade: () => { for (let x = CL - 100; x < CR + 100; x += 60) fillOnly([[x, 630], [x + 30, 630], [x + 36, 750], [x + 6, 750]], '#2b67c9', { boil: .2 }); } });
  for (let x = CL - 90; x < CR + 90; x += 45) shape(arc(x + 22, 740, 22, 18, 0, Math.PI, 8), { fill: '#2b67c9', lw: 4, closed: true });
}
function counter(t, { steam = true } = {}) {
  shape(rect(CL, TTOP, CR - CL, FLOOR - TTOP), { fill: '#c9954f', lw: 7, shade: () => { fillOnly(rect(CR - 70, TTOP, 70, 300), '#a8742f', { boil: .3 }); for (let y = TTOP + 60; y < FLOOR; y += 60) stroke([[CL, y], [CR, y]], 3.5, { line: '#8e6228' }); } });
  shape(rect(CL - 16, TTOP - 18, CR - CL + 32, 22), { fill: '#7a4a28', lw: 6 });
  // clay stove + aluminium kettle at the right end (steam = it is a tea stall; it returns in the puzzle)
  const kx = CR - 40;
  shape([[kx - 40, TTOP - 18], [kx + 40, TTOP - 18], [kx + 34, TTOP - 70], [kx - 34, TTOP - 70]], { fill: '#b5532e', lw: 6, shade: () => fillOnly(ell(kx, TTOP - 40, 14, 10, 10), '#ff9a1f', { boil: .5 }) });
  shape(spline([[kx - 36, TTOP - 70], [kx + 36, TTOP - 70], [kx + 30, TTOP - 120], [kx, TTOP - 132], [kx - 30, TTOP - 120]]), { fill: '#c9d2db', lw: 6, shade: () => fillOnly(rect(kx + 8, TTOP - 140, 40, 80), '#97a3ae', { boil: .2 }) });
  shape(noodle([kx - 30, TTOP - 100], [kx - 64, TTOP - 128], 0, 12, 8), { fill: '#c9d2db', lw: 5 });
  stroke(arc(kx, TTOP - 132, 24, 20, Math.PI, TAU, 10), 5);
  if (steam) for (let i = 0; i < 3; i++) { const u = (t * .7 + i / 3) % 1, x0 = kx - 66 + Math.sin(u * 7 + i) * 10, y0 = TTOP - 140 - u * 160; fillOnly(ell(x0, y0, 12 + u * 18, 9 + u * 12, 14), `rgba(255,255,255,${.75 * (1 - u)})`, { boil: .6 }); }
}

// —— the iced glass: ice cubes, water (clear or red), condensation drops that bead, grow and roll; optional tape strips ——
const DROPS = Array.from({ length: 26 }, (_, i) => ({ u: hash(i * 3.7) * 1.7 - .85, v: .08 + hash(i * 5.1) * .8, ph: hash(i * 9.3) * 4, roll: hash(i * 2.2) > .72, r: 4 + hash(i * 1.3) * 4 }));
function iceGlass(x, y, t, { red = 0, tape = 0, dry = false, ice = true, wet = 1, onTape = true } = {}) {   // (x,y) = bottom centre
  const P = [[x - GW, y - GH], [x + GW, y - GH], [x + GW * .78, y], [x - GW * .78, y]];
  shape(P, { fill: '#eaf8ff', lw: 6, shade: () => {
    const wl = y - GH * .82;
    const wc = red > 0 ? `rgb(${Math.round(lerp(214, 222, red))},${Math.round(lerp(238, 52, red))},${Math.round(lerp(250, 60, red))})` : '#d6eefa';
    fillOnly(rect(x - 60, wl, 120, GH), wc, { boil: .3 });
    if (ice) for (const [dx_, dy_, a] of [[-14, 18, .2], [12, 30, -.3], [-4, 52, .5]]) { push(); translate(x + dx_, wl + dy_); rotate(a); shape(rr(-13, -13, 26, 26, 6), { fill: 'rgba(255,255,255,.85)', lw: 3.5 }); pop(); }
    fillOnly(rect(x - GW + 8, y - GH + 8, 7, GH - 20), 'rgba(255,255,255,.9)', { boil: .2 });
    if (!dry) for (const d of DROPS) {                                           // drops on the OUTSIDE wall: always clear water
      if (!onTape && tape > 0 && d.v > .3 && d.v < .6) continue;
      const age = ((t + d.ph) % 4), grow = clamp(age / 1.4) * wet;
      if (grow <= .05) continue;
      const fall = d.roll && age > 2.2 ? (age - 2.2) ** 2 * 70 : 0, yy = y - GH + d.v * GH + fall;
      if (yy > y - 4) continue;
      const xx = x + d.u * GW * lerp(1, .78, d.v), r = d.r * grow * (d.roll && age > 2.2 ? 1.25 : 1);
      shape(ell(xx, yy, r * .85, r, 12), { fill: 'rgba(240,252,255,.95)', lw: 2.5, boil: .3 });
      dot(xx - r * .3, yy - r * .35, Math.max(1, r * .28), '#ffffff');
      if (fall > 0) stroke([[xx, yy - r], [xx, yy - r - Math.min(30, fall)]], 2.5, { line: 'rgba(160,210,235,.9)', boil: .3 });
    }
  } });
  if (tape > 0) for (let k = 0; k < Math.min(2, Math.ceil(tape)); k++) {   // beige tape strips wrapped across the glass
    const yy = y - GH * (.62 - k * .26), a = k < Math.floor(tape) ? 1 : (tape % 1);
    shape([[x - GW - 6, yy - 12], [x - GW - 6 + (2 * GW + 12) * a, yy - 12], [x - GW - 6 + (2 * GW + 12) * a, yy + 12], [x - GW - 6, yy + 12]], { fill: 'rgba(236,214,160,.88)', lw: 4, line: '#8a6a3a' });
    if (onTape && !dry) for (let i = 0; i < 3; i++) { const age = (t + i * 1.3 + k) % 4, r = 5 * clamp(age / 1.2); if (r > 1 && a >= 1) { shape(ell(x - 22 + i * 22, yy, r * .85, r, 10), { fill: 'rgba(240,252,255,.95)', lw: 2.5, boil: .3 }); dot(x - 24 + i * 22, yy - 2, 1.5, '#fff'); } }
  }
  if (!dry) fillOnly(ell(x, y + 2, GW * 1.5 * wet, 7, 18), 'rgba(160,210,235,.75)', { boil: .3 });   // puddle on the counter
}
function plainGlass(x, y) { iceGlass(x, y, 0, { dry: true, ice: false }); }
function tapeRoll(x, y, s = 1) { push(); translate(x, y); scale(s); shape(ell(0, 0, 26, 26, 24), { fill: '#ecd6a0', lw: 5, shade: () => fillOnly(ell(6, 4, 18, 18, 18), '#d6b878', { boil: .2 }) }); shape(ell(0, 0, 11, 11, 14), { fill: '#c9c2b4', lw: 4 }); pop(); }
function dyeBottle(x, y, rot = 0) { push(); translate(x, y); rotate(rot); shape(rr(-12, -46, 24, 46, 6), { fill: '#f4fbff', lw: 5, shade: () => fillOnly(rect(-14, -30, 28, 32), '#d8343c', { boil: .2 }) }); shape(rect(-6, -58, 12, 14), { fill: '#d8343c', lw: 4 }); pop(); }
function clayCup(x, y, rot = 0) { push(); translate(x, y); rotate(rot); shape([[-24, -50], [24, -50], [16, 0], [-16, 0]], { fill: '#b5532e', lw: 5, shade: () => fillOnly(rect(6, -52, 24, 56), '#94401f', { boil: .2 }) }); fillOnly(ell(0, -50, 22, 6, 14), '#a8642c', { boil: .2 }); pop(); }
function magnifier(x, y, r, rot = 0) { push(); translate(x, y); rotate(rot); shape(noodle([r * .7, r * .7], [r * 1.6, r * 1.6], 0, 22, 22), { fill: '#7a4a28', lw: 6 }); shape(ell(0, 0, r + 10, r + 10, 40), { fill: null, lw: 14, line: INK }); shape(ell(0, 0, r + 10, r + 10, 40), { lw: 8, line: '#e0a24a' }); pop(); }

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

// —— shots ——
const SH = {};
const set = t => { platform(t); stallBack(t); };
SH.open = t => {   // hook: a sweating glass, a puddle, Mama slaps tape on the "leak"
  const tq = q(t), k = t - T.tape1;
  cam(330, 1180, 1.75);
  set(t); counter(t);
  iceGlass(GX, TTOP - 18, t + 2, { tape: k > 0 ? 1 : 0 });
  // right hand: holds the torn strip, presses it on the glass at tape1, pats it twice; left hand holds the roll at his chest
  const press = reach(MAMA, MX, 1, GX - GW + 6, TTOP - 18 - GH * .62);
  const ready = [press[0] - 50, press[1] - 70];
  const pat = k > 0 && k < 1.0 ? Math.max(0, Math.sin(k * 14)) * 14 : 0;
  const armR = k < -.25 ? { h: ready, bend: 20 } : { h: [lerp(ready[0], press[0], ss(seg(k, -.25, 0))), lerp(ready[1], press[1], ss(seg(k, -.25, 0))) - pat], bend: 12 };
  const P = M(t, { look: [.8, .5], brow: 1.1, eyeS: 1.12, nerv: .25, armR, armL: REST.L, mouth: talk('mama', t).talking ? M(t).mouth : { o: .3, w: .7, sm: -.3 } });

  if (k < 0) P.holdR = hp => strip(hp[0], hp[1], hp[0] + 40, hp[1] + 34, 20);
  mama(P);
  if (k > 0 && k < .25) for (let i = 0; i < 3; i++) stroke([[GX - 70 - i * 14, TTOP - 110 + i * 22], [GX - 100 - i * 14, TTOP - 118 + i * 22]], 4);
};
SH.tapeCU = t => {   // insert: new drops bead up ON the tape too; Boltu's finger points at them
  const u = seg(t, LN.b1.t0, LN.b1.t0 + .5);
  cam(GX + 20, TTOP - 90, 3.6);
  set(t); counter(t, { steam: false });
  iceGlass(GX, TTOP - 18, t + 2, { tape: 1 });
  const fx = lerp(GX + 210, GX + 62, eo(u)), fy = TTOP - 18 - GH * .62;
  shape(noodle([fx + 160, fy + 50], [fx + 24, fy + 4], 6, 30, 26), { fill: PAL.stripeY, lw: 5, shade: () => fillOnly(rect(fx + 60, fy - 40, 20, 120), PAL.stripeR, { boil: .2 }) });
  shape(noodle([fx + 30, fy + 6], [fx - 6, fy], 0, 12, 11), { fill: PAL.skinB, lw: 5 });
  shape(ell(fx + 32, fy + 8, 20, 17, 16), { fill: PAL.skinB, lw: 5 });
};
SH.mamaWrap = t => {   // stubborn: wraps the glass in a second strip, chin up
  const tq = q(t), k = t - T.tape2;
  cam(300, 1110, 2.0);
  set(t); counter(t);
  const tp = k < 0 ? 1 : 1 + ss(clamp(k / .5));
  iceGlass(GX, TTOP - 18, t + 2, { tape: tp });
  const yy = TTOP - 18 - GH * .36, sx = GX - GW - 6 + (2 * GW + 12) * clamp(k / .5);
  const P = M(t, { look: k < .6 ? [.8, .5] : [.3, -.2], brow: -.5, headTilt: k > .6 ? -.08 : 0, mouth: { ...M(t).mouth, sm: .1, skew: .25 },
    armR: { h: reach(MAMA, MX, 1, k < 0 ? GX - GW : Math.min(GX + GW, sx), yy), bend: 10 }, armL: REST.L });

  mama(P);
};
SH.enter = t => {   // wide: the platform. Boltu turns to Bithi as she walks up; she looks at the wrapped glass
  const tq = q(t), u = seg(t, LN.b2.t0 - .4, LN.b2.t1 + .1);
  cam(520, 1150, 1.08);
  set(t); counter(t);
  iceGlass(GX, TTOP - 18, t + 2, { tape: 2 });
  mama(M(t, { look: [.6, .4], brow: -.3, armL: REST.L, mouth: { o: 0, w: .9, sm: .1, skew: .2 } }));
  const bx = lerp(1250, TIX + 260, eo(u));
  const bo = Bo(t, { x: BX + 60, look: u > .15 ? [.7, -.1] : [-.6, .3], face: u > .15 ? 1 : -1, armR: talk('boltu', t).talking ? { h: [70, -10], bend: 20 } : { h: [14, 104], bend: 12 } });
  boltu(bo);
  bithi(Bi(t, { x: bx, face: -1, look: u < .9 ? [.5, 0] : [.6, .3], legL: walk(tq, u > 0 && u < 1)[0], legR: walk(tq, u > 0 && u < 1)[1], brow: .3, holdR: hp => dyeBottle(hp[0], hp[1] + 4) }));
};
SH.dyeTwo = t => {   // Bithi steps to the counter, holds the dye bottle over the glass and tips it
  const tq = q(t), a = LN.t1.t0, k = t - T.dye;
  cam(560, 1130, 1.6);
  set(t); counter(t);
  iceGlass(GX, TTOP - 18, t + 2, { tape: 2 });
  boltu(Bo(t, { x: BX + 80, face: -1, look: [.7, .4], brow: .6 }));
  const tip = [GX + 10, TTOP - 18 - GH - 70];
  const arm = poseTrack(tq, [[a, { h: [12, 140], bend: 12 }], [a + .25, { h: [60, -40], bend: 20 }], [T.dye - 1.3, { h: reach(BITHI, TIX, -1, tip[0] + 20, tip[1] + 50), bend: 16 }]]);
  const pour = clamp((t - (T.dye - .9)) / .5);
  const P = Bi(t, { face: -1, look: tq < a + 1.4 ? [.3, -.1] : [.6, .6], brow: .2, armR: arm });
  P.holdR = hp => dyeBottle(hp[0] - 6, hp[1] + 6, -pour * 2.2);
  bithi(P);
  if (k > 0) { const y = lerp(tip[1] + 36, TTOP - 18 - GH * .82, clamp(k / .35)); if (k < .35) shape(ell(GX + 4, y, 7, 10, 12), { fill: '#d8343c', lw: 3 }); }
};
SH.swirl = t => {   // insert: the red spreads INSIDE; every outside drop stays clear
  const k = t - T.dyeHit, red = ss(clamp(k / 1.6));
  cam(GX, TTOP - 95, 3.3);
  set(t); counter(t, { steam: false });
  iceGlass(GX, TTOP - 18, t + 2, { tape: 2, red });
  if (k > 0 && k < 1.6) { push(); for (let i = 0; i < 4; i++) { const a = k * 4 + i * 1.6, r = 6 + k * 14; fillOnly(ell(GX + Math.cos(a) * r * .8, TTOP - 18 - GH * .75 + Math.sin(a) * 5, 7 + k * 3, 4 + k * 2, 12), 'rgba(216,52,60,.75)', { boil: .5 }); } pop(); }
  if (t > T.dyeHit + 1.4) { tag('ভেতরের পানি লাল', 540, 410, { bg: '#d8343c', fg: '#fff', size: 40 }); tag('বাইরের ফোঁটা স্বচ্ছ', 540, 520, { bg: '#bfe9ff', fg: INK, size: 40 }); }
};
SH.boltuCU = t => {   // reaction: mouth open, finger at the clear drops
  const m = talk('boltu', t);
  cam(BX - 60, FLOOR - 270, 2.3);
  set(t); counter(t);
  iceGlass(GX, TTOP - 18, t + 2, { tape: 2, red: 1 });
  boltu(Bo(t, { face: -1, look: [.8, .5], eyeS: 1.22, pupil: 2.6, brow: 1.2, mouth: { o: m.o * 1.2 + (m.talking ? .08 : .4), w: m.w, sm: .1 }, armR: { h: [120, -40], bend: -10 } }));
};
SH.bithiPoint = t => {   // "not from inside": she taps the glass, shakes her head, then sweeps her open hand through the air
  const tq = q(t), a = LN.t2.t0;
  cam(600, 1110, 1.55);
  set(t); counter(t);
  iceGlass(GX, TTOP - 18, t + 2, { tape: 2, red: 1 });
  mama(M(t, { look: [.8, .2], brow: .4, armL: REST.L }));
  const tapP = reach(BITHI, TIX, -1, GX + GW + 4, TTOP - 80);
  const arm = poseTrack(tq, [[a - .2, { h: tapP, bend: 10 }], [a + 1.2, { h: tapP, bend: 10 }], [a + 1.6, { h: [-40, -160], bend: -20 }], [a + 2.6, { h: [80, -170], bend: 10 }]]);
  bithi(Bi(t, { face: -1, look: tq < a + 1.3 ? [.6, .6] : [.1, -.7], headTilt: tq < a + 1.3 ? Math.sin(tq * 9) * .05 : .05, armR: arm, brow: .4 }));
  boltu(Bo(t, { x: BX + 120, face: -1, look: tq < a + 1.3 ? [.7, .4] : [.3, -.7], eyeS: 1.1 }));
};
SH.lens = t => {   // magnifier view: the invisible vapour, made visible only inside the lens
  const a = LN.t2.t0;
  cam(GX + 60, TTOP - 120, 2.4);
  set(t); counter(t);
  iceGlass(GX, TTOP - 18, t + 2, { tape: 2, red: 1 });
  const lx = GX + 110, ly = TTOP - 150, R = 110;
  push(); const P = shape(ell(lx, ly, R, R, 44), { fill: 'rgba(225,245,255,.92)', lw: 0, line: null, shade: () => {
    for (let i = 0; i < 30; i++) { const vx = lx - R + ((hash(i) * 2 * R + t * (40 + 40 * hash(i + 1))) % (2 * R)), vy = ly - R + hash(i + 7) * 2 * R + Math.sin(t * 3 + i) * 8; dot(vx, vy, 6, '#2b67c9'); }
  } }); pop();
  magnifier(lx, ly, R, 0);
  // Bithi's hand on the handle (the magnifier is held, not floating)
  shape(ell(lx + R * 1.25, ly + R * 1.25, 24, 20, 16), { fill: PAL.skinT, lw: 5 });
  shape(noodle([lx + R * 1.3, ly + R * 1.3], [lx + R * 2.4, ly + R * 2.2], 6, 30, 32), { fill: PAL.shirt, lw: 5 });
  if (t > a + 4.3) tag('জলীয় বাষ্প: চোখে দেখা যায় না', 540, 260, { bg: '#2b67c9', fg: '#fff', size: 40 });
};
SH.board = t => {   // the mechanism: warm vapour hits the cold wall, slows, joins into a drop that grows and rolls
  const a = LN.t3.t0, d = LN.t3.t1 - a, k = t - (a - .9);
  cam(540, 960, 1);
  bands(['#2e6f7a', '#2a6370', '#265866'], -100, 2100);
  reset(); shape(rr(70, 90, 940, 1100, 30), { fill: '#16343c', lw: 9 });
  // cold glass wall (left), warm air (right)
  reset(); shape(rect(140, 160, 170, 960), { fill: '#bfe9ff', lw: 7, shade: () => { for (const [y, r] of [[300, .3], [560, -.2], [820, .5]]) { push(); translate(225, y); rotate(r); shape(rr(-40, -40, 80, 80, 12), { fill: '#ffffff', lw: 4 }); pop(); } } });
  tag('ঠান্ডা গ্লাস', 225, 1150, { bg: '#bfe9ff', fg: INK, size: 36 });
  tag('গরম বাতাস', 760, 1150, { bg: '#ff9a1f', fg: INK, size: 36 });
  // molecules: fast in the warm air, they drift to the wall, slow down and stick; the stuck ones merge into a growing drop
  const N = 30, stuckBy = i => .6 + i * (d * .55 / N);
  let stuck = 0;
  for (let i = 0; i < N; i++) {
    const ts = stuckBy(i), y0 = 300 + hash(i * 2.1) * 600;
    if (k < ts) { const fr = clamp(k / ts), x = lerp(900 - hash(i) * 200, 330, fr * fr) + Math.sin(k * 14 + i) * 30 * (1 - fr), y = y0 + Math.cos(k * 11 + i) * 40 * (1 - fr); reset(); dot(x, y, 15, '#5aa9ff'); if (fr < .7) { stroke([[x + 24, y], [x + 64, y]], 5, { line: 'rgba(90,169,255,.5)' }); } }
    else stuck++;
  }
  const dropR = 14 + stuck * 1.9, rollK = k - (d * .62 + .6), dy = rollK > 0 ? Math.min(1090 - 560 - dropR, rollK * rollK * 260) : 0;
  if (stuck > 0) { reset(); shape(ell(310 + dropR * .8, 560 + dy, dropR * .85, dropR, 24), { fill: '#e8f8ff', lw: 5 }); dot(310 + dropR * .5, 560 + dy - dropR * .35, dropR * .25, '#fff'); }
  for (let i = 0; i < 10; i++) { const kk = (k * 1.2 + i * .37) % 3; if (kk < 1.5) { reset(); dot(990 - kk * 300 + Math.sin(i) * 40, 260 + i * 85, 12, '#5aa9ff'); } }
  if (k > d * .35) tag('বাষ্প ঠান্ডা হয় → পানির ফোঁটা', 560, 230, { bg: '#ffd65a', fg: INK, size: 40 });
  if (t > a + d * .78) tag('ঘনীভবন', 640, 680, { bg: '#ff6b5a', fg: '#fff', size: 64 });
};
SH.compare = t => {   // the control: a plain-water glass right next to it stays dry
  const tq = q(t), k = t - T.glass2;
  cam(505, 1150, 2.15);
  set(t); counter(t, { steam: false });
  iceGlass(GX, TTOP - 18, t + 2, { tape: 2, red: 1 });
  const down = clamp(k / .5), gy = lerp(TTOP - 80, TTOP - 18, ss(down));
  plainGlass(G2X, gy);
  // Bithi's hand sets the glass down, then lifts away and points
  const lift = seg(t, T.glass2 + .7, T.glass2 + 1.1);
  const hx = G2X + GW + 14 + lift * 80, hy = gy - GH * .5 - lift * 40;
  shape(noodle([hx + 220, hy + 120], [hx + 10, hy + 4], 10, 34, 30), { fill: PAL.shirt, lw: 6 });
  shape(ell(hx + 8, hy + 2, 22, 20, 16), { fill: PAL.skinT, lw: 5 });
  if (t > LN.t4.t0 + .4) { tag('বরফ-পানি: ফোঁটা', 330, 760, { bg: '#bfe9ff', fg: INK, size: 36 }); tag('সাধারণ পানি: শুকনো', 730, 860, { bg: '#ffd65a', fg: INK, size: 36 }); }
};
SH.airTape = t => {   // Mama's "fix": he slaps tape at the air; it whips back onto his own moustache
  const tq = q(t), k = t - T.airTape;
  cam(330, 1060, 1.75);
  set(t); counter(t);
  iceGlass(GX, TTOP - 18, t + 2, { tape: 2, red: 1 }); plainGlass(G2X, TTOP - 18);
  const swing = k < 0 ? Math.sin(tq * 8) * .5 + .5 : 0;
  const P = M(t, { look: k < 0 ? [.4, -.8] : [0, 0], brow: k < 0 ? 1 : 1.3, eyeS: k > 0 ? 1.2 : 1,
    armR: k < 0 ? { h: [lerp(60, 150, swing), lerp(-200, -120, swing)], bend: 10 } : { h: [40, -150], bend: 30 }, armL: REST.L });

  if (k < 0) P.holdR = hp => strip(hp[0], hp[1], hp[0] + 30 + swing * 30, hp[1] - 110, 20);
  mama(P);
  if (k > 0) strip(MX - 56, FLOOR - 410 + 44, MX + 56, FLOOR - 410 + 36, 24);   // stuck across the moustache
  if (k > 0 && k < .25) for (let i = 0; i < 3; i++) stroke([[MX - 90 - i * 10, 1060 + i * 30], [MX - 130 - i * 10, 1060 + i * 30]], 4);
};
SH.pause = t => {   // cold pause: deadpan close-up, tape on the moustache, one slow blink
  const tq = q(t);
  cam(MX, FLOOR - 400, 2.4);
  set(t);
  mama(M(t, { look: [0, 0], lid: .45, brow: -.4, headTilt: 0, blink: tq > T.airTape + 1.1 && tq < T.airTape + 1.3, mouth: { o: 0, w: .8, sm: -.3 }, armR: { h: [16, 150], bend: 14 }, armL: { h: [-16, 150], bend: -14 } }));
  strip(MX - 56, FLOOR - 410 + 44, MX + 56, FLOOR - 410 + 36, 24);
};
SH.puzzle = t => {   // Bithi sips hot tea from a clay cup; her glasses fog up -> the puzzle
  const tq = q(t), a = LN.t5.t0, k = t - T.sip;
  cam(TIX - 60, FLOOR - 380, 2.0);
  set(t); counter(t);
  const up = ss(seg(t, T.sip - .4, T.sip)) * (1 - ss(seg(t, T.sip + .7, T.sip + 1.0)));
  const cupAt = [TIX - 10, FLOOR - 418 + 70];
  const P = Bi(t, { face: 1, headTilt: 0, look: k > 0 && k < 1.2 ? [0, .3] : [-.2, 0], lid: k > 0 && k < .8 ? .5 : 0, mouth: k > 0 && k < .7 ? { o: 0, w: .5, sm: 0 } : Bi(t).mouth,
    armR: lerpArm({ h: [70, -10], bend: 30 }, { h: reach(BITHI, TIX, 1, cupAt[0] + 30, cupAt[1] + 40), bend: 40 }, up) });
  P.holdR = hp => { clayCup(hp[0] - 6, hp[1] + 8); for (let i = 0; i < 3; i++) { const u = (t * .8 + i / 3) % 1; fillOnly(ell(hp[0] - 6 + Math.sin(u * 6 + i) * 8, hp[1] - 50 - u * 90, 8 + u * 12, 6 + u * 8, 12), `rgba(255,255,255,${.8 * (1 - u)})`, { boil: .6 }); } };
  bithi(P);
  const fog = clamp(k / .5) * (1 - clamp((t - (a + 3.6)) / 1));
  if (fog > 0) for (const ex of [-28, 28]) fillOnly(ell(TIX + ex, FLOOR - 418 - 4, 27, 27, 24), `rgba(250,252,255,${.88 * fog})`, { boil: .4 });
  if (t > a + .2) tag('ধাঁধা!', 540, 220, { bg: '#ffd65a', fg: INK, size: 64 });
  if (k > .3) { g.setTransform(1, 0, 0, 1, 0, 0); g.font = '800 150px "Baloo"'; g.textAlign = 'center'; g.lineWidth = 16; g.strokeStyle = INK; g.strokeText('?', 900, 560); g.fillStyle = '#ffd65a'; g.fillText('?', 900, 560); }
};
SH.end = t => {
  cam(540, 960, 1);
  bands(['#1d4c63', '#236178', '#2a7690'], -100, 2100);
  const pu0 = back(clamp((t - T.VEND) / .4), 1.6);
  reset(); push(); translate(540, 780); scale(pu0); shape(spline([[0, -150], [90, 10], [70, 100], [0, 140], [-70, 100], [-90, 10]]), { fill: '#bfe9ff', lw: 9, shade: () => fillOnly(ell(-30, 30, 22, 34, 14), '#ffffff', { boil: .3 }) }); pop();
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
  frame(t);
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
