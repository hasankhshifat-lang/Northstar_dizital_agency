import React from "react";
import { interpolate, Easing } from "remotion";
import { Sky } from "./ponyScenes";
import { Label } from "./chickenScenes";
import { handAt } from "./madridScenes";
import { Figure } from "./pirateScenes";
import { Liner, Sea, OFFICER, SAILOR } from "./violetScenes";
import { KitColors } from "../kit/Kit";

/**
 * Ground scenes for "The key that left the Titanic" (David Blair's crow's-nest key, lookouts without binoculars, April 1912).
 * lt = seconds since the scene started. Kit side pose: feet at (0,0), shoulder pivot (0,-284), straight-arm hand = handAt().
 * Walk speed from the Kit stride: ≈ 240·s px per second. Scenes are drawn at GY and shifted −130 px by the story.
 * Storyboard: social/scripts/titanic-key-2026-11-25.md.
 */
const INK = "#2b1d14";
const GY = 1240;
const WALK = 240;
const cl = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const ease = Easing.inOut(Easing.cubic);
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
type SP = { lt: number; dur: number; frame: number };
type V2 = [number, number];

// ---------- people (1912) ----------
const WILDE: Partial<KitColors> = { ...OFFICER, hair: "#1e1410" } as Partial<KitColors>;
const FLEET: Partial<KitColors> = { ...SAILOR, hair: "#5a3a20" } as Partial<KitColors>;
const LEE: Partial<KitColors> = { ...SAILOR, coat: "#34405a", coatShade: "#262f44", coatLight: "#404e6c", patch: "#404e6c", hair: "#2a1e14" } as Partial<KitColors>;
const SENATOR: Partial<KitColors> = { coat: "#2c2e36", coatShade: "#1e2026", coatLight: "#3a3c44", patch: "#3a3c44", scarf: "#efefe8", scarfShade: "#cfcfc8", trousers: "#2c2e36", trousersShade: "#1e2026", hair: "#c8c8c4", capStyle: "hair", button: "#c9a54a" } as Partial<KitColors>;
const AUCTIONEER: Partial<KitColors> = { coat: "#3a2a3a", coatShade: "#2a1e2a", coatLight: "#4a3a4a", patch: "#4a3a4a", scarf: "#efefe8", scarfShade: "#cfcfc8", trousers: "#2a2a30", trousersShade: "#1e1e22", hair: "#6a6a66", capStyle: "hair" } as Partial<KitColors>;
const BIDDERS: Partial<KitColors>[] = [
  { coat: "#4a5a6e", coatShade: "#3a485a", coatLight: "#5a6c82", patch: "#5a6c82", hair: "#2a1a12", capStyle: "hair" } as Partial<KitColors>,
  { coat: "#6a4a3a", coatShade: "#563a2c", coatLight: "#7c5a48", patch: "#7c5a48", hair: "#c8b890", capStyle: "hair" } as Partial<KitColors>,
  { coat: "#2a3a2e", coatShade: "#1e2a22", coatLight: "#3a4a3e", patch: "#3a4a3e", hair: "#5a3a20", capStyle: "hair" } as Partial<KitColors>,
];
const Hand: React.FC<{ p: V2; r?: number; skin?: string }> = ({ p, r = 11, skin = "#eebf98" }) => <circle cx={p[0]} cy={p[1]} r={r} fill={skin} stroke={INK} strokeWidth={3} />;

// ---------- props ----------
/** brass key, bow (ring) at the origin, bit toward +x; length ≈ 300·s */
export const Key: React.FC<{ x: number; y: number; s?: number; rot?: number; glint?: number }> = ({ x, y, s = 1, rot = 0, glint = -1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <circle r={56} fill="none" stroke="#7a5a1a" strokeWidth={30} />
    <circle r={56} fill="none" stroke="#d9a93a" strokeWidth={20} />
    <rect x={50} y={-11} width={220} height={22} rx={6} fill="#d9a93a" stroke="#7a5a1a" strokeWidth={5} />
    <path d="M 220 10 L 220 58 L 240 58 L 240 38 L 256 38 L 256 58 L 272 58 L 272 10 Z" fill="#d9a93a" stroke="#7a5a1a" strokeWidth={5} />
    <rect x={62} y={-6} width={196} height={5} fill="#f6dc8a" opacity={0.8} />
    {glint >= 0 && glint <= 1 && <g opacity={Math.sin(glint * Math.PI)}><path d={`M ${-40 + glint * 300} -70 l 10 60 l -10 60 l -10 -60 Z`} fill="#fffbe6" /><path d={`M ${-100 + glint * 300} 0 l 60 -8 l 60 8 l -60 8 Z`} fill="#fffbe6" /></g>}
  </g>
);
/** an officer's gloved hand + sleeve with gold cuff rings, entering from the lower left; grip point at (x,y) */
const BigHand: React.FC<{ x: number; y: number; rot?: number }> = ({ x, y, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <path d="M -520 300 L -150 40 L -70 150 L -420 420 Z" fill="#1e2433" stroke={INK} strokeWidth={6} />
    <path d="M -205 78 L -128 186" stroke="#d6b04a" strokeWidth={14} /><path d="M -240 104 L -163 212" stroke="#d6b04a" strokeWidth={8} />
    <path d="M -150 40 Q -60 -30 10 -10 Q 40 10 20 40 Q 0 60 -20 52 Q 10 90 -20 110 Q -60 140 -70 150 Z" fill="#f2f0ea" stroke={INK} strokeWidth={6} />
    <path d="M -40 -6 Q -10 -40 30 -30 Q 50 -14 24 0" fill="#f2f0ea" stroke={INK} strokeWidth={6} />
  </g>
);
/** a crow's nest drum on a mast; (x,y) = rim centre, width 260·s */
const Nest: React.FC<{ x: number; y: number; s?: number; children?: React.ReactNode; front?: boolean }> = ({ x, y, s = 1, children }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {children}
    <path d="M -130 0 L 130 0 L 118 150 L -118 150 Z" fill="#c9b48a" stroke={INK} strokeWidth={6} />
    <rect x={-136} y={-12} width={272} height={20} rx={6} fill="#8a6a44" stroke={INK} strokeWidth={5} />
    {[-80, -26, 28, 82].map((bx) => <line key={bx} x1={bx} y1={10} x2={bx * 0.92} y2={148} stroke="#a8946a" strokeWidth={5} />)}
  </g>
);
const Mast: React.FC<{ x: number; y0: number; y1: number; w?: number }> = ({ x, y0, y1, w = 34 }) => <rect x={x - w / 2} y={y0} width={w} height={y1 - y0} fill="#c9a26a" stroke={INK} strokeWidth={5} />;
const Bell: React.FC<{ x: number; y: number; swing: number; s?: number }> = ({ x, y, swing, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-60} y={-24} width={120} height={18} fill="#6a4a2a" stroke={INK} strokeWidth={4} />
    <g transform={`rotate(${swing})`}>
      <path d="M -40 70 Q -44 10 -18 -4 L 18 -4 Q 44 10 40 70 Q 0 80 -40 70 Z" fill="#d9a93a" stroke={INK} strokeWidth={5} />
      <circle cy={78} r={10} fill="#7a5a1a" stroke={INK} strokeWidth={3} />
    </g>
  </g>
);
/** iceberg, origin = waterline centre, height ≈ 360·s */
const Berg: React.FC<{ x: number; y: number; s?: number; night?: boolean }> = ({ x, y, s = 1, night = true }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -260 0 L -200 -150 L -120 -190 L -60 -360 L 20 -250 L 90 -300 L 170 -120 L 250 0 Z" fill={night ? "#b9c8d8" : "#eef6fb"} stroke={INK} strokeWidth={6} />
    <path d="M -60 -360 L -30 -150 L 20 -250 M 90 -300 L 60 -110" stroke={night ? "#8ea2b8" : "#c8dcea"} strokeWidth={8} fill="none" />
    <path d="M -200 -150 L -150 -40 M 170 -120 L 120 -20" stroke={night ? "#8ea2b8" : "#c8dcea"} strokeWidth={6} fill="none" />
  </g>
);
/** wall telephone handset */
const Handset: React.FC<{ p: V2; rot?: number }> = ({ p, rot = 0 }) => (
  <g transform={`translate(${p[0]} ${p[1]}) rotate(${rot})`}><rect x={-14} y={-60} width={28} height={120} rx={10} fill="#1a1a1a" stroke={INK} strokeWidth={4} /><ellipse cy={-62} rx={24} ry={16} fill="#1a1a1a" stroke={INK} strokeWidth={4} /><ellipse cy={62} rx={24} ry={16} fill="#1a1a1a" stroke={INK} strokeWidth={4} /></g>
);
const Stars: React.FC<{ n?: number; h?: number }> = ({ n = 40, h = 900 }) => <g>{Array.from({ length: n }, (_, i) => <circle key={i} cx={rnd(i) * 1100} cy={rnd(i + 50) * h} r={1.5 + rnd(i + 9) * 2.5} fill="#fff" opacity={0.5 + rnd(i + 3) * 0.5} />)}</g>;
const Quay: React.FC<{ y?: number }> = ({ y = GY }) => (
  <g>
    <rect x={-60} y={y - 10} width={1200} height={1000} fill="#9a9488" />
    <rect x={-60} y={y - 10} width={1200} height={18} fill="#7a7468" />
    {Array.from({ length: 10 }, (_, i) => <line key={i} x1={-60 + i * 130} y1={y + 8} x2={-60 + i * 130 + 40} y2={y + 300} stroke="#86807a" strokeWidth={4} />)}
  </g>
);

// ---------- 1 + LOOP: an officer's hand holds up the key in front of the Titanic at Southampton; the camera rises to the empty-handed lookouts ----------
export const NEST_POS: V2 = [200, 380];
export const SceneKeyHook: React.FC<SP & { u0?: number }> = ({ lt, frame, u0 = 0 }) => {
  const u = lt + u0;
  // 0–4.8 s: key in the foreground; 4.9–6.2 s: motivated tilt/zoom up the foremast to the crow's nest ("the men in the crow's nest")
  const k = ease(interpolate(u, [4.85, 6.2], [0, 1], cl));
  const z = 1.04 + Math.max(0, Math.min(4.8, u + 4.6)) * 0.012;
  const zz = z * (1 + k * 1.25);
  const cx = 540 + (NEST_POS[0] + 40 - 540) * k, cy = 1000 + (NEST_POS[1] + 40 - 1000) * k;
  const keyRot = -28 + Math.sin(u * 1.3) * 4;
  const shade = u > 6.0;
  const lA = shade ? -168 : -20;
  return (
    <g transform={`translate(540 ${1000 + 0}) scale(${zz}) translate(${-cx} ${-cy})`}>
      <Sky top="#9cc0da" bottom="#eadfca" clouds={3} drift={u + 6} />
      <g transform="translate(0 0)">
        <Liner x={866} y={1140} s={1.55} />
      </g>
      {/* foremast with the crow's nest (Olympic-class nest sits part-way up the foremast) */}
      <Mast x={NEST_POS[0]} y0={60} y1={955} w={30} />
      <Nest x={NEST_POS[0]} y={NEST_POS[1]} s={0.5}>
        <Figure x={-60} y={110} s={0.62} facing={1} A1={lA} A2={shade ? -150 : -10} colors={FLEET} frame={frame} expression={shade ? "neutral" : "neutral"} />
        <Figure x={66} y={110} s={0.6} facing={-1} A1={shade ? -40 : -12} A2={-8} colors={LEE} frame={frame + 9} expression="neutral" />
      </Nest>
      <Quay y={1250} />
      <rect x={120} y={1180} width={40} height={70} rx={10} fill="#3a3a3a" stroke={INK} strokeWidth={4} />
      {/* foreground hand + key (fades as the camera rises) */}
      <g opacity={1 - k}>
        <BigHand x={500} y={1120} rot={-8} />
        <Key x={520} y={1060} s={1.0} rot={keyRot} glint={((u + 4.6) % 2.4) / 1.2 - 0.2} />
      </g>
    </g>
  );
};

// ---------- 3: Southampton quay: Blair walks down the gangway with his bag, Wilde comes aboard; Blair finds the key in his pocket ----------
export const SceneGangway: React.FC<SP> = ({ lt, frame }) => {
  const top: V2 = [830, 870], foot: V2 = [430, GY];
  const s = 0.82, v = WALK * s;
  const len = Math.hypot(top[0] - foot[0], top[1] - foot[1]);
  const dDown = Math.min(len, Math.max(0, lt - 0.2) * v);
  const onRamp = dDown < len;
  const bq = Math.max(0, lt - 0.2 - len / v); // time on the quay
  const bx = onRamp ? top[0] - (top[0] - foot[0]) * (dDown / len) : foot[0] - Math.min(bq, 0.9) * v;
  const by = onRamp ? top[1] + (top[1] - foot[1]) * -(dDown / len) : GY;
  const blairWalk = lt > 0.2 && bq < 0.9;
  const tPocket = 3.95;
  const pk = interpolate(lt, [tPocket, tPocket + 0.35], [0, 1], cl);
  const nearA = lt < tPocket ? -8 : -8 - 72 * pk;
  const pN = handAt(bx, by, s, -1, nearA, 0);
  const pBag = handAt(bx, by, s, -1, 4, 0);
  // Wilde walks in from the left to the gangway foot, nods, then goes up after Blair has passed
  const wArrive = 1.2 + (foot[0] + 40) / (v * 1.1);
  const wx = Math.min(foot[0], -40 + Math.max(0, lt - 1.2) * v * 1.1);
  const wUp = Math.max(0, lt - 3.6) * v;
  const wxx = wUp > 0 ? foot[0] + (top[0] - foot[0]) * Math.min(1, wUp / len) : wx;
  const wyy = wUp > 0 ? GY + (top[1] - GY) * Math.min(1, wUp / len) : GY;
  const nod = lt > 3.05 && lt < 3.55 ? 6 * Math.sin(((lt - 3.05) / 0.5) * Math.PI) : 0;
  return (
    <g>
      <Sky top="#9cc0da" bottom="#eadfca" clouds={2} drift={lt + 3} />
      <Liner x={980} y={1080} s={2.2} />
      {/* hull door */}
      <rect x={812} y={770} width={90} height={110} fill="#0c0c0e" stroke="#555" strokeWidth={4} />
      <Quay />
      {/* gangway: plank with rails */}
      <path d={`M ${top[0] + 30} ${top[1]} L ${foot[0] - 30} ${foot[1]} L ${foot[0] - 30} ${foot[1] + 18} L ${top[0] + 30} ${top[1] + 18} Z`} fill="#8a6a44" stroke={INK} strokeWidth={4} />
      <path d={`M ${top[0] + 30} ${top[1] - 90} L ${foot[0] - 30} ${foot[1] - 90}`} stroke="#5a4028" strokeWidth={6} />
      {Array.from({ length: 6 }, (_, i) => { const f = i / 5; const x = top[0] + 30 + (foot[0] - 60 - top[0]) * f, y = top[1] + (foot[1] - top[1]) * f; return <line key={i} x1={x} y1={y} x2={x} y2={y - 90} stroke="#5a4028" strokeWidth={5} />; })}
      <Figure x={wxx} y={wyy} s={s} facing={1} A1={nod > 0 ? -25 : undefined} A2={undefined} lean={wUp > 0 ? -6 : nod} colors={WILDE} frame={frame} walking={(lt > 1.2 && lt < wArrive) || wUp > 0} expression="neutral" />
      <Figure x={bx} y={by} s={s} facing={-1} A1={nearA} A2={4} lean={onRamp ? 6 : 0} colors={OFFICER} frame={frame + 5} walking={blairWalk} expression={lt > tPocket ? "neutral" : lt > 2.9 && lt < 3.6 ? "neutral" : "sad"} />
      {/* bag in the far hand */}
      <g transform={`translate(${pBag[0]} ${pBag[1]})`}><rect x={-36} y={0} width={72} height={52} rx={8} fill="#5a3a24" stroke={INK} strokeWidth={4} /><path d="M -14 0 Q 0 -16 14 0" stroke={INK} strokeWidth={5} fill="none" /></g>
      <Hand p={pBag} />
      {lt > tPocket + 0.2 && <Key x={pN[0] - 6} y={pN[1] - 4} s={0.16} rot={-70} glint={interpolate(lt, [tPocket + 0.35, tPocket + 1.0], [0, 1], cl)} />}
      <Hand p={pN} />
      <Label x={540} y={560} lt={lt} at={0.5} text="2ND OFFICER DAVID BLAIR" size={40} />
      <Label x={540} y={660} lt={lt} at={0.9} text="APRIL 9, 1912" size={34} bg="#f2e3b5" fg="#1b140d" stroke="#1b140d" />
      {lt > tPocket + 0.3 && <Label x={pN[0] + 40} y={pN[1] - 110} lt={lt} at={tPocket + 0.3} text="CROW'S NEST KEY" size={34} bg="#7a5a1a" />}
    </g>
  );
};

// ---------- 4: in the crow's nest by day: Fleet mimes binoculars; Lee opens empty hands ----------
export const SceneNestDay: React.FC<SP> = ({ lt, frame }) => {
  const mime = lt > 0.3 && lt < 2.9;
  const fA = mime ? -165 : lt < 0.3 ? -10 : -40;
  const turnLee = lt > 2.9;
  const shrug = lt > 3.2 ? interpolate(lt, [3.2, 3.6], [0, 1], cl) : 0;
  const shake = lt > 4.6 && lt < 5.6 ? Math.sin((lt - 4.6) * 14) * 4 : 0;
  const s = 1.25;
  const fx = 400, lx = 700;
  return (
    <g>
      <Sky top="#8fb8d8" bottom="#dfe9ee" clouds={3} drift={lt * 2} />
      <rect x={-60} y={1060} width={1200} height={1000} fill="#5a7f9a" />
      <Sea y={1060} frame={frame} c1="#5a7f9a" c2="#2f4f6a" crest="#ffffff" amp={4} rows={5} />
      <Mast x={540} y0={-40} y1={1400} w={44} />
      <line x1={540} y1={300} x2={-60} y2={1100} stroke={INK} strokeWidth={3} opacity={0.6} />
      <line x1={540} y1={300} x2={1140} y2={1100} stroke={INK} strokeWidth={3} opacity={0.6} />
      <Nest x={540} y={1170} s={2.3}>
        <g transform="scale(0.435)">
          <Figure x={fx - 540} y={260} s={s} facing={turnLee ? 1 : 1} A1={fA} A2={mime ? -160 : -20} colors={FLEET} frame={frame} expression={turnLee ? "sad" : "neutral"} />
          <Figure x={lx - 540} y={260} s={s * 0.98} facing={-1} lean={shake} A1={-30 - shrug * 40} A2={-25 - shrug * 45} colors={LEE} frame={frame + 7} expression={shrug > 0 ? "sad" : "neutral"} />
        </g>
      </Nest>
      <Label x={540} y={560} lt={lt} at={0.6} text="THE LOOKOUTS" size={40} />
      <Label x={540} y={660} lt={lt} at={4.7} text="NO BINOCULARS FOR THEM" size={40} bg="#7a1f1f" />
    </g>
  );
};

// ---------- 6: night, from behind Fleet in the nest: the iceberg grows out of the dark ----------
export const SceneSpot: React.FC<SP> = ({ lt, frame }) => {
  const hz = 900;
  const g = interpolate(lt, [0.3, 3.6], [0.15, 0.95], { ...cl, easing: Easing.in(Easing.quad) });
  const seen = lt > 1.45;
  const lean = seen ? interpolate(lt, [1.45, 1.8], [0, 8], cl) : 0;
  return (
    <g>
      <Sky top="#04070f" bottom="#0e1a2e" />
      <Stars n={70} h={hz - 40} />
      <rect x={-60} y={hz} width={1200} height={1100} fill="#060c18" />
      <Sea y={hz} frame={frame * 0.4} c1="#0a1424" c2="#04080f" crest="#7a90aa" amp={2} rows={6} />
      <Berg x={600} y={hz + 6} s={g} />
      {/* the bow far below */}
      <path d={`M 360 2000 L 540 ${hz + 180} L 720 2000 Z`} fill="#141418" stroke="#3a3a44" strokeWidth={5} />
      <Nest x={540} y={1330} s={2.6}>
        <g transform="scale(0.385)">
          <Figure x={-120} y={190} s={1.3} facing={1} lean={lean} A1={seen ? -150 : -30} A2={-20} colors={FLEET} frame={frame} expression={seen ? "scared" : "neutral"} />
        </g>
      </Nest>
      <Label x={540} y={520} lt={lt} at={0.2} text="11:40 PM" size={46} />
      {seen && <Label x={780} y={760} lt={lt} at={1.5} text="NAKED EYE" size={36} bg="#1f3a5a" />}
    </g>
  );
};

// ---------- 7: Fleet rings the bell three times, then grabs the telephone to the bridge ----------
export const BELL_TIMES = [0.12, 0.42, 0.72];
export const PHONE_AT = 1.3;
export const SceneBell: React.FC<SP> = ({ lt, frame }) => {
  const s = 1.5, fx = 520, fy = 1480;
  const pull = BELL_TIMES.reduce((a, t0) => a + (lt > t0 - 0.12 && lt < t0 + 0.14 ? Math.sin(((lt - t0 + 0.12) / 0.26) * Math.PI) : 0), 0);
  const swing = BELL_TIMES.reduce((a, t0) => a + (lt > t0 ? 22 * Math.exp(-(lt - t0) * 4) * Math.sin((lt - t0) * 20) : 0), 0);
  const phone = lt > PHONE_AT;
  const A1 = phone ? interpolate(lt, [PHONE_AT, PHONE_AT + 0.3], [-120, -168], cl) : -130 + pull * 28;
  const bellP: V2 = [770, 640];
  const hN = handAt(fx, fy, s, 1, A1, 0);
  const box: V2 = [300, 900];
  return (
    <g>
      <Sky top="#04070f" bottom="#0e1a2e" />
      <Stars n={40} h={1000} />
      <Mast x={150} y0={-40} y1={2000} w={60} />
      <Bell x={bellP[0]} y={bellP[1]} swing={swing} s={1.4} />
      {/* bell rope from the clapper down to Fleet's raised hand */}
      {!phone && <path d={`M ${bellP[0]} ${bellP[1] + 110} Q ${(bellP[0] + hN[0]) / 2 + 20} ${(bellP[1] + hN[1]) / 2 + 30} ${hN[0]} ${hN[1]}`} stroke="#c8b07a" strokeWidth={7} fill="none" />}
      {phone && <path d={`M ${bellP[0]} ${bellP[1] + 110} L ${bellP[0] - 10} ${bellP[1] + 300}`} stroke="#c8b07a" strokeWidth={7} fill="none" />}
      {/* phone box on the mast with a cord to the handset */}
      <rect x={box[0] - 60} y={box[1] - 90} width={120} height={160} rx={10} fill="#3a2a1a" stroke={INK} strokeWidth={5} />
      <path d={`M ${box[0]} ${box[1] + 60} Q ${box[0] + 60} ${box[1] + 200} ${phone ? hN[0] : box[0] + 40} ${phone ? hN[1] + 40 : box[1] - 20}`} stroke="#1a1a1a" strokeWidth={5} fill="none" />
      {!phone && <Handset p={[box[0] + 40, box[1] - 20]} />}
      <Figure x={fx} y={fy} s={s} facing={phone ? -1 : 1} A1={phone ? A1 : A1} A2={phone ? -30 : -40} colors={FLEET} frame={frame} expression="scared" />
      <rect x={-60} y={1230} width={1200} height={800} fill="#c9b48a" stroke={INK} strokeWidth={6} />
      <rect x={-60} y={1210} width={1200} height={30} fill="#8a6a44" stroke={INK} strokeWidth={5} />
      {phone && <Handset p={[hN[0] + (phone ? -10 : 0), hN[1] + 10]} rot={-15} />}
      {phone && <Label x={720} y={1000} lt={lt} at={PHONE_AT + 0.25} text="ICEBERG, RIGHT AHEAD!" size={36} bg="#1f3a5a" />}
      <Hand p={hN} r={14} />
    </g>
  );
};

// ---------- 8: wide: the bow swings but the ice scrapes along the side ----------
export const SCRAPE_AT = 0.55;
export const SceneScrape: React.FC<SP> = ({ lt, frame }) => {
  const hz = 1000;
  const shipX = 760 - lt * 90;
  const turn = interpolate(lt, [0, 0.6], [0, -4], cl);
  return (
    <g>
      <Sky top="#04070f" bottom="#0e1a2e" />
      <Stars n={50} h={hz - 40} />
      <Berg x={300} y={hz + 30} s={1.15} />
      <Liner x={shipX} y={hz + 70} s={1.15} rot={turn} lights={1} />
      <Sea y={hz + 40} frame={frame} c1="#0a1424" c2="#04080f" crest="#7a90aa" amp={4} rows={7} />
      {lt > SCRAPE_AT && Array.from({ length: 7 }, (_, i) => { const tt = lt - SCRAPE_AT - i * 0.08; if (tt < 0) return null; return <rect key={i} x={260 + i * 40 + tt * 60} y={hz - 260 + tt * tt * 900} width={22} height={18} fill="#d8e4f0" stroke={INK} strokeWidth={3} transform={`rotate(${tt * 300} ${270 + i * 40} ${hz - 250})`} />; })}
      {lt > SCRAPE_AT && lt < SCRAPE_AT + 0.5 && <ellipse cx={330} cy={hz + 20} rx={160 * (lt - SCRAPE_AT) * 2} ry={30} fill="none" stroke="#fff" strokeWidth={6} opacity={1 - (lt - SCRAPE_AT) * 2} />}
      <Label x={540} y={620} lt={lt} at={0.15} text="TOO LATE" size={56} bg="#7a1f1f" />
    </g>
  );
};

// ---------- 9: the US Senate inquiry: the senator asks; Fleet answers with a sweep of his arm ----------
export const SceneInquiry: React.FC<SP> = ({ lt, frame }) => {
  const ask = lt > 1.0 && lt < 3.4;
  const sA = ask ? interpolate(lt, [1.0, 1.3], [-20, -95], cl) : -20;
  const sweep = lt > 5.3 ? interpolate(lt, [5.3, 6.0], [-35, -100], { ...cl, easing: ease }) : -25;
  return (
    <g>
      <rect x={-60} y={0} width={1200} height={2300} fill="#7a5a3a" />
      {Array.from({ length: 9 }, (_, i) => <rect key={i} x={-40 + i * 130} y={240} width={110} height={900} rx={6} fill="#86664a" stroke="#5a3e28" strokeWidth={4} />)}
      <rect x={-60} y={GY + 60} width={1200} height={800} fill="#4a3220" />
      {/* flag-coloured bunting */}
      {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M ${-40 + i * 100} 200 l 50 50 l 50 -50`} fill={i % 3 === 0 ? "#b5322a" : i % 3 === 1 ? "#f2efe6" : "#22407a"} stroke={INK} strokeWidth={3} />)}
      {/* senator behind a high table at the left */}
      <Figure x={260} y={GY - 60} s={1.15} facing={1} A1={sA} A2={-40} colors={SENATOR} frame={frame} expression="determined" />
      <rect x={60} y={GY - 270} width={420} height={330} fill="#5a3a24" stroke={INK} strokeWidth={6} />
      <rect x={40} y={GY - 290} width={460} height={30} fill="#6a4a2a" stroke={INK} strokeWidth={5} />
      {Array.from({ length: 3 }, (_, i) => <rect key={i} x={110 + i * 60} y={GY - 300} width={50} height={8} fill="#f2ead2" />)}
      {/* Fleet at the witness stand at the right */}
      <Figure x={800} y={GY + 40} s={1.15} facing={-1} A1={sweep} A2={-30} colors={{ ...FLEET, coat: "#3a3a42", coatShade: "#2a2a30", coatLight: "#4a4a52", patch: "#4a4a52", cap: undefined, capStyle: "hair" } as Partial<KitColors>} frame={frame + 4} expression={lt > 5.3 ? "sad" : "neutral"} />
      <rect x={660} y={GY - 150} width={300} height={210} fill="#5a3a24" stroke={INK} strokeWidth={6} />
      <Label x={540} y={560} lt={lt} at={0.3} text="US SENATE INQUIRY" size={42} />
      {ask && <Label x={360} y={760} lt={lt} at={1.4} text="HOW MUCH SOONER?" size={36} bg="#f2e3b5" fg="#1b140d" stroke="#1b140d" />}
    </g>
  );
};

// ---------- 10: insert on the nest locker: the key stops short of the keyhole; binoculars or telephone? ----------
export const SceneLocker: React.FC<SP> = ({ lt }) => {
  const kx = interpolate(lt, [0.2, 1.0], [1300, 860], { ...cl, easing: Easing.out(Easing.cubic) });
  const alt = Math.floor(Math.max(0, lt - 1.4) / 0.7) % 2;
  const q = lt > 1.3;
  return (
    <g>
      <rect x={-60} y={0} width={1200} height={2300} fill="#c9b48a" />
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1={-60} y1={i * 180} x2={1140} y2={i * 180} stroke="#b09c72" strokeWidth={6} />)}
      {/* locker */}
      <rect x={250} y={520} width={420} height={560} rx={10} fill="#6a4a2a" stroke={INK} strokeWidth={8} />
      <rect x={280} y={550} width={360} height={500} rx={6} fill="#7a5a34" stroke={INK} strokeWidth={5} />
      <circle cx={610} cy={800} r={20} fill="#d9a93a" stroke={INK} strokeWidth={5} /><rect x={604} y={800} width={12} height={34} fill="#1a1a1a" />
      {/* "what was inside?" ghost outlines alternate */}
      {q && <g opacity={0.85} transform="translate(450 800)">
        {alt === 0 ? <g stroke="#fff" strokeWidth={8} strokeDasharray="16 10" fill="none"><circle cx={-60} cy={20} r={52} /><circle cx={60} cy={20} r={52} /><rect x={-40} y={-50} width={80} height={40} /></g>
          : <g stroke="#fff" strokeWidth={8} strokeDasharray="16 10" fill="none"><rect x={-40} y={-90} width={80} height={180} rx={20} /><ellipse cx={0} cy={-90} rx={56} ry={30} /><ellipse cx={0} cy={90} rx={56} ry={30} /></g>}
      </g>}
      <BigHand x={kx + 80} y={800} rot={180} />
      <Key x={kx + 60} y={800} s={0.9} rot={180} />
      {q && <text x={450} y={480} textAnchor="middle" fontFamily="Georgia" fontWeight={900} fontSize={200} fill="#ffd23f" stroke={INK} strokeWidth={8} paintOrder="stroke" transform={`scale(${1})`}>?</text>}
      <Label x={450} y={1140} lt={lt} at={1.5} text={alt === 0 ? "BINOCULARS?" : "TELEPHONE?"} size={42} bg="#1f3a5a" />
      <Label x={540} y={1290} lt={lt} at={3.1} text="HISTORIANS STILL ARGUE" size={42} bg="#7a1f1f" />
    </g>
  );
};

// ---------- 11: 2007 auction: a paddle goes up, the gavel comes down on "sold" ----------
export const GAVEL_AT = 1.52;
export const SceneAuction: React.FC<SP> = ({ lt, frame }) => {
  const gA = lt < GAVEL_AT - 0.35 ? -60 : lt < GAVEL_AT ? interpolate(lt, [GAVEL_AT - 0.35, GAVEL_AT - 0.1, GAVEL_AT], [-60, -150, -95], cl) : -95;
  const ax = 860, ay = GY + 20, as = 1.1;
  const gh = handAt(ax, ay, as, -1, gA, 0);
  const lect: V2 = [ax - 150, ay - 300];
  const paddle = lt > 0.5 && lt < 1.6;
  return (
    <g>
      <rect x={-60} y={0} width={1200} height={2300} fill="#4a2a2e" />
      {Array.from({ length: 6 }, (_, i) => <rect key={i} x={-20 + i * 200} y={200} width={150} height={850} fill="#5a3438" stroke="#3a1e22" strokeWidth={5} />)}
      <rect x={-60} y={GY + 40} width={1200} height={800} fill="#2a1a1c" />
      {/* the key on a velvet stand under glass */}
      <rect x={300} y={980} width={200} height={300} fill="#3a2a1a" stroke={INK} strokeWidth={5} />
      <rect x={270} y={940} width={260} height={50} rx={10} fill="#9a1f2a" stroke={INK} strokeWidth={5} />
      <Key x={340} y={920} s={0.55} rot={-8} glint={((lt * 0.8) % 1.6) - 0.3} />
      <path d="M 280 945 L 280 790 Q 400 700 520 790 L 520 945" fill="#ffffff" fillOpacity={0.12} stroke="#e8f0f6" strokeWidth={4} />
      {/* auctioneer at the lectern */}
      <Figure x={ax} y={ay} s={as} facing={-1} A1={gA} A2={-60} colors={AUCTIONEER} frame={frame} expression={lt > GAVEL_AT ? "happy" : "determined"} />
      <rect x={lect[0] - 10} y={lect[1] + 60} width={220} height={280} fill="#5a3a24" stroke={INK} strokeWidth={5} />
      <rect x={lect[0] - 30} y={lect[1] + 40} width={260} height={30} fill="#6a4a2a" stroke={INK} strokeWidth={5} />
      <g transform={`translate(${gh[0]} ${gh[1]}) rotate(${gA + 90})`}><rect x={-6} y={-90} width={12} height={90} fill="#6a4a2a" stroke={INK} strokeWidth={3} /><rect x={-34} y={-118} width={68} height={34} rx={6} fill="#5a3a24" stroke={INK} strokeWidth={4} /></g>
      {lt > GAVEL_AT && lt < GAVEL_AT + 0.3 && <circle cx={lect[0] + 40} cy={lect[1] + 40} r={30 + (lt - GAVEL_AT) * 260} fill="none" stroke="#fff3c4" strokeWidth={6} opacity={1 - (lt - GAVEL_AT) * 3.3} />}
      <Hand p={gh} />
      {/* bidders from behind (front row), one raises a paddle */}
      {BIDDERS.map((c, i) => {
        const bx = 120 + i * 230, up = i === 1 && paddle;
        const ph = handAt(bx, 1720, 1.1, 1, up ? -160 : -10, 0);
        return <g key={i}>
          <Figure x={bx} y={1720} s={1.1} facing={1} A1={up ? -160 : -10} A2={-10} colors={c} frame={frame + i * 5} expression="neutral" />
          {up && <g transform={`translate(${ph[0]} ${ph[1]})`}><rect x={-4} y={-80} width={8} height={80} fill="#6a4a2a" /><circle cy={-110} r={40} fill="#f2ead2" stroke={INK} strokeWidth={4} /><text y={-98} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={34} fill="#1b140d">27</text></g>}
        </g>;
      })}
      <Label x={540} y={560} lt={lt} at={0.25} text="AUCTION · 2007" size={42} />
      {lt > GAVEL_AT && <Label x={540} y={680} lt={lt} at={GAVEL_AT} text="SOLD" size={56} bg="#7a1f1f" />}
    </g>
  );
};
export const _unused = [Hand];
