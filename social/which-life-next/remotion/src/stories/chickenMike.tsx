import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { geoAlbers, geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";
import worldTopo from "world-atlas/countries-50m.json";
import statesTopo from "us-atlas/states-10m.json";
import { fonts } from "../theme";
import { SceneHeadless, SceneQuestion, SceneAxe, SceneRise, SceneAnatomy, SceneBody, SceneFeed, SceneName, SceneLife, SceneMotel, SceneSyringe } from "../sets/chickenScenes";

/**
 * The Ghost Army (WWII) — voiced map Short, Pony Express style, 45–60 s.
 * Cues are timed to the narration's word timestamps (ghost-words.json).
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
type LL = [number, number];
type Word = { w: string; s: number; e: number };

// ---------- ground scenes ----------
type SceneDef = { from: number; to: number; el: (p: { lt: number; dur: number; frame: number }) => React.ReactNode };
export const MIKE_END = 54.9;
const SCENES: SceneDef[] = [
  { from: 0, to: 5.4, el: (p) => <SceneHeadless {...p} /> },
  { from: 5.4, to: 9.6, el: (p) => <SceneQuestion {...p} /> },
  { from: 12.4, to: 16.4, el: (p) => <SceneAxe {...p} /> },
  { from: 16.4, to: 20.4, el: (p) => <SceneRise {...p} /> },
  { from: 20.4, to: 24.4, el: (p) => <SceneAnatomy {...p} /> },
  { from: 24.4, to: 29.6, el: (p) => <SceneBody {...p} /> },
  { from: 29.6, to: 34.4, el: (p) => <SceneFeed {...p} /> },
  { from: 34.4, to: 36.2, el: (p) => <SceneName {...p} /> },
  { from: 38.0, to: 40.4, el: (p) => <SceneLife {...p} /> },
  { from: 43.3, to: 44.7, el: (p) => <SceneMotel {...p} /> },
  { from: 44.7, to: 48.0, el: (p) => <SceneSyringe {...p} /> },
  { from: 48.0, to: MIKE_END + 1, el: (p) => <SceneHeadless {...p} loop /> },
];
export const MIKE_SCENE_TIMES = SCENES.map((s) => [s.from, s.to]);
const DIVE = 0.45;
function diveFactor(t: number) {
  let f = 1;
  for (let i = 0; i < SCENES.length; i++) {
    const sc = SCENES[i], prevAdj = i > 0 && Math.abs(SCENES[i - 1].to - sc.from) < 0.01, nextAdj = i < SCENES.length - 1 && Math.abs(SCENES[i + 1].from - sc.to) < 0.01;
    if (sc.from > 0 && !prevAdj && t > sc.from - DIVE && t <= sc.from) f = Math.max(f, Math.pow(4, Easing.in(Easing.cubic)((t - (sc.from - DIVE)) / DIVE)));
    if (!nextAdj && sc.to <= MIKE_END && t >= sc.to && t < sc.to + 0.7) f = Math.max(f, Math.pow(4, 1 - Easing.out(Easing.cubic)((t - sc.to) / 0.7)));
  }
  return f;
}
const SceneLayer: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const i = SCENES.findIndex((s) => t >= s.from && t < s.to);
  if (i < 0) return null;
  const sc = SCENES[i], lt = t - sc.from, dur = sc.to - sc.from;
  const first = sc.from === 0;
  const prevAdj = i > 0 && Math.abs(SCENES[i - 1].to - sc.from) < 0.01;
  const nextAdj = i < SCENES.length - 1 && Math.abs(SCENES[i + 1].from - sc.to) < 0.01;
  const enter = first ? 1 : Math.min(1, lt / (prevAdj ? 0.3 : 0.4));
  const exitK = nextAdj || sc.to > MIKE_END ? 0 : interpolate(t, [sc.to - 0.25, sc.to], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = (prevAdj ? 1 : 1.35 - 0.35 * Easing.out(Easing.cubic)(enter)) * (1 + exitK * 0.6);
  const tx = prevAdj ? (1 - Easing.out(Easing.cubic)(enter)) * 1080 : 0;
  const blur = prevAdj ? (1 - enter) * 18 : (1 - enter) * 10 + exitK * 12;
  const opacity = prevAdj || first ? 1 - exitK : Math.min(1, enter * 2.5) * (1 - exitK);
  const prev = prevAdj && enter < 1 ? SCENES[i - 1] : null;
  return (
    <AbsoluteFill>
      {prev && <AbsoluteFill style={{ transform: `translateX(${-Easing.out(Easing.cubic)(enter) * 1080}px)`, filter: `blur(${enter * 18}px)` }}>
        <svg viewBox="0 0 1080 1920" width="100%" height="100%"><g transform="translate(0 -130)">{prev.el({ lt: prev.to - prev.from, dur: prev.to - prev.from, frame })}</g></svg>
      </AbsoluteFill>}
      <AbsoluteFill style={{ opacity, transform: `translateX(${tx}px) scale(${scale})`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>
        <svg viewBox="0 0 1080 1920" width="100%" height="100%"><g transform="translate(0 -130)">{sc.el({ lt, dur, frame })}</g></svg>
      </AbsoluteFill>
      {!first && !prevAdj && lt < 0.25 && <AbsoluteFill style={{ backgroundColor: "#fff", opacity: 0.55 * (1 - lt / 0.25) }} />}
    </AbsoluteFill>
  );
};

// ---------- US map ----------
const proj = geoAlbers().rotate([98, 0]).center([0, 38]).parallels([29.5, 45.5]).scale(1300).translate([0, 0]).clipExtent([[-2600, -2200], [2600, 2200]]);
const path = geoPath(proj);
const P = (ll: LL) => proj(ll) as [number, number];
const world = feature(worldTopo as any, (worldTopo as any).objects.countries) as any;
const land = feature(worldTopo as any, (worldTopo as any).objects.land) as any;
const states = feature(statesTopo as any, (statesTopo as any).objects.states) as any;
const stateMesh = mesh(statesTopo as any, (statesTopo as any).objects.states, (a: any, b: any) => a !== b) as any;
const stateP = (n: string) => path(states.features.find((f: any) => f.properties.name === n)) ?? "";
const FRUITA: LL = [-108.73, 39.16], SLC: LL = [-111.89, 40.76], LA: LL = [-118.24, 34.05], PHX: LL = [-112.07, 33.45];
const TOUR: LL[] = [FRUITA, SLC, LA, PHX];

const cl = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const ease = Easing.inOut(Easing.cubic);
type Cam = { c: [number, number]; z: number };
const lerpCam = (a: Cam, b: Cam, k: number): Cam => ({ c: [a.c[0] + (b.c[0] - a.c[0]) * k, a.c[1] + (b.c[1] - a.c[1]) * k], z: a.z * Math.pow(b.z / a.z, k) });
const US: Cam = { c: P([-104, 38.5]), z: 1.5 };
const FR: Cam = { c: P(FRUITA), z: 9 };
const WEST: Cam = { c: P([-112, 37.5]), z: 3.0 };
const PH: Cam = { c: P([-111, 35.8]), z: 4.2 };
function baseCamera(t: number): Cam {
  const seg = (t0: number, t1: number, a: Cam, b: Cam) => lerpCam(a, b, ease(interpolate(t, [t0, t1], [0, 1], cl)));
  if (t < 9.6) return { c: US.c, z: US.z * (1 + t * 0.01) };
  if (t < 12.4) return seg(9.6, 11.0, US, FR);
  if (t < 36.2) return FR;
  if (t < 38.0) return seg(36.2, 36.6, FR, WEST);
  if (t < 40.4) return WEST;
  if (t < 41.8) return seg(40.4, 41.8, WEST, PH);
  return PH;
}
const camera = (t: number): Cam => { const c = baseCamera(t); return { c: c.c, z: c.z * diveFactor(t) }; };

const pop = (t: number, at: number, dur = 0.28) => interpolate(t, [at, at + dur * 0.6, at + dur], [0, 1.18, 1], cl);
const fade = (t: number, a: number, b: number, d = 0.2) => interpolate(t, [a, a + d, b - d, b], [0, 1, 1, 0], cl);
const Big: React.FC<{ t: number; at: number; until: number; text: string; y?: number; size?: number; color?: string; serif?: boolean }> = ({ t, at, until, text, y = 360, size = 150, color = "#fff", serif = true }) =>
  t < at || t > until ? null : (
    <div style={{ position: "absolute", top: y, width: "100%", textAlign: "center", transform: `scale(${pop(t, at, 0.3)})`, opacity: fade(t, at, until, 0.15),
      fontFamily: serif ? fonts.serif : fonts.sans, fontWeight: serif ? 700 : 900, fontSize: size, color, lineHeight: 1.05,
      WebkitTextStroke: serif ? undefined : "10px #000", paintOrder: "stroke fill", textShadow: "0 8px 24px rgba(0,0,0,0.55), 0 3px 0 rgba(0,0,0,0.6)" }}>{text}</div>
  );
const Tag: React.FC<{ x: number; y: number; t: number; at: number; until: number; text: string; bg?: string; fg?: string; size?: number }> = ({ x, y, t, at, until, text, bg = "#fff3c4", fg = "#1d1712", size = 34 }) => {
  if (t < at || t > until) return null;
  const w = text.length * size * 0.62 + 36;
  return (
    <g transform={`translate(${x} ${y}) scale(${pop(t, at)})`} opacity={fade(t, at, until, 0.15)}>
      <rect x={-w / 2} y={-size - 8} width={w} height={size + 24} rx={12} fill={bg} stroke="#000" strokeWidth={4} />
      <text y={4} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={size} fill={fg}>{text}</text>
    </g>
  );
};
const Pin: React.FC<{ x: number; y: number; k: number; color?: string }> = ({ x, y, k, color = "#c62828" }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}><path d="M 0 0 C -24 -32 -24 -66 0 -72 C 24 -66 24 -32 0 0 Z" fill={color} stroke="#000" strokeWidth={5} /><circle cy={-48} r={9} fill="#fff" /></g>
);

function chunks(words: Word[]) {
  const out: { s: number; e: number; text: string }[] = [];
  const fix = (w: string) => w.replace(/^Fruta$/i, "Fruita").replace(/^brainstem\./i, "brain stem.").replace(/^brainstem$/i, "brain stem").replace(/^Magazine$/, "magazine");
  let cur: Word[] = [];
  const flush = () => { if (cur.length) out.push({ s: cur[0].s, e: cur[cur.length - 1].e, text: cur.map((w) => w.w).join(" ") }); cur = []; };
  for (const w0 of words) {
    const w = { ...w0, w: fix(w0.w) };
    if (cur.length && w.s - cur[cur.length - 1].e > 0.6) flush();
    cur.push(w);
    if (cur.length >= 4 || /[.,!?:]$/.test(w.w)) flush();
  }
  flush();
  return out.map((c, i) => ({ ...c, e: Math.min(i + 1 < out.length ? out[i + 1].s : c.e + 0.6, c.e + 0.6) }));
}

export const MikeChicken: React.FC<{ sound?: string; words?: Word[] }> = ({ sound, words = [] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cam = camera(t);
  const z = cam.z;
  const toS = (ll: LL): [number, number] => { const p = P(ll); return [540 + (p[0] - cam.c[0]) * z, 960 + (p[1] - cam.c[1]) * z]; };
  const sw = (px: number) => px / z;
  const caps = useMemo(() => chunks(words), [words]);
  const cap = caps.find((c) => t >= c.s && t < c.e);
  const S = useMemo(() => ({
    land: path(land) ?? "", can: path(world.features.find((f: any) => f.id === "124")) ?? "", mex: path(world.features.find((f: any) => f.id === "484")) ?? "",
    us: path(world.features.find((f: any) => f.id === "840")) ?? "", mesh: path(stateMesh) ?? "",
    co: stateP("Colorado"), az: stateP("Arizona"), ut: stateP("Utah"), ca: stateP("California"),
  }), []);
  const tourK = interpolate(t, [36.3, 37.9], [0, 1], cl);
  const tourPts = (() => {
    const segs = TOUR.length - 1, f = tourK * segs, i = Math.min(segs - 1, Math.floor(f)), r = f - i;
    const pts = TOUR.slice(0, i + 1).map((ll) => P(ll)); const a = P(TOUR[i]), b = P(TOUR[i + 1]);
    pts.push([a[0] + (b[0] - a[0]) * r, a[1] + (b[1] - a[1]) * r]);
    return pts;
  })();
  const tourD = "M " + tourPts.map((p) => `${p[0]} ${p[1]}`).join(" L ");
  const lastLeg = interpolate(t, [40.5, 41.8], [0, 1], cl);
  const fr = toS(FRUITA), ph = toS(PHX);

  return (
    <AbsoluteFill style={{ backgroundColor: "#4f8e8f", overflow: "hidden" }}>
      <AbsoluteFill>
        <svg viewBox="0 0 1080 1920" width="100%" height="100%">
          <defs><radialGradient id="seaG" cx="50%" cy="45%" r="75%"><stop offset="0" stopColor="#6aa6a3" /><stop offset="1" stopColor="#3f7c80" /></radialGradient></defs>
          <rect width={1080} height={1920} fill="url(#seaG)" />
          <g transform={`translate(540 960) scale(${z}) translate(${-cam.c[0]} ${-cam.c[1]})`}>
            <path d={S.land} fill="#dcc89c" stroke="#5a4428" strokeWidth={sw(2.2)} />
            <path d={S.can} fill="#e2d1a4" stroke="#3a2418" strokeWidth={sw(3)} />
            <path d={S.mex} fill="#e2d1a4" stroke="#3a2418" strokeWidth={sw(3)} />
            <path d={S.us} fill="#ecdcb0" stroke="#3a2418" strokeWidth={sw(3.5)} />
            <path d={S.mesh} fill="none" stroke="#8a6a44" strokeWidth={sw(1.6)} />
            <path d={S.co} fill="#d8a66a" opacity={interpolate(t, [9.2, 10.2], [0, 0.9], cl)} stroke="#3a2418" strokeWidth={sw(3)} />
            <path d={S.az} fill="#d8a66a" opacity={interpolate(t, [40.4, 41.2], [0, 0.9], cl)} stroke="#3a2418" strokeWidth={sw(3)} />
            {t >= 36.3 && t < 38.0 && <g>
              <path d={tourD} fill="none" stroke="#000" strokeOpacity={0.35} strokeWidth={sw(14)} strokeLinecap="round" strokeLinejoin="round" />
              <path d={tourD} fill="none" stroke="#b5391f" strokeWidth={sw(8)} strokeLinecap="round" strokeLinejoin="round" />
            </g>}
            {t >= 40.4 && (() => { const a = P(LA), b = P(PHX); return (<g><path d={`M ${a[0]} ${a[1]} L ${a[0] + (b[0] - a[0]) * lastLeg} ${a[1] + (b[1] - a[1]) * lastLeg}`} stroke="#b5391f" strokeWidth={sw(8)} strokeLinecap="round" strokeDasharray={`${sw(16)} ${sw(10)}`} /></g>); })()}
          </g>
        </svg>
      </AbsoluteFill>

      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        {t >= 9.8 && t < 12.5 && <Pin x={fr[0]} y={fr[1]} k={pop(t, 10.2)} />}
        <Tag x={fr[0]} y={fr[1] + 80} t={t} at={10.02} until={12.4} text="FRUITA, COLORADO" size={40} bg="#1b140d" fg="#f2e3b5" />
        <Tag x={fr[0]} y={fr[1] - 130} t={t} at={11.42} until={12.4} text="SEPT 10, 1945" size={40} bg="#fff3c4" />
        {t >= 36.3 && t < 38.0 && TOUR.map((ll, i) => { const [x, y] = toS(ll); return <Pin key={i} x={x} y={y} k={0.7 * pop(t, 36.3 + i * 0.4)} color={i === 0 ? "#c62828" : "#e4512c"} />; })}
        {t >= 40.6 && <Pin x={ph[0]} y={ph[1]} k={pop(t, 41.8)} />}
        <Tag x={ph[0]} y={ph[1] + 80} t={t} at={42.02} until={43.4} text="ARIZONA" size={44} bg="#1b140d" fg="#f2e3b5" />
      </svg>

      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%)" }} />
      <Img src={staticFile("pony/grain.png")} style={{ position: "absolute", inset: 0, width: 1080, height: 1920, opacity: 0.22, mixBlendMode: "multiply" }} />

      <SceneLayer t={t} frame={frame} />
      <Big t={t} at={-0.5} until={3.0} text="HEADLESS" color="#ffd23f" size={160} y={250} serif={false} />
      <Big t={t} at={-0.5} until={3.0} text="CHICKEN" color="#fff" size={160} y={430} serif={false} />
      <Big t={t} at={3.2} until={5.3} text="1945" size={160} y={330} />
      <Big t={t} at={6.7} until={9.5} text="NO HEAD?" serif={false} size={130} color="#ffd23f" y={330} />
      <Big t={t} at={36.4} until={38.0} text="TOURED AMERICA" serif={false} size={90} color="#fff" y={300} />
      <Big t={t} at={40.5} until={43.0} text="18 MONTHS" color="#ffd23f" size={130} y={300} />
      <Big t={t} at={48.2} until={51.6} text="1945" size={160} y={330} />
      <Big t={t} at={51.8} until={54.9} text="HEADLESS" color="#ffd23f" size={160} y={250} serif={false} />
      <Big t={t} at={51.8} until={54.9} text="CHICKEN" color="#fff" size={160} y={430} serif={false} />

      {cap && (
        <div style={{ position: "absolute", top: 1420, left: 60, right: 60, textAlign: "center", fontFamily: fonts.sans, fontWeight: 900, fontSize: 66, lineHeight: 1.1,
          color: "#fff", WebkitTextStroke: "9px #000", paintOrder: "stroke fill", textShadow: "0 6px 0 #000", transform: `scale(${interpolate(t, [cap.s, cap.s + 0.08], [0.9, 1], cl)})` }}>{cap.text}</div>
      )}
      {sound && <Audio src={staticFile(sound)} />}
    </AbsoluteFill>
  );
};
