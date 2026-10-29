import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

type Word = { w: string; s: number; e: number };
type Segment = { words: Word[] };

/** Word-by-word captions, 1-3 words per page, current word highlighted. */
export const Captions: React.FC<{ segments: Segment[]; y?: number; size?: number; maxWords?: number; side?: number }> = ({
  segments,
  y = 1330,
  size = 104,
  maxWords = 3,
  side = 80,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  // Whisper splits "2,000" into "2" + ",000" - glue those back together.
  const words = segments
    .flatMap((seg) => seg.words)
    .reduce<Word[]>((acc, w) => {
      if (/^\s*,\d/.test(w.w) && acc.length) {
        const prev = acc[acc.length - 1];
        acc[acc.length - 1] = { w: prev.w + w.w.trim(), s: prev.s, e: w.e };
      } else {
        acc.push(w);
      }
      return acc;
    }, []);
  const pages: Word[][] = [];
  let cur: Word[] = [];
  for (const w of words) {
    cur.push(w);
    const ends = /[.,?!]$/.test(w.w.trim());
    if (cur.length >= maxWords || ends) {
      pages.push(cur);
      cur = [];
    }
  }
  if (cur.length) pages.push(cur);
  const idx = pages.findIndex((p, i) => t >= p[0].s - 0.05 && (i === pages.length - 1 || t < pages[i + 1][0].s - 0.05));
  if (idx < 0) return null;
  const page = pages[idx];
  if (t > page[page.length - 1].e + 0.6) return null;
  const pop = interpolate(t, [page[0].s - 0.05, page[0].s + 0.08], [0.85, 1], clamp);
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <div
        style={{
          position: "absolute",
          top: y,
          left: side,
          right: side,
          textAlign: "center",
          fontFamily: "Oswald",
          fontWeight: 700,
          fontSize: size,
          lineHeight: 1.05,
          textTransform: "uppercase",
          scale: String(pop),
        }}
      >
        {page.map((w, i) => {
          const active = t >= w.s - 0.03;
          return (
            <span
              key={i}
              style={{
                color: active ? C.cream : "rgba(251,244,228,0.55)",
                WebkitTextStroke: `10px ${C.ink}`,
                paintOrder: "stroke fill",
                textShadow: "0 8px 0 rgba(0,0,0,0.35)",
              }}
            >
              {w.w.trim().replace(/[,]$/, "")}{" "}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const DayCounter: React.FC<{ day: number | string }> = ({ day }) => (
  <div
    style={{
      position: "absolute",
      top: 90,
      left: 90,
      padding: "14px 30px",
      backgroundColor: "rgba(27,22,18,0.78)",
      borderRadius: 14,
      fontFamily: "Oswald",
      fontWeight: 700,
      fontSize: 58,
      letterSpacing: 4,
      color: C.cream,
    }}
  >
    {typeof day === "number" ? `DAY ${day}` : day}
  </div>
);

/** Big stamped card text (title-card / on-screen opener). */
export const Stamp: React.FC<{
  text: string;
  start?: number;
  size?: number;
  y?: number;
  color?: string;
  bg?: string;
  side?: number;
}> = ({ text, start = 0, size = 150, y = 520, color = C.cream, bg = "rgba(27,22,18,0.82)", side = 70 }) => {
  const frame = useCurrentFrame();
  const f = frame - start;
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: side,
        right: side,
        textAlign: "center",
        opacity: interpolate(f, [0, 4], [0, 1], clamp),
        scale: String(interpolate(f, [0, 8], [1.35, 1], { ...clamp, easing: Easing.out(Easing.back(2)) })),
      }}
    >
      <span
        style={{
          display: "inline-block",
          padding: "18px 40px",
          backgroundColor: bg,
          borderRadius: 18,
          fontFamily: "Oswald",
          fontWeight: 700,
          fontSize: size,
          lineHeight: 1.05,
          color,
          letterSpacing: 2,
          whiteSpace: "pre-line",
        }}
      >
        {text}
      </span>
    </div>
  );
};

/** Analog pocket-watch-style clock. `hours` 0..12 drives the hand. */
export const Clock: React.FC<{ hours: number; size?: number }> = ({ hours, size = 520 }) => {
  const a = (hours / 12) * 360;
  return (
    <svg width={size} height={size} viewBox="0 0 520 520">
      <circle cx={260} cy={260} r={240} fill={C.cream} stroke={C.wood} strokeWidth={22} />
      {new Array(12).fill(0).map((_, i) => (
        <line
          key={i}
          x1={260 + Math.sin((i * Math.PI) / 6) * 200}
          y1={260 - Math.cos((i * Math.PI) / 6) * 200}
          x2={260 + Math.sin((i * Math.PI) / 6) * 222}
          y2={260 - Math.cos((i * Math.PI) / 6) * 222}
          stroke={C.ink}
          strokeWidth={10}
        />
      ))}
      <path
        d={`M260 260 L 260 50 A 210 210 0 ${a > 180 ? 1 : 0} 1 ${260 + Math.sin((a * Math.PI) / 180) * 210} ${260 - Math.cos((a * Math.PI) / 180) * 210} Z`}
        fill={C.red}
        opacity={0.28}
      />
      <line x1={260} y1={260} x2={260 + Math.sin((a * Math.PI) / 180) * 180} y2={260 - Math.cos((a * Math.PI) / 180) * 180} stroke={C.ink} strokeWidth={14} strokeLinecap="round" />
      <circle cx={260} cy={260} r={18} fill={C.ink} />
    </svg>
  );
};

/** Vertical trail map: Missouri at the bottom, a target at the top. `progress` 0..1 along the trail. */
export const TrailMap: React.FC<{ progress: number; target?: string; showTarget?: boolean }> = ({
  progress,
  target = "JULY 4",
  showTarget = true,
}) => {
  const path = "M540 1700 C 300 1500 800 1300 560 1100 C 360 930 760 760 540 560 C 420 450 600 380 540 300";
  const len = 1900;
  return (
    <AbsoluteFill style={{ backgroundColor: "#e9dcbc" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <rect x={40} y={40} width={1000} height={1840} rx={30} fill="none" stroke="#b39a6a" strokeWidth={12} />
        <path d={path} stroke="#b39a6a" strokeWidth={18} strokeDasharray="10 26" fill="none" strokeLinecap="round" />
        <path
          d={path}
          stroke={C.red}
          strokeWidth={22}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={len}
          strokeDashoffset={len * (1 - progress)}
        />
        <circle cx={540} cy={1700} r={26} fill={C.wood} />
        <text x={540} y={1790} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={56} fill={C.wood}>
          MISSOURI
        </text>
        {showTarget ? (
          <g>
            <path d="M440 300 Q 470 210 540 200 Q 610 210 640 300 Z" fill={C.rock} />
            <text x={540} y={170} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={64} fill={C.red}>
              {target}
            </text>
          </g>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};

/** Big animated number counter. */
export const Counter: React.FC<{ from: number; to: number; start: number; end: number; prefix?: string; suffix?: string; size?: number; y?: number }> = ({
  from,
  to,
  start,
  end,
  prefix = "",
  suffix = "",
  size = 200,
  y = 300,
}) => {
  const frame = useCurrentFrame();
  const v = Math.round(interpolate(frame, [start, end], [from, to], { ...clamp, easing: Easing.out(Easing.cubic) }));
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: "Oswald",
        fontWeight: 700,
        fontSize: size,
        color: C.cream,
        WebkitTextStroke: `12px ${C.ink}`,
        paintOrder: "stroke fill",
      }}
    >
      {prefix}
      {v.toLocaleString("en-US")}
      {suffix}
    </div>
  );
};
