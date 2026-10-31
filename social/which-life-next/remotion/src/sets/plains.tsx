import React from "react";
import { random, useCurrentFrame } from "remotion";
import { HORIZON, mix } from "./sets";
import { palette } from "../theme";

/** A field of corn. `eaten` 0..1 strips leaves, then stalks (locust episodes). */
export const Cornfield: React.FC<{ x: number; y?: number; width?: number; rows?: number; eaten?: number; scale?: number }> = ({
  x, y = HORIZON + 200, width = 900, rows = 4, eaten = 0, scale = 1,
}) => {
  const frame = useCurrentFrame();
  const leaf = mix("#6f8f3a", "#a58c55", Math.min(1, eaten * 1.6));
  const stalk = mix("#7d9a45", "#9b8150", eaten);
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: Math.round(width / 46) }).map((__, c) => {
          const px = c * 46 + (r % 2) * 23 + random(`cx${r}-${c}`) * 8;
          const py = r * 34;
          const h = (120 + random(`ch${r}-${c}`) * 40) * (1 - eaten * 0.75);
          const sway = Math.sin(frame * 0.05 + c * 0.7 + r) * 4;
          const leaves = eaten < 0.55;
          return (
            <g key={`${r}-${c}`} transform={`translate(${px} ${py})`}>
              <path d={`M 0 0 Q ${sway / 2} ${-h / 2} ${sway} ${-h}`} stroke={stalk} strokeWidth={6} fill="none" />
              {leaves &&
                [0.35, 0.55, 0.75].map((t, i) => (
                  <path key={i} d={`M ${sway * t} ${-h * t} q ${i % 2 ? -34 : 34} ${-10} ${i % 2 ? -46 : 46} 14`} stroke={leaf} strokeWidth={8}
                    fill="none" strokeLinecap="round" opacity={1 - eaten} />
                ))}
              {eaten < 0.3 && <ellipse cx={sway * 0.6 + 8} cy={-h * 0.6} rx={6} ry={16} fill="#d9b84f" />}
            </g>
          );
        }),
      )}
    </g>
  );
};

/** Flying locust swarm: dark specks that thicken with `intensity` and dim the light. */
export const Swarm: React.FC<{ intensity: number; count?: number }> = ({ intensity, count = 700 }) => {
  const frame = useCurrentFrame();
  const n = Math.round(count * intensity);
  return (
    <g>
      <rect x={-200} y={-200} width={2320} height={1480} fill="#3b3420" opacity={0.35 * intensity} />
      {Array.from({ length: n }).map((_, i) => {
        const speed = 3 + random(`lv${i}`) * 6;
        const x = (random(`lx${i}`) * 2400 + frame * speed) % 2400 - 240;
        const y = random(`ly${i}`) * 1000 + Math.sin(frame * 0.3 + i) * 6;
        const s = 2 + random(`ls${i}`) * 4;
        const flap = Math.abs(Math.sin(frame * 1.3 + i)) * s;
        return (
          <g key={i} transform={`translate(${x} ${y})`} opacity={0.75}>
            <ellipse rx={s * 1.6} ry={s * 0.5} fill="#2b2516" />
            <ellipse cx={-s * 0.4} cy={-flap * 0.5} rx={s * 1.2} ry={flap * 0.4 + 0.5} fill="#5a4e30" opacity={0.7} />
          </g>
        );
      })}
    </g>
  );
};

/** Locusts covering the ground/fence (static carpet). */
export const LocustCarpet: React.FC<{ density?: number }> = ({ density = 1 }) => {
  const frame = useCurrentFrame();
  const n = Math.round(500 * density);
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => {
        const x = random(`gx${i}`) * 2000 - 40;
        const y = HORIZON + 60 + random(`gy${i}`) * 460;
        const s = 0.6 + (y - HORIZON) / 300;
        const hop = random(`gh${i}`) > 0.97 ? Math.abs(Math.sin(frame * 0.4 + i)) * 10 : 0;
        return (
          <g key={i} transform={`translate(${x} ${y - hop}) scale(${s}) rotate(${random(`gr${i}`) * 40 - 20})`}>
            <ellipse rx={7} ry={2.4} fill="#4a4025" />
            <path d="M -2 0 L -6 5 M 2 0 L 6 5" stroke="#3a321d" strokeWidth={1.2} />
          </g>
        );
      })}
    </g>
  );
};

/** Riley's "hopperdozer": a sheet-iron pan with coal tar, dragged on runners by a horse/ox. */
export const Hopperdozer: React.FC<{ x: number; y?: number; scale?: number }> = ({ x, y = HORIZON + 300, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x={-160} y={-40} width={320} height={40} fill="#5d5f63" stroke="#2c2d30" strokeWidth={4} />
    <rect x={-150} y={-34} width={300} height={22} fill="#1a1a1a" />
    <rect x={-160} y={-120} width={320} height={80} fill="#77797d" stroke="#2c2d30" strokeWidth={4} />
    <path d="M 160 -20 L 300 -40" stroke={palette.woodDark} strokeWidth={6} />
  </g>
);

/** Rocky Mountain peaks with a glacier holding dark specks (frozen locusts). */
export const Mountains: React.FC<{ glacier?: boolean; snowline?: number }> = ({ glacier = true }) => (
  <g>
    <path d={`M -200 ${HORIZON + 40} L 200 260 L 520 ${HORIZON - 40} L 900 180 L 1300 ${HORIZON - 20} L 1650 240 L 2120 ${HORIZON + 40} Z`} fill="#5d6675" />
    <path d={`M 200 260 L 280 360 L 160 350 Z M 900 180 L 1010 320 L 800 310 Z M 1650 240 L 1740 360 L 1560 350 Z`} fill={palette.snow} />
    <path d={`M -200 ${HORIZON + 120} L 400 ${HORIZON - 60} L 760 ${HORIZON + 60} L 1200 ${HORIZON - 80} L 2120 ${HORIZON + 120} L 2120 1300 L -200 1300 Z`} fill="#6f7a6a" />
    {glacier && (
      <g>
        <path d={`M 840 ${HORIZON - 40} Q 960 ${HORIZON - 90} 1100 ${HORIZON - 30} L 1180 ${HORIZON + 160} Q 960 ${HORIZON + 200} 760 ${HORIZON + 150} Z`} fill="#dbe8f2" />
        <path d={`M 800 ${HORIZON + 60} Q 960 ${HORIZON + 40} 1140 ${HORIZON + 70}`} stroke="#b9cbd9" strokeWidth={6} fill="none" />
        {Array.from({ length: 80 }).map((_, i) => (
          <ellipse key={i} cx={800 + random(`ice${i}`) * 360} cy={HORIZON - 10 + random(`icy${i}`) * 170} rx={4} ry={1.5} fill="#3a3322" opacity={0.6} />
        ))}
      </g>
    )}
  </g>
);
