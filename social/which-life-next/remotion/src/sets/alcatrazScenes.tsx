import React from "react";
import { interpolate, Easing } from "remotion";
import { Person, Sky } from "./ponyScenes";
import { Label } from "./chickenScenes";
import { handAt } from "./madridScenes";
import { KitColors } from "../kit/Kit";

/**
 * Ground scenes for "3 Men Escaped Alcatraz and Were Never Found" (June 1962). lt = seconds since the scene started.
 * Kit side pose: feet at (0,0), shoulder pivot (0,-284), straight-arm hand = handAt(); scenes are drawn at GY and shifted −130 px.
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

// ---------- people (1962) ----------
const hairCap = (h: string): Partial<KitColors> => ({ hair: h, capStyle: "hair" });
/** Alcatraz inmates wore light-blue chambray shirts and grey/denim trousers. */
const INMATE = (h: string): Partial<KitColors> => ({ coat: "#8fa9c4", coatShade: "#7690ac", coatLight: "#a4bcd4", patch: "#a4bcd4", scarf: "#8fa9c4", scarfShade: "#7690ac", trousers: "#4a5a72", trousersShade: "#3a485c", button: "#e8e8e8", ...hairCap(h) });
export const MORRIS = INMATE("#5a3e24");
export const JOHN = INMATE("#2a1d14");
export const CLARENCE = INMATE("#3c2a1a");
export const WEST = INMATE("#7a5a34");
export const GUARD: Partial<KitColors> = { coat: "#3b4a5c", coatShade: "#2c3846", coatLight: "#4a5a6e", patch: "#4a5a6e", scarf: "#1e242c", scarfShade: "#14181e", trousers: "#2c3846", trousersShade: "#222b36", button: "#d6b04a", cap: "#28303c", capShade: "#1c222b", capBand: "#111", hair: "#3a2a1e" };
export const AGENT: Partial<KitColors> = { coat: "#4a4a4e", coatShade: "#38383c", coatLight: "#5a5a5e", patch: "#5a5a5e", scarf: "#e8e4da", scarfShade: "#c8c4ba", trousers: "#3c3c40", trousersShade: "#2c2c30", button: "#888", cap: "#3a3430", capShade: "#2a2420", capBand: "#1a1410", hair: "#2a1d14" };
const COASTIE: Partial<KitColors> = { coat: "#1f3a6a", coatShade: "#162c52", coatLight: "#2a4a80", patch: "#2a4a80", scarf: "#1f3a6a", trousers: "#1f3a6a", trousersShade: "#162c52", button: "#e0c060", cap: "#f2f2f2", capShade: "#d0d0d0", capBand: "#1a1a1a", hair: "#5a3a20" };

/** hand position along the arm for a hand-held prop (side pose), and the forearm direction (unit) */
function armDir(facing: 1 | -1, angle: number, lean = 0): V2 {
  const a = ((angle + lean * facing) * Math.PI) / 180;
  return [-Math.sin(a) * facing, Math.cos(a)];
}

// ---------- cell set ----------
const Bars: React.FC<{ x0?: number; x1?: number; top?: number; bottom?: number; color?: string }> = ({ x0 = -60, x1 = 1140, top = -60, bottom = 2100, color = "#3a3e44" }) => (
  <g>
    {Array.from({ length: Math.ceil((x1 - x0) / 92) }, (_, i) => <rect key={i} x={x0 + i * 92} y={top} width={16} height={bottom - top} fill={color} stroke="#16181b" strokeWidth={3} />)}
    <rect x={x0} y={top + 260} width={x1 - x0} height={20} fill={color} stroke="#16181b" strokeWidth={3} />
  </g>
);
/** sink on the back wall with the air vent below it; hole = 0..1 how far the concrete around the grille is dug out */
const SinkVent: React.FC<{ x: number; floor: number; s?: number; hole?: number; open?: boolean }> = ({ x, floor, s = 1, hole = 0, open }) => (
  <g transform={`translate(${x} ${floor}) scale(${s})`}>
    <rect x={-90} y={-430} width={180} height={70} rx={14} fill="#eeece4" stroke={INK} strokeWidth={5} />
    <rect x={-10} y={-470} width={20} height={44} fill="#9aa0a6" stroke={INK} strokeWidth={4} />
    <rect x={-14} y={-360} width={28} height={130} fill="#9aa0a6" stroke={INK} strokeWidth={4} />
    {hole > 0 && <rect x={-90 - 22 * hole} y={-200 - 22 * hole} width={180 + 44 * hole} height={150 + 30 * hole} rx={8} fill="#6a6458" stroke="#4a463e" strokeWidth={4} />}
    {hole > 0.15 && Array.from({ length: 6 }, (_, i) => <path key={i} d={`M ${-90 - 20 * hole + rnd(i) * (180 + 40 * hole)} ${-200 - 20 * hole} l ${(rnd(i + 3) - 0.5) * 40} ${-30 * hole - 10}`} stroke="#4a463e" strokeWidth={4} />)}
    {open ? <rect x={-80} y={-190} width={160} height={130} fill="#141210" stroke={INK} strokeWidth={5} /> : <g>
      <rect x={-80} y={-190} width={160} height={130} fill="#7c7a72" stroke={INK} strokeWidth={5} />
      {Array.from({ length: 7 }, (_, i) => <line key={i} x1={-70} x2={70} y1={-176 + i * 18} y2={-176 + i * 18} stroke="#3a3832" strokeWidth={6} />)}
    </g>}
  </g>
);
const CellRoom: React.FC<{ night?: boolean; floor?: number }> = ({ night = true, floor = GY + 250 }) => (
  <g>
    <rect x={-60} y={-60} width={1200} height={floor + 60} fill={night ? "#6e7078" : "#b9b2a2"} />
    {Array.from({ length: 9 }, (_, i) => <line key={i} x1={-60} x2={1140} y1={120 + i * 150} y2={120 + i * 150} stroke={night ? "#62646c" : "#aaa292"} strokeWidth={4} />)}
    <rect x={-60} y={floor} width={1200} height={2150 - floor} fill={night ? "#4e5056" : "#8d877a"} />
    <line x1={-60} x2={1140} y1={floor} y2={floor} stroke={INK} strokeWidth={5} />
  </g>
);
const Bunk: React.FC<{ x0: number; x1: number; top: number; floor: number; blanket?: string }> = ({ x0, x1, top, floor, blanket = "#5a6a52" }) => (
  <g>
    {[x0 + 20, x1 - 30].map((lx) => <rect key={lx} x={lx} y={top} width={14} height={floor - top} fill="#3a3e44" />)}
    <rect x={x0} y={top} width={x1 - x0} height={46} fill="#e8e4d8" stroke={INK} strokeWidth={5} />
    <rect x={x0} y={top + 46} width={x1 - x0} height={18} fill="#3a3e44" stroke={INK} strokeWidth={4} />
  </g>
);
/** the papier-mâché dummy head (soap + toilet paper, painted, real hair), side view facing right; r = radius */
export const DummyHead: React.FC<{ x: number; y: number; r?: number; rot?: number; paint?: number; hair?: number; hairColor?: string; flip?: boolean }> = ({ x, y, r = 70, rot = 0, paint = 1, hair = 1, hairColor = "#5a3e24", flip }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip ? -r / 70 : r / 70} ${r / 70})`}>
    <ellipse cx={0} cy={0} rx={62} ry={70} fill="#d8d4c8" stroke={INK} strokeWidth={4} />
    {paint > 0 && <ellipse cx={0} cy={0} rx={62} ry={70} fill="#e4b48e" opacity={Math.min(1, paint)} />}
    <path d="M 58 -6 Q 76 6 60 18" fill={paint > 0.5 ? "#e4b48e" : "#d8d4c8"} stroke={INK} strokeWidth={4} />
    <path d="M 26 -14 Q 36 -10 44 -14" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
    <path d="M 22 -26 Q 34 -32 46 -26" stroke={INK} strokeWidth={3} fill="none" opacity={0.7} />
    <path d="M 36 34 Q 46 36 52 32" stroke="#a0584a" strokeWidth={4} fill="none" strokeLinecap="round" />
    <ellipse cx={-12} cy={6} rx={12} ry={16} fill="#d8a080" stroke={INK} strokeWidth={3} opacity={paint > 0.5 ? 1 : 0.4} />
    {hair > 0 && <path d={`M -62 10 Q -70 -60 -10 -74 Q 50 -80 60 -30 Q ${40 - 30 * (1 - hair)} -50 10 -46 Q -30 -40 -44 ${10 - 40 * (1 - hair)} Z`} fill={hairColor} stroke={INK} strokeWidth={3} opacity={Math.min(1, hair * 1.5)} />}
  </g>
);
const Flashlight: React.FC<{ h: V2; dir: V2; beam?: V2; on?: number }> = ({ h, dir, beam, on = 1 }) => {
  const tip: V2 = [h[0] + dir[0] * 36, h[1] + dir[1] * 36], back: V2 = [h[0] - dir[0] * 24, h[1] - dir[1] * 24];
  const nx = -dir[1], ny = dir[0];
  return (
    <g>
      {beam && on > 0 && <path d={`M ${tip[0] + nx * 10} ${tip[1] + ny * 10} L ${beam[0] + nx * 120} ${beam[1] + ny * 120} L ${beam[0] - nx * 120} ${beam[1] - ny * 120} L ${tip[0] - nx * 10} ${tip[1] - ny * 10} Z`} fill="#fff4b8" opacity={0.28 * on} />}
      {beam && on > 0 && <circle cx={beam[0]} cy={beam[1]} r={110} fill="#fff4b8" opacity={0.22 * on} />}
      <path d={`M ${back[0]} ${back[1]} L ${tip[0]} ${tip[1]}`} stroke="#1a1a1a" strokeWidth={22} strokeLinecap="round" />
      <path d={`M ${back[0]} ${back[1]} L ${tip[0]} ${tip[1]}`} stroke="#6a6e74" strokeWidth={14} strokeLinecap="round" />
      <circle cx={tip[0]} cy={tip[1]} r={10} fill="#fff4b8" stroke={INK} strokeWidth={3} />
    </g>
  );
};
const Spoon: React.FC<{ h: V2; dir: V2; s?: number }> = ({ h, dir, s = 1 }) => {
  const a: V2 = [h[0] - dir[0] * 14 * s, h[1] - dir[1] * 14 * s], b: V2 = [h[0] + dir[0] * 58 * s, h[1] + dir[1] * 58 * s];
  const ang = (Math.atan2(dir[1], dir[0]) * 180) / Math.PI;
  return (
    <g>
      <path d={`M ${a[0]} ${a[1]} L ${b[0]} ${b[1]}`} stroke="#5a5e64" strokeWidth={9 * s} strokeLinecap="round" />
      <path d={`M ${a[0]} ${a[1]} L ${b[0]} ${b[1]}`} stroke="#c8ccd2" strokeWidth={5 * s} strokeLinecap="round" />
      <ellipse cx={b[0] + dir[0] * 12 * s} cy={b[1] + dir[1] * 12 * s} rx={16 * s} ry={9 * s} transform={`rotate(${ang} ${b[0] + dir[0] * 12 * s} ${b[1] + dir[1] * 12 * s})`} fill="#c8ccd2" stroke="#4a4e54" strokeWidth={3} />
    </g>
  );
};
const Chips: React.FC<{ x: number; y: number; frame: number; k?: number; n?: number; seed?: number }> = ({ x, y, frame, k = 1, n = 8, seed = 0 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const q = (frame * 0.07 + rnd(i + seed)) % 1;
      return <rect key={i} x={x + (rnd(i * 3 + seed) - 0.5) * 90 * q} y={y + q * q * 160} width={7} height={7} fill="#a8a294" opacity={k * (1 - q)} />;
    })}
  </g>
);
const Fist: React.FC<{ h: V2; s?: number; sleeve?: string; dir?: V2 }> = ({ h, s = 1, sleeve = "#8fa9c4", dir = [1, 0] }) => (
  <g>
    <path d={`M ${h[0] - dir[0] * 420 * s} ${h[1] - dir[1] * 420 * s} L ${h[0] - dir[0] * 40 * s} ${h[1] - dir[1] * 40 * s}`} stroke={INK} strokeWidth={96 * s} strokeLinecap="round" />
    <path d={`M ${h[0] - dir[0] * 420 * s} ${h[1] - dir[1] * 420 * s} L ${h[0] - dir[0] * 40 * s} ${h[1] - dir[1] * 40 * s}`} stroke={sleeve} strokeWidth={86 * s} strokeLinecap="round" />
    <circle cx={h[0]} cy={h[1]} r={42 * s} fill="#eebf98" stroke={INK} strokeWidth={5} />
    <path d={`M ${h[0] - 20 * s} ${h[1] - 30 * s} q 14 10 0 24 M ${h[0] - 4 * s} ${h[1] - 36 * s} q 14 12 0 28`} stroke="#c8906a" strokeWidth={4} fill="none" />
  </g>
);

// ---------- 1 + LOOP: the guard checks the bed, the dummy head rolls off ----------
/** u = 0 is frame 0 (guard at the bars, beam on the head, about to reach). The loop runs u from −2.85 up to 0 (guard walks in). */
export const SceneBeds: React.FC<SP & { u0?: number }> = ({ lt, frame, u0 = 0 }) => {
  const u = lt + u0;
  const floor = GY + 250, top = 1150;
  const walk = u < -0.35;
  const gx = u < -0.35 ? 830 + (-0.35 - u) * 190 : 830;
  const s = 1.3;
  const reach = lerpA(u, [[0, -30], [0.4, -30], [1.8, -96], [2.5, -96], [3.0, -40]]);
  const lean = lerpA(u, [[0, 0], [1.8, 4], [2.6, -7], [4.5, -7]]);
  const h = handAt(gx, floor, s, -1, walk ? -20 : reach, lean);
  const farA = walk ? -60 : lerpA(u, [[0, -62], [2.6, -62], [3.2, -48]]);
  const fh = handAt(gx, floor, s, -1, farA, lean);
  const fdir = armDir(-1, farA, lean);
  // head: on the pillow until the hand touches it (u≈1.85), then it tips and rolls off the bunk onto the floor
  const roll = interpolate(u, [1.95, 2.85], [0, 1], cl);
  const bounce = u > 2.85 ? Math.abs(Math.sin((u - 2.85) * 9)) * 18 * Math.max(0, 1 - (u - 2.85) * 2.2) : 0;
  const hx = 600 - roll * 120 - (u > 2.85 ? Math.min(40, (u - 2.85) * 60) : 0), hy = top - 50 + Math.pow(roll, 1.8) * (floor - 60 - (top - 50)) - bounce;
  const hrot = roll * -230 - (u > 2.85 ? Math.min(30, (u - 2.85) * 45) : 0);
  const beam: V2 = [hx + 20, hy];
  const scared = u > 2.2;
  return (
    <g>
      <CellRoom />
      <SinkVent x={250} floor={floor} s={0.9} />
      <Bunk x0={90} x1={680} top={top} floor={floor} />
      {/* pillow + rolled-up clothes under the blanket = the "body" */}
      <ellipse cx={600} cy={top - 8} rx={78} ry={30} fill="#f2efe6" stroke={INK} strokeWidth={4} />
      <path d={`M 110 ${top + 4} Q 140 ${top - 96} 300 ${top - 92} Q 450 ${top - 110} 540 ${top - 40} L 560 ${top + 4} Z`} fill="#5a6a52" stroke={INK} strokeWidth={5} />
      <DummyHead x={hx} y={hy} r={58} rot={hrot} />
      <Bars x0={690} x1={1140} />
      <rect x={680} y={-60} width={30} height={2160} fill="#2a2e34" />
      <Person x={gx} y={floor} s={s} kit={{ pose: "side", facing: -1, colors: GUARD, walking: walk, armAngle: walk ? undefined : reach, farArmAngle: walk ? undefined : farA, lean, expression: scared ? "scared" : "neutral" }} />
      <Flashlight h={fh} dir={fdir} beam={beam} />
      <circle cx={h[0]} cy={h[1]} r={13 * s} fill="#eebf98" stroke={INK} strokeWidth={3} opacity={walk ? 0 : 1} />
      <rect x={-60} y={-60} width={1200} height={2200} fill="#0c1430" opacity={0.28} />
    </g>
  );
};

// ---------- 2: close-up — painting the dummy head (soap, toilet paper, real hair) ----------
export const ScenePaint: React.FC<SP> = ({ lt, frame }) => {
  const paint = interpolate(lt, [0.1, 1.9], [0.05, 1], cl);
  const hair = interpolate(lt, [1.75, 2.45], [0.15, 1], cl);
  const stroke = Math.sin(lt * 14) * 26;
  const bh: V2 = lt < 1.9 ? [610 + stroke * 0.4, 840 + stroke] : [700 + (lt - 1.9) * 40, 610 - (lt - 1.9) * 30];
  return (
    <g>
      <rect x={-60} y={-60} width={1200} height={2200} fill="#4a4c52" />
      <circle cx={540} cy={820} r={560} fill="#fff1c8" opacity={0.18} />
      <rect x={-60} y={1210} width={1200} height={900} fill="#6a5a46" />
      <line x1={-60} x2={1140} y1={1210} y2={1210} stroke={INK} strokeWidth={6} />
      <rect x={400} y={1110} width={280} height={110} fill="#8a7458" stroke={INK} strokeWidth={5} />
      {/* soap bars + toilet roll on the bench: the raw material */}
      <rect x={140} y={1150} width={120} height={60} rx={12} fill="#f0ead8" stroke={INK} strokeWidth={4} />
      <rect x={170} y={1100} width={90} height={50} rx={10} fill="#f0ead8" stroke={INK} strokeWidth={4} />
      <ellipse cx={860} cy={1150} rx={70} ry={64} fill="#fbfaf4" stroke={INK} strokeWidth={4} /><ellipse cx={860} cy={1150} rx={18} ry={16} fill="#c8c0a8" />
      <DummyHead x={540} y={860} r={250} paint={paint} hair={hair} />
      {/* brush: handle runs from the hand to the bristles touching the cheek */}
      <path d={`M ${bh[0] + 300} ${bh[1] + 260} L ${bh[0] + 10} ${bh[1] + 10}`} stroke="#7a4a24" strokeWidth={18} strokeLinecap="round" />
      <path d={`M ${bh[0] + 14} ${bh[1] + 14} L ${bh[0] - 10} ${bh[1] - 8}`} stroke="#c88a5a" strokeWidth={26} strokeLinecap="round" />
      <Fist h={[bh[0] + 300, bh[1] + 260]} s={1.1} dir={[-0.75, -0.66]} />
      <Label x={200} y={1040} lt={lt} at={0.1} text="SOAP" size={52} />
      <Label x={860} y={1040} lt={lt} at={0.55} text="TOILET PAPER" size={44} />
      <Label x={540} y={440} lt={lt} at={1.75} text="REAL HAIR" size={52} />
    </g>
  );
};

// ---------- 3: Frank Morris chips at the vent under his sink with a spoon ----------
export const SceneDig: React.FC<SP & { colors?: Partial<KitColors>; label?: string; hole0?: number; facing?: 1 | -1; watcher?: boolean }> = ({ lt, frame, colors = MORRIS, label = "FRANK MORRIS", hole0 = 0.2, facing = 1, watcher }) => {
  const floor = GY + 250, s = 1.35;
  const ventX = facing === 1 ? 640 : 300;
  const px = facing === 1 ? 300 : 650;
  const lean = 34;
  const scrape = Math.sin(lt * 11) * 7;
  const A = -48 + scrape;
  const h = handAt(px, floor, s, facing, A, lean);
  const dir = armDir(facing, A, lean);
  const hole = hole0 + lt * 0.08;
  return (
    <g>
      <CellRoom />
      <SinkVent x={ventX} floor={floor} s={1.25} hole={hole} />
      {/* wall between cells (Anglin brothers) */}
      {watcher && <rect x={900} y={-60} width={60} height={floor + 60} fill="#5e6068" stroke={INK} strokeWidth={4} />}
      <Person x={px} y={floor} s={s} kit={{ pose: "side", facing, colors, armAngle: A, farArmAngle: -40 + scrape * 0.5, lean, expression: "determined" }} />
      <Spoon h={h} dir={dir} s={1.3} />
      <Chips x={h[0] + dir[0] * 80} y={h[1] + dir[1] * 80} frame={frame} />
      <Label x={540} y={360} lt={lt} at={0.2} text={label} size={50} />
      <rect x={-60} y={-60} width={1200} height={2200} fill="#0c1430" opacity={0.22} />
    </g>
  );
};

// ---------- 4: the Anglin brothers — one digs, one keeps watch at the bars ----------
export const SceneAnglins: React.FC<SP> = ({ lt, frame }) => {
  const floor = GY + 250, s = 1.15;
  const scrape = Math.sin(lt * 10) * 7;
  const A = -48 + scrape, lean = 34;
  const dx = 230;
  const h = handAt(dx, floor, s, 1, A, lean), dir = armDir(1, A, lean);
  const turn = lt > 1.1;
  const sig = lerpA(lt, [[1.2, -10], [1.55, -150], [2.1, -150], [2.4, -20]]);
  return (
    <g>
      <CellRoom />
      <SinkVent x={480} floor={floor} s={1.05} hole={0.45 + lt * 0.08} />
      <rect x={640} y={-60} width={56} height={floor + 60} fill="#5e6068" stroke={INK} strokeWidth={4} />
      <SinkVent x={900} floor={floor} s={1.05} hole={0.6} />
      <Person x={dx} y={floor} s={s} kit={{ pose: "side", facing: 1, colors: JOHN, armAngle: A, farArmAngle: -40, lean, expression: "determined" }} />
      <Spoon h={h} dir={dir} s={1.15} />
      <Chips x={h[0] + dir[0] * 70} y={h[1] + dir[1] * 70} frame={frame} seed={4} />
      {/* brother in the next cell: looks down the corridor, then turns and signals "clear" */}
      <Person x={830} y={floor + 30} s={s} kit={{ pose: "side", facing: turn ? -1 : 1, colors: CLARENCE, armAngle: turn ? sig : -6, farArmAngle: -8, expression: turn ? "determined" : "neutral" }} />
      <Bars x0={720} x1={1140} />
      <Label x={540} y={360} lt={lt} at={0.15} text="THE ANGLIN BROTHERS" size={48} />
      <rect x={-60} y={-60} width={1200} height={2200} fill="#0c1430" opacity={0.22} />
    </g>
  );
};

// ---------- 5: extreme close-up — the spoon scraping the concrete ----------
export const SceneSpoon: React.FC<SP> = ({ lt, frame }) => {
  const scr = Math.sin(lt * 12);
  const h: V2 = [610 + scr * 40, 1000 + scr * 30];
  const crack = interpolate(lt, [0, 1.7], [0.3, 1], cl);
  return (
    <g>
      <rect x={-60} y={-60} width={1200} height={2200} fill="#8a8478" />
      {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={rnd(i) * 1100} cy={rnd(i + 40) * 1800} r={4 + rnd(i + 80) * 8} fill="#7a7468" />)}
      <rect x={120} y={560} width={560} height={420} fill="#7c7a72" stroke={INK} strokeWidth={8} />
      {Array.from({ length: 7 }, (_, i) => <line key={i} x1={140} x2={660} y1={600 + i * 54} y2={600 + i * 54} stroke="#3a3832" strokeWidth={16} />)}
      <path d={`M 680 ${980} q ${40 * crack} ${30 * crack} ${70 * crack} ${90 * crack} q ${20 * crack} ${40 * crack} ${60 * crack} ${60 * crack}`} stroke="#3a3630" strokeWidth={8} fill="none" />
      <path d={`M 680 980 L ${680 + 90 * crack} ${980 - 60 * crack}`} stroke="#3a3630" strokeWidth={6} />
      <rect x={672} y={600} width={30 * crack + 8} height={380} fill="#5a564c" />
      <Chips x={690} y={990} frame={frame} n={14} />
      <Chips x={700} y={980} frame={frame + 7} n={10} seed={5} />
      {/* spoon handle from the fist to the bowl at the grille's edge */}
      <path d={`M ${h[0] + 220} ${h[1] + 230} L ${690} ${985}`} stroke="#5a5e64" strokeWidth={28} strokeLinecap="round" />
      <path d={`M ${h[0] + 220} ${h[1] + 230} L ${690} ${985}`} stroke="#d0d4da" strokeWidth={18} strokeLinecap="round" />
      <ellipse cx={690} cy={985} rx={44} ry={26} fill="#d0d4da" stroke="#4a4e54" strokeWidth={5} transform={`rotate(${(Math.atan2(985 - h[1] - 230, 690 - h[0] - 220) * 180) / Math.PI} 690 985)`} />
      <Fist h={[h[0] + 230, h[1] + 240]} s={1.3} dir={[-0.7, -0.72]} />
    </g>
  );
};

// ---------- 6: building the raft from stolen raincoats, on top of the cellblock ----------
export const SceneRaft: React.FC<SP> = ({ lt, frame }) => {
  const floor = GY + 250, s = 1.2;
  const cyc = (lt % 0.85) / 0.85; // one raincoat laid per cycle
  const laid = Math.min(14, 3 + Math.floor(lt / 0.85));
  const A1 = cyc < 0.5 ? -80 + 50 * ease(cyc / 0.5) : -30 - 50 * ease((cyc - 0.5) / 0.5);
  const ax = 230;
  const h = handAt(ax, floor, s, 1, A1);
  const press = -52 + Math.sin(lt * 8) * 5;
  const bx = 860;
  const raftX0 = 380, raftX1 = 780, raftY = floor - 30;
  return (
    <g>
      <rect x={-60} y={-60} width={1200} height={floor + 60} fill="#3e4048" />
      {[260, 520, 800].map((px) => <rect key={px} x={-60} y={px} width={1200} height={22} fill="#565860" stroke={INK} strokeWidth={3} />)}
      {[180, 940].map((px) => <rect key={px} x={px} y={-60} width={26} height={floor + 60} fill="#565860" stroke={INK} strokeWidth={3} />)}
      <rect x={-60} y={floor} width={1200} height={2150 - floor} fill="#2e3036" />
      {/* the raft: rubberised raincoat panels, more each time one is laid */}
      <rect x={raftX0} y={raftY - 70} width={raftX1 - raftX0} height={90} rx={45} fill="#2e2c26" />
      {Array.from({ length: laid }, (_, i) => <rect key={i} x={raftX0 + (i % 7) * 57} y={raftY - 70 + Math.floor(i / 7) * 45} width={62} height={48} rx={10} fill={i % 2 ? "#6a6650" : "#5a5844"} stroke={INK} strokeWidth={3} />)}
      {/* pile of raincoats, shrinking */}
      {Array.from({ length: Math.max(1, 6 - Math.floor(lt / 0.85)) }, (_, i) => <path key={i} d={`M 20 ${floor - i * 22} q 60 -30 140 0 l -10 18 q -60 -20 -120 0 Z`} fill={i % 2 ? "#6a6650" : "#5a5844"} stroke={INK} strokeWidth={3} />)}
      <Person x={ax} y={floor} s={s} kit={{ pose: "side", facing: 1, colors: MORRIS, armAngle: A1, farArmAngle: A1 + 8, lean: 10, expression: "determined" }} />
      {/* the coat in his hands */}
      {cyc < 0.9 && <path d={`M ${h[0] - 10} ${h[1] - 6} q 50 -14 90 6 l -8 50 q -40 -16 -82 -6 Z`} fill="#6a6650" stroke={INK} strokeWidth={3} />}
      <Person x={bx} y={floor} s={s} kit={{ pose: "side", facing: -1, colors: JOHN, armAngle: press, farArmAngle: press + 6, lean: 14, expression: "determined" }} />
      <circle cx={420} cy={300} r={60} fill="#ffe9a8" opacity={0.25} />
      <rect x={-60} y={-60} width={1200} height={2200} fill="#0c1430" opacity={0.18} />
    </g>
  );
};

// ---------- 7: night — climbing down a pipe from the roof ----------
export const ScenePipe: React.FC<SP> = ({ lt, frame }) => {
  const s = 1.15, pipeX = 520;
  const A = -158, A2 = -146;
  // the climber's hands stay on the pipe: body x is set so the raised hand sits on the pipe
  const hand0 = handAt(0, 0, s, -1, A);
  const descend = interpolate(lt, [0, 1.75], [0, 1], cl);
  const footY = 1060 + descend * 420 + Math.sin(lt * 10) * 6;
  const cx = pipeX - hand0[0];
  const beamA = -40 + ((lt * 60) % 360);
  return (
    <g>
      <Sky top="#05081a" bottom="#1a2440" stars />
      <rect x={-60} y={1150} width={1200} height={1000} fill="#0e1a2c" />
      {Array.from({ length: 50 }, (_, i) => <circle key={i} cx={700 + rnd(i) * 400} cy={1160 + rnd(i + 5) * 30} r={2 + rnd(i + 9) * 3} fill="#ffd98a" opacity={0.6} />)}
      <rect x={-60} y={520} width={760} height={1700} fill="#5e5a54" stroke={INK} strokeWidth={6} />
      {Array.from({ length: 4 }, (_, i) => <rect key={i} x={60 + (i % 2) * 300} y={620 + Math.floor(i / 2) * 330} width={180} height={220} fill="#1a1c22" stroke={INK} strokeWidth={4} />)}
      <rect x={-60} y={500} width={790} height={40} fill="#4a4640" stroke={INK} strokeWidth={4} />
      <rect x={pipeX - 14} y={520} width={28} height={1600} fill="#7a7e84" stroke={INK} strokeWidth={4} />
      {/* two men waiting at the roof edge with the raft bundle */}
      <Person x={150} y={500} s={0.75} kit={{ pose: "side", facing: 1, colors: JOHN, armAngle: -18, farArmAngle: -12, expression: "scared" }} />
      <Person x={300} y={500} s={0.75} kit={{ pose: "side", facing: 1, colors: CLARENCE, armAngle: -28, farArmAngle: -20, expression: "determined" }} />
      <ellipse cx={225} cy={482} rx={70} ry={30} fill="#5a5844" stroke={INK} strokeWidth={3} />
      <Person x={cx} y={footY} s={s} kit={{ pose: "side", facing: -1, colors: MORRIS, armAngle: A + Math.sin(lt * 10) * 4, farArmAngle: A2 - Math.sin(lt * 10) * 4, expression: "scared" }} />
      {/* lighthouse beam sweeping */}
      <g transform={`translate(960 330) rotate(${beamA})`}><path d="M 0 0 L 1400 -120 L 1400 120 Z" fill="#fff6c8" opacity={0.12} /></g>
      <path d="M 935 1150 L 945 340 L 975 340 L 985 1150 Z" fill="#2a2a30" /><circle cx={960} cy={330} r={22} fill="#fff6c8" />
      <rect x={-60} y={1680} width={1200} height={500} fill="#0e1a2c" />
    </g>
  );
};

// ---------- 8: paddling the raincoat raft into the dark bay ----------
const Paddler: React.FC<{ x: number; y: number; s: number; colors: Partial<KitColors>; phase: number; lt: number }> = ({ x, y, s, colors, phase, lt }) => {
  const st = (lt * 2.6 + phase) % 1;
  const A = st < 0.55 ? -110 + 85 * ease(st / 0.55) : -25 - 85 * ease((st - 0.55) / 0.45);
  const h = handAt(x, y, s, -1, A, 8);
  const blade: V2 = [h[0] + 30 * s, h[1] + 210 * s];
  return (
    <g>
      <Person x={x} y={y} s={s} kit={{ pose: "side", facing: -1, colors, armAngle: A, farArmAngle: A + 10, lean: 8, expression: "determined" }} />
      <path d={`M ${h[0] - 10 * s} ${h[1] - 50 * s} L ${blade[0]} ${blade[1]}`} stroke="#7a5a34" strokeWidth={10 * s} strokeLinecap="round" />
      <ellipse cx={blade[0]} cy={blade[1]} rx={14 * s} ry={34 * s} fill="#8a6a40" stroke={INK} strokeWidth={3} />
    </g>
  );
};
export const SceneBay: React.FC<SP> = ({ lt, frame }) => {
  const s = 0.95, wy = 1250;
  const rx = 640 - lt * 40;
  return (
    <g>
      <Sky top="#03060f" bottom="#18223a" stars />
      {/* San Francisco lights on the far shore */}
      {Array.from({ length: 50 }, (_, i) => <circle key={i} cx={rnd(i) * 1080} cy={1040 + rnd(i + 5) * 40} r={2 + rnd(i + 9) * 3} fill="#ffd98a" opacity={0.7} />)}
      <rect x={-60} y={1080} width={1200} height={1100} fill="#0e2234" />
      {/* Alcatraz behind them, lighthouse */}
      <path d="M 760 1090 L 800 1010 L 1000 990 L 1100 1060 L 1120 1090 Z" fill="#141820" />
      <rect x={880} y={930} width={14} height={70} fill="#141820" /><circle cx={887} cy={928} r={10} fill="#fff6c8" opacity={0.6 + 0.4 * Math.sin(frame * 0.2)} />
      {Array.from({ length: 24 }, (_, i) => { const x = ((rnd(i) * 1300 + frame * 1.2) % 1300) - 110, y = 1110 + rnd(i + 3) * 500; return <path key={i} d={`M ${x} ${y} q 26 -8 52 0`} stroke="#3a5a72" strokeWidth={4} fill="none" />; })}
      <Paddler x={rx - 190} y={wy} s={s} colors={MORRIS} phase={0} lt={lt} />
      <Paddler x={rx} y={wy - 10} s={s} colors={JOHN} phase={0.33} lt={lt} />
      <Paddler x={rx + 190} y={wy} s={s} colors={CLARENCE} phase={0.66} lt={lt} />
      {/* raft hides the legs */}
      <path d={`M ${rx - 330} ${wy - 160} L ${rx + 330} ${wy - 160} Q ${rx + 380} ${wy - 100} ${rx + 320} ${wy - 50} L ${rx - 320} ${wy - 50} Q ${rx - 380} ${wy - 100} ${rx - 330} ${wy - 160} Z`} fill="#4a483c" stroke={INK} strokeWidth={5} transform={`rotate(${Math.sin(frame * 0.12) * 1.5} ${rx} ${wy - 100})`} />
      <rect x={-60} y={wy - 70} width={1200} height={900} fill="#0e2234" opacity={0.85} />
      {Array.from({ length: 12 }, (_, i) => { const x = rx - 300 + i * 55; return <path key={i} d={`M ${x} ${wy - 64} q 20 -8 40 0`} stroke="#6a8aa2" strokeWidth={4} fill="none" />; })}
    </g>
  );
};

// ---------- 9: Allen West can't get his vent grille out in time ----------
export const SceneWest: React.FC<SP> = ({ lt, frame }) => {
  const floor = GY + 250, s = 1.35, px = 330;
  const pulling = lt < 2.6;
  const tug = pulling ? Math.max(0, Math.sin(lt * 9)) * 8 : 0;
  const A = pulling ? -62 - tug * 0.6 : lerpA(lt, [[2.6, -62], [3.1, -10]]);
  const lean = pulling ? 22 - tug : lerpA(lt, [[2.6, 22], [3.1, 4]]);
  const h = handAt(px, floor, s, 1, A, lean);
  return (
    <g>
      <CellRoom />
      <SinkVent x={640} floor={floor} s={1.25} hole={0.12} />
      {/* fingers hooked on the grille edge while pulling (contact) */}
      <Person x={px} y={floor} s={s} kit={{ pose: "side", facing: 1, colors: WEST, armAngle: A, farArmAngle: A + 6, lean, expression: pulling ? "determined" : "sad" }} />
      {pulling && <circle cx={h[0]} cy={h[1]} r={15} fill="#eebf98" stroke={INK} strokeWidth={3} />}
      {pulling && <path d={`M ${h[0] - 10} ${h[1] - 18} l 0 -14 M ${h[0] + 8} ${h[1] - 20} l 4 -14`} stroke="#fff" strokeWidth={4} opacity={tug > 4 ? 0.8 : 0} />}
      <Label x={540} y={360} lt={lt} at={0.25} text="ALLEN WEST" size={56} />
      <rect x={-60} y={-60} width={1200} height={2200} fill="#0c1430" opacity={0.22} />
    </g>
  );
};
/** close-up: West alone on his bunk, looking at the empty corridor */
export const SceneAlone: React.FC<SP> = ({ lt, frame }) => {
  const s = 2.4 + lt * 0.08;
  const x = 420, y = GY + 760;
  const look = lt > 0.7;
  return (
    <g>
      <rect x={-60} y={-60} width={1200} height={2200} fill="#7a7a80" />
      <rect x={-60} y={1250} width={1200} height={900} fill="#5a5a60" />
      <Person x={x} y={y} s={s} kit={{ pose: "side", facing: look ? 1 : -1, colors: WEST, armAngle: -30, farArmAngle: -24, lean: look ? 0 : 6, expression: "sad" }} />
      <Bars x0={720} x1={1140} />
      <rect x={-60} y={-60} width={1200} height={2200} fill="#a8b8d8" opacity={0.12 + lt * 0.04} />
    </g>
  );
};

// ---------- 10: morning — a searcher finds a paddle on the shore ----------
export const SceneFound: React.FC<SP> = ({ lt, frame }) => {
  const s = 1.2, x = 330, floor = GY + 260;
  const lean = lerpA(lt, [[0.2, 0], [0.9, 30], [1.4, 30], [2.0, 4]]);
  const A = lerpA(lt, [[0.2, -10], [0.9, -26], [1.4, -26], [2.0, -70]]);
  const h = handAt(x, floor, s, 1, A, lean);
  const held = lt > 1.25;
  const p0: V2 = [h[0] - 40, floor - 18], p1: V2 = [h[0] + 180, floor - 26];
  const pa: V2 = held ? [h[0] - 60, h[1] + 20] : p0, pb: V2 = held ? [h[0] + 170, h[1] - 90] : p1;
  const vestUp = lerpA(lt, [[1.8, -10], [2.3, -125], [3.8, -125]]);
  const vh = handAt(830, floor - 20, s, -1, vestUp);
  return (
    <g>
      <Sky top="#aab4bc" bottom="#d8dcdc" />
      <rect x={-60} y={980} width={1200} height={300} fill="#6a8290" />
      <path d="M 640 1000 L 700 940 L 900 930 L 1000 990 Z" fill="#8a9aa4" opacity={0.7} />
      <rect x={-60} y={1240} width={1200} height={900} fill="#8a7e6a" />
      {Array.from({ length: 14 }, (_, i) => <ellipse key={i} cx={rnd(i) * 1080} cy={1300 + rnd(i + 4) * 500} rx={30 + rnd(i + 2) * 40} ry={18} fill="#6e6454" />)}
      <path d={`M -60 ${1250 + Math.sin(frame * 0.1) * 6} q 300 30 600 0 t 600 0`} stroke="#e8eef0" strokeWidth={6} fill="none" />
      <Person x={x} y={floor} s={s} kit={{ pose: "side", facing: 1, colors: AGENT, armAngle: A, farArmAngle: A + 10, lean, expression: held ? "neutral" : "determined" }} />
      {/* the paddle: lying on the rocks, then in his hand */}
      <path d={`M ${pa[0]} ${pa[1]} L ${pb[0]} ${pb[1]}`} stroke="#7a5a34" strokeWidth={12} strokeLinecap="round" />
      <ellipse cx={pb[0]} cy={pb[1]} rx={48} ry={20} transform={`rotate(${(Math.atan2(pb[1] - pa[1], pb[0] - pa[0]) * 180) / Math.PI} ${pb[0]} ${pb[1]})`} fill="#8a6a40" stroke={INK} strokeWidth={4} />
      {held && <circle cx={h[0]} cy={h[1]} r={15} fill="#eebf98" stroke={INK} strokeWidth={3} />}
      <Person x={830} y={floor - 20} s={s} kit={{ pose: "side", facing: -1, colors: COASTIE, armAngle: vestUp, farArmAngle: -20, expression: "neutral" }} />
      {lt > 1.8 && <path d={`M ${vh[0] - 40} ${vh[1] - 70} l 80 0 l 6 70 l -92 0 Z`} fill="#5a5844" stroke={INK} strokeWidth={4} />}
      <Label x={330} y={560} lt={lt} at={0.9} text="A PADDLE" size={50} />
      <Label x={800} y={480} lt={lt} at={2.0} text="LIFE VEST PIECES" size={44} />
      <rect x={-60} y={-60} width={1200} height={2200} fill="#dfe4e6" opacity={0.18} />
    </g>
  );
};

// ---------- 11: fog over the empty bay; a boat's searchlight sweeps ----------
export const SceneFog: React.FC<SP> = ({ lt, frame }) => {
  const bx = 200 + lt * 160;
  const sweep = -20 + Math.sin(lt * 2) * 25;
  return (
    <g>
      <rect x={-60} y={-60} width={1200} height={2200} fill="#9aa6ae" />
      <path d="M 560 1010 L 620 930 L 860 910 L 980 990 L 1000 1010 Z" fill="#6a767e" />
      <rect x={740} y={860} width={10} height={60} fill="#6a767e" />
      <rect x={-60} y={1010} width={1200} height={1200} fill="#5a7280" />
      <g transform={`translate(${bx} 1140)`}>
        <path d="M -110 0 L 110 0 L 90 40 L -96 40 Z" fill="#e8e8e8" stroke={INK} strokeWidth={4} />
        <rect x={-50} y={-50} width={80} height={50} fill="#f2f2f2" stroke={INK} strokeWidth={4} /><rect x={-40} y={-64} width={8} height={14} fill="#333" />
        <g transform={`translate(30 -44) rotate(${sweep})`}><path d="M 0 0 L 700 -60 L 700 60 Z" fill="#fffbe0" opacity={0.25} /></g>
      </g>
      {Array.from({ length: 10 }, (_, i) => <ellipse key={i} cx={((rnd(i) * 1500 + lt * (30 + i * 8)) % 1500) - 200} cy={700 + rnd(i + 3) * 700} rx={300} ry={70} fill="#e8eef0" opacity={0.35} />)}
    </g>
  );
};

// ---------- 12: the FBI closes the case (1979) ----------
export const SceneStamp: React.FC<SP> = ({ lt, frame }) => {
  const s = 1.45, x = 330, floor = GY + 300;
  const A = lerpA(lt, [[0, -60], [0.5, -112], [0.85, -112], [1.05, -58], [1.4, -58], [1.8, -100]]);
  const h = handAt(x, floor, s, 1, A);
  const stamped = lt > 1.05;
  const deskY = 1250;
  return (
    <g>
      <rect x={-60} y={-60} width={1200} height={2200} fill="#7a6a54" />
      <rect x={560} y={240} width={360} height={420} fill="#5a4a38" stroke={INK} strokeWidth={5} />
      <rect x={600} y={280} width={280} height={340} fill="#efe6cc" /><text x={740} y={360} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={34} fill="#2a2a2a">FBI</text>
      <Person x={x} y={floor} s={s} kit={{ pose: "side", facing: 1, colors: AGENT, armAngle: A, farArmAngle: -55, expression: "neutral" }} />
      <rect x={380} y={deskY} width={800} height={1000} fill="#5a3e26" stroke={INK} strokeWidth={6} />
      <rect x={400} y={deskY - 20} width={420} height={34} rx={4} fill="#d8c08a" stroke={INK} strokeWidth={4} />
      <text x={700} y={deskY + 4} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={22} fill="#3a2a1a">ALCATRAZ ESCAPE</text>
      {stamped && <g transform={`translate(520 ${deskY - 50}) rotate(-8) scale(${interpolate(lt, [1.05, 1.15], [1.4, 1], cl)})`}><rect x={-110} y={-36} width={220} height={64} fill="none" stroke="#c62828" strokeWidth={8} /><text y={16} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={46} fill="#c62828">CLOSED</text></g>}
      {/* the stamp, held in the hand */}
      <rect x={h[0] - 16} y={h[1] - 50} width={32} height={46} rx={10} fill="#5a3a20" stroke={INK} strokeWidth={4} />
      <rect x={h[0] - 30} y={h[1] + 8} width={60} height={22} fill="#2a2a2a" stroke={INK} strokeWidth={4} />
      <Label x={800} y={1000} lt={lt} at={1.15} text="1979" size={56} />
    </g>
  );
};

// ---------- 13: a US Marshal pins the wanted poster: case still open ----------
export const SceneMarshal: React.FC<SP> = ({ lt, frame }) => {
  const s = 1.35, x = 300, floor = GY + 260;
  const A = lerpA(lt, [[0, -40], [0.9, -112], [2.9, -112]]);
  const h = handAt(x, floor, s, 1, A);
  const pinned = lt > 0.95;
  const hp = handAt(x, floor, s, 1, -112);
  const P: V2 = pinned ? [hp[0] + 150, hp[1] - 10] : [h[0] + 150, h[1] - 10];
  const k = 0.9;
  return (
    <g>
      <rect x={-60} y={-60} width={1200} height={2200} fill="#6a6258" />
      <rect x={380} y={600} width={660} height={760} fill="#a8865a" stroke={INK} strokeWidth={8} />
      {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={400 + rnd(i) * 620} cy={620 + rnd(i + 30) * 720} r={3} fill="#8a6a44" />)}
      <g transform={`translate(${P[0]} ${P[1]}) scale(${k})`}>
        <rect x={-210} y={-260} width={420} height={520} fill="#f2e8cc" stroke={INK} strokeWidth={5} />
        <text y={-190} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={64} fill="#2a1a10">WANTED</text>
        {[-130, 0, 130].map((fx, i) => <g key={i}><rect x={fx - 56} y={-140} width={112} height={140} fill="#d8ccb0" stroke={INK} strokeWidth={4} /><DummyHead x={fx - 6} y={-72} r={44} hairColor={[MORRIS.hair, JOHN.hair, CLARENCE.hair][i] as string} /></g>)}
        <text y={60} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={30} fill="#2a1a10">MORRIS · J. ANGLIN</text>
        <text y={100} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={30} fill="#2a1a10">C. ANGLIN</text>
        <text y={170} textAnchor="middle" fontFamily="Inter" fontWeight={700} fontSize={26} fill="#5a2a1a">U.S. MARSHALS SERVICE</text>
        {pinned && <circle cx={0} cy={-240} r={12} fill="#c62828" stroke={INK} strokeWidth={3} />}
      </g>
      <Person x={x} y={floor} s={s} kit={{ pose: "side", facing: 1, colors: AGENT, armAngle: A, farArmAngle: -20, expression: "determined" }} />
      {/* marshal's star */}
      <g transform={`translate(${x + 30 * s} ${floor - 230 * s})`}><path d="M 0 -16 L 5 -5 L 16 -5 L 7 3 L 10 15 L 0 8 L -10 15 L -7 3 L -16 -5 L -5 -5 Z" fill="#e0b84a" stroke={INK} strokeWidth={2} /></g>
      <circle cx={h[0]} cy={h[1]} r={15} fill="#eebf98" stroke={INK} strokeWidth={3} />
    </g>
  );
};
