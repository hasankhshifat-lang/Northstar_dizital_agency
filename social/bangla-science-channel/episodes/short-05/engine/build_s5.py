"""Build Short 5 (pukur-gobhir: why a pond looks shallower) as s5.html for the puppet engine, timed to the voice
timeline and to storyboard.md. Usage: python3 build_s5.py <kit dir> <voiceover/short-05 dir>"""
import json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import art5 as X
A = X.A

S = Path(sys.argv[1]); V = Path(sys.argv[2])
P = S / "s5"
chars = json.loads((S / "chars/chars3.json").read_text())
tl = json.loads((V / "timeline.json").read_text())
G_LINES = {3, 4, 6}                               # arguing / explaining lines get a talking gesture
lines = [{"speaker": l["speaker"], "start": l["start"], "end": l["end"], **({"g": True} if l["i"] in G_LINES else {})} for l in tl["lines"]]
LN = {l["i"]: l for l in tl["lines"]}
VEND = tl["duration"]; DUR = round(VEND + 2.66, 2)

def cam(wx, wy, s, sx=540, sy=900):
    wx = min(max(wx, sx / s), 1080 - (1080 - sx) / s); wy = min(max(wy, sy / s), 1920 - (1920 - sy) / s)
    return [round(sx - s * wx), round(sy - s * wy), s]
def pop(t0, x, y, s=1, rot=0, t1=None, fade=0.25):
    k = [[t0 - 0.01, x, y, s * 0.3, rot, 0], [t0, x, y, s * 0.3, rot, 1], [t0 + fade, x, y, s, rot, 1]]
    if t1: k += [[t1 - 0.2, x, y, s, rot, 1], [t1, x, y, s, rot, 0]]
    return k
def fade_in(t0, x, y, s=1, t1=None):
    k = [[t0 - 0.01, x, y, s, 0, 0], [t0 + 0.2, x, y, s, 0, 1]]
    if t1: k += [[t1 - 0.15, x, y, s, 0, 1], [t1, x, y, s, 0, 0]]
    return k
def prop(svg, keys, layer="world", z=40): return {"svg": svg, "layer": layer, "z": z, "keys": keys}
def scr(svg, keys, z=50): return prop(svg, keys, "screen", z)

F = 1820
M, B, T = [380, F, .8], [680, F, .8], [880, F, .8]      # same blocking as Pilot 5 (the chappal hold was checked there)
HEAD = {"mama": 845, "bithi": 850, "boltu": 700}
def head(c, pos): return pos[0], pos[1] - HEAD[c] * pos[2]
REST = [0, 0, -6, 6, 0]
fish, ghost = A.fish(), A.fish(True)
shots = []
def shot(a, b, **kw): shots.append({"start": a, "end": b, **kw})
def swim(a, b, x0, x1, y=1300, s=.8):            # background fish keeps swimming slowly in the pond
    return prop(fish, [[a, x0, y, s, 0, 1], [b, x1, y + 6, s, 0, 1]], z=5)

# 1a · HOOK: close-up of the clear water, Mama's hand plunges where the fish seems to be... splash, empty hand
shot(0, 1.55, blur=0, cam={"from": cam(600, 1300, 2.6, 540, 960), "to": cam(600, 1300, 2.7, 540, 960)}, chars={},
     props=[prop(fish, [[0, 600, 1300, .9, 0, 1], [0.35, 600, 1300, .9, 0, 1], [0.8, 500, 1345, .9, 8, 1], [1.55, 440, 1355, .9, 8, 1]], z=5),
            prop(A.hand_reach(), [[0, 610, 960, .8, 0, 1], [0.32, 610, 1140, .8, 0, 1], [0.8, 610, 1140, .8, 0, 1], [1.3, 610, 980, .8, 0, 1], [1.55, 610, 980, .8, 0, 1]], z=20),
            prop(A.splash(), [[0.3, 610, 1255, .2, 0, 0], [0.33, 610, 1255, .3, 0, 1], [0.6, 610, 1255, 1.0, 0, 1], [1.1, 610, 1255, 1.1, 0, 0]], z=30)])
# 1b · Mama, dripping, stares at his empty hand: "আরে! চোখের সামনে মাছ, হাত দিলে খালি পানি!"
a, b = 1.55, LN[0]["end"] + 0.18
hx, hy = head("mama", M)
shot(a, b, blur=2.5, cam={"from": cam(hx + 30, hy + 60, 2.0, 540, 760), "to": cam(hx + 30, hy + 60, 2.15, 540, 760)},
     chars={"mama": M}, mood={"mama": "worried"}, turn={"mama": 0.4},
     poses={"mama": [[a, 0, -20, -6, 40, 0], [a + 0.5, 0, -35, -6, -95, 4], [b, 0, -35, -6, -95, 4]]},
     props=[prop(X.drops(), [[a, hx + 10, hy - 40, .9, 0, 1], [a + 0.9, hx + 10, hy + 40, .9, 0, 0]], z=60)])
# 2 · Boltu at the edge of the ghat: "it's knee-deep, I can see the bottom, I'll jump!" -> dive pose on "লাফ দিমু"
a2, b2 = b, LN[1]["end"] + 0.2
t_jump = LN[1]["start"] + 3.9
DIVE = [150, -150, 10, -10, 0]
shot(a2, b2, blur=1.2, cam={"from": cam(640, 1340, 1.3), "to": cam(660, 1345, 1.4)},
     chars={"mama": M, "boltu": B, "bithi": T}, mood={"mama": "worried", "boltu": "happy", "bithi": "neutral"},
     turn={"boltu": -0.5},
     poses={"boltu": [[a2, *REST], [t_jump - 0.25, *REST], [t_jump - 0.1, 20, -20, -10, 10, 0], [t_jump + 0.35, *DIVE], [b2, *DIVE]],
            "mama": [[a2, 0, -35, -6, -95, 4], [a2 + 0.6, *REST], [b2, *REST]]},
     lean={"boltu": [[a2, 0], [t_jump - 0.1, 0], [t_jump + 0.35, -7], [b2, -7]]},
     props=[swim(a2, b2, 560, 500, 1400)])
# 3 · Bithi stops him: "থামো বল্টু! পুকুর যতটা গভীর দেখায়, আসলে তার চেয়ে বেশি গভীর!"
a3, b3 = b2, LN[2]["end"] + 0.18
STOP = [58, 0, -60, 6, 0]                         # Bithi's arm out toward Boltu, open palm
shot(a3, b3, blur=1.5, cam={"from": cam(780, 1330, 1.5), "to": cam(785, 1335, 1.6)},
     chars={"boltu": B, "bithi": T, "mama": M}, mood={"boltu": "worried", "bithi": "worried"},
     turn={"boltu": 0.6, "bithi": -0.6},
     poses={"boltu": [[a3, *DIVE], [a3 + 0.35, *DIVE], [a3 + 0.75, *REST], [b3, *REST]],
            "bithi": [[a3, *REST], [a3 + 0.3, *STOP], [LN[2]["start"] + 2.2, *STOP], [LN[2]["start"] + 2.7, *REST], [b3, *REST]]},
     lean={"boltu": [[a3, -7], [a3 + 0.6, 0], [b3, 0]]},
     props=[swim(a3, b3, 500, 470, 1400)])
# 4 · Mama, confident and wrong: "চোখ কি মিথ্যা কয়? মাছটা তো এক বিঘত নিচে!" (the fish is visible right behind him)
a4, b4 = b3, LN[3]["end"] + 0.15
shot(a4, b4, blur=1.0, cam={"from": cam(470, 1300, 1.55), "to": cam(470, 1300, 1.65)},
     chars={"mama": M, "boltu": B, "bithi": T}, mood={"mama": "happy", "bithi": "neutral", "boltu": "neutral"},
     props=[swim(a4, b4, 560, 500, 1400)])
# 5 · BOARD: fish -> surface -> eye; the ray bends away from the normal (প্রতিসরণ); the fish is seen higher
a5, b5 = b4, LN[5]["start"] + 2.45
s4 = LN[4]["start"]; s5 = LN[5]["start"]
t_rw, t_ra, t_n, t_away, t_name = s4 + 2.7, s4 + 3.4, s4 + 4.8, s4 + 5.6, s4 + 7.1
t_up = s5 + 0.9
BX, BY = 540, 860
bp = [scr(X.board_water(), pop(a5 + 0.1, BX, BY, 1), z=5),
      scr(X.ray_water(), fade_in(t_rw, BX, BY), z=8),
      scr(X.ray_air(), fade_in(t_ra, BX, BY), z=8),
      scr(X.normal(), fade_in(t_n, BX, BY), z=7),
      scr(A.tag("পানি থেকে বাতাসে: লম্ব থেকে দূরে বাঁকে", 900, 44, "#D7263D"), pop(t_away, 560, 1390, 1), z=20),
      scr(A.board_title("আলোর প্রতিসরণ"), pop(t_name, 540, 170, 1), z=20),
      scr(X.apparent(), fade_in(t_up, BX, BY), z=9),
      scr(A.tag("মাছ উপরে দেখায়!", 520, 44, "#7A4FB5"), pop(t_up + 0.3, 600, 1500, 1), z=20)]
shot(a5, b5, bg="paper", cam={"from": [0, 0, 1], "to": [0, 0, 1]},
     chars={"bithi": [130, 1960, .42]}, poses={"bithi": [[a5, 0, -60, -6, 20, 0], [b5, 0, -60, -6, 20, 0]]}, props=bp)
# 6 · BOARD: real depth 4 ft vs seen about 3 ft
a6, b6 = b5, LN[5]["end"] + 0.18
shot(a6, b6, bg="paper", cam={"from": [0, 0, 1], "to": [0, 0, 1]},
     chars={"bithi": [130, 1960, .42]}, poses={"bithi": [[a6, 0, -60, -6, 20, 0], [b6, 0, -60, -6, 20, 0]]},
     props=[scr(A.board_depth(), pop(a6 + 0.05, 540, 820, 1), z=5),
            scr(A.fish(), pop(a6 + 0.3, 640, 1050, .9), z=6),
            scr(A.fish(True), pop(s5 + 4.4, 640, 930, .9), z=7)])
# 7 · Mama gets an idea: "বুঝছি! মাছ যেখানে দেখি, হাত দিমু তার একটু নিচে!"
a7, b7 = b6, LN[6]["end"] + 0.1
hx, hy = head("mama", M)
shot(a7, b7, blur=2, cam={"from": cam(hx + 60, hy + 80, 1.8, 540, 820), "to": cam(hx + 60, hy + 80, 1.9, 540, 820)},
     chars={"mama": M, "boltu": B}, mood={"mama": "happy", "boltu": "neutral"}, turn={"boltu": -0.6})
# 8 · close-up: this time the hand goes deeper than the fish looks... grab!
a8, b8 = b7, LN[7]["start"] - 0.15
shot(a8, b8, blur=0, cam={"from": cam(600, 1320, 2.6, 540, 960), "to": cam(600, 1320, 2.7, 540, 960)}, chars={},
     props=[prop(fish, [[a8, 560, 1300, .9, 0, 1], [a8 + 0.5, 560, 1300, .9, 0, 1], [b8, 470, 1305, .9, 0, 1]], z=5),
            prop(A.hand_reach(), [[a8, 600, 1000, .8, 0, 1], [a8 + 0.45, 600, 1215, .8, 0, 1], [a8 + 1.0, 600, 1215, .8, 0, 1], [b8, 600, 1060, .8, 0, 1]], z=20),
            prop(A.splash(), [[a8 + 0.4, 600, 1300, .3, 0, 0], [a8 + 0.45, 600, 1300, .4, 0, 1], [a8 + 0.9, 600, 1300, 1.1, 0, 0]], z=30)])
# 9 · Mama raises his catch: "ধইরা ফেলছি! বিরাট মাছ!" ... it's a muddy chappal; mud flies onto his nose
a9, b9 = b8, LN[7]["end"] + 0.4
sx, sy = M[0] + 122 * .8, F - 704 * .8                    # Mama's right shoulder (Pilot 5)
hand = (sx + 250 * 0.5, sy - 250 * 0.866)                  # raised hand for upper arm -150
chap = A.chappal()
t_mud = LN[7]["end"] - 0.1
shot(a9, b9, blur=1.5, cam={"from": cam(560, 1180, 1.55), "to": cam(570, 1185, 1.6)},
     chars={"mama": M, "boltu": B}, mood={"mama": "happy", "boltu": "neutral"}, turn={"boltu": -0.6},
     poses={"mama": [[a9, 0, -20, -6, 20, 0], [a9 + 0.4, 0, -150, -6, 0, 6], [b9, 0, -150, -6, 0, 6]]},
     props=[prop(chap, [[a9, sx, sy + 200, .55, 0, 1], [a9 + 0.4, hand[0], hand[1] - 40, .55, -15, 1], [b9, hand[0], hand[1] - 40, .55, -15, 1]], z=50),
            prop(A.mud_blob(), [[t_mud - 0.05, hand[0], hand[1] - 40, .3, 0, 0], [t_mud, hand[0], hand[1] - 40, .3, 0, 1], [t_mud + 0.3, 380, 1172, .55, 0, 1], [b9, 380, 1172, .55, 0, 1]], z=60)])
# 10 · Boltu laughs: "চপ্পল মাছ! ভাজি করবা না ঝোল?"; Mama looks at the chappal, Bithi smiles
a10, b10 = b9, LN[8]["end"] + 0.25
shot(a10, b10, blur=1.0, cam={"from": cam(620, 1330, 1.3), "to": cam(630, 1335, 1.36)},
     chars={"mama": M, "boltu": B, "bithi": T}, mood={"mama": "worried", "boltu": "happy", "bithi": "happy"},
     poses={"mama": [[a10, 0, -150, -6, 0, 6], [a10 + 0.6, 0, -40, -6, 60, 0], [b10, 0, -40, -6, 60, 0]]},
     props=[prop(chap, [[a10, hand[0], hand[1] - 40, .55, -15, 1], [a10 + 0.6, 520, 1420, .55, 30, 1], [b10, 520, 1420, .55, 30, 1]], z=50),
            prop(A.mud_blob(), [[a10, 380, 1172, .55, 0, 1], [b10, 380, 1172, .55, 0, 1]], z=60)])
# 11 · Bithi, serious, to Boltu (who wanted to jump): never judge depth by eye
a11, b11 = b10, LN[9]["end"] + 0.25
shot(a11, b11, blur=1.5, cam={"from": cam(780, 1330, 1.5), "to": cam(785, 1335, 1.58)},
     chars={"boltu": B, "bithi": T, "mama": M}, mood={"boltu": "worried", "bithi": "worried"}, turn={"boltu": 0.6, "bithi": -0.6},
     props=[scr(A.tag("⚠ চোখে দেখে গভীরতা আন্দাজ নয়", 900), pop(LN[9]["start"] + 0.4, 540, 300, 1), z=60)])
# 12 · puzzle board: light going from air into water, toward the normal or away? comment!
a12, b12 = b11, VEND
s10 = LN[10]["start"]
shot(a12, b12, bg="paper", cam={"from": [0, 0, 1], "to": [0, 0, 1]},
     chars={"bithi": [150, 1960, .42]}, mood={"bithi": "happy"}, poses={"bithi": [[a12, 0, -60, -6, 20, 0], [b12, 0, -60, -6, 20, 0]]},
     props=[scr(A.board_title("ধাঁধা!"), pop(a12 + 0.05, 540, 170, 1), z=5),
            scr(X.puzzle_board(), pop(a12 + 0.1, 540, 820, 1), z=6),
            scr(X.puzzle_ray(), fade_in(s10 + 0.5, 540, 820), z=8),
            scr(X.puzzle_opt(True), fade_in(s10 + 1.3, 540, 820), z=9),
            scr(X.puzzle_opt(False), fade_in(s10 + 2.8, 540, 820), z=9),
            scr(A.tag("ক) লম্বের দিকে বাঁকে?", 640, 46, "#1E5AA8"), pop(s10 + 1.4, 600, 1330, 1), z=10),
            scr(A.tag("খ) লম্ব থেকে দূরে সরে?", 640, 46, "#D7263D"), pop(s10 + 2.9, 600, 1440, 1), z=10),
            scr(A.tag("কমেন্টে লেখো!", 520, 54, "#7A4FB5"), pop(s10 + 3.8, 600, 1560, 1), z=10)])
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

D = {"chars": {"mama": chars["Montu Mama"], "bithi": chars["Bithi"], "boltu": chars["Boltu"]}, "bg": A.pond_bg(),
     "lines": lines, "mouth": json.loads((P / "mouth.json").read_text()), "shots": shots, "dur": DUR}
html = (P / "engine.html").read_text().replace("__DATA__", json.dumps(D, ensure_ascii=False))
html = html.replace("</head>", "<style>" + (S / "p5/fonts.css").read_text() + "</style></head>", 1)
(P / "s5.html").write_text(html, encoding="utf-8")
print("shots", len(shots), "dur", DUR, "frames", int(DUR * 24))
for s in shots: print(round(s["start"], 2), round(s["end"], 2))
