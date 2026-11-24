// Thumbnail art for 2026-11-24 (the only lettering is "ok." on the phone, the object itself; the headline is live text in Remotion). World 1600x900 (long), 900x1600 (short).
const def = {};
function phone(L, cx, cy, s, t) {   // a big phone with the "ok." reply, the period ringed in yellow
  const w = 300 * s, h = 560 * s, b = L.rrect(cx - w / 2, cy - h / 2, w, h, 40 * s), sx = cx - w / 2 + 18 * s, sy = cy - h / 2 + 50 * s, sw = w - 36 * s, shh = h - 110 * s;
  L.FILL(b, t); L.MRK([b], { col: L.GRY2, w: 18 }, t, 0.01); L.dropShadow(b, 14 * s, 16 * s, t, 0.01); L.INK_(b, { closed: true, w: 5, amp: 0.5 }, t, 0.01);
  const sp = L.rrect(sx, sy, sw, shh, 12 * s); L.FILL(sp, t); L.INK_(sp, { closed: true, w: 3, amp: 0.3, passes: 1 }, t, 0.01);
  L.INK_(L.line(cx - 30 * s, cy - h / 2 + 26 * s, cx + 30 * s, cy - h / 2 + 26 * s), { w: 4, amp: 0.1, passes: 1 }, t, 0.01);
  const mine = L.rrect(sx + sw - 200 * s, sy + 30 * s, 185 * s, 150 * s, 22 * s); L.FILL(mine, t); L.MRK([mine], { col: 'rgba(255,205,40,0.55)', w: 16, edge: false }, t, 0.01); L.INK_(mine, { closed: true, w: 3, amp: 0.4, passes: 1 }, t, 0.01);
  for (let i = 0; i < 5; i++) L.INK_(L.line(sx + sw - 185 * s, sy + 55 * s + i * 24 * s, sx + sw - 30 * s - (i === 4 ? 60 * s : 0), sy + 55 * s + i * 24 * s), { w: 3, amp: 0.5, passes: 1, alpha: 0.7 }, t, 0.01);
  const r = L.rrect(sx + 14 * s, sy + 220 * s, 175 * s, 90 * s, 24 * s); L.FILL(r, t); L.MRK([r], { col: L.GRY, w: 16, edge: false }, t, 0.01); L.INK_(r, { closed: true, w: 4, amp: 0.4, passes: 1 }, t, 0.01);
  L.TXT('ok', sx + 80 * s, sy + 285 * s, 70 * s, { f: 'KB', align: 'center' }, t, 0.01);
  const dx = sx + 150 * s, dy = sy + 280 * s; L.MRK([L.ell(dx, dy, 9 * s, 9 * s, 0, L.TAU, 16)], { col: L.INKM(0.95), w: 10, edge: false, op: 'source-over' }, t, 0.01);
  L.MST(L.ell(dx, dy - 2 * s, 24 * s, 24 * s, -0.4, L.TAU + 0.5, 50), { w: 8, col: L.YELD, amp: 1 }, t, 0.01);
  for (const sd of [-1, 1]) for (let i = 0; i < 2; i++) L.INK_(L.ell(cx, cy, w / 2 + 30 * s + i * 30 * s, h / 2 + i * 34 * s, sd < 0 ? Math.PI * 0.88 : -Math.PI * 0.12, sd < 0 ? Math.PI * 1.12 : Math.PI * 0.12, 10), { w: 5, amp: 0.2, passes: 1 }, t, 0.01);
  return { left: [cx - w / 2, cy + h * 0.25] };
}
function worried(L, x, y, s, t, reach) {   // the channel's "you" doodle: worried, sweating, eyes on the phone, one hand on its edge
  const P = L.person(x, y, s, t, { pose: 'stand', you: true, kind: 'worry', look: [1, -0.4], hair: 'tuft', k: 0.01, sweat: true, reach2: reach });
  const [hx, hy, r] = P.head;
  L.MRK([L.ell(hx, hy, r, r * 1.04, 0, L.TAU, 40)], { col: L.YEL, w: 18 }, t, 0.01);
  L.react(P, t, { kind: 'worry', look: [1, -0.4], sweat: true, k: 0.01 });
  for (let i = 0; i < 3; i++) L.INK_(L.quad([hx - r * 1.3 - i * 18, hy - r * 1.1 + i * 10], [hx - r * 1.5 - i * 18, hy - r * 0.9 + i * 10], [hx - r * 1.3 - i * 18, hy - r * 0.7 + i * 10]), { w: 4, amp: 0.3, passes: 1 }, t, 0.01);
  return P;
}
def.long = { t: { block: [0, 0, 1600, 900], noAutoCam: true, draw: (S, L) => {
  S.cam(-1, 800, 450, S.W / 1600, 0.01); const t = -1;
  const Ph = phone(L, 1180, 470, 1.18, t);
  worried(L, 560, 1180, 3.6, t, Ph.left);
} } };
def.short = { t: { block: [0, 0, 900, 1600], noAutoCam: true, draw: (S, L) => {
  S.cam(-1, 450, 800, S.W / 900, 0.01); const t = -1;
  const Ph = phone(L, 540, 640, 1.2, t);
  worried(L, 230, 1500, 3.0, t, Ph.left);
} } };
export default { long: { scenes: def.long }, short: { scenes: def.short } };
