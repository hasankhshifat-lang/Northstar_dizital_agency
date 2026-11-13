import React from "react";
import { interpolate, Easing } from "remotion";
import { Ground, Hills, Person, Sky, Cabin, CLERK, KEEPER, WORKER } from "./ponyScenes";
import { Label } from "./chickenScenes";
import { Lying } from "./glassScenes";
import { KitColors } from "../kit/Kit";

/** Ground scenes for "The Night the Mississippi Ran Backward" (New Madrid, 1811–12). lt = seconds since the scene started. */
const INK = "#2b1d14";
const GY = 1240;
const cl = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
type SP = { lt: number; dur: number; frame: number };

// ---------- characters ----------
export const BOATMAN: Partial<KitColors> = { coat: "#4d5f7a", coatShade: "#394860", coatLight: "#5d7190", patch: "#5d7190", scarf: "#c23b2c", hair: "#3a2a1e", cap: "#5a4a3a", capShade: "#43372b" };
export const SETTLER: Partial<KitColors> = { coat: "#9a3b4a", coatShade: "#7a2c39", coatLight: "#b04a5a", patch: "#b04a5a", scarf: "#efe1b8", scarfShade: "#cfc19a", hair: "#6a3a1e", cap: "#6a5a48" };
const CHILD: Partial<KitColors> = { coat: "#c9a227", coatShade: "#9b7c18", coatLight: "#dbb440", patch: "#dbb440", hair: "#8a5a2a" };
const FARMER = KEEPER;
const SLEEPER: Partial<KitColors> = { coat: "#efe8d6", coatShade: "#d0c6ae", coatLight: "#fff8e8", patch: "#d0c6ae", scarf: "#efe8d6", cap: "#efe8d6", capShade: "#d8d0bc", capBand: "#c8bea8" };

/** World position of a Kit hand (side pose) for a given arm angle; matches the rig (shoulder pivot (0,-284), hand (2,-146)). */
export function handAt(x: number, y: number, s: number, facing: 1 | -1, angle: number, lean = 0): [number, number] {
  const a = (angle * Math.PI) / 180;
  const hx = 2 * Math.cos(a) - 138 * Math.sin(a), hy = -284 + 2 * Math.sin(a) + 138 * Math.cos(a);
  const px = hx * facing, py = hy, l = (lean * Math.PI) / 180;
  return [x + s * (px * Math.cos(l) - py * Math.sin(l)), y + s * (px * Math.sin(l) + py * Math.cos(l))];
}

// ---------- river pieces ----------
/** current speed (px/s, + = downstream to the right) around a reversal starting at u = 0 */
const vAt = (u: number) => (u < 0 ? 50 : u > 1.2 ? -140 : 50 - 190 * Easing.inOut(Easing.cubic)(u / 1.2));
/** distance travelled by the water from u0 to u (numerical integral) */
function flowDist(u0: number, u: number) {
  const n = Math.max(1, Math.ceil(Math.abs(u - u0) * 40)), h = (u - u0) / n;
  let d = 0;
  for (let i = 0; i < n; i++) d += vAt(u0 + (i + 0.5) * h) * h;
  return d;
}
const Ripples: React.FC<{ y0: number; y1: number; off: number; color?: string; rows?: number }> = ({ y0, y1, off, color = "#d8f0ee", rows = 7 }) => (
  <g>
    {Array.from({ length: rows * 6 }, (_, i) => {
      const r = i % rows, y = y0 + ((r + 0.5) / rows) * (y1 - y0), sp = 0.6 + 0.4 * (r / rows);
      const x = (((rnd(i) * 1300 + off * sp) % 1300) + 1300) % 1300 - 110;
      return <path key={i} d={`M ${x} ${y} q 30 -10 60 0`} stroke={color} strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.75} />;
    })}
  </g>
);
/** big flow chevrons; dir from -1 (upstream, left) to +1 (downstream, right) */
const Chevrons: React.FC<{ y: number; dir: number; color?: string; xs?: number[] }> = ({ y, dir, color = "#fff", xs = [260, 540, 820] }) => (
  <g opacity={0.85}>
    {xs.map((x, i) => (
      <g key={i} transform={`translate(${x} ${y}) scale(${dir} 1)`}>
        <path d="M -40 -46 L 30 0 L -40 46" fill="none" stroke="#000" strokeOpacity={0.35} strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M -40 -46 L 30 0 L -40 46" fill="none" stroke={color} strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    ))}
  </g>
);
const TreeLine: React.FC<{ y: number; color: string; seed?: number }> = ({ y, color, seed = 1 }) => (
  <g>
    {Array.from({ length: 14 }, (_, i) => <ellipse key={i} cx={i * 85 - 20 + rnd(i + seed) * 30} cy={y - 40 - rnd(i * 3 + seed) * 50} rx={70} ry={80 + rnd(i + 7 * seed) * 40} fill={color} />)}
    <rect x={0} y={y - 40} width={1080} height={60} fill={color} />
  </g>
);
/** A flatboat (keelboat-era cargo raft with a cabin). Origin = deck centre. */
export const Flatboat: React.FC<{ x: number; y: number; s?: number; rot?: number; children?: React.ReactNode; cabin?: boolean }> = ({ x, y, s = 1, rot = 0, children, cabin = true }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -300 0 L 300 0 L 270 70 L -270 70 Z" fill="#7a4e2a" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    {[0, 1, 2].map((i) => <line key={i} x1={-285 + i * 4} x2={285 - i * 4} y1={18 + i * 18} y2={18 + i * 18} stroke="#5a3a1e" strokeWidth={4} />)}
    {cabin && <g>
      <rect x={60} y={-150} width={210} height={150} fill="#8e6236" stroke={INK} strokeWidth={6} />
      <path d="M 45 -150 Q 165 -205 285 -150 Z" fill="#6a4524" stroke={INK} strokeWidth={6} />
      <rect x={130} y={-100} width={60} height={50} fill="#3a2618" stroke={INK} strokeWidth={4} />
      {[0, 1].map((i) => <rect key={i} x={-200 + i * 110} y={-62} width={84} height={62} rx={6} fill="#a07a48" stroke={INK} strokeWidth={5} />)}
    </g>}
    {children}
  </g>
);

// ---------- 1 + 17: HOOK / LOOP — night river, the current reverses under a flatboat ----------
/** u0 = reversal phase at lt = 0 (hook: 0.6 = already reversing at frame 0; loop: ends at 0.6 so it cuts back into frame 0). */
export const SceneRiverNight: React.FC<SP & { u0: number }> = ({ lt, frame, u0 }) => {
  const u = u0 + lt;
  const v = vAt(u);
  const off = flowDist(0.6, u);
  const shakeA = u > -0.4 && u < 3.5 ? interpolate(u, [-0.4, 0, 2.2, 3.5], [0, 1, 1, 0.3], cl) : 0;
  const sx = Math.sin(frame * 1.9) * 9 * shakeA, sy = Math.cos(frame * 2.3) * 6 * shakeA;
  const bx = 520 + 0.45 * off, by = GY + 40 + Math.sin(frame * 0.18) * 6;
  const brot = Math.sin(frame * 0.35) * 2.5 * shakeA + Math.sin(frame * 0.1) * 1;
  const scared = u > 0.15;
  const lean = scared ? -6 : 0;
  // poling stance: near hand low, far hand high; pole runs through both hands to the riverbed behind him
  const pxB = -60, pyB = 0, s = 0.8, A1 = -30, A2 = -100;
  const h1 = handAt(pxB, pyB, s, 1, A1, lean), h2 = handAt(pxB, pyB, s, 1, A2, lean);
  const dx = h2[0] - h1[0], dy = h2[1] - h1[1], L = Math.hypot(dx, dy);
  const ux = dx / L, uy = dy / L;
  const top: [number, number] = [h2[0] + ux * 70, h2[1] + uy * 70], tip: [number, number] = [h1[0] - ux * 420, h1[1] - uy * 420];
  return (
    <g transform={`translate(${sx} ${sy})`}>
      <Sky top="#0e1630" bottom="#2c3a66" stars moon />
      <TreeLine y={GY - 150} color="#16241e" seed={2} />
      <rect x={-40} y={GY - 130} width={1160} height={1300} fill="#21465a" />
      <rect x={-40} y={GY - 130} width={1160} height={60} fill="#3d6f86" opacity={0.5} />
      <Ripples y0={GY - 110} y1={GY + 330} off={off} color="#9fc8d8" />
      <Chevrons y={GY + 230} dir={Math.max(-1, Math.min(1, v / 50))} color={v < 0 ? "#ffd23f" : "#e8f4f4"} />
      <Flatboat x={bx} y={by} s={0.8} rot={brot}>
        <path d={`M ${tip[0]} ${tip[1]} L ${top[0]} ${top[1]}`} stroke="#6a4528" strokeWidth={11} strokeLinecap="round" />
        <Person x={pxB} y={pyB} s={s} kit={{ pose: "side", facing: 1, colors: BOATMAN, expression: scared ? "scared" : "determined", armAngle: A1, farArmAngle: A2, lean }} />
      </Flatboat>
      {/* splash where the pole enters the water */}
      <ellipse cx={bx + tip[0] * 0.8} cy={GY - 20} rx={30} ry={8} fill="#cfe8f0" opacity={0.6} />
    </g>
  );
};

// ---------- 4: the frontier town on the riverbank ----------
const CHOP_P = 1.1;
export const CHOP_TIMES = [0, 1, 2].map((i) => i * CHOP_P + 0.385);
const Axe: React.FC<{ hand: [number, number]; angle: number; facing: 1 | -1 }> = ({ hand, angle, facing }) => {
  const a = (angle * Math.PI) / 180, dx = -Math.sin(a) * facing, dy = Math.cos(a);
  const end: [number, number] = [hand[0] + dx * 120, hand[1] + dy * 120];
  const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
  return (
    <g>
      <path d={`M ${hand[0] - dx * 20} ${hand[1] - dy * 20} L ${end[0]} ${end[1]}`} stroke="#8a5a2a" strokeWidth={10} strokeLinecap="round" />
      <g transform={`translate(${end[0]} ${end[1]}) rotate(${deg})`}><path d="M -10 -6 L 18 -26 L 26 22 L -10 8 Z" fill="#a8aeb4" stroke={INK} strokeWidth={4} strokeLinejoin="round" /></g>
    </g>
  );
};
export const SceneTown: React.FC<SP> = ({ lt, frame }) => {
  // woodcutter (faces left), swing: raise slowly, strike fast; contact at p = 0.35
  const p = (lt % CHOP_P) / CHOP_P;
  const ang = p < 0.35 ? -170 + 100 * Easing.in(Easing.quad)(p / 0.35) : -70 - 100 * Easing.inOut(Easing.cubic)(Math.min(1, (p - 0.35) / 0.6));
  const wx = 860, wy = GY + 150, ws = 0.85;
  const wh = handAt(wx, wy, ws, -1, ang);
  const down = handAt(wx, wy, ws, -1, -70);
  const a70 = (-70 * Math.PI) / 180, logX = down[0] - Math.sin(a70) * -1 * 120, logY = down[1] + Math.cos(a70) * 120 + 18;
  const sinceChop = (() => { const k = lt - CHOP_TIMES.filter((c) => c <= lt).slice(-1)[0]; return isNaN(k) ? 9 : k; })();
  // settler walks up from the river with a bucket
  const sx = 120 + lt * 110, sy = GY + 170, ss = 0.78;
  const bh = handAt(sx, sy, ss, 1, 6);
  return (
    <g>
      <Sky top="#8fc4e0" bottom="#f7ecc8" sun={{ x: 220, y: 480, r: 70, color: "#fff4c4" }} clouds={3} drift={frame * 0.4} />
      <rect x={0} y={GY - 260} width={1080} height={120} fill="#5f97a6" />
      <Ripples y0={GY - 250} y1={GY - 150} off={frame * 1.2} rows={3} />
      <Flatboat x={160} y={GY - 205} s={0.35} />
      <Hills y={GY - 120} color="#b8a070" amp={8} seed={3} />
      <Cabin x={300} y={GY - 20} s={0.62} />
      <Cabin x={720} y={GY - 40} s={0.7} />
      {[0, 1].map((i) => <circle key={i} cx={[300 + 103, 720 + 116][i] + Math.sin(frame * 0.05 + i) * 10} cy={[GY - 300, GY - 345][i] - ((frame * 1.5 + i * 40) % 80)} r={18 + ((frame * 1.5 + i * 40) % 80) * 0.25} fill="#e8e2d8" opacity={0.6 - ((frame * 1.5 + i * 40) % 80) / 160} />)}
      <Ground color="#b8a46a" tuft="#8a7a3a" kind="street" />
      {/* chopping block + log */}
      <rect x={logX - 50} y={logY + 30} width={100} height={wy - logY - 30} fill="#7a5230" stroke={INK} strokeWidth={5} />
      <ellipse cx={logX} cy={logY + 30} rx={50} ry={12} fill="#c8a070" stroke={INK} strokeWidth={4} />
      <rect x={logX - 26} y={logY - 6} width={52} height={36} rx={6} fill="#9a6a3a" stroke={INK} strokeWidth={4} />
      {sinceChop < 0.35 && [0, 1, 2, 3].map((i) => <rect key={i} x={logX + (rnd(i) - 0.5) * 160 * (sinceChop / 0.35) * 2} y={logY - 20 - 90 * Math.sin(Math.PI * (sinceChop / 0.35)) * (0.5 + rnd(i + 3))} width={14} height={8} fill="#e0b880" stroke={INK} strokeWidth={2} />)}
      <Person x={wx} y={wy} s={ws} kit={{ pose: "side", facing: -1, colors: WORKER, expression: "determined", armAngle: ang, farArmAngle: ang }} />
      <Axe hand={wh} angle={ang} facing={-1} />
      <Person x={sx} y={sy} s={ss} kit={{ pose: "side", walking: true, facing: 1, colors: SETTLER, expression: "neutral", armAngle: 6 }} />
      <g transform={`translate(${bh[0]} ${bh[1]})`}><path d="M -26 6 L 26 6 L 20 62 L -20 62 Z" fill="#8a6a40" stroke={INK} strokeWidth={4} /><path d="M -24 8 Q 0 -22 24 8" fill="none" stroke={INK} strokeWidth={4} /><ellipse cx={0} cy={8} rx={24} ry={6} fill="#5f97a6" /></g>
      <Label x={540} y={GY - 560} lt={lt} at={0.2} text="NEW MADRID" size={56} />
      <Label x={540} y={GY - 470} lt={lt} at={1.3} text="FRONTIER TOWN" size={40} bg="#fff3c4" fg="#1d1712" stroke="#000" />
    </g>
  );
};

// ---------- 5: two months of shaking — he braces the cupboard ----------
export const PLATE_FALL = 2.35;
export const SceneShaking: React.FC<SP> = ({ lt, frame }) => {
  const sh = Math.sin(frame * 2.1) * 7 + Math.sin(frame * 3.7) * 4;
  const arrive = interpolate(lt, [0, 0.8], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  const mx = 170 + 210 * arrive, my = GY + 150, ms = 1.0;
  const reach = interpolate(lt, [0.45, 0.85], [0, 1], cl);
  const A1 = -125 * reach, A2 = -128 * reach;
  const braced = lt > 0.85;
  const rock = (braced ? 0.6 : 2.5) * Math.sin(frame * 1.3);
  const plateK = interpolate(lt, [PLATE_FALL - 0.4, PLATE_FALL], [0, 1], cl);
  const broken = lt >= PLATE_FALL;
  const potSwing = Math.sin(frame * 0.32) * 18;
  return (
    <g transform={`translate(${sh} ${sh * 0.4})`}>
      {/* log wall + floor */}
      <rect x={-40} y={0} width={1160} height={GY + 160} fill="#8a5a32" />
      {Array.from({ length: 18 }, (_, i) => <line key={i} x1={-40} x2={1120} y1={i * 78} y2={i * 78} stroke="#5e3b20" strokeWidth={8} />)}
      <rect x={-40} y={GY + 150} width={1160} height={1300} fill="#6a4a2a" />
      {Array.from({ length: 8 }, (_, i) => <line key={i} x1={i * 150} x2={i * 150 - 60} y1={GY + 150} y2={GY + 1000} stroke="#4a3018" strokeWidth={5} />)}
      {/* window with night outside */}
      <rect x={120} y={GY - 640} width={200} height={170} fill="#1e2a4a" stroke={INK} strokeWidth={8} />
      <path d={`M 220 ${GY - 640} L 220 ${GY - 470} M 120 ${GY - 555} L 320 ${GY - 555}`} stroke={INK} strokeWidth={6} />
      {/* hanging pot */}
      <g transform={`translate(330 ${GY - 760}) rotate(${potSwing})`}>
        <line x1={0} y1={0} x2={0} y2={170} stroke={INK} strokeWidth={5} />
        <path d="M -50 170 L 50 170 L 40 240 Q 0 260 -40 240 Z" fill="#2e2e30" stroke={INK} strokeWidth={5} />
      </g>
      {/* cupboard, rocking on its right foot until he braces it */}
      <g transform={`rotate(${rock} 760 ${GY + 150})`}>
        <rect x={490} y={GY - 430} width={270} height={580} fill="#9a6a3a" stroke={INK} strokeWidth={7} />
        <rect x={505} y={GY - 50} width={240} height={180} fill="#7a5230" stroke={INK} strokeWidth={5} />
        {[GY - 290, GY - 150].map((y, i) => <rect key={i} x={490} y={y} width={270} height={14} fill="#7a5230" stroke={INK} strokeWidth={4} />)}
        {[0, 1, 2].map((i) => <g key={i} transform={`translate(${540 + i * 85} ${GY - 290 - 50}) rotate(${Math.sin(frame * 2.7 + i) * 6})`}><ellipse cx={0} cy={0} rx={36} ry={50} fill="#efe8d6" stroke={INK} strokeWidth={5} /><ellipse cx={0} cy={0} rx={20} ry={30} fill="none" stroke="#6a8ab0" strokeWidth={4} /></g>)}
        {[0, 1].map((i) => <rect key={i} x={540 + i * 110} y={GY - 230} width={50} height={80} rx={8} fill="#5a7a5a" stroke={INK} strokeWidth={4} />)}
        {/* plate on the top shelf edge that slides off */}
        {!broken && <g transform={`translate(${720 + plateK * 90} ${GY - 445 + plateK * plateK * 595}) rotate(${plateK * 160})`}><ellipse cx={0} cy={0} rx={34} ry={12} fill="#efe8d6" stroke={INK} strokeWidth={5} /></g>}
      </g>
      {broken && [0, 1, 2, 3].map((i) => <path key={i} d="M 0 0 L 22 -6 L 14 10 Z" transform={`translate(${790 + (i - 1.5) * 34 * Math.min(1, (lt - PLATE_FALL) * 5)} ${GY + 145}) rotate(${i * 70})`} fill="#efe8d6" stroke={INK} strokeWidth={3} />)}
      {/* candle on a stool */}
      <rect x={880} y={GY - 10} width={110} height={160} fill="#7a5230" stroke={INK} strokeWidth={5} />
      <rect x={923} y={GY - 70} width={24} height={60} fill="#f2ead2" stroke={INK} strokeWidth={3} />
      <path d={`M 935 ${GY - 70} q ${-10 + Math.sin(frame * 0.9) * 6} -30 0 -46 q ${10 + Math.sin(frame * 0.7) * 6} 16 0 46 Z`} fill="#ffcf7a" />
      <Person x={mx} y={my} s={ms} kit={{ pose: "side", walking: lt < 0.8, facing: 1, colors: CLERK, expression: "scared", armAngle: lt < 0.45 ? undefined : A1, farArmAngle: lt < 0.45 ? undefined : A2 }} />
      <Label x={540} y={220} lt={lt} at={0.5} text="2 MONTHS" size={60} />
      <Label x={540} y={320} lt={lt} at={1.4} text="STILL SHAKING" size={46} bg="#fff3c4" fg="#1d1712" stroke="#000" />
    </g>
  );
};

// ---------- 8: cutaway — the riverbed lifts along the fault ----------
export const SceneUplift: React.FC<SP> = ({ lt, frame }) => {
  const k = interpolate(lt, [0.3, 1.6], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
  const up = k * 120, FX = 600, top = GY - 260;
  const shake = k > 0 && k < 1 ? Math.sin(frame * 2.4) * 5 : 0;
  const wl = top + 40, wr = top + 40 - up * 0.75; // water surface, left/right
  return (
    <g transform={`translate(${shake} 0)`}>
      <Sky top="#1a2448" bottom="#4a5a8a" stars />
      <rect x={0} y={top - 120} width={1080} height={120} fill="#2e4a2e" />
      {/* left block (stays) */}
      <g>
        <path d={`M -10 ${top - 120} L 200 ${top - 120} L 260 ${top + 180} L ${FX - 40} ${top + 180} L ${FX} ${top + 1200} L -10 ${top + 1200} Z`} fill="#7a5a3a" stroke={INK} strokeWidth={6} />
        {[1, 2, 3].map((i) => <path key={i} d={`M -10 ${top + 200 + i * 180} L ${FX + 10 - (3 - i) * 5} ${top + 200 + i * 180}`} stroke="#5a4028" strokeWidth={6} strokeDasharray="30 18" />)}
      </g>
      {/* right block (pushed up) */}
      <g transform={`translate(0 ${-up})`}>
        <path d={`M ${FX - 40} ${top + 180} L 820 ${top + 180} L 880 ${top - 120} L 1090 ${top - 120} L 1090 ${top + 1400} L ${FX + 40} ${top + 1400} Z`} fill="#8a6a44" stroke={INK} strokeWidth={6} />
        {[1, 2, 3].map((i) => <path key={i} d={`M ${FX + 30} ${top + 200 + i * 180} L 1090 ${top + 200 + i * 180}`} stroke="#6a4c2e" strokeWidth={6} strokeDasharray="30 18" />)}
        <rect x={880} y={top - 160} width={210} height={40} fill="#2e4a2e" />
      </g>
      {/* water in the channel */}
      <path d={`M 200 ${wl} L 880 ${wr} L 820 ${top + 180 - up} L ${FX - 40} ${top + 180 - up * (k > 0 ? 1 : 0)} L 260 ${top + 180} Z`} fill="#3d7f96" opacity={0.92} />
      <path d={`M 200 ${wl} L 880 ${wr}`} stroke="#bfe6ee" strokeWidth={6} />
      {/* fault line */}
      <path d={`M ${FX - 40} ${top + 180} L ${FX + 40} ${top + 1300}`} stroke="#d32f2f" strokeWidth={10} strokeDasharray="34 20" />
      <Flatboat x={420} y={wl + (wr - wl) * (220 / 680) - 6} s={0.3} rot={-((Math.atan2(wr - wl, 680) * 180) / Math.PI) * -1 + Math.sin(frame * 0.4) * 3 * k} />
      {k > 0.05 && <g transform={`translate(860 ${top + 560 - up}) scale(${Math.min(1, k * 2)})`}><path d="M 0 60 L 0 -60 M -36 -24 L 0 -64 L 36 -24" stroke="#ffd23f" strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>}
      {k > 0.5 && <Chevrons y={wl - 70} dir={-1} color="#ffd23f" xs={[380, 620]} />}
      <Label x={330} y={top + 700} lt={lt} at={0.2} text="FAULT" size={44} />
      <Label x={540} y={220} lt={lt} at={1.0} text="GROUND LIFTS UP" size={54} />
    </g>
  );
};

// ---------- 9: water-level shot — the current turns around ----------
export const SceneReverse: React.FC<SP> = ({ lt, frame }) => {
  const u = lt - 0.25;
  const off = flowDist(-1, u) * 1.5;
  const v = vAt(u);
  const logX = 640 + flowDist(-1, u) * 0.9 - flowDist(-1, -0.25) * 0.9;
  return (
    <g>
      <Sky top="#2a3866" bottom="#d89a6a" />
      <TreeLine y={GY - 330} color="#24352a" seed={5} />
      <rect x={-20} y={GY - 360} width={1120} height={1300} fill="#2f6478" />
      <Ripples y0={GY - 340} y1={GY + 300} off={off} rows={9} />
      <g transform={`translate(${logX} ${GY - 80 + Math.sin(frame * 0.2) * 6}) rotate(${Math.sin(frame * 0.1) * 4 + (v < 0 ? 8 : 0)})`}>
        <rect x={-200} y={-30} width={400} height={60} rx={30} fill="#7a5230" stroke={INK} strokeWidth={6} />
        <ellipse cx={200} cy={0} rx={18} ry={30} fill="#c8a070" stroke={INK} strokeWidth={5} />
        <path d="M -80 -30 L -110 -80 M -30 -30 L 0 -70" stroke="#5a3a1e" strokeWidth={8} strokeLinecap="round" />
      </g>
      {[0, 1, 2, 3, 4].map((i) => <ellipse key={i} cx={(((rnd(i) * 1080 + off * 1.1) % 1180) + 1180) % 1180 - 50} cy={GY + 60 + i * 50} rx={16} ry={8} fill="#8aa83a" stroke={INK} strokeWidth={2} />)}
      <Chevrons y={GY + 140} dir={Math.max(-1, Math.min(1, v / 50))} color={v < 0 ? "#ffd23f" : "#e8f4f4"} />
      <Label x={540} y={220} lt={lt} at={0.5} text="CURRENT TURNS AROUND" size={46} />
    </g>
  );
};

// ---------- 10: a wave throws a flatboat onto the bank ----------
export const BOAT_LAND = 1.45;
export const SceneBoats: React.FC<SP> = ({ lt, frame }) => {
  const k = interpolate(lt, [0.5, BOAT_LAND], [0, 1], { ...cl, easing: Easing.in(Easing.quad) });
  const wave = interpolate(lt, [0, 1.3], [-300, 1300], cl);
  const bx = 470 + k * 360, by = GY - 10 - Math.sin(Math.PI * Math.min(1, k)) * 260 - k * 40, rot = -10 * Math.sin(Math.PI * k) + k * 12;
  const thud = lt > BOAT_LAND && lt < BOAT_LAND + 0.35 ? Math.sin(frame * 3) * 10 * (1 - (lt - BOAT_LAND) / 0.35) : 0;
  // boatman clings to the cabin rail: hands at -90 land on the rail top
  const ps = 0.62, pX = -10, pY = 0;
  const hand = handAt(pX, pY, ps, 1, -88);
  return (
    <g transform={`translate(0 ${thud})`}>
      <Sky top="#2a3866" bottom="#c88a6a" />
      <TreeLine y={GY - 260} color="#24352a" seed={8} />
      <rect x={-20} y={GY - 270} width={1120} height={1300} fill="#2f6478" />
      <Ripples y0={GY - 250} y1={GY + 300} off={-frame * 4} rows={6} />
      {/* near bank on the right */}
      <path d={`M 640 ${GY + 1000} L 700 ${GY + 10} Q 820 ${GY - 60} 1100 ${GY - 70} L 1100 ${GY + 1000} Z`} fill="#6a5034" stroke={INK} strokeWidth={6} />
      {/* wave crest */}
      <path d={`M ${wave - 420} ${GY + 80} Q ${wave - 200} ${GY + 70} ${wave - 60} ${GY - 160} Q ${wave + 40} ${GY - 240} ${wave + 120} ${GY - 150} Q ${wave + 60} ${GY - 120} ${wave + 160} ${GY + 80} Z`} fill="#3f8aa4" stroke="#d8f0ee" strokeWidth={8} opacity={lt < 1.4 ? 1 : 0} />
      <Flatboat x={bx} y={by} s={0.62} rot={rot} cabin={false}>
        <rect x={hand[0] / 0.62 - 10} y={hand[1] / 0.62 - 8} width={250} height={16} fill="#8e6236" stroke={INK} strokeWidth={5} />
        <rect x={hand[0] / 0.62 + 40} y={hand[1] / 0.62 + 8} width={20} height={-hand[1] / 0.62 - 8} fill="#8e6236" stroke={INK} strokeWidth={4} />
        <rect x={hand[0] / 0.62 + 200} y={hand[1] / 0.62 + 8} width={20} height={-hand[1] / 0.62 - 8} fill="#8e6236" stroke={INK} strokeWidth={4} />
        <g transform={`scale(${1 / 0.62})`}><Person x={pX} y={pY} s={ps} kit={{ pose: "side", facing: 1, colors: BOATMAN, expression: "scared", armAngle: -88, farArmAngle: -88 }} /></g>
      </Flatboat>
      {lt > BOAT_LAND && lt < BOAT_LAND + 0.5 && [0, 1, 2, 3, 4].map((i) => <circle key={i} cx={830 + (i - 2) * 70 * (1 + (lt - BOAT_LAND) * 4)} cy={GY - 60 - 60 * Math.sin(Math.PI * (lt - BOAT_LAND) / 0.5) * (0.5 + rnd(i))} r={12} fill="#8a6a44" />)}
      <Label x={540} y={220} lt={lt} at={0.6} text="BOATS THROWN ASHORE" size={46} />
    </g>
  );
};

// ---------- 11: a waterfall in the Mississippi ----------
export const SceneFalls: React.FC<SP> = ({ lt, frame }) => {
  const k = interpolate(lt, [0, 0.6], [0.3, 1], cl);
  const LY = GY - 330, RY = LY + 280 * k, EX = 520;
  const ph = Math.max(0, Math.min(1, (lt - 0.3) / 0.6));
  const fx = 870, fy = GY + 120, fs = 0.8;
  return (
    <g>
      <Sky top="#3a4a7a" bottom="#e8b080" />
      <TreeLine y={LY - 10} color="#2a3a2e" seed={11} />
      <rect x={-20} y={LY} width={EX + 20} height={1300} fill="#2f6478" />
      <rect x={EX} y={RY} width={600} height={1300} fill="#2a5a6e" />
      <Ripples y0={LY + 20} y1={LY + 200} off={frame * 5} rows={3} />
      {/* the drop */}
      <path d={`M ${EX - 10} ${LY} Q ${EX + 30} ${LY + 10} ${EX + 40} ${RY + 20} L ${EX + 10} ${RY + 20} Z`} fill="#bfe6ee" />
      {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M ${EX - 10 + i * 8} ${LY + 5} Q ${EX + 20 + i * 6} ${LY + 40} ${EX + 24 + i * 6} ${RY + 10}`} stroke="#fff" strokeWidth={4} fill="none" strokeDasharray="20 16" strokeDashoffset={-frame * 12} opacity={0.8} />)}
      {Array.from({ length: 12 }, (_, i) => { const a = ((frame * 0.05 + rnd(i)) % 1); return <circle key={i} cx={EX + 40 + (rnd(i + 3) - 0.3) * 160} cy={RY + 20 - a * 120} r={20 + a * 30} fill="#fff" opacity={0.55 * (1 - a)} />; })}
      {/* near bank + witness pointing at the falls */}
      <path d={`M 700 ${GY + 1000} L 760 ${GY + 60} Q 900 ${GY + 10} 1100 ${GY + 20} L 1100 ${GY + 1000} Z`} fill="#6a5034" stroke={INK} strokeWidth={6} />
      <Person x={fx} y={fy} s={fs} kit={{ pose: "side", facing: -1, colors: FARMER, expression: "scared", armAngle: -95 * ph, farArmAngle: ph > 0 ? 10 : undefined }} />
      <Label x={540} y={220} lt={lt} at={0.3} text="WATERFALLS" size={60} />
      <Label x={540} y={320} lt={lt} at={1.1} text="IN THE MISSISSIPPI" size={42} bg="#fff3c4" fg="#1d1712" stroke="#000" />
    </g>
  );
};

// ---------- 12: New Madrid destroyed — the settler runs with a child ----------
export const CHIMNEY_HIT = 1.1;
export const SceneDestroyed: React.FC<SP> = ({ lt, frame }) => {
  const fall = interpolate(lt, [0.45, CHIMNEY_HIT], [0, 1], { ...cl, easing: Easing.in(Easing.quad) });
  const tilt = interpolate(lt, [0.3, 1.2], [0, 7], cl);
  const crack = interpolate(lt, [0.2, 1.0], [0, 1], cl);
  const shake = Math.sin(frame * 2.2) * 8 * (lt < 1.6 ? 1 : 0.3);
  const s1 = 0.85, sx = 760 - Math.max(0, lt - 0.15) * 250, sy = GY + 170;
  const H = handAt(sx, sy, s1, -1, 40);
  const cs = 0.55, ca = -82;
  const ch0 = handAt(0, 0, cs, -1, ca);
  const cx = H[0] - ch0[0], cy = H[1] - ch0[1];
  return (
    <g transform={`translate(${shake} 0)`}>
      <Sky top="#e8a06a" bottom="#f7dcb0" clouds={2} drift={frame * 0.3} />
      <Hills y={GY - 120} color="#b8a070" amp={8} seed={3} />
      <g transform={`rotate(${tilt} 900 ${GY - 40})`}>
        <Cabin x={720} y={GY - 40} s={0.7} />
      </g>
      {/* chimney falling (pivot at its base on the roof) */}
      <g transform={`rotate(${fall * 95 + tilt} ${720 + 116} ${GY - 40 - 240})`}>
        <rect x={720 + 105} y={GY - 40 - 301} width={24} height={64} fill="#8a3a2a" stroke={INK} strokeWidth={4} />
      </g>
      <Cabin x={260} y={GY - 20} s={0.62} />
      <Ground color="#b8a46a" tuft="#8a7a3a" kind="street" />
      <path d={`M 120 ${GY + 60} L ${120 + crack * 220} ${GY + 90} L ${120 + crack * 380} ${GY + 70} L ${120 + crack * 560} ${GY + 110}`} stroke="#2a1a10" strokeWidth={10 * crack + 1} fill="none" strokeLinejoin="round" />
      {lt > CHIMNEY_HIT && lt < CHIMNEY_HIT + 0.6 && [0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={1000 + (i - 2.5) * 30 * (1 + (lt - CHIMNEY_HIT) * 5)} y={GY - 120 - 80 * Math.sin(Math.PI * (lt - CHIMNEY_HIT) / 0.6) * rnd(i)} width={20} height={12} fill="#8a3a2a" stroke={INK} strokeWidth={2} />)}
      <Person x={cx} y={cy} s={cs} kit={{ pose: "side", walking: true, facing: -1, colors: CHILD, expression: "scared", armAngle: ca }} />
      <Person x={sx} y={sy} s={s1} kit={{ pose: "side", walking: true, facing: -1, colors: SETTLER, expression: "scared", armAngle: 40 }} />
      <Label x={540} y={220} lt={lt} at={0.5} text="DESTROYED" size={64} />
    </g>
  );
};

// ---------- 13: Tennessee — the land sinks and floods ----------
export const SceneSink: React.FC<SP> = ({ lt, frame }) => {
  const drop = interpolate(lt, [0.3, 1.4], [0, 1], { ...cl, easing: Easing.in(Easing.cubic) }) * 110;
  const water = interpolate(lt, [1.2, 3.2], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  const shake = lt < 1.6 ? Math.sin(frame * 2) * 7 : 0;
  const L = 60, R = 820, base = GY + 120;
  const fx = interpolate(lt, [0.9, 1.6], [900, 975], cl);
  const wl = base + drop + 40 - water * (drop + 20);
  return (
    <g transform={`translate(${shake} 0)`}>
      <Sky top="#8fb4d0" bottom="#efe2c0" clouds={2} drift={frame * 0.3} />
      <Hills y={GY - 140} color="#7f9a5a" amp={30} seed={4} />
      <rect x={-20} y={base} width={1120} height={1300} fill="#6a7a3a" />
      {/* sinking block with trees */}
      <g transform={`translate(0 ${drop})`}>
        <path d={`M ${L} ${base} L ${R} ${base} L ${R - 20} ${base + 700} L ${L + 20} ${base + 700} Z`} fill="#7a8a44" stroke={INK} strokeWidth={5} />
        {[160, 330, 520, 690].map((x, i) => <g key={i} transform={`translate(${x} ${base + 10})`}><rect x={-14} y={-240} width={28} height={240} fill="#5a3a20" stroke={INK} strokeWidth={4} /><ellipse cx={0} cy={-290} rx={80 + (i % 2) * 20} ry={80} fill="#4a6a2e" stroke={INK} strokeWidth={5} /></g>)}
      </g>
      {/* water rising inside the dip */}
      {water > 0 && <rect x={L + 5} y={wl} width={R - L - 10} height={base + drop + 60 - wl} fill="#3d7f96" opacity={0.9} />}
      {water > 0 && <Ripples y0={wl + 8} y1={wl + 40} off={frame * 2} rows={1} />}
      <Person x={fx} y={GY + 120} s={0.7} kit={{ pose: "side", walking: lt > 0.9 && lt < 1.6, facing: -1, colors: FARMER, expression: "scared" }} />
      <Label x={540} y={220} lt={lt} at={0.15} text="TENNESSEE" size={56} />
      <Label x={540} y={320} lt={lt} at={1.4} text="LAND SINKS" size={46} bg="#fff3c4" fg="#1d1712" stroke="#000" />
    </g>
  );
};

// ---------- 15: Washington, D.C. — woken in the night ----------
export const SceneCapital: React.FC<SP> = ({ lt, frame }) => {
  const rattle = lt > 0.25 && lt < 3 ? 1 : 0;
  const sit = interpolate(lt, [0.6, 1.3], [0, 0.85], { ...cl, easing: Easing.out(Easing.cubic) });
  const wob = Math.sin(frame * 2.6) * 7 * rattle;
  return (
    <g>
      <rect x={0} y={0} width={1080} height={GY + 200} fill="#4a5a7a" />
      {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M ${i * 100} 0 L ${i * 100} ${GY + 200}`} stroke="#56688a" strokeWidth={30} />)}
      <rect x={0} y={GY + 150} width={1080} height={1300} fill="#5a3e28" />
      {/* window */}
      <g transform={`translate(${Math.sin(frame * 3.1) * 3 * rattle} 0)`}>
        <rect x={620} y={GY - 700} width={300} height={380} fill="#1a2440" stroke="#efe8d6" strokeWidth={14} />
        <circle cx={820} cy={GY - 600} r={46} fill="#fff6d8" />
        <path d={`M 770 ${GY - 700} L 770 ${GY - 320} M 620 ${GY - 510} L 920 ${GY - 510}`} stroke="#efe8d6" strokeWidth={10} />
      </g>
      <path d={`M 620 ${GY - 320} L 420 ${GY + 150} L 1000 ${GY + 150} L 920 ${GY - 320} Z`} fill="#fff6d8" opacity={0.08} />
      {/* bed */}
      <rect x={60} y={GY - 160} width={30} height={310} fill="#6a3f1c" stroke={INK} strokeWidth={5} />
      <rect x={60} y={GY + 20} width={700} height={70} fill="#7a4a24" stroke={INK} strokeWidth={5} />
      <rect x={120} y={GY - 20} width={160} height={50} rx={20} fill="#f4efe2" stroke={INK} strokeWidth={4} />
      <Lying x={440} y={GY + 10} s={0.6} colors={SLEEPER} expression={sit > 0.2 ? "scared" : "neutral"} sit={sit} wounds={false} />
      <path d={`M 400 ${GY - 10} Q 580 ${GY - 60} 760 ${GY} L 760 ${GY + 30} L 400 ${GY + 30} Z`} fill="#8a3a4a" stroke={INK} strokeWidth={5} />
      {/* nightstand + candlestick that wobbles */}
      <rect x={800} y={GY - 20} width={150} height={170} fill="#6a3f1c" stroke={INK} strokeWidth={5} />
      <g transform={`rotate(${wob} 875 ${GY - 20})`}>
        <ellipse cx={875} cy={GY - 24} rx={34} ry={8} fill="#c9a227" stroke={INK} strokeWidth={3} />
        <rect x={865} y={GY - 110} width={20} height={86} fill="#f2ead2" stroke={INK} strokeWidth={3} />
        <path d={`M 875 ${GY - 110} q -9 -26 0 -40 q 9 14 0 40 Z`} fill="#ffcf7a" />
      </g>
      <Label x={540} y={220} lt={lt} at={0.3} text="WASHINGTON, D.C." size={52} />
      <Label x={540} y={320} lt={lt} at={1.5} text="700 MILES AWAY" size={44} bg="#fff3c4" fg="#1d1712" stroke="#000" />
    </g>
  );
};

export const _unused = [Hills, Ground];
