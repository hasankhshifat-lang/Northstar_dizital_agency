import React from "react";
import { AbsoluteFill, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import {
  Bacon,
  Bandit,
  BigX,
  CupInHands,
  FlourSack,
  Grave,
  IndependenceRock,
  Mountains,
  Ox,
  Person,
  Place,
  Prairie,
  River,
  Snake,
  Snow,
  Store,
  Vignette,
  Wagon,
} from "../lib/art";
import { Boot, Campfire, Diary, Dresser, HTrailMap, Marker, PersonIcon, Raft, Rifle, Stove } from "../lib/art2";
import { Captions, Clock, Counter, DayCounter, Stamp } from "../lib/hud";
import { Scene, lerp, useT } from "../lib/scene";
import { C } from "../lib/theme";
import { Kit } from "../lib/Kit";
import words from "../data/long-oregon-trail.json";

export const LONG_SECONDS = 188.3;

const H = 700; // horizon line for 16:9 scenes

/** Title stamp sized for 16:9. */
const T: React.FC<{ text: string; y?: number; size?: number; bg?: string; start?: number }> = ({ text, y = 90, size = 92, bg, start }) => (
  <Stamp text={text} y={y} size={size} bg={bg} side={260} start={start} />
);

const Cup: React.FC<{ fill?: number; y?: number; time?: number }> = ({ fill = 0.9, y = 120, time = 0.1 }) => (
  <AbsoluteFill>
    <Prairie time={time} horizon={H} />
    <River y={H - 10} h={200} />
    <Place x={580} y={y} scale={1.05}>
      <CupInHands fill={fill} />
    </Place>
    <Vignette />
  </AbsoluteFill>
);

const HookCup = () => {
  const t = useT();
  return <Cup fill={lerp(t, [0.3, 4.5], [0.1, 0.9])} y={lerp(t, [0, 2.2], [700, 120])} />;
};

const TitleCard = () => (
  <AbsoluteFill style={{ backgroundColor: C.ink, alignItems: "center", justifyContent: "center" }}>
    <Place x={700} y={300} scale={1.2} opacity={0.35}>
      <Wagon />
    </Place>
    <Stamp text="30 DAYS" y={380} size={220} bg={C.red} side={300} />
    <div style={{ position: "absolute", left: 1480, top: 400 }}>
      <Kit mood="determined" size={620} />
    </div>
  </AbsoluteFill>
);

const Independence = () => {
  const t = useT();
  return (
    <AbsoluteFill>
      <Prairie time={0.35} horizon={H} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Place key={i} x={-60 + i * 400} y={H - 300 + (i % 2) * 60} scale={0.7}>
          <Wagon />
        </Place>
      ))}
      {[0, 2].map((i) => (
        <Place key={`p${i}`} x={300 + i * 520} y={H - 120} scale={0.55}>
          <Person shirt={[C.shirt, "#8e6b4f", "#7a6a8f"][i]} />
        </Place>
      ))}
      <div style={{ position: "absolute", left: 830, top: H - 180 }}>
        <Kit mood="happy" look={-1} size={460} />
      </div>
      <T text={t < 3.4 ? "INDEPENDENCE, MISSOURI · SPRING 1850" : "2,000 MILES TO OREGON"} size={80} start={t < 3.4 ? 0 : 102} />
      <Vignette />
    </AbsoluteFill>
  );
};

const DiaryScene = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{ backgroundColor: "#3a2a1c" }}>
      <Place x={510} y={lerp(t, [0, 0.8], [400, 230])} scale={1.0}>
        <Diary />
      </Place>
      {t > 1.2 ? <T text="BUILT FROM REAL DIARIES & RECORDS" size={76} /> : null}
      <Vignette />
    </AbsoluteFill>
  );
};

const Day1 = () => (
  <AbsoluteFill style={{ backgroundColor: C.ink }}>
    <Stamp text="DAY 1" y={300} size={240} bg="transparent" side={300} />
    <div style={{ position: "absolute", left: 1460, top: 360 }}>
      <Kit mood="determined" pose="walk" size={620} />
    </div>
    <Stamp text="30 DAYS. LET'S SEE." y={620} size={80} side={300} start={30} />
  </AbsoluteFill>
);

const Shop = () => {
  // local 0 = 23.1. "Four yoke" 27.3 (4.2). "A wagon" 32.74 (9.6).
  const t = useT();
  const board = { x: 90, y: 90, w: 880, h: 520 };
  return (
    <AbsoluteFill>
      <Store board={board} counterY={860} />
      <div style={{ position: "absolute", top: 130, left: 140, width: 800, fontFamily: "Bitter", fontWeight: 600, color: C.cream }}>
        <div style={{ fontSize: 46, marginBottom: 26, opacity: 0.9 }}>OUTFIT - FAMILY OF 3 (1850 GUIDE)</div>
        {[
          { text: "4 YOKE OXEN ...... $200", at: 4.2 },
          { text: "WAGON + COVER ... $100", at: 9.6 },
        ].map((l) => (
          <div key={l.text} style={{ fontSize: 56, lineHeight: 1.6, opacity: lerp(t, [l.at, l.at + 0.3], [0, 1]) }}>
            {l.text}
          </div>
        ))}
      </div>
      {t < 9.4
        ? [0, 1, 2, 3].map((i) => (
            <Place key={i} x={1040 + (i % 2) * 420} y={150 + Math.floor(i / 2) * 260} scale={0.75} opacity={lerp(t, [4.3 + i * 0.4, 4.6 + i * 0.4], [0, 1])}>
              <div style={{ display: "flex" }}>
                <Ox step={t * 5} />
                <div style={{ marginLeft: -190 }}>
                  <Ox step={t * 5 + 1} />
                </div>
              </div>
            </Place>
          ))
        : null}
      {t >= 9.4 ? (
        <Place x={lerp(t, [9.6, 10.4], [1950, 1180])} y={260} scale={1.1}>
          <Wagon />
        </Place>
      ) : null}
      {t < 1.3 ? <T text="FIRST, YOU SHOP" y={700} size={96} /> : null}
      <Vignette strength={0.5} />
    </AbsoluteFill>
  );
};

const Flour = () => {
  // local 0 = 35.3. "200 pounds" (3.0). "600 pounds" (5.6). "bacon" (9.2).
  const t = useT();
  const sacks = t < 3.0 ? 0 : t < 5.6 ? 1 : 3;
  return (
    <AbsoluteFill>
      <Store board={{ x: 460, y: 70, w: 1000, h: 300 }} counterY={860} />
      {t < 1.2 ? <T text="THEN FOOD" y={140} size={120} /> : null}
      {t >= 3.0 ? (
        <Counter from={t < 5.6 ? 0 : 200} to={t < 5.6 ? 200 : 600} start={t < 5.6 ? 90 : 168} end={t < 5.6 ? 110 : 190} suffix=" LB FLOUR" y={110} size={150} />
      ) : null}
      {new Array(sacks).fill(0).map((_, i) => {
        const at = i === 0 ? 3.0 : 5.6 + (i - 1) * 0.2;
        return (
          <Place key={i} x={520 + i * 300} y={lerp(t, [at, at + 0.35], [200, 600], (x) => x * x)} scale={1.1}>
            <FlourSack />
          </Place>
        );
      })}
      {t >= 9.0 ? (
        <Place x={1480} y={lerp(t, [9.0, 9.4], [300, 700])} scale={1.0}>
          <Bacon />
        </Place>
      ) : null}
      <Vignette strength={0.5} />
    </AbsoluteFill>
  );
};

const Walk = () => {
  // local 0 = 45.3. "don't ride" (1.7) "it's full" (3.1) "walk beside" (3.9)
  const t = useT();
  return (
    <AbsoluteFill>
      <Prairie time={0.4} horizon={H} />
      <Place x={lerp(t, [0, 6.3], [520, 640], (x) => x)} y={H - 260} scale={1.1}>
        <Wagon wheelTurn={t * 70} full />
      </Place>
      <Place x={lerp(t, [0, 6.3], [180, 300], (x) => x)} y={H - 40} scale={0.8}>
        <Ox step={t * 6} />
      </Place>
      {t > 3.8 ? (
        <div style={{ position: "absolute", left: 1260, top: lerp(t, [3.8, 4.2], [1100, H - 330]) }}>
          <Kit mood="determined" pose="walk" size={460} />
        </div>
      ) : null}
      {t > 1.5 && t < 3.8 ? <T text="NO SEAT - IT'S FULL" bg={C.red} /> : null}
      {t >= 3.8 ? <T text="YOU WALK. EVERY MILE." /> : null}
      <Vignette />
    </AbsoluteFill>
  );
};

const Spring = () => {
  // local 0 = 51.6. "too early" (1.9) "too late" (4.2)
  const t = useT();
  if (t < 4.2) {
    return (
      <AbsoluteFill>
        <Prairie time={t < 1.9 ? 0.3 : 0.2} horizon={H} />
        {t >= 1.9 ? <AbsoluteFill style={{ backgroundColor: "rgba(120,100,80,0.35)" }} /> : null}
        <Place x={820} y={H - 60} scale={1.0}>
          <Ox step={t < 1.9 ? t * 5 : 0} />
        </Place>
        <T text={t < 1.9 ? "YOU LEAVE IN SPRING" : "TOO EARLY: NO GRASS"} />
        <Vignette />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Prairie time={1.2} horizon={H + 100} sun={false} />
      <Place x={420} y={lerp(t, [4.2, 7], [330, 290])} scale={1.0}>
        <Mountains />
      </Place>
      <Snow density={160} wind={3} />
      <T text="TOO LATE: SNOW IN THE MOUNTAINS" bg={C.red} size={80} />
      <Vignette />
    </AbsoluteFill>
  );
};

const Deadline = () => {
  // local 0 = 58.6. map (0-3.0) rock (3.0-6.2) schedule (6.2-8.7) winter (8.7+)
  const t = useT();
  if (t < 3.0 || (t >= 6.2 && t < 8.7)) {
    return (
      <AbsoluteFill>
        <HTrailMap progress={t < 3.0 ? lerp(t, [0, 3], [0, 0.3]) : lerp(t, [6.2, 7.8], [0.3, 0.45])} markers={[{ at: 0.45, label: "JULY 4" }]} />
        <T text={t < 3.0 ? "ONE DEADLINE" : "BY JULY 4: ON SCHEDULE"} y={70} bg={t < 3.0 ? C.red : "#3d6b3a"} />
      </AbsoluteFill>
    );
  }
  if (t < 6.2) {
    return (
      <AbsoluteFill>
        <Prairie time={0.55} horizon={H + 40} />
        <Place x={550} y={lerp(t, [3.0, 3.8], [900, 420])} scale={1.0}>
          <IndependenceRock />
        </Place>
        {t > 4.8 ? <T text="INDEPENDENCE ROCK (WYOMING)" size={84} /> : null}
        <Vignette />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Prairie time={1.25} horizon={H + 60} sun={false} />
      <Place x={420} y={290}>
        <Mountains />
      </Place>
      <Place x={lerp(t, [8.7, 10.7], [600, 760], (x) => x)} y={H - 220} scale={0.8}>
        <Wagon wheelTurn={t * 80} />
      </Place>
      <Snow density={200} wind={5} />
      <T text="MISS IT: RACE THE WINTER" bg={C.red} />
      <Vignette strength={0.7} />
    </AbsoluteFill>
  );
};

const Miles = () => {
  const t = useT();
  return (
    <AbsoluteFill>
      <Prairie time={0.5} horizon={H} />
      <Place x={lerp(t, [0, 4.8], [700, 760], (x) => x)} y={H - 260} scale={1.0}>
        <Wagon wheelTurn={t * 50} />
      </Place>
      <Place x={lerp(t, [0, 4.8], [380, 440], (x) => x)} y={H - 50} scale={0.8}>
        <Ox step={t * 4} />
      </Place>
      <div style={{ position: "absolute", left: lerp(t, [0, 4.8], [1300, 1360], (x) => x), top: H - 330 }}>
        <Kit mood="determined" pose="walk" size={460} />
      </div>
      <T text="10-15 MILES A DAY · ON FOOT" />
      <Vignette />
    </AbsoluteFill>
  );
};

const Rivers = () => {
  const t = useT();
  return (
    <AbsoluteFill>
      <Prairie time={0.45} horizon={430} />
      <River y={500} h={580} />
      <Place x={lerp(t, [0, 4.3], [200, 700], (x) => x)} y={620}>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: 120, top: -250 }}>
            <Wagon />
          </div>
          <Raft />
        </div>
      </Place>
      <T text="THEN THE RIVERS START" />
      <Vignette />
    </AbsoluteFill>
  );
};

const Accidents = () => {
  // local 0 = 78.4. wheels (3.0) guns (4.5) rivers (6.2)
  const t = useT();
  const item = (at: number, x: number, label: string, node: React.ReactNode) => (
    <div style={{ position: "absolute", left: x, top: 340, width: 520, textAlign: "center", opacity: lerp(t, [at, at + 0.3], [0, 1]) }}>
      <div style={{ height: 380, display: "flex", alignItems: "center", justifyContent: "center" }}>{node}</div>
      <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 64, color: C.cream }}>{label}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{ backgroundColor: "#2c2219" }}>
      <T text="ACCIDENTS: THE #2 KILLER" bg={C.red} />
      {item(3.0, 100, "WHEELS", <div style={{ scale: "0.9" }}><Wagon /></div>)}
      {item(4.5, 700, "GUNS", <Rifle />)}
      {item(
        6.2,
        1300,
        "RIVERS",
        <svg width={420} height={260} viewBox="0 0 420 260">
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M20 ${70 + i * 70} q 50 -30 100 0 t 100 0 t 100 0 t 80 0`} stroke={C.riverLight} strokeWidth={22} fill="none" strokeLinecap="round" />
          ))}
        </svg>,
      )}
      <Vignette />
    </AbsoluteFill>
  );
};

const Across = () => {
  const t = useT();
  return (
    <AbsoluteFill>
      <Prairie time={0.55} horizon={H - 60} />
      <River y={H + 80} h={300} />
      <Place x={760} y={lerp(t, [0, 1.6], [520, 360])} scale={0.9}>
        <Wagon wheelTurn={t * 60} />
      </Place>
      <div style={{ position: "absolute", left: 1400, top: H - 420 }}>
        <Kit mood={t > 2.6 ? "worried" : "happy"} size={430} look={-1} />
      </div>
      {t > 2.6 ? <T text="AND THIS ISN'T WHAT KILLS YOU FIRST" size={74} /> : null}
      <Vignette />
    </AbsoluteFill>
  );
};

const Routine = () => {
  // local 0 = 94.2. yoke (3.1) noon (5.8) circle/cook (7.6) sleep (9.2)
  const t = useT();
  const time = lerp(t, [0, 3.1, 5.8, 7.6, 9.2, 10.2], [-0.1, 0.1, 0.5, 1.0, 1.3, 1.3], (x) => x);
  const night = t >= 7.6;
  const label = t < 3.1 ? "UP BEFORE LIGHT" : t < 5.8 ? "YOKE · WALK" : t < 7.6 ? "NOON · WALK" : t < 9.2 ? "CIRCLE · COOK" : "SLEEP ON THE GROUND";
  return (
    <AbsoluteFill>
      <Prairie time={Math.max(0, time)} horizon={H} />
      {night ? (
        <>
          {[0, 1, 2, 3, 4].map((i) => (
            <Place key={i} x={260 + i * 300} y={H - 330 + Math.abs(2 - i) * 40} scale={0.6}>
              <Wagon full={false} />
            </Place>
          ))}
          <Place x={830} y={H - 20}>
            <Campfire />
          </Place>
          <div style={{ position: "absolute", left: 1120, top: H - 260 }}>
            <Kit mood={t > 9.2 ? "sad" : "happy"} look={-1} size={460} />
          </div>
        </>
      ) : (
        <>
          <Place x={lerp(t, [0, 7.6], [500, 800], (x) => x)} y={H - 260}>
            <Wagon wheelTurn={t * 50} />
          </Place>
          <Place x={lerp(t, [0, 7.6], [200, 500], (x) => x)} y={H - 50} scale={0.8}>
            <Ox step={t * 5} />
          </Place>
          <div style={{ position: "absolute", left: lerp(t, [0, 7.6], [1250, 1500], (x) => x), top: H - 330 }}>
            <Kit mood={t < 3.1 ? "sad" : "determined"} pose="walk" size={460} />
          </div>
        </>
      )}
      <DayCounter day={12} />
      <T text={label} size={84} />
      <Vignette strength={night ? 0.7 : 0.5} />
    </AbsoluteFill>
  );
};

const Abandon = () => {
  // local 0 = 104.4. boots (0-3.2) furniture (3.4+) "whole lives" (10.9)
  const t = useT();
  if (t < 3.2) {
    return (
      <AbsoluteFill style={{ backgroundColor: C.prairie }}>
        <Place x={750} y={360} scale={1.3}>
          <Boot />
        </Place>
        <DayCounter day={12} />
        <T text="YOUR BOOTS ARE GOING" />
        <Vignette />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Prairie time={0.6} horizon={H - 100} />
      <div style={{ position: "absolute", inset: 0, translate: `${lerp(t, [3.2, 13.4], [0, -500], (x) => x)}px 0px` }}>
        {[
          { x: 300, el: <Dresser /> },
          { x: 760, el: <Stove /> },
          { x: 1240, el: <Dresser /> },
          { x: 1700, el: <Stove /> },
          { x: 2150, el: <Dresser /> },
        ].map((o, i) => (
          <Place key={i} x={o.x} y={H - 160 + (i % 2) * 30} scale={0.9}>
            {o.el}
          </Place>
        ))}
      </div>
      <T text={t < 10.9 ? "LEFT BEHIND: A DRESSER, A STOVE" : "WHOLE LIVES, LEFT IN THE GRASS"} size={80} />
      <Vignette />
    </AbsoluteFill>
  );
};

const Neighbour: React.FC<{ phase: "morning" | "noon" | "evening" }> = ({ phase }) => {
  const t = useT();
  const time = phase === "morning" ? 0.15 : phase === "noon" ? 0.5 : 1.02;
  return (
    <AbsoluteFill>
      <Prairie time={time} horizon={H} />
      <Place x={300} y={H - 300} scale={0.9}>
        <Wagon />
      </Place>
      {phase === "morning" ? (
        <Place x={980} y={H - 250} scale={0.9}>
          <Person pose="sit" pale={lerp(t, [0, 5], [0, 0.6])} />
        </Place>
      ) : null}
      {phase === "noon" ? (
        <Place x={950} y={H} scale={1.1}>
          <Person pose="lie" pale={0.9} />
        </Place>
      ) : null}
      {phase === "evening" ? (
        <>
          <Place x={1100} y={H - 220} scale={lerp(t, [0, 1], [0.6, 1])}>
            <Grave mound={lerp(t, [0, 1.2], [0.2, 1])} />
          </Place>
          <div style={{ position: "absolute", left: 820, top: H - 380 }}>
            <Kit mood="sad" look={1} size={480} />
          </div>
        </>
      ) : null}
      <DayCounter day={19} />
      <Vignette strength={phase === "evening" ? 0.7 : 0.45} />
    </AbsoluteFill>
  );
};

const Cholera = () => {
  // local 0 = 127.6. clock (1.5-5.1) breakfast/supper (5.7-7.6)
  const t = useT();
  if (t < 5.6) {
    return (
      <AbsoluteFill style={{ backgroundColor: "#2c2219" }}>
        <T text="CHOLERA" size={150} bg={C.red} />
        {t > 1.4 ? (
          <>
            <div style={{ position: "absolute", top: 270, left: 720 }}>
              <Clock hours={lerp(t, [1.8, 4.8], [0, 12])} size={480} />
            </div>
            <div style={{ position: "absolute", top: 780, left: 0, right: 0, textAlign: "center", fontFamily: "Bitter", fontSize: 38, color: C.cream, opacity: 0.85 }}>
              Often fatal within 12 hours of first symptoms - National Park Service
            </div>
          </>
        ) : null}
        <Vignette />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Prairie time={lerp(t, [5.6, 7.6], [0.05, 1.1], (x) => x)} horizon={H} />
      {t < 6.6 ? (
        <Place x={830} y={H - 300} scale={0.9}>
          <Person />
        </Place>
      ) : (
        <Place x={750} y={H - 260}>
          <Grave />
        </Place>
      )}
      <T text={t < 6.6 ? "HEALTHY AT BREAKFAST" : "GONE BY SUPPER"} />
      <Vignette />
    </AbsoluteFill>
  );
};

const SharedWater = () => {
  // local 0 = 135.4. "dirty water" (2.6) "same rivers" (6.2)
  const t = useT();
  return (
    <AbsoluteFill>
      <Prairie time={0.45} horizon={H - 140} />
      <River y={H - 40} h={420} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Place key={i} x={lerp(t, [0, 12], [-600 + i * 420, -250 + i * 420], (x) => x)} y={H - 360 + (i % 2) * 40} scale={0.55}>
          <Wagon wheelTurn={t * 60} />
        </Place>
      ))}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <Place key={`o${i}`} x={60 + i * 270} y={H + 120 + (i % 2) * 80} scale={0.6}>
          <Ox step={t * 6 + i} />
        </Place>
      ))}
      <T text={t < 2.6 ? "WHAT NOBODY HERE KNOWS YET" : t < 6.2 ? "CHOLERA LIVES IN DIRTY WATER" : "SAME RIVERS. SAME CAMPS. ALL SUMMER."} size={80} />
      <Vignette />
    </AbsoluteFill>
  );
};

const Answer = () => {
  // local 0 = 147.6. snakes (3.0) bandits (3.8) water (4.7)
  const t = useT();
  if (t < 3.0) return <Cup fill={0.9} />;
  if (t < 4.7) {
    const snake = t < 3.8;
    return (
      <AbsoluteFill style={{ backgroundColor: "#d8c39a", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "relative", width: 420, height: 420, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {snake ? <Snake /> : <Bandit />}
          <BigX progress={lerp(t, snake ? [3.1, 3.5] : [3.9, 4.3], [0, 1])} />
        </div>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Cup fill={0.9} />
      <div style={{ position: "absolute", left: 1420, top: 330 }}>
        <Kit mood="shocked" size={640} look={-1} />
      </div>
      <T text="THE WATER" size={140} bg={C.red} />
    </AbsoluteFill>
  );
};

const Disease = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{ backgroundColor: "#2c2219" }}>
      <T text="DISEASE: THE #1 KILLER" y={300} size={130} bg={C.red} />
      {t > 3.2 ? <T text="CHOLERA MOST OF ALL" y={560} size={96} /> : null}
      <Vignette />
    </AbsoluteFill>
  );
};

const OneInTen = () => {
  // local 0 = 157.9. NPS line (3.4)
  const t = useT();
  return (
    <AbsoluteFill style={{ backgroundColor: "#2c2219" }}>
      <T text={t < 2.0 ? "HISTORIANS ARGUE ABOUT THE TOTAL" : "NEARLY 1 IN 10 NEVER MADE IT"} size={84} />
      <div style={{ position: "absolute", top: 340, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 36 }}>
        {new Array(10).fill(0).map((_, i) => (
          <div key={i} style={{ opacity: i === 9 ? lerp(t, [3.6, 4.4], [1, 0.25]) : lerp(t, [i * 0.08, i * 0.08 + 0.3], [0, 1]) }}>
            <PersonIcon color={i === 9 && t > 3.6 ? C.red : C.cream} />
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", top: 640, left: 0, right: 0, textAlign: "center", fontFamily: "Bitter", fontSize: 40, color: C.cream, opacity: 0.8 }}>
        National Park Service estimate · other historians put it lower
      </div>
      <Vignette />
    </AbsoluteFill>
  );
};

const PerMile = () => {
  const t = useT();
  return (
    <AbsoluteFill>
      <Prairie time={0.9} horizon={H - 160} />
      {new Array(18).fill(0).map((_, i) => (
        <Place key={i} x={60 + i * 104} y={H - 140 + (i % 3) * 30} opacity={lerp(t, [i * 0.12, i * 0.12 + 0.2], [0, 1])}>
          <Marker />
        </Place>
      ))}
      <T text="10-15 DEATHS FOR EVERY MILE" size={88} />
      <div style={{ position: "absolute", top: 250, left: 0, right: 0, textAlign: "center", fontFamily: "Bitter", fontSize: 40, color: C.cream }}>
        National Park Service estimate
      </div>
      <Vignette strength={0.65} />
    </AbsoluteFill>
  );
};

const Day30 = () => {
  const t = useT();
  return (
    <AbsoluteFill>
      <Prairie time={0.95} horizon={H} />
      <Place x={340} y={H - 300}>
        <Wagon />
      </Place>
      <Place x={980} y={H - 320} scale={0.85}>
        <Person shirt={C.shirt} />
      </Place>
      <div style={{ position: "absolute", left: 1190, top: H - 400 }}>
        <Kit mood="determined" look={-1} size={480} />
      </div>
      <Place x={1460} y={H - 210} scale={0.65}>
        <Person shirt="#7a6a8f" />
      </Place>
      <DayCounter day={30} />
      <T text={t < 2.2 ? "YOU'RE ALIVE" : "300-400 MILES WALKED"} />
      <Vignette />
    </AbsoluteFill>
  );
};

const ToGo = () => {
  // local 0 = 174.1. rock (2.9) mountains (5.3) river (6.7)
  const t = useT();
  if (t < 5.3) {
    return (
      <AbsoluteFill>
        <HTrailMap progress={0.18} markers={[{ at: 0.45, label: "INDEPENDENCE ROCK" }]} />
        <T text={t < 2.9 ? "1,500+ MILES TO GO" : "THE ROCK: STILL WEEKS AHEAD"} y={70} bg={C.red} />
      </AbsoluteFill>
    );
  }
  if (t < 6.7) {
    return (
      <AbsoluteFill>
        <Prairie time={0.7} horizon={H + 60} />
        <Place x={420} y={300}>
          <Mountains />
        </Place>
        <T text="THEN THE MOUNTAINS" />
        <Vignette />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Cup fill={0.9} time={0.6} />
      <T text="AND THAT RIVER. EVERY DAY." />
    </AbsoluteFill>
  );
};

const Close = () => {
  const t = useT();
  return (
    <AbsoluteFill>
      <Cup fill={0.9} time={0.95} />
      <AbsoluteFill style={{ backgroundColor: `rgba(27,22,18,${lerp(t, [1.6, 4.2], [0, 0.7])})` }} />
      <div style={{ position: "absolute", left: 1560, top: 430 }}>
        <Kit mood={t > 1.8 ? "smirk" : "happy"} pose={t > 1.8 ? "cheer" : "stand"} size={590} talking={t > 1.8 && t < 3.2} />
      </div>
      {t > 1.8 ? <T text="WHICH LIFE NEXT?" y={420} size={150} bg={C.red} /> : null}
    </AbsoluteFill>
  );
};

export const LongVideo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.ink }}>
    <Scene name="01 Hook - cup" from={0} to={5.8}><HookCup /></Scene>
    <Scene name="02 Title - 30 days" from={5.8} to={6.5} push={0}><TitleCard /></Scene>
    <Scene name="03 Independence" from={6.5} to={12.4}><Independence /></Scene>
    <Scene name="04 Diaries" from={12.4} to={20.5}><DiaryScene /></Scene>
    <Scene name="05 Day 1" from={20.5} to={23.1} push={0.02}><Day1 /></Scene>
    <Scene name="06 Shop" from={23.1} to={35.3} push={0.04}><Shop /></Scene>
    <Scene name="07 Flour" from={35.3} to={45.3} push={0.04}><Flour /></Scene>
    <Scene name="08 Walk" from={45.3} to={51.6}><Walk /></Scene>
    <Scene name="09 Spring" from={51.6} to={58.6}><Spring /></Scene>
    <Scene name="10 Deadline" from={58.6} to={69.3}><Deadline /></Scene>
    <Scene name="11 Miles" from={69.3} to={74.1}><Miles /></Scene>
    <Scene name="12 Rivers" from={74.1} to={78.4}><Rivers /></Scene>
    <Scene name="13 Accidents" from={78.4} to={89.1} push={0.03}><Accidents /></Scene>
    <Scene name="14 Across" from={89.1} to={94.2}><Across /></Scene>
    <Scene name="15 Routine" from={94.2} to={104.4} push={0.03}><Routine /></Scene>
    <Scene name="16 Abandon" from={104.4} to={117.8}><Abandon /></Scene>
    <Scene name="17 Day 19 morning" from={117.8} to={123.4}><Neighbour phase="morning" /></Scene>
    <Scene name="18 Noon" from={123.4} to={125.3}><Neighbour phase="noon" /></Scene>
    <Scene name="19 Evening" from={125.3} to={127.6}><Neighbour phase="evening" /></Scene>
    <Scene name="20 Cholera" from={127.6} to={135.4} push={0.03}><Cholera /></Scene>
    <Scene name="21 Shared water" from={135.4} to={147.6} push={0.08}><SharedWater /></Scene>
    <Scene name="22 Answer" from={147.6} to={153.3} push={0.03}><Answer /></Scene>
    <Scene name="23 Disease" from={153.3} to={157.9} push={0.03}><Disease /></Scene>
    <Scene name="24 One in ten" from={157.9} to={164.4} push={0.03}><OneInTen /></Scene>
    <Scene name="25 Per mile" from={164.4} to={169.5}><PerMile /></Scene>
    <Scene name="26 Day 30" from={169.5} to={174.1}><Day30 /></Scene>
    <Scene name="27 To go" from={174.1} to={183.6}><ToGo /></Scene>
    <Scene name="28 Close" from={183.6} to={LONG_SECONDS} push={0.03}><Close /></Scene>
    <Captions segments={words} y={905} size={64} maxWords={6} side={220} />
    <Audio src={staticFile("audio/long-oregon-trail.mp3")} />
  </AbsoluteFill>
);
