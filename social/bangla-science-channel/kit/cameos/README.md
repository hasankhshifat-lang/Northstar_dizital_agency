# Scientist cameos

**Since 2026-11-09 the scientists are full rigged characters** (`../chars/scientists.json`, made by `../chars/gen_sci.py`). They use the same rig and drawing style as মামা, বিথী and বল্টু, so they walk, talk (lip-sync), blink, gesture and turn their heads in the engine like the cast. Use them by key in a shot's `chars`, e.g. `"jc_bose": [800, 1820, .82]`, and make them walk in with `"walk": {"jc_bose": [[t0, 1260], [t1, 800]]}`. Head height above the feet is about 830 × scale. `scientists_sheet.png` shows them next to the cast. The test clip is `../../episodes/tests/scientist_portal_test.mp4`, built by `build_scientist_test.py`.

The Figma portraits below are now the **look reference** for drawing each scientist (hair, face, clothes). The `cameo()` photo cut-out prop is kept only as an option; normally use the character.

Hyperrealistic portraits of famous scientists, generated in Figma (file "Scientific Bithi — Scientist Cameos", https://www.figma.com/design/p7WBHQcFJpfyTNbWtS8Nsd). They appear in a Short when the science in it was discovered by that scientist, who then explains it in a few lines.

| Key | Scientist | Use for |
|---|---|---|
| `jc_bose` | জগদীশ চন্দ্র বসু | plant responses (লজ্জাবতী, plants react to stimuli), radio/microwaves |
| `newton` | আইজ্যাক নিউটন | laws of motion, gravity, splitting white light into colours |
| `einstein` | আলবার্ট আইনস্টাইন | relativity, the photoelectric effect |
| `marie_curie` | মেরি কুরি | radioactivity |
| `archimedes` | আর্কিমিডিস | buoyancy, floating and sinking, levers |

Files: `raw/<key>.png` is the Figma output; `<key>.png` is the transparent cut-out (`python3 cutout.py raw/x.png x.png 24`); `cameo.py` has the names and life years (`label()` makes the on-screen label) and the optional portrait prop. `preview_jc_bose.jpg` shows how it looks in a scene.

## When and how a scientist appears (owner, 2026-11-09)
- **At most twice a week.** Count the scientist Shorts in the last 7 days from the "Scientist" column of `../../shorts/queue.md` before using one. Most Shorts have no scientist.
- **The story beat (the summon):** বিথী herself doesn't know the science behind it. She says so, then calls the scientist by name and asks for help, in this pattern:
  > "এটা তো আমি জানি না… কিন্তু আমি জানি কে জানে! **জগদীশ চন্দ্র বসু স্যার!** আপনি কি আমাদের এটা শিখিয়ে দেবেন? আমাদের আপনার সাহায্য দরকার… প্লিজ, আমাদের জন্য একটু নেমে আসুন!"
  Use "স্যার" for men and "ম্যাডাম" for women (e.g. "মেরি কুরি ম্যাডাম!"). Vary the wording a little each time but keep the parts: "I don't know, but I know who knows", the name, "will you teach us", "we need your help", "please come down for us". About 6–8 s.
- **The scientist arrives through a sci-fi portal** (`portal.py`, sounds from `portal_sfx.py`):
  1. A glowing blue energy ring with a swirling core and gold sparks opens beside the cast. Use `portal_props(t_open, t_close, x, y, 0.8)` with z below the characters.
  2. The scientist materialises inside it, fading in with a cyan glow (`"appear": {"key": [t0, t0+0.7]}`).
  3. They step out (`"walk"` keys from the portal's x to their spot), and the portal snaps shut behind them.
  4. They explain the key point in 1–2 short, correct lines.
  Keep the whole portal inside the frame (centre about x 790, y 1450 at size 0.8 in the wide courtyard shot). The test clip is `../../episodes/tests/scientist_portal_test.mp4`.
- Then the cast reacts. The usual ending (puzzle, end card) follows.
- Use it only when the topic really came from that scientist's discovery or work.

## Rules
- Only for discoveries that really belong to that scientist (check the NCTB book and a second source). At most one cameo per Short, about 5–10 s, and the explanation stays short and correct.
- Long-dead historical scientists only. Never make cameos of living people.
- The cameo's voice is a fixed ElevenLabs library voice that fits the person's age and sex, never a clone of the real voice. Save the voice chosen for each scientist in `voices.json` and always reuse it.
- **Label (owner, 2026-11-09):** when the scientist appears, show a small label with ONLY their name and birth and death years, e.g. "জগদীশ চন্দ্র বসু (১৮৫৮–১৯৩৭)" or "আর্কিমিডিস (খ্রিস্টপূর্ব ২৮৭–২১২)". Use `label(key)` from `cameo.py`. Never add "নাট্যরূপ" or any similar word. No made-up quotes presented as real quotes: the scientist explains the science in plain words.
- To add a scientist: add a function to `../chars/gen_sci.py` (copy the nearest one and change the hair, facial hair, skin and clothes to match their best-known portraits), regenerate `scientists.json`, check it on a sheet next to the cast, and pick a fixed voice in `voices.json`. A Figma portrait helps as a reference: generate a waist-up portrait in that Figma file (same prompt style: plain light warm-grey background, slight three-quarter angle, one hand raised as if explaining, based on their best-known portraits), download it to `raw/`, run `cutout.py`, check it on a coloured background, then add a row to `SCIENTISTS` in `cameo.py`.
- Placement: on the screen layer, lower half of the frame, popping in with `pop()`. Keep the bottom ~150 px clear and the plate inside the frame.
