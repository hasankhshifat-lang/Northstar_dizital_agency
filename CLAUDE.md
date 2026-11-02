# Northstar Digital Agency — Claude instructions

## YouTube scheduled posts: rotate Clawlink and Metricool

Every YouTube post that is scheduled goes through **one** of two tools, taking turns:

1. Open `social/youtube-schedule-log.md` and check the last row's **Tool**.
2. Use the other tool for this post. If the log is empty, start with **Clawlink**.
3. Schedule the post with that tool:
   - **Clawlink**: `clawlink_execute` with integration `youtube`, action `multipart_upload_video`.
     Set `status.privacyStatus: "private"` and `status.publishAt` to the scheduled time
     (ISO 8601 / RFC 3339, UTC). YouTube makes the video public at that time.
   - **Metricool**: `createScheduledPost` with brand `7727550` (YouTube channel
     `UCPTrW0n3ONI9uU4WetWwFCQ`), timezone `Asia/Singapore`. The video must be at a public URL.
4. Add a row to the log (date scheduled, publish time, title, tool, post/video ID), then commit and push.
5. If the tool whose turn it is fails, or is not connected, say so before using the other one.
   Log the tool that was actually used, so the next post goes to the other tool.

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
The rotation rules above still apply to every post. Stop when the user says stop.

Comment replies: the user gave standing approval (2026-10-31) to reply to comments on the channel
automatically every day via vidIQ, following the engagement step in the runbook.
