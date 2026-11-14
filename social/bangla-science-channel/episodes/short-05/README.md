# Short 5 — পুকুর আসলের চেয়ে বেশি গভীর! (apparent depth / refraction)

`short5_pukur_gobhir.mp4`: 1080×1920, 24 fps, 60.0 s (voice 1.05–57.24 s + end card). Voice: `../../voiceover/short-05/` (ElevenLabs eleven_v4, one take per character, sped up 6%; Whisper match 0.86–0.94).
Storyboard: `storyboard.md`. Post: `post.md`. Thumbnail: `thumbnail/` (preview made outside Figma: the Figma MCP Collab-seat tool-call limit blocked the first call and all 3 retries on 2026-11-14).

| Time (s) | Shot |
|---|---|
| 0–1.55 | Hook: water close-up, Mama's hand plunges at the fish, splash, empty hand |
| 1.55–5.0 | Mama stares at his empty palm |
| 5.0–10.5 | Boltu: knee-deep, I'll jump (dive pose) |
| 10.5–15.6 | Bithi's hand on his shoulder: it's deeper than it looks |
| 15.6–19.1 | Mama: eyes don't lie |
| 19.1–31.1 | Board: ray fish→surface→eye bends away from the normal, প্রতিসরণ, image higher |
| 31.1–35.5 | Board: 4 ft real vs about 3 ft seen |
| 35.5–42.9 | Mama aims lower, grabs... a muddy chappal, mud on his nose |
| 42.9–47.8 | Boltu: chappal-fish, fry or curry? |
| 47.8–51.8 | Bithi to Boltu: never judge depth by eye |
| 51.8–57.3 | Puzzle board: air→water, toward the normal or away? |
| 57.3–60.0 | End card |

Rebuild: copy `engine/` into `kit/s5/`, `python3 ../anim/mouth_env.py ../../voiceover/short-05/vo.wav mouth.json`, `python3 build_s5.py .. ../../voiceover/short-05`, `python3 sound_s5.py ..`, mix as in `kit/README.md`, render with `anim/make_video.py --total 1440`.
