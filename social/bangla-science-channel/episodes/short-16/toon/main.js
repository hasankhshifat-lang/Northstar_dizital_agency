// Scientific Bithi Short 16 × Sci-Fi Sitcom Toon (9:16): "রংধনু কেন ধরা যায় না?" — rainbow: dispersion of white light (Newton's prism), raindrops as prisms.
// Scientist: Isaac Newton (portal cameo). Setting: a paddy field after an afternoon shower (raised earth aal, puddles, palm trees, rain clouds in the east, sun low in the west behind the viewer).
import { clamp, lerp, seg, ss, eo, ei, back, hash, TAU } from '/core/lib.js';
import { W, H, INK, init, frame, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, rr, rect, spline, dot, text, reset, bands, noodle } from './toon.js';
import { mama, bithi, boltu, newton, eye, PAL, MAMA, BOLTU, BITHI, NEWTON } from './chars.js';

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
const FLOOR = 1500, MX = 330, BX = 840, TIX = 720, PX = 250, PY = 1180;

// —— paddy field after an afternoon shower (বৃষ্টির পরে ধানক্ষেত) ——
// The rainbow is always on the side away from the sun: in the shots that face the rainbow the low western sun is behind the
// camera, so the characters' shadows fall forward (toward the rainbow) and the rain clouds sit behind the arc.
const BOW = ['#e8413a', '#f5892a', '#f7d23a', '#4fb548', '#2f8fe0', '#3f4fb8', '#8a4fc8'];   // drawn outer→inner: red on the outside, violet inside (as in a primary rainbow)
function rainbow(cx, cy, R, a = 1, w = 26) {
  for (let i = 0; i < 7; i++) { const c = BOW[i]; g.globalAlpha = .82 * a; stroke(arc(cx, cy, R - i * w, R - i * w, Math.PI * 1.02, Math.PI * 1.98, 40), w + 1, { line: c, boil: .25 }); }
  g.globalAlpha = 1;
}
function cloud(cx, cy, s, col) { shape(spline([[cx - 120 * s, cy], [cx - 80 * s, cy - 50 * s], [cx - 10 * s, cy - 70 * s], [cx + 60 * s, cy - 55 * s], [cx + 120 * s, cy - 10 * s], [cx + 80 * s, cy + 25 * s], [cx - 90 * s, cy + 25 * s]]), { fill: col, lw: 5 }); }
function palm(x, y, s = 1) {   // তাল গাছ
  shape([[x - 12 * s, y], [x + 12 * s, y], [x + 8 * s, y - 420 * s], [x - 8 * s, y - 420 * s]], { fill: '#7a5a3a', lw: 5 });
  for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * .42; shape([[x, y - 420 * s], [x + Math.cos(a - .18) * 120 * s, y - 420 * s + Math.sin(a - .18) * 120 * s], [x + Math.cos(a) * 150 * s, y - 420 * s + Math.sin(a) * 150 * s + 20 * s], [x + Math.cos(a + .18) * 120 * s, y - 420 * s + Math.sin(a + .18) * 120 * s]], { fill: '#3f7a32', lw: 4 }); }
}
// px = parallax offset of the far layers (the chase moves them; the rainbow is drawn separately)
function field(t, { px = 0, bow = null } = {}) {
  bands(['#9fb7c9', '#c4d6dc', '#eef0de'], -900, 1000);                          // washed sky after rain
  for (const [cx, cy, s] of [[700, 420, 1.6], [1000, 520, 1.3], [300, 380, 1.4], [-150, 500, 1.2]]) cloud(cx + px * .1, cy, s, '#7e8a9a');   // rain clouds on the far side
  if (bow) rainbow(...bow);
  for (let i = -6; i < 14; i++) { const x = i * 170 + (px * .3) % 170; shape(spline([[x - 110, 1010], [x - 60, 930], [x + 10, 910], [x + 80, 940], [x + 110, 1010]]), { fill: '#3e6a3a', lw: 5 }); }   // village tree line
  shape(rect(-2000, 1000, 5000, 1600), { fill: '#7fb34a', lw: 7, shade: () => {
    for (let r = 0; r < 9; r++) { const y = 1030 + r * r * 7, sp = 40 + r * 14; for (let x = -1200 + ((px * (.4 + r * .07)) % sp); x < 2300; x += sp) stroke([[x, y], [x - 4 - r, y - 10 - r * 2], [x + 6 + r, y - 10 - r * 2]], 3 + r * .4, { line: '#4f8a34', closed: false }); }
  } });
  for (const [x, w] of [[180, 160], [760, 220], [1300, 180], [-300, 200]]) fillOnly(ell(x + px * .7, 1360, w, 26, 24), '#c4dbe6', { boil: .3 });   // puddles reflect the sky
  // the raised earth path (আল) the cast stands on
  shape(rect(-2000, FLOOR - 40, 5000, 120), { fill: '#a0754a', lw: 7, shade: () => fillOnly(rect(-2000, FLOOR + 40, 5000, 40), '#83603c', { boil: .3 }) });
  for (let x = -1800 + (px % 260); x < 2400; x += 260) fillOnly(ell(x, FLOOR - 6, 44, 10, 16), '#b9d4de', { boil: .3 });   // small puddles on the aal
}
function shadowF(x, s = 1) { fillOnly([[x - 50 * s, FLOOR + 6], [x + 50 * s, FLOOR + 6], [x + 34 * s, FLOOR - 34], [x - 34 * s, FLOOR - 34]], 'rgba(40,50,30,.28)', { boil: .2 }); }   // sun behind the viewer: short shadow falls away from camera
// —— props ——
function sack(x, y, s = 1, { open = 1, rot = 0 } = {}) {   // jute sack (চটের বস্তা); (x, y) = the mouth centre
  push(); translate(x, y); rotate(rot); scale(s);
  shape(spline([[-56, 0], [56, 0], [74, 120], [66, 230], [0, 250], [-66, 230], [-74, 120]]), { fill: '#c9a46a', lw: 6, shade: () => { for (let k = 0; k < 6; k++) stroke([[-70, 30 + k * 38], [70, 30 + k * 38]], 2.5, { line: '#a5834e' }); fillOnly(ell(40, 140, 26, 90, 16), '#b08c55', { boil: .3 }); } });
  shape(ell(0, 0, 58, 16 * open + 2, 20), { fill: '#3a2a1a', lw: 5 });
  pop();
}
function sackHang(hp, s = 1) { sack(hp[0], hp[1] + 4, s, { open: .4 }); }
function wcan(hp, tilt = 0, s = 1) {   // watering can (ঝাঁঝরি) held by the top handle; tilt > 0 pours forward
  push(); translate(hp[0], hp[1]); rotate(tilt); scale(s);
  stroke(arc(0, 40, 46, 46, Math.PI * 1.05, Math.PI * 1.95, 12), 9, { line: '#2d7a5a' });
  shape(rr(-60, 40, 120, 110, 18), { fill: '#3aa07a', lw: 6, shade: () => fillOnly(rect(30, 44, 26, 100), '#2d7a5a', { boil: .3 }) });
  shape([[50, 120], [64, 104], [170, 30], [176, 44]], { fill: '#3aa07a', lw: 5 });
  shape(ell(182, 34, 16, 22, 14, -.6), { fill: '#d9e2e0', lw: 5 });
  pop();
}
// rose tip of the can in world coords for a given hand point / tilt
const roseTip = (hp, tilt, s = 1) => { const c = Math.cos(tilt), si = Math.sin(tilt); return [hp[0] + (182 * c - 34 * si) * s, hp[1] + (182 * si + 34 * c) * s]; };
function prism(x, y, s = 1, rot = 0, glow = 0) {   // glass triangular prism, apex up
  push(); translate(x, y); rotate(rot); scale(s);
  shape([[0, -70], [60, 40], [-60, 40]], { fill: 'rgba(200,236,250,.85)', lw: 6, shade: () => { fillOnly([[0, -70], [16, -40], [-30, 30], [-60, 40]], 'rgba(255,255,255,.7)', { boil: .2 }); } });
  pop();
}
function spray(x0, y0, t, k, n = 60) {   // droplets falling from the rose in a forward arc
  for (let i = 0; i < n; i++) { const u = ((t * 1.6 + hash(i) ) % 1), vx = 170 + hash(i + 3) * 120, vy = -80 + hash(i + 7) * 80; const x = x0 + vx * u, y = y0 + vy * u + 520 * u * u; if (u * k > .02 && y < FLOOR - 50) dot(x, y, 5 + hash(i + 1) * 4, "#e4f6ff"); }
}
function beamRay(x0, y0, x1, y1, w, col) { const a = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0); push(); translate(x0, y0); rotate(a); fillOnly(rect(0, -w / 2, L, w), col, { boil: .2 }); pop(); }
function fanOut(x0, y0, ang, len, spread, a = 1, w = 9) { g.globalAlpha = a; for (let i = 0; i < 7; i++) { const b = ang + (i - 3) * spread; stroke([[x0, y0], [x0 + Math.cos(b) * len, y0 + Math.sin(b) * len]], w, { line: BOW[i], closed: false }); } g.globalAlpha = 1; }
// portal: cyan ring + gold sparks (the only glowing thing)
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
function splashFx(x, y, k) { if (k < 0 || k > .5) return; for (let i = 0; i < 7; i++) { const a = Math.PI * (1.1 + i * .13), v = 160 + hash(i) * 120; dot(x + Math.cos(a) * v * k, y + Math.sin(a) * v * k + 600 * k * k, 7, '#cfe6f0'); } }

// —— poses ——
const REST = { L: { h: [-16, 150], bend: -14 }, R: { h: [16, 150], bend: 14 } };
function M(t, o = {}) { const m = talk('mama', t); return { x: MX, y: FLOOR, s: 1, t, look: [.5, .2], mouth: { o: m.o, w: m.w, sm: .25 }, headTilt: m.talking ? (m.o - .3) * .06 : Math.sin(q(t) * 1.6) * .02, sq: 1 + .008 * Math.sin(q(t) * 2.3), blink: blinks(t, 1), ...o }; }
function Bo(t, o = {}) { const m = talk('boltu', t); return { x: BX, y: FLOOR, s: 1, t, look: [-.5, .2], mouth: { o: m.o * 1.15, w: m.w, sm: .1 }, headTilt: m.talking ? (m.o - .3) * .08 : 0, sq: 1 + .012 * Math.sin(q(t) * 3.1), blink: blinks(t, 2), armL: { h: [-14, 104], bend: -12 }, armR: { h: [14, 104], bend: 12 }, ...o }; }
function Nw(t, o = {}) { const m = talk('newton', t); return { x: 300, y: FLOOR, s: 1, t, look: [0, 0], lid: .42, mouth: { o: m.o, w: m.w, sm: 0 }, headTilt: m.talking ? (m.o - .3) * .05 : 0, sq: 1 + .006 * Math.sin(q(t) * 1.9), blink: blinks(t, 4), armL: { h: [-14, 150], bend: -12 }, armR: { h: [14, 150], bend: 12 }, ...o }; }
function Bi(t, o = {}) { const m = talk('bithi', t); return { x: TIX, y: FLOOR, s: 1, t, look: [-.4, .1], mouth: { o: m.o, w: m.w, sm: .35 }, headTilt: m.talking ? (m.o - .3) * .06 : 0, sq: 1 + .008 * Math.sin(q(t) * 2.1), blink: blinks(t, 3), armL: { h: [-12, 140], bend: -12 }, armR: { h: [12, 140], bend: 12 }, ...o }; }
const lerpArm = (a, b, u) => ({ h: [lerp(a.h[0], b.h[0], u), lerp(a.h[1], b.h[1], u)], bend: lerp(a.bend, b.bend, u), fist: u > .5 ? b.fist : a.fist });
const poseTrack = (tq, keys) => { let p = keys[0][1]; for (let i = 0; i < keys.length - 1; i++) { const [ta, a] = keys[i], [tb, b] = keys[i + 1]; if (tq >= ta && tq < tb) return lerpArm(a, b, ss(seg(tq, ta, Math.min(tb, ta + .3)))); if (tq >= tb) p = b; } return p; };
const walk = (tq, on, amp = 18) => on ? [[Math.sin(tq * 12) * amp, -Math.max(0, Math.cos(tq * 12)) * 12], [-Math.sin(tq * 12) * amp, -Math.max(0, -Math.cos(tq * 12)) * 12]] : [[0, 0], [0, 0]];
// arm vector from a character's front shoulder to a world point (face = 1: right shoulder; face = -1: mirrored)
const reach = (D, x, face, wx, wy, s = 1) => { const sx = x + face * D.shW * s, sy = FLOOR - D.shY * s; return [(wx - sx) * face / s, (wy - sy) / s]; };
function _strip(x0, y0, x1, y1, w = 22) { const a = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0); push(); translate(x0, y0); rotate(a); shape(rect(0, -w / 2, L, w), { fill: 'rgba(236,214,160,.92)', lw: 4, line: '#8a6a3a' }); pop(); }

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

const cap = (v, L) => { const l = Math.hypot(v[0], v[1]); return l > L ? [v[0] * L / l, v[1] * L / l] : v; };   // pointing arms keep their length

// —— shots ——
const SH = {};
const BOWBIG = (cx) => [cx, 1100, 760, 1, 30];
SH.open = t => {   // HOOK (frame 1 absurd still): Mama on the aal, an empty jute sack held open above his head toward a huge rainbow; stomps into a puddle at 0.3 s
  const k = t - T.splash;
  cam(520, 1080, 1.28);
  field(t, { bow: BOWBIG(820) });
  shadowF(MX + 40);
  const st = k > 0 ? Math.max(0, 1 - k / .25) : 0;
  const P = M(t, { x: MX + 40, look: [.6, -.8], headTilt: -.1, brow: -.5, mouth: talk('mama', t).talking ? { ...talk('mama', t), sm: .5 } : { o: .2, w: .8, sm: .6 },
    legR: k > 0 ? [10, -30 * st] : [18, -34], lean: .08,
    armR: { h: [110, -170], bend: 20 }, armL: { h: [60, -190], bend: -20 } });
  P.holdR = hp => sack(hp[0] - 30, hp[1] - 10, .95, { open: 1, rot: .5 });
  mama(P);
  splashFx(MX + 70, FLOOR - 4, k);
  if (t > LN.m1.t0 + .2) tag('রংধনু ধরার বস্তা!', 540, 300, { bg: '#f4f1ea', fg: INK, size: 40 });
};
SH.chase = t => {   // wide tracking shot: Mama runs right along the aal; palms and puddles slide past, the rainbow keeps the same place ahead of him
  const tq = q(t), u = seg(t, T.run0, T.run1), d = 700 * ss(u);
  const run = u > 0 && u < 1;
  // tracking shot: the camera stays with Mama, the far layers slide left (parallax), the rainbow is fixed to the camera: it "runs away" at his speed
  cam(MX + 180, 1060, 1.05);
  field(t, { px: -d, bow: BOWBIG(860) });
  palm(-80 - d * .9, 1010, .9); palm(1180 - d * .9, 1010, 1.05);
  shadowF(MX + 60);
  const P = M(t, { x: MX + 60, look: [.7, -.7], lean: run ? .16 : .02, brow: u >= 1 ? 1.1 : .2, eyeS: u >= 1 ? 1.2 : 1, sweat: u >= 1 ? t * 1.5 : null,
    mouth: talk('mama', t).talking ? { ...talk('mama', t), sm: -.2 } : { o: run ? .5 : .3, w: .8, sm: 0 },
    legL: walk(tq * 1.6, run, 30)[0], legR: walk(tq * 1.6, run, 30)[1], bob: run ? -Math.abs(Math.sin(tq * 19)) * 16 : 0,
    armR: run ? { h: [70 * Math.sin(tq * 19), 120], bend: 20 } : { h: [40, 130], bend: 14 } });
  P.holdR = hp => sackHang(hp, .8);
  mama(P);
  if (t > T.run1 - .2) { arrow(MX + 260, 760, MX + 480, 760, '#ffd65a'); tag('রংধনুও সরে!', MX + 370, 660, { bg: '#ffd65a', fg: INK, size: 40 }); }
};
SH.boltuQ = t => {   // Boltu jogs in from the left, muddy, points at the rainbow; Mama puffs his chest and nods proudly (silent answer)
  const tq = q(t), u = seg(t, LN.b1.t0 - .1, LN.b1.t0 + .7);
  cam(560, 1120, 1.2);
  field(t, { bow: BOWBIG(820) });
  const bx = lerp(-120, 300, eo(u));
  shadowF(700); shadowF(bx, .9);
  const proud = t > LN.b1.t1 + .05;
  const P = M(t, { x: 700, face: -1, look: u > .4 ? [.8, 0] : [-.5, -.6], brow: proud ? -.6 : .6, headTilt: proud ? -.1 + Math.sin(seg(t, LN.b1.t1, LN.b1.t1 + .6) * Math.PI * 2) * .05 : 0,
    mouth: { o: 0, w: .8, sm: proud ? .8 : .1 }, sq: proud ? 1.04 : 1, armL: proud ? { h: [-40, 30], bend: -20, fist: true } : undefined,
    armR: proud ? { h: [-60, -10], bend: 30, fist: true } : { h: [40, 130], bend: 14 } });
  P.holdR = proud ? null : (hp => sackHang(hp, .8));
  if (proud) P.holdL = hp => sackHang(hp, .8);
  mama(P);
  boltu(Bo(t, { x: bx, face: 1, look: [.8, -.3], brow: .8, mouth: { ...talk('boltu', t), sm: .3 }, legL: walk(tq, u > 0 && u < 1, 24)[0], legR: walk(tq, u > 0 && u < 1, 24)[1],
    armR: u >= 1 ? { h: [80, -140], bend: 10 } : { h: [14, 104], bend: 12 } }));
};
SH.enter = t => {   // Bithi walks in along the aal from the right with a watering can (she was watering the vegetable patch); Boltu turns to her
  const tq = q(t), u = seg(t, LN.b2.t0 - .3, LN.b2.t1 - .2);
  cam(600, 1120, 1.0);
  field(t, { bow: BOWBIG(820) });
  const bix = lerp(1250, 900, eo(u));
  shadowF(260); shadowF(560, .9); shadowF(bix);
  const P = M(t, { x: 260, face: 1, look: u > .5 ? [.9, 0] : [.5, -.6], brow: .3, armR: { h: [40, 130], bend: 14 } }); P.holdR = hp => sackHang(hp, .8); mama(P);
  boltu(Bo(t, { x: 560, face: 1, look: [.7, -.1], brow: .9, armR: talk('boltu', t).talking ? { h: [70, -20], bend: 20 } : { h: [14, 104], bend: 12 } }));
  const B = Bi(t, { x: bix, face: -1, look: [.6, 0], brow: .2, legL: walk(tq, u > 0 && u < 1)[0], legR: walk(tq, u > 0 && u < 1)[1], armR: { h: [20, 70], bend: 10 } });
  B.holdR = hp => wcan(hp, 0, .8); bithi(B);
};
SH.spray = t => {   // the demonstration: Bithi turns her back to the low sun (left) and tips the can; a small rainbow appears in the drops
  const k = t - T.spray, tilt = k > 0 ? .5 * ss(clamp(k / .3)) : 0;
  cam(600, 1060, 1.0);
  bands(['#9fb7c9', '#c4d6dc', '#eef0de'], -900, 1000);
  // side view: the setting sun low on the left, behind Bithi
  shape(ell(-10, 900, 90, 90, 32), { fill: '#ffd36a', lw: 6 }); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + t * .3; stroke([[-10 + Math.cos(a) * 110, 900 + Math.sin(a) * 110], [-10 + Math.cos(a) * 150, 900 + Math.sin(a) * 150]], 6, { line: '#f5b81c' }); }
  for (let i = -6; i < 14; i++) { const x = i * 170; shape(spline([[x - 110, 1010], [x - 60, 930], [x + 10, 910], [x + 80, 940], [x + 110, 1010]]), { fill: '#3e6a3a', lw: 5 }); }
  shape(rect(-2000, 1000, 5000, 1600), { fill: '#7fb34a', lw: 7 });
  shape(rect(-2000, FLOOR - 40, 5000, 120), { fill: '#a0754a', lw: 7 });
  const B = Bi(t, { x: 300, face: 1, look: k > -.3 ? [.8, .3] : [-.6, 0], brow: .4, armR: { h: [110, -40], bend: 10 } });
  let hpW = null; B.holdR = hp => { wcan(hp, tilt, .9); hpW = 1; }; bithi(B);
  const hp = [300 + BITHI.shW + 110, FLOOR - BITHI.shY - 40];
  const rt = roseTip(hp, tilt, .9);
  if (k > 0) spray(rt[0], rt[1], t, clamp(k / .2));
  const bowA = clamp((t - T.bow) / .35);
  if (bowA > 0) { rainbow(rt[0] + 150, rt[1] + 230, 170, bowA, 12); }
  boltu(Bo(t, { x: 920, s: .9, y: FLOOR + 30, face: -1, look: k > .3 ? [.9, .2] : [.9, 0], eyeS: bowA > .5 ? 1.2 : 1, brow: bowA > .5 ? 1.1 : .5, mouth: { o: bowA > .5 ? .5 : 0, w: .8, sm: .4 } }));
  { const P = M(t, { x: 1075, s: .85, y: FLOOR + 50, face: -1, look: [.9, .1], brow: bowA > .5 ? 1.2 : .6, eyeS: bowA > .5 ? 1.2 : 1, armR: { h: [40, 130], bend: 14 } }); P.holdR = hp => sackHang(hp, .7); mama(P); }
  if (t > LN.t1.t0 + 2.0) tag('☀ সূর্য পেছনে', 230, 700, { bg: '#ffd65a', fg: INK, size: 38 });
  if (t > LN.t1.t0 + 3.4) tag('সামনে পানির ফোঁটা', 760, 700, { bg: '#c4dbe6', fg: INK, size: 38 });
  if (bowA > .5) tag('ছোট্ট রংধনু!', rt[0] + 150, rt[1] - 110, { bg: '#2b67c9', fg: '#fff', size: 52 });
};
SH.boltuCU = t => {   // reaction close-up: amazed at the small bow, then finger to chin for the question
  const m = talk('boltu', t), a = LN.b3.t0, think = t > a + 1.4;
  cam(700, 1060, 1.75);
  field(t, {});
  boltu(Bo(t, { x: 760, face: -1, look: think ? [-.3, -.6] : [.2, -.1], eyeS: think ? 1 : 1.25, pupil: think ? undefined : 2.6, brow: think ? .7 : 1.2, headTilt: think ? .08 : 0,
    mouth: { o: m.o * 1.2 + (m.talking ? .06 : .3), w: m.w, sm: .2 }, armR: think ? { h: [-26, -36], bend: 44, fist: true } : { h: [60, -150], bend: 10, fist: true } }));
  if (think) { const z = back(clamp((t - a - 1.4) / .3), 1.4); if (z > .05) tag('রং আসে কোথা থেকে?', 520, 560, { bg: '#f4f1ea', fg: INK, size: Math.round(44 * Math.min(1.15, z)) }); }
};
SH.summon = t => {   // Bithi doesn't know: finger to chin, then fist up "but I know who does!"
  const tq = q(t), s0 = LN.t2.t0, d = LN.t2.t1 - s0;
  cam(TIX - 30, FLOOR - 380, 2.0);
  field(t, {});
  const arms = poseTrack(tq, [[s0, REST.R], [s0 + .1, { h: [40, 30], bend: 40 }], [s0 + d * .12, { h: [70, 60], bend: 30 }], [s0 + d * .2, { h: [40, -150], bend: 20, fist: true }], [s0 + d * .32, { h: [100, -140], bend: 10 }]]);
  bithi(Bi(t, { face: -1, look: tq < s0 + d * .15 ? [-.2, .3] : tq < s0 + d * .28 ? [-.3, -.8] : [-.5, -.3], armR: arms, armL: tq > s0 + d * .3 ? { h: [-arms.h[0], arms.h[1]], bend: -arms.bend } : REST.L, brow: tq < s0 + d * .15 ? -.3 : .7, headTilt: tq < s0 + d * .15 ? .08 : 0 }));
};
SH.summonWide = t => {   // wide: Bithi pleads toward the open field; the portal opens on the aal at the left
  const tq = q(t), s0 = LN.t2.t0, d = LN.t2.t1 - s0;
  cam(560, 1180, 1.02);
  field(t, {});
  shadowF(TIX); shadowF(BX + 120, .9); shadowF(560, .9);
  const P = M(t, { x: 560, face: -1, look: t > T.pOpen ? [.9, -.1] : [-.4, -.2], eyeS: t > T.pOpen ? 1.2 : 1, brow: t > T.pOpen ? 1.1 : .3, armR: { h: [40, 130], bend: 14 } }); P.holdR = hp => sackHang(hp, .8); mama(P);
  boltu(Bo(t, { x: BX + 120, face: -1, look: [.7, -.2], brow: .4 }));
  const arms = poseTrack(tq, [[s0, { h: [100, -140], bend: 10 }], [s0 + d * .5, { h: [30, 60], bend: 40 }], [s0 + d * .8, { h: [-20, 40], bend: 40 }], [s0 + d + .2, { h: [80, -150], bend: 10 }]]);
  bithi(Bi(t, { x: TIX + 60, face: -1, look: [-.6, -.3], armR: arms, armL: { h: [-arms.h[0], arms.h[1]], bend: -arms.bend }, brow: .6 }));
  portal(PX, PY, 190, t, popOpen(t - T.pOpen) * .8);
};
SH.portal = t => {   // Newton steps out of the cyan-gold ring holding a glass prism; the portal snaps shut; label with name + years only
  const tq = q(t);
  cam(560, 1180, 1.02);
  const op = t < T.pClose ? Math.max(.8, popOpen(t - T.pOpen)) : 1 - ei(seg(t, T.pClose, T.pClose + .3));
  field(t, {});
  const P = M(t, { x: 560, face: -1, look: [.9, -.1], eyeS: 1.2, pupil: 3, brow: 1.1, mouth: { o: .5, w: .8, sm: 0 }, armR: { h: [40, 130], bend: 14 } }); P.holdR = hp => sackHang(hp, .8); mama(P);
  portal(PX, PY, 190, t, op);
  const u = seg(t, T.nOut[0], T.nOut[1]);
  if (t >= T.nOut[0]) { const N = Nw(t, { x: PX + 40 * eo(u), s: lerp(.35, 1, eo(u)), y: lerp(PY + 60, FLOOR, eo(u)), legL: walk(tq, u < 1)[0], legR: walk(tq, u < 1)[1], look: [.5, 0], armR: { h: [60, 40], bend: 10 } }); N.holdR = hp => prism(hp[0] + 6, hp[1] - 50, .8); newton(N); }
  const hop = seg(tq, T.pOpen + .1, T.pOpen + .5);
  boltu(Bo(t, { x: BX + 120 + 50 * eo(hop), y: FLOOR - Math.sin(hop * Math.PI) * 50, face: -1, look: [.8, 0], nerv: .8, eyeS: 1.2, pupil: 2.6, mouth: { o: .7, w: .7, sm: -.3 } }));
  bithi(Bi(t, { x: TIX + 60, face: -1, look: [.8, 0], mouth: { o: .3, w: .9, sm: .8 }, armR: { h: [80, -150], bend: 10 }, armL: { h: [-80, -150], bend: -10 } }));
  if (t > T.label) tag('আইজ্যাক নিউটন (১৬৪৩–১৭২৭)', 540, 210, { size: 44 });
};
SH.prism = t => {   // Newton holds the prism up into a beam of sunlight: white in, colours out (red bends least, violet most)
  const tq = q(t), a = LN.n1.t0;
  cam(480, 1060, 1.35);
  field(t, {});
  const arm = poseTrack(tq, [[a, { h: [60, 40], bend: 10 }], [a + .3, { h: [90, -90], bend: 10 }]]);
  let pp = null;
  const N = Nw(t, { x: 260, face: 1, look: tq > a + .4 ? [.6, -.5] : [.5, 0], armR: arm }); N.holdR = hp => { pp = hp; prism(hp[0] + 6, hp[1] - 50, 1); }; newton(N);
  const P = [260 + NEWTON.shW + arm.h[0] + 6, FLOOR - NEWTON.shY + arm.h[1] - 50];    // prism centre in world coords (Newton faces right, scale 1)
  const kb = clamp((t - T.beam) / .3);
  if (kb > 0) beamRay(-200, P[1] - 260, P[0] - 34, P[1] - 4, 26, `rgba(255,255,240,${.9 * kb})`);
  const kf = clamp((t - T.fan) / .4);
  if (kb >= 1) fanOut(P[0] + 30, P[1] + 6, .38, 120 + 520 * Math.max(kf, .15), .045 * Math.max(kf, .3), 1, 12);
  if (t > T.beam + .3) tag('সাদা আলো', 150, P[1] - 330, { bg: '#f4f1ea', fg: INK, size: 38 });
  if (kf > .6) tag('বে নী আ স হ ক লা', 800, P[1] - 170, { bg: '#1b1422', fg: '#ffd65a', size: 40 });
  boltu(Bo(t, { x: 900, s: .9, y: FLOOR + 30, face: -1, look: [.6, .3], eyeS: kf > .5 ? 1.2 : 1, brow: kf > .5 ? 1.1 : .5, mouth: { o: kf > .5 ? .45 : 0, w: .8, sm: .4 } }));
};
SH.drop = t => {   // inside one raindrop: light enters, bends, reflects off the back, comes out split; zoom out: millions of drops make the arc
  const a = LN.t3.t0, k = t - a;
  cam(540, 960, 1);
  bands(['#22304a', '#1d2a40', '#182236'], -100, 2100);
  tag('প্রতিটা ফোঁটা = ছোট্ট প্রিজম', 540, 170, { bg: '#ffd65a', fg: INK, size: 46 });
  reset();
  const C = [600, 720], R = 250;
  shape(ell(C[0], C[1], R, R, 60), { fill: 'rgba(160,215,245,.55)', lw: 7, shade: () => fillOnly(ell(C[0] - 90, C[1] - 100, 60, 40, 20), 'rgba(255,255,255,.6)', { boil: .3 }) });
  const pt = ang => [C[0] + Math.cos(ang) * R, C[1] + Math.sin(ang) * R];
  const A = pt(Math.PI * 1.18), B = pt(Math.PI * .05), Cc = pt(Math.PI * .78);
  const p1 = clamp(k / .7), p2 = clamp((k - .7) / .6), p3 = clamp((k - 1.3) / .6);
  shape(ell(120, 300, 60, 60, 24), { fill: '#ffd36a', lw: 5 }); text('সূর্য', 120, 400, { font: '800 36px "Baloo"', fill: '#fff' });
  if (p1 > 0) { const e = [lerp(150, A[0], p1), lerp(340, A[1], p1)]; stroke([[150, 340], e], 12, { line: '#fffbe8' }); }
  if (p2 > 0) { for (let i = 0; i < 7; i++) { const b = [B[0], B[1] - 12 + i * 4]; const e = [lerp(A[0], b[0], p2), lerp(A[1], b[1], p2)]; stroke([A, e], 4, { line: BOW[i] }); } }
  if (p3 > 0) { for (let i = 0; i < 7; i++) { const b = [B[0], B[1] - 12 + i * 4], c = [Cc[0] + i * 6, Cc[1] - i * 3]; stroke([b, [lerp(b[0], c[0], p3), lerp(b[1], c[1], p3)]], 4, { line: BOW[i] }); } }
  if (k > 1.9) { fanOut(Cc[0], Cc[1], Math.PI * .8, 260 * clamp((k - 1.9) / .4), .03, 1, 8); }
  if (k > 1.0) tag('বাঁকে', (A[0] + B[0]) / 2, A[1] - 120, { bg: '#f4f1ea', fg: INK, size: 34 });
  if (k > 1.5) tag('ফিরে আসে', B[0] - 30, B[1] + 110, { bg: '#f4f1ea', fg: INK, size: 34 });
  if (k > 2.3) tag('রং আলাদা', 190, 1000, { bg: '#f4f1ea', fg: INK, size: 34 });
  if (k > 2.9) {   // zoom-out inset: many drops in the sky, each sends one colour to the eye → the arc
    const z = back(clamp((k - 2.9) / .35), 1.3); reset(); push(); translate(650, 1110); scale(z * .68);
    shape(rr(-420, -130, 840, 260, 26), { fill: '#9fb7c9', lw: 7 });
    for (let i = 0; i < 70; i++) { const an = Math.PI * (1.08 + .84 * hash(i)), band = Math.floor(hash(i + 5) * 7), r = 220 - band * 14; dot(Math.cos(an) * r, 110 + Math.sin(an) * r * .9, 6, BOW[band]); }
    pop();
    tag('লাখো ফোঁটা = রংধনু', 650, 1262, { bg: '#2b67c9', fg: '#fff', size: 40 });
  }
};
SH.grab = t => {   // "Then I'll put the prism in the sack — free rainbow!": Mama snatches it from Newton's hand and drops it into the open sack
  const tq = q(t), k = t - T.grab;
  cam(560, 1130, 1.2);
  field(t, { bow: [820, 1100, 760, .55, 30] });
  sack(560, FLOOR - 250, 1, { open: 1 });   // standing open on the aal between them
  const NX = 290, MXg = 820;
  // prism: in Newton's raised hand until the grab, then in Mama's hand, then released over the sack and falls in
  const nArm = k < 0 ? { h: [90, -90], bend: 10 } : poseTrack(tq, [[T.grab, { h: [90, -90], bend: 10 }], [T.grab + .2, { h: [60, -30], bend: 10 }]]);
  const nHand = [NX + NEWTON.shW + nArm.h[0], FLOOR - NEWTON.shY + nArm.h[1]];
  const Pn = [nHand[0] + 6, nHand[1] - 50];
  const overSack = [560, FLOOR - 420];
  let target = Pn;
  if (k > 0) target = k < .25 ? Pn : (t < T.inSack ? [lerp(Pn[0], overSack[0], ss(clamp((k - .25) / .6))), lerp(Pn[1], overSack[1], ss(clamp((k - .25) / .6)))] : overSack);
  const armM = k < -.35 ? { h: [-40, 130], bend: -14 } : { h: cap(reach(MAMA, MXg, -1, target[0], target[1] + 40), 190), bend: 10 };
  const N = Nw(t, { x: NX, face: 1, look: k > 0 ? [.8, -.1] : [.5, -.4], brow: k > 0 ? 1.2 : 0, eyeS: k > 0 ? 1.2 : 1, lid: k > 0 ? .1 : .42, armR: nArm });
  if (k <= 0) N.holdR = hp => prism(hp[0] + 6, hp[1] - 50, 1);
  newton(N);
  const P = M(t, { x: MXg, face: -1, look: [.9, k > .3 ? .5 : -.2], brow: -.2, mouth: { ...talk('mama', t), sm: .8 }, armR: armM });
  if (k > 0 && t < T.inSack) P.holdR = hp => prism(hp[0] - 6, hp[1] - 40, 1);
  mama(P);
  const kf = t - T.inSack; if (kf > 0 && kf < .3) prism(overSack[0], lerp(overSack[1] - 40, FLOOR - 250, kf / .3), 1 - kf * 1.5);
  if (k < 0) { fanOut(Pn[0] + 30, Pn[1] + 6, .38, 300, .04, .8, 10); beamRay(-200, Pn[1] - 260, Pn[0] - 34, Pn[1] - 4, 22, 'rgba(255,255,240,.8)'); }
};
SH.pause = t => {   // cold pause: insert inside the sack — dark, the prism lies there with no colours; Mama's eye peers in from the mouth
  const tq = q(t), a = T.shots.find(s => s[2] === 'pause')[0];
  cam(540, 960, 1);
  bands(['#2a1e14', '#24190f', '#1e140c'], -100, 2100);
  reset(); fillOnly(ell(540, 260, 380, 120, 40), '#a8c4d0', { boil: .3 });   // the sack mouth: daylight outside
  push(); translate(540, 250); eye(0, 0, 60, 64, { lid: tq > a + .5 && tq < a + .7 ? 1 : .2, look: [0, .8], pupil: 9, skin: PAL.skinB }); pop();
  prism(540, 1000, 1.6, .3);
  tag('অন্ধকার = রং নেই', 540, 1250, { bg: '#f4f1ea', fg: INK, size: 40 });
};
SH.deadpan = t => {   // "Mama, there's no sunlight inside the sack." Boltu flat; Newton's slow nod; Mama holding the tied sack
  const k = t - LN.b4.t0;
  cam(620, 1140, 1.3);
  field(t, { bow: [820, 1100, 760, .55, 30] });
  sack(470, FLOOR - 250, 1, { open: .1 });
  const P = M(t, { x: 330, face: 1, look: [.3, .6], brow: k > 1.6 ? -1 : .6, mouth: { o: 0, w: .8, sm: k > 1.6 ? -.6 : .2 }, armR: { h: [90, 60], bend: 10 } }); mama(P);
  newton(Nw(t, { x: 930, s: .9, y: FLOOR + 30, face: -1, look: [.7, .1], lid: .55, headTilt: Math.sin(seg(t, LN.b4.t0 + .8, LN.b4.t0 + 1.6) * Math.PI) * .08, mouth: { o: 0, w: .9, sm: .2 } }));
  boltu(Bo(t, { x: 700, face: -1, look: [.8, 0], lid: .5, brow: -.3, mouth: { ...talk('boltu', t), sm: -.1 }, armR: talk('boltu', t).talking ? { h: [80, 40], bend: 10 } : { h: [14, 104], bend: 12 } }));
};
SH.puzzle = t => {   // Bithi turns to camera; thought bubble: the morning sun rising in the EAST, which side does the rainbow appear?
  const tq = q(t), a = LN.t4.t0;
  cam(330, 1060, 1.45);
  field(t, {});
  const turn = tq > a + 3.4;
  const B = Bi(t, { x: 300, face: 1, look: turn ? [0, 0] : [.7, -.5], brow: .5, armR: turn ? { h: [12, 140], bend: 12 } : { h: [90, -130], bend: 20 } }); B.holdL = hp => wcan(hp, 0, .7); bithi(B);
  if (t > a + .1) tag('ধাঁধা!', 540, 220, { bg: '#ffd65a', fg: INK, size: 64 });
  if (t > a + .8) {
    const z = back(clamp((t - a - .8) / .3), 1.4); reset(); push(); translate(600, 600); scale(z);
    shape(spline([[-330, 0], [-300, -170], [-100, -210], [140, -200], [330, -110], [320, 120], [100, 190], [-220, 170]]), { fill: '#f4f1ea', lw: 7 });
    shape(rect(-260, 20, 520, 60), { fill: '#7fb34a', lw: 5 });
    const rise = clamp((t - a - 1.0) / 1.2);
    shape(ell(-200, 20 - 70 * rise, 40, 40, 20), { fill: '#ffd36a', lw: 5 });
    text('পূর্ব', -200, 130, { font: '800 40px "Baloo"' }); text('পশ্চিম', 200, 130, { font: '800 40px "Baloo"' });
    text('?', 0, -90, { font: '800 100px "Baloo"', fill: '#e2453a' });
    pop();
    if (t > a + 1.6) tag('সকালের রংধনু কোন দিকে?', 600, 860, { bg: '#e8d9b8', fg: INK, size: 38 });
  }
};
SH.end = t => {
  cam(540, 960, 1);
  bands(['#9fb7c9', '#c4d6dc', '#eef0de'], -100, 2100);
  const pu0 = back(clamp((t - T.VEND) / .4), 1.6);
  reset(); rainbow(540, 760, 420 * Math.max(.01, pu0), 1, 24);
  g.setTransform(1, 0, 0, 1, 0, 0); g.font = '800 120px "Baloo"'; g.textAlign = 'center'; g.textBaseline = 'middle';
  const kk = Math.floor(t * 12) % 3, jx = [0, 1.5, -1][kk], jy = [0, -1, 1.5][kk];
  const pu = back(clamp((t - T.VEND - .15) / .4), 1.6);
  g.save(); g.translate(540 + jx, 360 + jy); g.scale(pu, pu);
  g.lineWidth = 22; g.lineJoin = 'round'; g.strokeStyle = INK; g.strokeText('সাইন্টিফিক বিথী', 0, 0); g.fillStyle = '#ffd65a'; g.fillText('সাইন্টিফিক বিথী', 0, 0); g.restore();
  reset();
  mama(M(t, { x: 180, y: 1500, s: .62, look: [0, 0], mouth: { o: 0, w: 1, sm: .8 } }));
  bithi(Bi(t, { x: 430, y: 1500, s: .62, look: [0, 0], mouth: { o: 0, w: 1, sm: .8 } }));
  boltu(Bo(t, { x: 660, y: 1500, s: .66, look: [0, 0], mouth: { o: 0, w: 1, sm: .8 } }));
  newton(Nw(t, { x: 890, y: 1500, s: .6, look: [0, 0], lid: .55, mouth: { o: 0, w: 1, sm: .2 } }));
};

let lastSub = null;
const THUMB = new URLSearchParams(location.search).get('thumb');
window.render = t => {
  frame(t); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#b08a5c'; g.fillRect(0, 0, W, H);
  if (THUMB) {   // thumbnail cutouts: one character on a flat key colour, amazed (arms up, mouth open)
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#00ff00'; g.fillRect(0, 0, W, H); reset(); translate(540, 1700); scale(2.6); translate(-540, -1500);
    const amazed = { look: [.3, -.2], eyeS: 1.25, pupil: 2.8, brow: 1.2, mouth: { o: .75, w: .75, sm: .3 }, armL: { h: [-70, -130], bend: -20 }, armR: { h: [70, -130], bend: 20 }, blink: false };
    if (THUMB === 'bithi') bithi(Bi(0, { x: 540, ...amazed }));
    if (THUMB === 'newton') newton(Nw(0, { x: 540, look: [-.4, 0], lid: .4, mouth: { o: 0, w: 1, sm: .3 }, armR: { h: [110, -60], bend: 10 }, blink: false, holdR: hp => prism(hp[0] + 10, hp[1] - 40, 1.1) }));
    lastSub = null; return;
  }
  const s = T.shots.find(s => t >= s[0] && t < s[1]) || T.shots[T.shots.length - 1];
  SH[s[2]](t);
  lastSub = (s[2] === 'end') ? null : subtitle(t);
};
window.TEXTS = t => { window.render(t); return lastSub ? [{ id: lastSub.text, text: lastSub.text, x0: 60, y0: lastSub.y0, x1: 1020, y1: lastSub.y1 }] : []; };
window.EV = [];
await document.fonts.load('800 54px "Baloo"', 'সাইন্টিফিক বিথী রংধনু');
await document.fonts.ready;
window.READY = true;
