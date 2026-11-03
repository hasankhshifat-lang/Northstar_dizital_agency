# Queue, metadata and history schemas

All paths inside these files are relative to the content root (default `social-media/`).
Times without an offset are interpreted in the queue's `timezone` (or the task's own `timezone`).

## `schedule/publishing-calendar.json`

```json
{
  "timezone": "Asia/Singapore",
  "mode": "APPROVAL",
  "tasks": [ { "...task..." } ]
}
```

### Task

| Field | Req. | Notes |
|---|---|---|
| `id` | yes | Stable unique ID, e.g. `yt-2026-11-04-video01`. Never reused. |
| `platform` | yes | `youtube` · `facebook` · `tiktok` |
| `format` | FB/TT | Facebook: `video` · `reel` · `image` · `text`. TikTok: `direct` · `inbox`. |
| `media` | yes* | Path to the video/image (*not for Facebook `text`). |
| `thumbnail` | YT | Path to the custom thumbnail. |
| `metadata` | yes | Path to the platform metadata JSON. |
| `publish_at` | yes | ISO 8601 local time, or `"now"` for explicit immediate publishing. |
| `timezone` | no | IANA name; overrides the queue default. |
| `status` | yes | `PENDING` `VALIDATING` `SCHEDULED` `UPLOADING` `PROCESSING` `PUBLISHED` `FAILED` `CANCELLED` `REQUIRES_AUTHORIZATION` |
| `approved` | no | `true` once the user has approved this task. |
| `fingerprint` | auto | sha256 of platform+media+publish_at; set by `queue.py`. |
| `attempts` | auto | Number of execution attempts. |
| `upload_session` | auto | Resumable session URI / TikTok `publish_id` / FB `video_id` for resuming. Not a secret, but never contains tokens. |
| `result` | auto | `{platform_id, url, thumbnail_status, publish_time_utc, verified_at}` |
| `error` | auto | `{type, message, retryable, at}` |

## Metadata files

### `youtube/metadata/<name>.json`
```json
{
  "title": "…",
  "description": "…",
  "tags": ["…"],
  "hashtags": ["#…"],
  "category_id": "22",
  "language": "en",
  "privacy": "public",
  "made_for_kids": false,
  "ai_disclosure": {"contains_synthetic_media": false, "reason": "AI used for script only"},
  "approved": false
}
```
`privacy` is the state *after* publishing; scheduling sets `private` + `publishAt` automatically.

### `facebook/metadata/<name>.json`
```json
{
  "page_id": "1234567890",
  "caption": "…",
  "hashtags": ["#…"],
  "title": "…",
  "link": null,
  "ai_disclosure": {"ai_generated": false},
  "approved": false
}
```

### `tiktok/metadata/<name>.json`
```json
{
  "caption": "… #tag1 #tag2",
  "hashtags": ["#tag1", "#tag2"],
  "privacy_level": "PUBLIC_TO_EVERYONE",
  "disable_comment": false,
  "disable_duet": false,
  "disable_stitch": false,
  "cover_timestamp_ms": 1000,
  "is_aigc": false,
  "brand_content": false,
  "brand_organic": false,
  "approved": false
}
```

## `logs/publishing-history.json`

Append-only JSON array. One entry per significant status change:

```json
{
  "at": "2026-11-04T00:03:12Z",
  "task_id": "yt-2026-11-04-video01",
  "platform": "youtube",
  "content": "video01",
  "status": "SCHEDULED",
  "publish_time_local": "2026-11-04T08:00:00+08:00",
  "platform_id": "dQw4w9WgXcQ",
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "thumbnail_status": "set",
  "error": null
}
```
