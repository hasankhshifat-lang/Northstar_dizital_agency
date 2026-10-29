import React from "react";
import { AbsoluteFill } from "remotion";
import { Kit, KitOutfit } from "../lib/Kit";
import { Mountains, Snow, Wagon } from "../lib/art";
import { C } from "../lib/theme";

export const CHANNEL_NAME = "WHICH LIFE NEXT?";
export const CHANNEL_TAGLINE = "You live a different American life in every video";

const TEAL = "#19b5a8";

/** 800x800 profile picture. YouTube crops it to a circle, so Kit's face sits in the centre. */
export const ProfilePicture: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.red, overflow: "hidden" }}>
    {/* sunburst */}
    <svg width={800} height={800} style={{ position: "absolute", inset: 0 }}>
      {new Array(16).fill(0).map((_, i) => {
        const a1 = (i * 2 * Math.PI) / 16;
        const a2 = a1 + Math.PI / 16;
        return (
          <path
            key={i}
            d={`M400 430 L ${400 + Math.cos(a1) * 800} ${430 + Math.sin(a1) * 800} L ${400 + Math.cos(a2) * 800} ${430 + Math.sin(a2) * 800} Z`}
            fill="#e0533f"
          />
        );
      })}
      <circle cx={400} cy={400} r={392} fill="none" stroke={TEAL} strokeWidth={16} />
    </svg>
    <div style={{ position: "absolute", left: 53, top: 60 }}>
      <Kit outfit="pioneer" mood="smirk" size={1250} look={0} />
    </div>
  </AbsoluteFill>
);

const Era: React.FC<{ x: number; outfit: KitOutfit; year: string; children?: React.ReactNode; flip?: boolean }> = ({ x, outfit, year, children, flip }) => (
  <div style={{ position: "absolute", left: x, top: 0, width: 500, height: 1440 }}>
    {children}
    <div style={{ position: "absolute", left: 120, top: 560 }}>
      <Kit outfit={outfit} mood="happy" size={560} flip={flip} look={flip ? -1 : 1} />
    </div>
    <div
      style={{
        position: "absolute",
        top: 1150,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: "Oswald",
        fontWeight: 700,
        fontSize: 64,
        color: C.cream,
        opacity: 0.9,
      }}
    >
      {year}
    </div>
  </div>
);

/** 2560x1440 banner. Text + hero Kit live in the 1546x423 mobile-safe strip (x 507-2053, y 508-931). */
export const Banner: React.FC<{ showSafeArea?: boolean }> = ({ showSafeArea = false }) => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg, #f2b880 0%, #c96f4a 55%, #6b3a2a 100%)", overflow: "hidden" }}>
    {/* far scenery across the full TV width */}
    <div style={{ position: "absolute", left: 0, top: 640, opacity: 0.55 }}>
      <Mountains snow tint="#7a5a64" />
    </div>
    <div style={{ position: "absolute", left: 1480, top: 640, opacity: 0.55 }}>
      <Mountains snow tint="#7a5a64" />
    </div>
    <svg width={2560} height={1440} style={{ position: "absolute", inset: 0 }}>
      <path d="M0 1010 Q 640 950 1280 1000 T 2560 980 V 1440 H 0 Z" fill="#8f6a3a" />
      <path d="M0 1080 Q 700 1030 1400 1090 T 2560 1060 V 1440 H 0 Z" fill="#6e5230" />
    </svg>
    {/* era vignettes outside the safe strip - visible on desktop / TV */}
    <Era x={-40} outfit="pioneer" year="1850">
      <div style={{ position: "absolute", left: 0, top: 790, scale: "0.7", opacity: 0.9 }}>
        <Wagon />
      </div>
    </Era>
    <Era x={2100} outfit="miner" year="1925" flip>
      <svg width={500} height={1440} style={{ position: "absolute", inset: 0 }}>
        <path d="M150 1030 L 250 640 L 350 1030 M 180 900 L 320 900 M 200 780 L 300 780" stroke="#3a2a1c" strokeWidth={18} fill="none" />
        <circle cx={250} cy={640} r={40} fill="none" stroke="#3a2a1c" strokeWidth={14} />
      </svg>
    </Era>
    <Snow density={0} />
    {/* safe strip: name, tagline, hero Kit */}
    <div style={{ position: "absolute", left: 507, top: 508, width: 1546, height: 423 }}>
      <div style={{ position: "absolute", left: 40, top: -6 }}>
        <Kit outfit="pioneer" mood="smirk" pose="point" size={430} look={1} />
      </div>
      <div style={{ position: "absolute", left: 370, top: 44, right: 20 }}>
        <div
          style={{
            fontFamily: "Oswald",
            fontWeight: 700,
            fontSize: 140,
            lineHeight: 1,
            color: C.cream,
            WebkitTextStroke: `14px ${C.ink}`,
            paintOrder: "stroke fill",
            textShadow: "0 12px 0 rgba(0,0,0,0.3)",
            whiteSpace: "nowrap",
          }}
        >
          {CHANNEL_NAME}
        </div>
        <div
          style={{
            display: "inline-block",
            marginTop: 22,
            padding: "10px 26px",
            whiteSpace: "nowrap",
            backgroundColor: C.red,
            borderRadius: 14,
            fontFamily: "Oswald",
            fontWeight: 700,
            fontSize: 42,
            color: C.cream,
            letterSpacing: 1,
          }}
        >
          {CHANNEL_TAGLINE.toUpperCase()}
        </div>
        <div style={{ marginTop: 16, fontFamily: "Bitter", fontWeight: 600, fontSize: 38, color: C.cream, opacity: 0.95 }}>
          Animated POV history · a new life every episode
        </div>
      </div>
    </div>
    {showSafeArea ? (
      <>
        <div style={{ position: "absolute", left: 507, top: 508, width: 1546, height: 423, border: "6px dashed #00ff88" }} />
        <div style={{ position: "absolute", left: 507, top: 0, width: 1546, height: 1440, border: "4px dashed #ffee00" }} />
      </>
    ) : null}
  </AbsoluteFill>
);

export const BannerSafeCheck: React.FC = () => <Banner showSafeArea />;
