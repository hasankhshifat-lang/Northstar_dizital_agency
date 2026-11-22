// Scientific Bithi Short 13 × Sci-Fi Sitcom Toon (9:16): "চাঁদ কি কেউ কামড়ে খায়?" — phases of the Moon (চাঁদের দশা). No scientist.
// Setting: night at a village pond ghat (শান-বাঁধানো ঘাট): brick platform, coconut trees, far bank with houses, the half moon reflected in the pond.
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
const FLOOR = 1500, MX = 250, BX = 820, TIX = 680;
const MOONX = 790, MOONY = 330, MOONR = 70;                // the real first-quarter moon in the sky (lit on the right: evening, waxing)
const STEP = 1290;                                         // top of the ghat's side wall where the lantern is set down
const LX = 420;                                            // lantern position on the wall

// moon phase disc: phi 0 = new, PI/2 = half, PI = full; lit limb on the side `side` (1 = right)
function phase(cx, cy, r, phi, side = 1, { lit = '#fff3c4', dark = '#26304f', lw = 5 } = {}) {
  shape(ell(cx, cy, r, r, 40), { fill: dark, lw });
  const k = Math.cos(phi), pts = [];
  for (let i = 0; i <= 24; i++) { const a = -Math.PI / 2 + i / 24 * Math.PI; pts.push([cx + side * r * Math.cos(a), cy + r * Math.sin(a)]); }
  for (let i = 0; i <= 24; i++) { const a = Math.PI / 2 - i / 24 * Math.PI; pts.push([cx + side * k * r * Math.cos(a), cy + r * Math.sin(a)]); }
  if (phi > .02) fillOnly(pts, lit, { boil: .2 });
  shape(ell(cx, cy, r, r, 40), { lw });
}
// —— night at a village pond ghat (শান-বাঁধানো ঘাট) ——
function coconut(x, y, h, lean = .1) {
  const top = [x + lean * h, y - h];
  stroke(spline([[x, y], [x + lean * h * .3, y - h * .5], top], false), 22, { line: '#4a3a2a' });
  for (let i = 0; i < 7; i++) { const a = -Math.PI + i * Math.PI / 6 + .1; shape(spline([top, [top[0] + Math.cos(a) * 90, top[1] + Math.sin(a) * 40 - 20], [top[0] + Math.cos(a) * 170, top[1] + Math.sin(a) * 70 + 30], [top[0] + Math.cos(a) * 90, top[1] + Math.sin(a) * 40 + 4]]), { fill: '#1f4a3a', lw: 5 }); }
}
function ghat(t, { moon = true } = {}) {
  bands(['#0f1a3a', '#15244a', '#1c2f5a'], -900, 900);                                       // night sky
  for (let i = 0; i < 40; i++) { const x = -400 + hash(i * 3.1) * 1900, y = -300 + hash(i * 7.3) * 900; dot(x, y, (Math.floor(t * 4 + i) % 5 === 0) ? 2 : 3.5, '#f4f1ea'); }
  if (moon) phase(MOONX, MOONY, MOONR, Math.PI / 2, 1);
  // far bank: village houses + trees as dark flat shapes
  shape(rect(-600, 760, 2400, 90), { fill: '#1a3326', lw: 6 });
  for (let i = 0; i < 6; i++) { const x = -350 + i * 330; shape([[x, 780], [x + 120, 700], [x + 240, 780]], { fill: '#2a2a3a', lw: 5 }); shape(rect(x + 30, 780, 180, 60), { fill: '#2f3346', lw: 5, shade: () => fillOnly(rect(x + 100, 795, 30, 30), '#f2c84a', { boil: .2 }) }); }
  // pond with the moon's reflection (wobbling strokes)
  shape(rect(-600, 840, 2400, 300), { fill: '#1d3b5c', lw: 7, shade: () => { if (moon) for (let k = 0; k < 6; k++) { const w = 50 - k * 6 + Math.sin(q(t) * 3 + k) * 8; stroke([[MOONX - w, 870 + k * 26], [MOONX + w, 870 + k * 26]], 6, { line: '#e8dca0' }); } for (let k = 0; k < 5; k++) stroke([[-500 + ((t * 20 + k * 420) % 2200), 960 + k * 30], [-420 + ((t * 20 + k * 420) % 2200), 960 + k * 30]], 3, { line: '#3d6a90' }); } });
  coconut(-200, 1150, 560, .12); coconut(1180, 1150, 520, -.1);
  // the ghat: brick platform + side walls (the lantern goes on the left wall)
  shape(rect(-600, 1130, 2400, 1400), { fill: '#8a6a5a', lw: 7, shade: () => { for (let y = 1160; y < 1900; y += 48) for (let x = -600 + ((y / 48) % 2) * 50; x < 1800; x += 100) stroke(rect(x, y, 96, 44), 2.5, { line: '#6e5446', closed: true }); } });
}
function wall(t) {   // low brick side wall in the foreground left (lantern stand)
  shape(rect(250, STEP, 330, FLOOR - STEP + 10), { fill: '#a07a66', lw: 7, shade: () => { fillOnly(rect(500, STEP, 80, FLOOR - STEP), '#856252', { boil: .3 }); for (let y = STEP + 50; y < FLOOR; y += 50) stroke([[250, y], [580, y]], 3, { line: '#7a5a48' }); } });
  shape(rect(236, STEP - 16, 358, 20), { fill: '#c8b8a8', lw: 6 });
}
// —— props ——
function biscuit(cx, cy, r, rot = 0, bites = 1) {   // round চাঁদ biscuit with bite(s) taken out
  push(); translate(cx, cy); rotate(rot);
  const B = [[r * .95, -r * .25, r * .45], [r * .7, r * .6, r * .38]].slice(0, bites), pts = [];
  for (let i = 0; i < 72; i++) { const a = i / 72 * TAU; let p = [Math.cos(a) * r * (1 + .04 * Math.sin(a * 12)), Math.sin(a) * r * (1 + .04 * Math.sin(a * 12))];
    for (const [bx, by, br] of B) { const dx = p[0] - bx, dy = p[1] - by, d = Math.hypot(dx, dy); if (d < br) p = [bx + dx / d * br, by + dy / d * br]; }
    pts.push(p); }
  shape(pts, { fill: '#e2a94a', lw: 5, shade: () => { for (let i = 0; i < 7; i++) { const a = i * 2.4; dot(Math.cos(a) * r * .5, Math.sin(a) * r * .45, 4, '#a8702a'); } } });
  pop();
}
function lantern(x, y, s = 1) {   // হারিকেন: (x, y) = base centre; flame drawn flat (not glowing)
  push(); translate(x, y); scale(s);
  shape(rr(-40, -26, 80, 26, 8), { fill: '#c0392b', lw: 5 });
  shape(spline([[-34, -26], [-40, -70], [-26, -116], [26, -116], [40, -70], [34, -26]]), { fill: 'rgba(255,236,170,.75)', lw: 5 });
  shape(spline([[0, -96], [10, -70], [0, -52], [-10, -70]]), { fill: '#ff9a2a', lw: 3 });
  shape(rr(-30, -132, 60, 18, 6), { fill: '#c0392b', lw: 5 });
  stroke(arc(0, -132, 30, 34, Math.PI, TAU, 12), 4);
  pop();
}
function rays(x, y, t, n = 8, r0 = 70, r1 = 110) { for (let i = 0; i < n; i++) { const a = i / n * TAU + Math.floor(t * 6) * .05; stroke([[x + Math.cos(a) * r0, y + Math.sin(a) * r0], [x + Math.cos(a) * r1, y + Math.sin(a) * r1]], 5, { line: '#ffd65a' }); } }
function bubble(cx, cy, w, h, z = 1) { push(); translate(cx, cy); scale(z); shape(spline([[-w, 0], [-w * .9, -h * .8], [-w * .3, -h], [w * .4, -h * .95], [w, -h * .4], [w * .95, h * .5], [w * .3, h], [-w * .5, h * .9]]), { fill: '#f4f1ea', lw: 7 }); pop(); }
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
const set = (t, o) => { ghat(t, o); wall(t); };
const toLocal = (P, w) => { const f = P.face ?? 1, sc = P.s ?? 1, x = (w[0] - P.x) / (sc * f), y = (w[1] - P.y) / (sc * (P.sq ?? 1)), a = -(P.lean ?? 0); return [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)]; };
const HOLDUP = { h: [120, -150], bend: 20 };                // Mama holds the biscuit up beside the moon
function crumbs(t, t0, x, y, n = 4) { for (let i = 0; i < n; i++) { const k = t - t0 - i * .25; if (k < 0) continue; const yy = y + k * k * 900; if (yy > FLOOR) continue; dot(x + i * 14 + Math.sin(k * 8 + i) * 6, yy, 5, '#c98a3a'); } }
SH.open = t => {   // HOOK: low angle; Mama holds up a bitten round biscuit right beside the half moon, comparing, chewing
  cam(620, 960, 1.5);
  set(t, { moon: false });
  phase(830, 720, 80, Math.PI / 2, 1);                       // low angle: the half moon just above the far bank, beside the biscuit
  const P = M(t, { x: 430, look: [.6, -.9], brow: 1.1, eyeS: 1.12, armR: HOLDUP, armL: { h: [-30, 120], bend: -10 }, mouth: { ...talk('mama', t), sm: -.1 } });
  const hp = [430 + MAMA.shW + HOLDUP.h[0], FLOOR - MAMA.shY + HOLDUP.h[1]];
  mama(P);
  biscuit(hp[0] + 40, hp[1] - 50, 62, .3, 1);
  crumbs(t, T.crumb, hp[0] + 60, hp[1] - 20);
};
SH.boltuQ = t => {   // Boltu walks in and points at the bitten biscuit
  const tq = q(t), u = seg(t, LN.b1.t0 - .1, LN.b1.t0 + .5);
  cam(540, 1150, 1.3);
  set(t);
  mama(M(t, { x: MX, look: u > .5 ? [.9, 0] : [.5, -.8], brow: .6, armR: HOLDUP, armL: { h: [-30, 120], bend: -10 } }));
  const hp = [MX + MAMA.shW + HOLDUP.h[0], FLOOR - MAMA.shY + HOLDUP.h[1]];
  biscuit(hp[0] + 30, hp[1] - 40, 40, .3, 1);
  const bx = lerp(1050, 760, eo(u));
  boltu(Bo(t, { x: bx, face: -1, look: [.8, -.6], brow: .8, legL: walk(tq, u > 0 && u < 1)[0], legR: walk(tq, u > 0 && u < 1)[1],
    armR: u >= 1 ? { h: cap(reach(BOLTU, bx, -1, hp[0] + 30, hp[1] - 40), 135), bend: 6 } : { h: [14, 104], bend: 12 } }));
};
SH.shadow = t => {   // "Earth's shadow cuts the moon!": biscuit whipped behind his back, finger up; his wrong idea in a thought bubble
  const k = t - T.hide;
  cam(330, 1050, 1.6);
  set(t);
  const back = ss(clamp(k / .25));
  const hl = [lerp(120, -30, back), lerp(-150, 110, back)];
  const bp = [MX - MAMA.shW + hl[0], FLOOR - MAMA.shY + hl[1]];
  if (back > .6) biscuit(bp[0] - 10, bp[1], 34, .3, 1);                      // behind his body
  mama(M(t, { x: MX, look: k > .3 ? [.4, -.8] : [.8, .2], brow: k > .3 ? -.4 : .4, mouth: { ...talk('mama', t), sm: .5 }, armL: { h: hl, bend: -10 }, armR: k > .4 ? { h: [60, -170], bend: 10 } : { h: [16, 150], bend: 14 } }));
  if (back <= .6) biscuit(bp[0] + 20, bp[1] - 30, 34, .3, 1);
  if (k > .9) {   // Mama's (wrong) picture: Earth's shadow sliding over the moon
    const z = back_(clamp((k - .9) / .3)); reset(); push(); translate(560, 470); scale(z);
    bubble(0, 0, 330, 210);
    shape(ell(-170, 10, 70, 70, 30), { fill: '#3b8fd8', lw: 6, shade: () => fillOnly(ell(-190, 0, 30, 24, 14), '#4caf50', { boil: .3 }) });
    const sx = lerp(60, 170, ss(clamp((k - 1.3) / 1.2)));
    phase(170, 10, 70, Math.PI, 1);
    fillOnly(ell(sx - 40, 10, 70, 74, 30), 'rgba(15,20,40,.85)', { boil: .3 });
    shape(ell(170, 10, 70, 70, 40), { lw: 5 });
    pop();
    if (k > 1.3) tag('মামার ধারণা', 560, 250, { bg: '#f4f1ea', fg: INK, size: 38 });
  }
};
const back_ = u => back(u, 1.4);
function carry(t, u, bx, extra = {}) {   // Bithi walks in: lantern hanging from her right hand, ball in her left
  const tq = q(t);
  const P = Bi(t, { x: bx, face: -1, look: [.5, 0], brow: .2, legL: walk(tq, u > 0 && u < 1)[0], legR: walk(tq, u > 0 && u < 1)[1], armR: { h: [20, 120], bend: 6 }, armL: { h: [40, 40], bend: -30 }, ...extra });
  P.holdR = hp => lantern(hp[0], hp[1] + 135, .9);
  P.holdL = hp => shape(ell(hp[0] + 6, hp[1] - 24, 30, 30, 24), { fill: '#f4f1ea', lw: 5 });
  return P;
}
SH.enter = t => {   // wide: Bithi walks in with a hurricane lantern and a white ball; Boltu turns to her
  const u = seg(t, LN.b2.t0 - .3, LN.b2.t1 + .3);
  cam(540, 1150, 1.05);
  set(t);
  mama(M(t, { x: MX - 60, look: u > .4 ? [.9, 0] : [.9, .2], brow: .4 }));
  boltu(Bo(t, { x: 720, face: u > .1 ? 1 : -1, look: u > .1 ? [.7, -.2] : [-.8, -.3], brow: .9, armR: talk('boltu', t).talking && u > .1 ? { h: [60, -20], bend: 16 } : { h: [14, 104], bend: 12 } }));
  bithi(carry(t, u, lerp(1250, 960, eo(u))));
};
SH.eclipse = t => {   // "a shadow means a lunar eclipse, only sometimes": she sets the lantern on the wall; inset diagram
  const k = t - T.setDown, e = t - T.eclipse;
  cam(560, 1150, 1.35);
  set(t);
  boltu(Bo(t, { x: 880, face: -1, look: [-.7, -.2], brow: .5 }));
  let P;
  if (k < 0) P = carry(t, 1, TIX, { look: [-.6, .3] });
  else { P = Bi(t, { x: TIX, face: -1, look: [.3, -.6], brow: .3, armR: k < .5 ? { h: reach(BITHI, TIX, -1, LX + 30, STEP - 140), bend: 8 } : { h: [12, 140], bend: 12 }, armL: { h: [40, 40], bend: -30 } });
    P.holdL = hp => shape(ell(hp[0] + 6, hp[1] - 24, 30, 30, 24), { fill: '#f4f1ea', lw: 5 }); }
  if (k >= 0) lantern(LX, STEP);
  bithi(P);
  if (e > 0) {   // inset: sun — earth — moon in a line, Earth's shadow on the moon
    const z = back_(clamp(e / .3)); reset(); push(); translate(540, 470); scale(z);
    shape(rr(-420, -200, 840, 400, 30), { fill: '#16243e', lw: 8 });
    shape(ell(-320, 0, 70, 70, 30), { fill: '#ffd65a', lw: 6 });
    fillOnly([[-20, -56], [380, -30], [380, 30], [-20, 56]], 'rgba(0,0,0,.55)', { boil: .3 });
    shape(ell(-20, 0, 56, 56, 30), { fill: '#3b8fd8', lw: 6 });
    phase(300, 0, 40, Math.PI, 1, { lit: '#9a4a3a' });
    pop();
    tag('চন্দ্রগ্রহণ = পৃথিবীর ছায়া', 540, 760, { bg: '#ffd65a', fg: INK, size: 40 });
    if (e > 2.0) tag('মাঝেমধ্যে', 540, 860, { bg: '#ff6b5a', fg: '#fff', size: 40 });
  }
};
// Boltu holds the ball out at arm's length (his head = Earth); the lantern (Sun) on the wall
const BALL = { h: [140, -60], bend: 10 };                  // Boltu faces left (-1): front arm toward the lantern side
function ballLit(cx, cy, r) {   // seen from the side: the half facing the lantern (left) is lit
  shape(ell(cx, cy, r, r, 30), { fill: '#26304f', lw: 5 });
  fillOnly(arc(cx, cy, r, r, Math.PI / 2, Math.PI * 1.5, 20), '#fff3c4', { boil: .2 });
  shape(ell(cx, cy, r, r, 30), { lw: 5 });
}
SH.setup = t => {   // she names the lantern (Sun), the ball (Moon), Boltu's head (Earth); half the ball is always lit
  cam(660, 1130, 1.2);
  set(t); lantern(LX, STEP); rays(LX, STEP - 74, t);
  const bx = 820;
  const P = Bo(t, { x: bx, face: -1, look: [.9, -.3], brow: .4, armR: BALL });
  const hp = [bx - (BOLTU.shW + BALL.h[0]), FLOOR - BOLTU.shY + BALL.h[1]];
  boltu(P);
  ballLit(hp[0] - 16, hp[1] - 26, 34);
  bithi(Bi(t, { x: 1000, face: -1, look: [-.6, -.3], brow: .4, armR: t > T.sun ? { h: [70, -60], bend: 18 } : { h: [12, 140], bend: 12 } }));
  if (t > T.sun) tag('সূর্য', LX, STEP - 230, { bg: '#ffd65a', fg: INK, size: 40 });
  if (t > T.moon) tag('চাঁদ', hp[0] - 16, hp[1] - 110, { bg: '#f4f1ea', fg: INK, size: 40 });
  if (t > T.earth) tag('পৃথিবী', bx, FLOOR - BOLTU.headY - 150, { bg: '#3b8fd8', fg: '#fff', size: 40 });
  if (t > T.half) tag('অর্ধেক সবসময় আলোয়', 540, 640, { bg: '#ff6b5a', fg: '#fff', size: 42 });
};
SH.spin = t => {   // over Boltu's shoulder: as he turns, the lit part of the ball he sees grows crescent → half → full
  const u = ss(clamp((t - T.spin0 - .2) / (T.spin1 - T.spin0 - .5)));
  const phi = lerp(.45, Math.PI, u);
  cam(540, 960, 1);
  bands(['#0f1a3a', '#15244a', '#1c2f5a'], -100, 2100);
  for (let i = 0; i < 30; i++) dot(hash(i * 3.1) * 1080, hash(i * 7.3) * 1100, 3, '#f4f1ea');
  // the lantern swings from just beside the ball (crescent) to behind us (full)
  const lx = lerp(760, 1260, u), ly = lerp(820, 1200, u);
  if (lx < 1180) { lantern(lx, ly, 1.6); rays(lx, ly - 120, t, 8, 110, 160); }
  // his arm from the bottom-left corner to the ball; his head (back of hair) in the foreground
  const bxp = 540, byp = 760;
  shape(noodle([200, 1700], [bxp - 60, byp + 70], 10, 70, 56), { fill: PAL.skinB ?? '#c98a5a', lw: 7 });
  phase(bxp, byp, 170, phi, 1);
  push(); translate(330, 1640); scale(2.4);
  shape(spline([[-80, 40], [-90, -40], [-60, -90], [0, -110], [60, -90], [90, -40], [80, 40]]), { fill: '#1b1422', lw: 6 });
  for (let i = 0; i < 7; i++) { const a = -2.6 + i * .37; shape([[Math.cos(a) * 70, Math.sin(a) * 70 - 20], [Math.cos(a + .18) * 120, Math.sin(a + .18) * 120 - 20], [Math.cos(a + .36) * 70, Math.sin(a + .36) * 70 - 20]], { fill: '#1b1422', lw: 5 }); }
  pop();
  const lab = phi < 1.2 ? 'বাঁকা চাঁদ' : phi < 1.9 ? 'অর্ধেক চাঁদ' : phi < 2.8 ? 'প্রায় গোল' : 'পূর্ণিমা';
  tag(lab, 540, 470, { bg: '#ffd65a', fg: INK, size: 50 });
  tag('বল্টুর চোখে', 540, 360, { bg: '#16243e', fg: '#fff', size: 34 });
};
SH.board = t => {   // top-down orbit: the Sun's light from the left, the Moon goes round the Earth; inset = what we see
  const a = LN.t3.t0, d = LN.t3.t1 - a, k = t - a;
  cam(540, 960, 1);
  bands(['#2e3f6a', '#2a3862', '#26325a'], -100, 2100);
  reset(); shape(rr(70, 90, 940, 1100, 30), { fill: '#141d36', lw: 9 });
  const ex = 600, ey = 560, R = 270;
  for (let i = 0; i < 5; i++) arrow(120, 300 + i * 130, 260, 300 + i * 130, '#ffd65a', 10);   // sunlight
  tag('সূর্যের আলো', 210, 200, { bg: '#ffd65a', fg: INK, size: 34 });
  reset(); stroke(arc(ex, ey, R, R, 0, TAU, 48), 3, { line: '#4a5a8a' });
  shape(ell(ex, ey, 60, 60, 30), { fill: '#3b8fd8', lw: 6, shade: () => fillOnly(ell(ex - 14, ey - 10, 24, 20, 14), '#4caf50', { boil: .3 }) });
  // the moon going round (anticlockwise as seen from above); its sunward half (left) always lit
  const ang = Math.PI - .4 + k / d * TAU * .95;           // starts near the sun direction (new moon) → full round
  const mx = ex + Math.cos(ang) * R, my = ey - Math.sin(ang) * R;
  shape(ell(mx, my, 34, 34, 24), { fill: '#26304f', lw: 5 }); fillOnly(arc(mx, my, 34, 34, Math.PI / 2, Math.PI * 1.5, 16), '#fff3c4', { boil: .2 }); shape(ell(mx, my, 34, 34, 24), { lw: 5 });
  stroke([[ex, ey], [mx, my]], 3, { line: 'rgba(255,255,255,.35)' });
  // inset: from Earth, elongation from the sun
  let el = Math.abs(((ang - Math.PI) % TAU + TAU) % TAU); const waxing = el <= Math.PI; if (!waxing) el = TAU - el;
  reset(); shape(rr(330, 900, 420, 230, 24), { fill: '#0f1a3a', lw: 6 });
  phase(540, 1015, 80, el, waxing ? 1 : -1);
  tag('পৃথিবী থেকে দেখা', 540, 870, { bg: '#f4f1ea', fg: INK, size: 32 });
  if (k > d * .1) tag('চাঁদ পৃথিবীর চারপাশে ঘোরে', 540, 1260 - 60, { bg: '#ff6b5a', fg: '#fff', size: 38 });
  if (k > d * .72) tag('প্রায় ২৯.৫ দিনে এক চক্র', 600, 170, { bg: '#ffd65a', fg: INK, size: 38 });
};
SH.twirl = t => {   // "then my biscuit will turn round again if I spin it!": he twirls the bitten biscuit, hopeful
  const k = t - T.twirl;
  cam(330, 1060, 1.7);
  set(t);
  const arm = { h: [110, -120], bend: 20 };
  const hp = [MX + MAMA.shW + arm.h[0], FLOOR - MAMA.shY + arm.h[1]];
  mama(M(t, { x: MX, look: [.8, -.5], brow: .9, eyeS: 1.1, mouth: { ...talk('mama', t), sm: .7 }, armR: arm }));
  biscuit(hp[0] + 20, hp[1] - 40, 48, k > 0 ? k * 9 : .3, 1);
  if (k > 0 && k < 1.5) for (let i = 0; i < 3; i++) { const a = k * 9 + i * 2.1; stroke(arc(hp[0] + 20, hp[1] - 40, 66, 66, a, a + .8, 8), 4, { line: '#ffd65a' }); }
};
SH.pause = t => {   // cold pause: Boltu and Bithi stare, one slow blink
  const tq = q(t), a = T.shots.find(s => s[2] === 'pause')[0];
  cam(780, 1150, 1.9);
  set(t); lantern(LX, STEP);
  const bl = tq > a + .55 && tq < a + .8;
  bithi(Bi(t, { face: -1, look: [.7, 0], lid: .4, blink: bl, brow: -.2, mouth: { o: 0, w: .7, sm: -.1 } }));
  boltu(Bo(t, { x: 900, face: -1, look: [.7, -.1], lid: .45, blink: bl, mouth: { o: 0, w: .7, sm: -.2 } }));
  ballLit(900 - (BOLTU.shW + 14) - 4, FLOOR - BOLTU.shY + 104 + 22, 30);   // ball lowered, held at his side
};
SH.deadpan = t => {   // "Mama, you ate the biscuit." Mama's moustache droops; he quietly takes another bite
  const k = t - T.bite;
  cam(500, 1150, 1.35);
  set(t); lantern(LX, STEP);
  const eat = k > 0 && k < .6 ? ss(clamp(k / .25)) * (1 - ss(clamp((k - .35) / .25))) : 0;
  const arm = lerpArm({ h: [110, -120], bend: 20 }, { h: [40, -175], bend: 30 }, eat);
  const hp = [MX + MAMA.shW + arm.h[0], FLOOR - MAMA.shY + arm.h[1]];
  mama(M(t, { x: MX, look: k > -.4 ? [.2, -.3] : [.8, 0], brow: -1, worry: true, lid: .35, mouth: k > .3 && k < 1.6 ? { o: .2 + .2 * Math.abs(Math.sin(k * 14)), w: .8, sm: -.1 } : { ...talk('mama', t), sm: -.2 }, armR: arm }));
  biscuit(hp[0] + 20, hp[1] - 40, 40, .3, k > .35 ? 2 : 1);
  if (k > .35) crumbs(t, T.bite + .35, hp[0] + 10, hp[1] - 10, 3);
  boltu(Bo(t, { x: 800, face: -1, look: [.8, 0], lid: .5, brow: -.3, mouth: { ...talk('boltu', t), sm: -.1 } }));
};
SH.puzzle = t => {   // Bithi points at the moon; thought bubble with Sun ? Earth ? Moon; then turns to the viewer
  const tq = q(t), a = LN.t4.t0;
  cam(TIX - 60, 1030, 1.7);
  set(t); lantern(LX, STEP);
  const turn = tq > a + 2.6;
  bithi(Bi(t, { x: TIX, face: 1, look: turn ? [0, 0] : [.6, -.8], brow: .5, armR: turn ? { h: [12, 140], bend: 12 } : { h: [80, -160], bend: 16 } }));
  if (t > a + .1) tag('ধাঁধা!', 540, 220, { bg: '#ffd65a', fg: INK, size: 64 });
  if (t > a + .9) {
    const z = back_(clamp((t - a - .9) / .3)); reset(); push(); translate(470, 560); scale(z);
    bubble(0, 0, 300, 150);
    shape(ell(-180, 0, 46, 46, 24), { fill: '#ffd65a', lw: 5 }); shape(ell(0, 0, 40, 40, 24), { fill: '#3b8fd8', lw: 5 }); phase(170, 0, 34, Math.PI, 1);
    for (const x of [-90, 85]) text('?', x, 0, { font: '800 64px "Baloo"' });
    pop();
  }
};
SH.end = t => {
  cam(540, 960, 1);
  bands(['#0f1a3a', '#15244a', '#1c2f5a'], -100, 2100);
  const pu0 = back(clamp((t - T.VEND) / .4), 1.6);
  reset(); push(); translate(540, 800); scale(Math.max(.01, pu0)); phase(0, 0, 150, Math.PI / 2, 1); pop();
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
