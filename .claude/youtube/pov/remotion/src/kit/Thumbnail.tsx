import React from "react";
import { AbsoluteFill } from "remotion";
import { Kit } from "../lib/Kit";
import { Marker } from "../lib/art2";
import { C } from "../lib/theme";

const TinCup: React.FC = () => (
  <svg width={520} height={560} viewBox="0 0 520 560">
    <defs>
      <clipPath id="thumbCup">
        <path d="M80 90 L 380 90 L 345 480 Q 230 520 115 480 Z" />
      </clipPath>
    </defs>
    <path d="M80 90 L 380 90 L 345 480 Q 230 520 115 480 Z" fill={C.tin} stroke={C.ink} strokeWidth={12} />
    <rect x={0} y={150} width={520} height={420} fill="#6b5a3e" clipPath="url(#thumbCup)" />
    <ellipse cx={230} cy={152} rx={148} ry={20} fill="#8a7550" clipPath="url(#thumbCup)" />
    {[[180, 260], [270, 320], [210, 390], [300, 230], [150, 340]].map(([x, y]) => (
      <circle key={`${x}-${y}`} cx={x} cy={y} r={9} fill="#4c3f2a" clipPath="url(#thumbCup)" />
    ))}
    <ellipse cx={230} cy={90} rx={150} ry={26} fill="none" stroke={C.ink} strokeWidth={12} />
    <path d="M380 160 Q 500 180 470 300 Q 450 370 360 360" stroke={C.ink} strokeWidth={34} fill="none" />
    <path d="M380 160 Q 500 180 470 300 Q 450 370 360 360" stroke={C.tinDark} strokeWidth={20} fill="none" />
  </svg>
);

/** 1280x720 thumbnail for video 1. Bottom-right corner kept clear for the timestamp. */
export const Thumbnail01: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg, #f0a35e 0%, #c9553a 60%, #6b2f22 100%)", overflow: "hidden" }}>
    <svg width={1280} height={720} style={{ position: "absolute", inset: 0 }}>
      <circle cx={980} cy={470} r={120} fill="#ffd67a" opacity={0.9} />
      <path d="M0 520 Q 400 480 800 520 T 1280 500 V 720 H 0 Z" fill="#5a3322" />
    </svg>
    {[620, 700, 780, 860, 940, 1020, 1100].map((x, i) => (
      <div key={x} style={{ position: "absolute", left: x, top: 430 + (i % 2) * 18, scale: "0.9" }}>
        <Marker />
      </div>
    ))}
    {/* Kit, waist-up, shocked, looking at the cup */}
    <div style={{ position: "absolute", left: -40, top: -10 }}>
      <Kit outfit="pioneer" mood="shocked" size={1250} look={1} />
    </div>
    {/* the cup */}
    <div style={{ position: "absolute", left: 610, top: 250, rotate: "-8deg" }}>
      <TinCup />
    </div>
    {/* three words */}
    <div style={{ position: "absolute", left: 600, top: 30, right: 30, textAlign: "right", fontFamily: "Oswald", fontWeight: 700, lineHeight: 0.95 }}>
      <div style={{ fontSize: 130, color: C.cream, WebkitTextStroke: `14px ${C.ink}`, paintOrder: "stroke fill", textShadow: "0 10px 0 rgba(0,0,0,0.35)" }}>DEAD BY</div>
      <div style={{ display: "inline-block", marginTop: 10, padding: "4px 24px 10px", backgroundColor: C.red, border: `8px solid ${C.ink}`, borderRadius: 16, fontSize: 130, color: C.cream }}>
        SUPPER
      </div>
    </div>
  </AbsoluteFill>
);
