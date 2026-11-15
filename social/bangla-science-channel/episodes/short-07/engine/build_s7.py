"""Build Short 7 (straw-bayuchap: who lifts the sharbat up the straw?) as s7.html for the puppet engine, timed to
the voice timeline and to ../../episodes/short-07/storyboard.md. Usage: python3 build_s7.py <kit dir> <voiceover/short-07 dir>
3D set: env3d/sharbat_stall.py (wide + table close-up plates, projected anchor points)."""
import json, sys, base64
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import art7 as X
A = X.A

S = Path(sys.argv[1]); V = Path(sys.argv[2])
P = S / "s7"
chars = json.loads((S / "chars/chars3.json").read_text())
tl = json.loads((V / "timeline.json").read_text())
ENV = S / "env3d/out"
PT = json.loads((ENV / "sharbat_points.json").read_text())
def plate(name):
    b64 = base64.b64encode((ENV / f"sharbat_{name}.jpg").read_bytes()).decode()
    return f'<img src="data:image/jpeg;base64,{b64}" style="width:1080px;height:1920px;display:block">'
G_LINES = {4}
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
def win(a, b, x, y, s=1, rot=0):
    """Visible only from a to b (hard cut in and out), for swapping between drawn states."""
    return [[a - 0.001, x, y, s, rot, 0], [a, x, y, s, rot, 1], [b, x, y, s, rot, 1], [b + 0.001, x, y, s, rot, 0]]
def prop(svg, keys, layer="world", z=40): return {"svg": svg, "layer": layer, "z": z, "keys": keys}
def scr(svg, keys, z=50): return prop(svg, keys, "screen", z)
def steps(t0, t1, v0, v1, n):
    """n+1 (time, value) states from t0 to t1."""
    return [(t0 + (t1 - t0) * k / n, v0 + (v1 - v0) * k / n) for k in range(n + 1)]
def states(seq, end, make):
    """seq = [(t, value), ...] -> props, each state visible until the next one (the last one until end)."""
    out = []
    for k, (t, v) in enumerate(seq):
        t1 = seq[k + 1][0] if k + 1 < len(seq) else end
        if t1 > t: out.append(make(t, t1, v))
    return out

F = 1820
M, B, T0, T = [250, F, .8], [640, F, .8], [880, F, .8], [820, F, .8]
HEAD = {"mama": 845, "bithi": 850, "boltu": 700}
def head(c, pos): return pos[0], pos[1] - HEAD[c] * pos[2]
REST = [0, 0, -6, 6, 0]
M_FLEX = [0, -150, -6, 0, 0]                   # Mama's right arm up, forearm bent: a proud flex
B_POINT = [60, 0, -40, 6, 0]                    # Boltu's left arm out toward Mama's bottle
MOUTH_M = (250, 1206); MOUTH_M_OFF = (268, 1246)   # Mama's mouth; the straw tip when he lets go
MOUTH_B = (636, 1270); MOUTH_B_OFF = (652, 1304)

TOPW = PT["wide"]["table_top_c"][1] + 6          # table top (front half) in the wide plate
BW, BH = 60, 150; BX = 402                       # Mama's bottle on the table (wide)
GW, GH = 44, 60; GX = 560                        # Boltu's glass on the table (wide)
def w_bottle(a, b, crumple, hole=False, level=0.62):
    return prop(X.bottle(crumple, level, hole, BW, BH), win(a, b, BX, TOPW - BH / 2), z=7)
def w_glass(a, b, level=0.7): return prop(X.glass(level, GW, GH), hold(a, b, GX, TOPW - GH / 2), z=7)
def m_straw(a, b, inmouth, fill):
    p1 = MOUTH_M if inmouth else MOUTH_M_OFF
    return prop(X.bendy_straw((BX - 1, TOPW - BH * 0.22), p1, 6, fill), win(a, b, 540, 960), z=46)
def b_straw(a, b, inmouth, fill):
    p1 = MOUTH_B if inmouth else MOUTH_B_OFF
    return prop(X.bendy_straw((GX + 2, TOPW - GH * 0.25), p1, 6, fill), win(a, b, 540, 960), z=46)

def table_wide(a, b, crumple, m_in=False, m_fill=0.08, b_in=False, b_fill=0.12, hole=False, level=0.62):
    """Everything on the table in the wide plate for a shot: bottle + Mama's straw, glass + Boltu's straw."""
    out = [w_glass(a, b), b_straw(a, b, b_in, b_fill)]
    if isinstance(crumple, list): out += states(crumple, b, lambda t0, t1, v: w_bottle(t0, t1, v, hole, level))
    else: out.append(w_bottle(a, b, crumple, hole, level))
    if isinstance(m_in, list):                   # [(t, inmouth, fill), ...]
        for k, (t, im, fl) in enumerate(m_in):
            t1 = m_in[k + 1][0] if k + 1 < len(m_in) else b
            out.append(m_straw(t, t1, im, fl))
    else: out.append(m_straw(a, b, m_in, m_fill))
    return out

# close-up table plate: bottle and glass at the table's middle depth
TC = PT["table"]["c"]; KT = PT["table"]["px_per_m_at_c"]
BASE = TC[1] + 95                                # where things stand on the table top in the close-up
CBW, CBH, CSL = 246, 615, 760                    # close-up bottle (0.28 m tall) + straw up out of the frame
CBX = 430; CBY = BASE - (CBH + CSL) / 2
def cu_bottle(a, b, crumple, fill=0.10, hole=False, level=0.62, x=CBX):
    return prop(X.bottle(crumple, level, hole, CBW, CBH, CSL, fill), win(a, b, x, CBY), z=20)
CGW, CGH, CGSL = 200, 263, 1090
def cu_glass(a, b, fill, x=540):
    return prop(X.glass_cu(0.7, fill, CGW, CGH, CGSL), win(a, b, x, BASE - (CGH + CGSL) / 2), z=20)

shots = []
def shot(a, b, **kw): shots.append({"start": a, "end": b, **kw})
CU = lambda x=540, y=960, s=1.0, s2=None: {"from": cam(x, y, s, 540, 960), "to": cam(x, y, s2 or s + 0.05, 540, 960)}

# 1 · HOOK: the bottle dents in steps while someone sucks (sharbat barely moves in the straw)
a, b = 0, 2.0
seq = [(0, 0.0)] + steps(0.2, 1.8, 0.1, 0.45, 5)
pr = states(seq, b, lambda t0, t1, v: cu_bottle(t0, t1, v, 0.10 + 0.06 * min(1, v / 0.45)))
shot(a, b, blur=0, bgk="table", cam=CU(450, 1040, 1.25, 1.36), chars={}, props=pr)
# 2 · wide: Mama sucks hard, CRUNCH at 3.2; Boltu alarmed; Bithi turns to look
a2, b2 = 2.0, LN[1]["start"] - 0.05
cr = [(a2, 0.45), (3.2, 0.62), (3.3, 0.8), (3.4, 0.9)]
shot(a2, b2, blur=1.0, cam={"from": cam(440, 1380, 1.4), "to": cam(435, 1380, 1.47)},
     chars={"mama": M, "boltu": B, "bithi": T0}, mood={"mama": "worried", "boltu": "worried", "bithi": "neutral"},
     turn={"mama": 0, "boltu": -0.6, "bithi": -0.6},
     props=table_wide(a2, b2, cr, m_in=True, m_fill=0.14))
# 3 · Mama lets go of the straw: "Quiet! Suck a bit harder and it'll come up!"
a3, b3 = b2, LN[1]["end"] + 0.15
hx, hy = head("mama", M)
shot(a3, b3, blur=2, cam={"from": cam(hx + 110, hy + 230, 1.65, 540, 820), "to": cam(hx + 110, hy + 230, 1.76, 540, 820)},
     chars={"mama": M, "boltu": B}, mood={"mama": "worried", "boltu": "neutral"}, turn={"mama": 0.4, "boltu": -0.6},
     props=table_wide(a3, b3, 0.9, m_in=False, m_fill=0.08))
# 4 · close-up: Boltu's open glass, the sharbat rises easily
a4, b4 = b3, LN[2]["start"]
seq = steps(a4 + 0.15, a4 + 0.65, 0.2, 1.0, 6)
pr = [cu_glass(a4, a4 + 0.15, 0.2)] + states(seq, b4, lambda t0, t1, v: cu_glass(t0, t1, v))
shot(a4, b4, blur=0, bgk="table", cam=CU(540, 1000, 1.0), chars={}, props=pr)
# 5 · Boltu: "in my open glass it comes up with a gentle sip!"
a5, b5 = b4, LN[2]["end"] + 0.15
shot(a5, b5, blur=1.3, cam={"from": cam(470, 1350, 1.45), "to": cam(475, 1350, 1.52)},
     chars={"mama": M, "boltu": B}, mood={"mama": "worried", "boltu": "happy"}, turn={"mama": 0.6, "boltu": -0.6},
     props=table_wide(a5, b5, 0.9, b_in=False, b_fill=0.12))
# 6 · Mama scowls at his bottle: "your sharbat is polite, mine is rude!"; Boltu laughs
a6, b6 = b5, LN[3]["end"] + 0.2
shot(a6, b6, blur=1.6, cam={"from": cam(380, 1300, 1.6), "to": cam(380, 1300, 1.7)},
     chars={"mama": M, "boltu": B}, mood={"mama": "worried", "boltu": "happy"}, turn={"mama": 0.5, "boltu": -0.6},
     props=table_wide(a6, b6, 0.9))
# 7 · Bithi walks in: "the mouth doesn't pull the sharbat; air pushes it up!"
a7, b7 = b6, LN[4]["end"] + 0.15
t_tag = LN[4]["start"] + 3.6
shot(a7, b7, blur=1.0, cam={"from": cam(580, 1340, 1.15), "to": cam(640, 1340, 1.25)},
     chars={"mama": M, "boltu": B, "bithi": T}, mood={"mama": "neutral", "boltu": "neutral", "bithi": "happy"},
     walk={"bithi": [[a7, 880], [a7 + 0.6, 820]]},
     props=table_wide(a7, b7, 0.9) + [scr(A.tag("বায়ুচাপ", 300, 58, "#1E5AA8"), pop(t_tag, 540, 300, 1), z=60)])
# 8 · DEMONSTRATION 1: the glass in section. Sipping lowers the pressure in the straw; outside air pushes the sharbat up
a8, b8 = b7, LN[5]["end"] + 0.2
s5 = LN[5]["start"]; t_low = s5 + 1.0; t_push = s5 + 4.0; t_rise = s5 + 4.8
GX8, GY8, GW8, GH8 = 540, 1360, 420, 560
surf = GY8 - GH8 / 2 + GH8 * 0.3                 # sharbat surface in the big glass
SX8, ST0, ST1 = 560, GY8 + GH8 / 2 - 50, 470     # straw x, bottom, top
dp = [scr(X.glass(0.7, GW8, GH8), hold(a8, b8, GX8, GY8), z=50),
      scr(X.mouth_lips(), hold(a8, b8, SX8, ST1 - 30), z=56)]
f0 = (ST0 - surf) / (ST0 - ST1)
def big_straw(t0, t1, f):
    return scr(X.svg(1080, 1920, X._straw_path(f"M{SX8} {ST0} L{SX8} {ST1}", 40, f)), win(t0, t1, 540, 960), z=55)
dp += states([(a8, f0)] + steps(t_rise, t_rise + 1.6, f0, 1.0, 8), b8, big_straw)
for k in range(6):                                # air inside the straw: 4 of 6 dots leave through the mouth on "চাপ কমে"
    y = ST1 + 70 + k * ((surf - 30) - (ST1 + 70)) / 5
    if k < 4:
        tg = t_low + k * 0.35
        keys = [[a8, SX8, y, 1, 0, 1], [tg, SX8, y, 1, 0, 1], [tg + 0.6, SX8, ST1 - 60, 1, 0, 0.0]]
    else:
        keys = [[a8, SX8, y, 1, 0, 1], [t_rise + 0.4 + (k - 4) * 0.3, SX8, y, 1, 0, 1], [t_rise + 0.9 + (k - 4) * 0.3, SX8, ST1 - 60, 1, 0, 0]]
    dp.append(scr(X.air_dot(), keys, z=57))
for k, x in enumerate((370, 450, 680, 750)):      # outside air presses on the open surface
    dp.append(scr(X.arrow(), [[t_push - 0.01 + k * 0.08, x, surf - 95, .3, 0, 0], [t_push + k * 0.08, x, surf - 95, .3, 0, 1], [t_push + 0.25 + k * 0.08, x, surf - 80, 1, 0, 1],
                              [t_push + 0.8 + k * 0.08, x, surf - 72, 1, 0, 1], [t_push + 1.2 + k * 0.08, x, surf - 82, 1, 0, 1], [b8, x, surf - 72, 1, 0, 1]], z=58))
dp += [scr(A.tag("স্ট্রর ভেতরে চাপ কম", 560, 50, "#D7263D"), pop(t_low + 0.4, 790, 640, 1), z=65),
       scr(A.tag("বাইরের বায়ুচাপ ঠেলে তোলে", 760, 52, "#1E5AA8"), pop(t_push + 0.3, 540, 1730, 1), z=65)]
shot(a8, b8, blur=9, bgk="table", cam=CU(), chars={}, props=dp)
# 9 · Boltu points at Mama's bottle: "then why doesn't it push in Mama's bottle?"
a9, b9 = b8, LN[6]["end"] + 0.15
shot(a9, b9, blur=1.3, cam={"from": cam(450, 1350, 1.4), "to": cam(450, 1350, 1.47)},
     chars={"mama": M, "boltu": B}, mood={"mama": "worried", "boltu": "neutral"}, turn={"mama": 0.4, "boltu": -0.6},
     poses={"boltu": [[a9, *REST], [a9 + 0.45, *B_POINT], [b9 - 0.3, *B_POINT], [b9, *REST]]},
     props=table_wide(a9, b9, 0.9))
# 10 · DEMONSTRATION 2: the sealed bottle in section: no air gets in; the outside air squeezes the walls
a10, b10 = b9, LN[7]["end"] + 0.25
s7 = LN[7]["start"]; t_sq = s7 + 3.5
BW10, BH10, BSL10 = 380, 950, 230
BY10 = 1110; btop = BY10 - (BH10 + BSL10) / 2 + BSL10
cap_y = btop + BH10 * 0.12 - BH10 * 0.03
def big_bottle(t0, t1, c):
    return scr(X.bottle(c, 0.55, False, BW10, BH10, BSL10, 0.08), win(t0, t1, 540, BY10), z=50)
dp = states([(a10, 0.15)] + steps(t_sq, t_sq + 1.4, 0.15, 0.9, 7), b10, big_bottle)
dp += [scr(X.lock_cap(170), pop(s7 + 0.3, 540 - 4, cap_y, 1), z=56),
       scr(A.tag("ঢাকনা বন্ধ: বাতাস ঢোকে না", 700, 50, "#D7263D"), pop(s7 + 0.8, 540, 300, 1), z=65),
       scr(A.tag("বাইরের বায়ুচাপ বোতল চাপে", 720, 52, "#1E5AA8"), pop(t_sq + 0.2, 540, 1760, 1), z=65)]
for k, yy in enumerate((0.45, 0.62, 0.79)):
    y = btop + BH10 * yy
    for side in (-1, 1):
        x0 = 540 + side * 330; x1 = 540 + side * 270
        rot = 90 if side > 0 else -90
        dp.append(scr(X.arrow(), [[t_sq - 0.31 + k * 0.1, x0, y, .3, rot, 0], [t_sq - 0.3 + k * 0.1, x0, y, .3, rot, 1], [t_sq + 0.1 + k * 0.1, x0, y, 1, rot, 1],
                                  [t_sq + 1.4, x1, y, 1, rot, 1], [b10, x1, y, 1, rot, 1]], z=58))
shot(a10, b10, blur=9, bgk="table", cam=CU(), chars={}, props=dp)
# 11 · REVEAL: pin through the lid, air rushes in, the bottle springs back, then the sharbat shoots up the straw
a11, b11 = b10, LN[9]["start"] - 0.15
s8 = LN[8]["start"]; t_poke = s8 + 1.25; t_back = t_poke + 0.35; t_suck = LN[8]["end"] + 0.3
holex = CBX + CBW * 0.16 * 0.8; holey = CBY - (CBH + CSL) / 2 + CSL + CBH * (0.12 - 0.035)
HP = (holex, holey - 255)                         # hand_pin centre when the pin tip touches the lid
hp = [[a11, HP[0] + 40, -300, 1, 0, 1], [t_poke - 0.55, HP[0] + 10, HP[1] - 40, 1, 0, 1], [t_poke, *HP, 1, 0, 1], [t_poke + 0.2, *HP, 1, 0, 1],
      [t_poke + 0.55, HP[0] + 20, HP[1] - 60, 1, 0, 1], [t_poke + 1.1, HP[0] + 60, -320, 1, 0, 1], [b11, HP[0] + 60, -320, 1, 0, 1]]
seqc = [(a11, 0.9)] + steps(t_back, t_back + 0.8, 0.9, 0.0, 6)
pr = []
for k, (t, c) in enumerate(seqc):
    t1 = seqc[k + 1][0] if k + 1 < len(seqc) else t_suck
    pr.append(cu_bottle(t, t1, c, 0.10, hole=t >= t_poke))
seqf = steps(t_suck, t_suck + 1.0, 0.10, 1.0, 8)
pr += states(seqf, b11, lambda t0, t1, f: cu_bottle(t0, t1, 0.0, f, hole=True, level=0.62 - 0.05 * (f - 0.1) / 0.9))
pr.append(prop(X.hand_pin(), hp, z=30))
for k in range(3):
    sx, sy = holex + 70 + k * 30, holey - 90 - k * 40
    pr.append(prop(X.swirl(k), [[t_poke + 0.1 + k * 0.15, sx, sy, .9, 200, 0], [t_poke + 0.2 + k * 0.15, sx, sy, .9, 200, 1], [t_poke + 0.75 + k * 0.15, holex + 18, holey - 14, .5, 200, 0]], z=32))
shot(a11, b11, blur=0, bgk="table", cam=CU(450, 960, 1.15, 1.2), chars={}, props=pr)
# 12 · Boltu: "it's coming up!": Mama sucking happily, everyone looking at the straw
a12, b12 = b11, LN[9]["end"] + 0.2
shot(a12, b12, blur=1.0, cam={"from": cam(560, 1340, 1.15), "to": cam(560, 1340, 1.2)},
     chars={"mama": M, "boltu": B, "bithi": T}, mood={"mama": "happy", "boltu": "happy", "bithi": "happy"},
     turn={"boltu": -0.6, "bithi": -0.6},
     props=table_wide(a12, b12, 0.0, m_in=True, m_fill=1.0, hole=True, level=0.57))
# 13 · Mama, proud, flexes: "See? The power of my sucking!" Bithi gives him a look; Boltu laughs
a13, b13 = b12, LN[10]["end"] + 0.3
shot(a13, b13, blur=1.2, cam={"from": cam(470, 1330, 1.3), "to": cam(470, 1330, 1.38)},
     chars={"mama": M, "boltu": B, "bithi": T}, mood={"mama": "happy", "boltu": "happy", "bithi": "neutral"},
     turn={"boltu": -0.6, "bithi": -0.7},
     poses={"mama": [[a13, *REST], [a13 + 0.45, *M_FLEX], [b13, *M_FLEX]]},
     props=table_wide(a13, b13, 0.0, m_in=False, m_fill=0.3, hole=True, level=0.57))
# 14 · puzzle card
a14, b14 = b13, VEND
s11 = LN[11]["start"]
shot(a14, b14, bg="paper", cam={"from": [0, 0, 1], "to": [0, 0, 1]},
     chars={"bithi": [150, 1960, .42]}, mood={"bithi": "happy"}, poses={"bithi": [[a14, 0, -60, -6, 20, 0], [b14, 0, -60, -6, 20, 0]]},
     props=[scr(A.board_title("ধাঁধা!"), pop(a14 + 0.05, 540, 170, 1), z=5),
            scr(X.moon_card(), pop(a14 + 0.15, 540, 690, 1.15), z=6),
            scr(A.tag("চাঁদে বাতাস নেই", 470, 50, "#1A1A1A"), pop(s11 + 1.0, 540, 1100, 1), z=10),
            scr(A.tag("ক) যাবে", 300, 50, "#1E5AA8"), pop(s11 + 3.0, 360, 1240, 1), z=10),
            scr(A.tag("খ) যাবে না", 340, 50, "#D7263D"), pop(s11 + 3.5, 740, 1240, 1), z=10),
            scr(A.tag("কমেন্টে লেখো!", 520, 54, "#7A4FB5"), pop(s11 + 4.4, 600, 1420, 1), z=10)])
# 15 · end card
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
     "bgs": {k: plate(k) for k in ("wide", "table")}, "bgDefault": "wide",
     "lines": lines, "mouth": json.loads((P / "mouth.json").read_text()), "shots": shots, "dur": DUR}
html = (P / "engine.html").read_text().replace("__DATA__", json.dumps(D, ensure_ascii=False))
html = html.replace("</head>", "<style>" + (S / "p5/fonts.css").read_text() + "</style></head>", 1)
(P / "s7.html").write_text(html, encoding="utf-8")
print("shots", len(shots), "dur", DUR, "frames", int(DUR * 24))
for s in shots: print(round(s["start"], 2), round(s["end"], 2))
