import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { geoAlbers, geoPath, geoInterpolate, geoDistance } from "d3-geo";
import { feature, mesh } from "topojson-client";
import worldTopo from "world-atlas/countries-50m.json";
import statesTopo from "us-atlas/states-10m.json";
import { Horse } from "../sets/horse";
import { fonts } from "../theme";
import { SceneArrival, SceneBlizzard, SceneClosed, SceneCounter, SceneCrew, SceneDesert, SceneDusk, SceneGallop, SceneNewsboy, SceneNight, SceneOffice, SceneRelay, SceneRider, SceneStJoseph, SceneTelegraph } from "../sets/ponyScenes";

// ---------- ground scenes (dive from the map into the place, then back out) ----------
type SceneDef = { from: number; to: number; el: (p: { lt: number; dur: number; frame: number }) => React.ReactNode };
const SCENES: SceneDef[] = [
  { from: 4.9, to: 12.4, el: (p) => <SceneGallop {...p} /> },
  { from: 21.4, to: 24.2, el: (p) => <SceneStJoseph {...p} /> },
  { from: 32.6, to: 37.2, el: (p) => <SceneOffice {...p} /> },
  { from: 42.6, to: 47.8, el: (p) => <SceneRelay {...p} /> },
  { from: 47.8, to: 54.6, el: (p) => <SceneRider {...p} /> },
  { from: 62.5, to: 64.3, el: (p) => <SceneDesert {...p} /> },
  { from: 64.3, to: 66.2, el: (p) => <SceneBlizzard {...p} /> },
  { from: 66.2, to: 69.5, el: (p) => <SceneNight {...p} /> },
  { from: 69.5, to: 75.0, el: (p) => <SceneArrival {...p} /> },
  { from: 75.0, to: 78.7, el: (p) => <SceneCounter {...p} /> },
  { from: 78.7, to: 81.4, el: (p) => <SceneNewsboy {...p} /> },
  { from: 86.3, to: 90.9, el: (p) => <SceneDusk {...p} /> },
  { from: 90.9, to: 94.4, el: (p) => <SceneCrew {...p} /> },
  { from: 98.2, to: 101.9, el: (p) => <SceneTelegraph {...p} /> },
  { from: 101.9, to: 105.6, el: (p) => <SceneClosed {...p} /> },
  { from: 105.6, to: 110.6, el: (p) => <SceneOffice {...p} sad /> },
  { from: 110.6, to: 116.0, el: (p) => <SceneGallop {...p} silhouette sky={["#3a1f3a", "#f08a4b"]} sun="#ffcf7a" /> },
];
export const SCENE_TIMES = SCENES.map((s) => [s.from, s.to]);
const DIVE = 0.45;
/** map zoom multiplier: the camera dives into the place before a scene and pulls back out after it */
function diveFactor(t: number) {
  let f = 1;
  for (let i = 0; i < SCENES.length; i++) {
    const sc = SCENES[i], prevAdj = i > 0 && Math.abs(SCENES[i - 1].to - sc.from) < 0.01, nextAdj = i < SCENES.length - 1 && Math.abs(SCENES[i + 1].from - sc.to) < 0.01;
    if (!prevAdj && t > sc.from - DIVE && t <= sc.from) f = Math.max(f, Math.pow(4, Easing.in(Easing.cubic)((t - (sc.from - DIVE)) / DIVE)));
    if (!nextAdj && t >= sc.to && t < sc.to + 0.7) f = Math.max(f, Math.pow(4, 1 - Easing.out(Easing.cubic)((t - sc.to) / 0.7)));
  }
  return f;
}
const SceneLayer: React.FC<{ t: number; frame: number }> = ({ t, frame }) => {
  const i = SCENES.findIndex((s) => t >= s.from && t < s.to);
  if (i < 0) return null;
  const sc = SCENES[i], lt = t - sc.from, dur = sc.to - sc.from;
  const prevAdj = i > 0 && Math.abs(SCENES[i - 1].to - sc.from) < 0.01;
  const nextAdj = i < SCENES.length - 1 && Math.abs(SCENES[i + 1].from - sc.to) < 0.01;
  // enter: dive (scale down from 1.35 + flash) or whip (slide in from the right)
  const enter = Math.min(1, lt / (prevAdj ? 0.3 : 0.4));
  const exitK = nextAdj ? 0 : interpolate(t, [sc.to - 0.25, sc.to], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = (prevAdj ? 1 : 1.35 - 0.35 * Easing.out(Easing.cubic)(enter)) * (1 + exitK * 0.6);
  const tx = prevAdj ? (1 - Easing.out(Easing.cubic)(enter)) * 1080 : 0;
  const blur = prevAdj ? (1 - enter) * 18 : (1 - enter) * 10 + exitK * 12;
  const opacity = prevAdj ? 1 : Math.min(1, enter * 2.5) * (1 - exitK);
  const prev = prevAdj && enter < 1 ? SCENES[i - 1] : null;
  return (
    <AbsoluteFill>
      {prev && <AbsoluteFill style={{ transform: `translateX(${-Easing.out(Easing.cubic)(enter) * 1080}px)`, filter: `blur(${enter * 18}px)` }}>
        <svg viewBox="0 0 1080 1920" width="100%" height="100%"><g transform="translate(0 -130)">{prev.el({ lt: prev.to - prev.from, dur: prev.to - prev.from, frame })}</g></svg>
      </AbsoluteFill>}
      <AbsoluteFill style={{ opacity, transform: `translateX(${tx}px) scale(${scale})`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>
        <svg viewBox="0 0 1080 1920" width="100%" height="100%"><g transform="translate(0 -130)">{sc.el({ lt, dur, frame })}</g></svg>
      </AbsoluteFill>
      {!prevAdj && lt < 0.25 && <AbsoluteFill style={{ backgroundColor: "#fff", opacity: 0.55 * (1 - lt / 0.25) }} />}
    </AbsoluteFill>
  );
};

/**
 * VOICED map Short (user rule 2026-11-01): Pony Express, ~2 min, Jesse narration.
 * Every visual cue below is timed to the narration's word timestamps (words.json).
 * Continuous camera over a real map; captions in 1–4-word chunks; big pops for numbers/dates.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
type LL = [number, number];
type Word = { w: string; s: number; e: number };
const proj = geoAlbers().rotate([98, 0]).center([0, 38]).parallels([29.5, 45.5]).scale(1300).translate([0, 0]).clipExtent([[-2600, -2200], [2600, 2200]]);
const path = geoPath(proj);
const P = (ll: LL) => proj(ll) as [number, number];
const world = feature(worldTopo as any, (worldTopo as any).objects.countries) as any;
const land = feature(worldTopo as any, (worldTopo as any).objects.land) as any;
const states = feature(statesTopo as any, (statesTopo as any).objects.states) as any;
const stateMesh = mesh(statesTopo as any, (statesTopo as any).objects.states, (a: any, b: any) => a !== b) as any;

const ROUTE: { at: LL; name?: string }[] = [
  { at: [-94.8467, 39.7675], name: "St. Joseph" }, { at: [-96.6497, 39.8403] }, { at: [-98.9806, 40.6447], name: "Fort Kearny" },
  { at: [-102.2633, 40.9886] }, { at: [-104.5583, 42.2117], name: "Fort Laramie" }, { at: [-108.9, 42.35], name: "South Pass" },
  { at: [-110.389, 41.318] }, { at: [-111.891, 40.7608], name: "Salt Lake City" }, { at: [-114.7, 40.1] }, { at: [-117.6, 39.5], name: "Nevada desert" },
  { at: [-119.7674, 39.1638], name: "Sierra Nevada" }, { at: [-120.7983, 38.7296] }, { at: [-121.4944, 38.5816], name: "Sacramento" },
];
const RAIL: LL[] = [[-74.0, 40.7], [-80.0, 40.44], [-87.63, 41.88], [-91.36, 39.71], [-94.8467, 39.7675]];
const DENSE = (() => {
  const out: { ll: LL; d: number }[] = []; let d = 0;
  for (let i = 0; i < ROUTE.length - 1; i++) {
    const f = geoInterpolate(ROUTE[i].at, ROUTE[i + 1].at);
    for (let k = 0; k < 20; k++) { const ll = f(k / 20) as LL; if (out.length) d += geoDistance(out[out.length - 1].ll, ll); out.push({ ll, d }); }
  }
  const last = ROUTE[ROUTE.length - 1].at; d += geoDistance(out[out.length - 1].ll, last); out.push({ ll: last, d });
  return out.map((p) => ({ ...p, d: p.d / d }));
})();
const routeAt = (u: number): LL => {
  if (u < 0) { const a = ROUTE[0].at; return [a[0] - u * 12, a[1] - u * 0.6]; } // east of St. Joseph (riding in)
  u = Math.min(1, u);
  for (let i = 1; i < DENSE.length; i++) if (DENSE[i].d >= u) {
    const a = DENSE[i - 1], b = DENSE[i], k = (u - a.d) / Math.max(1e-9, b.d - a.d);
    return [a.ll[0] + (b.ll[0] - a.ll[0]) * k, a.ll[1] + (b.ll[1] - a.ll[1]) * k];
  }
  return DENSE[DENSE.length - 1].ll;
};
const lineUpTo = (u: number) => { const pts = DENSE.filter((p) => p.d <= u).map((p) => p.ll); pts.push(routeAt(u)); return path({ type: "LineString", coordinates: pts } as any) ?? ""; };
const ROUTE_D = path({ type: "LineString", coordinates: DENSE.map((p) => p.ll) } as any) ?? "";
const RAIL_D = path({ type: "LineString", coordinates: RAIL } as any) ?? "";
const uOf = (name: string) => { const ll = ROUTE.find((r) => r.name === name)!.at; let best = 0, bd = 9; DENSE.forEach((p) => { const dd = geoDistance(p.ll, ll); if (dd < bd) { bd = dd; best = p.d; } }); return best; };
const U = { kearny: uOf("Fort Kearny"), laramie: uOf("Fort Laramie"), pass: uOf("South Pass"), slc: uOf("Salt Lake City"), desert: uOf("Nevada desert"), sierra: uOf("Sierra Nevada") };

export const PONY_VOICED_FRAMES = 118 * 30;
const cl = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const ease = Easing.inOut(Easing.cubic);
type Cam = { c: [number, number]; z: number };
const lerpCam = (a: Cam, b: Cam, k: number): Cam => ({ c: [a.c[0] + (b.c[0] - a.c[0]) * k, a.c[1] + (b.c[1] - a.c[1]) * k], z: a.z * Math.pow(b.z / a.z, k) });
const US: Cam = { c: P([-104.5, 39.4]), z: 1.55 };
const WIDE: Cam = { c: P([-108.2, 40.0]), z: 1.8 };
const EAST: Cam = { c: P([-91.5, 40.2]), z: 2.4 };

// Kit's position along the route (u) over time — synced to the spoken place names
function kitU(t: number): number {
  if (t < 4.6) return -1;
  if (t < 15.3) return interpolate(t, [4.6, 15.3], [0.79, 0.835]);
  if (t < 42.6) return -1;           // not on the map
  if (t < 44.2) return interpolate(t, [42.6, 44.2], [-0.35, 0], { ...cl, easing: Easing.out(Easing.quad) });
  if (t < 46.3) return 0;
  if (t < 54.7) return interpolate(t, [46.3, 54.7], [0, 0.03], cl);
  // the ride: hit each landmark when Jesse says it
  return interpolate(t, [54.7, 57.06, 57.92, 58.92, 60.84, 62.62, 64.46, 68.4], [0.03, U.kearny, U.laramie, U.pass, U.slc, U.desert, U.sierra, 1], cl);
}
function baseCamera(t: number): Cam {
  const kit = (z: number): Cam => ({ c: P(routeAt(Math.max(0, kitU(t)))), z });
  const seg = (t0: number, t1: number, a: Cam, b: Cam) => lerpCam(a, b, ease(interpolate(t, [t0, t1], [0, 1], cl)));
  const cold: Cam = { c: P(routeAt(0.81)), z: 4.8 };
  if (t < 4.6) return { c: US.c, z: US.z * (1 + t * 0.012) };
  if (t < 12.4) return seg(4.6, 5.6, { c: US.c, z: US.z * 1.05 }, { c: P(routeAt(kitU(t))), z: 4.8 });
  if (t < 15.3) return seg(12.4, 13.3, { c: P(routeAt(kitU(12.4))), z: 4.8 }, WIDE);
  if (t < 16.7) return lerpCam(WIDE, US, Easing.in(Easing.cubic)(interpolate(t, [15.3, 16.7], [0, 1], cl)));
  if (t < 19.6) return { c: US.c, z: US.z * (1 + (t - 16.7) * 0.01) };
  if (t < 24.0) return seg(19.6, 21.0, US, EAST);
  if (t < 42.6) return seg(24.0, 25.6, EAST, WIDE);
  if (t < 54.7) return seg(42.6, 43.6, WIDE, { c: [P(ROUTE[0].at)[0] + 4, P(ROUTE[0].at)[1] - 18], z: 5.0 });
  if (t < 68.4) return { ...kit(interpolate(t, [54.7, 56, 66.5, 68.4], [5.0, 3.6, 3.6, 4.4], cl)) };
  if (t < 74.6) return kit(4.4);
  if (t < 110.6) return seg(74.6, 75.8, { c: P(ROUTE[12].at), z: 4.4 }, WIDE);
  if (t < 115.6) return seg(110.6, 111.8, WIDE, { c: [P(ROUTE[12].at)[0] + 10, P(ROUTE[12].at)[1] - 26], z: 5.2 });
  void cold;
  return seg(115.6, 117.4, { c: [P(ROUTE[12].at)[0] + 10, P(ROUTE[12].at)[1] - 26], z: 5.2 }, { c: WIDE.c, z: 1.7 });
}

function camera(t: number): Cam { const c = baseCamera(t); return { c: c.c, z: c.z * diveFactor(t) }; }
const pop = (t: number, at: number, dur = 0.28) => interpolate(t, [at, at + dur * 0.6, at + dur], [0, 1.18, 1], cl);
const fade = (t: number, a: number, b: number, d = 0.2) => interpolate(t, [a, a + d, b - d, b], [0, 1, 1, 0], cl);
const Big: React.FC<{ t: number; at: number; until: number; text: string; y?: number; size?: number; color?: string; serif?: boolean }> = ({ t, at, until, text, y = 360, size = 150, color = "#fff", serif = true }) =>
  t < at || t > until ? null : (
    <div style={{ position: "absolute", top: y, width: "100%", textAlign: "center", transform: `scale(${pop(t, at, 0.3)})`, opacity: fade(t, at, until, 0.15),
      fontFamily: serif ? fonts.serif : fonts.sans, fontWeight: serif ? 700 : 900, fontSize: size, color, lineHeight: 1.05,
      WebkitTextStroke: serif ? undefined : "10px #000", paintOrder: "stroke fill", textShadow: "0 8px 24px rgba(0,0,0,0.55), 0 3px 0 rgba(0,0,0,0.6)" }}>{text}</div>
  );
/** small sticker tag in screen space */
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
  // merge split numbers ("1" + ",900", "$200" + ",000") and fix spellings from the script
  const ws: Word[] = [];
  for (const w of words) {
    if (/^[,.]\d/.test(w.w) && ws.length) { const p = ws[ws.length - 1]; ws[ws.length - 1] = { ...p, w: p.w + w.w, e: w.e }; continue; }
    ws.push({ ...w, w: w.w.replace(/Kearney/g, "Kearny") });
  }
  words = ws;
  let cur: Word[] = [];
  const flush = () => { if (cur.length) out.push({ s: cur[0].s, e: cur[cur.length - 1].e, text: cur.map((w) => w.w).join(" ").replace(/ ,/g, ",") }); cur = []; };
  for (const w of words) {
    const joined = w.w.startsWith(",") || w.w.startsWith(".");
    if (joined && cur.length) { cur[cur.length - 1] = { ...cur[cur.length - 1], w: cur[cur.length - 1].w + w.w, e: w.e }; continue; }
    if (cur.length && w.s - cur[cur.length - 1].e > 0.6) flush();
    cur.push(w);
    if (cur.length >= 4 || /[.,!?:]$/.test(w.w)) flush();
  }
  flush();
  // keep each chunk on screen until the next one starts (max +0.6 s)
  return out.map((c, i) => ({ ...c, e: Math.min(i + 1 < out.length ? out[i + 1].s : c.e + 0.6, c.e + 0.6) }));
}

export const PonyVoiced: React.FC<{ sound?: string; words?: Word[] }> = ({ sound, words = [] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const rewinding = t >= 15.3 && t < 16.7;
  const rw = rewinding ? (t - 15.3) / 1.4 : 0;
  const cam = camera(t);
  const z = cam.z;
  const toS = (ll: LL): [number, number] => { const p = P(ll); return [540 + (p[0] - cam.c[0]) * z, 960 + (p[1] - cam.c[1]) * z]; };
  const sw = (px: number) => px / z;
  const caps = useMemo(() => chunks(words), [words]);
  const cap = caps.find((c) => t >= c.s && t < c.e);
  const S = useMemo(() => ({
    land: path(land) ?? "", can: path(world.features.find((f: any) => f.id === "124")) ?? "", mex: path(world.features.find((f: any) => f.id === "484")) ?? "",
    us: path(world.features.find((f: any) => f.id === "840")) ?? "", mesh: path(stateMesh) ?? "",
    cal: path(states.features.find((f: any) => f.properties.name === "California")) ?? "", mo: path(states.features.find((f: any) => f.properties.name === "Missouri")) ?? "",
  }), []);

  const u = kitU(t);
  const kitOn = u > -0.99 && t >= 4.6 && !(t >= 15.3 && t < 42.6);
  const riding = (t >= 4.6 && t < 15.3) || (t >= 42.6 && t < 44.2) || (t >= 46.3 && t < 69.0);
  const kitXY = toS(routeAt(u));
  const kitScale = interpolate(z, [1.5, 5.2], [0.6, 1.25], cl);
  const STATIONS = Array.from({ length: 24 }, (_, i) => (i + 0.5) / 24);
  const stationsShown = t >= 37.3 ? Math.floor(interpolate(t, [37.3, 41.9], [0, 24], cl)) : 0;
  const horseColors = ["#8a5a32", "#5e3b22", "#b07a45", "#3b2a20", "#9b6b3c", "#c49a6c"];
  const swaps = (t >= 45.0 ? 1 : 0) + (t >= 54.7 ? STATIONS.filter((s) => u >= s).length : 0);
  const day = t >= 54.7 && t < 75 ? Math.min(10, 1 + Math.floor(Math.max(0, u) * 9.2)) : t >= 4.6 && t < 15.3 ? 8 : 0;
  const night = t >= 66.3 && t < 68.6 ? Math.sin(interpolate(t, [66.3, 68.6], [0, Math.PI], cl)) * 0.4 : 0;
  // hook flash-forward wire (12.6–14.8) and the real wire (91.5–97.4)
  const wireU = t >= 12.6 && t < 15.3 ? interpolate(t, [12.6, 13.9], [0, 1], cl) : t >= 91.4 ? interpolate(t, [91.4, 97.4], [0, 1], { ...cl, easing: Easing.inOut(Easing.quad) }) : 0;
  const zapU = t >= 99.0 && t < 100.9 ? interpolate(t, [99.0, 100.6], [0, 1], cl) : -1; // a message racing the wire "in minutes"
  const newsU = t >= 81.6 && t < 86.3 ? interpolate(t, [81.6, 84.8], [0, 1], { ...cl, easing: Easing.inOut(Easing.sin) }) : -1;
  const letterU = t >= 1.7 && t < 4.6 ? interpolate(t, [1.7, 4.6], [0, 0.08], cl) : -1;
  const closedAt = 104.2;
  const dark = t >= 86.4 && t < 91.0 ? fade(t, 86.4, 91.0, 0.4) * 0.45 : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#4f8e8f", overflow: "hidden" }}>
      <AbsoluteFill style={{ filter: rewinding ? `blur(${2 + 4 * Math.sin(rw * Math.PI)}px) saturate(0.4) contrast(1.15)` : undefined }}>
        <svg viewBox="0 0 1080 1920" width="100%" height="100%">
          <defs>
            <radialGradient id="seaG" cx="50%" cy="45%" r="75%"><stop offset="0" stopColor="#6aa6a3" /><stop offset="1" stopColor="#3f7c80" /></radialGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          <rect width={1080} height={1920} fill="url(#seaG)" />
          <g transform={`translate(540 960) scale(${z}) translate(${-cam.c[0]} ${-cam.c[1]})`}>
            <path d={S.land} fill="#dcc89c" stroke="#5a4428" strokeWidth={sw(2.2)} />
            <path d={S.can} fill="#c9493f" opacity={0.92} stroke="#3a2418" strokeWidth={sw(3)} />
            <path d={S.mex} fill="#e08a3c" opacity={0.92} stroke="#3a2418" strokeWidth={sw(3)} />
            <path d={S.us} fill="#e2d1a4" stroke="#3a2418" strokeWidth={sw(3.5)} />
            <path d={S.mesh} fill="none" stroke="#8a7350" strokeWidth={sw(1.4)} opacity={0.6} />
            <path d={S.mo} fill="#5aa0c8" opacity={0.7 * Math.max(fade(t, 2.18, 4.6, 0.25), fade(t, 20.5, 25.0, 0.3))} stroke="#3a2418" strokeWidth={sw(3)} />
            <path d={S.cal} fill="#f2b84b" opacity={0.75 * Math.max(fade(t, 2.82, 4.6, 0.25), fade(t, 30.1, 33.0, 0.3))} stroke="#3a2418" strokeWidth={sw(3)} />
            {/* railroad from the East, ending at St. Joseph */}
            {t >= 21.6 && t < 33 && (
              <g opacity={fade(t, 21.6, 33, 0.3)}>
                <path d={RAIL_D} fill="none" stroke="#2b1d14" strokeWidth={sw(9)} />
                <path d={RAIL_D} fill="none" stroke="#e2d1a4" strokeWidth={sw(4)} strokeDasharray={`${sw(6)} ${sw(10)}`} />
              </g>
            )}
            {/* the gap / the route */}
            {((t >= 1.7 && t < 4.6) || (t >= 24.2 && t < 54.7)) && (
              <path d={ROUTE_D} fill="none" stroke="#3a2418" strokeWidth={sw(7)} strokeDasharray={`${sw(18)} ${sw(14)}`} strokeDashoffset={sw(-t * 40)} />
            )}
            {t >= 54.7 && <>
              <path d={lineUpTo(Math.max(0, u))} fill="none" stroke="#000" strokeOpacity={0.35} strokeWidth={sw(16)} strokeLinecap="round" />
              <path d={lineUpTo(Math.max(0, u))} fill="none" stroke="#e8642c" strokeWidth={sw(9)} strokeLinecap="round" />
            </>}
            {wireU > 0 && (
              <g filter="url(#glow)">
                <path d={lineUpTo(wireU)} fill="none" stroke="#bfe9ff" strokeWidth={sw(7)} strokeLinecap="round" />
                <path d={lineUpTo(wireU)} fill="none" stroke="#fff" strokeWidth={sw(3)} strokeLinecap="round" />
              </g>
            )}
          </g>
        </svg>
      </AbsoluteFill>

      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        {/* relay stations: all popping in 37.3–41.9, then shown */}
        {stationsShown > 0 && t < 117 && STATIONS.slice(0, stationsShown).map((s, i) => {
          const [x, y] = toS(routeAt(s));
          const sc = interpolate(t, [37.3 + i * (4.6 / 24), 37.3 + i * (4.6 / 24) + 0.2], [0, 1], cl);
          return (
            <g key={i} transform={`translate(${x} ${y}) scale(${0.8 * sc})`}>
              <path d="M -22 0 L -22 -26 L 0 -42 L 22 -26 L 22 0 Z" fill="#a8743f" stroke="#2b1d14" strokeWidth={4} />
              <path d="M -27 -24 L 0 -46 L 27 -24" fill="none" stroke="#5a3a22" strokeWidth={7} strokeLinecap="round" />
              <rect x={-6} y={-16} width={12} height={16} fill="#3a2618" />
            </g>
          );
        })}
        {/* telegraph poles along the wire */}
        {wireU > 0 && Array.from({ length: 16 }, (_, i) => (i + 0.5) / 16).filter((p) => p <= wireU).map((p, i) => {
          const [x, y] = toS(routeAt(p));
          return (
            <g key={`p${i}`} transform={`translate(${x} ${y - 4}) scale(${interpolate(wireU, [p, p + 0.04], [0, 1], cl)})`}>
              <rect x={-3} y={-58} width={6} height={58} fill="#5a3a22" stroke="#2b1d14" strokeWidth={2} />
              <rect x={-16} y={-54} width={32} height={6} fill="#5a3a22" stroke="#2b1d14" strokeWidth={2} />
            </g>
          );
        })}
        {zapU >= 0 && (() => { const [x, y] = toS(routeAt(zapU)); return <circle cx={x} cy={y - 50} r={16} fill="#fff" stroke="#bfe9ff" strokeWidth={8} />; })()}
        {/* pins */}
        {[{ ll: ROUTE[0].at, label: "St. Joseph, Missouri", at: [2.18, 20.58], above: true }, { ll: ROUTE[12].at, label: "Sacramento, California", at: [2.82, 30.16], above: false }].map((m, i) => {
          const at = t >= m.at[1] - 0.05 ? m.at[1] : m.at[0];
          const visible = (t >= m.at[0] && t < 4.6) || (t >= 12.4 && t < 15.3) || t >= m.at[1];
          if (!visible) return null;
          const [x, y] = toS(m.ll);
          const label = z < 2.0 ? m.label.split(",")[0] : m.label;
          const w = label.length * 19 + 36;
          return (
            <g key={i} transform={`translate(${x} ${y}) scale(${pop(t, at)})`}>
              <circle r={30 + 6 * Math.sin(t * 5)} fill="#e4512c" opacity={0.22} />
              <path d="M 0 0 C -24 -32 -24 -66 0 -72 C 24 -66 24 -32 0 0 Z" fill="#e4512c" stroke="#000" strokeWidth={5} />
              <circle cy={-48} r={9} fill="#fff" />
              {!(i === 1 && t > 54.7 && t < 76) && !(i === 0 && t > 42.6 && t < 54.7) && (
                <g transform={`translate(${-w / 2} ${m.above ? -140 : 22})`}>
                  <rect width={w} height={54} rx={12} fill="#1b140d" opacity={0.88} stroke="#f2b84b" strokeWidth={4} />
                  <text x={w / 2} y={37} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={32} fill="#fff">{label}</text>
                </g>
              )}
            </g>
          );
        })}
        {/* the slow letter in the hook */}
        {letterU >= 0 && (() => { const [x, y] = toS(routeAt(letterU)); return (
          <g transform={`translate(${x - 60} ${y + 70}) scale(${pop(t, 1.7)})`}>
            <rect x={-40} y={-26} width={80} height={52} rx={4} fill="#fff8e6" stroke="#000" strokeWidth={4} />
            <path d="M -40 -26 L 0 6 L 40 -26" fill="none" stroke="#000" strokeWidth={4} />
          </g>); })()}
        <Tag x={540} y={toS(routeAt(0.5))[1] - 120} t={t} at={3.8} until={4.6} text="WEEKS…" size={44} />
        {/* railroad end */}
        {(() => { const [x, y] = toS(ROUTE[0].at); return <Tag x={x + 40} y={y + 90} t={t} at={22.6} until={25.6} text="RAILROAD ENDS HERE" size={30} />; })()}
        {/* distance + terrain */}
        <Tag x={540} y={toS(routeAt(0.5))[1] - 120} t={t} at={25.3} until={33.0} text="≈ 1,900 MILES" size={46} />
        {[["PRAIRIE", [-99.5, 41.6], 27.14], ["MOUNTAINS", [-107.5, 43.6], 27.9], ["DESERT", [-116.8, 40.6], 28.64]].map(([txt, ll, at], i) => {
          const [x, y] = toS(ll as LL);
          return <Tag key={i} x={x} y={y} t={t} at={at as number} until={32.4} text={txt as string} bg="#1b140d" fg="#f2e3b5" size={28} />;
        })}
        {/* station facts */}
        <Tag x={540} y={420} t={t} at={38.22} until={42.6} text="180+ RELAY STATIONS" size={48} />
        <Tag x={540} y={510} t={t} at={40.82} until={42.6} text="every 10–15 miles" size={36} />
        <Tag x={kitXY[0]} y={kitXY[1] + 100} t={t} at={45.0} until={47.6} text="FRESH HORSE!" bg="#f2b84b" size={40} />
        <Tag x={540} y={430} t={t} at={48.86} until={54.6} text="75–100 MILES PER RIDER" size={44} />
        <Tag x={540} y={520} t={t} at={52.24} until={54.6} text="MAX 125 LB" bg="#c62828" fg="#fff" size={44} />
        {/* landmarks during the ride, named as Jesse says them */}
        {([["Fort Kearny", U.kearny, 57.06], ["Fort Laramie", U.laramie, 57.92], ["South Pass", U.pass, 58.92], ["Salt Lake City", U.slc, 60.84], ["Nevada desert", U.desert, 62.62], ["Sierra Nevada", U.sierra, 64.46]] as const).map(([n, uu, at], i) => {
          const [x, y] = toS(routeAt(uu));
          return <Tag key={n} x={x} y={y + 64 + (i % 2) * 0} t={t} at={at} until={at + 2.2} text={n} size={32} />;
        })}
        {/* $5 letter and Lincoln news */}
        {t >= 76.34 && t < 78.8 && (
          <g transform={`translate(540 520) scale(${pop(t, 76.34)})`}>
            <rect x={-150} y={-90} width={300} height={180} rx={8} fill="#fff8e6" stroke="#000" strokeWidth={6} />
            <path d="M -150 -90 L 0 20 L 150 -90" fill="none" stroke="#000" strokeWidth={5} />
            <rect x={60} y={-80} width={80} height={90} fill="#c62828" stroke="#000" strokeWidth={4} />
            <text x={100} y={-20} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={46} fill="#fff">$5</text>
            <text y={140} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={40} fill="#fff" stroke="#000" strokeWidth={8} paintOrder="stroke">per ½ ounce</text>
          </g>
        )}
        {newsU >= 0 && (() => { const [x, y] = toS(routeAt(newsU)); return (
          <g transform={`translate(${x} ${y - 90}) scale(${pop(t, 81.6)})`}>
            <rect x={-110} y={-60} width={220} height={120} fill="#f4efe2" stroke="#000" strokeWidth={5} />
            <text y={-20} textAnchor="middle" fontFamily="serif" fontWeight={900} fontSize={26} fill="#111">LINCOLN</text>
            <text y={14} textAnchor="middle" fontFamily="serif" fontWeight={900} fontSize={26} fill="#111">ELECTED!</text>
            <rect x={-90} y={28} width={180} height={6} fill="#999" /><rect x={-90} y={40} width={140} height={6} fill="#999" />
          </g>); })()}
        {/* CLOSED sign near Sacramento */}
        {t >= closedAt && t < 110.6 && (() => {
          const [x, y] = toS(ROUTE[12].at);
          const flip = interpolate(t, [closedAt + 0.2, closedAt + 0.5], [0, 1], cl);
          return (
            <g transform={`translate(${x + 200} ${y - 10}) scale(${pop(t, closedAt) * 0.9})`}>
              <rect x={-6} y={-150} width={12} height={150} fill="#5a3a22" stroke="#2b1d14" strokeWidth={4} />
              <g transform={`translate(0 -150) scale(1 ${Math.abs(Math.cos(flip * Math.PI))})`}>
                <rect x={-120} y={-10} width={240} height={110} rx={10} fill={flip < 0.5 ? "#f3e6c4" : "#c62828"} stroke="#2b1d14" strokeWidth={6} />
                <text y={flip < 0.5 ? 54 : 66} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={flip < 0.5 ? 30 : 64} fill={flip < 0.5 ? "#2b1d14" : "#fff"}>{flip < 0.5 ? "PONY EXPRESS" : "CLOSED"}</text>
              </g>
            </g>
          );
        })()}
        {/* Kit */}
        {kitOn && (
          <g transform={`translate(${kitXY[0]} ${kitXY[1]}) scale(${kitScale * (t >= 42.6 && t < 42.9 ? pop(t, 42.6) : 1)})`}>
            {riding && Array.from({ length: 5 }, (_, i) => { const k = (frame * 0.08 + i / 5) % 1; return <circle key={i} cx={120 + k * 160} cy={-10 - k * 30} r={14 + k * 30} fill="#c8b48a" opacity={0.55 * (1 - k)} />; })}
            <Horse phase={frame * 0.85} galloping={riding} facing={1} color={horseColors[swaps % horseColors.length]}
              riderExpression={t >= 102 && t < 110.6 ? "sad" : t >= 69 && t < 75 ? "happy" : "determined"} />
          </g>
        )}
        {/* snow in the Sierra */}
        {t > 63.8 && t < 68.4 && Array.from({ length: 70 }, (_, i) => {
          const x = (i * 157 + frame * (5 + (i % 4))) % 1120 - 20, y = (i * 263 + frame * (9 + (i % 5))) % 1960 - 20;
          return <circle key={`s${i}`} cx={x} cy={y} r={3 + (i % 3) * 2} fill="#fff" opacity={0.85} />;
        })}
      </svg>

      {night + dark > 0 && <AbsoluteFill style={{ backgroundColor: "#0b1730", opacity: night + dark, mixBlendMode: "multiply" }} />}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%)" }} />
      <Img src={staticFile("pony/grain.png")} style={{ position: "absolute", inset: 0, width: 1080, height: 1920, opacity: 0.22, mixBlendMode: "multiply" }} />
      {rewinding && (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <div style={{ fontSize: 210, color: "#fff", letterSpacing: -40, opacity: 0.92, textShadow: "0 0 30px rgba(0,0,0,0.6)", transform: `translateX(${-30 * Math.sin(rw * 20)}px)` }}>◀◀◀</div>
        </AbsoluteFill>
      )}
      {day > 0 && (
        <div style={{ position: "absolute", top: 230, right: 70, padding: "14px 28px", borderRadius: 18, background: "#1b140d", border: "5px solid #f2b84b", fontFamily: fonts.sans, fontWeight: 900, fontSize: 52, color: "#fff" }}>
          <span style={{ color: "#f2b84b", fontSize: 30, marginRight: 12 }}>DAY</span>{day}
        </div>
      )}
      {newsU >= 0 && (
        <div style={{ position: "absolute", top: 230, left: 70, padding: "14px 24px", borderRadius: 18, background: "#1b140d", border: "5px solid #f2b84b", fontFamily: fonts.sans, fontWeight: 900, fontSize: 46, color: "#fff" }}>
          {(() => { const h = Math.round(newsU * (7 * 24 + 17)); return `${Math.floor(h / 24)}d ${h % 24}h`; })()}
        </div>
      )}

      <SceneLayer t={t} frame={frame} />
      {/* big pops (numbers, dates) */}
      <Big t={t} at={6.32} until={11.2} text="10 DAYS" color="#ffd23f" size={190} />
      <Big t={t} at={11.3} until={12.4} text="IT WORKED." serif={false} size={110} color="#fff" />
      <Big t={t} at={13.98} until={15.3} text="18 months?" color="#ffd23f" size={128} />
      <Big t={t} at={18.38} until={22.2} text="April 3, 1860" size={130} />
      <Big t={t} at={73.76} until={76.2} text="10 DAYS" color="#ffd23f" size={190} />
      <Big t={t} at={83.08} until={86.4} text="7 days, 17 hours" color="#ffd23f" size={110} y={420} />
      <Big t={t} at={87.28} until={90.6} text="Something faster…" serif={false} size={84} color="#bfe9ff" y={520} />
      <Big t={t} at={94.68} until={98.2} text="Oct 24, 1861" size={130} />
      <Big t={t} at={100.42} until={102.0} text="MINUTES" serif={false} size={130} color="#bfe9ff" />

      {/* captions, in sync with the voice */}
      {cap && (
        <div style={{ position: "absolute", top: 1420, left: 60, right: 60, textAlign: "center", fontFamily: fonts.sans, fontWeight: 900, fontSize: 66, lineHeight: 1.1,
          color: "#fff", WebkitTextStroke: "9px #000", paintOrder: "stroke fill", textShadow: "0 6px 0 #000", transform: `scale(${interpolate(t, [cap.s, cap.s + 0.08], [0.9, 1], cl)})` }}>{cap.text}</div>
      )}
      {sound && <Audio src={staticFile(sound)} />}
    </AbsoluteFill>
  );
};
