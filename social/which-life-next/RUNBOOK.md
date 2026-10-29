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
| 2. Voice and visuals | `social-media-skills:ai-voiceover`, `image-generation:image-generation`, `social-media-skills:image-prompt`, `social-media-skills:ai-music-and-sound` |
| 2. Edit | `remotion:remotion-best-practices` (or `ffmpeg`), `remotion:remotion-captions` |
| 2. Thumbnail | `social-media-skills:thumbnail-design` |
| 3. Shorts | `social-media-skills:youtube-shorts`, `social-media-skills:captions-and-clipping`, `social-media-skills:short-form-video-script` |
| 4. Metadata and upload | `social-media-skills:youtube-publishing-and-metadata`, `social-media-skills:social-seo`, `social-media-skills:platform-specs-and-validation`, `social-media-skills:scheduling-and-queue` |
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
2. Voiceover: ElevenLabs `creative_generate_speech`. Use the same voice every day; record
   its `voice_id` in `config.md` the first time and reuse it.
3. Visuals: AI-generated images (image-generation skill), one every 5–8 seconds, with slow
   zoom/pan, matched to the script. No copyrighted footage.
4. Assemble with `ffmpeg`: images + voiceover + burned-in captions + quiet royalty-free
   music bed (or none). Check the final length is 8:00–12:00.
5. Thumbnail: 1280×720, bold 3–4 word text, high contrast.
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

Cut the 3 marked moments from the long video, reframe to vertical (blurred background fill or
crop), large captions, a hook text in the first second, and end with "Full video on the
channel". Title each with `#shorts`. In the description, link the long video once it has an ID.

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
