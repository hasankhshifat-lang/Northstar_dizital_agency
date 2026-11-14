import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { geoAlbers, geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";
import worldTopo from "world-atlas/countries-50m.json";
import statesTopo from "us-atlas/states-10m.json";
import { fonts } from "../theme";
import { SceneFuse, SceneLookout, SceneFace, SceneRibbons, ScenePistols, SceneSurrender, SceneHostage, SceneChest, SceneFree, SceneDuel, SceneBowsprit, SceneHat } from "../sets/pirateScenes";

/**
 * Blackbeard's Scariest Weapon Wasn't a Gun (1718) — voiced map Short, Pony Express style, 45–60 s.
 * Cues are timed to shorts/blackbeard-2026-11-15/words.json. Storyboard: social/scripts/blackbeard-2026-11-15.md.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
type LL = [number, number];
type Word = { w: string; s: number; e: number };

// ---------- ground scenes ----------
type SceneDef = { from: number; to: number; el: (p: { lt: number; dur: number; frame: number }) => React.ReactNode };
export const BB_END = 53.6;
const SCENES: SceneDef[] = [
  { from: 0, to: 6.3, el: (p) => <SceneFuse {...p} u0={0} /> },
  { from: 10.95, to: 13.8, el: (p) => <SceneLookout {...p} /> },
  { from: 13.8, to: 14.85, el: (p) => <SceneFace {...p} /> },
  { from: 14.85, to: 17.35, el: (p) => <SceneRibbons {...p} /> },
  { from: 17.35, to: 20.3, el: (p) => <ScenePistols {...p} /> },
  { from: 20.3, to: 24.25, el: (p) => <SceneSurrender {...p} /> },
  { from: 29.15, to: 30.6, el: (p) => <SceneHostage {...p} /> },
  { from: 30.6, to: 33.4, el: (p) => <SceneChest {...p} /> },
  { from: 33.4, to: 36.25, el: (p) => <SceneFree {...p} /> },
  { from: 41.75, to: 44.9, el: (p) => <SceneDuel {...p} /> },
  { from: 44.9, to: 47.0, el: (p) => <SceneBowsprit {...p} /> },
  { from: 47.0, to: 50.65, el: (p) => <SceneHat {...p} /> },
  { from: 50.65, to: BB_END + 1, el: (p) => <SceneFuse {...p} u0={-(BB_END - 50.65)} /> },
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

// ---------- East coast + Caribbean map ----------
const proj = geoAlbers().rotate([78, 0]).center([0, 30]).parallels([20, 40]).scale(1300).translate([0, 0]).clipExtent([[-2600, -2600], [2600, 2600]]);
const path = geoPath(proj);
const P = (ll: LL) => proj(ll) as [number, number];
const world = feature(worldTopo as any, (worldTopo as any).objects.countries) as any;
const land = feature(worldTopo as any, (worldTopo as any).objects.land) as any;
const states = feature(statesTopo as any, (statesTopo as any).objects.states) as any;
const stateMesh = mesh(statesTopo as any, (statesTopo as any).objects.states, (a: any, b: any) => a !== b) as any;
const stateP = (n: string) => path(states.features.find((f: any) => f.properties.name === n)) ?? "";
// Blackbeard's 1717–18 track (approximate, for the overview): Lesser Antilles (La Concorde taken near Martinique) → Nassau → Charleston → Ocracoke
const MART: LL = [-61.0, 14.6], NASSAU: LL = [-77.35, 25.06], CHS: LL = [-79.93, 32.78], OCR: LL = [-76.0, 35.1], HAMPTON: LL = [-76.33, 37.0];
const ROUTE: LL[] = [MART, [-64.5, 18.3], [-70.5, 21.5], NASSAU, [-78.6, 28.5], CHS, [-77.6, 34.0], OCR];
const NAVY_ROUTE: LL[] = [HAMPTON, [-75.85, 36.6], [-75.5, 35.9], [-75.62, 35.35], OCR];
const along = (pts: LL[], k: number): LL => {
  const segs = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const tot = segs.reduce((a, b) => a + b, 0); let d = k * tot;
  for (let i = 0; i < segs.length; i++) { if (d <= segs[i]) { const f = d / segs[i]; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f]; } d -= segs[i]; }
  return pts[pts.length - 1];
};

const cl = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const ease = Easing.inOut(Easing.cubic);
type Cam = { c: [number, number]; z: number };
const lerpCam = (a: Cam, b: Cam, k: number): Cam => ({ c: [a.c[0] + (b.c[0] - a.c[0]) * k, a.c[1] + (b.c[1] - a.c[1]) * k], z: a.z * Math.pow(b.z / a.z, k) });
const OVER: Cam = { c: P([-72, 25.5]), z: 1.15 };
const OVER2: Cam = { c: P([-73, 27]), z: 1.35 };
const CHSV: Cam = { c: P([-79.6, 32.6]), z: 9 };
const CHSZ: Cam = { c: P([-79.88, 32.74]), z: 30 };
const NCV: Cam = { c: P([-76.4, 35.9]), z: 6.5 };
const OCRZ: Cam = { c: P([-76.0, 35.15]), z: 22 };
function baseCamera(t: number): Cam {
  const seg = (t0: number, t1: number, a: Cam, b: Cam) => lerpCam(a, b, ease(interpolate(t, [t0, t1], [0, 1], cl)));
  if (t < 10.95) return seg(6.3, 10.9, OVER, OVER2);
  if (t < 29.15) return t < 26.0 ? seg(24.25, 25.9, OVER2, CHSV) : seg(26.0, 27.4, CHSV, CHSZ);
  if (t < 41.75) return t < 40.2 ? seg(36.25, 37.6, { c: P([-77.5, 33.5]), z: 3 }, NCV) : seg(40.2, 41.1, NCV, OCRZ);
  return OCRZ;
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



const ShipIcon: React.FC<{ x: number; y: number; k: number; color?: string; flip?: boolean }> = ({ x, y, k, color = "#141016", flip }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -k : k} ${k})`}>
    <path d="M -34 0 L 34 0 L 24 14 L -26 14 Z" fill={color} stroke="#000" strokeWidth={3} />
    <path d="M 0 -4 L 0 -52 L 26 -8 Z" fill={color === "#141016" ? "#3a3438" : "#f2ead6"} stroke="#000" strokeWidth={3} />
    <path d="M -4 -4 L -4 -46 L -28 -8 Z" fill={color === "#141016" ? "#3a3438" : "#f2ead6"} stroke="#000" strokeWidth={3} />
  </g>
);

export const Blackbeard: React.FC<{ sound?: string; words?: Word[] }> = ({ sound, words = [] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cam = camera(t);
  const z = cam.z;
  const toS = (ll: LL): [number, number] => { const p = P(ll); return [540 + (p[0] - cam.c[0]) * z, 960 + (p[1] - cam.c[1]) * z]; };
  const sw = (px: number) => px / z;
  const caps = useMemo(() => chunks(words), [words]);
  const cap = caps.find((c) => t >= c.s && t < c.e);
  const S = useMemo(() => ({
    land: path(land) ?? "", us: path(world.features.find((f: any) => f.id === "840")) ?? "", mesh: path(stateMesh) ?? "",
    sc: stateP("South Carolina"), nc: stateP("North Carolina"), va: stateP("Virginia"),
  }), []);
  const routeK = interpolate(t, [6.5, 9.4], [0, 1], cl);
  const routePts = ROUTE.map((_, i) => i).filter((i) => i / (ROUTE.length - 1) <= routeK + 1e-6);
  const routeHead = along(ROUTE, routeK);
  const routeD = "M " + [...routePts.map((i) => toS(ROUTE[i])), toS(routeHead)].map((p) => p.join(" ")).join(" L ");
  const navyK = interpolate(t, [38.5, 39.7], [0, 1], cl);
  const navyHead = along(NAVY_ROUTE, navyK);
  const navyD = "M " + [...NAVY_ROUTE.filter((_, i) => i / (NAVY_ROUTE.length - 1) <= navyK + 1e-6).map(toS), toS(navyHead)].map((p) => p.join(" ")).join(" L ");
  const chs = toS(CHS), ocr = toS(OCR), nas = toS(NASSAU), mart = toS(MART), ham = toS(HAMPTON);
  const showMap = (a: number, b: number) => t >= a && t < b;
  return (
    <AbsoluteFill style={{ backgroundColor: "#4f8e8f", overflow: "hidden" }}>
      <style>{`@font-face{font-family:"AntonT";src:url(${staticFile("anton.ttf")})}`}</style>
      <AbsoluteFill>
        <svg viewBox="0 0 1080 1920" width="100%" height="100%">
          <defs><radialGradient id="seaG" cx="50%" cy="45%" r="75%"><stop offset="0" stopColor="#6aa6a3" /><stop offset="1" stopColor="#3f7c80" /></radialGradient></defs>
          <rect width={1080} height={1920} fill="url(#seaG)" />
          <g transform={`translate(540 960) scale(${z}) translate(${-cam.c[0]} ${-cam.c[1]})`}>
            <path d={S.land} fill="#e2d1a4" stroke="#3a2418" strokeWidth={sw(3)} />
            <path d={S.us} fill="#ecdcb0" stroke="#3a2418" strokeWidth={sw(3.5)} />
            <path d={S.sc} fill="#d8a66a" opacity={showMap(24.25, 29.15) ? interpolate(t, [24.6, 25.4], [0, 0.85], cl) : 0} />
            <path d={S.nc} fill="#d8a66a" opacity={showMap(36.25, 41.75) ? interpolate(t, [36.8, 37.6], [0, 0.85], cl) : 0} />
            <path d={S.mesh} fill="none" stroke="#8a6a44" strokeWidth={sw(1.6)} />
          </g>
        </svg>
      </AbsoluteFill>

      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        {showMap(6.3, 10.95) && <g>
          <path d={routeD} fill="none" stroke="#000" strokeOpacity={0.35} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
          <path d={routeD} fill="none" stroke="#b5432a" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="26 14" />
          {[[mart, 0], [nas, 3 / 7], [chs, 5 / 7], [ocr, 1]].map(([p, f], i) => routeK >= (f as number) ? <circle key={i} cx={(p as number[])[0]} cy={(p as number[])[1]} r={11 * pop(t, 6.5 + 2.9 * (f as number))} fill="#fff" stroke="#000" strokeWidth={4} /> : null)}
          {routeK < 1 && <ShipIcon x={toS(routeHead)[0]} y={toS(routeHead)[1] - 6} k={1} />}
          {t >= 9.6 ? <Pin x={ocr[0]} y={ocr[1]} k={pop(t, 9.6)} /> : null}
          <Tag x={mart[0] - 40} y={mart[1] + 70} t={t} at={6.6} until={10.95} text="CARIBBEAN" size={32} bg="#1b140d" fg="#f2e3b5" />
          <Tag x={nas[0] + 10} y={nas[1] + 64} t={t} at={7.8} until={10.95} text="NASSAU" size={32} bg="#1b140d" fg="#f2e3b5" />
          <Tag x={ocr[0] + 40} y={ocr[1] - 110} t={t} at={9.7} until={10.95} text="LAST FIGHT" size={40} bg="#c62828" fg="#fff" />
        </g>}
        {showMap(24.25, 29.15) && <g>
          {t >= 25.5 ? <Pin x={chs[0]} y={chs[1]} k={pop(t, 25.5)} /> : null}
          <Tag x={chs[0] - 60} y={chs[1] + 80} t={t} at={26.6} until={29.15} text="CHARLESTON" size={40} bg="#1b140d" fg="#f2e3b5" />
          {[0, 1, 2, 3].map((i) => { const at = 27.4 + i * 0.22; if (t < at) return null; const ll: LL = [-79.84 + i * 0.03, 32.73 - i * 0.025]; const p = toS(ll); return <ShipIcon key={i} x={p[0] + 70 + i * 75} y={p[1] + 30 + i * 60} k={1.3 * pop(t, at)} />; })}
        </g>}
        {showMap(36.25, 41.75) && <g>
          <path d={navyD} fill="none" stroke="#000" strokeOpacity={0.35} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
          <path d={navyD} fill="none" stroke="#b5432a" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="26 14" />
          {t >= 38.4 && t < 40.2 ? <g><circle cx={ham[0]} cy={ham[1]} r={11} fill="#fff" stroke="#000" strokeWidth={4} /><Tag x={ham[0] - 30} y={ham[1] - 50} t={t} at={38.4} until={40.2} text="ROYAL NAVY" size={32} bg="#1f3a8a" fg="#fff" /></g> : null}
          {navyK > 0 && <g><ShipIcon x={toS(navyHead)[0] - 22} y={toS(navyHead)[1] - 8} k={1} color="#22407a" /><ShipIcon x={toS(navyHead)[0] + 26} y={toS(navyHead)[1] - 30} k={0.9} color="#22407a" /></g>}
          {t >= 40.3 ? <Pin x={ocr[0]} y={ocr[1]} k={pop(t, 40.3)} /> : null}
          <Tag x={ocr[0]} y={ocr[1] + 80} t={t} at={40.4} until={41.75} text="OCRACOKE INLET" size={42} bg="#1b140d" fg="#f2e3b5" />
        </g>}
      </svg>

      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%)" }} />
      <Img src={staticFile("pony/grain.png")} style={{ position: "absolute", inset: 0, width: 1080, height: 1920, opacity: 0.22, mixBlendMode: "multiply" }} />

      <SceneLayer t={t} frame={frame} />
      <Big t={t} at={-0.5} until={6.2} text="FUSES UNDER" color="#fff" size={130} y={170} serif={false} />
      <Big t={t} at={-0.5} until={6.2} text="HIS HAT" color="#ffd23f" size={200} y={310} serif={false} />
      <Big t={t} at={6.5} until={10.9} text="NO RECORD" color="#fff" size={120} y={200} serif={false} />
      <Big t={t} at={6.9} until={10.9} text="HE KILLED ANYONE" color="#ffd23f" size={104} y={330} serif={false} />
      <Big t={t} at={11.15} until={13.75} text="HOW?" color="#ffd23f" size={200} y={230} serif={false} />
      <Big t={t} at={13.85} until={14.8} text="FEAR" color="#ffd23f" size={260} y={200} serif={false} />
      <Big t={t} at={17.45} until={20.25} text="6 PISTOLS" color="#ffd23f" size={170} y={220} serif={false} />
      <Big t={t} at={22.3} until={24.2} text="NO FIGHT" color="#ffd23f" size={170} y={220} serif={false} />
      <Big t={t} at={24.35} until={26.4} text="1718" size={170} y={260} />
      <Big t={t} at={27.85} until={29.1} text="THE WHOLE PORT" serif={false} size={120} color="#ffd23f" y={260} />
      <Big t={t} at={38.5} until={40.2} text="THE NAVY CAME" serif={false} size={120} color="#fff" y={240} />
      <Big t={t} at={41.86} until={44.85} text="5 GUNSHOTS" serif={false} size={140} color="#fff" y={190} />
      <Big t={t} at={43.34} until={44.85} text="20 SWORD CUTS" serif={false} size={120} color="#ffd23f" y={350} />
      <Big t={t} at={47.15} until={50.6} text="HIS FIRST REAL FIGHT" serif={false} size={92} color="#fff" y={220} />
      <Big t={t} at={48.95} until={50.6} text="WAS HIS LAST" serif={false} size={150} color="#ffd23f" y={340} />
      <Big t={t} at={51.7} until={BB_END + 0.5} text="FUSES UNDER" color="#fff" size={130} y={170} serif={false} />
      <Big t={t} at={51.7} until={BB_END + 0.5} text="HIS HAT" color="#ffd23f" size={200} y={310} serif={false} />

      {cap && (
        <div style={{ position: "absolute", top: 1420, left: 60, right: 60, textAlign: "center", fontFamily: fonts.sans, fontWeight: 900, fontSize: 66, lineHeight: 1.1,
          color: "#fff", WebkitTextStroke: "9px #000", paintOrder: "stroke fill", textShadow: "0 6px 0 #000", transform: `scale(${interpolate(t, [cap.s, cap.s + 0.08], [0.9, 1], cl)})` }}>{cap.text}</div>
      )}
      {sound && <Audio src={staticFile(sound)} />}
    </AbsoluteFill>
  );
};
