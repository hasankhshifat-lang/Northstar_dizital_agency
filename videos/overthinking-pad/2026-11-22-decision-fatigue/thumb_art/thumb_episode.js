// Thumbnail art for 2026-11-22 (no text: the headline is live text in Remotion). World 1600x900 (long), 900x1600 (short).
const def = {};
function judge(L, x, y, s, t, o = {}) {   // the hungry judge behind the bench, gavel raised; y = floor of the bench
  const bw = 520 * s, bh = 300 * s, bx = x - bw / 2;
  const P = L.person(x, y - bh * 0.35, 2.4 * s, t, { pose: 'hold', kind: o.kind || 'angry', look: o.look || [0.4, 0.5], hair: 'messy', k: 0.01 });
  const b = [[bx, y], [bx, y - bh], [bx + bw, y - bh], [bx + bw, y]];
  L.FILL(b, t); L.MRK([b], { col: L.GRY, w: 18, ang: 1.1 }, t, 0.01); L.INK_(b, { closed: true, w: 4.5, amp: 0.4 }, t, 0.01);
  L.INK_(L.line(bx - 26 * s, y - bh, bx + bw + 26 * s, y - bh), { w: 7, amp: 0.3, passes: 1 }, t, 0.01);
  L.INK_(L.rrect(bx + bw * 0.2, y - bh * 0.75, bw * 0.6, bh * 0.45, 10), { closed: true, w: 3, amp: 0.3, passes: 1, alpha: 0.7 }, t, 0.01);
  // gavel raised beside the head (hand to handle to head), clear of the face
  const [hx0, hy0, r0] = P.head, gx = hx0 + r0 * 1.9, gy = hy0 - r0 * 0.9;
  L.INK_(L.line(P.hand[1][0], P.hand[1][1], gx - 10 * s, gy + 30 * s), { w: 9 * s, amp: 0.2, passes: 1 }, t, 0.01);
  const hd = L.rrect(gx - 70 * s, gy - 30 * s, 140 * s, 60 * s, 12 * s); L.FILL(hd, t); L.MRK([hd], { col: L.GRYD, w: 14 }, t, 0.01); L.INK_(hd, { closed: true, w: 4, amp: 0.2, passes: 1 }, t, 0.01);
  L.sparks(gx, gy, 95 * s, 145 * s, [-2.2, -1.6, -1.0, -0.4, 0.2], t, 0.01);
  // empty plate + fork on the bench (hunger)
  const px = bx + bw * 0.78, py = y - bh - 14 * s, o1 = L.ell(px, py, 90 * s, 26 * s, 0, L.TAU, 36), o2 = L.ell(px, py, 58 * s, 16 * s, 0, L.TAU, 30);
  L.FILL(o1, t); L.INK_(o1, { closed: true, w: 3.4, amp: 0.3 }, t, 0.01); L.INK_(o2, { closed: true, w: 2.4, amp: 0.2, passes: 1 }, t, 0.01);
  L.INK_(L.line(px + 110 * s, py - 30 * s, px + 110 * s, py + 20 * s), { w: 4, amp: 0.1, passes: 1 }, t, 0.01);
  // stomach growl lines
  const [hx, hy, r] = P.head; for (let i = 0; i < 3; i++) L.INK_(L.quad([hx - r * 1.6 - i * 16, hy - r * 0.6 + i * 34], [hx - r * 1.9 - i * 16, hy - r * 0.4 + i * 34], [hx - r * 1.6 - i * 16, hy - r * 0.2 + i * 34]), { w: 4, amp: 0.3, passes: 1 }, t, 0.01);
  if (o.you) L.MRK([L.ell(hx, hy, r, r * 1.04, 0, L.TAU, 40)], { col: L.YEL, w: 16 }, t, 0.01);
  return P;
}
function saw(L, x, y, w, h, t) {   // the saw-tooth: 3 slides from 65% to ~0, bold yellow highlight under the line
  L.INK_(L.line(x, y, x + w, y), { w: 5, amp: 0.4 }, t, 0.01); L.INK_(L.line(x, y, x, y - h), { w: 5, amp: 0.4 }, t, 0.01);
  const sw = w / 3;
  for (let i = 0; i < 3; i++) { const x0 = x + i * sw + 14, x1 = x + (i + 1) * sw - 30, P = []; for (let q = 0; q <= 20; q++) { const u = q / 20; P.push([x0 + (x1 - x0) * u, y - h * (0.92 - 0.86 * u + 0.03 * Math.sin(q * 1.7 + i))]); }
    L.MST(P, { w: 30, col: L.YEL, amp: 0.6 }, t, 0.01); L.MST(P, { w: 9, col: L.INK, amp: 0.6 }, t, 0.01);
    if (i < 2) L.INK_(L.line(x + (i + 1) * sw - 14, y - 6, x + (i + 1) * sw - 14, y - h * 0.95), { w: 3, amp: 0.4, passes: 1, dash: [10, 10], alpha: 0.6 }, t, 0.01); }
}
def.long = { t: { block: [0, 0, 1600, 900], noAutoCam: true, draw: (S, L) => {
  S.cam(-1, 800, 450, S.W / 1600, 0.01); const t = -1;
  judge(L, 400, 940, 1.2, t, { kind: 'angry', look: [0.5, 0.6] });
  saw(L, 960, 380, 560, 280, t);
} } };
def.short = { t: { block: [0, 0, 900, 1600], noAutoCam: true, draw: (S, L) => {
  S.cam(-1, 450, 800, S.W / 900, 0.01); const t = -1;
  judge(L, 430, 1290, 1.6, t, { kind: 'angry', look: [0.3, 0.6] });
} } };
export default { long: { scenes: def.long }, short: { scenes: def.short } };
