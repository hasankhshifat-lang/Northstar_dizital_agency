import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { geoAlbers, geoPath, geoInterpolate, geoDistance } from "d3-geo";
import { feature, mesh } from "topojson-client";
import worldTopo from "world-atlas/countries-50m.json";
import statesTopo from "us-atlas/states-10m.json";
import { Horse } from "./sets/horse";
import { fonts } from "./theme";

/**
 * Native-vertical map Short (learned from GeoGlobeTales, 2026-11-01):
 * one continuous camera over a real map — no cuts — with Kit riding the real route,
 * pins/labels/counters popping in, 1–5-word on-screen lines, and SFX on every event (audio mixed outside).
 * Story: the Pony Express (Apr 1860 – Oct 1861). No voiceover.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
type LL = [number, number];
const proj = geoAlbers().rotate([98, 0]).center([0, 38]).parallels([29.5, 45.5]).scale(1300).translate([0, 0])
  .clipExtent([[-2600, -2200], [2600, 2200]]);
const path = geoPath(proj);
const P = (ll: LL) => proj(ll) as [number, number];

const world = feature(worldTopo as any, (worldTopo as any).objects.countries) as any;
const land = feature(worldTopo as any, (worldTopo as any).objects.land) as any;
const states = feature(statesTopo as any, (statesTopo as any).objects.states) as any;
const stateMesh = mesh(statesTopo as any, (statesTopo as any).objects.states, (a: any, b: any) => a !== b) as any;

// Real Pony Express route (approximate main stations, west-bound)
const ROUTE: { at: LL; name?: string }[] = [
  { at: [-94.8467, 39.7675], name: "St. Joseph, MO" },
  { at: [-96.6497, 39.8403] },
  { at: [-98.9806, 40.6447], name: "Fort Kearny" },
  { at: [-102.2633, 40.9886] },
  { at: [-104.5583, 42.2117], name: "Fort Laramie" },
  { at: [-108.9, 42.35], name: "South Pass" },
  { at: [-110.389, 41.318] },
  { at: [-111.891, 40.7608], name: "Salt Lake City" },
  { at: [-114.7, 40.1] },
  { at: [-117.6, 39.5] },
  { at: [-119.7674, 39.1638], name: "Carson City" },
  { at: [-120.7983, 38.7296] },
  { at: [-121.4944, 38.5816], name: "Sacramento, CA" },
];
// densify the route along great-circle segments, with cumulative distance
const DENSE: { ll: LL; d: number }[] = (() => {
  const out: { ll: LL; d: number }[] = [];
  let d = 0;
  for (let i = 0; i < ROUTE.length - 1; i++) {
    const a = ROUTE[i].at, b = ROUTE[i + 1].at, f = geoInterpolate(a, b);
    for (let k = 0; k < 20; k++) { const ll = f(k / 20) as LL; if (out.length) d += geoDistance(out[out.length - 1].ll, ll); out.push({ ll, d }); }
  }
  const last = ROUTE[ROUTE.length - 1].at; d += geoDistance(out[out.length - 1].ll, last); out.push({ ll: last, d });
  return out.map((p) => ({ ...p, d: p.d / d }));
})();
const routeAt = (u: number): LL => {
  u = Math.max(0, Math.min(1, u));
  for (let i = 1; i < DENSE.length; i++) if (DENSE[i].d >= u) {
    const a = DENSE[i - 1], b = DENSE[i], k = (u - a.d) / Math.max(1e-9, b.d - a.d);
    return [a.ll[0] + (b.ll[0] - a.ll[0]) * k, a.ll[1] + (b.ll[1] - a.ll[1]) * k];
  }
  return DENSE[DENSE.length - 1].ll;
};
const routeUpTo = (u: number) => {
  const pts = DENSE.filter((p) => p.d <= u).map((p) => p.ll);
  pts.push(routeAt(u));
  return path({ type: "LineString", coordinates: pts } as any) ?? "";
};
const ROUTE_D = path({ type: "LineString", coordinates: DENSE.map((p) => p.ll) } as any) ?? "";
const uOf = (name: string) => { const ll = ROUTE.find((r) => r.name === name)!.at; let best = 0, bd = 9; DENSE.forEach((p) => { const dd = geoDistance(p.ll, ll); if (dd < bd) { bd = dd; best = p.d; } }); return best; };

// ---------- timeline (seconds) ----------
export const T = {
  coldEnd: 3.6, rewindEnd: 4.7, date: 4.9, pins: 6.2, gap: 8.0, depart: 11.0, rideStart: 13.4, rideEnd: 27.6,
  arrive: 27.6, pause: 31.0, wire: 32.4, wireDone: 34.6, closed: 36.4, end: 43.5,
};
export const MAP_SHORT_FRAMES = Math.round(T.end * 30);
const rideU = (t: number) => interpolate(t, [T.rideStart, T.rideEnd], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.sin) });

type Cam = { c: [number, number]; z: number };
const lerpCam = (a: Cam, b: Cam, k: number): Cam => ({ c: [a.c[0] + (b.c[0] - a.c[0]) * k, a.c[1] + (b.c[1] - a.c[1]) * k], z: a.z * Math.pow(b.z / a.z, k) });
const ease = Easing.inOut(Easing.cubic);
const US: Cam = { c: P([-107, 39.4]), z: 1.55 };
const ROUTE_WIDE: Cam = { c: P([-108.2, 40.0]), z: 1.8 };

function camera(t: number): Cam {
  const kitCam = (tt: number, z: number): Cam => ({ c: P(routeAt(rideU(tt))), z });
  const seg = (t0: number, t1: number, a: Cam, b: Cam) => lerpCam(a, b, ease(interpolate(t, [t0, t1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
  const coldCam: Cam = { c: P([-116.4, 39.75]), z: 5.2 };
  if (t < T.coldEnd) return { c: [coldCam.c[0] - (t * 9), coldCam.c[1] + t * 1.5], z: coldCam.z * (1 + t * 0.02) };
  if (t < T.rewindEnd) return seg(T.coldEnd, T.rewindEnd, { c: [coldCam.c[0] - T.coldEnd * 9, coldCam.c[1]], z: 5.4 }, US);
  if (t < T.gap) return { c: US.c, z: US.z * (1 + (t - T.rewindEnd) * 0.02) };
  if (t < T.depart) return seg(T.gap, T.depart - 0.6, { c: US.c, z: US.z * 1.07 }, ROUTE_WIDE);
  if (t < T.rideStart) return seg(T.depart - 0.6, T.depart + 0.9, ROUTE_WIDE, { c: P(ROUTE[0].at), z: 4.6 });
  if (t < T.rideEnd) { // follow Kit; ease from the departure close-up into the riding zoom
    const z = interpolate(t, [T.rideStart, T.rideStart + 1.5, T.rideEnd - 1.2, T.rideEnd], [4.6, 3.6, 3.6, 4.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return kitCam(t, z);
  }
  if (t < T.pause) return seg(T.arrive + 0.8, T.pause, kitCam(T.rideEnd, 4.2), ROUTE_WIDE);
  if (t < T.closed) return { c: ROUTE_WIDE.c, z: ROUTE_WIDE.z * (1 + (t - T.pause) * 0.012) };
  if (t < T.closed + 1.2) return seg(T.closed, T.closed + 1.2, { c: ROUTE_WIDE.c, z: ROUTE_WIDE.z * 1.06 }, { c: [P(ROUTE[12].at)[0] + 22, P(ROUTE[12].at)[1] - 30], z: 5.2 });
  if (t < 40.6) return { c: [P(ROUTE[12].at)[0] + 22, P(ROUTE[12].at)[1] - 30], z: 5.2 * (1 + (t - T.closed - 1.2) * 0.015) };
  return seg(40.6, 42.4, { c: [P(ROUTE[12].at)[0] + 22, P(ROUTE[12].at)[1] - 30], z: 5.45 }, { c: ROUTE_WIDE.c, z: 1.8 });
}

// ---------- small UI pieces ----------
const pop = (t: number, at: number, dur = 0.28) => interpolate(t, [at, at + dur * 0.6, at + dur], [0, 1.18, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const fade = (t: number, a: number, b: number, d = 0.2) => interpolate(t, [a, a + d, b - d, b], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const Line: React.FC<{ t: number; at: number; until: number; text: string; color?: string; size?: number; y?: number }> = ({ t, at, until, text, color = "#fff", size = 66, y = 1300 }) => {
  if (t < at || t > until) return null;
  const s = pop(t, at, 0.22), o = fade(t, at, until, 0.12);
  return (
    <div style={{ position: "absolute", top: y, left: 60, right: 60, textAlign: "center", transform: `scale(${s})`, opacity: o,
      fontFamily: fonts.sans, fontWeight: 900, fontSize: size, lineHeight: 1.1, color, WebkitTextStroke: "9px #000", paintOrder: "stroke fill", textShadow: "0 6px 0 #000" }}>{text}</div>
  );
};
const BigSerif: React.FC<{ t: number; at: number; until: number; text: string; y?: number; size?: number; color?: string }> = ({ t, at, until, text, y = 520, size = 210, color = "#fff" }) => {
  if (t < at || t > until) return null;
  return (
    <div style={{ position: "absolute", top: y, width: "100%", textAlign: "center", transform: `scale(${pop(t, at, 0.3)})`, opacity: fade(t, at, until, 0.15),
      fontFamily: fonts.serif, fontWeight: 700, fontSize: size, color, textShadow: "0 8px 24px rgba(0,0,0,0.55), 0 3px 0 rgba(0,0,0,0.6)" }}>{text}</div>
  );
};

export const MapShort: React.FC<{ sound?: string }> = ({ sound }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let t = frame / fps;
  // rewind: replay the cold open backwards, fast
  const rewinding = t >= T.coldEnd && t < T.rewindEnd;
  const rw = rewinding ? (t - T.coldEnd) / (T.rewindEnd - T.coldEnd) : 0;
  const tScene = rewinding ? T.coldEnd * (1 - rw) : t;
  const cam = rewinding ? lerpCam(camera(T.coldEnd * (1 - rw)), US, Easing.in(Easing.cubic)(rw)) : camera(t);
  const z = cam.z;
  const toScreen = (ll: LL): [number, number] => { const p = P(ll); return [540 + (p[0] - cam.c[0]) * z, 960 + (p[1] - cam.c[1]) * z]; };

  const statics = useMemo(() => ({
    land: path(land) ?? "",
    can: path(world.features.find((f: any) => f.id === "124")) ?? "",
    mex: path(world.features.find((f: any) => f.id === "484")) ?? "",
    us: path(world.features.find((f: any) => f.id === "840")) ?? "",
    cal: path(states.features.find((f: any) => f.properties.name === "California")) ?? "",
    mo: path(states.features.find((f: any) => f.properties.name === "Missouri")) ?? "",
    stateMesh: path(stateMesh) ?? "",
  }), []);

  // Kit on the map
  const kitU = tScene < T.coldEnd ? interpolate(tScene, [0, T.coldEnd], [0.80, 0.835]) : t < T.rideStart ? 0 : rideU(t);
  const kitLL = routeAt(kitU);
  const kitXY = toScreen(kitLL);
  const riding = (tScene < T.coldEnd) || (t >= T.rideStart && t < T.rideEnd + 0.2);
  const kitVisible = tScene < T.coldEnd || t >= T.depart;
  const kitScale = interpolate(z, [1.5, 5.2], [0.6, 1.25], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * (t >= T.depart && t < T.depart + 0.3 ? pop(t, T.depart) : 1);
  // a fresh horse at every station: colour changes
  const STATION_US = Array.from({ length: 13 }, (_, i) => 0.04 + i * 0.075);
  const horseIdx = STATION_US.filter((u) => kitU >= u && t >= T.rideStart).length;
  const horseColors = ["#8a5a32", "#5e3b22", "#b07a45", "#3b2a20", "#9b6b3c", "#c49a6c", "#6e4a2c"];

  // day counter during the ride
  const day = t < T.rideStart ? 1 : Math.min(10, 1 + Math.floor(rideU(t) * 9.2));
  const coldDay = 8;
  const night = (t >= T.rideStart && t < T.rideEnd) ? Math.max(0, Math.sin((rideU(t) * 10) * Math.PI * 2 - 1.2)) * 0.32 : 0;

  // wire progress
  const wireU = interpolate(t, [T.wire + 0.4, T.wireDone], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.quad) });

  const sw = (px: number) => px / z; // stroke width in screen px
  const markers = [
    { ll: ROUTE[0].at, label: "St. Joseph", at: T.pins + 0.8, side: "right" as const },
    { ll: ROUTE[12].at, label: "Sacramento", at: T.pins, side: "left" as const },
  ];
  const routeMarks = ["Fort Kearny", "Fort Laramie", "Salt Lake City", "Carson City"].map((n) => ({ name: n, u: uOf(n) }));
  const snow = t > T.rideStart && kitU > 0.86 && kitU < 0.97;

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
            <path d={statics.land} fill="#dcc89c" stroke="#5a4428" strokeWidth={sw(2.2)} />
            <path d={statics.can} fill="#c9493f" opacity={0.92} stroke="#3a2418" strokeWidth={sw(3)} />
            <path d={statics.mex} fill="#e08a3c" opacity={0.92} stroke="#3a2418" strokeWidth={sw(3)} />
            <path d={statics.us} fill="#e2d1a4" stroke="#3a2418" strokeWidth={sw(3.5)} />
            <path d={statics.stateMesh} fill="none" stroke="#8a7350" strokeWidth={sw(1.4)} opacity={0.6} />
            {/* California pulse when it is introduced */}
            <path d={statics.cal} fill="#f2b84b" opacity={0.75 * fade(t, T.pins, T.gap + 0.6, 0.25)} stroke="#3a2418" strokeWidth={sw(3)} />
            <path d={statics.mo} fill="#5aa0c8" opacity={0.7 * fade(t, T.pins + 0.8, T.gap + 0.6, 0.25)} stroke="#3a2418" strokeWidth={sw(3)} />
            {/* the gap: dashed line between the railhead and California */}
            {t >= T.gap && t < T.depart + 0.4 && (
              <path d={ROUTE_D} fill="none" stroke="#3a2418" strokeWidth={sw(7)} strokeDasharray={`${sw(18)} ${sw(14)}`}
                strokeDashoffset={sw(-t * 40)} opacity={fade(t, T.gap, T.depart + 0.4, 0.2)}
              />
            )}
            {/* the ridden trail behind Kit */}
            {t >= T.rideStart && (
              <g>
                <path d={routeUpTo(kitU)} fill="none" stroke="#000" strokeOpacity={0.35} strokeWidth={sw(16)} strokeLinecap="round" />
                <path d={routeUpTo(kitU)} fill="none" stroke="#e8642c" strokeWidth={sw(9)} strokeLinecap="round" />
              </g>
            )}
            {/* the telegraph wire */}
            {wireU > 0 && (
              <g filter="url(#glow)">
                <path d={routeUpTo(1 - (1 - wireU))} fill="none" stroke="#bfe9ff" strokeWidth={sw(7)} strokeLinecap="round" />
                <path d={routeUpTo(wireU)} fill="none" stroke="#ffffff" strokeWidth={sw(3)} strokeLinecap="round" />
              </g>
            )}
          </g>
        </svg>
      </AbsoluteFill>

      {/* screen-space overlays (fixed size, like the competitor's characters) */}
      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        {/* relay stations popping up along the ride */}
        {t >= T.rideStart && STATION_US.map((u, i) => {
          if (kitU < u - 0.002) return null;
          const at = T.rideStart + 0.01 + i * 0.001; // shown once reached
          const [x, y] = toScreen(routeAt(u));
          const reachedAt = (u); const s = interpolate(kitU, [reachedAt, reachedAt + 0.012], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <g key={i} transform={`translate(${x} ${y}) scale(${0.9 * s * (at ? 1 : 1)})`}>
              <path d="M -22 0 L -22 -26 L 0 -42 L 22 -26 L 22 0 Z" fill="#a8743f" stroke="#2b1d14" strokeWidth={4} />
              <path d="M -27 -24 L 0 -46 L 27 -24" fill="none" stroke="#5a3a22" strokeWidth={7} strokeLinecap="round" />
              <rect x={-6} y={-16} width={12} height={16} fill="#3a2618" />
            </g>
          );
        })}
        {/* telegraph poles pop along the wire */}
        {wireU > 0 && Array.from({ length: 16 }, (_, i) => (i + 0.5) / 16).filter((u) => u <= wireU).map((u, i) => {
          const [x, y] = toScreen(routeAt(u));
          const s = interpolate(wireU, [u, u + 0.04], [0, 1], { extrapolateRight: "clamp" });
          return (
            <g key={`p${i}`} transform={`translate(${x} ${y - 4}) scale(${s})`}>
              <rect x={-3} y={-58} width={6} height={58} fill="#5a3a22" stroke="#2b1d14" strokeWidth={2} />
              <rect x={-16} y={-54} width={32} height={6} fill="#5a3a22" stroke="#2b1d14" strokeWidth={2} />
            </g>
          );
        })}
        {/* map pins */}
        {markers.map((m, i) => {
          if (t < m.at) return null;
          const [x, y] = toScreen(m.ll);
          const s = pop(t, m.at);
          const w = m.label.length * 21 + 40;
          const lx = -w / 2;
          const show = t < T.rideStart + 1.2 || t > T.arrive;
          return (
            <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
              <circle r={30 + 6 * Math.sin(t * 5)} fill="#e4512c" opacity={0.22} />
              <path d="M 0 0 C -24 -32 -24 -66 0 -72 C 24 -66 24 -32 0 0 Z" fill="#e4512c" stroke="#000" strokeWidth={5} />
              <circle cy={-48} r={9} fill="#fff" />
              {show && (
                <g transform={`translate(${lx} ${t > T.arrive - 0.5 && m.side === "left" ? 24 : -140})`}>
                  <rect width={w} height={56} rx={12} fill="#1b140d" opacity={0.88} stroke="#f2b84b" strokeWidth={4} />
                  <text x={w / 2} y={38} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={34} fill="#fff">{m.label}</text>
                </g>
              )}
            </g>
          );
        })}
        {/* landmarks on the route, named as Kit passes */}
        {t >= T.rideStart && t < T.rideEnd + 0.5 && routeMarks.map((r, i) => {
          if (kitU < r.u) return null;
          const [x, y] = toScreen(routeAt(r.u));
          const o = interpolate(kitU, [r.u, r.u + 0.01, r.u + 0.08, r.u + 0.1], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          if (o <= 0) return null;
          const w = r.name.length * 20 + 36;
          return (
            <g key={`r${i}`} opacity={o} transform={`translate(${x} ${y + 70})`}>
              <rect x={-w / 2} width={w} height={52} rx={10} fill="#fff3c4" stroke="#000" strokeWidth={4} />
              <text y={36} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={32} fill="#1d1712">{r.name}</text>
            </g>
          );
        })}
        {/* gap label */}
        {t >= T.gap + 0.5 && t < T.depart + 0.4 && (() => {
          const [x, y] = toScreen(routeAt(0.5));
          return (
            <g transform={`translate(${x} ${y - 70}) scale(${pop(t, T.gap + 0.5)})`} opacity={fade(t, T.gap + 0.5, T.depart + 0.4, 0.2)}>
              <rect x={-230} y={-44} width={460} height={76} rx={14} fill="#fff3c4" stroke="#000" strokeWidth={5} />
              <text y={10} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={46} fill="#1d1712">≈ 1,900 MILES</text>
            </g>
          );
        })()}
        {/* Kit on horseback */}
        {kitVisible && (
          <g transform={`translate(${kitXY[0]} ${kitXY[1]}) scale(${kitScale})`}>
            {riding && Array.from({ length: 5 }, (_, i) => {
              const k = ((frame * 0.08 + i / 5) % 1);
              return <circle key={i} cx={120 + k * 160} cy={-10 - k * 30} r={14 + k * 30} fill="#c8b48a" opacity={0.55 * (1 - k)} />;
            })}
            <Horse phase={frame * 0.85} galloping={riding} facing={1} color={horseColors[horseIdx % horseColors.length]}
              riderExpression={t >= T.closed ? "sad" : t >= T.arrive && t < T.pause ? "happy" : "determined"} />
          </g>
        )}
        {/* "CLOSED" sign at the end */}
        {t >= T.closed + 1.4 && t < 40.6 && (() => {
          const [x, y] = toScreen(ROUTE[12].at);
          const flip = interpolate(t, [T.closed + 2.6, T.closed + 2.9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <g transform={`translate(${x + 190} ${y - 20}) scale(${pop(t, T.closed + 1.4)})`}>
              <rect x={-6} y={-150} width={12} height={150} fill="#5a3a22" stroke="#2b1d14" strokeWidth={4} />
              <g transform={`translate(0 -150) scale(1 ${Math.abs(Math.cos(flip * Math.PI))})`}>
                <rect x={-120} y={-10} width={240} height={110} rx={10} fill={flip < 0.5 ? "#f3e6c4" : "#c62828"} stroke="#2b1d14" strokeWidth={6} />
                <text y={flip < 0.5 ? 40 : 66} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={flip < 0.5 ? 30 : 64} fill={flip < 0.5 ? "#2b1d14" : "#fff"}>{flip < 0.5 ? "PONY EXPRESS" : "CLOSED"}</text>
                {flip < 0.5 && <text y={80} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={26} fill="#2b1d14">MAIL TO CALIFORNIA</text>}
              </g>
            </g>
          );
        })()}
        {/* Kit's thought: a telegraph key (the thing that replaced him) */}
        {t >= T.closed + 3.2 && t < 40.6 && (() => {
          const s = pop(t, T.closed + 3.2);
          return (
            <g transform={`translate(${kitXY[0] - 40} ${kitXY[1] - 330 * kitScale - 120}) scale(${s})`}>
              <circle cx={60} cy={110} r={10} fill="#fff" stroke="#000" strokeWidth={4} />
              <circle cx={40} cy={80} r={16} fill="#fff" stroke="#000" strokeWidth={4} />
              <ellipse cx={0} cy={0} rx={130} ry={74} fill="#fff" stroke="#000" strokeWidth={5} />
              <text y={18} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={56} fill="#1d1712">· — · —</text>
            </g>
          );
        })()}
        {/* snow in the Sierra Nevada */}
        {snow && Array.from({ length: 70 }, (_, i) => {
          const x = (i * 157 + frame * (5 + (i % 4))) % 1120 - 20, y = (i * 263 + frame * (9 + (i % 5))) % 1960 - 20;
          return <circle key={`s${i}`} cx={x} cy={y} r={3 + (i % 3) * 2} fill="#fff" opacity={0.85} />;
        })}
      </svg>

      {/* night tint during the ride (day/night cycling while the day counter runs) */}
      {night > 0 && <AbsoluteFill style={{ backgroundColor: "#0b1730", opacity: night, mixBlendMode: "multiply" }} />}
      {/* grain + vignette */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%)" }} />
      <Img src={staticFile("pony/grain.png")} style={{ position: "absolute", inset: 0, width: 1080, height: 1920, opacity: 0.22, mixBlendMode: "multiply" }} />

      {/* rewind overlay */}
      {rewinding && (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <div style={{ fontSize: 210, color: "#fff", letterSpacing: -40, opacity: 0.92, textShadow: "0 0 30px rgba(0,0,0,0.6)", transform: `translateX(${-30 * Math.sin(rw * 20)}px)` }}>◀◀◀</div>
        </AbsoluteFill>
      )}

      {/* day counter badge */}
      {((tScene < T.coldEnd) || (t >= T.depart + 0.6 && t < T.pause)) && (
        <div style={{ position: "absolute", top: 230, right: 70, padding: "14px 28px", borderRadius: 18, background: "#1b140d", border: "5px solid #f2b84b",
          fontFamily: fonts.sans, fontWeight: 900, fontSize: 52, color: "#fff", transform: `scale(${t >= T.depart + 0.6 && t < T.depart + 0.9 ? pop(t, T.depart + 0.6) : 1})` }}>
          <span style={{ color: "#f2b84b", fontSize: 30, marginRight: 12 }}>DAY</span>{tScene < T.coldEnd ? coldDay : day}
        </div>
      )}

      {/* ---------- on-screen story lines (no voiceover) ---------- */}
      <Line t={t} at={0.15} until={1.55} text="1,900 MILES." color="#ffd23f" size={96} />
      <Line t={t} at={1.55} until={2.7} text="10 DAYS." color="#ffd23f" size={96} />
      <Line t={t} at={2.7} until={T.coldEnd} text="ONE HORSE AT A TIME." size={70} />
      <BigSerif t={t} at={T.date} until={T.gap} text="1860" y={360} />
      <Line t={t} at={T.pins - 0.2} until={T.pins + 0.8} text="California is cut off." />
      <Line t={t} at={T.pins + 0.8} until={T.gap} text="The railroad ends in Missouri." />
      <Line t={t} at={T.gap + 0.5} until={T.depart - 0.6} text="Mail takes weeks." />
      <Line t={t} at={T.depart - 0.6} until={T.depart + 1.0} text="Unless…" color="#ffd23f" size={90} />
      <BigSerif t={t} at={T.depart + 1.0} until={T.rideStart + 0.6} text="April 3, 1860" y={380} size={130} />
      <Line t={t} at={T.depart + 1.0} until={T.rideStart + 0.8} text="THE PONY EXPRESS" color="#ffd23f" size={84} />
      <Line t={t} at={T.rideStart + 1.0} until={T.rideStart + 3.6} text="A fresh horse every 10–15 miles" />
      <Line t={t} at={T.rideStart + 3.8} until={T.rideStart + 6.4} text="Riding day and night" />
      <Line t={t} at={T.rideStart + 6.6} until={T.rideStart + 9.6} text="Plains. Rockies. Desert." />
      <Line t={t} at={T.rideStart + 10.2} until={T.rideEnd} text="Then the Sierra snow." />
      <BigSerif t={t} at={T.arrive + 0.6} until={T.pause} text="10 DAYS" y={360} size={190} color="#ffd23f" />
      <Line t={t} at={T.arrive + 0.6} until={T.pause - 0.2} text="Mail across the West in 10 days!" />
      <Line t={t} at={T.pause} until={T.wire} text="Then…" color="#ffd23f" size={90} />
      <BigSerif t={t} at={T.wire} until={T.closed} text="Oct 24, 1861" y={380} size={130} />
      <Line t={t} at={T.wire + 0.3} until={T.wireDone + 0.3} text="The telegraph line is finished." />
      <Line t={t} at={T.wireDone + 0.3} until={T.closed} text="A message: minutes, not days." color="#bfe9ff" />
      <Line t={t} at={T.closed + 1.4} until={T.closed + 4.6} text="2 days later, the Pony Express shut down." />
      <BigSerif t={t} at={T.closed + 4.6} until={T.end} text="18 months" y={360} size={170} color="#ffd23f" />
      <Line t={t} at={T.closed + 4.8} until={T.end} text="That's all it lasted." />

      {sound && <Audio src={staticFile(sound)} />}
    </AbsoluteFill>
  );
};
