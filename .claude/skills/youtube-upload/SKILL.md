---
name: youtube-upload
description: "Upload and schedule videos/Shorts on the Which Life Next YouTube channel (UCPTrW0n3ONI9uU4WetWwFCQ) directly with the YouTube Data API, using the YT_CLIENT_ID / YT_CLIENT_SECRET / YT_REFRESH_TOKEN environment secrets. Use for ANY YouTube upload or scheduling: 'upload to YouTube', 'schedule this Short', 'post the video on YouTube'. Clawlink/Metricool are only the fallback when these secrets are missing or the API fails."
---

# YouTube upload (direct YouTube Data API)

Upload and schedule YouTube videos straight through the YouTube Data API v3 with
`scripts/yt_upload.py` (standard-library Python). Do not use Clawlink or Metricool for
YouTube uploads unless the fallback rule below applies.

## Credentials

Environment secrets (set by the owner in the cloud environment settings, never in the repo or chat):
`YT_CLIENT_ID`, `YT_CLIENT_SECRET`, `YT_REFRESH_TOKEN` — an OAuth client from the owner's Google
Cloud project, refresh token with scopes `youtube.upload` and `youtube`, authorised as the
Which Life Next channel. The script swaps the refresh token for a short-lived access token each run.
Never print, log or commit the secrets.

First check: `python3 -I .claude/skills/youtube-upload/scripts/yt_upload.py check`
must list channel `UCPTrW0n3ONI9uU4WetWwFCQ`. If it lists another channel, stop and tell the owner.

## Before uploading

Confirm the title, description, publish time and video file with the owner, unless the
request (or a standing approval in a scheduled task) already gives them.

## Upload / schedule

```bash
python3 -I .claude/skills/youtube-upload/scripts/yt_upload.py upload /path/video.mp4 \
  --title "TITLE #shorts" --description "DESCRIPTION" --tags "tag1,tag2" \
  --category 27 --publish-at 2026-11-05T14:00:00Z
```
- `--publish-at` (RFC 3339, UTC): uploads as private and YouTube makes it public at that time.
  Convert the owner's time explicitly and report it in UTC, Asia/Singapore and US Eastern.
- No `--publish-at`: published right away with `--privacy` (default `public`).
- Defaults: category 27 (Education), not made for kids, marked as altered/synthetic content
  (AI narration). `--made-for-kids` / `--not-ai` change that.
- Shorts: vertical video up to 3 minutes; put `#shorts` in the title or description.
- Output is JSON with the video `id` and `url`. Check later with `yt_upload.py status VIDEO_ID`.

## Known limits

- **Unverified API project = private only.** YouTube locks videos uploaded from an API project
  that hasn't passed YouTube's API audit to private. If the upload result or `status` shows the
  video stuck as private (or `publishAt` dropped), tell the owner: the Google Cloud project needs
  the YouTube API Services audit (https://support.google.com/youtube/contact/yt_api_form)
  before scheduled/public uploads work. Until then use the fallback.
- Refresh tokens of an OAuth app in "Testing" mode expire after 7 days. If the token refresh
  fails with `invalid_grant`, tell the owner to publish the OAuth consent screen ("In production")
  and create a new refresh token.
- Quota: each upload costs ~100 units of the project's 10,000/day.
- Never delete a video unless the owner explicitly asks.

## Fallback

If the secrets are missing, `check` fails, or the upload fails, say so with the error, then
schedule with the Clawlink/Metricool rotation in `CLAUDE.md` (log which tool was used).

## Log

Add a row to `social/youtube-schedule-log.md` (date scheduled, publish time, title, tool =
`YouTube API`, video ID), then commit and push.
