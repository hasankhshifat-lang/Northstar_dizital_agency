# Scientist cameos

Hyperrealistic portraits of famous scientists, generated in Figma (file "Scientific Bithi — Scientist Cameos", https://www.figma.com/design/p7WBHQcFJpfyTNbWtS8Nsd). They appear in a Short when the science in it was discovered by that scientist, who then explains it in a few lines.

| Key | Scientist | Use for |
|---|---|---|
| `jc_bose` | জগদীশ চন্দ্র বসু | plant responses (লজ্জাবতী, plants react to stimuli), radio/microwaves |
| `newton` | আইজ্যাক নিউটন | laws of motion, gravity, splitting white light into colours |
| `einstein` | আলবার্ট আইনস্টাইন | relativity, the photoelectric effect |
| `marie_curie` | মেরি কুরি | radioactivity |

Files: `raw/<key>.png` is the Figma output; `<key>.png` is the transparent cut-out (`python3 cutout.py raw/x.png x.png 24`); `cameo.py` makes the engine prop (portrait + name plate with the field and "নাট্যরূপ"). `preview_jc_bose.jpg` shows how it looks in a scene.

## Rules
- Only for discoveries that really belong to that scientist (check the NCTB book and a second source). At most one cameo per Short, about 5–10 s, and the explanation stays short and correct.
- Long-dead historical scientists only. Never make cameos of living people.
- The cameo's voice is a fixed ElevenLabs library voice that fits the person's age and sex, never a clone of the real voice. Save the voice chosen for each scientist in `voices.json` and always reuse it.
- The plate always says "নাট্যরূপ" (dramatization). No made-up quotes presented as real quotes: the cameo explains the science in plain words.
- To add a scientist: generate a waist-up portrait in that Figma file (same prompt style: plain light warm-grey background, slight three-quarter angle, one hand raised as if explaining, based on their best-known portraits), download it to `raw/`, run `cutout.py`, check it on a coloured background, then add a row to `SCIENTISTS` in `cameo.py`.
- Placement: on the screen layer, lower half of the frame, popping in with `pop()`. Keep the bottom ~150 px clear and the plate inside the frame.
