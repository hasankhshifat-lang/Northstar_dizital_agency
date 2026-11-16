import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {loadFont as loadPlexSerif} from '@remotion/google-fonts/IBMPlexSerif';
import {loadFont as loadPlexMono} from '@remotion/google-fonts/IBMPlexMono';
import {loadFont as loadMarker} from '@remotion/google-fonts/PermanentMarker';
import {loadFont as loadOswald} from '@remotion/google-fonts/Oswald';

const anton = loadAnton().fontFamily;
const plexSerif = loadPlexSerif('normal', {weights: ['600', '700']}).fontFamily;
const plexMono = loadPlexMono('normal', {weights: ['500', '600']}).fontFamily;
const marker = loadMarker().fontFamily;
const oswald = loadOswald('normal', {weights: ['600']}).fontFamily;

// Channel house styles. The visual subject (face / cutout / object / location) carries the story;
// these only set type, tag colours and grading. Change a look in the channel rules first, then here.
//   map       = Which Life Next (parchment map, Anton white + gold, dark tags with gold text)
//   archive   = As Printed (light table, IBM Plex Serif, orange evidence marks)
//   notebook  = The Overthinking Pad (dot-grid paper, marker, yellow highlighter)
//   toon      = Foot All FC / Scientific Bithi (flat cartoon, bold outline type)
//   cinematic = any other channel or niche
const STYLES = {
  map: {font: anton, upper: true, text: '#ffffff', accent: '#f2c14e', stroke: '#14110d', tagBg: '#1f2326', tagText: '#f2c14e', paper: '#e9dcb8', mark: '#b5412b'},
  archive: {font: plexSerif, upper: false, text: '#fafaf7', accent: '#ffb38f', stroke: '#15171a', tagBg: '#15171a', tagText: '#ff6a2b', paper: '#e6e8ea', mark: '#ff5a1f'},
  notebook: {font: marker, upper: true, text: '#111111', accent: '#111111', stroke: 'transparent', tagBg: '#ffe14d', tagText: '#111111', paper: '#fbfaf5', mark: '#e0352b'},
  toon: {font: anton, upper: true, text: '#ffffff', accent: '#ffd23f', stroke: '#111111', tagBg: '#e63946', tagText: '#ffffff', paper: '#8fd3ff', mark: '#e63946'},
  cinematic: {font: anton, upper: true, text: '#ffffff', accent: '#ffcc33', stroke: '#000000', tagBg: '#111111', tagText: '#ffcc33', paper: '#1a1a1a', mark: '#ff3b30'},
} as const;
type StyleKey = keyof typeof STYLES;

type Grade = 'none' | 'mono' | 'sepia' | 'warm' | 'cool';
const gradeFilter = (g: Grade | undefined, extra = '') => {
  const base = {none: '', mono: 'grayscale(1) contrast(1.12)', sepia: 'sepia(0.55) contrast(1.08)', warm: 'sepia(0.25) saturate(1.2) contrast(1.05)', cool: 'saturate(0.8) hue-rotate(-8deg) contrast(1.08)'}[g ?? 'none'];
  return `${base} ${extra}`.trim() || undefined;
};

export type Background = {
  src?: string;                 // file in public/ (a real photo, map, scan or generated art with NO text)
  crop?: [number, number, number, number]; // x, y, w, h as fractions of the source image (zooms into a region)
  grade?: Grade;
  blur?: number;                // px, pushes the background back so the subject pops
  darken?: number;              // 0..1 overall darkening
  side?: 'left' | 'right' | 'top' | 'none'; // where the text sits: a gradient darkens that side
  color?: string;               // flat colour if no src
};

export type Layer =
  | {type: 'cutout'; src: string; x: number; y: number; h: number; flip?: boolean; grade?: Grade; glow?: string; outline?: string; brightness?: number}
  | {type: 'image'; src: string; x: number; y: number; w: number; rotate?: number; grade?: Grade; paper?: boolean; crop?: [number, number, number, number]; aspect?: number}
  | {type: 'pin'; x: number; y: number; label?: string; size?: number}
  | {type: 'ring'; x: number; y: number; rx: number; ry: number; rotate?: number; width?: number}
  | {type: 'arrow'; from: [number, number]; to: [number, number]; bend?: number; width?: number};

export type Tag = {text: string; x: number; y: number; variant?: 'date' | 'label' | 'stamp'; size?: number; rotate?: number};

export type ThumbProps = {
  width: number;
  height: number;
  style: StyleKey;
  background: Background;
  layers?: Layer[];            // drawn in order: back to front
  headline: {lines: string[]; accent?: string[]; x: number; y: number; size: number; align?: 'left' | 'center' | 'right'; panel?: boolean};
  tags?: Tag[];
  guides?: boolean;            // draw the 9:16 bottom safe area (only for checking, never in the export)
};

export const defaultProps: ThumbProps = {
  width: 1280, height: 720, style: 'cinematic', background: {color: '#222'},
  headline: {lines: ['HEADLINE'], x: 60, y: 60, size: 120},
};

const norm = (w: string) => w.toUpperCase().replace(/[^A-Z0-9$']/g, '');

const CropImg: React.FC<{src: string; crop?: [number, number, number, number]; style?: React.CSSProperties; filter?: string; aspect?: number}> = ({src, crop, style, filter, aspect}) => {
  if (!crop) return <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', filter, ...style}} />;
  const [cx, cy, cw, ch] = crop;
  // Scale the whole image so the crop window fills the box; the box's aspect should match the crop's.
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', ...style}}>
      <Img src={staticFile(src)} style={{position: 'absolute', width: `${100 / cw}%`, height: `${100 / ch}%`,
        left: `${(-cx / cw) * 100}%`, top: `${(-cy / ch) * 100}%`, filter, objectFit: 'fill'}} />
    </div>
  );
};

export const Thumb: React.FC<ThumbProps> = (p) => {
  const s = STYLES[p.style] ?? STYLES.cinematic;
  const vertical = p.height > p.width;
  const bg = p.background;
  const accents = (p.headline.accent ?? []).map(norm);

  const sideGradient = {
    left: 'linear-gradient(90deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.45) 38%, rgba(0,0,0,0) 62%)',
    right: 'linear-gradient(270deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.45) 38%, rgba(0,0,0,0) 62%)',
    top: 'linear-gradient(180deg, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.35) 30%, rgba(0,0,0,0) 48%, rgba(0,0,0,0) 72%, rgba(0,0,0,0.55) 100%)',
    none: 'none',
  }[bg.side ?? 'none'];

  return (
    <AbsoluteFill style={{backgroundColor: bg.color ?? s.paper, overflow: 'hidden'}}>
      {/* 1. Background: location / environment, graded and pushed back */}
      {bg.src ? (
        <AbsoluteFill style={{transform: bg.blur ? 'scale(1.04)' : undefined}}>
          <CropImg src={bg.src} crop={bg.crop} filter={gradeFilter(bg.grade, bg.blur ? `blur(${bg.blur}px)` : '')} />
        </AbsoluteFill>
      ) : null}
      {p.style === 'notebook' && !bg.src ? (
        <AbsoluteFill style={{backgroundImage: 'radial-gradient(#c9c6bb 1.6px, transparent 1.6px)', backgroundSize: '28px 28px'}} />
      ) : null}
      {bg.darken ? <AbsoluteFill style={{background: `rgba(0,0,0,${bg.darken})`}} /> : null}
      <AbsoluteFill style={{background: sideGradient}} />
      {/* soft vignette for depth */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 60% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.38) 100%)'}} />

      {/* 2. Story layers: objects, evidence, pins, the main subject cutout */}
      {(p.layers ?? []).map((l, i) => {
        if (l.type === 'image') {
          const aspect = l.aspect ?? (l.crop ? (l.crop[2] / l.crop[3]) : 1.6);
          return (
            <div key={i} style={{position: 'absolute', left: l.x, top: l.y, width: l.w, height: l.w / aspect,
              transform: `rotate(${l.rotate ?? 0}deg)`, boxShadow: '0 18px 40px rgba(0,0,0,0.55), 0 4px 10px rgba(0,0,0,0.35)',
              border: l.paper ? '10px solid #f4f1e8' : undefined, background: '#f4f1e8', overflow: 'hidden'}}>
              <CropImg src={l.src} crop={l.crop} filter={gradeFilter(l.grade)} />
            </div>
          );
        }
        if (l.type === 'cutout') {
          const glow = l.glow ?? 'rgba(255,255,255,0.0)';
          return (
            <Img key={i} src={staticFile(l.src)} style={{position: 'absolute', left: l.x, top: l.y, height: l.h,
              transform: l.flip ? 'scaleX(-1)' : undefined,
              filter: [gradeFilter(l.grade), l.brightness ? `brightness(${l.brightness})` : '',
                l.outline ? `drop-shadow(0 0 0 ${l.outline}) drop-shadow(3px 0 0 ${l.outline}) drop-shadow(-3px 0 0 ${l.outline}) drop-shadow(0 3px 0 ${l.outline}) drop-shadow(0 -3px 0 ${l.outline})` : '',
                `drop-shadow(0 0 22px ${glow})`, 'drop-shadow(0 24px 30px rgba(0,0,0,0.6))'].join(' ')}} />
          );
        }
        if (l.type === 'pin') {
          const sz = l.size ?? 54;
          return (
            <div key={i} style={{position: 'absolute', left: l.x - sz / 2, top: l.y - sz * 1.3}}>
              <svg width={sz} height={sz * 1.3} viewBox="0 0 40 52" style={{filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.5))'}}>
                <path d="M20 51 C20 51 3 30 3 18 A17 17 0 0 1 37 18 C37 30 20 51 20 51Z" fill="#d7262b" stroke="#7a1012" strokeWidth="2" />
                <circle cx="20" cy="18" r="6.5" fill="#fff" />
              </svg>
              {l.label ? (
                <div style={{position: 'absolute', left: sz + 4, top: sz * 0.12, whiteSpace: 'nowrap', fontFamily: oswald, fontSize: sz * 0.5,
                  color: '#f6efe0', background: '#1f2326', padding: '2px 12px', letterSpacing: 1}}>{l.label}</div>
              ) : null}
            </div>
          );
        }
        if (l.type === 'ring') {
          return (
            <svg key={i} style={{position: 'absolute', left: 0, top: 0}} width={p.width} height={p.height}>
              <ellipse cx={l.x} cy={l.y} rx={l.rx} ry={l.ry} fill="none" stroke={s.mark} strokeWidth={l.width ?? 9}
                transform={`rotate(${l.rotate ?? -6} ${l.x} ${l.y})`} strokeLinecap="round" />
            </svg>
          );
        }
        if (l.type === 'arrow') {
          const [x1, y1] = l.from; const [x2, y2] = l.to; const bend = l.bend ?? 0.25;
          const mx = (x1 + x2) / 2 - (y2 - y1) * bend; const my = (y1 + y2) / 2 + (x2 - x1) * bend;
          const ang = Math.atan2(y2 - my, x2 - mx); const hl = (l.width ?? 10) * 3.2;
          const w = l.width ?? 10;
          return (
            <svg key={i} style={{position: 'absolute', left: 0, top: 0, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.45))'}} width={p.width} height={p.height}>
              <path d={`M${x1} ${y1} Q${mx} ${my} ${x2 - Math.cos(ang) * hl * 0.6} ${y2 - Math.sin(ang) * hl * 0.6}`} fill="none" stroke={s.mark} strokeWidth={w} strokeLinecap="round" />
              <polygon fill={s.mark} points={`${x2},${y2} ${x2 - Math.cos(ang - 0.45) * hl},${y2 - Math.sin(ang - 0.45) * hl} ${x2 - Math.cos(ang + 0.45) * hl},${y2 - Math.sin(ang + 0.45) * hl}`} />
            </svg>
          );
        }
        return null;
      })}

      {/* 3. Headline: short, specific, supports the picture */}
      <div style={{position: 'absolute', left: p.headline.align === 'center' ? 0 : p.headline.x, right: p.headline.align === 'center' ? 0 : undefined,
        top: p.headline.y, textAlign: p.headline.align ?? 'left', fontFamily: s.font, fontSize: p.headline.size,
        textTransform: s.upper ? 'uppercase' : 'none', lineHeight: p.style === 'archive' ? 1.02 : 0.98, letterSpacing: s.upper ? 1 : -1,
        ...(p.headline.panel ? {background: 'rgba(21,23,26,0.92)', padding: '22px 30px 26px', borderLeft: `8px solid ${s.mark}`} : {})}}>
        {p.headline.lines.map((line, i) => (
          <div key={i} style={{whiteSpace: 'nowrap'}}>
            {line.split(' ').map((w, j, arr) => (
              <span key={j} style={{color: accents.includes(norm(w)) ? s.accent : s.text,
                WebkitTextStroke: s.stroke !== 'transparent' && !p.headline.panel ? `${Math.max(3, Math.round(p.headline.size / 22))}px ${s.stroke}` : undefined,
                paintOrder: 'stroke fill', textShadow: p.headline.panel ? undefined : '0 6px 22px rgba(0,0,0,0.65)',
                ...(p.style === 'notebook' && accents.includes(norm(w)) ? {background: '#ffe14d', padding: '0 0.08em'} : {})}}>
                {w}{j < arr.length - 1 ? ' ' : ''}
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* 4. Tags: date / label / stamp */}
      {(p.tags ?? []).map((t, i) => {
        const sz = t.size ?? 34;
        const v = t.variant ?? 'date';
        const st: React.CSSProperties = v === 'stamp'
          ? {color: s.mark, border: `5px solid ${s.mark}`, padding: '4px 16px', fontFamily: anton, background: 'rgba(255,255,255,0.0)', letterSpacing: 3}
          : v === 'label'
            ? {color: '#f6efe0', background: '#1f2326', padding: '4px 14px', fontFamily: oswald, letterSpacing: 1}
            : {color: s.tagText, background: s.tagBg, padding: '6px 18px', fontFamily: p.style === 'archive' ? plexMono : anton, letterSpacing: 2};
        return (
          <div key={i} style={{position: 'absolute', left: t.x, top: t.y, fontSize: sz, whiteSpace: 'nowrap',
            transform: `rotate(${t.rotate ?? 0}deg)`, boxShadow: v === 'stamp' ? undefined : '0 6px 14px rgba(0,0,0,0.4)', ...st}}>{t.text}</div>
        );
      })}

      {p.guides && vertical ? <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 400, background: 'rgba(255,0,0,0.25)'}} /> : null}
    </AbsoluteFill>
  );
};
