import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { geoMercator, geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";
import worldTopo from "world-atlas/countries-50m.json";
import statesTopo from "us-atlas/states-10m.json";
import { fonts } from "../theme";
import WORDS from "./batWords.json";
import { Bat, SceneHook, SceneBaseFire, SceneDentist, SceneLetter, SceneFDR, SceneCave, SceneChill, SceneClip, SceneDrop, SceneWake, SceneRoofs, SceneTimer, SceneLoose, SceneHangar, SceneCar, SceneCancel, SceneCalendar } from "../sets/batScenes";

/**
 * The WWII bat bomb (Lytle Adams 1942, Carlsbad Army Airfield fire 1943, Navy Project X-Ray canceled) — voiced map Short, Pony Express style, 45–60 s.
 * Cues are timed to shorts/bat-bomb-2026-11-23/words.json. Storyboard: social/scripts/bat-bomb-2026-11-23.md.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
type LL = [number, number];
type Word = { w: string; s: number; e: number };

// ---------- ground scenes ----------
type SceneDef = { from: number; to: number; el: (p: { lt: number; dur: number; frame: number }) => React.ReactNode };
export const BB_END = 49.8;
const LOOP_FROM = 47.2;
const SCENES: SceneDef[] = [
  { from: 0, to: 3.2, el: (p) => <SceneHook {...p} u0={0} /> },
  { from: 3.2, to: 6.9, el: (p) => <SceneBaseFire {...p} /> },
  { from: 8.6, to: 10.8, el: (p) => <SceneDentist {...p} /> },
  { from: 12.4, to: 14.8, el: (p) => <SceneLetter {...p} /> },
  { from: 14.8, to: 16.9, el: (p) => <SceneFDR {...p} /> },
  { from: 16.9, to: 19.4, el: (p) => <SceneCave {...p} /> },
  { from: 19.4, to: 21.4, el: (p) => <SceneChill {...p} /> },
  { from: 21.4, to: 24.4, el: (p) => <SceneClip {...p} /> },
  { from: 25.9, to: 27.8, el: (p) => <SceneDrop {...p} /> },
  { from: 27.8, to: 29.1, el: (p) => <SceneWake {...p} /> },
  { from: 29.1, to: 30.7, el: (p) => <SceneRoofs {...p} /> },
  { from: 30.7, to: 32.6, el: (p) => <SceneTimer {...p} /> },
  { from: 34.5, to: 36.2, el: (p) => <SceneLoose {...p} /> },
  { from: 36.2, to: 39.4, el: (p) => <SceneHangar {...p} /> },
  { from: 39.4, to: 40.6, el: (p) => <SceneCar {...p} /> },
  { from: 40.6, to: 44.3, el: (p) => <SceneCancel {...p} /> },
  { from: 44.3, to: LOOP_FROM, el: (p) => <SceneCalendar {...p} /> },
  { from: LOOP_FROM, to: BB_END + 1, el: (p) => <SceneHook {...p} u0={-(BB_END - LOOP_FROM)} /> },
];
export const BB_SCENE_TIMES = SCENES.map((s) => [s.from, s.to]);
const DIVE = 0.45;
function diveFactor(t: number) {
  let f = 1;
  for (let i = 0; i < SCENES.length; i++) {
    const sc = SCENES[i], prevAdj = i > 0 && Math.abs(SCENES[i - 1].to - sc.from) < 0.01, nextAdj = i < SCENES.length - 1 && Math.abs(SCENES[i + 1].from - sc.to) < 0.01;
    if (sc.from > 0 && !prevAdj && t > sc.from - DIVE && t <= sc.from) f = Math.max(f, Math.pow(4, Easing.in(Easing.cubic)((t - (sc.from - DIVE)) / DIVE)));
    if (!nextAdj && sc.to <= BB_END && t >= sc.to && t < sc.to + 0.7) f = Math.max(f, Math.pow(4, 1 - Easing.out(Easing.cubic)((t - sc.to) / 0.7)));
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
  const exitK = nextAdj || sc.to > BB_END ? 0 : interpolate(t, [sc.to - 0.25, sc.to], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
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

// ---------- Pacific / North America map (world-atlas 50m land + us-atlas states) ----------
const proj = geoMercator().rotate([170, 0]).scale(600).translate([0, 0]).clipExtent([[-8000, -8000], [8000, 8000]]);
const path = geoPath(proj);
const P = (ll: LL) => proj(ll) as [number, number];
const land = feature(worldTopo as any, (worldTopo as any).objects.land) as any;
const states = feature(statesTopo as any, (statesTopo as any).objects.states) as any;
const stateMesh = mesh(statesTopo as any, (statesTopo as any).objects.states, (a: any, b: any) => a !== b) as any;
const CARLSBAD: LL = [-104.26, 32.34], PEARL: LL = [-157.95, 21.35], TOKYO: LL = [139.7, 35.68];
const cl = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const ease = Easing.inOut(Easing.cubic);
type Cam = { c: [number, number]; z: number };
const lerpCam = (a: Cam, b: Cam, k: number): Cam => ({ c: [a.c[0] + (b.c[0] - a.c[0]) * k, a.c[1] + (b.c[1] - a.c[1]) * k], z: a.z * Math.pow(b.z / a.z, k) });
const USA: Cam = { c: P([-100, 37]), z: 1.7 };
const HAWAII: Cam = { c: P([-150, 28]), z: 1.0 };
const JAPAN: Cam = { c: P([138, 36]), z: 2.2 };
const NM: Cam = { c: P([-105.5, 33.5]), z: 6.5 };
function baseCamera(t: number): Cam {
  const seg = (t0: number, t1: number, a: Cam, b: Cam) => lerpCam(a, b, ease(interpolate(t, [t0, t1], [0, 1], cl)));
  if (t < 8.6) return seg(6.9, 8.4, { c: NM.c, z: 3.5 }, USA);
  if (t < 12.4) return seg(10.8, 11.6, USA, HAWAII);
  if (t < 25.9) return seg(24.4, 25.2, HAWAII, JAPAN);
  return seg(32.6, 33.6, { c: USA.c, z: 1.5 }, NM);
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

const PlaneIcon: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -40 -4 L 40 -6 Q 52 0 40 6 L -40 4 Z" fill="#5a5e52" stroke="#000" strokeWidth={3} />
    <path d="M 0 -4 L -14 -46 L 4 -46 L 16 -4 Z M 0 4 L -14 46 L 4 46 L 16 4 Z" fill="#6a6e60" stroke="#000" strokeWidth={3} />
    <path d="M -34 -4 L -44 -18 L -36 -18 L -26 -4 Z M -34 4 L -44 18 L -36 18 L -26 4 Z" fill="#6a6e60" stroke="#000" strokeWidth={2} />
  </g>
);

export const BatBomb: React.FC<{ sound?: string; words?: Word[]; clean?: boolean }> = ({ sound, words, clean }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cam = camera(t);
  const z = cam.z;
  const toS = (ll: LL): [number, number] => { const p = P(ll); return [540 + (p[0] - cam.c[0]) * z, 960 + (p[1] - cam.c[1]) * z]; };
  const sw = (px: number) => px / z;
  const caps = useMemo(() => chunks(words && words.length ? words : (WORDS as Word[])), [words]);
  const cap = caps.find((c) => t >= c.s && t < c.e);
  const S = useMemo(() => ({ land: path(land) ?? "", mesh: path(stateMesh) ?? "", nm: path(states.features.find((f: any) => f.properties.name === "New Mexico")) ?? "" }), []);
  const showMap = (a: number, b: number) => t >= a && t < b;
  const cb = toS(CARLSBAD), ph = toS(PEARL), tk = toS(TOKYO);
  const nmFill = (showMap(6.9, 8.6) ? 1 : 0) * 0.85 + (showMap(32.6, 34.5) ? interpolate(t, [33.2, 33.7], [0, 0.85], cl) : 0);
  const planeK = interpolate(t, [24.7, 25.9], [0, 1], cl);
  const pl: [number, number] = [toS([131, 33])[0] + (toS([142, 38])[0] - toS([131, 33])[0]) * planeK, toS([131, 33])[1] + (toS([142, 38])[1] - toS([131, 33])[1]) * planeK];
  return (
    <AbsoluteFill style={{ backgroundColor: "#4f8e8f", overflow: "hidden" }}>
      <style>{`@font-face{font-family:"AntonT";src:url(${staticFile("anton.ttf")})}`}</style>
      <AbsoluteFill>
        <svg viewBox="0 0 1080 1920" width="100%" height="100%">
          <defs><radialGradient id="seaG" cx="50%" cy="45%" r="75%"><stop offset="0" stopColor="#6aa6a3" /><stop offset="1" stopColor="#3f7c80" /></radialGradient></defs>
          <rect width={1080} height={1920} fill="url(#seaG)" />
          <g transform={`translate(540 960) scale(${z}) translate(${-cam.c[0]} ${-cam.c[1]})`}>
            <path d={S.land} fill="#ecdcb0" stroke="#3a2418" strokeWidth={sw(3)} />
            <path d={S.nm} fill="#d8a66a" opacity={nmFill} />
            <path d={S.mesh} fill="none" stroke="#3a2418" strokeWidth={sw(1.6)} opacity={0.55} />
          </g>
        </svg>
      </AbsoluteFill>

      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0, display: clean ? "none" : undefined }}>
        {showMap(6.9, 8.6) && <g>
          <Pin x={cb[0]} y={cb[1]} k={pop(t, 7.0)} />
          <Tag x={cb[0]} y={cb[1] + 70} t={t} at={7.1} until={8.6} text="NEW MEXICO" size={40} />
        </g>}
        {showMap(10.8, 12.4) && <g>
          <Pin x={ph[0]} y={ph[1]} k={pop(t, 11.5)} />
          <Tag x={ph[0]} y={ph[1] + 70} t={t} at={11.6} until={12.4} text="PEARL HARBOR" size={40} />
        </g>}
        {showMap(24.4, 25.9) && <g>
          <Tag x={tk[0] + 30} y={tk[1] + 90} t={t} at={24.9} until={25.9} text="JAPAN" size={44} />
          {planeK > 0 && <PlaneIcon x={pl[0]} y={pl[1]} s={1.6} rot={-24} />}
        </g>}
        {showMap(32.6, 34.5) && <g>
          <Pin x={cb[0]} y={cb[1]} k={pop(t, 33.6)} />
          {!clean && <Tag x={cb[0]} y={cb[1] + 70} t={t} at={33.7} until={34.5} text="CARLSBAD ARMY AIRFIELD" size={34} />}
        </g>}
      </svg>

      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%)" }} />
      <Img src={staticFile("pony/grain.png")} style={{ position: "absolute", inset: 0, width: 1080, height: 1920, opacity: 0.22, mixBlendMode: "multiply" }} />

      {!clean && <SceneLayer t={t} frame={frame} />}
      {!clean && <>
      <Big t={t} at={-0.5} until={6.8} text="BOMBS" color="#fff" size={170} y={120} serif={false} />
      <Big t={t} at={-0.5} until={6.8} text="ON BATS" color="#ffd23f" size={170} y={290} serif={false} />
      <Big t={t} at={7.1} until={8.5} text="HOW?" color="#ffd23f" size={190} y={220} serif={false} />
      <Big t={t} at={11.0} until={12.3} text="DEC 7, 1941" size={120} y={220} />
      <Big t={t} at={32.8} until={34.4} text="MAY 1943" size={130} y={220} />
      <Big t={t} at={41.6} until={44.2} text="$2 MILLION" color="#ffd23f" size={150} y={170} serif={false} />
      <Big t={t} at={47.6} until={BB_END + 0.5} text="BOMBS" color="#fff" size={170} y={120} serif={false} />
      <Big t={t} at={47.6} until={BB_END + 0.5} text="ON BATS" color="#ffd23f" size={170} y={290} serif={false} />
      </>}

      {cap && !clean && (
        <div style={{ position: "absolute", top: 1420, left: 60, right: 60, textAlign: "center", fontFamily: fonts.sans, fontWeight: 900, fontSize: 66, lineHeight: 1.1,
          color: "#fff", WebkitTextStroke: "9px #000", paintOrder: "stroke fill", textShadow: "0 6px 0 #000", transform: `scale(${interpolate(t, [cap.s, cap.s + 0.08], [0.9, 1], cl)})` }}>{cap.text}</div>
      )}
      {sound && <Audio src={staticFile(sound)} />}
    </AbsoluteFill>
  );
};

/** the channel's bat (with its napalm capsule) on a transparent background, for the thumbnail cutout */
export const BatCut: React.FC = () => (
  <AbsoluteFill><svg viewBox="0 0 1000 1000" width="100%" height="100%"><Bat x={500} y={560} s={5.6} flap={0.22} bomb rot={-8} /></svg></AbsoluteFill>
);
