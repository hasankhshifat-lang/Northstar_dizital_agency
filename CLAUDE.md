# Northstar Digital Agency — Claude instructions

## YouTube monetization + Community Guidelines: every channel, every video (owner, 2026-11-24)

Owner: "Must follow all the rules of YouTube for getting monetization and community guidelines for all my channels,
check the rules monthly for any updates, avoid all those which can be reason to become demonetized." In chat and in
every scheduled task, read and follow `docs/content/youtube-monetization-compliance.md` (Which Life Next, As Printed,
The Overthinking Pad, Foot All FC, and the Facebook Pages).
- Run its pre-publish checklist (section 9) on every video, title, description, tag, thumbnail and comment reply, and
  write "Compliance: pass" (or the failed items) in the upload's log row. A failed item that can't be fixed = don't
  upload: report and stop.
- Biggest risk: **inauthentic content** (mass-produced / template / repetitive videos). Every video needs its own
  researched script, real value and visible variation; never near-duplicates. Volume targets in this file are
  maximums: skip a slot rather than publish filler.
- This rule wins over any volume target, slot, format or task prompt that conflicts with it; tell the owner.
- The monthly scheduled task "YouTube policy compliance: monthly check" re-checks YouTube's official policy pages,
  updates the rulebook's change log and audits the channels. Owner to-do: accept the updated YPP terms in YouTube
  Studio by 2027-01-31 on every monetized channel (YPP updates from 2027-02-01).

## After every YouTube upload: the 9-step playbook (owner, 2026-11-25)

Owner: "follow all the steps for my YouTube channels as default." For every video on every channel, in chat and in every
scheduled task, follow `docs/content/after-upload-playbook.md` (compliance rulebook still wins):
1. Upload private with `--publish-at` ≥2 h ahead; `yt.py check VIDEO_ID` must be `"ready": true` (processed, HD) before
   the run ends. **Publish 2–9 min after each fixed slot** (e.g. 7:03 PM ET), never on :00/:15/:30/:45; the slot keeps
   its name in the logs. 2. No mass link-sharing. 3. Topics in **sets of three** (each its own story and angle), one
   playlist per set (`yt.py playlist-create` / `playlist-add`). 4. **No edits for 4 h** after publishing (typos, wrong
   facts and compliance fixes excepted); first verdict at ≥12 h; one big title + thumbnail repackage when the playbook's
   signal says so. 5. One **5-second question comment** per video (`yt.py comment`, posted once the video is public; no
   bait, no links). 6. A Short with its own hook cut from every long video. 7. Not working → change style/length (one
   variable). 8. Max 3 packaging changes per video, 12 h apart, then move on; never delete. 9. Diagnose with AVD + CTR
   together (CTR only from vidIQ/Studio, after ≥1,000 impressions).
- Studio-only owner actions (no API): pin the question, end screens, a Short's related video, Test & Compare.
- This changes the fixed publish minutes on every channel (owner-approved); the slots themselves stay.

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
- **Exception: Foot All FC** uses its own "Night Match Toon" engine, not a lemo-opuscar style (owner, 2026-11-23; see its section below).
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
- Publishing, money and channel settings stay with the owner (approval first; As Printed and The Overthinking Pad
  publish videos without approval since 2026-11-18, and so does the Scientific Bithi Facebook Page); fixed publish times change only on the owner's say-so.
- **Remotion** is the fallback when lemo-opuscar/the channel engine can't make a scene, and the **default thumbnail
  renderer** (universal thumbnail skill, `.claude/skills/youtube-thumbnail-creator/remotion/`; owner, 2026-11-16;
  never an arbitrary video frame). Check the rendered file before use.
- Scheduled tasks: "YouTube growth: daily checkpoints" and "YouTube growth: weekly audit".

## YouTube: always use the youtube-channel-automation skill (own Google Cloud client)

For any YouTube channel task (uploading, scheduling, editing titles/descriptions/tags/privacy/
publish time, thumbnails, playlists, reading and replying to comments, auto comment replies in
scheduled tasks, checking status), use `.claude/skills/youtube-channel-automation/SKILL.md`.
- Call the YouTube API directly with the agency's Google Cloud OAuth client
  (`YT_CLIENT_ID` / `YT_CLIENT_SECRET` / `YT_REFRESH_TOKEN`, project `168994544641`).
- **Do not use Clawlink or Metricool for YouTube anymore**, in chat or in scheduled tasks,
  not even as a fallback. If the API fails or the quota is used up, say so and stop.
- Confirm the title, description, publish time, and video file with the user before uploading. (Exceptions: As Printed
  and The Overthinking Pad publish without approval since 2026-11-18, see their sections.)
- **AI disclosure = YES on every upload, every channel** (owner, 2026-11-17): "Altered or synthetic content" is
  always set to Yes (`status.containsSyntheticMedia = true`; `yt.py upload`/`update` do this automatically). If a
  video is ever found without it, set it with `yt.py --channel NAME ai-disclose`.
- **Paid promotion = No and remixing = audio only, every video, every channel** (owner, 2026-11-25), existing and future:
  - Paid promotion: `yt.py upload`/`update` set `paidProductPlacementDetails.hasPaidProductPlacement = false`
    automatically; `yt.py --channel NAME paid-promo-off` fixes any video that isn't No (all 78 videos on the four
    channels read No on 2026-11-25). Check `"paidPromotion": false` in the upload output. If a video ever really has a
    sponsor, ask the owner first; never tick it without them.
  - Remixing ("Allow only audio remixing"): the YouTube API has no field for it, so it is a YouTube Studio setting.
    Owner to-do on each channel: Settings → Upload defaults → Advanced settings → Shorts remixing = "Allow only audio
    remixing" (for future uploads), and Content → select all → Edit → Shorts remixing (or each video's "Show more")
    for existing videos. Upload defaults may not reach API uploads, so the monthly compliance task asks the owner to
    spot-check the newest videos in Studio. Never tell the owner it was set by the API.
- Never delete a video, comment or playlist unless the user explicitly asks for that deletion.
- **Comment auto-replies cover every channel** (owner, 2026-11-25): any comment-reply run, including the scheduled
  task "auto-reply to new YouTube comments" (even if its prompt names only Which Life Next), checks and replies on all
  four channels: `yt.py --channel whichlifenext|asprinted|overthinkingpad|footallfc comments --unanswered --max 50`,
  then `yt.py --channel NAME reply ...`. Max 20 replies per run across all channels, each in that channel's voice,
  same skip and compliance rules; log each row in `social/youtube-comments-log.md` with the channel name.
- Log uploads/schedules/edits in `social/youtube-schedule-log.md` and comment replies in
  `social/youtube-comments-log.md`, then commit and push.

## Figma: always use the ChatGPT image model

Whenever the user asks to use Figma (thumbnails, posts, designs, mock-ups, reference images or anything else), any
image generated in Figma is made with the **ChatGPT model inside Figma** (owner, 2026-11-11): the Figma
`generate_image` tool with `model: "gpt-image-2.5-flare"`, always passed explicitly. Never use the Gemini models
(`gemini-3.1-flash-image`, `gemini-3.1-flash-lite-image`), and don't generate the image outside Figma. Words go in as
live Figma text with `use_figma`, not drawn by the model. The Figma account is on pay-as-you-go: on a rate or
usage limit wait ~60 s and retry (max 3 times); if Figma still fails, thumbnail art comes from Spline `2d_generate_images` (universal thumbnail skill, next section);
for anything else, say so with the exact error and stop.
Generations cost Figma AI credits, so keep them to what the task needs (max 3 per thumbnail).

## YouTube + Facebook thumbnails: universal thumbnail skill (owner, 2026-11-16)

Every new YouTube video (long-form or Short) **and every Facebook Page video/Reel**, on every channel, in chat and in
every scheduled task, gets a custom thumbnail made with `.claude/skills/youtube-thumbnail-creator/SKILL.md` (the
universal, Remotion-powered skill; it replaces the old Figma-only, map-only rule). Read it and
`docs/content/thumbnail-rules.md` first.
- **Never a text-only thumbnail.** Every thumbnail has a dominant visual subject: the main person's real face or
  portrait, a character cutout, the key object or the location, chosen from the full script (read it first; ask for
  it if missing). Three concepts (face / location / object), three headlines, pick the strongest; 2–5 word headline
  that adds to the title and never repeats it; no misleading claims; the 100-point score (redo below 70).
- **Assets:** real public-domain or licensed images first (LoC, National Archives, Wikimedia PD, stock, the channel's
  own character art), with the source and rights recorded; generated art only from Figma `generate_image` with model
  `gpt-image-2.5-flare` (no text in the image, max 3 per thumbnail; Spline `2d_generate_images` if Figma is not
  available). Never an AI face for a specific real person. Cutouts with the skill's `scripts/cutout.py`.
- **Composition and render: Remotion** (`.claude/skills/youtube-thumbnail-creator/remotion/`, `render.mjs`), exact
  size, JPG under 2 MB, mobile-size check. If Remotion can't render, build the same layout in Figma ("NorthStar
  Thumbnails") and then Spline, and say so with the exact error. Never an arbitrary video frame, Canva, Higgsfield,
  vidIQ's generator or PIL drawing.
- **Sizes:** long-form/feed 16:9 1280×720 (`<VIDEO_ID>.jpg`); Shorts/Reels 9:16 1080×1920 (`<VIDEO_ID>_9x16.jpg`),
  bottom ~400 px clear. Facebook files `fb_<FB_VIDEO_ID>[_9x16].jpg`.
- **Channel looks** (skill section 0.2): Which Life Next = parchment map + authentic portrait (Anton white + gold,
  dark date tag with gold text); As Printed = archive light table with the real front page; The Overthinking Pad =
  notebook doodle with the channel character; Foot All FC = Night Match Toon caricatures of the real players, drawn in code
  (owner, 2026-11-23; never photos or photo-realistic faces, crests or sponsors); Scientific Bithi = toon with বিথী rendered from the episode.
- **Output:** save to `social/thumbnails/` (or the episode folder) with its props JSON, never overwrite an existing
  thumbnail without permission. YouTube: `yt.py thumbnail VIDEO_ID FILE`, log in `social/youtube-schedule-log.md`.
  Facebook: facebook-page-automation skill ("Thumbnail"), log in `social/facebook-page-log.md`. Add the row to
  `social/thumbnails/README.md`, then commit and push. Approval-first channels send the thumbnail with the videos; no-approval channels include it in the report.

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
- **No approval needed to publish (owner, 2026-11-18; replaces "approval first" for this channel):** when both videos
  pass every check, upload and schedule them at the fixed slots in the same run (AI disclosure YES), set the thumbnails,
  log everything, then send the owner the files, links, titles and publish times plus a push notification as a report.
  This overrides the approval step in the scheduled task's prompt. If a check fails or anything is blocked, don't
  upload: report and stop.
- Publish the long video at **7:00 PM US Eastern** and the Short at **8:00 PM US Eastern** (same day).
- **Thumbnails for As Printed use the archive look** of the universal thumbnail skill (real front page + the person,
  ship, place or object it is about), not the map look, which is for Which Life Next.


## The Overthinking Pad (psychology channel): 4 long videos + 4 Shorts a week

Owner request 2026-11-15: YouTube channel **The Overthinking Pad** (`yt.py --channel overthinkingpad`). Every
**Monday, Tuesday, Thursday and Saturday**: one long video (10–12 min, 16:9) and one Short (45–60 s, 9:16) cut from it.
Follow `videos/overthinking-pad/RUNBOOK.md`, together with the scriptwriting rules, the animation direction rules and
the VibeVoice voiceover skill above. Learning database: `social/learning/overthinking-pad.md` (its own, never mixed).
- **No approval needed (owner, 2026-11-18; replaces "approval first" for this channel only):** when both videos pass
  the quality checks, upload and schedule them in the same run (7 PM / 8 PM ET slots, AI disclosure YES), set the
  thumbnails, log everything, then send the owner the files and links (SendUserFile) and a push notification as a
  report. This overrides the approval step in the scheduled task's prompt and the general "confirm before uploading"
  rule below. If a check fails or anything is blocked, don't upload: report and stop. As Printed has the same rule; other channels are unchanged.
- Publish the long video at **7:00 PM US Eastern** and the Short at **8:00 PM US Eastern** (same day).
- **Look: notebook doodle** (lemo-opuscar Sketchnote style). **Thumbnails use the notebook look** of the universal
  thumbnail skill (the channel character or the study's key object as the dominant subject), not the map look.
- Accuracy: real, cited studies only; flag disputed findings; education, not medical advice.

## Scientific Bithi: every video is Sci-Fi Sitcom Toon (owner, 2026-11-16)

Every video for the Scientific Bithi Facebook Page (সাইন্টিফিক বিথী), in chat and in every scheduled task, is made in
the lemo-opuscar **Sci-Fi Sitcom Toon** template (`scifi-toon`), following
`social/bangla-science-channel/kit/scifi-toon/README.md` on branch `claude/bangla-science-channel-analysis-afuq9x`
(approved reference: `videos/bithi-scifi-toon-demo/` on that branch). This covers Shorts/Reels, longer feed videos,
promos and any other video on the page; where the README says "Shorts", read it as every video.
- Keep the cast (মন্টু মামা, বিথী, বল্টু, scientist cameos) redrawn in the style, and a new Bangladeshi setting every video.
- It replaces the kit's old puppet engine and the Blender 3D plates for this channel. Scientist portal: cyan + gold.
- Unchanged: ElevenLabs voices (Bangla), scriptwriting and animation-direction rules, fact checks, storyboard,
  the 20:00 Dhaka slot and the Facebook Page steps. Thumbnails follow the universal thumbnail skill.
- **No approval needed to publish (owner, 2026-11-18; replaces "approval first" for this Page):** when a video passes
  the fact check, storyboard check and scene inspection, upload and schedule it in the same run at the next free
  20:00 Dhaka slot (14:00 UTC, at least 15 min away, checked against `scheduled_posts` and the log), set the cover,
  log everything, then send the owner the mp4, the cover, the link, title, caption and publish time (SendUserFile) plus
  a push notification as a report. This overrides the approval step in the scheduled task's prompt. If a check fails,
  a fact can't be confirmed or anything is blocked, don't upload: report and stop. The owner can still ask for changes
  after the report; never delete or edit a posted video unless they ask for that specific one.

## Which Life Next: 3 Shorts a day + 4–5 long videos a week (owner, 2026-11-22)

Owner request 2026-11-22: "Make 3 shorts daily and publish" and "4–5 long videos weekly" for **Which Life Next**.
- **Shorts: three a day**, standing approval to publish (same rules as before: Pony Express format, VibeVoice Frank,
  universal thumbnail, AI disclosure YES, Facebook cross-post). Slots **08:00, 13:00 and 17:00 US Eastern**, each
  at least 4 h away when chosen. This overrides "make exactly ONE Short" in the daily scheduled task's prompt: each
  run fills the free slots it can still produce in time. Never two Shorts in the same bucket back to back.
- This ends EXP-whichlifenext-001 as a clean one-Short-a-day test from 2026-11-22 (confound recorded on its card);
  slot results keep being logged per slot in `youtube-growth/whichlifenext/publishing/publish-time-log.md`.
- **Long videos: 4–5 a week** (Mon, Tue, Thu, Sat, plus Wed in 5-video weeks unless the owner sets other days),
  7:00 PM ET by default. Follow the scriptwriting rules (4-act long-form), animation direction rules, VibeVoice,
  lemo-opuscar and the universal thumbnail skill (16:9). Approval: send the first long video to the owner before it
  is published; publishing without approval for long videos only once the owner says so.

## Foot All FC: Night Match Toon caricatures, funny true stories, 3 Shorts a day (owner, 2026-11-23)

Owner request 2026-11-23: "use main footballer real animated funny face and choose funny scripts", "use this animation style as default
and publish 3 videos daily". For **Foot All FC** (`yt.py --channel footallfc`), in chat and in every scheduled task, follow
`videos/foot-all-fc/RUNBOOK.md`. This overrides the scheduled task's prompt where they differ (two Shorts, Comic History Cartoon style,
lemo-opuscar, "never real faces").
- **Style: "Night Match Toon"** (`videos/panenka-1976-short/STYLE.md`; reference project `videos/higuita-1995-short/`): Foot All FC's own 2.5D
  vector engine, not a lemo-opuscar template (only the lemo-opuscar renderer and audio helpers are reused). Don't use the Comic History
  Cartoon paper puppets for new Foot All FC videos.
- **Real players as caricatures:** the main footballers appear as funny cartoon caricatures drawn in code (signature hair, beard,
  moustache, skin tone, build, big head, comic expressions). Never photos, photo-realistic or AI-generated faces of real people, never crests,
  sponsors, league marks or match footage; kits stay generic. Jokes are about the moment, never mocking a person's looks, ethnicity or private
  life; nothing defamatory; no invented quotes; disputed facts labelled.
- **Funny scripts:** pick true stories with a comic angle (absurd, cheeky, unexpected, ironic), scored with the scriptwriting rules (65+), fully
  fact-checked; comedic narration and on-screen gags, accuracy first.
- **Three Shorts a day**, standing approval to publish (AI disclosure YES, thumbnail set, logs): slots **12:00 PM, 7:00 PM and 9:00 PM US
  Eastern**. Each run fills the free slots it can still produce in time (a slot at least 1 h away when chosen); if a slot has passed, use it
  tomorrow. Never two videos in one slot. Voice: VibeVoice Frank. Thumbnails: universal thumbnail skill, art rendered from the film's
  `?thumb=` frame with the caricature as the dominant subject.
- EXP-footallfc-001 (19:00 vs 21:00) ends as a clean test on 2026-11-23 (style, count and slots all changed); per-slot results keep being logged.
