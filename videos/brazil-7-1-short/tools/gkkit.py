"""Recolour the goalkeeper puppet's yellow jersey/socks to a generic colour. Usage: python gkkit.py NAME HEX [NAME HEX ...]"""
import json, os, sys
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rig = json.load(open(os.path.join(HERE, 'parts', 'rig.json')))
ids = sorted({v['id'] for v in rig['gk'].values()})
heads = {rig['gk'][k]['id'] for k in ('head', 'expr1', 'expr2', 'expr3')}
a = sys.argv[1:]
for j in range(0, len(a), 2):
    name, h = a[j], a[j + 1]; col = np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], float)
    for i in ids:
        src = os.path.join(HERE, 'parts', f'gk_{i}.png'); dst = os.path.join(HERE, 'parts', f'{name}_{i}.png')
        if i in heads: Image.open(src).save(dst); continue
        im = np.asarray(Image.open(src).convert('RGBA')).astype(float)
        rgb = im[..., :3] / 255; mx = rgb.max(-1); mn = rgb.min(-1); sat = (mx - mn) / (mx + 1e-6)
        r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
        yel = (r > .5) & (g > .42) & (b < g * .7) & (sat > .4) & (abs(r - g) < .28)
        lum = 0.3 * r + 0.59 * g + 0.11 * b
        out = im.copy()
        if yel.any(): out[..., :3][yel] = col * np.clip(lum[yel] / np.median(lum[yel]), .85, 1.1)[:, None]
        Image.fromarray(out.clip(0, 255).astype(np.uint8)).save(dst)
    rig[name] = rig['gk']; print(name)
json.dump(rig, open(os.path.join(HERE, 'parts', 'rig.json'), 'w'), indent=1)
