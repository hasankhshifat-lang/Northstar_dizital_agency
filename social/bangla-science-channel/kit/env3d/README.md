# 3D environments (owner rule 2026-11-14)

**Every Short gets a 3D environment, and never the same one as an earlier Short.** The environments are built
in code with Blender (headless, Cycles CPU, cartoon outlines with Freestyle, "Standard" colour so colours stay
bright like the 2D characters). The kit's rigged 2D puppets and held props stay as they are and are composited
on the 3D plates by the puppet engine.

## How it works
1. Write `env3d/<name>.py` (copy `rooftop.py`). Keep the camera convention so the puppets fit the set:
   the characters' feet plane is y = 6 m, projected to screen y = 1820, with 1 m = 400 px there
   (puppets at scale 0.8 are about 1.7 m tall). Wide camera: lens 45 mm, sensor fit vertical 36 mm,
   height 1.4 m, `shift_y = 0.156`, looking straight ahead.
2. Add close-up cameras for the shots that need them (e.g. a table top, a tap). Each camera renders its own plate.
3. The script writes `out/<name>_points.json`: anchor points (table top, tap mouth, bucket rim, …) projected to
   1080×1920 screen space per plate, plus px-per-metre, so 2D props sit exactly on 3D surfaces.
4. Render: `blender -b --python env3d/<name>.py -- $(pwd)/env3d/out [--preview] [--only=table,tap]`
   (preview ≈ 1 min; full ≈ 4 min for the 2× wide plate + 1 min per close-up plate on 4 CPUs).
5. In the Short's build script pass the plates as `D.bgs = {key: '<img …>'}`, `D.bgDefault = "wide"`, and pick a
   plate per shot with `shot.bgk`. The engine (`s6/engine.html` onward) shows the plate without the 1.04 bg scale,
   so projected points are exact. The wide plate is rendered at 2× so the engine camera can push in to medium shots.
6. Look at a preview of every plate before the full render, then check keyframe stills with the characters on top.

## Environment register (don't reuse; add a row for every Short)
| Short | Environment | Type |
|---|---|---|
| Short 3 লজ্জাবতী | village courtyard (mud house, banana trees, fence) | 2D (before the rule) |
| Short 1 লঞ্চ | river bank / launch | 2D (before the rule) |
| Short 2 হলুদ-লাল | (not recorded) | 2D (before the rule) |
| Short 4 মেঘের গর্জন | roadside tea stall, stormy evening | 2D (before the rule) |
| Short 5 পুকুর (dropped) | village pond ghat | 2D (before the rule) |
| Short 6 চিরুনি | **Dhaka rooftop**: tiled roof, parapet, water tank with tap, clothesline, plants, city skyline (`rooftop.py`) | 3D |

Ideas for the next ones (each used once): school science lab, village kitchen (মাটির চুলা), riverside boat
(নৌকা), rice field at sunset, bazaar stall, railway platform, rainy-day veranda, night rooftop with stars.
