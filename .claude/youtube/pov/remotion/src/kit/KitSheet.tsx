import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Kit, KIT_OUTFIT_LABELS, KitMood, KitOutfit } from "../lib/Kit";
import { Prairie, Wagon, Place } from "../lib/art";
import { Stamp } from "../lib/hud";
import { C } from "../lib/theme";

const Label: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 40 }) => (
  <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: size, color: C.cream, textAlign: "center", letterSpacing: 1 }}>{children}</div>
);

/** Character sheet: Kit in four era outfits. */
export const KitOutfits: React.FC = () => {
  const outfits: KitOutfit[] = ["pioneer", "miner", "attendant", "recruit"];
  return (
    <AbsoluteFill style={{ backgroundColor: "#2c2219" }}>
      <Stamp text="MEET KIT - THE 'YOU' IN EVERY VIDEO" y={40} size={72} bg={C.red} side={200} />
      <div style={{ position: "absolute", top: 210, left: 60, right: 60, display: "flex", justifyContent: "space-around", alignItems: "flex-end" }}>
        {outfits.map((o, i) => (
          <div key={o} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <Kit outfit={o} mood={(["happy", "determined", "smirk", "determined"] as KitMood[])[i]} size={680} />
            <Label>{KIT_OUTFIT_LABELS[o].toUpperCase()}</Label>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/** Expression sheet: the six moods Kit uses. */
export const KitExpressions: React.FC = () => {
  const moods: KitMood[] = ["happy", "determined", "smirk", "worried", "shocked", "sad"];
  return (
    <AbsoluteFill style={{ backgroundColor: "#e9dcbc" }}>
      <Stamp text="KIT - EXPRESSIONS" y={40} size={72} side={500} />
      <div style={{ position: "absolute", top: 280, left: 60, right: 60, display: "flex", justifyContent: "space-between" }}>
        {moods.map((m) => (
          <div key={m} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ height: 300, overflow: "hidden" }}>
              <Kit outfit="plain" mood={m} size={540} />
            </div>
            <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 44, color: C.ink, marginTop: 10 }}>{m.toUpperCase()}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", bottom: 70, left: 0, right: 0, textAlign: "center", fontFamily: "Bitter", fontSize: 38, color: C.ink }}>
        Signatures in every era: red scarf · teal streak · brass pocket watch
      </div>
    </AbsoluteFill>
  );
};

/** 6-second intro loop: Kit walks in, reacts, cheers. */
export const KitIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, 60], [-500, 760], { extrapolateRight: "clamp" });
  const pose = frame < 60 ? "walk" : frame < 120 ? "point" : "cheer";
  const mood: KitMood = frame < 60 ? "determined" : frame < 90 ? "shocked" : frame < 120 ? "smirk" : "happy";
  return (
    <AbsoluteFill>
      <Prairie time={0.4} horizon={760} />
      <Place x={1200} y={430} scale={0.8}>
        <Wagon />
      </Place>
      <div style={{ position: "absolute", left: x, top: 230 }}>
        <Kit outfit="pioneer" pose={pose} mood={mood} talking={frame > 90 && frame < 120} size={760} />
      </div>
      {frame > 120 ? <Stamp text="WHICH LIFE NEXT?" y={70} size={110} bg={C.red} side={300} start={120} /> : null}
    </AbsoluteFill>
  );
};
