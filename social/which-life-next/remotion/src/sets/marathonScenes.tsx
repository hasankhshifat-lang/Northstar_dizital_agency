import React from "react";
import { interpolate, Easing } from "remotion";
import { Sky } from "./ponyScenes";
import { Label } from "./chickenScenes";
import { handAt } from "./madridScenes";
import { Figure } from "./pirateScenes";
import { KitColors } from "../kit/Kit";

/**
 * Ground scenes for "The 1904 Olympic Marathon Winner Was Fed Rat Poison" (St. Louis, 30 August 1904).
 * lt = seconds since the scene started. Kit side pose: feet at (0,0), shoulder pivot (0,-284), straight-arm hand = handAt().
 * Run speed from the Kit stride: ≈ 240·s px per second; in tracking shots the ground scrolls at that speed so feet don't slide.
 * Scenes are drawn at GY and shifted −130 px by the story. Storyboard: social/scripts/marathon-1904-2026-11-24.md.
 */
const INK = "#2b1d14";
const GY = 1240;
const cl = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
type SP = { lt: number; dur: number; frame: number };
const RUN = 240;
const DUST = "#d8c08a";

// ---------- people (1904) ----------
const HICKS: Partial<KitColors> = { coat: "#f2f0e8", coatShade: "#d6d2c4", coatLight: "#ffffff", patch: "#ffffff", scarf: "#c23b2c", scarfShade: "#8f2a20", trousers: "#f2f0e8", trousersShade: "#d6d2c4", hair: "#3a2a1a", capStyle: "hair" } as Partial<KitColors>;
const LORZ: Partial<KitColors> = { coat: "#efe2b0", coatShade: "#d0c290", coatLight: "#fff2c0", patch: "#fff2c0", scarf: "#2a4a8a", scarfShade: "#1d3466", trousers: "#2a4a8a", trousersShade: "#1d3466", hair: "#6a4a2a", capStyle: "hair" } as Partial<KitColors>;
const CARVAJAL: Partial<KitColors> = { coat: "#efe8d6", coatShade: "#cfc6b0", coatLight: "#fff8e8", patch: "#fff8e8", scarf: "#efe8d6", scarfShade: "#cfc6b0", trousers: "#5a5a62", trousersShade: "#44444a", hair: "#1a1410", capStyle: "hair", skin: "#c99a78", skinShade: "#a87a5a" } as Partial<KitColors>;
const TAU: Partial<KitColors> = { coat: "#efe8d6", coatShade: "#cfc6b0", coatLight: "#fff8e8", patch: "#fff8e8", scarf: "#2a6a3a", scarfShade: "#1d4a2a", trousers: "#2a2a2a", trousersShade: "#1a1a1a", hair: "#1a1410", capStyle: "hair", skin: "#6e4428", skinShade: "#553219" } as Partial<KitColors>;
const RUNR = (c: string): Partial<KitColors> => ({ coat: "#f2f0e8", coatShade: "#d6d2c4", coatLight: "#ffffff", patch: "#ffffff", scarf: c, scarfShade: c, trousers: "#3a3a3a", trousersShade: "#2a2a2a", hair: "#4a3420", capStyle: "hair" } as Partial<KitColors>);
const TRAINER: Partial<KitColors> = { coat: "#3a3a42", coatShade: "#2a2a30", coatLight: "#4a4a52", patch: "#4a4a52", scarf: "#efefe8", scarfShade: "#cfcfc8", trousers: "#3a3a42", trousersShade: "#2a2a30", cap: "#e8d8a8", capShade: "#c8b888" };
const OFFICIAL: Partial<KitColors> = { coat: "#1e1e22", coatShade: "#141416", coatLight: "#2a2a30", patch: "#2a2a30", scarf: "#efefe8", scarfShade: "#cfcfc8", trousers: "#2a2a2e", trousersShade: "#1e1e22", hair: "#6a6a66", capStyle: "hair" } as Partial<KitColors>;
const Boater: React.FC = () => <g><rect x={-30} y={-418} width={84} height={34} rx={4} fill="#e8d8a8" stroke={INK} strokeWidth={4} /><rect x={-30} y={-398} width={84} height={10} fill="#2a2a5a" /><ellipse cx={12} cy={-384} rx={70} ry={11} fill="#e8d8a8" stroke={INK} strokeWidth={4} /></g>;
const Bib: React.FC<{ n: string }> = ({ n }) => <g><rect x={-30} y={-250} width={56} height={44} fill="#fff" stroke={INK} strokeWidth={3} /><text x={-2} y={-218} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={26} fill={INK}>{n}</text></g>;
const Hand: React.FC<{ p: [number, number]; skin?: string; r?: number }> = ({ p, skin = "#eebf98", r = 11 }) => <circle cx={p[0]} cy={p[1]} r={r} fill={skin} stroke={INK} strokeWidth={3} />;

// ---------- props ----------
/** a 1904 open motor car, facing right; wheels turn with `spin` (deg). Origin = ground under the middle. */
export const Car: React.FC<{ x: number; y: number; s?: number; spin?: number; color?: string; flip?: boolean }> = ({ x, y, s = 1, spin = 0, color = "#7a1f1f", flip }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <path d="M -230 -90 L -230 -190 L -120 -190 L -100 -140 L 120 -140 L 150 -170 L 220 -170 L 230 -90 Z" fill={color} stroke={INK} strokeWidth={5} />
    <rect x={-230} y={-230} width={110} height={44} rx={10} fill="#2a1a10" stroke={INK} strokeWidth={4} />
    <line x1={150} y1={-170} x2={110} y2={-250} stroke="#2a2a2a" strokeWidth={8} />
    <circle cx={110} cy={-252} r={22} fill="none" stroke="#2a2a2a" strokeWidth={7} />
    <rect x={190} y={-150} width={34} height={30} rx={6} fill="#c9a54a" stroke={INK} strokeWidth={3} />
    {[-150, 150].map((wx) => <g key={wx} transform={`translate(${wx} -62) rotate(${spin})`}><circle r={62} fill="#2a2a2a" stroke={INK} strokeWidth={4} /><circle r={44} fill="#c9a86a" stroke={INK} strokeWidth={3} />{[0, 45, 90, 135].map((a) => <line key={a} x1={-44 * Math.cos((a * Math.PI) / 180)} y1={-44 * Math.sin((a * Math.PI) / 180)} x2={44 * Math.cos((a * Math.PI) / 180)} y2={44 * Math.sin((a * Math.PI) / 180)} stroke="#5a3a20" strokeWidth={5} />)}<circle r={9} fill="#2a2a2a" /></g>)}
  </g>
);
/** a dust cloud of n puffs centred at (x,y) */
const Dust: React.FC<{ x: number; y: number; r: number; frame: number; op?: number; n?: number }> = ({ x, y, r, frame, op = 0.75, n = 9 }) => (
  <g opacity={op}>{Array.from({ length: n }, (_, i) => <circle key={i} cx={x + (rnd(i) - 0.5) * r * 2 + Math.sin(frame * 0.07 + i) * 12} cy={y + (rnd(i + 4) - 0.5) * r * 0.8 - Math.cos(frame * 0.05 + i) * 8} r={r * (0.35 + rnd(i + 9) * 0.35)} fill={DUST} />)}</g>
);
/** dusty country road scrolling at `scroll` px; trees and fences parallax */
const Road: React.FC<{ scroll: number; frame: number; sun?: boolean; ground?: number }> = ({ scroll, frame, sun = true, ground = GY }) => {
  const off = (k: number, p: number) => ((-scroll * k) % p + p) % p;
  return (
    <g>
      <Sky top="#7fb4dc" bottom="#f6e6b8" sun={sun ? { x: 860, y: 260, r: 80, color: "#fff2a0" } : undefined} clouds={1} drift={frame / 30} />
      {Array.from({ length: 6 }, (_, i) => { const x = -200 + i * 260 + off(0.4, 260); return <g key={i}><path d={`M ${x - 140} ${ground - 160} Q ${x} ${ground - 300 - (i % 2) * 40} ${x + 140} ${ground - 160} Z`} fill="#9aa860" stroke={INK} strokeWidth={3} /></g>; })}
      {Array.from({ length: 5 }, (_, i) => { const x = -200 + i * 320 + off(0.7, 320); return <g key={i}><rect x={x - 12} y={ground - 320} width={24} height={200} fill="#6a4a2a" stroke={INK} strokeWidth={3} /><circle cx={x} cy={ground - 340} r={90} fill="#5a7a3a" stroke={INK} strokeWidth={4} /></g>; })}
      {Array.from({ length: 12 }, (_, i) => { const x = -100 + i * 110 + off(0.9, 110); return <g key={i}><rect x={x} y={ground - 130} width={12} height={110} fill="#8a6a4a" stroke={INK} strokeWidth={2} /></g>; })}
      <rect x={-60} y={ground - 100} width={1200} height={10} fill="#8a6a4a" />
      <rect x={-60} y={ground - 40} width={1200} height={1100} fill="#c8a868" />
      {Array.from({ length: 16 }, (_, i) => <ellipse key={i} cx={-60 + ((i * 97 + off(1, 1200)) % 1200)} cy={ground + 10 + (i % 4) * 40} rx={30 + rnd(i) * 30} ry={5} fill="#b09050" />)}
    </g>
  );
};

// ---------- 1 + LOOP: tracking shot — a trainer running alongside hands Hicks a cup; he drinks while running ----------
export const SceneHook: React.FC<SP & { u0?: number }> = ({ lt, frame, u0 = 0 }) => {
  const u = lt + u0;
  const s = 1.0;
  const scroll = (u + 5) * RUN * s;
  const push = 1.06 + Math.max(0, Math.min(5, u + 2.5)) * 0.015;
  // the cup passes from the trainer's hand to Hicks's hand at u = 1.2, then he lifts it to drink
  const tPass = 2.7;
  const aT = u < tPass - 0.6 ? 10 + Math.sin(frame * 0.22) * 14 : u < tPass ? 55 : interpolate(u, [tPass, tPass + 0.4], [55, 10], cl);
  const aH = u < tPass - 0.3 ? -15 + Math.sin(frame * 0.22) * 14 : u < tPass + 0.2 ? -55 : interpolate(u, [tPass + 0.2, tPass + 0.7], [-55, -150], cl);
  const hx = 520, tx = 750;
  const hH = handAt(hx, GY + 40, s, 1, aH, 0), hT = handAt(tx, GY + 30, 0.95, 1, aT, 0);
  const cup = u < tPass ? hT : hH;
  return (
    <g transform={`translate(540 1000) scale(${push}) translate(-540 -1000)`}>
      <Road scroll={scroll} frame={frame} />
      <Dust x={120} y={GY - 40} r={140} frame={frame} op={0.55} />
      <Figure x={tx} y={GY + 30} s={0.95} facing={1} A1={aT} colors={TRAINER} frame={frame + 5} walking expression="determined" />
      <Figure x={hx} y={GY + 40} s={s} facing={1} A1={aH} lean={0} colors={HICKS} frame={frame} walking expression={u > tPass + 0.5 ? "scared" : "determined"}><Bib n="20" /></Figure>
      {/* the cup (egg white + strychnine): always in exactly one hand */}
      <g transform={`translate(${cup[0]} ${cup[1]})`}><path d="M -16 -34 L 16 -34 L 12 6 L -12 6 Z" fill="#efe8d6" stroke={INK} strokeWidth={3} /><rect x={-14} y={-30} width={28} height={10} fill="#f2e8a0" /></g>
      <Hand p={cup} />
    </g>
  );
};

// ---------- 3: the start: 32 runners at the line, the starter fires, they go ----------
export const SceneStart: React.FC<SP> = ({ lt, frame }) => {
  const tGun = 0.8;
  const go = Math.max(0, lt - tGun - 0.15);
  const gunA = -150;
  return (
    <g>
      <Sky top="#7fb4dc" bottom="#f6e6b8" sun={{ x: 880, y: 240, r: 80, color: "#fff2a0" }} />
      {/* stands with a crowd */}
      <rect x={-60} y={640} width={1200} height={400} fill="#8a6a4a" stroke={INK} strokeWidth={4} />
      {Array.from({ length: 5 }, (_, r) => Array.from({ length: 22 }, (_, c) => <circle key={`${r}${c}`} cx={-40 + c * 54 + (r % 2) * 27} cy={680 + r * 70 + Math.sin(frame * 0.3 + c + r) * 3} r={18} fill={["#eebf98", "#c99a78", "#e8d8a8", "#3a3a42"][(r + c) % 4]} stroke={INK} strokeWidth={2} />))}
      <rect x={-60} y={1040} width={1200} height={1200} fill="#c8a868" />
      <line x1={-60} x2={1140} y1={GY + 40} y2={GY + 40} stroke="#fff" strokeWidth={8} />
      {/* runners: back row and front row, they start when the gun fires (staggered) */}
      {Array.from({ length: 7 }, (_, i) => { const d = Math.max(0, go - i * 0.06); const x = 120 + i * 120 + d * RUN * 0.7; const run = d > 0; return <Figure key={`b${i}`} x={x} y={GY - 10} s={0.7} facing={1} A1={run ? undefined : -20} lean={run ? 10 : 18} colors={RUNR(["#c23b2c", "#2a4a8a", "#2a6a3a", "#c9a54a"][i % 4])} frame={frame + i * 4} walking={run} expression="determined" />; })}
      {Array.from({ length: 6 }, (_, i) => { const d = Math.max(0, go - i * 0.05 - 0.1); const x = 60 + i * 140 + d * RUN * 0.85; const run = d > 0; return <Figure key={`f${i}`} x={x} y={GY + 40} s={0.85} facing={1} A1={run ? undefined : -20} lean={run ? 10 : 18} colors={RUNR(["#2a4a8a", "#c23b2c", "#c9a54a", "#2a6a3a"][i % 4])} frame={frame + i * 7} walking={run} expression="determined" />; })}
      {/* the starter on the right, pistol raised; smoke when it fires */}
      <Figure x={980} y={GY + 60} s={0.95} facing={-1} A1={gunA} colors={OFFICIAL} frame={frame} expression="determined"><Boater /></Figure>
      {(() => { const p = handAt(980, GY + 60, 0.95, -1, gunA, 0); return <g><rect x={p[0] - 8} y={p[1] - 40} width={14} height={40} fill="#2a2a2a" /><Hand p={p} />{lt > tGun && <circle cx={p[0]} cy={p[1] - 60 - (lt - tGun) * 40} r={20 + (lt - tGun) * 40} fill="#efefe8" opacity={Math.max(0, 0.9 - (lt - tGun) * 0.6)} />}</g>; })()}
      <Label x={540} y={1450} lt={lt} at={0.3} text="AUG 30, 1904 · ST. LOUIS" size={38} />
    </g>
  );
};

// ---------- 4: a car passes, dust swallows the runners; a sign: WATER — MILE 12 ----------
export const SceneDust: React.FC<SP> = ({ lt, frame }) => {
  const s = 0.85, scroll = lt * RUN * s;
  const carX = interpolate(lt, [0, 2.6], [-300, 1300], cl);
  const dust = interpolate(carX, [200, 900], [0, 1], cl);
  return (
    <g>
      <Road scroll={scroll} frame={frame} />
      {/* the sign stands on the roadside and scrolls with the ground */}
      {(() => { const x = 1000 - lt * RUN * s; return <g><rect x={x - 8} y={GY - 300} width={16} height={300} fill="#6a4a2a" stroke={INK} strokeWidth={3} /><rect x={x - 120} y={GY - 330} width={240} height={90} fill="#efe2b0" stroke={INK} strokeWidth={4} /><text x={x} y={GY - 292} textAnchor="middle" fontFamily="Georgia" fontWeight={900} fontSize={30} fill={INK}>WATER</text><text x={x} y={GY - 256} textAnchor="middle" fontFamily="Georgia" fontWeight={700} fontSize={26} fill={INK}>MILE 12</text></g>; })()}
      <Figure x={380} y={GY + 40} s={s} facing={1} colors={RUNR("#2a6a3a")} frame={frame} walking expression={dust > 0.4 ? "scared" : "determined"} lean={10} />
      <Figure x={560} y={GY + 20} s={0.78} facing={1} colors={RUNR("#c9a54a")} frame={frame + 9} walking expression={dust > 0.4 ? "scared" : "determined"} lean={10} A2={dust > 0.4 ? -150 : undefined} />
      <Car x={carX} y={GY + 90} s={0.9} spin={frame * 20} color="#2a3a5a" />
      <Dust x={carX - 300} y={GY - 40} r={180 * Math.max(0.2, dust)} frame={frame} op={0.85} n={12} />
      <Dust x={480} y={GY - 120} r={260} frame={frame} op={dust * 0.7} n={12} />
      <Label x={540} y={1450} lt={lt} at={0.3} text="90°F · DUST" size={44} bg="#8a3a1a" />
    </g>
  );
};

// ---------- 5: Lorz grabs his leg, a car pulls up, he climbs in and waves ----------
export const SceneLorzCar: React.FC<SP> = ({ lt, frame }) => {
  const carX = interpolate(lt, [0, 1.0], [-400, 480], { ...cl, easing: Easing.out(Easing.cubic) });
  const tClimb = 2.4;
  const climb = interpolate(lt, [tClimb, tClimb + 0.6], [0, 1], cl);
  const drive = Math.max(0, lt - tClimb - 0.9);
  const cx = carX + drive * 300;
  const lx = climb < 1 ? 600 - climb * 160 : cx - 40;
  const ly = GY + 40 - climb * 110;
  return (
    <g>
      <Road scroll={drive * 300} frame={frame} />
      <Car x={cx} y={GY + 90} s={0.9} spin={(lt < 1 ? lt : 1) * 400 + drive * 900} color="#7a1f1f" />
      {/* driver */}
      <Figure x={cx + 70} y={GY - 40} s={0.6} facing={1} A1={-70} colors={TRAINER} frame={frame} expression="happy" />
      {/* Lorz: holds his thigh (cramp), then steps up into the back seat, then waves */}
      <Figure x={lx} y={ly} s={0.82} facing={-1} A1={lt < tClimb ? 10 : climb < 1 ? -60 : -150 + Math.sin(frame * 0.5) * 20} A2={lt < tClimb ? 5 : -40} lean={lt < tClimb ? 14 : 0} colors={LORZ} frame={frame} expression={lt < tClimb ? "sad" : "happy"}><Bib n="31" /></Figure>
      {/* car side covers his legs once seated */}
      {climb >= 1 && <path d={`M ${cx - 207} ${GY + 9} L ${cx - 207} ${GY - 81} L ${cx - 108} ${GY - 81} L ${cx - 90} ${GY - 36} L ${cx + 40} ${GY - 36} L ${cx + 40} ${GY + 9} Z`} fill="#7a1f1f" stroke={INK} strokeWidth={4} />}
      <Label x={540} y={1450} lt={lt} at={0.3} text="MILE 9: CRAMPS" size={42} />
    </g>
  );
};

// ---------- 6: the stadium cheers Lorz; a spectator points; the crowd turns ----------
export const SceneStadium: React.FC<SP> = ({ lt, frame }) => {
  const jog = Math.min(lt, 2.0);
  const lx = 120 + jog * RUN * 0.9;
  const tPoint = 3.8;
  const point = lt > tPoint;
  return (
    <g>
      <Sky top="#7fb4dc" bottom="#f6e6b8" />
      <rect x={-60} y={600} width={1200} height={460} fill="#8a6a4a" stroke={INK} strokeWidth={4} />
      {Array.from({ length: 5 }, (_, r) => Array.from({ length: 22 }, (_, c) => { const cheer = !point ? Math.abs(Math.sin(frame * 0.4 + c * 0.7 + r)) * 10 : 0; return <circle key={`${r}${c}`} cx={-40 + c * 54 + (r % 2) * 27} cy={640 + r * 80 - cheer} r={20} fill={["#eebf98", "#c99a78", "#e8d8a8", "#3a3a42"][(r + c) % 4]} stroke={INK} strokeWidth={2} />; }))}
      <rect x={-60} y={1060} width={1200} height={1000} fill="#c8a868" />
      {/* finish tape breaks when he arrives */}
      {lx < 520 ? <line x1={520} x2={520} y1={GY - 260} y2={GY - 60} stroke="#fff" strokeWidth={0} /> : null}
      <rect x={510} y={GY - 300} width={14} height={340} fill="#efefe8" stroke={INK} strokeWidth={2} />
      <Figure x={lx} y={GY + 40} s={0.95} facing={1} A1={lt > 2.0 ? -160 : undefined} A2={lt > 2.0 ? -150 : undefined} colors={LORZ} frame={frame} walking={lt < 2.0} expression={point ? "scared" : "happy"}><Bib n="31" /></Figure>
      {/* official in the foreground turns to the pointing spectator */}
      <Figure x={880} y={GY + 70} s={1.0} facing={point ? 1 : -1} A1={point ? -100 : -20} colors={{ ...OFFICIAL, coat: "#4a3a2a", coatShade: "#3a2c1e", coatLight: "#5a4a3a" }} frame={frame} expression={point ? "determined" : "happy"}><Boater /></Figure>
      {point && <g><Figure x={1010} y={GY + 30} s={0.8} facing={-1} A1={-95} colors={TRAINER} frame={frame} expression="determined" /><Label x={830} y={GY - 520} lt={lt} at={tPoint + 0.1} text="HE RODE IN A CAR!" size={34} bg="#7a1f1f" /></g>}
      <Label x={540} y={1450} lt={lt} at={0.4} text={point ? "DISQUALIFIED" : "THE \"WINNER\""} size={44} bg={point ? "#7a1f1f" : "#1f4a2a"} />
    </g>
  );
};

// ---------- 7: Hicks fading on the road, two trainers beside him (tracking) ----------
export const SceneFading: React.FC<SP> = ({ lt, frame }) => {
  const s = 1.0;
  const slow = 0.7; // he slows down: the ground scrolls slower and his stride slows
  return (
    <g>
      <Road scroll={lt * RUN * s * slow} frame={Math.round(frame * slow)} />
      <Figure x={540} y={GY + 40} s={s} facing={1} colors={HICKS} frame={Math.round(frame * slow)} walking expression="sad" lean={-4}><Bib n="20" /></Figure>
      <Figure x={330} y={GY + 20} s={0.9} facing={1} A1={-80} colors={TRAINER} frame={Math.round(frame * slow) + 6} walking expression="determined" />
      {/* sweat drops */}
      {Array.from({ length: 4 }, (_, i) => { const k = ((lt * 1.4 + i * 0.25) % 1); return <ellipse key={i} cx={560 + (i - 1.5) * 20} cy={GY - 360 + k * 120} rx={6} ry={10} fill="#9fd2f0" opacity={1 - k} />; })}
      <Label x={540} y={1450} lt={lt} at={0.3} text="THOMAS HICKS, USA" size={42} />
    </g>
  );
};

// ---------- 8: close-up: strychnine poured into egg white in a cup, then brandy ----------
export const ScenePoison: React.FC<SP> = ({ lt, frame }) => {
  const pour1 = interpolate(lt, [0.6, 1.1], [0, 1], cl), back1 = interpolate(lt, [3.4, 3.8], [0, 1], cl);
  const pour2 = interpolate(lt, [4.6, 5.1], [0, 1], cl);
  const tiltV = pour1 * (1 - back1) * 70;
  return (
    <g>
      <rect x={-60} y={0} width={1200} height={2000} fill="#c8a868" />
      <rect x={-60} y={980} width={1200} height={1200} fill="#8a6a4a" />
      {/* the cup on a crate */}
      <path d="M 430 760 L 650 760 L 620 1000 L 460 1000 Z" fill="#efe8d6" stroke={INK} strokeWidth={6} />
      <ellipse cx={540} cy={790 + (1 - pour1) * 20} rx={96} ry={18} fill="#f2e8a0" stroke={INK} strokeWidth={3} />
      {pour2 > 0 && <ellipse cx={540} cy={790} rx={96 * pour2} ry={16 * pour2} fill="#a8642a" opacity={0.7} />}
      {/* hand with the vial, tilting over the cup */}
      {lt < 4.0 && <g transform={`translate(${700} ${560}) rotate(${-tiltV})`}>
        <rect x={-30} y={-110} width={60} height={150} rx={8} fill="#8ab08a" stroke={INK} strokeWidth={5} opacity={0.9} />
        <rect x={-36} y={-60} width={72} height={50} fill="#efe8d6" stroke={INK} strokeWidth={3} />
        <text y={-28} textAnchor="middle" fontFamily="Georgia" fontWeight={900} fontSize={14} fill="#8a1f1f">STRYCHNINE</text>
        <circle cx={0} cy={60} r={46} fill="#eebf98" stroke={INK} strokeWidth={4} />
      </g>}
      {pour1 > 0.3 && back1 < 1 && Array.from({ length: 6 }, (_, i) => { const k = ((lt * 3 + i / 6) % 1); return <circle key={i} cx={640 - k * 60} cy={600 + k * 190} r={6} fill="#efefef" stroke={INK} strokeWidth={1} />; })}
      {/* brandy bottle */}
      {lt > 4.0 && <g transform={`translate(${720} ${520}) rotate(${-pour2 * 75})`}>
        <path d="M -40 -160 L 40 -160 L 40 40 L -40 40 Z" fill="#6a3a14" stroke={INK} strokeWidth={5} />
        <rect x={-14} y={-230} width={28} height={70} fill="#6a3a14" stroke={INK} strokeWidth={5} />
        <rect x={-38} y={-100} width={76} height={60} fill="#efe2b0" stroke={INK} strokeWidth={3} />
        <text y={-62} textAnchor="middle" fontFamily="Georgia" fontWeight={900} fontSize={18} fill={INK}>BRANDY</text>
        <circle cx={0} cy={70} r={50} fill="#eebf98" stroke={INK} strokeWidth={4} />
      </g>}
      {pour2 > 0.2 && <path d={`M ${640} ${640} Q ${600} ${700} ${560} ${790}`} stroke="#a8642a" strokeWidth={10} fill="none" opacity={pour2 < 1 ? 1 : 0.5} />}
      <Label x={540} y={1250} lt={lt} at={1.4} text="RAT POISON" size={58} bg="#7a1f1f" />
      <Label x={540} y={1370} lt={lt} at={2.4} text="+ EGG WHITES" size={40} /><Label x={540} y={1490} lt={lt} at={5.1} text="+ BRANDY" size={44} />
    </g>
  );
};

// ---------- 9: the Cuban runner (Andarín Carvajal) picks an apple, then naps under the tree ----------
export const SceneApples: React.FC<SP> = ({ lt, frame }) => {
  const tLie = 3.9;
  // reach up (0.2–0.9), pick, lower (1.0–1.3), lift to the mouth to eat (1.7–2.2), cramps: hand on the belly (2.8+)
  const reach = lt < 0.9 ? interpolate(lt, [0.2, 0.9], [-20, -165], cl) : lt < 1.3 ? interpolate(lt, [1.0, 1.3], [-165, -60], cl) : lt < 2.6 ? interpolate(lt, [1.7, 2.2], [-60, -150], cl) : 15;
  const tree = 360;
  const p = handAt(520, GY + 40, 0.95, -1, reach, lt > 2.8 ? 12 : 0);
  const appleOn = lt >= 0.9 && lt < 2.4;
  return (
    <g>
      <Sky top="#7fb4dc" bottom="#f6e6b8" />
      <rect x={-60} y={GY - 40} width={1200} height={1100} fill="#9aa860" />
      <rect x={tree - 30} y={GY - 520} width={60} height={560} fill="#6a4a2a" stroke={INK} strokeWidth={4} />
      <circle cx={tree} cy={GY - 640} r={300} fill="#5a7a3a" stroke={INK} strokeWidth={5} />
      {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={tree - 220 + rnd(i) * 440} cy={GY - 820 + rnd(i + 3) * 340} r={20} fill="#8a6a2a" stroke={INK} strokeWidth={3} />)}
      {lt < tLie ? <g>
        <Figure x={520} y={GY + 40} s={0.95} facing={-1} A1={reach} lean={lt > 2.8 ? 12 : 0} colors={CARVAJAL} frame={frame} expression={lt > 2.7 ? "sad" : "happy"} />
        {appleOn && <circle cx={p[0]} cy={p[1] - 10} r={20} fill="#8a6a2a" stroke={INK} strokeWidth={3} />}
        <Hand p={p} skin="#c99a78" />
      </g> : <g transform={`translate(${600} ${GY + 30}) rotate(-90)`}>
        <Figure x={0} y={0} s={0.95} facing={1} colors={CARVAJAL} frame={0} expression="sad" />
      </g>}
      {lt >= tLie && [0, 1, 2].map((i) => { const k = ((lt * 0.8 + i / 3) % 1); return <text key={i} x={560 + k * 60} y={GY - 160 - k * 160} fontFamily="Inter" fontWeight={900} fontSize={40 + k * 20} fill="#fff" stroke={INK} strokeWidth={3} opacity={1 - k}>z</text>; })}
      <Label x={540} y={1450} lt={lt} at={0.3} text={lt < 2.8 ? "ROTTEN APPLES" : lt < tLie ? "CRAMPS" : "...A NAP"} size={44} bg="#5a3a1a" />
    </g>
  );
};

// ---------- 10: a dog chases Len Tau off the road across a field ----------
const Dog: React.FC<{ x: number; y: number; s?: number; frame: number }> = ({ x, y, s = 1, frame }) => {
  const g = Math.sin(frame * 0.6);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={-80} rx={90} ry={36} fill="#6a5a4a" stroke={INK} strokeWidth={4} />
      <circle cx={90} cy={-120} r={34} fill="#6a5a4a" stroke={INK} strokeWidth={4} />
      <path d="M 110 -150 L 120 -180 L 96 -152 Z" fill="#4a3a2a" stroke={INK} strokeWidth={3} />
      <rect x={110} y={-120} width={36} height={16} rx={6} fill="#6a5a4a" stroke={INK} strokeWidth={3} />
      <circle cx={100} cy={-128} r={5} fill={INK} />
      <path d="M 120 -104 l 22 0" stroke="#fff" strokeWidth={4} />
      {[[-60, g], [-30, -g], [40, -g], [70, g]].map(([lx, k], i) => <line key={i} x1={lx} y1={-60} x2={lx + k * 28} y2={0} stroke="#4a3a2a" strokeWidth={14} strokeLinecap="round" />)}
      <path d={`M -88 -90 Q -130 ${-130 + g * 10} -150 -110`} stroke="#6a5a4a" strokeWidth={12} fill="none" strokeLinecap="round" />
    </g>
  );
};
export const SceneDog: React.FC<SP> = ({ lt, frame }) => {
  const s = 0.85;
  const rx = 300 + lt * RUN * s * 1.2, dx = 20 + lt * RUN * s * 1.28;
  return (
    <g>
      <Sky top="#7fb4dc" bottom="#f6e6b8" />
      <rect x={-60} y={GY - 300} width={1200} height={1300} fill="#a8b468" />
      {/* the road behind them, curving away: they leave it */}
      <path d="M -60 1010 Q 400 980 1140 900" stroke="#c8a868" strokeWidth={70} fill="none" />
      {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M ${rnd(i) * 1100} ${GY + rnd(i + 2) * 200} l 10 -26 l 10 26`} stroke="#6a7a3a" strokeWidth={4} fill="none" />)}
      <Figure x={rx} y={GY + 40} s={s} facing={1} colors={TAU} frame={frame} walking expression="scared" lean={12} />
      <Dog x={dx} y={GY + 50} s={0.75} frame={frame} />
      <path d={`M 160 ${GY - 260} Q 540 ${GY - 360} 920 ${GY - 260}`} stroke="#fff" strokeWidth={6} strokeDasharray="18 14" fill="none" opacity={interpolate(lt, [0.6, 1.0], [0, 1], cl)} />
      <Label x={540} y={GY - 340} lt={lt} at={0.8} text="1 MILE OFF COURSE" size={40} bg="#7a1f1f" />
      <Label x={540} y={1450} lt={lt} at={0.3} text="CHASED BY A DOG" size={44} />
    </g>
  );
};

// ---------- 11: Hicks breaks the tape; GOLD ----------
export const SceneFinish: React.FC<SP> = ({ lt, frame }) => {
  const s = 1.0;
  const hx = 330 + Math.min(lt, 1.4) * RUN * s * 0.75;
  const broke = hx > 520;
  return (
    <g>
      <Sky top="#7fb4dc" bottom="#f6e6b8" />
      <rect x={-60} y={600} width={1200} height={460} fill="#8a6a4a" stroke={INK} strokeWidth={4} />
      {Array.from({ length: 5 }, (_, r) => Array.from({ length: 22 }, (_, c) => <circle key={`${r}${c}`} cx={-40 + c * 54 + (r % 2) * 27} cy={640 + r * 80 - (broke ? Math.abs(Math.sin(frame * 0.4 + c + r)) * 12 : 0)} r={20} fill={["#eebf98", "#c99a78", "#e8d8a8", "#3a3a42"][(r + c) % 4]} stroke={INK} strokeWidth={2} />))}
      <rect x={-60} y={1060} width={1200} height={1000} fill="#c8a868" />
      {/* finish line seen from the side: far post, tape across the track at chest height, near post */}
      <rect x={548} y={GY - 380} width={12} height={360} fill="#efefe8" stroke={INK} strokeWidth={2} />
      {!broke ? <line x1={554} y1={GY - 300} x2={600} y2={GY - 230} stroke="#c62828" strokeWidth={10} />
        : <g><path d={`M 554 ${GY - 300} q 30 ${30 + Math.sin(frame * 0.5) * 10} 20 70`} stroke="#c62828" strokeWidth={9} fill="none" /><path d={`M 600 ${GY - 230} q 40 ${-10 + Math.sin(frame * 0.6) * 10} 60 40`} stroke="#c62828" strokeWidth={9} fill="none" /></g>}
      <Figure x={hx} y={GY + 40} s={s} facing={1} colors={HICKS} frame={frame} walking={lt < 1.4} expression={broke ? "happy" : "sad"} lean={lt < 1.4 ? 4 : -6} A1={lt >= 1.4 ? -160 : undefined} A2={lt >= 1.4 ? -150 : undefined}><Bib n="20" /></Figure>
      <rect x={594} y={GY - 320} width={14} height={400} fill="#efefe8" stroke={INK} strokeWidth={2} />
      <Label x={540} y={1450} lt={lt} at={0.6} text="GOLD · 3:28:53" size={46} bg="#8a6a1a" />
    </g>
  );
};
