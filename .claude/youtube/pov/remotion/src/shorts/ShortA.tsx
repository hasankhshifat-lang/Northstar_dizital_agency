import React from "react";
import { AbsoluteFill, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { BigX, Bandit, CupInHands, Grave, Person, Place, Prairie, River, Snake, Vignette, Wagon, Ox } from "../lib/art";
import { Captions, Clock, DayCounter, Stamp } from "../lib/hud";
import { Scene, lerp, useT } from "../lib/scene";
import { C } from "../lib/theme";
import words from "../data/short-A-cholera.json";

export const SHORT_A_SECONDS = 39.5;

const ClockHook = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{ backgroundColor: C.skyNight, alignItems: "center", justifyContent: "center" }}>
      <div style={{ marginTop: -260 }}>
        <Clock hours={lerp(t, [0, 1.9], [0, 12])} size={620} />
      </div>
      <Stamp text={"HEALTHY.\nTHEN GONE."} y={150} size={120} />
    </AbsoluteFill>
  );
};

const CupFills = () => {
  const t = useT();
  return (
    <AbsoluteFill>
      <Prairie time={0.1} />
      <River y={1060} h={300} />
      <Place x={160} y={lerp(t, [0, 2.5], [1300, 420])} scale={1.2}>
        <CupInHands fill={lerp(t, [0.5, 4], [0.1, 0.9])} />
      </Place>
      <Vignette />
    </AbsoluteFill>
  );
};

const Neighbour: React.FC<{ phase: "morning" | "noon" | "evening" }> = ({ phase }) => {
  const t = useT();
  const time = phase === "morning" ? 0.15 : phase === "noon" ? 0.5 : 1.02;
  return (
    <AbsoluteFill>
      <Prairie time={time} />
      <Place x={-30} y={760} scale={0.9}>
        <Wagon />
      </Place>
      {phase === "morning" ? (
        <Place x={560} y={760} scale={1.25}>
          <Person pose="sit" pale={lerp(t, [0, 5], [0, 0.6])} />
        </Place>
      ) : null}
      {phase === "noon" ? (
        <Place x={420} y={1040} scale={1.3}>
          <Person pose="lie" pale={0.9} />
        </Place>
      ) : null}
      {phase === "evening" ? (
        <>
          <Place x={520} y={830} scale={lerp(t, [0, 1], [0.6, 1.1])}>
            <Grave mound={lerp(t, [0, 1.2], [0.2, 1])} />
          </Place>
          <Place x={170} y={720} scale={1.1}>
            <Person pose="dig" shirt="#8e6b4f" />
          </Place>
        </>
      ) : null}
      <DayCounter day={19} />
      <Vignette strength={phase === "evening" ? 0.7 : 0.45} />
    </AbsoluteFill>
  );
};

const CholeraCard = () => {
  const t = useT();
  // 0-1.2 "That's cholera."  1.2-5.4 "...within 12 hours..."  5.4-7.8 "Healthy at breakfast, gone by supper."
  return (
    <AbsoluteFill>
      <Prairie time={lerp(t, [5.3, 7.6], [0.05, 1.1], (x) => x)} />
      {t < 5.3 ? (
        <AbsoluteFill style={{ backgroundColor: "rgba(27,22,18,0.55)" }}>
          <Stamp text="CHOLERA" size={190} y={330} bg={C.red} />
          {t > 1.2 ? (
            <div style={{ position: "absolute", top: 640, left: 230 }}>
              <Clock hours={lerp(t, [2.0, 3.6], [0, 12])} size={620} />
            </div>
          ) : null}
        </AbsoluteFill>
      ) : (
        <>
          <Stamp text={t < 6.5 ? "BREAKFAST" : "SUPPER"} size={130} y={330} start={0} />
          {t < 6.5 ? (
            <Place x={410} y={780} scale={1.2}>
              <Person pose="stand" />
            </Place>
          ) : (
            <Place x={330} y={880} scale={1.1}>
              <Grave mound={1} />
            </Place>
          )}
        </>
      )}
      <Vignette />
    </AbsoluteFill>
  );
};

const SharedWater = () => {
  const t = useT();
  return (
    <AbsoluteFill>
      <Prairie time={0.45} horizon={980} />
      <River y={1150} h={460} />
      {[0, 1, 2, 3].map((i) => (
        <Place key={i} x={lerp(t, [0, 12], [-500 + i * 420, -200 + i * 420], (x) => x)} y={760 + (i % 2) * 70} scale={0.62}>
          <Wagon wheelTurn={t * 60} />
        </Place>
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <Place key={`ox${i}`} x={40 + i * 210} y={1520 + (i % 2) * 90} scale={0.7}>
          <Ox step={t * 6 + i} />
        </Place>
      ))}
      {t > 3.4 ? <Stamp text="SAME RIVERS. SAME CAMPS." size={84} y={330} start={0} /> : null}
      <Vignette />
    </AbsoluteFill>
  );
};

const NotSnakes = () => {
  const t = useT();
  // 0-0.9 snakes, 0.9-1.9 bandits, 1.9+ the water
  return (
    <AbsoluteFill style={{ backgroundColor: "#d8c39a" }}>
      {t < 0.9 ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "relative", width: 420, height: 420, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Snake />
            <BigX progress={lerp(t, [0.15, 0.6], [0, 1])} />
          </div>
        </AbsoluteFill>
      ) : t < 1.9 ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "relative", width: 420, height: 420, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bandit />
            <BigX progress={lerp(t, [1.0, 1.5], [0, 1])} />
          </div>
        </AbsoluteFill>
      ) : (
        <AbsoluteFill>
          <Prairie time={0.1} />
          <Place x={160} y={520} scale={1.15}>
            <CupInHands fill={0.9} />
          </Place>
          <Stamp text="THE WATER" size={170} y={260} bg={C.red} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

export const ShortA: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.ink }}>
    <Scene name="Hook - clock" from={0} to={1.9} push={0.04}>
      <ClockHook />
    </Scene>
    <Scene name="Hook - cup" from={1.9} to={7.1}>
      <CupFills />
    </Scene>
    <Scene name="Day 19 morning" from={7.1} to={12.6}>
      <Neighbour phase="morning" />
    </Scene>
    <Scene name="Noon" from={12.6} to={14.5}>
      <Neighbour phase="noon" />
    </Scene>
    <Scene name="Evening grave" from={14.5} to={16.9}>
      <Neighbour phase="evening" />
    </Scene>
    <Scene name="Cholera" from={16.9} to={24.6} push={0.03}>
      <CholeraCard />
    </Scene>
    <Scene name="Shared water" from={24.6} to={36.8} push={0.08}>
      <SharedWater />
    </Scene>
    <Scene name="Not snakes" from={36.8} to={SHORT_A_SECONDS} push={0.02} fade={false}>
      <NotSnakes />
    </Scene>
    <Captions segments={words} />
    <Audio src={staticFile("audio/short-A-cholera.mp3")} />
  </AbsoluteFill>
);
