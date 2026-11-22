import React from "react";
import { interpolate, Easing } from "remotion";
import { Sky } from "./ponyScenes";
import { Label } from "./chickenScenes";
import { handAt } from "./madridScenes";
import { Figure, Smoke } from "./pirateScenes";
import { KitColors } from "../kit/Kit";

/**
 * Ground scenes for "He Stole a Confederate Warship" (Robert Smalls and the Planter, Charleston, May 1862).
 * lt = seconds since the scene started. Kit side pose: feet at (0,0), shoulder pivot (0,-284), straight-arm hand = handAt().
 * Arm angle: 0 = hanging, -90 = forward, -170 = straight up. Scenes are drawn at GY and shifted −130 px by the story.
 * Storyboard: social/scripts/robert-smalls-2026-11-23.md.
 */
const INK = "#2b1d14";
const GY = 1240;
const cl = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const ease = Easing.inOut(Easing.cubic);
type SP = { lt: number; dur: number; frame: number };
type V2 = [number, number];
const lerpA = (u: number, keys: [number, number][]) => {
  if (u <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (u <= keys[i][0]) { const [u0, a0] = keys[i - 1], [u1, a1] = keys[i]; return a0 + (a1 - a0) * ease((u - u0) / (u1 - u0)); }
  return keys[keys.length - 1][1];
};

// ---------- people (1862) ----------
const dark = (h = "#1a1210"): Partial<KitColors> => ({ skin: "#7a4a2e", skinShade: "#5e3820", blush: "#8a4a36", hair: h, hairLight: "#2e2420", capStyle: "hair" } as Partial<KitColors>);
/** Robert Smalls, wheelman: dark jacket, white shirt */
export const SMALLS: Partial<KitColors> = { ...dark(), coat: "#2c3446", coatShade: "#1f2534", coatLight: "#3a4458", patch: "#3a4458", scarf: "#efe8d6", scarfShade: "#cfc6b0", trousers: "#3a332c", trousersShade: "#2a241f", button: "#c9a54a" };
const SMALLS_LATER: Partial<KitColors> = { ...SMALLS, coat: "#1e1e22", coatShade: "#141416", coatLight: "#2a2a30", patch: "#2a2a30", trousers: "#1e1e22", trousersShade: "#141416" };
const CREW1: Partial<KitColors> = { ...dark("#221812"), coat: "#7a5a3a", coatShade: "#5e4429", coatLight: "#8c6a46", patch: "#8c6a46", scarf: "#b8862a", scarfShade: "#8a6420", trousers: "#4a4036", trousersShade: "#3a322a" };
const CREW2: Partial<KitColors> = { ...dark("#141010"), skin: "#5e3a24", skinShade: "#4a2c1a", coat: "#5a6a52", coatShade: "#46543f", coatLight: "#6a7c60", patch: "#6a7c60", scarf: "#efe8d6", scarfShade: "#cfc6b0", trousers: "#3a3a3a", trousersShade: "#2a2a2a" };
const HANNAH: Partial<KitColors> = { ...dark("#1a1210"), coat: "#7a3a4a", coatShade: "#5e2c38", coatLight: "#8e4a5a", patch: "#8e4a5a", scarf: "#efe2c4", scarfShade: "#cfc2a4", trousers: "#7a3a4a", trousersShade: "#5e2c38", button: "#efe2c4" };
const CHILD: Partial<KitColors> = { ...dark("#1a1210"), coat: "#c8a46a", coatShade: "#a8864e", coatLight: "#d8b47a", patch: "#d8b47a", scarf: "#c23b2c", scarfShade: "#8f2a20", trousers: "#5a4a3a", trousersShade: "#4a3a2c" };
const REB: Partial<KitColors> = { coat: "#7c7f86", coatShade: "#62656c", coatLight: "#8e9198", patch: "#8e9198", scarf: "#d8cfa8", scarfShade: "#b8af88", trousers: "#6a6d74", trousersShade: "#55585e", button: "#d6b04a", cap: "#7c7f86", capShade: "#62656c", capBand: "#2a2a2a", hair: "#5a3e24" };
const SENTRY: Partial<KitColors> = { ...REB, coat: "#8a8478", coatShade: "#6e695f", coatLight: "#9c968a", patch: "#9c968a" };
const UNION: Partial<KitColors> = { coat: "#22356a", coatShade: "#18264e", coatLight: "#2e4482", patch: "#2e4482", scarf: "#efe8d6", scarfShade: "#cfc6b0", trousers: "#22356a", trousersShade: "#18264e", button: "#d6b04a", cap: "#1c2a52", capShade: "#141e3c", capBand: "#0e1428", hair: "#6a4428" };
const UCAPT: Partial<KitColors> = { ...UNION, hair: "#8a6a4a", cap: "#1c2a52" };
const TOWNSF: Partial<KitColors> = { coat: "#6a5a7a", coatShade: "#544864", coatLight: "#7a6a8c", patch: "#7a6a8c", scarf: "#efe8d6", trousers: "#3a3a40", trousersShade: "#2a2a30", hair: "#5a3a20" };

/** captain's flat straw hat, rig units (facing right) */
export const StrawHat: React.FC = () => (
  <g>
    <path d="M -38 -394 L -32 -448 Q 16 -460 66 -448 L 72 -394 Z" fill="#e6cc80" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <rect x={-36} y={-414} width={106} height={14} fill="#3a2a1e" />
    <ellipse cx={17} cy={-394} rx={104} ry={15} fill="#ecd48a" stroke={INK} strokeWidth={4} />
    <path d="M -70 -392 Q 17 -386 104 -392" stroke="#c9ad62" strokeWidth={3} fill="none" />
  </g>
);
/** hat on its own (world coords), centre of brim at (x,y) */
const LooseHat: React.FC<{ x: number; y: number; s: number; rot?: number }> = ({ x, y, s, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s}) translate(-17 394)`}><StrawHat /></g>
);
/** skirt over the Kit legs (side pose) */
const Skirt: React.FC<{ x: number; y: number; s: number; color: string; shade: string; lean?: number }> = ({ x, y, s, color, shade, lean = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${lean}) scale(${s})`}>
    <path d="M -44 -176 L 44 -176 L 66 -40 Q 0 -28 -66 -40 Z" fill={color} stroke={INK} strokeWidth={4 / s} />
    <path d="M 6 -170 L 22 -44" stroke={shade} strokeWidth={6} />
  </g>
);
const Headwrap: React.FC<{ color?: string }> = ({ color = "#e8d6a8" }) => (
  <path d="M -44 -372 Q -40 -440 14 -444 Q 66 -440 70 -380 Q 40 -400 10 -398 Q -20 -396 -44 -372 Z" fill={color} stroke={INK} strokeWidth={4} />
);
const Lamp: React.FC<{ x: number; y: number; frame: number; s?: number }> = ({ x, y, frame, s = 1 }) => {
  const f = 0.85 + 0.15 * Math.sin(frame * 0.7) * Math.sin(frame * 0.31);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle r={110} fill="#ffcf6a" opacity={0.16 * f} />
      <path d="M -11 -36 Q 0 -52 11 -36" stroke="#2a211b" strokeWidth={3} fill="none" />
      <rect x={-13} y={-36} width={26} height={7} rx={2} fill="#3a3028" />
      <rect x={-10} y={-29} width={20} height={27} rx={5} fill="#ffd98a" opacity={f} stroke="#1a140f" strokeWidth={3} />
      <rect x={-14} y={-3} width={28} height={7} rx={2} fill="#3a3028" />
    </g>
  );
};

// ---------- water, wharf, ships ----------
const Water: React.FC<{ y: number; frame: number; c1: string; c2: string; crest?: string; speed?: number }> = ({ y, frame, c1, c2, crest = "#cfe2e6", speed = 1 }) => {
  const id = `w${c1}${c2}`.replace(/#/g, "");
  return (
    <g>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c1} /><stop offset="1" stopColor={c2} /></linearGradient></defs>
      <rect x={-60} y={y} width={1200} height={2300 - y} fill={`url(#${id})`} />
      {Array.from({ length: 34 }, (_, i) => {
        const yy = y + 12 + rnd(i) * 760, x = ((rnd(i + 9) * 1300 - frame * (1.2 + rnd(i + 3)) * speed) % 1300 + 1300) % 1300 - 110;
        return <path key={i} d={`M ${x} ${yy} q 26 -9 52 0`} stroke={crest} strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.45} />;
      })}
    </g>
  );
};
/** wooden wharf in front of the water; top at y */
const Wharf: React.FC<{ y: number; x0?: number; x1?: number; night?: boolean }> = ({ y, x0 = -60, x1 = 1140, night }) => (
  <g>
    <rect x={x0} y={y} width={x1 - x0} height={2300 - y} fill={night ? "#3a2c22" : "#8a6440"} />
    {Array.from({ length: 30 }, (_, i) => <line key={i} x1={x0} x2={x1} y1={y + 18 + i * 40} y2={y + 18 + i * 40} stroke={night ? "#2a2018" : "#6e4e30"} strokeWidth={4} />)}
    <rect x={x0} y={y - 6} width={x1 - x0} height={16} fill={night ? "#4a382a" : "#a07850"} stroke={INK} strokeWidth={3} />
  </g>
);
/** Pilings along a wharf edge */
const Pilings: React.FC<{ y: number; xs: number[]; night?: boolean }> = ({ y, xs, night }) => (
  <g>{xs.map((x) => <rect key={x} x={x - 16} y={y - 70} width={32} height={150} rx={6} fill={night ? "#2e241c" : "#6a4a2c"} stroke={INK} strokeWidth={3} />)}</g>
);
/**
 * The Planter: side-wheel steamer, bow to the RIGHT. (x,y) = waterline centre. sheet = 0..1 white bedsheet up the fore mast.
 * Deck top at y − 84·s. Pilothouse x 230..330. Stack x 60..100. Whistle at (112, −340).
 */
export const Planter: React.FC<{ x: number; y: number; s?: number; frame: number; night?: boolean; smoke?: number; sheet?: number; rebelFlag?: number; whistle?: number; lights?: boolean; wheel?: number }> = ({ x, y, s = 1, frame, night, smoke = 0, sheet = 0, rebelFlag = 1, whistle = 0, lights, wheel = 1 }) => {
  const c = (day: string, n: string) => (night ? n : day);
  const rot = (frame * 4 * wheel) % 360;
  const wave = Math.sin(frame * 0.3) * 5;
  const sheetTop = -520 + (1 - sheet) * 300;
  return (
    <g transform={`translate(${x} ${y + Math.sin(frame * 0.07) * 3 * s}) scale(${s})`}>
      {/* fore mast + flagstaff aft */}
      <line x1={400} y1={-84} x2={400} y2={-560} stroke={c("#5a3a20", "#1e1612")} strokeWidth={10} />
      <line x1={-500} y1={-84} x2={-500} y2={-330} stroke={c("#5a3a20", "#1e1612")} strokeWidth={8} />
      {rebelFlag > 0 && <g opacity={rebelFlag}><path d={`M -500 -330 Q -456 ${-340 + wave} -412 -330 L -412 -282 Q -456 ${-292 + wave} -500 -282 Z`} fill={c("#c8c4bc", "#4a4844")} stroke={INK} strokeWidth={3} /><rect x={-500} y={-330} width={34} height={26} fill={c("#8a2a2a", "#3a1a1a")} /></g>}
      {sheet > 0 && <path d={`M 400 ${sheetTop} Q 456 ${sheetTop - 10 + wave} 512 ${sheetTop} L 512 ${sheetTop + 84} Q 456 ${sheetTop + 74 + wave} 400 ${sheetTop + 84} Z`} fill="#f6f4ee" stroke={INK} strokeWidth={4} />}
      {/* stack + smoke + whistle */}
      <rect x={60} y={-430} width={40} height={260} fill={c("#2a2626", "#141212")} stroke={INK} strokeWidth={4} />
      <rect x={52} y={-440} width={56} height={16} fill={c("#3a3434", "#1a1818")} stroke={INK} strokeWidth={3} />
      <rect x={106} y={-352} width={12} height={26} rx={3} fill={c("#c9a54a", "#6a5a2a")} stroke={INK} strokeWidth={2} />
      {whistle > 0 && Array.from({ length: 6 }, (_, i) => <circle key={i} cx={112 + i * 9} cy={-362 - i * 22 * whistle} r={10 + i * 7} fill="#f2f2f2" opacity={0.75 * whistle * (1 - i / 7)} />)}
      {smoke > 0 && <Smoke x={80} y={-450} frame={frame} seed={5} n={12} h={420} k={smoke} />}
      {/* deckhouse + pilothouse */}
      <rect x={-380} y={-170} width={560} height={86} fill={c("#e8dcc0", "#3a3630")} stroke={INK} strokeWidth={4} />
      {Array.from({ length: 9 }, (_, i) => <rect key={i} x={-360 + i * 58} y={-150} width={26} height={30} fill={lights ? "#ffd98a" : c("#6a7a84", "#1a1e22")} stroke={INK} strokeWidth={2} />)}
      <rect x={-392} y={-182} width={584} height={14} fill={c("#c8b890", "#2a2620")} stroke={INK} strokeWidth={3} />
      <rect x={230} y={-260} width={100} height={176} fill={c("#e8dcc0", "#3a3630")} stroke={INK} strokeWidth={4} />
      <rect x={244} y={-240} width={72} height={46} fill={lights ? "#ffcf6a" : c("#6a7a84", "#1a1e22")} stroke={INK} strokeWidth={3} />
      <path d="M 222 -260 L 338 -260 L 330 -280 L 230 -280 Z" fill={c("#8a4a2a", "#2a1a14")} stroke={INK} strokeWidth={3} />
      {/* hull */}
      <path d="M -520 -84 L 500 -84 Q 572 -80 552 -40 L 500 30 L -470 30 Q -520 8 -520 -84 Z" fill={c("#3b3532", "#16131a")} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <rect x={-516} y={-92} width={1060} height={12} fill={c("#c9a24a", "#3a3020")} opacity={0.8} />
      {/* bow gun */}
      <g transform="translate(450 -96)"><rect x={-30} y={-14} width={80} height={18} rx={8} fill={c("#3a3a3a", "#121212")} stroke={INK} strokeWidth={3} /><circle cx={-14} cy={6} r={12} fill={c("#6a4a2a", "#1e1612")} stroke={INK} strokeWidth={3} /></g>
      {/* paddle box with turning wheel slats */}
      <g transform="translate(-60 -60)">
        <path d="M -150 30 A 150 150 0 0 1 150 30 Z" fill={c("#c8b890", "#2e2a24")} stroke={INK} strokeWidth={5} />
        {Array.from({ length: 8 }, (_, i) => { const a = ((rot + i * 22.5) * Math.PI) / 180; return Math.sin(a) < -0.15 ? null : <line key={i} x1={Math.cos(a) * 40} y1={30 + Math.sin(a) * 0} x2={Math.cos(a) * 140} y2={30 - Math.abs(Math.sin(a)) * 110} stroke={c("#8a7a5a", "#1e1a16")} strokeWidth={6} opacity={0.6} />; })}
        <text y={-30} textAnchor="middle" fontFamily="Georgia" fontWeight={700} fontSize={34} fill={c("#3a2a1e", "#1a1410")}>PLANTER</text>
        {Array.from({ length: 4 }, (_, i) => <circle key={i} cx={-120 + i * 80 + ((frame * 6) % 80)} cy={44} r={14} fill="#ffffff" opacity={0.35 * wheel} />)}
      </g>
    </g>
  );
};
/** Fort Sumter: low brick pentagon on the water. (x,y) = waterline centre */
const Fort: React.FC<{ x: number; y: number; s?: number; night?: boolean; frame: number; lamp?: boolean }> = ({ x, y, s = 1, night, frame, lamp }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -380 0 L -340 -150 L 340 -150 L 380 0 Z" fill={night ? "#2a1e1a" : "#9a5a3c"} stroke={INK} strokeWidth={5} />
    {Array.from({ length: 9 }, (_, i) => <rect key={i} x={-300 + i * 70} y={-110} width={26} height={22} fill={night ? "#120c0a" : "#4a2a1a"} />)}
    {Array.from({ length: 14 }, (_, i) => <rect key={`m${i}`} x={-336 + i * 50} y={-170} width={30} height={22} fill={night ? "#2a1e1a" : "#9a5a3c"} stroke={INK} strokeWidth={3} />)}
    <line x1={0} y1={-170} x2={0} y2={-330} stroke={night ? "#1a1410" : "#4a3a2a"} strokeWidth={6} />
    <path d={`M 0 -330 Q 40 ${-340 + Math.sin(frame * 0.2) * 5} 80 -330 L 80 -290 Q 40 ${-300 + Math.sin(frame * 0.2) * 5} 0 -290 Z`} fill={night ? "#3a3634" : "#c8c4bc"} stroke={INK} strokeWidth={3} />
    {lamp && <Lamp x={220} y={-176} frame={frame} s={1.2} />}
    <path d="M -400 0 L 400 0 L 380 24 L -380 24 Z" fill={night ? "#1a1612" : "#6a6050"} />
  </g>
);
/** Union gunboat (USS Onward stand-in): dark hull, one funnel, bow LEFT */
const Gunboat: React.FC<{ x: number; y: number; s?: number; frame: number }> = ({ x, y, s = 1, frame }) => (
  <g transform={`translate(${x} ${y + Math.sin(frame * 0.08) * 3}) scale(${s})`}>
    <line x1={-200} y1={-80} x2={-200} y2={-480} stroke="#3a2a1a" strokeWidth={10} />
    <line x1={200} y1={-80} x2={200} y2={-440} stroke="#3a2a1a" strokeWidth={10} />
    <g transform="translate(200 -440)"><rect width={70} height={46} fill="#b8282a" stroke={INK} strokeWidth={3} /><rect width={30} height={24} fill="#1f3a8a" />{[10, 22, 34].map((yy) => <rect key={yy} x={30} y={yy} width={40} height={5} fill="#fff" />)}</g>
    <rect x={-20} y={-300} width={44} height={220} fill="#1e1e22" stroke={INK} strokeWidth={4} />
    <path d="M -480 -80 Q -500 -40 -440 30 L 460 30 L 470 -80 Z" fill="#1c1e26" stroke={INK} strokeWidth={5} />
    <rect x={-470} y={-88} width={940} height={12} fill="#7a6a4a" />
    <Smoke x={2} y={-310} frame={frame} seed={8} n={8} h={260} k={0.8} />
  </g>
);
const Cannon: React.FC<{ x: number; y: number; s?: number; rot?: number; flip?: boolean }> = ({ x, y, s = 1, rot = 0, flip }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <g transform={`rotate(${rot} 0 -60)`}><path d="M -110 -84 L 130 -76 L 130 -46 L -110 -36 Z" fill="#2a2a2e" stroke={INK} strokeWidth={4} /><rect x={124} y={-82} width={14} height={42} fill="#3a3a40" stroke={INK} strokeWidth={3} /></g>
    <path d="M -90 -40 L 40 -40 L 60 0 L -110 0 Z" fill="#6a4a2a" stroke={INK} strokeWidth={4} />
    <circle cx={-60} cy={0} r={22} fill="#4a3220" stroke={INK} strokeWidth={4} /><circle cx={30} cy={0} r={22} fill="#4a3220" stroke={INK} strokeWidth={4} />
  </g>
);
const Skyline: React.FC<{ y: number; color: string; windows?: boolean }> = ({ y, color, windows }) => (
  <g fill={color}>
    {[[-40, 160, 120], [90, 120, 200], [230, 90, 140], [340, 140, 90], [500, 120, 170], [640, 100, 110], [760, 140, 190], [920, 180, 120]].map(([x, w, h], i) => <rect key={i} x={x} y={y - h} width={w} height={h} />)}
    {/* St. Michael's steeple */}
    <rect x={560} y={y - 300} width={50} height={140} /><path d={`M 560 ${y - 300} L 585 ${y - 440} L 610 ${y - 300} Z`} />
    {windows && Array.from({ length: 14 }, (_, i) => <rect key={i} x={20 + i * 72} y={y - 60 - rnd(i) * 60} width={14} height={18} fill="#ffd98a" opacity={rnd(i + 4) > 0.5 ? 0.8 : 0} />)}
  </g>
);

// ---------- 1 + LOOP: Smalls at the wheel in the straw hat, Fort Sumter sliding past in the dark ----------
/** u = 0 is frame 0. The loop runs u from negative up to 0. */
export const SceneWheel: React.FC<SP & { u0?: number }> = ({ lt, frame, u0 = 0 }) => {
  const u = lt + u0;
  const push = 1.04 + Math.min(4.5, Math.max(0, u)) * 0.02;
  const fortX = 900 - u * 56;
  const spin = Math.sin(u * 1.1) * 14;
  const wx = 620, wy = 1000, wr = 150;
  const sx = 310, sy = GY + 60, ps = 1.25;
  const h1 = handAt(sx, sy, ps, 1, -78, 0), h2 = handAt(sx, sy, ps, 1, -66, 0);
  return (
    <g transform={`translate(540 1000) scale(${push}) translate(-540 -1000)`}>
      <Sky top="#050a16" bottom="#17233c" stars />
      <circle cx={850} cy={260} r={50} fill="#f4ecd0" opacity={0.85} />
      <Water y={880} frame={frame} c1="#0e1a2c" c2="#060b14" crest="#6a86a8" speed={0.6} />
      <Fort x={fortX} y={900} s={0.7} night frame={frame} lamp />
      {/* pilothouse interior frame */}
      <rect x={-60} y={500} width={140} height={1700} fill="#2a1e16" />
      <rect x={1000} y={500} width={140} height={1700} fill="#2a1e16" />
      <rect x={-60} y={440} width={1200} height={80} fill="#3a2a1e" stroke={INK} strokeWidth={5} />
      <rect x={-60} y={GY - 60} width={1200} height={1000} fill="#4a3424" />
      <rect x={-60} y={GY - 72} width={1200} height={20} fill="#6a4a30" stroke={INK} strokeWidth={4} />
      {/* ship's wheel (spokes turn) */}
      <g transform={`translate(${wx} ${wy}) rotate(${spin})`}>
        <circle r={wr} fill="none" stroke="#7a4a24" strokeWidth={22} />
        <circle r={wr} fill="none" stroke={INK} strokeWidth={3} />
        {Array.from({ length: 8 }, (_, i) => { const a = (i * Math.PI) / 4; return <g key={i}><line x1={0} y1={0} x2={Math.cos(a) * (wr + 50)} y2={Math.sin(a) * (wr + 50)} stroke="#8a5a2e" strokeWidth={16} strokeLinecap="round" /></g>; })}
        <circle r={34} fill="#c9a54a" stroke={INK} strokeWidth={4} />
      </g>
      <rect x={wx - 20} y={wy} width={40} height={GY - wy - 60} fill="#5a3a20" stroke={INK} strokeWidth={4} />
      <Figure x={sx} y={sy} s={ps} A1={-78} A2={-66} colors={SMALLS} frame={frame} expression="determined"><StrawHat /></Figure>
      {/* hands on the rim */}
      <circle cx={h1[0]} cy={h1[1]} r={13} fill="#5e3820" stroke={INK} strokeWidth={3} />
      <circle cx={h2[0]} cy={h2[1]} r={13} fill="#5e3820" stroke={INK} strokeWidth={3} />
      <Lamp x={900} y={620} frame={frame} s={1.3} />
      <Label x={Math.max(720, Math.min(870, fortX))} y={740} lt={u} at={0.3} text="FORT SUMTER" size={34} />
    </g>
  );
};

// ---------- 2: establishing — the Planter at a Charleston wharf, Smalls at the pilothouse ----------
export const ScenePlanter: React.FC<SP> = ({ lt, frame }) => {
  const pan = interpolate(lt, [0, 4], [80, -60], cl);
  return (
    <g>
      <Sky top="#8fc0dc" bottom="#e8e0c6" clouds={3} drift={lt} sun={{ x: 220, y: 300, r: 60, color: "#fff2c4" }} />
      <Skyline y={880} color="#a8a49a" />
      <Water y={870} frame={frame} c1="#4f7f8a" c2="#2e5560" />
      <g transform={`translate(${pan} 0)`}>
        <Planter x={560} y={1150} s={0.92} frame={frame} smoke={0.5} wheel={0.2} />
        <Figure x={560 + 280 * 0.92} y={1150 - 84 * 0.92} s={0.5} A1={-72} A2={-60} colors={SMALLS} frame={frame} />
        <Figure x={560 - 200 * 0.92} y={1150 - 84 * 0.92} s={0.5} facing={-1} A1={-30} A2={10} colors={CREW1} frame={frame} />
        <Label x={560 + 280 * 0.92 - 10} y={1150 - 84 * 0.92 - 270} lt={lt} at={0.6} text="ROBERT SMALLS" size={36} />
        <Label x={500} y={1360} lt={lt} at={1.6} text="THE PLANTER" size={40} bg="#7a1f1f" />
      </g>
      <Wharf y={1290} />
      <Pilings y={1290} xs={[40, 300, 560, 820, 1060]} />
    </g>
  );
};

// ---------- 3: the white officers go ashore at dusk; Smalls watches from the deck ----------
export const SceneAshore: React.FC<SP> = ({ lt, frame }) => {
  const deckY = 1060;
  const walk = (i: number) => {
    const t0 = i * 0.35;
    const k = interpolate(lt, [t0, t0 + 2.6], [0, 1], cl);
    // down the gangplank (from x 640, deck) to the wharf (x 380), then along the wharf to the left
    const onPlank = Math.min(1, k * 2);
    const x = 660 - onPlank * 260 - Math.max(0, k * 2 - 1) * 420;
    const y = deckY + onPlank * 180;
    return { x, y, walking: k > 0 && k < 1 };
  };
  const look = lt > 1.6 ? 1 : 0;
  return (
    <g>
      <Sky top="#2a2a4a" bottom="#d88a5a" sun={{ x: 160, y: 820, r: 70, color: "#ffb070" }} />
      <Skyline y={900} color="#3a3040" windows />
      <Water y={890} frame={frame} c1="#5a4a5a" c2="#2a2232" crest="#d8a088" />
      <Planter x={820} y={1120} s={0.95} frame={frame} lights wheel={0} />
      {/* gangplank */}
      <path d={`M 660 ${deckY} L 400 ${deckY + 180} L 400 ${deckY + 200} L 660 ${deckY + 20} Z`} fill="#8a6440" stroke={INK} strokeWidth={4} />
      <Wharf y={1240} night x1={460} />
      <Pilings y={1240} xs={[60, 260, 440]} night />
      {[0, 1, 2].map((i) => { const p = walk(i); return <Figure key={i} x={p.x} y={p.y} s={0.62} facing={-1} colors={REB} frame={frame + i * 7} walking={p.walking} A1={p.walking ? undefined : 0} A2={p.walking ? undefined : 0} expression="neutral" />; })}
      <Figure x={900} y={deckY + 30} s={0.62} facing={-1} A1={-10} A2={8} colors={SMALLS} frame={frame} expression={look ? "determined" : "neutral"} />
      <Label x={240} y={760} lt={lt} at={0.4} text="OFFICERS ASHORE" size={36} />
    </g>
  );
};

// ---------- 4: on deck at night, Smalls turns to the crew; they look at each other and nod ----------
export const SceneCrew: React.FC<SP> = ({ lt, frame }) => {
  const turn = lt > 0.5 ? -1 : 1;
  const nod = lt > 1.2 && lt < 1.8 ? 4 : 0;
  const nod2 = lt > 1.6 && lt < 2.2 ? 4 : 0;
  return (
    <g>
      <Sky top="#060b18" bottom="#1a2440" stars />
      <Water y={900} frame={frame} c1="#0e1a2c" c2="#060b14" crest="#5a7698" speed={0.3} />
      {/* deck rail + deckhouse wall */}
      <rect x={-60} y={940} width={1200} height={1400} fill="#3a2e24" />
      <rect x={-60} y={700} width={1200} height={300} fill="#4a3c30" stroke={INK} strokeWidth={4} />
      {[120, 420, 720].map((x) => <rect key={x} x={x} y={760} width={70} height={90} fill="#1a1612" stroke={INK} strokeWidth={3} />)}
      <rect x={-60} y={GY + 10} width={1200} height={1000} fill="#5a4432" />
      {Array.from({ length: 14 }, (_, i) => <line key={i} x1={-60} x2={1140} y1={GY + 30 + i * 40} y2={GY + 30 + i * 40} stroke="#4a3626" strokeWidth={4} />)}
      <Lamp x={560} y={690} frame={frame} s={1.6} />
      <Figure x={300} y={GY + 60} s={1.0} facing={turn as 1 | -1} A1={-8} A2={6} colors={SMALLS} frame={frame} expression="determined" />
      <Figure x={640} y={GY + 60} s={0.98} facing={-1} A1={-4} A2={4} lean={nod} colors={CREW1} frame={frame} expression={lt > 1.2 ? "determined" : "neutral"} />
      <Figure x={850} y={GY + 60} s={1.0} facing={lt > 0.9 ? 1 : -1} A1={-4} A2={4} lean={-nod2} colors={CREW2} frame={frame} expression={lt > 1.6 ? "determined" : "scared"} />
    </g>
  );
};

// ---------- 5: 3 a.m. — a crewman shovels coal into the firebox ----------
export const SHOVEL_P = 1.0;
export const SceneBoilers: React.FC<SP> = ({ lt, frame }) => {
  const ph = (lt % SHOVEL_P) / SHOVEL_P;
  const A = lerpA(ph, [[0, -10], [0.45, -20], [0.7, -78], [1, -10]]);
  const lean = lerpA(ph, [[0, 14], [0.45, 18], [0.7, -2], [1, 14]]);
  const fx = 300, fy = GY + 60, ps = 1.25;
  const h = handAt(fx, fy, ps, 1, A, lean);
  const h2 = handAt(fx, fy, ps, 1, A + 10, lean);
  const ang = Math.atan2(h[1] - h2[1], h[0] - h2[0]);
  const glow = 0.75 + 0.25 * Math.sin(frame * 0.5);
  const blade: V2 = [h[0] + Math.cos(-0.2 + (A + 90) / 90) * 130, h[1] + 30];
  return (
    <g>
      <rect x={-60} y={0} width={1200} height={2300} fill="#2a1c14" />
      {/* boiler + firebox */}
      <rect x={560} y={560} width={560} height={720} rx={40} fill="#4a4442" stroke={INK} strokeWidth={6} />
      {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={600 + i * 90} cy={600} r={9} fill="#2a2626" />)}
      <rect x={660} y={900} width={260} height={220} rx={16} fill="#1a0e08" stroke={INK} strokeWidth={6} />
      <rect x={680} y={920} width={220} height={180} rx={10} fill="#ff7a1a" opacity={glow} />
      <rect x={700} y={950} width={180} height={140} rx={10} fill="#ffd060" opacity={glow * 0.8} />
      <circle cx={790} cy={1010} r={300} fill="#ff8a2a" opacity={0.12 * glow} />
      {/* coal pile */}
      <path d="M -60 1300 Q 60 1180 200 1240 L 230 1300 Z" fill="#141010" />
      {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={20 + i * 20} cy={1250 + rnd(i) * 40} r={12} fill="#1e1a1a" stroke="#000" strokeWidth={2} />)}
      <rect x={-60} y={GY + 60} width={1200} height={1000} fill="#3a2a20" />
      <Figure x={fx} y={fy} s={ps} A1={A} A2={A + 10} lean={lean} colors={CREW2} frame={frame} expression="determined" />
      {/* shovel in both hands */}
      <g transform={`translate(${h[0]} ${h[1]}) rotate(${(ang * 180) / Math.PI})`}>
        <line x1={-60} y1={0} x2={150} y2={0} stroke="#7a4a24" strokeWidth={10} strokeLinecap="round" />
        <path d="M 140 -26 L 200 -22 L 200 22 L 140 26 Z" fill="#5a5a5e" stroke={INK} strokeWidth={3} />
        {ph < 0.68 && <circle cx={176} cy={-14} r={14} fill="#141010" />}
      </g>
      {ph > 0.66 && ph < 0.9 && Array.from({ length: 6 }, (_, i) => <circle key={i} cx={blade[0] + 40 + i * 30 * (ph - 0.66) * 10} cy={980 + rnd(i) * 60} r={8} fill="#ffb040" opacity={1 - (ph - 0.66) * 4} />)}
    </g>
  );
};

// ---------- 6: the second wharf — Hannah and the children step aboard, Smalls takes her hand ----------
export const SceneFamily: React.FC<SP> = ({ lt, frame }) => {
  const deckY = GY + 20, edge = 560;
  const hk = interpolate(lt, [0.3, 1.6], [0, 1], cl);
  const hx = 300 + hk * 300; // Hannah walks from the wharf onto the deck
  const hy = deckY + (hx < edge ? 0 : 0);
  const reach = lt < 1.9 ? -70 : -30;
  const sx = 760;
  const ck = interpolate(lt, [0.7, 2.0], [0, 1], cl);
  const cx = 180 + ck * 300;
  const hug = lt > 2.0 ? 1 : 0;
  return (
    <g>
      <Sky top="#050a16" bottom="#152038" stars />
      <Water y={900} frame={frame} c1="#0e1a2c" c2="#060b14" crest="#5a7698" speed={0.3} />
      {/* wharf on the left, deck on the right */}
      <rect x={-60} y={deckY} width={edge + 60} height={1100} fill="#3a2c22" />
      {Array.from({ length: 14 }, (_, i) => <line key={i} x1={-60} x2={edge} y1={deckY + 18 + i * 40} y2={deckY + 18 + i * 40} stroke="#2a2018" strokeWidth={4} />)}
      <Pilings y={deckY} xs={[60, 300]} night />
      <rect x={edge} y={deckY - 110} width={600} height={110} fill="#2e2620" stroke={INK} strokeWidth={4} />
      <rect x={edge} y={deckY} width={600} height={1100} fill="#4a382a" />
      <Lamp x={120} y={deckY - 330} frame={frame} s={1.3} />
      <line x1={120} y1={deckY - 300} x2={120} y2={deckY} stroke="#2a2018" strokeWidth={10} />
      <g transform={`translate(${hx} ${hy})`}>
        <Figure x={0} y={0} s={0.95} facing={hug ? 1 : 1} A1={hug ? -60 : lerpA(lt, [[0, -10], [1.2, -10], [1.6, -64]])} A2={8} colors={HANNAH} frame={frame} walking={hk > 0 && hk < 1} expression={hug ? "happy" : "scared"}><Headwrap /></Figure>
        <Skirt x={0} y={0} s={0.95} color="#7a3a4a" shade="#5e2c38" />
      </g>
      <Figure x={cx} y={deckY} s={0.6} facing={1} colors={CHILD} frame={frame + 5} walking={ck > 0 && ck < 1} A1={ck >= 1 ? -20 : undefined} A2={ck >= 1 ? 0 : undefined} expression="neutral" />
      <Figure x={sx - hug * 60} y={deckY} s={0.98} facing={-1} A1={hug ? -60 : reach} A2={hug ? -40 : 0} colors={SMALLS} frame={frame} expression={hug ? "happy" : "determined"} />
      <Label x={300} y={700} lt={lt} at={0.3} text="HIS WIFE AND CHILDREN" size={34} />
    </g>
  );
};

// ---------- 7: close-up — Smalls lifts the captain's straw hat off its peg and puts it on ----------
export const SceneHat: React.FC<SP> = ({ lt, frame }) => {
  const fx = 420, fy = GY + 330, ps = 1.7;
  const A = lerpA(lt, [[0, -40], [0.5, -128], [0.8, -128], [1.5, -176], [3, -176]]);
  const h = handAt(fx, fy, ps, 1, A, 0);
  const onHead = lt > 1.45;
  const peg = handAt(fx, fy, ps, 1, -128, 0);
  const held = lt > 0.5;
  const hatPos: V2 = held ? [h[0] + 12, h[1] + 34] : [peg[0] + 12, peg[1] + 34];
  return (
    <g>
      <rect x={-60} y={0} width={1200} height={2300} fill="#3a2a1e" />
      {Array.from({ length: 10 }, (_, i) => <line key={i} x1={i * 120} y1={0} x2={i * 120} y2={2300} stroke="#2e2218" strokeWidth={6} />)}
      <rect x={720} y={300} width={300} height={260} fill="#0c1222" stroke={INK} strokeWidth={8} />
      {Array.from({ length: 20 }, (_, i) => <circle key={i} cx={740 + rnd(i) * 260} cy={320 + rnd(i + 30) * 220} r={2.5} fill="#fff" opacity={0.7} />)}
      <rect x={peg[0] - 10} y={peg[1] + 36} width={34} height={14} fill="#8a6a3a" stroke={INK} strokeWidth={2} />
      <Lamp x={960} y={760} frame={frame} s={1.5} />
      <Figure x={fx} y={fy} s={ps} A1={A} A2={-10} colors={SMALLS} frame={frame} expression="determined">{onHead ? <StrawHat /> : null}</Figure>
      {!onHead && <LooseHat x={hatPos[0]} y={hatPos[1]} s={ps} rot={held ? -6 : 0} />}
      <Label x={540} y={1460 - 130} lt={lt} at={0.2} text="THE CAPTAIN'S HAT" size={40} />
    </g>
  );
};

// ---------- 8: from the fort — a sentry with a spyglass watches the steamer pass ----------
export const SceneSentry: React.FC<SP & { wave?: boolean }> = ({ lt, frame, wave }) => {
  const sx = 280, sy = GY - 40, ps = 1.1;
  const A = wave ? lerpA(lt, [[0, -95], [0.4, -150], [3, -150]]) : -95;
  const h = handAt(sx, sy, ps, 1, A, 0);
  const shipX = 640 + lt * 40;
  const swing = wave ? Math.sin(lt * 7) * 14 : 0;
  return (
    <g>
      <Sky top="#050a16" bottom="#1a2742" stars />
      <circle cx={180} cy={240} r={44} fill="#f4ecd0" opacity={0.8} />
      <Water y={980} frame={frame} c1="#0e1a2c" c2="#060b14" crest="#5a7698" speed={0.4} />
      {/* the Planter far out, silhouette with a tiny hatted figure */}
      <Planter x={shipX} y={1010} s={0.32} frame={frame} night smoke={0.7} lights />
      <g transform={`translate(${shipX + 280 * 0.32} ${1010 - 84 * 0.32}) scale(0.18)`}><Figure x={0} y={0} s={1} A1={-70} A2={-60} colors={SMALLS} frame={frame}><StrawHat /></Figure></g>
      {/* parapet */}
      <rect x={-60} y={GY - 40} width={1200} height={1100} fill="#2a1e1a" />
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-40 + i * 100} y={GY - 110} width={64} height={74} fill="#2a1e1a" stroke={INK} strokeWidth={3} />)}
      <Figure x={sx} y={sy} s={ps} A1={A} A2={wave ? -20 : -86} colors={SENTRY} frame={frame} expression="neutral" />
      {!wave && <g transform={`translate(${h[0]} ${h[1]}) rotate(-8)`}><rect x={-30} y={-12} width={150} height={24} rx={6} fill="#c9a54a" stroke={INK} strokeWidth={3} /><rect x={110} y={-15} width={22} height={30} fill="#8a6a2a" stroke={INK} strokeWidth={3} /></g>}
      {wave && <g transform={`rotate(${swing} ${h[0]} ${h[1]})`}><line x1={h[0]} y1={h[1]} x2={h[0]} y2={h[1] + 30} stroke="#2a211b" strokeWidth={3} /><Lamp x={h[0]} y={h[1] + 64} frame={frame} s={1.2} /></g>}
      <Label x={760} y={760} lt={lt} at={0.3} text={wave ? "ALL CLEAR" : "FORT SUMTER"} size={36} bg={wave ? "#1f5a2a" : "#1b140d"} />
    </g>
  );
};

// ---------- 9: Smalls pulls the whistle cord; steam bursts from the whistle ----------
export const WHISTLE_AT = 0.55;
export const SceneWhistle: React.FC<SP> = ({ lt, frame }) => {
  const fx = 380, fy = GY + 240, ps = 1.5;
  const A = lerpA(lt, [[0, -150], [WHISTLE_AT, -150], [WHISTLE_AT + 0.25, -132], [1.6, -132], [1.9, -150]]);
  const h = handAt(fx, fy, ps, 1, A, 0);
  const blow = lt > WHISTLE_AT && lt < 1.9 ? Math.min(1, (lt - WHISTLE_AT) * 5) : Math.max(0, 1 - (lt - 1.9) * 3) * (lt > 1.9 ? 1 : 0);
  const wx = 760, wy = 380;
  return (
    <g>
      <Sky top="#050a16" bottom="#1a2742" stars />
      <rect x={680} y={300} width={110} height={1400} fill="#141212" stroke={INK} strokeWidth={5} />
      <rect x={wx - 14} y={wy - 60} width={30} height={70} rx={6} fill="#c9a54a" stroke={INK} strokeWidth={3} />
      {blow > 0 && Array.from({ length: 9 }, (_, i) => <circle key={i} cx={wx + i * 26} cy={wy - 70 - i * 46 * blow} r={18 + i * 12} fill="#f4f4f4" opacity={0.8 * blow * (1 - i / 10)} />)}
      {/* cord from the whistle lever to the hand */}
      <path d={`M ${wx} ${wy} L ${h[0]} ${h[1]}`} stroke="#d8c8a0" strokeWidth={5} />
      <rect x={-60} y={GY + 40} width={1200} height={1100} fill="#3a2a20" />
      <Figure x={fx} y={fy} s={ps} A1={A} A2={-30} colors={SMALLS} frame={frame} expression="determined"><StrawHat /></Figure>
    </g>
  );
};

// ---------- 10: dawn — Union gunners aim at the steamer; the lookout sees the white sheet and stops them ----------
export const SceneGuns: React.FC<SP> = ({ lt, frame }) => {
  const stop = lt > 1.5;
  const g1 = handAt(560, GY + 80, 1.0, -1, stop ? -20 : -60, 0);
  return (
    <g>
      <Sky top="#e89a6a" bottom="#f6dcae" sun={{ x: 880, y: 860, r: 70, color: "#fff0c0" }} />
      <Water y={880} frame={frame} c1="#6a8a9a" c2="#3a5a6a" crest="#fff0d0" />
      <Planter x={980} y={900} s={0.26} frame={frame} smoke={0.8} sheet={1} rebelFlag={0} />
      <rect x={-60} y={GY - 40} width={1200} height={120} fill="#3a2e28" stroke={INK} strokeWidth={4} />
      <rect x={-60} y={GY + 60} width={1200} height={1000} fill="#8a6a46" />
      {Array.from({ length: 14 }, (_, i) => <line key={i} x1={-60} x2={1140} y1={GY + 80 + i * 40} y2={GY + 80 + i * 40} stroke="#6e5234" strokeWidth={4} />)}
      <Cannon x={420} y={GY + 80} s={1.4} rot={-4} />
      <Figure x={590} y={GY + 80} s={1.0} facing={-1} A1={stop ? -20 : -60} A2={-40} colors={UNION} frame={frame} expression={stop ? "scared" : "determined"} />
      {/* lanyard from the cannon to the gunner's hand */}
      <path d={`M 300 ${GY - 10} Q ${(300 + g1[0]) / 2} ${GY + (stop ? 60 : 10)} ${g1[0]} ${g1[1]}`} stroke="#d8c8a0" strokeWidth={4} fill="none" />
      <Figure x={860} y={GY + 80} s={1.0} facing={stop ? -1 : 1} A1={stop ? -150 : -90} A2={-80} colors={UCAPT} frame={frame} expression="scared" />
      {!stop && (() => { const h = handAt(860, GY + 80, 1, 1, -90, 0); return <g transform={`translate(${h[0]} ${h[1]})`}><rect x={-20} y={-10} width={110} height={20} rx={5} fill="#c9a54a" stroke={INK} strokeWidth={3} /></g>; })()}
      <Label x={540} y={720} lt={lt} at={0.2} text="USS ONWARD" size={36} bg="#1f3a8a" />
      {stop && <Label x={760} y={880} lt={lt} at={1.55} text="HOLD FIRE!" size={44} bg="#b8282a" />}
    </g>
  );
};

// ---------- 11: close on the Planter's mast — a crewman hauls the white bedsheet up hand over hand ----------
export const SceneSheet: React.FC<SP> = ({ lt, frame }) => {
  const k = interpolate(lt, [0.2, 2.2], [0, 1], cl);
  const pull = Math.sin(lt * 9);
  const mx = 640;
  const sheetTop = 1000 - k * 620;
  const fx = 520, fy = GY + 60;
  const A1 = -150 + pull * 18, A2 = -150 - pull * 18;
  const h1 = handAt(fx, fy, 1.1, 1, A1, 0), h2 = handAt(fx, fy, 1.1, 1, A2, 0);
  const wave = Math.sin(frame * 0.3) * 10;
  return (
    <g>
      <Sky top="#f0b080" bottom="#f8e4c0" />
      <Water y={1100} frame={frame} c1="#6a8a9a" c2="#3a5a6a" crest="#fff0d0" />
      <rect x={mx - 14} y={120} width={28} height={1300} fill="#5a3a20" stroke={INK} strokeWidth={4} />
      {/* halyard: top block → sheet → hands */}
      <line x1={mx + 18} y1={140} x2={mx + 18} y2={Math.min(h1[1], h2[1])} stroke="#d8c8a0" strokeWidth={4} />
      <path d={`M ${mx + 18} ${Math.min(h1[1], h2[1])} L ${h1[0]} ${h1[1]} M ${mx + 18} ${Math.min(h1[1], h2[1])} L ${h2[0]} ${h2[1]}`} stroke="#d8c8a0" strokeWidth={4} />
      <path d={`M ${mx + 14} ${sheetTop} Q ${mx + 150} ${sheetTop - 20 + wave} ${mx + 300} ${sheetTop} L ${mx + 300} ${sheetTop + 200} Q ${mx + 150} ${sheetTop + 180 + wave} ${mx + 14} ${sheetTop + 200} Z`} fill="#f8f6f0" stroke={INK} strokeWidth={5} />
      <rect x={-60} y={GY + 60} width={1200} height={1000} fill="#5a4432" />
      <Figure x={fx} y={fy} s={1.1} A1={A1} A2={A2} colors={CREW1} frame={frame} expression="determined" />
      <Label x={360} y={700} lt={lt} at={0.8} text="A WHITE BEDSHEET" size={38} />
    </g>
  );
};

// ---------- 12: the handover — the Union captain steps aboard, Smalls takes off the hat and shakes his hand ----------
export const SceneHandover: React.FC<SP> = ({ lt, frame }) => {
  const ck = interpolate(lt, [0, 1.0], [0, 1], cl);
  const cx = 900 - ck * 260;
  const shake = lt > 1.1;
  const hatOff = lt > 0.5;
  const sx = 420;
  const hs = handAt(sx, GY + 60, 1.0, 1, -20, 0);
  return (
    <g>
      <Sky top="#8fc0dc" bottom="#f0e6c8" clouds={2} drift={lt} />
      <Water y={900} frame={frame} c1="#4f7f8a" c2="#2e5560" />
      <Gunboat x={760} y={960} s={0.55} frame={frame} />
      <rect x={-60} y={GY - 60} width={1200} height={120} fill="#3a3532" stroke={INK} strokeWidth={4} />
      <rect x={-60} y={GY + 40} width={1200} height={1000} fill="#8a6440" />
      {/* family behind */}
      <g><Figure x={150} y={GY + 40} s={0.8} A1={-40} A2={-20} colors={HANNAH} frame={frame} expression="happy"><Headwrap /></Figure><Skirt x={150} y={GY + 40} s={0.8} color="#7a3a4a" shade="#5e2c38" /></g>
      <Figure x={250} y={GY + 40} s={0.5} colors={CHILD} frame={frame} A1={-30} A2={0} expression="happy" />
      <Figure x={sx} y={GY + 60} s={1.0} A1={shake ? -78 + Math.sin(lt * 18) * 5 : -40} A2={hatOff ? -20 : -10} colors={SMALLS} frame={frame} expression="happy">{hatOff ? null : <StrawHat />}</Figure>
      {hatOff && <LooseHat x={hs[0] + 4} y={hs[1] + 24} s={0.8} rot={80} />}
      <Figure x={cx} y={GY + 60} s={1.0} facing={-1} A1={shake ? -78 + Math.sin(lt * 18) * 5 : undefined} A2={shake ? -10 : undefined} walking={ck < 1} colors={UCAPT} frame={frame} expression="happy" />
      {shake && <Label x={540} y={660} lt={lt} at={1.2} text="FREE" size={90} bg="#1f5a2a" />}
    </g>
  );
};

// ---------- 13: years later — Smalls in a black suit climbs the Capitol steps ----------
export const SceneCapitol: React.FC<SP> = ({ lt, frame }) => {
  const k = interpolate(lt, [0, 2.4], [0, 1], cl);
  const x = 260 + k * 300, y = GY + 120 - k * 120;
  return (
    <g>
      <Sky top="#7ab0d8" bottom="#e8eef0" clouds={3} drift={lt} />
      {/* Capitol dome */}
      <g transform="translate(540 820)">
        <rect x={-460} y={-60} width={920} height={220} fill="#f2efe6" stroke={INK} strokeWidth={4} />
        {Array.from({ length: 14 }, (_, i) => <rect key={i} x={-430 + i * 64} y={-40} width={18} height={180} fill="#d8d4c8" />)}
        <rect x={-170} y={-200} width={340} height={140} fill="#f2efe6" stroke={INK} strokeWidth={4} />
        {Array.from({ length: 9 }, (_, i) => <rect key={i} x={-150 + i * 37} y={-190} width={12} height={120} fill="#d8d4c8" />)}
        <path d="M -150 -200 Q 0 -460 150 -200 Z" fill="#f6f3ea" stroke={INK} strokeWidth={4} />
        <rect x={-24} y={-480} width={48} height={60} fill="#f2efe6" stroke={INK} strokeWidth={3} />
        <circle cx={0} cy={-492} r={12} fill="#8a7a5a" />
      </g>
      {/* steps */}
      {Array.from({ length: 10 }, (_, i) => <rect key={i} x={-60} y={980 + i * 30} width={1200} height={30} fill={i % 2 ? "#e2ddd0" : "#ecE8dc"} stroke="#c8c2b4" strokeWidth={2} />)}
      <rect x={-60} y={1280} width={1200} height={1000} fill="#d8d2c4" />
      <Figure x={x} y={y} s={0.95} colors={SMALLS_LATER} frame={frame} walking={k < 1} A1={k >= 1 ? -10 : undefined} A2={k >= 1 ? 6 : undefined} expression="determined" />
      <Figure x={880} y={GY + 40} s={0.85} facing={-1} colors={TOWNSF} frame={frame} A1={k > 0.7 ? -70 : -6} A2={4} expression="happy" />
      <Label x={540} y={560} lt={lt} at={0.3} text="U.S. CONGRESS" size={44} bg="#1f3a8a" />
    </g>
  );
};

// ---------- 14: Beaufort — Smalls unlocks the door of the house where he was once enslaved ----------
export const SceneHouse: React.FC<SP> = ({ lt, frame }) => {
  const k = interpolate(lt, [0, 1.2], [0, 1], cl);
  const x = 200 + k * 300;
  const turn = lt > 1.3;
  const door = interpolate(lt, [1.6, 2.2], [0, 1], cl);
  const hx = handAt(x, GY + 60, 0.95, 1, turn ? -82 : -10, 0);
  return (
    <g>
      <Sky top="#8ec4e0" bottom="#f4ecd2" sun={{ x: 900, y: 260, r: 60, color: "#fff2c4" }} />
      {/* live oaks */}
      {[80, 1000].map((tx, i) => <g key={i}><rect x={tx - 20} y={600} width={40} height={600} fill="#4a3a28" /><ellipse cx={tx} cy={560} rx={200} ry={140} fill="#4a6a3a" /></g>)}
      {/* two-storey house with porches */}
      <g transform="translate(640 0)">
        <path d="M -330 420 L 0 260 L 330 420 Z" fill="#6a5a50" stroke={INK} strokeWidth={4} />
        <rect x={-300} y={420} width={600} height={800} fill="#f2ede0" stroke={INK} strokeWidth={4} />
        <rect x={-320} y={760} width={640} height={20} fill="#d8d0bc" stroke={INK} strokeWidth={3} />
        {[-280, -140, 0, 140, 280].map((cx) => <rect key={cx} x={cx - 10} y={440} width={20} height={780} fill="#fbf8f0" stroke={INK} strokeWidth={2} />)}
        {[-210, 70, 210].map((wx) => <rect key={wx} x={wx - 40} y={500} width={80} height={140} fill="#5a7a8a" stroke={INK} strokeWidth={3} />)}
        {[-210, 210].map((wx) => <rect key={`d${wx}`} x={wx - 40} y={880} width={80} height={140} fill="#5a7a8a" stroke={INK} strokeWidth={3} />)}
        <rect x={-130} y={940} width={120} height={240} fill="#1a1410" />
        <g transform={`translate(-130 940) scale(${1 - door * 0.85} 1)`}><rect width={120} height={240} fill="#4a2e1c" stroke={INK} strokeWidth={4} /><circle cx={100} cy={130} r={7} fill="#c9a54a" /></g>
      </g>
      <rect x={-60} y={GY + 60} width={1200} height={1000} fill="#b8a888" />
      <Figure x={x} y={GY + 60} s={0.95} colors={SMALLS_LATER} frame={frame} walking={k < 1} A1={k >= 1 ? (turn ? -82 : -10) : undefined} A2={k >= 1 ? 6 : undefined} expression={door > 0.5 ? "happy" : "determined"} />
      {turn && door < 1 && <g transform={`translate(${hx[0]} ${hx[1]}) rotate(${interpolate(lt, [1.3, 1.6], [0, 80], cl)})`}><rect x={0} y={-4} width={40} height={8} fill="#c9a54a" /><circle cx={0} cy={0} r={8} fill="none" stroke="#c9a54a" strokeWidth={4} /></g>}
      <Label x={540} y={1380 - 130} lt={lt} at={0.3} text="BEAUFORT, S.C." size={40} />
    </g>
  );
};
export const _unused = [Sky];
