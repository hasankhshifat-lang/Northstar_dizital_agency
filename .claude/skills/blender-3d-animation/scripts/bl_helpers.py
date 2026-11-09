"""Helpers for building and rendering Blender scenes headlessly.

Import from a scene script that Blender runs:
    blender -b -P my_scene.py -- --out out/clip.mp4 --preview

Inside the scene script:
    import sys, os
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "scripts"))
    import bl_helpers as H
    args = H.parse_args()
    H.reset_scene()
    H.setup_render(args, fps=30, seconds=4, vertical=True)
    ... build objects, keyframes ...
    H.render(args)
"""
import argparse
import math
import os
import sys

import bpy


# ---------------------------------------------------------------- arguments
def parse_args():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    p = argparse.ArgumentParser()
    p.add_argument("--out", default="out/render.mp4",
                   help=".mp4 for video, .png for a still, or a folder ending in / for a PNG sequence")
    p.add_argument("--engine", default="EEVEE", choices=["EEVEE", "CYCLES", "WORKBENCH"])
    p.add_argument("--preview", action="store_true",
                   help="Half resolution and low samples for a fast check")
    p.add_argument("--frame", type=int, default=None, help="Render only this frame as a still")
    p.add_argument("--samples", type=int, default=None)
    p.add_argument("--save-blend", default=None, help="Also save the .blend file here")
    return p.parse_args(argv)


# ---------------------------------------------------------------- scene setup
def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    return bpy.context.scene


def setup_render(args, fps=30, seconds=5, vertical=False, width=None, height=None):
    """Set resolution, frame range, engine, color management and output format."""
    scene = bpy.context.scene
    if width is None or height is None:
        width, height = (1080, 1920) if vertical else (1920, 1080)
    scene.render.resolution_x = width
    scene.render.resolution_y = height
    scene.render.resolution_percentage = 50 if args.preview else 100
    scene.render.fps = fps
    scene.frame_start = 1
    scene.frame_end = int(fps * seconds)

    engine = {"EEVEE": "BLENDER_EEVEE_NEXT", "CYCLES": "CYCLES",
              "WORKBENCH": "BLENDER_WORKBENCH"}[args.engine]
    try:
        scene.render.engine = engine
    except TypeError:  # Blender 5.x renamed EEVEE Next back to BLENDER_EEVEE
        scene.render.engine = "BLENDER_EEVEE"
    if args.engine == "CYCLES":
        scene.cycles.device = "CPU"
        scene.cycles.samples = args.samples or (16 if args.preview else 128)
        scene.cycles.use_denoising = True
    elif args.engine == "EEVEE":
        scene.eevee.taa_render_samples = args.samples or (8 if args.preview else 64)

    scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = "AgX - Medium High Contrast"
    return scene


def world_color(rgb=(0.05, 0.05, 0.07), strength=1.0):
    world = bpy.data.worlds.new("World")
    bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (*rgb, 1)
    bg.inputs["Strength"].default_value = strength
    return world


# ---------------------------------------------------------------- materials
def hex_rgb(h):
    h = h.lstrip("#")
    srgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    # sRGB -> linear, which is what Blender colour sockets expect
    return tuple(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in srgb)


def material(name, color="#cccccc", metallic=0.0, roughness=0.5, emission=None, emission_strength=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*hex_rgb(color), 1)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    if emission:
        bsdf.inputs["Emission Color"].default_value = (*hex_rgb(emission), 1)
        bsdf.inputs["Emission Strength"].default_value = emission_strength
    return mat


def assign(obj, mat):
    obj.data.materials.clear()
    obj.data.materials.append(mat)
    return obj


# ---------------------------------------------------------------- objects
def add(kind, name=None, location=(0, 0, 0), scale=1.0, smooth=True, **kw):
    """kind: cube, sphere, cylinder, cone, torus, plane, monkey."""
    ops = {
        "cube": bpy.ops.mesh.primitive_cube_add,
        "sphere": bpy.ops.mesh.primitive_uv_sphere_add,
        "cylinder": bpy.ops.mesh.primitive_cylinder_add,
        "cone": bpy.ops.mesh.primitive_cone_add,
        "torus": bpy.ops.mesh.primitive_torus_add,
        "plane": bpy.ops.mesh.primitive_plane_add,
        "monkey": bpy.ops.mesh.primitive_monkey_add,
    }
    if kind == "sphere":
        kw.setdefault("segments", 64)
        kw.setdefault("ring_count", 32)
    ops[kind](location=location, **kw)
    obj = bpy.context.active_object
    if name:
        obj.name = name
    obj.scale = (scale,) * 3 if isinstance(scale, (int, float)) else scale
    if smooth and kind not in ("cube", "plane"):
        bpy.ops.object.shade_smooth()
    return obj


def text(body, name="Text", location=(0, 0, 0), size=1.0, extrude=0.05, font_path=None):
    bpy.ops.object.text_add(location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.data.body = body
    obj.data.size = size
    obj.data.extrude = extrude
    obj.data.align_x = "CENTER"
    obj.data.align_y = "CENTER"
    if font_path and os.path.exists(font_path):
        obj.data.font = bpy.data.fonts.load(font_path)
    return obj


def bevel(obj, width=0.03, segments=3):
    mod = obj.modifiers.new("Bevel", "BEVEL")
    mod.width = width
    mod.segments = segments
    return mod


# ---------------------------------------------------------------- camera & lights
def camera(location=(0, -10, 4), target=(0, 0, 0), lens=50):
    cam_data = bpy.data.cameras.new("Camera")
    cam_data.lens = lens
    cam = bpy.data.objects.new("Camera", cam_data)
    bpy.context.collection.objects.link(cam)
    cam.location = location
    look_at(cam, target)
    bpy.context.scene.camera = cam
    return cam


def look_at(obj, target):
    """Point obj at a fixed location (one-off). For tracking over time use track_to()."""
    from mathutils import Vector
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def track_to(obj, target_obj):
    c = obj.constraints.new("TRACK_TO")
    c.target = target_obj
    c.track_axis = "TRACK_NEGATIVE_Z"
    c.up_axis = "UP_Y"
    return c


def empty(name="Target", location=(0, 0, 0)):
    e = bpy.data.objects.new(name, None)
    e.location = location
    bpy.context.collection.objects.link(e)
    return e


def light(kind="AREA", location=(4, -4, 6), energy=500, color="#ffffff", size=3, target=(0, 0, 0)):
    data = bpy.data.lights.new(kind.title(), kind)
    data.energy = energy
    data.color = hex_rgb(color)
    if kind == "AREA":
        data.size = size
    obj = bpy.data.objects.new(data.name, data)
    bpy.context.collection.objects.link(obj)
    obj.location = location
    look_at(obj, target)
    return obj


def three_point_lights(key=800, fill=250, rim=600):
    light("AREA", (5, -5, 6), key, "#fff3e0", size=4)
    light("AREA", (-6, -3, 3), fill, "#dfe9ff", size=6)
    light("AREA", (0, 6, 5), rim, "#ffffff", size=3)


# ---------------------------------------------------------------- animation
def key(obj, frame, interpolation="BEZIER", **props):
    """key(obj, 1, location=(0,0,0), rotation_euler=(0,0,0), scale=(1,1,1))."""
    for prop, value in props.items():
        setattr(obj, prop, value)
        obj.keyframe_insert(data_path=prop, frame=frame)
    if obj.animation_data and obj.animation_data.action:
        for fc in _fcurves(obj.animation_data.action):
            for kp in fc.keyframe_points:
                if int(kp.co.x) == frame:
                    kp.interpolation = interpolation


def _fcurves(action):
    # Blender 4.4+ layered actions keep fcurves in channelbags; older ones on the action.
    if hasattr(action, "fcurves") and len(action.fcurves):
        return list(action.fcurves)
    out = []
    for layer in getattr(action, "layers", []):
        for strip in layer.strips:
            for bag in getattr(strip, "channelbags", []):
                out.extend(bag.fcurves)
    return out


def ease(obj, mode="EASE_IN_OUT", easing="AUTO"):
    if obj.animation_data and obj.animation_data.action:
        for fc in _fcurves(obj.animation_data.action):
            for kp in fc.keyframe_points:
                kp.easing = easing if mode == "AUTO" else mode


def loop_cycles(obj):
    """Make every fcurve on obj repeat forever (good for spins/bobs)."""
    if obj.animation_data and obj.animation_data.action:
        for fc in _fcurves(obj.animation_data.action):
            fc.modifiers.new("CYCLES")


def orbit_camera(cam, target=(0, 0, 0), radius=10, height=4, start_deg=-90, end_deg=270, frames=None):
    """Parent the camera to a spinning empty for a smooth turntable orbit."""
    scene = bpy.context.scene
    frames = frames or (scene.frame_start, scene.frame_end)
    pivot = empty("CamPivot", target)
    cam.parent = pivot
    cam.location = (0, -radius, height)
    tgt = empty("CamTarget", target)
    track_to(cam, tgt)
    key(pivot, frames[0], "LINEAR", rotation_euler=(0, 0, math.radians(start_deg + 90)))
    key(pivot, frames[1], "LINEAR", rotation_euler=(0, 0, math.radians(end_deg + 90)))
    return pivot


# ---------------------------------------------------------------- render
def render(args):
    scene = bpy.context.scene
    out = os.path.abspath(args.out)
    os.makedirs(os.path.dirname(out) if not out.endswith("/") else out, exist_ok=True)
    if args.save_blend:
        bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(args.save_blend))

    still = args.frame is not None or out.lower().endswith((".png", ".jpg"))
    if still:
        scene.frame_set(args.frame or scene.frame_start)
        scene.render.image_settings.file_format = "JPEG" if out.lower().endswith(".jpg") else "PNG"
        scene.render.filepath = out
        bpy.ops.render.render(write_still=True)
        print(f"RENDERED still -> {out}")
        return out

    if out.endswith("/"):
        scene.render.image_settings.file_format = "PNG"
        scene.render.filepath = os.path.join(out, "frame_")
        bpy.ops.render.render(animation=True)
        print(f"RENDERED PNG sequence -> {out}")
        return out

    # MP4 (H.264). Blender 4.x uses the FFMPEG file format; 5.x keeps the same keys.
    scene.render.image_settings.file_format = "FFMPEG"
    scene.render.ffmpeg.format = "MPEG4"
    scene.render.ffmpeg.codec = "H264"
    scene.render.ffmpeg.constant_rate_factor = "HIGH"
    scene.render.ffmpeg.ffmpeg_preset = "GOOD"
    scene.render.ffmpeg.audio_codec = "NONE"
    scene.render.filepath = out
    bpy.ops.render.render(animation=True)
    print(f"RENDERED video -> {out}")
    return out
