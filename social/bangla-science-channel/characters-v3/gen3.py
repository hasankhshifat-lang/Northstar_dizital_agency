"""Characters v3: semi-realistic 2D cartoon (cel shading, warm brown outlines), rigged layers.
Each character SVG has groups: .armL .armR .head (data-p pivots), inside head: .eyes-open/.eyes-closed,
.brows, mouths .m-rest .m-a .m-e .m-o .m-smile. Writes chars3.json {name: svg} and preview PNG-able sheet html."""
import json, sys
from pathlib import Path

O = "#3A2416"     # outline
SW = 4
SKIN, SKIN_S = "#D9A06B", "#B97F4E"
HAIR, HAIR_H = "#1C1B22", "#4A5578"
WHITE, WHITE_S = "#FFFFFF", "#D5DCE6"
MOUTH, TONGUE, TEETH = "#5A1A14", "#E0626A", "#FFFFFF"

def P(d, fill, sw=SW, extra=""):
    return f'<path d="{d}" fill="{fill}" stroke="{O}" stroke-width="{sw}" stroke-linejoin="round" stroke-linecap="round" {extra}/>'
def S(d, fill, op=1):
    return f'<path d="{d}" fill="{fill}" stroke="none" opacity="{op}"/>'
def L(d, sw=SW, col=O):
    return f'<path d="{d}" fill="none" stroke="{col}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round"/>'

def eyes(cx, cy, gap, w=26, h=17, iris="#4A2A18", lash=6):
    """open + closed eye sets, centred at cx with half-gap `gap`."""
    o, c = [], []
    for sx in (-1, 1):
        x = cx + sx * gap
        o.append(f'<path d="M{x-w} {cy} Q{x} {cy-h*1.5} {x+w} {cy} Q{x} {cy+h*1.1} {x-w} {cy}Z" fill="{WHITE}" stroke="none"/>')
        o.append(f'<circle cx="{x+sx*1}" cy="{cy+1}" r="{h*0.78}" fill="{iris}"/><circle cx="{x+sx*1}" cy="{cy+1}" r="{h*0.4}" fill="#120A06"/>')
        o.append(f'<circle cx="{x+sx*1+5}" cy="{cy-5}" r="{h*0.22}" fill="#fff"/>')
        o.append(L(f"M{x-w-2} {cy+1} Q{x} {cy-h*1.6} {x+w+2} {cy+1}", lash))
        o.append(L(f"M{x-w+6} {cy+h*0.75} Q{x} {cy+h*1.15} {x+w-6} {cy+h*0.75}", 2.2))
        c.append(L(f"M{x-w} {cy+2} Q{x} {cy+h*0.9} {x+w} {cy+2}", lash))
    # clip irises to the eye whites
    return (f'<g class="eyes-open">{"".join(o)}</g>', f'<g class="eyes-closed" style="display:none">{"".join(c)}</g>')

def brows(cx, cy, gap, w=30, thick=8, arch=8):
    b = ""
    for sx in (-1, 1):
        x = cx + sx * gap
        b += f'<g class="brow{"L" if sx<0 else "R"}">' + P(f"M{x-w} {cy+3} Q{x} {cy-arch-thick} {x+w} {cy+1} Q{x} {cy-arch+2} {x-w} {cy+3}Z", HAIR, 2) + "</g>"
    return f'<g class="brows">{b}</g>'

def mouths(cx, cy, w=30):
    """5 mouth shapes; only .m-rest visible by default."""
    rest = L(f"M{cx-w*0.6} {cy} Q{cx} {cy+w*0.28} {cx+w*0.6} {cy}", 3.5)
    smile = (P(f"M{cx-w} {cy-4} Q{cx} {cy+w*1.05} {cx+w} {cy-4} Q{cx} {cy+6} {cx-w} {cy-4}Z", MOUTH, 3.5)
             + S(f"M{cx-w*0.82} {cy-1} Q{cx} {cy+8} {cx+w*0.82} {cy-1} L{cx+w*0.7} {cy+5} Q{cx} {cy+12} {cx-w*0.7} {cy+5}Z", TEETH))
    a = (P(f"M{cx-w*0.8} {cy-4} Q{cx} {cy-10} {cx+w*0.8} {cy-4} Q{cx+w*0.7} {cy+w*0.95} {cx} {cy+w*1.0} Q{cx-w*0.7} {cy+w*0.95} {cx-w*0.8} {cy-4}Z", MOUTH, 3.5)
         + S(f"M{cx-w*0.7} {cy-3} Q{cx} {cy-8} {cx+w*0.7} {cy-3} L{cx+w*0.62} {cy+5} Q{cx} {cy+1} {cx-w*0.62} {cy+5}Z", TEETH)
         + S(f"M{cx-w*0.45} {cy+w*0.8} Q{cx} {cy+w*0.45} {cx+w*0.45} {cy+w*0.8} Q{cx} {cy+w*0.98} {cx-w*0.45} {cy+w*0.8}Z", TONGUE))
    e = (P(f"M{cx-w} {cy-2} Q{cx} {cy-8} {cx+w} {cy-2} Q{cx} {cy+w*0.55} {cx-w} {cy-2}Z", MOUTH, 3.5)
         + S(f"M{cx-w*0.85} {cy-1} Q{cx} {cy-6} {cx+w*0.85} {cy-1} L{cx+w*0.75} {cy+5} Q{cx} {cy+2} {cx-w*0.75} {cy+5}Z", TEETH))
    o = (P(f"M{cx} {cy-8} Q{cx+w*0.5} {cy-8} {cx+w*0.5} {cy+w*0.35} Q{cx+w*0.5} {cy+w*0.9} {cx} {cy+w*0.9} Q{cx-w*0.5} {cy+w*0.9} {cx-w*0.5} {cy+w*0.35} Q{cx-w*0.5} {cy-8} {cx} {cy-8}Z", MOUTH, 3.5)
         + S(f"M{cx-w*0.28} {cy+w*0.65} Q{cx} {cy+w*0.45} {cx+w*0.28} {cy+w*0.65} Q{cx} {cy+w*0.85} {cx-w*0.28} {cy+w*0.65}Z", TONGUE))
    hide = ' style="display:none"'
    return (f'<g class="mouths"><g class="m-rest">{rest}</g><g class="m-smile"{hide}>{smile}</g>'
            f'<g class="m-a"{hide}>{a}</g><g class="m-e"{hide}>{e}</g><g class="m-o"{hide}>{o}</g></g>')

def ear(x, y, sx):
    return f'<g class="{"earL" if sx<0 else "earR"}">' + P(f"M{x} {y-22} Q{x+sx*22} {y-26} {x+sx*20} {y} Q{x+sx*18} {y+22} {x} {y+20}Z", SKIN, 3.5) + L(f"M{x+sx*6} {y-10} Q{x+sx*14} {y} {x+sx*6} {y+10}", 2.5) + "</g>"

def hand(x, y, sx=1, s=1.0):
    return (P(f"M{x-14*s} {y-6*s} Q{x-18*s} {y+16*s} {x-6*s} {y+26*s} Q{x+6*s} {y+32*s} {x+14*s} {y+22*s} Q{x+20*s} {y+8*s} {x+14*s} {y-8*s} Z", SKIN, 3.5)
            + P(f"M{x+sx*12*s} {y+2*s} Q{x+sx*24*s} {y+4*s} {x+sx*20*s} {y+14*s} Q{x+sx*14*s} {y+16*s} {x+sx*10*s} {y+12*s}", SKIN, 3))

def arm(px, py, length, sleeve_col, sleeve_s, sleeve_len, sx, w=30, cls="armL"):
    """Arm hanging from shoulder pivot (px,py). Upper arm + forearm with an elbow joint:
    <g class=armL data-p=shoulder> upper skin, <g class=foreL data-p=elbow> forearm+hand </g>, sleeve </g>."""
    elx, ely = px + sx * 6, py + length * 0.52          # elbow
    wx, wy = px + sx * 10, py + length - 10             # wrist
    uw, fw, ww = w * 0.40, w * 0.33, w * 0.24
    upper = (P(f"M{px-uw} {py+sleeve_len-6} L{elx-fw-1} {ely} L{elx+fw+1} {ely} L{px+uw} {py+sleeve_len-6}Z", SKIN, SW)
             + S(f"M{px+sx*uw*0.2} {py+sleeve_len} L{elx+sx*fw*0.25} {ely} L{elx+sx*fw} {ely} L{px+sx*uw} {py+sleeve_len}Z", SKIN_S, .55))
    fore = (f'<circle cx="{elx}" cy="{ely}" r="{fw+1}" fill="{SKIN}" stroke="{O}" stroke-width="{SW}"/>'
            + P(f"M{elx-fw} {ely} Q{elx-fw+sx*2} {(ely+wy)/2} {wx-ww} {wy} L{wx+ww} {wy} Q{elx+fw+sx*2} {(ely+wy)/2} {elx+fw} {ely}Z", SKIN, SW)
            + S(f"M{elx+sx*fw*0.2} {ely+2} L{wx+sx*ww*0.1} {wy-2} L{wx+sx*ww} {wy-2} L{elx+sx*fw} {ely+2}Z", SKIN_S, .55)
            + f'<circle cx="{elx}" cy="{ely}" r="{fw-2}" fill="{SKIN}" stroke="none"/>'
            + hand(wx, wy + 4, sx))
    fcls = "foreL" if cls == "armL" else "foreR"
    sleeve = (P(f"M{px-w*0.62} {py-6} Q{px+sx*4} {py-16} {px+w*0.62} {py-6} L{px+w*0.55+sx*4} {py+sleeve_len} L{px-w*0.55+sx*4} {py+sleeve_len} Z", sleeve_col, SW)
              + S(f"M{px+sx*w*0.15} {py} L{px+sx*w*0.55} {py-4} L{px+sx*w*0.5+sx*4} {py+sleeve_len-2} L{px+sx*w*0.1+sx*4} {py+sleeve_len-2}Z", sleeve_s, 0.8))
    return f'<g class="{cls}" data-p="{px},{py}">{upper}<g class="{fcls}" data-p="{elx},{ely}">{fore}</g>{sleeve}</g>'

def svg(w, h, body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h+60}" viewBox="0 -60 {w} {h+60}">'
            f'<ellipse cx="{w/2}" cy="{h-14}" rx="{w*0.32}" ry="12" fill="#000" opacity=".16"/>{body}</svg>')

# ------------------------------------------------------------------ BITHI (420 x 1000)
def bithi():
    W, H = 420, 1000; cx = 210
    b = ""
    # braids behind
    for sx in (-1, 1):
        x = cx + sx * 62
        b += P(f"M{x-12} 190 Q{x+sx*14} 300 {x+sx*4} 420 L{x+sx*24} 420 Q{x+sx*34} 300 {x+14} 190Z", HAIR, SW)
        for yy in (250, 300, 350, 395): b += L(f"M{x+sx*2} {yy} q{sx*10} 8 {sx*20} 0", 2.5, HAIR_H)
        b += f'<circle cx="{x+sx*14}" cy="424" r="10" fill="#D7263D" stroke="{O}" stroke-width="3"/>'
    # legs, socks, shoes
    for sx in (-1, 1):
        x = cx + sx * 34
        b += P(f"M{x-17} 690 L{x-14} 905 L{x+14} 905 L{x+17} 690Z", SKIN, SW) + S(f"M{x+4} 692 L{x+6} 900 L{x+14} 900 L{x+16} 692Z", SKIN_S, .5)
        b += P(f"M{x-15} 862 L{x-15} 925 L{x+15} 925 L{x+15} 862Z", WHITE, SW)
        b += P(f"M{x-17} 920 L{x+17} 920 Q{x+24} 958 {x+18} 968 Q{x} 976 {x-18} 968 Q{x-24} 958 {x-17} 920Z", "#1A1A1A", SW) + L(f"M{x-10} 930 Q{x} 926 {x+10} 930", 2.5, "#555")
    # skirt (navy, pleats)
    b += P(f"M{cx-92} 500 L{cx+92} 500 L{cx+122} 712 Q{cx} 728 {cx-122} 712Z", "#1F3F7A", SW)
    for k in (-80, -40, 0, 40, 80): b += L(f"M{cx+k*0.75} 512 L{cx+k*1.05} 716", 2.5, "#132A55")
    b += S(f"M{cx+40} 504 L{cx+92} 504 L{cx+120} 708 Q{cx+80} 716 {cx+60} 718Z", "#132A55", .55)
    # torso shirt
    b += P(f"M{cx-80} 262 Q{cx-96} 380 {cx-88} 510 L{cx+88} 510 Q{cx+96} 380 {cx+80} 262 Q{cx} 244 {cx-80} 262Z", WHITE, SW)
    b += S(f"M{cx+30} 258 Q{cx+80} 262 {cx+80} 268 Q{cx+92} 380 {cx+86} 506 L{cx+50} 506 Q{cx+56} 380 {cx+30} 258Z", WHITE_S, .9)
    b += P(f"M{cx-24} 250 L{cx} 292 L{cx+24} 250", WHITE, 3.5)                                    # collar
    b += P(f"M{cx-24} 250 L{cx-46} 270 L{cx-8} 286Z", WHITE, 3.5) + P(f"M{cx+24} 250 L{cx+46} 270 L{cx+8} 286Z", WHITE, 3.5)
    for yy in (320, 370, 420, 470): b += f'<circle cx="{cx}" cy="{yy}" r="4" fill="{WHITE_S}" stroke="{O}" stroke-width="2"/>'
    b += P(f"M{cx+30} 330 L{cx+70} 330 L{cx+70} 372 L{cx+30} 372Z", WHITE, 3) + f'<circle cx="{cx+50}" cy="346" r="9" fill="#D7263D" stroke="{O}" stroke-width="2.5"/>'
    b += P(f"M{cx-70} 268 L{cx-52} 262 L{cx+82} 488 L{cx+66} 500Z", "#1E5AA8", 3.5)                 # sash
    # arms
    b += arm(cx-88, 282, 250, WHITE, WHITE_S, 82, -1, 34, "armL") + arm(cx+88, 282, 250, WHITE, WHITE_S, 82, 1, 34, "armR")
    # head group
    hd = ""
    hd += P(f"M{cx-14} 200 L{cx-16} 258 Q{cx} 268 {cx+16} 258 L{cx+14} 200Z", SKIN, SW) + S(f"M{cx-16} 236 Q{cx} 250 {cx+16} 236 L{cx+16} 222 Q{cx} 236 {cx-16} 222Z", SKIN_S, .7)
    hd += P(f"M{cx-70} 70 Q{cx-90} 130 {cx-74} 190 L{cx+74} 190 Q{cx+90} 130 {cx+70} 70 Q{cx} 22 {cx-70} 70Z", HAIR, SW)   # hair back
    hd += ear(cx-60, 150, -1) + ear(cx+60, 150, 1)
    face = f"M{cx-60} 110 Q{cx-64} 190 {cx-26} 222 Q{cx} 238 {cx+26} 222 Q{cx+64} 190 {cx+60} 110 Q{cx} 70 {cx-60} 110Z"
    hd += P(face, SKIN, SW) + S(f"M{cx+30} 100 Q{cx+64} 120 {cx+58} 170 Q{cx+50} 210 {cx+20} 226 Q{cx+44} 190 {cx+42} 140Z", SKIN_S, .55)
    hd += '<g class="face">'
    hd += f'<ellipse cx="{cx-38}" cy="182" rx="12" ry="7" fill="#E77A7A" opacity=".45"/><ellipse cx="{cx+38}" cy="182" rx="12" ry="7" fill="#E77A7A" opacity=".45"/>'
    eo, ec = eyes(cx, 152, 27, 21, 15, lash=5)
    hd += eo + ec + brows(cx, 124, 28, 20, 6, 6)
    hd += L(f"M{cx-2} 160 Q{cx-8} 182 {cx-1} 186 Q{cx+5} 188 {cx+8} 184", 3)                           # nose
    hd += mouths(cx, 202, 20)
    # glasses
    for sx in (-1, 1):
        hd += f'<rect x="{cx+sx*27-22}" y="136" width="44" height="34" rx="14" fill="#BFE6FF" fill-opacity=".18" stroke="{O}" stroke-width="3.5"/>'
    hd += L(f"M{cx-5} 150 Q{cx} 146 {cx+5} 150", 3.5) + L(f"M{cx-49} 148 L{cx-60} 144 M{cx+49} 148 L{cx+60} 144", 3)
    hd += '</g>'
    # hair front: side-parted fringe + top highlight
    hd += '<g class="hairF">'
    hd += P(f"M{cx-66} 128 Q{cx-74} 60 {cx-10} 52 Q{cx+50} 46 {cx+68} 100 Q{cx+70} 120 {cx+64} 132 Q{cx+50} 96 {cx+12} 88 Q{cx-30} 92 {cx-50} 118 Q{cx-58} 128 {cx-66} 128Z", HAIR, SW)
    hd += L(f"M{cx-40} 70 Q{cx-6} 56 {cx+30} 62", 5, HAIR_H) + L(f"M{cx+38} 70 Q{cx+52} 78 {cx+58} 92", 4, HAIR_H)
    hd += '</g>'
    b += f'<g class="head" data-p="{cx},{250}"><g transform="translate({cx} 250) scale(1.22) translate({-cx} -250)">{hd}</g></g>'
    return svg(W, H, b)

# ------------------------------------------------------------------ BOLTU (360 x 860), younger boy
def boltu():
    W, H = 360, 860; cx = 180
    b = ""
    for sx in (-1, 1):
        x = cx + sx * 30
        b += P(f"M{x-15} 610 L{x-13} 790 L{x+13} 790 L{x+15} 610Z", SKIN, SW) + S(f"M{x+3} 612 L{x+4} 786 L{x+13} 786 L{x+14} 612Z", SKIN_S, .5)
        b += P(f"M{x-16} 784 L{x+16} 784 Q{x+22} 818 {x+16} 828 Q{x} 834 {x-16} 828 Q{x-22} 818 {x-16} 784Z", SKIN, SW) + P(f"M{x-22} 820 L{x+22} 820 L{x+22} 832 Q{x} 838 {x-22} 832Z", "#7A4A24", 3)
        b += L(f"M{x-12} 800 L{x+12} 800", 3, "#C98B4A")
    b += P(f"M{cx-78} 470 L{cx+78} 470 L{cx+86} 640 L{cx+6} 640 L{cx} 590 L{cx-6} 640 L{cx-86} 640Z", "#B58B4C", SW)  # khaki shorts
    b += S(f"M{cx+30} 474 L{cx+78} 474 L{cx+86} 636 L{cx+46} 636Z", "#8C6A36", .6)
    # striped t-shirt
    tee = f"M{cx-74} 268 Q{cx-84} 380 {cx-80} 490 L{cx+80} 490 Q{cx+84} 380 {cx+74} 268 Q{cx} 248 {cx-74} 268Z"
    b += P(tee, "#FFC300", SW)
    stripes = "".join(S(f"M{cx-84} {y} L{cx+84} {y} L{cx+84} {y+20} L{cx-84} {y+20}Z", "#D7263D") for y in (300, 350, 400, 450))
    b += f'<clipPath id="bt"><path d="{tee}"/></clipPath><g clip-path="url(#bt)">{stripes}{S(f"M{cx+34} 250 L{cx+90} 250 L{cx+90} 492 L{cx+46} 492Z", "#000", .14)}</g>' + P(tee, "none", SW)
    b += P(f"M{cx-26} 258 Q{cx} 282 {cx+26} 258", "none", 4)
    b += arm(cx-80, 284, 210, "#FFC300", "#D9A400", 64, -1, 30, "armL") + arm(cx+80, 284, 210, "#FFC300", "#D9A400", 64, 1, 30, "armR")
    hd = ""
    hd += P(f"M{cx-13} 210 L{cx-14} 262 Q{cx} 270 {cx+14} 262 L{cx+13} 210Z", SKIN, SW) + S(f"M{cx-14} 240 Q{cx} 252 {cx+14} 240 L{cx+14} 228 Q{cx} 240 {cx-14} 228Z", SKIN_S, .7)
    hd += ear(cx-64, 160, -1) + ear(cx+64, 160, 1)
    face = f"M{cx-64} 120 Q{cx-68} 200 {cx-30} 230 Q{cx} 244 {cx+30} 230 Q{cx+68} 200 {cx+64} 120 Q{cx} 76 {cx-64} 120Z"
    hd += P(face, SKIN, SW) + S(f"M{cx+30} 110 Q{cx+68} 130 {cx+62} 180 Q{cx+54} 218 {cx+22} 234 Q{cx+46} 196 {cx+44} 150Z", SKIN_S, .55)
    hd += '<g class="face">'
    eo, ec = eyes(cx, 160, 29, 23, 17, lash=5)
    hd += eo + ec + brows(cx, 132, 30, 21, 7, 4)
    hd += L(f"M{cx-2} 170 Q{cx-9} 192 {cx-1} 196 Q{cx+6} 198 {cx+9} 193", 3)
    hd += mouths(cx, 212, 22)
    hd += '</g>'
    # spiky hair with highlight
    hd += '<g class="hairF">'
    hd += P(f"M{cx-70} 140 Q{cx-84} 96 {cx-62} 70 L{cx-70} 44 L{cx-36} 56 L{cx-30} 22 L{cx-2} 46 L{cx+12} 14 L{cx+30} 48 L{cx+58} 30 L{cx+56} 64 L{cx+84} 70 Q{cx+76} 104 {cx+70} 140 Q{cx+58} 108 {cx+30} 100 L{cx+20} 118 L{cx+2} 98 L{cx-18} 116 L{cx-30} 98 Q{cx-56} 108 {cx-70} 140Z", HAIR, SW)
    hd += L(f"M{cx-40} 70 L{cx-24} 52 M{cx-2} 62 L{cx+12} 36 M{cx+30} 66 L{cx+50} 50", 4, HAIR_H)
    hd += '</g>'
    b += f'<g class="head" data-p="{cx},{258}"><g transform="translate({cx} 258) scale(1.2) translate({-cx} -258)">{hd}</g></g>'
    return svg(W, H, b)

# ------------------------------------------------------------------ MONTU MAMA (520 x 1000), plump uncle
def mama():
    W, H = 520, 1000; cx = 260
    b = ""
    for sx in (-1, 1):   # feet in sandals
        x = cx + sx * 40
        b += P(f"M{x-20} 930 L{x+20} 930 Q{x+26} 964 {x+20} 974 Q{x} 980 {x-20} 974 Q{x-26} 964 {x-20} 930Z", SKIN, SW) + P(f"M{x-27} 962 L{x+27} 962 L{x+27} 976 Q{x} 984 {x-27} 976Z", "#7A4A24", 3)
        b += P(f"M{x-18} 900 L{x-18} 936 L{x+18} 936 L{x+18} 900Z", SKIN, SW)
    # lungi: red with green checks
    lungi = f"M{cx-118} 600 L{cx+118} 600 L{cx+124} 912 Q{cx} 924 {cx-124} 912Z"
    checks = "".join(S(f"M{x} 600 L{x+16} 600 L{x+16} 925 L{x} 925Z", "#2BA84A", .9) for x in range(cx-110, cx+120, 46))
    checks += "".join(S(f"M{cx-130} {y} L{cx+130} {y} L{cx+130} {y+10} L{cx-130} {y+10}Z", "#1A1A1A", .28) for y in range(640, 910, 60))
    b += P(lungi, "#C8243A", SW) + f'<clipPath id="ml"><path d="{lungi}"/></clipPath><g clip-path="url(#ml)">{checks}{S(f"M{cx+50} 600 L{cx+130} 600 L{cx+130} 925 L{cx+60} 925Z", "#000", .15)}</g>' + P(lungi, "none", SW)
    b += P(f"M{cx-120} 596 Q{cx} 616 {cx+120} 596 L{cx+118} 616 Q{cx} 636 {cx-118} 616Z", "#A51D30", 3.5)   # waist fold
    # fotua (yellow kurta) over big belly
    fot = f"M{cx-110} 270 Q{cx-160} 420 {cx-140} 600 Q{cx} 640 {cx+140} 600 Q{cx+160} 420 {cx+110} 270 Q{cx} 246 {cx-110} 270Z"
    b += P(fot, "#F2B705", SW)
    b += S(f"M{cx+40} 262 Q{cx+112} 268 {cx+118} 280 Q{cx+160} 420 {cx+140} 598 Q{cx+100} 616 {cx+70} 620 Q{cx+120} 440 {cx+40} 262Z", "#C98F00", .7)
    b += L(f"M{cx} 280 L{cx} 470", 3) + "".join(f'<circle cx="{cx}" cy="{y}" r="5" fill="#fff" stroke="{O}" stroke-width="2.5"/>' for y in (320, 370, 420))
    b += P(f"M{cx-30} 262 Q{cx} 290 {cx+30} 262", "none", 3.5)
    # gamchha over left shoulder (red/white check)
    b += P(f"M{cx-104} 268 L{cx-58} 256 L{cx-30} 520 L{cx-70} 530Z", "#D7263D", SW)
    b += "".join(L(f"M{cx-96+(y-268)*0.13} {y} L{cx-58+(y-268)*0.11} {y-8}", 4, "#fff") for y in (300, 350, 400, 450, 500))
    b += L(f"M{cx-86} 270 L{cx-52} 524", 3, "#fff")
    b += arm(cx-122, 296, 270, "#F2B705", "#C98F00", 90, -1, 42, "armL") + arm(cx+122, 296, 270, "#F2B705", "#C98F00", 90, 1, 42, "armR")
    hd = ""
    hd += P(f"M{cx-22} 210 L{cx-26} 268 Q{cx} 280 {cx+26} 268 L{cx+22} 210Z", SKIN, SW)
    hd += ear(cx-76, 158, -1) + ear(cx+76, 158, 1)
    face = f"M{cx-76} 116 Q{cx-84} 210 {cx-40} 244 Q{cx} 262 {cx+40} 244 Q{cx+84} 210 {cx+76} 116 Q{cx} 66 {cx-76} 116Z"
    hd += P(face, SKIN, SW) + S(f"M{cx+36} 100 Q{cx+80} 120 {cx+76} 180 Q{cx+70} 232 {cx+26} 252 Q{cx+56} 210 {cx+54} 150Z", SKIN_S, .55)
    hd += S(f"M{cx-60} 200 Q{cx-50} 250 {cx} 258 Q{cx+50} 250 {cx+60} 200 Q{cx+30} 236 {cx} 236 Q{cx-30} 236 {cx-60} 200Z", "#8C6A50", .35)  # stubble
    # balding top with side hair
    hd += P(f"M{cx-80} 150 Q{cx-90} 100 {cx-62} 84 Q{cx-50} 110 {cx-66} 150Z", HAIR, 3) + P(f"M{cx+80} 150 Q{cx+90} 100 {cx+62} 84 Q{cx+50} 110 {cx+66} 150Z", HAIR, 3)
    hd += P(f"M{cx-82} 160 Q{cx-96} 96 {cx-56} 76 Q{cx-30} 70 {cx-20} 78 Q{cx-50} 90 {cx-60} 120 Q{cx-66} 140 {cx-68} 160Z", HAIR, 3)
    hd += P(f"M{cx+82} 160 Q{cx+96} 96 {cx+56} 76 Q{cx+30} 70 {cx+20} 78 Q{cx+50} 90 {cx+60} 120 Q{cx+66} 140 {cx+68} 160Z", HAIR, 3)
    hd += L(f"M{cx-44} 84 Q{cx} 70 {cx+44} 84 M{cx-36} 92 Q{cx} 80 {cx+40} 90", 3, HAIR)
    hd += S(f"M{cx-30} 100 Q{cx} 92 {cx+30} 100 Q{cx} 98 {cx-30} 104Z", "#fff", .35)
    hd += '<g class="face">'
    eo, ec = eyes(cx, 160, 32, 21, 14, lash=5)
    hd += eo + ec + brows(cx, 130, 33, 25, 9, 4)
    hd += P(f"M{cx-6} 166 Q{cx-16} 196 {cx-4} 202 Q{cx+10} 206 {cx+14} 198 Q{cx+10} 190 {cx+4} 166Z", SKIN_S, 2.5)     # bigger nose
    hd += mouths(cx, 228, 24)
    hd += P(f"M{cx} 208 Q{cx-30} 202 {cx-56} 218 Q{cx-62} 230 {cx-46} 226 Q{cx-24} 216 {cx} 220 Q{cx+24} 216 {cx+46} 226 Q{cx+62} 230 {cx+56} 218 Q{cx+30} 202 {cx} 208Z", HAIR, 3)  # mustache
    hd += '</g>'
    b += f'<g class="head" data-p="{cx},{262}"><g transform="translate({cx} 262) scale(1.15) translate({-cx} -262)">{hd}</g></g>'
    return svg(W, H, b)

if __name__ == "__main__":
    out = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(".")
    chars = {"Montu Mama": mama(), "Bithi": bithi(), "Boltu": boltu()}
    (out / "chars3.json").write_text(json.dumps(chars), encoding="utf-8")
    for k, v in chars.items(): (out / f"{k.replace(' ','_')}_v3.svg").write_text(v, encoding="utf-8")
    print("wrote", list(chars))
