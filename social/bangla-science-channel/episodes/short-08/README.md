# Short 8 — অ্যাম্বুলেন্সের বানান উল্টো কেন? (mirror images)

`short8_ayna_ulto.mp4`: 1080×1920, 24 fps, 55.96 s (voice 0.6–53.32 s + end card). Voice: `../../voiceover/short-08/` (ElevenLabs eleven_v4, one take per character, generations_count 1, 1.06× tempo, lines cut with padding + fades + fixed gain).
Script + topic report (score 83): `../../shorts/short-08-ayna-ulto.md`. Storyboard: `storyboard.md`. Post: `post.md`. Thumbnail: `thumbnail/` (artwork generated in Figma with gpt-image-2.5-flare; layout made outside Figma and Spline, see the approval message).
**3D environment (new):** a footpath barber stall under a rain tree, Dhaka (`../../kit/env3d/barber_stall.py`): wide 2× plate, mirror close-up plate and a reverse street plate (the street behind the camera, with the jam). `build_s8.py` composites the flipped street into the mirror glass of the wide and close-up plates, so the reflection matches the set.

Rebuild: `blender -b --python ../../kit/env3d/barber_stall.py -- <kit>/env3d/out`, copy `engine/` into `kit/s8/`, `python3 ../anim/mouth_env.py ../../voiceover/short-08/vo.wav mouth.json`, `python3 build_s8.py .. ../../voiceover/short-08`, `python3 sound_s8.py ..`, mix as in `kit/README.md` (DUR 55.98), render with `anim/make_video.py --total 1343`.
