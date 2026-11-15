# Northstar Digital Agency — Claude instructions

## Video generation: always use the lemo-opuscar skill

For any request to generate or produce a video (film, Short, Reel, promo, explainer, animation,
documentary cut), use `.claude/skills/lemo-opuscar/SKILL.md` (library: github.com/lemomo-ai/lemo-opuscar).
- Use it before the generic `video` skill, Remotion, Higgsfield, vidIQ video generation or other
  AI-video tools. Those are only for things lemo-opuscar doesn't do (plain editing, trimming or
  converting existing video files), or when the user explicitly asks for a different tool.
- Run its `scripts/setup.sh` first (it downloads the library to `~/lemo-opuscar`), start
  `setup.sh deps` early, then follow `$LIB/AGENTS.md`: style choice, one round of questions,
  treatment, production, delivery.
- Put each film's project folder under `videos/<name>/` in this repo. Commit the source and the
  final video (keep files under GitHub's 100 MB limit), then push.
- **Don't use the 3D Map Explainer style (`map-explainer`)** for any video, and don't suggest it
  (owner, 2026-11-14). Pick or suggest other styles.
- The renderer wants ffmpeg 7+. If the container only has an older ffmpeg, say so before rendering.
- **Voiceover: always VibeVoice** (owner, 2026-11-15): Microsoft VibeVoice-1.5B on CPU through
  `videos/as-printed/engine/voice/vv_tts.py` (setup: `setup_vibevoice.sh`; narrator reference `narrator_ref.wav`).
  It writes the same `<id>.wav` + `dur.json` as the library's `core/tts/tts.py`, so it replaces Kokoro in any pipeline.
- Uploading or posting the finished video still follows the YouTube and Facebook sections below.

## YouTube: always use the youtube-channel-automation skill (own Google Cloud client)

For any YouTube channel task (uploading, scheduling, editing titles/descriptions/tags/privacy/
publish time, thumbnails, playlists, reading and replying to comments, auto comment replies in
scheduled tasks, checking status), use `.claude/skills/youtube-channel-automation/SKILL.md`.
- Call the YouTube API directly with the agency's Google Cloud OAuth client
  (`YT_CLIENT_ID` / `YT_CLIENT_SECRET` / `YT_REFRESH_TOKEN`, project `168994544641`).
- **Do not use Clawlink or Metricool for YouTube anymore**, in chat or in scheduled tasks,
  not even as a fallback. If the API fails or the quota is used up, say so and stop.
- Confirm the title, description, publish time, and video file with the user before uploading.
- Never delete a video, comment or playlist unless the user explicitly asks for that deletion.
- Log uploads/schedules/edits in `social/youtube-schedule-log.md` and comment replies in
  `social/youtube-comments-log.md`, then commit and push.

## YouTube thumbnails: always the map-style thumbnail

Every new video gets a custom thumbnail. Follow `.claude/skills/youtube-thumbnail-creator/SKILL.md`:
read the full script first (`social/scripts/<VIDEO_ID>.md`, or ask for it), pick one story angle, write three
heading options and choose the clearest. Render it with `social/thumbnails/make_thumbnails.py` in the
channel's illustrated map style (the same look as the maps inside the Shorts):
- Parchment/cream land, teal water and rivers, thin state lines, the story's state filled in tan,
  rust-red route with white waypoint dots, red teardrop pins, dark label tags, dark date tag with gold text.
- A clear, specific heading (2–6 words, Anton font, white + gold) that adds to the title and never repeats it.
  Don't force dramatic words; curiosity about the actual story, never a misleading claim.
- **Shorts: 9:16, 1080×1920** (`--vertical`, file `<VIDEO_ID>_9x16.jpg`): date tag and hook at the top,
  map focus in the middle, bottom ~400 px kept clear for YouTube's title overlay.
- Long-form videos: 16:9, 1280×720 (`<VIDEO_ID>.jpg`), hook on the left, map on the right.
- Add a function for the new video in `make_thumbnails.py` (`VERTICAL` for Shorts, `VIDEOS` for long-form),
  render it, look at the result, then set it with `yt.py thumbnail VIDEO_ID FILE` and log it in
  `social/youtube-schedule-log.md`. Update `social/thumbnails/README.md`, then commit and push.

## YouTube analysis: use vidIQ

For any YouTube analysis (channel or video performance, keyword and topic research, competitor
channels, titles, tags, best posting times, outlier videos), use the **vidIQ** connector first.
- Fall back to the YouTube Analytics API through the youtube-channel-automation skill
  (`yt.py analytics`) only when vidIQ is not connected, is out of credits, or has no tool for the question.
  Do not use Clawlink or Metricool analytics. Say which source was used.
- If vidIQ is not connected, tell the user it needs to be authorized in claude.ai connector
  settings before using the fallback.

## Facebook Page: always use the facebook-page-automation skill

For any NorthStar Dizital Facebook Page task (uploading videos/Reels, posting, scheduling,
deleting, timed takedowns, checking status), use `.claude/skills/facebook-page-automation/SKILL.md`.
- Call the Graph API directly (`graph.facebook.com` / `graph-video.facebook.com`, credential
  injected by the proxy). Do not use Clawlink or Metricool for the Facebook Page.
- Never delete an uploaded video or post unless the user explicitly asks for that deletion.
- Log every action in `social/facebook-page-log.md`, then commit and push.

## As Printed (archive history channel): daily long video + Short

Owner request 2026-11-15: one long video (8–12 min) and one Short (45–60 s) every day for the YouTube channel
**As Printed** (`yt.py --channel asprinted`), in the Archive Light Table template (`videos/as-printed/engine/`).
Follow `videos/as-printed/RUNBOOK.md`.
- **Approval first** (owner's choice): send the finished videos, titles, descriptions and publish times; upload only
  after the owner approves. The general YouTube confirmation rule above stays in force.
- Publish the long video at **7:00 PM US Eastern** and the Short at **8:00 PM US Eastern** (same day).
- **Thumbnails for As Printed use the archive style** (`engine/thumb.html`), not the map style: the map-style rule
  above applies to Which Life Next.

