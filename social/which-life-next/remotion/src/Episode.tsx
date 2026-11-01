import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Kit, KitProps } from "./kit/Kit";
import { Barn, HORIZON, Prairie, Rope, Schoolhouse, Sky, Snow, SodHouse, SodInterior, StormFront, TownStreet, Wagon } from "./sets/sets";
import { Cornfield, Hopperdozer, LocustCarpet, Mountains, Swarm } from "./sets/plains";
import { MapProps, MapView } from "./sets/map";
import { Bell, Callout, Callouts, Counter, Fleeing, Handshake, Rag, Ratio } from "./sets/info";
import { StoneBridge, Swimmers } from "./sets/stories";
import { Boulder, Cave, CityStreet, Crowd, Dam, DeadCart, FloodWave, GiantMosquito, Lightning, Locomotive, NightSky, RailBridge, Rain, River, Shaft } from "./sets/stories";
import { fonts, palette, TimeOfDay } from "./theme";

export type Element =
  | { type: "sodhouse"; x: number; y?: number; scale?: number; lit?: boolean; smoke?: boolean }
  | { type: "barn"; x: number; y?: number; scale?: number }
  | { type: "wagon"; x: number; y?: number; scale?: number; moving?: boolean; driveTo?: number; oxen?: boolean }
  | { type: "schoolhouse"; x: number; y?: number; scale?: number; lit?: boolean }
  | { type: "rope"; x1: number; y1: number; x2: number; y2: number }
  | { type: "stormfront"; from?: number; to?: number }
  | { type: "person"; x: number; y?: number; scale?: number; kit: KitProps; walkTo?: number; rotate?: number }
  | { type: "cornfield"; x: number; y?: number; width?: number; rows?: number; scale?: number; eaten?: [number, number] }
  | { type: "hopperdozer"; x: number; y?: number; scale?: number; driveTo?: number }
  | { type: "locusts"; density?: number }
  | { type: "river"; level?: number; flood?: boolean }
  | { type: "railbridge"; y?: number; gap?: [number, number] | null; steel?: boolean }
  | { type: "locomotive"; x: number; y?: number; scale?: number; light?: boolean; tilt?: number; driveTo?: number }
  | { type: "floodwave"; front: [number, number]; height?: number }
  | { type: "dam"; breach?: [number, number] }
  | { type: "deadcart"; x: number; y?: number; scale?: number; driveTo?: number }
  | { type: "mosquito"; x: number; y: number; scale?: number; driveTo?: number }
  | { type: "boulder"; x: number; y: number; scale?: number }
  | { type: "crowd"; y?: number; density?: number }
  | { type: "bank"; x0: number; x1: number; y: number; color?: string }
  | { type: "fleeing"; n?: number }
  | { type: "stonebridge"; x?: number; y?: number; scale?: number; debris?: boolean; fire?: boolean }
  | { type: "swimmers"; at: [number, number][] }
  | { type: "bell"; x: number; y: number; scale?: number; stopped?: boolean }
  | { type: "rag"; x: number; y: number; scale?: number };

export type BoardEntry = { label: string; tier: number };

export type Shot = {
  kind: "landscape" | "interior" | "town" | "card" | "mountains" | "board" | "set" | "map" | "info";
  /** kind "map": real-geography globe → zoom (see sets/map.tsx) */
  map?: MapProps;
  /** kind "info": mute-proof explainers */
  info?: { type: "counter"; value: number; label: string; sub?: string; perIcon?: number; color?: string; prefix?: string; suffix?: string } | { type: "handshake"; label?: string } | { type: "ratio"; n: number; k?: number; label: string };
  /** arrow callouts naming real things (world coords) */
  labels?: Callout[];
  /** For kind "set": the base scene drawn before elements. */
  base?: "night" | "stormnight" | "city" | "citynight" | "cave" | "caveoff" | "cavelamp" | "shaft" | "sky" | "town";
  /** rain overlay 0..1 and lightning flashes */
  rain?: number;
  lightning?: boolean;
  /** cave collapse 0..1 over the shot; rescue shaft depth [from,to] */
  collapse?: [number, number];
  shaft?: [number, number];
  durationInFrames: number;
  time?: TimeOfDay;
  /** 0..1 how snow-covered the ground is */
  snow?: number;
  /** 0..1 falling snow */
  weather?: number;
  wind?: number;
  /** flying locust swarm intensity 0..1, or [from, to] over the shot */
  swarm?: number | [number, number];
  green?: boolean;
  elements?: Element[];
  kit?: KitProps & { x: number; y?: number; scale?: number; walkTo?: number; rotate?: number };
  camera?: { zoom?: [number, number]; pan?: [number, number]; panY?: [number, number] };
  tint?: "cold" | "warm" | "night" | "fire" | null;
  interior?: { stormOutside?: boolean; night?: boolean; drip?: boolean };
  card?: { title: string[]; subtitle?: string; big?: string; style?: "hook"; background?: Omit<Shot, "card" | "durationInFrames" | "kind"> & { kind?: Shot["kind"] } };
  /** Pop-up danger word (1–2 words) with a shake, e.g. "CHOLERA". */
  keyword?: string;
  /** When the keyword pops, as a fraction of the shot (default 0.1). */
  keywordAt?: number;
  /** Survival-time chip shown for the whole shot, e.g. "3 DAYS". */
  timer?: string;
  /** Label before the timer value (default "SURVIVAL TIME"). */
  timerLabel?: string;
  /** Auto fast-cutting into 2–3 s beats (default on for shots > 3.5 s). */
  cuts?: boolean;
  /** "HOW LONG WOULD YOU LAST?" scoreboard; the last entry animates in. */
  board?: { title?: string; entries: BoardEntry[] };
};

export type Caption = { start: number; end: number; text: string };

export type EpisodeProps = {
  shots: Shot[];
  captions: Caption[];
  narration?: string;
  wind?: string;
  windVolume?: number;
  showCaptions?: boolean;
  /** Render title cards for a vertical (Short) crop. */
  narrow?: boolean;
};

const tints: Record<string, { color: string; opacity: number; blend: React.CSSProperties["mixBlendMode"] }> = {
  cold: { color: "#5f86b8", opacity: 0.22, blend: "multiply" },
  night: { color: "#0d1a36", opacity: 0.45, blend: "multiply" },
  warm: { color: "#ffb766", opacity: 0.16, blend: "soft-light" },
  fire: { color: "#ff6a1a", opacity: 0.32, blend: "overlay" },
};

let narrowCtx = false;
const World: React.FC<{ shot: Shot; dur: number }> = ({ shot, dur }) => {
  const frame = useCurrentFrame();
  const t = Math.min(1, frame / Math.max(1, dur));
  const snow = shot.snow ?? 0;
  if (shot.kind === "interior") {
    return (
      <>
        <SodInterior {...shot.interior} />
        {shot.kit && <PlacedKit k={shot.kit} t={t} />}
        {(shot.elements ?? []).map((e, i) => <StoryElement key={i} e={e} t={t} snow={0} />)}
      </>
    );
  }
  if (shot.kind === "map" && shot.map) return <MapView {...shot.map} dur={dur} narrow={narrowCtx} />;
  if (shot.kind === "info" && shot.info) {
    const i = shot.info;
    if (i.type === "counter") return <Counter {...i} dur={dur} narrow={narrowCtx} />;
    if (i.type === "ratio") return <Ratio n={i.n} k={i.k} label={i.label} narrow={narrowCtx} />;
    return <Handshake label={i.label} dur={dur} narrow={narrowCtx} />;
  }
  if (shot.kind === "set") {
    const b = shot.base ?? "sky";
    return (
      <>
        {b === "night" && <NightSky />}
        {b === "stormnight" && <NightSky storm />}
        {(b === "city" || b === "citynight") && <><Sky time={b === "citynight" ? "night" : shot.time ?? "day"} /><CityStreet night={b === "citynight"} shuttered={b === "city" && (shot.snow ?? 0) > 0} /></>}
        {(b === "cave" || b === "caveoff" || b === "cavelamp") && <Cave lamp={b === "cavelamp"} bulb={b === "cave" ? true : b === "caveoff" ? "off" : false}
          collapse={shot.collapse ? interpolate(t, [0, 1], shot.collapse) : 0} />}
        {b === "shaft" && <Shaft progress={shot.shaft ? interpolate(t, [0, 1], shot.shaft) : 0.5} />}
        {b === "sky" && <Sky time={shot.time ?? "day"} />}
        {b === "town" && <><Sky time={shot.time ?? "storm"} /><TownStreet snowy={0} /></>}
        {(shot.elements ?? []).map((e, i) => <StoryElement key={i} e={e} t={t} snow={snow} />)}
        {shot.kit && <PlacedKit k={shot.kit} t={t} />}
        {(shot.rain ?? 0) > 0 && <Rain intensity={shot.rain} />}
        {shot.lightning && <Lightning />}
        {shot.swarm !== undefined && <Swarm intensity={Array.isArray(shot.swarm) ? interpolate(t, [0, 1], shot.swarm) : shot.swarm} count={260} />}
      </>
    );
  }
  return (
    <>
      <Sky time={shot.time ?? "day"} />
      {(shot.elements ?? []).filter((e) => e.type === "stormfront").map((e, i) => {
        const s = e as Extract<Element, { type: "stormfront" }>;
        return <StormFront key={i} progress={interpolate(t, [0, 1], [s.from ?? 0, s.to ?? 0.6])} />;
      })}
      {shot.kind === "town" ? <TownStreet snowy={snow} /> : shot.kind === "mountains" ? <Mountains /> : <Prairie snowy={snow} green={shot.green} />}
      {(shot.elements ?? []).map((e, i) => {
        const y = "y" in e && e.y !== undefined ? e.y : HORIZON + 160;
        switch (e.type) {
          case "sodhouse":
            return <SodHouse key={i} x={e.x} y={y} scale={e.scale} snowy={snow} lit={e.lit} smoke={e.smoke ?? true} />;
          case "barn":
            return <Barn key={i} x={e.x} y={y} scale={e.scale} snowy={snow} />;
          case "schoolhouse":
            return <Schoolhouse key={i} x={e.x} y={y} scale={e.scale} snowy={snow} lit={e.lit} />;
          case "wagon":
            return <Wagon key={i} x={e.driveTo !== undefined ? interpolate(t, [0, 1], [e.x, e.driveTo]) : e.x} y={y} scale={e.scale} moving={e.moving} oxen={e.oxen} />;
          case "rope":
            return <Rope key={i} {...e} />;
          case "person":
            return <PlacedPerson key={i} e={e} t={t} />;
          case "cornfield":
            return <Cornfield key={i} x={e.x} y={e.y} width={e.width} rows={e.rows} scale={e.scale} eaten={e.eaten ? interpolate(t, [0, 1], e.eaten) : 0} />;
          case "hopperdozer":
            return <Hopperdozer key={i} x={e.driveTo !== undefined ? interpolate(t, [0, 1], [e.x, e.driveTo]) : e.x} y={e.y} scale={e.scale} />;
          case "locusts":
            return <LocustCarpet key={i} density={e.density} />;
          default:
            return null;
        }
      })}
      {shot.kit && <PlacedKit k={shot.kit} t={t} />}
      {(shot.weather ?? 0) > 0 && <Snow intensity={shot.weather ?? 0} wind={shot.wind ?? 1} />}
      {shot.swarm !== undefined && <Swarm intensity={Array.isArray(shot.swarm) ? interpolate(t, [0, 1], shot.swarm) : shot.swarm} />}
    </>
  );
};

const StoryElement: React.FC<{ e: Element; t: number; snow: number }> = ({ e, t, snow }) => {
  const mv = (x: number, to?: number) => (to !== undefined ? interpolate(t, [0, 1], [x, to]) : x);
  switch (e.type) {
    case "river": return <River level={e.level} flood={e.flood} />;
    case "railbridge": return <RailBridge y={e.y} gap={e.gap ?? null} steel={e.steel} />;
    case "locomotive": return <Locomotive x={mv(e.x, e.driveTo)} y={e.y ?? HORIZON + 30} scale={e.scale} light={e.light} tilt={e.tilt} />;
    case "floodwave": return <FloodWave front={interpolate(t, [0, 1], e.front)} height={e.height} />;
    case "dam": return <Dam breach={e.breach ? interpolate(t, [0, 1], e.breach) : 0} />;
    case "deadcart": return <DeadCart x={mv(e.x, e.driveTo)} y={e.y} scale={e.scale} />;
    case "mosquito": return <GiantMosquito x={mv(e.x, e.driveTo)} y={e.y} scale={e.scale} />;
    case "boulder": return <Boulder x={e.x} y={e.y} scale={e.scale} />;
    case "crowd": return <Crowd y={e.y} density={e.density} />;
    case "fleeing": return <Fleeing n={e.n} t={t} />;
    case "stonebridge": return <StoneBridge x={e.x} y={e.y} scale={e.scale} debris={e.debris} fire={e.fire} />;
    case "swimmers": return <Swimmers at={e.at} />;
    case "bell": return <Bell x={e.x} y={e.y} scale={e.scale} stopped={e.stopped} />;
    case "rag": return <Rag x={e.x} y={e.y} scale={e.scale} />;
    case "bank": return <path d={`M ${e.x0} ${e.y} Q ${(e.x0 + e.x1) / 2} ${e.y - 30} ${e.x1} ${e.y + 10} L ${e.x1} 1300 L ${e.x0} 1300 Z`} fill={e.color ?? "#3f4a2c"} stroke="#2b1d14" strokeWidth={5} />;
    case "person": return <PlacedPerson e={e} t={t} />;
    case "sodhouse": return <SodHouse x={e.x} y={e.y ?? HORIZON + 160} scale={e.scale} snowy={snow} lit={e.lit} smoke={e.smoke ?? true} />;
    case "wagon": return <Wagon x={mv(e.x, e.driveTo)} y={e.y ?? HORIZON + 160} scale={e.scale} moving={e.moving} oxen={e.oxen} />;
    case "rope": return <Rope {...e} />;
    default: return null;
  }
};

const PlacedKit: React.FC<{ k: NonNullable<Shot["kit"]>; t: number }> = ({ k, t }) => {
  const x = k.walkTo !== undefined ? interpolate(t, [0, 1], [k.x, k.walkTo]) : k.x;
  return (
    <g transform={`translate(${x} ${k.y ?? HORIZON + 300}) rotate(${k.rotate ?? 0}) scale(${k.scale ?? 1})`}>
      <Kit {...k} />
    </g>
  );
};

const PlacedPerson: React.FC<{ e: Extract<Element, { type: "person" }>; t: number }> = ({ e, t }) => {
  const x = e.walkTo !== undefined ? interpolate(t, [0, 1], [e.x, e.walkTo]) : e.x;
  return (
    <g transform={`translate(${x} ${e.y ?? HORIZON + 260}) rotate(${e.rotate ?? 0}) scale(${e.scale ?? 0.8})`}>
      <Kit {...e.kit} />
    </g>
  );
};


export const TIERS = ["WHOLE LIFE", "YEARS", "MONTHS", "DAYS", "HOURS", "MINUTES"];
const TIER_COLORS = ["#3fae55", "#8cc63f", "#e2c33a", "#f08a2c", "#e4512c", "#c62828"];

/** Recurring survival scoreboard (competitor research: every top "how long would you last" video has one). */
const Board: React.FC<{ board: NonNullable<Shot["board"]>; dur: number; narrow?: boolean }> = ({ board, dur, narrow }) => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [0, 6, dur - 6, dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rowH = narrow ? 118 : 128;
  const left = narrow ? 470 : 140;
  const width = narrow ? 980 : 1640;
  const last = board.entries.length - 1;
  return (
    <AbsoluteFill style={{ opacity: fade, background: "radial-gradient(ellipse at center, #2a221a 0%, #120d09 100%)" }}>
      <div style={{ position: "absolute", top: narrow ? 110 : 40, width: "100%", textAlign: "center", fontFamily: fonts.sans, fontWeight: 900, fontSize: narrow ? 56 : 72, color: "#fff", textShadow: "0 4px 0 #000, 0 0 18px #000", letterSpacing: 1 }}>
        {board.title ?? "HOW LONG WOULD YOU LAST?"}
      </div>
      {TIERS.map((t, i) => {
        const top = (narrow ? 210 : 150) + i * rowH;
        const inRow = board.entries.map((e, j) => ({ ...e, j })).filter((e) => e.tier === i);
        return (
          <div key={t} style={{ position: "absolute", top, left, width, height: rowH - 14, display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: narrow ? 250 : 300, height: "100%", borderRadius: 14, background: TIER_COLORS[i], border: "5px solid #000", display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: fonts.sans, fontWeight: 900, fontSize: narrow ? 30 : 38, color: "#fff", textShadow: "0 3px 0 #000" }}>{t}</div>
            {inRow.map((e) => {
              const isNew = e.j === last;
              const pop = isNew ? interpolate(frame, [12, 22, 26], [0, 1.15, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
              return (
                <div key={e.j} style={{ scale: String(pop), padding: "0 26px", height: "86%", borderRadius: 12, background: isNew ? "#fff3c4" : "#f4ead8", border: `5px solid ${isNew ? TIER_COLORS[i] : "#000"}`,
                  display: "flex", alignItems: "center", fontFamily: fonts.sans, fontWeight: 900, fontSize: narrow ? 30 : 36, color: "#1d1712", boxShadow: isNew ? `0 0 24px ${TIER_COLORS[i]}` : "none" }}>{e.label}</div>
              );
            })}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** Pop-up danger word with a shake. */
const Keyword: React.FC<{ text: string; start: number; narrow?: boolean }> = ({ text, start, narrow }) => {
  const frame = useCurrentFrame() - start;
  if (frame < 0 || frame > 54) return null;
  const s = interpolate(frame, [0, 5, 9], [2.2, 0.92, 1], { extrapolateRight: "clamp" });
  const o = interpolate(frame, [0, 3, 44, 54], [0, 1, 1, 0], { extrapolateRight: "clamp" });
  const shake = frame < 14 ? Math.sin(frame * 2.7) * (14 - frame) * 1.2 : 0;
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: narrow ? 300 : 120, opacity: o }}>
      <div style={{ scale: String(s), translate: `${shake}px 0px`, rotate: "-4deg", fontFamily: fonts.sans, fontWeight: 900, fontSize: Math.min(narrow ? 120 : 150, (narrow ? 860 : 1650) / (text.length * 0.8)), color: "#ffd23f",
        WebkitTextStroke: "10px #000", paintOrder: "stroke fill", textShadow: "0 10px 0 #000, 0 0 40px rgba(255,80,30,0.7)", letterSpacing: 2 }}>{text}</div>
    </AbsoluteFill>
  );
};

/** Survival-time chip (top right). */
const Timer: React.FC<{ text: string; narrow?: boolean; label?: string }> = ({ text, narrow, label = "SURVIVAL TIME" }) => {
  const frame = useCurrentFrame();
  const pulse = 1 + Math.max(0, Math.sin(frame * 0.25)) * 0.04;
  return (
    <AbsoluteFill style={{ alignItems: "flex-end", padding: narrow ? "450px 450px 0 0" : "36px 40px 0 0" }}>
      <div style={{ scale: String(pulse), display: "flex", alignItems: "center", gap: 14, padding: "12px 24px", borderRadius: 16, background: "rgba(16,10,6,0.82)", border: "4px solid #e4512c",
        fontFamily: fonts.sans, fontWeight: 900, fontSize: narrow ? 34 : 40, color: "#fff" }}>
        <span style={{ fontSize: narrow ? 26 : 30, color: "#ffb08a" }}>{label}</span>{text}
      </div>
    </AbsoluteFill>
  );
};

/** Film grain + paper texture so flat vector art reads as painted. */
const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = frame % 6;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "overlay", opacity: 0.16 }}>
      <svg width="100%" height="100%">
        <filter id={`grain${seed}`}><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={seed} /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width="100%" height="100%" filter={`url(#grain${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

/** Camera for one beat of an auto-cut shot: wide (shot's own camera), Kit close-up, medium, pan. */
function beatCamera(shot: Shot, beat: number, local: number, tShot = 0): { z: number; tx: number; ty: number } | null {
  if (beat === 0) return null;
  const k = shot.kit;
  const cycle = beat % 3;
  let px = 960, py = 540, z = 1.35;
  if (k) {
    const sc = k.scale ?? 1;
    const kx = k.walkTo !== undefined ? k.x + (k.walkTo - k.x) * tShot : k.x, ky = (k.y ?? HORIZON + 300) - 330 * sc;
    if (cycle === 1) { z = Math.min(3.0, 3.2 / Math.max(0.6, sc)); px = kx; py = ky; }
    else if (cycle === 2) { z = 1.6; px = (kx + 960) / 2; py = (ky + 540) / 2 + 60; }
    else { z = 1.3; px = 960 + (beat % 2 ? -220 : 220); py = 520; }
  } else {
    px = cycle === 1 ? 640 : cycle === 2 ? 1280 : 960; z = cycle === 0 ? 1.25 : 1.45;
  }
  z = z * (1 + 0.05 * local);
  let tx = z * (960 - px), ty = z * (540 - py);
  const mx = (z - 1) * 960, my = (z - 1) * 540;
  tx = Math.max(-mx, Math.min(mx, tx)); ty = Math.max(-my, Math.min(my, ty));
  return { z, tx, ty };
}
const BEAT = 75; // 2.5 s at 30 fps

export const ShotView: React.FC<{ shot: Shot; narrow?: boolean }> = ({ shot, narrow = false }) => {
  const frame = useCurrentFrame();
  const dur = shot.durationInFrames;
  const fade = Math.min(4, dur / 4);
  if (shot.kind === "board" && shot.board) return <Board board={shot.board} dur={dur} narrow={narrow} />;
  const opacity = interpolate(frame, [0, fade, dur - fade, dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (shot.kind === "card" && shot.card) {
    const bg = shot.card.background;
    return (
      <AbsoluteFill style={{ opacity, backgroundColor: palette.ink }}>
        {bg && (
          <AbsoluteFill style={{ filter: "blur(14px) brightness(0.35)", scale: interpolate(frame, [0, dur], [1.05, 1.12]) }}>
            <svg viewBox="0 0 1920 1080" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
              <World shot={{ ...bg, kind: bg.kind ?? "landscape", durationInFrames: dur } as Shot} dur={dur} />
            </svg>
          </AbsoluteFill>
        )}
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 24, padding: narrow ? "0 450px" : "0 120px" }}>
          {shot.card.big && (
            <div style={{ fontFamily: fonts.sans, fontWeight: 900, fontSize: narrow ? 200 : 280, lineHeight: 1, color: "#ffd23f",
              WebkitTextStroke: "10px #1a120c", paintOrder: "stroke fill", textShadow: "0 8px 0 #7a3e12, 0 16px 0 #1a120c, 0 0 60px rgba(255,170,60,0.55)",
              scale: String(interpolate(frame, [0, 10, 16], [1.6, 0.95, 1], { extrapolateRight: "clamp" })) }}>{shot.card.big}</div>
          )}
          {shot.card.title.map((line, i) => (
            <div key={i} style={shot.card!.style === "hook" ? {
              fontFamily: fonts.sans, fontWeight: 900, fontSize: narrow ? 96 : 150, color: i % 2 ? "#ffd23f" : "#fff", textAlign: "center", lineHeight: 1.05,
              WebkitTextStroke: "10px #000", paintOrder: "stroke fill", textShadow: "0 10px 0 #000",
              scale: String(interpolate(frame, [i * 5, i * 5 + 6, i * 5 + 10], [1.8, 0.94, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })),
              opacity: interpolate(frame, [i * 5, i * 5 + 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            } : {
              fontFamily: fonts.serif, fontWeight: 700, fontSize: narrow ? 78 : 112, color: palette.paper, letterSpacing: 2, textAlign: "center", lineHeight: 1.1,
              opacity: interpolate(frame, [6 + i * 6, 18 + i * 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              translate: interpolate(frame, [6 + i * 6, 18 + i * 6], ["0px 24px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            }}>{line}</div>
          ))}
          {shot.card.subtitle && (
            <div style={{ fontFamily: fonts.sans, fontWeight: 700, fontSize: narrow ? 36 : 44, color: palette.gold, letterSpacing: 1.5, textAlign: "center", padding: narrow ? 0 : "0 160px",
              opacity: interpolate(frame, [22, 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
              {shot.card.subtitle}
            </div>
          )}
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }
  const cam = shot.camera ?? {};
  const [z0, z1] = cam.zoom ?? [1.0, 1.08];
  const [p0, p1] = cam.pan ?? [0, 0];
  const [q0, q1] = cam.panY ?? [0, 0];
  const tint = shot.tint ? tints[shot.tint] : null;
  narrowCtx = narrow;
  const autoCut = (shot.cuts ?? !["map", "info"].includes(shot.kind)) && dur > 105;
  const nBeats = autoCut ? Math.max(1, Math.round(dur / BEAT)) : 1;
  const beatLen = dur / nBeats;
  const beat = Math.min(nBeats - 1, Math.floor(frame / beatLen));
  const bc = autoCut ? beatCamera(shot, beat, (frame - beat * beatLen) / beatLen, Math.min(1, frame / dur)) : null;
  const scale = bc ? bc.z : interpolate(frame, [0, dur], [z0, z1]);
  const translate = bc ? `${bc.tx}px ${bc.ty}px` : interpolate(frame, [0, dur], [`${p0}px ${q0}px`, `${p1}px ${q1}px`]);
  return (
    <AbsoluteFill style={{ opacity, backgroundColor: palette.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ scale: String(scale), translate }}>
        <svg viewBox="0 0 1920 1080" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
          <World shot={shot} dur={dur} />
          {shot.labels && <Callouts items={shot.labels} t={Math.min(1, frame / dur)} narrow={narrow} />}
        </svg>
      </AbsoluteFill>
      {tint && <AbsoluteFill style={{ backgroundColor: tint.color, opacity: tint.opacity, mixBlendMode: tint.blend }} />}
      {/* soft vignette for the painted-documentary look */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)" }} />
      {shot.timer && <Timer text={shot.timer} narrow={narrow} label={shot.timerLabel} />}
      {shot.keyword && <Keyword text={shot.keyword} start={Math.round((shot.keywordAt ?? 0.1) * dur)} narrow={narrow} />}
    </AbsoluteFill>
  );
};

const CaptionLayer: React.FC<{ captions: Caption[]; vertical?: boolean; bottomPad?: number }> = ({ captions, vertical, bottomPad }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const c = captions.find((x) => t >= x.start && t < x.end);
  if (!c) return null;
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: bottomPad ?? (vertical ? 520 : 70) }}>
      <div style={{
        fontFamily: fonts.sans, fontWeight: 700, fontSize: vertical ? 70 : 58, color: "#fff", textAlign: "center", maxWidth: vertical ? 900 : 1600,
        padding: "0 40px", lineHeight: 1.2, WebkitTextStroke: "0px", textShadow: "0 0 8px #000, 0 3px 6px #000, 0 0 2px #000",
      }}>{c.text}</div>
    </AbsoluteFill>
  );
};

export const Episode: React.FC<EpisodeProps> = ({ shots, captions, narration, wind, windVolume = 0.12, showCaptions = true, narrow = false }) => {
  let from = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: palette.ink }}>
      {shots.map((s, i) => {
        const seq = (
          <Sequence key={i} from={from} durationInFrames={s.durationInFrames} name={`${i} ${s.kind}${s.card ? " " + s.card.title[0] : ""}`}>
            <ShotView shot={s} narrow={narrow} />
          </Sequence>
        );
        from += s.durationInFrames;
        return seq;
      })}
      <Grain />
      {narration && <Audio src={staticFile(narration)} />}
      {wind && <Audio src={staticFile(wind)} volume={windVolume} />}
      {showCaptions && <CaptionLayer captions={captions} />}
    </AbsoluteFill>
  );
};

export const episodeDuration = (p: EpisodeProps) => p.shots.reduce((a, s) => a + s.durationInFrames, 0);

/** Vertical 1080x1920 Short: a window of the episode reframed, hook text on top, captions mid-low. */
export type ShortProps = EpisodeProps & { startFrame: number; durationInFrames: number; hook: string[];
  /** Standalone story Shorts: keep the title in the top bar for the whole Short, captions in the bottom bar. */
  title?: string[]; titleFrom?: number };

export const Short: React.FC<ShortProps> = ({ startFrame, hook, captions, title, titleFrom = 0, ...rest }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shifted = captions.map((c) => ({ ...c, start: c.start - startFrame / fps, end: c.end - startFrame / fps }));
  return (
    <AbsoluteFill style={{ backgroundColor: palette.ink }}>
      <Sequence from={-startFrame}>
        <AbsoluteFill style={{ width: 1920, height: 1080, top: 420, left: -420, scale: 1.0 }}>
          <Episode {...rest} captions={[]} showCaptions={false} narrow />
        </AbsoluteFill>
      </Sequence>
      <AbsoluteFill style={{ top: 0, height: 420, backgroundColor: palette.ink }} />
      <AbsoluteFill style={{ top: 1500, height: 420, backgroundColor: palette.ink }} />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 150, opacity: interpolate(frame, [0, 6, 4.5 * fps, 5 * fps], [0, 1, 1, 0.0], { extrapolateRight: "clamp" }) }}>
        {hook.map((h, i) => (
          <div key={i} style={{ fontFamily: fonts.sans, fontWeight: 800, fontSize: 78, color: i === 0 ? "#ffd640" : "#fff", textShadow: "0 0 10px #000, 0 4px 8px #000", textAlign: "center" }}>{h}</div>
        ))}
      </AbsoluteFill>
      {title && frame >= titleFrom && (
        <AbsoluteFill style={{ height: 420, justifyContent: "center", alignItems: "center", padding: "40px 50px 0",
          opacity: interpolate(frame, [titleFrom, titleFrom + 8], [0, 1], { extrapolateRight: "clamp" }) }}>
          {title.map((h, i) => (
            <div key={i} style={{ fontFamily: fonts.sans, fontWeight: 900, fontSize: 74, lineHeight: 1.08, color: i % 2 ? "#ffd23f" : "#fff",
              WebkitTextStroke: "8px #000", paintOrder: "stroke fill", textAlign: "center" }}>{h}</div>
          ))}
        </AbsoluteFill>
      )}
      {title ? (
        <AbsoluteFill style={{ top: 1500, height: 420 }}><CaptionLayer captions={shifted} vertical bottomPad={170} /></AbsoluteFill>
      ) : (
        <CaptionLayer captions={shifted} vertical />
      )}
    </AbsoluteFill>
  );
};
