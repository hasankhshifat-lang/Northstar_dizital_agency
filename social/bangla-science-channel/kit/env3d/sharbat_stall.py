"""3D environment (Short 7): bazaar sharbat stall on a hot afternoon. Based on rooftop.py.
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


# ---- sky + sun (hot, bright afternoon)
w = bpy.data.worlds.new("W"); sc.world = w; w.use_nodes = True; nt = w.node_tree
tcw = nt.nodes.new("ShaderNodeTexCoord"); spw = nt.nodes.new("ShaderNodeSeparateXYZ"); ramp = nt.nodes.new("ShaderNodeValToRGB")
nt.links.new(tcw.outputs["Generated"], spw.inputs[0]); nt.links.new(spw.outputs["Z"], ramp.inputs["Fac"])
ramp.color_ramp.elements[0].position = 0.0; ramp.color_ramp.elements[0].color = (*lin(hexrgb("#FFE9B8")), 1)
ramp.color_ramp.elements[1].position = 0.45; ramp.color_ramp.elements[1].color = (*lin(hexrgb("#5FB0E8")), 1)
e = ramp.color_ramp.elements.new(0.12); e.color = (*lin(hexrgb("#BFE6F5")), 1)
nt.links.new(ramp.outputs["Color"], nt.nodes["Background"].inputs["Color"]); nt.nodes["Background"].inputs["Strength"].default_value = 0.85
bpy.ops.object.light_add(type="SUN", rotation=(math.radians(50), 0, math.radians(30))); sun = bpy.context.object
sun.data.energy = 2.6; sun.data.color = (1.0, 0.9, 0.74); sun.data.angle = math.radians(4)

# ---- street: brick paving, a dusty strip, a drain edge
box("Street", (0, 12, -0.05), (30, 30, 0.1), brick_mat("Paving", "#B9875F", "#AD7A55", "#8E6A4E", 1.6, 0.02))
box("Dust", (0, 6.6, 0.002), (30, 2.4, 0.004), mat("Dust", "#D2B48C", 0.95))
box("Kerb", (0, 9.95, 0.07), (30, 0.18, 0.14), mat("Kerb", "#A39C92", 0.8))

# ---- the sharbat stall (behind the cast): counter, striped awning, jars, lemons, glasses, ice block
SX, SY = 0.6, 8.9
WOOD = mat("Wood", "#C49A64", 0.7); WOOD2 = mat("Wood2", "#8E6A40", 0.7); TEAL = mat("Teal", "#1F9E89", 0.6)
box("Counter", (SX, SY, 0.5), (3.2, 0.8, 1.0), WOOD2, bev=0.02)
box("CounterFront", (SX, SY - 0.41, 0.5), (3.0, 0.02, 0.8), TEAL)
for k in range(6): box(f"Plank{k}", (SX - 1.25 + k * 0.5, SY - 0.425, 0.5), (0.04, 0.02, 0.8), mat("PlankLine", "#17806F", 0.6))
box("CounterTop", (SX, SY - 0.02, 1.03), (3.35, 0.9, 0.06), WOOD, bev=0.01)
for dx in (-1.6, 1.6):
    for dy in (-0.42, 0.42): cyl(f"APole{dx}{dy}", (SX + dx, SY + dy, 1.25), 0.035, 2.5, WOOD2)
for k in range(9):           # red / white striped awning, sloping toward the street
    c = "#D7263D" if k % 2 == 0 else "#FFF4E0"
    o = box(f"Awn{k}", (SX - 1.6 + 0.2 + k * 0.4 - 0.2 + 0.2, SY - 0.1, 2.5), (0.4, 1.3, 0.04), mat(f"Awn{k%2}", c, 0.85)); o.rotation_euler.x = math.radians(-14)
for k in range(9):
    c = "#D7263D" if k % 2 == 0 else "#FFF4E0"
    sphere(f"Scallop{k}", (SX - 1.4 + k * 0.4, SY - 0.75, 2.33), 0.2, mat(f"Awn{k%2}", c, 0.85), (1, 0.15, 0.55))
box("SignBoard", (SX, SY + 0.43, 2.0), (2.4, 0.04, 0.5), mat("Sign", "#FFC300", 0.6), bev=0.01)
for k, col in enumerate(("#D7263D", "#2E7BD1", "#1F9E89")): sphere(f"SignDot{k}", (SX - 0.8 + k * 0.8, SY + 0.405, 2.0), 0.12, mat(f"SD{k}", col, 0.5), (1, 0.2, 1))
GLASS = mat("JarGlass", "#DDEFF2", 0.08); LEMONADE = mat("Lemonade", "#F4D35E", 0.3); ROOH = mat("Rooh", "#D1495B", 0.3); TAMAR = mat("Tamarind", "#B5651D", 0.3)
for k, (x, liq) in enumerate(((-0.6, LEMONADE), (-0.05, ROOH), (0.5, LEMONADE), (1.05, TAMAR))):
    cyl(f"JarLiq{k}", (SX + x, SY + 0.1, 1.06 + 0.17), 0.17, 0.34, liq)
    cyl(f"Jar{k}", (SX + x, SY + 0.1, 1.06 + 0.39), 0.17, 0.1, GLASS)
    cyl(f"JarLid{k}", (SX + x, SY + 0.1, 1.06 + 0.46), 0.12, 0.05, mat("JarLid", "#C9CED4", 0.4, 0.6))
LEMON = mat("Lemon", "#E9D022", 0.5); LEAFM = mat("Leaf", "#3E8E41", 0.8)
for k in range(14):
    sphere(f"Lemon{k}", (SX + 1.3 + R.uniform(-0.18, 0.18), SY - 0.22 + R.uniform(-0.12, 0.12), 1.1 + (0.06 if k > 8 else 0)), 0.05, LEMON, (1.15, 1, 1))
cyl("Basket", (SX + 1.3, SY - 0.22, 1.08), 0.24, 0.06, mat("Basket", "#B88D5A", 0.9))
for k in range(5): cyl(f"Glass{k}", (SX - 1.35 + k * 0.13, SY - 0.28, 1.06 + 0.06), 0.04, 0.12, (LEMONADE, ROOH)[k % 2])
box("Ice", (SX - 0.9, SY - 0.15, 1.06 + 0.1), (0.35, 0.25, 0.2), mat("Ice", "#D6F1FA", 0.15), bev=0.02)
box("Cloth", (SX - 0.9, SY - 0.15, 1.065), (0.5, 0.36, 0.01), mat("Gunny", "#B98A52", 0.95))
# bunting across the street
for k in range(16):
    x = -4.0 + k * 0.55; z = 2.95 - 0.18 * math.sin(math.pi * k / 15)
    o = cyl(f"Flag{k}", (x, 9.6, z), 0.12, 0.01, mat(f"Flag{k%4}", ("#D7263D", "#FFC300", "#2E7BD1", "#1F9E89")[k % 4], 0.8), verts=3, rot=(math.radians(90), 0, 0))
    o.rotation_euler.y = math.radians(90)
cyl("BuntLine", (0.1, 9.6, 2.95), 0.006, 8.5, mat("Line", "#6E7880", 0.5), rot=(0, math.radians(90), 0))
# a stool and a crate beside the stall
box("Crate", (2.6, 8.4, 0.2), (0.5, 0.4, 0.4), mat("Crate", "#D9A44E", 0.8), bev=0.01)
for k in range(5): sphere(f"CLemon{k}", (2.45 + k * 0.08, 8.4, 0.42), 0.05, LEMON)
cyl("Stool", (-2.4, 8.0, 0.22), 0.18, 0.44, mat("Stool", "#2E7BD1", 0.5))

# ---- other stalls across the street behind (fruit, cloth), shop fronts, trees
FAC = ["#E3C47F", "#C996B0", "#9FBFA6", "#D9A878", "#A9A0C9", "#D48F72", "#8FB0C9", "#E6B89C"]
for k in range(9):
    x = -9 + k * 2.4 + R.uniform(-0.2, 0.2); d = 12.5 + R.uniform(0, 0.6); hgt = R.uniform(3.4, 5.5)
    col = R.choice(FAC)
    m = brick_mat(f"Shop{k}", "#6B5B4B", "#6B5B4B", col, 1.0, 0.8, facade=True)
    brn = [n for n in m.node_tree.nodes if n.type == "TEX_BRICK"][0]; brn.inputs["Brick Width"].default_value = 1.6; brn.inputs["Row Height"].default_value = 1.4; brn.offset = 0.0
    box(f"Shop{k}", (x, d + 1.0, hgt / 2), (2.3, 2.0, hgt), m)
    box(f"Shutter{k}", (x, d - 0.01, 1.1), (1.8, 0.02, 2.2), mat(f"Sh{k}", R.choice(("#7E8A94", "#4F7CAC", "#A0522D", "#2E8B57")), 0.6))
    o = box(f"SAwn{k}", (x, d - 0.45, 2.45), (2.2, 0.9, 0.04), mat(f"SA{k}", R.choice(("#FFC300", "#2E7BD1", "#F72585", "#1F9E89", "#FF7F11")), 0.8)); o.rotation_euler.x = math.radians(-18)
    if k % 3 == 1:   # fruit pile on a low table
        box(f"FTable{k}", (x, d - 0.8, 0.45), (1.6, 0.6, 0.06), WOOD)
        for j in range(12): sphere(f"Fruit{k}{j}", (x - 0.65 + (j % 6) * 0.26, d - 0.85 + (j // 6) * 0.2, 0.55), 0.09, mat(f"Fr{j%3}", ("#FF7F11", "#4CAF50", "#E9D022")[j % 3], 0.6))
for k in range(8):
    x = R.uniform(-14, 14); d = R.uniform(18, 26)
    cyl(f"Trunk{k}", (x, d, 1.5), 0.18, 3.0, mat("Trunk", "#7A5230", 0.9))
    sphere(f"Crown{k}", (x, d, 3.8), R.uniform(1.4, 2.2), mat("Crown", "#5E9E55", 0.9), (1, 1, 0.85))
for k in range(16):
    d = R.uniform(30, 70); x = R.uniform(-d * 0.6, d * 0.6); hgt = R.uniform(6, 12) + d * 0.1; wid = R.uniform(5, 9)
    fade = min(0.6, (d - 30) / 70); base = hexrgb(R.choice(FAC)); hz = hexrgb("#DCEAF0")
    col = "#%02X%02X%02X" % tuple(int((b * (1 - fade) + h * fade) * 255) for b, h in zip(base, hz))
    box(f"Far{k}", (x, d, hgt / 2 - 1.0), (wid, wid * 0.8, hgt), mat(f"Far{k}", col, 0.9))

# ---- small table between Mama and Boltu (bottle + glass sit on it; drawn 2D)
TX, TY, TH = -0.236, 6.3, 0.72
box("TableTop", (TX, TY, TH - 0.025), (0.8, 0.5, 0.05), brick_mat("TablePlanks", "#C08A55", "#B57F4C", "#8E6438", 3.0, 0.01, rows=0), bev=0.01)
for dx in (-0.35, 0.35):
    for dy in (-0.2, 0.2): box(f"Leg{dx}{dy}", (TX + dx, TY + dy, (TH - 0.05) / 2), (0.05, 0.05, TH - 0.05), WOOD2)
box("Stretcher", (TX, TY - 0.2, 0.25), (0.7, 0.03, 0.04), WOOD2)

# ---- cameras
def make_cam(name, loc, target, lens=45, shift_y=0.0):
    cd = bpy.data.cameras.new(name); cd.sensor_fit = "VERTICAL"; cd.sensor_height = 36; cd.lens = lens; cd.shift_y = shift_y
    co = bpy.data.objects.new(name, cd); sc.collection.objects.link(co); co.location = loc
    dvec = Vector(target) - Vector(loc); co.rotation_euler = dvec.to_track_quat("-Z", "Y").to_euler(); return co
wide = make_cam("Wide", (0, 0, 1.4), (0, 10, 1.4), lens=45, shift_y=0.156)
tc = Vector((TX, TY, TH))
table_cam = make_cam("TableCU", (TX, TY - 0.75, TH + 0.42), (TX, TY + 0.04, TH + 0.12), lens=35)
sc.render.resolution_x, sc.render.resolution_y = 1080, 1920

bpy.context.view_layer.update()
def proj(cam, p):
    v = world_to_camera_view(sc, cam, Vector(p)); return [round(v.x * 1080, 1), round((1 - v.y) * 1920, 1)]
pts = {"wide": {"feet_y6": proj(wide, (0, 6, 0)), "feet_y6_x1": proj(wide, (1, 6, 0)),
                "table_top_c": proj(wide, tc), "table_top_l": proj(wide, (TX - 0.38, TY - 0.2, TH)), "table_top_r": proj(wide, (TX + 0.38, TY - 0.2, TH)),
                "counter_top_c": proj(wide, (SX, SY - 0.3, 1.06))},
       "table": {"c": proj(table_cam, tc), "front_l": proj(table_cam, (TX - 0.4, TY - 0.25, TH)), "front_r": proj(table_cam, (TX + 0.4, TY - 0.25, TH)),
                 "back_l": proj(table_cam, (TX - 0.4, TY + 0.25, TH)), "back_r": proj(table_cam, (TX + 0.4, TY + 0.25, TH)),
                 "px_per_m_at_c": round(proj(table_cam, (TX + 0.1, TY, TH))[0] - proj(table_cam, tc)[0], 1) * 10}}
json.dump(pts, open(f"{OUT}/sharbat_points.json", "w"), indent=1); print(json.dumps(pts))
plates = (("wide", wide, 2), ("table", table_cam, 1))
for name, cam, k in plates:
    if ONLY and name not in ONLY: continue
    sc.camera = cam; sc.render.resolution_percentage = (50 if PREVIEW else 100) * k
    sc.render.line_thickness = 1.6 * k * (0.5 if PREVIEW else 1)
    sc.render.image_settings.file_format = "JPEG"; sc.render.image_settings.quality = 90
    sc.render.filepath = f"{OUT}/sharbat_{name}.jpg"; bpy.ops.render.render(write_still=True)
print("done")
