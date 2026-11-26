// Thumbnail art for 2026-11-26 (no lettering in the art; the headline is live text in Remotion). World 1600x900 (long), 900x1600 (short).
const def = {};
function mask(L, cx, cy, s, t, stick) {   // the smiling mask on a stick
  const m = L.ell(cx, cy, 62 * s, 74 * s, 0, L.TAU, 48);
  L.FILL(m, t); L.MRK([m], { col: L.GRY, w: 16 }, t, 0.01); L.dropShadow(m, 10 * s, 12 * s, t, 0.01); L.INK_(m, { closed: true, w: 6, amp: 0.3 }, t, 0.01);
  for (const d of [-1, 1]) L.MRK([L.ell(cx + d * 22 * s, cy - 14 * s, 12 * s, 7 * s, 0, L.TAU, 14)], { col: L.INKM(0.9), w: 8, edge: false, op: 'source-over' }, t, 0.01);
  L.INK_(L.quad([cx - 32 * s, cy + 20 * s], [cx, cy + 54 * s], [cx + 32 * s, cy + 20 * s]), { w: 6, amp: 0.2, passes: 1 }, t, 0.01);
  for (const d of [-1, 1]) L.MRK([L.ell(cx + d * 40 * s, cy + 14 * s, 10 * s, 6 * s, 0, L.TAU, 12)], { col: 'rgba(230,120,120,0.45)', w: 6, edge: false }, t, 0.01);
  if (stick) L.INK_(L.line(cx + 6 * s, cy + 74 * s, stick[0], stick[1]), { w: 7, amp: 0.2, passes: 1 }, t, 0.01);
}
function star(L, cx, cy, r, t) { const P = []; for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; P.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } L.FILL(P, t); L.MRK([P], { col: L.YEL, w: 16 }, t, 0.01); L.INK_(P, { closed: true, w: 5, amp: 0.3, passes: 1 }, t, 0.01); }
function trophy(L, cx, y, s, t) {
  const cup0 = L.bez([cx - 60 * s, y - 200 * s], [cx - 60 * s, y - 110 * s], [cx - 20 * s, y - 90 * s], [cx, y - 90 * s]).concat(L.bez([cx, y - 90 * s], [cx + 20 * s, y - 90 * s], [cx + 60 * s, y - 110 * s], [cx + 60 * s, y - 200 * s]));
  L.FILL(cup0, t); L.MRK([cup0], { col: L.YEL, w: 18 }, t, 0.01); L.dropShadow(cup0, 10, 12, t, 0.01); L.INK_(cup0, { closed: true, w: 5, amp: 0.3 }, t, 0.01);
  for (const d of [-1, 1]) L.INK_(L.quad([cx + d * 60 * s, y - 185 * s], [cx + d * 100 * s, y - 170 * s], [cx + d * 55 * s, y - 130 * s]), { w: 5, amp: 0.2, passes: 1 }, t, 0.01);
  L.INK_(L.line(cx, y - 90 * s, cx, y - 40 * s), { w: 6, amp: 0.1, passes: 1 }, t, 0.01);
  const base = L.rrect(cx - 50 * s, y - 40 * s, 100 * s, 40 * s, 6); L.FILL(base, t); L.MRK([base], { col: L.GRY2, w: 14 }, t, 0.01); L.INK_(base, { closed: true, w: 5, amp: 0.2, passes: 1 }, t, 0.01);
}
function stetho(L, P, t) { const [hx, hy, r] = P.head, ny = hy + r * 1.1; L.INK_(L.bez([hx - r * 0.5, ny], [hx - r * 0.6, ny + r * 1.4], [hx + r * 0.6, ny + r * 1.4], [hx + r * 0.5, ny]), { w: 5, amp: 0.2, passes: 1 }, t, 0.01); const c = L.ell(hx + r * 0.3, ny + r * 1.55, r * 0.18, r * 0.18, 0, L.TAU, 14); L.FILL(c, t); L.MRK([c], { col: L.GRY2, w: 8 }, t, 0.01); L.INK_(c, { closed: true, w: 4, amp: 0.1, passes: 1 }, t, 0.01); }
function you(L, x, y, s, t, o = {}) {   // the channel's "you" doodle peeking from behind the smiling mask, worried and sweating
  const P = L.person(x, y, s, t, { pose: 'hold', you: true, kind: 'worry', look: [-0.6, -0.1], hair: 'tuft', k: 0.01, sweat: true });
  const [hx, hy, r] = P.head;
  L.MRK([L.ell(hx, hy, r, r * 1.04, 0, L.TAU, 40)], { col: L.YEL, w: 18 }, t, 0.01);
  L.react(P, t, { kind: 'worry', look: [-0.6, -0.1], sweat: true, k: 0.01 });
  if (o.doc) stetho(L, P, t);
  mask(L, hx + r * 1.25, hy + r * 0.05, r / 62 * 0.85, t, P.hand[1]);
  for (let i = 0; i < 3; i++) L.INK_(L.quad([hx - r * 1.3 - i * 18, hy - r * 1.1 + i * 10], [hx - r * 1.5 - i * 18, hy - r * 0.9 + i * 10], [hx - r * 1.3 - i * 18, hy - r * 0.7 + i * 10]), { w: 4, amp: 0.3, passes: 1 }, t, 0.01);
  return P;
}
def.long = { t: { block: [0, 0, 1600, 900], noAutoCam: true, draw: (S, L) => {
  S.cam(-1, 800, 450, S.W / 1600, 0.01); const t = -1;
  trophy(L, 1380, 860, 1.6, t); star(L, 1380, 600, 56, t);
  L.sparks(1380, 640, 110, 160, [-2.6, -1.9, -1.2, -0.5], t, 0.01);
  you(L, 640, 1130, 3.5, t);
} } };
def.short = { t: { block: [0, 0, 900, 1600], noAutoCam: true, draw: (S, L) => {
  S.cam(-1, 450, 800, S.W / 900, 0.01); const t = -1;
  you(L, 330, 1260, 3.4, t, { doc: true });
  star(L, 760, 420, 50, t);
} } };
export default { long: { scenes: def.long }, short: { scenes: def.short } };
