import React from "react";
import { interpolate, Easing } from "remotion";
import { Sky } from "./ponyScenes";
import { Label } from "./chickenScenes";
import { handAt } from "./madridScenes";
import { Figure } from "./pirateScenes";
import { KitColors } from "../kit/Kit";

/**
 * Ground scenes for "Chicago Lifted an Entire City Block" (the raising of Chicago: 1854 cholera, sewers laid on the streets,
 * Lake Street block 1860 on 6,000 jackscrews, Tremont House 1861 with guests inside).
 * lt = seconds since the scene started. Kit side pose: feet at (0,0), shoulder pivot (0,-284), straight-arm hand = handAt().
 * Scenes are drawn at GY and shifted −130 px by the story. Storyboard: social/scripts/chicago-raise-2026-11-23.md.
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

// ---------- people (1850s–60s) ----------
const WORK1: Partial<KitColors> = { coat: "#6a7a8a", coatShade: "#52606e", coatLight: "#7a8a9a", patch: "#7a8a9a", scarf: "#c23b2c", scarfShade: "#8f2a20", trousers: "#4a4036", trousersShade: "#3a322a", cap: "#3b3733" };
const WORK2: Partial<KitColors> = { coat: "#8a6a4a", coatShade: "#6e5238", coatLight: "#9a7a5a", patch: "#9a7a5a", scarf: "#efe8d6", scarfShade: "#cfc6b0", trousers: "#3a3a3a", trousersShade: "#2a2a2a", cap: "#4a3a2a", skin: "#c99a78", skinShade: "#a87a5a" };
const WORK3: Partial<KitColors> = { coat: "#5a6a4a", coatShade: "#46543a", coatLight: "#6a7a5a", patch: "#6a7a5a", scarf: "#d8b45a", scarfShade: "#b8943a", trousers: "#4a4440", trousersShade: "#3a3430", cap: "#2a2a2a", skin: "#8a5a3a", skinShade: "#6e4428" };
const CLERK: Partial<KitColors> = { coat: "#efe8d6", coatShade: "#cfc6b0", coatLight: "#fff8e8", patch: "#fff8e8", scarf: "#2a2a2a", scarfShade: "#1a1a1a", trousers: "#3a3a40", trousersShade: "#2a2a30", hair: "#5a3a20", capStyle: "hair" } as Partial<KitColors>;
const GENT: Partial<KitColors> = { coat: "#2c2e36", coatShade: "#1e2026", coatLight: "#3a3c44", patch: "#3a3c44", scarf: "#efefe8", scarfShade: "#cfcfc8", trousers: "#4a4a50", trousersShade: "#3a3a40", hair: "#6a4a2a", capStyle: "hair", button: "#c9a54a" } as Partial<KitColors>;
const LADY: Partial<KitColors> = { coat: "#6a3a5a", coatShade: "#542c48", coatLight: "#7a4a6a", patch: "#7a4a6a", scarf: "#efe2c4", scarfShade: "#cfc2a4", trousers: "#6a3a5a", trousersShade: "#542c48", hair: "#3a2414", capStyle: "hair" } as Partial<KitColors>;
const DOC: Partial<KitColors> = { coat: "#1e1e22", coatShade: "#141416", coatLight: "#2a2a30", patch: "#2a2a30", scarf: "#efefe8", scarfShade: "#cfcfc8", trousers: "#2a2a2e", trousersShade: "#1e1e22", hair: "#8a8a88", capStyle: "hair" } as Partial<KitColors>;

/** top hat, rig units (facing right) */
const TopHat: React.FC<{ color?: string }> = ({ color = "#1a1a1e" }) => (
  <g><rect x={-30} y={-470} width={84} height={96} rx={4} fill={color} stroke={INK} strokeWidth={4} /><rect x={-30} y={-394} width={84} height={12} fill="#6a2a2a" /><ellipse cx={12} cy={-376} rx={66} ry={12} fill={color} stroke={INK} strokeWidth={4} /></g>
);
/** skirt over the Kit legs (side pose), world coords at the feet */
const Skirt: React.FC<{ x: number; y: number; s: number; color: string }> = ({ x, y, s, color }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><path d="M -44 -176 L 44 -176 L 70 -6 Q 0 6 -70 -6 Z" fill={color} stroke={INK} strokeWidth={4 / s} /></g>
);
const Bonnet: React.FC = () => <path d="M -48 -350 Q -50 -432 14 -436 Q 70 -430 66 -360 Q 40 -392 6 -390 Q -26 -386 -48 -350 Z" fill="#e8d6a8" stroke={INK} strokeWidth={4} />;

// ---------- props ----------
/** a screw jack: base on the ground at (x,y), threaded post up to the timber at y − h; turn = degrees of the bar */
export const Jack: React.FC<{ x: number; y: number; h: number; s?: number; turn?: number }> = ({ x, y, h, s = 1, turn = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -34 0 L 34 0 L 22 -40 L -22 -40 Z" fill="#4a4a4e" stroke={INK} strokeWidth={3} />
    <rect x={-10} y={-h / s} width={20} height={h / s - 40} fill="#7a7a80" stroke={INK} strokeWidth={3} />
    {Array.from({ length: Math.max(1, Math.floor((h / s - 50) / 14)) }, (_, i) => <line key={i} x1={-10} x2={10} y1={-50 - i * 14 + ((turn / 30) % 14)} y2={-44 - i * 14 + ((turn / 30) % 14)} stroke="#4a4a4e" strokeWidth={2} />)}
    <rect x={-22} y={-58} width={44} height={18} fill="#5a5a60" stroke={INK} strokeWidth={3} />
    <line x1={-46 * Math.cos((turn * Math.PI) / 180)} y1={-49} x2={46 * Math.cos((turn * Math.PI) / 180)} y2={-49} stroke="#3a3a3a" strokeWidth={6} strokeLinecap="round" />
  </g>
);
/** a row of brick shops (bottom of the walls at y), raised by `rise` px on timbers and jacks. n bays of width w */
export const BrickRow: React.FC<{ x: number; y: number; n?: number; w?: number; h?: number; rise: number; ground: number; jacks?: number; turn?: number; signs?: string[]; lit?: boolean }> = ({ x, y, n = 3, w = 300, h = 520, rise, ground, jacks = 6, turn = 0, signs = [], lit }) => {
  const by = y - rise; const W = n * w;
  return (
    <g>
      {/* gap under the raised block: timbers + jacks */}
      {rise > 2 && <g>
        <rect x={x} y={by} width={W} height={ground - by} fill="#1a120c" opacity={0.85} />
        {Array.from({ length: jacks }, (_, i) => <Jack key={i} x={x + 40 + (i * (W - 80)) / Math.max(1, jacks - 1)} y={ground} h={ground - by - 20} turn={turn + i * 40} s={Math.min(1, (ground - by) / 140 + 0.3)} />)}
        <rect x={x - 10} y={by} width={W + 20} height={20} fill="#7a5a3a" stroke={INK} strokeWidth={3} />
      </g>}
      {Array.from({ length: n }, (_, i) => {
        const bx = x + i * w, hh = h - (i % 2) * 40;
        return <g key={i}>
          <rect x={bx} y={by - hh} width={w} height={hh} fill={i % 2 ? "#a8543a" : "#9a4a34"} stroke={INK} strokeWidth={4} />
          {Array.from({ length: Math.floor(hh / 26) }, (_, r) => <line key={r} x1={bx} x2={bx + w} y1={by - hh + 26 * (r + 1)} y2={by - hh + 26 * (r + 1)} stroke="#7a3a26" strokeWidth={1.5} opacity={0.5} />)}
          <rect x={bx - 6} y={by - hh - 18} width={w + 12} height={22} fill="#6a3a2a" stroke={INK} strokeWidth={3} />
          {[0, 1, 2].map((c) => <rect key={c} x={bx + 30 + c * (w - 60) / 3} y={by - hh + 40} width={(w - 60) / 3 - 20} height={70} fill={lit ? "#ffd98a" : "#3a4a5a"} stroke="#efe2c4" strokeWidth={4} />)}
          {hh > 400 && [0, 1, 2].map((c) => <rect key={`b${c}`} x={bx + 30 + c * (w - 60) / 3} y={by - hh + 150} width={(w - 60) / 3 - 20} height={70} fill={lit ? "#ffd98a" : "#3a4a5a"} stroke="#efe2c4" strokeWidth={4} />)}
          <rect x={bx + 20} y={by - 190} width={w - 40} height={190} fill="#4a3a2a" stroke={INK} strokeWidth={3} />
          <rect x={bx + 34} y={by - 176} width={w * 0.45} height={150} fill={lit ? "#ffe0a0" : "#8ab0c0"} stroke={INK} strokeWidth={3} />
          <rect x={bx + w * 0.62} y={by - 176} width={w * 0.26} height={176} fill="#2a1e14" stroke={INK} strokeWidth={3} />
          {signs[i] && <g><rect x={bx + 24} y={by - 240} width={w - 48} height={44} fill="#1b140d" stroke="#c9a54a" strokeWidth={3} /><text x={bx + w / 2} y={by - 208} textAnchor="middle" fontFamily="Georgia" fontWeight={700} fontSize={26} fill="#f2e3b5">{signs[i]}</text></g>}
        </g>;
      })}
    </g>
  );
};
/** wooden steps from the street (y = ground) up to a raised door at y = top */
const Steps: React.FC<{ x: number; top: number; ground: number; w?: number }> = ({ x, top, ground, w = 90 }) => {
  const n = Math.max(1, Math.round((ground - top) / 28));
  return <g>{Array.from({ length: n }, (_, i) => <rect key={i} x={x - (i * w) / n} y={top + ((ground - top) * i) / n} width={w + (i * w) / n * 0.2} height={(ground - top) / n + 2} fill="#8a6a44" stroke={INK} strokeWidth={2.5} />)}</g>;
};
const Mud: React.FC<{ y: number; frame: number; water?: boolean }> = ({ y, frame, water }) => (
  <g>
    <rect x={-60} y={y} width={1200} height={1200} fill="#6a5034" />
    {water && <rect x={-60} y={y + 10} width={1200} height={1200} fill="#7a8a84" opacity={0.55} />}
    {Array.from({ length: 22 }, (_, i) => <ellipse key={i} cx={rnd(i) * 1100} cy={y + 30 + rnd(i + 3) * 300} rx={30 + rnd(i + 5) * 60} ry={6 + rnd(i + 7) * 6} fill={water ? "#a8b8b4" : "#4a3824"} opacity={0.5 + 0.2 * Math.sin(frame * 0.1 + i)} />)}
  </g>
);
const Wagon: React.FC<{ x: number; y: number; sink?: number; spin?: number }> = ({ x, y, sink = 0, spin = 0 }) => (
  <g transform={`translate(${x} ${y + sink})`}>
    <path d="M -220 -170 L 200 -170 L 180 -80 L -200 -80 Z" fill="#8a5a34" stroke={INK} strokeWidth={4} />
    {[-120, 110].map((wx) => <g key={wx} transform={`translate(${wx} -40) rotate(${spin})`}><circle r={70} fill="none" stroke="#4a3020" strokeWidth={10} />{[0, 45, 90, 135].map((a) => <line key={a} x1={-66 * Math.cos((a * Math.PI) / 180)} y1={-66 * Math.sin((a * Math.PI) / 180)} x2={66 * Math.cos((a * Math.PI) / 180)} y2={66 * Math.sin((a * Math.PI) / 180)} stroke="#4a3020" strokeWidth={6} />)}<circle r={12} fill="#2a1a10" /></g>)}
    <rect x={-60} y={-110} width={50} height={10} fill="#3a2a1a" />
  </g>
);
const Pipe: React.FC<{ x: number; y: number; len?: number; r?: number }> = ({ x, y, len = 360, r = 70 }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-len / 2} y={-r} width={len} height={r * 2} fill="#a87a5a" stroke={INK} strokeWidth={4} />
    {Array.from({ length: 8 }, (_, i) => <line key={i} x1={-len / 2} x2={len / 2} y1={-r + (i + 1) * (r / 4.5)} y2={-r + (i + 1) * (r / 4.5)} stroke="#8a5a3a" strokeWidth={2} opacity={0.6} />)}
    <ellipse cx={len / 2} cy={0} rx={r * 0.35} ry={r} fill="#2a1a10" stroke={INK} strokeWidth={4} />
    <ellipse cx={len / 2} cy={0} rx={r * 0.35} ry={r} fill="none" stroke="#c89a6a" strokeWidth={10} />
  </g>
);
/** six-storey stone hotel; base at y; rise in px */
const Hotel: React.FC<{ x: number; y: number; rise: number; ground: number; frame: number; turn: number }> = ({ x, y, rise, ground, turn }) => {
  const by = y - rise, W = 640, H = 900;
  return (
    <g>
      {rise > 2 && <g><rect x={x} y={by} width={W} height={ground - by} fill="#1a120c" opacity={0.85} />{Array.from({ length: 7 }, (_, i) => <Jack key={i} x={x + 40 + i * 93} y={ground} h={ground - by - 20} turn={turn + i * 50} s={0.8} />)}<rect x={x - 10} y={by} width={W + 20} height={20} fill="#7a5a3a" stroke={INK} strokeWidth={3} /></g>}
      <rect x={x} y={by - H} width={W} height={H} fill="#cfc2a4" stroke={INK} strokeWidth={5} />
      <rect x={x - 14} y={by - H - 30} width={W + 28} height={34} fill="#a89a7a" stroke={INK} strokeWidth={4} />
      {Array.from({ length: 6 }, (_, r) => Array.from({ length: 6 }, (_, c) => <rect key={`${r}${c}`} x={x + 34 + c * 102} y={by - H + 40 + r * 140} width={60} height={90} fill={(r * 7 + c * 3) % 5 === 0 ? "#ffe0a0" : "#5a6a7a"} stroke={INK} strokeWidth={3} />))}
      <rect x={x + W / 2 - 220} y={by - H - 100} width={440} height={60} fill="#1b140d" stroke="#c9a54a" strokeWidth={4} />
      <text x={x + W / 2} y={by - H - 56} textAnchor="middle" fontFamily="Georgia" fontWeight={700} fontSize={38} fill="#f2e3b5">TREMONT HOUSE</text>
    </g>
  );
};

const Window: React.FC<{ x: number; y: number; w: number; h: number; sky: string; children?: React.ReactNode }> = ({ x, y, w, h, sky, children }) => (
  <g>
    <defs><clipPath id={`cwin${x}${y}`}><rect x={x} y={y} width={w} height={h} /></clipPath></defs>
    <rect x={x} y={y} width={w} height={h} fill={sky} />
    <g clipPath={`url(#cwin${x}${y})`}>{children}</g>
    <rect x={x} y={y} width={w} height={h} fill="none" stroke="#5a3a20" strokeWidth={14} />
    <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke="#5a3a20" strokeWidth={8} />
  </g>
);

// ---------- 1 + LOOP: shops on Lake Street rise on jackscrews; the clerk keeps serving a customer ----------
/** u = 0 is frame 0. The loop runs u from negative up to 0. */
export const SceneHook: React.FC<SP & { u0?: number }> = ({ lt, frame, u0 = 0 }) => {
  const u = lt + u0;
  const push = 1.75 + Math.max(0, Math.min(6.4, u)) * 0.02;
  const rise = 60 + (u + 3) * 14; // rises steadily through the whole hook and the loop
  const ground = 1220, baseY = 1220;
  const turn = frame * 9;
  // workers at the jacks (heads below the timber)
  const wk = (x: number, ph: number, colors: Partial<KitColors>) => { const A = -70 + Math.sin(frame * 0.35 + ph) * 22; return <Figure key={x} x={x} y={ground + 6} s={0.42} A1={A} A2={A + 10} colors={colors} frame={frame} expression="determined" />; };
  const door = baseY - rise; // shop floor level
  const give = interpolate(((u % 2.6) + 2.6) % 2.6, [0.4, 1.0, 1.6, 2.2], [0, 1, 1, 0], cl);
  const ch = handAt(560, door, 0.66, 1, -80, 0), cu = handAt(700, door, 0.66, -1, -60 - give * 20, 0);
  return (
    <g transform={`translate(540 1060) scale(${push}) translate(-600 -1060)`}>
      <Sky top="#9cc6e0" bottom="#efe6cc" clouds={3} drift={u + 5} />
      <Mud y={ground} frame={frame} />
      <BrickRow x={-90} y={baseY} n={4} w={330} h={620} rise={rise} ground={ground} jacks={8} turn={turn} signs={["HARDWARE", "DRY GOODS", "BOOKS", "TEA"]} />
      <rect x={430} y={door - 4} width={240} height={14} fill="#8a6a44" stroke={INK} strokeWidth={3} />
      <Steps x={690} top={door} ground={ground} w={110} />
      {/* counter through the open door of DRY GOODS: clerk hands a parcel to a customer standing on the raised step */}
      <Figure x={560} y={door} s={0.66} A1={-80} A2={-30} colors={CLERK} frame={frame} expression="happy" />
      <Figure x={700} y={door} s={0.66} facing={-1} A1={-60 - give * 20} A2={-10} colors={GENT} frame={frame} expression="neutral"><TopHat /></Figure>
      <rect x={(ch[0] + cu[0]) / 2 - 22 + (1 - give) * -30} y={(ch[1] + cu[1]) / 2 - 20} width={44} height={34} fill="#c8a46a" stroke={INK} strokeWidth={3} />
      {wk(60, 0, WORK1)}{wk(330, 1.3, WORK2)}{wk(620, 2.1, WORK3)}{wk(900, 0.7, WORK1)}
      <Label x={600} y={1250} lt={u + 10} at={0} text="LAKE STREET, CHICAGO" size={24} />
    </g>
  );
};

// ---------- 2: a flooded mud street; a man pushes a sinking wagon wheel ----------
export const SceneMud: React.FC<SP> = ({ lt, frame }) => {
  const sink = Math.min(30, lt * 16);
  const sx = 640, sy = GY + 40, ps = 0.9;
  const A = -84 + Math.sin(frame * 0.4) * 4;
  return (
    <g>
      <Sky top="#8a9aa8" bottom="#c8c8bc" clouds={2} drift={lt} />
      <rect x={-60} y={760} width={1200} height={460} fill="#7a6a56" />
      {[[-40, 300], [300, 260], [600, 320], [900, 280]].map(([x, h], i) => <rect key={i} x={x} y={1020 - h} width={260} height={h} fill="#8a7a62" stroke={INK} strokeWidth={4} />)}
      <Mud y={1020} frame={frame} water />
      <Wagon x={430} y={GY + 40} sink={sink} spin={-sink * 0.4} />
      <Figure x={sx} y={sy + 20} s={ps} facing={-1} A1={A} A2={A + 6} lean={-14} colors={WORK2} frame={frame} expression="scared" />
      {/* hands on the rear wheel rim */}
      {(() => { const h = handAt(sx, sy + 20, ps, -1, A, -14); return <circle cx={h[0]} cy={h[1]} r={11} fill="#a87a5a" stroke={INK} strokeWidth={3} />; })()}
      <Label x={540} y={1390} lt={lt} at={0.2} text="WATER IN THE STREETS" size={38} />
    </g>
  );
};

// ---------- 3: 1854 — a man nails a CHOLERA notice to a door; a doctor carries his bag past ----------
export const SceneCholera: React.FC<SP> = ({ lt, frame }) => {
  const sx = 360, sy = GY + 60, ps = 1.1;
  const ph = (lt % 0.5) / 0.5;
  const A = lt < 1.2 ? lerpA(ph, [[0, -150], [0.6, -96], [1, -150]]) : -60;
  const h = handAt(sx, sy, ps, 1, A, 0);
  const dx = interpolate(lt, [0.3, 4], [1100, 760], cl);
  return (
    <g>
      <rect x={-60} y={0} width={1200} height={2300} fill="#8a7a62" />
      {Array.from({ length: 18 }, (_, i) => <line key={i} x1={-60 + i * 70} x2={-60 + i * 70} y1={0} y2={GY + 60} stroke="#6e604a" strokeWidth={4} />)}
      <rect x={440} y={560} width={260} height={GY + 60 - 560} fill="#5a3a24" stroke={INK} strokeWidth={5} />
      <g transform="translate(570 760) rotate(-2)"><rect x={-110} y={-80} width={220} height={160} fill="#f2ead2" stroke={INK} strokeWidth={4} /><text y={-28} textAnchor="middle" fontFamily="Georgia" fontWeight={700} fontSize={26} fill="#2a2a2a">NOTICE</text><text y={18} textAnchor="middle" fontFamily="Georgia" fontWeight={900} fontSize={40} fill="#8a1f1f">CHOLERA</text><line x1={-80} x2={80} y1={50} y2={50} stroke="#8a8478" strokeWidth={3} /></g>
      <rect x={-60} y={GY + 60} width={1200} height={1000} fill="#5a4a36" />
      <Figure x={sx} y={sy} s={ps} A1={A} A2={-90} colors={WORK1} frame={frame} expression="sad" />
      {/* hammer in the hand: head strikes the nail at the top of the swing-down */}
      <g transform={`translate(${h[0]} ${h[1]}) rotate(${A + 90})`}><rect x={-5} y={-70} width={10} height={80} fill="#7a5a3a" stroke={INK} strokeWidth={2} /><rect x={-22} y={-86} width={44} height={20} fill="#4a4a4e" stroke={INK} strokeWidth={2} /></g>
      <Figure x={dx} y={GY + 60} s={0.95} facing={-1} colors={DOC} frame={frame} walking expression="sad"><TopHat /></Figure>
      <Label x={540} y={1390} lt={lt} at={0.3} text="1854" size={44} bg="#7a1f1f" />
    </g>
  );
};

// ---------- 4: two workers set a big sewer pipe down on the street ----------
export const ScenePipe: React.FC<SP> = ({ lt, frame }) => {
  const down = interpolate(lt, [0.3, 1.4], [0, 1], cl);
  const py = 1050 + down * 90;
  const a1 = handAt(250, GY + 60, 1.0, 1, -100 + down * 20, 0), a2 = handAt(830, GY + 60, 1.0, -1, -100 + down * 20, 0);
  return (
    <g>
      <Sky top="#9cc6e0" bottom="#efe6cc" clouds={3} drift={lt} />
      <BrickRow x={-90} y={1000} n={4} w={330} h={420} rise={0} ground={1000} />
      <Mud y={1000} frame={frame} />
      <Pipe x={540} y={Math.min(py, (a1[1] + a2[1]) / 2 + 40)} len={520} />
      <Figure x={250} y={GY + 60} s={1.0} A1={-100 + down * 20} A2={-90 + down * 20} colors={WORK1} frame={frame} expression="determined" />
      <Figure x={830} y={GY + 60} s={1.0} facing={-1} A1={-100 + down * 20} A2={-90 + down * 20} colors={WORK3} frame={frame} expression="determined" />
      <circle cx={a1[0]} cy={a1[1]} r={12} fill="#eebf98" stroke={INK} strokeWidth={3} /><circle cx={a2[0]} cy={a2[1]} r={12} fill="#8a5a3a" stroke={INK} strokeWidth={3} />
      <Label x={540} y={1390} lt={lt} at={0.3} text="SEWERS ON THE STREET" size={38} />
    </g>
  );
};

// ---------- 5: a worker tips a wheelbarrow; dirt covers the pipe and the street level rises ----------
export const SceneFill: React.FC<SP> = ({ lt, frame }) => {
  const fill = interpolate(lt, [0.2, 1.9], [0, 1], cl);
  const tip = interpolate(lt, [0.1, 0.6], [0, 1], cl);
  const streetY = 1140 - fill * 150;
  const sx = 760, sy = streetY + 20, ps = 0.95;
  const h = handAt(sx, sy, ps, -1, -40 - tip * 30, 0);
  return (
    <g>
      <Sky top="#9cc6e0" bottom="#efe6cc" clouds={3} drift={lt} />
      <BrickRow x={-90} y={1140} n={4} w={330} h={420} rise={0} ground={1140} />
      <Pipe x={420} y={1080} len={620} r={60} />
      <path d={`M -60 ${streetY} L 1140 ${streetY} L 1140 2400 L -60 2400 Z`} fill="#8a6a44" />
      {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={rnd(i) * 1080} cy={streetY + 20 + rnd(i + 4) * 80} r={8} fill="#6a5034" />)}
      {/* wheelbarrow tipped forward from the handles in the hands */}
      <g transform={`translate(${h[0] - 150} ${h[1] + 60}) rotate(${-tip * 30})`}>
        <path d="M -120 -60 L 80 -60 L 50 10 L -100 10 Z" fill="#6a6e72" stroke={INK} strokeWidth={4} /><circle cx={-110} cy={30} r={26} fill="#3a2a1a" stroke={INK} strokeWidth={4} /><line x1={40} y1={-30} x2={150} y2={-60} stroke="#6a4a2a" strokeWidth={8} />
      </g>
      {tip > 0.5 && Array.from({ length: 8 }, (_, i) => <circle key={i} cx={h[0] - 290 - i * 10} cy={h[1] + 40 + ((lt * 300 + i * 30) % 120)} r={10} fill="#7a5a3a" />)}
      <Figure x={sx} y={sy} s={ps} facing={-1} A1={-40 - tip * 30} A2={-34 - tip * 30} lean={-8} colors={WORK2} frame={frame} expression="determined" />
      <Label x={540} y={1390} lt={lt} at={0.3} text="FEET OF NEW DIRT" size={38} />
    </g>
  );
};

// ---------- 6: diagram — the street is now higher than the doors; the building rises to meet it ----------
export const SceneLevel: React.FC<SP> = ({ lt, frame }) => {
  const rise = interpolate(lt, [0.8, 2.6], [0, 150], { ...cl, easing: ease });
  return (
    <g>
      <Sky top="#9cc6e0" bottom="#efe6cc" clouds={2} drift={lt} />
      <rect x={-60} y={1100} width={1200} height={1300} fill="#6a5034" />
      <path d="M 560 950 L 1140 950 L 1140 2400 L 560 2400 Z" fill="#8a6a44" stroke={INK} strokeWidth={4} />
      <Pipe x={850} y={1030} len={500} r={50} />
      <BrickRow x={60} y={1100} n={1} w={460} h={560} rise={rise} ground={1100} jacks={4} turn={frame * 9} signs={["SHOP"]} />
      <line x1={-60} x2={1140} y1={950} y2={950} stroke="#fff3c4" strokeWidth={6} strokeDasharray="22 14" />
      <Label x={820} y={900} lt={lt} at={0.2} text="NEW STREET LEVEL" size={34} />
      {rise < 140 && <path d="M 290 1090 L 290 970 M 270 1000 L 290 970 L 310 1000" stroke="#ffd23f" strokeWidth={10} fill="none" strokeLinecap="round" opacity={lt > 0.6 ? 1 : 0} />}
      <Label x={540} y={1390} lt={lt} at={0.5} text="RAISE EVERY BUILDING" size={38} />
    </g>
  );
};

// ---------- 7: the LAKE ST. sign; a foreman looks up at the row and waves the crew in ----------
export const SceneLakeSt: React.FC<SP> = ({ lt, frame }) => {
  const A = lerpA(lt, [[0, -10], [0.6, -150], [1.0, -110], [1.3, -150]]);
  return (
    <g>
      <Sky top="#9cc6e0" bottom="#efe6cc" clouds={3} drift={lt} />
      <BrickRow x={-90} y={1160} n={4} w={330} h={600} rise={0} ground={1160} signs={["HARDWARE", "DRY GOODS", "BOOKS", "TEA"]} />
      <Mud y={1160} frame={frame} />
      <line x1={180} y1={GY + 60} x2={180} y2={700} stroke="#3a2a1e" strokeWidth={14} />
      <rect x={60} y={690} width={260} height={70} fill="#1f3a2a" stroke={INK} strokeWidth={4} /><text x={190} y={740} textAnchor="middle" fontFamily="Georgia" fontWeight={700} fontSize={40} fill="#f2e3b5">LAKE ST.</text>
      <Figure x={560} y={GY + 60} s={1.05} A1={A} A2={-10} colors={WORK3} frame={frame} expression="determined" />
      {[0, 1, 2].map((i) => <Figure key={i} x={1100 - interpolate(lt, [0.6, 1.6], [0, 200], cl) + i * 90} y={GY + 60} s={0.8} facing={-1} colors={i % 2 ? WORK1 : WORK2} frame={frame + i * 5} walking={lt > 0.6 && lt < 1.6} />)}
    </g>
  );
};

// ---------- 8: wide — the whole row on timbers, 600 men at the jacks underneath ----------
export const SceneRow: React.FC<SP> = ({ lt, frame }) => {
  const rise = 110;
  return (
    <g>
      <Sky top="#9cc6e0" bottom="#efe6cc" clouds={3} drift={lt} />
      <Mud y={1180} frame={frame} />
      <BrickRow x={-110} y={1180} n={6} w={220} h={460} rise={rise} ground={1180} jacks={14} turn={frame * 9} />
      {Array.from({ length: 16 }, (_, i) => { const A = -70 + Math.sin(frame * 0.35 + i * 0.9) * 22; return <Figure key={i} x={-60 + i * 76} y={1186} s={0.26} A1={A} A2={A + 10} colors={[WORK1, WORK2, WORK3][i % 3]} frame={frame} />; })}
      {Array.from({ length: 20 }, (_, i) => <Figure key={`c${i}`} x={-40 + i * 60} y={1330} s={0.3} facing={rnd(i) > 0.5 ? 1 : -1} colors={[GENT, LADY, WORK2][i % 3]} frame={frame} A1={rnd(i + 4) > 0.7 ? -150 : -10} A2={0} expression="happy" />)}
      <Label x={540} y={1460} lt={lt} at={0.6} text="CROWDS CAME TO WATCH" size={34} />
    </g>
  );
};

// ---------- 9: close — a worker turns his jackscrew bar; the next man turns his, out of phase ----------
export const SceneScrew: React.FC<SP> = ({ lt, frame }) => {
  const P = 1.1;
  const ph = (lt % P) / P;
  const turn = lt * 120;
  const sx = 330, sy = GY + 60, ps = 1.4;
  const A = lerpA(ph, [[0, -60], [0.5, -100], [1, -60]]);
  const h = handAt(sx, sy, ps, 1, A, 6);
  const jx = 640, jy = GY + 60;
  return (
    <g>
      <rect x={-60} y={0} width={1200} height={2300} fill="#2a1e16" />
      <rect x={-60} y={600} width={1200} height={60} fill="#7a5a3a" stroke={INK} strokeWidth={5} />
      <rect x={-60} y={400} width={1200} height={200} fill="#9a4a34" />
      <rect x={-60} y={GY + 60} width={1200} height={1000} fill="#5a4430" />
      <Jack x={jx} y={jy} h={jy - 660} s={2.2} turn={turn} />
      <Jack x={980} y={jy} h={jy - 660} s={1.6} turn={turn + 90} />
      <Figure x={sx} y={sy} s={ps} A1={A} A2={A + 8} lean={6} colors={WORK1} frame={frame} expression="determined" />
      {/* bar from the hand into the jack's collar */}
      <line x1={h[0]} y1={h[1]} x2={jx - 10} y2={jy - 49 * 2.2} stroke="#3a3a3a" strokeWidth={14} strokeLinecap="round" />
      <circle cx={h[0]} cy={h[1]} r={16} fill="#eebf98" stroke={INK} strokeWidth={3} />
      <Figure x={1080} y={sy} s={1.0} facing={-1} A1={-70 + Math.sin(lt * 5.7 + 2) * 20} A2={-62} colors={WORK3} frame={frame} expression="determined" />
      <Label x={540} y={1390} lt={lt} at={0.3} text="A LITTLE AT A TIME" size={40} />
    </g>
  );
};

// ---------- 10: the block has risen; a foreman checks the height with a measuring rod ----------
export const SceneRise: React.FC<SP> = ({ lt, frame }) => {
  const rise = interpolate(lt, [0, 2.4], [110, 220], cl);
  const sx = 900, ps = 1.0;
  const h = handAt(sx, 1290, ps, -1, -60, 0);
  return (
    <g>
      <Sky top="#9cc6e0" bottom="#efe6cc" clouds={3} drift={lt} />
      <Mud y={1180} frame={frame} />
      <BrickRow x={-90} y={1180} n={3} w={300} h={520} rise={rise} ground={1180} jacks={7} turn={frame * 9} signs={["HARDWARE", "DRY GOODS", "BOOKS"]} />
      {/* measuring rod held at the base of the wall */}
      <g transform={`translate(${h[0] - 30} 1180)`}>
        <rect x={-12} y={-260} width={24} height={260} fill="#efe2c4" stroke={INK} strokeWidth={3} />
        {Array.from({ length: 5 }, (_, i) => <g key={i}><line x1={-12} x2={14} y1={-i * 55} y2={-i * 55} stroke={INK} strokeWidth={3} /><text x={-20} y={-i * 55 + 8} textAnchor="end" fontFamily="Inter" fontWeight={900} fontSize={22} fill="#fff">{i} FT</text></g>)}
      </g>
      <Figure x={sx} y={1290} s={ps} facing={-1} A1={-60} A2={-20} colors={WORK3} frame={frame} expression="happy" />
      <Label x={540} y={1460} lt={lt} at={0.3} text="UP MORE THAN 4 FEET" size={38} />
    </g>
  );
};

// ---------- 11: inside the shop — business as usual: the clerk wraps a parcel, a lady takes it ----------
export const SceneShop: React.FC<SP> = ({ lt, frame }) => {
  const give = interpolate(lt, [0.6, 1.4], [0, 1], cl);
  const cx = 360, lx = 720, fy = GY + 60;
  const ch = handAt(cx, fy, 1.15, 1, -84, 0), lh = handAt(lx, fy, 1.15, -1, -60 - give * 26, 0);
  const pk: V2 = give < 1 ? [ch[0] + (lh[0] - ch[0]) * give, ch[1] + (lh[1] - ch[1]) * give] : lh;
  return (
    <g>
      <rect x={-60} y={0} width={1200} height={2300} fill="#c8a878" />
      {Array.from({ length: 5 }, (_, r) => <rect key={r} x={-60} y={300 + r * 120} width={420} height={14} fill="#7a5a3a" />)}
      {Array.from({ length: 14 }, (_, i) => <rect key={i} x={-40 + (i % 7) * 56} y={250 + Math.floor(i / 7) * 240} width={44} height={50} fill={["#8a3a3a", "#3a5a8a", "#6a7a3a"][i % 3]} stroke={INK} strokeWidth={2} />)}
      <Window x={620} y={300} w={380} h={420} sky="#9cc6e0"><rect x={600} y={620} width={420} height={120} fill="#6a5034" /><rect x={600} y={560} width={420} height={60} fill="#1a120c" /></Window>
      <Label x={810} y={280} lt={lt} at={0.2} text="STREET BELOW" size={26} />
      <rect x={-60} y={fy} width={1200} height={1000} fill="#7a5a3a" />
      <Figure x={cx} y={fy} s={1.15} A1={-84} A2={-70} colors={CLERK} frame={frame} expression="happy" />
      <Skirt x={lx} y={fy} s={1.15} color="#6a3a5a" />
      <Figure x={lx} y={fy} s={1.15} facing={-1} A1={-60 - give * 26} A2={-10} colors={LADY} frame={frame} expression="happy"><Bonnet /></Figure>
      <rect x={430} y={1010} width={240} height={290} fill="#8a5a34" stroke={INK} strokeWidth={4} />
      <rect x={pk[0] - 30} y={pk[1] - 26} width={60} height={46} fill="#d8b47a" stroke={INK} strokeWidth={3} /><line x1={pk[0]} x2={pk[0]} y1={pk[1] - 26} y2={pk[1] + 20} stroke="#8a3a2a" strokeWidth={3} />
      <Label x={540} y={1390} lt={lt} at={0.3} text="BUSINESS AS USUAL" size={40} />
    </g>
  );
};

// ---------- 12: the six-storey Tremont House rises on its jacks ----------
export const SceneHotel: React.FC<SP> = ({ lt, frame }) => {
  const rise = interpolate(lt, [0, 2.6], [20, 150], cl);
  return (
    <g>
      <Sky top="#8ab8d8" bottom="#efe6cc" clouds={3} drift={lt} />
      <Mud y={1220} frame={frame} />
      <Hotel x={220} y={1220} rise={rise} ground={1220} frame={frame} turn={frame * 9} />
      {Array.from({ length: 7 }, (_, i) => { const A = -70 + Math.sin(frame * 0.35 + i) * 22; return <Figure key={i} x={250 + i * 93} y={1226} s={0.3} A1={A} A2={A + 10} colors={[WORK1, WORK2, WORK3][i % 3]} frame={frame} />; })}
      <Label x={540} y={1390} lt={lt} at={0.3} text="SIX STORIES · UP SIX FEET" size={36} />
    </g>
  );
};

// ---------- 13: a guest at a hotel window reads the paper; his teacup trembles; he glances down ----------
export const SceneGuest: React.FC<SP> = ({ lt, frame }) => {
  const shake = Math.sin(frame * 1.7) * 1.5;
  const look = lt > 1.2;
  const gx = 480, gy = 1400, ps = 1.4;
  const h = handAt(gx, gy, ps, 1, -96, 0);
  return (
    <g>
      <rect x={-60} y={0} width={1200} height={2300} fill="#cfc2a4" />
      {Array.from({ length: 30 }, (_, i) => <line key={i} x1={-60} x2={1140} y1={i * 60} y2={i * 60} stroke="#bfb294" strokeWidth={2} />)}
      <rect x={160} y={420} width={760} height={760} fill="#2a2420" stroke={INK} strokeWidth={8} />
      <rect x={190} y={450} width={700} height={700} fill="#d8c8a0" />
      <rect x={190} y={450} width={700} height={700} fill="#ffe6b0" opacity={0.35} />
      <g transform={`translate(0 ${shake})`}>
        <Figure x={gx} y={gy} s={ps} facing={1} A1={-96} A2={-80} colors={GENT} frame={frame} expression={look ? "scared" : "neutral"} />
        <g transform={`translate(${h[0] + 40} ${h[1] - 60})`}><rect x={-80} y={-70} width={160} height={120} fill="#f2ead2" stroke={INK} strokeWidth={3} />{[0, 1, 2, 3, 4].map((i) => <line key={i} x1={-66} x2={66} y1={-46 + i * 20} y2={-46 + i * 20} stroke="#8a8478" strokeWidth={3} />)}<text y={-50} textAnchor="middle" fontFamily="Georgia" fontWeight={700} fontSize={18} fill="#2a2a2a">TRIBUNE</text></g>
      </g>
      <rect x={160} y={1150} width={760} height={40} fill="#6a5a44" stroke={INK} strokeWidth={4} />
      <g transform={`translate(780 ${1128 + shake * 2})`}><path d="M -26 -30 L 26 -30 L 20 10 L -20 10 Z" fill="#f6f4ee" stroke={INK} strokeWidth={3} /><ellipse cx={0} cy={12} rx={40} ry={8} fill="#f6f4ee" stroke={INK} strokeWidth={3} />{lt % 0.6 < 0.3 && <path d="M 0 -40 q 10 -20 0 -40" stroke="#fff" strokeWidth={4} fill="none" opacity={0.7} />}</g>
      <rect x={-60} y={1190} width={1200} height={1200} fill="#cfc2a4" />
      <Label x={540} y={1390} lt={lt} at={0.3} text="GUESTS STILL INSIDE" size={40} />
    </g>
  );
};
