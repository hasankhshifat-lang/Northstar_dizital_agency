# Which Life Next — daily video job

The scheduled task runs this once a day (13:17 SGT). It makes one 8–12 minute video and
3 Shorts cut from it, and schedules all four for the next morning (SGT).

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
7. **Engagement:** reply to new comments on our videos (thank, answer, ask which life to do
   next), heart the good ones, and add viewer-requested lives to the topic shortlist.

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

## 3. Cut 3 Shorts (1080×1920, under 60 seconds)

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
