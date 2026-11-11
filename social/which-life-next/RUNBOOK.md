> **POSTING TOOL (user, 2026-11-03): YouTube is managed ONLY through Google Cloud (YouTube Data API,
> `.claude/skills/youtube-automation/SKILL.md`). Never Clawlink or Metricool.** Any Clawlink/Metricool
> instructions below (scheduling, Drive relay, view counts, analytics) are retired; use `yt.py` instead.

> **CURRENT MODE (user, 2026-10-31): SHORTS ONLY.** Long videos are paused until the 10M Shorts-views target is
> **FORMAT (user, 2026-11-01, latest): ALL Shorts are map Shorts WITH a voiceover. 45–60 seconds (owner, 2026-11-08; 110–150 words), opening on a hook of the main story.**
> - Visuals: the "Map Shorts" section below (continuous camera over a real map, Kit v2 on the map).
> - Narration: Jesse (`4N8zjn9tVNuDEBFWVHAq`, eleven_v4), as in the voiceover sections.
> - Sound effects must NEVER cover the voice. `pony_mix.py` with `VOICE=` ducks effects to −14 dB and music to −20 dB under speech; they come back up between lines.
> reached or the user says to resume. Each day: step 0 (report, story-type ranking, comments) → 4 standalone story
> Shorts ("Standalone story Shorts" section; 3 from the best type, 1 test) → schedule (config.md slots,
> Google Cloud YouTube Data API via `.claude/skills/youtube-automation`) → logs. Skip the long-video steps, thumbnails and the cut-from-long Short.

# Which Life Next — daily video job

The scheduled task runs this once a day (13:17 SGT). It makes one 8–12 minute video and
4 Shorts (1 cut from the long video + 3 standalone story Shorts, see "Standalone story Shorts"), and schedules all five for the publish day's slots (SGT, see config.md).

Channel: **Which Life Next (@whichlifenext)**, YouTube channel `UCPTrW0n3ONI9uU4WetWwFCQ`.
Audience: USA. The user gave standing approval for these daily posts (see `CLAUDE.md`), so
the job does not wait for a confirmation.

## Skills to load (use them, don't work from memory)

Load each skill with the Skill tool at the step where it is needed:

| Step | Skills |
|---|---|
| 0. Daily report | `social-media-skills:analytics-and-reporting`, `social-media-skills:content-audit` |
| 1. Topic | `social-media-skills:viral-reverse-engineering`, `social-media-skills:trend-jacking`, `social-media-skills:audience-research`, `social-media-skills:idea-generation-and-ideation` |
| 2. Script | `social-media-skills:youtube-long-form`, `social-media-skills:scripting-and-storyboarding`, `social-media-skills:storytelling-and-narrative`, `social-media-skills:hook-writer`, `humanizer:humanizer` |
| 2. Voice | `social-media-skills:ai-voiceover`, `social-media-skills:ai-music-and-sound` |
| 2. Animation and edit | `remotion:remotion-best-practices` (read its markup + multi-scene references), `remotion:remotion-captions` |
| 2. Thumbnail | `social-media-skills:thumbnail-design` |
| 3. Shorts | `social-media-skills:youtube-shorts`, `social-media-skills:captions-and-clipping`, `social-media-skills:short-form-video-script` |
| 4. Metadata, Drive and upload | `social-media-skills:youtube-publishing-and-metadata`, `social-media-skills:social-seo`, `social-media-skills:platform-specs-and-validation`, `social-media-skills:scheduling-and-queue` |
| 6. Timing review | `social-media-skills:experimentation-and-ab-testing` |

## 0. Daily report (do this first, every run)

Write `reports/YYYY-MM-DD.md` (today's SGT date) covering every video posted in the last 7 days:

1. **Numbers per video:** views, US views and US share, average view duration and % viewed,
   CTR on impressions, likes, comments, subscribers gained. Get these from YouTube Analytics
   through Clawlink `youtube`, or Metricool `getAnalyticsDataByMetrics` for brand `7727550`.
2. **What's working:** the top video and Short, and why (topic, hook, thumbnail, title, length).
3. **What's not:** the weakest ones and the likely cause (low CTR = thumbnail/title; drop in
   the first 30s = hook; low US share = topic or timing).
4. **3 improvements for the next videos:** concrete and testable, e.g. "test a face-close-up
   thumbnail", "hook with a question instead of a fact". Apply them in today's video and say how.
5. **Channel totals:** subscribers, total views this week vs. last week.
6. **Monetization tracker:** update `monetization.md` (subscribers, public watch hours over
   the last 365 days, Shorts views over the last 90 days) and the daily pace still needed to
   hit each target by the goal date. Say plainly whether we are on track.
7. **Engagement — auto-reply (standing approval from the user, 2026-10-31):**
   - `vidiq_video_comments` with channelId `UCPTrW0n3ONI9uU4WetWwFCQ`, order `time`; reply to every
     top-level comment that has no reply with `byChannelOwner: true` yet, via `vidiq_reply_to_comment`
     (check `vidiq_comment_reply_permission` first; if it is false, give the user the verification link).
   - Style: 1–2 short sentences in the channel's voice, warm, specific to what they said, usually ending
     with a question. No emojis spam, no "smash subscribe", no links.
   - Facts: only what the video's sources support. A correction → thank them, check it, flag it in the report.
   - Do NOT reply to spam, links, insults, politics or arguments — list them in the report for the user to
     hide/delete. Never reply twice to the same comment (a second call can post a duplicate).
   - On each new long video, post one question comment from the channel for the user to pin in Studio
     (the API cannot pin). Hearting is not available through the API.
   - Add viewer-requested lives to the topic shortlist. List every reply posted in the daily report.

If there is no data yet (first days), say so and list what you will measure.

## 1. Pick today's topic (USA demand)

1. Read `topics-log.md` so no topic repeats within 30 days.
2. Check the channel's recent uploads and their views (Clawlink `youtube`) to stay in the niche.
   **The format (from the channel description, never drift from it):** animated POV American
   history. Each episode drops "you" into a real moment from America's past (Oregon Trail
   1850, coal miner 1925, night-shift gas station clerk 1987…) and asks: *would you have made
   it?* The "you" is **Kit**, a composite built from real diaries, guidebooks and records —
   everything that happens to Kit happened to real people. Titles start with "POV:".
   Good US-demand eras: Gold Rush, Wild West, Civil War, Ellis Island, Titanic, 1918 flu,
   Prohibition, Dust Bowl, Great Depression, WWII home front, 1950s suburbs, 1970s/80s jobs.
3. Find 3–5 reference videos in this niche that are getting a lot of views right now, with a
   US audience: YouTube search with `regionCode: US`, recent uploads (last 30 days), sorted by
   views; also check US Google/YouTube trends for the niche.
4. Choose the topic with the best views-per-day and a clear angle we can do better or
   differently. The reference is **inspiration only**: write an original script, use no
   footage, audio or script text from the reference video.

## 2. Make the long video (8–12 minutes, 1920×1080)

1. Script: 1,250–1,750 words (~8.5–11.5 min at ~150 words/min). Hook in the first 10 seconds,
   open a question, pay it off at the end, and re-hook every ~90 seconds (a new danger or
   choice for Kit) so viewers keep watching — watch hours drive monetization. US English, US units and examples. Mark 3 self-contained
   moments of 30–55 seconds each for the Shorts.
2. Voiceover: ElevenLabs `creative_generate_speech` with the channel voice from
   `social/voices.md` — **Jesse, `4N8zjn9tVNuDEBFWVHAq`, model `eleven_v4`** — for the long video
   and every Short. Never use another voice for this channel.
   **Danger-moment tags (always):** before sending the script to ElevenLabs, mark every danger
   moment with `eleven_v4` audio tags so Jesse's friendly read turns tense there:
   - `[tense]` at the start of the sentence where the threat appears (disease, accident,
     river crossing, mine collapse, robbery, a choice that could kill Kit) — and the re-hook
     every ~90 seconds is usually one of these.
   - `[quietly]` or `[whispers]` for the grim payoff line (a death, a grave, a number of dead).
   - `[pause]`, or an ellipsis, right before the reveal; `[urgent]` only for a sudden event.
   - Return to a normal read on the next calm line (`[calm]` if needed) — tags shape a moment,
     they don't change the narrator.
   - Limits: at most one tag per sentence, roughly 6–12 tagged moments in a long video and
     1–3 in a Short; Shorts open with `[tense]` on the hook line. Never tag sources,
     disclaimers or the call to action.
   - Tags go only into the TTS text, never into on-screen captions or descriptions.
   - Listen-check: if a tag makes a line sound over-acted, drop that tag and regenerate the line.
   Example: `[tense] By noon, the man in the next wagon can't stand. [pause] [quietly] By
   evening, you're digging his grave.`
3. Visuals: **animated in Remotion, starring Kit** (project: `remotion/`). Do not use Figma or
   any AI image generator. Kit is the SVG character in `remotion/src/kit/Kit.tsx`; render the
   `KitSheet` still and compare: Kit always has short brown hair, the dark charcoal flat cap,
   the worn brown wool coat with turned-up collar, dark trousers and boots. Never redesign Kit;
   era outfits (`outfit`) only add details (scarf, miner's lamp, modern jacket cut) and keep the
   cap, coat colour and silhouette. Other people reuse the rig with `colors` overrides.
   - Write `shots.json` in the day's scratch folder: for each narration segment, a list of
     shots (`at` = fraction of the segment where the shot starts) using the `Shot` type in
     `remotion/src/Episode.tsx`: `landscape` / `interior` / `town` / `card`, time of day,
     snow, falling snow, elements (sod house, barn, wagon, schoolhouse, rope, storm front,
     people), Kit's pose/position/walk, camera zoom/pan, tint. Change shot every 5–10 s, put
     Kit on screen in most shots, and use a title card for each key number or date.
   - A new era or place needs new sets: add components to `remotion/src/sets/` (same palette
     from `theme.ts`, same flat-painted style), add an element type in `Episode.tsx`, and check
     a still before rendering the whole episode.
4. Assemble: copy `build.py` into the scratch folder (narration timing, wind bed, caption
   timing), then `python3 -I make_episode.py <scratch> <date> --render --shorts`. It writes
   `remotion/public/episodes/<date>/episode.json` and renders the long video and Shorts with
   Remotion (captions are drawn by Remotion). Check stills at 4–5 points before uploading.
   Check the final length is 8:00–12:00.
5. Thumbnail: 1280×720 from a Remotion still (`npx remotion still Episode --frame=N`) with Kit
   in a dramatic moment, plus bold 3–4 word text, high contrast.
6. Facts: every number and claim comes from a real source (NPS, Library of Congress,
   National Archives, Smithsonian, university history departments, published diaries). Keep a
   source list while scripting (find sources with WebSearch, then open each page with `curl -sL` to
   confirm the exact title and numbers; WebFetch may not reach .gov sites, but curl does.
   Allowed: nps.gov, blm.gov, loc.gov, archives.gov, census.gov. si.edu and britannica.com
   block automated requests, so cite them only after checking through search results); if historians disagree, say so in the video.
7. Metadata: title under 60 characters starting "POV:" with the main search phrase. The
   description is the **actual text viewers read** (never notes about the description):
   2-line hook summary, "every number is sourced", chapters from 00:00 (at least 3, each
   10s+), the Kit composite note, a comment question ("Would you have made it?"), the full
   source list with links, "Narration voiced with AI. Animation made by the channel.", and
   3–5 hashtags. 10–15 tags, sent as a list of separate strings (not one comma-joined string). Mark "altered or synthetic content" where YouTube asks.
8. Pre-upload check: search every description for `[`, `TODO`, `link here` or similar
   placeholders and fill them in. Shorts link the long video with its real URL
   (`https://youtu.be/<id>`), so upload/schedule the long video first.

## Monetization guardrails (YouTube "inauthentic content" policy)

YouTube rejects channels whose videos look mass-produced or templated. Every video must have:
a new story and research (no reused scripts), a real point of view and sourced facts, varied
visuals (no recycled image sets), and Kit as a consistent character. Never buy views or subs,
never sub-for-sub, never reupload anyone else's footage. Disclose AI voice every time.

## 3. Shorts: 1 cut from the long video + 3 standalone stories

One entry in `shorts.json` (the long video's most dramatic segment, 25–60 s). The other three are standalone story Shorts — see "Standalone story Shorts" below.

Pick the 3 marked segments in `shorts.json` (`[{"segment": "07", "hook": ["LINE 1", "LINE 2"]}, ...]`);
`make_episode.py --shorts` renders them with the Remotion `Short` composition (vertical crop of
the same animation, hook text for the first 5 s, large captions). Keep each under 60 s. Title each
with `#shorts`. In the description, link the long video once it has an ID.

## 4. Schedule

Read the slots in `config.md` (default: long video 06:00, Shorts 08:00 / 09:00 / 11:00 SGT,
the next calendar day). Each of the 4 posts follows the rotation in `/CLAUDE.md`, one post at
a time: read the last row of `social/youtube-schedule-log.md`, use the other tool, log it,
then do the next post.

- **Clawlink**: `multipart_upload_video`, `privacyStatus: "private"`, `publishAt` in UTC
  (06:00 SGT = 22:00 UTC the day before).
- **Metricool**: needs the video at a public URL. Upload the file to Google Drive and share it
  as "anyone with the link"; use the direct download link. If that is not possible, say so,
  use Clawlink for that post, and log Clawlink (rule 5 in `CLAUDE.md`).

## 4b. Save the final videos to Google Drive (always)

Every day, after rendering and before scheduling, upload the finished files so they can be
reused on other platforms (TikTok, Reels, Facebook):

1. In the Drive folder **Which Life Next** (`1F4___JzG4s4rNHblcVBzERva6jyYsYWE`), create a
   subfolder named `YYYY-MM-DD <topic>` (Clawlink `google-drive`, `create_folder`, `parent_id`
   = that ID).
2. Upload into it: `long.mp4`, `short-1.mp4`, `short-2.mp4`, `short-3.mp4`, `thumbnail.jpg`,
   and `metadata.md` (titles, descriptions, tags, sources, publish times). Use
   `resumable_upload` for anything over 5 MB, `upload_file` for small files.
3. Local files: call the action with `s3key` set to the local path. It fails with
   `missing_file_bytes` and gives a one-time `curl ... https://claw-link.dev/api/files/ingest`
   command; run it, then retry with the returned `file` object. The same steps work for
   YouTube `multipart_upload_video`.
4. Add the folder link to the daily summary and to `topics-log.md`.

## 5. Log, commit, push

- Add the 4 rows to `social/youtube-schedule-log.md` and one row to `topics-log.md`.
- Commit and push to the session's branch. Never commit the video files.
- Finish with a short summary (this is what the user gets as the daily update on their phone):
  1. **How the videos are doing:** the top video, its views and US views, and the week's trend.
  2. **How to improve:** the 3 improvements from today's report, and which ones today's video uses.
  3. **Today's posts:** topic, reference videos, 4 titles, publish times (SGT and US Eastern),
     tool and ID of each post.
  4. Anything that failed.

## 6. Monday: timing review

Every Monday, before step 1: once there are 14+ days of posts, pull US views per post by
publish hour (YouTube Analytics through Clawlink, or Metricool `getAnalyticsDataByMetrics` /
`getBestTimeToPostByNetwork` for brand `7727550`). Apply the rules in `config.md`, update the
slots there if the data supports it, and add a row to `timing-log.md` either way.

## If something fails

- A step that fails: retry once. If it still fails, schedule what is ready, and report what
  did not get scheduled and why. Never publish a long video that is shorter than 8 minutes or has
  no voiceover.
- Never post something now (public) in place of scheduling it.

## Known limits (learned 2026-10-30) — plan around these

- **Clawlink file relay: 25 MB per file.** Long videos must be encoded to fit: 720p, two-pass
  ~310 kbps video + 48 kbps mono AAC, `-preset veryslow -tune animation` gives ~23 MB for 8:40
  and still looks clean for painted stills. Keep the 1080p master locally only for the day.
- **Clawlink YouTube uploads share one Google project quota** (video inserts per day). When it
  says "Video Uploads per day" exceeded, it will not recover the same day: use Metricool for the
  post, log it honestly, and keep the rotation going the next day.
- **Metricool accepts the public `claw-link.dev/api/f/...` URL** returned by Clawlink
  `google-drive` `download_file` and copies the file to its own storage. Use that as `media`.
  Use `youtubeData.type: "short"` for Shorts and `isAiGeneratedContent: true`.
- **Visuals are Remotion only** (user decision, 2026-10-30): no Figma / AI image credits needed.
  Remotion renders with the installed Chromium (`remotion.config.ts` sets the browser path,
  because remotion.media downloads are blocked). Speed is ~20 frames/s, so an 8–9 minute
  episode takes about 13 minutes; run it in the background.
- **ElevenLabs credits: use `generations_count: 1`** (the default 2 doubles cost; a full episode
  is ~8k characters). Check remaining credits before starting.
- **Shorts can't link the long video by ID** when scheduled through Metricool (the ID only exists
  after publish). Link the channel instead, then update the Short descriptions the next day.
- Tools: `remotion/` (Kit, sets, Episode and Short compositions), `make_episode.py` (props +
  render), and `build.py` (only for narration timing, wind bed and caption timing now).
  `shorts.py` and the image parts of `build.py` belong to the retired image workflow.
- **Source sites that open here**: nps.gov, loc.gov (search API `?fo=json`), archives.gov,
  census.gov, blm.gov. Blocked: tile.loc.gov (LOC full texts/PDFs), state historical societies
  (kansashistory.gov, history.nebraska.gov, mnhs.org), university sites. Use LOC item records to
  confirm a document exists, and say in the daily update which facts came only from search results.
- **Shorts must be under 60 s**: pick segments of 25–55 s for `shorts.json` (check
  `out/timing.json` durations); split long segments when writing the script if a key moment needs
  its own Short.
- **Remotion sets available** (2026-10-31): sky, prairie, sod house, barn, wagon, schoolhouse,
  town, storm front, sod-house interior, rope, snow, cornfield (`eaten`), locust swarm/carpet,
  hopperdozer, Rocky Mountains with glacier. Thumbnails: render a still with
  `showCaptions: false` in the props, then add text with PIL.
- **Public view counts**: Clawlink `youtube-data` `channel_videos` / `channel_shorts`
  (handle `whichlifenext`) work even when the YouTube API quota is exhausted.

## Thumbnails (from 2026-10-31 competitor review)
Top thumbnails in the niche (Fossil "How Long You'd Last…", ONE RULE, Santi Can't) share: one huge focal threat or a big scared face,
dark background with a warm glow, 2–3 words (often a survival time, number in a colour). Render art with the Remotion `Thumb`
still (`variant: closeup | split`, Kit `expression: "scared"`), then add text with PIL (Inter Black, black stroke).
Make 3 options for YouTube Test & compare; check them at ~350 px wide before sending.

## Kit v2 (2026-10-31)
Kit was redesigned at the user's request for a more eye-catching, detailed hero: ink outlines, cel shading,
big hazel eyes with highlights, freckles, signature RED NECKERCHIEF, brass-button coat with patches and
pockets, leather satchel, knee patch, laced boots. Expressions: neutral, happy, scared, determined, sad
(`expression` prop, front + side). Reference: `social/which-life-next/kit-v2-sheet.png` (KitSheet still).
Use "scared" in danger beats and thumbnails, "determined" when Kit acts, "happy" at the cold open/verdict.

## Competitor techniques in the Episode system (2026-10-31, see research/competitor-animation-2026-10-31.md)
Kit v2 is the hero (user confirmed). New shot fields in shots.json (passed straight through by make_episode.py):
- **Auto fast-cutting** (default on): any shot > 3.5 s is split into ~2.5 s beats that cycle wide → Kit close-up → medium → pan.
  Set `"cuts": false` only for title cards or slow emotional moments.
- `"keyword": "CHOLERA!"` (+ optional `"keywordAt": 0.3`): pop-up danger word with shake — one per danger beat.
- `"timer": "3 DAYS"`: survival-time chip for the shot.
- `"kind": "board", "board": {"entries": [{"label": "...", "tier": 0-5}]}`: the "HOW LONG WOULD YOU LAST?" scoreboard
  (tiers: WHOLE LIFE, YEARS, MONTHS, DAYS, HOURS, MINUTES). Show it at the end of every section; the last entry animates in.
  Tiers must come from the script's sourced facts.
- `"card": {"big": "1888", ...}`: huge embossed year/number on title cards.
- Film grain is applied to every episode automatically.

## Never boring: cold open + "what's next?" structure (user rule, 2026-10-31)
Every long video and every Short must make the viewer ask "what happens next?". Never start the story cold.

**1. Cold open (first 12–18 s), every long video — built by make_episode.py from `_teaser` in shots.json:**
- 3–4 flashes of the BEST moments from later in the video (each: the real narration line, Kit reacting
  with `expression`, a 1–2 word `keyword`, whoosh between flashes). Pick the most shocking/visual lines.
- Then a hook QUESTION card (style "hook", boom): e.g. "COULD YOU / SURVIVE 1874?" + a short subtitle claim.
- Then the story starts from the beginning (segment 01).
```json
"_teaser": {"clips": [{"find": "<exact start of a narration sentence>", "keyword": "GONE.", "expression": "sad",
                        "caption": "<optional clean caption>"}, ...],
            "question": ["COULD YOU", "SURVIVE 1874?"], "sub": "THE BIGGEST LOCUST SWARM EVER RECORDED"}
```
Never reveal the ending in the teaser (show the danger, not the outcome).

**2. Script rules (write these into every script):**
- Open loop in the first 30 s: promise something specific that pays off later ("…and by the end, you'll see
  why this insect vanished forever").
- Re-hook every 60–90 s: a new danger, a twist, a number, or "but that wasn't the worst part."
- End each section on a cliffhanger line, then show the **survival board**, then "Next…" teaser for the
  following section (one sentence).
- Pattern interrupts: a keyword pop, a title card with a big year/number, or a board update at least every
  45 s; Kit's expression changes with every danger beat.
- No dead air: no sentence without something changing on screen (auto-cuts handle long shots).
- Final 20 s: the verdict + the board's final state + a direct question for the comments + "watch next" line.

**3. Shorts:** the first second is the most shocking frame (Kit's scared face or the threat up close) with the
hook text; first spoken line is the danger, not the setup; end on a question or a cliffhanger that loops.

**4. Thumbnails:** competitor style only (see "Thumbnails"): one huge focal threat or Kit's scared face, dark
background with a warm glow, 2–3 words built around a number; 3 options for Test & compare.

## Standalone story Shorts (user rule, 2026-10-31) — 3 a day
Each one is its own complete story from REAL history (sourced like the long videos), starring Kit v2, with the same
cold-open hook as the long videos. Must be complete and ≤ 2 minutes (target 75–110 s).
1. **Pick the story with `story-types.md`:** 3 of the 4 from the current best-performing type(s), 1 test of another type.
   Real event, one person facing death or a shocking turn, a clear ending. Not covered on the channel before
   (check topics-log.md). 2 sources minimum (allowlisted sites).
2. **Script 180–300 words, 2–4 segments** (`segments.json` like the long videos, Jesse voice, tense tags in danger):
   - seg 01: drop straight into the danger (second person, "It's 1906. The ground is moving.")
   - middle: escalation + one twist / number
   - last: the outcome + a one-line question that makes people comment ("Would you have run back in?")
3. **Folder:** `.work/<date>/story-<n>/` with a copy of build.py (SEGS = its segments), segments.json, vo/, shots.json.
   `shots.json` needs `"_teaser"` (2 flashes from the climax + the question) and `"_title"` (2 short lines shown at the top, over the video).
   Kit is the person in every story (composite "you", or Kit wearing the era outfit). Use expressions + keywords.
4. **Render:** `python3 -I make_episode.py .work/<date>/story-<n> <date>-story-<n> --standalone-short` → `out/short.mp4`
   (1080×1920 full screen: title at the top and captions low, both over the video). Check length ≤ 120 s.
5. **Title:** "POV: …" or the shocking fact, < 60 chars, + #shorts. Description: 1–2 lines + sources + AI narration note.
6. Log each Short in `story-types.md` (type, title, ID, views 24 h / 72 h) and pick tomorrow's types from it.

## Story-Short tools (2026-11-01)
- Sets in `remotion/src/sets/stories.tsx`, used with shot `"kind": "set"` and `"base"`: night, stormnight, city, citynight,
  town, sky, cave, caveoff, cavelamp, shaft. Elements: river, railbridge (gap), locomotive (light, tilt, driveTo),
  floodwave (front [from,to]), dam (breach [from,to]), deadcart, mosquito, boulder, crowd, bank, person (rotate), wagon,
  sodhouse, rope. Shot fields: rain 0..1, lightning, collapse, shaft, timer + timerLabel.
- `"atSentence": "<start of a narration sentence>"` on a shot makes it start exactly on that line (use it for every
  threat reveal so the picture matches the words).
- Teaser clips can name the exact shot: `{"find": ..., "seg": "02", "shot": 4}`; `"wide": true` keeps the threat in frame
  instead of punching in on Kit.
- Shorts build: copy build.py into each story folder, set `SEGS`, `FPS, GAP, LEAD = 30, 0.35, 0.3`; make a full-length
  ambience bed `out/wind.wav` with ffmpeg (rain/wind for storms, low rumble for caves).
- Render → re-encode for upload (fits the 25 MB relay, loudness for phones):
  `ffmpeg -i out/short.mp4 -c:v libx264 -preset slow -crf 23 -maxrate 2400k -bufsize 4800k -pix_fmt yuv420p -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 128k -ar 48000 -movflags +faststart out/short_final.mp4`
- Check a contact sheet of frames (teaser flashes must show the threat) before rendering.

## MUTE TEST — the picture must tell the story (user rule, 2026-11-01)
Someone watching with the sound OFF must understand what is happening. For EVERY narration sentence there is a
shot that shows it (use `"atSentence"` so the shot starts on that line). Before rendering, list the sentences and
the visual for each; no sentence may be covered by an unrelated or generic shot.
- **Real places:** open every story with a `"kind": "map"` shot — the globe spins and zooms into the REAL location
  (real coordinates; highlight the state; pin + label). Use a second, closer map whenever the narration relates two
  places (distances, "up the valley", "stopped at Scranton") with a line + distance label.
  Map data is real (Natural Earth + US Census via world-atlas/us-atlas). Look up coordinates; never guess a location.
- **Real infrastructure:** draw the real kind of structure (earth dam, multi-arch stone viaduct, wooden trestle vs
  steel viaduct, brick row houses, sandstone cave) and NAME it with a `labels` callout ("SOUTH FORK DAM",
  "STONE BRIDGE (PENNSYLVANIA RAILROAD)"). If we don't know what something looked like, label it plainly
  rather than inventing details.
- **Numbers on screen:** every number spoken is shown — `"kind": "info"` counter ("2,208 PEOPLE KILLED" with icons),
  ratio ("1 IN 10"), timers (`timer` + `timerLabel`: "57 MIN", "40 MPH", "FEB 11"), or big title cards.
- **Actions on screen:** what people do is acted out — handshakes refused (`info.type: "handshake"`), people fleeing
  (`fleeing`), bells stopped (`bell` stopped), rags to the face (`rag`), survivors in the water (`swimmers`),
  rescuers with lanterns, crowds.
- **Names on screen:** every named person or group gets a callout or a title card.
- Captions stay on (over the video, no bar), but the visuals must work even without them.

## FULL SCREEN Shorts — no black bars (user rule, 2026-11-01)
"Use full screen video, don't put bars at the top and bottom; just show the texts/captions."
- The `Short` composition scales the 16:9 scene ×1.78 to fill the 1080×1920 frame. Never add bars back.
- The title (2 lines) sits at the top and the captions sit low (`bottomPad` 330), both directly on the video:
  white/yellow text with a thick black stroke over a soft dark gradient.
- **Safe zone:** a full-screen Short shows only world x ≈ 660–1260 (all of y 0–1080) of each scene.
  Put every important thing (Kit, the threat, labels, numbers) inside x 680–1240. Callouts and map labels
  are auto-clamped there; with a close-up camera, set a callout's `x` near Kit's `walkTo` position.
- Info graphics in narrow mode end above world y ≈ 700, so the captions never cover them (counter max 24 icons).
- Check a contact sheet (`npx remotion still Short …` at 6–8 frames) before encoding.

## Map Shorts, GeoGlobeTales style (2026-11-01)
Full breakdown: `research/geoglobetales-breakdown-2026-11-01.md`.

**Format:** native 1080×1920 with **one continuous camera over a real map and no cuts**. The camera flies between real places.

**Built so far:** `remotion/src/MapShort.tsx` (composition `MapShort`), with these parts:
- an Albers USA map from us-atlas/world-atlas, in parchment and teal with flat political fills and thick outlines
- a keyframed camera, plus a follow-cam that rides along the route with Kit
- Kit on a galloping horse (`sets/horse.tsx`)
- pins, route draw-on, relay-station pops, a day counter, a day/night tint, a telegraph wire with poles, a sign flip, a rewind effect (◀◀◀ with blur), and big serif dates

**On-screen text:** 1–5-word white/yellow lines around y 1300, plus big serif dates. No title cards.

**Sound:** `pony_mix.py` builds the audio:
- a synthesized pizzicato music bed, royalty-free
- ElevenLabs `eleven_text_to_sound_v2` effects (gallop, whoosh, pop, rewind, telegraph, zap, neigh, boom, cheer, ding, wind), each placed on its visual event
- one silence beat before the twist

**No-voiceover Shorts** use this format: the story is carried by the on-screen lines and sound effects.

**Story shape:**
1. Payoff first.
2. Rewind.
3. Big date.
4. Setup on the map.
5. The journey, with counters.
6. Payoff number.
7. Silence and "Then…".
8. Twist.
9. A final hard number.

**Per-Short workflow:**
1. Copy `src/MapShort.tsx` to `src/stories/<slug>.tsx` and register it in `Root.tsx`.
2. Change ROUTE (real coordinates), the timeline `T`, the camera keys and the on-screen lines.
3. The sound-effect library is in `remotion/public/sfx/` (gallop, whoosh, pop, rewind, telegraph, zap, neigh, boom, cheer, ding, wind). Generate missing ones with ElevenLabs `eleven_text_to_sound_v2` (generations_count 1) and add them there.
4. Copy `pony_mix.py`, rewrite its cue list to match the new timeline, and render the audio to `public/<slug>/sound.wav`. Then render the composition with `--props='{"sound":"<slug>/sound.wav"}'`.
5. Length 35–60 s, with something new on screen about every second.
6. YouTube description must end with: "Sound effects generated with AI. Animation made by the channel."

### Voiced map Shorts (user rule, 2026-11-01, latest)
1. **Length** 45–60 s (owner, 2026-11-08). The script is 110–150 words of interesting real history, with 2+ sources.
2. **Hook** (the first 5–8 s): tell the main story's most surprising outcome and ask a question, over flashes of the climax on the map. Then rewind (◀◀◀) to the start and show a big date.
3. **Narration:** generate it per segment with ElevenLabs (Jesse, eleven_v4, tense tags). Get word timestamps with faster-whisper; pass it a numpy array, because the `av` decoder is broken here. Set the timeline `T`, the camera keys and the on-screen pops from those timestamps, so every spoken place, number and action appears on screen when it is said (MUTE TEST).
4. **Captions:** 1–4-word chunks in sync with the voice, around y 1300 (white with a black stroke), plus big serif dates and yellow keyword pops.
5. **Sound effects:** keep the pops, whooshes and booms on visual events. Run `pony_mix.py` with `VOICE="<narration.wav>"`.
   - Under speech, effects drop 14 dB and music 20 dB (tested: the background sits 18 dB below the voice while it speaks). They return in the gaps.
   - Put the big effects (boom, rewind, cheer, zap) in pauses between lines.
   - Keep the silence beat before the twist.
6. **Description** must end with: "Narration voiced with AI. Sound effects generated with AI. Animation made by the channel."

### Ground scenes inside map Shorts (user rule, 2026-11-01): don't stay stuck on the map
Start on the map, then **dive into the place** and show what the narration describes. Then return to the map when the story moves.
- **What a ground scene shows:** real buildings and infrastructure (towns, stations, offices, railroads, telegraph lines), other characters doing the action, close-ups of key objects (prices, newspapers, scales, ledgers), and terrain beats (desert, blizzard, night).
- **Rhythm:** about 50–60% of a 2-minute Short is ground scenes and the rest is map. Change place every 3–6 s, and never sit on one view longer than about 8 s.
- **Transitions:**
  - map → scene: a dive (map zoom ×4, then the scene settles from ×1.35, with a white flash).
  - scene → scene: a whip slide.
  - scene → map: a pull-out.
  - Each transition gets a whoosh.
- **Code:**
  - `src/sets/ponyScenes.tsx` holds the reusable vertical pieces: Sky, Hills (parallax), Ground, Cabin, Fence, Storefront, Pole, Bunting, Wall, Person (recoloured Kit rig with top-hat option; SUIT/KEEPER/CLERK/WORKER/TOWN palettes) and Horse. It also has example scenes (gallop, town and railroad end, office, relay swap, scale, desert, blizzard, night, arrival, counter, newsboy, dusk, crew, telegraph office, CLOSED).
  - `src/stories/ponyVoiced.tsx` has the `SCENES` schedule, `diveFactor` and `SceneLayer`. Each scene's internal beats use its local time, matched to word timestamps.
- **Layout:** draw scenes on GY=1240 and shift them up 130 px in the SceneLayer. Captions sit at y 1420, below the action.


### Learned 2026-11-09 (Ghost Army Short)
- Non-US topics: copy `src/stories/ghostArmy.tsx` (Europe Albers projection, scene schedule, Big/Tag pops) + `src/sets/ghostScenes.tsx` (Tank, Soldier, Label); mix script in `shorts/<slug>/mix.py` (synth hiss/rumble/steps added).
- Use `/usr/bin/python3 -I` for faster-whisper, numpy and Pillow (the default `python3` has none of them). Whisper `small` takes ~2 min on first run.
- `yt.py thumbnail` only exists in main's helper (`/tmp/ytmain/yt.py`); the working-branch helper lacks it.
- Facebook `scheduled_publish_time` is unix seconds: `date -u -d <ISO> +%s`.
- Keep ground-scene actors above y≈1400 (after the −130 shift); the bottom 400 px is covered by the YouTube UI.

### Learned 2026-11-10 (Mike the Headless Chicken Short)
- US topics: copy `src/stories/chickenMike.tsx` (US Albers map, state fills, tour route) + `src/sets/chickenScenes.tsx` (Chicken rooster rig, Farm, Label, scenes); mix in `shorts/<slug>/mix.py`.
- Full render takes ~8 min (1,650 frames); start it in the background right after stills pass.
- `pip install faster-whisper` is needed each fresh container; `--sort` is not exposed by `yt.py analytics`, call `yt._call` with `sort=-views,maxResults` for the per-video report.
- Thumbnails: add a `v_<slug>` function to `social/thumbnails/make_thumbnails.py`, run with `/usr/bin/python3 -I … --vertical <KEY>`.
- Thumbnails 2026-11-10 (owner): map-only thumbnails don't explain the topic. Make a 2D cartoon of the story (Remotion composition `MikeThumb` in src/stories/mikeThumb.tsx, Anton font in public/anton.ttf): the main character + the key object + big 2-word hook + one proof line. No 3D/Blender models. Figma connector was not available in the session.

### Learned 2026-11-11 (Hugh Glass Short)
- Story: `src/stories/hughGlass.tsx` (US map with SD fill, hand-placed rivers, route preview flash in the question beat) + `src/sets/glassScenes.tsx` (Bear rig with rear/roar, Lying man, Rifle, Knife, Fort stockade, Prairie, crawl via Kit `lean`); mix in `shorts/hugh-glass-2026-11-12/mix.py` (synth growl + fire crackle).
- Big hook text in Anton: add `@font-face` for `public/anton.ttf` inside the composition (family "AntonT").
- Remotion's mp4 is yuvj420p: re-encode with `-vf "scale=in_range=pc:out_range=tv,format=yuv420p"` to get true yuv420p.
- Lying figures: the Kit rig rotated −90° puts the head ~400 px left of x, so keep x ≥ 560 or the head is cut off.
- Figma: the file "NorthStar Thumbnails" now exists (key `Kg0Qo4VpVpS5Ufwk0wr4Or`). The owner's Figma seat is **Collab** on the Professional plan, and its MCP tool-call limit was hit after `create_new_file` + `create_session` + one `generate_image`; every `use_figma` call then failed. A Dev/Full seat is needed for a full Figma thumbnail each day.
