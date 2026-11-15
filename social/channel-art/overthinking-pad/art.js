// The Overthinking Pad — channel art in the Marker on Paper style (same pen engine as the Shorts).
// ?kind=banner&w=2560&h=1440  → YouTube banner (safe area 1546×423 in the centre)
// ?kind=profile&w=800&h=800   → profile picture (shown as a circle)
// Black builds everything, red is the one accent (the "?"), blue only for faint margin doodles.
import { mulberry } from '/core/lib.js';
import { W, H, Ink, line, curve, arc, circle, makePaper, compose, reseed, setGlyphs } from './pen.js';

const Q = new URLSearchParams(location.search), KIND = Q.get('kind') || 'banner';
const cv = document.getElementById('c'); cv.width = W; cv.height = H;
const X = cv.getContext('2d');
const ink = new Ink();

// the channel's figure: one hand over the face, the other arm limp (as in the first Short)
function person(fx, fy, s, w = 9) {
  w *= Math.sqrt(s);
  const at = (u, v) => [fx + u * s, fy - v * s];
  return [circle(...at(-9, 258), 32 * s, { w, a0: 2.3, lap: .22 }),
    curve([at(-2, 226), at(3, 176), at(0, 120)], { w }),
    curve([at(-2, 222), at(-46, 214), at(-30, 250)], { w }),
    curve([at(2, 220), at(24, 172), at(26, 124)], { w }),
    curve([at(0, 120), at(-16, 60), at(-30, 0)], { w }), curve([at(0, 120), at(14, 60), at(28, 0)], { w })];
}
function eye(x, y, tx, ty, r = 40, w = 6.5, color = 'black') {
  const up = arc(x, y + r * .9, r * 1.25, -Math.PI + .72, -.72, { w, color });
  const lo = arc(x, y - r * .9, r * 1.25, Math.PI - .72, .72, { w, color });
  const a = Math.atan2(ty - y, tx - x);
  return [up, lo, circle(x + Math.cos(a) * r * .38, y + Math.sin(a) * r * .3, r * .17, { w: r * .3, lap: .1, jitter: .2, color })];
}
function question(x, y, s, color = 'red', w = 10) {        // a hand-drawn "?" whose dot sits at (x, y)
  const p = (u, v) => [x + u * s, y + v * s];
  return [curve([p(-13, -58), p(-7, -72), p(9, -71), p(13, -55), p(1, -42), p(1, -26)], { w, color }),
    circle(...p(1, 0), w * .42, { w: w * .95, color, lap: .15, jitter: .1 })];
}
const T = (s, x, y, o = {}) => ink.layout(s, x, y, { font: 'Kalam', ...o });
function fit(str, maxW, size, weight = 700) { const m = ink.measure(str, { size, weight }); return m > maxW ? size * maxW / m : size; }

function banner() {
  reseed(17);
  const SX = 507, SY = 509, SW = 1546, SH = 423;                // YouTube's safe area (shown on every device)
  // left: the figure, four eyes on it
  const fx = 760, fy = 905;
  ink.add(person(fx, fy, 1.25));
  const head = [fx - 11, fy - 322];
  for (const [ex, ey] of [[580, 600], [940, 590], [560, 820], [960, 830]]) ink.add(eye(ex, ey, head[0], head[1] + 40, 42));
  const at = (u, v) => [fx + u * 1.25, fy - v * 1.25];             // the T-shirt box, then the red "?" on it
  ink.add([line(...at(-34, 214), ...at(36, 214), { w: 6, over: 5 }), line(...at(-34, 214), ...at(-30, 128), { w: 6 }),
    line(...at(36, 214), ...at(32, 128), { w: 6 }), line(...at(-30, 128), ...at(32, 128), { w: 6, over: 4 })]);
  ink.add(question(fx - 18, fy - 166, .9, 'red', 9));
  // right: the name, a red wavy underline, the line
  const tx = 1080, maxW = SX + SW - tx - 20;
  const size = fit('The Overthinking Pad', maxW, 150);
  const title = T('The Overthinking Pad', tx, 718, { size, seed: 5 });
  ink.write(title);
  const pts = []; for (let x = 0; x <= title.w; x += 12) pts.push([tx + x, 752 + Math.sin(x / 70) * 7]);
  ink.add(curve(pts, { w: 10, color: 'red' }));
  ink.write(T('Your brain, one sheet at a time.', tx + 4, 850, { size: Math.min(66, size * .46), weight: 400, seed: 9 }));
  // margins (outside the safe area, seen on TVs and wide screens): faint blue doodles
  const R = mulberry(23), spots = [];
  for (let i = 0; i < 26; i++) {
    const x = 120 + R() * (W - 240), y = 90 + R() * (H - 180);
    if (x > SX - 90 && x < SX + SW + 90 && y > SY - 90 && y < SY + SH + 90) continue;
    if (spots.some(([a, b]) => Math.hypot(a - x, b - y) < 230)) continue;
    spots.push([x, y]);
    const k = R();
    if (k < .4) ink.add(eye(x, y, 1280, 720, 26 + R() * 10, 4.5, 'blue'));
    else if (k < .75) ink.add(question(x, y, .7 + R() * .3, 'blue', 6));
    else ink.add(circle(x, y, 22 + R() * 18, { w: 5, color: 'blue' }));
  }
}

function profile() {
  reseed(29);
  const cx = W / 2, cy = H / 2 + 90, hw = 230, lid = 165, w = 24;  // a big eye, looking up at its own red "?"
  ink.add([curve([[cx - hw, cy + 6], [cx - hw * .45, cy - lid * .78], [cx + hw * .45, cy - lid * .8], [cx + hw, cy - 4]], { w }),
    curve([[cx - hw, cy + 6], [cx - hw * .4, cy + lid * .62], [cx + hw * .4, cy + lid * .6], [cx + hw, cy - 4]], { w })]);
  ink.add(circle(cx - 6, cy - 22, 31, { w: 64, lap: .05, jitter: .1, pool: 0 }));   // solid pupil (one stroke), looking up
  ink.add(question(cx + 4, cy - 205, 2.1, 'red', 26));
}

async function boot() {
  for (const f of [new FontFace('Kalam', 'url(fonts/Kalam-Bold.ttf)', { weight: '700' }), new FontFace('Kalam', 'url(fonts/Kalam-Regular.ttf)', { weight: '400' })]) { await f.load(); document.fonts.add(f); }
  setGlyphs(await (await fetch('glyphs.json')).json());
  ink.clear();
  KIND === 'profile' ? profile() : banner();
  const im = X.createImageData(W, H);
  compose(makePaper(KIND === 'profile' ? 4 : 3), ink, im);
  X.putImageData(im, 0, 0);
  window.DUR = 1; window.render = () => {}; window.READY = true;
}
boot();
