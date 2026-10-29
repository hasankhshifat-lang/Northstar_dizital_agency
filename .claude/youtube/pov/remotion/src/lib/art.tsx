import React from "react";
import { AbsoluteFill, interpolate, interpolateColors, random, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Places an SVG drawing at (x, y) in the 1080-wide frame, scaled. */
export const Place: React.FC<{
  x: number;
  y: number;
  scale?: number;
  rotate?: number;
  opacity?: number;
  children: React.ReactNode;
}> = ({ x, y, scale = 1, rotate = 0, opacity = 1, children }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      scale: String(scale),
      rotate: `${rotate}deg`,
      opacity,
      transformOrigin: "center",
    }}
  >
    {children}
  </div>
);

/** Sky + rolling prairie. `time` 0 = dawn, 0.5 = noon, 1 = dusk, 1.3 = night. */
export const Prairie: React.FC<{ time?: number; horizon?: number; sun?: boolean }> = ({
  time = 0.5,
  horizon = 1150,
  sun = true,
}) => {
  const sky = interpolateColors(time, [0, 0.5, 1, 1.3], [C.skyDawn, C.skyDay, C.skyDusk, C.skyNight]);
  const ground = interpolateColors(time, [0, 0.5, 1, 1.3], ["#b88f50", C.prairie, "#8f6a3a", "#3b3324"]);
  const far = interpolateColors(time, [0, 0.5, 1, 1.3], ["#a88a63", "#a9a07a", "#8a5f45", "#2c2c3a"]);
  const { width: W, height: H } = useVideoConfig();
  const sunX = interpolate(time, [0, 1], [W * 0.14, W * 0.86], clamp);
  const sunY = interpolate(time, [0, 0.5, 1], [horizon - 60, H * 0.135, horizon - 60], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: sky }}>
      {sun && time < 1.15 ? (
        <div
          style={{
            position: "absolute",
            left: sunX - 90,
            top: sunY - 90,
            width: 180,
            height: 180,
            borderRadius: 90,
            backgroundColor: C.sun,
            boxShadow: `0 0 120px 40px ${C.sun}55`,
          }}
        />
      ) : null}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <path d={`M0 ${horizon - 40} Q ${W * 0.25} ${horizon - 110} ${W * 0.5} ${horizon - 50} T ${W} ${horizon - 70} V ${H} H 0 Z`} fill={far} />
        <path d={`M0 ${horizon} Q ${W * 0.28} ${horizon - 50} ${W * 0.57} ${horizon + 10} T ${W} ${horizon - 20} V ${H} H 0 Z`} fill={ground} />
      </svg>
    </AbsoluteFill>
  );
};

export const Wagon: React.FC<{ wheelTurn?: number; full?: boolean }> = ({ wheelTurn = 0, full = true }) => (
  <svg width={520} height={360} viewBox="0 0 520 360">
    <path d="M70 200 Q 70 40 260 40 Q 450 40 450 200 Z" fill={C.canvas} stroke={C.canvasShade} strokeWidth={6} />
    {[130, 200, 270, 340, 400].map((x) => (
      <path key={x} d={`M${x} 205 Q ${x} 70 ${x + 10} 55`} stroke={C.canvasShade} strokeWidth={5} fill="none" />
    ))}
    {full ? (
      <g>
        <rect x={60} y={175} width={60} height={34} rx={6} fill={C.canvasShade} />
        <rect x={398} y={168} width={70} height={40} rx={6} fill="#cbb98f" />
      </g>
    ) : null}
    <rect x={50} y={200} width={420} height={70} rx={8} fill={C.wood} />
    <rect x={50} y={200} width={420} height={14} fill={C.woodDark} />
    <path d="M470 250 L 515 270" stroke={C.woodDark} strokeWidth={10} strokeLinecap="round" />
    {[120, 390].map((cx) => (
      <g key={cx} transform={`rotate(${wheelTurn} ${cx} 290)`}>
        <circle cx={cx} cy={290} r={64} fill="none" stroke={C.woodDark} strokeWidth={14} />
        <circle cx={cx} cy={290} r={64} fill="none" stroke={C.iron} strokeWidth={5} />
        {[0, 45, 90, 135].map((a) => (
          <line
            key={a}
            x1={cx + Math.cos((a * Math.PI) / 180) * 58}
            y1={290 + Math.sin((a * Math.PI) / 180) * 58}
            x2={cx - Math.cos((a * Math.PI) / 180) * 58}
            y2={290 - Math.sin((a * Math.PI) / 180) * 58}
            stroke={C.woodDark}
            strokeWidth={7}
          />
        ))}
        <circle cx={cx} cy={290} r={12} fill={C.iron} />
      </g>
    ))}
  </svg>
);

export const Ox: React.FC<{ step?: number }> = ({ step = 0 }) => {
  const leg = Math.sin(step) * 10;
  return (
    <svg width={300} height={220} viewBox="0 0 300 220">
      <rect x={40} y={60} width={190} height={90} rx={45} fill={C.ox} />
      <ellipse cx={245} cy={85} rx={40} ry={32} fill={C.ox} />
      <path d="M232 58 Q 240 30 262 36" stroke={C.cream} strokeWidth={9} fill="none" strokeLinecap="round" />
      <path d="M258 60 Q 280 34 296 48" stroke={C.cream} strokeWidth={9} fill="none" strokeLinecap="round" />
      <circle cx={258} cy={82} r={5} fill={C.ink} />
      <ellipse cx={278} cy={100} rx={14} ry={10} fill={C.oxDark} />
      {[70, 110, 175, 210].map((x, i) => (
        <rect
          key={x}
          x={x + (i % 2 === 0 ? leg : -leg)}
          y={135}
          width={20}
          height={70}
          rx={8}
          fill={C.oxDark}
        />
      ))}
      <path d="M40 90 Q 10 110 22 150" stroke={C.oxDark} strokeWidth={8} fill="none" strokeLinecap="round" />
    </svg>
  );
};

/** First-person tin cup in two hands, seen from above-front. `fill` 0..1, `tilt` deg. */
export const CupInHands: React.FC<{ fill?: number; tilt?: number }> = ({ fill = 1, tilt = 0 }) => {
  const level = 330 - fill * 170;
  return (
    <svg width={760} height={760} viewBox="0 0 760 760" style={{ rotate: `${tilt}deg` }}>
      <defs>
        <clipPath id="cupInside">
          <path d="M230 160 L 530 160 L 495 520 Q 380 560 265 520 Z" />
        </clipPath>
      </defs>
      <path d="M230 160 L 530 160 L 495 520 Q 380 560 265 520 Z" fill={C.tin} stroke={C.tinDark} strokeWidth={10} />
      <rect x={0} y={level} width={760} height={600} fill={C.river} clipPath="url(#cupInside)" />
      <ellipse cx={380} cy={level + 4} rx={150} ry={18} fill={C.riverLight} clipPath="url(#cupInside)" opacity={0.8} />
      <ellipse cx={380} cy={160} rx={150} ry={26} fill="none" stroke={C.tinDark} strokeWidth={10} />
      <path d="M530 230 Q 640 250 610 360 Q 590 430 505 420" stroke={C.tinDark} strokeWidth={22} fill="none" />
      <path d="M40 760 Q 60 520 245 430 Q 300 410 300 470 Q 300 530 250 560 Q 170 620 170 760 Z" fill={C.skin} />
      <path d="M720 760 Q 700 520 515 430 Q 460 410 460 470 Q 460 530 510 560 Q 590 620 590 760 Z" fill={C.skin} />
      <path d="M250 450 Q 285 455 280 500" stroke={C.skinShade} strokeWidth={8} fill="none" />
      <path d="M510 450 Q 475 455 480 500" stroke={C.skinShade} strokeWidth={8} fill="none" />
    </svg>
  );
};

export const Person: React.FC<{
  pose?: "sit" | "lie" | "stand" | "dig";
  pale?: number;
  shirt?: string;
}> = ({ pose = "stand", pale = 0, shirt = C.shirt }) => {
  const skin = interpolateColors(pale, [0, 1], [C.skin, "#c9c7b4"]);
  if (pose === "lie") {
    return (
      <svg width={460} height={200} viewBox="0 0 460 200">
        <rect x={20} y={130} width={420} height={40} rx={10} fill="#5b4a3a" />
        <rect x={110} y={95} width={250} height={50} rx={24} fill={shirt} />
        <circle cx={80} cy={112} r={34} fill={skin} stroke={C.ink} strokeWidth={5} />
        <path d="M66 108 l 10 0 M 88 108 l 10 0" stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
        <rect x={350} y={104} width={80} height={30} rx={14} fill="#4b3b2b" />
      </svg>
    );
  }
  const sitting = pose === "sit";
  return (
    <svg width={260} height={480} viewBox="0 0 260 480">
      <circle cx={130} cy={86} r={52} fill={skin} stroke={C.ink} strokeWidth={6} />
      <circle cx={112} cy={92} r={6} fill={C.ink} />
      <circle cx={148} cy={92} r={6} fill={C.ink} />
      <path d={pale > 0.4 || pose === "dig" ? "M112 122 Q 130 112 148 122" : "M112 116 Q 130 126 148 116"} stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d="M78 64 Q 130 0 182 64 Z" fill="#4b3b2b" />
      <rect x={70} y={64} width={120} height={14} rx={7} fill="#3a2d20" />
      <rect x={75} y={135} width={110} height={sitting ? 150 : 180} rx={40} fill={shirt} stroke={C.ink} strokeWidth={5} />
      {pose === "dig" ? (
        <g>
          <line x1={180} y1={170} x2={250} y2={420} stroke={C.wood} strokeWidth={12} />
          <path d="M232 410 L 268 410 L 262 470 L 238 470 Z" fill={C.iron} />
        </g>
      ) : null}
      {sitting ? (
        <g>
          <rect x={70} y={270} width={150} height={44} rx={20} fill="#4b3b2b" />
          <rect x={180} y={290} width={36} height={150} rx={16} fill="#4b3b2b" />
          <rect x={40} y={300} width={180} height={30} fill={C.wood} />
          <rect x={50} y={330} width={160} height={120} fill={C.woodDark} />
        </g>
      ) : (
        <g>
          <rect x={85} y={300} width={38} height={170} rx={16} fill="#4b3b2b" />
          <rect x={137} y={300} width={38} height={170} rx={16} fill="#4b3b2b" />
        </g>
      )}
    </svg>
  );
};

export const Grave: React.FC<{ name?: string; mound?: number }> = ({ name = "", mound = 1 }) => (
  <svg width={420} height={420} viewBox="0 0 420 420">
    <ellipse cx={210} cy={360} rx={190 * mound} ry={50 * mound} fill={C.dirt} />
    <rect x={190} y={120} width={40} height={250} fill={C.wood} />
    <rect x={110} y={170} width={200} height={70} rx={6} fill="#8b6239" />
    <text x={210} y={218} textAnchor="middle" fontFamily="Bitter" fontSize={36} fill={C.cream}>
      {name}
    </text>
  </svg>
);

export const Mountains: React.FC<{ snow?: boolean; tint?: string }> = ({ snow = true, tint = C.mountain }) => (
  <svg width={1080} height={520} viewBox="0 0 1080 520">
    <path d="M0 520 L 220 140 L 400 400 L 620 60 L 860 380 L 1000 200 L 1080 300 V 520 Z" fill={tint} />
    {snow ? (
      <g fill={C.snow}>
        <path d="M220 140 L 270 225 L 240 205 L 210 235 L 180 210 Z" />
        <path d="M620 60 L 690 175 L 650 150 L 615 190 L 580 150 L 555 170 Z" />
        <path d="M1000 200 L 1040 260 L 1010 245 L 985 265 L 965 250 Z" />
      </g>
    ) : null}
  </svg>
);

export const IndependenceRock: React.FC = () => (
  <svg width={820} height={360} viewBox="0 0 820 360">
    <path d="M20 340 Q 60 120 260 90 Q 420 40 560 90 Q 760 140 800 340 Z" fill={C.rock} />
    <path d="M120 340 Q 150 200 300 170 Q 360 160 380 200 Q 300 230 260 340 Z" fill={C.rockShade} opacity={0.6} />
    <path d="M520 120 Q 640 160 700 260" stroke={C.rockShade} strokeWidth={10} fill="none" opacity={0.5} />
  </svg>
);

/** Falling snow. density = flakes. */
export const Snow: React.FC<{ density?: number; wind?: number }> = ({ density = 80, wind = 2 }) => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  return (
    <AbsoluteFill>
      {new Array(density).fill(0).map((_, i) => {
        const speed = 4 + random(`s${i}`) * 6;
        const x0 = random(`x${i}`) * (W + 120) - 60;
        const y = ((random(`y${i}`) * H + frame * speed) % (H + 80)) - 40;
        const x = x0 + Math.sin((frame + i * 13) / 20) * 20 + frame * wind * 0.5;
        const r = 4 + random(`r${i}`) * 8;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: ((x % (W + 100)) + (W + 100)) % (W + 100) - 50,
              top: y,
              width: r * 2,
              height: r * 2,
              borderRadius: r,
              backgroundColor: C.snow,
              opacity: 0.85,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const River: React.FC<{ y?: number; h?: number }> = ({ y = 1250, h = 420 }) => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const rows = Math.max(2, Math.floor(h / 80));
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <path d={`M0 ${y} Q ${W / 2} ${y - 60} ${W} ${y} V ${y + h} Q ${W / 2} ${y + h + 40} 0 ${y + h} Z`} fill={C.river} />
      {new Array(rows * Math.ceil(W / 1080)).fill(0).map((_, i) => (
        <path
          key={i}
          d={`M${((frame * 3 + i * 260) % (W + 220)) - 200} ${y + 50 + (i % rows) * ((h - 80) / rows)} q 60 -14 120 0`}
          stroke={C.riverLight}
          strokeWidth={8}
          fill="none"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
};

export const Snake: React.FC = () => (
  <svg width={360} height={200} viewBox="0 0 360 200">
    <path d="M20 150 Q 80 60 140 140 Q 200 210 260 120 Q 300 60 330 90" stroke="#6b7a3a" strokeWidth={34} fill="none" strokeLinecap="round" />
    <circle cx={330} cy={88} r={26} fill="#6b7a3a" />
    <circle cx={338} cy={80} r={5} fill={C.ink} />
    <path d="M354 92 l 24 -6 m -24 6 l 22 10" stroke={C.red} strokeWidth={4} />
  </svg>
);

export const Bandit: React.FC = () => (
  <svg width={260} height={420} viewBox="0 0 260 420">
    <path d="M40 70 L 220 70 L 200 40 Q 130 10 60 40 Z" fill={C.ink} />
    <rect x={20} y={64} width={220} height={16} rx={8} fill={C.ink} />
    <circle cx={130} cy={125} r={50} fill={C.skin} />
    <path d="M80 130 L 180 130 L 170 175 L 130 190 L 90 175 Z" fill={C.red} />
    <rect x={70} y={180} width={120} height={200} rx={40} fill="#3d3d4a" />
  </svg>
);

export const BigX: React.FC<{ progress: number }> = ({ progress }) => (
  <svg width={420} height={420} viewBox="0 0 420 420" style={{ position: "absolute", inset: 0, margin: "auto" }}>
    <line x1={40} y1={40} x2={40 + 340 * Math.min(1, progress * 2)} y2={40 + 340 * Math.min(1, progress * 2)} stroke={C.red} strokeWidth={36} strokeLinecap="round" />
    {progress > 0.5 ? (
      <line x1={380} y1={40} x2={380 - 340 * (progress - 0.5) * 2} y2={40 + 340 * (progress - 0.5) * 2} stroke={C.red} strokeWidth={36} strokeLinecap="round" />
    ) : null}
  </svg>
);

export const Coin: React.FC<{ label?: string }> = ({ label = "$" }) => (
  <svg width={150} height={150} viewBox="0 0 150 150">
    <circle cx={75} cy={75} r={68} fill="#d9a93a" stroke="#a87b1f" strokeWidth={8} />
    <text x={75} y={98} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={62} fill="#8a6214">
      {label}
    </text>
  </svg>
);

export const FlourSack: React.FC = () => (
  <svg width={220} height={240} viewBox="0 0 220 240">
    <path d="M30 60 Q 20 230 110 232 Q 200 230 190 60 Q 110 40 30 60 Z" fill={C.cream} stroke={C.canvasShade} strokeWidth={6} />
    <path d="M60 50 Q 110 10 160 50" stroke={C.canvasShade} strokeWidth={10} fill="none" />
    <text x={110} y={160} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={40} fill={C.wood}>
      FLOUR
    </text>
  </svg>
);

export const Bacon: React.FC = () => (
  <svg width={300} height={140} viewBox="0 0 300 140">
    <path d="M20 50 Q 150 0 280 50 L 270 110 Q 150 70 30 110 Z" fill="#c2604a" />
    <path d="M28 72 Q 150 30 276 72" stroke="#f1c9b0" strokeWidth={14} fill="none" />
    <path d="M30 96 Q 150 56 272 96" stroke="#f1c9b0" strokeWidth={8} fill="none" />
  </svg>
);

/** Shop counter + chalk price board. */
export const Store: React.FC<{ board?: { x: number; y: number; w: number; h: number }; counterY?: number }> = ({
  board = { x: 70, y: 180, w: 940, h: 640 },
  counterY = 1450,
}) => {
  const { width: W, height: H } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#5a3c24" }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {new Array(Math.ceil(W / 140)).fill(0).map((_, i) => (
          <rect key={i} x={i * 140} y={0} width={136} height={H} fill={i % 2 ? "#5f4028" : "#563921"} />
        ))}
        <rect x={board.x} y={board.y} width={board.w} height={board.h} rx={18} fill="#2c3a33" stroke="#8a6239" strokeWidth={24} />
        <rect x={0} y={counterY} width={W} height={H - counterY} fill="#3e2716" />
        <rect x={0} y={counterY - 20} width={W} height={40} fill="#7a5130" />
      </svg>
    </AbsoluteFill>
  );
};

/** Brown campfire-coloured vignette for mood. */
export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.55 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(20,12,4,${strength}) 100%)`,
    }}
  />
);
