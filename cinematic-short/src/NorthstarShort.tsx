import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { ColdOpen } from "./scenes/ColdOpen";
import { Constellation } from "./scenes/Constellation";
import { Warp } from "./scenes/Warp";
import { Reveal } from "./scenes/Reveal";
import { FlashOverlay, Grain, Letterbox, Vignette } from "./Overlays";
import { clamp } from "./theme";

export const NorthstarShort: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill
        style={{
          // subtle teal-and-orange-ish grade + global fade to black at the end
          filter: "contrast(1.08) saturate(1.1)",
          opacity: interpolate(frame, [durationInFrames - 20, durationInFrames - 1], [1, 0], clamp),
        }}
      >
        <TransitionSeries>
          <TransitionSeries.Sequence name="Cold open" durationInFrames={120}>
            <ColdOpen />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 20 })} />
          <TransitionSeries.Sequence name="Constellation" durationInFrames={150}>
            <Constellation />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 10 })} />
          <TransitionSeries.Sequence name="Warp" durationInFrames={150}>
            <Warp />
          </TransitionSeries.Sequence>
          <TransitionSeries.Overlay durationInFrames={12}>
            <FlashOverlay />
          </TransitionSeries.Overlay>
          <TransitionSeries.Sequence name="Reveal" durationInFrames={210}>
            <Reveal />
          </TransitionSeries.Sequence>
        </TransitionSeries>
        <Vignette />
        <Grain />
      </AbsoluteFill>
      <Letterbox />
      <Audio src={staticFile("score.wav")} />
    </AbsoluteFill>
  );
};
