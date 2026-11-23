"""Generic plain-colour kits from the Barcelona-style parts, role-aware (no crests, no sponsors, no numbers).
Usage: python kit.py NAME STRIPE1 STRIPE2 SHORTS SOCKS [NAME ...]  (hex colours; STRIPE1 = STRIPE2 for a plain shirt)
Shirt stripes (torso + sleeves) take STRIPE1/STRIPE2, the shorts (thighs) SHORTS, the socks (shins) SOCKS.
Keeps each pixel's paper texture (luminance). Writes parts/NAME_<id>.png and adds NAME to parts/rig.json."""
import json, os, sys
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rig = json.load(open(os.path.join(HERE, 'parts', 'rig.json')))
R = rig['bar']
heads = {R[k]['id'] for k in ('head', 'expr1', 'expr2', 'expr3')}
thighs = {R['thighL']['id'], R['thighR']['id']}; shins = {R['shinL']['id'], R['shinR']['id']}
ids = sorted({v['id'] for v in R.values()})
hx = lambda h: np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], float)
a = sys.argv[1:]
for j in range(0, len(a), 5):
    name, S1, S2, SH, SO = a[j], hx(a[j + 1]), hx(a[j + 2]), hx(a[j + 3]), hx(a[j + 4])
    for i in ids:
        src = os.path.join(HERE, 'parts', f'bar_{i}.png'); dst = os.path.join(HERE, 'parts', f'{name}_{i}.png')
        if i in heads: Image.open(src).save(dst); continue
        im = np.asarray(Image.open(src).convert('RGBA')).astype(float)
        rgb = im[..., :3] / 255; mx = rgb.max(-1); mn = rgb.min(-1); sat = (mx - mn) / (mx + 1e-6)
        r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
        purple = (b > g + .06) & (r > g + .06) & (sat > .2)
        blue = ((b > r + .04) & (b > g + .04) & (sat > .22)) | (purple & (b >= r))
        garnet = ((r > b + .02) & (g < r * .55) & (b < r * .75) & (sat > .3) & (mx < .8)) | (purple & (b < r))
        lum = 0.3 * r + 0.59 * g + 0.11 * b
        if i in thighs: pairs = ((blue | garnet, SH),)
        elif i in shins: pairs = ((blue | garnet, SO),)
        else: pairs = ((blue, S1), (garnet, S2))
        out = im.copy()
        for m, col in pairs:
            if m.any(): out[..., :3][m] = col * np.clip(lum[m] / np.median(lum[m]), .88, 1.08)[:, None]
        Image.fromarray(out.clip(0, 255).astype(np.uint8)).save(dst)
    rig[name] = R
    print(name, len(ids), 'parts')
json.dump(rig, open(os.path.join(HERE, 'parts', 'rig.json'), 'w'), indent=1)
