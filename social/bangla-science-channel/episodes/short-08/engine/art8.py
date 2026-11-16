"""Short 8 art (ayna-ulto: why is AMBULANCE written backwards?): ambulance front with mirror-written text and a
flashing light bar, Boltu's name on a paper sheet (front / back / reflected), the 'fold across the mirror' demo,
a car's rear-view mirror, the A/B puzzle card. All SVG strings (props for the puppet engine)."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "p5"))
import art as A
from art import svg, T, O, INK
SKIN, SKIN_S = A.SKIN, A.SKIN_S
RED, BLUE = "#D7263D", "#1E5AA8"

def _inner(s): return s.split(">", 1)[1].rsplit("</svg>", 1)[0]
def flipx(body, w): return f'<g transform="translate({w} 0) scale(-1 1)">{body}</g>'

def word_ambulance(x, y, fs, mirrored, col=RED):
    """AMBULANCE centred at (x, y); mirrored = written backwards (as painted on an ambulance's front)."""
    t = f'<text x="0" y="0" font-family="Baloo" font-weight="800" font-size="{fs}" fill="{col}" text-anchor="middle" stroke="none" letter-spacing="1">AMBULANCE</text>'
    return f'<g transform="translate({x} {y}) scale({-1 if mirrored else 1} 1)">{t}</g>'

def ambulance_front(light=0, w=320):
    """Front of a white Dhaka ambulance (van), 320x300 units scaled to w. Text painted backwards on the hood band.
    light: 0 = red lamp on, 1 = blue lamp on (swap every ~0.25 s for the flashing bar)."""
    k = w / 320; H = 300
    rl = "#FF3B3B" if light == 0 else "#7A1E1E"; bl = "#3FA9FF" if light == 1 else "#1B3A66"
    glow = (f'<circle cx="{110 if light == 0 else 210}" cy="30" r="46" fill="{"#FF5A5A" if light == 0 else "#5AB8FF"}" opacity=".35"/>')
    b = (glow +
         f'<rect x="95" y="16" width="130" height="26" rx="8" fill="#DDE2E6" stroke="{O}" stroke-width="4"/>'
         f'<rect x="100" y="19" width="58" height="20" rx="6" fill="{rl}"/><rect x="162" y="19" width="58" height="20" rx="6" fill="{bl}"/>'
         f'<path d="M30 60 Q34 40 60 40 L260 40 Q286 40 290 60 L306 240 Q306 262 284 262 L36 262 Q14 262 14 240Z" fill="#F7F7F2" stroke="{O}" stroke-width="5"/>'
         f'<path d="M52 58 L268 58 L282 140 L38 140Z" fill="#2C3E50" stroke="{O}" stroke-width="4"/>'
         f'<path d="M70 66 L120 66 L84 132 L50 132Z" fill="#FFFFFF" opacity=".22"/>'
         f'<rect x="22" y="148" width="276" height="44" rx="6" fill="#FFFFFF" stroke="{O}" stroke-width="3"/>'
         + word_ambulance(160, 183, 40, True) +
         f'<rect x="14" y="196" width="292" height="10" fill="{RED}"/>'
         f'<rect x="100" y="210" width="120" height="34" rx="6" fill="#4A4F55" stroke="{O}" stroke-width="3"/>'
         f'<path d="M151 214 h18 v10 h10 v14 h-10 v4 h-18 v-4 h-10 v-14 h10Z" fill="{RED}" stroke="#FFFFFF" stroke-width="2" transform="translate(0 -2) scale(1)"/>'
         f'<ellipse cx="54" cy="226" rx="26" ry="17" fill="#FFE27A" stroke="{O}" stroke-width="4"/><ellipse cx="266" cy="226" rx="26" ry="17" fill="#FFE27A" stroke="{O}" stroke-width="4"/>'
         f'<rect x="10" y="248" width="300" height="20" rx="8" fill="#9AA3AB" stroke="{O}" stroke-width="4"/>'
         f'<rect x="34" y="266" width="56" height="30" rx="8" fill="#222"/><rect x="230" y="266" width="56" height="30" rx="8" fill="#222"/>'
         f'<rect x="2" y="100" width="18" height="30" rx="5" fill="#4A4F55" stroke="{O}" stroke-width="3"/><rect x="300" y="100" width="18" height="30" rx="5" fill="#4A4F55" stroke="{O}" stroke-width="3"/>')
    return svg(round(w), round(H * k), b, vb=f"0 0 320 {H}")

def ambulance_reflected(light=0, w=320):
    """The same ambulance as seen in a mirror: the whole picture flipped, so its backwards text reads correctly."""
    s = ambulance_front(1 - light, w)       # the lamps swap sides in the reflection too
    return s.replace('<g stroke-linejoin', '<g transform="translate(320 0) scale(-1 1)" stroke-linejoin', 1)

def _paper_body(w, h, text, back=False):
    b = (f'<rect x="4" y="4" width="{w-8}" height="{h-8}" rx="6" fill="{"#EFE8D8" if back else "#FFFFFF"}" stroke="{O}" stroke-width="4"/>')
    if back:   # the writing shows faintly through the back of the sheet (backwards)
        b += f'<g opacity=".18">' + flipx(T(w / 2, h * 0.66, h * 0.5, text, "#1E3A8A", "Atma"), w) + '</g>'
    else:
        b += "".join(f'<path d="M20 {h*0.25 + i*h*0.22:.0f} H{w-20}" stroke="#BFD4EA" stroke-width="2"/>' for i in range(4))
        b += T(w / 2, h * 0.66, h * 0.5, text, "#1E3A8A", "Atma")
    return b

def paper(text="বল্টু", w=300, h=190, back=False, mirrored=False):
    b = _paper_body(w, h, text, back)
    return svg(w, h, flipx(b, w) if mirrored else b)

def hand_holding(w=300, h=190, side="right", skin=SKIN):
    """A child's hand gripping the lower corner of a sheet (drawn on top of the sheet). Paper coordinates."""
    x = w - 50 if side == "right" else 50
    return (f'<path d="M{x-6} {h+120} L{x-30} {h-10} Q{x-30} {h-40} {x} {h-42} Q{x+32} {h-40} {x+30} {h-8} L{x+40} {h+120}Z" fill="{skin}" stroke="{O}" stroke-width="4"/>'
            f'<path d="M{x-30} {h-26} Q{x-46} {h-34} {x-40} {h-56} Q{x-30} {h-64} {x-16} {h-44}" fill="{skin}" stroke="{O}" stroke-width="4"/>'
            f'<path d="M{x-12} {h-36} h28 M{x-12} {h-22} h28" stroke="{SKIN_S}" stroke-width="3"/>')

def paper_in_hand(text="বল্টু", w=360, h=230, back=False):
    """Close-up: Boltu's hand from below holding the sheet up (front readable, or its back)."""
    return svg(w, h + 120, _paper_body(w, h, text, back) + hand_holding(w, h))

def mirror_panel(w, h, inner, sheen=True):
    """Content seen INSIDE the mirror glass (w x h), clipped, with a soft glass sheen on top."""
    cid = f"mp{abs(hash(inner)) % 10**8}"
    b = (f'<defs><clipPath id="{cid}"><rect x="0" y="0" width="{w}" height="{h}"/></clipPath></defs>'
         f'<g clip-path="url(#{cid})">{inner}</g>')
    if sheen:
        b += (f'<path d="M{w*0.08} {h} L{w*0.42} 0 L{w*0.52} 0 L{w*0.18} {h}Z" fill="#FFFFFF" opacity=".16"/>'
              f'<path d="M{w*0.6} {h} L{w*0.86} 0 L{w*0.9} 0 L{w*0.64} {h}Z" fill="#FFFFFF" opacity=".12"/>')
    return svg(w, h, b)

def fold_word(kind, phase, w=900, h=360):
    """The 'fold across the mirror' demo. kind 'name' (বল্টু) or 'amb' (AMBULANCE backwards -> forwards).
    phase 0..1: the right copy swings over the dashed mirror line (scaleX from +1 to -1 about it)."""
    mid = w / 2
    if kind == "name":
        left = T(mid / 2, h * 0.62, 120, "বল্টু", "#1E3A8A", "Atma")
        word = T(0, 0, 120, "বল্টু", "#1E3A8A", "Atma")
    else:
        left = word_ambulance(mid / 2, h * 0.6, 62, True)
        word = word_ambulance(0, 0, 62, True)
    sx = 1 - 2 * phase                             # +1 (copy) .. -1 (mirror image)
    # the moving copy starts on the LEFT side position and swings about the mirror line to the right
    right = f'<g transform="translate({mid} {h*0.62 if kind=="name" else h*0.6}) scale({sx:.3f} 1) translate({-mid/2} 0)">{word}</g>'
    b = (f'<rect x="10" y="10" width="{mid-30}" height="{h-20}" rx="18" fill="#FFFFFF" stroke="{O}" stroke-width="4"/>'
         f'<rect x="{mid+20}" y="10" width="{mid-30}" height="{h-20}" rx="18" fill="#E6F3F8" stroke="{O}" stroke-width="4"/>'
         f'<path d="M{mid} 0 V{h}" stroke="#4A90B8" stroke-width="8" stroke-dasharray="20 14"/>' + left)
    if phase > 0: b += f'<g opacity="{min(1, phase*3):.2f}">{right}</g>'
    return svg(w, h, b)

def rearview(inner_svg_body, w=760, h=260):
    """A car's rear-view mirror (rounded) with what it shows inside, plus its stem from the windshield top."""
    cid = "rv"
    return svg(w, h + 80, f'<rect x="{w/2-22}" y="0" width="44" height="90" rx="12" fill="#3B3F44" stroke="{O}" stroke-width="4"/>'
                          f'<defs><clipPath id="{cid}"><rect x="20" y="70" width="{w-40}" height="{h-20}" rx="60"/></clipPath></defs>'
                          f'<rect x="8" y="58" width="{w-16}" height="{h+4}" rx="72" fill="#2B2F33" stroke="{O}" stroke-width="5"/>'
                          f'<g clip-path="url(#{cid})"><rect x="20" y="70" width="{w-40}" height="{h-20}" fill="#9CC9E0"/>{inner_svg_body}</g>'
                          f'<path d="M{w*0.18} {h+40} L{w*0.34} 80" stroke="#FFFFFF" stroke-width="16" opacity=".18"/>')

def dashboard():
    """Inside of the car ahead: dashboard and steering wheel silhouette across the bottom of the screen."""
    return svg(1080, 700, f'<path d="M0 260 Q540 150 1080 260 V700 H0Z" fill="#33383E" stroke="{O}" stroke-width="5"/>'
                          f'<path d="M0 300 Q540 200 1080 300" stroke="#4A5058" stroke-width="10" fill="none"/>'
                          f'<circle cx="300" cy="560" r="210" fill="none" stroke="#1F2327" stroke-width="44"/>'
                          f'<circle cx="300" cy="560" r="48" fill="#1F2327"/><path d="M300 560 L120 600 M300 560 L480 600" stroke="#1F2327" stroke-width="36"/>')

def letter_card(ch, w=260, h=300, mirrored=False, col="#7A4FB5"):
    t = T(w / 2, h * 0.76, h * 0.8, ch, col, "Baloo")
    return svg(w, h, f'<rect x="6" y="6" width="{w-12}" height="{h-12}" rx="22" fill="#FFFFFF" stroke="{O}" stroke-width="5"/>' + (flipx(t, w) if mirrored else t))

def puzzle_card():
    """A and B standing in front of a small mirror, '?' marks (answer not shown)."""
    b = (f'<rect x="0" y="0" width="900" height="560" rx="30" fill="#FFF6E0" stroke="{O}" stroke-width="5"/>'
         f'<rect x="590" y="60" width="270" height="440" rx="16" fill="#C9E3EE" stroke="#E8B64C" stroke-width="16"/>'
         f'<path d="M640 480 L760 80 L800 80 L680 480Z" fill="#FFFFFF" opacity=".35"/>'
         + f'<g transform="translate(70 120)">{_inner(letter_card("A", 200, 230))}</g>'
         + f'<g transform="translate(310 120)">{_inner(letter_card("B", 200, 230, col="#1E5AA8"))}</g>'
         + T(725, 330, 210, "?", "#D7263D", "Baloo")
         + T(270, 440, 46, "আয়নায় কোনটা একই?", INK, "Hind"))
    return svg(900, 560, b)

def siren_ring(r=60, col="#FF5A5A"):
    return svg(2 * r + 20, 2 * r + 20, f'<circle cx="{r+10}" cy="{r+10}" r="{r}" fill="none" stroke="{col}" stroke-width="8" opacity=".7"/>')
