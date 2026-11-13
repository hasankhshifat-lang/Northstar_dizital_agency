"""Short 4 art: stormy-evening tea stall, lightning, Mama's sky-road imagination, light-vs-sound race board,
safety icons, Boltu's paper bag, puzzle cards (all SVG strings)."""
import math, random, sys
sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent.parent / "p5"))
import art as A
from art import svg, T, O, INK

def stall_bg():
    r = random.Random(4)
    p = ['<defs><linearGradient id="ssky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#232B45"/><stop offset=".55" stop-color="#47506E"/>'
         '<stop offset=".8" stop-color="#8A7E8C"/><stop offset="1" stop-color="#C9A27A"/></linearGradient>'
         '<radialGradient id="svig" cx=".5" cy=".45" r=".8"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#0A0A18" stop-opacity=".45"/></radialGradient>'
         '<filter id="sblur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="10"/></filter>'
         '<filter id="sfar" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="2.4"/></filter>'
         '<filter id="sgrain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="5"/><feColorMatrix type="saturate" values="0"/>'
         '<feComponentTransfer><feFuncA type="table" tableValues="0 .05"/></feComponentTransfer></filter></defs>']
    p.append('<rect width="1080" height="1250" fill="url(#ssky)"/>')
    # heavy storm clouds
    cl = "".join(f'<ellipse cx="{r.randint(-100,1180)}" cy="{r.randint(80,620)}" rx="{r.randint(160,320)}" ry="{r.randint(50,110)}" fill="{r.choice(["#2E3654","#3A4262","#252C44","#444C6A"])}"/>' for _ in range(26))
    p.append(f'<g filter="url(#sblur)" opacity=".95">{cl}</g>')
    # distant tree line and a few village roofs
    far = "".join(A.tree(x, 1060 + r.randint(-12, 12), r.randint(55, 85), "#26402E", "#304E38") for x in range(-40, 1150, 90))
    p.append(f'<g filter="url(#sfar)">{far}</g>')
    p.append('<g filter="url(#sfar)" opacity=".8"><path d="M760 1060 L830 1015 L900 1060Z" fill="#5E6670"/><rect x="772" y="1060" width="116" height="50" fill="#6E5A48"/>'
             '<path d="M120 1070 L180 1030 L240 1070Z" fill="#5E6670"/><rect x="130" y="1070" width="100" height="44" fill="#6E5A48"/></g>')
    # road + ground
    p.append('<rect y="1110" width="1080" height="820" fill="#7A6650"/><path d="M0 1180 H1080" stroke="#5E4E3C" stroke-width="6" opacity=".5"/>')
    p.append('<g fill="#6A5844" opacity=".7">' + "".join(f'<ellipse cx="{r.randint(0,1080)}" cy="{r.randint(1250,1900)}" rx="{r.randint(40,130)}" ry="{r.randint(6,14)}"/>' for _ in range(24)) + '</g>')
    # puddles reflecting the sky
    p.append('<g opacity=".55"><ellipse cx="860" cy="1880" rx="150" ry="22" fill="#4E5874"/><ellipse cx="160" cy="1500" rx="90" ry="14" fill="#4E5874"/></g>')
    # tea stall (left-centre): bamboo posts, tin roof, counter, clay stove, kettle, jars, sign board without text
    st = ('<rect x="70" y="900" width="16" height="420" fill="#B08A52" stroke="#5A4026" stroke-width="3"/><rect x="560" y="900" width="16" height="420" fill="#B08A52" stroke="#5A4026" stroke-width="3"/>'
          '<path d="M30 930 L330 840 L620 930 Z" fill="#8E98A2" stroke="#4E565E" stroke-width="5"/>'
          + "".join(f'<path d="M{x} {930-(330-abs(x-330))*0.3:.0f} L{x} 930" stroke="#77818A" stroke-width="3"/>' for x in range(60, 610, 34)) +
          '<rect x="90" y="935" width="470" height="200" fill="#3C2C22"/>'
          '<g fill="#E8D9B0" stroke="#5A4026" stroke-width="3"><rect x="120" y="960" width="50" height="70" rx="8"/><rect x="185" y="960" width="50" height="70" rx="8"/><rect x="250" y="960" width="50" height="70" rx="8"/></g>'
          '<g fill="#C8762E"><rect x="128" y="990" width="34" height="34" rx="4"/><rect x="193" y="1000" width="34" height="24" rx="4"/><rect x="258" y="985" width="34" height="39" rx="4"/></g>'
          '<rect x="60" y="1135" width="530" height="40" fill="#A0784A" stroke="#5A4026" stroke-width="4"/>'
          '<rect x="80" y="1175" width="490" height="150" fill="#8A6640" stroke="#5A4026" stroke-width="4"/>'
          '<path d="M80 1225 H570 M80 1275 H570" stroke="#6E5032" stroke-width="4"/>'
          # clay stove + kettle on the counter
          '<path d="M400 1135 L410 1075 L500 1075 L510 1135Z" fill="#B5643A" stroke="#5A3020" stroke-width="4"/><ellipse cx="455" cy="1077" rx="46" ry="9" fill="#2A1A14"/>'
          '<path d="M425 1070 Q420 1020 455 1015 Q490 1020 486 1070Z" fill="#B9BEC2" stroke="#4E565E" stroke-width="4"/><path d="M486 1040 Q515 1030 522 1010" stroke="#4E565E" stroke-width="8" fill="none"/>'
          '<path d="M436 1015 Q455 990 474 1015" stroke="#4E565E" stroke-width="5" fill="none"/>'
          # glass cups on the counter
          '<g fill="#F3E6C8" fill-opacity=".85" stroke="#5A4026" stroke-width="3"><path d="M180 1135 l4 -38 h26 l4 38z"/><path d="M230 1135 l4 -38 h26 l4 38z"/></g>'
          '<g fill="#C27A3A"><path d="M183 1135 l2 -22 h24 l2 22z"/><path d="M233 1135 l2 -22 h24 l2 22z"/></g>'
          # hanging lantern
          '<path d="M330 880 V915" stroke="#3A2A1A" stroke-width="3"/><rect x="314" y="915" width="32" height="40" rx="6" fill="#FFD27A" stroke="#5A4026" stroke-width="3"/>')
    p.append(f'<g>{st}</g>')
    p.append('<circle cx="330" cy="935" r="70" fill="#FFD27A" opacity=".18" filter="url(#sblur)"/>')
    # bench on the right
    p.append('<g><rect x="700" y="1330" width="300" height="24" rx="5" fill="#A0784A" stroke="#5A4026" stroke-width="4"/>'
             '<path d="M720 1354 V1420 M980 1354 V1420" stroke="#5A4026" stroke-width="10"/></g>')
    # wind-bent grass tufts at the edges
    p.append('<g stroke="#4F6A3A" stroke-width="5" fill="none">' + "".join(f'<path d="M{x} {y} q12 -26 34 -40"/>' for x, y in ((20, 1700), (40, 1710), (1000, 1600), (1030, 1610), (980, 1900), (60, 1905))) + '</g>')
    p.append('<rect width="1080" height="1920" fill="url(#svig)"/><rect width="1080" height="1920" filter="url(#sgrain)"/>')
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920" style="overflow:visible">{"".join(p)}</svg>'

def steam():
    return svg(80, 140, '<g fill="none" stroke="#F2F2F2" stroke-width="7" opacity=".6"><path d="M25 135 q-18 -30 0 -60 q18 -30 0 -60"/><path d="M55 135 q-14 -26 0 -52 q14 -26 0 -52"/></g>')

def bolt(h=520):
    pts = [(60, 0), (30, 150), (75, 160), (25, 330), (85, 300), (40, h)]
    d = "M" + " L".join(f"{x} {y}" for x, y in pts)
    return svg(120, h + 10, f'<path d="{d}" stroke="#BFD8FF" stroke-width="26" fill="none" opacity=".45"/><path d="{d}" stroke="#FFFFFF" stroke-width="10" fill="none"/>'
                            f'<path d="M30 150 L-10 230 M25 330 L-5 400" stroke="#FFFFFF" stroke-width="5" fill="none"/>', vb=f"-20 0 140 {h+10}")

def flash():
    return svg(1080, 1920, '<rect width="1080" height="1920" fill="#EAF2FF"/>')

def count_badge(n):
    return svg(170, 170, f'<circle cx="85" cy="85" r="76" fill="#FFC300" stroke="{O}" stroke-width="7"/>' + T(85, 122, 110, n, INK, "Baloo"))

def rain(h=2300):
    rr = random.Random(11)
    lines = "".join(f'<path d="M{x} {y} l-14 46" />' for x, y in ((rr.randint(0, 1100), rr.randint(0, h)) for _ in range(170)))
    return svg(1100, h, f'<g stroke="#C8D6EE" stroke-width="3" opacity=".45">{lines}</g>')

# ---------------------------------------------------------------- Mama's imagination: a road in the sky
def thought_cloud():
    b = '<g fill="#F4F7FF" stroke="#3A2416" stroke-width="6">'
    b += "".join(f'<circle cx="{x}" cy="{y}" r="{rad}"/>' for x, y, rad in ((200, 260, 170), (420, 190, 190), (650, 200, 180), (840, 280, 160), (760, 470, 170), (520, 520, 190), (280, 480, 170), (140, 380, 140), (900, 420, 120)))
    b += '</g><g fill="#F4F7FF"><rect x="160" y="230" width="740" height="300"/></g>'
    b += '<path d="M120 420 H960" stroke="#5A6476" stroke-width="80"/><path d="M120 420 H960" stroke="#FFFFFF" stroke-width="5" stroke-dasharray="40 30"/>'
    b += '<g fill="#F4F7FF" stroke="#3A2416" stroke-width="6"><circle cx="200" cy="780" r="34"/><circle cx="150" cy="860" r="22"/></g>'
    return svg(1080, 900, b)

def motorbike():
    return svg(220, 130, f'<circle cx="45" cy="95" r="30" fill="#222" stroke="{O}" stroke-width="5"/><circle cx="175" cy="95" r="30" fill="#222" stroke="{O}" stroke-width="5"/>'
                         f'<path d="M45 95 L95 55 H150 L175 95" stroke="#D7263D" stroke-width="16" fill="none"/><rect x="88" y="40" width="70" height="26" rx="10" fill="#D7263D" stroke="{O}" stroke-width="4"/>'
                         f'<path d="M150 55 L165 25 H185" stroke="{O}" stroke-width="7" fill="none"/><circle cx="190" cy="40" r="10" fill="#FFF3A0" stroke="{O}" stroke-width="3"/>'
                         f'<path d="M-10 60 H30 M-20 80 H20" stroke="#FFC300" stroke-width="6"/>')

def bus():
    return svg(300, 170, f'<rect x="10" y="10" width="280" height="120" rx="18" fill="#2E8B57" stroke="{O}" stroke-width="6"/>'
                         + "".join(f'<rect x="{x}" y="28" width="44" height="40" rx="6" fill="#BFE3F2" stroke="{O}" stroke-width="3"/>' for x in (28, 84, 140, 196)) +
                         f'<rect x="246" y="28" width="30" height="80" rx="4" fill="#BFE3F2" stroke="{O}" stroke-width="3"/>'
                         f'<circle cx="70" cy="135" r="26" fill="#222" stroke="{O}" stroke-width="5"/><circle cx="230" cy="135" r="26" fill="#222" stroke="{O}" stroke-width="5"/>')

def car(col):
    return svg(170, 100, f'<path d="M10 70 V45 Q20 30 45 28 L65 8 H115 L140 30 Q160 34 160 50 V70Z" fill="{col}" stroke="{O}" stroke-width="5"/>'
                         f'<path d="M72 14 H110 L128 32 H62Z" fill="#BFE3F2" stroke="{O}" stroke-width="3"/>'
                         f'<circle cx="45" cy="74" r="18" fill="#222" stroke="{O}" stroke-width="4"/><circle cx="125" cy="74" r="18" fill="#222" stroke="{O}" stroke-width="4"/>')

# ---------------------------------------------------------------- the race board (screen layer, 1080 wide)
BX0, BX1, BY = 170, 930, 760          # bolt x, stall x, the line the ray and rings travel on

def board_scene():
    """Storm cloud with a bolt at the left, the tea stall with an eye and an ear at the right."""
    b = '<g fill="#5E6680" stroke="#3A2416" stroke-width="5">' + "".join(f'<circle cx="{x}" cy="{y}" r="{rad}"/>' for x, y, rad in ((120, 430, 70), (200, 400, 85), (280, 440, 65))) + '</g>'
    b += '<rect x="80" y="430" width="230" height="60" fill="#5E6680"/>'
    b += f'<path d="M200 480 L170 590 L215 600 L170 720" stroke="#FFE14D" stroke-width="16" fill="none" stroke-linejoin="miter"/><path d="M200 480 L170 590 L215 600 L170 720" stroke="#3A2416" stroke-width="3" fill="none"/>'
    b += '<path d="M60 930 H1020" stroke="#8C7458" stroke-width="10"/>'
    # stall icon
    b += '<path d="M840 700 L930 650 L1020 700Z" fill="#8E98A2" stroke="#3A2416" stroke-width="4"/><rect x="852" y="700" width="156" height="225" fill="#B08A52" stroke="#3A2416" stroke-width="4"/>'
    b += '<rect x="872" y="790" width="116" height="40" fill="#A0784A" stroke="#3A2416" stroke-width="3"/>'
    return svg(1080, 1000, b)

def eye_icon(lit):
    c = "#FFC300" if lit else "#FFFFFF"
    return svg(140, 90, f'<path d="M10 45 Q70 -5 130 45 Q70 95 10 45Z" fill="{c}" stroke="{INK}" stroke-width="5"/><circle cx="70" cy="45" r="20" fill="#5A3A22"/><circle cx="70" cy="45" r="8" fill="#111"/>')

def ear_icon(lit):
    c = "#FFC300" if lit else "#F2C9A0"
    return svg(110, 140, f'<path d="M30 120 Q10 90 20 50 Q35 8 70 10 Q105 15 100 55 Q96 80 75 92 Q62 100 62 118 Q60 135 40 132Z" fill="{c}" stroke="{INK}" stroke-width="5"/>'
                         f'<path d="M45 55 Q55 30 75 40 Q85 50 70 65" fill="none" stroke="{INK}" stroke-width="4"/>')

def light_ray(length=BX1 - BX0 - 80):
    return svg(length, 40, f'<rect x="0" y="8" width="{length}" height="24" rx="12" fill="#FFE14D" opacity=".5"/><rect x="0" y="14" width="{length}" height="12" rx="6" fill="#FFF8C0"/>')

def sound_ring(r=60):
    return svg(2 * r + 20, 2 * r + 20, f'<path d="M{r+10+r*math.cos(-0.7):.0f} {r+10+r*math.sin(-0.7):.0f} A{r} {r} 0 0 1 {r+10+r*math.cos(0.7):.0f} {r+10+r*math.sin(0.7):.0f}" fill="none" stroke="#1E5AA8" stroke-width="9" stroke-linecap="round"/>')

def ruler():
    b = '<path d="M10 40 H770" stroke="#1A1A1A" stroke-width="6"/>'
    b += "".join(f'<path d="M{10+76*i} {28 if i % 5 else 18} V52" stroke="#1A1A1A" stroke-width="{5 if i % 5 == 0 else 3}"/>' for i in range(11))
    b += T(10, 92, 34, "০", INK) + T(770, 92, 34, "১ কিমি", INK)
    return svg(800, 100, b)

def stopwatch(n):
    return svg(170, 200, f'<rect x="70" y="0" width="30" height="24" fill="#555" stroke="{O}" stroke-width="4"/><circle cx="85" cy="110" r="78" fill="#FFFFFF" stroke="{O}" stroke-width="8"/>'
                         + T(85, 140, 80, n, "#D7263D", "Baloo") + T(85, 175, 26, "সেকেন্ড", "#555"))

# ---------------------------------------------------------------- safety icons
def house_ok():
    return svg(260, 260, f'<path d="M30 120 L130 40 L230 120Z" fill="#D7263D" stroke="{O}" stroke-width="6"/><rect x="55" y="120" width="150" height="110" fill="#F2D8A8" stroke="{O}" stroke-width="6"/>'
                         f'<rect x="110" y="160" width="40" height="70" fill="#6E4A2E" stroke="{O}" stroke-width="4"/>'
                         f'<circle cx="215" cy="215" r="38" fill="#2BA84A" stroke="{O}" stroke-width="5"/><path d="M196 214 l13 14 l24 -26" stroke="#fff" stroke-width="9" fill="none"/>')

def tree_no():
    return svg(260, 260, f'<rect x="115" y="140" width="30" height="100" fill="#7A4A2A" stroke="{O}" stroke-width="5"/><circle cx="130" cy="100" r="80" fill="#3E8E41" stroke="{O}" stroke-width="6"/>'
                         f'<circle cx="215" cy="215" r="38" fill="#D7263D" stroke="{O}" stroke-width="5"/><path d="M200 200 l30 30 M230 200 l-30 30" stroke="#fff" stroke-width="9"/>')

# ---------------------------------------------------------------- Boltu's paper bag
def bag(puffed=True):
    if puffed:
        return svg(150, 170, f'<path d="M20 160 Q5 90 25 30 Q75 0 125 30 Q145 90 130 160Z" fill="#D9B98A" stroke="{O}" stroke-width="5"/>'
                             f'<path d="M45 40 Q75 25 105 40" stroke="#B08A5A" stroke-width="4" fill="none"/><path d="M30 155 Q75 168 120 155" stroke="#B08A5A" stroke-width="4" fill="none"/>')
    return svg(150, 170, f'<path d="M35 160 L30 70 L50 90 L60 40 L78 80 L95 35 L105 85 L122 60 L118 160Z" fill="#D9B98A" stroke="{O}" stroke-width="5"/>'
                         f'<path d="M45 120 l20 10 M85 110 l20 -6" stroke="#B08A5A" stroke-width="4"/>')

def burst(txt="ঠাস!"):
    pts = []
    for i in range(24):
        a = math.pi * 2 * i / 24; rr = 200 if i % 2 == 0 else 125
        pts.append(f"{250+rr*math.cos(a):.0f} {200+rr*0.8*math.sin(a):.0f}")
    return svg(500, 400, f'<path d="M{" L".join(pts)}Z" fill="#FFE14D" stroke="{O}" stroke-width="7"/>'
                         + T(250, 238, 110, txt, "#D7263D", "Baloo", extra=f'stroke="{O}" stroke-width="6" paint-order="stroke"'))

# ---------------------------------------------------------------- puzzle cards
def card(kind):
    lab = {"air": "বাতাস", "water": "পানি", "iron": "লোহা"}[kind]
    if kind == "air":
        art = '<g fill="none" stroke="#5AA9E6" stroke-width="10"><path d="M40 90 H170 Q205 90 200 60 Q195 35 170 42"/><path d="M40 130 H200 Q235 130 230 160 Q225 185 200 178"/><path d="M60 170 H140"/></g>'
    elif kind == "water":
        art = '<path d="M140 30 Q80 110 80 145 Q80 200 140 200 Q200 200 200 145 Q200 110 140 30Z" fill="#4CA8E0" stroke="#1E5AA8" stroke-width="7"/><path d="M110 150 Q112 175 135 182" stroke="#fff" stroke-width="7" fill="none"/>'
    else:
        art = '<path d="M40 150 L80 80 H240 L200 150Z" fill="#8C96A0" stroke="#3A3F44" stroke-width="7"/><path d="M40 150 V185 H200 V150 M200 185 L240 115 V80" fill="#6E7780" stroke="#3A3F44" stroke-width="7"/>'
    return svg(300, 330, f'<rect x="6" y="6" width="288" height="318" rx="26" fill="#FFFFFF" stroke="{O}" stroke-width="6"/><g transform="translate(10 20)">{art}</g>'
                         + T(150, 300, 56, lab, INK, "Baloo"))
