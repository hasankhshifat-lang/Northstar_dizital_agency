import React from "react";
import { interpolate, Easing } from "remotion";
import { Sky } from "./ponyScenes";
import { Label } from "./chickenScenes";
import { handAt } from "./madridScenes";
import { Figure } from "./pirateScenes";
import { Horse } from "./horse";
import { KitColors } from "../kit/Kit";

/**
 * Ground scenes for "A Wave of Molasses Killed 21 People" (Great Molasses Flood, Boston North End, 15 January 1919).
 * lt = seconds since the scene started. Kit side pose: feet at (0,0), shoulder pivot (0,-284), straight-arm hand = handAt().
 * Run/walk speed from the Kit stride: ≈ 240·s px per second, so feet don't slide on the ground.
 * Scenes are drawn at GY and shifted −130 px by the story. Storyboard: social/scripts/molasses-flood-2026-11-24.md.
 */
const INK = "#2b1d14";
const GY = 1240;
const cl = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
type SP = { lt: number; dur: number; frame: number };
const RUN = 240; // px/s at s = 1
const MOL = "#4a2410", MOL2 = "#6e3a18", MOLHI = "#b8743a";

// ---------- people (1919) ----------
const DOCK: Partial<KitColors> = { coat: "#4a5a6a", coatShade: "#3a4652", coatLight: "#5a6a7a", patch: "#5a6a7a", scarf: "#c23b2c", scarfShade: "#8f2a20", trousers: "#3a3530", trousersShade: "#2a2622", cap: "#3b3733" };
const DOCK2: Partial<KitColors> = { coat: "#7a5a3a", coatShade: "#5e442c", coatLight: "#8a6a4a", patch: "#8a6a4a", scarf: "#efe8d6", scarfShade: "#cfc6b0", trousers: "#33333a", trousersShade: "#25252a", cap: "#4a3a2a", skin: "#c99a78", skinShade: "#a87a5a" };
const NEWSBOY: Partial<KitColors> = { coat: "#8a7a5a", coatShade: "#6e6046", coatLight: "#9a8a6a", patch: "#9a8a6a", scarf: "#2a4a7a", scarfShade: "#1d3456", trousers: "#4a4440", trousersShade: "#3a3430", cap: "#5a4a3a" };
const WOMAN: Partial<KitColors> = { coat: "#3a4a6a", coatShade: "#2c3852", coatLight: "#4a5a7a", patch: "#4a5a7a", scarf: "#efe2c4", scarfShade: "#cfc2a4", trousers: "#3a4a6a", trousersShade: "#2c3852", hair: "#5a3420", capStyle: "hair" } as Partial<KitColors>;
const SAILOR: Partial<KitColors> = { coat: "#1e2a4a", coatShade: "#141e36", coatLight: "#2a3a5a", patch: "#2a3a5a", scarf: "#efefe8", scarfShade: "#cfcfc8", trousers: "#1e2a4a", trousersShade: "#141e36", cap: "#efefe8", capShade: "#cfcfc8", capBand: "#1e2a4a", skin: "#8a5a3a", skinShade: "#6e4428" };
const SUITM: Partial<KitColors> = { coat: "#2c2e36", coatShade: "#1e2026", coatLight: "#3a3c44", patch: "#3a3c44", scarf: "#efefe8", scarfShade: "#cfcfc8", trousers: "#2c2e36", trousersShade: "#1e2026", hair: "#3a2a1a", capStyle: "hair", button: "#c9a54a" } as Partial<KitColors>;
const AUDITOR: Partial<KitColors> = { coat: "#1a1a1e", coatShade: "#101012", coatLight: "#26262a", patch: "#26262a", scarf: "#efefe8", scarfShade: "#cfcfc8", trousers: "#1a1a1e", trousersShade: "#101012", hair: "#9a9a96", capStyle: "hair" } as Partial<KitColors>;

const Skirt: React.FC<{ x: number; y: number; s: number; color: string; swing?: number }> = ({ x, y, s, color, swing = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><path d={`M -44 -176 L 44 -176 L ${70 + swing} -6 Q 0 6 ${-70 + swing} -6 Z`} fill={color} stroke={INK} strokeWidth={4 / s} /></g>
);
const Bowler: React.FC = () => <g><path d="M -40 -372 Q -40 -440 10 -442 Q 60 -440 60 -372 Z" fill="#1a1a1e" stroke={INK} strokeWidth={4} /><ellipse cx={10} cy={-372} rx={66} ry={11} fill="#1a1a1e" stroke={INK} strokeWidth={4} /></g>;
const Hand: React.FC<{ p: [number, number]; skin?: string; r?: number }> = ({ p, skin = "#eebf98", r = 11 }) => <circle cx={p[0]} cy={p[1]} r={r} fill={skin} stroke={INK} strokeWidth={3} />;

// ---------- the wave ----------
/** brown wave whose front is at x = wf (moving right), crest height h above the ground y */
export const Wave: React.FC<{ wf: number; y: number; h: number; frame: number; back?: number }> = ({ wf, y, h, frame, back = -400 }) => {
  const wob = (k: number) => Math.sin(frame * 0.3 + k) * h * 0.03;
  const crestX = wf - h * 0.35;
  const d = `M ${back} ${y + 20} L ${back} ${y - h * 0.72 + wob(1)} Q ${(back + crestX) / 2} ${y - h * 0.82 + wob(2)} ${crestX - h * 0.25} ${y - h + wob(3)}
    Q ${crestX + h * 0.05} ${y - h * 1.04} ${wf - h * 0.05} ${y - h * 0.72} Q ${wf + h * 0.12} ${y - h * 0.4} ${wf + h * 0.06} ${y + 20} Z`;
  return (
    <g>
      <path d={d} fill={MOL} stroke="#1e0e06" strokeWidth={5} />
      {/* glossy highlight ridges that move with the flow */}
      {[0, 1, 2, 3].map((i) => {
        const yy = y - h * (0.25 + i * 0.16) + wob(i + 4);
        const x0 = back + 60 + ((frame * 9 + i * 170) % 300);
        return <path key={i} d={`M ${x0} ${yy} Q ${x0 + 180} ${yy - 14} ${Math.min(crestX, x0 + 360)} ${yy - 6}`} stroke={MOL2} strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.8} />;
      })}
      <path d={`M ${crestX - h * 0.3} ${y - h * 0.96 + wob(3)} Q ${crestX + h * 0.02} ${y - h * 1.02} ${wf - h * 0.06} ${y - h * 0.74}`} stroke={MOLHI} strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.9} />
      {/* splash drops at the front */}
      {Array.from({ length: 7 }, (_, i) => { const ph = ((frame * 0.08 + rnd(i) * 3) % 1); return <ellipse key={i} cx={wf + h * 0.05 + ph * h * 0.25 * (0.5 + rnd(i + 3))} cy={y - h * 0.75 + ph * ph * h * 0.7 - (1 - ph) * h * 0.1 * rnd(i + 5)} rx={10 + rnd(i) * 8} ry={8 + rnd(i) * 6} fill={MOL2} stroke="#1e0e06" strokeWidth={2} opacity={1 - ph * 0.5} />; })}
    </g>
  );
};

// ---------- shared street backdrop: warehouses + the Atlantic Avenue elevated railway ----------
const Street: React.FC<{ scroll: number; frame: number; ground?: number; sign?: boolean; elev?: boolean }> = ({ scroll, frame, ground = GY, sign, elev = true }) => {
  const off = (k: number, period: number) => ((-scroll * k) % period + period) % period;
  return (
    <g>
      <Sky top="#9fb8cc" bottom="#e8e2d0" clouds={3} drift={frame / 30} />
      {/* warehouses (parallax 0.6) */}
      {Array.from({ length: 6 }, (_, i) => { const x = -340 + i * 300 + off(0.6, 300); const h = 380 + (i % 3) * 70; return <g key={i}>
        <rect x={x} y={ground - h} width={290} height={h} fill={i % 2 ? "#9a5a40" : "#8a4e38"} stroke={INK} strokeWidth={4} />
        {[0, 1].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={x + 30 + c * 85} y={ground - h + 40 + r * 110} width={50} height={70} fill="#3a4a5a" stroke="#efe2c4" strokeWidth={3} />))}
        <rect x={x + 100} y={ground - 150} width={90} height={150} fill="#3a2a1e" stroke={INK} strokeWidth={3} />
      </g>; })}
      {/* elevated railway (parallax 0.8): deck + legs */}
      {elev && <g>
        <rect x={-60} y={ground - 560} width={1200} height={44} fill="#4a4e52" stroke={INK} strokeWidth={4} />
        {Array.from({ length: 30 }, (_, i) => <line key={i} x1={-60 + i * 40} x2={-40 + i * 40} y1={ground - 560} y2={ground - 516} stroke="#2a2e32" strokeWidth={3} />)}
        {Array.from({ length: 4 }, (_, i) => { const x = -200 + i * 420 + off(0.8, 420); return <g key={i}><rect x={x} y={ground - 516} width={26} height={516} fill="#5a5e62" stroke={INK} strokeWidth={3} /><path d={`M ${x - 40} ${ground - 516} L ${x + 13} ${ground - 456} L ${x + 66} ${ground - 516}`} fill="none" stroke="#5a5e62" strokeWidth={8} /></g>; })}
      </g>}
      {sign && (() => { const x = 760 + off(0.8, 1700) - 600; return <g><rect x={x} y={ground - 330} width={10} height={330} fill="#2a2a2a" /><rect x={x - 120} y={ground - 360} width={250} height={50} fill="#1f4a2a" stroke="#efe2c4" strokeWidth={4} /><text x={x + 5} y={ground - 324} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={28} fill="#fff">COMMERCIAL ST.</text></g>; })()}
      {/* cobbles (parallax 1) */}
      <rect x={-60} y={ground} width={1200} height={900} fill="#7a7266" />
      {Array.from({ length: 5 }, (_, r) => Array.from({ length: 14 }, (_, c) => <rect key={`${r}${c}`} x={-120 + c * 96 + off(1, 96) + (r % 2) * 48} y={ground + 8 + r * 34} width={84} height={24} rx={8} fill="#8a8276" opacity={0.7} />))}
    </g>
  );
};

// ---------- 1 + LOOP: the wave chases a dock worker and a newsboy down the street ----------
export const SceneHook: React.FC<SP & { u0?: number }> = ({ lt, frame, u0 = 0 }) => {
  const u = lt + u0;
  const s = 0.95;
  const scroll = (u + 4) * RUN * s; // camera tracks the runner: the ground moves at his speed
  const push = 1.04 + Math.max(0, Math.min(6.6, u + 2.4)) * 0.015;
  const wf = 300 + (u + 2.4) * 18; // the wave gains on them
  const wh = 540 + Math.sin(u * 0.8) * 20;
  // newsboy: stands on the pavement (moves with the ground) until he sees the wave, drops papers, then runs too
  const tSee = 0.9;
  const nbStand = 1100 - (u + 0.4) * RUN * s;
  const nbX = u < tSee ? nbStand : 1100 - (tSee + 0.4) * RUN * s;
  const nbRun = u >= tSee + 0.25;
  const nbHand = handAt(nbX, GY + 20, 0.78, -1, -40, 0);
  return (
    <g transform={`translate(540 1000) scale(${push}) translate(-540 -1000)`}>
      <Street scroll={scroll} frame={frame} />
      {/* papers: held, then dropped at tSee; once dropped they lie on the ground and scroll with it */}
      {u < tSee ? <rect x={nbHand[0] - 26} y={nbHand[1] - 14} width={52} height={36} fill="#efe8d6" stroke={INK} strokeWidth={3} />
        : Array.from({ length: 5 }, (_, i) => { const k = Math.min(1, (u - tSee) / 0.6); const x0 = nbHand[0] - (u - tSee) * RUN * s + (rnd(i) - 0.5) * 120 * k; const y0 = nbHand[1] + k * (GY + 30 - nbHand[1]) + Math.sin(u * 9 + i) * 10 * (1 - k); return <rect key={i} x={x0 - 24} y={y0 - 6} width={48} height={14} transform={`rotate(${(rnd(i + 2) - 0.5) * 70 * k + Math.sin(u * 7 + i) * 20 * (1 - k)} ${x0} ${y0})`} fill="#efe8d6" stroke={INK} strokeWidth={2} />; })}
      <Figure x={nbX} y={GY + 20} s={0.78} facing={nbRun ? 1 : -1} A1={nbRun ? undefined : -40} colors={NEWSBOY} frame={frame} walking={nbRun} expression={u < tSee - 0.3 ? "neutral" : "scared"} />
      <Figure x={560} y={GY + 40} s={s} facing={1} colors={DOCK} frame={frame} walking expression="scared" lean={8} />
      <Wave wf={wf} y={GY + 60} h={wh} frame={frame} />
    </g>
  );
};

// ---------- 4: low angle up the 50-ft tank; a worker looks up, another climbs the ladder ----------
const Tank: React.FC<{ x: number; base: number; w: number; h: number }> = ({ x, base, w, h }) => (
  <g>
    <rect x={x} y={base - h} width={w} height={h} fill="#8a8e8a" stroke={INK} strokeWidth={6} />
    {Array.from({ length: 7 }, (_, r) => <g key={r}><line x1={x} x2={x + w} y1={base - h + ((r + 1) * h) / 8} y2={base - h + ((r + 1) * h) / 8} stroke="#5a5e5a" strokeWidth={4} />
      {Array.from({ length: 16 }, (_, c) => <circle key={c} cx={x + 20 + (c * (w - 40)) / 15} cy={base - h + ((r + 1) * h) / 8 - 9} r={4} fill="#5a5e5a" />)}</g>)}
    {Array.from({ length: 5 }, (_, c) => <rect key={c} x={x + c * w / 5} y={base - h} width={w / 10} height={h} fill="#fff" opacity={0.05} />)}
    <ellipse cx={x + w / 2} cy={base - h} rx={w / 2} ry={36} fill="#9a9e9a" stroke={INK} strokeWidth={6} />
  </g>
);
export const SceneTank: React.FC<SP> = ({ lt, frame }) => {
  const tilt = interpolate(lt, [0, 4.8], [0, 520], { ...cl, easing: Easing.inOut(Easing.cubic) });
  const climbY = GY - 40 - lt * 70; // feet of the climber on the rungs
  const rung = (lt * 2.2) % 1;
  const aL = -170 + Math.sin(rung * Math.PI * 2) * 10, aR = -170 - Math.sin(rung * Math.PI * 2) * 10;
  return (
    <g transform={`translate(0 ${tilt})`}>
      <rect x={-60} y={-1200} width={1200} height={GY + 1210} fill="#a8bccc" />
      <Sky top="#8fb0c8" bottom="#d8dccc" clouds={2} drift={lt} />
      <Tank x={120} base={GY} w={700} h={1500} />
      {/* ladder on the right side */}
      <g>{[0, 1].map((k) => <line key={k} x1={840 + k * 70} x2={840 + k * 70} y1={GY - 1500} y2={GY} stroke="#4a4a4a" strokeWidth={8} />)}
        {Array.from({ length: 50 }, (_, i) => <line key={i} x1={840} x2={910} y1={GY - 20 - i * 30} y2={GY - 20 - i * 30} stroke="#4a4a4a" strokeWidth={6} />)}</g>
      <Figure x={875} y={climbY} s={0.6} facing={-1} A1={aL} A2={aR} colors={DOCK2} frame={frame} expression="determined" />
      <rect x={-60} y={GY} width={1200} height={1700} fill="#6e6a60" />
      <Figure x={300} y={GY + 40} s={1.0} facing={1} A1={-150} A2={-20} lean={-12} colors={DOCK} frame={frame} expression="neutral" />
      {/* 50 FT marker */}
      <g><line x1={60} x2={60} y1={GY - 1500} y2={GY} stroke="#ffd23f" strokeWidth={6} strokeDasharray="20 12" /><path d={`M 40 ${GY - 1470} L 60 ${GY - 1500} L 80 ${GY - 1470}`} fill="none" stroke="#ffd23f" strokeWidth={6} /></g>
      <Label x={470} y={GY - 1600} lt={lt} at={1.0} text="50 FEET TALL" size={44} />
      <Label x={470} y={GY - 1100} lt={lt} at={2.3} text="2.3 MILLION GALLONS" size={40} bg="#4a2410" />
    </g>
  );
};

// ---------- 5: close-up of a leaking seam; a woman steps around the brown puddle and looks up ----------
export const SceneLeak: React.FC<SP> = ({ lt, frame }) => {
  const walkEnd = 1.4;
  const wx = lt < walkEnd ? 1150 - lt * RUN * 1.0 : 1150 - walkEnd * RUN * 1.0;
  const DROP = 0.75;
  return (
    <g>
      {/* riveted plate fills the top */}
      <rect x={-60} y={0} width={1200} height={GY} fill="#7e827e" />
      {[300, 700].map((y) => <g key={y}><rect x={-60} y={y - 14} width={1200} height={28} fill="#6a6e6a" stroke={INK} strokeWidth={3} />{Array.from({ length: 16 }, (_, c) => <circle key={c} cx={-30 + c * 76} cy={y} r={9} fill="#5a5e5a" stroke={INK} strokeWidth={2} />)}</g>)}
      {/* brown streaks down from the seam */}
      {[380, 440, 520].map((x, i) => <path key={i} d={`M ${x} 714 Q ${x + 6} 900 ${x - 4} ${GY}`} stroke={MOL} strokeWidth={14 - i * 3} fill="none" opacity={0.85} />)}
      <rect x={-60} y={GY} width={1200} height={1000} fill="#7a7266" />
      {/* puddle grows a little; a drop lands every DROP s */}
      <ellipse cx={450} cy={GY + 70} rx={220 + lt * 8} ry={44} fill={MOL} stroke="#1e0e06" strokeWidth={3} />
      <ellipse cx={420} cy={GY + 62} rx={120} ry={12} fill={MOL2} opacity={0.7} />
      {Array.from({ length: 6 }, (_, i) => {
        const t0 = i * DROP; const k = (lt - t0) / 0.45;
        if (k < 0) return null;
        if (k < 1) return <ellipse key={i} cx={440 + (i % 3) * 30} cy={716 + k * k * (GY + 60 - 716)} rx={9} ry={14} fill={MOL} />;
        const r = (lt - t0 - 0.45) * 160; return r < 90 ? <ellipse key={i} cx={440 + (i % 3) * 30} cy={GY + 66} rx={r} ry={r * 0.22} fill="none" stroke={MOLHI} strokeWidth={4} opacity={1 - r / 90} /> : null;
      })}
      {/* woman walks in from the right and stops at the puddle's edge */}
      <Skirt x={wx} y={GY + 90} s={0.95} color="#3a4a6a" swing={lt < walkEnd ? Math.sin(frame * 0.22) * 8 : 0} />
      <Figure x={wx} y={GY + 90} s={0.95} facing={-1} colors={WOMAN} frame={frame} walking={lt < walkEnd} expression={lt < walkEnd + 0.3 ? "neutral" : "scared"} lean={lt > walkEnd + 0.5 ? -6 : 0} A1={lt < walkEnd ? undefined : -20} />
      <Label x={540} y={1450} lt={lt} at={0.3} text="IT LEAKED" size={44} bg="#4a2410" />
    </g>
  );
};

// ---------- 6: an oddly warm day: mercury rises past 40°F; two workers open their lunch pails ----------
const Pail: React.FC<{ x: number; y: number; lid?: number }> = ({ x, y, lid = 0 }) => (
  <g transform={`translate(${x} ${y})`}><path d="M -34 -60 L 34 -60 L 28 0 L -28 0 Z" fill="#9a9a9e" stroke={INK} strokeWidth={3} /><path d="M -30 -60 Q 0 -100 30 -60" fill="none" stroke={INK} strokeWidth={3} />
    <g transform={`translate(-34 -60) rotate(${-lid * 70})`}><rect x={0} y={-8} width={68} height={10} fill="#7a7a7e" stroke={INK} strokeWidth={3} /></g></g>
);
export const SceneWarm: React.FC<SP> = ({ lt, frame }) => {
  const merc = interpolate(lt, [0.1, 1.6], [0.15, 0.72], { ...cl, easing: Easing.out(Easing.cubic) });
  const lid = interpolate(lt, [0.4, 0.9], [0, 1], cl);
  const fan = Math.sin(frame * 0.5) * 18;
  const h1 = handAt(330, GY + 40, 0.95, 1, -60 - lid * 25, 0);
  const h2 = handAt(720, GY + 40, 0.95, -1, -150 + fan, 0);
  return (
    <g>
      <Sky top="#7fb4dc" bottom="#f2e8c8" sun={{ x: 820, y: 300, r: 70, color: "#fff2b0" }} clouds={1} drift={lt} />
      <Street scroll={0} frame={frame} elev={false} />
      {/* thermometer on a post */}
      <g><rect x={120} y={500} width={24} height={GY - 500} fill="#5a3a24" stroke={INK} strokeWidth={3} />
        <rect x={60} y={560} width={140} height={420} rx={20} fill="#efe8d6" stroke={INK} strokeWidth={4} />
        <rect x={120} y={600} width={20} height={320} rx={10} fill="#fff" stroke={INK} strokeWidth={2} />
        <rect x={122} y={600 + 320 * (1 - merc)} width={16} height={320 * merc} fill="#c62828" />
        <circle cx={130} cy={935} r={22} fill="#c62828" stroke={INK} strokeWidth={3} />
        {[0, 20, 40, 60].map((d, i) => <g key={d}><line x1={145} x2={165} y1={900 - i * 90} y2={900 - i * 90} stroke={INK} strokeWidth={3} /><text x={170} y={908 - i * 90} fontFamily="Inter" fontWeight={800} fontSize={22} fill={INK}>{d}°</text></g>)}
      </g>
      {/* crate as a table, two workers at lunch */}
      <rect x={440} y={GY - 120} width={200} height={160} fill="#9a6a3a" stroke={INK} strokeWidth={4} />
      <Pail x={480} y={GY - 120} lid={lid} />
      <Figure x={330} y={GY + 40} s={0.95} facing={1} A1={-60 - lid * 25} A2={-40} colors={DOCK} frame={frame} expression="happy" />
      <Hand p={h1} />
      <Figure x={720} y={GY + 40} s={0.95} facing={-1} A1={-150 + fan} A2={-30} colors={DOCK2} frame={frame} expression="happy" />
      {/* cap in the fanning hand */}
      <g transform={`translate(${h2[0]} ${h2[1]}) rotate(${fan})`}><ellipse rx={36} ry={14} fill="#4a3a2a" stroke={INK} strokeWidth={3} /></g>
      <Label x={540} y={1450} lt={lt} at={0.3} text="OVER 40°F" size={48} bg="#8a3a1a" />
    </g>
  );
};

// ---------- 7: 12:30 — rivets pop, the wall splits, the workers drop the pail and run ----------
export const SceneBurst: React.FC<SP> = ({ lt, frame }) => {
  const tPop = 1.5; // first rivet (on "the tank", 22.9 s)
  const split = interpolate(lt, [tPop + 0.9, tPop + 1.5], [0, 1], cl);
  const shake = lt > tPop + 0.9 ? Math.sin(frame * 2.1) * 10 * (1 - Math.min(1, (lt - tPop - 0.9) / 1.2)) : 0;
  const run = lt > tPop + 1.2;
  const runT = Math.max(0, lt - tPop - 1.2);
  const w1 = 420 - runT * RUN * 0.9, w2 = 260 - runT * RUN * 0.85;
  const pailFall = lt > tPop + 0.4 ? Math.min(1, ((lt - tPop - 0.4) / 0.4) ** 2) : 0;
  const ph = handAt(420, GY + 40, 0.9, 1, -50, 0);
  return (
    <g transform={`translate(${shake} ${shake * 0.4})`}>
      <Sky top="#8fb0c8" bottom="#e2e0d0" clouds={2} drift={lt} />
      <Tank x={600} base={GY} w={700} h={1400} />
      {/* rivets popping out of the vertical seam, one after another */}
      {Array.from({ length: 8 }, (_, i) => { const t0 = tPop + i * 0.11; const k = (lt - t0) / 0.5; return k < 0 ? null : k < 1 ? <circle key={i} cx={640 - k * 260 - i * 6} cy={GY - 300 - i * 70 + k * k * 260 - k * 120} r={9} fill="#5a5e5a" stroke={INK} strokeWidth={2} /> : null; })}
      <path d={`M 640 ${GY} L ${640 - split * 20} ${GY - 300 * split} L ${640 + split * 10} ${GY - 600 * split} L ${640 - split * 14} ${GY - 900 * split}`} stroke="#1a1a1a" strokeWidth={8 + split * 30} fill="none" />
      {split > 0 && <g transform="translate(1240 0) scale(-1 1)"><Wave wf={600 + split * 620} y={GY + 60} h={200 + split * 600} frame={frame} back={-300} /></g>}
      <rect x={-60} y={GY} width={1200} height={1000} fill="#7a7266" />
      {/* the pail falls from the hand when the bang comes */}
      <Pail x={ph[0] + 10} y={ph[1] + 60 + pailFall * (GY + 40 - ph[1] - 60)} />
      <Figure x={run ? w1 : 420} y={GY + 40} s={0.9} facing={run ? -1 : 1} A1={run ? undefined : -50} lean={!run && lt > tPop ? -8 : 0} colors={DOCK} frame={frame} walking={run} expression={lt > tPop ? "scared" : "happy"} />
      <Figure x={run ? w2 : 260} y={GY + 40} s={0.85} facing={run ? -1 : 1} A1={run ? undefined : -30} colors={DOCK2} frame={frame} walking={run} expression={lt > tPop ? "scared" : "neutral"} />
      <Label x={540} y={1450} lt={lt} at={0.2} text="12:30 PM" size={48} />
    </g>
  );
};

// ---------- 8: tracking shot with the wave down Commercial Street ----------
export const SceneTrack: React.FC<SP> = ({ lt, frame }) => {
  const s = 0.7;
  const scroll = lt * RUN * s + 300;
  const wf = 120 + lt * 60;
  return (
    <g transform="translate(540 1100) scale(0.92) translate(-540 -1100)">
      <Street scroll={scroll} frame={frame} sign />
      <Skirt x={760} y={GY + 30} s={s} color="#5a3a4a" swing={Math.sin(frame * 0.22) * 8} />
      <Figure x={760} y={GY + 30} s={s} facing={1} colors={{ ...WOMAN, coat: "#5a3a4a", coatShade: "#442c38", coatLight: "#6a4a5a", trousers: "#5a3a4a", trousersShade: "#442c38" }} frame={frame} walking expression="scared" lean={8} />
      <Figure x={600} y={GY + 40} s={s} facing={1} colors={DOCK2} frame={frame + 7} walking expression="scared" lean={10} />
      <Wave wf={wf} y={GY + 60} h={330} frame={frame} />
    </g>
  );
};

// ---------- 9: the wave hits the elevated railway: the legs bend, the deck sags, the car tilts ----------
export const SceneEl: React.FC<SP> = ({ lt, frame }) => {
  const wf = -200 + lt * 520;
  const legs = [180, 480, 780];
  const bend = legs.map((x) => interpolate(wf - x, [0, 140], [0, 1], cl));
  const sag = (x: number) => { let d = 0; legs.forEach((lx, i) => { d += bend[i] * 90 * Math.max(0, 1 - Math.abs(x - lx) / 330); }); return d; };
  const deckY = 560;
  const carX = 520, tilt = (sag(carX + 160) - sag(carX - 160)) / 320 * 57;
  return (
    <g>
      <Sky top="#9fb8cc" bottom="#e8e2d0" clouds={2} drift={lt} />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={-60 + i * 300} y={GY - 420} width={280} height={420} fill="#8a4e38" stroke={INK} strokeWidth={4} />)}
      {/* deck as a polyline that sags */}
      <path d={`M -60 ${deckY + sag(-60)} ${Array.from({ length: 25 }, (_, i) => `L ${-60 + i * 50} ${deckY + sag(-60 + i * 50)}`).join(" ")} L 1140 ${deckY + 50 + sag(1140)} ${Array.from({ length: 25 }, (_, i) => `L ${1140 - i * 50} ${deckY + 50 + sag(1140 - i * 50)}`).join(" ")} Z`} fill="#4a4e52" stroke={INK} strokeWidth={4} />
      {/* the train car on the deck */}
      <g transform={`translate(${carX} ${deckY + sag(carX)}) rotate(${tilt})`}>
        <rect x={-180} y={-150} width={360} height={150} rx={14} fill="#7a2a22" stroke={INK} strokeWidth={5} />
        {[-130, -50, 30, 110].map((x) => <rect key={x} x={x} y={-128} width={56} height={56} fill="#e8d8a8" stroke={INK} strokeWidth={3} />)}
        <circle cx={-6} cy={-104} r={16} fill="#eebf98" stroke={INK} strokeWidth={3} />
        <rect x={-30} y={-90} width={48} height={18} fill="#2a3a5a" />
      </g>
      {legs.map((x, i) => { const b = bend[i]; const top = deckY + 50 + sag(x); return <g key={x}>
        <path d={`M ${x} ${top} L ${x + b * 30} ${(top + GY) / 2} L ${x + b * 160} ${GY - b * 60}`} stroke="#5a5e62" strokeWidth={26} fill="none" strokeLinejoin="round" />
        {b > 0.6 && <path d={`M ${x + b * 30 - 20} ${(top + GY) / 2 - 10} l 20 10 l -14 14`} stroke="#ffd23f" strokeWidth={5} fill="none" />}
      </g>; })}
      <rect x={-60} y={GY} width={1200} height={1000} fill="#7a7266" />
      <Wave wf={wf} y={GY + 60} h={360} frame={frame} back={-600} />
      <Label x={540} y={1450} lt={lt} at={1.0} text="STEEL SNAPPED" size={44} bg="#4a2410" />
    </g>
  );
};

// ---------- 10: high angle: the brown surface carries a horse and wagon; a man clings to a lamppost ----------
export const SceneSwept: React.FC<SP> = ({ lt, frame }) => {
  const level = GY - 60 - interpolate(lt, [0, 3], [0, 120], cl);
  const drift = lt * 110;
  const bob = Math.sin(frame * 0.18) * 8;
  const post = 760;
  const ph = handAt(post + 70, level + 60, 0.8, -1, -120, -50);
  return (
    <g>
      <Sky top="#9fb8cc" bottom="#e8e2d0" clouds={2} drift={lt} />
      {[0, 1, 2, 3].map((i) => <g key={i}><rect x={-60 + i * 300} y={GY - 500} width={280} height={500} fill="#8a4e38" stroke={INK} strokeWidth={4} />{[0, 1, 2].map((c) => <rect key={c} x={-30 + i * 300 + c * 85} y={GY - 450} width={50} height={70} fill="#3a4a5a" stroke="#efe2c4" strokeWidth={3} />)}</g>)}
      {/* lamppost + a man holding on, his legs trailing in the flow */}
      <rect x={post - 10} y={GY - 720} width={20} height={760} fill="#2a2a2a" stroke={INK} strokeWidth={3} />
      <path d={`M ${post - 30} ${GY - 720} L ${post + 30} ${GY - 720} L ${post + 20} ${GY - 780} L ${post - 20} ${GY - 780} Z`} fill="#e8d8a0" stroke={INK} strokeWidth={3} />
      <Figure x={post + 70} y={level + 60} s={0.8} facing={-1} A1={-120} A2={-110} lean={-50} colors={DOCK} frame={frame} expression="scared" />
      <Hand p={ph} />
      {/* horse and wagon float with the surface */}
      <g transform={`translate(${120 + drift} ${level + 20 + bob}) rotate(${Math.sin(frame * 0.12) * 4})`}>
        <path d="M -260 -120 L 60 -120 L 40 -20 L -240 -20 Z" fill="#8a5a34" stroke={INK} strokeWidth={4} />
        {[0, 1, 2].map((k) => <rect key={k} x={-230 + k * 90} y={-170} width={70} height={50} fill="#c8a46a" stroke={INK} strokeWidth={3} />)}
        <g transform="translate(230 -10) scale(0.85)"><Horse phase={frame * 0.1} galloping={false} rider={false} mailbag={false} color="#6a4a32" /></g>
      </g>
      {/* surface on top */}
      <rect x={-60} y={level} width={1200} height={1000} fill={MOL} />
      {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M ${-100 + ((i * 240 + frame * 6) % 1300)} ${level + 30 + (i % 3) * 50} q 60 -12 120 0`} stroke={MOL2} strokeWidth={8} fill="none" strokeLinecap="round" />)}
      <path d={`M -60 ${level} L 1140 ${level}`} stroke={MOLHI} strokeWidth={6} />
      <Label x={540} y={1450} lt={lt} at={0.3} text="21 KILLED · 150 HURT" size={42} bg="#4a2410" />
    </g>
  );
};

// ---------- 12: the cold: a sailor waist-deep pulls a trapped man; the molasses won't let go ----------
export const SceneStuck: React.FC<SP> = ({ lt, frame }) => {
  const level = GY - 140;
  const pull = (Math.sin(lt * 2.4) + 1) / 2; // 0..1 strain cycle
  const lean = -6 - pull * 14;
  const sx = 700, mx = 380;
  const aS = -90 + pull * 4, aM = -88;
  const hs = handAt(sx, GY + 20, 1.0, -1, aS, lean);
  const hm = handAt(mx + pull * 12, GY + 60, 0.95, 1, aM, 6);
  const frost = interpolate(lt, [0, 3], [0, 0.35], cl);
  const push = 1.45 + lt * 0.03;
  return (
    <g transform={`translate(540 1060) scale(${push}) translate(-540 -1010)`}>
      <Sky top="#7a8a9a" bottom="#c8ccd0" clouds={3} drift={lt * 0.3} />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={-60 + i * 300} y={GY - 520} width={280} height={520} fill="#7a4a38" stroke={INK} strokeWidth={4} />)}
      <Figure x={mx + pull * 12} y={GY + 60} s={0.95} facing={1} A1={aM} A2={-40} lean={6} colors={DOCK2} frame={frame} expression="scared" />
      <Figure x={sx} y={GY + 20} s={1.0} facing={-1} A1={aS} A2={aS + 8} lean={lean} colors={SAILOR} frame={frame} expression="determined" />
      {/* hands locked wrist to wrist: the forearms meet between the two hands */}
      <line x1={hm[0]} y1={hm[1]} x2={hs[0]} y2={hs[1]} stroke="#2b1d14" strokeWidth={20} strokeLinecap="round" />
      <line x1={hm[0]} y1={hm[1]} x2={(hm[0] + hs[0]) / 2} y2={(hm[1] + hs[1]) / 2} stroke="#c99a78" strokeWidth={13} strokeLinecap="round" />
      <line x1={(hm[0] + hs[0]) / 2} y1={(hm[1] + hs[1]) / 2} x2={hs[0]} y2={hs[1]} stroke="#8a5a3a" strokeWidth={13} strokeLinecap="round" />
      <rect x={-60} y={level} width={1200} height={1000} fill={MOL} />
      <rect x={-60} y={level} width={1200} height={1000} fill="#1e0e06" opacity={frost} />
      {[0, 1, 2].map((k) => <path key={k} d={`M ${sx - 30 + k * 30} ${level} Q ${sx - 20 + k * 30 + pull * 10} ${level - 30 - pull * 50} ${sx - 10 + k * 25} ${level - 60 - pull * 60}`} stroke={MOL2} strokeWidth={10 - k * 2} fill="none" strokeLinecap="round" opacity={pull} />)}
      {[0, 1].map((k) => <path key={`m${k}`} d={`M ${mx - 20 + k * 40} ${level} Q ${mx - 10 + k * 40} ${level - 20 - pull * 30} ${mx + k * 30} ${level - 40 - pull * 30}`} stroke={MOL2} strokeWidth={8} fill="none" strokeLinecap="round" opacity={pull} />)}
      <path d={`M -60 ${level} L 1140 ${level}`} stroke={MOLHI} strokeWidth={5} opacity={1 - frost} />
      <rect x={-60} y={0} width={1200} height={2000} fill="#cfe4f2" opacity={frost * 0.35} />
      <Label x={540} y={GY - 600} lt={lt} at={0.3} text="LIKE GLUE" size={40} bg="#4a2410" />
    </g>
  );
};

// ---------- 13: the company blames a bomb ----------
const Office: React.FC = () => (
  <g>
    <rect x={-60} y={0} width={1200} height={GY + 60} fill="#6a5a44" />
    {Array.from({ length: 10 }, (_, i) => <rect key={i} x={-60 + i * 120} y={0} width={110} height={GY + 60} fill="#76654c" />)}
    <rect x={640} y={380} width={300} height={360} fill="#bcd0dc" stroke="#3a2a1a" strokeWidth={14} />
    <line x1={790} x2={790} y1={380} y2={740} stroke="#3a2a1a" strokeWidth={8} />
    <rect x={-60} y={GY + 60} width={1200} height={1000} fill="#4a3424" />
  </g>
);
export const SceneBomb: React.FC<SP> = ({ lt, frame }) => {
  const tap = lt > 0.6 && lt < 1.8 ? Math.abs(Math.sin((lt - 0.6) * Math.PI * 2.5)) : 0;
  const A = -55 + tap * 8;
  const h = handAt(330, GY + 60, 1.0, 1, A, 8);
  return (
    <g>
      <Office />
      <Figure x={330} y={GY + 60} s={1.0} facing={1} A1={A} A2={-20} lean={8} colors={SUITM} frame={frame} expression="determined" />
      <Figure x={820} y={GY + 60} s={0.95} facing={-1} A1={-10} A2={-15} colors={{ ...SUITM, coat: "#4a4a52", coatShade: "#3a3a40", coatLight: "#5a5a62", hair: "#6a4a2a" }} frame={frame} expression="neutral"><Bowler /></Figure>
      {/* desk with the newspaper; the fingertip touches the headline */}
      <rect x={300} y={GY - 120} width={480} height={30} fill="#5a3a24" stroke={INK} strokeWidth={4} />
      <rect x={330} y={GY - 90} width={30} height={150} fill="#5a3a24" stroke={INK} strokeWidth={4} /><rect x={720} y={GY - 90} width={30} height={150} fill="#5a3a24" stroke={INK} strokeWidth={4} />
      <g transform={`translate(${h[0] + 60} ${GY - 150}) rotate(-6)`}>
        <rect x={-90} y={-60} width={200} height={70} fill="#efe8d6" stroke={INK} strokeWidth={3} />
        <text x={10} y={-12} textAnchor="middle" fontFamily="Georgia" fontWeight={900} fontSize={40} fill="#1a1a1a">BOMB?</text>
      </g>
      <Hand p={h} r={12} />
      <Label x={540} y={1450} lt={lt} at={0.3} text="“A BOMB DID IT”" size={46} />
    </g>
  );
};

// ---------- 14: the court's auditor stamps the report: the company is to blame ----------
export const SceneCourt: React.FC<SP> = ({ lt, frame }) => {
  const tHit = 0.75;
  const A = lt < tHit ? interpolate(lt, [0, tHit - 0.25, tHit], [-150, -160, -60], cl) : interpolate(lt, [tHit, tHit + 0.5], [-60, -120], cl);
  const h = handAt(300, GY + 60, 1.0, 1, A, 6);
  const inked = lt >= tHit;
  return (
    <g>
      <rect x={-60} y={0} width={1200} height={GY + 60} fill="#5a3a24" />
      {Array.from({ length: 8 }, (_, i) => <rect key={i} x={-40 + i * 150} y={80} width={120} height={GY - 200} fill="#6a4630" stroke="#4a2c1a" strokeWidth={4} />)}
      <rect x={-60} y={GY + 60} width={1200} height={1000} fill="#3a2414" />
      <Figure x={300} y={GY + 60} s={1.0} facing={1} A1={A} A2={-40} lean={6} colors={AUDITOR} frame={frame} expression="determined" />
      <Figure x={860} y={GY + 60} s={0.95} facing={-1} A1={-8} A2={-12} lean={inked ? 8 : 0} colors={SUITM} frame={frame} expression={inked ? "sad" : "neutral"} />
      <rect x={260} y={GY - 110} width={480} height={30} fill="#4a2c1a" stroke={INK} strokeWidth={4} />
      <rect x={290} y={GY - 80} width={30} height={140} fill="#4a2c1a" stroke={INK} strokeWidth={4} /><rect x={680} y={GY - 80} width={30} height={140} fill="#4a2c1a" stroke={INK} strokeWidth={4} />
      {/* the report on the table; ink appears only when the stamp touches it */}
      <rect x={370} y={GY - 140} width={240} height={30} fill="#efe8d6" stroke={INK} strokeWidth={3} />
      {inked && <g transform={`translate(640 ${GY - 430}) rotate(-6) scale(${interpolate(lt, [tHit, tHit + 0.12], [1.3, 1], cl)})`}><rect x={-250} y={-52} width={500} height={92} fill="none" stroke="#b71c1c" strokeWidth={8} /><text y={14} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={52} fill="#b71c1c">COMPANY TO BLAME</text></g>}
      {/* the stamp in the hand */}
      <g transform={`translate(${h[0]} ${h[1]})`}><rect x={-12} y={-50} width={24} height={50} fill="#5a3a24" stroke={INK} strokeWidth={3} /><rect x={-34} y={0} width={68} height={22} fill="#2a2a2a" stroke={INK} strokeWidth={3} /></g>
      <Hand p={[h[0], h[1] - 30]} />
      <Label x={540} y={1450} lt={lt} at={1.0} text="PAID $628,000" size={46} bg="#1f4a2a" />
    </g>
  );
};
