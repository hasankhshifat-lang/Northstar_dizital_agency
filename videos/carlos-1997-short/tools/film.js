// ---------------------------------------------------------------- film: "The Banana Free Kick" - Brazil 1-1 France, Tournoi de France, Stade de Gerland, Lyon, 3 June 1997
// One comic page: the scoreboard pinned on top (score + match minute), the action panel, caption band.
// Brazil = generic plain yellow shirt, blue shorts, white socks (sheet 'bra'); France = generic plain blue shirt, white shorts, red socks ('fra').
// France's keeper = generic green keeper ('gkg', unnumbered); the ball boy = generic grey tracksuit ('boy'). No crests, sponsors or faces.
Object.assign(C, { bra: '#C99A12', braY: '#F2C531', fra: '#23408E', fraP: '#3A57A0', silver: '#C9CCD1' });

const FOOTER = 'Impossible Goals · Part One';
const PUSH = [[T.sC + .4, T.step18, 1.05, 540, 820]];
const SHAKES = [[T.post, 8, .3], [T.g1, 16, .6]];
POSES.duck = { lean: 34, h: 18, uL: 160, fL: 60, uR: -160, fR: -60, tL: 50, sL: -80, tR: -30, sR: 70, dy: 120 };
POSES.walkb1 = { lean: 4, h: 2, uL: 20, fL: 10, uR: -20, fR: -10, tL: 16, sL: 10, tR: -14, sR: 6 };
POSES.walkb2 = { lean: 4, h: 2, uL: -16, fL: -6, uR: 18, fR: 8, tL: -14, sL: 6, tR: 16, sR: 10 };
POSES.hands = { lean: 0, h: -4, uL: 170, fL: 30, uR: -170, fR: -30, tL: 6, sL: 0, tR: -6, sR: 0 };

const EV = [{ t: 0.0, type: 'vo', id: 'narration' }];
const ev = (t, type, o = {}) => EV.push({ t, type, ...o });
ev(0.15, 'kick', { v: .6 }); ev(T.duck0 - .1, 'whoosh'); ev(T.duck0 + .1, 'slip'); ev(T.still0, 'slip');
ev(T.sB - .15, 'whip', { d: .35 }); ev(T.pin - .05, 'pin'); ev(T.vs, 'slip');
ev(T.sC - .15, 'whip', { d: .35 }); ev(T.sC + .3, 'whistle');
for (let i = 0; i < 18; i++) ev(T.walk + i * (T.step18 - T.walk) / 17, 'step', { pan: -.2, v: .5 });
ev(T.step18 + .05, 'slip');
ev(T.sD - .15, 'whip', { d: .35 }); for (let i = 0; i < 7; i++) ev(T.sD + .1 + i * ((T.kick - T.sD - .2) / 7), 'step', { pan: -.1, v: .6 });
ev(T.kick, 'kick', { v: 1.2 }); ev(T.kick + .05, 'whoosh');
ev(T.duck - .2, 'whoosh'); ev(T.duck - .05, 'freeze'); ev(T.duck, 'slap', { v: .3 }); ev(T.duck + .1, 'groan');
ev(T.swerve, 'whoosh'); ev(T.post, 'ding'); ev(T.post, 'slap', { v: .6 }); ev(T.g1, 'net'); ev(T.g1, 'roar', { d: 4, v: 1.3 }); ev(T.g1 + .05, 'bigslap');
ev(T.sE - .15, 'whip', { d: .35 }); ev(T.never, 'slip');
ev(T.sF - .15, 'whip', { d: .35 }); ev(T.fluke, 'stamp'); ev(T.paper, 'slip'); ev(T.spiral, 'scribble', { d: 2.2 });
ev(T.sG - .15, 'whip', { d: .35 }); ev(T.sG + .05, 'slip'); ev(T.sG + .6, 'slip');

// ---------------------------------------------------------------- the scoreboard: score + match minute
const ROWY = { bra: 214, fra: 338 };
const SCOL = 700, MCOL = 890;
const SCORE = { bra: [[-9, '0'], [T.g1, '1']], fra: [[-9, '0']] };
const MINUTE = [[-9, 'KO'], [T.sC + .3, '21′']];
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
    X.font = `bold ${size}px ${F.num}`; X.textAlign = 'center'; X.textBaseline = 'middle';
    X.fillStyle = i === 0 ? inkFirst : C.paper; X.fillText(v, 0, 6);
    X.restore();
  }
}
function scoreboard(t, texts) {
  inkText('TOURNOI DE FRANCE · 3 JUNE 1997', W / 2, SB.y + 40, 30);
  X.strokeStyle = C.ink; X.lineWidth = 1.5; X.beginPath(); X.moveTo(SB.x + 40, SB.y + 64); X.lineTo(SB.x + SB.w - 40, SB.y + 64); X.stroke();
  inkText('Score', SCOL, SB.y + 92, 28); inkText('Minute', MCOL, SB.y + 92, 28);
  for (const [team, label, col, sw] of [['bra', 'BRAZIL', C.bra, C.braY], ['fra', 'FRANCE', C.fra, C.fra]]) {
    const y = ROWY[team];
    X.fillStyle = sw; X.fillRect(SB.x + 34, y - 30, 22, 60); X.strokeStyle = C.ink; X.lineWidth = 2; X.strokeRect(SB.x + 34, y - 30, 22, 60);
    inkText(label, SB.x + 74, y + 4, 46, F.sc, col, 'left');
    patchStack(SCORE[team], SCOL, y, 132, 104, t, team === 'bra' ? '#3E7A4A' : C.fraP, col, 86, SCOL * 7 + y);
  }
  patchStack(MINUTE, MCOL, (ROWY.bra + ROWY.fra) / 2, 150, 120, t, C.ink, C.ink, 70, MCOL * 7);
  if (t > T.g1 && t < T.sE + 1) inkRing(SCOL, ROWY.bra, 86, 62, T.g1 + .3, t);
  texts.push({ id: 'board', text: 'scoreboard', x0: SB.x, y0: SB.y, x1: SB.x + SB.w, y1: SB.y + SB.h, pass: true });
}

// ---------------------------------------------------------------- helpers
const rip = (t, t0) => t > t0 ? Math.exp(-(t - t0) * 4) * Math.sin((t - t0) * 30) : 0;
const cyc = (t, f = 6, a = 'run1', b = 'run2') => POSES[Math.floor(t * f) % 2 ? a : b];
function stage(t, lift, cols) { crowd(0, 0, PW, 300, t, lift, 5, cols || ['#F2C531', '#23408E', '#E9DEC4', '#C8463A', '#3E7A4A', '#E9DEC4']); grassBand(0, 300, PW, PH - 300); }
// catmull-rom through points, k 0..1 by segment
function crPath(P, k) {
  const n = P.length - 1, s = clamp(k, 0, 1) * n, i = Math.min(n - 1, Math.floor(s)), u = s - i;
  const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(n, i + 2)];
  const f = (a, b, c, d) => .5 * ((2 * b) + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
  return [f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])];
}

// ---------------------------------------------------------------- the free kick from above
// the box seen from above: goal at the top, the wall, the free-kick spot far out, the ball boy wide on the right
const FK = { spot: [330, 800], goalL: 390, goalR: 590, goalY: 80 };
const PATH = [[330, 800], [470, 560], [660, 360], [810, 210], [800, 120], [700, 86], [588, 84], [540, 52]];
const K_DUCK = .52, K_POST = 6 / 7, K_NET = 1;
const WALL = [[400, 560], [440, 548], [480, 540], [520, 534]];
function boxPlan(t, lift) {
  X.fillStyle = C.grass; X.fillRect(0, 0, PW, PH);
  X.fillStyle = C.grass2; for (let i = 0; i < PH; i += 120) X.fillRect(0, i, PW, 60);
  X.strokeStyle = '#FBF6EA'; X.lineWidth = 7;
  X.beginPath(); X.moveTo(0, FK.goalY); X.lineTo(PW, FK.goalY); X.stroke();
  X.strokeRect(200, FK.goalY, PW - 400, 330); X.strokeRect(320, FK.goalY, PW - 640, 120);
  X.beginPath(); X.arc(PW / 2, FK.goalY + 330, 100, .5, Math.PI - .5); X.stroke();
  X.fillStyle = '#FBF6EA'; X.beginPath(); X.arc(PW / 2, FK.goalY + 240, 6, 0, 7); X.fill();
  // goal (net box above the line)
  X.fillStyle = 'rgba(43,34,25,.14)'; X.fillRect(FK.goalL, FK.goalY - 46, FK.goalR - FK.goalL, 46);
  X.strokeStyle = 'rgba(43,34,25,.4)'; X.lineWidth = 1; for (let x = FK.goalL; x <= FK.goalR; x += 16) { X.beginPath(); X.moveTo(x, FK.goalY - 46); X.lineTo(x, FK.goalY); X.stroke(); }
  X.strokeStyle = C.ink; X.lineWidth = 6; X.strokeRect(FK.goalL, FK.goalY - 46, FK.goalR - FK.goalL, 46);
  X.fillStyle = '#FBF6EA'; for (const x of [FK.goalL, FK.goalR]) { X.beginPath(); X.arc(x, FK.goalY, 9, 0, 7); X.fill(); X.strokeStyle = C.ink; X.lineWidth = 3; X.stroke(); }
  // boards behind the goal line
  X.fillStyle = '#D9CDB0'; X.fillRect(0, 0, PW, 22); X.strokeStyle = C.ink; X.lineWidth = 3; X.strokeRect(-4, 0, PW + 8, 22);
}
function wall(t) {
  WALL.forEach(([x, y], i) => puppet({ sh: 'fra', x, y, s: .12, face: -1, pose: POSES.stand, head: 'expr1', ground: y + 86 }));
}
// ballK: where the ball is along PATH. duckK: the ball boy ducks when the ball passes him
function freeKickPlan(t, texts, ballK, opts = {}) {
  boxPlan(t);
  const ducking = ballK > K_DUCK - .06;
  // ball boy, crouched by the boards to the right of the goal
  puppet({ sh: 'boy', x: 880, y: 120, s: .1, face: -1, pose: ducking ? POSES.duck : POSES.stand, head: ducking ? 'expr3' : 'expr1', ground: 190 });
  // keeper: on his line, never moves
  puppet({ sh: 'gkg', x: 470, y: 130, s: .12, face: 1, pose: POSES.ready, head: ballK >= K_NET ? 'expr3' : 'expr1', ground: 210 });
  wall(t);
  // the taker, at the spot (or just after the kick)
  if (!opts.noTaker) puppet({ sh: 'bra', x: FK.spot[0] - 50, y: FK.spot[1] - 30, s: .13, face: 1, pose: ballK > 0 ? POSES.follow : POSES.ready, head: 'expr1', num: '6', ground: FK.spot[1] + 60 });
  // dashed path behind the ball
  X.save(); X.strokeStyle = C.ink; X.lineWidth = 4; X.setLineDash([14, 10]); X.lineCap = 'round'; X.beginPath();
  for (let u = 0; u <= ballK; u += .01) { const [x, y] = crPath(PATH, u); u ? X.lineTo(x, y) : X.moveTo(x, y); } X.stroke(); X.restore();
  const [bx, by] = crPath(PATH, ballK);
  ball(bx, by, 14, ballK * 30);
  return [bx, by];
}
function freeze(on) {
  if (!on) return;
  X.fillStyle = 'rgba(241,232,210,.3)'; X.fillRect(0, 0, PW, PH);
  X.strokeStyle = '#FBF6EA'; X.lineWidth = 18; X.strokeRect(9, 9, PW - 18, PH - 18);
}

// ---------------------------------------------------------------- scenes
function sceneA(t, texts) {   // hook: the kick from above; the ball boy ducks (freeze); the keeper hasn't moved
  const k = Math.min(K_DUCK, clamp(t / T.duck0, 0, 1) * K_DUCK);
  freeKickPlan(t, texts, k);
  freeze(t >= T.duck0);
  if (t >= T.duck0) inkRing(880, 120, 80, 90, T.duck0, t);
  if (t >= T.still0) inkRing(470, 140, 70, 90, T.still0, t);
  const a = slip(t, T.duck0 + .1, PW - 430, 230, 400, 96, 'BALL BOY DUCKS', 40, { font: F.shout }); if (a) texts.push({ id: 'duck', ...off(a) });
  const b = slip(t, T.still0, 40, 300, 420, 96, 'KEEPER: STILL', 40, { font: F.shout }); if (b) texts.push({ id: 'still', ...off(b) });
}
function stadiumPlan(t, name, sub) {
  X.fillStyle = '#E8DCC0'; X.fillRect(0, 0, PW, PH);
  X.save(); X.strokeStyle = 'rgba(43,34,25,.45)'; X.lineWidth = 2;
  for (let i = -2; i < 12; i++) { X.beginPath(); X.moveTo(i * 110, 0); X.lineTo(i * 110 + 220, PH); X.stroke(); }
  X.restore();
  X.save(); X.translate(PW / 2, 430); X.rotate(-.12);
  X.fillStyle = '#D9CDB0'; X.beginPath(); X.roundRect(-340, -240, 680, 480, 60); X.fill();
  X.strokeStyle = 'rgba(43,34,25,.4)'; X.lineWidth = 1.2; for (let r = 0; r < 8; r++) { X.beginPath(); X.roundRect(-340 + r * 10, -240 + r * 10, 680 - r * 20, 480 - r * 20, 60 - r * 5); X.stroke(); }
  X.fillStyle = C.grass; X.fillRect(-220, -130, 440, 260); X.strokeStyle = '#FBF6EA'; X.lineWidth = 4; X.strokeRect(-205, -118, 410, 236);
  X.beginPath(); X.moveTo(0, -118); X.lineTo(0, 118); X.stroke(); X.beginPath(); X.arc(0, 0, 40, 0, 7); X.stroke();
  X.strokeStyle = C.ink; X.lineWidth = 4; X.beginPath(); X.roundRect(-340, -240, 680, 480, 60); X.stroke();
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
  stadiumPlan(t, 'STADE DE GERLAND', 'LYON · 3 JUNE 1997');
  texts.push({ id: 'plan', text: 'STADE DE GERLAND', x0: AP.x + 200, y0: AP.y + 730, x1: AP.x + 780, y1: AP.y + 790 });
  dropPin(t, T.pin, PW / 2, 430);
  const s = slip(t, T.vs, 40, 40, 520, 104, 'BRAZIL v FRANCE', 46, { font: F.num }); if (s) texts.push({ id: 'vs', ...off(s) });
}
// side-on: the ball on the grass; #6 walks backwards away from it, counting steps; the wall and goal far right
function sideSetup(t, texts, steps) {
  stage(t, .2);
  goalFrame(PW - 120, 470, 100, 200, 0);
  [0, 1, 2, 3].forEach(i => puppet({ sh: 'fra', x: 660 + i * 46, y: 560, s: .12, face: -1, pose: i % 2 ? POSES.stand : POSES.slump, head: 'expr1', ground: 640 }));
  puppet({ sh: 'gkg', x: PW - 70, y: 560, s: .11, face: -1, pose: POSES.ready, head: 'expr1', ground: 640 });
  ball(480, 682, 16);
  const x = 420 - steps * 18;
  const walking = steps > 0 && steps < 18 && t < T.step18;
  puppet({ sh: 'bra', x, y: 520, s: .22, face: 1, pose: walking ? cyc(t, 3.5, 'walkb1', 'walkb2') : POSES.stand, head: 'expr1', num: '6', ground: GROUND });
}
function sceneC(t, texts) {   // 21': the free kick, 18 steps back
  const steps = Math.round(clamp((t - T.walk) / (T.step18 - T.walk), 0, 1) * 17) + (t >= T.walk ? 1 : 0);
  sideSetup(t, texts, steps);
  tag('21′', texts, T.sC + .1, t);
  if (t > T.walk) {
    X.save(); X.translate(PW - 230, 120); paperCard(-110, -70, 220, 140, C.paper, 0, .03); X.rotate(.03);
    inkText(String(steps), 0, 0, 84, F.num); inkText('STEPS', 0, 52, 24, F.sc); X.restore();
    texts.push({ id: 'steps', pass: true, text: String(steps) + ' STEPS', x0: AP.x + PW - 340, y0: AP.y + 50, x1: AP.x + PW - 120, y1: AP.y + 190 });
  }
  const s = slip(t, T.dist, 40, 170, 520, 96, 'ALMOST 40 YARDS', 44, { font: F.num }); if (s) texts.push({ id: 'dist', ...off(s) });
}
function sceneD(t, texts) {   // the strike: run-up and contact, side-on (close)
  stage(t, .3);
  const k = clamp((t - T.sD) / (T.kick - T.sD - .15), 0, 1);
  const bx = 560, by = 682;
  const x = lerp(80, bx - 120, k);
  const pose = t < T.kick - .15 ? cyc(t, 7) : t < T.kick ? POSES.windup : POSES.strike;
  puppet({ sh: 'bra', x, y: 516, s: .26, face: 1, pose, head: t > T.kick ? 'expr1' : 'expr1', num: '6', ground: GROUND });
  if (t < T.kick) ball(bx, by, 18);
  else {
    const f = clamp((t - T.kick) / .35, 0, 1);
    const bxx = lerp(bx, PW + 60, f), byy = lerp(by, 420, f);
    if (f < 1) ball(bxx, byy, 18, f * 20);
    // spin arrows round the departing ball
    X.save(); X.strokeStyle = C.red; X.lineWidth = 5; X.beginPath(); X.arc(bx + 10, by - 10, 44, -2.6, .2); X.stroke();
    X.fillStyle = C.red; X.beginPath(); X.moveTo(bx + 54, by - 4); X.lineTo(bx + 40, by + 12); X.lineTo(bx + 62, by + 14); X.fill(); X.restore();
    speedLines(T.kick, t, 0, 300, PW, 300);
  }
  const s = slip(t, T.sD + .4, 60, 40, 540, 96, 'OUTSIDE OF THE LEFT FOOT', 34, { font: F.num }); if (s) texts.push({ id: 'foot', ...off(s) });
}
function sceneD2(t, texts) {  // from above: past the wall, wide, the ball boy ducks; then the swerve, the post, the net
  let k;
  if (t < T.duck) k = lerp(.05, K_DUCK, clamp((t - T.sD2) / (T.duck - T.sD2), 0, 1));
  else if (t < T.swerve) k = K_DUCK;                       // held: frozen on the duck
  else if (t < T.post) k = lerp(K_DUCK, K_POST, clamp((t - T.swerve) / (T.post - T.swerve), 0, 1));
  else k = lerp(K_POST, K_NET, clamp((t - T.post) / (T.g1 - T.post), 0, 1));
  const [bx, by] = freeKickPlan(t, texts, k, { noTaker: false });
  freeze(t >= T.duck && t < T.swerve);
  if (t >= T.duck && t < T.swerve) inkRing(880, 120, 80, 90, T.duck, t);
  if (t >= T.post - .05 && t < T.g1 + .6) inkRing(FK.goalR, FK.goalY, 34, 34, T.post, t);
  if (t < T.swerve) { const a = slip(t, T.wide, PW - 400, 300, 360, 90, 'SO WIDE…', 40, { font: F.shout }); if (a) texts.push({ id: 'wide', ...off(a) }); }
  if (t > T.post) { const b = slip(t, T.post, 40, 300, 360, 96, 'OFF THE POST!', 42, { font: F.shout }); if (b) texts.push({ id: 'post', ...off(b) }); }
  if (t > T.g1) { const c = slip(t, T.g1, 40, 420, 260, 110, '1–0', 64, { font: F.num }); if (c) texts.push({ id: 'g1', ...off(c) }); }
}
function sceneE(t, texts) {   // the keeper, side-on: rooted to the spot, the ball already in the net behind him
  stage(t, .9);
  goalFrame(PW - 420, 380, 360, 320, rip(t, T.sE - 1));
  ball(PW - 110, 670, 18);
  puppet({ sh: 'gkg', x: PW - 300, y: 520, s: .24, face: -1, pose: POSES.ready, head: 'expr3', ground: GROUND });
  puppet({ sh: 'bra', x: 220, y: 500, s: .22, face: 1, pose: Math.floor(t * 4) % 2 ? POSES.cheer : POSES.cheer2, head: 'expr2', num: '6', ground: GROUND });
  if (t > T.never) { inkRing(PW - 300, 560, 120, 190, T.never, t); stampOn(t, T.never + .1, PW - 300, 260, 'NEVER MOVED', 50); texts.push({ id: 'never', text: 'NEVER MOVED', x0: AP.x + PW - 520, y0: AP.y + 200, x1: AP.x + PW - 80, y1: AP.y + 320 }); }
}
// the spiral: a ball curling more and more as it slows
function spiral(cx, cy, k, sc = 1) {
  X.save(); X.translate(cx, cy); X.scale(sc, sc);
  X.strokeStyle = C.ink; X.lineWidth = 5; X.setLineDash([16, 10]); X.lineCap = 'round'; X.beginPath();
  const N = 220; let last = [0, 0];
  for (let i = 0; i <= N * k; i++) { const u = i / N; const th = u * 9.5; const r = 330 * Math.exp(-u * 2.4);
    const x = -330 + 330 + r * Math.cos(th + Math.PI) + 0, y = r * Math.sin(th + Math.PI) * .7; i ? X.lineTo(x, y) : X.moveTo(x, y); last = [x, y]; }
  X.stroke(); X.setLineDash([]);
  if (k > 0) ball(last[0], last[1], 16, k * 30);
  X.restore();
}
function sceneF(t, texts) {   // the science: FLUKE? stamped, then crossed by the paper and the spiral
  X.fillStyle = '#E8DCC0'; X.fillRect(0, 0, PW, PH);
  X.save(); X.strokeStyle = 'rgba(43,34,25,.2)'; X.lineWidth = 1.5; for (let y = 40; y < PH; y += 44) { X.beginPath(); X.moveTo(0, y); X.lineTo(PW, y); X.stroke(); } X.restore();
  const k = clamp((t - T.spiral) / 3.2, 0, 1);
  spiral(PW / 2 - 60, 470, k, 1.45);
  if (t > T.fluke - .3) { stampOn(t, T.fluke, 260, 130, 'FLUKE?', 70, -.12); texts.push({ id: 'fluke', text: 'FLUKE?', x0: AP.x + 100, y0: AP.y + 60, x1: AP.x + 420, y1: AP.y + 200 }); }
  if (t > T.paper) {
    // strike-through across FLUKE?
    const sk = clamp((t - T.paper) / .4, 0, 1);
    X.save(); X.strokeStyle = C.ink; X.lineWidth = 9; X.lineCap = 'round'; X.beginPath(); X.moveTo(110, 160); X.lineTo(lerp(110, 420, sk), lerp(160, 100, sk)); X.stroke(); X.restore();
    const d = drop(t, T.paper, .3, 77);
    if (d.vis) {
      X.save(); X.translate(PW - 300, 140 + d.y); X.scale(d.s, d.s);
      paperCard(-250, -80, 500, 160, C.cap, d.held, d.rot); X.rotate(d.rot);
      inkText('THE SPINNING BALL SPIRAL', 0, -22, 34, F.shout); inkText('NEW JOURNAL OF PHYSICS · 2010', 0, 30, 24, F.sc);
      X.restore();
      texts.push({ id: 'paper', text: 'THE SPINNING BALL SPIRAL NEW JOURNAL OF PHYSICS · 2010', x0: AP.x + PW - 550, y0: AP.y + 60, x1: AP.x + PW - 50, y1: AP.y + 220 });
    }
  }
  if (k > .4) { const s = slip(t, T.spiral + 1.4, 40, PH - 170, 560, 110, 'HARD + FAR = SPIRAL', 44, { font: F.shout }); if (s) texts.push({ id: 'hf', ...off(s) }); }
}
function sceneG(t, texts) {   // the question: the path from above | the spiral
  const half = PW / 2 - 6;
  X.save(); X.beginPath(); X.rect(0, 0, half, PH); X.clip(); X.translate(-210, 10); X.scale(.95, .95);
  freeKickPlan(t, [], 1); X.restore();
  X.save(); X.beginPath(); X.rect(half + 12, 0, half, PH); X.clip();
  X.fillStyle = '#E8DCC0'; X.fillRect(half + 12, 0, half, PH);
  spiral(half + 12 + half / 2, 480, 1, .62); X.restore();
  X.fillStyle = C.ink; X.fillRect(half, 0, 12, PH);
  const a = slip(t, T.sG + .05, 30, 30, 300, 96, 'LUCK?', 54, { font: F.shout }); if (a) texts.push({ id: 'luck', ...off(a) });
  const b = slip(t, T.sG + .6, half + 40, 30, 360, 96, 'PHYSICS?', 54, { font: F.shout }); if (b) texts.push({ id: 'phys', ...off(b) });
}

const SCENES = [[0, sceneA], [T.sB, sceneB], [T.sC, sceneC], [T.sD, sceneD], [T.sD2, sceneD2], [T.sE, sceneE], [T.sF, sceneF], [T.sG, sceneG]];
const NOWHIP = [T.sD2];

function brandThumb() {           // 1080 x 1920 thumbnail art: the bending path from above, the ball boy ducking
  X.fillStyle = C.table; X.fillRect(0, 0, W, H);
  X.fillStyle = C.paper; X.fillRect(22, 22, W - 44, H - 44);
  const px = 52, py = 470, pw = W - 104, ph = 1000;
  X.save(); X.beginPath(); X.rect(px, py, pw, ph); X.clip(); X.translate(px, py); X.translate(-120, 30); X.scale(1.08, 1.08);
  freeKickPlan(0, [], K_DUCK + .04, { noTaker: true });
  inkRing(880, 120, 90, 100, -1, 1);
  puppet({ sh: 'bra', x: 330, y: 700, s: .3, face: 1, pose: POSES.follow, head: 'expr1', num: '6' });
  X.restore();
  X.strokeStyle = C.ink; X.lineWidth = 8; X.strokeRect(px, py, pw, ph);
  X.globalCompositeOperation = 'multiply'; X.globalAlpha = .5; X.drawImage(TEX, 22, 22, W - 44, H - 44, 22, 22, W - 44, H - 44); X.globalAlpha = 1; X.globalCompositeOperation = 'source-over';
}
