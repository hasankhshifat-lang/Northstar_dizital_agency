"""Scientist cameos for Scientific Bithi: a hyperrealistic cut-out portrait (made in Figma) plus a Bangla name plate.

Use as an engine prop on the screen layer, e.g.
    from cameo import cameo
    prop(cameo("jc_bose"), pop(t0, 760, 1250, 1, t1=t1), layer="screen", z=40)
The scientist speaks with their own ElevenLabs voice (never a clone of the real person). The label shows
only the name and life years (label()).
"""
import base64, sys
from pathlib import Path
from PIL import Image
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "p5"))
import art as A

SCIENTISTS = {   # key: (Bangla name, life years for the label)
    "jc_bose":     ("জগদীশ চন্দ্র বসু", "১৮৫৮–১৯৩৭"),
    "newton":      ("আইজ্যাক নিউটন", "১৬৪৩–১৭২৭"),
    "einstein":    ("আলবার্ট আইনস্টাইন", "১৮৭৯–১৯৫৫"),
    "marie_curie": ("মেরি কুরি", "১৮৬৭–১৯৩৪"),
    "archimedes":  ("আর্কিমিডিস", "খ্রিস্টপূর্ব ২৮৭–২১২"),
}

def label_text(key):
    """The on-screen label: only the name and the birth and death years, e.g. "জগদীশ চন্দ্র বসু (১৮৫৮–১৯৩৭)"."""
    name, years = SCIENTISTS[key]
    return f"{name} ({years})"

def label(key, width=None, fs=44):
    """Label prop SVG (dark tag, gold text) for when the scientist appears."""
    txt = label_text(key)
    return A.tag(txt, width or max(420, int(fs * 0.62 * len(txt)) + 80), fs, "#1A1A1A", "#FFC300")

def cameo(key, width=560):
    """SVG: portrait (fixed width) with the name plate overlapping its lower edge."""
    name, years = SCIENTISTS[key]
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
            + A.T(width / 2, py + 98, 28, years, "#FFFFFF", "Hind"))
    return A.svg(width, h + 90, body)
