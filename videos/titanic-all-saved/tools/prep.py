"""Textures for the page from the archive scans in raw/ (see FACTS.md). usage: python -I tools/prep.py <film_dir>
  union.jpg, tribune.jpg, medford.jpg      newspaper pages (Chronicling America, 50% IIIF), grey
  n_news / n_crowd / n_boats / n_surv      Bain glass negatives (LoC masters), 4000 px wide, + emulsion masks
"""
import sys, os, json
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi
Image.MAX_IMAGE_PIXELS = None
D = sys.argv[1]; OUT = os.path.join(D, 'assets', 'tex'); os.makedirs(OUT, exist_ok=True)

def emulsion_mask(img, s=4):
    W, H = img.size
    small = np.asarray(img.resize((W // s, H // s), Image.BILINEAR)).astype(np.float32)
    white = small > 228
    white[:3, :] = white[-3:, :] = True; white[:, :3] = white[:, -3:] = True
    lab, _ = ndi.label(white)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    outside = np.isin(lab, list(border))
    return Image.fromarray(np.where(outside, 0, 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))

sizes = {}
for k in ('union', 'tribune', 'medford'):
    im = Image.open(os.path.join(D, 'raw', 'pages', k + '.jpg')).convert('L')
    im.save(os.path.join(OUT, k + '.jpg'), quality=90); sizes[k] = im.size
for k in ('news', 'crowd', 'boats', 'surv'):
    src = 'survivors' if k == 'surv' else k
    im = Image.open(os.path.join(D, 'raw', 'neg', src + '.tif')).convert('L')
    w = 4000 if k in ('news', 'boats') else 2400
    im = im.resize((w, round(im.size[1] * w / im.size[0])), Image.LANCZOS)
    im.save(os.path.join(OUT, 'n_' + k + '.jpg'), quality=92, subsampling=0)
    emulsion_mask(im, 4 if w > 3000 else 2).save(os.path.join(OUT, 'n_' + k + '_mask.png')); sizes['n_' + k] = im.size
json.dump(sizes, open(os.path.join(OUT, 'sizes.json'), 'w'), indent=1); print(sizes)
