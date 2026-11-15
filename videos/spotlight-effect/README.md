# Spotlight Effect — 3-style test (psychology channel)

Three 9:16 Shorts, 11.2 s each, with the same VibeVoice narration (voice Frank) and the same beat timing. Only the
animation style changes, so the results are a clean style test.

| Style | Film | Poster |
|---|---|---|
| Marker on Paper | `marker/spotlight-marker.mp4` | `marker/poster.jpg` |
| Whiteboard Explainer | `whiteboard/spotlight-whiteboard.mp4` | `whiteboard/poster.jpg` |
| Stick-figure Explainer | `stick/spotlight-stick.mp4` | `stick/poster.jpg` |

- Subtitles: `spotlight-effect.srt` (shared; also burned into each film, above the bottom 400 px Shorts band).
- Storyboards: `social/scripts/spotlight-effect-short.md`. Treatment: `TREATMENT.md`. Sources: `FACTS.md`. Licences: `CREDITS`.
- Rebuild: `sh videos/spotlight-effect/build.sh` (needs the Lemo-Opuscar library in `~/lemo-opuscar`).
- Audio: `audio/narration.wav` is the raw VibeVoice take (12.7 s). `audio/narration_final.wav` has pauses tightened
  to ~0.32 s and is sped up 6 % (10.2 s). Each film is mastered to −14 LUFS with true peak ≤ −1 dBTP.
- QA (2026-11-15): faster-whisper small.en transcribes all three final mixes word for word; no black frames;
  contact sheets reviewed.
- Disclosure: "Narration voiced with AI." in descriptions; declare synthetic media on upload.
