import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { geoAlbers, geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";
import worldTopo from "world-atlas/countries-50m.json";
import statesTopo from "us-atlas/states-10m.json";
import { fonts } from "../theme";
import { SceneRiverNight, SceneTown, SceneShaking, SceneUplift, SceneReverse, SceneBoats, SceneFalls, SceneDestroyed, SceneSink, SceneCapital } from "../sets/madridScenes";

/**
 * The Night the Mississippi Ran Backward (New Madrid, 7 Feb 1812) — voiced map Short, Pony Express style, 45–60 s.
 * Cues are timed to the narration's word timestamps (shorts/mississippi-backward-2026-11-14/words.json).
 * Storyboard: social/scripts/ulARZlhrP30.md.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
type LL = [number, number];
type Word = { w: string; s: number; e: number };

// ---------- ground scenes ----------
type SceneDef = { from: number; to: number; el: (p: { lt: number; dur: number; frame: number }) => React.ReactNode };
export const MADRID_END = 54.0;
const SCENES: SceneDef[] = [
  { from: 0, to: 5.2, el: (p) => <SceneRiverNight {...p} u0={0.6} /> },
  { from: 11.2, to: 14.45, el: (p) => <SceneTown {...p} /> },
  { from: 14.45, to: 18.1, el: (p) => <SceneShaking {...p} /> },
  { from: 23.75, to: 26.5, el: (p) => <SceneUplift {...p} /> },
  { from: 26.5, to: 28.25, el: (p) => <SceneReverse {...p} /> },
  { from: 28.25, to: 30.7, el: (p) => <SceneBoats {...p} /> },
  { from: 30.7, to: 32.95, el: (p) => <SceneFalls {...p} /> },
  { from: 32.95, to: 35.25, el: (p) => <SceneDestroyed {...p} /> },
  { from: 35.25, to: 38.85, el: (p) => <SceneSink {...p} /> },
  { from: 42.6, to: 46.15, el: (p) => <SceneCapital {...p} /> },
  { from: 49.1, to: MADRID_END + 1, el: (p) => <SceneRiverNight {...p} u0={0.6 - (MADRID_END - 49.1)} /> },
];
export const MADRID_SCENE_TIMES = SCENES.map((s) => [s.from, s.to]);
const DIVE = 0.45;
function diveFactor(t: number) {
  let f = 1;
  for (let i = 0; i < SCENES.length; i++) {
    const sc = SCENES[i], prevAdj = i > 0 && Math.abs(SCENES[i - 1].to - sc.from) < 0.01, nextAdj = i < SCENES.length - 1 && Math.abs(SCENES[i + 1].from - sc.to) < 0.01;
    if (sc.from > 0 && !prevAdj && t > sc.from - DIVE && t <= sc.from) f = Math.max(f, Math.pow(4, Easing.in(Easing.cubic)((t - (sc.from - DIVE)) / DIVE)));
    if (!nextAdj && sc.to <= MADRID_END && t >= sc.to && t < sc.to + 0.7) f = Math.max(f, Math.pow(4, 1 - Easing.out(Easing.cubic)((t - sc.to) / 0.7)));
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
  const exitK = nextAdj || sc.to > MADRID_END ? 0 : interpolate(t, [sc.to - 0.25, sc.to], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
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
const NM: LL = [-89.53, 36.586], DEC16: LL = [-89.92, 35.93], JAN23: LL = [-89.7, 36.42], DC: LL = [-77.04, 38.9];
const MISS: LL[] = [[-95.2, 47.24], [-94.4, 46.4], [-93.27, 44.98], [-91.9, 44.1], [-91.25, 43.0], [-90.6, 42.5], [-91.1, 40.8], [-91.4, 40.4], [-90.2, 38.8], [-89.9, 37.9], [-89.5, 37.3], [-89.18, 37.0], [-89.3, 36.75], [-89.53, 36.58], [-89.56, 36.45], [-89.6, 36.3], [-89.9, 35.9], [-90.05, 35.15], [-90.6, 34.4], [-91.1, 33.4], [-91.1, 32.3], [-91.4, 31.4], [-91.2, 30.9], [-91.18, 30.45], [-90.07, 29.95], [-89.4, 29.2]];
const OHIO: LL[] = [[-80.0, 40.44], [-81.5, 39.4], [-82.6, 38.7], [-84.5, 39.1], [-85.76, 38.25], [-87.5, 37.9], [-88.4, 37.2], [-89.18, 37.0]];
const MISSOURI: LL[] = [[-90.2, 38.8], [-92.2, 38.6], [-94.6, 39.1], [-95.9, 41.25], [-96.6, 42.5], [-98.0, 42.9], [-100.4, 44.4], [-101.0, 46.5]];
const REELFOOT: LL[] = [[-89.47, 36.5], [-89.4, 36.49], [-89.33, 36.42], [-89.31, 36.33], [-89.37, 36.31], [-89.43, 36.37], [-89.46, 36.44]];
const FAULT: LL[] = [[-90.55, 35.55], [-90.1, 35.9], [-89.75, 36.2], [-89.5, 36.4], [-89.45, 36.6], [-89.2, 36.95]];
const lineD = (pts: LL[]) => "M " + pts.map((ll) => P(ll).join(" ")).join(" L ");
const polyD = (pts: LL[]) => lineD(pts) + " Z";

const cl = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const ease = Easing.inOut(Easing.cubic);
type Cam = { c: [number, number]; z: number };
const lerpCam = (a: Cam, b: Cam, k: number): Cam => ({ c: [a.c[0] + (b.c[0] - a.c[0]) * k, a.c[1] + (b.c[1] - a.c[1]) * k], z: a.z * Math.pow(b.z / a.z, k) });
const US: Cam = { c: P([-91, 38.5]), z: 1.55 };
const US2: Cam = { c: P([-90, 37.5]), z: 2.1 };
const VAL: Cam = { c: P([-89.7, 36.4]), z: 9 };
const NMC: Cam = { c: P([-89.53, 36.55]), z: 16 };
const TN: Cam = { c: P([-89.42, 36.42]), z: 26 };
const EAST: Cam = { c: P([-84, 37.6]), z: 3.2 };
function baseCamera(t: number): Cam {
  const seg = (t0: number, t1: number, a: Cam, b: Cam) => lerpCam(a, b, ease(interpolate(t, [t0, t1], [0, 1], cl)));
  if (t < 8.6) return seg(5.2, 8.5, US, US2);
  if (t < 11.2) return seg(8.6, 10.6, US2, VAL);
  if (t < 21.4) return VAL;
  if (t < 23.75) return seg(21.4, 22.6, VAL, NMC);
  if (t < 38.85) return VAL;
  if (t < 42.6) return seg(38.85, 39.8, VAL, TN);
  if (t < 46.15) return EAST;
  return seg(46.15, 47.0, { c: VAL.c, z: 5 }, VAL);
}
const shakeAt = (t: number) => (t > 22.9 && t < 23.75 ? 1 : 0) + (t > 18.2 && t < 18.7 ? 0.5 : 0) + (t > 18.9 && t < 19.3 ? 0.4 : 0);
const camera = (t: number): Cam => { const c = baseCamera(t); return { c: c.c, z: c.z * diveFactor(t) }; };
const pop = (t: number, at: number, dur = 0.28) => interpolate(t, [at, at + dur * 0.6, at + dur], [0, 1.18, 1], cl);
const fade = (t: number, a: number, b: number, d = 0.2) => interpolate(t, [a, a + d, b - d, b], [0, 1, 1, 0], cl);
const Big: React.FC<{ t: number; at: number; until: number; text: string; y?: number; size?: number; color?: string; serif?: boolean }> = ({ t, at, until, text, y = 360, size = 150, color = "#fff", serif = true }) =>
  t < at || t > until ? null : (
    <div style={{ position: "absolute", top: y, width: "100%", textAlign: "center", transform: `scale(${pop(t, at, 0.3)})`, opacity: fade(t, at, until, 0.15),
      fontFamily: serif ? fonts.serif : "AntonT, Impact, sans-serif", fontWeight: serif ? 700 : 400, fontSize: size, color, lineHeight: 1.05,
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
  const fix = (w: string) => w;
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


export const NewMadrid: React.FC<{ sound?: string; words?: Word[] }> = ({ sound, words = [] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cam = camera(t);
  const z = cam.z;
  const sh = shakeAt(t);
  const shx = Math.sin(frame * 2.3) * 14 * sh, shy = Math.cos(frame * 2.9) * 10 * sh;
  const toS = (ll: LL): [number, number] => { const p = P(ll); return [540 + (p[0] - cam.c[0]) * z + shx, 960 + (p[1] - cam.c[1]) * z + shy]; };
  const sw = (px: number) => px / z;
  const caps = useMemo(() => chunks(words), [words]);
  const cap = caps.find((c) => t >= c.s && t < c.e);
  const S = useMemo(() => ({
    land: path(land) ?? "", can: path(world.features.find((f: any) => f.id === "124")) ?? "", mex: path(world.features.find((f: any) => f.id === "484")) ?? "",
    us: path(world.features.find((f: any) => f.id === "840")) ?? "", mesh: path(stateMesh) ?? "",
    mo: stateP("Missouri"), tn: stateP("Tennessee"), miss: lineD(MISS), ohio: lineD(OHIO), missouri: lineD(MISSOURI), reel: polyD(REELFOOT), fault: lineD(FAULT),
  }), []);
  // flow chevrons along the Mississippi: point south, then flip north at 6.6 s ("wrong way")
  const flip = interpolate(t, [6.4, 6.9], [1, -1], cl);
  const chev = [0.25, 0.45, 0.62, 0.8].map((f) => {
    const i = Math.floor(f * (MISS.length - 1)), a = MISS[i], b = MISS[i + 1];
    const pa = toS(a), pb = toS(b), ang = (Math.atan2(pb[1] - pa[1], pb[0] - pa[0]) * 180) / Math.PI;
    return { x: (pa[0] + pb[0]) / 2, y: (pa[1] + pb[1]) / 2, ang };
  });
  const nm = toS(NM), d16 = toS(DEC16), j23 = toS(JAN23), dc = toS(DC);
  const ring = (c: [number, number], at: number, maxR: number, color = "#c62828", n = 3) => t < at || t > at + 2.4 ? null : (
    <g>{Array.from({ length: n }, (_, i) => { const k = (t - at - i * 0.25) / 1.2; if (k < 0 || k > 1) return null; return <circle key={i} cx={c[0]} cy={c[1]} r={maxR * k} fill="none" stroke={color} strokeWidth={10 * (1 - k) + 2} opacity={1 - k} />; })}</g>
  );
  const after = t >= 19.6 && t < 21.4 ? Array.from({ length: 26 }, (_, i) => {
    const r1 = Math.sin(i * 12.9898) * 43758.5453, r2 = Math.sin(i * 78.233) * 43758.5453;
    const f = r1 - Math.floor(r1), g = r2 - Math.floor(r2);
    const k = Math.floor(f * (FAULT.length - 1)), a = FAULT[k], b = FAULT[k + 1];
    const ll: LL = [a[0] + (b[0] - a[0]) * g + (g - 0.5) * 0.25, a[1] + (b[1] - a[1]) * g + (f - 0.5) * 0.2];
    return { p: toS(ll), at: 19.65 + i * 0.055 };
  }) : [];
  const showRivers = t >= 5.2 && !(t >= 42.6 && t < 46.15);
  const lakeK = interpolate(t, [39.6, 40.4], [0, 1], cl);
  const faultK = t >= 46.15 && t < 49.1 ? interpolate(t, [46.4, 47.3], [0, 1], cl) : 0;
  const csx = (x: number) => x; // screen coords already include shake
  return (
    <AbsoluteFill style={{ backgroundColor: "#4f8e8f", overflow: "hidden" }}>
      <style>{`@font-face{font-family:"AntonT";src:url(${staticFile("anton.ttf")})}`}</style>
      <AbsoluteFill>
        <svg viewBox="0 0 1080 1920" width="100%" height="100%">
          <defs><radialGradient id="seaG" cx="50%" cy="45%" r="75%"><stop offset="0" stopColor="#6aa6a3" /><stop offset="1" stopColor="#3f7c80" /></radialGradient></defs>
          <rect width={1080} height={1920} fill="url(#seaG)" />
          <g transform={`translate(${540 + shx} ${960 + shy}) scale(${z}) translate(${-cam.c[0]} ${-cam.c[1]})`}>
            <path d={S.land} fill="#dcc89c" stroke="#5a4428" strokeWidth={sw(2.2)} />
            <path d={S.can} fill="#e2d1a4" stroke="#3a2418" strokeWidth={sw(3)} />
            <path d={S.mex} fill="#e2d1a4" stroke="#3a2418" strokeWidth={sw(3)} />
            <path d={S.us} fill="#ecdcb0" stroke="#3a2418" strokeWidth={sw(3.5)} />
            <path d={S.mo} fill="#d8a66a" opacity={interpolate(t, [8.8, 9.8], [0, 0.85], cl)} />
            <path d={S.tn} fill="#d8a66a" opacity={t >= 38.85 && t < 42.6 ? interpolate(t, [38.9, 39.5], [0, 0.85], cl) : 0} />
            <path d={S.mesh} fill="none" stroke="#8a6a44" strokeWidth={sw(1.6)} />
            {showRivers && <g>
              {[S.ohio, S.missouri].map((d, i) => <path key={i} d={d} fill="none" stroke="#3f8f95" strokeWidth={sw(4.5)} strokeLinecap="round" strokeLinejoin="round" />)}
              <path d={S.miss} fill="none" stroke="#2a7f8a" strokeWidth={sw(t < 11.2 ? 9 : 7)} strokeLinecap="round" strokeLinejoin="round" />
              {t < 11.2 && <path d={S.miss} fill="none" stroke="#7fe0e6" strokeWidth={sw(3.5)} strokeLinecap="round" strokeLinejoin="round" opacity={0.8} />}
            </g>}
            {lakeK > 0 && t < 42.6 && <path d={S.reel} fill="#3f8f95" stroke="#1d4f55" strokeWidth={sw(3)} opacity={lakeK} />}
            {faultK > 0 && <path d={S.fault} fill="none" stroke="#c62828" strokeWidth={sw(10)} strokeDasharray={`${sw(24)} ${sw(14)}`} strokeLinecap="round" opacity={0.6 + 0.4 * Math.abs(Math.sin(t * 4))} pathLength={1} style={{}} />}
          </g>
        </svg>
      </AbsoluteFill>

      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        {t >= 5.2 && t < 11.2 && chev.map((c, i) => (
          <g key={i} transform={`translate(${c.x} ${c.y}) rotate(${c.ang}) scale(${flip} 1)`}>
            <path d="M -18 -22 L 16 0 L -18 22" fill="none" stroke="#000" strokeOpacity={0.4} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M -18 -22 L 16 0 L -18 22" fill="none" stroke={flip < 0 ? "#ffd23f" : "#fff"} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ))}
        {ring(d16, 18.2, 260)}
        {ring(j23, 18.9, 260)}
        {after.map((a, i) => t >= a.at ? <circle key={i} cx={csx(a.p[0])} cy={a.p[1]} r={9 * pop(t, a.at)} fill="#c62828" stroke="#000" strokeWidth={2} /> : null)}
        {ring(nm, 22.9, 520, "#c62828", 4)}
        {t >= 9.9 && t < 23.75 ? <Pin x={nm[0]} y={nm[1]} k={pop(t, 9.9)} /> : null}
        {t >= 46.15 && t < 49.1 ? <Pin x={nm[0]} y={nm[1]} k={pop(t, 46.3)} /> : null}
        <Tag x={nm[0]} y={nm[1] + 70} t={t} at={10.3} until={11.2} text="NEW MADRID" size={42} bg="#1b140d" fg="#f2e3b5" />
        <Tag x={d16[0] - 60} y={d16[1] + 80} t={t} at={18.25} until={21.4} text="DEC 16, 1811" size={36} bg="#1b140d" fg="#f2e3b5" />
        <Tag x={j23[0] - 120} y={j23[1] - 90} t={t} at={18.95} until={21.4} text="JAN 23, 1812" size={36} bg="#1b140d" fg="#f2e3b5" />
        <Tag x={nm[0]} y={nm[1] + 70} t={t} at={21.5} until={23.75} text="NEW MADRID" size={42} bg="#1b140d" fg="#f2e3b5" />
        {(() => { const c = toS([-89.39, 36.41]); return <Tag x={c[0]} y={c[1] + 150} t={t} at={39.9} until={42.6} text="REELFOOT LAKE" size={46} bg="#1b140d" fg="#f2e3b5" />; })()}
        <Tag x={nm[0] + 40} y={nm[1] + 90} t={t} at={46.5} until={49.1} text="NEW MADRID FAULT ZONE" size={34} bg="#1b140d" fg="#f2e3b5" />
      </svg>

      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%)" }} />
      <Img src={staticFile("pony/grain.png")} style={{ position: "absolute", inset: 0, width: 1080, height: 1920, opacity: 0.22, mixBlendMode: "multiply" }} />

      <SceneLayer t={t} frame={frame} />
      <Big t={t} at={-0.5} until={5.1} text="THE RIVER RAN" color="#fff" size={130} y={190} serif={false} />
      <Big t={t} at={-0.5} until={5.1} text="BACKWARD" color="#ffd23f" size={200} y={340} serif={false} />
      <Big t={t} at={6.0} until={8.5} text="THE WRONG WAY?" serif={false} size={120} color="#ffd23f" y={260} />
      <Big t={t} at={8.62} until={11.1} text="FEB 7, 1812" size={120} y={280} />
      <Big t={t} at={19.7} until={21.35} text="HUNDREDS OF" serif={false} size={110} color="#fff" y={230} />
      <Big t={t} at={19.7} until={21.35} text="AFTERSHOCKS" serif={false} size={130} color="#ffd23f" y={360} />
      <Big t={t} at={21.5} until={23.7} text="3:45 AM" serif={false} size={170} color="#ffd23f" y={250} />
      <Big t={t} at={40.8} until={42.55} text="STILL THERE TODAY" serif={false} size={110} color="#ffd23f" y={260} />
      <Big t={t} at={47.6} until={49.05} text="STILL ACTIVE" serif={false} size={150} color="#ffd23f" y={260} />
      <Big t={t} at={52.2} until={MADRID_END} text="THE RIVER RAN" color="#fff" size={130} y={190} serif={false} />
      <Big t={t} at={52.2} until={MADRID_END} text="BACKWARD" color="#ffd23f" size={200} y={340} serif={false} />
      {t >= 42.6 && t < 46.15 ? null : null}
      {/* DC distance line on the east view is not used (ground scene covers 42.6–46.15) */}
      {dc && null}

      {cap && (
        <div style={{ position: "absolute", top: 1420, left: 60, right: 60, textAlign: "center", fontFamily: fonts.sans, fontWeight: 900, fontSize: 66, lineHeight: 1.1,
          color: "#fff", WebkitTextStroke: "9px #000", paintOrder: "stroke fill", textShadow: "0 6px 0 #000", transform: `scale(${interpolate(t, [cap.s, cap.s + 0.08], [0.9, 1], cl)})` }}>{cap.text}</div>
      )}
      {sound && <Audio src={staticFile(sound)} />}
    </AbsoluteFill>
  );
};
