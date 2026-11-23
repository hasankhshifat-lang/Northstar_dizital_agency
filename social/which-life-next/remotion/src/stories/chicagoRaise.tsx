import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { geoMercator, geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";
import worldTopo from "world-atlas/countries-50m.json";
import statesTopo from "us-atlas/states-10m.json";
import lakes from "../data/ne50m_great_lakes.json";
import { fonts } from "../theme";
import WORDS from "./chicagoWords.json";
import { SceneHook, SceneMud, SceneCholera, ScenePipe, SceneFill, SceneLevel, SceneLakeSt, SceneRow, SceneScrew, SceneRise, SceneShop, SceneHotel, SceneGuest } from "../sets/chicagoScenes";

/**
 * The raising of Chicago (1854 cholera, sewers laid on the streets, Lake Street block 1860 on 6,000 jackscrews, Tremont House with
 * guests inside) — voiced map Short, Pony Express style, 45–60 s.
 * Cues are timed to shorts/chicago-raise-2026-11-23/words.json. Storyboard: social/scripts/chicago-raise-2026-11-23.md.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
type LL = [number, number];
type Word = { w: string; s: number; e: number };

// ---------- ground scenes ----------
type SceneDef = { from: number; to: number; el: (p: { lt: number; dur: number; frame: number }) => React.ReactNode };
export const CH_END = 47.3;
const LOOP_FROM = 44.7;
const SCENES: SceneDef[] = [
  { from: 0, to: 6.4, el: (p) => <SceneHook {...p} u0={0} /> },
  { from: 11.3, to: 13.1, el: (p) => <SceneMud {...p} /> },
  { from: 13.1, to: 17.3, el: (p) => <SceneCholera {...p} /> },
  { from: 17.3, to: 20.4, el: (p) => <ScenePipe {...p} /> },
  { from: 20.4, to: 22.4, el: (p) => <SceneFill {...p} /> },
  { from: 22.4, to: 25.4, el: (p) => <SceneLevel {...p} /> },
  { from: 25.4, to: 27.0, el: (p) => <SceneLakeSt {...p} /> },
  { from: 27.0, to: 29.7, el: (p) => <SceneRow {...p} /> },
  { from: 29.7, to: 33.9, el: (p) => <SceneScrew {...p} /> },
  { from: 33.9, to: 36.5, el: (p) => <SceneRise {...p} /> },
  { from: 36.5, to: 39.9, el: (p) => <SceneShop {...p} /> },
  { from: 39.9, to: 42.2, el: (p) => <SceneHotel {...p} /> },
  { from: 42.2, to: LOOP_FROM, el: (p) => <SceneGuest {...p} /> },
  { from: LOOP_FROM, to: CH_END + 1, el: (p) => <SceneHook {...p} u0={-(CH_END - LOOP_FROM)} /> },
];
export const CH_SCENE_TIMES = SCENES.map((s) => [s.from, s.to]);
const DIVE = 0.45;
function diveFactor(t: number) {
  let f = 1;
  for (let i = 0; i < SCENES.length; i++) {
    const sc = SCENES[i], prevAdj = i > 0 && Math.abs(SCENES[i - 1].to - sc.from) < 0.01, nextAdj = i < SCENES.length - 1 && Math.abs(SCENES[i + 1].from - sc.to) < 0.01;
    if (sc.from > 0 && !prevAdj && t > sc.from - DIVE && t <= sc.from) f = Math.max(f, Math.pow(4, Easing.in(Easing.cubic)((t - (sc.from - DIVE)) / DIVE)));
    if (!nextAdj && sc.to <= CH_END && t >= sc.to && t < sc.to + 0.7) f = Math.max(f, Math.pow(4, 1 - Easing.out(Easing.cubic)((t - sc.to) / 0.7)));
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
  const exitK = nextAdj || sc.to > CH_END ? 0 : interpolate(t, [sc.to - 0.25, sc.to], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
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

// ---------- US map (world-atlas 50m land + us-atlas states + Natural Earth 50m Great Lakes on top) ----------
const proj = geoMercator().scale(600).translate([0, 0]);
const path = geoPath(proj);
const P = (ll: LL) => proj(ll) as [number, number];
const land = feature(worldTopo as any, (worldTopo as any).objects.land) as any;
const states = feature(statesTopo as any, (statesTopo as any).objects.states) as any;
const stateMesh = mesh(statesTopo as any, (statesTopo as any).objects.states, (a: any, b: any) => a !== b) as any;
const CHICAGO: LL = [-87.63, 41.88];
const cl = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const ease = Easing.inOut(Easing.cubic);
type Cam = { c: [number, number]; z: number };
const lerpCam = (a: Cam, b: Cam, k: number): Cam => ({ c: [a.c[0] + (b.c[0] - a.c[0]) * k, a.c[1] + (b.c[1] - a.c[1]) * k], z: a.z * Math.pow(b.z / a.z, k) });
const USA: Cam = { c: P([-96, 39]), z: 1.6 };
const MID: Cam = { c: P([-87.4, 42.6]), z: 7 };
const CITY: Cam = { c: P([-87.75, 41.9]), z: 26 };
function baseCamera(t: number): Cam {
  const seg = (t0: number, t1: number, a: Cam, b: Cam) => lerpCam(a, b, ease(interpolate(t, [t0, t1], [0, 1], cl)));
  if (t < 8.2) return seg(6.4, 7.6, { c: CITY.c, z: 6 }, USA);
  return seg(8.2, 9.2, USA, MID);
}
const camera = (t: number): Cam => { const c = baseCamera(t); return { c: c.c, z: c.z * diveFactor(t) }; };

const pop = (t: number, at: number, dur = 0.28) => interpolate(t, [at, at + dur * 0.6, at + dur], [0, 1.18, 1], cl);
const fade = (t: number, a: number, b: number, d = 0.2) => interpolate(t, [a, a + d, b - d, b], [0, 1, 1, 0], cl);
const Big: React.FC<{ t: number; at: number; until: number; text: string; y?: number; size?: number; color?: string; serif?: boolean }> = ({ t, at, until, text, y = 360, size = 150, color = "#fff", serif = true }) =>
  t < at || t > until ? null : (
    <div style={{ position: "absolute", top: y, width: "100%", textAlign: "center", transform: `scale(${pop(t, at, 0.3)})`, opacity: fade(t, at, until, 0.15),
      fontFamily: serif ? fonts.serif : "AntonT, Impact, sans-serif", fontWeight: serif ? 700 : 400, fontSize: size, color, lineHeight: 1.05,
      WebkitTextStroke: serif ? undefined : "10px #000", paintOrder: "stroke fill", textShadow: "0 8px 24px rgba(0,0,0,0.55), 0 3px 0 rgba(0,0,0,0.6)" }}>{text}</div>
  );
const Tag: React.FC<{ x: number; y: number; t: number; at: number; until: number; text: string; bg?: string; fg?: string; size?: number }> = ({ x, y, t, at, until, text, bg = "#1b140d", fg = "#f2e3b5", size = 34 }) => {
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
  let cur: Word[] = [];
  const flush = () => { if (cur.length) out.push({ s: cur[0].s, e: cur[cur.length - 1].e, text: cur.map((w) => w.w).join(" ") }); cur = []; };
  for (const w of words) {
    if (cur.length && w.s - cur[cur.length - 1].e > 0.6) flush();
    cur.push(w);
    if (cur.length >= 4 || /[.,!?:]$/.test(w.w)) flush();
  }
  flush();
  return out.map((c, i) => ({ ...c, e: Math.min(i + 1 < out.length ? out[i + 1].s : c.e + 0.6, c.e + 0.6) }));
}

export const ChicagoRaise: React.FC<{ sound?: string; words?: Word[]; clean?: boolean }> = ({ sound, words, clean }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cam = camera(t);
  const z = cam.z;
  const toS = (ll: LL): [number, number] => { const p = P(ll); return [540 + (p[0] - cam.c[0]) * z, 960 + (p[1] - cam.c[1]) * z]; };
  const sw = (px: number) => px / z;
  const caps = useMemo(() => chunks(words && words.length ? words : (WORDS as Word[])), [words]);
  const cap = caps.find((c) => t >= c.s && t < c.e);
  const S = useMemo(() => ({ land: path(land) ?? "", states: path(states) ?? "", mesh: path(stateMesh) ?? "", lakes: path(lakes as any) ?? "", il: path(states.features.find((f: any) => f.properties.name === "Illinois")) ?? "" }), []);
  const showMap = (a: number, b: number) => t >= a && t < b;
  const ch = toS(CHICAGO), lm = toS([-87.0, 43.4]);
  return (
    <AbsoluteFill style={{ backgroundColor: "#4f8e8f", overflow: "hidden" }}>
      <style>{`@font-face{font-family:"AntonT";src:url(${staticFile("anton.ttf")})}`}</style>
      <AbsoluteFill>
        <svg viewBox="0 0 1080 1920" width="100%" height="100%">
          <defs><radialGradient id="seaG" cx="50%" cy="45%" r="75%"><stop offset="0" stopColor="#6aa6a3" /><stop offset="1" stopColor="#3f7c80" /></radialGradient></defs>
          <rect width={1080} height={1920} fill="url(#seaG)" />
          <g transform={`translate(540 960) scale(${z}) translate(${-cam.c[0]} ${-cam.c[1]})`}>
            <path d={S.land} fill="#ecdcb0" stroke="#3a2418" strokeWidth={sw(3)} />
                        <path d={S.states} fill="#ecdcb0" stroke="#3a2418" strokeWidth={sw(2.4)} />
            <path d={S.il} fill="#d8a66a" opacity={showMap(8.2, 11.3) ? interpolate(t, [9.2, 9.7], [0, 0.8], cl) * (clean ? 0.6 : 1) : 0} />
            <path d={S.mesh} fill="none" stroke="#3a2418" strokeWidth={sw(1.6)} opacity={0.55} />
            <path d={S.lakes} fill="#5f9c9c" stroke="#3a2418" strokeWidth={sw(2.4)} />
          </g>
        </svg>
      </AbsoluteFill>

      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0, display: clean ? "none" : undefined }}>
        {showMap(6.4, 8.2) && <g>
          <Pin x={ch[0]} y={ch[1]} k={pop(t, 6.6)} />
          <Tag x={ch[0]} y={ch[1] + 70} t={t} at={6.7} until={8.2} text="CHICAGO" size={42} />
        </g>}
        {showMap(8.2, 11.3) && <g>
          <Pin x={ch[0]} y={ch[1]} k={1} />
          <Tag x={ch[0] - 120} y={ch[1] + 70} t={t} at={8.4} until={11.3} text="CHICAGO" size={40} />
          <Tag x={lm[0]} y={lm[1]} t={t} at={10.3} until={11.3} text="LAKE MICHIGAN" size={40} bg="#1f3a5a" fg="#fff" />
          <Tag x={ch[0] - 120} y={ch[1] + 150} t={t} at={9.2} until={11.3} text="SWAMPY GROUND" size={36} bg="#5a4a1a" fg="#fff" />
        </g>}
      </svg>

      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%)" }} />
      <Img src={staticFile("pony/grain.png")} style={{ position: "absolute", inset: 0, width: 1080, height: 1920, opacity: 0.22, mixBlendMode: "multiply" }} />

      {!clean && <SceneLayer t={t} frame={frame} />}
      {!clean && <>
      <Big t={t} at={-0.5} until={6.3} text="THEY LIFTED" color="#fff" size={150} y={110} serif={false} />
      <Big t={t} at={-0.5} until={6.3} text="A CITY BLOCK" color="#ffd23f" size={150} y={270} serif={false} />
      <Big t={t} at={6.9} until={8.1} text="WHY?" color="#ffd23f" size={190} y={220} serif={false} />
      <Big t={t} at={13.4} until={15.2} text="1854" size={140} y={170} />
      <Big t={t} at={15.4} until={17.2} text="1 IN 20 DIED" color="#ffd23f" size={130} y={170} serif={false} />
      <Big t={t} at={26.3} until={29.6} text="600 MEN" color="#ffd23f" size={160} y={170} serif={false} />
      <Big t={t} at={30.2} until={33.8} text="6,000" color="#ffd23f" size={170} y={110} serif={false} />
      <Big t={t} at={30.2} until={33.8} text="JACKSCREWS" color="#fff" size={130} y={290} serif={false} />
      <Big t={t} at={35.0} until={36.4} text="4+ FEET" color="#ffd23f" size={170} y={170} serif={false} />
      <Big t={t} at={40.4} until={42.1} text="6 STORIES" color="#ffd23f" size={160} y={170} serif={false} />
      <Big t={t} at={45.0} until={CH_END + 0.5} text="THEY LIFTED" color="#fff" size={150} y={110} serif={false} />
      <Big t={t} at={45.0} until={CH_END + 0.5} text="A CITY BLOCK" color="#ffd23f" size={150} y={270} serif={false} />
      </>}

      {cap && !clean && (
        <div style={{ position: "absolute", top: 1420, left: 60, right: 60, textAlign: "center", fontFamily: fonts.sans, fontWeight: 900, fontSize: 66, lineHeight: 1.1,
          color: "#fff", WebkitTextStroke: "9px #000", paintOrder: "stroke fill", textShadow: "0 6px 0 #000", transform: `scale(${interpolate(t, [cap.s, cap.s + 0.08], [0.9, 1], cl)})` }}>{cap.text}</div>
      )}
      {sound && <Audio src={staticFile(sound)} />}
    </AbsoluteFill>
  );
};
