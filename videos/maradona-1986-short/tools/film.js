// ---------------------------------------------------------------- film: "Four Minutes" - Argentina 2-1 England, World Cup quarter-final, Estadio Azteca, Mexico City, 22 June 1986
// One comic page: the scoreboard pinned on top (score + match minute), the action panel, caption band.
// Argentina = generic plain blue shirt, dark shorts (sheet 'arg', they wore blue that day); England = generic white shirt, navy shorts ('eng').
// Keeper 'gk' (England, generic yellow), referee 'ref'. No crests, sponsors or faces; players are numbered puppets.
Object.assign(C, { arg: '#2F55A4', argP: '#3D63B0', eng: '#2C3D72', engW: '#EEE7D6', silver: '#C9CCD1' });

const FOOTER = 'Moments That Made Legends · Part One';
const PUSH = [[T.sC + .6, T.hand, 1.06, 640, 660]];
const SHAKES = [[T.g1, 10, .4], [T.g2, 22, .7]];
POSES.punch = { lean: -6, h: -10, uL: 30, fL: 20, uR: -168, fR: -8, tL: 30, sL: 40, tR: -20, sR: 30 };
POSES.reach = { lean: 4, h: -8, uL: 150, fL: 10, uR: -150, fR: -10, tL: 10, sL: 20, tR: -10, sR: 20 };
POSES.fall = { lean: 30, h: 20, uL: 120, fL: 40, uR: -60, fR: -30, tL: 30, sL: 20, tR: -40, sR: 10 };

const EV = [{ t: 0.0, type: 'vo', id: 'narration' }];
const ev = (t, type, o = {}) => EV.push({ t, type, ...o });
ev(0.3, 'slip'); ev(T.hookR, 'whoosh'); ev(T.hookS, 'slip');
ev(T.sB - .15, 'whip', { d: .35 }); ev(T.pin - .05, 'pin'); ev(T.qf, 'slip');
ev(T.sC - .15, 'whip', { d: .35 }); ev(T.loop, 'kick', { v: .4 }); ev(T.hand - .25, 'freeze'); ev(T.hand, 'slap', { v: .5 }); ev(T.ringH, 'scribble', { d: .45 });
ev(T.g1, 'net'); ev(T.g1, 'roar', { d: 2.2, v: .7 });
ev(T.sD - .15, 'whip', { d: .35 }); ev(T.sD + .3, 'whistle'); ev(T.sD + .6, 'groan'); ev(T.quote, 'slip');
ev(T.sE - .15, 'whip', { d: .35 }); ev(T.turn, 'whoosh');
for (let i = 0; i < 18; i++) ev(T.run + i * ((T.g2 - .4 - T.run) / 18), 'step', { pan: .3 + (i % 2) * .2, v: .5 });
for (const k of ['p1', 'p2', 'p3', 'pk']) ev(T[k], 'slap', { v: .3 });
ev(T.g2 - .3, 'kick', { v: .6 }); ev(T.g2, 'net'); ev(T.g2, 'roar', { d: 5, v: 1.4 }); ev(T.g2 + .05, 'bigslap'); ev(T.g2 + .2, 'slip'); ev(T.poll, 'slip');
ev(T.sF - .15, 'whip', { d: .35 }); ev(T.sF + .05, 'slip'); ev(T.champ, 'slip'); for (let i = 0; i < 6; i++) ev(T.champ + .1 + i * .42, 'hop', { i });
ev(T.sG - .15, 'whip', { d: .35 }); ev(T.sG + .05, 'slip');

// ---------------------------------------------------------------- the scoreboard: score + match minute
const ROWY = { arg: 214, eng: 338 };
const SCOL = 700, MCOL = 890;
const SCORE = { arg: [[-9, '0'], [T.g1, '1'], [T.g2, '2']], eng: [[-9, '0'], [T.lin, '1']] };
const MINUTE = [[-9, 'KO'], [T.sC + .3, '51′'], [T.sE + .3, '55′'], [T.lin - .4, '81′'], [T.champ - .2, 'FT']];
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
  inkText('WORLD CUP QUARTER-FINAL · 22 JUNE 1986', W / 2, SB.y + 40, 30);
  X.strokeStyle = C.ink; X.lineWidth = 1.5; X.beginPath(); X.moveTo(SB.x + 40, SB.y + 64); X.lineTo(SB.x + SB.w - 40, SB.y + 64); X.stroke();
  inkText('Score', SCOL, SB.y + 92, 28); inkText('Minute', MCOL, SB.y + 92, 28);
  for (const [team, label, col] of [['arg', 'ARGENTINA', C.arg], ['eng', 'ENGLAND', C.eng]]) {
    const y = ROWY[team];
    X.fillStyle = team === 'arg' ? C.arg : C.engW; X.fillRect(SB.x + 34, y - 30, 22, 60); X.strokeStyle = C.ink; X.lineWidth = 2; X.strokeRect(SB.x + 34, y - 30, 22, 60);
    inkText(label, SB.x + 74, y + 4, 46, F.sc, col, 'left');
    patchStack(SCORE[team], SCOL, y, 132, 104, t, team === 'arg' ? C.argP : C.eng, col, 86, SCOL * 7 + y);
  }
  patchStack(MINUTE, MCOL, (ROWY.arg + ROWY.eng) / 2, 150, 120, t, C.ink, C.ink, 70, MCOL * 7);
  if (t > T.g2 && t < T.sF) inkRing(SCOL, ROWY.arg, 86, 62, T.g2 + .3, t);
  texts.push({ id: 'board', text: 'scoreboard', x0: SB.x, y0: SB.y, x1: SB.x + SB.w, y1: SB.y + SB.h, pass: true });
}

// ---------------------------------------------------------------- panel scenes
const AZTECA = ['#E9DEC4', '#2F55A4', '#C8B48A', '#E9DEC4', '#C8463A', '#3F8F5E', '#E9DEC4'];
function stage(t, lift, cols) { crowd(0, 0, PW, 300, t, lift, 3, cols || AZTECA); grassBand(0, 300, PW, PH - 300); }
const rip = (t, t0) => t > t0 ? Math.exp(-(t - t0) * 4) * Math.sin((t - t0) * 30) : 0;
function flight(t, t0, t1, path, r = 16, dash = true) {
  const k = clamp((t - t0) / (t1 - t0), 0, 1); if (dash) dashedArc(path, k); const [bx, by] = bez(path, k); ball(bx, by, r, k * 8); return k;
}
const cyc = (t, f = 6, a = 'run1', b = 'run2') => POSES[Math.floor(t * f) % 2 ? a : b];

// the handball, side-on: the ball loops in from the left; #10 and the keeper jump; #10's raised fist meets it
const HB = { mx: 560, my: 430, kx: 760, ky: 440 };
let HANDPT = null;
function handball(t0, texts, th, opts = {}) {
  const hold = opts.hold || 0;   // freeze-frame length at contact
  const t = opts.still ? th - .05 : (t0 < th ? t0 : t0 < th + hold ? th - .01 : t0 - hold);
  stage(t0, t > th + .3 ? clamp(1 - (t - th - .3) / 2, 0, 1) * .8 : 0);
  goalFrame(PW - 200, 360, 180, 320, rip(t, th + .3));
  const jump = k => Math.sin(clamp(k, 0, 1) * Math.PI) * 120;
  const jk = (t - (th - .55)) / .9;
  const frozen = !opts.still && t0 > th - .25 && t0 < th + hold;
  // keeper #1 reaching, a fraction late
  puppet({ sh: 'gk', x: HB.kx, y: HB.ky - jump(jk - .1) * .8, s: .24, face: -1, pose: poseAt([[0, 'ready'], [th - .4, 'ready'], [th - .1, 'reach']], t), head: t > th ? 'expr3' : 'expr1', num: '1', ground: GROUND });
  const M0 = X.getTransform(); const hand = {};
  puppet({ sh: 'arg', x: HB.mx, y: HB.my - jump(jk), s: .25, face: 1, pose: poseAt([[0, 'ready'], [th - .5, 'ready'], [th - .2, 'punch'], [th + .5, 'punch'], [th + .9, 'cheer']], t), head: t > th ? 'expr2' : 'expr1', num: '10', ground: GROUND, hand });
  const hp = M0.inverse().transformPoint(hand.pt);
  if (opts.still) HANDPT = [hp.x, hp.y];
  else if (t > th - .3 && t < th + .05) HANDPT = [hp.x, hp.y];
  const contact = HANDPT || [HB.mx + 40, HB.my - 260];
  const top = [contact[0] + 4, contact[1] - 22];
  if (opts.still) ball(top[0], top[1], 17, .4);
  else if (t < th) { if (t > T.loop) flight(t, T.loop, th, [[60, 380], [300, 40], top], 17); else ball(60, 380, 17); }
  else flight(t, th, th + .3, [top, [PW - 120, contact[1] - 40], [PW - 110, 520]], 17, false);
  if (frozen) {
    X.fillStyle = 'rgba(241,232,210,.3)'; X.fillRect(0, 0, PW, PH);
    X.strokeStyle = '#FBF6EA'; X.lineWidth = 18; X.strokeRect(9, 9, PW - 18, PH - 18);
  }
  return contact;
}
// the run, from above: a long pitch scrolling up; #10 weaves past three white shirts and round the keeper
const RUN = [[520, 1180], [430, 1000], [560, 820], [430, 620], [600, 440], [560, 260], [400, 170], [470, 120]];
const EN = [[610, 960, 'p1'], [380, 760, 'p2'], [630, 560, 'p3']];
function runPos(k) {      // position along the polyline, k 0..1
  const L = []; let tot = 0; for (let i = 1; i < RUN.length; i++) { const d = Math.hypot(RUN[i][0] - RUN[i - 1][0], RUN[i][1] - RUN[i - 1][1]); L.push(d); tot += d; }
  let s = k * tot; for (let i = 0; i < L.length; i++) { if (s <= L[i]) { const u = s / L[i]; return [lerp(RUN[i][0], RUN[i + 1][0], u), lerp(RUN[i][1], RUN[i + 1][1], u)]; } s -= L[i]; }
  return RUN[RUN.length - 1];
}
function pitchLong(t, scroll) {
  X.save(); X.translate(0, -scroll);
  X.fillStyle = C.grass; X.fillRect(0, -100, PW, 1500);
  X.fillStyle = C.grass2; for (let i = -100; i < 1400; i += 110) X.fillRect(0, i, PW, 55);
  X.strokeStyle = '#FBF6EA'; X.lineWidth = 8;
  X.strokeRect(60, 60, PW - 120, 1500);
  X.strokeRect(220, 60, PW - 440, 260); X.strokeRect(360, 60, PW - 720, 100);
  X.beginPath(); X.arc(PW / 2, 320, 100, .4, Math.PI - .4); X.stroke();
  X.beginPath(); X.moveTo(60, 1100); X.lineTo(PW - 60, 1100); X.stroke(); X.beginPath(); X.arc(PW / 2, 1100, 130, 0, 7); X.stroke();
  X.fillStyle = 'rgba(43,34,25,.15)'; X.fillRect(PW / 2 - 110, 20, 220, 40); X.strokeStyle = C.ink; X.lineWidth = 6; X.strokeRect(PW / 2 - 110, 20, 220, 40);
  X.lineWidth = 1; for (let i = 0; i < 11; i++) { X.beginPath(); X.moveTo(PW / 2 - 110 + i * 20, 20); X.lineTo(PW / 2 - 110 + i * 20, 60); X.stroke(); }
  inkText('HALFWAY', 150, 1130, 26, F.sc, 'rgba(43,34,25,.55)', 'left');
  X.restore();
}
function theRun(t, texts, opts = {}) {
  const k = opts.k !== undefined ? opts.k : clamp((t - T.run) / (T.g2 - .35 - T.run), 0, 1);
  const [mx, my] = runPos(k);
  const scroll = opts.scroll !== undefined ? opts.scroll : clamp(my - 650, 0, 560);
  pitchLong(t, scroll);
  X.save(); X.translate(0, -scroll);
  // trail: the dotted path behind him
  X.save(); X.strokeStyle = C.ink; X.lineWidth = 4; X.setLineDash([12, 10]); X.beginPath();
  for (let u = 0; u <= k; u += .01) { const [x, y] = runPos(u); u ? X.lineTo(x + 30, y + 70) : X.moveTo(x + 30, y + 70); } X.stroke(); X.restore();
  // England players: beaten one after another (they turn and stumble as he goes past)
  EN.forEach(([x, y, key], i) => {
    const past = my < y + 10;
    puppet({ sh: 'eng', x, y, s: .13, face: past ? 1 : -1, pose: past ? POSES.fall : POSES.ready, rot: past ? 18 : 0, head: past ? 'expr3' : 'expr1', ground: y + 90 });
  });
  const kpast = k > .9;
  puppet({ sh: 'gk', x: 540, y: 190, s: .13, face: -1, pose: kpast ? POSES.dive : POSES.ready, rot: kpast ? 40 : 0, head: kpast ? 'expr3' : 'expr1', num: '1', ground: 280 });
  const dr = opts.k !== undefined ? POSES.dribble1 : cyc(t, 7, 'dribble1', 'dribble2');
  puppet({ sh: 'arg', x: mx, y: my, s: .14, face: k > .9 ? 1 : -1, pose: k >= 1 ? POSES.cheer : dr, head: 'expr1', num: '10', ground: my + 96 });
  if (k < 1) ball(mx + 30, my + 70, 11, t * 9);
  else { const g = clamp((t - (T.g2 - .35)) / .35, 0, 1); ball(lerp(500, PW / 2 + 40, g), lerp(190, 40, g), 11, g * 8); }
  X.restore();
}
function sceneA(t, texts) {   // hook: two panels, four minutes apart - the fist (51') and the run (55')
  const half = PW / 2 - 6;
  X.save(); X.beginPath(); X.rect(0, 0, half, PH); X.clip(); X.translate(-300, 0);
  handball(t, texts, 99, { still: true });
  if (HANDPT) inkRing(HANDPT[0], HANDPT[1] - 10, 60, 60, .5, t);
  X.restore();
  X.save(); X.beginPath(); X.rect(half + 12, 0, half, PH); X.clip(); X.translate(half + 12 - 160, 60); X.scale(.85, .85);
  theRun(t, texts, { k: clamp((t - T.hookR) / 2.4, 0, .97), scroll: 300 });
  X.restore();
  X.fillStyle = C.ink; X.fillRect(half, 0, 12, PH);
  const a = slip(t, .3, 30, 30, 200, 84, '51′', 46, { font: F.num }); if (a) texts.push({ id: 'h51', ...off(a) });
  const b = slip(t, T.hookR, half + 40, 30, 200, 84, '55′', 46, { font: F.num }); if (b) texts.push({ id: 'h55', ...off(b) });
  const s = slip(t, T.hookS, 40, PH - 250, PW - 80, 108, '4 MINUTES APART', 56, { font: F.shout }); if (s) texts.push({ id: 'hook', ...off(s) });
}
function stadiumPlan(t, name, sub) {
  X.fillStyle = '#E8DCC0'; X.fillRect(0, 0, PW, PH);
  X.save(); X.strokeStyle = 'rgba(43,34,25,.45)'; X.lineWidth = 2;
  for (let i = -2; i < 12; i++) { X.beginPath(); X.moveTo(i * 110, 0); X.lineTo(i * 110 + 220, PH); X.stroke(); }
  X.restore();
  X.save(); X.translate(PW / 2, 430); X.rotate(-.12);
  X.fillStyle = '#D9CDB0'; X.beginPath(); X.roundRect(-340, -240, 680, 480, 180); X.fill();
  X.strokeStyle = 'rgba(43,34,25,.4)'; X.lineWidth = 1.2; for (let r = 0; r < 8; r++) { X.beginPath(); X.roundRect(-340 + r * 10, -240 + r * 10, 680 - r * 20, 480 - r * 20, 180 - r * 10); X.stroke(); }
  X.fillStyle = C.grass; X.fillRect(-220, -130, 440, 260); X.strokeStyle = '#FBF6EA'; X.lineWidth = 4; X.strokeRect(-205, -118, 410, 236);
  X.beginPath(); X.moveTo(0, -118); X.lineTo(0, 118); X.stroke(); X.beginPath(); X.arc(0, 0, 40, 0, 7); X.stroke();
  X.strokeStyle = C.ink; X.lineWidth = 4; X.beginPath(); X.roundRect(-340, -240, 680, 480, 180); X.stroke();
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
  stadiumPlan(t, 'ESTADIO AZTECA', 'MEXICO CITY · 22 JUNE 1986');
  texts.push({ id: 'plan', text: 'ESTADIO AZTECA', x0: AP.x + 230, y0: AP.y + 730, x1: AP.x + 750, y1: AP.y + 790 });
  dropPin(t, T.pin, PW / 2, 430);
  const s = slip(t, T.qf, 40, 40, 560, 104, 'QUARTER-FINAL', 48, { font: F.num }); if (s) texts.push({ id: 'qf', ...off(s) });
}
function sceneC(t, texts) {   // 51': the fist
  const c = handball(t, texts, T.hand, { hold: T.g1 - .3 - T.hand });
  if (t > T.ringH && t < T.g1 - .3) inkRing(c[0], c[1] - 10, 60, 60, T.ringH, t);
  tag('51′', texts, T.sC + .1, t);
  if (t > T.ringH - .1) { const s = slip(t, T.ringH, 40, PH - 250, 380, 100, 'HAND!', 60, { font: F.shout }); if (s) texts.push({ id: 'hand', ...off(s) }); }
}
function sceneD(t, texts) {   // the goal stands: the referee points to the centre, England protest; the quote card
  stage(t, .3);
  puppet({ sh: 'ref', x: 260, y: 480, s: .25, face: -1, pose: POSES.point, head: t < T.sD + .8 ? 'expr2' : 'head', ground: GROUND, whistle: t < T.sD + .8 });
  [[560, 'eng', 1], [760, 'eng', -1]].forEach(([x, sh, f], i) => puppet({ sh, x, y: 482, s: .23, face: -1, pose: Math.floor(t * 3 + i) % 2 ? POSES.protest : POSES.point, head: 'expr3', ground: GROUND }));
  puppet({ sh: 'arg', x: 940, y: 478, s: .23, face: -1, pose: POSES.cheer, head: 'expr2', num: '10', ground: GROUND });
  const s = slip(t, T.sD + .3, 40, 30, 520, 96, 'THE GOAL STANDS', 44, { font: F.shout }); if (s) texts.push({ id: 'stands', ...off(s) });
  const d = drop(t, T.quote, .3, 41);
  if (d.vis) {
    X.save(); X.translate(PW / 2, 760 + d.y); X.scale(d.s, d.s);
    paperCard(-430, -70, 860, 140, C.cap, d.held, d.rot); X.rotate(d.rot);
    inkText('“…a little with the hand of God.”', 0, -14, 44, F.num, C.ink, 'center', 'italic');
    inkText('DIEGO MARADONA, AFTER THE MATCH', 0, 40, 24, F.sc);
    X.restore();
    texts.push({ id: 'quote', text: '“…a little with the hand of God.”', x0: AP.x + PW / 2 - 430, y0: AP.y + 690, x1: AP.x + PW / 2 + 430, y1: AP.y + 830 });
  }
}
function sceneE(t, texts) {   // 55': the run
  theRun(t, texts);
  tag('55′', texts, T.sE + .1, t);
  if (t > T.g2) { const s = slip(t, T.g2 + .2, 40, PH - 250, 300, 110, '2–0', 64, { font: F.num }); if (s) texts.push({ id: 'g2', ...off(s) }); }
  if (t > T.poll - .3) {
    const d = drop(t, T.poll, .3, 55); if (d.vis) {
      X.save(); X.translate(PW / 2 + 120, PH - 330 + d.y); X.scale(d.s, d.s);
      paperCard(-300, -80, 600, 160, C.brass, d.held, d.rot); X.rotate(d.rot);
      inkText('GOAL OF THE CENTURY', 0, -18, 46, F.shout); inkText('FIFA ONLINE POLL · 2002', 0, 38, 28, F.sc);
      X.restore();
      texts.push({ id: 'poll', text: 'GOAL OF THE CENTURY FIFA ONLINE POLL · 2002', x0: AP.x + PW / 2 - 180, y0: AP.y + PH - 410, x1: AP.x + PW / 2 + 420, y1: AP.y + PH - 250 });
    }
  }
}
function trophy(x, y, s) {    // a generic big-handled cup
  X.save(); X.translate(x, y); X.scale(s, s);
  X.shadowColor = 'rgba(43,34,25,.35)'; X.shadowBlur = 10; X.shadowOffsetX = 6; X.shadowOffsetY = 8;
  X.fillStyle = C.brass; X.strokeStyle = C.ink; X.lineWidth = 5;
  for (const sd of [-1, 1]) { X.beginPath(); X.ellipse(sd * 110, -120, 50, 100, sd * .25, 0, 7); X.lineWidth = 22; X.strokeStyle = C.brass; X.stroke(); X.lineWidth = 4; X.strokeStyle = C.ink; X.beginPath(); X.ellipse(sd * 110, -120, 62, 112, sd * .25, 0, 7); X.stroke(); }
  X.beginPath(); X.moveTo(-100, -260); X.quadraticCurveTo(-110, -20, -40, 30); X.lineTo(-50, 120); X.lineTo(50, 120); X.lineTo(40, 30); X.quadraticCurveTo(110, -20, 100, -260); X.closePath(); X.fill(); X.shadowColor = 'transparent'; X.stroke();
  X.fillStyle = '#E7C66F'; X.beginPath(); X.ellipse(0, -260, 100, 24, 0, 0, 7); X.fill(); X.stroke();
  X.fillStyle = '#3F8F5E'; X.fillRect(-80, 120, 160, 46); X.strokeRect(-80, 120, 160, 46);
  X.fillStyle = 'rgba(255,255,255,.45)'; X.beginPath(); X.ellipse(-50, -140, 12, 66, .1, 0, 7); X.fill();
  X.restore();
}
function sceneF(t, texts) {   // full time 2-1; then the World Cup
  stage(t, t > T.champ ? 1 : .2);
  const lift = clamp((t - T.champ - .3) / .6, 0, 1);
  if (t < T.champ) {
    puppet({ sh: 'eng', x: 300, y: 484, s: .23, face: 1, pose: POSES.despair, head: 'expr3', ground: GROUND });
    puppet({ sh: 'arg', x: 640, y: 478, s: .24, face: -1, pose: POSES.cheer, head: 'expr2', num: '10', ground: GROUND });
  } else {
    const hop = (i, x, num, ph) => { const k = ((t - T.champ) * 2.2 + ph) % 1; const up = Math.sin(k * Math.PI) * 50;
      puppet({ sh: 'arg', x, y: 470 - up, s: .22, face: i % 2 ? -1 : 1, pose: k < .5 ? POSES.cheer : POSES.cheer2, head: 'expr2', num, ground: GROUND }); };
    hop(0, 140, '7', 0); hop(1, 820, '11', .4);
    puppet({ sh: 'arg', x: PW / 2, y: 470, s: .24, face: 1, pose: lift > 0 ? POSES.cheer : POSES.stand, head: 'expr2', num: '10', ground: GROUND });
    if (lift > 0) trophy(PW / 2 + 6, lerp(560, 250, eo(lift)), .32);
    const s2 = slip(t, T.champ, PW - 400, 150, 360, 96, 'CHAMPIONS', 46, { font: F.shout }); if (s2) texts.push({ id: 'won', ...off(s2) });
  }
  const s = slip(t, T.sF + .05, 40, 30, 600, 96, 'ENGLAND 81′ · 2–1', 44, { font: F.num }); if (s) texts.push({ id: 'lin', ...off(s) });
}
function sceneG(t, texts) {   // the question: the fist and the run side by side again
  const half = PW / 2 - 6;
  X.save(); X.beginPath(); X.rect(0, 0, half, PH); X.clip(); X.translate(-300, 0);
  handball(t, texts, 99, { still: true }); X.restore();
  X.save(); X.beginPath(); X.rect(half + 12, 0, half, PH); X.clip(); X.translate(half + 12 - 160, 60); X.scale(.85, .85);
  theRun(t, texts, { k: .97, scroll: 300 }); X.restore();
  X.fillStyle = C.ink; X.fillRect(half, 0, 12, PH);
  const a = slip(t, T.sG + .05, 30, 30, 300, 96, 'CHEAT?', 54, { font: F.shout }); if (a) texts.push({ id: 'cheat', ...off(a) });
  const b = slip(t, T.sG + .6, half + 40, 30, 330, 96, 'GENIUS?', 54, { font: F.shout }); if (b) texts.push({ id: 'genius', ...off(b) });
}

const SCENES = [[0, sceneA], [T.sB, sceneB], [T.sC, sceneC], [T.sD, sceneD], [T.sE, sceneE], [T.sF, sceneF], [T.sG, sceneG]];
const NOWHIP = [];

function brandThumb() {           // 1080 x 1920 thumbnail art: the raised fist meeting the ball above the keeper
  X.fillStyle = C.table; X.fillRect(0, 0, W, H);
  X.fillStyle = C.paper; X.fillRect(22, 22, W - 44, H - 44);
  const px = 52, py = 470, pw = W - 104, ph = 1000;
  X.save(); X.beginPath(); X.rect(px, py, pw, ph); X.clip(); X.translate(px, py); X.translate(-420, -30); X.scale(1.45, 1.45);
  const c = handball(0, [], 99, { still: true });
  inkRing(c[0], c[1] - 14, 62, 62, -1, 1);
  X.restore();
  X.strokeStyle = C.ink; X.lineWidth = 8; X.strokeRect(px, py, pw, ph);
  X.globalCompositeOperation = 'multiply'; X.globalAlpha = .5; X.drawImage(TEX, 22, 22, W - 44, H - 44, 22, 22, W - 44, H - 44); X.globalAlpha = 1; X.globalCompositeOperation = 'source-over';
}
