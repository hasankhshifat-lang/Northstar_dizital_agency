---
name: blender-3d-animation
description: Generate 3D animations and renders with the Blender engine, headless from Python (bpy). Use when the user asks for a 3D animation, 3D logo reveal, product turntable, 3D intro/outro, animated 3D text, 3D scene, or a Blender render for a video, Short, Reel or ad. Outputs MP4 (16:9 or 9:16), PNG stills or PNG sequences.
---

# Blender 3D animation

Builds 3D scenes in code and renders them with Blender running headless (`blender -b`).
Blender itself is the open-source engine from https://github.com/blender/blender. This skill uses
the official prebuilt LTS binary from download.blender.org, not a source build. Compiling Blender
from source takes hours and is never needed here.

## 1. Make sure Blender is installed

```bash
blender --version || bash .claude/skills/blender-3d-animation/scripts/install_blender.sh
```

Cloud containers are fresh each session, so run the install step at the start of the task.
It installs Blender 4.5 LTS to `/opt/blender` (about 400 MB, roughly 1 minute). Set `BLENDER_VERSION`
to pin another version. If Blender exits with `libEGL.so.1` missing, install the graphics libraries:

```bash
apt-get install -y libegl1 libgl1 libegl-mesa0 libgles2 libxkbcommon0 libsm6 libxi6 \
  libxxf86vm1 libxfixes3 libxrender1 libxrandr2 libxinerama1 libxcursor1 libwayland-client0
```

`EGL Error (0x3009): EGL_BAD_MATCH` lines in the log are harmless noise from software OpenGL. Ignore them.

## 2. Agree on the brief before rendering

Confirm with the user: what the animation shows, text/logo wording, brand colours, length (seconds),
aspect (16:9 1920×1080 for YouTube long-form, 9:16 1080×1920 for Shorts/Reels/TikTok, 1:1 for feed),
and where the file goes. Full-quality renders are slow (see the timing table), so get a yes on a
preview first.

## 3. Write a scene script

Copy `examples/logo_reveal.py` as a starting point, or write a new script that imports the helpers:

```python
import math, os, sys
sys.path.insert(0, "/home/user/Northstar_dizital_agency/.claude/skills/blender-3d-animation/scripts")
import bl_helpers as H

args = H.parse_args()                       # --out, --engine, --preview, --frame, --samples, --save-blend
H.reset_scene()
H.setup_render(args, fps=30, seconds=4, vertical=False)
H.world_color((0.04, 0.05, 0.08), strength=1.5)

gold = H.material("Gold", "#e8b04a", metallic=1.0, roughness=0.25)
cube = H.assign(H.add("cube", "Box", location=(0, 0, 0)), gold)
H.bevel(cube)
H.key(cube, 1,   rotation_euler=(0, 0, 0), scale=(0.2,) * 3)
H.key(cube, 60,  rotation_euler=(0, 0, math.radians(360)), scale=(1,) * 3)

H.three_point_lights()
cam = H.camera(location=(0, -8, 3), target=(0, 0, 0))
H.render(args)
```

Helpers in `scripts/bl_helpers.py`:

| Helper | What it does |
|---|---|
| `reset_scene()`, `setup_render(args, fps, seconds, vertical, width, height)` | Empty scene, resolution, frame range, engine, AgX colour |
| `world_color(rgb, strength)` | Background/ambient light |
| `material(name, hex, metallic, roughness, emission, emission_strength)`, `assign(obj, mat)` | Principled BSDF materials from hex colours |
| `add(kind, ...)` | cube, sphere, cylinder, cone, torus, plane, monkey (extra kwargs go to the bpy primitive op) |
| `text(body, size, extrude, font_path)`, `bevel(obj)` | 3D text (load a .ttf for brand fonts), bevelled edges |
| `camera(location, target, lens)`, `look_at`, `track_to`, `empty` | Camera placement and aiming |
| `light(kind, location, energy, color, size)`, `three_point_lights()` | Area/point/sun/spot lights |
| `key(obj, frame, interpolation, **props)` | Keyframe any property (`location`, `rotation_euler`, `scale`, …) |
| `loop_cycles(obj)` | Repeat an object's animation forever |
| `orbit_camera(cam, target, radius, height, start_deg, end_deg)` | Turntable / orbit camera move |
| `render(args)` | `.mp4` → H.264 video, `.png`/`.jpg` → still, `folder/` → PNG sequence |

For anything the helpers don't cover, use `bpy` directly (modifiers, geometry nodes, particles,
physics, importing `.glb/.fbx/.obj` with `bpy.ops.import_scene.gltf(filepath=...)`, etc.).
In Blender 4.4+ actions are layered: read fcurves through `H._fcurves(action)`, not `action.fcurves`.

## 4. Check a still, then a preview, then the final

```bash
cd .claude/skills/blender-3d-animation
blender -b -P my_scene.py -- --out out/check.png --frame 60 --preview   # one frame, ~4 s
blender -b -P my_scene.py -- --out out/preview.mp4 --preview            # half-res draft video
blender -b -P my_scene.py -- --out out/final.mp4                        # full quality
```

Arguments for the script go after `--`. Always look at the still (Read the PNG) before rendering video,
and pull a few frames from the preview with ffmpeg to check motion:

```bash
ffmpeg -v error -y -i out/preview.mp4 -vf "select='not(mod(n\,30))',scale=480:-1,tile=4x1" -frames:v 1 out/contact.png
```

Long renders: run them with `run_in_background` and wait for completion rather than polling.

### Timing in this container (4 CPU cores, no GPU, software OpenGL)

| Render | Per frame |
|---|---|
| EEVEE `--preview` (50% res, 8 samples) | ~4–5 s |
| EEVEE full 1080p, 64 samples | ~65 s |
| Cycles `--preview` (16 samples) | ~7 s |
| Cycles full 1080p, 64 samples | ~85 s |

A 4-second, 30 fps clip is 120 frames: about 9 minutes as a preview, about 2 hours at full quality
with default samples. To speed up the final, lower samples (`--samples 16`), use 24 fps, shorten the
clip, or render a 1280×720 version. EEVEE is the default. Use `--engine CYCLES` for realistic glass,
caustics or soft global illumination, and `WORKBENCH` for fast untextured blocking.

## 5. Deliver

- Save renders under `out/` (git-ignored) while working. Put final deliverables where the user
  asks, for example `social/` for channel assets, and keep the scene script next to them so it can
  be re-rendered.
- Add `--save-blend out/scene.blend` if the user wants to open the scene in Blender themselves.
- A render meant for YouTube or the Facebook Page still goes through the `youtube-channel-automation`
  or `facebook-page-automation` skill for uploading, with the user's confirmation.
- Commit the scene script (not large render outputs unless asked) and push.
