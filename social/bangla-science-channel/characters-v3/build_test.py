"""Build the v3 puppet motion test (13.6 s from Pilot 1, lines 4-5)."""
import json, sys
from pathlib import Path
S = Path(sys.argv[1]); sys.path.insert(0, str(S / "anim")); import ghat_bg
T0, DUR = 18.3, 13.6
c = json.loads((S / "chars/chars3.json").read_text())
tl = json.loads((S / "vo/timeline.json").read_text())
env = json.loads((S / "anim/mouth_env.json").read_text())
spk = {"mama": "mama", "tuni": "bithi", "boltu": "boltu"}
lines = [{"speaker": spk[l["speaker"]], "start": round(l["start"] - T0, 3), "end": round(l["end"] - T0, 3)}
         for l in tl["lines"] if l["end"] > T0 and l["start"] < T0 + DUR]
f0 = round(T0 * 24)
shots = [
 {"start": 0, "end": 4.2, "blur": 3, "cam": {"from": [-470, -725, 1.5], "to": [-560, -820, 1.6]},
  "chars": {"mama": [360, 1880, 1.2], "boltu": [700, 1850, 1.25]}, "mood": {"mama": "worried", "boltu": "happy"}},
 {"start": 4.2, "end": 8.7, "blur": 6, "cam": {"from": [-540, -790, 2.0], "to": [-621, -906, 2.15]},
  "chars": {"bithi": [540, 1880, 1.3]}, "mood": {"bithi": "neutral"}},
 {"start": 8.7, "end": DUR + 1, "blur": 2, "cam": {"from": [-104, -272, 1.25], "to": [-155, -358, 1.35]},
  "chars": {"mama": [330, 1900, 1.2], "bithi": [720, 1880, 1.2]}, "mood": {"mama": "worried", "bithi": "neutral"}},
]
D = {"chars": {"mama": c["Montu Mama"], "bithi": c["Bithi"], "boltu": c["Boltu"]}, "bg": ghat_bg.ghat_svg(),
     "lines": lines, "mouth": env[f0:f0 + int(DUR * 24) + 24], "shots": shots, "dur": DUR}
html = (S / "v3/puppet.html").read_text().replace("__DATA__", json.dumps(D))
(S / "v3/test.html").write_text(html); print("lines", lines)
