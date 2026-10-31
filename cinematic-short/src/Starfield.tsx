import React from "react";
import { random, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "./theme";

const PALETTE = [C.text, C.purpleLight, C.purple, C.magenta, C.orange];

type Props = {
  count?: number;
  // depth units travelled per frame (camera push speed); may be a function of frame
  speed: (frame: number) => number;
  streak?: (frame: number) => number; // trail length in depth units (0 = dots)
  seed?: string;
  colorful?: boolean;
};

// Integrate speed over frames so speed ramps stay smooth and deterministic.
const travelled = (frame: number, speed: (f: number) => number) => {
  let t = 0;
  for (let f = 0; f < frame; f++) t += speed(f);
  return t;
};

export const Starfield: React.FC<Props> = ({ count = 450, speed, streak, seed = "s", colorful = false }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cx = width / 2;
  const cy = height / 2;
  const focal = 520;
  const dist = travelled(frame, speed);
  const trail = streak ? streak(frame) : 0;

  const project = (x: number, y: number, z: number) => ({ px: cx + (x / z) * focal, py: cy + (y / z) * focal });

  return (
    <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
      {new Array(count).fill(0).map((_, i) => {
        const x = (random(`${seed}x${i}`) * 2 - 1) * 1.6;
        const y = (random(`${seed}y${i}`) * 2 - 1) * 0.95;
        const z0 = random(`${seed}z${i}`);
        const z = (((z0 - dist) % 1) + 1) % 1 * 1.0 + 0.02;
        const { px, py } = project(x, y, z);
        const near = 1 - z;
        const fadeIn = Math.min(1, near * 3);
        const color = colorful ? PALETTE[i % PALETTE.length] : i % 7 === 0 ? C.purpleLight : C.text;
        if (trail > 0.002) {
          const tail = project(x, y, Math.min(1.05, z + trail));
          return (
            <line
              key={i}
              x1={tail.px}
              y1={tail.py}
              x2={px}
              y2={py}
              stroke={color}
              strokeWidth={0.6 + near * 3.2}
              strokeLinecap="round"
              opacity={fadeIn}
            />
          );
        }
        return <circle key={i} cx={px} cy={py} r={0.4 + near * near * 2.6} fill={color} opacity={fadeIn * 0.95} />;
      })}
    </svg>
  );
};
