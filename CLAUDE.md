# Northstar Digital Agency — Claude instructions

## YouTube: always use the youtube-channel-automation skill (own Google Cloud client)

For any YouTube channel task (uploading, scheduling, editing titles/descriptions/tags/privacy/
publish time, thumbnails, playlists, reading and replying to comments, auto comment replies in
scheduled tasks, checking status), use `.claude/skills/youtube-channel-automation/SKILL.md`.
- Call the YouTube API directly with the agency's Google Cloud OAuth client
  (`YT_CLIENT_ID` / `YT_CLIENT_SECRET` / `YT_REFRESH_TOKEN`, project `168994544641`).
- **Do not use Clawlink or Metricool for YouTube anymore**, in chat or in scheduled tasks,
  not even as a fallback. If the API fails or the quota is used up, say so and stop.
- Confirm the title, description, publish time, and video file with the user before uploading.
- Never delete a video, comment or playlist unless the user explicitly asks for that deletion.
- Log uploads/schedules/edits in `social/youtube-schedule-log.md` and comment replies in
  `social/youtube-comments-log.md`, then commit and push.

## YouTube thumbnails: always the map-style thumbnail

Every new video gets a custom thumbnail. Follow `.claude/skills/youtube-thumbnail-creator/SKILL.md`:
read the full script first (`social/scripts/<VIDEO_ID>.md`, or ask for it), pick one story angle, write three
heading options and choose the clearest. Render it with `social/thumbnails/make_thumbnails.py` in the
channel's illustrated map style (the same look as the maps inside the Shorts):
- Parchment/cream land, teal water and rivers, thin state lines, the story's state filled in tan,
  rust-red route with white waypoint dots, red teardrop pins, dark label tags, dark date tag with gold text.
- A clear, specific heading (2–6 words, Anton font, white + gold) that adds to the title and never repeats it.
  Don't force dramatic words; curiosity about the actual story, never a misleading claim.
- **Shorts: 9:16, 1080×1920** (`--vertical`, file `<VIDEO_ID>_9x16.jpg`): date tag and hook at the top,
  map focus in the middle, bottom ~400 px kept clear for YouTube's title overlay.
- Long-form videos: 16:9, 1280×720 (`<VIDEO_ID>.jpg`), hook on the left, map on the right.
- Add a function for the new video in `make_thumbnails.py` (`VERTICAL` for Shorts, `VIDEOS` for long-form),
  render it, look at the result, then set it with `yt.py thumbnail VIDEO_ID FILE` and log it in
  `social/youtube-schedule-log.md`. Update `social/thumbnails/README.md`, then commit and push.

## YouTube analysis: use vidIQ

For any YouTube analysis (channel or video performance, keyword and topic research, competitor
channels, titles, tags, best posting times, outlier videos), use the **vidIQ** connector first.
- Fall back to the YouTube Analytics API through the youtube-channel-automation skill
  (`yt.py analytics`) only when vidIQ is not connected, is out of credits, or has no tool for the question.
  Do not use Clawlink or Metricool analytics. Say which source was used.
- If vidIQ is not connected, tell the user it needs to be authorized in claude.ai connector
  settings before using the fallback.

## Facebook Page: always use the facebook-page-automation skill

For any NorthStar Dizital Facebook Page task (uploading videos/Reels, posting, scheduling,
deleting, timed takedowns, checking status), use `.claude/skills/facebook-page-automation/SKILL.md`.
- Call the Graph API directly (`graph.facebook.com` / `graph-video.facebook.com`, credential
  injected by the proxy). Do not use Clawlink or Metricool for the Facebook Page.
- Never delete an uploaded video or post unless the user explicitly asks for that deletion.
- Log every action in `social/facebook-page-log.md`, then commit and push.

## Web research: always use the Agent Reach skill

For research on any website (search, reading pages/posts, comments, transcripts, social platforms
such as X/Twitter, Reddit, YouTube, GitHub, LinkedIn, Instagram, Facebook), use the **Agent Reach**
skill (`agent-reach`, https://github.com/Panniantong/Agent-Reach). Say "Using agent-reach skill" first.
- If `agent-reach` is not installed, install it only from GitHub, never from PyPI (the PyPI package
  named `agent-reach` is a different project):
  `uv tool install https://github.com/Panniantong/Agent-Reach/releases/latest/download/agent-reach.zip`
  then `agent-reach setup`. This needs the user's permission to run downloaded code.
- The cloud environment's setup script (Default environment) installs it with all channels at session
  start. Binary is at `~/.local/bin/agent-reach` (add it to PATH). If a fresh session lacks it, rerun that
  block. Cloud notes: GitHub's API is blocked here, so the OpenCLI browser extension is placed by hand from
  `github.com/jackwener/OpenCLI/releases/download/v2.0.3/opencli-extension-v1.0.27.zip` into
  `~/.agent-reach/browser/extension`; GitHub repo reading only works for this session's own repo.
- X/Twitter, LinkedIn and Instagram need the user's own login; Reddit blocks cloud servers. On
  `NEED_LOGIN`, `RATE_LIMITED` or `PLATFORM_BLOCKED`, stop, tell the user, and use the fallback below.
- Usage: `agent-reach channels`, `agent-reach read <url>`, `agent-reach <channel> <action> [args]`.
- Read-only: never post, comment, like or message through it; never log in for the user or ask for passwords.
- If it cannot be installed or a channel fails, say so, then fall back to the built-in web search/fetch tools
  and say which source was used.
