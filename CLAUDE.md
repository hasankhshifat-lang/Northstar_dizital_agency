# Northstar Digital Agency — Claude instructions

## Video topics and scripts: read the scriptwriting rules first

Before choosing a topic or writing/editing any script for a YouTube video (long-form or Short) **or a
Facebook Page video/Reel**, read `docs/content/scriptwriting-rules.md` and follow it.
- Prepare the topic research report and score the topic out of 100 (section 2.G–H) before writing;
  reject topics below 65 unless there is a stated strategic reason.
- If the user supplied a topic, evaluate it and suggest a stronger angle if needed, but never silently replace it.
- Hook in the first 5 seconds, 4-act structure for long-form, the Shorts/Reels timing for vertical videos.
- Accuracy over drama: no invented quotes, evidence or events; label speculation.
- Run the topic and script checklists (section 15) before handing over a script, and save it in
  `social/scripts/<VIDEO_ID>.md` (or `<working-title>.md`).

## Every video: animation direction, storyboard and learning (default for all generated videos)

For every video we make (YouTube long-form/Shorts, Facebook Page videos/Reels, both channels), in chat and in
every scheduled task, read and follow `docs/content/animation-direction-rules.md` (owner, 2026-11-13).
- Work as animation director, cinematographer, storyteller and data analyst: every movement, scene and camera
  move needs a purpose; believable hand-object contact; characters react to each other; no "character stands
  and talks in front of a background"; no random zooms or filler motion.
- **Storyboard before animating** (scene purpose, positions, actions, object contact, shot + camera reason,
  SFX cue) and run the scene inspection (section 7.3) before the final render. Never hide defects with effects.
- Keep the two brands separate: Which Life Next (US history) and Scientific Bithi (Bangla comic science) have
  their own styles and their own learning databases, `social/learning/which-life-next.md` and
  `social/learning/scientific-bithi.md`. Never mix their lessons.
- Read the channel's learning database before a new video; add a row after each published video; change one
  variable at a time for experiments; no conclusions from one video. Use real metrics only.
- When views are low, check in this order: topic, first 1–3 s, story/retention, packaging, animation, sound.
- A weekly scheduled task reviews both channels and updates the databases.

## Video generation: always use the lemo-opuscar skill

For any request to generate or produce a video (film, Short, Reel, promo, explainer, animation,
documentary cut), use `.claude/skills/lemo-opuscar/SKILL.md` (library: github.com/lemomo-ai/lemo-opuscar).
- Use it before the generic `video` skill, Remotion, Higgsfield, vidIQ video generation or other
  AI-video tools. Those are only for things lemo-opuscar doesn't do (plain editing, trimming or
  converting existing video files), or when the user explicitly asks for a different tool.
- Run its `scripts/setup.sh` first (it downloads the library to `~/lemo-opuscar`), start
  `setup.sh deps` early, then follow `$LIB/AGENTS.md`: style choice, one round of questions,
  treatment, production, delivery.
- Put each film's project folder under `videos/<name>/` in this repo. Commit the source and the
  final video (keep files under GitHub's 100 MB limit), then push.
- **Don't use the 3D Map Explainer style (`map-explainer`)** for any video, and don't suggest it
  (owner, 2026-11-14). Pick or suggest other styles.
- The renderer wants ffmpeg 7+. If the container only has an older ffmpeg, say so before rendering.
- Uploading or posting the finished video still follows the YouTube and Facebook sections below.

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

## Figma: always use the ChatGPT image model

Whenever the user asks to use Figma (thumbnails, posts, designs, mock-ups, reference images or anything else), any
image generated in Figma is made with the **ChatGPT model inside Figma** (owner, 2026-11-11): the Figma
`generate_image` tool with `model: "gpt-image-2.5-flare"`, always passed explicitly. Never use the Gemini models
(`gemini-3.1-flash-image`, `gemini-3.1-flash-lite-image`), and don't generate the image outside Figma. Words go in as
live Figma text with `use_figma`, not drawn by the model. The Figma account is on pay-as-you-go: on a rate or
usage limit wait ~60 s and retry (max 3 times); if Figma still fails, say so with the exact error and stop.
Generations cost Figma AI credits, so keep them to what the task needs (max 3 per thumbnail).

## YouTube + Facebook thumbnails: always made in Figma, map style

Every new YouTube video **and every Facebook Page video/Reel** gets a custom thumbnail, and it is **designed in
Figma only** (Figma connector: `use_figma`, `get_screenshot`, `download_assets`). Don't use other design or
image tools for thumbnails: no `make_thumbnails.py`/PIL rendering, Canva, Higgsfield, vidIQ thumbnail generator,
AI image generators outside Figma, Spline etc. **Artwork comes from the ChatGPT model inside Figma** (owner, 2026-11-11):
Figma `generate_image` with model `gpt-image-2.5-flare` (never the Gemini models), with no text in the image and at
most 3 generations per thumbnail; headings, tags and date tags are added as live Figma text with `use_figma`. The Figma account is on **pay-as-you-go** (owner, 2026-11-11), in chat and in
every scheduled task: Figma usage/tool-call limits are never a reason to skip Figma; on a rate or usage limit wait
~60 s and retry (max 3 times). If Figma is not connected or still fails, say so with the exact error and stop.
Read the master thumbnail rules in `docs/content/thumbnail-rules.md` first (three concepts, short headline that
works with the title, 100-point score, A/B testing), then follow `.claude/skills/youtube-thumbnail-creator/SKILL.md`:
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
