"""Asset library for the Wari-Bateshwar v2 film (painterly golden-hour look, after the 'Benares, 1780' reference).

Fast object creation: every part links a shared base mesh (no bpy.ops), with per-object materials.
"""
import math
import random

import bmesh
import bpy

rad = math.radians
R = random.Random(7)


# ======================================================================= colour / materials
def lin(h):
    h = h.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in c)


def rgba(h):
    return (*lin(h), 1.0)


_MATS = {}


def _new(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    return m, nt, nt.nodes["Principled BSDF"]


def _link(nt, a, b):
    nt.links.new(a, b)


def _ramp(nt, fac_socket, stops):
    r = nt.nodes.new("ShaderNodeValToRGB")
    els = r.color_ramp.elements
    while len(els) > 2:
        els.remove(els[-1])
    for i, (pos, col) in enumerate(stops):
        e = els[i] if i < 2 else els.new(pos)
        e.position = pos
        e.color = rgba(col)
    _link(nt, fac_socket, r.inputs["Fac"])
    return r


def _noise(nt, scale, detail=6, rough=0.55, vec=None, dims="3D"):
    n = nt.nodes.new("ShaderNodeTexNoise")
    n.noise_dimensions = dims
    n.inputs["Scale"].default_value = scale
    n.inputs["Detail"].default_value = detail
    n.inputs["Roughness"].default_value = rough
    if vec is not None:
        _link(nt, vec, n.inputs["Vector"])
    return n


def _bump(nt, height, strength, bsdf, distance=0.05):
    b = nt.nodes.new("ShaderNodeBump")
    b.inputs["Strength"].default_value = strength
    b.inputs["Distance"].default_value = distance
    _link(nt, height, b.inputs["Height"])
    _link(nt, b.outputs["Normal"], bsdf.inputs["Normal"])
    return b


def _world_pos(nt, ground=False):
    pos = nt.nodes.new("ShaderNodeNewGeometry").outputs["Position"]
    if ground:
        return pos
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(pos, sep.inputs[0])
    add = nt.nodes.new("ShaderNodeMath")
    add.operation = "ADD"
    nt.links.new(sep.outputs["X"], add.inputs[0])
    nt.links.new(sep.outputs["Y"], add.inputs[1])
    comb = nt.nodes.new("ShaderNodeCombineXYZ")
    nt.links.new(add.outputs[0], comb.inputs["X"])
    nt.links.new(sep.outputs["Z"], comb.inputs["Y"])
    nt.links.new(sep.outputs["X"], comb.inputs["Z"])
    return comb.outputs[0]


def mat_flat(name, col, rough=0.6, metal=0.0, sheen=0.0, emit=None, strength=0.0):
    key = ("flat", name)
    if key in _MATS:
        return _MATS[key]
    m, nt, b = _new(name)
    b.inputs["Base Color"].default_value = rgba(col)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if sheen:
        b.inputs["Sheen Weight"].default_value = sheen
    if emit:
        b.inputs["Emission Color"].default_value = rgba(emit)
        b.inputs["Emission Strength"].default_value = strength
    _MATS[key] = m
    return m


def mat_noise(name, stops, scale=3.0, rough=0.8, bump=0.25, world=True, detail=6):
    """Mottled painterly surface: noise -> colour ramp, plus bump."""
    key = ("noise", name)
    if key in _MATS:
        return _MATS[key]
    m, nt, b = _new(name)
    vec = _world_pos(nt) if world else None
    n = _noise(nt, scale, detail, 0.6, vec)
    r = _ramp(nt, n.outputs["Fac"], stops)
    _link(nt, r.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = rough
    if bump:
        n2 = _noise(nt, scale * 6, 8, 0.7, vec)
        _bump(nt, n2.outputs["Fac"], bump, b)
    _MATS[key] = m
    return m


def mat_brick(name, c1="#9c4f2e", c2="#7a3a22", mortar="#b8a58a", scale=3.0, rough=0.85, ground=False):
    key = ("brick", name)
    if key in _MATS:
        return _MATS[key]
    m, nt, b = _new(name)
    vec = _world_pos(nt, ground)
    br = nt.nodes.new("ShaderNodeTexBrick")
    br.inputs["Color1"].default_value = rgba(c1)
    br.inputs["Color2"].default_value = rgba(c2)
    br.inputs["Mortar"].default_value = rgba(mortar)
    br.inputs["Scale"].default_value = scale
    br.inputs["Mortar Size"].default_value = 0.018
    br.inputs["Row Height"].default_value = 0.22
    br.inputs["Brick Width"].default_value = 0.5
    _link(nt, vec, br.inputs["Vector"])
    n = _noise(nt, 2.0, 5, 0.6, vec)
    mix = nt.nodes.new("ShaderNodeMixRGB")
    mix.blend_type = "MULTIPLY"
    mix.inputs["Fac"].default_value = 0.35
    _link(nt, br.outputs["Color"], mix.inputs["Color1"])
    _link(nt, n.outputs["Color"], mix.inputs["Color2"])
    _link(nt, mix.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = rough
    _bump(nt, br.outputs["Fac"], 0.35, b)
    _MATS[key] = m
    return m


def mat_plaster(name, plaster=("#cdb48c", "#b8875a", "#8a9a98", "#c9a27a"), brick=("#97492b", "#6e3220"),
                reveal=0.64, scale=0.7):
    """Weathered lime plaster with patches of brick showing through (the reference's walls)."""
    key = ("plaster", name)
    if key in _MATS:
        return _MATS[key]
    m, nt, b = _new(name)
    vec = _world_pos(nt)
    n = _noise(nt, scale, 6, 0.6, vec)
    stops = [(i / (len(plaster) - 1), c) for i, c in enumerate(plaster)]
    pl = _ramp(nt, n.outputs["Fac"], stops)
    br = nt.nodes.new("ShaderNodeTexBrick")
    br.inputs["Color1"].default_value = rgba(brick[0])
    br.inputs["Color2"].default_value = rgba(brick[1])
    br.inputs["Mortar"].default_value = rgba("#a89478")
    br.inputs["Scale"].default_value = 3.5
    br.inputs["Mortar Size"].default_value = 0.02
    _link(nt, vec, br.inputs["Vector"])
    mask_n = _noise(nt, 0.9, 10, 0.68, vec)
    mask = _ramp(nt, mask_n.outputs["Fac"], [(reveal, "#000000"), (reveal + 0.03, "#ffffff")])
    mix = nt.nodes.new("ShaderNodeMixRGB")
    _link(nt, mask.outputs["Color"], mix.inputs["Fac"])
    _link(nt, pl.outputs["Color"], mix.inputs["Color1"])
    _link(nt, br.outputs["Color"], mix.inputs["Color2"])
    # grime: darker low on the wall and in blotches
    g = _noise(nt, 4.0, 8, 0.7, vec)
    grime = nt.nodes.new("ShaderNodeMixRGB")
    grime.blend_type = "MULTIPLY"
    grime.inputs["Fac"].default_value = 0.45
    _link(nt, mix.outputs["Color"], grime.inputs["Color1"])
    _link(nt, g.outputs["Color"], grime.inputs["Color2"])
    _link(nt, grime.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.9
    h = nt.nodes.new("ShaderNodeMath")
    h.operation = "ADD"
    _link(nt, mask.outputs["Color"], h.inputs[0])
    _link(nt, g.outputs["Fac"], h.inputs[1])
    _bump(nt, h.outputs[0], 0.4, b)
    _MATS[key] = m
    return m


def mat_wood(name, c1="#5a3a22", c2="#7d5634", scale=2.0):
    key = ("wood", name)
    if key in _MATS:
        return _MATS[key]
    m, nt, b = _new(name)
    w = nt.nodes.new("ShaderNodeTexWave")
    w.inputs["Scale"].default_value = scale
    w.inputs["Distortion"].default_value = 6
    w.inputs["Detail"].default_value = 4
    r = _ramp(nt, w.outputs["Fac"], [(0.0, c1), (1.0, c2)])
    _link(nt, r.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.7
    _bump(nt, w.outputs["Fac"], 0.2, b)
    _MATS[key] = m
    return m


def mat_water(name="Water", deep="#1f4a52", shallow="#3d6f6a", anim_frames=200):
    key = ("water", name)
    if key in _MATS:
        return _MATS[key]
    m, nt, b = _new(name)
    vec = _world_pos(nt)
    n = _noise(nt, 0.4, 3, 0.5, vec)
    r = _ramp(nt, n.outputs["Fac"], [(0.3, deep), (0.7, shallow)])
    _link(nt, r.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.04
    b.inputs["Specular IOR Level"].default_value = 0.7
    waves = _noise(nt, 2.5, 4, 0.5, vec, dims="4D")
    waves.inputs["W"].default_value = 0
    waves.inputs["W"].keyframe_insert("default_value", frame=1)
    waves.inputs["W"].default_value = anim_frames / 60
    waves.inputs["W"].keyframe_insert("default_value", frame=anim_frames)
    for fc in m.node_tree.animation_data.action.fcurves if hasattr(m.node_tree.animation_data.action, "fcurves") else []:
        for kp in fc.keyframe_points:
            kp.interpolation = "LINEAR"
    _bump(nt, waves.outputs["Fac"], 0.25, b, distance=0.2)
    _MATS[key] = m
    return m


def mat_skin(name, col):
    key = ("skin", name)
    if key in _MATS:
        return _MATS[key]
    m, nt, b = _new(name)
    b.inputs["Base Color"].default_value = rgba(col)
    b.inputs["Roughness"].default_value = 0.55
    b.inputs["Subsurface Weight"].default_value = 0.15
    b.inputs["Subsurface Radius"].default_value = (0.4, 0.2, 0.1)
    b.inputs["Subsurface Scale"].default_value = 0.02
    _MATS[key] = m
    return m


def mat_cloth(name, col, dark=None, scale=40.0):
    """Fabric with soft sheen and woven mottling."""
    key = ("cloth", name)
    if key in _MATS:
        return _MATS[key]
    m, nt, b = _new(name)
    n = _noise(nt, scale, 4, 0.5)
    dark = dark or _shade(col, 0.88)
    r = _ramp(nt, n.outputs["Fac"], [(0.25, dark), (0.75, col)])
    _link(nt, r.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.85
    b.inputs["Sheen Weight"].default_value = 0.4
    _MATS[key] = m
    return m


def _shade(h, f):
    h = h.lstrip("#")
    c = [max(0, min(255, int(int(h[i:i + 2], 16) * f))) for i in (0, 2, 4)]
    return "#%02x%02x%02x" % tuple(c)


def mat_flame():
    return mat_flat("Flame", "#ffb347", rough=1, emit="#ffa030", strength=25)


# ======================================================================= base meshes and fast parts
_MESH = {}


def _base(kind, r2=0.0):
    key = (kind, round(r2, 3))
    if key in _MESH:
        return _MESH[key]
    me = bpy.data.meshes.new(f"base_{kind}_{r2}")
    bm = bmesh.new()
    if kind == "sphere":
        bmesh.ops.create_uvsphere(bm, u_segments=24, v_segments=14, radius=1.0)
    elif kind == "lowsphere":
        bmesh.ops.create_uvsphere(bm, u_segments=10, v_segments=6, radius=1.0)
    elif kind == "cyl":
        bmesh.ops.create_cone(bm, cap_ends=True, segments=20, radius1=1, radius2=1, depth=2)
    elif kind == "cone":
        bmesh.ops.create_cone(bm, cap_ends=True, segments=24, radius1=1, radius2=max(r2, 0.0), depth=2)
    elif kind == "cube":
        bmesh.ops.create_cube(bm, size=2)
    elif kind == "torus":
        _torus(bm, 1.0, r2 or 0.25)
    bm.to_mesh(me)
    bm.free()
    if kind not in ("cube",):
        for p in me.polygons:
            p.use_smooth = True
    me.materials.append(None)
    _MESH[key] = me
    return me


def _torus(bm, R_, r, seg=32, ring=10):
    verts = []
    for i in range(seg):
        a = 2 * math.pi * i / seg
        row = []
        for j in range(ring):
            b = 2 * math.pi * j / ring
            x = (R_ + r * math.cos(b)) * math.cos(a)
            y = (R_ + r * math.cos(b)) * math.sin(a)
            z = r * math.sin(b)
            row.append(bm.verts.new((x, y, z)))
        verts.append(row)
    for i in range(seg):
        for j in range(ring):
            bm.faces.new((verts[i][j], verts[(i + 1) % seg][j], verts[(i + 1) % seg][(j + 1) % ring],
                          verts[i][(j + 1) % ring]))


def part(kind, mat, loc=(0, 0, 0), scale=1.0, rot=(0, 0, 0), parent=None, name="p", r2=0.0):
    me = _base(kind, r2)
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    ob.material_slots[0].link = "OBJECT"
    ob.material_slots[0].material = mat
    ob.location = loc
    ob.scale = (scale,) * 3 if isinstance(scale, (int, float)) else scale
    ob.rotation_euler = rot
    if parent is not None:
        ob.parent = parent
    return ob


def box(mat, center, size, rot=(0, 0, 0), parent=None, name="box", bevel=0.0):
    ob = part("cube", mat, center, (size[0] / 2, size[1] / 2, size[2] / 2), rot, parent, name)
    if bevel:
        md = ob.modifiers.new("b", "BEVEL")
        md.width = bevel
        md.segments = 2
    return ob


def empty(name, loc=(0, 0, 0), parent=None):
    e = bpy.data.objects.new(name, None)
    e.empty_display_size = 0.1
    bpy.context.scene.collection.objects.link(e)
    e.location = loc
    if parent is not None:
        e.parent = parent
    return e


def key(ob, frame, interp="BEZIER", **props):
    for k, v in props.items():
        setattr(ob, k, v)
        ob.keyframe_insert(k, frame=frame)


# ======================================================================= props
def boat(name, loc, heading=0.0, L=6.0, W=1.5, D=0.6, rise=0.55, hull="#5b3a22", trim="#8a5a32",
         garland=True, canopy=False):
    root = empty(name, loc)
    root.rotation_euler = (0, 0, heading)
    n = 18
    verts, faces = [], []
    prof = [(-1, 0.0), (-0.75, 0.6), (0.0, 1.0), (0.75, 0.6), (1.0, 0.0)]
    for i in range(n + 1):
        t = i / n
        x = (t - 0.5) * L
        s = math.sin(math.pi * t)
        w = W / 2 * (s ** 0.75) + 0.02
        d = D * (s ** 0.45)
        zr = rise * ((2 * t - 1) ** 4) + D
        for px, pd in prof:
            verts.append((x, px * w, zr - pd * d))
    m = len(prof)
    for i in range(n):
        for j in range(m - 1):
            a = i * m + j
            faces.append((a, a + 1, a + m + 1, a + m))
    me = bpy.data.meshes.new(name + "_hull")
    me.from_pydata(verts, [], faces)
    for p in me.polygons:
        p.use_smooth = True
    hull_ob = bpy.data.objects.new(name + "_hull", me)
    bpy.context.scene.collection.objects.link(hull_ob)
    hull_ob.data.materials.append(mat_wood("BoatWood_" + hull, hull, trim, 4))
    hull_ob.parent = root
    sol = hull_ob.modifiers.new("s", "SOLIDIFY")
    sol.thickness = 0.06
    for k in range(-2, 3):  # thwarts
        box(mat_wood("Plank", "#6b4a2c", "#8c6640"), (k * L * 0.15, 0, D - 0.12), (0.18, W * 0.8, 0.05), parent=root)
    if garland:
        marigold_garland((-L / 2 + 0.25, 0, D + rise - 0.05), (-L / 2 + 1.6, -W / 2, D - 0.05), 0.15, root)
        marigold_garland((-L / 2 + 0.25, 0, D + rise - 0.05), (-L / 2 + 1.6, W / 2, D - 0.05), 0.15, root)
    if canopy:
        cmat = mat_cloth("Canopy", "#b5462a")
        for dx in (-0.6, 0.6):
            for dy in (-0.55, 0.55):
                part("cyl", mat_wood("Pole", "#5a3a22", "#6e4a2a"), (dx + 0.6, dy, D + 0.55), (0.03, 0.03, 0.55), parent=root)
        box(cmat, (0.6, 0, D + 1.12), (1.5, 1.3, 0.04), parent=root)
    return root


def marigold_garland(p0, p1, sag, parent=None, spacing=0.07):
    mo = mat_flat("Marigold", "#f08a12", rough=0.7)
    my = mat_flat("Marigold2", "#f5b21a", rough=0.7)
    dist = math.dist(p0, p1)
    n = max(3, int(dist / spacing))
    for i in range(n + 1):
        t = i / n
        p = [p0[k] + (p1[k] - p0[k]) * t for k in range(3)]
        p[2] -= sag * 4 * t * (1 - t)
        part("lowsphere", mo if i % 3 else my, tuple(p), 0.045, parent=parent)


def diya(loc, parent=None, lit=True, light=True, energy=8):
    clay = mat_noise("Clay", [(0, "#8a4a26"), (1, "#b06a3a")], scale=20, rough=0.8, bump=0.1, world=False)
    root = empty("Diya", loc, parent)
    part("sphere", clay, (0, 0, 0.025), (0.07, 0.06, 0.03), parent=root)
    part("cone", clay, (0.07, 0, 0.04), (0.03, 0.02, 0.012), (0, rad(90), 0), parent=root, r2=0.3)
    flame = None
    if lit:
        flame = part("sphere", mat_flame(), (0.085, 0, 0.085), (0.012, 0.012, 0.035), parent=root)
        if light:
            ld = bpy.data.lights.new("DiyaLight", "POINT")
            ld.energy = energy
            ld.color = (1.0, 0.6, 0.25)
            ld.shadow_soft_size = 0.05
            lo = bpy.data.objects.new("DiyaLight", ld)
            bpy.context.scene.collection.objects.link(lo)
            lo.parent = root
            lo.location = (0.085, 0, 0.14)
    return root, flame


def pot(loc, r=0.18, col=None, parent=None):
    clay = mat_noise("PotClay" + (col or ""), [(0, col or "#8d4a28"), (1, _shade(col or "#8d4a28", 1.3))],
                     scale=15, rough=0.75, bump=0.1, world=False)
    root = empty("Pot", loc, parent)
    part("sphere", clay, (0, 0, r), (r, r, r * 0.9), parent=root)
    part("cyl", clay, (0, 0, r * 1.85), (r * 0.45, r * 0.45, r * 0.15), parent=root)
    part("torus", clay, (0, 0, r * 2.0), (r * 0.5, r * 0.5, r * 0.5), parent=root, r2=0.2)
    return root


def basket(loc, r=0.25, fill="#d9c27a", parent=None):
    wick = mat_noise("Wicker", [(0, "#8a6a3a"), (1, "#c9a462")], scale=60, rough=0.9, bump=0.4, world=False)
    root = empty("Basket", loc, parent)
    part("cyl", wick, (0, 0, r * 0.35), (r, r, r * 0.35), parent=root)
    part("sphere", mat_noise("Fill" + fill, [(0, _shade(fill, 0.7)), (1, fill)], scale=40, world=False),
         (0, 0, r * 0.7), (r * 0.95, r * 0.95, r * 0.25), parent=root)
    return root


def kite(loc, col="#c0392b", rot=0.0):
    k = part("cube", mat_flat("Kite" + col, col, 0.6), loc, (0.35, 0.01, 0.35), (rad(10), rad(45), rot))
    return k


def cloth_line(p0, p1, colors, parent=None):
    rope = mat_flat("Rope", "#4a3a2a", 0.9)
    L = math.dist(p0, p1)
    mid = [(p0[i] + p1[i]) / 2 for i in range(3)]
    ang = math.atan2(p1[1] - p0[1], p1[0] - p0[0])
    part("cyl", rope, tuple(mid), (0.008, 0.008, L / 2), (0, rad(90), ang), parent=parent)
    n = len(colors)
    for i, c in enumerate(colors):
        t = (i + 0.7) / (n + 0.4)
        p = [p0[k] + (p1[k] - p0[k]) * t for k in range(3)]
        h = R.uniform(0.6, 1.0)
        box(mat_cloth("Laundry" + c, c), (p[0], p[1], p[2] - h / 2), (R.uniform(0.4, 0.7), 0.02, h),
            rot=(0, 0, ang), parent=parent)


# ======================================================================= architecture
def building(x, y, w, d, h, base_z=0.0, mat=None, roof="flat", windows=True, balcony=False, face=-1,
             roof_col="#8f3e22", rng=R):
    mat = mat or mat_plaster("Plaster%d" % rng.randint(0, 3), reveal=rng.uniform(0.55, 0.68))
    body = box(mat, (x, y, base_z + h / 2), (w, d, h), name="bld", bevel=0.04)
    dark = mat_flat("WinDark", "#1a120c", 0.9)
    frame = mat_wood("WinFrame", "#3d2a1a", "#5a3c24")
    fy = y + face * d / 2
    if windows:
        floors = max(1, int(h / 2.6))
        for fl in range(floors):
            zc = base_z + 1.5 + fl * 2.6
            if zc > base_z + h - 0.8:
                break
            nwin = max(1, int(w / 1.6))
            for i in range(nwin):
                xc = x - w / 2 + (i + 0.5) * w / nwin
                if rng.random() < 0.15:
                    continue
                box(frame, (xc, fy + face * 0.02, zc), (0.85, 0.06, 1.25))
                box(dark, (xc, fy + face * 0.05, zc), (0.65, 0.04, 1.05))
                if rng.random() < 0.4:
                    box(mat_wood("Shutter", "#3f6d78", "#2f5560"), (xc - 0.5, fy + face * 0.06, zc), (0.32, 0.04, 1.05))
        if balcony and h > 4.5:
            zb = base_z + 3.6
            box(mat_wood("Balc", "#4a3020", "#6a4630"), (x, fy + face * 0.45, zb), (w * 0.8, 0.9, 0.12))
            for i in range(int(w * 0.8 / 0.25)):
                part("cyl", mat_wood("Balc", "#4a3020", "#6a4630"),
                     (x - w * 0.4 + i * 0.25, fy + face * 0.85, zb + 0.4), (0.03, 0.03, 0.4))
            box(mat_wood("Balc", "#4a3020", "#6a4630"), (x, fy + face * 0.88, zb + 0.82), (w * 0.8, 0.06, 0.06))
            box(mat_noise("Awning", [(0, "#7a4a2a"), (1, "#a8744a")], 6), (x, fy + face * 0.6, zb + 2.0),
                (w * 0.85, 1.3, 0.05), rot=(rad(-18 * face), 0, 0))
    if roof == "flat":
        box(mat, (x, y, base_z + h + 0.25), (w + 0.1, d + 0.1, 0.5))
    elif roof == "tile":
        tile = mat_brick("RoofTile" + roof_col, roof_col, _shade(roof_col, 0.75), "#4a2214", scale=7)
        gable_roof(x, y, base_z + h, w + 0.5, d + 0.6, d * 0.42, tile)
    elif roof == "dome":
        part("sphere", mat, (x, y, base_z + h), (w * 0.42, d * 0.42, w * 0.45))
    return body


def gable_roof(x, y, z, w, d, h, mat):
    v = [(-w / 2, -d / 2, 0), (w / 2, -d / 2, 0), (w / 2, d / 2, 0), (-w / 2, d / 2, 0),
         (-w / 2, 0, h), (w / 2, 0, h)]
    f = [(0, 1, 5, 4), (2, 3, 4, 5), (0, 4, 3), (1, 2, 5), (0, 3, 2, 1)]
    me = bpy.data.meshes.new("roof")
    me.from_pydata(v, [], f)
    ob = bpy.data.objects.new("roof", me)
    bpy.context.scene.collection.objects.link(ob)
    ob.data.materials.append(mat)
    ob.location = (x, y, z)
    return ob


def shrine(x, y, base_z, s=1.0):
    """Stepped brick shrine with a terracotta finial (Wari-Bateshwar era brick architecture)."""
    br = mat_brick("ShrineBrick", "#a4532f", "#7e3c22", "#c2ad8c", 2.5)
    pl = mat_plaster("ShrinePlaster", plaster=("#e0c9a0", "#d1a56a", "#c48c58"), reveal=0.5)
    z = base_z
    for i, (w, h) in enumerate([(7, 1.2), (5.8, 1.2), (4.6, 4.5), (3.6, 1.0), (2.6, 3.5)]):
        box(br if i % 2 == 0 else pl, (x, y, z + h * s / 2), (w * s, w * s, h * s), bevel=0.05)
        z += h * s
    part("cone", pl, (x, y, z + 2.2 * s), (1.4 * s, 1.4 * s, 2.2 * s), r2=0.0)
    part("sphere", mat_flat("Finial", "#c98a2e", 0.3, 0.8), (x, y, z + 4.5 * s), 0.35 * s)
    for k in (-1, 1):  # niches
        box(mat_flat("Niche", "#2a1a10", 0.9), (x + k * 1.2 * s, y - 2.31 * s, base_z + 4.6 * s), (0.7 * s, 0.05, 1.4 * s))


def ghat_steps(x0, x1, y0=0.0, n=14, rise=0.25, run=0.55, mat=None):
    mat = mat or mat_noise("Sandstone", [(0, "#8a6a48"), (0.5, "#b8946a"), (1, "#d4b48a")], 1.5, 0.85, 0.35)
    for i in range(n):
        box(mat, ((x0 + x1) / 2, y0 + i * run + (n - i) * run / 2, (i + 1) * rise / 2 - 1.0 + rise / 2),
            (x1 - x0, (n - i) * run, (i + 1) * rise + 2.0), name="step", bevel=0.02)
    return n * rise, y0 + n * run


def step_z(y, y0=0.0, rise=0.25, run=0.55, n=14):
    if y < y0:
        return 0.0
    i = min(n, int((y - y0) / run) + 1)
    return i * rise


# ======================================================================= people
SKINS = ["#8a5636", "#7a4a2e", "#9a6440", "#6a3f27", "#a8704a"]
CLOTH = ["#b23a2a", "#d07a2a", "#e3b23c", "#2f5d8a", "#6a8a3a", "#7a3f6b", "#e8dcc0", "#c25b7a", "#3a7a7a"]


class Person:
    """Poseable stylised human. Parts hang off empties: root > hips/knees, spine > shoulders/elbows, neck."""

    def __init__(self, name, kind="man", skin="#8a5636", top="#e8dcc0", bottom="#e8dcc0", accent="#b23a2a",
                 head="none", height=1.0, beard=False, loc=(0, 0, 0), heading=0.0):
        self.name = name
        self.root = empty(name, loc)
        self.root.rotation_euler = (0, 0, heading)
        self.root.scale = (height,) * 3
        sk = mat_skin("Skin" + skin, skin)
        tp = mat_cloth("C" + top, top)
        bt = mat_cloth("C" + bottom, bottom)
        ac = mat_cloth("C" + accent, accent)
        hair = mat_flat("Hair", "#140d0a", 0.45)
        white = mat_flat("EyeWhite", "#e8e2d8", 0.3)
        dark = mat_flat("Pupil", "#0d0806", 0.2)
        r = self.root
        female = kind in ("woman", "girl")
        child = kind in ("boy", "girl")
        # legs
        self.hip, self.knee, self.foot = {}, {}, {}
        for s, sx in (("L", 0.09), ("R", -0.09)):
            hp = empty(f"{name}_hip{s}", (sx, 0, 0.92), r)
            part("sphere", bt if kind == "man" or child else sk, (0, 0, -0.22), (0.08, 0.08, 0.25), parent=hp)
            kn = empty(f"{name}_knee{s}", (0, 0, -0.45), hp)
            part("sphere", sk, (0, 0, -0.21), (0.055, 0.055, 0.23), parent=kn)
            ft = empty(f"{name}_foot{s}", (0, 0, -0.44), kn)
            part("sphere", sk, (0, -0.06, -0.01), (0.045, 0.1, 0.035), parent=ft)
            self.hip[s], self.knee[s], self.foot[s] = hp, kn, ft
        # torso
        self.spine = empty(f"{name}_spine", (0, 0, 0.95), r)
        sp = self.spine
        part("sphere", tp, (0, 0, 0.26), (0.17, 0.11, 0.27), parent=sp)               # chest / kurta
        part("sphere", bt if not female else tp, (0, 0, 0.03), (0.165, 0.115, 0.13), parent=sp)  # waist
        if kind == "man":
            part("sphere", bt, (0, 0, -0.12), (0.18, 0.13, 0.22), parent=sp)           # dhoti folds
            part("torus", ac, (0, 0, 0.05), (0.17, 0.12, 0.17), parent=sp, r2=0.18)   # sash
            part("sphere", ac, (-0.05, -0.04, 0.32), (0.2, 0.12, 0.06), (0, rad(30), 0), parent=sp)  # shawl
        if child and kind == "boy":
            part("sphere", bt, (0, 0, -0.1), (0.16, 0.12, 0.18), parent=sp)
            part("torus", ac, (0, 0, 0.04), (0.16, 0.115, 0.16), parent=sp, r2=0.18)
        if female:
            part("cone", bt, (0, 0, -0.45), (0.27, 0.22, 0.5), parent=sp, r2=0.62)    # saree skirt
            part("torus", mat_flat("Zari", "#d4a537", 0.3, 0.6), (0, 0, -0.93), (0.27, 0.22, 0.27),
                 parent=sp, r2=0.06)                                                    # gold border
            part("sphere", bt, (0.04, -0.05, 0.25), (0.11, 0.1, 0.3), (0, rad(-28), 0), parent=sp)  # pallu
            part("sphere", bt, (0.0, 0.07, 0.15), (0.18, 0.06, 0.4), parent=sp)           # pallu falling behind
        # arms
        self.sh, self.el = {}, {}
        for s, sx in (("L", 0.2), ("R", -0.2)):
            sh = empty(f"{name}_sh{s}", (sx, 0, 0.47), sp)
            part("sphere", sk if kind != "man" else tp, (0, 0, -0.14), (0.05, 0.05, 0.16), parent=sh)
            el = empty(f"{name}_el{s}", (0, 0, -0.29), sh)
            part("sphere", sk, (0, 0, -0.12), (0.04, 0.04, 0.14), parent=el)
            part("sphere", sk, (0, -0.005, -0.28), (0.035, 0.022, 0.06), parent=el)      # hand
            if female:
                bang = mat_flat("Bangle", "#c9302c", 0.3)
                for k in range(3):
                    part("torus", bang if k != 1 else mat_flat("Zari", "#d4a537", 0.3, 0.6),
                         (0, 0, -0.2 - k * 0.018), 0.045, parent=el, r2=0.12)
            self.sh[s], self.el[s] = sh, el
        # head
        self.neck = empty(f"{name}_neck", (0, 0, 0.55), sp)
        nk = self.neck
        part("cyl", sk, (0, 0, 0.03), (0.045, 0.045, 0.05), parent=nk)
        hs = 1.12 if child else 1.0
        hd = empty(f"{name}_head", (0, 0, 0.0), nk)
        hd.scale = (hs,) * 3
        part("sphere", sk, (0, 0, 0.14), (0.095, 0.105, 0.12), parent=hd)
        part("sphere", sk, (0, -0.02, 0.07), (0.075, 0.08, 0.06), parent=hd)                # jaw
        part("sphere", sk, (0, -0.105, 0.125), (0.017, 0.022, 0.03), (rad(-10), 0, 0), parent=hd)  # nose
        for ex in (0.036, -0.036):
            part("sphere", white, (ex, -0.083, 0.155), (0.019, 0.012, 0.012), parent=hd)
            part("sphere", dark, (ex, -0.093, 0.155), 0.0085, parent=hd)
            part("sphere", hair, (ex, -0.092, 0.182), (0.024, 0.006, 0.006), (0, rad(-8 if ex > 0 else 8), 0), parent=hd)
            part("sphere", sk, (ex * 2.6, 0.0, 0.14), (0.014, 0.02, 0.03), parent=hd)       # ears
        part("sphere", mat_flat("Lip", "#5a2a20", 0.5), (0, -0.093, 0.085), (0.022, 0.006, 0.007), parent=hd)
        part("sphere", hair, (0, 0.012, 0.17), (0.1, 0.108, 0.1), parent=hd)                # hair cap
        if beard:
            part("sphere", mat_flat("Beard", "#2a2420", 0.7), (0, -0.04, 0.05), (0.08, 0.07, 0.07), parent=hd)
        if female:
            part("sphere", hair, (0, 0.09, 0.14), 0.05, parent=hd)                          # bun
            part("sphere", mat_flat("Bindi", "#c0141c", 0.4), (0, -0.103, 0.2), 0.008, parent=hd)
        if head == "veil":
            part("sphere", bt, (0, 0.025, 0.165), (0.112, 0.118, 0.115), parent=hd)
            part("sphere", bt, (0, 0.07, 0.03), (0.13, 0.08, 0.14), parent=hd)
        elif head == "turban":
            tm = mat_cloth("Turban" + accent, accent)
            for k in range(3):
                part("torus", tm, (0, 0.005, 0.19 + k * 0.03), (0.105 - k * 0.006,) * 2 + (0.11,),
                     (rad(-6), 0, 0), parent=hd, r2=0.32)
            part("sphere", tm, (0, 0.005, 0.25), (0.09, 0.095, 0.05), parent=hd)
        elif head == "headband":
            part("torus", ac, (0, 0.0, 0.2), (0.103, 0.112, 0.1), parent=hd, r2=0.18)
        elif head == "cap":
            part("sphere", mat_cloth("Cap", "#ece6d6"), (0, 0.01, 0.21), (0.1, 0.105, 0.06), parent=hd)
        self.head = hd
        self.rest(1)

    # ------------------------------------------------------------- posing
    def pose(self, frame, **j):
        """Joint angles in degrees: hipL/R, kneeL/R, shL/R (forward), shoutL/R (sideways), elL/R,
        spine (lean fwd), twist, neck (nod), turn (head yaw)."""
        g = lambda k: rad(j.get(k, 0))
        for s in "LR":
            key(self.hip[s], frame, rotation_euler=(-g("hip" + s), 0, 0))
            key(self.knee[s], frame, rotation_euler=(g("knee" + s), 0, 0))
            out = g("shout" + s) * (1 if s == "L" else -1)
            key(self.sh[s], frame, rotation_euler=(-g("sh" + s), out, 0))
            key(self.el[s], frame, rotation_euler=(-g("el" + s), 0, 0))
        key(self.spine, frame, rotation_euler=(g("spine"), 0, g("twist")))
        key(self.neck, frame, rotation_euler=(g("neck"), 0, g("turn")))

    def rest(self, frame, **extra):
        p = dict(shoutL=6, shoutR=6, elL=8, elR=8)
        p.update(extra)
        self.pose(frame, **p)

    def place(self, frame, xyz, heading, interp="BEZIER"):
        key(self.root, frame, location=xyz, rotation_euler=(0, 0, heading))

    def walk(self, f0, f1, a, b, step=14, z0=None, z1=None):
        """Walk from a to b (x, y[, z]); legs/arms swing every half step."""
        h = math.atan2(b[0] - a[0], -(b[1] - a[1]))
        za = a[2] if len(a) > 2 else 0.0
        zb = b[2] if len(b) > 2 else 0.0
        key(self.root, f0, location=(a[0], a[1], za), rotation_euler=(0, 0, h))
        key(self.root, f1, location=(b[0], b[1], zb), rotation_euler=(0, 0, h))
        for fc in _fcurves(self.root):
            for kp in fc.keyframe_points:
                if f0 <= kp.co.x <= f1:
                    kp.interpolation = "LINEAR"
        f, s = f0, 1
        while f < f1:
            self.pose(f, hipL=22 * s, hipR=-22 * s, kneeL=5 if s > 0 else 35, kneeR=35 if s > 0 else 5,
                      shL=-18 * s, shR=18 * s, shoutL=6, shoutR=6, elL=15, elR=15, spine=3)
            f += step // 2
            s = -s
        self.rest(f1 + 4)

    def sit_pose(self, frame, **extra):
        p = dict(hipL=88, hipR=88, kneeL=88, kneeR=88, shoutL=6, shoutR=6, elL=10, elR=10)
        p.update(extra)
        self.pose(frame, **p)

    def breathe(self, f0, f1, period=60, amp=1.5):
        f = f0
        while f <= f1:
            key(self.spine, f, rotation_euler=(rad(amp), 0, 0))
            f += period // 2
            key(self.spine, f, rotation_euler=(rad(-amp * 0.3), 0, 0))
            f += period // 2


def _fcurves(ob):
    act = ob.animation_data.action if ob.animation_data else None
    if not act:
        return []
    if hasattr(act, "fcurves") and len(act.fcurves):
        return list(act.fcurves)
    out = []
    for layer in getattr(act, "layers", []):
        for strip in layer.strips:
            for bag in getattr(strip, "channelbags", []):
                out.extend(bag.fcurves)
    return out


def crowd_person(loc, heading, rng=R, sitting=False, scale=None):
    kind = rng.choice(["man", "man", "woman", "woman", "boy"])
    p = Person(f"crowd{rng.randint(0, 99999)}", kind, rng.choice(SKINS), rng.choice(CLOTH), rng.choice(CLOTH),
               rng.choice(CLOTH), head=rng.choice(["veil", "turban", "none", "cap"]) if kind != "boy" else "headband",
               height=scale or (0.82 if kind == "boy" else rng.uniform(0.95, 1.05)), loc=loc, heading=heading,
               beard=kind == "man" and rng.random() < 0.4)
    return p


def goat(loc, heading=0.0):
    root = empty("Goat", loc)
    root.rotation_euler = (0, 0, heading)
    fur = mat_noise("GoatFur", [(0.3, "#6b4a32"), (0.55, "#efe7da"), (0.8, "#5a3a26")], scale=3, rough=0.95,
                    bump=0.2, world=False)
    part("sphere", fur, (0, 0, 0.55), (0.18, 0.42, 0.2), parent=root)
    neck = empty("GoatNeck", (0, -0.38, 0.65), root)
    part("sphere", fur, (0, -0.06, 0.1), (0.08, 0.1, 0.14), (rad(-30), 0, 0), parent=neck)
    part("sphere", fur, (0, -0.16, 0.2), (0.07, 0.14, 0.08), parent=neck)
    horn = mat_flat("Horn", "#3a2e24", 0.6)
    for sx in (0.04, -0.04):
        part("cone", horn, (sx, -0.08, 0.32), (0.018, 0.018, 0.09), (rad(40), 0, 0), parent=neck)
        part("sphere", fur, (sx * 2.2, -0.1, 0.25), (0.06, 0.02, 0.025), parent=neck)
    legs = []
    for lx, ly in ((0.1, -0.3), (-0.1, -0.3), (0.1, 0.3), (-0.1, 0.3)):
        e = empty("GoatLeg", (lx, ly, 0.48), root)
        part("sphere", fur, (0, 0, -0.24), (0.035, 0.035, 0.25), parent=e)
        legs.append(e)
    part("cone", fur, (0, 0.42, 0.68), (0.03, 0.03, 0.06), (rad(-50), 0, 0), parent=root)
    return root, legs, neck


def goat_walk(root, legs, f0, f1, a, b, step=10):
    h = math.atan2(b[0] - a[0], -(b[1] - a[1]))
    key(root, f0, location=a, rotation_euler=(0, 0, h))
    key(root, f1, location=b, rotation_euler=(0, 0, h))
    f, s = f0, 1
    while f <= f1:
        for i, e in enumerate(legs):
            sign = s if i in (0, 3) else -s
            key(e, f, rotation_euler=(rad(25 * sign), 0, 0))
        f += step // 2
        s = -s


# ======================================================================= scene-wide look
def setup_look(scene, sun_elev=12, sun_az=-35, sun_col=(1.0, 0.68, 0.42), sun_energy=4.5,
               sky_top="#e9b07a", sky_horizon="#f6d2a0", sky_strength=1.0, haze_col="#e8b98a", haze=0.55,
               mist_start=8, mist_depth=90, bloom=True):
    world = bpy.data.worlds.new("World")
    scene.world = world
    world.use_nodes = True
    nt = world.node_tree
    bg = nt.nodes["Background"]
    grad = nt.nodes.new("ShaderNodeTexGradient")
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Generated"], sep.inputs[0])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.5
    ramp.color_ramp.elements[0].color = rgba(sky_horizon)
    ramp.color_ramp.elements[1].position = 0.75
    ramp.color_ramp.elements[1].color = rgba(sky_top)
    nt.links.new(sep.outputs["Z"], ramp.inputs["Fac"])
    cl = nt.nodes.new("ShaderNodeTexNoise")
    cl.inputs["Scale"].default_value = 2.2
    cl.inputs["Detail"].default_value = 8
    nt.links.new(tc.outputs["Generated"], cl.inputs["Vector"])
    cr = nt.nodes.new("ShaderNodeValToRGB")
    cr.color_ramp.elements[0].position = 0.5
    cr.color_ramp.elements[0].color = (0, 0, 0, 1)
    cr.color_ramp.elements[1].position = 0.75
    cr.color_ramp.elements[1].color = (1, 1, 1, 1)
    nt.links.new(cl.outputs["Fac"], cr.inputs["Fac"])
    cm = nt.nodes.new("ShaderNodeMixRGB")
    nt.links.new(cr.outputs["Color"], cm.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], cm.inputs["Color1"])
    cm.inputs["Color2"].default_value = rgba("#fbe6c8")
    nt.links.new(cm.outputs["Color"], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = sky_strength
    world.mist_settings.start = mist_start
    world.mist_settings.depth = mist_depth
    world.mist_settings.falloff = "QUADRATIC"

    sd = bpy.data.lights.new("Sun", "SUN")
    sd.energy = sun_energy
    sd.color = sun_col
    sd.angle = rad(2.5)
    sun = bpy.data.objects.new("Sun", sd)
    scene.collection.objects.link(sun)
    sun.rotation_euler = (rad(90 - sun_elev), 0, rad(sun_az))

    scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = "AgX - High Contrast"
    try:
        scene.eevee.use_raytracing = True
        scene.eevee.ray_tracing_options.resolution_scale = "2"
    except Exception:
        pass
    scene.eevee.use_shadows = True

    # compositor: warm depth haze + bloom
    scene.view_layers[0].use_pass_mist = True
    scene.use_nodes = True
    ct = scene.node_tree
    for n in list(ct.nodes):
        ct.nodes.remove(n)
    rl = ct.nodes.new("CompositorNodeRLayers")
    comp = ct.nodes.new("CompositorNodeComposite")
    mix = ct.nodes.new("CompositorNodeMixRGB")
    mul = ct.nodes.new("CompositorNodeMath")
    mul.operation = "MULTIPLY"
    mul.inputs[1].default_value = haze
    ct.links.new(rl.outputs["Mist"], mul.inputs[0])
    ct.links.new(mul.outputs[0], mix.inputs[0])
    ct.links.new(rl.outputs["Image"], mix.inputs[1])
    mix.inputs[2].default_value = rgba(haze_col)
    hs = ct.nodes.new("CompositorNodeHueSat")
    ct.links.new(mix.outputs[0], hs.inputs["Image"])
    try:
        hs.inputs["Saturation"].default_value = 1.15
    except Exception:
        hs.color_saturation = 1.15
    last = hs.outputs[0]
    if bloom:
        gl = ct.nodes.new("CompositorNodeGlare")
        try:
            gl.glare_type = "BLOOM"
        except Exception:
            gl.glare_type = "FOG_GLOW"
        for attr, val in (("threshold", 0.9), ("size", 7), ("mix", -0.6), ("quality", "MEDIUM")):
            try:
                setattr(gl, attr, val)
            except Exception:
                pass
        ct.links.new(last, gl.inputs[0])
        last = gl.outputs[0]
    ct.links.new(last, comp.inputs["Image"])
    return sun, world
