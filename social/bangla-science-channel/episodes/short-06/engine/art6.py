"""Short 6 art (chiruni-chumbok, static electricity): courtyard (Short 3) + table, paper bits, comb, magnet, pins,
water drum with tap, straight/bent water stream, hair close-up with electrons, puzzle card. All SVG strings."""
import math, random, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "p5"))
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "s3"))
import art as A
import art3 as A3
from art import svg, T, O, INK
SKIN, SKIN_S = A.SKIN, A.SKIN_S

def bg():
    return A3.courtyard_bg()

def table():
    """Small wooden table (front view), top surface at y=40 of the svg."""
    return svg(300, 260, f'<rect x="10" y="30" width="280" height="30" rx="6" fill="#A0784A" stroke="{O}" stroke-width="5"/>'
                         f'<rect x="10" y="24" width="280" height="14" rx="5" fill="#B88D5A" stroke="{O}" stroke-width="4"/>'
                         f'<path d="M40 60 L32 250 M260 60 L268 250" stroke="{O}" stroke-width="16"/><path d="M40 60 L32 250 M260 60 L268 250" stroke="#8A6640" stroke-width="9"/>'
                         f'<path d="M36 170 H264" stroke="#6E5032" stroke-width="7"/>')

def bit(k):
    """One torn notebook-paper bit (k picks the shape)."""
    r = random.Random(k)
    pts = [(r.randint(0, 6), r.randint(0, 6)), (r.randint(24, 32), r.randint(0, 5)), (r.randint(26, 34), r.randint(18, 26)), (r.randint(0, 8), r.randint(20, 28))]
    d = "M" + " L".join(f"{x+3} {y+3}" for x, y in pts) + "Z"
    return svg(42, 36, f'<path d="{d}" fill="#FFFFFF" stroke="#8A8A8A" stroke-width="1.5"/><path d="M6 14 H34" stroke="#9CC3E6" stroke-width="2"/>')

def comb(w=260, col="#2E7BD1"):
    h = w * 0.28; n = 22
    teeth = "".join(f'<rect x="{w*0.06 + i*(w*0.88/n):.1f}" y="{h*0.42:.1f}" width="{w*0.88/n*0.55:.1f}" height="{h*0.55:.1f}" rx="2" fill="{col}" stroke="#1A3E6E" stroke-width="1.5"/>' for i in range(n))
    return svg(w, h, teeth + f'<rect x="0" y="0" width="{w}" height="{h*0.46:.1f}" rx="{h*0.2:.1f}" fill="{col}" stroke="#1A3E6E" stroke-width="3"/>'
                     f'<rect x="{w*0.05}" y="{h*0.08:.1f}" width="{w*0.9}" height="{h*0.1:.1f}" rx="3" fill="#FFFFFF" opacity=".35"/>')

def magnet(w=150):
    h = w * 1.05
    return svg(w, h, f'<path d="M{w*0.12} {h} V{h*0.45} A{w*0.38} {w*0.38} 0 0 1 {w*0.88} {h*0.45} V{h} H{w*0.62} V{h*0.45} A{w*0.12} {w*0.12} 0 0 0 {w*0.38} {h*0.45} V{h}Z" fill="#D7263D" stroke="{O}" stroke-width="5"/>'
                     f'<rect x="{w*0.12}" y="{h*0.82}" width="{w*0.26}" height="{h*0.18}" fill="#C9CED4" stroke="{O}" stroke-width="4"/><rect x="{w*0.62}" y="{h*0.82}" width="{w*0.26}" height="{h*0.18}" fill="#C9CED4" stroke="{O}" stroke-width="4"/>')

def pin(rot=0):
    return svg(70, 70, f'<g transform="rotate({rot} 35 35)"><path d="M8 35 H58" stroke="#5E666E" stroke-width="6"/><path d="M8 35 H58" stroke="#D5DADF" stroke-width="3"/><circle cx="62" cy="35" r="6" fill="#B9C0C7" stroke="#5E666E" stroke-width="2"/></g>')

def _arm_from_top(w, length, fist_y):
    return (f'<path d="M{w/2-24} 0 L{w/2+24} 0 L{w/2+20} {fist_y} L{w/2-20} {fist_y}Z" fill="{SKIN}" stroke="{O}" stroke-width="4"/>'
            f'<path d="M{w/2+8} 0 L{w/2+24} 0 L{w/2+20} {fist_y} L{w/2+10} {fist_y}Z" fill="{SKIN_S}" opacity=".6"/>'
            f'<rect x="{w/2-30}" y="{fist_y-6}" width="60" height="54" rx="20" fill="{SKIN}" stroke="{O}" stroke-width="4"/>'
            f'<path d="M{w/2-18} {fist_y+14} h36 M{w/2-18} {fist_y+28} h36" stroke="{SKIN_S}" stroke-width="4"/>')

def hand_comb(col="#2E7BD1"):
    """Forearm coming down from the top, fist gripping a comb by its spine (comb hangs horizontally under the fist)."""
    W = 300; c = comb(260, col).split(">", 1)[1].rsplit("</svg>", 1)[0]
    return svg(W, 470, _arm_from_top(W, 470, 360) + f'<g transform="translate(20 392)">{c}</g>' + _arm_fist_front(W, 360))

def _arm_fist_front(W, fy):
    return f'<path d="M{W/2-30} {fy+30} q30 14 60 0" fill="none" stroke="{O}" stroke-width="4"/>'

def hand_magnet():
    W = 200; m = magnet(150).split(">", 1)[1].rsplit("</svg>", 1)[0]
    return svg(W, 600, _arm_from_top(W, 600, 380) + f'<g transform="translate(25 420)">{m}</g>')

def drum_tap():
    """Blue water drum on a brick stand with a brass tap on its left side; the tap mouth is at (62, 360) in the svg."""
    b = (f'<rect x="40" y="430" width="230" height="170" fill="#B5643A" stroke="{O}" stroke-width="5"/>'
         + "".join(f'<path d="M40 {y} H270" stroke="#8A4628" stroke-width="3"/>' for y in (475, 520, 565))
         + f'<rect x="60" y="80" width="190" height="350" rx="26" fill="#2F6FB5" stroke="{O}" stroke-width="5"/>'
         f'<path d="M60 150 H250 M60 360 H250" stroke="#24578E" stroke-width="6"/><ellipse cx="155" cy="82" rx="95" ry="18" fill="#3E84CC" stroke="{O}" stroke-width="5"/>'
         f'<rect x="80" y="100" width="22" height="300" rx="10" fill="#FFFFFF" opacity=".18"/>'
         f'<path d="M62 330 H20 V352" fill="none" stroke="{O}" stroke-width="18"/><path d="M62 330 H20 V352" fill="none" stroke="#D9A93A" stroke-width="10"/>'
         f'<rect x="28" y="310" width="16" height="22" rx="4" fill="#D9A93A" stroke="{O}" stroke-width="3"/>')
    return svg(300, 610, b)

def bucket():
    return svg(170, 150, f'<path d="M12 20 L158 20 L140 146 L30 146Z" fill="#9AA4AE" stroke="{O}" stroke-width="5"/>'
                         f'<ellipse cx="85" cy="20" rx="73" ry="14" fill="#5D9FB0" stroke="{O}" stroke-width="5"/><path d="M30 60 H140" stroke="#7E8890" stroke-width="4"/>')

def stream(bend=0.0, L=520, w=180):
    """Thin water stream falling from the top-centre; bend>0 pulls its middle and bottom toward the left (toward the comb)."""
    x0 = w * 0.62; dx = -bend * 95
    d = f"M{x0} 0 C{x0} {L*0.35} {x0+dx} {L*0.55} {x0+dx*0.9} {L}"
    hl = f"M{x0-3} 6 C{x0-3} {L*0.35} {x0+dx-3} {L*0.55} {x0+dx*0.9-3} {L-6}"
    return svg(w, L, f'<path d="{d}" fill="none" stroke="#5FA6C8" stroke-width="16" stroke-linecap="round"/>'
                     f'<path d="{d}" fill="none" stroke="#BFE6F5" stroke-width="9" stroke-linecap="round"/>'
                     f'<path d="{hl}" fill="none" stroke="#FFFFFF" stroke-width="3" opacity=".8"/>')

def hair_panel():
    """Close-up: a patch of black hair (wavy strands) seen from the side, for the comb-rub demonstration."""
    r = random.Random(4); s = ""
    for k in range(34):
        x = 40 + k * 28 + r.randint(-6, 6)
        s += f'<path d="M{x} 0 C{x+r.randint(-30,30)} 120 {x+r.randint(-30,30)} 240 {x+r.randint(-20,20)} 380" fill="none" stroke="#1E1A1C" stroke-width="{r.randint(7,11)}"/>'
        s += f'<path d="M{x+3} 10 C{x+r.randint(-20,20)} 120 {x+r.randint(-20,20)} 220 {x+r.randint(-10,10)} 360" fill="none" stroke="#4A4248" stroke-width="2" opacity=".6"/>'
    return svg(1040, 400, f'<rect width="1040" height="400" rx="30" fill="#E9C9A6"/>{s}')

def electron():
    return svg(60, 60, f'<circle cx="30" cy="30" r="24" fill="#FFD23F" stroke="{O}" stroke-width="4"/>' + T(30, 44, 44, "−", INK, "Baloo"))

def plus():
    return svg(46, 46, f'<circle cx="23" cy="23" r="18" fill="#F4A6A6" stroke="{O}" stroke-width="3"/>' + T(23, 34, 32, "+", INK, "Baloo"))

def puzzle_card():
    c = comb(300).split(">", 1)[1].rsplit("</svg>", 1)[0]
    b = (f'<g transform="translate(70 200) rotate(-90 150 42)">{c}</g><g transform="translate(560 200) rotate(-90 150 42)">{c}</g>'
         + T(410, 300, 150, "?", "#D7263D", "Baloo"))
    return svg(820, 520, b)

def _inner(s): return s.split(">", 1)[1].rsplit("</svg>", 1)[0]

def comb_bits(n=5, w=260):
    """Comb with paper bits stuck under its teeth."""
    h = w * 0.28; b = _inner(comb(w))
    for k in range(n):
        x = w * 0.08 + k * w * 0.18; y = h * 0.88 + (k % 2) * 8
        b += f'<g transform="translate({x:.0f} {y:.0f}) rotate({(k*37)%40-20} 20 18)">{_inner(bit(k))}</g>'
    return svg(w + 20, h + 50, b)

def comb_charged(w=300):
    h = w * 0.28; b = _inner(comb(w))
    for k in range(5):
        x = w * 0.12 + k * w * 0.19
        b += f'<g transform="translate({x:.0f} {h*0.5:.0f}) scale(.6)">{_inner(electron())}</g>'
    return svg(w, h + 20, b)

def magnet_pins(w=150):
    h = w * 1.05; b = _inner(magnet(w))
    for k, (x, rot) in enumerate(((w*0.25 - 35, 80), (w*0.75 - 35, 100), (w*0.75 - 10, 70))):
        b += f'<g transform="translate({x:.0f} {h - 12 + k*4:.0f})">{_inner(pin(rot))}</g>'
    return svg(w + 40, h + 70, b)

def table_strip():
    """Screen-layer table top with paper bits lying on it (for the demonstration)."""
    b = f'<rect x="0" y="60" width="900" height="70" rx="10" fill="#B88D5A" stroke="{O}" stroke-width="5"/>'
    return svg(900, 140, b)
