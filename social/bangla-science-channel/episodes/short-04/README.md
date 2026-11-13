# Short 4 — চমক আগে, গর্জন পরে কেন? (lightning before thunder)

`short4_megher_gorjon.mp4`: 1080×1920, 24 fps, 61.5 s (voice 3.3–58.8 s + end card). Voice: `../../voiceover/short-04/` (ElevenLabs eleven_v4, one take per character, sped up 7% with atempo to stay near 60 s).
Storyboard: `storyboard.md`. Post: `post.md`. Thumbnail: `thumbnail/` (preview made outside Figma: the Figma MCP tool-call limit blocked all 3 tries on 2026-11-13).

| Time (s) | Shot |
|---|---|
| 0–7.5 | Storm at the tea stall: bolt + flash, on-screen count ১-২-৩, thunder, Mama jolts and asks why |
| 7.5–12.5 | Mama's imagination: road in the sky, light = motorbike slipping through, sound = bus stuck in a jam |
| 12.5–15.6 | Boltu close-up: traffic police in the sky? |
| 15.6–17.4 | Bithi to Mama: not a jam, a race |
| 17.4–33.2 | Board: light ray and sound rings leave the bolt together; speeds; eye first, ear later; 3 s along a 1 km ruler (330 × 3 = 990 m) |
| 33.2–37.0 | Mama: 6 s = 2 km, we're safe |
| 37.0–43.0 | Bithi: very close! indoors ✓, under a tree ✗ (rain starts) |
| 43.0–46.9 | Boltu pops a paper bag (ঠাস!), Mama jumps |
| 46.9–52.5 | Boltu: bag-thunder, thunder without a flash |
| 52.5–58.8 | Puzzle: air / water / iron, comment |
| 58.8–61.5 | End card |

Rebuild: copy `engine/` into `kit/s4/`, then `python3 build_s4.py .. ../../voiceover/short-04`, `python3 sound_s4.py ..`, mix as in `kit/README.md`, render with `anim/make_video.py --total 1476`.
