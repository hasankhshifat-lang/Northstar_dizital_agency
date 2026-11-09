# Short 3 — লজ্জাবতী কেন গুটিয়ে যায়? (Mimosa leaf folding)

`short3_lojjaboti.mp4`: 1080×1920, 24 fps, 59.5 s (voice 56.2 s + end card). The voice-over is in `../../voiceover/short-03/`.

| Time (s) | Shot |
|---|---|
| 0–4 | Boltu touches the lojjaboti and the leaves fold |
| 4–13 | Mama's joke ("it's shy, you haven't bathed"), Boltu sniffs his armpit |
| 13–20 | Bithi: a plant moves when it gets a stimulus (উদ্দীপক → চলন) |
| 20–30 | Notebook board: water-filled cells in the leaf hinge. A touch makes water leave the cells, the cells go limp and the leaf droops; when water returns the leaf opens again |
| 30–39 | Boltu asks why. Close-up: an insect lands, the leaves fold and it tumbles off (আত্মরক্ষা) |
| 39–49 | The goat chews Mama's gamchha, Mama shouts at it |
| 49–56 | Night-time puzzle for the comments (the answer is not shown) |
| 56–59.5 | End card: সাইন্টিফিক বিথী banner and name plates |

## Rebuilding
`engine/` holds the puppet engine (Pilot 5's engine plus support for two speakers on one line through `also`), `art3.py` (courtyard, plant fold stages, hinge board, insect, goat, night card), `build_s3.py` (shots timed to `timeline.json`) and `sound_s3.py` (synth SFX + folk music bed). They depend on the Pilot 5 `art.py` and the character rigs from the working scratchpad.
