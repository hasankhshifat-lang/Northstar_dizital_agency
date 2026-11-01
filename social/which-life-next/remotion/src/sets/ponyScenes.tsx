import React from "react";
import { interpolate, Easing } from "remotion";
import { Kit, KitColors, KitProps } from "../kit/Kit";
import { Horse } from "./horse";

/**
 * Native-vertical (1080×1920) ground scenes for map Shorts: the camera dives from the map into a place
 * and shows what the narration describes, with characters acting it out (GeoGlobeTales-style zoom-through).
 * Every scene takes lt = seconds since the scene started.
 */
const INK = "#2b1d14";
const W = 1080, GY = 1240; // ground line
const cl = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const pop = (lt: number, at: number, d = 0.28) => interpolate(lt, [at, at + d * 0.6, at + d], [0, 1.15, 1], cl);
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- characters ----------
export const SUIT: Partial<KitColors> = { coat: "#2f3640", coatShade: "#20252c", coatLight: "#3d4652", trousers: "#25282c", trousersShade: "#1b1d20", scarf: "#efe8d6", scarfShade: "#cfc6b0", cap: "#1f1f22", capShade: "#141416", button: "#c9c9c9", patch: "#3d4652" };
export const KEEPER: Partial<KitColors> = { coat: "#5c6b3a", coatShade: "#46522b", coatLight: "#6f7f48", scarf: "#c9a227", scarfShade: "#9b7c18", hair: "#3a2a1e", patch: "#6f7f48" };
export const CLERK: Partial<KitColors> = { coat: "#6b4f3a", coatShade: "#523b2a", coatLight: "#7d5d45", scarf: "#2b4a7a", scarfShade: "#1d3456", hair: "#2a1d14", cap: "#2b2b2b" };
export const WORKER: Partial<KitColors> = { coat: "#8a3a2a", coatShade: "#6a2c20", coatLight: "#a04634", scarf: "#3a5a8a", scarfShade: "#2a4266", hair: "#5a3a20", patch: "#a04634" };
export const TOWN = [
  { coat: "#3e4a5a", coatShade: "#2e3846", coatLight: "#4c5a6c", scarf: "#d9b44a", hair: "#2a1d14" },
  { coat: "#6b3a4a", coatShade: "#522c38", coatLight: "#7d4757", scarf: "#e8e2cf", hair: "#7a4320" },
  { coat: "#4a5a3a", coatShade: "#38462b", coatLight: "#5a6c48", scarf: "#c23b2c", hair: "#3a2a1e" },
  { coat: "#5a4a6a", coatShade: "#463a54", coatLight: "#6a5a7c", scarf: "#e0a030", hair: "#a8622f" },
] as Partial<KitColors>[];

export const Person: React.FC<{ x: number; y?: number; s?: number; kit?: KitProps; hat?: "top" | "none"; bob?: number }> = ({ x, y = GY, s = 1, kit = {}, hat, bob = 0 }) => (
  <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
    <Kit pose="front" {...kit} />
    {hat === "top" && (
      <g transform={`translate(${kit.pose === "side" ? 6 : 0} 0)`}>
        <rect x={-62} y={-500} width={124} height={118} rx={8} fill="#1b1b1e" stroke={INK} strokeWidth={4} />
        <rect x={-62} y={-410} width={124} height={16} fill="#5a1f1f" />
        <ellipse cx={0} cy={-382} rx={98} ry={18} fill="#1b1b1e" stroke={INK} strokeWidth={4} />
      </g>
    )}
  </g>
);

// ---------- scenery ----------
export const Sky: React.FC<{ top: string; bottom: string; sun?: { x: number; y: number; r: number; color: string }; stars?: boolean; moon?: boolean; clouds?: number; drift?: number }> = ({ top, bottom, sun, stars, moon, clouds = 0, drift = 0 }) => (
  <g>
    <defs><linearGradient id={`sky${top}${bottom}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bottom} /></linearGradient></defs>
    <rect width={W} height={GY + 10} fill={`url(#sky${top}${bottom})`} />
    {stars && Array.from({ length: 90 }, (_, i) => <circle key={i} cx={rnd(i) * W} cy={rnd(i + 99) * 900} r={1.5 + rnd(i + 7) * 2.5} fill="#fff" opacity={0.5 + 0.5 * rnd(i + 3)} />)}
    {moon && <g><circle cx={790} cy={330} r={90} fill="#fff6d8" /><circle cx={830} cy={305} r={80} fill={top} opacity={0.0} /></g>}
    {sun && <g><circle cx={sun.x} cy={sun.y} r={sun.r * 1.6} fill={sun.color} opacity={0.25} /><circle cx={sun.x} cy={sun.y} r={sun.r} fill={sun.color} /></g>}
    {Array.from({ length: clouds }, (_, i) => {
      const x = ((rnd(i) * 1400 - drift * (20 + i * 6)) % 1500 + 1500) % 1500 - 200, y = 180 + rnd(i + 5) * 420;
      return <g key={`c${i}`} opacity={0.9}><ellipse cx={x} cy={y} rx={130} ry={42} fill="#fff" /><ellipse cx={x + 70} cy={y - 26} rx={80} ry={40} fill="#fff" /><ellipse cx={x - 60} cy={y - 14} rx={70} ry={32} fill="#fff" /></g>;
    })}
  </g>
);
/** a band of hills; scroll in px for parallax */
export const Hills: React.FC<{ y: number; color: string; amp?: number; wave?: number; scroll?: number; seed?: number; flatTop?: boolean; snowCap?: boolean }> = ({ y, color, amp = 80, wave = 300, scroll = 0, seed = 1, flatTop, snowCap }) => {
  const pts: string[] = [];
  const off = ((scroll % (wave * 4)) + wave * 4) % (wave * 4);
  for (let x = -wave * 4; x <= W + wave * 4; x += 20) {
    const xx = x + off;
    let h = Math.sin((xx / wave) * Math.PI + seed) * 0.6 + Math.sin((xx / (wave * 0.37)) * Math.PI + seed * 2) * 0.4;
    if (flatTop) h = Math.min(0.55, h * 1.6);
    pts.push(`${x} ${y - amp * (h + 1) / 2}`);
  }
  return (
    <g>
      <path d={`M -${wave * 4} ${GY + 10} L ${pts.join(" L ")} L ${W + wave * 4} ${GY + 10} Z`} fill={color} stroke={INK} strokeWidth={3} strokeOpacity={0.35} />
      {snowCap && <path d={`M ${pts.join(" L ")}`} fill="none" stroke="#fff" strokeWidth={14} strokeOpacity={0.85} />}
    </g>
  );
};
export const Ground: React.FC<{ color: string; tuft?: string; scroll?: number; kind?: "grass" | "sand" | "snow" | "street" }> = ({ color, tuft = "#6b7a35", scroll = 0, kind = "grass" }) => (
  <g>
    <rect y={GY - 10} width={W} height={1920 - GY + 400} fill={color} />
    <rect y={GY - 10} width={W} height={8} fill={INK} opacity={0.25} />
    {Array.from({ length: 34 }, (_, i) => {
      const x = (((rnd(i) * 1400 - scroll * (0.8 + rnd(i + 2) * 0.6)) % 1400) + 1400) % 1400 - 160;
      const y = GY + 30 + rnd(i + 11) * 620, s = 0.6 + (y - GY) / 500;
      if (kind === "street") return <rect key={i} x={x} y={y} width={60 * s} height={6 * s} fill={tuft} opacity={0.35} />;
      if (kind === "sand") return <g key={i} transform={`translate(${x} ${y}) scale(${s})`}><ellipse rx={34} ry={14} fill={tuft} /><path d="M -20 -4 L -26 -24 M 0 -6 L 2 -30 M 20 -4 L 28 -22" stroke="#6b5a2a" strokeWidth={4} /></g>;
      if (kind === "snow") return <ellipse key={i} cx={x} cy={y} rx={50 * s} ry={9 * s} fill="#cfe0ee" />;
      return <path key={i} transform={`translate(${x} ${y}) scale(${s})`} d="M -16 0 L -10 -26 L -4 0 L 2 -34 L 8 0 L 14 -22 L 18 0 Z" fill={tuft} />;
    })}
  </g>
);
const Dust: React.FC<{ x: number; y: number; frame: number; color?: string; s?: number }> = ({ x, y, frame, color = "#d8c39a", s = 1 }) => (
  <g>{Array.from({ length: 7 }, (_, i) => { const k = (frame * 0.07 + i / 7) % 1; return <circle key={i} cx={x + k * 330 * s} cy={y - k * 70 * s} r={(20 + k * 60) * s} fill={color} opacity={0.6 * (1 - k)} />; })}</g>
);
const SpeedLines: React.FC<{ frame: number; color?: string }> = ({ frame, color = "#fff" }) => (
  <g opacity={0.5}>{Array.from({ length: 14 }, (_, i) => { const y = 300 + rnd(i) * 1100, x = ((rnd(i + 4) * 1400 + frame * 60) % 1500) - 200; return <rect key={i} x={x} y={y} width={180 + rnd(i) * 200} height={5} rx={3} fill={color} />; })}</g>
);
export const Cabin: React.FC<{ x: number; y?: number; s?: number; sign?: string }> = ({ x, y = GY, s = 1, sign }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-190} y={-260} width={380} height={260} fill="#8a5a32" stroke={INK} strokeWidth={5} />
    {Array.from({ length: 8 }, (_, i) => <line key={i} x1={-190} x2={190} y1={-260 + i * 33} y2={-260 + i * 33} stroke="#5e3b20" strokeWidth={5} />)}
    <path d="M -230 -255 L 0 -400 L 230 -255 Z" fill="#5a3a22" stroke={INK} strokeWidth={5} />
    <rect x={-50} y={-140} width={100} height={140} fill="#3a2618" stroke={INK} strokeWidth={4} />
    <rect x={90} y={-200} width={70} height={60} fill="#ffd27a" stroke={INK} strokeWidth={4} />
    <rect x={150} y={-430} width={34} height={90} fill="#6a6a6a" stroke={INK} strokeWidth={4} />
    {sign && <g transform="translate(0 -300)"><rect x={-150} y={-32} width={300} height={56} rx={6} fill="#efe1b8" stroke={INK} strokeWidth={4} /><text y={8} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={700} fontSize={28} fill={INK}>{sign}</text></g>}
  </g>
);
const Fence: React.FC<{ x0: number; x1: number; y?: number }> = ({ x0, x1, y = GY + 40 }) => (
  <g>
    {Array.from({ length: Math.floor((x1 - x0) / 90) + 1 }, (_, i) => <rect key={i} x={x0 + i * 90} y={y - 120} width={14} height={130} fill="#7a5230" stroke={INK} strokeWidth={3} />)}
    <rect x={x0} y={y - 105} width={x1 - x0 + 14} height={12} fill="#8a5a32" stroke={INK} strokeWidth={3} />
    <rect x={x0} y={y - 60} width={x1 - x0 + 14} height={12} fill="#8a5a32" stroke={INK} strokeWidth={3} />
  </g>
);
export const Storefront: React.FC<{ x: number; w: number; h: number; color: string; sign: string; y?: number }> = ({ x, w, h, color, sign, y = GY - 30 }) => (
  <g>
    <rect x={x} y={y - h} width={w} height={h} fill={color} stroke={INK} strokeWidth={5} />
    <rect x={x - 6} y={y - h - 40} width={w + 12} height={50} fill={color} stroke={INK} strokeWidth={5} />
    <rect x={x + 20} y={y - h + 30} width={w - 40} height={64} fill="#efe1b8" stroke={INK} strokeWidth={4} />
    <text x={x + w / 2} y={y - h + 74} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={700} fontSize={Math.min(34, (w - 60) / (sign.length * 0.6))} fill={INK}>{sign}</text>
    {Array.from({ length: Math.max(1, Math.floor(w / 140)) }, (_, i) => <rect key={i} x={x + 30 + i * 140} y={y - h + 130} width={90} height={110} fill="#ffe2a0" stroke={INK} strokeWidth={4} />)}
    <rect x={x + w / 2 - 45} y={y - 170} width={90} height={170} fill="#4a2f1c" stroke={INK} strokeWidth={4} />
  </g>
);
export const Pole: React.FC<{ x: number; y?: number; h?: number; rot?: number; s?: number; color?: string }> = ({ x, y = GY, h = 520, rot = 0, s = 1, color = "#6a4528" }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot})`}>
    <rect x={-11} y={-h} width={22} height={h} fill={color} stroke={INK} strokeWidth={4} />
    <rect x={-70} y={-h + 30} width={140} height={16} fill={color} stroke={INK} strokeWidth={4} />
    <circle cx={-56} cy={-h + 24} r={8} fill="#7fb6d6" stroke={INK} strokeWidth={3} /><circle cx={56} cy={-h + 24} r={8} fill="#7fb6d6" stroke={INK} strokeWidth={3} />
  </g>
);
const Bunting: React.FC<{ y: number }> = ({ y }) => (
  <g>
    <path d={`M 0 ${y} Q 270 ${y + 60} 540 ${y} Q 810 ${y + 60} 1080 ${y}`} fill="none" stroke={INK} strokeWidth={3} />
    {Array.from({ length: 16 }, (_, i) => { const x = 20 + i * 66, yy = y + Math.sin((i % 8) / 8 * Math.PI) * 52; return <path key={i} d={`M ${x} ${yy} l 40 0 l -20 42 Z`} fill={["#c62828", "#efe8d6", "#2b4a7a"][i % 3]} stroke={INK} strokeWidth={2} />; })}
  </g>
);
const Wall: React.FC<{ color?: string }> = ({ color = "#7a5a40" }) => (
  <g>
    <rect width={W} height={2300} fill={color} />
    {Array.from({ length: 14 }, (_, i) => <rect key={i} x={i * 80} width={40} height={1300} fill="#000" opacity={0.05} />)}
    <rect y={1040} width={W} height={260} fill="#5a3f2a" stroke={INK} strokeWidth={5} />
    <rect y={1300} width={W} height={1000} fill="#6e4b30" />
    {Array.from({ length: 16 }, (_, i) => <line key={i} x1={0} x2={W} y1={1330 + i * 62} y2={1330 + i * 62} stroke="#563a24" strokeWidth={4} />)}
  </g>
);

// ---------- the scenes ----------
type SP = { lt: number; dur: number; frame: number };

/** A: hook — galloping at full speed across the prairie at sunset */
export const SceneGallop: React.FC<SP & { sky?: [string, string]; ground?: string; hills?: [string, string]; sun?: string; silhouette?: boolean }> = ({ frame, sky = ["#f6b35c", "#fbe0a0"], ground = "#c9a85a", hills = ["#b98a50", "#9a7a44"], sun = "#fff2c0", silhouette }) => {
  const sc = frame * 26;
  const dark = "#1b130d";
  return (
    <g>
      <Sky top={sky[0]} bottom={sky[1]} sun={{ x: 760, y: 760, r: silhouette ? 230 : 120, color: sun }} clouds={silhouette ? 0 : 3} drift={frame * 0.5} />
      <Hills y={GY - 220} color={silhouette ? "#3a2418" : hills[0]} amp={160} wave={420} scroll={sc * 0.15} seed={2} />
      <Hills y={GY - 60} color={silhouette ? dark : hills[1]} amp={120} wave={300} scroll={sc * 0.4} seed={5} />
      <Ground color={silhouette ? dark : ground} tuft={silhouette ? "#000" : "#8a7a3a"} scroll={sc} />
      {!silhouette && <SpeedLines frame={frame} />}
      <g transform={`translate(560 ${GY + 160 + Math.abs(Math.sin(frame * 0.42)) * -14}) scale(1.95)`}>
        <Dust x={90} y={-6} frame={frame} color={silhouette ? "#3a2418" : "#e4d2a6"} />
        <Horse phase={frame * 0.85} galloping facing={1} color={silhouette ? "#120c08" : "#8a5a32"} />
      </g>
    </g>
  );
};

/** B: St. Joseph, Missouri — the railroad ends here */
export const SceneStJoseph: React.FC<SP> = ({ lt, frame }) => {
  const s = interpolate(lt, [0, 3], [1.06, 1], cl);
  return (
    <g transform={`translate(540 960) scale(${s}) translate(-540 -960)`}>
      <Sky top="#8fc3e3" bottom="#e9f2f2" clouds={3} drift={frame * 0.3} />
      <Storefront x={-20} w={360} h={520} color="#b4583c" sign="ST. JOSEPH, MO." />
      <Storefront x={350} w={330} h={600} color="#c8a26a" sign="PATEE HOUSE" />
      <Storefront x={690} w={420} h={470} color="#6d8a8f" sign="PONY EXPRESS" />
      <Ground color="#b89a6a" tuft="#7a6040" kind="street" />
      {/* rails ending in a buffer stop */}
      <g>
        <rect x={-20} y={GY + 150} width={640} height={14} fill="#5a5a60" stroke={INK} strokeWidth={3} />
        <rect x={-20} y={GY + 196} width={640} height={14} fill="#5a5a60" stroke={INK} strokeWidth={3} />
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-10 + i * 54} y={GY + 140} width={20} height={84} fill="#6a4528" />)}
        <rect x={600} y={GY + 110} width={44} height={120} fill="#c62828" stroke={INK} strokeWidth={4} />
        <rect x={600} y={GY + 140} width={44} height={22} fill="#fff" />
        <g transform={`translate(622 ${GY + 70}) scale(${pop(lt, 1.2)})`}>
          <rect x={-120} y={-44} width={240} height={60} rx={8} fill="#fff3c4" stroke="#000" strokeWidth={4} />
          <text y={-4} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={26} fill="#1d1712">END OF TRACK</text>
        </g>
      </g>
      <g transform={`translate(${interpolate(lt, [0, 1.4], [-120, 260], { ...cl, easing: Easing.out(Easing.quad) })} ${GY + 150}) scale(0.95)`}><LocoSide frame={frame} /></g>
      {/* townsfolk watching + Kit ready to ride west */}
      {TOWN.map((c, i) => <Person key={i} x={120 + i * 110} y={GY + 60} s={0.62} kit={{ colors: c, expression: i % 2 ? "happy" : "neutral" }} bob={Math.sin(frame * 0.2 + i) * 3} />)}
      <g transform={`translate(860 ${GY + 320}) scale(1.55)`}><Horse phase={frame * 0.85} galloping={false} facing={1} color="#8a5a32" /></g>
    </g>
  );
};
const LocoSide: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    {[0, 1, 2, 3].map((i) => { const t = ((frame * 1.4 + i * 25) % 100) / 100; return <circle key={i} cx={150 - t * 200} cy={-330 - t * 160} r={30 + t * 70} fill="#7a7a80" opacity={0.6 * (1 - t)} />; })}
    <rect x={-260} y={-280} width={170} height={190} rx={8} fill="#3a2d26" stroke={INK} strokeWidth={5} />
    <rect x={-235} y={-255} width={56} height={56} fill="#ffd27a" stroke={INK} strokeWidth={4} />
    <rect x={-90} y={-220} width={330} height={130} rx={50} fill="#2c2c30" stroke={INK} strokeWidth={5} />
    <rect x={120} y={-320} width={50} height={110} fill="#2c2c30" stroke={INK} strokeWidth={5} />
    <path d="M 240 -100 L 300 -20 L 200 -20 Z" fill="#c62828" stroke={INK} strokeWidth={4} />
    {[-200, -60, 80].map((x, i) => <g key={i} transform={`translate(${x} -40) rotate(${frame * 6})`}><circle r={52} fill="#5a1f1f" stroke={INK} strokeWidth={5} /><path d="M -52 0 L 52 0 M 0 -52 L 0 52" stroke={INK} strokeWidth={5} /></g>)}
  </g>
);

/** C: the owners' office — Russell, Majors and Waddell */
export const SceneOffice: React.FC<SP & { sad?: boolean }> = ({ lt, frame, sad }) => {
  const names = ["RUSSELL", "MAJORS", "WADDELL"];
  return (
    <g>
      <Wall color="#6b4a33" />
      {/* wall map with the route */}
      <g transform="translate(540 520)">
        <rect x={-380} y={-250} width={760} height={460} fill="#e2d1a4" stroke={INK} strokeWidth={8} />
        <path d="M -330 -200 Q -150 -230 0 -180 T 330 -120 L 340 180 L -340 180 Z" fill="#d6c08c" />
        {!sad && <path d={`M 300 20 Q 150 -60 0 0 T -300 20`} fill="none" stroke="#c62828" strokeWidth={10} strokeDasharray="26 14" strokeDashoffset={-frame * 2} />}
        <circle cx={300} cy={20} r={16} fill="#c62828" stroke={INK} strokeWidth={4} /><circle cx={-300} cy={20} r={16} fill="#c62828" stroke={INK} strokeWidth={4} />
        <text x={300} y={70} textAnchor="middle" fontFamily="Georgia, serif" fontSize={30} fill={INK}>St. Joseph</text>
        <text x={-300} y={70} textAnchor="middle" fontFamily="Georgia, serif" fontSize={30} fill={INK}>Sacramento</text>
        {sad && lt > 2.6 && <g transform={`scale(${pop(lt, 2.6)})`}><rect x={-260} y={-120} width={520} height={200} fill="#fff8e6" stroke={INK} strokeWidth={5} transform="rotate(-4)" /><text y={10} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={700} fontSize={64} fill="#c62828" transform="rotate(-4)">−$200,000</text></g>}
      </g>
      {/* calendar flipping 1860 → 1861 when sad */}
      {sad && (() => {
        const months = ["APR 1860", "JUN 1860", "AUG 1860", "OCT 1860", "DEC 1860", "FEB 1861", "APR 1861", "JUN 1861", "AUG 1861", "OCT 1861"];
        const i = Math.min(months.length - 1, Math.floor(interpolate(lt, [0.1, 0.9], [0, months.length - 1], cl)));
        return <g transform="translate(910 330)"><rect x={-120} y={-110} width={240} height={220} fill="#fff" stroke={INK} strokeWidth={6} /><rect x={-120} y={-110} width={240} height={60} fill="#c62828" stroke={INK} strokeWidth={6} /><text y={30} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={40} fill={INK}>{months[i].split(" ")[0]}</text><text y={84} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={32} fill={INK}>{months[i].split(" ")[1]}</text>{lt > 0.9 && <g transform={`translate(-20 190) scale(${pop(lt, 0.9)})`}><text textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={56} fill="#ffd23f" stroke="#000" strokeWidth={9} paintOrder="stroke">18 MONTHS</text></g>}</g>;
      })()}
      {/* the three owners */}
      {[260, 540, 820].map((x, i) => (
        <g key={i}>
          <Person x={x} y={1420} s={1.0} hat="top" kit={{ colors: SUIT, expression: sad ? "sad" : i === 1 ? "happy" : "determined" }} bob={Math.sin(frame * 0.15 + i) * 3} />
          {!sad && <g transform={`translate(${x} 900) scale(${pop(lt, [1.5, 1.85, 2.35][i])})`}>
            <rect x={-110} y={-36} width={220} height={58} rx={10} fill="#1b140d" stroke="#f2b84b" strokeWidth={4} />
            <text y={6} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={32} fill="#fff">{names[i]}</text>
          </g>}
        </g>
      ))}
      {/* table */}
      <rect x={60} y={1330} width={960} height={70} fill="#5a3a22" stroke={INK} strokeWidth={6} />
      <rect x={110} y={1400} width={40} height={300} fill="#4a2f1c" /><rect x={930} y={1400} width={40} height={300} fill="#4a2f1c" />
      {sad && <g transform="translate(540 1310)"><rect x={-150} y={-30} width={300} height={40} fill="#efe1b8" stroke={INK} strokeWidth={4} /><text y={0} textAnchor="middle" fontFamily="Georgia, serif" fontSize={26} fill="#c62828">LEDGER</text></g>}
    </g>
  );
};

/** D: relay station — gallop in, jump onto a fresh horse, gone */
export const SceneRelay: React.FC<SP> = ({ lt, frame }) => {
  const inX = interpolate(lt, [0, 1.4], [1350, 760], { ...cl, easing: Easing.out(Easing.cubic) });
  const jump = interpolate(lt, [1.6, 2.1], [0, 1], cl);
  const outX = interpolate(lt, [3.5, 4.8], [430, -520], { ...cl, easing: Easing.in(Easing.quad) });
  const riderOnFresh = lt >= 2.1;
  return (
    <g>
      <Sky top="#8fc3e3" bottom="#eef3e8" clouds={4} drift={frame * 0.4} />
      <Hills y={GY - 120} color="#a9b46a" amp={120} wave={380} seed={1} />
      <Ground color="#b8b06a" tuft="#7a8a3a" />
      <Cabin x={210} s={0.9} sign="RELAY STATION" />
      <Fence x0={560} x1={1080} />
      {/* station keeper holding the fresh horse */}
      <Person x={300} y={GY + 220} s={1.0} kit={{ pose: "side", facing: -1, holdingRope: !riderOnFresh, colors: KEEPER, expression: "determined" }} />
      <g transform={`translate(${riderOnFresh ? outX : 430} ${GY + 330}) scale(1.6)`}>
        {riderOnFresh && <Dust x={90} y={-6} frame={frame} />}
        <Horse phase={frame * 0.85} galloping={riderOnFresh && lt > 3.5} facing={1} color="#3b2a20" rider={riderOnFresh} />
      </g>
      {/* Kit's tired horse arrives */}
      <g transform={`translate(${inX} ${GY + 340}) scale(1.6)`}>
        {lt < 1.4 && <Dust x={90} y={-6} frame={frame} />}
        <Horse phase={frame * 0.85} galloping={lt < 1.4} facing={1} color="#8a5a32" rider={lt < 1.6} mailbag={lt < 1.6} />
      </g>
      {/* the jump */}
      {lt >= 1.6 && lt < 2.1 && (
        <g transform={`translate(${760 + (430 - 760) * jump} ${GY + 120 - Math.sin(jump * Math.PI) * 180}) scale(0.85)`}>
          <Kit pose="side" facing={-1} expression="determined" />
        </g>
      )}
      {lt >= 2.2 && <g transform={`translate(560 760) scale(${pop(lt, 2.2)})`}>
        <rect x={-210} y={-50} width={420} height={80} rx={14} fill="#f2b84b" stroke="#000" strokeWidth={5} />
        <text y={8} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={46} fill="#1d1712">FRESH HORSE!</text>
      </g>}
      {lt >= 3.6 && <g transform={`translate(540 600) scale(${pop(lt, 3.6)})`}>
        <rect x={-250} y={-46} width={500} height={72} rx={14} fill="#1b140d" stroke="#f2b84b" strokeWidth={5} />
        <text y={4} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={40} fill="#fff">GONE IN MINUTES</text>
      </g>}
    </g>
  );
};

/** D2: how far each rider rides + the weight limit */
export const SceneRider: React.FC<SP> = ({ lt, frame }) => {
  const needle = interpolate(lt, [3.3, 4.4], [-80, 40], { ...cl, easing: Easing.out(Easing.back(1.6)) });
  const onScale = lt >= 3.2;
  return (
    <g>
      <Sky top="#8fc3e3" bottom="#eef3e8" clouds={2} drift={frame * 0.4} />
      <Hills y={GY - 120} color="#a9b46a" amp={120} wave={380} seed={3} />
      <Ground color="#b8b06a" tuft="#7a8a3a" />
      {/* signpost: 75–100 miles */}
      <g transform="translate(230 1240)">
        <rect x={-12} y={-560} width={24} height={560} fill="#6a4528" stroke={INK} strokeWidth={4} />
        {[["75 MILES", 1.0, -480], ["100 MILES", 2.0, -360]].map(([txt, at, y], i) => (
          <g key={i} transform={`translate(0 ${y}) scale(${pop(lt, at as number)})`}>
            <path d="M -20 -40 L 220 -40 L 270 0 L 220 40 L -20 40 Z" fill="#efe1b8" stroke={INK} strokeWidth={5} />
            <text x={110} y={14} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={38} fill={INK}>{txt as string}</text>
          </g>
        ))}
        <g transform={`translate(110 -230) scale(${pop(lt, 2.2)})`}><text textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={34} fill="#fff" stroke="#000" strokeWidth={7} paintOrder="stroke">PER RIDER</text></g>
      </g>
      {/* platform scale */}
      <g transform="translate(760 1250)">
        <rect x={-170} y={-40} width={340} height={40} fill="#6a6a6a" stroke={INK} strokeWidth={5} />
        <rect x={-16} y={-560} width={32} height={520} fill="#7a7a7a" stroke={INK} strokeWidth={4} />
        <g transform="translate(0 -600)">
          <circle r={120} fill="#fff8e6" stroke={INK} strokeWidth={8} />
          {[-80, -40, 0, 40, 80].map((a, i) => <line key={i} x1={0} y1={-100} x2={0} y2={-80} stroke={INK} strokeWidth={5} transform={`rotate(${a})`} />)}
          <path d="M -40 -60 Q 0 -112 40 -60" fill="none" stroke="#c62828" strokeWidth={10} transform="rotate(40)" />
          <line x1={0} y1={0} x2={0} y2={-96} stroke="#c62828" strokeWidth={8} strokeLinecap="round" transform={`rotate(${onScale ? needle : -80})`} />
          <circle r={12} fill={INK} />
          <text y={60} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={30} fill={INK}>LB</text>
        </g>
        <g transform={`translate(${onScale ? 0 : 260} ${-40}) scale(1.0)`}><Kit pose={onScale ? "front" : "side"} facing={-1} walking={!onScale && lt > 2.4} expression={onScale && lt > 4.2 ? "happy" : "neutral"} /></g>
        {lt >= 4.3 && <g transform={`translate(0 -800) scale(${pop(lt, 4.3)})`}><rect x={-170} y={-52} width={340} height={80} rx={14} fill="#c62828" stroke="#000" strokeWidth={5} /><text y={6} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={44} fill="#fff">MAX 125 LB</text></g>}
      </g>
    </g>
  );
};

/** E1–E3: desert, Sierra blizzard, night — quick terrain beats of the ride */
export const SceneDesert: React.FC<SP> = ({ frame }) => (
  <g>
    <Sky top="#f3cf86" bottom="#fbecc8" sun={{ x: 820, y: 330, r: 110, color: "#fffbe8" }} />
    <Hills y={GY - 160} color="#c98a52" amp={200} wave={260} flatTop seed={4} scroll={frame * 4} />
    <Ground color="#e0b86b" tuft="#a2a060" scroll={frame * 26} kind="sand" />
    {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M 0 ${700 + i * 60} q 270 -20 540 0 t 540 0`} fill="none" stroke="#fff" strokeOpacity={0.18} strokeWidth={4} transform={`translate(${Math.sin(frame * 0.2 + i) * 20} 0)`} />)}
    <g transform={`translate(560 ${GY + 160}) scale(1.95)`}><Dust x={90} y={-6} frame={frame} color="#ecd29c" /><Horse phase={frame * 0.85} galloping facing={1} color="#9b6b3c" /></g>
  </g>
);
export const SceneBlizzard: React.FC<SP> = ({ frame }) => (
  <g>
    <Sky top="#7d8ea6" bottom="#c9d3df" />
    <Hills y={GY - 260} color="#8a9ab0" amp={380} wave={240} seed={6} snowCap scroll={frame * 3} />
    {Array.from({ length: 7 }, (_, i) => { const x = (((rnd(i) * 1300 - frame * 14) % 1300) + 1300) % 1300 - 100; return <g key={i} transform={`translate(${x} ${GY - 20})`}><path d="M 0 -300 L 70 -60 L -70 -60 Z" fill="#2f5a46" stroke={INK} strokeWidth={4} /><path d="M 0 -300 L 40 -170 L -40 -170 Z" fill="#fff" /><rect x={-10} y={-60} width={20} height={60} fill="#4a2f1c" /></g>; })}
    <Ground color="#eef3f8" kind="snow" scroll={frame * 22} />
    <g transform={`translate(560 ${GY + 160}) scale(1.95)`}><Horse phase={frame * 0.7} galloping facing={1} color="#5e3b22" riderExpression="scared" /></g>
    {Array.from({ length: 160 }, (_, i) => { const x = (((rnd(i) * 1300 - frame * (16 + (i % 5) * 4)) % 1300) + 1300) % 1300 - 100, y = (rnd(i + 50) * 2000 + frame * (10 + (i % 7))) % 2000 - 40; return <circle key={i} cx={x} cy={y} r={3 + (i % 4) * 2} fill="#fff" opacity={0.85} />; })}
  </g>
);
export const SceneNight: React.FC<SP> = ({ frame }) => (
  <g>
    <Sky top="#0b1730" bottom="#24365e" stars moon />
    <Hills y={GY - 120} color="#18233a" amp={150} wave={400} scroll={frame * 5} seed={3} />
    <Ground color="#1d2a40" tuft="#0f1828" scroll={frame * 26} />
    <g transform={`translate(560 ${GY + 160}) scale(1.95)`}>
      <circle cx={-40} cy={-220} r={150} fill="#ffd27a" opacity={0.12} />
      <Horse phase={frame * 0.85} galloping facing={1} color="#3b2a20" />
    </g>
  </g>
);

/** F: Sacramento — the mail arrives, the town cheers */
export const SceneArrival: React.FC<SP> = ({ lt, frame }) => {
  const x = interpolate(lt, [0, 1.3], [1350, 640], { ...cl, easing: Easing.out(Easing.cubic) });
  return (
    <g>
      <Sky top="#8fc3e3" bottom="#f2efe2" clouds={3} drift={frame * 0.3} />
      <Storefront x={-30} w={420} h={560} color="#b4583c" sign="SACRAMENTO" />
      <Storefront x={400} w={420} h={640} color="#c8a26a" sign="PONY EXPRESS OFFICE" />
      <Storefront x={830} w={300} h={500} color="#6d8a8f" sign="HOTEL" />
      <Bunting y={560} />
      <Ground color="#b89a6a" tuft="#7a6040" kind="street" />
      {Array.from({ length: 9 }, (_, i) => (
        <Person key={i} x={60 + i * 120} y={GY + 40 + (i % 2) * 30} s={0.62} hat={i % 4 === 1 ? "top" : "none"} kit={{ colors: TOWN[i % 4], expression: lt > 0.8 ? "happy" : "neutral" }} bob={lt > 0.8 ? -Math.abs(Math.sin(frame * 0.35 + i)) * 26 : 0} />
      ))}
      {lt > 0.8 && Array.from({ length: 40 }, (_, i) => { const t = ((lt - 0.8) * 0.6 + rnd(i)) % 1; return <rect key={i} x={rnd(i + 9) * W} y={300 + t * 1000} width={14} height={22} fill={["#c62828", "#f2b84b", "#2b4a7a", "#fff"][i % 4]} transform={`rotate(${frame * 8 + i * 40} ${rnd(i + 9) * W} ${300 + t * 1000})`} />; })}
      <g transform={`translate(${x} ${GY + 330}) scale(1.6)`}>{lt < 1.3 && <Dust x={90} y={-6} frame={frame} />}<Horse phase={frame * 0.85} galloping={lt < 1.3} facing={1} color="#9b6b3c" riderExpression="happy" /></g>
    </g>
  );
};

/** G: the price — $5 for a half-ounce letter */
export const SceneCounter: React.FC<SP> = ({ lt, frame }) => {
  const shocked = lt > 1.4;
  return (
    <g>
      <Wall color="#7a5a40" />
      <g transform="translate(540 430)"><rect x={-260} y={-90} width={520} height={130} fill="#efe1b8" stroke={INK} strokeWidth={6} /><text y={0} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={700} fontSize={48} fill={INK}>PONY EXPRESS</text><text y={34} textAnchor="middle" fontFamily="Georgia, serif" fontSize={26} fill={INK}>MAIL TO CALIFORNIA</text></g>
      <Person x={760} y={1270} s={1.0} kit={{ colors: CLERK, expression: "neutral" }} />
      <Person x={250} y={1500} s={1.15} kit={{ pose: "side", facing: 1, colors: TOWN[0], expression: shocked ? "scared" : "neutral" }} />
      <rect x={380} y={1180} width={720} height={90} fill="#5a3a22" stroke={INK} strokeWidth={6} />
      <rect x={380} y={1270} width={720} height={500} fill="#6e4b30" stroke={INK} strokeWidth={6} />
      {/* letter scale with an envelope */}
      <g transform="translate(620 1180)">
        <rect x={-70} y={-30} width={140} height={30} fill="#b08a3a" stroke={INK} strokeWidth={4} />
        <rect x={-8} y={-100} width={16} height={70} fill="#b08a3a" stroke={INK} strokeWidth={3} />
        <rect x={-90} y={-112} width={180} height={14} fill="#b08a3a" stroke={INK} strokeWidth={3} />
        <g transform={`translate(0 ${-112 - 70 * pop(lt, 0.2)})`}><rect x={-80} y={0} width={160} height={70} fill="#fff8e6" stroke={INK} strokeWidth={4} /><path d="M -80 0 L 0 40 L 80 0" fill="none" stroke={INK} strokeWidth={4} /></g>
        <g transform={`translate(0 -330) scale(${pop(lt, 2.4)})`}><text textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={54} fill="#fff" stroke="#000" strokeWidth={9} paintOrder="stroke">½ OUNCE</text></g>
      </g>
      {/* $5 */}
      <g transform={`translate(880 1130) scale(${pop(lt, 1.3)})`}>
        {[0, 1, 2, 3, 4].map((i) => <ellipse key={i} cx={0} cy={-i * 18} rx={60} ry={20} fill="#e0b84a" stroke={INK} strokeWidth={4} />)}
        <g transform="translate(0 -230)"><rect x={-110} y={-70} width={220} height={120} rx={14} fill="#c62828" stroke="#000" strokeWidth={6} /><text y={30} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={96} fill="#fff">$5</text></g>
      </g>
      {shocked && <text x={250} y={980} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={110} fill="#fff" stroke="#000" strokeWidth={10} paintOrder="stroke" transform={`rotate(${Math.sin(frame) * 4} 250 980)`}>!?</text>}
    </g>
  );
};

/** H: Lincoln wins — the news reaches California */
export const SceneNewsboy: React.FC<SP> = ({ lt, frame }) => (
  <g>
    <Sky top="#8fc3e3" bottom="#f2efe2" clouds={2} drift={frame * 0.3} />
    <Storefront x={-30} w={540} h={600} color="#b4583c" sign="SACRAMENTO UNION" />
    <Storefront x={520} w={600} h={540} color="#6d8a8f" sign="TELEGRAPH & EXPRESS" />
    <Ground color="#b89a6a" tuft="#7a6040" kind="street" />
    {[[140, 0], [300, 1], [800, 2], [950, 3]].map(([x, c], i) => <Person key={i} x={x} y={GY + 60} s={0.7} kit={{ colors: TOWN[c], expression: lt > 0.6 ? "happy" : "neutral" }} bob={Math.sin(frame * 0.3 + i) * 4} />)}
    <g transform={`translate(540 ${GY + 300 - Math.abs(Math.sin(frame * 0.3)) * 20})`}>
      <Person x={0} y={0} s={0.95} kit={{ colors: { coat: "#3d5a80", coatShade: "#2d4462", coatLight: "#4a6a94", scarf: "#e0a030", scarfShade: "#b07a18" }, expression: "happy" }} />
      <g transform={`translate(0 -330) rotate(${Math.sin(frame * 0.3) * 6}) scale(${pop(lt, 0.2)})`}>
        <rect x={-200} y={-150} width={400} height={300} fill="#f4efe2" stroke={INK} strokeWidth={6} />
        <text y={-90} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={700} fontSize={30} fill="#333">SACRAMENTO</text>
        <line x1={-180} x2={180} y1={-70} y2={-70} stroke="#333" strokeWidth={4} />
        <text y={-10} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={900} fontSize={58} fill="#111">LINCOLN</text>
        <text y={56} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={900} fontSize={58} fill="#111">ELECTED!</text>
        {[90, 110, 130].map((y) => <rect key={y} x={-170} y={y} width={340} height={8} fill="#aaa" />)}
      </g>
    </g>
  </g>
);

/** I: dusk — something faster is coming (poles rising on the horizon) */
export const SceneDusk: React.FC<SP> = ({ lt, frame }) => (
  <g>
    <Sky top="#2b2347" bottom="#e07a4a" sun={{ x: 300, y: 1120, r: 140, color: "#ffb36b" }} />
    <Hills y={GY - 80} color="#2a1a22" amp={110} wave={420} seed={2} />
    <Ground color="#24161a" tuft="#140c0e" />
    {Array.from({ length: 7 }, (_, i) => {
      const at = 0.4 + i * 0.35, s = 0.25 + i * 0.07;
      return <g key={i} opacity={interpolate(lt, [at, at + 0.2], [0, 1], cl)}><Pole x={60 + i * 75} y={GY - 40 + i * 6} h={520} s={s} color="#120a0c" /></g>;
    })}
    <g transform={`translate(800 ${GY + 300}) scale(1.6)`}><Horse phase={frame * 0.85} galloping={false} facing={1} color="#3b2a20" riderExpression="scared" /></g>
  </g>
);

/** J: crews stringing the telegraph wire */
export const SceneCrew: React.FC<SP> = ({ lt, frame }) => {
  const raise = interpolate(lt, [0.3, 2.2], [-70, 0], { ...cl, easing: Easing.out(Easing.back(1.2)) });
  const wire = interpolate(lt, [0.8, 3.2], [0, 1], cl);
  return (
    <g>
      <Sky top="#8fc3e3" bottom="#eef3e8" clouds={3} drift={frame * 0.4} />
      <Hills y={GY - 120} color="#a9b46a" amp={120} wave={380} seed={7} />
      <Ground color="#b8b06a" tuft="#7a8a3a" />
      {[960, 700].map((x, i) => <Pole key={i} x={x} y={GY + 40} h={620} />)}
      <g transform={`translate(380 ${GY + 60}) rotate(${raise})`}><Pole x={0} y={0} h={620} /></g>
      <path d={`M 960 ${GY + 40 - 596} Q 830 ${GY + 40 - 560} 700 ${GY + 40 - 596}`} fill="none" stroke="#222" strokeWidth={5} />
      <path d={`M 700 ${GY + 40 - 596} Q ${700 - 160 * wire} ${GY - 520} ${700 - 320 * wire} ${GY + 60 - 596 * (raise > -5 ? 1 : 0.9)}`} fill="none" stroke="#222" strokeWidth={5} opacity={wire > 0.02 ? 1 : 0} />
      {/* workers pulling the pole up and carrying wire */}
      <Person x={180} y={GY + 260} s={1.0} kit={{ pose: "side", facing: 1, holdingRope: true, lean: -14, colors: WORKER, expression: "determined" }} />
      <path d={`M 230 ${GY - 30} L ${380 + Math.sin((raise * Math.PI) / 180) * -400} ${GY + 60 - Math.cos((raise * Math.PI) / 180) * 400}`} stroke="#8a6a3a" strokeWidth={6} />
      <Person x={560} y={GY + 300} s={1.0} kit={{ pose: "side", facing: 1, walking: true, colors: { ...WORKER, coat: "#4a5a3a", coatShade: "#38462b", coatLight: "#5a6c48" }, expression: "neutral" }} />
      {/* wagon of poles */}
      <g transform="translate(860 1520)">
        <rect x={-180} y={-90} width={360} height={80} fill="#8a5a32" stroke={INK} strokeWidth={5} />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={-200} y={-130 - i * 18} width={420} height={16} rx={8} fill="#6a4528" stroke={INK} strokeWidth={3} />)}
        {[-120, 120].map((x) => <g key={x} transform={`translate(${x} 0)`}><circle r={54} fill="#5a3a22" stroke={INK} strokeWidth={5} /><circle r={10} fill={INK} /></g>)}
      </g>
    </g>
  );
};

/** K: telegraph office — a message crosses the country in minutes */
export const SceneTelegraph: React.FC<SP> = ({ lt, frame }) => {
  const tap = Math.sin(frame * 1.3) > 0.3;
  return (
    <g>
      <Wall color="#5d4a3a" />
      {/* window with poles + sparks racing out */}
      <g transform="translate(760 560)">
        <rect x={-230} y={-260} width={460} height={420} fill="#9cc7e0" stroke={INK} strokeWidth={10} />
        <rect x={-230} y={60} width={460} height={100} fill="#b8b06a" />
        {[-150, 0, 150].map((x, i) => <Pole key={i} x={x} y={130} h={300} s={0.7 - i * 0.12} />)}
        <path d="M -260 -60 L 230 -110" stroke="#222" strokeWidth={4} />
        {lt > 0.4 && Array.from({ length: 4 }, (_, i) => { const k = ((lt * 1.4 + i / 4) % 1); return <circle key={i} cx={-260 + k * 500} cy={-60 - k * 50} r={12} fill="#fff" stroke="#bfe9ff" strokeWidth={8} />; })}
        <line x1={-230} x2={230} y1={-50} y2={-50} stroke={INK} strokeWidth={8} /><line x1={0} x2={0} y1={-260} y2={160} stroke={INK} strokeWidth={8} />
      </g>
      {/* clock spinning */}
      <g transform="translate(250 420)"><circle r={110} fill="#fff8e6" stroke={INK} strokeWidth={8} /><line x2={0} y2={-80} stroke={INK} strokeWidth={8} transform={`rotate(${lt * 360})`} /><line x2={0} y2={-56} stroke={INK} strokeWidth={10} transform={`rotate(${lt * 30})`} /></g>
      <Person x={340} y={1380} s={1.05} kit={{ pose: "side", facing: 1, holdingRope: true, colors: CLERK, expression: "determined" }} />
      <rect x={300} y={1280} width={780} height={70} fill="#5a3a22" stroke={INK} strokeWidth={6} />
      <rect x={330} y={1350} width={40} height={400} fill="#4a2f1c" /><rect x={1000} y={1350} width={40} height={400} fill="#4a2f1c" />
      {/* the telegraph key */}
      <g transform="translate(540 1280)">
        <rect x={-70} y={-24} width={140} height={24} fill="#3a3a3a" stroke={INK} strokeWidth={4} />
        <g transform={`rotate(${tap ? 6 : -4} -50 -30)`}><rect x={-60} y={-44} width={130} height={14} fill="#b08a3a" stroke={INK} strokeWidth={3} /><circle cx={70} cy={-44} r={14} fill="#222" /></g>
        {tap && Array.from({ length: 5 }, (_, i) => <path key={i} d={`M 70 -60 l ${Math.cos(i * 1.3) * 50} ${-30 - Math.sin(i * 1.7) * 40}`} stroke="#fff6a0" strokeWidth={5} />)}
        <path d={`M 70 -40 Q 300 -200 450 -${600 - 20}`} fill="none" stroke="#222" strokeWidth={4} />
      </g>
    </g>
  );
};

/** L: the Pony Express shuts down */
export const SceneClosed: React.FC<SP> = ({ lt, frame }) => {
  const flip = interpolate(lt, [2.3, 2.6], [0, 1], cl);
  const tw = interpolate(lt, [0, 3.6], [1250, -150], cl);
  return (
    <g>
      <Sky top="#9aa6b0" bottom="#dcdcd2" clouds={4} drift={frame * 0.2} />
      <Hills y={GY - 120} color="#9a9a72" amp={120} wave={380} seed={1} />
      <Ground color="#a8a06a" tuft="#6a6a3a" />
      <Cabin x={240} s={0.9} sign="RELAY STATION" />
      <g transform="translate(640 1240)">
        <rect x={-10} y={-460} width={20} height={460} fill="#5a3a22" stroke={INK} strokeWidth={4} />
        <g transform={`translate(0 -460) scale(1 ${Math.abs(Math.cos(flip * Math.PI))})`}>
          <rect x={-170} y={-10} width={340} height={150} rx={12} fill={flip < 0.5 ? "#f3e6c4" : "#c62828"} stroke={INK} strokeWidth={6} />
          <text y={flip < 0.5 ? 74 : 98} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={flip < 0.5 ? 44 : 92} fill={flip < 0.5 ? INK : "#fff"}>{flip < 0.5 ? "PONY EXPRESS" : "CLOSED"}</text>
        </g>
      </g>
      <Person x={830} y={GY + 300} s={1.05} kit={{ expression: "sad" }} />
      <g transform={`translate(560 ${GY + 380}) scale(1.4)`}><Horse phase={0} galloping={false} facing={-1} color="#8a5a32" rider={false} mailbag={false} /></g>
      <g transform={`translate(${tw} ${GY + 120}) rotate(${-lt * 300})`}><circle r={60} fill="none" stroke="#8a6a3a" strokeWidth={8} strokeDasharray="20 10" /><circle r={36} fill="none" stroke="#8a6a3a" strokeWidth={6} strokeDasharray="14 10" /></g>
    </g>
  );
};
