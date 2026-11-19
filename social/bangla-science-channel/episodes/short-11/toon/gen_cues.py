"""Shot list + key action times for Short 11 (rust / মরিচা) -> cues.json. Run after voice_split.py."""
import json
TL = json.load(open("timeline.json")); L = {l["id"]: l for l in TL["lines"]}
VEND = TL["voice_end"]; DUR = round(VEND + 2.6, 2)
mid = lambda k, f: L[k]["t0"] + f * (L[k]["t1"] - L[k]["t0"])
flake = 0.45                                   # first rust flake falls off the dao
hide = L["m2"]["t0"] + .2                      # Mama whips the new dao behind his back
setDown = L["t1"]["t0"] + 1.2                  # Bithi sets the tray of jars on the bench
j1, j2, j3 = mid("t2", .02), mid("t2", .36), mid("t2", .74)   # she points at jar 1 / 2 / 3
lapse0 = L["t2"]["t1"] + .15                   # time-lapse starts (a few days later)
lapse1 = L["b3"]["t0"] - .05
bucket = L["m3"]["t0"] + .3                    # Mama pushes the bucket away
shots = [
  [0, L["b1"]["t0"] - .1, "open"],
  [L["b1"]["t0"] - .1, L["b1"]["t1"] + .1, "boltuQ"],
  [L["b1"]["t1"] + .1, L["m2"]["t1"] + .2, "hide"],
  [L["m2"]["t1"] + .2, L["t1"]["t0"] + .2, "enter"],
  [L["t1"]["t0"] + .2, L["t2"]["t0"] - .1, "tray"],
  [L["t2"]["t0"] - .1, lapse0, "jarCU"],
  [lapse0, lapse1, "lapse"],
  [lapse1, L["b3"]["t1"] + .2, "boltuCU"],
  [L["b3"]["t1"] + .2, L["t3"]["t1"] + .35, "board"],
  [L["t3"]["t1"] + .35, L["m3"]["t1"] + .3, "gosol"],
  [L["m3"]["t1"] + .3, L["b4"]["t0"] - .1, "pause"],
  [L["b4"]["t0"] - .1, L["b4"]["t1"] + .4, "deadpan"],
  [L["b4"]["t1"] + .4, VEND, "puzzle"],
  [VEND, DUR, "end"],
]
shots = [[round(a, 3), round(b, 3), n] for a, b, n in shots]
json.dump({"DUR": DUR, "VEND": round(VEND, 3), "flake": flake, "hide": round(hide, 3), "setDown": round(setDown, 3),
           "j1": round(j1, 3), "j2": round(j2, 3), "j3": round(j3, 3), "lapse0": round(lapse0, 3), "lapse1": round(lapse1, 3),
           "bucket": round(bucket, 3), "shots": shots}, open("cues.json", "w"), indent=1)
for s in shots: print(s)
print("DUR", DUR)
