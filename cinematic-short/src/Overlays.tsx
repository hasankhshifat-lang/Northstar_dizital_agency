import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp } from "./theme";

// 2.39:1 anamorphic letterbox bars that slide in on the first frames.
export const Letterbox: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const bar = (height - width / 2.39) / 2;
  const h = interpolate(frame, [0, 20], [height / 2, bar], clamp);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: h, background: "#000" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: h, background: "#000" }} />
    </AbsoluteFill>
  );
};

// Animated film grain: the turbulence seed changes every frame.
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.09 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <svg width="100%" height="100%">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame % 60} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,0.85) 100%)",
      pointerEvents: "none",
    }}
  />
);

// Horizontal anamorphic lens flare streak.
export const Flare: React.FC<{ x: number; y: number; intensity: number; color?: string; width?: number }> = ({
  x,
  y,
  intensity,
  color = "#B49AFF",
  width = 1400,
}) => (
  <>
    <div
      style={{
        position: "absolute",
        left: x - width / 2,
        top: y - 3,
        width,
        height: 6,
        borderRadius: 6,
        background: `linear-gradient(90deg, transparent, ${color} 35%, #fff 50%, ${color} 65%, transparent)`,
        filter: "blur(3px)",
        opacity: intensity,
        mixBlendMode: "screen",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: x - 220,
        top: y - 220,
        width: 440,
        height: 440,
        borderRadius: "50%",
        background: `radial-gradient(circle, rgba(255,255,255,0.9) 0%, ${color}66 18%, transparent 65%)`,
        opacity: intensity,
        mixBlendMode: "screen",
      }}
    />
  </>
);

// Fullscreen white flash used as an overlay on hard cuts.
export const FlashOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const mid = durationInFrames / 2;
  return (
    <AbsoluteFill
      style={{
        background: "#fff",
        opacity: interpolate(frame, [0, mid, durationInFrames], [0, 1, 0], clamp),
      }}
    />
  );
};
