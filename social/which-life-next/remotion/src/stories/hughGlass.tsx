import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { geoAlbers, geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";
import worldTopo from "world-atlas/countries-50m.json";
import statesTopo from "us-atlas/states-10m.json";
import { fonts } from "../theme";
import { SceneLeft, SceneTrapper, SceneMaul, SceneCamp, SceneNames, SceneTheft, SceneAlone, SceneCrawl, SceneFort, SceneForgive, SceneArmy } from "../sets/glassScenes";

/**
 * Hugh Glass (1823) — voiced map Short, Pony Express style, 45–60 s.
 * Cues are timed to the narration's word timestamps (shorts/hugh-glass-2026-11-12/words.json).
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
type LL = [number, number];
type Word = { w: string; s: number; e: number };

// ---------- ground scenes ----------
type SceneDef = { from: number; to: number; el: (p: { lt: number; dur: number; frame: number }) => React.ReactNode };
export const GLASS_END = 58.7;
const SCENES: SceneDef[] = [
  { from: 0, to: 4.4, el: (p) => <SceneLeft {...p} /> },
  { from: 12.6, to: 17.0, el: (p) => <SceneTrapper {...p} /> },
  { from: 17.0, to: 21.7, el: (p) => <SceneMaul {...p} /> },
  { from: 21.7, to: 26.9, el: (p) => <SceneCamp {...p} /> },
  { from: 26.9, to: 30.9, el: (p) => <SceneNames {...p} /> },
  { from: 30.9, to: 34.7, el: (p) => <SceneTheft {...p} /> },
  { from: 34.7, to: 38.6, el: (p) => <SceneAlone {...p} /> },
  { from: 42.2, to: 46.3, el: (p) => <SceneCrawl {...p} /> },
  { from: 48.0, to: 49.1, el: (p) => <SceneFort {...p} /> },
  { from: 49.1, to: 50.9, el: (p) => <SceneForgive {...p} /> },
  { from: 50.9, to: 55.0, el: (p) => <SceneArmy {...p} /> },
  { from: 55.0, to: GLASS_END + 1, el: (p) => <SceneLeft {...p} loop /> },
];
export const GLASS_SCENE_TIMES = SCENES.map((s) => [s.from, s.to]);
const DIVE = 0.45;
function diveFactor(t: number) {
  let f = 1;
  for (let i = 0; i < SCENES.length; i++) {
    const sc = SCENES[i], prevAdj = i > 0 && Math.abs(SCENES[i - 1].to - sc.from) < 0.01, nextAdj = i < SCENES.length - 1 && Math.abs(SCENES[i + 1].from - sc.to) < 0.01;
    if (sc.from > 0 && !prevAdj && t > sc.from - DIVE && t <= sc.from) f = Math.max(f, Math.pow(4, Easing.in(Easing.cubic)((t - (sc.from - DIVE)) / DIVE)));
    if (!nextAdj && sc.to <= GLASS_END && t >= sc.to && t < sc.to + 0.7) f = Math.max(f, Math.pow(4, 1 - Easing.out(Easing.cubic)((t - sc.to) / 0.7)));
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
  const exitK = nextAdj || sc.to > GLASS_END ? 0 : interpolate(t, [sc.to - 0.25, sc.to], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
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
// Forks of the Grand River (mauling site, near today's Shadehill Reservoir) → Fort Kiowa on the Missouri (near Chamberlain)
const FORKS: LL = [-102.22, 45.73], KIOWA: LL = [-99.35, 43.78];
const ROUTE: LL[] = [FORKS, [-101.65, 45.3], [-101.2, 44.85], [-100.75, 44.62], [-100.42, 44.3], [-99.85, 44.02], KIOWA];
const MISSOURI: LL[] = [[-100.62, 46.0], [-100.42, 45.6], [-100.55, 45.2], [-100.62, 44.85], [-100.38, 44.4], [-99.9, 44.08], [-99.5, 43.95], [-99.3, 43.6], [-98.9, 43.2], [-98.1, 42.95], [-97.4, 42.86], [-96.6, 42.5]];
const GRAND: LL[] = [[-103.6, 45.95], [-102.9, 45.85], [-102.22, 45.73], [-101.5, 45.62], [-100.9, 45.55], [-100.48, 45.5]];
const CHEYENNE: LL[] = [[-103.5, 43.4], [-102.6, 43.9], [-102.0, 44.3], [-101.5, 44.55], [-101.0, 44.68], [-100.6, 44.8]];
const lineD = (pts: LL[]) => "M " + pts.map((ll) => P(ll).join(" ")).join(" L ");

const cl = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const ease = Easing.inOut(Easing.cubic);
type Cam = { c: [number, number]; z: number };
const lerpCam = (a: Cam, b: Cam, k: number): Cam => ({ c: [a.c[0] + (b.c[0] - a.c[0]) * k, a.c[1] + (b.c[1] - a.c[1]) * k], z: a.z * Math.pow(b.z / a.z, k) });
const US: Cam = { c: P([-100, 40.5]), z: 1.7 };
const SDW: Cam = { c: P([-100.3, 44.5]), z: 5.2 };
const RT: Cam = { c: P([-100.8, 44.75]), z: 10 };
function baseCamera(t: number): Cam {
  const seg = (t0: number, t1: number, a: Cam, b: Cam) => lerpCam(a, b, ease(interpolate(t, [t0, t1], [0, 1], cl)));
  if (t < 9.0) return seg(4.6, 8.8, US, { c: US.c, z: 2.1 });
  if (t < 12.6) return seg(9.2, 11.0, { c: US.c, z: 2.1 }, SDW);
  if (t < 38.6) return SDW;
  if (t < 42.2) return seg(38.6, 39.6, SDW, RT);
  return RT;
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
  const fix = (w: string) => w.replace(/^-trapper$/, "trapper").replace(/^Fur$/, "Fur");
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

export const HughGlass: React.FC<{ sound?: string; words?: Word[] }> = ({ sound, words = [] }) => {
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
    land: path(land) ?? "", can: path(world.features.find((f: any) => f.id === "124")) ?? "", mex: path(world.features.find((f: any) => f.id === "484")) ?? "",
    us: path(world.features.find((f: any) => f.id === "840")) ?? "", mesh: path(stateMesh) ?? "",
    sd: stateP("South Dakota"), mo: lineD(MISSOURI), gr: lineD(GRAND), ch: lineD(CHEYENNE),
  }), []);
  // the route: preview flash in the question (4.4–9.0), drawn for real from "he crawls" (41.7) to the fort (48.0)
  const partial = (k: number) => {
    const segs = ROUTE.length - 1, f = Math.max(0, Math.min(1, k)) * segs, i = Math.min(segs - 1, Math.floor(f)), r = f - i;
    const pts = ROUTE.slice(0, i + 1).map((ll) => P(ll)); const a = P(ROUTE[i]), b = P(ROUTE[i + 1]);
    pts.push([a[0] + (b[0] - a[0]) * r, a[1] + (b[1] - a[1]) * r]);
    return "M " + pts.map((p) => `${p[0]} ${p[1]}`).join(" L ");
  };
  const preview = t >= 4.4 && t < 9.0;
  const routeK = preview ? interpolate(t, [4.6, 6.2], [0, 1], cl) : t < 41.6 ? 0 : interpolate(t, [41.6, 42.2], [0, 0.18], cl) + interpolate(t, [46.3, 47.9], [0, 0.82], cl);
  const fk = toS(FORKS), kw = toS(KIOWA);
  const wp = routeK > 0 ? ROUTE.slice(1, -1).map((ll, i) => ({ p: toS(ll), on: routeK >= (i + 1) / (ROUTE.length - 1) })) : [];

  return (
    <AbsoluteFill style={{ backgroundColor: "#4f8e8f", overflow: "hidden" }}>
      <style>{`@font-face{font-family:"AntonT";src:url(${staticFile("anton.ttf")})}`}</style>
      <AbsoluteFill>
        <svg viewBox="0 0 1080 1920" width="100%" height="100%">
          <defs><radialGradient id="seaG" cx="50%" cy="45%" r="75%"><stop offset="0" stopColor="#6aa6a3" /><stop offset="1" stopColor="#3f7c80" /></radialGradient></defs>
          <rect width={1080} height={1920} fill="url(#seaG)" />
          <g transform={`translate(540 960) scale(${z}) translate(${-cam.c[0]} ${-cam.c[1]})`}>
            <path d={S.land} fill="#dcc89c" stroke="#5a4428" strokeWidth={sw(2.2)} />
            <path d={S.can} fill="#e2d1a4" stroke="#3a2418" strokeWidth={sw(3)} />
            <path d={S.mex} fill="#e2d1a4" stroke="#3a2418" strokeWidth={sw(3)} />
            <path d={S.us} fill="#ecdcb0" stroke="#3a2418" strokeWidth={sw(3.5)} />
            <path d={S.sd} fill="#d8a66a" opacity={interpolate(t, [4.8, 5.8], [0, 0.9], cl)} stroke="#3a2418" strokeWidth={sw(3)} />
            <path d={S.mesh} fill="none" stroke="#8a6a44" strokeWidth={sw(1.6)} />
            <g opacity={interpolate(t, [9.6, 10.6], [0, 1], cl)}>
              {[S.mo, S.gr, S.ch].map((d, i) => <path key={i} d={d} fill="none" stroke="#3f8f95" strokeWidth={sw(i === 0 ? 7 : 4.5)} strokeLinecap="round" strokeLinejoin="round" />)}
            </g>
            {routeK > 0 && <g opacity={preview ? 0.55 + 0.45 * Math.abs(Math.sin(t * 5)) : 1}>
              <path d={partial(routeK)} fill="none" stroke="#000" strokeOpacity={0.35} strokeWidth={sw(14)} strokeLinecap="round" strokeLinejoin="round" />
              <path d={partial(routeK)} fill="none" stroke="#b5391f" strokeWidth={sw(8)} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={preview ? `${sw(18)} ${sw(12)}` : undefined} />
            </g>}
            {t >= 39.9 && t < 42.2 && (() => { const a = P(FORKS), b = P(KIOWA), k = interpolate(t, [39.9, 40.6], [0, 1], cl); return <path d={`M ${a[0]} ${a[1]} L ${a[0] + (b[0] - a[0]) * k} ${a[1] + (b[1] - a[1]) * k}`} stroke="#1b140d" strokeWidth={sw(5)} strokeDasharray={`${sw(12)} ${sw(10)}`} />; })()}
          </g>
        </svg>
      </AbsoluteFill>

      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        {wp.map((w, i) => w.on ? <circle key={i} cx={w.p[0]} cy={w.p[1]} r={9} fill="#fff" stroke="#000" strokeWidth={3} /> : null)}
        {(t >= 4.8 && t < 9.0) || (t >= 10.9 && t < 48.0) ? <Pin x={fk[0]} y={fk[1]} k={t < 9 ? pop(t, 4.8) : pop(t, 10.9)} /> : null}
        {t >= 38.9 && t < 48.0 ? <Pin x={kw[0]} y={kw[1]} k={pop(t, 38.94) * (t > 47.8 ? 1 + 0.25 * Math.sin((t - 47.8) * 12) * Math.max(0, 1 - (t - 47.8) * 3) : 1)} color="#e4512c" /> : null}
        <Tag x={fk[0]} y={fk[1] + 70} t={t} at={11.38} until={12.6} text="SOUTH DAKOTA" size={42} bg="#1b140d" fg="#f2e3b5" />
        <Tag x={fk[0]} y={fk[1] + 70} t={t} at={38.6} until={41.6} text="GRAND RIVER" size={34} bg="#1b140d" fg="#f2e3b5" />
        <Tag x={kw[0]} y={kw[1] + 70} t={t} at={39.2} until={48.0} text="FORT KIOWA" size={40} bg="#1b140d" fg="#f2e3b5" />
      </svg>

      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%)" }} />
      <Img src={staticFile("pony/grain.png")} style={{ position: "absolute", inset: 0, width: 1080, height: 1920, opacity: 0.22, mixBlendMode: "multiply" }} />

      <SceneLayer t={t} frame={frame} />
      <Big t={t} at={-0.5} until={4.3} text="LEFT FOR" color="#fff" size={170} y={200} serif={false} />
      <Big t={t} at={-0.5} until={4.3} text="DEAD" color="#ffd23f" size={230} y={390} serif={false} />
      <Big t={t} at={5.5} until={7.3} text="200 MILES" serif={false} size={140} color="#ffd23f" y={260} />
      <Big t={t} at={7.3} until={8.9} text="ALONE?" serif={false} size={160} color="#fff" y={260} />
      <Big t={t} at={9.2} until={12.5} text="AUGUST 1823" size={120} y={280} />
      <Big t={t} at={39.9} until={42.1} text="200 MILES" serif={false} size={140} color="#ffd23f" y={260} />
      <Big t={t} at={46.45} until={47.95} text="6 WEEKS" serif={false} size={160} color="#ffd23f" y={260} />
      <Big t={t} at={56.5} until={GLASS_END} text="LEFT FOR" color="#fff" size={170} y={200} serif={false} />
      <Big t={t} at={56.5} until={GLASS_END} text="DEAD" color="#ffd23f" size={230} y={390} serif={false} />

      {cap && (
        <div style={{ position: "absolute", top: 1420, left: 60, right: 60, textAlign: "center", fontFamily: fonts.sans, fontWeight: 900, fontSize: 66, lineHeight: 1.1,
          color: "#fff", WebkitTextStroke: "9px #000", paintOrder: "stroke fill", textShadow: "0 6px 0 #000", transform: `scale(${interpolate(t, [cap.s, cap.s + 0.08], [0.9, 1], cl)})` }}>{cap.text}</div>
      )}
      {sound && <Audio src={staticFile(sound)} />}
    </AbsoluteFill>
  );
};
