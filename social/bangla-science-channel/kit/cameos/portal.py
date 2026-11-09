"""Sci-fi portal for scientist entrances: a glowing ring of energy + an inner swirl + spark ring.
Each layer is a separate prop so the engine can spin them (rot keys) in opposite directions and scale them open/closed."""
import math, random

def _svg(w, h, body):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" style="overflow:visible">{body}</svg>'

D = 900; C = D / 2
DEFS = ('<defs>'
        '<radialGradient id="pcore"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".95"/><stop offset=".35" stop-color="#9FF3FF" stop-opacity=".85"/>'
        '<stop offset=".75" stop-color="#3B6CFF" stop-opacity=".55"/><stop offset="1" stop-color="#7A2BFF" stop-opacity="0"/></radialGradient>'
        '<radialGradient id="pglow"><stop offset=".55" stop-color="#5FE8FF" stop-opacity="0"/><stop offset=".72" stop-color="#5FE8FF" stop-opacity=".55"/>'
        '<stop offset=".8" stop-color="#B46BFF" stop-opacity=".35"/><stop offset="1" stop-color="#B46BFF" stop-opacity="0"/></radialGradient>'
        '<filter id="pblur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6"/></filter></defs>')

def portal_core():
    """Inner glowing disc with spiral arms (spin slowly)."""
    arms = ""
    for k in range(6):
        a0 = k * 60
        pts = []
        for i in range(40):
            r = 30 + i * 9.2; a = math.radians(a0 + i * 9)
            pts.append(f"{C + r*math.cos(a):.1f} {C + r*math.sin(a):.1f}")
        arms += f'<path d="M{" L".join(pts)}" fill="none" stroke="#E8FDFF" stroke-width="{10-k%2*4}" stroke-linecap="round" opacity=".55"/>'
    return _svg(D, D, DEFS + f'<circle cx="{C}" cy="{C}" r="{C-40}" fill="url(#pcore)"/><g filter="url(#pblur)">{arms}</g>')

def portal_ring():
    """Bright ring of energy with jagged bursts (spins fast)."""
    rnd = random.Random(5); b = DEFS + f'<circle cx="{C}" cy="{C}" r="{C}" fill="url(#pglow)"/>'
    b += f'<circle cx="{C}" cy="{C}" r="{C-70}" fill="none" stroke="#7FF0FF" stroke-width="26" opacity=".9" filter="url(#pblur)"/>'
    b += f'<circle cx="{C}" cy="{C}" r="{C-70}" fill="none" stroke="#FFFFFF" stroke-width="8"/>'
    for i in range(36):
        a = math.radians(i * 10 + rnd.uniform(-3, 3)); r1 = C - 92; r2 = C - 48 + rnd.uniform(-10, 24)
        b += (f'<path d="M{C+r1*math.cos(a):.1f} {C+r1*math.sin(a):.1f} L{C+r2*math.cos(a+0.05):.1f} {C+r2*math.sin(a+0.05):.1f}" '
              f'stroke="{"#FFFFFF" if i%3 else "#C9A2FF"}" stroke-width="{rnd.choice([3,4,6])}" stroke-linecap="round"/>')
    return _svg(D, D, b)

def portal_sparks():
    """Orange-gold spark ring (spins the other way), like a sci-fi gateway."""
    rnd = random.Random(11); b = ""
    for i in range(70):
        a = math.radians(rnd.uniform(0, 360)); r = C - 60 + rnd.uniform(-18, 30); ln = rnd.uniform(14, 36)
        x, y = C + r * math.cos(a), C + r * math.sin(a); tx, ty = -math.sin(a), math.cos(a)
        b += (f'<path d="M{x:.1f} {y:.1f} l{tx*ln:.1f} {ty*ln:.1f}" stroke="{rnd.choice(["#FFD27A","#FFB13B","#FFF2C2"])}" '
              f'stroke-width="{rnd.choice([3,4,5])}" stroke-linecap="round"/>')
    return _svg(D, D, b)

def portal_props(t_open, t_close, x, y, size=1.0, z=8, layer="world"):
    """Three props: opens (scale 0 -> size) at t_open over 0.6 s, spins, closes over 0.4 s ending at t_close.
    Place it behind the scientist (z < 10) so they step out in front of it."""
    o, c = t_open, t_close
    def keys(spin, s_mul=1.0):
        return [[o - 0.01, x, y, 0.01, 0, 0], [o, x, y, 0.05 * size, 0, 1], [o + 0.6, x, y, size * s_mul, spin * 0.6, 1],
                [c - 0.4, x, y, size * s_mul, spin * (c - 0.4 - o), 1], [c, x, y, 0.02, spin * (c - o), 0]]
    return [{"svg": portal_core(), "layer": layer, "z": z, "keys": keys(-60, 0.92)},
            {"svg": portal_ring(), "layer": layer, "z": z + 1, "keys": keys(240)},
            {"svg": portal_sparks(), "layer": layer, "z": z + 2, "keys": keys(-420, 1.04)}]
