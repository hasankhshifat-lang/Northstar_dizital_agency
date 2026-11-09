"""Pilot 5 art: painted village-pond background, props and notebook boards (all SVG strings)."""
import math, random

O = "#3A2416"; INK = "#1A1A1A"
SKIN, SKIN_S = "#D9A06B", "#B97F4E"

def svg(w, h, body, vb=None, extra=""):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="{vb or f"0 0 {w} {h}"}" {extra}>'
            f'<g stroke-linejoin="round" stroke-linecap="round">{body}</g></svg>')

def T(x, y, s, txt, fill=INK, fam="Hind", anchor="middle", weight=700, extra=""):
    return f'<text x="{x}" y="{y}" font-family="{fam}" font-weight="{weight}" font-size="{s}" fill="{fill}" text-anchor="{anchor}" stroke="none" {extra}>{txt}</text>'

# ------------------------------------------------------------------ background
DEFS = '''<defs>
 <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FC1E8"/><stop offset=".6" stop-color="#BFE3F2"/><stop offset="1" stop-color="#FBEAC8"/></linearGradient>
 <radialGradient id="sun" cx="840" cy="260" r="380" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFF7DA" stop-opacity=".95"/><stop offset=".3" stop-color="#FFE7A8" stop-opacity=".5"/><stop offset="1" stop-color="#FFE7A8" stop-opacity="0"/></radialGradient>
 <linearGradient id="pond" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7DB8C9"/><stop offset=".45" stop-color="#4F98A8"/><stop offset="1" stop-color="#6E8A62"/></linearGradient>
 <linearGradient id="bottom" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8A7A4E" stop-opacity="0"/><stop offset="1" stop-color="#8A6E44" stop-opacity=".55"/></linearGradient>
 <linearGradient id="cement" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B9B7AE"/><stop offset="1" stop-color="#9C9A91"/></linearGradient>
 <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3F1E4" stop-opacity="0"/><stop offset="1" stop-color="#F3F1E4" stop-opacity=".55"/></linearGradient>
 <radialGradient id="vig" cx=".5" cy=".45" r=".78"><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#1A1020" stop-opacity=".34"/></radialGradient>
 <linearGradient id="warm" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD9A0" stop-opacity=".22"/><stop offset=".6" stop-color="#FFD9A0" stop-opacity="0"/></linearGradient>
 <filter id="far" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="2.6"/><feColorMatrix type="saturate" values=".7"/></filter>
 <filter id="mid" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="1.1"/></filter>
 <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14"/></filter>
 <filter id="refl" x="-5%" y="-5%" width="110%" height="120%"><feGaussianBlur stdDeviation="2 7"/></filter>
 <filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .06"/></feComponentTransfer></filter>
</defs>'''

def tree(x, y, r, c1="#3E8E41", c2="#5DAF4E"):
    return (f'<rect x="{x-r*0.12}" y="{y-r*0.2}" width="{r*0.24}" height="{r*1.1}" fill="#6B4A2E"/>'
            f'<circle cx="{x}" cy="{y-r*0.4}" r="{r}" fill="{c1}"/><circle cx="{x-r*0.7}" cy="{y-r*0.1}" r="{r*0.7}" fill="{c1}"/>'
            f'<circle cx="{x+r*0.7}" cy="{y-r*0.15}" r="{r*0.75}" fill="{c1}"/><circle cx="{x-r*0.25}" cy="{y-r*0.75}" r="{r*0.55}" fill="{c2}"/>')

def hut(x, y, w, roof="#9AA4AE", wall="#C99A62"):
    return (f'<rect x="{x}" y="{y-w*0.45}" width="{w}" height="{w*0.45}" fill="{wall}"/>'
            f'<path d="M{x-w*0.12} {y-w*0.42} L{x+w*0.5} {y-w*0.85} L{x+w*1.12} {y-w*0.42}Z" fill="{roof}"/>'
            f'<rect x="{x+w*0.4}" y="{y-w*0.3}" width="{w*0.2}" height="{w*0.3}" fill="#5A3A22"/>')

def duck(x, y, s=1):
    return (f'<g transform="translate({x} {y}) scale({s})"><ellipse rx="26" ry="13" fill="#F4F1E8"/><circle cx="20" cy="-14" r="10" fill="#F4F1E8"/>'
            f'<path d="M28 -14 L40 -11 L28 -9Z" fill="#E8A030"/><circle cx="23" cy="-16" r="1.8" fill="#222"/></g>')

def lily(x, y, r):
    return (f'<ellipse cx="{x}" cy="{y}" rx="{r}" ry="{r*0.38}" fill="#4E9A45"/><path d="M{x} {y} L{x+r} {y-r*0.1}" stroke="#7FC7B5" stroke-width="3"/>'
            f'<ellipse cx="{x-r*0.4}" cy="{y-r*0.2}" rx="{r*0.22}" ry="{r*0.14}" fill="#F2A7C4"/>')

def pond_bg():
    r = random.Random(5); p = [DEFS]
    p.append('<rect width="1080" height="900" fill="url(#sky)"/><rect width="1080" height="900" fill="url(#sun)"/>')
    p.append('<circle cx="840" cy="260" r="64" fill="#FFF3D2" filter="url(#soft)"/>')
    p.append('<g fill="#fff" filter="url(#soft)" opacity=".85"><ellipse cx="230" cy="330" rx="160" ry="38"/><ellipse cx="310" cy="305" rx="95" ry="36"/><ellipse cx="640" cy="470" rx="140" ry="30"/></g>')
    # far tree line + huts (hazy)
    far = "".join(tree(x, 820 + r.randint(-10, 10), r.randint(55, 85), "#4F8F55", "#6DAA60") for x in range(-40, 1150, 95))
    far += hut(170, 860, 120) + hut(560, 850, 100, "#A8B0B6", "#D2A774") + hut(780, 860, 130, "#8C969F")
    p.append(f'<g filter="url(#far)" opacity=".9">{far}</g><rect y="700" width="1080" height="210" fill="url(#haze)"/>')
    # far bank grass
    p.append('<path d="M0 880 Q270 860 540 875 T1080 870 L1080 915 L0 915Z" fill="#7FA858"/>')
    # pond water with clear bottom tint, ripples, reflections
    p.append('<rect y="905" width="1080" height="560" fill="url(#pond)"/><rect y="1150" width="1080" height="320" fill="url(#bottom)"/>')
    p.append(f'<g transform="translate(0 1810) scale(1 -1)" opacity=".18" filter="url(#refl)">{far}</g>')
    p.append('<g fill="#E6F4F6" opacity=".45" filter="url(#mid)">' + "".join(f'<rect x="{r.randint(0,950)}" y="{r.randint(930,1420)}" width="{r.randint(80,220)}" height="4" rx="2"/>' for _ in range(14)) + '</g>')
    p.append('<g stroke="#2E2A33" stroke-opacity=".35" stroke-width="2">' + lily(130, 1010, 34) + lily(220, 1050, 26) + lily(880, 990, 30) + lily(980, 1060, 38) + lily(700, 1120, 24) + '</g>')
    p.append('<g stroke="#2E2A33" stroke-opacity=".4" stroke-width="2">' + duck(420, 980, .9) + duck(500, 1000, .7) + '</g>')
    # grassy bank on the left where the banyan stands
    p.append('<path d="M0 870 L250 875 Q300 1000 240 1150 Q180 1300 150 1440 L0 1440Z" fill="#6E9A4C"/><path d="M250 875 Q300 1000 240 1150 Q180 1300 150 1440" fill="none" stroke="#4E7A38" stroke-width="6"/>')
    # big banyan tree on the left (mid ground) with hanging roots
    p.append('<g filter="url(#mid)"><path d="M60 1450 Q90 1100 40 820 L150 820 Q130 1100 170 1450Z" fill="#6E4B30"/>'
             + "".join(f'<path d="M{x} 640 Q{x+6} 900 {x-4} {r.randint(1050,1250)}" stroke="#7A5638" stroke-width="5" fill="none"/>' for x in range(20, 240, 36))
             + '<g fill="#2F7A3A"><circle cx="120" cy="560" r="220"/><circle cx="330" cy="520" r="160"/><circle cx="-40" cy="640" r="170"/></g>'
             + '<g fill="#3F944A"><circle cx="190" cy="470" r="120"/><circle cx="40" cy="520" r="110"/></g></g>')
    # ghat: steps going down into the water, cement platform in front
    for k, (y0, y1, inset) in enumerate([(1440, 1478, 120), (1478, 1518, 90), (1518, 1560, 60), (1560, 1604, 30)]):
        p.append(f'<path d="M{inset} {y0} L{1080-inset} {y0} L{1080-inset+30} {y1} L{inset-30} {y1}Z" fill="url(#cement)" stroke="#6E6C64" stroke-width="2"/>')
        p.append(f'<rect x="{inset-30}" y="{y1-6}" width="{1080-2*inset+60}" height="6" fill="#000" opacity=".12"/>')
    p.append('<rect y="1604" width="1080" height="700" fill="url(#cement)"/><rect y="1604" width="1080" height="10" fill="#000" opacity=".12"/>')
    p.append('<g stroke="#8A887F" stroke-width="2" opacity=".7"><path d="M0 1720 H1080 M0 1860 H1080 M300 1604 V1720 M760 1720 V1860 M520 1860 V2000"/>'
             '<path d="M180 1650 l30 18 l-8 22 M880 1780 l-24 14 l10 20" fill="none"/></g>')
    # side walls with little pillars (benches) of the ghat
    for x0, sx in ((0, 1), (1080, -1)):
        p.append(f'<path d="M{x0} 1380 L{x0+sx*130} 1380 L{x0+sx*90} 1604 L{x0} 1604Z" fill="#A9A79E" stroke="#6E6C64" stroke-width="2"/>'
                 f'<rect x="{x0+sx*95-(50 if sx>0 else 0)}" y="1300" width="50" height="90" fill="#C2C0B6" stroke="#6E6C64" stroke-width="2"/>')
    # water line at the steps
    p.append('<path d="M120 1440 L960 1440" stroke="#E8F6F8" stroke-width="4" opacity=".7"/>')
    p.append('<rect width="1080" height="1920" fill="url(#warm)"/><rect width="1080" height="1920" fill="url(#vig)"/><rect width="1080" height="1920" filter="url(#grain)"/>')
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920" style="overflow:visible">{"".join(p)}</svg>'

# ------------------------------------------------------------------ props
def fish(ghost=False, w=150):
    h = w * 0.42
    if ghost:
        return svg(w, h, f'<path d="M{w*0.05} {h/2} Q{w*0.35} {h*0.05} {w*0.72} {h/2} Q{w*0.35} {h*0.95} {w*0.05} {h/2}Z M{w*0.7} {h/2} L{w*0.97} {h*0.12} L{w*0.97} {h*0.88}Z" '
                     f'fill="#DDEFF3" fill-opacity=".35" stroke="#FFFFFF" stroke-width="3" stroke-dasharray="8 6"/>')
    return svg(w, h, f'<path d="M{w*0.7} {h/2} L{w*0.97} {h*0.12} L{w*0.92} {h/2} L{w*0.97} {h*0.88}Z" fill="#B9C4CC" stroke="{O}" stroke-width="3"/>'
                     f'<path d="M{w*0.05} {h/2} Q{w*0.35} {h*0.02} {w*0.74} {h/2} Q{w*0.35} {h*0.98} {w*0.05} {h/2}Z" fill="#D9E2E8" stroke="{O}" stroke-width="3"/>'
                     f'<path d="M{w*0.2} {h*0.55} Q{w*0.45} {h*0.72} {w*0.7} {h*0.52}" fill="none" stroke="#9FB0BC" stroke-width="3"/>'
                     f'<circle cx="{w*0.17}" cy="{h*0.42}" r="{h*0.09}" fill="#fff" stroke="{O}" stroke-width="2"/><circle cx="{w*0.17}" cy="{h*0.42}" r="{h*0.04}" fill="#111"/>'
                     f'<path d="M{w*0.38} {h*0.2} Q{w*0.48} {h*0.02} {w*0.56} {h*0.22}" fill="#C6D0D8" stroke="{O}" stroke-width="2.5"/>')

def splash(w=260):
    r = random.Random(3); b = ""
    for i in range(14):
        a = math.radians(200 + i * 10 + r.randint(-4, 4)); d = r.randint(50, 115)
        x, y = w/2 + math.cos(a) * d, w*0.62 + math.sin(a) * d
        b += f'<ellipse cx="{x:.0f}" cy="{y:.0f}" rx="{r.randint(6,11)}" ry="{r.randint(9,15)}" fill="#E9F7FA" stroke="#5FA6B8" stroke-width="2.5"/>'
    b += f'<ellipse cx="{w/2}" cy="{w*0.66}" rx="{w*0.42}" ry="{w*0.08}" fill="none" stroke="#E9F7FA" stroke-width="6"/>'
    return svg(w, w, b)

def hand_reach():
    """Mama's forearm + open hand reaching down into water (seen from above/front)."""
    return svg(150, 420, f'<path d="M50 0 L100 0 L96 300 L54 300Z" fill="{SKIN}" stroke="{O}" stroke-width="4"/><path d="M84 0 L100 0 L96 300 L86 300Z" fill="{SKIN_S}" opacity=".6"/>'
                         f'<path d="M40 290 Q34 340 52 372 L58 410 M60 300 L66 418 M76 300 L82 420 M92 296 L100 410 M104 290 Q122 320 120 350" fill="none" stroke="{O}" stroke-width="15"/>'
                         f'<path d="M40 290 Q34 340 52 372 L58 410 M60 300 L66 418 M76 300 L82 420 M92 296 L100 410 M104 290 Q122 320 120 350" fill="none" stroke="{SKIN}" stroke-width="9"/>'
                         f'<path d="M42 280 Q75 262 110 280 L106 330 Q75 344 46 330Z" fill="{SKIN}" stroke="{O}" stroke-width="4"/>')

def gamchha():
    b = '<path d="M10 20 Q130 0 250 20 L240 120 Q130 100 20 120Z" fill="#D7263D" stroke="#3A2416" stroke-width="4"/>'
    b += "".join(f'<path d="M{x} 14 L{x-8} 116" stroke="#fff" stroke-width="5"/>' for x in range(40, 240, 40))
    b += "".join(f'<path d="M14 {y} Q130 {y-14} 246 {y}" fill="none" stroke="#fff" stroke-width="4"/>' for y in (50, 85))
    return svg(260, 130, b)

def chappal(muddy=True):
    b = (f'<path d="M30 40 Q20 150 60 210 Q90 236 120 210 Q150 150 130 40 Q80 0 30 40Z" fill="#6E4A2A" stroke="{O}" stroke-width="5"/>'
         f'<path d="M50 70 L80 120 L112 70" fill="none" stroke="{O}" stroke-width="12"/><path d="M50 70 L80 120 L112 70" fill="none" stroke="#B5793A" stroke-width="7"/>')
    if muddy:
        b += ('<g fill="#5A4026" opacity=".9"><ellipse cx="70" cy="170" rx="38" ry="22"/><ellipse cx="110" cy="60" rx="18" ry="12"/>'
              '<path d="M60 205 q4 26 -2 40 q-8 -14 2 -40Z M118 200 q6 18 0 30 q-8 -12 0 -30Z"/></g>')
    return svg(170, 260, b)

def mud_blob():
    return svg(70, 60, '<path d="M10 30 Q6 8 30 10 Q52 2 60 24 Q70 46 46 52 Q20 60 10 30Z" fill="#5A4026"/><circle cx="62" cy="10" r="5" fill="#5A4026"/><circle cx="6" cy="50" r="4" fill="#5A4026"/>')

def cup_world():
    """Tea cup on the ghat step (side view), coin hidden inside."""
    return svg(120, 110, f'<path d="M14 20 L106 20 L96 96 Q60 108 24 96Z" fill="#F4F2EC" stroke="{O}" stroke-width="4"/>'
                         f'<path d="M104 36 Q132 44 118 72 Q110 82 98 78" fill="none" stroke="{O}" stroke-width="6"/>'
                         f'<ellipse cx="60" cy="20" rx="46" ry="10" fill="#E3E0D6" stroke="{O}" stroke-width="4"/><path d="M28 50 Q60 60 92 50" stroke="#D7263D" stroke-width="5" fill="none"/>')

def stick(bent):
    """Bamboo stick half in water (close-up). bent=True: lower part looks shifted up/broken at the surface."""
    w, h = 500, 900; wl = 430
    b = f'<rect x="0" y="{wl}" width="{w}" height="{h-wl}" fill="#5D9FB0" opacity=".55"/><path d="M0 {wl} H{w}" stroke="#E9F7FA" stroke-width="6"/>'
    top = f'<path d="M120 40 L{250} {wl}" stroke="{O}" stroke-width="30"/><path d="M120 40 L250 {wl}" stroke="#C9A160" stroke-width="22"/>'
    top += "".join(f'<path d="M{120+130*k/4-12} {40+(wl-40)*k/4} l24 -6" stroke="{O}" stroke-width="4"/>' for k in (1, 2, 3))
    if bent:
        low = f'<path d="M250 {wl} L450 {wl+230}" stroke="{O}" stroke-width="30" opacity=".85"/><path d="M250 {wl} L450 {wl+230}" stroke="#C9A160" stroke-width="22" opacity=".85"/>'
    else:
        low = f'<path d="M250 {wl} L380 {wl+390}" stroke="{O}" stroke-width="30" opacity=".85"/><path d="M250 {wl} L380 {wl+390}" stroke="#C9A160" stroke-width="22" opacity=".85"/>'
    return svg(w, h, b + low + top)

def glass_spoon():
    b = ('<rect x="30" y="20" width="180" height="300" rx="14" fill="#E6F4FA" fill-opacity=".55" stroke="#3A2416" stroke-width="5"/>'
         '<rect x="34" y="140" width="172" height="176" rx="10" fill="#7FC3D8" opacity=".6"/><path d="M34 140 H206" stroke="#fff" stroke-width="4"/>'
         '<path d="M150 0 L120 140" stroke="#8C949C" stroke-width="12"/><path d="M150 0 L120 140" stroke="#C8CED4" stroke-width="7"/>'
         '<path d="M136 140 L96 290" stroke="#8C949C" stroke-width="12" opacity=".9"/><ellipse cx="94" cy="296" rx="16" ry="24" fill="#C8CED4" stroke="#8C949C" stroke-width="4"/>')
    return svg(240, 330, b)

def coin():
    return svg(70, 70, f'<circle cx="35" cy="35" r="30" fill="#E8C14A" stroke="#8A6A12" stroke-width="5"/>' + T(35, 47, 34, "৫", "#8A6A12", "Baloo"))

def tag(txt, w, fs=46, fill="#D7263D", col="#FFFFFF"):
    h = fs * 1.7
    return svg(w, h + 12, f'<rect x="6" y="10" width="{w-12}" height="{h}" rx="16" fill="#1A1A1A" opacity=".25"/><rect x="0" y="0" width="{w-12}" height="{h}" rx="16" fill="{fill}" stroke="{O}" stroke-width="4"/>'
                          + T((w - 12) / 2, h * 0.68, fs, txt, col))

# ------------------------------------------------------------------ notebook boards (screen layer, 1080 wide)
def eye(x, y, s=1):
    return (f'<g transform="translate({x} {y}) scale({s})"><path d="M-40 0 Q0 -30 40 0 Q0 30 -40 0Z" fill="#fff" stroke="{INK}" stroke-width="4"/>'
            f'<circle r="14" fill="#5A3A22"/><circle r="6" fill="#111"/></g>')

def cup_xsec(x, y, water):
    b = f'<path d="M{x-120} {y-170} L{x-100} {y} L{x+100} {y} L{x+120} {y-170}" fill="none" stroke="{INK}" stroke-width="6"/>'
    if water:
        b += f'<path d="M{x-117} {y-130} L{x+117} {y-130} L{x+100} {y} L{x-100} {y}Z" fill="#7FC3D8" opacity=".55"/><path d="M{x-117} {y-130} H{x+117}" stroke="#3E8EA6" stroke-width="4"/>'
    b += f'<ellipse cx="{x+40}" cy="{y-10}" rx="26" ry="8" fill="#E8C14A" stroke="#8A6A12" stroke-width="3"/>'
    return b

def board_cup_empty():
    """Left half: empty cup, straight ray blocked by the rim."""
    b = cup_xsec(300, 900, False) + eye(70, 600, 1)
    b += f'<path d="M340 890 L180 730" stroke="#E0A800" stroke-width="6" stroke-dasharray="14 10"/>'
    b += f'<path d="M160 710 l30 30 M190 710 l-30 30" stroke="#D7263D" stroke-width="7"/>'
    b += T(300, 1010, 40, "খালি কাপ: মুদ্রা দেখা যায় না")
    return svg(1080, 1100, b)

def board_cup_water():
    """Right panel: water in cup, ray bends away from the normal at the surface, eye sees it; dashed apparent coin."""
    b = cup_xsec(760, 900, True) + eye(520, 560, 1)
    sx, sy = 690, 770   # point on the water surface
    b += f'<path d="M{sx} 690 V850" stroke="#555" stroke-width="3" stroke-dasharray="8 8"/>' + T(sx + 8, 680, 28, "লম্ব", "#555", anchor="start")
    b += f'<path d="M800 890 L{sx} {sy}" stroke="#E0A800" stroke-width="7"/>'
    b += f'<path d="M{sx} {sy} L560 580" stroke="#E0A800" stroke-width="7"/><path d="M574 600 l-2 -26 l24 8" fill="none" stroke="#E0A800" stroke-width="6"/>'
    return svg(1080, 1100, b + T(760, 1010, 40, "পানি ঢাললে: মুদ্রা দেখা যায়"))

def board_apparent():
    """Dashed line from eye back through the surface point: the coin is seen higher."""
    sx, sy = 690, 770
    b = f'<path d="M{sx} {sy} L{sx+90} {sy+120}" stroke="#7A4FB5" stroke-width="5" stroke-dasharray="12 10"/>'
    b += f'<ellipse cx="{sx+100}" cy="{sy+130}" rx="26" ry="8" fill="#E8C14A" fill-opacity=".45" stroke="#7A4FB5" stroke-width="3" stroke-dasharray="6 5"/>'
    b += T(sx + 140, sy + 108, 30, "মুদ্রা উপরে দেখায়", "#7A4FB5", anchor="start")
    return svg(1080, 1100, b)

def board_title(txt, w=900, fs=64):
    return svg(w, 120, f'<rect x="0" y="0" width="{w}" height="110" rx="18" fill="#FFC300" stroke="{O}" stroke-width="5"/>' + T(w / 2, 76, fs, txt, INK, "Baloo"))

def board_rule(lines, w=960):
    h = 70 + 64 * len(lines)
    b = f'<rect x="0" y="0" width="{w}" height="{h}" rx="20" fill="#FFFFFF" stroke="{O}" stroke-width="4"/>'
    for i, (txt, col) in enumerate(lines):
        b += T(40, 70 + 64 * i, 40, txt, col, anchor="start")
    return svg(w, h, b)

def board_depth():
    """Pond cut-away: real bottom vs apparent bottom, fish real vs seen; 4 ft -> about 3 ft."""
    b = '<rect x="80" y="300" width="920" height="560" fill="#7FC3D8" opacity=".5"/><path d="M80 300 H1000" stroke="#3E8EA6" stroke-width="6"/>'
    b += '<path d="M80 860 H1000" stroke="#6E5A3A" stroke-width="10"/><rect x="80" y="860" width="920" height="40" fill="#8A6E44" opacity=".6"/>'
    b += '<path d="M80 720 H1000" stroke="#7A4FB5" stroke-width="5" stroke-dasharray="16 12"/>'
    b += eye(540, 180, 1.1) + '<path d="M540 215 V290" stroke="#E0A800" stroke-width="6"/>'
    b += '<path d="M150 300 V860" stroke="#1A1A1A" stroke-width="5"/><path d="M135 300 h30 M135 860 h30" stroke="#1A1A1A" stroke-width="5"/>'
    b += T(175, 600, 40, "আসল: ৪ ফুট", INK, anchor="start")
    b += '<path d="M930 300 V720" stroke="#7A4FB5" stroke-width="5"/><path d="M915 300 h30 M915 720 h30" stroke="#7A4FB5" stroke-width="5"/>'
    b += T(905, 520, 40, "দেখায়: প্রায় ৩ ফুট", "#7A4FB5", anchor="end")
    b += T(540, 960, 34, "ওপর থেকে সোজা তাকালে", "#555")
    return svg(1080, 1000, b)

def wheel():
    spokes = "".join(f'<path d="M0 0 L{140*math.cos(math.radians(a)):.0f} {140*math.sin(math.radians(a)):.0f}" stroke="{INK}" stroke-width="7"/>' for a in range(0, 360, 30))
    return svg(380, 380, f'<g transform="translate(190 190)"><circle r="170" fill="none" stroke="{INK}" stroke-width="22"/><circle r="150" fill="none" stroke="#F72585" stroke-width="10"/>{spokes}<circle r="22" fill="#FFC300" stroke="{INK}" stroke-width="6"/></g>')

def banner():
    return svg(880, 200, f'<rect x="10" y="10" width="860" height="180" rx="26" fill="#1A1A1A" stroke="{O}" stroke-width="6"/>'
                         f'<rect x="30" y="30" width="820" height="140" rx="18" fill="none" stroke="#FFC300" stroke-width="6" stroke-dasharray="22 12"/>'
                         f'<circle cx="70" cy="100" r="14" fill="#F72585"/><circle cx="810" cy="100" r="14" fill="#F72585"/>'
                         + T(440, 126, 100, "সাইন্টিফিক বিথী", "#FFC300", "Baloo", extra='stroke="#D7263D" stroke-width="10" paint-order="stroke"'))
