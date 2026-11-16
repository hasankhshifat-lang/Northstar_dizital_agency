# Treatment: leicester-5000-short (Short, 9:16)

Style: Comic History Cartoon (`comic-history`), built exactly like `videos/barca-remontada-short` (same engine helpers, puppets,
page layout, caption band, footer). 1080×1920, 24 fps. English narration (VibeVoice, Frank); captions burned in and exported as `.srt`.
Topic report, fact sheet, script, storyboard and scene inspection: see the script file named in CREDITS.

Source layout: `index.html` is the film (timeline `T` from the voice's word timings in `vo/words.json`, scenes, captions,
sound events; `?brand=thumb` renders the thumbnail art). `mix.py` is the sound (foley on the page's events, synthesized beds,
sampled score). `tools/recolor_kit.py` makes the plain-colour kits; `tools/words.py` runs the VibeVoice take check
(Groq whisper-large-v3 word timestamps + word-by-word diff against `vo/script.txt`). `sh build.sh` renders everything.
