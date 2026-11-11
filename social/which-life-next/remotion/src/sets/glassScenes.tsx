import React from "react";
import { interpolate, Easing } from "remotion";
import { Ground, Hills, Person, Sky, KEEPER, CLERK, WORKER } from "./ponyScenes";
import { Label } from "./chickenScenes";
import { KitColors, KitExpression } from "../kit/Kit";

/** Ground scenes for the Hugh Glass (1823) Short. lt = seconds since the scene started. */
const INK = "#2b1d14";
const GY = 1240;
const cl = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const pop = (lt: number, at: number, d = 0.28) => interpolate(lt, [at, at + d * 0.6, at + d], [0, 1.15, 1], cl);
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
type SP = { lt: number; dur: number; frame: number };

// ---------- characters ----------
export const GLASS: Partial<KitColors> = { coat: "#a37b4c", coatShade: "#80603a", coatLight: "#b98f5e", patch: "#8c6a40", hair: "#4a3020", cap: "#5a3d24", capShade: "#43301c", capBand: "#3a2818", scarf: "#c23b2c" };
const FITZ = WORKER;
const BRIDGER = KEEPER;
const ARMY: Partial<KitColors> = { coat: "#2b3f6b", coatShade: "#1f2e50", coatLight: "#364d80", patch: "#364d80", button: "#e0c050", scarf: "#e8e2cf", scarfShade: "#c8c0a8", cap: "#1d2a48", capShade: "#141d33", trousers: "#3a4a6a" };

export const Rifle: React.FC<{ x: number; y: number; rot?: number; s?: number; glow?: boolean }> = ({ x, y, rot = 0, s = 1, glow }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    {glow && <rect x={-160} y={-34} width={330} height={68} rx={34} fill="#ffd23f" opacity={0.35} />}
    <path d="M -150 -6 L -40 -10 L -20 6 L -150 22 Q -160 8 -150 -6 Z" fill="#7a4a22" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-40} y={-12} width={200} height={12} rx={4} fill="#3a3a3e" stroke={INK} strokeWidth={4} />
    <rect x={-30} y={0} width={120} height={9} rx={3} fill="#8a5a2a" stroke={INK} strokeWidth={3} />
    <path d="M -18 4 Q -10 22 4 6" fill="none" stroke={INK} strokeWidth={4} />
  </g>
);
const Knife: React.FC<{ x: number; y: number; rot?: number; s?: number }> = ({ x, y, rot = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-50} y={-8} width={44} height={16} rx={5} fill="#6a3f1c" stroke={INK} strokeWidth={4} />
    <path d="M -6 -9 L 60 -4 Q 72 0 60 5 L -6 9 Z" fill="#d8dde2" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
  </g>
);

/** A man lying on his back (Kit rig rotated). Head to the left. */
export const Lying: React.FC<{ x: number; y?: number; s?: number; colors?: Partial<KitColors>; expression?: KitExpression; sit?: number; wounds?: boolean }> = ({ x, y = GY + 150, s = 1, colors = GLASS, expression = "sad", sit = 0, wounds = true }) => {
  const rot = -90 + sit * 75;
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={-180 * s} cy={8} rx={230 * s} ry={20 * s} fill="#000" opacity={0.18} />
      <g transform={`rotate(${rot}) translate(0 ${-60 * s * (1 - sit)})`}>
        <Person x={0} y={0} s={s} kit={{ pose: "front", colors, expression }} />
        {wounds && <g transform={`scale(${s})`}>
          <path d="M -50 -270 L 40 -220" stroke="#efe8d6" strokeWidth={18} strokeLinecap="round" />
          <path d="M -40 -150 L 30 -190 M -30 -130 L 40 -170 M -20 -110 L 50 -150" stroke="#7a1c14" strokeWidth={6} strokeLinecap="round" />
          <path d="M -30 -60 L -30 -10" stroke="#efe8d6" strokeWidth={22} strokeLinecap="round" />
        </g>}
      </g>
    </g>
  );
};

/** Grizzly facing left. rear 0 = on four legs, 1 = standing up. Origin = hind feet. */
export const Bear: React.FC<{ x: number; y?: number; s?: number; rear?: number; walk?: number; roar?: boolean; flip?: boolean }> = ({ x, y = GY + 150, s = 1, rear = 0, walk = 0, roar, flip }) => {
  const fur = "#6b4523", dark = "#4e3017", light = "#8a5e33";
  const sw = Math.sin(walk) * 14;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx={-60} cy={4} rx={190} ry={18} fill="#000" opacity={0.2} />
      {/* hind legs */}
      <rect x={40 - sw} y={-110} width={60} height={112} rx={24} fill={dark} stroke={INK} strokeWidth={6} />
      <g transform={`rotate(${rear * 62} 60 -110)`}>
        {/* body */}
        <ellipse cx={-30} cy={-150} rx={170} ry={100} fill={fur} stroke={INK} strokeWidth={7} />
        <path d="M -60 -240 Q 10 -262 90 -220 Q 20 -200 -40 -210 Z" fill={light} opacity={0.8} />
        {/* front legs */}
        <g transform={`rotate(${rear * -40} -150 -110)`}>
          <rect x={-170 + sw} y={-120} width={58} height={122} rx={24} fill={dark} stroke={INK} strokeWidth={6} />
          {rear > 0.3 && [0, 1, 2].map((i) => <path key={i} d={`M ${-162 + sw + i * 16} 0 l -6 18`} stroke="#efe8d6" strokeWidth={5} strokeLinecap="round" />)}
        </g>
        {/* head */}
        <g transform="translate(-200 -190)">
          <circle cx={30} cy={-62} r={24} fill={fur} stroke={INK} strokeWidth={6} />
          <circle cx={-34} cy={-56} r={24} fill={fur} stroke={INK} strokeWidth={6} />
          <ellipse cx={0} cy={-10} rx={70} ry={62} fill={fur} stroke={INK} strokeWidth={7} />
          <ellipse cx={-50} cy={10} rx={38} ry={28} fill={light} stroke={INK} strokeWidth={5} />
          <ellipse cx={-78} cy={2} rx={12} ry={9} fill="#1a1a1a" />
          <circle cx={-14} cy={-30} r={7} fill="#111" />
          {roar ? <g><path d="M -84 22 Q -50 70 -14 30 Z" fill="#5a1414" stroke={INK} strokeWidth={4} /><path d="M -76 26 l 6 12 l 6 -12 M -40 34 l 6 12 l 6 -14" fill="#fff" stroke={INK} strokeWidth={2} /></g>
            : <path d="M -76 24 Q -56 32 -36 24" stroke={INK} strokeWidth={4} fill="none" />}
          <path d="M -30 -46 L 2 -36" stroke={INK} strokeWidth={6} strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
};

const Brush: React.FC<{ x: number; y?: number; s?: number; c?: string }> = ({ x, y = GY + 20, s = 1, c = "#5f7d3a" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={-50} cy={-40} rx={70} ry={50} fill={c} stroke={INK} strokeWidth={5} />
    <ellipse cx={40} cy={-60} rx={80} ry={64} fill={c} stroke={INK} strokeWidth={5} />
    <ellipse cx={0} cy={-20} rx={110} ry={36} fill={c} stroke={INK} strokeWidth={5} />
  </g>
);
const Tree: React.FC<{ x: number; y?: number; s?: number }> = ({ x, y = GY, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-16} y={-200} width={32} height={200} fill="#6a4528" stroke={INK} strokeWidth={5} />
    <ellipse cx={0} cy={-260} rx={110} ry={100} fill="#4f7034" stroke={INK} strokeWidth={6} />
    <ellipse cx={-50} cy={-220} rx={70} ry={60} fill="#5f8240" stroke={INK} strokeWidth={5} />
  </g>
);
/** Upper Missouri country: rolling grass, cottonwoods, a creek. */
export const Prairie: React.FC<{ frame: number; dusk?: boolean; scroll?: number; trees?: boolean }> = ({ frame, dusk, scroll = 0, trees = true }) => (
  <g>
    {dusk ? <Sky top="#4a3a6a" bottom="#f0a868" sun={{ x: 820, y: 900, r: 80, color: "#ffd08a" }} /> : <Sky top="#8fc4e0" bottom="#f7ecc8" sun={{ x: 240, y: 520, r: 80, color: "#fff4c4" }} clouds={3} drift={frame * 0.4} />}
    <Hills y={GY - 160} color={dusk ? "#7a6a6a" : "#a8b480"} amp={50} seed={5} scroll={scroll * 0.3} />
    <Hills y={GY - 70} color={dusk ? "#6a6a4a" : "#9cb06a"} amp={40} seed={9} scroll={scroll * 0.6} />
    <Ground color={dusk ? "#8a8a50" : "#b8c070"} tuft={dusk ? "#5a5a30" : "#7a8a3a"} scroll={scroll} />
    {trees && <><Tree x={((150 - scroll) % 1400 + 1400) % 1400 - 100} y={GY - 40} s={0.9} /><Tree x={((960 - scroll) % 1400 + 1400) % 1400 - 100} y={GY - 50} s={0.75} /></>}
  </g>
);

const Slash: React.FC<{ lt: number; at: number }> = ({ lt, at }) => {
  const k = lt - at; if (k < 0 || k > 0.5) return null;
  const o = 1 - k / 0.5;
  return <g opacity={o}>{[0, 1, 2].map((i) => <path key={i} d={`M ${300 + i * 90} ${600 + i * 30} L ${700 + i * 90} ${1100 + i * 30}`} stroke="#fff" strokeWidth={22 - k * 20} strokeLinecap="round" />)}</g>;
};
const Cross: React.FC<{ x: number; y: number; k: number }> = ({ x, y, k }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}><path d="M -90 -90 L 90 90 M 90 -90 L -90 90" stroke="#d32f2f" strokeWidth={26} strokeLinecap="round" /></g>
);

// ---------- HOOK + LOOP: Glass on the ground, two men walk off with his rifle ----------
export const SceneLeft: React.FC<SP & { loop?: boolean }> = ({ lt, frame }) => {
  const walk = Math.min(lt, 6) * 70;
  return (
    <g>
      <Prairie frame={frame} />
      <Lying x={600} y={GY + 250} s={1.0} />
      <g transform={`translate(${700 + walk} 0)`}>
        <Person x={0} y={GY + 160} s={0.82} kit={{ pose: "side", walking: true, facing: 1, colors: FITZ, expression: "neutral" }} />
        <Rifle x={10} y={GY - 100} rot={-35} s={0.75} glow />
        <Person x={180} y={GY + 150} s={0.74} kit={{ pose: "side", walking: true, facing: 1, colors: BRIDGER, expression: "sad" }} />
      </g>
    </g>
  );
};

// ---------- trapper walks, then the grizzly and two cubs ----------
export const SceneTrapper: React.FC<SP> = ({ lt, frame }) => {
  const seen = lt >= 2.3;
  const gx = seen ? 330 : 180 + lt * 65;
  const bx = interpolate(lt, [2.2, 2.9], [1250, 860], { ...cl, easing: Easing.out(Easing.cubic) });
  return (
    <g>
      <Prairie frame={frame} scroll={seen ? 2.3 * 60 : lt * 60} />
      <Brush x={980} y={GY + 40} s={1.3} />
      <Bear x={bx} y={GY + 200} s={0.95} rear={seen ? interpolate(lt, [2.9, 3.4], [0, 0.35], cl) : 0} roar={lt > 3.0} />
      <Bear x={bx + 40} y={GY + 260} s={0.38} walk={lt * 8} />
      <Bear x={bx + 200} y={GY + 240} s={0.34} walk={lt * 8 + 1} />
      <Person x={gx} y={GY + 220} s={1.0} kit={{ pose: "side", walking: !seen, facing: 1, colors: GLASS, expression: seen ? "scared" : "neutral" }} />
      <Rifle x={gx + 10} y={GY - 100} rot={-50} s={0.8} />
      <Label x={760} y={GY - 280} lt={lt} at={2.4} text="MOTHER GRIZZLY" size={46} />
      <Label x={820} y={GY - 190} lt={lt} at={3.4} text="+ 2 CUBS" size={46} />
    </g>
  );
};

// ---------- the mauling (no gore: slashes + injury labels) ----------
export const SceneMaul: React.FC<SP> = ({ lt, frame }) => {
  const shake = lt < 1.0 ? Math.sin(frame * 2.1) * 10 * (1 - lt) : 0;
  return (
    <g transform={`translate(${shake} 0)`}>
      <Prairie frame={frame} trees={false} />
      <Bear x={interpolate(lt, [1.1, 1.8], [860, 1300], cl)} y={GY + 200} s={1.25} rear={interpolate(lt, [0, 0.3, 1.0, 1.4], [0.4, 1, 1, 0], cl)} roar />
      <Lying x={620} y={GY + 250} s={1.05} expression="scared" wounds={lt > 0.5} />
      <Slash lt={lt} at={0.25} />
      <Slash lt={lt} at={0.75} />
      <Label x={330} y={GY - 40} lt={lt} at={1.55} text="NECK" size={50} />
      <Label x={470} y={GY + 60} lt={lt} at={2.55} text="BACK" size={50} />
      <Label x={720} y={GY - 60} lt={lt} at={3.55} text="BROKEN LEG" size={50} />
    </g>
  );
};

// ---------- the captain asks two men to stay; a grave is dug ----------
export const SceneCamp: React.FC<SP> = ({ lt, frame }) => {
  const leave = Math.max(0, lt - 1.2) * 160;
  const grave = interpolate(lt, [3.7, 4.2], [0, 1], cl);
  return (
    <g>
      <Prairie frame={frame} />
      {/* campfire */}
      <g transform={`translate(700 ${GY + 250})`}>
        <path d="M -50 0 L 50 -16 M -50 -16 L 50 0" stroke="#5a3a20" strokeWidth={14} strokeLinecap="round" />
        <path d={`M -30 -10 Q ${-10 + Math.sin(frame * 0.5) * 8} -100 0 -120 Q ${14 + Math.sin(frame * 0.4) * 8} -80 30 -10 Z`} fill="#f2a63b" stroke="#c0501f" strokeWidth={4} />
      </g>
      <Lying x={560} y={GY + 320} s={0.9} />
      <Person x={180 - leave} y={GY + 170} s={0.8} kit={{ pose: lt > 1.2 ? "side" : "front", walking: lt > 1.2, facing: -1, colors: CLERK, expression: "determined" }} hat="top" />
      <Person x={800} y={GY + 160} s={0.8} kit={{ pose: "front", colors: FITZ, expression: "neutral" }} />
      <Person x={960} y={GY + 150} s={0.72} kit={{ pose: "front", colors: BRIDGER, expression: "sad" }} />
      {grave > 0 && <g transform={`translate(560 ${GY + 60}) scale(${grave})`}>
        <ellipse cx={0} cy={0} rx={130} ry={34} fill="#6a4a2a" stroke={INK} strokeWidth={5} />
        <path d="M 120 -10 L 170 -180" stroke="#6a4528" strokeWidth={12} strokeLinecap="round" /><path d="M 100 -10 L 140 -10 L 130 30 L 110 30 Z" fill="#9aa0a6" stroke={INK} strokeWidth={4} />
      </g>}
      <Label x={540} y={GY - 360} lt={lt} at={2.3} text="STAY UNTIL HE DIES" size={48} />
      <Label x={540} y={GY - 270} lt={lt} at={3.8} text="THEN BURY HIM" size={48} />
    </g>
  );
};

// ---------- the two names ----------
export const SceneNames: React.FC<SP> = ({ lt, frame }) => (
  <g>
    <Prairie frame={frame} />
    <Person x={300} y={GY + 220} s={1.15} kit={{ pose: "front", colors: FITZ, expression: "neutral" }} />
    <Person x={780} y={GY + 220} s={1.0} kit={{ pose: "front", colors: BRIDGER, expression: "sad" }} />
    <Label x={300} y={GY - 330} lt={lt} at={0.15} text="JOHN FITZGERALD" size={44} />
    <Label x={780} y={GY - 300} lt={lt} at={1.7} text="A YOUNG MAN" size={44} />
    <Label x={780} y={GY - 210} lt={lt} at={3.05} text="JIM BRIDGER?" size={44} bg="#fff3c4" fg="#1d1712" stroke="#000" />
  </g>
);

// ---------- they take the rifle and knife, and leave ----------
export const SceneTheft: React.FC<SP> = ({ lt, frame }) => {
  const grab = interpolate(lt, [0.5, 1.0], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
  const walk = Math.max(0, lt - 1.6) * 260;
  const rx = 680 + grab * 40 + walk, ry = GY + 250 - grab * 330;
  return (
    <g>
      <Prairie frame={frame} />
      <Lying x={560} y={GY + 260} s={1.0} />
      <Person x={720 + walk} y={GY + 170} s={0.85} kit={{ pose: lt > 1.6 ? "side" : "front", walking: lt > 1.6, facing: 1, colors: FITZ, expression: "neutral" }} />
      <Person x={910 + walk} y={GY + 160} s={0.76} kit={{ pose: lt > 1.6 ? "side" : "front", walking: lt > 1.6, facing: 1, colors: BRIDGER, expression: "sad" }} />
      <Rifle x={rx} y={ry} rot={-35 * grab} s={0.85} glow />
      <Knife x={860 + grab * 50 + walk} y={GY + 260 - grab * 320} rot={-20 * grab} s={1.1} />
      <Label x={540} y={GY - 330} lt={lt} at={0.6} text="HIS RIFLE + KNIFE" size={48} />
    </g>
  );
};

// ---------- alone: no gun, no food ----------
export const SceneAlone: React.FC<SP> = ({ lt, frame }) => {
  const sit = interpolate(lt, [0.3, 1.1], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  return (
    <g>
      <Prairie frame={frame} dusk trees={false} />
      <Lying x={540} y={GY + 250} s={1.05} sit={sit} expression="scared" />
      <g transform={`translate(300 ${GY - 330})`} opacity={lt > 2.0 ? 1 : 0}><Rifle x={0} y={0} s={0.7} /><Cross x={0} y={0} k={pop(lt, 2.1) * 0.8} /></g>
      <g transform={`translate(780 ${GY - 330})`} opacity={lt > 3.0 ? 1 : 0}>
        <ellipse cx={0} cy={0} rx={90} ry={40} fill="#efe8d6" stroke={INK} strokeWidth={6} /><ellipse cx={0} cy={-6} rx={64} ry={24} fill="#d8cdb0" />
        <Cross x={0} y={0} k={pop(lt, 3.1) * 0.8} />
      </g>
      <Label x={300} y={GY - 180} lt={lt} at={2.1} text="NO GUN" size={46} />
      <Label x={780} y={GY - 180} lt={lt} at={3.1} text="NO FOOD" size={46} />
    </g>
  );
};

// ---------- crawling across the prairie; berries, roots, meat ----------
export const SceneCrawl: React.FC<SP> = ({ lt, frame }) => {
  const scroll = lt * 90;
  const items = [
    { at: 1.45, x: 260, el: <g>{[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={(i % 3) * 30 - 30} cy={Math.floor(i / 3) * 28} r={17} fill="#5a2a7a" stroke={INK} strokeWidth={4} />)}<path d="M 0 -20 Q 10 -50 30 -56" stroke="#3e6a2a" strokeWidth={6} fill="none" /></g>, t: "BERRIES" },
    { at: 2.25, x: 540, el: <g><path d="M -10 -40 Q 0 0 -20 50 M 0 -40 Q 20 10 30 46 M 6 -40 Q 0 20 4 56" stroke="#a07040" strokeWidth={10} fill="none" strokeLinecap="round" /><path d="M -20 -40 Q 0 -80 20 -40" fill="#5f8240" stroke={INK} strokeWidth={4} /></g>, t: "ROOTS" },
    { at: 2.95, x: 820, el: <g><ellipse cx={0} cy={0} rx={70} ry={42} fill="#b2443a" stroke={INK} strokeWidth={6} /><ellipse cx={-10} cy={-6} rx={30} ry={14} fill="#e8a090" /><path d="M 60 -10 L 110 -30" stroke="#efe8d6" strokeWidth={16} strokeLinecap="round" /></g>, t: "SCAVENGED MEAT" },
  ];
  return (
    <g>
      <Prairie frame={frame} scroll={scroll} />
      <g transform={`translate(${300 + lt * 25} ${GY + 270})`}>
        <Person x={0} y={0} s={1.0} kit={{ pose: "side", facing: 1, colors: GLASS, expression: "determined", lean: 72, walking: true }} />
      </g>
      {items.map((it, i) => lt >= it.at ? <g key={i} transform={`translate(${it.x} ${GY - 320}) scale(${pop(lt, it.at)})`}>{it.el}</g> : null)}
      {items.map((it, i) => <Label key={`l${i}`} x={it.x} y={GY - 180} lt={lt} at={it.at} text={it.t} size={i === 2 ? 36 : 42} />)}
    </g>
  );
};

/** Wooden stockade trading post. */
const Fort: React.FC<{ x: number; y?: number; s?: number }> = ({ x, y = GY + 20, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {Array.from({ length: 22 }, (_, i) => { const px = -440 + i * 40; return <path key={i} d={`M ${px} 0 L ${px} -300 L ${px + 20} -340 L ${px + 40} -300 L ${px + 40} 0 Z`} fill={i % 2 ? "#8a5a32" : "#9a6a3a"} stroke={INK} strokeWidth={4} />; })}
    <rect x={-90} y={-230} width={180} height={230} fill="#4e3018" stroke={INK} strokeWidth={6} />
    <rect x={260} y={-470} width={120} height={180} fill="#9a6a3a" stroke={INK} strokeWidth={5} /><path d="M 240 -470 L 320 -540 L 400 -470 Z" fill="#6a4020" stroke={INK} strokeWidth={5} />
    <path d="M -300 -340 L -300 -560" stroke={INK} strokeWidth={8} /><rect x={-300} y={-560} width={110} height={66} fill="#c62828" stroke={INK} strokeWidth={4} />
  </g>
);
export const SceneFort: React.FC<SP> = ({ lt, frame }) => (
  <g>
    <Prairie frame={frame} trees={false} />
    <Fort x={600} y={GY + 30} s={1.0} />
    <Person x={120 + lt * 160} y={GY + 230} s={0.95} kit={{ pose: "side", walking: true, facing: 1, colors: GLASS, expression: "determined" }} />
    <Label x={600} y={GY - 600} lt={lt} at={0.1} text="FORT KIOWA" size={50} />
  </g>
);
export const SceneForgive: React.FC<SP> = ({ lt, frame }) => (
  <g>
    <Prairie frame={frame} />
    <Person x={380} y={GY + 230} s={1.0} kit={{ pose: "side", facing: 1, colors: GLASS, expression: "neutral" }} />
    <Person x={680} y={GY + 220} s={0.88} kit={{ pose: "side", facing: -1, colors: BRIDGER, expression: lt > 0.6 ? "happy" : "sad" }} />
    <Label x={540} y={GY - 360} lt={lt} at={0.45} text="FORGIVEN" size={60} bg="#fff3c4" fg="#1d1712" stroke="#000" />
  </g>
);

// ---------- Fitzgerald in the army; Glass takes his rifle back ----------
export const SceneArmy: React.FC<SP> = ({ lt, frame }) => {
  const enter = interpolate(lt, [1.6, 2.6], [-300, 330], { ...cl, easing: Easing.out(Easing.cubic) });
  const take = interpolate(lt, [3.0, 3.5], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
  return (
    <g>
      <Prairie frame={frame} trees={false} />
      <Fort x={760} y={GY - 40} s={0.7} />
      <Person x={760} y={GY + 220} s={1.0} kit={{ pose: "front", colors: ARMY, expression: take > 0.5 ? "scared" : "neutral" }} />
      <Person x={enter} y={GY + 230} s={1.0} kit={{ pose: "side", walking: lt > 1.6 && lt < 2.6, facing: 1, colors: GLASS, expression: "determined" }} />
      <Rifle x={760 - take * 400} y={GY - 120 - take * 60} rot={take * -40} s={0.85} glow={take > 0.5} />
      <Label x={760} y={GY - 360} lt={lt} at={1.35} text="U.S. ARMY" size={50} />
      <Label x={360} y={GY - 360} lt={lt} at={3.4} text="RIFLE BACK" size={50} bg="#fff3c4" fg="#1d1712" stroke="#000" />
    </g>
  );
};

export const _unused = rnd;
