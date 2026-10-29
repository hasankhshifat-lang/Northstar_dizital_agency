import React from "react";
import { AbsoluteFill, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Bacon, Coin, FlourSack, Ox, Place, Prairie, Store, Vignette, Wagon } from "../lib/art";
import { Captions, Counter, Stamp, TrailMap } from "../lib/hud";
import { Scene, lerp, useT } from "../lib/scene";
import { C } from "../lib/theme";
import { Kit } from "../lib/Kit";
import words from "../data/short-B-outfit.json";

export const SHORT_B_SECONDS = 34;

const YearCoinsMap = () => {
  const t = useT();
  // 0-1.3 "It's 1850."  1.3-2.7 "$300"  2.7-4.9 "2,000 mile walk to Oregon"
  if (t < 2.7) {
    return (
      <AbsoluteFill style={{ backgroundColor: "#2c2219" }}>
        <Stamp text="600 LB FLOUR" y={140} size={110} bg={C.red} />
        <div style={{ position: "absolute", left: 400, top: 970 }}>
          <Kit mood={t < 1.3 ? "happy" : "smirk"} size={490} talking={t > 1.3} />
        </div>
        {t < 1.3 ? (
          <Stamp text="1850" y={560} size={300} bg="transparent" />
        ) : (
          <>
            {[0, 1, 2].map((i) => (
              <Place key={i} x={320 + i * 150} y={lerp(t, [1.3 + i * 0.15, 1.7 + i * 0.15], [1900, 560])}>
                <Coin label="$" />
              </Place>
            ))}
            <Counter from={0} to={300} start={40} end={66} prefix="$" y={700} size={170} />
          </>
        )}
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <TrailMap progress={lerp(t, [2.7, 4.8], [0, 1])} target="OREGON" />
      <Counter from={0} to={2000} start={81} end={140} suffix=" MI" y={820} size={170} />
    </AbsoluteFill>
  );
};

const Board: React.FC<{ lines: { text: string; at: number }[] }> = ({ lines }) => {
  const t = useT();
  return (
    <div style={{ position: "absolute", top: 230, left: 120, right: 120, fontFamily: "Bitter", fontWeight: 600, color: C.cream }}>
      <div style={{ fontSize: 58, letterSpacing: 2, marginBottom: 30, opacity: 0.9 }}>OUTFIT - FAMILY OF 3</div>
      {lines.map((l) => (
        <div
          key={l.text}
          style={{
            fontSize: 64,
            lineHeight: 1.45,
            opacity: lerp(t, [l.at, l.at + 0.3], [0, 1]),
            translate: `${lerp(t, [l.at, l.at + 0.3], [-30, 0])}px 0px`,
          }}
        >
          {l.text}
        </div>
      ))}
    </div>
  );
};

const Shop = () => {
  // Local time 0 = 4.9s in the Short.
  const t = useT();
  return (
    <AbsoluteFill>
      <Store />
      <Board
        lines={[
          { text: "4 YOKE OXEN ....... $200", at: 5.2 },
          { text: "WAGON + COVER .... $100", at: 10.0 },
        ]}
      />
      {/* oxen appear in pairs on "four yoke of oxen, that's eight animals" (9.9-11.9s) */}
      {t < 9.8 && [0, 1, 2, 3].map((i) => (
        <Place key={i} x={40 + (i % 2) * 520} y={980 + Math.floor(i / 2) * 230} scale={0.85} opacity={lerp(t, [5.0 + i * 0.35, 5.3 + i * 0.35], [0, 1])}>
          <div style={{ display: "flex" }}>
            <Ox step={t * 5} />
            <div style={{ marginLeft: -180 }}>
              <Ox step={t * 5 + 1} />
            </div>
          </div>
        </Place>
      ))}
      {t > 9.8 ? (
        <Place x={lerp(t, [10.0, 10.8], [1100, 280])} y={1080} scale={0.9}>
          <Wagon />
        </Place>
      ) : null}
      {t < 2.1 ? <Stamp text="BEFORE YOU LEAVE" y={1000} size={96} /> : null}
      <Vignette strength={0.5} />
    </AbsoluteFill>
  );
};

const Flour = () => {
  // Local 0 = 17.7s.  "200 pounds" @20.7 (3.0), "600 pounds" @24.1 (6.4), "bacon" @26.9 (9.2)
  const t = useT();
  const sacks = t < 3.0 ? 0 : t < 6.4 ? 1 : 3;
  return (
    <AbsoluteFill>
      <Store />
      {t < 1.2 ? <Stamp text="THEN FOOD" y={420} size={150} /> : null}
      {t >= 3.0 ? <Counter from={t < 6.4 ? 0 : 200} to={t < 6.4 ? 200 : 600} start={t < 6.4 ? 90 : 192} end={t < 6.4 ? 110 : 215} suffix=" LB" y={330} size={220} /> : null}
      {new Array(sacks).fill(0).map((_, i) => (
        <Place key={i} x={140 + i * 270} y={lerp(t, [i === 0 ? 3.0 : 6.4 + (i - 1) * 0.2, (i === 0 ? 3.0 : 6.4 + (i - 1) * 0.2) + 0.35], [600, 1120], (x) => x * x)} scale={1.1}>
          <FlourSack />
        </Place>
      ))}
      {t >= 9.0 ? (
        <Place x={390} y={lerp(t, [9.0, 9.4], [500, 920])} scale={1.1}>
          <Bacon />
        </Place>
      ) : null}
      <Vignette strength={0.5} />
    </AbsoluteFill>
  );
};

const Walk = () => {
  // Local 0 = 27.7s.  "don't ride" @29.2 (1.5)  "It's full" @30.6 (2.9)  "walk beside it" @31.5 (3.8)
  const t = useT();
  return (
    <AbsoluteFill>
      <Prairie time={0.4} />
      <Place x={lerp(t, [0, 6.3], [60, 120], (x) => x)} y={780} scale={1.15}>
        <Wagon wheelTurn={t * 70} />
      </Place>
      <Place x={lerp(t, [0, 6.3], [-200, 60], (x) => x)} y={1060} scale={0.8}>
        <Ox step={t * 6} />
      </Place>
      {t > 3.6 ? (
        <div style={{ position: "absolute", left: 640, top: lerp(t, [3.6, 4.0], [1500, 830]) }}>
          <Kit mood="determined" pose="walk" size={600} />
        </div>
      ) : null}
      {t > 1.4 && t < 3.6 ? <Stamp text="NO SEAT" y={330} size={170} bg={C.red} /> : null}
      {t >= 3.6 ? <Stamp text="EVERY MILE" y={330} size={150} /> : null}
      <Vignette />
    </AbsoluteFill>
  );
};

export const ShortB: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.ink }}>
    <Scene name="Hook - 1850, $300, 2000 mi" from={0} to={4.9} push={0.03}>
      <YearCoinsMap />
    </Scene>
    <Scene name="Shop - oxen and wagon" from={4.9} to={17.7} push={0.05}>
      <Shop />
    </Scene>
    <Scene name="Flour" from={17.7} to={27.7} push={0.05}>
      <Flour />
    </Scene>
    <Scene name="Walk beside it" from={27.7} to={SHORT_B_SECONDS} push={0.06}>
      <Walk />
    </Scene>
    <Captions segments={words} y={1500} />
    <Audio src={staticFile("audio/short-B-outfit.mp3")} />
  </AbsoluteFill>
);
