---
name: facebook-page-automation
description: "Manage the Facebook Pages (Which Life Next, NorthStar Dizital and any other Page assigned to the KH Shifat system user) directly through the Graph API: upload videos/Reels, post photos, text and links, schedule posts for a later time, delete posts only when explicitly asked, and check post/video status. Use for ANY Facebook Page task: 'upload to FB page', 'post on Facebook', 'schedule a Facebook post', 'delete the FB post', 'delete after N minutes', 'FB page automation'. Never route Facebook Page work through Clawlink or Metricool."
---

# Facebook Page automation (direct Graph API)

All Facebook Page work goes **straight to the Graph API** with `curl`. Do not use Clawlink,
Metricool or any other posting tool for the Page.

## Connection (System User token, multiple Pages)

- The agent proxy injects a **System User token** ("KH Shifat", ID `122097505353541636`,
  app Northstar Dizital Automation `2118347298772895`) for `graph.facebook.com`,
  `graph-video.facebook.com` and `rupload.facebook.com`. Never ask the user for a token.
- Managed Pages (whatever is assigned to the system user in Business Settings):

  | Page | Page ID | Log |
  |---|---|---|
  | Which Life Next (same name as the YouTube channel) | `1342776542260801` | `social/facebook-whichlifenext-log.md` |
  | NorthStar Dizital | `1390585830800081` | `social/facebook-page-log.md` (needs to be assigned to the system user again) |

  List what is reachable right now: `curl -sS "https://graph.facebook.com/v21.0/me/accounts?fields=id,name,tasks"`.
  Ask which Page if the user does not name one.
- **Page actions need that Page's own token.** The system token alone gets
  `User access token is not supported` (code 190 / subcode 2069032). Fetch the Page token at
  runtime into a shell variable and pass it as `access_token` (the proxy leaves it alone):
  ```bash
  PAGE=1342776542260801
  PT=$(curl -sS "https://graph.facebook.com/v21.0/$PAGE?fields=access_token" \
       | python3 -c 'import sys,json;print(json.load(sys.stdin)["access_token"])')
  ```
  **Never print, log, echo or commit `$PT`.** Fetch it again in each new shell.
- Check the connection: `curl -sS "https://graph.facebook.com/v21.0/me?fields=id,name&access_token=$PT"`
  should return the Page name.
- API version: `v21.0`.

In every command below, add `access_token=$PT` (as `-F "access_token=$PT"` for POST forms,
or `?access_token=$PT` / `&access_token=$PT` in GET/DELETE URLs).

## Never delete on your own

Uploaded videos and posts **stay up**. Do not delete anything, and do not set up a timed
takedown, unless the user explicitly asks to delete that specific post in the current request.
(The 2026-11-03 "delete after 2 minutes" run was a one-off test, not a standard step.)

## Before posting

Confirm with the user: the file (or text/link), the caption/title, and when it should go live.
If the user has already given all of this explicitly in the request, go ahead.
If no title is given, use a clean version of the file name and say so.

## Actions

Set `PAGE` to the chosen Page ID and fetch `$PT` as above.

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

Add a row to that Page's log (see the table above) for each upload, scheduled post and deletion
(date, action, title, object ID, publish/delete time, result), then commit and push.

## Report back

Tell the user: what was posted, the object ID, the publish time (UTC and Asia/Singapore),
the permalink once available, and for takedowns the confirmed deletion time.
If a call fails, show the Graph API error message and say what you'll try next.
