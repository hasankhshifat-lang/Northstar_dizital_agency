"""3D environment (Short 8): footpath barber stall (রাস্তার ধারের নাপিত) under a rain tree, morning. Based on sharbat_stall.py.
The mirror on the tree faces the camera; a reverse camera looks at the street behind the wide camera (traffic jam),
which is what the mirror reflects. Plates: wide (2x), mirror (close-up of the mirror), street (reverse angle).
Original header: Dhaka rooftop (ছাদ) in the afternoon — tiled roof, parapet, water tank with a tap and a bucket,
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


# ---- sky + sun (clear morning)
w = bpy.data.worlds.new("W"); sc.world = w; w.use_nodes = True; nt = w.node_tree
tcw = nt.nodes.new("ShaderNodeTexCoord"); spw = nt.nodes.new("ShaderNodeSeparateXYZ"); ramp = nt.nodes.new("ShaderNodeValToRGB")
nt.links.new(tcw.outputs["Generated"], spw.inputs[0]); nt.links.new(spw.outputs["Z"], ramp.inputs["Fac"])
ramp.color_ramp.elements[0].position = 0.0; ramp.color_ramp.elements[0].color = (*lin(hexrgb("#FFF1D0")), 1)
ramp.color_ramp.elements[1].position = 0.45; ramp.color_ramp.elements[1].color = (*lin(hexrgb("#6CB8EC")), 1)
e = ramp.color_ramp.elements.new(0.12); e.color = (*lin(hexrgb("#CDEBF7")), 1)
nt.links.new(ramp.outputs["Color"], nt.nodes["Background"].inputs["Color"]); nt.nodes["Background"].inputs["Strength"].default_value = 0.85
bpy.ops.object.light_add(type="SUN", rotation=(math.radians(48), 0, math.radians(-35))); sun = bpy.context.object
sun.data.energy = 2.5; sun.data.color = (1.0, 0.93, 0.8); sun.data.angle = math.radians(4)

WOOD = mat("Wood", "#B98A56", 0.7); WOOD2 = mat("Wood2", "#7E5A36", 0.7)
# ---- footpath (front, under the cast) and the road behind the wide camera (y < 2)
box("Footpath", (0, 11, 0.0), (30, 18, 0.1), brick_mat("Tiles", "#C9B79C", "#BFAE93", "#9C8D78", 1.1, 0.015, rows=0))
box("Kerb", (0, 1.95, 0.08), (40, 0.22, 0.16), mat("Kerb", "#D9D2C5", 0.8))
for k in range(20): box(f"KerbP{k}", (-19 + k * 2, 1.95, 0.161), (1.0, 0.2, 0.004), mat("KerbY", "#F2C230", 0.7))
box("Road", (0, -8, -0.03), (40, 20, 0.06), mat("Asphalt", "#5B5E63", 0.9))
for k in range(14): box(f"Lane{k}", (-18 + k * 3, -4.5, 0.002), (1.6, 0.12, 0.004), mat("LaneW", "#F4F1E8", 0.6))
box("FarPath", (0, -17.5, 0.05), (40, 3, 0.1), mat("FarPath", "#BDB3A3", 0.9))

# ---- the rain tree with the barber's mirror (behind the cast, between Mama and Boltu)
TRX, TRY = -0.15, 7.6
BARK = mat("Bark", "#6E4A2E", 0.95)
cyl("Trunk", (TRX, TRY, 2.0), 0.36, 4.0, BARK, verts=20)
for k, (dx, dz, r) in enumerate(((-1.6, 4.4, 2.2), (1.3, 4.6, 2.4), (0.0, 5.3, 2.6), (-3.0, 4.0, 1.6), (2.9, 4.1, 1.7))):
    sphere(f"Crown{k}", (TRX + dx, TRY + 0.6, dz), r, mat("Crown", "#4F9A4A", 0.9), (1.25, 0.9, 0.7))
o = cyl("Branch1", (TRX - 0.7, TRY + 0.2, 3.7), 0.12, 1.8, BARK, rot=(0, math.radians(-50), 0))
o = cyl("Branch2", (TRX + 0.7, TRY + 0.2, 3.8), 0.12, 1.8, BARK, rot=(0, math.radians(48), 0))
MX, MY, MZ, MW, MH = TRX, TRY - 0.42, 1.52, 0.46, 0.62          # mirror glass centre and size (faces -y)
box("MirrorBoard", (MX, MY + 0.03, MZ), (MW + 0.16, 0.04, MH + 0.16), mat("Board", "#A0703F", 0.7), bev=0.01)
box("MirrorFrame", (MX, MY + 0.005, MZ), (MW + 0.06, 0.03, MH + 0.06), mat("Frame", "#E8B64C", 0.4, 0.3), bev=0.008)
box("MirrorGlass", (MX, MY - 0.012, MZ), (MW, 0.006, MH), mat("Glass", "#BFD9E3", 0.08))
box("Shelf", (MX, MY - 0.05, MZ - MH / 2 - 0.30), (0.62, 0.18, 0.03), WOOD)
for k, (dx, col, h) in enumerate(((-0.22, "#2E7BD1", 0.16), (-0.12, "#D7263D", 0.12), (0.12, "#1F9E89", 0.18), (0.22, "#F2C230", 0.1))):
    cyl(f"Bottle{k}", (MX + dx, MY - 0.06, MZ - MH / 2 - 0.285 + h / 2), 0.03, h, mat(f"Bot{k}", col, 0.3))
cyl("Mug", (MX + 0.02, MY - 0.06, MZ - MH / 2 - 0.24), 0.04, 0.08, mat("Mug", "#FFFFFF", 0.4))
# barber chair (wooden, red seat) to the right of the tree, and a towel on a line
CX, CY = 1.25, 7.4
box("Seat", (CX, CY, 0.48), (0.5, 0.48, 0.07), mat("SeatRed", "#C8302E", 0.6), bev=0.02)
box("Back", (CX, CY + 0.24, 0.85), (0.5, 0.06, 0.7), mat("SeatRed", "#C8302E", 0.6), bev=0.02)
for dx in (-0.22, 0.22):
    for dy in (-0.2, 0.2): box(f"CLeg{dx}{dy}", (CX + dx, CY + dy, 0.23), (0.05, 0.05, 0.46), WOOD2)
    box(f"Arm{dx}", (CX + dx * 1.1, CY, 0.7), (0.05, 0.46, 0.05), WOOD2)
cyl("TowelLine", (-1.6, 7.3, 1.95), 0.006, 2.4, mat("Line", "#6E7880", 0.5), rot=(0, math.radians(90), 0))
for k, col in enumerate(("#FFFFFF", "#7FC8F8", "#FFFFFF")):
    box(f"Towel{k}", (-2.4 + k * 0.6, 7.3, 1.7), (0.42, 0.02, 0.5), mat(f"Tw{k}", col, 0.9))
cyl("Pole", (-2.85, 7.3, 1.0), 0.03, 2.0, WOOD2)
box("Stool", (2.0, 7.0, 0.2), (0.36, 0.36, 0.4), mat("StoolB", "#2E7BD1", 0.5), bev=0.02)
cyl("Bucket", (-1.1, 7.2, 0.15), 0.15, 0.3, mat("BucketG", "#3FA34D", 0.5))
# ---- wall and shops behind the barber (a tin wall with posters, a pharmacy and a tea shop)
box("TinWall", (0, 9.2, 1.1), (30, 0.1, 2.2), brick_mat("Tin", "#8FA3AD", "#869AA4", "#6C7F89", 2.0, 0.05, facade=True))
for k, (x, col) in enumerate(((-3.6, "#F72585"), (-2.2, "#FFC300"), (2.8, "#2E7BD1"), (4.0, "#FF7F11"))):
    box(f"Poster{k}", (x, 9.14, 1.3), (0.6, 0.02, 0.8), mat(f"Po{k}", col, 0.8))
FAC = ["#E3C47F", "#C996B0", "#9FBFA6", "#D9A878", "#A9A0C9", "#D48F72", "#8FB0C9", "#E6B89C"]
for k in range(10):
    x = -11 + k * 2.4 + R.uniform(-0.2, 0.2); d = 11.5 + R.uniform(0, 0.8); hgt = R.uniform(4.0, 7.0)
    m = brick_mat(f"Bld{k}", "#6B5B4B", "#6B5B4B", R.choice(FAC), 1.0, 0.8, facade=True)
    brn = [n for n in m.node_tree.nodes if n.type == "TEX_BRICK"][0]; brn.inputs["Brick Width"].default_value = 1.6; brn.inputs["Row Height"].default_value = 1.4; brn.offset = 0.0
    box(f"Bld{k}", (x, d + 1.0, hgt / 2), (2.3, 2.0, hgt), m)
for k in range(12):
    d = R.uniform(25, 60); x = R.uniform(-d * 0.6, d * 0.6); hgt = R.uniform(8, 14) + d * 0.1; wid = R.uniform(5, 9)
    fade = min(0.6, (d - 25) / 60); base = hexrgb(R.choice(FAC)); hz = hexrgb("#DCEAF0")
    col = "#%02X%02X%02X" % tuple(int((b * (1 - fade) + h * fade) * 255) for b, h in zip(base, hz))
    box(f"Far{k}", (x, d, hgt / 2 - 1.0), (wid, wid * 0.8, hgt), mat(f"Far{k}", col, 0.9))
cyl("LampPole", (3.4, 8.6, 2.6), 0.06, 5.2, mat("Steel", "#8A949C", 0.4, 0.6))
# ---- the street behind the wide camera (seen by the reverse camera and in the mirror): traffic jam + shops opposite
def rickshaw(x, y, col):
    box(f"RkSeat{x}", (x, y, 0.75), (0.9, 0.5, 0.3), mat(f"Rk{col}", col, 0.6), bev=0.03)
    o = sphere(f"RkHood{x}", (x, y + 0.05, 1.25), 0.5, mat(f"RkH{col}", col, 0.6), (1, 0.6, 0.8))
    for dx in (-0.45, 0.45): cyl(f"RkW{x}{dx}", (x + dx, y, 0.35), 0.35, 0.04, mat("Tyre", "#2B2B2B", 0.8), verts=24, rot=(0, math.radians(90), 0))
def car(x, y, col, L=1.8, W=1.7, H=1.4):
    box(f"CarB{x}{y}", (x, y, 0.55), (W, L * 2.2, 0.7), mat(f"Car{col}", col, 0.35, 0.2), bev=0.08)
    box(f"CarT{x}{y}", (x, y + 0.2, 1.15), (W * 0.9, L * 1.2, 0.55), mat(f"Car{col}", col, 0.35, 0.2), bev=0.08)
    box(f"CarW{x}{y}", (x, y + 0.2 + 0.0, 1.15), (W * 0.92, L * 1.0, 0.45), mat("Win", "#2C3E50", 0.1))
car(-3.2, -6.0, "#2E8B57"); car(3.4, -9.5, "#F2C230", H=2.0)
box("Bus", (-5.6, -11.5, 1.5), (2.5, 9.0, 2.8), mat("BusR", "#C8302E", 0.5), bev=0.1)
for k in range(5): box(f"BusWin{k}", (-4.34, -9.0 - k * 1.5, 2.1), (0.02, 1.2, 0.8), mat("Win", "#2C3E50", 0.1))
rickshaw(2.3, -4.6, "#1F9E89"); rickshaw(5.2, -5.4, "#F72585"); rickshaw(-1.6, -12.0, "#2E7BD1")
cyl("CNG", (4.6, -12.5, 0.9), 0.75, 1.6, mat("CNGg", "#3FA34D", 0.5), verts=16)
for k in range(10):
    x = -11 + k * 2.4 + R.uniform(-0.2, 0.2); d = -19.5 - R.uniform(0, 0.8); hgt = R.uniform(4.0, 7.5)
    m = brick_mat(f"OBld{k}", "#6B5B4B", "#6B5B4B", R.choice(FAC), 1.0, 0.8, facade=True)
    brn = [n for n in m.node_tree.nodes if n.type == "TEX_BRICK"][0]; brn.inputs["Brick Width"].default_value = 1.6; brn.inputs["Row Height"].default_value = 1.4; brn.offset = 0.0
    box(f"OBld{k}", (x, d - 1.0, hgt / 2), (2.3, 2.0, hgt), m)
    o = box(f"OAwn{k}", (x, d + 0.45, 2.45), (2.2, 0.9, 0.04), mat(f"OA{k}", R.choice(("#FFC300", "#2E7BD1", "#F72585", "#1F9E89", "#FF7F11")), 0.8)); o.rotation_euler.x = math.radians(18)
for k in range(6):
    x = -9 + k * 3.6; cyl(f"OTree{k}", (x, -24, 1.5), 0.18, 3.0, mat("Trunk", "#7A5230", 0.9)); sphere(f"OCrown{k}", (x, -24, 3.8), 1.8, mat("Crown", "#4F9A4A", 0.9), (1, 1, 0.85))

# ---- cameras
def make_cam(name, loc, target, lens=45, shift_y=0.0):
    cd = bpy.data.cameras.new(name); cd.sensor_fit = "VERTICAL"; cd.sensor_height = 36; cd.lens = lens; cd.shift_y = shift_y
    co = bpy.data.objects.new(name, cd); sc.collection.objects.link(co); co.location = loc
    dvec = Vector(target) - Vector(loc); co.rotation_euler = dvec.to_track_quat("-Z", "Y").to_euler(); return co
wide = make_cam("Wide", (0, 0, 1.4), (0, 10, 1.4), lens=45, shift_y=0.156)
mirror_cam = make_cam("MirrorCU", (MX + 0.05, MY - 1.3, MZ + 0.02), (MX, MY, MZ - 0.1), lens=40)
street_cam = make_cam("Street", (0.3, 5.0, 1.45), (0.6, -6.0, 0.9), lens=32)
sc.render.resolution_x, sc.render.resolution_y = 1080, 1920

bpy.context.view_layer.update()
def proj(cam, p):
    v = world_to_camera_view(sc, cam, Vector(p)); return [round(v.x * 1080, 1), round((1 - v.y) * 1920, 1)]
def corners(cam):
    return {"tl": proj(cam, (MX - MW / 2, MY - 0.016, MZ + MH / 2)), "tr": proj(cam, (MX + MW / 2, MY - 0.016, MZ + MH / 2)),
            "bl": proj(cam, (MX - MW / 2, MY - 0.016, MZ - MH / 2)), "br": proj(cam, (MX + MW / 2, MY - 0.016, MZ - MH / 2))}
pts = {"wide": {"feet_y6": proj(wide, (0, 6, 0)), "feet_y6_x1": proj(wide, (1, 6, 0)), "mirror": corners(wide)},
       "mirror": {"mirror": corners(mirror_cam)},
       "street": {"road_c": proj(street_cam, (0.6, -6.0, 0)), "road_c_x1": proj(street_cam, (1.6, -6.0, 0)), "road_near": proj(street_cam, (0.6, -3.0, 0))}}
json.dump(pts, open(f"{OUT}/barber_points.json", "w"), indent=1); print(json.dumps(pts))
plates = (("wide", wide, 2), ("mirror", mirror_cam, 1), ("street", street_cam, 1))
for name, cam, k in plates:
    if ONLY and name not in ONLY: continue
    sc.camera = cam; sc.render.resolution_percentage = (50 if PREVIEW else 100) * k
    sc.render.line_thickness = 1.6 * k * (0.5 if PREVIEW else 1)
    sc.render.image_settings.file_format = "JPEG"; sc.render.image_settings.quality = 90
    sc.render.filepath = f"{OUT}/barber_{name}.jpg"; bpy.ops.render.render(write_still=True)
print("done")
