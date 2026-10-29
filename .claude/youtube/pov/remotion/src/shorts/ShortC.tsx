import React from "react";
import { AbsoluteFill, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { IndependenceRock, Mountains, Ox, Place, Prairie, Snow, Vignette, Wagon } from "../lib/art";
import { Captions, Stamp, TrailMap } from "../lib/hud";
import { Scene, lerp, useT } from "../lib/scene";
import { C } from "../lib/theme";
import { Kit } from "../lib/Kit";
import words from "../data/short-C-july4.json";

export const SHORT_C_SECONDS = 24.5;

const CalendarPage: React.FC = () => (
  <div
    style={{
      width: 560,
      height: 620,
      borderRadius: 26,
      backgroundColor: C.cream,
      boxShadow: "0 30px 0 rgba(0,0,0,0.25)",
      overflow: "hidden",
      textAlign: "center",
      fontFamily: "Oswald",
      fontWeight: 700,
    }}
  >
    <div style={{ backgroundColor: C.red, color: C.cream, fontSize: 110, padding: "20px 0" }}>JULY</div>
    <div style={{ color: C.ink, fontSize: 360, lineHeight: 1.2 }}>4</div>
  </div>
);

const Hook = () => {
  // 0-1.4 "until July 4th"  1.4-3.8 "one rock in what's now Wyoming"  3.8-6.8 "winter could kill you"
  const t = useT();
  return (
    <AbsoluteFill>
      {t < 1.4 ? (
        <AbsoluteFill style={{ backgroundColor: "#2c2219", alignItems: "center", justifyContent: "center" }}>
          <div style={{ scale: String(lerp(t, [0, 0.4], [0.7, 1])), marginTop: -330 }}>
            <CalendarPage />
          </div>
          <div style={{ position: "absolute", left: 430, top: 1100 }}>
            <Kit mood="determined" pose="point" size={370} />
          </div>
        </AbsoluteFill>
      ) : t < 3.8 ? (
        <AbsoluteFill>
          <Prairie time={0.45} horizon={1200} />
          <Place x={130} y={lerp(t, [1.4, 2.2], [1400, 880])} scale={1.15}>
            <IndependenceRock />
          </Place>
        </AbsoluteFill>
      ) : (
        <AbsoluteFill>
          <Prairie time={1.25} horizon={1250} sun={false} />
          <Place x={0} y={760}>
            <Mountains />
          </Place>
          <Place x={250} y={1100} scale={0.85}>
            <Wagon />
          </Place>
          <Snow density={140} wind={4} />
        </AbsoluteFill>
      )}
      {t < 2.2 ? <Stamp text={"ONE ROCK.\nONE DATE."} y={140} size={120} /> : null}
      <Vignette />
    </AbsoluteFill>
  );
};

const Spring = () => {
  // local 0 = 6.8.  "too early" @8.6 (1.8)  "too late" @11.1 (4.3)
  const t = useT();
  if (t < 1.8) {
    return (
      <AbsoluteFill>
        <Prairie time={0.3} />
        <Place x={300} y={1000} scale={1.1}>
          <Ox step={t * 5} />
        </Place>
        <Stamp text="SPRING" y={330} size={170} />
        <Vignette />
      </AbsoluteFill>
    );
  }
  if (t < 4.3) {
    return (
      <AbsoluteFill>
        <Prairie time={0.2} />
        <AbsoluteFill style={{ backgroundColor: "rgba(120,100,80,0.35)" }} />
        <Place x={300} y={1000} scale={1.1}>
          <Ox step={0} />
        </Place>
        <Stamp text={"TOO EARLY\nNO GRASS"} y={330} size={130} />
        <Vignette />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Prairie time={1.2} horizon={1300} sun={false} />
      <Place x={0} y={lerp(t, [4.3, 7.2], [820, 760])}>
        <Mountains />
      </Place>
      <Snow density={110} wind={3} />
      <Stamp text={"TOO LATE\nSNOW"} y={330} size={130} bg={C.red} />
      <Vignette />
    </AbsoluteFill>
  );
};

const Deadline = () => {
  // local 0 = 14.0.  "Independence Rock" @18.6 (4.6)  "reach it by 4th of July" @19.8 (5.8)  "racing the winter" @22.4 (8.4)
  const t = useT();
  if (t < 2.6) {
    return (
      <AbsoluteFill>
        <TrailMap progress={lerp(t, [0, 2.6], [0, 0.45])} />
        <Stamp text="ONE DEADLINE" y={760} size={130} bg={C.red} />
      </AbsoluteFill>
    );
  }
  if (t < 5.8) {
    return (
      <AbsoluteFill>
        <Prairie time={0.55} horizon={1250} />
        <Place x={130} y={lerp(t, [2.6, 3.4], [1450, 900])} scale={1.15}>
          <IndependenceRock />
        </Place>
        {t > 4.5 ? <Stamp text={"INDEPENDENCE\nROCK"} y={330} size={130} /> : null}
        <Vignette />
      </AbsoluteFill>
    );
  }
  if (t < 8.4) {
    return (
      <AbsoluteFill>
        <TrailMap progress={lerp(t, [5.8, 7.6], [0.45, 1])} />
        {t > 7.4 ? <Stamp text="ON SCHEDULE" y={760} size={130} bg="#3d6b3a" /> : null}
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Prairie time={1.25} horizon={1250} sun={false} />
      <Place x={0} y={760}>
        <Mountains />
      </Place>
      <Place x={lerp(t, [8.4, 10.5], [200, 330], (x) => x)} y={1100} scale={0.85}>
        <Wagon wheelTurn={t * 80} />
      </Place>
      <div style={{ position: "absolute", left: 640, top: 960 }}>
        <Kit mood="worried" pose="walk" size={480} />
      </div>
      <Snow density={170} wind={5} />
      <Stamp text="RACING THE WINTER" y={330} size={110} bg={C.red} />
      <Vignette strength={0.7} />
    </AbsoluteFill>
  );
};

export const ShortC: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.ink }}>
    <Scene name="Hook - July 4, rock, winter" from={0} to={6.8} push={0.04}>
      <Hook />
    </Scene>
    <Scene name="Spring - too early, too late" from={6.8} to={14.0} push={0.05}>
      <Spring />
    </Scene>
    <Scene name="Deadline - rock, schedule, winter" from={14.0} to={SHORT_C_SECONDS} push={0.04}>
      <Deadline />
    </Scene>
    <Captions segments={words} y={1500} />
    <Audio src={staticFile("audio/short-C-july4.mp3")} />
  </AbsoluteFill>
);
