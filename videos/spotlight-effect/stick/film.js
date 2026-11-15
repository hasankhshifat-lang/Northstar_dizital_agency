// Spotlight Effect · Stick-figure Explainer (9:16, 11.2 s). Storyboard C in social/scripts/spotlight-effect-short.md.
// Uses rig.js (the style demo's skeleton, even-hose figure, springs). Layout is written in "room view" screen coordinates;
// the camera maps room view to the frame: screen = A + (p − F)·z. Figures are drawn in screen space so line weight follows
// the on-screen size (√h rule). One accent (#EB4A2A) = the people who really noticed.
(function () {
const FILM = 11.2, VO_AT = 0.10;
const CUES = [
  { t0: 0.10, t1: 2.25, text: 'Everyone noticed that... right?' },
  { t0: 2.35, t1: 5.85, text: 'Cornell students wore an embarrassing T-shirt into a room.' },
  { t0: 5.95, t1: 7.85, text: 'They guessed half the room noticed.' },
  { t0: 7.90, t1: 8.85, text: 'Real number?' },
  { t0: 8.90, t1: 11.2, text: 'About 1 in 4.' },
];
const CUE = { music: 2.40, drop: 7.75, reveal: 9.56 };
const M = 90;                                         // left margin (9:16)
const eio = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };

// ── cast (room view): the student at the front, twelve people on three ground lines
const STU = { x: 300, y: 1340, h: 250 };
const ROWS = [{ y: 640, h: 170, xs: [230, 450, 670, 890] }, { y: 840, h: 180, xs: [180, 400, 620, 840] }, { y: 1040, h: 190, xs: [230, 450, 670, 890] }];
const P = [{ ...STU, id: 'stu', appear: .12, seed: 0 }];
const R0 = mulberry(5);
ROWS.forEach((r, ri) => r.xs.forEach((x, ci) => P.push({ x, y: r.y, h: r.h, r: ri, c: ci, appear: 3.15 + ri * .24 + ci * .065 + R0() * .05, seed: 1 + ri * 4 + ci })));
const key = (c, r) => P.findIndex(p => p.c === c && p.r === r);
const GUESS = [[0, 0], [2, 0], [1, 1], [3, 1], [0, 2], [2, 2]].map(([c, r]) => key(c, r));
const REAL = [[2, 0], [3, 1], [0, 2]].map(([c, r]) => key(c, r));
const TURN = { [REAL[0]]: 9.05, [REAL[1]]: 9.18, [REAL[2]]: 9.31 };
const TALK = [key(1, 1), key(2, 1)], DOWN = key(3, 2);

// ── target poses (rig angles: 0 = down, +π/2 = right, ±π = up)
function idle(seed, t) {
  const p = rest(), ph = seed * 1.93 + .4;
  p.hx += .004 * Math.sin(t * 1.25 + ph); p.lean += .012 * Math.sin(t * 1.05 + ph * 1.3);
  p.hy += .004 * (.5 + .5 * Math.sin(t * 2.1 + ph)); p.la -= .03 * Math.sin(t * 1.5 + ph); p.ra += .03 * Math.sin(t * 1.5 + ph + .7);
  p.head += .05 * Math.sin(t * .7 + ph * 2.1);
  return p;
}
function stuPose(t) {
  const p = idle(0, t);
  if (t >= .62 && t < .78) Object.assign(p, { hy: .025, la: -.75, ra: .75 });                        // anticipation: a small dip, arms out
  if (t >= .78 && t < 9.62) {                                                                        // shrinks: hand over the face, head down to the side, shoulders in
    Object.assign(p, { hy: .018, bend: .035, lean: -.035, head: -.26, la: -.16, lb: .08, ra: 1.855, rb: 2.12 });
    if (t >= 6.0 && t < 7.4) { const w = Math.sin((t - 6.0) / 1.4 * Math.PI * 2); p.head = -.26 + .2 * w; p.lean = -.035 + .03 * w; }   // glances left, right
  }
  if (t >= 9.62) Object.assign(p, { hy: -.006, lean: .01, head: .04, la: -.42, lb: .2, ra: .42, rb: -.2 });   // straightens up: relief
  return p;
}
function crowdPose(i, t) {
  const e = P[i], p = idle(e.seed, t);
  if (TALK.includes(i) && t >= 7.95) {                                                              // two people talk to each other
    const s = i === TALK[0] ? 1 : -1, beat = Math.max(0, Math.sin((t - 7.95) * 5.2));
    Object.assign(p, { lean: .05 * s, head: .14 * s });
    if (s > 0) { p.ra = 1.05; p.rb = 1.2 + .25 * beat; } else p.head += .06 * beat * s;
  }
  if (i === DOWN && t >= 7.95) Object.assign(p, { head: .22, hy: .012, la: -.3, ra: .3 });            // looks at the floor
  const k = TURN[i];
  if (k != null && t >= k) { const s = STU.x > e.x ? 1 : -1; Object.assign(p, { lean: .07 * s, head: .3 * s, hy: .004 }); }   // turns toward the student
  return p;
}
const SIM = simulate(P.length, (i, t) => i === 0 ? stuPose(t) : crowdPose(i, t), -.5, FILM + .1);

// ── camera: screen = A + (p − F)·z, keys [t, Fx, Fy, Ax, Ay, z]
const CAM = [[0, 300, 1340, 540, 1300, 3.0], [2.30, 300, 1340, 540, 1300, 3.0], [3.85, 300, 1340, 300, 1340, 1.0],
  [6.00, 300, 1340, 300, 1340, 1.0], [6.75, 300, 1340, 330, 1335, 1.13], [7.55, 300, 1340, 330, 1335, 1.13],
  [8.15, 300, 1340, 300, 1340, 1.0], [FILM, 300, 1340, 300, 1340, 1.0]];
function cam(t) {
  if (t <= CAM[0][0]) return CAM[0].slice(1);
  for (let i = 1; i < CAM.length; i++) if (t <= CAM[i][0]) {
    const a = CAM[i - 1], b = CAM[i], u = eio((t - a[0]) / (b[0] - a[0]));
    return [lerp(a[1], b[1], u), lerp(a[2], b[2], u), lerp(a[3], b[3], u), lerp(a[4], b[4], u), Math.exp(lerp(Math.log(a[5]), Math.log(b[5]), u))];
  }
  return CAM[CAM.length - 1].slice(1);
}
const toS = (c, x, y) => [c[2] + (x - c[0]) * c[4], c[3] + (y - c[1]) * c[4]];

// ── type: one geometric sans, left-aligned; arrives sliding up 16 px over .4 s, leaves by fading
let TXT = null;
function type(s, x, y, t, t0, t1, { size = 84, w = 600, col = C.ink, track = -2, dy = 16 } = {}) {
  if (t < t0 || t >= t1) return;
  const a = Math.min(clamp((t - t0) / .4), t1 >= FILM ? 1 : clamp((t1 - t) / .25)), u = 1 - Math.pow(1 - clamp((t - t0) / .4), 3);
  g.save(); g.globalAlpha = a; g.font = `${w} ${size}px Jost`; g.fillStyle = col; g.textBaseline = 'alphabetic'; g.letterSpacing = track + 'px';
  g.fillText(s, x, y + (1 - u) * dy);
  if (TXT) { const m = g.measureText(s); TXT.push({ id: s, text: s, x0: x, y0: y - size * .8, x1: x + m.width, y1: y + size * .25 }); }
  g.restore();
}
function caps(s, x, y, t, t0, t1, o = {}) { type(s, x, y, t, t0, t1, { size: 26, w: 500, col: C.mute, track: 3, dy: 12, ...o }); }

function drawSub(t) {
  const c = CUES.find(c => t >= c.t0 && t < c.t1); if (!c) return;
  const a = Math.min(1, (t - c.t0) / .12, (c.t1 - t) / .12);
  g.save(); g.globalAlpha = clamp(a); g.font = '500 38px Jost';
  const ws = c.text.split(' '), lines = []; let cur = '';
  for (const w of ws) { const s = cur ? cur + ' ' + w : w; if (g.measureText(s).width > 880 && cur) { lines.push(cur); cur = w; } else cur = s; }
  lines.push(cur);
  const y1 = 1496, y0 = y1 - (lines.length - 1) * 48;
  g.fillStyle = C.sig; g.fillRect(M, y0 - 34, 4, y1 - y0 + 44);
  g.fillStyle = C.ink; g.textBaseline = 'alphabetic';
  lines.forEach((l, i) => g.fillText(l, M + 22, y0 + i * 48));
  g.restore();
}

function render(t) {
  paper();
  const c = cam(t), fr = SIM.at(t);
  // ground lines (light grey), each appears with its first person
  g.save(); g.strokeStyle = '#D9D3C7'; g.lineCap = 'round';
  const lines = [...ROWS.map((r, i) => ({ y: r.y, at: 3.08 + i * .24 })), { y: STU.y, at: .05 }];
  for (const l of lines) {
    const u = eio((t - l.at) / .45); if (u <= 0) continue;
    const [x0, y] = toS(c, 60, l.y), [x1] = toS(c, 1020, l.y), xm = (x0 + x1) / 2;
    g.lineWidth = Math.max(2, 3 * Math.sqrt(c[4])); g.beginPath(); g.moveTo(lerp(xm, x0, u), y); g.lineTo(lerp(xm, x1, u), y); g.stroke();
  }
  g.restore();
  // people, back rows first
  const order = P.map((_, i) => i).sort((a, b) => P[a].y - P[b].y);
  for (const i of order) {
    const e = P[i], sc = popS(t - e.appear); if (sc <= .01) continue;
    const [sx, sy] = toS(c, e.x, e.y), S = e.h * c[4] * sc;
    if (sx < -300 || sx > W + 300 || sy - S > H || sy < -50) continue;
    let col = C.ink, fill = C.paper;
    if (GUESS.includes(i) && t >= 6.05 && t < 8.0) { const k = Math.min(clamp((t - 6.05 - GUESS.indexOf(i) * .1) / .2), clamp((8.0 - t) / .3)); col = mix(C.ink, C.mute, k); fill = mix(C.paper, C.tint, k); }   // imagined watchers
    if (TURN[i] != null) col = mix(C.ink, C.sig, clamp((t - TURN[i]) / .25));
    figure({ x: sx, gy: sy, S, col, fill, lwk: clamp(sc * 1.6) }, fr[i]);
  }
  // the thought panel: the guess, from inside the student's head (C3)
  if (t >= 6.0 && t < 7.9) {
    const a = Math.min(clamp((t - 6.0) / .35), clamp((7.9 - t) / .25)), [hx, hy] = toS(c, STU.x, STU.y - STU.h);
    g.save(); g.globalAlpha = a; g.fillStyle = C.tint; g.beginPath(); g.roundRect(hx + 120, hy - 20, 470, 230, 28); g.fill();
    for (const [dx, dy, r] of [[62, 34, 9], [92, 18, 14]]) { g.beginPath(); g.arc(hx + dx, hy + dy, r, 0, TAU); g.fill(); }
    g.restore();
    caps('THEY GUESSED', hx + 160, hy + 50, t, 6.05, 7.9);
    type('half', hx + 160, hy + 170, t, 6.25, 7.9, { size: 120 });
  }
  // type (screen space)
  type('Everyone saw that?', M, 330, t, .45, 2.3, { size: 84 });
  caps('CORNELL STUDY · 2000', M, 250, t, 2.75, 7.85);
  type('Real number?', M, 360, t, 7.95, 8.9, { size: 84 });
  caps('ABOUT', M, 230, t, 9.05, FILM);
  type('1 in 4', M, 370, t, 9.12, FILM, { size: 150, dy: 22 });
  type('noticed', M + 410, 370, t, 9.35, FILM, { size: 64, w: 500, col: C.sig });
  if (!new URLSearchParams(location.search).has('nosubs')) drawSub(t);
}

const TAU = Math.PI * 2;
(async () => {
  await Promise.all([document.fonts.load('600 40px Jost'), document.fonts.load('500 40px Jost')]);
  window.DUR = FILM;
  window.render = render;
  const ev = [{ t: VO_AT, type: 'vo', id: 'narration' }];
  for (const [k, v] of Object.entries(CUE)) ev.push({ t: v, type: 'cue', name: k });
  P.forEach((e, i) => ev.push({ t: e.appear, type: 'pop', pan: +((e.x / W) * 1.2 - .6).toFixed(2) }));
  for (const [i, k] of Object.entries(TURN)) ev.push({ t: k, type: 'tick', pan: +((P[i].x / W) * 1.2 - .6).toFixed(2) });
  GUESS.forEach((i, n) => ev.push({ t: 6.05 + n * .1, type: 'click', pan: +((P[i].x / W) * 1.2 - .6).toFixed(2) }));
  ev.push({ t: 2.32, type: 'whoosh', d: 1.2 }, { t: 6.0, type: 'whoosh', d: .5 });
  window.EV = ev.sort((a, b) => a.t - b.t);
  window.SUBS_CUES = CUES.map(c => ({ t0: c.t0, t1: c.t1, text: c.text }));
  window.TEXTS = t => { TXT = []; render(t); const o = TXT; TXT = null; return o; };
  window.READY = true;
})();
})();
