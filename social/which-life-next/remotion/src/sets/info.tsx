import React from "react";
import { interpolate, Easing, useCurrentFrame } from "remotion";
import { Kit, KitProps } from "../kit/Kit";

/** "Mute-proof" explainers: what the narration says, shown on screen. */

/** Tiny person icon. */
const Person: React.FC<{ x: number; y: number; s: number; color: string; dead?: boolean }> = ({ x, y, s, color, dead }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cx={0} cy={-34} r={11} fill={color} />
    <path d="M -14 -20 Q 0 -26 14 -20 L 12 6 L -12 6 Z" fill={color} />
    <rect x={-11} y={6} width={9} height={22} rx={3} fill={color} />
    <rect x={2} y={6} width={9} height={22} rx={3} fill={color} />
    {dead && <path d="M -18 -50 L 18 26 M 18 -50 L -18 26" stroke="#c62828" strokeWidth={5} opacity={0.0} />}
  </g>
);

/** Big number counting up + a grid of people icons filling in (1 icon = perIcon people). */
export const Counter: React.FC<{ value: number; label: string; sub?: string; perIcon?: number; color?: string; dur: number; narrow?: boolean; prefix?: string; suffix?: string }> = ({
  value, label, sub, perIcon, color = "#c62828", dur, narrow, prefix = "", suffix = "",
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [6, Math.min(dur * 0.6, 75)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const n = Math.round(value * p);
  const per = perIcon ?? Math.max(1, Math.ceil(value / 100));
  const icons = Math.min(120, Math.ceil(value / per));
  const shown = Math.round(icons * p);
  const cols = narrow ? 10 : 20;
  const gx = narrow ? 560 : 360, gy = narrow ? 560 : 560, step = narrow ? 80 : 60;
  return (
    <g>
      <rect x={-200} y={-200} width={2320} height={1480} fill="#15100c" />
      <text x={960} y={narrow ? 330 : 250} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={narrow ? 150 : 190} fill="#ffd23f" stroke="#000" strokeWidth={12} paintOrder="stroke">
        {prefix}{n.toLocaleString("en-US")}{suffix}
      </text>
      <text x={960} y={narrow ? 430 : 360} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={narrow ? 56 : 70} fill="#fff" stroke="#000" strokeWidth={8} paintOrder="stroke">{label}</text>
      {Array.from({ length: icons }).map((_, i) => (
        <Person key={i} x={gx + (i % cols) * step} y={gy + Math.floor(i / cols) * (step * 1.15)} s={narrow ? 1.1 : 0.85} color={i < shown ? color : "#3a2f26"} />
      ))}
      {sub && <text x={960} y={narrow ? 1500 : 1040} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={narrow ? 40 : 40} fill="#e9dcc3">{sub}{per > 1 ? ` · 1 icon = ${per.toLocaleString("en-US")} people` : ""}</text>}
    </g>
  );
};

/** Two people, a hand offered, the other refuses: "no handshakes". */
export const Handshake: React.FC<{ label?: string; dur: number; narrow?: boolean }> = ({ label = "NO MORE HANDSHAKES", dur, narrow }) => {
  const frame = useCurrentFrame();
  const reach = interpolate(frame, [5, 25], [0, -55], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pull = interpolate(frame, [25, 40], [0, 25], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const x = interpolate(frame, [30, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const other: KitProps = { pose: "side", facing: -1, colors: { coat: "#3e4a5a", cap: "#5a3a2a", hair: "#2a1d14" } };
  return (
    <g>
      <rect x={-200} y={-200} width={2320} height={1480} fill="#c9b48f" />
      <rect x={-200} y={760} width={2320} height={600} fill="#8a7a5e" />
      <g transform="translate(760 1000) scale(1.5)"><Kit pose="side" facing={1} expression="scared" lean={-pull / 4} /></g>
      <g transform="translate(1160 1000) scale(1.5)"><Kit {...other} holdingRope={reach < -20} /></g>
      <g transform="translate(960 640)" opacity={x}>
        <circle r={110 * (0.6 + 0.4 * x)} fill="none" stroke="#c62828" strokeWidth={22} />
        <path d="M -78 78 L 78 -78" stroke="#c62828" strokeWidth={22} strokeLinecap="round" />
      </g>
      <text x={960} y={narrow ? 380 : 200} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={narrow ? 68 : 90} fill="#fff" stroke="#000" strokeWidth={10} paintOrder="stroke" opacity={x}>{label}</text>
      {dur > 0 && null}
    </g>
  );
};

/** Arrow callouts naming real things in a scene (world coords). */
export type Callout = { x: number; y: number; text: string; dx?: number; dy?: number; appear?: number };
export const Callouts: React.FC<{ items: Callout[]; t: number; narrow?: boolean }> = ({ items, t, narrow }) => (
  <g>
    {items.map((c, i) => {
      const a = c.appear ?? 0.1;
      const o = interpolate(t, [a, a + 0.08], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      if (o <= 0) return null;
      const dx = c.dx ?? 140, dy = c.dy ?? -170;
      const fs = Math.min(42, ((narrow ? 860 : 1500) - 44) / (c.text.length * 0.64));
      const w = c.text.length * fs * 0.64 + 44;
      // keep the label inside the visible frame (Shorts show x 420-1500)
      const minX = narrow ? 440 + w / 2 : 20 + w / 2, maxX = narrow ? 1480 - w / 2 : 1900 - w / 2;
      const lx = Math.max(minX, Math.min(maxX, c.x + dx)), ly = c.y + dy;
      return (
        <g key={i} opacity={o}>
          <path d={`M ${lx} ${ly + 30} L ${c.x} ${c.y}`} stroke="#000" strokeWidth={12} strokeLinecap="round" />
          <path d={`M ${lx} ${ly + 30} L ${c.x} ${c.y}`} stroke="#ffd23f" strokeWidth={6} strokeLinecap="round" />
          <circle cx={c.x} cy={c.y} r={12} fill="#ffd23f" stroke="#000" strokeWidth={5} />
          <rect x={lx - w / 2} y={ly - 32} width={w} height={62} rx={12} fill="#1b140d" stroke="#ffd23f" strokeWidth={5} />
          <text x={lx} y={ly + 12} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={fs} fill="#fff">{c.text}</text>
        </g>
      );
    })}
  </g>
);

/** People leaving a city with bundles (for "20,000 flee"). */
export const Fleeing: React.FC<{ n?: number; t: number }> = ({ n = 14, t }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const x0 = 300 + (i % 7) * 110 + (i > 6 ? 60 : 0);
      const y = 960 + (i > 6 ? 60 : 0);
      return (
        <g key={i} transform={`translate(${x0 + t * 900} ${y}) scale(${0.45 + (i > 6 ? 0.08 : 0)})`}>
          <Kit pose="side" walking colors={{ coat: ["#3e4a5a", "#5a3a2a", "#4a5a3a", "#6b5a3a"][i % 4], cap: "#3a3330" }} />
        </g>
      );
    })}
  </g>
);

/** "1 in N": a row of N people, k highlighted. */
export const Ratio: React.FC<{ n: number; k?: number; label: string; narrow?: boolean }> = ({ n, k = 1, label, narrow }) => {
  const frame = useCurrentFrame();
  const on = interpolate(frame, [15, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const step = narrow ? 100 : 150;
  const x0 = 960 - ((n - 1) * step) / 2;
  return (
    <g>
      <rect x={-200} y={-200} width={2320} height={1480} fill="#15100c" />
      <text x={960} y={narrow ? 380 : 260} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={narrow ? 84 : 110} fill="#ffd23f" stroke="#000" strokeWidth={10} paintOrder="stroke">{label}</text>
      {Array.from({ length: n }).map((_, i) => (
        <Person key={i} x={x0 + i * step} y={700} s={narrow ? 2.2 : 3} color={i < k ? (on > 0.5 ? "#c62828" : "#e9dcc3") : "#e9dcc3"} />
      ))}
    </g>
  );
};

/** Church bell, optionally with a red "no" sign (bells stopped). */
export const Bell: React.FC<{ x: number; y: number; scale?: number; stopped?: boolean }> = ({ x, y, scale = 1, stopped }) => {
  const frame = useCurrentFrame();
  const swing = stopped ? 0 : Math.sin(frame * 0.2) * 12;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g transform={`rotate(${swing} 0 -150)`}>
        <path d="M -110 60 Q -100 -120 0 -140 Q 100 -120 110 60 Q 0 90 -110 60 Z" fill="#b8862f" stroke="#2b1d14" strokeWidth={8} />
        <path d="M -60 -60 Q 0 -90 60 -60" stroke="#e0b860" strokeWidth={10} fill="none" />
        <circle cx={0} cy={80} r={22} fill="#7a5a1f" stroke="#2b1d14" strokeWidth={6} />
      </g>
      <rect x={-20} y={-180} width={40} height={40} fill="#5a3f26" />
      {stopped && (
        <g>
          <circle r={190} fill="none" stroke="#c62828" strokeWidth={26} />
          <path d="M -134 134 L 134 -134" stroke="#c62828" strokeWidth={26} strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};

/** A cloth rag held to the face. */
export const Rag: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M -40 -20 Q 0 -34 40 -20 L 46 26 Q 0 40 -46 26 Z" fill="#efe8d6" stroke="#2b1d14" strokeWidth={4} />
    <ellipse cx={-10} cy={6} rx={14} ry={8} fill="#c9c08a" opacity={0.7} />
  </g>
);
