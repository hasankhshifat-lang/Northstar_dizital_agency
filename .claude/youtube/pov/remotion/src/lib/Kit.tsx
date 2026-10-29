import React from "react";
import { useCurrentFrame } from "remotion";
import { C } from "./theme";

/**
 * Kit - the channel's recurring "You". One character, a new American life per video.
 * Signatures that never change: red scarf, teal hair streak, brass pocket watch, big eyes.
 */

export type KitOutfit = "pioneer" | "miner" | "attendant" | "recruit" | "plain";
export type KitMood = "happy" | "determined" | "worried" | "shocked" | "sad" | "smirk";
export type KitPose = "stand" | "walk" | "point" | "cheer";

const INK = C.ink;
const SKIN = "#f0c09a";
const SKIN_SHADE = "#d99d78";
const HAIR = "#3a2618";
const TEAL = "#19b5a8";
const SCARF = "#d93a2b";
const SCARF_DARK = "#a82618";
const BRASS = "#e2b23c";
const BRASS_DARK = "#a77b16";

const OUTFITS: Record<KitOutfit, { top: string; topDark: string; pants: string; boots: string; label: string }> = {
  pioneer: { top: "#5f7f96", topDark: "#45627a", pants: "#6b4e34", boots: "#3b2617", label: "Pioneer · 1850" },
  miner: { top: "#4a4f57", topDark: "#33373d", pants: "#3e3a35", boots: "#24201c", label: "Coal miner · 1925" },
  attendant: { top: "#e8e1cf", topDark: "#c9bfa5", pants: "#2f3e5c", boots: "#1e1e22", label: "Night shift · 1987" },
  recruit: { top: "#5d6b45", topDark: "#465233", pants: "#5d6b45", boots: "#1e1e1a", label: "Navy recruit · today" },
  plain: { top: "#4b6c8f", topDark: "#365272", pants: "#2e3440", boots: "#1e1e22", label: "Kit" },
};

const Brows: React.FC<{ mood: KitMood }> = ({ mood }) => {
  const d: Record<KitMood, [string, string]> = {
    happy: ["M138 132 Q 160 120 182 130", "M218 130 Q 240 120 262 132"],
    determined: ["M138 128 L 184 140", "M216 140 L 262 128"],
    worried: ["M140 136 L 182 124", "M218 124 L 260 136"],
    shocked: ["M138 116 Q 160 104 182 114", "M218 114 Q 240 104 262 116"],
    sad: ["M140 134 Q 162 124 182 126", "M218 126 Q 238 124 260 134"],
    smirk: ["M138 128 Q 160 120 182 130", "M218 122 Q 240 112 262 120"],
  };
  return (
    <g stroke={HAIR} strokeWidth={9} strokeLinecap="round" fill="none">
      <path d={d[mood][0]} />
      <path d={d[mood][1]} />
    </g>
  );
};

const Mouth: React.FC<{ mood: KitMood; talk: number }> = ({ mood, talk }) => {
  if (mood === "shocked") return <ellipse cx={200} cy={232} rx={16} ry={22} fill="#7a2a22" stroke={INK} strokeWidth={6} />;
  if (mood === "happy")
    return (
      <path d={`M170 222 Q 200 ${252 + talk * 8} 230 222 Z`} fill="#7a2a22" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    );
  if (mood === "sad") return <path d="M178 238 Q 200 224 222 238" stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />;
  if (mood === "worried") return <path d="M178 234 q 11 -8 22 0 t 22 0" stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />;
  if (mood === "smirk") return <path d="M180 232 Q 206 240 226 222" stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />;
  return <path d="M180 230 L 222 230" stroke={INK} strokeWidth={7} strokeLinecap="round" />;
};

const Eyes: React.FC<{ mood: KitMood; blink: number; look: number }> = ({ mood, blink, look }) => {
  const ry = (mood === "shocked" ? 30 : mood === "determined" ? 20 : 26) * (1 - blink * 0.92);
  const px = look * 6;
  return (
    <g>
      {[160, 240].map((cx) => (
        <g key={cx}>
          <ellipse cx={cx} cy={172} rx={22} ry={ry} fill="#fff" stroke={INK} strokeWidth={6} />
          {blink < 0.6 ? (
            <g>
              <circle cx={cx + px} cy={176} r={mood === "shocked" ? 9 : 12} fill={INK} />
              <circle cx={cx + px + 4} cy={170} r={4} fill="#fff" />
            </g>
          ) : null}
        </g>
      ))}
    </g>
  );
};

const Hat: React.FC<{ outfit: KitOutfit }> = ({ outfit }) => {
  if (outfit === "pioneer")
    return (
      <g stroke={INK} strokeWidth={6} strokeLinejoin="round">
        <ellipse cx={200} cy={92} rx={150} ry={26} fill="#8a6239" />
        <path d="M128 92 Q 130 26 200 22 Q 270 26 272 92 Z" fill="#9c7146" />
        <path d="M130 80 L 270 80" stroke={SCARF} strokeWidth={10} />
      </g>
    );
  if (outfit === "miner")
    return (
      <g stroke={INK} strokeWidth={6} strokeLinejoin="round">
        <path d="M104 104 Q 110 20 200 18 Q 290 20 296 104 Z" fill="#c9a23a" />
        <rect x={92} y={96} width={216} height={18} rx={9} fill="#a8851f" />
        <rect x={178} y={40} width={44} height={36} rx={8} fill="#5a5a5a" />
        <circle cx={200} cy={58} r={12} fill="#fff6c2" />
      </g>
    );
  if (outfit === "attendant")
    return (
      <g stroke={INK} strokeWidth={6} strokeLinejoin="round">
        <path d="M112 100 Q 120 36 200 34 Q 280 36 288 100 Z" fill="#c23b2a" />
        <path d="M200 100 L 320 112 Q 300 122 200 112 Z" fill="#a52f20" />
      </g>
    );
  if (outfit === "recruit")
    return (
      <g stroke={INK} strokeWidth={6} strokeLinejoin="round">
        <path d="M116 100 Q 124 50 200 46 Q 276 50 284 100 Z" fill="#f2f2ee" />
        <rect x={110} y={94} width={180} height={16} rx={8} fill="#e1e1dc" />
      </g>
    );
  return null;
};

/** Kit, drawn in a 400 x 720 box. Feet sit at y = 700. */
export const Kit: React.FC<{
  outfit?: KitOutfit;
  mood?: KitMood;
  pose?: KitPose;
  talking?: boolean;
  look?: number; // -1 left .. 1 right
  size?: number; // rendered height in px
  flip?: boolean;
}> = ({ outfit = "pioneer", mood = "happy", pose = "stand", talking = false, look = 0, size = 720, flip = false }) => {
  const frame = useCurrentFrame();
  const o = OUTFITS[outfit];
  // blink every ~3.3s for 4 frames
  const bf = frame % 100;
  const blink = bf < 2 ? bf / 2 : bf < 4 ? (4 - bf) / 2 : 0;
  const walking = pose === "walk";
  const stride = walking ? Math.sin(frame / 4) : 0;
  const bob = walking ? Math.abs(Math.cos(frame / 4)) * -8 : Math.sin(frame / 18) * 2;
  const talk = talking ? (Math.sin(frame / 2.2) + 1) / 2 : 0;
  const flap = Math.sin(frame / 5) * 8;
  const armL = pose === "cheer" ? -150 : pose === "point" ? -10 : walking ? -stride * 22 : 6;
  const armR = pose === "cheer" ? 150 : pose === "point" ? -80 : walking ? stride * 22 : -6;

  return (
    <svg width={(size * 400) / 720} height={size} viewBox="0 0 400 720" style={{ overflow: "visible", scale: flip ? "-1 1" : undefined }}>
      <ellipse cx={200} cy={706} rx={110} ry={14} fill="rgba(0,0,0,0.18)" />
      <g transform={`translate(0 ${bob})`}>
        {/* legs */}
        {[-1, 1].map((side) => (
          <g key={side} transform={`rotate(${side * stride * 18} 200 470)`}>
            <rect x={side < 0 ? 158 : 204} y={460} width={38} height={200} rx={16} fill={o.pants} stroke={INK} strokeWidth={6} />
            <path d={side < 0 ? "M150 650 L 200 650 L 202 690 L 132 690 Q 130 664 150 650 Z" : "M200 650 L 250 650 Q 272 664 270 690 L 198 690 Z"} fill={o.boots} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          </g>
        ))}
        {/* back arm */}
        <g transform={`rotate(${armL} 140 330)`}>
          <rect x={112} y={318} width={44} height={150} rx={22} fill={o.topDark} stroke={INK} strokeWidth={6} />
          <circle cx={134} cy={474} r={22} fill={SKIN} stroke={INK} strokeWidth={6} />
        </g>
        {/* torso */}
        <path d="M128 330 Q 128 300 200 296 Q 272 300 272 330 L 280 480 Q 200 500 120 480 Z" fill={o.top} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        {outfit === "attendant" ? <rect x={214} y={360} width={46} height={22} rx={4} fill="#fff" stroke={INK} strokeWidth={4} /> : null}
        {outfit === "miner" ? <path d="M150 330 L 160 480 M 250 330 L 240 480" stroke="#6b5a2b" strokeWidth={10} /> : null}
        {outfit === "pioneer" ? <path d="M200 330 L 200 476" stroke={o.topDark} strokeWidth={6} /> : null}
        <rect x={120} y={462} width={160} height={20} rx={6} fill="#3a2a1c" stroke={INK} strokeWidth={5} />
        {/* signature: brass pocket watch on a chain */}
        <path d="M210 470 Q 236 500 250 486" stroke={BRASS_DARK} strokeWidth={5} fill="none" />
        <circle cx={256} cy={494} r={18} fill={BRASS} stroke={INK} strokeWidth={5} />
        <circle cx={256} cy={494} r={10} fill="#fff6dc" />
        <path d={`M256 494 L ${256 + Math.sin(frame / 8) * 7} ${494 - Math.cos(frame / 8) * 7}`} stroke={INK} strokeWidth={3} />
        {/* front arm */}
        <g transform={`rotate(${armR} 260 330)`}>
          <rect x={244} y={318} width={44} height={150} rx={22} fill={o.top} stroke={INK} strokeWidth={6} />
          <circle cx={266} cy={474} r={22} fill={SKIN} stroke={INK} strokeWidth={6} />
        </g>
        {/* signature: red scarf with flapping tails */}
        <path d={`M232 300 Q ${282 + flap} ${330} ${300 + flap} ${376} L ${276 + flap} ${384} Q ${262 + flap / 2} 340 222 316 Z`} fill={SCARF_DARK} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <path d="M138 286 Q 200 316 262 286 L 266 312 Q 200 342 134 312 Z" fill={SCARF} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <circle cx={232} cy={306} r={14} fill={SCARF} stroke={INK} strokeWidth={5} />
        {/* head */}
        <g transform={`rotate(${walking ? stride * 2 : 0} 200 280)`}>
          <path d="M96 150 Q 92 70 200 64 Q 308 70 304 150 Q 312 210 286 214 L 114 214 Q 88 210 96 150 Z" fill={HAIR} stroke={INK} strokeWidth={6} />
          <circle cx={200} cy={176} r={104} fill={SKIN} stroke={INK} strokeWidth={7} />
          <ellipse cx={128} cy={212} rx={16} ry={10} fill="#f29a8a" opacity={0.6} />
          <ellipse cx={272} cy={212} rx={16} ry={10} fill="#f29a8a" opacity={0.6} />
          {[[136, 200], [146, 208], [126, 208], [264, 200], [254, 208], [274, 208]].map(([fx, fy]) => (
            <circle key={`${fx}-${fy}`} cx={fx} cy={fy} r={3} fill="#b87452" />
          ))}
          <circle cx={94} cy={182} r={18} fill={SKIN} stroke={INK} strokeWidth={6} />
          <circle cx={306} cy={182} r={18} fill={SKIN} stroke={INK} strokeWidth={6} />
          {/* fringe with the signature teal streak */}
          <path d="M100 150 Q 120 70 200 70 Q 286 70 302 140 Q 262 100 222 120 Q 186 92 150 124 Q 124 112 100 150 Z" fill={HAIR} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <path d="M206 96 Q 252 100 266 128 Q 262 146 246 156 Q 248 136 232 124 Q 220 132 206 128 Q 214 112 206 96 Z" fill={TEAL} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <path d="M198 190 Q 192 204 202 206" stroke={SKIN_SHADE} strokeWidth={6} fill="none" strokeLinecap="round" />
          <Eyes mood={mood} blink={blink} look={look} />
          <Brows mood={mood} />
          <Mouth mood={mood} talk={talk} />
          {mood === "worried" || mood === "shocked" ? <path d="M300 120 q 10 18 0 28 q -10 -10 0 -28 Z" fill="#8fd3f0" stroke={INK} strokeWidth={4} /> : null}
          <Hat outfit={outfit} />
        </g>
      </g>
    </svg>
  );
};

export const KIT_OUTFIT_LABELS = Object.fromEntries(Object.entries(OUTFITS).map(([k, v]) => [k, v.label])) as Record<KitOutfit, string>;
