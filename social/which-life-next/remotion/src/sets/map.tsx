import React from "react";
import { interpolate, Easing, useCurrentFrame } from "remotion";
import { geoGraticule10, geoOrthographic, geoPath, geoDistance, geoInterpolate } from "d3-geo";
import { feature, mesh } from "topojson-client";
import worldTopo from "world-atlas/countries-50m.json";
import statesTopo from "us-atlas/states-10m.json";
import countiesTopo from "us-atlas/counties-10m.json";

/**
 * Real-geography map: an orthographic globe that spins to a real place and zooms in to state / county level.
 * Data: Natural Earth (world-atlas) + US Census (us-atlas). Every place shown is a real coordinate.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
const world = feature(worldTopo as any, (worldTopo as any).objects.countries) as any;
const land = feature(worldTopo as any, (worldTopo as any).objects.land) as any;
const states = feature(statesTopo as any, (statesTopo as any).objects.states) as any;
const stateMesh = mesh(statesTopo as any, (statesTopo as any).objects.states, (a: any, b: any) => a !== b) as any;
const countyMesh = mesh(countiesTopo as any, (countiesTopo as any).objects.counties, (a: any, b: any) => a !== b) as any;
const graticule = geoGraticule10();

export type LonLat = [number, number];
export type MapMarker = { at: LonLat; label: string; appear?: number; kind?: "pin" | "dot" | "star"; color?: string; labelSide?: "left" | "right" };
export type MapLine = { from: LonLat; to: LonLat; label?: string; appear?: number; color?: string; dashed?: boolean };
export type MapProps = {
  /** where the camera ends up */
  target: LonLat;
  /** where the globe starts (default: over the Atlantic) */
  start?: LonLat;
  /** final zoom: "country" | "state" | "region" | "local" or a number (globe scale in px) */
  zoom?: "country" | "state" | "region" | "local" | "town" | number;
  /** 0..1 fraction of the shot spent on the globe spin before zooming */
  spin?: number;
  /** state names to highlight (e.g. ["Iowa"]) */
  highlight?: string[];
  markers?: MapMarker[];
  lines?: MapLine[];
  title?: string;
  narrow?: boolean;
};

const ZOOM: Record<string, number> = { country: 1300, state: 5200, region: 16000, local: 90000, town: 250000 };

export const MapView: React.FC<MapProps & { dur: number }> = ({ target, start = [-40, 30], zoom = "state", spin = 0.4, highlight = [], markers = [], lines = [], title, narrow, dur }) => {
  const frame = useCurrentFrame();
  const t = Math.min(1, frame / Math.max(1, dur));
  const s1 = interpolate(t, [0, spin], [0, 1], { extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const s2 = interpolate(t, [spin, Math.min(1, spin + 0.45)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const centre = geoInterpolate(start, target)(s1) as LonLat;
  const base = 470;
  const endScale = typeof zoom === "number" ? zoom : ZOOM[zoom];
  const scale = base * Math.pow(endScale / base, s2);
  const proj = geoOrthographic().rotate([-centre[0], -centre[1]]).scale(scale).translate([960, 540]).clipAngle(90);
  const path = geoPath(proj);
  const showCounties = scale > 9000;
  const visible = (p: LonLat) => geoDistance(p, centre) < Math.PI / 2 - 0.02;
  const ink = "#2b1d14";
  return (
    <g>
      <defs>
        <radialGradient id="ocean" cx="50%" cy="45%" r="60%">
          <stop offset="0" stopColor="#2f5f86" />
          <stop offset="1" stopColor="#14304a" />
        </radialGradient>
        <radialGradient id="space" cx="50%" cy="50%" r="70%">
          <stop offset="0" stopColor="#1a2238" />
          <stop offset="1" stopColor="#05070d" />
        </radialGradient>
      </defs>
      <rect x={-200} y={-200} width={2320} height={1480} fill="url(#space)" />
      <path d={path({ type: "Sphere" }) ?? ""} fill="url(#ocean)" stroke="#9fc3e0" strokeWidth={3} />
      <path d={path(graticule) ?? ""} fill="none" stroke="#7fa6c6" strokeWidth={1} opacity={0.25} />
      <path d={path(land) ?? ""} fill="#d9c7a0" stroke={ink} strokeWidth={1.5} />
      <path d={path(world) ?? ""} fill="none" stroke="#7d6a4a" strokeWidth={1.2} opacity={0.8} />
      {states.features.filter((f: any) => highlight.includes(f.properties.name)).map((f: any) => (
        <path key={f.id} d={path(f) ?? ""} fill="#f2b84b" opacity={0.85} stroke={ink} strokeWidth={3} />
      ))}
      {/* also show state outlines at all zooms */}
      <path d={path(stateMesh) ?? ""} fill="none" stroke="#6b5a3e" strokeWidth={scale > 3000 ? 2.5 : 1} opacity={0.9} />
      {showCounties && <path d={path(countyMesh) ?? ""} fill="none" stroke="#9c8a66" strokeWidth={1} opacity={interpolate(scale, [9000, 16000], [0, 0.6], { extrapolateRight: "clamp" })} />}
      {/* state labels when zoomed to state level */}
      {scale > 2500 && states.features.filter((f: any) => highlight.includes(f.properties.name)).map((f: any) => {
        const c = path.centroid(f);
        return isFinite(c[0]) ? (
          <text key={`l${f.id}`} x={c[0]} y={c[1]} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={54} fill="#5a3a12" opacity={0.55}>{f.properties.name.toUpperCase()}</text>
        ) : null;
      })}
      {lines.map((l, i) => {
        const a = l.appear ?? 0.6;
        const p = interpolate(t, [a, a + 0.15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        if (p <= 0) return null;
        const mid = geoInterpolate(l.from, l.to)(p) as LonLat;
        const d = path({ type: "LineString", coordinates: [l.from, mid] } as any) ?? "";
        const lm = proj(geoInterpolate(l.from, l.to)(0.5) as LonLat);
        return (
          <g key={`ln${i}`}>
            <path d={d} stroke="#000" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.5} />
            <path d={d} stroke={l.color ?? "#e4512c"} strokeWidth={8} fill="none" strokeLinecap="round" strokeDasharray={l.dashed ? "18 12" : undefined} />
            {l.label && lm && p > 0.9 && (
              <g transform={`translate(${lm[0]} ${lm[1] - (narrow ? 20 : 34)})`}>
                <rect x={-(l.label.length * (narrow ? 22 : 34) * 0.64 + 30) / 2} y={narrow ? -26 : -38} width={l.label.length * (narrow ? 22 : 34) * 0.64 + 30} height={narrow ? 38 : 56} rx={10} fill="#fff3c4" stroke="#000" strokeWidth={narrow ? 4 : 5} />
                <text x={0} y={narrow ? 1 : 2} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={narrow ? 22 : 34} fill="#1d1712">{l.label}</text>
              </g>
            )}
          </g>
        );
      })}
      {markers.map((m, i) => {
        const a = m.appear ?? 0.55;
        const p = interpolate(t, [a, a + 0.06], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const xy = proj(m.at);
        if (!xy || p <= 0 || !visible(m.at)) return null;
        const side = m.labelSide ?? "right";
        const fs = narrow ? Math.min(30, 520 / (m.label.length * 0.62)) : 46;
        const w = m.label.length * fs * 0.62 + 40;
        // narrow (full-screen Short shows world x ~660-1260): centre over the pin, but keep inside the frame
        const lx = narrow ? Math.max(680 - xy[0], Math.min(1240 - xy[0] - w, -w / 2)) : side === "right" ? 40 : -40 - w;
        const ly = narrow ? (m.labelSide === "left" ? 60 : -100) : -70;
        const pulse = 1 + Math.sin(frame * 0.25) * 0.08;
        return (
          <g key={`m${i}`} transform={`translate(${xy[0]} ${xy[1]}) scale(${p})`}>
            <circle r={36 * pulse} fill={m.color ?? "#e4512c"} opacity={0.25} />
            {m.kind === "dot" ? <circle r={14} fill={m.color ?? "#e4512c"} stroke="#000" strokeWidth={5} />
              : <path d="M 0 0 C -26 -34 -26 -70 0 -76 C 26 -70 26 -34 0 0 Z" fill={m.color ?? "#e4512c"} stroke="#000" strokeWidth={5} />}
            {m.kind !== "dot" && <circle cx={0} cy={-50} r={10} fill="#fff" />}
            <g transform={`translate(${lx} ${ly})`}>
              <rect x={0} y={-fs + 4} width={w} height={fs + 22} rx={12} fill="#1b140d" opacity={0.85} stroke="#f2b84b" strokeWidth={4} />
              <text x={20} y={6} fontFamily="Inter" fontWeight={900} fontSize={fs} fill="#fff">{m.label}</text>
            </g>
          </g>
        );
      })}
      {title && (
        <g opacity={interpolate(t, [0, 0.08], [0, 1], { extrapolateRight: "clamp" })}>
          <text x={960} y={narrow ? 240 : 110} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={narrow ? Math.min(46, 540 / (title.length * 0.62)) : 72} fill="#fff" stroke="#000" strokeWidth={10} paintOrder="stroke">{title}</text>
        </g>
      )}
    </g>
  );
};
