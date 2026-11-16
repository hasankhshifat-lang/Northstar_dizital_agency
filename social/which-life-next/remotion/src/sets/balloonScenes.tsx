import React from "react";
import { interpolate, Easing } from "remotion";
import { Person, Sky } from "./ponyScenes";
import { Label } from "./chickenScenes";
import { handAt } from "./madridScenes";
import { KitColors } from "../kit/Kit";

/**
 * Ground scenes for "Japan Bombed Oregon With Paper Balloons" (Fu-Go, 1944–45; Bly, Oregon, 5 May 1945).
 * lt = seconds since the scene started. Kit side pose: feet at (0,0), shoulder pivot (0,-284), straight-arm hand = handAt().
 * Scenes are drawn at GY and shifted −130 px by the story.
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

// ---------- people (1940s) ----------
const hair = (h: string): Partial<KitColors> => ({ hair: h, capStyle: "hair" });
const dress = (c: string, d: string, l: string, h: string): Partial<KitColors> => ({ coat: c, coatShade: d, coatLight: l, patch: l, scarf: "#f2ead8", scarfShade: "#d8cfbb", trousers: c, trousersShade: d, button: "#f2ead8", ...hair(h) });
/** Elsie Mitchell: 1940s Sunday dress */
export const ELSIE = dress("#5b7fa6", "#476689", "#6e93ba", "#6a3a1e");
const KIDS: Partial<KitColors>[] = [
  { coat: "#9a4a3a", coatShade: "#7a382c", coatLight: "#b05a48", patch: "#b05a48", scarf: "#e8e0cc", trousers: "#4a4a52", trousersShade: "#3a3a40", ...hair("#7a4a22") },
  { coat: "#4a6a4a", coatShade: "#38523a", coatLight: "#5a7c5a", patch: "#5a7c5a", scarf: "#e8e0cc", trousers: "#3e4a5c", trousersShade: "#2e3846", ...hair("#3a2a1e") },
  dress("#b0604a", "#8e4c3a", "#c4745c", "#a8622f"),
  { coat: "#c9a227", coatShade: "#9b7c18", coatLight: "#dbb440", patch: "#dbb440", scarf: "#e8e0cc", trousers: "#5a4a3a", trousersShade: "#463a2c", ...hair("#c08a4a") },
  { coat: "#3e5a7a", coatShade: "#2e4660", coatLight: "#4e6c8e", patch: "#4e6c8e", scarf: "#e8e0cc", trousers: "#4a3e32", trousersShade: "#3a3026", ...hair("#5a3a20") },
];
/** Archie Mitchell, pastor: dark suit, hat */
export const ARCHIE: Partial<KitColors> = { coat: "#3a3c44", coatShade: "#2a2c32", coatLight: "#4a4c56", patch: "#4a4c56", scarf: "#efe8d6", scarfShade: "#cfc6b0", trousers: "#2e3036", trousersShade: "#22242a", button: "#888", cap: "#4a3e32", capShade: "#3a3026", capBand: "#1a1410", hair: "#4a3420" };
const EDITOR: Partial<KitColors> = { coat: "#e8e4da", coatShade: "#c8c2b4", coatLight: "#f6f2e8", patch: "#c8c2b4", scarf: "#7a2a2a", scarfShade: "#5a1e1e", trousers: "#4a4440", trousersShade: "#3a3430", button: "#888", ...hair("#3a2a1e") };
/** Imperial Japanese Army: khaki uniform and field cap */
const IJA: Partial<KitColors> = { coat: "#8a7a4a", coatShade: "#6e6038", coatLight: "#9c8c5a", patch: "#9c8c5a", scarf: "#8a7a4a", scarfShade: "#6e6038", trousers: "#7a6c40", trousersShade: "#625630", button: "#c9a227", cap: "#7a6c40", capShade: "#625630", capBand: "#3a3020", hair: "#1a1410" };
const GIRL: Partial<KitColors> = dress("#24304a", "#1a2438", "#303e5c", "#141010");

/** skirt over the Kit legs (side pose), drawn in world space at the figure's feet */
const Skirt: React.FC<{ x: number; y: number; s: number; color: string; shade: string; lean?: number }> = ({ x, y, s, color, shade, lean = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${lean}) scale(${s})`}>
    <path d="M -44 -176 L 44 -176 L 64 -62 Q 0 -50 -64 -62 Z" fill={color} stroke={INK} strokeWidth={4 / s} />
    <path d="M 6 -170 L 22 -60" stroke={shade} strokeWidth={6} />
  </g>
);

// ---------- props ----------
/** Fu-Go payload: metal ring with sandbags, a bomb hanging under it. (x,y) = ring centre */
export const Payload: React.FC<{ x: number; y: number; s?: number; rot?: number; bomb?: boolean }> = ({ x, y, s = 1, rot = 0, bomb = true }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={70} ry={16} fill="none" stroke="#3a3c40" strokeWidth={9} />
    {[-58, -30, 30, 58].map((bx, i) => <g key={i}><line x1={bx} y1={6} x2={bx} y2={34} stroke="#3a3c40" strokeWidth={3} /><ellipse cx={bx} cy={44} rx={13} ry={16} fill="#c8b48a" stroke={INK} strokeWidth={3} /></g>)}
    {bomb && <g>
      <line x1={0} y1={10} x2={0} y2={40} stroke="#3a3c40" strokeWidth={4} />
      <rect x={-17} y={40} width={34} height={86} rx={15} fill="#4a5440" stroke={INK} strokeWidth={4} />
      <path d="M -17 112 L -30 140 L 30 140 L 17 112 Z" fill="#3a4232" stroke={INK} strokeWidth={4} />
      <rect x={-17} y={60} width={34} height={8} fill="#c9a227" />
    </g>}
  </g>
);
/** deflated paper envelope lying on the ground, shroud lines running to the payload ring */
const Envelope: React.FC<{ x: number; y: number; s?: number; tug?: number; ring?: V2 }> = ({ x, y, s = 1, tug = 0, ring }) => {
  const rg: V2 = ring ?? [x + 250 * s, y - 40 * s - tug * 30];
  return (
    <g>
      {Array.from({ length: 7 }, (_, i) => <line key={i} x1={x - 160 * s + i * 50 * s} y1={y - 40 * s - Math.sin(i * 0.9) * 30 * s} x2={rg[0]} y2={rg[1]} stroke="#6a5a44" strokeWidth={3} opacity={0.85} />)}
      <path d={`M ${x - 230 * s} ${y} Q ${x - 220 * s} ${y - 110 * s} ${x - 120 * s} ${y - 120 * s} Q ${x - 40 * s} ${y - 170 * s} ${x + 40 * s} ${y - 110 * s} Q ${x + 120 * s} ${y - 120 * s} ${x + 140 * s} ${y} Z`} fill="#d9d4c4" stroke={INK} strokeWidth={4} />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${x - 190 * s + i * 80 * s} ${y - 6} q ${20 * s} ${-70 * s} ${60 * s} ${-90 * s}`} stroke="#b8b2a0" strokeWidth={4} fill="none" />)}
      <Payload x={rg[0]} y={rg[1]} s={0.8 * s} rot={tug * 12} />
    </g>
  );
};
const Pine: React.FC<{ x: number; y: number; h: number; c: string; c2?: string }> = ({ x, y, h, c, c2 }) => (
  <g>
    <rect x={x - h * 0.03} y={y - h * 0.25} width={h * 0.06} height={h * 0.25} fill="#4a3424" />
    {[0, 1, 2, 3].map((i) => { const w = h * (0.34 - i * 0.07), yy = y - h * 0.18 - i * h * 0.2; return <path key={i} d={`M ${x - w} ${yy} L ${x} ${yy - h * 0.34} L ${x + w} ${yy} Z`} fill={i % 2 ? (c2 ?? c) : c} />; })}
  </g>
);
/** Gearhart Mountain woods, ponderosa pines; scroll in px for tracking shots */
const Woods: React.FC<{ scroll?: number; floor?: number }> = ({ scroll = 0, floor = GY + 250 }) => (
  <g>
    <Sky top="#8ab8d8" bottom="#e2eef0" clouds={3} drift={scroll / 40} />
    <path d={`M -60 ${floor - 420} Q 260 ${floor - 560} 540 ${floor - 470} T 1140 ${floor - 500} L 1140 ${floor} L -60 ${floor} Z`} fill="#7a96a0" />
    {Array.from({ length: 14 }, (_, i) => { const x = (((i * 110 - scroll * 0.3) % 1540) + 1540) % 1540 - 230; return <Pine key={`f${i}`} x={x} y={floor - 160} h={420 + rnd(i) * 120} c="#4e6e5a" c2="#5a7a64" />; })}
    <rect x={-60} y={floor - 170} width={1200} height={2200} fill="#9a8a5e" />
    {Array.from({ length: 8 }, (_, i) => { const x = (((i * 220 - scroll * 0.7) % 1760) + 1760) % 1760 - 340; return <Pine key={`m${i}`} x={x} y={floor - 60} h={760 + rnd(i + 30) * 200} c="#2f5240" c2="#3a5e4a" />; })}
    {Array.from({ length: 22 }, (_, i) => { const x = (((rnd(i + 5) * 1200 - scroll) % 1300) + 1300) % 1300 - 110; return <path key={`n${i}`} d={`M ${x} ${floor + 40 + rnd(i) * 300} l 26 -6`} stroke="#7a6a44" strokeWidth={4} />; })}
  </g>
);

// ---------- 1 + LOOP: the picnic group around the balloon they found ----------
/** u = 0 is frame 0 (a boy reaching toward the ring, the others leaning in). The loop runs u from −dur up to 0 (the group walks in). */
export const SceneFind: React.FC<SP & { u0?: number }> = ({ lt, u0 = 0 }) => {
  const u = lt + u0;
  const floor = GY + 250, s = 1.4, ks = 1.06;
  const walkIn = (x0: number, delay: number) => (u < -0.35 - delay ? x0 - (-0.35 - delay - u) * 210 : x0);
  const walking = (delay: number) => u < -0.35 - delay;
  const reach = lerpA(u, [[-0.5, -10], [0, -58], [1.6, -70], [3.6, -76]]);
  const leanK = lerpA(u, [[-0.5, 0], [0, 12], [3, 16]]);
  const ex = walkIn(140, 0);
  const point = lerpA(u, [[-0.4, -15], [0.2, -72], [2.5, -72], [3.2, -45]]);
  const kx = [walkIn(450, 0.15), walkIn(330, 0.25), walkIn(250, 0.05)];
  return (
    <g>
      <Woods />
      <Envelope x={860} y={floor - 10} s={1.25} ring={[650, floor - 150]} />
      <Person x={1010} y={floor - 30} s={ks * 0.92} kit={{ pose: "side", facing: -1, colors: KIDS[3], lean: -leanK * 0.6, armAngle: -25, expression: "happy" }} />
      <Person x={900} y={floor + 40} s={ks} kit={{ pose: "side", facing: -1, colors: KIDS[4], armAngle: -40, farArmAngle: -10, lean: -6, expression: "neutral" }} />
      <Person x={ex} y={floor} s={s} kit={{ pose: "side", facing: 1, walking: walking(0), colors: ELSIE, armAngle: walking(0) ? undefined : point, farArmAngle: -8, expression: "neutral" }} />
      <Skirt x={ex} y={floor} s={s} color="#5b7fa6" shade="#476689" />
      <Person x={kx[2]} y={floor + 30} s={ks} kit={{ pose: "side", facing: 1, walking: walking(0.05), colors: KIDS[2], armAngle: -10, expression: "happy" }} />
      <Skirt x={kx[2]} y={floor + 30} s={ks} color="#b0604a" shade="#8e4c3a" />
      <Person x={kx[1]} y={floor + 10} s={ks} kit={{ pose: "side", facing: 1, walking: walking(0.25), colors: KIDS[1], lean: walking(0.25) ? 0 : leanK * 0.5, armAngle: -25, expression: "neutral" }} />
      <Person x={kx[0]} y={floor + 40} s={ks} kit={{ pose: "side", facing: 1, walking: walking(0.15), colors: KIDS[0], lean: walking(0.15) ? 0 : leanK, armAngle: walking(0.15) ? undefined : reach, expression: "happy" }} />
    </g>
  );
};

// ---------- 2: "No plane ever came near." low angle into an empty sky ----------
export const SceneSky: React.FC<SP> = ({ lt, frame }) => {
  const tilt = lerpA(lt, [[0, 0], [2.2, 160]]);
  const shade = lerpA(lt, [[0, -40], [0.5, -135], [1.4, -135], [2.2, -60]]);
  const turn = lt > 1.2;
  return (
    <g>
      <g transform={`translate(0 ${tilt})`}>
        <rect x={-60} y={-600} width={1200} height={700} fill="#7aaed2" />
        <Sky top="#7aaed2" bottom="#dceaf0" clouds={4} drift={frame / 30} />
        <rect x={-60} y={1240} width={1200} height={900} fill="#9a8a5e" />
        {[[-20, 1300, 1500], [1120, 1300, 1600], [140, 1380, 1100], [960, 1380, 1200]].map(([x, y, h], i) => <Pine key={i} x={x} y={y} h={h} c="#24442f" c2="#2c4e38" />)}
      </g>
      <Person x={turn ? 640 : 380} y={GY + 520} s={1.9} kit={{ pose: "side", facing: (turn ? -1 : 1) as 1 | -1, colors: KIDS[1], armAngle: shade, farArmAngle: -10, lean: -6, expression: "neutral" }} />
      <Label x={720} y={520} lt={lt} at={0.9} text="NO PLANE" size={56} />
    </g>
  );
};

// ---------- 4: a balloon inflated in a big hall (Japan built them indoors) ----------
export const SceneHall: React.FC<SP> = ({ lt, frame }) => {
  const r = lerpA(lt, [[0, 170], [3.0, 300]]);
  const cx = 540, floor = GY + 250, cy = 620 + (300 - r) * 0.6;
  const pull = Math.sin(frame * 0.12) * 2;
  return (
    <g>
      <rect x={-60} y={-60} width={1200} height={2200} fill="#4a4036" />
      {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M ${-60 + i * 200} 120 Q ${40 + i * 200} 40 ${140 + i * 200} 120`} stroke="#2e2822" strokeWidth={14} fill="none" />)}
      <rect x={-60} y={floor} width={1200} height={900} fill="#6a5a46" />
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1={-60 + i * 100} y1={floor} x2={-200 + i * 130} y2={2000} stroke="#5a4c3a" strokeWidth={4} />)}
      <circle cx={cx} cy={cy} r={r} fill="#dcd6c4" stroke={INK} strokeWidth={5} />
      {[-0.66, -0.33, 0, 0.33, 0.66].map((k, i) => <ellipse key={i} cx={cx} cy={cy} rx={Math.abs(k) * r} ry={r} fill="none" stroke="#bdb6a2" strokeWidth={3} />)}
      <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.25} fill="none" stroke="#bdb6a2" strokeWidth={3} />
      <ellipse cx={cx - r * 0.35} cy={cy - r * 0.4} rx={r * 0.18} ry={r * 0.1} fill="#fff" opacity={0.35} />
      {/* mooring ropes held by workers on both sides */}
      {[[220, -1], [860, 1]].map(([wx, f], i) => {
        const h = handAt(wx, floor, 1.35, (f === -1 ? 1 : -1) as 1 | -1, -70 + pull * f, 14);
        return <g key={i}>
          <line x1={cx + (f as number) * r * 0.7} y1={cy + r * 0.7} x2={h[0]} y2={h[1]} stroke="#6a5a44" strokeWidth={5} />
          <Person x={wx} y={floor} s={1.35} kit={{ pose: "side", facing: (f === -1 ? 1 : -1) as 1 | -1, colors: IJA, armAngle: -70 + pull * f, farArmAngle: -64 + pull * f, lean: 14 * (f === -1 ? -1 : 1) * -1, expression: "determined" }} />
        </g>;
      })}
      <Label x={900} y={460} lt={lt} at={2.0} text="PAPER" size={58} />
    </g>
  );
};

// ---------- 5: schoolgirls glue paper panels with paste ----------
export const SceneGlue: React.FC<SP> = ({ lt, frame }) => {
  const floor = GY + 250, s = 1.15, top = floor - 200;
  const stroke = Math.sin(frame * 0.35);
  const bA = -78 + stroke * 8;
  const bh = handAt(300, floor, s, 1, bA, 10);
  const press = lerpA(lt, [[0, -40], [0.6, -70], [2.2, -70]]);
  const ph = handAt(800, floor, s, -1, press, 12);
  const laid = lt > 0.6;
  return (
    <g>
      <rect x={-60} y={-60} width={1200} height={2200} fill="#c8b896" />
      <rect x={160} y={260} width={300} height={360} fill="#e8dcc0" stroke={INK} strokeWidth={5} />
      {[0, 1, 2].map((i) => <line key={i} x1={160} x2={460} y1={340 + i * 100} y2={340 + i * 100} stroke="#b8a888" strokeWidth={4} />)}
      <rect x={-60} y={floor} width={1200} height={900} fill="#8a7458" />
      <Person x={300} y={floor} s={s} kit={{ pose: "side", facing: 1, colors: GIRL, armAngle: bA, farArmAngle: -60, lean: 10, expression: "determined" }} />
      <Skirt x={300} y={floor} s={s} color="#24304a" shade="#1a2438" lean={10} />
      <Person x={800} y={floor} s={s} kit={{ pose: "side", facing: -1, colors: GIRL, armAngle: press, farArmAngle: -50, lean: -12, expression: "neutral" }} />
      <Skirt x={800} y={floor} s={s} color="#24304a" shade="#1a2438" lean={-12} />
      {/* table + paper panels */}
      <rect x={300} y={top} width={500} height={26} fill="#7a5a3a" stroke={INK} strokeWidth={4} />
      <rect x={340} y={top + 26} width={18} height={200} fill="#6a4a2e" /><rect x={740} y={top + 26} width={18} height={200} fill="#6a4a2e" />
      <rect x={380} y={top - 12} width={180} height={12} fill="#efe9d8" stroke={INK} strokeWidth={3} />
      <rect x={380} y={top - 12} width={Math.min(180, 40 + ((frame * 6) % 140))} height={12} fill="#d8cfa8" opacity={0.8} />
      {laid ? <rect x={540} y={top - 22} width={200} height={12} fill="#f4efe0" stroke={INK} strokeWidth={3} /> : <rect x={ph[0] - 100} y={ph[1] - 6} width={200} height={12} fill="#f4efe0" stroke={INK} strokeWidth={3} />}
      {/* paste brush held in the near hand */}
      <line x1={bh[0]} y1={bh[1]} x2={bh[0] + 70} y2={top - 14} stroke="#7a5a34" strokeWidth={9} strokeLinecap="round" />
      <path d={`M ${bh[0] + 62} ${top - 30} l 26 0 l 4 20 l -34 0 Z`} fill="#d8c8a0" stroke={INK} strokeWidth={3} />
      <rect x={600} y={top - 40} width={50} height={40} rx={6} fill="#a8a094" stroke={INK} strokeWidth={4} />
      <Label x={540} y={620} lt={lt} at={0.4} text="SCHOOLGIRLS" size={56} />
    </g>
  );
};

// ---------- 6: a soldier hooks the bomb under the ring, the balloon is let go ----------
export const SceneLaunch: React.FC<SP> = ({ lt }) => {
  const floor = GY + 250, s = 1.2;
  const rise = Easing.in(Easing.quad)(interpolate(lt, [1.05, 1.9], [0, 1], cl)) * 520;
  const ring: V2 = [600, floor - 330 - rise];
  const A = lerpA(lt, [[0, -20], [0.85, -132], [1.2, -132], [1.6, -40]]);
  const h = handAt(470, floor, s, 1, A, 0);
  const hooked = lt > 0.85;
  const bombAt: V2 = hooked ? [ring[0], ring[1] + 0.8 * 40] : [h[0] - 8, h[1] - 30];
  const look = lt > 1.1;
  return (
    <g>
      <Sky top="#e8b88a" bottom="#f6e2c0" sun={{ x: 880, y: 560, r: 70, color: "#fff2c0" }} />
      <rect x={-60} y={floor - 200} width={1200} height={200} fill="#5a8a96" />
      <rect x={-60} y={floor} width={1200} height={900} fill="#c8b488" />
      <circle cx={ring[0]} cy={ring[1] - 380} r={300} fill="#dcd6c4" stroke={INK} strokeWidth={5} />
      <ellipse cx={ring[0]} cy={ring[1] - 380} rx={150} ry={300} fill="none" stroke="#bdb6a2" strokeWidth={3} />
      {[-200, -100, 0, 100, 200].map((dx, i) => <line key={i} x1={ring[0] + dx} y1={ring[1] - 140} x2={ring[0]} y2={ring[1]} stroke="#6a5a44" strokeWidth={3} />)}
      <Payload x={ring[0]} y={ring[1]} s={0.8} bomb={false} />
      <g transform={`translate(${bombAt[0]} ${bombAt[1]}) scale(0.8)`}>
        <rect x={-17} y={0} width={34} height={86} rx={15} fill="#4a5440" stroke={INK} strokeWidth={4} />
        <path d="M -17 72 L -30 100 L 30 100 L 17 72 Z" fill="#3a4232" stroke={INK} strokeWidth={4} />
        <rect x={-17} y={20} width={34} height={8} fill="#c9a227" />
      </g>
      {!hooked && <circle cx={h[0]} cy={h[1]} r={15} fill="#eebf98" stroke={INK} strokeWidth={3} />}
      <Person x={470} y={floor} s={s} kit={{ pose: "side", facing: 1, colors: IJA, armAngle: A, farArmAngle: look ? -150 : -40, lean: look ? -8 : 0, expression: "determined" }} />
      <Person x={880} y={floor + 20} s={1.05} kit={{ pose: "side", facing: -1, colors: IJA, armAngle: look ? -60 : -90, farArmAngle: -20, expression: "neutral" }} />
      <Label x={300} y={560} lt={lt} at={0.5} text="BOMBS" size={58} />
    </g>
  );
};

// ---------- 9: an American editor spikes the balloon story ----------
export const SceneNewsroom: React.FC<SP> = ({ lt }) => {
  const floor = GY + 250, s = 1.2, x = 360, top = floor - 230;
  const A = lerpA(lt, [[0, -60], [0.6, -110], [1.4, -110], [2.4, -70], [3.2, -70]]);
  const h = handAt(x, floor, s, 1, A, 6);
  const spiked = lt > 2.3;
  const spike: V2 = [700, top - 10];
  return (
    <g>
      <rect x={-60} y={-60} width={1200} height={2200} fill="#9a8c74" />
      <rect x={560} y={260} width={420} height={300} fill="#c8bca0" stroke={INK} strokeWidth={5} />
      <text x={770} y={330} textAnchor="middle" fontFamily="Georgia" fontWeight={700} fontSize={40} fill="#3a2e22">THE DAILY</text>
      <rect x={600} y={350} width={340} height={8} fill="#3a2e22" /><rect x={600} y={380} width={300} height={6} fill="#6a5e4a" /><rect x={600} y={404} width={320} height={6} fill="#6a5e4a" />
      <rect x={-60} y={floor} width={1200} height={900} fill="#6a5440" />
      <rect x={380} y={top} width={520} height={28} fill="#5a3e28" stroke={INK} strokeWidth={4} />
      <rect x={420} y={top + 28} width={20} height={200} fill="#4a321e" /><rect x={840} y={top + 28} width={20} height={200} fill="#4a321e" />
      {/* typewriter */}
      <path d={`M 450 ${top} L 470 ${top - 70} L 600 ${top - 70} L 620 ${top} Z`} fill="#2a2a2e" stroke={INK} strokeWidth={4} />
      <rect x={460} y={top - 92} width={150} height={20} rx={8} fill="#3a3a40" stroke={INK} strokeWidth={3} />
      {/* paper spike */}
      <rect x={spike[0] - 30} y={top - 12} width={60} height={12} fill="#555" stroke={INK} strokeWidth={3} />
      <line x1={spike[0]} y1={top - 12} x2={spike[0]} y2={top - 110} stroke="#666" strokeWidth={6} />
      {Array.from({ length: 3 }, (_, i) => <rect key={i} x={spike[0] - 46} y={top - 26 - i * 9} width={92} height={7} fill="#eee8d6" stroke="#999" strokeWidth={1} transform={`rotate(${(i - 1) * 6} ${spike[0]} ${top - 20})`} />)}
      {/* the story sheet: in the hand, then on the spike */}
      {spiked ? <g transform={`translate(${spike[0]} ${top - 50}) rotate(-4)`}><rect x={-60} y={-8} width={120} height={14} fill="#f6f1e2" stroke={INK} strokeWidth={3} /></g>
        : <g transform={`translate(${h[0] + 40} ${h[1] - 60})`}><rect x={-50} y={-70} width={100} height={130} fill="#f6f1e2" stroke={INK} strokeWidth={3} />{[0, 1, 2, 3, 4].map((i) => <line key={i} x1={-38} x2={38} y1={-50 + i * 20} y2={-50 + i * 20} stroke="#888" strokeWidth={3} />)}<text y={-56} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={13} fill="#7a1a1a">BALLOON</text></g>}
      <Person x={x} y={floor} s={s} kit={{ pose: "side", facing: 1, colors: EDITOR, armAngle: A, farArmAngle: -60, lean: 6, expression: spiked ? "determined" : "neutral" }} />
      <Label x={640} y={680} lt={lt} at={2.4} text="NOT PRINTED" size={54} />
    </g>
  );
};

// ---------- 10: a Japanese officer reads an American paper and finds nothing ----------
export const SceneTokyo: React.FC<SP> = ({ lt }) => {
  const floor = GY + 250, s = 1.25, x = 470;
  const A = lerpA(lt, [[0, -95], [1.3, -95], [2.0, -45]]);
  const h = handAt(x, floor, s, 1, A, 0);
  const flip = lerpA(lt, [[0.3, 1], [0.6, -1], [0.9, 1]]);
  return (
    <g>
      <rect x={-60} y={-60} width={1200} height={2200} fill="#b8a888" />
      <rect x={640} y={250} width={360} height={260} fill="#e8dcc0" stroke={INK} strokeWidth={5} />
      <path d="M 680 440 Q 760 330 860 360 Q 930 380 970 320" stroke="#b5432a" strokeWidth={6} fill="none" strokeDasharray="14 10" />
      <circle cx={680} cy={440} r={10} fill="#c62828" /><text x={700} y={480} fontFamily="Inter" fontWeight={900} fontSize={24} fill="#3a2e22">JAPAN</text>
      <text x={900} y={300} fontFamily="Inter" fontWeight={900} fontSize={24} fill="#3a2e22">USA ?</text>
      <rect x={-60} y={floor} width={1200} height={900} fill="#7a6448" />
      <Person x={x} y={floor} s={s} kit={{ pose: "side", facing: 1, colors: IJA, armAngle: A, farArmAngle: A + 6, expression: lt > 1.3 ? "sad" : "neutral" }} />
      {/* the newspaper held open in both hands */}
      <g transform={`translate(${h[0] + 30} ${h[1] - 70}) scale(${flip} 1)`}>
        <rect x={-10} y={-100} width={170} height={210} fill="#efe8d4" stroke={INK} strokeWidth={4} />
        <text x={75} y={-66} textAnchor="middle" fontFamily="Georgia" fontWeight={700} fontSize={22} fill="#2a2016">NEWS</text>
        {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={6} x2={144} y1={-40 + i * 24} y2={-40 + i * 24} stroke="#8a8270" strokeWidth={4} />)}
      </g>
      <Label x={330} y={560} lt={lt} at={1.0} text="NOTHING" size={60} />
    </g>
  );
};

// ---------- 12: Elsie and the five children walk into the woods (tracking shot) ----------
export const SceneWalk: React.FC<SP> = ({ lt }) => {
  const floor = GY + 250;
  const stopAt = 2.5;
  const moving = lt < stopAt;
  const scroll = (moving ? lt : stopAt) * 200;
  const envX = 1500 - scroll * 1.0;
  const point = lerpA(lt, [[2.4, -10], [2.9, -88], [3.4, -88]]);
  const xs = [150, 300, 420, 560, 690, 830];
  return (
    <g>
      <Woods scroll={scroll} />
      <Envelope x={envX} y={floor - 30} s={0.9} />
      {xs.map((x, i) => {
        const isE = i === 1;
        const c = isE ? ELSIE : KIDS[[0, 0, 1, 2, 3, 4][i]];
        const ks = isE ? 1.1 : 0.84;
        const lead = i === 5;
        return <g key={i}>
          <Person x={x} y={floor + (i % 2) * 18} s={ks} kit={{ pose: "side", facing: 1, walking: moving, colors: c, armAngle: lead && !moving ? point : undefined, expression: lead && !moving ? "happy" : "neutral" }} />
          {(isE || i === 3) && <Skirt x={x} y={floor + (i % 2) * 18} s={ks} color={isE ? "#5b7fa6" : "#b0604a"} shade={isE ? "#476689" : "#8e4c3a"} />}
        </g>;
      }).filter((_, i) => i !== 0)}
      <Label x={540} y={560} lt={lt} at={0.5} text="ELSIE + 5 CHILDREN" size={50} />
    </g>
  );
};

/** 1940s sedan, side view facing left; door = 0 closed .. 1 open */
const Sedan: React.FC<{ x: number; y: number; s?: number; door?: number }> = ({ x, y, s = 1, door = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -300 -40 Q -300 -110 -220 -120 L -140 -130 Q -90 -220 40 -220 Q 150 -220 190 -130 L 280 -120 Q 320 -110 320 -40 Z" fill="#2e3a4a" stroke={INK} strokeWidth={5} />
    <path d="M -110 -140 Q -70 -205 30 -205 L 30 -140 Z" fill="#a8c4d4" stroke={INK} strokeWidth={4} />
    <path d="M 50 -205 Q 140 -205 170 -140 L 50 -140 Z" fill="#a8c4d4" stroke={INK} strokeWidth={4} />
    <rect x={-310} y={-60} width={30} height={14} rx={4} fill="#c8c8c8" />
    {[-190, 200].map((wx) => <g key={wx}><circle cx={wx} cy={-30} r={52} fill="#1a1a1a" /><circle cx={wx} cy={-30} r={22} fill="#9a9a9a" /></g>)}
    <g transform={`translate(-120 -140) scale(${1 - door * 0.75} 1)`}>
      <path d="M 0 0 L 160 0 L 160 110 L 0 100 Z" fill="#344254" stroke={INK} strokeWidth={4} />
      <rect x={18} y={34} width={30} height={8} rx={3} fill="#c8c8c8" />
    </g>
  </g>
);

// ---------- 13: Archie parks the car on the forest road ----------
export const DOOR_SHUT = 1.25;
export const SceneCar: React.FC<SP> = ({ lt }) => {
  const floor = GY + 250, s = 1.2;
  const door = lerpA(lt, [[0, 1], [0.7, 1], [DOOR_SHUT, 0]]);
  const ax = 330, A = lerpA(lt, [[0, -60], [0.7, -80], [DOOR_SHUT, -60], [1.6, -10]]);
  const lookWoods = lt > 1.5;
  return (
    <g>
      <Woods />
      <rect x={-60} y={floor - 20} width={1200} height={90} fill="#b8a478" />
      <Sedan x={640} y={floor + 40} s={1.05} door={door} />
      <Person x={ax} y={floor + 60} s={s} kit={{ pose: "side", facing: (lookWoods ? -1 : 1) as 1 | -1, colors: ARCHIE, armAngle: lookWoods ? -10 : A, farArmAngle: -10, expression: "happy" }} />
      <Label x={540} y={560} lt={lt} at={0.4} text="HER HUSBAND, ARCHIE" size={48} />
    </g>
  );
};

// ---------- 14: close-up, a child's hand pulls at the shroud line ----------
export const SceneTug: React.FC<SP> = ({ lt }) => {
  const k = lerpA(lt, [[0.2, 0], [1.2, 1]]);
  const h: V2 = [620 - k * 120, 1000 + k * 40];
  const ring: V2 = [380 + k * 40, 880 + k * 10];
  return (
    <g>
      <rect x={-60} y={-60} width={1200} height={2200} fill="#8a7a54" />
      {Array.from({ length: 20 }, (_, i) => <path key={i} d={`M ${rnd(i) * 1100} ${700 + rnd(i + 9) * 900} l 40 -8`} stroke="#6a5a3a" strokeWidth={6} />)}
      <path d="M -60 760 Q 200 640 360 700 L 360 780 L -60 860 Z" fill="#d9d4c4" stroke={INK} strokeWidth={5} />
      {[0, 1, 2].map((i) => <line key={i} x1={120 + i * 90} y1={720 - i * 10} x2={ring[0]} y2={ring[1]} stroke="#6a5a44" strokeWidth={5} />)}
      <Payload x={ring[0]} y={ring[1]} s={1.6} rot={-10 + k * 18} />
      <line x1={ring[0] + 60} y1={ring[1]} x2={h[0]} y2={h[1]} stroke="#6a5a44" strokeWidth={6} />
      <path d={`M ${h[0] + 380} ${h[1] + 160} L ${h[0] + 30} ${h[1] + 14}`} stroke={INK} strokeWidth={92} strokeLinecap="round" />
      <path d={`M ${h[0] + 380} ${h[1] + 160} L ${h[0] + 30} ${h[1] + 14}`} stroke="#9a4a3a" strokeWidth={82} strokeLinecap="round" />
      <circle cx={h[0]} cy={h[1]} r={40} fill="#eebf98" stroke={INK} strokeWidth={5} />
      <path d={`M ${h[0] - 18} ${h[1] - 28} q 14 10 0 24 M ${h[0] - 2} ${h[1] - 34} q 14 12 0 28`} stroke="#c8906a" strokeWidth={4} fill="none" />
      <rect x={-60} y={-60} width={1200} height={2200} fill="#000" opacity={0.12 + k * 0.18} />
    </g>
  );
};

// ---------- 15: from the road, a blast beyond the trees; Archie turns ----------
export const SceneBlast: React.FC<SP> = ({ lt, frame }) => {
  const floor = GY + 250;
  const flash = interpolate(lt, [0, 0.08, 0.5], [0, 1, 0], cl);
  const smoke = interpolate(lt, [0.05, 1.3], [0, 1], cl);
  const turn = lt > 0.35;
  return (
    <g>
      <Woods />
      {Array.from({ length: 5 }, (_, i) => <ellipse key={i} cx={700 + (rnd(i) - 0.5) * 160 + i * 6} cy={floor - 380 - smoke * (180 + i * 90)} rx={(130 + i * 40) * smoke} ry={(100 + i * 30) * smoke} fill="#7a746a" opacity={0.85 - i * 0.1} />)}
      {Array.from({ length: 6 }, (_, i) => { const q = smoke; return <path key={`b${i}`} d={`M ${640 + i * 40 + q * (i - 2.5) * 120} ${floor - 520 - q * 300 - i * 20} q 10 -10 20 0 q 10 -10 20 0`} stroke="#222" strokeWidth={4} fill="none" opacity={q > 0.05 ? 1 : 0} />; })}
      <rect x={-60} y={floor - 20} width={1200} height={90} fill="#b8a478" />
      <Sedan x={330} y={floor + 40} s={0.95} />
      <Person x={180} y={floor + 60} s={1.2} kit={{ pose: "side", facing: (turn ? 1 : -1) as 1 | -1, colors: ARCHIE, lean: turn ? 8 : 0, armAngle: turn ? -100 : -10, farArmAngle: turn ? -40 : -10, expression: turn ? "scared" : "neutral" }} />
      <rect x={-60} y={-60} width={1200} height={2200} fill="#fff8e0" opacity={flash * 0.8} />
    </g>
  );
};

// ---------- 17: Japan stops: soldiers fold up an unlaunched balloon ----------
export const SceneGiveUp: React.FC<SP> = ({ lt }) => {
  const floor = GY + 250, s = 1.15;
  const fold = lerpA(lt, [[0, 0], [2.6, 1]]);
  const w = 560 * (1 - fold * 0.3), h = 160 * (1 - fold * 0.4);
  const A = lerpA(lt, [[0, -40], [0.8, -60], [1.6, -40], [2.4, -60]]);
  const offTurn = lt > 1.4;
  const ox = offTurn ? 940 + (lt - 1.4) * 150 : 940;
  return (
    <g>
      <Sky top="#9aa4ac" bottom="#d8d4c8" />
      <rect x={-60} y={floor - 200} width={1200} height={200} fill="#5a7a84" />
      <rect x={-60} y={floor} width={1200} height={900} fill="#b8a888" />
      <path d={`M ${540 - w / 2} ${floor + 30} Q ${540 - w / 2 + 40} ${floor + 30 - h} ${540} ${floor + 30 - h * 1.1} Q ${540 + w / 2 - 40} ${floor + 30 - h} ${540 + w / 2} ${floor + 30} Z`} fill="#d9d4c4" stroke={INK} strokeWidth={5} />
      <Person x={540 - w / 2 - 40} y={floor + 40} s={s} kit={{ pose: "side", facing: 1, colors: IJA, armAngle: A, farArmAngle: A + 8, lean: 18, expression: "sad" }} />
      <Person x={540 + w / 2 + 40} y={floor + 40} s={s} kit={{ pose: "side", facing: -1, colors: IJA, armAngle: A + 6, farArmAngle: A, lean: -18, expression: "sad" }} />
      <Person x={ox} y={floor - 30} s={1.0} kit={{ pose: "side", facing: (offTurn ? 1 : -1) as 1 | -1, walking: offTurn, colors: IJA, armAngle: -10, expression: "sad" }} />
      <Label x={540} y={560} lt={lt} at={0.6} text="APRIL 1945: LAUNCHES STOP" size={44} />
    </g>
  );
};
