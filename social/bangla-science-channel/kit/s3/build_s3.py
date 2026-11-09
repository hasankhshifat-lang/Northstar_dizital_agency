"""Build Short 3 (lojjaboti / Mimosa: why the leaves fold) as s3.html for the puppet engine, timed to the voice timeline."""
import json, math, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import art3, art3 as X
A = X.A

S = Path(sys.argv[1]); V = Path(sys.argv[2])          # scratchpad, voiceover/short-03
P = S / "s3"
chars = json.loads((S / "chars/chars3.json").read_text())
tl = json.loads((V / "timeline.json").read_text())
G_LINES = {3, 4, 6, 9}                                 # Bithi's explanation lines and the puzzle get a talking gesture
lines = [{"speaker": l["speaker"], "start": l["start"], "end": l["end"],
          **({"also": l["also"]} if l.get("also") else {}), **({"g": True} if l["i"] in G_LINES else {})} for l in tl["lines"]]
DUR = 59.5

def cam(wx, wy, s, sx=540, sy=900):
    """Camera that never shows past the 1080x1920 background."""
    wx = min(max(wx, sx / s), 1080 - (1080 - sx) / s); wy = min(max(wy, sy / s), 1920 - (1920 - sy) / s)
    return [round(sx - s * wx), round(sy - s * wy), s]
def pop(t0, x, y, s=1, rot=0, t1=None, fade=0.25):
    k = [[t0 - 0.01, x, y, s * 0.3, rot, 0], [t0, x, y, s * 0.3, rot, 1], [t0 + fade, x, y, s, rot, 1]]
    if t1: k += [[t1 - 0.2, x, y, s, rot, 1], [t1, x, y, s, rot, 0]]
    return k
def prop(svg, keys, layer="world", z=40): return {"svg": svg, "layer": layer, "z": z, "keys": keys}

F = 1820
M, T, B = [280, F, .8], [520, F, .8], [730, F, .8]
HEAD = {"mama": 845, "bithi": 850, "boltu": 700}
def head(c, pos): return pos[0], pos[1] - HEAD[c] * pos[2]

STAGES = [0, .35, .7, 1]
PL = [X.plant(f) for f in STAGES]
PX, PY, PS = 930, 1690, 1.0                            # lojjaboti in the grass patch
def plant_props(ta, tb, fold=None, x=PX, y=PY, s=PS, z=5, start_f=0):
    """Plant across a shot. fold=(t0,t1) crossfades open->folded; otherwise it shows stage start_f."""
    out = []
    for i, svg_ in enumerate(PL):
        if fold is None:
            op = 1 if STAGES[i] == start_f else 0
            out.append(prop(svg_, [[ta, x, y, s, 0, op], [tb, x, y, s, 0, op]], z=z)); continue
        t0, t1 = fold; n = len(STAGES) - 1
        ti = t0 + (t1 - t0) * i / n; d = (t1 - t0) / n
        k = [[ta, x, y, s, 0, 1 if i == 0 else 0]]
        if i > 0: k += [[ti - d, x, y, s, 0, 0], [ti, x, y, s, 0, 1]]
        if i < n: k += [[ti, x, y, s, 0, 1], [ti + d, x, y, s, 0, 0]]
        k += [[tb, x, y, s, 0, 1 if i == n else 0]]
        out.append(prop(svg_, sorted(k, key=lambda r: r[0]), z=z + i))
    return out

shots = []
def shot(a, b, **kw): shots.append({"start": a, "end": b, **kw})
REST = [0, 0, -6, 6, 0]

# 1 · Boltu pokes the plant, the leaves fold, he panics
shot(0, 4.03, blur=1.2, cam={"from": cam(800, 1480, 1.35), "to": cam(810, 1490, 1.45)},
     chars={"boltu": B}, mood={"boltu": "worried"},
     poses={"boltu": [[0, *REST], [0.35, 0, -75, -6, -10, 0], [0.75, 0, -75, -6, -10, 0], [1.05, 0, -20, -6, 40, -3], [4.03, 0, -20, -6, 40, -3]]},
     props=plant_props(0, 4.03, fold=(0.7, 1.4)))
# 2 · Mama laughs: "it's shy of you, you haven't bathed in three days!"
shot(4.03, 10.3, blur=1.0, cam={"from": cam(560, 1350, 1.05), "to": cam(560, 1360, 1.12)},
     chars={"mama": M, "boltu": B}, mood={"mama": "happy", "boltu": "worried"},
     props=plant_props(4.03, 10.3, start_f=1))
# 3 · Boltu sniffs his armpit: "ছিঃ... সত্যিই তো!"
hx, hy = head("boltu", B)
shot(10.3, 13.0, blur=2, cam={"from": cam(hx, hy, 1.9, 540, 760), "to": cam(hx + 10, hy, 2.0, 540, 760)},
     chars={"boltu": B}, mood={"boltu": "worried"},
     poses={"boltu": [[10.3, *REST], [10.6, 125, 0, 40, 6, -8], [13.0, 125, 0, 40, 6, -8]]},
     props=plant_props(10.3, 13.0, start_f=1))
# 4 · Bithi: plants have no shame; a stimulus makes them move (চলন)
shot(13.0, 20.0, blur=1.2, cam={"from": cam(600, 1350, 1.05), "to": cam(620, 1360, 1.12)},
     chars={"mama": M, "bithi": T, "boltu": B}, mood={"mama": "happy", "bithi": "neutral", "boltu": "neutral"},
     props=plant_props(13.0, 20.0, start_f=1) +
           [prop(A.tag("উদ্দীপক → চলন", 520, 50, "#1E5AA8"), pop(17.8, 540, 300, 1), layer="screen", z=50)])
# 5 · notebook board: the leaf hinge (পালভিনাস) loses water when touched
bp = dict(layer="screen")
hp0, hp1 = X.hinge_panel(False), X.hinge_panel(True)
shot(20.0, 29.9, bg="paper", cam={"from": [0, 0, 1], "to": [0, 0, 1]},
     chars={"bithi": [150, 1900, .42]}, poses={"bithi": [[20.0, 0, -60, -6, 20, 0], [29.9, 0, -60, -6, 20, 0]]},
     props=[prop(A.board_title("পাতার গোড়ার কব্জা"), pop(20.2, 540, 210, 1), **bp, z=5),
            prop(hp0, pop(20.3, 540, 780, 1.5) + [[23.9, 540, 780, 1.5, 0, 1], [24.2, 540, 780, 1.5, 0, 0], [27.6, 540, 780, 1.5, 0, 0], [27.9, 540, 780, 1.5, 0, 1]], **bp, z=6),
            prop(hp1, [[23.9, 540, 780, 1.5, 0, 0], [24.2, 540, 780, 1.5, 0, 1], [27.6, 540, 780, 1.5, 0, 1], [27.9, 540, 780, 1.5, 0, 0]], **bp, z=7),
            prop(X.touch_icon(), pop(23.7, 900, 420, 1.3, t1=27.6), **bp, z=8),
            prop(A.tag("ছোঁয়া → কোষ থেকে পানি বের হয়", 860, 50, "#D7263D"), pop(24.4, 560, 1330, 1, t1=27.6), **bp, z=9),
            prop(A.tag("কোষ চুপসে যায় → পাতা নুয়ে পড়ে", 860, 50, "#D7263D"), pop(25.4, 560, 1450, 1, t1=27.6), **bp, z=9),
            prop(A.tag("পানি ফিরলে কোষ ফুলে ওঠে", 860, 50, "#1E5AA8"), pop(27.9, 560, 1330, 1), **bp, z=9),
            prop(A.tag("→ পাতা আবার খোলে", 860, 50, "#1E5AA8"), pop(28.3, 560, 1450, 1), **bp, z=9)])
# 6 · Boltu: "but why fold? what's the gain?"
hx, hy = head("boltu", B)
shot(29.9, 33.0, blur=2, cam={"from": cam(hx, hy, 1.9, 540, 760), "to": cam(hx - 10, hy, 2.0, 540, 760)},
     chars={"boltu": B, "bithi": T}, mood={"boltu": "neutral"}, props=plant_props(29.9, 33.0, start_f=1))
# 7 · close-up: an insect lands, the leaves fold, the insect tumbles off
ins = X.insect()
shot(33.0, 39.6, blur=0, cam={"from": cam(PX, PY, 2.3, 540, 960), "to": cam(PX, PY, 2.4, 540, 960)}, chars={},
     props=plant_props(33.0, 39.6, fold=(35.4, 36.2)) +
           [prop(ins, [[33.0, 1250, 1450, .9, -10, 1], [33.8, 1100, 1560, .9, 5, 1], [34.5, PX + 40, PY - 70, .9, 0, 1], [36.0, PX + 40, PY - 70, .9, 0, 1],
                       [36.5, PX + 70, PY + 10, .9, 120, 1], [36.9, PX + 90, PY + 120, .9, 200, 1], [37.1, PX + 90, PY + 130, .9, 200, 0]], z=30),
            prop(A.tag("আত্মরক্ষা", 380, 54, "#D7263D"), pop(33.3, 540, 300, 1), layer="screen", z=50)])
# 8 · wide: the goat is chewing Mama's gamchha
_g = X.goat(); _i = _g.index(">") + 1
goat_r = _g[:_i] + '<g transform="translate(310 0) scale(-1 1)">' + _g[_i:-6] + '</g></svg>'   # mirrored: faces right, toward Mama
assert _g.endswith("</svg>")
M8, T8, B8 = [480, F, .8], [700, F, .8], [890, F, .8]
GX, GY, GS = 150, 1720, .9
mouth = (GX + (296 - 155) * GS, GY + (100 - 125) * GS)
shoulder = (M8[0] - 122 * .8, F - 704 * .8)
L = math.dist(mouth, shoulder); ang = math.degrees(math.atan2(shoulder[1] - mouth[1], shoulder[0] - mouth[0]))
mid = ((mouth[0] + shoulder[0]) / 2, (mouth[1] + shoulder[1]) / 2)
strip = X.gamchha_strip(int(L))
def goat_keys(a, b):
    return [[a + i * 0.25, GX, GY + (4 if i % 2 else 0), GS, 0, 1] for i in range(int((b - a) / 0.25) + 1)]
def goat_props(a, b):
    return [prop(goat_r, goat_keys(a, b), z=60), prop(strip, [[a, mid[0], mid[1], 1, ang, 1], [b, mid[0], mid[1], 1, ang, 1]], z=55)]
shot(39.6, 42.8, blur=1.0, cam={"from": cam(540, 1380, 1.0), "to": cam(520, 1390, 1.06)},
     chars={"mama": M8, "bithi": T8, "boltu": B8}, mood={"mama": "neutral", "bithi": "worried", "boltu": "worried"},
     turn={"bithi": -0.7, "boltu": -0.7},
     poses={"bithi": [[39.6, *REST], [40.1, 85, 0, 0, 6, 0], [42.8, 85, 0, 0, 6, 0]]},
     props=goat_props(39.6, 42.8))
# 9 · Mama shouts at the goat
hx, hy = head("mama", M8)
shake = [[42.8, *REST]] + [[43.1 + i * 0.3, 110 + (12 if i % 2 else -6), 0, 50, 6, -4] for i in range(18)]
shot(42.8, 48.6, blur=1.5, cam={"from": cam(hx - 120, hy + 160, 1.45, 540, 820), "to": cam(hx - 120, hy + 160, 1.55, 540, 820)},
     chars={"mama": M8}, mood={"mama": "worried"}, turn={"mama": -0.7}, poses={"mama": shake}, props=goat_props(42.8, 48.6))
# 10 · night: does the plant stay open when nobody touches it?
shot(48.6, 51.5, blur=4, cam={"from": cam(PX, PY, 1.3), "to": cam(PX, PY, 1.35)}, chars={},
     props=[prop(X.night_card(), [[48.6, 540, 960, 1, 0, 0], [48.9, 540, 960, 1, 0, 1], [51.5, 540, 960, 1, 0, 1]], layer="screen", z=5),
            prop(X.plant(.5, dark=True), [[48.6, 540, 1350, 1.6, 0, 0], [49.0, 540, 1350, 1.6, 0, 1], [51.5, 540, 1350, 1.6, 0, 1]], layer="screen", z=6),
            prop(X.qmark(), pop(49.3, 540, 820, 1), layer="screen", z=7)])
# 11 · Bithi asks the comment puzzle
hx, hy = head("bithi", [540, F, .8])
shot(51.5, 56.23, blur=3, cam={"from": cam(hx, hy, 1.9, 540, 900), "to": cam(hx, hy, 2.05, 540, 900)},
     chars={"bithi": [540, F, .8]}, mood={"bithi": "happy"},
     props=[prop(A.tag("রাতে: খোলা না গুটানো? কমেন্টে লেখো", 900, 44, "#1E5AA8"), pop(52.0, 540, 300, 1), layer="screen", z=10)])
# 12 · end card
def wave(side):
    k = []
    for i in range(12):
        t = 56.23 + i * 0.3; a = 128 + (10 if i % 2 else -10)
        k.append([t, a, 0, 30, 6, 0] if side == "L" else [t, 0, -a, -6, -30, 0])
    return k
E0 = 56.23
shot(E0, DUR + 1, bg="paper", cam={"from": [0, 0, 1], "to": [0, 0, 1]},
     chars={"mama": [250, 1650, .42], "bithi": [540, 1650, .42], "boltu": [830, 1650, .46]}, mood={"mama": "happy", "bithi": "happy", "boltu": "happy"},
     poses={"mama": wave("L"), "bithi": wave("R"), "boltu": wave("R")},
     props=[prop(A.banner(), pop(E0 + .05, 540, 430, 1), layer="screen", z=5),
            prop(A.wheel(), [[E0, 540, 820, .3, 0, 0], [E0 + .1, 540, 820, 1, 30, 1], [DUR + 1, 540, 820, 1, 30 + 120 * (DUR + 1 - E0 - .1), 1]], layer="screen", z=5),
            prop(A.tag("মন্টু মামা", 300, 44, "#FFC300", "#1A1A1A"), pop(E0 + .4, 250, 1128, 1), layer="screen", z=6),
            prop(A.tag("বিথী", 200, 44, "#FFFFFF", "#1A1A1A"), pop(E0 + .6, 540, 1128, 1), layer="screen", z=6),
            prop(A.tag("বল্টু", 200, 44, "#F72585", "#1A1A1A"), pop(E0 + .8, 830, 1128, 1), layer="screen", z=6)])

D = {"chars": {"mama": chars["Montu Mama"], "bithi": chars["Bithi"], "boltu": chars["Boltu"]}, "bg": X.courtyard_bg(),
     "lines": lines, "mouth": json.loads((P / "mouth.json").read_text()), "shots": shots, "dur": DUR}
html = (P / "engine.html").read_text().replace("__DATA__", json.dumps(D, ensure_ascii=False))
html = html.replace("</head>", "<style>" + (S / "p5/fonts.css").read_text() + "</style></head>", 1)
(P / "s3.html").write_text(html, encoding="utf-8")
print("shots", len(shots), "frames", int(DUR * 24), "strip", round(L), round(ang))
