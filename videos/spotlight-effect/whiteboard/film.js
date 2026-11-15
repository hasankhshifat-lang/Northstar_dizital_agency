// Spotlight Effect · Whiteboard Explainer (9:16, 11.2 s). Storyboard B in social/scripts/spotlight-effect-short.md.
// One glossy board, two regions: ① the worry (top-left), ② the room (lower-right). The camera travels between them.
// No hands: floating markers, round magnets for the people, a felt eraser. Black = structure, blue = the guess, orange = the real number.
import * as W from './engine/wb.js';
import { clamp, lerp, TAU, mulberry } from '/core/lib.js';
const { INK } = W;

export const END = 11.2, VO_AT = 0.10;
const CUES = [
  { t0: 0.10, t1: 2.25, text: 'Everyone noticed that... right?' },
  { t0: 2.35, t1: 5.85, text: 'Cornell students wore an embarrassing T-shirt into a room.' },
  { t0: 5.95, t1: 7.85, text: 'They guessed half the room noticed.' },
  { t0: 7.90, t1: 8.85, text: 'Real number?' },
  { t0: 8.90, t1: 11.2, text: 'About 1 in 4.' },
];
const CUE = { music: 2.40, drop: 7.75, reveal: 9.56 };

export async function build() {
  await W.loadFont('tech', 'fonts/EMSTech.json');
  const tl = new W.Timeline(), T = W.text;
  const K = new W.Pen('black', INK.black, { park: [1320, 1650] });
  const Bl = new W.Pen('blue', INK.blue, { park: [1350, 1350] });
  const O = new W.Pen('orange', INK.orange, { park: [1330, 1150] });
  const PENS = [K, Bl, O];
  const D = (pen, shapes, a, b, o = {}) => tl.draw(pen, shapes, a, { by: b, ...o });

  // ghosts of old lessons
  const ghosts = [], gR = mulberry(31);
  for (let i = 0; i < 26; i++) {
    const x = gR() * 2600 + 200, y = gR() * 3600 + 200, k = gR(), o = { w: 11, alpha: .05 + gR() * .05, color: gR() < .25 ? '#8aa0c8' : '#9aa0a8' };
    if (k < .35) ghosts.push(...T(['x = 4', 'quiz fri', 'p. 12', 'ok!', 'n = 30', 'due mon'][i % 6], x, y, { h: 46 + gR() * 30, ...o }));
    else if (k < .65) ghosts.push(W.circle(x, y, 40 + gR() * 90, o));
    else ghosts.push(...W.arrow(x, y, x + (gR() - .5) * 400, y + (gR() - .5) * 260, o));
  }

  // ═════════ region ① — the worry (0–2.3): a small figure, hand over its face; eight arrows aimed at it
  const F = [620, 1080];                                                     // feet
  const at = (u, v, s = 1.6) => [F[0] + u * s, F[1] - v * s];
  const fig = [W.circle(...at(-9, 258), 32 * 1.6, { w: 9, a0: 2.3 }), W.curve([at(-2, 226), at(3, 176), at(0, 120)], { w: 9 }),
    W.curve([at(-2, 222), at(-46, 214), at(-30, 250)], { w: 9 }), W.curve([at(2, 220), at(24, 172), at(26, 124)], { w: 9 }),
    W.curve([at(0, 120), at(-16, 60), at(-30, 0)], { w: 9 }), W.curve([at(0, 120), at(14, 60), at(28, 0)], { w: 9 })];
  const shirt = [...W.rect(...at(-34, 214), 70 * 1.6, 86 * 1.6, { w: 6, over: 5 }), ...T('!', ...at(2, 150), { h: 70, w: 8, align: 'center' })];
  D(K, fig, 0.05, 0.55, { minGap: .02, maxGap: .04 });
  D(K, shirt, 0.56, 0.78, { minGap: .02, maxGap: .04 });
  const arrows = [], C = at(0, 160);
  for (let i = 0; i < 8; i++) {
    const a = -Math.PI / 2 + (i + .5) * TAU / 8, r0 = 470, r1 = 265;
    arrows.push(...W.arrow(C[0] + Math.cos(a) * r0, C[1] + Math.sin(a) * r0 * 1.08, C[0] + Math.cos(a) * r1, C[1] + Math.sin(a) * r1 * 1.08, { w: 7, head: 26 }));
  }
  D(K, arrows, 0.80, 1.45, { minGap: .015, maxGap: .03 });
  D(K, T('everyone saw?', 230, 215, { h: 84, w: 10 }), 1.46, 2.15, { minGap: .02, maxGap: .05 });

  // ═════════ ride the line to region ② (2.3–3.2), the room (3.2–4.3), people as magnets (4.3–5.0), the student slides in (4.9–5.6)
  const R = { x0: 1150, x1: 1950, y0: 2160, y1: 2960, d0: 2770, d1: 2920 };
  D(K, W.dashed([[700, 1320], [760, 1800], [900, 2400], [1000, 2845], [1110, 2845]], { w: 7, dash: 44, gap: 28, smooth: 3 }), 2.30, 3.15, { travel: 6000, minGap: .01, maxGap: .02 });
  D(K, [W.line(R.x0, R.y0, R.x1, R.y0, { w: 10, over: 8 }), W.line(R.x1, R.y0, R.x1, R.y1, { w: 10, over: 8 }), W.line(R.x1, R.y1, R.x0, R.y1, { w: 10, over: 8 }),
    W.line(R.x0, R.y1, R.x0, R.d1, { w: 10 }), W.line(R.x0, R.d0, R.x0, R.y0, { w: 10, over: 8 })], 3.18, 3.85);
  D(K, T('CORNELL  2000', R.x0 + 10, R.y0 - 40, { h: 46, w: 7 }), 3.88, 4.40);
  const COLS = [1310, 1480, 1650, 1820], ROWS = [2310, 2480, 2650];
  const PEOPLE = [];
  ROWS.forEach((y, r) => COLS.forEach((x, c) => PEOPLE.push({ x, y, r, c, drop: 4.30 + r * .26 + c * .05 })));
  for (const p of PEOPLE) tl.cue(p.drop + .2, 'magnet', { x: p.x, y: p.y });
  const HERO = { path: [[930, 2850], [1160, 2850], [1565, 2850]], t0: 4.95, t1: 5.62 };
  tl.cue(HERO.t0, 'whoosh', { d: .5, x: 1300, y: 2850 }); tl.cue(HERO.t1 - .05, 'click', { x: 1565, y: 2850 });

  // ═════════ B3: the guess in blue (6.0–7.35)
  const GUESS = [[0, 0], [2, 0], [1, 1], [3, 1], [0, 2], [2, 2]], REAL = [[2, 0], [3, 1], [0, 2]];
  const pc = (c, r) => [COLS[c], ROWS[r]];
  D(Bl, GUESS.map(([c, r], i) => W.circle(...pc(c, r), 74, { w: 8, a0: -2.2 + i * .5, lap: .25 })), 6.00, 6.80, { minGap: .02, maxGap: .05 });
  D(Bl, T('guess: ½', R.x0 + 20, R.y1 + 140, { h: 80, w: 10 }), 6.82, 7.35, { minGap: .02, maxGap: .05 });

  // ═════════ B4: the eraser wipes the guess down to a ghost (7.95–8.6)
  tl.erase(W.zigzag(COLS[0] - 90, ROWS[0] - 20, COLS[3] - COLS[0] + 180, ROWS[2] - ROWS[0] + 40, 4), 7.98, .62, { width: 120, strength: .86 });

  // ═════════ B5: the real number in orange (9.0–9.85); the three who noticed turn toward the student
  D(K, W.line(R.x0 + 230, R.y1 + 112, R.x0 + 440, R.y1 + 96, { w: 9 }), 8.62, 8.80);       // cross the guess out once it is wiped from the room
  D(O, REAL.map(([c, r], i) => W.circle(...pc(c, r), 70, { w: 10, a0: -1.4 + i * .6, lap: .3 })), 9.00, 9.42, { minGap: .02, maxGap: .05 });
  D(K, T('real:', R.x0 + 300, R.y1 + 300, { h: 64, w: 8 }), 9.43, 9.55);
  D(O, T('¼', R.x0 + 520, R.y1 + 312, { h: 130, w: 16 }), 9.56, 9.92, { minGap: .02, maxGap: .05 });
  const turnAt = { [REAL[0]]: 9.05, [REAL[1]]: 9.18, [REAL[2]]: 9.31 };
  tl.end();

  // ───────── camera: keys [t, x, y, zoom, rot, ease]
  const cam = new W.Camera([
    [0, 620, 900, 1.9], [0.62, 620, 900, 1.9],                 // tight on the small drawing
    [1.55, 600, 960, 1.0, 0, 'io'], [2.30, 600, 960, 1.0],     // pull back: the arrows, the worry feels huge
    [3.30, 1550, 2810, 1.0, 0, 'io'],                          // ride the dashed line down to the room
    [7.72, 1550, 2810, 1.0], [7.92, 1565, 2560, 1.2, 0, 'o'], // the "but": a snap push onto the grid
    [8.85, 1565, 2560, 1.2], [9.30, 1550, 2880, 1.0, 0, 'io'],// back to the whole room for the answer
    [END, 1570, 2900, 1.05, 0, 'l'],                           // a slow dolly-in on the verdict
  ]);

  // ───────── objects: people magnets, the student magnet, eraser, floating markers
  function magnet(ctx, x, y, c, o) {
    const [sx, sy] = W.toScreen(c, x, y), s = c.z * (1 + o.lift * .12), r = 52 * s, up = o.lift * 34 * c.z;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.save(); ctx.filter = `blur(${(6 + o.lift * 12) * c.z}px)`; ctx.fillStyle = `rgba(40,40,50,${.32 - o.lift * .14})`;
    ctx.beginPath(); ctx.arc(sx + (7 + up * .7) * c.z, sy + (10 + up) * c.z, r, 0, TAU); ctx.fill(); ctx.restore();
    ctx.save(); ctx.translate(sx, sy - up);
    const g = ctx.createRadialGradient(-r * .35, -r * .4, r * .1, 0, 0, r); g.addColorStop(0, o.hi); g.addColorStop(.55, o.col); g.addColorStop(1, o.lo);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
    ctx.rotate(o.rot);                                       // the person's facing: the head + shoulders icon and a small wedge
    ctx.fillStyle = o.ic; ctx.beginPath(); ctx.arc(0, -r * .18, r * .2, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(0, r * .42, r * .38, Math.PI, 0); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-r * .16, -r * .78); ctx.lineTo(0, -r * 1.0); ctx.lineTo(r * .16, -r * .78); ctx.closePath(); ctx.fill();
    ctx.rotate(-o.rot);
    ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.ellipse(-r * .38, -r * .5, r * .2, r * .1, -.6, 0, TAU); ctx.fill();
    ctx.restore();
  }
  const HP = new W.Stroke(HERO.path.flat(), { jitter: 0, w: 1, smooth: 2 });
  const facing = (p, t) => {                                 // face the front (up); the three who noticed turn toward the student
    const k = turnAt[[p.c, p.r]]; if (k == null || t < k) return 0;
    const target = Math.atan2(2850 - p.y, 1565 - p.x) + Math.PI / 2, u = clamp((t - k) / .32), e = 1 - Math.pow(1 - u, 3);
    return target * e * (1 + .08 * Math.sin(u * Math.PI));   // a small overshoot as the head settles
  };
  const board = new W.Board(tl, { W: 3000, H: 4000, ghosts });
  board.objs.push({ draw: (ctx, t, c) => {
    for (const p of PEOPLE) {
      if (t < p.drop) continue;
      const lift = 1 - clamp((t - p.drop) / .22);
      magnet(ctx, p.x, p.y, c, { lift: lift * lift, rot: facing(p, t), col: '#c9ced6', hi: '#f3f5f8', lo: '#8d949e', ic: '#ffffff' });
    }
    if (t >= HERO.t0 - .3) {                                 // the student: a dark magnet that slides in through the door
      const u = clamp((t - HERO.t0) / (HERO.t1 - HERO.t0)), e = u * u * (3 - 2 * u), [x, y] = HP.at(HP.len * e);
      const lift = t < HERO.t0 ? 1 - (t - HERO.t0 + .3) / .3 : Math.sin(Math.PI * u) * .25;
      magnet(ctx, x, y, c, { lift, rot: 0, col: '#3a3f48', hi: '#6c7380', lo: '#1c1f24', ic: '#f5f2ea' });
    }
  } });
  board.objs.push({ draw: (ctx, t, c) => { for (const e of tl.erasers) W.drawEraser(ctx, e, t, c); } });
  board.objs.push({ draw: (ctx, t, c, cm) => { for (const p of PENS) W.drawMarker(ctx, p, W.penPose(p, t, cm), c, t); } });
  // subtitles: off-white rounded label, Architects Daughter, an orange marker dash; above the Shorts caption band
  if (!new URLSearchParams(location.search).has('nosubs')) board.overlays.push({ draw: (ctx, t) => {
    const s = CUES.find(s => t >= s.t0 && t < s.t1); if (!s) return;
    const a = Math.min(1, (t - s.t0) / .12, (s.t1 - t) / .12);
    ctx.font = '44px AD';
    let rows = [s.text];
    if (ctx.measureText(s.text).width > 900) {
      const ws = s.text.split(' '); let best = 1, bd = 1e9;
      for (let i = 1; i < ws.length; i++) { const d = Math.abs(ctx.measureText(ws.slice(0, i).join(' ')).width - ctx.measureText(ws.slice(i).join(' ')).width); if (d < bd) { bd = d; best = i; } }
      rows = [ws.slice(0, best).join(' '), ws.slice(best).join(' ')];
    }
    const w = Math.max(...rows.map(r => ctx.measureText(r).width)) + 64, h = 70 + (rows.length - 1) * 52, y0 = 1505 - h;
    ctx.globalAlpha = a * .9; ctx.fillStyle = '#fdfcf8'; ctx.shadowColor = 'rgba(30,30,40,.18)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 4;
    ctx.beginPath(); ctx.roundRect(540 - w / 2, y0, w, h, 14); ctx.fill();
    ctx.shadowColor = 'transparent'; ctx.globalAlpha = a;
    ctx.fillStyle = INK.orange; ctx.fillRect(540 - w / 2 + 22, y0 + h - 12, 36, 4);
    ctx.fillStyle = '#23262c'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    rows.forEach((r, i) => ctx.fillText(r, 540, y0 + 37 + i * 52));
  } });

  // frame render with motion blur when the camera moves fast
  const off = new OffscreenCanvas(1080, 1920), oc = off.getContext('2d');
  function render(ctx, t) {
    const dt = 1 / 24, a = cam.at(t), b = cam.at(Math.max(0, t - dt));
    const sp = Math.hypot((a.x - b.x) * a.z, (a.y - b.y) * a.z) + Math.abs(Math.log(a.z / b.z)) * 900;
    const N = sp > 14 ? Math.min(12, Math.ceil(sp * .5 / 4)) : 1;
    if (N === 1) { board.render(ctx, t, cam); return; }
    const ov = board.overlays; board.overlays = [];
    for (let i = 0; i < N; i++) { board.render(oc, t - dt * .5 * i / (N - 1), cam); ctx.globalAlpha = 1 / (i + 1); ctx.drawImage(off, 0, 0); }
    ctx.globalAlpha = 1; board.overlays = ov;
    for (const o of ov) { ctx.save(); o.draw(ctx, t); ctx.restore(); }
  }

  // events for the mixer (mix.py vocabulary)
  const ev = [];
  for (const e of tl.ev) {
    let pan = 0;
    if (e.x != null) { const c = cam.at(e.t), [px] = W.toScreen(c, e.x, e.y); pan = +clamp((px - 540) / 900, -.7, .7).toFixed(2); }
    if (['stroke', 'write', 'dash', 'tap'].includes(e.type)) ev.push({ t: e.t, type: 'stroke', kind: e.type, d: Math.max(.03, e.dur), col: e.pen === 'black' ? 'black' : e.pen === 'blue' ? 'blue' : 'red', pan });
    else if (e.type === 'erase') ev.push({ t: e.t, type: 'wipe', d: e.dur, pan });
    else ev.push({ ...e, pan });
  }
  for (const [k, v] of Object.entries(CUE)) ev.push({ t: v, type: 'cue', name: k });
  ev.push({ t: VO_AT, type: 'vo', id: 'narration' });
  ev.sort((a, b) => a.t - b.t);
  return { dur: END, render, ev, subs: CUES };
}
