#!/usr/bin/env python3
"""Render map-view YouTube thumbnails (1280x720) for the Which Life Next channel.

Each thumbnail = satellite map (Esri World Imagery) of where the story happened,
graded and darkened, with US state lines, the route / place pins, and a short
custom hook heading (0-4 words, never a copy of the video title).

Usage:  python3 social/thumbnails/make_thumbnails.py [--vertical] [VIDEO_ID ...]
Output: social/thumbnails/<VIDEO_ID>.jpg  (+ contact-sheet.jpg)
        --vertical: 1080x1920 Shorts versions <VIDEO_ID>_9x16.jpg (+ contact-sheet-9x16.jpg)
Fonts, tiles and state borders are downloaded once to ~/.cache/wln-thumbs.
"""
import io, json, math, os, sys, urllib.request
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageEnhance, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.expanduser("~/.cache/wln-thumbs")
W, H = 1280, 720
TILE = 256
YELLOW = (242, 196, 72)
WHITE = (255, 255, 255)

FONTS = {
    "anton": "https://raw.githubusercontent.com/google/fonts/main/ofl/anton/Anton-Regular.ttf",
    "oswald": "https://raw.githubusercontent.com/google/fonts/main/ofl/oswald/Oswald%5Bwght%5D.ttf",
}
STATES_URL = "https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json"
NE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/{}.geojson"

# Map palette matched to the illustrated maps in the channel's Shorts
OCEAN = (62, 128, 130)
RIVER = (58, 122, 126)
LAND = (236, 224, 194)
LAND_OTHER = (222, 205, 168)
BORDER = (186, 166, 128)
HILITE = (233, 184, 112)
HILITE_EDGE = (176, 118, 58)
INK = (36, 30, 26)          # dark tag / outline colour
ROUTE = (178, 72, 52)       # rust-red route
PIN = (196, 58, 46)
SS = 2                      # supersampling for the vector map

_GEO = {}


def geo(name):
    """Natural Earth layer as a list of (bbox, properties, geometry), cached."""
    if name not in _GEO:
        data = json.load(open(fetch(NE.format(name), f"{CACHE}/ne/{name}.geojson")))
        feats = []
        for f in data["features"]:
            g = f["geometry"]
            if not g:
                continue
            xs, ys = [], []

            def walk(c):
                if not c:
                    return
                if isinstance(c[0], (int, float)):
                    xs.append(c[0]); ys.append(c[1])
                else:
                    for k in c:
                        walk(k)
            walk(g["coordinates"])
            if not xs:
                continue
            feats.append(((min(xs), min(ys), max(xs), max(ys)), f["properties"], g))
        _GEO[name] = feats
    return _GEO[name]


def polygons(g):
    if g["type"] == "Polygon":
        return [g["coordinates"]]
    if g["type"] == "MultiPolygon":
        return g["coordinates"]
    return []


def lines(g):
    if g["type"] == "LineString":
        return [g["coordinates"]]
    if g["type"] == "MultiLineString":
        return g["coordinates"]
    return []


def fetch(url, path):
    if not os.path.exists(path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        req = urllib.request.Request(url, headers={"User-Agent": "wln-thumbnail-maker/1.0"})
        with urllib.request.urlopen(req, timeout=30) as r, open(path, "wb") as f:
            f.write(r.read())
    return path


def font(name, size):
    p = fetch(FONTS[name], f"{CACHE}/fonts/{name}.ttf")
    f = ImageFont.truetype(p, size)
    if name == "oswald":
        try:
            f.set_variation_by_axes([700])
        except Exception:
            pass
    return f


# ---------- Web Mercator ----------
def world_px(lat, lon, z):
    n = TILE * 2 ** z
    x = (lon + 180.0) / 360.0 * n
    s = math.sin(math.radians(max(-85.0, min(85.0, lat))))
    y = (0.5 - math.log((1 + s) / (1 - s)) / (4 * math.pi)) * n
    return x, y


class MapView:
    def __init__(self, lat, lon, zoom, anchor=None):
        """(lat, lon) lands on image point `anchor` at fractional `zoom`."""
        anchor = anchor or (W / 2, H / 2)
        self.z = math.ceil(zoom)
        self.scale = 2 ** (zoom - self.z)  # <= 1, downscale for crispness
        cw, ch = W / self.scale, H / self.scale
        cx, cy = world_px(lat, lon, self.z)
        self.x0, self.y0 = cx - anchor[0] / self.scale, cy - anchor[1] / self.scale
        self.cw, self.ch = int(round(cw)), int(round(ch))

    @classmethod
    def fit(cls, points, box, max_zoom=12.0):
        """Frame all (lat, lon) points inside image box (x0, y0, x1, y1)."""
        xs, ys = zip(*[world_px(a, b, 0) for a, b in points])
        dx, dy = max(max(xs) - min(xs), 1e-9), max(max(ys) - min(ys), 1e-9)
        zoom = min(max_zoom, math.log2(min((box[2] - box[0]) / dx, (box[3] - box[1]) / dy)))
        mx, my = (max(xs) + min(xs)) / 2, (max(ys) + min(ys)) / 2
        n = TILE
        lon = mx / n * 360 - 180
        lat = math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * my / n))))
        return cls(lat, lon, zoom, ((box[0] + box[2]) / 2, (box[1] + box[3]) / 2))

    def to_img(self, lat, lon):
        x, y = world_px(lat, lon, self.z)
        return ((x - self.x0) * self.scale, (y - self.y0) * self.scale)

    def lonlat_bounds(self):
        n = TILE * 2 ** self.z

        def inv(x, y):
            lon = x / n * 360 - 180
            lat = math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * y / n))))
            return lon, lat
        lon0, lat1 = inv(self.x0, self.y0)
        lon1, lat0 = inv(self.x0 + self.cw, self.y0 + self.ch)
        mx, my = (lon1 - lon0) * 0.1, (lat1 - lat0) * 0.1
        return lon0 - mx, lat0 - my, lon1 + mx, lat1 + my

    def render(self):
        """Flat illustrated map: parchment land, teal water, thin state lines, paper grain."""
        zoom = self.z + math.log2(self.scale)
        b = self.lonlat_bounds()
        img = Image.new("RGB", (W * SS, H * SS), OCEAN)
        d = ImageDraw.Draw(img)

        def pr(ring):
            return [(px * SS, py * SS) for px, py in (self.to_img(lat, lon) for lon, lat in ring)]

        def hit(bb):
            return not (bb[2] < b[0] or bb[0] > b[2] or bb[3] < b[1] or bb[1] > b[3])

        detail = "10m" if zoom >= 6.5 else "50m"
        for bb, _, g in geo(f"ne_{detail}_land"):
            if hit(bb):
                for poly in polygons(g):
                    d.polygon(pr(poly[0]), fill=LAND)
                    for hole in poly[1:]:
                        d.polygon(pr(hole), fill=OCEAN)
        if zoom < 6.5:  # neighbouring countries a shade darker, like the Shorts maps
            for bb, p, g in geo("ne_50m_admin_0_countries"):
                if hit(bb) and p.get("ADMIN") != "United States of America":
                    for poly in polygons(g):
                        d.polygon(pr(poly[0]), fill=LAND_OTHER)
        for bb, _, g in geo(f"ne_{detail}_lakes"):
            if hit(bb):
                for poly in polygons(g):
                    d.polygon(pr(poly[0]), fill=OCEAN)
        maxrank = 4 if zoom < 5.5 else (6 if zoom < 8 else 10)
        for bb, p, g in geo("ne_10m_rivers_lake_centerlines"):
            rank = p.get("scalerank", 10) or 10
            if hit(bb) and rank <= maxrank:
                w = max(2, int((zoom - 2.5) * 1.3 * (1.25 - rank / 12))) * SS
                for ln in lines(g):
                    d.line(pr(ln), fill=RIVER, width=w, joint="curve")
        for bb, p, g in geo("ne_50m_admin_1_states_provinces_lines"):
            if hit(bb):
                for ln in lines(g):
                    d.line(pr(ln), fill=BORDER, width=2 * SS, joint="curve")
        img = img.resize((W, H), Image.LANCZOS)
        # paper grain + faint speckle
        grain = Image.effect_noise((W, H), 18).convert("L")
        img = Image.blend(img, Image.merge("RGB", (grain, grain, grain)), 0.06)
        return img

    def render_tiles(self):
        canvas = Image.new("RGB", (self.cw, self.ch), (20, 24, 30))
        tx0, ty0 = int(self.x0 // TILE), int(self.y0 // TILE)
        tx1, ty1 = int((self.x0 + self.cw) // TILE), int((self.y0 + self.ch) // TILE)
        n = 2 ** self.z
        for ty in range(ty0, ty1 + 1):
            if ty < 0 or ty >= n:
                continue
            for tx in range(tx0, tx1 + 1):
                p = f"{CACHE}/tiles/{self.z}/{tx % n}_{ty}.jpg"
                try:
                    fetch(TILE_URL.format(z=self.z, y=ty, x=tx % n), p)
                    t = Image.open(p).convert("RGB")
                except Exception as e:
                    print("tile fail", self.z, tx, ty, e, file=sys.stderr)
                    continue
                canvas.paste(t, (int(tx * TILE - self.x0), int(ty * TILE - self.y0)))
        return canvas.resize((W, H), Image.LANCZOS)


# ---------- styling helpers ----------
def grade(img, tint, darken=0.55, sat=0.55):
    img = ImageEnhance.Color(img).enhance(sat)
    img = ImageEnhance.Contrast(img).enhance(1.25)
    img = ImageEnhance.Brightness(img).enhance(darken)
    tint_layer = Image.new("RGB", img.size, tint)
    img = Image.blend(img, ImageOps.autocontrast(img), 0.25)
    return Image.blend(img, Image.composite(tint_layer, img, ImageOps.invert(img.convert("L"))), 0.35)


def vignette(img, left_dark=True, top_dark=False):
    radial = Image.radial_gradient("L").resize((W, H))  # 0 center -> 255 edge
    radial = radial.point(lambda v: int(min(255, v * 0.9)))
    black = Image.new("RGB", (W, H), (24, 19, 14))  # warm dark brown, like the Shorts' frame
    img = Image.composite(black, img, radial.point(lambda v: int(v * 0.4)))
    if left_dark:
        grad = Image.linear_gradient("L").rotate(90, expand=True).resize((W, H))  # 255 left -> 0 right
        grad = grad.point(lambda v: int(max(0, (v - 70)) * 1.15))
        img = Image.composite(black, img, grad.point(lambda v: min(225, v)))
    if top_dark:  # vertical: dark band behind the heading at the top
        grad = Image.linear_gradient("L").rotate(180).resize((W, H))  # 255 top -> 0 bottom
        grad = grad.point(lambda v: int(max(0, (v - 95)) * 1.4))
        img = Image.composite(black, img, grad.point(lambda v: min(215, v)))
    return img


def draw_states(img, view, color=(255, 255, 255, 70), width=2):
    data = json.load(open(fetch(STATES_URL, f"{CACHE}/us-states.json")))
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for f in data["features"]:
        g = f["geometry"]
        polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
        for poly in polys:
            for ring in poly:
                pts = [view.to_img(lat, lon) for lon, lat in ring]
                d.line(pts + [pts[0]], fill=color, width=width, joint="curve")
    img.paste(layer, (0, 0), layer)
    return data


def state_outline(img, view, data, name, color=HILITE_EDGE, width=4, fill=HILITE + (255,), dash=False):
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for _, p, g in geo("ne_50m_admin_1_states_provinces"):
        if p.get("name") != name or p.get("iso_a2") != "US":
            continue
        for poly in polygons(g):
            pts = [view.to_img(lat, lon) for lon, lat in poly[0]]
            if fill:
                d.polygon(pts, fill=fill)
            if dash:
                dashed(d, pts + [pts[0]], color, width)
            else:
                d.line(pts + [pts[0]], fill=color, width=width, joint="curve")
    img.paste(layer, (0, 0), layer)


def dashed(d, pts, color, width, on=18, off=12):
    carry, drawing = 0.0, True
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        seg = math.hypot(x1 - x0, y1 - y0)
        pos = 0.0
        while pos < seg:
            step = min((on if drawing else off) - carry, seg - pos)
            if drawing:
                a, b = pos / seg, (pos + step) / seg
                d.line([(x0 + (x1 - x0) * a, y0 + (y1 - y0) * a), (x0 + (x1 - x0) * b, y0 + (y1 - y0) * b)],
                       fill=color, width=width)
            pos += step
            carry += step
            if carry >= (on if drawing else off) - 1e-6:
                carry, drawing = 0.0, not drawing


def glow_line(img, pts, color, width=7, glow=22, dash=False):
    g = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(g).line([(x + 2, y + 4) for x, y in pts], fill=INK + (90,), width=width + 4, joint="curve")
    g = g.filter(ImageFilter.GaussianBlur(4))
    img.paste(g, (0, 0), g)
    l = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(l)
    if dash:
        dashed(d, pts, color + (255,), width)
    else:
        d.line(pts, fill=color + (255,), width=width, joint="curve")
    img.paste(l, (0, 0), l)


def waypoints(img, pts, r=7):
    d = ImageDraw.Draw(img)
    for x, y in pts:
        d.ellipse([x - r, y - r, x + r, y + r], fill=(250, 246, 236), outline=INK, width=max(2, r // 3))


def blob(img, pts, color, alpha=150, blur=18):
    b = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(b).polygon(pts, fill=color + (alpha,))
    b = b.filter(ImageFilter.GaussianBlur(blur))
    img.paste(b, (0, 0), b)


def pin(img, xy, color=PIN, r=13, ring=True):
    """Teardrop map marker whose tip sits on xy (the Shorts' red location pin)."""
    x, y = xy
    R = r * 1.7
    cy = y - R * 2.2
    sh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(sh)
    sd.ellipse([x - R * 0.9, y - R * 0.3, x + R * 0.9, y + R * 0.3], fill=INK + (110,))
    sh = sh.filter(ImageFilter.GaussianBlur(3))
    img.paste(sh, (0, 0), sh)
    d = ImageDraw.Draw(img)
    body = [(x, y)] + [(x + R * math.cos(math.radians(a)), cy + R * math.sin(math.radians(a)))
                       for a in range(150, 391, 6)]
    d.polygon(body, fill=color, outline=INK, width=3)
    d.ellipse([x - R * 0.38, cy - R * 0.38, x + R * 0.38, cy + R * 0.38], fill=(250, 246, 236), outline=INK, width=2)


def label(img, xy, text, anchor="l", size=30, bg=INK, fg=WHITE, dx=24, dy=0):
    f = font("oswald", size)
    d = ImageDraw.Draw(img)
    tw = d.textlength(text, font=f)
    th = size * 1.05
    x, y = xy
    x = x + dx if anchor == "l" else (x - dx - tw - 20 if anchor == "r" else x - tw / 2 - 10 + dx)
    x = max(14, min(x, W - tw - 36))  # keep every label inside the frame
    y = y + dy - th / 2 - 4
    box = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(box).rounded_rectangle([x - 2, y, x + tw + 22, y + th + 10], 8, fill=bg + (215,))
    img.paste(box, (0, 0), box)
    d.text((x + 10, y + 2), text, font=f, fill=fg)


def hook(img, lines, x=64, y_bottom=None, max_w=700, size=150, y_top=None):
    """lines: list of [(text, color), ...]; drawn left aligned with heavy outline + shadow."""
    d = ImageDraw.Draw(img)
    # fit size so the widest line fits max_w
    while True:
        f = font("anton", size)
        widths = [sum(d.textlength(t, font=f) for t, _ in ln) for ln in lines]
        if max(widths) <= max_w or size <= 60:
            break
        size -= 4
    lh = int(size * 1.08)
    total = lh * len(lines)
    y = y_top if y_top is not None else (y_bottom - total if y_bottom else (H - total) // 2)
    sh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(sh)
    yy = y
    for ln in lines:
        xx = x
        for t, _ in ln:
            sd.text((xx + 8, yy + 10), t, font=f, fill=(0, 0, 0, 230))
            xx += d.textlength(t, font=f)
        yy += lh
    sh = sh.filter(ImageFilter.GaussianBlur(9))
    img.paste(sh, (0, 0), sh)
    yy = y
    for ln in lines:
        xx = x
        for t, c in ln:
            d.text((xx, yy), t, font=f, fill=c, stroke_width=max(5, size // 22), stroke_fill=(0, 0, 0))
            xx += d.textlength(t, font=f)
        yy += lh
    return y, y + total


def badge(img, text, color, xy=(64, 52), fg=(0, 0, 0), size=46):
    f = font("anton", size)
    d = ImageDraw.Draw(img)
    tw = d.textlength(text, font=f)
    x, y = xy
    sh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle([x + 4, y + 6, x + tw + 40, y + size * 1.45 + 6], 12, fill=(0, 0, 0, 150))
    sh = sh.filter(ImageFilter.GaussianBlur(6))
    img.paste(sh, (0, 0), sh)
    d.rounded_rectangle([x, y, x + tw + 36, y + size * 1.45], 12, fill=INK, outline=color, width=3)
    d.text((x + 18, y + size * 0.12), text, font=f, fill=color)


def credit(img):
    pass  # Natural Earth vector data is public domain; no credit needed on the image


# ---------- geography ----------
OREGON_TRAIL = [(39.09, -94.42), (39.84, -96.65), (40.64, -99.0), (41.13, -100.77), (41.29, -102.12),
                (41.70, -103.35), (42.20, -104.56), (42.85, -106.32), (42.494, -107.131), (42.36, -108.90),
                (42.65, -111.60), (43.03, -112.43), (42.6, -114.5), (43.8, -117.0), (45.6, -118.3),
                (45.6, -121.18), (45.36, -122.60)]
PONY = [(39.77, -94.85), (39.84, -96.65), (40.64, -99.0), (40.99, -102.26), (41.70, -103.35),
        (42.20, -104.56), (42.36, -108.90), (41.32, -110.39), (40.76, -111.89), (40.2, -113.8),
        (39.5, -116.0), (39.30, -118.6), (39.16, -119.77), (38.80, -120.4), (38.58, -121.49)]
DONNER_MAIN = [(39.09, -94.42), (40.64, -99.0), (42.20, -104.56), (42.36, -108.90), (41.32, -110.39)]
DONNER_CUTOFF = [(41.32, -110.39), (40.95, -111.4), (40.76, -111.89), (40.75, -112.6), (40.72, -113.9),
                 (40.75, -114.2), (40.25, -115.5), (40.83, -115.76), (40.97, -117.7), (40.0, -118.6),
                 (39.53, -119.81), (39.32, -120.24)]
BOOTH = [(38.8967, -77.0258), (38.765, -76.898), (38.553, -76.866), (38.43, -77.02), (38.33, -77.03),
         (38.17, -77.19), (38.137, -77.24)]


def P(view, pts):
    return [view.to_img(a, b) for a, b in pts]


def base(lat, lon, zoom, tint, states=True, darken=1.0, sat=1.0, left_dark=True, state_alpha=80,
         fit=None, box=(600, 150, 1210, 590), anchor=None, max_zoom=12.0, top_dark=False, tint_amt=0.08):
    v = MapView.fit(fit, box, max_zoom) if fit else MapView(lat, lon, zoom, anchor)
    img = v.render()
    img = Image.blend(img, Image.new("RGB", (W, H), tint), tint_amt)
    if darken != 1.0:
        img = ImageEnhance.Brightness(img).enhance(darken)
    img = vignette(img, left_dark, top_dark)
    return v, img.convert("RGB"), None


ORANGE = (255, 122, 26)
CYAN = (60, 220, 255)
ICE = (150, 225, 255)
AMBER = (255, 170, 30)
TOXIC = (205, 230, 40)
BLOOD = (235, 40, 40)


# ---------- one function per video ----------
def t_booth():
    v, img, _ = base(0, 0, 0, (10, 30, 70), fit=BOOTH, box=(700, 120, 1150, 600), max_zoom=10.2)
    pts = P(v, BOOTH)
    glow_line(img, pts, ROUTE, dash=True, width=8)
    pin(img, pts[0], PIN, r=11, ring=False)
    label(img, pts[0], "FORD'S THEATRE", "l")
    pin(img, pts[-1], PIN, r=14)
    label(img, pts[-1], "GARRETT FARM, VA", "c", dy=62, dx=0)
    badge(img, "APRIL 1865", YELLOW)
    hook(img, [[("WHERE IS", WHITE)], [("BOOTH?", YELLOW)]], y_bottom=650, max_w=560, size=190)
    return img


def t_donner():
    v, img, _ = base(0, 0, 0, (40, 60, 110), fit=DONNER_MAIN + DONNER_CUTOFF, box=(700, 260, 1200, 520))
    state_outline(img, v, None, "California", width=3)
    glow_line(img, P(v, DONNER_MAIN), (140, 120, 92), width=5, glow=12)
    glow_line(img, P(v, DONNER_CUTOFF), PIN, width=9, glow=28)
    end = v.to_img(39.32, -120.24)
    pin(img, end, PIN, r=15)
    label(img, end, "TRAPPED BY SNOW", "c", dy=64, dx=40)
    label(img, v.to_img(40.72, -113.6), "HASTINGS CUTOFF", "c", dy=-58, dx=0, bg=(140, 0, 0))
    badge(img, "1846", YELLOW)
    hook(img, [[("THE", WHITE)], [("DEADLY", YELLOW)], [("SHORTCUT", WHITE)]], x=56, y_top=150, max_w=470, size=150)
    return img


def t_pony():
    v, img, _ = base(0, 0, 0, (60, 40, 10), fit=PONY, box=(590, 200, 1210, 560))
    pts = P(v, PONY)
    glow_line(img, pts, ROUTE, width=8, glow=24)
    for p in pts[1:-1]:
        ImageDraw.Draw(img).ellipse([p[0] - 6, p[1] - 6, p[0] + 6, p[1] + 6], fill=WHITE, outline=(0, 0, 0), width=2)
    pin(img, pts[0], PIN, r=13, ring=False)
    label(img, pts[0], "ST. JOSEPH", "c", dy=56, dx=-20)
    pin(img, pts[-1], PIN, r=13)
    label(img, pts[-1], "SACRAMENTO", "c", dy=60, dx=20)
    badge(img, "1860", YELLOW)
    hook(img, [[("NEVER", WHITE)], [("STOP", YELLOW)], [("RIDING", WHITE)]], x=56, y_top=150, max_w=470, size=150)
    return img


def t_fever():
    v, img, _ = base(39.9496, -75.1503, 10.6, (80, 80, 0), anchor=(900, 330))
    c = v.to_img(39.9496, -75.1503)
    for r, a in ((320, 40), (230, 60), (145, 90), (75, 130)):
        b = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ImageDraw.Draw(b).ellipse([c[0] - r, c[1] - r, c[0] + r, c[1] + r], fill=TOXIC + (a // 3,), outline=TOXIC + (a,), width=4)
        b = b.filter(ImageFilter.GaussianBlur(4))
        img.paste(b, (0, 0), b)
    pin(img, c, PIN, r=15)
    label(img, c, "PHILADELPHIA, U.S. CAPITAL", "c", dy=64, dx=0)
    badge(img, "1793", TOXIC)
    hook(img, [[("20,000", TOXIC)], [("FLED", WHITE)]], y_bottom=660, max_w=500, size=200)
    return img


def t_johnstown():
    river_ll = [(40.3486, -78.7728), (40.36, -78.80), (40.385, -78.83), (40.37, -78.86),
                (40.35, -78.88), (40.34, -78.90), (40.3267, -78.9220)]
    v, img, _ = base(0, 0, 0, (0, 50, 110), fit=river_ll, box=(680, 220, 1160, 470))
    river = P(v, river_ll)
    glow_line(img, river, RIVER, width=12, glow=40)
    dam, town = river[0], river[-1]
    pin(img, dam, PIN, r=14, ring=False)
    label(img, dam, "SOUTH FORK DAM", "c", dy=60, dx=-30)
    pin(img, town, PIN, r=16)
    label(img, town, "JOHNSTOWN", "c", dy=-62, dx=0)
    badge(img, "MAY 31, 1889", CYAN)
    hook(img, [[("57 MINUTES", WHITE)], [("TO IMPACT", CYAN)]], y_bottom=670, max_w=560, size=150)
    return img


def t_shelley():
    v, img, _ = base(42.022, -93.958, 10.6, (0, 40, 90), anchor=(910, 370))
    river = P(v, [(42.20, -93.98), (42.10, -93.95), (42.03, -93.96), (41.98, -93.92), (41.90, -93.95)])
    glow_line(img, river, RIVER, width=10, glow=30)
    rail = P(v, [(42.02, -94.30), (42.023, -94.1), (42.022, -93.96), (42.02, -93.80)])
    glow_line(img, rail, INK, width=6, glow=14, dash=True)
    b = v.to_img(42.022, -93.958)
    pin(img, b, PIN, r=15)
    label(img, b, "DES MOINES RIVER BRIDGE", "c", dy=-64, dx=0)
    badge(img, "JULY 6, 1881", YELLOW)
    hook(img, [[("MIDNIGHT", WHITE)], [("TRAIN", YELLOW), (" DUE", WHITE)]], y_bottom=670, max_w=520, size=170)
    return img


SWARM_L = [(48.5, -100.4), (45.5, -99.9), (42.5, -99.7), (39.5, -99.3), (36.5, -98.9), (33.0, -98.6)]
SWARM_R = [(33.0, -96.4), (36.5, -96.7), (39.5, -97.0), (42.5, -97.3), (45.5, -97.5), (48.5, -98.1)]


def swarm_band(v, img, color=AMBER, alpha=150):
    """Albert's swarm, 1875: ~1,800 mi long, ~110 mi wide (Albert Child's estimate), drawn schematically."""
    import random
    random.seed(7)
    poly = P(v, SWARM_L + SWARM_R)
    blob(img, poly, color, alpha, blur=10)
    L, R = poly[:6], poly[6:][::-1]

    def at(seq, y):
        for (x0, y0), (x1, y1) in zip(seq, seq[1:]):
            if min(y0, y1) <= y <= max(y0, y1) and y1 != y0:
                return x0 + (x1 - x0) * (y - y0) / (y1 - y0)
        return None
    ys = [p[1] for p in poly]
    d = ImageDraw.Draw(img)
    for _ in range(5000):
        y = min(ys) + random.random() * (max(ys) - min(ys))
        a, b = at(L, y), at(R, y)
        if a is None or b is None:
            continue
        x = a + (random.random() * 1.3 - 0.15) * (b - a)
        s = random.choice((1, 1.5, 2))
        d.ellipse([x - s, y - s, x + s, y + s], fill=random.choice(((40, 25, 0), (255, 200, 60), (120, 70, 0))))


def t_vanished():
    v, img, _ = base(0, 0, 0, (50, 40, 0), fit=SWARM_L + SWARM_R + [(40, -106), (40, -90)], box=(640, 50, 1220, 680), sat=0.6)
    swarm_band(v, img, (110, 70, 25), 130)
    label(img, v.to_img(41.0, -98.4), "TRILLIONS", "c", dx=0, dy=0, bg=(140, 80, 0), size=30)
    badge(img, "LAST SEEN 1902", YELLOW)
    hook(img, [[("WHERE", WHITE)], [("DID THEY", WHITE)], [("GO?", YELLOW)]], x=56, y_top=150, max_w=470, size=150)
    return img


def locust_cloud(img):
    """Dark swarm rolling in from the upper right."""
    import random
    random.seed(21)
    sh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(sh)
    for i in range(14):
        r = 260 - i * 8
        cx, cy = 1250 - i * 45 + random.randint(-30, 30), 20 + i * 14 + random.randint(-20, 20)
        sd.ellipse([cx - r * 1.5, cy - r, cx + r * 1.5, cy + r], fill=(20, 12, 0, 120))
    sh = sh.filter(ImageFilter.GaussianBlur(45))
    img.paste(sh, (0, 0), sh)
    d = ImageDraw.Draw(img)
    for _ in range(9000):
        t = random.random() ** 1.6
        x = W - t * 820 + random.gauss(0, 50)
        y = random.gauss(70 + t * 120, 60 + t * 40)
        s = random.choice((1, 1, 1.5, 2, 2.5))
        d.ellipse([x - s, y - s * 0.6, x + s, y + s * 0.6], fill=random.choice(((15, 10, 0), (15, 10, 0), (45, 30, 5), (90, 65, 20), (200, 150, 60))))


def t_skydark():
    v, img, _ = base(38.5, -98.4, 6.5, (60, 45, 0), anchor=(880, 440), sat=0.6)
    locust_cloud(img)
    k = v.to_img(38.5, -98.4)
    pin(img, k, PIN, r=14)
    label(img, k, "KANSAS FARM", "c", dx=0, dy=60)
    badge(img, "JULY 1874", YELLOW)
    hook(img, [[("WHAT IS", WHITE)], [("THAT", WHITE)], [("CLOUD?", YELLOW)]], x=56, y_top=150, max_w=470, size=150)
    return img


NEBRASKA = [(43.0, -104.05), (40.0, -95.3)]


def t_corn():
    v, img, data = base(0, 0, 0, (40, 55, 0), fit=NEBRASKA, box=(620, 170, 1210, 560))
    state_outline(img, v, data, "Nebraska", width=5)
    locust_cloud(img)
    label(img, v.to_img(41.5, -99.8), "NEBRASKA CORN", "c", dx=0, dy=0, size=32)
    badge(img, "JULY 1874", YELLOW)
    hook(img, [[("GONE", YELLOW)], [("OVERNIGHT", WHITE)]], y_bottom=650, max_w=520, size=170)
    return img


def t_bigswarm():
    v, img, data = base(0, 0, 0, (50, 40, 0), fit=SWARM_L + SWARM_R + [(42.0, -124.4), (32.5, -114.1)],
                        box=(560, 60, 1120, 670), sat=0.6)
    swarm_band(v, img, (110, 70, 25), 130)
    state_outline(img, v, data, "California", width=4)
    label(img, v.to_img(36.8, -119.6), "CALIFORNIA", "c", dx=0, dy=0, size=26)
    label(img, v.to_img(40.5, -97.6), "THE 1875 SWARM", "c", dx=0, dy=0, bg=(140, 80, 0), size=28)
    badge(img, "1875", YELLOW)
    hook(img, [[("BIGGER", YELLOW)], [("THAN", WHITE)], [("CALIFORNIA", WHITE)]], x=56, y_top=150, max_w=440, size=150)
    return img


def snow(img, n=1300, seed=3):
    import random
    random.seed(seed)
    s = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(s)
    for _ in range(n):
        x, y = random.random() * W, random.random() * H
        r = random.choice((1, 1, 1.5, 2, 3))
        d.line([(x, y), (x - r * 3, y + r * 1.5)], fill=(255, 255, 255, random.randint(90, 210)), width=max(1, int(r)))
    s = s.filter(ImageFilter.GaussianBlur(0.8))
    img.paste(s, (0, 0), s)


def blizzard_base(lat=0, lon=0, zoom=0, **kw):
    v, img, data = base(lat, lon, zoom, (50, 80, 115), tint_amt=0.32, darken=0.95, **kw)
    wash = Image.new("RGB", (W, H), (190, 225, 255))
    img = Image.blend(img, wash, 0.08)
    return v, img, data


def t_rope():
    v, img, data = blizzard_base(44.36, -98.21, 6.6, anchor=(1000, 360))
    state_outline(img, v, None, "South Dakota", width=3)
    house, barn = (900, 420), (1150, 300)
    glow_line(img, [house, (1030, 395), barn], ROUTE, width=6, glow=16)
    pin(img, house, PIN, r=12, ring=False)
    label(img, house, "HOUSE", "c", dx=0, dy=46, size=26)
    pin(img, barn, PIN, r=12, ring=False)
    label(img, barn, "BARN", "c", dx=0, dy=-46, size=26)
    snow(img)
    badge(img, "JAN 12, 1888", ICE)
    hook(img, [[("TIE THE", WHITE)], [("ROPE.", YELLOW)]], y_bottom=650, max_w=560, size=190)
    return img


def t_minnie():
    v, img, data = blizzard_base(41.60, -98.93, 7.4, anchor=(900, 330))
    state_outline(img, v, None, "Nebraska", width=3)
    o = v.to_img(41.60, -98.93)
    pin(img, o, PIN, r=14)
    label(img, o, "VALLEY COUNTY, NEBRASKA", "c", dx=0, dy=62, size=28)
    snow(img, 1500, 11)
    badge(img, "JAN 12, 1888", ICE)
    hook(img, [[("WALK", WHITE)], [("OR", WHITE), (" FREEZE", ICE)]], y_bottom=660, max_w=560, size=180)
    return img


def t_drop():
    v, img, data = blizzard_base(44.3633, -98.2143, 6.8, anchor=(900, 330))
    state_outline(img, v, None, "South Dakota", width=3)
    h = v.to_img(44.3633, -98.2143)
    pin(img, h, PIN, r=15)
    label(img, h, "HURON, DAKOTA TERRITORY", "c", dx=0, dy=64, size=28)
    snow(img, 1100, 5)
    badge(img, "JAN 12, 1888", ICE)
    hook(img, [[("A ", WHITE), ("77°", ICE)], [("DROP", WHITE)]], y_bottom=650, max_w=520, size=200)
    return img


def t_homestead():
    v, img, data = blizzard_base(fit=[(49.0, -104.05), (42.5, -96.4)], box=(700, 70, 1180, 650))
    state_outline(img, v, data, "South Dakota", width=4)
    state_outline(img, v, data, "North Dakota", width=4)
    c = v.to_img(44.0, -98.0)
    d = ImageDraw.Draw(img)
    d.rectangle([c[0] - 18, c[1] - 18, c[0] + 18, c[1] + 18], outline=YELLOW, width=5)
    label(img, c, "YOUR 160 ACRES", "c", dx=0, dy=54, size=28)
    snow(img, 900, 9)
    badge(img, "1887", YELLOW)
    hook(img, [[("160 ACRES.", WHITE)], [("ONE ", WHITE), ("CATCH", YELLOW)]], y_bottom=660, max_w=600, size=140)
    return img


def oregon_base(**kw):
    kw.setdefault("fit", OREGON_TRAIL)
    kw.setdefault("box", (590, 190, 1210, 540))
    return base(0, 0, 0, (60, 40, 10), **kw)


def t_july4():
    v, img, _ = oregon_base()
    pts = P(v, OREGON_TRAIL)
    glow_line(img, pts, ROUTE, width=7)
    mt = v.to_img(45.0, -118.3)
    blob(img, [(mt[0] - 70, mt[1] - 60), (mt[0] + 90, mt[1] - 70), (mt[0] + 110, mt[1] + 50), (mt[0] - 60, mt[1] + 60)], ICE, 110, 22)
    label(img, mt, "SNOW", "c", dx=0, dy=-78, size=28, bg=(20, 60, 110))
    ir = v.to_img(42.494, -107.131)
    pin(img, ir, PIN, r=15)
    label(img, ir, "INDEPENDENCE ROCK: JULY 4", "c", dx=0, dy=62, size=28)
    badge(img, "1850", YELLOW)
    hook(img, [[("BEAT", WHITE)], [("THE SNOW", ICE)]], y_bottom=670, max_w=500, size=150)
    return img


def t_300():
    v, img, _ = oregon_base()
    pts = P(v, OREGON_TRAIL)
    glow_line(img, pts, ROUTE, width=7)
    pin(img, pts[0], PIN, r=13)
    label(img, pts[0], "START: $300", "c", dy=58, dx=-70)
    pin(img, pts[-1], PIN, r=13, ring=False)
    label(img, pts[-1], "OREGON", "c", dy=-50, dx=0)
    badge(img, "1850", YELLOW)
    hook(img, [[("600 LB", YELLOW)], [("OF FLOUR?", WHITE)]], y_bottom=670, max_w=520, size=160)
    return img


def t_cholera():
    v, img, _ = base(0, 0, 0, (40, 60, 20), fit=OREGON_TRAIL[:8], box=(620, 230, 1200, 520))
    state_outline(img, v, None, "Nebraska", width=3)
    pts = P(v, OREGON_TRAIL[:8])
    glow_line(img, pts, ROUTE, width=7)
    d = ImageDraw.Draw(img)
    for lat, lon in ((40.75, -99.6), (41.0, -100.5), (41.2, -101.5), (41.45, -102.6), (41.75, -103.6)):
        c = v.to_img(lat + 0.12, lon)
        d.line([c[0] - 10, c[1] - 10, c[0] + 10, c[1] + 10], fill=BLOOD, width=6)
        d.line([c[0] - 10, c[1] + 10, c[0] + 10, c[1] - 10], fill=BLOOD, width=6)
    label(img, v.to_img(40.9, -100.6), "PLATTE RIVER ROAD", "c", dx=0, dy=64, size=28)
    badge(img, "1850", YELLOW)
    hook(img, [[("FINE AT", WHITE)], [("BREAKFAST", YELLOW)]], y_bottom=670, max_w=520, size=150)
    return img


def t_30days():
    v, img, _ = oregon_base()
    pts = P(v, OREGON_TRAIL)
    glow_line(img, pts[2:], (140, 120, 92), width=5, glow=8, dash=True)
    glow_line(img, pts[:3], ROUTE, width=9, glow=28)
    pin(img, pts[0], PIN, r=12, ring=False)
    label(img, pts[0], "DAY 1", "c", dy=50, dx=0)
    pin(img, pts[2], PIN, r=15)
    label(img, pts[2], "DAY 30", "c", dy=-58, dx=0)
    badge(img, "1850", YELLOW)
    hook(img, [[("WHAT", WHITE)], [("KILLS YOU", WHITE)], [("FIRST?", YELLOW)]], x=56, y_top=150, max_w=470, size=150)
    return img


VIDEOS = {
    "A7IMwfCRwjg": t_booth, "bwhHw3tLIDQ": t_donner, "ctoVTthJ_2w": t_pony, "dDlQidQ1y00": t_fever,
    "Fh02fn61e-w": t_johnstown, "qL-ohGQCXDA": t_shelley, "pXOy92KjJt4": t_vanished,
    "LhQtj0tc_q8": t_skydark, "Bxq73rQ54xk": t_corn, "NtC-QGdCfG0": t_bigswarm, "qbtwhG8IDL8": t_rope,
    "J5rJThy08hk": t_minnie, "HyqmpcvzHKI": t_drop, "kQzq9g26F6Q": t_homestead, "pGNi9O6MFIA": t_july4,
    "XiUBmGYlWOE": t_300, "7kxCubu2UdI": t_cholera, "Dd6icXr-dW0": t_30days,
}


# ---------- vertical 9:16 (1080x1920) versions for Shorts ----------
VB = (110, 1060, 970, 1500)   # map focus box: below the heading, above the bottom title overlay
LS = 40                      # label size


def vbase(tint, **kw):
    kw.setdefault("left_dark", False)
    kw.setdefault("top_dark", True)
    return base(0, 0, 0, tint, **kw)


def vhook(img, lines, size=240):
    hook(img, lines, x=70, y_top=270, max_w=940, size=size)


def vbadge(img, text, color):
    badge(img, text, color, xy=(70, 120), size=60)


def v_booth():
    v, img, _ = vbase((10, 30, 70), fit=BOOTH, box=(300, 1060, 780, 1560), max_zoom=10.4)
    pts = P(v, BOOTH)
    glow_line(img, pts, ROUTE, dash=True, width=10, glow=28)
    pin(img, pts[0], PIN, r=15, ring=False)
    label(img, pts[0], "FORD'S THEATRE", "l", dx=30, size=LS)
    pin(img, pts[-1], PIN, r=18)
    label(img, pts[-1], "GARRETT FARM, VA", "c", dy=80, size=LS)
    vbadge(img, "APRIL 1865", YELLOW)
    vhook(img, [[("WHERE IS", WHITE)], [("BOOTH?", YELLOW)]], 250)
    return img


def v_donner():
    v, img, _ = vbase((40, 60, 110), fit=DONNER_MAIN + DONNER_CUTOFF, box=VB)
    state_outline(img, v, None, "California", width=3)
    glow_line(img, P(v, DONNER_MAIN), (140, 120, 92), width=6, glow=14)
    glow_line(img, P(v, DONNER_CUTOFF), PIN, width=11, glow=32)
    end = v.to_img(39.32, -120.24)
    pin(img, end, PIN, r=18)
    label(img, end, "TRAPPED BY SNOW", "c", dy=80, dx=60, size=LS)
    label(img, v.to_img(40.72, -113.6), "HASTINGS CUTOFF", "c", dy=-75, bg=(140, 0, 0), size=LS)
    vbadge(img, "1846", YELLOW)
    vhook(img, [[("THE", WHITE)], [("DEADLY", YELLOW)], [("SHORTCUT", WHITE)]], 230)
    return img


def v_pony():
    v, img, _ = vbase((60, 40, 10), fit=PONY, box=VB)
    pts = P(v, PONY)
    glow_line(img, pts, ROUTE, width=10, glow=28)
    for p in pts[1:-1]:
        ImageDraw.Draw(img).ellipse([p[0] - 8, p[1] - 8, p[0] + 8, p[1] + 8], fill=WHITE, outline=(0, 0, 0), width=2)
    pin(img, pts[0], PIN, r=16, ring=False)
    label(img, pts[0], "ST. JOSEPH", "c", dy=75, size=LS)
    pin(img, pts[-1], PIN, r=16)
    label(img, pts[-1], "SACRAMENTO", "c", dy=80, size=LS)
    vbadge(img, "1860", YELLOW)
    vhook(img, [[("NEVER", WHITE)], [("STOP", YELLOW)], [("RIDING", WHITE)]], 240)
    return img


def v_vanished():
    v, img, _ = vbase((50, 40, 0), fit=SWARM_L + SWARM_R + [(40, -104), (40, -92)], box=(140, 1000, 940, 1760), sat=0.6)
    swarm_band(v, img, (110, 70, 25), 130)
    label(img, v.to_img(40.0, -98.4), "TRILLIONS", "c", bg=(140, 80, 0), size=LS)
    vbadge(img, "LAST SEEN 1902", YELLOW)
    vhook(img, [[("WHERE", WHITE)], [("DID THEY", WHITE)], [("GO?", YELLOW)]], 240)
    return img


def vsnow_base(**kw):
    v, img, data = vbase((50, 80, 115), tint_amt=0.32, darken=0.95, **kw)
    img = Image.blend(img, Image.new("RGB", (W, H), (190, 225, 255)), 0.08)
    return v, img, data


def v_rope():
    v, img, _ = vsnow_base(fit=[(46.0, -100.5), (42.5, -96.5)], box=VB)
    state_outline(img, v, None, "South Dakota", width=3)
    house, barn = (330, 1300), (760, 1080)
    glow_line(img, [house, (560, 1230), barn], ROUTE, width=9, glow=22)
    pin(img, house, PIN, r=16, ring=False)
    label(img, house, "HOUSE", "c", dy=64, size=LS)
    pin(img, barn, PIN, r=16, ring=False)
    label(img, barn, "BARN", "c", dy=-64, size=LS)
    snow(img, 2600, 3)
    vbadge(img, "JAN 12, 1888", ICE)
    vhook(img, [[("TIE THE", WHITE)], [("ROPE.", YELLOW)]], 260)
    return img


def v_minnie():
    v, img, _ = vsnow_base(fit=[(43.0, -101.0), (40.2, -96.9)], box=VB)
    state_outline(img, v, None, "Nebraska", width=3)
    o = v.to_img(41.60, -98.93)
    pin(img, o, PIN, r=18)
    label(img, o, "VALLEY COUNTY, NEBRASKA", "c", dy=80, size=LS)
    snow(img, 2800, 11)
    vbadge(img, "JAN 12, 1888", ICE)
    vhook(img, [[("WALK", WHITE)], [("OR", WHITE), (" FREEZE", ICE)]], 250)
    return img


def v_drop():
    v, img, _ = vsnow_base(fit=[(45.8, -100.3), (42.9, -96.2)], box=VB)
    state_outline(img, v, None, "South Dakota", width=3)
    h = v.to_img(44.3633, -98.2143)
    pin(img, h, PIN, r=18)
    label(img, h, "HURON, DAKOTA TERRITORY", "c", dy=80, size=LS)
    snow(img, 2200, 5)
    vbadge(img, "JAN 12, 1888", ICE)
    vhook(img, [[("A ", WHITE), ("77°", ICE)], [("DROP", WHITE)]], 280)
    return img


def v_cholera():
    v, img, _ = vbase((40, 60, 20), fit=OREGON_TRAIL[:8], box=(110, 980, 970, 1380))
    state_outline(img, v, None, "Nebraska", width=3)
    pts = P(v, OREGON_TRAIL[:8])
    glow_line(img, pts, ROUTE, width=10, glow=28)
    d = ImageDraw.Draw(img)
    for lat, lon in ((40.75, -99.6), (41.0, -100.5), (41.2, -101.5), (41.45, -102.6), (41.75, -103.6)):
        c = v.to_img(lat + 0.12, lon)
        d.line([c[0] - 14, c[1] - 14, c[0] + 14, c[1] + 14], fill=BLOOD, width=8)
        d.line([c[0] - 14, c[1] + 14, c[0] + 14, c[1] - 14], fill=BLOOD, width=8)
    label(img, v.to_img(40.9, -100.6), "PLATTE RIVER ROAD", "c", dy=90, size=LS)
    vbadge(img, "1850", YELLOW)
    vhook(img, [[("FINE AT", WHITE)], [("BREAKFAST", YELLOW)]], 240)
    return img


VERTICAL = {
    "A7IMwfCRwjg": v_booth, "bwhHw3tLIDQ": v_donner, "ctoVTthJ_2w": v_pony, "pXOy92KjJt4": v_vanished,
    "qbtwhG8IDL8": v_rope, "J5rJThy08hk": v_minnie, "HyqmpcvzHKI": v_drop, "7kxCubu2UdI": v_cholera,
}


def main():
    global W, H
    args = sys.argv[1:]
    vertical = "--vertical" in args
    args = [x for x in args if x != "--vertical"]
    table, suffix, sheet_name, cols, tw, th = VIDEOS, "", "contact-sheet.jpg", 3, 640, 360
    if vertical:
        W, H = 1080, 1920
        table, suffix, sheet_name, cols, tw, th = VERTICAL, "_9x16", "contact-sheet-9x16.jpg", 4, 360, 640
    ids = args or list(table)
    outs = []
    for vid in ids:
        img = table[vid]()
        credit(img)
        p = os.path.join(HERE, f"{vid}{suffix}.jpg")
        img.convert("RGB").save(p, "JPEG", quality=90, optimize=True)
        outs.append(p)
        print(p, os.path.getsize(p) // 1024, "KB")
    if len(outs) > 1:
        rows = math.ceil(len(outs) / cols)
        sheet = Image.new("RGB", (cols * tw + (cols + 1) * 12, rows * th + (rows + 1) * 12), (18, 18, 18))
        for i, p in enumerate(outs):
            sheet.paste(Image.open(p).resize((tw, th), Image.LANCZOS), (12 + (i % cols) * (tw + 12), 12 + (i // cols) * (th + 12)))
        sheet.save(os.path.join(HERE, sheet_name), quality=85)


if __name__ == "__main__":
    main()
