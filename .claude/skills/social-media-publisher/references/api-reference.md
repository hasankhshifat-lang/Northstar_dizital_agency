# Official API reference notes

Working notes for the three official APIs. **Verify against the live docs before relying on any
value here** — versions, quotas and limits change.

- YouTube Data API v3: https://developers.google.com/youtube/v3
- Meta Graph API (Pages): https://developers.facebook.com/docs/graph-api/ and
  https://developers.facebook.com/docs/pages-api/
- TikTok Content Posting API: https://developers.tiktok.com/doc/content-posting-api-get-started

---

## YouTube Data API v3

**Auth:** OAuth 2.0 (installed-app / desktop flow), refresh token stored locally.
Scopes: `https://www.googleapis.com/auth/youtube.upload` (upload) and
`https://www.googleapis.com/auth/youtube` or `youtube.readonly` (verify, thumbnails.set needs
`youtube` / `youtube.upload` / `youtube.force-ssl`).
Token refresh: `POST https://oauth2.googleapis.com/token` with `grant_type=refresh_token`.

**Upload (resumable):**
1. `POST https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status`
   - Headers: `Authorization: Bearer …`, `Content-Type: application/json; charset=UTF-8`,
     `X-Upload-Content-Length`, `X-Upload-Content-Type: video/*`
   - Body:
     ```json
     {
       "snippet": {"title": "…", "description": "…", "tags": ["…"], "categoryId": "22",
                   "defaultLanguage": "en", "defaultAudioLanguage": "en"},
       "status": {"privacyStatus": "private", "publishAt": "2026-11-04T00:00:00Z",
                  "selfDeclaredMadeForKids": false, "containsSyntheticMedia": false,
                  "embeddable": true, "license": "youtube"}
     }
     ```
   - Response `Location` header = session URI. **Save it on the task** so an interrupted upload
     can resume after a restart.
2. `PUT <session URI>` with the bytes (single request or chunks of multiples of 256 KiB with
   `Content-Range`).
3. On interruption: `PUT <session URI>` with `Content-Range: bytes */<total>` → `308` +
   `Range` header tells you where to resume.

**Scheduling rules:** `publishAt` only works when `privacyStatus` is `private`; it must be in the
future; format RFC 3339 / ISO 8601 UTC.

**Thumbnail:** `POST https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=<id>`
with the image bytes. JPEG/PNG (also GIF/BMP), ≤ 2 MB, 1280×720 recommended. Requires the channel
to be verified for custom thumbnails.

**Verify:** `GET https://www.googleapis.com/youtube/v3/videos?part=status,snippet,processingDetails&id=<id>`
→ check `status.uploadStatus` (`uploaded`/`processed`), `status.privacyStatus`,
`status.publishAt`, `snippet.thumbnails`.

**Quota:** default 10,000 units/day per project. Uploads and thumbnail sets are expensive — check
the current cost table at https://developers.google.com/youtube/v3/determine_quota_cost. On
`403 quotaExceeded` stop until the quota resets (midnight Pacific Time).

**Gotchas**
- API projects that haven't passed a YouTube API compliance audit have uploads **locked to
  private**. If a scheduled video stays private after `publishAt`, this is the likely cause.
- Comment settings cannot be set through `videos.insert`.
- Shorts are ordinary uploads (vertical, ≤ 3 min); there is no separate Shorts endpoint.
- Common errors: `401` (refresh token), `403 forbidden/insufficientPermissions` (scope, no retry),
  `400 invalidPublishAt`, `uploadLimitExceeded` (channel daily limit).

---

## Meta Graph API — Facebook Pages

Base: `https://graph.facebook.com/<version>/` (use the current version, e.g. `v2x.0`).
Video uploads may use `https://graph-video.facebook.com/<version>/`.

**Auth:** Page access token (from `GET /me/accounts` with a user token that has Page permissions;
exchange for long-lived tokens). Permissions: `pages_show_list`, `pages_read_engagement`,
`pages_manage_posts` (and `publish_video` where required). Apps in Live mode need App Review for
these permissions. Personal profiles cannot be published to via the API.

**Text / link post:** `POST /{page-id}/feed` — `message`, optional `link`.
Scheduled: `published=false`, `scheduled_publish_time=<unix seconds>`.

**Image post:** `POST /{page-id}/photos` — `url` (public) or multipart `source`, `caption`
(older docs: `message`). Scheduling: `published=false` + `scheduled_publish_time`.

**Video post:** `POST /{page-id}/videos` — `file_url` or multipart `source`, `title`,
`description`. Large files: resumable upload (`upload_phase=start` → `transfer` chunks →
`finish`) or the Resumable Upload API (`POST /{app-id}/uploads` → upload → use the file handle).
Scheduling: `published=false` + `scheduled_publish_time`.

**Reels:** `POST /{page-id}/video_reels`
1. `upload_phase=start` → returns `video_id` and `upload_url`.
2. `POST https://rupload.facebook.com/video-upload/<version>/<video_id>` with headers
   `Authorization: OAuth <page token>`, `offset: 0`, `file_size: <bytes>` and the bytes
   (or header `file_url: <public url>`).
3. `upload_phase=finish`, `video_id`, `video_state=PUBLISHED` (or `SCHEDULED` +
   `scheduled_publish_time`), `description`.
4. Poll `GET /{video_id}?fields=status` until `video_status` is `ready` and publishing is complete.
Reels specs (check docs): vertical 9:16, 3–90 s, MP4, ≥ 540×960 recommended.

**Scheduling window:** Meta requires `scheduled_publish_time` to be at least 10 minutes in the
future and within its maximum window (documented per endpoint — check). Outside that window, use
the local scheduler.

**Verify:** `GET /{post-id}?fields=id,permalink_url,is_published,scheduled_publish_time,created_time`
(videos: `GET /{video-id}?fields=permalink_url,status,published`).

**Gotchas**
- Use the Page token, not the user token, for posting.
- Error code `190` = token invalid/expired → `REQUIRES_AUTHORIZATION`. `200`/`10` = permission.
  `4`/`17`/`32`/`613` = rate limit → back off. `368` = blocked for policy → no retry.

---

## TikTok Content Posting API

Base: `https://open.tiktokapis.com/v2/`

**Auth:** OAuth 2.0 (Login Kit). Scopes: `video.publish` (direct post), `video.upload` (inbox /
draft), `user.info.basic`. Access tokens expire (~24 h); refresh with
`POST /v2/oauth/token/` `grant_type=refresh_token`.

**1. Creator info (required before every direct post):**
`POST /v2/post/publish/creator_info/query/` → `privacy_level_options`, `comment_disabled`,
`duet_disabled`, `stitch_disabled`, `max_video_post_duration_sec`, `creator_username`.

**2. Init direct post:** `POST /v2/post/publish/video/init/`
```json
{
  "post_info": {
    "title": "caption with #hashtags",
    "privacy_level": "PUBLIC_TO_EVERYONE",
    "disable_comment": false, "disable_duet": false, "disable_stitch": false,
    "video_cover_timestamp_ms": 1000,
    "brand_content_toggle": false, "brand_organic_toggle": false,
    "is_aigc": false
  },
  "source_info": {"source": "FILE_UPLOAD", "video_size": 12345678,
                  "chunk_size": 10000000, "total_chunk_count": 2}
}
```
→ `publish_id`, `upload_url`. (Or `"source": "PULL_FROM_URL", "video_url": …` from a domain
verified in the developer portal.)

**Inbox / draft:** `POST /v2/post/publish/inbox/video/init/` with only `source_info`; the creator
finishes posting in the TikTok app.

**3. Upload:** `PUT <upload_url>` per chunk with `Content-Type: video/mp4`,
`Content-Range: bytes <first>-<last>/<total>`. Chunk sizes: 5–64 MB (last chunk may be larger, up
to 128 MB); files < 5 MB go as a single chunk. Check current limits.

**4. Status:** `POST /v2/post/publish/status/fetch/` `{"publish_id": "…"}` → `status`:
`PROCESSING_UPLOAD`, `PROCESSING_DOWNLOAD`, `SEND_TO_USER_INBOX`, `PUBLISH_COMPLETE`, `FAILED`
(`fail_reason`). Public post IDs appear in `publicaly_available_post_id` (sic) when available.
Post URL: `https://www.tiktok.com/@<username>/video/<post_id>`.

**Gotchas**
- **Unaudited apps:** all direct posts are forced to `SELF_ONLY` (private), and there are caps on
  how many users can post. Public posting requires passing TikTok's audit.
- `privacy_level` must be one of the `privacy_level_options` returned for that creator.
- There is a per-creator daily post cap and a request rate limit; `spam_risk_too_many_posts` and
  `rate_limit_exceeded` mean stop and wait.
- No native scheduling — trigger the flow at `publish_at` from the local scheduler.
- TikTok's UX guidelines for apps require that the creator sees and consents to the post settings;
  APPROVAL mode is the way this skill meets that.
