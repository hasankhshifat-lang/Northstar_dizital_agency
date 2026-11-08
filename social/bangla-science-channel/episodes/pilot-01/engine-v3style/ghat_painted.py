"""Painted (soft, atmospheric) launch-ghat background, 1080x1920, for the v3 cartoon style.
Same layout as ghat_bg.py, but: gradient sky and light, hazy blurred far layers, soft outlines,
water gradient with reflections, shaded pontoon deck, warm light and vignette, paper grain. No text."""
import ghat_bg as G

DEFS = '''<defs>
 <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6FB7E3"/><stop offset=".55" stop-color="#A9D8EE"/><stop offset="1" stop-color="#FBE3C1"/></linearGradient>
 <radialGradient id="sun" cx="860" cy="330" r="420" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFF6D8" stop-opacity=".95"/><stop offset=".25" stop-color="#FFE6A8" stop-opacity=".55"/><stop offset="1" stop-color="#FFE6A8" stop-opacity="0"/></radialGradient>
 <linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8CC3D8"/><stop offset=".35" stop-color="#4E93B5"/><stop offset="1" stop-color="#2C6788"/></linearGradient>
 <linearGradient id="deck" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FA3AB"/><stop offset=".3" stop-color="#A9BBC1"/><stop offset="1" stop-color="#7E9199"/></linearGradient>
 <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EAF4F8" stop-opacity=".15"/><stop offset="1" stop-color="#F6E9D6" stop-opacity=".7"/></linearGradient>
 <linearGradient id="warm" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD9A0" stop-opacity=".2"/><stop offset=".6" stop-color="#FFD9A0" stop-opacity="0"/></linearGradient>
 <radialGradient id="vig" cx=".5" cy=".45" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#1A1020" stop-opacity=".38"/></radialGradient>
 <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
 <filter id="far" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="2.4"/><feColorMatrix type="saturate" values=".6"/></filter>
 <filter id="mid" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="1.0"/><feColorMatrix type="saturate" values="1.1"/></filter>
 <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14"/></filter>
 <filter id="refl" x="-5%" y="-5%" width="110%" height="120%"><feGaussianBlur stdDeviation="3 6"/></filter>
 <filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .07"/></feComponentTransfer></filter>
</defs>'''

def painted_svg():
    p = [DEFS]
    # sky, sun glow, soft clouds
    p.append('<rect width="1080" height="1020" fill="url(#sky)"/><rect width="1080" height="1020" fill="url(#sun)"/>')
    p.append('<circle cx="860" cy="330" r="70" fill="#FFF3D2" filter="url(#soft)" opacity=".9"/>')
    p.append('<g fill="#FFFFFF" filter="url(#soft)" opacity=".85"><ellipse cx="220" cy="450" rx="170" ry="42"/><ellipse cx="300" cy="420" rx="100" ry="40"/>'
             '<ellipse cx="600" cy="600" rx="150" ry="34"/><ellipse cx="660" cy="575" rx="80" ry="32"/><ellipse cx="960" cy="180" rx="120" ry="26"/></g>')
    # far skyline: soft lines, blurred, hazed
    p.append(f'<g filter="url(#far)" stroke="#55606E" stroke-opacity=".45" stroke-width="3" opacity=".9">{G.skyline()}</g>')
    p.append('<rect y="760" width="1080" height="262" fill="url(#haze)"/>')
    # river with gradient, soft highlight streaks
    p.append('<rect y="1005" width="1080" height="340" fill="url(#water)"/>')
    p.append('<g fill="#DDF1F7" opacity=".35" filter="url(#mid)"><rect x="60" y="1036" width="420" height="5" rx="2"/><rect x="620" y="1060" width="380" height="4" rx="2"/>'
             '<rect x="140" y="1300" width="300" height="5" rx="2"/><rect x="700" y="1290" width="260" height="4" rx="2"/></g>')
    # launches: far (hazed), right and main (mid blur), with blurred reflections
    far = G.launch(170, 1035, 260, hull="#1E5AA8", band="#FFFFFF", top="#FFC300", decks=2, seed=5)
    right = G.launch(700, 1150, 420, hull="#2BA84A", band="#FFC300", deck2="#FFE3B3", top="#F72585", decks=3, seed=9)
    main = G.launch(60, 1175, 620, hull="#D7263D", band="#FFC300", top="#00A6A6", decks=3, seed=3)
    for g, y in ((right, 1150), (main, 1175)):
        p.append(f'<g transform="translate(0 {2*y}) scale(1 -1)" opacity=".22" filter="url(#refl)" stroke="none">{g}</g>')
    p.append(f'<g filter="url(#far)" stroke="#3A3F4A" stroke-opacity=".4" stroke-width="3" opacity=".85">{far}</g>')
    p.append('<rect y="960" width="1080" height="70" fill="url(#haze)" opacity=".35"/>')
    p.append(f'<g filter="url(#mid)" stroke="#2E2A33" stroke-opacity=".5" stroke-width="4">{right}</g>')
    p.append(f'<g filter="url(#mid)" stroke="#2E2A33" stroke-opacity=".55" stroke-width="4.5">{main}</g>')
    # mooring ropes, boats, hyacinth (soft)
    p.append('<g fill="none" stroke="#6E4A2A" stroke-width="6" opacity=".9"><path d="M115 1350 Q150 1250 190 1150"/><path d="M965 1350 Q930 1240 880 1130"/></g>')
    p.append(f'<g filter="url(#mid)" stroke="#2E2A33" stroke-opacity=".5" stroke-width="3">{G.boat(880, 1225, 0.8)}{G.boat(470, 1250, 0.6, man=False)}'
             f'{G.hyacinth(330,1240)}{G.hyacinth(660,1215)}{G.hyacinth(1010,1265)}{G.hyacinth(150,1225)}</g>')
    # gangway and lamp post (sharper: closer to camera)
    p.append('<g stroke="#2E2A33" stroke-opacity=".6" stroke-width="4"><path d="M520 1345 L600 1345 L585 1160 L545 1160 Z" fill="#A87040"/><path d="M528 1300 H595 M533 1250 H592 M538 1200 H589" stroke-width="3"/>'
             '<path d="M515 1345 L540 1150 M605 1345 L590 1150" fill="none" stroke="#6E4A2A" stroke-opacity="1" stroke-width="5"/></g>')
    p.append('<g stroke="#2E2A33" stroke-opacity=".6" stroke-width="4"><rect x="1030" y="900" width="14" height="440" fill="#2A2A30"/><path d="M1000 900 H1074 L1062 870 H1012 Z" fill="#E8B23A"/>'
             '<circle cx="1037" cy="912" r="10" fill="#FFF6E5"/></g><circle cx="1037" cy="912" r="40" fill="#FFF0C0" filter="url(#soft)" opacity=".7"/>')
    # railing
    p.append('<rect y="1255" width="1080" height="28" fill="#1F8C8C" stroke="#2E2A33" stroke-opacity=".6" stroke-width="4"/><rect y="1255" width="1080" height="8" fill="#7FD3D3" opacity=".5"/>')
    p.append(f'<path d="M0 1283 {" ".join("q45 46 90 0" for _ in range(12))}" fill="none" stroke="#B92436" stroke-width="7"/>')
    p.append('<g fill="#E0A820" stroke="#2E2A33" stroke-opacity=".6" stroke-width="3">' + "".join(f'<rect x="{80+i*180}" y="1255" width="12" height="78"/>' for i in range(6)) + '</g>')
    for bx in (300, 820):
        p.append(f'<g stroke="#2E2A33" stroke-opacity=".6" stroke-width="4"><circle cx="{bx}" cy="1290" r="34" fill="#F07A1A"/><circle cx="{bx}" cy="1290" r="16" fill="#3E7FA0"/>'
                 f'<path d="M{bx-34} 1290 H{bx-16} M{bx+16} 1290 H{bx+34} M{bx} 1256 V1274 M{bx} 1306 V1324" stroke="#F4F0E8" stroke-opacity="1" stroke-width="8"/></g>')
    # pontoon deck: gradient, soft hazard edge, plates, shadow band under railing, light pool
    p.append('<rect y="1333" width="1080" height="1400" fill="url(#deck)"/>')
    p.append('<g opacity=".8">' + "".join(f'<path d="M{x} 1333 l40 0 l-30 22 l-40 0 Z" fill="{"#E6B422" if i%2 else "#2A2A30"}"/>' for i, x in enumerate(range(-20, 1100, 40))) + '</g>')
    p.append('<rect y="1355" width="1080" height="70" fill="url(#shade)"/>')
    p.append('<g stroke="#6F838B" stroke-width="3" opacity=".7"><path d="M0 1460 H1080 M0 1590 H1080 M0 1740 H1080 M0 1900 H1080 M0 2060 H1080"/>'
             '<path d="M180 1355 V1460 M640 1460 V1590 M300 1590 V1740 M860 1590 V1740 M520 1355 V1460"/></g>')
    p.append('<ellipse cx="640" cy="1650" rx="520" ry="170" fill="#FFF1D6" opacity=".22" filter="url(#soft)"/>')
    for bx in (115, 965):
        p.append(f'<g stroke="#2E2A33" stroke-opacity=".6" stroke-width="4"><rect x="{bx-16}" y="1342" width="32" height="40" fill="#2A2A30"/><ellipse cx="{bx}" cy="1342" rx="26" ry="10" fill="#45454E"/>'
                 f'<ellipse cx="{bx+50}" cy="1392" rx="30" ry="12" fill="none" stroke="#7A5230" stroke-opacity="1" stroke-width="7"/></g>')
    # background people: soft, slightly hazed so the main characters pop
    crowd = [G.person(40, 1352, 0.95, shirt="#B83A48", lower="#2A2A30", extra='<rect x="-26" y="-160" width="52" height="30" rx="5" fill="#2E6FB5"/>'),
             G.person(205, 1356, 0.85, shirt="#D2508A", lower="#D2508A"),
             G.person(430, 1350, 0.8, shirt="#F2EEE6", lower="#3C8A55", extra='<path d="M-30 -128 Q0 -170 30 -128 Z" fill="#2A2A30"/>'),
             G.person(1010, 1354, 0.9, shirt="#E2B23A", lower="#2E5A92", extra='<ellipse cx="0" cy="-138" rx="26" ry="14" fill="#A87040"/>')]
    p.append(f'<g filter="url(#mid)" stroke="#2E2A33" stroke-opacity=".45" stroke-width="3" opacity=".9">{"".join(crowd)}</g>')
    # global light: warm key light from top-right, vignette, paper grain
    p.append('<rect width="1080" height="1920" fill="url(#warm)"/><rect width="1080" height="1920" fill="url(#vig)"/>')
    p.append('<rect width="1080" height="1920" filter="url(#grain)"/>')
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920" style="overflow:visible">'
            '<g stroke-linejoin="round" stroke-linecap="round">' + "".join(p) + '</g></svg>')
