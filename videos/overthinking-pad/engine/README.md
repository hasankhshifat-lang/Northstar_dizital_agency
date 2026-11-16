# The Overthinking Pad: channel engine (notebook doodle)

One parameterised project that renders every episode's **long video (16:9, 1920×1080)** and **Short (9:16,
1080×1920)** from an episode folder. Built on the lemo-opuscar **Sketchnote** style (pen, grey marker, one yellow,
hand lettering written stroke by stroke; engine code MIT) with the channel's own doodle vocabulary, camera,
subtitles, sound and end card. Never the 3D map style. Treatment and look decisions: `TREATMENT.md`.

## Files

| File | What it is |
|---|---|
| `index.html` | the page (fonts: Kalam Bold, Patrick Hand, Anton; all SIL OFL, licences in `fonts/`) |
| `lib.js` | drawing library: pen, marker, lettering, stroke timeline, and the doodles (`person`, `head`, `face`, `react`, `student`, `door`, `spotlight`, `bubble`, `bars`, `eyeIcon`, `anchor`, `mirror`, `scar`, `brush`, `stage`, `cup`, `clock`, `ball`, `controller`, `sheet`, `ribbon`, `box`, `fatArrow`, `inkArrow`, `swash`, `loop`, …) |
| `film.js` | runtime: reads `script.json`, `out/<film>/timeline.json`, `voice/<film>/out/words.json`, `episode.js`; camera keys, culling, subtitles (paper slip; 9:16 keeps the bottom 400 px clear), page contract for the lemo-opuscar render tools |
| `tools/timeline.mjs` | scene times from the real voice durations; subtitle cues; YouTube chapter list |
| `voice/vv_lines.py` | VibeVoice-Realtime-0.5B, one wav per line, **voice Frank** (the channel voice; keep it) |
| `mix.py` | narration + pen foley from the strokes (kept ~22 dB under the voice, owner 2026-11-16) + small plucked score (marimba/kalimba/pizzicato), ducked under the voice |
| `tools/remux_audio.sh` | puts the final mix on the finished video (stream copy): two-pass loudnorm −14 LUFS, true peak ≤ −1.5 dBTP |
| `build.sh` | `prep` · `voice` · `still` · `render` · `finish` · `all` |
| `glyphs.json` | glyph skeletons for stroke-by-stroke lettering (from the Sketchnote demo, OFL fonts) |

## Making an episode

1. `D=$(TZ=America/New_York date +%F)`; make `videos/overthinking-pad/$D-<slug>/` with `TOPIC.md`, `FACTS.md`.
2. **`script.json`**: `{ "long": [ {id, say} | {id, type:"sting"} | {id, type:"chapter", num, title} | {id, type:"end"} ], "short": [ {id, say} ] }`.
   Optional per line: `lead`, `tail`, `min` (seconds). Numbers as words, "..." for pauses (VibeVoice has no tags).
3. **`episode.js`**: one entry per script id: `block [x, y, w, h]` on the sheet, `purpose`, `shot` (camera move and
   why), `sfx`, and `draw(S, L)`. Copy the previous episode's file and redraw; the shared parts at its top
   (`headRow`, `tshirt`, `tag`, `numDot`, `chapter`, the row/column grid) are reusable. Timing inside a scene:
   `S.at('word', nth)` (when that word is spoken, from the speech check), `S.f(0..1)`, `S.t0`, `S.end`.
   Camera: automatic fit + slow push per block; `noAutoCam: true` + `S.cam(t, x, y, zoom, seconds, ease)` for a
   directed move (reveal, dive, callback). Chapters whip (`ease: 'q'`).
   Characters react with `L.react(person, t, {kind, look})` (the pen redraws the face). Hand contact: draw the prop
   at the hand position the `person()` call returns (`P.hand`), never floating.
4. `sh videos/overthinking-pad/engine/build.sh <episode> prep`, then `voice` (check `voice/*/asr.txt`: only number
   formatting differences like "2000" vs "two thousand" are acceptable), then stills:
   `sh build.sh <ep> still long "5 60 120"`, fix, then `render` and `finish`.
5. Outputs in the episode folder: `<slug>_long.mp4`, `<slug>_short.mp4` (< 100 MB), `.srt` files,
   `out/<film>/chapters.txt` (description chapters), `out/sheet_*.jpg` contact sheets, `out/<film>/readcheck.txt`.
   `out/`, `voice/*/out/` and the copied engine files are not committed (see `.gitignore`).

Needs: ffmpeg 7+ (the container has 8.x), Node, the lemo-opuscar library at `$LIB` (`setup.sh deps`, `deps voice`
for the speech check), VibeVoice at `/opt/VibeVoice` (`.claude/skills/vibevoice-voiceover/scripts/install.sh`).
