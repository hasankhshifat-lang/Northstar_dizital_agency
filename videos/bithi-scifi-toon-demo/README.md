# Scientific Bithi × Sci-Fi Sitcom Toon — 30 s demo (lemo-opuscar style test)

`bithi-scifi-toon-demo.mp4`: 1080×1920 (Facebook Reel), 24 fps, 33.9 s, −14 LUFS. Not posted; made for the owner to judge the style.
Topic: do heavy things fall faster? Mama bets the pumpkin lands first, both hit the sand together, Bithi summons Newton
through the portal, Newton explains equal acceleration over a slow-motion replay (and air resistance with a feather),
deadpan button about the apple ("মাথায় না… পাশে" — the earliest account, Stukeley 1752, has no apple on his head).
Plan and alternatives: `TREATMENT.md`.

Style: lemo-opuscar `scifi-toon` (STYLE.md kept: boiling constant-width ink, flat fills + hard shadows, big eyes,
elastic mouths, characters on twos, reaction close-ups after the absurd image, portal as the only glow, hard music cuts).
Own choices: the channel cast redrawn in the style (`chars.js`), a Dhaka rooftop (`main.js` roof()), portal in cyan + gold
(not the genre's green), Bangla subtitles with speaker pills above the Reel's bottom 400 px.

Voices: ElevenLabs eleven_v4, one take per character (generations_count 1): Mama, Bithi, Boltu fixed voices; Newton =
library voice "Eldrin" (saved in `social/bangla-science-channel/kit/cameos/voices.json`). `voice_split.py` cuts and times
them (`timeline.json`, `voices/lips.json`). Score and foley are synthesized in `mix.py`.

Build (LIB = ~/lemo-opuscar): `python voice_split.py` → `node $LIB/core/render/video.mjs <this folder> --fps 24 --size 1080x1920 --out out/video.mp4`
→ `python mix.py` → `sh $LIB/core/render/mux.sh out/video.mp4 out/mix.wav bithi-scifi-toon-demo.mp4 24 0`.
`toon.js` is the style's engine (from the lemo-opuscar scifi-toon demo, MIT), resized to 1080×1920.
