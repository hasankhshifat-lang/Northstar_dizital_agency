# Short 6 — চিরুনিতে কি চুম্বক আছে? (static electricity)

`short6_chiruni_chumbok.mp4`: 1080×1920, 24 fps, 57.8 s (voice 0.9–55.04 s + end card). Voice: `../../voiceover/short-06/` (ElevenLabs eleven_v4, one take per character, 1.06× tempo, lines cut with padding + fades + fixed gain; Whisper match per placed line 0.74–0.92, the 0.74 is Mama's laugh "হেহে" that Whisper drops).
Script + topic report (score 82): `../../shorts/short-06-chiruni-chumbok.md`. Storyboard: `storyboard.md`. Post: `post.md`. Thumbnail: `thumbnail/` (preview made outside Figma: the Figma Collab-seat tool-call limit blocked the first call and 3 retries on 2026-11-14).
Made after the owner dropped Short 5 and asked for the video and script rules to be followed; see the storyboard checks.

Rebuild: copy `engine/` into `kit/s6/`, `python3 ../anim/mouth_env.py ../../voiceover/short-06/vo.wav mouth.json`, `python3 build_s6.py .. ../../voiceover/short-06`, `python3 sound_s6.py ..`, mix as in `kit/README.md`, render with `anim/make_video.py --total 1387`. `probe.py` measures hand points for held props.
