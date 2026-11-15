import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {loadFont as loadAnton} from '@remotion/google-fonts/Anton';
import {loadFont as loadPlexSerif} from '@remotion/google-fonts/IBMPlexSerif';
import {loadFont as loadPlexMono} from '@remotion/google-fonts/IBMPlexMono';
import {loadFont as loadMarker} from '@remotion/google-fonts/PermanentMarker';

const anton = loadAnton().fontFamily;
const plexSerif = loadPlexSerif('normal', {weights: ['600']}).fontFamily;
const plexMono = loadPlexMono('normal', {weights: ['500']}).fontFamily;
const marker = loadMarker().fontFamily;

// House styles. Map = Which Life Next, archive = As Printed, notebook = The Overthinking Pad,
// cinematic = any other channel. Change a channel's look in the house rules first, then here.
const STYLES = {
  map: {font: anton, text: '#ffffff', accent: '#f2c14e', stroke: '#1b1b1b', tagBg: '#1f2326', tagText: '#f2c14e',
        panel: 'rgba(20,24,28,0.0)', vignette: 'rgba(0,0,0,0.45)', paper: '#efe3c4'},
  archive: {font: plexSerif, text: '#fafaf7', accent: '#ffb38f', stroke: 'transparent', tagBg: 'transparent', tagText: '#ff5a1f',
            panel: 'rgba(21,23,26,0.92)', vignette: 'rgba(0,0,0,0.25)', paper: '#e9ecef'},
  notebook: {font: marker, text: '#111111', accent: '#111111', stroke: 'transparent', tagBg: '#ffe14d', tagText: '#111111',
             panel: 'rgba(0,0,0,0)', vignette: 'rgba(0,0,0,0.0)', paper: '#fbfaf5'},
  cinematic: {font: anton, text: '#ffffff', accent: '#ffcc33', stroke: '#000000', tagBg: '#111111', tagText: '#ffcc33',
              panel: 'rgba(0,0,0,0)', vignette: 'rgba(0,0,0,0.55)', paper: '#222222'},
} as const;

export type ThumbProps = {
  width: number;
  height: number;
  style: keyof typeof STYLES;
  background?: string;      // file in public/ (artwork with NO text in it)
  subject?: string;         // optional cut-out PNG in public/ (foreground layer, gives depth)
  subjectSide?: 'left' | 'right';
  headline: string[];       // 1–3 short lines, 2–5 words total
  accent?: string;          // the one word drawn in the accent colour
  tag?: string;             // date / label tag
};

export const defaultProps: ThumbProps = {
  width: 1280, height: 720, style: 'cinematic', headline: ['HEADLINE', 'GOES HERE'], accent: 'HERE', tag: '1812',
};

export const Thumb: React.FC<ThumbProps> = (p) => {
  const s = STYLES[p.style] ?? STYLES.cinematic;
  const vertical = p.height > p.width;
  const textSide = p.subjectSide === 'left' ? 'right' : 'left';
  // Type scale tuned so the longest line still reads at ~168 px wide (mobile suggestion size).
  const longest = Math.max(...p.headline.map((l) => l.length), 4);
  const base = vertical ? 1080 / Math.max(longest, 6) * 1.45 : 640 / Math.max(longest, 5) * 1.55;
  const size = Math.min(base, vertical ? 230 : 150) * (p.style === 'notebook' ? 0.82 : 1);
  const accent = (p.accent ?? '').toUpperCase();

  const lineEl = (line: string, i: number) => (
    <div key={i} style={{lineHeight: p.style === 'notebook' ? 1.22 : 1.0, whiteSpace: 'nowrap'}}>
      {line.split(' ').map((w, j) => (
        <span key={j} style={{color: accent && w.toUpperCase().replace(/[^A-Z0-9']/g, '') === accent.replace(/[^A-Z0-9']/g, '') ? s.accent : s.text,
          ...(p.style === 'notebook' && accent && w.toUpperCase() === accent ? {background: '#ffe14d', padding: '0 0.08em'} : {})}}>
          {w}{j < line.split(' ').length - 1 ? ' ' : ''}
        </span>
      ))}
    </div>
  );

  return (
    <AbsoluteFill style={{backgroundColor: s.paper, overflow: 'hidden'}}>
      {/* Background layer */}
      {p.background ? <Img src={staticFile(p.background)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : null}
      {p.style === 'notebook' && !p.background ? (
        <AbsoluteFill style={{backgroundImage: 'radial-gradient(#c9c6bb 1.6px, transparent 1.6px)', backgroundSize: '28px 28px'}} />
      ) : null}
      {/* Middle ground: directional vignette that separates text from art */}
      <AbsoluteFill style={{background: vertical
        ? `linear-gradient(180deg, ${s.vignette} 0%, rgba(0,0,0,0) 38%, rgba(0,0,0,0) 70%, ${s.vignette} 100%)`
        : `linear-gradient(${textSide === 'left' ? '90deg' : '270deg'}, ${s.vignette} 0%, rgba(0,0,0,0) 62%)`}} />
      {/* Foreground subject */}
      {p.subject ? (
        <Img src={staticFile(p.subject)} style={{position: 'absolute', bottom: vertical ? 400 : 0,
          [p.subjectSide ?? 'right']: vertical ? '50%' : 0, transform: vertical ? 'translateX(50%)' : undefined,
          height: vertical ? '52%' : '100%', filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.55))'}} />
      ) : null}
      {/* Text block: left on 16:9, top on 9:16; bottom ~400 px stays clear on 9:16 for the Shorts overlay */}
      <div style={{position: 'absolute', top: vertical ? 110 : undefined, bottom: vertical ? undefined : 56,
        [textSide]: vertical ? 60 : 56, right: vertical ? 60 : undefined, maxWidth: vertical ? undefined : '60%',
        fontFamily: s.font, fontSize: size, textTransform: 'uppercase', letterSpacing: p.style === 'archive' ? 0 : 1,
        WebkitTextStroke: s.stroke !== 'transparent' ? `${Math.round(size / 28)}px ${s.stroke}` : undefined,
        paintOrder: 'stroke fill', textShadow: s.stroke !== 'transparent' ? '0 6px 18px rgba(0,0,0,0.6)' : undefined,
        background: s.panel, padding: p.style === 'archive' ? '28px 34px' : 0, textAlign: vertical ? 'center' : 'left'}}>
        {p.tag ? (
          <div style={{display: 'inline-block', fontFamily: p.style === 'archive' ? plexMono : anton, fontSize: size * 0.32,
            color: s.tagText, background: s.tagBg, padding: '6px 16px', marginBottom: 14, WebkitTextStroke: '0px', textShadow: 'none',
            letterSpacing: 2}}>{p.tag}</div>
        ) : null}
        {p.headline.map(lineEl)}
      </div>
    </AbsoluteFill>
  );
};
