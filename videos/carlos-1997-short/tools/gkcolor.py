"""Recolour the generic yellow keeper (parts gk_*) into a plain colour: python gkcolor.py NAME HEX. Heads untouched.
Writes parts/NAME_<id>.png and adds NAME to parts/rig.json (same rig as gk)."""
import json, os, sys
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rig = json.load(open(os.path.join(HERE, 'parts', 'rig.json'))); R = rig['gk']
heads = {R[k]['id'] for k in ('head', 'expr1', 'expr2', 'expr3')}
name, hexc = sys.argv[1], sys.argv[2]; col = np.array([int(hexc[i:i + 2], 16) for i in (1, 3, 5)], float)
for i in sorted({v['id'] for v in R.values()}):
    src = os.path.join(HERE, 'parts', f'gk_{i}.png'); dst = os.path.join(HERE, 'parts', f'{name}_{i}.png')
    if i in heads: Image.open(src).save(dst); continue
    im = np.asarray(Image.open(src).convert('RGBA')).astype(float); rgb = im[..., :3] / 255
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    m = (r > .55) & (g > .45) & (b < r * .6) & (g > r * .7)
    lum = .3 * r + .59 * g + .11 * b
    out = im.copy()
    if m.any(): out[..., :3][m] = col * np.clip(lum[m] / np.median(lum[m]), .85, 1.1)[:, None]
    Image.fromarray(out.clip(0, 255).astype(np.uint8)).save(dst)
rig[name] = R; json.dump(rig, open(os.path.join(HERE, 'parts', 'rig.json'), 'w'), indent=1); print(name, 'ok')
