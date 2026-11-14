import React from "react";
import { interpolate, Easing } from "remotion";
import { Person, Sky, CLERK, KEEPER, WORKER } from "./ponyScenes";
import { Label } from "./chickenScenes";
import { handAt } from "./madridScenes";
import { KitColors } from "../kit/Kit";

/**
 * Ground scenes for "Blackbeard's Scariest Weapon Wasn't a Gun" (1718). lt = seconds since the scene started.
 * Rig units: Kit side pose, feet at (0,0), head centre ≈ (5,-338), cap -47..77 / -425..-360, face front ≈ x 58, chin ≈ y -295.
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

// ---------- palettes ----------
export const BB: Partial<KitColors> = { coat: "#25222a", coatShade: "#18161c", coatLight: "#34303a", patch: "#34303a", scarf: "#9c2222", scarfShade: "#701818", hair: "#121014", hairLight: "#2a262c", trousers: "#4a3a2a", trousersShade: "#3a2d20", button: "#d6a640", cap: "#121014", capShade: "#0a090b" };
export const NAVY: Partial<KitColors> = { coat: "#22407a", coatShade: "#182f5c", coatLight: "#2e5296", patch: "#2e5296", scarf: "#efe8d6", scarfShade: "#cfc6b0", hair: "#5a3a20", trousers: "#e8dfc8", trousersShade: "#c8bea6", button: "#e0b84a" };
const CAPTAIN = CLERK;
const GENT: Partial<KitColors> = { coat: "#3d6b4a", coatShade: "#2c5238", coatLight: "#4d805a", patch: "#4d805a", scarf: "#f2ead6", scarfShade: "#d2c8b0", hair: "#d8d2c4", trousers: "#3a3330", button: "#e0c060" };
const PIRATE: Partial<KitColors> = { ...WORKER, coat: "#5a4632", coatShade: "#44352a", coatLight: "#6c563e", scarf: "#9c2222" };
const SAILOR: Partial<KitColors> = { coat: "#3a5f86", coatShade: "#2c4866", coatLight: "#4a729c", patch: "#4a729c", scarf: "#efe8d6", cap: "#c23b2c", capShade: "#8f2a20" };

// ---------- costume overlays (drawn in rig units, facing right) ----------
const Tricorn: React.FC<{ color?: string; trim?: string }> = ({ color = "#141016", trim }) => (
  <g>
    <path d="M -44 -372 Q -40 -446 18 -450 Q 72 -446 76 -372 Z" fill={color} stroke={INK} strokeWidth={4} />
    <path d="M -70 -362 Q 12 -346 98 -364 L 104 -420 Q 62 -392 14 -398 Q -32 -392 -68 -424 Z" fill={color} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    {trim && <path d="M -68 -422 Q -32 -390 14 -396 Q 62 -390 103 -418" fill="none" stroke={trim} strokeWidth={6} />}
  </g>
);
const Beard: React.FC<{ ribbons?: number }> = ({ ribbons = 3 }) => (
  <g>
    <path d="M -14 -336 Q 4 -312 30 -320 Q 50 -326 64 -316 Q 76 -288 62 -256 Q 48 -222 32 -200 Q 16 -224 2 -248 Q -18 -290 -14 -336 Z" fill="#121014" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d="M 28 -318 Q 50 -330 68 -312 Q 52 -308 38 -306 Z" fill="#121014" stroke={INK} strokeWidth={3} />
    {[[16, -238, 14, -196], [34, -212, 38, -170], [50, -236, 58, -196]].map(([x1, y1, x2, y2], i) => (
      <g key={i}>
        <path d={`M ${x1} ${y1} Q ${(x1 + x2) / 2 + 6} ${(y1 + y2) / 2} ${x2} ${y2}`} stroke="#121014" strokeWidth={9} strokeLinecap="round" fill="none" />
        {i < ribbons && <g transform={`translate(${x2} ${y2})`}><path d="M 0 0 L -12 -8 L -12 8 Z M 0 0 L 12 -8 L 12 8 Z" fill="#d23a2a" stroke={INK} strokeWidth={2} /><path d="M -2 2 L -6 16 M 2 2 L 7 15" stroke="#d23a2a" strokeWidth={4} /></g>}
      </g>
    ))}
  </g>
);
const Pistol: React.FC<{ x: number; y: number; rot?: number; s?: number }> = ({ x, y, rot = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-4} y={-6} width={48} height={10} rx={3} fill="#5a5f66" stroke={INK} strokeWidth={3} />
    <path d="M -6 -8 L 8 -8 L 4 24 Q -2 30 -12 24 Z" fill="#7a4a24" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
  </g>
);
/** bandolier: back shoulder to front hip, with holstered pistols at the given fractions */
const SLING: [V2, V2] = [[-34, -296], [60, -152]];
const slingAt = (f: number): V2 => [SLING[0][0] + (SLING[1][0] - SLING[0][0]) * f, SLING[0][1] + (SLING[1][1] - SLING[0][1]) * f];
const Sling: React.FC<{ pistols?: number[] }> = ({ pistols = [0.22, 0.5, 0.78] }) => (
  <g>
    <path d={`M ${SLING[0][0]} ${SLING[0][1]} L ${SLING[1][0]} ${SLING[1][1]}`} stroke="#4a2e18" strokeWidth={16} strokeLinecap="round" />
    {pistols.map((f, i) => { const p = slingAt(f); return <Pistol key={i} x={p[0] - 6} y={p[1]} rot={58} s={0.9} />; })}
  </g>
);
/** a burning slow-match tip with curling smoke; deterministic from frame */
export const Smoke: React.FC<{ x: number; y: number; frame: number; seed?: number; n?: number; h?: number; k?: number }> = ({ x, y, frame, seed = 0, n = 9, h = 190, k = 1 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const q = ((frame * 0.022 + i / n + rnd(seed + i) * 0.1) % 1);
      const px = x + Math.sin(q * 7 + i + seed) * 18 * q + q * 24, py = y - q * h;
      return <circle key={i} cx={px} cy={py} r={(5 + q * 26)} fill="#d8d2c8" opacity={0.6 * (1 - q) * k} />;
    })}
    <circle cx={x} cy={y} r={7 + Math.sin(frame * 0.9 + seed) * 1.5} fill="#ff8a2a" opacity={0.9 * k} />
    <circle cx={x} cy={y} r={14} fill="#ffb347" opacity={0.3 * k} />
  </g>
);
const FUSE_F: V2 = [96, -366], FUSE_B: V2 = [-66, -366];
const Fuse: React.FC<{ at: V2; dir: 1 | -1; frame: number; seed: number; k?: number }> = ({ at, dir, frame, seed, k = 1 }) => {
  const tip: V2 = [at[0] + 6 * dir, at[1] + 40];
  return (
    <g>
      <path d={`M ${at[0]} ${at[1]} q ${10 * dir} 16 ${6 * dir} 40`} stroke="#8a6a3a" strokeWidth={6} fill="none" strokeLinecap="round" />
      <Smoke x={tip[0]} y={tip[1]} frame={frame} seed={seed} k={k} />
    </g>
  );
};
/** Blackbeard (or any costumed figure) in the side pose; overlays share the rig transform. */
export const Figure: React.FC<{
  x: number; y: number; s: number; facing?: 1 | -1; A1?: number; A2?: number; lean?: number; expression?: "neutral" | "happy" | "scared" | "determined" | "sad";
  colors: Partial<KitColors>; hat?: string; trim?: string; beard?: boolean; ribbons?: number; fuses?: 0 | 1 | 2; sling?: number[] | null; frame: number; walking?: boolean; holdingRope?: boolean; children?: React.ReactNode;
}> = ({ x, y, s, facing = 1, A1, A2, lean = 0, expression = "determined", colors, hat, trim, beard, ribbons = 3, fuses = 0, sling = null, frame, walking, holdingRope, children }) => (
  <g>
    <Person x={x} y={y} s={s} kit={{ pose: "side", facing, colors, expression, armAngle: A1, farArmAngle: A2, lean, walking, holdingRope }} />
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${lean}) scale(${facing} 1)`}>
      {sling && <Sling pistols={sling} />}
      {beard && <Beard ribbons={ribbons} />}
      {hat && <Tricorn color={hat} trim={trim} />}
      {fuses >= 1 && <Fuse at={FUSE_B} dir={-1} frame={frame} seed={3} />}
      {fuses >= 2 && <Fuse at={FUSE_F} dir={1} frame={frame} seed={11} />}
      {children}
    </g>
  </g>
);
/** rig-unit point → world (same transform as Figure) */
const toW = (x: number, y: number, s: number, facing: 1 | -1, lean: number, p: V2): V2 => {
  const l = (lean * Math.PI) / 180, px = p[0] * facing, py = p[1];
  return [x + s * (px * Math.cos(l) - py * Math.sin(l)), y + s * (px * Math.sin(l) + py * Math.cos(l))];
};

// ---------- ships and sea ----------
export const Sloop: React.FC<{ x: number; y: number; s?: number; flip?: boolean; sail?: string; hull?: string; flag?: "black" | "navy" | "merchant"; frame: number; flagY?: number; dark?: boolean }> = ({ x, y, s = 1, flip, sail = "#efe3c4", hull = "#5a3a22", flag = "black", frame, flagY = 0, dark }) => {
  const wave = Math.sin(frame * 0.25) * 6;
  const fl = (dy: number) => `M 22 ${-560 + dy} Q ${60} ${-570 + dy + wave} 100 ${-560 + dy} L 100 ${-505 + dy} Q 60 ${-515 + dy + wave} 22 ${-505 + dy} Z`;
  const c = (v: string) => (dark ? "#1a1418" : v);
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s}) rotate(${Math.sin(frame * 0.09) * 1.5})`}>
      <line x1={290} y1={-50} x2={430} y2={-96} stroke={c("#4a2e18")} strokeWidth={12} strokeLinecap="round" />
      <path d="M 25 -540 L 425 -96 L 40 -120 Z" fill={c(sail)} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <line x1={20} y1={-50} x2={20} y2={-580} stroke={c("#4a2e18")} strokeWidth={16} />
      <path d="M 10 -110 L -270 -95 Q -230 -300 -190 -470 L 10 -530 Z" fill={c(sail)} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d="M -300 -64 L 300 -64 Q 296 -10 250 34 L -262 34 Q -304 -10 -300 -64 Z" fill={c(hull)} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <rect x={-296} y={-56} width={590} height={12} fill={c("#c9a24a")} opacity={0.7} />
      {[-200, -100, 0, 100, 200].map((gx) => <rect key={gx} x={gx - 12} y={-34} width={24} height={18} rx={3} fill={c("#2a1a10")} />)}
      {flag === "black" && <path d={fl(flagY)} fill="#141016" stroke={INK} strokeWidth={4} />}
      {flag === "navy" && <g><path d={fl(flagY)} fill={c("#b8282a")} stroke={INK} strokeWidth={4} /><rect x={24} y={-558 + flagY} width={34} height={26} fill={c("#1f3a8a")} /><path d={`M 24 ${-545 + flagY} h 34 M 41 ${-558 + flagY} v 26`} stroke={c("#fff")} strokeWidth={5} /></g>}
      {flag === "merchant" && <path d={fl(flagY)} fill={c("#b8282a")} stroke={INK} strokeWidth={4} />}
    </g>
  );
};
const Sea: React.FC<{ y: number; frame: number; color?: string; light?: string }> = ({ y, frame, color = "#2f6f7d", light = "#cfe8ea" }) => (
  <g>
    <rect x={-60} y={y} width={1200} height={2100 - y} fill={color} />
    {Array.from({ length: 30 }, (_, i) => {
      const yy = y + 14 + rnd(i) * 420, x = ((rnd(i + 9) * 1300 + frame * (0.6 + rnd(i + 3))) % 1300) - 110;
      return <path key={i} d={`M ${x} ${yy} q 26 -9 52 0`} stroke={light} strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.6} />;
    })}
  </g>
);
/** ship deck: bulwark behind the actors, planks in front */
const Deck: React.FC<{ y?: number; mast?: number }> = ({ y = GY + 20, mast }) => (
  <g>
    <rect x={-60} y={y - 120} width={1200} height={100} fill="#6a4426" stroke={INK} strokeWidth={5} />
    <rect x={-60} y={y - 132} width={1200} height={18} fill="#8a5a32" stroke={INK} strokeWidth={4} />
    {Array.from({ length: 12 }, (_, i) => <line key={i} x1={i * 100 + 20} x2={i * 100 + 20} y1={y - 114} y2={y - 22} stroke="#4a2e18" strokeWidth={4} />)}
    {mast !== undefined && <rect x={mast - 22} y={-200} width={44} height={y - 10 + 200} fill="#5a3a20" stroke={INK} strokeWidth={5} />}
    <rect x={-60} y={y - 22} width={1200} height={2150 - y} fill="#9a6a3c" />
    {Array.from({ length: 16 }, (_, i) => <line key={i} x1={-60} x2={1140} y1={y + i * 42} y2={y + i * 42} stroke="#7a5230" strokeWidth={4} />)}
  </g>
);

// ---------- 1 + 17: HOOK / LOOP — Blackbeard tucks a burning fuse under his hat ----------
/** u = 0 is frame 0: the arm is mid-raise with the second fuse. Loop runs u from -2.95 up to 0. */
export const SceneFuse: React.FC<SP & { u0: number }> = ({ lt, frame, u0 }) => {
  const u = u0 + lt;
  const A1 = lerpA(u, [[-1.0, -25], [1.2, -150], [1.7, -150], [2.7, -22]]);
  const x = 420, y = GY + 210, s = 1.5;
  const tucked = u >= 1.45;
  const h = handAt(x, y, s, 1, A1);
  const glow = u < -1.8 ? interpolate(u, [-2.9, -2.1], [0.2, 1], cl) : 1;
  const push = 1 + 0.05 * interpolate(u, [-3, 3], [0, 1], cl);
  return (
    <g transform={`translate(540 1100) scale(${push}) translate(-540 -1100)`}>
      <Sky top="#4a3a4a" bottom="#e8a060" sun={{ x: 820, y: 900, r: 70, color: "#ffd9a0" }} />
      <Sea y={940} frame={frame} color="#3a5f6a" light="#e8c8a0" />
      <Sloop x={860} y={985} s={0.24} flag="merchant" frame={frame} sail="#f4ead0" hull="#7a5230" />
      <Deck mast={120} />
      <Figure x={x} y={y} s={s} A1={A1} A2={-8} colors={BB} hat="#141016" beard fuses={tucked ? 2 : 1} sling={[0.22, 0.5, 0.78]} frame={frame} expression="determined" />
      {!tucked && <g>
        <path d={`M ${h[0]} ${h[1]} q 8 20 4 44`} stroke="#8a6a3a" strokeWidth={9} fill="none" strokeLinecap="round" />
        <Smoke x={h[0] + 4} y={h[1] + 44} frame={frame} seed={11} k={glow} n={6} h={150} />
      </g>}
    </g>
  );
};

// ---------- 3: a merchant captain spots the pirate sloop ----------
export const SceneLookout: React.FC<SP> = ({ lt, frame }) => {
  const x = 330, y = GY + 200, s = 1.25;
  const lower = interpolate(lt, [1.5, 2.0], [0, 1], cl);
  const A1 = -118 + 88 * ease(lower), A2 = -112 + 100 * ease(lower);
  const h = handAt(x, y, s, 1, A1);
  const eye = toW(x, y, s, 1, 0, [58, -336]);
  const dir: V2 = lower < 0.01 ? [h[0] - eye[0], h[1] - eye[1]] : [Math.cos(((-14 + 60 * lower) * Math.PI) / 180), Math.sin(((-14 + 60 * lower) * Math.PI) / 180)];
  const L = Math.hypot(dir[0], dir[1]), ux = dir[0] / L, uy = dir[1] / L;
  const a: V2 = lower < 0.01 ? eye : [h[0] - ux * 80 * s, h[1] - uy * 80 * s], b: V2 = [h[0] + ux * 70 * s, h[1] + uy * 70 * s];
  const near = interpolate(lt, [0, 2.8], [0.2, 0.34], cl);
  return (
    <g>
      <Sky top="#7fb0d0" bottom="#e9f1ee" clouds={3} drift={lt} />
      <Sea y={950} frame={frame} />
      <Sloop x={900 - lt * 30} y={995} s={near} flag="black" frame={frame} sail="#3a3438" hull="#2a2024" />
      <Deck mast={980} />
      <Person x={760} y={GY + 170} s={0.95} kit={{ pose: "side", facing: 1, colors: SAILOR, armAngle: lt > 0.6 ? -95 : -10, farArmAngle: -6, expression: lt > 0.6 ? "scared" : "neutral" }} />
      <Figure x={x} y={y} s={s} A1={A1} A2={A2} colors={CAPTAIN} hat="#4a3220" frame={frame} expression={lower > 0.5 ? "scared" : "neutral"} />
      <path d={`M ${a[0]} ${a[1]} L ${b[0]} ${b[1]}`} stroke="#3a2a1a" strokeWidth={22 * s} strokeLinecap="round" />
      <path d={`M ${a[0]} ${a[1]} L ${b[0]} ${b[1]}`} stroke="#c9a24a" strokeWidth={12 * s} strokeLinecap="round" />
      <circle cx={h[0]} cy={h[1]} r={13 * s} fill="#eebf98" stroke={INK} strokeWidth={3} />
    </g>
  );
};

// ---------- 4: close-up, smoke around the face ("Fear.") ----------
export const SceneFace: React.FC<SP> = ({ lt, frame }) => {
  const s = 3.3 + lt * 0.12;
  return (
    <g>
      <rect x={-60} y={-60} width={1200} height={2200} fill="#3a2a2a" />
      <circle cx={540} cy={820} r={700} fill="#6a3a2a" opacity={0.5} />
      <Figure x={540 - 10 * s} y={830 + 338 * s} s={s} A1={-8} A2={-8} colors={BB} hat="#141016" beard fuses={2} sling={[0.22, 0.5, 0.78]} frame={frame + 40} expression="determined" />
    </g>
  );
};

// ---------- 5: braids and ribbons ----------
export const SceneRibbons: React.FC<SP> = ({ lt, frame }) => {
  const x = 470, y = GY + 520, s = 2.5;
  const tied = lt > 1.25;
  const A1 = lerpA(lt, [[0, -70], [1.1, -48], [1.4, -48], [2.2, -12]]);
  const h = handAt(x, y, s, 1, A1);
  const knot = toW(x, y, s, 1, 0, [38, -170]);
  return (
    <g>
      <rect x={-60} y={-60} width={1200} height={2200} fill="#c9a074" />
      <Sky top="#d8b88a" bottom="#efd6b0" />
      <Deck y={GY + 160} />
      <Figure x={x} y={y} s={s} A1={A1} A2={-6} colors={BB} hat="#141016" beard ribbons={tied ? 3 : 2} fuses={0} sling={[0.22, 0.5, 0.78]} frame={frame} expression="neutral" />
      {!tied && <path d={`M ${knot[0]} ${knot[1]} Q ${(knot[0] + h[0]) / 2} ${(knot[1] + h[1]) / 2 + 16} ${h[0]} ${h[1]}`} stroke="#d23a2a" strokeWidth={10} fill="none" strokeLinecap="round" />}
      {tied && lt < 1.6 && <circle cx={knot[0]} cy={knot[1]} r={40 * (lt - 1.25) * 4} fill="none" stroke="#fff" strokeWidth={5} opacity={1 - (lt - 1.25) / 0.35} />}
      <Label x={540} y={380} lt={lt} at={0.25} text="RIBBONS IN HIS BEARD" size={46} />
    </g>
  );
};

// ---------- 6: he holsters a pistol on the bandolier ----------
export const ScenePistols: React.FC<SP> = ({ lt, frame }) => {
  const x = 430, y = GY + 330, s = 1.95;
  const A1 = lerpA(lt, [[0, -2], [0.8, -22], [1.2, -22], [1.8, -4]]);
  const placed = lt >= 1.0;
  const h = handAt(x, y, s, 1, A1);
  const pull = Math.sin(frame * 0.16) > 0 ? 1 : 0;
  return (
    <g>
      <Sky top="#8fb6cf" bottom="#eef0e6" clouds={2} drift={lt} />
      <Sea y={930} frame={frame} />
      <Deck mast={900} />
      {(() => { const rx = 800 + pull * 6, ry = GY + 140, rh = handAt(rx, ry, 0.9, 1, -95, -8 - pull * 4); return <g>
        <path d={`M ${rh[0] - 30} ${rh[1] + 10} L ${900} ${-50}`} stroke="#8a6a3a" strokeWidth={7} />
        <Person x={rx} y={ry} s={0.9} kit={{ pose: "side", facing: 1, colors: PIRATE, armAngle: -95, farArmAngle: -100, lean: -8 - pull * 4, expression: "determined" }} />
      </g>; })()}
      <Figure x={x} y={y} s={s} A1={A1} A2={-6} colors={BB} hat="#141016" beard fuses={0} sling={placed ? [0.22, 0.5, 0.78, 0.98] : [0.22, 0.5, 0.78]} frame={frame} expression="determined" />
      {!placed && <Pistol x={h[0] - 4} y={h[1] + 4} rot={58 + (A1 + 22) * 1.5} s={0.9 * s} />}
    </g>
  );
};

// ---------- 7: the merchant crew gives up ----------
export const SceneSurrender: React.FC<SP> = ({ lt, frame }) => {
  const k = ease(interpolate(lt, [0.6, 3.0], [0, 1], cl));
  const A1 = -150 + 95 * k;
  const cx = 360, cy = GY + 190, s = 1.15;
  const h = handAt(cx, cy, s, -1, A1);
  const mastX = 170, flagTop = 300 + k * 520;
  const up1 = interpolate(lt, [0.9, 1.3], [-8, -160], cl), up2 = interpolate(lt, [1.6, 2.0], [-8, -165], cl);
  return (
    <g>
      <Sky top="#8fb6cf" bottom="#eef0e6" clouds={2} drift={lt} />
      <Sea y={930} frame={frame} />
      <Sloop x={870} y={1020} s={0.62} flag="black" frame={frame} sail="#3a3438" hull="#2a2024" />
      <Deck />
      <rect x={mastX - 20} y={180} width={40} height={GY - 160} fill="#5a3a20" stroke={INK} strokeWidth={5} />
      <circle cx={mastX} cy={196} r={12} fill="#3a2a1a" />
      <path d={`M ${mastX + 20} ${flagTop} q 60 ${-10 + Math.sin(frame * 0.3) * 8} 120 0 v 70 q -60 ${-10 + Math.sin(frame * 0.3) * 8} -120 0 Z`} fill="#b8282a" stroke={INK} strokeWidth={4} />
      <path d={`M ${mastX + 6} 196 L ${mastX + 20} ${flagTop}`} stroke="#d8c8a0" strokeWidth={4} />
      <path d={`M ${mastX + 6} 196 L ${h[0]} ${h[1]}`} stroke="#d8c8a0" strokeWidth={5} />
      <Figure x={cx} y={cy} s={s} facing={-1} A1={A1} A2={-10} colors={CAPTAIN} hat="#4a3220" frame={frame} expression="sad" />
      <Person x={640} y={GY + 175} s={1.0} kit={{ pose: "side", facing: 1, colors: SAILOR, armAngle: up1, farArmAngle: up1 + 8, expression: "scared" }} />
      <Person x={800} y={GY + 150} s={0.92} kit={{ pose: "side", facing: 1, colors: { ...SAILOR, coat: "#6a5a3a", coatShade: "#54472e", coatLight: "#7a6a48" }, armAngle: up2, farArmAngle: up2 + 6, expression: "scared" }} />
    </g>
  );
};

// ---------- 9: a hostage is marched across the deck ----------
export const SceneHostage: React.FC<SP> = ({ lt, frame }) => {
  const s = 1.15, xp = 170 + lt * 115, y = GY + 190;
  const xh = xp + 160 * s;
  return (
    <g>
      <Sky top="#9cc0d6" bottom="#f0ece0" />
      <Sea y={960} frame={frame} />
      {[[80, 60], [190, 90], [300, 70], [430, 110], [560, 80], [690, 95]].map(([x, hh], i) => <rect key={i} x={x} y={960 - hh} width={100} height={hh} fill="#c8b89a" stroke="#7a6a52" strokeWidth={3} />)}
      <path d="M 470 850 L 490 790 L 510 850 Z" fill="#b8a888" stroke="#7a6a52" strokeWidth={3} />
      <Label x={330} y={760} lt={lt} at={0.1} text="CHARLESTON" size={34} />
      <Deck />
      <Figure x={xh} y={y} s={s} A1={-6} A2={-4} colors={GENT} hat="#2a2420" frame={frame} expression="scared" walking />
      <Figure x={xp} y={y} s={s} A1={-75} A2={-8} colors={PIRATE} hat="#2a1a14" frame={frame} expression="determined" walking />
    </g>
  );
};

// ---------- 10: the ransom chest is opened: medicine ----------
export const SceneChest: React.FC<SP> = ({ lt, frame }) => {
  const x = 300, y = GY + 470, s = 2.2;
  const A1 = lerpA(lt, [[0, -40], [0.3, -40], [1.2, -88], [2.8, -88]]);
  const h = handAt(x, y, s, 1, A1);
  const hinge: V2 = [880, h[1] + 0];
  const bx0 = 520, bx1 = 880, by = GY + 180;
  const lid0: V2 = [bx0, by - 210];
  const lip: V2 = A1 > -41 ? lid0 : h;
  const open = interpolate(-A1, [40, 88], [0, 1], cl);
  return (
    <g>
      <rect x={-60} y={-60} width={1200} height={2200} fill="#3a2a22" />
      <circle cx={700} cy={1000} r={520} fill="#6a4a32" opacity={0.55} />
      <Deck y={GY + 200} />
      <Figure x={x} y={y} s={s} A1={A1} A2={-10} colors={BB} hat="#141016" beard fuses={0} sling={[0.22, 0.5, 0.78]} frame={frame} expression={open > 0.7 ? "neutral" : "determined"} />
      <rect x={bx0} y={by - 210} width={bx1 - bx0} height={210} fill="#7a4a24" stroke={INK} strokeWidth={6} />
      {open > 0.2 && <g opacity={interpolate(open, [0.2, 0.6], [0, 1], cl)}>
        {[0, 1, 2, 3, 4].map((i) => <g key={i} transform={`translate(${bx0 + 50 + i * 66} ${by - 210})`}><rect x={-18} y={-70} width={36} height={70} rx={8} fill={["#7a9a6a", "#a8c8d8", "#8a5a3a", "#c8d8b8", "#6a7a9a"][i]} stroke={INK} strokeWidth={4} /><rect x={-8} y={-88} width={16} height={20} fill="#c9a074" stroke={INK} strokeWidth={3} /></g>)}
      </g>}
      <rect x={bx0} y={by - 210} width={bx1 - bx0} height={40} fill="#5a3418" stroke={INK} strokeWidth={5} />
      {[bx0 + 60, bx1 - 60].map((bx) => <rect key={bx} x={bx - 12} y={by - 210} width={24} height={210} fill="#3a2a1a" opacity={0.7} />)}
      {/* lid: hinge at the back edge, front lip in the hand */}
      <path d={`M ${hinge[0]} ${by - 210} L ${lip[0] + 10} ${lip[1] + (open > 0 ? 0 : 0)} L ${lip[0] + 10} ${lip[1] - 40} L ${hinge[0]} ${by - 250} Z`} fill="#8a5a2a" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <Label x={700} y={by - 470} lt={lt} at={1.25} text="MEDICINE" size={56} />
    </g>
  );
};

// ---------- 11: the town pays; the hostage goes free ----------
export const SceneFree: React.FC<SP> = ({ lt, frame }) => {
  const s = 1.1, cx = 690, cy = GY + 200;
  const A = lerpA(lt, [[0, -30], [1.0, -62], [2.8, -62]]);
  const h1 = handAt(cx, cy, s, -1, A), h2 = handAt(cx, cy, s, -1, A + 6);
  const set = lt > 1.0;
  const chestC: V2 = set ? [h1[0] - 30, cy - 60] : [(h1[0] + h2[0]) / 2 - 40, (h1[1] + h2[1]) / 2 + 30];
  const gx = 360 - lt * 120;
  return (
    <g>
      <Sky top="#9cc0d6" bottom="#f0ece0" clouds={2} drift={lt} />
      <Sea y={960} frame={frame} />
      {[[60, 70], [170, 100], [290, 80], [420, 120], [560, 90]].map(([x, hh], i) => <rect key={i} x={x} y={960 - hh} width={110} height={hh} fill="#c8b89a" stroke="#7a6a52" strokeWidth={3} />)}
      <Deck />
      <g transform={`translate(${chestC[0]} ${chestC[1]})`}>
        <rect x={-80} y={-60} width={160} height={110} fill="#7a4a24" stroke={INK} strokeWidth={5} />
        <rect x={-84} y={-74} width={168} height={26} rx={6} fill="#8a5a2a" stroke={INK} strokeWidth={5} />
      </g>
      <Figure x={cx} y={cy} s={s} facing={-1} A1={set ? -20 : A} A2={set ? -14 : A + 6} colors={KEEPER} hat="#3a2a1a" frame={frame} expression="neutral" />
      <Figure x={gx} y={GY + 190} s={s} facing={-1} A1={-6} A2={-4} colors={GENT} hat="#2a2420" frame={frame} expression={lt > 1.4 ? "happy" : "neutral"} walking />
    </g>
  );
};

// ---------- 14: Ocracoke: the last fight ----------
export const SHOT_TIMES = [0.12, 0.3, 0.52, 0.7, 0.92];
export const CLASH_TIMES = [1.75, 2.3];
const Sword: React.FC<{ hand: V2; shoulder: V2; len: number; color?: string }> = ({ hand, shoulder, len, color = "#d8dde2" }) => {
  const dx = hand[0] - shoulder[0], dy = hand[1] - shoulder[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
  const tip: V2 = [hand[0] + ux * len, hand[1] + uy * len];
  return <g><path d={`M ${hand[0] - ux * 14} ${hand[1] - uy * 14} L ${tip[0]} ${tip[1]}`} stroke="#1a1418" strokeWidth={14} strokeLinecap="round" /><path d={`M ${hand[0] + ux * 10} ${hand[1] + uy * 10} L ${tip[0]} ${tip[1]}`} stroke={color} strokeWidth={8} strokeLinecap="round" /><circle cx={hand[0]} cy={hand[1]} r={14} fill="#c9a24a" stroke={INK} strokeWidth={3} /></g>;
};
export const SceneDuel: React.FC<SP> = ({ lt, frame }) => {
  const s = 1.3, mx = 330, bx = 760, y = GY + 210;
  const swing = (t0: number) => Math.max(0, 1 - Math.abs(lt - t0) / 0.25);
  const c = Math.max(...CLASH_TIMES.map(swing));
  const Am = -60 - 55 * c, Ab = -60 - 55 * c;
  const stagger = interpolate(lt, [2.6, 3.1], [0, 1], cl);
  const hm = handAt(mx, y, s, 1, Am), hb = handAt(bx, y, s, -1, Ab, 14 * stagger);
  const shm = toW(mx, y, s, 1, 0, [0, -284]), shb = toW(bx, y, s, -1, 14 * stagger, [0, -284]);
  const sinceShot = Math.min(...SHOT_TIMES.map((t) => (lt >= t ? lt - t : 9)));
  const sinceClash = Math.min(...CLASH_TIMES.map((t) => (lt >= t ? lt - t : 9)));
  const mid: V2 = [(hm[0] + hb[0]) / 2, (hm[1] + hb[1]) / 2 - 40];
  return (
    <g>
      <Sky top="#5a5a6a" bottom="#d8b890" />
      <Sea y={950} frame={frame} color="#4a6a72" />
      <Deck />
      {/* navy marksman, far left: musket in both hands, muzzle flash on each shot */}
      <Figure x={110} y={GY + 150} s={0.9} A1={-88} A2={-84} colors={SAILOR} frame={frame} expression="determined" />
      {(() => { const h = handAt(110, GY + 150, 0.9, 1, -88); return <g><path d={`M ${h[0] - 40} ${h[1] + 6} L ${h[0] + 120} ${h[1] - 6}`} stroke="#3a2a1a" strokeWidth={11} strokeLinecap="round" />
        {sinceShot < 0.18 && <g><circle cx={h[0] + 135} cy={h[1] - 7} r={26} fill="#ffd060" /><circle cx={h[0] + 135} cy={h[1] - 7} r={12} fill="#fff" /></g>}
        {sinceShot < 1.2 && <circle cx={h[0] + 150 + sinceShot * 80} cy={h[1] - 20 - sinceShot * 50} r={20 + sinceShot * 50} fill="#e8e2d8" opacity={0.6 * (1 - sinceShot / 1.2)} />}</g>; })()}
      <Figure x={mx} y={y} s={s} A1={Am} A2={-20} colors={NAVY} hat="#141016" trim="#e0b84a" frame={frame} expression="determined" />
      <Sword hand={hm} shoulder={shm} len={190 * s} />
      <Figure x={bx} y={y} s={s} facing={-1} A1={Ab} A2={-20} lean={14 * stagger} colors={BB} hat="#141016" beard fuses={2} sling={[0.22, 0.5, 0.78]} frame={frame} expression={stagger > 0.3 ? "sad" : "determined"} />
      <Sword hand={hb} shoulder={shb} len={190 * s} color="#c8ccd0" />
      {sinceClash < 0.22 && Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2, r = 20 + sinceClash * 300; return <line key={i} x1={mid[0] + Math.cos(a) * r * 0.4} y1={mid[1] + Math.sin(a) * r * 0.4} x2={mid[0] + Math.cos(a) * r} y2={mid[1] + Math.sin(a) * r} stroke="#ffe08a" strokeWidth={6} strokeLinecap="round" />; })}
      <Label x={540} y={700} lt={lt} at={0.05} text="NOV 22, 1718" size={42} />
    </g>
  );
};

// ---------- 15: the Navy sloop sails home at sunset ----------
export const SceneBowsprit: React.FC<SP> = ({ lt, frame }) => (
  <g>
    <Sky top="#3a2a4a" bottom="#f0904a" sun={{ x: 540, y: 960, r: 110, color: "#ffd080" }} />
    <Sea y={980} frame={frame} color="#3a3048" light="#f0a060" />
    <Sloop x={760 - lt * 120} y={1060} s={0.85} flip flag="navy" frame={frame} dark />
    {[0, 1, 2].map((i) => { const gx = 200 + i * 130 + lt * 40, gy = 520 + i * 40 + Math.sin(frame * 0.2 + i) * 8; return <path key={i} d={`M ${gx - 22} ${gy} q 11 -12 22 0 q 11 -12 22 0`} stroke="#2a1a24" strokeWidth={5} fill="none" />; })}
  </g>
);

// ---------- 16: his hat on the deck, the fuses burning out ----------
export const SceneHat: React.FC<SP> = ({ lt, frame, dur }) => {
  const k = interpolate(lt, [0, dur], [1, 0.15], cl);
  const z = 1 + lt * 0.05;
  return (
    <g transform={`translate(540 1150) scale(${z}) translate(-540 -1150)`}>
      <rect x={-60} y={-60} width={1200} height={2200} fill="#5a4a4a" />
      <Sky top="#4a3a4a" bottom="#c88a5a" />
      <Deck y={GY - 60} />
      <path d="M 180 1420 L 760 1330" stroke="#1a1418" strokeWidth={18} strokeLinecap="round" />
      <path d="M 210 1416 L 760 1330" stroke="#c8ccd0" strokeWidth={10} strokeLinecap="round" />
      <circle cx={200} cy={1418} r={22} fill="#c9a24a" stroke={INK} strokeWidth={4} />
      <g transform="translate(560 2330) scale(2.4) rotate(-4)">
        <Tricorn />
        <path d={`M ${FUSE_F[0]} ${FUSE_F[1]} q 30 10 50 26`} stroke="#8a6a3a" strokeWidth={6} fill="none" />
        <path d={`M ${FUSE_B[0]} ${FUSE_B[1]} q -30 10 -50 26`} stroke="#8a6a3a" strokeWidth={6} fill="none" />
        <Smoke x={FUSE_F[0] + 50} y={FUSE_F[1] + 26} frame={frame} seed={5} k={k} n={7} h={160} />
        <Smoke x={FUSE_B[0] - 50} y={FUSE_B[1] + 26} frame={frame} seed={9} k={k} n={7} h={160} />
      </g>
    </g>
  );
};
