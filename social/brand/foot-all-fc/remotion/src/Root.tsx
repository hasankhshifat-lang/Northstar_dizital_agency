import React from 'react';
import { Composition, Still, AbsoluteFill, Img, staticFile, continueRender, delayRender } from 'remotion';

const INK = '#2B2219', RED = '#C8463A';
const fontReady = (() => {
  const h = delayRender('fonts');
  const faces = [new FontFace('Lilita One', `url(${staticFile('LilitaOne-400.woff2')})`), new FontFace('IM Fell English SC', `url(${staticFile('IMFellEnglishSC-400.woff2')})`)];
  Promise.all(faces.map(f => f.load())).then(fs => { fs.forEach(f => (document.fonts as any).add(f)); continueRender(h); });
  return true;
})();

const Name: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ fontFamily: 'Lilita One', fontSize: size, lineHeight: 1, color: INK, letterSpacing: size * 0.02, whiteSpace: 'nowrap' }}>
    FOOT ALL <span style={{ color: RED }}>FC</span>
  </div>
);

// 2560 x 1440: the name card sits inside the centre strip every device shows (1546 x 423)
const Banner: React.FC = () => (
  <AbsoluteFill>
    <Img src={staticFile('banner-art.jpg')} />
    <div style={{ position: 'absolute', left: 1030, top: 560, width: 640, height: 300, transform: 'rotate(-0.69deg)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Name size={110} />
      <div style={{ width: 440, height: 3, background: INK, margin: '18px 0 14px' }} />
      <div style={{ fontFamily: 'IM Fell English SC', fontSize: 36, color: INK, whiteSpace: 'nowrap' }}>True football stories, cut from paper</div>
    </div>
  </AbsoluteFill>
);

// 800 x 800, shown as a circle: the name on the cream slip under the face
const Profile: React.FC = () => (
  <AbsoluteFill>
    <Img src={staticFile('profile-art.jpg')} />
    <div style={{ position: 'absolute', left: 150, top: 600, width: 500, height: 120, transform: 'rotate(-1.15deg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Name size={84} />
    </div>
  </AbsoluteFill>
);

// 1080 x 1920 Short thumbnail: heading at the top, the action in the middle, bottom ~400 px kept clear
const Thumb: React.FC = () => (
  <AbsoluteFill>
    <Img src={staticFile('thumb-art.jpg')} />
    <div style={{ position: 'absolute', left: 0, top: 120, width: 1080, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'rotate(-1.5deg)' }}>
      <div style={{ fontFamily: 'Lilita One', fontSize: 132, lineHeight: 1.0, color: INK, whiteSpace: 'nowrap' }}>IT WAS OVER…</div>
      <div style={{ fontFamily: 'Lilita One', fontSize: 184, lineHeight: 1.0, color: RED, whiteSpace: 'nowrap', marginTop: 6 }}>RIGHT?</div>
    </div>
  </AbsoluteFill>
);


// Per-video Short thumbnails (same layout as Thumb): art from the film's engine (index.html?brand=thumb), heading as live text
const ThumbH: React.FC<{ art: string; l1: string; l2: string; s1: number; s2: number }> = ({ art, l1, l2, s1, s2 }) => (
  <AbsoluteFill>
    <Img src={staticFile(art)} />
    <div style={{ position: 'absolute', left: 0, top: 130, width: 1080, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'rotate(-1.5deg)' }}>
      <div style={{ fontFamily: 'Lilita One', fontSize: s1, lineHeight: 1.0, color: INK, whiteSpace: 'nowrap' }}>{l1}</div>
      <div style={{ fontFamily: 'Lilita One', fontSize: s2, lineHeight: 1.0, color: RED, whiteSpace: 'nowrap', marginTop: 6 }}>{l2}</div>
    </div>
  </AbsoluteFill>
);

// Short thumbnail built around a square art panel (art generated in Figma with gpt-image-2.5-flare, no text in it);
// heading, scoreboard and slip are live text. Used when the film has no engine to render a thumb still from.
const ThumbPanel: React.FC<{ art: string; l1: string; l2: string; s1: number; s2: number; score: string; slip: string }> = ({ art, l1, l2, s1, s2, score, slip }) => (
  <AbsoluteFill style={{ background: '#7A6B5A' }}>
    <div style={{ position: 'absolute', left: 22, top: 22, width: 1036, height: 1876, background: '#EDE3CF' }} />
    <div style={{ position: 'absolute', left: 0, top: 130, width: 1080, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'rotate(-1.5deg)' }}>
      <div style={{ fontFamily: 'Lilita One', fontSize: s1, lineHeight: 1.0, color: INK, whiteSpace: 'nowrap' }}>{l1}</div>
      <div style={{ fontFamily: 'Lilita One', fontSize: s2, lineHeight: 1.0, color: RED, whiteSpace: 'nowrap', marginTop: 6 }}>{l2}</div>
    </div>
    <div style={{ position: 'absolute', left: 54, top: 540, width: 972, height: 972, border: `8px solid ${INK}`, boxSizing: 'border-box', overflow: 'hidden' }}>
      <Img src={staticFile(art)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      {/* score on the blank scoreboard panel of the art */}
      <div style={{ position: 'absolute', left: 600, top: 70, width: 340, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'IM Fell English SC', fontSize: 150, color: INK, whiteSpace: 'nowrap' }}>{score}</div>
    </div>
    <div style={{ position: 'absolute', left: 90, top: 1420, padding: '14px 34px', background: '#F1E8D4', border: `3px dashed ${INK}`,
      transform: 'rotate(1.2deg)', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', fontFamily: 'IM Fell English SC', fontSize: 66, color: INK, whiteSpace: 'nowrap' }}>{slip}</div>
  </AbsoluteFill>
);

export const Root: React.FC = () => (
  <>
    <Still id="Banner" component={Banner} width={2560} height={1440} />
    <Still id="Profile" component={Profile} width={800} height={800} />
    <Still id="Thumb" component={Thumb} width={1080} height={1920} />
    <Still id="ThumbLeicester" component={ThumbH as any} width={1080} height={1920} defaultProps={{ art: 'thumb-art-leicester-5000-short.jpg', l1: 'BOTTOM TO', l2: 'CHAMPIONS', s1: 150, s2: 168 }} />
    <Still id="ThumbIstanbul" component={ThumbPanel as any} width={1080} height={1920} defaultProps={{ art: 'thumb-art-istanbul-2005-short.png', l1: '6 MINUTES', l2: 'LATER…', s1: 170, s2: 200, score: '3 – 3', slip: 'HALF-TIME: 3 – 0' }} />
    <Still id="ThumbMessi" component={ThumbH as any} width={1080} height={1920} defaultProps={{ art: 'thumb-art-messi-napkin-short.jpg', l1: 'TOO SMALL', l2: 'TO PLAY?', s1: 160, s2: 184 }} />
  </>
);
