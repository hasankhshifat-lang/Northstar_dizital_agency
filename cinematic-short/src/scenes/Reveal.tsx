import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Starfield } from "../Starfield";
import { Flare } from "../Overlays";
import { C, clamp, fontFamily } from "../theme";

// Logo emerges from the flash, light sweeps across, tagline lands.
export const Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const ease = Easing.bezier(0.16, 1, 0.3, 1);
  const logoIn = interpolate(frame, [0, 45], [0, 1], { ...clamp, easing: ease });
  const sweep = interpolate(frame, [30, 80], [-30, 130], clamp);
  const tag = interpolate(frame, [60, 95], [0, 1], { ...clamp, easing: ease });
  const url = interpolate(frame, [100, 130], [0, 1], clamp);
  const logoW = 1100;

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Starfield seed="rev" count={260} speed={() => 0.0006} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${C.purple}40, transparent 55%)`,
          opacity: logoIn,
        }}
      />
      <Flare
        x={width / 2}
        y={height / 2 - 40}
        intensity={interpolate(frame, [0, 10, 60], [1, 0.8, 0.15], clamp)}
        width={1800}
      />
      <div
        style={{
          position: "absolute",
          left: (width - logoW) / 2,
          top: height / 2 - 100,
          width: logoW,
          scale: String(interpolate(frame, [0, 210], [1.12, 1], { ...clamp, easing: ease })),
          opacity: logoIn,
          filter: `blur(${(1 - logoIn) * 20}px) drop-shadow(0 0 30px ${C.purple}88)`,
          WebkitMaskImage: `linear-gradient(100deg, #000 0%, #000 100%)`,
        }}
      >
        <Img src={staticFile("logo.png")} style={{ width: "100%" }} />
        {/* specular light sweep, masked to the logo shape */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(100deg, transparent ${sweep - 12}%, rgba(255,255,255,0.95) ${sweep}%, transparent ${sweep + 12}%)`,
            WebkitMaskImage: `url(${staticFile("logo.png")})`,
            WebkitMaskSize: "100% 100%",
            mixBlendMode: "screen",
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: height / 2 + 70,
          textAlign: "center",
          fontFamily,
          fontWeight: 300,
          fontSize: 46,
          letterSpacing: interpolate(frame, [60, 210], [0.5, 0.3], clamp) + "em",
          textTransform: "uppercase",
          opacity: tag,
          translate: `0px ${(1 - tag) * 20}px`,
          background: `linear-gradient(90deg, ${C.purpleLight}, ${C.magenta}, ${C.orange})`,
          WebkitBackgroundClip: "text",
          color: "transparent",
        }}
      >
        Intelligent Digital Experiences
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: height / 2 + 160,
          textAlign: "center",
          fontFamily,
          fontWeight: 500,
          fontSize: 26,
          letterSpacing: "0.35em",
          color: C.text,
          opacity: url * 0.7,
        }}
      >
        DESIGN · WEB · AI SOLUTIONS
      </div>
    </AbsoluteFill>
  );
};
