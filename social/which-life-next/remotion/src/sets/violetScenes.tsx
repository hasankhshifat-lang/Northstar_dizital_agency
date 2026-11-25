import React from "react";
import { interpolate, Easing } from "remotion";
import { Person, Sky } from "./ponyScenes";
import { Label, Chicken } from "./chickenScenes";
import { Lying } from "./glassScenes";
import { handAt } from "./madridScenes";
import { KitColors } from "../kit/Kit";

/**
 * Ground scenes for "She Survived the Titanic and Both Its Sister Ships" (Violet Jessop: Olympic 1911, Titanic 1912, Britannic 1916).
 * lt = seconds since the scene started. Kit side pose: feet at (0,0), shoulder pivot (0,-284), straight-arm hand = handAt().
 * Scenes are drawn at GY and shifted −130 px by the story. Storyboard: social/scripts/violet-jessop-2026-11-18.md.
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

// ---------- people (1910s) ----------
const hair = (h: string): Partial<KitColors> => ({ hair: h, capStyle: "hair" } as Partial<KitColors>);
/** Violet as a White Star stewardess: dark dress, white collar (apron drawn with the skirt) */
export const VIOLET: Partial<KitColors> = { coat: "#2a2d3a", coatShade: "#1e2029", coatLight: "#3a3e4e", patch: "#3a3e4e", scarf: "#f4f0e6", scarfShade: "#d8d2c4", trousers: "#2a2d3a", trousersShade: "#1e2029", button: "#f4f0e6", ...hair("#4a2c1a") };
/** Violet as a VAD nurse on HMHS Britannic: whites, red-cross button */
export const NURSE: Partial<KitColors> = { coat: "#f2efe6", coatShade: "#d6d0c2", coatLight: "#ffffff", patch: "#d6d0c2", scarf: "#f2efe6", scarfShade: "#d6d0c2", trousers: "#f2efe6", trousersShade: "#d6d0c2", button: "#c62828", ...hair("#4a2c1a") };
const VIOLET_LATER: Partial<KitColors> = { ...VIOLET, ...hair("#7a6656") };
const VIOLET_OLD: Partial<KitColors> = { coat: "#6a5a4a", coatShade: "#55483a", coatLight: "#7c6a58", patch: "#7c6a58", scarf: "#e8e0cc", scarfShade: "#cfc6b0", trousers: "#6a5a4a", trousersShade: "#55483a", button: "#e8e0cc", ...hair("#d0ccc4") };
const OFFICER: Partial<KitColors> = { coat: "#1e2433", coatShade: "#151a26", coatLight: "#2a3244", patch: "#2a3244", scarf: "#f4f0e6", scarfShade: "#d8d2c4", trousers: "#1e2433", trousersShade: "#151a26", button: "#d6b04a", cap: "#f4f4f0", capShade: "#d8d8d0", capBand: "#1e2433", hair: "#3a2a1e" };
const SAILOR: Partial<KitColors> = { coat: "#2e3a52", coatShade: "#222b3e", coatLight: "#3a4862", patch: "#3a4862", scarf: "#e8e4da", scarfShade: "#c8c4ba", trousers: "#2e3a52", trousersShade: "#222b3e", button: "#888", cap: "#2e3a52", capShade: "#222b3e", capBand: "#111", hair: "#3a2a1e" };
const PASSENGER_W: Partial<KitColors> = { coat: "#6a4a5a", coatShade: "#563a48", coatLight: "#7c5a6c", patch: "#7c5a6c", scarf: "#e8e0cc", scarfShade: "#cfc6b0", trousers: "#6a4a5a", trousersShade: "#563a48", button: "#e8e0cc", ...hair("#2a1a12") };
const MOTHER: Partial<KitColors> = { coat: "#4a5a6e", coatShade: "#3a485a", coatLight: "#5a6c82", patch: "#5a6c82", scarf: "#e8e0cc", scarfShade: "#cfc6b0", trousers: "#4a5a6e", trousersShade: "#3a485a", button: "#e8e0cc", ...hair("#6a4020") };
const SOLDIER: Partial<KitColors> = { coat: "#8a7a52", coatShade: "#6e6040", coatLight: "#9c8c62", patch: "#9c8c62", scarf: "#8a7a52", trousers: "#7a6c46", trousersShade: "#625636", hair: "#5a3e24" };
const GENT: Partial<KitColors> = { coat: "#c8bca4", coatShade: "#aa9e86", coatLight: "#d8ccb4", patch: "#aa9e86", scarf: "#7a2a2a", scarfShade: "#5a1e1e", trousers: "#c8bca4", trousersShade: "#aa9e86", button: "#888", cap: "#d8c890", capShade: "#b8a870", capBand: "#3a2a1e", hair: "#5a3e24" };

/** skirt over the Kit legs (side pose) at the figure's feet; apron = stewardess apron on the front */
const Skirt: React.FC<{ x: number; y: number; s: number; color: string; shade: string; lean?: number; apron?: boolean; facing?: 1 | -1 }> = ({ x, y, s, color, shade, lean = 0, apron, facing = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${lean}) scale(${s})`}>
    <path d="M -44 -176 L 44 -176 L 64 -62 Q 0 -50 -64 -62 Z" fill={color} stroke={INK} strokeWidth={4 / s} />
    <path d="M 6 -170 L 22 -60" stroke={shade} strokeWidth={6} />
    {apron && <path d={facing === 1 ? "M 4 -176 L 42 -176 L 56 -64 L 10 -58 Z" : "M -4 -176 L -42 -176 L -56 -64 L -10 -58 Z"} fill="#f4f0e6" stroke={INK} strokeWidth={3 / s} />}
  </g>
);
/** red cross on a nurse's chest (side pose) */
const Cross: React.FC<{ x: number; y: number; s: number; facing: 1 | -1 }> = ({ x, y, s, facing }) => (
  <g transform={`translate(${x + facing * 18 * s} ${y - 236 * s}) scale(${s})`}>
    <rect x={-13} y={-13} width={26} height={26} fill="#fff" stroke={INK} strokeWidth={2} />
    <rect x={-3.5} y={-10} width={7} height={20} fill="#c62828" /><rect x={-10} y={-3.5} width={20} height={7} fill="#c62828" />
  </g>
);

// ---------- props ----------
/** baby wrapped in a blanket, face toward +x */
const Bundle: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = -10 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={44} ry={26} fill="#f2ead8" stroke={INK} strokeWidth={4} />
    <path d="M -30 -10 Q 0 6 30 -12" stroke="#d8ccb0" strokeWidth={4} fill="none" />
    <circle cx={26} cy={-6} r={15} fill="#f4c8a4" stroke={INK} strokeWidth={3} />
    <path d="M 12 -16 Q 26 -30 42 -12" fill="#f2ead8" stroke={INK} strokeWidth={3} />
  </g>
);
/** sea from y down; crest lines drift */
const Sea: React.FC<{ y: number; frame: number; c1: string; c2: string; crest?: string; amp?: number; rows?: number }> = ({ y, frame, c1, c2, crest = "#ffffff", amp = 8, rows = 7 }) => {
  const id = `sea${c1}${c2}`.replace(/#/g, "");
  return (
    <g>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c1} /><stop offset="1" stopColor={c2} /></linearGradient></defs>
      <rect x={-60} y={y} width={1200} height={2300 - y} fill={`url(#${id})`} />
      {Array.from({ length: rows }, (_, i) => {
        const yy = y + 18 + i * i * 14 + i * 22, ph = frame * (0.05 + i * 0.01) + i * 1.7;
        const pts = Array.from({ length: 25 }, (_, k) => `${-60 + k * 50} ${yy + Math.sin(k * 0.9 + ph) * amp * (1 + i * 0.25)}`).join(" L ");
        return <path key={i} d={`M ${pts}`} stroke={crest} strokeOpacity={0.18 + i * 0.03} strokeWidth={3 + i} fill="none" />;
      })}
    </g>
  );
};
/** wooden lifeboat, side view; (x,y) = waterline centre */
const Lifeboat: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -290 -92 L 290 -92 Q 312 -92 300 -60 Q 260 24 160 34 L -170 34 Q -262 24 -300 -60 Q -312 -92 -290 -92 Z" fill="#f2ecdc" stroke={INK} strokeWidth={5} />
    <rect x={-292} y={-100} width={584} height={16} rx={6} fill="#8a5a34" stroke={INK} strokeWidth={4} />
    {[-200, -60, 80, 220].map((bx) => <line key={bx} x1={bx} y1={-84} x2={bx * 0.9} y2={20} stroke="#d8d0bc" strokeWidth={4} />)}
    <text x={0} y={-40} textAnchor="middle" fontFamily="Georgia" fontWeight={700} fontSize={26} fill="#4a4036" opacity={0.7}>WHITE STAR</text>
  </g>
);
/** feet y for a person "seated" in a lifeboat (shoulders ~110·ps above the gunwale) */
const seatY = (y: number, s: number, ps: number) => y - 92 * s + 174 * ps;
/** Olympic-class liner, side view, bow to the LEFT; (x,y) = waterline centre */
const Liner: React.FC<{ x: number; y: number; s?: number; rot?: number; hospital?: boolean; lights?: number; holeAt?: number }> = ({ x, y, s = 1, rot = 0, hospital, lights = 0, holeAt }) => {
  const hull = hospital ? "#f4f2ea" : "#1c1c20";
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M -470 -120 L 430 -120 Q 470 -110 450 -40 L 440 40 L -400 40 Q -440 20 -450 -40 Z" fill={hull} stroke={INK} strokeWidth={5} />
      {hospital && <rect x={-445} y={-74} width={885} height={18} fill="#2e7a3e" />}
      {hospital && [-250, 150].map((cx) => <g key={cx}><rect x={cx - 34} y={-112} width={68} height={68} fill="#fff" /><rect x={cx - 10} y={-106} width={20} height={56} fill="#c62828" /><rect x={cx - 28} y={-88} width={56} height={20} fill="#c62828" /></g>)}
      {!hospital && <rect x={-462} y={-30} width={905} height={70} fill="#7a2a22" />}
      <path d="M -380 -120 L 340 -120 L 330 -190 L -360 -190 Z" fill="#f4f0e6" stroke={INK} strokeWidth={4} />
      {Array.from({ length: 22 }, (_, i) => <circle key={i} cx={-430 + i * 40} cy={-90} r={6} fill={lights > 0.5 ? "#ffd98a" : hospital ? "#9aa8b0" : "#3a3a40"} />)}
      {Array.from({ length: 16 }, (_, i) => <rect key={`w${i}`} x={-350 + i * 42} y={-176} width={18} height={14} fill={lights > 0.5 ? "#ffe2a0" : "#9aa8b0"} />)}
      {[-260, -120, 20, 160].map((fx) => <g key={fx}><path d={`M ${fx - 22} -190 L ${fx - 14} -330 L ${fx + 34} -330 L ${fx + 26} -190 Z`} fill={hospital ? "#d8a050" : "#d89b4a"} stroke={INK} strokeWidth={4} /><path d={`M ${fx - 15} -330 L ${fx - 13} -300 L ${fx + 31} -300 L ${fx + 34} -330 Z`} fill="#1a1a1a" /></g>)}
      <line x1={-430} y1={-120} x2={-430} y2={-360} stroke={INK} strokeWidth={4} />
      <line x1={360} y1={-120} x2={360} y2={-340} stroke={INK} strokeWidth={4} />
      {holeAt !== undefined && <path d={`M ${holeAt - 30} -60 L ${holeAt - 8} -96 L ${holeAt + 6} -70 L ${holeAt + 30} -100 L ${holeAt + 26} -30 L ${holeAt - 20} -24 Z`} fill="#0a0a0a" stroke="#555" strokeWidth={3} />}
    </g>
  );
};
const Gull: React.FC<{ x: number; y: number; f: number }> = ({ x, y, f }) => <path d={`M ${x - 26} ${y} q 13 ${-12 + Math.sin(f) * 8} 26 0 q 13 ${-12 + Math.sin(f) * 8} 26 0`} stroke="#2b2b2b" strokeWidth={4} fill="none" />;
const Rail: React.FC<{ y: number; x0?: number; x1?: number; color?: string }> = ({ y, x0 = -60, x1 = 1140, color = "#e8e4da" }) => (
  <g>
    <rect x={x0} y={y - 150} width={x1 - x0} height={14} fill={color} stroke={INK} strokeWidth={3} />
    <rect x={x0} y={y - 80} width={x1 - x0} height={8} fill={color} stroke={INK} strokeWidth={2} />
    {Array.from({ length: Math.ceil((x1 - x0) / 120) + 1 }, (_, i) => <rect key={i} x={x0 + i * 120} y={y - 150} width={10} height={150} fill={color} stroke={INK} strokeWidth={2} />)}
  </g>
);

// ---------- 1 + LOOP: Violet in a Titanic lifeboat with the baby, the stern rising behind ----------
export const SceneLifeboat: React.FC<SP & { u0?: number }> = ({ lt, frame, u0 = 0 }) => {
  const u = lt + u0;
  const hz = 1000, wy = 1420, bs = 1.15, ps = 1.08;
  const slide = u < 0 ? u * 300 : 0;
  const bx = 470 + slide;
  const push = 1 + Math.max(0, u) * 0.018;
  const stroke = Math.sin(frame * 0.16);
  const oarA = -55 + stroke * 16;
  const sx = bx + 215;
  const sh = handAt(sx, seatY(wy, bs, ps * 0.95), ps * 0.95, 1, oarA, stroke * 6);
  const blade: V2 = [sh[0] + 190, wy + 40 - stroke * 30];
  const vx = bx - 20, vy = seatY(wy, bs, ps);
  const vh = handAt(vx, vy, ps, 1, -32, 0);
  const lightsOn = u < 2.6 ? (Math.sin(frame * 1.7) > -0.8 ? 1 : 0) : 0;
  const sink = Math.max(0, u) * 6;
  return (
    <g transform={`translate(540 1100) scale(${push}) translate(-540 -1100)`}>
      <Sky top="#070d1a" bottom="#1d2a44" stars />
      <rect x={-60} y={hz - 300} width={1200} height={320} fill="#1d2a44" opacity={0.6} />
      <Liner x={830} y={hz + 60 + sink} s={0.7} rot={-28} lights={lightsOn} />
      <Sea y={hz} frame={frame} c1="#16233a" c2="#0a1222" crest="#9ab4d0" />
      {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M ${640 + i * 50} ${hz + 6} l 30 -2`} stroke="#c8d8e8" strokeWidth={3} opacity={0.5} />)}
      {/* passengers: woman at the left looking at the ship too; Violet holding the baby; sailor rowing at the right */}
      <Person x={bx - 180} y={seatY(wy, bs, 0.95)} s={0.95} kit={{ pose: "side", facing: 1, colors: PASSENGER_W, armAngle: -30, farArmAngle: -20, expression: "scared" }} />
      <Person x={vx} y={vy} s={ps} kit={{ pose: "side", facing: 1, colors: VIOLET, armAngle: -32, farArmAngle: -26, expression: "scared" }} />
      <Bundle x={vh[0] + 8} y={vh[1] - 22} s={1.05} />
      <Person x={sx} y={seatY(wy, bs, ps * 0.95)} s={ps * 0.95} kit={{ pose: "side", facing: 1, colors: SAILOR, armAngle: oarA, farArmAngle: oarA + 4, lean: stroke * 6, expression: "determined" }} />
      <line x1={sh[0] - 30} y1={sh[1] + 10} x2={blade[0]} y2={blade[1]} stroke="#8a5a34" strokeWidth={10} strokeLinecap="round" />
      <Lifeboat x={bx} y={wy} s={bs} />
      <ellipse cx={blade[0] + 10} cy={wy + 40} rx={46} ry={10} fill="#0a1222" />
      <rect x={-60} y={wy + 20} width={1200} height={900} fill="#0f1a2e" />
      {stroke < -0.85 && <ellipse cx={blade[0]} cy={wy + 26} rx={40} ry={8} fill="#c8d8e8" opacity={0.5} />}
      <Label x={540} y={830} lt={u} at={1.6} text="APRIL 15, 1912" size={42} />
    </g>
  );
};

// ---------- 3: a stewardess at work — tray, corridor, knock ----------
export const SceneCorridor: React.FC<SP> = ({ lt }) => {
  const floor = GY + 250, s = 1.25, vx = 450;
  const stopAt = 1.3, moving = lt < stopAt;
  const scroll = (moving ? lt : stopAt) * 220;
  const knock = lt > 1.55 ? Math.max(0, Math.sin((lt - 1.55) * Math.PI * 3.3)) : 0;
  const far = moving ? undefined : lerpA(lt, [[1.3, -20], [1.55, -95]]) - knock * 12;
  const th = handAt(vx, floor, s, 1, -78, 0);
  return (
    <g>
      <rect x={-60} y={-60} width={1200} height={2200} fill="#e6d8b8" />
      {Array.from({ length: 9 }, (_, i) => { const x = i * 300 - scroll; const door = i % 2 === 0;
        return <g key={i}>
          <rect x={x - 130} y={420} width={260} height={floor - 420} fill="#d8c8a2" stroke="#b8a682" strokeWidth={4} />
          {door ? <g><rect x={x - 80} y={560} width={160} height={floor - 560} fill="#8a5a34" stroke={INK} strokeWidth={4} /><rect x={x - 30} y={620} width={60} height={34} fill="#d6b04a" stroke={INK} strokeWidth={2} /><text x={x} y={646} textAnchor="middle" fontFamily="Georgia" fontWeight={700} fontSize={24} fill={INK}>{17 + i}</text><circle cx={x + 56} cy={floor - 280} r={9} fill="#d6b04a" stroke={INK} strokeWidth={2} /></g>
            : <circle cx={x} cy={700} r={46} fill="#9ab0c0" stroke={INK} strokeWidth={6} />}
        </g>; })}
      <rect x={-60} y={360} width={1200} height={60} fill="#c8b48a" />
      <rect x={-60} y={floor} width={1200} height={900} fill="#7a2a2a" />
      {Array.from({ length: 14 }, (_, i) => <rect key={i} x={((i * 120 - scroll) % 1680 + 1680) % 1680 - 120} y={floor + 30} width={60} height={10} fill="#9a3a32" />)}
      <Person x={vx} y={floor} s={s} kit={{ pose: "side", facing: 1, walking: moving, colors: VIOLET, armAngle: -78, farArmAngle: far, expression: "neutral" }} />
      <Skirt x={vx} y={floor} s={s} color="#2a2d3a" shade="#1e2029" apron />
      {/* tea tray level on the near hand */}
      <g transform={`translate(${th[0] + 30} ${th[1] - 8})`}>
        <rect x={-70} y={-8} width={140} height={12} rx={4} fill="#c8c8cc" stroke={INK} strokeWidth={3} />
        <path d="M -40 -8 L -36 -46 L -4 -46 L 0 -8 Z" fill="#f4f0e6" stroke={INK} strokeWidth={3} /><path d="M 0 -36 q 14 0 12 14" stroke={INK} strokeWidth={3} fill="none" />
        <path d="M 20 -8 L 22 -26 L 50 -26 L 52 -8 Z" fill="#f4f0e6" stroke={INK} strokeWidth={3} />
      </g>
      <Label x={540} y={560} lt={lt} at={0.3} text="VIOLET JESSOP" size={56} />
      <Label x={540} y={650} lt={lt} at={0.9} text="STEWARDESS" size={44} bg="#f2e3b5" fg="#1b140d" />
    </g>
  );
};

// ---------- 5: HMS Hawke's bow rams the Olympic ----------
export const RAM_HIT = 0.9;
export const SceneRam: React.FC<SP> = ({ lt, frame }) => {
  const wy = 1250;
  const k = Easing.out(Easing.quad)(interpolate(lt, [0, RAM_HIT], [0, 1], cl));
  const hit = lt >= RAM_HIT;
  const shake = hit ? Math.sin(frame * 2.3) * 14 * Math.max(0, 1 - (lt - RAM_HIT) * 1.6) : 0;
  const deck = 820, vx = 330, s = 0.95;
  const grab = lerpA(lt, [[RAM_HIT, -30], [RAM_HIT + 0.3, -100]]);
  const lean = hit ? lerpA(lt, [[RAM_HIT, 0], [RAM_HIT + 0.2, -14], [RAM_HIT + 0.9, -6]]) : 0;
  const bowTip: V2 = [1240 - k * 440, 1500 - k * 360];
  return (
    <g transform={`translate(${shake} ${shake * 0.4})`}>
      <Sky top="#8a98a8" bottom="#d0d4d4" clouds={3} drift={frame / 30} />
      <rect x={-60} y={wy - 40} width={1200} height={60} fill="#7a8a94" />
      {/* Olympic: hull fills the frame (aft section), deck with Violet at the rail */}
      <rect x={-60} y={deck} width={1200} height={wy - deck + 30} fill="#1c1c20" stroke={INK} strokeWidth={5} />
      <rect x={-60} y={wy - 40} width={1200} height={70} fill="#7a2a22" />
      {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={20 + i * 95} cy={deck + 110} r={13} fill="#3a3a40" stroke="#555" strokeWidth={2} />)}
      <rect x={-60} y={deck - 300} width={1200} height={300} fill="#f4f0e6" stroke={INK} strokeWidth={4} />
      {Array.from({ length: 10 }, (_, i) => <rect key={i} x={30 + i * 110} y={deck - 240} width={50} height={40} fill="#9aa8b0" stroke={INK} strokeWidth={2} />)}
      <Person x={vx} y={deck} s={s} kit={{ pose: "side", facing: 1, colors: VIOLET, armAngle: grab, farArmAngle: hit ? -70 : -15, lean, expression: hit ? "scared" : "neutral" }} />
      <Skirt x={vx} y={deck} s={s} color="#2a2d3a" shade="#1e2029" apron lean={lean} />
      <Rail y={deck} color="#e8e4da" />
      {hit && <path d="M 760 1060 L 790 1010 L 820 1050 L 860 1000 L 880 1080 L 840 1150 L 780 1140 Z" fill="#050505" stroke="#666" strokeWidth={4} />}
      <rect x={-60} y={wy + 20} width={1200} height={900} fill="#5a6a74" opacity={0.85} />
      {/* HMS Hawke's grey bow comes in from the foreground */}
      <path d={`M ${bowTip[0]} ${bowTip[1]} L ${bowTip[0] + 420} ${bowTip[1] - 160} L ${bowTip[0] + 700} ${bowTip[1] + 300} L ${bowTip[0] + 160} ${bowTip[1] + 420} Z`} fill="#6a7078" stroke={INK} strokeWidth={6} />
      <path d={`M ${bowTip[0]} ${bowTip[1]} L ${bowTip[0] + 420} ${bowTip[1] - 160}`} stroke="#4a5058" strokeWidth={18} />
      {hit && lt < RAM_HIT + 0.35 && <circle cx={820} cy={1080} r={interpolate(lt, [RAM_HIT, RAM_HIT + 0.35], [40, 260], cl)} fill="#fff8e0" opacity={interpolate(lt, [RAM_HIT, RAM_HIT + 0.35], [0.9, 0], cl)} />}
      <Label x={760} y={560} lt={lt} at={0.2} text="HMS HAWKE" size={50} />
    </g>
  );
};

// ---------- 8: night deck, the officer orders her into the lifeboat ----------
export const SceneDeckOrder: React.FC<SP> = ({ lt, frame }) => {
  const floor = GY + 250, s = 1.15;
  const boatX = 820, boatY = floor - 120, bs = 0.78;
  const ropeX = boatX - 250 * bs;
  const walkEnd = 1.9;
  const vx0 = lerpA(lt, [[0, 120], [walkEnd, 470]]);
  const step = interpolate(lt, [2.6, 3.4], [0, 1], cl);
  const vx = vx0 + step * 300, vy = floor - Math.sin(step * Math.PI) * 60 - step * 0;
  const inBoat = step > 0.6;
  const reach = lt > walkEnd && step < 0.6 ? lerpA(lt, [[walkEnd, -40], [2.3, -125]]) : -40;
  const rh = handAt(vx, vy, s, 1, reach, 0);
  const lampOn = 0.8 + 0.2 * Math.sin(frame * 0.9);
  return (
    <g transform={`translate(540 ${floor}) rotate(5) scale(1.12) translate(-540 ${-floor})`}>
      <rect x={-400} y={-600} width={1900} height={3200} fill="#0d1626" />
      <Sky top="#070d1a" bottom="#1d2a44" stars />
      <rect x={-200} y={floor - 380} width={1500} height={380} fill="#2a2e38" />
      {[150, 520, 900].map((lx) => <g key={lx}><circle cx={lx} cy={floor - 330} r={50} fill="#ffd98a" opacity={0.18 * lampOn} /><circle cx={lx} cy={floor - 330} r={14} fill="#ffe2a0" /></g>)}
      <rect x={-200} y={floor} width={1500} height={900} fill="#a88a62" />
      {Array.from({ length: 16 }, (_, i) => <line key={i} x1={-200 + i * 100} y1={floor} x2={-200 + i * 100 - 60} y2={floor + 300} stroke="#8a6e4c" strokeWidth={4} />)}
      {/* davits + falls */}
      {[ropeX, boatX + 250 * bs].map((dx, i) => <g key={i}><path d={`M ${dx + (i ? 60 : -60)} ${floor} L ${dx + (i ? 60 : -60)} ${floor - 520} Q ${dx + (i ? 60 : -60)} ${floor - 600} ${dx} ${floor - 600}`} stroke="#d8d4c8" strokeWidth={16} fill="none" /><line x1={dx} y1={floor - 600} x2={dx} y2={boatY - 80} stroke="#c8b48a" strokeWidth={5} /></g>)}
      <Person x={300} y={floor} s={1.2} kit={{ pose: "side", facing: 1, colors: OFFICER, armAngle: lerpA(lt, [[0, -40], [0.4, -95], [2.4, -95], [2.9, -30]]), farArmAngle: -10, expression: "determined" }} />
      {!inBoat && <Person x={vx} y={vy} s={s} kit={{ pose: "side", facing: 1, walking: lt < walkEnd, colors: VIOLET, armAngle: lt < walkEnd ? undefined : reach, expression: "scared" }} />}
      {!inBoat && <Skirt x={vx} y={vy} s={s} color="#2a2d3a" shade="#1e2029" apron />}
      {inBoat && <Person x={vx} y={seatY(boatY, bs, s) - (1 - step) * 40} s={s} kit={{ pose: "side", facing: 1, colors: VIOLET, armAngle: -30, farArmAngle: -20, expression: "scared" }} />}
      {inBoat && <Person x={boatX + 120} y={seatY(boatY, bs, 0.9)} s={0.9} kit={{ pose: "side", facing: -1, colors: PASSENGER_W, armAngle: -40, expression: "scared" }} />}
      <Lifeboat x={boatX} y={boatY} s={bs} />
      {lt > 2.2 && step < 0.6 && <circle cx={rh[0]} cy={rh[1]} r={3} fill="none" />}
      <Label x={540} y={520} lt={lt} at={0.5} text="INTO THE LIFEBOAT" size={50} />
    </g>
  );
};

// ---------- 9: the officer hands her a baby across the gunwale ----------
export const PASS_AT = 0.9;
export const SceneBaby: React.FC<SP> = ({ lt, frame }) => {
  const deckY = 960, ox = 760, os = 1.15;
  const wy = 1470, bx = 360, bs = 1.25, vs = 1.2;
  const vx = bx + 60, vy = seatY(wy, bs, vs);
  const oA = lerpA(lt, [[0, -60], [PASS_AT, -28], [1.6, -10]]);
  const vA = lerpA(lt, [[0, -40], [0.6, -140], [PASS_AT, -140], [1.5, -35]]);
  const oh = handAt(ox, deckY, os, -1, oA, -18);
  const vh = handAt(vx, vy, vs, 1, vA, 0);
  const k = interpolate(lt, [PASS_AT - 0.1, PASS_AT + 0.15], [0, 1], cl);
  const bundle: V2 = lt < PASS_AT - 0.1 ? [oh[0] - 10, oh[1] - 14] : [oh[0] + (vh[0] - oh[0]) * k, oh[1] - 14 + (vh[1] - oh[1]) * k];
  return (
    <g>
      <Sky top="#070d1a" bottom="#1d2a44" stars />
      {/* the liner's side towering over the boat */}
      <rect x={560} y={deckY} width={600} height={1300} fill="#1c1c20" stroke={INK} strokeWidth={5} />
      {Array.from({ length: 4 }, (_, i) => <circle key={i} cx={640 + i * 120} cy={deckY + 160} r={14} fill="#ffd98a" />)}
      <rect x={560} y={deckY - 420} width={600} height={420} fill="#2a2e38" />
      <circle cx={980} cy={deckY - 330} r={50} fill="#ffd98a" opacity={0.2} /><circle cx={980} cy={deckY - 330} r={14} fill="#ffe2a0" />
      <Person x={ox} y={deckY} s={os} kit={{ pose: "side", facing: -1, colors: OFFICER, armAngle: oA, farArmAngle: oA + 6, lean: -18, expression: "determined" }} />
      <Rail y={deckY} x0={560} x1={1140} color="#e8e4da" />
      <line x1={600} y1={deckY - 10} x2={bx - 300} y2={wy - 120} stroke="#c8b48a" strokeWidth={5} />
      <Sea y={1380} frame={frame} c1="#16233a" c2="#0a1222" crest="#9ab4d0" rows={4} />
      <Person x={vx} y={vy} s={vs} kit={{ pose: "side", facing: 1, colors: VIOLET, armAngle: vA, farArmAngle: vA + 8, expression: lt > PASS_AT + 0.4 ? "sad" : "scared" }} />
      <Bundle x={bundle[0]} y={bundle[1]} s={1.0} rot={lt > PASS_AT ? -10 : 20} />
      <Lifeboat x={bx} y={wy} s={bs} />
      <rect x={-60} y={wy + 20} width={1200} height={900} fill="#0f1a2e" />
      <Label x={330} y={560} lt={lt} at={0.3} text="SHE LATER WROTE" size={46} />
    </g>
  );
};

// ---------- 10: on the Carpathia, a woman takes the baby without a word ----------
export const TAKE_AT = 1.4;
export const SceneCarpathia: React.FC<SP> = ({ lt, frame }) => {
  const floor = GY + 250, s = 1.2, vx = 360;
  const arrive = 1.15;
  const wx = lt < arrive ? lerpA(lt, [[0, 1180], [arrive, 640]]) : lt < 1.75 ? 640 : 640 + (lt - 1.75) * 420;
  const wFacing: 1 | -1 = lt < 1.75 ? -1 : 1;
  const wA = lt < arrive ? -20 : lt < 1.75 ? lerpA(lt, [[arrive, -20], [TAKE_AT, -70]]) : -38;
  const vA = lerpA(lt, [[0, -35], [2.2, -35], [2.9, -10]]);
  const vh = handAt(vx, floor, s, 1, vA, 0);
  const wh = handAt(wx, floor, s, wFacing, wA, 0);
  const held = lt >= TAKE_AT;
  return (
    <g>
      <Sky top="#e8a07a" bottom="#f6dcc0" sun={{ x: 880, y: 860, r: 60, color: "#fff2c0" }} />
      <Sea y={1000} frame={frame} c1="#7a8ea4" c2="#4a5e74" crest="#ffffff" rows={4} />
      {[[160, 1040, 80], [820, 1060, 120], [520, 1020, 40]].map(([x, y, w], i) => <path key={i} d={`M ${x - w} ${y} L ${x - w * 0.4} ${y - w * 0.5} L ${x + w * 0.5} ${y - w * 0.35} L ${x + w} ${y} Z`} fill="#f4f8fa" stroke="#9ab0c0" strokeWidth={3} />)}
      <rect x={-60} y={floor - 230} width={1200} height={20} fill="#efe9da" />
      <rect x={-60} y={floor} width={1200} height={900} fill="#b09070" />
      <Rail y={floor - 20} color="#f0ebde" />
      <Person x={vx} y={floor} s={s} kit={{ pose: "side", facing: 1, colors: VIOLET, armAngle: vA, farArmAngle: vA + 6, expression: held ? "sad" : "neutral" }} />
      <Skirt x={vx} y={floor} s={s} color="#2a2d3a" shade="#1e2029" apron />
      <Person x={wx} y={floor} s={s} kit={{ pose: "side", facing: wFacing, walking: lt < arrive || lt > 1.75, colors: MOTHER, armAngle: wA, farArmAngle: held ? wA + 6 : undefined, expression: "neutral" }} />
      <Skirt x={wx} y={floor} s={s} color="#4a5a6e" shade="#3a485a" />
      <Bundle x={held ? wh[0] + wFacing * 6 : vh[0] + 4} y={(held ? wh[1] : vh[1]) - 14} s={0.95} rot={held ? (wFacing === 1 ? -10 : 10) : -10} />
      <Label x={540} y={560} lt={lt} at={0.3} text="RMS CARPATHIA" size={52} />
    </g>
  );
};

// ---------- 12: nurse Violet on HMHS Britannic tucks in a wounded soldier ----------
export const SceneWard: React.FC<SP> = ({ lt }) => {
  const floor = GY + 250, s = 1.15;
  const vx = lerpA(lt, [[0.2, 960], [1.6, 780]]);
  const A = lerpA(lt, [[0.2, -35], [1.6, -70]]);
  const h = handAt(vx, floor - 20, s, -1, A, 0);
  const cotY = floor - 150, cotX0 = 380, cotX1 = 960, ls = 0.88;
  const edge = Math.min(cotX1 - 60, Math.max(600, h[0]));
  return (
    <g>
      <rect x={-60} y={-60} width={1200} height={2200} fill="#e8e2d0" />
      {[200, 540, 880].map((px) => <g key={px}><circle cx={px} cy={600} r={58} fill="#8ab0c8" stroke="#6a6458" strokeWidth={14} /><path d={`M ${px - 30} ${590} q 30 -16 60 0`} stroke="#c8dce8" strokeWidth={6} fill="none" /></g>)}
      <rect x={-60} y={floor} width={1200} height={900} fill="#a89878" />
      <Person x={vx} y={floor - 20} s={s} kit={{ pose: "side", facing: -1, walking: lt > 0.2 && lt < 1.6, colors: NURSE, armAngle: A, farArmAngle: A + 10, expression: "neutral" }} />
      <Skirt x={vx} y={floor - 20} s={s} color="#f2efe6" shade="#d6d0c2" />
      <Cross x={vx} y={floor - 20} s={s} facing={-1} />
      {/* cot in front of her; the soldier lies on it, head to the left on the pillow */}
      <rect x={cotX0} y={cotY} width={cotX1 - cotX0} height={26} fill="#6a6a6e" stroke={INK} strokeWidth={4} />
      <rect x={cotX0 + 10} y={cotY + 26} width={14} height={150} fill="#5a5a5e" /><rect x={cotX1 - 24} y={cotY + 26} width={14} height={150} fill="#5a5a5e" />
      <rect x={cotX0 + 20} y={cotY - 44} width={130} height={46} rx={18} fill="#f4f0e6" stroke={INK} strokeWidth={3} />
      <Lying x={cotX1 - 40} y={cotY - 60 * ls} s={ls} colors={SOLDIER} expression={lt > 1.8 ? "happy" : "sad"} wounds={false} />
      <path d={`M ${edge} ${cotY - 112} Q ${(edge + cotX1) / 2} ${cotY - 124} ${cotX1 - 20} ${cotY - 100} L ${cotX1 - 10} ${cotY + 8} L ${edge - 6} ${cotY + 8} Z`} fill="#7a6a5a" stroke={INK} strokeWidth={4} />
      <circle cx={edge + 4} cy={Math.max(cotY - 110, h[1])} r={15} fill="#eebf98" stroke={INK} strokeWidth={3} />
      <Label x={540} y={430} lt={lt} at={0.3} text="NURSE" size={54} />
      <Label x={540} y={520} lt={lt} at={1.0} text="HMHS BRITANNIC" size={46} bg="#f2e3b5" fg="#1b140d" />
    </g>
  );
};

// ---------- 13: waterline cutaway, the hospital ship runs onto a mine ----------
export const MINE_HIT = 1.5;
export const SceneMine: React.FC<SP> = ({ lt, frame }) => {
  const wy = 900, mx = 420, my = 990;
  const xc = 825 + (MINE_HIT - Math.min(lt, MINE_HIT + 0.2)) * 200;
  const hit = lt >= MINE_HIT;
  const q = interpolate(lt, [MINE_HIT, MINE_HIT + 0.9], [0, 1], cl);
  const jolt = hit ? Math.sin(frame * 2.1) * 10 * (1 - q) : 0;
  return (
    <g>
      <Sky top="#8aa4bc" bottom="#d8e0e4" clouds={2} drift={frame / 30} />
      <Liner x={xc} y={wy + jolt * 0.5} s={0.9} hospital rot={hit ? -q * 2 : 0} />
      <rect x={-60} y={wy} width={1200} height={1400} fill="#2e5a66" opacity={0.92} />
      {Array.from({ length: 8 }, (_, i) => <line key={i} x1={-60} x2={1140} y1={wy + 120 + i * 140} y2={wy + 120 + i * 140} stroke="#3a6a76" strokeWidth={4} opacity={0.4} />)}
      <rect x={-60} y={1700} width={1200} height={600} fill="#4a4a3a" />
      {!hit && <g>
        <line x1={mx} y1={my + 40} x2={mx} y2={1700} stroke="#1a1a1a" strokeWidth={5} strokeDasharray="10 6" />
        <circle cx={mx} cy={my} r={44} fill="#2a2a2a" stroke="#000" strokeWidth={4} />
        {Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return <line key={i} x1={mx + Math.cos(a) * 44} y1={my + Math.sin(a) * 44} x2={mx + Math.cos(a) * 62} y2={my + Math.sin(a) * 62} stroke="#000" strokeWidth={7} />; })}
      </g>}
      {hit && <g>
        <circle cx={mx} cy={my} r={60 + q * 300} fill="#fff8e0" opacity={(1 - q) * 0.9} />
        <path d={`M ${mx - 90} ${wy} Q ${mx - 60} ${wy - 260 * Math.min(1, q * 2)} ${mx} ${wy - 420 * Math.min(1, q * 2)} Q ${mx + 60} ${wy - 260 * Math.min(1, q * 2)} ${mx + 90} ${wy} Z`} fill="#e8f0f4" opacity={0.9 - q * 0.5} />
        {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={mx + (rnd(i) - 0.5) * 300 * q} cy={my - rnd(i + 4) * 200 * q} r={8 + rnd(i + 2) * 14} fill="#c8dce4" opacity={1 - q} />)}
      </g>}
      <Label x={760} y={1260} lt={lt} at={0.3} text="MINE" size={50} />
    </g>
  );
};

// ---------- 14: her lifeboat drifts toward the turning propellers ----------
export const ScenePropellers: React.FC<SP> = ({ lt, frame }) => {
  const wy = 1180;
  const bx = lerpA(lt, [[0, 260], [2.9, 470]]);
  const ang = frame * 22;
  const prop = (cx: number, cy: number, r: number) => (
    <g transform={`translate(${cx} ${cy})`}>
      <line x1={-140} y1={-40} x2={0} y2={0} stroke="#4a4a4a" strokeWidth={14} />
      <g transform={`rotate(${ang})`}>{[0, 120, 240].map((a) => <ellipse key={a} cx={0} cy={-r * 0.5} rx={r * 0.22} ry={r * 0.5} fill="#b8862a" stroke={INK} strokeWidth={4} transform={`rotate(${a})`} />)}</g>
      <circle r={14} fill="#8a6a2a" stroke={INK} strokeWidth={3} />
    </g>
  );
  return (
    <g>
      <Sky top="#8aa4bc" bottom="#d8e0e4" />
      {Array.from({ length: 5 }, (_, i) => <ellipse key={i} cx={420 + i * 70} cy={380 - i * 50 - (frame % 60)} rx={90 + i * 20} ry={50 + i * 10} fill="#8a8a8a" opacity={0.35} />)}
      {/* the stern rising out of the water (bow already down to the left) */}
      <path d={`M -60 ${wy + 40} L 760 ${wy - 360} Q 980 ${wy - 470} 1000 ${wy - 320} L 980 ${wy - 120} L 760 ${wy - 60} L 600 ${wy + 40} Z`} fill="#f4f2ea" stroke={INK} strokeWidth={6} />
      <path d={`M -60 ${wy - 40} L 760 ${wy - 440} L 990 ${wy - 520} L 1000 ${wy - 470} L 760 ${wy - 400} L -60 ${wy + 0} Z`} fill="#f4f0e6" stroke={INK} strokeWidth={4} />
      <path d={`M 40 ${wy - 10} L 900 ${wy - 400}`} stroke="#2e7a3e" strokeWidth={18} />
      <g><rect x={400} y={wy - 330} width={70} height={70} fill="#fff" transform={`rotate(-26 435 ${wy - 295})`} /><rect x={425} y={wy - 322} width={20} height={56} fill="#c62828" transform={`rotate(-26 435 ${wy - 295})`} /><rect x={407} y={wy - 305} width={56} height={20} fill="#c62828" transform={`rotate(-26 435 ${wy - 295})`} /></g>
      {prop(880, wy - 110, 150)}
      {prop(760, wy - 40, 130)}
      {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={720 + rnd(i) * 220} cy={wy + 10 + Math.sin(frame * 0.4 + i) * 8} r={14 + rnd(i + 3) * 18} fill="#ffffff" opacity={0.75} />)}
      <Sea y={wy} frame={frame} c1="#4a6a7e" c2="#2a4458" rows={4} />
      <Person x={bx - 170} y={seatY(wy + 120, 1.0, 0.9)} s={0.9} kit={{ pose: "side", facing: 1, colors: SAILOR, armAngle: -20, lean: -16, expression: "scared" }} />
      <Person x={bx + 10} y={seatY(wy + 120, 1.0, 1.0)} s={1.0} kit={{ pose: "side", facing: 1, colors: NURSE, armAngle: -100, farArmAngle: -60, lean: -12, expression: "scared" }} />
      <Person x={bx + 170} y={seatY(wy + 120, 1.0, 0.9)} s={0.9} kit={{ pose: "side", facing: -1, colors: PASSENGER_W, armAngle: -40, expression: "scared" }} />
      <Lifeboat x={bx} y={wy + 120} s={1.0} rot={Math.sin(frame * 0.2) * 2} />
      <rect x={-60} y={wy + 140} width={1200} height={900} fill="#2a4458" />
      <Label x={300} y={620} lt={lt} at={0.4} text="PROPELLERS" size={54} />
    </g>
  );
};

// ---------- 15: she jumps, hits the water and is pulled under (camera follows her down) ----------
export const SPLASH_AT = 0.6;
export const SceneJump: React.FC<SP> = ({ lt, frame }) => {
  const wy = 1100;
  const cam = Easing.inOut(Easing.cubic)(interpolate(lt, [SPLASH_AT + 0.1, 1.8], [0, 1], cl)) * 760;
  const air = Math.min(lt, SPLASH_AT) / SPLASH_AT;
  const px = lt < SPLASH_AT ? 420 + air * 300 : 720 + (lt - SPLASH_AT) * 40;
  const py = lt < SPLASH_AT ? wy - 60 - Math.sin(air * Math.PI) * 220 + air * 200 : wy + 140 + (lt - SPLASH_AT) * 620;
  const rot = lt < SPLASH_AT ? air * 70 : 160 + Math.sin(lt * 3) * 8;
  const sp = interpolate(lt, [SPLASH_AT, SPLASH_AT + 0.5], [0, 1], cl);
  return (
    <g transform={`translate(0 ${-cam})`}>
      <Sky top="#8aa4bc" bottom="#d8e0e4" />
      <rect x={-60} y={wy} width={1200} height={2600} fill="#2e5a70" />
      <rect x={-60} y={wy + 900} width={1200} height={1700} fill="#16323e" opacity={0.7} />
      {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M ${-60 + i * 220} ${wy} L ${40 + i * 220} ${wy + 1400}`} stroke="#9ac8d8" strokeWidth={50} opacity={0.08} />)}
      {/* whirl of the suction around her */}
      {lt > SPLASH_AT && Array.from({ length: 4 }, (_, i) => <ellipse key={i} cx={760} cy={wy + 600 + i * 90} rx={(160 + i * 60) * sp} ry={30 + i * 6} fill="none" stroke="#bfe0ea" strokeWidth={5} opacity={0.35} strokeDasharray="30 20" strokeDashoffset={-frame * 6} />)}
      <g transform={`translate(${px} ${py}) rotate(${rot})`}><Person x={0} y={0} s={1.0} kit={{ pose: "side", facing: 1, colors: NURSE, armAngle: lt < SPLASH_AT ? -160 : -170, farArmAngle: -150, expression: "scared" }} /><Skirt x={0} y={0} s={1.0} color="#f2efe6" shade="#d6d0c2" /></g>
      {lt > SPLASH_AT && Array.from({ length: 16 }, (_, i) => <circle key={i} cx={px - 40 + rnd(i) * 80 + Math.sin(frame * 0.3 + i) * 10} cy={py - 300 - ((frame * 9 + i * 60) % 500)} r={6 + rnd(i + 1) * 10} fill="none" stroke="#d8f0f8" strokeWidth={3} />)}
      <Person x={260} y={wy + 20} s={0.9} kit={{ pose: "side", facing: 1, colors: SAILOR, armAngle: -80, lean: -10, expression: "scared" }} />
      <Lifeboat x={330} y={wy} s={1.0} />
      <rect x={-60} y={wy + 20} width={700} height={18} fill="#2e5a70" />
      {lt > SPLASH_AT && <path d={`M ${720 - 120 * sp} ${wy} Q ${720} ${wy - 260 * (1 - sp * 0.6)} ${720 + 120 * sp} ${wy}`} fill="#e8f4f8" opacity={1 - sp} />}
      <Label x={540} y={wy + 1180} lt={lt} at={1.2} text="PULLED UNDER" size={50} />
    </g>
  );
};

// ---------- 16: underwater, her head strikes the keel ----------
export const KEEL_HIT = 0.9;
export const SceneKeel: React.FC<SP> = ({ lt, frame }) => {
  const s = 1.1, keelY = 640;
  const fy = lt < KEEL_HIT ? lerpA(lt, [[0, 1360], [KEEL_HIT, keelY + 420 * s * 0.98]]) : lerpA(lt, [[KEEL_HIT, keelY + 420 * s * 0.98], [KEEL_HIT + 0.5, keelY + 520]]);
  const hit = lt >= KEEL_HIT;
  const q = interpolate(lt, [KEEL_HIT, KEEL_HIT + 0.6], [0, 1], cl);
  return (
    <g>
      <rect x={-60} y={-60} width={1200} height={2200} fill="#1e4252" />
      {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M ${100 + i * 220} -60 L ${200 + i * 220} 1800`} stroke="#8abccc" strokeWidth={60} opacity={0.06} />)}
      {/* the ship's bottom passing overhead */}
      <g transform={`translate(${-((frame * 3) % 160)} 0)`}>
        <rect x={-60} y={-60} width={1400} height={keelY + 60} fill="#2a2a2e" />
        {Array.from({ length: 10 }, (_, i) => <g key={i}><line x1={i * 160} y1={-60} x2={i * 160} y2={keelY} stroke="#1a1a1e" strokeWidth={5} />{Array.from({ length: 5 }, (_, j) => <circle key={j} cx={i * 160 + 10} cy={keelY - 40 - j * 110} r={5} fill="#4a4a50" />)}</g>)}
        <rect x={-60} y={keelY - 30} width={1400} height={40} fill="#3a3a40" stroke="#111" strokeWidth={4} />
      </g>
      <g transform={`rotate(${hit ? -q * 12 : 0} 540 ${fy - 400 * s})`}>
        <Person x={540} y={fy} s={s} kit={{ pose: "side", facing: 1, colors: NURSE, armAngle: hit ? -120 : -165, farArmAngle: hit ? -100 : -155, expression: "scared" }} />
        <Skirt x={540} y={fy} s={s} color="#f2efe6" shade="#d6d0c2" />
      </g>
      {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={480 + rnd(i) * 140} cy={1500 - ((frame * 8 + i * 70) % 800)} r={5 + rnd(i + 2) * 8} fill="none" stroke="#c8e8f0" strokeWidth={3} />)}
      {hit && <g opacity={1 - q}>
        {Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return <line key={i} x1={540 + Math.cos(a) * 30} y1={keelY + 20 + Math.sin(a) * 20} x2={540 + Math.cos(a) * (70 + q * 40)} y2={keelY + 20 + Math.sin(a) * (50 + q * 30)} stroke="#fff6c8" strokeWidth={6} />; })}
      </g>}
      {hit && <rect x={-60} y={-60} width={1200} height={2200} fill="#000" opacity={0.35 * q} />}
      <Label x={760} y={980} lt={lt} at={0.5} text="THE KEEL" size={50} />
    </g>
  );
};

// ---------- 17: she surfaces; a sailor grabs her wrist and pulls her out ----------
export const GRAB_AT = 0.85;
export const SceneRescue: React.FC<SP> = ({ lt, frame }) => {
  const wy = 1200, s = 1.1;
  const rise = lerpA(lt, [[0, 260], [0.5, 80], [GRAB_AT, 70], [1.6, -10]]);
  const vx = lerpA(lt, [[GRAB_AT, 430], [1.6, 500]]);
  const vy = wy + 284 * s - 120 * s + rise;
  const vA = lerpA(lt, [[0.2, -60], [0.7, -150]]);
  const vh = handAt(vx, vy, s, 1, vA, 0);
  const sx = 790, ss = 1.05, bwy = wy + 40;
  const sA = lt < GRAB_AT ? lerpA(lt, [[0, -60], [GRAB_AT, -140]]) : lerpA(lt, [[GRAB_AT, -140], [1.6, -110]]);
  const sh = handAt(sx, seatY(bwy, 1.1, ss), ss, -1, sA, -24);
  return (
    <g>
      <Sky top="#9ab4c8" bottom="#e0e8ea" clouds={2} drift={frame / 30} />
      <Sea y={wy - 200} frame={frame} c1="#5a7a8e" c2="#2e4c60" rows={3} />
      <Person x={vx} y={vy} s={s} kit={{ pose: "side", facing: 1, colors: NURSE, armAngle: vA, farArmAngle: -20, expression: lt > GRAB_AT ? "determined" : "scared" }} />
      <Person x={sx} y={seatY(bwy, 1.1, ss)} s={ss} kit={{ pose: "side", facing: -1, colors: SAILOR, armAngle: sA, farArmAngle: -60, lean: -24, expression: "determined" }} />
      {lt >= GRAB_AT && <circle cx={(vh[0] + sh[0]) / 2} cy={(vh[1] + sh[1]) / 2} r={18} fill="#eebf98" stroke={INK} strokeWidth={3} />}
      <Lifeboat x={sx + 90} y={bwy} s={1.1} />
      <rect x={-60} y={wy} width={1200} height={900} fill="#3e5c70" />
      {Array.from({ length: 6 }, (_, i) => <ellipse key={i} cx={vx + (rnd(i) - 0.5) * 160} cy={wy + 4} rx={30} ry={6} fill="#e8f4f8" opacity={interpolate(lt, [0.3, 1.2], [0.9, 0.2], cl)} />)}
      <Label x={330} y={560} lt={lt} at={0.6} text="SURVIVED" size={56} />
    </g>
  );
};

// ---------- 18: decades more at sea — an older Violet serves on deck ----------
export const CUP_AT = 1.5;
export const SceneLater: React.FC<SP> = ({ lt, frame }) => {
  const floor = GY + 250, s = 1.15;
  const vx = lerpA(lt, [[0, 160], [1.15, 470]]);
  const moving = lt < 1.15;
  const th = handAt(vx, floor, s, 1, -80, 0);
  const pA = lerpA(lt, [[1.0, -20], [CUP_AT, -86], [2.1, -60]]);
  const ph = handAt(780, floor, s, -1, pA, 0);
  const cupInHand = lt >= CUP_AT;
  return (
    <g>
      <Sky top="#7ab4dc" bottom="#e8f2f6" sun={{ x: 900, y: 300, r: 70, color: "#fff6c8" }} clouds={3} drift={frame / 30} />
      <Sea y={1000} frame={frame} c1="#3a7aa0" c2="#2a5a7a" rows={4} />
      {[0, 1, 2].map((i) => <Gull key={i} x={200 + i * 260 + ((frame * 2) % 200)} y={420 + i * 70} f={frame * 0.3 + i} />)}
      <rect x={-60} y={floor} width={1200} height={900} fill="#c8a878" />
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1={-60} x2={1140} y1={floor + 30 + i * 40} y2={floor + 30 + i * 40} stroke="#a88a5e" strokeWidth={3} />)}
      <Rail y={floor - 30} color="#f6f2e8" />
      <path d={`M 880 ${floor} L 920 ${floor - 160} L 1080 ${floor - 120} L 1060 ${floor} Z`} fill="#c8a060" stroke={INK} strokeWidth={4} />
      <Person x={780} y={floor} s={s} kit={{ pose: "side", facing: -1, colors: GENT, armAngle: pA, farArmAngle: -10, expression: "happy" }} />
      <Person x={vx} y={floor} s={s} kit={{ pose: "side", facing: 1, walking: moving, colors: VIOLET_LATER, armAngle: -80, expression: "happy" }} />
      <Skirt x={vx} y={floor} s={s} color="#2a2d3a" shade="#1e2029" apron />
      <g transform={`translate(${th[0] + 30} ${th[1] - 8})`}><rect x={-70} y={-8} width={140} height={12} rx={4} fill="#c8c8cc" stroke={INK} strokeWidth={3} />{!cupInHand && <path d="M 20 -8 L 22 -30 L 50 -30 L 52 -8 Z" fill="#f4f0e6" stroke={INK} strokeWidth={3} />}</g>
      {cupInHand && <path d={`M ${ph[0] - 14} ${ph[1] - 4} L ${ph[0] - 12} ${ph[1] - 26} L ${ph[0] + 14} ${ph[1] - 26} L ${ph[0] + 16} ${ph[1] - 4} Z`} fill="#f4f0e6" stroke={INK} strokeWidth={3} />}
      <Label x={540} y={560} lt={lt} at={0.3} text="DECADES MORE AT SEA" size={46} />
    </g>
  );
};

// ---------- 19: retired in a Suffolk village, Violet feeds her hens ----------
export const SceneCottage: React.FC<SP> = ({ lt, frame }) => {
  const floor = GY + 250, s = 1.15, vx = 360;
  const swing = (t: number) => Math.max(0, Math.sin(((t - 0.2) / 0.9) * Math.PI * 2));
  const A = -30 - swing(lt) * 55;
  const h = handAt(vx, floor, s, 1, A, 0);
  const throws = [0.4, 1.3];
  return (
    <g>
      <Sky top="#9ac4e0" bottom="#eef4f0" clouds={3} drift={frame / 30} />
      <path d={`M -60 ${floor - 380} Q 300 ${floor - 470} 600 ${floor - 400} T 1140 ${floor - 420} L 1140 ${floor} L -60 ${floor} Z`} fill="#8ab070" />
      <g>
        <rect x={600} y={floor - 560} width={420} height={330} fill="#f2ead8" stroke={INK} strokeWidth={5} />
        <path d={`M 570 ${floor - 540} L 810 ${floor - 760} L 1050 ${floor - 540} Z`} fill="#c8a050" stroke={INK} strokeWidth={5} />
        <rect x={660} y={floor - 450} width={90} height={80} fill="#8ab0c8" stroke={INK} strokeWidth={4} />
        <rect x={860} y={floor - 420} width={80} height={190} fill="#5a7a4a" stroke={INK} strokeWidth={4} />
      </g>
      <rect x={-60} y={floor - 230} width={1200} height={1200} fill="#7aa060" />
      {Array.from({ length: 12 }, (_, i) => <g key={i}><rect x={-40 + i * 100} y={floor - 330} width={14} height={110} fill="#e8e0cc" stroke={INK} strokeWidth={2} /></g>)}
      <rect x={-60} y={floor - 300} width={1200} height={10} fill="#e8e0cc" stroke={INK} strokeWidth={2} />
      {[620, 780, 930].map((cx, i) => <Chicken key={i} x={cx} y={floor + 10 + i * 20} s={0.42} flip={i === 1} walk={frame * 0.15 + i} rot={Math.sin(frame * 0.25 + i * 2) > 0.6 ? 25 : 0} />)}
      <Person x={vx} y={floor} s={s} kit={{ pose: "side", facing: 1, colors: VIOLET_OLD, armAngle: A, farArmAngle: -40, expression: "happy" }} />
      <Skirt x={vx} y={floor} s={s} color="#6a5a4a" shade="#55483a" />
      {throws.map((t0, j) => lt > t0 && lt < t0 + 0.9 ? Array.from({ length: 9 }, (_, i) => { const k = (lt - t0) / 0.9; const gx = h[0] + k * (140 + i * 40), gy = h[1] + k * k * 380 - k * 60 + i * 4; return <circle key={`${j}${i}`} cx={gx} cy={Math.min(gy, floor + 20)} r={5} fill="#e0c060" />; }) : null)}
      <Label x={540} y={560} lt={lt} at={0.3} text="1887 – 1971" size={54} />
    </g>
  );
};
export const _unused = rnd;
export { Liner, Sea, Rail, OFFICER, SAILOR, GENT as VGENT, Skirt };
