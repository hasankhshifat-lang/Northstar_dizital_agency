# Short 7 — শরবত কে তোলে? (straw and air pressure)

`short7_straw_bayuchap.mp4`: 1080×1920, 24 fps, 59.9 s (voice 0.6–57.14 s + end card). Voice: `../../voiceover/short-07/` (ElevenLabs eleven_v4, one take per character, generations_count 1, 1.06× tempo, lines cut with padding + fades + fixed gain).
Script + topic report (score 79): `../../shorts/short-07-straw-bayuchap.md`. Storyboard: `storyboard.md`. Post: `post.md`. Thumbnail: `thumbnail/`.
**3D environment (new):** a bazaar sharbat stall built in Blender (`../../kit/env3d/sharbat_stall.py`): wide 2× plate + a 3D table close-up plate; puppets, bottle, glass, bendy straws and the demonstration overlays are 2D on projected anchor points (`sharbat_points.json`).

Rebuild: `blender -b --python ../../kit/env3d/sharbat_stall.py -- <kit>/env3d/out`, copy `engine/` into `kit/s7/`, `python3 ../anim/mouth_env.py ../../voiceover/short-07/vo.wav mouth.json`, `python3 build_s7.py .. ../../voiceover/short-07`, `python3 sound_s7.py ..`, mix as in `kit/README.md` (DUR 59.9), render with `anim/make_video.py --total 1437`.
