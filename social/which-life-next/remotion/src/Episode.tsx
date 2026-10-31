import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Kit, KitProps } from "./kit/Kit";
import { Barn, HORIZON, Prairie, Rope, Schoolhouse, Sky, Snow, SodHouse, SodInterior, StormFront, TownStreet, Wagon } from "./sets/sets";
import { Cornfield, Hopperdozer, LocustCarpet, Mountains, Swarm } from "./sets/plains";
import { fonts, palette, TimeOfDay } from "./theme";

export type Element =
  | { type: "sodhouse"; x: number; y?: number; scale?: number; lit?: boolean; smoke?: boolean }
  | { type: "barn"; x: number; y?: number; scale?: number }
  | { type: "wagon"; x: number; y?: number; scale?: number; moving?: boolean; driveTo?: number; oxen?: boolean }
  | { type: "schoolhouse"; x: number; y?: number; scale?: number; lit?: boolean }
  | { type: "rope"; x1: number; y1: number; x2: number; y2: number }
  | { type: "stormfront"; from?: number; to?: number }
  | { type: "person"; x: number; y?: number; scale?: number; kit: KitProps; walkTo?: number }
  | { type: "cornfield"; x: number; y?: number; width?: number; rows?: number; scale?: number; eaten?: [number, number] }
  | { type: "hopperdozer"; x: number; y?: number; scale?: number; driveTo?: number }
  | { type: "locusts"; density?: number };

export type Shot = {
  kind: "landscape" | "interior" | "town" | "card" | "mountains";
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
  kit?: KitProps & { x: number; y?: number; scale?: number; walkTo?: number };
  camera?: { zoom?: [number, number]; pan?: [number, number]; panY?: [number, number] };
  tint?: "cold" | "warm" | "night" | "fire" | null;
  interior?: { stormOutside?: boolean; night?: boolean; drip?: boolean };
  card?: { title: string[]; subtitle?: string; background?: Omit<Shot, "card" | "durationInFrames" | "kind"> & { kind?: Shot["kind"] } };
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

const World: React.FC<{ shot: Shot; dur: number }> = ({ shot, dur }) => {
  const frame = useCurrentFrame();
  const t = Math.min(1, frame / Math.max(1, dur));
  const snow = shot.snow ?? 0;
  if (shot.kind === "interior") {
    return (
      <>
        <SodInterior {...shot.interior} />
        {shot.kit && <PlacedKit k={shot.kit} t={t} />}
        {(shot.elements ?? []).filter((e) => e.type === "person").map((e, i) => <PlacedPerson key={i} e={e as Extract<Element, { type: "person" }>} t={t} />)}
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

const PlacedKit: React.FC<{ k: NonNullable<Shot["kit"]>; t: number }> = ({ k, t }) => {
  const x = k.walkTo !== undefined ? interpolate(t, [0, 1], [k.x, k.walkTo]) : k.x;
  return (
    <g transform={`translate(${x} ${k.y ?? HORIZON + 300}) scale(${k.scale ?? 1})`}>
      <Kit {...k} />
    </g>
  );
};

const PlacedPerson: React.FC<{ e: Extract<Element, { type: "person" }>; t: number }> = ({ e, t }) => {
  const x = e.walkTo !== undefined ? interpolate(t, [0, 1], [e.x, e.walkTo]) : e.x;
  return (
    <g transform={`translate(${x} ${e.y ?? HORIZON + 260}) scale(${e.scale ?? 0.8})`}>
      <Kit {...e.kit} />
    </g>
  );
};

export const ShotView: React.FC<{ shot: Shot; narrow?: boolean }> = ({ shot, narrow = false }) => {
  const frame = useCurrentFrame();
  const dur = shot.durationInFrames;
  const fade = Math.min(8, dur / 4);
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
          {shot.card.title.map((line, i) => (
            <div key={i} style={{
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
  return (
    <AbsoluteFill style={{ opacity, backgroundColor: palette.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{
        scale: interpolate(frame, [0, dur], [z0, z1]),
        translate: interpolate(frame, [0, dur], [`${p0}px ${q0}px`, `${p1}px ${q1}px`]),
      }}>
        <svg viewBox="0 0 1920 1080" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
          <World shot={shot} dur={dur} />
        </svg>
      </AbsoluteFill>
      {tint && <AbsoluteFill style={{ backgroundColor: tint.color, opacity: tint.opacity, mixBlendMode: tint.blend }} />}
      {/* soft vignette for the painted-documentary look */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)" }} />
    </AbsoluteFill>
  );
};

const CaptionLayer: React.FC<{ captions: Caption[]; vertical?: boolean }> = ({ captions, vertical }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const c = captions.find((x) => t >= x.start && t < x.end);
  if (!c) return null;
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: vertical ? 520 : 70 }}>
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
      {narration && <Audio src={staticFile(narration)} />}
      {wind && <Audio src={staticFile(wind)} volume={windVolume} />}
      {showCaptions && <CaptionLayer captions={captions} />}
    </AbsoluteFill>
  );
};

export const episodeDuration = (p: EpisodeProps) => p.shots.reduce((a, s) => a + s.durationInFrames, 0);

/** Vertical 1080x1920 Short: a window of the episode reframed, hook text on top, captions mid-low. */
export type ShortProps = EpisodeProps & { startFrame: number; durationInFrames: number; hook: string[] };

export const Short: React.FC<ShortProps> = ({ startFrame, hook, captions, ...rest }) => {
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
      <CaptionLayer captions={shifted} vertical />
    </AbsoluteFill>
  );
};
