"""Scientist characters for Scientific Bithi, in exactly the same rig and style as the main cast (gen3.py):
groups .legL/.legR, .armL/.armR with .foreL/.foreR (hands .handRelax/.handOpen), .head with .face, .hairF,
.earL/.earR, .eyes-open/.eyes-closed, .brows (.browL/.browR) and mouths .m-rest/.m-a/.m-e/.m-o/.m-smile.
Writes scientists.json {key: svg}."""
import json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import gen3 as G
from gen3 import P, S, L, eyes, mouths, ear, hand, svg, O, SW

def skin(c, s):
    G.SKIN, G.SKIN_S = c, s

def brows_c(cx, cy, gap, col, w=26, thick=9, arch=5):
    b = ""
    for sx in (-1, 1):
        x = cx + sx * gap
        b += f'<g class="brow{"L" if sx<0 else "R"}">' + P(f"M{x-w} {cy+3} Q{x} {cy-arch-thick} {x+w} {cy+1} Q{x} {cy-arch+2} {x-w} {cy+3}Z", col, 2) + "</g>"
    return f'<g class="brows">{b}</g>'

def arm_long(px, py, length, col, shade, sx, w=40, cls="armL", cuff=None):
    """Arm in a full-length sleeve: same joints/pivots as gen3.arm, sleeve fabric down to the wrist."""
    elx, ely = px + sx * 6, py + length * 0.52
    wx, wy = px + sx * 10, py + length - 10
    uw, fw, ww = w * 0.46, w * 0.40, w * 0.33
    upper = (P(f"M{px-w*0.6} {py-6} Q{px+sx*4} {py-16} {px+w*0.6} {py-6} L{elx+fw+2} {ely} L{elx-fw-2} {ely}Z", col, SW)
             + S(f"M{px+sx*w*0.15} {py} L{px+sx*w*0.56} {py-4} L{elx+sx*fw} {ely} L{elx+sx*fw*0.2} {ely}Z", shade, .8))
    fore = (f'<circle cx="{elx}" cy="{ely}" r="{fw+2}" fill="{col}" stroke="{O}" stroke-width="{SW}"/>'
            + hand(wx, wy - 4, sx, w / 34)
            + P(f"M{elx-fw} {ely} Q{elx-fw+sx*2} {(ely+wy)/2} {wx-ww} {wy-6} L{wx+ww} {wy-6} Q{elx+fw+sx*2} {(ely+wy)/2} {elx+fw} {ely}Z", col, SW)
            + S(f"M{elx+sx*fw*0.2} {ely+2} L{wx+sx*ww*0.1} {wy-8} L{wx+sx*ww} {wy-8} L{elx+sx*fw} {ely+2}Z", shade, .8)
            + f'<circle cx="{elx}" cy="{ely}" r="{fw}" fill="{col}" stroke="none"/>')
    if cuff:
        fore += P(f"M{wx-ww-2} {wy-18} L{wx+ww+2} {wy-18} L{wx+ww+3} {wy-4} L{wx-ww-3} {wy-4}Z", cuff, 3)
    fcls = "foreL" if cls == "armL" else "foreR"
    return f'<g class="{cls}" data-p="{px},{py}">{upper}<g class="{fcls}" data-p="{elx},{ely}">{fore}</g></g>'

def adult_shoe(x, ya, sx, col="#2A1E18", buckle=False):
    tx = x + sx * 4
    b = P(f"M{x-17} {ya} L{x+17} {ya} Q{x+22} {ya+16} {x+24+sx*3} {ya+28} Q{tx+20} {ya+44} {tx} {ya+46} Q{tx-20} {ya+44} {x-24+sx*3} {ya+28} Q{x-22} {ya+16} {x-17} {ya}Z", col, SW)
    b += P(f"M{x-25+sx*3} {ya+32} Q{tx} {ya+56} {x+25+sx*3} {ya+32} L{x+24+sx*3} {ya+38} Q{tx} {ya+60} {x-24+sx*3} {ya+38}Z", "#141010", 3)
    b += f'<ellipse cx="{tx-sx*6}" cy="{ya+30}" rx="8" ry="3.5" fill="#fff" opacity=".25"/>'
    if buckle:
        b += f'<rect x="{x-9}" y="{ya+8}" width="18" height="12" rx="2" fill="#D9C27A" stroke="{O}" stroke-width="2.5"/>'
    return b

def legs(cx, gap, top, bottom, trouser, tshade, shoe_col, buckle=False, stock=None, stock_top=None):
    out = ""
    for sx in (-1, 1):
        x = cx + sx * gap
        g = f'<g class="{"legL" if sx<0 else "legR"}" data-p="{x},{top}">'
        g += P(f"M{x-25} {top} L{x-20} {bottom} L{x+20} {bottom} L{x+25} {top}Z", trouser, SW)
        g += S(f"M{x+sx*6} {top} L{x+sx*8} {bottom} L{x+sx*20} {bottom} L{x+sx*25} {top}Z", tshade, .55)
        if stock:
            g += P(f"M{x-18} {stock_top} L{x-16} {bottom} L{x+16} {bottom} L{x+18} {stock_top}Z", stock, SW)
        g += adult_shoe(x, bottom - 4, sx, shoe_col, buckle) + "</g>"
        out += g
    return out

def head(cx, hair_back, hair_front, hair_col, brow_col, mous="", female=False, extra_face="", mouth_y=230):
    hd = P(f"M{cx-20} 210 L{cx-23} 268 Q{cx} 278 {cx+23} 268 L{cx+20} 210Z", G.SKIN, SW)
    hd += hair_back
    hd += ear(cx-74, 160, -1) + ear(cx+74, 160, 1)
    if female:
        face = f"M{cx-72} 120 Q{cx-80} 205 {cx-36} 240 Q{cx} 258 {cx+36} 240 Q{cx+80} 205 {cx+72} 120 Q{cx} 70 {cx-72} 120Z"
    else:
        face = f"M{cx-74} 118 Q{cx-80} 212 {cx-40} 246 Q{cx} 264 {cx+40} 246 Q{cx+80} 212 {cx+74} 118 Q{cx} 68 {cx-74} 118Z"
    hd += P(face, G.SKIN, SW) + S(f"M{cx+34} 104 Q{cx+78} 122 {cx+74} 182 Q{cx+68} 232 {cx+26} 252 Q{cx+54} 210 {cx+52} 152Z", G.SKIN_S, .5)
    hd += '<g class="face">'
    eo, ec = eyes(cx, 162, 31, 20, 14, lash=6 if female else 5)
    hd += eo + ec + brows_c(cx, 132, 32, brow_col, 24, 10 if not female else 6, 5)
    hd += P(f"M{cx-5} 168 Q{cx-14} 194 {cx-4} 200 Q{cx+9} 203 {cx+12} 196 Q{cx+8} 188 {cx+4} 168Z", G.SKIN_S, 2.5)
    hd += S(f"M{cx-52} 200 Q{cx-44} 212 {cx-30} 210", "#E07A6A", .25) + S(f"M{cx+52} 200 Q{cx+44} 212 {cx+30} 210", "#E07A6A", .25)
    hd += mous + mouths(cx, mouth_y, 22) if mouth_y > 236 else mouths(cx, mouth_y, 22) + mous
    hd += '' + extra_face + '</g>'
    hd += f'<g class="hairF">{hair_front}</g>'
    return f'<g class="head" data-p="{cx},262"><g transform="translate({cx} 262) scale(1.12) translate({-cx} -262)">{hd}</g></g>'

# --------------------------------------------------------------------- J. C. Bose
def jc_bose():
    skin("#C98E5C", "#A87044")
    W, H, cx = 440, 1000, 220
    HC, HG = "#26262C", "#7E7E88"
    b = legs(cx, 34, 640, 930, "#EEEAE2", "#CFC9BE", "#1E1A18")
    coat = f"M{cx-104} 270 Q{cx-118} 520 {cx-112} 770 Q{cx} 790 {cx+112} 770 Q{cx+118} 520 {cx+104} 270 Q{cx} 250 {cx-104} 270Z"
    b += P(coat, "#23242B", SW) + S(f"M{cx+40} 262 Q{cx+106} 270 {cx+108} 300 Q{cx+116} 520 {cx+110} 768 Q{cx+80} 776 {cx+60} 778 Q{cx+70} 500 {cx+40} 262Z", "#3C3E48", .8)
    b += L(f"M{cx} 286 L{cx} 770", 3, "#0E0E12") + "".join(f'<circle cx="{cx}" cy="{y}" r="5" fill="#3A3C46" stroke="{O}" stroke-width="2"/>' for y in range(310, 600, 48))
    b += P(f"M{cx-40} 262 Q{cx} 276 {cx+40} 262 L{cx+38} 286 Q{cx} 300 {cx-38} 286Z", "#23242B", 3.5)   # mandarin collar
    b += P(f"M{cx-14} 270 L{cx} 290 L{cx+14} 270Z", "#F2F0EA", 2)
    b += arm_long(cx-112, 296, 300, "#23242B", "#3C3E48", -1, 40, "armL", "#F2F0EA") + arm_long(cx+112, 296, 300, "#23242B", "#3C3E48", 1, 40, "armR", "#F2F0EA")
    back = P(f"M{cx-84} 176 Q{cx-104} 70 {cx-46} 36 Q{cx} 18 {cx+46} 34 Q{cx+106} 64 {cx+84} 176 L{cx+70} 190 L{cx-70} 190Z", HC, 3)
    back += S(f"M{cx-84} 174 Q{cx-96} 124 {cx-78} 98 L{cx-68} 152Z", HG, .9) + S(f"M{cx+84} 174 Q{cx+96} 124 {cx+78} 98 L{cx+68} 152Z", HG, .9)
    front = P(f"M{cx-66} 100 Q{cx-60} 50 {cx-6} 40 Q{cx+56} 36 {cx+74} 96 Q{cx+50} 70 {cx+20} 74 Q{cx-20} 70 {cx-40} 84 Q{cx-56} 90 {cx-66} 100Z", HC, 3)
    front += L(f"M{cx-48} 70 Q{cx-10} 44 {cx+40} 54 M{cx-40} 82 Q{cx} 60 {cx+52} 72 M{cx-20} 50 Q{cx+20} 42 {cx+56} 60", 2.4, "#55555F")
    front += L(f"M{cx-60} 92 Q{cx-56} 80 {cx-48} 74 M{cx+60} 80 Q{cx+66} 88 {cx+70} 96", 2.4, HG)
    mous = P(f"M{cx} 210 Q{cx-28} 204 {cx-50} 220 Q{cx-56} 232 {cx-42} 228 Q{cx-22} 218 {cx} 222 Q{cx+22} 218 {cx+42} 228 Q{cx+56} 232 {cx+50} 220 Q{cx+28} 204 {cx} 210Z", "#2E2E34", 3)
    mous += L(f"M{cx-38} 216 Q{cx-30} 212 {cx-22} 214 M{cx+22} 214 Q{cx+30} 212 {cx+38} 216", 1.6, HG)
    b += head(cx, back, front, HC, "#2A2A30", mous)
    return svg(W, H, b)

# --------------------------------------------------------------------- Isaac Newton
def newton():
    skin("#EBC09A", "#CF9E76")
    W, H, cx = 440, 1000, 220
    HC, HS = "#DCD8CF", "#B5B0A6"
    b = legs(cx, 34, 640, 930, "#4A3020", "#33201A", "#1A1414", True, "#EEEBE4", 790)
    coat = f"M{cx-108} 272 Q{cx-124} 520 {cx-120} 780 Q{cx-60} 796 {cx-24} 788 L{cx-12} 320 L{cx+12} 320 L{cx+24} 788 Q{cx+60} 796 {cx+120} 780 Q{cx+124} 520 {cx+108} 272 Q{cx} 252 {cx-108} 272Z"
    b += P(f"M{cx-40} 300 L{cx+40} 300 L{cx+44} 700 Q{cx} 712 {cx-44} 700Z", "#6E4A30", SW)   # waistcoat
    b += "".join(f'<circle cx="{cx}" cy="{y}" r="4.5" fill="#C9A85A" stroke="{O}" stroke-width="2"/>' for y in range(360, 690, 40))
    b += P(coat, "#5A3824", SW) + S(f"M{cx+40} 264 Q{cx+110} 272 {cx+112} 300 Q{cx+122} 520 {cx+118} 778 Q{cx+70} 790 {cx+60} 790 Q{cx+72} 500 {cx+40} 264Z", "#3E2618", .7)
    b += "".join(f'<circle cx="{cx+sx*22}" cy="{y}" r="5" fill="#C9A85A" stroke="{O}" stroke-width="2"/>' for sx in (-1, 1) for y in (420, 520, 620))
    b += P(f"M{cx-30} 262 Q{cx} 280 {cx+30} 262 L{cx+16} 330 Q{cx+22} 380 {cx+6} 400 L{cx-6} 400 Q{cx-22} 380 {cx-16} 330Z", "#F6F4EE", 3)   # cravat
    b += L(f"M{cx-6} 300 L{cx} 390 M{cx+6} 300 L{cx+2} 380", 1.6, "#C9C4B8")
    b += arm_long(cx-114, 298, 300, "#5A3824", "#3E2618", -1, 42, "armL", "#F6F4EE") + arm_long(cx+114, 298, 300, "#5A3824", "#3E2618", 1, 42, "armR", "#F6F4EE")
    def wavy(sx):
        x0 = cx + sx * 70
        return (f"M{x0} 96 Q{cx+sx*118} 110 {cx+sx*112} 170 Q{cx+sx*132} 200 {cx+sx*116} 238 Q{cx+sx*136} 270 {cx+sx*114} 300 "
                f"Q{cx+sx*126} 330 {cx+sx*96} 344 Q{cx+sx*72} 330 {cx+sx*80} 300 Q{cx+sx*66} 270 {cx+sx*82} 240 Q{cx+sx*68} 200 {cx+sx*80} 168 Z")
    back = P(f"M{cx-76} 150 Q{cx-90} 62 {cx} 50 Q{cx+90} 62 {cx+76} 150Z", HC, 3) + P(wavy(-1), HC, 3) + P(wavy(1), HC, 3)
    back += L(f"M{cx-100} 200 q-10 20 4 40 M{cx-104} 270 q-8 18 4 34 M{cx+100} 200 q10 20 -4 40 M{cx+104} 270 q8 18 -4 34", 2.2, HS)
    front = P(f"M{cx-4} 62 Q{cx-50} 64 {cx-78} 118 Q{cx-58} 92 {cx-30} 96 Q{cx-12} 92 {cx-4} 70Z", HC, 3) + P(f"M{cx+4} 62 Q{cx+50} 64 {cx+78} 118 Q{cx+58} 92 {cx+30} 96 Q{cx+12} 92 {cx+4} 70Z", HC, 3)
    front += L(f"M{cx-20} 72 Q{cx-44} 80 {cx-60} 100 M{cx+20} 72 Q{cx+44} 80 {cx+60} 100", 2, HS)
    b += head(cx, back, front, HC, "#9A948A")
    return svg(W, H, b)

# --------------------------------------------------------------------- Albert Einstein
def einstein():
    skin("#EDC4A0", "#D2A27C")
    W, H, cx = 440, 1000, 220
    HC, HS = "#F4F3EF", "#C9C7C0"
    b = legs(cx, 36, 620, 930, "#8B8D92", "#6E7075", "#5A3A22")
    b += P(f"M{cx-36} 262 L{cx} 300 L{cx+36} 262 L{cx+30} 330 L{cx-30} 330Z", "#FFFFFF", 3)   # shirt
    card = f"M{cx-106} 272 Q{cx-122} 460 {cx-112} 650 Q{cx-40} 664 {cx-14} 660 L{cx-8} 330 L{cx-36} 266 Q{cx-70} 262 {cx-106} 272Z"
    card2 = f"M{cx+106} 272 Q{cx+122} 460 {cx+112} 650 Q{cx+40} 664 {cx+14} 660 L{cx+8} 330 L{cx+36} 266 Q{cx+70} 262 {cx+106} 272Z"
    b += P(f"M{cx-14} 330 L{cx+14} 330 L{cx+14} 660 L{cx-14} 660Z", "#FFFFFF", 3)
    b += P(card, "#7A7D84", SW) + P(card2, "#7A7D84", SW) + S(f"M{cx+60} 280 Q{cx+116} 300 {cx+112} 648 L{cx+70} 656 Q{cx+80} 450 {cx+60} 280Z", "#5E6168", .7)
    b += "".join(f'<circle cx="{cx+14}" cy="{y}" r="5" fill="#4A4C52" stroke="{O}" stroke-width="2"/>' for y in range(380, 650, 56))
    b += "".join(L(f"M{cx+sx*30} {y} L{cx+sx*100} {y+4}", 1.4, "#6A6D74") for sx in (-1, 1) for y in range(330, 640, 26))
    b += arm_long(cx-112, 296, 296, "#7A7D84", "#5E6168", -1, 42, "armL") + arm_long(cx+112, 296, 296, "#7A7D84", "#5E6168", 1, 42, "armR")
    puffs = [(-104, 150, 34), (-92, 104, 36), (-60, 70, 38), (-14, 54, 38), (34, 58, 38), (76, 82, 36), (102, 124, 34), (108, 172, 30), (-112, 196, 28)]
    back = "".join(f'<circle cx="{cx+dx}" cy="{dy}" r="{r}" fill="{HC}" stroke="{O}" stroke-width="3"/>' for dx, dy, r in puffs)
    back += "".join(f'<circle cx="{cx+dx}" cy="{dy}" r="{r-4}" fill="{HC}"/>' for dx, dy, r in puffs)
    back += "".join(L(f"M{cx+dx-10} {dy-6} q8 -10 18 -4", 2, HS) for dx, dy, r in puffs)
    back += "".join(L(f"M{cx+sx*130} {y} l{sx*14} {-8}", 3, O) for sx in (-1, 1) for y in (110, 160, 200))
    front = P(f"M{cx-56} 102 Q{cx-30} 74 {cx-6} 92 Q{cx+20} 70 {cx+50} 96 Q{cx+30} 90 {cx+14} 100 Q{cx-10} 92 {cx-26} 104 Q{cx-42} 96 {cx-56} 102Z", HC, 3)
    mous = P(f"M{cx} 204 Q{cx-30} 196 {cx-54} 214 Q{cx-58} 234 {cx-40} 232 Q{cx-30} 238 {cx-18} 230 Q{cx} 238 {cx+18} 230 Q{cx+30} 238 {cx+40} 232 Q{cx+58} 234 {cx+54} 214 Q{cx+30} 196 {cx} 204Z", HC, 3)
    mous += L(f"M{cx-40} 214 l-4 12 M{cx-26} 210 l-2 14 M{cx+26} 210 l2 14 M{cx+40} 214 l4 12", 1.6, HS)
    wrinkle = L(f"M{cx-30} 112 Q{cx} 106 {cx+30} 112 M{cx-24} 122 Q{cx} 117 {cx+24} 122", 1.6, G.SKIN_S)
    b += head(cx, back, front, HC, "#E4E2DC", mous, extra_face=wrinkle, mouth_y=246)
    return svg(W, H, b)

# --------------------------------------------------------------------- Marie Curie
def marie_curie():
    skin("#F0CDB0", "#D4A888")
    W, H, cx = 440, 1000, 220
    HC, HS = "#7A6250", "#5A4636"
    b = ""
    for sx in (-1, 1):                     # only the shoes show under the long dress; they still step
        x = cx + sx * 30
        b += f'<g class="{"legL" if sx<0 else "legR"}" data-p="{x},880">' + adult_shoe(x, 922, sx, "#1A1414") + "</g>"
    dress = f"M{cx-96} 272 Q{cx-110} 470 {cx-104} 600 Q{cx-140} 760 {cx-150} 940 Q{cx} 962 {cx+150} 940 Q{cx+140} 760 {cx+104} 600 Q{cx+110} 470 {cx+96} 272 Q{cx} 252 {cx-96} 272Z"
    b += P(dress, "#25252B", SW) + S(f"M{cx+40} 264 Q{cx+98} 272 {cx+100} 300 Q{cx+108} 470 {cx+102} 600 Q{cx+136} 760 {cx+146} 938 Q{cx+110} 950 {cx+80} 952 Q{cx+92} 700 {cx+40} 264Z", "#3C3C46", .8)
    b += L(f"M{cx-102} 600 Q{cx} 614 {cx+102} 600", 3, "#141418")
    b += "".join(L(f"M{cx+dx} 620 Q{cx+dx*1.25} 780 {cx+dx*1.4} 940", 2, "#3A3A44") for dx in (-60, -20, 20, 60))
    b += P(f"M{cx-34} 258 Q{cx} 272 {cx+34} 258 L{cx+32} 288 Q{cx} 300 {cx-32} 288Z", "#25252B", 3)   # high collar
    b += arm_long(cx-102, 298, 290, "#25252B", "#3C3C46", -1, 38, "armL") + arm_long(cx+102, 298, 290, "#25252B", "#3C3C46", 1, 38, "armR")
    back = P(f"M{cx-80} 172 Q{cx-102} 80 {cx-30} 56 Q{cx} 48 {cx+30} 56 Q{cx+102} 80 {cx+80} 172 L{cx+66} 186 L{cx-66} 186Z", HC, 3)
    back += f'<ellipse cx="{cx+8}" cy="40" rx="44" ry="30" fill="{HC}" stroke="{O}" stroke-width="3"/>' + L(f"M{cx-20} 36 Q{cx+8} 22 {cx+36} 36 M{cx-18} 48 Q{cx+8} 36 {cx+34} 48", 2, HS)
    front = P(f"M{cx-72} 116 Q{cx-56} 70 {cx-2} 66 Q{cx+56} 70 {cx+72} 116 Q{cx+40} 88 {cx+4} 96 Q{cx-36} 88 {cx-72} 116Z", HC, 3)
    front += L(f"M{cx-50} 90 Q{cx-20} 76 {cx+10} 80 M{cx+16} 80 Q{cx+40} 82 {cx+56} 96", 2, HS)
    b += head(cx, back, front, HC, "#5E4A3A", female=True)
    return svg(W, H, b)

# --------------------------------------------------------------------- Archimedes
def archimedes():
    skin("#D9A47A", "#BC845A")
    W, H, cx = 440, 1000, 220
    HC, HS = "#EEEBE4", "#C2BDB2"
    b = ""
    for sx in (-1, 1):                       # bare legs in leather sandals under the chiton
        x = cx + sx * 34
        b += f'<g class="{"legL" if sx<0 else "legR"}" data-p="{x},760">'
        b += P(f"M{x-17} 780 L{x-15} 922 L{x+15} 922 L{x+17} 780Z", G.SKIN, SW)
        b += G.bare_foot(x, 918, sx, 1.08, "#8A5A2E") + "</g>"
    chiton = f"M{cx-100} 272 Q{cx-116} 520 {cx-112} 800 Q{cx} 816 {cx+112} 800 Q{cx+116} 520 {cx+100} 272 Q{cx} 254 {cx-100} 272Z"
    b += P(chiton, "#F4F1EA", SW) + S(f"M{cx+40} 264 Q{cx+102} 272 {cx+104} 300 Q{cx+114} 520 {cx+110} 798 Q{cx+80} 806 {cx+62} 808 Q{cx+76} 520 {cx+40} 264Z", "#D8D2C6", .8)
    b += "".join(L(f"M{cx+dx} 560 Q{cx+dx*1.1} 680 {cx+dx*1.15} 800", 2, "#CFC8BA") for dx in (-60, -20, 20, 60))
    b += P(f"M{cx-104} 540 Q{cx} 556 {cx+104} 540 L{cx+104} 556 Q{cx} 572 {cx-104} 556Z", "#B8862E", 3)   # belt
    # terracotta himation draped over the left shoulder and across the body
    b += P(f"M{cx-104} 270 Q{cx-60} 262 {cx-30} 280 Q{cx+40} 420 {cx+108} 600 L{cx+112} 700 Q{cx+40} 560 {cx-40} 470 Q{cx-90} 420 {cx-110} 330Z", "#B5482E", SW)
    b += L(f"M{cx-70} 300 Q{cx} 420 {cx+90} 600 M{cx-86} 340 Q{cx-10} 460 {cx+96} 660", 2.5, "#8E3420")
    b += arm(cx-110, 296, 290, "#F4F1EA", "#D8D2C6", 70, -1, 40, "armL") if False else ""
    b += G.arm(cx-110, 296, 286, "#B5482E", "#8E3420", 80, -1, 40, "armL") + G.arm(cx+110, 296, 286, "#F4F1EA", "#D8D2C6", 80, 1, 40, "armR")
    # balding head: curly white hair at the sides and back
    curls = [(-80, 150, 20), (-86, 120, 18), (-74, 96, 16), (-84, 180, 18), (80, 150, 20), (86, 120, 18), (74, 96, 16), (84, 180, 18), (-56, 80, 14), (56, 80, 14)]
    back = "".join(f'<circle cx="{cx+dx}" cy="{dy}" r="{r}" fill="{HC}" stroke="{O}" stroke-width="3"/>' for dx, dy, r in curls)
    back += "".join(f'<circle cx="{cx+dx}" cy="{dy}" r="{r-4}" fill="{HC}"/>' for dx, dy, r in curls)
    front = L(f"M{cx-30} 84 Q{cx} 76 {cx+30} 84", 2, G.SKIN_S) + S(f"M{cx-24} 90 Q{cx} 82 {cx+20} 88 Q{cx} 92 {cx-24} 94Z", "#fff", .35)
    # full curly beard around the jaw (drawn under the mouth), moustache above the mouth
    beard = P(f"M{cx-72} 180 Q{cx-80} 250 {cx-44} 288 Q{cx} 316 {cx+44} 288 Q{cx+80} 250 {cx+72} 180 Q{cx+64} 226 {cx+34} 242 Q{cx} 252 {cx-34} 242 Q{cx-64} 226 {cx-72} 180Z", HC, 3)
    bc = ((-62, 236, 20), (-52, 266, 22), (-28, 286, 23), (0, 294, 24), (28, 286, 23), (52, 266, 22), (62, 236, 20))
    beard += "".join(f'<circle cx="{cx+dx}" cy="{dy}" r="{r}" fill="{HC}" stroke="{O}" stroke-width="2.5"/>' for dx, dy, r in bc)
    beard += "".join(f'<circle cx="{cx+dx}" cy="{dy}" r="{r-3}" fill="{HC}"/>' for dx, dy, r in bc)
    beard += S(f"M{cx-60} 230 Q{cx} 300 {cx+60} 230 Q{cx} 262 {cx-60} 230Z", HC)
    beard += L(f"M{cx-40} 258 q6 8 0 16 M{cx-14} 268 q6 8 0 16 M{cx+14} 268 q6 8 0 16 M{cx+40} 258 q6 8 0 16", 1.6, HS)
    mous = P(f"M{cx} 214 Q{cx-26} 206 {cx-46} 222 Q{cx-48} 232 {cx-34} 228 Q{cx-18} 220 {cx} 224 Q{cx+18} 220 {cx+34} 228 Q{cx+48} 232 {cx+46} 222 Q{cx+26} 206 {cx} 214Z", HC, 3)
    hd = head(cx, back, front, HC, "#DAD6CC", mous, extra_face=beard, mouth_y=238)
    hd = hd.replace(beard, "")                                  # re-insert the beard under the mouth
    hd = hd.replace('<g class="mouths">', beard + '<g class="mouths">', 1)
    b += hd
    return svg(W, H, b)

if __name__ == "__main__":
    out = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(".")
    chars = {"jc_bose": jc_bose(), "newton": newton(), "einstein": einstein(), "marie_curie": marie_curie(), "archimedes": archimedes()}
    (out / "scientists.json").write_text(json.dumps(chars), encoding="utf-8")
    print("wrote", list(chars))
