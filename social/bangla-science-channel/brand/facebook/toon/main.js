// Scientific Bithi Facebook page images (Sci-Fi Sitcom Toon look, 2026-11-17): ?mode=cover (1640×624) | profile (1080×1080).
// Whole cast drawn with the episode rigs (soft eyes, thin golden glasses rims) on the Dhaka rooftop, with the cyan + gold portal.
import { clamp, lerp, hash, TAU } from '/core/lib.js';
import { INK, init, frame, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, rr, rect, spline, dot, reset, bands } from './toon.js';
import { mama, bithi, boltu, newton, PAL } from './chars.js';
const MODE = new URLSearchParams(location.search).get('mode') || 'cover';
const cv = document.getElementById('c');
const CW = MODE === 'cover' ? 1640 : 1080, CH = MODE === 'cover' ? 624 : 1080;
cv.width = CW; cv.height = CH; init(cv);
window.DUR = 1;
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
function portal(cx, cy, r, t) {
  push(); translate(cx, cy); scale(.78, 1);
  fillOnly(ell(0, 0, r * 1.55, r * 1.45, 48), 'rgba(80,220,255,.18)', { boil: .6 });
  fillOnly(ell(0, 0, r * 1.28, r * 1.22, 48), 'rgba(255,210,90,.18)', { boil: .6 });
  const rim = []; for (let i = 0; i < 22; i++) { const a = i / 22 * TAU, k = 1 + .07 * Math.sin(a * 5) + .05 * Math.sin(a * 3); rim.push([Math.cos(a) * r * k, Math.sin(a) * r * k]); }
  shape(spline(rim), { fill: '#19a9d8', lw: 8, shade: () => {
    fillOnly(ell(0, 0, r * .9, r * .9, 40), '#3fd0f2', { boil: .3 });
    for (let k = 0; k < 5; k++) { const a1 = [], a2 = []; for (let j = 0; j <= 22; j++) { const u = j / 22, rr_ = r * (1 - u) * .95, a = k / 5 * TAU + u * 3.6; a1.push([Math.cos(a) * rr_, Math.sin(a) * rr_]); const b = a + .55 * (1 - u * .7); a2.push([Math.cos(b) * rr_, Math.sin(b) * rr_]); } fillOnly([...a1, ...a2.reverse()], k % 2 ? '#ffd65a' : '#1188c4', { boil: .4 }); }
    fillOnly(ell(0, 0, r * .3, r * .3, 24), '#c8f6ff', { boil: .5 }); fillOnly(ell(0, 0, r * .13, r * .13, 16), '#ffffff', { boil: .5 });
  } });
  for (let i = 0; i < 14; i++) { const a = hash(i) * TAU, d = r * (1.08 + .3 * hash(i + 9)); dot(Math.cos(a) * d, Math.sin(a) * d, 5 + hash(i + 2) * 4, i % 3 ? '#ffd65a' : '#ffffff'); }
  pop();
}
const happy = (o) => ({ t: 0, look: [0, .05], mouth: { o: .35, w: .9, sm: .9 }, blink: false, ...o });
function title(x, y, size, sub) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = `800 ${size}px "Baloo"`; g.lineJoin = 'round'; g.lineWidth = size * .18; g.strokeStyle = INK; g.strokeText('সাইন্টিফিক বিথী', x, y); g.fillStyle = '#ffd65a'; g.fillText('সাইন্টিফিক বিথী', x, y);
  if (sub) {
    g.font = `800 ${size * .36}px "Baloo"`; const w = g.measureText(sub).width + 60;
    reset(); shape(rr(x - w / 2, y + size * .62, w, size * .56, 22), { fill: '#e2453a', lw: 6 });
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#fff'; g.font = `800 ${size * .36}px "Baloo"`; g.fillText(sub, x, y + size * .91);
  }
}
window.render = t => {
  frame(0, { amp: 1.4 });
  if (MODE === 'cover') {
    // world → screen: show the rooftop band y 900..1560 across x -300..1380 scaled into 1640×624
    reset(); const z = .9; translate(CW / 2, CH / 2); scale(z); translate(-550, -1269);
    roof(0);
    portal(1060, 1290, 150, 0.6);
    newton({ ...happy({ x: 1060, y: 1500, s: .78, look: [-.3, 0], lid: .4, mouth: { o: 0, w: 1, sm: .5 } }), armR: { h: [100, -70], bend: 20 } });
    mama({ ...happy({ x: 180, y: 1500, s: .82, look: [.3, 0] }), armR: { h: [110, -60], bend: 20 } });
    boltu({ ...happy({ x: 440, y: 1500, s: .86, look: [.2, -.1] }), armL: { h: [-60, -90], bend: -20 }, armR: { h: [60, -90], bend: 20 } });
    bithi({ ...happy({ x: 720, y: 1500, s: .84, look: [-.2, 0] }), armR: { h: [110, -90], bend: 15 } });
    title(820, 72, 104, null);
    g.setTransform(1, 0, 0, 1, 0, 0); g.font = '800 40px "Baloo"'; const tl = 'হাসতে হাসতে বিজ্ঞান শিখি', tw = g.measureText(tl).width + 60;
    reset(); shape(rr(820 - tw / 2, 548, tw, 56, 22), { fill: '#e2453a', lw: 6 });
    g.setTransform(1, 0, 0, 1, 0, 0); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.font = '800 40px "Baloo"'; g.fillText(tl, 820, 578);
  } else {
    // profile: the cast as one round badge, the portal behind them as a halo
    reset(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#2a7690'; g.fillRect(0, 0, CW, CH);
    reset(); bands(['#1d4c63', '#236178', '#2a7690', '#3a8ea8'], -200, 1300);
    portal(540, 470, 330, 0.6);
    reset(); translate(540, 1180); scale(1.45); translate(-540, -1500);
    newton(happy({ x: 700, y: 1420, s: .82, look: [-.2, 0], lid: .4, mouth: { o: 0, w: 1, sm: .5 } }));
    mama({ ...happy({ x: 320, y: 1470, s: .82, look: [.3, 0] }) });
    boltu({ ...happy({ x: 760, y: 1500, s: .9, look: [-.3, -.1] }), armL: { h: [-60, -80], bend: -20 }, armR: { h: [60, -80], bend: 20 } });
    bithi({ ...happy({ x: 530, y: 1520, s: .92, look: [0, 0] }), armL: { h: [-60, -130], bend: -15 } });
  }
};
window.TEXTS = () => [];
window.EV = [];
await document.fonts.load('800 54px "Baloo"', 'সাইন্টিফিক বিথী');
await document.fonts.ready;
window.READY = true;
