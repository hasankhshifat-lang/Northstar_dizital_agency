import json, sys, os
INK="#1A1A1A"; SKIN="#C98B5A"; RED="#D7263D"; PINK="#F72585"; TEAL="#00A6A6"; YEL="#FFC300"; GRN="#2BA84A"
BLUE="#1E5AA8"; KHAKI="#B58B4C"; MOUTH="#7A2E1A"; WHITE="#FFFFFF"
def svg(w,h,body):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><g stroke="{INK}" stroke-linejoin="round" stroke-linecap="round">{body}</g></svg>'
def limb(d,col,w=26):
    return f'<path d="{d}" fill="none" stroke="{INK}" stroke-width="{w+9}"/><path d="{d}" fill="none" stroke="{col}" stroke-width="{w}"/>'

# ---------- MONTU MAMA (420x600) ----------
def mama(expr):
    b=f'<ellipse cx="210" cy="586" rx="125" ry="11" fill="{INK}" opacity="0.15" stroke="none"/>'
    # lungi (red with green stripes + dark lines)
    b+=f'<path d="M140 440 L280 440 L292 570 L128 570 Z" fill="{RED}" stroke="none"/>'
    for x in (150,186,222,258): b+=f'<rect x="{x}" y="442" width="16" height="126" fill="{GRN}" stroke="none"/>'
    for y in (470,505,540): b+=f'<rect x="146" y="{y}" width="130" height="6" fill="{INK}" opacity="0.25" stroke="none"/>'
    b+=f'<path d="M140 440 L280 440 L292 570 L128 570 Z" fill="none" stroke-width="6"/>'
    b+=f'<path d="M150 580 q22 -14 50 0 Z M222 580 q22 -14 50 0 Z" fill="{SKIN}" stroke-width="5"/>'
    # arms behind belly
    b+='<g class="armL" data-p="96,262">'+limb("M96 270 Q72 340 82 420",SKIN)+f'<circle cx="82" cy="426" r="15" fill="{SKIN}" stroke-width="5"/></g>'
    b+='<g class="armR" data-p="324,262">'+limb("M324 270 Q348 340 338 420",SKIN)+f'<circle cx="338" cy="426" r="15" fill="{SKIN}" stroke-width="5"/></g>'
    # fotua belly
    b+=f'<ellipse cx="210" cy="330" rx="125" ry="130" fill="{YEL}" stroke-width="7"/>'
    b+=f'<ellipse cx="96" cy="262" rx="30" ry="34" fill="{YEL}" stroke-width="6"/><ellipse cx="324" cy="262" rx="30" ry="34" fill="{YEL}" stroke-width="6"/>'
    b+=f'<path d="M210 232 V430" stroke-width="5"/>'
    for y in (270,320,370): b+=f'<circle cx="210" cy="{y}" r="7" fill="{WHITE}" stroke-width="4"/>'
    b+=f'<path d="M180 180 L240 180 L240 215 L180 215 Z" fill="{SKIN}" stroke-width="5"/><path d="M175 205 L210 244 L245 205" fill="{SKIN}" stroke-width="5"/>'
    # gamchha over left shoulder
    b+=f'<path d="M120 222 L160 202 L182 410 L146 418 Z" fill="{RED}" stroke="none"/>'
    for y in (240,280,320,360,395): b+=f'<path d="M{125+ (y-222)*0.12:.0f} {y} L{168+(y-222)*0.08:.0f} {y-6}" stroke="{WHITE}" stroke-width="6"/>'
    b+=f'<path d="M126 250 L172 380 M146 230 L178 330" stroke="{WHITE}" stroke-width="5" opacity="0.8"/>'
    b+=f'<path d="M120 222 L160 202 L182 410 L146 418 Z" fill="none" stroke-width="6"/>'
    b+=f'<path d="M146 418 l-6 18 M158 416 l0 18 M170 413 l6 18" stroke-width="4"/>'
    # head (original coords, shifted)
    h=f'<circle cx="255" cy="470" r="66" fill="{SKIN}" stroke-width="7"/>'
    h+=f'<path d="M192 452 Q200 398 255 400 Q312 398 318 452 Q300 425 255 428 Q212 425 192 452Z" fill="{INK}"/>'
    h+=f'<ellipse cx="189" cy="478" rx="10" ry="16" fill="{SKIN}" stroke-width="5"/><ellipse cx="321" cy="478" rx="10" ry="16" fill="{SKIN}" stroke-width="5"/>'
    if expr=="Default":
        h+=f'<path d="M212 446 L242 443 M298 446 L268 443" stroke-width="6"/>'
        h+=f'<circle cx="230" cy="466" r="12" fill="{WHITE}" stroke-width="5"/><circle cx="280" cy="466" r="12" fill="{WHITE}" stroke-width="5"/>'
        h+=f'<circle cx="231" cy="467" r="6" fill="{INK}" stroke="none"/><circle cx="279" cy="467" r="6" fill="{INK}" stroke="none"/>'
        mouth=f'<path d="M238 530 q17 13 34 0" fill="none" stroke-width="5"/>'
    elif expr=="Happy":
        h+=f'<path d="M212 438 q15 -9 30 0 M268 438 q15 -9 30 0" fill="none" stroke-width="6"/>'
        h+=f'<path d="M218 470 q12 -14 24 0 M268 470 q12 -14 24 0" fill="none" stroke-width="6"/>'
        h+=f'<circle cx="212" cy="492" r="9" fill="{PINK}" opacity="0.45" stroke="none"/><circle cx="298" cy="492" r="9" fill="{PINK}" opacity="0.45" stroke="none"/>'
        mouth=f'<path d="M230 520 Q255 560 280 520 Z" fill="{MOUTH}" stroke-width="5"/><path d="M244 540 q11 8 22 0" fill="none" stroke="{PINK}" stroke-width="6"/>'
    else:
        h+=f'<path d="M210 450 L240 438 M300 450 L270 438" stroke-width="6"/>'
        h+=f'<circle cx="230" cy="466" r="15" fill="{WHITE}" stroke-width="5"/><circle cx="280" cy="466" r="15" fill="{WHITE}" stroke-width="5"/>'
        h+=f'<circle cx="232" cy="469" r="5" fill="{INK}" stroke="none"/><circle cx="278" cy="469" r="5" fill="{INK}" stroke="none"/>'
        h+=f'<path d="M330 420 q8 14 0 20 q-8 -6 0 -20z M345 452 q6 10 0 15 q-6 -5 0 -15z" fill="{WHITE}" stroke-width="3"/>'
        mouth=f'<ellipse cx="255" cy="528" rx="9" ry="8" fill="{MOUTH}" stroke-width="4"/>'
    h+=f'<path d="M250 474 q5 18 10 0" fill="none" stroke-width="5"/>'
    h+=mouth
    h+=f'<path d="M255 496 C230 486 205 492 196 512 C190 526 204 534 210 522 C216 510 236 510 255 510 C274 510 294 510 300 522 C306 534 320 526 314 512 C305 492 280 486 255 496Z" fill="{INK}" stroke-width="3"/>'
    b+=f'<g class="head" data-p="210,205"><g transform="translate(-45 -334)">{h}</g></g>'
    return svg(420,600,b)

# ---------- BITHI (360x600) ----------
def tuni(expr):
    b=f'<ellipse cx="180" cy="586" rx="80" ry="10" fill="{INK}" opacity="0.15" stroke="none"/>'
    b+=limb("M159 448 V548",SKIN,18)+limb("M201 448 V548",SKIN,18)
    b+=f'<rect x="148" y="528" width="22" height="22" fill="{WHITE}" stroke-width="4"/><rect x="190" y="528" width="22" height="22" fill="{WHITE}" stroke-width="4"/>'
    b+=f'<path d="M140 566 q0 -18 30 -16 l4 16 Z M220 566 q0 -18 -30 -16 l-4 16 Z" fill="{INK}" stroke-width="4"/>'
    b+='<g class="armL" data-p="128,232">'+limb("M128 236 Q104 300 110 352",WHITE,24)+f'<circle cx="110" cy="360" r="13" fill="{SKIN}" stroke-width="5"/></g>'
    b+='<g class="armR" data-p="232,232">'+limb("M232 236 Q256 300 250 352",WHITE,24)+f'<circle cx="250" cy="360" r="13" fill="{SKIN}" stroke-width="5"/></g>'
    b+=f'<path d="M118 352 L242 352 L264 452 L96 452 Z" fill="{BLUE}" stroke-width="6"/>'
    b+=f'<path d="M150 352 L140 452 M210 352 L220 452 M180 352 V452" stroke="#163F78" stroke-width="4"/>'
    b+=f'<path d="M128 220 Q180 202 232 220 L240 358 L120 358 Z" fill="{WHITE}" stroke-width="6"/>'
    b+=f'<path d="M140 224 L228 352" stroke="{BLUE}" stroke-width="14"/>'
    b+=f'<path d="M160 212 L180 236 L200 212" fill="none" stroke-width="5"/>'
    h=f'<path d="M508 610 q-26 40 -10 92" fill="none" stroke="{INK}" stroke-width="16"/><path d="M592 610 q26 40 10 92" fill="none" stroke="{INK}" stroke-width="16"/>'
    h+=f'<circle cx="498" cy="706" r="9" fill="{RED}" stroke-width="4"/><circle cx="602" cy="706" r="9" fill="{RED}" stroke-width="4"/>'
    h+=f'<circle cx="550" cy="610" r="52" fill="{SKIN}" stroke-width="7"/>'
    h+=f'<path d="M498 604 Q500 552 550 554 Q602 552 602 604 Q585 578 550 580 Q515 578 498 604Z" fill="{INK}"/>'
    h+=f'<path d="M530 557 L550 590 L548 556" fill="{INK}" stroke="none"/>'
    h+=f'<circle cx="530" cy="615" r="16" fill="{WHITE}" stroke-width="5"/><circle cx="572" cy="615" r="16" fill="{WHITE}" stroke-width="5"/><path d="M546 615 H556" stroke-width="5"/>'
    if expr=="Default":
        h+=f'<circle cx="532" cy="617" r="5" fill="{INK}" stroke="none"/><circle cx="574" cy="617" r="5" fill="{INK}" stroke="none"/>'
        h+=f'<path d="M534 640 q16 14 32 0" fill="none" stroke-width="5"/>'
    elif expr=="Happy":
        h+=f'<path d="M523 619 q7 -9 14 0 M565 619 q7 -9 14 0" fill="none" stroke-width="4"/>'
        h+=f'<path d="M532 636 Q550 662 568 636 Z" fill="{MOUTH}" stroke-width="5"/>'
    else:
        h+=f'<path d="M516 596 L540 590 M584 596 L560 590" stroke-width="5"/>'
        h+=f'<circle cx="530" cy="618" r="4" fill="{INK}" stroke="none"/><circle cx="572" cy="618" r="4" fill="{INK}" stroke="none"/>'
        h+=f'<path d="M536 646 q7 -6 14 0 q7 6 14 0" fill="none" stroke-width="5"/>'
    h+=f'<circle cx="512" cy="636" r="6" fill="{PINK}" opacity="0.5" stroke="none"/><circle cx="590" cy="636" r="6" fill="{PINK}" opacity="0.5" stroke="none"/>'
    b+=f'<g class="head" data-p="180,215"><g transform="translate(-370 -450)">{h}</g></g>'
    return svg(360,600,b)

# ---------- BOLTU (320x600) ----------
def boltu(expr):
    b=f'<ellipse cx="160" cy="586" rx="70" ry="10" fill="{INK}" opacity="0.15" stroke="none"/>'
    b+=limb("M138 390 L134 548",SKIN,18)+limb("M182 390 L186 548",SKIN,18)
    b+=f'<path d="M116 560 h34 M170 560 h34" stroke-width="12"/>'
    b+='<g class="armL" data-p="114,228">'+limb("M114 232 Q96 290 104 336",YEL,22)+f'<circle cx="104" cy="344" r="12" fill="{SKIN}" stroke-width="5"/></g>'
    b+='<g class="armR" data-p="206,228">'+limb("M206 232 Q224 290 216 336",YEL,22)+f'<circle cx="216" cy="344" r="12" fill="{SKIN}" stroke-width="5"/></g>'
    b+=f'<path d="M108 320 L212 320 L220 398 L100 398 Z" fill="{KHAKI}" stroke-width="6"/><path d="M160 340 V398" stroke-width="4"/>'
    b+=f'<path d="M115 216 Q160 200 205 216 L212 326 L108 326 Z" fill="{YEL}" stroke="none"/>'
    for y in (228,262,296): b+=f'<rect x="118" y="{y}" width="86" height="14" fill="{RED}" stroke="none"/>'
    b+=f'<path d="M115 216 Q160 200 205 216 L212 326 L108 326 Z" fill="none" stroke-width="6"/>'
    h=f'<circle cx="895" cy="585" r="54" fill="{SKIN}" stroke-width="7"/>'
    h+=f'<path d="M843 572 Q848 526 895 528 Q944 526 948 572 Q930 552 895 554 Q862 552 843 572Z" fill="{INK}"/>'
    h+=f'<path d="M893 530 q-6 -18 8 -24" fill="none" stroke-width="6"/>'
    if expr=="Default":
        h+=f'<circle cx="876" cy="578" r="6" fill="{INK}" stroke="none"/><circle cx="914" cy="578" r="6" fill="{INK}" stroke="none"/>'
        h+=f'<path d="M872 600 Q895 622 918 600 Z" fill="{WHITE}" stroke-width="5"/><path d="M892 600 V609" stroke="{SKIN}" stroke-width="6"/>'
    elif expr=="Happy":
        h+=f'<path d="M866 574 q10 -12 20 0 M906 574 q10 -12 20 0" fill="none" stroke-width="6"/>'
        h+=f'<path d="M866 596 Q895 640 926 596 Z" fill="{MOUTH}" stroke-width="5"/>'
        h+=f'<path d="M872 597 H920" stroke="{WHITE}" stroke-width="7"/><path d="M892 594 V602" stroke="{MOUTH}" stroke-width="6"/>'
        h+=f'<ellipse cx="896" cy="618" rx="11" ry="6" fill="{PINK}" stroke="none"/>'
        h+=f'<path d="M958 545 l18 -14 M964 570 l22 -2 M955 520 l10 -20" stroke-width="5"/>'
    else:
        h+=f'<path d="M864 560 L884 566 M926 560 L906 566" stroke-width="5"/>'
        h+=f'<circle cx="876" cy="580" r="5" fill="{INK}" stroke="none"/><circle cx="914" cy="580" r="5" fill="{INK}" stroke="none"/>'
        h+=f'<path d="M877 608 q9 -8 18 0 q9 8 18 0" fill="none" stroke-width="5"/>'
        h+=f'<path d="M944 548 q7 12 0 18 q-7 -6 0 -18z" fill="{WHITE}" stroke-width="3"/>'
    h+=f'<circle cx="862" cy="598" r="7" fill="{PINK}" opacity="0.45" stroke="none"/><circle cx="928" cy="598" r="7" fill="{PINK}" opacity="0.45" stroke="none"/>'
    b+=f'<g class="head" data-p="160,212"><g transform="translate(-735 -430)">{h}</g></g>'
    return svg(320,600,b)

out={}
for name,fn in (("Montu Mama",mama),("Tuni",tuni),("Boltu",boltu)):
    out[name]={e:fn(e) for e in ("Default","Happy","Worried")}
json.dump(out,open(sys.argv[1],"w"))
# preview html
html='<html><body style="margin:0;background:#FFF6E5;display:flex;flex-wrap:wrap;width:1140px">'
for n in out:
    for e in out[n]: html+=f'<div style="width:380px;height:620px;display:flex;align-items:center;justify-content:center">{out[n][e]}</div>'
open(sys.argv[2],"w").write(html+'</body></html>')
print({n:[len(s) for s in out[n].values()] for n in out})
