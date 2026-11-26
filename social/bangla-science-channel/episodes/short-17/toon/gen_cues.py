"""Shot list + key action times for Short 17 (ভাত চিবালে মিষ্টি লাগে কেন? saliva amylase / ptyalin) -> cues.json. Run after voice_split.py."""
import json
TL = json.load(open("timeline.json")); L = {l["id"]: l for l in TL["lines"]}
VEND = TL["voice_end"]; DUR = round(VEND + 1.8, 2)
pop = 0.35                                     # frame-1 event: Mama's eyes pop + ding as the rice turns sweet in his mouth
spoonB = L["b1"]["t0"] - .3                    # Boltu's spoon reaches his mouth
chew0, chew1 = L["m2"]["t1"] + .1, L["b2"]["t0"] - .05   # Boltu's long exaggerated chew ("কিছুক্ষণ পর…")
sweetB = chew1 - .45                           # sweetness hits Boltu (eyes widen)
zoom0 = L["t1"]["t1"] - .1                     # cut into the mouth diagram on "দেখো!"
enz = L["t2"]["t0"] + 2.6                      # saliva + ptyalin swim in ("মুখের লালার টায়ালিন")
cut = L["t2"]["t0"] + (L["t2"]["t1"] - L["t2"]["t0"]) * .72   # snip on "কেটে"
sugar = L["t2"]["t1"] - .5                     # pairs light up as maltose ("চিনি")
sip = L["m3"]["t1"] + .1                       # Mama sips the tea
shots = [
  [0, L["b1"]["t0"] - .55, "open"],
  [L["b1"]["t0"] - .55, L["m2"]["t0"] - .1, "boltuQ"],
  [L["m2"]["t0"] - .1, chew0, "order"],
  [chew0, L["b2"]["t0"] + 1.4, "chew"],
  [L["b2"]["t0"] + 1.4, L["t1"]["t0"] - .1, "turn"],
  [L["t1"]["t0"] - .1, zoom0, "enter"],
  [zoom0, L["t3"]["t0"] - .1, "mouth"],
  [L["t3"]["t0"] - .1, L["t3"]["t1"] + .3, "path"],
  [L["t3"]["t1"] + .3, sip + .35, "tea"],
  [sip + .35, L["m4"]["t0"] - .05, "pause"],
  [L["m4"]["t0"] - .05, L["t4"]["t0"] - .05, "deadpan"],
  [L["t4"]["t0"] - .05, VEND, "puzzle"],
  [VEND, DUR, "end"],
]
r = lambda x: round(x, 3)
shots = [[r(a), r(b), n] for a, b, n in shots]
json.dump({"DUR": DUR, "VEND": r(VEND), "pop": pop, "spoonB": r(spoonB), "chew0": r(chew0), "chew1": r(chew1), "sweetB": r(sweetB),
           "zoom0": r(zoom0), "enz": r(enz), "cut": r(cut), "sugar": r(sugar), "sip": r(sip), "shots": shots}, open("cues.json", "w"), indent=1)
for s in shots: print(s)
print("DUR", DUR)
