"""Wari-Bateshwar v2 — painterly golden-hour 3D film after the 'Benares, 1780' reference.

One shot per run:
  blender -b -P shots.py -- --shot S1 --out out/S1/ [--preview]
  blender -b -P shots.py -- --shot S1 --out out/check_S1.png --frame 80 --preview
"""
import math
import os
import random
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", ".claude", "skills", "blender-3d-animation", "scripts"))
SHOT = "S1"
if "--shot" in sys.argv:
    i = sys.argv.index("--shot")
    SHOT = sys.argv[i + 1]
    del sys.argv[i:i + 2]

import bpy  # noqa: E402
import bl_helpers as H  # noqa: E402
import ancient_lib as A  # noqa: E402
from ancient_lib import rad, Person, box, part, empty, key  # noqa: E402

FPS = 24
# frames per shot, cut to the narration (audio/take1.mp3 in v1): 7.3 | 2.9+2.9 | 2.2+2.2 | 3+3 | 6.5 s
FRAMES = {"S1": 175, "S2a": 70, "S2b": 70, "S3a": 53, "S3b": 53, "S4a": 72, "S4b": 72, "S5": 155}
N = FRAMES[SHOT]

args = H.parse_args()
H.reset_scene()
scene = H.setup_render(args, fps=FPS, seconds=N / FPS, width=1280, height=720)
scene.frame_start, scene.frame_end = 1, N
scene.render.use_overwrite = False
scene.render.use_placeholder = True
if args.engine == "EEVEE" and args.samples is None:
    scene.eevee.taa_render_samples = 8 if args.preview else 24
rng = random.Random(11)

MITRA = dict(kind="woman", skin="#9a6440", top="#d9822b", bottom="#9e1f2a", accent="#d4a537")
MERCHANT = dict(kind="man", skin="#6f4429", top="#ece3cf", bottom="#ece3cf", accent="#2f4f8f", head="turban",
                beard=True)
BOY = dict(kind="boy", skin="#8a5636", top="#8a5636", bottom="#d9822b", accent="#b8231f", head="headband")


def camera(name, pos_keys, tgt_keys, lens=32):
    cd = bpy.data.cameras.new(name)
    cd.lens = lens
    cd.clip_end = 400
    cam = bpy.data.objects.new(name, cd)
    scene.collection.objects.link(cam)
    tgt = empty(name + "_tgt")
    c = cam.constraints.new("TRACK_TO")
    c.target = tgt
    c.track_axis = "TRACK_NEGATIVE_Z"
    c.up_axis = "UP_Y"
    for f, p in pos_keys:
        key(cam, f, location=p)
    for f, p in tgt_keys:
        key(tgt, f, location=p)
    scene.camera = cam
    return cam


# ======================================================================= RIVERFRONT (S1, S3a, S3b, S5)
def riverfront(evening=False, crowd=48, lamps=False):
    water = A.mat_water(anim_frames=N)
    box(water, (0, -40, -0.05), (300, 81, 0.1), name="river")
    box(A.mat_noise("FarBank", [(0, "#6a6a48"), (1, "#8a7a52")], 0.3), (0, -95, 0.3), (400, 20, 1.0))
    top, y_top = A.ghat_steps(-45, 45)
    sand = A.mat_noise("Sandstone", [(0, "#8a6a48"), (0.5, "#b8946a"), (1, "#d4b48a")], 1.5, 0.85, 0.35)
    box(sand, (0, y_top + 17, top / 2 - 1), (90, 34, top + 2))
    # brick bastions rising from the water (like the reference's square platforms)
    brick = A.mat_brick("GhatBrick", "#a55a34", "#7d4126", "#c8b394", 3)
    for bx, bw, bh in ((-17, 4.5, 3.2), (-1, 3.5, 2.6), (13, 5.0, 3.6), (27, 4.0, 3.0)):
        box(brick, (bx, 1.6, bh / 2 - 0.5), (bw, 4.2, bh + 1), bevel=0.05)
        box(sand, (bx, 1.6, bh + 0.05), (bw + 0.3, 4.5, 0.15))
    # buildings: two rows climbing behind the steps
    xs = -46
    while xs < 46:
        if -11 < xs < -1.5:
            xs = -1.5
        w = rng.uniform(3.2, 6.5)
        h = rng.uniform(5, 12)
        A.building(xs + w / 2, y_top + 3 + rng.uniform(0, 1.2), w, 5, h, base_z=top,
                   roof=rng.choice(["flat", "tile", "tile", "flat"]), balcony=rng.random() < 0.55, rng=rng,
                   roof_col=rng.choice(["#8f3e22", "#a04a28", "#7a3a20"]))
        xs += w + rng.uniform(0.0, 0.4)
    xs = -46
    while xs < 46:
        w = rng.uniform(4, 8)
        h = rng.uniform(10, 17)
        A.building(xs + w / 2, y_top + 10, w, 6, h, base_z=top, roof=rng.choice(["flat", "tile", "dome"]),
                   balcony=rng.random() < 0.4, rng=rng)
        xs += w
    A.shrine(-6.2, y_top + 3.2, top, 1.15)
    A.shrine(19, y_top + 6, top, 0.7)
    # moored boats with marigold garlands
    for i, (bx, by, hd) in enumerate([(-24, -2.6, 0.1), (-15, -3.2, -0.05), (-8, -2.4, 0.08), (6, -2.8, -0.1),
                                      (10, -4.6, 0.05), (21, -2.5, 0.12), (30, -3.4, -0.06), (-30, -4.2, 0.0)]):
        b = A.boat(f"Boat{i}", (bx, by, -0.25), hd, L=rng.uniform(5, 7), canopy=(i % 3 == 0))
        key(b, 1, rotation_euler=(rad(1.2), 0, hd))
        key(b, 40 + i * 3, rotation_euler=(rad(-1.2), 0, hd))
        key(b, 80 + i * 3, rotation_euler=(rad(1.2), 0, hd))
    # crowd on the steps
    people = []
    for _ in range(crowd):
        x = rng.uniform(-32, 34)
        y = rng.uniform(0.4, y_top - 0.3)
        z = A.step_z(y)
        p = A.crowd_person((x, y, z), rng.uniform(-0.6, 0.6) + (math.pi if rng.random() < 0.5 else 0), rng)
        people.append(p)
        if rng.random() < 0.35:
            p.walk(1, N, (x, y, z), (x + rng.uniform(-2.5, 2.5), y, z), step=16)
        else:
            p.breathe(1, N, period=rng.randint(50, 80))
            if rng.random() < 0.5:
                p.rest(1, shL=rng.uniform(10, 50), elL=rng.uniform(20, 70))
    for _ in range(14):  # people up on the terrace
        x = rng.uniform(-30, 30)
        A.crowd_person((x, y_top + rng.uniform(0.3, 2.0), top), rng.uniform(-0.8, 0.8), rng).breathe(1, N)
    # kites over the town
    for k in range(7):
        kt = A.kite((rng.uniform(-30, 30), rng.uniform(25, 45), rng.uniform(18, 30)),
                    rng.choice(["#c0392b", "#e67e22", "#2e86c1", "#d4ac0d", "#8e44ad"]), rng.uniform(-0.4, 0.4))
        key(kt, 1, location=kt.location)
        key(kt, N, location=(kt.location.x + rng.uniform(-1.5, 1.5), kt.location.y, kt.location.z + rng.uniform(-1, 1)))
    if lamps:
        lit = 0
        for i in range(70):
            y = rng.uniform(0.3, y_top)
            z = A.step_z(y)
            A.diya((rng.uniform(-30, 32), y - 0.25, z + 0.001), light=(lit < 14), energy=25)
            lit += 1
    return top, y_top, people


def look_riverfront(evening=False):
    if evening:
        return A.setup_look(scene, sun_elev=4, sun_az=-55, sun_col=(1.0, 0.45, 0.22), sun_energy=3.0,
                            sky_top="#c86a4a", sky_horizon="#f2a25e", sky_strength=0.8, haze_col="#e59a6a",
                            haze=0.6, mist_start=10, mist_depth=110)
    return A.setup_look(scene, sun_elev=13, sun_az=-40, sun_col=(1.0, 0.7, 0.45), sun_energy=4.5,
                        sky_top="#8fb0c4", sky_horizon="#f3c58e", haze_col="#efc08a", haze=0.4,
                        mist_start=30, mist_depth=140)


# ======================================================================= WORKSHOP (S2a, S2b)
def workshop():
    A.setup_look(scene, sun_elev=25, sun_az=-90, sun_col=(1.0, 0.78, 0.55), sun_energy=6,
                 sky_top="#f0d2a8", sky_horizon="#f7e2c0", sky_strength=0.35, haze_col="#3a2618", haze=0.0,
                 mist_start=50, mist_depth=50)
    wall = A.mat_plaster("WsPlaster", plaster=("#b58a5c", "#9a6a44", "#7d8a86", "#c09468"), reveal=0.58, scale=1.2)
    floor = A.mat_noise("WsFloor", [(0, "#4a3424"), (0.6, "#6a4a32"), (1, "#7d5a3c")], 2, 0.9, 0.3)
    box(floor, (0, 0, -0.05), (7, 6, 0.1))
    box(wall, (0, 3.15, 1.8), (7, 0.3, 3.6))                    # back wall
    box(wall, (3.65, 0, 1.8), (0.3, 6.6, 3.6))                  # right wall
    # left wall with a window opening (x = -3.5)
    box(wall, (-3.65, 1.8, 1.8), (0.3, 3.0, 3.6))
    box(wall, (-3.65, -2.3, 1.8), (0.3, 2.0, 3.6))
    box(wall, (-3.65, -0.3, 0.55), (0.3, 2.0, 1.1))
    box(wall, (-3.65, -0.3, 3.05), (0.3, 2.0, 1.1))
    for k in range(4):  # window bars
        part("cyl", A.mat_wood("Bars", "#3a2616", "#4a3220"), (-3.6, -1.05 + k * 0.5, 1.8), (0.03, 0.03, 0.7))
    box(A.mat_wood("Beam", "#3a2616", "#5a3c24"), (0, 0, 3.55), (7, 6.6, 0.1))   # ceiling
    for bx in (-1.5, 1.5):
        box(A.mat_wood("Beam", "#3a2616", "#5a3c24"), (bx, 0, 3.4), (0.25, 6.4, 0.22))
    part("cyl", A.mat_wood("Pillar", "#3a2616", "#5a3c24"), (1.6, 1.0, 1.7), (0.12, 0.12, 1.7))
    # hanging strings of beads (like the hanging threads in the reference)
    bead_cols = ["#c1361f", "#e07a2a", "#b0451c", "#d9a441", "#7a1f1a"]
    for i in range(14):
        col = bead_cols[i % len(bead_cols)]
        bm = A.mat_flat("BeadStr" + col, col, 0.18)
        x = -1.2 + i * 0.2 + rng.uniform(-0.04, 0.04)
        y = 2.2 + rng.uniform(-0.2, 0.2)
        length = rng.uniform(0.7, 1.2)
        for j in range(int(length / 0.045)):
            part("lowsphere", bm, (x, y, 3.3 - j * 0.045), 0.02)
    # shelf with pots, niche with oil lamp
    box(A.mat_wood("Shelf", "#4a3020", "#6a4630"), (3.3, 0.2, 1.6), (0.5, 2.6, 0.06))
    for k in range(5):
        A.pot((3.3, -0.9 + k * 0.5, 1.63), r=rng.uniform(0.08, 0.14), col=rng.choice(["#8d4a28", "#6a3a22", "#a8643a"]))
    box(A.mat_flat("NicheDark", "#22150c", 0.9), (0.6, 2.99, 1.55), (0.6, 0.05, 0.75))
    A.diya((0.6, 2.85, 1.2), energy=30)
    for k in range(3):
        A.basket((2.6 - k * 0.6, 2.5, 0), r=0.22, fill=rng.choice(["#d9c27a", "#c1361f", "#e8dcc0"]))
    # workbench, grinding stone, bead trays
    bench = A.mat_wood("Bench", "#5a3a22", "#7d5634")
    box(bench, (-0.6, 0.2, 0.67), (1.6, 0.7, 0.07))
    for dx in (-0.7, 0.7):
        for dy in (-0.28, 0.28):
            box(bench, (-0.6 + dx, 0.2 + dy, 0.32), (0.06, 0.06, 0.64))
    stone = A.mat_noise("Whetstone", [(0, "#6a6a62"), (1, "#9a968a")], 30, 0.6, 0.2, world=False)
    box(stone, (-0.68, 0.2, 0.73), (0.3, 0.18, 0.05))
    tray = A.mat_wood("Tray", "#6a4a2c", "#8c6640")
    beads = []
    for t, tx in enumerate((-1.2, -0.15)):
        box(tray, (tx, 0.3, 0.72), (0.32, 0.22, 0.02))
        col = ["#c1361f", "#d9a441"][t]
        for k in range(12):
            beads.append(part("lowsphere", A.mat_flat("Bd" + col, col, 0.15), (tx - 0.12 + (k % 6) * 0.045,
                              0.25 + (k // 6) * 0.07, 0.74), 0.018))
    hero_bead = part("sphere", A.mat_flat("HeroBead", "#c1361f", 0.08, emit="#ff4a1a", strength=0.6),
                     (-0.66, 0.2, 0.775), 0.024)
    # stools + characters
    for sx in (-0.65, 0.85):
        part("cyl", bench, (sx, 0.85, 0.2), (0.18, 0.18, 0.2))
    mitra = Person("Mitra", loc=(-0.65, 0.92, -0.44), heading=0.0, **MITRA)
    mitra.sit_pose(1, spine=25, neck=30, shL=82, elL=30, shR=80, elR=35, shoutL=4, shoutR=4)
    boy = Person("Boy", loc=(0.85, 0.92, -0.28), heading=rad(-20), height=0.8, **BOY)
    boy.sit_pose(1, spine=18, neck=25, shL=70, elL=35, shR=65, elR=45)
    # bow drill in the boy's hands
    drill = empty("Drill", (0.5, 0.35, 0.73))
    part("cyl", A.mat_wood("Spindle", "#5a3a22", "#7d5634"), (0, 0, 0.12), (0.012, 0.012, 0.12), parent=drill)
    bow = empty("Bow", (0.5, 0.35, 0.87))
    part("torus", A.mat_wood("BowW", "#5a3a22", "#7d5634"), (0, 0, 0), (0.22, 0.12, 0.22), (rad(90), 0, 0),
         parent=bow, r2=0.04)
    box(A.mat_noise("Tray2", [(0, "#6a4a2c"), (1, "#8c6640")], 9, world=False), (0.5, 0.35, 0.71), (0.25, 0.25, 0.04))
    # animation: polishing strokes and drilling
    for f in range(1, N + 1, 8):
        s = 1 if (f // 8) % 2 else -1
        mitra.pose(f, hipL=88, hipR=88, kneeL=88, kneeR=88, spine=25, neck=30, shL=82, elL=30,
                   shR=80 + 4 * s, elR=35 + 5 * s, shoutL=4, shoutR=4 + 3 * s)
        key(hero_bead, f, location=(-0.66 + 0.03 * s, 0.2, 0.775))
    for f in range(1, N + 1, 6):
        s = 1 if (f // 6) % 2 else -1
        key(bow, f, location=(0.5 + 0.09 * s, 0.35, 0.87))
        key(drill, f, rotation_euler=(0, 0, rad(180 * s)))
        boy.pose(f, hipL=88, hipR=88, kneeL=88, kneeR=88, spine=18, neck=25, shL=70, elL=35,
                 shR=65 + 8 * s, elR=45 - 8 * s, shoutR=-6 * s)
    # god-ray haze inside the room
    vol = bpy.data.materials.new("RoomHaze")
    vol.use_nodes = True
    nt = vol.node_tree
    nt.nodes.remove(nt.nodes["Principled BSDF"])
    pv = nt.nodes.new("ShaderNodeVolumePrincipled")
    pv.inputs["Density"].default_value = 0.06
    pv.inputs["Color"].default_value = A.rgba("#f2d2a4")
    nt.links.new(pv.outputs[0], nt.nodes["Material Output"].inputs["Volume"])
    vb = box(vol, (0, 0, 1.75), (7.2, 6.2, 3.5), name="haze")
    vb.visible_shadow = False
    scene.eevee.volumetric_tile_size = "8"
    scene.eevee.volumetric_samples = 32
    try:
        scene.eevee.use_volumetric_shadows = True
    except Exception:
        pass
    # warm fill so faces read in the shade
    fl = bpy.data.lights.new("Fill", "AREA")
    fl.energy = 140
    fl.size = 3
    fl.color = (1.0, 0.75, 0.5)
    fo = bpy.data.objects.new("Fill", fl)
    scene.collection.objects.link(fo)
    fo.location = (1.5, -2.5, 2.8)
    H.look_at(fo, (-0.4, 0.6, 0.8))
    return mitra, boy


# ======================================================================= LANE (S4a, S4b)
def lane(walkers=9, avoid=None):
    A.setup_look(scene, sun_elev=55, sun_az=160, sun_col=(1.0, 0.82, 0.6), sun_energy=4.0,
                 sky_top="#e8c49a", sky_horizon="#f5dcb4", sky_strength=0.9, haze_col="#d8b48a", haze=0.5,
                 mist_start=6, mist_depth=45)
    cob = A.mat_brick("Cobble", "#6f7a62", "#55604c", "#3a4034", scale=1.6, rough=0.35, ground=True)
    box(cob, (0, 20, -0.05), (3.2, 60, 0.1))
    box(A.mat_flat("Drain", "#2a3328", 0.15), (-1.35, 20, -0.06), (0.35, 60, 0.1))
    walk = A.mat_brick("Kerb", "#7d7a62", "#5f5c4a", "#3a3a30", scale=2.5)
    for sx in (-1, 1):
        box(walk, (sx * 2.0, 20, 0.08), (0.8, 60, 0.16))
    dark = A.mat_flat("DoorDark", "#1a110a", 0.9)
    warm = A.mat_flat("DoorWarm", "#5a2e12", 0.9, emit="#ff9a40", strength=1.2)
    awn = A.mat_noise("AwningL", [(0, "#6a4022"), (1, "#a26a3e")], 5)
    y = -6
    shops = []
    while y < 45:
        for sx in (-1, 1):
            w = rng.uniform(3.0, 5.0)
            h = rng.uniform(6.5, 10)
            yc = y + w / 2 + rng.uniform(-0.3, 0.3)
            pl = A.mat_plaster("LanePl%d" % rng.randint(0, 4),
                               plaster=rng.choice([("#d9c39a", "#c99a5e", "#8fa2a6", "#d8b48a"),
                                                   ("#c8b08a", "#a8805a", "#7a9aa0", "#d6c0a0"),
                                                   ("#e0c8a0", "#b8885a", "#9aa8a0", "#c8a07a")]),
                               reveal=rng.uniform(0.55, 0.66))
            xf = sx * 2.4
            box(pl, (sx * (2.4 + 2.5), yc, h / 2), (5, w, h), bevel=0.04)
            # ground-floor shop opening, upper windows, jutting upper storey
            box(warm if rng.random() < 0.5 else dark, (xf - sx * 0.02, yc, 1.2), (0.06, w * 0.5, 2.0))
            box(A.mat_wood("DoorFr", "#3d2a1a", "#5a3c24"), (xf - sx * 0.04, yc, 2.3), (0.08, w * 0.6, 0.15))
            box(pl, (xf - sx * 0.35, yc, 3.3), (0.7, w, 0.25))
            for k in range(2):
                for wz in (4.4, 6.6):
                    if wz < h - 0.6:
                        wy = yc - w / 4 + k * w / 2
                        box(A.mat_wood("WinFrame", "#3d2a1a", "#5a3c24"), (xf - sx * 0.02, wy, wz), (0.06, 0.8, 1.2))
                        box(A.mat_flat("WinDark", "#1a120c", 0.9), (xf - sx * 0.05, wy, wz), (0.04, 0.6, 1.0))
            box(awn, (xf - sx * 0.6, yc, 2.6), (1.3, w * 0.9, 0.05), rot=(0, rad(18 * sx), 0))
            shops.append((sx, yc, w))
            # wall hangings: baskets and pots
            if rng.random() < 0.6:
                A.basket((xf - sx * 0.25, yc + w * 0.3, 1.9), r=0.18, fill="#d9c27a")
        y += rng.uniform(3.2, 4.6)
    # stalls with goods and seated vendors
    vendors = []
    for (sx, yc, w) in shops:
        if yc < 2 or yc > 30 or rng.random() < 0.3:
            continue
        tx = sx * 1.75
        tb = A.mat_wood("Stall", "#5a3a22", "#7d5634")
        box(tb, (tx, yc, 0.45), (0.6, 1.2, 0.06))
        for dy in (-0.5, 0.5):
            box(tb, (tx, yc + dy, 0.22), (0.05, 0.05, 0.44))
        for k in range(rng.randint(2, 4)):
            if rng.random() < 0.5:
                A.pot((tx + rng.uniform(-0.15, 0.15), yc - 0.45 + k * 0.3, 0.48), r=rng.uniform(0.07, 0.12))
            else:
                A.basket((tx, yc - 0.45 + k * 0.3, 0.48), r=0.12,
                         fill=rng.choice(["#e0a030", "#c1361f", "#6a8a3a", "#e8dcc0"]))
        for k in range(rng.randint(1, 3)):
            A.pot((sx * 1.5, yc + rng.uniform(-0.8, 0.8), 0.0), r=rng.uniform(0.12, 0.2),
                  col=rng.choice(["#8d4a28", "#b07a2a", "#6a3a22"]))
        if rng.random() < 0.7:
            v = A.crowd_person((sx * 2.05, yc + 0.6, -0.48 + 0.16 + 0.35), rad(90) * sx, rng)
            v.sit_pose(1, spine=10, shL=30, elL=50)
            vendors.append(v)
    # laundry across the lane
    for ly in (6, 14, 23, 33):
        A.cloth_line((-2.4, ly, 6.2), (2.4, ly + 0.8, 6.0),
                     [rng.choice(["#e8e2d4", "#c25b4a", "#d9a441", "#3a6a8a", "#efe9dc"]) for _ in range(4)])
    # walkers
    walker_list = []
    for k in range(walkers):
        yy = rng.uniform(4, 30)
        if avoid and avoid[0] < yy < avoid[1]:
            yy += avoid[1] - avoid[0] + 2
        p = A.crowd_person((rng.uniform(-0.9, 0.9), yy, 0), 0, rng)
        y0 = p.root.location.y
        d = rng.choice([-1, 1])
        p.walk(1, N, (p.root.location.x, y0, 0), (p.root.location.x, y0 + d * rng.uniform(2.5, 4.5), 0))
        walker_list.append(p)
    return shops


# ======================================================================= SHOTS
if SHOT == "S1":
    look_riverfront()
    riverfront(crowd=55)
    camera("Cam", [(1, (24, -21, 5.5)), (N, (20.5, -16.5, 4.8))], [(1, (-4, 8, 6.5)), (N, (-5, 9, 6.2))], lens=30)

elif SHOT == "S5":
    look_riverfront(evening=True)
    riverfront(crowd=45, lamps=True)
    camera("Cam", [(1, (4, -7, 2.4)), (N, (16, -34, 13))], [(1, (-2, 4, 3.0)), (N, (-3, 8, 5))], lens=28)

elif SHOT == "S3a":
    look_riverfront()
    top, y_top, _ = riverfront(crowd=30)
    sand = A.mat_noise("Sandstone", [(0, "#8a6a48"), (0.5, "#b8946a"), (1, "#d4b48a")], 1.5, 0.85, 0.35)
    box(sand, (7.5, -0.4, 0.3), (4.0, 1.6, 0.8), bevel=0.03)       # ledge at the water's edge
    for k in range(9):
        A.part("lowsphere", A.mat_flat("Marigold", "#f08a12", 0.7), (6.3 + k * 0.05, -0.9, 0.73), 0.04)
    woman = Person("Woman", loc=(7.0, 0.0, 0.7 - 0.47), heading=rad(-25), **dict(MITRA, head="veil"))
    woman.pose(1, kneeL=95, kneeR=95, spine=30, neck=25, shR=85, elR=25, shL=40, elL=20, shoutL=10)
    woman.pose(N, kneeL=95, kneeR=95, spine=45, neck=30, shR=95, elR=5, shL=50, elL=25, shoutL=10)
    lamp, flame = A.diya((7.15, -0.45, 1.0), energy=12)
    key(lamp, 1, location=(7.15, -0.45, 1.0))
    key(lamp, int(N * 0.75), location=(7.1, -0.82, 0.705))
    boy = Person("Boy", loc=(4.3, -2.3, 0.35), heading=rad(60), height=0.82, **BOY)
    boy.pose(1, shL=85, elL=40, shR=95, elR=30, spine=10, neck=10)
    boy.pose(N, shL=95, elL=25, shR=80, elR=50, spine=12, neck=15)
    b = A.boat("HeroBoat", (4.0, -2.4, -0.25), rad(-8), L=6.5)
    camera("Cam", [(1, (9.4, -2.5, 1.3)), (N, (9.1, -2.25, 1.22))], [(1, (6.4, -0.6, 1.0)), (N, (6.6, -0.7, 0.92))],
           lens=30)

elif SHOT == "S3b":
    look_riverfront()
    riverfront(crowd=40)
    sb = A.boat("TradeBoat", (-14, -7.5, -0.25), 0.0, L=8.5, W=2.0, D=0.7, garland=True)
    part("cyl", A.mat_wood("Mast", "#4a3020", "#6a4630"), (-0.5, 0, 3.0), (0.06, 0.06, 2.6), parent=sb)
    sail = part("cube", A.mat_cloth("Sail", "#e6d6b0"), (-0.5, 0.05, 3.4), (1.2, 0.02, 1.6), parent=sb)
    sail.rotation_euler = (0, 0, rad(8))
    for k in range(3):
        A.basket((1.2 + k * 0.6, 0, 0.62), r=0.22, fill="#c9a462").parent = sb
    merchant = Person("Merchant", loc=(-12.9, -7.5, 0.5), heading=rad(-35), **MERCHANT)
    boatman = Person("Boatman", kind="man", skin="#5a3622", top="#5a3622", bottom="#cdbf9e", accent="#7a3a2a",
                     head="headband", loc=(-17.6, -7.5, 0.5), heading=rad(-90))
    oar = part("cyl", A.mat_wood("Oar", "#5a3a22", "#7d5634"), (0, 0, 0), (0.03, 0.03, 1.4))
    key(sb, 1, location=(-14, -7.5, -0.25))
    key(sb, N, location=(-6.5, -7.0, -0.25))
    for f in (1, N):
        dx = 0 if f == 1 else 7.5
        dy = 0 if f == 1 else 0.5
        merchant.place(f, (-12.9 + dx, -7.5 + dy, 0.5), rad(-35))
        boatman.place(f, (-17.6 + dx, -7.5 + dy, 0.5), rad(-90))
        key(oar, f, location=(-17.9 + dx, -6.9 + dy, 0.4))
    merchant.pose(1, shR=25, elR=30, turn=-10)
    merchant.pose(N, shR=70, elR=20, shoutR=20, turn=10, neck=-5)      # raises a hand in greeting
    for f in range(1, N + 1, 12):
        s = 1 if (f // 12) % 2 else -1
        boatman.pose(f, spine=20 + 10 * s, shL=60 + 25 * s, shR=60 + 25 * s, elL=30, elR=30)
        key(oar, f, rotation_euler=(rad(25 * s), rad(20), 0))
    camera("Cam", [(1, (-3, -14, 0.9)), (N, (-2.4, -13.2, 0.95))], [(1, (-12, -6.5, 1.6)), (N, (-7, -6.8, 1.7))],
           lens=30)

elif SHOT == "S2a":
    workshop()
    camera("Cam", [(1, (2.6, -2.3, 1.75)), (N, (2.2, -1.8, 1.6))], [(1, (-0.5, 0.7, 0.85)), (N, (-0.6, 0.7, 0.8))],
           lens=24)

elif SHOT == "S2b":
    workshop()
    camera("Cam", [(1, (-0.2, -0.55, 1.2)), (N, (-0.3, -0.42, 1.15))],
           [(1, (-0.64, 0.35, 0.85)), (N, (-0.64, 0.35, 0.85))], lens=32)

elif SHOT == "S4a":
    lane()
    g, legs, neck = A.goat((0.6, 4, 0), 0)
    A.goat_walk(g, legs, 1, N, (0.6, 4.0, 0), (-0.4, 7.5, 0))
    camera("Cam", [(1, (1.1, -3.5, 4.4)), (N, (0.9, -1.8, 3.9))], [(1, (-0.3, 12, 0.8)), (N, (-0.3, 13, 0.9))],
           lens=24)

elif SHOT == "S4b":
    shops = lane(avoid=(1, 12))
    # Mitra's bead stall, merchant arrives; silver coin for a string of beads
    tb = A.mat_wood("Stall", "#5a3a22", "#7d5634")
    box(tb, (-1.4, 8.6, 0.7), (0.55, 0.9, 0.06))
    for k in range(5):
        col = ["#c1361f", "#d9a441", "#e07a2a", "#7a1f1a", "#b0451c"][k]
        part("torus", A.mat_flat("BeadStr" + col, col, 0.18), (-1.4, 8.25 + k * 0.17, 0.74), (0.07, 0.07, 0.07),
             r2=0.22)
    mitra = Person("Mitra", loc=(-1.95, 8.0, 0.16), heading=rad(90), **MITRA)
    merchant = Person("Merchant", loc=(0.2, 5.0, 0), heading=rad(150), **MERCHANT)
    merchant.walk(1, 34, (0.3, 5.2, 0), (-0.75, 7.9, 0))
    merchant.place(38, (-0.75, 7.95, 0), rad(-90))
    mitra.rest(1)
    mitra.pose(30, shR=10, elR=20, turn=-5)
    coin = part("cyl", A.mat_flat("Silver", "#dcdce4", 0.2, 1.0), (-0.95, 7.95, 1.0), (0.035, 0.035, 0.006),
                (0, rad(90), 0))
    beadstr = part("torus", A.mat_flat("BeadHero", "#c1361f", 0.15, emit="#ff4a1a", strength=0.3),
                   (-1.45, 7.95, 1.0), (0.08, 0.08, 0.08), (0, rad(90), 0), r2=0.2)
    for ob, x0, x1 in ((coin, -0.95, -1.42), (beadstr, -1.45, -0.98)):
        key(ob, 1, scale=(0, 0, 0))
        key(ob, 40, scale=(0, 0, 0))
        key(ob, 44, scale=ob.scale if False else (0.035, 0.035, 0.006) if ob is coin else (0.08, 0.08, 0.08))
        key(ob, 44, location=(x0, 7.95, 1.0))
        key(ob, 60, location=(x1, 7.95, 1.0))
    merchant.pose(40, shR=10, elR=20)
    merchant.pose(48, shR=70, elR=20)
    merchant.pose(66, shR=70, elR=20, neck=12)
    mitra.pose(40, shR=10, elR=20)
    mitra.pose(48, shR=70, elR=20)
    mitra.pose(66, shR=65, elR=30, neck=8, turn=0)
    mitra.pose(N, shR=40, elR=40, neck=-5)
    merchant.pose(N, shR=40, elR=40, neck=15)
    camera("Cam", [(1, (1.0, 5.0, 1.55)), (N, (0.7, 5.6, 1.5))], [(1, (-1.0, 7.8, 1.15)), (N, (-1.3, 8.0, 1.2))],
           lens=30)

if os.environ.get("FRAME_END"):
    scene.frame_end = int(os.environ["FRAME_END"])
H.render(args)
