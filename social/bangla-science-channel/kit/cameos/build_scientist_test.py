"""Test clip: J. C. Bose (rigged character) walks into the courtyard and explains, beside Bithi and Boltu."""
import json, sys
from pathlib import Path
S = Path(sys.argv[1]); P = S / "sci"; VO_START = float(sys.argv[2]); VO_LEN = float(sys.argv[3])
sys.path.insert(0, str(S / "s3")); sys.path.insert(0, str(P)); import art3 as X; A = X.A
from portal import portal_props
chars = json.loads((S / "chars/chars3.json").read_text()); sci = json.loads((S / "chars/scientists.json").read_text())
DUR = round(VO_START + VO_LEN + 1.2, 2)
def cam(wx, wy, s, sx=540, sy=900):
    wx = min(max(wx, sx / s), 1080 - (1080 - sx) / s); wy = min(max(wy, sy / s), 1920 - (1920 - sy) / s)
    return [round(sx - s * wx), round(sy - s * wy), s]
F = 1820
T, B, JB = [230, F, .8], [420, F, .8], [650, F, .82]
LABEL = {"svg": A.tag("জগদীশ চন্দ্র বসু (১৮৫৮–১৯৩৭)", 640, 44, "#1A1A1A", "#FFC300"), "layer": "screen", "z": 50,
         "keys": [[2.4, 540, 300, .3, 0, 0], [2.41, 540, 300, .3, 0, 1], [2.65, 540, 300, 1, 0, 1]]}
shots = [
  # wide: Bose walks in from the right, the kids turn to look
  {"start": 0, "end": 5.4, "blur": 1.0, "cam": {"from": cam(540, 1360, 1.0), "to": cam(540, 1370, 1.03)},
   "chars": {"bithi": T, "boltu": B, "jc_bose": JB}, "mood": {"bithi": "happy", "boltu": "worried", "jc_bose": "happy"},
   "appear": {"jc_bose": [1.7, 2.4]}, "walk": {"jc_bose": [[2.5, 790], [4.6, 650]]}, "turn": {"bithi": 0.7, "boltu": 0.7},
   "props": portal_props(1.0, 5.3, 790, 1450, 0.8) + [LABEL]},
  # medium: Bose explains, Bithi beside him
  {"start": 5.4, "end": DUR + 1, "blur": 1.5, "cam": {"from": cam(450, 1230, 1.3), "to": cam(470, 1220, 1.38)},
   "chars": {"bithi": T, "boltu": B, "jc_bose": JB}, "mood": {"bithi": "happy", "boltu": "happy", "jc_bose": "happy"},
   "props": [dict(LABEL, keys=[[5.4, 540, 300, 1, 0, 1], [DUR + 1, 540, 300, 1, 0, 1]])]},
]
lines = [{"speaker": "jc_bose", "start": VO_START, "end": VO_START + VO_LEN, "g": True}]
mouth = "0" * int(VO_START * 24) + json.loads((P / "mouth_vo.json").read_text())
D = {"chars": {"bithi": chars["Bithi"], "boltu": chars["Boltu"], "jc_bose": sci["jc_bose"]}, "bg": X.courtyard_bg(),
     "lines": lines, "mouth": mouth, "shots": shots, "dur": DUR}
html = (S / "s3/engine.html").read_text().replace("__DATA__", json.dumps(D, ensure_ascii=False))
html = html.replace("</head>", "<style>" + (S / "p5/fonts.css").read_text() + "</style></head>", 1)
(P / "sci.html").write_text(html, encoding="utf-8"); print("dur", DUR, "frames", int(DUR * 24))
