import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { geoMercator, geoPath } from "d3-geo";
import { fonts } from "../theme";
import chs from "../sets/charleston.json";
import chsWater from "../sets/charleston_water.json";
import WORDS from "./smallsWords.json";
import { SceneWheel, ScenePlanter, SceneAshore, SceneCrew, SceneBoilers, SceneFamily, SceneHat, SceneSentry, SceneWhistle, SceneGuns, SceneSheet, SceneHandover, SceneCapitol, SceneHouse } from "../sets/smallsScenes";

/**
 * Robert Smalls steals the Planter past Fort Sumter (Charleston, 13 May 1862) — voiced map Short, Pony Express style, 45–60 s.
 * Cues are timed to shorts/robert-smalls-2026-11-23/words.json. Storyboard: social/scripts/robert-smalls-2026-11-23.md.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
type LL = [number, number];
type Word = { w: string; s: number; e: number };

// ---------- ground scenes ----------
type SceneDef = { from: number; to: number; el: (p: { lt: number; dur: number; frame: number }) => React.ReactNode };
export const RS_END = 50.9;
const LOOP_FROM = 47.9;
const SCENES: SceneDef[] = [
  { from: 0, to: 5.3, el: (p) => <SceneWheel {...p} u0={0} /> },
  { from: 8.3, to: 12.5, el: (p) => <ScenePlanter {...p} /> },
  { from: 12.5, to: 15.5, el: (p) => <SceneAshore {...p} /> },
  { from: 15.5, to: 17.8, el: (p) => <SceneCrew {...p} /> },
  { from: 17.8, to: 20.7, el: (p) => <SceneBoilers {...p} /> },
  { from: 22.2, to: 24.6, el: (p) => <SceneFamily {...p} /> },
  { from: 24.6, to: 27.0, el: (p) => <SceneHat {...p} /> },
  { from: 27.0, to: 29.3, el: (p) => <SceneSentry {...p} /> },
  { from: 30.6, to: 32.3, el: (p) => <SceneWhistle {...p} /> },
  { from: 32.3, to: 33.8, el: (p) => <SceneSentry {...p} wave /> },
  { from: 35.1, to: 36.9, el: (p) => <SceneGuns {...p} /> },
  { from: 36.9, to: 39.0, el: (p) => <SceneSheet {...p} /> },
  { from: 39.0, to: 42.7, el: (p) => <SceneHandover {...p} /> },
  { from: 42.7, to: 45.3, el: (p) => <SceneCapitol {...p} /> },
  { from: 45.3, to: LOOP_FROM, el: (p) => <SceneHouse {...p} /> },
  { from: LOOP_FROM, to: RS_END + 1, el: (p) => <SceneWheel {...p} u0={-(RS_END - LOOP_FROM)} /> },
];
export const RS_SCENE_TIMES = SCENES.map((s) => [s.from, s.to]);
const DIVE = 0.45;
function diveFactor(t: number) {
  let f = 1;
  for (let i = 0; i < SCENES.length; i++) {
    const sc = SCENES[i], prevAdj = i > 0 && Math.abs(SCENES[i - 1].to - sc.from) < 0.01, nextAdj = i < SCENES.length - 1 && Math.abs(SCENES[i + 1].from - sc.to) < 0.01;
    if (sc.from > 0 && !prevAdj && t > sc.from - DIVE && t <= sc.from) f = Math.max(f, Math.pow(4, Easing.in(Easing.cubic)((t - (sc.from - DIVE)) / DIVE)));
    if (!nextAdj && sc.to <= RS_END && t >= sc.to && t < sc.to + 0.7) f = Math.max(f, Math.pow(4, 1 - Easing.out(Easing.cubic)((t - sc.to) / 0.7)));
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
  const exitK = nextAdj || sc.to > RS_END ? 0 : interpolate(t, [sc.to - 0.25, sc.to], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
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

// ---------- Charleston Harbor map (US Census 1:500k coastline) ----------
const proj = geoMercator().scale(160000).center([-79.86, 32.74]).translate([0, 0]);
const path = geoPath(proj);
const P = (ll: LL) => proj(ll) as [number, number];
const SOUTH_WHARF: LL = [-79.9265, 32.7745], NORTH_WHARF: LL = [-79.9235, 32.7815], SUMTER: LL = [-79.8747, 32.7523], MOULTRIE: LL = [-79.8575, 32.7597];
const BLOCKADE: LL = [-79.74, 32.705];
const HOP: LL[] = [SOUTH_WHARF, [-79.918, 32.778], NORTH_WHARF];
const ESCAPE: LL[] = [NORTH_WHARF, [-79.915, 32.774], [-79.905, 32.762], [-79.882, 32.755], SUMTER, [-79.86, 32.742], [-79.82, 32.725], [-79.78, 32.712], BLOCKADE];
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
// fraction of ESCAPE at Fort Sumter
const SUMTER_K = (() => { const segs = ESCAPE.slice(1).map((p, i) => Math.hypot(p[0] - ESCAPE[i][0], p[1] - ESCAPE[i][1])); const tot = segs.reduce((a, b) => a + b, 0); return segs.slice(0, 4).reduce((a, b) => a + b, 0) / tot; })();

const cl = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const ease = Easing.inOut(Easing.cubic);
type Cam = { c: [number, number]; z: number };
const lerpCam = (a: Cam, b: Cam, k: number): Cam => ({ c: [a.c[0] + (b.c[0] - a.c[0]) * k, a.c[1] + (b.c[1] - a.c[1]) * k], z: a.z * Math.pow(b.z / a.z, k) });
const HARBOR: Cam = { c: P([-79.85, 32.745]), z: 1.5 };
const CITY: Cam = { c: P([-79.922, 32.778]), z: 4.5 };
const FORT: Cam = { c: P([-79.89, 32.76]), z: 2.8 };
const SEA: Cam = { c: P([-79.785, 32.725]), z: 1.6 };
function baseCamera(t: number): Cam {
  const seg = (t0: number, t1: number, a: Cam, b: Cam) => lerpCam(a, b, ease(interpolate(t, [t0, t1], [0, 1], cl)));
  if (t < 8.3) return seg(5.3, 8.3, { c: HARBOR.c, z: 1.2 }, HARBOR);
  if (t < 22.2) return seg(20.4, 21.0, HARBOR, CITY);
  if (t < 30.6) return seg(29.0, 29.8, CITY, FORT);
  return seg(33.6, 34.4, FORT, SEA);
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
/** side-wheel steamer icon (bow toward +x unless flip); union = Union gunboat */
const SteamerIcon: React.FC<{ x: number; y: number; s?: number; flip?: boolean; rot?: number; union?: boolean; sheet?: boolean }> = ({ x, y, s = 1, flip, rot = 0, union, sheet }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip ? -s : s} ${s})`}>
    <path d="M -44 -6 L 44 -6 L 34 10 L -38 10 Z" fill={union ? "#1f2a4a" : "#3b3532"} stroke="#000" strokeWidth={3} />
    {!union && <path d="M -20 -6 A 14 14 0 0 1 8 -6 Z" fill="#c8b890" stroke="#000" strokeWidth={2} />}
    <rect x={-2} y={-26} width={7} height={20} fill="#2a2626" stroke="#000" strokeWidth={2} />
    {sheet && <g><line x1={30} y1={-6} x2={30} y2={-40} stroke="#000" strokeWidth={2.5} /><rect x={30} y={-40} width={20} height={14} fill="#fff" stroke="#000" strokeWidth={2} /></g>}
    {union && <rect x={30} y={-34} width={16} height={11} fill="#b8282a" stroke="#000" strokeWidth={2} />}
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

export const RobertSmalls: React.FC<{ sound?: string; words?: Word[] }> = ({ sound, words }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cam = camera(t);
  const z = cam.z;
  const toS = (ll: LL): [number, number] => { const p = P(ll); return [540 + (p[0] - cam.c[0]) * z, 960 + (p[1] - cam.c[1]) * z]; };
  const sw = (px: number) => px / z;
  const caps = useMemo(() => chunks(words && words.length ? words : (WORDS as Word[])), [words]);
  const cap = caps.find((c) => t >= c.s && t < c.e);
  const S = useMemo(() => ({ land: path(chs as any) ?? "", water: path(chsWater as any) ?? "" }), []);
  const showMap = (a: number, b: number) => t >= a && t < b;
  const line = (pts: LL[]) => "M " + pts.map((p) => toS(p).join(" ")).join(" L ");
  const sw0 = toS(SOUTH_WHARF), nw = toS(NORTH_WHARF), sum = toS(SUMTER), mou = toS(MOULTRIE), blk = toS(BLOCKADE);
  // route timing per map beat
  const previewK = interpolate(t, [5.8, 7.6], [0, 1], cl);
  const hopK = interpolate(t, [20.9, 21.9], [0, 1], cl);
  const fortK = interpolate(t, [29.4, 30.4], [SUMTER_K * 0.55, SUMTER_K], cl);
  const seaK = interpolate(t, [33.9, 35.0], [SUMTER_K, 1], cl);
  const Route: React.FC<{ k: number; color?: string; dash?: string }> = ({ k, color = "#b5432a", dash = "24 14" }) => (
    <g>
      <path d={line(partial(ESCAPE, k))} fill="none" stroke="#000" strokeOpacity={0.35} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
      <path d={line(partial(ESCAPE, k))} fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash} />
    </g>
  );
  const shipAt = (k: number, sheet?: boolean) => { const p = toS(along(ESCAPE, k)); const q = toS(along(ESCAPE, Math.min(1, k + 0.01))); const rot = (Math.atan2(q[1] - p[1], q[0] - p[0]) * 180) / Math.PI; return <SteamerIcon x={p[0]} y={p[1] + Math.sin(t * 8) * 2} s={1.7} rot={rot} sheet={sheet} />; };
  const night = t < 34;
  return (
    <AbsoluteFill style={{ backgroundColor: "#3f6f78", overflow: "hidden" }}>
      <style>{`@font-face{font-family:"AntonT";src:url(${staticFile("anton.ttf")})}`}</style>
      <AbsoluteFill>
        <svg viewBox="0 0 1080 1920" width="100%" height="100%">
          <defs><radialGradient id="seaG" cx="50%" cy="45%" r="75%"><stop offset="0" stopColor="#6aa6a3" /><stop offset="1" stopColor="#3f7c80" /></radialGradient></defs>
          <rect width={1080} height={1920} fill="#5a9a9a" />
          <g transform={`translate(540 960) scale(${z}) translate(${-cam.c[0]} ${-cam.c[1]})`}>
            <path d={S.land} fillRule="evenodd" fill="#ecdcb0" stroke="none" />
            <path d={S.water} fillRule="evenodd" fill="#5a9a9a" stroke="#3a2418" strokeWidth={sw(3)} />
            <path d={S.water} fillRule="evenodd" fill="#5a9a9a" stroke="none" />
          </g>
          {night && <rect width={1080} height={1920} fill="#0a1430" opacity={0.38} />}
        </svg>
      </AbsoluteFill>

      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        {showMap(5.3, 8.3) && <g>
          <Pin x={sw0[0]} y={sw0[1]} k={pop(t, 5.5)} />
          <Tag x={sw0[0] - 20} y={sw0[1] - 100} t={t} at={5.6} until={8.3} text="CHARLESTON" size={32} />
          <Pin x={sum[0]} y={sum[1]} k={pop(t, 5.9)} color="#555" />
          <Tag x={sum[0] + 10} y={sum[1] + 64} t={t} at={6.0} until={8.3} text="FORT SUMTER" size={30} />
          {previewK > 0 && <Route k={previewK} color="#fff3c4" dash="10 12" />}
          {previewK > 0.98 && <g><SteamerIcon x={blk[0]} y={blk[1]} s={1.6} union flip /><Tag x={blk[0] - 30} y={blk[1] + 70} t={t} at={7.6} until={8.3} text="UNION SHIPS" size={30} bg="#1f3a8a" fg="#fff" /></g>}
        </g>}
        {showMap(20.7, 22.2) && <g>
          <path d={line(partial(HOP, hopK))} fill="none" stroke="#fff3c4" strokeWidth={9} strokeDasharray="14 10" strokeLinecap="round" />
          {(() => { const p = toS(along(HOP, hopK)); return <SteamerIcon x={p[0]} y={p[1]} s={1.6} rot={-40} />; })()}
          <Pin x={nw[0]} y={nw[1]} k={pop(t, 21.5)} />
          <Tag x={nw[0] + 10} y={nw[1] - 100} t={t} at={21.6} until={22.2} text="ANOTHER WHARF" size={32} />
        </g>}
        {showMap(29.3, 30.6) && <g>
          <Route k={fortK} />
          {shipAt(fortK)}
          <Pin x={sum[0]} y={sum[1]} k={1} color="#555" />
          <Tag x={sum[0]} y={sum[1] + 70} t={t} at={29.4} until={30.6} text="FORT SUMTER" size={34} />
          <Tag x={mou[0] + 40} y={mou[1] - 90} t={t} at={29.6} until={30.6} text="FORT MOULTRIE" size={26} />
        </g>}
        {showMap(33.8, 35.1) && <g>
          <Route k={seaK} />
          {shipAt(seaK, true)}
          <SteamerIcon x={blk[0] + 40} y={blk[1]} s={2.0} union flip />
          <Tag x={blk[0] + 10} y={blk[1] + 80} t={t} at={34.2} until={35.1} text="USS ONWARD" size={32} bg="#1f3a8a" fg="#fff" />
        </g>}
      </svg>

      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%)" }} />
      <Img src={staticFile("pony/grain.png")} style={{ position: "absolute", inset: 0, width: 1080, height: 1920, opacity: 0.22, mixBlendMode: "multiply" }} />

      <SceneLayer t={t} frame={frame} />
      <Big t={t} at={-0.5} until={5.2} text="HE STOLE A" color="#fff" size={130} y={140} serif={false} />
      <Big t={t} at={-0.5} until={5.2} text="WARSHIP" color="#ffd23f" size={190} y={280} serif={false} />
      <Big t={t} at={6.3} until={8.2} text="HOW?" color="#ffd23f" size={190} y={200} serif={false} />
      <Big t={t} at={13.2} until={15.3} text="MAY 1862" size={120} y={190} />
      <Big t={t} at={18.3} until={20.6} text="3:00 AM" size={150} y={190} />
      <Big t={t} at={43.0} until={45.2} text="ELECTED" color="#ffd23f" size={140} y={170} serif={false} />
      <Big t={t} at={48.3} until={RS_END + 0.5} text="HE STOLE A" color="#fff" size={130} y={140} serif={false} />
      <Big t={t} at={48.3} until={RS_END + 0.5} text="WARSHIP" color="#ffd23f" size={190} y={280} serif={false} />

      {cap && (
        <div style={{ position: "absolute", top: 1420, left: 60, right: 60, textAlign: "center", fontFamily: fonts.sans, fontWeight: 900, fontSize: 66, lineHeight: 1.1,
          color: "#fff", WebkitTextStroke: "9px #000", paintOrder: "stroke fill", textShadow: "0 6px 0 #000", transform: `scale(${interpolate(t, [cap.s, cap.s + 0.08], [0.9, 1], cl)})` }}>{cap.text}</div>
      )}
      {sound && <Audio src={staticFile(sound)} />}
    </AbsoluteFill>
  );
};
