"""Trace assets/logo.png into three SVGs (N mark, star, wordmark) for the Blender logo reveal.
python3 social/3d/logo_reveal/trace_logo.py
"""
import os
import numpy as np
import potrace
from PIL import Image
from scipy import ndimage

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "..", "..", "..", "assets", "logo.png")
SCALE = 6

im = Image.open(SRC).convert("RGBA")
im = im.resize((im.width * SCALE, im.height * SCALE), Image.LANCZOS)
a = np.asarray(im).astype(float)
alpha = a[..., 3] > 128
purple = alpha & (a[..., 2] - a[..., 1] > 60)        # #9566FF-ish
light = alpha & ~purple

lab, n = ndimage.label(purple)
sizes = ndimage.sum(purple, lab, range(1, n + 1))
boxes = ndimage.find_objects(lab)
# the star is the purple component whose top edge is at the very top of the image
star_id = min(range(n), key=lambda i: boxes[i][0].start) + 1
star = lab == star_id
mark = purple & ~star
print("purple components:", n, "sizes:", sizes.astype(int).tolist())

H = im.height

def path_d(mask):
    bm = potrace.Bitmap(~mask)  # potracer fills the False pixels, so invert
    path = bm.trace(turdsize=20, alphamax=1.0, opticurve=True, opttolerance=0.2)
    d = []
    for c in path:
        s = c.start_point
        d.append(f"M{s.x:.2f},{s.y:.2f}")
        for seg in c.segments:
            if seg.is_corner:
                d.append(f"L{seg.c.x:.2f},{seg.c.y:.2f}L{seg.end_point.x:.2f},{seg.end_point.y:.2f}")
            else:
                d.append(f"C{seg.c1.x:.2f},{seg.c1.y:.2f} {seg.c2.x:.2f},{seg.c2.y:.2f} {seg.end_point.x:.2f},{seg.end_point.y:.2f}")
        d.append("Z")
    return "".join(d)


def to_svg(mask, name, split=False):
    """split=True writes one <path> per connected shape (letter), left to right."""
    parts = [mask]
    if split:
        lab, n = ndimage.label(mask)
        objs = ndimage.find_objects(lab)
        order = sorted(range(n), key=lambda i: objs[i][1].start)
        parts = [lab == i + 1 for i in order]
    paths = "".join(f'<path id="p{i:02d}" fill="#000" fill-rule="evenodd" d="{path_d(m)}"/>'
                    for i, m in enumerate(parts))
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{im.width}" height="{H}" '
           f'viewBox="0 0 {im.width} {H}">{paths}</svg>')
    out = os.path.join(ROOT, name)
    open(out, "w").write(svg)
    print("wrote", out, len(parts), "paths")

to_svg(mark, "logo_mark.svg")
to_svg(star, "logo_star.svg")
to_svg(light, "logo_word.svg", split=True)
