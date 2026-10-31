import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { Starfield } from "../Starfield";
import { CineText } from "../CineText";
import { Flare } from "../Overlays";
import { C, clamp } from "../theme";

// Scattered stars drift into place and lines draw the four-point North Star.
const R = 230; // outer radius
const r = 62; // inner radius
const shape = new Array(8).fill(0).map((_, i) => {
  const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
  const rad = i % 2 === 0 ? R : r;
  return { x: Math.cos(a) * rad, y: Math.sin(a) * rad };
});

export const Constellation: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const cx = width / 2;
  const cy = height / 2 - 70;
  const gather = interpolate(frame, [0, 55], [0, 1], { ...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1) });
  const draw = interpolate(frame, [45, 95], [0, 1], { ...clamp, easing: Easing.bezier(0.45, 0, 0.2, 1) });
  const glow = interpolate(frame, [90, 115], [0, 1], clamp);
  const perimeter = shape.reduce((acc, p, i) => {
    const q = shape[(i + 1) % shape.length];
    return acc + Math.hypot(q.x - p.x, q.y - p.y);
  }, 0);
  const path = shape.map((p, i) => `${i === 0 ? "M" : "L"}${cx + p.x},${cy + p.y}`).join(" ") + " Z";
  const rot = interpolate(frame, [0, durationInFrames], [-8, 4], clamp);

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Starfield seed="const" count={300} speed={() => 0.0009} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 43%, ${C.magenta}2a, transparent 45%)`,
          opacity: glow,
        }}
      />
      <svg width={width} height={height} style={{ position: "absolute", inset: 0, rotate: `${rot}deg`, scale: String(1 + frame * 0.0012) }}>
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={C.purpleLight} />
            <stop offset="0.5" stopColor={C.magenta} />
            <stop offset="1" stopColor={C.orange} />
          </linearGradient>
        </defs>
        <path d={path} fill={`url(#g)`} opacity={glow * 0.22} />
        <path
          d={path}
          fill="none"
          stroke="url(#g)"
          strokeWidth={2.5}
          strokeDasharray={perimeter}
          strokeDashoffset={perimeter * (1 - draw)}
          style={{ filter: "drop-shadow(0 0 10px #EC5AAE)" }}
        />
        {shape.map((p, i) => {
          const sx = cx + (random(`cs${i}x`) * 2 - 1) * 800;
          const sy = cy + (random(`cs${i}y`) * 2 - 1) * 380;
          const x = sx + (cx + p.x - sx) * gather;
          const y = sy + (cy + p.y - sy) * gather;
          const tw = 0.75 + 0.25 * Math.sin(frame / 4 + i);
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={i % 2 === 0 ? 7 : 4} fill="#fff" opacity={tw} />
              <circle cx={x} cy={y} r={22} fill={C.purpleLight} opacity={0.18 * tw} />
            </g>
          );
        })}
      </svg>
      <Flare x={cx} y={cy - R} intensity={glow * 0.8} color={C.magenta} width={900} />
      <CineText text="Most never find it." from={20} to={durationInFrames} size={56} y={300} />
    </AbsoluteFill>
  );
};
