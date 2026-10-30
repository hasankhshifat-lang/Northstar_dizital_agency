import React from "react";
import { random, useCurrentFrame } from "remotion";
import { palette, skies, TimeOfDay } from "../theme";

/** All sets are drawn in a 1920x1080 SVG coordinate space. Horizon sits at y = HORIZON. */
export const HORIZON = 640;

export const Sky: React.FC<{ time: TimeOfDay; clouds?: number }> = ({ time, clouds = 5 }) => {
  const frame = useCurrentFrame();
  const [top, mid, low] = skies[time];
  const cloudColor = time === "night" ? "#2a3550" : time === "storm" ? "#3b414b" : time === "dusk" ? "#b9877c" : "#f3ead8";
  return (
    <g>
      <defs>
        <linearGradient id={`sky-${time}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={top} />
          <stop offset="65%" stopColor={mid} />
          <stop offset="100%" stopColor={low} />
        </linearGradient>
      </defs>
      <rect x={-200} y={-200} width={2320} height={1500} fill={`url(#sky-${time})`} />
      {time === "night" &&
        Array.from({ length: 90 }).map((_, i) => (
          <circle key={i} cx={random(`s${i}`) * 1920} cy={random(`t${i}`) * 520} r={random(`r${i}`) * 1.8 + 0.4}
            fill="#fff" opacity={0.4 + 0.5 * Math.abs(Math.sin(frame * 0.03 + i))} />
        ))}
      {(time === "dawn" || time === "dusk") && <circle cx={time === "dawn" ? 1500 : 420} cy={HORIZON - 40} r={70} fill="#ffd9a0" opacity={0.75} />}
      {Array.from({ length: clouds }).map((_, i) => {
        const w = 260 + random(`cw${i}`) * 320;
        const y = 80 + random(`cy${i}`) * 300;
        const x = ((random(`cx${i}`) * 2400 + frame * (0.15 + random(`cs${i}`) * 0.25)) % 2600) - 340;
        return (
          <g key={i} opacity={0.75}>
            <ellipse cx={x} cy={y} rx={w / 2} ry={w / 7} fill={cloudColor} />
            <ellipse cx={x - w / 5} cy={y + 8} rx={w / 3.2} ry={w / 9} fill={cloudColor} />
            <ellipse cx={x + w / 4} cy={y + 6} rx={w / 3.5} ry={w / 10} fill={cloudColor} />
          </g>
        );
      })}
    </g>
  );
};

export const Prairie: React.FC<{ snowy?: number; green?: boolean; tufts?: number }> = ({ snowy = 0, green = false, tufts = 70 }) => {
  const frame = useCurrentFrame();
  const far = mix(green ? "#9aa56a" : "#b49a62", palette.snowShade, snowy);
  const near = mix(green ? palette.grassGreen : palette.grassDry, palette.snow, snowy);
  const tuft = mix(green ? "#6f7d44" : "#8a6e3c", "#aab4bf", snowy);
  return (
    <g>
      <path d={`M -200 ${HORIZON} Q 400 ${HORIZON - 30} 900 ${HORIZON - 6} T 2120 ${HORIZON - 18} L 2120 1300 L -200 1300 Z`} fill={far} />
      <path d={`M -200 ${HORIZON + 60} Q 600 ${HORIZON + 20} 1200 ${HORIZON + 70} T 2120 ${HORIZON + 50} L 2120 1300 L -200 1300 Z`} fill={near} />
      {/* wagon track */}
      <path d={`M 860 ${HORIZON + 8} Q 900 800 640 1300`} stroke={mix("#7b6445", "#b9c3cd", snowy)} strokeWidth={18} fill="none" opacity={0.5} />
      {Array.from({ length: tufts }).map((_, i) => {
        const x = random(`gx${i}`) * 2100 - 90;
        const y = HORIZON + 80 + random(`gy${i}`) * 420;
        const s = 0.5 + (y - HORIZON) / 420;
        const sway = Math.sin(frame * 0.06 + i) * 4 * s;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            {[-10, 0, 10].map((dx) => (
              <path key={dx} d={`M ${dx} 0 Q ${dx + sway} -18 ${dx + sway * 2 + dx * 0.4} -34`} stroke={tuft} strokeWidth={3} fill="none" />
            ))}
          </g>
        );
      })}
    </g>
  );
};

export const SodHouse: React.FC<{ x: number; y: number; scale?: number; snowy?: number; lit?: boolean; smoke?: boolean }> = ({
  x, y, scale = 1, snowy = 0, lit = true, smoke = true,
}) => {
  const frame = useCurrentFrame();
  const rows = 7;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={0} cy={4} rx={230} ry={14} fill="#000" opacity={0.15} />
      {Array.from({ length: rows }).map((_, r) => (
        <g key={r}>
          {Array.from({ length: 8 }).map((__, c) => (
            <rect key={c} x={-200 + c * 50 + (r % 2) * 25 - (r % 2 && c === 7 ? 25 : 0)} y={-26 * (r + 1)} width={c === 7 && r % 2 ? 25 : 50} height={26}
              fill={(r + c) % 3 === 0 ? palette.sodDark : palette.sod} stroke="#3c3022" strokeWidth={2} />
          ))}
        </g>
      ))}
      {/* sod roof */}
      <path d="M -220 -182 L 220 -182 L 200 -206 L -200 -206 Z" fill={mix("#6b7a45", palette.snow, snowy)} />
      <path d="M -214 -186 L 214 -186" stroke={mix("#56633a", palette.snowShade, snowy)} strokeWidth={5} />
      {/* door + window */}
      <rect x={-40} y={-130} width={64} height={130} fill={palette.woodDark} />
      <rect x={-34} y={-124} width={52} height={124} fill={palette.wood} />
      <rect x={80} y={-120} width={70} height={56} fill={lit ? palette.lamp : "#3b4250"} opacity={lit ? 0.9 : 1} />
      <path d="M 115 -120 L 115 -64 M 80 -92 L 150 -92" stroke={palette.woodDark} strokeWidth={5} />
      {lit && <rect x={80} y={-120} width={70} height={56} fill={palette.lamp} opacity={0.25 + 0.1 * Math.sin(frame * 0.4)} />}
      {/* stovepipe + smoke */}
      <rect x={120} y={-250} width={16} height={50} fill="#2b2622" />
      {smoke &&
        Array.from({ length: 6 }).map((_, i) => {
          const t = ((frame * 0.6 + i * 40) % 240) / 240;
          return <circle key={i} cx={128 + t * 90 + Math.sin(t * 6 + i) * 10} cy={-256 - t * 200} r={10 + t * 30} fill="#cfcac2" opacity={0.45 * (1 - t)} />;
        })}
    </g>
  );
};

export const Barn: React.FC<{ x: number; y: number; scale?: number; snowy?: number }> = ({ x, y, scale = 1, snowy = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <ellipse cx={0} cy={4} rx={180} ry={12} fill="#000" opacity={0.15} />
    <path d="M -160 0 L -160 -150 L 0 -230 L 160 -150 L 160 0 Z" fill={palette.sod} stroke="#3c3022" strokeWidth={3} />
    <path d="M -170 -146 L 0 -238 L 170 -146" stroke={mix(palette.woodDark, palette.snow, snowy)} strokeWidth={snowy > 0.3 ? 16 : 10} fill="none" />
    <rect x={-55} y={-120} width={110} height={120} fill={palette.woodDark} />
    <path d="M -55 -120 L 55 0 M 55 -120 L -55 0" stroke={palette.wood} strokeWidth={8} />
  </g>
);

export const Wagon: React.FC<{ x: number; y: number; scale?: number; moving?: boolean; oxen?: boolean }> = ({ x, y, scale = 1, moving = false, oxen = true }) => {
  const frame = useCurrentFrame();
  const spin = moving ? frame * 3 : 0;
  const bob = moving ? Math.sin(frame * 0.3) * 2 : 0;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${scale})`}>
      <ellipse cx={0} cy={6} rx={240} ry={14} fill="#000" opacity={0.15} />
      <rect x={-150} y={-120} width={300} height={56} fill={palette.wood} stroke={palette.woodDark} strokeWidth={4} />
      <path d="M -150 -120 Q -170 -290 -40 -300 Q 0 -306 40 -300 Q 170 -290 150 -120 Z" fill={palette.canvas} stroke="#b7a983" strokeWidth={4} />
      {[-90, -30, 30, 90].map((dx) => (
        <path key={dx} d={`M ${dx} -122 Q ${dx * 1.05} -230 ${dx * 0.8} -296`} stroke="#c9bb95" strokeWidth={4} fill="none" />
      ))}
      {[-100, 100].map((cx) => (
        <g key={cx} transform={`translate(${cx} -40) rotate(${spin})`}>
          <circle r={44} fill="none" stroke={palette.woodDark} strokeWidth={8} />
          {[0, 45, 90, 135].map((a) => (
            <path key={a} d="M -44 0 L 44 0" transform={`rotate(${a})`} stroke={palette.woodDark} strokeWidth={4} />
          ))}
        </g>
      ))}
      {oxen &&
        [0, 1].map((i) => (
          <g key={i} transform={`translate(${250 + i * 14} ${-60 + i * 6})`}>
            <ellipse cx={30} cy={-30} rx={70} ry={40} fill={i ? "#3a2e25" : "#4a3a2e"} />
            <ellipse cx={110} cy={-46} rx={26} ry={20} fill={i ? "#3a2e25" : "#4a3a2e"} />
            <path d="M 104 -64 Q 92 -84 80 -76 M 116 -64 Q 128 -84 140 -76" stroke="#d8cbb0" strokeWidth={5} fill="none" />
            {[-20, 10, 50, 70].map((lx, j) => (
              <rect key={lx} x={lx} y={-8} width={12} height={moving ? 40 + Math.sin(frame * 0.3 + j) * 6 : 40} fill="#2f251d" />
            ))}
          </g>
        ))}
      <path d="M 150 -80 L 260 -70" stroke={palette.woodDark} strokeWidth={6} />
    </g>
  );
};

export const Schoolhouse: React.FC<{ x: number; y: number; scale?: number; snowy?: number; lit?: boolean }> = ({ x, y, scale = 1, snowy = 0, lit = true }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <SodHouse x={0} y={0} snowy={snowy} lit={lit} smoke />
    <rect x={-20} y={-262} width={40} height={50} fill={palette.woodDark} />
    <path d="M -30 -262 L 0 -290 L 30 -262 Z" fill={palette.woodDark} />
    <circle cx={0} cy={-238} r={10} fill="#b08d3a" />
  </g>
);

export const TownStreet: React.FC<{ snowy?: number }> = ({ snowy = 0 }) => {
  const fronts = [
    { x: 120, w: 260, h: 300, c: "#8a6a48" },
    { x: 400, w: 220, h: 360, c: "#76583c" },
    { x: 640, w: 280, h: 320, c: "#94754f" },
    { x: 1000, w: 240, h: 380, c: "#6f5236" },
    { x: 1260, w: 300, h: 330, c: "#8a6a48" },
    { x: 1580, w: 260, h: 350, c: "#7b5c3f" },
  ];
  return (
    <g>
      {fronts.map((f, i) => (
        <g key={i} transform={`translate(${f.x} ${HORIZON + 120})`}>
          <rect x={0} y={-f.h} width={f.w} height={f.h} fill={f.c} stroke={palette.woodDark} strokeWidth={4} />
          <rect x={14} y={-f.h + 20} width={f.w - 28} height={46} fill="#e3d6b5" opacity={0.85} />
          <rect x={f.w / 2 - 36} y={-130} width={72} height={130} fill={palette.woodDark} />
          <rect x={20} y={-200} width={70} height={80} fill={palette.lamp} opacity={0.55} />
          <rect x={f.w - 90} y={-200} width={70} height={80} fill={palette.lamp} opacity={0.55} />
          <rect x={-6} y={-150} width={f.w + 12} height={14} fill={mix(palette.woodDark, palette.snow, snowy)} />
        </g>
      ))}
      <rect x={-200} y={HORIZON + 120} width={2320} height={600} fill={mix("#7a6346", palette.snow, snowy)} />
      <rect x={-200} y={HORIZON + 120} width={2320} height={30} fill={mix("#5a4632", palette.snowShade, snowy)} />
    </g>
  );
};

export const StormFront: React.FC<{ progress: number }> = ({ progress }) => {
  const frame = useCurrentFrame();
  const x = 2300 - progress * 1700;
  return (
    <g opacity={0.95}>
      {Array.from({ length: 9 }).map((_, i) => (
        <ellipse key={i} cx={x + i * 160 + Math.sin(frame * 0.02 + i) * 20} cy={HORIZON - 260 + (i % 3) * 70} rx={260} ry={200 - (i % 3) * 30}
          fill={i % 2 ? "#3a414c" : "#2c323b"} />
      ))}
      <rect x={x - 60} y={HORIZON - 120} width={2400} height={140} fill="#e6ebf0" opacity={0.35} />
    </g>
  );
};

export const Rope: React.FC<{ x1: number; y1: number; x2: number; y2: number; sag?: number }> = ({ x1, y1, x2, y2, sag = 40 }) => {
  const frame = useCurrentFrame();
  const sway = Math.sin(frame * 0.2) * 10;
  return (
    <path d={`M ${x1} ${y1} Q ${(x1 + x2) / 2 + sway} ${(y1 + y2) / 2 + sag} ${x2} ${y2}`} stroke="#c9b48a" strokeWidth={6} fill="none" />
  );
};

/** Inside a two-room sod house: earthen walls, small window, table, cast-iron stove with fire. */
export const SodInterior: React.FC<{ stormOutside?: boolean; night?: boolean; drip?: boolean }> = ({ stormOutside = false, night = false, drip = false }) => {
  const frame = useCurrentFrame();
  const fire = 0.75 + 0.25 * Math.sin(frame * 0.5) * Math.sin(frame * 0.23);
  const wall = night ? "#3e3226" : "#5f4b36";
  return (
    <g>
      <rect x={-200} y={-200} width={2320} height={1480} fill={wall} />
      {Array.from({ length: 10 }).map((_, r) =>
        Array.from({ length: 12 }).map((__, c) => (
          <rect key={`${r}-${c}`} x={c * 170 - (r % 2) * 85 - 60} y={r * 70 - 40} width={170} height={70} fill="none" stroke="#2f251b" strokeWidth={3} opacity={0.5} />
        )),
      )}
      <rect x={-200} y={-200} width={2320} height={170} fill="#3a2d21" />
      {[200, 700, 1200, 1700].map((x) => (
        <rect key={x} x={x} y={-200} width={30} height={200} fill="#2b2119" />
      ))}
      {/* window */}
      <rect x={260} y={260} width={260} height={220} fill={stormOutside ? "#dfe6ee" : night ? "#1b2438" : "#a9c0d4"} stroke={palette.woodDark} strokeWidth={14} />
      <path d="M 390 260 L 390 480 M 260 370 L 520 370" stroke={palette.woodDark} strokeWidth={10} />
      {stormOutside &&
        Array.from({ length: 30 }).map((_, i) => {
          const t = ((frame * 4 + i * 37) % 220) / 220;
          return <circle key={i} cx={270 + ((random(`w${i}`) * 240 + t * 160) % 240)} cy={270 + t * 200} r={3} fill="#fff" />;
        })}
      {/* floor */}
      <rect x={-200} y={820} width={2320} height={460} fill="#4a3a2a" />
      {/* table */}
      <rect x={560} y={700} width={420} height={26} fill={palette.wood} />
      <rect x={590} y={726} width={22} height={130} fill={palette.woodDark} />
      <rect x={930} y={726} width={22} height={130} fill={palette.woodDark} />
      <ellipse cx={680} cy={698} rx={44} ry={8} fill="#a7a49d" />
      <rect x={820} y={660} width={26} height={38} fill="#9c968c" />
      {drip &&
        [0, 1].map((i) => {
          const t = ((frame + i * 25) % 50) / 50;
          return <circle key={i} cx={760} cy={40 + t * 650} r={5} fill="#8a6e50" opacity={1 - t * 0.5} />;
        })}
      {/* stove */}
      <rect x={1340} y={-200} width={36} height={760} fill="#232020" />
      <rect x={1230} y={560} width={260} height={220} rx={10} fill="#2a2725" />
      <rect x={1270} y={620} width={180} height={110} rx={8} fill="#1a1716" />
      <rect x={1285} y={640} width={150} height={74} rx={6} fill="#ff9f43" opacity={fire} />
      <circle cx={1360} cy={680} r={280} fill="url(#fireGlow)" opacity={0.5 * fire} />
      <rect x={1240} y={780} width={20} height={70} fill="#2a2725" />
      <rect x={1460} y={780} width={20} height={70} fill="#2a2725" />
      <defs>
        <radialGradient id="fireGlow">
          <stop offset="0%" stopColor="#ffb35a" stopOpacity={0.8} />
          <stop offset="100%" stopColor="#ffb35a" stopOpacity={0} />
        </radialGradient>
      </defs>
      {night && <rect x={-200} y={-200} width={2320} height={1480} fill="#0b1020" opacity={0.35} />}
    </g>
  );
};

/** Falling snow. intensity 0..1; wind pushes flakes sideways. */
export const Snow: React.FC<{ intensity: number; wind?: number; count?: number }> = ({ intensity, wind = 1, count = 260 }) => {
  const frame = useCurrentFrame();
  const n = Math.round(count * intensity);
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => {
        const size = 1.5 + random(`fs${i}`) * 4;
        const speed = 1.2 + random(`fv${i}`) * 2.2 + intensity * 3;
        const y = (random(`fy${i}`) * 1200 + frame * speed * (size / 3)) % 1200 - 60;
        const x = (random(`fx${i}`) * 2300 + frame * wind * speed * 1.4 + Math.sin(frame * 0.05 + i) * 12) % 2300 - 190;
        return <circle key={i} cx={x} cy={y} r={size} fill="#fff" opacity={0.55 + random(`fo${i}`) * 0.45} />;
      })}
      {intensity > 0.6 && <rect x={-200} y={-200} width={2320} height={1480} fill="#e9eef3" opacity={(intensity - 0.6) * 0.9} />}
    </g>
  );
};

export function mix(a: string, b: string, t: number): string {
  const pa = hex(a), pb = hex(b);
  const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * Math.max(0, Math.min(1, t))));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}
function hex(h: string): number[] {
  const s = h.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
}
