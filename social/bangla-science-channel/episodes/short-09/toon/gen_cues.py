"""Shot list + key action times for Short 9 (tablecloth / inertia) -> cues.json. Run after voice_split.py."""
import json, math
TL = json.load(open("timeline.json")); L = {l["id"]: l for l in TL["lines"]}
VEND = TL["voice_end"]; DUR = round(VEND + 2.6, 2)
# slow pull (the wrong way): cloth drags the dishes off the left edge
TLX, TRX, TTOP = 250, 630, 1270           # table left/right x, table-top y (world)
ps = L["m1"]["t0"] + .85; pd = 1.5; DXM = 400
ITEMS = [["plate", 330], ["glass", 420], ["plate", 515], ["jug", 590]]
G = 2940.0
def dx(t): u = min(1, max(0, (t - ps) / pd)); return DXM * u * u * (3 - 2 * u)
def speed(t, h=1e-3): return (dx(t + h) - dx(t - h)) / (2 * h)
land = []
for kind, x0 in ITEMS:
    t = ps
    while dx(t) < x0 - TLX: t += .002
    te = t; v = speed(te); tf = math.sqrt(2 * (1500 + 30 - TTOP) / G)
    land.append({"kind": kind, "x0": x0, "te": round(te, 3), "v": round(v, 1), "tl": round(te + tf, 3)})
yank = L["m3"]["t1"] + .12                   # the fast pull: 0.16 s
coinFlick = L["n1"]["t1"] + 1.15             # Newton's flick in the insert
coinLand = coinFlick + .25
pOpen = L["t1"]["t1"] + .25
shots = [
  [0, L["b1"]["t0"] - .12, "open"],
  [L["b1"]["t0"] - .12, L["b1"]["t1"] + .12, "boltuCU"],
  [L["b1"]["t1"] + .12, L["m2"]["t1"] + .15, "mamaCU"],
  [L["m2"]["t1"] + .15, L["b2"]["t1"] + .2, "enter"],
  [L["b2"]["t1"] + .2, L["t1"]["t0"] + .42 * (L["t1"]["t1"] - L["t1"]["t0"]), "summon"],
  [L["t1"]["t0"] + .42 * (L["t1"]["t1"] - L["t1"]["t0"]), pOpen + .35, "summonWide"],
  [pOpen + .35, L["n1"]["t0"] + .1, "portal"],
  [L["n1"]["t0"] + .1, L["n1"]["t1"] + .3, "newtonCU"],
  [L["n1"]["t1"] + .3, L["t2"]["t0"] - .05, "coin"],
  [L["t2"]["t0"] - .05, L["t3"]["t0"] - .1, "replay"],
  [L["t3"]["t0"] - .1, L["t3"]["t1"] + .2, "explain"],
  [L["t3"]["t1"] + .2, L["m3"]["t0"] - .1, "reset"],
  [L["m3"]["t0"] - .1, L["b3"]["t0"] - .1, "yank"],
  [L["b3"]["t0"] - .1, L["b3"]["t1"] + .15, "boltuWow"],
  [L["b3"]["t1"] + .15, L["t4"]["t0"] - .1, "pause"],
  [L["t4"]["t0"] - .1, VEND, "puzzle"],
  [VEND, DUR, "end"],
]
shots = [[round(a, 3), round(b, 3), n] for a, b, n in shots]
json.dump({"DUR": DUR, "VEND": round(VEND, 3), "TLX": TLX, "TRX": TRX, "TTOP": TTOP, "ps": round(ps, 3), "pd": pd, "DXM": DXM, "G": G,
           "items": land, "yank": round(yank, 3), "coinFlick": round(coinFlick, 3), "coinLand": round(coinLand, 3),
           "pOpen": round(pOpen, 3), "pClose": round(L["n1"]["t0"] - .35, 3), "nOut": [round(pOpen + .55, 3), round(pOpen + 1.35, 3)],
           "label": round(pOpen + 1.0, 3), "shots": shots}, open("cues.json", "w"), indent=1)
for s in shots: print(s)
print(land, "yank", yank, "DUR", DUR)
