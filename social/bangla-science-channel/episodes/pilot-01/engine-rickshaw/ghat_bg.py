"""Detailed launch-ghat background (1080x1920 world), rickshaw-art style, no text."""
import random

def person(x, y, s=1.0, shirt="#D7263D", lower="#1E5AA8", skin="#C98B5A", extra=""):
    # simple standing paper figure, feet at (x, y), ~120 px tall at s=1
    return (f'<g transform="translate({x} {y}) scale({s})">'
            f'<rect x="-11" y="-46" width="9" height="46" fill="{lower}"/><rect x="2" y="-46" width="9" height="46" fill="{lower}"/>'
            f'<path d="M-20 -46 L20 -46 L16 -96 L-16 -96 Z" fill="{shirt}"/>'
            f'<circle cy="-110" r="15" fill="{skin}"/><path d="M-15 -114 Q0 -132 15 -114 Q0 -120 -15 -114Z" fill="#1A1A1A"/>{extra}</g>')

def launch(x, y, w, hull="#D7263D", band="#FFC300", deck1="#FFFFFF", deck2="#FFF6E5", top="#00A6A6", decks=3, seed=1):
    """Double/triple-decker river launch; (x,y) = left end of waterline."""
    r = random.Random(seed); s = []
    h_hull = w * 0.18; dh = w * 0.11
    s.append(f'<path d="M{x-10} {y-h_hull} L{x+w+30} {y-h_hull} L{x+w-20} {y} Q{x+w/2} {y+h_hull*0.35} {x+20} {y} Z" fill="{hull}"/>')
    s.append(f'<rect x="{x-6}" y="{y-h_hull*0.62}" width="{w+28}" height="{h_hull*0.16}" fill="{band}"/>')
    # life rings on hull
    for k in range(3):
        cx = x + w * (0.18 + 0.3 * k); s.append(f'<circle cx="{cx}" cy="{y-h_hull*0.32}" r="{h_hull*0.17}" fill="#FF7A00"/><circle cx="{cx}" cy="{y-h_hull*0.32}" r="{h_hull*0.08}" fill="{hull}"/>')
    yy = y - h_hull
    cols = [deck1, deck2, top]
    for d in range(decks):
        inset = d * w * 0.06
        y0 = yy - dh
        s.append(f'<rect x="{x+inset}" y="{y0}" width="{w-2*inset}" height="{dh}" fill="{cols[d%3]}"/>')
        # railing
        s.append(f'<path d="M{x+inset} {y0+dh*0.35} H{x+w-inset}" stroke-width="3"/>')
        n = int((w - 2*inset) / (dh * 0.75))
        for i in range(n):
            wx = x + inset + 10 + i * (w - 2*inset - 20) / max(1, n)
            s.append(f'<rect x="{wx}" y="{y0+dh*0.42}" width="{dh*0.42}" height="{dh*0.42}" rx="4" fill="#4CC9F0" stroke-width="3"/>')
            if r.random() < 0.45:   # passenger head in window
                c = r.choice(["#C98B5A", "#A86F45", "#D9A066"])
                s.append(f'<circle cx="{wx+dh*0.21}" cy="{y0+dh*0.62}" r="{dh*0.12}" fill="{c}" stroke-width="2"/>')
        yy = y0
    # chimney + mast + flags
    cx = x + w * 0.62
    s.append(f'<rect x="{cx}" y="{yy-dh*1.0}" width="{dh*0.55}" height="{dh}" fill="#D7263D"/><rect x="{cx}" y="{yy-dh*1.0}" width="{dh*0.55}" height="{dh*0.22}" fill="#1A1A1A"/>')
    mx = x + w * 0.25
    s.append(f'<path d="M{mx} {yy} V{yy-dh*1.6}" stroke-width="4"/>')
    s.append(f'<path d="M{mx} {yy-dh*1.6} L{mx+dh*0.7} {yy-dh*1.4} L{mx} {yy-dh*1.2} Z" fill="#2BA84A"/><circle cx="{mx+dh*0.25}" cy="{yy-dh*1.4}" r="{dh*0.08}" fill="#D7263D" stroke="none"/>')
    s.append(f'<path d="M{mx} {yy-dh*1.6} Q{x+w*0.45} {yy-dh*1.1} {cx+dh*0.3} {yy-dh*0.4}" fill="none" stroke-width="2"/>')
    for i in range(6):
        fx = mx + (cx - mx) * (i + 0.5) / 6; fy = yy - dh*1.6 + (dh*1.2) * (i + 0.5) / 6
        s.append(f'<path d="M{fx-7} {fy} L{fx+7} {fy} L{fx} {fy+14} Z" fill="{["#F72585","#FFC300","#2BA84A","#00A6A6"][i%4]}" stroke-width="2"/>')
    return "".join(s)

def boat(x, y, s=1.0, man=True):
    out = (f'<g transform="translate({x} {y}) scale({s})">'
           f'<path d="M-110 -20 Q0 25 110 -20 L90 10 Q0 40 -90 10 Z" fill="#8B4A1F"/>'
           f'<path d="M-40 -18 Q0 -70 40 -18 Z" fill="#FFC300"/><path d="M-40 -18 Q0 -70 40 -18" fill="none" stroke-width="3"/>')
    if man:
        out += person(70, -14, 0.55, shirt="#FFFFFF", lower="#2BA84A") + '<path d="M90 -60 L130 30" stroke="#8B4A1F" stroke-width="6"/>'
    return out + '</g>'

def hyacinth(x, y):
    return (f'<g transform="translate({x} {y})"><ellipse rx="34" ry="10" fill="#2BA84A"/><ellipse cx="-14" cy="-6" rx="12" ry="8" fill="#3BC45A"/>'
            f'<ellipse cx="14" cy="-7" rx="12" ry="8" fill="#3BC45A"/><circle cy="-14" r="6" fill="#B07CE0"/></g>')

def skyline():
    r = random.Random(11); s = []; x = -20
    pal = ["#F7A8B8", "#FFD580", "#A8E6CF", "#FFFFFF", "#C3B1E1", "#FFB38A", "#9AD8F0"]
    while x < 1100:
        w = r.randint(60, 115); h = r.randint(70, 190); c = r.choice(pal); top = 1010 - h
        s.append(f'<rect x="{x}" y="{top}" width="{w}" height="{h}" fill="{c}"/>')
        for wy in range(top + 14, 990, 26):
            for wx in range(x + 10, x + w - 12, 22):
                s.append(f'<rect x="{wx}" y="{wy}" width="10" height="13" fill="#5A6F80" stroke="none"/>')
        if r.random() < 0.3:
            s.append(f'<rect x="{x+w*0.3}" y="{top-26}" width="{w*0.4}" height="26" fill="{r.choice(pal)}"/>')
        x += w + r.randint(-6, 4)
    # mosque
    s.append('<rect x="690" y="880" width="150" height="130" fill="#FFFFFF"/><path d="M700 882 Q765 790 830 882 Z" fill="#2BA84A"/><path d="M765 800 V770" stroke-width="4"/>'
             '<circle cx="765" cy="766" r="6" fill="#FFC300"/><rect x="855" y="800" width="26" height="210" fill="#FFFFFF"/><path d="M852 802 Q868 760 884 802 Z" fill="#2BA84A"/>'
             '<path d="M720 1010 V930 Q740 905 760 930 V1010 Z" fill="#00A6A6"/><path d="M770 1010 V930 Q790 905 810 930 V1010 Z" fill="#00A6A6"/>')
    # water tower + trees
    s.append('<rect x="300" y="790" width="70" height="44" rx="8" fill="#D7263D"/><path d="M308 834 L298 1010 M362 834 L372 1010 M300 900 L370 900" stroke-width="5" fill="none"/>')
    for tx in (160, 470, 960, 1050):
        s.append(f'<circle cx="{tx}" cy="975" r="34" fill="#2BA84A"/><circle cx="{tx+26}" cy="990" r="24" fill="#3BC45A"/>')
    return "".join(s)

def bunting():
    cols = ["#D7263D", "#FFC300", "#F72585", "#2BA84A", "#00A6A6"]
    s = '<path d="M0 250 Q540 330 1080 250" fill="none" stroke-width="5"/>'
    for i in range(15):
        x = 36 + i * 72; y = 250 + 80 * (1 - ((x - 540) / 540) ** 2)
        s += f'<path d="M{x-28:.0f} {y-3:.0f} L{x+28:.0f} {y-3:.0f} L{x:.0f} {y+50:.0f} Z" fill="{cols[i%5]}" stroke-width="4"/>'
    return s

def ghat_svg():
    p = []
    p.append('<rect width="1080" height="1010" fill="#4CC9F0" stroke="none"/>')
    p.append('<g fill="#FFC300" stroke-width="5"><path d="M860 120 L878 70 L896 120Z"/><path d="M980 300 L1035 318 L980 336Z"/><path d="M740 300 L685 318 L740 336Z"/><path d="M860 500 L878 550 L896 500Z"/></g>'
             '<circle cx="878" cy="318" r="118" fill="#D7263D" stroke-width="7"/><circle cx="878" cy="318" r="80" fill="none" stroke="#FFC300" stroke-width="7" stroke-dasharray="16 14"/>')
    p.append('<g fill="#fff" stroke-width="5"><path d="M110 470 q12 -60 72 -48 q24 -48 84 -18 q60 -12 66 42 q48 12 24 54 h-240 q-48 -6 -6 -30z"/><path d="M470 600 q10 -46 58 -36 q22 -36 66 -12 q48 -8 50 34 q36 10 17 41 h-192 q-36 -5 1 -27z"/></g>')
    p.append('<g fill="none" stroke-width="5"><path d="M380 160 l18 -12 l18 12"/><path d="M640 120 l14 -9 l14 9"/></g>')   # kites/birds far
    p.append(f'<g stroke-width="4">{skyline()}</g>')
    p.append(bunting())
    # river
    p.append('<rect y="1005" width="1080" height="330" fill="#1F8FD1" stroke="none"/>')
    p.append('<g stroke="none" fill="#4CC9F0" opacity=".45"><rect x="0" y="1030" width="1080" height="10"/><rect x="0" y="1075" width="1080" height="7"/><rect x="0" y="1290" width="1080" height="8"/></g>')
    # far launch, right launch, main launch
    p.append(f'<g stroke-width="4">{launch(170, 1035, 260, hull="#1E5AA8", band="#FFFFFF", top="#FFC300", decks=2, seed=5)}</g>')
    p.append(f'<g stroke-width="5">{launch(700, 1150, 420, hull="#2BA84A", band="#FFC300", deck2="#FFE3B3", top="#F72585", decks=3, seed=9)}</g>')
    p.append(f'<g stroke-width="6">{launch(60, 1175, 620, hull="#D7263D", band="#FFC300", top="#00A6A6", decks=3, seed=3)}</g>')
    # mooring ropes from pontoon bollards up to launches
    p.append('<g fill="none" stroke="#8B5A2B" stroke-width="7"><path d="M115 1350 Q150 1250 190 1150"/><path d="M965 1350 Q930 1240 880 1130"/></g>')
    # boats and hyacinth
    p.append(f'<g stroke-width="4">{boat(880, 1225, 0.8)}{boat(470, 1250, 0.6, man=False)}</g>')
    p.append(f'<g stroke="#1A1A1A" stroke-width="3">{hyacinth(330,1240)}{hyacinth(660,1215)}{hyacinth(1010,1265)}{hyacinth(150,1225)}</g>')
    p.append('<g fill="none" stroke="#fff" stroke-width="5" opacity=".85"><path d="M60 1300 q24 -14 48 0 t48 0"/><path d="M720 1285 q24 -14 48 0 t48 0"/><path d="M400 1305 q24 -14 48 0 t48 0"/></g>')
    # gangway from pontoon to main launch
    p.append('<g stroke-width="5"><path d="M520 1345 L600 1345 L585 1160 L545 1160 Z" fill="#B5793A"/><path d="M528 1300 H595 M533 1250 H592 M538 1200 H589" stroke-width="3"/>'
             '<path d="M515 1345 L540 1150 M605 1345 L590 1150" fill="none" stroke="#8B5A2B" stroke-width="5"/></g>')
    # lamp post
    p.append('<g stroke-width="5"><rect x="1030" y="900" width="14" height="440" fill="#1A1A1A"/><path d="M1000 900 H1074 L1062 870 H1012 Z" fill="#FFC300"/><circle cx="1037" cy="912" r="10" fill="#FFF6E5"/></g>')
    # railing (pontoon edge)
    p.append('<rect y="1255" width="1080" height="28" fill="#00A6A6" stroke-width="6"/>')
    p.append(f'<path d="M0 1283 {" ".join("q45 46 90 0" for _ in range(12))}" fill="none" stroke="#D7263D" stroke-width="8"/>')
    p.append('<g fill="#FFC300" stroke-width="4">' + "".join(f'<rect x="{80+i*180}" y="1255" width="12" height="78"/>' for i in range(6)) + '</g>')
    # life buoys on railing
    for bx in (300, 820):
        p.append(f'<g stroke-width="5"><circle cx="{bx}" cy="1290" r="34" fill="#FF7A00"/><circle cx="{bx}" cy="1290" r="16" fill="#1F8FD1"/>'
                 f'<path d="M{bx-34} 1290 H{bx-16} M{bx+16} 1290 H{bx+34} M{bx} 1256 V1274 M{bx} 1306 V1324" stroke="#FFFFFF" stroke-width="9"/></g>')
    # crows on railing
    for cx in (690, 735):
        p.append(f'<g transform="translate({cx} 1253)" stroke-width="3"><path d="M-16 0 Q-4 -24 14 -18 L26 -22 L18 -12 Q10 0 -16 0Z" fill="#1A1A1A"/><circle cx="12" cy="-17" r="3" fill="#fff" stroke="none"/></g>')
    # pontoon deck
    p.append('<rect y="1333" width="1080" height="1400" fill="#9DB4BC" stroke="none"/>')
    p.append('<g stroke="none">' + "".join(f'<path d="M{x} 1333 l40 0 l-30 22 l-40 0 Z" fill="{"#FFC300" if i%2 else "#1A1A1A"}"/>' for i, x in enumerate(range(-20, 1100, 40))) + '</g>')
    p.append('<path d="M0 1355 H1080" stroke-width="6"/>')
    p.append('<g stroke="#7A929A" stroke-width="5"><path d="M0 1460 H1080 M0 1590 H1080 M0 1740 H1080 M0 1900 H1080 M0 2060 H1080"/><path d="M180 1355 V1460 M640 1460 V1590 M300 1590 V1740 M860 1590 V1740 M520 1355 V1460"/></g>')
    p.append('<g fill="#7A929A" stroke="none">' + "".join(f'<circle cx="{x}" cy="{y}" r="5"/>' for x in range(40, 1080, 120) for y in (1400, 1525, 1665)) + '</g>')
    # bollards with rope coils
    for bx in (115, 965):
        p.append(f'<g stroke-width="5"><rect x="{bx-16}" y="1342" width="32" height="40" fill="#1A1A1A"/><ellipse cx="{bx}" cy="1342" rx="26" ry="10" fill="#333"/>'
                 f'<ellipse cx="{bx+50}" cy="1392" rx="30" ry="12" fill="none" stroke="#8B5A2B" stroke-width="7"/><ellipse cx="{bx+50}" cy="1392" rx="18" ry="7" fill="none" stroke="#8B5A2B" stroke-width="6"/></g>')
    # background crowd on the pontoon (small, near railing, mostly at the sides)
    crowd = [
        person(40, 1352, 0.95, shirt="#D7263D", lower="#1A1A1A", extra='<rect x="-26" y="-160" width="52" height="30" rx="5" fill="#2E6FB5"/>'),   # porter with trunk
        person(205, 1356, 0.85, shirt="#F72585", lower="#F72585"),                                                                              # woman in sari
        person(430, 1350, 0.8, shirt="#FFFFFF", lower="#2BA84A", extra='<path d="M-30 -128 Q0 -170 30 -128 Z" fill="#1A1A1A"/><path d="M0 -128 V-90" stroke-width="3"/>'),   # umbrella
        person(1010, 1354, 0.9, shirt="#FFC300", lower="#1E5AA8", extra='<ellipse cx="0" cy="-138" rx="26" ry="14" fill="#B5793A"/>'),         # basket on head
        person(1060, 1360, 0.7, shirt="#2BA84A", lower="#B58B4C"),
    ]
    p.append(f'<g stroke-width="3">{"".join(crowd)}</g>')
    # foreground props at the edges
    p.append('<g stroke-width="5"><path d="M960 1720 Q1000 1640 1040 1720 Z" fill="#E4C27A"/><path d="M1000 1725 Q1050 1650 1100 1725 Z" fill="#D9B062"/><path d="M985 1700 H1060" stroke-width="3"/></g>')
    p.append('<g stroke-width="5"><ellipse cx="40" cy="1700" rx="70" ry="26" fill="#B5793A"/><path d="M-10 1690 Q20 1640 50 1688 M20 1690 Q55 1636 90 1686" fill="none" stroke="#FFC300" stroke-width="16"/></g>')
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920" style="overflow:visible">'
            '<g stroke="#1A1A1A" stroke-linejoin="round" stroke-linecap="round">' + "".join(p) + '</g></svg>')
