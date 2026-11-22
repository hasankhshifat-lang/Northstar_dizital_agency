// Scientific Bithi Short 12 × Sci-Fi Sitcom Toon (9:16): "মাটির কলসির পানি ঠান্ডা কেন?" — evaporative cooling (বাষ্পীভবন). No scientist.
// Setting: a village courtyard (উঠোন) at noon: mud house with a tin roof, banana tree, tubewell, clothesline, hens; the kolshi on a wooden stand.
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
const FLOOR = 1500, MX = 230, BX = 840, TIX = 700;
const STOP = 1262, SL = 330, SR = 610;                    // wooden stand (জলচৌকি) for the kolshi + jug
const KX = 430, JGX = 545;                                // kolshi centre x, steel jug centre x (on the stand)

// —— the village courtyard (উঠোন) at noon ——
function hen(t, x, y, s = 1, ph = 0) {   // pecks now and then (environment life)
  const k = (t * .6 + ph) % 1, peck = k > .8 ? Math.sin((k - .8) / .2 * Math.PI) : 0;
  push(); translate(x, y); scale(s);
  shape(ell(0, -40, 46, 32, 20), { fill: '#f4ead8', lw: 5, shade: () => fillOnly(ell(14, -30, 30, 18, 14), '#d9cbb0', { boil: .3 }) });
  push(); translate(36, -66 + peck * 34); rotate(peck * .8);
  shape(ell(0, 0, 18, 18, 14), { fill: '#f4ead8', lw: 5 }); shape([[14, -4], [32, 2], [14, 8]], { fill: '#f2a51c', lw: 4 });
  shape(ell(-2, -18, 8, 8, 8), { fill: '#d8343c', lw: 4 }); dot(5, -3, 3);
  pop();
  stroke([[-6, -10], [-8, 0]], 4, { line: '#f2a51c' }); stroke([[8, -10], [10, 0]], 4, { line: '#f2a51c' });
  pop();
}
function yard(t) {
  bands(['#9fd8f0', '#8ccdeb', '#7ac2e6'], -900, 800);                                      // noon sky
  shape(ell(980, 160, 70, 70, 30), { fill: '#ffe066', lw: 6 });                             // high sun
  for (let i = 0; i < 5; i++) { const x = -250 + i * 360; shape(ell(x, 690, 200, 120, 24), { fill: '#4f9a44', lw: 6 }); }   // tree line
  // mud house: wall, tin roof, door, window, veranda post
  shape(rect(-400, 620, 1300, 560), { fill: '#c98a55', lw: 7, shade: () => { fillOnly(rect(-400, 1080, 1300, 100), '#b07445', { boil: .2 }); for (let k = 0; k < 5; k++) stroke([[-400, 700 + k * 90], [900, 700 + k * 90 + 6]], 3, { line: '#b37a48' }); } });
  shape([[-500, 520], [1000, 520], [940, 640], [-440, 640]], { fill: '#8e979c', lw: 7, shade: () => { for (let x = -500; x < 1000; x += 46) fillOnly(rect(x, 560, 20, 80), '#737b80', { boil: .2 }); } });
  shape(rr(-120, 760, 180, 330, 10), { fill: '#3a2a24', lw: 7 });                           // dark doorway
  shape(rect(600, 780, 160, 130), { fill: '#3a2a24', lw: 6, shade: () => { for (let k = 0; k < 4; k++) fillOnly(rect(622 + k * 36, 780, 10, 130), '#6b4a2a', { boil: .2 }); } });
  shape(rect(880, 600, 34, 600), { fill: '#7a4a28', lw: 6 });
  // clothesline with a drying lungi that sways a little in the breeze
  stroke([[920, 760], [1500, 720]], 4, { line: '#5a4630' });
  const sw = Math.sin(q(t) * 1.4) * 6;
  shape([[1040, 752], [1180, 744], [1186 + sw, 920], [1046 + sw, 928]], { fill: '#2f7a54', lw: 6, shade: () => { for (let k = 0; k < 5; k++) fillOnly(rect(1040, 770 + k * 30, 150, 8), '#e2453a', { boil: .2 }); } });
  // banana tree (left)
  stroke([[-260, 1200], [-250, 760]], 30, { line: '#7aa23a' });
  for (const [a, l] of [[-2.4, 220], [-1.9, 240], [-1.1, 230], [-.5, 210]]) shape(spline([[-250, 760], [-250 + Math.cos(a) * l * .5, 760 + Math.sin(a) * l * .5 - 20], [-250 + Math.cos(a) * l, 760 + Math.sin(a) * l], [-250 + Math.cos(a) * l * .5, 760 + Math.sin(a) * l * .5 + 20]]), { fill: '#5fae3a', lw: 5 });
  // tubewell (right, green pump)
  shape(rect(1240, 1000, 50, 220), { fill: '#2f8a4a', lw: 6 }); shape(rect(1200, 980, 130, 40), { fill: '#2f8a4a', lw: 6 }); stroke([[1290, 990], [1420, 940]], 12, { line: '#2f8a4a' });
  shape(rect(1160, 1200, 220, 40), { fill: '#9aa3a8', lw: 6 });
  // courtyard: packed earth
  shape(rect(-600, 1180, 2400, 1400), { fill: '#d9b27a', lw: 7, shade: () => { for (let k = 0; k < 7; k++) stroke([[-600, 1220 + k * k * 22], [1800, 1220 + k * k * 22]], 3, { line: '#c49a60' }); } });
  hen(t, -140, 1330, .9, .1); hen(t, 1100, 1300, .8, .55);
}
function stand(t) {   // জলচৌকি: low wooden stand
  shape(rect(SL, STOP, SR - SL, 24), { fill: '#8a5a2b', lw: 6 });
  for (const x of [SL + 14, SR - 34]) shape(rect(x, STOP + 24, 20, FLOOR - STOP - 24), { fill: '#6b4420', lw: 5 });
  fillOnly(ell((SL + SR) / 2, FLOOR, 170, 14, 20), 'rgba(0,0,0,.15)', { boil: .3 });
}
// —— props ——
const KH = 240;   // kolshi height; (x, y) = bottom centre
function kolshi(t, x, y, s = 1, { wet = 1 } = {}) {
  push(); translate(x, y); scale(s);
  shape(spline([[-34, -KH + 30], [-30, -KH + 54], [-92, -150], [-104, -86], [-70, -14], [0, 0], [70, -14], [104, -86], [92, -150], [30, -KH + 54], [34, -KH + 30]]), { fill: '#c0643a', lw: 7, shade: () => {
    fillOnly(ell(40, -90, 56, 74, 20), '#a54f2a', { boil: .3 });                              // one hard shadow
    stroke([[-96, -120], [96, -120]], 3, { line: '#8e3f20' }); stroke([[-100, -100], [100, -100]], 3, { line: '#8e3f20' });
    if (wet > 0) { fillOnly(ell(-30, -60, 50, 40, 18), `rgba(110,40,20,${.35 * wet})`, { boil: .4 }); for (let i = 0; i < 6; i++) { const u = (t * .25 + hash(i * 3.3)) % 1; dot(-70 + hash(i * 1.7) * 130, -150 + hash(i * 7.1) * 110 + u * 30, 4, `rgba(220,240,255,${.9 * wet})`); } }
  } });
  shape(ell(0, -KH + 28, 44, 12, 20), { fill: '#c0643a', lw: 6 });                          // rim
  shape(ell(0, -KH + 28, 30, 7, 16), { fill: '#2a1a14', lw: 4 });                            // mouth
  pop();
}
function jug(x, y, s = 1) {   // steel jug (জগ), (x, y) = bottom centre
  push(); translate(x, y); scale(s);
  stroke(arc(46, -90, 34, 44, -Math.PI / 2, Math.PI / 2, 14), 10, { line: '#7d878d' });
  shape([[-42, 0], [42, 0], [36, -150], [-36, -150]], { fill: '#bcc5ca', lw: 6, shade: () => { fillOnly(rect(10, -150, 30, 150), '#98a2a8', { boil: .2 }); fillOnly(rect(-28, -140, 10, 120), '#eef3f5', { boil: .2 }); } });
  shape([[-40, -150], [40, -150], [30, -166], [-46, -164]], { fill: '#d6dde0', lw: 5 });
  pop();
}
function thermo(x, y, level, s = 1) {   // (x, y) = bulb centre; level 0..1 of the red column; scale only, no numbers
  push(); translate(x, y); scale(s);
  shape(rr(-10, -190, 20, 190, 10), { fill: '#f4f8fa', lw: 4 });
  fillOnly(rect(-4, -10 - level * 160, 8, level * 160 + 10), '#e2453a', { boil: .2 });
  for (let k = 0; k < 6; k++) stroke([[6, -30 - k * 28], [12, -30 - k * 28]], 2.5);
  shape(ell(0, 4, 16, 16, 14), { fill: '#e2453a', lw: 4 });
  pop();
}
function torch(hp, tip) {   // torch from the hand toward tip, with a pale (not glowing) beam
  const a = Math.atan2(tip[1] - hp[1], tip[0] - hp[0]);
  push(); translate(hp[0], hp[1]); rotate(a);
  fillOnly([[60, -14], [Math.hypot(tip[0] - hp[0], tip[1] - hp[1]) + 30, -46], [Math.hypot(tip[0] - hp[0], tip[1] - hp[1]) + 30, 46], [60, 14]], 'rgba(255,246,190,.55)', { boil: .3 });
  shape(rr(-20, -11, 70, 22, 6), { fill: '#3a3f47', lw: 5 }); shape(rr(46, -16, 18, 32, 5), { fill: '#d6dde0', lw: 5 });
  pop();
}
function magnifier(hp, ang = -.6, s = 1) { push(); translate(hp[0], hp[1]); rotate(ang); scale(s); shape(rr(-8, -4, 70, 16, 6), { fill: '#7a4a28', lw: 5 }); push(); translate(-50, 4); shape(ell(0, 0, 46, 46, 28), { fill: 'rgba(220,240,255,.45)', lw: 8, line: '#2a2a30' }); pop(); pop(); }
function mug(hp, tilt = 0, water = 1) { push(); translate(hp[0], hp[1]); rotate(tilt); shape([[-26, -40], [26, -40], [22, 20], [-22, 20]], { fill: '#2f8fd8', lw: 5 }); stroke(arc(30, -10, 14, 18, -Math.PI / 2, Math.PI / 2, 10), 6, { line: '#2370ad' }); if (water > 0) shape(ell(0, -40, 26, 7, 14), { fill: '#bfe0f2', lw: 4 }); pop(); }
function bucket(x, y, s = 1) { push(); translate(x, y); scale(s); shape([[-60, -110], [60, -110], [46, 0], [-46, 0]], { fill: '#e2453a', lw: 6, shade: () => fillOnly(rect(16, -120, 50, 130), '#b8322a', { boil: .2 }) }); shape(ell(0, -110, 60, 12, 24), { fill: '#bfe0f2', lw: 5 }); stroke(arc(0, -110, 62, 70, Math.PI, TAU, 14), 4); pop(); }
function vapour(x, y, t, n = 3, a = .7) { for (let i = 0; i < n; i++) { const u = (t * .7 + i / n) % 1; stroke(spline([[x + i * 18, y - u * 90], [x + i * 18 + 10, y - 20 - u * 90], [x + i * 18 - 6, y - 40 - u * 90], [x + i * 18 + 8, y - 60 - u * 90]], false), 4, { line: `rgba(255,255,255,${a * (1 - u)})` }); } }
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
const set = t => { yard(t); stand(t); };
const KTOP = STOP - KH + 28;
const toLocal = (P, w) => { const f = P.face ?? 1, sc = P.s ?? 1, x = (w[0] - P.x) / (sc * f), y = (w[1] - P.y) / (sc * (P.sq ?? 1)), a = -(P.lean ?? 0); return [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)]; };                                 // kolshi mouth y
// Mama hugging the kolshi: ear on its shoulder, right arm round its belly, torch in the left hand aimed into the mouth
function hugPose(t, o = {}) {
  const tq = q(t);
  return M(t, { x: MX - 20, lean: .1, headTilt: .2, look: [.9, .5], brow: 1, eyeS: 1.15,
    armR: { h: reach(MAMA, MX - 20, 1, KX - 20, STOP - 110), bend: 30 }, armL: { h: [110, -150], bend: 20 }, ...o });
}
SH.open = t => {   // HOOK: Mama hugs the clay kolshi, ear pressed to it, shining a torch into its mouth; a cold drop rolls at 0.45 s
  cam(380, 1120, 1.95);
  set(t);
  const P = hugPose(t, { sq: 1 - .02 * ss(clamp((t - T.drip) / .2)) });
  P.holdL = hp => torch(hp, toLocal(P, [KX - 6, KTOP + 10]));
  kolshi(t, KX, STOP);
  mama(P);
  const k = t - T.drip; if (k > 0 && k < 1.6) dot(KX - 60, STOP - 170 + Math.min(1, k) * 110, 7, '#dff3ff');
};
SH.boltuQ = t => {   // Boltu walks in, peers into the mouth and points: only water
  const tq = q(t), u = seg(t, LN.b1.t0 - .1, LN.b1.t0 + .5);
  cam(520, 1150, 1.35);
  set(t);
  const P = hugPose(t, { look: u > .5 ? [.9, 0] : [.9, .5], headTilt: u > .5 ? .1 : .22 });
  P.holdL = hp => torch(hp, toLocal(P, [KX - 6, KTOP + 10]));
  kolshi(t, KX, STOP); mama(P);
  const bx = lerp(1050, 760, eo(u));
  boltu(Bo(t, { x: bx, face: -1, look: u >= 1 ? [.6, .5] : [-.5, 0], brow: .6, lean: u >= 1 ? -.08 : 0, legL: walk(tq, u > 0 && u < 1)[0], legR: walk(tq, u > 0 && u < 1)[1],
    armR: u >= 1 ? { h: cap(reach(BOLTU, bx, -1, KX + 10, KTOP - 10), 135), bend: 6 } : { h: [14, 104], bend: 12 } }));
};
SH.fridge = t => {   // "a fridge inside the clay!": he pats the kolshi's shoulder proudly, chin up (push-in on ফ্রিজ)
  const k = t - T.pat, zin = ss(seg(t, T.pat - .2, T.pat + .3));
  cam(360, 1120, lerp(1.75, 2.1, zin));
  set(t);
  const tap = k > 0 && k < .9 ? Math.abs(Math.sin(k * 10)) * 14 : 0;
  mama(M(t, { x: MX, look: k > 0 ? [.3, -.4] : [.8, .3], brow: k > 0 ? -.3 : .6, mouth: { ...talk('mama', t), sm: .6 },
    armR: { h: reach(MAMA, MX, 1, KX - 60, STOP - 170 - tap), bend: 16 }, armL: { h: [-30, 120], bend: -10 } }));
  kolshi(t, KX, STOP);
};
function walkIn(t, u, bx, extra = {}) {   // Bithi walking in from the right with the steel jug hanging from her right hand
  const tq = q(t);
  const P = Bi(t, { x: bx, face: -1, look: [.5, 0], brow: .2, legL: walk(tq, u > 0 && u < 1)[0], legR: walk(tq, u > 0 && u < 1)[1], armR: { h: [20, 120], bend: 6 }, ...extra });
  P.holdR = hp => jug(hp[0] + 6, hp[1] + 150, .8);
  return P;
}
SH.enter = t => {   // wide: Bithi walks in carrying a steel jug; Boltu turns to her as he asks
  const u = seg(t, LN.b2.t0 - .3, LN.b2.t1 + .3);
  cam(540, 1150, 1.05);
  set(t); kolshi(t, KX, STOP);
  mama(M(t, { x: MX, look: u > .4 ? [.9, 0] : [.9, .2], brow: .4, armL: { h: [-30, 120], bend: -10 } }));
  boltu(Bo(t, { x: 760, face: u > .1 ? 1 : -1, look: u > .1 ? [.7, -.2] : [-.8, -.3], brow: .9, armR: talk('boltu', t).talking && u > .1 ? { h: [60, -20], bend: 16 } : { h: [14, 104], bend: 12 } }));
  bithi(walkIn(t, u, lerp(1250, 980, eo(u))));
};
SH.pores = t => {   // she sets the jug on the stand, then holds a magnifier to the kolshi: tiny pores, beads of water
  const k = t - T.setDown, m = ss(seg(t, T.magUp - .3, T.magUp + .2));
  cam(520, 1160, 1.5);
  set(t); kolshi(t, KX, STOP);
  boltu(Bo(t, { x: 900, face: -1, look: [.7, .3], brow: .5, lean: -.06 }));
  const jugAt = [JGX, STOP];
  let P;
  if (k < 0) { P = walkIn(t, 1, TIX, { look: [.6, .6] }); }
  else {
    const arm = m > 0 ? lerpArm({ h: reach(BITHI, TIX, -1, JGX + 10, STOP - 160), bend: 10 }, { h: reach(BITHI, TIX, -1, KX + 80, STOP - 150), bend: 20 }, m) : { h: reach(BITHI, TIX, -1, JGX + 10, STOP - 160), bend: 10 };
    P = Bi(t, { face: -1, look: m > .5 ? [.7, .4] : [.6, .6], brow: .3, armR: arm });
    if (m > .3) P.holdR = hp => magnifier(hp, .5, 1);
  }
  if (k >= 0) jug(jugAt[0], jugAt[1]);
  bithi(P);
  if (m > .9) {   // zoom bubble: the clay wall seen through the magnifier
    const zz = back(clamp((t - T.magUp - .1) / .35), 1.4);
    reset(); push(); translate(540, 520); scale(zz);
    shape(ell(0, 0, 300, 300, 48), { fill: '#c0643a', lw: 10, shade: () => {
      for (let i = 0; i < 22; i++) { const x = -250 + hash(i * 3.7) * 500, y = -250 + hash(i * 9.1) * 500; if (x * x + y * y > 270 * 270) continue; fillOnly(ell(x, y, 14, 10, 12), '#5a2a14', { boil: .3 }); const u = clamp((t - T.magUp - .4 - hash(i) * .8) / 1.2); if (u > 0) shape(ell(x + 6, y - 2 - u * 6, 6 + u * 9, 6 + u * 9, 12), { fill: '#dff3ff', lw: 3 }); }
    } });
    pop();
    tag('ছোট্ট ছিদ্র', 540, 880, { bg: '#ffd65a', fg: INK, size: 46 });
  }
};
SH.board = t => {   // cross-section of the kolshi wall: water seeps out, evaporates, and carries heat away from the water inside
  const a = LN.t2.t0, d = LN.t2.t1 - a, k = t - a;
  cam(540, 960, 1);
  bands(['#2e6f7a', '#2a6370', '#265866'], -100, 2100);
  reset(); shape(rr(70, 90, 940, 1100, 30), { fill: '#16343c', lw: 9 });
  const cool = ss(clamp((k - d * .6) / (d * .35)));
  // inside water (left), clay wall (middle), outside air (right)
  reset(); shape(rect(110, 300, 360, 820), { fill: `rgb(${Math.round(lerp(120, 70, cool))},${Math.round(lerp(180, 160, cool))},${Math.round(lerp(220, 245, cool))})`, lw: 7 });
  reset(); shape(rect(470, 300, 150, 820), { fill: '#c0643a', lw: 7, shade: () => { for (let j = 0; j < 6; j++) fillOnly(rect(470, 360 + j * 130, 150, 18), '#7a3418', { boil: .3 }); } });
  for (let j = 0; j < 6; j++) {   // drops travel through each pore, sit on the outer face, then lift off as vapour
    const ph = (k * .55 + j * .17) % 1, y = 369 + j * 130;
    reset(); if (ph < .5) dot(lerp(480, 615, ph / .5), y, 9, '#bfe9ff');
    else if (ph < .7) shape(ell(632, y, 13, 13, 12), { fill: '#bfe9ff', lw: 3 });
    else vapour(640 + (ph - .7) * 200, y, k + j, 1, .9);
  }
  if (k > d * .45) for (let j = 0; j < 4; j++) { const u = ((k - d * .45) * .8 + j / 4) % 1; reset(); arrow(300 + u * 120, 420 + j * 200, 460 + u * 160, 420 + j * 200, '#ff6b5a', 12); }
  tag('ভেতরের পানি', 290, 240, { bg: '#bfe9ff', fg: INK, size: 36 }); tag('মাটির দেয়াল', 545, 1160, { bg: '#f4f1ea', fg: INK, size: 34 });
  if (k > d * .2) tag('বাষ্প', 850, 300, { bg: '#f4f1ea', fg: INK, size: 40 });
  if (k > d * .5) tag('বাষ্প হতে তাপ লাগে', 540, 1290 - 60, { bg: '#ff6b5a', fg: '#fff', size: 40 });
  if (k > d * .75) tag('পানি ঠান্ডা হয়', 290, 1050, { bg: '#2b67c9', fg: '#fff', size: 38 });
};
const kLevel = t => lerp(.62, .34, ss(seg(t, T.lapse0 + .7, T.lapse1 - .1)));
function thermos(t, lv) { thermo(KX + 8, KTOP + 120, lv, .9); thermo(JGX + 6, STOP - 40, .62, .9); }
SH.lapse = t => {   // a little later: one thermometer in each; the kolshi's column falls, the jug's stays
  const k = t - T.lapse0;
  cam(480, 1110, 2.4);
  set(t); kolshi(t, KX, STOP);
  const in1 = ss(clamp(k / .3)), in2 = ss(clamp((k - .3) / .3));
  // hand lowers each thermometer in (fingertips stay on the glass until it is in)
  const lv = kLevel(t);
  if (in1 > 0) thermo(KX + 8, KTOP + 120 - (1 - in1) * 160, lv, .9);
  jug(JGX, STOP);
  if (in2 > 0) thermo(JGX + 6, STOP - 40 - (1 - in2) * 160, .62, .9);
  const hx = in2 > 0 ? JGX + 6 : KX + 8, hy = (in2 > 0 ? STOP - 230 - (1 - in2) * 160 : KTOP - 70 - (1 - in1) * 160);
  if (k < .75) { shape(noodle([hx + 220, hy - 160], [hx + 18, hy - 4], 8, 34, 30), { fill: PAL.shirt, lw: 5 }); shape(ell(hx + 14, hy, 20, 17, 16), { fill: PAL.skinT, lw: 5 }); }
  if (k > .6) tag('কিছুক্ষণ পর…', 540, 600, { size: 46 });
  if (k > 1.0) { tag('কলসি', KX - 20, 1340 - 30, { bg: '#c0643a', fg: '#fff', size: 34 }); tag('স্টিলের জগ', JGX + 70, 1340 - 30, { bg: '#bcc5ca', fg: INK, size: 34 }); }
};
SH.boltuCU = t => {   // reaction close-up: the kolshi is colder
  const m = talk('boltu', t);
  cam(BX - 140, FLOOR - 280, 2.1);
  set(t); kolshi(t, KX, STOP); jug(JGX, STOP); thermos(t, kLevel(t));
  boltu(Bo(t, { x: 760, face: -1, look: [.8, .5], eyeS: 1.22, pupil: 2.6, brow: 1.2, mouth: { o: m.o * 1.2 + (m.talking ? .08 : .4), w: m.w, sm: .1 }, armR: { h: cap(reach(BOLTU, 760, -1, KX + 20, KTOP + 40), 140), bend: -6 } }));
};
SH.sweat = t => {   // "steel has no pores": she taps the jug; "sweat drying cools us": Boltu's sweat drop evaporates
  const k = t - T.tapJug, s2 = t - T.sweatT;
  cam(660, 1130, 1.55);
  set(t); kolshi(t, KX, STOP); jug(JGX, STOP); thermos(t, .34);
  const armR = k > 0 && s2 < 0 ? { h: reach(BITHI, TIX - 20, -1, JGX + 20, STOP - 120), bend: 10 } : (s2 >= 0 ? { h: [60, -40], bend: 20 } : { h: [12, 140], bend: 12 });
  bithi(Bi(t, { x: TIX - 20, face: s2 >= 0 ? 1 : -1, look: s2 >= 0 ? [.8, -.1] : [.6, .5], brow: .4, armR }));
  const BX2 = 900;
  boltu(Bo(t, { x: BX2, face: -1, look: s2 >= 0 ? [-.2, -.9] : [-.8, -.1], brow: .5 }));
  const hy = FLOOR - BOLTU.headY;
  if (s2 > 0) { const u = clamp(s2 / 1.6); if (u < 1) shape(ell(BX2 + 30, hy - 60, 12 * (1 - u) + 2, 15 * (1 - u) + 2, 12), { fill: '#bfe9ff', lw: 4 }); vapour(BX2 + 20, hy - 80, t, 2, .9 * (1 - u * .5)); }
  if (k > .2) tag('স্টিলে ছিদ্র নেই', 540, 560, { bg: '#bcc5ca', fg: INK, size: 42 });
  if (s2 > .2) tag('ঘাম শুকালে শরীর ঠান্ডা', 540, 680, { bg: '#2b67c9', fg: '#fff', size: 42 });
};
const POUR = { h: [60, -150], bend: 28 };
SH.gosol = t => {   // "I'll sit with water poured on me all day! I'm the fridge!": scoops a mug from the bucket, pours it over his head
  const k = t - T.pour;
  cam(300, 1160, 1.6);
  set(t); kolshi(t, KX, STOP);
  bucket(MX + 160, FLOOR);
  const rim = [MX + 150, FLOOR - 100];
  const scoop = { h: reach(MAMA, MX, 1, rim[0], rim[1] - 10), bend: 12 };
  let armR, tilt = 0, water = 1;
  if (k < 0) armR = scoop;
  else if (k < .45) armR = lerpArm(scoop, POUR, ss(k / .45));
  else { armR = POUR; tilt = -ss(clamp((k - .45) / .25)) * 2.2; water = k > .7 ? 0 : 1; }
  if (k > 1.6) { armR = lerpArm(POUR, { h: [40, 30], bend: 30, fist: true }, ss(clamp((k - 1.6) / .3))); }
  const wet = k > .6;
  const P = M(t, { x: MX, look: k > .6 ? [0, -.2] : [.6, .6], brow: k > .6 ? -.5 : .4, lid: k > .6 && k < 1.2 ? .8 : .18, mouth: { ...talk('mama', t), sm: .6 }, armR, armL: k > 1.6 ? { h: [-40, 30], bend: -30, fist: true } : { h: [-30, 120], bend: -10 } });
  P.holdR = hp => { if (k < 1.6) mug(hp, tilt, water); };
  mama(P);
  if (k > .5 && k < 1.5) for (let i = 0; i < 9; i++) { const kk = k - .5 - i * .06; if (kk > 0) { const y = FLOOR - 520 + kk * kk * 1400; if (y < FLOOR - 40) shape(ell(MX - 40 + i * 12, y, 7, 10, 10), { fill: '#bfe9ff', lw: 3 }); } }
  if (wet) for (let i = 0; i < 3; i++) { const u = (t * 1.3 + i / 3) % 1; dot(MX - 60 + i * 50, FLOOR - 470 + u * 260, 6, '#bfe9ff'); }
};
SH.pause = t => {   // cold pause: Boltu and Bithi stare at the dripping Mama, one slow blink
  const tq = q(t), a = T.shots.find(s => s[2] === 'pause')[0];
  cam(780, 1150, 1.9);
  set(t);
  const bl = tq > a + .55 && tq < a + .8;
  bithi(Bi(t, { face: -1, look: [.7, 0], lid: .4, blink: bl, brow: -.2, mouth: { o: 0, w: .7, sm: -.1 } }));
  boltu(Bo(t, { x: 900, face: -1, look: [.7, -.1], lid: .45, blink: bl, mouth: { o: 0, w: .7, sm: -.2 } }));
};
SH.deadpan = t => {   // "Mama, you'll catch a cold." Mama, dripping, starts to shiver; his fists drop
  const k = t - LN.b4.t1;
  cam(500, 1150, 1.35);
  set(t); kolshi(t, KX, STOP); bucket(MX + 160, FLOOR);
  const drop = ss(clamp((k + .2) / .4));
  mama(M(t, { x: MX, look: k > -.2 ? [.3, .6] : [.8, 0], brow: k > -.2 ? -1 : -.4, worry: true, lid: .3, nerv: k > -.3 ? .8 : 0, armR: lerpArm({ h: [40, 30], bend: 30, fist: true }, { h: [70, -10], bend: 40 }, drop), armL: lerpArm({ h: [-40, 30], bend: -30, fist: true }, { h: [-70, -10], bend: -40 }, drop) }));
  for (let i = 0; i < 3; i++) { const u = (t * 1.3 + i / 3) % 1; dot(MX - 60 + i * 50, FLOOR - 470 + u * 260, 6, '#bfe9ff'); }
  boltu(Bo(t, { x: 800, face: -1, look: [.8, 0], lid: .5, brow: -.3, mouth: { ...talk('boltu', t), sm: -.1 } }));
};
SH.puzzle = t => {   // Bithi beside the kolshi; a thought cloud of a humid monsoon day; then she turns to the viewer
  const tq = q(t), a = LN.t4.t0;
  cam(TIX - 130, 1130, 1.8);
  set(t); kolshi(t, KX, STOP); jug(JGX, STOP);
  const turn = tq > a + 2.4;
  bithi(Bi(t, { x: TIX, face: -1, look: turn ? [0, 0] : [.6, -.6], brow: .5, armR: turn ? { h: [12, 140], bend: 12 } : { h: [110, -130], bend: 20 } }));
  if (t > a + .1) tag('ধাঁধা!', 540, 220, { bg: '#ffd65a', fg: INK, size: 64 });
  if (t > a + .8) {   // thought cloud: grey monsoon sky with rain over a kolshi
    const z = back(clamp((t - a - .8) / .35), 1.4); reset(); push(); translate(380, 560); scale(z);
    shape(spline([[-200, 40], [-220, -40], [-140, -110], [-30, -130], [80, -120], [190, -70], [210, 30], [120, 90], [-100, 90]]), { fill: '#d6dde0', lw: 7 });
    for (let i = 0; i < 7; i++) { const u = (t * 1.5 + i / 7) % 1; stroke([[-150 + i * 48, -20 + u * 80], [-158 + i * 48, 0 + u * 80]], 4, { line: '#2b67c9' }); }
    pop();
    if (t > a + 1.4) { g.setTransform(1, 0, 0, 1, 0, 0); g.font = '800 150px "Baloo"'; g.textAlign = 'center'; g.lineWidth = 16; g.strokeStyle = INK; g.strokeText('?', 860, 600); g.fillStyle = '#ffd65a'; g.fillText('?', 860, 600); }
  }
};
SH.end = t => {
  cam(540, 960, 1);
  bands(['#1d4c63', '#236178', '#2a7690'], -100, 2100);
  const pu0 = back(clamp((t - T.VEND) / .4), 1.6);
  reset(); push(); translate(540, 900); scale(pu0 * 1.6); kolshi(t, 0, 0, 1, { wet: .6 }); pop();
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
