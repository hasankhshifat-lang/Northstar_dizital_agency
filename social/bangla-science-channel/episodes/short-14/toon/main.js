// Scientific Bithi Short 14 × Sci-Fi Sitcom Toon (9:16): "চামচের কি জ্বর হয়েছে?" — heat conduction (তাপ পরিবহন). No scientist.
// Setting: a winter-evening pitha stall by the road: clay chula with a fire, a steaming pot of gur water, shops and a rickshaw across the road, an iron grille window and a wooden door at the back.
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
const FLOOR = 1500, MX = 330, BX = 840, TIX = 720;
const CX = 520, CTOP = 1250;                               // clay chula centre x and top
const POTB = CTOP - 6, POTT = POTB - 150;                  // aluminium pot (হাঁড়ি) bottom/top
const SPOON = [[CX + 20, POTT + 12], [CX + 80, POTT - 120]];   // steel spoon: in the pot → handle end
const LADLE = [[CX - 40, POTT + 12], [CX - 100, POTT - 130]];   // wooden ladle (হাতা)

// —— winter evening pitha stall by the road (শীতের পিঠার দোকান) ——
function rickshaw(x, y, s = 1) {
  push(); translate(x, y); scale(s);
  for (const wx of [-90, 90]) { shape(ell(wx, -60, 60, 60, 24), { fill: '#3a3a44', lw: 6 }); shape(ell(wx, -60, 16, 16, 12), { fill: '#d6dde0', lw: 4 }); }
  shape([[-130, -150], [130, -150], [110, -110], [-110, -110]], { fill: '#d8343c', lw: 6 });
  shape(spline([[-120, -150], [-130, -300], [0, -340], [120, -300], [110, -150]]), { fill: '#2b67c9', lw: 6, shade: () => { for (let k = 0; k < 4; k++) fillOnly(rect(-120, -290 + k * 34, 240, 10), '#f2c230', { boil: .2 }); } });
  pop();
}
function stall(t) {
  bands(['#4b3a6e', '#8a5a7a', '#e0906a'], -900, 900);                                       // winter dusk
  for (let i = 0; i < 3; i++) fillOnly(rect(-600, 760 + i * 70, 2400, 40), `rgba(240,236,230,${.25 - i * .05})`, { boil: .4 });   // mist
  // shops across the road: shutters + a sign board (no letters)
  for (let i = 0; i < 4; i++) { const x = -400 + i * 420; shape(rect(x, 560, 380, 420), { fill: ['#c98a55', '#9a7aa0', '#7aa0a0', '#c9a46a'][i], lw: 6, shade: () => { fillOnly(rect(x + 30, 700, 320, 280), '#8e979c', { boil: .2 }); for (let k = 0; k < 9; k++) stroke([[x + 30, 720 + k * 30], [x + 350, 720 + k * 30]], 2.5, { line: '#737b80' }); fillOnly(rect(x + 40, 590, 300, 60), '#f4f1ea', { boil: .2 }); } }); }
  // street lamp (flat, not glowing)
  stroke([[1240, 1100], [1240, 620]], 10, { line: '#3a3a44' }); shape(rr(1200, 600, 80, 30, 8), { fill: '#f2e6a8', lw: 5 });
  shape(rect(-600, 980, 2400, 120), { fill: '#5a5a66', lw: 6, shade: () => { for (let k = 0; k < 8; k++) fillOnly(rect(-500 + k * 300 - (t * 10 % 300), 1036, 120, 8), '#f4f1ea', { boil: .2 }); } });   // road
  rickshaw(1050, 1100, .9);
  // stall canopy: tin sheet on bamboo poles, back wall with a grille window and a wooden door (they return in the puzzle)
  shape(rect(-400, 700, 1220, 420), { fill: '#b8845a', lw: 7, shade: () => fillOnly(rect(600, 700, 220, 420), '#9a6a44', { boil: .2 }) });
  shape(rect(-300, 780, 220, 220), { fill: '#3a2a24', lw: 6, shade: () => { for (let k = 0; k < 6; k++) fillOnly(rect(-290 + k * 36, 780, 10, 220), '#6b6f78', { boil: .2 }); for (let k = 0; k < 3; k++) fillOnly(rect(-300, 820 + k * 60, 220, 8), '#6b6f78', { boil: .2 }); } });   // iron grille window
  shape(rect(640, 800, 150, 320), { fill: '#8a5a2b', lw: 6, shade: () => { fillOnly(rect(650, 810, 60, 140), '#a8703c', { boil: .2 }); fillOnly(rect(720, 810, 60, 140), '#a8703c', { boil: .2 }); dot(770, 960, 6, '#f2c230'); } });   // wooden door
  shape([[-500, 640], [900, 640], [860, 720], [-460, 720]], { fill: '#8e979c', lw: 7, shade: () => { for (let x = -500; x < 900; x += 46) fillOnly(rect(x, 650, 20, 70), '#737b80', { boil: .2 }); } });
  for (const px of [-420, 860]) shape(rect(px, 700, 30, 820), { fill: '#c9b06a', lw: 6 });
  shape(rect(-600, 1120, 2400, 1400), { fill: '#a8906a', lw: 7, shade: () => { for (let k = 0; k < 7; k++) stroke([[-600, 1160 + k * k * 22], [1800, 1160 + k * k * 22]], 3, { line: '#8e7650' }); } });
}
function chula(t, { fireUp = 0 } = {}) {   // clay stove with a fire; the aluminium pot of hot gur water steaming on top
  shape([[CX - 130, FLOOR], [CX + 130, FLOOR], [CX + 110, CTOP], [CX - 110, CTOP]], { fill: '#b5532e', lw: 7, shade: () => fillOnly([[CX + 40, FLOOR], [CX + 130, FLOOR], [CX + 110, CTOP], [CX + 30, CTOP]], '#8e3c1e', { boil: .3 }) });
  shape(rr(CX - 50, FLOOR - 140, 100, 100, 30), { fill: '#2a1a14', lw: 6 });
  for (let i = 0; i < 3; i++) { const h = 50 + 20 * Math.sin(q(t) * 9 + i * 2) + fireUp * 40; shape(spline([[CX - 36 + i * 30, FLOOR - 50], [CX - 26 + i * 30, FLOOR - 50 - h * .6], [CX - 22 + i * 30, FLOOR - 50 - h], [CX - 14 + i * 30, FLOOR - 50 - h * .6], [CX - 6 + i * 30, FLOOR - 50]]), { fill: i === 1 ? '#ffb03a' : '#ff7a1f', lw: 3 }); }
}
function pot(t, { tools = true } = {}) {
  shape(spline([[CX - 120, POTT + 10], [CX - 130, POTB - 60], [CX - 90, POTB], [CX + 90, POTB], [CX + 130, POTB - 60], [CX + 120, POTT + 10]]), { fill: '#b8c0c6', lw: 7, shade: () => fillOnly(ell(CX + 60, POTB - 70, 50, 60, 20), '#959ea5', { boil: .3 }) });
  shape(ell(CX, POTT + 10, 124, 22, 30), { fill: '#d6dde0', lw: 6 }); shape(ell(CX, POTT + 12, 108, 15, 30), { fill: '#8a4a1e', lw: 4 });
  if (tools) { stroke(SPOON, 10, { line: '#c3cbd0' }); shape(ell(SPOON[1][0], SPOON[1][1], 12, 8, 12), { fill: '#c3cbd0', lw: 4 }); stroke(LADLE, 16, { line: '#a8703c' }); }
  steam(CX, POTT - 10, t);
}
function steam(x, y, t, n = 3) { for (let i = 0; i < n; i++) { const u = (t * .5 + i / n) % 1; stroke(spline([[x - 40 + i * 40, y - u * 160], [x - 30 + i * 40, y - 30 - u * 160], [x - 46 + i * 40, y - 60 - u * 160], [x - 32 + i * 40, y - 90 - u * 160]], false), 6, { line: `rgba(255,255,255,${.7 * (1 - u)})` }); } }
function heatLines(x, y, t, n = 3) { for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (i - 1) * .5, k = (t * 3 + i * .3) % 1; stroke([[x + Math.cos(a) * (20 + k * 20), y + Math.sin(a) * (20 + k * 20)], [x + Math.cos(a) * (40 + k * 20), y + Math.sin(a) * (40 + k * 20)]], 5, { line: '#ff6b5a' }); } }
function gamBall(hp, s = 1) {   // gamchha wound round the hand into a huge ball
  push(); translate(hp[0], hp[1]); scale(s);
  shape(ell(0, 0, 48, 42, 24), { fill: PAL.gam, lw: 6, shade: () => { for (let k = 0; k < 5; k++) fillOnly(rect(-60, -36 + k * 18, 120, 5), '#ffffff', { boil: .2 }); for (let k = 0; k < 4; k++) fillOnly(rect(-40 + k * 26, -50, 5, 100), '#ffffff', { boil: .2 }); } });
  pop();
}
function candle(hp, lit = true) { push(); translate(hp[0], hp[1]); shape(rr(-10, -70, 20, 80, 4), { fill: '#f4f1ea', lw: 4 }); if (lit) shape(spline([[0, -96], [7, -80], [0, -70], [-7, -80]]), { fill: '#ffb03a', lw: 3 }); pop(); }
function woodBowl(x, y, s = 1, char = 0) { push(); translate(x, y); scale(s); shape(spline([[-90, -40], [-80, 10], [-40, 36], [40, 36], [80, 10], [90, -40]]), { fill: '#a8703c', lw: 6, shade: () => { fillOnly(ell(30, 10, 40, 20, 16), '#87562a', { boil: .3 }); if (char > 0) fillOnly(ell(0, 30, 50 * char, 10 * char + 2, 16), '#2a1a14', { boil: .3 }); } }); shape(ell(0, -40, 90, 14, 24), { fill: '#c9954f', lw: 5 }); pop(); }
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
const set = (t, o = {}) => { stall(t); chula(t, o); };
const toLocal = (P, w) => { const f = P.face ?? 1, sc = P.s ?? 1, x = (w[0] - P.x) / (sc * f), y = (w[1] - P.y) / (sc * (P.sq ?? 1)), a = -(P.lean ?? 0); return [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)]; };
const MX0 = 300;                                            // Mama's spot at the stove (left, in front)
SH.open = t => {   // HOOK: Mama, hand wound into a huge gamchha ball, gingerly pinches the steel spoon in the steaming pot; yanks it back at 0.45 s
  cam(470, 1120, 1.85);
  set(t); pot(t);
  const k = t - T.yank, yk = ss(clamp(k / .15));
  const tip = [SPOON[1][0] - 6, SPOON[1][1] + 6];
  const armR = lerpArm({ h: reach(MAMA, MX0, 1, tip[0], tip[1]), bend: 20 }, { h: [40, -60], bend: 40 }, yk);
  const P = M(t, { x: MX0, look: k > 0 ? [.4, -.2] : [.9, -.4], brow: k > 0 ? 1.3 : .9, eyeS: k > 0 ? 1.25 : 1.05, nerv: k > 0 && k < .8 ? .7 : .2, mouth: { ...talk('mama', t), sm: -.3 }, armR, sweat: t * .9 });
  P.holdR = hp => gamBall(hp, 1.05);
  mama(P);
  if (k > 0 && k < 1.2) heatLines(SPOON[1][0], SPOON[1][1] - 10, t);
};
SH.boltuQ = t => {   // Boltu walks in and points at the gamchha ball
  const tq = q(t), u = seg(t, LN.b1.t0 - .1, LN.b1.t0 + .5);
  cam(560, 1150, 1.3);
  set(t); pot(t);
  const P = M(t, { x: MX0 - 40, look: u > .5 ? [.9, 0] : [.4, -.2], brow: .6, armR: { h: [40, -60], bend: 40 } });
  P.holdR = hp => gamBall(hp, 1.05);
  mama(P);
  const bx = lerp(1060, 800, eo(u));
  const ball = [MX0 - 40 + MAMA.shW + 40, FLOOR - MAMA.shY - 60];
  boltu(Bo(t, { x: bx, face: -1, look: [.8, -.2], brow: .8, legL: walk(tq, u > 0 && u < 1)[0], legR: walk(tq, u > 0 && u < 1)[1],
    armR: u >= 1 ? { h: cap(reach(BOLTU, bx, -1, ball[0] + 40, ball[1]), 135), bend: 6 } : { h: [14, 104], bend: 12 } }));
};
SH.angry = t => {   // "steel spoon is angry, wooden ladle is polite": scowls at the spoon, then grips the ladle bare-handed, chin up
  const k = t - T.ladle;
  cam(450, 1100, 1.7);
  set(t); pot(t);
  heatLines(SPOON[1][0], SPOON[1][1] - 10, t, 2);
  const grip = [lerp(LADLE[0][0], LADLE[1][0], .55), lerp(LADLE[0][1], LADLE[1][1], .55)];   // hand round the ladle's handle
  const armR = k > 0 ? lerpArm({ h: [40, 30], bend: 30 }, { h: reach(MAMA, MX0, 1, grip[0], grip[1]), bend: 14 }, ss(clamp(k / .3))) : { h: [40, 30], bend: 30 };
  const P = M(t, { x: MX0, look: k > 0 ? [.3, -.5] : [.9, -.5], brow: k > 0 ? -.4 : -1.1, worry: false, mouth: { ...talk('mama', t), sm: k > 0 ? .6 : -.4 }, armR });
  mama(P);
};
function carryCandle(t, u, bx, extra = {}) {   // Bithi walks in with a lit candle in a saucer
  const tq = q(t);
  const P = Bi(t, { x: bx, face: -1, look: [.5, 0], brow: .2, legL: walk(tq, u > 0 && u < 1)[0], legR: walk(tq, u > 0 && u < 1)[1], armR: { h: [60, 40], bend: 30 }, ...extra });
  P.holdR = hp => candle([hp[0] + 4, hp[1] - 6]);
  return P;
}
SH.enter = t => {   // wide: Bithi walks in with a lit candle; Boltu turns to her as he asks
  const u = seg(t, LN.b2.t0 - .3, LN.b2.t1 + .3);
  cam(560, 1150, 1.05);
  set(t); pot(t);
  mama(M(t, { x: MX0 - 120, look: u > .4 ? [.9, 0] : [.9, .2], brow: .4 }));
  boltu(Bo(t, { x: 780, face: u > .1 ? 1 : -1, look: u > .1 ? [.7, -.2] : [-.8, -.3], brow: .9, armR: talk('boltu', t).talking && u > .1 ? { h: [60, -20], bend: 16 } : { h: [14, 104], bend: 12 } }));
  bithi(carryCandle(t, u, lerp(1250, 1000, eo(u))));
};
// the test: steel spoon + wooden spoon standing in a bowl of hot water, a wax bead on each handle end
const BWX = 540, BWY = 1240;                                 // bowl bottom centre on the counter (insert framing)
function bowlBack() { shape(ell(BWX, BWY - 120, 170, 30, 30), { fill: '#c3cbd0', lw: 6 }); shape(ell(BWX, BWY - 118, 152, 22, 30), { fill: '#9fd0e6', lw: 4 }); }
function bowlFront(t) { shape(spline([[BWX - 170, BWY - 120], [BWX - 150, BWY - 30], [BWX - 80, BWY], [BWX + 80, BWY], [BWX + 150, BWY - 30], [BWX + 170, BWY - 120], [BWX, BWY - 98]]), { fill: '#b8c0c6', lw: 7, shade: () => fillOnly(ell(BWX + 80, BWY - 50, 50, 40, 20), '#959ea5', { boil: .3 }) }); steam(BWX, BWY - 150, t, 3); }
const SP_S = [[BWX - 60, BWY - 110], [BWX - 110, BWY - 470]], SP_W = [[BWX + 60, BWY - 110], [BWX + 110, BWY - 470]];
function spoons(t, heat = 0, melt = 0, inWater = 1) {
  const off = (1 - inWater) * -160;
  const s0 = [SP_S[0][0], SP_S[0][1] + off], s1 = [SP_S[1][0], SP_S[1][1] + off], w0 = [SP_W[0][0], SP_W[0][1] + off], w1 = [SP_W[1][0], SP_W[1][1] + off];
  stroke([s0, s1], 18, { line: '#c3cbd0' });
  if (heat > 0) stroke([s0, [lerp(s0[0], s1[0], heat), lerp(s0[1], s1[1], heat)]], 12, { line: '#ff7a4a' });   // heat climbing the steel
  stroke([w0, w1], 24, { line: '#a8703c' });
  // wax beads: steel's melts and slides down after the heat arrives; the wood's stays
  const mx = lerp(s1[0], s0[0], melt * .6), my = lerp(s1[1], s0[1], melt * .6);
  shape(ell(mx + 2, my - 16 + melt * 20, 22 - melt * 6, 20 - melt * 12, 16), { fill: '#fff6dc', lw: 4 });
  if (melt > .2) for (let i = 0; i < 2; i++) shape(ell(lerp(s1[0], mx, .5) + i * 6, lerp(s1[1], my, .5) + i * 30, 6, 10, 10), { fill: '#fff6dc', lw: 3 });
  shape(ell(w1[0], w1[1] - 18, 22, 20, 16), { fill: '#fff6dc', lw: 4 });
}
function counter() { shape(rect(-600, BWY, 2400, 900), { fill: '#8a5a2b', lw: 7, shade: () => fillOnly(rect(-600, BWY, 2400, 30), '#a8703c', { boil: .2 }) }); }
SH.wax = t => {   // she drips a wax bead on each handle end, then stands both spoons in the hot water
  const k = t - T.wax, d = 1;   // spoons already stand in the hot water; she adds the wax
  cam(540, 1000, 1.35);
  stall(t); counter();
  bowlBack(); spoons(t, 0, 0, d);
  bowlFront(t);
  // her hand with the candle tilts over each handle end in turn (wax drips land on the handle)
  const tgt = k < .6 ? SP_S[1] : SP_W[1], tilt = k > -.2 && k < 1.2;
  if (tilt) { const hx = tgt[0] + 30, hy = tgt[1] - 140 + (d - 1) * 0; shape(noodle([hx + 360, hy + 260], [hx + 18, hy + 6], 8, 40, 34), { fill: PAL.shirt, lw: 5 }); push(); translate(hx, hy); rotate(-.6); candle([0, 0]); pop(); shape(ell(hx + 12, hy + 4, 20, 17, 16), { fill: PAL.skinT, lw: 5 }); const dk = (k * 3) % 1; dot(tgt[0], hy + 60 + dk * 60, 6, '#fff6dc'); }
  tag('স্টিল', SP_S[1][0] - 60, SP_S[1][1] - 80, { bg: '#c3cbd0', fg: INK, size: 40 });
  tag('কাঠ', SP_W[1][0] + 60, SP_W[1][1] - 80, { bg: '#c9954f', fg: INK, size: 40 });
  if (t > T.dip) tag('গরম পানি', BWX, BWY + 80, { bg: '#ff6b5a', fg: '#fff', size: 40 });
};
const heatS = t => ss(seg(t, T.lapse0, T.lapse1 - .8)), meltS = t => ss(seg(t, T.lapse1 - 1.0, T.lapse1 - .1));
SH.lapse = t => {   // a little later: heat climbs the steel, its wax melts and slides; the wooden one's bead stays
  cam(540, 1000, 1.35);
  stall(t); counter(); bowlBack(); spoons(t, heatS(t), meltS(t), 1); bowlFront(t);
  tag('কিছুক্ষণ পর…', 540, 420, { size: 46 });
  tag('স্টিল', SP_S[1][0] - 60, SP_S[1][1] - 80, { bg: '#c3cbd0', fg: INK, size: 40 }); tag('কাঠ', SP_W[1][0] + 60, SP_W[1][1] - 80, { bg: '#c9954f', fg: INK, size: 40 });
};
SH.boltuCU = t => {   // reaction close-up
  const m = talk('boltu', t);
  cam(700, 1060, 1.7);
  stall(t); counter(); bowlBack(); spoons(t, 1, 1, 1); bowlFront(t);
  boltu(Bo(t, { x: 900, y: FLOOR + 40, face: -1, look: [.8, .3], eyeS: 1.22, pupil: 2.6, brow: 1.2, mouth: { o: m.o * 1.2 + (m.talking ? .08 : .4), w: m.w, sm: .1 }, armR: { h: cap(reach(BOLTU, 900, -1, SP_S[1][0] + 20, SP_S[1][1] + 40), 140), bend: -6 } }));
};
SH.board = t => {   // particles: heat passes particle to particle — fast along metal, slow along wood; then the pot handle
  const a = LN.t2.t0, d = LN.t2.t1 - a, k = t - a;
  cam(540, 960, 1);
  bands(['#5a3a2e', '#523428', '#4a2e24'], -100, 2100);
  reset(); shape(rr(70, 90, 940, 1100, 30), { fill: '#2a1c18', lw: 9 });
  const rows = [['ধাতু', 380, 2.2, '#c3cbd0'], ['কাঠ', 700, .12, '#c9954f']];
  for (const [nm, y, sp, col] of rows) {
    reset(); shape(rr(150, y - 60, 820, 120, 20), { fill: col, lw: 6 });
    for (let s = 0; s < 3; s++) { const fl = 40 + 14 * Math.sin(t * 9 + s); shape(spline([[110 + s * 14, y + 60], [118 + s * 14, y + 60 - fl * .6], [120 + s * 14, y + 60 - fl], [128 + s * 14, y + 60 - fl * .6], [134 + s * 14, y + 60]]), { fill: '#ff7a1f', lw: 3 }); }   // flame at the left end
    for (let i = 0; i < 9; i++) {
      const x = 200 + i * 95, hot = clamp((k * sp - i * .35) / .6), j = hot * 7;
      const jx = Math.sin(t * 40 + i) * j, jy = Math.cos(t * 37 + i * 2) * j;
      reset(); shape(ell(x + jx, y + jy, 30, 30, 20), { fill: `rgb(${Math.round(lerp(90, 240, hot))},${Math.round(lerp(140, 90, hot))},${Math.round(lerp(220, 60, hot))})`, lw: 4 });
    }
    tag(nm, 560, y - 110, { bg: '#f4f1ea', fg: INK, size: 40 });
  }
  if (k > .8) tag('সুপরিবাহী', 820, 270, { bg: '#ff6b5a', fg: '#fff', size: 38 });
  if (k > 2.2) tag('কুপরিবাহী', 820, 590, { bg: '#2b67c9', fg: '#fff', size: 38 });
  if (k > 3.4) tag('তাপ: এক কণা → পাশের কণা', 540, 860, { bg: '#ffd65a', fg: INK, size: 40 });
  if (t > T.handle) {   // a pot with a wooden handle
    const z = back(clamp((t - T.handle) / .3), 1.4); reset(); push(); translate(540, 1050); scale(z);
    shape(rr(-180, -60, 300, 120, 20), { fill: '#b8c0c6', lw: 6 }); shape(rr(120, -18, 180, 36, 14), { fill: '#a8703c', lw: 6 });
    pop();
    tag('হাতল: কাঠ / প্লাস্টিক', 540, 1150, { bg: '#c9954f', fg: INK, size: 36 });
  }
};
SH.woodpot = t => {   // "I'll make pitha in a wooden pot!": he lifts a wooden bowl over the chula fire, beaming
  const k = t - T.fire;
  cam(430, 1150, 1.6);
  set(t, { fireUp: .4 });
  const up = ss(clamp(k / .4));
  const bowlAt = [lerp(MX0 + 140, CX - 10, up), lerp(FLOOR - 230, CTOP - 40, up)];
  mama(M(t, { x: MX0 - 60, look: [.7, .2], brow: .8, mouth: { ...talk('mama', t), sm: .8 }, armR: { h: reach(MAMA, MX0 - 60, 1, bowlAt[0] - 80, bowlAt[1] - 30), bend: 14 } }));
  woodBowl(bowlAt[0], bowlAt[1], 1);
};
SH.pause = t => {   // cold pause: Boltu and Bithi stare, slow blink
  const tq = q(t), a = T.shots.find(s => s[2] === 'pause')[0];
  cam(780, 1150, 1.9);
  set(t);
  const bl = tq > a + .55 && tq < a + .8;
  bithi(Bi(t, { face: -1, look: [.7, 0], lid: .4, blink: bl, brow: -.2, mouth: { o: 0, w: .7, sm: -.1 } }));
  boltu(Bo(t, { x: 900, face: -1, look: [.7, -.1], lid: .45, blink: bl, mouth: { o: 0, w: .7, sm: -.2 } }));
};
SH.deadpan = t => {   // "Mama, a wooden pot will burn on the stove." Smoke from the bowl's bottom; he yanks it away
  const k = t - T.smoke;
  cam(500, 1150, 1.35);
  set(t, { fireUp: .4 });
  const away = ss(clamp(k / .3));
  const bowlAt = [lerp(CX - 10, MX0 + 120, away), lerp(CTOP - 40, FLOOR - 300, away)];
  mama(M(t, { x: MX0 - 60, look: k > -1 ? [.6, .6] : [.8, 0], brow: k > 0 ? 1.2 : -.4, eyeS: k > 0 ? 1.2 : 1, worry: k <= 0, nerv: k > 0 && k < .8 ? .6 : 0, armR: { h: reach(MAMA, MX0 - 60, 1, bowlAt[0] - 80, bowlAt[1] - 30), bend: 14 } }));
  const ch = clamp((t - LN.b4.t0) / 2);
  woodBowl(bowlAt[0], bowlAt[1], 1, ch);
  if (t > LN.b4.t0 + .8) for (let i = 0; i < 3; i++) { const u = (t * .9 + i / 3) % 1; shape(ell(bowlAt[0] - 30 + i * 30 + Math.sin(u * 6) * 10, bowlAt[1] - 10 - u * 220, 20 + u * 30, 16 + u * 20, 14), { fill: `rgba(90,84,84,${.9 * (1 - u * .6)})`, lw: 4 }); }
  boltu(Bo(t, { x: 820, face: -1, look: [.8, 0], lid: .5, brow: -.3, mouth: { ...talk('boltu', t), sm: -.1 } }));
};
SH.puzzle = t => {   // Bithi points back at the iron grille and the wooden door; thought bubble with both and a hand; then to camera
  const tq = q(t), a = LN.t3.t0;
  cam(150, 1050, 1.5);
  stall(t);
  const turn = tq > a + 3.0;
  bithi(Bi(t, { x: 280, face: -1, look: turn ? [0, 0] : [.7, -.5], brow: .5, armR: turn ? { h: [12, 140], bend: 12 } : { h: [110, -120], bend: 20 } }));
  if (t > a + .1) tag('ধাঁধা!', 540, 220, { bg: '#ffd65a', fg: INK, size: 64 });
  if (t > a + 1.0) {
    const z = back(clamp((t - a - 1.0) / .3), 1.4); reset(); push(); translate(560, 560); scale(z);
    shape(spline([[-300, 0], [-280, -130], [-100, -170], [120, -160], [300, -90], [290, 100], [100, 160], [-200, 140]]), { fill: '#f4f1ea', lw: 7 });
    shape(rect(-230, -100, 150, 180), { fill: '#d6dde0', lw: 5, shade: () => { for (let k2 = 0; k2 < 5; k2++) fillOnly(rect(-222 + k2 * 30, -100, 8, 180), '#6b6f78', { boil: .2 }); } });
    shape(rect(80, -100, 150, 180), { fill: '#a8703c', lw: 5 });
    text('?', 0, -10, { font: '800 90px "Baloo"' });
    pop();
    if (t > a + 1.6) { tag('লোহা', 410, 760, { bg: '#d6dde0', fg: INK, size: 36 }); tag('কাঠ', 715, 760, { bg: '#c9954f', fg: INK, size: 36 }); }
  }
};
SH.end = t => {
  cam(540, 960, 1);
  bands(['#4b3a6e', '#8a5a7a', '#c9785a'], -100, 2100);
  const pu0 = back(clamp((t - T.VEND) / .4), 1.6);
  reset(); push(); translate(540, 820); scale(Math.max(.01, pu0) * 1.5); stroke([[-60, 60], [60, -120]], 14, { line: '#c3cbd0' }); stroke([[40, 60], [-60, -130]], 20, { line: '#a8703c' }); pop();
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
