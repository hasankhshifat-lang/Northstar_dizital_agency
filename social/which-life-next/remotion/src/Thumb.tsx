import React from "react";
import { AbsoluteFill, random } from "remotion";
import { Kit } from "./kit/Kit";
import { Barn, Prairie, Sky, Wagon } from "./sets/sets";
import { Cornfield, LocustCarpet, Swarm } from "./sets/plains";

/**
 * Thumbnail art (no text — text is added afterwards so it can be edited quickly).
 * Rules learned from the niche's top thumbnails (Fossil, ONE RULE, Santi Can't):
 * one huge focal threat or a big scared face, very high contrast, room for 2–3 words.
 */
export type ThumbProps = { variant: "closeup" | "split" | "blizzard" | "trail" };

/** A big, detailed Rocky Mountain locust in side view, facing right. ~620 units long at scale 1. */
export const GiantLocust: React.FC<{ x: number; y: number; scale?: number; rotate?: number; flip?: boolean }> = ({ x, y, scale = 1, rotate = 0, flip }) => {
  const body = "#7b6b38", dark = "#3f3519", light = "#a8934f", eye = "#1a140a";
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${flip ? -scale : scale} ${scale})`}>
      {/* far legs */}
      <path d="M 60 20 L 30 90 L 50 92" stroke={dark} strokeWidth={9} fill="none" strokeLinecap="round" />
      <path d="M 140 22 L 120 92 L 140 94" stroke={dark} strokeWidth={9} fill="none" strokeLinecap="round" />
      {/* abdomen */}
      <path d="M -40 -10 Q -200 -40 -330 0 Q -350 18 -330 34 Q -200 60 -40 40 Z" fill={body} stroke={dark} strokeWidth={5} />
      {[-90, -140, -190, -240, -285].map((sx) => (
        <path key={sx} d={`M ${sx} -22 Q ${sx - 8} 12 ${sx} 46`} stroke={dark} strokeWidth={4} fill="none" opacity={0.7} />
      ))}
      {/* folded wings */}
      <path d="M 90 -40 Q -120 -90 -360 -26 Q -150 -20 70 0 Z" fill="#c9b680" opacity={0.85} stroke={dark} strokeWidth={4} />
      {[-40, -120, -200, -280].map((wx) => (
        <path key={wx} d={`M ${wx + 40} -50 L ${wx - 30} -28`} stroke={dark} strokeWidth={2.5} opacity={0.6} />
      ))}
      <path d="M 70 -34 Q -100 -64 -330 -30" stroke={dark} strokeWidth={3} fill="none" opacity={0.6} />
      {/* thorax (pronotum saddle) */}
      <path d="M 40 -52 Q 120 -76 190 -46 L 196 40 Q 120 58 40 44 Z" fill={light} stroke={dark} strokeWidth={5} />
      <path d="M 60 -40 Q 120 -58 180 -36" stroke={dark} strokeWidth={4} fill="none" />
      {/* head */}
      <path d="M 186 -60 Q 270 -84 300 -10 Q 306 50 250 70 Q 200 74 188 40 Z" fill={body} stroke={dark} strokeWidth={5} />
      <ellipse cx={248} cy={-22} rx={30} ry={40} fill={eye} />
      <ellipse cx={240} cy={-36} rx={9} ry={12} fill="#fff6d8" opacity={0.85} />
      {/* mandibles */}
      <path d="M 268 58 L 290 84 L 262 80 Z" fill={dark} />
      {/* antennae */}
      <path d="M 270 -66 Q 330 -170 420 -200" stroke={dark} strokeWidth={6} fill="none" strokeLinecap="round" />
      <path d="M 250 -70 Q 290 -190 370 -240" stroke={dark} strokeWidth={6} fill="none" strokeLinecap="round" />
      {/* near front + middle legs */}
      <path d="M 180 40 L 210 110 L 246 116" stroke={dark} strokeWidth={11} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 110 44 L 96 118 L 128 124" stroke={dark} strokeWidth={11} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* huge hind leg: femur with chevrons, then spiny tibia */}
      <path d="M 40 10 Q -60 -110 -200 -128 Q -220 -112 -196 -100 Q -80 -70 10 40 Z" fill={light} stroke={dark} strokeWidth={5} />
      {[-40, -80, -120, -160].map((fx, i) => (
        <path key={fx} d={`M ${fx} ${-60 - i * 14} l -14 22 l 18 -6`} stroke={dark} strokeWidth={3.5} fill="none" />
      ))}
      <path d="M -204 -116 L -150 110" stroke={dark} strokeWidth={10} strokeLinecap="round" />
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M ${-196 + i * 10} ${-80 + i * 38} l 14 -6`} stroke={dark} strokeWidth={4} strokeLinecap="round" />
      ))}
      <path d="M -150 110 L -120 116" stroke={dark} strokeWidth={9} strokeLinecap="round" />
    </g>
  );
};

/** Small locusts (for crawling on Kit's cap/coat). */
const Crawler: React.FC<{ x: number; y: number; s: number; r: number }> = ({ x, y, s, r }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <GiantLocust x={0} y={0} scale={1} />
  </g>
);

const SunsetSky: React.FC = () => (
  <g>
    <defs>
      <linearGradient id="thumbSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#120c0a" />
        <stop offset="0.45" stopColor="#4a2216" />
        <stop offset="0.8" stopColor="#c4511e" />
        <stop offset="1" stopColor="#f39a3a" />
      </linearGradient>
      <radialGradient id="thumbSun" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#fff2b8" />
        <stop offset="0.45" stopColor="#ffb447" />
        <stop offset="1" stopColor="#ff7a1f" stopOpacity={0} />
      </radialGradient>
    </defs>
    <rect x={0} y={0} width={1920} height={1080} fill="url(#thumbSky)" />
  </g>
);

const Specks: React.FC<{ n: number; x0: number; x1: number; y0: number; y1: number; seed: string; color?: string }> = ({ n, x0, x1, y0, y1, seed, color = "#1b140b" }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const x = x0 + random(`${seed}x${i}`) * (x1 - x0);
      const y = y0 + Math.pow(random(`${seed}y${i}`), 1.6) * (y1 - y0);
      const s = 3 + random(`${seed}s${i}`) * 7;
      return <ellipse key={i} cx={x} cy={y} rx={s * 1.6} ry={s * 0.55} fill={color} opacity={0.85} transform={`rotate(${random(`${seed}r${i}`) * 50 - 25} ${x} ${y})`} />;
    })}
  </g>
);

const Closeup: React.FC = () => (
  <svg viewBox="0 0 1920 1080" width="100%" height="100%">
    <SunsetSky />
    <circle cx={1360} cy={560} r={420} fill="url(#thumbSun)" />
    <circle cx={1360} cy={560} r={190} fill="#ffe08a" />
    <Specks n={900} x0={0} x1={1920} y0={0} y1={900} seed="sw" />
    {/* bare, eaten field */}
    <path d="M 0 900 Q 960 860 1920 900 L 1920 1080 L 0 1080 Z" fill="#2c2114" />
    {Array.from({ length: 60 }).map((_, i) => (
      <path key={i} d={`M ${i * 33 + random(`st${i}`) * 10} 1080 l ${random(`sl${i}`) * 10 - 5} -${50 + random(`sh${i}`) * 50}`} stroke="#4d3b20" strokeWidth={6} />
    ))}
    {/* Kit, close up and terrified */}
    <g transform="translate(1360 3060) scale(7.4)">
      <Kit pose="front" expression="scared" />
    </g>
    <Crawler x={1250} y={300} s={0.16} r={-8} />
    <Crawler x={1530} y={330} s={0.14} r={14} />
    <Crawler x={1130} y={900} s={0.2} r={-20} />
    <Crawler x={1640} y={960} s={0.18} r={30} />
    {/* the giant locust, lit from the sunset side */}
    <GiantLocust x={560} y={820} scale={1.5} rotate={-10} />
  </svg>
);

const Split: React.FC = () => (
  <svg viewBox="0 0 1920 1080" width="100%" height="100%">
    <defs>
      <clipPath id="L"><rect x={0} y={0} width={960} height={1080} /></clipPath>
      <clipPath id="R"><rect x={960} y={0} width={960} height={1080} /></clipPath>
    </defs>
    <g clipPath="url(#L)">
      <Sky time="day" clouds={3} />
      <Prairie green tufts={20} />
      <Cornfield x={-60} y={940} width={1100} rows={4} scale={1.5} />
      <g transform="translate(480 1440) scale(2.9)"><Kit pose="front" /></g>
    </g>
    <g clipPath="url(#R)">
      <SunsetSky />
      <circle cx={1440} cy={560} r={360} fill="url(#thumbSun)" />
      <Specks n={700} x0={960} x1={1920} y0={0} y1={950} seed="sp" />
      <path d="M 960 860 L 1920 860 L 1920 1080 L 960 1080 Z" fill="#3a2c18" />
      <g transform="translate(-960 0)"><g transform="translate(1920 0)"><Cornfield x={-60} y={940} width={1100} rows={4} scale={1.5} eaten={1} /></g></g>
      <g transform="translate(1440 1440) scale(2.9)"><Kit pose="front" expression="scared" /></g>
      <Crawler x={1330} y={460} s={0.1} r={-10} />
      <Crawler x={1560} y={720} s={0.1} r={20} />
      <GiantLocust x={1180} y={980} scale={0.7} rotate={-8} />
    </g>
    <rect x={952} y={0} width={16} height={1080} fill="#fff" />
  </svg>
);


/** Blowing snow streaks (static, horizontal) for blizzard thumbnails. */
const Streaks: React.FC<{ n: number; seed: string }> = ({ n, seed }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const x = random(`${seed}x${i}`) * 2100 - 100, y = random(`${seed}y${i}`) * 1080;
      const len = 30 + random(`${seed}l${i}`) * 120, w = 3 + random(`${seed}w${i}`) * 7;
      return <line key={i} x1={x} y1={y} x2={x + len} y2={y + len * 0.18} stroke="#fff" strokeWidth={w} strokeLinecap="round" opacity={0.5 + random(`${seed}o${i}`) * 0.5} />;
    })}
  </g>
);

const Blizzard: React.FC = () => (
  <svg viewBox="0 0 1920 1080" width="100%" height="100%">
    <defs>
      <linearGradient id="bzSky" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#0d1b2e" />
        <stop offset="0.55" stopColor="#3d5f86" />
        <stop offset="1" stopColor="#c9dcec" />
      </linearGradient>
    </defs>
    <rect x={0} y={0} width={1920} height={1080} fill="url(#bzSky)" />
    {/* the barn, barely visible through the whiteout */}
    <g opacity={0.35}><Barn x={420} y={760} scale={1.1} snowy={1} /></g>
    <path d="M 0 860 Q 960 820 1920 880 L 1920 1080 L 0 1080 Z" fill="#e8f0f7" />
    {/* the rope to the barn: the only way back */}
    <path d="M -20 990 Q 520 1010 1180 840" stroke="#3a2a18" strokeWidth={22} fill="none" />
    <path d="M -20 990 Q 520 1010 1180 840" stroke="#c9a46a" strokeWidth={14} fill="none" strokeDasharray="26 10" />
    <Streaks n={260} seed="bz1" />
    <g transform="translate(1360 3060) scale(7.4)">
      <Kit pose="front" outfit="winter" expression="scared" />
    </g>
    {/* snow piled on the cap */}
    <path d="M 1040 300 Q 1100 196 1360 190 Q 1620 196 1680 300 Q 1520 250 1360 252 Q 1200 250 1040 300 Z" fill="#f4f8fb" />
    <Streaks n={35} seed="bz2" />
  </svg>
);

/** Wooden grave marker by the trail. */
const Grave: React.FC<{ x: number; y: number; s: number; r?: number }> = ({ x, y, s, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <ellipse cx={0} cy={6} rx={90} ry={22} fill="#3b2a18" />
    <rect x={-12} y={-190} width={24} height={196} fill="#6b4f30" stroke="#2c2012" strokeWidth={5} />
    <rect x={-70} y={-150} width={140} height={24} fill="#6b4f30" stroke="#2c2012" strokeWidth={5} />
  </g>
);

const Trail: React.FC = () => (
  <svg viewBox="0 0 1920 1080" width="100%" height="100%">
    <SunsetSky />
    <circle cx={1360} cy={560} r={420} fill="url(#thumbSun)" />
    <circle cx={1360} cy={560} r={190} fill="#ffe08a" />
    <path d="M 0 780 Q 960 740 1920 790 L 1920 1080 L 0 1080 Z" fill="#5a3f22" />
    <path d="M 0 1000 Q 600 900 1100 790" stroke="#7a5a35" strokeWidth={60} fill="none" opacity={0.6} />
    <Wagon x={430} y={800} scale={1.25} oxen />
    {/* graves along the trail */}
    <Grave x={160} y={1040} s={1.5} r={-6} />
    <Grave x={470} y={1010} s={1.15} r={5} />
    <Grave x={720} y={975} s={0.85} r={-3} />
    <Grave x={900} y={950} s={0.6} r={4} />
    <g transform="translate(1360 3060) scale(7.4)">
      <Kit pose="front" expression="scared" />
    </g>
  </svg>
);

export const Thumb: React.FC<ThumbProps> = ({ variant }) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>{variant === "split" ? <Split /> : variant === "blizzard" ? <Blizzard /> : variant === "trail" ? <Trail /> : <Closeup />}</AbsoluteFill>
);

// unused imports guard (LocustCarpet/Swarm kept available for future thumbnail variants)
void LocustCarpet;
void Swarm;
