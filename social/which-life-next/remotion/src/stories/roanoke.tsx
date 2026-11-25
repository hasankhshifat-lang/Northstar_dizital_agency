import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { geoMercator, geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";
import worldTopo from "world-atlas/countries-50m.json";
import land10Topo from "world-atlas/land-10m.json";
import { fonts } from "../theme";
import WORDS from "./roanokeWords.json";
import { SceneHook, SceneArrival, SceneDare, SceneFarewell, SceneLanding, SceneGone, SceneTree, SceneWord, SceneSign, SceneNoCross, SceneStorm, SceneEmpty } from "../sets/roanokeScenes";

/**
 * The Roanoke colony that vanished, leaving one word (1587–1590; CRO on a tree, CROATOAN on a post, no cross) — voiced map Short, Pony Express style, 45–60 s.
 * Cues are timed to shorts/roanoke-2026-11-25/words.json. Storyboard: social/scripts/roanoke-2026-11-25.md.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
type LL = [number, number];
type Word = { w: string; s: number; e: number };

// ---------- ground scenes ----------
type SceneDef = { from: number; to: number; el: (p: { lt: number; dur: number; frame: number }) => React.ReactNode };
export const RK_END = 58.0;
const LOOP_FROM = 55.4;
const SCENES: SceneDef[] = [
  { from: 0, to: 6.2, el: (p) => <SceneHook {...p} u0={0} /> },
  { from: 8.8, to: 11.6, el: (p) => <SceneArrival {...p} /> },
  { from: 13.7, to: 19.1, el: (p) => <SceneDare {...p} /> },
  { from: 19.1, to: 21.6, el: (p) => <SceneFarewell {...p} /> },
  { from: 24.5, to: 27.7, el: (p) => <SceneLanding {...p} /> },
  { from: 27.7, to: 29.4, el: (p) => <SceneGone {...p} /> },
  { from: 29.4, to: 34.6, el: (p) => <SceneTree {...p} /> },
  { from: 34.6, to: 39.1, el: (p) => <SceneWord {...p} /> },
  { from: 39.1, to: 43.5, el: (p) => <SceneSign {...p} /> },
  { from: 43.5, to: 45.1, el: (p) => <SceneNoCross {...p} /> },
  { from: 47.7, to: 52.6, el: (p) => <SceneStorm {...p} /> },
  { from: 52.6, to: LOOP_FROM, el: (p) => <SceneEmpty {...p} /> },
  { from: LOOP_FROM, to: RK_END + 1, el: (p) => <SceneHook {...p} u0={-(RK_END - LOOP_FROM)} /> },
];
export const RK_SCENE_TIMES = SCENES.map((s) => [s.from, s.to]);
const DIVE = 0.45;
function diveFactor(t: number) {
  let f = 1;
  for (let i = 0; i < SCENES.length; i++) {
    const sc = SCENES[i], prevAdj = i > 0 && Math.abs(SCENES[i - 1].to - sc.from) < 0.01, nextAdj = i < SCENES.length - 1 && Math.abs(SCENES[i + 1].from - sc.to) < 0.01;
    if (sc.from > 0 && !prevAdj && t > sc.from - DIVE && t <= sc.from) f = Math.max(f, Math.pow(4, Easing.in(Easing.cubic)((t - (sc.from - DIVE)) / DIVE)));
    if (!nextAdj && sc.to <= RK_END && t >= sc.to && t < sc.to + 0.7) f = Math.max(f, Math.pow(4, 1 - Easing.out(Easing.cubic)((t - sc.to) / 0.7)));
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
  const exitK = nextAdj || sc.to > RK_END ? 0 : interpolate(t, [sc.to - 0.25, sc.to], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
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

// ---------- map: world-atlas 50m; 10m coastline around the Outer Banks for the close-ups ----------
const proj = geoMercator().scale(600).translate([0, 0]).clipExtent([[-8000, -8000], [8000, 8000]]);
const path = geoPath(proj);
const P = (ll: LL) => proj(ll) as [number, number];
const land = feature(worldTopo as any, (worldTopo as any).objects.land) as any;
const borders = mesh(worldTopo as any, (worldTopo as any).objects.countries, (a: any, b: any) => a !== b) as any;
const a0 = P([-78.5, 37.4]), a1 = P([-74.2, 34.4]);
const projNC = geoMercator().scale(600).translate([0, 0]).clipExtent([[a0[0], a0[1]], [a1[0], a1[1]]]);
const land10 = feature(land10Topo as any, (land10Topo as any).objects.land) as any;
const ROA: LL = [-75.67, 35.89], CRO: LL = [-75.55, 35.25], ENG: LL = [-4.14, 50.37], NCL: LL = [-77.6, 35.7];
const cl = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const ease = Easing.inOut(Easing.cubic);
type Cam = { c: [number, number]; z: number };
const lerpCam = (a: Cam, b: Cam, k: number): Cam => ({ c: [a.c[0] + (b.c[0] - a.c[0]) * k, a.c[1] + (b.c[1] - a.c[1]) * k], z: a.z * Math.pow(b.z / a.z, k) });
const EAST: Cam = { c: P([-78, 37.5]), z: 3.2 };
const NC: Cam = { c: P([-76.4, 35.7]), z: 34 };
const ATL: Cam = { c: P([-40, 44]), z: 1.15 };
const CROC: Cam = { c: P([-75.62, 35.57]), z: 52 };
function baseCamera(t: number): Cam {
  const seg = (t0: number, t1: number, a: Cam, b: Cam) => lerpCam(a, b, ease(interpolate(t, [t0, t1], [0, 1], cl)));
  if (t < 9) return seg(6.2, 8.6, { c: ATL.c, z: 1.6 }, EAST);
  if (t < 20) return seg(11.6, 12.5, EAST, NC);
  if (t < 30) return seg(21.6, 22.5, NC, ATL);
  return seg(45.1, 46.0, NC, CROC);
}
const camera = (t: number): Cam => { const c = baseCamera(t); return { c: c.c, z: c.z * diveFactor(t) }; };
const ShipIcon: React.FC<{ x: number; y: number; s?: number; flip?: boolean; color?: string; sail?: string }> = ({ x, y, s = 1, flip, color = "#6a4a2a", sail = "#efe6cc" }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <path d="M -40 -4 L 44 -4 L 34 12 L -34 12 Z" fill={color} stroke="#000" strokeWidth={3} />
    {[-18, 4, 22].map((mx) => <path key={mx} d={`M ${mx - 9} -36 L ${mx + 9} -36 L ${mx + 8} -8 L ${mx - 8} -8 Z`} fill={sail} stroke="#000" strokeWidth={2} />)}
  </g>
);

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

export const Roanoke: React.FC<{ sound?: string; words?: Word[]; clean?: boolean }> = ({ sound, words, clean }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cam = camera(t);
  const z = cam.z;
  const toS = (ll: LL): [number, number] => { const p = P(ll); return [540 + (p[0] - cam.c[0]) * z, 960 + (p[1] - cam.c[1]) * z]; };
  const sw = (px: number) => px / z;
  const caps = useMemo(() => chunks(words && words.length ? words : (WORDS as Word[])), [words]);
  const cap = caps.find((c) => t >= c.s && t < c.e);
  const S = useMemo(() => ({ land: path(land) ?? "", borders: path(borders) ?? "", nc: geoPath(projNC)(land10) ?? "" }), []);
  const showMap = (a: number, b: number) => t >= a && t < b;
  const roa = toS(ROA), cro = toS(CRO), eng = toS(ENG), ncl = toS(NCL);
  const detail = z > 8;
  const year = t < 22.9 ? "" : t < 23.5 ? "1588" : t < 24.0 ? "1589" : "1590";
  return (
    <AbsoluteFill style={{ backgroundColor: "#4f8e8f", overflow: "hidden" }}>
      <style>{`@font-face{font-family:"AntonT";src:url(${staticFile("anton.ttf")})}`}</style>
      <AbsoluteFill>
        <svg viewBox="0 0 1080 1920" width="100%" height="100%">
          <defs><radialGradient id="seaG" cx="50%" cy="45%" r="75%"><stop offset="0" stopColor="#6aa6a3" /><stop offset="1" stopColor="#3f7c80" /></radialGradient></defs>
          <rect width={1080} height={1920} fill="url(#seaG)" />
          <g transform={`translate(540 960) scale(${z}) translate(${-cam.c[0]} ${-cam.c[1]})`}>
            {!detail && <path d={S.land} fill="#ecdcb0" stroke="#3a2418" strokeWidth={sw(3)} />}
            {detail && <path d={S.nc} fillRule="evenodd" fill="#ecdcb0" stroke="#3a2418" strokeWidth={sw(3)} />}
            {!detail && <path d={S.borders} fill="none" stroke="#3a2418" strokeWidth={sw(1.4)} opacity={0.45} />}
          </g>
        </svg>
      </AbsoluteFill>

      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0, display: clean ? "none" : undefined }}>
        {showMap(11.6, 13.7) && <g>
          <Pin x={roa[0]} y={roa[1]} k={pop(t, 11.75)} />
          <Tag x={roa[0] + 60} y={roa[1] - 120} t={t} at={11.9} until={13.7} text="ROANOKE ISLAND" size={40} />
          <Tag x={ncl[0]} y={ncl[1]} t={t} at={12.6} until={13.7} text="NORTH CAROLINA" size={34} bg="#f2e3b5" fg="#1b140d" />
        </g>}
        {showMap(21.6, 24.5) && <g>
          <path d={`M ${roa[0]} ${roa[1]} Q ${(roa[0] + eng[0]) / 2} ${Math.min(roa[1], eng[1]) - 160} ${eng[0]} ${eng[1]}`} fill="none" stroke="#1b140d" strokeWidth={6} strokeDasharray="16 12" opacity={interpolate(t, [21.7, 22.0], [0, 1], cl)} />
          <Pin x={roa[0]} y={roa[1]} k={1} />
          <Pin x={eng[0]} y={eng[1]} k={pop(t, 21.8)} color="#3a3a6a" />
          <Tag x={eng[0] - 20} y={eng[1] - 120} t={t} at={21.9} until={24.5} text="ENGLAND" size={34} bg="#1f3a5a" fg="#fff" />
          {[0, 1, 2, 3].map((i) => { const p = toS([-9 + i * 1.6, 47.2 + (i % 2) * 0.9]); return t > 22.0 + i * 0.12 ? <ShipIcon key={i} x={p[0]} y={p[1]} s={1.3 * pop(t, 22.0 + i * 0.12)} flip color="#8a2a1f" sail="#f2c94c" /> : null; })}
          <Tag x={eng[0] - 80} y={eng[1] + 150} t={t} at={22.1} until={24.5} text="SPANISH ARMADA" size={30} bg="#8a2a1f" fg="#fff" />
        </g>}
        {showMap(45.1, 47.7) && <g>
          <path d={`M ${roa[0]} ${roa[1] + 10} Q ${roa[0] + 120} ${(roa[1] + cro[1]) / 2} ${cro[0]} ${cro[1] - 70}`} fill="none" stroke="#1b140d" strokeWidth={7} strokeDasharray="18 12" opacity={interpolate(t, [45.5, 45.9], [0, 1], cl)} />
          <Pin x={roa[0]} y={roa[1]} k={1} />
          <Pin x={cro[0]} y={cro[1]} k={pop(t, 45.3)} color="#2e7a3e" />
          <Tag x={cro[0] - 40} y={cro[1] + 70} t={t} at={45.4} until={47.7} text="CROATOAN" size={42} bg="#2e7a3e" fg="#fff" />
          <Tag x={cro[0] - 40} y={cro[1] + 160} t={t} at={46.2} until={47.7} text="FRIENDLY" size={32} />
        </g>}
      </svg>

      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%)" }} />
      <Img src={staticFile("pony/grain.png")} style={{ position: "absolute", inset: 0, width: 1080, height: 1920, opacity: 0.22, mixBlendMode: "multiply" }} />

      {!clean && <SceneLayer t={t} frame={frame} />}
      {!clean && <>
      <Big t={t} at={-0.5} until={6.1} text="THEY VANISHED" color="#fff" size={140} y={110} serif={false} />
      <Big t={t} at={3.0} until={6.1} text="ONE WORD LEFT" color="#ffd23f" size={140} y={270} serif={false} />
      <Big t={t} at={6.3} until={8.7} text="WHAT DID" color="#fff" size={150} y={150} serif={false} />
      <Big t={t} at={6.3} until={8.7} text="IT MEAN?" color="#ffd23f" size={170} y={310} serif={false} />
      <Big t={t} at={12.0} until={13.6} text="1587" size={150} y={170} />
      <Big t={t} at={22.9} until={24.45} text={year} size={150} y={170} />
      <Big t={t} at={55.6} until={RK_END + 0.5} text="THEY VANISHED" color="#fff" size={140} y={110} serif={false} />
      </>}

      {cap && !clean && (
        <div style={{ position: "absolute", top: 1420, left: 60, right: 60, textAlign: "center", fontFamily: fonts.sans, fontWeight: 900, fontSize: 66, lineHeight: 1.1,
          color: "#fff", WebkitTextStroke: "9px #000", paintOrder: "stroke fill", textShadow: "0 6px 0 #000", transform: `scale(${interpolate(t, [cap.s, cap.s + 0.08], [0.9, 1], cl)})` }}>{cap.text}</div>
      )}
      {sound && <Audio src={staticFile(sound)} />}
    </AbsoluteFill>
  );
};
