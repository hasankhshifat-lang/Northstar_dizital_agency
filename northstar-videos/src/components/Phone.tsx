import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { colors, font } from "../theme";

// A simple phone frame; children render inside the screen.
export const Phone: React.FC<{
  children: React.ReactNode;
  width?: number;
  height?: number;
}> = ({ children, width = 760, height = 1500 }) => (
  <div
    style={{
      width,
      height,
      borderRadius: 90,
      background: "#05080F",
      padding: 22,
      boxShadow: "0 40px 120px rgba(34,211,238,0.25)",
      position: "relative",
    }}
  >
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 70,
        overflow: "hidden",
        position: "relative",
        background: colors.white,
        fontFamily: font,
      }}
    >
      {children}
    </div>
    <div
      style={{
        position: "absolute",
        top: 40,
        left: "50%",
        translate: "-50% 0",
        width: 180,
        height: 44,
        borderRadius: 999,
        background: "#05080F",
      }}
    />
  </div>
);

export const ChatHeader: React.FC<{ name: string; status: string }> = ({
  name,
  status,
}) => (
  <div
    style={{
      background: "#075E54",
      color: colors.white,
      padding: "100px 36px 26px",
      display: "flex",
      alignItems: "center",
      gap: 22,
    }}
  >
    <div
      style={{
        width: 80,
        height: 80,
        borderRadius: 999,
        background: colors.navy,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: colors.cyan,
        fontSize: 44,
        fontWeight: 700,
      }}
    >
      ✦
    </div>
    <div>
      <div style={{ fontSize: 40, fontWeight: 700 }}>{name}</div>
      <div style={{ fontSize: 28, opacity: 0.85 }}>{status}</div>
    </div>
  </div>
);

export const Bubble: React.FC<{
  side: "in" | "out";
  time: string;
  appearAt: number;
  children: React.ReactNode;
}> = ({ side, time, appearAt, children }) => {
  const frame = useCurrentFrame();
  const t = frame - appearAt;
  if (t < 0) return null;
  return (
    <div
      style={{
        alignSelf: side === "out" ? "flex-end" : "flex-start",
        maxWidth: "82%",
        background: side === "out" ? colors.bubbleOut : colors.white,
        color: "#111",
        borderRadius: 26,
        padding: "20px 26px 12px",
        fontSize: 36,
        lineHeight: 1.45,
        boxShadow: "0 2px 4px rgba(0,0,0,0.12)",
        opacity: interpolate(t, [0, 6], [0, 1], { extrapolateRight: "clamp" }),
        translate: `0px ${interpolate(t, [0, 8], [30, 0], { extrapolateRight: "clamp" })}px`,
      }}
    >
      {children}
      <div
        style={{
          fontSize: 24,
          color: "#667",
          textAlign: "right",
          marginTop: 6,
        }}
      >
        {time} {side === "out" ? "✓✓" : ""}
      </div>
    </div>
  );
};

export const Typing: React.FC<{ from: number; to: number }> = ({
  from,
  to,
}) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= to) return null;
  return (
    <div
      style={{
        alignSelf: "flex-start",
        background: colors.white,
        borderRadius: 26,
        padding: "26px 30px",
        display: "flex",
        gap: 12,
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 18,
            height: 18,
            borderRadius: 999,
            background: "#8696A0",
            translate: `0px ${Math.sin((frame - from) / 3 - i) * 6}px`,
          }}
        />
      ))}
    </div>
  );
};

// Website-in-a-phone that scrolls through `sections` over the scene.
export const ScrollingSite: React.FC<{
  scrollFrom: number;
  scrollTo: number;
  distance: number;
  children: React.ReactNode;
}> = ({ scrollFrom, scrollTo, distance, children }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        translate: `0px ${-interpolate(frame, [scrollFrom, scrollTo], [0, distance], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })}px`,
      }}
    >
      {children}
    </div>
  );
};
