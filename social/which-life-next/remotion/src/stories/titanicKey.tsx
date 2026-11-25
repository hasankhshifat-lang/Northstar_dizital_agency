import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { geoMercator, geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";
import worldTopo from "world-atlas/countries-50m.json";
import land10Topo from "world-atlas/land-10m.json";
import { fonts } from "../theme";
import WORDS from "./titanicKeyWords.json";
import { SceneKeyHook, SceneGangway, SceneNestDay, SceneSpot, SceneBell, SceneScrape, SceneInquiry, SceneLocker, SceneAuction } from "../sets/titanicKeyScenes";

/**
 * The key that left the Titanic (2nd Officer David Blair, the crow's-nest key, lookouts without binoculars, April 1912) — voiced map Short, Pony Express style, 45–60 s.
 * Cues are timed to shorts/titanic-key-2026-11-25/words.json. Storyboard: social/scripts/titanic-key-2026-11-25.md.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
type LL = [number, number];
type Word = { w: string; s: number; e: number };

// ---------- ground scenes ----------
type SceneDef = { from: number; to: number; el: (p: { lt: number; dur: number; frame: number }) => React.ReactNode };
export const TK_END = 57.6;
const LOOP_FROM = 53.0;
const SCENES: SceneDef[] = [
  { from: 0, to: 7.9, el: (p) => <SceneKeyHook {...p} u0={0} /> },
  { from: 12.2, to: 17.9, el: (p) => <SceneGangway {...p} /> },
  { from: 17.9, to: 24.2, el: (p) => <SceneNestDay {...p} /> },
  { from: 28.7, to: 32.4, el: (p) => <SceneSpot {...p} /> },
  { from: 32.4, to: 35.0, el: (p) => <SceneBell {...p} /> },
  { from: 35.0, to: 36.8, el: (p) => <SceneScrape {...p} /> },
  { from: 36.8, to: 43.9, el: (p) => <SceneInquiry {...p} /> },
  { from: 43.9, to: 48.6, el: (p) => <SceneLocker {...p} /> },
  { from: 48.6, to: LOOP_FROM, el: (p) => <SceneAuction {...p} /> },
  { from: LOOP_FROM, to: TK_END + 1, el: (p) => <SceneKeyHook {...p} u0={-(TK_END - LOOP_FROM)} /> },
];
export const TK_SCENE_TIMES = SCENES.map((s) => [s.from, s.to]);
const DIVE = 0.45;
function diveFactor(t: number) {
  let f = 1;
  for (let i = 0; i < SCENES.length; i++) {
    const sc = SCENES[i], prevAdj = i > 0 && Math.abs(SCENES[i - 1].to - sc.from) < 0.01, nextAdj = i < SCENES.length - 1 && Math.abs(SCENES[i + 1].from - sc.to) < 0.01;
    if (sc.from > 0 && !prevAdj && t > sc.from - DIVE && t <= sc.from) f = Math.max(f, Math.pow(4, Easing.in(Easing.cubic)((t - (sc.from - DIVE)) / DIVE)));
    if (!nextAdj && sc.to <= TK_END && t >= sc.to && t < sc.to + 0.7) f = Math.max(f, Math.pow(4, 1 - Easing.out(Easing.cubic)((t - sc.to) / 0.7)));
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
  const exitK = nextAdj || sc.to > TK_END ? 0 : interpolate(t, [sc.to - 0.25, sc.to], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
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

// ---------- North Atlantic map (world-atlas 50m; 10m coastline around the Solent for the Southampton close-up) ----------
const proj = geoMercator().scale(600).translate([0, 0]).clipExtent([[-8000, -8000], [8000, 8000]]);
const path = geoPath(proj);
const P = (ll: LL) => proj(ll) as [number, number];
const land = feature(worldTopo as any, (worldTopo as any).objects.land) as any;
const borders = mesh(worldTopo as any, (worldTopo as any).objects.countries, (a: any, b: any) => a !== b) as any;
const a0 = P([-3.2, 51.6]), a1 = P([0.6, 50.0]);
const projUK = geoMercator().scale(600).translate([0, 0]).clipExtent([[a0[0], a0[1]], [a1[0], a1[1]]]);
const land10 = feature(land10Topo as any, (land10Topo as any).objects.land) as any;
const SOU: LL = [-1.40, 50.905], CHER: LL = [-1.62, 49.65], QUEENS: LL = [-8.29, 51.85], WRECK: LL = [-49.95, 41.73];
const ROUTE: LL[] = [SOU, [-1.0, 50.6], CHER, [-5.5, 49.8], QUEENS, [-15, 51.0], [-30, 46.5], WRECK];
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
const ATL: Cam = { c: P([-24, 47]), z: 1.35 };
const SOUC: Cam = { c: P([-1.35, 50.85]), z: 30 };
const WRK: Cam = { c: P([-49.95, 41.73]), z: 3.4 };
function baseCamera(t: number): Cam {
  const seg = (t0: number, t1: number, a: Cam, b: Cam) => lerpCam(a, b, ease(interpolate(t, [t0, t1], [0, 1], cl)));
  if (t < 20) return seg(8.0, 10.6, ATL, SOUC);
  if (t < 25.5) return seg(24.2, 25.4, SOUC, ATL);
  return seg(26.4, 28.0, ATL, WRK);
}
const camera = (t: number): Cam => { const c = baseCamera(t); return { c: c.c, z: c.z * diveFactor(t) }; };
const ShipIcon: React.FC<{ x: number; y: number; s?: number; flip?: boolean; rot?: number }> = ({ x, y, s = 1, flip, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip ? -s : s} ${s})`}>
    <path d="M -46 -6 L 50 -6 L 40 10 L -40 10 Z" fill="#1c1c20" stroke="#000" strokeWidth={3} />
    <rect x={-34} y={-14} width={66} height={8} fill="#f4f0e6" stroke="#000" strokeWidth={2} />
    {[-24, -10, 4, 18].map((fx) => <rect key={fx} x={fx} y={-28} width={8} height={14} fill="#d89b4a" stroke="#000" strokeWidth={2} />)}
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

export const TitanicKey: React.FC<{ sound?: string; words?: Word[]; clean?: boolean }> = ({ sound, words, clean }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cam = camera(t);
  const z = cam.z;
  const toS = (ll: LL): [number, number] => { const p = P(ll); return [540 + (p[0] - cam.c[0]) * z, 960 + (p[1] - cam.c[1]) * z]; };
  const sw = (px: number) => px / z;
  const caps = useMemo(() => chunks(words && words.length ? words : (WORDS as Word[])), [words]);
  const cap = caps.find((c) => t >= c.s && t < c.e);
  const S = useMemo(() => ({ land: path(land) ?? "", borders: path(borders) ?? "", uk: geoPath(projUK)(land10) ?? "" }), []);
  const showMap = (a: number, b: number) => t >= a && t < b;
  const line = (pts: LL[]) => "M " + pts.map((p) => toS(p).join(" ")).join(" L ");
  const sou = toS(SOU), wreck = toS(WRECK);
  const detail = z > 6;
  const routeK = interpolate(t, [25.3, 27.5], [0, 1], cl);
  return (
    <AbsoluteFill style={{ backgroundColor: "#4f8e8f", overflow: "hidden" }}>
      <style>{`@font-face{font-family:"AntonT";src:url(${staticFile("anton.ttf")})}`}</style>
      <AbsoluteFill>
        <svg viewBox="0 0 1080 1920" width="100%" height="100%">
          <defs><radialGradient id="seaG" cx="50%" cy="45%" r="75%"><stop offset="0" stopColor="#6aa6a3" /><stop offset="1" stopColor="#3f7c80" /></radialGradient></defs>
          <rect width={1080} height={1920} fill="url(#seaG)" />
          <g transform={`translate(540 960) scale(${z}) translate(${-cam.c[0]} ${-cam.c[1]})`}>
            {!detail && <path d={S.land} fill="#ecdcb0" stroke="#3a2418" strokeWidth={sw(3)} />}
            {detail && <path d={S.uk} fillRule="evenodd" fill="#ecdcb0" stroke="#3a2418" strokeWidth={sw(3)} />}
            {!detail && <path d={S.borders} fill="none" stroke="#3a2418" strokeWidth={sw(1.4)} opacity={0.45} />}
          </g>
        </svg>
      </AbsoluteFill>

      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0, display: clean ? "none" : undefined }}>
        {showMap(7.9, 12.2) && <g>
          <Pin x={sou[0]} y={sou[1]} k={pop(t, 10.0)} />
          <Tag x={sou[0]} y={sou[1] - 130} t={t} at={10.8} until={12.2} text="SOUTHAMPTON" size={42} />
          {t > 10.4 && <ShipIcon x={sou[0] + 60} y={sou[1] + 80} s={2.2} flip />}
        </g>}
        {showMap(24.2, 28.7) && <g>
          <Pin x={sou[0]} y={sou[1]} k={1} />
          {routeK > 0 && <path d={line(partial(ROUTE, routeK))} fill="none" stroke="#000" strokeOpacity={0.35} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />}
          {routeK > 0 && <path d={line(partial(ROUTE, routeK))} fill="none" stroke="#b5432a" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="24 14" />}
          {routeK > 0 && (() => { const p = toS(along(ROUTE, routeK)); return <ShipIcon x={p[0]} y={p[1]} s={1.6} flip />; })()}
          {routeK >= 1 && <Pin x={wreck[0]} y={wreck[1]} k={pop(t, 27.5)} />}
          <Tag x={wreck[0]} y={wreck[1] + 80} t={t} at={27.7} until={28.7} text="11:40 PM" size={44} />
        </g>}
      </svg>

      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%)" }} />
      <Img src={staticFile("pony/grain.png")} style={{ position: "absolute", inset: 0, width: 1080, height: 1920, opacity: 0.22, mixBlendMode: "multiply" }} />

      {!clean && <SceneLayer t={t} frame={frame} />}
      {!clean && <>
      <Big t={t} at={-0.5} until={7.8} text="THIS KEY" color="#fff" size={170} y={110} serif={false} />
      <Big t={t} at={4.9} until={7.8} text="NO BINOCULARS" color="#ffd23f" size={128} y={300} serif={false} />
      <Big t={t} at={8.2} until={10.6} text="THE REASON?" color="#ffd23f" size={150} y={220} serif={false} />
      <Big t={t} at={24.4} until={28.5} text="APRIL 14, 1912" size={96} y={170} />
      <Big t={t} at={42.1} until={43.85} text="“ENOUGH TO GET" color="#fff" size={104} y={150} serif={false} />
      <Big t={t} at={42.1} until={43.85} text="OUT OF THE WAY”" color="#ffd23f" size={104} y={270} serif={false} />
      <Big t={t} at={50.6} until={52.9} text="£90,000" color="#ffd23f" size={190} y={170} serif={false} />
      <Big t={t} at={53.4} until={TK_END + 0.5} text="THIS KEY" color="#fff" size={170} y={110} serif={false} />
      </>}

      {cap && !clean && (
        <div style={{ position: "absolute", top: 1420, left: 60, right: 60, textAlign: "center", fontFamily: fonts.sans, fontWeight: 900, fontSize: 66, lineHeight: 1.1,
          color: "#fff", WebkitTextStroke: "9px #000", paintOrder: "stroke fill", textShadow: "0 6px 0 #000", transform: `scale(${interpolate(t, [cap.s, cap.s + 0.08], [0.9, 1], cl)})` }}>{cap.text}</div>
      )}
      {sound && <Audio src={staticFile(sound)} />}
    </AbsoluteFill>
  );
};
