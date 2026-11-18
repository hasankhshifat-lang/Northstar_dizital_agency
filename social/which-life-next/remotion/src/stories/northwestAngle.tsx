import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { geoMercator, geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";
import worldTopo from "world-atlas/countries-10m.json";
import world50Topo from "world-atlas/countries-50m.json";
import statesTopo from "us-atlas/states-10m.json";
import lakesGeo from "../data/ne10m_lakes_mn.json";
import riversGeo from "../data/ne10m_rivers_mn.json";
import { fonts } from "../theme";
import { SceneBorder, SceneParis, SceneQuill, SceneCanoe, SceneRuler, SceneKiosk, SceneShed, SceneRollUp } from "../sets/angleScenes";

/**
 * The Northwest Angle: why part of Minnesota can only be reached by road through Canada — voiced map Short, Pony Express style, 45–60 s.
 * Cues are timed to shorts/northwest-angle-2026-11-19/words.json. Storyboard: social/scripts/northwest-angle-2026-11-19.md.
 * Geography: world-atlas countries-10m, us-atlas states-10m, Natural Earth 10m lakes + rivers (public domain).
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
type LL = [number, number];
type Word = { w: string; s: number; e: number };

// ---------- ground scenes ----------
type SceneDef = { from: number; to: number; el: (p: { lt: number; dur: number; frame: number }) => React.ReactNode };
export const NA_END = 53.2;
const SCENES: SceneDef[] = [
  { from: 0, to: 4.35, el: (p) => <SceneBorder {...p} u0={0} /> },
  { from: 6.75, to: 10.5, el: (p) => <SceneParis {...p} /> },
  { from: 10.5, to: 14.5, el: (p) => <SceneQuill {...p} /> },
  { from: 21.1, to: 23.2, el: (p) => <SceneCanoe {...p} /> },
  { from: 27.5, to: 31.2, el: (p) => <SceneRuler {...p} /> },
  { from: 45.8, to: 48.5, el: (p) => <SceneKiosk {...p} /> },
  { from: 48.5, to: 50.2, el: (p) => <SceneShed {...p} /> },
  { from: 50.2, to: 52.0, el: (p) => <SceneRollUp {...p} /> },
  { from: 52.0, to: NA_END + 1, el: (p) => <SceneBorder {...p} u0={-(NA_END - 52.0)} /> },
];
export const NA_SCENE_TIMES = SCENES.map((s) => [s.from, s.to]);
const DIVE = 0.45;
function diveFactor(t: number) {
  let f = 1;
  for (let i = 0; i < SCENES.length; i++) {
    const sc = SCENES[i], prevAdj = i > 0 && Math.abs(SCENES[i - 1].to - sc.from) < 0.01, nextAdj = i < SCENES.length - 1 && Math.abs(SCENES[i + 1].from - sc.to) < 0.01;
    if (sc.from > 0 && !prevAdj && t > sc.from - DIVE && t <= sc.from) f = Math.max(f, Math.pow(4, Easing.in(Easing.cubic)((t - (sc.from - DIVE)) / DIVE)));
    if (!nextAdj && sc.to <= NA_END && t >= sc.to && t < sc.to + 0.7) f = Math.max(f, Math.pow(4, 1 - Easing.out(Easing.cubic)((t - sc.to) / 0.7)));
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
  const exitK = nextAdj || sc.to > NA_END ? 0 : interpolate(t, [sc.to - 0.25, sc.to], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
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

// ---------- Minnesota / Lake of the Woods map ----------
const proj = geoMercator().scale(3000).translate([0, 0]).clipExtent([[-30000, -30000], [30000, 30000]]);
const path = geoPath(proj);
const P = (ll: LL) => proj(ll) as [number, number];
const countries = feature(worldTopo as any, (worldTopo as any).objects.countries) as any;
const canada = { type: "FeatureCollection", features: countries.features.filter((f: any) => f.id === "124") } as any;
const countries50 = feature(world50Topo as any, (world50Topo as any).objects.countries) as any;
const canada50 = { type: "FeatureCollection", features: countries50.features.filter((f: any) => f.id === "124") } as any;
const otherLand = { type: "FeatureCollection", features: countries50.features.filter((f: any) => f.id !== "124" && f.id !== "840") } as any;
// detailed layers for the close-ups, clipped to the Lake of the Woods region (keeps each frame light)
const d0 = proj([-100.5, 51.8]) as [number, number], d1 = proj([-88.5, 43.0]) as [number, number];
const projD = geoMercator().scale(3000).translate([0, 0]).clipExtent([d0, d1]);
const pathD = geoPath(projD);
const states = feature(statesTopo as any, (statesTopo as any).objects.states) as any;
const lower48 = { type: "FeatureCollection", features: states.features.filter((f: any) => !["02", "15", "72", "78", "60", "66", "69"].includes(f.id)) } as any;
const stateLines = mesh(statesTopo as any, (statesTopo as any).objects.states, (a: any, b: any) => a !== b) as any;
const mn = states.features.find((f: any) => f.id === "27");
const lakes = lakesGeo as any;
const lotw = { type: "FeatureCollection", features: lakes.features.filter((f: any) => f.properties.name === "Lake of the Woods") } as any;
const mississippi = { type: "FeatureCollection", features: (riversGeo as any).features.filter((f: any) => f.properties.name === "Mississippi") } as any;

const NWPT: LL = [-95.153, 49.384]; // northwesternmost point of Lake of the Woods (1825 survey, confirmed 1842)
const ITASCA: LL = [-95.207, 47.24];
const ANGLE: LL = [-95.06, 49.33];
const RAINY: LL[] = [[-92.9, 48.55], [-93.6, 48.62], [-94.6, 48.72], [-94.9, 49.0], [-95.2, 49.2], [-95.5, 49.32]];
const FAKE_MISS: LL[] = [[-94.6, 46.0], [-95.3, 47.0], [-96.1, 48.2], [-96.6, 49.1], [-96.9, 49.7]];
const WEST_END: LL = [-96.78, 49.384];
const ROUTE: LL[] = [[-95.314, 48.905], [-95.35, 49.0], [-95.6, 49.023], [-95.62, 49.16], [-95.45, 49.25], [-95.2, 49.3], [-95.153, 49.3], [-95.06, 49.345]];
const along = (pts: LL[], k: number): LL => {
  const segs = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const tot = segs.reduce((a, b) => a + b, 0); let d = Math.max(0, Math.min(1, k)) * tot;
  for (let i = 0; i < segs.length; i++) { if (d <= segs[i]) { const f = d / segs[i]; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f]; } d -= segs[i]; }
  return pts[pts.length - 1];
};
const partial = (pts: LL[], k: number) => {
  const segs = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const tot = segs.reduce((a, b) => a + b, 0); const out: LL[] = [pts[0]]; let acc = 0;
  for (let i = 0; i < segs.length; i++) { acc += segs[i]; if (acc / tot <= k) out.push(pts[i + 1]); else break; }
  out.push(along(pts, k)); return out;
};

const cl = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const ease = Easing.inOut(Easing.cubic);
type Cam = { c: [number, number]; z: number };
const lerpCam = (a: Cam, b: Cam, k: number): Cam => ({ c: [a.c[0] + (b.c[0] - a.c[0]) * k, a.c[1] + (b.c[1] - a.c[1]) * k], z: a.z * Math.pow(b.z / a.z, k) });
const MN: Cam = { c: P([-94.4, 47.9]), z: 2.0 };
const OLD: Cam = { c: P([-95.0, 48.9]), z: 4.2 };
const OLDW: Cam = { c: P([-95.8, 49.0]), z: 3.6 };
const LAKE: Cam = { c: P([-94.85, 49.15]), z: 9.5 };
const SOUTH: Cam = { c: P([-95.6, 48.3]), z: 3.4 };
const LINE: Cam = { c: P([-95.35, 49.1]), z: 8.0 };
const ANG: Cam = { c: P([-95.05, 49.25]), z: 13 };
const US: Cam = { c: P([-100, 41.5]), z: 0.33 };
const DRIVE: Cam = { c: P([-95.35, 49.12]), z: 9.0 };
function baseCamera(t: number): Cam {
  const seg = (t0: number, t1: number, a: Cam, b: Cam) => lerpCam(a, b, ease(interpolate(t, [t0, t1], [0, 1], cl)));
  if (t < 6.75) return seg(4.35, 6.75, { c: MN.c, z: 1.6 }, MN);
  if (t < 18.4) return seg(14.5, 16.2, MN, OLD);
  if (t < 21.1) return seg(18.4, 20.0, OLD, OLDW);
  if (t < 25.3) return seg(23.2, 24.4, OLD, LAKE);
  if (t < 27.5) return seg(25.3, 26.6, LAKE, SOUTH);
  if (t < 35.7) return seg(31.2, 32.0, { c: LINE.c, z: 6.5 }, LINE);
  if (t < 38.5) return seg(35.7, 36.8, LINE, ANG);
  if (t < 42.3) return seg(38.5, 40.0, ANG, US);
  return seg(42.3, 43.2, { c: DRIVE.c, z: 6 }, DRIVE);
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

const TruckIcon: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -30 -4 L -30 -20 L 4 -20 L 10 -34 L 26 -34 L 34 -20 L 40 -18 L 40 -4 Z" fill="#b8402e" stroke="#000" strokeWidth={3} />
    <circle cx={-18} cy={-2} r={8} fill="#1e1e20" stroke="#000" strokeWidth={2} /><circle cx={26} cy={-2} r={8} fill="#1e1e20" stroke="#000" strokeWidth={2} />
  </g>
);

export const NorthwestAngle: React.FC<{ sound?: string; words?: Word[] }> = ({ sound, words = [] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cam = camera(t);
  const z = cam.z;
  const toS = (ll: LL): [number, number] => { const p = P(ll); return [540 + (p[0] - cam.c[0]) * z, 960 + (p[1] - cam.c[1]) * z]; };
  const sw = (px: number) => px / z;
  const caps = useMemo(() => chunks(words), [words]);
  const cap = caps.find((c) => t >= c.s && t < c.e);
  const S = useMemo(() => ({ canada: path(canada50) ?? "", other: path(otherLand) ?? "", us: path(lower48) ?? "", stl: path(stateLines) ?? "", mn: path(mn) ?? "", lakes: path(lakes) ?? "", lotw: path(lotw) ?? "", miss: path(mississippi) ?? "",
    canadaD: pathD(canada) ?? "", usD: pathD(lower48) ?? "", stlD: pathD(stateLines) ?? "", mnD: pathD(mn) ?? "" }), []);
  const det = z >= 3;
  const showMap = (a: number, b: number) => t >= a && t < b;
  const line = (pts: LL[]) => "M " + pts.map((p) => toS(p).join(" ")).join(" L ");
  const nw = toS(NWPT), ang = toS(ANGLE), ita = toS(ITASCA);
  // 1755-map overlay (14.5–23.2): oval lake + river drawn where the old map put them
  const oldK = t >= 14.5 && t < 25.3 ? (t < 23.2 ? fade(t, 14.5, 23.2, 0.4) : interpolate(t, [23.2, 24.2], [1, 0], cl)) : 0;
  const realLake = t >= 23.2 && t < 25.3 ? interpolate(t, [23.2, 24.2], [0, 1], cl) : 0;
  const rainyK = interpolate(t, [14.9, 18.0], [0, 1], cl);
  const westK = interpolate(t, [18.7, 20.6], [0, 1], cl);
  const south1 = interpolate(t, [31.9, 33.6], [0, 1], cl), west2 = interpolate(t, [34.0, 35.6], [0, 1], cl);
  const y49 = P([-95, 49])[1];
  const angleGlow = t >= 35.7 && t < 42.3 ? 0.55 + 0.25 * Math.sin((t - 35.7) * 6) : 0;
  const drvK = interpolate(t, [42.9, 45.6], [0, 1], cl);
  const oval = toS([-95.0, 49.05]);
  return (
    <AbsoluteFill style={{ backgroundColor: "#6f9fb4", overflow: "hidden" }}>
      <style>{`@font-face{font-family:"AntonT";src:url(${staticFile("anton.ttf")})}`}</style>
      <AbsoluteFill>
        <svg viewBox="0 0 1080 1920" width="100%" height="100%">
          <defs>
            <radialGradient id="seaG" cx="50%" cy="45%" r="75%"><stop offset="0" stopColor="#86b4c6" /><stop offset="1" stopColor="#5e8ea4" /></radialGradient>
            <clipPath id="north49"><rect x={-40000} y={-40000} width={80000} height={40000 + y49} /></clipPath>
          </defs>
          <rect width={1080} height={1920} fill="url(#seaG)" />
          <g transform={`translate(540 960) scale(${z}) translate(${-cam.c[0]} ${-cam.c[1]})`}>
            {!det && <path d={S.other} fill="#ccd0bc" stroke="#3a2418" strokeWidth={sw(2)} />}
            <path d={det ? S.canadaD : S.canada} fill="#c4ccb4" stroke="#3a2418" strokeWidth={sw(2)} />
            <path d={det ? S.usD : S.us} fill="#f2dca4" stroke="#3a2418" strokeWidth={sw(2.5)} />
            <path d={det ? S.stlD : S.stl} fill="none" stroke="#3a2418" strokeWidth={sw(1.6)} opacity={0.5} />
            {angleGlow > 0 && <path d={det ? S.mnD : S.mn} clipPath="url(#north49)" fill="#ffc83d" opacity={angleGlow} />}
            <path d={S.lakes} fill="#7fb0c4" stroke="#3a2418" strokeWidth={sw(1.4)} opacity={1 - oldK * 0.85} />
            {realLake > 0 && <path d={S.lotw} fill="none" stroke="#ffd23f" strokeWidth={sw(6)} opacity={realLake * (t < 24.8 ? 1 : interpolate(t, [24.8, 25.3], [1, 0], cl))} />}
            {showMap(25.3, 27.5) && <path d={S.miss} fill="none" stroke="#1f6fb8" strokeWidth={sw(7)} strokeLinecap="round" />}
          </g>
        </svg>
      </AbsoluteFill>

      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        {showMap(4.35, 6.75) && (() => { const m = toS([-94.4, 46.4]), c = toS([-97.4, 49.3]); return <g>
          <Tag x={m[0]} y={m[1]} t={t} at={4.4} until={6.75} text="MINNESOTA" size={40} />
          <Tag x={c[0]} y={c[1]} t={t} at={4.6} until={6.75} text="CANADA" size={40} bg="#7a1e1e" fg="#fff" />
          <Pin x={ang[0]} y={ang[1]} k={pop(t, 4.9)} />
        </g>; })()}
        {/* the 1755 map's version */}
        {oldK > 0 && <g opacity={oldK}>
          <rect width={1080} height={1920} fill="#e8d098" opacity={0.35} />
          <ellipse cx={oval[0]} cy={oval[1]} rx={0.55 * 52 * z} ry={0.38 * 52 * z} fill="#9cc0b8" stroke="#6a4a2a" strokeWidth={6} />
          <path d={line(FAKE_MISS)} fill="none" stroke="#3a7ab0" strokeWidth={8} strokeDasharray="16 10" strokeLinecap="round" />
          {(() => { const m = toS([-96.3, 48.0]); return <Tag x={m[0] - 40} y={m[1]} t={t} at={18.8} until={23.2} text="MISSISSIPPI?" size={34} />; })()}
          <Tag x={540} y={300} t={t} at={14.7} until={23.2} text="AS THE 1755 MAP SHOWED IT" size={38} bg="#6a4a2a" fg="#f2e3b5" />
        </g>}
        {showMap(14.5, 21.1) && <g>
          {rainyK > 0 && <path d={line(partial(RAINY, rainyK))} fill="none" stroke="#c62828" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />}
          {rainyK >= 1 && <Pin x={toS([-95.5, 49.32])[0]} y={toS([-95.5, 49.32])[1]} k={pop(t, 18.0)} />}
          <Tag x={toS([-95.5, 49.32])[0]} y={toS([-95.5, 49.32])[1] - 110} t={t} at={17.3} until={21.1} text="NORTHWEST CORNER" size={32} />
          {westK > 0 && <path d={line([[-95.5, 49.32], [-95.5 - (96.75 - 95.5) * westK, 49.32]])} fill="none" stroke="#c62828" strokeWidth={10} strokeLinecap="round" strokeDasharray="22 12" />}
          {westK > 0.2 && <Tag x={toS([-96.1, 49.32])[0]} y={toS([-96.1, 49.32])[1] + 70} t={t} at={19.0} until={21.1} text="DUE WEST" size={34} />}
        </g>}
        {showMap(23.2, 25.3) && <g>
          <Tag x={540} y={300} t={t} at={23.6} until={25.3} text="THE REAL LAKE" size={44} />
          <Tag x={toS([-94.6, 49.55])[0]} y={toS([-94.6, 49.55])[1]} t={t} at={24.0} until={25.3} text="A MAZE OF BAYS" size={34} bg="#f2e3b5" fg="#1b140d" />
        </g>}
        {showMap(25.3, 27.5) && <g>
          <path d={line([NWPT, [WEST_END[0] - 1.2 * interpolate(t, [25.5, 26.6], [0, 1], cl), WEST_END[1]]])} fill="none" stroke="#c62828" strokeWidth={8} strokeDasharray="22 12" strokeLinecap="round" />
          <Pin x={ita[0]} y={ita[1]} k={pop(t, 25.9)} color="#1f6fb8" />
          <Tag x={ita[0]} y={ita[1] + 70} t={t} at={26.0} until={27.5} text="MISSISSIPPI STARTS HERE" size={32} bg="#1f4a7a" fg="#fff" />
          <Tag x={toS([-96.3, 49.384])[0]} y={toS([-96.3, 49.384])[1] - 60} t={t} at={26.5} until={27.5} text="NEVER MEETS IT" size={32} />
        </g>}
        {showMap(31.2, 38.5) && <g>
          <Pin x={nw[0]} y={nw[1]} k={pop(t, 31.4)} />
          {t < 34 && <Tag x={nw[0] - 60} y={nw[1] - 110} t={t} at={31.5} until={34.0} text="THAT CORNER" size={34} />}
          {south1 > 0 && <path d={line([NWPT, [NWPT[0], NWPT[1] - (NWPT[1] - 49.0) * south1]])} fill="none" stroke="#c62828" strokeWidth={10} strokeLinecap="round" />}
          {west2 > 0 && <path d={line([[NWPT[0], 49.0], [NWPT[0] - 2.2 * west2, 49.0]])} fill="none" stroke="#c62828" strokeWidth={10} strokeLinecap="round" />}
          {west2 > 0 && <Tag x={toS([-96.0, 49.0])[0]} y={toS([-96.0, 49.0])[1] + 80} t={t} at={34.1} until={36.0} text="49th PARALLEL" size={34} />}
          {t >= 35.7 && <Tag x={ang[0]} y={ang[1] + 30} t={t} at={36.6} until={38.5} text="CUT OFF" size={44} bg="#7a1e1e" fg="#fff" />}
        </g>}
        {showMap(38.5, 42.3) && <g>
          <path d={line([[-123.3, 49.0], [-95.153, 49.0]])} fill="none" stroke="#c62828" strokeWidth={6} strokeDasharray="14 8" />
          <Tag x={toS([-110, 49])[0]} y={toS([-110, 49])[1] - 50} t={t} at={39.8} until={42.3} text="49°N" size={36} />
          {t > 39.9 && <g><circle cx={ang[0]} cy={ang[1]} r={24 + 6 * Math.sin(t * 8)} fill="none" stroke="#ffd23f" strokeWidth={8} />
            <path d={`M ${ang[0] + 150} ${ang[1] - 150} L ${ang[0] + 36} ${ang[1] - 36}`} stroke="#ffd23f" strokeWidth={12} strokeLinecap="round" /></g>}
        </g>}
        {showMap(42.3, 45.8) && <g>
          {(() => { const a = toS([-96.0, 49.5]); return <Tag x={a[0]} y={a[1]} t={t} at={42.6} until={45.8} text="CANADA" size={40} bg="#7a1e1e" fg="#fff" />; })()}
          {(() => { const a = toS([-95.3, 48.85]); return <Tag x={a[0]} y={a[1] + 60} t={t} at={42.6} until={45.8} text="WARROAD, MINN." size={30} />; })()}
          {drvK > 0 && <path d={line(partial(ROUTE, drvK))} fill="none" stroke="#000" strokeOpacity={0.35} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />}
          {drvK > 0 && <path d={line(partial(ROUTE, drvK))} fill="none" stroke="#b5432a" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="20 12" />}
          {(() => { const p = toS(along(ROUTE, drvK)); return <TruckIcon x={p[0]} y={p[1]} s={1.6} />; })()}
          <Tag x={540} y={300} t={t} at={43.4} until={45.8} text="~60 MILES THROUGH CANADA" size={38} />
          {drvK >= 1 && <Pin x={ang[0]} y={ang[1]} k={pop(t, 45.6)} />}
        </g>}
      </svg>

      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%)" }} />
      <Img src={staticFile("pony/grain.png")} style={{ position: "absolute", inset: 0, width: 1080, height: 1920, opacity: 0.22, mixBlendMode: "multiply" }} />

      <SceneLayer t={t} frame={frame} />
      <Big t={t} at={-0.5} until={4.3} text="TO DRIVE HERE" color="#fff" size={130} y={150} serif={false} />
      <Big t={t} at={-0.5} until={4.3} text="GO THROUGH CANADA" color="#ffd23f" size={112} y={300} serif={false} />
      <Big t={t} at={4.5} until={6.7} text="WHY IS IT" color="#fff" size={120} y={170} serif={false} />
      <Big t={t} at={4.5} until={6.7} text="UP THERE?" color="#ffd23f" size={150} y={300} serif={false} />
      <Big t={t} at={6.9} until={8.6} text="1783" size={170} y={180} />
      <Big t={t} at={21.3} until={23.1} text="THE MAP WAS WRONG" color="#ffd23f" size={108} y={180} serif={false} />
      <Big t={t} at={27.7} until={29.6} text="1818" size={170} y={180} />
      <Big t={t} at={38.8} until={42.2} text="THE ONLY PART" color="#fff" size={110} y={170} serif={false} />
      <Big t={t} at={38.8} until={42.2} text="NORTH OF 49°" color="#ffd23f" size={140} y={300} serif={false} />
      <Big t={t} at={50.4} until={51.95} text="ONE BAD MAP" color="#ffd23f" size={150} y={190} serif={false} />
      <Big t={t} at={52.2} until={NA_END + 0.5} text="TO DRIVE HERE" color="#fff" size={130} y={150} serif={false} />
      <Big t={t} at={52.2} until={NA_END + 0.5} text="GO THROUGH CANADA" color="#ffd23f" size={112} y={300} serif={false} />

      {cap && (
        <div style={{ position: "absolute", top: 1420, left: 60, right: 60, textAlign: "center", fontFamily: fonts.sans, fontWeight: 900, fontSize: 66, lineHeight: 1.1,
          color: "#fff", WebkitTextStroke: "9px #000", paintOrder: "stroke fill", textShadow: "0 6px 0 #000", transform: `scale(${interpolate(t, [cap.s, cap.s + 0.08], [0.9, 1], cl)})` }}>{cap.text}</div>
      )}
      {sound && <Audio src={staticFile(sound)} />}
    </AbsoluteFill>
  );
};
