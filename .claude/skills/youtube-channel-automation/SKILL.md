---
name: youtube-channel-automation
description: "Manage the Which Life Next YouTube channel (@whichlifenext, UCPTrW0n3ONI9uU4WetWwFCQ) directly through the YouTube Data API with the agency's own Google Cloud OAuth client: upload, schedule, edit titles/descriptions/tags/privacy/publish time, set thumbnails, add to playlists, read and reply to comments (including auto comment replies in scheduled tasks), check status and analytics. Use for ANY YouTube channel task. Never route YouTube work through Clawlink or Metricool."
---

# YouTube channel automation (own Google Cloud client)

All YouTube channel work goes **straight to the YouTube API** with `yt.py` in this folder.
Do **not** use Clawlink or Metricool for YouTube, in chat or in scheduled tasks.

## Connection

- Google Cloud project `168994544641`, OAuth client from the environment:
  `YT_CLIENT_ID`, `YT_CLIENT_SECRET`, `YT_REFRESH_TOKEN`. `yt.py` turns the refresh token into
  an access token on each run. Never print, log or commit these values.
- Channel: **Which Life Next** (`@whichlifenext`), ID `UCPTrW0n3ONI9uU4WetWwFCQ`.
- Granted scopes: `youtube.force-ssl` (manage videos, comments, playlists, captions, channel),
  `youtube.upload`, `youtube.readonly`.
- Not yet available: YouTube Analytics (API not enabled in the project, and the refresh token
  lacks `yt-analytics.readonly`). Until fixed, `yt.py analytics` returns 403; say so and use vidIQ.
- Quota: the project's own 10,000 units/day (an upload is ~100 units, a comment reply 50,
  a list call 1). If the quota is exhausted, say so and stop; do not fall back to Clawlink/Metricool.
- Check the connection first if anything looks off: `python3 yt.py whoami`.

Run from the repo root: `python3 .claude/skills/youtube-channel-automation/yt.py <command>`.

## Never delete on your own

Do not delete videos, comments or playlists unless the user explicitly asks to delete that item
in the current request. `yt.py` has no delete command on purpose.

## Publishing and scheduling

Confirm the title, description, publish time and video file with the user before uploading
(skip only if the request already states all of them explicitly).

```bash
yt.py upload /path/video.mp4 --title "TITLE" --description "DESC" --tags "a,b" \
  --publish-at 2026-11-05T10:00:00Z
```
- `--publish-at` (RFC 3339, UTC) uploads as `private` and YouTube makes it public at that time.
  Convert the user's time explicitly, e.g. `date -u -d 'TZ="Asia/Singapore" 2026-11-05 18:00' +%FT%TZ`,
  and show both UTC and local time back to the user.
- Without `--publish-at`, add `--privacy public` to publish now (default is `private`).
- Shorts: vertical video ≤ 3 min; add `#shorts` to the title or description.
- Log every upload/schedule in `social/youtube-schedule-log.md`, then commit and push.

## Editing

`yt.py update VIDEO_ID [--title] [--description] [--tags] [--privacy] [--publish-at] [--category]`
changes only the given fields and keeps the rest. Reschedule a scheduled video with `--publish-at`.
Thumbnail: `yt.py thumbnail VIDEO_ID image.jpg` (JPG/PNG, ≤ 2 MB, 1280×720 recommended).
Playlist: `yt.py playlist-add PLAYLIST_ID VIDEO_ID`.
Check: `yt.py videos --max 10`, `yt.py video VIDEO_ID`.
Log every edit in the log file.

## Thumbnails (always, for every new video)

Use the map-style thumbnail from `social/thumbnails/make_thumbnails.py` (same illustrated map look as the
Shorts: parchment land, teal water, tan state highlight, rust route, red pins, dark tags, 2–4 word hook in
white + gold that doesn't repeat the title).
- Shorts: 9:16 1080×1920 → add a `v_*` function to `VERTICAL`, run `make_thumbnails.py --vertical VIDEO_ID`.
- Long-form: 16:9 1280×720 → add a `t_*` function to `VIDEOS`, run `make_thumbnails.py VIDEO_ID`.
- Check the image, then `yt.py thumbnail VIDEO_ID social/thumbnails/<file>.jpg`, log it, update
  `social/thumbnails/README.md`, commit and push. After an upload, do this as part of the same task.

## Comment replies (manual or in a scheduled task)

1. `yt.py comments --unanswered` lists top-level comments on the channel that the channel has
   not replied to (own comments excluded). Add `--video ID` for one video.
2. For each comment, write a short, friendly, on-topic reply in the commenter's language,
   in the channel's voice (history / "what if" storytelling). One reply per comment.
3. **Skip** (no reply, just log as skipped): spam, links/self-promotion, abuse, hate,
   sexual content, scams, and anything needing a factual claim you are not sure of.
   Never promise anything, share personal info, or argue.
4. Post: `yt.py reply THREAD_ID "text"`.
5. Max **20 replies per run** (quota and spam safety).
6. Log each reply/skip in `social/youtube-comments-log.md` (date, video ID, author, comment
   excerpt, reply or skip reason, reply ID), then commit and push.

In a scheduled task, run this flow without asking for confirmation for each reply, but follow
the skip rules strictly. Report a summary at the end (replied / skipped / errors).

## Analytics

Per `CLAUDE.md`, use vidIQ first. The YouTube Analytics API through this project is the fallback
once it is enabled: `yt.py analytics 2026-10-01 2026-11-01 [--metrics ...] [--dimensions day]`.
