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

## YouTube + Facebook thumbnails: always made in Figma, map style

Every new YouTube video **and every Facebook Page video/Reel** gets a custom thumbnail, and it is **designed in
Figma only** (Figma connector: `use_figma`, `get_screenshot`, `download_assets`). Don't use other design or
image tools for thumbnails: no `make_thumbnails.py`/PIL rendering, Canva, Higgsfield, vidIQ thumbnail generator,
AI image generators, Spline etc. If Figma is not connected or fails, say so and stop.
Follow `.claude/skills/youtube-thumbnail-creator/SKILL.md`:
read the full script first (`social/scripts/<VIDEO_ID>.md`, or ask for it), pick one story angle, write three
heading options and choose the clearest. Build it in the Figma file "NorthStar Thumbnails" (one frame per video,
named `<VIDEO_ID>` / `<VIDEO_ID>_9x16` / `fb_<FB_VIDEO_ID>`) in the same illustrated map style as last time
(the existing thumbnails in `social/thumbnails/` are the reference):
- Parchment/cream land, teal water and rivers, thin state lines, the story's state filled in tan,
  rust-red route with white waypoint dots, red teardrop pins, dark label tags, dark date tag with gold text.
- A clear, specific heading (2–6 words, Anton font, white + gold) that adds to the title and never repeats it.
  Don't force dramatic words; curiosity about the actual story, never a misleading claim.
- **Shorts / Facebook Reels: 9:16, 1080×1920** (file `<VIDEO_ID>_9x16.jpg`): date tag and hook at the top,
  map focus in the middle, bottom ~400 px kept clear for the title/caption overlay.
- Long-form YouTube and Facebook feed videos: 16:9, 1280×720 (`<VIDEO_ID>.jpg`), hook on the left, map on the right.
- Look at the Figma screenshot, fix anything off, then export the frame from Figma (`download_assets`,
  JPG/PNG at scale 1) into `social/thumbnails/` (Facebook: `fb_<FB_VIDEO_ID>.jpg` / `fb_<FB_VIDEO_ID>_9x16.jpg`).
- YouTube: set it with `yt.py thumbnail VIDEO_ID FILE` and log it in `social/youtube-schedule-log.md`.
  Facebook: set it through the Graph API (facebook-page-automation skill, "Thumbnail") and log it in
  `social/facebook-page-log.md`. Add the row (with the Figma frame link) to `social/thumbnails/README.md`, then commit and push.

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

## 3D animation: use the blender-3d-animation skill

For 3D animations, 3D logo reveals, product turntables, animated 3D text or any Blender render, use
`.claude/skills/blender-3d-animation/SKILL.md`. It installs the official Blender LTS build headless
(`scripts/install_blender.sh`), builds scenes in Python with `scripts/bl_helpers.py`, and renders MP4
(16:9 or 9:16), PNG stills or PNG sequences. Always check a still and a `--preview` render before the
slow full-quality render.

## three.js / web 3D: use the threejs skill

For three.js scenes, interactive 3D on websites, WebGL/WebGPU effects, TSL shaders, GLTF viewers or
browser-rendered 3D clips, use `.claude/skills/threejs/SKILL.md`. Read `references/llms.txt` (official
three.js LLM docs, r187) before writing code, start from `templates/scene.html`, and export with
`scripts/render.mjs` (check a still and a `--preview` render before the full one). For offline
photoreal renders use the blender-3d-animation skill instead.
