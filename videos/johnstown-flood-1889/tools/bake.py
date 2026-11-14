"""Bake the low sun's terrain shadows into textures (no shadow maps at render time: nothing shimmers in flight).
Sun from the west-south-west, about 20 degrees up. Heights as the page draws them: (m - H0) / 1000 * EX.
usage (library root): .venv/bin/python -I <project>/tools/bake.py <project>
"""
import sys, os, json, math
import numpy as np
from PIL import Image
from scipy import ndimage

D = sys.argv[1]; A = os.path.join(D, 'assets')
EX, H0 = 2.0, 360.0
SUN = np.array([-150.0, 59.0, 60.0])             # world: x east, y up, z south
hor = math.hypot(SUN[0], SUN[2]); TAN = SUN[1] / hor
dx, dz = SUN[0] / hor, SUN[2] / hor


def bake(hfile, mfile, out, up=2, reach=8.0):
    m = json.load(open(os.path.join(A, mfile)))
    GW, GH = m['GW'], m['GH']
    y = (np.fromfile(os.path.join(A, hfile), '<f4').reshape(GH, GW) - H0) / 1000 * EX
    if up > 1: y = ndimage.zoom(y, up, order=1)
    H, Wd = y.shape
    kx = m['width_km'] / (Wd - 1); kz = m['height_km'] / (H - 1)
    step = min(kx, kz) * .75
    R, C = np.mgrid[0:H, 0:Wd].astype(np.float32)
    occ = np.zeros_like(y); d = step
    while d < reach:
        hs = ndimage.map_coordinates(y, [R + dz * d / kz, C + dx * d / kx], order=1, mode='nearest')
        occ = np.maximum(occ, (hs - (y + d * TAN)) / (.004 + d * .04))
        d += step * (1 + d / 4)
    lit = np.clip(1 - occ, 0, 1); lit = lit * lit * (3 - 2 * lit)
    Image.fromarray((lit * 255 + .5).astype(np.uint8)).save(os.path.join(A, out))
    print(out, Wd, H, 'shadowed', round(float((lit < .5).mean()), 3))


bake('height.bin', 'meta.json', 'shadow.png', up=2, reach=6)
bake('wide_height.bin', 'wide_meta.json', 'wide_shadow.png', up=2, reach=20)
