"""Wari-Bateshwar: The Bead Makers — 30 s, 9:16, 24 fps, five shots synced to the Bangla voiceover.

Render (frames are resumable: existing PNGs are skipped):
  blender -b -P scene.py -- --out out/frames_preview/ --preview
  blender -b -P scene.py -- --out out/check.png --frame 240 --preview
Then run build_video.py to add the voiceover and Bangla captions.
"""
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", ".claude", "skills", "blender-3d-animation", "scripts"))
import bpy  # noqa: E402
import bl_helpers as H  # noqa: E402

FPS = 24
SECONDS = 30
# Shot cut points (seconds), taken from the pauses in audio/take1.mp3
CUTS = [0, 7.3, 13.1, 17.5, 23.5, 30]
F = [int(round(c * FPS)) + 1 for c in CUTS]  # frame where each shot starts (1-based)

args = H.parse_args()
H.reset_scene()
scene = H.setup_render(args, fps=FPS, seconds=SECONDS, vertical=True)
scene.render.use_overwrite = False      # resume: skip frames already on disk
scene.render.use_placeholder = True
if args.engine == "EEVEE":
    scene.eevee.use_shadows = True

rad = math.radians

# ---------------------------------------------------------------- palette
M = {
    "earth": H.material("Earth", "#8f8048", roughness=0.95),
    "bank": H.material("Bank", "#9a7b52", roughness=0.95),
    "water": H.material("Water", "#2e7f88", roughness=0.08, metallic=0.1),
    "mud": H.material("Mud", "#a8714a", roughness=0.9),
    "wall": H.material("Wall", "#8a5a3c", roughness=0.9),
    "thatch": H.material("Thatch", "#c9a24a", roughness=0.9),
    "wood": H.material("Wood", "#6b4426", roughness=0.7),
    "sail": H.material("Sail", "#eadcbf", roughness=0.8),
    "leaf": H.material("Leaf", "#3f7a3a", roughness=0.8),
    "trunk": H.material("Trunk", "#7a5a3a", roughness=0.9),
    "skin": H.material("Skin", "#9a6440", roughness=0.6),
    "skin2": H.material("Skin2", "#7c4f33", roughness=0.6),
    "hair": H.material("Hair", "#151010", roughness=0.5),
    "eye": H.material("Eye", "#0a0a0a", roughness=0.2),
    "saree": H.material("Saree", "#a3212b", roughness=0.6),
    "blouse": H.material("Blouse", "#e08a2e", roughness=0.6),
    "dhoti": H.material("Dhoti", "#efe6d2", roughness=0.7),
    "shawl": H.material("Shawl", "#2f4f8f", roughness=0.6),
    "turban": H.material("Turban", "#e3a21a", roughness=0.6),
    "extra1": H.material("Extra1", "#5d7d3a", roughness=0.7),
    "extra2": H.material("Extra2", "#7a3f6b", roughness=0.7),
    "silver": H.material("Silver", "#d9d9e0", metallic=1.0, roughness=0.2),
    "bead": H.material("Bead", "#d6452b", roughness=0.15, emission="#ff3a1a", emission_strength=1.5),
}


def put(kind, mat, location=(0, 0, 0), scale=1.0, rotation=(0, 0, 0), parent=None, name=None, **kw):
    o = H.add(kind, name, location=location, scale=scale, **kw)
    o.rotation_euler = rotation
    H.assign(o, mat)
    if parent:
        o.parent = parent
    return o


# ---------------------------------------------------------------- world & sky (dawn -> day -> sunset)
world = H.world_color((0.6, 0.4, 0.3), strength=1.0)
bg = world.node_tree.nodes["Background"]
for frame, col, s in [(1, (0.85, 0.5, 0.32), 0.9), (F[2], (0.55, 0.7, 0.95), 1.3),
                      (F[4], (0.6, 0.65, 0.85), 1.2), (F[5], (0.95, 0.45, 0.25), 1.0)]:
    bg.inputs["Color"].default_value = (*col, 1)
    bg.inputs["Strength"].default_value = s
    bg.inputs["Color"].keyframe_insert("default_value", frame=frame)
    bg.inputs["Strength"].keyframe_insert("default_value", frame=frame)

sun_data = bpy.data.lights.new("Sun", "SUN")
sun = bpy.data.objects.new("Sun", sun_data)
scene.collection.objects.link(sun)
sun_data.angle = rad(3)
for frame, rot, col, energy in [
    (1, (rad(80), 0, rad(-60)), (1.0, 0.65, 0.4), 2.5),
    (F[2], (rad(40), 0, rad(-20)), (1.0, 0.95, 0.88), 4.0),
    (F[4], (rad(50), 0, rad(20)), (1.0, 0.9, 0.8), 3.5),
    (F[5], (rad(78), 0, rad(60)), (1.0, 0.55, 0.3), 2.5),
]:
    sun.rotation_euler = rot
    sun_data.color = col
    sun_data.energy = energy
    sun.keyframe_insert("rotation_euler", frame=frame)
    sun_data.keyframe_insert("color", frame=frame)
    sun_data.keyframe_insert("energy", frame=frame)

# ---------------------------------------------------------------- land, river, jetty
put("plane", M["earth"], (0, 20, 0), scale=(80, 30, 1))
put("plane", M["bank"], (0, -2.6, 0.005), scale=(80, 1.2, 1))
put("plane", M["water"], (0, -14, 0.0), scale=(80, 10.5, 1))
put("plane", M["earth"], (0, -40, 0.01), scale=(80, 14, 1))        # far bank
put("cube", M["wood"], (1.6, -4.3, 0.12), scale=(0.45, 1.0, 0.05))   # jetty deck
for y in (-3.5, -5.1):
    for x in (1.25, 1.95):
        put("cylinder", M["wood"], (x, y, -0.2), scale=(0.06, 0.06, 0.35))

# ---------------------------------------------------------------- town wall with a gate, huts inside
TOWN = (0, 11)
W, D, HGT, T = 18, 13, 1.9, 0.7
cx, cy = TOWN
for (x, y, sx, sy) in [
    (cx, cy + D / 2, W / 2, T / 2),                      # back
    (cx - W / 2, cy, T / 2, D / 2), (cx + W / 2, cy, T / 2, D / 2),  # sides
    (cx - (W / 4 + 0.9), cy - D / 2, W / 4 - 0.9, T / 2),  # front left of gate
    (cx + (W / 4 + 0.9), cy - D / 2, W / 4 - 0.9, T / 2),  # front right of gate
]:
    seg = put("cube", M["wall"], (x, y, HGT / 2), scale=(sx, sy, HGT / 2))
    H.bevel(seg, 0.08, 2)


def hut(x, y, r=1.5, h=2.0, rot=0):
    put("cylinder", M["mud"], (x, y, h / 2), scale=(r, r, h / 2), vertices=24)
    put("cone", M["thatch"], (x, y, h + 0.75), scale=(r * 1.35, r * 1.35, 0.8),
        rotation=(0, 0, rot), vertices=24)
    put("cube", M["wood"], (x, y - r + 0.02, 0.6), scale=(0.35, 0.05, 0.6))  # door


for (x, y, r) in [(-5.5, 8.5, 1.4), (-1.8, 9.5, 1.6), (2.2, 8.8, 1.5), (5.8, 9.2, 1.3),
                  (-6, 13.2, 1.5), (-2.4, 14, 1.4), (1.8, 13.6, 1.7), (5.6, 13.8, 1.4),
                  (0, 16, 1.2)]:
    hut(x, y, r)

# Workshop by the river, outside the wall
WORKSHOP = (-3.4, 1.2)
hut(*WORKSHOP, r=1.3, h=1.9)
BENCH = (-1.6, -0.55)
put("cube", M["wood"], (BENCH[0], BENCH[1], 0.78), scale=(0.75, 0.32, 0.04))
for dx in (-0.65, 0.65):
    put("cube", M["wood"], (BENCH[0] + dx, BENCH[1], 0.38), scale=(0.05, 0.28, 0.38))
bead = put("sphere", M["bead"], (BENCH[0] + 0.12, BENCH[1], 0.86), scale=0.06)
for i in range(6):  # finished beads lined up on the bench
    put("sphere", M["bead"], (BENCH[0] - 0.55 + i * 0.09, BENCH[1] + 0.12, 0.85), scale=0.035)
put("cylinder", M["wall"], (BENCH[0] + 0.5, BENCH[1] - 0.05, 0.9), scale=(0.12, 0.12, 0.08))  # pot


def palm(x, y, h=4.0, lean=8):
    tr = put("cylinder", M["trunk"], (x, y, h / 2), scale=(0.13, 0.13, h / 2),
             rotation=(rad(lean), 0, 0), vertices=12)
    top = (x, y + math.sin(rad(lean)) * h / 2, h)
    for i in range(6):
        a = i * math.pi / 3
        put("sphere", M["leaf"], (top[0] + math.cos(a) * 0.8, top[1] + math.sin(a) * 0.8, top[2] - 0.15),
            scale=(1.0, 0.3, 0.08), rotation=(0, rad(-18), a), segments=16, ring_count=8)
    return tr


for (x, y, h) in [(-7, -1.2, 4.2), (-9.5, 0.5, 3.6), (4.5, -1.0, 4.5), (7.5, 0.2, 3.8),
                  (-12, 3, 4), (11, 2, 4.3), (-5.4, 3.6, 3.4), (9.5, 6, 3.6), (-11, 9, 4.0)]:
    palm(x, y, h)

# ---------------------------------------------------------------- characters


def person(name, skin, top, bottom, female=False, headwear=None, height=1.0):
    root = H.empty(name)
    root.scale = (height,) * 3
    rig = {"root": root}
    skirt_depth = 0.95 if female else 0.55
    put("cone", M[bottom], (0, 0, 0.98 - skirt_depth / 2), parent=root,
        scale=(0.30 if female else 0.24, 0.30 if female else 0.22, skirt_depth / 2), vertices=24)
    torso = put("cylinder", M[top], (0, 0, 1.16), parent=root, scale=(0.19, 0.13, 0.26), vertices=20)
    if female:  # saree pallu across the chest
        put("cube", M[bottom], (0.02, -0.11, 1.18), parent=root, scale=(0.05, 0.02, 0.27),
            rotation=(0, rad(-35), 0))
    else:
        put("cube", M["shawl"], (0, -0.02, 1.25), parent=root, scale=(0.21, 0.15, 0.12))
    for side, sx in (("L", 0.1), ("R", -0.1)):
        hip = H.empty(f"{name}_hip{side}", (sx, 0, 0.85))
        hip.parent = root
        put("cylinder", M[skin], (0, 0, -0.42), parent=hip, scale=(0.055, 0.055, 0.42), vertices=12)
        put("sphere", M[skin], (0, -0.06, -0.84), parent=hip, scale=(0.06, 0.1, 0.035), segments=12, ring_count=8)
        rig["hip" + side] = hip
        sh = H.empty(f"{name}_sh{side}", (sx * 2.3, 0, 1.38))
        sh.parent = root
        put("cylinder", M[skin], (0, 0, -0.27), parent=sh, scale=(0.045, 0.045, 0.27), vertices=12)
        put("sphere", M[skin], (0, 0, -0.57), parent=sh, scale=0.055, segments=12, ring_count=8)
        rig["sh" + side] = sh
    neck = H.empty(f"{name}_neck", (0, 0, 1.45))
    neck.parent = root
    rig["neck"] = neck
    put("sphere", M[skin], (0, 0, 0.15), parent=neck, scale=0.15)
    put("sphere", M["hair"], (0, 0.025, 0.19), parent=neck, scale=(0.155, 0.15, 0.13))
    for ex in (0.05, -0.05):
        put("sphere", M["eye"], (ex, -0.135, 0.16), parent=neck, scale=0.018, segments=8, ring_count=6)
    if female:
        put("sphere", M["hair"], (0, 0.15, 0.17), parent=neck, scale=0.075)                 # bun
        put("sphere", M["bead"], (0, -0.142, 0.21), parent=neck, scale=0.012, segments=8, ring_count=6)  # tip
    if headwear == "turban":
        put("torus", M["turban"], (0, 0, 0.25), parent=neck, scale=(1, 1, 1.4),
            major_radius=0.13, minor_radius=0.05)
        put("sphere", M["turban"], (0, 0, 0.29), parent=neck, scale=(0.14, 0.14, 0.08))
    if not female:
        put("sphere", M["hair"], (0, -0.1, 0.06), parent=neck, scale=(0.09, 0.06, 0.06))   # beard
    return rig


def face(dx, dy):
    return math.atan2(dx, -dy)


def place(rig, frame, xy, heading, z=0.0):
    H.key(rig["root"], frame, location=(xy[0], xy[1], z), rotation_euler=(0, 0, heading))


def walk(rig, f0, f1, a, b, z=0.0, step=12):
    """Walk from a to b between frames f0..f1 with leg and arm swing."""
    h = face(b[0] - a[0], b[1] - a[1])
    H.key(rig["root"], f0, "LINEAR", location=(a[0], a[1], z), rotation_euler=(0, 0, h))
    H.key(rig["root"], f1, "LINEAR", location=(b[0], b[1], z), rotation_euler=(0, 0, h))
    f, s = f0, 1
    while f <= f1:
        H.key(rig["hipL"], f, rotation_euler=(rad(25 * s), 0, 0))
        H.key(rig["hipR"], f, rotation_euler=(rad(-25 * s), 0, 0))
        H.key(rig["shL"], f, rotation_euler=(rad(-20 * s), 0, 0))
        H.key(rig["shR"], f, rotation_euler=(rad(20 * s), 0, 0))
        f += step // 2
        s = -s
    rest(rig, f1 + 3)


def rest(rig, frame):
    for k in ("hipL", "hipR", "shL", "shR"):
        H.key(rig[k], frame, rotation_euler=(0, 0, rad(-5) if k == "shL" else (rad(5) if k == "shR" else 0)))


def arm(rig, side, frame, forward=0, out=0):
    """forward/out in degrees; positive forward raises the arm in front of the body."""
    H.key(rig["sh" + side], frame, rotation_euler=(rad(-forward), 0, rad(out if side == "L" else -out)))


def look(rig, frame, turn=0, nod=0):
    H.key(rig["neck"], frame, rotation_euler=(rad(nod), 0, rad(turn)))


mitra = person("Mitra", "skin", "blouse", "saree", female=True, height=0.95)
merchant = person("Merchant", "skin2", "dhoti", "dhoti", headwear="turban", height=1.05)
villager1 = person("Villager1", "skin2", "extra1", "dhoti", height=1.0)
villager2 = person("Villager2", "skin", "extra2", "extra2", female=True, height=0.92)

# Extras near the gate
place(villager1, 1, (1.6, 4.0), face(-1, -1))
place(villager2, 1, (-0.6, 3.6), face(1, -1))
look(villager1, 1, 0)
look(villager1, 60, 25)
look(villager1, 130, -15)
walk(villager2, F[4], F[5], (-0.6, 3.6), (2.5, 2.2))

# ---- Shot 2: Mitra polishing the bead at her bench
M_BENCH = (BENCH[0], BENCH[1] + 0.55)
place(mitra, 1, M_BENCH, face(0, -1))
rest(mitra, 1)
arm(mitra, "L", F[1], forward=55, out=8)
for i, f in enumerate(range(F[1], F[2] - 10, 10)):
    arm(mitra, "R", f, forward=60 + (8 if i % 2 else -4), out=-12 + (10 if i % 2 else 0))
look(mitra, F[1], 0, 25)
look(mitra, F[2] - 30, 0, 25)
look(mitra, F[2] - 10, 15, 5)       # glances up toward the river
H.key(bead, F[1], scale=(0.06,) * 3)
H.key(bead, F[1] + 40, scale=(0.075,) * 3)
H.key(bead, F[1] + 80, scale=(0.06,) * 3)

# ---- Shot 3: boat sails in, merchant steps ashore
boat = H.empty("Boat", (-40, -4.3, 0))
hull = put("cube", M["wood"], (0, 0, 0.25), scale=(1.9, 0.55, 0.28), parent=boat)
H.bevel(hull, 0.2, 4)
for dx in (-1.9, 1.9):
    put("cone", M["wood"], (dx * 1.05, 0, 0.42), scale=(0.3, 0.45, 0.35),
        rotation=(0, rad(90 if dx > 0 else -90), 0), parent=boat, vertices=16)
put("cylinder", M["wood"], (-0.3, 0, 1.8), scale=(0.05, 0.05, 1.6), parent=boat)
put("plane", M["sail"], (-0.3, 0.06, 2.0), scale=(0.9, 1.0, 1.0), rotation=(rad(90), 0, 0), parent=boat)
put("cube", M["wall"], (0.9, 0, 0.62), scale=(0.25, 0.25, 0.12), parent=boat)   # cargo
put("cube", M["wall"], (-1.1, 0.1, 0.62), scale=(0.22, 0.2, 0.1), parent=boat)

DOCK = (1.0, -4.3)
H.key(boat, 1, "LINEAR", location=(-60, -4.3, 0))
H.key(boat, F[2], location=(-14, -4.3, 0))
H.key(boat, F[2] + 60, location=(DOCK[0], DOCK[1], 0))
H.key(boat, F[5], location=(DOCK[0], DOCK[1], 0))
for f in range(1, F[5], 18):  # gentle bob
    H.key(boat, f, rotation_euler=(rad(1.5 if (f // 18) % 2 else -1.5), 0, 0))

# Merchant rides on deck (follows the boat), then walks up the jetty
merchant["root"].parent = None
deck_z = 0.53
for f, x in [(1, -60), (F[2], -14), (F[2] + 60, DOCK[0])]:
    place(merchant, f, (x + 0.4, -4.3), face(1, 0), z=deck_z)
look(merchant, F[2] + 20, -30)
look(merchant, F[2] + 55, 0)
walk(merchant, F[2] + 64, F[3] - 2, (1.6, -4.1), (0.9, -1.6), z=0.0)
# step down from the deck
H.key(merchant["root"], F[2] + 61, location=(1.4, -4.3, deck_z), rotation_euler=(0, 0, face(1, 0)))
H.key(merchant["root"], F[2] + 64, location=(1.6, -4.1, 0.17), rotation_euler=(0, 0, face(-0.7, 2.5)))

# ---- Shot 4: Mitra walks to meet him; coin for beads
MEET_M, MEET_T = (-0.35, -1.45), (0.45, -1.5)
walk(mitra, F[3], F[3] + 36, M_BENCH, MEET_M)
place(mitra, F[3] + 40, MEET_M, face(1, 0))
place(merchant, F[3], (0.9, -1.6), face(-1, 0))
place(merchant, F[3] + 30, MEET_T, face(-1, 0))
walk(merchant, F[3] + 2, F[3] + 28, (0.9, -1.6), MEET_T)
place(merchant, F[3] + 31, MEET_T, face(-1, 0))
look(mitra, F[3] + 40, 0, 0)
look(merchant, F[3] + 30, 0, 5)

coin = put("cylinder", M["silver"], (0, 0, 0), radius=0.05, depth=0.012, rotation=(rad(90), 0, rad(90)))
beads = put("torus", M["bead"], (0, 0, 0), major_radius=0.1, minor_radius=0.022, rotation=(rad(90), 0, rad(90)))
HAND_Z = 1.0
x_t, x_m = MEET_T[0] - 0.33, MEET_M[0] + 0.33
for obj, x0, x1 in [(coin, x_t, x_m), (beads, x_m, x_t)]:
    H.key(obj, 1, scale=(0, 0, 0), location=(x0, -1.48, HAND_Z))
    H.key(obj, F[3] + 48, scale=(0, 0, 0), location=(x0, -1.48, HAND_Z))
    H.key(obj, F[3] + 56, scale=(1, 1, 1), location=(x0, -1.48, HAND_Z))
    H.key(obj, F[3] + 80, scale=(1, 1, 1), location=(x0, -1.48, HAND_Z))
    H.key(obj, F[3] + 100, scale=(1, 1, 1), location=(x1, -1.48, HAND_Z))
    H.key(obj, F[4] - 10, scale=(1, 1, 1), location=(x1, -1.48, HAND_Z - 0.05))
for rig, side in [(merchant, "R"), (mitra, "L")]:
    arm(rig, side, F[3] + 44, forward=5)
    arm(rig, side, F[3] + 56, forward=70)
    arm(rig, side, F[3] + 104, forward=70)
    arm(rig, side, F[4] - 4, forward=40)
look(mitra, F[3] + 104, 0, 10)
look(mitra, F[4] - 6, -10, -8)        # smiles up at him
look(merchant, F[4] - 6, 8, 12)       # small bow

# ---------------------------------------------------------------- cameras, one per shot, switched by markers


def shot_cam(name, frames_pos, frames_tgt, lens=26):
    cam_data = bpy.data.cameras.new(name)
    cam_data.lens = lens
    cam_data.sensor_fit = "VERTICAL"
    cam_data.sensor_height = 36
    cam = bpy.data.objects.new(name, cam_data)
    scene.collection.objects.link(cam)
    tgt = H.empty(name + "_tgt")
    H.track_to(cam, tgt)
    for f, p in frames_pos:
        H.key(cam, f, location=p)
    for f, p in frames_tgt:
        H.key(tgt, f, location=p)
    return cam


cams = [
    shot_cam("Cam1", [(F[0], (6, -24, 13)), (F[1], (2.5, -11, 6))],
             [(F[0], (0, 1, 0)), (F[1], (-1, 3, 1))], lens=26),
    shot_cam("Cam2", [(F[1], (-0.75, -2.7, 1.75)), (F[2], (-1.05, -2.1, 1.6))],
             [(F[1], (-1.6, -0.2, 1.0)), (F[2], (-1.6, -0.15, 1.05))], lens=30),
    shot_cam("Cam3", [(F[2], (5.5, -2.0, 1.3)), (F[3], (4.2, -1.2, 1.5))],
             [(F[2], (-14, -4.3, 1.4)), (F[2] + 60, (1.2, -4.3, 1.3)), (F[3], (0.9, -1.8, 1.1))], lens=26),
    shot_cam("Cam4", [(F[3], (0.6, 1.4, 1.6)), (F[4], (0.1, 0.5, 1.4))],
             [(F[3], (-0.4, -1.3, 1.0)), (F[4], (0.05, -1.5, 1.05))], lens=28),
    shot_cam("Cam5", [(F[4], (0.0, -6.5, 2.2)), (F[5], (0.0, -21, 14))],
             [(F[4], (0, -1, 1.2)), (F[5], (0, 7, 1))], lens=24),
]
for i, cam in enumerate(cams):
    m = scene.timeline_markers.new(f"Shot{i + 1}", frame=F[i])
    m.camera = cam
scene.camera = cams[0]

# Optional frame window, e.g. FRAME_START=1 FRAME_END=175
if os.environ.get("FRAME_START"):
    scene.frame_start = int(os.environ["FRAME_START"])
if os.environ.get("FRAME_END"):
    scene.frame_end = int(os.environ["FRAME_END"])

H.render(args)
