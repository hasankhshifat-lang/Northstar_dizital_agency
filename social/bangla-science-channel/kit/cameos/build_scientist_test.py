"""Test clip: J. C. Bose (rigged character) walks into the courtyard and explains, beside Bithi and Boltu."""
import json, sys
from pathlib import Path
S = Path(sys.argv[1]); P = S / "sci"; VO_START = float(sys.argv[2]); VO_LEN = float(sys.argv[3])
sys.path.insert(0, str(S / "s3")); import art3 as X; A = X.A
chars = json.loads((S / "chars/chars3.json").read_text()); sci = json.loads((S / "chars/scientists.json").read_text())
DUR = round(VO_START + VO_LEN + 1.2, 2)
def cam(wx, wy, s, sx=540, sy=900):
    wx = min(max(wx, sx / s), 1080 - (1080 - sx) / s); wy = min(max(wy, sy / s), 1920 - (1920 - sy) / s)
    return [round(sx - s * wx), round(sy - s * wy), s]
F = 1820
T, B, JB = [330, F, .8], [540, F, .8], [800, F, .82]
shots = [
  # wide: Bose walks in from the right, the kids turn to look
  {"start": 0, "end": 4.4, "blur": 1.0, "cam": {"from": cam(600, 1360, 1.0), "to": cam(600, 1370, 1.04)},
   "chars": {"bithi": T, "boltu": B, "jc_bose": JB}, "mood": {"bithi": "happy", "boltu": "neutral", "jc_bose": "happy"},
   "walk": {"jc_bose": [[0.2, 1260], [4.0, 800]]}, "turn": {"bithi": 0.7, "boltu": 0.7}},
  # medium: Bose explains, Bithi beside him
  {"start": 4.4, "end": DUR + 1, "blur": 1.5, "cam": {"from": cam(590, 1230, 1.3), "to": cam(610, 1220, 1.38)},
   "chars": {"bithi": T, "boltu": B, "jc_bose": JB}, "mood": {"bithi": "happy", "boltu": "happy", "jc_bose": "happy"},
   "props": [{"svg": A.tag("জগদীশ চন্দ্র বসু · নাট্যরূপ", 640, 44, "#1A1A1A", "#FFC300"), "layer": "screen", "z": 50,
              "keys": [[4.5, 540, 300, .3, 0, 0], [4.51, 540, 300, .3, 0, 1], [4.75, 540, 300, 1, 0, 1]]}]},
]
lines = [{"speaker": "jc_bose", "start": VO_START, "end": VO_START + VO_LEN, "g": True}]
mouth = "0" * int(VO_START * 24) + json.loads((P / "mouth_vo.json").read_text())
D = {"chars": {"bithi": chars["Bithi"], "boltu": chars["Boltu"], "jc_bose": sci["jc_bose"]}, "bg": X.courtyard_bg(),
     "lines": lines, "mouth": mouth, "shots": shots, "dur": DUR}
html = (S / "s3/engine.html").read_text().replace("__DATA__", json.dumps(D, ensure_ascii=False))
html = html.replace("</head>", "<style>" + (S / "p5/fonts.css").read_text() + "</style></head>", 1)
(P / "sci.html").write_text(html, encoding="utf-8"); print("dur", DUR, "frames", int(DUR * 24))
