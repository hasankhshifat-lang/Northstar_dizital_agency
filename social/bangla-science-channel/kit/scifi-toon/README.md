# Sci-Fi Sitcom Toon: the default look for Scientific Bithi Shorts (owner, 2026-11-16)

From 2026-11-16 every Facebook Short on this page is made in the lemo-opuscar **Sci-Fi Sitcom Toon** template
(`~/lemo-opuscar/styles/scifi-toon/STYLE.md`; get the library with the lemo-opuscar skill's `setup.sh`).
This replaces the old puppet engine (`s3/`, `p5/` …) and the "Blender 3D plate" rule for this channel.
Approved reference: `../../../../videos/bithi-scifi-toon-demo/bithi-scifi-toon-demo.mp4` (Newton / falling bodies).

## What stays the same
- The cast and their designs: মন্টু মামা (yellow kurta, red-check gamchha, checked lungi, moustache), বিথী (glasses,
  plaits, headband, white shirt, blue sash + red badge, navy skirt), বল্টু (spiky hair, glasses, yellow-red stripes,
  khaki shorts). Scientists keep their look references (`../cameos/`), e.g. Newton = grey wig, brown coat, cravat.
- Bangladeshi settings, a **new one every Short** (rooftop used in the demo; ideas: tea stall, village courtyard, school lab,
  river ghat, rickshaw stand, bazaar, rainy veranda, rice field, railway platform). Keep the register in `../env3d/README.md`.
- Story rules: scriptwriting + animation-direction rulebooks, Mama funny-wrong → Boltu asks → a visual demonstration that
  is scientifically correct, Bithi explains (or summons a scientist with the full summon pattern, at most twice a week),
  puzzle for the comments when it fits, two-step fact check, storyboard first, scene inspection before approval.
- Voices: ElevenLabs eleven_v4 with the fixed voices (Mama `MNuISDUw2Kqij2hI0QHV`, Bithi `nUarI71Lei0IFt1ybDm1`,
  Boltu `N6PAsaEqAXM8EIxJn9g3`; scientists in `../cameos/voices.json`), one call per character, generations_count 1.
- Approval before upload, the 20:00 Dhaka slot, thumbnails (Figma, style B) and the Facebook steps are unchanged.

## What the template adds (keep all of STYLE.md)
- Thick constant-width ink that boils (3 drawings at 12 fps), flat fills + one hard shadow per form, big white eyes with
  tiny pupils, elastic mouths with lip-sync from the voice envelope; characters on twos, camera on ones.
- Comedy grammar: duo contrast, hard cut to a reaction close-up after every absurd image, a cold pause with the music cut
  before a deadpan button, callbacks. Family-friendly (NCTB class 6–10 audience).
- The scientist portal is the only glowing thing: cyan ring + gold sparks (never acid green).
- Synthesized score (theremin lead, analog bass, square arpeggio, drum machine; a dotara-like pluck on the end card);
  hard music cuts on the reveal and the cold pause; synthesized foley. Master −14 LUFS.
- Burned-in Bangla subtitles (Baloo Da 2 ExtraBold, white with a black outline) with a speaker pill, kept above the
  Reel's bottom ~400 px; on-screen labels are short scientific explanations only.
- 9:16, 1080×1920, 45–60 s for a normal Short (the demo was a 30 s test).

## How to make a Short with it
1. Copy this folder to `../../episodes/short-NN/toon/`. `toon.js` (engine) and `chars.js` (cast + props) are shared;
   add new props/scientists to `chars.js` in the same construction (noodle limbs, `shape()` with `fill`/`shade`).
2. Voices → `voice_split.py` (edit `ORDER`, `TEXT`, `GAP`, `TEMPO`) → `timeline.json` + `voices/lips.json`.
   Check every line with Whisper (Groq `whisper-large-v3`) against the script.
3. Write `cues.json` (shot list + key times) and the shots in `main.js` (one function per shot, `cam()` + world + cast).
   Replace `roof()` with the new setting.
4. Stills: `cd ~/lemo-opuscar && node core/render/still.mjs <folder> <t…> --size 1080x1920`; look before rendering.
5. Render: `node core/render/video.mjs <folder> --fps 24 --workers 4 --size 1080x1920 --out <folder>/out/video.mp4`,
   then `python mix.py` and `sh core/render/mux.sh <folder>/out/video.mp4 <folder>/out/mix.wav <short>.mp4 24 0`.
6. Commit the source, `timeline.json`, `cues.json`, `voices/lips.json`, the takes and the final mp4 (not `out/` or wavs).
