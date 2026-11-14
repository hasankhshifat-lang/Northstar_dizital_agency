"""Build Short 6 (chiruni-chumbok: why a rubbed comb picks up paper) as s6.html for the puppet engine, timed to the
voice timeline and to ../../episodes/short-06/storyboard.md. Usage: python3 build_s6.py <kit dir> <voiceover/short-06 dir>
Held props sit at hand points measured with probe.py (chars at scale 0.8 on F=1820)."""
import json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import art6 as X
A = X.A

S = Path(sys.argv[1]); V = Path(sys.argv[2])
P = S / "s6"
chars = json.loads((S / "chars/chars3.json").read_text())
tl = json.loads((V / "timeline.json").read_text())
G_LINES = {5, 6}                                  # Bithi's explaining lines get a talking gesture
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
def hold(a, b, x, y, s=1, rot=0): return [[a, x, y, s, rot, 1], [b, x, y, s, rot, 1]]
def prop(svg, keys, layer="world", z=40): return {"svg": svg, "layer": layer, "z": z, "keys": keys}
def scr(svg, keys, z=50): return prop(svg, keys, "screen", z)

F = 1820
M, B, T = [250, F, .8], [640, F, .8], [820, F, .8]
HEAD = {"mama": 845, "bithi": 850, "boltu": 700}
def head(c, pos): return pos[0], pos[1] - HEAD[c] * pos[2]
REST = [0, 0, -6, 6, 0]
# poses and the measured hand points (probe.py)
M_UP, M_UP_H = [0, -150, -6, 0, 0], (M[0] + 217, 1050)          # Mama's right arm raised (holding the comb up)
M_OUT, M_OUT_H = [0, -60, -6, -20, 0], (M[0] + 314, 1335)       # Mama's right arm out to the right (holding / pointing)
M_PAT = ([0, -152, -6, -60, 0], [0, -168, -6, -60, 0])    # Mama's hand on his head (pat)
B_OFFER, B_OFFER_H = [60, 0, -40, 6, 0], (B[0] - 169, 1482)    # Boltu's left arm out toward Mama
B_UP, B_UP_H = [0, -120, 6, -20, 0], (B[0] + 198, 1243)          # Boltu's right arm raised
T_RUB = (([0, -150, -6, -50, 0], (T[0] + 87, 1045)), ([0, -168, -6, -50, 0], (T[0] + 27, 1065)))   # Bithi's comb on her hair

TABLE = (450, 1650); TOP = 1530                          # bits/pins rest centre line on the table top
BITS = [(400 + k * 28, TOP + (k % 2) * 4) for k in range(5)]
PINS = [(318, TOP + 4, 10), (343, TOP, -20), (366, TOP + 6, 30)]
DRUM = (1085, 1516); TAP = (DRUM[0] - 117, 1558)
STREAM_C = (TAP[0] - 111.6 + 90, TAP[1] + 100)          # stream svg 180 x 200, x0 at 0.62*180
bitsvg = [X.bit(k) for k in range(5)]
CB = X.comb_bits(); COMB = X.comb(); HC = X.hand_comb(); HM = X.hand_magnet(); MAG = X.magnet(); MP = X.magnet_pins()

def table_props(a, b, bits=True, pins=True, comb_on_table=False):
    out = [prop(X.table(), hold(a, b, *TABLE), z=6)]
    if bits: out += [prop(bitsvg[k], hold(a, b, x, y, .8, k * 23 % 40 - 20), z=7) for k, (x, y) in enumerate(BITS)]
    if pins: out += [prop(X.pin(r), hold(a, b, x, y, .7), z=7) for x, y, r in PINS]
    if comb_on_table: out.append(prop(COMB, hold(a, b, 565, TOP - 10, .42, 4), z=8))
    return out
def drum_props(a, b, bend=None):
    out = [prop(X.drum_tap(), hold(a, b, *DRUM, .9), z=3), prop(X.bucket(), hold(a, b, TAP[0] + 10, 1802, .8), z=4)]
    if bend is None: out.append(prop(X.stream(0, 200), hold(a, b, *STREAM_C), z=3))
    else: out += bend
    return out

shots = []
def shot(a, b, **kw): shots.append({"start": a, "end": b, **kw})
CU = lambda x, y, s=2.6: {"from": cam(x, y, s, 540, 960), "to": cam(x, y, s + 0.08, 540, 960)}

# 1 · HOOK: close-up of the table, the comb comes down, the bits leap up and stick
a, b = 0, 2.6
hc = [[0, 455, 1100, .8, 0, 1], [0.35, 455, 1306, .8, 0, 1], [1.8, 455, 1306, .8, 0, 1], [2.6, 455, 1150, .8, 0, 1]]
pr = [prop(X.table(), hold(a, b, *TABLE), z=6)] + [prop(X.pin(r), hold(a, b, x, y, .7), z=7) for x, y, r in PINS]
pr.append(prop(HC, hc, z=30))
for k, (x, y) in enumerate(BITS):
    tj = 0.45 + k * 0.08; tx = 378 + k * 38; ty = 1500 + (k % 2) * 6
    pr.append(prop(bitsvg[k], [[0, x, y, .8, k * 23 % 40 - 20, 1], [tj, x, y, .8, k * 23 % 40 - 20, 1], [tj + 0.12, tx, ty, .8, k * 31 % 30, 1],
                               [1.8, tx, ty, .8, k * 31 % 30, 1], [2.6, tx, ty - 156, .8, k * 31 % 30, 1]], z=31))
shot(a, b, blur=0, cam=CU(460, 1450), chars={}, props=pr)
# 2 · wide: Mama proudly holds the comb up, Boltu amazed, Bithi watching
a2, b2 = 2.6, 5.3
comb_up = prop(CB, hold(a2, b2, M_UP_H[0] + 95, M_UP_H[1] - 8, .75, -12), z=45)
shot(a2, b2, blur=1.0, cam={"from": cam(530, 1340, 1.15), "to": cam(530, 1345, 1.2)},
     chars={"mama": M, "boltu": B, "bithi": T}, mood={"mama": "happy", "boltu": "worried", "bithi": "neutral"},
     turn={"bithi": -0.6}, poses={"mama": [[a2, *M_UP], [b2, *M_UP]]},
     props=table_props(a2, b2, bits=False) + drum_props(a2, b2) + [comb_up])
# 3 · Mama: "I made a magnet in the comb by rubbing it in my hair"
a3, b3 = b2, LN[1]["end"] + 0.15
hx, hy = head("mama", M)
shot(a3, b3, blur=2, cam={"from": cam(hx + 120, hy + 120, 1.7, 540, 820), "to": cam(hx + 120, hy + 120, 1.82, 540, 820)},
     chars={"mama": M, "boltu": B}, mood={"mama": "happy", "boltu": "neutral"}, turn={"boltu": -0.6},
     poses={"mama": [[a3, *M_UP], [b3, *M_UP]]},
     props=table_props(a3, b3, bits=False) + [prop(CB, hold(a3, b3, M_UP_H[0] + 95, M_UP_H[1] - 8, .75, -12), z=45)])
# 4 · Boltu offers the real magnet; Mama has put the comb down
a4, b4 = b3, LN[2]["end"] + 0.15
shot(a4, b4, blur=1.2, cam={"from": cam(450, 1340, 1.4), "to": cam(455, 1345, 1.48)},
     chars={"mama": M, "boltu": B}, mood={"mama": "neutral", "boltu": "happy"}, turn={"mama": 0.6, "boltu": -0.6},
     poses={"boltu": [[a4, *REST], [a4 + 0.4, *B_OFFER], [b4, *B_OFFER]]},
     props=table_props(a4, b4, comb_on_table=True) + [prop(MAG, [[a4, 700, 1560, .55, 0, 0], [a4 + 0.39, 700, 1560, .55, 0, 0], [a4 + 0.4, B_OFFER_H[0], B_OFFER_H[1] + 40, .55, 0, 1], [b4, B_OFFER_H[0], B_OFFER_H[1] + 40, .55, 0, 1]], z=45)])
# 5 · close-up: the magnet over the paper bits, nothing moves
a5, b5 = b4, LN[3]["start"] + 0.9
hm = [[a5, 455, 1000, .8, 0, 1], [a5 + 0.45, 455, 1273, .8, 0, 1], [a5 + 0.9, 475, 1273, .8, 3, 1], [a5 + 1.4, 435, 1273, .8, -3, 1], [b5, 455, 1273, .8, 0, 1]]
shot(a5, b5, blur=0, cam=CU(460, 1450), chars={}, props=table_props(a5, b5, comb_on_table=True) + [prop(HM, hm, z=30)])
# 6 · Mama, annoyed, stares at the magnet: "it's broken!"
a6, b6 = b5, LN[3]["end"] + 0.55
shot(a6, b6, blur=1.5, cam={"from": cam(400, 1300, 1.6), "to": cam(400, 1300, 1.7)},
     chars={"mama": M, "boltu": B}, mood={"mama": "worried", "boltu": "happy"}, turn={"mama": 0.5, "boltu": -0.6},
     poses={"mama": [[a6, *M_OUT], [b6, *M_OUT]]},
     props=table_props(a6, b6, comb_on_table=True) + [prop(MAG, hold(a6, b6, M_OUT_H[0] + 8, M_OUT_H[1] + 42, .55), z=45)])
# 7 · close-up: Boltu's magnet over the pins, the pins jump up and stick
a7, b7 = b6, LN[4]["start"] + 1.45
tp = a7 + 0.6
pins7 = []
for k, (x, y, r) in enumerate(PINS):
    tx = 315 + k * 30; ty = 1505 + k * 3
    pins7.append(prop(X.pin(r), [[a7, x, y, .7, 0, 1], [tp + k * 0.05, x, y, .7, 0, 1], [tp + k * 0.05 + 0.08, tx, ty, .7, 60 + k * 15, 1], [b7, tx, ty, .7, 60 + k * 15, 1]], z=31))
shot(a7, b7, blur=0, cam=CU(380, 1450),
     chars={}, props=[prop(X.table(), hold(a7, b7, *TABLE), z=6)] + [prop(bitsvg[k], hold(a7, b7, x, y, .8, k * 23 % 40 - 20), z=7) for k, (x, y) in enumerate(BITS)] +
     [prop(HM, [[a7, 345, 1000, .8, 0, 1], [tp - 0.05, 345, 1273, .8, 0, 1], [b7, 345, 1273, .8, 0, 1]], z=30)] + pins7)
# 8 · Boltu shows the magnet with the pins: "not broken!"
a8, b8 = b7, LN[4]["end"] + 0.3
shot(a8, b8, blur=1.2, cam={"from": cam(520, 1320, 1.4), "to": cam(525, 1325, 1.46)},
     chars={"mama": M, "boltu": B}, mood={"mama": "worried", "boltu": "happy"}, turn={"mama": 0.6, "boltu": -0.5},
     poses={"boltu": [[a8, *B_UP], [b8, *B_UP]]},
     props=table_props(a8, b8, pins=False, comb_on_table=True) + [prop(MP, hold(a8, b8, B_UP_H[0] + 4, B_UP_H[1] - 30, .55), z=45)])
# 9 · Bithi: "a magnet pulls iron, not paper: the comb holds static electricity!"
a9, b9 = b8, LN[5]["end"] + 0.25
t_name = LN[5]["start"] + 4.0
shot(a9, b9, blur=1.0, cam={"from": cam(600, 1340, 1.2), "to": cam(660, 1340, 1.3)},
     chars={"mama": M, "boltu": B, "bithi": T}, mood={"mama": "neutral", "boltu": "neutral", "bithi": "happy"},
     poses={"boltu": [[a9, *B_UP], [a9 + 0.5, *REST], [b9, *REST]]},
     props=table_props(a9, b9, pins=False, comb_on_table=True) + drum_props(a9, b9) +
           [prop(MP, [[a9, B_UP_H[0] + 4, B_UP_H[1] - 30, .55, 0, 1], [a9 + 0.5, 330, TOP - 20, .5, 0, 1], [b9, 330, TOP - 20, .5, 0, 1]], z=45),
            scr(A.tag("স্থির বিদ্যুৎ", 420, 54, "#7A4FB5"), pop(t_name, 540, 300, 1), z=60)])
# 10 · DEMONSTRATION: comb through hair, electrons hop hair -> comb; then the charged comb lifts the bits
a10, b10 = b9, LN[6]["end"] + 0.2
s6 = LN[6]["start"]; t_split = s6 + 3.9
HP = (540, 760); HCS = 1.1
strokes = [(a10, 300), (a10 + 0.8, 780), (a10 + 1.6, 300), (a10 + 2.4, 780), (a10 + 3.2, 300), (t_split - 0.1, 540)]
CY = 547
hc10 = [[t, x, CY, HCS, 0, 1] for t, x in strokes] + [[t_split, 540, CY, HCS, 0, 0]]
def comb_x(t):
    for (t0, x0), (t1, x1) in zip(strokes, strokes[1:]):
        if t0 <= t <= t1: return x0 + (x1 - x0) * (t - t0) / (t1 - t0)
    return strokes[-1][1]
el = []
for k in range(6):
    th = a10 + 0.3 + k * 0.5; hx0 = 180 + k * 140; off = -110 + k * 44
    keys = [[a10, hx0, 880, .8, 0, 0], [th - 0.01, hx0, 880, .8, 0, 1]]
    tt = th + 0.25; keys.append([tt, comb_x(tt) + off, 735, .8, 0, 1])
    t = tt
    while t < t_split - 0.1:
        t = min(t + 0.2, t_split - 0.1); keys.append([t, comb_x(t) + off, 735, .8, 0, 1])
    keys.append([t_split, comb_x(t_split) + off, 735, .8, 0, 0])
    el.append(scr(X.electron(), keys, z=62))
    el.append(scr(X.plus(), [[th - 0.01, hx0, 880, .9, 0, 0], [th + 0.05, hx0, 880, .9, 0, 1], [t_split, hx0, 880, .9, 0, 1], [t_split + 0.01, hx0, 880, .9, 0, 0]], z=58))
dp = [scr(X.hair_panel(), [[a10, *HP, 1, 0, 1], [t_split, *HP, 1, 0, 1], [t_split + 0.01, *HP, 1, 0, 0]], z=50),
      scr(HC, hc10, z=60),
      scr(A.tag("ঘষায় ইলেকট্রন: চুল → চিরুনি", 760, 50, "#1E5AA8"), pop(s6 + 2.6, 540, 1110, 1, t1=t_split), z=65)] + el
# part 2: charged comb over the bits on a table strip, the bits jump to it
TS = (540, 1250)
dp += [scr(X.table_strip(), [[t_split - 0.01, *TS, 1, 0, 0], [t_split, *TS, 1, 0, 1], [b10, *TS, 1, 0, 1]], z=50),
       scr(X.comb_charged(), [[t_split, 540, 700, 1.3, 0, 1], [t_split + 1.2, 540, 1060, 1.3, 0, 1], [b10, 540, 1060, 1.3, 0, 1]], z=60),
       scr(A.tag("আহিত চিরুনি হালকা জিনিস টানে", 820, 50, "#D7263D"), pop(s6 + 5.2, 540, 1480, 1), z=65)]
tj = t_split + 1.35
for k in range(5):
    x = 380 + k * 80; y = 1290
    dp.append(scr(bitsvg[k], [[t_split - 0.01, x, y, 1.3, k * 23 % 40 - 20, 0], [t_split, x, y, 1.3, k * 23 % 40 - 20, 1], [tj + k * 0.07, x, y, 1.3, k * 23 % 40 - 20, 1],
                              [tj + k * 0.07 + 0.12, 420 + k * 60, 1130, 1.3, k * 31 % 30, 1], [b10, 420 + k * 60, 1130, 1.3, k * 31 % 30, 1]], z=61))
shot(a10, b10, blur=8, cam={"from": cam(540, 1300, 1.3), "to": cam(540, 1300, 1.3)}, chars={}, props=dp)
# 11 · Mama's dare, pointing at the tap: "bend the tap water with it, if you can!"
a11, b11 = b10, LN[7]["end"] + 0.15
t_pt = LN[7]["start"] + 2.0
shot(a11, b11, blur=1.0, cam={"from": cam(600, 1340, 1.15), "to": cam(600, 1340, 1.2)},
     chars={"mama": M, "boltu": B, "bithi": T}, mood={"mama": "happy", "boltu": "neutral", "bithi": "neutral"},
     poses={"mama": [[a11, *REST], [t_pt - 0.3, *REST], [t_pt, 0, -118, -6, -8, 0], [b11, 0, -118, -6, -8, 0]]},
     props=table_props(a11, b11, pins=False, comb_on_table=True) + drum_props(a11, b11))
# 12 · Bithi rubs the comb on her hair, eyes on the stream (no words)
a12, b12 = b11, LN[8]["start"] - 0.7
rk, ck = [], []
t = a12; i = 0
while t <= b12 + 0.001:
    pz, hp = T_RUB[i % 2]; rk.append([t, *pz]); ck.append([t, hp[0], hp[1], .5, -8, 1]); t += 0.3; i += 1
hx, hy = head("bithi", T)
shot(a12, b12, blur=1.5, cam={"from": cam(hx + 40, hy + 260, 1.55, 540, 820), "to": cam(hx + 40, hy + 260, 1.62, 540, 820)},
     chars={"bithi": T, "boltu": B}, mood={"bithi": "happy", "boltu": "neutral"}, turn={"bithi": 0.5, "boltu": 0.6},
     poses={"bithi": rk}, props=drum_props(a12, b12) + [prop(COMB, ck, z=45)])
# 13 · REVEAL: close-up of the stream, the comb beside it (never touching), the stream bends toward it
a13, b13 = b12, LN[8]["end"] + 0.25
t_b = a13 + 0.5
hc13 = [[a13, TAP[0] - 193, 1450, .8, 0, 1], [a13 + 0.45, TAP[0] - 151, 1506, .8, 0, 1], [b13, TAP[0] - 151, 1506, .8, 0, 1]]
bend = [prop(X.stream(0, 200), [[a13, *STREAM_C, 1, 0, 1], [t_b, *STREAM_C, 1, 0, 1], [t_b + 0.25, *STREAM_C, 1, 0, 0]], z=3),
        prop(X.stream(0.5, 200), [[t_b, *STREAM_C, 1, 0, 0], [t_b + 0.25, *STREAM_C, 1, 0, 1], [t_b + 0.5, *STREAM_C, 1, 0, 0]], z=3),
        prop(X.stream(1.0, 200), [[t_b + 0.25, *STREAM_C, 1, 0, 0], [t_b + 0.5, *STREAM_C, 1, 0, 1], [b13, *STREAM_C, 1, 0, 1]], z=3)]
shot(a13, b13, blur=0, cam=CU(TAP[0] - 30, 1640, 2.3), chars={}, props=drum_props(a13, b13, bend) + [prop(HC, hc13, z=30)])
# 14 · Mama pats his hair, proud: "so much power in my hair!"; Boltu laughs
a14, b14 = b13, LN[9]["end"] + 0.25
pk = []; t = a14; i = 0
while t <= b14 + 0.001: pk.append([t, *M_PAT[i % 2]]); t += 0.35; i += 1
shot(a14, b14, blur=1.5, cam={"from": cam(430, 1300, 1.5), "to": cam(430, 1300, 1.58)},
     chars={"mama": M, "boltu": B}, mood={"mama": "happy", "boltu": "happy"}, turn={"boltu": -0.6, "mama": 0.3},
     poses={"mama": pk}, props=table_props(a14, b14, pins=False, comb_on_table=True))
# 15 · puzzle card
a15, b15 = b14, VEND
s10 = LN[10]["start"]
shot(a15, b15, bg="paper", cam={"from": [0, 0, 1], "to": [0, 0, 1]},
     chars={"bithi": [150, 1960, .42]}, mood={"bithi": "happy"}, poses={"bithi": [[a15, 0, -60, -6, 20, 0], [b15, 0, -60, -6, 20, 0]]},
     props=[scr(A.board_title("ধাঁধা!"), pop(a15 + 0.05, 540, 170, 1), z=5),
            scr(X.puzzle_card(), pop(a15 + 0.15, 540, 700, 1), z=6),
            scr(A.tag("ক) টানবে?", 420, 50, "#1E5AA8"), pop(s10 + 2.6, 330, 1180, 1), z=10),
            scr(A.tag("খ) ঠেলবে?", 420, 50, "#D7263D"), pop(s10 + 3.4, 750, 1180, 1), z=10),
            scr(A.tag("কমেন্টে লেখো!", 520, 54, "#7A4FB5"), pop(s10 + 4.3, 600, 1380, 1), z=10)])
# 16 · end card
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

D = {"chars": {"mama": chars["Montu Mama"], "bithi": chars["Bithi"], "boltu": chars["Boltu"]}, "bg": X.bg(),
     "lines": lines, "mouth": json.loads((P / "mouth.json").read_text()), "shots": shots, "dur": DUR}
html = (P / "engine.html").read_text().replace("__DATA__", json.dumps(D, ensure_ascii=False))
html = html.replace("</head>", "<style>" + (S / "p5/fonts.css").read_text() + "</style></head>", 1)
(P / "s6.html").write_text(html, encoding="utf-8")
print("shots", len(shots), "dur", DUR, "frames", int(DUR * 24))
for s in shots: print(round(s["start"], 2), round(s["end"], 2))
