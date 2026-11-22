"""Shot list + key action times for Short 13 (moon phases / চাঁদের দশা) -> cues.json. Run after voice_split.py."""
import json
TL = json.load(open("timeline.json")); L = {l["id"]: l for l in TL["lines"]}
VEND = TL["voice_end"]; DUR = round(VEND + 2.6, 2)
mid = lambda k, f: L[k]["t0"] + f * (L[k]["t1"] - L[k]["t0"])
crumb = 0.45                                   # crumbs fall from Mama's bitten biscuit
hide = L["m2"]["t0"] + .3                      # biscuit whipped behind his back
setDown = L["t1"]["t0"] + .6                   # Bithi sets the lantern on the ghat step
eclipse = mid("t1", .1)                        # eclipse inset on "পৃথিবীর ছায়া পড়লে"
sun, moon, earth, half = mid("t2", .04), mid("t2", .2), mid("t2", .36), mid("t2", .55)   # labels as she names them
spin0 = L["t2"]["t1"] - .1; spin1 = L["b3"]["t1"] + .3   # Boltu turns: crescent -> full
twirl = L["m3"]["t0"] + .9                     # Mama twirls the bitten biscuit
bite = L["b4"]["t1"] + .15                     # sheepish second bite
shots = [
  [0, L["b1"]["t0"] - .1, "open"],
  [L["b1"]["t0"] - .1, L["b1"]["t1"] + .1, "boltuQ"],
  [L["b1"]["t1"] + .1, L["m2"]["t1"] + .2, "shadow"],
  [L["m2"]["t1"] + .2, L["t1"]["t0"] + .2, "enter"],
  [L["t1"]["t0"] + .2, L["t2"]["t0"] - .1, "eclipse"],
  [L["t2"]["t0"] - .1, spin0, "setup"],
  [spin0, spin1, "spin"],
  [spin1, L["t3"]["t1"] + .35, "board"],
  [L["t3"]["t1"] + .35, L["m3"]["t1"] + .3, "twirl"],
  [L["m3"]["t1"] + .3, L["b4"]["t0"] - .1, "pause"],
  [L["b4"]["t0"] - .1, L["b4"]["t1"] + .6, "deadpan"],
  [L["b4"]["t1"] + .6, VEND, "puzzle"],
  [VEND, DUR, "end"],
]
shots = [[round(a, 3), round(b, 3), n] for a, b, n in shots]
r = lambda x: round(x, 3)
json.dump({"DUR": DUR, "VEND": r(VEND), "crumb": crumb, "hide": r(hide), "setDown": r(setDown), "eclipse": r(eclipse), "sun": r(sun), "moon": r(moon),
           "earth": r(earth), "half": r(half), "spin0": r(spin0), "spin1": r(spin1), "twirl": r(twirl), "bite": r(bite), "shots": shots}, open("cues.json", "w"), indent=1)
for s in shots: print(s)
print("DUR", DUR)
