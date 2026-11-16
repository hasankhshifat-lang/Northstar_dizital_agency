// Scientific Bithi × Sci-Fi Sitcom Toon — 30 s demo (9:16). "ভারী জিনিস কি আগে পড়ে?" with a Newton cameo.
import { clamp, lerp, seg, ss, eo, ei, back, hash, TAU } from '/core/lib.js';
import { W, H, INK, init, frame, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, rr, rect, spline, dot, text, reset, bands, noodle } from './toon.js';
import { mama, bithi, boltu, newton, pumpkin, lemon, stool, tubBack, tubFront, PAL } from './chars.js';

init(document.getElementById('c'));
const J = async f => { try { const r = await fetch(f); if (r.ok) return await r.json(); } catch (e) { } return null; };
const TL = await J('timeline.json'), LIPS = (await J('voices/lips.json')) || {}, T = await J('cues.json');
const LN = Object.fromEntries(TL.lines.map(l => [l.id, l]));
window.DUR = T.DUR;
const q = t => Math.floor(t * 12 + 1e-6) / 12;          // characters on twos

// —— lip sync from the voice envelopes (stepped at 12 fps) ——
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

// —— camera (one world→screen function) ——
function cam(cx, cy, z, shake = 0, t = 0) {
  reset(); translate(W / 2, H / 2);
  if (shake) { const f = Math.floor(t * 24); translate((hash(f) - .5) * shake * 2, (hash(f + 77) - .5) * shake * 2); }
  scale(z); translate(-cx, -cy);
}

// —— the Dhaka rooftop (flat colour bands, one palette) ——
const FLOOR = 1500, MX = 300, MY = FLOOR - 112, TX = 300, TY = FLOOR + 12, TW = 440, BX = 730, TIX = 930, PX = 575, PY = FLOOR - 205;
function roof(t, { amb = 0 } = {}) {
  bands(['#7cc8f2', '#9fd8f6', '#c4e8f8', '#ffe2a8'], -900, 1250);
  shape(ell(140, 420, 70, 70, 36), { fill: '#fff3c4', lw: 6 });
  // skyline: flat blocks with window grids
  const B = [[-220, 900, 230, '#d9b38c'], [20, 760, 170, '#c9a0b8'], [200, 960, 200, '#a9c7b0'], [420, 700, 150, '#e0c27a'], [580, 880, 220, '#b8b0d6'], [810, 820, 160, '#d79a7e'], [980, 940, 260, '#9fbfd0']];
  for (const [x, y, w, c] of B) shape(rect(x, y, w, 1300 - y), { fill: c, lw: 6, shade: () => { for (let yy = y + 40; yy < 1220; yy += 70) for (let xx = x + 24; xx < x + w - 30; xx += 52) fillOnly(rect(xx, yy, 24, 34), 'rgba(40,40,70,.28)', { boil: .2 }); fillOnly(rect(x + w * .7, y, w * .3, 1300 - y), 'rgba(0,0,0,.1)', { boil: .2 }); } });
  // clothesline with a gamchha and a shirt
  stroke([[90, 1060], [90, 1260]], 7); stroke([[1000, 1040], [1000, 1260]], 7);
  stroke(spline([[90, 1070], [545, 1110], [1000, 1050]], false, 10), 4);
  const sw = Math.sin(t * 1.3) * 4;
  shape([[180, 1078], [290, 1086], [296 + sw, 1220], [186 + sw, 1214]], { fill: PAL.gam, lw: 6, shade: () => { for (let k = 0; k < 4; k++) fillOnly(rect(160, 1100 + k * 30, 160, 5), '#fff', { boil: .2 }); } });
  shape([[700, 1094], [820, 1084], [834, 1110], [806, 1118], [806 + sw, 1210], [726 + sw, 1214], [722, 1120], [692, 1116]], { fill: '#6fc3a8', lw: 6 });
  // parapet wall + cap
  shape(rect(-400, 1250, 1900, 260), { fill: '#e9c79a', lw: 7, shade: () => { for (let x = -380; x < 1500; x += 120) stroke([[x, 1270], [x, 1500]], 3, { line: '#cfa877' }); fillOnly(rect(-400, 1430, 1900, 80), '#d8b07e', { boil: .2 }); } });
  shape(rect(-400, 1232, 1900, 30), { fill: '#f4dcb6', lw: 6 });
  // black water tank on its stand (right) and potted chillies (left)
  shape(rect(1040, 1300, 200, 200), { fill: '#7d8288', lw: 6 });
  shape(rr(1020, 1010, 240, 300, 40), { fill: '#2b2b33', lw: 7, shade: () => { for (let k = 0; k < 4; k++) fillOnly(rect(1000, 1060 + k * 60, 280, 10), '#3d3d48', { boil: .2 }); fillOnly(rect(1180, 1000, 90, 320), '#1c1c22', { boil: .2 }); } });
  shape([[-60, 1400], [40, 1400], [26, 1500], [-46, 1500]], { fill: '#c0653a', lw: 6 });
  for (const [x, y] of [[-30, 1360], [0, 1330], [20, 1370]]) shape(ell(x, y, 26, 14, 16), { fill: '#3f9b45', lw: 5 });
  for (const [x, y] of [[-20, 1350], [14, 1380]]) shape(spline([[x, y], [x + 6, y + 18], [x, y + 34], [x - 4, y + 16]]), { fill: '#e2342b', lw: 4 });
  // terracotta floor tiles
  shape(rect(-400, FLOOR, 1900, 1400), { fill: '#d7845a', lw: 7, shade: () => { for (let k = 0; k < 8; k++) stroke([[-400, FLOOR + 40 + k * k * 18 + k * 30], [1500, FLOOR + 40 + k * k * 18 + k * 30]], 3.5, { line: '#b9693f' }); for (let x = -400; x < 1600; x += 140) stroke([[x, FLOOR], [x + (x - 540) * .9, FLOOR + 900]], 3.5, { line: '#b9693f' }); } });
  if (amb) fillOnly(rect(-400, -900, 1900, 3800), `rgba(90,230,255,${.12 * amb})`, { boil: 0 });   // portal wash
}

// —— the portal: cyan ring + gold sparks (the only glowing thing in the film) ——
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

// —— default poses ——
const REST = { L: { h: [-16, 150], bend: -14 }, R: { h: [16, 150], bend: 14 } };
function M(t, o = {}) { const m = talk('mama', t); return { x: MX, y: MY, s: 1, t, look: [.3, .2], mouth: { o: m.o, w: m.w, sm: .25 }, headTilt: m.talking ? (m.o - .3) * .06 : Math.sin(q(t) * 1.6) * .02, sq: 1 + .008 * Math.sin(q(t) * 2.3), blink: blinks(t, 1), ...o }; }
function Bo(t, o = {}) { const m = talk('boltu', t); return { x: BX, y: FLOOR, s: 1, t, look: [-.5, -.1], mouth: { o: m.o * 1.15, w: m.w, sm: .1 }, headTilt: m.talking ? (m.o - .3) * .08 : 0, sq: 1 + .012 * Math.sin(q(t) * 3.1), blink: blinks(t, 2), armL: { h: [-14, 104], bend: -12 }, armR: { h: [14, 104], bend: 12 }, ...o }; }
function Bi(t, o = {}) { const m = talk('bithi', t); return { x: TIX, y: FLOOR, s: 1, t, look: [-.4, 0], mouth: { o: m.o, w: m.w, sm: .35 }, headTilt: m.talking ? (m.o - .3) * .06 : 0, sq: 1 + .008 * Math.sin(q(t) * 2.1), blink: blinks(t, 3), armL: { h: [-12, 140], bend: -12 }, armR: { h: [12, 140], bend: 12 }, ...o }; }
function Nw(t, o = {}) { const m = talk('newton', t); return { x: PX, y: FLOOR, s: 1, t, look: [0, 0], lid: .42, mouth: { o: m.o, w: m.w, sm: 0 }, headTilt: m.talking ? (m.o - .3) * .05 : 0, sq: 1 + .006 * Math.sin(q(t) * 1.9), blink: blinks(t, 4), armL: { h: [-14, 150], bend: -12 }, armR: { h: [14, 150], bend: 12 }, ...o }; }
const lerpArm = (a, b, u) => ({ h: [lerp(a.h[0], b.h[0], u), lerp(a.h[1], b.h[1], u)], bend: lerp(a.bend, b.bend, u), fist: u > .5 ? b.fist : a.fist });
const poseTrack = (tq, keys) => { let p = keys[0][1]; for (let i = 0; i < keys.length - 1; i++) { const [ta, a] = keys[i], [tb, b] = keys[i + 1]; if (tq >= ta && tq < tb) return lerpArm(a, b, ss(seg(tq, ta, Math.min(tb, ta + .3)))); if (tq >= tb) p = b; } return p; };

// —— the experiment: where the pumpkin and the lemon are ——
const HOLD = { L: { h: [-90, 34], bend: -10 }, R: { h: [90, 34], bend: 10 } };   // arms out over the tub
const handW = side => [MX + (side < 0 ? -74 - 90 : 74 + 90), MY - 318 + 34];
const FALL = TY - 56;                                                        // sand surface
function fallen(t, side, rObj) {
  const [hx, hy] = handW(side), y0 = hy + rObj * .9;
  if (t < T.drop) return null;
  const u = clamp((t - T.drop) / (T.hit - T.drop));
  return [hx, lerp(y0, FALL - rObj * .4, u * u), u];
}
function experiment(t, { holding = true } = {}) {
  tubBack(TX, TY, TW);
  for (const [side, r] of [[-1, 52], [1, 20]]) {
    const f = fallen(t, side, r); if (!f) continue;
    const [x, y, u] = f;
    if (u < 1) for (let k = 1; k <= 3; k++) stroke([[x - r * .5, y - r - k * 26 * u], [x - r * .5, y - r - k * 26 * u - 30 * u]], 4, { line: 'rgba(27,20,34,.5)' });
    side < 0 ? pumpkin(x, y, .84, { rot: u * .3 }) : lemon(x, y, 1, { rot: u * .6 });
  }
  tubFront(TX, TY, TW);
  const k = t - T.hit;                                                          // sand puffs on impact
  if (k > 0 && k < .7) for (let i = 0; i < 14; i++) { const a = Math.PI * (1.1 + .8 * hash(i)), d = 40 + 160 * eo(k / .7) * hash(i + 3), side = i % 2 ? -1 : 1; const [hx] = handW(side); dot(hx + Math.cos(a) * d, FALL - 10 + Math.sin(a) * d * .7, (7 + 6 * hash(i + 5)) * (1 - k / .7), '#e7cf95'); }
}
function mamaWithObjects(t, o = {}) {
  const dropped = t >= T.drop;
  const P = M(t, { armL: dropped ? lerpArm(HOLD.L, { h: [-120, -40], bend: -10 }, ss(seg(t, T.drop, T.drop + .25))) : HOLD.L, armR: dropped ? lerpArm(HOLD.R, { h: [120, -40], bend: 10 }, ss(seg(t, T.drop, T.drop + .25))) : HOLD.R, ...o });
  if (!dropped) { P.holdL = hp => pumpkin(hp[0], hp[1] + 44, .84); P.holdR = hp => lemon(hp[0], hp[1] + 18, 1); }
  return P;
}

// —— subtitles + speaker pill (part of the style) ——
const NAME = { mama: ['মামা', '#f5b81c'], boltu: ['বল্টু', '#e2453a'], bithi: ['বিথী', '#2b67c9'], newton: ['নিউটন', '#7a4a28'] };
function chunks(L) {   // long lines are shown in sentence chunks, timed by length
  const parts = L.text.split(/(?<=[!?।…])\s+/).filter(Boolean); const tot = parts.reduce((a, p) => a + p.length, 0); let t = L.t0; const d = L.t1 - L.t0;
  return parts.map(p => { const c = { t0: t, t1: t + d * p.length / tot, text: p }; t = c.t1; return c; });
}
const SUBS = TL.lines.flatMap(L => chunks(L).map(c => ({ ...c, who: L.who })));
function subtitle(t) {
  const s = SUBS.find(c => t >= c.t0 - .05 && t < c.t1 + .25); if (!s) return null;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.font = '800 54px "Baloo"'; g.textAlign = 'center'; g.textBaseline = 'middle';
  const words = s.text.split(' '), linesOut = []; let cur = '';
  for (const w of words) { const tr = cur ? cur + ' ' + w : w; if (g.measureText(tr).width > 940 && cur) { linesOut.push(cur); cur = w; } else cur = tr; }
  linesOut.push(cur);
  const y0 = 1430 - (linesOut.length - 1) * 33;
  const [nm, col] = NAME[s.who];
  reset(); shape(rr(540 - 80, y0 - 100, 160, 52, 22), { fill: col, lw: 5 });
  g.setTransform(1, 0, 0, 1, 0, 0); g.font = '800 34px "Baloo"'; g.fillStyle = '#fff'; g.lineWidth = 6; g.strokeStyle = INK; g.strokeText(nm, 540, y0 - 73); g.fillText(nm, 540, y0 - 73);
  g.font = '800 54px "Baloo"';
  linesOut.forEach((l, i) => { const y = y0 + i * 66; g.lineWidth = 11; g.lineJoin = 'round'; g.strokeStyle = INK; g.strokeText(l, 540, y); g.fillStyle = '#fff'; g.fillText(l, 540, y); });
  return { text: s.text, y0: y0 - 100, y1: y0 + linesOut.length * 66 };
}
function tag(str, x, y, { bg = '#1b1422', fg = '#ffd65a', size = 42, w = null } = {}) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.font = `800 ${size}px "Baloo"`; const tw = w ?? g.measureText(str).width + 50;
  reset(); shape(rr(x - tw / 2, y - size * .75, tw, size * 1.5, 18), { fill: bg, lw: 6 });
  g.setTransform(1, 0, 0, 1, 0, 0); g.font = `800 ${size}px "Baloo"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = fg; g.fillText(str, x, y + 2);
}

// —— shots ——
const SH = {};
SH.open = t => {
  cam(lerp(440, 450, seg(t, 0, 3.65)), 1262, lerp(1.4, 1.5, ss(seg(t, 0, 3.65))));
  roof(t); stool(MX, FLOOR); experiment(t);
  mama(mamaWithObjects(t, { look: [.3, .1], brow: .5, mouth: { ...M(t).mouth, sm: .5 } }));
  boltu(Bo(t, { look: [-.6, -.3], nerv: .5, brow: 1 }));
  experiment.front = true;
};
SH.insert = t => {
  const sh = t > T.hit && t < T.hit + .35 ? 16 * (1 - seg(t, T.hit, T.hit + .35)) : 0;
  cam(TX, FALL - 90, 1.85, sh, t);
  roof(t); experiment(t);
};
SH.boltuCU = t => {
  cam(BX, FLOOR - 330, 2.35);
  roof(t); boltu(Bo(t, { look: [-.7, .2], nerv: .9, eyeS: 1.15, pupil: 2.8, brow: 1.2, mouth: { o: talk('boltu', t).o * 1.2, w: talk('boltu', t).w, sm: .2 }, armL: { h: [-60, -40], bend: -20 }, armR: { h: [60, -40], bend: 20 } }));
};
SH.mamaCU = t => {
  cam(MX, MY - 430, 2.25);
  roof(t); stool(MX, FLOOR); experiment(t);
  mama(M(t, { look: [.15, .7], lid: .48, brow: -.4, mouth: { ...M(t).mouth, sm: -.25, skew: .3 }, blink: q(t) > 9.0 && q(t) < 9.17 }));
};
SH.summon = t => {
  const tq = q(t);
  cam(lerp(800, 820, seg(t, 9.6, 17)), 1300, lerp(1.7, 1.78, seg(t, 9.6, 17)));
  roof(t); experiment(t);
  boltu(Bo(t, { look: [.6, -.2], brow: .4 }));
  const s0 = LN.t1.t0, d = LN.t1.t1 - s0;
  const arms = poseTrack(tq, [[s0, REST.R], [s0 + .1, { h: [70, 80], bend: 30 }], [s0 + d * .2, { h: [40, -150], bend: 20, fist: true }], [s0 + d * .36, { h: [100, -140], bend: 10 }], [s0 + d * .55, { h: [30, 60], bend: 40 }], [s0 + d * .82, { h: [-20, 40], bend: 40 }], [s0 + d + .3, { h: [80, -150], bend: 10 }]]);
  const armsL = { h: [-arms.h[0], arms.h[1]], bend: -arms.bend };
  bithi(Bi(t, { look: tq > s0 + d * .3 && tq < s0 + d * .55 ? [-.2, -.8] : [-.5, -.1], armR: arms, armL: tq > s0 + d * .3 ? armsL : REST.L, brow: .6 }));
  const op = popOpen(t - (s0 + d + .25)); portal(PX, PY, 190, t, op * .8);
};
SH.portal = t => {
  const tq = q(t);
  cam(640, 1150, 1.05);
  const op = t < T.pClose ? Math.max(.8, popOpen(t - 17.0)) : 1 - ei(seg(t, T.pClose, T.pClose + .3));
  roof(t, { amb: op }); stool(MX, FLOOR); experiment(t);
  mama(M(t, { look: [.9, 0], eyeS: 1.15, pupil: 3, brow: 1, mouth: { o: .5, w: .8, sm: 0 } }));
  portal(PX, PY, 190, t, op);
  const u = seg(t, T.nOut[0], T.nOut[1]);
  if (t >= T.nOut[0]) newton(Nw(t, { s: lerp(.35, 1, eo(u)), y: lerp(PY + 60, FLOOR, eo(u)), legL: u < 1 ? [Math.sin(tq * 12) * 18, -Math.max(0, Math.cos(tq * 12)) * 12] : [0, 0], legR: u < 1 ? [-Math.sin(tq * 12) * 18, -Math.max(0, -Math.cos(tq * 12)) * 12] : [0, 0], look: [.6, 0] }));
  const hop = seg(tq, 17.08, 17.45);
  boltu(Bo(t, { x: BX + 40 * eo(hop), y: FLOOR - Math.sin(hop * Math.PI) * 60, look: [-.8, 0], nerv: 1, eyeS: 1.2, pupil: 2.6, mouth: { o: .7, w: .7, sm: -.4 }, armL: hop > 0 && hop < 1 ? { h: [-50, -110], bend: -30 } : { h: [-40, 70], bend: -20 }, armR: hop > 0 && hop < 1 ? { h: [50, -110], bend: 30 } : { h: [40, 70], bend: 20 } }));
  bithi(Bi(t, { look: [-.8, 0], mouth: { o: .3, w: .9, sm: .8 }, armR: { h: [80, -150], bend: 10 }, armL: { h: [-80, -150], bend: -10 } }));
  if (t > T.label) tag('আইজ্যাক নিউটন (১৬৪৩–১৭২৭)', 540, 210, { size: 44 });
};
SH.demo = t => {
  const tq = q(t), a = T.shots.find(s => s[2] === 'demo')[0];
  cam(540, 960, 1);
  bands(['#2e6f7a', '#2a6370', '#265866'], -100, 2100);
  // replay screen
  shape(rr(70, 90, 940, 880, 30), { fill: '#16343c', lw: 9, shade: () => { for (let y = 100; y < 970; y += 8) fillOnly(rect(70, y, 940, 2), 'rgba(255,255,255,.035)', { boil: 0 }); } });
  tag('স্লো-মো রিপ্লে', 540, 150, { bg: '#ffd65a', fg: INK, size: 40 });
  // strobe: positions every 0.1 s of the 0.45 s fall; the gaps grow the same way for both
  const N = 5, yTop = 260, yBot = 830, shown = Math.floor(clamp((t - a - .25) / 1.6) * N + 1e-6);
  for (let k = 0; k <= Math.min(N, shown); k++) {
    const y = yTop + (yBot - yTop) * (k / N) ** 2, al = k === shown ? 1 : .35;
    g.globalAlpha = al; reset(); pumpkin(360, y, .62); lemon(720, y, 1.3); g.globalAlpha = 1;
    if (k > 0) { reset(); stroke([[180, y], [900, y]], 3, { line: 'rgba(255,214,90,.6)' }); }
  }
  if (t > a + 2.2) { for (const x of [470, 830]) { reset(); shape([[x - 12, 340], [x + 12, 340], [x + 12, 560], [x + 30, 560], [x, 610], [x - 30, 560], [x - 12, 560]], { fill: '#ff6b5a', lw: 6 }); } }
  if (t > a + 2.4) { tag('অভিকর্ষ (g)', 650, 670, { bg: '#ff6b5a', fg: '#fff', size: 38 }); }
  if (t > a + 3.0) tag('ভারী-হালকা: একই ত্বরণ', 540, 915, { size: 40 });
  // air resistance aside: a feather drifts slowly
  if (t > T.air) {
    const u = seg(t, T.air, T.air + 3); reset();
    push(); translate(880 + Math.sin(u * 9) * 30, 330 + u * 380); rotate(Math.sin(u * 9) * .5);
    shape(spline([[0, -50], [16, -20], [12, 30], [0, 50], [-12, 30], [-16, -20]]), { fill: '#f4f1ea', lw: 5 }); stroke([[0, -50], [0, 60]], 3);
    pop();
    for (let k = 0; k < 3; k++) { reset(); stroke(arc(880 + (k - 1) * 40, 300 + u * 380 + 90, 22, 10, Math.PI, TAU, 8), 4, { line: '#bfe9ff' }); }
    tag('বাতাসের বাধা', 860, 230 + 40, { bg: '#bfe9ff', fg: INK, size: 32 });
  }
  // Newton below, gesturing at the screen
  const arm = poseTrack(tq, [[a, { h: [14, 150], bend: 12 }], [a + .4, { h: [70, -160], bend: 10 }], [a + 3.2, { h: [70, -160], bend: 10 }], [a + 3.6, { h: [90, 40], bend: 30 }]]);
  newton(Nw(t, { x: 300, y: 1660, s: 1.12, look: tq < a + 3.4 ? [.3, -.6] : [0, 0], armR: arm }));
};
SH.mamaAsk = t => {
  cam(MX + 20, MY - 420, 2.15);
  roof(t); stool(MX, FLOOR); experiment(t);
  mama(M(t, { look: [.8, -.2], lid: .3, brow: .8, mouth: { ...M(t).mouth, sm: .55, skew: -.3 }, headTilt: -.08, armR: { h: [40, -80], bend: 30, fist: true } }));
};
SH.pause = t => {
  cam(PX, FLOOR - 360, lerp(1.7, 1.82, seg(t, 28.7, 29.7)));
  roof(t); experiment(t);
  newton(Nw(t, { look: [-.5, 0], lid: .55, blink: false }));
};
SH.newtonCU = t => {
  cam(PX, FLOOR - 440, 2.3);
  roof(t);
  newton(Nw(t, { look: [-.5, 0], lid: .55, blink: q(t) > 31.4 && q(t) < 31.55, mouth: { ...Nw(t).mouth, sm: -.1 } }));
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
  const wv = Math.sin(q(t) * 10) * 20;
  reset(); translate(0, 0);
  mama(M(t, { x: 170, y: 1500, s: .62, look: [0, 0], mouth: { o: 0, w: 1, sm: .8 }, armR: { h: [60, -130 + wv], bend: 20 } }));
  bithi(Bi(t, { x: 420, y: 1500, s: .62, look: [0, 0], mouth: { o: 0, w: 1, sm: .8 }, armR: { h: [60, -130 - wv], bend: 20 } }));
  boltu(Bo(t, { x: 650, y: 1500, s: .66, look: [0, 0], mouth: { o: 0, w: 1, sm: .8 }, armR: { h: [50, -100 + wv], bend: 20 } }));
  newton(Nw(t, { x: 890, y: 1500, s: .6, look: [0, 0], lid: .55, mouth: { o: 0, w: 1, sm: 0 } }));
};

// —— frame ——
let lastSub = null;
window.render = t => {
  frame(t);
  const s = T.shots.find(s => t >= s[0] && t < s[1]) || T.shots[T.shots.length - 1];
  SH[s[2]](t);
  lastSub = (s[2] === 'end') ? null : subtitle(t);
};
window.TEXTS = t => { window.render(t); return lastSub ? [{ id: lastSub.text, text: lastSub.text, x0: 60, y0: lastSub.y0, x1: 1020, y1: lastSub.y1 }] : []; };
window.EV = [];
await document.fonts.load('800 54px "Baloo"', 'সাইন্টিফিক বিথী AMB');
await document.fonts.ready;
window.READY = true;
