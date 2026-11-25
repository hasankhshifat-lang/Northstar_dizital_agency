import React from "react";
import { interpolate, Easing } from "remotion";
import { Sky } from "./ponyScenes";
import { Label } from "./chickenScenes";
import { handAt } from "./madridScenes";
import { Figure } from "./pirateScenes";
import { Skirt } from "./violetScenes";
import { KitColors } from "../kit/Kit";

/**
 * Ground scenes for "A teacher in her sixties went over Niagara Falls in a barrel" (Annie Edson Taylor, 24 October 1901).
 * lt = seconds since the scene started. Kit side pose: feet at (0,0), shoulder pivot (0,-284), straight-arm hand = handAt().
 * Walk speed from the Kit stride: ≈ 240·s px per second. Scenes are drawn at GY and shifted −130 px by the story.
 * Storyboard: social/scripts/niagara-barrel-2026-11-25.md.
 */
const INK = "#2b1d14";
const GY = 1240;
const WALK = 240;
const cl = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const ease = Easing.inOut(Easing.cubic);
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
type SP = { lt: number; dur: number; frame: number };
type V2 = [number, number];

// ---------- people (1901) ----------
const ANNIE: Partial<KitColors> = { coat: "#2a2a3a", coatShade: "#1e1e2a", coatLight: "#3a3a4e", patch: "#3a3a4e", scarf: "#efe8d6", scarfShade: "#cfc6b0", trousers: "#2a2a3a", trousersShade: "#1e1e2a", hair: "#b8b4ac", capStyle: "hair", button: "#efe8d6" } as Partial<KitColors>;
const ANNIE_OLD: Partial<KitColors> = { ...ANNIE, hair: "#e0ddd6", coat: "#4a4040", coatShade: "#3a3232", coatLight: "#5a5050", patch: "#5a5050" } as Partial<KitColors>;
const HELPER: Partial<KitColors> = { coat: "#6a5a3a", coatShade: "#54462c", coatLight: "#7c6a48", patch: "#7c6a48", scarf: "#efe8d6", scarfShade: "#cfc6b0", trousers: "#3a3a3a", trousersShade: "#2a2a2a", hair: "#3a2a1e", cap: "#4a3a2a", capShade: "#3a2c1e", capBand: "#2a1e14" };
const HELPER2: Partial<KitColors> = { ...HELPER, coat: "#3a4a5a", coatShade: "#2c3846", coatLight: "#4a5a6c", patch: "#4a5a6c", hair: "#a06a30", cap: "#2a2a2a" } as Partial<KitColors>;
const COOPER: Partial<KitColors> = { coat: "#efe8d6", coatShade: "#cfc6b0", coatLight: "#fff8e8", patch: "#cfc6b0", scarf: "#6a4a2a", scarfShade: "#4a3220", trousers: "#5a4a3a", trousersShade: "#463a2c", hair: "#6a4a2a", capStyle: "hair" } as Partial<KitColors>;
const MANAGER: Partial<KitColors> = { coat: "#8a7a4a", coatShade: "#6e6038", coatLight: "#9c8c5a", patch: "#9c8c5a", scarf: "#c23b2c", scarfShade: "#8f2a20", trousers: "#5a4a2a", trousersShade: "#463a20", hair: "#2a1e14", capStyle: "hair" } as Partial<KitColors>;
const CROWD: Partial<KitColors>[] = [
  { coat: "#4a5a6e", coatShade: "#3a485a", coatLight: "#5a6c82", patch: "#5a6c82", hair: "#2a1a12", capStyle: "hair" } as Partial<KitColors>,
  { coat: "#6a4a3a", coatShade: "#563a2c", coatLight: "#7c5a48", patch: "#7c5a48", hair: "#c8b890", capStyle: "hair" } as Partial<KitColors>,
  { coat: "#2a3a2e", coatShade: "#1e2a22", coatLight: "#3a4a3e", patch: "#3a4a3e", hair: "#5a3a20", capStyle: "hair" } as Partial<KitColors>,
  { coat: "#5a2a3a", coatShade: "#46202e", coatLight: "#6c3a4a", patch: "#6c3a4a", hair: "#1a1410", capStyle: "hair" } as Partial<KitColors>,
];
const Hand: React.FC<{ p: V2; r?: number }> = ({ p, r = 11 }) => <circle cx={p[0]} cy={p[1]} r={r} fill="#eebf98" stroke={INK} strokeWidth={3} />;
/** wide 1901 hat with flowers (figure-local) */
const BigHat: React.FC<{ color?: string }> = ({ color = "#2a2030" }) => (
  <g><ellipse cx={8} cy={-392} rx={92} ry={20} fill={color} stroke={INK} strokeWidth={4} /><path d="M -40 -394 Q -36 -446 10 -450 Q 56 -446 58 -394 Z" fill={color} stroke={INK} strokeWidth={4} />
    <circle cx={44} cy={-420} r={13} fill="#c8607a" stroke={INK} strokeWidth={3} /><circle cx={24} cy={-432} r={11} fill="#efe0a0" stroke={INK} strokeWidth={3} /></g>
);
const Derby: React.FC = () => <g><path d="M -36 -372 Q -36 -436 10 -438 Q 56 -436 56 -372 Z" fill="#3a2a1a" stroke={INK} strokeWidth={4} /><ellipse cx={10} cy={-372} rx={62} ry={10} fill="#3a2a1a" stroke={INK} strokeWidth={4} /></g>;
const Bandage: React.FC = () => <path d="M -30 -366 Q 10 -378 52 -366 L 52 -352 Q 10 -364 -30 -352 Z" fill="#fff" stroke={INK} strokeWidth={3} />;

// ---------- props ----------
/** oak barrel with iron hoops, standing; origin = centre; height 300·s; lid = 0 closed … 1 off */
export const Barrel: React.FC<{ x: number; y: number; s?: number; rot?: number; lid?: number }> = ({ x, y, s = 1, rot = 0, lid = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -100 -150 Q -125 0 -100 150 L 100 150 Q 125 0 100 -150 Z" fill="#9a6a3a" stroke={INK} strokeWidth={6} />
    {[-60, -20, 20, 60].map((sx) => <path key={sx} d={`M ${sx} -150 Q ${sx * 1.22} 0 ${sx} 150`} stroke="#7a5228" strokeWidth={5} fill="none" />)}
    {[-110, -40, 40, 110].map((hy) => <path key={hy} d={`M ${-104 - (1 - Math.abs(hy) / 150) * 18} ${hy} L ${104 + (1 - Math.abs(hy) / 150) * 18} ${hy}`} stroke="#3a3a3a" strokeWidth={14} />)}
    <g transform={`translate(${lid * 140} ${-150 - lid * 60}) rotate(${lid * 40})`}><ellipse cx={0} cy={0} rx={100} ry={18} fill="#b07a44" stroke={INK} strokeWidth={5} /></g>
  </g>
);
const Cat: React.FC<{ x: number; y: number; s?: number; flip?: boolean; shake?: number }> = ({ x, y, s = 1, flip, shake = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s}) rotate(${shake})`}>
    <ellipse cx={0} cy={-40} rx={60} ry={34} fill="#d89a4a" stroke={INK} strokeWidth={4} />
    <circle cx={58} cy={-78} r={30} fill="#d89a4a" stroke={INK} strokeWidth={4} />
    <path d="M 40 -100 L 44 -128 L 60 -106 Z M 66 -104 L 80 -128 L 84 -98 Z" fill="#d89a4a" stroke={INK} strokeWidth={4} />
    <circle cx={66} cy={-82} r={4} fill={INK} /><circle cx={80} cy={-80} r={4} fill={INK} />
    <path d="M -58 -50 Q -110 -80 -96 -130" stroke="#d89a4a" strokeWidth={14} fill="none" strokeLinecap="round" />
    {[-36, -14, 20, 40].map((lx) => <rect key={lx} x={lx} y={-14} width={12} height={16} fill="#d89a4a" stroke={INK} strokeWidth={3} />)}
  </g>
);
/** river surface from y down to the lip at lipY with flowing streaks */
const River: React.FC<{ y: number; frame: number; to?: number; c1?: string; c2?: string; speed?: number }> = ({ y, frame, to = 2000, c1 = "#5a9ab0", c2 = "#3a7890", speed = 6 }) => (
  <g>
    <rect x={-60} y={y} width={1200} height={to - y} fill={c1} />
    {Array.from({ length: 16 }, (_, i) => { const yy = y + 20 + rnd(i) * (to - y - 40); const x = ((rnd(i + 3) * 1300 + frame * speed * (1 + rnd(i + 7))) % 1400) - 160; return <path key={i} d={`M ${x} ${yy} l 110 0`} stroke={i % 2 ? "#e8f4f8" : c2} strokeWidth={5} strokeLinecap="round" opacity={0.6} />; })}
  </g>
);
/** the Horseshoe Falls seen from the side: top river to the right of edgeX at lipY, falling sheet down to the mist */
const Falls: React.FC<{ frame: number; edgeX: number; lipY: number; base: number }> = ({ frame, edgeX, lipY, base }) => (
  <g>
    <rect x={edgeX - 40} y={lipY} width={1300} height={60} fill="#5a9ab0" />
    {Array.from({ length: 12 }, (_, i) => { const x = ((rnd(i) * 900 + frame * 9) % 1000) + edgeX; return <path key={i} d={`M ${x} ${lipY + 20} l 90 0`} stroke="#e8f4f8" strokeWidth={5} opacity={0.6} />; })}
    <path d={`M ${edgeX - 40} ${lipY} Q ${edgeX - 140} ${lipY + 80} ${edgeX - 170} ${base} L ${edgeX - 10} ${base} Q ${edgeX - 20} ${lipY + 100} ${edgeX} ${lipY + 60} Z`} fill="#cfe8f0" stroke={INK} strokeWidth={4} />
    {Array.from({ length: 10 }, (_, i) => { const yy = lipY + (((frame * 22 + i * 97) % (base - lipY))); return <path key={i} d={`M ${edgeX - 60 - (yy - lipY) * 0.12 - (i % 3) * 25} ${yy} l -6 60`} stroke="#ffffff" strokeWidth={6} opacity={0.8} />; })}
    <rect x={edgeX - 10} y={lipY + 60} width={1300} height={base - lipY} fill="#6a6a5a" stroke={INK} strokeWidth={5} />
    {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={edgeX - 320 + i * 70 + Math.sin(frame * 0.05 + i) * 20} cy={base + Math.sin(frame * 0.07 + i * 2) * 15} r={90 + (i % 3) * 30} fill="#f4fafc" opacity={0.75} />)}
  </g>
);
const Rowboat: React.FC<{ x: number; y: number; s?: number; children?: React.ReactNode }> = ({ x, y, s = 1, children }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {children}
    <path d="M -220 -60 L 220 -60 Q 250 -60 230 -20 Q 190 30 120 34 L -140 34 Q -220 24 -240 -20 Q -248 -60 -220 -60 Z" fill="#7a5a3a" stroke={INK} strokeWidth={5} />
    <rect x={-226} y={-68} width={452} height={14} rx={6} fill="#5a4028" stroke={INK} strokeWidth={4} />
  </g>
);
const Room: React.FC<{ wall?: string }> = ({ wall = "#c8b48a" }) => (
  <g><rect x={-60} y={0} width={1200} height={GY + 60} fill={wall} />{Array.from({ length: 12 }, (_, i) => <rect key={i} x={-60 + i * 100} y={0} width={4} height={GY + 60} fill="#b09c72" />)}<rect x={-60} y={GY + 60} width={1200} height={900} fill="#6a4a2a" /></g>
);

// ---------- 1 + LOOP: Annie lowers herself into the barrel on the river; the camera follows the barrel over the falls; it surfaces in the mist ----------
export const SceneHook: React.FC<SP & { u0?: number }> = ({ lt, frame, u0 = 0 }) => {
  const u = lt + u0;
  // beat A (u < 2.7): on the rowboat, Annie (hat, dark dress) steps down into the open barrel, hands on the rim
  // beat B (2.7–5.6): wide of the Horseshoe Falls: the barrel tips over the lip, drops, and bobs up in the mist on "she lived"
  if (u < 2.75) {
    const sink = interpolate(u, [-3.0, 2.6], [0, 1], cl);
    const push = 1.04 + Math.max(0, u + 3) * 0.012;
    const bx = 600, by = 1150;
    const ay = by - 60 + sink * 190;
    const hA = -60 - sink * 30;
    const hN = handAt(bx - 20, ay, 1.0, 1, hA, 0);
    return (
      <g transform={`translate(540 1000) scale(${push}) translate(-540 -1000)`}>
        <Sky top="#9cc0da" bottom="#e8eef0" clouds={2} drift={u + 5} />
        {/* the falls' mist rising far behind */}
        {Array.from({ length: 7 }, (_, i) => <circle key={i} cx={680 + i * 90} cy={760 + Math.sin(frame * 0.05 + i) * 20} r={110} fill="#f4fafc" opacity={0.7} />)}
        <rect x={-60} y={800} width={1200} height={60} fill="#5a7a4a" />
        <River y={860} frame={frame} />
        <Rowboat x={360} y={1200} s={1.0}>
          <Figure x={-130} y={30} s={0.9} facing={1} A1={-70} A2={-60} colors={HELPER} frame={frame} expression="scared" />
        </Rowboat>
        <Figure x={bx - 20} y={ay} s={1.0} facing={1} A1={hA} A2={hA + 6} colors={ANNIE} frame={frame + 3} expression="determined"><BigHat /></Figure>
        <Barrel x={bx} y={by} s={0.95} lid={1} />
        <Hand p={hN} />
        <rect x={-60} y={1240} width={1200} height={900} fill="#3a7890" opacity={0.85} />
      </g>
    );
  }
  const b = u - 2.75;
  const lipY = 760, edgeX = 560, base = 1500;
  const bx = b < 0.25 ? edgeX + 60 - b * 120 : edgeX + 30 - (b - 0.25) * 90;
  const fall = Math.max(0, b - 0.25);
  const by = b < 0.25 ? lipY - 40 : Math.min(base - 60, lipY - 40 + 900 * fall * fall);
  const bob = b > 1.9 ? interpolate(b, [1.9, 2.5], [base + 120, base - 80], { ...cl, easing: Easing.out(Easing.back(2)) }) : by;
  const vis = b < 1.15 || b > 1.9;
  const pan = interpolate(b, [0.2, 1.2], [0, -420], { ...cl, easing: ease });
  return (
    <g transform={`translate(0 ${pan})`}>
      <Sky top="#9cc0da" bottom="#e8eef0" clouds={2} drift={u + 5} />
      <rect x={-60} y={lipY - 200} width={1200} height={200} fill="#5a7a4a" />
      <Falls frame={frame} edgeX={edgeX} lipY={lipY} base={base} />
      {vis && <Barrel x={b > 1.9 ? edgeX - 140 : bx} y={b > 1.9 ? bob : by} s={0.42} rot={b > 1.9 ? Math.sin(frame * 0.2) * 8 : b < 0.25 ? -10 : -10 - fall * 260} />}
      <rect x={-60} y={base + 120} width={1200} height={900} fill="#4a8aa0" />
      {b > 1.9 && Array.from({ length: 5 }, (_, i) => <circle key={i} cx={bx - 120 + i * 60} cy={base + 100} r={40} fill="#f4fafc" opacity={0.8} />)}
    </g>
  );
};

// ---------- 3: Bay City, 1901: Annie turns out an empty purse; labels WIDOW · OUT OF MONEY, CLAIMED 40s ----------
export const SceneBroke: React.FC<SP> = ({ lt, frame }) => {
  const s = 1.25, ax = 420;
  const tip = interpolate(lt, [1.2, 1.7], [-40, -150], cl);
  const hN = handAt(ax, GY + 40, s, 1, tip, 0);
  return (
    <g>
      <Room />
      {/* mirror on the wall */}
      <ellipse cx={780} cy={700} rx={130} ry={180} fill="#d8e4ea" stroke="#8a6a3a" strokeWidth={18} />
      <rect x={640} y={980} width={300} height={260} fill="#7a5a34" stroke={INK} strokeWidth={5} />
      <Figure x={ax} y={GY + 40} s={s} facing={1} A1={tip} A2={-20} colors={ANNIE} frame={frame} expression="sad"><BigHat /></Figure>
      <Skirt x={ax} y={GY + 40} s={s} color="#2a2a3a" shade="#1e1e2a" />
      {/* purse upside down: nothing falls out but a moth */}
      <g transform={`translate(${hN[0]} ${hN[1]}) rotate(${tip < -120 ? 180 : 0})`}><path d="M -34 0 Q -40 60 0 64 Q 40 60 34 0 Z" fill="#5a2a3a" stroke={INK} strokeWidth={4} /><path d="M -20 0 Q 0 -30 20 0" stroke="#c9a54a" strokeWidth={5} fill="none" /></g>
      {lt > 1.8 && <g transform={`translate(${hN[0] + Math.sin(lt * 9) * 20} ${hN[1] + 60 + (lt - 1.8) * 40})`}><path d="M 0 0 q -16 -14 -26 2 q 12 8 26 -2 q 16 -14 26 2 q -12 8 -26 -2" fill="#c8b890" stroke={INK} strokeWidth={2} /></g>}
      <Hand p={hN} />
      <Label x={540} y={520} lt={lt} at={0.2} text="ANNIE EDSON TAYLOR" size={44} />
      <Label x={540} y={620} lt={lt} at={1.4} text="WIDOW · OUT OF MONEY" size={34} bg="#7a1f1f" />
      <Label x={780} y={760} lt={lt} at={2.9} text="CLAIMED: 40s" size={36} bg="#f2e3b5" fg="#1b140d" stroke="#1b140d" />
      <Label x={780} y={850} lt={lt} at={3.6} text="REALLY: 60s" size={36} bg="#1f3a5a" />
    </g>
  );
};

// ---------- 4: the plan: at her desk she draws a barrel going over the falls ----------
export const ScenePlan: React.FC<SP> = ({ lt, frame }) => {
  const k = interpolate(lt, [0.6, 3.6], [0, 1], cl);
  const nib: V2 = [430 + (k * 6 % 1) * 260, 640 + Math.floor(k * 6) * 40];
  return (
    <g>
      <Room wall="#b8a47a" />
      {/* paper on the desk, top view insert */}
      <rect x={250} y={420} width={580} height={760} fill="#f2ead2" stroke={INK} strokeWidth={6} transform="rotate(-3 540 800)" />
      <g transform="rotate(-3 540 800)">
        {/* drawn falls + barrel, appearing with k */}
        <path d={`M 300 700 L ${300 + Math.min(1, k * 2) * 300} 700`} stroke="#3a5a8a" strokeWidth={8} />
        {k > 0.4 && <path d={`M 600 700 Q 640 ${700 + (k - 0.4) * 300} 640 ${700 + Math.min(1, (k - 0.4) * 2) * 300}`} stroke="#3a5a8a" strokeWidth={8} fill="none" />}
        {k > 0.6 && <g opacity={Math.min(1, (k - 0.6) * 4)}><rect x={540} y={600} width={60} height={80} rx={14} fill="none" stroke="#3a2a6a" strokeWidth={6} /><path d="M 560 620 l 20 0 M 560 640 l 20 0 M 560 660 l 20 0" stroke="#3a2a6a" strokeWidth={4} /></g>}
        {k > 0.8 && <text x={540} y={1080} textAnchor="middle" fontFamily="Georgia" fontStyle="italic" fontWeight={700} fontSize={64} fill="#3a2a6a" opacity={Math.min(1, (k - 0.8) * 5)}>$ $ $</text>}
      </g>
      <g transform={`translate(${nib[0]} ${nib[1]}) rotate(-30)`}><rect x={-8} y={-240} width={16} height={230} fill="#2a2a2a" stroke={INK} strokeWidth={3} /><path d="M -8 -10 L 8 -10 L 0 10 Z" fill="#c9a54a" stroke={INK} strokeWidth={2} /><circle cx={0} cy={-210} r={42} fill="#eebf98" stroke={INK} strokeWidth={4} /><path d="M -30 -240 L -60 -420 L 60 -420 L 34 -240 Z" fill="#2a2a3a" stroke={INK} strokeWidth={4} /></g>
      <Label x={540} y={300} lt={lt} at={1.6} text="FIRST TO SURVIVE IT" size={44} bg="#7a1f1f" />
      <Label x={540} y={1300} lt={lt} at={0.1} text="THE PLAN" size={40} />
      <_Unused frame={frame} />
    </g>
  );
};
const _Unused: React.FC<{ frame: number }> = () => null;

// ---------- 5: the cooper fits the last hoop; a helper stuffs cushions inside while Annie points ----------
export const HIT_TIMES = [0.25, 0.65, 1.05];
export const SceneCooper: React.FC<SP> = ({ lt, frame }) => {
  const swing = HIT_TIMES.reduce((a, t0) => a + (lt > t0 - 0.2 && lt < t0 ? Math.sin(((lt - t0 + 0.2) / 0.2) * Math.PI * 0.5) : 0), 0);
  const cA = -150 + swing * 70;
  const cx = 300, s = 1.15;
  const hammer = handAt(cx, GY + 40, s, 1, cA, 0);
  const stuff = lt > 1.9;
  const push = interpolate(lt, [1.9, 2.6], [0, 1], cl);
  return (
    <g>
      <Room wall="#a88a5a" />
      {Array.from({ length: 4 }, (_, i) => <rect key={i} x={760 + (i % 2) * 120} y={GY - 120 - Math.floor(i / 2) * 200} width={110} height={180} rx={30} fill="#8a5a2a" stroke={INK} strokeWidth={4} opacity={0.6} />)}
      <Barrel x={520} y={GY - 110} s={0.9} lid={1} />
      <Figure x={cx} y={GY + 40} s={s} facing={1} A1={cA} A2={-50} colors={COOPER} frame={frame} expression="determined" />
      <g transform={`translate(${hammer[0]} ${hammer[1]}) rotate(${cA + 180})`}><rect x={-6} y={0} width={12} height={90} fill="#6a4a2a" stroke={INK} strokeWidth={3} /><rect x={-26} y={80} width={52} height={30} fill="#5a5a5a" stroke={INK} strokeWidth={3} /></g>
      <Hand p={hammer} />
      {stuff && <g transform={`translate(${520} ${GY - 330 + push * 120})`} opacity={1 - push * 0.6}><rect x={-80} y={-40} width={160} height={70} rx={30} fill="#e8d8b0" stroke={INK} strokeWidth={4} /><path d="M -60 -10 l 120 0" stroke="#c8b48a" strokeWidth={4} /></g>}
      <Figure x={800} y={GY + 40} s={1.15} facing={-1} A1={lt > 0.8 ? -100 : -20} A2={-10} colors={ANNIE} frame={frame + 5} expression="determined"><BigHat /></Figure>
      <Skirt x={800} y={GY + 40} s={1.15} color="#2a2a3a" shade="#1e1e2a" />
      <Label x={540} y={520} lt={lt} at={0.4} text="WOODEN BARREL" size={44} />
      <Label x={540} y={620} lt={lt} at={2.0} text="PADDED INSIDE" size={36} bg="#f2e3b5" fg="#1b140d" stroke="#1b140d" />
    </g>
  );
};

// ---------- 6: the test two days before: a cat goes into the barrel; later it climbs out alive and shakes itself ----------
export const OUT_AT = 3.0;
export const SceneCat: React.FC<SP> = ({ lt, frame }) => {
  const before = lt < OUT_AT;
  const catIn = interpolate(lt, [0.3, 1.1], [0, 1], cl);
  const lid = before ? interpolate(lt, [1.3, 1.8], [1, 0], cl) : interpolate(lt, [OUT_AT, OUT_AT + 0.3], [0, 1], cl);
  const jump = Math.max(0, lt - OUT_AT - 0.3);
  const catY = before ? GY - 260 + catIn * 150 : GY - 110 - (jump < 0.4 ? Math.sin((jump / 0.4) * Math.PI) * 200 : 0) + (jump > 0.4 ? 110 : 0) - (jump > 0.4 ? 0 : 0);
  const catX = before ? 520 : 520 + Math.min(1, jump / 0.4) * 220;
  const shake = jump > 0.5 ? Math.sin(lt * 40) * 10 * Math.max(0, 1 - (jump - 0.5)) : 0;
  return (
    <g>
      <Sky top="#9cc0da" bottom="#e8eef0" clouds={2} drift={lt + 2} />
      <rect x={-60} y={GY - 200} width={1200} height={1200} fill="#7a8a5a" />
      <rect x={-60} y={GY + 60} width={1200} height={900} fill="#5a6a4a" />
      {before && catIn < 1 && <Cat x={catX} y={catY} s={0.9} />}
      <Barrel x={520} y={GY - 110} s={0.9} lid={lid} rot={before ? 0 : -4} />
      {!before && jump > 0 && <Cat x={catX} y={catY + (jump > 0.4 ? 110 : 0)} s={0.9} shake={shake} />}
      <Figure x={260} y={GY + 40} s={1.1} facing={1} A1={before ? -60 : -20} A2={before ? -55 : -10} colors={HELPER2} frame={frame} expression={before ? "neutral" : "happy"} />
      <Figure x={900} y={GY + 40} s={1.1} facing={-1} A1={!before && jump > 0.6 ? -150 : -20} A2={-10} colors={ANNIE} frame={frame + 5} expression={before ? "neutral" : "happy"}><BigHat /></Figure>
      <Skirt x={900} y={GY + 40} s={1.1} color="#2a2a3a" shade="#1e1e2a" />
      <Label x={540} y={520} lt={lt} at={0.3} text="TEST RUN: A CAT" size={42} />
      {!before && <Label x={540} y={620} lt={lt} at={OUT_AT + 0.6} text="ALIVE" size={52} bg="#2e7a3e" />}
    </g>
  );
};

// ---------- 7: October 24, 1901: helpers hammer the lid shut on the rowboat, then let the barrel go ----------
export const SEAL_AT = 1.8;
export const ADRIFT_AT = 3.15;
export const SceneAdrift: React.FC<SP> = ({ lt, frame }) => {
  const hammerA = lt > 1.4 && lt < 2.4 ? -150 + Math.max(0, Math.sin((lt - 1.4) * 14)) * 60 : -60;
  const drift = Math.max(0, lt - ADRIFT_AT);
  const bx = 640 + drift * 180, by = 1170 + Math.sin(frame * 0.12) * 6;
  const h1 = handAt(380, 1200, 1.0, 1, hammerA, 0);
  return (
    <g>
      <Sky top="#9cc0da" bottom="#e8eef0" clouds={3} drift={lt} />
      <rect x={-60} y={780} width={1200} height={80} fill="#5a7a4a" />
      {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={80 + i * 180} cy={770} r={70} fill="#3e6a3a" stroke={INK} strokeWidth={4} />)}
      <River y={860} frame={frame} speed={8} />
      <Rowboat x={260} y={1240} s={1.0}>
        <Figure x={-110} y={30} s={0.95} facing={1} A1={-70} A2={-60} colors={HELPER2} frame={frame} expression="determined" />
        <Figure x={120} y={30} s={0.95} facing={1} A1={hammerA} A2={-40} colors={HELPER} frame={frame + 4} expression="determined" />
      </Rowboat>
      {lt > 1.4 && lt < 2.4 && <g transform={`translate(${h1[0]} ${h1[1]}) rotate(${hammerA + 180})`}><rect x={-6} y={0} width={12} height={80} fill="#6a4a2a" stroke={INK} strokeWidth={3} /><rect x={-22} y={70} width={44} height={26} fill="#5a5a5a" stroke={INK} strokeWidth={3} /></g>}
      {/* rope from the boat to the barrel until it is let go */}
      {drift === 0 && <path d={`M 470 1180 Q 560 1230 ${bx - 70} ${by - 20}`} stroke="#c8b07a" strokeWidth={6} fill="none" />}
      <Barrel x={bx} y={by} s={0.62} lid={lt < SEAL_AT ? 0.0 : 0} rot={Math.sin(frame * 0.1) * 4 + drift * 6} />
      <rect x={-60} y={1250} width={1200} height={900} fill="#3a7890" opacity={0.85} />
      <Label x={540} y={520} lt={lt} at={0.1} text="OCTOBER 24, 1901" size={44} />
      {drift > 0 && <Label x={760} y={680} lt={lt} at={ADRIFT_AT + 0.2} text="ADRIFT" size={38} bg="#1f3a5a" />}
    </g>
  );
};

// ---------- 8: over the edge (tilt down with the fall) ----------
export const SceneEdge: React.FC<SP> = ({ lt, frame }) => {
  const lipY = 700, edgeX = 640, base = 1700;
  const fall = Math.max(0, lt - 0.45);
  const bx = lt < 0.45 ? edgeX + 220 - lt * 400 : edgeX + 40 - fall * 80;
  const by = lt < 0.45 ? lipY - 50 : Math.min(base, lipY - 50 + 1100 * fall * fall);
  const tilt = interpolate(lt, [0.5, 1.6], [0, -560], { ...cl, easing: ease });
  return (
    <g transform={`translate(0 ${tilt})`}>
      <Sky top="#9cc0da" bottom="#e8eef0" clouds={2} drift={lt} />
      <rect x={-60} y={lipY - 160} width={1200} height={160} fill="#5a7a4a" />
      <Falls frame={frame} edgeX={edgeX} lipY={lipY} base={base} />
      {by < base - 40 && <Barrel x={bx} y={by} s={0.6} rot={lt < 0.45 ? -8 : -8 - fall * 300} />}
      <rect x={-60} y={base + 120} width={1200} height={900} fill="#4a8aa0" />
      <Label x={540} y={560} lt={lt} at={0.1} text="HORSESHOE FALLS" size={42} />
    </g>
  );
};

// ---------- 9: about 20 minutes later: rescuers on the rocks hook the barrel and pry the lid ----------
export const SceneRescue: React.FC<SP> = ({ lt, frame }) => {
  const pull = interpolate(lt, [0.4, 1.6], [0, 1], { ...cl, easing: ease });
  const bx = 820 - pull * 300, by = 1230 - pull * 40;
  const lid = interpolate(lt, [2.0, 2.5], [0, 1], cl);
  const poleA = -70 + pull * 25;
  const rx = 300, s = 1.05;
  const ph = handAt(rx, GY + 30, s, 1, poleA, 0);
  const tipP: V2 = [bx - 60, by - 60];
  return (
    <g>
      <Sky top="#b8d0e0" bottom="#eef4f6" />
      {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={i * 150} cy={700 + Math.sin(frame * 0.05 + i) * 20} r={150} fill="#f4fafc" opacity={0.8} />)}
      <River y={900} frame={frame} speed={4} c1="#6aa4b8" />
      <path d={`M -60 ${GY + 40} L 460 ${GY + 30} L 520 ${GY + 160} L -60 ${GY + 200} Z`} fill="#6a6a5a" stroke={INK} strokeWidth={5} />
      <Barrel x={bx} y={by} s={0.62} rot={-80 + pull * 70} lid={lid} />
      <Figure x={rx} y={GY + 30} s={s} facing={1} A1={poleA} A2={poleA + 6} colors={HELPER} frame={frame} expression="determined" />
      <line x1={ph[0] - 40} y1={ph[1] + 20} x2={tipP[0]} y2={tipP[1]} stroke="#8a6a44" strokeWidth={10} strokeLinecap="round" />
      <Hand p={ph} />
      <Figure x={130} y={GY + 40} s={1.0} facing={1} A1={-60} A2={-20} colors={HELPER2} frame={frame + 6} expression="scared" />
      {/* 20-minute clock */}
      <g transform="translate(860 520)"><circle r={80} fill="#f2ead2" stroke={INK} strokeWidth={6} /><line x1={0} y1={0} x2={0} y2={-60} stroke={INK} strokeWidth={6} transform={`rotate(${interpolate(lt, [0, 1.6], [0, 120], cl)})`} /><line x1={0} y1={0} x2={40} y2={0} stroke={INK} strokeWidth={8} /></g>
      <Label x={860} y={660} lt={lt} at={0.3} text="~20 MINUTES" size={34} />
    </g>
  );
};

// ---------- 10: she climbs out, a rescuer takes her hand; cut on her head; the crowd cheers ----------
export const SceneAlive: React.FC<SP> = ({ lt, frame }) => {
  const rise = interpolate(lt, [0, 0.8], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  const ax = 520, ay = GY + 40 - (1 - rise) * 0;
  const meet = handAt(ax, ay, 1.15, 1, -70, 0);
  return (
    <g>
      <Sky top="#b8d0e0" bottom="#eef4f6" />
      <rect x={-60} y={GY - 160} width={1200} height={1000} fill="#6a6a5a" />
      {CROWD.map((c, i) => <Figure key={i} x={80 + i * 90 + (i > 1 ? 700 : 0) - (i > 1 ? 180 : 0)} y={GY - 140} s={0.75} facing={i > 1 ? -1 : 1} A1={lt > 1.0 ? -160 + Math.sin(frame * 0.4 + i) * 10 : -20} A2={-10} colors={c} frame={frame + i * 4} expression="happy" />)}
      <Barrel x={ax - 40} y={GY - 30} s={0.62} lid={1} rot={-6} />
      <Figure x={ax} y={GY + 40 - (1 - rise) * 170} s={1.15} facing={1} A1={-70} A2={-20} colors={ANNIE} frame={frame} expression="sad"><BigHat /><Bandage /></Figure>
      <Figure x={meet[0] + 150} y={GY + 40} s={1.15} facing={-1} A1={-70} A2={-20} colors={HELPER} frame={frame + 3} expression="happy" />
      <Hand p={meet} r={13} />
      <Label x={540} y={520} lt={lt} at={0.2} text="ALIVE" size={56} bg="#2e7a3e" />
      <Label x={540} y={640} lt={lt} at={1.0} text="A CUT ON HER HEAD" size={34} />
    </g>
  );
};

// ---------- 11: her warning to the reporters: a raised finger, notebooks scribbling ----------
export const SceneWarning: React.FC<SP> = ({ lt, frame }) => {
  const wag = lt > 0.9 ? -160 + Math.sin(lt * 10) * 10 : -40;
  return (
    <g>
      <Room wall="#c8bca0" />
      <Figure x={360} y={GY + 40} s={1.25} facing={1} A1={wag} A2={-20} colors={ANNIE} frame={frame} expression="determined"><BigHat /><Bandage /></Figure>
      <Skirt x={360} y={GY + 40} s={1.25} color="#2a2a3a" shade="#1e1e2a" />
      {[0, 1].map((i) => { const x = 720 + i * 190, A = -55 + Math.sin(frame * 0.6 + i) * 6; const h = handAt(x, GY + 40, 1.05, -1, A, 0); return <g key={i}>
        <Figure x={x} y={GY + 40} s={1.05} facing={-1} A1={A} A2={-60} colors={CROWD[i]} frame={frame + i * 5} expression="neutral"><Derby /></Figure>
        <rect x={h[0] - 34} y={h[1] - 50} width={44} height={60} fill="#f2ead2" stroke={INK} strokeWidth={3} /></g>; })}
      <Label x={540} y={520} lt={lt} at={0.3} text="HER WARNING" size={44} />
      <Label x={540} y={630} lt={lt} at={1.2} text="NEVER TRY THIS" size={46} bg="#7a1f1f" />
    </g>
  );
};

// ---------- 12: at a fair she shows her barrel; her manager wheels it away behind her back; she turns and reaches ----------
export const STEAL_AT = 2.2;
export const SceneStolen: React.FC<SP> = ({ lt, frame }) => {
  const away = Math.max(0, lt - STEAL_AT) * WALK * 1.1;
  const turn = lt > STEAL_AT + 0.5;
  const mx = 640 + away;
  const cartX = mx + 150;
  return (
    <g>
      <Sky top="#9cc0da" bottom="#efe2c4" clouds={2} drift={lt} />
      {/* fair tent */}
      <path d="M 40 1000 L 300 640 L 560 1000 Z" fill="#c23b2c" stroke={INK} strokeWidth={5} /><path d="M 160 1000 L 300 640 L 440 1000 Z" fill="#f2ead2" stroke={INK} strokeWidth={4} />
      <rect x={-60} y={1000} width={1200} height={1000} fill="#b8a07a" />
      <Figure x={300} y={GY + 40} s={1.15} facing={turn ? 1 : -1} A1={turn ? -95 : -40} A2={-20} colors={ANNIE} frame={frame} expression={turn ? "scared" : "happy"}><BigHat /></Figure>
      <Skirt x={300} y={GY + 40} s={1.15} color="#2a2a3a" shade="#1e1e2a" />
      {/* cart with the barrel, handle in the manager's hands */}
      <g transform={`translate(${cartX} ${GY - 10})`}><rect x={-120} y={-30} width={240} height={30} fill="#6a4a2a" stroke={INK} strokeWidth={4} /><circle cx={-80} cy={10} r={34} fill="none" stroke="#3a2a1a" strokeWidth={10} /><circle cx={80} cy={10} r={34} fill="none" stroke="#3a2a1a" strokeWidth={10} /></g>
      <Barrel x={cartX} y={GY - 160} s={0.42} lid={0} />
      <Figure x={mx} y={GY + 40} s={1.1} facing={1} A1={-60} A2={-55} colors={MANAGER} frame={frame + 4} walking={away > 0} expression="happy"><Derby /></Figure>
      <Label x={300} y={560} lt={lt} at={0.2} text="NO FORTUNE" size={42} />
      {away > 0 && <Label x={760} y={700} lt={lt} at={STEAL_AT + 0.1} text="HER MANAGER" size={36} bg="#7a1f1f" />}
    </g>
  );
};

// ---------- 13: years later: an old Annie at a souvenir table, a few postcards, an empty cup ----------
export const ScenePoor: React.FC<SP> = ({ lt, frame }) => {
  const push = 1 + lt * 0.04;
  return (
    <g transform={`translate(540 1000) scale(${push}) translate(-540 -1000)`}>
      <Sky top="#c8b49a" bottom="#efe2c4" clouds={1} drift={lt} />
      <rect x={-60} y={1000} width={1200} height={1000} fill="#9a8a6a" />
      <Figure x={650} y={GY + 40} s={1.15} facing={-1} A1={-35} A2={-20} colors={ANNIE_OLD} frame={frame} expression="sad"><BigHat color="#3a3030" /></Figure>
      <rect x={260} y={GY - 210} width={320} height={22} fill="#6a4a2a" stroke={INK} strokeWidth={4} /><rect x={280} y={GY - 190} width={20} height={230} fill="#6a4a2a" /><rect x={540} y={GY - 190} width={20} height={230} fill="#6a4a2a" />
      {[0, 1, 2].map((i) => <rect key={i} x={300 + i * 70} y={GY - 250} width={56} height={40} fill="#f2ead2" stroke={INK} strokeWidth={3} transform={`rotate(${i * 5 - 5} ${328 + i * 70} ${GY - 230})`} />)}
      <path d="M 500 -10 L 540 -10 L 534 30 L 506 30 Z" transform={`translate(0 ${GY - 230})`} fill="#c9a54a" stroke={INK} strokeWidth={3} />
      <Label x={540} y={560} lt={lt} at={0.2} text="SHE DIED POOR" size={44} />
    </g>
  );
};
export const _unused = [rnd, WALK];
