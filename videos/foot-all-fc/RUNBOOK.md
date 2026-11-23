# Foot All FC runbook: 3 funny caricature Shorts a day (owner, 2026-11-23)

Channel: Foot All FC (`yt.py --channel footallfc`, UC1qGYw3aAOeADXrOu1X4HrQ). This runbook replaces the Comic History Cartoon / lemo-opuscar
pipeline of the daily scheduled task wherever they differ (CLAUDE.md, "Foot All FC" section).

## 0. Every run
1. `git fetch origin main && git checkout -B main origin/main`. Read CLAUDE.md, `docs/content/scriptwriting-rules.md`,
   `docs/content/animation-direction-rules.md`, the thumbnail skill and `social/learning/foot-all-fc.md`.
2. `yt.py --channel footallfc whoami` must return Foot All FC; stop and report on any error.
3. `yt.py --channel footallfc videos --max 30` + `social/youtube-schedule-log.md`: which of today's slots (**12:00 PM, 7:00 PM, 9:00 PM ET**)
   are free and at least 1 h away. A passed slot moves to tomorrow. Never two videos in one slot; never repeat a story.
4. Produce one Short per free slot (normally three). Publish each as soon as it passes the checks (standing approval).

## 1. Topic: funny and true
- Score with the scriptwriting rules (2.G, 65+). Demand: YouTube Data API search medians (all time / last 12 months), vidIQ only with credits.
- Funny angles that work: absurd overkill (Higuita), cheeky genius (Panenka), irony (offside all along), chaos off the pitch, unexpected heroes,
  rule loopholes, famous rivalries' light moments. Avoid: tragedies, injuries, racism/abuse incidents, anything private, mocking looks.
- Candidates to check next (verify every fact first): Balotelli "Why always me?" + the fireworks (2011); Jens Lehmann's penalty note (2006, low demand);
  Ronaldinho's tricks; Zlatan's moments; keepers scoring goals; famous own goals; mascots and pitch invaders (careful); goal celebrations gone wrong.
- Fact sheet with sources for every name, date, score and quote. Jokes never invent facts; quotes only if documented and attributed; label disputes.

## 2. Script (45–60 s)
Hook in 0–3 s with a comic contrast; Shorts timing (rules 14); comic beats: setup → escalation → punchline → twist → comment question.
Numbers as words. Save `social/scripts/<working-title>.md` (report, fact sheet, script, take check, storyboard, inspection, checklists).

## 3. Voice: VibeVoice Frank
`bash .claude/skills/vibevoice-voiceover/scripts/voiceover.sh vo/script.txt vo/raw.wav Frank`, trim leading silence to ~0.1 s →
`vo/narration.wav`, `python tools/words.py` (Groq whisper word timings + diff). Regenerate on missing/extra words; foreign names may come back as
sound-alikes: re-check that clip with a prompted transcription (see the Panenka script file). Over 60 s: tighten the script.

## 4. Film: Night Match Toon (own engine)
- Copy `videos/higuita-1995-short/` (caricatures, side camera, gags) or `videos/panenka-1976-short/` (shoot-out tracker, flashback) to
  `videos/<name>-short/`; keep the engine part of `index.html` (camera `P`/`camTrack`, `sky`, `pitch`, `goal`, `player`/`wplayer`, `ball`,
  `popText`, `nameTag`, `captions`, scorebug); replace `KIT`, `T`, `CAPS`, the scene functions, `SCENES` and the sound cues (`ev`, incl. `mus` sections).
  Style guide: `videos/panenka-1976-short/STYLE.md`.
- **Caricatures:** one `KIT` entry per real player: `skin`/`skinD`, `hair` + `style` (`mane`, `mop`, `short`, `curly`, `parted`, `bald`), `stache`,
  `head` (1.1–1.35), `nose`, `brow`/`browW`; generic kit colours (no crests, sponsors, numbers unless verified). Funny expressions: `grin`, `cocky`,
  `wide`, `shock`, `sad`, `focus`, `happy`; `sweat: true`; `look` to aim the eyes. Never photos or photo-realistic faces.
- Storyboard first (rules 7.2), then stills: `node stills.js` style contact sheets (render `window.render(t)` at chosen seconds) and fix framing,
  covered faces, broken contact (hands/feet points: `hands`, `feet` options), unreadable poses.
- Build: `sh build.sh` (events → frames → `mix.py` synth score + foley → mux at -14 LUFS → `.srt` → readcheck → poster).
- Checks before upload: readcheck (fix short labels by holding gags longer; moving counters `pass: true`), loudness ≈ -14 LUFS, no black frames,
  final-mix transcript matches, contact-sheet review (rules 7.3). Never upload a broken film. Keep files < 100 MB.

## 5. Thumbnail (9:16, universal skill)
- Art: `index.html?thumb=SECONDS` renders a clean frame (no captions or graphics) at the funniest key moment with the caricature as the
  dominant subject; screenshot 1080×1920 → `social/thumbnails/assets/<name>/<name>-art.jpg` + `SOURCES.md`.
- Remotion: props like `social/thumbnails/higuita-1995-short_9x16.props.json` (style `toon`, 2–5 word headline that doesn't repeat the title,
  tag), `node render.mjs props.json social/thumbnails/<name>_9x16.jpg <art>`; check `out/<name>_9x16_check.png`; three concepts, score ≥ 70.

## 6. Upload, schedule, log
- `yt.py --channel footallfc upload FILE --title "... #shorts" --description "story line + comment question + 'Independent fan channel, not
  affiliated with any club, league or broadcaster. No match footage is used. Characters are cartoon caricatures. Narration voiced with AI.' +
  hashtags" --tags "football,soccer,football stories,funny football,..." --category 17 --publish-at <UTC of the slot>`; confirm `aiDisclosed: true`
  (else `yt.py update`); `yt.py thumbnail VIDEO_ID THUMB`.
- Log in `social/youtube-schedule-log.md`, `social/thumbnails/README.md`, a row in `social/learning/foot-all-fc.md`; commit and push to main.
- Report: titles, IDs, slots (ET + UTC), AI disclosure, scores, thumbnails, defects fixed, blockers with exact errors; push notification.

## 7. Learning
Fill metrics for videos 2–3+ days old (real numbers only). Compare the new style against the Comic History Shorts and the three slots;
one variable at a time once the new format settles.
