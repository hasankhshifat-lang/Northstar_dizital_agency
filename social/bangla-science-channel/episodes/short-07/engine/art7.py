"""Short 7 art (straw-bayuchap, air pressure): soft plastic bottle with a sealed lid (crumple 0..1), open glass,
long bendy straws with a sharbat fill fraction, forearm with a pin, air swirls, pressure arrows, section views
for the two demonstrations, Moon puzzle card. All SVG strings."""
import math, random, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "p5"))
import art as A
from art import svg, T, O, INK
SKIN, SKIN_S = A.SKIN, A.SKIN_S
SHARBAT, SHARBAT_D = "#F4C430", "#D99A1E"
STRAW, STRAW_S = "#FFFFFF", "#E63946"

def _inner(s): return s.split(">", 1)[1].rsplit("</svg>", 1)[0]

_CLIP = 0
def bottle_body(w, h, crumple=0.0, level=0.62, hole=False, cap_col="#2E7BD1", section=False):
    """Body path of a 1-litre soft PET bottle, w x h, cap at the top. crumple pinches the walls inward (0..1)."""
    cx = w / 2; bw = w * 0.42; nk = w * 0.16; top = h * 0.12; sh = h * 0.30; bot = h * 0.97
    c = crumple
    # wall points from the shoulder to the base, dents grow with crumple (alternating depth looks crushed)
    ys = [sh + (bot - sh) * k / 6 for k in range(7)]
    dent = [0, 0.55, 0.25, 0.75, 0.3, 0.5, 0]
    R = [(cx + bw - w * 0.30 * c * dent[k], y) for k, y in enumerate(ys)]
    L = [(cx - bw + w * 0.30 * c * dent[(k + 1) % 7] * (1 if k not in (0, 6) else 0), y) for k, y in enumerate(ys)]
    d = (f"M{cx-nk} {top} L{cx+nk} {top} C{cx+nk} {sh*0.8} {cx+bw} {sh*0.8} {R[0][0]} {R[0][1]} "
         + " ".join(f"L{x:.1f} {y:.1f}" for x, y in R[1:]) + f" Q{cx+bw} {bot+h*0.03} {cx} {bot+h*0.02} Q{cx-bw} {bot+h*0.03} {L[-1][0]:.1f} {L[-1][1]:.1f} "
         + " ".join(f"L{x:.1f} {y:.1f}" for x, y in reversed(L[:-1])) + f" C{cx-bw} {sh*0.8} {cx-nk} {sh*0.8} {cx-nk} {top}Z")
    ly = sh + (bot - sh) * (1 - level)
    global _CLIP
    _CLIP += 1; clip = f"bclip{_CLIP}"            # unique per drawing: a clipPath id defined inside a hidden prop doesn't work
    body = (f'<defs><clipPath id="{clip}"><path d="{d}"/></clipPath></defs>'
            f'<path d="{d}" fill="#E8F6FA" opacity=".55"/>'
            f'<rect x="0" y="{ly:.1f}" width="{w}" height="{h}" fill="{SHARBAT}" clip-path="url(#{clip})"/>'
            f'<path d="M0 {ly:.1f} H{w}" stroke="{SHARBAT_D}" stroke-width="{w*0.02:.1f}" clip-path="url(#{clip})"/>'
            f'<path d="{d}" fill="none" stroke="{O}" stroke-width="{w*0.035:.1f}" stroke-linejoin="round"/>'
            f'<path d="M{cx-bw*0.6} {sh+10} L{cx-bw*0.6 + w*0.25*c*0.4} {bot-20}" stroke="#FFFFFF" stroke-width="{w*0.05:.1f}" opacity=".6" stroke-linecap="round"/>'
            f'<rect x="{cx-nk*1.35}" y="{top-h*0.07}" width="{nk*2.7}" height="{h*0.08}" rx="{w*0.03}" fill="{cap_col}" stroke="{O}" stroke-width="{w*0.03:.1f}"/>')
    if hole:
        body += f'<circle cx="{cx+nk*0.8}" cy="{top-h*0.035}" r="{w*0.025}" fill="#1A1A1A"/>'
    return body

def bottle(crumple=0.0, level=0.62, hole=False, w=120, h=300, straw_len=0, fill=0.0):
    """Bottle with the straw going straight up through the lid (straw_len px above the lid; fill = sharbat fraction of the straw)."""
    sw = w * 0.07; top = h * 0.12; H = h + straw_len; oy = straw_len
    sx = w / 2 - w * 0.02
    st = _straw_path(f"M{sx} {oy + h*0.75} L{sx} {oy - 0}", sw, fill)
    return svg(w, H, f'<g transform="translate(0 {oy})">{bottle_body(w, h, crumple, level, hole)}</g>' + st)

def _straw_path(d, sw, fill, inside=None):
    """Striped straw along path d (drawn from the liquid end); the sharbat fill runs along it from the start."""
    s = (f'<path d="{d}" fill="none" stroke="{O}" stroke-width="{sw+5:.1f}" stroke-linecap="round" stroke-linejoin="round"/>'
         f'<path d="{d}" fill="none" stroke="{STRAW}" stroke-width="{sw:.1f}" stroke-linecap="round" stroke-linejoin="round"/>'
         f'<path d="{d}" fill="none" stroke="{STRAW_S}" stroke-width="{sw*0.6:.1f}" stroke-dasharray="3 5" pathLength="100" opacity=".85"/>')
    if fill > 0:
        s += f'<path d="{d}" fill="none" stroke="{SHARBAT}" stroke-width="{sw*0.62:.1f}" pathLength="100" stroke-dasharray="{fill*100:.1f} 200" stroke-linecap="round"/>'
    return s

def bendy_straw(p0, p1, sw=9, fill=0.0, bend=0.55):
    """Full-canvas (1080x1920) straw from p0 (inside the drink, bottom) up to p1 (the mouth), with an elbow bend."""
    x0, y0 = p0; x1, y1 = p1
    ey = y1 + (y0 - y1) * bend * 0.35                 # elbow height
    d = f"M{x0} {y0} L{x0} {ey} Q{x0} {y1} {x1} {y1}"
    return svg(1080, 1920, _straw_path(d, sw, fill))

def glass(level=0.7, w=90, h=120):
    """Open drinking glass of sharbat with an ice cube (straw drawn separately)."""
    ly = h * (1 - level)
    return svg(w, h, f'<path d="M{w*0.06} 3 L{w*0.94} 3 L{w*0.84} {h-3} L{w*0.16} {h-3}Z" fill="#E8F6FA" opacity=".6"/>'
                     f'<path d="M{w*0.06 + (w*0.1)*(ly/h)} {ly} L{w*0.94 - (w*0.1)*(ly/h)} {ly} L{w*0.84} {h-3} L{w*0.16} {h-3}Z" fill="{SHARBAT}"/>'
                     f'<rect x="{w*0.52}" y="{ly+4}" width="{w*0.2}" height="{w*0.2}" rx="4" fill="#E6F7FC" stroke="#9CC3D6" stroke-width="2"/>'
                     f'<path d="M{w*0.06} 3 L{w*0.94} 3 L{w*0.84} {h-3} L{w*0.16} {h-3}Z" fill="none" stroke="{O}" stroke-width="4" stroke-linejoin="round"/>'
                     f'<path d="M{w*0.2} 12 L{w*0.27} {h-14}" stroke="#FFFFFF" stroke-width="5" opacity=".7" stroke-linecap="round"/>')

def glass_cu(level=0.7, fill=0.0, w=330, h=440, straw_len=1100):
    """Close-up glass with a straight straw going up out of the frame."""
    sw = 26; sx = w * 0.46
    st = _straw_path(f"M{sx} {straw_len + h*0.88} L{sx} 0", sw, fill)
    return svg(w, straw_len + h, f'<g transform="translate(0 {straw_len})">{_inner(glass(level, w, h))}</g>' + st)

def _arm_from_top(w, fist_y):
    return (f'<path d="M{w/2-24} 0 L{w/2+24} 0 L{w/2+20} {fist_y} L{w/2-20} {fist_y}Z" fill="{SKIN}" stroke="{O}" stroke-width="4"/>'
            f'<path d="M{w/2+8} 0 L{w/2+24} 0 L{w/2+20} {fist_y} L{w/2+10} {fist_y}Z" fill="{SKIN_S}" opacity=".6"/>'
            f'<rect x="{w/2-30}" y="{fist_y-6}" width="60" height="54" rx="20" fill="{SKIN}" stroke="{O}" stroke-width="4"/>'
            f'<path d="M{w/2-18} {fist_y+14} h36 M{w/2-18} {fist_y+28} h36" stroke="{SKIN_S}" stroke-width="4"/>')

def hand_pin():
    """Forearm from the top, fist holding a sewing pin point-down; the pin tip is at (100, 520) in the svg."""
    W = 200
    pin = (f'<path d="M100 410 L100 520" stroke="#5E666E" stroke-width="7" stroke-linecap="round"/>'
           f'<path d="M100 410 L100 515" stroke="#D5DADF" stroke-width="3"/><circle cx="100" cy="404" r="11" fill="#D7263D" stroke="{O}" stroke-width="3"/>')
    return svg(W, 530, _arm_from_top(W, 350) + pin)

def swirl(k=0):
    r = random.Random(k)
    a = r.uniform(-0.3, 0.3)
    return svg(90, 90, f'<path d="M10 45 C30 {20+r.randint(-8,8)} 60 {70+r.randint(-8,8)} 80 45" fill="none" stroke="#7CC6FE" stroke-width="7" stroke-linecap="round" transform="rotate({a*57} 45 45)"/>'
                       f'<path d="M70 35 L82 45 L68 54" fill="none" stroke="#7CC6FE" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" transform="rotate({a*57} 45 45)"/>')

def arrow(col="#1E5AA8", L=130):
    """Fat pressure arrow pointing DOWN (rotate it as needed)."""
    return svg(70, L, f'<path d="M22 0 H48 V{L-40} H66 L35 {L-2} L4 {L-40} H22Z" fill="{col}" stroke="{O}" stroke-width="4" stroke-linejoin="round"/>')

def air_dot():
    return svg(30, 30, f'<circle cx="15" cy="15" r="11" fill="#BFE6F5" stroke="#4A90B8" stroke-width="3"/>')

def mouth_lips():
    """Cartoon lips around a straw tip (for the section view)."""
    return svg(220, 120, f'<path d="M10 60 Q110 -10 210 60 Q110 130 10 60Z" fill="#C8553D" stroke="{O}" stroke-width="5"/><path d="M40 60 Q110 40 180 60" stroke="#8E2C1E" stroke-width="5" fill="none"/>')

def lock_cap(w=160):
    """Big cap with a red cross (sealed) for the section view."""
    return svg(w, w * 0.6, f'<rect x="6" y="6" width="{w-12}" height="{w*0.6-12}" rx="12" fill="#2E7BD1" stroke="{O}" stroke-width="5"/>'
                         f'<path d="M{w*0.32} {w*0.12} L{w*0.68} {w*0.48} M{w*0.68} {w*0.12} L{w*0.32} {w*0.48}" stroke="#D7263D" stroke-width="10" stroke-linecap="round"/>')

def moon_card():
    """Moon surface with craters, black sky with stars, a glass of sharbat with a straw, and a big '?'."""
    r = random.Random(3)
    stars = "".join(f'<circle cx="{r.randint(10,810)}" cy="{r.randint(10,300)}" r="{r.choice((2,3,4))}" fill="#FFFFFF"/>' for _ in range(40))
    crat = "".join(f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{rx*0.35:.0f}" fill="#9A9AA6" stroke="#6E6E7A" stroke-width="3"/>' for x, y, rx in ((120, 430, 60), (340, 470, 40), (640, 440, 70), (520, 500, 30)))
    g = _inner(glass(0.75, 150, 200))
    st = _straw_path("M420 470 L420 260 Q420 220 470 210", 14, 0.0)
    b = (f'<rect width="820" height="560" rx="30" fill="#141B33"/>{stars}'
         f'<circle cx="680" cy="110" r="55" fill="#4FA3E0" stroke="#FFFFFF" stroke-width="3"/><path d="M650 90 q20 -15 40 5 q10 20 -20 30Z" fill="#5DAF4E"/>'
         f'<path d="M0 380 Q200 340 410 370 T820 360 V530 Q820 560 790 560 H30 Q0 560 0 530Z" fill="#C9C9D3" stroke="{O}" stroke-width="5"/>{crat}'
         f'<g transform="translate(345 300)">{g}</g>{st}' + T(150, 250, 170, "?", "#FFC300", "Baloo"))
    return svg(820, 560, b)
