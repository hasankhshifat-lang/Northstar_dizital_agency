import React from "react";
import { AbsoluteFill, staticFile } from "remotion";
import { Chicken, Farm } from "../sets/chickenScenes";
import { fonts } from "../theme";

const INK = "#2b1d14";
/** 9:16 cartoon thumbnail for the Mike the Headless Chicken Short (2D, same style as the Short). */
export const MikeThumb: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#8fc4e0" }}>
    <style>{`@font-face{font-family:"AntonT";src:url(${staticFile("anton.ttf")})}`}</style>
    <svg viewBox="0 0 1080 1920" width="100%" height="100%">
      <g transform="translate(0 40)"><Farm frame={0} barn /></g>
      {/* chopping block with axe and the head */}
      <g transform="translate(-50 40)">
        <rect x={700} y={1330} width={300} height={120} rx={16} fill="#8a5a32" stroke={INK} strokeWidth={7} />
        <ellipse cx={850} cy={1332} rx={150} ry={26} fill="#b98a55" stroke={INK} strokeWidth={6} />
        <g transform="translate(850 1310) rotate(-14)">
          <circle r={46} fill="#b0561f" stroke={INK} strokeWidth={7} /><circle cx={-18} cy={-52} r={18} fill="#d8332a" stroke={INK} strokeWidth={5} /><circle cx={8} cy={-58} r={20} fill="#d8332a" stroke={INK} strokeWidth={5} />
          <path d="M 38 -8 L 86 4 L 38 16 Z" fill="#f2b84b" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <circle cx={14} cy={-12} r={8} fill="#111" /><path d="M 2 -26 L 26 -22" stroke="#111" strokeWidth={5} />
        </g>
        <g transform="translate(930 1330) rotate(24)">
          <rect x={-9} y={-330} width={18} height={340} rx={6} fill="#8a5a32" stroke={INK} strokeWidth={5} />
          <path d="M -9 -330 L 86 -362 L 86 -250 L -9 -282 Z" fill="#c9ced4" stroke={INK} strokeWidth={6} />
        </g>
      </g>
      {/* the headless rooster, big and centred-left */}
      <g transform="translate(-40 60)"><Chicken x={470} y={1580} s={2.0} head={false} walk={0.5} wob={0} /></g>
      {[[560, 830, 200, -12], [780, 900, 150, 10], [330, 900, 130, -6]].map(([x, y, sz, r], i) => (
        <text key={i} x={x} y={y} fontFamily="Inter" fontWeight={900} fontSize={sz} fill="#fff" stroke="#000" strokeWidth={14} paintOrder="stroke" textAnchor="middle" transform={`rotate(${r} ${x} ${y})`}>?</text>
      ))}
      {/* sweat / motion lines around the stump */}
      <g stroke="#fff" strokeWidth={9} strokeLinecap="round" opacity={0.85}>
        <path d="M 250 1060 l -50 -30" /><path d="M 240 1130 l -62 0" /><path d="M 262 1200 l -52 30" />
      </g>
    </svg>
    <div style={{ position: "absolute", top: 70, left: 0, right: 0, textAlign: "center" }}>
      <div style={{ display: "inline-block", background: "#1b140d", color: "#ffd23f", border: "5px solid #f2b84b", borderRadius: 14, padding: "6px 26px", fontFamily: fonts.sans, fontWeight: 900, fontSize: 52 }}>TRUE STORY · 1945</div>
    </div>
    <div style={{ position: "absolute", top: 170, left: 0, right: 0, textAlign: "center", fontFamily: "AntonT, Impact, sans-serif", whiteSpace: "nowrap", lineHeight: 1.0 }}>
      <div style={{ fontSize: 330, color: "#ffd23f", WebkitTextStroke: "14px #000", paintOrder: "stroke fill", textShadow: "0 10px 0 #000" }}>NO HEAD</div>
      <div style={{ fontSize: 132, color: "#fff", WebkitTextStroke: "10px #000", paintOrder: "stroke fill", textShadow: "0 8px 0 #000", marginTop: 6 }}>18 MONTHS ALIVE</div>
    </div>
  </AbsoluteFill>
);
