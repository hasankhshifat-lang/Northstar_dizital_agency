// ---------------------------------------------------------------- film: "Six Minutes" - Brazil 1-7 Germany, World Cup semi-final, Mineirão, Belo Horizonte, 8 July 2014
// One comic page: the scoreboard pinned on top (score + match minute), the action panel, caption band.
// Brazil = generic plain yellow shirt, blue shorts (sheet 'bra'); Germany = generic red/black stripes (sheet 'ger').
// Keepers: 'gkb' (Brazil, green) and 'gkg' (Germany, grey). No crests, sponsors or faces; players are numbered puppets.
Object.assign(C, { yel: '#E3B321', yelP: '#D9A91C', blu: '#2D58A6', ger: '#B3242B', gerP: '#B8383A', silver: '#C9CCD1' });

const FOOTER = 'Nights That Shocked Football · Part One';
const PUSH = [[T.sC + 1.2, T.g1, 1.05, 470, 700]];
const SHAKES = [[T.h1, 5, .25], [T.h2, 6, .25], [T.h3, 7, .25], [T.h4, 9, .3], [T.g1, 8, .35], [T.g2, 10, .4], [T.g3, 8, .3], [T.g4, 10, .3], [T.g5, 16, .5], [T.g6, 6, .3], [T.g7, 6, .3]];
POSES.sitslump = { lean: 18, h: 18, uL: 30, fL: 40, uR: -30, fR: -40, tL: -70, sL: 80, tR: -60, sR: 70, dy: 40 };

const EV = [{ t: 0.0, type: 'vo', id: 'narration' }];
const ev = (t, type, o = {}) => EV.push({ t, type, ...o });
for (const [i, k] of ['h1', 'h2', 'h3', 'h4'].entries()) { ev(T[k] - .2, 'kick', { v: .5 }); ev(T[k], 'net'); ev(T[k], 'slap', { v: .4 + i * .15 }); }
ev(T.h3, 'slip'); ev(T.h4 + .2, 'roar', { d: 1.6, v: .6 });
ev(T.sB - .15, 'whip', { d: .35 }); ev(T.pin - .05, 'pin'); ev(T.semi, 'slip');
ev(T.miss - .15, 'whip', { d: .35 }); ev(T.out1, 'stamp'); ev(T.out2, 'stamp');
ev(T.sC - .15, 'whip', { d: .35 }); ev(T.cross, 'kick', { v: .6 }); ev(T.g1 - .25, 'kick', { v: .8 }); ev(T.g1, 'net'); ev(T.g1, 'slap'); ev(T.g1, 'roar', { d: 2.2, v: .7 }); ev(T.ring1, 'scribble', { d: .45 });
ev(T.sD - .15, 'whip', { d: .35 }); ev(T.g2 - .3, 'kick'); ev(T.g2, 'net'); ev(T.g2, 'slap'); ev(T.g2, 'roar', { d: 2, v: .8 }); ev(T.rec, 'slip'); ev(T.ronaldo, 'scribble', { d: .45 });
ev(T.sE - .15, 'whip', { d: .35 });
for (const k of ['g3', 'g4', 'g5']) { ev(T[k] - .3, 'kick'); ev(T[k], 'net'); ev(T[k], 'slap'); ev(T[k], 'roar', { d: 1.6, v: .8 }); }
ev(T.five, 'bigslap'); ev(T.five + .1, 'slip'); ev(T.five + .3, 'groan');
ev(T.sF - .15, 'whip', { d: .35 }); for (const k of ['g6', 'g7']) { ev(T[k] - .3, 'kick', { v: .6 }); ev(T[k], 'net'); ev(T[k], 'slap', { v: .5 }); }
ev(T.oscar - .3, 'kick', { v: .5 }); ev(T.oscar, 'net'); ev(T.oscar, 'slap', { v: .4 }); ev(T.final71, 'stamp');
ev(T.sG - .15, 'whip', { d: .35 }); ev(T.sG + .3, 'slip'); for (let i = 0; i < 6; i++) ev(T.sG + .4 + i * .42, 'hop', { i }); ev(T.sG + .2, 'roar', { d: 3, v: .7 });
ev(T.sH - .15, 'whip', { d: .35 }); ev(T.sH + .05, 'slip'); ev(T.sH + .5, 'scribble', { d: .45 });

// ---------------------------------------------------------------- the scoreboard: score + match minute
const ROWY = { bra: 214, ger: 338 };
const SCOL = 700, MCOL = 890;
const SCORE = { bra: [[-9, '0'], [T.oscar, '1']], ger: [[-9, '0'], [T.g1, '1'], [T.g2, '2'], [T.g3, '3'], [T.g4, '4'], [T.g5, '5'], [T.g6, '6'], [T.g7, '7']] };
const MINUTE = [[-9, 'KO'], [T.sC + .3, '11′'], [T.sD + .3, '23′'], [T.g3 - .4, '24′'], [T.g4 - .4, '26′'], [T.g5 - .4, '29′'], [T.g6 - .4, '69′'], [T.g7 - .4, '79′'], [T.oscar - .4, '90′']];
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
  inkText('WORLD CUP SEMI-FINAL · 8 JULY 2014', W / 2, SB.y + 40, 30);
  X.strokeStyle = C.ink; X.lineWidth = 1.5; X.beginPath(); X.moveTo(SB.x + 40, SB.y + 64); X.lineTo(SB.x + SB.w - 40, SB.y + 64); X.stroke();
  inkText('Score', SCOL, SB.y + 92, 28); inkText('Minute', MCOL, SB.y + 92, 28);
  for (const [team, label, col] of [['bra', 'BRAZIL', '#B8901A'], ['ger', 'GERMANY', C.ger]]) {
    const y = ROWY[team];
    X.fillStyle = team === 'bra' ? C.yel : C.ger; X.fillRect(SB.x + 34, y - 30, 22, 60);
    inkText(label, SB.x + 74, y + 4, 46, F.sc, col, 'left');
    patchStack(SCORE[team], SCOL, y, 132, 104, t, team === 'bra' ? C.blu : C.gerP, col, 86, SCOL * 7 + y);
  }
  patchStack(MINUTE, MCOL, (ROWY.bra + ROWY.ger) / 2, 150, 120, t, C.ink, C.ink, 70, MCOL * 7);
  if (t > T.five && t < T.sF) inkRing(SCOL, ROWY.ger, 86, 62, T.five + .05, t);
  if (t > T.sH) { inkRing(SCOL, ROWY.bra, 86, 62, T.sH + .5, t); inkRing(SCOL, ROWY.ger, 86, 62, T.sH + .65, t); }
  texts.push({ id: 'board', text: 'scoreboard', x0: SB.x, y0: SB.y, x1: SB.x + SB.w, y1: SB.y + SB.h, pass: true });
}

// ---------------------------------------------------------------- panel scenes
const GREY = ['#B9B2A4', '#A8A194', '#CFC8B8', '#9E978A', '#C2BBAC', '#B0A99C'];
const HOMEC = ['#E3B321', '#2D58A6', '#E3B321', '#E9DEC4', '#E3B321', '#3F8F5E'];
function stage(t, lift, cols) { crowd(0, 0, PW, 300, t, lift, 3, cols || HOMEC); grassBand(0, 300, PW, PH - 300); }
const rip = (t, t0) => t > t0 ? Math.exp(-(t - t0) * 4) * Math.sin((t - t0) * 30) : 0;
function flight(t, t0, t1, path, r = 16, dash = true) {
  const k = clamp((t - t0) / (t1 - t0), 0, 1); if (dash) dashedArc(path, k); const [bx, by] = bez(path, k); ball(bx, by, r, k * 8); return k;
}
const cyc = (t, f = 6, a = 'run1', b = 'run2') => POSES[Math.floor(t * f) % 2 ? a : b];
// side-on finish into the goal on the right. att/def/gk = sheets; o.grey = crowd greys out
function goalScene(t, tg, num, sideSeed, o = {}) {
  const att = o.att || 'ger', def = o.def || 'bra', gk = o.gk || 'gkb';
  stage(t, o.quiet ? 0 : (t > tg ? clamp(1 - (t - tg) / 2, 0, 1) * .6 : 0), o.cols);
  goalFrame(PW - 270, 360, 240, 320, rip(t, tg));
  puppet({ sh: def, x: 560, y: 480, s: .24, face: -1, pose: t > tg - .2 ? POSES.stretch : POSES.ready, head: t > tg ? 'expr3' : 'expr1', num: o.dnum || '4', ground: GROUND });
  puppet({ sh: gk, x: PW - 150, y: 490, s: .22, face: -1, pose: poseAt([[0, 'ready'], [tg - .25, 'ready'], [tg, 'dive']], t), rot: t > tg - .2 ? -lerp(0, 40, clamp((t - tg + .2) / .3, 0, 1)) : 0, head: t > tg ? 'expr3' : 'expr1', num: o.gnum, ground: GROUND });
  const sh = [[0, 'ready'], [tg - .45, 'ready'], [tg - .32, 'windup'], [tg - .25, 'strike'], [tg + .2, 'follow'], [tg + .6, o.noCheer ? 'stand' : 'cheer']];
  puppet({ sh: att, x: 300, y: 478, s: .27, face: 1, pose: poseAt(sh, t), head: t > tg ? 'expr2' : 'expr1', num, ground: GROUND });
  const path = [[390, 690], [600, 560 - sideSeed * 60], [PW - 90, 470 + sideSeed * 40]];
  if (t < tg - .25) ball(385 + Math.abs(Math.sin(t * 10)) * 6, 690); else if (t < tg + .4) flight(t, tg - .25, tg, path); else ball(PW - 80, 640, 16);
}
function tagAt(text, texts, t0, t, w = 300) { tag(text, texts, t0, t, w); }

function sceneA(t, texts) {   // hook: four balls in the Brazil net in quick succession; minute tags 23' 24' 26' 29'
  const hs = [T.h1, T.h2, T.h3, T.h4];
  let i = 0; while (i < 3 && t > hs[i] + .35) i++;
  const nums = ['11', '18', '18', '6'];
  goalScene(t, hs[i], nums[i], i % 2 ? -1 : 1, { cols: i >= 2 ? GREY : HOMEC });
  // balls already in the net pile up at the foot of the goal
  for (let j = 0; j < i; j++) ball(PW - 220 + j * 34, 664 - (j % 2) * 10, 14);
  tag('23′–29′', texts, .1, t, 360);
  const s = slip(t, T.h3, 40, PH - 250, PW - 80, 108, '4 GOALS · 6 MINUTES', 56, { font: F.shout }); if (s) texts.push({ id: 'hook', ...off(s) });
}
function stadiumPlan(t, name, sub) {
  X.fillStyle = '#E8DCC0'; X.fillRect(0, 0, PW, PH);
  X.save(); X.strokeStyle = 'rgba(43,34,25,.45)'; X.lineWidth = 2;
  for (let i = -2; i < 12; i++) { X.beginPath(); X.moveTo(i * 110, 0); X.lineTo(i * 110 + 220, PH); X.stroke(); }
  X.restore();
  X.save(); X.translate(PW / 2, 430); X.rotate(-.12);
  X.fillStyle = '#D9CDB0'; X.beginPath(); X.ellipse(0, 0, 340, 240, 0, 0, 7); X.fill();
  X.strokeStyle = 'rgba(43,34,25,.4)'; X.lineWidth = 1.2; for (let r = 0; r < 8; r++) { X.beginPath(); X.ellipse(0, 0, 340 - r * 10, 240 - r * 10, 0, 0, 7); X.stroke(); }
  X.fillStyle = C.grass; X.fillRect(-220, -130, 440, 260); X.strokeStyle = '#FBF6EA'; X.lineWidth = 4; X.strokeRect(-205, -118, 410, 236);
  X.beginPath(); X.moveTo(0, -118); X.lineTo(0, 118); X.stroke(); X.beginPath(); X.arc(0, 0, 40, 0, 7); X.stroke();
  X.strokeStyle = C.ink; X.lineWidth = 4; X.beginPath(); X.ellipse(0, 0, 340, 240, 0, 0, 7); X.stroke();
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
function sceneB(t, texts) {   // the place, the stakes
  stadiumPlan(t, 'MINEIRÃO', 'BELO HORIZONTE · 8 JULY 2014');
  texts.push({ id: 'plan', text: 'MINEIRÃO', x0: AP.x + 300, y0: AP.y + 730, x1: AP.x + 680, y1: AP.y + 790 });
  dropPin(t, T.pin, PW / 2, 430);
  const s = slip(t, T.semi, 40, 40, 620, 104, 'WORLD CUP SEMI-FINAL', 44, { font: F.num }); if (s) texts.push({ id: 'semi', ...off(s) });
}
function sceneB2(t, texts) {  // two missing: the bench, #10 and #3 sitting out
  stage(t, 0);
  X.fillStyle = '#8B6F4E'; X.fillRect(150, 560, 680, 40); X.strokeStyle = C.ink; X.lineWidth = 4; X.strokeRect(150, 560, 680, 40);
  X.fillStyle = '#5B4632'; X.fillRect(180, 600, 24, 100); X.fillRect(776, 600, 24, 100);
  for (const [x, n, f] of [[330, '10', 1], [640, '3', -1]]) {
    X.save(); X.globalAlpha = .6; puppet({ sh: 'bra', x, y: 470, s: .22, face: f, pose: POSES.despair, head: 'expr3', num: n }); X.restore();
  }
  stampOn(t, T.out1, 300, 225, 'INJURED', 48, -.1);
  stampOn(t, T.out2, 680, 225, 'SUSPENDED', 44, .08);
  const s = slip(t, T.miss + .1, 40, 30, 640, 96, 'STAR + CAPTAIN OUT', 44, { font: F.shout }); if (s) texts.push({ id: 'miss', ...off(s) });
}
function boxPlan(t) {      // the penalty area from above: goal at the top, the corner flag top right; a strip of crowd below
  X.fillStyle = C.grass; X.fillRect(0, 0, PW, PH);
  X.fillStyle = C.grass2; for (let i = 0; i < PH; i += 110) X.fillRect(0, i, PW, 55);
  X.strokeStyle = '#FBF6EA'; X.lineWidth = 8;
  X.strokeRect(150, 60, PW - 300, 330); X.strokeRect(330, 60, PW - 660, 120);
  X.beginPath(); X.arc(PW / 2, 390, 120, .35, Math.PI - .35); X.stroke();
  X.beginPath(); X.moveTo(0, 60); X.lineTo(PW, 60); X.stroke();
  X.beginPath(); X.arc(PW - 40, 60, 34, Math.PI / 2, Math.PI); X.stroke();
  X.fillStyle = 'rgba(43,34,25,.15)'; X.fillRect(PW / 2 - 120, 18, 240, 42);
  X.strokeStyle = C.ink; X.lineWidth = 6; X.strokeRect(PW / 2 - 120, 18, 240, 42);
  X.lineWidth = 1; for (let i = 0; i < 12; i++) { X.beginPath(); X.moveTo(PW / 2 - 120 + i * 20, 18); X.lineTo(PW / 2 - 120 + i * 20, 60); X.stroke(); }
  X.strokeStyle = C.ink; X.lineWidth = 3; X.beginPath(); X.moveTo(PW - 40, 60); X.lineTo(PW - 40, 10); X.stroke(); X.fillStyle = C.red; X.beginPath(); X.moveTo(PW - 40, 10); X.lineTo(PW - 70, 20); X.lineTo(PW - 40, 30); X.fill();
  crowd(0, PH - 130, PW, 130, t, 0, 9, HOMEC);
}
// Brazil defenders crowd the near post; #13 is alone at the far post
const DEF = [[640, 200, '4'], [720, 280, '13'], [560, 300, '6'], [780, 170, '2']];
function sceneC(t, texts) {   // 11': the corner from above, #13 unmarked at the far post, 1-0
  boxPlan(t);
  const lookBall = t > T.cross;
  DEF.forEach(([x, y, n], i) => puppet({ sh: 'bra', x, y, s: .12, face: 1, pose: lookBall ? POSES.ready : (i % 2 ? POSES.ready : POSES.stand), head: t > T.g1 ? 'expr3' : 'head', num: n, ground: y + 84 }));
  [[700, 230, '5'], [600, 250, '20']].forEach(([x, y, n]) => puppet({ sh: 'ger', x, y, s: .12, face: 1, pose: POSES.ready, head: 'head', num: n, ground: y + 90 }));
  puppet({ sh: 'gkb', x: PW / 2 + 40, y: 105, s: .12, face: 1, pose: t > T.g1 - .1 ? POSES.dive : POSES.ready, rot: t > T.g1 - .1 ? -30 : 0, head: t > T.g1 ? 'expr3' : 'expr1', ground: 192 });
  const fp = [[0, 'ready'], [T.g1 - .45, 'ready'], [T.g1 - .35, 'windup'], [T.g1 - .25, 'strike'], [T.g1 + .3, 'follow'], [T.g1 + .7, 'cheer']];
  puppet({ sh: 'ger', x: 330, y: 190, s: .13, face: 1, pose: poseAt(fp, t), head: t > T.g1 ? 'expr2' : 'expr1', num: '13', ground: 280 });
  puppet({ sh: 'ger', x: PW - 110, y: 120, s: .13, face: -1, pose: poseAt([[0, 'stand'], [T.cross - .3, 'stand'], [T.cross - .12, 'windup'], [T.cross, 'strike'], [T.cross + .5, 'follow']], t), head: 'expr1', num: '18', ground: 210 });
  inkRing(330, 210, 80, 110, T.ring1, t);
  const cross = [[PW - 70, 75], [640, 380], [380, 270]], fin = [[380, 270], [430, 140], [PW / 2 - 60, 40]];
  if (t < T.cross) ball(PW - 70, 75, 11);
  else if (t < T.g1 - .25) flight(t, T.cross, T.g1 - .25, cross, 11);
  else flight(t, T.g1 - .25, T.g1, fin, 11);
  tag('11′', texts, T.sC + .1, t);
  const s = slip(t, T.ring1 + .1, 40, PH - 250, 520, 100, 'UNMARKED', 54, { font: F.shout }); if (s) texts.push({ id: 'unm', ...off(s) });
  if (t > T.g1) { const s2 = slip(t, T.g1 + .15, PW - 400, PH - 380, 360, 100, 'GER 1–0', 54, { font: F.num }); if (s2) texts.push({ id: 'g1', ...off(s2) }); }
}
function sceneD(t, texts) {   // 23': #11 scores; the record card: Ronaldo 15, Klose 16
  goalScene(t, T.g2, '11', -1);
  tag('23′', texts, T.sD + .1, t);
  const rk = clamp((t - T.rec) / .4, 0, 1);
  if (t > T.rec - .3) {
    const d = drop(t, T.rec, .3, 77); if (d.vis) {
      X.save(); X.translate(PW / 2 + 150, 170 + d.y); X.scale(d.s, d.s);
      paperCard(-260, -100, 520, 200, C.cap, d.held, d.rot);
      X.rotate(d.rot);
      inkText('MOST WORLD CUP GOALS', 0, -64, 30, F.sc);
      inkText('RONALDO (BRA)  15', 0, -10, 40, F.num, C.ink, 'center', 'bold');
      inkText('KLOSE (GER)  16', 0, 50, 46, F.num, C.ger, 'center', 'bold');
      X.restore();
      texts.push({ id: 'rec', text: 'MOST WORLD CUP GOALS RONALDO 15 KLOSE 16', x0: AP.x + PW / 2 - 110, y0: AP.y + 70, x1: AP.x + PW / 2 + 410, y1: AP.y + 270 });
      if (t > T.ronaldo) { X.save(); X.translate(PW / 2 + 150, 170); X.strokeStyle = C.red; X.lineWidth = 6; const k = clamp((t - T.ronaldo) / .4, 0, 1); X.beginPath(); X.moveTo(-180, -10); X.lineTo(-180 + 360 * k, -10); X.stroke(); X.restore(); }
    }
  }
}
function sceneE(t, texts) {   // 24', 26', 29': three more; 5-0 after 29 minutes
  const gs = [T.g3, T.g4, T.g5]; let i = 0; while (i < 2 && t > gs[i] + .5) i++;
  goalScene(t, gs[i], i < 2 ? '18' : '6', i === 1 ? -1 : 1, { cols: GREY });
  for (let j = 0; j < i; j++) ball(PW - 220 + j * 34, 664, 14);
  tag('24′ · 26′ · 29′', texts, T.sE + .1, t, 420);
  if (t > T.five) { const s = slip(t, T.five + .1, 40, 130, 600, 120, 'GER 5–0 · 29 MIN', 52, { font: F.shout }); if (s) texts.push({ id: 'five', ...off(s) }); }
}
function sceneF(t, texts) {   // 69', 79' #9; then 90' Brazil #11 pulls one back (mirrored: Brazil attack the left goal)
  if (t < T.oscar - .8) {
    const gs = [T.g6, T.g7]; const i = t > T.g6 + .5 ? 1 : 0;
    goalScene(t, gs[i], '9', i ? -1 : 1, { cols: GREY, quiet: true });
    tag('69′ · 79′', texts, T.sF + .1, t, 360);
  } else {
    X.save(); X.translate(PW, 0); X.scale(-1, 1);
    goalScene(t, T.oscar, '11', 1, { att: 'bra', def: 'ger', gk: 'gkg', dnum: '5', cols: GREY, quiet: true, noCheer: true });
    X.restore();
    tag('90′', texts, T.oscar - .7, t);
  }
  if (t > T.oscar) { const s = slip(t, T.oscar + .3, PW - 420, 130, 380, 120, '1–7', 70, { font: F.num }); if (s) texts.push({ id: 'g71', ...off(s) }); }
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
function sceneG(t, texts) {   // five days later: Germany lift a generic cup
  stage(t, 1, ['#B3242B', '#2B2626', '#E9DEC4', '#B3242B', '#C8B48A', '#2B2626']);
  const lift = clamp((t - T.sG - .5) / .6, 0, 1);
  const hop = (i, x, num, ph) => { const k = ((t - T.sG) * 2.2 + ph) % 1; const up = Math.sin(k * Math.PI) * 50;
    puppet({ sh: 'ger', x, y: 470 - up, s: .22, face: i % 2 ? -1 : 1, pose: k < .5 ? POSES.cheer : POSES.cheer2, head: 'expr2', num, ground: GROUND }); };
  hop(0, 130, '11', 0); hop(1, 820, '18', .4);
  puppet({ sh: 'ger', x: PW / 2, y: 470, s: .24, face: 1, pose: lift > 0 ? POSES.cheer : POSES.stand, head: 'expr2', num: '13', ground: GROUND });
  if (lift > 0) trophy(PW / 2 + 6, lerp(560, 250, eo(lift)), .32);
  const s = slip(t, T.sG + .1, 40, 30, 600, 96, 'CHAMPIONS', 50, { font: F.shout }); if (s) texts.push({ id: 'won', ...off(s) });
  const s2 = slip(t, T.sG + .4, PW - 360, 140, 320, 84, '13 JULY 2014', 36, { font: F.num }); if (s2) texts.push({ id: 'date', ...off(s2) });
}
function sceneH(t, texts) {   // the question: Brazil's keeper sitting in his net, balls around him
  stage(t, 0, GREY);
  goalFrame(PW / 2 - 200, 330, 400, 340, 0);
  puppet({ sh: 'gkb', x: PW / 2, y: 520, s: .24, face: 1, pose: POSES.sitslump, head: 'expr3', ground: GROUND });
  for (let j = 0; j < 7; j++) ball(PW / 2 - 170 + j * 56, 670 - (j % 2) * 8, 16);
  const s = slip(t, T.sH + .05, 40, PH - 250, PW - 80, 108, 'WORST SCORELINE EVER?', 52, { font: F.shout }); if (s) texts.push({ id: 'q', ...off(s) });
}

const SCENES = [[0, sceneA], [T.sB, sceneB], [T.miss, sceneB2], [T.sC, sceneC], [T.sD, sceneD], [T.sE, sceneE], [T.sF, sceneF], [T.sG, sceneG], [T.sH, sceneH]];
const NOWHIP = [];

function brandThumb() {           // 1080 x 1920 thumbnail art: #11 hitting it past the green keeper, balls piled in the net, grey crowd
  X.fillStyle = C.table; X.fillRect(0, 0, W, H);
  X.fillStyle = C.paper; X.fillRect(22, 22, W - 44, H - 44);
  const px = 52, py = 470, pw = W - 104, ph = 1000;
  X.save(); X.beginPath(); X.rect(px, py, pw, ph); X.clip(); X.translate(px, py); X.translate(-130, -80); X.scale(1.22, 1.22);
  const tg = 0.3;
  stage(0, 0, GREY); goalFrame(PW - 270, 360, 240, 320, 0);
  for (let j = 0; j < 6; j++) ball(PW - 230 + (j % 3) * 36, 664 - Math.floor(j / 3) * 30, 15);
  puppet({ sh: 'gkb', x: PW - 150, y: 490, s: .22, face: -1, pose: POSES.dive, rot: -40, head: 'expr3', ground: GROUND });
  puppet({ sh: 'bra', x: 560, y: 480, s: .24, face: -1, pose: POSES.stretch, head: 'expr3', num: '4', ground: GROUND });
  puppet({ sh: 'ger', x: 300, y: 478, s: .27, face: 1, pose: POSES.strike, head: 'expr1', num: '11', ground: GROUND });
  dashedArc([[390, 690], [620, 600], [PW - 200, 500]], .92); ball(PW - 215, 505, 20, 1);
  X.restore();
  X.strokeStyle = C.ink; X.lineWidth = 8; X.strokeRect(px, py, pw, ph);
  X.globalCompositeOperation = 'multiply'; X.globalAlpha = .5; X.drawImage(TEX, 22, 22, W - 44, H - 44, 22, 22, W - 44, H - 44); X.globalAlpha = 1; X.globalCompositeOperation = 'source-over';
}
