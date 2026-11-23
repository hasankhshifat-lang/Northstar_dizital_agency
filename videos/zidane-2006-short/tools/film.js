// ---------------------------------------------------------------- film: "The Last Game" - Italy 1-1 France (5-3 pens), World Cup final, Olympiastadion, Berlin, 9 July 2006
// One comic page: the scoreboard pinned on top (score + match minute), the action panel, caption band.
// France = generic plain white kit (sheet 'fra'); Italy = generic plain blue shirt, white shorts ('ita'). Keepers generic grey ('gkx', Italy)
// and green ('gkg', France), unnumbered. Referee and fourth official = generic referee puppets ('ref'). No crests, sponsors or faces.
Object.assign(C, { fraI: '#2B3F78', fraW: '#EEE9DC', ita: '#2F6CC0', itaP: '#3F7BCB', silver: '#C9CCD1', card: '#D3352B' });

const FOOTER = 'Moments That Made Legends · Part Two';
const PUSH = [[T.sE + .3, T.butt, 1.06, 560, 820]];
const SHAKES = [[T.bar, 6, .3], [T.g2, 10, .4], [T.butt, 18, .5]];
POSES.cardup = { lean: 0, h: -6, uL: 16, fL: 4, uR: -178, fR: -4, tL: 3, sL: 0, tR: -3, sR: 0 };
POSES.butt = { lean: -34, h: -16, uL: -30, fL: -10, uR: 30, fR: 10, tL: 10, sL: 10, tR: -30, sR: 10 };
POSES.fallb = { lean: 30, h: 20, uL: 120, fL: 40, uR: -60, fR: -30, tL: 30, sL: 20, tR: -40, sR: 10 };
POSES.walk1 = { lean: 2, h: 8, uL: 18, fL: 8, uR: -18, fR: -8, tL: 14, sL: 8, tR: -12, sR: 4 };
POSES.walk2 = { lean: 2, h: 8, uL: -14, fL: -4, uR: 16, fR: 6, tL: -12, sL: 4, tR: 14, sR: 8 };
POSES.header = { lean: -10, h: -16, uL: 60, fL: 20, uR: -60, fR: -20, tL: 20, sL: 30, tR: -10, sR: 40 };

const EV = [{ t: 0.0, type: 'vo', id: 'narration' }];
const ev = (t, type, o = {}) => EV.push({ t, type, ...o });
ev(T.last, 'slip'); ev(T.final, 'slip'); ev(T.card0 - .1, 'whistle'); ev(T.card0, 'slap', { v: .5 }); ev(T.card0 + .1, 'groan');
ev(T.sB - .15, 'whip', { d: .35 }); ev(T.pin - .05, 'pin'); ev(T.vs, 'slip');
ev(T.sC - .15, 'whip', { d: .35 }); for (let i = 0; i < 5; i++) ev(T.run + i * ((T.chip - T.run - .1) / 5), 'step', { pan: -.1, v: .5 });
ev(T.chip, 'kick', { v: .5 }); ev(T.bar, 'ding'); ev(T.bar, 'slap', { v: .5 }); ev(T.down, 'fall'); ev(T.line, 'scribble', { d: .45 }); ev(T.line + .05, 'roar', { d: 2.4, v: .8 }); ev(T.line + .05, 'net');
ev(T.sD - .15, 'whip', { d: .35 }); ev(T.corner, 'kick', { v: .6 }); ev(T.head, 'slap', { v: .4 }); ev(T.g2, 'net'); ev(T.g2, 'roar', { d: 2.2, v: .8 }); ev(T.lvl, 'slip');
ev(T.sE - .15, 'whip', { d: .35 }); ev(T.sE + .2, 'slip'); ev(T.words, 'slip'); ev(T.words + .5, 'slip');
for (let i = 0; i < 5; i++) ev(T.away + i * .32, 'step', { pan: .2, v: .4 }); ev(T.turn, 'whoosh');
ev(T.butt - .05, 'freeze'); ev(T.butt, 'bigslap'); ev(T.fall, 'fall'); ev(T.fall + .2, 'groan');
ev(T.sF - .15, 'whip', { d: .35 }); ev(T.fourth, 'whoosh'); ev(T.fourth + .3, 'slip');
ev(T.sG - .15, 'whip', { d: .35 }); ev(T.red, 'whistle'); ev(T.red + .1, 'slap', { v: .6 }); ev(T.red + .3, 'groan');
for (let i = 0; i < 9; i++) ev(T.walk + i * .34, 'step', { pan: -.3 + i * .07, v: .4 }); ev(T.gone, 'slip');
ev(T.sH - .15, 'whip', { d: .35 }); ev(T.pens, 'stamp'); ev(T.gold, 'slip'); ev(T.gold + .2, 'clap', { d: 2.6, v: .7 });
ev(T.sI - .15, 'whip', { d: .35 }); ev(T.never, 'tear');
ev(T.sJ - .15, 'whip', { d: .35 }); ev(T.sJ + .9, 'slip'); ev(T.sJ + 1.4, 'slip');

// ---------------------------------------------------------------- the scoreboard: score + match minute
const ROWY = { fra: 214, ita: 338 };
const SCOL = 700, MCOL = 890;
const SCORE = { fra: [[-9, '0'], [T.line, '1']], ita: [[-9, '0'], [T.g2, '1']] };
const MINUTE = [[-9, 'KO'], [T.sC + .3, '7′'], [T.sD + .3, '19′'], [T.sE + .3, '108′'], [T.red - .2, '110′'], [T.pens - .2, 'PENS']];
function patchStack(hist, cx, cy, w, h, t, fillNew, inkFirst, size, seedBase) {
  let lastI = 0; for (let i = 0; i < hist.length; i++) if (t >= hist[i][0] - .3) lastI = i;
  for (let i = Math.max(0, lastI - 1); i <= lastI; i++) {
    const [t0, v] = hist[i];
    const d = i === 0 ? { vis: true, held: 0, s: 1, rot: (mulberry(cx + cy)() - .5) * .03, y: 0 } : drop(t, t0, .3, seedBase + i);
    if (!d.vis) continue;
    X.save(); X.translate(cx, cy + d.y); X.scale(d.s, d.s);
    paperCard(-w / 2, -h / 2, w, h, i === 0 ? '#E9DDBF' : fillNew, d.held, d.rot);
    X.rotate(d.rot);
    if (i > 0) { X.strokeStyle = 'rgba(241,232,210,.85)'; X.lineWidth = 2; X.setLineDash([6, 5]); X.strokeRect(-w / 2 + 9, -h / 2 + 9, w - 18, h - 18); X.setLineDash([]); }
    const fs = v.length > 3 ? size * .62 : size;
    X.font = `bold ${fs}px ${F.num}`; X.textAlign = 'center'; X.textBaseline = 'middle';
    X.fillStyle = i === 0 ? inkFirst : C.paper; X.fillText(v, 0, 6);
    X.restore();
  }
}
function scoreboard(t, texts) {
  inkText('WORLD CUP FINAL · 9 JULY 2006', W / 2, SB.y + 40, 30);
  X.strokeStyle = C.ink; X.lineWidth = 1.5; X.beginPath(); X.moveTo(SB.x + 40, SB.y + 64); X.lineTo(SB.x + SB.w - 40, SB.y + 64); X.stroke();
  inkText('Score', SCOL, SB.y + 92, 28); inkText('Minute', MCOL, SB.y + 92, 28);
  for (const [team, label, col, sw] of [['fra', 'FRANCE', C.fraI, C.fraW], ['ita', 'ITALY', C.ita, C.ita]]) {
    const y = ROWY[team];
    X.fillStyle = sw; X.fillRect(SB.x + 34, y - 30, 22, 60); X.strokeStyle = C.ink; X.lineWidth = 2; X.strokeRect(SB.x + 34, y - 30, 22, 60);
    inkText(label, SB.x + 74, y + 4, 46, F.sc, col, 'left');
    patchStack(SCORE[team], SCOL, y, 132, 104, t, team === 'fra' ? C.fraI : C.itaP, col, 86, SCOL * 7 + y);
  }
  patchStack(MINUTE, MCOL, (ROWY.fra + ROWY.ita) / 2, 150, 120, t, t > T.red - .2 && t < T.pens - .2 ? C.card : C.ink, C.ink, 70, MCOL * 7);
  texts.push({ id: 'board', text: 'scoreboard', x0: SB.x, y0: SB.y, x1: SB.x + SB.w, y1: SB.y + SB.h, pass: true });
}

// ---------------------------------------------------------------- helpers
const rip = (t, t0) => t > t0 ? Math.exp(-(t - t0) * 4) * Math.sin((t - t0) * 30) : 0;
const cyc = (t, f = 6, a = 'run1', b = 'run2') => POSES[Math.floor(t * f) % 2 ? a : b];
const BERLIN = ['#EEE9DC', '#2F6CC0', '#C8B48A', '#2B3F78', '#C8463A', '#E9DEC4', '#2F6CC0'];
function stage(t, lift, cols) { crowd(0, 0, PW, 300, t, lift, 9, cols || BERLIN); grassBand(0, 300, PW, PH - 300); }
function flight(t, t0, t1, path, r = 16, dash = true) {
  const k = clamp((t - t0) / (t1 - t0), 0, 1); if (dash) dashedArc(path, k); const [bx, by] = bez(path, k); ball(bx, by, r, k * 8); return k;
}
function freeze(on) {
  if (!on) return;
  X.fillStyle = 'rgba(241,232,210,.3)'; X.fillRect(0, 0, PW, PH);
  X.strokeStyle = '#FBF6EA'; X.lineWidth = 18; X.strokeRect(9, 9, PW - 18, PH - 18);
}
// the referee showing a red card: the card sits in his raised right hand (rig hand point)
function refCard(x, y, s, face, raised, t) {
  const M0 = X.getTransform(); const hand = {};
  puppet({ sh: 'ref', x, y, s, face, pose: raised ? POSES.cardup : POSES.stand, head: 'expr1', ground: GROUND, hand });
  if (raised && hand.pt) {
    const hp = M0.inverse().transformPoint(hand.pt);
    X.save(); X.translate(hp.x, hp.y - 10); X.rotate(.08 * face);
    X.shadowColor = 'rgba(43,34,25,.35)'; X.shadowBlur = 4; X.shadowOffsetX = 3; X.shadowOffsetY = 4;
    X.fillStyle = C.card; X.fillRect(-26 * s / .25, -78 * s / .25, 52 * s / .25, 72 * s / .25); X.shadowColor = 'transparent';
    X.strokeStyle = C.ink; X.lineWidth = 3; X.strokeRect(-26 * s / .25, -78 * s / .25, 52 * s / .25, 72 * s / .25);
    X.restore();
  }
}
function trophy(x, y, s) {    // a generic gold cup on a plinth (not the real trophy's design)
  X.save(); X.translate(x, y); X.scale(s, s);
  X.shadowColor = 'rgba(43,34,25,.35)'; X.shadowBlur = 10; X.shadowOffsetX = 6; X.shadowOffsetY = 8;
  X.fillStyle = C.brass; X.strokeStyle = C.ink; X.lineWidth = 5;
  for (const sd of [-1, 1]) { X.beginPath(); X.ellipse(sd * 110, -120, 50, 100, sd * .25, 0, 7); X.lineWidth = 22; X.strokeStyle = C.brass; X.stroke(); X.lineWidth = 4; X.strokeStyle = C.ink; X.beginPath(); X.ellipse(sd * 110, -120, 62, 112, sd * .25, 0, 7); X.stroke(); }
  X.beginPath(); X.moveTo(-100, -260); X.quadraticCurveTo(-110, -20, -40, 30); X.lineTo(-50, 120); X.lineTo(50, 120); X.lineTo(40, 30); X.quadraticCurveTo(110, -20, 100, -260); X.closePath(); X.fill(); X.shadowColor = 'transparent'; X.stroke();
  X.fillStyle = '#E7C66F'; X.beginPath(); X.ellipse(0, -260, 100, 24, 0, 0, 7); X.fill(); X.stroke();
  X.fillStyle = '#3F8F5E'; X.fillRect(-80, 120, 160, 46); X.strokeRect(-80, 120, 160, 46);
  X.fillStyle = 'rgba(255,255,255,.45)'; X.beginPath(); X.ellipse(-50, -140, 12, 66, .1, 0, 7); X.fill();
  X.fillStyle = '#E8DCC0'; X.fillRect(-120, 166, 240, 160); X.strokeStyle = C.ink; X.lineWidth = 5; X.strokeRect(-120, 166, 240, 160);
  X.restore();
}
function bubble(x, y, w, h, k, tailX, text = '…') {   // a speech balloon (no words: we don't know them)
  if (k <= 0) return;
  X.save(); X.translate(x, y); X.scale(ei(clamp(k, 0, 1)), ei(clamp(k, 0, 1)));
  X.fillStyle = '#FBF6EA'; X.strokeStyle = C.ink; X.lineWidth = 4;
  X.beginPath(); X.ellipse(0, 0, w / 2, h / 2, 0, 0, 7); X.fill(); X.stroke();
  X.beginPath(); X.moveTo(tailX - 14, h / 2 - 6); X.lineTo(tailX, h / 2 + 40); X.lineTo(tailX + 18, h / 2 - 8); X.closePath(); X.fill(); X.stroke();
  X.fillStyle = '#FBF6EA'; X.fillRect(tailX - 12, h / 2 - 12, 28, 10);
  inkText(text, 0, 10, 60, F.shout); X.restore();
}

// ---------------------------------------------------------------- scenes
function sceneA(t, texts) {   // hook: #10 in front of the referee; the red card goes up
  stage(t, .2);
  const up = t >= T.card0;
  refCard(300, 486, .24, 1, up, t);
  puppet({ sh: 'fra', x: 640, y: 486, s: .25, face: -1, pose: up ? POSES.despair : POSES.stand, head: up ? 'expr3' : 'expr1', num: '10', ground: GROUND });
  const a = slip(t, T.last, 40, 30, 420, 96, 'LAST GAME', 50, { font: F.shout }); if (a) texts.push({ id: 'last', ...off(a) });
  const b = slip(t, T.final, PW - 470, 120, 430, 96, 'WORLD CUP FINAL', 42, { font: F.num }); if (b) texts.push({ id: 'final', ...off(b) });
  if (up) { const c = slip(t, T.card0 + .1, 40, PH - 230, 400, 110, 'RED CARD', 58, { font: F.shout }); if (c) texts.push({ id: 'red0', ...off(c) }); }
}
function stadiumPlan(t, name, sub) {
  X.fillStyle = '#E8DCC0'; X.fillRect(0, 0, PW, PH);
  X.save(); X.strokeStyle = 'rgba(43,34,25,.45)'; X.lineWidth = 2;
  for (let i = -2; i < 12; i++) { X.beginPath(); X.moveTo(i * 110, 0); X.lineTo(i * 110 + 220, PH); X.stroke(); }
  X.restore();
  X.save(); X.translate(PW / 2, 430); X.rotate(-.1);
  X.fillStyle = '#D9CDB0'; X.beginPath(); X.ellipse(0, 0, 360, 250, 0, 0, 7); X.fill();
  X.strokeStyle = 'rgba(43,34,25,.4)'; X.lineWidth = 1.2; for (let r = 0; r < 8; r++) { X.beginPath(); X.ellipse(0, 0, 360 - r * 10, 250 - r * 10, 0, 0, 7); X.stroke(); }
  X.fillStyle = '#C8B48A'; X.beginPath(); X.ellipse(0, 0, 290, 185, 0, 0, 7); X.fill();   // the running track
  X.fillStyle = C.grass; X.fillRect(-210, -120, 420, 240); X.strokeStyle = '#FBF6EA'; X.lineWidth = 4; X.strokeRect(-195, -108, 390, 216);
  X.beginPath(); X.moveTo(0, -108); X.lineTo(0, 108); X.stroke(); X.beginPath(); X.arc(0, 0, 38, 0, 7); X.stroke();
  X.strokeStyle = C.ink; X.lineWidth = 4; X.beginPath(); X.ellipse(0, 0, 360, 250, 0, 0, 7); X.stroke();
  X.restore();
  inkText(name, PW / 2, 760, 62); inkText(sub, PW / 2, 820, 32, F.num);
}
function dropPin(t, t0, x, y) {
  if (t <= t0 - .5) return;
  const k = clamp((t - (t0 - .5)) / .5, 0, 1); const hgt = (1 - ei(k)) * 260;
  X.save(); X.translate(x, y);
  X.fillStyle = 'rgba(43,34,25,.25)'; X.beginPath(); X.ellipse(lerp(40, 4, k), lerp(30, 3, k), lerp(26, 8, k), lerp(10, 4, k), 0, 0, 7); X.fill();
  X.translate(0, -hgt);
  X.strokeStyle = '#8E8577'; X.lineWidth = 6; X.beginPath(); X.moveTo(0, 0); X.lineTo(0, -70); X.stroke();
  X.fillStyle = C.red; X.beginPath(); X.arc(0, -86, 26, 0, 7); X.fill(); X.strokeStyle = C.ink; X.lineWidth = 3; X.stroke();
  X.fillStyle = 'rgba(255,255,255,.5)'; X.beginPath(); X.arc(-8, -94, 8, 0, 7); X.fill();
  X.restore();
}
function sceneB(t, texts) {
  stadiumPlan(t, 'OLYMPIASTADION', 'BERLIN · 9 JULY 2006');
  texts.push({ id: 'plan', text: 'OLYMPIASTADION', x0: AP.x + 220, y0: AP.y + 730, x1: AP.x + 760, y1: AP.y + 790 });
  dropPin(t, T.pin, PW / 2, 430);
  const s = slip(t, T.vs, 40, 40, 480, 104, 'FRANCE v ITALY', 46, { font: F.num }); if (s) texts.push({ id: 'vs', ...off(s) });
}
// the penalty, side-on along the goal line: post + crossbar in profile, the line on the grass
const GX = 700, BARY = 400;
function goalSide(t, ripple) {
  X.save();
  X.strokeStyle = 'rgba(43,34,25,.5)'; X.lineWidth = 1.4;    // net slanting back
  for (let i = 0; i <= 8; i++) { const k = i / 8; X.beginPath(); X.moveTo(GX + 6, BARY + k * (GROUND - BARY)); X.lineTo(GX + 150 + ripple * 20, lerp(BARY + 40, GROUND, k)); X.stroke(); }
  for (let j = 0; j <= 6; j++) { const k = j / 6; X.beginPath(); X.moveTo(GX + 6 + k * 144, BARY + k * 40); X.lineTo(GX + 6 + k * 144 + ripple * 12 * Math.sin(k * 3), GROUND); X.stroke(); }
  X.strokeStyle = '#FBF6EA'; X.lineWidth = 14; X.lineCap = 'round'; X.beginPath(); X.moveTo(GX, GROUND); X.lineTo(GX, BARY); X.stroke();
  X.strokeStyle = C.ink; X.lineWidth = 3; X.beginPath(); X.moveTo(GX - 8, GROUND); X.lineTo(GX - 8, BARY - 8); X.stroke();
  X.fillStyle = '#FBF6EA'; X.beginPath(); X.arc(GX, BARY, 14, 0, 7); X.fill(); X.strokeStyle = C.ink; X.lineWidth = 3; X.stroke();
  X.restore();
  X.fillStyle = '#FBF6EA'; X.fillRect(GX - 7, GROUND - 4, 14, 12);   // the goal line (end-on)
}
function chipBall(t) {
  if (t < T.chip) return [460, GROUND - 16];
  if (t < T.bar) { const k = (t - T.chip) / (T.bar - T.chip); const p = bez([[460, GROUND - 16], [600, 120], [GX + 16, BARY + 26]], k); dashedArc([[460, GROUND - 16], [600, 120], [GX + 16, BARY + 26]], k); return p; }
  dashedArc([[460, GROUND - 16], [600, 120], [GX + 16, BARY + 26]], 1);
  if (t < T.down) { const k = (t - T.bar) / (T.down - T.bar); return [lerp(GX + 16, GX + 46, k), lerp(BARY + 26, GROUND - 16, k * k)]; }
  const k = clamp((t - T.down) / (T.out - T.down), 0, 1); return [lerp(GX + 46, GX - 120, k), GROUND - 16 - Math.sin(k * Math.PI) * 170];
}
function sceneC(t, texts) {   // 7': the chipped penalty
  stage(t, t > T.line ? 1 : .2);
  goalSide(t, rip(t, T.line));
  const kd = t > T.chip + .1;
  puppet({ sh: 'gkx', x: kd ? GX - 40 : GX - 60, y: kd ? GROUND - 70 : 520, s: .22, face: -1, pose: kd ? POSES.dive : POSES.ready, rot: kd ? -80 : 0, head: kd ? 'expr3' : 'expr1', ground: GROUND });
  const k = clamp((t - T.run) / (T.chip - .1 - T.run), 0, 1);
  const pose = t < T.run ? POSES.stand : t < T.chip - .15 ? cyc(t, 6) : t < T.chip + .3 ? POSES.follow : POSES.stand;
  puppet({ sh: 'fra', x: lerp(100, 350, k), y: 516, s: .24, face: 1, pose, head: t > T.line ? 'expr2' : 'expr1', num: '10', ground: GROUND });
  const [bx, by] = chipBall(t); ball(bx, by, 16, t * 6);
  tag('7′', texts, T.sC + .1, t);
  if (t > T.line - .1) { inkRing(GX + 20, GROUND - 10, 70, 46, T.line, t); const s = slip(t, T.line, PW - 420, 140, 380, 96, 'OVER THE LINE', 42, { font: F.shout }); if (s) texts.push({ id: 'line', ...off(s) }); }
  if (t > T.chip) { const s = slip(t, T.chip + .1, 40, 140, 300, 96, 'A CHIP!', 46, { font: F.shout }); if (s) texts.push({ id: 'chip', ...off(s) }); }
}
function sceneD(t, texts) {   // 19': the header from a corner
  stage(t, t > T.g2 ? 1 : .3);
  goalFrame(PW - 260, 380, 220, 320, rip(t, T.g2));
  const jump = Math.sin(clamp((t - (T.head - .45)) / .9, 0, 1) * Math.PI) * 110;
  puppet({ sh: 'gkg', x: PW - 150, y: 540, s: .2, face: -1, pose: t > T.head + .1 ? POSES.dive : POSES.ready, rot: t > T.head + .1 ? 30 : 0, head: 'expr1', ground: GROUND });
  puppet({ sh: 'fra', x: 420, y: 520, s: .22, face: 1, pose: t > T.head - .4 ? POSES.stretch : POSES.ready, head: 'expr3', ground: GROUND });
  const hx = 560, hy = 500 - jump;
  puppet({ sh: 'ita', x: hx, y: hy, s: .23, face: 1, pose: t > T.head - .5 && t < T.head + .6 ? POSES.header : t > T.g2 ? POSES.cheer : POSES.ready, head: t > T.g2 ? 'expr2' : 'expr1', num: '23', ground: GROUND });
  const headPt = [hx + 18, hy - 190];
  if (t < T.corner) ball(-20, 300, 16);
  else if (t < T.head) flight(t, T.corner, T.head, [[-20, 300], [260, 40], headPt], 16);
  else if (t < T.g2) flight(t, T.head, T.g2, [headPt, [PW - 160, 420], [PW - 110, 620]], 16, false);
  else ball(PW - 110, 640, 16);
  tag('19′', texts, T.sD + .1, t);
  if (t > T.lvl) { const s = slip(t, T.lvl, 40, 140, 260, 110, '1–1', 64, { font: F.num }); if (s) texts.push({ id: 'lvl', ...off(s) }); }
}
// extra time: #10 and #23 side by side; words; #10 walks away, turns, and the headbutt
function sceneE(t, texts) {
  stage(t, .25);
  let zx = 540, zface = 1, zpose = POSES.walk1;
  if (t < T.away) { zx = lerp(400, 540, clamp((t - T.sE) / 2.8, 0, 1)); zpose = t < T.sE + 2.8 ? cyc(t, 3, 'walk1', 'walk2') : POSES.stand; zface = 1; }
  else if (t < T.turn) { zx = lerp(540, 800, clamp((t - T.away) / (T.turn - T.away), 0, 1)); zpose = cyc(t, 3, 'walk1', 'walk2'); zface = 1; }
  else if (t < T.butt - .35) { zx = 800; zface = -1; zpose = POSES.stand; }
  else if (t < T.butt) { zx = lerp(800, 500, (t - (T.butt - .35)) / .35); zface = -1; zpose = cyc(t, 8); }
  else { zx = 500; zface = -1; zpose = POSES.butt; }
  const fallen = t > T.fall;
  const mx = t < T.away ? lerp(160, 320, clamp((t - T.sE) / 2.8, 0, 1)) : 320;
  const mpose = fallen ? POSES.fallb : t < T.sE + 2.8 ? cyc(t + .2, 3, 'walk1', 'walk2') : POSES.stand;
  puppet({ sh: 'ita', x: fallen ? mx - 40 : mx, y: fallen ? 580 : 506, s: .23, face: 1, pose: mpose, rot: fallen ? -62 : 0, head: fallen ? 'expr3' : 'expr1', num: '23', ground: GROUND });
  puppet({ sh: 'fra', x: zx, y: 506, s: .23, face: zface, pose: zpose, head: t > T.turn ? 'expr1' : 'expr1', num: '10', ground: GROUND });
  if (t > T.words && t < T.away + .4) {
    bubble(mx + 20, 160, 180, 120, (t - T.words) / .25, -20);
    bubble(zx + 60, 230, 180, 120, (t - T.words - .5) / .25, -30);
  }
  freeze(t >= T.butt && t < T.sF - .3);
  if (t > T.butt) inkRing(410, 380, 150, 120, T.butt + .1, t);
  tag('108′', texts, T.sE + .1, t, 320);
  if (t > T.butt) { const s = slip(t, T.butt + .1, PW - 440, 140, 400, 104, 'HEADBUTT', 56, { font: F.shout }); if (s) texts.push({ id: 'butt', ...off(s) }); }
}
function sceneF(t, texts) {   // the referee didn't see it (looking up the pitch); the fourth official did (headset line)
  stage(t, .4);
  puppet({ sh: 'ita', x: 280, y: 600, s: .17, face: 1, pose: POSES.fallb, rot: -62, head: 'expr3', ground: GROUND });
  puppet({ sh: 'fra', x: 420, y: 520, s: .17, face: -1, pose: POSES.stand, head: 'expr1', num: '10', ground: GROUND });
  puppet({ sh: 'ref', x: 700, y: 520, s: .2, face: 1, pose: POSES.stand, head: t > T.fourth + .3 ? 'expr3' : 'head', ground: GROUND });
  // the fourth official at the touchline (front), with a headset
  const fx = 140, fy = 330;
  X.fillStyle = '#D9CDB0'; X.fillRect(40, 380, 220, 30); X.strokeStyle = C.ink; X.lineWidth = 3; X.strokeRect(40, 380, 220, 30);
  puppet({ sh: 'ref', x: fx, y: fy, s: .15, face: 1, pose: t > T.fourth ? POSES.point : POSES.stand, head: 'expr1', ground: 400 });
  X.save(); X.strokeStyle = C.ink; X.lineWidth = 5; X.beginPath(); X.arc(fx + 4, fy - 128, 34, Math.PI * 1.05, Math.PI * 1.95); X.stroke(); X.restore();
  if (t > T.fourth) {
    const k = clamp((t - T.fourth) / .6, 0, 1);
    X.save(); X.strokeStyle = C.red; X.lineWidth = 5; X.setLineDash([14, 10]); X.beginPath(); X.moveTo(fx + 30, fy - 130); X.quadraticCurveTo(450, 40, lerp(fx + 30, 700, k), lerp(fy - 130, 330, k)); X.stroke(); X.restore();
  }
  // the referee's eyeline, away from it
  X.save(); X.strokeStyle = 'rgba(43,34,25,.5)'; X.lineWidth = 3; X.setLineDash([8, 8]); X.beginPath(); X.moveTo(740, 360); X.lineTo(PW - 20, 300); X.stroke(); X.restore();
  const a = slip(t, T.sF + .3, PW - 420, PH - 250, 380, 96, "REF: DIDN'T SEE", 38, { font: F.shout }); if (a) texts.push({ id: 'nosee', ...off(a) });
  if (t > T.fourth) { const b = slip(t, T.fourth + .3, 300, 40, 420, 96, '4TH OFFICIAL: SAW', 38, { font: F.shout }); if (b) texts.push({ id: 'saw', ...off(b) }); }
}
function sceneG(t, texts) {   // red card; #10 walks past the trophy and off
  stage(t, .15, ['#B9B0A0', '#9FA6B5', '#C8B48A', '#A9A094']);
  trophy(560, 470, .42);
  if (t < T.walk) {
    refCard(260, 486, .24, 1, true, t);
    puppet({ sh: 'fra', x: 420, y: 500, s: .23, face: -1, pose: POSES.despair, head: 'expr3', num: '10', ground: GROUND });
  } else {
    const k = clamp((t - T.walk) / (T.gone - T.walk), 0, 1);
    puppet({ sh: 'ref', x: 160, y: 486, s: .22, face: 1, pose: POSES.stand, head: 'expr1', ground: GROUND });
    if (k < 1) puppet({ sh: 'fra', x: lerp(380, PW + 120, k), y: 500, s: .23, face: 1, pose: cyc(t, 3, 'walk1', 'walk2'), head: 'expr3', num: '10', ground: GROUND });
  }
  if (t > T.gone - .3) { const s = slip(t, T.gone - .2, 40, 40, 380, 104, 'FOREVER', 56, { font: F.shout }); if (s) texts.push({ id: 'gone', ...off(s) }); }
}
function goldBall(x, y, r) {
  X.save(); X.translate(x, y); X.shadowColor = 'rgba(43,34,25,.35)'; X.shadowBlur = 8; X.shadowOffsetX = 5; X.shadowOffsetY = 6;
  X.fillStyle = '#E2B84C'; X.beginPath(); X.arc(0, 0, r, 0, 7); X.fill(); X.shadowColor = 'transparent'; X.strokeStyle = C.ink; X.lineWidth = 4; X.stroke();
  X.fillStyle = '#B88A2A'; X.beginPath(); for (let i = 0; i < 5; i++) { const a = i * 1.2566 - 1.57; X.lineTo(Math.cos(a) * r * .38, Math.sin(a) * r * .38); } X.fill();
  for (let i = 0; i < 5; i++) { const a = i * 1.2566 - 1.57; X.beginPath(); X.arc(Math.cos(a) * r * .9, Math.sin(a) * r * .9, r * .2, 0, 7); X.fill(); }
  X.fillStyle = 'rgba(255,255,255,.5)'; X.beginPath(); X.ellipse(-r * .4, -r * .45, r * .14, r * .26, .6, 0, 7); X.fill();
  X.restore();
}
function sceneH(t, texts) {   // penalties 5-3; then the best player of the tournament
  stage(t, t < T.gold ? .8 : .5);
  if (t < T.gold) {
    [[200, '1'], [380, '2'], [560, '3'], [740, '4']].forEach(([x], i) => puppet({ sh: 'ita', x, y: 480, s: .2, face: i % 2 ? -1 : 1, pose: Math.floor(t * 4 + i) % 2 ? POSES.cheer : POSES.cheer2, head: 'expr2', ground: GROUND }));
    stampOn(t, T.pens, PW / 2, 160, 'ITALY 5–3 ON PENS', 48, -.06);
    if (t > T.pens) texts.push({ id: 'pens', text: 'ITALY 5–3 ON PENS', x0: AP.x + 140, y0: AP.y + 100, x1: AP.x + PW - 140, y1: AP.y + 220 });
  } else {
    const d = drop(t, T.gold, .3, 61);
    if (d.vis) {
      X.save(); X.translate(PW / 2, 380 + d.y); X.scale(d.s, d.s);
      paperCard(-330, -260, 660, 520, C.cap, d.held, d.rot); X.rotate(d.rot);
      goldBall(0, -60, 120);
      inkText('BEST PLAYER', 0, 130, 48, F.shout); inkText('ZIDANE', 0, 190, 34, F.sc);
      X.restore();
      texts.push({ id: 'gold', text: 'BEST PLAYER ZIDANE', x0: AP.x + PW / 2 - 330, y0: AP.y + 120, x1: AP.x + PW / 2 + 330, y1: AP.y + 640 });
    }
  }
}
function sceneI(t, texts) {   // what was said: the account Materazzi gave later; Zidane never repeated it
  stage(t, .1, ['#B9B0A0', '#9FA6B5', '#C8B48A', '#A9A094']);
  puppet({ sh: 'ita', x: 300, y: 500, s: .23, face: -1, pose: POSES.stand, head: 'expr1', num: '23', ground: GROUND });
  puppet({ sh: 'fra', x: 680, y: 500, s: .23, face: 1, pose: POSES.slump, head: 'expr1', num: '10', ground: GROUND });
  const a = slip(t, T.sI + .1, 40, 40, 560, 150, "MATERAZZI'S LATER ACCOUNT:\nAN INSULT ABOUT HIS SISTER", 32, { font: F.num }); if (a) texts.push({ id: 'acc', ...off(a) });
  if (t > T.never - .3) { bubble(680, 200, 200, 130, (t - T.never) / .25, -20, '…'); stampOn(t, T.never + .2, 680, 360, 'NEVER REPEATED', 40, .08); texts.push({ id: 'never', text: 'NEVER REPEATED', x0: AP.x + 480, y0: AP.y + 310, x1: AP.x + 880, y1: AP.y + 410 }); }
}
function sceneJ(t, texts) {   // the question: the red card | #10 walking off
  const half = PW / 2 - 6;
  X.save(); X.beginPath(); X.rect(0, 0, half, PH); X.clip(); stage(t, .2); refCard(240, 486, .24, 1, true, t); X.restore();
  X.save(); X.beginPath(); X.rect(half + 12, 0, half, PH); X.clip(); X.translate(half + 12, 0);
  stage(t, .2, ['#B9B0A0', '#9FA6B5', '#C8B48A', '#A9A094']); trophy(320, 470, .36);
  puppet({ sh: 'fra', x: 150, y: 500, s: .23, face: 1, pose: POSES.walk1, head: 'expr3', num: '10', ground: GROUND }); X.restore();
  X.fillStyle = C.ink; X.fillRect(half, 0, 12, PH);
  const a = slip(t, T.sJ + .9, 30, 30, 360, 96, 'SEND OFF?', 50, { font: F.shout }); if (a) texts.push({ id: 'off', ...off(a) });
  const b = slip(t, T.sJ + 1.4, half + 40, 30, 380, 96, 'OR NOT?', 50, { font: F.shout }); if (b) texts.push({ id: 'not', ...off(b) });
}

const SCENES = [[0, sceneA], [T.sB, sceneB], [T.sC, sceneC], [T.sD, sceneD], [T.sE, sceneE], [T.sF, sceneF], [T.sG, sceneG], [T.sH, sceneH], [T.sI, sceneI], [T.sJ, sceneJ]];
const NOWHIP = [];

function brandThumb() {           // 1080 x 1920 thumbnail art: the referee's red card up, #10 turning away, the trophy behind
  X.fillStyle = C.table; X.fillRect(0, 0, W, H);
  X.fillStyle = C.paper; X.fillRect(22, 22, W - 44, H - 44);
  const px = 52, py = 470, pw = W - 104, ph = 1000;
  X.save(); X.beginPath(); X.rect(px, py, pw, ph); X.clip(); X.translate(px, py); X.translate(-60, 40); X.scale(1.12, 1.12);
  stage(0, .2); trophy(600, 470, .42); refCard(250, 486, .24, 1, true, 0);
  puppet({ sh: 'fra', x: 430, y: 500, s: .23, face: -1, pose: { lean: 6, h: 12, uL: 40, fL: 14, uR: -40, fR: -14, tL: 3, sL: 0, tR: -3, sR: 0 }, head: 'expr3', num: '10', ground: GROUND });
  X.restore();
  X.strokeStyle = C.ink; X.lineWidth = 8; X.strokeRect(px, py, pw, ph);
  X.globalCompositeOperation = 'multiply'; X.globalAlpha = .5; X.drawImage(TEX, 22, 22, W - 44, H - 44, 22, 22, W - 44, H - 44); X.globalAlpha = 1; X.globalCompositeOperation = 'source-over';
}
