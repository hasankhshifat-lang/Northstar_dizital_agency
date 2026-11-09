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

## YouTube thumbnails: always the Figma story-picture thumbnail (user's standing rule, 2026-11-09)

Every new video (Short or long-form) gets a custom thumbnail in the **hero style made with Figma**: a viewer
must understand what the video is about from the thumbnail alone, and it must be attractive. A map by itself
is not enough. Follow `.claude/skills/youtube-thumbnail-creator/SKILL.md`:
- Read the full script first (`social/scripts/<VIDEO_ID>.md`, YouTube captions, or ask), pick one story angle,
  write three heading options and choose the clearest.
- **Picture: always generate it with Figma's image AI** (Figma MCP `generate_image`, model `gpt-image-2.5-flare`,
  file "Which Life Next – Shorts thumbnail art" `YLi5kQtUtNyvaAsNNsDM4y`, team `team::1697353188971902501`;
  call `create_session` first). A painted, cinematic illustration of the one moment the angle is about, in the
  channel palette (amber/parchment, deep teal, rust red), no text in the image, no close-up faces (people small
  or from behind), historically accurate. Add the prompt to `ART` in `social/thumbnails/gen_art.py`, download the
  PNG right away (the Figma URL expires in 7 days) to `social/thumbnails/art/<VIDEO_ID>.png`.
  If Figma refuses (no AI credits, not connected), say so and ask; don't fall back to a map-only thumbnail.
- **Heading:** 2–6 words, Anton, white + gold, says in plain words what happened (e.g. THESE TANKS ARE FAKE,
  27 HOURS IN THIS BOX); never a copy of the title, never misleading.
- **Channel signature:** dark date tag with gold text and a small parchment map card (pin + place tag, route
  if there is one). Ring/arrow on the key detail when it is small in the picture.
- **Shorts: 9:16, 1080×1920** (`--vertical`, `<VIDEO_ID>_9x16.jpg`): date tag + heading at the top, subject in
  the middle, map card in a free corner, bottom ~400 px clear for YouTube's title overlay.
- **Long-form: 16:9, 1280×720** (`<VIDEO_ID>.jpg`): generate the picture landscape (2048×1152), heading on the
  left, subject on the right, map card in a free corner.
- Add a function in `make_thumbnails.py` (`hero_base` + `inset_map` + `callout`; `VERTICAL` for Shorts,
  `VIDEOS` for long-form), render, look at it full size and at phone size, fix overlaps, then set it with
  `yt.py thumbnail VIDEO_ID FILE`, log it in `social/youtube-schedule-log.md`, update
  `social/thumbnails/README.md`, commit and push.

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
