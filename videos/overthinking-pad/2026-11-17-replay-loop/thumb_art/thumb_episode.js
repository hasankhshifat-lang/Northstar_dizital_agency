// Thumbnail art for 2026-11-17 (no text: the headline is live text in Remotion). World 1600x900 (long), 900x1600 (short).
const def = {};
function memory(L, x, y, w, h, s, t, angry) {
  const b = L.rrect(x, y, w, h, 18); L.FILL(b, t); L.MRK([b], { col: 'rgba(255,205,40,0.22)', w: 20, edge: false }, t, 0.01); L.INK_(b, { closed: true, w: 4.5, amp: 1 }, t, 0.01);
  const c = L.ell(x + 40, y + 38, 15, 15, 0, L.TAU, 16); L.MRK([c], { col: L.YELD, w: 10, edge: false }, t, 0.01);
  const fy = y + h - 30;
  if (angry) {
    const A = L.person(x + w * 0.38, fy, s, t, { pose: 'arms_up', you: true, kind: 'angry', look: [1, 0], k: 0.01 });
    L.person(x + w * 0.66, fy, s, t, { pose: 'shrug', kind: 'neutral', look: [-1, 0], hair: 'cap', k: 0.01, dir: -1 });
    const [hx, hy, r] = A.head; const P = []; for (let i = 0; i <= 72; i++) { const a = i / 72 * L.TAU, bm = 1 + 0.12 * Math.abs(Math.sin(a * 4.5)); P.push([hx + Math.cos(a) * r * 1.4 * bm, hy - r * 2.3 + Math.sin(a) * r * 0.62 * bm]); }
    L.FILL(P, t); L.MRK([P], { col: L.GRY2, w: 16 }, t, 0.01); L.INK_(P, { closed: true, w: 3, amp: 0.8 }, t, 0.01);
  } else {
    const A = L.person(x + w * 0.4, fy, s, t, { pose: 'wave', you: true, kind: 'grin', look: [1, 0], k: 0.01 });
    const B = L.person(x + w * 0.66, fy, s, t, { pose: 'hold', kind: 'shock', look: [-1, 0], hair: 'long', k: 0.01 });
    L.cup(B.hand[1][0], B.hand[1][1] - 14 * s, 0.45 * s, t);
    L.bubble(x + w * 0.4 - 70 * s, fy - 335 * s, 150 * s, 66 * s, t, { shadow: false, k: 0.01 });
    for (let i = -1; i <= 1; i++) { const d = L.ell(x + w * 0.4 + 5 * s + i * 30 * s, fy - 302 * s, 7 * s, 7 * s, 0, L.TAU, 12); L.MRK([d], { col: L.INKM(0.9), w: 6, edge: false, op: 'source-over' }, t, 0.01); } L.INK_([[x + w * 0.4 - 10 * s, fy - 269 * s], [x + w * 0.4, fy - 225 * s], [x + w * 0.4 + 14 * s, fy - 269 * s]], { w: 3, amp: 0.3, passes: 1 }, t, 0.01);
  }
}
def.long = { t: { block: [0, 0, 1600, 900], noAutoCam: true, draw: (S, L) => {
  S.cam(-1, 800, 450, S.W / 1600, 0.01); const t = -1;
  // the sleeper: big face on the pillow, blanket up to the chin
  const hx = 360, hy = 600, r = 190;
  const pil = L.ell(hx - 30, hy + 150, 330, 90, 0, L.TAU, 50); L.FILL(pil, t); L.INK_(pil, { closed: true, w: 4, amp: 0.6 }, t, 0.01);
  L.head(hx, hy, r, t, { hair: 'tuft', kind: 'shock', look: [0.7, -0.9], k: 0.01, sweat: true, you: true });
  const bl = L.bez([60, 900], [120, 760], [420, 740], [700, 790]).concat(L.bez([700, 790], [900, 830], [1100, 840], [1300, 900]));
  L.FILL(bl, t); L.MRK([bl], { col: L.YEL, w: 20 }, t, 0.01); L.INK_(bl, { w: 4, amp: 0.8 }, t, 0.01);
  L.INK_([[520, 860], [560, 800], [600, 770]], { w: 2.4, amp: 0.5, passes: 1, alpha: 0.6 }, t, 0.01);
  for (let i = 0; i < 3; i++) L.INK_(L.line(hx - r - 40 - i * 6, hy - 120 + i * 50, hx - r - 100 - i * 6, hy - 140 + i * 50), { w: 4, amp: 0.3, passes: 1 }, t, 0.01);
  // projector beam from the head to the screen
  L.MRK([[[hx + 120, hy - 140], [800, 400], [1520, 400]]], { col: 'rgba(255,205,40,0.45)', w: 26, ang: 1.2, edge: false }, t, 0.01);
  memory(L, 760, 40, 780, 380, 1.0, t, false);
} } };
def.short = { t: { block: [0, 0, 900, 1600], noAutoCam: true, draw: (S, L) => {
  S.cam(-1, 450, 800, S.W / 900, 0.01); const t = -1;
  memory(L, 90, 300, 720, 370, 0.85, t, true);
  const hx = 450, hy = 905, r = 150;
  L.MRK([[[hx - 60, hy - 130], [110, 670], [790, 670], [hx + 60, hy - 130]]], { col: 'rgba(255,205,40,0.4)', w: 26, ang: 1.2, edge: false }, t, 0.01);
  const sb = L.rrect(hx - 210, hy + 40, 420, 210, 36); L.FILL(sb, t); L.MRK([sb], { col: L.GRY2, w: 16 }, t, 0.01); L.INK_(sb, { closed: true, w: 4, amp: 0.5 }, t, 0.01);
  L.head(hx, hy, r, t, { hair: 'tuft', kind: 'angry', look: [0, -1], k: 0.01, you: true });
} } };
export default { long: { scenes: def.long }, short: { scenes: def.short } };
