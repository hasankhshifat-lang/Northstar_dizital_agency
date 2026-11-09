"""Cut a portrait off its plain studio background: background-coloured regions touching the border become transparent."""
import sys, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
src, dst = sys.argv[1], sys.argv[2]; thr = float(sys.argv[3]) if len(sys.argv) > 3 else 16
im = np.asarray(Image.open(src).convert("RGB")).astype(float)
h, w, _ = im.shape
edge = np.concatenate([im[0], im[-1], im[:, 0], im[:, -1]])
bg = np.median(edge, axis=0)
dist = np.sqrt(((im - bg) ** 2).sum(-1))
# smooth background gradients: compare with a blurred background estimate per row
like = dist < thr
lab, n = ndimage.label(like)
border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
bgmask = np.isin(lab, list(border))
bgmask = ndimage.binary_opening(bgmask, iterations=2)
fg = ~bgmask
lab2, n2 = ndimage.label(fg)                      # keep only the person: the largest foreground piece
if n2 > 1:
    sizes = ndimage.sum(fg, lab2, range(1, n2 + 1)); fg = lab2 == (1 + int(np.argmax(sizes)))
fg = ndimage.binary_fill_holes(fg)
bgmask = ~fg
alpha = (~bgmask).astype(np.uint8) * 255
a = Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(1.6))
out = Image.open(src).convert("RGBA"); out.putalpha(a)
out.crop(out.getbbox()).save(dst)
print(dst, "bg", bg.round(), "removed %.0f%%" % (100 * bgmask.mean()))
