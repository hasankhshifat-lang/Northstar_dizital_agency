"""Fetch public map data for the Johnstown valley.

- Elevation: AWS Terrain Tiles (terrarium PNG; SRTM/NED-based), free with attribution.
- Imagery: USDA / USGS The National Map orthoimagery (USGSImageryOnly), US public domain.
- River lines and place names: OpenStreetMap via the Overpass API (ODbL).
usage (library root): .venv/bin/python -I <project>/tools/fetch.py <project>
"""
import sys, os, io, json, math, time, datetime, urllib.request, urllib.parse
from concurrent.futures import ThreadPoolExecutor
from PIL import Image

D = sys.argv[1]
RAW = os.path.join(D, 'raw'); os.makedirs(RAW, exist_ok=True)
UA = {'User-Agent': 'northstar-film-tools/1.0 (map explainer)'}
LOG = open(os.path.join(RAW, 'manifest.jsonl'), 'a')
BOX = {'detail': (-78.965, 40.292, -78.715, 40.392),     # Johnstown → the dam and the lake
       'wide': (-79.45, 40.05, -78.25, 40.65)}           # the backdrop around it
TERRAIN = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'
S2 = 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}'


def tile_xy(lon, lat, z):
    n = 2 ** z
    return (lon + 180) / 360 * n, (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n


def get(url, data=None):
    for k in range(5):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, data=data, headers=UA), timeout=120) as r:
                b = r.read()
            LOG.write(json.dumps({'url': url, 'bytes': len(b), 'date': datetime.date.today().isoformat()}) + '\n')
            return b
        except Exception:
            if k == 4:
                raise
            time.sleep(2 + 3 * k)


def mosaic(name, box, tmpl, z, ext):
    W, S, E, N = box
    dst = os.path.join(RAW, f'{name}_z{z}.{ext}')
    x0, y0 = tile_xy(W, N, z); x1, y1 = tile_xy(E, S, z)
    tx0, ty0, tx1, ty1 = int(x0), int(y0), int(x1), int(y1)
    if not os.path.exists(dst):
        jobs = [(x, y) for y in range(ty0, ty1 + 1) for x in range(tx0, tx1 + 1)]
        im = Image.new('RGB', ((tx1 - tx0 + 1) * 256, (ty1 - ty0 + 1) * 256))
        with ThreadPoolExecutor(8) as ex:
            for (x, y), b in ex.map(lambda j: (j, get(tmpl.format(z=z, x=j[0], y=j[1]))), jobs):
                im.paste(Image.open(io.BytesIO(b)).convert('RGB'), ((x - tx0) * 256, (y - ty0) * 256))
        im.save(dst, quality=95) if ext == 'jpg' else im.save(dst)
    return {'z': z, 'tx0': tx0, 'ty0': ty0, 'tx1': tx1, 'ty1': ty1}


meta = {}
for key, zt, zi in (('detail', 14, 16), ('wide', 10, 12)):
    meta[key] = {'bbox': BOX[key], 'terrain': mosaic(key + '_terrain', BOX[key], TERRAIN, zt, 'png'),
                 's2': mosaic(key + '_img', BOX[key], S2, zi, 'jpg')}
    print(key, meta[key])
json.dump(meta, open(os.path.join(RAW, 'bbox.json'), 'w'), indent=1)

osm = os.path.join(RAW, 'osm.json')
if False:
    W, S, E, N = BOX['detail']
    q = f'''[out:json][timeout:90];
(
  way["waterway"="river"]["name"~"Conemaugh|Stonycreek|Stony Creek"]({S},{W},{N},{E});
  way["waterway"]["name"~"South Fork"]({S},{W},{N},{E});
  node["place"~"city|town|village|hamlet"]({S},{W},{N},{E});
  way["bridge"]["name"~"Stone"]({S},{W},{N},{E});
  way["railway"]["bridge"]({S - .01},{W},{S + .06},{W + .06});
);
out geom tags;'''
    open(osm, 'wb').write(get('https://overpass-api.de/api/interpreter', urllib.parse.urlencode({'data': q}).encode()))
els = []
print('osm', len(els))
for e in els:
    t = e.get('tags', {})
    if e['type'] == 'node': print('  place', t.get('name'), t.get('place'), e['lat'], e['lon'])
    elif 'waterway' in t: print('  water', t.get('name'), len(e.get('geometry', [])))
    elif t.get('name'): print('  bridge', t.get('name'), e['geometry'][0])
