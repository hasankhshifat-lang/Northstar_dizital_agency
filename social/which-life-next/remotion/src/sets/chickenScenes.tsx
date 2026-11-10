import React from "react";
import { interpolate, Easing } from "remotion";
import { Ground, Hills, Person, Sky } from "./ponyScenes";
import { KEEPER } from "./ponyScenes";

/** Ground scenes for the Mike the Headless Chicken Short. lt = seconds since the scene started. */
const INK = "#2b1d14";
const W = 1080, GY = 1240;
const cl = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const pop = (lt: number, at: number, d = 0.28) => interpolate(lt, [at, at + d * 0.6, at + d], [0, 1.15, 1], cl);
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
type SP = { lt: number; dur: number; frame: number };

export const Label: React.FC<{ x: number; y: number; lt: number; at: number; text: string; size?: number; bg?: string; fg?: string; stroke?: string }> = ({ x, y, lt, at, text, size = 40, bg = "#1b140d", fg = "#fff", stroke = "#f2b84b" }) => {
  if (lt < at) return null;
  const w = text.length * size * 0.62 + 40;
  return (
    <g transform={`translate(${x} ${y}) scale(${pop(lt, at)})`}>
      <rect x={-w / 2} y={-size - 6} width={w} height={size + 26} rx={14} fill={bg} stroke={stroke} strokeWidth={5} />
      <text y={4} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={size} fill={fg}>{text}</text>
    </g>
  );
};

/** A rooster facing right, origin = feet centre, ~300 px tall at s=1. head=false → cartoon neck stump. */
export const Chicken: React.FC<{ x: number; y?: number; s?: number; head?: boolean; flip?: boolean; walk?: number; rot?: number; wob?: number }> = ({ x, y = GY + 150, s = 1, head = true, flip, walk = 0, rot = 0, wob = 0 }) => {
  const body = "#b0561f", dark = "#7d3a12", sw = Math.sin(walk) * 26, sw2 = Math.sin(walk + Math.PI) * 26;
  const leg = (dx: number, sx: number) => (
    <g>
      <path d={`M ${dx} -78 L ${dx + sx} -6`} stroke="#e0a526" strokeWidth={11} strokeLinecap="round" />
      <path d={`M ${dx + sx - 6} -6 L ${dx + sx + 30} -6 M ${dx + sx} -6 L ${dx + sx + 22} -20`} stroke="#e0a526" strokeWidth={9} strokeLinecap="round" />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot + wob * Math.sin(walk * 1.3) * 6} 0 0) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx={10} cy={4} rx={110} ry={14} fill="#000" opacity={0.18} />
      {leg(-14, sw)}{leg(26, sw2)}
      {/* tail */}
      <path d="M -70 -150 Q -150 -190 -150 -290 Q -110 -250 -60 -190 Z" fill="#2f5a3a" stroke={INK} strokeWidth={5} />
      <path d="M -72 -150 Q -170 -170 -196 -250 Q -130 -220 -66 -170 Z" fill="#1f1f22" stroke={INK} strokeWidth={5} />
      <path d="M -74 -140 Q -150 -130 -190 -190 Q -120 -170 -70 -150 Z" fill={dark} stroke={INK} strokeWidth={5} />
      {/* body */}
      <ellipse cx={0} cy={-135} rx={98} ry={70} fill={body} stroke={INK} strokeWidth={6} />
      <path d="M -60 -150 Q -10 -190 60 -140 Q 20 -90 -50 -100 Z" fill={dark} stroke={INK} strokeWidth={5} />
      {/* neck */}
      <path d="M 38 -180 Q 76 -220 66 -272 L 108 -272 Q 124 -210 92 -150 Z" fill={body} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      {head ? (
        <g>
          <circle cx={92} cy={-296} r={32} fill={body} stroke={INK} strokeWidth={6} />
          <circle cx={78} cy={-336} r={13} fill="#d8332a" stroke={INK} strokeWidth={4} /><circle cx={96} cy={-342} r={15} fill="#d8332a" stroke={INK} strokeWidth={4} /><circle cx={114} cy={-334} r={12} fill="#d8332a" stroke={INK} strokeWidth={4} />
          <path d="M 118 -304 L 152 -294 L 118 -284 Z" fill="#f2b84b" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          <ellipse cx={116} cy={-270} rx={9} ry={14} fill="#d8332a" stroke={INK} strokeWidth={3} />
          <circle cx={100} cy={-302} r={6} fill="#111" />
        </g>
      ) : (
        <ellipse cx={87} cy={-272} rx={22} ry={9} fill="#e08a8a" stroke={INK} strokeWidth={4} />
      )}
    </g>
  );
};

const Feathers: React.FC<{ x: number; y: number; lt: number; at: number }> = ({ x, y, lt, at }) => {
  const k = lt - at; if (k < 0 || k > 1.4) return null;
  return <g>{Array.from({ length: 9 }, (_, i) => { const a = (i / 9) * Math.PI * 2, d = k * (150 + rnd(i) * 130); return <ellipse key={i} cx={x + Math.cos(a) * d} cy={y + Math.sin(a) * d * 0.8 + k * k * 90} rx={22} ry={8} fill={i % 2 ? "#f4efe2" : "#b0561f"} stroke={INK} strokeWidth={2} transform={`rotate(${k * 300 + i * 40} ${x + Math.cos(a) * d} ${y + Math.sin(a) * d * 0.8})`} opacity={1 - k / 1.4} />; })}</g>;
};

export const Farm: React.FC<{ frame: number; night?: boolean; barn?: boolean }> = ({ frame, night, barn = true }) => (
  <g>
    {night ? <Sky top="#1a2240" bottom="#3a4a78" stars moon /> : <Sky top="#8fc4e0" bottom="#f7ecc8" sun={{ x: 220, y: 560, r: 90, color: "#fff4c4" }} clouds={3} drift={frame * 0.4} />}
    <Hills y={GY - 130} color={night ? "#2c3a4c" : "#93b078"} amp={70} seed={3} />
    <Ground color={night ? "#2a3a2c" : "#a8c070"} tuft={night ? "#1d2b20" : "#6b8a35"} />
    {barn && (
      <g transform={`translate(820 ${GY - 20})`}>
        <rect x={-190} y={-300} width={380} height={300} fill="#a8322a" stroke={INK} strokeWidth={6} />
        <path d="M -220 -290 L -130 -420 L 130 -420 L 220 -290 Z" fill="#7c241f" stroke={INK} strokeWidth={6} />
        <rect x={-70} y={-200} width={140} height={200} fill="#6b1d19" stroke={INK} strokeWidth={5} /><path d="M -70 -200 L 70 0 M 70 -200 L -70 0" stroke="#efe1b8" strokeWidth={8} />
      </g>
    )}
  </g>
);

// ---------- HOOK + LOOP: the headless chicken walks across the farm ----------
export const SceneHeadless: React.FC<SP & { loop?: boolean }> = ({ lt, dur, frame }) => {
  const x = 120 + (lt / Math.max(dur, 1)) * 640;
  return (
    <g>
      <Farm frame={frame} />
      <Chicken x={x} y={GY + 190} s={1.55} head={false} walk={lt * 9} wob={1} />
    </g>
  );
};

// ---------- the question: a cut-off chicken with ??? ----------
export const SceneQuestion: React.FC<SP> = ({ lt, frame }) => (
  <g>
    <Farm frame={frame} barn={false} />
    <Chicken x={420} y={GY + 220} s={1.8} head={false} walk={0} wob={0} />
    {[0, 1, 2].map((i) => {
      const a = pop(lt, 1.1 + i * 0.3 + 0.0, 0.3);
      return <text key={i} x={[560, 700, 470][i]} y={[GY - 330, GY - 420, GY - 470][i] + Math.sin(frame * 0.2 + i) * 8} fontFamily="Inter" fontWeight={900} fontSize={[170, 130, 110][i]} fill="#fff" stroke="#000" strokeWidth={10} paintOrder="stroke" textAnchor="middle" transform={`rotate(${[-12, 10, -4][i]} 600 ${GY - 400}) scale(${a})`} style={{ transformOrigin: "center" }}>?</text>;
    })}
  </g>
);

// ---------- the axe falls ----------
export const SceneAxe: React.FC<SP> = ({ lt, frame }) => {
  const swing = lt < 1.0 ? interpolate(lt, [0, 1.0], [-30, -75], cl) : interpolate(lt, [1.0, 1.55, 1.7], [-75, -75, 62], { ...cl, easing: Easing.in(Easing.cubic) });
  const hit = lt >= 1.7;
  const headK = Math.max(0, lt - 1.7);
  return (
    <g>
      <Farm frame={frame} barn={false} />
      <rect x={640} y={GY + 130} width={200} height={90} rx={12} fill="#8a5a32" stroke={INK} strokeWidth={6} />
      <Chicken x={740} y={GY + 140} s={1.2} head={!hit} walk={0} />
      {hit && <g transform={`translate(${860 + headK * 180} ${GY - 150 - headK * 260 + headK * headK * 520}) rotate(${headK * 500})`} opacity={interpolate(headK, [0.8, 1.3], [1, 0], cl)}>
        <circle r={32} fill="#b0561f" stroke={INK} strokeWidth={6} /><circle cx={-14} cy={-38} r={13} fill="#d8332a" stroke={INK} strokeWidth={4} /><path d="M 26 -8 L 60 2 L 26 12 Z" fill="#f2b84b" stroke={INK} strokeWidth={4} />
      </g>}
      <g transform="translate(330 0)"><Person x={0} y={GY + 250} s={0.95} kit={{ pose: "side", facing: 1, colors: KEEPER, expression: hit ? "scared" : "determined" } as never} /></g>
      {/* axe pivoting on the shoulder */}
      <g transform={`translate(380 ${GY + 250 - 290 * 0.95}) rotate(${swing})`}>
        <rect x={-8} y={-210} width={16} height={230} rx={6} fill="#8a5a32" stroke={INK} strokeWidth={4} />
        <path d="M -8 -210 L 64 -236 L 64 -150 L -8 -176 Z" fill="#c9ced4" stroke={INK} strokeWidth={5} />
      </g>
      {lt > 1.7 && lt < 1.95 && <rect width={W} height={2300} fill="#fff" opacity={0.7 * (1 - (lt - 1.7) / 0.25)} />}
      <Feathers x={760} y={GY - 40} lt={lt} at={1.7} />
      <Label x={540} y={GY - 560} lt={lt} at={0.15} text="FRUITA FARM, 1945" size={44} />
    </g>
  );
};

// ---------- the rooster gets back up and walks away ----------
export const SceneRise: React.FC<SP> = ({ lt, frame }) => {
  const rise = interpolate(lt, [0.5, 1.6], [84, 0], { ...cl, easing: Easing.out(Easing.cubic) });
  const walkX = lt < 2.9 ? 640 : 640 + (lt - 2.9) * 330;
  return (
    <g>
      <Farm frame={frame} barn={false} />
      <rect x={380} y={GY + 130} width={200} height={90} rx={12} fill="#8a5a32" stroke={INK} strokeWidth={6} />
      <Person x={230} y={GY + 250} s={0.95} kit={{ pose: "side", facing: 1, colors: KEEPER, expression: "scared" } as never} />
      <Chicken x={walkX} y={GY + 190} s={1.45} head={false} rot={rise} walk={lt > 2.9 ? lt * 9 : 0} wob={lt > 1.6 ? 1 : 0} />
      <text x={230} y={GY - 340} fontFamily="Inter" fontWeight={900} fontSize={110} fill="#ffd23f" stroke="#000" strokeWidth={9} paintOrder="stroke" textAnchor="middle" transform={`scale(${pop(lt, 1.8)})`} style={{ transformOrigin: "230px 900px" }}>!?</text>
    </g>
  );
};

// ---------- anatomy: jugular missed, brain stem left ----------
export const SceneAnatomy: React.FC<SP> = ({ lt, frame }) => {
  const pulse = 1 + 0.08 * Math.sin(frame * 0.4);
  return (
    <g>
      <rect width={W} height={2300} fill="#2a3b4a" />
      {Array.from({ length: 9 }, (_, i) => <rect key={i} y={i * 140} width={W} height={2} fill="#fff" opacity={0.06} />)}
      <g transform="translate(500 720)">
        <path d="M -70 120 L -90 600 L 100 600 L 80 130 Z" fill="#d8905a" stroke={INK} strokeWidth={7} />
        <circle r={190} fill="#d8905a" stroke={INK} strokeWidth={8} />
        <circle cx={-40} cy={-200} r={44} fill="#d8332a" stroke={INK} strokeWidth={6} /><circle cx={30} cy={-215} r={50} fill="#d8332a" stroke={INK} strokeWidth={6} /><circle cx={100} cy={-190} r={40} fill="#d8332a" stroke={INK} strokeWidth={6} />
        <path d="M 170 -30 L 300 10 L 170 50 Z" fill="#f2b84b" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <circle cx={90} cy={-50} r={18} fill="#111" />
        {/* jugular vein */}
        <path d="M 40 130 Q 60 300 40 560" stroke="#c0182e" strokeWidth={22} fill="none" strokeLinecap="round" opacity={interpolate(lt, [0.4, 0.8], [0, 1], cl)} />
        {/* brain stem */}
        {lt > 2.7 && <g transform={`translate(-20 70) scale(${pop(lt, 2.7) * pulse})`}><ellipse rx={62} ry={44} fill="#e7a3c4" stroke={INK} strokeWidth={6} /><rect x={-14} y={30} width={28} height={70} rx={12} fill="#e7a3c4" stroke={INK} strokeWidth={6} /></g>}
        {/* the cut */}
        {lt > 0.15 && <path d="M -150 400 L 190 400" stroke="#ffd23f" strokeWidth={10} strokeDasharray="26 16" strokeLinecap="round" opacity={interpolate(lt, [0.15, 0.4], [0, 1], cl)} />}
        {/* "missed" mark next to the vein cut */}
        {lt > 1.3 && <g transform={`translate(190 480) scale(${pop(lt, 1.3)})`}><circle r={52} fill="#2e7d32" stroke="#000" strokeWidth={6} /><path d="M -26 0 L -8 20 L 28 -22" stroke="#fff" strokeWidth={13} fill="none" strokeLinecap="round" /></g>}
      </g>
      <Label x={820} y={1100} lt={lt} at={1.26} text="JUGULAR VEIN: MISSED" size={36} bg="#c0182e" stroke="#fff" />
      <Label x={540} y={1580} lt={lt} at={2.9} text="BRAIN STEM: LEFT" size={44} bg="#e7a3c4" fg="#1b140d" stroke="#1b140d" />
    </g>
  );
};

// ---------- what the brain stem runs ----------
export const SceneBody: React.FC<SP> = ({ lt, frame }) => {
  const beat = 1 + 0.18 * Math.max(0, Math.sin(lt * 9)) ** 3;
  const walking = lt > 3.6;
  return (
    <g>
      <Farm frame={frame} barn={false} />
      <Chicken x={walking ? 380 + (lt - 3.6) * 260 : 400} y={GY + 220} s={1.75} head={false} walk={walking ? lt * 9 : 0} wob={walking ? 1 : 0} />
      {lt > 1.0 && <g transform={`translate(${walking ? 380 + (lt - 3.6) * 260 + 30 : 430} ${GY - 40}) scale(${beat * pop(lt, 1.38)})`}><path d="M 0 40 C -70 -10 -50 -70 0 -36 C 50 -70 70 -10 0 40 Z" fill="#d8332a" stroke={INK} strokeWidth={6} /></g>}
      <Label x={780} y={GY - 560} lt={lt} at={0.98} text="BREATHING" size={46} bg="#3b7ea1" />
      <Label x={780} y={GY - 450} lt={lt} at={1.38} text="HEARTBEAT" size={46} bg="#c0182e" />
      <Label x={780} y={GY - 340} lt={lt} at={2.1} text="BALANCE" size={46} bg="#6f7d3c" />
      {lt > 1.0 && lt < 3.0 && Array.from({ length: 3 }, (_, i) => { const k = ((lt * 0.8 + i / 3) % 1); return <circle key={i} cx={470 + i * 20} cy={GY - 130 - k * 140} r={12 + k * 20} fill="#fff" opacity={0.6 * (1 - k)} />; })}
    </g>
  );
};

// ---------- the eyedropper ----------
export const SceneFeed: React.FC<SP> = ({ lt, frame }) => {
  const bob = Math.sin(lt * 3) * 6;
  const dropK = (lt * 1.6) % 1;
  return (
    <g>
      <Farm frame={frame} barn={false} />
      <Person x={260} y={GY + 270} s={1.0} kit={{ pose: "side", facing: 1, colors: KEEPER, expression: "determined" } as never} />
      <Chicken x={760} y={GY + 230} s={1.5} head={false} flip walk={0} />
      {/* eyedropper held toward the neck stump */}
      <g transform={`translate(${380 + bob} ${GY - 120}) rotate(18)`}>
        <rect x={0} y={-16} width={190} height={32} rx={14} fill="#dff3ff" stroke={INK} strokeWidth={5} opacity={0.9} />
        <rect x={0} y={-10} width={120 * 0.8} height={20} rx={8} fill="#f4efe2" />
        <path d="M 190 -8 L 250 -3 L 250 3 L 190 8 Z" fill="#dff3ff" stroke={INK} strokeWidth={4} />
        <ellipse cx={-26} cy={0} rx={34} ry={26} fill="#8a2c26" stroke={INK} strokeWidth={5} />
      </g>
      {lt > 1.0 && <circle cx={650 - 10} cy={GY - 112 + dropK * 70} r={10} fill="#fff" stroke="#9fd2f0" strokeWidth={3} opacity={1 - dropK * 0.5} />}
      <Label x={540} y={GY - 560} lt={lt} at={0.3} text="EYEDROPPER" size={52} bg="#dff3ff" fg="#1b140d" stroke="#1b140d" />
      <Label x={540} y={GY - 440} lt={lt} at={2.4} text="MILK + WATER" size={52} bg="#fff" fg="#1b140d" stroke="#3b7ea1" />
    </g>
  );
};

// ---------- he gets a name ----------
export const SceneName: React.FC<SP> = ({ lt, frame }) => (
  <g>
    <Farm frame={frame} barn={false} />
    <Chicken x={400} y={GY + 230} s={1.7} head={false} walk={lt * 5} wob={0.6} />
    <g transform={`translate(790 ${GY + 120}) scale(${pop(lt, 0.9)})`}>
      <rect x={-12} y={-340} width={24} height={360} fill="#7a5230" stroke={INK} strokeWidth={5} />
      <rect x={-210} y={-520} width={420} height={200} rx={18} fill="#efe1b8" stroke={INK} strokeWidth={7} />
      <text y={-380} textAnchor="middle" fontFamily="Anton, Impact, sans-serif" fontWeight={900} fontSize={150} fill="#a8322a" stroke={INK} strokeWidth={4}>MIKE</text>
    </g>
  </g>
);

// ---------- Life magazine ----------
export const SceneLife: React.FC<SP> = ({ lt, frame }) => {
  const k = Easing.out(Easing.cubic)(interpolate(lt, [0, 0.5], [0, 1], cl));
  return (
    <g>
      <rect width={W} height={2300} fill="#3a2f3f" />
      {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={rnd(i) * W} cy={300 + rnd(i + 3) * 1200} r={5 + rnd(i + 9) * 8} fill="#ffe9a0" opacity={0.15 + 0.4 * Math.abs(Math.sin(frame * 0.1 + i))} />)}
      <g transform={`translate(540 ${GY - 100}) rotate(${-7 + (1 - k) * 25}) scale(${0.4 + 0.6 * k})`}>
        <rect x={-300} y={-440} width={600} height={800} fill="#f4efe2" stroke={INK} strokeWidth={8} />
        <rect x={-300} y={-440} width={190} height={92} fill="#c0182e" stroke={INK} strokeWidth={6} />
        <text x={-205} y={-370} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={64} fill="#fff">LIFE</text>
        <rect x={-250} y={-320} width={500} height={540} fill="#e8d9ae" stroke={INK} strokeWidth={5} />
        <Chicken x={0} y={140} s={1.5} head={false} walk={0} />
        <rect x={-250} y={240} width={500} height={90} fill="#1b140d" />
        <text y={305} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={44} fill="#ffd23f">THE CHICKEN WITH NO HEAD</text>
      </g>
      <Label x={540} y={GY - 700} lt={lt} at={0.15} text="LIFE MAGAZINE" size={56} bg="#c0182e" stroke="#fff" />
    </g>
  );
};

// ---------- the motel at night ----------
export const SceneMotel: React.FC<SP> = ({ lt, frame }) => {
  const down = interpolate(lt, [0.3, 1.2], [0, 84], { ...cl, easing: Easing.in(Easing.quad) });
  const sh = lt > 0.3 && lt < 1.2 ? Math.sin(lt * 40) * 10 : 0;
  return (
    <g>
      <Sky top="#10162e" bottom="#2e3a64" stars moon />
      <Ground color="#3b3a46" tuft="#2a2a33" kind="street" />
      <g transform={`translate(240 ${GY - 20})`}>
        <rect width={600} height={260} fill="#a8745a" stroke={INK} strokeWidth={6} />
        <rect x={-20} y={-30} width={640} height={40} fill="#6b3f2f" stroke={INK} strokeWidth={6} />
        {[0, 1, 2].map((i) => <rect key={i} x={50 + i * 190} y={70} width={110} height={120} fill={i === 1 ? "#ffe29a" : "#3a4a68"} stroke={INK} strokeWidth={5} />)}
      </g>
      <g transform="translate(900 640)">
        <rect x={-10} y={0} width={20} height={600} fill="#444" stroke={INK} strokeWidth={4} />
        <rect x={-130} y={-120} width={260} height={130} rx={14} fill="#1b140d" stroke="#ff4d6d" strokeWidth={6} />
        <text y={-30} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={54} fill="#ff4d6d" opacity={0.7 + 0.3 * Math.sin(frame * 0.5)}>MOTEL</text>
      </g>
      <Chicken x={560 + sh} y={GY + 230} s={1.35} head={false} rot={down} walk={lt * 12} wob={lt < 1.2 ? 1 : 0} />
      <Label x={540} y={GY - 560} lt={lt} at={0.1} text="ARIZONA MOTEL, 1947" size={44} />
    </g>
  );
};

// ---------- the missing syringe ----------
export const SceneSyringe: React.FC<SP> = ({ lt, frame }) => {
  const pulse = 0.55 + 0.45 * Math.sin(frame * 0.35);
  return (
    <g>
      <rect width={W} height={2300} fill="#1c2230" />
      <rect y={GY + 60} width={W} height={900} fill="#5a3b26" />
      <rect y={GY + 60} width={W} height={12} fill="#2b1d14" />
      {/* dashed outline where it should be, then MISSING */}
      <g transform={`translate(540 ${GY - 120}) rotate(-14)`}>
        <g opacity={lt < 1.9 ? 1 : 0.9}>
          <rect x={-260} y={-44} width={420} height={88} rx={14} fill="none" stroke="#ffd23f" strokeWidth={8} strokeDasharray="26 16" opacity={pulse} />
          <path d="M 160 -14 L 290 -4 L 290 4 L 160 14 Z" fill="none" stroke="#ffd23f" strokeWidth={8} strokeDasharray="14 10" opacity={pulse} />
          <rect x={-320} y={-60} width={60} height={120} rx={8} fill="none" stroke="#ffd23f" strokeWidth={8} strokeDasharray="20 12" opacity={pulse} />
        </g>
        {lt < 1.0 && <g opacity={interpolate(lt, [0, 0.9], [1, 0], cl)}>
          <rect x={-260} y={-44} width={420} height={88} rx={14} fill="#dff3ff" stroke={INK} strokeWidth={6} /><rect x={-250} y={-30} width={260} height={60} rx={8} fill="#f4efe2" />
          <path d="M 160 -14 L 290 -4 L 290 4 L 160 14 Z" fill="#c9ced4" stroke={INK} strokeWidth={4} /><rect x={-320} y={-60} width={60} height={120} rx={8} fill="#8a2c26" stroke={INK} strokeWidth={6} />
        </g>}
      </g>
      {lt > 1.9 && <g transform={`translate(540 ${GY - 520}) rotate(-8) scale(${pop(lt, 1.9, 0.3)})`}>
        <rect x={-330} y={-80} width={660} height={150} rx={10} fill="none" stroke="#ff4d6d" strokeWidth={12} />
        <text y={42} textAnchor="middle" fontFamily="Anton, Impact, sans-serif" fontSize={120} fill="#ff4d6d">MISSING</text>
      </g>}
      <Label x={540} y={GY + 120} lt={lt} at={0.2} text="SYRINGE TO CLEAR HIS THROAT" size={36} />
    </g>
  );
};
