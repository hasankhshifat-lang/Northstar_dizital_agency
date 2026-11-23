// Thumbnail art for 2026-11-23 (no text: the headline is live text in Remotion). World 1600x900 (long), 900x1600 (short).
const def = {};
const T = 0.01;
function cloud(L, cx, cy, w, h, t) {
  const P = []; const n = 9; for (let i = 0; i <= n * 8; i++) { const a = i / (n * 8) * L.TAU, bump = 1 + 0.12 * Math.abs(Math.sin(a * n / 2)); P.push([cx + Math.cos(a) * w / 2 * bump, cy + Math.sin(a) * h / 2 * bump]); }
  L.FILL(P, t); L.MRK([P], { col: L.GRYD, w: 22 }, t, T); L.INK_(P, { closed: true, w: 5, amp: 0.8 }, t, T);
  for (let i = 0; i < 6; i++) L.INK_(L.line(cx - w * 0.32 + i * w * 0.13, cy + h * 0.62, cx - w * 0.36 + i * w * 0.13, cy + h * 0.62 + 60), { w: 4, amp: 0.2, passes: 1 }, t, T);
  L.INK_([[cx + w * 0.05, cy + h * 0.3], [cx - w * 0.06, cy + h * 0.75], [cx + w * 0.04, cy + h * 0.72], [cx - w * 0.08, cy + h * 1.15]], { w: 7, amp: 0.2, passes: 1, col: L.YELD }, t, T);
}
function shield(L, cx, cy, s, t) {
  const P = L.bez([cx, cy - 120 * s], [cx + 60 * s, cy - 100 * s], [cx + 100 * s, cy - 110 * s], [cx + 100 * s, cy - 110 * s]).concat(L.bez([cx + 100 * s, cy - 110 * s], [cx + 110 * s, cy + 10 * s], [cx + 60 * s, cy + 80 * s], [cx, cy + 120 * s])).concat(L.bez([cx, cy + 120 * s], [cx - 60 * s, cy + 80 * s], [cx - 110 * s, cy + 10 * s], [cx - 100 * s, cy - 110 * s])).concat(L.bez([cx - 100 * s, cy - 110 * s], [cx - 100 * s, cy - 110 * s], [cx - 60 * s, cy - 100 * s], [cx, cy - 120 * s]));
  L.FILL(P, t); L.MRK([P], { col: L.YEL, w: 26 }, t, T); L.INK_(P, { closed: true, w: 6, amp: 0.4 }, t, T);
  // a scribbled "worry knot" drawn on the shield (the shield is made of worry)
  const K = []; for (let i = 0; i <= 120; i++) { const u = i / 120, a = u * L.TAU * 4; K.push([cx + Math.cos(a) * 46 * s * (1 - u * 0.5) + Math.sin(a * 0.5) * 10 * s, cy - 10 * s + Math.sin(a) * 40 * s * (1 - u * 0.5)]); }
  L.MST(K, { w: 5, col: L.INK, amp: 0.8 }, t, T);
}
// "you" sitting up in bed under the blanket, the right hand holding the worry shield up toward the storm
function you(L, x, y, s, t, o = {}) {
  const r = 34 * s, hy = y - 168 * s, sx = x + o.sdx * s, sy = hy + o.sdy * s;
  const P = L.person(x, y, s, t, { pose: 'point', you: true, kind: o.kind || 'worry', look: o.look || [1, -0.6], hair: 'tuft', k: 0.01, sweat: true, reach2: [sx - 60 * s * o.ss, sy + 70 * s * o.ss] });
  shield(L, sx, sy, o.ss * s, t);
  const bl = L.bez([x - 150 * s, y - 70 * s], [x - 90 * s, y - 100 * s], [x + 90 * s, y - 100 * s], [x + 170 * s, y - 70 * s]).concat([[x + 190 * s, y + 10 * s], [x - 170 * s, y + 10 * s]]);
  L.FILL(bl, t); L.MRK([bl], { col: L.GRY2, w: 22 }, t, T); L.INK_(bl, { closed: true, w: 5, amp: 0.6 }, t, T);
  const hb = [[x - 190 * s, y + 10 * s], [x - 190 * s, y - 150 * s], [x - 175 * s, y - 150 * s], [x - 175 * s, y + 10 * s]]; L.FILL(hb, t); L.MRK([hb], { col: L.GRYD, w: 14 }, t, T); L.INK_(hb, { closed: true, w: 4, amp: 0.4 }, t, T);
  const pil = L.ell(x - 120 * s, y - 90 * s, 60 * s, 22 * s, 0, L.TAU, 30); L.FILL(pil, t); L.INK_(pil, { closed: true, w: 3.4, amp: 0.4 }, t, T);
  return P;
}
def.long = { t: { block: [0, 0, 1600, 900], noAutoCam: true, draw: (S, L) => {
  S.cam(-1, 800, 450, S.W / 1600, 0.01); const t = -1;
  cloud(L, 1060, 150, 520, 200, t);
  you(L, 380, 980, 3.0, t, { kind: 'worry', look: [1, -0.7], sdx: 130, sdy: -40, ss: 0.55 });
} } };
def.short = { t: { block: [0, 0, 900, 1600], noAutoCam: true, draw: (S, L) => {
  S.cam(-1, 450, 800, S.W / 900, 0.01); const t = -1;
  cloud(L, 560, 430, 560, 220, t);
  you(L, 360, 1250, 3.0, t, { kind: 'worry', look: [1, -0.8], sdx: 110, sdy: -60, ss: 0.5 });
} } };
export default { long: { scenes: def.long }, short: { scenes: def.short } };
