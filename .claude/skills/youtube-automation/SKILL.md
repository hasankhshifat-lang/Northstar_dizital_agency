---
name: youtube-automation
description: "Upload, schedule, list and check YouTube videos/Shorts for the Which Life Next channel (UCPTrW0n3ONI9uU4WetWwFCQ) directly through the YouTube Data API with the owner's own Google Cloud OAuth client. Use for ANY YouTube publishing or managing task: 'upload to YouTube', 'schedule the Short', 'what is scheduled', 'check the video status', 'view counts', the daily Which Life Next job. Never route YouTube work through Clawlink or Metricool."
---

# YouTube automation (Google Cloud / YouTube Data API only)

Owner rule (2026-11-03): **all YouTube publishing and managing goes through the owner's own Google
Cloud project (YouTube Data API v3).** Do not use Clawlink or Metricool for YouTube — not for
uploads, scheduling, listing scheduled posts, or view counts.

## Connection

- Env vars in the cloud environment: `YT_CLIENT_ID`, `YT_CLIENT_SECRET`, `YT_REFRESH_TOKEN`.
  Never print, log, commit or echo them. Never ask the user for tokens.
- Refresh-token scopes: `youtube.upload` + `youtube.readonly`.
  - Can: upload (public now, or private + `publishAt`), set a thumbnail, list own uploads
    (including private/scheduled), read stats.
  - Cannot (needs re-authorising with `youtube` / `youtube.force-ssl`): edit an uploaded video's
    title/description/schedule, delete videos, reply to comments. If one of these is needed, say so.
- Channel: **Which Life Next**, `UCPTrW0n3ONI9uU4WetWwFCQ` (@whichlifenext).
- If the env vars are missing or the token refresh fails: stop, report it, and do not fall back to
  Clawlink or Metricool.

## Helper: `.claude/skills/youtube-automation/yt.py`

```bash
YT=.claude/skills/youtube-automation/yt.py
python3 $YT whoami                      # channel + counts (connection check)
python3 $YT scheduled                   # private videos with a future publishAt
python3 $YT recent 30                   # last 30 uploads: privacy, publishAt, views
python3 $YT stats ID1 ID2               # views/likes/comments
# Schedule a Short (uploads private; YouTube makes it public at publishAt, UTC):
python3 $YT upload short.mp4 --title "… #shorts" --description-file desc.txt \
  --tags "american history,history shorts" --publish-at 2026-11-04T22:00:00Z [--thumbnail t.jpg]
```

- `upload` without `--publish-at` publishes **public immediately** — only when the user asked for that.
  The daily job always schedules with `--publish-at`.
- Defaults: category 27 (Education), not made for kids, `containsSyntheticMedia: true`
  (AI voice). Title max 100 chars, description max 5000.
- SGT → UTC: subtract 8 h (06:00 SGT = 22:00 UTC the previous day). `publishAt` must be ≥ 15 min ahead.
- Opening an upload session creates a (private, empty) video even if no bytes are sent —
  never "test" by opening sessions; use `whoami` / `recent` to test the connection.

## Limits

- Quota: 10,000 units/day per Google Cloud project (resets midnight Pacific). Each upload
  costs a large share (historically 1,600 units → about 6 uploads/day); reads cost 1–3 units.
  If an upload fails with `quotaExceeded` / `uploadLimitExceeded`: stop uploading, report which
  Shorts were not scheduled, and retry them the next run. Do not switch to another tool.
- Unaudited Google Cloud projects: YouTube may lock API uploads to private. After each upload,
  run `stats ID` a few minutes later; if `privacy` became private without a `publishAt`, or the
  video is missing, report it.
- Max file 256 GB; Shorts: vertical, ≤ 3 min.

## Workflow for a scheduled post

1. Confirm title, description, publish time and file with the user — except for the daily
   Which Life Next job, which has standing approval (see `CLAUDE.md`).
2. Check the slot is free: `python3 $YT scheduled` plus `social/youtube-schedule-log.md`.
3. Upload with `--publish-at`. Record the returned `id`.
4. Log a row in `social/youtube-schedule-log.md`: date scheduled, publish time (SGT + US Eastern),
   title, tool `Google Cloud (YouTube Data API)`, video ID. Commit and push.
