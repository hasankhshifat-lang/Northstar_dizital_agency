# Northstar Digital Agency — Claude instructions

## YouTube: always Google Cloud (YouTube Data API) — never Clawlink or Metricool

Owner rule (2026-11-03): every YouTube upload, scheduled post and management task (listing
scheduled posts, status, view counts) goes through the owner's own Google Cloud OAuth client,
using `.claude/skills/youtube-automation/SKILL.md` (helper `yt.py`). **Do not use Clawlink or
Metricool for YouTube.** The old Clawlink/Metricool rotation is retired.

1. Schedule: `yt.py upload FILE --publish-at <UTC>` (uploads private; YouTube makes it public then).
2. Log a row in `social/youtube-schedule-log.md` (date scheduled, publish time, title,
   tool `Google Cloud (YouTube Data API)`, video ID), then commit and push.
3. If the Google Cloud upload fails (missing env vars, token error, quota), stop and report it.
   Do not fall back to another tool.

Confirm the title, description, publish time, and video file with the user before scheduling.

## Which Life Next daily videos: standing approval

The user gave standing approval (2026-10-29) for the daily **Which Life Next** job, scheduled without asking first.
Current output (user, 2026-10-31): **Shorts only — 4 standalone story Shorts a day; long videos are paused** until the
10M Shorts-views target is reached or the user says to resume. For these posts only, the
"Confirm … with the user before scheduling" rule above does not apply.
Format (user, 2026-11-01, latest): **every Short is a map Short in the GeoGlobeTales-learned style, WITH a voiceover**
(Jesse), plus sound effects that never cover the voice (they are ducked under it). Each Short runs about **2 minutes**
of interesting history and **opens with a hook of the main story**. The map **dives into ground scenes**: places, buildings,
infrastructure and characters acting out what the voiceover says. Then it returns to the map.
The user approved the Pony Express v3 sample on 2026-11-01 ("continue for future shorts like this"). Its code is
`remotion/src/stories/ponyVoiced.tsx`, `remotion/src/sets/ponyScenes.tsx` and `remotion/pony_voiced_mix.py`.
Follow the RUNBOOK sections "Map Shorts", "Voiced map Shorts" and "Ground scenes inside map Shorts". Follow
`social/which-life-next/RUNBOOK.md`; publish slots are in `social/which-life-next/config.md`.
**Publish only Pony Express-style Shorts (user, 2026-11-02). Never schedule any other style.**
The Google Cloud rule above applies to every post. Stop when the user says stop.

Comment replies: the user gave standing approval (2026-10-31) to reply to comments on the channel
automatically every day via vidIQ, following the engagement step in the runbook.
