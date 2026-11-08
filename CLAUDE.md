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

## Token budget: switch to free LLM APIs at 95% usage

When Claude's token usage reaches **95%** (the session/plan usage limit, or the context window
is nearly full, or the user says usage is at 95%), hand the heavy text-generation work to a free
LLM API instead of writing it with Claude:
- Run `python3 tools/free_llm.py "<prompt>"` (stdin: `-`, attach files with `--file PATH`,
  optional `--system`). It tries Groq (`openai/gpt-oss-120b`) → Gemini (`gemini-3.5-flash`) →
  OpenRouter (`google/gemma-4-31b-it:free`) and prints the first answer. Keys are injected by the
  proxy; no key in code.
- Offload: drafts, rewrites, summaries of long files/scripts, title/description/tag ideas,
  comment-reply drafts, translations, bulk copy. Keep Claude for tool calls, file edits, commits,
  and final checks; review the free model's output before using or publishing it.
- Never send secrets, credentials, or private user data to the free APIs.
- Say in the reply that the free LLM was used and which provider answered (printed on stderr).
- If every provider fails, say so and continue with Claude only if usage allows.
