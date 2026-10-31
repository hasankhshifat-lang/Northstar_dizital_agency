import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Starfield } from "../Starfield";
import { C, clamp, fontFamily } from "../theme";

// Hyperspace jump with brand-colored streaks and hard-cut words.
const WORDS = [
  { t: "Design", c: C.purpleLight },
  { t: "Code", c: C.magenta },
  { t: "AI", c: C.orange },
];

export const Warp: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const speed = (f: number) => interpolate(f, [0, 40, 120, 150], [0.004, 0.03, 0.045, 0.06], clamp);
  const streak = (f: number) => interpolate(f, [0, 40], [0.01, 0.35], clamp);
  const shake = interpolate(frame, [0, 40, 150], [0, 4, 7], clamp);
  const sx = Math.sin(frame * 2.1) * shake;
  const sy = Math.cos(frame * 2.7) * shake;
  const slot = 32;
  const start = 40;
  const idx = Math.floor((frame - start) / slot);
  const local = (frame - start) % slot;
  const word = idx >= 0 && idx < WORDS.length ? WORDS[idx] : null;

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{ translate: `${sx}px ${sy}px`, scale: "1.02" }}>
        <Starfield seed="warp" count={520} colorful speed={speed} streak={streak} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at center, ${C.purple}55 0%, transparent 35%)`,
          opacity: interpolate(frame, [30, durationInFrames], [0.3, 1], clamp),
          mixBlendMode: "screen",
        }}
      />
      {word ? (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <div
            style={{
              fontFamily,
              fontWeight: 700,
              fontSize: 190,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#fff",
              scale: String(interpolate(local, [0, slot], [1.18, 0.96], clamp)),
              opacity: interpolate(local, [0, 3, slot - 6, slot], [0, 1, 1, 0], clamp),
              textShadow: `0 0 40px ${word.c}, 0 0 120px ${word.c}`,
              filter: `blur(${interpolate(local, [0, 4], [10, 0], clamp)}px)`,
            }}
          >
            {word.t}
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
