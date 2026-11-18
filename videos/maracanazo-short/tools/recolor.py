"""Make the Foot All FC kit puppet ('fa') from the Barcelona-style parts: blue -> cream, garnet -> brick red.
Keeps the paper texture (luminance) of every pixel. Writes parts/fa_<id>.png and adds 'fa' to parts/rig.json."""
import json, os, colorsys
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rig = json.load(open(os.path.join(HERE, 'parts', 'rig.json')))
ids = sorted({v['id'] for v in rig['bar'].values()})
CREAM = np.array([237, 227, 204.]); RED = np.array([200, 70, 58.])
heads = {rig['bar'][k]['id'] for k in ('head', 'expr1', 'expr2', 'expr3')}
for i in ids:
    if i in heads:
        Image.open(os.path.join(HERE, 'parts', f'bar_{i}.png')).save(os.path.join(HERE, 'parts', f'fa_{i}.png')); continue
    im = np.asarray(Image.open(os.path.join(HERE, 'parts', f'bar_{i}.png')).convert('RGBA')).astype(float)
    rgb = im[..., :3] / 255; mx = rgb.max(-1); mn = rgb.min(-1); sat = (mx - mn) / (mx + 1e-6)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    purple = (b > g + .06) & (r > g + .06) & (sat > .2)
    blue = ((b > r + .04) & (b > g + .04) & (sat > .22)) | (purple & (b >= r))
    garnet = ((r > b + .02) & (g < r * .55) & (b < r * .75) & (sat > .3) & (mx < .8)) | (purple & (b < r))
    lum = (0.3 * r + 0.59 * g + 0.11 * b)
    out = im.copy()
    lb = lum[blue]; out[..., :3][blue] = CREAM * np.clip(lb / np.median(lb), .9, 1.05)[:, None] if blue.any() else out[..., :3][blue]
    lg = lum[garnet]; out[..., :3][garnet] = RED * np.clip(lg / np.median(lg), .85, 1.1)[:, None] if garnet.any() else out[..., :3][garnet]
    Image.fromarray(out.clip(0, 255).astype(np.uint8)).save(os.path.join(HERE, 'parts', f'fa_{i}.png'))
rig['fa'] = rig['bar']
json.dump(rig, open(os.path.join(HERE, 'parts', 'rig.json'), 'w'), indent=1)
print('fa parts', len(ids))
