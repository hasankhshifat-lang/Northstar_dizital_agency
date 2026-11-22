"""Shot list + key action times for Short 12 (clay kolshi / evaporative cooling) -> cues.json. Run after voice_split.py."""
import json
TL = json.load(open("timeline.json")); L = {l["id"]: l for l in TL["lines"]}
VEND = TL["voice_end"]; DUR = round(VEND + 2.6, 2)
mid = lambda k, f: L[k]["t0"] + f * (L[k]["t1"] - L[k]["t0"])
drip = 0.45                                    # a cold bead rolls down the kolshi
pat = L["m2"]["t0"] + 1.2                      # Mama pats the kolshi on "ফ্রিজ"
setDown = L["t1"]["t0"] + .4                   # Bithi sets the jug on the stand
magUp = mid("t1", .45)                         # magnifier up on "দেখো"
lapse0 = L["t2"]["t1"] + .15; lapse1 = L["b3"]["t0"] - .05
tapJug = L["t3"]["t0"] + .2                    # she taps the jug: no pores
sweatT = mid("t3", .5)                         # "ঘাম শুকালে": Boltu's sweat drop evaporates
pour = L["m3"]["t0"] + .9                      # Mama pours the mug over his head
shots = [
  [0, L["b1"]["t0"] - .1, "open"],
  [L["b1"]["t0"] - .1, L["b1"]["t1"] + .1, "boltuQ"],
  [L["b1"]["t1"] + .1, L["m2"]["t1"] + .2, "fridge"],
  [L["m2"]["t1"] + .2, L["t1"]["t0"] + .2, "enter"],
  [L["t1"]["t0"] + .2, L["t2"]["t0"] - .1, "pores"],
  [L["t2"]["t0"] - .1, lapse0, "board"],
  [lapse0, lapse1, "lapse"],
  [lapse1, L["b3"]["t1"] + .2, "boltuCU"],
  [L["b3"]["t1"] + .2, L["t3"]["t1"] + .35, "sweat"],
  [L["t3"]["t1"] + .35, L["m3"]["t1"] + .3, "gosol"],
  [L["m3"]["t1"] + .3, L["b4"]["t0"] - .1, "pause"],
  [L["b4"]["t0"] - .1, L["b4"]["t1"] + .4, "deadpan"],
  [L["b4"]["t1"] + .4, VEND, "puzzle"],
  [VEND, DUR, "end"],
]
shots = [[round(a, 3), round(b, 3), n] for a, b, n in shots]
r = lambda x: round(x, 3)
json.dump({"DUR": DUR, "VEND": r(VEND), "drip": drip, "pat": r(pat), "setDown": r(setDown), "magUp": r(magUp), "lapse0": r(lapse0), "lapse1": r(lapse1),
           "tapJug": r(tapJug), "sweatT": r(sweatT), "pour": r(pour), "shots": shots}, open("cues.json", "w"), indent=1)
for s in shots: print(s)
print("DUR", DUR)
