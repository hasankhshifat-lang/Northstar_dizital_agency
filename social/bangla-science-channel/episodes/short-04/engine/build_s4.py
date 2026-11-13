"""Build Short 4 (megher-gorjon: why the flash comes before the thunder) as s4.html for the puppet engine,
timed to the voice timeline. Usage: python3 build_s4.py <kit dir> <voiceover/short-04 dir>"""
import json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import art4 as X
A = X.A

S = Path(sys.argv[1]); V = Path(sys.argv[2])
P = S / "s4"
chars = json.loads((S / "chars/chars3.json").read_text())
tl = json.loads((V / "timeline.json").read_text())
G_LINES = {0, 1, 3, 4, 6, 9}                     # explaining / arguing lines get a talking gesture
lines = [{"speaker": l["speaker"], "start": l["start"], "end": l["end"],
          **({"also": l["also"]} if l.get("also") else {}), **({"g": True} if l["i"] in G_LINES else {})} for l in tl["lines"]]
LN = {l["i"]: l for l in tl["lines"]}
VEND = tl["duration"]; DUR = round(VEND + 2.66, 2)

def cam(wx, wy, s, sx=540, sy=900):
    wx = min(max(wx, sx / s), 1080 - (1080 - sx) / s); wy = min(max(wy, sy / s), 1920 - (1920 - sy) / s)
    return [round(sx - s * wx), round(sy - s * wy), s]
def pop(t0, x, y, s=1, rot=0, t1=None, fade=0.25):
    k = [[t0 - 0.01, x, y, s * 0.3, rot, 0], [t0, x, y, s * 0.3, rot, 1], [t0 + fade, x, y, s, rot, 1]]
    if t1: k += [[t1 - 0.2, x, y, s, rot, 1], [t1, x, y, s, rot, 0]]
    return k
def show(t0, t1, x, y, s=1, fade=0.08):
    return [[t0 - 0.01, x, y, s, 0, 0], [t0 + fade, x, y, s, 0, 1], [t1 - fade, x, y, s, 0, 1], [t1, x, y, s, 0, 0]]
def prop(svg, keys, layer="world", z=40): return {"svg": svg, "layer": layer, "z": z, "keys": keys}
def scr(svg, keys, z=50): return prop(svg, keys, "screen", z)

F = 1820
M, T, B = [300, F, .8], [560, F, .8], [790, F, .8]
HEAD = {"mama": 845, "bithi": 850, "boltu": 700}
def head(c, pos): return pos[0], pos[1] - HEAD[c] * pos[2]
REST = [0, 0, -6, 6, 0]

shots = []
def shot(a, b, **kw): shots.append({"start": a, "end": b, **kw})

STEAM = X.steam()
def steam(a, b):
    out = []
    for k in range(3):
        ks = []; t = a + k * 0.5
        while t < b:
            ks += [[t, 470, 1000, .9, 0, 0], [t + 0.2, 470, 985, .9, 0, .7], [t + 1.3, 474, 900, 1.1, 0, 0]]; t += 1.5
        out.append(prop(STEAM, ks, z=3))
    return out
RAIN = X.rain()
def rain(a, b, op=1):
    ks = []; t = a
    while t < b:
        ks += [[t, 540, 960 - 150, 1, 0, op], [t + 0.35 - 0.001, 540, 960 + 150, 1, 0, op]]; t += 0.35
    return [scr(RAIN, ks, z=45)]

# 1 · hook: the bolt strikes, the count ১-২-৩, the thunder; Mama asks why
L0 = LN[0]
jolt = [[0, *REST], [3.1, *REST], [3.22, 95, -95, 25, -25, -4], [3.6, 95, -95, 25, -25, -4], [4.1, *REST], [7.6, *REST]]
shot(0, L0["end"] + 0.2, blur=0.8, cam={"from": cam(540, 1250, 1.0), "to": cam(470, 1330, 1.12)},
     chars={"mama": M, "bithi": T, "boltu": B}, mood={"mama": "worried", "bithi": "neutral", "boltu": "neutral"},
     turn={"bithi": 0.5, "boltu": 0.5}, poses={"mama": jolt},
     props=steam(0, L0["end"] + 0.2) + [
        prop(X.bolt(), [[0.29, 840, 760, 1.5, 0, 0], [0.3, 840, 760, 1.5, 0, 1], [0.42, 840, 760, 1.5, 0, .3], [0.5, 840, 760, 1.5, 0, 1], [0.66, 840, 760, 1.5, 0, 0]], z=2),
        scr(X.flash(), [[0.29, 540, 960, 1, 0, 0], [0.31, 540, 960, 1, 0, .55], [0.42, 540, 960, 1, 0, .1], [0.5, 540, 960, 1, 0, .4], [0.7, 540, 960, 1, 0, 0]], z=90),
        scr(X.count_badge("১"), pop(0.9, 540, 380, 1.5, t1=1.85)),
        scr(X.count_badge("২"), pop(1.9, 540, 380, 1.5, t1=2.85)),
        scr(X.count_badge("৩"), pop(2.9, 540, 380, 1.5, t1=3.6))])
# Bithi and Boltu first look toward the bolt (right), then the auto turn takes them back to Mama when he talks
shots[-1]["turn"] = {}
shots[-1]["lookat"] = None

# 2 · Mama's imagination: a road in the sky, light = motorbike that slips through, sound = bus stuck in a jam
a2, b2 = shots[-1]["end"], LN[1]["end"] + 0.15
CY = 700; RY = CY - 450 + 420
jam = []
for i, (x, svg_) in enumerate(((560, X.car("#F2A93B")), (720, X.car("#7A4FB5")), (880, X.car("#3E8EA6")))):
    jam.append(scr(svg_, [[a2 + k * 0.4, x, RY - 30 + (3 if (k + i) % 2 else 0), .8, 0, 1] for k in range(int((b2 - a2) / 0.4) + 2)], z=20))
bus_k = [[a2 + k * 0.3, 380, RY - 50 + (5 if k % 2 else 0), .8, 0, 1] for k in range(int((b2 - a2) / 0.3) + 2)]
tm = LN[1]["start"] + 2.1
shot(a2, b2, blur=5, cam={"from": cam(540, 1300, 1.0), "to": cam(540, 1300, 1.0)},
     chars={"mama": [210, 2090, .82]}, mood={"mama": "happy"}, turn={"mama": 0.6},
     props=[scr(X.thought_cloud(), pop(a2 + 0.05, 540, CY, 1), z=10)] + jam + [scr(X.bus(), bus_k, z=21),
            scr(X.motorbike(), [[tm - 0.01, 60, RY + 25, .8, 0, 0], [tm, 60, RY + 25, .8, 0, 1], [tm + 0.7, 1000, RY + 25, .8, 0, 1], [b2, 1000, RY + 25, .8, 0, 1]], z=22),
            scr(A.tag("আলো", 200, 46, "#FFC300", "#1A1A1A"), pop(tm + 0.6, 880, RY - 160, 1)),
            scr(A.tag("শব্দ", 200, 46, "#1E5AA8"), pop(LN[1]["start"] + 3.4, 380, RY - 170, 1))])

# 3 · Boltu: "is there a traffic policeman in the sky?"
a3, b3 = b2, LN[2]["end"] + 0.2
hx, hy = head("boltu", B)
shot(a3, b3, blur=2, cam={"from": cam(hx - 40, hy, 1.9, 540, 760), "to": cam(hx - 40, hy, 2.0, 540, 760)},
     chars={"mama": M, "bithi": T, "boltu": B}, mood={"boltu": "neutral", "bithi": "happy"}, turn={"boltu": -0.6},
     poses={"boltu": [[a3, *REST], [a3 + 0.4, 0, -6, 6, 0, 7], [b3, 0, -6, 6, 0, 7]]}, props=steam(a3, b3))

# 4 · Bithi to Mama: "not a jam, a race!"
a4, b4 = b3, LN[3]["start"] + 1.6
shot(a4, b4, blur=1.2, cam={"from": cam(430, 1330, 1.3), "to": cam(440, 1335, 1.36)},
     chars={"mama": M, "bithi": T, "boltu": B}, mood={"mama": "neutral", "bithi": "happy"}, turn={"bithi": -0.6, "mama": 0.6},
     props=steam(a4, b4))

# 5 · board: same start, different speeds; then the 3-second rule
a5, b5 = b4, LN[4]["end"] + 0.3
OY = 200                                          # board scene top on screen
RAYY = OY + X.BY                                  # line the ray and rings travel on
t_same = LN[3]["start"] + 2.3                     # "একসাথেই তৈরি হয়"
t_light = LN[3]["start"] + 5.0                    # "আলো ... তিন লক্ষ কিলোমিটার"
t_sound = LN[3]["start"] + 8.0                    # "শব্দ মাত্র তিনশো তিরিশ মিটার"
t_see = LN[4]["start"] + 0.6                      # "চমক আগে দেখি"
t_hear = LN[4]["start"] + 2.0                     # "গর্জন পরে শুনি"
t_3s = LN[4]["start"] + 3.2                       # "তিন সেকেন্ডে শব্দ যায় প্রায় এক কিলোমিটার"
ray_len = X.BX1 - X.BX0 - 80
rings = []
for k in range(3):
    t0 = t_same + 0.05 + k * 0.45; t1 = t_hear + k * 0.45
    rings.append(scr(X.sound_ring(60), [[t0 - 0.01, X.BX0 + 40, RAYY, .6, 0, 0], [t0, X.BX0 + 40, RAYY, .6, 0, 1],
                                         [t1, X.BX1 - 110, RAYY, 1.6, 0, 1], [t1 + 0.2, X.BX1 - 100, RAYY, 1.7, 0, 0]], z=12))
EYE = (870, OY + 590); EAR = (1000, OY + 590)
bp = []
bp += [scr(A.board_title("চমক আর গর্জনের দৌড়"), pop(a5 + 0.1, 540, 120, 1), z=5),
       scr(X.board_scene(), pop(a5 + 0.15, 540, OY + 500, 1), z=6),
       scr(X.eye_icon(False), pop(a5 + 0.3, *EYE, .8), z=8), scr(X.ear_icon(False), pop(a5 + 0.3, *EAR, .7), z=8),
       scr(X.flash(), [[t_same - 0.01, 540, 960, 1, 0, 0], [t_same, 540, 960, 1, 0, .5], [t_same + 0.25, 540, 960, 1, 0, 0]], z=4),
       scr(X.light_ray(ray_len), [[t_same + 0.04, X.BX0 + 40 + ray_len / 2, RAYY, 1, 0, 0], [t_same + 0.1, X.BX0 + 40 + ray_len / 2, RAYY, 1, 0, 1],
                                  [t_same + 1.6, X.BX0 + 40 + ray_len / 2, RAYY, 1, 0, 1], [t_same + 2.2, X.BX0 + 40 + ray_len / 2, RAYY, 1, 0, .25], [b5, X.BX0 + 40 + ray_len / 2, RAYY, 1, 0, .25]], z=11),
       scr(X.eye_icon(True), [[t_same + 0.1, *EYE, .8, 0, 0], [t_same + 0.15, *EYE, .9, 0, 1], [b5, *EYE, .9, 0, 1]], z=9),
       scr(X.ear_icon(True), [[t_hear - 0.01, *EAR, .7, 0, 0], [t_hear + 0.05, *EAR, .8, 0, 1], [b5, *EAR, .8, 0, 1]], z=9),
       scr(A.tag("একসাথে তৈরি", 420, 44, "#7A4FB5"), pop(t_same, 300, OY + 250, 1, t1=t_light - 0.1), z=20),
       scr(A.tag("আলো: প্রায় ৩ লক্ষ কিমি/সেকেন্ড", 860, 44, "#FFC300", "#1A1A1A"), pop(t_light, 560, 1250, 1, t1=t_3s - 0.1), z=20),
       scr(A.tag("শব্দ (বাতাসে): প্রায় ৩৩০ মি/সেকেন্ড", 860, 44, "#1E5AA8"), pop(t_sound, 560, 1370, 1, t1=t_3s - 0.1), z=20),
       scr(A.tag("আগে দেখি", 250, 36, "#FFC300", "#1A1A1A"), pop(t_see, 790, OY + 480, 1), z=21),
       scr(A.tag("পরে শুনি", 250, 36, "#1E5AA8"), pop(t_hear, 950, OY + 380, 1), z=21),
       scr(X.ruler(), pop(t_3s, 520, 1270, 1), z=20)] + rings
# the 3-second ring along the ruler, with the stopwatch
RX0, RX1 = 520 - 390, 520 + 380
bp.append(scr(X.sound_ring(40), [[t_3s + 0.2, RX0, 1290, .8, 0, 0], [t_3s + 0.25, RX0, 1290, .8, 0, 1], [t_3s + 2.1, RX1, 1290, .8, 0, 1], [b5, RX1, 1290, .8, 0, 1]], z=21))
for i, n in enumerate("১২৩"):
    tt = t_3s + 0.25 + 0.62 * (i + 1)
    bp.append(scr(X.stopwatch(n), show(tt, b5 if i == 2 else tt + 0.62, 880, 1480, .9, 0.03), z=21))
bp.append(scr(A.tag("৩৩০ × ৩ = ৯৯০ মিটার ≈ ১ কিমি", 720, 44, "#D7263D"), pop(t_3s + 2.2, 430, 1480, 1), z=22))
shot(a5, b5, bg="paper", cam={"from": [0, 0, 1], "to": [0, 0, 1]},
     chars={"bithi": [120, 1960, .42]}, poses={"bithi": [[a5, 0, -60, -6, 20, 0], [b5, 0, -60, -6, 20, 0]]}, props=bp)

# 6 · Mama, smug: "6 seconds = 2 km, we're safe!"
a6, b6 = b5, LN[5]["end"] + 0.2
hx, hy = head("mama", M)
shot(a6, b6, blur=1.5, cam={"from": cam(hx + 80, hy + 120, 1.45, 540, 820), "to": cam(hx + 80, hy + 120, 1.6, 540, 820)},
     chars={"mama": M, "bithi": T}, mood={"mama": "happy", "bithi": "worried"}, turn={"mama": 0.5, "bithi": -0.6},
     props=steam(a6, b6) + [scr(A.tag("৬ সেকেন্ড ≈ ২ কিমি", 560, 50, "#FFC300", "#1A1A1A"), pop(LN[5]["start"] + 1.2, 540, 300, 1))])

# 7 · Bithi, serious: "2 km is very close! Hear thunder, go indoors, not under a tree"
a7, b7 = b6, LN[6]["end"] + 0.35
t_in = LN[6]["start"] + 2.1
shot(a7, b7, blur=1.2, cam={"from": cam(450, 1330, 1.25), "to": cam(455, 1335, 1.3)},
     chars={"mama": M, "bithi": T, "boltu": B}, mood={"mama": "worried", "bithi": "worried", "boltu": "neutral"}, turn={"bithi": -0.6, "mama": 0.6, "boltu": -0.5},
     props=steam(a7, b7) + rain(a7, b7, .7) + [
        scr(A.tag("গর্জন শুনলেই ঘরের ভেতরে", 760, 50, "#D7263D"), pop(t_in, 540, 250, 1), z=55),
        scr(X.house_ok(), pop(t_in + 0.9, 330, 480, 1), z=55),
        scr(X.tree_no(), pop(LN[6]["start"] + 4.3, 750, 480, 1), z=55)])

# 8 · Boltu pops a paper bag; Mama jumps: "a bolt right on my head?!"
a8, b8 = b7, LN[7]["end"] + 0.15
t_pop = LN[7]["start"] - 0.55
HOLD = [32, -32, -95, 95, 0]                   # both hands together in front of the chest, holding the bag
SLAP = [20, -20, -120, 120, 0]
BAG = (B[0] + 2, F - 395)                         # where Boltu's hands meet (checked on a still)
boltu8 = [[a8, *HOLD], [t_pop - 0.15, *HOLD], [t_pop, *SLAP], [t_pop + 0.4, *SLAP], [t_pop + 0.8, *REST], [b8, *REST]]
mama8 = [[a8, *REST], [t_pop + 0.05, *REST], [t_pop + 0.18, 100, -100, 30, -30, -6], [b8, 100, -100, 30, -30, -6]]
shot(a8, b8, blur=1.0, cam={"from": cam(540, 1320, 1.02), "to": cam(540, 1320, 1.02)},
     chars={"mama": M, "bithi": T, "boltu": B}, mood={"mama": "worried", "bithi": "neutral", "boltu": "happy"},
     turn={"bithi": 0.6, "boltu": -0.4}, poses={"boltu": boltu8, "mama": mama8},
     lean={"mama": [[a8, 0], [t_pop + 0.05, 0], [t_pop + 0.25, 8], [b8, 8]]},
     props=steam(a8, b8) + rain(a8, b8, .7) + [
        prop(X.bag(True), [[a8, *BAG, .8, 0, 1], [t_pop - 0.001, *BAG, .8, 0, 1], [t_pop, *BAG, .8, 0, 0]], z=60),
        prop(X.bag(False), [[t_pop - 0.001, *BAG, .8, 0, 0], [t_pop, *BAG, .8, 0, 1], [t_pop + 0.4, *BAG, .8, 0, 1], [t_pop + 0.8, B[0] + 70, F - 330, .8, 0, 1], [b8, B[0] + 70, F - 330, .8, 0, 1]], z=60),
        prop(X.burst(), [[t_pop - 0.01, BAG[0] + 120, BAG[1] - 40, .3, -6, 0], [t_pop, BAG[0] + 120, BAG[1] - 40, .35, -6, 1], [t_pop + 0.12, BAG[0] + 120, BAG[1] - 40, .55, -6, 1], [t_pop + 0.7, BAG[0] + 120, BAG[1] - 40, .55, -6, 1], [t_pop + 0.9, BAG[0] + 120, BAG[1] - 40, .55, -6, 0]], z=70)])

# 9 · Boltu: "it's my bag-thunder! Thunder without a flash!"
a9, b9 = b8, LN[8]["end"] + 0.3
UP = [0, -120, 6, -20, 0]                      # right arm up, showing the torn bag
shot(a9, b9, blur=1.2, cam={"from": cam(600, 1330, 1.15), "to": cam(610, 1335, 1.22)},
     chars={"mama": M, "bithi": T, "boltu": B}, mood={"mama": "worried", "bithi": "happy", "boltu": "happy"},
     turn={"mama": 0.6, "bithi": 0.5, "boltu": -0.5}, poses={"boltu": [[a9, *REST], [a9 + 0.5, *UP], [b9, *UP]]},
     props=steam(a9, b9) + rain(a9, b9, .6) + [
        prop(X.bag(False), [[a9, B[0] + 70, F - 330, .8, 0, 1], [a9 + 0.25, B[0] + 150, F - 450, .75, -5, 1], [a9 + 0.5, 975, 1272, .7, -10, 1], [b9, 975, 1272, .7, -10, 1]], z=60),
        scr(A.tag("চমক ছাড়াই গর্জন", 560, 50, "#7A4FB5"), pop(LN[8]["start"] + 2.6, 540, 300, 1))])
shots[-1]["_bagcheck"] = True

# 10 · puzzle cards
a10, b10 = b9, LN[9]["start"] + 2.9
w0 = LN[9]["start"]
shot(a10, b10, bg="paper", cam={"from": [0, 0, 1], "to": [0, 0, 1]},
     chars={"bithi": [540, 2030, .7]}, mood={"bithi": "happy"},
     props=[scr(A.board_title("ধাঁধা!"), pop(a10 + 0.05, 540, 200, 1), z=5),
            scr(X.card("air"), pop(w0 + 0.75, 200, 640, .95), z=6),
            scr(X.card("water"), pop(w0 + 1.4, 540, 640, .95), z=6),
            scr(X.card("iron"), pop(w0 + 2.0, 880, 640, .95), z=6),
            scr(A.tag("শব্দ কোনটায় সবচেয়ে দ্রুত?", 820, 48, "#1E5AA8"), pop(w0 + 2.5, 540, 960, 1), z=7)])
# 11 · Bithi asks for the answer in the comments
a11, b11 = b10, VEND
hx, hy = head("bithi", [540, F, .8])
shot(a11, b11, blur=3, cam={"from": cam(hx, hy, 1.9, 540, 900), "to": cam(hx, hy, 2.0, 540, 900)},
     chars={"bithi": [540, F, .8]}, mood={"bithi": "happy"},
     props=rain(a11, b11, .5) + [scr(A.tag("কমেন্টে লেখো!", 520, 54, "#D7263D"), pop(a11 + 0.3, 540, 300, 1), z=10)])
# 12 · end card
def wave(side, E0):
    k = []
    for i in range(10):
        t = E0 + i * 0.3; a = 128 + (10 if i % 2 else -10)
        k.append([t, a, 0, 30, 6, 0] if side == "L" else [t, 0, -a, -6, -30, 0])
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

for s in shots:                                    # drop helper keys the engine doesn't know
    for k in [k for k in s if k.startswith("_") or k == "lookat"]: del s[k]
    if s.get("turn") == {}: del s["turn"]

D = {"chars": {"mama": chars["Montu Mama"], "bithi": chars["Bithi"], "boltu": chars["Boltu"]}, "bg": X.stall_bg(),
     "lines": lines, "mouth": json.loads((P / "mouth.json").read_text()), "shots": shots, "dur": DUR}
html = (P / "engine.html").read_text().replace("__DATA__", json.dumps(D, ensure_ascii=False))
html = html.replace("</head>", "<style>" + (S / "p5/fonts.css").read_text() + "</style></head>", 1)
(P / "s4.html").write_text(html, encoding="utf-8")
print("shots", len(shots), "dur", DUR, "frames", int(DUR * 24))
for s in shots: print(round(s["start"], 2), round(s["end"], 2))
