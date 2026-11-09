"""Build Pilot 5 (why a pond looks shallower) as p5.html for the puppet engine, timed to the voice timeline."""
import json, sys
from pathlib import Path
import art

S = Path(sys.argv[1]); V = Path(sys.argv[2])          # scratchpad, voiceover/pilot-05
P = S / "p5"
chars = json.loads((S / "chars/chars3.json").read_text())
tl = json.loads((V / "timeline.json").read_text())
G_LINES = {0, 1, 6, 13, 16, 21}                        # lines that get a talking gesture
lines = [{"speaker": l["speaker"], "start": l["start"], "end": l["end"], **({"g": True} if l["i"] in G_LINES else {})} for l in tl["lines"]]
DUR = 144.5

def cam(wx, wy, s, sx=540, sy=900): return [round(sx - s * wx), round(sy - s * wy), s]
def pop(t0, x, y, s=1, rot=0, t1=None, fade=0.25):
    k = [[t0 - 0.01, x, y, s * 0.3, rot, 0], [t0, x, y, s * 0.3, rot, 1], [t0 + fade, x, y, s, rot, 1]]
    if t1: k += [[t1 - 0.2, x, y, s, rot, 1], [t1, x, y, s, rot, 0]]
    return k
def prop(svg, keys, layer="world", z=40): return {"svg": svg, "layer": layer, "z": z, "keys": keys}

F = 1820                                    # feet line on the ghat platform
M, B, T = [380, F, .8], [680, F, .8], [880, F, .8]
HEAD = {"mama": 845, "bithi": 850, "boltu": 700}
def head(c, pos): return pos[0], pos[1] - HEAD[c] * pos[2]

fish, ghost = art.fish(), art.fish(True)
shots = []
def shot(a, b, **kw): shots.append({"start": a, "end": b, **kw})

# A · wide: the ghat on a hot afternoon, Mama complains about the heat
shot(0, 6.3, blur=0.5, cam={"from": cam(540, 1250, 1.0, 540, 960), "to": cam(560, 1300, 1.1, 540, 960)},
     chars={"mama": M, "boltu": B, "bithi": T}, mood={"mama": "happy", "boltu": "happy", "bithi": "neutral"})
# B · Boltu at the step: "it's only knee-deep!"
hx, hy = head("boltu", B)
shot(6.3, 12.2, blur=2, cam={"from": cam(hx, hy, 1.9, 540, 760), "to": cam(hx - 20, hy, 2.05, 540, 760)},
     chars={"boltu": B, "mama": M}, mood={"boltu": "happy"})
# C · Mama holds Boltu back and spots the fish
shot(12.2, 17.6, blur=1.5, cam={"from": cam(530, 1250, 1.45), "to": cam(520, 1230, 1.55)},
     chars={"mama": M, "boltu": B}, mood={"mama": "happy", "boltu": "neutral"},
     poses={"mama": [[12.2, 0, 0, -6, 6, 0], [12.7, 0, -62, -6, 30, 0], [14.4, 0, -62, -6, 30, 0], [14.9, 0, -38, -6, 50, -4], [17.6, 0, -38, -6, 50, -4]]},
     props=[prop(fish, [[12.2, 560, 1300, .8, 0, 1], [17.6, 640, 1310, .8, 0, 1]], z=5)])
# D · close-up of the water: the hand plunges where the fish seems to be... and misses
shot(17.6, 19.7, blur=0, cam={"from": cam(600, 1300, 2.6, 540, 960), "to": cam(600, 1300, 2.7, 540, 960)}, chars={},
     props=[prop(fish, [[17.6, 600, 1300, .9, 0, 1], [18.0, 600, 1300, .9, 0, 1], [18.5, 520, 1340, .9, 8, 1], [19.7, 470, 1350, .9, 8, 1]], z=5),
            prop(art.hand_reach(), [[17.6, 610, 980, .8, 0, 1], [18.0, 610, 1150, .8, 0, 1], [18.6, 610, 1150, .8, 0, 1], [19.2, 610, 1000, .8, 0, 1]], z=20),
            prop(art.splash(), [[17.95, 610, 1255, .2, 0, 0], [18.0, 610, 1255, .3, 0, 1], [18.3, 610, 1255, 1.0, 0, 1], [18.9, 610, 1255, 1.1, 0, 0]], z=30)])
# Mama, dripping and confused: "চোখের সামনে মাছ, হাত দিলে খালি পানি!"
hx, hy = head("mama", M)
shot(19.7, 22.6, blur=2.5, cam={"from": cam(hx, hy, 2.1, 540, 760), "to": cam(hx, hy, 2.25, 540, 760)},
     chars={"mama": M}, mood={"mama": "worried"},
     poses={"mama": [[19.7, 0, -20, -6, 40, 0], [22.6, 0, -24, -6, 44, 0]]})
# E · the gamchha net sweeps over the fish, again and again
shot(22.6, 26.0, blur=0, cam={"from": cam(600, 1300, 2.3, 540, 960), "to": cam(590, 1300, 2.4, 540, 960)}, chars={},
     props=[prop(fish, [[22.6, 520, 1320, .9, 0, 1], [24.0, 700, 1330, .9, 0, 1], [26.0, 560, 1320, .9, 180, 1]], z=5),
            prop(art.gamchha(), [[22.6, 380, 1200, .8, -10, 1], [23.4, 600, 1240, .8, 0, 1], [24.2, 820, 1200, .8, 10, 1], [25.0, 600, 1240, .8, 0, 1], [26.0, 380, 1200, .8, -10, 1]], z=20),
            prop(art.splash(), [[23.35, 600, 1260, .3, 0, 0], [23.4, 600, 1260, .4, 0, 1], [23.8, 600, 1260, 1, 0, 0]], z=30),
            prop(art.splash(), [[24.95, 600, 1260, .3, 0, 0], [25.0, 600, 1260, .4, 0, 1], [25.4, 600, 1260, 1, 0, 0]], z=30)])
# Boltu: "মাছ কি টেলিপোর্ট করতাছে?"
shot(26.0, 30.2, blur=1.5, cam={"from": cam(540, 1250, 1.5), "to": cam(560, 1250, 1.6)},
     chars={"mama": M, "boltu": B}, mood={"mama": "worried", "boltu": "happy"},
     props=[prop(art.gamchha(), [[26.0, 470, 1420, .55, 15, 1], [30.2, 470, 1420, .55, 15, 1]], z=50)])
# F · Bithi steps in with a cup and a coin
cup = art.cup_world()
shot(30.2, 46.6, blur=1.2, cam={"from": cam(640, 1250, 1.3), "to": cam(760, 1270, 1.5)},
     chars={"mama": M, "boltu": B, "bithi": T}, mood={"mama": "worried", "bithi": "happy", "boltu": "neutral"},
     props=[prop(cup, pop(36.3, 790, 1800, 1.1), z=60)])
# G · notebook board: the cup experiment and the rule of refraction
bp = dict(layer="screen")
shot(46.6, 66.4, bg="paper", cam={"from": [0, 0, 1], "to": [0, 0, 1]},
     chars={"bithi": [150, 1900, .42]}, poses={"bithi": [[46.6, 0, -60, -6, 20, 0], [66.4, 0, -60, -6, 20, 0]]},
     props=[prop(art.board_cup_empty(), pop(46.7, 540, 760, 1), **bp, z=5),
            prop(art.board_cup_water(), pop(47.2, 540, 760, 1), **bp, z=6),
            prop(art.board_title("আলোর প্রতিসরণ"), pop(56.4, 540, 210, 1), **bp, z=7),
            prop(art.board_apparent(), pop(61.9, 540, 760, 1), **bp, z=8),
            prop(art.board_rule([("বাতাস → পানি: লম্বের দিকে বাঁকে", "#1E5AA8"), ("পানি → বাতাস: লম্ব থেকে দূরে সরে", "#D7263D"), ("পানির প্রতিসরণাঙ্ক ১.৩৩", "#1A1A1A")]), pop(63.0, 600, 1500, .92), **bp, z=9)])
# H · the "broken" stick
shot(66.4, 70.9, blur=6, cam={"from": cam(560, 1300, 1.4), "to": cam(560, 1300, 1.45)}, chars={},
     props=[prop(art.stick(True), [[66.4, 540, 960, 1.1, 0, 1], [70.6, 540, 960, 1.1, 0, 1], [70.9, 540, 960, 1.1, 0, 0]], layer="screen", z=5)])
shot(70.9, 73.6, blur=6, cam={"from": cam(560, 1300, 1.4), "to": cam(560, 1300, 1.45)}, chars={},
     props=[prop(art.stick(False), [[70.9, 540, 960, 1.1, 0, 0], [71.2, 540, 960, 1.1, 0, 1], [73.6, 540, 960, 1.1, 0, 1]], layer="screen", z=5)])
# I · board: real depth vs apparent depth
shot(73.6, 85.4, bg="paper", cam={"from": [0, 0, 1], "to": [0, 0, 1]},
     chars={"bithi": [150, 1900, .42]}, poses={"bithi": [[73.6, 0, -60, -6, 20, 0], [85.4, 0, -60, -6, 20, 0]]},
     props=[prop(art.board_depth(), pop(73.8, 540, 820, 1), **bp, z=5),
            prop(art.fish(), pop(76.9, 640, 1050, .9), **bp, z=6),
            prop(art.fish(True), pop(78.0, 640, 930, .9), **bp, z=7)])
hx, hy = head("boltu", B)
shot(85.4, 89.4, blur=2, cam={"from": cam(hx, hy, 1.9, 540, 760), "to": cam(hx, hy, 2.0, 540, 760)},
     chars={"boltu": B, "bithi": T}, mood={"boltu": "worried"})
hx, hy = head("bithi", T)
shot(89.4, 94.0, blur=2.5, cam={"from": cam(hx, hy, 2.0, 540, 760), "to": cam(hx - 10, hy, 2.1, 540, 760)},
     chars={"bithi": T, "boltu": B}, mood={"bithi": "neutral"})
# J · Mama's plan, the grab... and the chappal
hx, hy = head("mama", M)
shot(94.0, 99.8, blur=2, cam={"from": cam(hx + 60, hy + 80, 1.8, 540, 820), "to": cam(hx + 60, hy + 80, 1.9, 540, 820)},
     chars={"mama": M, "boltu": B}, mood={"mama": "happy"})
shot(99.8, 101.5, blur=0, cam={"from": cam(600, 1320, 2.6, 540, 960), "to": cam(600, 1320, 2.7, 540, 960)}, chars={},
     props=[prop(fish, [[99.8, 560, 1300, .9, 0, 1], [101.5, 470, 1300, .9, 0, 1]], z=5),
            prop(art.hand_reach(), [[99.8, 600, 1000, .8, 0, 1], [100.4, 600, 1215, .8, 0, 1], [101.0, 600, 1215, .8, 0, 1], [101.5, 600, 1040, .8, 0, 1]], z=20),
            prop(art.splash(), [[100.35, 600, 1300, .3, 0, 0], [100.4, 600, 1300, .4, 0, 1], [100.8, 600, 1300, 1.1, 0, 0]], z=30)])
sx, sy = 380 + 122 * .8, F - 704 * .8                      # Mama's right shoulder in world space
hand = (sx + 250 * 0.5, sy - 250 * 0.866)                    # raised hand position for upper arm -150
chap = art.chappal()
shot(101.5, 110.5, blur=1.5, cam={"from": cam(560, 1180, 1.55), "to": cam(580, 1190, 1.65)},
     chars={"mama": M, "boltu": B}, mood={"mama": "happy", "boltu": "happy"},
     poses={"mama": [[101.5, 0, -20, -6, 20, 0], [101.9, 0, -150, -6, 0, 6], [104.4, 0, -150, -6, 0, 6], [105.0, 0, -40, -6, 60, 0], [110.5, 0, -40, -6, 60, 0]]},
     props=[prop(chap, [[101.5, sx, sy + 200, .55, 0, 1], [101.9, hand[0], hand[1] - 40, .55, -15, 1], [104.4, hand[0], hand[1] - 40, .55, -15, 1], [105.0, 520, 1420, .55, 30, 1], [110.5, 520, 1420, .55, 30, 1]], z=50),
            prop(art.mud_blob(), [[103.75, hand[0], hand[1] - 40, .3, 0, 0], [103.8, hand[0], hand[1] - 40, .3, 0, 1], [104.1, 380, 1172, .55, 0, 1], [110.5, 380, 1172, .55, 0, 1]], z=60)])
# K · safety message to camera, then Mama with his chappal
hx, hy = head("bithi", [540, F, .8])
shot(110.5, 125.0, blur=3, cam={"from": cam(hx, hy, 1.9, 540, 900), "to": cam(hx, hy, 2.05, 540, 900)},
     chars={"bithi": [540, F, .8]}, mood={"bithi": "neutral"},
     props=[prop(art.tag("⚠ চোখে দেখে গভীরতা আন্দাজ নয়", 900), pop(111.4, 540, 300, 1), layer="screen", z=10),
            prop(art.tag("সাঁতার না জানলে একা নামবে না", 860, 44, "#1E5AA8"), pop(119.8, 540, 1640, 1), layer="screen", z=10)])
hx, hy = head("mama", M)
shot(125.0, 129.8, blur=2.5, cam={"from": cam(hx, hy, 2.0, 540, 760), "to": cam(hx, hy, 2.1, 540, 760)},
     chars={"mama": M}, mood={"mama": "happy"},
     poses={"mama": [[125.0, 0, -40, -6, 70, 0], [129.8, 0, -40, -6, 70, 0]]},
     props=[prop(chap, [[125.0, 470, 1330, .5, 20, 1], [129.8, 470, 1330, .5, 20, 1]], z=50),
            prop(art.mud_blob(), [[125.0, 380, 1172, .55, 0, 1], [129.8, 380, 1172, .55, 0, 1]], z=60)])
# L · the comment puzzle, Bithi with a glass and a "bent" spoon
hx, hy = head("bithi", [540, F, .8])
shot(129.8, 140.2, blur=3, cam={"from": cam(hx + 60, hy + 120, 1.6, 540, 820), "to": cam(hx + 60, hy + 120, 1.75, 540, 820)},
     chars={"bithi": [540, F, .8]}, mood={"bithi": "happy"},
     props=[prop(art.glass_spoon(), pop(130.0, 690, 1420, .75), z=60)])
# M · end card: banner, wheel, the three friends and their names
waveL = [[140.2 + i * 0.35, 0, 0, 0, 0, 0] for i in range(1)]
def wave(side):  # side 'L' raises the left arm, 'R' the right arm
    k = []
    for i in range(14):
        t = 140.2 + i * 0.3; a = 128 + (10 if i % 2 else -10)
        k.append([t, a, 0, 30, 6, 0] if side == "L" else [t, 0, -a, -6, -30, 0])
    return k
shot(140.2, DUR + 1, bg="paper", cam={"from": [0, 0, 1], "to": [0, 0, 1]},
     chars={"mama": [250, 1650, .42], "bithi": [540, 1650, .42], "boltu": [830, 1650, .46]}, mood={"mama": "happy", "bithi": "happy", "boltu": "happy"},
     poses={"mama": wave("L"), "bithi": wave("R"), "boltu": wave("R")},
     props=[prop(art.banner(), pop(140.25, 540, 430, 1), layer="screen", z=5),
            prop(art.wheel(), [[140.2, 540, 820, .3, 0, 0], [140.3, 540, 820, 1, 30, 1], [DUR + 1, 540, 820, 1, 30 + 120 * (DUR + 1 - 140.3), 1]], layer="screen", z=5),
            prop(art.tag("মন্টু মামা", 300, 44, "#FFC300", "#1A1A1A"), pop(140.6, 250, 1128, 1), layer="screen", z=6),
            prop(art.tag("বিথী", 200, 44, "#FFFFFF", "#1A1A1A"), pop(140.8, 540, 1128, 1), layer="screen", z=6),
            prop(art.tag("বল্টু", 200, 44, "#F72585", "#1A1A1A"), pop(141.0, 830, 1128, 1), layer="screen", z=6)])

D = {"chars": {"mama": chars["Montu Mama"], "bithi": chars["Bithi"], "boltu": chars["Boltu"]}, "bg": art.pond_bg(),
     "lines": lines, "mouth": json.loads((P / "mouth.json").read_text()), "shots": shots, "dur": DUR}
html = (P / "engine.html").read_text().replace("__DATA__", json.dumps(D, ensure_ascii=False))
html = html.replace("</head>", "<style>" + (P / "fonts.css").read_text() + "</style></head>", 1)
(P / "p5.html").write_text(html, encoding="utf-8")
print("shots", len(shots), "frames", int(DUR * 24))
