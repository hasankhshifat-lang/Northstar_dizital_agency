// Scientific Bithi Short 17 × Sci-Fi Sitcom Toon (9:16): "ভাত চিবালে মিষ্টি লাগে কেন?" — saliva's ptyalin (salivary amylase) cuts starch into maltose.
// No scientist. Setting: a roadside rice hotel (ভাতের হোটেল) at lunchtime: tin walls, menu board, long wooden table with steel plates, a big aluminium pot, a doorway onto the road.
import { clamp, lerp, seg, ss, eo, ei, back, hash, TAU } from '/core/lib.js';
import { W, H, INK, init, frame, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, rr, rect, spline, dot, text, reset, bands, noodle } from './toon.js';
import { mama, bithi, boltu, eye, PAL, MAMA, BOLTU, BITHI } from './chars.js';

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
function cam(cx, cy, z) { reset(); translate(W / 2, H / 2); scale(z); translate(-cx, -cy); }
// chewing: closed mouth that squashes up and down (on twos), plus a little head bob
const chewM = (t, f = 2.2) => { const c = Math.abs(Math.sin(q(t) * Math.PI * f)); return { o: c > .6 ? .12 : 0, w: .7 + .25 * c, sm: .1 - .3 * c }; };

// —— layout ——
const FLOOR = 1500, TOP = 1330;                       // characters stand behind the table; the table top hides everything below TOP
const RICE = '#f7f4ea';

// —— the rice hotel (ভাতের হোটেল) ——
function hotel(t, { door = true, board = true } = {}) {
  // corrugated tin back wall, painted sea green, with a darker band below
  shape(rect(-1500, -600, 4200, 1700), { fill: '#5fa89a', lw: 7, shade: () => { for (let x = -1500; x < 2700; x += 46) stroke([[x, -600], [x, 1100]], 3, { line: '#4c8f82' }); } });
  shape(rect(-1500, 1100, 4200, 300), { fill: '#3f7f73', lw: 7 });
  // doorway on the right: the bright road outside, a rickshaw wheel passing
  if (door) {
    shape(rect(1180, 300, 380, 1100), { fill: '#f6e7b8', lw: 8, shade: () => {
      fillOnly(rect(1180, 980, 380, 420), '#b9b2a2', { boil: .3 });
      const rx = 1180 + ((t * 160) % 700) - 150; stroke(arc(rx, 1060, 70, 70, 0, TAU, 20), 6); stroke([[rx - 70, 1060], [rx + 70, 1060]], 3); stroke([[rx, 990], [rx, 1130]], 3);
    } });
  }
  // menu board (live Bangla text)
  if (board) {
  shape(rr(140, 560, 520, 300, 18), { fill: '#2c3a32', lw: 8 });
  text('আজকের মেনু', 400, 615, { font: '800 48px "Baloo"', fill: '#ffd65a' });
  text('ভাত • ডাল • আলু ভর্তা', 400, 700, { font: '800 38px "Baloo"', fill: '#f4f1ea' });
  text('মাছ • চা', 400, 780, { font: '800 38px "Baloo"', fill: '#f4f1ea' });
  }
  // ceiling fan (ambient)
  stroke([[820, -600], [820, 470]], 6);
  push(); translate(820, 480); scale(1, .28); rotate(t * 9);
  for (let k = 0; k < 3; k++) { push(); rotate(k * TAU / 3); shape(rr(20, -22, 260, 44, 20), { fill: '#d9d4c8', lw: 5 }); pop(); }
  pop(); shape(ell(820, 480, 34, 20, 16), { fill: '#b8b2a5', lw: 5 });
  // side counter with the big aluminium pot (ডেকচি) of rice, steam rising
  shape(rect(-400, 960, 520, 140), { fill: '#8a5a32', lw: 7 });
  shape(spline([[-330, 960], [-320, 800], [40, 800], [50, 960]]), { fill: '#c9ced3', lw: 7, shade: () => fillOnly(rect(-40, 800, 90, 160), '#a6adb4', { boil: .3 }) });
  shape(ell(-140, 800, 190, 26, 30), { fill: '#b1b8bf', lw: 6 });
  for (let i = 0; i < 3; i++) { const u = (t * .5 + i / 3) % 1; g.globalAlpha = .5 * (1 - u); stroke(spline([[-200 + i * 60, 780 - u * 200], [-180 + i * 60 + Math.sin(u * 6) * 20, 700 - u * 200], [-200 + i * 60, 620 - u * 200]], false), 6, { line: '#ffffff' }); g.globalAlpha = 1; }
}
// the long wooden table in front of the cast (drawn after the characters, so it hides their legs)
function table(t, items = {}) {
  shape(rect(-1500, TOP, 4200, 40), { fill: '#b07a44', lw: 7 });
  shape(rect(-1500, TOP + 40, 4200, 700), { fill: '#8a5a32', lw: 7, shade: () => { for (let x = -1500; x < 2700; x += 160) stroke([[x, TOP + 40], [x, TOP + 740]], 3, { line: '#74492a' }); } });
  if (items.jar) sugarJar(items.jar[0], TOP);
  for (const p of items.plates || []) plate(p[0], TOP - 4, p[1] ?? 1);
}
function plate(x, y, rice = 1) {   // steel plate (থালা) with a mound of rice
  shape(ell(x, y, 120, 22, 30), { fill: '#d3d8dc', lw: 6, shade: () => fillOnly(ell(x + 20, y + 6, 90, 12, 24), '#b8bec3', { boil: .3 }) });
  if (rice > 0) shape(spline([[x - 80 * rice, y - 4], [x - 50 * rice, y - 40 * rice], [x, y - 52 * rice], [x + 55 * rice, y - 38 * rice], [x + 82 * rice, y - 4]]), { fill: RICE, lw: 5, shade: () => { for (let i = 0; i < 9; i++) fillOnly(ell(x - 50 + hash(i) * 100, y - 10 - hash(i + 3) * 32 * rice, 7, 3, 8, hash(i + 9)), '#e2dccb', { boil: .2 }); } });
}
function sugarJar(x, y) {   // the tea-stall sugar jar (চিনির বয়াম), the suspect
  shape(rr(x - 46, y - 120, 92, 120, 14), { fill: 'rgba(225,240,245,.9)', lw: 6, shade: () => fillOnly(rect(x - 46, y - 70, 92, 70), '#ffffff', { boil: .3 }) });
  shape(rr(x - 52, y - 140, 104, 26, 8), { fill: '#d8343c', lw: 6 });
  text('চিনি', x, y - 96, { font: '800 26px "Baloo"' });
}
function spoon(hp, ang = 0, s = 1, full = true) {   // steel spoon held at the handle end; bowl points along ang
  push(); translate(hp[0], hp[1]); rotate(ang); scale(s);
  shape([[0, -5], [70, -4], [70, 4], [0, 5]], { fill: '#c9ced3', lw: 4 });
  shape(ell(92, 0, 26, 16, 18), { fill: '#d3d8dc', lw: 5 });
  if (full) shape(ell(92, -6, 20, 11, 14), { fill: RICE, lw: 4 });
  pop();
}
const spoonTip = (hp, ang, s = 1) => [hp[0] + Math.cos(ang) * 92 * s, hp[1] + Math.sin(ang) * 92 * s];
function magnifier(hp, ang = 0, s = 1) {   // big magnifying glass held at the handle
  push(); translate(hp[0], hp[1]); rotate(ang); scale(s);
  shape(rr(-8, -60, 16, 70, 6), { fill: '#7a4a28', lw: 5 });
  shape(ell(0, -120, 62, 62, 32), { fill: 'rgba(210,240,255,.55)', lw: 8, line: '#3a3a44', shade: () => fillOnly(ell(-20, -140, 18, 12, 12), 'rgba(255,255,255,.8)', { boil: .2 }) });
  pop();
}
function cup(hp, s = 1, tea = true) {   // small glass tea cup (চায়ের কাপ) held around the body
  push(); translate(hp[0], hp[1]); scale(s);
  shape([[-30, -50], [30, -50], [22, 20], [-22, 20]], { fill: 'rgba(225,240,245,.85)', lw: 5, shade: () => { if (tea) fillOnly([[-28, -36], [28, -36], [22, 20], [-22, 20]], '#b5672a', { boil: .3 }); } });
  pop();
}
function tiffin(hp, s = 1) {   // steel tiffin carrier held by its handle
  push(); translate(hp[0], hp[1]); scale(s);
  stroke(arc(0, 20, 30, 30, Math.PI, TAU, 10), 6, { line: '#8a9096' });
  for (let k = 0; k < 3; k++) shape(rr(-44, 20 + k * 44, 88, 44, 8), { fill: '#c9ced3', lw: 5 });
  pop();
}
function stars(x, y, k, col = '#ffd65a') {   // the "sweet!" sparkle
  if (k <= 0 || k > 1.4) return;
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * TAU + .3, d = 40 + 90 * eo(clamp(k / .5)), s = 14 * (1 - clamp((k - .9) / .5));
    if (s <= 0) continue;
    push(); translate(x + Math.cos(a) * d, y + Math.sin(a) * d); rotate(k * 2);
    shape([[0, -s * 1.6], [s * .4, -s * .4], [s * 1.6, 0], [s * .4, s * .4], [0, s * 1.6], [-s * .4, s * .4], [-s * 1.6, 0], [-s * .4, -s * .4]], { fill: col, lw: 4 });
    pop();
  }
}

// —— poses ——
function M(t, o = {}) { const m = talk('mama', t); return { x: 330, y: FLOOR, s: 1, t, look: [.5, .2], mouth: { o: m.o, w: m.w, sm: .25 }, headTilt: m.talking ? (m.o - .3) * .06 : Math.sin(q(t) * 1.6) * .02, sq: 1 + .008 * Math.sin(q(t) * 2.3), blink: blinks(t, 1), ...o }; }
function Bo(t, o = {}) { const m = talk('boltu', t); return { x: 800, y: FLOOR, s: 1, t, look: [-.5, .2], mouth: { o: m.o * 1.15, w: m.w, sm: .1 }, headTilt: m.talking ? (m.o - .3) * .08 : 0, sq: 1 + .012 * Math.sin(q(t) * 3.1), blink: blinks(t, 2), armL: { h: [-14, 104], bend: -12 }, armR: { h: [14, 104], bend: 12 }, ...o }; }
function Bi(t, o = {}) { const m = talk('bithi', t); return { x: 720, y: FLOOR, s: 1, t, look: [-.4, .1], mouth: { o: m.o, w: m.w, sm: .35 }, headTilt: m.talking ? (m.o - .3) * .06 : 0, sq: 1 + .008 * Math.sin(q(t) * 2.1), blink: blinks(t, 3), armL: { h: [-12, 140], bend: -12 }, armR: { h: [12, 140], bend: 12 }, ...o }; }
const lerpArm = (a, b, u) => ({ h: [lerp(a.h[0], b.h[0], u), lerp(a.h[1], b.h[1], u)], bend: lerp(a.bend, b.bend, u), fist: u > .5 ? b.fist : a.fist });
const poseTrack = (tq, keys) => { let p = keys[0][1]; for (let i = 0; i < keys.length - 1; i++) { const [ta, a] = keys[i], [tb, b] = keys[i + 1]; if (tq >= ta && tq < tb) return lerpArm(a, b, ss(seg(tq, ta, Math.min(tb, ta + .3)))); if (tq >= tb) p = b; } return p; };
const walk = (tq, on, amp = 18) => on ? [[Math.sin(tq * 12) * amp, -Math.max(0, Math.cos(tq * 12)) * 12], [-Math.sin(tq * 12) * amp, -Math.max(0, -Math.cos(tq * 12)) * 12]] : [[0, 0], [0, 0]];
// arm vector (front shoulder → world point) for a character at x facing `face`, scale s, standing at y
const reach = (D, x, face, wx, wy, s = 1, y = FLOOR) => { const sx = x + face * D.shW * s, sy = y - D.shY * s; return [(wx - sx) * face / s, (wy - sy) / s]; };
// mouth position in world coords (face = 1 or -1)
const mouthAt = (D, x, s = 1, y = FLOOR, my) => [x, y - my * s];
const MY = { mama: 348, boltu: 244, bithi: 356 };

// —— subtitles + labels ——
const NAME = { mama: ['মামা', '#f5b81c'], boltu: ['বল্টু', '#e2453a'], bithi: ['বিথী', '#2b67c9'] };
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
SH.open = t => {   // HOOK (frame-1 absurd still): Mama behind the hotel table, chewing, inspecting his rice through a huge magnifier, the sugar jar beside his plate; at 0.35 s his eyes pop (sweet!)
  const k = t - T.pop, popd = k > 0;
  cam(440, 1130, 1.75);
  hotel(t);
  const P = M(t, { x: 360, look: popd ? [.2, -.3] : [.7, .6], eyeS: popd ? 1.35 : 1, pupil: popd ? 2.8 : undefined, brow: popd ? 1.3 : -.4,
    headTilt: popd ? -.06 : .05, sq: popd ? 1 + .05 * Math.max(0, 1 - k / .25) : 1,
    mouth: talk('mama', t).talking ? { ...talk('mama', t), sm: .1 } : chewM(t),
    armR: { h: reach(MAMA, 360, 1, 560, 1090), bend: 20 }, armL: { h: [40, 60], bend: -14 } });
  P.holdR = hp => magnifier(hp, Math.PI + (popd ? -.3 * Math.max(0, 1 - k / .3) : 0), .9);
  P.holdL = hp => spoon(hp, -.2, 1, false);
  mama(P);
  table(t, { jar: [700], plates: [[560, 1]] });
  stars(360, 820, k);
  if (t > LN.m1.t0 + .3) tag('মিষ্টি?!', 600, 700, { bg: '#ffd65a', fg: INK, size: 54 });
};
SH.boltuQ = t => {   // two-shot: Boltu at the table takes a spoonful, chews once, flat: "my rice is bland"; Mama turns to him
  const tq = q(t), a = T.spoonB;
  cam(550, 1150, 1.45);
  hotel(t);
  const toMouth = poseTrack(tq, [[a - .6, { h: [40, 50], bend: 14 }], [a - .3, { h: reach(BOLTU, 800, -1, 800 - 100, FLOOR - MY.boltu + 6), bend: 30 }], [a + .5, { h: reach(BOLTU, 800, -1, 800 - 100, FLOOR - MY.boltu + 6), bend: 30 }], [a + .8, { h: [40, 60], bend: 14 }]]);
  const P = M(t, { x: 300, face: 1, look: [.9, -.1], brow: .4, mouth: talk('mama', t).talking ? talk('mama', t) : { o: 0, w: .8, sm: .5 } }); mama(P);
  const chewing = tq > a + .1 && tq < LN.b1.t0;
  const B = Bo(t, { x: 800, face: -1, look: [.8, -.1], lid: talk('boltu', t).talking ? .35 : 0, brow: -.2, mouth: chewing ? chewM(t, 3) : { ...talk('boltu', t), sm: -.2 }, armR: toMouth });
  B.holdR = hp => spoon(hp, Math.PI + .3, .85, tq < a + .1); boltu(B);
  table(t, { jar: [560], plates: [[330, .7], [790, .9]] });
};
SH.order = t => {   // Mama leans across and points at Boltu's mouth: "Chew more!"
  const tq = q(t);
  cam(540, 1140, 1.45);
  hotel(t);
  const P = M(t, { x: 330, face: 1, lean: .1, look: [.9, .1], brow: -.8, mouth: { ...talk('mama', t), sm: -.1 }, armR: { h: [190, -60], bend: 10 } }); mama(P);
  boltu(Bo(t, { x: 800, face: -1, look: [.9, -.2], eyeS: 1.1, brow: .7, nerv: .3, mouth: { o: 0, w: .7, sm: -.2 } }));
  table(t, { jar: [560], plates: [[330, .7], [790, .9]] });
};
SH.chew = t => {   // close-up: Boltu chews hard (clock ticking); the sweetness arrives; "আরে, সত্যিই মিষ্টি!"
  const tq = q(t), k = t - T.sweetB, sweet = k > 0;
  cam(800, 1180, 2.2);
  hotel(t, { door: false });
  boltu(Bo(t, { x: 800, face: -1, look: sweet ? [0, -.4] : [-.2, .5], eyeS: sweet ? 1.3 : .95, pupil: sweet ? 2.6 : undefined, lid: sweet ? 0 : .3, brow: sweet ? 1.3 : -.4,
    mouth: talk('boltu', t).talking ? { ...talk('boltu', t), sm: .6 } : (sweet ? { o: .3, w: .7, sm: .5 } : chewM(t, 3)), headTilt: sweet ? 0 : Math.sin(tq * 18) * .03,
    armR: sweet ? { h: [-30, -40], bend: 40 } : { h: [14, 104], bend: 12 } }));
  table(t, { plates: [[790, .8]] });
  if (!sweet) { const z = back(clamp((t - T.chew0) / .3), 1.4); if (z > .05) { tag('কিছুক্ষণ পর…', 800, 820, { bg: '#f4f1ea', fg: INK, size: Math.round(44 * Math.min(1.15, z)) }); reset(); push(); translate(1000, 950); shape(ell(0, 0, 50, 50, 24), { fill: '#fff', lw: 6 }); stroke([[0, 0], [Math.cos(tq * 6) * 36, Math.sin(tq * 6) * 36]], 5); pop(); } }
  stars(800, 1000, k);
};
SH.turn = t => {   // Boltu turns to the doorway: "Apu, where did the sugar come from?" Bithi appears in the doorway with her tiffin carrier
  const tq = q(t), u = seg(t, LN.b2.t0 + 1.4, LN.b2.t0 + 2.8);
  cam(860, 1150, 1.3);
  hotel(t);
  const P = M(t, { x: 330, face: 1, look: [.9, -.1], brow: .9, mouth: { o: 0, w: .8, sm: .6 }, armR: { h: [60, 40], bend: 14, fist: true }, armL: { h: [-60, 40], bend: -14, fist: true } }); mama(P);
  boltu(Bo(t, { x: 700, face: 1, look: [.9, -.2], brow: .8, mouth: { ...talk('boltu', t), sm: .3 }, armR: { h: [70, -20], bend: 20 } }));
  const bix = lerp(1450, 1150, eo(u));
  const B = Bi(t, { x: bix, face: -1, look: [.6, 0], legL: walk(tq, u > 0 && u < 1)[0], legR: walk(tq, u > 0 && u < 1)[1] }); B.holdL = hp => tiffin(hp, .8); bithi(B);
  table(t, { jar: [520], plates: [[330, .7], [700, .9]] });
};
SH.enter = t => {   // Bithi steps up to the table and points at Boltu's mouth on "দেখো!"
  const tq = q(t), u = seg(t, LN.t1.t0 - .2, LN.t1.t0 + .5), point = tq > LN.t1.t1 - .7;
  cam(650, 1150, 1.3);
  hotel(t);
  const P = M(t, { x: 300, face: 1, look: [.9, -.1], brow: .3, mouth: { o: 0, w: .8, sm: .3 } }); mama(P);
  boltu(Bo(t, { x: 640, face: 1, look: [.9, -.3], eyeS: 1.1, brow: .6 }));
  const B = Bi(t, { x: lerp(1130, 980, eo(u)), face: -1, look: [.7, -.1], brow: .4, legL: walk(tq, u > 0 && u < 1)[0], legR: walk(tq, u > 0 && u < 1)[1],
    armR: point ? { h: reach(BITHI, 980, -1, 640 + 60, FLOOR - MY.boltu), bend: 10 } : { h: [12, 140], bend: 12 } });
  B.holdL = hp => tiffin(hp, .8); bithi(B);
  table(t, { jar: [520], plates: [[300, .7], [640, .9]] });
};
// —— the demonstration: inside the mouth ——
function mouthSet(t) {   // cartoon cross-section of a mouth: lips, teeth, tongue, warm inside
  bands(['#3a1424', '#331020', '#2c0d1b'], -100, 2100);
  reset();
  shape(spline([[60, 420], [540, 300], [1020, 420], [1040, 1180], [540, 1300], [40, 1180]]), { fill: '#c0485e', lw: 9 });
  for (let i = 0; i < 8; i++) { shape(rr(130 + i * 108, 330 + Math.abs(i - 3.5) * 12, 90, 90, 22), { fill: '#fbfbf6', lw: 6 }); shape(rr(130 + i * 108, 1110 - Math.abs(i - 3.5) * 12, 90, 90, 22), { fill: '#fbfbf6', lw: 6 }); }
  shape(spline([[120, 1100], [320, 900], [760, 890], [960, 1100]]), { fill: '#e8637a', lw: 7 });
}
function starch(cx, cy, n, t, cutK, sweetK) {   // starch = a long chain of glucose beads; cut into pairs = maltose
  const gap = 88, x0 = cx - (n - 1) * gap / 2;
  for (let i = 0; i < n; i++) {
    const pair = Math.floor(i / 2), off = (pair - (n / 4 - .5)) * 40 * cutK, x = x0 + i * gap + off, y = cy + Math.sin(i * .9 + t * 2) * 10 + (pair % 2 ? 1 : -1) * 30 * cutK;
    if (i < n - 1 && !(i % 2 === 1 && cutK > 0)) { const nx = x0 + (i + 1) * gap + Math.floor((i + 1) / 2 - (n / 4 - .5)) * 40 * cutK * 0 + off; stroke([[x, y], [x + gap, cy + Math.sin((i + 1) * .9 + t * 2) * 10 + (pair % 2 ? 1 : -1) * 30 * cutK]], 8, { line: '#f4f1ea' }); }
    shape(ell(x, y, 32, 32, 18), { fill: sweetK > 0 ? '#ffd65a' : '#f7f4ea', lw: 5 });
  }
  if (sweetK > 0) for (let p = 0; p < n / 2; p++) { const x = x0 + (p * 2 + .5) * gap + (p - (n / 4 - .5)) * 40, y = cy + (p % 2 ? 1 : -1) * 30; stars(x, y - 10, sweetK * .8); }
}
function enzyme(x, y, open, s = 1) {   // ptyalin drawn as a little pair of scissors (a cartoon of an enzyme that cuts)
  push(); translate(x, y); scale(s);
  for (const sg of [-1, 1]) { push(); rotate(sg * open * .5); shape(rr(0, -8, 80, 16, 8), { fill: '#3fd0f2', lw: 5 }); shape(ell(-22, sg * 14, 18, 14, 14), { fill: '#19a9d8', lw: 5 }); pop(); }
  dot(0, 0, 5);
  pop();
}
SH.mouth = t => {   // starch chain in the mouth → saliva arrives with ptyalin → snip → maltose pairs glow sweet
  const tq = q(t), a = LN.t2.t0, z = back(clamp((t - T.zoom0) / .45), 1.2);
  cam(540, 900, lerp(.6, 1, z));
  mouthSet(t);
  reset();
  // one grain of rice magnified on the tongue → it opens into the chain
  const open = clamp((t - a) / .8);
  if (open < 1) shape(ell(540, 760, 120 * (1 - open) + 20, 50 * (1 - open) + 20, 24), { fill: RICE, lw: 6 });
  if (open > 0) starch(540, 720, 10, tq, ss(clamp((t - T.cut) / .5)), clamp((t - T.sugar) / .4));
  if (t > a + .3) tag('শ্বেতসার (স্টার্চ)', 540, 590, { bg: '#f4f1ea', fg: INK, size: 42 });
  // saliva drops drift in from the side carrying the enzyme
  const e = clamp((t - T.enz) / 1.0);
  if (e > 0) {
    for (let i = 0; i < 9; i++) { const u = (tq * .4 + hash(i)) % 1; fillOnly(ell(120 + hash(i + 3) * 840, 880 + u * 160, 12, 16, 12), 'rgba(200,236,250,.7)', { boil: .3 }); }
    const snip = Math.abs(Math.sin(tq * 10)) * (t > T.cut - .4 && t < T.cut + .6 ? 1 : .3);
    for (let i = 0; i < 4; i++) { const tx_ = 144 + (2 * i + 1.5) * 88 - 75, x = lerp(-200 - i * 140, tx_, eo(e)); enzyme(x, lerp(880, 722, clamp((t - T.cut + .6) / .5)), snip, 1.2); }
    tag('লালা: টায়ালিন এনজাইম', 540, 1000, { bg: '#3fd0f2', fg: INK, size: 40 });
  }
  if (t > T.sugar) { const zz = back(clamp((t - T.sugar) / .3), 1.4); tag('মলটোজ = চিনি!', 540, 480, { bg: '#ffd65a', fg: INK, size: Math.round(56 * Math.min(1.15, zz)) }); }
};
SH.path = t => {   // Bithi with the digestive-path card: digestion starts in the mouth; "chew your rice well"
  const tq = q(t), a = LN.t3.t0;
  cam(520, 1130, 1.4);
  hotel(t, { door: false, board: false });
  const B = Bi(t, { x: 300, face: 1, look: [.7, -.4], brow: .4, armR: { h: [110, -60], bend: 14 } }); B.holdL = hp => tiffin(hp, .8); bithi(B);
  table(t, {});
  reset(); push(); translate(760, 640); scale(back(clamp((t - a) / .3), 1.3));
  shape(rr(-230, -300, 460, 600, 30), { fill: '#f4f1ea', lw: 7 });
  // simple body outline: head with mouth, food pipe, stomach
  shape(ell(0, -200, 90, 80, 30), { fill: '#e8b48a', lw: 6 });
  stroke([[0, -120], [0, 60]], 18, { line: '#e8637a' }); shape(spline([[0, 50], [80, 70], [100, 150], [40, 200], [-40, 170], [-30, 100]]), { fill: '#f08aa0', lw: 6 });
  const hl = (Math.floor(tq * 4) % 2) ? '#ffd65a' : '#ffb000';
  shape(ell(0, -170, 40, 20, 16), { fill: hl, lw: 6 });
  text('মুখ', 140, -170, { font: '800 40px "Baloo"' }); text('পাকস্থলী', 0, 260, { font: '800 36px "Baloo"' });
  pop();
  if (t > a + .5) tag('হজম শুরু মুখেই!', 760, 260, { bg: '#2b67c9', fg: '#fff', size: 48 });
};
SH.tea = t => {   // Mama grabs his tea: "no more sugar — I'll chew my tea sweet!", lifts the cup and sips
  const tq = q(t), k = t - T.sip;
  cam(480, 1140, 1.45);
  hotel(t);
  const lift = poseTrack(tq, [[LN.m3.t0, { h: [80, 40], bend: 14 }], [LN.m3.t0 + .3, { h: [110, -60], bend: 14 }], [T.sip - .3, { h: [110, -60], bend: 14 }], [T.sip, { h: reach(MAMA, 380, 1, 380 + 40, FLOOR - MY.mama + 30), bend: 30 }]]);
  const P = M(t, { x: 380, face: 1, look: k > 0 ? [.3, .6] : [.7, -.4], brow: -.6, mouth: k > 0 ? { o: 0, w: .6, sm: 0 } : { ...talk('mama', t), sm: .7 }, armR: lift,
    armL: tq > LN.m3.t0 + .8 && k < 0 ? { h: [-60, -150], bend: -10, fist: true } : undefined });
  P.holdR = hp => cup(hp, 1); mama(P);
  boltu(Bo(t, { x: 820, face: -1, look: [.9, -.1], brow: .5 }));
  table(t, { jar: [620], plates: [[380, .5]] });
};
SH.pause = t => {   // cold pause (music cut): close-up, Mama chewing tea with full cheeks, eyes rolling up, waiting for sweetness; nothing happens
  const tq = q(t), a = T.shots.find(s => s[2] === 'pause')[0];
  cam(380, 1020, 2.6);
  hotel(t, { door: false, board: false });
  const P = M(t, { x: 380, face: 1, look: [Math.sin(tq * 3) * .6, -.8], brow: .2, sq: 1 + .02 * Math.abs(Math.sin(tq * 9)), mouth: chewM(t, 2.6), armR: { h: [90, 10], bend: 14 } });
  P.holdR = hp => cup(hp, 1, false); mama(P);
  table(t, {});
  if (t > a + .55) tag('চায়ে শ্বেতসার নেই', 540, 420, { bg: '#f4f1ea', fg: INK, size: 46 });
};
SH.deadpan = t => {   // "…bland." Mama flat, half-lidded; Boltu and Bithi exchange a look
  cam(630, 1150, 1.3);
  hotel(t);
  const P = M(t, { x: 330, face: 1, look: [.5, .4], lid: .55, brow: -.3, mouth: { ...talk('mama', t), sm: -.5 }, armR: { h: [80, 40], bend: 14 } }); P.holdR = hp => cup(hp, 1, false); mama(P);
  const look = t > LN.m4.t1 - .1;
  boltu(Bo(t, { x: 690, face: 1, look: look ? [.9, -.4] : [-.8, 0], lid: .4, mouth: { o: 0, w: .7, sm: .2 } }));
  const B = Bi(t, { x: 930, face: -1, look: look ? [.9, .3] : [.9, 0], lid: .3, mouth: { o: 0, w: .8, sm: .5 } }); B.holdL = hp => tiffin(hp, .8); bithi(B);
  table(t, { jar: [500], plates: [[330, .5], [690, .9]] });
};
SH.puzzle = t => {   // Bithi turns to camera; thought bubble: a bowl of puffed rice vs cucumber slices — which turns sweet?
  const tq = q(t), a = LN.t4.t0;
  cam(380, 1130, 1.5);
  hotel(t, { door: false, board: false });
  const turn = tq > a + 3.2;
  const B = Bi(t, { x: 300, face: 1, look: turn ? [0, 0] : [.7, -.5], brow: .5, armR: turn ? { h: [12, 140], bend: 12 } : { h: [90, -130], bend: 20 } }); B.holdL = hp => tiffin(hp, .7); bithi(B);
  table(t, {});
  if (t > a + .1) tag('ধাঁধা!', 540, 220, { bg: '#ffd65a', fg: INK, size: 64 });
  if (t > a + .8) {
    const z = back(clamp((t - a - .8) / .3), 1.4); reset(); push(); translate(600, 640); scale(z);
    shape(spline([[-330, 0], [-300, -170], [-100, -210], [140, -200], [330, -110], [320, 120], [100, 190], [-220, 170]]), { fill: '#f4f1ea', lw: 7 });
    // মুড়ি bowl
    shape(spline([[-260, -40], [-90, -40], [-110, 40], [-240, 40]]), { fill: '#b07a44', lw: 5 });
    for (let i = 0; i < 14; i++) shape(ell(-240 + hash(i) * 130, -50 - hash(i + 4) * 40, 14, 8, 10, hash(i + 2) * 3), { fill: '#f3e2b0', lw: 3 });
    // শসা slices
    for (let i = 0; i < 3; i++) shape(ell(120 + i * 70, -10, 34, 34, 20), { fill: '#3f8a3a', lw: 5, shade: () => fillOnly(ell(120 + i * 70, -10, 26, 26, 18), '#cfe8a6', { boil: .3 }) });
    text('মুড়ি', -175, 100, { font: '800 40px "Baloo"' }); text('শসা', 190, 100, { font: '800 40px "Baloo"' });
    text('?', 0, -120, { font: '800 100px "Baloo"', fill: '#e2453a' });
    pop();
    if (t > a + 1.6) tag('কোনটা মিষ্টি লাগবে?', 600, 330, { bg: '#e8d9b8', fg: INK, size: 40 });
  }
};
SH.end = t => {
  cam(540, 960, 1);
  bands(['#5fa89a', '#6fb5a7', '#82c2b4'], -100, 2100);
  const pu0 = back(clamp((t - T.VEND) / .4), 1.6);
  reset(); push(); translate(540, 820); scale(Math.max(.01, pu0) * 1.8); plate(0, 0, 1); pop();
  reset(); shape(rect(-100, 1560, 1300, 600), { fill: '#8a5a32', lw: 7 });
  g.setTransform(1, 0, 0, 1, 0, 0); g.font = '800 120px "Baloo"'; g.textAlign = 'center'; g.textBaseline = 'middle';
  const kk = Math.floor(t * 12) % 3, jx = [0, 1.5, -1][kk], jy = [0, -1, 1.5][kk];
  const pu = back(clamp((t - T.VEND - .15) / .4), 1.6);
  g.save(); g.translate(540 + jx, 360 + jy); g.scale(pu, pu);
  g.lineWidth = 22; g.lineJoin = 'round'; g.strokeStyle = INK; g.strokeText('সাইন্টিফিক বিথী', 0, 0); g.fillStyle = '#ffd65a'; g.fillText('সাইন্টিফিক বিথী', 0, 0); g.restore();
  reset();
  mama(M(t, { x: 210, y: 1560, s: 1, look: [0, 0], mouth: { o: 0, w: 1, sm: .8 } }));
  bithi(Bi(t, { x: 540, y: 1560, s: 1, look: [0, 0], mouth: { o: 0, w: 1, sm: .8 } }));
  boltu(Bo(t, { x: 870, y: 1560, s: 1.05, look: [0, 0], mouth: { o: 0, w: 1, sm: .8 } }));
};

let lastSub = null;
const THUMB = new URLSearchParams(location.search).get('thumb');
window.render = t => {
  frame(t); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#5fa89a'; g.fillRect(0, 0, W, H);
  if (THUMB) {   // thumbnail cutouts on a flat key colour
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#ff00ff'; g.fillRect(0, 0, W, H); reset(); translate(540, 1700); scale(2.6); translate(-540, -1500);
    const amazed = { look: [.3, -.2], eyeS: 1.25, pupil: 2.8, brow: 1.2, mouth: { o: .75, w: .75, sm: .3 }, armL: { h: [-70, -130], bend: -20 }, armR: { h: [70, -130], bend: 20 }, blink: false };
    if (THUMB === 'bithi') bithi(Bi(0, { x: 540, ...amazed }));
    if (THUMB === 'mama') { const P = M(0, { x: 540, look: [.2, -.3], eyeS: 1.35, pupil: 2.8, brow: 1.3, mouth: { o: .1, w: .7, sm: .4 }, blink: false, armR: { h: [60, -150], bend: 14 }, armL: { h: [-70, -120], bend: -20 } }); P.holdR = hp => spoon(hp, -1.4, 1.1, true); mama(P); }
    lastSub = null; return;
  }
  const s = T.shots.find(s => t >= s[0] && t < s[1]) || T.shots[T.shots.length - 1];
  SH[s[2]](t);
  lastSub = (s[2] === 'end') ? null : subtitle(t);
};
window.TEXTS = t => { window.render(t); return lastSub ? [{ id: lastSub.text, text: lastSub.text, x0: 60, y0: lastSub.y0, x1: 1020, y1: lastSub.y1 }] : []; };
window.EV = [];
await document.fonts.load('800 54px "Baloo"', 'সাইন্টিফিক বিথী ভাত মিষ্টি');
await document.fonts.ready;
window.READY = true;
