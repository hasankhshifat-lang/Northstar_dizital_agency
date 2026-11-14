"""Northstar Dizital 3D logo reveal for Shorts / Reels (9:16, 1080x1920, 5 s @ 30 fps).

Built from the real logo: trace_logo.py turns assets/logo.png into logo_mark.svg (the N),
logo_star.svg (the four-point star) and logo_word.svg (one path per letter).

  blender -b -P social/3d/logo_reveal/logo_reveal_short.py -- --out out/check.png --frame 120 --preview
  blender -b -P social/3d/logo_reveal/logo_reveal_short.py -- --out out/preview.mp4 --preview
  blender -b -P social/3d/logo_reveal/logo_reveal_short.py -- --out out/final.mp4 --samples 24

Timeline: star streaks in and lands (f1-40) with a flash and shockwave ring, the N flips up and
extrudes (f18-56), the wordmark flips up letter by letter (f50-95), a light sweep glints across
(f95-130), then a gentle hold.
"""
import math
import os
import sys

import bpy
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", ".claude", "skills", "blender-3d-animation", "scripts"))
import bl_helpers as H  # noqa: E402

# Brand colours (style.css)
PURPLE, PURPLE_LIGHT, MAGENTA, ORANGE, TEXT, BG = "#9566FF", "#B49AFF", "#EC5AAE", "#FF9A62", "#F7F5FA", "#101010"

args = H.parse_args()
H.reset_scene()
scene = H.setup_render(args, fps=30, seconds=5, vertical=True)
H.world_color(H.hex_rgb(BG), strength=0.4)
scene.eevee.use_shadows = True


# ------------------------------------------------------------------ helpers
def import_svg(name):
    """Import an SVG and return its curve objects (one per <path>), left to right."""
    before = set(bpy.data.objects)
    bpy.ops.import_curve.svg(filepath=os.path.join(HERE, name))
    objs = [o for o in bpy.data.objects if o not in before and o.type == "CURVE"]
    for o in objs:
        bpy.context.view_layer.objects.active = o
        o.select_set(True)
        bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
        o.select_set(False)
    return sorted(objs, key=lambda o: o.location.x)


def bbox(objs):
    pts = [o.matrix_world @ Vector(c) for o in objs for c in o.bound_box]
    lo = Vector([min(p[i] for p in pts) for i in range(3)])
    hi = Vector([max(p[i] for p in pts) for i in range(3)])
    return lo, hi


def make_root(name, objs, height=None, width=None, location=(0, 0, 0)):
    """Parent objs to an upright empty, scaled so the group has the given world height/width.
    Children keep their layout as local offsets in the SVG plane (local X right, local Y up)."""
    lo, hi = bbox(objs)
    centre = (lo + hi) / 2
    s = height / (hi.y - lo.y) if height else width / (hi.x - lo.x)
    root = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(root)
    for o in objs:
        o.location = o.location - centre
        o.parent = root
    root.rotation_euler = (math.radians(90), 0, 0)
    root.scale = (s, s, s)
    root.location = location
    return root, s


def curve_style(o, mat, depth, bevel, s):
    o.data.extrude = depth / s
    o.data.bevel_depth = bevel / s
    o.data.bevel_resolution = 3
    o.data.resolution_u = 24
    H.assign(o, mat)


def emission_key(mat, frame, strength):
    sock = mat.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"]
    sock.default_value = strength
    sock.keyframe_insert("default_value", frame=frame)


def glow_backdrop():
    """Dark backdrop with soft magenta and orange glows, like the website hero."""
    plane = H.add("plane", "Backdrop", location=(0, 9, 0.5), scale=1)
    plane.scale = (14, 22, 1)
    plane.rotation_euler = (math.radians(90), 0, 0)
    mat = bpy.data.materials.new("Backdrop")
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    emit = nt.nodes.new("ShaderNodeEmission")
    emit.inputs["Strength"].default_value = 1.0
    coord = nt.nodes.new("ShaderNodeTexCoord")
    total = nt.nodes.new("ShaderNodeRGB")
    total.outputs[0].default_value = (*H.hex_rgb(BG), 1)
    acc = total.outputs[0]
    for colour, centre, radius, power in ((MAGENTA, (0.10, 0.74), 0.40, 0.30),
                                          (ORANGE, (0.92, 0.30), 0.38, 0.26),
                                          (PURPLE, (0.50, 0.56), 0.45, 0.10)):
        mp = nt.nodes.new("ShaderNodeMapping")
        mp.inputs["Location"].default_value = (-centre[0] / radius, -centre[1] / radius * (22 / 14), 0)
        mp.inputs["Scale"].default_value = (1 / radius, 22 / 14 / radius, 1)
        nt.links.new(coord.outputs["UV"], mp.inputs["Vector"])
        grad = nt.nodes.new("ShaderNodeTexGradient")
        grad.gradient_type = "SPHERICAL"
        nt.links.new(mp.outputs["Vector"], grad.inputs["Vector"])
        pw = nt.nodes.new("ShaderNodeMath")
        pw.operation = "POWER"
        pw.inputs[1].default_value = 2.2
        nt.links.new(grad.outputs["Fac"], pw.inputs[0])
        mul = nt.nodes.new("ShaderNodeMath")
        mul.operation = "MULTIPLY"
        mul.inputs[1].default_value = power
        nt.links.new(pw.outputs[0], mul.inputs[0])
        mix = nt.nodes.new("ShaderNodeMix")
        mix.data_type = "RGBA"
        mix.blend_type = "ADD"
        nt.links.new(mul.outputs[0], mix.inputs["Factor"])
        nt.links.new(acc, mix.inputs[6])
        mix.inputs[7].default_value = (*H.hex_rgb(colour), 1)
        acc = mix.outputs[2]
    nt.links.new(acc, emit.inputs["Color"])
    nt.links.new(emit.outputs[0], out.inputs["Surface"])
    H.assign(plane, mat)
    return plane


def add_bloom():
    scene.use_nodes = True
    nt = scene.node_tree
    nt.nodes.clear()
    rl = nt.nodes.new("CompositorNodeRLayers")
    glare = nt.nodes.new("CompositorNodeGlare")
    comp = nt.nodes.new("CompositorNodeComposite")
    glare.glare_type = "FOG_GLOW"
    for attr, val in (("quality", "HIGH"), ("threshold", 0.9), ("size", 8), ("mix", -0.55)):
        if hasattr(glare, attr):
            try:
                setattr(glare, attr, val)
            except (TypeError, AttributeError):
                pass
    for sock, val in (("Threshold", 0.9), ("Strength", 0.55), ("Size", 0.6)):
        if sock in glare.inputs:
            glare.inputs[sock].default_value = val
    nt.links.new(rl.outputs["Image"], glare.inputs["Image"])
    nt.links.new(glare.outputs["Image"], comp.inputs["Image"])


# ------------------------------------------------------------------ materials
mark_mat = H.material("Mark", PURPLE, metallic=0.55, roughness=0.22)
mark_mat.node_tree.nodes["Principled BSDF"].inputs["Coat Weight"].default_value = 0.6
star_mat = H.material("Star", "#ffffff", roughness=0.2, emission=PURPLE_LIGHT, emission_strength=6)
word_mat = H.material("Word", TEXT, metallic=0.1, roughness=0.32)
ring_mat = H.material("Ring", "#ffffff", emission=PURPLE_LIGHT, emission_strength=0)

# ------------------------------------------------------------------ logo
mark = import_svg("logo_mark.svg")[0]
star = import_svg("logo_star.svg")[0]
letters = import_svg("logo_word.svg")

mark_root, ms = make_root("MarkRoot", [mark, star], height=3.3, location=(0, 0, 1.75))
word_root, ws = make_root("WordRoot", letters, width=5.7, location=(0, 0, -0.95))

curve_style(mark, mark_mat, depth=0.22, bevel=0.025, s=ms)
curve_style(star, star_mat, depth=0.10, bevel=0.02, s=ms)
for L in letters:
    curve_style(L, word_mat, depth=0.10, bevel=0.012, s=ws)

# Star: streaks in from the top right, spinning, and lands on its place in the logo
star_home = star.location.copy()
u = 1 / ms  # one world unit in the mark's local units
H.key(star, 1, location=star_home + Vector((3.5 * u, 6.5 * u, -2 * u)), rotation_euler=(0, 0, math.radians(-540)),
      scale=(0.25,) * 3)
H.key(star, 36, location=star_home, rotation_euler=(0, 0, 0), scale=(1.35,) * 3)
H.key(star, 44, scale=(0.92,) * 3)
H.key(star, 50, scale=(1.0,) * 3)
H.key(star, 150, location=star_home, rotation_euler=(0, 0, math.radians(20)), scale=(1.0,) * 3)
emission_key(star_mat, 1, 10)
emission_key(star_mat, 36, 40)
emission_key(star_mat, 52, 7)
emission_key(star_mat, 118, 12)
emission_key(star_mat, 132, 7)

# Flash light at the landing point
flash = H.light("POINT", location=(0, -1.5, 0), energy=0, color=PURPLE_LIGHT, size=0.3)
flash.data.shadow_soft_size = 0.4

# N mark: flips up from flat, grows its depth
mark_home = mark.location.copy()
H.key(mark, 1, location=mark_home + Vector((0, -2.2 * u, 0)), rotation_euler=(math.radians(-90), 0, 0),
      scale=(0.7,) * 3)
H.key(mark, 18, location=mark_home + Vector((0, -2.2 * u, 0)), rotation_euler=(math.radians(-90), 0, 0),
      scale=(0.7,) * 3)
H.key(mark, 44, location=mark_home + Vector((0, 0.08 * u, 0)), rotation_euler=(math.radians(6), 0, 0),
      scale=(1.04,) * 3)
H.key(mark, 54, location=mark_home, rotation_euler=(0, 0, 0), scale=(1,) * 3)
mark.data.extrude = 0.005 / ms
mark.data.keyframe_insert("extrude", frame=24)
mark.data.extrude = 0.22 / ms
mark.data.keyframe_insert("extrude", frame=56)

# Wordmark: each letter flips up in turn
for i, L in enumerate(letters):
    home = L.location.copy()
    f0 = 50 + i * 2
    H.key(L, 1, location=home + Vector((0, -0.6 / ws, 0)), rotation_euler=(math.radians(-95), 0, 0), scale=(0.001,) * 3)
    H.key(L, f0, location=home + Vector((0, -0.6 / ws, 0)), rotation_euler=(math.radians(-95), 0, 0), scale=(0.001,) * 3)
    H.key(L, f0 + 1, scale=(1,) * 3)
    H.key(L, f0 + 14, location=home + Vector((0, 0.04 / ws, 0)), rotation_euler=(math.radians(8), 0, 0))
    H.key(L, f0 + 20, location=home, rotation_euler=(0, 0, 0))

# Gentle float of the whole logo during the hold
for root, z in ((mark_root, 1.75), (word_root, -0.95)):
    H.key(root, 90, location=(0, 0, z))
    H.key(root, 150, location=(0, 0, z + 0.08))

# ------------------------------------------------------------------ backdrop, lights, camera
glow_backdrop()

H.light("AREA", (4, -7, 6), 900, "#ffffff", size=5, target=(0, 0, 0.8))
H.light("AREA", (-6, -5, 1), 350, PURPLE_LIGHT, size=6, target=(0, 0, 0.8))
H.light("AREA", (0, 4, 4), 900, MAGENTA, size=4, target=(0, 0, 1))
H.light("AREA", (3, 4, -2), 600, ORANGE, size=4, target=(0, 0, 0))

# Light sweep: a narrow bright strip passes across the front for a glint
sweep = H.light("AREA", (-7, -5, 1.5), 0, "#ffffff", size=0.6, target=(0, 0, 0.8))
sweep.data.shape = "RECTANGLE"
sweep.data.size_y = 8
for f, x, e in ((92, -7, 0), (96, -6, 2500), (128, 7, 2500), (132, 8, 0)):
    sweep.location.x = x
    sweep.keyframe_insert("location", frame=f)
    sweep.data.energy = e
    sweep.data.keyframe_insert("energy", frame=f)

cam = H.camera(location=(-1.0, -20, 1.6), target=(0, 0, 0.75), lens=50)
H.key(cam, 1, location=(-1.0, -20, 1.6))
H.key(cam, 150, location=(0.35, -16.2, 0.9))
target = H.empty("CamTarget", (0, 0, 0.75))
H.track_to(cam, target)

# Flash + shockwave ring at the star's landing spot
bpy.context.view_layer.update()
star_world = mark_root.matrix_world @ star_home
flash.location = star_world + Vector((0, -1.2, 0))
for f, e in ((30, 0), (36, 1800), (54, 0)):
    flash.data.energy = e
    flash.data.keyframe_insert("energy", frame=f)

ring = H.add("torus", "Shockwave", location=star_world, major_radius=0.5, minor_radius=0.025)
ring.rotation_euler = (math.radians(90), 0, 0)
H.assign(ring, ring_mat)
H.key(ring, 35, scale=(0.05,) * 3)
H.key(ring, 37, scale=(0.3,) * 3)
H.key(ring, 58, scale=(4.5,) * 3)
H.key(ring, 59, "CONSTANT", scale=(0.0001,) * 3)
emission_key(ring_mat, 35, 0)
emission_key(ring_mat, 37, 30)
emission_key(ring_mat, 58, 0)
ring_mat.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0, 0, 0, 1)

add_bloom()
H.render(args)
