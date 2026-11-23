import React from "react";
import { interpolate, Easing } from "remotion";
import { Sky } from "./ponyScenes";
import { Label } from "./chickenScenes";
import { handAt } from "./madridScenes";
import { Figure, Smoke } from "./pirateScenes";
import { KitColors } from "../kit/Kit";

/**
 * Ground scenes for "America Strapped Bombs to Bats" (the WWII bat bomb, Lytle Adams 1942 → Carlsbad Army Airfield 1943 → Navy Project X-Ray).
 * lt = seconds since the scene started. Kit side pose: feet at (0,0), shoulder pivot (0,-284), straight-arm hand = handAt().
 * Arm angle: 0 = hanging, -90 = forward, -170 = straight up. Scenes are drawn at GY and shifted −130 px by the story.
 * Storyboard: social/scripts/bat-bomb-2026-11-23.md.
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
const mix = (a: V2, b: V2, k: number): V2 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];

// ---------- people (1942–43) ----------
const OD = "#5f5a3a", ODS = "#4a462c", ODL = "#716b48";
/** Army private, olive drab, garrison-style cap */
export const GI: Partial<KitColors> = { coat: OD, coatShade: ODS, coatLight: ODL, patch: ODL, scarf: "#b8a878", scarfShade: "#988858", trousers: "#6a6040", trousersShade: "#544c32", button: "#a8904a", cap: "#5a5436", capShade: "#46422a", capBand: "#3a3622", hair: "#5a3a20" };
const GI2: Partial<KitColors> = { ...GI, skin: "#c99a78", skinShade: "#a87a5a", hair: "#2a1a10", cap: "#5a5436" };
const GENERAL: Partial<KitColors> = { ...GI, coat: "#5a4a34", coatShade: "#463a28", coatLight: "#6a5a42", patch: "#6a5a42", trousers: "#8a7a5a", trousersShade: "#6e6046", cap: "#4a3e2c", capShade: "#3a3022", capBand: "#2a2218", hair: "#9a9a9a", button: "#d6b04a" };
/** Lytle Adams: dentist's white coat; later a brown suit */
const ADAMS_COAT: Partial<KitColors> = { coat: "#eeeeea", coatShade: "#cfcfc8", coatLight: "#ffffff", patch: "#ffffff", scarf: "#3a4a6a", scarfShade: "#2a3650", trousers: "#4a4440", trousersShade: "#3a3430", button: "#cfcfc8", hair: "#8a7a6a", hairLight: "#a89a8a", capStyle: "hair" } as Partial<KitColors>;
const ADAMS_SUIT: Partial<KitColors> = { ...ADAMS_COAT, coat: "#6a5440", coatShade: "#54422f", coatLight: "#7a6450", patch: "#7a6450", button: "#3a2a1e" };
const FDR: Partial<KitColors> = { coat: "#2c2e36", coatShade: "#1e2026", coatLight: "#3a3c44", patch: "#3a3c44", scarf: "#efefe8", scarfShade: "#cfcfc8", trousers: "#2c2e36", trousersShade: "#1e2026", button: "#2c2e36", hair: "#8a8a88", hairLight: "#aaaaa8", capStyle: "hair" } as Partial<KitColors>;
const ADMIRAL: Partial<KitColors> = { coat: "#1c2340", coatShade: "#141a30", coatLight: "#28305a", patch: "#28305a", scarf: "#efefe8", scarfShade: "#cfcfc8", trousers: "#1c2340", trousersShade: "#141a30", button: "#d6b04a", cap: "#1c2340", capShade: "#141a30", capBand: "#d6b04a", hair: "#b0b0b0" };

const Glasses: React.FC = () => (
  <g fill="none" stroke={INK} strokeWidth={4}><circle cx={34} cy={-334} r={15} /><line x1={19} y1={-336} x2={-14} y2={-340} /></g>
);
const GenStar: React.FC = () => <path d="M 8 -402 l 5 10 l 11 1 l -8 7 l 3 11 l -11 -6 l -10 6 l 3 -11 l -8 -7 l 11 -1 Z" fill="#f2d24a" stroke={INK} strokeWidth={2} />;

// ---------- bats ----------
/** Mexican free-tailed bat, facing right. (x,y) = body centre. flap 0..1 wing phase; asleep folds wings and shuts eyes; bomb clips a capsule to the chest. */
export const Bat: React.FC<{ x: number; y: number; s?: number; flap?: number; asleep?: boolean; bomb?: boolean; timer?: number; flip?: boolean; rot?: number; eyes?: number }> = ({ x, y, s = 1, flap = 0.5, asleep, bomb, timer, flip, rot = 0, eyes = 1 }) => {
  const w = asleep ? 0 : Math.sin(flap * Math.PI * 2);
  const wy = -40 * w, spread = asleep ? 0.25 : 1;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip ? -s : s} ${s})`}>
      {/* wings */}
      <path d={`M -6 -6 Q ${-40 * spread} ${-30 + wy} ${-78 * spread} ${-8 + wy * 1.2} Q ${-60 * spread} ${2 + wy * 0.6} ${-52 * spread} ${14 + wy * 0.4} Q ${-30 * spread} ${6} -8 10 Z`} fill="#3a2e2a" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <path d={`M 6 -6 Q ${40 * spread} ${-30 + wy} ${78 * spread} ${-8 + wy * 1.2} Q ${60 * spread} ${2 + wy * 0.6} ${52 * spread} ${14 + wy * 0.4} Q ${30 * spread} ${6} 8 10 Z`} fill="#4a3c36" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      {/* body + tail */}
      <path d="M -10 14 Q -22 30 -30 34" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
      <ellipse cx={0} cy={4} rx={16} ry={20} fill="#6a5448" stroke={INK} strokeWidth={3} />
      {/* head + ears */}
      <path d="M 6 -24 L 4 -42 L 16 -28 Z M 18 -24 L 24 -40 L 26 -22 Z" fill="#6a5448" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
      <ellipse cx={16} cy={-16} rx={14} ry={12} fill="#7a6254" stroke={INK} strokeWidth={3} />
      <ellipse cx={29} cy={-14} rx={6} ry={4.5} fill="#5a4438" stroke={INK} strokeWidth={2} />
      {asleep || eyes < 0.5 ? <path d="M 16 -19 q 4 3 8 0" stroke={INK} strokeWidth={2.5} fill="none" strokeLinecap="round" /> : <g><circle cx={20} cy={-19} r={3.6 * eyes} fill="#111" /><circle cx={21} cy={-20} r={1.2} fill="#fff" /></g>}
      {bomb && <g>
        <rect x={-10} y={0} width={22} height={30} rx={8} fill="#b8b4a4" stroke={INK} strokeWidth={2.5} />
        <rect x={-10} y={10} width={22} height={5} fill="#c0392b" />
        <path d="M 0 -4 L 0 4" stroke="#8a8a8a" strokeWidth={3} />
        {timer !== undefined && <g><circle cx={1} cy={23} r={5} fill="#fff" stroke={INK} strokeWidth={1.5} /><line x1={1} y1={23} x2={1 + 4 * Math.sin(timer * Math.PI * 2)} y2={23 - 4 * Math.cos(timer * Math.PI * 2)} stroke="#c0392b" strokeWidth={1.5} /></g>}
      </g>}
    </g>
  );
};
/** a swarm flying along a direction; k = progress 0..1 */
const Swarm: React.FC<{ n: number; from: V2; to: V2; k: number; frame: number; s?: number; spread?: number; seed?: number; bombs?: boolean; stagger?: number }> = ({ n, from, to, k, frame, s = 0.5, spread = 160, seed = 0, bombs, stagger = 0.4 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const kk = Math.max(0, Math.min(1, (k - rnd(seed + i) * stagger) / (1 - stagger)));
      if (kk <= 0) return null;
      const p = mix(from, to, kk);
      const ox = (rnd(seed + i + 31) - 0.5) * spread, oy = (rnd(seed + i + 57) - 0.5) * spread + Math.sin(frame * 0.3 + i) * 10;
      return <Bat key={i} x={p[0] + ox * kk} y={p[1] + oy * kk} s={s * (0.8 + rnd(seed + i + 9) * 0.4)} flap={(frame * 0.14 + rnd(seed + i)) % 1} flip={to[0] < from[0]} bomb={bombs} />;
    })}
  </g>
);

// ---------- props ----------
const Flames: React.FC<{ x: number; y: number; w: number; h: number; frame: number; k?: number; seed?: number }> = ({ x, y, w, h, frame, k = 1, seed = 0 }) => k <= 0 ? null : (
  <g transform={`translate(${x} ${y})`}>
    {Array.from({ length: 7 }, (_, i) => {
      const fx = -w / 2 + (i + 0.5) * (w / 7), hh = h * k * (0.6 + 0.4 * Math.abs(Math.sin(frame * 0.35 + i * 1.7 + seed)));
      return <g key={i}>
        <path d={`M ${fx - w / 9} 0 Q ${fx - w / 14} ${-hh * 0.6} ${fx} ${-hh} Q ${fx + w / 14} ${-hh * 0.6} ${fx + w / 9} 0 Z`} fill="#ff7a1a" stroke={INK} strokeWidth={2} />
        <path d={`M ${fx - w / 18} 0 Q ${fx - w / 30} ${-hh * 0.4} ${fx} ${-hh * 0.62} Q ${fx + w / 30} ${-hh * 0.4} ${fx + w / 18} 0 Z`} fill="#ffd34a" />
      </g>;
    })}
  </g>
);
/** arched (Quonset-style) hangar; (x,y) = centre of the floor line */
const Hangar: React.FC<{ x: number; y: number; s?: number; night?: boolean }> = ({ x, y, s = 1, night }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -420 0 L -420 -150 Q 0 -420 420 -150 L 420 0 Z" fill={night ? "#3a3c40" : "#9aa0a2"} stroke={INK} strokeWidth={6} />
    {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M ${-360 + i * 90} ${-160 - Math.sin(((i + 0.5) / 9) * Math.PI) * 150} L ${-360 + i * 90} 0`} stroke={night ? "#2a2c30" : "#7c8284"} strokeWidth={4} />)}
    <rect x={-240} y={-190} width={480} height={190} fill={night ? "#141518" : "#2a2c2e"} stroke={INK} strokeWidth={5} />
    <rect x={-230} y={-180} width={230} height={180} fill={night ? "#1e2024" : "#5a6062"} />
    <rect x={0} y={-180} width={230} height={180} fill={night ? "#22242a" : "#646a6c"} />
      </g>
);
const Desk: React.FC<{ x: number; y: number; w?: number; color?: string }> = ({ x, y, w = 520, color = "#6a4428" }) => (
  <g>
    <rect x={x - w / 2} y={y} width={w} height={26} fill="#8a5a34" stroke={INK} strokeWidth={4} />
    <rect x={x - w / 2 + 14} y={y + 26} width={w - 28} height={260} fill={color} stroke={INK} strokeWidth={4} />
    {[0, 1, 2].map((i) => <rect key={i} x={x + w / 2 - 170} y={y + 46 + i * 76} width={130} height={56} fill="#7a5034" stroke={INK} strokeWidth={3} />)}
  </g>
);
const Paper: React.FC<{ x: number; y: number; w?: number; h?: number; rot?: number; lines?: number; text?: string; stamp?: { text: string; k: number; color: string } }> = ({ x, y, w = 150, h = 100, rot = 0, lines = 4, text, stamp }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#f6f0dc" stroke={INK} strokeWidth={3} />
    {text ? <text y={-h / 2 + 30} textAnchor="middle" fontFamily="Courier New" fontWeight={700} fontSize={20} fill="#2a2a2a">{text}</text> : null}
    {Array.from({ length: lines }, (_, i) => <line key={i} x1={-w / 2 + 14} x2={w / 2 - 14 - (i % 2) * 30} y1={-h / 2 + (text ? 52 : 22) + i * 16} y2={-h / 2 + (text ? 52 : 22) + i * 16} stroke="#8a8478" strokeWidth={3} />)}
    {stamp && stamp.k > 0 && <g transform={`rotate(-14) scale(${1 + (1 - stamp.k) * 0.8})`} opacity={stamp.k}>
      <rect x={-w * 0.42} y={-22} width={w * 0.84} height={44} rx={6} fill="none" stroke={stamp.color} strokeWidth={5} />
      <text y={12} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={30} fill={stamp.color}>{stamp.text}</text>
    </g>}
  </g>
);
const Stamp: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}><rect x={-22} y={-6} width={44} height={14} rx={3} fill="#3a2a1e" stroke={INK} strokeWidth={3} /><rect x={-7} y={-46} width={14} height={40} fill="#6a4428" stroke={INK} strokeWidth={3} /><circle cy={-52} r={14} fill="#2a1a10" stroke={INK} strokeWidth={3} /></g>
);
const Wall: React.FC<{ color: string; floor: string; y?: number }> = ({ color, floor, y = GY + 60 }) => (
  <g><rect x={-60} y={0} width={1200} height={y} fill={color} /><rect x={-60} y={y} width={1200} height={1200} fill={floor} /><rect x={-60} y={y - 14} width={1200} height={16} fill="#3a2a1e" opacity={0.6} /></g>
);
const Window: React.FC<{ x: number; y: number; w: number; h: number; sky: string; children?: React.ReactNode }> = ({ x, y, w, h, sky, children }) => (
  <g>
    <defs><clipPath id={`win${x}${y}`}><rect x={x} y={y} width={w} height={h} /></clipPath></defs>
    <rect x={x} y={y} width={w} height={h} fill={sky} />
    <g clipPath={`url(#win${x}${y})`}>{children}</g>
    <rect x={x} y={y} width={w} height={h} fill="none" stroke="#5a3a20" strokeWidth={14} />
    <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke="#5a3a20" strokeWidth={8} />
    <line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} stroke="#5a3a20" strokeWidth={8} />
  </g>
);
/** wooden tray with sleeping bats in rows (ice-cube-tray style) */
const Tray: React.FC<{ x: number; y: number; w?: number; n?: number; asleep?: boolean; frost?: number; rot?: number; bombs?: boolean; frame?: number }> = ({ x, y, w = 240, n = 4, asleep = true, frost = 0, rot = 0, bombs, frame = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    {Array.from({ length: n }, (_, i) => <Bat key={i} x={-w / 2 + (i + 0.5) * (w / n)} y={-18} s={0.42} asleep={asleep} bomb={bombs} flap={(frame * 0.15 + i * 0.3) % 1} />)}
    <rect x={-w / 2} y={-6} width={w} height={22} fill="#9a7a54" stroke={INK} strokeWidth={3} />
    {Array.from({ length: n - 1 }, (_, i) => <line key={i} x1={-w / 2 + (i + 1) * (w / n)} x2={-w / 2 + (i + 1) * (w / n)} y1={-6} y2={16} stroke={INK} strokeWidth={2} />)}
    {frost > 0 && <rect x={-w / 2} y={-40} width={w} height={56} fill="#dff2ff" opacity={0.35 * frost} />}
  </g>
);
const Bomber: React.FC<{ x: number; y: number; s?: number; bay?: number }> = ({ x, y, s = 1, bay = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -300 -10 Q -320 -40 -280 -44 L 260 -40 Q 330 -30 330 0 Q 320 26 260 28 L -260 24 Z" fill="#7c8070" stroke={INK} strokeWidth={5} />
    <path d="M -260 -40 L -300 -130 L -250 -130 L -200 -40 Z" fill="#6a6e60" stroke={INK} strokeWidth={4} />
    <path d="M -40 -20 L 120 -20 L 60 -200 L 10 -200 Z" fill="#6a6e60" stroke={INK} strokeWidth={4} opacity={0.6} />
    <path d="M -60 6 L 140 6 L 220 120 L 160 120 Z" fill="#6a6e60" stroke={INK} strokeWidth={4} />
    {[100, 180].map((ex) => <g key={ex}><ellipse cx={ex - 20 + 40} cy={36 + (ex - 100) * 0.5} rx={34} ry={16} fill="#4a4e44" stroke={INK} strokeWidth={3} /></g>)}
    <path d="M 270 -30 Q 320 -24 326 -4 L 280 -4 Z" fill="#a8c4d8" stroke={INK} strokeWidth={3} />
    <circle cx={-60} cy={-10} r={22} fill="#fff" stroke={INK} strokeWidth={3} /><path d="M -60 -26 l 4 12 l 13 0 l -10 8 l 4 12 l -11 -7 l -11 7 l 4 -12 l -10 -8 l 13 0 Z" fill="#1f3a8a" />
    <rect x={-20} y={22} width={110} height={8 + bay * 16} fill="#1a1a1a" stroke={INK} strokeWidth={3} />
  </g>
);
/** bomb-shaped case; open 0..1 splits it and spills trays */
const Case: React.FC<{ x: number; y: number; s?: number; open?: number; chute?: number; frame: number }> = ({ x, y, s = 1, open = 0, chute = 0, frame }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {chute > 0 && <g opacity={Math.min(1, chute * 2)}>
      <path d={`M ${-150 * chute} -260 Q 0 ${-420 * chute - 40} ${150 * chute} -260 Q 0 -300 ${-150 * chute} -260 Z`} fill="#efe6d0" stroke={INK} strokeWidth={4} />
      {[-150, -50, 50, 150].map((cx) => <line key={cx} x1={cx * chute} y1={-262} x2={0} y2={-80} stroke={INK} strokeWidth={2.5} />)}
    </g>}
    <g transform={`translate(${-open * 60} 0) rotate(${-open * 25})`}><path d="M 0 -80 Q -60 -70 -60 0 Q -60 80 0 100 Z" fill="#6a6e60" stroke={INK} strokeWidth={4} /></g>
    <g transform={`translate(${open * 60} 0) rotate(${open * 25})`}><path d="M 0 -80 Q 60 -70 60 0 Q 60 80 0 100 Z" fill="#7c8070" stroke={INK} strokeWidth={4} /><path d="M 0 100 L 30 140 L -30 140 Z" fill="#5a5e52" stroke={INK} strokeWidth={3} /></g>
    {open > 0.2 && Array.from({ length: 4 }, (_, i) => <Tray key={i} x={(i - 1.5) * 40 * open} y={-50 + i * 40 + open * 30} w={90} n={2} rot={(i - 1.5) * 10 * open} asleep={open < 0.7} frame={frame} />)}
  </g>
);
/** 1940s wooden houses with tiled roofs (night) */
const Houses: React.FC<{ y: number }> = ({ y }) => (
  <g>
    {[[-40, 300, 220], [250, 260, 260], [500, 320, 210], [810, 300, 240]].map(([x, w, h], i) => (
      <g key={i}>
        <rect x={x + 20} y={y - h} width={w - 40} height={h} fill="#5a4030" stroke={INK} strokeWidth={4} />
        {Array.from({ length: Math.floor((w - 40) / 40) }, (_, j) => <line key={j} x1={x + 40 + j * 40} x2={x + 40 + j * 40} y1={y - h} y2={y} stroke="#4a3426" strokeWidth={3} />)}
        <rect x={x + w / 2 - 40} y={y - h + 60} width={80} height={60} fill="#e8c878" opacity={0.6} stroke={INK} strokeWidth={3} />
        <path d={`M ${x - 10} ${y - h} Q ${x + w / 2} ${y - h - 30} ${x + w + 10} ${y - h} L ${x + w - 30} ${y - h - 90} Q ${x + w / 2} ${y - h - 110} ${x + 30} ${y - h - 90} Z`} fill="#2e3036" stroke={INK} strokeWidth={4} />
        <path d={`M ${x - 10} ${y - h} Q ${x + w / 2} ${y - h - 30} ${x + w + 10} ${y - h}`} stroke="#1a1c20" strokeWidth={10} fill="none" />
      </g>
    ))}
  </g>
);
const Icebox: React.FC<{ x: number; y: number; door: number }> = ({ x, y, door }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-150} y={-460} width={300} height={460} rx={18} fill="#e8e4d8" stroke={INK} strokeWidth={5} />
    <rect x={-130} y={-440} width={260} height={420} fill="#bcd8e8" />
    {[-330, -200].map((sy) => <line key={sy} x1={-130} x2={130} y1={sy} y2={sy} stroke="#8aa8b8" strokeWidth={6} />)}
    {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={-110 + rnd(i) * 220} cy={-420 + rnd(i + 5) * 380} r={3} fill="#fff" opacity={0.8} />)}
    {/* door hinged on the right edge, swings toward the camera */}
    <g transform={`translate(150 0) scale(${Math.cos(door * 1.35)} 1)`}>
      <rect x={-300} y={-460} width={300} height={460} rx={18} fill="#efebe0" stroke={INK} strokeWidth={5} />
      <rect x={-280} y={-280} width={16} height={80} rx={6} fill="#9a9a9a" stroke={INK} strokeWidth={3} />
      <text x={-150} y={-380} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={30} fill="#5a6a7a">40°F</text>
    </g>
  </g>
);
const StaffCar: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -260 -40 L -250 -110 Q -200 -120 -150 -120 L -110 -190 L 120 -190 L 160 -120 Q 250 -116 270 -80 L 270 -40 Z" fill="#4a4a32" stroke={INK} strokeWidth={5} />
    <path d="M -96 -180 L -60 -126 L 30 -126 L 30 -180 Z M 48 -180 L 48 -126 L 140 -126 L 112 -180 Z" fill="#9ab4c4" stroke={INK} strokeWidth={3} />
    <rect x={-270} y={-60} width={30} height={20} fill="#c0392b" stroke={INK} strokeWidth={2} /><path d="M -255 -58 l 3 6 l 6 0 l -5 4 l 2 6 l -6 -4 l -6 4 l 2 -6 l -5 -4 l 6 0 Z" fill="#fff" />
    <circle cx={-160} cy={-36} r={44} fill="#1a1a1a" stroke={INK} strokeWidth={4} /><circle cx={-160} cy={-36} r={16} fill="#8a8a7a" />
    <circle cx={170} cy={-36} r={44} fill="#1a1a1a" stroke={INK} strokeWidth={4} /><circle cx={170} cy={-36} r={16} fill="#8a8a7a" />
    <circle cx={60} cy={-150} r={0} />
  </g>
);
const Calendar: React.FC<{ x: number; y: number; year: string; flip: number }> = ({ x, y, year, flip }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle cy={-20} r={8} fill="#5a5a5a" stroke={INK} strokeWidth={3} />
    <rect x={-150} y={0} width={300} height={360} fill="#f6f0dc" stroke={INK} strokeWidth={4} />
    <rect x={-150} y={0} width={300} height={70} fill="#b5432a" stroke={INK} strokeWidth={4} />
    <text y={52} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={48} fill="#fff">{year}</text>
    {Array.from({ length: 20 }, (_, i) => <rect key={i} x={-130 + (i % 5) * 54} y={96 + Math.floor(i / 5) * 62} width={40} height={40} fill="none" stroke="#b8b0a0" strokeWidth={3} />)}
    {flip > 0 && <g transform={`translate(0 0) scale(1 ${1 - flip})`}><rect x={-150} y={0} width={300} height={360} fill="#ebe4cc" stroke={INK} strokeWidth={4} /></g>}
  </g>
);
const DentalChair: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-20} y={-160} width={40} height={160} fill="#8a8a8a" stroke={INK} strokeWidth={4} />
    <path d="M -160 -170 L 120 -170 L 170 -300 L 140 -310 L 100 -200 L -160 -200 Z" fill="#3a6a6a" stroke={INK} strokeWidth={4} />
    <line x1={140} y1={-300} x2={140} y2={-560} stroke="#7a7a7a" strokeWidth={10} />
    <line x1={140} y1={-560} x2={-40} y2={-520} stroke="#7a7a7a" strokeWidth={8} />
    <circle cx={-40} cy={-520} r={30} fill="#f2e8b8" stroke={INK} strokeWidth={4} />
  </g>
);

// ---------- 1 + LOOP: a soldier holds a live bat with a capsule clipped to its chest ----------
/** u = 0 is frame 0. The loop runs u from negative up to 0. The capsule is clipped at u = −0.5. */
export const SceneHook: React.FC<SP & { u0?: number }> = ({ lt, frame, u0 = 0 }) => {
  const u = lt + u0;
  const push = 1.0 + Math.max(0, Math.min(3.2, u)) * 0.025;
  const sx = 250, sy = GY + 430, ps = 2.3;
  const A1 = -70, h1 = handAt(sx, sy, ps, 1, A1, 0);
  const clipK = interpolate(u, [-2.4, -0.5], [0, 1], cl);
  const A2 = lerpA(clipK, [[0, -20], [1, -62]]);
  const h2 = handAt(sx, sy, ps, 1, A2, 0);
  const bat: V2 = [h1[0] + 110, h1[1] - 80];
  const squirm = Math.sin(frame * 0.5) * (u > -0.5 ? 6 : 2);
  const capsule = clipK < 1 ? mix([h2[0] + 10, h2[1] - 30], [bat[0] - 28 * 0.0 + 2 * 2.8 - 15, bat[1] + 0], clipK) : null;
  return (
    <g transform={`translate(540 1000) scale(${push}) translate(-540 -1000)`}>
      <rect x={-60} y={0} width={1200} height={2300} fill="#6a6c5e" />
      {Array.from({ length: 14 }, (_, i) => <rect key={i} x={-60 + i * 90} y={0} width={44} height={GY + 140} fill="#5e6052" />)}
      <Window x={620} y={300} w={380} h={300} sky="#e8b878">
        <rect x={600} y={520} width={420} height={100} fill="#c89a62" />
        <path d="M 600 540 L 700 470 L 800 530 L 900 460 L 1020 520 L 1020 560 L 600 560 Z" fill="#a8784a" />
      </Window>
      <rect x={-60} y={GY + 140} width={1200} height={900} fill="#4a4436" />
      <Figure x={sx} y={sy} s={ps} A1={A1} A2={A2} colors={GI} frame={frame} expression="determined" />
      {/* bat held at the near hand: fingers wrap the body */}
      <Bat x={bat[0]} y={bat[1] + squirm * 0.3} s={2.8} flap={(frame * 0.12) % 1} bomb={clipK >= 1} rot={squirm} />
      <circle cx={h1[0] + 50} cy={h1[1] - 40} r={26} fill="#d39a73" stroke={INK} strokeWidth={3} />
      {capsule && <g transform={`translate(${capsule[0]} ${capsule[1]}) scale(2.8)`}><rect x={-10} y={0} width={22} height={30} rx={8} fill="#b8b4a4" stroke={INK} strokeWidth={2.5} /><rect x={-10} y={10} width={22} height={5} fill="#c0392b" /></g>}
      <circle cx={capsule ? capsule[0] + 14 : h2[0]} cy={capsule ? capsule[1] - 6 : h2[1]} r={22} fill="#d39a73" stroke={INK} strokeWidth={3} />
    </g>
  );
};

// ---------- 2: the hangar burns at dusk, bats circling, a GI runs with a bucket ----------
export const SceneBaseFire: React.FC<SP> = ({ lt, frame }) => {
  const fk = interpolate(lt, [0, 1.2], [0.5, 1], cl);
  const rx = interpolate(lt, [0, 3.7], [880, 380], cl);
  return (
    <g>
      <Sky top="#3a2a4a" bottom="#e8945a" />
      <rect x={-60} y={980} width={1200} height={1400} fill="#b8925a" />
      <path d="M -60 980 L 200 930 L 420 970 L 700 920 L 1140 970 L 1140 990 L -60 990 Z" fill="#8a6a44" />
      <Smoke x={540} y={720} frame={frame} seed={3} n={14} h={600} k={fk} />
      <Hangar x={540} y={1150} s={0.95} />
      <Flames x={540} y={940} w={600} h={200} frame={frame} k={fk} />
      <Flames x={300} y={1150} w={160} h={170} frame={frame} k={fk * 0.8} seed={2} />
      {Array.from({ length: 9 }, (_, i) => { const a = frame * 0.05 + i * 0.7; return <Bat key={i} x={540 + Math.cos(a) * (300 + i * 20)} y={560 + Math.sin(a * 1.3) * 120} s={0.42} flap={(frame * 0.15 + i * 0.2) % 1} flip={Math.sin(a) > 0} />; })}
      {/* GI running left with a fire bucket: handle in the hand */}
      {(() => { const hx = handAt(rx, GY + 30, 0.7, -1, -30, 0); return <g>
        <Figure x={rx} y={GY + 30} s={0.7} facing={-1} A1={-30} A2={undefined} colors={GI} frame={frame} walking expression="scared" />
        <path d={`M ${hx[0] - 22} ${hx[1] + 8} L ${hx[0] - 18} ${hx[1] + 54} L ${hx[0] + 18} ${hx[1] + 54} L ${hx[0] + 22} ${hx[1] + 8} Z`} fill="#c0392b" stroke={INK} strokeWidth={3} />
        <path d={`M ${hx[0] - 22} ${hx[1] + 8} Q ${hx[0]} ${hx[1] - 14} ${hx[0] + 22} ${hx[1] + 8}`} stroke={INK} strokeWidth={3} fill="none" />
      </g>; })()}
      <Label x={540} y={1390} lt={lt} at={0.5} text="A US ARMY AIRFIELD" size={38} />
    </g>
  );
};

// ---------- 3: the dentist (Lytle Adams) checks an X-ray against the window light ----------
export const SceneDentist: React.FC<SP> = ({ lt, frame }) => {
  const sx = 420, sy = GY + 60, ps = 1.1;
  const A1 = lerpA(lt, [[0, -100], [1.3, -100], [1.7, -40]]);
  const A2 = -20;
  const h1 = handAt(sx, sy, ps, 1, A1, 0);
  const turn = lt > 1.4 ? -1 : 1;
  return (
    <g>
      <Wall color="#d8d4c0" floor="#a89a80" />
      <Window x={620} y={260} w={380} h={420} sky="#cfe4f0"><rect x={600} y={560} width={420} height={140} fill="#9a9a8a" /></Window>
      <DentalChair x={180} y={GY + 60} />
      <rect x={60} y={360} width={200} height={130} fill="#efe8d0" stroke={INK} strokeWidth={4} />
      <text x={160} y={410} textAnchor="middle" fontFamily="Georgia" fontWeight={700} fontSize={26} fill="#3a2a1e">DENTAL</text>
      <text x={160} y={448} textAnchor="middle" fontFamily="Georgia" fontWeight={700} fontSize={26} fill="#3a2a1e">SURGEON</text>
      <Figure x={sx} y={sy} s={ps} facing={turn as 1 | -1} A1={turn === 1 ? A1 : -30} A2={A2} colors={ADAMS_COAT} frame={frame} expression={lt > 1.4 ? "happy" : "neutral"} />
      {turn === 1 && <g transform={`translate(${h1[0] + 30} ${h1[1] - 60})`}>
        <rect x={-55} y={-70} width={110} height={140} fill="#1a2a34" stroke={INK} strokeWidth={3} opacity={0.85} />
        {[-24, 0, 24].map((dx) => <rect key={dx} x={dx - 8} y={-30} width={16} height={34} rx={6} fill="#dfeef4" opacity={0.85} />)}
      </g>}
      <Label x={540} y={1390} lt={lt} at={0.3} text="LYTLE ADAMS, DENTIST" size={40} />
    </g>
  );
};

const tipDeskY = (sx: number, sy: number, ps: number) => handAt(sx, sy, ps, 1, -62, 4)[1] + 52;
// ---------- 4: Adams writes to the White House and seals the envelope ----------
export const SceneLetter: React.FC<SP> = ({ lt, frame }) => {
  const sx = 330, sy = GY + 60, ps = 1.15;
  const writing = lt < 1.5;
  const lean = writing ? 4 + 12 * Math.min(1, lt / 1.5) : 16;
  const A1 = writing ? -62 + Math.sin(frame * 0.9) * 3 : lerpA(lt, [[1.5, -62], [2.0, -74]]);
  const h1 = handAt(sx, sy, ps, 1, A1, lean);
  const tip: V2 = [h1[0] + 34, h1[1] + 40];
  const x0 = handAt(sx, sy, ps, 1, -62, 4)[0] + 34;
    const env = interpolate(lt, [1.5, 2.1], [0, 1], cl);
  return (
    <g>
      <Wall color="#c8b48a" floor="#6a5038" />
      <Window x={640} y={240} w={340} h={360} sky="#7a8aa0"><rect x={600} y={500} width={400} height={120} fill="#e8e8e8" /></Window>
      <rect x={120} y={300} width={180} height={220} fill="#e8dcb8" stroke={INK} strokeWidth={4} />
      <text x={210} y={360} textAnchor="middle" fontFamily="Georgia" fontWeight={700} fontSize={34} fill="#3a2a1e">JAN</text>
      <text x={210} y={460} textAnchor="middle" fontFamily="Georgia" fontWeight={700} fontSize={70} fill="#b5432a">1942</text>
      <Figure x={sx} y={sy} s={ps} A1={A1} A2={-40} lean={lean} colors={ADAMS_SUIT} frame={frame} expression="determined" />
      <Desk x={700} y={tipDeskY(sx, sy, ps)} w={600} />
      {env < 1 ? <g>
        <rect x={x0 - 20} y={tip[1] - 12} width={220} height={24} fill="#f6f0dc" stroke={INK} strokeWidth={3} />
        {writing && <line x1={x0} y1={tip[1]} x2={tip[0]} y2={tip[1]} stroke="#1a2a6a" strokeWidth={4} />}
      </g> : null}
      {env > 0 && <g transform={`translate(${x0 + 100 + env * 20} ${tip[1] - 30 - env * 20}) rotate(${-6 * env})`}>
        <rect x={-110} y={-60} width={220} height={120} fill="#efe2c0" stroke={INK} strokeWidth={4} />
        <path d="M -110 -60 L 0 10 L 110 -60" stroke={INK} strokeWidth={3} fill="none" />
        <text y={40} textAnchor="middle" fontFamily="Courier New" fontWeight={700} fontSize={18} fill="#2a2a2a">THE WHITE HOUSE</text>
      </g>}
      {/* pen in the hand while writing */}
      {writing && <line x1={h1[0]} y1={h1[1]} x2={tip[0]} y2={tip[1]} stroke="#1a1a1a" strokeWidth={7} strokeLinecap="round" />}
      <circle cx={h1[0]} cy={h1[1]} r={14} fill="#eebf98" stroke={INK} strokeWidth={3} />
      <Label x={540} y={1390} lt={lt} at={0.2} text="A LETTER TO THE PRESIDENT" size={36} />
    </g>
  );
};

// ---------- 5: Roosevelt reads it and stamps APPROVED ----------
export const SceneFDR: React.FC<SP> = ({ lt, frame }) => {
  const sx = 640, sy = GY + 60, ps = 1.6;
  const stampDown = 1.0;
  const A1 = lerpA(lt, [[0, -100], [0.55, -100], [0.75, -60], [stampDown - 0.12, -76], [stampDown, -52], [stampDown + 0.3, -70]]);
  const A2 = lerpA(lt, [[0, -96], [0.55, -96], [0.7, -40]]);
  const deskY = handAt(sx, sy, ps, -1, -56, 0)[1] + 18;
  const h1 = handAt(sx, sy, ps, -1, A1, 0), h2 = handAt(sx, sy, ps, -1, A2, 0);
  const sk = interpolate(lt, [stampDown, stampDown + 0.12], [0, 1], cl);
  const paperY = lt < 0.6 ? h2[1] - 30 : deskY - 10;
  const paperX = lt < 0.6 ? h2[0] - 40 : 420;
  return (
    <g>
      <Wall color="#7a8a6a" floor="#5a4030" />
      <rect x={-60} y={250} width={1200} height={22} fill="#c9a54a" opacity={0.5} />
      <g transform="translate(860 300)"><rect x={-80} y={0} width={160} height={110} fill="#efe8d8" stroke={INK} strokeWidth={4} /><rect x={-80} y={0} width={64} height={60} fill="#1f3a8a" />{[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={-16} y={i * 18 + 6} width={96} height={9} fill="#b8282a" />)}</g>
      <Figure x={sx} y={sy} s={ps} facing={-1} A1={A1} A2={A2} colors={FDR} frame={frame} expression={lt > stampDown ? "happy" : "neutral"}><Glasses /></Figure>
      <Desk x={420} y={deskY} w={640} color="#5a3a24" />
      <Paper x={paperX} y={paperY} w={170} h={120} lines={5} rot={lt < 0.6 ? -8 : 0} stamp={{ text: "APPROVED", k: sk, color: "#2a7a3a" }} />
      <Stamp x={h1[0]} y={h1[1] + 10} />
      <Label x={540} y={1390} lt={lt} at={0.25} text="PRESIDENT ROOSEVELT" size={40} />
    </g>
  );
};

// ---------- 6: bats stream out of a cave at dusk; a GI sweeps a long-handled net through them ----------
export const SceneCave: React.FC<SP> = ({ lt, frame }) => {
  const sx = 700, sy = GY + 20, ps = 0.95;
  const sweep = lerpA(lt, [[0, -150], [0.9, -150], [1.6, -80], [2.5, -100]]);
  const h1 = handAt(sx, sy, ps, -1, sweep, 0), h2 = handAt(sx, sy, ps, -1, sweep + 14, 0);
  const dir: V2 = [h1[0] - h2[0], h1[1] - h2[1]]; const L = Math.hypot(dir[0], dir[1]) || 1;
  const tip: V2 = [h1[0] + (dir[0] / L) * 300, h1[1] + (dir[1] / L) * 300];
  const caught = lt > 1.5 ? 3 : 0;
  return (
    <g>
      <Sky top="#2a2a50" bottom="#d88a5a" />
      <path d="M -60 1300 L -60 700 Q 120 520 360 600 Q 520 650 560 900 L 640 1300 Z" fill="#8a6a4a" stroke={INK} strokeWidth={5} />
      <path d="M 90 1180 Q 120 820 300 800 Q 450 820 470 1180 Z" fill="#120c0a" stroke={INK} strokeWidth={5} />
      <rect x={-60} y={GY + 20} width={1200} height={900} fill="#a8865a" />
      {Array.from({ length: 26 }, (_, i) => {
        const k = ((lt * 0.55 + rnd(i)) % 1);
        const p: V2 = [280 + k * 900 + (rnd(i + 3) - 0.5) * 200, 980 - k * 700 + Math.sin(frame * 0.2 + i) * 30];
        return <Bat key={i} x={p[0]} y={p[1]} s={0.35 + rnd(i + 8) * 0.15} flap={(frame * 0.16 + rnd(i)) % 1} />;
      })}
      <Figure x={sx} y={sy} s={ps} facing={-1} A1={sweep} A2={sweep + 14} colors={GI} frame={frame} expression="determined" />
      <line x1={h2[0]} y1={h2[1]} x2={tip[0]} y2={tip[1]} stroke="#8a5a2e" strokeWidth={9} strokeLinecap="round" />
      <g transform={`translate(${tip[0]} ${tip[1]})`}>
        <circle r={60} fill="none" stroke="#3a2a1e" strokeWidth={6} />
        <path d="M -60 0 Q 0 140 60 0" fill="#e8dcc0" fillOpacity={0.35} stroke="#5a4a3a" strokeWidth={3} />
        {Array.from({ length: caught }, (_, i) => <Bat key={i} x={-26 + i * 26} y={40} s={0.28} flap={(frame * 0.3 + i * 0.3) % 1} />)}
      </g>
      <circle cx={h1[0]} cy={h1[1]} r={12} fill="#d39a73" stroke={INK} strokeWidth={3} />
      <circle cx={h2[0]} cy={h2[1]} r={12} fill="#d39a73" stroke={INK} strokeWidth={3} />
      <Label x={540} y={1390} lt={lt} at={0.3} text="CAVES OF THE SOUTHWEST" size={38} />
    </g>
  );
};

// ---------- 7: a GI slides a tray of bats into an icebox; they fall asleep ----------
export const SceneChill: React.FC<SP> = ({ lt, frame }) => {
  const sx = 300, sy = GY + 60, ps = 1.1;
  const push = interpolate(lt, [0.2, 1.1], [0, 1], cl);
  const A = lerpA(push, [[0, -70], [1, -86]]);
  const h1 = handAt(sx, sy, ps, 1, A, push * 10), h2 = handAt(sx, sy, ps, 1, A + 8, push * 10);
  const trayX = (h1[0] + h2[0]) / 2 + 90, trayY = (h1[1] + h2[1]) / 2 - 10;
  const asleep = lt > 1.2;
  return (
    <g>
      <Wall color="#9a9a88" floor="#5a5446" />
      <Icebox x={820} y={GY + 60} door={1} />
      <Figure x={sx} y={sy} s={ps} A1={A} A2={A + 8} lean={push * 10} colors={GI2} frame={frame} expression="neutral" />
      <Tray x={trayX} y={trayY} w={220} n={4} asleep={asleep} frost={push} frame={frame} />
      <circle cx={h1[0]} cy={h1[1]} r={14} fill="#a87a5a" stroke={INK} strokeWidth={3} />
      {asleep && [0, 1, 2].map((i) => <text key={i} x={trayX + 40 + i * 30} y={trayY - 70 - i * 34 - ((lt * 30) % 20)} fontFamily="Inter" fontWeight={900} fontSize={34 + i * 6} fill="#eaf6ff" stroke={INK} strokeWidth={2} opacity={interpolate(lt, [1.2, 1.5], [0, 1], cl)}>Z</text>)}
      <Label x={540} y={1390} lt={lt} at={0.3} text="CHILLED TO SLEEP" size={40} />
    </g>
  );
};

// ---------- 8: close-up — a hand clips the napalm capsule to the sleeping bat; the timer starts ----------
export const SceneClip: React.FC<SP> = ({ lt, frame }) => {
  const clipAt = 1.3;
  const k = interpolate(lt, [0, clipAt], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  const bat: V2 = [500, 900];
  const cap: V2 = mix([900, 560], [bat[0] + 6, bat[1] + 18], k);
  const hand: V2 = lt < clipAt + 0.3 ? [cap[0] + 12, cap[1] - 20] : mix([bat[0] + 18, bat[1] - 2], [960, 560], interpolate(lt, [clipAt + 0.3, clipAt + 1.0], [0, 1], cl));
  const timer = lt > 1.8 ? (lt - 1.8) * 0.5 : 0;
  return (
    <g>
      <rect x={-60} y={0} width={1200} height={2300} fill="#3a3428" />
      <rect x={-60} y={1060} width={1200} height={1300} fill="#8a6a44" />
      {Array.from({ length: 8 }, (_, i) => <line key={i} x1={-60} x2={1140} y1={1090 + i * 40} y2={1090 + i * 40} stroke="#6e5232" strokeWidth={4} />)}
      <circle cx={500} cy={600} r={420} fill="#ffe8a8" opacity={0.12} />
      <Bat x={bat[0]} y={bat[1]} s={4.2} asleep bomb={lt >= clipAt} timer={lt >= clipAt ? timer : undefined} />
      {lt < clipAt && <g transform={`translate(${cap[0]} ${cap[1]}) scale(4.2)`}><rect x={-10} y={0} width={22} height={30} rx={8} fill="#b8b4a4" stroke={INK} strokeWidth={2.5 / 1} /><rect x={-10} y={10} width={22} height={5} fill="#c0392b" /></g>}
      {/* gloved hand + forearm from the upper right */}
      <path d={`M ${hand[0]} ${hand[1]} L 1200 ${hand[1] - 380}`} stroke={OD} strokeWidth={110} strokeLinecap="round" />
      <ellipse cx={hand[0]} cy={hand[1]} rx={58} ry={46} fill="#8a6a44" stroke={INK} strokeWidth={5} />
      <Label x={250} y={760} lt={lt} at={clipAt + 0.05} text="NAPALM" size={44} bg="#7a1f1f" />
      <Label x={760} y={1230} lt={lt} at={1.9} text="TIMER" size={44} />
    </g>
  );
};

// ---------- 9: a bomber drops the case; the chute opens and the case splits apart ----------
export const SceneDrop: React.FC<SP> = ({ lt, frame }) => {
  const px = interpolate(lt, [0, 2], [420, 980], cl);
  const fall = Math.max(0, lt - 0.15);
  const cx = 470 + fall * 120, cy = 520 + Math.min(fall, 0.6) * 500 + Math.max(0, fall - 0.6) * 120;
  const chute = interpolate(lt, [0.6, 0.9], [0, 1], cl);
  const open = interpolate(lt, [0.65, 1.0], [0, 1], cl);
  return (
    <g>
      <Sky top="#1a2a4a" bottom="#7a8aa8" clouds={4} drift={lt * 3} />
      <rect x={-60} y={GY} width={1200} height={1100} fill="#7a8aa8" />
      <Bomber x={px} y={380} s={0.8} bay={lt < 0.4 ? 1 : 0.5} />
      {lt > 0.15 && <Case x={cx} y={cy} s={0.9} chute={chute} open={open} frame={frame} />}
      <Label x={540} y={1390} lt={lt} at={0.7} text="THE CASE OPENS" size={40} />
    </g>
  );
};

// ---------- 10: close — the bats on a tray wake up and take off ----------
export const SceneWake: React.FC<SP> = ({ lt, frame }) => {
  const eyes = interpolate(lt, [0.3, 0.6], [0, 1], cl);
  return (
    <g>
      <Sky top="#203050" bottom="#6a7a98" clouds={3} drift={lt * 8} />
      <rect x={-60} y={GY} width={1200} height={1100} fill="#6a7a98" />
      {Array.from({ length: 4 }, (_, i) => {
        const go = interpolate(lt, [0.7 + i * 0.12, 1.3 + i * 0.12], [0, 1], cl);
        const x = 260 + i * 190 + go * (120 + i * 30), y = 1000 - go * (300 + i * 60);
        return <Bat key={i} x={x} y={y} s={1.5} asleep={go === 0 && eyes < 1} eyes={eyes} flap={go > 0 ? (frame * 0.18 + i * 0.25) % 1 : 0.2} bomb rot={-go * 10} />;
      })}
      <g transform="translate(540 1060)"><rect x={-420} y={0} width={840} height={40} fill="#9a7a54" stroke={INK} strokeWidth={4} />{[1, 2, 3].map((i) => <line key={i} x1={-420 + i * 210} x2={-420 + i * 210} y1={0} y2={40} stroke={INK} strokeWidth={3} />)}</g>
      <Label x={540} y={1390} lt={lt} at={0.3} text="AWAKE" size={44} />
    </g>
  );
};

// ---------- 11: night — bats swoop under the eaves of wooden houses (no people shown) ----------
export const SceneRoofs: React.FC<SP> = ({ lt, frame }) => {
  const k = interpolate(lt, [0, 1.5], [0, 1], cl);
  return (
    <g>
      <Sky top="#0a1020" bottom="#28304a" stars />
      <Houses y={1200} />
      <rect x={-60} y={1200} width={1200} height={900} fill="#1a1a20" />
      <Swarm n={12} from={[540, 300]} to={[540, 860]} k={k} frame={frame} s={0.5} spread={700} seed={4} bombs />
      <Label x={540} y={1390} lt={lt} at={0.3} text="WOODEN BUILDINGS" size={40} />
    </g>
  );
};

// ---------- 12: close — a capsule tucked under the eaves; the timer runs out and sparks ----------
export const SceneTimer: React.FC<SP> = ({ lt, frame }) => {
  const off = 1.0;
  const tm = Math.min(1, lt / off);
  const spark = interpolate(lt, [off, off + 0.15, off + 0.9], [0, 1, 0.5], cl);
  return (
    <g>
      <rect x={-60} y={0} width={1200} height={2300} fill="#141418" />
      <path d="M -60 600 L 1140 760 L 1140 640 L -60 480 Z" fill="#2e3036" stroke={INK} strokeWidth={5} />
      {Array.from({ length: 10 }, (_, i) => <line key={i} x1={-60 + i * 130} y1={480 + i * 17} x2={-60 + i * 130} y2={600 + i * 17} stroke="#1a1c20" strokeWidth={5} />)}
      <rect x={-60} y={760} width={1200} height={1500} fill="#4a3426" />
      {Array.from({ length: 10 }, (_, i) => <line key={i} x1={-60 + i * 130} y1={700} x2={-60 + i * 130} y2={2300} stroke="#3a281c" strokeWidth={5} />)}
      <Bat x={540} y={820} s={3.2} asleep bomb timer={tm} rot={180} />
      <g transform="translate(760 1100)">
        <circle r={90} fill="#f6f0dc" stroke={INK} strokeWidth={6} />
        <line x1={0} y1={0} x2={70 * Math.sin(tm * Math.PI * 2)} y2={-70 * Math.cos(tm * Math.PI * 2)} stroke="#c0392b" strokeWidth={8} strokeLinecap="round" />
        <circle r={10} fill={INK} />
      </g>
      {spark > 0 && <g transform="translate(560 900)">
        <circle r={160 * spark} fill="#ffb23a" opacity={0.35 * spark} />
        {Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2; return <line key={i} x1={Math.cos(a) * 30} y1={Math.sin(a) * 30} x2={Math.cos(a) * (60 + 70 * spark)} y2={Math.sin(a) * (60 + 70 * spark)} stroke="#ffd34a" strokeWidth={8} strokeLinecap="round" opacity={spark} />; })}
      </g>}
      <Label x={540} y={1390} lt={lt} at={0.2} text="TIMED FUSE" size={40} />
    </g>
  );
};

// ---------- 13: Carlsbad — a GI opens the test-shed door; armed bats burst out past him ----------
export const SceneLoose: React.FC<SP> = ({ lt, frame }) => {
  const door = interpolate(lt, [0.1, 0.5], [0, 1], cl);
  const sx = 640, sy = GY + 60, ps = 1.05;
  const duck = lt > 0.6 ? lerpA(lt, [[0.6, 0], [0.9, -14]]) : 0;
  const A1 = lerpA(lt, [[0, -80], [0.5, -60], [0.9, -150], [1.4, -130]]);
  const h1 = handAt(sx, sy, ps, -1, lt < 0.5 ? -80 : A1, duck);
  const out = interpolate(lt, [0.45, 1.6], [0, 1], cl);
  return (
    <g>
      <Sky top="#e8a868" bottom="#f4d8a8" sun={{ x: 900, y: 320, r: 60, color: "#fff2c4" }} />
      <rect x={-60} y={960} width={1200} height={1400} fill="#c8a06a" />
      <rect x={60} y={560} width={560} height={GY + 60 - 560} fill="#8a8a7a" stroke={INK} strokeWidth={5} />
      <path d="M 30 570 L 340 440 L 650 570 Z" fill="#6a6a5a" stroke={INK} strokeWidth={5} />
      <text x={200} y={640} fontFamily="Inter" fontWeight={900} fontSize={30} fill="#2a2a2a">KEEP OUT</text>
      <rect x={340} y={840} width={200} height={GY + 60 - 840} fill="#120e0a" />
      <g transform={`translate(540 0) scale(${Math.cos(door * 1.4)} 1)`}><rect x={-200} y={840} width={200} height={GY + 60 - 840} fill="#7a5a3a" stroke={INK} strokeWidth={4} /><circle cx={-170} cy={1080} r={10} fill="#c9a54a" /></g>
      <Swarm n={16} from={[440, 1000]} to={[980, 420]} k={out} frame={frame} s={0.6} spread={360} seed={11} bombs stagger={0.5} />
      <Figure x={sx} y={sy} s={ps} facing={-1} A1={lt < 0.5 ? -80 : A1} A2={-20} lean={duck} colors={GI} frame={frame} expression={lt > 0.5 ? "scared" : "neutral"} />
      <circle cx={h1[0]} cy={h1[1]} r={13} fill="#d39a73" stroke={INK} strokeWidth={3} />
      <Label x={540} y={1390} lt={lt} at={0.4} text="ARMED BATS LOOSE" size={40} bg="#7a1f1f" />
    </g>
  );
};

// ---------- 14: the bats fly in under the hangar roof; smoke, then flames ----------
export const SceneHangar: React.FC<SP> = ({ lt, frame }) => {
  const inK = interpolate(lt, [0, 1.0], [0, 1], cl);
  const smoke = interpolate(lt, [1.2, 1.8], [0, 1], cl);
  const fire = interpolate(lt, [2.3, 2.7], [0, 1], cl);
  return (
    <g>
      <Sky top="#e09858" bottom="#f4d0a0" />
      <rect x={-60} y={1000} width={1200} height={1400} fill="#c8a06a" />
      <Smoke x={540} y={760} frame={frame} seed={7} n={12} h={520} k={smoke} />
      <Hangar x={540} y={1180} s={1.0} />
      <Swarm n={12} from={[1000, 420]} to={[600, 820]} k={inK} frame={frame} s={0.45} spread={260} seed={21} bombs />
      <Flames x={560} y={990} w={420} h={180} frame={frame} k={fire} />
      <Flames x={220} y={1180} w={120} h={140} frame={frame} k={fire * 0.8} seed={3} />
      {/* a GI runs in with an extinguisher once it catches */}
      {fire > 0 && (() => { const rx = interpolate(lt, [2.5, 3.2], [1100, 820], cl); return <Figure x={rx} y={GY + 40} s={0.72} facing={-1} A1={-60} A2={-50} colors={GI2} frame={frame} walking expression="scared" />; })()}
      <Label x={540} y={1390} lt={lt} at={2.4} text="HANGAR ON FIRE" size={40} bg="#7a1f1f" />
    </g>
  );
};

// ---------- 15: the general's staff car burns; the general runs up, hands to his head ----------
export const SceneCar: React.FC<SP> = ({ lt, frame }) => {
  const gx = interpolate(lt, [0, 0.7], [1100, 860], cl);
  const arrived = lt > 0.7;
  return (
    <g>
      <Sky top="#d88a50" bottom="#f4c890" />
      <rect x={-60} y={1000} width={1200} height={1400} fill="#b89060" />
      <Smoke x={420} y={900} frame={frame} seed={13} n={10} h={420} k={1} />
      <StaffCar x={420} y={GY + 40} s={1.15} />
      <Flames x={420} y={GY + 40 - 190 * 1.15} w={260} h={160} frame={frame} k={1} seed={5} />
      <Figure x={gx} y={GY + 40} s={0.95} facing={-1} A1={arrived ? -165 : undefined} A2={arrived ? -155 : undefined} colors={GENERAL} frame={frame} walking={!arrived} expression="scared"><GenStar /></Figure>
      <Label x={540} y={1390} lt={lt} at={0.2} text="THE GENERAL'S CAR" size={40} />
    </g>
  );
};

// ---------- 16: Navy office — an admiral stamps CANCELED on the Project X-Ray file ----------
export const SceneCancel: React.FC<SP> = ({ lt, frame }) => {
  const stampDown = 2.5;
  const sx = 640, sy = GY + 60, ps = 1.6;
  const A1 = lerpA(lt, [[0, -40], [stampDown - 0.6, -40], [stampDown - 0.15, -82], [stampDown, -56], [stampDown + 0.4, -72]]);
  const deskY = handAt(sx, sy, ps, -1, -56, 0)[1] + 18;
  const h1 = handAt(sx, sy, ps, -1, A1, 0);
  const sk = interpolate(lt, [stampDown, stampDown + 0.12], [0, 1], cl);
  return (
    <g>
      <Wall color="#a8b0b8" floor="#4a4a50" />
      <g transform="translate(880 560)"><circle r={90} fill="#efe8d0" stroke={INK} strokeWidth={5} /><path d="M 0 -60 L 0 60 M -40 -10 L 40 -10 M -50 30 Q 0 80 50 30" stroke="#1c2340" strokeWidth={10} fill="none" strokeLinecap="round" /><text y={130} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={28} fill="#1c2340">US NAVY</text></g>
      <Figure x={sx} y={sy} s={ps} facing={-1} A1={A1} A2={-50} colors={ADMIRAL} frame={frame} expression={lt > stampDown ? "determined" : "neutral"} />
      <Desk x={420} y={deskY} w={640} color="#3a3a42" />
      <Paper x={400} y={deskY - 25} w={220} h={70} lines={0} text="PROJECT X-RAY" stamp={{ text: "CANCELED", k: sk, color: "#c0392b" }} />
      <Stamp x={h1[0]} y={h1[1] + 10} />
      <Label x={540} y={1390} lt={lt} at={0.3} text="THE NAVY" size={40} />
    </g>
  );
};

// ---------- 17: the calendar flips to 1945; the officer points at it and shakes his head beside the sleeping bats ----------
export const SceneCalendar: React.FC<SP> = ({ lt, frame }) => {
  const yr = lt < 0.8 ? "1943" : lt < 1.5 ? "1944" : "1945";
  const flip = lt < 0.8 ? interpolate(lt, [0.55, 0.8], [0, 1], cl) : lt < 1.5 ? interpolate(lt, [1.25, 1.5], [0, 1], cl) : 0;
  const shake = lt > 1.7 ? Math.sin(lt * 14) * 4 : 0;
  const sx = 300, sy = GY + 60, ps = 1.1;
  const A1 = lerpA(lt, [[0, -20], [0.4, -96]]);
  const h1 = handAt(sx, sy, ps, 1, A1, 0);
  return (
    <g>
      <Wall color="#a8b0b8" floor="#4a4a50" />
      <Calendar x={680} y={360} year={yr} flip={flip} />
      <rect x={560} y={900} width={460} height={20} fill="#6a4a30" stroke={INK} strokeWidth={3} />
      <rect x={600} y={760} width={380} height={140} fill="none" stroke="#5a5a5a" strokeWidth={4} />
      {Array.from({ length: 9 }, (_, i) => <line key={i} x1={600 + i * 47} x2={600 + i * 47} y1={760} y2={900} stroke="#5a5a5a" strokeWidth={3} />)}
      <Tray x={790} y={890} w={300} n={5} asleep frame={frame} />
      <Figure x={sx} y={sy} s={ps} A1={A1} A2={-10} lean={shake * 0.3} colors={ADMIRAL} frame={frame} expression={lt > 1.6 ? "sad" : "neutral"} />
      <circle cx={h1[0]} cy={h1[1]} r={13} fill="#eebf98" stroke={INK} strokeWidth={3} />
      <Label x={540} y={1390} lt={lt} at={0.2} text="NOT READY UNTIL 1945" size={38} />
    </g>
  );
};
