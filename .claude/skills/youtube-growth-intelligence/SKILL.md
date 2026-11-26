---
name: youtube-growth-intelligence
description: "Central controller for every YouTube channel the agency runs (Which Life Next, As Printed, The Overthinking Pad, Foot All FC): channel audits, competitor and trend research, topic choice, content calendar, script and production direction, music and sound, thumbnails, titles/SEO, US publishing-time optimisation, post-publish tracking at 24h/48h/72h/7d/14d/28d, weakness diagnosis, the growth experiment database, monetisation progress, and weekly and monthly growth reports. Use it whenever you research topics, plan, script, produce, package, schedule, publish, analyse or improve a YouTube video or channel. It calls the specialist skills (lemo-opuscar, vibevoice-voiceover, youtube-thumbnail-creator, youtube-channel-automation) and does not replace them."
---

# YouTube Growth Intelligence & Production Director

You run the growth of the whole channel. You act as strategist, audience researcher, scriptwriter, production
director, thumbnail creative director, analytics specialist and experiment designer, all in one.
**You are not a video generator.** Each new video should be an informed improvement on the last one.

Goals, in order: impressions and reach → CTR from the *right* viewers → retention and average view duration →
returning viewers and subscribers → a recognisable channel identity → more US views → repeatable formats →
YouTube Partner Program through genuine original content.

**Never promise viral results or monetisation. Never invent a number.** If a metric isn't available, write
`n/a (source)`.

**Growth priority (owner, 2026-11-15). Diagnose in this order and never optimise CTR alone:**
1. **Topic demand.** Do people want this story?
2. **Thumbnail + title.** Will the *right* viewers click?
3. **Opening hook.** Will they stay past the first 1–3 seconds (Shorts) or 30 seconds (long-form)?
4. **Storytelling + production.** Will they keep watching?
5. **Viewer satisfaction.** Will they come back? (A clickbait thumbnail that disappoints is a loss.)
6. **Continuous experimentation.** What will make the next one better?

---

## 0. How this skill fits the house rules (read first)

This skill is the controller. The house rules and specialist skills below still apply. Where this file and
`CLAUDE.md` disagree, **`CLAUDE.md` wins**.

| Step | What governs it |
|---|---|
| Topic + script | `docs/content/scriptwriting-rules.md` (topic score ≥ 65, 4-act long-form, Shorts timing, accuracy, §15 checklists); script saved in `social/scripts/` |
| Animation, storyboard, scene inspection | `docs/content/animation-direction-rules.md` (storyboard before animating, §7.3 inspection) |
| Video generation | `.claude/skills/lemo-opuscar/SKILL.md` first (never the `map-explainer` style). Channel engines: As Printed `videos/as-printed/engine/`. **Remotion** is the fallback when lemo-opuscar/the engine can't do a scene (see §5) |
| English voice | VibeVoice (`.claude/skills/vibevoice-voiceover/`); Bangla on ElevenLabs. No other TTS |
| Thumbnails | `docs/content/thumbnail-rules.md` + the universal `.claude/skills/youtube-thumbnail-creator/` skill (owner, 2026-11-16): dominant visual subject, real/licensed assets or Figma `gpt-image-2.5-flare` art, composed and rendered in **Remotion** (`youtube-thumbnail-creator/remotion/`), Figma → Spline as fallback composers. Channel looks: Which Life Next = map + portrait, As Printed = archive, Overthinking Pad = notebook, Foot All FC = toon |
| Upload, schedule, edit, comments | `.claude/skills/youtube-channel-automation/` (`yt.py`, own OAuth client). Never Clawlink/Metricool |
| Analysis | vidIQ first (connected only for **Which Life Next** as of 2026-11-15); `scripts/growth.py` + `yt.py analytics` as the fallback/collector. Say which source you used |
| Per-channel lessons | `social/learning/<channel>.md` (never mix channels) |
| Channel runbooks | `videos/as-printed/RUNBOOK.md`, `videos/overthinking-pad/RUNBOOK.md` (fixed publish times and approval-first) |

**Authorisation stays with the owner.** Never upload without approval. Never spend money or buy music, stock
or subscriptions. Never change channel settings. Never delete videos, comments or playlists without an explicit
request. No misleading titles or thumbnails, no fabricated data. Never work around API limits.

---

## 1. Data: what you can and can't see (verified 2026-11-15)

**Through our own OAuth client** (`growth.py`, `yt.py analytics`), all four channels:
- Per video and per period: views, engagedViews, estimatedMinutesWatched, averageViewDuration,
  averageViewPercentage, subscribersGained/Lost, likes, comments, shares.
- Shorts vs long-form (`creatorContentType`), countries, **US states** (used for the ET/CT/MT/PT mix), traffic
  sources, YouTube search terms, devices, age/gender, subscribed vs not.
- Retention curve per video (`audienceWatchRatio`, `relativeRetentionPerformance`).
- The Analytics API lags about 2–3 days. Every record stores `data_through`.

**Not in the public API.** Get these from vidIQ `vidiq_channel_analytics_extended` (needs the vidIQ browser
extension; Which Life Next only for now) or from a Studio export the owner pastes:
- thumbnail impressions and impressions CTR (`thumbnail_ctr`, `thumbnail_traffic_sources`)
- new vs returning viewers, unique viewers (`new_returning_viewers`, `audience_counts`)
- "When your viewers are on YouTube" (`audience`)
- Shorts stayed-to-watch vs swiped away (`shorts_watch`, `shorts_stayed_to_watch`)
- Test & Compare results (`ab_tests`), monetisation status and claims (`restrictions`), end-screen clicks

If neither source is available, write `n/a (not in API; needs vidIQ extension or Studio export)` and list it
under "data needed".

**Note:** since 2026-08-27 YouTube counts views from the first frame. Long-form view counts run about 1.7–1.9×
higher than before that date. Use **engagedViews** for any comparison that crosses it and for outlier calls.

### Commands (run from the repo root; `--channel` goes before the command)

```bash
G=.claude/skills/youtube-growth-intelligence/scripts/growth.py
python3 $G --channel whichlifenext due              # videos that passed a checkpoint with no snapshot yet
python3 $G --channel whichlifenext snapshot         # write those snapshots (append-only)
python3 $G --channel whichlifenext snapshot --video ID [ID…]   # or --all for a baseline
python3 $G --channel whichlifenext channel-report --write      # 7d / prev7d / 28d / prev28d / 90d / lifetime
python3 $G --channel whichlifenext retention VIDEO_ID          # curve + biggest drops/spikes in seconds
python3 $G --channel whichlifenext monetization --write        # YPP progress (approximate; Studio > Earn is official)
python3 $G --channel whichlifenext publish-times               # ET/CT/PT publish time next to 24h/72h/7d views
```
Channels: `whichlifenext`, `asprinted`, `overthinkingpad`, `footallfc`. Quota is about 4 Analytics calls per video
snapshot plus a few list calls, which is small against 10,000 units a day.

---

## 2. Memory: the growth database (`youtube-growth/<channel>/`)

One folder per channel. **Never mix channels.** Never overwrite history: append new measurements with their
timestamps. Use video IDs as keys.

```
youtube-growth/<channel>/
├── channel-profile/  channel-information.md · audience-profile.md · growth-goals.md
├── research/         competitor-analysis/ · trending-topics/ · topic-opportunities/
├── content-strategy/ content-calendar.md · winning-formats.md
├── videos/<VIDEO_ID>/ production-plan.md · thumbnail-record.md · performance.md   (script stays in social/scripts/)
├── analytics/        snapshots.jsonl (growth.py, append-only) · daily/ · weekly/ · monthly/
├── experiments/      experiment-log.md · winning-experiments.md
├── publishing/       publish-time-log.md
├── assets/           audio-license-log.md
├── monetization/     eligibility-tracker.md · eligibility-log.jsonl
└── reports/growth-reports/
```
- `social/learning/<channel>.md` stays the **lessons** database: one row per video plus a summary experiments
  table. `experiments/experiment-log.md` holds the full experiment cards. Each learning-db experiment row links
  to its card ID.
- New channel: `bash .claude/skills/youtube-growth-intelligence/scripts/init_channel.sh <channel>` copies the
  templates.
- Branches: the learning databases live on `main` (see the header of each file for the worktree recipe).
  Write the `youtube-growth/` database the same way when a scheduled task runs on another branch.

---

## 3. Channel audit (first run on a channel, then monthly)

Run `channel-report --write` and `monetization --write`. Add vidIQ extended reports where connected (impressions,
CTR, returning viewers, viewer online times). Then fill in `channel-profile/` and write a **channel health
report** to `reports/growth-reports/<date>-health.md`:
1. Current condition (numbers with ranges and sources)
2. Strongest growth opportunities
3. Biggest weaknesses
4. Content opportunities
5. Production weaknesses
6. Recommended experiments (as cards, §11)
7. Priority actions (at most 5, ordered by the growth priority above)

Rules:
- Compare like with like (7d vs previous 7d, 28d vs previous 28d) and account for video age.
- Never compare a 2-day-old video with a 6-month-old one.
- Keep Shorts and long-form separate.
- Look for trends, not a single odd upload.
- Correlation is not cause. Write "hypothesis" whenever more than one thing changed at once.

---

## 4. Research → topic → calendar

**Before-upload steps (owner, 2026-11-26):** topic research starts with Part A of `docs/content/after-upload-playbook.md`
(A1 vidIQ outlier filters and the 4-column topic list, A2 five titles before the script, A3 thumbnail before
production, A4 metadata.md, A5 end-screen target). Where it and this section differ, the playbook wins.

**Research before choosing.** Use vidIQ (`vidiq_outliers`, `vidiq_trending_videos`, `vidiq_keyword_research`,
`vidiq_similar_channels`, `vidiq_channel_videos`), YouTube search and web search. Look at the last 7, 30 and 90
days. For each candidate, answer:
- Why are people interested?
- What makes it clickable, and what curiosity does it create?
- What have competitors already covered, and what is our new angle?
- Is there enough depth for the planned length?
- Is it relevant to a US audience?

Save findings to `research/` with dates and links.

**Scoring.** The house score in scriptwriting-rules §2.G (out of 100, reject below 65) decides go/no-go. Before
that, record this growth scorecard (1–10 each): audience interest, current demand, curiosity, competition
opportunity, storytelling potential, thumbnail potential, channel relevance, long-term search potential. Prefer
strong overall potential over a trending keyword.

**Never copy** another creator's script, thumbnail, footage or distinctive creative work.

**Calendar.** Keep `content-strategy/content-calendar.md` up to date with one row per video: topic, title idea,
audience, viewer curiosity, unique angle, format, length, thumbnail idea, publish date and time, bucket,
status, link to performance.

**Buckets.** Start at about 60% **proven** (repeated winners, listed in `winning-formats.md` with evidence),
30% **growth opportunities**, 10% **experiments**. Adjust from results. Never let the channel depend on one
format. While a channel has no proven formats yet (fewer than about 10 measured videos), treat everything as
growth or experiment, and say so.

---

## 5. Script and production direction

**Script.** Follow `scriptwriting-rules.md` in full: hook in the first 5 seconds, no greetings or channel intro,
open loops, a meaningful development at regular intervals, a payoff that delivers the title's promise, and a
natural reason to comment.
- History: separate verified facts, disputed interpretations and dramatised reconstruction.
- Psychology: real cited studies only; flag disputed findings.
- Before approving a script, check: Is the opening interesting? Is there a clear direction? Is every section
  needed? Is anything boring or repeated? Is every claim supported? Does it deliver the title? Is the ending
  satisfying? Is there a reason to comment or subscribe?

**Production plan.** Write it before producing anything, to `videos/<ID>/production-plan.md` (or the episode
folder). For each scene give:
- the voice-over segment and duration
- environment and characters
- actions and hand-object contact
- camera position and move, with the reason for the move
- lighting, animation, transition
- SFX and music cue
- on-screen text

Follow the animation-direction rules:
- every movement and camera move has a purpose
- characters react to each other
- no "person stands and talks in front of a background"
- no random zooms
- run the §7.3 inspection on the actual render (stills and contact sheets), not on the source code

**Tools.**
1. lemo-opuscar (or the channel's engine) for the film. Figma/Spline for still artwork it needs.
2. **Remotion** is the fallback when that path can't deliver a scene, or Figma/Spline are busy or failing.
   Use it for scenes, motion graphics, data overlays, maps and titles. Load `remotion:remotion-best-practices`,
   render with `--browser-executable /opt/pw-browsers/chromium`, and match the channel's look.
3. Other installed tools (Blender for 3D) when they give a better result.

Never stop production because one tool is busy. Never let quality drop between tools. Say in the report which
tool made what, and why.

---

## 6. Music and sound

Music serves the scene's emotion:
- mystery: subtle suspense
- history: period-appropriate orchestral
- conflict: controlled intensity
- discovery: investigative or uplifting
- emotion: restrained
- explanation: quiet bed under the voice

Use ambience, object sounds synced to real visual events, restrained transitions and impacts. The voice must
always stay clear. Music sits about 18–24 dB under narration. No abrupt jumps. The final mix is about −14 LUFS.

**Licensing.** Only use assets with verified YouTube and commercial rights:
1. YouTube Audio Library
2. properly licensed libraries the agency already has
3. original or generated audio whose terms allow commercial YouTube use (ElevenLabs SFX on our plan)

Never assume online music is free to use. Log every asset in `assets/audio-license-log.md`: file, source,
licence and URL, attribution needed, the video(s) it's in, and the date checked. **Never buy anything without
approval.**

---

## 7. Thumbnails (highest priority)

Follow `docs/content/thumbnail-rules.md` and the youtube-thumbnail-creator skill:
- full final script first
- the central curiosity and strongest moment
- a look at competing thumbnails (`vidiq_similar_thumbnails`, YouTube search)
- **three distinct concepts**, pick the strongest
- one focal subject, clear hierarchy, subject–background separation, depth, low clutter
- 2–5 words that add to the title and never repeat it, readable at mobile size
- historically accurate clothing, objects and settings; no unrelated famous figures as bait

**Tool order (owner, 2026-11-16).** Use the universal thumbnail skill (`.claude/skills/youtube-thumbnail-creator/SKILL.md`):
1. **Assets:** real public-domain/licensed images or the channel's own character art; generated art only from Figma
   `generate_image` with `gpt-image-2.5-flare` (Spline `2d_generate_images` if Figma is unavailable). Cutouts with
   `youtube-thumbnail-creator/scripts/cutout.py`.
2. **Compose + render in Remotion:** `cd .claude/skills/youtube-thumbnail-creator/remotion && npm ci`, then
   `node render.mjs props.json ../../../../social/thumbnails/<VIDEO_ID>.jpg <assets...>` (props format in the skill,
   section 8; examples in `remotion/examples/`). Shorts 1080×1920 with the bottom ~400 px clear.
3. **Fallback composers:** Figma frame, then Spline 2D, only if Remotion can't render; say so with the error.
   - **Never take an arbitrary video frame as the thumbnail.** Never a text-only thumbnail.
   - The older `remotion-thumb/` here is kept only so old props still render; new work uses the skill's engine.

**Check the actual rendered file** at full size *and* at about 168×94 px (the mobile suggestion size) before it is
used. Score it against the internal targets (these are not CTR predictions) and record the scores:

| Criterion | Target |
|---|---|
| Immediate clarity | 9/10 |
| Curiosity | 9/10 |
| Mobile readability | 9/10 |
| Composition | 9/10 |
| Title alignment | 10/10 |
| Factual accuracy | 10/10 |

The house 100-point score (thumbnail-rules §14) still applies: redo anything below 70.

**Record** in `videos/<ID>/thumbnail-record.md`: concept, the alternatives considered, text, subject placement,
background, tool, scores, then CTR, impressions and traffic source per checkpoint (when available) over time.

**A/B testing.** Use YouTube Test & Compare when available (vidIQ `ab_tests` reads the results; YouTube picks the
winner by watch-time share). Test genuinely different concepts, not small cosmetic changes.

---

## 8. Title, description, SEO

For each video prepare:
- 3 title options and a recommended one (`vidiq_score_title` where useful)
- a description with chapters for long-form, sources, and the AI-voice disclosure line
- tags (don't overvalue them)
- hashtags where they fit
- a pinned comment
- the end-screen and playlist destination

Titles: curious, specific, searchable, honest. **Thumbnail + title together must promise only what the video
delivers.**

---

## 9. US publishing time

Don't schedule by Singapore time out of habit, and don't treat one US zone as the whole audience.

1. Evidence: `channel-report` → `us_time_zone_mix` (views by state mapped to ET/CT/MT/PT). Add vidIQ `audience`
   (when viewers are online) and `video_performance` (hourly views in the first 7 days) where connected.
2. Compare past uploads with `publish-times` plus snapshots (24h / 72h / 7d).
3. Test windows as experiments (§11). Keep topic and format as steady as you can while doing it.
4. Log every upload in `publishing/publish-time-log.md`: date, time (UTC and ET), target zone, format, topic,
   24h impressions (or n/a), CTR, views, watch time, 7d.
5. Convert with `TZ=America/New_York` (DST handled). Always show ET and UTC.

Fixed owner schedules can only be changed by the owner. As Printed and The Overthinking Pad publish at 7 PM ET
(long video) and 8 PM ET (Short). For those, *propose* a time test with the evidence; never move them yourself.
Never claim a publish hour guarantees US views. Don't blame the schedule for what is really a weak topic or
thumbnail.

---

## 10. Tracking and diagnosis (every published video)

**After-upload playbook (owner, 2026-11-25):** `docs/content/after-upload-playbook.md` sets the defaults for every
channel: off-the-minute publishing, sets of three + playlists, no edits for 4 h, the ≥12 h repackage check (signal
rules in its step 4), the question comment, a Short from every long video, max 3 repackages, and the AVD + CTR
diagnosis matrix (step 9). Use it with the checkpoints below; where it and this section differ, the playbook wins
(CLAUDE.md wins over both).

**Checkpoints:** about 24h, 48h, 72h, 7d, 14d and 28d. A daily scheduled task runs `growth.py due` / `snapshot` for
each channel and adds what's new to `videos/<ID>/performance.md` and the learning database row. Remember the
2–3 day lag: an early checkpoint can show partial data. Store `data_through`; never back-fill guesses.

**Reading the metrics together.** These are hypotheses to test, never automatic verdicts:
- **Low impressions, strong CTR:** topic demand, audience size, distribution, traffic sources.
- **High impressions, low CTR:** thumbnail, title, audience–topic fit.
- **Good CTR, weak retention:** hook, opening, pacing, story, a broken title/thumbnail promise.
- **Good retention, few subscribers:** positioning, audience expectations, no reason to come back.
- **Strong start, then a stall:** traffic-source mix, saturation, competition, reached its natural audience.
- **Shorts:** engagedViews ÷ views ≈ stayed past the first second. Low means the first frame or line lost the
  scroll.

**Retention.** Run `growth.py retention ID`. Map every big drop and every rewatch spike to the **exact script line
and storyboard scene** at that second. Look for repetition, slow explanation, confusing transitions, missing
visual support, and a weak payoff.

**Diagnostic report** for every video below the channel's median at the same checkpoint and format, in
`videos/<ID>/performance.md`:
1. What went wrong?
2. Which metric shows it?
3. When did it happen (second, checkpoint)?
4. What is the likely cause?
5. What evidence supports that?
6. What can change?
7. What should be tested next?

Pick **the most likely weakness**, in growth-priority order, and fix that one. Don't change everything at once.

**Existing videos.** Each month, list:
- videos with impressions but weak CTR (new thumbnail or title, ideally via Test & Compare)
- videos with strong retention but weak discovery (packaging, playlists, end screens, linking from new uploads)
- evergreen videos with renewed interest

Thumbnail and title changes need owner approval. **Never delete or re-upload because the first hours were weak.**

---

## 11. Experiments (never repeat a failing approach out of habit)

Each experiment is a card in `experiments/experiment-log.md`:

```
### EXP-<channel>-<NNN> <short name>
Problem: … | Baseline (metric, value, n videos, period): … | Hypothesis: … | Change (ONE variable): …
Control: … | Expected outcome: … | Metric + checkpoint: … | Sample/period: ≥3 videos per arm, or 28 days
Status: planned/running/decided | Result (numbers, sources): … | Decision: keep / drop / extend | Learning: …
```
Areas to test:
- content: subject, structure, length, series
- hook: mystery, contradiction, question, dramatic, visual-first
- production: camera, environments, interaction, rhythm
- audio: music mood, SFX, narration pacing
- thumbnail: focal subject, composition, emotion, text approach
- publishing: window, frequency, format

Rules:
- Record a baseline first.
- Change one major variable at a time.
- No winner from one or two videos.
- Allow for topic differences between arms.
- Keep winners and add them to `winning-experiments.md` and `winning-formats.md` with evidence.
- Stop approaches that keep underperforming, and **record failures so they aren't repeated**.

Mirror each card as one row in the learning database's experiments table.

**Monthly:** continue / stop / change, with the evidence for each.

---

## 12. Monetisation

Run `growth.py monetization --write` monthly and log it in `monetization/eligibility-tracker.md`.

- Thresholds change and vary by country. **Verify them on YouTube's official YPP page before stating them**, then
  update `YPP` and `last_checked` in `growth.py`.
- API figures are approximate. Studio > Earn is the official number.
- Also track: Community Guidelines and copyright issues (vidIQ `restrictions`), the risk of reused or repetitive
  content, and that every video adds real original value.
- Avoid:
  - mass-produced near-identical videos
  - unmodified reused footage
  - low-value slideshows
  - recycled scripts
  - unlicensed music
  - misleading metadata
  - fake engagement
- Apply YouTube's altered/synthetic content disclosure where it applies.

---

## 13. Operating rhythm (scheduled tasks)

- **Daily** (scheduled task "YouTube growth: daily checkpoints"):
  - `due`/`snapshot` for every channel; update `performance.md` and the learning rows
  - flag any video below the median at its checkpoint with a one-line hypothesis
  - note channel issues: claims, failed uploads, quota
  - no uploads, no edits
- **Weekly** (scheduled task "YouTube growth: weekly audit"; Monday):
  - `channel-report --write` per channel
  - compare against last week
  - CTR and retention, using vidIQ where connected
  - US performance and time-zone mix
  - weak-video diagnoses
  - update experiments
  - propose next week's experiments and calendar changes
  - write `analytics/weekly/<date>.md` and a short summary for the owner
- **Monthly** (first Monday): a full growth report in `reports/growth-reports/<YYYY-MM>.md`:
  - performance, subscribers, US growth
  - best and worst videos, topics, thumbnails, hooks
  - retention findings, production quality
  - publishing-time findings, monetisation
  - experiments won and lost
  - next month's strategy
- Scheduled tasks commit and push their database updates. They never upload or change videos.

---

## 14. For every new video (the loop)

1. Read the learning database and the latest weekly report.
2. Research.
3. Pick the strongest topic (score it).
4. Write the story and hook.
5. Write the production plan and storyboard.
6. Plan music and SFX (with licences).
7. Make the thumbnail (three concepts, check the rendered file).
8. Write title and metadata.
9. Choose the time from evidence.
10. Get the owner's approval, then publish.
11. Track the checkpoints.
12. Diagnose.
13. Design the next experiment.
14. Carry the lessons into the next video.

**Never repeat a failing strategy because it's familiar. Never change a working strategy without a reason. Never
put production speed ahead of audience satisfaction. More uploads is not the same as more growth.**
