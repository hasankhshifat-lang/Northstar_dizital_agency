"""Build the film's map assets from raw/ (see fetch.py).

assets/meta.json        grid sizes, mercator boxes, km per pixel, the lake level, places, the dam line
assets/height.bin       detail heights (float32 m), GW x GH, row 0 = north
assets/albedo.jpg       detail imagery, graded warm
assets/wide_*.bin|jpg   the same for the backdrop
assets/lake.png         R = 1889 lake mask (reconstructed), G = bed depth below the level (0..40 m)
assets/path.json        the flood path dam -> Stone Bridge (lon, lat): DEM trace to South Fork, then the OSM river line
usage (library root): .venv/bin/python -I <project>/tools/prep.py <project>
"""
import sys, os, json, math, heapq
import numpy as np
from PIL import Image
from scipy import ndimage

D = sys.argv[1]
RAW = os.path.join(D, 'raw'); OUT = os.path.join(D, 'assets'); os.makedirs(OUT, exist_ok=True)
Image.MAX_IMAGE_PIXELS = None
M = json.load(open(os.path.join(RAW, 'bbox.json')))
DAM = (-78.7719, 40.3478)          # South Fork Dam (remains), Johnstown Flood National Memorial
SEED = (-78.7620, 40.3380)         # a point on the old lakebed
LEVEL = 490.0                      # lake surface, m (see FACTS.md: gives a lake over 2 miles long, ~60 ft deep)
PLACES = {'JOHNSTOWN': (-78.9220, 40.3267), 'SOUTH FORK': (-78.7914, 40.3673), 'MINERAL POINT': (-78.8353, 40.3795),
          'EAST CONEMAUGH': (-78.8836, 40.3487), 'WOODVALE': (-78.8842, 40.3425), 'STONE BRIDGE': (-78.9250, 40.3325)}


def mpx(lon, lat, z):
    n = 2 ** z * 256
    return (lon + 180) / 360 * n, (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n


def build(key, grid_div, img_max):
    m = M[key]; W, S, E, N = m['bbox']
    s2 = m['s2']; z = s2['z']
    x0, y0 = mpx(W, N, z); x1, y1 = mpx(E, S, z)
    img = Image.open(os.path.join(RAW, f'{key}_img_z{z}.jpg')).convert('RGB')
    img = img.crop((int(x0 - s2['tx0'] * 256), int(y0 - s2['ty0'] * 256), int(x1 - s2['tx0'] * 256), int(y1 - s2['ty0'] * 256)))
    if img.size[0] > img_max:
        img = img.resize((img_max, round(img.size[1] * img_max / img.size[0])), Image.LANCZOS)
    IW, IH = img.size
    t = m['terrain']; zt = t['z']
    tx0, ty0 = mpx(W, N, zt); tx1, ty1 = mpx(E, S, zt)
    a = np.asarray(Image.open(os.path.join(RAW, f'{key}_terrain_z{zt}.png')).convert('RGB'), np.float64)
    h = a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768
    GW, GH = IW // grid_div, IH // grid_div
    ys = (np.arange(GH) + .5) / GH * (ty1 - ty0) + ty0 - t['ty0'] * 256 - .5
    xs = (np.arange(GW) + .5) / GW * (tx1 - tx0) + tx0 - t['tx0'] * 256 - .5
    X, Y = np.meshgrid(xs, ys)
    hg = ndimage.map_coordinates(h, [Y, X], order=3, mode='nearest').astype(np.float32)
    # imagery grade: warm, a little less saturation, a little more contrast
    lin = (np.asarray(img, np.float32) / 255) ** 2.2
    l = (lin * [.2126, .7152, .0722]).sum(-1, keepdims=True)
    L = l + (lin - l) * .80
    L = np.clip(L * np.array([1.08, 1.0, .86]) * .95, 0, 1) ** 1.1 * 1.1
    alb = (np.clip(L, 0, 1) ** (1 / 2.2) * 255 + .5).astype(np.uint8)
    latc = (S + N) / 2
    km_px = 40075.016 * math.cos(math.radians(latc)) / (2 ** z * 256) * (s2_scale := (x1 - x0) / IW)
    meta = {'GW': GW, 'GH': GH, 'IW': IW, 'IH': IH, 'bbox': [W, S, E, N], 'z': z, 'merc': [x0, y0, x1, y1],
            'km_px': km_px, 'width_km': IW * km_px, 'height_km': IH * km_px, 'hmin': float(hg.min()), 'hmax': float(hg.max())}
    return meta, hg, alb, h, (tx0 - t['tx0'] * 256, ty0 - t['ty0'] * 256, tx1 - t['tx0'] * 256, ty1 - t['ty0'] * 256, zt)


dm, dh, dalb, draw, dbox = build('detail', 6, 8192)
wm, wh, walb, _, _ = build('wide', 4, 4096)
wh = np.maximum(wh, 250.0)   # a few no-data cells at the far edge

# ---- the 1889 lake, reconstructed: fill the basin behind the dam to LEVEL ----
GW, GH = dm['GW'], dm['GH']
W, S, E, N = dm['bbox']
def gpix(lon, lat):
    x0, y0, x1, y1 = dm['merc']; mx, my = mpx(lon, lat, dm['z'])
    return (mx - x0) / (x1 - x0) * GW - .5, (my - y0) / (y1 - y0) * GH - .5
cell_km = dm['width_km'] / GW
dx, dy = gpix(*DAM)
# the dam: today the breach is a gap down to the old bed; plug it with a band across the channel at the dam
cx, cy = int(round(dx)), int(round(dy))
cm = cell_km * 1000; c = lambda m: int(round(m / cm))            # plug sized in metres: 130 m thick, from 420 m west to 80 m east of the dam point
block = np.zeros_like(dh, bool); block[cy - c(52):cy + c(52) + 1, cx - c(420):cx + c(80)] = True
row = dh[cy, cx - c(570):cx + c(210)]; low = np.nonzero(row < LEVEL)[0]
A = (cx - c(570) + low.min() - 2, cy); B = (cx - c(570) + low.max() + 2, cy)
wet = (dh < LEVEL) & ~block
lab, _ = ndimage.label(wet)
sx, sy = gpix(*SEED); sx, sy = int(round(sx)), int(round(sy))
r_ = int(round(260 / (cell_km * 1000))); win = dh[sy - r_:sy + r_ + 1, sx - r_:sx + r_ + 1]; ky, kx = np.unravel_index(np.argmin(win), win.shape)
lake = lab == lab[sy - r_ + ky, sx - r_ + kx]
depth = np.where(lake, LEVEL - dh, 0)
ys, xs = np.nonzero(lake)
pts = np.stack([xs, ys], 1) * cell_km
span = max(np.hypot(*(pts - p).T).max() for p in pts[::max(1, len(pts) // 300)])
print(f'lake: {lake.sum() * cell_km ** 2:.2f} km², longest {span:.2f} km ({span / 1.609:.2f} mi), max depth {depth.max():.1f} m ({depth.max() * 3.281:.0f} ft)')
lk = np.zeros((GH, GW, 3), np.uint8)
lk[..., 0] = (ndimage.gaussian_filter(lake.astype(np.float32), .7) * 255).astype(np.uint8)
lk[..., 1] = (np.clip(depth / 40, 0, 1) * 255).astype(np.uint8)
Image.fromarray(lk).resize((GW * 2, GH * 2), Image.BILINEAR).save(os.path.join(OUT, 'lake.png'))
def gll(x, y):
    x0, y0, x1, y1 = dm['merc']; n = 2 ** dm['z'] * 256
    mx = x0 + (x + .5) / GW * (x1 - x0); my = y0 + (y + .5) / GH * (y1 - y0)
    return [mx / n * 360 - 180, math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * my / n))))]
dam_line = [gll(*A), gll(*B)]
print('dam line', dam_line, f'{math.hypot(A[0] - B[0], A[1] - B[1]) * cell_km * 1000:.0f} m')
# the deepest spot in the lake, and the lake's far (upstream) end, for the cross-section
far = pts[np.argmax(np.hypot(*(pts - np.array([dx, dy]) * cell_km).T))] / cell_km
sec_end = gll(*far)

# ---- the flood path: DEM trace dam -> South Fork, then the OSM Little Conemaugh line to the Stone Bridge ----
riv = json.load(open(os.path.join(RAW, 'nom_Little_Conemaugh_River.json')))[0]['geojson']['coordinates'][0]
riv = np.array(riv)
j0 = int(np.argmin(np.hypot(riv[:, 0] - PLACES['SOUTH FORK'][0], (riv[:, 1] - PLACES['SOUTH FORK'][1]) * 1.3)))
lc = riv[j0:]
# least-cost path on the full-res DEM (cost grows with height) from just below the dam to the river point at South Fork
tx0, ty0, tx1, ty1, zt = dbox
def tpix(lon, lat):
    mx, my = mpx(lon, lat, zt); n0 = M['detail']['terrain']
    return int(round(mx - n0['tx0'] * 256)), int(round(my - n0['ty0'] * 256))
cost = (draw - draw.min()) ** 2 + 1
st = tpix(*gll(dx, dy + 3)); en = tpix(*lc[0])
H, Wd = draw.shape
dist = np.full(draw.shape, np.inf); prev = {}
dist[st[1], st[0]] = 0; q = [(0, st)]
while q:
    d0, (x, y) = heapq.heappop(q)
    if (x, y) == en: break
    if d0 > dist[y, x]: continue
    for ex, ey in ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (1, -1), (-1, 1), (-1, -1)):
        nx, ny = x + ex, y + ey
        if 0 <= nx < Wd and 0 <= ny < H:
            nd = d0 + cost[ny, nx] * math.hypot(ex, ey)
            if nd < dist[ny, nx]: dist[ny, nx] = nd; prev[(nx, ny)] = (x, y); heapq.heappush(q, (nd, (nx, ny)))
trace = [en]
while trace[-1] != st: trace.append(prev[trace[-1]])
trace.reverse()
n0 = M['detail']['terrain']; n = 2 ** zt * 256
tll = [[(x + n0['tx0'] * 256) / n * 360 - 180, math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * (y + n0['ty0'] * 256) / n))))] for x, y in trace]
tll = tll[::3] + [tll[-1]]
path = tll + lc[1:].tolist()
km = sum(math.hypot((path[i][0] - path[i - 1][0]) * 85.0, (path[i][1] - path[i - 1][1]) * 111.0) for i in range(1, len(path)))
print(f'flood path {len(path)} pts, {km:.1f} km ({km / 1.609:.1f} mi)')
json.dump({'path': path, 'trace_n': len(tll)}, open(os.path.join(OUT, 'path.json'), 'w'))

for name, mm, hh, aa in (('', dm, dh, dalb), ('wide_', wm, wh, walb)):
    hh.astype('<f4').tofile(os.path.join(OUT, name + 'height.bin'))
    Image.fromarray(aa).save(os.path.join(OUT, name + 'albedo.jpg'), quality=88)
dm.update({'level': LEVEL, 'dam': list(DAM), 'dam_line': dam_line, 'sec_end': sec_end, 'places': PLACES,
           'lake_km2': float(lake.sum() * cell_km ** 2), 'lake_span_km': float(span), 'lake_maxdepth': float(depth.max())})
json.dump(dm, open(os.path.join(OUT, 'meta.json'), 'w'), indent=1)
json.dump(wm, open(os.path.join(OUT, 'wide_meta.json'), 'w'), indent=1)
print('detail', {k: dm[k] for k in ('GW', 'GH', 'IW', 'IH', 'width_km', 'height_km', 'hmin', 'hmax')})
print('wide', {k: wm[k] for k in ('GW', 'GH', 'IW', 'IH', 'width_km', 'height_km', 'hmin', 'hmax')})
