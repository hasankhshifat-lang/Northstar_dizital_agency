"""3D environment: Dhaka rooftop (ছাদ) in the afternoon — tiled roof, parapet, water tank with a tap and a bucket,
small table, clothesline, potted plants, city skyline. Renders three plates for the puppet engine and a JSON of
projected anchor points (in 1080x1920 screen space) so 2D props can sit exactly on 3D surfaces.
Run: blender -b --python rooftop.py -- OUTDIR [--preview]
Camera convention (all Scientific Bithi 3D environments): characters' feet plane at y=6 m projects to screen y=1820,
1 m = 400 px there (puppets at scale 0.8 are about 1.7 m tall)."""
import bpy, math, sys, json, random
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = argv[0] if argv else "/tmp/env"; PREVIEW = "--preview" in argv
ONLY = next((a.split("=", 1)[1].split(",") for a in argv if a.startswith("--only=")), None)
import os; os.makedirs(OUT, exist_ok=True)
R = random.Random(7)

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = "CYCLES"; sc.cycles.device = "CPU"
sc.cycles.samples = 12 if PREVIEW else 32; sc.cycles.use_denoising = True
sc.view_settings.view_transform = "Standard"; sc.view_settings.look = "None"
sc.render.use_freestyle = True; sc.render.line_thickness_mode = "ABSOLUTE"
vl = sc.view_layers[0]; vl.use_freestyle = True
fs = vl.freestyle_settings; fs.crease_angle = math.radians(120)
ls = fs.linesets[0] if fs.linesets else fs.linesets.new("Lines")
if ls.linestyle is None: ls.linestyle = bpy.data.linestyles.new("Ink")
ls.linestyle.color = (0.18, 0.12, 0.09); ls.select_by_visibility = True
ls.select_silhouette = True; ls.select_border = True; ls.select_crease = True

def hexrgb(h): h = h.lstrip("#"); return tuple(int(h[i:i+2], 16) / 255 for i in (0, 2, 4))
def lin(c): return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c)
MATS = {}
def mat(name, hexc, rough=0.75, metal=0.0):
    if name in MATS: return MATS[name]
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*lin(hexrgb(hexc)), 1); b.inputs["Roughness"].default_value = rough; b.inputs["Metallic"].default_value = metal
    MATS[name] = m; return m
def brick_mat(name, c1, c2, mortar, scale, mortar_size=0.02, rows=1.0, facade=False):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree
    b = nt.nodes["Principled BSDF"]; b.inputs["Roughness"].default_value = 0.85
    br = nt.nodes.new("ShaderNodeTexBrick"); br.inputs["Scale"].default_value = scale; br.inputs["Mortar Size"].default_value = mortar_size
    br.offset = 0.0 if rows == 0 else 0.5
    br.inputs["Color1"].default_value = (*lin(hexrgb(c1)), 1); br.inputs["Color2"].default_value = (*lin(hexrgb(c2)), 1); br.inputs["Mortar"].default_value = (*lin(hexrgb(mortar)), 1)
    tc = nt.nodes.new("ShaderNodeTexCoord")
    if facade:                                   # walls facing the camera: use (x, z) so the grid runs across and up
        sp = nt.nodes.new("ShaderNodeSeparateXYZ"); cb = nt.nodes.new("ShaderNodeCombineXYZ")
        nt.links.new(tc.outputs["Object"], sp.inputs[0]); nt.links.new(sp.outputs["X"], cb.inputs["X"]); nt.links.new(sp.outputs["Z"], cb.inputs["Y"]); nt.links.new(cb.outputs[0], br.inputs["Vector"])
    else: nt.links.new(tc.outputs["Object"], br.inputs["Vector"])
    nt.links.new(br.outputs["Color"], b.inputs["Base Color"]); return m
def box(name, loc, size, m, bev=0.0):
    bpy.ops.mesh.primitive_cube_add(location=loc); o = bpy.context.object; o.name = name
    o.scale = (size[0] / 2, size[1] / 2, size[2] / 2); bpy.ops.object.transform_apply(scale=True)
    if bev:
        md = o.modifiers.new("b", "BEVEL"); md.width = bev; md.segments = 2
    o.data.materials.append(m); return o
def cyl(name, loc, r, h, m, verts=32, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=h, location=loc, rotation=rot); o = bpy.context.object; o.name = name
    o.data.materials.append(m); bpy.ops.object.shade_smooth(); return o
def sphere(name, loc, r, m, sc_=(1, 1, 1)):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=20, ring_count=12); o = bpy.context.object; o.name = name
    o.scale = sc_; o.data.materials.append(m); bpy.ops.object.shade_smooth(); return o

# ---- sky (Nishita) + sun
w = bpy.data.worlds.new("W"); sc.world = w; w.use_nodes = True; nt = w.node_tree
# cartoon sky gradient (same family as the 2D backgrounds): warm cream at the horizon, clear blue overhead
tcw = nt.nodes.new("ShaderNodeTexCoord"); spw = nt.nodes.new("ShaderNodeSeparateXYZ"); ramp = nt.nodes.new("ShaderNodeValToRGB")
nt.links.new(tcw.outputs["Generated"], spw.inputs[0]); nt.links.new(spw.outputs["Z"], ramp.inputs["Fac"])
ramp.color_ramp.elements[0].position = 0.0; ramp.color_ramp.elements[0].color = (*lin(hexrgb("#FBE3C0")), 1)
ramp.color_ramp.elements[1].position = 0.45; ramp.color_ramp.elements[1].color = (*lin(hexrgb("#6FB6E6")), 1)
e = ramp.color_ramp.elements.new(0.12); e.color = (*lin(hexrgb("#BFE3F2")), 1)
nt.links.new(ramp.outputs["Color"], nt.nodes["Background"].inputs["Color"]); nt.nodes["Background"].inputs["Strength"].default_value = 0.8
bpy.ops.object.light_add(type="SUN", rotation=(math.radians(58), 0, math.radians(-35))); sun = bpy.context.object
sun.data.energy = 2.4; sun.data.color = (1.0, 0.88, 0.72); sun.data.angle = math.radians(4)

# ---- roof floor (terracotta tiles) and parapet
floor = box("Floor", (0, 9, -0.05), (16, 16, 0.1), brick_mat("Tiles", "#C98A5E", "#BF7F55", "#9C6A4A", 2.2, 0.015, rows=0))
WALL = mat("Wall", "#EFE3C8"); WALLTOP = mat("WallTop", "#D9CBB0")
box("ParapetBack", (0, 10.2, 0.5), (8.6, 0.22, 1.0), WALL); box("ParapetBackTop", (0, 10.2, 1.03), (8.7, 0.32, 0.06), WALLTOP)
for sx in (-1, 1):
    box(f"ParapetSide{sx}", (sx * 4.3, 6.5, 0.5), (0.22, 7.6, 1.0), WALL); box(f"ParapetSideTop{sx}", (sx * 4.3, 6.5, 1.03), (0.32, 7.7, 0.06), WALLTOP)
# rain stains on the parapet
STAIN = mat("Stain", "#D8CBAE")
for k in range(6):
    box(f"Stain{k}", (-3.6 + k * 1.4 + R.uniform(-0.2, 0.2), 10.08, 0.55), (0.25, 0.02, 0.6 + R.uniform(0, 0.3)), STAIN)

# ---- water tank on a stand, brass tap, bucket (screen right)
TANKX, TANKY = 1.95, 7.0
box("TankStand", (TANKX, TANKY, 0.22), (1.3, 1.3, 0.44), brick_mat("StandBrick", "#B5643A", "#A85A33", "#E8D8C0", 6.0, 0.03, facade=True))
tank = cyl("Tank", (TANKX, TANKY, 0.44 + 0.6), 0.58, 1.2, mat("TankBlue", "#2F6FB5", 0.45))
cyl("TankLid", (TANKX, TANKY, 1.66), 0.3, 0.06, mat("TankLid", "#24578E", 0.5))
for z in (0.7, 1.35): cyl(f"TankRib{z}", (TANKX, TANKY, z), 0.595, 0.05, mat("TankRib", "#2A62A0", 0.5))
BRASS = mat("Brass", "#D9A93A", 0.3, 0.8)
pipe = cyl("TapPipe", (TANKX - 0.58 - 0.12, TANKY, 0.62), 0.03, 0.26, BRASS, rot=(0, math.radians(90), 0))
cyl("TapBody", (TANKX - 0.58 - 0.25, TANKY, 0.585), 0.035, 0.1, BRASS)
cyl("TapHandle", (TANKX - 0.58 - 0.25, TANKY, 0.66), 0.012, 0.08, BRASS, rot=(math.radians(90), 0, 0))
TAP = Vector((TANKX - 0.58 - 0.25, TANKY, 0.53))
BUCKET = Vector((TAP.x, TANKY, 0.0))
bk = cyl("Bucket", (BUCKET.x, BUCKET.y, 0.17), 0.17, 0.34, mat("Bucket", "#9AA4AE", 0.65, 0.1))
cyl("BucketWater", (BUCKET.x, BUCKET.y, 0.30), 0.155, 0.02, mat("Water", "#5D9FB0", 0.1))
RIM = Vector((BUCKET.x, BUCKET.y, 0.34))

# ---- small wooden table between Mama and Boltu
TX, TY, TH = -0.236, 6.3, 0.72
WOOD = mat("Wood", "#C49A64", 0.7); WOOD2 = mat("Wood2", "#9C7448", 0.7)
box("TableTop", (TX, TY, TH - 0.025), (0.8, 0.5, 0.05), WOOD, bev=0.01)
for dx in (-0.35, 0.35):
    for dy in (-0.2, 0.2): box(f"Leg{dx}{dy}", (TX + dx, TY + dy, (TH - 0.05) / 2), (0.05, 0.05, TH - 0.05), WOOD2)
box("Stretcher", (TX, TY - 0.2, 0.25), (0.7, 0.03, 0.04), WOOD2)

# ---- clothesline with laundry, potted plants, plastic chair
POLE = mat("Pole", "#6E7880", 0.4, 0.6)
for x in (-3.4, 0.6): cyl(f"Pole{x}", (x, 9.3, 1.0), 0.03, 2.0, POLE)
cyl("Line", (-1.4, 9.3, 1.92), 0.008, 4.0, POLE, rot=(0, math.radians(90), 0))
for k, (x, c, wdt, hgt) in enumerate(((-3.0, "#D7263D", 0.5, 0.8), (-2.35, "#FFC300", 0.6, 0.55), (-1.6, "#2E7BD1", 0.45, 0.9), (-0.9, "#F2F2F2", 0.7, 0.5), (-0.1, "#7A4FB5", 0.4, 0.7))):
    o = box(f"Cloth{k}", (x, 9.3 + R.uniform(-0.03, 0.03), 1.92 - hgt / 2), (wdt, 0.02, hgt), mat(f"Cloth{k}", c, 0.9)); o.rotation_euler.z = R.uniform(-0.12, 0.12)
POT = mat("Pot", "#B5643A", 0.8); LEAF = mat("Leaf", "#3E8E41", 0.8); LEAF2 = mat("Leaf2", "#5DAF4E", 0.8)
for k, (x, y, s) in enumerate(((-3.7, 9.6, 1.0), (-3.0, 9.75, 0.8), (3.6, 9.6, 1.1), (-3.85, 7.2, 0.9), (2.9, 9.7, 0.7))):
    cyl(f"Pot{k}", (x, y, 0.2 * s), 0.18 * s, 0.4 * s, POT, verts=20)
    for j in range(4): sphere(f"Bush{k}{j}", (x + R.uniform(-0.12, 0.12) * s, y + R.uniform(-0.08, 0.08), (0.5 + R.uniform(0, 0.25)) * s), (0.17 + R.uniform(0, 0.08)) * s, LEAF if j % 2 else LEAF2)
CHAIR = mat("Chair", "#2EA36B", 0.5)
box("ChairSeat", (-2.6, 7.6, 0.42), (0.45, 0.45, 0.05), CHAIR, bev=0.02); box("ChairBack", (-2.6, 7.82, 0.7), (0.45, 0.04, 0.55), CHAIR, bev=0.02)
for dx in (-0.2, 0.2):
    for dy in (-0.2, 0.2): box(f"CL{dx}{dy}", (-2.6 + dx, 7.6 + dy, 0.2), (0.04, 0.04, 0.4), CHAIR)

# ---- city skyline beyond the parapet (pastel facades, window grids, tanks on roofs)
FAC = ["#D9A878", "#C996B0", "#9FBFA6", "#E3C47F", "#A9A0C9", "#D48F72", "#C2B8A0", "#8FB0C9"]
for k in range(34):
    d = R.uniform(24, 75); x = R.uniform(-d * 0.6, d * 0.6); hgt = R.uniform(4, 10) + d * 0.12; wid = R.uniform(5, 9) + d * 0.08
    fade = min(0.6, (d - 24) / 80)                              # atmospheric perspective toward the sky colour
    base = hexrgb(R.choice(FAC)); hz = hexrgb("#D9E6EE"); col = tuple(b * (1 - fade) + h * fade for b, h in zip(base, hz))
    hexc = "#%02X%02X%02X" % tuple(int(c * 255) for c in col)
    win = tuple(c * 0.55 * (1 - fade) + h * fade for c, h in zip(base, hz)); winh = "#%02X%02X%02X" % tuple(int(c * 255) for c in win)
    m = brick_mat(f"Fac{k}", winh, winh, hexc, 1.0, 0.7, facade=True)
    brn = [n for n in m.node_tree.nodes if n.type == "TEX_BRICK"][0]; brn.inputs["Brick Width"].default_value = 2.0; brn.inputs["Row Height"].default_value = 2.2; brn.offset = 0.0
    box(f"Bld{k}", (x, d, hgt / 2 - 3.0), (wid, wid * 0.8, hgt), m)
    if R.random() < 0.5: cyl(f"BTank{k}", (x + R.uniform(-1, 1), d, hgt - 3.0 + 0.6), 0.5, 1.2, mat(f"BT{k}", hexc, 0.6))
# a few distant trees between buildings
for k in range(10):
    sphere(f"Tree{k}", (R.uniform(-12, 12), R.uniform(14, 22), R.uniform(-0.5, 1.5)), R.uniform(1.0, 1.8), mat("FarTree", "#6D9A68", 0.9), (1, 1, 0.8))

# ---- cameras
def make_cam(name, loc, target, lens=45, shift_y=0.0):
    cd = bpy.data.cameras.new(name); cd.sensor_fit = "VERTICAL"; cd.sensor_height = 36; cd.lens = lens; cd.shift_y = shift_y
    co = bpy.data.objects.new(name, cd); sc.collection.objects.link(co); co.location = loc
    dvec = Vector(target) - Vector(loc); co.rotation_euler = dvec.to_track_quat("-Z", "Y").to_euler(); return co
wide = make_cam("Wide", (0, 0, 1.4), (0, 10, 1.4), lens=45, shift_y=0.156)
tc = Vector((TX, TY, TH))
table_cam = make_cam("TableCU", (TX, TY - 0.7, TH + 0.55), (TX, TY + 0.04, TH - 0.02), lens=35)
mid = (TAP + RIM) / 2
tap_cam = make_cam("TapCU", (TAP.x - 0.5, TAP.y - 0.85, mid.z + 0.2), (TAP.x + 0.03, TAP.y, mid.z + 0.02), lens=35)
sc.render.resolution_x, sc.render.resolution_y = 1080, 1920

bpy.context.view_layer.update()
def proj(cam, p):
    v = world_to_camera_view(sc, cam, Vector(p)); return [round(v.x * 1080, 1), round((1 - v.y) * 1920, 1)]
pts = {"wide": {"feet_y6": proj(wide, (0, 6, 0)), "feet_y6_x1": proj(wide, (1, 6, 0)),
                "table_top_c": proj(wide, tc), "table_top_l": proj(wide, (TX - 0.38, TY - 0.2, TH)), "table_top_r": proj(wide, (TX + 0.38, TY - 0.2, TH)),
                "tap": proj(wide, TAP), "rim": proj(wide, RIM)},
       "table": {"c": proj(table_cam, tc), "front_l": proj(table_cam, (TX - 0.4, TY - 0.25, TH)), "front_r": proj(table_cam, (TX + 0.4, TY - 0.25, TH)),
                 "back_l": proj(table_cam, (TX - 0.4, TY + 0.25, TH)), "back_r": proj(table_cam, (TX + 0.4, TY + 0.25, TH)),
                 "px_per_m_at_c": round(proj(table_cam, (TX + 0.1, TY, TH))[0] - proj(table_cam, tc)[0], 1) * 10},
       "tap": {"tap": proj(tap_cam, TAP), "rim": proj(tap_cam, RIM), "px_per_m": round(proj(tap_cam, (TAP.x + 0.1, TAP.y, TAP.z))[0] - proj(tap_cam, TAP)[0], 1) * 10}}
json.dump(pts, open(f"{OUT}/rooftop_points.json", "w"), indent=1); print(json.dumps(pts))
plates = (("wide", wide, 2), ("table", table_cam, 1), ("tap", tap_cam, 1))
for name, cam, k in plates:
    if ONLY and name not in ONLY: continue
    sc.camera = cam; sc.render.resolution_percentage = (50 if PREVIEW else 100) * k
    sc.render.line_thickness = 1.6 * k * (0.5 if PREVIEW else 1)
    sc.render.image_settings.file_format = "JPEG"; sc.render.image_settings.quality = 90
    sc.render.filepath = f"{OUT}/rooftop_{name}.jpg"; bpy.ops.render.render(write_still=True)
print("done")
