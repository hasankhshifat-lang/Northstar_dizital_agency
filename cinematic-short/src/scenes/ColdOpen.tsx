import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Starfield } from "../Starfield";
import { CineText } from "../CineText";
import { Flare } from "../Overlays";
import { C, clamp } from "../theme";

// Darkness -> a single star ignites -> slow camera push through space.
export const ColdOpen: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const ignite = interpolate(frame, [8, 26, 60], [0, 1, 0.55], clamp);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{ opacity: interpolate(frame, [20, 70], [0, 1], clamp) }}>
        <Starfield seed="open" speed={() => 0.0016} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 60%, ${C.purple}33, transparent 60%)`,
          opacity: interpolate(frame, [20, durationInFrames], [0, 1], clamp),
        }}
      />
      <Flare x={width / 2} y={height / 2 - 120} intensity={ignite} width={interpolate(frame, [8, 40], [200, 1600], clamp)} />
      <CineText text="Every brand has a direction" from={38} to={durationInFrames} size={58} y={110} />
    </AbsoluteFill>
  );
};
