import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { C, clamp, fontFamily } from "./theme";

// Blur-to-focus text with tracking that slowly tightens, then fades out.
export const CineText: React.FC<{
  text: string;
  from: number;
  to: number;
  size?: number;
  weight?: number;
  color?: string;
  y?: number;
}> = ({ text, from, to, size = 64, weight = 300, color = C.text, y = 0 }) => {
  const frame = useCurrentFrame();
  const ease = Easing.bezier(0.16, 1, 0.3, 1);
  const inT = interpolate(frame, [from, from + 30], [0, 1], { ...clamp, easing: ease });
  const outT = interpolate(frame, [to - 18, to], [1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: "50%",
        translate: `0px ${y + (1 - inT) * 24}px`,
        textAlign: "center",
        fontFamily,
        fontWeight: weight,
        fontSize: size,
        color,
        letterSpacing: interpolate(frame, [from, to], [0.42, 0.22], clamp) + "em",
        textTransform: "uppercase",
        opacity: inT * outT,
        filter: `blur(${(1 - inT) * 14 + (1 - outT) * 8}px)`,
        textShadow: "0 0 30px rgba(149,102,255,0.45)",
        marginTop: -size / 2,
      }}
    >
      {text}
    </div>
  );
};
