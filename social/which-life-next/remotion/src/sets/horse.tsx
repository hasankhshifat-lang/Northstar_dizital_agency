import React from "react";
import { Kit } from "../kit/Kit";

const INK = "#2b1d14";

/**
 * Cartoon horse in our ink-outline style. Origin = ground under the middle of the horse.
 * Faces LEFT (head at -x); pass facing={-1} to face right. `phase` drives the gallop (radians, e.g. frame * 0.9).
 */
export const Horse: React.FC<{ phase?: number; galloping?: boolean; color?: string; facing?: 1 | -1; rider?: boolean; mailbag?: boolean; riderExpression?: "neutral" | "happy" | "scared" | "determined" | "sad" }> = ({
  phase = 0, galloping = true, color = "#8a5a32", facing = 1, rider = true, mailbag = true, riderExpression = "determined",
}) => {
  const g = galloping ? 1 : 0;
  const s = Math.sin(phase), c = Math.cos(phase);
  const bob = g * Math.abs(Math.sin(phase)) * -10;
  const pitch = g * s * 4;
  const dark = shade(color, -0.28);
  // legs: [hipX, hipY, swing amplitude, phase offset]
  const legs: [number, number, number][] = [[-62, -88, 0], [-44, -88, 1.2], [58, -92, 2.6], [76, -92, 3.6]];
  const leg = (hx: number, hy: number, off: number, back: boolean, i: number) => {
    const a = g * Math.sin(phase + off) * 38;
    const knee = g * Math.max(0, Math.sin(phase + off + 1)) * 40;
    return (
      <g key={i} transform={`translate(${hx} ${hy}) rotate(${a})`}>
        <path d="M -9 0 L 9 0 L 7 44 L -7 44 Z" fill={back ? dark : color} stroke={INK} strokeWidth={4} />
        <g transform={`translate(0 44) rotate(${back ? knee : -knee})`}>
          <path d="M -7 0 L 7 0 L 6 40 L -6 40 Z" fill={back ? dark : color} stroke={INK} strokeWidth={4} />
          <rect x={-9} y={38} width={18} height={10} rx={3} fill="#2a2420" />
        </g>
      </g>
    );
  };
  return (
    <g transform={`scale(${facing} 1)`}>
      <g transform={`translate(0 ${bob}) rotate(${pitch} 0 -110)`}>
        {/* far legs */}
        {leg(legs[1][0], legs[1][1], legs[1][2], true, 1)}
        {leg(legs[3][0], legs[3][1], legs[3][2], true, 3)}
        {/* tail */}
        <path d={`M 92 -130 Q ${140 + g * c * 10} ${-120 + g * s * 12} ${150 + g * c * 16} ${-70 + g * s * 8}`} stroke={INK} strokeWidth={22} fill="none" strokeLinecap="round" />
        <path d={`M 92 -130 Q ${140 + g * c * 10} ${-120 + g * s * 12} ${150 + g * c * 16} ${-70 + g * s * 8}`} stroke="#3a2618" strokeWidth={14} fill="none" strokeLinecap="round" />
        {/* rider sits behind the body so the legs are hidden */}
        {rider && (
          <g transform="translate(6 -112) scale(0.5)">
            <g transform="rotate(-14)">
              <Kit pose="side" facing={-1} expression={riderExpression} />
            </g>
          </g>
        )}
        {/* body */}
        <ellipse cx={8} cy={-112} rx={100} ry={46} fill={color} stroke={INK} strokeWidth={5} />
        <ellipse cx={0} cy={-98} rx={70} ry={18} fill={dark} opacity={0.35} />
        {/* saddle + mochila (mail bag) */}
        <path d="M -30 -156 Q 6 -170 40 -156 L 44 -120 L -34 -120 Z" fill="#5a3a22" stroke={INK} strokeWidth={4} />
        {mailbag && (
          <g>
            <rect x={-26} y={-142} width={62} height={44} rx={6} fill="#c9a36a" stroke={INK} strokeWidth={4} />
            <text x={5} y={-114} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={15} fill={INK}>U.S. MAIL</text>
          </g>
        )}
        {/* neck + head */}
        <path d="M -70 -140 Q -98 -190 -112 -222 L -76 -236 Q -56 -190 -36 -150 Z" fill={color} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <path d="M -118 -244 Q -150 -236 -170 -206 Q -176 -192 -160 -186 Q -132 -190 -100 -208 Z" fill={color} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <ellipse cx={-166} cy={-196} rx={9} ry={7} fill={dark} />
        <circle cx={-128} cy={-222} r={6} fill={INK} />
        <circle cx={-126} cy={-224} r={2} fill="#fff" />
        <path d="M -104 -246 L -98 -268 L -88 -244 Z" fill={color} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        {/* mane */}
        <path d={`M -96 -244 Q ${-70 + g * c * 6} -214 -60 -170 Q -50 -150 -40 -142`} stroke="#3a2618" strokeWidth={14} fill="none" strokeLinecap="round" />
        {/* bridle + reins to the rider */}
        <path d="M -150 -204 L -120 -214 M -120 -214 Q -60 -190 -14 -160" stroke="#2a1a10" strokeWidth={4} fill="none" />
        {/* near legs */}
        {leg(legs[0][0], legs[0][1], legs[0][2], false, 0)}
        {leg(legs[2][0], legs[2][1], legs[2][2], false, 2)}
      </g>
    </g>
  );
};

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v + (amt < 0 ? v * amt : (255 - v) * amt))));
  const r = f(n >> 16), g = f((n >> 8) & 255), b = f(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
