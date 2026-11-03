# Northstar Digital Agency — Claude instructions

## YouTube: always Google Cloud (YouTube Data API) — never Clawlink or Metricool

Owner rule (2026-11-03): every YouTube upload, scheduled post and management task (listing
scheduled posts, status, view counts) goes through the owner's own Google Cloud OAuth client,
using `.claude/skills/youtube-automation/SKILL.md` (helper `yt.py`). **Do not use Clawlink or
Metricool for YouTube.** The old Clawlink/Metricool rotation is retired.

1. Schedule: `yt.py upload FILE --publish-at <UTC>` (uploads private; YouTube makes it public then).
2. Log a row in `social/youtube-schedule-log.md` (date scheduled, publish time, title,
   tool `Google Cloud (YouTube Data API)`, video ID), then commit and push.
3. If the Google Cloud upload fails (missing env vars, token error, quota), stop and report it.
   Do not fall back to another tool.

Confirm the title, description, publish time, and video file with the user before scheduling.

## YouTube analysis: use vidIQ

For any YouTube analysis (channel or video performance, keyword and topic research, competitor
channels, titles, tags, best posting times, outlier videos), use the **vidIQ** connector first.
- Fall back to YouTube Analytics through Clawlink (`youtube` / `query_analytics`), or Metricool
  analytics, only when vidIQ is not connected or has no tool for the question. Say which source
  was used.
- If vidIQ is not connected, tell the user it needs to be authorized in claude.ai connector
  settings before using a fallback.

## Facebook Page: always use the facebook-page-automation skill

For any NorthStar Dizital Facebook Page task (uploading videos/Reels, posting, scheduling,
deleting, timed takedowns, checking status), use `.claude/skills/facebook-page-automation/SKILL.md`.
- Call the Graph API directly (`graph.facebook.com` / `graph-video.facebook.com`, credential
  injected by the proxy). Do not use Clawlink or Metricool for the Facebook Page.
- Never delete an uploaded video or post unless the user explicitly asks for that deletion.
- Log every action in `social/facebook-page-log.md`, then commit and push.
