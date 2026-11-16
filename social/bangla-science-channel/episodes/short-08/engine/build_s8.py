"""Build Short 8 (ayna-ulto: why is AMBULANCE written backwards on an ambulance?) as s8.html for the puppet engine,
timed to the voice timeline and to ../../episodes/short-08/storyboard.md. Usage: python3 build_s8.py <kit dir> <voiceover/short-08 dir>
3D set: env3d/barber_stall.py (wide + mirror close-up + reverse street plates, projected anchor points).
The mirror glass in the plates is filled with the (flipped) street behind the camera by make_plates()."""
import json, sys, base64, io
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
sys.path.insert(0, str(Path(__file__).resolve().parent))
import art8 as X
A = X.A

S = Path(sys.argv[1]); V = Path(sys.argv[2])
P = S / "s8"
chars = json.loads((S / "chars/chars3.json").read_text())
tl = json.loads((V / "timeline.json").read_text())
ENV = S / "env3d/out"
PT = json.loads((ENV / "barber_points.json").read_text())

# ---- plates: put the mirrored street into the mirror glass (wide + close-up)
street = Image.open(ENV / "barber_street.jpg").convert("RGB")
CROP = (0, 300, 1080, 1760)                       # the part of the street the mirror shows (road + jam + shops)
def glass_box(c): return [round(min(c["tl"][0], c["bl"][0])), round(min(c["tl"][1], c["tr"][1])), round(max(c["tr"][0], c["br"][0])), round(max(c["bl"][1], c["br"][1]))]
def mirror_fill(img, corners, scale_k):
    x0, y0, x1, y1 = glass_box(corners); gw, gh = x1 - x0, y1 - y0
    cw = CROP[2] - CROP[0]; ch = CROP[3] - CROP[1]
    k = max(gw / cw, gh / ch)
    st = street.crop(CROP).transpose(Image.FLIP_LEFT_RIGHT).resize((round(cw * k), round(ch * k)), Image.LANCZOS)
    st = st.crop(((st.width - gw) // 2, (st.height - gh) // 2, (st.width - gw) // 2 + gw, (st.height - gh) // 2 + gh))
    st = Image.blend(st, Image.new("RGB", st.size, (205, 228, 238)), 0.12)
    m = Image.new("L", img.size, 0); ImageDraw.Draw(m).polygon([tuple(corners[q]) for q in ("tl", "tr", "br", "bl")], fill=255)
    lay = Image.new("RGB", img.size); lay.paste(st, (x0, y0)); img.paste(lay, (0, 0), m)
    return (x0, y0, gw, gh, k)
def b64(img):
    bio = io.BytesIO(); img.save(bio, "JPEG", quality=90); return base64.b64encode(bio.getvalue()).decode()
wide_img = Image.open(ENV / "barber_wide.jpg").convert("RGB")      # 2160x3840
cw2 = {q: [v * 2 for v in PT["wide"]["mirror"][q]] for q in PT["wide"]["mirror"]}
mirror_fill(wide_img, cw2, 2)
mir_img = Image.open(ENV / "barber_mirror.jpg").convert("RGB")
GX, GY, GW, GH, GK = mirror_fill(mir_img, PT["mirror"]["mirror"], 1)
def st_to_glass(x, y):
    """street-plate point -> close-up screen point inside the mirror (flipped)."""
    cw = CROP[2] - CROP[0]; ch = CROP[3] - CROP[1]
    sx = (CROP[2] - x) * GK - (cw * GK - GW) / 2; sy = (y - CROP[1]) * GK - (ch * GK - GH) / 2
    return sx, sy                                  # in glass-local coordinates
def plate_html(img): return f'<img src="data:image/jpeg;base64,{b64(img)}" style="width:1080px;height:1920px;display:block">'
PLATES = {"wide": plate_html(wide_img), "mirror": plate_html(mir_img), "street": plate_html(street)}

lines = [{"speaker": l["speaker"], "start": l["start"], "end": l["end"]} for l in tl["lines"]]
LN = {l["i"]: l for l in tl["lines"]}
VEND = tl["duration"]; DUR = round(VEND + 2.66, 2)

def cam(wx, wy, s, sx=540, sy=900):
    wx = min(max(wx, sx / s), 1080 - (1080 - sx) / s); wy = min(max(wy, sy / s), 1920 - (1920 - sy) / s)
    return [round(sx - s * wx), round(sy - s * wy), s]
def pop(t0, x, y, s=1, rot=0, t1=None, fade=0.25):
    k = [[t0 - 0.01, x, y, s * 0.3, rot, 0], [t0, x, y, s * 0.3, rot, 1], [t0 + fade, x, y, s, rot, 1]]
    if t1: k += [[t1 - 0.2, x, y, s, rot, 1], [t1, x, y, s, rot, 0]]
    return k
def hold(a, b, x, y, s=1, rot=0): return [[a, x, y, s, rot, 1], [b, x, y, s, rot, 1]]
def win(a, b, x, y, s=1, rot=0):
    return [[a - 0.001, x, y, s, rot, 0], [a, x, y, s, rot, 1], [b, x, y, s, rot, 1], [b + 0.001, x, y, s, rot, 0]]
def prop(svg, keys, layer="world", z=40): return {"svg": svg, "layer": layer, "z": z, "keys": keys}
def scr(svg, keys, z=50): return prop(svg, keys, "screen", z)
def steps(t0, t1, v0, v1, n): return [(t0 + (t1 - t0) * k / n, v0 + (v1 - v0) * k / n) for k in range(n + 1)]
def states(seq, end, make):
    out = []
    for k, (t, v) in enumerate(seq):
        t1 = seq[k + 1][0] if k + 1 < len(seq) else end
        if t1 > t: out.append(make(t, t1, v))
    return out
def flashing(a, b, make, period=0.25):
    """Swap the ambulance lamps (red/blue) every period: make(t0, t1, light)."""
    seq = []; t = a; k = 0
    while t < b: seq.append((t, k % 2)); t += period; k += 1
    return states(seq, b, make)

F = 1820
M, B, T0, T = [230, F, .8], [700, F, .8], [1010, F, .8], [900, F, .8]
HEAD = {"mama": 845, "bithi": 850, "boltu": 700}
def head(c, pos): return pos[0], pos[1] - HEAD[c] * pos[2]
REST = [0, 0, -6, 6, 0]
M_LECTURE = [0, -60, -6, -60, 0]                 # Mama's right forearm out toward Boltu: explaining confidently
M_FLEX = [0, -150, -6, 0, 0]                     # proud flex
B_PAPER = [130, 0, -10, 6, 0]                    # Boltu's left arm up toward the mirror holding the sheet (hand ~ (496, 1249))
T_POINT = [50, 0, -30, 6, 0]                     # Bithi's left arm toward the mirror (hand ~ (714, 1405))

shots = []
def shot(a, b, **kw): shots.append({"start": a, "end": b, **kw})
CU = lambda x=540, y=960, s=1.0, s2=None: {"from": cam(x, y, s, 540, 960), "to": cam(x, y, s2 or s + 0.05, 540, 960)}

RC = PT["street"]["road_c"]; KS = abs(PT["street"]["road_c_x1"][0] - RC[0])     # px per metre on the road
AW = 2.0 * KS                                    # ambulance ~2 m wide
def amb_street(t0, t1, light, x=RC[0] + 30, s=1.0):
    h = AW * 300 / 320
    return prop(X.ambulance_front(light, AW), win(t0, t1, x, RC[1] - h / 2 + 8, s), z=20)

# 1 · HOOK: the ambulance stuck in the jam, its name written backwards, lamps flashing
a1, b1 = 0, 2.25
shot(a1, b1, blur=0, bgk="street", cam=CU(RC[0] + 30, RC[1] - 110, 2.0, 2.15), chars={},
     props=flashing(a1, b1, lambda t0, t1, l: amb_street(t0, t1, l)))
# 2 · wide two-shot: Boltu stares at the street (toward the camera); Mama explains confidently
a2, b2 = b1, LN[1]["end"] + 0.2
shot(a2, b2, blur=1.0, cam={"from": cam(470, 1360, 1.45), "to": cam(460, 1360, 1.52)},
     chars={"mama": M, "boltu": B}, mood={"mama": "happy", "boltu": "worried"}, turn={"mama": 0.5, "boltu": 0},
     poses={"mama": [[a2, *REST], [LN[1]["start"] + 0.1, *REST], [LN[1]["start"] + 0.5, *M_LECTURE], [b2 - 0.3, *M_LECTURE], [b2, *REST]]})
# 3 · Bithi walks in: "not a mistake; written backwards on purpose. Boltu, hold your name up to the mirror!"
a3, b3 = b2, LN[2]["end"] + 0.15
s2 = LN[2]["start"]; t_pt = s2 + 3.4
shot(a3, b3, blur=1.0, cam={"from": cam(600, 1340, 1.1), "to": cam(600, 1340, 1.18)},
     chars={"mama": M, "boltu": B, "bithi": T}, mood={"mama": "neutral", "boltu": "neutral", "bithi": "happy"},
     walk={"bithi": [[a3, 1010], [a3 + 0.9, 900]]}, turn={"mama": 0.6, "boltu": 0.6},
     poses={"bithi": [[a3, *REST], [t_pt, *REST], [t_pt + 0.45, *T_POINT], [b3 - 0.3, *T_POINT], [b3, *REST]]})
# 4 · close-up: Boltu holds up the sheet with his name (readable), then raises it to the mirror (wide)
a4, b4 = b3, b3 + 0.85
shot(a4, b4, blur=10, cam=CU(600, 1300, 1.6), chars={},
     props=[scr(X.paper_in_hand("বল্টু"), [[a4, 560, 1040, 1.4, -4, 1], [b4, 560, 1000, 1.45, -2, 1]], z=50)])
a4b, b4b = b4, LN[3]["start"] - 0.05
shot(a4b, b4b, blur=1.0, cam={"from": cam(560, 1300, 1.5), "to": cam(560, 1300, 1.55)},
     chars={"mama": M, "boltu": B, "bithi": T}, mood={"mama": "neutral", "boltu": "neutral", "bithi": "happy"},
     turn={"mama": 0.5, "boltu": -0.6, "bithi": -0.6},
     poses={"boltu": [[a4b, *REST], [a4b + 0.5, *B_PAPER], [b4b, *B_PAPER]]},
     props=[prop(X.paper("বল্টু", 120, 76, back=True), [[a4b, 633, 1530, .6, 0, 0], [a4b + 0.05, 633, 1530, .6, 0, 1], [a4b + 0.5, 496, 1222, 1, 0, 1], [b4b, 496, 1222, 1, 0, 1]], z=60)])
# 5 · MIRROR close-up: the reflection shows the name backwards; the real sheet's back in the foreground
a5, b5 = b4b, LN[3]["end"] + 0.2
refl = X.mirror_panel(GW, GH, f'<g transform="translate({GW*0.62 - 175} {GH*0.66 - 110})">{X._inner(X.paper("বল্টু", 350, 220, mirrored=True))}'
                       f'{X.flipx(X.hand_holding(350, 220), 350)}</g>')
shot(a5, b5, blur=0, bgk="mirror", cam=CU(540, 900, 1.0, 1.06), chars={},
     props=[prop(refl, hold(a5, b5, GX + GW / 2, GY + GH / 2), z=20),
            prop(X.paper_in_hand("বল্টু", 560, 350, back=True), hold(a5, b5, 930, 1640, 1, 6), z=30)])
# 6 · wide: Mama glares at the mirror: "this mirror is left-handed too!"; Boltu laughs, lowers the sheet
a6, b6 = b5, LN[4]["end"] + 0.2
shot(a6, b6, blur=1.2, cam={"from": cam(420, 1340, 1.4), "to": cam(420, 1340, 1.48)},
     chars={"mama": M, "boltu": B, "bithi": T}, mood={"mama": "worried", "boltu": "happy", "bithi": "happy"},
     turn={"mama": 0.6, "boltu": -0.6, "bithi": -0.6},
     poses={"boltu": [[a6, *B_PAPER], [a6 + 0.6, *REST], [b6, *REST]]},
     props=[prop(X.paper("বল্টু", 120, 76, back=True), [[a6, 496, 1222, 1, 0, 1], [a6 + 0.6, 633, 1540, .9, 0, 1], [b6, 633, 1540, .9, 0, 1]], z=60)])
# 7 · DEMONSTRATION 1: the name folds over the mirror line (the reflection is the flipped copy)
a7, b7 = b6, LN[5]["end"] + 0.2
s5 = LN[5]["start"]; t_f = s5 + 0.5; t_lab = s5 + 2.2
dp = states([(a7, 0.0)] + steps(t_f, t_f + 1.1, 0.0, 1.0, 11), b7, lambda t0, t1, v: scr(X.fold_word("name", v), win(t0, t1, 540, 960), z=50))
dp += [scr(A.tag("কাগজে", 230, 46, "#1A1A1A"), pop(a7 + 0.1, 315, 720, 1), z=60),
       scr(A.tag("আয়নায়", 250, 46, "#4A90B8"), pop(t_f + 0.9, 765, 720, 1), z=60),
       scr(A.tag("ডান-বাম উল্টো", 480, 54, "#D7263D"), pop(t_lab, 540, 1260, 1), z=60),
       scr(A.tag("lateral inversion", 420, 40, "#7A4FB5"), pop(t_lab + 0.5, 540, 1380, 1), z=60)]
shot(a7, b7, blur=9, bgk="mirror", cam=CU(), chars={}, props=dp)
# 8 · Boltu: "then why do they write it backwards on the ambulance?" (siren again in the distance)
a8, b8 = b7, LN[6]["end"] + 0.15
shot(a8, b8, blur=1.2, cam={"from": cam(700, 1360, 1.45), "to": cam(705, 1360, 1.52)},
     chars={"mama": M, "boltu": B, "bithi": T}, mood={"mama": "neutral", "boltu": "worried", "bithi": "neutral"},
     turn={"mama": 0.6, "boltu": 0.6, "bithi": -0.6})
# 9 · DEMONSTRATION 2: inside the car ahead: the rear-view mirror shows the ambulance behind, name reads correctly
a9, b9 = b8, LN[7]["end"] + 0.25
s7 = LN[7]["start"]; t_f2 = s7 + 4.4; t_ok = s7 + 6.2
RW, RH = 760, 260
def rv(t0, t1, v):
    light, sc = v
    w = 300 * sc; h = w * 300 / 320
    inner = (f'<rect x="20" y="{RH*0.62}" width="{RW}" height="{RH}" fill="#5B5E63"/><path d="M{RW/2-6} {RH*0.62} h12 v{RH} h-12z" fill="#F4F1E8"/>'
             f'<svg x="{RW/2 - w/2}" y="{RH*0.98 - h + 40}" width="{w:.0f}" height="{h:.0f}" viewBox="0 0 320 300">{X._inner(X.ambulance_reflected(light, 320))}</svg>')
    return scr(X.rearview(inner, RW, RH), win(t0, t1, 540, 330), z=50)
seq = []; t = a9; k = 0
while t < b9: seq.append((t, (k % 2, 0.55 + 0.25 * min(1, (t - a9) / 3.0)))); t += 0.25; k += 1
dp = states(seq, b9, rv)
dp += [scr(X.dashboard(), hold(a9, b9, 540, 1570), z=45),
       scr(A.tag("সামনের গাড়ির আয়না", 520, 46, "#1A1A1A"), pop(a9 + 0.4, 540, 680, 1, t1=t_f2 - 0.6), z=60)]
dp += states([(t_f2 - 0.4, 0.0)] + steps(t_f2, t_f2 + 1.1, 0.0, 1.0, 11), b9, lambda t0, t1, v: scr(X.fold_word("amb", v), win(t0, t1, 540, 860, .95), z=55))
dp += [scr(A.tag("উল্টো + উল্টো = সোজা", 560, 50, "#1E5AA8"), pop(t_ok, 540, 1120, 1), z=60)]
shot(a9, b9, blur=4, bgk="street", cam=CU(540, 1000, 1.25), chars={}, props=dp)
# 10 · REVEAL: siren; the ambulance comes up behind us and appears in the barber's mirror reading AMBULANCE
a10, b10 = b9, LN[8]["end"] + 0.2
ax, ay = st_to_glass(RC[0] + 30, RC[1])
def refl_amb(t0, t1, v):
    light, sc = v
    w = AW * GK * sc; h = w * 300 / 320
    body = f'<svg x="{ax - w/2:.0f}" y="{ay - h + 8*sc:.0f}" width="{w:.0f}" height="{h:.0f}" viewBox="0 0 320 300">{X._inner(X.ambulance_reflected(light, 320))}</svg>'
    return prop(X.mirror_panel(GW, GH, body), win(t0, t1, GX + GW / 2, GY + GH / 2), z=20)
seq = []; t = a10; k = 0
while t < b10: seq.append((t, (k % 2, 0.8 + 0.9 * min(1, max(0, t - a10 - 0.3) / 2.4)))); t += 0.25; k += 1
dp = states(seq, b10, refl_amb)
dp += [scr(A.tag("আয়নায় সোজা: AMBULANCE", 700, 50, "#1E5AA8"), pop(LN[8]["start"] + 0.3, 540, 1640, 1), z=60)]
shot(a10, b10, blur=0, bgk="mirror", cam=CU(540, 900, 1.0, 1.08), chars={}, props=dp)
# 11 · Mama, proud: "I knew it! I was just testing you!" Bithi gives him a look; Boltu laughs
a11, b11 = b10, LN[9]["end"] + 0.3
shot(a11, b11, blur=1.2, cam={"from": cam(470, 1330, 1.3), "to": cam(470, 1330, 1.38)},
     chars={"mama": M, "boltu": B, "bithi": T}, mood={"mama": "happy", "boltu": "happy", "bithi": "neutral"},
     turn={"boltu": -0.6, "bithi": -0.7},
     poses={"mama": [[a11, *REST], [a11 + 0.45, *M_FLEX], [b11, *M_FLEX]]})
# 12 · puzzle card
a12, b12 = b11, VEND
s10 = LN[10]["start"]
shot(a12, b12, bg="paper", cam={"from": [0, 0, 1], "to": [0, 0, 1]},
     chars={"bithi": [150, 1960, .42]}, mood={"bithi": "happy"}, poses={"bithi": [[a12, 0, -60, -6, 20, 0], [b12, 0, -60, -6, 20, 0]]},
     props=[scr(A.board_title("ধাঁধা!"), pop(a12 + 0.05, 540, 170, 1), z=5),
            scr(X.puzzle_card(), pop(a12 + 0.15, 540, 640, 1.0), z=6),
            scr(A.tag("ক) A", 260, 54, "#7A4FB5"), pop(s10 + 4.0, 360, 1080, 1), z=10),
            scr(A.tag("খ) B", 260, 54, "#1E5AA8"), pop(s10 + 4.5, 720, 1080, 1), z=10),
            scr(A.tag("কমেন্টে লেখো!", 520, 54, "#D7263D"), pop(s10 + 5.3, 600, 1260, 1), z=10)])
# 13 · end card
def wave(side, E0):
    k = []
    for i in range(10):
        t = E0 + i * 0.3; a_ = 128 + (10 if i % 2 else -10)
        k.append([t, a_, 0, 30, 6, 0] if side == "L" else [t, 0, -a_, -6, -30, 0])
    return k
E0 = VEND
shot(E0, DUR + 1, bg="paper", cam={"from": [0, 0, 1], "to": [0, 0, 1]},
     chars={"mama": [250, 1650, .42], "bithi": [540, 1650, .42], "boltu": [830, 1650, .46]}, mood={"mama": "happy", "bithi": "happy", "boltu": "happy"},
     poses={"mama": wave("L", E0), "bithi": wave("R", E0), "boltu": wave("R", E0)},
     props=[scr(A.banner(), pop(E0 + .05, 540, 430, 1), z=5),
            scr(A.wheel(), [[E0, 540, 820, .3, 0, 0], [E0 + .1, 540, 820, 1, 30, 1], [DUR + 1, 540, 820, 1, 30 + 120 * (DUR + 1 - E0 - .1), 1]], z=5),
            scr(A.tag("মন্টু মামা", 300, 44, "#FFC300", "#1A1A1A"), pop(E0 + .4, 250, 1128, 1), z=6),
            scr(A.tag("বিথী", 200, 44, "#FFFFFF", "#1A1A1A"), pop(E0 + .6, 540, 1128, 1), z=6),
            scr(A.tag("বল্টু", 200, 44, "#F72585", "#1A1A1A"), pop(E0 + .8, 830, 1128, 1), z=6)])

D = {"chars": {"mama": chars["Montu Mama"], "bithi": chars["Bithi"], "boltu": chars["Boltu"]}, "bg": "",
     "bgs": PLATES, "bgDefault": "wide",
     "lines": lines, "mouth": json.loads((P / "mouth.json").read_text()), "shots": shots, "dur": DUR}
html = (P / "engine.html").read_text().replace("__DATA__", json.dumps(D, ensure_ascii=False))
html = html.replace("</head>", "<style>" + (S / "p5/fonts.css").read_text() + "</style></head>", 1)
(P / "s8.html").write_text(html, encoding="utf-8")
json.dump({"shots": [[round(s["start"], 2), round(s["end"], 2)] for s in shots], "DUR": DUR}, open(P / "shots.json", "w"))
print("shots", len(shots), "dur", DUR, "frames", int(DUR * 24))
for s in shots: print(round(s["start"], 2), round(s["end"], 2), s.get("bgk", s.get("bg", "wide")))
