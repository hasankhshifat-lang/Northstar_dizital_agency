import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { geoMercator, geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";
import worldTopo from "world-atlas/countries-50m.json";
import land10Topo from "world-atlas/land-10m.json";
import { fonts } from "../theme";
import { SceneLifeboat, SceneCorridor, SceneRam, SceneDeckOrder, SceneBaby, SceneCarpathia, SceneWard, SceneMine, ScenePropellers, SceneJump, SceneKeel, SceneRescue, SceneLater, SceneCottage } from "../sets/violetScenes";

/**
 * Violet Jessop: on the Olympic (1911), the Titanic (1912) and the Britannic (1916) — voiced map Short, Pony Express style, 45–60 s.
 * Cues are timed to shorts/violet-jessop-2026-11-18/words.json. Storyboard: social/scripts/violet-jessop-2026-11-18.md.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
type LL = [number, number];
type Word = { w: string; s: number; e: number };

// ---------- ground scenes ----------
type SceneDef = { from: number; to: number; el: (p: { lt: number; dur: number; frame: number }) => React.ReactNode };
export const VJ_END = 51.4;
const SCENES: SceneDef[] = [
  { from: 0, to: 4.6, el: (p) => <SceneLifeboat {...p} u0={0} /> },
  { from: 7.3, to: 9.9, el: (p) => <SceneCorridor {...p} /> },
  { from: 12.2, to: 14.2, el: (p) => <SceneRam {...p} /> },
  { from: 19.4, to: 23.6, el: (p) => <SceneDeckOrder {...p} /> },
  { from: 23.6, to: 26.2, el: (p) => <SceneBaby {...p} /> },
  { from: 26.2, to: 29.6, el: (p) => <SceneCarpathia {...p} /> },
  { from: 31.6, to: 34.9, el: (p) => <SceneWard {...p} /> },
  { from: 34.9, to: 37.5, el: (p) => <SceneMine {...p} /> },
  { from: 37.5, to: 40.4, el: (p) => <ScenePropellers {...p} /> },
  { from: 40.4, to: 42.3, el: (p) => <SceneJump {...p} /> },
  { from: 42.3, to: 44.1, el: (p) => <SceneKeel {...p} /> },
  { from: 44.1, to: 45.8, el: (p) => <SceneRescue {...p} /> },
  { from: 45.8, to: 48.0, el: (p) => <SceneLater {...p} /> },
  { from: 48.0, to: 50.2, el: (p) => <SceneCottage {...p} /> },
  { from: 50.2, to: VJ_END + 1, el: (p) => <SceneLifeboat {...p} u0={-(VJ_END - 50.2)} /> },
];
export const VJ_SCENE_TIMES = SCENES.map((s) => [s.from, s.to]);
const DIVE = 0.45;
function diveFactor(t: number) {
  let f = 1;
  for (let i = 0; i < SCENES.length; i++) {
    const sc = SCENES[i], prevAdj = i > 0 && Math.abs(SCENES[i - 1].to - sc.from) < 0.01, nextAdj = i < SCENES.length - 1 && Math.abs(SCENES[i + 1].from - sc.to) < 0.01;
    if (sc.from > 0 && !prevAdj && t > sc.from - DIVE && t <= sc.from) f = Math.max(f, Math.pow(4, Easing.in(Easing.cubic)((t - (sc.from - DIVE)) / DIVE)));
    if (!nextAdj && sc.to <= VJ_END && t >= sc.to && t < sc.to + 0.7) f = Math.max(f, Math.pow(4, 1 - Easing.out(Easing.cubic)((t - sc.to) / 0.7)));
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
  const exitK = nextAdj || sc.to > VJ_END ? 0 : interpolate(t, [sc.to - 0.25, sc.to], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
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

// ---------- North Atlantic / Europe map ----------
const proj = geoMercator().scale(600).translate([0, 0]).clipExtent([[-8000, -8000], [8000, 8000]]);
const path = geoPath(proj);
const P = (ll: LL) => proj(ll) as [number, number];
const land = feature(worldTopo as any, (worldTopo as any).objects.land) as any;
const borders = mesh(worldTopo as any, (worldTopo as any).objects.countries, (a: any, b: any) => a !== b) as any;
// detailed coastline only around the Solent (Southampton + Isle of Wight), for the close-ups
const a0 = P([-3.2, 51.6]), a1 = P([0.6, 50.0]);
const projUK = geoMercator().scale(600).translate([0, 0]).clipExtent([[a0[0], a0[1]], [a1[0], a1[1]]]);
const land10 = feature(land10Topo as any, (land10Topo as any).objects.land) as any;
const SOU: LL = [-1.40, 50.905], CALSHOT: LL = [-1.31, 50.82], HIT: LL = [-1.275, 50.775], HAWKE0: LL = [-1.05, 50.765];
const CHER: LL = [-1.62, 49.65], QUEENS: LL = [-8.29, 51.85], WRECK: LL = [-49.95, 41.73], KEA: LL = [24.28, 37.70];
const OLY_OUT: LL[] = [SOU, CALSHOT, HIT];
const TITANIC_ROUTE: LL[] = [SOU, [-1.0, 50.6], CHER, [-5.5, 49.8], QUEENS, [-15, 51.0], [-30, 46.5], WRECK];
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
const WORLD3: Cam = { c: P([-13, 45]), z: 1.12 };
const SOLENT: Cam = { c: P([-1.30, 50.83]), z: 95 };
const ATL: Cam = { c: P([-24, 47]), z: 1.35 };
const MED: Cam = { c: P([18, 41]), z: 2.1 };
function baseCamera(t: number): Cam {
  const seg = (t0: number, t1: number, a: Cam, b: Cam) => lerpCam(a, b, ease(interpolate(t, [t0, t1], [0, 1], cl)));
  if (t < 7.3) return seg(4.6, 7.3, { c: WORLD3.c, z: 1.05 }, WORLD3);
  if (t < 12.2) return seg(9.9, 11.3, WORLD3, SOLENT);
  if (t < 19.4) return t < 16.2 ? SOLENT : seg(16.2, 17.7, SOLENT, ATL);
  if (t < 31.6) return seg(29.6, 30.9, ATL, MED);
  return MED;
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
/** small four-funnel liner icon (bow toward +x unless flip); grey = warship */
const ShipIcon: React.FC<{ x: number; y: number; s?: number; flip?: boolean; rot?: number; war?: boolean }> = ({ x, y, s = 1, flip, rot = 0, war }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip ? -s : s} ${s})`}>
    <path d="M -46 -6 L 50 -6 L 40 10 L -40 10 Z" fill={war ? "#6a7078" : "#1c1c20"} stroke="#000" strokeWidth={3} />
    {!war && <rect x={-34} y={-14} width={66} height={8} fill="#f4f0e6" stroke="#000" strokeWidth={2} />}
    {(war ? [-6] : [-24, -10, 4, 18]).map((fx) => <rect key={fx} x={fx} y={war ? -18 : -28} width={8} height={war ? 12 : 14} fill={war ? "#4a5058" : "#d89b4a"} stroke="#000" strokeWidth={2} />)}
  </g>
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

export const VioletJessop: React.FC<{ sound?: string; words?: Word[] }> = ({ sound, words = [] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cam = camera(t);
  const z = cam.z;
  const toS = (ll: LL): [number, number] => { const p = P(ll); return [540 + (p[0] - cam.c[0]) * z, 960 + (p[1] - cam.c[1]) * z]; };
  const sw = (px: number) => px / z;
  const caps = useMemo(() => chunks(words), [words]);
  const cap = caps.find((c) => t >= c.s && t < c.e);
  const S = useMemo(() => ({ land: path(land) ?? "", borders: path(borders) ?? "", uk: geoPath(projUK)(land10) ?? "" }), []);
  const showMap = (a: number, b: number) => t >= a && t < b;
  const line = (pts: LL[]) => "M " + pts.map((p) => toS(p).join(" ")).join(" L ");
  const sou = toS(SOU), wreck = toS(WRECK), kea = toS(KEA), hit = toS(HIT);
  const detail = z > 6;
  // Olympic out to the collision (10.3–11.9), Hawke converging; then back to port (14.3–16.0)
  const outK = interpolate(t, [10.3, 11.9], [0, 1], cl), hawkK = interpolate(t, [10.6, 11.9], [0, 1], cl);
  const backK = interpolate(t, [14.3, 16.0], [0, 1], cl);
  const titK = interpolate(t, [16.9, 19.0], [0, 1], cl);
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

      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        {showMap(4.6, 7.3) && <g>
          <Pin x={sou[0]} y={sou[1]} k={pop(t, 4.9)} />
          <Tag x={sou[0] + 30} y={sou[1] - 100} t={t} at={5.0} until={7.3} text="1911 OLYMPIC" size={30} />
          <Pin x={wreck[0]} y={wreck[1]} k={pop(t, 5.4)} />
          <Tag x={wreck[0] + 20} y={wreck[1] + 60} t={t} at={5.5} until={7.3} text="1912 TITANIC" size={30} />
          <Pin x={kea[0]} y={kea[1]} k={pop(t, 5.9)} />
          <Tag x={kea[0] - 60} y={kea[1] + 60} t={t} at={6.0} until={7.3} text="1916 BRITANNIC" size={30} />
        </g>}
        {showMap(9.9, 12.2) && <g>
          <Pin x={sou[0]} y={sou[1]} k={pop(t, 10.0)} />
          {detail && <Tag x={sou[0] - 40} y={sou[1] - 100} t={t} at={11.0} until={12.2} text="SOUTHAMPTON" size={32} />}
          {outK > 0 && <path d={line(partial(OLY_OUT, outK))} fill="none" stroke="#1b140d" strokeWidth={7} strokeDasharray="18 10" strokeLinecap="round" />}
          {outK > 0 && (() => { const p = toS(along(OLY_OUT, outK)); return <ShipIcon x={p[0]} y={p[1]} s={1.8} rot={28} />; })()}
          {hawkK > 0 && (() => { const p = toS([HAWKE0[0] + (HIT[0] + 0.012 - HAWKE0[0]) * hawkK, HAWKE0[1] + (HIT[1] - HAWKE0[1]) * hawkK]); return <g><ShipIcon x={p[0]} y={p[1]} s={2.0} flip war /><Tag x={p[0] + 40} y={p[1] + 70} t={t} at={11.2} until={12.2} text="HMS HAWKE" size={30} /></g>; })()}
          {t > 11.9 && <circle cx={hit[0]} cy={hit[1]} r={30 + (t - 11.9) * 200} fill="none" stroke="#fff3c4" strokeWidth={8} opacity={Math.max(0, 1 - (t - 11.9) * 3)} />}
        </g>}
        {showMap(14.2, 16.2) && <g>
          <path d={line(partial([...OLY_OUT].reverse(), backK))} fill="none" stroke="#1b140d" strokeWidth={7} strokeDasharray="10 12" strokeLinecap="round" />
          {(() => { const p = toS(along([...OLY_OUT].reverse(), backK)); return <ShipIcon x={p[0]} y={p[1] + Math.sin(t * 9) * 3} s={1.8} flip rot={28} />; })()}
          <Pin x={sou[0]} y={sou[1]} k={1} />
          <Tag x={sou[0] - 40} y={sou[1] - 100} t={t} at={14.4} until={16.2} text="BACK TO PORT" size={34} />
        </g>}
        {showMap(16.2, 19.4) && <g>
          {titK > 0 && <path d={line(partial(TITANIC_ROUTE, titK))} fill="none" stroke="#000" strokeOpacity={0.35} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />}
          {titK > 0 && <path d={line(partial(TITANIC_ROUTE, titK))} fill="none" stroke="#b5432a" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="24 14" />}
          {titK > 0 && titK < 1 && (() => { const p = toS(along(TITANIC_ROUTE, titK)); return <ShipIcon x={p[0]} y={p[1]} s={1.4} flip />; })()}
          {titK >= 1 && <Pin x={wreck[0]} y={wreck[1]} k={pop(t, 19.0)} />}
          <Tag x={wreck[0] + 30} y={wreck[1] + 70} t={t} at={18.3} until={19.4} text="TITANIC · APRIL 1912" size={30} />
        </g>}
        {showMap(29.6, 31.6) && <g>
          <Pin x={kea[0]} y={kea[1]} k={pop(t, 30.7)} />
          <Tag x={kea[0]} y={kea[1] + 60} t={t} at={30.8} until={31.6} text="AEGEAN SEA" size={34} />
        </g>}
      </svg>

      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%)" }} />
      <Img src={staticFile("pony/grain.png")} style={{ position: "absolute", inset: 0, width: 1080, height: 1920, opacity: 0.22, mixBlendMode: "multiply" }} />

      <SceneLayer t={t} frame={frame} />
      <Big t={t} at={-0.5} until={4.5} text="3 SHIP DISASTERS" color="#fff" size={118} y={150} serif={false} />
      <Big t={t} at={-0.5} until={4.5} text="SHE LIVED" color="#ffd23f" size={175} y={290} serif={false} />
      <Big t={t} at={5.0} until={7.2} text="HOW DID SHE" color="#fff" size={115} y={170} serif={false} />
      <Big t={t} at={5.0} until={7.2} text="SURVIVE ALL 3?" color="#ffd23f" size={135} y={300} serif={false} />
      <Big t={t} at={10.0} until={12.1} text="1911" size={150} y={220} />
      <Big t={t} at={16.4} until={18.2} text="7 MONTHS LATER" color="#ffd23f" size={125} y={200} serif={false} />
      <Big t={t} at={29.8} until={31.5} text="WORLD WAR I" color="#ffd23f" size={140} y={200} serif={false} />
      <Big t={t} at={35.1} until={37.4} text="NOV 21, 1916" size={110} y={150} />
      <Big t={t} at={49.0} until={50.1} text="ON DRY LAND" color="#ffd23f" size={130} y={170} serif={false} />
      <Big t={t} at={50.5} until={VJ_END + 0.5} text="3 SHIP DISASTERS" color="#fff" size={118} y={150} serif={false} />
      <Big t={t} at={50.5} until={VJ_END + 0.5} text="SHE LIVED" color="#ffd23f" size={175} y={290} serif={false} />

      {cap && (
        <div style={{ position: "absolute", top: 1420, left: 60, right: 60, textAlign: "center", fontFamily: fonts.sans, fontWeight: 900, fontSize: 66, lineHeight: 1.1,
          color: "#fff", WebkitTextStroke: "9px #000", paintOrder: "stroke fill", textShadow: "0 6px 0 #000", transform: `scale(${interpolate(t, [cap.s, cap.s + 0.08], [0.9, 1], cl)})` }}>{cap.text}</div>
      )}
      {sound && <Audio src={staticFile(sound)} />}
    </AbsoluteFill>
  );
};
