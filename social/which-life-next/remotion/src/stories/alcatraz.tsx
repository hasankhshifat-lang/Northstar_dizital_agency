import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { geoMercator, geoPath } from "d3-geo";
import sfbay from "../sets/sfbay.json";
import { fonts } from "../theme";
import { SceneBeds, ScenePaint, SceneDig, SceneAnglins, SceneSpoon, SceneRaft, ScenePipe, SceneBay, SceneWest, SceneAlone, SceneFound, SceneFog, SceneStamp, SceneMarshal } from "../sets/alcatrazScenes";

/**
 * 3 Men Escaped Alcatraz and Were Never Found (June 1962) — voiced map Short, Pony Express style, 45–60 s.
 * Cues are timed to shorts/alcatraz-2026-11-16/words.json. Storyboard: social/scripts/alcatraz-2026-11-16.md.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
type LL = [number, number];
type Word = { w: string; s: number; e: number };

// ---------- ground scenes ----------
type SceneDef = { from: number; to: number; el: (p: { lt: number; dur: number; frame: number }) => React.ReactNode };
export const AZ_END = 46.8;
const SCENES: SceneDef[] = [
  { from: 0, to: 4.7, el: (p) => <SceneBeds {...p} u0={0} /> },
  { from: 4.7, to: 7.5, el: (p) => <ScenePaint {...p} /> },
  { from: 8.8, to: 10.9, el: (p) => <SceneDig {...p} /> },
  { from: 10.9, to: 13.3, el: (p) => <SceneAnglins {...p} /> },
  { from: 13.3, to: 15.0, el: (p) => <SceneSpoon {...p} /> },
  { from: 15.0, to: 18.4, el: (p) => <SceneRaft {...p} /> },
  { from: 22.15, to: 23.9, el: (p) => <ScenePipe {...p} /> },
  { from: 23.9, to: 26.4, el: (p) => <SceneBay {...p} /> },
  { from: 26.4, to: 29.95, el: (p) => <SceneWest {...p} /> },
  { from: 29.95, to: 31.95, el: (p) => <SceneAlone {...p} /> },
  { from: 31.95, to: 35.8, el: (p) => <SceneFound {...p} /> },
  { from: 35.8, to: 37.3, el: (p) => <SceneFog {...p} /> },
  { from: 37.3, to: 39.45, el: (p) => <SceneStamp {...p} /> },
  { from: 41.0, to: 43.95, el: (p) => <SceneMarshal {...p} /> },
  { from: 43.95, to: AZ_END + 1, el: (p) => <SceneBeds {...p} u0={-(AZ_END - 43.95)} /> },
];
export const AZ_SCENE_TIMES = SCENES.map((s) => [s.from, s.to]);
const DIVE = 0.45;
function diveFactor(t: number) {
  let f = 1;
  for (let i = 0; i < SCENES.length; i++) {
    const sc = SCENES[i], prevAdj = i > 0 && Math.abs(SCENES[i - 1].to - sc.from) < 0.01, nextAdj = i < SCENES.length - 1 && Math.abs(SCENES[i + 1].from - sc.to) < 0.01;
    if (sc.from > 0 && !prevAdj && t > sc.from - DIVE && t <= sc.from) f = Math.max(f, Math.pow(4, Easing.in(Easing.cubic)((t - (sc.from - DIVE)) / DIVE)));
    if (!nextAdj && sc.to <= AZ_END && t >= sc.to && t < sc.to + 0.7) f = Math.max(f, Math.pow(4, 1 - Easing.out(Easing.cubic)((t - sc.to) / 0.7)));
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
  const exitK = nextAdj || sc.to > AZ_END ? 0 : interpolate(t, [sc.to - 0.25, sc.to], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
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

// ---------- San Francisco Bay map ----------
const proj = geoMercator().center([-122.42, 37.82]).scale(60000).translate([0, 0]).clipExtent([[-6000, -6000], [6000, 6000]]);
const path = geoPath(proj);
const P = (ll: LL) => proj(ll) as [number, number];
// Alcatraz Island outline (hand-traced, approximate) and key points
const ALC: LL[] = [[-122.4262, 37.8282], [-122.4246, 37.8290], [-122.4222, 37.8283], [-122.4205, 37.8268], [-122.4200, 37.8255], [-122.4214, 37.8250], [-122.4236, 37.8258], [-122.4256, 37.8270]];
const CELL: LL = [-122.4232, 37.8268], ROOF: LL = [-122.4226, 37.8273], SHORE: LL = [-122.4214, 37.8279];
const ESC: LL[] = [CELL, ROOF, [-122.4220, 37.8277], SHORE];
const GG: LL = [-122.478, 37.8105];
const CUR: LL[][] = [[[-122.425, 37.826], [-122.445, 37.822], [-122.468, 37.815], [-122.49, 37.811]], [[-122.42, 37.83], [-122.44, 37.83], [-122.462, 37.822], [-122.488, 37.814]], [[-122.43, 37.82], [-122.45, 37.815], [-122.47, 37.809], [-122.492, 37.806]]];
const along = (pts: LL[], k: number): LL => {
  const segs = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const tot = segs.reduce((a, b) => a + b, 0); let d = k * tot;
  for (let i = 0; i < segs.length; i++) { if (d <= segs[i]) { const f = d / segs[i]; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f]; } d -= segs[i]; }
  return pts[pts.length - 1];
};
const partial = (pts: LL[], k: number) => [...pts.filter((_, i) => i / (pts.length - 1) <= k + 1e-6), along(pts, k)];

const cl = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const ease = Easing.inOut(Easing.cubic);
type Cam = { c: [number, number]; z: number };
const lerpCam = (a: Cam, b: Cam, k: number): Cam => ({ c: [a.c[0] + (b.c[0] - a.c[0]) * k, a.c[1] + (b.c[1] - a.c[1]) * k], z: a.z * Math.pow(b.z / a.z, k) });
const ISLAND: Cam = { c: P([-122.4228, 37.8268]), z: 70 };
const ISLAND_W: Cam = { c: P([-122.4228, 37.8268]), z: 14 };
const BAY: Cam = { c: P([-122.425, 37.818]), z: 3.6 };
function baseCamera(t: number): Cam {
  const seg = (t0: number, t1: number, a: Cam, b: Cam) => lerpCam(a, b, ease(interpolate(t, [t0, t1], [0, 1], cl)));
  if (t < 8.8) return seg(7.5, 8.75, ISLAND_W, BAY);
  if (t < 22.15) return t < 20.0 ? seg(18.4, 19.9, BAY, ISLAND_W) : seg(20.0, 20.9, ISLAND_W, ISLAND);
  if (t < 41.0) return seg(39.45, 40.9, BAY, { c: BAY.c, z: 4.0 });
  return BAY;
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




export const Alcatraz: React.FC<{ sound?: string; words?: Word[] }> = ({ sound, words = [] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cam = camera(t);
  const z = cam.z;
  const toS = (ll: LL): [number, number] => { const p = P(ll); return [540 + (p[0] - cam.c[0]) * z, 960 + (p[1] - cam.c[1]) * z]; };
  const sw = (px: number) => px / z;
  const caps = useMemo(() => chunks(words), [words]);
  const cap = caps.find((c) => t >= c.s && t < c.e);
  const S = useMemo(() => { const ring = (r: number[][]) => "M " + r.map((p) => P(p as LL).join(" ")).join(" L ") + " Z"; const rs = sfbay as number[][][]; return { land: rs.filter((r) => r.length !== 7).map(ring).join(" "), alc: ring(rs.find((r) => r.length === 7) ?? ALC) }; }, []);
  const showMap = (a: number, b: number) => t >= a && t < b;
  const line = (pts: LL[]) => "M " + pts.map((p) => toS(p).join(" ")).join(" L ");
  const escK = interpolate(t, [20.9, 22.1], [0, 1], cl);
  const alc = toS([-122.4228, 37.8268]);
  const cell = toS(CELL), roof = toS(ROOF), shore = toS(SHORE), gg = toS(GG);
  return (
    <AbsoluteFill style={{ backgroundColor: "#4f8e8f", overflow: "hidden" }}>
      <style>{`@font-face{font-family:"AntonT";src:url(${staticFile("anton.ttf")})}`}</style>
      <AbsoluteFill>
        <svg viewBox="0 0 1080 1920" width="100%" height="100%">
          <defs><radialGradient id="seaG" cx="50%" cy="45%" r="75%"><stop offset="0" stopColor="#6aa6a3" /><stop offset="1" stopColor="#3f7c80" /></radialGradient></defs>
          <rect width={1080} height={1920} fill="url(#seaG)" />
          <g transform={`translate(540 960) scale(${z}) translate(${-cam.c[0]} ${-cam.c[1]})`}>
            <path d={S.land} fill="#ecdcb0" stroke="#3a2418" strokeWidth={sw(3.5)} />
            <path d={S.alc} fill="#d8a66a" stroke="#3a2418" strokeWidth={sw(3)} />
          </g>
        </svg>
      </AbsoluteFill>

      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        {showMap(7.5, 8.8) && <g>
          <Pin x={alc[0]} y={alc[1]} k={pop(t, 7.6)} />
          <Tag x={alc[0]} y={alc[1] + 80} t={t} at={7.7} until={8.8} text="ALCATRAZ" size={44} bg="#1b140d" fg="#f2e3b5" />
        </g>}
        {showMap(18.4, 22.15) && <g>
          {t < 20.2 ? <g><Pin x={alc[0]} y={alc[1]} k={pop(t, 18.6)} /><Tag x={alc[0]} y={alc[1] + 80} t={t} at={18.7} until={20.2} text="ALCATRAZ" size={44} bg="#1b140d" fg="#f2e3b5" /></g> : null}
          {escK > 0 && <g>
            <path d={line(partial(ESC, escK))} fill="none" stroke="#000" strokeOpacity={0.35} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
            <path d={line(partial(ESC, escK))} fill="none" stroke="#b5432a" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="26 14" />
            {[[cell, 0], [roof, 1 / 3], [shore, 1]].map(([p, f], i) => escK >= (f as number) ? <circle key={i} cx={(p as number[])[0]} cy={(p as number[])[1]} r={12 * pop(t, 20.9 + 1.2 * (f as number))} fill="#fff" stroke="#000" strokeWidth={4} /> : null)}
          </g>}
          <Tag x={cell[0] - 90} y={cell[1] + 90} t={t} at={20.6} until={22.15} text="CELLHOUSE" size={38} bg="#1b140d" fg="#f2e3b5" />
          <Tag x={roof[0] - 40} y={roof[1] - 70} t={t} at={21.2} until={22.15} text="ROOF" size={38} bg="#1b140d" fg="#f2e3b5" />
          {escK >= 1 ? <Pin x={shore[0]} y={shore[1]} k={pop(t, 22.05)} /> : null}
        </g>}
        {showMap(39.45, 41.0) && <g>
          {CUR.map((c, i) => { const k = interpolate(t, [39.6 + i * 0.12, 40.6 + i * 0.12], [0, 1], cl); if (k <= 0) return null; const pts = partial(c, k); const hd = toS(pts[pts.length - 1]), pr = toS(pts[Math.max(0, pts.length - 2)]); const ang = Math.atan2(hd[1] - pr[1], hd[0] - pr[0]) * 180 / Math.PI;
            return <g key={i}><path d={line(pts)} fill="none" stroke="#e8f6f6" strokeWidth={9} strokeLinecap="round" strokeDasharray="22 16" /><path d="M -22 -16 L 6 0 L -22 16" transform={`translate(${hd[0]} ${hd[1]}) rotate(${ang})`} fill="none" stroke="#e8f6f6" strokeWidth={9} strokeLinecap="round" /></g>; })}
          <Pin x={alc[0]} y={alc[1]} k={1} />
          <Tag x={gg[0] + 30} y={gg[1] + 110} t={t} at={39.9} until={41.0} text="GOLDEN GATE" size={36} bg="#1b140d" fg="#f2e3b5" />
          <Tag x={540} y={1250} t={t} at={40.1} until={41.0} text="COLD WATER · STRONG CURRENTS" size={34} bg="#1b140d" fg="#f2e3b5" />
        </g>}
      </svg>

      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%)" }} />
      <Img src={staticFile("pony/grain.png")} style={{ position: "absolute", inset: 0, width: 1080, height: 1920, opacity: 0.22, mixBlendMode: "multiply" }} />

      <SceneLayer t={t} frame={frame} />
      <Big t={t} at={-0.5} until={4.6} text="THESE HEADS" color="#fff" size={140} y={170} serif={false} />
      <Big t={t} at={-0.5} until={4.6} text="WERE FAKE" color="#ffd23f" size={190} y={320} serif={false} />
      <Big t={t} at={7.6} until={8.75} text="WHERE DID" color="#fff" size={130} y={200} serif={false} />
      <Big t={t} at={7.6} until={8.75} text="THEY GO?" color="#ffd23f" size={170} y={340} serif={false} />
      <Big t={t} at={13.4} until={14.95} text="WITH SPOONS" color="#ffd23f" size={150} y={240} serif={false} />
      <Big t={t} at={16.4} until={18.35} text="50+ RAINCOATS" color="#ffd23f" size={130} y={230} serif={false} />
      <Big t={t} at={18.6} until={20.6} text="JUNE 11, 1962" size={130} y={260} />
      <Big t={t} at={30.1} until={31.9} text="LEFT BEHIND" color="#ffd23f" size={150} y={220} serif={false} />
      <Big t={t} at={35.9} until={37.25} text="NEVER THE MEN" color="#ffd23f" size={140} y={240} serif={false} />
      <Big t={t} at={39.55} until={40.95} text="FBI: PROBABLY DROWNED" color="#fff" size={96} y={240} serif={false} />
      <Big t={t} at={41.7} until={43.9} text="CASE STILL OPEN" color="#ffd23f" size={130} y={200} serif={false} />
      <Big t={t} at={45.3} until={AZ_END + 0.5} text="THESE HEADS" color="#fff" size={140} y={170} serif={false} />
      <Big t={t} at={45.3} until={AZ_END + 0.5} text="WERE FAKE" color="#ffd23f" size={190} y={320} serif={false} />

      {cap && (
        <div style={{ position: "absolute", top: 1420, left: 60, right: 60, textAlign: "center", fontFamily: fonts.sans, fontWeight: 900, fontSize: 66, lineHeight: 1.1,
          color: "#fff", WebkitTextStroke: "9px #000", paintOrder: "stroke fill", textShadow: "0 6px 0 #000", transform: `scale(${interpolate(t, [cap.s, cap.s + 0.08], [0.9, 1], cl)})` }}>{cap.text}</div>
      )}
      {sound && <Audio src={staticFile(sound)} />}
    </AbsoluteFill>
  );
};
