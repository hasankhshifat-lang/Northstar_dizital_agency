// The Overthinking Pad, episode 2026-11-16: "Why You Feel Like Everyone Is Watching You" (the spotlight effect).
// Drawings and camera per scene. Each scene: block [x, y, w, h] on the endless sheet (world units), a purpose,
// a shot note (camera move and why), an SFX cue, and draw(S, L) which registers the strokes.
// S.at('word', nth) = the moment that word is spoken; S.f(u) = a fraction u of the line; S.t0 / S.end = scene bounds.
// Layout: row 0 = the cold open (and the ending comes back to it), rows 1-5 = chapters 1-5, left to right.
const BW = 1600, BH = 900, GX = 1800, GY = 1150;
const blk = (row, col, w = BW, h = BH) => [1500 + (col - 1) * GX, row * GY, w, h];
const banner = row => [-200, row * GY + 180, 1400, 560];

// ---------- shared parts ----------
// a row of n heads; `hi` = indices outlined in yellow (people who noticed). returns end time
function headRow(L, x, y, n, gap, r, t0, o = {}) {
  const { hi = [], k = 0.5, kinds = null } = o; let t = t0;
  for (let i = 0; i < n; i++) {
    const cx = x + i * gap;
    L.head(cx, y, r, t, { k, hair: ['tuft', 'long', 'bun', 'curly', 'cap', 'messy'][i % 6], kind: kinds ? kinds[i] : 'neutral', look: [0, 0] });
    t += 0.06;
  }
  return t;
}
function highlight(L, x, y, gap, r, idx, t0, d = 0.12) { idx.forEach((i, q) => L.MST(L.ell(x + i * gap, y, r * 1.45, r * 1.5, -0.3, L.TAU + 0.3, 50), { w: 9, col: L.YELD, amp: 1.5 }, t0 + q * d, d * 0.9)); return t0 + idx.length * d; }
function tshirt(L, cx, cy, s, t0, o = {}) {   // a T-shirt on its own (front view)
  const k = o.k || 1;
  const P = [[-60, -80], [-25, -92], [-12, -78], [12, -78], [25, -92], [60, -80], [96, -40], [72, -18], [56, -36], [56, 92], [-56, 92], [-56, -36], [-72, -18], [-96, -40]].map(([x, y]) => [cx + x * s, cy + y * s]);
  L.FILL(P, t0); L.dropShadow(P, 8 * s, 9 * s, t0 + 0.2 * k, 0.06);
  if (o.tint) L.MRK([P], { col: o.tint, w: 16 }, t0 + 0.22 * k, 0.12 * k);
  L.INK_(P, { closed: true, w: 3.2, amp: 0.8 }, t0, 0.24 * k);
  L.INK_(L.quad([cx - 12 * s, cy - 78 * s], [cx, cy - 64 * s], [cx + 12 * s, cy - 78 * s]), { w: 2.6, amp: 0.2, passes: 1 }, t0 + 0.22 * k, 0.05);
  let t = t0 + 0.28 * k;
  if (o.print) t = L.shirtPrint(cx, cy + 6 * s, s * 2.3, t, o.print, { k });
  return t;
}
function tag(L, x, y, text, size, t0, o = {}) {   // a dark-outlined label box with text
  const ctx = L.G.ctx; ctx.save(); ctx.font = `${size}px ${o.f || 'KB'}`; const w = ctx.measureText(text).width + size * 1.1; ctx.restore();
  const h = size * 1.5, x0 = o.align === 'left' ? x : x - w / 2;
  L.box(x0, y - h / 2, w, h, t0, 0.22, { r: 14, tint: o.tint || null, shadow: o.shadow ?? true });
  return L.TXT(text, x0 + w / 2, y + size * 0.34, size, { f: o.f || 'KB', align: 'center' }, t0 + 0.2, o.td ?? null);
}
function numDot(L, cx, cy, n, t0, r = 40) { const c = L.ell(cx, cy, r, r, 0, L.TAU, 30); L.FILL(c, t0); L.MRK([c], { col: L.YEL, w: 12 }, t0 + 0.1, 0.1); L.INK_(c, { closed: true, w: 3, amp: 0.5 }, t0, 0.14); return L.TXT(String(n), cx, cy + r * 0.42, r * 1.25, { f: 'KB', align: 'center' }, t0 + 0.14, 0.2); }
function room(L, x, y, w, h, t0, o = {}) {   // the floor line and back wall of a room (no box)
  L.INK_(L.line(x, y + h, x + w, y + h), { w: 3.2, amp: 1 }, t0, 0.2);
  L.INK_(L.line(x + 30, y, x + 30, y + h), { w: 2.2, amp: 0.8, passes: 1, alpha: 0.6 }, t0 + 0.1, 0.12);
  return t0 + 0.25;
}
function lampHeld(L, hx, hy, ang, t0) {   // a desk lamp held by its handle at [hx,hy], shining at angle ang
  const c = Math.cos(ang), s = Math.sin(ang), P = (u, v) => [hx + c * u - s * v, hy + s * u + c * v];
  const handle = [P(-10, -8), P(40, -8), P(40, 8), P(-10, 8)];
  const shade = [P(40, -14), P(40, 14), P(96, 44), P(96, -44)];
  L.FILL(handle, t0); L.MRK([handle], { col: L.GRYD, w: 8, edge: false }, t0 + 0.04, 0.04); L.INK_(handle, { closed: true, w: 2.6, amp: 0.2, passes: 1 }, t0, 0.06);
  L.FILL(shade, t0 + 0.06); L.MRK([shade], { col: L.GRY2, w: 10 }, t0 + 0.1, 0.06); L.INK_(shade, { closed: true, w: 3, amp: 0.4 }, t0 + 0.06, 0.1);
  return { end: t0 + 0.18, mouth: P(96, 0) };
}

// ---------- the long film ----------
const LONG = {};
const def = (F, id, block, o, draw) => { F[id] = { block, ...o, draw }; };

// ===== cold open =====
def(LONG, 'hook1', blk(0, 1), { purpose: 'hook: the feeling, shown before it is explained', shot: 'starts close on "you" in the doorway, pulls back to reveal the room of eyes (reveal)', sfx: 'pen only, then a soft marker swish for the light', noAutoCam: true }, (S, L) => {
  const [x, y] = S.block = blk(0, 1);
  S.cam(S.t0 - 0.01, x + 430, y + 420, 2.1, 0.01); S.cam(S.at('everyone') - 0.4, x + 800, y + 470, 1.06, 2.2, 'io');
  L.door(x + 230, y + 760, 170, 360, S.t0 + 0.05, { open: 0.85, k: 1.4 });
  const P = L.person(x + 470, y + 760, 1.6, S.t0 + 0.3, { pose: 'walk', you: true, kind: 'worry', look: [0.8, 0], hair: 'tuft', shirt: 'stain', k: 1.5 });
  L.spotlight(x + 470, y + 110, x + 470, y + 770, 300, S.at('awful'), { k: 1.2 });
  const seats = [[1000, 'bun', [-0.9, 0]], [1220, 'curly', [-0.9, 0.1]], [1440, 'cap', [-1, 0]]];
  seats.forEach(([sx, hair], i) => L.student(x + sx, y + 760, 1.25, S.at('everyone') + 0.15 + i * 0.25, { hair, kind: 'neutral', look: [-1, 0], dir: -1, k: 0.8 }));
  L.loop(x + 498, y + 584, 40, 34, S.at('stain'), 0.4);
  L.motion(x + 380, y + 735, -70, 3, S.at('trip'));
  L.TXT('!', x + 380, y + 700, 70, { f: 'KB', align: 'center' }, S.at('trip') + 0.15, 0.2);
  L.bubble(x + 560, y + 190, 250, 110, S.at('loud') - 0.25, { tail: [x + 520, y + 420], text: 'HI!!', size: 66 });
});
def(LONG, 'hook2', blk(0, 2), { purpose: 'name the feeling; a team decided to count', shot: 'pan right to the next block (cause → effect); slow push while the tally is written', sfx: 'tally strokes' }, (S, L) => {
  const [x, y] = blk(0, 2);
  L.TXT('that feeling has a name...', x + 120, y + 170, 64, { f: 'PH', col: L.INK2 }, S.at('name') - 0.3, 1.1);
  tag(L, x + 520, y + 360, 'CORNELL · 2000', 70, S.at('cornell') - 0.2);
  const cb = [[x + 960, y + 250], [x + 1360, y + 250], [x + 1360, y + 780], [x + 960, y + 780]];
  L.FILL(cb, S.at('team')); L.dropShadow(cb, 9, 10, S.at('team') + 0.3); L.INK_(cb, { closed: true, w: 3.2, amp: 1 }, S.at('team'), 0.3);
  const clip = L.rrect(x + 1100, y + 228, 120, 46, 10); L.FILL(clip, S.at('team') + 0.3); L.MRK([clip], { col: L.GRY2, w: 10 }, S.at('team') + 0.4, 0.08); L.INK_(clip, { closed: true, w: 3, amp: 0.4 }, S.at('team') + 0.3, 0.1);
  L.TXT('who noticed?', x + 1160, y + 350, 50, { f: 'KB', align: 'center' }, S.at('guessing'), 0.8);
  const tc = S.at('count');
  for (let g = 0; g < 2; g++) { for (let i = 0; i < 4; i++) L.INK_(L.line(x + 1010 + g * 170 + i * 26, y + 450, x + 1006 + g * 170 + i * 26, y + 560), { w: 4, amp: 0.4, passes: 1 }, tc + (g * 5 + i) * 0.09, 0.07); L.INK_(L.line(x + 995 + g * 170, y + 540, x + 1105 + g * 170, y + 465), { w: 4, amp: 0.4, passes: 1 }, tc + (g * 5 + 4) * 0.09, 0.08); }
  L.person(x + 560, y + 820, 1.3, S.at('psychologists'), { pose: 'hold', kind: 'think', look: [1, -0.3], hair: 'curly', k: 0.9 });
});
def(LONG, 'hook3', blk(0, 3), { purpose: 'the experiment in one line: shirt → room → question', shot: 'pan right; the three steps read left to right', sfx: 'pen; a page tap on the question mark' }, (S, L) => {
  const [x, y] = blk(0, 3);
  tshirt(L, x + 240, y + 400, 1.5, S.at('shirt') - 0.3, { print: 'face', k: 0.9 });
  L.TXT('embarrassing', x + 240, y + 620, 46, { f: 'PH', align: 'center', col: L.INK2 }, S.at('embarrassed'), 0.6);
  L.fatArrow(x + 420, y + 400, x + 560, S.at('sent'));
  const rb = L.rrect(x + 600, y + 230, 440, 340, 24); L.box(x + 600, y + 230, 440, 340, S.at('room'), 0.3);
  for (let i = 0; i < 6; i++) { const hx = x + 680 + (i % 3) * 140, hy = y + 320 + Math.floor(i / 3) * 150; L.head(hx, hy, 34, S.at('room') + 0.3 + i * 0.08, { k: 0.35, hair: ['bun', 'tuft', 'long', 'cap', 'curly', 'messy'][i] }); }
  L.fatArrow(x + 1070, y + 400, x + 1200, S.at('asked'));
  L.qmark(x + 1340, y + 470, 220, S.at('question'));
  L.TXT('how many noticed?', x + 1340, y + 640, 52, { f: 'KB', align: 'center' }, S.at('many'), 0.9);
});
def(LONG, 'hook4', blk(0, 4), { purpose: 'the answer as a teaser + the real question (where you stand)', shot: 'pan right; push in on "½" while it is written', sfx: 'marker swash on ½' }, (S, L) => {
  const [x, y] = blk(0, 4);
  L.TXT('≈ 1/2', x + 330, y + 400, 230, { f: 'KB', align: 'center' }, S.at('half') - 0.1, 0.6);
  L.swash(x + 170, y + 430, x + 500, S.at('half') + 0.5, 0.3);
  L.TXT('of what they expected', x + 330, y + 520, 50, { f: 'PH', align: 'center', col: L.INK2 }, S.at('expected'), 0.9);
  const P = L.person(x + 1080, y + 780, 1.45, S.at('standing') - 0.4, { pose: 'stand', you: true, kind: 'worry', look: [0, -0.4], k: 1 });
  const eyes = [[-330, -420], [-170, -560], [170, -560], [330, -420], [-380, -160], [380, -160]];
  eyes.forEach(([dx, dy], i) => L.eyeIcon(x + 1080 + dx, y + 780 + dy, 1.0, S.at('picture') + i * 0.12, { look: [-Math.sign(dx) * 0.8, 0.6] }));
  L.TXT('through other eyes', x + 1080, y + 120, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('eyes'), 0.6);
});
def(LONG, 'sting', blk(0, 5, 1300, 600), { purpose: 'channel sting (≤ 2 s, after the hook)', shot: 'whip right across empty dots to the banner', sfx: 'paper whoosh + one kalimba note', ease: 'q', move: 0.6 }, (S, L) => {
  const [x, y] = blk(0, 5, 1300, 600);
  L.ribbon(x + 650, y + 280, 860, 120, 'THE OVERTHINKING PAD', 64, S.t0 + 0.2, { d: 0.35, td: 0.9 });
  L.MST(L.bez([x + 520, y + 420], [x + 600, y + 520], [x + 740, y + 380], [x + 800, y + 470]), { w: 4, col: L.INK, amp: 1 }, S.t0 + 1.2, 0.4);
});

// ===== chapter 1: the shirt =====
const chapter = (F, id, row, n, title) => def(F, id, banner(row), { purpose: `chapter ${n} title`, shot: 'whip across the page to the numbered banner (a jump in thought)', sfx: 'paper whoosh, kalimba note', ease: 'q', move: 0.75 }, (S, L) => {
  const [x, y] = banner(row);
  numDot(L, x + 180, y + 280, n, S.t0 + 0.25, 64);
  L.ribbon(x + 760, y + 280, Math.max(560, title.length * 44), 120, title, 70, S.t0 + 0.45, { d: 0.3, td: 0.9 });
});
chapter(LONG, 'ch1', 1, 1, 'THE SHIRT');
def(LONG, 'c1a', blk(1, 1), { purpose: 'who ran it; the problem they had to solve', shot: 'pan right from the banner; push as the names are written', sfx: 'lettering' }, (S, L) => {
  const [x, y] = blk(1, 1);
  [['GILOVICH', 'tuft', 'gilovich'], ['MEDVEC', 'long', 'medvec'], ['SAVITSKY', 'curly', 'savitsky']].forEach(([n, hair, w], i) => {
    const cx = x + 260 + i * 400, t = S.at(w) - 0.5;
    L.box(cx - 170, y + 120, 340, 380, t, 0.25, { r: 20 });
    L.head(cx, y + 270, 70, t + 0.2, { hair, kind: 'think', look: [0, 0], k: 0.6 });
    L.TXT(n, cx, y + 450, 50, { f: 'KB', align: 'center' }, t + 0.5, 0.5);
  });
  tshirt(L, x + 760, y + 700, 1.0, S.at('shirt') - 0.2, { k: 0.8 });
  L.qmark(x + 900, y + 690, 110, S.at('seen') - 0.2);
  L.TXT('a shirt nobody wants to be seen in', x + 760, y + 860, 46, { f: 'PH', align: 'center', col: L.INK2 }, S.at('really'), 1.1);
});
def(LONG, 'c1b', blk(1, 2), { purpose: 'the shirt itself (and no mockery: a fact about that time and place)', shot: 'pan right; close on the shirt, then the meter', sfx: 'marker on the shirt; needle tick' }, (S, L) => {
  const [x, y] = blk(1, 2);
  tshirt(L, x + 420, y + 440, 2.3, S.at('t-shirt') - 0.3, { print: 'face', k: 1.2 });
  L.TXT('the singer', x + 420, y + 820, 52, { f: 'KB', align: 'center' }, S.at('singer'), 0.5);
  L.TXT('Barry Manilow', x + 420, y + 880, 42, { f: 'PH', align: 'center', col: L.INK2 }, S.at('barry'), 0.6);
  const hx = x + 640, hy = y + 210; L.MST(L.bez([hx, hy + 30], [hx - 40, hy - 20], [hx - 10, hy - 50], [hx, hy - 20]).concat(L.bez([hx, hy - 20], [hx + 10, hy - 50], [hx + 40, hy - 20], [hx, hy + 30])), { w: 6, col: L.YELD }, S.at('nothing'), 0.3);
  const mx = x + 1000, my = y + 520;
  L.INK_(L.ell(mx + 220, my, 230, 230, Math.PI, L.TAU, 50), { w: 3.4, amp: 0.6 }, S.at('rated') - 0.3, 0.3);
  for (let i = 0; i <= 6; i++) { const a = Math.PI + i * Math.PI / 6; L.INK_(L.line(mx + 220 + Math.cos(a) * 200, my + Math.sin(a) * 200, mx + 220 + Math.cos(a) * 228, my + Math.sin(a) * 228), { w: 2.4, amp: 0.2, passes: 1 }, S.at('rated') + i * 0.03, 0.03); }
  L.TXT('fine', mx + 30, my + 50, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('rated') + 0.2, 0.3);
  L.TXT('cringe', mx + 410, my + 50, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('rated') + 0.4, 0.3);
  const na = -0.45; L.INK_(L.line(mx + 220, my, mx + 220 + Math.cos(na) * 190, my + Math.sin(na) * 190), { w: 5, amp: 0.3 }, S.at('embarrassing') - 0.1, 0.25);
  L.MST(L.ell(mx + 220 + Math.cos(na) * 190, my + Math.sin(na) * 190, 26, 26), { w: 6, col: L.YELD }, S.at('embarrassing') + 0.2, 0.25);
  L.TXT('students rated it embarrassing (then, there)', mx + 220, my + 150, 36, { f: 'PH', align: 'center', col: L.INK2 }, S.at('wear') - 0.4, 1.2);
});
def(LONG, 'c1b2', blk(1, 3), { purpose: 'why a shirt: something observers could check, no mind-reading needed', shot: 'pan right; an eye looks at the shirt, two outcomes side by side', sfx: 'pen; check and cross scratches' }, (S, L) => {
  const [x, y] = blk(1, 3);
  tshirt(L, x + 330, y + 420, 1.4, S.t0 + 0.1, { print: 'face', k: 0.7 });
  L.eyeIcon(x + 330, y + 130, 2.2, S.at('check') - 0.4, { look: [0, 1] });
  L.inkArrow([[x + 330, y + 190], [x + 330, y + 260]], { w: 3, amp: 0.3, head: 14 }, S.at('check'), 0.2);
  L.TXT('anyone could check', x + 330, y + 700, 48, { f: 'KB', align: 'center' }, S.at('themselves') - 0.4, 0.7);
  L.bubble(x + 760, y + 140, 330, 190, S.at('guessing') - 0.3, { thought: true, size: 40, text: 'thoughts?' });
  L.cross(x + 1140, y + 230, 1.8, S.at('feelings'));
  L.box(x + 700, y + 470, 340, 200, S.at('saw') - 0.3, 0.25, { r: 18, tint: 'rgba(255,205,40,0.3)' });
  L.TXT('saw it', x + 870, y + 585, 54, { f: 'KB', align: 'center' }, S.at('saw'), 0.4); L.check(x + 990, y + 560, 1.4, S.at('saw') + 0.4);
  L.box(x + 1110, y + 470, 340, 200, S.at('didn\'t') - 0.4, 0.25, { r: 18 });
  L.TXT("didn't", x + 1280, y + 585, 54, { f: 'KB', align: 'center' }, S.at('didn\'t') - 0.1, 0.4); L.cross(x + 1400, y + 560, 1.2, S.at('didn\'t') + 0.3);
});
def(LONG, 'c1c', blk(1, 4, 1700, 900), { purpose: 'the procedure, acted out: walk in, sit among questionnaires, walk out', shot: 'pan right; the camera eases from the door toward the seated students (follows the walk)', sfx: 'door creak (paper), pen', noAutoCam: true }, (S, L) => {
  const B = blk(1, 4, 1700, 900), [x, y] = B, c = S.fit(B);
  S.cam(S.t0 - 0.25, x + 520, c.y, c.z * 1.25, 1.1); S.cam(S.at('room') , c.x, c.y, c.z, 1.6, 'io'); S.cam(S.at('taken') - 0.6, x + 520, c.y, c.z * 1.15, 1.4, 'io');
  room(L, x, y + 60, 1700, 760, S.t0);
  L.door(x + 120, y + 820, 160, 340, S.t0 + 0.1, { open: 0.8 });
  const P = L.person(x + 400, y + 820, 1.45, S.at('puts') - 0.1, { pose: 'walk', you: true, kind: 'worry', look: [1, 0], shirt: 'face', k: 1.1 });
  const tS = S.at('students') - 0.3;
  [[760, 'bun'], [990, 'tuft'], [1220, 'long'], [1450, 'curly']].forEach(([sx, hair], i) => L.student(x + sx, y + 820, 1.15, tS + i * 0.3, { hair, kind: 'think', look: [0.6, 0.8], dir: 1, k: 0.7 }));
  L.TXT('questionnaires', x + 1100, y + 470, 42, { f: 'PH', align: 'center', col: L.INK2 }, S.at('questionnaires'), 0.6);
  L.clock(x + 620, y + 220, 50, S.at('short'));
  L.TXT('a short while', x + 620, y + 320, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('while'), 0.5);
  L.inkArrow(L.bez([x + 520, y + 470], [x + 420, y + 380], [x + 300, y + 400], [x + 230, y + 470]), { w: 3.4, amp: 0.6, head: 20 }, S.at('taken') - 0.2, 0.4);
  L.TXT('back out', x + 380, y + 360, 42, { f: 'KB', align: 'center' }, S.at('out'), 0.4);
});
def(LONG, 'c1d', blk(1, 5), { purpose: 'the question the wearer has to answer', shot: 'pan right; push into the question card (attention)', sfx: 'page tap' }, (S, L) => {
  const [x, y] = blk(1, 5);
  L.box(x + 380, y + 150, 900, 360, S.at('question') - 0.4, 0.35, { tint: 'rgba(255,205,40,0.25)' });
  L.TXT('How many people in that room', x + 830, y + 290, 60, { f: 'KB', align: 'center' }, S.at('many'), 0.9);
  L.TXT('could say who was on your shirt?', x + 830, y + 390, 60, { f: 'KB', align: 'center' }, S.at('could'), 1.0);
  L.person(x + 250, y + 830, 1.3, S.at('question'), { pose: 'stand', you: true, shirt: 'face', kind: 'think', look: [0.8, -0.8], k: 0.9 });
  L.TXT('0 ... 100%', x + 830, y + 640, 54, { f: 'PH', align: 'center', col: L.INK2 }, S.at('shirt') + 0.3, 0.5);
});
def(LONG, 'c1e', blk(1, 6), { purpose: 'how it feels from the inside: every head turns', shot: 'pan right; centred on "you", heads turn toward them one by one', sfx: 'small pen ticks as each pair of eyes turns' }, (S, L) => {
  const [x, y] = blk(1, 6);
  tag(L, x + 800, y + 80, 'how it FEELS', 48, S.t0 + 0.2);
  const P = L.person(x + 800, y + 820, 1.55, S.at('shoes') - 0.3, { pose: 'stand', you: true, shirt: 'face', kind: 'worry', look: [0, 0], k: 1 });
  const ring = [[-560, -260], [-430, -470], [-200, -560], [200, -560], [430, -470], [560, -260]];
  const hs = ring.map(([dx, dy], i) => ({ cx: x + 800 + dx, cy: y + 820 + dy, i }));
  hs.forEach(h => L.head(h.cx, h.cy, 46, S.at('giant') + h.i * 0.08, { k: 0.5, hair: ['bun', 'tuft', 'long', 'cap', 'curly', 'messy'][h.i], kind: 'bored', look: [Math.sign(h.cx - x - 800) * 1, -0.6] }));
  const tt = S.at('heads');
  hs.forEach(h => { const dx = (x + 800 - h.cx), dy = (y + 560 - h.cy), d = Math.hypot(dx, dy); L.react({ head: [h.cx, h.cy, 46] }, tt + h.i * 0.12, { kind: 'shock', look: [dx / d, dy / d], k: 0.6 }); });
  L.TXT('OF COURSE THEY SAW IT', x + 800, y + 880, 54, { f: 'KB', align: 'center' }, S.at('course') - 0.1, 0.8);
});
def(LONG, 'c1f', blk(1, 7), { purpose: 'the guess, made visible: half the heads light up', shot: 'pan right; hold the whole row so it can be counted', sfx: 'marker swishes per highlighted head' }, (S, L) => {
  const [x, y] = blk(1, 7);
  L.TXT('THE GUESS', x + 140, y + 150, 84, { f: 'KB' }, S.at('guessed') - 0.3, 0.6);
  headRow(L, x + 150, y + 330, 12, 118, 40, S.at('guessed'), { k: 0.4 });
  highlight(L, x + 150, y + 330, 118, 40, [0, 1, 2, 3, 4, 5], S.at('half') - 0.2, 0.14);
  L.TXT('≈ half the room', x + 1180, y + 170, 64, { f: 'KB', align: 'center' }, S.at('room') - 0.1, 0.6);
  L.swash(x + 980, y + 190, x + 1380, S.at('room') + 0.6, 0.3);
});
def(LONG, 'c1g', blk(1, 7), { purpose: 'the count: a quarter light up (the reveal)', shot: 'tilt down within the same block to the second row, then a slow push (reading time)', sfx: 'silence on the pause, then three marker swishes', camFit: [1500 + 6 * 1800, 1150 + 120, 1600, 760] }, (S, L) => {
  const [x, y] = blk(1, 7);
  L.TXT('THE COUNT', x + 140, y + 560, 84, { f: 'KB' }, S.at('asked') - 0.2, 0.6);
  headRow(L, x + 150, y + 730, 12, 118, 40, S.at('room'), { k: 0.4 });
  highlight(L, x + 150, y + 730, 118, 40, [1, 5, 9], S.at('quarter') - 0.4, 0.18);
  L.TXT('≈ a quarter', x + 1180, y + 580, 64, { f: 'KB', align: 'center' }, S.at('quarter') - 0.1, 0.5);
  L.swash(x + 1000, y + 600, x + 1360, S.at('quarter') + 0.4, 0.3);
});
def(LONG, 'c1h', blk(1, 8), { purpose: 'compare: guess vs count, the audience doubled', shot: 'pan right; bars grow from the base (comparison held whole)', sfx: 'marker bars, a kalimba accent on ×2' }, (S, L) => {
  const [x, y] = blk(1, 8);
  L.bars(x + 200, y + 740, 700, 520, [{ v: 0.92, label: 'they guessed', top: '~1/2', col: L.GRY2, t: S.at('half') - 0.2 }, { v: 0.46, label: 'actually', top: '~1/4', col: L.YEL, t: S.at('quarter') - 0.2 }], S.t0 + 0.1, { ls: 44, ts: 64 });
  L.TXT('× 2', x + 1150, y + 380, 150, { f: 'KB', align: 'center' }, S.at('doubled') - 0.1, 0.4);
  L.TXT('they doubled their audience', x + 1200, y + 480, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('audience'), 0.8);
  L.TXT("most didn't notice", x + 1200, y + 620, 46, { f: 'KB', align: 'center' }, S.at('notice'), 0.6);
  L.TXT("...or didn't remember", x + 1200, y + 690, 42, { f: 'PH', align: 'center', col: L.INK2 }, S.at('remember'), 0.6);
});
def(LONG, 'c1j', blk(1, 9), { purpose: 'how close the observers were (a few feet away)', shot: 'pan right; a medium shot of wearer and one seated observer', sfx: 'pen; the measuring arrow' }, (S, L) => {
  const [x, y] = blk(1, 9);
  L.person(x + 330, y + 800, 1.45, S.t0 + 0.1, { pose: 'stand', you: true, shirt: 'face', kind: 'worry', look: [1, 0.2], k: 0.9 });
  L.student(x + 1050, y + 800, 1.45, S.at('sitting') - 0.2, { hair: 'bun', kind: 'think', look: [0.6, 0.9], dir: 1, k: 0.9 });
  L.INK_(L.line(x + 470, y + 860, x + 970, y + 860), { w: 3, amp: 0.5, passes: 1 }, S.at('feet') - 0.4, 0.3);
  L.arrowHead(x + 470, y + 860, Math.PI, 18, {}, S.at('feet') - 0.1); L.arrowHead(x + 970, y + 860, 0, 18, {}, S.at('feet') - 0.05);
  L.TXT('a few feet', x + 720, y + 840, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('feet'), 0.5);
  L.TXT('nothing to look at but a questionnaire', x + 800, y + 140, 50, { f: 'KB', align: 'center' }, S.at('nothing'), 1.2);
});
def(LONG, 'c1i', blk(1, 10), { purpose: 'name the effect: a beam that follows you while the audience looks elsewhere; open loop', shot: 'pan right; widen to show the lamp and the audience (scale)', sfx: 'marker swish for the beam; a question-mark tap' }, (S, L) => {
  const [x, y] = blk(1, 10);
  L.spotlight(x + 520, y + 120, x + 520, y + 790, 330, S.at('beam') - 0.3);
  L.person(x + 520, y + 790, 1.45, S.at('spotlight') - 0.6, { pose: 'stand', you: true, kind: 'worry', look: [0, -0.5], k: 0.9 });
  L.ribbon(x + 520, y + 60, 620, 90, 'THE SPOTLIGHT EFFECT', 50, S.at('spotlight'), { d: 0.3, td: 0.8 });
  [[1000, [1, -0.3]], [1180, [0.3, 1]], [1360, [1, 0.6]]].forEach(([hx, lk], i) => L.head(x + hx, y + 650, 52, S.at('audience') + i * 0.12, { k: 0.5, hair: ['cap', 'long', 'tuft'][i], kind: 'bored', look: lk }));
  L.TXT('looking somewhere else', x + 1180, y + 790, 42, { f: 'PH', align: 'center', col: L.INK2 }, S.at('somewhere'), 0.6);
  L.qmark(x + 1180, y + 430, 200, S.at('embarrassment') - 0.3);
  L.TXT('only embarrassment?', x + 1180, y + 520, 46, { f: 'KB', align: 'center' }, S.at('embarrassment'), 0.6);
});

// ===== chapter 2: not just shame =====
chapter(LONG, 'ch2', 2, 2, 'NOT JUST SHAME');
def(LONG, 'c2a', blk(2, 1), { purpose: 'the doubt: maybe fear just inflates the bad', shot: 'pan right; push into the magnifier', sfx: 'pen; marker' }, (S, L) => {
  const [x, y] = blk(2, 1);
  L.shirtPrint(x + 380, y + 450, 1.2, S.at('bad') - 0.3, 'stain');
  L.TXT('small stain', x + 390, y + 560, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('bad'), 0.5);
  const gx = x + 820, gy = y + 400, gr = 220, gl = L.ell(gx, gy, gr, gr, 0, L.TAU, 60);
  L.FILL(gl, S.at('fear')); L.INK_(gl, { closed: true, w: 5, amp: 0.6 }, S.at('fear'), 0.3);
  L.INK_(L.line(gx + gr * 0.7, gy + gr * 0.7, gx + gr * 1.3, gy + gr * 1.3), { w: 14, amp: 0.4 }, S.at('fear') + 0.25, 0.15);
  L.shirtPrint(gx - 20, gy, 7, S.at('bigger') - 0.2, 'stain');
  L.TXT('fear makes it look bigger', x + 800, y + 790, 50, { f: 'KB', align: 'center' }, S.at('look'), 0.8);
  L.inkArrow(L.bez([x + 1200, y + 300], [x + 1400, y + 200], [x + 1450, y + 450], [x + 1300, y + 500]), { w: 3.4, amp: 0.6, head: 20 }, S.at('twist') - 0.2, 0.5);
  L.TXT('a twist', x + 1350, y + 600, 50, { f: 'KB', align: 'center' }, S.at('twist'), 0.5);
});
def(LONG, 'c2b', blk(2, 2), { purpose: 'the twist: shirts people liked', shot: 'pan right; the clothesline reads left to right', sfx: 'three pen pops as the shirts are pinned' }, (S, L) => {
  const [x, y] = blk(2, 2);
  L.INK_(L.quad([x + 80, y + 200], [x + 800, y + 290], [x + 1520, y + 200]), { w: 3, amp: 0.8 }, S.at('liked') - 0.4, 0.4);
  [['Bob Marley', 'marley', 320, 'star'], ['Martin Luther King Jr.', 'martin', 800, 'face'], ['Jerry Seinfeld', 'jerry', 1280, 'face']].forEach(([n, w, cx, pr], i) => {
    const t = S.at(w) - 0.3; tshirt(L, x + cx, y + 380, 1.25, t, { print: pr, k: 0.6, tint: 'rgba(255,205,40,0.18)' });
    L.INK_(L.line(x + cx - 30, y + 236, x + cx - 30, y + 286), { w: 4, amp: 0.2, passes: 1 }, t, 0.04); L.INK_(L.line(x + cx + 30, y + 236, x + cx + 30, y + 286), { w: 4, amp: 0.2, passes: 1 }, t + 0.04, 0.04);
    L.TXT(n, x + cx, y + 580, 42, { f: 'KB', align: 'center' }, t + 0.4, 0.6);
  });
  L.person(x + 800, y + 880, 0.95, S.at('proud') - 0.4, { pose: 'arms_up', you: true, shirt: 'star', kind: 'proud', look: [0, -0.3], k: 0.7 });
  L.TXT('proud to wear', x + 1050, y + 780, 44, { f: 'PH', col: L.INK2 }, S.at('proud'), 0.5);
});
def(LONG, 'c2c', blk(2, 3), { purpose: 'same result: the gap is still there', shot: 'pan right; the familiar bars return (pattern)', sfx: 'marker bars; a soft "x" scratch' }, (S, L) => {
  const [x, y] = blk(2, 3);
  L.bars(x + 150, y + 700, 560, 460, [{ v: 0.9, label: 'guess', col: L.GRY2, t: S.at('overestimated') - 0.4 }, { v: 0.4, label: 'actual', col: L.YEL, t: S.at('overestimated') + 0.1 }], S.t0, { ls: 40 });
  L.TXT('same gap', x + 430, y + 140, 60, { f: 'KB', align: 'center' }, S.at('same') - 0.1, 0.5);
  tag(L, x + 1120, y + 220, 'PRIDE', 56, S.at('pride') - 0.3);
  L.cross(x + 1260, y + 220, 1.6, S.at('fix'));
  L.spotlight(x + 1120, y + 380, x + 1120, y + 760, 240, S.at('shines') - 0.2, { k: 0.8 });
  const st = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r2 = i % 2 ? 26 : 62; st.push([x + 1120 + Math.cos(a) * r2, y + 700 + Math.sin(a) * r2]); }
  L.FILL(st, S.at('good')); L.MRK([st], { col: L.YEL, w: 12 }, S.at('good') + 0.2, 0.15); L.INK_(st, { closed: true, w: 3, amp: 0.5 }, S.at('good'), 0.25);
  L.TXT('the good stuff too', x + 1120, y + 840, 46, { f: 'KB', align: 'center' }, S.at('too') - 0.3, 0.6);
});
def(LONG, 'c2d', blk(2, 4), { purpose: 'real life: group discussions, clever and awkward moments', shot: 'pan right; a medium group shot, people facing each other', sfx: 'pen; bubble pops' }, (S, L) => {
  const [x, y] = blk(2, 4);
  const tb = [[x + 400, y + 640], [x + 1200, y + 640], [x + 1240, y + 690], [x + 360, y + 690]];
  L.FILL(tb, S.t0 + 0.2); L.MRK([tb], { col: L.GRY2, w: 12 }, S.t0 + 0.4, 0.1); L.INK_(tb, { closed: true, w: 3.2, amp: 0.6 }, S.t0 + 0.2, 0.3);
  const ppl = [[460, 1, 'tuft', 'smile'], [700, 1, 'long', 'think'], [940, -1, 'cap', 'neutral'], [1160, -1, 'bun', 'smile']];
  ppl.forEach(([px, dir, hair, kind], i) => L.person(x + px, y + 860, 1.15, S.t0 + 0.5 + i * 0.25, { pose: 'sit', dir, hair, kind, look: [dir, 0], you: i === 1, k: 0.6 }));
  L.bubble(x + 200, y + 150, 380, 150, S.at('clever'), { tail: [x + 640, y + 470], size: 48, text: 'clever point!', tint: 'rgba(255,205,40,0.3)' });
  L.bubble(x + 900, y + 150, 320, 150, S.at('awkward'), { tail: [x + 760, y + 470], size: 48, text: 'uh... um...' });
  L.TXT('how much did my comments stand out?', x + 800, y + 80, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('stood') - 0.4, 1.0);
});
def(LONG, 'c2e', blk(2, 5), { purpose: 'result: both kinds of moments felt bigger than they were; the replay loop', shot: 'pan right; two clouds compared side by side', sfx: 'marker; a looping pen circle' }, (S, L) => {
  const [x, y] = blk(2, 5);
  L.bubble(x + 120, y + 140, 640, 420, S.at('believed') - 0.2, { thought: true, size: 70, text: 'EVERYONE NOTICED', tint: 'rgba(255,205,40,0.25)' });
  L.TXT('in your head', x + 440, y + 640, 46, { f: 'PH', align: 'center', col: L.INK2 }, S.at('noticeable'), 0.5);
  L.bubble(x + 1020, y + 300, 300, 160, S.at('really') - 0.2, { thought: true, size: 40, text: 'hm? oh.' });
  L.TXT('to them', x + 1170, y + 540, 46, { f: 'PH', align: 'center', col: L.INK2 }, S.at('really') + 0.4, 0.4);
  L.inkArrow(L.ell(x + 440, y + 790, 120, 60, 0.3, L.TAU - 0.2, 40), { w: 3.4, amp: 0.6, head: 18 }, S.at('replaying') - 0.2, 0.5);
  L.TXT('replay', x + 440, y + 805, 44, { f: 'KB', align: 'center' }, S.at('replaying'), 0.4);
  L.TXT('both landed softer', x + 1170, y + 780, 56, { f: 'KB', align: 'center' }, S.at('softer') - 0.4, 0.7);
});
def(LONG, 'c2f', blk(2, 6), { purpose: 'the 2002 follow-up: ups and downs (hair, a game, a video game)', shot: 'pan right; three icons drawn in rhythm with the three examples', sfx: 'three pen accents' }, (S, L) => {
  const [x, y] = blk(2, 6);
  tag(L, x + 240, y + 120, '2002', 60, S.at('two', 1) - 0.3);
  L.TXT('Gilovich, Kruger & Medvec', x + 700, y + 140, 46, { f: 'PH', col: L.INK2, align: 'center' }, S.at('gilovich') - 0.2, 0.8);
  L.INK_(L.bez([x + 120, y + 360], [x + 400, y + 160], [x + 600, y + 560], [x + 900, y + 300]).concat(L.bez([x + 900, y + 300], [x + 1100, y + 120], [x + 1300, y + 520], [x + 1480, y + 330])), { w: 3.6, amp: 0.8 }, S.at('ups') - 0.3, 0.8);
  L.TXT('ups & downs', x + 1280, y + 250, 48, { f: 'KB', align: 'center' }, S.at('downs'), 0.5);
  L.head(x + 300, y + 690, 80, S.at('hair') - 0.3, { hair: 'messy', kind: 'worry', look: [0, -0.6], k: 0.8 });
  L.ball(x + 760, y + 700, 80, S.at('game', 1) - 0.2);
  L.controller(x + 1220, y + 700, 1.8, S.at('video') - 0.2);
});
def(LONG, 'c2g', blk(2, 7), { purpose: 'result: others barely see the swings; Tuesday hair', shot: 'pan right; two lines compared, then the punchline faces', sfx: 'pen; a light chuckle-like pluck' }, (S, L) => {
  const [x, y] = blk(2, 7);
  L.INK_(L.line(x + 120, y + 420, x + 900, y + 420), { w: 2, amp: 0.4, passes: 1, alpha: 0.6 }, S.t0, 0.3);
  const wave = []; for (let i = 0; i <= 60; i++) wave.push([x + 120 + i * 13, y + 420 + Math.sin(i * 0.5) * 150 * (0.6 + 0.4 * Math.sin(i * 0.17))]);
  L.INK_(wave, { w: 3.6, amp: 0.6 }, S.at('overestimating') - 0.3, 0.6);
  L.TXT('how big it feels', x + 920, y + 300, 40, { f: 'PH', col: L.INK2 }, S.at('overestimating'), 0.5);
  const flat = []; for (let i = 0; i <= 60; i++) flat.push([x + 120 + i * 13, y + 420 + Math.sin(i * 0.5) * 18]);
  L.MST(flat, { w: 10, col: L.YEL }, S.at('noticed') - 0.2, 0.6);
  L.TXT('what others notice', x + 920, y + 440, 40, { f: 'KB' }, S.at('noticed') + 0.3, 0.5);
  L.head(x + 380, y + 760, 72, S.at('tuesday') - 0.2, { hair: 'messy', kind: 'shock', look: [0, -0.8], k: 0.7, sweat: true });
  L.TXT('CRISIS!', x + 560, y + 740, 52, { f: 'KB' }, S.at('crisis') - 0.1, 0.4);
  L.head(x + 1150, y + 760, 72, S.at('everyone') - 0.1, { hair: 'messy', kind: 'smile', look: [0, 0], k: 0.7 });
  L.TXT('...like you', x + 1320, y + 760, 46, { f: 'PH', col: L.INK2 }, S.at('like') - 0.1, 0.4);
});
def(LONG, 'c2g2', blk(2, 8), { purpose: 'an ordinary day: your flaw is a dot in a busy picture', shot: 'pan right; dive toward the tiny circled dot, then hold the crowd', sfx: 'marker loop; clock tick', noAutoCam: true }, (S, L) => {
  const B = blk(2, 8), [x, y] = B, c = S.fit(B);
  S.cam(S.t0 - 0.25, c.x, c.y, c.z, 1.1); S.cam(S.at('dot') - 0.3, x + 800, y + 520, c.z * 1.5, 1.2); S.cam(S.at('gone') - 0.5, c.x, c.y, c.z, 1.0);
  [['pimple', 'pimple', 220], ['wrinkled sleeve', 'wrinkled', 560], ['the word you mispronounced', 'word', 1040]].forEach(([n, w, nx]) => L.TXT(n, x + nx, y + 110, 42, { f: 'PH', align: 'center', col: L.INK2 }, S.at(w) - 0.1, 0.7));
  L.TXT('an ordinary day', x + 800, y + 40, 48, { f: 'KB', align: 'center' }, S.t0 + 0.2, 0.7);
  L.TXT('FRONT PAGE NEWS?', x + 800, y + 220, 64, { f: 'KB', align: 'center' }, S.at('front') - 0.2, 0.7);
  const tc = S.at('people') - 0.4;
  for (let i = 0; i < 14; i++) { const px = x + 160 + (i % 7) * 200 + (Math.floor(i / 7) % 2) * 90, py = y + 560 + Math.floor(i / 7) * 260; L.person(px, py, 0.62, tc + i * 0.08, { pose: ['walk', 'stand', 'hold', 'walk'][i % 4], dir: i % 2 ? -1 : 1, hair: ['tuft', 'long', 'bun', 'cap', 'curly', 'messy'][i % 6], kind: ['neutral', 'think', 'bored', 'smile'][i % 4], look: [i % 2 ? -1 : 1, 0], you: i === 9, k: 0.35 }); }
  L.loop(x + 160 + 2 * 200 + 90, y + 560 + 260 - 104, 26, 24, S.at('dot') + 0.1, 0.4);
  L.TXT('tiny dot', x + 160 + 2 * 200 + 90 + 70, y + 560 + 260 - 150, 36, { f: 'KB' }, S.at('dot') + 0.3, 0.4);
  L.clock(x + 1460, y + 350, 60, S.at('lunch') - 0.4);
  L.TXT('gone by lunch', x + 1460, y + 460, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('lunch'), 0.5);
});
def(LONG, 'c2h', blk(2, 9), { purpose: 'turn: not shame, not pride; it is where your brain stands', shot: 'pan right; push into the head (into the mechanism)', sfx: 'two scratches; footsteps-like pen dots' }, (S, L) => {
  const [x, y] = blk(2, 9);
  tag(L, x + 260, y + 160, 'SHAME', 56, S.at('shame') - 0.3); L.cross(x + 420, y + 160, 1.5, S.at('shame') + 0.3);
  tag(L, x + 260, y + 330, 'PRIDE', 56, S.at('pride') - 0.3); L.cross(x + 420, y + 330, 1.5, S.at('pride') + 0.3);
  const hc = L.ell(x + 1000, y + 480, 330, 340, 0, L.TAU, 60); L.FILL(hc, S.at('basic') - 0.2); L.dropShadow(hc, 12, 14, S.at('basic'), 0.1); L.INK_(hc, { closed: true, w: 4, amp: 1 }, S.at('basic') - 0.2, 0.5);
  L.TXT('you are here', x + 1000, y + 400, 50, { f: 'KB', align: 'center' }, S.at('standing') - 0.6, 0.5);
  L.TXT('X', x + 1000, y + 560, 120, { f: 'KB', align: 'center' }, S.at('standing') - 0.1, 0.3);
  L.loop(x + 1000, y + 520, 80, 70, S.at('standing') + 0.3, 0.4);
  L.TXT('not other people', x + 340, y + 600, 50, { f: 'PH', align: 'center', col: L.INK2 }, S.at('problem'), 0.8);
});

// ===== chapter 3: the view from inside =====
chapter(LONG, 'ch3', 3, 3, 'THE VIEW FROM INSIDE');
def(LONG, 'c3a', blk(3, 1), { purpose: 'the idea: you start from your own experience, which is huge', shot: 'pan right; the two circles compared at the same distance (scale)', sfx: 'marker fill swells' }, (S, L) => {
  const [x, y] = blk(3, 1);
  L.person(x + 200, y + 800, 1.3, S.t0 + 0.2, { pose: 'stand', you: true, kind: 'think', look: [1, -0.5], k: 0.8 });
  const big = L.ell(x + 760, y + 430, 330, 330, 0, L.TAU, 60);
  L.FILL(big, S.at('own') - 0.2); L.MRK([big], { col: 'rgba(255,205,40,0.45)', w: 26 }, S.at('enormous') - 0.3, 0.5); L.INK_(big, { closed: true, w: 3.4, amp: 1 }, S.at('own') - 0.2, 0.5);
  L.TXT('you, from inside', x + 760, y + 450, 60, { f: 'KB', align: 'center' }, S.at('experience', 1), 0.6);
  const sm = L.ell(x + 1360, y + 640, 60, 60, 0, L.TAU, 30); L.FILL(sm, S.at('enormous')); L.INK_(sm, { closed: true, w: 3, amp: 0.4 }, S.at('enormous'), 0.2);
  L.TXT('you, to others', x + 1360, y + 760, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('enormous') + 0.3, 0.5);
  L.TXT('nothing', x + 760, y + 120, 40, { f: 'PH', align: 'center', col: L.INK2, pass: true }, S.at('nothing'), 0.3);
});
def(LONG, 'c3b', blk(3, 2), { purpose: 'what the inside view contains, in close-up, at full volume', shot: 'pan right; close on the face, icons orbit in order of mention', sfx: 'pen per icon; a little volume knob click' }, (S, L) => {
  const [x, y] = blk(3, 2);
  L.head(x + 800, y + 470, 170, S.t0 + 0.1, { you: true, kind: 'worry', look: [0, 0], hair: 'tuft', k: 1.1, sweat: true });
  tshirt(L, x + 280, y + 260, 0.9, S.at('shirt') - 0.2, { print: 'face', k: 0.6 });
  L.shirtPrint(x + 260, y + 640, 2, S.at('stain') - 0.2, 'stain');
  const wv = []; for (let i = 0; i <= 40; i++) wv.push([x + 1150 + i * 9, y + 260 + (i > 24 && i < 30 ? (i % 2 ? -80 : 80) : Math.sin(i * 1.2) * 22)]);
  L.INK_(wv, { w: 3.2, amp: 0.3, passes: 1 }, S.at('voice') - 0.2, 0.4); L.TXT('crack!', x + 1330, y + 380, 44, { f: 'KB', align: 'center' }, S.at('crack'), 0.3);
  [[560, 140], [1040, 140], [560, 800], [1040, 800]].forEach(([cx, cy], i) => { const sx = i % 2 ? -1 : 1, sy = i < 2 ? 1 : -1; L.INK_([[x + cx, y + cy + sy * 60], [x + cx, y + cy], [x + cx + sx * 60, y + cy]], { w: 4, amp: 0.3, passes: 1 }, S.at('close-up') - 0.2 + i * 0.05, 0.08); });
  const kx = x + 1300, ky = y + 680, kc = L.ell(kx, ky, 60, 60, 0, L.TAU, 30); L.FILL(kc, S.at('sound') - 0.1); L.MRK([kc], { col: L.GRY2, w: 10 }, S.at('sound'), 0.08); L.INK_(kc, { closed: true, w: 3, amp: 0.3 }, S.at('sound') - 0.1, 0.12);
  L.INK_(L.line(kx, ky, kx + 44, ky - 30), { w: 5, amp: 0.1, passes: 1 }, S.at('up') - 0.1, 0.1); L.TXT('MAX', kx, ky + 110, 42, { f: 'KB', align: 'center' }, S.at('up'), 0.3);
});
def(LONG, 'c3c', blk(3, 3), { purpose: 'the mechanism: anchor, then adjust, but not enough', shot: 'pan right; the arrow travels from the anchor and stops short (the gap is the point)', sfx: 'a heavy pen thud on the anchor; pen glide' }, (S, L) => {
  const [x, y] = blk(3, 3);
  L.ribbon(x + 800, y + 90, 760, 90, 'ANCHORING & ADJUSTMENT', 50, S.at('anchoring') - 0.3, { d: 0.3, td: 0.8 });
  L.anchor(x + 260, y + 520, 1.8, S.at('anchor', 2) - 0.2);
  L.TXT('your vivid experience', x + 260, y + 740, 42, { f: 'PH', align: 'center', col: L.INK2 }, S.at('vivid'), 0.7);
  const tg = L.ell(x + 1330, y + 500, 110, 110, 0, L.TAU, 40); L.INK_(tg, { closed: true, w: 3, amp: 0.6, dash: [14, 10] }, S.at('adjust', 1) - 0.1, 0.4);
  L.TXT('their view', x + 1330, y + 670, 46, { f: 'KB', align: 'center' }, S.at('adjust', 1) + 0.3, 0.5);
  L.inkArrow([[x + 400, y + 500], [x + 880, y + 500]], { w: 5, amp: 0.4, head: 26 }, S.at('adjust', 2) - 0.3, 0.6);
  L.INK_(L.line(x + 920, y + 440, x + 920, y + 560), { w: 2, amp: 0.3, passes: 1, dash: [8, 8] }, S.at('enough') - 0.4, 0.2);
  L.TXT('not enough', x + 1060, y + 420, 50, { f: 'KB', align: 'center' }, S.at('enough') - 0.2, 0.5);
  L.swash(x + 930, y + 520, x + 1210, S.at('enough') + 0.3, 0.3, { w: 14 });
});
def(LONG, 'c3c2', blk(3, 4), { purpose: 'analogy: on stage under a light vs seen from the seats', shot: 'pan right; a reverse angle from behind the audience (what they see)', sfx: 'marker beam; small pen pops for the thought bubbles' }, (S, L) => {
  const [x, y] = blk(3, 4);
  L.spotlight(x + 800, y + 40, x + 800, y + 380, 200, S.at('light') - 0.3, { k: 0.8 });
  L.person(x + 800, y + 380, 0.8, S.at('stage') - 0.2, { pose: 'stand', you: true, kind: 'worry', look: [0, 0.4], k: 0.6 });
  L.stage(x + 200, y + 400, 1200, S.at('seats') - 0.4, { rows: 2, per: 8 });
  L.TXT('one small figure', x + 1180, y + 260, 44, { f: 'PH', col: L.INK2 }, S.at('small') - 0.2, 0.6);
  [[420, 'cup'], [900, 'clock'], [1260, 'ball']].forEach(([bx, ic], i) => { const t = S.at('else') - 0.6 + i * 0.25; L.bubble(x + bx - 80, y + 600, 160, 120, t, { thought: true, tail: [x + bx, y + 520] }); if (ic === 'cup') L.cup(x + bx, y + 670, 0.7, t + 0.2); else if (ic === 'clock') L.clock(x + bx, y + 660, 38, t + 0.2); else L.ball(x + bx, y + 660, 36, t + 0.2); });
});
def(LONG, 'c3d', blk(3, 5), { purpose: 'everyone has their own anchor: a room full of spotlights', shot: 'pan right; wide, so every small spotlight is in frame together', sfx: 'a marker swish per spotlight' }, (S, L) => {
  const [x, y] = blk(3, 5);
  L.TXT('studies 4 & 5 back it up', x + 320, y + 110, 44, { f: 'PH', col: L.INK2, align: 'center' }, S.at('experiments') - 0.3, 0.8);
  L.check(x + 560, y + 100, 1.4, S.at('supported'));
  const ppl = [[260, 'bun', 'shirt'], [580, 'tuft', 'questionnaire'], [900, 'curly', 'said'], [1220, 'long', 'own'], [1480, 'cap', 'room']];
  ppl.forEach(([px, hair, w], i) => {
    const t = S.at('every') + i * 0.35;
    L.spotlight(x + px, y + 300, x + px, y + 800, 170, t + 0.1, { k: 0.6, col: 'rgba(255,205,40,0.32)' });
    L.person(x + px, y + 800, 0.95, t, { pose: 'stand', hair, kind: ['worry', 'think', 'worry', 'think', 'worry'][i], look: [0, -0.4], k: 0.5 });
  });
  L.TXT('a room full of spotlights', x + 800, y + 210, 56, { f: 'KB', align: 'center' }, S.at('spotlights') - 0.6, 0.8);
});
def(LONG, 'c3e', blk(3, 6), { purpose: 'an older experiment: the painted-on scar', shot: 'pan right; medium shot of the volunteer at the mirror (what they see)', sfx: 'brush dabs (soft marker)' }, (S, L) => {
  const [x, y] = blk(3, 6);
  tag(L, x + 300, y + 110, '1980 · DARTMOUTH', 50, S.t0 + 0.2);
  L.TXT('an older experiment', x + 800, y + 110, 46, { f: 'PH', col: L.INK2 }, S.t0 + 0.5, 0.8);
  L.TXT('Kleck & Strenta', x + 300, y + 210, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('kleck') - 0.1, 0.7);
  const V = L.person(x + 520, y + 840, 1.5, S.t0 + 1.0, { pose: 'sit', dir: 1, hair: 'long', kind: 'neutral', look: [1, 0], k: 0.8 });
  const [hx, hy, hr] = V.head;
  L.scar(hx + hr * 0.45, hy + hr * 0.35, 1.1, S.at('scar') - 0.1);
  L.TXT('makeup', x + 300, y + 520, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('makeup'), 0.4);
  L.mirror(x + 1100, y + 420, 300, 400, S.at('mirror') - 0.6);
  L.head(x + 1100, y + 420, 80, S.at('mirror') - 0.3, { hair: 'long', kind: 'worry', look: [-0.6, 0], k: 0.5 });
  L.scar(x + 1100 - 34, y + 450, 0.7, S.at('mirror'));
  L.inkArrow([[hx + hr * 1.3, hy - 10], [x + 930, y + 420]], { w: 2.4, amp: 0.4, dash: [10, 8], head: 14 }, S.at('saw') - 0.2, 0.3);
});
def(LONG, 'c3f', blk(3, 7), { purpose: 'the secret: the scar is removed during a "touch-up"', shot: 'pan right; close on the cheek as the brush makes contact (the action that matters)', sfx: 'brush dab; a soft paper rub as the scar disappears' }, (S, L) => {
  const [x, y] = blk(3, 7);
  const V = L.person(x + 520, y + 840, 1.5, S.t0 + 0.1, { pose: 'sit', dir: 1, hair: 'long', kind: 'neutral', look: [1, -0.2], k: 0.7 });
  const [hx, hy, hr] = V.head, sc = [hx + hr * 0.45, hy + hr * 0.35];
  L.scar(sc[0], sc[1], 1.1, S.t0 + 0.6);
  // the artist stands close; her own arm reaches the cheek and the brush sits in that hand, tip on the scar
  const hand = [sc[0] + 92, sc[1] + 16];
  L.person(x + 860, y + 840, 1.5, S.at('artist') - 0.4, { pose: 'stand', hair: 'bun', kind: 'think', look: [-1, 0.3], k: 0.7, reach: hand });
  L.brush(hand[0] - 2, hand[1], 1.3, S.at('touch') - 0.15, { ang: Math.PI + 0.25 });
  L.TXT('a quick touch-up', x + 1100, y + 200, 50, { f: 'KB', align: 'center' }, S.at('touch'), 0.6);
  const cov = L.ell(sc[0], sc[1], 26, 20, 0, L.TAU, 24); L.COVER(cov, S.at('removed') - 0.1);
  L.INK_(L.ell(sc[0], sc[1], 30, 24, 0, L.TAU, 24), { closed: true, w: 2, amp: 0.4, passes: 1, dash: [8, 8] }, S.at('removed'), 0.3);
  L.TXT('secretly removed', x + 520, y + 260, 50, { f: 'KB', align: 'center' }, S.at('secretly'), 0.7);
});
def(LONG, 'c3g', blk(3, 8), { purpose: 'the result: they felt reactions to a scar that was not there', shot: 'pan right; two-shot of the conversation, volunteer and stranger facing each other', sfx: 'pen; a held quiet' }, (S, L) => {
  const [x, y] = blk(3, 8);
  const V = L.person(x + 480, y + 840, 1.45, S.t0 + 0.1, { pose: 'sit', dir: 1, hair: 'long', kind: 'worry', look: [1, 0], k: 0.7 });
  L.person(x + 1140, y + 840, 1.45, S.t0 + 0.4, { pose: 'sit', dir: -1, hair: 'cap', kind: 'neutral', look: [-1, 0], k: 0.7 });
  const [hx, hy, hr] = V.head;
  L.INK_(L.ell(hx + hr * 0.45, hy + hr * 0.35, 30, 24, 0, L.TAU, 24), { closed: true, w: 2, amp: 0.4, passes: 1, dash: [8, 8] }, S.at('gone') - 0.2, 0.3);
  L.TXT('(no scar)', hx + hr * 1.3, hy + hr * 0.5, 36, { f: 'PH', align: 'left', col: L.INK2 }, S.at('gone'), 0.4);
  L.bubble(x + 160, y + 120, 520, 200, S.at('reported') - 0.2, { thought: true, tail: [hx, hy - hr * 1.2] });
  L.scar(x + 250, y + 220, 1.4, S.at('reacted') - 0.1);
  L.TXT('they reacted!', x + 480, y + 250, 42, { f: 'KB', align: 'center' }, S.at('appearance'), 0.6);
  L.TXT("a scar that wasn't there", x + 1060, y + 300, 54, { f: 'KB', align: 'center' }, S.at('wasn\'t') - 0.6, 0.8);
});
def(LONG, 'c3h', blk(3, 9), { purpose: 'the shared pattern, stated: expectation rewrites perception', shot: 'pan right; push in while the line is written (definition)', sfx: 'fat-arrow marker swish' }, (S, L) => {
  const [x, y] = blk(3, 9);
  L.TXT('different study, same pattern', x + 800, y + 160, 46, { f: 'PH', align: 'center', col: L.INK2 }, S.at('different') - 0.2, 1.0);
  L.box(x + 80, y + 300, 560, 280, S.at('expect') - 0.4, 0.3, { tint: 'rgba(255,205,40,0.25)' });
  L.TXT('what we EXPECT', x + 360, y + 470, 56, { f: 'KB', align: 'center' }, S.at('expect') - 0.1, 0.6);
  L.fatArrow(x + 680, y + 440, x + 920, S.at('rewrite') - 0.3, { d: 0.3 });
  L.box(x + 960, y + 300, 560, 280, S.at('rewrite'), 0.3);
  L.TXT('what we think', x + 1240, y + 430, 52, { f: 'KB', align: 'center' }, S.at('think') - 0.1, 0.5);
  L.TXT('they SAW', x + 1240, y + 510, 52, { f: 'KB', align: 'center' }, S.at('saw') - 0.1, 0.4);
  L.TXT('quietly rewrites', x + 800, y + 700, 50, { f: 'PH', align: 'center', col: L.INK2 }, S.at('quietly'), 0.7);
});

def(LONG, 'c3i', blk(3, 10), { purpose: 'reframe: not vanity, not a flaw, a side effect of living in your own head', shot: 'pan right; push into the head with one small figure inside', sfx: 'two scratches; a soft pluck' }, (S, L) => {
  const [x, y] = blk(3, 10);
  tag(L, x + 260, y + 200, 'VANITY', 56, S.at('vanity') - 0.3); L.cross(x + 430, y + 200, 1.5, S.at('vanity') + 0.3);
  tag(L, x + 260, y + 380, 'A FLAW', 56, S.at('flaw') - 0.3); L.cross(x + 430, y + 380, 1.5, S.at('flaw') + 0.3);
  const hc = L.ell(x + 1050, y + 470, 340, 360, 0, L.TAU, 60); L.FILL(hc, S.at('side') - 0.4); L.dropShadow(hc, 12, 14, S.at('side'), 0.1); L.INK_(hc, { closed: true, w: 4, amp: 1 }, S.at('side') - 0.4, 0.5);
  L.person(x + 1050, y + 700, 1.0, S.at('only') - 0.3, { pose: 'stand', you: true, kind: 'content', look: [0, -0.3], k: 0.6 });
  L.TXT('the only one in here', x + 1050, y + 300, 46, { f: 'KB', align: 'center' }, S.at('inside') - 0.3, 0.7);
  L.TXT('a side effect', x + 300, y + 620, 60, { f: 'KB', align: 'center' }, S.at('effect') - 0.2, 0.6);
  L.swash(x + 120, y + 640, x + 480, S.at('effect') + 0.4, 0.3);
});

// ===== chapter 4: when they do notice =====
chapter(LONG, 'ch4', 4, 4, 'WHEN THEY DO NOTICE');
def(LONG, 'c4a', blk(4, 1), { purpose: 'the objection: sometimes they really do notice', shot: 'pan right; medium shot; onlookers react to the trip', sfx: 'a stumble scratch; pen ticks as heads turn' }, (S, L) => {
  const [x, y] = blk(4, 1);
  const P = L.person(x + 420, y + 840, 1.4, S.t0 + 0.2, { pose: 'arms_up', you: true, kind: 'shock', look: [0, 0.5], k: 0.8 });
  L.motion(x + 300, y + 800, -90, 3, S.at('trip') - 0.1); L.TXT('!', x + 280, y + 560, 90, { f: 'KB', align: 'center' }, S.at('trip'), 0.2);
  const ob = [[900, 'bun'], [1120, 'tuft'], [1340, 'curly']].map(([ox, hair], i) => L.person(x + ox, y + 840, 1.2, S.at('notice') - 0.3 + i * 0.15, { pose: 'stand', hair, kind: 'neutral', look: [1, 0], k: 0.5 }));
  ob.forEach((o, i) => L.react(o, S.at('hear') - 0.3 + i * 0.12, { kind: 'shock', look: [-1, 0.2], k: 0.6 }));
  L.qmark(x + 1120, y + 300, 200, S.at('then') - 0.3);
});
def(LONG, 'c4b', blk(4, 2), { purpose: 'the 2001 test: four studies, three kinds of mishap', shot: 'pan right; three panels read left to right with the narration', sfx: 'pen per panel' }, (S, L) => {
  const [x, y] = blk(4, 2);
  tag(L, x + 220, y + 110, '2001', 56, S.at('two') - 0.3);
  L.TXT('Savitsky, Epley & Gilovich · 4 studies', x + 820, y + 125, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('savitsky') - 0.2, 1.2);
  const pn = [[120, 'imagined'], [620, 'failed'], [1120, 'described']];
  pn.forEach(([px, w]) => L.box(x + px, y + 250, 400, 420, S.at(w) - 0.5, 0.25, { r: 18 }));
  L.bubble(x + 170, y + 290, 300, 170, S.at('imagined') - 0.2, { thought: true, tail: [x + 300, y + 520] }); L.TXT('oops', x + 320, y + 390, 50, { f: 'KB', align: 'center' }, S.at('blunders'), 0.3);
  L.head(x + 300, y + 580, 50, S.at('imagined'), { kind: 'worry', look: [0, -0.8], k: 0.4 });
  L.sheet(x + 700, y + 300, 240, 300, S.at('failed') - 0.2, { lines: 4 }); L.cross(x + 880, y + 360, 1.6, S.at('task'));
  L.TXT('in front of others', x + 820, y + 650, 34, { f: 'PH', align: 'center', col: L.INK2 }, S.at('front'), 0.5);
  L.head(x + 1250, y + 500, 50, S.at('described') - 0.2, { kind: 'shock', look: [1, 0], k: 0.4, blush: true });
  L.bubble(x + 1310, y + 320, 180, 110, S.at('embarrassing') - 0.3, { tail: [x + 1300, y + 460], text: '...!', size: 40 });
  L.TXT('described', x + 1320, y + 640, 34, { f: 'PH', align: 'center', col: L.INK2 }, S.at('embarrassing'), 0.4);
});
def(LONG, 'c4c', blk(4, 3), { purpose: 'result: expected harsher judgment than they got', shot: 'pan right; two sliders compared (hold for reading)', sfx: 'slider knob clicks' }, (S, L) => {
  const [x, y] = blk(4, 3);
  const slider = (sy, v, label, t, col) => { L.INK_(L.line(x + 300, sy, x + 1300, sy), { w: 4, amp: 0.4 }, t, 0.3); L.TXT('mild', x + 260, sy + 12, 36, { f: 'PH', align: 'right', col: L.INK2 }, t, 0.3); L.TXT('harsh', x + 1340, sy + 12, 36, { f: 'PH', col: L.INK2 }, t, 0.3); const k = L.ell(x + 300 + 1000 * v, sy, 30, 30, 0, L.TAU, 24); L.FILL(k, t + 0.4); L.MRK([k], { col, w: 10 }, t + 0.5, 0.1); L.INK_(k, { closed: true, w: 3, amp: 0.3 }, t + 0.4, 0.12); L.TXT(label, x + 300, sy - 50, 46, { f: 'KB' }, t + 0.1, 0.5); };
  slider(y + 330, 0.85, 'what they expected', S.at('expected') - 0.4, L.GRY2);
  slider(y + 620, 0.38, 'what they got', S.at('actually') - 0.3, L.YEL);
  L.inkArrow(L.bez([x + 1150, y + 380], [x + 1100, y + 480], [x + 800, y + 520], [x + 700, y + 580]), { w: 3, amp: 0.6, head: 18 }, S.at('actually') + 0.3, 0.4);
});
def(LONG, 'c4d', blk(4, 4), { purpose: 'why: you lock onto the mistake; onlookers see context', shot: 'pan right; the narrow frame widens (the reason, shown)', sfx: 'pen; a paper slide as the frame opens' }, (S, L) => {
  const [x, y] = blk(4, 4);
  L.person(x + 220, y + 840, 1.25, S.t0 + 0.1, { pose: 'stand', you: true, kind: 'worry', look: [1, -0.3], k: 0.7 });
  const gx = x + 520, gy = y + 400; L.INK_(L.ell(gx, gy, 120, 120, 0, L.TAU, 40), { closed: true, w: 5, amp: 0.4 }, S.at('locked') - 0.3, 0.3); L.INK_(L.line(gx - 85, gy + 85, gx - 160, gy + 160), { w: 12, amp: 0.3 }, S.at('locked'), 0.12);
  L.TXT('X', gx, gy + 40, 110, { f: 'KB', align: 'center' }, S.at('mistake') - 0.2, 0.3);
  L.box(x + 820, y + 180, 700, 560, S.at('picture') - 0.3, 0.35, { dash: [16, 10], shadow: false, fill: false });
  L.TXT('X', x + 1170, y + 470, 60, { f: 'KB', align: 'center' }, S.at('picture'), 0.2);
  L.TXT('hard question', x + 990, y + 290, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('hard') - 0.1, 0.4);
  L.TXT('loud room', x + 1360, y + 330, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('loud') - 0.1, 0.4);
  L.TXT('you seem tired', x + 1170, y + 650, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('tired') - 0.2, 0.5);
  L.TXT('context you don\'t give yourself', x + 800, y + 860, 50, { f: 'KB', align: 'center' }, S.at('context') - 0.2, 0.9);
});
def(LONG, 'c4d2', blk(4, 5), { purpose: 'flip the view: when a friend trips, you think "rough day"', shot: 'pan right; over the observer\'s shoulder toward the friend (their view)', sfx: 'pen; a soft pluck on "kinder"' }, (S, L) => {
  const [x, y] = blk(4, 5);
  L.TXT('imagine', x + 140, y + 100, 40, { f: 'PH', col: L.INK2 }, S.t0 + 0.1, 0.4);
  const F = L.person(x + 1100, y + 840, 1.3, S.at('friend') - 0.3, { pose: 'arms_up', hair: 'curly', kind: 'shock', look: [0, 0.5], k: 0.7 });
  L.motion(x + 980, y + 800, -80, 3, S.at('tripped'));
  const Y = L.person(x + 420, y + 840, 1.4, S.at('think') - 0.3, { pose: 'stand', you: true, kind: 'neutral', look: [1, 0], k: 0.7 });
  L.react(Y, S.at('rough') - 0.3, { kind: 'content', look: [1, 0], k: 0.6 });
  L.bubble(x + 160, y + 220, 380, 160, S.at('rough') - 0.2, { thought: true, tail: [x + 400, y + 520], text: 'rough day.', size: 52 });
  L.TXT('less of them?', x + 1100, y + 300, 46, { f: 'KB', align: 'center' }, S.at('less') - 0.1, 0.5); L.cross(x + 1280, y + 285, 1.2, S.at('rough'));
  L.TXT('usually kinder', x + 780, y + 200, 52, { f: 'KB', align: 'center' }, S.at('kinder') - 0.4, 0.6);
  L.swash(x + 610, y + 220, x + 950, S.at('kinder') + 0.2, 0.3, { w: 14 });
});
def(LONG, 'c4e', blk(4, 6), { purpose: 'the cousin effect: the illusion of transparency', shot: 'pan right; three small cases under one banner', sfx: 'pen; a frosted-glass marker rub' }, (S, L) => {
  const [x, y] = blk(4, 6);
  L.ribbon(x + 800, y + 90, 760, 90, 'ILLUSION OF TRANSPARENCY', 48, S.at('illusion') - 0.3, { d: 0.3, td: 0.8 });
  const hc = L.ell(x + 380, y + 450, 170, 175, 0, L.TAU, 50); L.FILL(hc, S.at('inner') - 0.4); L.INK_(hc, { closed: true, w: 3.4, amp: 0.6, dash: [16, 8] }, S.at('inner') - 0.4, 0.4);
  const cl = []; for (let i = 0; i < 12; i++) { const a = i / 12 * L.TAU, r2 = i % 2 ? 60 : 80; cl.push([x + 380 + Math.cos(a) * r2, y + 450 + Math.sin(a) * r2 * 0.7]); }
  L.FILL(cl, S.at('feelings')); L.MRK([cl], { col: L.GRY2, w: 12 }, S.at('feelings') + 0.1, 0.1); L.INK_(cl, { closed: true, w: 3, amp: 0.6 }, S.at('feelings'), 0.3);
  L.TXT('"they can see it"', x + 380, y + 720, 42, { f: 'PH', align: 'center', col: L.INK2 }, S.at('show'), 0.6);
  L.head(x + 900, y + 420, 80, S.at('liars') - 0.2, { kind: 'worry', look: [-0.8, 0], sweat: true, k: 0.6 }); L.TXT('liar', x + 900, y + 580, 44, { f: 'KB', align: 'center' }, S.at('liars'), 0.3);
  L.head(x + 1300, y + 420, 80, S.at('disgust') - 0.2, { kind: 'angry', look: [0, 0], k: 0.6 }); L.TXT('disgust', x + 1300, y + 580, 44, { f: 'KB', align: 'center' }, S.at('disgust'), 0.4);
  const fr = [[x + 760, y + 300], [x + 1460, y + 300], [x + 1460, y + 620], [x + 760, y + 620]];
  L.MRK([fr], { col: 'rgba(251,250,246,0.6)', w: 30, op: 'source-over', edge: false }, S.at('mostly') - 0.1, 0.5);
  L.TXT("mostly, it isn't", x + 1110, y + 720, 56, { f: 'KB', align: 'center' }, S.at('isn\'t') - 0.3, 0.6);
});
def(LONG, 'c4f', blk(4, 7), { purpose: 'honest limits of the evidence', shot: 'pan right; a fine-print card, held for reading', sfx: 'pen; a check mark' }, (S, L) => {
  const [x, y] = blk(4, 7);
  L.box(x + 200, y + 120, 1200, 660, S.at('honest') - 0.4, 0.4, { r: 20 });
  L.TXT('AN HONEST NOTE', x + 800, y + 220, 64, { f: 'KB', align: 'center' }, S.at('honest') - 0.1, 0.6);
  [['• mostly one research group', 'group'], ['• small groups of college students', 'college'], ['• the exact numbers move around', 'numbers']].forEach(([n, w], i) => L.TXT(n, x + 300, y + 340 + i * 90, 48, { f: 'PH', col: L.INK2 }, S.at(w) - 0.6, 1.0));
  L.TXT('what holds: the DIRECTION', x + 300, y + 680, 56, { f: 'KB' }, S.at('direction') - 0.4, 0.7);
  L.check(x + 1060, y + 662, 2, S.at('visible') - 0.3);
  L.inkArrow([[x + 1200, y + 720], [x + 1200, y + 560]], { w: 4, amp: 0.4, head: 22 }, S.at('more') - 0.1, 0.3);
});
def(LONG, 'c4g', blk(4, 8), { purpose: 'pressure turns the beam up (Southampton); knowing helps but is not a switch', shot: 'pan right; the dial turns and the cone grows with it (cause → effect)', sfx: 'dial click; marker swell' }, (S, L) => {
  const [x, y] = blk(4, 8);
  tag(L, x + 300, y + 110, 'SOUTHAMPTON', 50, S.at('southampton') - 0.3);
  const dx = x + 300, dy = y + 520; L.INK_(L.ell(dx, dy, 160, 160, Math.PI, L.TAU, 40), { w: 3.4, amp: 0.6 }, S.at('pressure') - 0.2, 0.3);
  L.TXT('low', dx - 170, dy + 50, 36, { f: 'PH', align: 'center', col: L.INK2 }, S.at('pressure'), 0.3); L.TXT('high', dx + 170, dy + 50, 36, { f: 'PH', align: 'center', col: L.INK2 }, S.at('pressure') + 0.2, 0.3);
  L.TXT('being evaluated', dx, dy + 140, 44, { f: 'KB', align: 'center' }, S.at('evaluated') - 0.3, 0.6);
  L.INK_(L.line(dx, dy, dx + Math.cos(-0.35) * 140, dy + Math.sin(-0.35) * 140), { w: 6, amp: 0.2 }, S.at('evaluated'), 0.3);
  L.spotlight(x + 1000, y + 140, x + 1000, y + 760, 220, S.at('stronger') - 0.6, { k: 0.6, col: 'rgba(255,205,40,0.25)' });
  L.spotlight(x + 1000, y + 140, x + 1000, y + 760, 520, S.at('stronger') - 0.1, { k: 0.8 });
  L.person(x + 1000, y + 760, 1.1, S.at('feeling') - 0.4, { pose: 'stand', you: true, kind: 'worry', look: [0, -0.5], k: 0.6, sweat: true });
  L.TXT("helps... isn't a switch", x + 1000, y + 870, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('switch') - 0.4, 0.6);
});

// ===== chapter 5: turning down the beam =====
chapter(LONG, 'ch5', 5, 5, 'TURNING DOWN THE BEAM');
def(LONG, 'c5a', blk(5, 1), { purpose: 'promise: three things to try, each tied to research', shot: 'pan right; the list frame (empty slots set up the next minute)', sfx: 'three bullet dots' }, (S, L) => {
  const [x, y] = blk(5, 1);
  L.TXT('3 THINGS TO TRY', x + 800, y + 200, 90, { f: 'KB', align: 'center' }, S.at('three') - 0.3, 0.8);
  L.swash(x + 450, y + 230, x + 1150, S.at('three') + 0.6, 0.35);
  [0, 1, 2].forEach(i => { numDot(L, x + 360 + i * 440, y + 480, i + 1, S.at('research') - 0.3 + i * 0.2, 56); L.INK_(L.line(x + 260 + i * 440, y + 640, x + 460 + i * 440, y + 640), { w: 2.4, amp: 0.6, passes: 1, dash: [10, 8] }, S.at('research') + i * 0.2, 0.3); });
  L.TXT('each tied to a study', x + 800, y + 760, 46, { f: 'PH', align: 'center', col: L.INK2 }, S.at('tied'), 0.7);
});
def(LONG, 'c5b', blk(5, 2), { purpose: '1 · name it: the 2003 speech study set-up', shot: 'pan right; medium shot of the speaker at the podium, audience in front', sfx: 'pen; a mic tap' }, (S, L) => {
  const [x, y] = blk(5, 2);
  numDot(L, x + 120, y + 110, 1, S.t0 + 0.1, 46); L.TXT('NAME IT', x + 200, y + 135, 70, { f: 'KB' }, S.at('name') - 0.1, 0.5);
  tag(L, x + 1300, y + 110, '2003', 50, S.at('two') - 0.2);
  const pod = [[x + 520, y + 560], [x + 700, y + 560], [x + 680, y + 820], [x + 540, y + 820]];
  L.person(x + 610, y + 820, 1.3, S.at('speech') - 0.6, { pose: 'hold', you: true, kind: 'worry', look: [1, 0.2], k: 0.6 });
  L.FILL(pod, S.at('speech') - 0.1); L.MRK([pod], { col: L.GRY2, w: 12 }, S.at('speech'), 0.1); L.INK_(pod, { closed: true, w: 3.2, amp: 0.5 }, S.at('speech') - 0.1, 0.25);
  L.INK_(L.line(x + 640, y + 560, x + 660, y + 470), { w: 3, amp: 0.2, passes: 1 }, S.at('speech') + 0.2, 0.08); L.INK_(L.ell(x + 664, y + 455, 12, 18, 0, L.TAU, 14), { closed: true, w: 3, amp: 0.2, passes: 1 }, S.at('speech') + 0.28, 0.06);
  [[980, 'tuft'], [1180, 'bun'], [1380, 'cap']].forEach(([ax, hair], i) => L.head(x + ax, y + 640, 52, S.at('short') + i * 0.12, { hair, kind: 'neutral', look: [-1, -0.2], k: 0.4 }));
  const st = [[x + 860, y + 230], [x + 1260, y + 230], [x + 1270, y + 470], [x + 850, y + 470]];
  L.FILL(st, S.at('told') - 0.2); L.MRK([st], { col: 'rgba(255,205,40,0.5)', w: 18 }, S.at('told'), 0.3); L.INK_(st, { closed: true, w: 2.6, amp: 0.6 }, S.at('told') - 0.2, 0.25);
  L.TXT('nerves show less', x + 1060, y + 330, 42, { f: 'KB', align: 'center' }, S.at('nerves') - 0.1, 0.5);
  L.TXT('than they feel', x + 1060, y + 400, 42, { f: 'KB', align: 'center' }, S.at('feel') - 0.1, 0.5);
});
def(LONG, 'c5c', blk(5, 3), { purpose: 'result: calmer, and rated better by speakers and audience', shot: 'pan right; two marker bars compared', sfx: 'marker bars; a small glockenspiel sparkle' }, (S, L) => {
  const [x, y] = blk(5, 3);
  L.TXT('speech quality, rated', x + 520, y + 120, 50, { f: 'KB', align: 'center' }, S.at('rated') - 0.6, 0.6);
  L.bars(x + 180, y + 720, 680, 460, [{ v: 0.55, label: 'not told', col: L.GRY2, t: S.at('rated') - 0.2 }, { v: 0.8, label: 'told', col: L.YEL, t: S.at('better') - 0.3 }], S.t0, { ls: 42 });
  L.TXT('less nervous', x + 1200, y + 300, 52, { f: 'KB', align: 'center' }, S.at('nervous') - 0.3, 0.5); L.check(x + 1380, y + 285, 1.4, S.at('nervous') + 0.2);
  L.TXT('speaker AND audience agreed', x + 1200, y + 420, 42, { f: 'PH', align: 'center', col: L.INK2 }, S.at('watching') - 0.2, 0.9);
  L.TXT('(in that study)', x + 1200, y + 500, 36, { f: 'PH', align: 'center', col: L.INK2 }, S.at('study'), 0.4);
  L.sparks(x + 720, y + 360, 30, 60, [-2.4, -1.6, -0.8], S.at('difference') - 0.2);
});
def(LONG, 'c5d', blk(5, 4), { purpose: '2 · widen the frame: from the worst second to the whole situation', shot: 'pan right; the small frame grows into the wide frame (the move is the advice)', sfx: 'paper slide' }, (S, L) => {
  const [x, y] = blk(5, 4);
  numDot(L, x + 120, y + 110, 2, S.t0 + 0.1, 46); L.TXT('WIDEN THE FRAME', x + 200, y + 135, 70, { f: 'KB' }, S.at('widen') - 0.1, 0.7);
  L.box(x + 640, y + 420, 220, 160, S.at('replay') - 0.2, 0.25, { r: 10, tint: 'rgba(255,205,40,0.3)' });
  L.TXT('X', x + 750, y + 530, 80, { f: 'KB', align: 'center' }, S.at('mistake') - 0.1, 0.25);
  L.TXT('worst second', x + 750, y + 640, 38, { f: 'PH', align: 'center', col: L.INK2 }, S.at('worst') - 0.1, 0.5);
  L.box(x + 260, y + 250, 1000, 560, S.at('whole') - 0.3, 0.45, { dash: [16, 10], fill: false, shadow: false });
  L.person(x + 400, y + 760, 0.9, S.at('whole'), { pose: 'stand', hair: 'bun', kind: 'smile', look: [1, 0], k: 0.4 });
  L.person(x + 1100, y + 760, 0.9, S.at('whole') + 0.2, { pose: 'hold', hair: 'cap', kind: 'think', look: [-1, 0], k: 0.4 });
  L.cup(x + 1150, y + 380, 0.8, S.at('situation'));
  L.TXT('what onlookers do', x + 760, y + 880, 46, { f: 'KB', align: 'center' }, S.at('onlookers') - 0.3, 0.6);
});
def(LONG, 'c5e', blk(5, 5), { purpose: '3 · count the room: a quick self-test that shows attention is busy', shot: 'pan right; push into the empty list while it fails to fill', sfx: 'pen hesitations (short strokes)' }, (S, L) => {
  const [x, y] = blk(5, 5);
  numDot(L, x + 120, y + 110, 3, S.t0 + 0.1, 46); L.TXT('COUNT THE ROOM', x + 200, y + 135, 70, { f: 'KB' }, S.at('count') - 0.1, 0.7);
  L.sheet(x + 300, y + 230, 700, 600, S.at('try') - 0.4, { lines: 0 });
  L.TXT('3 things I noticed', x + 650, y + 320, 48, { f: 'KB', align: 'center' }, S.at('name') - 0.2, 0.7);
  L.TXT('about other people today:', x + 650, y + 380, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('people') - 0.2, 0.7);
  ['1.', '2.', '3.'].forEach((n, i) => { L.TXT(n, x + 380, y + 500 + i * 100, 48, { f: 'KB' }, S.at('today') + i * 0.2, 0.2); L.INK_(L.line(x + 440, y + 505 + i * 100, x + 940, y + 505 + i * 100), { w: 2, amp: 0.5, passes: 1, dash: [10, 8] }, S.at('today') + i * 0.2 + 0.1, 0.3); });
  L.qmark(x + 1180, y + 560, 220, S.at('struggle') - 0.3);
  L.TXT('their attention was busy too', x + 1250, y + 760, 40, { f: 'PH', align: 'center', col: L.INK2 }, S.at('busy') - 0.4, 0.8);
});
def(LONG, 'c5e2', blk(5, 6), { purpose: 'recap of the three; the beam is not the whole stage', shot: 'pan right; pull back slightly to hold the recap and the small spotlight', sfx: 'three soft kalimba notes' }, (S, L) => {
  const [x, y] = blk(5, 6);
  [['name it', 'name'], ['widen the frame', 'widen'], ['count the room', 'count']].forEach(([n, w], i) => { numDot(L, x + 200, y + 200 + i * 150, i + 1, S.at(w) - 0.3, 40); L.TXT(n, x + 280, y + 222 + i * 150, 60, { f: 'KB' }, S.at(w) - 0.1, 0.6); });
  L.stage(x + 820, y + 640, 680, S.at('beam') - 0.3, { rows: 1, per: 5 });
  L.spotlight(x + 1160, y + 330, x + 1160, y + 640, 140, S.at('beam') + 0.2, { k: 0.6 });
  L.person(x + 1160, y + 640, 0.6, S.at('away'), { pose: 'stand', you: true, kind: 'content', look: [0, 0], k: 0.4 });
  L.TXT('not the whole stage', x + 1160, y + 880, 50, { f: 'KB', align: 'center' }, S.at('stage') - 0.4, 0.6);
});
def(LONG, 'c5f', blk(5, 7), { purpose: 'care line: not a replacement for real help', shot: 'pan right; a calm, centred card (no movement beyond the push)', sfx: 'quiet pen' }, (S, L) => {
  const [x, y] = blk(5, 7);
  L.box(x + 260, y + 160, 1080, 560, S.t0 + 0.1, 0.4, { r: 30 });
  L.TXT('serious anxiety?', x + 800, y + 300, 66, { f: 'KB', align: 'center' }, S.at('anxiety') - 0.4, 0.6);
  L.TXT('talk to a professional', x + 800, y + 420, 60, { f: 'KB', align: 'center' }, S.at('professional') - 0.6, 0.7);
  L.TXT('a doctor or licensed therapist · US: call or text 988', x + 800, y + 520, 38, { f: 'PH', align: 'center', col: L.INK2 }, S.at('professional') + 0.2, 1.0);
  L.TXT('everyday version: a reality check', x + 800, y + 640, 44, { f: 'PH', align: 'center', col: L.INK2 }, S.at('everyday') - 0.1, 0.9);
  const hx = x + 800, hy = y + 120; L.MST(L.bez([hx, hy + 30], [hx - 40, hy - 20], [hx - 10, hy - 50], [hx, hy - 20]).concat(L.bez([hx, hy - 20], [hx + 10, hy - 50], [hx + 40, hy - 20], [hx, hy + 30])), { w: 7, col: L.YELD }, S.t0 + 0.5, 0.3);
});

// ===== ending: back to the room =====
def(LONG, 'end1', blk(1, 4, 1700, 900), { purpose: 'payoff: back to the Cornell room, most could not say', shot: 'a long whip back across the page to the chapter 1 room (callback), then hold', sfx: 'long paper whoosh; question-mark taps', noAutoCam: true }, (S, L) => {
  const B = blk(1, 4, 1700, 900), [x, y] = B, c = S.fit(B);
  S.cam(S.t0 - 0.2, (x + 800 + blk(5, 7)[0] + 800) / 2, (y + 450 + 5 * GY + 450) / 2, 0.16, 1.1, 'io');
  S.cam(S.t0 + 0.9, c.x, c.y, c.z, 1.2, 'io');
  S.cam(S.t0 + 2.2, c.x, c.y, c.z * 1.05, Math.max(1, S.end - S.t0 - 2.2), 'sin');
  L.loop(x + 400, y + 640, 110, 220, S.at('student') - 0.1, 0.5);
  [[760, 1], [990, 0], [1220, 1], [1450, 1]].forEach(([sx, q], i) => { const t = S.at('most') + i * 0.18; if (q) L.qmark(x + sx, y + 560, 90, t); else L.check(x + sx, y + 530, 1.8, t, { col: L.INK }); });
});
def(LONG, 'end2', blk(0, 6), { purpose: 'the line to remember: the spotlight is pointed at you, by you', shot: 'whip right along the top row to a new block; push while the line lands', sfx: 'whoosh; the lamp click', ease: 'q', move: 0.9 }, (S, L) => {
  const [x, y] = blk(0, 6);
  const P = L.person(x + 700, y + 820, 1.6, S.t0 + 0.1, { pose: 'point', you: true, kind: 'content', look: [1, -0.4], k: 0.9, dir: 1 });
  const hand = P.hand[1];
  const lp = lampHeld(L, hand[0], hand[1], Math.PI + 0.9, S.at('pointed') - 0.4);
  const m = lp.mouth, hd = P.head;
  L.MRK([[m, [hd[0] + hd[2] * 1.4, hd[1] - hd[2] * 0.6], [hd[0] - hd[2] * 0.6, hd[1] + hd[2] * 1.5]]], { col: 'rgba(255,205,40,0.5)', w: 22, edge: false }, S.at('pointed'), 0.4);
  L.TXT('pointed at you...', x + 1150, y + 300, 64, { f: 'KB' }, S.at('pointed') + 0.1, 0.7);
  L.TXT('...by you.', x + 1150, y + 420, 64, { f: 'KB' }, S.at('by') - 0.1, 0.5);
  L.swash(x + 1150, y + 445, x + 1420, S.at('by') + 0.4, 0.3);
  L.TXT('the spotlight you feel is real', x + 800, y + 110, 46, { f: 'PH', align: 'center', col: L.INK2 }, S.at('real') - 0.6, 0.8);
});
def(LONG, 'end3', blk(0, 7), { purpose: 'one specific comment question + one subscribe line', shot: 'pan right; the question card fills the frame', sfx: 'pen; a kalimba on "subscribe"' }, (S, L) => {
  const [x, y] = blk(0, 7);
  L.bubble(x + 160, y + 120, 1280, 330, S.t0 + 0.2, { tint: 'rgba(255,205,40,0.25)', tail: [x + 400, y + 560] });
  L.TXT("What's one moment you're still", x + 800, y + 250, 64, { f: 'KB', align: 'center' }, S.at('moment') - 0.6, 0.9);
  L.TXT('sure everyone noticed?', x + 800, y + 350, 64, { f: 'KB', align: 'center' }, S.at('sure') - 0.2, 0.8);
  L.TXT('tell me in the comments ↓', x + 800, y + 560, 50, { f: 'PH', align: 'center', col: L.INK2 }, S.at('comments') - 0.4, 0.8);
  L.box(x + 560, y + 660, 480, 120, S.at('subscribe') - 0.4, 0.3, { r: 30, tint: L.YEL });
  L.TXT('SUBSCRIBE', x + 800, y + 742, 60, { f: 'KB', align: 'center' }, S.at('subscribe') - 0.2, 0.5);
});
def(LONG, 'card', blk(0, 8, 1400, 700), { purpose: 'end card', shot: 'pan right to the card, then hold', sfx: 'closing chord (harp, glockenspiel, vibraphone)', push: 0.02 }, (S, L) => {
  const [x, y] = blk(0, 8, 1400, 700);
  L.ribbon(x + 700, y + 230, 860, 120, 'THE OVERTHINKING PAD', 62, S.t0 + 0.2, { d: 0.35, td: 0.9 });
  L.TXT('why your brain does this, on one page', x + 700, y + 420, 48, { f: 'PH', align: 'center', col: L.INK2 }, S.t0 + 1.3, 1.0);
  L.TXT('new pages Mon · Tue · Thu · Sat', x + 700, y + 520, 50, { f: 'KB', align: 'center' }, S.t0 + 2.4, 1.0);
  L.loop(x + 700, y + 230, 520, 110, S.t0 + 3.6, 0.6);
});

// ---------- the Short (9:16): blocks are tall, 900 × 1150 ----------
const SBW = 900, SBH = 1150, sblk = i => [i * 1050, 0, SBW, SBH];
const SHORT = {};
def(SHORT, 's1', sblk(0), { purpose: 'hook in the first second: the shirt, the room, the count', shot: 'opens close on the face-shirt, pulls back to show the wearer and the tally (reveal)', sfx: 'pen from frame 0', noAutoCam: true }, (S, L) => {
  const B = sblk(0), [x, y] = B, c = S.fit(B);
  S.cam(S.t0, x + 360, y + 760, c.z * 1.55, 0.01); S.cam(S.t0 + 1.0, c.x, c.y, c.z * 1.08, 1.6, 'io');
  const P = L.person(x + 330, y + 980, 1.9, S.t0, { pose: 'walk', you: true, shirt: 'face', kind: 'worry', look: [1, 0], k: 1.0 });
  L.spotlight(x + 330, y + 260, x + 330, y + 990, 320, S.at('embarrassing') - 0.2, { k: 0.8 });
  L.TXT('who noticed?', x + 700, y + 120, 58, { f: 'KB', align: 'center' }, S.at('counted') - 0.3, 0.6);
  for (let i = 0; i < 4; i++) L.INK_(L.line(x + 620 + i * 34, y + 200, x + 616 + i * 34, y + 320), { w: 5, amp: 0.4, passes: 1 }, S.at('counted') + 0.2 + i * 0.1, 0.08);
  L.INK_(L.line(x + 600, y + 300, x + 760, y + 220), { w: 5, amp: 0.4, passes: 1 }, S.at('noticed') + 0.1, 0.1);
});
def(SHORT, 's2', sblk(1), { purpose: 'set-up: Cornell 2000, a room of students, a giant face on the shirt', shot: 'pan right to the room; medium shot', sfx: 'door; pen' }, (S, L) => {
  const [x, y] = sblk(1);
  tag(L, x + 450, y + 90, 'CORNELL · 2000', 60, S.at('cornell') - 0.2);
  L.door(x + 40, y + 700, 160, 380, S.at('walked') - 0.5, { open: 0.8, k: 0.8 });
  L.person(x + 290, y + 700, 1.6, S.at('walked') - 0.2, { pose: 'walk', you: true, shirt: 'face', kind: 'worry', look: [1, 0], k: 0.7 });
  [[560, 'bun'], [780, 'tuft']].forEach(([sx, hair], i) => L.student(x + sx, y + 700, 1.2, S.at('room') + i * 0.25, { hair, kind: 'think', look: [0.5, 0.8], dir: 1, k: 0.5 }));
  tshirt(L, x + 450, y + 920, 1.15, S.at('giant') - 0.3, { print: 'face', k: 0.7 });
  L.TXT('Barry Manilow', x + 450, y + 1110, 48, { f: 'KB', align: 'center' }, S.at('barry') - 0.1, 0.6);
});
def(SHORT, 's3', sblk(2), { purpose: 'the guess: half the heads light up', shot: 'pan right; hold the grid so it can be counted', sfx: 'marker swish per head' }, (S, L) => {
  const [x, y] = sblk(2);
  L.TXT('THEIR GUESS', x + 450, y + 150, 80, { f: 'KB', align: 'center' }, S.at('guessed') - 0.3, 0.6);
  for (let r = 0; r < 3; r++) headRow(L, x + 150, y + 330 + r * 190, 4, 200, 46, S.at('people') + r * 0.25, { k: 0.35 });
  const hiT = S.at('half') - 0.2; [[0, 0], [0, 1], [0, 2], [1, 0], [1, 3], [2, 1]].forEach(([r, i], q) => L.MST(L.ell(x + 150 + i * 200, y + 330 + r * 190, 66, 70, -0.3, L.TAU + 0.3, 50), { w: 10, col: L.YELD, amp: 1.5 }, hiT + q * 0.12, 0.11));
  L.TXT('≈ HALF', x + 450, y + 1010, 110, { f: 'KB', align: 'center' }, S.at('half') + 0.2, 0.5);
});
def(SHORT, 's4', sblk(3), { purpose: 'the reveal: a quarter', shot: 'pan right; slow push on the number (reading time)', sfx: 'a beat of silence, then three marker swishes' }, (S, L) => {
  const [x, y] = sblk(3);
  L.TXT('THE REAL COUNT', x + 450, y + 150, 76, { f: 'KB', align: 'center' }, S.at('real') - 0.3, 0.6);
  for (let r = 0; r < 3; r++) headRow(L, x + 150, y + 330 + r * 190, 4, 200, 46, S.t0 + 0.2 + r * 0.2, { k: 0.3 });
  const hiT = S.at('quarter') - 0.3; [[0, 1], [1, 3], [2, 0]].forEach(([r, i], q) => L.MST(L.ell(x + 150 + i * 200, y + 330 + r * 190, 66, 70, -0.3, L.TAU + 0.3, 50), { w: 10, col: L.YELD, amp: 1.5 }, hiT + q * 0.15, 0.12));
  L.TXT('≈ A QUARTER', x + 450, y + 1010, 104, { f: 'KB', align: 'center' }, S.at('quarter') + 0.1, 0.5);
  L.swash(x + 150, y + 1030, x + 750, S.at('quarter') + 0.7, 0.35);
});
def(SHORT, 's5', sblk(4), { purpose: 'the twist (proud shirt, same gap) and the reason (inside view, everyone has a spotlight)', shot: 'pan right; tilt down the block as each idea is added (top to bottom)', sfx: 'marker swishes for the small spotlights', noAutoCam: true }, (S, L) => {
  const B = sblk(4), [x, y] = B, c = S.fit(B);
  S.cam(S.t0 - 0.25, x + 450, y + 300, c.z * 1.3, 0.9); S.cam(S.at('inside') - 0.6, x + 450, y + 620, c.z * 1.3, 1.2); S.cam(S.at('everyone') - 0.9, c.x, c.y, c.z, 1.2);
  L.TXT('THE TWIST', x + 450, y + 110, 72, { f: 'KB', align: 'center' }, S.t0 + 0.05, 0.6);
  tshirt(L, x + 260, y + 260, 1.1, S.t0 + 0.5, { print: 'star', k: 0.7, tint: 'rgba(255,205,40,0.2)' });
  L.TXT('proud shirt', x + 260, y + 470, 46, { f: 'KB', align: 'center' }, S.at('proud'), 0.5);
  L.TXT('same gap', x + 650, y + 260, 58, { f: 'KB', align: 'center' }, S.at('same') - 0.2, 0.5); L.check(x + 800, y + 245, 1.5, S.at('happened'));
  L.TXT("it isn't shame", x + 650, y + 380, 46, { f: 'PH', align: 'center', col: L.INK2 }, S.at('shame') - 0.2, 0.5);
  L.head(x + 450, y + 640, 110, S.at('inside') - 0.4, { you: true, kind: 'worry', look: [0, 0], k: 0.7 });
  [[300, 500], [600, 500], [300, 780], [600, 780]].forEach(([cx, cy], i) => { const sx = i % 2 ? -1 : 1, sy = i < 2 ? 1 : -1; L.INK_([[x + cx, y + cy + sy * 50], [x + cx, y + cy], [x + cx + sx * 50, y + cy]], { w: 4, amp: 0.3, passes: 1 }, S.at('close-up') - 0.2 + i * 0.05, 0.08); });
  [[180, 'bun'], [450, 'tuft'], [720, 'curly']].forEach(([px, hair], i) => { const t = S.at('everyone') + i * 0.3; L.spotlight(x + px, y + 830, x + px, y + 1120, 140, t + 0.1, { k: 0.5, col: 'rgba(255,205,40,0.32)' }); L.person(x + px, y + 1120, 0.62, t, { pose: 'stand', hair, kind: 'think', look: [0, -0.4], k: 0.35 }); });
});
def(SHORT, 's6', sblk(5), { purpose: 'payoff + loop back to the hook + one comment question', shot: 'pan right; the shirt returns; hold on the question', sfx: 'pen; closing kalimba' }, (S, L) => {
  const [x, y] = sblk(5);
  tshirt(L, x + 450, y + 300, 1.3, S.t0 + 0.1, { print: 'face', k: 0.7 });
  L.TXT('the whole room saw it?', x + 450, y + 90, 50, { f: 'PH', align: 'center', col: L.INK2 }, S.at('whole') - 0.2, 0.8);
  L.TXT('remember the shirt', x + 450, y + 560, 60, { f: 'KB', align: 'center' }, S.at('remember') - 0.1, 0.6);
  L.TXT("most probably didn't notice", x + 450, y + 650, 46, { f: 'PH', align: 'center', col: L.INK2 }, S.at('most') - 0.1, 0.7);
  L.bubble(x + 60, y + 760, 780, 300, S.at('moment') - 0.6, { tint: 'rgba(255,205,40,0.25)' });
  L.TXT('What moment are you still', x + 450, y + 880, 54, { f: 'KB', align: 'center' }, S.at('moment') - 0.2, 0.8);
  L.TXT('sure everybody noticed?', x + 450, y + 960, 54, { f: 'KB', align: 'center' }, S.at('sure', 2) - 0.1, 0.8);
});

export default { long: { scenes: LONG }, short: { scenes: SHORT } };
