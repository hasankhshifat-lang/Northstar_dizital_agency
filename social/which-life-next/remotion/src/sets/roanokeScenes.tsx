import React from "react";
import { interpolate, Easing } from "remotion";
import { Sky } from "./ponyScenes";
import { Label } from "./chickenScenes";
import { handAt } from "./madridScenes";
import { Figure } from "./pirateScenes";
import { Sea, Skirt } from "./violetScenes";
import { KitColors } from "../kit/Kit";

/**
 * Ground scenes for "The colony that vanished, leaving one word" (Roanoke, 1587–1590; CRO on a tree, CROATOAN on a post, no cross).
 * lt = seconds since the scene started. Kit side pose: feet at (0,0), shoulder pivot (0,-284), straight-arm hand = handAt().
 * Walk speed from the Kit stride: ≈ 240·s px per second. Scenes are drawn at GY and shifted −130 px by the story.
 * Storyboard: social/scripts/roanoke-2026-11-25.md.
 */
const INK = "#2b1d14";
const GY = 1240;
const WALK = 240;
const cl = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const ease = Easing.inOut(Easing.cubic);
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
type SP = { lt: number; dur: number; frame: number };
type V2 = [number, number];

// ---------- people (1580s, Elizabethan) ----------
const WHITE: Partial<KitColors> = { coat: "#4a3a5a", coatShade: "#382c46", coatLight: "#5a4a6c", patch: "#5a4a6c", scarf: "#f4f0e6", scarfShade: "#d8d2c4", trousers: "#3a2e2a", trousersShade: "#2a201c", hair: "#8a8680", capStyle: "hair", button: "#c9a54a" } as Partial<KitColors>;
const ELEANOR: Partial<KitColors> = { coat: "#7a2e2e", coatShade: "#5e2222", coatLight: "#8e3a3a", patch: "#8e3a3a", scarf: "#f4f0e6", scarfShade: "#d8d2c4", trousers: "#7a2e2e", trousersShade: "#5e2222", hair: "#8a4a20", capStyle: "hair", button: "#f4f0e6" } as Partial<KitColors>;
const COLONIST: Partial<KitColors> = { coat: "#6a5a3a", coatShade: "#54462c", coatLight: "#7c6a48", patch: "#7c6a48", scarf: "#efe8d6", scarfShade: "#cfc6b0", trousers: "#4a3e2a", trousersShade: "#3a301e", hair: "#3a2a1e", capStyle: "hair" } as Partial<KitColors>;
const COLONIST2: Partial<KitColors> = { ...COLONIST, coat: "#3a5a4a", coatShade: "#2c463a", coatLight: "#4a6c5a", patch: "#4a6c5a", hair: "#a06a30" } as Partial<KitColors>;
const WOMAN2: Partial<KitColors> = { coat: "#4a5a7a", coatShade: "#3a4862", coatLight: "#5a6c90", patch: "#5a6c90", scarf: "#f4f0e6", scarfShade: "#d8d2c4", trousers: "#4a5a7a", trousersShade: "#3a4862", hair: "#2a1a12", capStyle: "hair" } as Partial<KitColors>;
const SAILOR: Partial<KitColors> = { coat: "#8a6a4a", coatShade: "#6e5438", coatLight: "#9c7c5a", patch: "#9c7c5a", scarf: "#c23b2c", scarfShade: "#8f2a20", trousers: "#d8ccb0", trousersShade: "#b8ac90", hair: "#3a2a1e", cap: "#c23b2c", capShade: "#8f2a20", capBand: "#5a1e1e" };
const Hand: React.FC<{ p: V2; r?: number }> = ({ p, r = 11 }) => <circle cx={p[0]} cy={p[1]} r={r} fill="#eebf98" stroke={INK} strokeWidth={3} />;
/** tall felt capotain hat (side pose, figure-local coords) */
const Capotain: React.FC<{ color?: string }> = ({ color = "#2a2420" }) => (
  <g><path d="M -36 -380 L -26 -470 Q 12 -484 46 -470 L 54 -380 Z" fill={color} stroke={INK} strokeWidth={4} /><rect x={-28} y={-400} width={80} height={12} fill="#c9a54a" /><ellipse cx={10} cy={-378} rx={70} ry={12} fill={color} stroke={INK} strokeWidth={4} /></g>
);
/** linen coif for women (figure-local) */
const Coif: React.FC = () => <path d="M -48 -350 Q -52 -436 12 -440 Q 66 -434 62 -356 Q 40 -400 8 -398 Q -24 -394 -48 -350 Z" fill="#f4f0e6" stroke={INK} strokeWidth={4} />;
const Baby: React.FC<{ p: V2; s?: number }> = ({ p, s = 1 }) => (
  <g transform={`translate(${p[0]} ${p[1]}) rotate(-12) scale(${s})`}><ellipse rx={40} ry={24} fill="#f2ead8" stroke={INK} strokeWidth={4} /><circle cx={24} cy={-6} r={14} fill="#f4c8a4" stroke={INK} strokeWidth={3} /><path d="M 10 -16 Q 24 -30 40 -12" fill="#f2ead8" stroke={INK} strokeWidth={3} /></g>
);

// ---------- set pieces ----------
const Ground: React.FC<{ y?: number; color?: string }> = ({ y = GY, color = "#8a9a5a" }) => (
  <g><rect x={-60} y={y - 20} width={1200} height={1100} fill={color} />{Array.from({ length: 22 }, (_, i) => <path key={i} d={`M ${rnd(i) * 1100} ${y + rnd(i + 3) * 400} l 8 -22 l 6 20 l 8 -16 l 4 18`} stroke="#5a6a3a" strokeWidth={3} fill="none" />)}</g>
);
const Pine: React.FC<{ x: number; y: number; s?: number; sway?: number }> = ({ x, y, s = 1, sway = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${sway})`}>
    <rect x={-14} y={-380} width={28} height={380} fill="#6a4a2a" stroke={INK} strokeWidth={4} />
    {[0, 1, 2].map((i) => <path key={i} d={`M ${-130 + i * 25} ${-200 - i * 110} L 0 ${-380 - i * 110} L ${130 - i * 25} ${-200 - i * 110} Z`} fill={i % 2 ? "#3e6a3a" : "#335a30"} stroke={INK} strokeWidth={4} />)}
  </g>
);
/** log palisade wall from x0 to x1, posts ~38 px wide */
const Palisade: React.FC<{ x0: number; x1: number; y: number; h?: number; gapAt?: number }> = ({ x0, x1, y, h = 330, gapAt }) => (
  <g>{Array.from({ length: Math.ceil((x1 - x0) / 38) }, (_, i) => { const x = x0 + i * 38; if (gapAt !== undefined && Math.abs(x - gapAt) < 70) return null; const hh = h + (rnd(i) - 0.5) * 30; return <path key={i} d={`M ${x} ${y} L ${x} ${y - hh + 20} L ${x + 18} ${y - hh} L ${x + 36} ${y - hh + 20} L ${x + 36} ${y} Z`} fill={i % 2 ? "#8a6a44" : "#7a5c3a"} stroke={INK} strokeWidth={3} />; })}</g>
);
/** the gate post with letters carved; reveal 0..1 (moss brushed away from left to right) */
const Post: React.FC<{ x: number; y: number; s?: number; reveal?: number; word?: string }> = ({ x, y, s = 1, reveal = 1, word = "CROATOAN" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-70} y={-760} width={140} height={760} fill="#9a7a52" stroke={INK} strokeWidth={6} />
    {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M ${-60 + i * 20} -750 Q ${-50 + i * 20} -380 ${-64 + i * 20} -10`} stroke="#86683f" strokeWidth={4} fill="none" />)}
    {word.split("").map((ch, i) => <text key={i} x={0} y={-640 + i * 72} textAnchor="middle" fontFamily="Georgia" fontWeight={900} fontSize={70} fill="#3a2614" opacity={reveal * word.length > i ? 1 : 0}>{ch}</text>)}
    {word.split("").map((ch, i) => <rect key={`m${i}`} x={-52} y={-700 + i * 72} width={104} height={66} rx={20} fill="#5a7a3a" opacity={reveal * word.length > i + 0.6 ? 0 : 0.85} />)}
  </g>
);
/** Elizabethan ship side view, bow to the right; origin = waterline centre */
const Galleon: React.FC<{ x: number; y: number; s?: number; rot?: number; sails?: number; frame: number; flip?: boolean }> = ({ x, y, s = 1, rot = 0, sails = 1, frame, flip }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip ? -s : s} ${s})`}>
    <path d="M -300 -40 L -280 -170 L -200 -170 L -200 -120 L 160 -120 L 200 -150 L 290 -150 L 330 -60 L 260 40 L -250 40 Z" fill="#6a4a2a" stroke={INK} strokeWidth={6} />
    <path d="M -280 -100 L 300 -100" stroke="#c9a54a" strokeWidth={6} />
    {[-140, 40, 200].map((mx, i) => <g key={mx}>
      <rect x={mx - 7} y={-520 + i * 30} width={14} height={400 - i * 30} fill="#8a6a44" stroke={INK} strokeWidth={4} />
      {sails > 0 && <path d={`M ${mx - 90 * sails} ${-470 + i * 30} Q ${mx + Math.sin(frame * 0.05 + i) * 8} ${-420 + i * 30} ${mx + 90 * sails} ${-470 + i * 30} L ${mx + 80 * sails} ${-250 + i * 20} Q ${mx + 10} ${-220 + i * 20} ${mx - 80 * sails} ${-250 + i * 20} Z`} fill="#efe6cc" stroke={INK} strokeWidth={4} />}
      {sails > 0 && i === 1 && <path d={`M ${mx - 18} -420 l 36 0 l 0 80 l -36 0 Z M ${mx - 6} -440 l 12 0 l 0 120 l -12 0 Z`} fill="#c62828" opacity={0.85} />}
    </g>)}
    <path d="M 290 -150 L 420 -220" stroke="#8a6a44" strokeWidth={10} />
  </g>
);
/** rowing longboat, bow to the right; (x,y) = waterline centre */
const Longboat: React.FC<{ x: number; y: number; s?: number; children?: React.ReactNode }> = ({ x, y, s = 1, children }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {children}
    <path d="M -230 -70 L 240 -70 Q 270 -70 250 -30 Q 210 30 130 34 L -150 34 Q -230 24 -250 -30 Q -258 -70 -230 -70 Z" fill="#8a5a34" stroke={INK} strokeWidth={5} />
    <rect x={-236} y={-78} width={476} height={14} rx={6} fill="#6a4228" stroke={INK} strokeWidth={4} />
  </g>
);
const Rain: React.FC<{ frame: number; n?: number; k?: number }> = ({ frame, n = 60, k = 1 }) => <g opacity={0.5 * k}>{Array.from({ length: n }, (_, i) => { const x = (rnd(i) * 1300 + frame * 14) % 1300 - 110, y = (rnd(i + 7) * 2000 + frame * 46) % 2000 - 60; return <line key={i} x1={x} y1={y} x2={x - 18} y2={y + 60} stroke="#d8e4f0" strokeWidth={3} />; })}</g>;
const Leaves: React.FC<{ frame: number; n?: number }> = ({ frame, n = 10 }) => <g>{Array.from({ length: n }, (_, i) => { const x = (rnd(i) * 1300 + frame * (4 + rnd(i + 2) * 4)) % 1300 - 110, y = 500 + rnd(i + 5) * 900 + Math.sin(frame * 0.08 + i) * 40; return <ellipse key={i} cx={x} cy={y} rx={12} ry={6} fill={i % 2 ? "#a0782a" : "#7a8a3a"} transform={`rotate(${frame * 3 + i * 40} ${x} ${y})`} />; })}</g>;

// ---------- 1 + LOOP: John White at the gate post, tracing the carved word; the fort behind him is empty ----------
export const SceneHook: React.FC<SP & { u0?: number }> = ({ lt, frame, u0 = 0 }) => {
  const u = lt + u0;
  const push = 1.05 + Math.max(0, Math.min(6, u + 2.2)) * 0.014;
  const wx = 430, s = 1.15;
  // his near hand slides down the letters (fingertip on the wood), far hand on his hat brim at "vanished"
  const trace = ((u + 2.2) % 2.6) / 2.6;
  const post: V2 = [640, GY + 40];
  const nearA = -82 + trace * 22;
  const pN = handAt(wx, GY + 40, s, 1, nearA, 4);
  return (
    <g transform={`translate(540 1000) scale(${push}) translate(-540 -1000)`}>
      <Sky top="#a8c4cf" bottom="#e8e0c8" clouds={2} drift={u + 5} />
      <Pine x={60} y={GY - 120} s={1.2} sway={Math.sin(frame * 0.03) * 1.5} />
      <Pine x={980} y={GY - 140} s={1.1} sway={Math.sin(frame * 0.03 + 1) * 1.5} />
      <Palisade x0={-60} x1={1140} y={GY - 120} h={300} gapAt={640} />
      <Ground y={GY - 100} color="#8a9a5a" />
      <Post x={post[0]} y={post[1]} s={1.0} />
      <Figure x={wx} y={GY + 40} s={s} facing={1} A1={nearA} A2={-20} lean={4} colors={WHITE} frame={frame} expression="sad"><Capotain /></Figure>
      <Hand p={pN} />
      <Leaves frame={frame} n={8} />
    </g>
  );
};

// ---------- 3: 1587 arrival: a longboat rows settlers ashore from the anchored ships; White points at the island ----------
export const SceneArrival: React.FC<SP> = ({ lt, frame }) => {
  const hz = 900;
  const bx = interpolate(lt, [0, 2.8], [140, 520], cl);
  const stroke = Math.sin(frame * 0.18);
  const oarA = -60 + stroke * 18;
  const by = 1250;
  return (
    <g>
      <Sky top="#8fb8d8" bottom="#efe2c4" clouds={3} drift={lt} />
      <Galleon x={170} y={hz + 20} s={0.45} frame={frame} sails={0.4} />
      <Galleon x={420} y={hz + 30} s={0.32} frame={frame + 30} sails={0.4} />
      {/* island shore on the right */}
      <path d={`M 700 ${hz + 40} Q 820 ${hz - 40} 1140 ${hz - 60} L 1140 ${hz + 400} L 700 ${hz + 400} Z`} fill="#c8b07a" stroke={INK} strokeWidth={4} />
      <Pine x={900} y={hz - 20} s={0.55} /><Pine x={1010} y={hz - 40} s={0.65} /><Pine x={820} y={hz + 10} s={0.45} />
      <Sea y={hz} frame={frame} c1="#4a86a0" c2="#2a5a76" amp={5} rows={7} />
      <Longboat x={bx} y={by} s={1.0}>
        {[-150, -30].map((ox, i) => {
          const sx = ox, sy = 30;
          return <g key={ox}><Figure x={sx} y={sy} s={0.8} facing={-1} A1={oarA} A2={oarA + 4} lean={stroke * 6} colors={SAILOR} frame={frame + i * 3} expression="determined" />
            {(() => { const h = handAt(sx, sy, 0.8, -1, oarA, stroke * 6); return <line x1={h[0] + 20} y1={h[1]} x2={h[0] + 150} y2={110 - stroke * 20} stroke="#8a5a34" strokeWidth={9} strokeLinecap="round" />; })()}</g>;
        })}
        <Figure x={80} y={30} s={0.85} facing={1} A1={-30} A2={-20} colors={ELEANOR} frame={frame} expression="happy"><Coif /></Figure>
        <Figure x={190} y={30} s={0.9} facing={1} A1={lt > 0.8 ? -95 : -30} A2={-20} colors={WHITE} frame={frame + 4} expression="happy"><Capotain /></Figure>
      </Longboat>
      <rect x={-60} y={by + 30} width={1200} height={900} fill="#2a5a76" opacity={0.9} />
      <Label x={540} y={560} lt={lt} at={0.3} text="1587" size={46} />
      <Label x={540} y={660} lt={lt} at={1.0} text="GOVERNOR JOHN WHITE" size={38} bg="#f2e3b5" fg="#1b140d" stroke="#1b140d" />
    </g>
  );
};

// ---------- 4: Virginia Dare: Eleanor holds the baby; White leans in; settlers gather ----------
export const SceneDare: React.FC<SP> = ({ lt, frame }) => {
  const lean = interpolate(lt, [0.6, 1.4], [0, 10], cl);
  const s = 1.2;
  const ex = 470, wx = 720;
  const pE = handAt(ex, GY + 40, s, 1, -32, 0);
  return (
    <g>
      <Sky top="#a8c4cf" bottom="#efe2c4" clouds={2} drift={lt + 2} />
      {/* a timber cottage with thatch */}
      <rect x={120} y={GY - 520} width={520} height={420} fill="#c8a878" stroke={INK} strokeWidth={6} />
      {[200, 330, 460, 590].map((x) => <line key={x} x1={x} y1={GY - 520} x2={x} y2={GY - 100} stroke="#5a3a24" strokeWidth={14} />)}
      <path d={`M 80 ${GY - 500} L 380 ${GY - 760} L 680 ${GY - 500} Z`} fill="#c8a24a" stroke={INK} strokeWidth={6} />
      <Pine x={900} y={GY - 100} s={1.0} />
      <Ground y={GY - 80} />
      <Figure x={180} y={GY + 30} s={1.0} facing={1} A1={-10} A2={-8} colors={COLONIST} frame={frame + 7} expression="happy" />
      <Figure x={900} y={GY + 30} s={1.0} facing={-1} A1={lt > 2.2 ? -150 : -10} A2={-8} colors={COLONIST2} frame={frame + 3} expression="happy" />
      <Figure x={ex} y={GY + 40} s={s} facing={1} A1={-32} A2={-28} colors={ELEANOR} frame={frame} expression="happy"><Coif /></Figure>
      <Skirt x={ex} y={GY + 40} s={s} color="#7a2e2e" shade="#5e2222" />
      <Baby p={[pE[0] + 10, pE[1] - 24]} s={1.1} />
      <Hand p={pE} />
      <Figure x={wx} y={GY + 40} s={s} facing={-1} lean={lean} A1={-20 - lean * 3} A2={-10} colors={WHITE} frame={frame + 4} expression="happy"><Capotain /></Figure>
      <Label x={540} y={520} lt={lt} at={0.6} text="VIRGINIA DARE" size={48} />
      <Label x={540} y={620} lt={lt} at={1.1} text="AUGUST 18, 1587" size={34} bg="#f2e3b5" fg="#1b140d" stroke="#1b140d" />
      <Label x={540} y={1330} lt={lt} at={2.9} text="FIRST ENGLISH CHILD BORN IN THE AMERICAS" size={30} bg="#1f3a5a" />
    </g>
  );
};

// ---------- 5: White leaves for supplies: he waves from the longboat; Eleanor waves back on the beach ----------
export const SceneFarewell: React.FC<SP> = ({ lt, frame }) => {
  const hz = 900;
  const bx = 560 - lt * 120;
  const wave = Math.sin(frame * 0.3) * 18;
  const stroke = Math.sin(frame * 0.18);
  return (
    <g>
      <Sky top="#e8a86a" bottom="#f4dcb0" clouds={2} drift={lt} sun={{ x: 220, y: 700, r: 70, color: "#ffe2a0" }} />
      <Galleon x={160} y={hz + 20} s={0.38} frame={frame} sails={0.9} />
      <Sea y={hz} frame={frame} c1="#c88a6a" c2="#5a6a86" amp={4} rows={6} />
      <path d={`M 700 1120 Q 880 1090 1140 1100 L 1140 2000 L 640 2000 Z`} fill="#d8c08a" stroke={INK} strokeWidth={4} />
      <Longboat x={bx} y={1120} s={0.7}>
        <Figure x={-120} y={30} s={0.8} facing={-1} A1={-60 + stroke * 18} A2={-56 + stroke * 18} colors={SAILOR} frame={frame} expression="determined" />
        <Figure x={120} y={30} s={0.9} facing={1} A1={-150 + wave} A2={-20} colors={WHITE} frame={frame + 4} expression="sad"><Capotain /></Figure>
      </Longboat>
      <Figure x={900} y={1280} s={1.05} facing={-1} A1={-150 - wave} A2={-32} colors={ELEANOR} frame={frame} expression="sad"><Coif /></Figure>
      <Skirt x={900} y={1280} s={1.05} color="#7a2e2e" shade="#5e2222" />
      {(() => { const p = handAt(900, 1280, 1.05, -1, -32, 0); return <g><Baby p={[p[0] - 10, p[1] - 22]} s={0.9} /><Hand p={p} /></g>; })()}
      <Label x={540} y={560} lt={lt} at={0.3} text="BACK TO ENGLAND FOR SUPPLIES" size={34} />
    </g>
  );
};

// ---------- 7: 1590: the longboat grounds on the beach; White jumps out and calls toward the trees ----------
export const SceneLanding: React.FC<SP> = ({ lt, frame }) => {
  const hz = 820;
  const land = 0.9;
  const bx = interpolate(lt, [0, land], [-60, 240], { ...cl, easing: Easing.out(Easing.cubic) });
  const jump = Math.max(0, lt - land - 0.2);
  const wx = jump > 0 ? Math.min(760, 400 + jump * WALK * 1.0) : bx + 150;
  const wy = jump > 0 ? GY + 60 - (jump < 0.35 ? Math.sin((jump / 0.35) * Math.PI) * 60 : 0) : 1170;
  const call = lt > 2.4;
  return (
    <g>
      <Sky top="#9cc0da" bottom="#efe6cc" clouds={2} drift={lt + 4} />
      <Sea y={hz} frame={frame} c1="#4a86a0" c2="#2a5a76" amp={5} rows={5} />
      <path d={`M -60 1100 Q 400 1040 1140 980 L 1140 2000 L -60 2000 Z`} fill="#d8c08a" stroke={INK} strokeWidth={4} />
      <Pine x={860} y={1010} s={0.9} /><Pine x={1010} y={990} s={1.0} /><Pine x={730} y={1030} s={0.7} />
      <Longboat x={bx} y={1180} s={0.85}>
        <Figure x={-130} y={30} s={0.8} facing={1} A1={-30} A2={-20} colors={SAILOR} frame={frame} expression="neutral" />
        {jump === 0 && <Figure x={150} y={30} s={0.85} facing={1} A1={-40} A2={-20} colors={WHITE} frame={frame + 3} expression="determined"><Capotain /></Figure>}
      </Longboat>
      {jump > 0 && <Figure x={wx} y={wy} s={1.0} facing={1} A1={call ? -165 : undefined} A2={call ? -150 : undefined} colors={WHITE} frame={frame} walking={jump > 0.35 && wx < 760} expression={call ? "determined" : "determined"}><Capotain /></Figure>}
      {call && <g opacity={0.7}>{[0, 1, 2].map((i) => { const r = 40 + (((lt - 2.4) * 120 + i * 50) % 150); return <path key={i} d={`M ${wx + 80 + r * 0.3} ${GY - 330 - r * 0.5} q ${r * 0.4} ${r * 0.5} 0 ${r}`} stroke="#fff" strokeWidth={6} fill="none" />; })}</g>}
      <Label x={540} y={560} lt={lt} at={0.3} text="AUGUST 18, 1590" size={44} />
      <Label x={540} y={660} lt={lt} at={1.4} text="VIRGINIA'S 3RD BIRTHDAY" size={34} bg="#f2e3b5" fg="#1b140d" stroke="#1b140d" />
    </g>
  );
};

// ---------- 8: the clearing: no houses, only grass and the empty wall; White turns, looking ----------
export const SceneGone: React.FC<SP> = ({ lt, frame }) => {
  const facing: 1 | -1 = lt < 0.8 ? 1 : -1;
  return (
    <g>
      <Sky top="#a8c4cf" bottom="#e8e0c8" clouds={2} drift={lt + 8} />
      <Pine x={120} y={GY - 160} s={1.0} /><Pine x={950} y={GY - 170} s={1.1} />
      <Palisade x0={-60} x1={1140} y={GY - 140} h={260} />
      <Ground y={GY - 120} />
      {/* outlines where houses stood */}
      {[220, 600].map((x) => <rect key={x} x={x} y={GY - 60} width={260} height={60} fill="none" stroke="#5a6a3a" strokeWidth={6} strokeDasharray="20 14" />)}
      <Figure x={540} y={GY + 60} s={1.1} facing={facing} A1={-20} A2={-10} colors={WHITE} frame={frame} expression="scared"><Capotain /></Figure>
      <Leaves frame={frame} n={8} />
      <Label x={540} y={560} lt={lt} at={0.3} text="HOUSES GONE" size={46} bg="#7a1f1f" />
    </g>
  );
};

// ---------- 9: insert on a tree: C … R … O appear under White's fingertip as each is read ----------
export const LETTER_AT = [2.4, 3.1, 3.85];
export const SceneTree: React.FC<SP> = ({ lt }) => {
  const n = LETTER_AT.filter((t) => lt > t).length;
  const tipX = 360 + Math.min(2, Math.max(0, n - 1 + (lt - (LETTER_AT[Math.max(0, n - 1)] || 0)) * 0.6)) * 180;
  return (
    <g>
      <rect x={-60} y={0} width={1200} height={2300} fill="#6a5a3a" />
      <rect x={120} y={-20} width={840} height={2000} fill="#7a5a36" stroke={INK} strokeWidth={6} />
      {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M ${150 + i * 58} -20 Q ${170 + i * 58 + Math.sin(i) * 20} 900 ${150 + i * 58} 1980`} stroke="#5e4428" strokeWidth={8} fill="none" />)}
      {"CRO".split("").map((ch, i) => <g key={i} opacity={n > i ? 1 : 0}><text x={360 + i * 180} y={900} textAnchor="middle" fontFamily="Georgia" fontWeight={900} fontSize={220} fill="#e8d0a0" stroke="#3a2614" strokeWidth={8} paintOrder="stroke">{ch}</text></g>)}
      {n > 0 && <g transform={`translate(${tipX + 30} 800)`}><path d="M 0 0 Q 30 -30 70 -10 L 400 160 L 330 260 L 20 60 Q -10 30 0 0 Z" fill="#eebf98" stroke={INK} strokeWidth={6} /><path d="M 330 160 L 420 300 L 600 300 L 520 120 Z" fill="#4a3a5a" stroke={INK} strokeWidth={6} /></g>}
      <Label x={540} y={560} lt={lt} at={0.4} text="CARVED ON A TREE" size={42} />
    </g>
  );
};

// ---------- 10: low angle on the gate post: White brushes the moss away and the word appears ----------
export const SceneWord: React.FC<SP> = ({ lt, frame }) => {
  const reveal = interpolate(lt, [0.6, 2.5], [0, 1], cl);
  const hy = 280 + reveal * 640;
  const s = 1.55;
  return (
    <g>
      <Sky top="#8fb4cf" bottom="#e8e0c8" clouds={2} drift={lt + 3} />
      <Palisade x0={-60} x1={1140} y={1500} h={900} gapAt={540} />
      <Ground y={1520} />
      <Post x={540} y={1560} s={s} reveal={reveal} />
      {lt > 0.4 && lt < 2.9 && <g transform={`translate(${640} ${hy})`}><path d="M -40 0 Q -10 -40 40 -20 L 380 120 L 330 230 L -20 70 Q -60 40 -40 0 Z" fill="#eebf98" stroke={INK} strokeWidth={6} /><path d="M 330 120 L 440 260 L 640 230 L 520 70 Z" fill="#4a3a5a" stroke={INK} strokeWidth={6} /></g>}
      <Leaves frame={frame} n={6} />
      {reveal >= 1 && <Label x={540} y={1390} lt={lt} at={2.5} text="CROATOAN" size={52} bg="#3a2614" />}
    </g>
  );
};

// ---------- 11: flashback 1587 (sepia): White draws a cross in the sand to show the danger sign ----------
export const SceneSign: React.FC<SP> = ({ lt, frame }) => {
  const k = interpolate(lt, [2.6, 3.4], [0, 1], cl);
  const wx = 360, s = 1.15;
  const stickA = -40 - Math.sin(Math.min(1, k) * Math.PI * 2) * 10;
  const hN = handAt(wx, GY + 40, s, 1, stickA, 14);
  const tip: V2 = [hN[0] + 120, GY + 110];
  return (
    <g style={{ filter: "sepia(0.7)" }}>
      <Sky top="#d8c8a0" bottom="#efe2c4" clouds={1} drift={lt} />
      <Ground y={GY - 60} color="#c8b07a" />
      <Figure x={wx} y={GY + 40} s={s} facing={1} A1={stickA} A2={-15} lean={14} colors={WHITE} frame={frame} expression="determined"><Capotain /></Figure>
      <line x1={hN[0]} y1={hN[1]} x2={tip[0]} y2={tip[1]} stroke="#6a4a2a" strokeWidth={10} strokeLinecap="round" />
      <Hand p={hN} />
      <Figure x={800} y={GY + 40} s={1.1} facing={-1} A1={-20} A2={-10} colors={ELEANOR} frame={frame + 4} expression="neutral"><Coif /></Figure>
      <Skirt x={800} y={GY + 40} s={1.1} color="#7a2e2e" shade="#5e2222" />
      <Figure x={980} y={GY + 40} s={1.05} facing={-1} A1={-20} A2={-10} colors={COLONIST2} frame={frame + 9} expression="neutral" />
      {/* the cross in the sand (Maltese-style), drawn as the stick moves */}
      <g transform={`translate(${tip[0] + 30} ${GY + 150})`} opacity={k > 0 ? 1 : 0}>
        <path d={`M -80 0 L ${-80 + 160 * Math.min(1, k * 2)} 0`} stroke="#6a4a2a" strokeWidth={14} strokeLinecap="round" />
        {k > 0.5 && <path d={`M 0 -50 L 0 ${-50 + 100 * Math.min(1, (k - 0.5) * 2)}`} stroke="#6a4a2a" strokeWidth={14} strokeLinecap="round" />}
      </g>
      <Label x={540} y={560} lt={lt} at={0.3} text="1587: THE DANGER SIGN" size={40} />
    </g>
  );
};

// ---------- 12: back at the post: where a cross would be there is none ----------
export const SceneNoCross: React.FC<SP> = ({ lt }) => {
  const x = interpolate(lt, [0.3, 0.6], [0, 1], cl);
  return (
    <g>
      <Sky top="#8fb4cf" bottom="#e8e0c8" />
      <Palisade x0={-60} x1={1140} y={1500} h={900} gapAt={540} />
      <Ground y={1520} />
      <Post x={540} y={1560} s={1.55} />
      {/* empty space where a cross would be */}
      <g transform="translate(540 300)"><g stroke="#ffffff" strokeWidth={10} strokeDasharray="20 14" fill="none" opacity={0.8}><path d="M -70 0 L 70 0 M 0 -70 L 0 70" /></g>
        <g opacity={x}><line x1={-90} y1={-90} x2={90} y2={90} stroke="#c62828" strokeWidth={16} /><line x1={90} y1={-90} x2={-90} y2={90} stroke="#c62828" strokeWidth={16} /></g></g>
      <Label x={540} y={520} lt={lt} at={0.4} text="NO CROSS" size={56} bg="#7a1f1f" />
    </g>
  );
};

// ---------- 14: the weather turns: the ship pitches in the storm, then sets sail and leaves; White at the rail looks back ----------
export const SNAP_AT = 1.5;
export const SceneStorm: React.FC<SP> = ({ lt, frame }) => {
  const hz = 1000;
  const pitch = Math.sin(frame * 0.12) * 6;
  const drift = Math.max(0, lt - SNAP_AT) * 120;
  return (
    <g>
      <Sky top="#2a323e" bottom="#5a6470" clouds={4} drift={lt * 4} />
      {lt > 0.7 && lt < 0.82 && <rect x={-60} y={0} width={1200} height={2000} fill="#fff" opacity={0.35} />}
      <path d={`M 860 ${hz + 10} Q 960 ${hz - 50} 1140 ${hz - 60} L 1140 ${hz + 100} L 860 ${hz + 100} Z`} fill="#6a6a4a" stroke={INK} strokeWidth={4} />
      <Galleon x={420 - drift} y={hz + 40} s={0.95} rot={pitch} frame={frame} sails={lt > SNAP_AT + 0.4 ? 0.8 : 0} />
      {(() => { const g: V2 = [420 - drift - 60, hz - 160]; return <Figure x={g[0]} y={g[1]} s={0.6} facing={1} A1={-60} A2={-10} colors={WHITE} frame={frame} expression="sad"><Capotain /></Figure>; })()}
      <Sea y={hz} frame={frame * 1.6} c1="#3a4a5a" c2="#1a2430" crest="#c8d4e0" amp={16} rows={8} />
      <Rain frame={frame} n={80} />
      <Label x={540} y={560} lt={lt} at={0.3} text="A STORM" size={46} />
      {lt > SNAP_AT && <Label x={540} y={660} lt={lt} at={SNAP_AT} text="THEY HAD TO LEAVE" size={34} bg="#7a1f1f" />}
    </g>
  );
};

// ---------- 15: dusk over the empty fort; wind; slow push to the post ----------
export const SceneEmpty: React.FC<SP> = ({ lt, frame }) => {
  const push = 1 + lt * 0.05;
  return (
    <g transform={`translate(540 1000) scale(${push}) translate(-540 -1000)`}>
      <Sky top="#3a3050" bottom="#e89a6a" clouds={2} drift={lt * 2} />
      <Pine x={80} y={GY - 120} s={1.2} sway={Math.sin(frame * 0.04) * 2} />
      <Pine x={990} y={GY - 140} s={1.1} sway={Math.sin(frame * 0.04 + 1) * 2} />
      <Palisade x0={-60} x1={1140} y={GY - 120} h={300} gapAt={640} />
      <Ground y={GY - 100} color="#6a7a4a" />
      <Post x={640} y={GY + 40} s={1.0} />
      <Leaves frame={frame} n={14} />
      <Label x={540} y={560} lt={lt} at={0.4} text="STILL A MYSTERY" size={44} />
    </g>
  );
};
export const _unused = [ease, Hand, WOMAN2];
