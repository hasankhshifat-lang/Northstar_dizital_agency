import React from "react";
import { interpolate, Easing } from "remotion";
import { Person, Sky } from "./ponyScenes";
import { Label } from "./chickenScenes";
import { handAt } from "./madridScenes";
import { KitColors } from "../kit/Kit";

/**
 * Ground scenes for "Why Part of Minnesota Is Stuck in Canada" (the Northwest Angle).
 * lt = seconds since the scene started. Kit side pose: feet at (0,0), shoulder pivot (0,-284), straight-arm hand = handAt().
 * Scenes are drawn at GY and shifted −130 px by the story. Storyboard: social/scripts/northwest-angle-2026-11-19.md.
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

// ---------- people ----------
const hair = (h: string): Partial<KitColors> => ({ hair: h, capStyle: "hair" } as Partial<KitColors>);
/** today's Angle resident: red plaid jacket, cap */
const DRIVER: Partial<KitColors> = { coat: "#a8322a", coatShade: "#842620", coatLight: "#c04436", patch: "#2a2a2a", scarf: "#3a3a3a", scarfShade: "#2a2a2a", trousers: "#3a4a62", trousersShade: "#2c3a4e", cap: "#2f4a34", capShade: "#223826", capBand: "#1a2a1c", hair: "#5a3e24", button: "#2a2a2a" };
/** 1783 delegates: American in brown, British in green, powdered hair, white stock */
const AMERICAN: Partial<KitColors> = { coat: "#6a4a30", coatShade: "#523822", coatLight: "#7c5a3e", patch: "#7c5a3e", scarf: "#f4f0e6", scarfShade: "#d8d2c4", trousers: "#2a2420", trousersShade: "#1c1814", button: "#d6b04a", ...hair("#e6e2da") };
const BRITISH: Partial<KitColors> = { coat: "#2e4a3a", coatShade: "#22382c", coatLight: "#3a5c48", patch: "#3a5c48", scarf: "#f4f0e6", scarfShade: "#d8d2c4", trousers: "#e8e0cc", trousersShade: "#cfc6b0", button: "#d6b04a", ...hair("#d8d4cc") };
/** 1818 commissioners: dark coats, white stocks */
const COMM_A: Partial<KitColors> = { coat: "#22262e", coatShade: "#181b21", coatLight: "#2e333d", patch: "#2e333d", scarf: "#f4f0e6", scarfShade: "#d8d2c4", trousers: "#c8bca4", trousersShade: "#aa9e86", button: "#c9c9c9", ...hair("#4a3424") };
const COMM_B: Partial<KitColors> = { coat: "#3a2e4a", coatShade: "#2c2238", coatLight: "#48395c", patch: "#48395c", scarf: "#f4f0e6", scarfShade: "#d8d2c4", trousers: "#2a2420", trousersShade: "#1c1814", button: "#c9c9c9", ...hair("#8a8278") };
/** surveyors in a canoe (1820s) */
const SURV_A: Partial<KitColors> = { coat: "#7a5a3a", coatShade: "#5e442a", coatLight: "#8c6a48", patch: "#8c6a48", scarf: "#a8322a", scarfShade: "#842620", cap: "#4a3a2a", capShade: "#3a2c1e", hair: "#3a2a1e" };
const SURV_B: Partial<KitColors> = { coat: "#3a4a6a", coatShade: "#2c3a54", coatLight: "#4a5c80", patch: "#4a5c80", scarf: "#d8b04a", scarfShade: "#b08a30", cap: "#5a2a2a", capShade: "#441e1e", hair: "#6a4020" };
const OFFICER: Partial<KitColors> = { coat: "#2a3a52", coatShade: "#1e2c40", coatLight: "#3a4c68", patch: "#3a4c68", scarf: "#2a3a52", scarfShade: "#1e2c40", cap: "#1e2433", capShade: "#151a26", capBand: "#d6b04a", hair: "#3a2a1e", button: "#d6b04a" };

// ---------- props ----------
const Pine: React.FC<{ x: number; y: number; h: number; c: string; c2?: string }> = ({ x, y, h, c, c2 }) => (
  <g>
    <rect x={x - h * 0.03} y={y - h * 0.25} width={h * 0.06} height={h * 0.25} fill="#4a3424" />
    {[0, 1, 2, 3].map((i) => { const w = h * (0.3 - i * 0.06), yy = y - h * 0.16 - i * h * 0.2; return <path key={i} d={`M ${x - w} ${yy} L ${x} ${yy - h * 0.36} L ${x + w} ${yy} Z`} fill={i % 2 ? (c2 ?? c) : c} />; })}
  </g>
);
/** northern Minnesota / Manitoba pine woods with a gravel road; scroll in px for the tracking shot */
const RoadWoods: React.FC<{ scroll?: number; floor: number; frame: number }> = ({ scroll = 0, floor }) => (
  <g>
    <Sky top="#7fa8c8" bottom="#dfe8ea" clouds={3} drift={scroll / 60} />
    <path d={`M -60 ${floor - 380} Q 260 ${floor - 470} 540 ${floor - 410} T 1140 ${floor - 430} L 1140 ${floor} L -60 ${floor} Z`} fill="#8aa0a6" />
    {Array.from({ length: 16 }, (_, i) => { const x = (((i * 100 - scroll * 0.3) % 1600) + 1600) % 1600 - 260; return <Pine key={`f${i}`} x={x} y={floor - 150} h={380 + rnd(i) * 120} c="#4a6a58" c2="#567662" />; })}
    <rect x={-60} y={floor - 160} width={1200} height={170} fill="#6a7a4a" />
    {Array.from({ length: 9 }, (_, i) => { const x = (((i * 200 - scroll * 0.65) % 1800) + 1800) % 1800 - 360; return <Pine key={`m${i}`} x={x} y={floor - 70} h={700 + rnd(i + 30) * 200} c="#2a4a3a" c2="#345644" />; })}
    {/* gravel road */}
    <rect x={-60} y={floor - 10} width={1200} height={120} fill="#b8a888" />
    {Array.from({ length: 40 }, (_, i) => { const x = (((rnd(i + 5) * 1300 - scroll) % 1300) + 1300) % 1300 - 110; return <circle key={`g${i}`} cx={x} cy={floor + 10 + rnd(i) * 90} r={3 + rnd(i + 2) * 3} fill="#8a7a5e" />; })}
    <rect x={-60} y={floor + 110} width={1200} height={2000} fill="#5e6e40" />
  </g>
);
/** pickup truck, side view facing right; (x,y) = ground under the centre; driver's head shows in the window */
const Pickup: React.FC<{ x: number; y: number; s?: number; spin?: number; driver?: boolean; door?: number }> = ({ x, y, s = 1, spin = 0, driver = true, door = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={300} ry={16} fill="#000" opacity={0.25} />
    <path d="M -300 -70 L -300 -170 L -60 -170 L -40 -270 L 130 -270 L 190 -170 L 300 -150 L 310 -70 Z" fill="#b8402e" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M -300 -170 L -60 -170 L -60 -150 L -300 -150 Z" fill="#8e3022" />
    {/* cab window with the driver */}
    <path d="M -24 -255 L 120 -255 L 168 -176 L -24 -176 Z" fill="#cfe2ea" stroke={INK} strokeWidth={5} />
    {driver && <g>
      <clipPath id="cabclip"><path d="M -24 -255 L 120 -255 L 168 -176 L -24 -176 Z" /></clipPath>
      <g clipPath="url(#cabclip)"><Person x={60} y={-30} s={0.62} kit={{ pose: "side", facing: 1, colors: DRIVER, armAngle: -70, expression: "neutral" }} /></g>
    </g>}
    <line x1={-34} y1={-170} x2={-34} y2={-80} stroke={INK} strokeWidth={4} opacity={door > 0 ? 0 : 1} />
    <rect x={-10} y={-150} width={34} height={10} rx={4} fill="#2a2a2a" />
    <rect x={260} y={-140} width={46} height={26} rx={6} fill="#fff4c8" stroke={INK} strokeWidth={3} />
    <rect x={-310} y={-92} width={620} height={26} rx={8} fill="#5a5a5e" stroke={INK} strokeWidth={4} />
    {[-185, 185].map((wx) => (
      <g key={wx} transform={`translate(${wx} -40)`}>
        <circle r={58} fill="#1e1e20" stroke={INK} strokeWidth={5} />
        <circle r={28} fill="#9a9aa0" />
        {[0, 1, 2, 3, 4].map((k) => <line key={k} x1={0} y1={0} x2={Math.cos(spin + k * 1.2566) * 24} y2={Math.sin(spin + k * 1.2566) * 24} stroke="#5a5a60" strokeWidth={6} />)}
      </g>
    ))}
  </g>
);
/** Canada border sign on two posts */
const BorderSign: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-120} y={-330} width={14} height={330} fill="#6a5a48" stroke={INK} strokeWidth={3} />
    <rect x={106} y={-330} width={14} height={330} fill="#6a5a48" stroke={INK} strokeWidth={3} />
    <rect x={-170} y={-470} width={340} height={170} rx={10} fill="#f4f2ea" stroke={INK} strokeWidth={6} />
    <rect x={-170} y={-470} width={60} height={170} fill="#d42a22" /><rect x={110} y={-470} width={60} height={170} fill="#d42a22" />
    <path d="M 0 -440 L 10 -418 L 26 -424 L 20 -400 L 36 -392 L 12 -380 L 14 -362 L 0 -370 L -14 -362 L -12 -380 L -36 -392 L -20 -400 L -26 -424 L -10 -418 Z" fill="#d42a22" />
    <text x={0} y={-322} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={40} fill="#1b140d">CANADA</text>
  </g>
);
/** the 18th-century map sheet (top-down): lake drawn as a neat oval, river and coast sketches */
const OldMap: React.FC<{ x: number; y: number; w: number; h: number; rot?: number; inkK?: number; children?: React.ReactNode }> = ({ x, y, w, h, rot = 0, children }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-w / 2 + 10} y={-h / 2 + 14} width={w} height={h} fill="#000" opacity={0.25} />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#ecd9a8" stroke="#8a6a3a" strokeWidth={6} />
    <rect x={-w / 2 + 24} y={-h / 2 + 24} width={w - 48} height={h - 48} fill="none" stroke="#8a6a3a" strokeWidth={3} />
    {/* Lake Superior + the oval Lake of the Woods + a river running north beside it, as the old map drew them */}
    <path d={`M ${w * 0.05} ${h * 0.12} q ${w * 0.12} ${-h * 0.1} ${w * 0.3} ${-h * 0.02} q ${w * 0.04} ${h * 0.08} ${-w * 0.1} ${h * 0.1} q ${-w * 0.14} ${h * 0.02} ${-w * 0.2} ${-h * 0.08} Z`} fill="#b8c8b0" stroke="#6a4a2a" strokeWidth={4} />
    <ellipse cx={-w * 0.18} cy={-h * 0.12} rx={w * 0.08} ry={h * 0.05} fill="#b8c8b0" stroke="#6a4a2a" strokeWidth={4} />
    <path d={`M ${-w * 0.36} ${h * 0.4} C ${-w * 0.34} ${h * 0.15} ${-w * 0.38} ${-h * 0.05} ${-w * 0.33} ${-h * 0.2}`} stroke="#6a8aa0" strokeWidth={6} fill="none" />
    <text x={w * 0.0} y={h * 0.36} textAnchor="middle" fontFamily="Georgia" fontStyle="italic" fontSize={34} fill="#6a4a2a">A Map of the British Colonies</text>
    <text x={w * 0.0} y={h * 0.41} textAnchor="middle" fontFamily="Georgia" fontStyle="italic" fontSize={26} fill="#6a4a2a">1755</text>
    {children}
  </g>
);
/** sleeve + hand reaching in from off-frame (top-down inserts); (x,y) = fingertips */
const Arm: React.FC<{ x: number; y: number; from: V2; sleeve: string; cuff?: string; quill?: boolean; point?: boolean }> = ({ x, y, from, sleeve, cuff = "#f4f0e6", quill, point }) => {
  const a = Math.atan2(y - from[1], x - from[0]);
  const hx = x - Math.cos(a) * 46, hy = y - Math.sin(a) * 46;
  return (
    <g>
      <line x1={from[0]} y1={from[1]} x2={hx - Math.cos(a) * 40} y2={hy - Math.sin(a) * 40} stroke={INK} strokeWidth={104} strokeLinecap="round" />
      <line x1={from[0]} y1={from[1]} x2={hx - Math.cos(a) * 40} y2={hy - Math.sin(a) * 40} stroke={sleeve} strokeWidth={92} strokeLinecap="round" />
      <circle cx={hx - Math.cos(a) * 44} cy={hy - Math.sin(a) * 44} r={42} fill={cuff} stroke={INK} strokeWidth={4} />
      <ellipse cx={hx} cy={hy} rx={46} ry={38} transform={`rotate(${(a * 180) / Math.PI} ${hx} ${hy})`} fill="#eebf98" stroke={INK} strokeWidth={5} />
      {point && <line x1={hx} y1={hy} x2={x} y2={y} stroke="#eebf98" strokeWidth={20} strokeLinecap="round" />}
      {point && <line x1={hx} y1={hy} x2={x} y2={y} stroke={INK} strokeWidth={2} strokeLinecap="round" opacity={0.5} />}
      {quill && <g>
        <line x1={x} y1={y} x2={x - 30} y2={y - 190} stroke="#f4f0e6" strokeWidth={10} strokeLinecap="round" />
        <path d={`M ${x - 12} ${y - 70} Q ${x - 70} ${y - 160} ${x - 34} ${y - 230} Q ${x - 10} ${y - 150} ${x - 12} ${y - 70} Z`} fill="#f4f0e6" stroke={INK} strokeWidth={3} />
        <circle cx={x} cy={y} r={4} fill="#1b140d" />
      </g>}
    </g>
  );
};
const Table: React.FC<{ y: number; x0?: number; x1?: number }> = ({ y, x0 = 120, x1 = 960 }) => (
  <g>
    <rect x={x0} y={y} width={x1 - x0} height={34} fill="#7a4a2a" stroke={INK} strokeWidth={5} />
    <rect x={x0 + 20} y={y + 34} width={x1 - x0 - 40} height={120} fill="#6a3e22" stroke={INK} strokeWidth={4} />
    {[x0 + 40, x1 - 70].map((lx) => <rect key={lx} x={lx} y={y + 150} width={30} height={250} fill="#5a3418" stroke={INK} strokeWidth={4} />)}
  </g>
);
/** 18th-century room: panelled wall, tall window */
const Salon: React.FC<{ floor: number; tint?: string }> = ({ floor, tint = "#d8c8a4" }) => (
  <g>
    <rect x={-60} y={-60} width={1200} height={floor + 60} fill={tint} />
    {Array.from({ length: 5 }, (_, i) => <rect key={i} x={-40 + i * 240} y={floor - 560} width={200} height={460} fill="none" stroke="#b8a682" strokeWidth={6} />)}
    <rect x={720} y={300} width={260} height={floor - 520} fill="#c8dce4" stroke="#8a6a3a" strokeWidth={10} />
    <line x1={850} y1={300} x2={850} y2={floor - 220} stroke="#8a6a3a" strokeWidth={6} /><line x1={720} y1={560} x2={980} y2={560} stroke="#8a6a3a" strokeWidth={6} />
    <path d="M 700 290 L 1000 290 L 1000 320 L 700 320 Z" fill="#7a2a2a" />
    <rect x={-60} y={floor} width={1200} height={900} fill="#8a6a48" />
    {Array.from({ length: 12 }, (_, i) => <line key={i} x1={-60 + i * 110} y1={floor} x2={-120 + i * 110} y2={floor + 300} stroke="#6e5236" strokeWidth={4} />)}
  </g>
);

// ---------- 1 + LOOP: a pickup on a gravel road passes the CANADA sign ----------
export const SceneBorder: React.FC<SP & { u0?: number }> = ({ lt, frame, u0 = 0 }) => {
  const u = lt + u0;
  const floor = GY + 250;
  const tx = 470 + u * 120; // truck rolls right, past the sign
  const scroll = u * 60;
  const signX = 760 - scroll;
  const push = 1 + Math.max(0, u) * 0.012;
  return (
    <g transform={`translate(540 1100) scale(${push}) translate(-540 -1100)`}>
      <RoadWoods scroll={scroll} floor={floor} frame={frame} />
      <BorderSign x={signX} y={floor - 30} s={0.95} />
      <Pickup x={tx} y={floor + 70} s={0.9} spin={u * 8} />
      {/* dust off the rear wheel */}
      {Array.from({ length: 5 }, (_, i) => { const k = ((frame * 0.07 + i * 0.2) % 1); return <circle key={i} cx={tx - 300 - k * 160} cy={floor + 40 - k * 50} r={14 + k * 30} fill="#d8ccb0" opacity={0.45 * (1 - k)} />; })}
      <Label x={540} y={830} lt={u} at={1.4} text="NORTHWEST ANGLE, MINNESOTA" size={38} />
    </g>
  );
};

// ---------- 3: Paris, 1783 — the delegates shake hands over the treaty ----------
export const SceneParis: React.FC<SP> = ({ lt }) => {
  const floor = GY + 250, s = 1.2;
  const ax = 330, bx = 330 + 2 * 133.8 * s; // hands meet in the middle at arm -75
  const reach = lerpA(lt, [[0, -20], [0.7, -75]]);
  const shake = lt > 0.7 && lt < 2.4 ? Math.sin((lt - 0.7) * Math.PI * 4) * 7 : 0;
  const A = reach + shake;
  const hand = handAt(ax, floor, s, 1, A, 0);
  return (
    <g>
      <Salon floor={floor} />
      <Person x={ax} y={floor} s={s} kit={{ pose: "side", facing: 1, colors: AMERICAN, armAngle: A, farArmAngle: -10, expression: "happy" }} />
      <Person x={bx} y={floor} s={s} kit={{ pose: "side", facing: -1, colors: BRITISH, armAngle: A, farArmAngle: -10, expression: "neutral" }} />
      {lt > 0.7 && <circle cx={hand[0]} cy={hand[1]} r={22} fill="#eebf98" stroke={INK} strokeWidth={4} />}
      <Table y={floor - 250} x0={170} x1={910} />
      {/* the treaty and an inkwell on the table */}
      <path d={`M 400 ${floor - 252} L 640 ${floor - 252} L 620 ${floor - 262} L 420 ${floor - 262} Z`} fill="#f4ecd4" stroke={INK} strokeWidth={3} />
      <rect x={700} y={floor - 290} width={36} height={38} rx={6} fill="#1b140d" /><line x1={718} y1={floor - 290} x2={760} y2={floor - 360} stroke="#f4f0e6" strokeWidth={6} />
      <Label x={540} y={560} lt={lt} at={0.3} text="TREATY OF PARIS" size={52} />
    </g>
  );
};

// ---------- 4: top-down insert — the quill draws the border on the 1755 map ----------
export const SceneQuill: React.FC<SP> = ({ lt }) => {
  const W0 = 900, H0 = 1100, cx = 540, cy = 960;
  // pen path in map coords: from Lake Superior west along the water to the oval lake
  const path: V2[] = [[W0 * 0.06, H0 * 0.1], [-W0 * 0.02, H0 * 0.02], [-W0 * 0.1, -H0 * 0.06], [-W0 * 0.24, -H0 * 0.155]];
  const k = interpolate(lt, [0.5, 3.3], [0, 1], cl);
  const segs = path.slice(1).map((p, i) => Math.hypot(p[0] - path[i][0], p[1] - path[i][1]));
  const tot = segs.reduce((a, b) => a + b, 0);
  const drawn: V2[] = [path[0]]; let d = k * tot; let tip: V2 = path[0];
  for (let i = 0; i < segs.length; i++) { if (d >= segs[i]) { drawn.push(path[i + 1]); tip = path[i + 1]; d -= segs[i]; } else { const f = d / segs[i]; tip = [path[i][0] + (path[i + 1][0] - path[i][0]) * f, path[i][1] + (path[i + 1][1] - path[i][1]) * f]; drawn.push(tip); break; } }
  const lift = lt < 0.5 ? (0.5 - lt) * 80 : 0;
  const pointK = lerpA(lt, [[0, 0], [0.6, 1]]);
  return (
    <g>
      <rect x={-60} y={-60} width={1200} height={2200} fill="#6a3e22" />
      {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M -60 ${80 + i * 150} q 600 ${rnd(i) * 40 - 20} 1200 0`} stroke="#5a3418" strokeWidth={5} fill="none" />)}
      <OldMap x={cx} y={cy} w={W0} h={H0} rot={-4}>
        <path d={"M " + drawn.map((p) => p.join(" ")).join(" L ")} stroke="#a8322a" strokeWidth={9} fill="none" strokeLinecap="round" strokeDasharray="20 10" />
      </OldMap>
      {/* British delegate's finger on the lake (from the left), American's quill (from the bottom right) */}
      <Arm x={cx - 150 + (1 - pointK) * 260} y={cy - 210 - (1 - pointK) * 200} from={[1240, 160]} sleeve="#2e4a3a" point />
      <g transform={`rotate(-4 ${cx} ${cy})`}>
        <Arm x={cx + tip[0]} y={cy + tip[1] - lift} from={[-200, cy + 1000]} sleeve="#6a4a30" quill />
      </g>
      <Label x={540} y={360} lt={lt} at={0.3} text="THE BEST MAP: 1755" size={50} />
    </g>
  );
};

// ---------- 7: surveyors in a canoe find a maze of bays and islands ----------
export const SceneCanoe: React.FC<SP> = ({ lt, frame }) => {
  const wy = 1300;
  const bx = 540;
  const look = lt > 0.9; // the bow man stops, looks from the map back to his partner
  const stroke = look ? 0 : Math.sin(frame * 0.18);
  const sA = look ? -20 : -60 + stroke * 22;
  const ps = 1.0;
  const sx = bx - 170, fx = bx + 150;
  const sy = wy - 40 + 174 * ps - 110 * ps;
  const sh = handAt(sx, sy, ps, 1, sA, stroke * 5);
  const mh = handAt(fx, sy, ps, look ? -1 : 1, -70, 0);
  return (
    <g>
      <Sky top="#8ab4d4" bottom="#e8f0ee" clouds={2} drift={frame / 40} />
      {/* islands everywhere: rocky shores with pines */}
      {[[120, 1010, 260], [520, 990, 200], [900, 1020, 300], [300, 1080, 180], [760, 1100, 160]].map(([x, y, w], i) => (
        <g key={i}>
          <ellipse cx={x} cy={y} rx={w} ry={34} fill="#8a8a7a" />
          {Array.from({ length: 6 }, (_, k) => <Pine key={k} x={x - w * 0.8 + k * w * 0.32} y={y - 10} h={160 + rnd(i * 7 + k) * 120 + (y - 990) * 0.6} c="#2e4e3c" c2="#3a5a48" />)}
        </g>
      ))}
      <rect x={-60} y={1110} width={1200} height={1200} fill="#4a7a94" />
      {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M ${-60 + ((frame * 2 + i * 190) % 1300)} ${1150 + i * 40} l 80 0`} stroke="#cfe2ea" strokeWidth={4} opacity={0.5} />)}
      {/* canoe */}
      <Person x={sx} y={sy} s={ps} kit={{ pose: "side", facing: 1, colors: SURV_A, armAngle: sA, farArmAngle: sA + 6, lean: stroke * 5, expression: look ? "neutral" : "determined" }} />
      <line x1={sh[0] - 40} y1={sh[1] - 60} x2={sh[0] + 60} y2={wy + 60 - stroke * 30} stroke="#8a5a34" strokeWidth={10} strokeLinecap="round" />
      <Person x={fx} y={sy} s={ps} kit={{ pose: "side", facing: look ? -1 : 1, colors: SURV_B, armAngle: -70, farArmAngle: -60, expression: look ? "sad" : "neutral" }} />
      {/* the old map held open in his hands */}
      <rect x={mh[0] + (look ? -110 : -10)} y={mh[1] - 90} width={120} height={90} fill="#ecd9a8" stroke="#8a6a3a" strokeWidth={4} transform={`rotate(${look ? 8 : -8} ${mh[0]} ${mh[1]})`} />
      <path d={`M ${bx - 330} ${wy - 40} Q ${bx} ${wy + 40} ${bx + 330} ${wy - 40} Q ${bx + 300} ${wy + 10} ${bx} ${wy + 18} Q ${bx - 300} ${wy + 10} ${bx - 330} ${wy - 40} Z`} fill="#c87a3a" stroke={INK} strokeWidth={5} />
      <path d={`M ${bx - 320} ${wy - 34} Q ${bx} ${wy + 20} ${bx + 320} ${wy - 34}`} stroke="#8a4a1e" strokeWidth={6} fill="none" />
      {stroke < -0.8 && <ellipse cx={sh[0] + 60} cy={wy + 54} rx={40} ry={8} fill="#e8f4f8" opacity={0.6} />}
      <rect x={-60} y={wy + 30} width={1200} height={900} fill="#3a6a84" />
      <Label x={540} y={560} lt={lt} at={0.3} text="LAKE OF THE WOODS" size={50} />
    </g>
  );
};

// ---------- 9: 1818 — a commissioner rules a straight line south ----------
export const SceneRuler: React.FC<SP> = ({ lt }) => {
  const floor = GY + 250, s = 1.15;
  const top: [V2, V2, V2, V2] = [[330, floor - 330], [880, floor - 330], [960, floor - 220], [250, floor - 220]];
  const ax = 230;
  const k = interpolate(lt, [1.0, 2.6], [0, 1], cl);
  const A0 = -104, A1 = -64, LEAN = 8;
  const A = lt < 0.6 ? lerpA(lt, [[0, -30], [0.6, A0]]) : A0 + (A1 - A0) * k;
  const h0 = handAt(ax, floor, s, 1, A0, LEAN), h1 = handAt(ax, floor, s, 1, A1, LEAN), hc = handAt(ax, floor, s, 1, A, LEAN);
  const nod = lt > 2.7 ? Math.sin((lt - 2.7) * 12) * 4 : 0;
  return (
    <g>
      <Salon floor={floor} tint="#c8c0a8" />
      <Person x={ax} y={floor} s={s} kit={{ pose: "side", facing: 1, colors: COMM_A, armAngle: A, farArmAngle: A + 8, lean: LEAN, expression: "determined" }} />
      <Person x={830} y={floor} s={s} kit={{ pose: "side", facing: -1, colors: COMM_B, armAngle: -20, farArmAngle: -10, lean: nod, expression: lt > 2.7 ? "happy" : "neutral" }} />
      {/* table top in 3/4 view with the map */}
      <path d={`M ${top.map((p) => p.join(" ")).join(" L ")} Z`} fill="#7a4a2a" stroke={INK} strokeWidth={5} />
      <rect x={250} y={floor - 220} width={710} height={30} fill="#6a3e22" stroke={INK} strokeWidth={4} />
      {[280, 900].map((x) => <rect key={x} x={x} y={floor - 190} width={30} height={190} fill="#5a3418" stroke={INK} strokeWidth={4} />)}
      <path d={`M 420 ${floor - 326} L 800 ${floor - 326} L 840 ${floor - 226} L 380 ${floor - 226} Z`} fill="#ecd9a8" stroke="#8a6a3a" strokeWidth={3} />
      <path d={`M 560 ${floor - 318} q 40 -4 70 8 q 20 18 -10 30 q -40 10 -60 -8 q -14 -16 0 -30 Z`} fill="#9ab8c0" stroke="#6a4a2a" strokeWidth={3} />
      <line x1={420} y1={floor - 270} x2={820} y2={floor - 270} stroke="#a8322a" strokeWidth={3} strokeDasharray="8 6" opacity={k > 0.9 ? 1 : 0.0} />
      {/* ruler laid along the stroke; the pen stays in his hand and the red line follows it */}
      {(() => { const ang = (Math.atan2(h1[1] - h0[1], h1[0] - h0[0]) * 180) / Math.PI, len = Math.hypot(h1[0] - h0[0], h1[1] - h0[1]);
        return <g>
          <rect x={-20} y={4} width={len + 40} height={16} fill="#d8b878" stroke={INK} strokeWidth={2} transform={`translate(${h0[0]} ${h0[1]}) rotate(${ang})`} />
          {lt > 0.6 && <line x1={h0[0]} y1={h0[1]} x2={hc[0]} y2={hc[1]} stroke="#a8322a" strokeWidth={5} />}
          <line x1={hc[0]} y1={hc[1]} x2={hc[0] - 14} y2={hc[1] - 80} stroke="#f4f0e6" strokeWidth={7} strokeLinecap="round" />
          <circle cx={hc[0]} cy={hc[1] - 6} r={15} fill="#eebf98" stroke={INK} strokeWidth={3} />
        </g>; })()}
      <Label x={540} y={560} lt={lt} at={0.3} text="1818: A STRAIGHT LINE" size={50} />
    </g>
  );
};

// ---------- 14: inside the little shed — a video check-in with border officers ----------
export const SceneKiosk: React.FC<SP> = ({ lt, frame }) => {
  const floor = GY + 250, s = 1.3, mx = 330;
  const A = lerpA(lt, [[0.2, -20], [0.8, -105]]);
  const ph = handAt(mx, floor, s, 1, A, 0);
  const nod = lt > 1.4 ? Math.sin((lt - 1.4) * 10) * 6 : 0;
  const sx = 720, sy = 560, sw = 300, shh = 360;
  return (
    <g>
      <rect x={-60} y={-60} width={1200} height={2200} fill="#a88a62" />
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-60 + i * 100} y={-60} width={96} height={floor + 60} fill={i % 2 ? "#b09268" : "#a48660"} />)}
      <rect x={-60} y={floor} width={1200} height={900} fill="#6a5238" />
      {/* screen on the wall with an officer on a video call */}
      <rect x={sx - 20} y={sy - 20} width={sw + 40} height={shh + 40} rx={18} fill="#1e1e22" stroke={INK} strokeWidth={6} />
      <clipPath id="scr"><rect x={sx} y={sy} width={sw} height={shh} /></clipPath>
      <g clipPath="url(#scr)">
        <rect x={sx} y={sy} width={sw} height={shh} fill="#d8e4ea" />
        <rect x={sx} y={sy + shh * 0.55} width={sw} height={shh} fill="#b8c8d0" />
        <Person x={sx + sw / 2} y={sy + shh + 300 + nod} s={1.05} kit={{ pose: "front", colors: OFFICER, expression: "neutral" }} />
      </g>
      <circle cx={sx + sw / 2} cy={sy - 8} r={5} fill="#5ad25a" />
      <rect x={sx + 40} y={sy + shh + 40} width={sw - 80} height={40} rx={6} fill="#2a2a2e" />
      <text x={sx + sw / 2} y={sy + shh + 68} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={22} fill="#e8e8e8">U.S. CUSTOMS</text>
      <Person x={mx} y={floor} s={s} kit={{ pose: "side", facing: 1, colors: DRIVER, armAngle: A, farArmAngle: -10, expression: "neutral" }} />
      {/* passport held up to the camera */}
      {lt > 0.6 && <g transform={`translate(${ph[0] + 6} ${ph[1] - 30}) rotate(-6)`}>
        <rect x={-34} y={-46} width={68} height={92} rx={6} fill="#1e2a5a" stroke={INK} strokeWidth={4} />
        <circle cx={0} cy={-6} r={16} fill="none" stroke="#d6b04a" strokeWidth={3} />
      </g>}
      <Label x={540} y={420} lt={lt} at={0.3} text="CHECK IN BY VIDEO" size={50} />
    </g>
  );
};

// ---------- 15: the little shed in the woods; he walks back to the truck ----------
export const DOOR_SHUT = 0.75;
export const SceneShed: React.FC<SP & { frame: number }> = ({ lt, frame }) => {
  const floor = GY + 250, s = 1.0;
  const door = lerpA(lt, [[0, 1], [0.4, 1], [DOOR_SHUT, 0]]);
  const mx = lerpA(lt, [[0, 380], [1.7, 760]]);
  const walking = lt > 0.2 && lt < 1.7;
  const shX = 250;
  return (
    <g>
      <RoadWoods floor={floor} frame={frame} />
      {/* shed */}
      <g>
        <path d={`M ${shX - 150} ${floor} L ${shX - 150} ${floor - 300} L ${shX + 150} ${floor - 300} L ${shX + 150} ${floor} Z`} fill="#b8a07a" stroke={INK} strokeWidth={5} />
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={shX - 150 + i * 50} y1={floor - 300} x2={shX - 150 + i * 50} y2={floor} stroke="#9a845e" strokeWidth={3} />)}
        <path d={`M ${shX - 180} ${floor - 290} L ${shX} ${floor - 400} L ${shX + 180} ${floor - 290} Z`} fill="#5a3a2a" stroke={INK} strokeWidth={5} />
        <rect x={shX - 10} y={floor - 230} width={110} height={230} fill="#2a1e14" />
        <rect x={shX - 10} y={floor - 230} width={110 * (0.15 + 0.85 * (1 - door))} height={230} fill="#7a5a3a" stroke={INK} strokeWidth={4} />
        <rect x={shX - 130} y={floor - 380} width={260} height={56} rx={6} fill="#f4f0e6" stroke={INK} strokeWidth={4} transform={`translate(0 ${-40})`} />
        <text x={shX} y={floor - 406} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={32} fill="#1b140d">JIM'S CORNER</text>
      </g>
      <Pickup x={890} y={floor + 70} s={0.75} driver={false} />
      <Person x={mx} y={floor + 40} s={s} kit={{ pose: "side", facing: 1, walking, colors: DRIVER, expression: "neutral" }} />
      <Label x={540} y={560} lt={lt} at={0.2} text="A LITTLE SHED" size={50} />
    </g>
  );
};

// ---------- 16: top-down insert — the 1755 map is rolled up ----------
export const SceneRollUp: React.FC<SP> = ({ lt }) => {
  const W0 = 900, H0 = 1100, cx = 540, cy = 960;
  const k = interpolate(lt, [0.2, 1.4], [0, 1], cl);
  const visW = W0 * (1 - 0.86 * k);
  const left = cx - W0 / 2;
  const rollX = left + visW;
  return (
    <g>
      <rect x={-60} y={-60} width={1200} height={2200} fill="#6a3e22" />
      {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M -60 ${80 + i * 150} q 600 ${rnd(i) * 40 - 20} 1200 0`} stroke="#5a3418" strokeWidth={5} fill="none" />)}
      <clipPath id="rollclip"><rect x={left - 30} y={cy - H0 / 2 - 30} width={visW + 30} height={H0 + 60} /></clipPath>
      <g clipPath="url(#rollclip)"><OldMap x={cx} y={cy} w={W0} h={H0} /></g>
      <rect x={rollX - 34} y={cy - H0 / 2 - 6} width={68} height={H0 + 12} rx={34} fill="#d8c08a" stroke="#8a6a3a" strokeWidth={6} />
      <line x1={rollX - 10} y1={cy - H0 / 2} x2={rollX - 10} y2={cy + H0 / 2} stroke="#b89a62" strokeWidth={4} />
      {/* both hands on the roll */}
      <Arm x={rollX + 10} y={cy - 300} from={[1240, cy - 520]} sleeve="#2e4a3a" />
      <Arm x={rollX + 10} y={cy + 300} from={[1240, cy + 520]} sleeve="#2e4a3a" />
    </g>
  );
};
