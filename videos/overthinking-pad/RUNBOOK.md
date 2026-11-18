# The Overthinking Pad: weekly runbook

YouTube channel **The Overthinking Pad** (`@overthinkingpad`, `UCujai-eJcIEOCp7hsPmSPKA`,
`yt.py --channel overthinkingpad`). Everyday psychology for an English-speaking (US-first) audience: why our minds
loop, worry, second-guess and replay, explained with real research and drawn on a notepad.

Owner decisions (2026-11-15):
- **4 episodes a week: Monday, Tuesday, Thursday, Saturday.** Each episode = one **long video (10–12 min, 16:9)**
  and **one Short (45–60 s, 9:16) cut from it**.
- **US prime time:** long video **7:00 PM US Eastern**, its Short **8:00 PM US Eastern** the same day
  (`TZ=America/New_York`, daylight saving handled by `date`).
- **No approval needed to publish** (owner, 2026-11-18): when the videos pass every check, upload and schedule them
  at the fixed slots yourself, then send the owner the files, links, titles, descriptions and publish times as a report.
  If the videos are ready after 7 PM ET, use the next free day's
  7 PM / 8 PM slots (never two long videos in one evening).
- **Look: Notebook doodle**, built on the lemo-opuscar **Sketchnote** style (`$LIB/styles/sketchnote/`): black fineliner
  on dot-grid notepad paper, grey marker for volume, yellow marker only for the one idea that matters, hand lettering
  written stroke by stroke. Never the 3D map style.
- **Voice: VibeVoice, always** (`.claude/skills/vibevoice-voiceover/SKILL.md`, default voice Frank unless the channel
  later fixes another; keep the same voice for every episode once chosen).
- **Thumbnails: notebook look, made with the universal thumbnail skill** (owner, 2026-11-16:
  `.claude/skills/youtube-thumbnail-creator/SKILL.md`, Remotion `style: "notebook"`). Never text-only: the channel's
  notebook character (rendered from `engine/`) showing the emotion, or the study's key object, is the dominant
  subject. Generated art only from Figma `gpt-image-2.5-flare` (no text, max 3). Look: dot-grid paper, one bold doodle (a tangled thought loop, a head with a
  storm cloud, a split-path choice), black + one yellow highlight, 2–5 word heading in a heavy hand-lettered or
  Anton face. Files `thumb_long.jpg` / `thumb_short.jpg` in the episode folder plus their props JSON.

Read before writing: `CLAUDE.md`, `docs/content/scriptwriting-rules.md` (wins over anything here),
`docs/content/animation-direction-rules.md`, `docs/content/thumbnail-rules.md`, this file, `topics.md`,
`social/learning/overthinking-pad.md` and `social/youtube-schedule-log.md`.

## 1. Topic (score ≥ 65)

The channel promise: **"Why does my brain do this?" answered with real psychology, in plain words.** A good topic:
1. A feeling almost everyone recognises (replaying a conversation, dreading a text, freezing on a choice).
2. **Real research behind it**: named studies, authors and years you can cite. Prefer replicated findings; when a
   famous study failed to replicate or is disputed (ego depletion, power posing, the jam study), say so on screen.
3. A practical turn: one thing the viewer can try, framed as information, never as treatment.
4. Not already covered (schedule log, learning database). Rotate themes: social anxiety / decisions / memory /
   emotions / habits / relationships.
Take the next open topic from `topics.md` unless research finds a better one; add new finds to the queue. Use vidIQ
(keyword research, outliers) if it has credits, otherwise the YouTube Data API search. Write the topic report and score
(scriptwriting rules §2.G–H) as `TOPIC.md` in the episode folder.

## 2. Research and accuracy

- Every claim, number, study and name goes into `FACTS.md` with a source URL (the paper, its DOI, or a reputable
  summary: APA, NIH/PubMed, university pages). No invented studies, quotes, percentages or anecdotes. Hypothetical
  examples are labelled as examples ("Imagine you…").
- Not medical advice: no diagnosis, no "you have anxiety disorder". Where a topic touches mental health, end the
  description with: "This video is for education, not a substitute for professional help. If you're struggling,
  talk to a doctor or a licensed therapist. In the US you can call or text 988." Never use self-harm topics
  as clickbait.

## 3. Script: long video (10–12 min, about 1,550–1,850 words at ~155 wpm)

1. **Cold open (0:00–0:30):** start inside the feeling ("It's 2 a.m. and you're replaying something you said in
   2019."), the surprising claim, the question the video answers. No channel intro, no "in this video".
2. **4–5 chapters**, each one idea: the experience → the research (who, when, what they found, honestly sized) →
   what it means → an open question into the next chapter. A new development every 30–60 s.
3. **The turn** near the middle: the counterintuitive finding.
4. **Practical close:** 1–3 evidence-based things to try, each tied to a study.
5. **End:** payoff to the opening, one specific comment question, a short like + subscribe line.
Plain spoken English, numbers as words, "..." for pauses (VibeVoice has no tags).

## 4. Short (45–60 s, 110–150 words), cut from the long video

The single most surprising beat of the episode, rebuilt for vertical: hook in the first 1–3 s on screen and in the
first spoken line, the finding, one practical line, a loop back to the hook. Re-voice it (don't just crop the long
cut), reuse the long video's drawings, 1080×1920, bottom ~400 px clear. Description ends with the long video's link
(added after upload) and `#shorts`.

## 5. Storyboard and production

- Storyboard first (animation rules): per scene the purpose, what is drawn, in what order, where the camera goes and
  why, the SFX cue (pen scratch, page tap, marker squeak). Characters are simple doodle people who **react** to
  each other and to the idea; abstract ideas become objects (a thought loop as a spiral the character walks around,
  worry as a cloud that grows with each "what if").
- **First episode builds the channel template** in `videos/overthinking-pad/engine/` from the lemo-opuscar Sketchnote
  style (run `sh .claude/skills/lemo-opuscar/scripts/setup.sh` and `setup.sh deps`, follow `$LIB/AGENTS.md`):
  one parameterised project that takes an episode file (scenes, narration timing, drawings) and renders the 16:9 long
  video and the 9:16 Short, with a fixed palette, fonts, intro sting (≤ 2 s, after the hook) and end card. Later
  episodes reuse it: copy, fill in, render. Document how in `engine/README.md`.
- Each episode lives in `videos/overthinking-pad/<YYYY-MM-DD>-<slug>/` (TOPIC.md, FACTS.md, scripts, storyboard,
  episode file, final MP4s < 100 MB, .srt, thumbnails; not raw/ or out/).
- Narration with VibeVoice, take check per the skill (duration, transcript vs script, first second).
- Before sending: stills, contact sheets and the scene inspection (animation rules §7.3), loudness ≈ −14 LUFS, no
  black frames, captions match. Fix defects; never hide them with effects. Renderer needs ffmpeg 7+.

## 6. Report to the owner (after uploading; no waiting)

Send both MP4s and both thumbnails (SendUserFile), then: both titles, both descriptions (summary, chapters with
timestamps, sources, "Narration voiced with AI.", the mental-health line where it applies), tags, publish times in ET
and UTC, the topic score and thumbnail scores. Then stop and wait.

## 7. Upload and schedule (no approval needed)

```bash
python3 .claude/skills/youtube-channel-automation/yt.py --channel overthinkingpad upload LONG.mp4 --title ... \
  --description ... --tags ... --publish-at <7 PM ET in UTC>
... upload SHORT.mp4 ... --publish-at <8 PM ET in UTC>
yt.py --channel overthinkingpad thumbnail VIDEO_ID THUMB.jpg   # both
yt.py --channel overthinkingpad update SHORT_ID --description "...<long video link>..."
```
Log both in `social/youtube-schedule-log.md` (channel The Overthinking Pad), add rows to
`social/learning/overthinking-pad.md` and `social/thumbnails/README.md`, mark the topic done in `topics.md`, commit
and push. Never delete anything; never use Clawlink or Metricool.
