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

## TikTok: repost every YouTube video right after it goes public

Account: Which Life Next (@whichlifenext), via Clawlink `tiktok`. Log: `social/tiktok-post-log.md`.

1. No hourly polling. Check only at publish times: whenever a YouTube post is scheduled (or found scheduled in
   Metricool / YouTube), set a one-time check-in (`send_later`) for about 5 minutes after its publish time. At the
   check-in, confirm it is public (`youtube` → `list_channel_videos`, channel `UCPTrW0n3ONI9uU4WetWwFCQ`); if not yet,
   check again 15 minutes later.
2. Find its file in Google Drive folder `1kAnmt3gXTQ_iuYWXdTNHoOw5Gu2slDr4` (match by the Drive file named in
   `social/youtube-schedule-log.md`, else by name/topic; ask the user if unsure). Stage it with `google-drive` →
   `download_file`, which returns a claw-link.dev URL for `tiktok` → `publish_video`.
3. Caption: a **short** version of the YouTube post (see "Short descriptions" below): the hook from the title and
   description, a short AI-narration note, and 3–5 hashtags taken from the YouTube tags (no `#Shorts`).
4. TikTok rules: call `query_creator_info`, then send the user the summary (account, file, caption, who can view,
   comments, duet, stitch, branded content, AI label) ending with "By posting, you agree to TikTok's Music Usage
   Confirmation." Post only after the user says yes. Never reuse an earlier post's settings without asking.
5. After posting, check `fetch_publish_status`, add a row to the TikTok log, commit and push.

When scheduling a YouTube post, put the Drive file name in the YouTube log so step 2 can match it.

## Short descriptions for Shorts and TikTok

The user wants **short descriptions** on every YouTube Short and every TikTok post:

- YouTube Short: 1–2 sentence hook, the full-video link, a one-line "AI narration" + source note, then
  `#Shorts` plus 2 topic hashtags. Aim for about 300 characters or less.
- TikTok: 1–2 sentence hook, "AI narration.", then 3–5 hashtags. Aim for about 150 characters plus hashtags.
  No long source lists (links are not clickable on TikTok).
- Long-form YouTube videos keep their full description with sources.
