"""Short 3 art: village courtyard, lojjaboti (Mimosa) plant in fold stages, leaf-hinge board, insect, goat, night card."""
import math, random, sys
sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent.parent / "p5"))
import art as A
from art import svg, T, O, INK

def courtyard_bg():
    r = random.Random(9)
    p = [A.DEFS.replace('id="pond"', 'id="pondx"')]
    p.append('<rect width="1080" height="1100" fill="url(#sky)"/><rect width="1080" height="1100" fill="url(#sun)"/>')
    p.append('<circle cx="860" cy="230" r="60" fill="#FFF3D2" filter="url(#soft)"/>')
    p.append('<g fill="#fff" filter="url(#soft)" opacity=".8"><ellipse cx="260" cy="300" rx="150" ry="34"/><ellipse cx="700" cy="420" rx="120" ry="28"/></g>')
    far = "".join(A.tree(x, 980 + r.randint(-10, 10), r.randint(60, 90), "#4F8F55", "#6DAA60") for x in range(-40, 1150, 100))
    p.append(f'<g filter="url(#far)" opacity=".9">{far}</g><rect y="800" width="1080" height="320" fill="url(#haze)"/>')
    # mud house with tin roof, door, window, small veranda
    house = ('<rect x="160" y="760" width="620" height="420" fill="#C99A62"/><rect x="160" y="760" width="620" height="60" fill="#B98852"/>'
             '<path d="M110 780 L470 600 L830 780Z" fill="#9AA4AE"/><path d="M110 780 L470 600 L830 780" fill="none" stroke="#6E7880" stroke-width="6"/>'
             + "".join(f'<path d="M{x} {600+abs(x-470)*0.5:.0f} L{x} 780" stroke="#87929B" stroke-width="3"/>' for x in range(150, 820, 40)) +
             '<rect x="420" y="900" width="120" height="280" fill="#5A3A22"/><rect x="430" y="910" width="100" height="260" fill="#6E4A2E"/>'
             '<rect x="230" y="900" width="110" height="100" fill="#3E2A1A"/><path d="M230 950 H340 M285 900 V1000" stroke="#C99A62" stroke-width="6"/>'
             '<rect x="610" y="900" width="110" height="100" fill="#3E2A1A"/><path d="M610 950 H720 M665 900 V1000" stroke="#C99A62" stroke-width="6"/>')
    p.append(f'<g filter="url(#mid)" stroke="#2E2A33" stroke-opacity=".35" stroke-width="3">{house}</g>')
    # banana trees + bamboo fence
    def banana(x, y, s):
        leaves = "".join(f'<path d="M{x} {y-300*s} q{dx*s} {-60*s} {dx*2.2*s} {dy*s}" fill="none" stroke="#3E8E41" stroke-width="{34*s:.0f}" stroke-linecap="round"/>' for dx, dy in ((-90, 40), (90, 30), (-60, -80), (70, -90), (-110, 120)))
        return f'<rect x="{x-14*s}" y="{y-300*s}" width="{28*s}" height="{300*s}" fill="#8BAE5A"/>{leaves}'
    p.append(f'<g filter="url(#mid)">{banana(60, 1220, 1.3)}{banana(1010, 1200, 1.2)}</g>')
    fence = "".join(f'<rect x="{x}" y="1080" width="16" height="150" fill="#C7A66A" stroke="#7A6036" stroke-width="2"/>' for x in range(0, 1080, 34))
    p.append(f'<g opacity=".95">{fence}<path d="M0 1120 H1080 M0 1180 H1080" stroke="#9C7E48" stroke-width="8"/></g>')
    # swept mud courtyard
    p.append('<rect y="1220" width="1080" height="900" fill="#D8B88A"/><rect y="1220" width="1080" height="900" fill="url(#shade)" opacity=".4"/>')
    p.append('<g fill="#C9A676" opacity=".7">' + "".join(f'<ellipse cx="{r.randint(0,1080)}" cy="{r.randint(1300,1900)}" rx="{r.randint(40,120)}" ry="{r.randint(6,14)}"/>' for _ in range(22)) + '</g>')
    p.append('<g stroke="#B8946A" stroke-width="3" opacity=".6" fill="none">' + "".join(f'<path d="M{x} {y} q30 -6 60 0"/>' for x, y in ((120, 1500), (700, 1420), (400, 1700), (860, 1820))) + '</g>')
    # grass patch at the right where the lojjaboti grows
    p.append('<ellipse cx="880" cy="1800" rx="230" ry="70" fill="#7FA858"/><g stroke="#5E8A40" stroke-width="4">' + "".join(f'<path d="M{x} 1800 l{r.randint(-8,8)} -{r.randint(18,40)}"/>' for x in range(680, 1080, 14)) + '</g>')
    p.append('<rect width="1080" height="1920" fill="url(#warm)"/><rect width="1080" height="1920" fill="url(#vig)"/><rect width="1080" height="1920" filter="url(#grain)"/>')
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920" style="overflow:visible">{"".join(p)}</svg>'

def plant(f, dark=False, w=420, h=320):
    """Lojjaboti bush. f = 0 open ... 1 fully folded (leaflets closed, leaves drooping)."""
    g, gs = ("#2C3A30", "#2C3A30") if dark else ("#4E9A45", "#3C7E36")
    b = ""
    stems = [(-70, 1.0), (-35, 1.15), (0, 1.25), (35, 1.1), (70, 0.95)]
    base = (w / 2, h - 10)
    for ang, ln in stems:
        a = math.radians(ang + f * (22 if ang >= 0 else -22))     # leaves droop outward when folded
        L = 140 * ln
        ex, ey = base[0] + math.sin(a) * L, base[1] - math.cos(a) * L * (1 - 0.3 * f)
        b += f'<path d="M{base[0]} {base[1]} Q{(base[0]+ex)/2} {min(base[1],ey)-20} {ex:.0f} {ey:.0f}" fill="none" stroke="#7A4A3A" stroke-width="5"/>'
        # pinnae: two short rachises with leaflet pairs
        for side in (-1, 1):
            ra = a + side * 0.35
            rx, ry = ex + math.sin(ra) * 90, ey - math.cos(ra) * 90 * (1 - 0.5 * f)
            b += f'<path d="M{ex:.0f} {ey:.0f} L{rx:.0f} {ry:.0f}" stroke="{gs}" stroke-width="3"/>'
            for k in range(1, 9):
                px, py = ex + (rx - ex) * k / 9, ey + (ry - ey) * k / 9
                # leaflet perpendicular to rachis; folding rotates it toward the rachis and thins it
                perp = math.atan2(ry - ey, rx - ex) + math.pi / 2
                for s2 in (-1, 1):
                    la = perp * 1 + s2 * 0 + (0 if s2 > 0 else math.pi)
                    la = la + s2 * f * 1.2 * (-1)
                    lx, ly = px + math.cos(la) * 14, py + math.sin(la) * 14
                    b += f'<ellipse cx="{(px+lx)/2:.1f}" cy="{(py+ly)/2:.1f}" rx="9" ry="{4*(1-0.7*f)+1:.1f}" transform="rotate({math.degrees(la):.0f} {(px+lx)/2:.1f} {(py+ly)/2:.1f})" fill="{g}" stroke="{O}" stroke-width="1.2"/>'
    if not dark:   # pink pom-pom flowers
        for fx, fy in ((w * 0.3, h * 0.25), (w * 0.72, h * 0.3)):
            b += f'<path d="M{w/2} {h-10} Q{(w/2+fx)/2} {h*0.6} {fx} {fy}" fill="none" stroke="#7A4A3A" stroke-width="3"/>'
            b += "".join(f'<path d="M{fx} {fy} l{math.cos(t)*16:.0f} {math.sin(t)*16:.0f}" stroke="#F06BB0" stroke-width="3"/>' for t in [i * math.pi / 8 for i in range(16)])
            b += f'<circle cx="{fx}" cy="{fy}" r="5" fill="#F6A6D0"/>'
    b += f'<ellipse cx="{w/2}" cy="{h-6}" rx="{w*0.32}" ry="8" fill="#000" opacity=".15"/>'
    return svg(w, h, b)

def insect():
    return svg(90, 60, f'<ellipse cx="45" cy="34" rx="30" ry="16" fill="#7BB33A" stroke="{O}" stroke-width="3"/><circle cx="78" cy="30" r="10" fill="#8CC640" stroke="{O}" stroke-width="3"/>'
                       f'<path d="M84 22 q12 -14 4 -20 M78 20 q4 -16 -6 -18" fill="none" stroke="{O}" stroke-width="2.5"/>'
                       f'<path d="M30 48 l-10 12 M45 50 l0 12 M60 48 l10 12" stroke="{O}" stroke-width="3"/><path d="M20 30 Q45 6 70 28" fill="#B6E070" fill-opacity=".7" stroke="{O}" stroke-width="2"/>'
                       f'<circle cx="82" cy="28" r="2.5" fill="#111"/>')

def goat():
    b = (f'<path d="M80 150 L74 240 M110 150 L108 240 M220 150 L224 240 M250 150 L254 240" stroke="{O}" stroke-width="14"/>'
         f'<path d="M80 150 L74 240 M110 150 L108 240 M220 150 L224 240 M250 150 L254 240" stroke="#F1EDE4" stroke-width="8"/>'
         f'<ellipse cx="165" cy="120" rx="120" ry="58" fill="#F1EDE4" stroke="{O}" stroke-width="4"/><path d="M110 90 Q165 70 230 95 Q200 130 120 120Z" fill="#8A6A4A" opacity=".8"/>'
         f'<path d="M282 112 q14 -10 18 6" fill="none" stroke="{O}" stroke-width="5"/>'
         f'<path d="M60 100 Q30 60 40 30 L74 40 Q82 70 76 96Z" fill="#F1EDE4" stroke="{O}" stroke-width="4"/>'
         f'<path d="M10 70 Q20 30 60 30 Q80 40 70 80 Q50 110 22 104 Q4 96 10 70Z" fill="#F1EDE4" stroke="{O}" stroke-width="4"/>'
         f'<path d="M44 34 Q40 6 60 0 M56 36 Q60 10 80 6" fill="none" stroke="#8A7A66" stroke-width="7"/>'
         f'<ellipse cx="66" cy="54" rx="12" ry="7" fill="#F1EDE4" stroke="{O}" stroke-width="3" transform="rotate(-25 66 54)"/>'
         f'<circle cx="38" cy="58" r="5" fill="#111"/><path d="M12 92 q8 6 16 2" fill="none" stroke="{O}" stroke-width="3"/>'
         f'<path d="M14 100 q4 24 14 30 q6 -18 0 -30" fill="#E8E2D6" stroke="{O}" stroke-width="2"/>')
    return svg(310, 250, b)

def gamchha_strip(length):
    """Red checked cloth strip (horizontal), for the goat chewing Mama's gamchha."""
    b = f'<rect x="0" y="0" width="{length}" height="34" rx="6" fill="#D7263D" stroke="{O}" stroke-width="3"/>'
    b += "".join(f'<path d="M{x} 2 V32" stroke="#fff" stroke-width="4"/>' for x in range(20, int(length), 34))
    b += '<path d="M2 17 H' + str(length - 2) + '" stroke="#fff" stroke-width="3"/>'
    return svg(length, 34, b)

def hinge_panel(touched):
    """Zoom on the leaf hinge: plump water-filled cells (leaf up) vs. cells losing water (leaf droops)."""
    b = '<circle cx="270" cy="300" r="250" fill="#F4F9EF" stroke="#3A2416" stroke-width="6"/>'
    b += '<path d="M60 420 Q160 400 230 330" stroke="#7A4A3A" stroke-width="22" fill="none"/>'        # stem into the hinge
    leaf = "M300 300 L470 120" if not touched else "M300 300 L460 420"
    b += f'<path d="{leaf}" stroke="#3C7E36" stroke-width="16" fill="none"/>'
    b += "".join(f'<ellipse cx="{300+(170 if not touched else 160)*k/6:.0f}" cy="{300+(-180 if not touched else 120)*k/6:.0f}" rx="22" ry="{8 if not touched else 4}" fill="#4E9A45" stroke="{O}" stroke-width="2" transform="rotate({-45 if not touched else 37} {300+(170 if not touched else 160)*k/6:.0f} {300+(-180 if not touched else 120)*k/6:.0f})"/>' for k in range(1, 6))
    # hinge cells
    for i, (cx, cy) in enumerate([(250, 290), (290, 270), (270, 330), (310, 315), (230, 330), (330, 285)]):
        r = 22 if not touched else 15
        b += f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#CFE9C2" stroke="#3E7A34" stroke-width="3"/><circle cx="{cx}" cy="{cy}" r="{r-8}" fill="#7FC3D8" opacity=".85"/>'
    if touched:
        for x, y, dx, dy in ((215, 370, -55, 40), (345, 360, 55, 40), (245, 245, -40, -55)):
            b += f'<path d="M{x} {y} l{dx} {dy}" stroke="#1E5AA8" stroke-width="7"/><path d="M{x+dx} {y+dy-14} q10 14 0 22 q-10 -8 0 -22Z" fill="#4CA8E0" stroke="#1E5AA8" stroke-width="2"/>'
        b += ""
    if False:
        b += "".join(f'<path d="M{x} {y} l{dx} {dy}" stroke="#1E5AA8" stroke-width="5"/><path d="M{x+dx} {y+dy} l{-dx*0.3-6*(1 if dx<0 else -1):.0f} {-4} " stroke="#1E5AA8" stroke-width="5"/>' for x, y, dx, dy in ((230, 360, -40, 30), (330, 350, 40, 30), (260, 250, -30, -40)))
    return svg(540, 560, b)

def touch_icon():
    return svg(120, 120, f'<circle cx="60" cy="60" r="54" fill="#FFC300" stroke="{O}" stroke-width="4"/>'
                         f'<path d="M50 96 L50 40 Q50 30 60 30 Q70 30 70 40 L70 64 L84 66 Q94 68 92 80 L86 98Z" fill="#D9A06B" stroke="{O}" stroke-width="4"/>'
                         f'<path d="M28 34 l-10 -8 M40 22 l-4 -12 M80 22 l4 -12" stroke="{O}" stroke-width="4"/>')

def night_card():
    stars = "".join(f'<circle cx="{random.Random(i).randint(20,1060)}" cy="{random.Random(i+99).randint(20,900)}" r="{random.Random(i+7).choice([2,3,4])}" fill="#FFF6D6"/>' for i in range(60))
    return svg(1080, 1920, f'<rect width="1080" height="1920" fill="#101C3A" opacity=".88"/>{stars}<circle cx="800" cy="300" r="90" fill="#FFF3C4"/><circle cx="830" cy="280" r="90" fill="#101C3A" opacity=".88"/>')

def qmark():
    return svg(200, 260, T(100, 220, 240, "?", "#FFC300", "Baloo", extra='stroke="#3A2416" stroke-width="12" paint-order="stroke"'))
