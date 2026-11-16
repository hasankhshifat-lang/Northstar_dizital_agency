import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { geoMercator, geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";
import worldTopo from "world-atlas/countries-50m.json";
import statesTopo from "us-atlas/states-10m.json";
import { fonts } from "../theme";
import { SceneFind, SceneSky, SceneHall, SceneGlue, SceneLaunch, SceneNewsroom, SceneTokyo, SceneWalk, SceneCar, SceneTug, SceneBlast, SceneGiveUp } from "../sets/balloonScenes";

/**
 * Japan's paper balloon bombs (Fu-Go) and the Bly, Oregon picnic, 5 May 1945 — voiced map Short, Pony Express style, 45–60 s.
 * Cues are timed to shorts/balloon-bombs-2026-11-17/words.json. Storyboard: social/scripts/balloon-bombs-2026-11-17.md.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
type LL = [number, number];
type Word = { w: string; s: number; e: number };

// ---------- ground scenes ----------
type SceneDef = { from: number; to: number; el: (p: { lt: number; dur: number; frame: number }) => React.ReactNode };
export const FG_END = 56.5;
const SCENES: SceneDef[] = [
  { from: 0, to: 4.6, el: (p) => <SceneFind {...p} u0={0} /> },
  { from: 4.6, to: 7.0, el: (p) => <SceneSky {...p} /> },
  { from: 9.6, to: 13.2, el: (p) => <SceneHall {...p} /> },
  { from: 13.2, to: 15.4, el: (p) => <SceneGlue {...p} /> },
  { from: 15.4, to: 17.3, el: (p) => <SceneLaunch {...p} /> },
  { from: 25.4, to: 29.4, el: (p) => <SceneNewsroom {...p} /> },
  { from: 29.4, to: 32.0, el: (p) => <SceneTokyo {...p} /> },
  { from: 36.4, to: 39.8, el: (p) => <SceneWalk {...p} /> },
  { from: 39.8, to: 42.2, el: (p) => <SceneCar {...p} /> },
  { from: 42.2, to: 44.0, el: (p) => <SceneTug {...p} /> },
  { from: 44.0, to: 45.2, el: (p) => <SceneBlast {...p} /> },
  { from: 50.0, to: 53.8, el: (p) => <SceneGiveUp {...p} /> },
  { from: 53.8, to: FG_END + 1, el: (p) => <SceneFind {...p} u0={-(FG_END - 53.8)} /> },
];
export const FG_SCENE_TIMES = SCENES.map((s) => [s.from, s.to]);
const DIVE = 0.45;
function diveFactor(t: number) {
  let f = 1;
  for (let i = 0; i < SCENES.length; i++) {
    const sc = SCENES[i], prevAdj = i > 0 && Math.abs(SCENES[i - 1].to - sc.from) < 0.01, nextAdj = i < SCENES.length - 1 && Math.abs(SCENES[i + 1].from - sc.to) < 0.01;
    if (sc.from > 0 && !prevAdj && t > sc.from - DIVE && t <= sc.from) f = Math.max(f, Math.pow(4, Easing.in(Easing.cubic)((t - (sc.from - DIVE)) / DIVE)));
    if (!nextAdj && sc.to <= FG_END && t >= sc.to && t < sc.to + 0.7) f = Math.max(f, Math.pow(4, 1 - Easing.out(Easing.cubic)((t - sc.to) / 0.7)));
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
  const exitK = nextAdj || sc.to > FG_END ? 0 : interpolate(t, [sc.to - 0.25, sc.to], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
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

// ---------- Pacific / North America map ----------
const proj = geoMercator().rotate([170, 0]).scale(600).translate([0, 0]).clipExtent([[-8000, -8000], [8000, 8000]]);
const path = geoPath(proj);
const P = (ll: LL) => proj(ll) as [number, number];
const land = feature(worldTopo as any, (worldTopo as any).objects.land) as any;
const states = feature(statesTopo as any, (statesTopo as any).objects.states) as any;
const stateMesh = mesh(statesTopo as any, (statesTopo as any).objects.states, (a: any, b: any) => a !== b) as any;
const JAPAN: LL = [140.4, 35.4], BLY: LL = [-121.04, 42.4], GEAR: LL = [-120.88, 42.5];
// launch sites on Honshu's Pacific coast → jet stream over the North Pacific → Oregon (illustrative track)
const ROUTE: LL[] = [JAPAN, [150, 40.5], [165, 44.5], [-178, 46.5], [-160, 47], [-142, 45.5], [-128, 43.6], BLY];
// reported landings, Alaska to Mexico (illustrative points from the find lists)
const FINDS: LL[] = [[-151, 60.6], [-135.5, 58.5], [-123.4, 50.2], [-122.3, 47.3], [-117.1, 46.5], [-123.6, 44.6], [-121.8, 40.4], [-111.5, 46.8], [-107.5, 43.2], [-99.6, 41.6], [-93.6, 42.0], [-83.4, 42.5], [-113.1, 31.2]];
const along = (pts: LL[], k: number): LL => {
  const segs = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const tot = segs.reduce((a, b) => a + b, 0); let d = k * tot;
  for (let i = 0; i < segs.length; i++) { if (d <= segs[i]) { const f = d / segs[i]; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f]; } d -= segs[i]; }
  return pts[pts.length - 1];
};
// unwrap longitudes so the route crosses the date line smoothly
const unwrap = (pts: LL[]): LL[] => pts.map(([lo, la]) => [lo > 0 ? lo - 360 : lo, la]);
const partial = (pts: LL[], k: number) => [...pts.filter((_, i) => i / (pts.length - 1) <= k + 1e-6), along(pts, k)];

const cl = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const ease = Easing.inOut(Easing.cubic);
type Cam = { c: [number, number]; z: number };
const lerpCam = (a: Cam, b: Cam, k: number): Cam => ({ c: [a.c[0] + (b.c[0] - a.c[0]) * k, a.c[1] + (b.c[1] - a.c[1]) * k], z: a.z * Math.pow(b.z / a.z, k) });
const OREG: Cam = { c: P([-120.6, 43.9]), z: 8 };
const PAC: Cam = { c: P([-170.6, 43]), z: 0.8 };
const NA: Cam = { c: P([-117, 46]), z: 1.35 };
const BLYZ: Cam = { c: P([-121.0, 42.45]), z: 18 };
const USA: Cam = { c: P([-98, 39]), z: 1.6 };
function baseCamera(t: number): Cam {
  const seg = (t0: number, t1: number, a: Cam, b: Cam) => lerpCam(a, b, ease(interpolate(t, [t0, t1], [0, 1], cl)));
  if (t < 9.6) return seg(7.1, 9.0, OREG, PAC);
  if (t < 25.4) return seg(21.5, 22.5, PAC, NA);
  if (t < 36.4) return t < 34.4 ? seg(32.0, 33.6, NA, OREG) : seg(34.4, 35.8, OREG, BLYZ);
  if (t < 50.0) return seg(45.2, 46.7, BLYZ, USA);
  return USA;
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




export const BalloonBombs: React.FC<{ sound?: string; words?: Word[] }> = ({ sound, words = [] }) => {
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
    land: path(land) ?? "", mesh: path(stateMesh) ?? "",
    oregon: path(states.features.find((f: any) => f.properties.name === "Oregon")) ?? "",
  }), []);
  const showMap = (a: number, b: number) => t >= a && t < b;
  const line = (pts: LL[]) => "M " + pts.map((p) => toS(p).join(" ")).join(" L ");
  const R = unwrap(ROUTE);
  const routeK = interpolate(t, [17.5, 20.4], [0, 1], cl);
  const bly = toS(BLY), jp = toS(JAPAN), gear = toS(GEAR);
  const orFill = (showMap(7.0, 9.6) ? 1 - interpolate(t, [8.2, 8.9], [0, 1], cl) : 0) + (showMap(32.0, 50.0) ? interpolate(t, [33.0, 33.8], [0, 1], cl) : 0);
  const balloonAt = toS(along(R, routeK));
  return (
    <AbsoluteFill style={{ backgroundColor: "#4f8e8f", overflow: "hidden" }}>
      <style>{`@font-face{font-family:"AntonT";src:url(${staticFile("anton.ttf")})}`}</style>
      <AbsoluteFill>
        <svg viewBox="0 0 1080 1920" width="100%" height="100%">
          <defs><radialGradient id="seaG" cx="50%" cy="45%" r="75%"><stop offset="0" stopColor="#6aa6a3" /><stop offset="1" stopColor="#3f7c80" /></radialGradient></defs>
          <rect width={1080} height={1920} fill="url(#seaG)" />
          <g transform={`translate(540 960) scale(${z}) translate(${-cam.c[0]} ${-cam.c[1]})`}>
            <path d={S.land} fill="#ecdcb0" stroke="#3a2418" strokeWidth={sw(3)} />
            <path d={S.oregon} fill="#d8a66a" opacity={Math.min(0.9, orFill)} />
            <path d={S.mesh} fill="none" stroke="#3a2418" strokeWidth={sw(1.6)} opacity={0.55} />
          </g>
        </svg>
      </AbsoluteFill>

      <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        {showMap(7.0, 9.6) && <g>
          <Pin x={bly[0]} y={bly[1]} k={pop(t, 7.1)} />
          <Tag x={bly[0]} y={bly[1] + 70} t={t} at={7.2} until={8.6} text="OREGON" size={44} bg="#1b140d" fg="#f2e3b5" />
          <Pin x={jp[0]} y={jp[1]} k={pop(t, 8.5)} />
          <Tag x={jp[0] + 20} y={jp[1] + 70} t={t} at={8.6} until={9.6} text="JAPAN" size={44} bg="#1b140d" fg="#f2e3b5" />
        </g>}
        {showMap(17.3, 21.6) && <g>
          {[0, 1, 2].map((i) => { const off = ((t * 0.35 + i / 3) % 1); const a = toS([-220 + off * 90, 49 - i * 1.5]), b = toS([-205 + off * 90, 49.5 - i * 1.5]);
            return <path key={i} d={`M ${a[0]} ${a[1]} L ${b[0]} ${b[1]} m -18 -12 l 18 12 l -18 12`} stroke="#e8f6f6" strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.75} />; })}
          {routeK > 0 && <g>
            <path d={line(partial(R, routeK))} fill="none" stroke="#000" strokeOpacity={0.35} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
            <path d={line(partial(R, routeK))} fill="none" stroke="#b5432a" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="24 14" />
            {R.map((p, i) => i / (R.length - 1) <= routeK && i > 0 && i < R.length - 1 ? <circle key={i} cx={toS(p)[0]} cy={toS(p)[1]} r={9} fill="#fff" stroke="#000" strokeWidth={3} /> : null)}
          </g>}
          <Pin x={jp[0]} y={jp[1]} k={1} />
          <Tag x={jp[0] + 20} y={jp[1] + 70} t={t} at={17.3} until={21.6} text="JAPAN" size={40} bg="#1b140d" fg="#f2e3b5" />
          <Tag x={toS([-170, 52])[0]} y={toS([-170, 52])[1] - 40} t={t} at={17.8} until={21.6} text="JET STREAM" size={36} bg="#1b140d" fg="#f2e3b5" />
          {routeK > 0 && routeK < 1 && <g transform={`translate(${balloonAt[0]} ${balloonAt[1] - 46})`}><line x1={0} y1={22} x2={0} y2={44} stroke="#3a2418" strokeWidth={3} /><circle r={26} fill="#dcd6c4" stroke="#000" strokeWidth={4} /><rect x={-7} y={42} width={14} height={14} fill="#4a5440" stroke="#000" strokeWidth={2} /></g>}
          {routeK >= 1 && <Pin x={bly[0]} y={bly[1]} k={pop(t, 20.4)} />}
        </g>}
        {showMap(21.6, 25.4) && <g>
          {FINDS.map((f, i) => { const p = toS(f); const at = 22.4 + i * 0.18; return t >= at ? <Pin key={i} x={p[0]} y={p[1]} k={pop(t, at) * 0.8} /> : null; })}
          <Tag x={toS([-151, 60.6])[0]} y={toS([-151, 60.6])[1] + 60} t={t} at={23.9} until={25.4} text="ALASKA" size={38} bg="#1b140d" fg="#f2e3b5" />
          <Tag x={toS([-113.1, 31.2])[0]} y={toS([-113.1, 31.2])[1] + 60} t={t} at={24.6} until={25.4} text="MEXICO" size={38} bg="#1b140d" fg="#f2e3b5" />
        </g>}
        {showMap(32.0, 36.4) && <g>
          <Pin x={bly[0]} y={bly[1]} k={pop(t, 34.6)} />
          <Tag x={bly[0] - 20} y={bly[1] + 70} t={t} at={34.8} until={36.4} text="BLY" size={44} bg="#1b140d" fg="#f2e3b5" />
          <Tag x={gear[0] + 40} y={gear[1] - 110} t={t} at={35.4} until={36.4} text="GEARHART MOUNTAIN" size={34} bg="#1b140d" fg="#f2e3b5" />
        </g>}
        {showMap(45.2, 50.0) && <g>
          <Pin x={bly[0]} y={bly[1]} k={1} />
          <Tag x={bly[0]} y={bly[1] + 60} t={t} at={46.4} until={50.0} text="BLY, OREGON" size={34} bg="#1b140d" fg="#f2e3b5" />
        </g>}
      </svg>

      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%)" }} />
      <Img src={staticFile("pony/grain.png")} style={{ position: "absolute", inset: 0, width: 1080, height: 1920, opacity: 0.22, mixBlendMode: "multiply" }} />

      <SceneLayer t={t} frame={frame} />
      <Big t={t} at={-0.5} until={4.5} text="A BOMB" color="#fff" size={150} y={150} serif={false} />
      <Big t={t} at={-0.5} until={4.5} text="FROM JAPAN" color="#ffd23f" size={170} y={310} serif={false} />
      <Big t={t} at={7.7} until={9.5} text="HOW DID IT" color="#fff" size={130} y={200} serif={false} />
      <Big t={t} at={7.7} until={9.5} text="GET THERE?" color="#ffd23f" size={170} y={340} serif={false} />
      <Big t={t} at={10.5} until={13.1} text="9,000+ BALLOONS" color="#ffd23f" size={120} y={160} serif={false} />
      <Big t={t} at={20.2} until={21.5} text="ABOUT 3 DAYS" color="#ffd23f" size={140} y={260} serif={false} />
      <Big t={t} at={22.1} until={25.3} text="HUNDREDS LANDED" color="#ffd23f" size={118} y={200} serif={false} />
      <Big t={t} at={26.1} until={29.3} text="KEPT SECRET" color="#ffd23f" size={150} y={170} serif={false} />
      <Big t={t} at={32.5} until={34.6} text="MAY 5, 1945" size={130} y={260} />
      <Big t={t} at={45.6} until={49.9} text="ONLY MAINLAND DEATHS" color="#ffd23f" size={100} y={190} serif={false} />
      <Big t={t} at={46.4} until={49.9} text="BY ENEMY ATTACK IN WWII" color="#fff" size={74} y={310} serif={false} />
      <Big t={t} at={50.6} until={53.7} text="JAPAN HAD GIVEN UP" color="#ffd23f" size={110} y={170} serif={false} />
      <Big t={t} at={55.0} until={FG_END + 0.5} text="A BOMB" color="#fff" size={150} y={150} serif={false} />
      <Big t={t} at={55.0} until={FG_END + 0.5} text="FROM JAPAN" color="#ffd23f" size={170} y={310} serif={false} />

      {cap && (
        <div style={{ position: "absolute", top: 1420, left: 60, right: 60, textAlign: "center", fontFamily: fonts.sans, fontWeight: 900, fontSize: 66, lineHeight: 1.1,
          color: "#fff", WebkitTextStroke: "9px #000", paintOrder: "stroke fill", textShadow: "0 6px 0 #000", transform: `scale(${interpolate(t, [cap.s, cap.s + 0.08], [0.9, 1], cl)})` }}>{cap.text}</div>
      )}
      {sound && <Audio src={staticFile(sound)} />}
    </AbsoluteFill>
  );
};
