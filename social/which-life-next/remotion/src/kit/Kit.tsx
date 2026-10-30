import React, { createContext, useContext } from "react";
import { useCurrentFrame } from "remotion";

/**
 * Kit — the "you" of every Which Life Next episode.
 *
 * Signature look (never change between episodes): young adult, short brown hair, dark charcoal
 * flat cap, worn brown wool coat with a turned-up collar, dark trousers, worn boots.
 * Era outfits may swap details (`outfit`) but must keep the cap, the brown coat colour and the
 * silhouette so viewers recognise Kit instantly.
 *
 * Drawn in SVG units with the feet at (0, 0); the figure is ~380 units tall at scale 1.
 */
export type KitPose = "back" | "side" | "front";
export type KitOutfit = "frontier" | "winter" | "miner" | "modern";

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
  /** Recolour the rig for other characters (teacher, neighbour, child). Kit never uses this. */
  colors?: Partial<KitColors>;
};

export const kitColors = {
  skin: "#e2b48f",
  skinShade: "#c8946e",
  hair: "#5a3b24",
  cap: "#34302c",
  capBand: "#24211e",
  coat: "#6b4a2e",
  coatShade: "#523822",
  coatLight: "#80593a",
  trousers: "#3b3a36",
  boots: "#2a211b",
  scarf: "#7d2f2a",
};


export type KitColors = typeof kitColors;
const KitColorCtx = createContext<KitColors>(kitColors);

const outfitCoat: Record<KitOutfit, string> = {
  frontier: kitColors.coat,
  winter: kitColors.coat,
  miner: "#5e432b",
  modern: "#6b4a2e",
};

const Lantern: React.FC<{ x: number; y: number; frame: number }> = ({ x, y, frame }) => {
  const flicker = 0.85 + 0.15 * Math.sin(frame * 0.7) * Math.sin(frame * 0.31);
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={90} fill="url(#kitLampGlow)" opacity={0.55 * flicker} />
      <path d="M -10 -34 Q 0 -48 10 -34" stroke="#2a211b" strokeWidth={3} fill="none" />
      <rect x={-11} y={-34} width={22} height={6} fill="#2a211b" />
      <rect x={-9} y={-28} width={18} height={26} rx={4} fill="#ffd98a" opacity={flicker} />
      <rect x={-9} y={-28} width={18} height={26} rx={4} fill="none" stroke="#2a211b" strokeWidth={3} />
      <rect x={-12} y={-3} width={24} height={6} fill="#2a211b" />
    </g>
  );
};

const CapBack: React.FC = () => {
  const k = useContext(KitColorCtx);
  return (
  <g>
    <ellipse cx={0} cy={-366} rx={44} ry={20} fill={k.cap} />
    <rect x={-42} y={-366} width={84} height={12} rx={5} fill={k.capBand} />
  </g>
  );
};

const BackPose: React.FC<{ coat: string; armSwing: number; lantern: boolean; frame: number; outfit: KitOutfit }> = ({ coat, armSwing, lantern, frame, outfit }) => {
  const k = useContext(KitColorCtx);
  return (
  <g>
    {/* legs + boots */}
    <rect x={-36} y={-178} width={30} height={160} rx={8} fill={k.trousers} />
    <rect x={6} y={-178} width={30} height={160} rx={8} fill={k.trousers} />
    <rect x={-40} y={-26} width={36} height={26} rx={8} fill={k.boots} />
    <rect x={4} y={-26} width={36} height={26} rx={8} fill={k.boots} />
    {/* arms (behind coat edge) */}
    <g transform={`rotate(${armSwing} -58 -286)`}>
      <rect x={-80} y={-292} width={30} height={142} rx={14} fill={k.coatShade} />
      <circle cx={-65} cy={-146} r={13} fill={k.skinShade} />
    </g>
    <g transform={`rotate(${-armSwing} 58 -286)`}>
      <rect x={50} y={-292} width={30} height={142} rx={14} fill={k.coatShade} />
      <circle cx={65} cy={-146} r={13} fill={k.skinShade} />
    </g>
    {/* coat */}
    <path d="M -60 -300 Q 0 -316 60 -300 L 72 -136 Q 0 -124 -72 -136 Z" fill={coat} />
    <path d="M 0 -300 L 0 -132" stroke={k.coatShade} strokeWidth={4} />
    <path d="M -72 -136 Q 0 -124 72 -136 L 70 -146 Q 0 -134 -70 -146 Z" fill={k.coatShade} />
    {outfit === "winter" && <path d="M -46 -306 Q 0 -324 46 -306 L 40 -290 Q 0 -300 -40 -290 Z" fill={k.scarf} />}
    {/* collar */}
    <path d="M -44 -306 Q 0 -322 44 -306 L 38 -284 Q 0 -294 -38 -284 Z" fill={k.coatLight} />
    {/* head from behind */}
    <rect x={-13} y={-318} width={26} height={18} fill={k.skinShade} />
    <circle cx={0} cy={-340} r={38} fill={k.hair} />
    <ellipse cx={-38} cy={-338} rx={7} ry={11} fill={k.skin} />
    <ellipse cx={38} cy={-338} rx={7} ry={11} fill={k.skin} />
    <CapBack />
    {lantern && <Lantern x={66} y={-120} frame={frame} />}
  </g>
  );
};

const SidePose: React.FC<{ coat: string; legSwing: number; armSwing: number; lantern: boolean; holdingRope: boolean; frame: number; outfit: KitOutfit }> = ({ coat, legSwing, armSwing, lantern, holdingRope, frame, outfit }) => {
  const k = useContext(KitColorCtx);
  return (
  <g>
    {/* far arm */}
    <g transform={`rotate(${holdingRope ? -70 : armSwing} 0 -286)`}>
      <rect x={-14} y={-292} width={28} height={140} rx={13} fill={k.coatShade} />
      <circle cx={0} cy={-148} r={12} fill={k.skinShade} />
    </g>
    {/* far leg */}
    <g transform={`rotate(${-legSwing} 0 -176)`}>
      <rect x={-15} y={-178} width={30} height={158} rx={9} fill="#2f2e2b" />
      <rect x={-17} y={-26} width={46} height={26} rx={8} fill={k.boots} />
    </g>
    {/* near leg */}
    <g transform={`rotate(${legSwing} 0 -176)`}>
      <rect x={-15} y={-178} width={30} height={158} rx={9} fill={k.trousers} />
      <rect x={-17} y={-26} width={46} height={26} rx={8} fill={k.boots} />
    </g>
    {/* coat, slight forward flare */}
    <path d="M -34 -300 Q 4 -312 36 -298 L 50 -138 Q 0 -126 -50 -140 Z" fill={coat} />
    <path d="M 30 -296 L 44 -140" stroke={k.coatShade} strokeWidth={4} />
    {outfit === "winter" && <path d="M -26 -306 Q 6 -318 34 -304 L 30 -288 Q 4 -296 -24 -288 Z" fill={k.scarf} />}
    <path d="M -28 -306 Q 6 -318 32 -302 L 26 -284 Q 2 -294 -24 -286 Z" fill={k.coatLight} />
    {/* head in profile */}
    <rect x={-10} y={-318} width={22} height={18} fill={k.skinShade} />
    <circle cx={2} cy={-340} r={36} fill={k.skin} />
    <path d="M 34 -346 Q 46 -336 34 -328 Z" fill={k.skin} />
    <circle cx={22} cy={-344} r={3.5} fill="#1d1914" />
    <path d="M 12 -320 Q 22 -316 30 -320" stroke={k.skinShade} strokeWidth={3} fill="none" />
    <path d="M -34 -322 Q -42 -360 -10 -372 Q 10 -376 20 -362 Q -6 -362 -14 -346 Q -18 -330 -24 -318 Z" fill={k.hair} />
    <ellipse cx={-4} cy={-336} rx={7} ry={11} fill={k.skinShade} />
    {/* flat cap with brim forward */}
    <path d="M -42 -352 Q -40 -382 0 -384 Q 34 -384 48 -362 L -42 -348 Z" fill={k.cap} />
    <path d="M -42 -352 L 46 -364 L 46 -358 L -42 -346 Z" fill={k.capBand} />
    <path d="M 40 -362 Q 54 -362 60 -356 Q 50 -353 40 -356 Z" fill={k.capBand} />
    {/* near arm */}
    <g transform={`rotate(${holdingRope ? -78 : -armSwing} 0 -286)`}>
      <rect x={-15} y={-292} width={30} height={142} rx={14} fill={coat} />
      <path d="M -15 -170 L 15 -170" stroke={k.coatShade} strokeWidth={6} />
      <circle cx={0} cy={-146} r={13} fill={k.skin} />
    </g>
    {lantern && !holdingRope && <Lantern x={0} y={-112} frame={frame} />}
  </g>
  );
};

const FrontPose: React.FC<{ coat: string; armSwing: number; lantern: boolean; frame: number; outfit: KitOutfit }> = ({ coat, armSwing, lantern, frame, outfit }) => {
  const k = useContext(KitColorCtx);
  const blink = frame % 110 >= 104;
  return (
    <g>
      <rect x={-36} y={-178} width={30} height={160} rx={8} fill={k.trousers} />
      <rect x={6} y={-178} width={30} height={160} rx={8} fill={k.trousers} />
      <rect x={-42} y={-26} width={38} height={26} rx={8} fill={k.boots} />
      <rect x={4} y={-26} width={38} height={26} rx={8} fill={k.boots} />
      <g transform={`rotate(${armSwing} -58 -286)`}>
        <rect x={-82} y={-292} width={30} height={142} rx={14} fill={k.coatShade} />
        <circle cx={-67} cy={-146} r={13} fill={k.skin} />
      </g>
      <g transform={`rotate(${-armSwing} 58 -286)`}>
        <rect x={52} y={-292} width={30} height={142} rx={14} fill={k.coatShade} />
        <circle cx={67} cy={-146} r={13} fill={k.skin} />
      </g>
      <path d="M -60 -300 Q 0 -314 60 -300 L 72 -136 Q 0 -124 -72 -136 Z" fill={coat} />
      <path d="M 0 -296 L 0 -134" stroke={k.coatShade} strokeWidth={3} />
      {[-262, -226, -190].map((y) => (
        <circle key={y} cx={10} cy={y} r={5} fill={k.coatShade} />
      ))}
      {outfit === "winter" && <path d="M -40 -304 Q 0 -290 40 -304 L 36 -284 Q 0 -272 -36 -284 Z" fill={k.scarf} />}
      <path d="M -46 -304 L -10 -250 L 0 -300 Z" fill={k.coatLight} />
      <path d="M 46 -304 L 10 -250 L 0 -300 Z" fill={k.coatLight} />
      <rect x={-13} y={-318} width={26} height={18} fill={k.skinShade} />
      <circle cx={0} cy={-340} r={38} fill={k.skin} />
      <path d="M -36 -350 Q -30 -380 0 -380 Q 30 -380 36 -350 Q 20 -360 0 -360 Q -20 -360 -36 -350 Z" fill={k.hair} />
      {blink ? (
        <>
          <path d="M -20 -340 L -8 -340" stroke="#1d1914" strokeWidth={3} />
          <path d="M 8 -340 L 20 -340" stroke="#1d1914" strokeWidth={3} />
        </>
      ) : (
        <>
          <circle cx={-14} cy={-340} r={4} fill="#1d1914" />
          <circle cx={14} cy={-340} r={4} fill="#1d1914" />
        </>
      )}
      <path d="M -22 -352 L -8 -354" stroke={k.hair} strokeWidth={4} strokeLinecap="round" />
      <path d="M 8 -354 L 22 -352" stroke={k.hair} strokeWidth={4} strokeLinecap="round" />
      <path d="M 0 -338 L -3 -326 L 3 -326" stroke={k.skinShade} strokeWidth={3} fill="none" />
      <path d="M -10 -316 Q 0 -312 10 -316" stroke="#8a5a44" strokeWidth={3} fill="none" strokeLinecap="round" />
      <ellipse cx={0} cy={-370} rx={46} ry={18} fill={k.cap} />
      <path d="M -40 -364 Q 0 -350 40 -364 L 44 -356 Q 0 -342 -44 -356 Z" fill={k.capBand} />
      {lantern && <Lantern x={68} y={-120} frame={frame} />}
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
      <ellipse cx={0} cy={4} rx={70} ry={10} fill="#000" opacity={0.18} />
      {pose === "back" && <BackPose coat={coat} armSwing={armSwing} lantern={lantern} frame={frame} outfit={outfit} />}
      {pose === "front" && <FrontPose coat={coat} armSwing={armSwing} lantern={lantern} frame={frame} outfit={outfit} />}
      {pose === "side" && (
        <g transform={`scale(${facing} 1)`}>
          <SidePose coat={coat} legSwing={legSwing} armSwing={armSwing} lantern={lantern} holdingRope={holdingRope} frame={frame} outfit={outfit} />
        </g>
      )}
    </g>
    </KitColorCtx.Provider>
  );
};
