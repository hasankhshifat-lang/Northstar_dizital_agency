import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { geoAlbers, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import worldTopo from "world-atlas/countries-50m.json";
import { fonts } from "../theme";
import { SceneInflate, SceneCarry, SceneMedal, SceneNightColumn, SceneObserver, SceneRoster, SceneRubberTank, SceneSecret, SceneSpeakers, SceneStudio, Tank } from "../sets/ghostScenes";

/**
 * The Ghost Army (WWII) — voiced map Short, Pony Express style, 45–60 s.
 * Cues are timed to the narration's word timestamps (ghost-words.json).
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
type LL = [number, number];
type Word = { w: string; s: number; e: number };

// ---------- ground scenes ----------
type SceneDef = { from: number; to: number; el: (p: { lt: number; dur: number; frame: number }) => React.ReactNode };
export const GHOST_END = 57.4;
const SCENES: SceneDef[] = [
  { from: 0, to: 2.3, el: (p) => <SceneRubberTank {...p} /> },
  { from: 4.2, to: 6.9, el: (p) => <SceneStudio {...p} /> },
  { from: 12.4, to: 17.0, el: (p) => <SceneRoster {...p} /> },
  { from: 17.0, to: 20.7, el: (p) => <SceneInflate {...p} /> },
  { from: 20.7, to: 22.26, el: (p) => <SceneCarry {...p} /> },
  { from: 22.26, to: 25.6, el: (p) => <SceneNightColumn {...p} /> },
  { from: 27.3, to: 32.4, el: (p) => <SceneSpeakers {...p} /> },
  { from: 37.0, to: 39.5, el: (p) => <SceneObserver {...p} /> },
  { from: 44.2, to: 49.6, el: (p) => <SceneSecret {...p} /> },
  { from: 49.6, to: 54.2, el: (p) => <SceneMedal {...p} /> },
  { from: 54.2, to: GHOST_END + 1, el: (p) => <SceneRubberTank {...p} loop /> },
];
export const GHOST_SCENE_TIMES = SCENES.map((s) => [s.from, s.to]);
const DIVE = 0.45;
function diveFactor(t: number) {
  let f = 1;
  for (let i = 0; i < SCENES.length; i++) {
    const sc = SCENES[i], prevAdj = i > 0 && Math.abs(SCENES[i - 1].to - sc.from) < 0.01, nextAdj = i < SCENES.length - 1 && Math.abs(SCENES[i + 1].from - sc.to) < 0.01;
    if (sc.from > 0 && !prevAdj && t > sc.from - DIVE && t <= sc.from) f = Math.max(f, Math.pow(4, Easing.in(Easing.cubic)((t - (sc.from - DIVE)) / DIVE)));
    if (!nextAdj && sc.to <= GHOST_END && t >= sc.to && t < sc.to + 0.7) f = Math.max(f, Math.pow(4, 1 - Easing.out(Easing.cubic)((t - sc.to) / 0.7)));
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
  const exitK = nextAdj || sc.to > GHOST_END ? 0 : interpolate(t, [sc.to - 0.25, sc.to], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
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

// ---------- Europe map ----------
const proj = geoAlbers().rotate([-8, 0]).center([0, 49]).parallels([40, 55]).scale(1300).translate([0, 0]).clipExtent([[-6000, -5000], [6000, 5000]]);
const path = geoPath(proj);
const P = (ll: LL) => proj(ll) as [number, number];
const world = feature(worldTopo as any, (worldTopo as any).objects.countries) as any;
const land = feature(worldTopo as any, (worldTopo as any).objects.land) as any;
const byId = (id: string) => world.features.find((f: any) => f.id === id);
const RHINE: LL[] = [[7.59, 47.56], [7.8, 48.6], [8.46, 49.49], [8.27, 50.0], [7.6, 50.36], [7.1, 50.73], [6.96, 50.94], [6.77, 51.23], [6.74, 51.45], [6.61, 51.65], [6.4, 51.76], [6.24, 51.83], [5.5, 51.85], [4.6, 51.9]];
const VIERSEN: LL = [6.39, 51.26], WESEL: LL = [6.61, 51.66];
const FAKE_X: LL = [6.8, 51.2];       // fake crossing, south, near Düsseldorf
const REAL_FROM: LL = [6.3, 51.7], REAL_TO: LL = [7.0, 51.66];
const DECEP: LL[] = [[-1.4, 49.3], [-0.4, 49.2], [0.6, 49.6], [1.4, 49.0], [2.3, 48.9], [3.1, 49.6], [3.9, 49.2], [4.5, 49.8], [5.3, 49.6], [5.9, 50.2], [6.2, 49.6], [6.0, 51.0], [6.7, 50.2], [7.1, 51.0], [7.6, 49.9], [8.1, 50.6], [7.4, 48.9], [8.0, 49.5], [9.0, 50.1], [9.7, 51.0]];

const cl = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const ease = Easing.inOut(Easing.cubic);
type Cam = { c: [number, number]; z: number };
const lerpCam = (a: Cam, b: Cam, k: number): Cam => ({ c: [a.c[0] + (b.c[0] - a.c[0]) * k, a.c[1] + (b.c[1] - a.c[1]) * k], z: a.z * Math.pow(b.z / a.z, k) });
const EU: Cam = { c: P([5, 50]), z: 2.6 };
const FRANCE: Cam = { c: P([2.2, 49.2]), z: 3.6 };
const NORM: Cam = { c: P([0.2, 49.3]), z: 12 };
const RH: Cam = { c: P([6.55, 51.45]), z: 24 };
function baseCamera(t: number): Cam {
  const seg = (t0: number, t1: number, a: Cam, b: Cam) => lerpCam(a, b, ease(interpolate(t, [t0, t1], [0, 1], cl)));
  if (t < 6.9) return { c: EU.c, z: EU.z * (1 + t * 0.01) };
  if (t < 12.4) return seg(6.9, 8.2, EU, FRANCE);
  if (t < 25.6) return FRANCE;
  if (t < 27.3) return seg(25.6, 26.4, FRANCE, NORM);
  if (t < 32.4) return NORM;
  if (t < 37.0) return t < 34.8 ? seg(32.4, 34.8, NORM, EU) : seg(34.8, 36.4, EU, RH);
  if (t < 41.0) return RH;
  return seg(41.0, 42.0, RH, EU);
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

function chunks(words: Word[]) {
  const out: { s: number; e: number; text: string }[] = [];
  const fix = (w: string) => w.replace(/^ghost$/i, "Ghost").replace(/^army\./i, "Army.").replace(/^1100$/, "1,100").replace(/^Rhine$/, "Rhine").replace(/^army\?/i, "army?");
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

export const GhostArmy: React.FC<{ sound?: string; words?: Word[] }> = ({ sound, words = [] }) => {
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
    land: path(land) ?? "", de: path(byId("276")) ?? "", fr: path(byId("250")) ?? "", be: path(byId("056")) ?? "", nl: path(byId("528")) ?? "", lu: path(byId("442")) ?? "",
    gb: path(byId("826")) ?? "", ch: path(byId("756")) ?? "", rhine: path({ type: "LineString", coordinates: RHINE } as any) ?? "",
  }), []);
  const rhineK = interpolate(t, [33.0, 35.6], [0, 1], cl);
  const trackK = interpolate(t, [25.66, 27.0], [0, 1], cl);
  const realK = interpolate(t, [39.9, 41.0], [0, 1], cl);
  const fakeK = interpolate(t, [39.5, 40.4], [0, 1], cl);
  const tanks = Array.from({ length: 12 }, (_, i) => [-1.5 + (i % 4) * 2.1, 48.2 + Math.floor(i / 4) * 1.1] as LL);
  const gerLabel = toS([10.2, 51.2]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#4f8e8f", overflow: "hidden" }}>
      <AbsoluteFill>
        <svg viewBox="0 0 1080 1920" width="100%" height="100%">
          <defs>
            <radialGradient id="seaG" cx="50%" cy="45%" r="75%"><stop offset="0" stopColor="#6aa6a3" /><stop offset="1" stopColor="#3f7c80" /></radialGradient>
          </defs>
          <rect width={1080} height={1920} fill="url(#seaG)" />
          <g transform={`translate(540 960) scale(${z}) translate(${-cam.c[0]} ${-cam.c[1]})`}>
            <path d={S.land} fill="#dcc89c" stroke="#5a4428" strokeWidth={sw(2.2)} />
            <path d={S.gb} fill="#e2d1a4" stroke="#3a2418" strokeWidth={sw(3)} />
            <path d={S.fr} fill="#e8d9ae" stroke="#3a2418" strokeWidth={sw(3)} />
            <path d={S.be} fill="#e2d1a4" stroke="#3a2418" strokeWidth={sw(3)} />
            <path d={S.nl} fill="#e8d9ae" stroke="#3a2418" strokeWidth={sw(3)} />
            <path d={S.lu} fill="#e2d1a4" stroke="#3a2418" strokeWidth={sw(3)} />
            <path d={S.ch} fill="#e2d1a4" stroke="#3a2418" strokeWidth={sw(3)} />
            <path d={S.de} fill="#d98b73" opacity={0.85} stroke="#3a2418" strokeWidth={sw(3.5)} />
            {t >= 33.0 && (
              <g>
                <path d={S.rhine} fill="none" stroke="#2f6d75" strokeWidth={sw(16)} strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - rhineK} />
                <path d={S.rhine} fill="none" stroke="#7fd0d8" strokeWidth={sw(9)} strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - rhineK} />
              </g>
            )}
            {t >= 39.5 && t < 44.2 && (
              <g>
                {/* fake crossing: dashed red from Viersen toward the Rhine in the south */}
                <path d={path({ type: "LineString", coordinates: [VIERSEN, [VIERSEN[0] + (FAKE_X[0] - VIERSEN[0]) * fakeK, VIERSEN[1] + (FAKE_X[1] - VIERSEN[1]) * fakeK]] } as any) ?? ""} fill="none" stroke="#c62828" strokeWidth={sw(9)} strokeDasharray={`${sw(18)} ${sw(12)}`} strokeLinecap="round" />
                {/* real crossing: solid orange across the river at Wesel */}
                <path d={path({ type: "LineString", coordinates: [REAL_FROM, [REAL_FROM[0] + (REAL_TO[0] - REAL_FROM[0]) * realK, REAL_FROM[1] + (REAL_TO[1] - REAL_FROM[1]) * realK]] } as any) ?? ""} fill="none" stroke="#000" strokeOpacity={0.35} strokeWidth={sw(18)} strokeLinecap="round" />
                <path d={path({ type: "LineString", coordinates: [REAL_FROM, [REAL_FROM[0] + (REAL_TO[0] - REAL_FROM[0]) * realK, REAL_FROM[1] + (REAL_TO[1] - REAL_FROM[1]) * realK]] } as any) ?? ""} fill="none" stroke="#e8642c" strokeWidth={sw(10)} strokeLinecap="round" />
              </g>
            )}
          </g>
        </svg>
      </AbsoluteFill>

      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        {/* 1944: Germany + a fake army of tank icons across France */}
        <Tag x={gerLabel[0]} y={gerLabel[1]} t={t} at={7.0} until={10.0} text="GERMANY" bg="#c9493f" fg="#fff" size={40} />
        {t >= 7.6 && t < 10.3 && tanks.map((ll, i) => {
          const [x, y] = toS(ll), a = 7.6 + i * 0.17;
          return <g key={i} opacity={fade(t, a, 10.2, 0.15)}><Tank x={x} y={y} s={0.2 * pop(t, a, 0.25) + 0.001} color="#6f7d3c" /></g>;
        })}
        {/* the Ghost Army tag */}
        <Tag x={540} y={560} t={t} at={11.4} until={12.4} text="23rd HQ SPECIAL TROOPS" size={36} bg="#1b140d" fg="#f2e3b5" />
        {/* fake tracks across Normandy */}
        {t >= 25.6 && t < 27.4 && (() => {
          const x0 = 60, x1 = 60 + 960 * trackK, y = 1020;
          return (
            <g opacity={fade(t, 25.6, 27.4, 0.2)}>
              <path d={`M ${x0} ${y} Q 300 ${y - 60} 540 ${y} T ${x1} ${y}`} fill="none" stroke="#6b4a2b" strokeWidth={14} strokeDasharray="10 14" />
              <path d={`M ${x0} ${y + 36} Q 300 ${y - 24} 540 ${y + 36} T ${x1} ${y + 36}`} fill="none" stroke="#6b4a2b" strokeWidth={14} strokeDasharray="10 14" />
              <Tank x={x1} y={y + 64} s={0.34} color="#6f7d3c" />
            </g>
          );
        })()}
        <Tag x={540} y={860} t={t} at={25.98} until={27.3} text="FAKE TRACKS" size={44} />
        {/* Rhine and the two crossings */}
        <Tag x={toS([7.3, 50.6])[0]} y={toS([7.3, 50.6])[1]} t={t} at={36.04} until={37.0} text="RHINE RIVER" size={36} bg="#7fd0d8" />
        <Tag x={toS(VIERSEN)[0] - 40} y={toS(VIERSEN)[1] + 80} t={t} at={39.5} until={41.0} text="FAKE ARMY" size={36} bg="#c62828" fg="#fff" />
        <Tag x={toS(WESEL)[0] - 40} y={toS(WESEL)[1] - 120} t={t} at={40.22} until={41.1} text="REAL CROSSING" size={36} bg="#e8642c" fg="#fff" />
        {t >= 39.5 && t < 41.2 && (() => { const [x, y] = toS(VIERSEN); return (<g transform={`translate(${x} ${y}) scale(${pop(t, 39.5)})`}><path d="M 0 0 C -24 -32 -24 -66 0 -72 C 24 -66 24 -32 0 0 Z" fill="#c62828" stroke="#000" strokeWidth={5} /><circle cy={-48} r={9} fill="#fff" /></g>); })()}
        {t >= 40.0 && t < 41.2 && (() => { const [x, y] = toS(WESEL); return (<g transform={`translate(${x} ${y}) scale(${pop(t, 40.0)})`}><path d="M 0 0 C -24 -32 -24 -66 0 -72 C 24 -66 24 -32 0 0 Z" fill="#2e7d32" stroke="#000" strokeWidth={5} /><circle cy={-48} r={9} fill="#fff" /></g>); })()}
        {/* about 20 deceptions */}
        {t >= 41.6 && t < 44.3 && DECEP.map((ll, i) => {
          const [x, y] = toS(ll), a = 41.9 + i * 0.1;
          return (
            <g key={i} transform={`translate(${x} ${y}) scale(${0.75 * pop(t, a)})`} opacity={fade(t, a, 44.3, 0.15)}>
              <path d="M 0 0 C -24 -32 -24 -66 0 -72 C 24 -66 24 -32 0 0 Z" fill="#e4512c" stroke="#000" strokeWidth={5} /><circle cy={-48} r={9} fill="#fff" />
            </g>
          );
        })}
      </svg>

      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%)" }} />
      <Img src={staticFile("pony/grain.png")} style={{ position: "absolute", inset: 0, width: 1080, height: 1920, opacity: 0.22, mixBlendMode: "multiply" }} />

      <SceneLayer t={t} frame={frame} />
      {/* big pops */}
      <Big t={t} at={-0.5} until={2.3} text="RUBBER" color="#ffd23f" size={200} y={250} />
      <Big t={t} at={-0.5} until={2.3} text="TANKS" color="#fff" size={200} y={440} />
      <Big t={t} at={2.5} until={4.2} text="1944" size={200} />
      <Big t={t} at={7.7} until={10.1} text="FAKE AN ARMY?" serif={false} size={104} color="#fff" y={330} />
      <Big t={t} at={10.5} until={12.4} text="GHOST ARMY" color="#ffd23f" size={150} y={330} />
      <Big t={t} at={12.42} until={14.0} text="1,100 SOLDIERS" color="#ffd23f" size={104} y={330} />
      <Big t={t} at={18.84} until={20.7} text="93 POUNDS" color="#ffd23f" size={150} y={330} />
      <Big t={t} at={32.5} until={34.4} text="MARCH 1945" size={130} y={330} />
      <Big t={t} at={42.4} until={44.2} text="~20 DECEPTIONS" color="#ffd23f" size={110} y={330} />
      <Big t={t} at={46.0} until={47.7} text="50+ YEARS" color="#fff" size={110} y={1190} />
      <Big t={t} at={49.7} until={52.2} text="2022" color="#ffd23f" size={150} y={720} />
      <Big t={t} at={54.4} until={57.5} text="RUBBER" color="#ffd23f" size={200} y={250} />
      <Big t={t} at={54.4} until={57.5} text="TANKS" color="#fff" size={200} y={440} />

      {cap && (
        <div style={{ position: "absolute", top: 1420, left: 60, right: 60, textAlign: "center", fontFamily: fonts.sans, fontWeight: 900, fontSize: 66, lineHeight: 1.1,
          color: "#fff", WebkitTextStroke: "9px #000", paintOrder: "stroke fill", textShadow: "0 6px 0 #000", transform: `scale(${interpolate(t, [cap.s, cap.s + 0.08], [0.9, 1], cl)})` }}>{cap.text}</div>
      )}
      {sound && <Audio src={staticFile(sound)} />}
    </AbsoluteFill>
  );
};
