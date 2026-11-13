"""Export Bithi amazed (both arms up, mouth open) as a transparent PNG art layer for the Figma thumbnail."""
import json, sys
from pathlib import Path
S = Path(sys.argv[1]); out = sys.argv[2]
chars = json.loads((S / "chars/chars3.json").read_text())
UP = [128, -128, 30, -30, 0]
D = {"chars": {"bithi": chars["Bithi"]}, "bg": '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920"></svg>',
     "lines": [{"speaker": "bithi", "start": 0, "end": 5}], "mouth": "2" * 200,
     "shots": [{"start": 0, "end": 5, "cam": {"from": [0, 0, 1], "to": [0, 0, 1]}, "chars": {"bithi": [540, 1700, 1.4]},
                "mood": {"bithi": "neutral"}, "poses": {"bithi": [[0, *UP], [5, *UP]]}}], "dur": 5}
html = (S / "s4/engine.html").read_text().replace("__DATA__", json.dumps(D, ensure_ascii=False))
html = html.replace("</head>", "<style>html,body,#stage,#fade{background:transparent!important}#fade{display:none}</style></head>", 1)
(S / "s4/thumb_bithi.html").write_text(html)
