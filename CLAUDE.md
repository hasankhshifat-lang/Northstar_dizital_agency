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

## Voiceovers: English with VibeVoice, Bangla with ElevenLabs

Every **English** voiceover or narration (YouTube long-form and Shorts, Facebook videos/Reels, ads, explainers,
lemo-opuscar films), in chat and in every scheduled task, is made with **VibeVoice** (owner, 2026-11-15):
follow `.claude/skills/vibevoice-voiceover/SKILL.md` (`scripts/voiceover.sh`, default voice Frank).
- Don't use ElevenLabs, Gemini, OpenAI TTS or lemo-opuscar's built-in voice (Kokoro) for English narration. In
  lemo-opuscar films, make the narration with VibeVoice and use that audio instead of its built-in voice.
- **Bangla** voiceovers stay on ElevenLabs (`eleven_v4`, the channel's fixed Bangla voices): VibeVoice can't
  speak Bangla. ElevenLabs sound effects (`eleven_text_to_sound_v2`) are not voiceovers and stay as they are.
- VibeVoice has no audio tags: pace with punctuation and "...", write numbers as words, and run the take check
  in the skill (duration, transcript vs script, first second) before using the audio.
- If VibeVoice fails to install or run, say so with the exact error and stop; don't fall back to another TTS.

## YouTube growth: the youtube-growth-intelligence skill is the central controller

For every YouTube channel (Which Life Next, As Printed, The Overthinking Pad, Foot All FC), in chat and in every
scheduled task, use `.claude/skills/youtube-growth-intelligence/SKILL.md` (owner, 2026-11-15) as the controller for
research, topic choice, calendar, production direction, packaging, publish timing, post-publish tracking, diagnosis,
experiments and monetisation progress. It calls the other skills (scriptwriting/animation rules, lemo-opuscar,
VibeVoice, thumbnails, yt.py) and never replaces the rules in this file; where they differ, this file wins.
- Don't keep making the same kind of video hoping for better results: measure every video at 24h/48h/72h/7d/14d/28d
  (`scripts/growth.py`, append-only database in `youtube-growth/<channel>/`), diagnose in the order topic demand →
  thumbnail + title → hook → story/production → satisfaction, test one variable at a time, keep what wins, record
  what fails. Never optimise CTR alone.
- Impressions, CTR, returning viewers and viewer online times are not in the public API: get them from vidIQ
  extended reports or a Studio export, or write n/a. Never invent analytics.
- Publishing, money and channel settings stay with the owner (approval first); fixed publish times change only on
  the owner's say-so.
- **Remotion** is the fallback when lemo-opuscar/the channel engine can't make a scene, and the **third thumbnail
  fallback** after Figma and Spline (`remotion-thumb/` in the skill; never an arbitrary video frame). Check the
  rendered file before use.
- Scheduled tasks: "YouTube growth: daily checkpoints" and "YouTube growth: weekly audit".

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
usage limit wait ~60 s and retry (max 3 times); if Figma still fails, thumbnails use the Spline fallback (next section);
for anything else, say so with the exact error and stop.
Generations cost Figma AI credits, so keep them to what the task needs (max 3 per thumbnail).

## YouTube + Facebook thumbnails: always made in Figma, map style

Every new YouTube video **and every Facebook Page video/Reel** gets a custom thumbnail, and it is **designed in
Figma only** (Figma connector: `use_figma`, `get_screenshot`, `download_assets`). Don't use other design or
image tools for thumbnails: no `make_thumbnails.py`/PIL rendering, Canva, Higgsfield, vidIQ thumbnail generator,
AI image generators outside Figma etc. (Spline only as the fallback below). **Artwork comes from the ChatGPT model inside Figma** (owner, 2026-11-11):
Figma `generate_image` with model `gpt-image-2.5-flare` (never the Gemini models), with no text in the image and at
most 3 generations per thumbnail; headings, tags and date tags are added as live Figma text with `use_figma`. The Figma account is on **pay-as-you-go** (owner, 2026-11-11), in chat and in
every scheduled task: Figma usage/tool-call limits are never a reason to skip Figma; on a rate or usage limit wait
~60 s and retry (max 3 times). If Figma is not connected or still fails, use the Spline fallback below.
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

**Spline fallback (owner, 2026-11-15):** if Figma is not available (connector not connected, or it still fails after
the retries with an auth, billing, permission or other error), make the thumbnail in **Spline** instead, in chat and
in every scheduled task, instead of stopping. Use the Spline connector's 2D editor (Hana, `2d_*` tools): one frame per
thumbnail in the Spline file "NorthStar Thumbnails" (As Printed: "As Printed Thumbnails"), same names, sizes, style and
heading rules as above. Artwork from Spline's own image generation (`2d_generate_images`, no text in the image, max 3
per thumbnail) or real archive/stock images you may use; if Spline has no AI credits, build it from shapes and real
images. All words are live Spline text. Check it with `2d_review_frame`, export with `2d_export_html` and render the
frame to JPG at the exact size with the preinstalled Playwright/Chromium. Say in the report and the log that it was made
in Spline, with the exact Figma error. If Spline is not available either, use the Remotion fallback (youtube-growth-intelligence skill, `remotion-thumb/`, same
style and sizes, real or already-generated art, never an arbitrary video frame) and say so with both errors (owner, 2026-11-15).

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

## As Printed (archive history channel): daily long video + Short

Owner request 2026-11-15: one long video (8–12 min) and one Short (45–60 s) every day for the YouTube channel
**As Printed** (`yt.py --channel asprinted`), in the Archive Light Table template (`videos/as-printed/engine/`).
Follow `videos/as-printed/RUNBOOK.md`, together with the scriptwriting rules, the animation direction rules and
the VibeVoice voiceover skill above (they apply to As Printed too).
- **Approval first** (owner's choice): send the finished videos, titles, descriptions and publish times; upload only
  after the owner approves. The general YouTube confirmation rule above stays in force.
- Publish the long video at **7:00 PM US Eastern** and the Short at **8:00 PM US Eastern** (same day).
- **Thumbnails for As Printed use the archive style** (`engine/thumb.html`), not the map style: the map-style rule
  above applies to Which Life Next.


## The Overthinking Pad (psychology channel): 4 long videos + 4 Shorts a week

Owner request 2026-11-15: YouTube channel **The Overthinking Pad** (`yt.py --channel overthinkingpad`). Every
**Monday, Tuesday, Thursday and Saturday**: one long video (10–12 min, 16:9) and one Short (45–60 s, 9:16) cut from it.
Follow `videos/overthinking-pad/RUNBOOK.md`, together with the scriptwriting rules, the animation direction rules and
the VibeVoice voiceover skill above. Learning database: `social/learning/overthinking-pad.md` (its own, never mixed).
- **Approval first:** send the finished videos, thumbnails, titles, descriptions and publish times; upload only after
  the owner approves.
- Publish the long video at **7:00 PM US Eastern** and the Short at **8:00 PM US Eastern** (same day).
- **Look: notebook doodle** (lemo-opuscar Sketchnote style). **Thumbnails use the notebook style** described in the
  runbook, not the map style (the map style is for Which Life Next); everything else in the thumbnail rules applies.
- Accuracy: real, cited studies only; flag disputed findings; education, not medical advice.
