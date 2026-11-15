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

export const Root: React.FC = () => (
  <>
    <Still id="Banner" component={Banner} width={2560} height={1440} />
    <Still id="Profile" component={Profile} width={800} height={800} />
    <Still id="Thumb" component={Thumb} width={1080} height={1920} />
  </>
);
