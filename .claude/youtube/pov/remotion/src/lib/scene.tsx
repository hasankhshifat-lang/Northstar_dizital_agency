import React from "react";
import { AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { s } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** A scene between two timestamps (seconds), with a slow push-in and a short fade-in. */
export const Scene: React.FC<{
  from: number;
  to: number;
  name: string;
  push?: number;
  fade?: boolean;
  children: React.ReactNode;
}> = ({ from, to, name, push = 0.06, fade = true, children }) => (
  <Sequence name={name} from={s(from)} durationInFrames={Math.max(1, s(to) - s(from))} layout="absolute-fill">
    <PushIn push={push} fade={fade}>
      {children}
    </PushIn>
  </Sequence>
);

const PushIn: React.FC<{ push: number; fade: boolean; children: React.ReactNode }> = ({ push, fade, children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        opacity: fade ? interpolate(frame, [0, 5], [0, 1], clamp) : 1,
      }}
    >
      <AbsoluteFill
        style={{
          scale: String(interpolate(frame, [0, durationInFrames], [1, 1 + push], { ...clamp, easing: Easing.inOut(Easing.sin) })),
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Local seconds since the enclosing Sequence started. */
export const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};

export const lerp = (t: number, inp: number[], out: number[], ease = Easing.inOut(Easing.cubic)) =>
  interpolate(t, inp, out, { ...clamp, easing: ease });
