"""Shot list + key action times for Short 14 (heat conduction / তাপ পরিবহন) -> cues.json. Run after voice_split.py."""
import json
TL = json.load(open("timeline.json")); L = {l["id"]: l for l in TL["lines"]}
VEND = TL["voice_end"]; DUR = round(VEND + 2.6, 2)
mid = lambda k, f: L[k]["t0"] + f * (L[k]["t1"] - L[k]["t0"])
yank = 0.45                                    # Mama yanks his wrapped hand off the hot spoon
ladle = L["m2"]["t0"] + 1.6                    # he grips the wooden ladle bare-handed on "কাঠের হাতা ভদ্র"
wax = mid("t1", .55)                           # wax drops on the handle ends
dip = L["t1"]["t1"] - .1                       # spoons stood in the hot water
lapse0 = L["t1"]["t1"] + .2; lapse1 = L["b3"]["t0"] - .05
handle = mid("t2", .82)                        # "হাঁড়ির হাতল" on the board
fire = L["m3"]["t0"] + .8                      # Mama holds the wooden pot over the chula
smoke = L["b4"]["t1"] - .3                     # the wooden pot's bottom starts smoking; he yanks it away
shots = [
  [0, L["b1"]["t0"] - .1, "open"],
  [L["b1"]["t0"] - .1, L["b1"]["t1"] + .1, "boltuQ"],
  [L["b1"]["t1"] + .1, L["m2"]["t1"] + .2, "angry"],
  [L["m2"]["t1"] + .2, L["t1"]["t0"] + .2, "enter"],
  [L["t1"]["t0"] + .2, lapse0, "wax"],
  [lapse0, lapse1, "lapse"],
  [lapse1, L["b3"]["t1"] + .2, "boltuCU"],
  [L["b3"]["t1"] + .2, L["t2"]["t1"] + .35, "board"],
  [L["t2"]["t1"] + .35, L["m3"]["t1"] + .3, "woodpot"],
  [L["m3"]["t1"] + .3, L["b4"]["t0"] - .1, "pause"],
  [L["b4"]["t0"] - .1, L["b4"]["t1"] + .5, "deadpan"],
  [L["b4"]["t1"] + .5, VEND, "puzzle"],
  [VEND, DUR, "end"],
]
shots = [[round(a, 3), round(b, 3), n] for a, b, n in shots]
r = lambda x: round(x, 3)
json.dump({"DUR": DUR, "VEND": r(VEND), "yank": yank, "ladle": r(ladle), "wax": r(wax), "dip": r(dip), "lapse0": r(lapse0), "lapse1": r(lapse1),
           "handle": r(handle), "fire": r(fire), "smoke": r(smoke), "shots": shots}, open("cues.json", "w"), indent=1)
for s in shots: print(s)
print("DUR", DUR)
