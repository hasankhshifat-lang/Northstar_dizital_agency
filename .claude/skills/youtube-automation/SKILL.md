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
- Check the token's scopes with `python3 $YT scopes`.
  - `youtube.upload` + `youtube.readonly`: upload (public now, or private + `publishAt`), set a
    thumbnail, list own uploads (including private/scheduled), read stats.
  - `youtube.force-ssl` (owner asked for this 2026-11-03): also edit title/description/tags/schedule/
    privacy, delete videos, read and reply to comments. `update`/`delete`/`comments`/`reply` refuse
    with a clear error until the token has it.
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

Management (needs `youtube.force-ssl`):
```bash
python3 $YT update ID --title "…" --description-file d.txt --tags "a,b"   # edit metadata
python3 $YT update ID --publish-at 2026-11-05T01:00:00Z                     # reschedule
python3 $YT update ID --privacy public|private|unlisted                     # change visibility now
python3 $YT comments 30                                                     # newest comments + thread IDs
python3 $YT reply THREAD_ID "Thanks for watching!"
python3 $YT delete ID --confirm      # ONLY when the user explicitly asked to delete that video
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

## Re-authorising (owner does this; never ask for tokens in chat)

1. Google Cloud Console → APIs & Services → OAuth consent screen → Data access: add scope
   `https://www.googleapis.com/auth/youtube.force-ssl` (keep `youtube.upload` and `youtube.readonly`).
2. Credentials → the OAuth client used for `YT_CLIENT_ID` → add authorised redirect URI
   `https://developers.google.com/oauthplayground` (Web client), then open the OAuth 2.0 Playground,
   ⚙ → "Use your own OAuth credentials" → paste the client ID/secret there.
3. Authorise these three scopes, signed in as the Which Life Next channel's Google account:
   `youtube.force-ssl`, `youtube.upload`, `youtube.readonly` → "Exchange authorization code for tokens".
4. Copy the refresh token into the environment settings as `YT_REFRESH_TOKEN` (replace the old value).
   If the consent screen is in "Testing", refresh tokens expire after 7 days — publish the app to
   "In production" to keep it working.
5. In a new session: `python3 $YT scopes` should list `youtube.force-ssl`.
