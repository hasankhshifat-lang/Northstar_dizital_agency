"""Shot list + key action times for Short 15 (echo / প্রতিধ্বনি) -> cues.json. Run after voice_split.py."""
import json
TL = json.load(open("timeline.json")); L = {l["id"]: l for l in TL["lines"]}
VEND = TL["voice_end"]; DUR = round(VEND + 2.6, 2)
ECHO = 0.4                                     # echo delay used everywhere (the far wall of a big courtyard)
echo1 = L["m1"]["t1"] + ECHO - .55             # the echo of "কে ওখানে?!" starts coming back (audio copy at m1.t0 + ECHO + ...)
echo1 = round(L["m1"]["t0"] + ECHO + .3, 3)    # visual: the words "…ওখানে?" drift back when the echoed "ওখানে" is heard
clap = L["t1"]["t1"] + .25                     # Bithi claps once
echoClap = clap + ECHO * 1.25                  # the clap comes back (visual ring and audio)
sing0 = L["m4"]["t1"] - 1.45                   # "আ-আ-আ-আ" starts
shots = [
  [0, L["m2"]["t0"] - .1, "open"],
  [L["m2"]["t0"] - .1, L["b1"]["t0"] - .1, "hide"],
  [L["b1"]["t0"] - .1, L["b1"]["t1"] + .1, "boltuQ"],
  [L["b1"]["t1"] + .1, L["m3"]["t1"] + .2, "broom"],
  [L["m3"]["t1"] + .2, L["t1"]["t0"] + .2, "enter"],
  [L["t1"]["t0"] + .2, L["b3"]["t0"] - .05, "clap"],
  [L["b3"]["t0"] - .05, L["b3"]["t1"] + .2, "boltuCU"],
  [L["b3"]["t1"] + .2, L["t2"]["t1"] + .35, "board"],
  [L["t2"]["t1"] + .35, L["m4"]["t1"] + 1.2, "sing"],
  [L["m4"]["t1"] + 1.2, L["b4"]["t0"] - .1, "pause"],
  [L["b4"]["t0"] - .1, L["b4"]["t1"] + .5, "deadpan"],
  [L["b4"]["t1"] + .5, VEND, "puzzle"],
  [VEND, DUR, "end"],
]
r = lambda x: round(x, 3)
shots = [[r(a), r(b), n] for a, b, n in shots]
json.dump({"DUR": DUR, "VEND": r(VEND), "ECHO": ECHO, "echo1": r(echo1), "clap": r(clap), "echoClap": r(echoClap), "sing0": r(sing0), "shots": shots}, open("cues.json", "w"), indent=1)
for s in shots: print(s)
print("DUR", DUR, "clap", r(clap), "sing0", r(sing0))
