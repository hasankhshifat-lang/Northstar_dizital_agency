import React from "react";
import { interpolate, Easing } from "remotion";
import { Sky } from "./ponyScenes";
import { Label } from "./chickenScenes";
import { handAt } from "./madridScenes";
import { Figure } from "./pirateScenes";
import { Horse } from "./horse";
import { KitColors } from "../kit/Kit";

/**
 * Ground scenes for "Black Bart: the stagecoach robber who left poems" (Wells Fargo holdups 1875–1883, laundry mark F.X.O.7).
 * lt = seconds since the scene started. Kit side pose: feet at (0,0), shoulder pivot (0,-284), straight-arm hand = handAt().
 * Walk speed from the Kit stride: ≈ 240·s px per second. Scenes are drawn at GY and shifted −130 px by the story.
 * Storyboard: social/scripts/black-bart-2026-11-24.md.
 */
const INK = "#2b1d14";
const GY = 1240;
const cl = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
type SP = { lt: number; dur: number; frame: number };
const WALK = 240;

// ---------- people (1870s–80s) ----------
const BART: Partial<KitColors> = { coat: "#d8ccb0", coatShade: "#b8ac90", coatLight: "#e8dcc0", patch: "#e8dcc0", scarf: "#3a2a1a", scarfShade: "#2a1e12", trousers: "#4a4036", trousersShade: "#3a322a", hair: "#9a9a96", capStyle: "hair" } as Partial<KitColors>;
const GENT: Partial<KitColors> = { coat: "#2c2e36", coatShade: "#1e2026", coatLight: "#3a3c44", patch: "#3a3c44", scarf: "#efefe8", scarfShade: "#cfcfc8", trousers: "#3a3a42", trousersShade: "#2a2a30", hair: "#9a9a96", capStyle: "hair", button: "#c9a54a" } as Partial<KitColors>;
const DRIVER: Partial<KitColors> = { coat: "#7a5a3a", coatShade: "#5e442c", coatLight: "#8a6a4a", patch: "#8a6a4a", scarf: "#c23b2c", scarfShade: "#8f2a20", trousers: "#3a3a3a", trousersShade: "#2a2a2a", cap: "#4a3a2a" };
const DET: Partial<KitColors> = { coat: "#3a3a42", coatShade: "#2a2a30", coatLight: "#4a4a52", patch: "#4a4a52", scarf: "#efefe8", scarfShade: "#cfcfc8", trousers: "#3a3a42", trousersShade: "#2a2a30", hair: "#5a3a20", capStyle: "hair" } as Partial<KitColors>;
const DET2: Partial<KitColors> = { ...DET, coat: "#5a4a3a", coatShade: "#463a2c", coatLight: "#6a5a4a", hair: "#2a1e14" } as Partial<KitColors>;
const CLERK: Partial<KitColors> = { coat: "#efe8d6", coatShade: "#cfc6b0", coatLight: "#fff8e8", patch: "#fff8e8", scarf: "#3a5a8a", scarfShade: "#2a4266", trousers: "#3a3a40", trousersShade: "#2a2a30", hair: "#1a1410", capStyle: "hair", skin: "#e8c8a0", skinShade: "#c8a880" } as Partial<KitColors>;
const AGENT: Partial<KitColors> = { coat: "#1f3a2a", coatShade: "#162a1e", coatLight: "#2a4a36", patch: "#2a4a36", scarf: "#efefe8", scarfShade: "#cfcfc8", trousers: "#2a2a2e", trousersShade: "#1e1e22", hair: "#6a4a2a", capStyle: "hair" } as Partial<KitColors>;
const GUARD: Partial<KitColors> = { coat: "#2a3a5a", coatShade: "#1e2a44", coatLight: "#3a4a6a", patch: "#3a4a6a", scarf: "#c9a54a", scarfShade: "#a8843a", trousers: "#2a3a5a", trousersShade: "#1e2a44", cap: "#1e2a44" };

const Bowler: React.FC<{ color?: string }> = ({ color = "#1a1a1e" }) => <g><path d="M -40 -372 Q -40 -440 10 -442 Q 60 -440 60 -372 Z" fill={color} stroke={INK} strokeWidth={4} /><ellipse cx={10} cy={-372} rx={66} ry={11} fill={color} stroke={INK} strokeWidth={4} /></g>;
/** flour-sack mask over the Kit head (side pose), with two eye holes, bowler on top */
const Sack: React.FC = () => (
  <g>
    <path d="M -54 -280 Q -66 -380 -30 -420 Q 10 -446 50 -418 Q 80 -380 66 -282 Q 6 -268 -54 -280 Z" fill="#efe6cc" stroke={INK} strokeWidth={4} />
    <ellipse cx={24} cy={-352} rx={9} ry={7} fill="#1a1410" /><ellipse cx={52} cy={-350} rx={7} ry={6} fill="#1a1410" />
    <path d="M -50 -300 Q 6 -290 64 -300" stroke="#c8bc9c" strokeWidth={3} fill="none" />
    <Bowler />
  </g>
);
const Hand: React.FC<{ p: [number, number]; skin?: string; r?: number }> = ({ p, skin = "#eebf98", r = 11 }) => <circle cx={p[0]} cy={p[1]} r={r} fill={skin} stroke={INK} strokeWidth={3} />;

// ---------- props ----------
/** shotgun held in the hand at p, angle a (deg, 0 = pointing right) */
const Shotgun: React.FC<{ p: [number, number]; a: number }> = ({ p, a }) => (
  <g transform={`translate(${p[0]} ${p[1]}) rotate(${a})`}><rect x={-60} y={-8} width={70} height={18} rx={6} fill="#6a4a2a" stroke={INK} strokeWidth={3} /><rect x={6} y={-6} width={150} height={7} fill="#3a3a3a" stroke={INK} strokeWidth={2} /><rect x={6} y={2} width={150} height={7} fill="#3a3a3a" stroke={INK} strokeWidth={2} /></g>
);
/** Wells Fargo strongbox, origin = bottom centre */
const Box: React.FC<{ x: number; y: number; s?: number; open?: number; rot?: number }> = ({ x, y, s = 1, open = 0, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot})`}>
    <rect x={-70} y={-70} width={140} height={70} fill="#2a4a2a" stroke={INK} strokeWidth={4} />
    <rect x={-70} y={-70} width={140} height={10} fill="#c9a54a" /><rect x={-70} y={-10} width={140} height={10} fill="#c9a54a" />
    <text y={-28} textAnchor="middle" fontFamily="Georgia" fontWeight={900} fontSize={18} fill="#e8d8a0">WELLS FARGO</text>
    <g transform={`translate(-70 -70) rotate(${-open * 100})`}><rect x={0} y={-20} width={140} height={20} fill="#1e3a1e" stroke={INK} strokeWidth={4} /></g>
  </g>
);
/** a Concord stagecoach facing right, origin = ground under the body; wheels turn with `spin` */
export const Coach: React.FC<{ x: number; y: number; s?: number; spin?: number; driver?: number; frame: number }> = ({ x, y, s = 1, spin = 0, driver = -40, frame }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -230 -110 Q -250 -300 -200 -330 L 170 -330 Q 220 -300 200 -110 Z" fill="#8a2a1f" stroke={INK} strokeWidth={5} />
    <rect x={-150} y={-300} width={120} height={90} fill="#3a2a1a" stroke="#c9a54a" strokeWidth={5} /><rect x={20} y={-300} width={120} height={90} fill="#3a2a1a" stroke="#c9a54a" strokeWidth={5} />
    <path d="M -200 -330 L 170 -330 L 160 -370 L -190 -370 Z" fill="#5a3a24" stroke={INK} strokeWidth={4} />
    <text x={-15} y={-130} textAnchor="middle" fontFamily="Georgia" fontWeight={900} fontSize={26} fill="#e8d8a0">OVERLAND STAGE</text>
    {/* driver on the box seat */}
    <Figure x={210} y={-270} s={0.55} facing={1} A1={driver} A2={-60} colors={DRIVER} frame={frame} expression="scared" />
    <rect x={180} y={-290} width={90} height={24} fill="#5a3a24" stroke={INK} strokeWidth={3} />
    {[-160, 150].map((wx, i) => <g key={wx} transform={`translate(${wx} -70) rotate(${spin})`}><circle r={i ? 70 : 80} fill="none" stroke="#3a2214" strokeWidth={12} />{[0, 30, 60, 90, 120, 150].map((a) => <line key={a} x1={-(i ? 66 : 76) * Math.cos((a * Math.PI) / 180)} y1={-(i ? 66 : 76) * Math.sin((a * Math.PI) / 180)} x2={(i ? 66 : 76) * Math.cos((a * Math.PI) / 180)} y2={(i ? 66 : 76) * Math.sin((a * Math.PI) / 180)} stroke="#c9a54a" strokeWidth={5} />)}<circle r={14} fill="#2a1a10" /></g>)}
  </g>
);
const Mountains: React.FC<{ scroll?: number; ground?: number }> = ({ scroll = 0, ground = GY }) => (
  <g>
    {Array.from({ length: 6 }, (_, i) => { const x = -300 + i * 300 - ((scroll * 0.3) % 300); return <path key={i} d={`M ${x - 250} ${ground - 200} L ${x} ${ground - 620 - (i % 2) * 120} L ${x + 250} ${ground - 200} Z`} fill={i % 2 ? "#7a8a6a" : "#6a7a5a"} stroke={INK} strokeWidth={4} />; })}
    {Array.from({ length: 9 }, (_, i) => { const x = -100 + i * 150 - ((scroll * 0.7) % 150); return <path key={i} d={`M ${x - 50} ${ground - 60} L ${x} ${ground - 300 - (i % 3) * 40} L ${x + 50} ${ground - 60} Z`} fill="#3a5a3a" stroke={INK} strokeWidth={3} />; })}
  </g>
);
const Dirt: React.FC<{ ground?: number }> = ({ ground = GY }) => <g><rect x={-60} y={ground - 40} width={1200} height={1200} fill="#b8946a" />{Array.from({ length: 14 }, (_, i) => <ellipse key={i} cx={rnd(i) * 1100} cy={ground + rnd(i + 4) * 240} rx={20 + rnd(i) * 30} ry={5} fill="#a07e56" />)}</g>;
/** poem paper: shows written lines up to k (0..1) */
const Poem: React.FC<{ x: number; y: number; w: number; k?: number; rot?: number; sign?: boolean }> = ({ x, y, w, k = 1, rot = 0, sign = true }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-w / 2} y={-w * 0.65} width={w} height={w * 1.3} fill="#f2ead2" stroke={INK} strokeWidth={4} />
    {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M ${-w * 0.38} ${-w * 0.45 + i * w * 0.14} q ${w * 0.1} ${-w * 0.03} ${w * 0.2} 0 t ${w * 0.2} 0 t ${w * 0.2} 0`} stroke="#3a2a6a" strokeWidth={Math.max(2, w * 0.012)} fill="none" opacity={k > i / 8 ? 1 : 0} />)}
    {sign && k > 0.85 && <text x={0} y={w * 0.5} textAnchor="middle" fontFamily="Georgia" fontStyle="italic" fontWeight={700} fontSize={w * 0.085} fill="#3a2a6a">Black Bart, the PO8</text>}
  </g>
);

// ---------- 1 + LOOP: the coach stopped on a mountain road; Bart, masked, holds the shotgun; he tucks a poem into the empty box ----------
export const SceneHook: React.FC<SP & { u0?: number }> = ({ lt, frame, u0 = 0 }) => {
  const u = lt + u0;
  const push = 1.06 + Math.max(0, Math.min(5.5, u + 2.6)) * 0.016;
  const bx = 860;
  // near arm holds the poem: lowers it into the open box (u 1.0–2.0); far arm keeps the shotgun up
  const aNear = u < 4.6 ? -60 : interpolate(u, [4.6, 5.6], [-60, -25], cl);
  const pN = handAt(bx, GY + 60, 1.0, -1, aNear, 0), pF = handAt(bx, GY + 60, 1.0, -1, -82, 0);
  return (
    <g transform={`translate(540 1040) scale(${push}) translate(-540 -1040)`}>
      <Sky top="#8fb4cf" bottom="#efe2c4" clouds={2} drift={u + 4} />
      <Mountains />
      <Dirt />
      <g transform={`translate(100 ${GY * 0.2}) scale(0.8)`}>
      <g transform={`translate(470 ${GY + 30}) scale(0.9)`}><Horse phase={frame * 0.05} galloping={false} rider={false} mailbag={false} color="#6a4a32" /></g>
      <Coach x={60} y={GY + 30} s={0.9} spin={0} driver={-150} frame={frame} />
      <Box x={700} y={GY + 70} open={1} />
      <Figure x={bx} y={GY + 60} s={1.0} facing={-1} A1={aNear} A2={-82} colors={BART} frame={frame} expression="neutral"><Sack /></Figure>
      <Shotgun p={pF} a={190} />
      <Hand p={pF} />
      <Poem x={pN[0] - 10} y={pN[1] - 20} w={70} rot={-10} sign={false} />
      <Hand p={pN} />
      </g>
    </g>
  );
};

// ---------- 3: the holdup: he steps out, the driver throws down the box, he picks it up and walks into the trees ----------
export const SceneHoldup: React.FC<SP> = ({ lt, frame }) => {
  const coachX = interpolate(lt, [0, 1.0], [-200, 120], { ...cl, easing: Easing.out(Easing.cubic) });
  const tThrow = 3.7;
  const boxK = interpolate(lt, [tThrow, tThrow + 0.5], [0, 1], cl);
  const tPick = 4.9;
  const leave = Math.max(0, lt - tPick - 0.4);
  const bxx = 860 + leave * WALK * 0.9;
  const picked = lt > tPick;
  const pN = handAt(bxx, GY + 60, 0.9, picked ? 1 : -1, picked ? -10 : -40, 0);
  const pF = handAt(bxx, GY + 60, 0.9, picked ? 1 : -1, picked ? -20 : -82, 0);
  const boxX = picked ? pN[0] : 270 + 400 * boxK, boxY = picked ? pN[1] + 70 : GY - 220 + 280 * boxK * boxK + (boxK < 1 ? -140 * Math.sin(boxK * Math.PI) : 0);
  return (
    <g>
      <Sky top="#8fb4cf" bottom="#efe2c4" clouds={2} drift={lt} />
      <Mountains />
      <Dirt />
      <g transform={`translate(100 ${GY * 0.2}) scale(0.8)`}>
      <g transform={`translate(${coachX + 300} ${GY + 30}) scale(0.9)`}><Horse phase={frame * (lt < 1.0 ? 0.3 : 0.05)} galloping={lt < 1.0} rider={false} mailbag={false} color="#6a4a32" /></g>
      <Coach x={coachX - 60} y={GY + 30} s={0.9} spin={coachX * 0.8} driver={lt > tThrow - 0.3 && lt < tThrow + 0.3 ? -120 : -60} frame={frame} />
      <Box x={boxX} y={boxY} s={0.9} rot={picked ? 0 : boxK * 20 - 20} />
      <Figure x={bxx} y={GY + 60} s={0.9} facing={picked ? 1 : -1} A1={picked ? -10 : -40} A2={picked ? -20 : -82} colors={BART} frame={frame} walking={leave > 0} expression="neutral"><Sack /></Figure>
      <Shotgun p={pF} a={picked ? 100 : 190} />
      <Hand p={pF} /><Hand p={pN} />
      </g>
      <Label x={540} y={1450} lt={lt} at={6.9} text="NEVER SHOT ANYONE" size={42} />
    </g>
  );
};

// ---------- 4: a Wells Fargo agent adds tally marks under a REWARD poster ----------
export const SceneTally: React.FC<SP> = ({ lt, frame }) => {
  const n = Math.min(28, Math.floor(interpolate(lt, [0.0, 0.6], [20, 28], cl)));
  const ph = lt < 0.6 ? (lt * 8) % 1 : 0;
  const A = -110 + (ph < 0.5 ? ph * 30 : (1 - ph) * 30);
  const p = handAt(300, GY + 60, 1.0, 1, A, 0);
  return (
    <g>
      <rect x={-60} y={0} width={1200} height={2300} fill="#8a6a4a" />
      {Array.from({ length: 10 }, (_, i) => <rect key={i} x={-60 + i * 120} y={0} width={110} height={GY + 60} fill="#967656" />)}
      <rect x={-60} y={GY + 60} width={1200} height={800} fill="#5a3a24" />
      <g transform="translate(560 640)"><rect x={-200} y={-260} width={400} height={300} fill="#efe2b0" stroke={INK} strokeWidth={5} />
        <text y={-200} textAnchor="middle" fontFamily="Georgia" fontWeight={900} fontSize={54} fill="#7a1f1f">REWARD</text>
        <text y={-140} textAnchor="middle" fontFamily="Georgia" fontWeight={700} fontSize={26} fill={INK}>STAGE ROBBER</text>
        <path d="M -50 -110 Q -60 -40 0 -30 Q 60 -40 50 -110 Q 0 -130 -50 -110 Z" fill="#efe6cc" stroke={INK} strokeWidth={3} /><ellipse cx={-16} cy={-80} rx={7} ry={5} fill={INK} /><ellipse cx={16} cy={-80} rx={7} ry={5} fill={INK} />
        <text y={20} textAnchor="middle" fontFamily="Georgia" fontWeight={700} fontSize={24} fill={INK}>WELLS, FARGO &amp; CO.</text></g>
      {/* tally board */}
      <rect x={360} y={760} width={420} height={260} fill="#2a2a2a" stroke="#6a4a2a" strokeWidth={12} />
      {Array.from({ length: n }, (_, i) => { const g = Math.floor(i / 5), k = i % 5; const x = 390 + (g % 4) * 96 + k * 16, y = 790 + Math.floor(g / 4) * 110; return k === 4 ? <line key={i} x1={x - 70} y1={y + 70} x2={x + 6} y2={y + 10} stroke="#efefe8" strokeWidth={5} /> : <line key={i} x1={x} y1={y} x2={x} y2={y + 80} stroke="#efefe8" strokeWidth={5} />; })}
      <Figure x={300} y={GY + 60} s={1.0} facing={1} A1={A} A2={-20} colors={AGENT} frame={frame} expression="sad" />
      <rect x={p[0] - 5} y={p[1] - 26} width={10} height={30} fill="#efefe8" stroke={INK} strokeWidth={2} />
      <Hand p={p} />
      <Label x={540} y={1450} lt={lt} at={0.3} text={`${n} ROBBERIES`} size={48} bg="#7a1f1f" />
    </g>
  );
};

// ---------- 5: close-up: a pen writes the poem; the signature appears ----------
export const ScenePoem: React.FC<SP> = ({ lt }) => {
  const k = interpolate(lt, [0.3, 3.3], [0, 1], cl);
  const nibX = 540 - 160 + ((k * 8) % 1) * 320, nibY = 520 + Math.floor(k * 8) * 70;
  const signing = k > 0.85;
  const sx = signing ? 380 + (k - 0.85) / 0.15 * 320 : nibX, sy = signing ? 1100 : Math.min(nibY, 1000);
  return (
    <g>
      <rect x={-60} y={0} width={1200} height={2300} fill="#6a4a2a" />
      <Poem x={540} y={820} w={520} k={k} rot={-3} />
      {/* the pen: nib on the paper, the ink line trails it */}
      <g transform={`translate(${sx} ${sy}) rotate(-35)`}><rect x={-8} y={-230} width={16} height={220} fill="#2a2a2a" stroke={INK} strokeWidth={3} /><path d="M -8 -10 L 8 -10 L 0 10 Z" fill="#c9a54a" stroke={INK} strokeWidth={2} /><circle cx={0} cy={-200} r={40} fill="#eebf98" stroke={INK} strokeWidth={4} /></g>
      <Label x={540} y={1450} lt={lt} at={3.4} text="SIGNED: THE PO8" size={44} bg="#3a2a6a" />
    </g>
  );
};

// ---------- 6: 1883, near Copperopolis: a shot from behind the coach; Bart runs; the handkerchief falls from his pocket ----------
export const SceneRun: React.FC<SP> = ({ lt, frame }) => {
  const tShot = 0.7, tDrop = 3.1;
  const run = lt > tShot + 0.2;
  const bx = run ? 520 + (lt - tShot - 0.2) * WALK * 1.0 : 520;
  const pocket: [number, number] = [bx - 20, GY + 60 - 170];
  const hk = lt < tDrop ? null : (() => { const k = Math.min(1, (lt - tDrop) / 0.6); const x0 = 520 + (tDrop - tShot - 0.2) * WALK - 20; return [x0 - k * 30, pocket[1] + k * k * (GY + 50 - pocket[1])] as [number, number]; })();
  return (
    <g>
      <Sky top="#8fb4cf" bottom="#efe2c4" clouds={2} drift={lt} />
      <Mountains />
      <Dirt />
      <g transform="translate(-260 1150) scale(0.9)"><Horse phase={0} galloping={false} rider={false} mailbag={false} color="#6a4a32" /></g>
      <Coach x={-330} y={GY + 30} s={0.9} spin={0} driver={-40} frame={frame} />
      {/* a young man with a rifle beside the coach fires (smoke; no hit is shown) */}
      <Figure x={260} y={GY + 40} s={0.8} facing={1} A1={-92} A2={-88} colors={{ ...DRIVER, coat: "#4a5a3a", coatShade: "#3a462c", coatLight: "#5a6a4a" }} frame={frame} expression="determined" />
      {(() => { const p = handAt(260, GY + 40, 0.8, 1, -90, 0); return <g><rect x={p[0] - 20} y={p[1] - 6} width={160} height={10} fill="#3a2a1a" stroke={INK} strokeWidth={2} />{lt > tShot && lt < tShot + 0.9 && <circle cx={p[0] + 160 + (lt - tShot) * 60} cy={p[1] - (lt - tShot) * 50} r={20 + (lt - tShot) * 50} fill="#efefe8" opacity={0.9 - (lt - tShot)} />}</g>; })()}
      <Figure x={bx} y={GY + 60} s={0.9} facing={1} colors={BART} frame={frame} walking={run} expression="scared" lean={run ? 10 : 0}><Sack /></Figure>
      {lt < tDrop && <rect x={pocket[0] - 14} y={pocket[1] - 10} width={28} height={20} fill="#efefe8" stroke={INK} strokeWidth={2} />}
      {hk && <rect x={hk[0] - 22} y={hk[1] - 10} width={44} height={20} transform={`rotate(${Math.min(1, (lt - tDrop) / 0.6) * 160} ${hk[0]} ${hk[1]})`} fill="#efefe8" stroke={INK} strokeWidth={2} />}
      <Label x={540} y={1450} lt={lt} at={0.3} text="NOV 3, 1883" size={46} />
    </g>
  );
};

// ---------- 7: close-up: a hand lifts the handkerchief; a magnifying glass finds the mark ----------
export const SceneMark: React.FC<SP> = ({ lt }) => {
  const lift = interpolate(lt, [0.1, 0.7], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  const mg = interpolate(lt, [1.4, 2.5], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
  const gx = 900 - mg * 250, gy = 1200 - mg * 330;
  return (
    <g>
      <rect x={-60} y={0} width={1200} height={2300} fill="#a07e56" />
      {Array.from({ length: 20 }, (_, i) => <ellipse key={i} cx={rnd(i) * 1100} cy={rnd(i + 5) * 1700} rx={30 + rnd(i) * 40} ry={8} fill="#8a6a46" />)}
      <g transform={`translate(540 ${880 - lift * 80}) rotate(${-6 + lift * 4})`}>
        <path d="M -300 -220 L 300 -240 L 320 230 L -310 250 Z" fill="#f2efe6" stroke={INK} strokeWidth={6} />
        <path d="M -270 -190 L 270 -208 L 290 200 L -280 220 Z" fill="none" stroke="#c8c0a8" strokeWidth={4} strokeDasharray="14 10" />
        <text x={150} y={170} textAnchor="middle" fontFamily="Courier New, monospace" fontWeight={900} fontSize={34} fill="#3a3a6a">F.X.O.7</text>
      </g>
      {/* fingers holding the corner */}
      <circle cx={250} cy={660 - lift * 80} r={36} fill="#eebf98" stroke={INK} strokeWidth={4} />
      {/* the magnifier slides over the mark and enlarges it */}
      <g transform={`translate(${gx} ${gy})`}>
        <circle r={150} fill="#f6f2e8" stroke="#3a2a1a" strokeWidth={16} />
        {mg > 0.7 && <text y={26} textAnchor="middle" fontFamily="Courier New, monospace" fontWeight={900} fontSize={78} fill="#3a3a6a" opacity={(mg - 0.7) / 0.3}>F.X.O.7</text>}
        <rect x={100} y={100} width={36} height={190} rx={10} transform="rotate(-45 118 195)" fill="#6a4a2a" stroke={INK} strokeWidth={4} />
      </g>
      <Label x={540} y={1450} lt={lt} at={1.0} text="LAUNDRY MARK" size={46} bg="#3a3a6a" />
    </g>
  );
};

// ---------- 8: San Francisco: two detectives walk past laundry after laundry; the last clerk nods at the handkerchief ----------
export const SceneLaundries: React.FC<SP> = ({ lt, frame, dur }) => {
  const s = 0.9;
  const stop = dur - 1.6;
  const scroll = Math.min(lt, stop) * WALK * s;
  const walking = lt < stop;
  const count = Math.min(90, Math.round(interpolate(lt, [0, stop], [12, 90], cl)));
  const off = (k: number, p: number) => ((-scroll * k) % p + p) % p;
  const ph = handAt(560, GY + 60, s, 1, -80, 0);
  return (
    <g>
      <Sky top="#a8bccc" bottom="#e8e2d0" clouds={2} drift={lt} />
      {Array.from({ length: 5 }, (_, i) => { const x = -300 + i * 330 + off(1, 330); return <g key={i}>
        <rect x={x} y={GY - 640} width={320} height={640} fill={["#c8b89a", "#b8a88a", "#d8c8a8"][i % 3]} stroke={INK} strokeWidth={4} />
        <rect x={x + 20} y={GY - 260} width={160} height={200} fill="#8ab0c0" stroke={INK} strokeWidth={4} />
        <rect x={x + 210} y={GY - 280} width={80} height={280} fill="#3a2a1e" stroke={INK} strokeWidth={4} />
        <rect x={x + 10} y={GY - 360} width={300} height={56} fill="#1b140d" stroke="#c9a54a" strokeWidth={3} />
        <text x={x + 160} y={GY - 322} textAnchor="middle" fontFamily="Georgia" fontWeight={700} fontSize={30} fill="#f2e3b5">LAUNDRY</text>
        {[0, 1].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={x + 30 + c * 95} y={GY - 600 + r * 120} width={60} height={80} fill="#5a6a7a" stroke="#efe2c4" strokeWidth={3} />))}
      </g>; })}
      <rect x={-60} y={GY} width={1200} height={1000} fill="#8a8276" />
      {/* the clerk at the last door, appears when they stop; nods */}
      {!walking && <Figure x={780} y={GY + 30} s={0.85} facing={-1} A1={-30} colors={CLERK} frame={frame} expression={lt > stop + 0.5 ? "happy" : "neutral"} lean={lt > stop + 0.5 ? Math.sin(frame * 0.6) * 4 : 0} />}
      <Figure x={400} y={GY + 60} s={s} facing={1} colors={DET2} frame={frame + 7} walking={walking} expression="determined"><Bowler color="#3a2a1a" /></Figure>
      <Figure x={560} y={GY + 60} s={s} facing={1} A1={walking ? undefined : -80} colors={DET} frame={frame} walking={walking} expression="determined"><Bowler /></Figure>
      {!walking && <g><rect x={ph[0] - 26} y={ph[1] - 18} width={52} height={36} fill="#f2efe6" stroke={INK} strokeWidth={3} /><Hand p={ph} /></g>}
      <Label x={540} y={1450} lt={lt} at={0.2} text={`LAUNDRY #${count}`} size={46} />
    </g>
  );
};

// ---------- 9: Charles Boles, well-dressed, walks with his cane; a detective's hand lands on his shoulder ----------
export const SceneBoles: React.FC<SP> = ({ lt, frame }) => {
  const s = 1.0;
  const tStop = 1.4;
  const bx = 280 + Math.min(lt, tStop) * WALK * s * 0.6;
  const dA = lt < tStop ? -30 : interpolate(lt, [tStop, tStop + 0.4], [-30, -100], cl);
  const dx = bx + 230;
  const ph = handAt(dx, GY + 60, s, -1, dA, 0);
  const cane = handAt(bx, GY + 60, s, 1, -20 + (lt < tStop ? Math.sin(frame * 0.22) * 12 : 0), 0);
  return (
    <g>
      <Sky top="#a8bccc" bottom="#e8e2d0" clouds={2} drift={lt} />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={-60 + i * 300} y={GY - 600} width={290} height={600} fill={["#c8b89a", "#b8a88a", "#d8c8a8"][i % 3]} stroke={INK} strokeWidth={4} />)}
      <rect x={-60} y={GY} width={1200} height={1000} fill="#8a8276" />
      <Figure x={bx} y={GY + 60} s={s} facing={1} A1={-20 + (lt < tStop ? Math.sin(frame * 0.22) * 12 : 0)} colors={GENT} frame={frame} walking={lt < tStop} expression={lt > tStop ? "scared" : "happy"}><Bowler /></Figure>
      <line x1={cane[0]} y1={cane[1]} x2={cane[0] + 30} y2={GY + 60} stroke="#3a2a1a" strokeWidth={9} strokeLinecap="round" />
      <Hand p={cane} />
      <Figure x={dx} y={GY + 60} s={s} facing={-1} A1={dA} colors={DET} frame={frame} expression="determined"><Bowler /></Figure>
      <Hand p={ph} />
      <Label x={540} y={1450} lt={lt} at={0.3} text="CHARLES BOLES" size={48} />
    </g>
  );
};

// ---------- 10: San Quentin: the gate shuts (6 YEARS); later it opens and he walks out down the road and is gone ----------
export const ScenePrison: React.FC<SP> = ({ lt, frame, dur }) => {
  const shut = interpolate(lt, [0.2, 0.8], [0, 1], cl);
  const tOut = dur * 0.42;
  const out = lt > tOut;
  const open = out ? interpolate(lt, [tOut, tOut + 0.5], [1, 0], cl) : shut;
  const wx = 540 + Math.max(0, lt - tOut - 0.4) * WALK * 0.7;
  const fadeOut = interpolate(lt, [dur - 1.0, dur - 0.2], [1, 0], cl);
  return (
    <g>
      <Sky top={out ? "#9fc0dc" : "#7a8a9a"} bottom={out ? "#f2e6c8" : "#c8ccd0"} clouds={2} drift={lt} />
      <rect x={-60} y={GY - 700} width={1200} height={700} fill="#b8b0a0" stroke={INK} strokeWidth={5} />
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-60 + i * 100} y={GY - 760} width={60} height={60} fill="#b8b0a0" stroke={INK} strokeWidth={4} />)}
      <rect x={-60} y={GY - 560} width={1200} height={60} fill="#1b140d" />
      <text x={540} y={GY - 518} textAnchor="middle" fontFamily="Georgia" fontWeight={900} fontSize={40} fill="#f2e3b5">SAN QUENTIN</text>
      <rect x={380} y={GY - 440} width={320} height={440} fill="#2a2a2a" />
      {/* gate bars slide across */}
      {Array.from({ length: 8 }, (_, i) => <rect key={i} x={380 + i * 40 * open} y={GY - 440} width={12} height={440} fill="#5a5a60" stroke={INK} strokeWidth={2} />)}
      <rect x={-60} y={GY} width={1200} height={1000} fill="#b8946a" />
      {!out && <Figure x={440 + (1 - shut) * 120} y={GY + 40} s={0.85} facing={-1} A1={-10} colors={{ ...BART, coat: "#5a5a60", coatShade: "#46464a", coatLight: "#6a6a70" }} frame={frame} expression="sad" />}
      {!out && <Figure x={880} y={GY + 60} s={0.95} facing={-1} A1={-60} colors={GUARD} frame={frame} expression="determined" />}
      {out && <g opacity={fadeOut}><Figure x={wx} y={GY + 60} s={0.9} facing={1} colors={GENT} frame={frame} walking={lt > tOut + 0.4} expression="neutral"><Bowler /></Figure></g>}
      <Label x={540} y={1450} lt={lt} at={0.4} text={out ? (lt > dur - 1.4 ? "NEVER SEEN AGAIN" : "1888: RELEASED") : "6 YEARS"} size={46} bg={out ? "#1f4a2a" : "#3a3a42"} />
    </g>
  );
};
