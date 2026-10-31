import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors, font, SITE, WHATSAPP } from "../theme";

// Navy gradient backdrop with a slow-drifting glow, shared by every scene.
export const Backdrop: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${50 + Math.sin(frame / 60) * 15}% ${30 + Math.cos(frame / 80) * 10}%, ${colors.navyLight} 0%, ${colors.navy} 65%)`,
        fontFamily: font,
        color: colors.white,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const Star: React.FC<{ size: number; color?: string }> = ({
  size,
  color = colors.cyan,
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path
      d="M50 0 L61 39 L100 50 L61 61 L50 100 L39 61 L0 50 L39 39 Z"
      fill={color}
    />
  </svg>
);

export const Logo: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 18 * scale,
      fontWeight: 700,
      fontSize: 44 * scale,
      letterSpacing: 1,
    }}
  >
    <Star size={52 * scale} />
    <span>
      NorthStar <span style={{ color: colors.cyan }}>Dizital</span>
    </span>
  </div>
);

export const WhatsAppIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="16" fill={colors.whatsapp} />
    <path
      d="M16 7a9 9 0 0 0-7.8 13.5L7 25l4.6-1.2A9 9 0 1 0 16 7Zm4.9 12.6c-.2.6-1.2 1.1-1.7 1.2-.4 0-1 .1-3.2-.8-2.7-1.1-4.4-3.9-4.5-4-.1-.2-1.1-1.4-1.1-2.7s.7-1.9.9-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.1.1.3 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.7 1.2 1.5 1.9 1 .9 1.9 1.2 2.2 1.3.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3Z"
      fill="#fff"
    />
  </svg>
);

// Pops a block in with a spring, starting at `delay` frames.
export const PopIn: React.FC<{
  delay?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay = 0, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 14 } });
  return (
    <div
      style={{
        opacity: interpolate(frame - delay, [0, 6], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        scale: interpolate(s, [0, 1], [0.85, 1]),
        translate: `0px ${interpolate(s, [0, 1], [40, 0])}px`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Big hook headline for the first 2–3 seconds of a Reel.
export const HookScene: React.FC<{ eyebrow?: string; lines: string[] }> = ({
  eyebrow,
  lines,
}) => {
  const frame = useCurrentFrame();
  return (
    <Backdrop>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: "0 90px",
          textAlign: "center",
          gap: 36,
        }}
      >
        {eyebrow ? (
          <PopIn>
            <div
              style={{
                fontSize: 52,
                fontWeight: 600,
                color: colors.navy,
                background: colors.cyan,
                padding: "10px 34px",
                borderRadius: 999,
              }}
            >
              {eyebrow}
            </div>
          </PopIn>
        ) : null}
        {lines.map((line, i) => (
          <PopIn key={line} delay={6 + i * 8}>
            <div
              style={{
                fontSize: i === 0 ? 120 : 92,
                fontWeight: 700,
                lineHeight: 1.25,
                color: i === 0 ? colors.white : colors.gold,
              }}
            >
              {line}
            </div>
          </PopIn>
        ))}
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          bottom: 140,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          opacity: interpolate(frame, [20, 35], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        <Logo scale={0.9} />
      </div>
    </Backdrop>
  );
};

// Closing call to action with the WhatsApp number.
export const CtaScene: React.FC<{ headline: string; sub?: string }> = ({
  headline,
  sub,
}) => {
  const frame = useCurrentFrame();
  return (
    <Backdrop>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: "0 90px",
          textAlign: "center",
          gap: 50,
        }}
      >
        <PopIn>
          <Logo scale={1.3} />
        </PopIn>
        <PopIn delay={8}>
          <div style={{ fontSize: 92, fontWeight: 700, lineHeight: 1.25 }}>
            {headline}
          </div>
        </PopIn>
        {sub ? (
          <PopIn delay={14}>
            <div style={{ fontSize: 56, color: colors.gold, fontWeight: 600 }}>
              {sub}
            </div>
          </PopIn>
        ) : null}
        <PopIn delay={22}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              background: colors.whatsapp,
              color: colors.white,
              fontSize: 60,
              fontWeight: 700,
              padding: "28px 52px",
              borderRadius: 999,
              scale: interpolate(Math.sin(frame / 6), [-1, 1], [0.97, 1.03]),
            }}
          >
            <WhatsAppIcon size={72} />
            {WHATSAPP}
          </div>
        </PopIn>
        <PopIn delay={30}>
          <div style={{ fontSize: 44, color: colors.muted }}>{SITE}</div>
        </PopIn>
      </AbsoluteFill>
    </Backdrop>
  );
};
