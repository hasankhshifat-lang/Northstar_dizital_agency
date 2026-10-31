import React, { createContext, useContext } from "react";
import { useCurrentFrame } from "remotion";

/**
 * Kit v2 — the "you" of every Which Life Next episode (redesigned 2026-10-31).
 *
 * Signature look (never change between episodes):
 *  - charcoal newsboy flat cap with a top button, messy chestnut hair poking out
 *  - big hazel eyes with two highlights, freckles, rosy cheeks
 *  - RED NECKERCHIEF (the colour pop that makes Kit recognisable at thumbnail size)
 *  - worn brown wool coat: brass buttons, flap pockets, elbow patches, stitching
 *  - leather satchel on a strap across the chest, charcoal trousers with a knee patch, laced boots
 *  - ink outlines + two-tone cel shading
 * Era outfits (`outfit`) may swap details but keep cap, coat colour, neckerchief and silhouette.
 *
 * Drawn in SVG units with the feet at (0, 0); ~410 units tall at scale 1. Head centre ≈ (0, -338).
 */
export type KitPose = "back" | "side" | "front";
export type KitOutfit = "frontier" | "winter" | "miner" | "modern";
export type KitExpression = "neutral" | "happy" | "scared" | "determined" | "sad";

export type KitProps = {
  pose?: KitPose;
  walking?: boolean;
  /** Direction for the side pose: 1 = facing right, -1 = facing left. */
  facing?: 1 | -1;
  lantern?: boolean;
  /** Side pose only: one arm reaches forward along a rope/line. */
  holdingRope?: boolean;
  outfit?: KitOutfit;
  /** Lean into the wind, in degrees (storm scenes). */
  lean?: number;
  /** Face (front and side poses). "scared" for danger moments and thumbnails. */
  expression?: KitExpression;
  /** Recolour the rig for other characters (teacher, neighbour, child). Kit never uses this. */
  colors?: Partial<KitColors>;
};

export const kitColors = {
  ink: "#2b1d14",
  skin: "#eebf98",
  skinShade: "#d39a73",
  blush: "#e8846f",
  hair: "#7a4320",
  hairLight: "#a8622f",
  iris: "#6e5a2a",
  cap: "#3b3733",
  capShade: "#2a2724",
  capBand: "#24211e",
  coat: "#7a522f",
  coatShade: "#5a3b20",
  coatLight: "#94683d",
  patch: "#a07a4c",
  button: "#d6a640",
  trousers: "#3f3d39",
  trousersShade: "#2f2d2a",
  boots: "#3a2a1e",
  sole: "#1f1712",
  leather: "#8e5a2a",
  leatherShade: "#6c421d",
  scarf: "#c23b2c",
  scarfShade: "#8f2a20",
};

export type KitColors = typeof kitColors;
const KitColorCtx = createContext<KitColors>(kitColors);

const outfitCoat: Record<KitOutfit, string> = {
  frontier: kitColors.coat,
  winter: kitColors.coat,
  miner: "#64472c",
  modern: kitColors.coat,
};

const SW = 3.2; // ink outline width

const Lantern: React.FC<{ x: number; y: number; frame: number }> = ({ x, y, frame }) => {
  const flicker = 0.85 + 0.15 * Math.sin(frame * 0.7) * Math.sin(frame * 0.31);
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={95} fill="url(#kitLampGlow)" opacity={0.6 * flicker} />
      <path d="M -11 -36 Q 0 -52 11 -36" stroke="#2a211b" strokeWidth={3} fill="none" />
      <rect x={-13} y={-36} width={26} height={7} rx={2} fill="#3a3028" stroke="#1a140f" strokeWidth={2} />
      <rect x={-10} y={-29} width={20} height={27} rx={5} fill="#ffd98a" opacity={flicker} />
      <path d="M 0 -24 Q 5 -16 0 -9 Q -5 -16 0 -24 Z" fill="#ff9d3a" opacity={flicker} />
      <rect x={-10} y={-29} width={20} height={27} rx={5} fill="none" stroke="#1a140f" strokeWidth={3} />
      <rect x={-14} y={-3} width={28} height={7} rx={2} fill="#3a3028" stroke="#1a140f" strokeWidth={2} />
    </g>
  );
};

/* ---------------- shared parts ---------------- */

const Hand: React.FC<{ x: number; y: number; flip?: boolean; shade?: boolean }> = ({ x, y, flip, shade }) => {
  const k = useContext(KitColorCtx);
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
      <path d="M -11 -8 Q -14 10 -4 15 Q 8 18 12 6 Q 14 -4 9 -10 Z" fill={shade ? k.skinShade : k.skin} stroke={k.ink} strokeWidth={SW} />
      <path d="M 9 -4 Q 18 -2 16 6 Q 13 10 10 6" fill={shade ? k.skinShade : k.skin} stroke={k.ink} strokeWidth={SW * 0.8} />
    </g>
  );
};

const Sleeve: React.FC<{ x: number; rot: number; pivotX: number; coat: string; shade?: boolean; patch?: boolean }> = ({ x, rot, pivotX, coat, shade, patch }) => {
  const k = useContext(KitColorCtx);
  return (
    <g transform={`rotate(${rot} ${pivotX} -284)`}>
      <path d={`M ${x - 15} -292 Q ${x - 19} -220 ${x - 16} -160 L ${x + 16} -160 Q ${x + 19} -220 ${x + 15} -292 Z`} fill={shade ? k.coatShade : coat} stroke={k.ink} strokeWidth={SW} />
      {patch && <ellipse cx={x} cy={-212} rx={10} ry={14} fill={k.patch} stroke={k.ink} strokeWidth={2} strokeDasharray="3 3" />}
      <rect x={x - 17} y={-170} width={34} height={12} rx={4} fill={k.coatShade} stroke={k.ink} strokeWidth={SW * 0.8} />
      <Hand x={x} y={-146} flip={x < 0} shade={shade} />
    </g>
  );
};

const Legs: React.FC<{ back?: boolean }> = ({ back }) => {
  const k = useContext(KitColorCtx);
  return (
    <g>
      {[-1, 1].map((s) => (
        <g key={s}>
          <path d={`M ${s * 6} -176 L ${s * 34} -176 L ${s * 32} -28 L ${s * 8} -28 Z`} fill={s > 0 ? k.trousersShade : k.trousers} stroke={k.ink} strokeWidth={SW} />
          {!back && s > 0 && <rect x={10} y={-112} width={20} height={22} rx={3} fill="#57544d" stroke={k.ink} strokeWidth={2} strokeDasharray="3 2" />}
          {/* boot */}
          <path d={`M ${s * 4} -36 L ${s * 36} -36 Q ${s * 46} -18 ${s * 46} -6 L ${s * 2} -6 Z`} fill={k.boots} stroke={k.ink} strokeWidth={SW} />
          <rect x={s > 0 ? 2 : -46} y={-7} width={44} height={7} rx={2} fill={k.sole} />
          {!back && [0, 1, 2].map((i) => (
            <path key={i} d={`M ${s * 14} ${-31 + i * 7} l ${s * 12} 0`} stroke="#c9b48a" strokeWidth={2} />
          ))}
        </g>
      ))}
    </g>
  );
};

const CapFront: React.FC = () => {
  const k = useContext(KitColorCtx);
  return (
    <g>
      <path d="M -60 -362 Q -64 -410 0 -414 Q 64 -410 60 -362 Q 0 -350 -60 -362 Z" fill={k.cap} stroke={k.ink} strokeWidth={SW} />
      <path d="M 10 -412 Q 56 -404 58 -366 Q 30 -360 12 -360 Z" fill={k.capShade} opacity={0.7} />
      <path d="M 0 -414 L -36 -360 M 0 -414 L 0 -356 M 0 -414 L 36 -360" stroke={k.ink} strokeWidth={1.8} opacity={0.55} fill="none" />
      <path d="M -40 -400 Q -20 -410 0 -410" stroke="#5a554f" strokeWidth={4} fill="none" strokeLinecap="round" />
      <circle cx={0} cy={-414} r={5} fill={k.capShade} stroke={k.ink} strokeWidth={2} />
      <path d="M -54 -364 Q 0 -344 54 -364 Q 58 -352 48 -346 Q 0 -330 -48 -346 Q -58 -352 -54 -364 Z" fill={k.capBand} stroke={k.ink} strokeWidth={SW} />
    </g>
  );
};

const HairFront: React.FC = () => {
  const k = useContext(KitColorCtx);
  return (
    <g>
      {/* side locks */}
      <path d="M -52 -356 Q -60 -330 -50 -312 L -44 -330 Q -46 -344 -40 -354 Z" fill={k.hair} stroke={k.ink} strokeWidth={SW * 0.8} />
      <path d="M 52 -356 Q 60 -330 50 -312 L 44 -330 Q 46 -344 40 -354 Z" fill={k.hair} stroke={k.ink} strokeWidth={SW * 0.8} />
      {/* tufts at the temples, under the brim */}
      <path d="M -50 -352 L -44 -336 L -38 -350 L -32 -340 L -28 -354 Z" fill={k.hair} stroke={k.ink} strokeWidth={SW * 0.8} strokeLinejoin="round" />
      <path d="M 50 -352 L 44 -336 L 38 -350 L 32 -340 L 28 -354 Z" fill={k.hair} stroke={k.ink} strokeWidth={SW * 0.8} strokeLinejoin="round" />
    </g>
  );
};

const Eye: React.FC<{ x: number; y: number; expr: KitExpression; blink: boolean; look?: number }> = ({ x, y, expr, blink, look = 0 }) => {
  const k = useContext(KitColorCtx);
  if (blink) return <path d={`M ${x - 10} ${y} Q ${x} ${y + 6} ${x + 10} ${y}`} stroke={k.ink} strokeWidth={3.5} fill="none" strokeLinecap="round" />;
  const scared = expr === "scared";
  const ry = scared ? 15 : expr === "happy" ? 11 : 13.5;
  const rx = scared ? 12.5 : 11;
  const iris = scared ? 5 : 8;
  return (
    <g>
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#fffaf2" stroke={k.ink} strokeWidth={2.6} />
      <circle cx={x + look} cy={y + (scared ? 0 : 1)} r={iris} fill={k.iris} />
      <circle cx={x + look} cy={y + (scared ? 0 : 1)} r={iris * 0.5} fill="#120c08" />
      <circle cx={x + look + iris * 0.35} cy={y - iris * 0.45} r={scared ? 1.8 : 2.8} fill="#fff" />
      <circle cx={x + look - iris * 0.4} cy={y + iris * 0.35} r={1.2} fill="#fff" opacity={0.85} />
      {expr === "happy" && <path d={`M ${x - 13} ${y + 8} Q ${x} ${y + 2} ${x + 13} ${y + 8}`} fill={k.skin} stroke="none" />}
      {expr === "determined" && <path d={`M ${x - 13} ${y - 14} L ${x + 13} ${y - 14} L ${x + 13} ${y - 6} Q ${x} ${y - 9} ${x - 13} ${y - 6} Z`} fill={k.skin} />}
    </g>
  );
};

const brows: Record<KitExpression, [string, string]> = {
  neutral: ["M -30 -360 Q -19 -366 -7 -361", "M 7 -361 Q 19 -366 30 -360"],
  happy: ["M -30 -361 Q -19 -369 -7 -363", "M 7 -363 Q 19 -369 30 -361"],
  scared: ["M -31 -362 Q -21 -372 -8 -370", "M 8 -370 Q 21 -372 31 -362"],
  determined: ["M -31 -366 Q -19 -362 -6 -356", "M 6 -356 Q 19 -362 31 -366"],
  sad: ["M -30 -357 Q -20 -362 -8 -368", "M 8 -368 Q 20 -362 30 -357"],
};

const Mouth: React.FC<{ expr: KitExpression; x?: number; y?: number }> = ({ expr, x = 0, y = -311 }) => {
  const k = useContext(KitColorCtx);
  switch (expr) {
    case "happy":
      return (
        <g>
          <path d={`M ${x - 15} ${y - 4} Q ${x} ${y + 16} ${x + 15} ${y - 4} Z`} fill="#5a1f17" stroke={k.ink} strokeWidth={2.6} strokeLinejoin="round" />
          <path d={`M ${x - 11} ${y - 2} L ${x + 11} ${y - 2} L ${x + 9} ${y + 2} L ${x - 9} ${y + 2} Z`} fill="#fff" />
          <path d={`M ${x - 6} ${y + 7} Q ${x} ${y + 3} ${x + 6} ${y + 7}`} fill="#d9605a" />
        </g>
      );
    case "scared":
      return (
        <g>
          <ellipse cx={x} cy={y + 2} rx={9} ry={12} fill="#4a1a14" stroke={k.ink} strokeWidth={2.6} />
          <path d={`M ${x - 6} ${y - 6} L ${x + 6} ${y - 6}`} stroke="#fff" strokeWidth={3} strokeLinecap="round" />
          <ellipse cx={x} cy={y + 9} rx={5} ry={3} fill="#d9605a" />
        </g>
      );
    case "determined":
      return <path d={`M ${x - 11} ${y} Q ${x} ${y - 3} ${x + 11} ${y + 1}`} stroke={k.ink} strokeWidth={3.2} fill="none" strokeLinecap="round" />;
    case "sad":
      return <path d={`M ${x - 10} ${y + 3} Q ${x} ${y - 6} ${x + 10} ${y + 3}`} stroke={k.ink} strokeWidth={3.2} fill="none" strokeLinecap="round" />;
    default:
      return <path d={`M ${x - 11} ${y - 2} Q ${x} ${y + 7} ${x + 11} ${y - 2}`} stroke={k.ink} strokeWidth={3.2} fill="none" strokeLinecap="round" />;
  }
};

const Neckerchief: React.FC<{ winter: boolean }> = ({ winter }) => {
  const k = useContext(KitColorCtx);
  if (winter)
    return (
      <g>
        <path d="M -40 -300 Q 0 -284 40 -300 L 42 -278 Q 0 -262 -42 -278 Z" fill={k.scarf} stroke={k.ink} strokeWidth={SW} />
        {[-28, -14, 0, 14, 28].map((sx) => <path key={sx} d={`M ${sx} -294 l 0 22`} stroke={k.scarfShade} strokeWidth={3} />)}
        <path d="M 18 -280 L 30 -210 L 50 -214 L 36 -282 Z" fill={k.scarf} stroke={k.ink} strokeWidth={SW} />
        <path d="M 30 -214 l 2 10 M 38 -215 l 2 10 M 46 -216 l 2 10" stroke={k.scarf} strokeWidth={3} />
      </g>
    );
  return (
    <g>
      <path d="M -28 -298 Q 0 -286 28 -298 L 0 -258 Z" fill={k.scarf} stroke={k.ink} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M 0 -258 L 14 -290 L 28 -298 Z" fill={k.scarfShade} />
      <ellipse cx={0} cy={-292} rx={9} ry={7} fill={k.scarf} stroke={k.ink} strokeWidth={2.4} />
      <circle cx={-12} cy={-284} r={2} fill="#f3d9c8" opacity={0.8} />
      <circle cx={8} cy={-276} r={2} fill="#f3d9c8" opacity={0.8} />
    </g>
  );
};

/* ---------------- poses ---------------- */

const FrontPose: React.FC<{ coat: string; armSwing: number; lantern: boolean; frame: number; outfit: KitOutfit; expression: KitExpression }> = ({ coat, armSwing, lantern, frame, outfit, expression }) => {
  const k = useContext(KitColorCtx);
  const blink = expression !== "scared" && frame % 110 >= 105;
  return (
    <g>
      <Legs />
      <Sleeve x={-66} pivotX={-56} rot={armSwing} coat={coat} shade patch />
      <Sleeve x={66} pivotX={56} rot={-armSwing} coat={coat} shade patch />
      {/* coat */}
      <path d="M -58 -298 Q 0 -310 58 -298 L 72 -126 Q 0 -112 -72 -126 Z" fill={coat} stroke={k.ink} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M 6 -302 Q 34 -304 58 -298 L 72 -126 Q 40 -118 6 -116 Z" fill={k.coatShade} opacity={0.45} />
      <path d="M -4 -296 L -4 -116" stroke={k.ink} strokeWidth={2.4} />
      <path d="M -66 -136 Q 0 -124 66 -136" stroke={k.coatShade} strokeWidth={2} strokeDasharray="5 4" fill="none" />
      {[-262, -226, -190, -154].map((y) => (
        <g key={y}>
          <circle cx={-14} cy={y} r={5} fill={k.button} stroke={k.ink} strokeWidth={2} />
          <circle cx={-15.5} cy={y - 1.5} r={1.5} fill="#fff3c4" />
        </g>
      ))}
      {/* pockets */}
      {[-46, 26].map((px) => (
        <g key={px}>
          <rect x={px} y={-182} width={26} height={26} rx={3} fill={coat} stroke={k.ink} strokeWidth={2.4} />
          <path d={`M ${px - 2} -184 L ${px + 28} -184 L ${px + 26} -172 L ${px} -172 Z`} fill={k.coatLight} stroke={k.ink} strokeWidth={2.4} />
        </g>
      ))}
      {/* lapels */}
      <path d="M -40 -302 L -6 -244 L -4 -296 Z" fill={k.coatLight} stroke={k.ink} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M 40 -302 L 6 -244 L 4 -296 Z" fill={k.coatLight} stroke={k.ink} strokeWidth={SW} strokeLinejoin="round" />
      {/* satchel strap + bag */}
      <path d="M -44 -298 L 58 -168" stroke={k.ink} strokeWidth={13} strokeLinecap="round" />
      <path d="M -44 -298 L 58 -168" stroke={k.leather} strokeWidth={8} strokeLinecap="round" />
      <rect x={-6} y={-246} width={10} height={10} rx={2} fill="none" stroke={k.button} strokeWidth={2.5} />
      <g>
        <rect x={40} y={-176} width={46} height={40} rx={7} fill={k.leather} stroke={k.ink} strokeWidth={SW} />
        <path d="M 40 -176 L 86 -176 L 86 -156 Q 63 -148 40 -156 Z" fill={k.leatherShade} stroke={k.ink} strokeWidth={2.4} />
        <rect x={59} y={-158} width={8} height={9} rx={1.5} fill={k.button} stroke={k.ink} strokeWidth={1.6} />
      </g>
      {/* neck */}
      <path d="M -14 -314 L 14 -314 L 14 -294 L -14 -294 Z" fill={k.skinShade} stroke={k.ink} strokeWidth={SW * 0.8} />
      <Neckerchief winter={outfit === "winter"} />
      {/* head */}
      <ellipse cx={-50} cy={-334} rx={8} ry={12} fill={k.skin} stroke={k.ink} strokeWidth={SW * 0.8} />
      <ellipse cx={50} cy={-334} rx={8} ry={12} fill={k.skin} stroke={k.ink} strokeWidth={SW * 0.8} />
      <path d="M -50 -350 Q -52 -300 -26 -292 Q 0 -284 26 -292 Q 52 -300 50 -350 Q 48 -380 0 -382 Q -48 -380 -50 -350 Z" fill={k.skin} stroke={k.ink} strokeWidth={SW} />
      <path d="M 30 -372 Q 50 -360 48 -330 Q 44 -302 26 -294 Q 40 -320 30 -372 Z" fill={k.skinShade} opacity={0.35} />
      <HairFront />
      {/* cheeks + freckles */}
      <ellipse cx={-30} cy={-310} rx={9} ry={5.5} fill={k.blush} opacity={expression === "scared" ? 0.15 : 0.4} />
      <ellipse cx={30} cy={-310} rx={9} ry={5.5} fill={k.blush} opacity={expression === "scared" ? 0.15 : 0.4} />
      {[[-34, -314], [-28, -310], [-36, -307], [34, -314], [28, -310], [36, -307]].map(([fx, fy], i) => (
        <circle key={i} cx={fx} cy={fy} r={1.6} fill="#a8653f" />
      ))}
      <Eye x={-19} y={-328} expr={expression} blink={blink} />
      <Eye x={19} y={-328} expr={expression} blink={blink} />
      <path d="M -3 -320 Q 6 -312 -1 -307" stroke={k.skinShade} strokeWidth={3.2} fill="none" strokeLinecap="round" />
      <Mouth expr={expression} y={-301} />
      {expression === "scared" && (
        <path d="M 44 -352 Q 52 -338 47 -330 Q 39 -332 44 -352 Z" fill="#d6efff" stroke="#6aa3c4" strokeWidth={1.6} />
      )}
      {expression === "sad" && <path d="M -26 -316 Q -28 -306 -24 -302" stroke="#9fd2f0" strokeWidth={3} fill="none" />}
      <g transform="translate(0 -14)"><CapFront /></g>
      {/* brows drawn over the brim, cartoon style */}
      <g transform="translate(0 14)">
        <path d={brows[expression][0]} stroke={k.ink} strokeWidth={8} strokeLinecap="round" fill="none" />
        <path d={brows[expression][1]} stroke={k.ink} strokeWidth={8} strokeLinecap="round" fill="none" />
        <path d={brows[expression][0]} stroke={k.hair} strokeWidth={5} strokeLinecap="round" fill="none" />
        <path d={brows[expression][1]} stroke={k.hair} strokeWidth={5} strokeLinecap="round" fill="none" />
      </g>
      {lantern && <Lantern x={70} y={-118} frame={frame} />}
    </g>
  );
};

const SidePose: React.FC<{ coat: string; legSwing: number; armSwing: number; lantern: boolean; holdingRope: boolean; frame: number; outfit: KitOutfit; expression: KitExpression }> = ({ coat, legSwing, armSwing, lantern, holdingRope, frame, outfit, expression }) => {
  const k = useContext(KitColorCtx);
  const blink = expression !== "scared" && frame % 110 >= 105;
  const scared = expression === "scared";
  const Leg: React.FC<{ rot: number; far?: boolean }> = ({ rot, far }) => (
    <g transform={`rotate(${rot} 0 -174)`}>
      <path d="M -15 -178 L 15 -178 L 14 -30 L -14 -30 Z" fill={far ? k.trousersShade : k.trousers} stroke={k.ink} strokeWidth={SW} />
      <path d="M -18 -38 L 16 -38 Q 40 -24 42 -8 L -18 -8 Z" fill={k.boots} stroke={k.ink} strokeWidth={SW} />
      <rect x={-19} y={-9} width={62} height={8} rx={2} fill={k.sole} />
      {!far && [0, 1].map((i) => <path key={i} d={`M 6 ${-32 + i * 8} l 12 3`} stroke="#c9b48a" strokeWidth={2} />)}
    </g>
  );
  return (
    <g>
      {/* far arm */}
      <g transform={`rotate(${holdingRope ? -70 : armSwing} 0 -284)`}>
        <path d="M -14 -292 Q -17 -220 -14 -160 L 14 -160 Q 17 -220 14 -292 Z" fill={k.coatShade} stroke={k.ink} strokeWidth={SW} />
        <Hand x={2} y={-146} shade />
      </g>
      <Leg rot={-legSwing} far />
      <Leg rot={legSwing} />
      {/* satchel at the back hip, behind the coat edge */}
      <rect x={-62} y={-186} width={34} height={40} rx={6} fill={k.leather} stroke={k.ink} strokeWidth={SW} />
      <path d="M -62 -186 L -28 -186 L -28 -166 Q -45 -160 -62 -166 Z" fill={k.leatherShade} stroke={k.ink} strokeWidth={2.2} />
      {/* coat */}
      <path d="M -36 -300 Q 6 -312 36 -298 L 52 -126 Q 0 -114 -50 -128 Z" fill={coat} stroke={k.ink} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M -36 -300 Q -20 -304 -10 -304 L -16 -120 Q -36 -122 -50 -128 Z" fill={k.coatShade} opacity={0.45} />
      <path d="M 30 -296 L 46 -128" stroke={k.ink} strokeWidth={2.4} />
      {[-262, -226, -190, -154].map((y, i) => <circle key={y} cx={36 + i * 2.6} cy={y} r={4.5} fill={k.button} stroke={k.ink} strokeWidth={2} />)}
      <path d="M -2 -184 L 26 -186 L 27 -174 L -1 -172 Z" fill={k.coatLight} stroke={k.ink} strokeWidth={2.2} />
      <path d="M -46 -140 Q 0 -128 48 -138" stroke={k.coatShade} strokeWidth={2} strokeDasharray="5 4" fill="none" />
      {/* strap across the chest */}
      <path d="M 26 -296 L -40 -186" stroke={k.ink} strokeWidth={12} strokeLinecap="round" />
      <path d="M 26 -296 L -40 -186" stroke={k.leather} strokeWidth={7} strokeLinecap="round" />
      {/* collar */}
      <path d="M -30 -306 Q 6 -318 34 -302 L 28 -282 Q 4 -294 -26 -286 Z" fill={k.coatLight} stroke={k.ink} strokeWidth={SW} />
      {/* neck + neckerchief */}
      <path d="M -6 -316 L 20 -316 L 20 -296 L -6 -296 Z" fill={k.skinShade} stroke={k.ink} strokeWidth={SW * 0.8} />
      {outfit === "winter" ? (
        <path d="M -28 -304 Q 6 -290 36 -304 L 38 -282 Q 6 -268 -30 -282 Z" fill={k.scarf} stroke={k.ink} strokeWidth={SW} />
      ) : (
        <g>
          <path d="M -8 -300 Q 12 -292 30 -300 L 34 -288 Q 12 -280 -8 -288 Z" fill={k.scarf} stroke={k.ink} strokeWidth={SW * 0.9} />
          <path d="M 28 -294 L 46 -268 L 34 -266 Z" fill={k.scarf} stroke={k.ink} strokeWidth={SW * 0.9} strokeLinejoin="round" />
        </g>
      )}
      {/* head in profile, facing +x */}
      <path d="M -40 -340 Q -42 -386 2 -386 Q 44 -386 48 -350 Q 50 -340 58 -332 Q 54 -324 48 -322 Q 48 -296 20 -292 Q -14 -290 -32 -310 Q -42 -322 -40 -340 Z" fill={k.skin} stroke={k.ink} strokeWidth={SW} strokeLinejoin="round" />
      <ellipse cx={-6} cy={-334} rx={9} ry={12} fill={k.skin} stroke={k.ink} strokeWidth={SW * 0.8} />
      <path d="M -8 -338 Q -2 -334 -8 -328" stroke={k.skinShade} strokeWidth={2.4} fill="none" />
      {/* hair at the back + fringe */}
      <path d="M -42 -350 Q -50 -320 -36 -300 L -28 -322 Q -24 -340 -18 -356 Z" fill={k.hair} stroke={k.ink} strokeWidth={SW * 0.8} />
      <path d="M 6 -360 L 14 -344 L 20 -358 L 28 -344 L 34 -360 Z" fill={k.hair} stroke={k.ink} strokeWidth={SW * 0.8} strokeLinejoin="round" />
      <ellipse cx={30} cy={-318} rx={8} ry={5} fill={k.blush} opacity={scared ? 0.15 : 0.4} />
      {[[24, -322], [30, -317], [34, -323]].map(([fx, fy], i) => <circle key={i} cx={fx} cy={fy} r={1.5} fill="#a8653f" />)}
      <Eye x={32} y={-334} expr={expression} blink={blink} look={2} />
      <g transform="translate(36 0)">
        {scared ? <ellipse cx={4} cy={-308} rx={6} ry={8} fill="#4a1a14" stroke={k.ink} strokeWidth={2.2} />
          : expression === "happy" ? <path d="M -6 -314 Q 6 -300 14 -314 Z" fill="#5a1f17" stroke={k.ink} strokeWidth={2.2} />
          : <path d={expression === "sad" ? "M -4 -306 Q 4 -312 12 -306" : "M -4 -312 Q 5 -306 12 -312"} stroke={k.ink} strokeWidth={3} fill="none" strokeLinecap="round" />}
      </g>
      {scared && <path d="M -14 -376 Q -8 -362 -12 -356 Q -20 -358 -14 -376 Z" fill="#d6efff" stroke="#6aa3c4" strokeWidth={1.6} />}
      {/* flat cap, brim forward (raised so the eye stays clear) */}
      <g transform="translate(0 -10)">
        <path d="M -46 -354 Q -50 -404 4 -406 Q 50 -404 56 -364 L -44 -348 Z" fill={k.cap} stroke={k.ink} strokeWidth={SW} strokeLinejoin="round" />
        <path d="M -40 -396 Q -10 -408 20 -402" stroke="#5a554f" strokeWidth={4} fill="none" strokeLinecap="round" />
        <circle cx={4} cy={-406} r={4.5} fill={k.capShade} stroke={k.ink} strokeWidth={2} />
        <path d="M -44 -350 L 54 -366 L 56 -356 L -44 -342 Z" fill={k.capBand} stroke={k.ink} strokeWidth={2.4} />
        <path d="M 46 -366 Q 70 -366 76 -356 Q 66 -350 46 -354 Z" fill={k.capBand} stroke={k.ink} strokeWidth={2.4} />
      </g>
      {/* brow over the brim */}
      <g transform="translate(0 8)">
        <path d={expression === "determined" ? "M 20 -360 Q 32 -356 44 -350" : scared || expression === "sad" ? "M 20 -362 Q 32 -370 44 -364" : "M 20 -360 Q 32 -366 44 -360"} stroke={k.ink} strokeWidth={8} strokeLinecap="round" fill="none" />
        <path d={expression === "determined" ? "M 20 -360 Q 32 -356 44 -350" : scared || expression === "sad" ? "M 20 -362 Q 32 -370 44 -364" : "M 20 -360 Q 32 -366 44 -360"} stroke={k.hair} strokeWidth={5} strokeLinecap="round" fill="none" />
      </g>
      {/* near arm */}
      <g transform={`rotate(${holdingRope ? -78 : -armSwing} 0 -284)`}>
        <path d="M -15 -292 Q -18 -220 -15 -160 L 15 -160 Q 18 -220 15 -292 Z" fill={coat} stroke={k.ink} strokeWidth={SW} />
        <ellipse cx={0} cy={-214} rx={9} ry={13} fill={k.patch} stroke={k.ink} strokeWidth={2} strokeDasharray="3 3" />
        <rect x={-17} y={-172} width={34} height={12} rx={4} fill={k.coatShade} stroke={k.ink} strokeWidth={SW * 0.8} />
        <Hand x={2} y={-146} />
      </g>
      {lantern && !holdingRope && <Lantern x={0} y={-112} frame={frame} />}
    </g>
  );
};

const BackPose: React.FC<{ coat: string; armSwing: number; lantern: boolean; frame: number; outfit: KitOutfit }> = ({ coat, armSwing, lantern, frame, outfit }) => {
  const k = useContext(KitColorCtx);
  return (
    <g>
      <Legs back />
      <Sleeve x={-66} pivotX={-56} rot={armSwing} coat={coat} shade patch />
      <Sleeve x={66} pivotX={56} rot={-armSwing} coat={coat} shade patch />
      {/* coat back: centre seam, vent, half-belt */}
      <path d="M -58 -300 Q 0 -314 58 -300 L 72 -126 Q 0 -112 -72 -126 Z" fill={coat} stroke={k.ink} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M -58 -300 Q -30 -306 -6 -308 L -6 -114 Q -40 -118 -72 -126 Z" fill={k.coatShade} opacity={0.4} />
      <path d="M 0 -306 L 0 -170 M 0 -170 L -6 -116 M 0 -170 L 6 -116" stroke={k.ink} strokeWidth={2.4} fill="none" />
      <rect x={-42} y={-210} width={84} height={14} rx={3} fill={k.coatLight} stroke={k.ink} strokeWidth={2.4} />
      <circle cx={-34} cy={-203} r={4} fill={k.button} stroke={k.ink} strokeWidth={1.6} />
      <circle cx={34} cy={-203} r={4} fill={k.button} stroke={k.ink} strokeWidth={1.6} />
      <path d="M -66 -136 Q 0 -124 66 -136" stroke={k.coatShade} strokeWidth={2} strokeDasharray="5 4" fill="none" />
      {/* strap across the back + satchel on the left hip */}
      <path d="M 44 -298 L -58 -168" stroke={k.ink} strokeWidth={13} strokeLinecap="round" />
      <path d="M 44 -298 L -58 -168" stroke={k.leather} strokeWidth={8} strokeLinecap="round" />
      <rect x={-88} y={-176} width={46} height={40} rx={7} fill={k.leather} stroke={k.ink} strokeWidth={SW} />
      <path d="M -88 -176 L -42 -176 L -42 -158 Q -65 -152 -88 -158 Z" fill={k.leatherShade} stroke={k.ink} strokeWidth={2.2} />
      {/* collar + scarf */}
      <path d="M -46 -306 Q 0 -324 46 -306 L 40 -282 Q 0 -296 -40 -282 Z" fill={k.coatLight} stroke={k.ink} strokeWidth={SW} />
      {outfit === "winter" ? (
        <g>
          <path d="M -42 -316 Q 0 -332 42 -316 L 40 -298 Q 0 -312 -40 -298 Z" fill={k.scarf} stroke={k.ink} strokeWidth={SW} />
          <path d="M 14 -304 L 22 -236 L 40 -238 L 32 -306 Z" fill={k.scarf} stroke={k.ink} strokeWidth={SW} />
        </g>
      ) : (
        <path d="M -30 -312 Q 0 -322 30 -312 L 26 -302 Q 0 -310 -26 -302 Z" fill={k.scarf} stroke={k.ink} strokeWidth={SW * 0.9} />
      )}
      {/* head from behind: hair, ears, cap */}
      <path d="M -14 -320 L 14 -320 L 14 -304 L -14 -304 Z" fill={k.skinShade} stroke={k.ink} strokeWidth={SW * 0.8} />
      <ellipse cx={-50} cy={-336} rx={8} ry={12} fill={k.skinShade} stroke={k.ink} strokeWidth={SW * 0.8} />
      <ellipse cx={50} cy={-336} rx={8} ry={12} fill={k.skinShade} stroke={k.ink} strokeWidth={SW * 0.8} />
      <path d="M -50 -350 Q -50 -306 -24 -312 L -16 -302 L -8 -314 L 0 -300 L 8 -314 L 16 -302 L 24 -312 Q 50 -306 50 -350 Q 48 -382 0 -384 Q -48 -382 -50 -350 Z" fill={k.hair} stroke={k.ink} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M -30 -340 Q -24 -326 -28 -316 M 20 -342 Q 26 -330 22 -318" stroke={k.hairLight} strokeWidth={3} fill="none" strokeLinecap="round" />
      <path d="M -60 -360 Q -64 -408 0 -412 Q 64 -408 60 -360 Q 0 -348 -60 -360 Z" fill={k.cap} stroke={k.ink} strokeWidth={SW} />
      <path d="M -40 -398 Q -20 -408 0 -408" stroke="#5a554f" strokeWidth={4} fill="none" strokeLinecap="round" />
      <circle cx={0} cy={-412} r={5} fill={k.capShade} stroke={k.ink} strokeWidth={2} />
      <path d="M -58 -364 Q 0 -350 58 -364 L 56 -354 Q 0 -342 -56 -354 Z" fill={k.capBand} stroke={k.ink} strokeWidth={2.4} />
      {lantern && <Lantern x={70} y={-118} frame={frame} />}
    </g>
  );
};

export const Kit: React.FC<KitProps> = ({
  pose = "back",
  walking = false,
  facing = 1,
  lantern = false,
  holdingRope = false,
  outfit = "frontier",
  lean = 0,
  expression = "neutral",
  colors,
}) => {
  const frame = useCurrentFrame();
  const phase = frame * 0.22;
  const legSwing = walking ? Math.sin(phase) * 24 : 0;
  const armSwing = walking ? Math.sin(phase) * 14 : Math.sin(frame * 0.05) * 1.5;
  const bob = walking ? Math.abs(Math.cos(phase)) * -6 : Math.sin(frame * 0.06) * -1.5;
  const k: KitColors = { ...kitColors, ...colors };
  const coat = colors?.coat ?? outfitCoat[outfit];
  return (
    <KitColorCtx.Provider value={k}>
      <g transform={`translate(0 ${bob}) rotate(${lean} 0 0)`}>
        <defs>
          <radialGradient id="kitLampGlow">
            <stop offset="0%" stopColor="#ffd98a" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#ffd98a" stopOpacity={0} />
          </radialGradient>
        </defs>
        <ellipse cx={0} cy={4} rx={74} ry={11} fill="#000" opacity={0.2} />
        {pose === "back" && <BackPose coat={coat} armSwing={armSwing} lantern={lantern} frame={frame} outfit={outfit} />}
        {pose === "front" && <FrontPose coat={coat} armSwing={armSwing} lantern={lantern} frame={frame} outfit={outfit} expression={expression} />}
        {pose === "side" && (
          <g transform={`scale(${facing} 1)`}>
            <SidePose coat={coat} legSwing={legSwing} armSwing={armSwing} lantern={lantern} holdingRope={holdingRope} frame={frame} outfit={outfit} expression={expression} />
          </g>
        )}
      </g>
    </KitColorCtx.Provider>
  );
};
