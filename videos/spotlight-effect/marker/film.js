// Spotlight Effect · Marker on Paper (9:16, 11.2 s). Storyboard A in social/scripts/spotlight-effect-short.md.
// Two sheets. Sheet ①: the worry (a person, eight eyes, a red "?"). Peel. Sheet ②: the room, the blue guess, the red answer.
// Each element = one pen action [t0, t1]; sheets are built three times (boil 0/1/2) and held on twos.
// The camera moves over the paper; strokes are drawn through it. Black = structure, blue = the guess (given), red = the answer (wanted).
import { clamp, lerp, mulberry } from '/core/lib.js';
import { W, H, Ink, Stroke, line, curve, arc, circle, arrow, dashed, makePaper, composeOn, paperCanvas, reseed, setBoil, setGlyphs } from './pen.js';

const Q = new URLSearchParams(location.search);
const FILM = 11.2, SUBS = !Q.has('nosubs');
const cv = document.getElementById('c'), X = cv.getContext('2d');
const K = 'black', RD = 'red', BL = 'blue';
const ink = new Ink();
const eio = t => (t = clamp(t), t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const eo = t => 1 - Math.pow(1 - clamp(t), 3), ei = t => Math.pow(clamp(t), 2.6);

// narration: one VibeVoice take (audio/narration_final.wav) placed at 0.10 s; cue times from its word timings
const VO_AT = 0.10;
const CUES = [
  { t0: 0.10, t1: 2.25, en: 'Everyone noticed that... right?' },
  { t0: 2.35, t1: 5.85, en: 'Cornell students wore an embarrassing T-shirt into a room.' },
  { t0: 5.95, t1: 7.85, en: 'They guessed half the room noticed.' },
  { t0: 7.90, t1: 8.85, en: 'Real number?' },
  { t0: 8.90, t1: 11.2, en: 'About 1 in 4.' },
];
const CUE = { music: 2.40, drop: 7.75, reveal: 9.56 };

// ───────── sheets
const SHEETS = [];
let CUR = null, B = 0, NI = 0;
const lenOf = it => it.T ? it.T.L : it.len;
function E(t0, t1, kind, items) {
  items = [items].flat(4);
  if (B === 0) {
    const xs = items.map(it => it.T ? it.T.x + it.T.w / 2 : (it.start[0] + it.end[0]) / 2);
    CUR.EL.push({ t0, t1, kind, color: items[0].T ? items[0].T.color : items[0].color, x: xs.reduce((a, b) => a + b, 0) / xs.length });
  }
  CUR.BUILD[B][NI++] = items;
}
const T = (s, x, y, o = {}) => { const L = ink.layout(s, x, y, { font: 'Kalam', ...o }); L.align = o.align; return { T: L }; };
function pageNo(n, t) {
  E(t, t + .2, 'line', circle(978, 150, 40, { w: 5, a0: -2.6, lap: .3 }));
  E(t + .21, t + .3, 'write', T(String(n), 978, 172, { size: 60, align: 'center', jit: .3 }));
}
function sheet(def) { SHEETS.push({ EL: [], BUILD: [[], [], []], ...def }); }

// a standing person, embarrassed: one hand over the face, the other arm hanging, head down.
// foot = midpoint of the feet, s = scale (1 ≈ 300 px tall). Drawn head first so the hook reads at once.
function person(fx, fy, s, o = {}) {
  const w = (o.w ?? 9) * Math.sqrt(s), at = (u, v) => [fx + u * s, fy - v * s], out = [];
  const hip = at(0, 120), neck = at(-2, 226), head = at(-9, 258);
  out.push(circle(...head, 32 * s, { w, a0: 2.3, lap: .22 }));                                          // head, dipped forward
  out.push(curve([neck, at(3, 176), hip], { w }));                                                      // body, a slight slump
  out.push(curve([at(-2, 222), at(-46, 214), at(-30, 250)], { w }));                                    // hand up over the face
  out.push(curve([at(2, 220), at(24, 172), at(26, 124)], { w }));                                       // the other arm, limp
  out.push(curve([hip, at(-16, 60), at(-30, 0)], { w }), curve([hip, at(14, 60), at(28, 0)], { w }));   // legs
  return { strokes: out, torso: at(0, 175), head, at };
}
// a seated person seen from the back of the room: head + shoulders
const sitter = (x, y, w = 7.5) => [circle(x, y, 30, { w, a0: -2.4, lap: .2 }), arc(x, y + 82, 50, Math.PI + .35, 2 * Math.PI - .35, { w })];
// an eye: an almond (two arcs) and a pupil that looks at (tx, ty)
function eye(x, y, tx, ty, r = 40) {
  const up = arc(x, y + r * .9, r * 1.25, -Math.PI + .72, -.72, { w: 6.5 });
  const lo = arc(x, y - r * .9, r * 1.25, Math.PI - .72, .72, { w: 6.5 });
  const a = Math.atan2(ty - y, tx - x), px = x + Math.cos(a) * r * .38, py = y + Math.sin(a) * r * .3;
  const dot = circle(px, py, 7, { w: 12, lap: .1, jitter: .2 });
  return [up, lo, dot];
}

// ═════════ sheet ①  0–2.85: the worry
sheet({
  id: 1, a: 0, b: 2.85, seed: 5,
  build() {
    reseed(201);
    const P = person(540, 1260, 1.75), at = P.at;
    E(0.05, 0.52, 'line', P.strokes);
    E(0.52, 0.68, 'line', [line(...at(-34, 214), ...at(36, 214), { w: 7, over: 5 }), line(...at(-34, 214), ...at(-30, 128), { w: 7 }),
      line(...at(36, 214), ...at(32, 128), { w: 7 }), line(...at(-30, 128), ...at(32, 128), { w: 7, over: 4 })]);
    E(0.70, 1.55, 'write', T('Who noticed?', 80, 270, { size: 104 }));
    pageNo(1, 1.56);
    // eight eyes on an oval around the person, all pupils on the person
    const cx = 540, cy = 930, ring = [];
    for (let i = 0; i < 8; i++) {
      const a = -Math.PI / 2 + (i + .5) * Math.PI * 2 / 8;
      ring.push([cx + Math.cos(a) * 410, cy + Math.sin(a) * 450]);
    }
    ring.sort((p, q) => Math.atan2(p[1] - cy, p[0] - cx) - Math.atan2(q[1] - cy, q[0] - cx));
    ring.forEach((p, i) => E(1.90 + i * .065, 1.90 + i * .065 + .06, 'eye', eye(p[0], p[1], P.head[0], P.head[1] + 120, 58)));
    const q = (u, v) => at(u, v);                                   // the red "?" on the shirt: the unknown, last stroke on the sheet
    E(2.48, 2.66, 'line', [curve([q(-12, 192), q(-6, 204), q(10, 202), q(12, 186), q(1, 174), q(1, 160)], { w: 10, color: RD }),
      circle(...q(1, 145), 6, { w: 13, color: RD, lap: .1, jitter: .1 })]);
  },
  cam() {        // [t, cx, cy, zoom, rot, ease]
    return [[0, 540, 1000, 1.6], [0.6, 540, 1000, 1.6], [1.85, 540, 960, 1.0, 0, 'eio'], [2.85, 540, 960, 1.0]];
  },
});

// ═════════ sheet ②  2.85–11.2: the room, the guess, the answer
const COLS = [300, 460, 620, 780], ROWS = [500, 640, 780];
const GUESS = [[0, 0], [2, 0], [1, 1], [3, 1], [0, 2], [2, 2]];   // six of twelve: the half they guessed
const REAL = [[2, 0], [3, 1], [0, 2]];                            // three of twelve: about one in four (an illustration)
sheet({
  id: 2, a: 2.85, b: FILM, seed: 9,
  build() {
    reseed(331);
    const x0 = 140, x1 = 940, y0 = 380, y1 = 1185, d0 = 975, d1 = 1140;      // the room; a door in the left wall
    E(2.95, 3.55, 'line', [line(x0, y0, x1, y0, { w: 9, over: 6 }), line(x1, y0, x1, y1, { w: 9, over: 6 }), line(x1, y1, x0, y1, { w: 9, over: 6 }),
      line(x0, y1, x0, d1, { w: 9 }), line(x0, d0, x0, y0, { w: 9, over: 6 }), arc(x0, d0, d1 - d0, Math.PI / 2 - .05, Math.PI / 2 + .9, { w: 5 })]);
    const people = [];
    for (const y of ROWS) for (const x of COLS) people.push(...sitter(x, y));
    E(3.55, 4.40, 'hatch', people);
    E(4.40, 4.85, 'write', T('Cornell, 2000', 650, 1158, { size: 44, weight: 400 }));
    E(4.85, 5.30, 'dash', [...dashed([[30, 1060], [140, 1060], [340, 1066]], { w: 6, dash: 24, gap: 14 }), ...arrow(350, 1066, 450, 1068, { w: 6 }).slice(1)]);
    const P = person(540, 1165, .8, { w: 8 });
    E(5.30, 5.80, 'line', P.strokes);
    const [tx, ty] = P.torso;
    E(5.80, 5.92, 'line', [line(tx - 28, ty - 42, tx + 30, ty - 42, { w: 5 }), line(tx - 30, ty - 42, tx - 26, ty + 30, { w: 5 }), line(tx + 30, ty - 42, tx + 27, ty + 30, { w: 5 })]);
    // B3: the guess, in blue
    GUESS.forEach(([c, r], i) => E(6.00 + i * .12, 6.10 + i * .12, 'circle', circle(COLS[c], ROWS[r] + 26, 66, { w: 7, color: BL, a0: -2.2 + i * .4, lap: .25 })));
    E(6.78, 7.38, 'write', T('guess: 1/2', 150, 1290, { size: 84, color: BL }));
    // B4: the turn
    E(7.95, 8.62, 'write', T('Real number?', 80, 270, { size: 104 }));
    pageNo(2, 8.63);
    E(8.66, 8.80, 'line', line(318, 1262, 520, 1240, { w: 9, bow: .02 }));    // the guess crossed out
    // B5: the answer, in red, last on the sheet
    REAL.forEach(([c, r], i) => E(9.00 + i * .13, 9.11 + i * .13, 'circle', circle(COLS[c], ROWS[r] + 26, 60, { w: 9, color: RD, a0: -1.6 + i * .5, lap: .28 })));
    E(9.42, 9.52, 'write', T('real:', 590, 1290, { size: 70, weight: 400 }));
    E(9.52, 9.92, 'write', T('1/4', 752, 1300, { size: 128, color: RD }));
  },
  cam() {
    return [[2.85, 540, 960, 1.0], [4.80, 540, 960, 1.0], [5.25, 360, 1050, 1.45, 0, 'eio'], [5.92, 470, 1040, 1.45],     // follow the pen in
      [6.25, 540, 700, 1.25, 0, 'eio'], [6.65, 540, 705, 1.25],                                                              // lean in on the guess
      [7.35, 540, 960, 1.0, 0, 'eio'], [9.60, 540, 960, 1.0], [10.6, 560, 1000, 1.1, 0, 'eio'], [FILM, 562, 1002, 1.11]];   // pull back; lean in on red
  },
});

// ───────── camera: keys [t, cx, cy, zoom, rot, ease]; zoom eases in log space
function camAt(S, t) {
  const k = S.keys;
  if (t <= k[0][0]) return k[0];
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) {
    const a = k[i - 1], b = k[i], ef = { eio, eo, ei }[b[5] || 'eio'], u = ef((t - a[0]) / (b[0] - a[0]));
    return [t, lerp(a[1], b[1], u), lerp(a[2], b[2], u), Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), u)), 0];
  }
  return k[k.length - 1];
}
function matrix([, cx, cy, z]) {
  if (z >= 1) { const hw = W / 2 / z, hh = H / 2 / z; cx = clamp(cx, hw, W - hw); cy = clamp(cy, hh, H - hh); }
  return [z, 0, 0, z, W / 2 - z * cx, H / 2 - z * cy];
}

// ───────── one sheet at one moment
const LIFT = 22;
const pcv = document.createElement('canvas'); pcv.width = W; pcv.height = H;
const px = pcv.getContext('2d', { willReadFrequently: true });
function drawSheet(S, t, out) {
  const f = Math.floor(t * 12 + 1e-6), tq = f / 12, boil = f % 3;
  const M = matrix(camAt(S, t));
  ink.clear(); ink.setCamera(M);
  S.EL.forEach((e, i) => {
    const p = clamp((tq - e.t0) / (e.t1 - e.t0));
    if (p <= 0) return;
    const items = S.BUILD[boil][i], lens = items.map(lenOf), tot = lens.reduce((a, b) => a + b, 0) + LIFT * (items.length - 1);
    let left = p >= 1 ? Infinity : p * tot;
    for (let k = 0; k < items.length && left > 0; k++) {
      const it = items[k];
      if (it.T) ink.write(it.T, left); else ink.stroke(it, left);
      left -= lens[k] + LIFT;
    }
  });
  px.setTransform(1, 0, 0, 1, 0, 0); px.fillStyle = '#f8f7f3'; px.fillRect(0, 0, W, H);
  px.setTransform(...M); px.imageSmoothingQuality = 'high'; px.drawImage(S.paperC, 0, 0); px.setTransform(1, 0, 0, 1, 0, 0);
  composeOn(px.getImageData(0, 0, W, H).data, ink, out);
  return out;
}

// ───────── the peel (sheet ① → ②): a fold line sweeps from bottom-right to top-left
const V = (a, b) => [b[0] - a[0], b[1] - a[1]];
const nrm = v => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
const PP = (o, u, s) => [o[0] + u[0] * s, o[1] + u[1] * s];
const imA = X.createImageData(W, H), imB = X.createImageData(W, H);
const cA = document.createElement('canvas'); cA.width = W; cA.height = H;
const cB = document.createElement('canvas'); cB.width = W; cB.height = H;
const PEEL = { a: 2.70, b: 3.25 };
function peelFrame(t, SA, SB) {
  const u = eio((t - PEEL.a) / (PEEL.b - PEEL.a));
  drawSheet(SA, Math.min(t, SA.b - .01), imA); cA.getContext('2d').putImageData(imA, 0, 0);
  drawSheet(SB, t, imB); cB.getContext('2d').putImageData(imB, 0, 0);
  const n = nrm([-W, -H]), BR = [W, H], diag = Math.hypot(W, H), s = lerp(-20, diag + 260, u);
  const F = PP(BR, n, s), tv = [-n[1], n[0]];
  const half = sign => { X.beginPath(); const L = 5000; const a = PP(F, tv, -L), b = PP(F, tv, L); X.moveTo(...a); X.lineTo(...b); X.lineTo(...PP(b, n, sign * L)); X.lineTo(...PP(a, n, sign * L)); X.closePath(); };
  X.drawImage(cB, 0, 0);
  X.save(); half(-1); X.clip();
  const g = X.createLinearGradient(...F, ...PP(F, n, -46)); g.addColorStop(0, 'rgba(70,63,51,.14)'); g.addColorStop(1, 'rgba(70,63,51,0)');
  X.fillStyle = g; X.fillRect(0, 0, W, H); X.restore();
  X.save(); half(1); X.clip(); X.drawImage(cA, 0, 0); X.restore();
  const refl = p => { const d = (p[0] - F[0]) * n[0] + (p[1] - F[1]) * n[1]; return PP(p, n, -2 * d * .86); };
  const corners = [[0, 0], [W, 0], [W, H], [0, H]], poly2 = [];
  for (let i = 0; i < 4; i++) {
    const p = corners[i], q = corners[(i + 1) % 4], dp = (p[0] - F[0]) * n[0] + (p[1] - F[1]) * n[1], dq = (q[0] - F[0]) * n[0] + (q[1] - F[1]) * n[1];
    if (dp < 0) poly2.push(p);
    if ((dp < 0) !== (dq < 0)) { const r = dp / (dp - dq); poly2.push([lerp(p[0], q[0], r), lerp(p[1], q[1], r)]); }
  }
  if (poly2.length > 2) {
    const fl = poly2.map(refl);
    X.save(); X.beginPath(); fl.forEach((p, i) => i ? X.lineTo(...p) : X.moveTo(...p)); X.closePath();
    X.save(); X.shadowColor = 'rgba(60,52,40,.16)'; X.shadowBlur = 18; X.shadowOffsetX = -4; X.shadowOffsetY = -3;
    const g2 = X.createLinearGradient(...F, ...PP(F, n, 520)); g2.addColorStop(0, '#e2e0d9'); g2.addColorStop(.35, '#efede8'); g2.addColorStop(1, '#f7f6f2');
    X.fillStyle = g2; X.fill(); X.restore();
    X.strokeStyle = 'rgba(150,142,128,.35)'; X.lineWidth = 1; X.stroke(); X.restore();
  }
}

// ───────── subtitles: a torn slip of the same paper, above the Shorts caption band (bottom 400 px stay free)
function drawSub(t) {
  const c = CUES.find(c => t >= c.t0 && t < c.t1); if (!c) return;
  const al = Math.min(1, (t - c.t0) / .12, (c.t1 - t) / .12);
  X.save(); X.globalAlpha = clamp(al);
  X.font = '400 40px "Kalam"';
  const words = c.en.split(' '), lines = [];
  let cur = '';
  for (const w of words) { const s = cur ? cur + ' ' + w : w; if (X.measureText(s).width > 900 && cur) { lines.push(cur); cur = w; } else cur = s; }
  lines.push(cur);
  const w = Math.max(...lines.map(l => X.measureText(l).width)) + 64, x0 = (W - w) / 2, y1 = 1505, y0 = y1 - 36 - lines.length * 50, R = mulberry(c.en.length * 31 + 7);
  X.beginPath(); X.moveTo(x0, y0); X.lineTo(x0 + w, y0);
  for (let y = y0; y <= y1; y += 7) X.lineTo(x0 + w + (R() - .5) * 7, y);
  X.lineTo(x0, y1);
  for (let y = y1; y >= y0; y -= 7) X.lineTo(x0 + (R() - .5) * 7, y);
  X.closePath();
  X.fillStyle = 'rgba(251,250,247,.96)'; X.fill();
  X.strokeStyle = 'rgba(70,63,51,.16)'; X.lineWidth = 1; X.stroke();
  X.fillStyle = '#1B1C20'; X.textAlign = 'center';
  lines.forEach((l, i) => X.fillText(l, W / 2, y0 + 58 + i * 50));
  X.restore();
}

const IM = X.createImageData(W, H);
function renderFilm(t) {
  if (t >= PEEL.a && t < PEEL.b) peelFrame(t, SHEETS[0], SHEETS[1]);
  else { drawSheet(t < PEEL.a ? SHEETS[0] : SHEETS[1], t, IM); X.putImageData(IM, 0, 0); }
  if (SUBS) drawSub(t);
}

async function boot() {
  for (const f of [new FontFace('Kalam', 'url(fonts/Kalam-Bold.ttf)', { weight: '700' }), new FontFace('Kalam', 'url(fonts/Kalam-Regular.ttf)', { weight: '400' })]) { await f.load(); document.fonts.add(f); }
  setGlyphs(await (await fetch('glyphs.json')).json());
  for (const S of SHEETS) {
    CUR = S;
    for (B = 0; B < 3; B++) { NI = 0; setBoil(B); S.build(); }
    setBoil(0);
    S.keys = S.cam();
    S.paperC = paperCanvas(makePaper(S.seed));
  }
  window.DUR = FILM;
  window.render = renderFilm;
  const ev = [];
  for (const S of SHEETS) S.EL.forEach((e, i) => {
    const items = S.BUILD[0][i], lens = items.map(lenOf), tot = lens.reduce((a, b) => a + b, 0) + LIFT * (items.length - 1);
    let acc = 0;
    items.forEach((it, k) => {
      const a = e.t0 + (e.t1 - e.t0) * acc / tot, b = e.t0 + (e.t1 - e.t0) * (acc + lens[k]) / tot;
      const segs = it.T ? it.T.gl.map(g => ({ t: a + (b - a) * g.L0 / it.T.L, d: (b - a) * g.len / it.T.L * .9 })) : [{ t: a, d: b - a }];
      for (const g of segs) ev.push({ t: +g.t.toFixed(4), d: +Math.max(.02, g.d).toFixed(4), type: 'stroke', kind: e.kind, col: e.color, pan: +clamp(e.x / W * 2 - 1, -1, 1).toFixed(3) });
      acc += lens[k] + LIFT;
    });
  });
  ev.push({ t: PEEL.a, type: 'peel', d: PEEL.b - PEEL.a });
  for (const [k, v] of Object.entries(CUE)) ev.push({ t: v, type: 'cue', name: k });
  ev.push({ t: VO_AT, type: 'vo', id: 'narration' });
  window.EV = ev.filter(e => e.t > -1e-6 && e.t < FILM).sort((a, b) => a.t - b.t);
  window.SUBS_CUES = CUES.map(c => ({ t0: c.t0, t1: c.t1, text: c.en }));
  window.TEXTS = t => {
    const S = t < PEEL.b ? SHEETS[0] : SHEETS[1], M = matrix(camAt(S, t)), out = [];
    S.EL.forEach((e, i) => {
      if (e.kind !== 'write' || t < e.t0) return;
      const its = S.BUILD[0][i].filter(it => it.T); if (!its.length) return;
      for (const { T: L } of its) {
        const ax = L.align === 'center' ? -L.w / 2 : 0;
        const sx0 = M[0] * (L.x + ax) + M[4], sx1 = M[0] * (L.x + ax + L.w) + M[4], sy0 = M[3] * (L.y - L.size * .8) + M[5], sy1 = M[3] * (L.y + L.size * .25) + M[5];
        out.push({ id: `s${S.id}-${i}`, text: L.str, x0: sx0, y0: sy0, x1: sx1, y1: sy1, pass: L.str.length < 3 });
      }
    });
    return out;
  };
  window.READY = true;
}
boot();
