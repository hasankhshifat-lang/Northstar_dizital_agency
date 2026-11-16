#!/usr/bin/env python3
"""Cut a subject out of a photo for a thumbnail.

Usage: python3 cutout.py in.jpg out.png [--max 1600] [--model isnet-general-use]
Writes out.png (transparent, trimmed to the subject) and out_check.jpg (the cutout on red, to inspect the edges).
Installs rembg + onnxruntime on first use; the model (~180 MB) downloads to ~/.u2net once per container.
"""
import argparse, subprocess, sys

try:
    from rembg import remove, new_session
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "rembg", "onnxruntime"])
    from rembg import remove, new_session
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument("src"); ap.add_argument("dst")
ap.add_argument("--max", type=int, default=1600, help="longest side before cutting (larger is slower)")
ap.add_argument("--model", default="isnet-general-use")
a = ap.parse_args()

im = Image.open(a.src).convert("RGB")
im.thumbnail((a.max, a.max))
cut = remove(im, session=new_session(a.model), alpha_matting=True)
box = cut.split()[-1].getbbox()
if box:
    cut = cut.crop(box)
cut.save(a.dst, optimize=True)
chk = Image.new("RGBA", cut.size, (200, 40, 40, 255)); chk.alpha_composite(cut)
chk.convert("RGB").save(a.dst.rsplit(".", 1)[0] + "_check.jpg", quality=88)
print({"out": a.dst, "size": cut.size})
