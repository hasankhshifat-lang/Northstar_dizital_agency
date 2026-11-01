import React from "react";
import { random, useCurrentFrame } from "remotion";
import { HORIZON } from "./sets";

/** Story-Short sets (2026-11-01): storms, bridges, trains, floods, 1790s city, caves. Ink-outline style to match Kit v2. */
const INK = "#2b1d14";

export const Rain: React.FC<{ intensity?: number; angle?: number }> = ({ intensity = 1, angle = 18 }) => {
  const frame = useCurrentFrame();
  const n = Math.round(420 * intensity);
  return (
    <g opacity={0.75}>
      {Array.from({ length: n }).map((_, i) => {
        const sp = 38 + random(`rs${i}`) * 22;
        const x = (random(`rx${i}`) * 2300 + frame * sp * Math.tan((angle * Math.PI) / 180)) % 2300 - 190;
        const y = (random(`ry${i}`) * 1200 + frame * sp) % 1200 - 60;
        const L = 26 + random(`rl${i}`) * 30;
        return <line key={i} x1={x} y1={y} x2={x - L * Math.tan((angle * Math.PI) / 180)} y2={y - L} stroke="#cfe0f0" strokeWidth={2.2} />;
      })}
    </g>
  );
};

/** Lightning flash: bright frames every ~70 frames plus a bolt. */
export const Lightning: React.FC<{ every?: number; x?: number }> = ({ every = 70, x = 1400 }) => {
  const frame = useCurrentFrame();
  const p = frame % every;
  const on = p < 3 || (p > 5 && p < 7);
  if (!on) return null;
  return (
    <g>
      <rect x={-200} y={-200} width={2320} height={1480} fill="#eaf2ff" opacity={0.55} />
      <path d={`M ${x} -10 L ${x - 40} 160 L ${x + 10} 170 L ${x - 50} 360 L ${x + 6} 368 L ${x - 70} 560`} stroke="#fff" strokeWidth={9} fill="none" strokeLinejoin="round" />
    </g>
  );
};

export const NightSky: React.FC<{ storm?: boolean }> = ({ storm }) => (
  <g>
    <defs>
      <linearGradient id="nsky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={storm ? "#0b0f18" : "#0a1024"} />
        <stop offset="1" stopColor={storm ? "#2a3445" : "#1d2a4a"} />
      </linearGradient>
    </defs>
    <rect x={-200} y={-200} width={2320} height={1500} fill="url(#nsky)" />
    {storm &&
      [0, 1, 2, 3, 4].map((i) => (
        <ellipse key={i} cx={200 + i * 420} cy={120 + (i % 2) * 70} rx={320} ry={90} fill="#1c2330" opacity={0.9} />
      ))}
  </g>
);

/** River band with moving waves. level: y of the surface. */
export const River: React.FC<{ level?: number; flood?: boolean; color?: string }> = ({ level = HORIZON + 260, flood, color }) => {
  const frame = useCurrentFrame();
  const c = color ?? (flood ? "#5b4a33" : "#3d5a73");
  return (
    <g>
      <rect x={-200} y={level} width={2320} height={1300} fill={c} />
      {Array.from({ length: 14 }).map((_, r) => (
        <path key={r} d={`M -200 ${level + 18 + r * 26} ${Array.from({ length: 24 }).map((__, i) => `q 50 ${i % 2 ? 10 : -10} 100 0`).join(" ")}`}
          transform={`translate(${((frame * (flood ? 9 : 3) + r * 37) % 200) - 200} 0)`} stroke={flood ? "#8a7552" : "#6f8fab"} strokeWidth={4} fill="none" opacity={0.6} />
      ))}
    </g>
  );
};

/** Wooden railroad trestle bridge. gap: x-range [a,b] that has collapsed. */
export const RailBridge: React.FC<{ y?: number; x0?: number; x1?: number; gap?: [number, number] | null }> = ({ y = HORIZON + 40, x0 = -100, x1 = 2020, gap = null }) => {
  const inGap = (x: number) => gap && x > gap[0] && x < gap[1];
  const legs = [];
  for (let x = x0; x <= x1; x += 120) if (!inGap(x)) legs.push(x);
  const ties = [];
  for (let x = x0; x <= x1; x += 22) if (!inGap(x)) ties.push(x);
  return (
    <g>
      {legs.map((x) => (
        <g key={x}>
          <path d={`M ${x} ${y + 14} L ${x - 30} ${y + 420} M ${x} ${y + 14} L ${x + 30} ${y + 420}`} stroke="#5a3f26" strokeWidth={12} />
          <path d={`M ${x - 16} ${y + 120} L ${x + 16} ${y + 220} M ${x + 16} ${y + 120} L ${x - 16} ${y + 220}`} stroke="#4a331f" strokeWidth={7} />
        </g>
      ))}
      {ties.map((x) => <rect key={x} x={x - 7} y={y - 4} width={14} height={20} fill="#6b4a2e" stroke={INK} strokeWidth={2} />)}
      {[y - 8, y + 2].map((ry, i) => (
        <g key={i}>
          {gap ? (
            <>
              <rect x={x0} y={ry} width={gap[0] - x0} height={5} fill="#8a8f96" />
              <rect x={gap[1]} y={ry} width={x1 - gap[1]} height={5} fill="#8a8f96" />
              <path d={`M ${gap[0]} ${ry} l 40 70 M ${gap[1]} ${ry} l -30 90`} stroke="#8a8f96" strokeWidth={5} />
            </>
          ) : (
            <rect x={x0} y={ry} width={x1 - x0} height={5} fill="#8a8f96" />
          )}
        </g>
      ))}
    </g>
  );
};

/** 1880s steam locomotive (facing right). light: headlight beam. */
export const Locomotive: React.FC<{ x: number; y: number; scale?: number; light?: boolean; tilt?: number; smoke?: boolean }> = ({ x, y, scale = 1, light = true, tilt = 0, smoke = true }) => {
  const frame = useCurrentFrame();
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${scale})`}>
      {light && <path d="M 250 -150 L 900 -260 L 900 -20 Z" fill="#fff4b8" opacity={0.25} />}
      {smoke && [0, 1, 2, 3].map((i) => {
        const t = ((frame * 1.5 + i * 25) % 100) / 100;
        return <circle key={i} cx={150 - t * 260} cy={-250 - t * 140} r={26 + t * 60} fill="#6b6b70" opacity={0.6 * (1 - t)} />;
      })}
      <rect x={-210} y={-200} width={140} height={150} rx={6} fill="#3a2d26" stroke={INK} strokeWidth={4} />
      <rect x={-190} y={-180} width={46} height={46} fill="#ffd27a" stroke={INK} strokeWidth={3} />
      <rect x={-80} y={-150} width={300} height={100} rx={40} fill="#2c2c30" stroke={INK} strokeWidth={4} />
      <rect x={100} y={-235} width={42} height={90} fill="#2c2c30" stroke={INK} strokeWidth={4} />
      <path d="M 92 -250 L 150 -250 L 142 -232 L 100 -232 Z" fill="#2c2c30" stroke={INK} strokeWidth={4} />
      <rect x={0} y={-185} width={34} height={40} rx={10} fill="#b8862f" stroke={INK} strokeWidth={3} />
      <rect x={220} y={-165} width={34} height={34} rx={6} fill="#fff1a8" stroke={INK} strokeWidth={4} />
      <path d="M 220 -50 L 300 -10 L 220 -10 Z" fill="#7b2a22" stroke={INK} strokeWidth={4} />
      {[-150, -10, 120].map((cx, i) => (
        <g key={cx} transform={`translate(${cx} -30) rotate(${frame * (light ? 6 : 0)})`}>
          <circle r={i === 1 ? 52 : 40} fill="#6b2a22" stroke={INK} strokeWidth={5} />
          <path d={`M -${i === 1 ? 46 : 34} 0 L ${i === 1 ? 46 : 34} 0 M 0 -${i === 1 ? 46 : 34} L 0 ${i === 1 ? 46 : 34}`} stroke={INK} strokeWidth={4} />
        </g>
      ))}
      <rect x={-100} y={-40} width={230} height={10} fill="#8a8f96" stroke={INK} strokeWidth={2} />
    </g>
  );
};

/** Wall of floodwater carrying wreckage, front edge at `front` (moves right). */
export const FloodWave: React.FC<{ front: number; height?: number; base?: number }> = ({ front, height = 560, base = 1100 }) => {
  const frame = useCurrentFrame();
  const top = base - height;
  const debris = Array.from({ length: 26 }).map((_, i) => ({
    x: front - 60 - random(`dx${i}`) * 1500, y: top + 30 + random(`dy${i}`) * height * 0.8, r: random(`dr${i}`) * 80 - 40, k: Math.floor(random(`dk${i}`) * 4),
  }));
  return (
    <g>
      <path d={`M -400 ${base} L -400 ${top + 60} Q ${front - 500} ${top - 40} ${front - 80} ${top} Q ${front + 30} ${top + 10} ${front + 40} ${top + 120} Q ${front + 70} ${base - 120} ${front + 120} ${base} Z`}
        fill="#4b3e2c" stroke={INK} strokeWidth={6} />
      <path d={`M ${front - 700} ${top + 20} Q ${front - 300} ${top - 30} ${front - 60} ${top + 4} Q ${front + 30} ${top + 20} ${front + 36} ${top + 90}`} stroke="#d9cfb8" strokeWidth={22} fill="none" strokeLinecap="round" />
      {Array.from({ length: 8 }).map((_, i) => (
        <circle key={i} cx={front - 40 - i * 90 + Math.sin(frame * 0.4 + i) * 10} cy={top + 10 + Math.cos(frame * 0.3 + i) * 12} r={26 - i * 2} fill="#efe7d6" opacity={0.85} />
      ))}
      {debris.map((d, i) => (
        <g key={i} transform={`translate(${d.x} ${d.y}) rotate(${d.r + Math.sin(frame * 0.1 + i) * 8})`}>
          {d.k === 0 && <rect x={-70} y={-8} width={140} height={16} fill="#7a5a36" stroke={INK} strokeWidth={3} />}
          {d.k === 1 && <path d="M -60 20 L 0 -40 L 60 20 Z" fill="#6b3b2a" stroke={INK} strokeWidth={4} />}
          {d.k === 2 && <g><circle r={26} fill="none" stroke="#3a2a1e" strokeWidth={6} /><path d="M -26 0 L 26 0 M 0 -26 L 0 26" stroke="#3a2a1e" strokeWidth={4} /></g>}
          {d.k === 3 && <rect x={-40} y={-30} width={80} height={60} fill="#8b7355" stroke={INK} strokeWidth={4} />}
        </g>
      ))}
    </g>
  );
};

/** Earth dam with a lake behind; breach 0..1 opens a gap. */
export const Dam: React.FC<{ breach?: number }> = ({ breach = 0 }) => {
  const frame = useCurrentFrame();
  const g = 220 * breach;
  return (
    <g>
      <rect x={-200} y={HORIZON - 60} width={2320} height={80} fill="#4f6f85" />
      <path d={`M -200 ${HORIZON + 10} L 700 ${HORIZON - 30} L ${960 - g} ${HORIZON - 30} L ${960 - g * 0.6} ${HORIZON + 260} L -200 ${HORIZON + 300} Z`} fill="#6e5a3d" stroke={INK} strokeWidth={5} />
      <path d={`M ${960 + g} ${HORIZON - 30} L 1300 ${HORIZON - 30} L 2120 ${HORIZON + 10} L 2120 ${HORIZON + 300} L ${960 + g * 0.6} ${HORIZON + 260} Z`} fill="#6e5a3d" stroke={INK} strokeWidth={5} />
      {breach > 0 && (
        <g>
          <path d={`M ${960 - g} ${HORIZON - 34} L ${960 + g} ${HORIZON - 34} L ${960 + g * 1.6} 1200 L ${960 - g * 1.6} 1200 Z`} fill="#5d7f96" />
          {Array.from({ length: 10 }).map((_, i) => (
            <path key={i} d={`M ${960 - g + i * (g / 5)} ${HORIZON - 30} q 10 ${200 + ((frame * 12 + i * 40) % 300)} ${-20 + (i % 3) * 20} 700`} stroke="#d8e6ef" strokeWidth={6} fill="none" opacity={0.7} />
          ))}
        </g>
      )}
    </g>
  );
};

/** 1790s city street: brick row houses, shutters, cobbles. */
export const CityStreet: React.FC<{ night?: boolean; shuttered?: boolean }> = ({ night, shuttered }) => (
  <g>
    {Array.from({ length: 7 }).map((_, i) => {
      const x = -120 + i * 320, h = 420 + (i % 3) * 50;
      return (
        <g key={i}>
          <rect x={x} y={HORIZON + 40 - h} width={310} height={h + 10} fill={i % 2 ? "#8c4a36" : "#9c5640"} stroke={INK} strokeWidth={5} />
          <rect x={x - 6} y={HORIZON + 30 - h} width={322} height={18} fill="#e9dcc3" stroke={INK} strokeWidth={3} />
          {[0, 1].map((r) => [0, 1, 2].map((c) => (
            <g key={`${r}${c}`}>
              <rect x={x + 30 + c * 90} y={HORIZON + 60 - h + r * 150} width={60} height={90} fill={night ? "#ffd27a" : "#2b3a4a"} opacity={shuttered ? 0.25 : 1} stroke={INK} strokeWidth={3} />
              {shuttered && <rect x={x + 30 + c * 90} y={HORIZON + 60 - h + r * 150} width={60} height={90} fill="#3d4a33" stroke={INK} strokeWidth={3} />}
            </g>
          )))}
          <rect x={x + 125} y={HORIZON - 110} width={60} height={150} fill="#3a2a1e" stroke={INK} strokeWidth={4} />
          <rect x={x + 110} y={HORIZON + 30} width={90} height={14} fill="#bfb6a3" stroke={INK} strokeWidth={2} />
        </g>
      );
    })}
    <rect x={-200} y={HORIZON + 40} width={2320} height={800} fill="#6d675c" />
    {Array.from({ length: 140 }).map((_, i) => (
      <ellipse key={i} cx={(i % 20) * 105 + ((Math.floor(i / 20) % 2) * 50) - 60} cy={HORIZON + 80 + Math.floor(i / 20) * 60} rx={46} ry={20} fill="#7c766a" stroke="#4f4a41" strokeWidth={3} />
    ))}
  </g>
);

/** Hand cart with coffins ("bring out your dead"). */
export const DeadCart: React.FC<{ x: number; y?: number; scale?: number }> = ({ x, y = HORIZON + 300, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M -180 -120 L -100 -150 L 180 -150 L 160 -110 L -170 -100 Z" fill="#5a4030" stroke={INK} strokeWidth={4} />
    <path d="M -150 -150 L -130 -190 L 120 -190 L 140 -150 Z" fill="#3a2a1e" stroke={INK} strokeWidth={4} />
    <rect x={-190} y={-110} width={380} height={50} fill="#6b4a2e" stroke={INK} strokeWidth={5} />
    <circle cx={-90} cy={-40} r={46} fill="none" stroke="#3a2a1e" strokeWidth={9} />
    <circle cx={110} cy={-40} r={46} fill="none" stroke="#3a2a1e" strokeWidth={9} />
    <path d="M 190 -90 L 330 -60" stroke="#5a3f26" strokeWidth={8} />
  </g>
);

/** A big menacing mosquito (side view, facing left). */
export const GiantMosquito: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => {
  const frame = useCurrentFrame();
  const flap = Math.sin(frame * 2.2) * 18;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={60} cy={-70 + flap * 0.2} rx={120} ry={30} fill="#cfe2ee" opacity={0.55} stroke={INK} strokeWidth={2} transform={`rotate(${-20 + flap} 0 -20)`} />
      <path d="M 0 0 Q 120 -10 240 20 Q 120 30 0 14 Z" fill="#3b3226" stroke={INK} strokeWidth={4} />
      {[40, 90, 140, 190].map((sx) => <path key={sx} d={`M ${sx} -2 l 0 22`} stroke="#c9b48a" strokeWidth={3} />)}
      <ellipse cx={-30} cy={-6} rx={44} ry={30} fill="#4a3d2c" stroke={INK} strokeWidth={4} />
      <circle cx={-78} cy={-8} r={20} fill="#3b3226" stroke={INK} strokeWidth={4} />
      <circle cx={-86} cy={-12} r={8} fill="#c62828" />
      <path d="M -96 -2 L -230 30" stroke={INK} strokeWidth={4} />
      {[-40, -20, 0].map((lx, i) => (
        <path key={i} d={`M ${lx} 16 L ${lx - 40 + i * 30} 110 L ${lx - 60 + i * 40} 170`} stroke={INK} strokeWidth={3} fill="none" />
      ))}
    </g>
  );
};

/** Dark cave interior: rock walls, a narrow passage, optional lamp glow and hanging bulb. */
export const Cave: React.FC<{ lamp?: boolean; bulb?: boolean | "off"; collapse?: number }> = ({ lamp, bulb, collapse = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      <rect x={-200} y={-200} width={2320} height={1500} fill="#120d0a" />
      <defs>
        <radialGradient id="caveglow">
          <stop offset="0" stopColor="#ffcf7a" stopOpacity={0.55} />
          <stop offset="1" stopColor="#ffcf7a" stopOpacity={0} />
        </radialGradient>
      </defs>
      {(lamp || bulb === true) && <circle cx={960} cy={560} r={700} fill="url(#caveglow)" opacity={0.8 + Math.sin(frame * 0.4) * 0.08} />}
      <path d="M -200 -200 L 2120 -200 L 2120 360 Q 1600 300 1300 420 Q 960 380 640 430 Q 300 330 -200 380 Z" fill="#3a2e24" stroke={INK} strokeWidth={6} />
      <path d="M -200 1300 L 2120 1300 L 2120 820 Q 1600 760 1300 790 Q 960 740 640 800 Q 300 760 -200 830 Z" fill="#4a3b2d" stroke={INK} strokeWidth={6} />
      {Array.from({ length: 18 }).map((_, i) => (
        <path key={i} d={`M ${i * 120 - 60} ${300 + (i % 3) * 30} l 30 ${60 + (i % 4) * 20} l 30 ${-60 - (i % 4) * 20}`} fill="#2e241c" stroke={INK} strokeWidth={3} />
      ))}
      {collapse > 0 && Array.from({ length: Math.round(40 * collapse) }).map((_, i) => (
        <circle key={i} cx={1500 + random(`cv${i}`) * 420} cy={360 + random(`cy${i}`) * 460} r={20 + random(`cr${i}`) * 40} fill="#5a4a3a" stroke={INK} strokeWidth={3} />
      ))}
      {bulb && (
        <g>
          <path d="M 1100 -200 L 1100 300" stroke="#b07a3a" strokeWidth={4} />
          <circle cx={1100} cy={320} r={24} fill={bulb === "off" ? "#4a4a44" : "#fff3b0"} stroke={INK} strokeWidth={3} />
          {bulb !== "off" && <circle cx={1100} cy={320} r={70} fill="#fff3b0" opacity={0.25} />}
        </g>
      )}
    </g>
  );
};

/** The rock that pins Kit's leg. */
export const Boulder: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M -80 0 Q -90 -70 -20 -90 Q 60 -100 90 -40 Q 100 0 60 10 Q 0 20 -80 0 Z" fill="#6a5a48" stroke={INK} strokeWidth={6} />
    <path d="M -40 -60 Q 0 -70 30 -50" stroke="#8a7a66" strokeWidth={6} fill="none" />
  </g>
);

/** Hillside crowd: tents and many small figures. */
export const Crowd: React.FC<{ y?: number; density?: number }> = ({ y = HORIZON + 120, density = 1 }) => (
  <g>
    {Array.from({ length: 6 }).map((_, i) => (
      <path key={`t${i}`} d={`M ${120 + i * 330} ${y} l 70 -110 l 70 110 Z`} fill="#e9e2cf" stroke={INK} strokeWidth={4} />
    ))}
    {Array.from({ length: Math.round(120 * density) }).map((_, i) => {
      const x = random(`px${i}`) * 2000 - 40, yy = y + 20 + random(`py${i}`) * 300, s = 0.6 + (yy - y) / 400;
      const c = ["#3a3a46", "#5a3a2a", "#2f4a3a", "#6b5a3a", "#4a2a2a"][i % 5];
      return (
        <g key={i} transform={`translate(${x} ${yy}) scale(${s})`}>
          <rect x={-10} y={-50} width={20} height={44} rx={6} fill={c} stroke={INK} strokeWidth={2} />
          <circle cx={0} cy={-62} r={11} fill="#e2b48f" stroke={INK} strokeWidth={2} />
          <ellipse cx={0} cy={-72} rx={14} ry={5} fill="#2a2420" />
        </g>
      );
    })}
  </g>
);

/** Vertical rescue shaft with a pulley frame (side cut-away). progress 0..1 = depth reached. */
export const Shaft: React.FC<{ progress?: number }> = ({ progress = 0.5 }) => {
  const d = 140 + progress * 700;
  return (
    <g>
      <rect x={-200} y={-200} width={2320} height={HORIZON + 200} fill="#7a90a8" />
      <rect x={-200} y={HORIZON} width={2320} height={900} fill="#5a4636" />
      {Array.from({ length: 12 }).map((_, i) => <ellipse key={i} cx={random(`sh${i}`) * 1900} cy={HORIZON + 80 + random(`sv${i}`) * 700} rx={40} ry={26} fill="#6a5442" stroke={INK} strokeWidth={3} />)}
      <rect x={900} y={HORIZON} width={120} height={d} fill="#20160f" stroke={INK} strokeWidth={5} />
      <path d={`M 860 ${HORIZON} L 960 ${HORIZON - 220} L 1060 ${HORIZON} M 960 ${HORIZON - 220} L 960 ${HORIZON + d - 40}`} stroke="#6b4a2e" strokeWidth={10} fill="none" />
      <circle cx={960} cy={HORIZON - 220} r={18} fill="#8a8f96" stroke={INK} strokeWidth={3} />
      <rect x={930} y={HORIZON + d - 60} width={60} height={46} fill="#7a5a36" stroke={INK} strokeWidth={3} />
    </g>
  );
};
