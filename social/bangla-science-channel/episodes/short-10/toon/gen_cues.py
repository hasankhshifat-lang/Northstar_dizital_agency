"""Shot list + key action times for Short 10 (sweating glass / condensation) -> cues.json. Run after voice_split.py."""
import json
TL = json.load(open("timeline.json")); L = {l["id"]: l for l in TL["lines"]}
VEND = TL["voice_end"]; DUR = round(VEND + 2.6, 2)
mid = lambda k, f: L[k]["t0"] + f * (L[k]["t1"] - L[k]["t0"])
tape1 = 0.75                                  # Mama slaps the first tape strip on the glass
tape2 = L["m2"]["t0"] + .45                   # second strip (wraps it)
dye = L["t1"]["t1"] - .55                     # red drop leaves the bottle
dyeHit = dye + .35
glass2 = L["t4"]["t0"] - 1.1                  # Bithi sets the plain glass down
airTape = L["m3"]["t1"] - .25                 # Mama slaps tape at the air -> sticks to his moustache
sip = L["t5"]["t0"] + .9                      # Bithi sips hot tea, glasses fog
shots = [
  [0, L["b1"]["t0"] - .1, "open"],
  [L["b1"]["t0"] - .1, L["b1"]["t1"] + .1, "tapeCU"],
  [L["b1"]["t1"] + .1, L["m2"]["t1"] + .2, "mamaWrap"],
  [L["m2"]["t1"] + .2, L["t1"]["t0"] + .3, "enter"],
  [L["t1"]["t0"] + .3, dye + .05, "dyeTwo"],
  [dye + .05, mid("b3", .55), "swirl"],
  [mid("b3", .55), L["b3"]["t1"] + .2, "boltuCU"],
  [L["b3"]["t1"] + .2, mid("t2", .5), "bithiPoint"],
  [mid("t2", .5), L["t2"]["t1"] + .3, "lens"],
  [L["t2"]["t1"] + .3, L["t3"]["t1"] + .4, "board"],
  [L["t3"]["t1"] + .4, L["t4"]["t1"] + .25, "compare"],
  [L["t4"]["t1"] + .25, airTape + .5, "airTape"],
  [airTape + .5, L["t5"]["t0"] - .1, "pause"],
  [L["t5"]["t0"] - .1, VEND, "puzzle"],
  [VEND, DUR, "end"],
]
shots = [[round(a, 3), round(b, 3), n] for a, b, n in shots]
json.dump({"DUR": DUR, "VEND": round(VEND, 3), "tape1": tape1, "tape2": round(tape2, 3), "dye": round(dye, 3), "dyeHit": round(dyeHit, 3),
           "glass2": round(glass2, 3), "airTape": round(airTape, 3), "sip": round(sip, 3), "shots": shots}, open("cues.json", "w"), indent=1)
for s in shots: print(s)
print("DUR", DUR)
