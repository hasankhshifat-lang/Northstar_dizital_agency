// The Overthinking Pad: film runtime. One page renders any episode, long (16:9) or Short (9:16).
//   index.html?film=long|short[&from=a&to=b][&nosub=1]
// Reads script.json (lines), out/<film>/timeline.json (scene times from the real voice, tools/timeline.mjs),
// voice/<film>/out/words.json (word times, optional) and episode.js (the drawings and camera per scene).
// The page is one endless dot-grid sheet in world units; each scene draws into its block and the camera
// travels block to block (pan, whip to chapter banners, slow push while words are written, pull-back at the end).
import * as L from './lib.js';
import EPI from './episode.js';
const { G, R, EL, PAGE_TEXTS, clamp, lerp, eio, eo, e5 } = L;
const Q = new URLSearchParams(location.search);
const FILM = Q.get('film') || 'long', NOSUB = !!Q.get('nosub');
const W = window.innerWidth || 1920, H = window.innerHeight || 1080, VERT = H > W;
const cv = document.getElementById('c'); cv.width = W; cv.height = H;
const ctx = cv.getContext('2d');
const OC = document.createElement('canvas'); OC.width = W; OC.height = H;
Object.assign(G, { W, H, ctx, OC, octx: OC.getContext('2d') });

const j = async (u, opt) => { const r = await fetch(u); if (!r.ok) { if (opt) return null; throw new Error('missing ' + u); } return r.json(); };
const [SCRIPT, TL, GLY, WORDS] = await Promise.all([j('script.json'), j(`out/${FILM}/timeline.json`), j('glyphs.json'), j(`voice/${FILM}/out/words.json`, true)]);
G.GLY = GLY;
await Promise.all(['KB', 'PH', 'AN'].map(f => document.fonts.load(`40px ${f}`)));
const DUR = TL.dur;

// ---------- camera keys ----------
// key = {t, x, y, z, m (move seconds), e (ease)}. The camera moves from where it is at t to (x,y,z) over m seconds.
const KEYS = [];
const camKey = (t, x, y, z, m = 1.0, e = 'io') => KEYS.push({ t, x, y, z, m: Math.max(m, 0.01), e });
const EASE = { io: eio, o: eo, q: e5, lin: t => clamp(t), sin: t => 0.5 - 0.5 * Math.cos(Math.PI * clamp(t)) };
const SUBH = VERT ? 0 : 120;               // the subtitle slip's height at the bottom (16:9); 9:16 keeps the bottom 400 px clear
const SAFE_BOTTOM = VERT ? 420 : SUBH;
function fit(b, f = 0.95) {                 // camera that fits a block [x, y, w, h] above the subtitle slip
  const [x, y, w, h] = b, ah = H - SAFE_BOTTOM - (VERT ? 160 : 30);
  const z = Math.min(W * f / w, ah * f / h);
  const cy = y + h / 2 + (SAFE_BOTTOM - (VERT ? 160 : 30)) / 2 / z;
  return { x: x + w / 2, y: cy, z };
}
function camAt(t) {
  if (!KEYS.length) return { x: 0, y: 0, z: 1 };
  let from = KEYS[0], to = KEYS[0], kt = KEYS[0].t, km = 0.01, ke = 'io';
  const st = (a, b, u) => ({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), z: Math.exp(lerp(Math.log(a.z), Math.log(b.z), u)) });
  for (let i = 1; i < KEYS.length && KEYS[i].t <= t; i++) {
    const k = KEYS[i];
    from = st(from, to, EASE[ke]((k.t - kt) / km)); to = k; kt = k.t; km = k.m; ke = k.e;
  }
  return st(from, to, EASE[ke]((t - kt) / km));
}
const toScreen = (c, x, y) => [(x - c.x) * c.z + W / 2, (y - c.y) * c.z + H / 2];

// ---------- scenes ----------
const lineOf = id => (SCRIPT[FILM] || []).find(s => s.id === id) || {};
const DEF = EPI[FILM];
const SC = TL.shots;
let BEFORE = null;
SC.forEach((sh, i) => {
  const def = DEF.scenes[sh.id];
  if (!def) throw new Error('no drawing for scene ' + sh.id);
  const say = lineOf(sh.id).say || '';
  const words = say.replace(/\.\.\./g, ' ').split(/\s+/).filter(Boolean).map(w => w.toLowerCase().replace(/[^a-z0-9']/g, ''));
  const wt = WORDS && WORDS[sh.voice] ? WORDS[sh.voice] : null;  // [[word, start, end]] from the speech check
  // time of the n-th occurrence of a word (or a word index) in this scene's line
  const at = (key, nth = 1, off = 0) => {
    if (!sh.vt) return sh.t0 + off;
    let idx = -1;
    if (typeof key === 'number') idx = key;
    else { let c = 0; const kk = key.toLowerCase().replace(/[^a-z0-9']/g, ''); for (let q = 0; q < words.length; q++) if (words[q] === kk && ++c === nth) { idx = q; break; } }
    if (idx < 0) { console.warn('cue word not found', sh.id, key); return sh.vt + off; }
    if (wt && wt.length) {                                       // map by position when the counts differ
      const u = Math.round(idx * (wt.length - 1) / Math.max(1, words.length - 1));
      const m = wt[clamp(u, 0, wt.length - 1)]; return sh.vt + Math.max(0, m[1]) + off;
    }
    const cc = words.slice(0, idx).join(' ').length, tot = words.join(' ').length;
    return sh.vt + sh.vdur * cc / Math.max(1, tot) + off;
  };
  const S = { ...sh, i, at, f: u => (sh.vt ?? sh.t0) + (sh.vdur ?? (sh.t1 - sh.t0)) * u, end: sh.t1, say, prev: BEFORE, film: FILM, W, H, VERT,
    cam: (t, x, y, z, m, e) => camKey(t, x, y, z, m, e), fit };
  R.SEED = 1000 + i * 101;
  const block = def.block;
  // default camera: move to the block at the scene start, then a slow push while it is written
  if (!def.noAutoCam) {
    const c = def.camFit ? fit(def.camFit, def.f) : fit(block, def.f);
    const m = def.move ?? (sh.type === 'chapter' ? 0.75 : 1.1);
    camKey(sh.t0 - (def.lead ?? 0.25), c.x, c.y, c.z, m, def.ease || (sh.type === 'chapter' ? 'q' : 'io'));
    if (def.push !== 0) camKey(sh.t0 - (def.lead ?? 0.25) + m, c.x, c.y, c.z * (1 + (def.push ?? 0.035)), Math.max(0.5, sh.t1 - sh.t0 - m), 'sin');
  }
  def.draw(S, L);
  BEFORE = S;
});
KEYS.sort((a, b) => a.t - b.t);

// ---------- paper ----------
const GRAIN = document.createElement('canvas'); GRAIN.width = 1024; GRAIN.height = 1024;
{ const g = GRAIN.getContext('2d'); R.SEED = 9; for (let i = 0; i < 26000; i++) { g.fillStyle = `rgba(90,80,60,${L.rr(0.015, 0.05)})`; g.fillRect(L.rr(0, 1024), L.rr(0, 1024), L.rr(0.8, 2.6), L.rr(0.8, 2.6)); } }
const GPAT = ctx.createPattern(GRAIN, 'repeat');
function paper(c) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = L.PAPER; ctx.fillRect(0, 0, W, H);
  ctx.setTransform(c.z, 0, 0, c.z, W / 2 - c.x * c.z, H / 2 - c.y * c.z);
  const x0 = c.x - W / 2 / c.z, x1 = c.x + W / 2 / c.z, y0 = c.y - H / 2 / c.z, y1 = c.y + H / 2 / c.z;
  ctx.fillStyle = GPAT; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  const st = 26, r = Math.max(1.3, 0.9 / c.z);
  if (c.z * st < 7) return;                                   // far away: the dots would be a grey haze
  ctx.fillStyle = L.DOT;
  for (let y = Math.floor((y0 - 13) / st) * st + 13; y < y1 + st; y += st) for (let x = Math.floor((x0 - 13) / st) * st + 13; x < x1 + st; x += st) ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

// ---------- subtitles: a paper slip with washi tape (screen space) ----------
const CUES = TL.cues;
function subtitles(t) {
  if (NOSUB) return;
  const C = CUES.find(c => t >= c.t0 && t < c.t1); if (!C) return;
  const a = clamp(Math.min((t - C.t0) / 0.2, (C.t1 - t) / 0.2)), rise = (1 - eo(clamp((t - C.t0) / 0.3))) * 6;
  const fs = VERT ? 54 : 44;
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = a;
  ctx.font = `${fs}px PH`; const tw = ctx.measureText(C.text).width;
  const cw = tw + 70, ch = fs * 1.75, x0 = W / 2 - cw / 2, y0 = (VERT ? H - 430 - ch : H - 22 - ch) + rise;
  ctx.fillStyle = 'rgba(80,80,92,0.12)'; ctx.fill(L.pathOf(L.rrect(x0 + 4, y0 + 5, cw, ch, 10)));
  ctx.fillStyle = L.PAPER; ctx.globalAlpha = a * 0.96; ctx.fill(L.pathOf(L.rrect(x0, y0, cw, ch, 10)));
  ctx.globalAlpha = a; ctx.save(); ctx.translate(x0 + 30, y0 + 2); ctx.rotate(-0.16); ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = L.rgba(L.PL.shd, 0.22); ctx.fillRect(-34, -11, 68, 22); ctx.restore();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = L.INK; ctx.font = `${fs}px PH`;
  ctx.fillText(C.text, W / 2, y0 + ch / 2 + 2);
  ctx.restore();
}

// ---------- render ----------
const FROM = +(Q.get('from') || 0), TO = +(Q.get('to') || DUR);
window.DUR = TO - FROM;
function renderFilm(t) {
  const f = Math.round(t * L.FPS); R.BOIL = Math.floor(f / 2) % 3;
  const c = camAt(t); paper(c);
  const m = 40 / c.z, vx0 = c.x - W / 2 / c.z - m, vx1 = c.x + W / 2 / c.z + m, vy0 = c.y - H / 2 / c.z - m, vy1 = c.y + H / 2 / c.z + m;
  for (const e of EL) {
    if (t < e.t0) continue;
    const b = e.bb; if (b && (b[2] < vx0 || b[0] > vx1 || b[3] < vy0 || b[1] > vy1)) continue;
    R.SEED = e.seed; e.draw(clamp((t - e.t0) / e.d));
  }
  subtitles(t);
}
window.render = t => renderFilm(t + FROM);
window.CAMAT = camAt;
window.TEXTS = t => {
  t += FROM; const c = camAt(t), out = [];
  PAGE_TEXTS.forEach(({ T, t0, bb, pass }, i) => {
    if (t < t0) return;
    const [a0, b0] = toScreen(c, bb[0] + 10, bb[1]), [a1, b1] = toScreen(c, bb[2] - 10, bb[3]);
    if (a1 < 0 || a0 > W || b1 < 0 || b0 > H) return;
    out.push({ id: 'p' + i, text: T.s, x0: a0, y0: b0, x1: a1, y1: b1, pass: pass || (b1 - b0) < 18 });
  });
  return out;
};
window.EV = EL.filter(e => e.kind !== 'fill').map(e => { const c = camAt(e.t0 + e.d / 2), bx = e.bb ? (e.bb[0] + e.bb[2]) / 2 : c.x, x = toScreen(c, bx, 0)[0]; return { t: +e.t0.toFixed(4), type: e.kind, d: +e.d.toFixed(4), pan: +clamp((x / W) * 2 - 1, -1, 1).toFixed(3) }; })
  .filter(e => e.t < DUR);
for (const s of SC) window.EV.push({ t: s.t0, type: 'cue', name: s.type || 'scene', id: s.id });
for (const k of KEYS) if (k.e === 'q') window.EV.push({ t: k.t, type: 'cue', name: 'whoosh', d: k.m });
window.render(0);
window.READY = true;
