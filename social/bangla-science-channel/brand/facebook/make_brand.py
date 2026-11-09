"""Facebook page cover (1640x624) and profile picture (1080x1080) for Scientific Bithi, from the episode character rigs."""
import json, sys
from pathlib import Path
S = Path(sys.argv[1]); OUT = S / "brand"
sys.path.insert(0, str(S / "s3")); import art3 as X
chars = json.loads((S / "chars/chars3.json").read_text())
fonts = (S / "p5/fonts.css").read_text()

# pose: {name: [uL, uR, fL, fR, head]}; handOpen on raised arms
POSE_JS = """
function pose(id, p) {
  const r = document.getElementById(id);
  const P = el => el.getAttribute('data-p').split(',').map(Number);
  const rot = (cls, a) => { const e = r.querySelector('.' + cls); if (e) { const [x, y] = P(e); e.setAttribute('transform', `rotate(${a} ${x} ${y})`); } };
  rot('armL', p[0]); rot('armR', p[1]); rot('foreL', p[2]); rot('foreR', p[3]); rot('head', p[4] || 0);
  r.querySelectorAll('.mouths > *').forEach(m => m.style.display = m.classList.contains('m-smile') ? '' : 'none');
  r.querySelectorAll('.eyes-closed').forEach(e => e.style.display = 'none');
  const b = r.querySelector('.brows'); if (b) b.setAttribute('transform', 'translate(0,-3)');
  [['foreL', p[0] > 60], ['foreR', p[1] < -60]].forEach(([c, open]) => { const f = r.querySelector('.' + c); if (!f) return;
    const o = f.querySelector('.handOpen'), rl = f.querySelector('.handRelax'); if (o) o.style.display = open ? '' : 'none'; if (rl) rl.style.display = open ? 'none' : ''; });
}
"""
def ch(id_, name, x, y, s, flip=False):
    """Character with feet at (x, y). Feet sit near svg y=846 inside a viewBox starting at -60."""
    svg = chars[name]; w = int(svg.split('width="')[1].split('"')[0]); h = int(svg.split('height="')[1].split('"')[0])
    return (f'<div id="{id_}" style="position:absolute;left:{x - w / 2}px;top:{y - 906}px;width:{w}px;height:{h}px;'
            f'transform-origin:{w/2}px 906px;transform:scale({s}){" scaleX(-1)" if flip else ""}">{svg}</div>')

DOODLES = ''.join([
  '<g fill="none" stroke="#FFFFFF" stroke-width="5" opacity=".55">',
  '<g transform="translate(150 120)"><ellipse rx="60" ry="22"/><ellipse rx="60" ry="22" transform="rotate(60)"/><ellipse rx="60" ry="22" transform="rotate(-60)"/><circle r="8" fill="#fff"/></g>',
  '<g transform="translate(1520 110)"><path d="M-22 -40 V-5 L-48 45 H48 L22 -5 V-40 Z"/><path d="M-34 20 H34"/></g>',
  '<g transform="translate(1180 70)"><circle r="22"/><path d="M0 -40 V-30 M0 30 V40 M-40 0 H-30 M30 0 H40 M-28 -28 l7 7 M21 21 l7 7 M28 -28 l-7 7 M-21 21 l-7 7"/></g>',
  '<g transform="translate(90 330)"><path d="M0 0 q20 -40 0 -80 q-20 40 0 80 M0 0 v30"/></g>',
  '<g transform="translate(1580 330)"><path d="M-30 -20 q30 -40 60 0 M-30 -20 v30 M30 -20 v30"/><path d="M-40 10 h20 M20 10 h20"/></g>',
  '</g>'])

def page(w, h, body, js=""):
    return (f'<!doctype html><html><head><meta charset="utf-8"><style>{fonts} html,body{{margin:0;width:{w}px;height:{h}px;overflow:hidden}}'
            f' svg{{overflow:visible}} .stage{{position:relative;width:{w}px;height:{h}px;overflow:hidden}}</style></head>'
            f'<body><div class="stage">{body}</div><script>{POSE_JS}{js}</script></body></html>')

# ---------- cover 1640x624; mobile shows roughly x 265-1375, so text and characters stay inside that band
plant = X.plant(0)
cover = (
  '<svg width="1640" height="624" style="position:absolute;left:0;top:0"><defs>'
  '<linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7EC8F0"/><stop offset="1" stop-color="#D9F1FF"/></linearGradient></defs>'
  '<rect width="1640" height="624" fill="url(#sk)"/>'
  f'{DOODLES}'
  '<circle cx="1350" cy="120" r="70" fill="#FFE27A" opacity=".9"/>'
  '<path d="M0 470 Q300 400 620 450 T1240 440 T1640 430 V624 H0Z" fill="#9CCB6A"/>'
  '<path d="M0 520 Q400 480 820 515 T1640 505 V624 H0Z" fill="#7FB052"/>'
  '</svg>'
  f'<div style="position:absolute;left:1470px;top:520px;transform:translate(-50%,-50%) scale(.55)">{plant}</div>'
  # title block
  '<div style="position:absolute;left:262px;top:160px;width:600px;text-align:center;white-space:nowrap">'
  '<div style="display:inline-block;background:#1A1A1A;border-radius:26px;padding:6px 34px 0;border:6px solid #3A2416;box-shadow:8px 10px 0 rgba(0,0,0,.18)">'
  '<span style="font:800 84px/1.35 Baloo;color:#FFC300;-webkit-text-stroke:0;paint-order:stroke;text-shadow:0 5px 0 #D7263D">সাইন্টিফিক বিথী</span></div>'
  '<div style="font:800 50px/1.2 Baloo;color:#1A1A1A;margin-top:16px;letter-spacing:2px">Scientific Bithi</div>'
  '<div style="display:inline-block;margin-top:14px;background:#F72585;color:#fff;border-radius:16px;padding:4px 28px 0;font:700 40px/1.5 Hind;border:4px solid #3A2416">হাসতে হাসতে বিজ্ঞান শিখি</div>'
  '</div>'
  + ch("mama", "Montu Mama", 972, 640, .5) + ch("boltu", "Boltu", 1245, 640, .54) + ch("bithi", "Bithi", 1108, 640, .5))
cover_js = "pose('mama',[0,-20,-6,40,-4]);pose('bithi',[0,-155,-6,-20,3]);pose('boltu',[0,-125,-6,-35,-3]);"
(OUT / "cover.html").write_text(page(1640, 624, cover, cover_js), encoding="utf-8")

# ---------- profile 1080x1080 (shown as a circle): Bithi's head and shoulders, waving
prof = (
  '<svg width="1080" height="1080" style="position:absolute;left:0;top:0">'
  '<rect width="1080" height="1080" fill="#FFC300"/>'
  '<circle cx="540" cy="540" r="470" fill="#FFD84D"/>'
  '<g fill="none" stroke="#fff" stroke-width="10" opacity=".7">'
  '<g transform="translate(220 260)"><ellipse rx="80" ry="30"/><ellipse rx="80" ry="30" transform="rotate(60)"/><ellipse rx="80" ry="30" transform="rotate(-60)"/><circle r="12" fill="#fff"/></g>'
  '<g transform="translate(230 560)"><path d="M-26 -50 V-6 L-58 56 H58 L26 -6 V-50 Z"/><path d="M-40 26 H40"/></g></g>'
  '</svg>'
  + ch("bithi", "Bithi", 540, 2080, 2.0))
(OUT / "profile.html").write_text(page(1080, 1080, prof, "pose('bithi',[0,-150,-6,-25,4]);"), encoding="utf-8")
print("ok")
