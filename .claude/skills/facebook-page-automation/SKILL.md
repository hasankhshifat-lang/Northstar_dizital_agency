---
name: facebook-page-automation
description: "Manage the NorthStar Dizital Facebook Page directly through the Graph API: upload videos/Reels, post photos, text and links, schedule posts for a later time, delete posts only when explicitly asked, and check post/video status. Use for ANY Facebook Page task: 'upload to FB page', 'post on Facebook', 'schedule a Facebook post', 'delete the FB post', 'delete after N minutes', 'FB page automation'. Never route Facebook Page work through Clawlink or Metricool."
---

# Facebook Page automation (direct Graph API)

All Facebook Page work goes **straight to the Graph API** with `curl`. Do not use Clawlink,
Metricool or any other posting tool for the Page.

## Connection

- The agent proxy injects the credential for `graph.facebook.com`, `graph-video.facebook.com`
  and `rupload.facebook.com`. Never put an `access_token` in the request and never ask the user for one.
- The injected token is a **Page token** for **NorthStar Dizital**, Page ID `1390585830800081`.
  `/me/accounts` does not work with it (there is no user behind it); use `/me` or the Page ID.
- Check the connection first if anything looks off:
  `curl -sS "https://graph.facebook.com/v21.0/me?fields=id,name"`
- API version: `v21.0`.

## Never delete on your own

Uploaded videos and posts **stay up**. Do not delete anything, and do not set up a timed
takedown, unless the user explicitly asks to delete that specific post in the current request.
(The 2026-11-03 "delete after 2 minutes" run was a one-off test, not a standard step.)

## Before posting

Confirm with the user: the file (or text/link), the caption/title, and when it should go live.
If the user has already given all of this explicitly in the request, go ahead.
If no title is given, use a clean version of the file name and say so.

## Actions

Set `PAGE=1390585830800081`.

### Upload a video (published now)
```bash
curl -sS --max-time 600 -X POST "https://graph-video.facebook.com/v21.0/$PAGE/videos" \
  -F "source=@/path/video.mp4;type=video/mp4" \
  -F "title=TITLE" -F "description=CAPTION" -F "published=true"
```
Returns `{"id":"VIDEO_ID"}`. Facebook then processes it; check with
`GET /VIDEO_ID?fields=id,permalink_url,status`. Vertical short videos come out as Reels
(`permalink_url` starts with `/reel/`).

### Schedule a video or post for later
Add `published=false` and `scheduled_publish_time=<unix seconds>`. The time must be
**at least 10 minutes and at most 30 days** ahead. Convert the user's time explicitly
(e.g. `date -u -d '2026-11-05 18:00 Asia/Singapore' +%s` – use `TZ=` if needed) and show
the UTC and local time back to the user.
```bash
curl -sS -X POST "https://graph-video.facebook.com/v21.0/$PAGE/videos" \
  -F "source=@/path/video.mp4;type=video/mp4" -F "title=TITLE" -F "description=CAPTION" \
  -F "published=false" -F "scheduled_publish_time=UNIX_TS"
```
Text/link post: `POST /$PAGE/feed` with `message`, optional `link`, same two scheduling fields.
Photo: `POST /$PAGE/photos` with `source=@file` (or `url=`) and `caption`, same scheduling fields.
List scheduled posts: `GET /$PAGE/scheduled_posts`.

### Text / link / photo now
- `POST /$PAGE/feed` with `message=...` (and `link=...`).
- `POST /$PAGE/photos` with `source=@file.jpg` and `caption=...`.

### Delete (only when the user explicitly asks)
`curl -sS -X DELETE "https://graph.facebook.com/v21.0/OBJECT_ID"` → `{"success":true}`.
Verify: `GET /OBJECT_ID?fields=id` must now return error code 100 / subcode 33.

### Timed takedown (only when the user explicitly asks, e.g. "delete after N minutes")
Run in the background so the session stays free, and report the result when it finishes:
```bash
sleep $((N*60)); curl -sS -X DELETE "https://graph.facebook.com/v21.0/OBJECT_ID"; date -u; \
curl -sS "https://graph.facebook.com/v21.0/OBJECT_ID?fields=id"
```
(Bash `run_in_background: true`.) For delays longer than ~1 hour, use a scheduled task /
`send_later` reminder that runs the DELETE instead of a long sleep. Note in the report
whether the video had finished processing before it was removed (if it was still
processing, it was most likely never visible to the public).

### Status and insights
- `GET /OBJECT_ID?fields=id,permalink_url,status,created_time`
- `GET /$PAGE/videos?fields=id,title,created_time,permalink_url`
- `GET /$PAGE/posts?fields=id,message,created_time,permalink_url`

## Log every action

Add a row to `social/facebook-page-log.md` for each upload, scheduled post and deletion
(date, action, title, object ID, publish/delete time, result), then commit and push.

## Report back

Tell the user: what was posted, the object ID, the publish time (UTC and Asia/Singapore),
the permalink once available, and for takedowns the confirmed deletion time.
If a call fails, show the Graph API error message and say what you'll try next.
