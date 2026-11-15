"""Textures and the table layout for an episode. usage: python -I tools/prep.py <episode_dir>
Reads episode.json "items": [{id, kind: paper|negative|print, src (path in the episode folder), crop: [x0,y0,x1,y1] (optional,
source px), inches (true width; defaults: paper 17, negative 7, print 8), horizon (photo: source row of the horizon), ...}]
Writes assets/tex/<id>.png (R = grey, G = mask: glass / paper present) and assets/tex/items.json:
{items: {id: {size: [w,h] texture px, s: texture px per source px, crop, k: world per texture px, c: [x,y] world, rDeg}}, table}
World units: 571.4 per inch (a 7-inch plate is 4000). Items are laid out in reading order on a loose grid, slightly turned."""
import sys, os, json, random
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi
Image.MAX_IMAGE_PIXELS = None
D = sys.argv[1]; EP = json.load(open(os.path.join(D, 'episode.json')))
OUT = os.path.join(D, 'assets', 'tex'); os.makedirs(OUT, exist_ok=True)
PPI = 4000 / 7; MAXW = {'paper': 3000, 'negative': 3000, 'print': 2600}
DEF_IN = {'paper': 17, 'negative': 7, 'print': 8}

def emulsion_mask(img, s=4):
    W, H = img.size
    small = np.asarray(img.resize((max(1, W // s), max(1, H // s)), Image.BILINEAR)).astype(np.float32)
    white = small > 228
    white[:3, :] = white[-3:, :] = True; white[:, :3] = white[:, -3:] = True
    lab, _ = ndi.label(white)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    outside = np.isin(lab, list(border))
    return Image.fromarray(np.where(outside, 0, 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2)).resize((W, H), Image.BILINEAR)

items, rnd = {}, random.Random(EP.get('seed', 7))
for e in EP['items']:
    im = Image.open(os.path.join(D, e['src'])).convert('L')
    crop = e.get('crop') or [0, 0, im.size[0], im.size[1]]
    im = im.crop(tuple(crop))
    s = min(1.0, MAXW[e['kind']] / im.size[0])
    if s < 1: im = im.resize((round(im.size[0] * s), round(im.size[1] * s)), Image.LANCZOS)
    if e.get('autolevel'):
        a = np.asarray(im).astype(float); lo, hi = np.percentile(a, [1, 99.5]); im = Image.fromarray(np.clip((a - lo) / max(1, hi - lo) * 255, 0, 255).astype(np.uint8))
    mask = emulsion_mask(im) if e['kind'] in ('negative', 'print') and not e.get('nomask') else Image.new('L', im.size, 255)
    rgb = Image.merge('RGB', (im, mask, Image.new('L', im.size, 0)))
    rgb.save(os.path.join(OUT, e['id'] + '.png'), optimize=False)
    inches = e.get('inches', DEF_IN[e['kind']])
    items[e['id']] = {'size': list(im.size), 's': s, 'crop': crop, 'k': inches * PPI / im.size[0]}
    if 'horizon' in e: items[e['id']]['horizon'] = (e['horizon'] - crop[1]) * s
    print(e['id'], im.size, 'k=%.2f' % items[e['id']]['k'])

# layout: rows in episode order, row width ~ 2.6 broadsheets, gaps of ~1 inch
order = [e['id'] for e in EP['items']]
gap = 1.2 * PPI
area = sum(it['size'][0] * it['k'] * (it['size'][1] * it['k']) for it in items.values())
rowW = max(17 * PPI * 2.2, (area * 1.9) ** 0.5 * 1.25)          # table close to 16:9 once the gaps are in
x = y = 0; rowH = 0; placed = []
for iid in order:
    it = items[iid]; w, h = it['size'][0] * it['k'], it['size'][1] * it['k']
    if x > 0 and x + w > rowW: x = 0; y += rowH + gap; rowH = 0
    it['c'] = [x + w / 2 + rnd.uniform(-0.3, 0.3) * PPI, y + h / 2 + rnd.uniform(-0.3, 0.3) * PPI]
    it['rDeg'] = rnd.uniform(-3.2, 3.2)
    x += w + gap; rowH = max(rowH, h); placed.append((it['c'], w, h))
xs = [c[0] - w / 2 for c, w, h in placed] + [c[0] + w / 2 for c, w, h in placed]
ys = [c[1] - h / 2 for c, w, h in placed] + [c[1] + h / 2 for c, w, h in placed]
m = 2.2 * PPI
table = {'lo': [min(xs) - m, min(ys) - m], 'hi': [max(xs) + m, max(ys) + m]}
table['c'] = [(table['lo'][0] + table['hi'][0]) / 2, (table['lo'][1] + table['hi'][1]) / 2]
json.dump({'items': items, 'table': table}, open(os.path.join(OUT, 'items.json'), 'w'), indent=1)
print('table', [round(v) for v in table['lo'] + table['hi']])
