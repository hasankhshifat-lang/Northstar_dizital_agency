import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const Diary: React.FC<{ lines?: number }> = ({ lines = 9 }) => (
  <svg width={900} height={600} viewBox="0 0 900 600">
    <path d="M20 40 Q 230 0 450 50 L 450 580 Q 230 530 20 570 Z" fill="#efe2c2" stroke="#b39a6a" strokeWidth={6} />
    <path d="M880 40 Q 670 0 450 50 L 450 580 Q 670 530 880 570 Z" fill="#f4e9cd" stroke="#b39a6a" strokeWidth={6} />
    {new Array(lines).fill(0).map((_, i) => (
      <g key={i} stroke="#6a5333" strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.75}>
        <path d={`M70 ${110 + i * 48} q 40 -10 80 0 t 80 0 t 80 0 t ${60 + (i % 3) * 20} 0`} />
        <path d={`M500 ${110 + i * 48} q 40 -10 80 0 t 80 0 t ${70 + (i % 2) * 40} 0`} />
      </g>
    ))}
    <text x={235} y={86} textAnchor="middle" fontFamily="Bitter" fontSize={30} fill="#6a5333">
      May 1850
    </text>
  </svg>
);

export const Dresser: React.FC = () => (
  <svg width={260} height={300} viewBox="0 0 260 300">
    <rect x={20} y={30} width={220} height={240} rx={8} fill="#8b5a33" stroke={C.woodDark} strokeWidth={6} />
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <rect x={38} y={50 + i * 72} width={184} height={58} rx={4} fill="#9c6a40" stroke={C.woodDark} strokeWidth={4} />
        <circle cx={130} cy={79 + i * 72} r={7} fill="#d9a93a" />
      </g>
    ))}
    <rect x={30} y={268} width={24} height={24} fill={C.woodDark} />
    <rect x={206} y={268} width={24} height={24} fill={C.woodDark} />
  </svg>
);

export const Stove: React.FC = () => (
  <svg width={240} height={300} viewBox="0 0 240 300">
    <rect x={30} y={90} width={180} height={170} rx={10} fill="#2f2f33" />
    <rect x={60} y={130} width={120} height={80} rx={6} fill="#444" stroke="#222" strokeWidth={4} />
    <rect x={150} y={10} width={30} height={90} fill="#2f2f33" />
    <rect x={40} y={258} width={20} height={36} fill="#222" />
    <rect x={180} y={258} width={20} height={36} fill="#222" />
  </svg>
);

export const Boot: React.FC<{ worn?: boolean }> = ({ worn = true }) => (
  <svg width={420} height={300} viewBox="0 0 420 300">
    <path d="M90 20 L 210 20 L 220 170 Q 330 170 380 220 L 385 260 L 70 260 L 75 170 Z" fill="#5a3a22" stroke={C.ink} strokeWidth={6} />
    <rect x={60} y={250} width={330} height={26} rx={8} fill="#2b1b10" />
    {worn ? (
      <g>
        <path d="M330 205 Q 352 214 360 236 Q 340 246 322 232 Z" fill={C.skin} stroke={C.ink} strokeWidth={4} />
        <path d="M150 90 l 20 30 l -18 22" stroke="#2b1b10" strokeWidth={6} fill="none" />
      </g>
    ) : null}
  </svg>
);

export const Raft: React.FC = () => (
  <svg width={760} height={160} viewBox="0 0 760 160">
    {new Array(10).fill(0).map((_, i) => (
      <rect key={i} x={20 + i * 72} y={60} width={68} height={60} rx={20} fill={i % 2 ? C.wood : "#7a4f2c"} />
    ))}
    <line x1={0} y1={30} x2={760} y2={30} stroke="#b39a6a" strokeWidth={6} />
  </svg>
);

export const Rifle: React.FC = () => (
  <svg width={520} height={140} viewBox="0 0 520 140">
    <rect x={20} y={58} width={360} height={16} rx={6} fill={C.iron} />
    <path d="M360 50 L 500 70 L 500 112 L 420 104 L 360 80 Z" fill={C.wood} />
    <path d="M330 74 q 10 22 30 22" stroke={C.iron} strokeWidth={6} fill="none" />
  </svg>
);

export const Campfire: React.FC = () => {
  const frame = useCurrentFrame();
  const f = 1 + Math.sin(frame / 3) * 0.08;
  return (
    <svg width={260} height={260} viewBox="0 0 260 260">
      <path d="M40 230 L 220 200 M 40 200 L 220 230" stroke={C.woodDark} strokeWidth={22} strokeLinecap="round" />
      <path d={`M130 ${210 - 150 * f} Q 200 140 170 210 Q 130 230 90 210 Q 60 140 130 ${210 - 150 * f} Z`} fill="#e8812f" />
      <path d={`M130 ${210 - 90 * f} Q 165 160 150 210 Q 130 220 110 210 Q 95 160 130 ${210 - 90 * f} Z`} fill={C.sun} />
    </svg>
  );
};

export const PersonIcon: React.FC<{ color?: string }> = ({ color = C.cream }) => (
  <svg width={120} height={240} viewBox="0 0 120 240">
    <circle cx={60} cy={40} r={32} fill={color} />
    <path d="M18 230 L 18 120 Q 18 84 60 84 Q 102 84 102 120 L 102 230 Z" fill={color} />
  </svg>
);

export const Marker: React.FC = () => (
  <svg width={70} height={110} viewBox="0 0 70 110">
    <rect x={30} y={20} width={10} height={90} fill={C.wood} />
    <rect x={8} y={36} width={54} height={12} fill={C.wood} />
  </svg>
);

/** Horizontal trail map for 16:9: Missouri on the left, Oregon on the right. */
export const HTrailMap: React.FC<{ progress: number; markers?: { at: number; label: string }[]; dot?: number }> = ({
  progress,
  markers = [],
  dot,
}) => {
  const path = "M160 760 C 420 600 560 820 820 640 C 1040 490 1180 640 1400 500 C 1560 400 1680 470 1760 340";
  const len = 1900;
  // rough point along the curve for the wagon dot
  const pt = (p: number) => {
    const x = interpolate(p, [0, 0.33, 0.66, 1], [160, 820, 1400, 1760], clamp);
    const y = interpolate(p, [0, 0.33, 0.66, 1], [760, 640, 500, 340], clamp);
    return { x, y };
  };
  const d = pt(dot ?? progress);
  return (
    <AbsoluteFill style={{ backgroundColor: "#e9dcbc" }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <rect x={40} y={40} width={1840} height={1000} rx={30} fill="none" stroke="#b39a6a" strokeWidth={12} />
        <path d="M1200 360 L 1290 230 L 1380 360 Z M 1330 360 L 1420 200 L 1510 360 Z" fill="#b8ab93" />
        <path d={path} stroke="#b39a6a" strokeWidth={16} strokeDasharray="10 24" fill="none" strokeLinecap="round" />
        <path d={path} stroke={C.red} strokeWidth={20} fill="none" strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - progress)} />
        <circle cx={160} cy={760} r={22} fill={C.wood} />
        <text x={160} y={840} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={48} fill={C.wood}>
          MISSOURI
        </text>
        <circle cx={1760} cy={340} r={22} fill={C.wood} />
        <text x={1760} y={300} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={48} fill={C.wood}>
          OREGON
        </text>
        {markers.map((m) => {
          const p = pt(m.at);
          return (
            <g key={m.label}>
              <path d={`M${p.x - 50} ${p.y + 10} Q ${p.x} ${p.y - 70} ${p.x + 50} ${p.y + 10} Z`} fill={C.rock} />
              <text x={p.x} y={p.y - 80} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={44} fill={C.red}>
                {m.label}
              </text>
            </g>
          );
        })}
        <circle cx={d.x} cy={d.y} r={20} fill={C.ink} stroke={C.cream} strokeWidth={6} />
      </svg>
    </AbsoluteFill>
  );
};
