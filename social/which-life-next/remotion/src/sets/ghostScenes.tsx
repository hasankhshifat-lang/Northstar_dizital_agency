import React from "react";
import { interpolate, Easing } from "remotion";
import { Kit } from "../kit/Kit";
import { Ground, Hills, Person, Sky, SUIT, KEEPER, CLERK, WORKER, TOWN } from "./ponyScenes";

/** Ground scenes for the Ghost Army Short (same vertical scene system as ponyScenes). lt = seconds since the scene started. */
const INK = "#2b1d14";
const W = 1080, GY = 1240;
const cl = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const pop = (lt: number, at: number, d = 0.28) => interpolate(lt, [at, at + d * 0.6, at + d], [0, 1.15, 1], cl);
type SP = { lt: number; dur: number; frame: number };

const Label: React.FC<{ x: number; y: number; lt: number; at: number; text: string; size?: number; bg?: string; fg?: string; stroke?: string }> = ({ x, y, lt, at, text, size = 40, bg = "#1b140d", fg = "#fff", stroke = "#f2b84b" }) => {
  if (lt < at) return null;
  const w = text.length * size * 0.62 + 40;
  return (
    <g transform={`translate(${x} ${y}) scale(${pop(lt, at)})`}>
      <rect x={-w / 2} y={-size - 6} width={w} height={size + 26} rx={14} fill={bg} stroke={stroke} strokeWidth={5} />
      <text y={4} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={size} fill={fg}>{text}</text>
    </g>
  );
};

// ---------- the rubber tank ----------
/** An inflatable decoy tank. k = inflation 0..1 (1 = full); wob = jelly wobble amount. Origin = bottom centre. */
export const Tank: React.FC<{ x: number; y: number; s?: number; k?: number; wob?: number; flip?: boolean; color?: string; ghost?: boolean }> = ({ x, y, s = 1, k = 1, wob = 0, flip, color = "#6f7d3c", ghost }) => {
  const sy = (0.12 + 0.88 * Easing.out(Easing.cubic)(k)) * (1 + wob * 0.07), sx = (0.7 + 0.3 * k) * (1 - wob * 0.05);
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s * sx : s * sx} ${s * sy})`} opacity={ghost ? 0.55 : 1}>
      <rect x={-205} y={-74} width={410} height={74} rx={37} fill="#2c2c2c" stroke={INK} strokeWidth={5} />
      {[-150, -75, 0, 75, 150].map((cx) => <circle key={cx} cx={cx} cy={-37} r={26} fill="#4a4a4a" stroke={INK} strokeWidth={4} />)}
      <path d="M -190 -66 L -150 -140 Q 0 -150 150 -140 L 196 -66 Z" fill={color} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <rect x={-84} y={-214} width={168} height={84} rx={36} fill={color} stroke={INK} strokeWidth={6} />
      <rect x={70} y={-180} width={210} height={26} rx={13} fill={color} stroke={INK} strokeWidth={5} />
      <rect x={268} y={-186} width={30} height={38} rx={10} fill="#4d5a29" stroke={INK} strokeWidth={4} />
      <text x={-6} y={-88} textAnchor="middle" fontSize={64} fill="#f4efe2" stroke={INK} strokeWidth={3} fontFamily="Inter" fontWeight={900}>★</text>
      <path d="M -150 -118 Q -60 -128 20 -118" stroke="#fff" strokeWidth={9} strokeLinecap="round" opacity={0.35} fill="none" />
      <ellipse cx={-30} cy={-190} rx={36} ry={11} fill="#fff" opacity={0.4} />
      <path d="M -170 -76 Q -140 -100 -110 -76 M 120 -78 Q 150 -104 178 -78" stroke={INK} strokeWidth={3} fill="none" opacity={0.45} />
      <rect x={-216} y={-52} width={22} height={16} rx={6} fill="#d9d2c0" stroke={INK} strokeWidth={3} />
    </g>
  );
};

const Puff: React.FC<{ x: number; y: number; frame: number; n?: number; color?: string }> = ({ x, y, frame, n = 5, color = "#fff" }) => (
  <g>{Array.from({ length: n }, (_, i) => { const k = (frame * 0.06 + i / n) % 1; return <circle key={i} cx={x - k * 120} cy={y - k * 70} r={10 + k * 26} fill={color} opacity={0.7 * (1 - k)} />; })}</g>
);

const Soldier: React.FC<{ x: number; y?: number; s?: number; facing?: 1 | -1; walking?: boolean; colors?: object; expr?: "neutral" | "happy" | "scared" | "determined" | "sad"; bob?: number; pose?: "side" | "front" | "back" }> = ({ x, y = GY + 230, s = 0.9, facing = 1, walking, colors = WORKER, expr = "determined", bob = 0, pose = "side" }) => (
  <g transform={`translate(${x} ${y + bob}) scale(${s})`}><Kit pose={pose} facing={facing} walking={walking} colors={colors as never} expression={expr} /></g>
);

const OLIVE = { coat: "#6a7240", coatShade: "#545b31", coatLight: "#7b8450", scarf: "#c9b27a", scarfShade: "#a89358", hair: "#3a2a1e", patch: "#7b8450", trousers: "#5b5a3e", trousersShade: "#46452f" };

/** HOOK + LOOP: a soldier next to a jiggling rubber tank. */
export const SceneRubberTank: React.FC<SP & { loop?: boolean }> = ({ lt, frame, loop }) => {
  const wob = Math.exp(-((lt % 1.6) * 3)) * Math.sin((lt % 1.6) * 22) + (loop && lt > 2 ? 0 : 0);
  return (
    <g>
      <Sky top="#8fb8d0" bottom="#f4e6c0" sun={{ x: 820, y: 700, r: 90, color: "#fff4c4" }} clouds={3} drift={frame * 0.4} />
      <Hills y={GY - 200} color="#a9b27a" amp={140} wave={420} seed={3} />
      <Hills y={GY - 60} color="#8c9a5a" amp={90} wave={300} seed={6} />
      <Ground color="#9aa862" tuft="#6b7a35" />
      <Tank x={560} y={GY + 120} s={1.6} wob={wob} />
      <Puff x={236} y={GY + 60} frame={frame} />
      <Soldier x={120} y={GY + 170} s={1.05} facing={1} colors={OLIVE} expr="happy" />
      <Label x={540} y={880} lt={lt} at={0.5} text="INFLATABLE DECOY" size={44} />
    </g>
  );
};

/** artists painting a tank on canvas */
export const SceneStudio: React.FC<SP> = ({ lt, frame }) => {
  const prog = interpolate(lt, [0.3, 2.3], [0, 1], cl);
  return (
    <g>
      <rect width={W} height={2300} fill="#7a6a58" />
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={i * 100} width={50} height={2300} fill="#000" opacity={0.05} />)}
      <rect y={1420} width={W} height={900} fill="#5a4636" />
      {/* easel + canvas */}
      <g transform="translate(640 1000)">
        <path d="M -150 420 L -20 -140 M 150 420 L 20 -140 M 0 420 L 0 -60" stroke="#4a2f1c" strokeWidth={22} strokeLinecap="round" />
        <rect x={-260} y={-300} width={520} height={400} fill="#f4efe2" stroke={INK} strokeWidth={8} />
        <g transform="translate(0 -60) scale(0.9)" opacity={0.95}>
          <Tank x={0} y={90} s={0.9} k={prog} color="#6f7d3c" />
        </g>
        <rect x={-260} y={-300} width={520} height={400} fill="none" stroke="#9a6a3a" strokeWidth={14} />
      </g>
      <Person x={300} y={1560} s={1.2} kit={{ colors: { ...CLERK, coat: "#8a3a2a", coatShade: "#6a2c20", coatLight: "#a04634", cap: "#2b2b2b" }, expression: "happy" }} bob={Math.sin(frame * 0.3) * 3} />
      {/* brush + palette */}
      <g transform={`translate(430 ${1200 + Math.sin(frame * 0.4) * 14}) rotate(-35)`}><rect width={150} height={14} rx={7} fill="#c9a227" stroke={INK} strokeWidth={3} /><rect x={140} width={34} height={14} rx={5} fill="#c62828" stroke={INK} strokeWidth={3} /></g>
      <Label x={300} y={1000} lt={lt} at={1.1} text="ARTISTS" size={44} />
    </g>
  );
};

/** painter / designer / radio man */
export const SceneRoster: React.FC<SP> = ({ lt, frame }) => (
  <g>
    <rect width={W} height={2300} fill="#6d5f4e" />
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x={i * 100} width={50} height={2300} fill="#000" opacity={0.05} />)}
    <rect y={1400} width={W} height={900} fill="#4e3d2f" />
    {/* painter: easel */}
    <g transform="translate(200 1560)">
      <Person x={0} y={0} s={0.95} kit={{ colors: { ...WORKER, cap: "#2b2b2b" }, expression: "happy" }} bob={Math.sin(frame * 0.3) * 3} />
      <rect x={-130} y={-440} width={120} height={150} fill="#f4efe2" stroke={INK} strokeWidth={6} />
      <rect x={-110} y={-380} width={80} height={30} rx={10} fill="#6f7d3c" stroke={INK} strokeWidth={3} /><rect x={-70} y={-398} width={36} height={24} rx={8} fill="#6f7d3c" stroke={INK} strokeWidth={3} />
    </g>
    {/* designer: drafting table + plans */}
    <g transform="translate(540 1560)">
      <Person x={0} y={0} s={0.95} kit={{ colors: TOWN[0], expression: "determined" }} bob={Math.sin(frame * 0.3 + 1) * 3} />
      <g transform="translate(0 -220) rotate(-6)"><rect x={-150} y={-60} width={300} height={170} fill="#2b4a7a" stroke={INK} strokeWidth={6} /><path d="M -110 40 L -50 -20 L 20 30 L 90 -30" stroke="#fff" strokeWidth={5} fill="none" /><rect x={-90} y={60} width={180} height={10} fill="#fff" opacity={0.6} /></g>
    </g>
    {/* radio man: headset + set */}
    <g transform="translate(880 1560)">
      <Person x={0} y={0} s={0.95} kit={{ colors: { ...KEEPER, coat: "#4a5a3a", coatShade: "#38462b", coatLight: "#5a6c48" }, expression: "neutral" }} bob={Math.sin(frame * 0.3 + 2) * 3} />
      <path d="M -62 -330 Q 0 -400 62 -330" stroke="#1b1b1e" strokeWidth={12} fill="none" /><circle cx={-62} cy={-322} r={20} fill="#1b1b1e" /><circle cx={62} cy={-322} r={20} fill="#1b1b1e" />
      <g transform="translate(-20 -160)"><rect x={-110} y={-70} width={220} height={140} rx={14} fill="#3b4a2e" stroke={INK} strokeWidth={6} /><circle cx={-50} cy={0} r={34} fill="#d9d2c0" stroke={INK} strokeWidth={4} /><rect x={20} y={-30} width={70} height={14} fill="#f2b84b" /><rect x={20} y={0} width={50} height={14} fill="#f2b84b" /></g>
    </g>
    <Label x={200} y={930} lt={lt} at={1.7} text="PAINTERS" size={40} />
    <Label x={540} y={930} lt={lt} at={2.56} text="DESIGNERS" size={40} />
    <Label x={880} y={930} lt={lt} at={3.45} text="RADIO MEN" size={40} />
  </g>
);

/** inflating a decoy tank */
export const SceneInflate: React.FC<SP> = ({ lt, frame }) => {
  const k = interpolate(lt, [0.5, 2.6], [0, 1], cl);
  return (
    <g>
      <Sky top="#7fa6c4" bottom="#f1e2b8" clouds={2} drift={frame * 0.4} />
      <Hills y={GY - 180} color="#a9b27a" amp={130} wave={400} seed={4} />
      <Ground color="#9aa862" tuft="#6b7a35" />
      <Tank x={620} y={GY + 120} s={1.7} k={k} wob={k > 0.95 ? Math.sin(lt * 14) * Math.exp(-(lt - 2.6) * 2) : 0} />
      {/* compressor + hose */}
      <g transform={`translate(110 ${GY + 150})`}>
        <rect x={-90} y={-130} width={180} height={130} rx={16} fill="#8a3a2a" stroke={INK} strokeWidth={6} />
        <circle cx={0} cy={-80} r={34} fill="#f4efe2" stroke={INK} strokeWidth={4} /><path d={`M 0 -80 L ${24 * Math.cos(k * 3)} ${-80 - 24 * Math.sin(k * 3)}`} stroke="#c62828" strokeWidth={6} />
        <circle cx={-50} cy={6} r={22} fill="#2c2c2c" /><circle cx={50} cy={6} r={22} fill="#2c2c2c" />
        <path d="M 90 -40 Q 220 20 330 -20" stroke="#1b1b1e" strokeWidth={14} fill="none" strokeLinecap="round" />
      </g>
      {k > 0 && k < 1 && <Puff x={440} y={GY + 100} frame={frame} />}
      <Soldier x={900} y={GY + 180} s={1.1} facing={-1} colors={OLIVE} expr="happy" />
      <Label x={540} y={880} lt={lt} at={0.5} text="BLOWN UP WITH AIR" size={42} />
    </g>
  );
};

/** four men carry a tank */
export const SceneCarry: React.FC<SP> = ({ lt, frame }) => {
  const bobT = Math.sin(frame * 0.45) * 6;
  return (
    <g>
      <Sky top="#7fa6c4" bottom="#f1e2b8" clouds={2} drift={frame * 0.4} />
      <Hills y={GY - 180} color="#a9b27a" amp={130} wave={400} seed={7} />
      <Ground color="#9aa862" tuft="#6b7a35" />
      <Tank x={540} y={GY - 110 + bobT} s={1.15} />
      {[250, 420, 640, 810].map((x, i) => <Soldier key={i} x={x} y={GY + 190} s={0.85} facing={1} walking colors={i % 2 ? OLIVE : { ...OLIVE, coat: "#7a6a40", coatShade: "#5e5230", coatLight: "#8b7b4e" }} expr="determined" bob={Math.sin(frame * 0.45 + i) * 3} />)}
      <Label x={540} y={760} lt={lt} at={0.15} text="A FEW MEN CAN CARRY IT" size={40} />
    </g>
  );
};

/** night: a whole fake tank column inflates */
export const SceneNightColumn: React.FC<SP> = ({ lt, frame }) => {
  const tanks = [[300, 1250, 0.8, 0.3], [740, 1250, 0.8, 0.6], [200, 1380, 1.0, 0.9], [610, 1380, 1.0, 1.2], [960, 1370, 0.9, 1.5], [420, 1510, 1.15, 1.8]];
  return (
    <g>
      <Sky top="#0b1730" bottom="#2a3d63" stars moon />
      <Hills y={GY - 160} color="#1f2e4a" amp={110} wave={400} seed={2} />
      <Ground color="#2d3a2e" tuft="#1d2a1f" />
      {tanks.map(([x, y, s, at], i) => <Tank key={i} x={x} y={y} s={s} k={interpolate(lt, [at, at + 0.9], [0, 1], cl)} color="#3f4a28" />)}
      <Label x={540} y={880} lt={lt} at={2.3} text="A FAKE TANK COLUMN" size={42} />
    </g>
  );
};

/** giant speakers blast engine and marching sounds */
export const SceneSpeakers: React.FC<SP> = ({ lt, frame }) => (
  <g>
    <Sky top="#0b1730" bottom="#2a3d63" stars moon />
    <Hills y={GY - 160} color="#1f2e4a" amp={110} wave={400} seed={5} />
    <Ground color="#2d3a2e" tuft="#1d2a1f" />
    {/* truck with horns */}
    <g transform={`translate(380 ${GY + 170}) scale(1.5)`}>
      <rect x={-200} y={-130} width={300} height={110} rx={10} fill="#4a5a3a" stroke={INK} strokeWidth={5} />
      <path d="M 100 -130 L 170 -130 L 200 -70 L 200 -20 L 100 -20 Z" fill="#56683f" stroke={INK} strokeWidth={5} />
      <rect x={120} y={-118} width={50} height={44} fill="#9fd2f0" stroke={INK} strokeWidth={4} />
      <circle cx={-120} cy={-6} r={30} fill="#222" stroke={INK} strokeWidth={4} /><circle cx={140} cy={-6} r={30} fill="#222" stroke={INK} strokeWidth={4} />
      {[-150, -60].map((x) => <g key={x} transform={`translate(${x} -150)`}><path d="M 0 0 L 90 -50 L 90 50 Z" fill="#c9c9c9" stroke={INK} strokeWidth={5} transform="translate(0 -10) rotate(-12)" /><rect x={-30} y={-24} width={34} height={50} fill="#3a3a3a" stroke={INK} strokeWidth={4} /></g>)}
    </g>
    {/* sound rings */}
    {Array.from({ length: 5 }, (_, i) => { const k = (lt * 0.8 + i / 5) % 1; return <circle key={i} cx={560} cy={GY + 20} r={80 + k * 520} fill="none" stroke="#bfe9ff" strokeWidth={10 * (1 - k) + 2} opacity={0.8 * (1 - k)} />; })}
    <Label x={380} y={760} lt={lt} at={0.64} text="GIANT SPEAKERS" size={40} />
    <Label x={780} y={860} lt={lt} at={3.2} text="ENGINES" size={44} bg="#c62828" stroke="#fff" />
    <Label x={700} y={960} lt={lt} at={3.9} text="MARCHING TROOPS" size={40} bg="#c62828" stroke="#fff" />
    {/* tiny tank icon marching across the horizon (sound only) */}
    <Tank x={interpolate(lt, [0, 5], [1300, -300])} y={GY - 60} s={0.35} ghost color="#8fb6d6" />
  </g>
);

/** an observer on the far bank scans fake tanks through binoculars */
export const SceneObserver: React.FC<SP> = ({ lt, frame }) => (
  <g>
    <Sky top="#9db2c4" bottom="#e5d9be" clouds={3} drift={frame * 0.3} />
    <Hills y={GY - 200} color="#8f9a6a" amp={120} wave={450} seed={9} />
    <Ground color="#8c9a5a" tuft="#6b7a35" />
    {/* the river strip */}
    <path d={`M 0 ${GY + 60} Q 270 ${GY + 30} 540 ${GY + 60} T 1080 ${GY + 60} L 1080 ${GY + 190} Q 810 ${GY + 220} 540 ${GY + 190} T 0 ${GY + 190} Z`} fill="#4a8fa0" stroke={INK} strokeWidth={5} />
    {[300, 560, 820].map((x, i) => <Tank key={i} x={x} y={GY + 40} s={0.38} color="#6f7d3c" />)}
    <Soldier x={300} y={GY + 190} s={1.3} pose="back" colors={{ coat: "#6e7078", coatShade: "#55565c", coatLight: "#80828a", scarf: "#cfcfcf", cap: "#3a3a3d", capShade: "#262629" }} />
    {/* binocular view */}
    <g transform={`translate(780 ${GY + 120})`}>
      <circle cx={-70} r={110} fill="#101820" stroke="#000" strokeWidth={10} opacity={0.92} /><circle cx={70} r={110} fill="#101820" stroke="#000" strokeWidth={10} opacity={0.92} />
      <g transform="translate(-70 0) scale(0.9)"><Tank x={0} y={70} s={0.45} /></g>
      <g transform="translate(70 0) scale(0.9)"><Tank x={0} y={70} s={0.45} /></g>
    </g>
    <Label x={780} y={GY - 130} lt={lt} at={1.5} text="WRONG PLACE!" size={44} bg="#c62828" stroke="#fff" />
  </g>
);

/** TOP SECRET → DECLASSIFIED */
export const SceneSecret: React.FC<SP> = ({ lt }) => {
  const year = Math.round(interpolate(lt, [0.6, 3.5], [1945, 1996], cl));
  const stamp = lt >= 3.55 ? "DECLASSIFIED" : "TOP SECRET";
  const at = lt >= 3.55 ? 3.55 : 0.35;
  const hit = interpolate(lt, [at, at + 0.12, at + 0.3], [2.2, 1, 1], cl);
  return (
    <g>
      <rect width={W} height={2300} fill="#4d5560" />
      <rect y={1300} width={W} height={1000} fill="#3c2f26" stroke={INK} strokeWidth={6} />
      {/* folder */}
      <g transform="translate(540 1000) rotate(-4)">
        <rect x={-330} y={-250} width={660} height={500} rx={14} fill="#d9b16a" stroke={INK} strokeWidth={8} />
        <rect x={-330} y={-290} width={240} height={50} rx={10} fill="#c9a05a" stroke={INK} strokeWidth={6} />
        <text y={-120} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={700} fontSize={54} fill={INK}>23rd HEADQUARTERS</text>
        <text y={-56} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={700} fontSize={54} fill={INK}>SPECIAL TROOPS</text>
        <g transform={`translate(0 90) rotate(-8) scale(${hit})`} opacity={lt >= at ? 1 : 0}>
          <rect x={-260} y={-60} width={520} height={110} rx={10} fill="none" stroke={lt >= 3.55 ? "#2e7d32" : "#c62828"} strokeWidth={10} />
          <text y={26} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={lt >= 3.55 ? 62 : 76} fill={lt >= 3.55 ? "#2e7d32" : "#c62828"}>{stamp}</text>
        </g>
      </g>
      <g transform="translate(540 480)"><rect x={-190} y={-90} width={380} height={170} rx={18} fill="#1b140d" stroke="#f2b84b" strokeWidth={7} /><text y={40} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={700} fontSize={130} fill="#ffd23f">{lt >= 0.6 ? year : 1945}</text></g>
    </g>
  );
};

/** Congressional Gold Medal */
export const SceneMedal: React.FC<SP> = ({ lt, frame }) => {
  const sw = Math.sin(frame * 0.12) * 6;
  const sc = pop(lt, 0.2, 0.5);
  return (
    <g>
      <rect width={W} height={2300} fill="#2b3a5a" />
      {Array.from({ length: 13 }, (_, i) => <rect key={i} y={i * 110} width={W} height={55} fill="#a82d2d" opacity={0.35} />)}
      <rect width={440} height={720} fill="#1d2a4a" opacity={0.7} />
      {Array.from({ length: 20 }, (_, i) => <text key={i} x={30 + (i % 4) * 100} y={90 + Math.floor(i / 4) * 130} fontSize={60} fill="#fff" opacity={0.7} fontFamily="Inter">★</text>)}
      <g transform={`translate(540 560) rotate(${sw}) scale(${sc})`}>
        <path d="M -80 -520 L -40 -140 L 40 -140 L 80 -520 Z" fill="#2b4a9a" stroke={INK} strokeWidth={6} />
        <path d="M -30 -520 L -10 -140 L 10 -140 L 30 -520 Z" fill="#c62828" />
        <circle r={190} fill="#ffcf4a" stroke={INK} strokeWidth={10} />
        <circle r={150} fill="none" stroke="#b8861b" strokeWidth={8} />
        <text y={64} textAnchor="middle" fontSize={210} fill="#b8861b" stroke={INK} strokeWidth={5} fontFamily="Inter" fontWeight={900}>★</text>
        <ellipse cx={-70} cy={-90} rx={46} ry={20} fill="#fff" opacity={0.4} transform="rotate(-30)" />
      </g>
      <Person x={250} y={1500} s={1.1} kit={{ colors: SUIT, expression: "happy" }} />
      <Person x={830} y={1500} s={1.1} kit={{ colors: { ...SUIT, coat: "#3b4a6e", coatShade: "#2c3856", coatLight: "#4c5c82" }, expression: "happy" }} />
      <Label x={540} y={1100} lt={lt} at={2.2} text="CONGRESSIONAL GOLD MEDAL" size={40} bg="#1b140d" />
    </g>
  );
};
