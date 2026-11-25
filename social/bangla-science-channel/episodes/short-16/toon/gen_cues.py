"""Shot list + key action times for Short 16 (rainbow / রংধনু, Newton cameo) -> cues.json. Run after voice_split.py."""
import json
TL = json.load(open("timeline.json")); L = {l["id"]: l for l in TL["lines"]}
VEND = TL["voice_end"]; DUR = round(VEND + 1.8, 2)
splash = 0.3                                   # Mama's foot hits the puddle (frame-1 event)
run0, run1 = L["m2"]["t0"] - .55, L["m2"]["t0"] + 1.6   # Mama runs along the aal; the rainbow keeps its place ahead of him
spray = L["t1"]["t1"] - .55                    # Bithi tips the watering can (on "দেখো!")
bow = spray + .45                              # the small rainbow appears in the spray
pOpen = L["t2"]["t1"] + .2                     # portal opens after "…নেমে আসুন!"
nOut = [pOpen + .45, pOpen + 1.25]; pClose = pOpen + 1.45; label = nOut[1] - .2
beam = L["n1"]["t0"] + .5                      # sunlight hits Newton's prism
fan = L["n1"]["t0"] + (L["n1"]["t1"] - L["n1"]["t0"]) * .55   # the colours spread ("আলাদা হয়ে যায়")
grab = L["m4"]["t0"] + .35                     # Mama snatches the prism
inSack = L["m4"]["t0"] + 1.5                   # prism drops into the sack
shots = [
  [0, run0, "open"],
  [run0, L["b1"]["t0"] - .1, "chase"],
  [L["b1"]["t0"] - .1, L["b2"]["t0"] - .1, "boltuQ"],
  [L["b2"]["t0"] - .1, L["t1"]["t0"] + .1, "enter"],
  [L["t1"]["t0"] + .1, L["b3"]["t0"] - .05, "spray"],
  [L["b3"]["t0"] - .05, L["b3"]["t1"] + .15, "boltuCU"],
  [L["b3"]["t1"] + .15, L["t2"]["t0"] + .4 * (L["t2"]["t1"] - L["t2"]["t0"]), "summon"],
  [L["t2"]["t0"] + .4 * (L["t2"]["t1"] - L["t2"]["t0"]), pOpen + .3, "summonWide"],
  [pOpen + .3, L["n1"]["t0"] + .05, "portal"],
  [L["n1"]["t0"] + .05, L["n1"]["t1"] + .25, "prism"],
  [L["n1"]["t1"] + .25, L["t3"]["t1"] + .25, "drop"],
  [L["t3"]["t1"] + .25, L["m4"]["t1"] + .3, "grab"],
  [L["m4"]["t1"] + .3, L["b4"]["t0"] - .1, "pause"],
  [L["b4"]["t0"] - .1, L["b4"]["t1"] + .3, "deadpan"],
  [L["b4"]["t1"] + .3, VEND, "puzzle"],
  [VEND, DUR, "end"],
]
r = lambda x: round(x, 3)
shots = [[r(a), r(b), n] for a, b, n in shots]
json.dump({"DUR": DUR, "VEND": r(VEND), "splash": splash, "run0": r(run0), "run1": r(run1), "spray": r(spray), "bow": r(bow),
           "pOpen": r(pOpen), "nOut": [r(x) for x in nOut], "pClose": r(pClose), "label": r(label), "beam": r(beam), "fan": r(fan),
           "grab": r(grab), "inSack": r(inSack), "shots": shots}, open("cues.json", "w"), indent=1)
for s in shots: print(s)
print("DUR", DUR)
