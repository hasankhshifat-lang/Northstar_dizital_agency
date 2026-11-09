"""Scientist cameos for Scientific Bithi: a hyperrealistic cut-out portrait (made in Figma) plus a Bangla name plate.

Use as an engine prop on the screen layer, e.g.
    from cameo import cameo
    prop(cameo("jc_bose"), pop(t0, 760, 1250, 1, t1=t1), layer="screen", z=40)
The cameo speaks with its own ElevenLabs voice (never a clone of the real person) and shows the
"নাট্যরূপ" (dramatization) note on the plate.
"""
import base64, sys
from pathlib import Path
from PIL import Image
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "p5"))
import art as A

SCIENTISTS = {
    "jc_bose":     ("জগদীশ চন্দ্র বসু", "উদ্ভিদের সাড়া · বেতার তরঙ্গ"),
    "newton":      ("আইজ্যাক নিউটন", "গতির সূত্র · মহাকর্ষ"),
    "einstein":    ("আলবার্ট আইনস্টাইন", "আপেক্ষিকতা · আলোক-তড়িৎ ক্রিয়া"),
    "marie_curie": ("মেরি কুরি", "তেজস্ক্রিয়তা"),
}

def cameo(key, width=560):
    """SVG: portrait (fixed width) with the name plate overlapping its lower edge."""
    name, field = SCIENTISTS[key]
    png = HERE / f"{key}.png"
    w0, h0 = Image.open(png).size
    h = round(width * h0 / w0)
    data = base64.b64encode(png.read_bytes()).decode()
    plate_w = max(380, 46 * len(name) // 2 + 120)
    py = h - 40
    body = (f'<image href="data:image/png;base64,{data}" x="0" y="0" width="{width}" height="{h}"/>'
            f'<rect x="{(width - plate_w) / 2 + 6}" y="{py + 8}" width="{plate_w}" height="118" rx="18" fill="#000" opacity=".25"/>'
            f'<rect x="{(width - plate_w) / 2}" y="{py}" width="{plate_w}" height="118" rx="18" fill="#1A1A1A"/>'
            + A.T(width / 2, py + 52, 44, name, "#FFC300", "Baloo")
            + A.T(width / 2, py + 98, 28, field + " · নাট্যরূপ", "#FFFFFF", "Hind"))
    return A.svg(width, h + 90, body)
