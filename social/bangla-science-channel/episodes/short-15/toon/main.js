// Scientific Bithi Short 15 × Sci-Fi Sitcom Toon (9:16): "দেয়াল কি কথা নকল করে?" — echo (প্রতিধ্বনি). No scientist.
// Setting: the courtyard of a ruined zamindar bari (two-storey facade with arches, broken plaster, a banyan sapling on the parapet), late afternoon.
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
const WALLX = 1090;                                        // the courtyard's far side wall (the echo wall) in the side-on shots

// —— ruined zamindar bari courtyard, late afternoon (জমিদার বাড়ির উঠান) ——
function arch(x, y, w, h, fill = '#2a1c18') { shape([...arc(x + w / 2, y + w / 2, w / 2, w / 2, Math.PI, TAU, 16), [x + w, y + h], [x, y + h]], { fill, lw: 6 }); }
function facade(t) {
  bands(['#f2b46a', '#f6cf8a', '#fbe3b0'], -900, 900);                                     // late-afternoon sky
  for (const [cx, cy, s] of [[60, 260, 1], [900, 200, .8]]) shape(spline([[cx - 90 * s, cy], [cx - 40 * s, cy - 40 * s], [cx + 30 * s, cy - 50 * s], [cx + 100 * s, cy - 10 * s], [cx + 60 * s, cy + 20 * s], [cx - 60 * s, cy + 20 * s]]), { fill: '#fff4dc', lw: 5 });
  // two-storey facade: red brick under broken lime plaster, arches, columns, a parapet with a banyan sapling
  shape(rect(-500, 440, 2100, 720), { fill: '#d9c3a0', lw: 7, shade: () => {
    for (const [px, py, pw, ph] of [[-120, 520, 160, 90], [420, 900, 200, 110], [880, 560, 150, 80], [1250, 950, 170, 90]]) { fillOnly(rect(px, py, pw, ph), '#b4553a', { boil: .3 }); for (let k = 0; k < 3; k++) fillOnly(rect(px + 10, py + 18 + k * 26, pw - 20, 5), '#8e3c28', { boil: .2 }); }
    fillOnly(rect(-500, 440, 2100, 30), '#b8a27c', { boil: .2 }); fillOnly(rect(-500, 790, 2100, 26), '#b8a27c', { boil: .2 });
    for (let k = 0; k < 9; k++) fillOnly(ell(-460 + k * 260, 1150, 70, 22, 16), '#7f9a4a', { boil: .3 });   // moss at the foot
  } });
  for (let i = 0; i < 9; i++) { const x = -420 + i * 230; arch(x, 560, 150, 210); arch(x, 880, 150, 270); shape(rect(x - 46, 560, 30, 590), { fill: '#efe2c8', lw: 5 }); }
  shape([[-520, 440], [1620, 440], [1600, 400], [-500, 400]], { fill: '#c9b38e', lw: 6 });
  for (let x = -480; x < 1600; x += 60) shape(rect(x, 360, 34, 44), { fill: '#d9c3a0', lw: 4 });
  shape(spline([[300, 400], [280, 330], [240, 290], [300, 300], [330, 250], [360, 300], [410, 280], [380, 340], [350, 400]]), { fill: '#5f8a3a', lw: 5 });   // banyan sapling
  for (let i = 0; i < 3; i++) { const u = (t * .08 + i * .33) % 1; const px = -200 + u * 1700, py = 330 + Math.sin(u * 20 + i) * 20; stroke([[px - 18, py], [px, py + 8], [px + 18, py]], 5); }   // pigeons gliding
  // courtyard: old brick floor
  shape(rect(-600, 1150, 2400, 1400), { fill: '#c07a52', lw: 7, shade: () => { for (let k = 0; k < 8; k++) stroke([[-600, 1180 + k * k * 18], [1800, 1180 + k * k * 18]], 3, { line: '#9a5a38' }); for (let k = -6; k < 10; k++) stroke([[540 + k * 60, 1150], [540 + k * 260, 2500]], 3, { line: '#9a5a38' }); } });
  for (const [gx, gy] of [[-80, 1240], [1100, 1300], [820, 1180]]) for (let k = 0; k < 4; k++) stroke([[gx + k * 10, gy], [gx + k * 10 - 8 + k * 4, gy - 30 - k * 6]], 4, { line: '#5f8a3a' });   // grass tufts in the cracks
}
function pillar(x, top = 300) {   // a big near column in the foreground (Mama hides behind it)
  shape(rect(x - 80, top, 160, FLOOR + 40 - top), { fill: '#efe2c8', lw: 8, shade: () => { fillOnly(rect(x + 30, top, 50, FLOOR + 40 - top), '#d4c3a2', { boil: .3 }); fillOnly(rect(x - 70, top + 500, 70, 120), '#b4553a', { boil: .3 }); } });
  shape(rect(x - 104, FLOOR - 40, 208, 80), { fill: '#d9c3a0', lw: 7 }); shape(rect(x - 100, top - 40, 200, 50), { fill: '#d9c3a0', lw: 7 });
}
function sideWall(t) {   // side-on staging: the long far wall stands at WALLX (the echo wall), arches drawn edge-on
  shape(rect(WALLX, 300, 900, 1300), { fill: '#d9c3a0', lw: 8, shade: () => { fillOnly(rect(WALLX, 300, 50, 1300), '#b8a27c', { boil: .3 }); fillOnly(rect(WALLX + 60, 700, 140, 90), '#b4553a', { boil: .3 }); fillOnly(ell(WALLX + 80, 1480, 80, 26, 16), '#7f9a4a', { boil: .3 }); } });
}
// sound: expanding arcs. dir 1 = travelling right, -1 = left; r = radius of the leading arc
function rings(x, y, r, dir, col = '#ffffff', a = 1) {
  for (let k = 0; k < 3; k++) { const rr_ = r - k * 46; if (rr_ < 20) continue; const a0 = dir > 0 ? -.75 : Math.PI - .75, a1 = a0 + 1.5; stroke(arc(x, y, rr_, rr_, a0, a1, 18), 12 - k * 3, { line: col.replace('ALPHA', (a * (1 - k * .25)).toFixed(2)) }); }
}
function broom(hp, ang = -1.2, s = 1) {   // ঝাড়ু (bundle of coconut-leaf ribs) held at the binding
  push(); translate(hp[0], hp[1]); rotate(ang); scale(s);
  shape(rr(-10, -20, 20, 40, 8), { fill: '#d8343c', lw: 4 });
  shape([[-8, 18], [8, 18], [60, 220], [-60, 220]], { fill: '#c9a46a', lw: 5, shade: () => { for (let k = -4; k <= 4; k++) stroke([[k * 2, 20], [k * 14, 218]], 2.5, { line: '#8e7650' }); } });
  shape([[-8, -18], [8, -18], [4, -60], [-4, -60]], { fill: '#c9a46a', lw: 4 });
  pop();
}
function helmet(P) {   // an aluminium cooking pot (ডেকচি) worn as a helmet, drawn over Mama's head
  const sc = P.s ?? 1, f = P.face ?? 1, a = P.lean ?? 0, hy = (MAMA.headY + 108) * sc * (P.sq ?? 1);
  const x = P.x + Math.sin(a) * hy * f, y = P.y + (P.bob || 0) - Math.cos(a) * hy;
  push(); translate(x, y); rotate(a * f + (P.headTilt ?? 0) * f); scale(sc);
  shape([[-96, 30], [96, 30], [86, -62], [-86, -62]], { fill: '#c3cbd0', lw: 7, shade: () => fillOnly(rect(30, -70, 70, 110), '#9aa3aa', { boil: .3 }) });
  shape(rr(-104, 18, 208, 22, 10), { fill: '#d6dde0', lw: 6 });
  for (const sx of [-1, 1]) stroke(arc(sx * 104, 0, 16, 14, sx > 0 ? -1.2 : Math.PI - 1.9, sx > 0 ? 1.9 : Math.PI + 1.2, 10), 6);
  pop();
}
function note(x, y, s = 1, rot = 0, col = '#2b2233') { push(); translate(x, y); rotate(rot); scale(s); shape(ell(0, 0, 22, 16, 16), { fill: col, lw: 4 }); stroke([[20, -4], [20, -90]], 7, { line: col }); shape([[20, -90], [50, -70], [46, -54], [24, -70]], { fill: col, lw: 3 }); pop(); }
function echoWord(str, x, y, a) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = a; text(str, x, y, { font: '800 60px "Baloo"', fill: '#ffffff', outlineW: 10 }); g.globalAlpha = 1; }

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
const WHITE = 'rgba(255,255,255,ALPHA)', GOLD = 'rgba(255,214,90,ALPHA)';
const MX0 = 360;
// outgoing / returning sound toward the facade (depth): from mouth point A to wall point B and back, shrinking with distance
function depthEcho(t, t0, A, B, travel = .4) {
  const k = t - t0; if (k < 0 || k > travel * 2 + .2) return;
  if (k < travel) { const u = k / travel; push(); translate(lerp(A[0], B[0], u), lerp(A[1], B[1], u)); scale(lerp(1, .35, u)); for (let i = 0; i < 3; i++) shape(ell(0, 0, 60 + i * 40, 30 + i * 20, 24), { fill: null, line: `rgba(255,255,255,${(.9 - i * .25) * (1 - u * .4)})`, lw: 8 }); pop(); }
  else { const u = clamp((k - travel) / travel); push(); translate(lerp(B[0], A[0], u), lerp(B[1], A[1], u)); scale(lerp(.35, 1.1, u)); for (let i = 0; i < 3; i++) shape(ell(0, 0, 60 + i * 40, 30 + i * 20, 24), { fill: null, line: `rgba(255,214,90,${(.9 - i * .25)})`, lw: 8 }); pop(); }
}
SH.open = t => {   // HOOK (frame 1 absurd still): Mama in the empty courtyard, broom raised like a sword, other hand cupped at his mouth, shouting at the old house
  const k = t - T.echo1;
  cam(470, 1050, 1.55);
  facade(t);
  const startle = k > .25 ? ss(clamp((k - .25) / .15)) : 0;
  const P = M(t, { x: MX0, look: k > .2 ? [.3, -.6] : [.6, -.7], headTilt: -.06, brow: startle ? 1.4 : -.6, eyeS: startle ? 1.3 : 1, pupil: startle ? 2.4 : undefined, nerv: startle ? .6 : 0,
    mouth: talk('mama', t).talking ? { ...talk('mama', t), sm: -.2 } : { o: startle ? .55 : 0, w: .7, sm: -.3 }, bob: -startle * 30 * Math.max(0, 1 - (k - .25) / .4),
    armR: { h: [70, -150], bend: 30 }, armL: { h: [44, -20], bend: -30, fist: true } });
  P.holdR = hp => broom(hp, Math.PI * .82, 1);
  mama(P); helmet(P);
  depthEcho(t, LN.m1.t0 + .15, [MX0 + 60, 1000], [700, 700], .38);
  // the echo heard back: faded words drifting from the arches
  if (k > 0 && k < 1.6) { echoWord('…ওখানে?', 640, 700 + k * 30, clamp(1 - k / 1.6) * .9); }
  if (k > .45 && k < 1.6) { echoWord('…খানে?', 700, 820 + k * 20, clamp(1 - (k - .45) / 1.1) * .6); }
};
SH.hide = t => {   // Mama ducks behind a big column, peeks out, broom held like a sword, knees shaking; whispers
  cam(380, 1100, 1.6);
  facade(t);
  const P = M(t, { x: 345, look: [.9, -.3], brow: 1.1, worry: true, eyeS: 1.15, nerv: .45, lean: .12, mouth: { ...talk('mama', t), sm: -.4 },
    armR: { h: [90, -70], bend: 20 }, armL: { h: [60, 30], bend: -20 } });
  P.holdR = hp => broom(hp, Math.PI * .8, 1);
  mama(P); helmet(P);
  pillar(290);
};
SH.boltuQ = t => {   // Boltu strolls in from the right and points at the broom; Mama turns to him
  const tq = q(t), u = seg(t, LN.b1.t0 - .1, LN.b1.t0 + .6);
  cam(600, 1150, 1.2);
  facade(t); pillar(120);
  const P = M(t, { x: 360, look: u > .5 ? [.9, 0] : [.6, -.4], brow: .9, worry: true, nerv: .2, armR: { h: [90, -70], bend: 20 } });
  P.holdR = hp => broom(hp, Math.PI * .8, 1);
  mama(P); helmet(P);
  const bx = lerp(1150, 860, eo(u));
  const tip = [360 + MAMA.shW + 150, FLOOR - MAMA.shY - 120];
  boltu(Bo(t, { x: bx, face: -1, look: [.8, -.2], brow: .8, mouth: { ...talk('boltu', t), sm: .3 }, legL: walk(tq, u > 0 && u < 1)[0], legR: walk(tq, u > 0 && u < 1)[1],
    armR: u >= 1 ? { h: cap(reach(BOLTU, bx, -1, tip[0], tip[1]), 135), bend: 6 } : { h: [14, 104], bend: 12 } }));
};
SH.broom = t => {   // "ghosts don't come near a broom!": chin up, broom planted like a royal staff (proud, completely wrong)
  cam(420, 1050, 1.75);
  facade(t);
  const P = M(t, { x: 380, look: [.2, -.3], headTilt: -.08, brow: -.3, mouth: { ...talk('mama', t), sm: .7 }, armR: { h: [70, 40], bend: 10 } });
  P.holdR = hp => broom([hp[0], hp[1] + 10], 0.05, 1.05);
  mama(P); helmet(P);
};
SH.enter = t => {   // wide: Bithi walks in; Boltu turns to her as he asks and points at the old house
  const tq = q(t), u = seg(t, LN.b2.t0 - .3, LN.b2.t1 + .2);
  cam(600, 1120, 1.0);
  facade(t);
  const P = M(t, { x: 230, look: u > .4 ? [.9, 0] : [.9, .2], brow: .4, armR: { h: [70, 40], bend: 10 } });
  P.holdR = hp => broom([hp[0], hp[1] + 10], 0.05, 1.05);
  mama(P); helmet(P);
  const btalk = talk('boltu', t).talking;
  boltu(Bo(t, { x: 640, face: 1, look: [.7, -.2], brow: .9, armR: btalk ? { h: [60, -150], bend: 16 } : { h: [14, 104], bend: 12 } }));
  bithi(Bi(t, { x: lerp(1250, 980, eo(u)), face: -1, look: [.6, 0], brow: .2, legL: walk(tq, u > 0 && u < 1)[0], legR: walk(tq, u > 0 && u < 1)[1] }));
};
// side-on demo: Bithi (left) faces the long far wall (right); her clap travels right, hits the wall, comes back
const CLAPX = 240;
function clapArms(t, tc) { const k = t - tc, j = k > -.12 && k < .12 ? 1 : 0; return j ? { armR: { h: [24, 80], bend: 6 }, armL: { h: [128, 80], bend: -6 } } : { armR: { h: [50, 20], bend: 20 }, armL: { h: [60, 70], bend: -10 } }; }
function clapWave(t, tc, x0, y0, xw, dur = .5, labels = true) {
  const k = t - tc; if (k < 0) return;
  const half = dur / 2, D = xw - x0;
  if (k < half) { const u = k / half; rings(x0 + (D - 110) * u, y0, 110, 1, WHITE, 1); if (labels) tag('শব্দ যায় →', (x0 + xw) / 2, y0 - 330, { bg: '#f4f1ea', fg: INK, size: 40 }); }
  else if (k < dur + .15) { const u = clamp((k - half) / half); rings(xw - (D - 110) * u, y0, 110, -1, GOLD, 1); if (labels) tag('← ফিরে আসে', (x0 + xw) / 2, y0 - 330, { bg: '#ffd65a', fg: INK, size: 40 }); }
  if (k > half - .06 && k < half + .2) { push(); translate(xw, y0); for (let i = 0; i < 5; i++) { const a = Math.PI * (.6 + i * .2); stroke([[Math.cos(a) * 20, Math.sin(a) * 20], [Math.cos(a) * 60, Math.sin(a) * 60]], 6, { line: '#ffd65a' }); } pop(); }
}
SH.clap = t => {   // "Not a ghost, an echo!": she turns to the wall, then claps once; the sound ring travels to the wall and returns
  cam(640, 1080, .95);
  facade(t); sideWall(t);
  const P = Bi(t, { x: CLAPX + 120, face: 1, look: t > T.clap - .8 ? [.9, -.1] : [-.5, 0], brow: .4, ...(t > T.clap - .5 ? clapArms(t, T.clap) : { armR: talk('bithi', t).talking ? { h: [80, -40], bend: 18 } : { h: [12, 140], bend: 12 } }) });
  bithi(P);
  { const P = M(t, { x: 120, s: .85, y: FLOOR + 60, look: [.9, -.1], brow: t > T.echoClap ? 1.3 : .8, eyeS: t > T.echoClap ? 1.25 : 1, worry: true, armR: { h: [70, 40], bend: 10 } }); P.holdR = hp => broom([hp[0], hp[1] + 10], 0.05, 1.05); mama(P); helmet(P); }
  boltu(Bo(t, { x: 640, s: .9, y: FLOOR + 40, face: -1, look: t > T.clap ? [-.6, -.1] : [.6, 0], brow: t > T.echoClap ? 1.2 : .6, eyeS: t > T.echoClap ? 1.2 : 1 }));
  clapWave(t, T.clap, CLAPX + 260, FLOOR - 300, WALLX, T.echoClap - T.clap);
  if (t > LN.t1.t0 + .4) tag('প্রতিধ্বনি', 640, 300, { bg: '#2b67c9', fg: '#fff', size: 56 });
};
SH.boltuCU = t => {   // reaction close-up: two fingers up, eyes huge
  const m = talk('boltu', t);
  cam(700, 1060, 1.75);
  facade(t);
  boltu(Bo(t, { x: 760, face: -1, look: [.2, -.1], eyeS: 1.25, pupil: 2.6, brow: 1.2, mouth: { o: m.o * 1.2 + (m.talking ? .08 : .35), w: m.w, sm: .2 }, armR: { h: [60, -150], bend: 10, fist: true } }));
  const z = back(clamp((t - T.shots.find(s => s[2] === 'boltuCU')[0]) / .3), 1.4);
  if (z > .05) tag('২ বার!', 480, 640, { bg: '#ffd65a', fg: INK, size: Math.round(60 * Math.min(1.2, z)) });
};
SH.board = t => {   // the rule: far wall (≥17 m) → the echo comes back late enough to hear separately; near wall → it merges
  const a = LN.t2.t0, k = t - a;
  cam(540, 960, 1);
  bands(['#5a3a2e', '#523428', '#4a2e24'], -100, 2100);
  reset(); shape(rr(60, 80, 960, 1180), { fill: '#2a1c18', lw: 9 });
  tag('শব্দের বেগ ≈ ৩৪০ মি/সে', 540, 170, { bg: '#ffd65a', fg: INK, size: 44 });
  const rows = [[480, 900, '১৭ মিটার বা বেশি', 1.6], [900, 520, 'কাছের দেয়াল', 4.6]];
  for (const [y, wx, nm, s0] of rows) {
    if (k < s0 - 1.2) continue;
    reset();
    shape(ell(170, y, 34, 34, 20), { fill: PAL.skinT, lw: 5 }); shape(rr(140, y + 36, 60, 90, 16), { fill: '#f4f1ea', lw: 5 });   // a tiny Bithi icon
    shape(rect(wx, y - 140, 50, 280), { fill: '#d9c3a0', lw: 6 });
    stroke([[230, y + 170], [wx, y + 170]], 5, { line: '#f4f1ea' }); stroke([[230, y + 155], [230, y + 185]], 5, { line: '#f4f1ea' }); stroke([[wx, y + 155], [wx, y + 185]], 5, { line: '#f4f1ea' });
    tag(nm, (230 + wx) / 2, y + 215, { bg: '#f4f1ea', fg: INK, size: 34 });
    const per = 2.0, kk = (k - s0) % per; if (k > s0) clapWave(t, t - kk, 230, y, wx, (wx - 230) / 700 * 1.0, false);
  }
  if (k > 3.0) tag('আলাদা প্রতিধ্বনি ✓', 760, 330, { bg: '#5f8a3a', fg: '#fff', size: 36 });
  if (k > 6.0) tag('মিশে যায়', 760, 750, { bg: '#e2453a', fg: '#fff', size: 36 });
  if (k > 6.6) tag('যেতে-আসতে ৩৪ মিটার ≈ ০.১ সেকেন্ড', 540, 1190, { bg: '#ffd65a', fg: INK, size: 36 });
};
// singing: notes fly to the wall and bounce back crooked
function notesFly(t, t0, x0, y0, xw, n = 5) {
  for (let i = 0; i < n; i++) {
    const k = t - t0 - i * .22; if (k < 0) continue;
    const go = .55, D = xw - x0;
    if (k < go) note(x0 + D * k / go, y0 - 60 * Math.sin(k / go * Math.PI) - i * 30, .9, -.1);
    else if (k < go * 2.2) { const u = (k - go) / (go * 1.2); note(xw - D * u, y0 - i * 30 + Math.sin(u * 12) * 30, .8, Math.PI + .6 * Math.sin(u * 9 + i), '#7a3a8a'); }
  }
}
SH.sing = t => {   // "Then I'll sing for the ghost!": arms wide at the wall, notes fly, hit it and come back bent
  cam(620, 1080, .95);
  facade(t); sideWall(t);
  const sing = t > T.sing0;
  const PM = M(t, { x: 560, face: 1, look: [.9, -.3], headTilt: sing ? -.12 : 0, lid: sing ? .6 : .18, brow: sing ? 1 : .3, mouth: { ...talk('mama', t), sm: .6 },
    armR: sing ? { h: [80, -110], bend: 20 } : { h: [70, 40], bend: 10 }, armL: sing ? { h: [-60, -110], bend: -20 } : undefined });
  mama(PM); helmet(PM);
  boltu(Bo(t, { x: 110, s: .9, y: FLOOR + 40, face: 1, look: [.9, -.1], lid: sing ? .4 : .1, brow: sing ? -.4 : .3, mouth: { o: 0, w: .7, sm: sing ? -.3 : .2 } }));
  bithi(Bi(t, { x: 300, s: .9, y: FLOOR + 40, face: 1, look: [.9, -.1], brow: sing ? -.2 : .3, mouth: { o: 0, w: .7, sm: sing ? -.2 : .3 } }));
  if (sing) notesFly(t, T.sing0, 700, FLOOR - 470, WALLX);
};
SH.pause = t => {   // cold pause: Boltu and Bithi stare, slow blink
  const tq = q(t), a = T.shots.find(s => s[2] === 'pause')[0];
  cam(760, 1150, 1.9);
  facade(t);
  const bl = tq > a + .5 && tq < a + .75;
  bithi(Bi(t, { x: 640, face: -1, look: [.7, 0], lid: .4, blink: bl, brow: -.2, mouth: { o: 0, w: .7, sm: -.1 } }));
  boltu(Bo(t, { x: 900, face: -1, look: [.7, -.1], lid: .45, blink: bl, mouth: { o: 0, w: .7, sm: -.2 } }));
};
SH.deadpan = t => {   // "Mama, even the wall sent your song back." Bent notes drop on Mama; he scowls at the wall
  const k = t - LN.b4.t0;
  cam(560, 1150, 1.3);
  facade(t); sideWall(t);
  const hit = k > .8;
  { const P = M(t, { x: 380, face: 1, look: hit ? [.9, -.4] : [.4, -.6], brow: hit ? -1 : .6, eyeS: hit ? .9 : 1.1, mouth: { o: 0, w: .8, sm: hit ? -.6 : -.1 }, armR: { h: [70, 40], bend: 10 } }); mama(P); helmet(P); }
  for (let i = 0; i < 3; i++) { const u = clamp((k - .2 - i * .4) / .45); if (u > 0 && u < 1) note(390 + i * 30 - 20, lerp(600, 930, eo(u)), .8, Math.PI + .5, '#7a3a8a'); }
  boltu(Bo(t, { x: 820, face: -1, look: [.8, 0], lid: .5, brow: -.3, mouth: { ...talk('boltu', t), sm: -.1 } }));
};
SH.puzzle = t => {   // Bithi turns to camera; thought bubble: a small room, the shout bounces back almost at once
  const tq = q(t), a = LN.t3.t0;
  cam(330, 1060, 1.45);
  facade(t);
  const turn = tq > a + 3.2;
  bithi(Bi(t, { x: 300, face: 1, look: turn ? [0, 0] : [.7, -.5], brow: .5, armR: turn ? { h: [12, 140], bend: 12 } : { h: [90, -130], bend: 20 } }));
  if (t > a + .1) tag('ধাঁধা!', 540, 220, { bg: '#ffd65a', fg: INK, size: 64 });
  if (t > a + .9) {
    const z = back(clamp((t - a - .9) / .3), 1.4); reset(); push(); translate(600, 590); scale(z);
    shape(spline([[-300, 0], [-280, -150], [-100, -190], [120, -180], [300, -100], [290, 110], [100, 170], [-200, 150]]), { fill: '#f4f1ea', lw: 7 });
    shape(rect(-200, -130, 400, 230), { fill: '#e8d9b8', lw: 6 });
    shape(ell(-120, -10, 20, 20, 16), { fill: PAL.skinM, lw: 4 }); shape(rr(-136, 12, 32, 60, 10), { fill: PAL.kurta, lw: 4 });
    const kk = (t * 1.5) % 1; rings(-90, -10, 30 + kk * 250, 1, 'rgba(255,107,90,ALPHA)', 1);
    text('?', 140, -10, { font: '800 90px "Baloo"' });
    pop();
    if (t > a + 1.5) tag('ছোট ঘর', 600, 820, { bg: '#e8d9b8', fg: INK, size: 38 });
  }
};
SH.end = t => {
  cam(540, 960, 1);
  bands(['#f2b46a', '#f6cf8a', '#fbe3b0'], -100, 2100);
  const pu0 = back(clamp((t - T.VEND) / .4), 1.6);
  reset(); push(); translate(540, 820); scale(Math.max(.01, pu0) * 1.3); arch(-80, -160, 160, 220); rings(-40, -40, 120, 1, WHITE); pop();
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
