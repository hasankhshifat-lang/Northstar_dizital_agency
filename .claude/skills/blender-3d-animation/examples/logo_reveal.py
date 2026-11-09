"""Example: 3D text logo reveal with a spinning ring, glowing orb and orbiting camera.

blender -b -P examples/logo_reveal.py -- --out out/logo_reveal.mp4 --preview
blender -b -P examples/logo_reveal.py -- --out out/logo_reveal.mp4 --vertical   (9:16 for Shorts/Reels)
blender -b -P examples/logo_reveal.py -- --out out/frame.png --frame 60          (one still to check)
"""
import math
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "scripts"))
import bl_helpers as H  # noqa: E402

TEXT = os.environ.get("LOGO_TEXT", "NORTHSTAR")
vertical = "--vertical" in sys.argv
if vertical:
    sys.argv.remove("--vertical")

args = H.parse_args()
H.reset_scene()
scene = H.setup_render(args, fps=30, seconds=4, vertical=vertical)
H.world_color((0.04, 0.05, 0.08), strength=1.5)

gold = H.material("Gold", "#e8b04a", metallic=1.0, roughness=0.25)
teal = H.material("Teal", "#1f8a8a", metallic=0.3, roughness=0.35)
glow = H.material("Glow", "#ffffff", emission="#ffd27a", emission_strength=12)
floor_mat = H.material("Floor", "#0c0f16", roughness=0.35)

# Floor
floor = H.add("plane", "Floor", location=(0, 0, -1.2), scale=30)
H.assign(floor, floor_mat)

# Logo text: rises and scales in
logo = H.text(TEXT, "Logo", location=(0, 0, 0), size=1.1 if not vertical else 0.7, extrude=0.12)
logo.rotation_euler = (math.radians(90), 0, 0)
H.assign(logo, gold)
logo.data.bevel_depth = 0.015
H.key(logo, 1, location=(0, 0, -1.6), scale=(0.6, 0.6, 0.6))
H.key(logo, 45, location=(0, 0, 0.2), scale=(1, 1, 1))
H.key(logo, 120, location=(0, 0, 0.3), scale=(1, 1, 1))

# Ring that spins forever behind the text
ring = H.add("torus", "Ring", location=(0, 1.2, 0.3), major_radius=3.2, minor_radius=0.06)
ring.rotation_euler = (math.radians(90), 0, 0)
H.assign(ring, teal)
H.key(ring, 1, "LINEAR", rotation_euler=(math.radians(90), 0, 0))
H.key(ring, 60, "LINEAR", rotation_euler=(math.radians(90), math.radians(180), 0))
H.loop_cycles(ring)

# Glowing orb (the "north star") pops in above the logo
orb = H.add("sphere", "Star", location=(0, 0, 1.5), radius=0.18)
H.assign(orb, glow)
H.key(orb, 30, scale=(0, 0, 0))
H.key(orb, 55, scale=(1.3, 1.3, 1.3))
H.key(orb, 65, scale=(1, 1, 1))

H.three_point_lights()
cam = H.camera(lens=40 if not vertical else 30)
H.orbit_camera(cam, target=(0, 0, 0.3), radius=11, height=2.5, start_deg=-120, end_deg=-60)

H.render(args)
