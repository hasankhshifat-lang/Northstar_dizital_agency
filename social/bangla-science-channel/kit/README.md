# Scientific Bithi production kit

This is everything needed to make a Short with মন্টু মামা, বিথী and বল্টু from a fresh checkout. `kit/` stands in for the old working scratchpad, so scripts take the kit folder as their first argument (`K`).

| Path | What it is |
|---|---|
| `chars/chars3.json` | Character rigs (SVG with arm, head, mouth, eye and brow groups) |
| `p5/engine.html` | Puppet engine (Pilot 5) |
| `s3/engine.html` | Same engine plus two speakers on one line (`"also"`). **Use this one for new Shorts.** Both engines draw arms past the character box (`svg { overflow: visible }`). |
| `p5/art.py` | Shared art helpers: `svg`, `T` (text), `tag`, `banner`, `wheel`, `board_title`, pond props |
| `s3/art3.py` | Courtyard background, lojjaboti plant, hinge board, goat, insect, night card (an example of story-specific art) |
| `s3/build_s3.py`, `p5/build_p5.py` | Shot lists timed to a voice `timeline.json`. Copy one for each new Short. |
| `s3/sound_s3.py` | Synth SFX + folk music bed (no samples). Edit the event list `E` and the ambience ranges. |
| `anim/mouth_env.py` | `python3 mouth_env.py vo.wav mouth.json` builds the lip-sync string at 24 fps |
| `anim/make_video.py` | Parallel frame render + encode. Run it from `kit/anim`. `--range A B` re-renders only frames A–B. |
| `anim/capture.js` | Keyframe stills: `node capture.js page.html x outdir 1 1 0.3 "t1,t2,..."` |
| `p5/fonts.css`, `fonts/` | Baloo Da 2, Hind Siliguri and Atma (Bangla), linked by relative path |
| `brand/` | Facebook cover/profile generator |

## Making a new Short (45–60 s, about 90–110 Bangla words)
1. **Script:** use `../shorts/short-NN-*.md` if it exists, otherwise draft with `../tools/freellm.py draft`, then fix it by hand. Check every fact in two steps (the NCTB textbook, then a second source). The characters' roles: মামা gets it funny-wrong, বল্টু asks, বিথী explains in correct scientific language, and the end has a puzzle for the comments.
2. **Voice:** ElevenLabs `eleven_v4`, one take per character with lines separated by `[long pause]`.
   - Voices: Mama `MNuISDUw2Kqij2hI0QHV` ("[deep voice]"), Bithi `nUarI71Lei0IFt1ybDm1`, Boltu `N6PAsaEqAXM8EIxJn9g3` ("[childlike voice] [high voice]").
   - Split the takes on silences (ffmpeg silencedetect −38 dB / 0.55 s) and assemble with about 0.3 s gaps.
   - Write `timeline.json` (`lines[i] = {i, speaker, also?, start, end, text}`; the voice starts at 1.0 s). See `../voiceover/short-03/` (`split_check.py`).
3. **Art + shots:** copy `s3/` into a new folder (for example `s4/`).
   - Make the story props in `art4.py` (import `art` like `art3.py` does) and the shots in `build_s4.py`. Use `cam()`, which never shows past the 1080×1920 background, plus `pop()` and `prop()`.
   - Positions: feet line F=1820; head heights mama 845, bithi 850, boltu 700 (times scale).
   - Rules: text stays inside the frame and is explanation only, in scientific language; no border designs; no needless hand raising; heads turn toward the speaker; the end card has the সাইন্টিফিক বিথী banner, the wheel and three name plates.
4. **Check keyframes** with `capture.js` and look at them before the full render. Fix only what's wrong.
5. **Sound:** adapt `sound_s3.py` with `DUR`, events and ambience ranges, then mix:
   `ffmpeg -i vo.wav -i music.wav -i sfx.wav -filter_complex "[0]volume=1.6,apad=whole_dur=DUR,asplit=2[vk][vm];[1]volume=0.13[mu];[mu][vk]sidechaincompress=threshold=0.03:ratio=10:attack=15:release=450[duck];[2]volume=0.38[fx];[vm][duck][fx]amix=inputs=3:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[out]" -map "[out]" -ar 48000 mix.wav`
6. **Render:** `cd kit/anim && python3 make_video.py --html ../s4/s4.html --frames ../s4/frames --audio ../s4/mix.wav --out ../s4/out.mp4 --total <DUR*24> --workers 4`.
   - Spot-check frames from the mp4. For a fix, re-render only the affected frames with `--range`.
7. **Save:** put the mp4 and the `s4/` code in `../episodes/short-NN/`, and the voice in `../voiceover/short-NN/`. Don't commit `frames/`, `.wav` files or `lines/` splits.

## Walking
Any character can walk: add `"walk": {"name": [[t0, x0], [t1, x1], ...]}` to a shot. Between two keys the character walks from x0 to x1 with eased start and stop. The step is front-view, the feet never cross, the body bobs and shifts weight, the arms swing and the head looks where they're going. Keep walks slow, about 100–130 px per second at scale 0.8.

## Scientist characters
When the science in a Short was discovered by a famous scientist, that scientist can appear as a full rigged character (jc_bose, newton, einstein, marie_curie in `chars/scientists.json`). They walk in, talk and explain like the cast. See `cameos/README.md` for rules, voices and how to add new scientists.
