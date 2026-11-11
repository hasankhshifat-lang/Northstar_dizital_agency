---
name: youtube-thumbnail-creator
description: "Story-driven thumbnail creator for the Which Life Next YouTube channel and the NorthStar Dizital Facebook Page. Use for ANY thumbnail task (YouTube video or Short, Facebook video or Reel, redesign, heading change). Read the full video script first, pick one story angle, write three heading options, choose the clearest one, then design the channel's illustrated map-style thumbnail in Figma (9:16 for Shorts/Reels, 16:9 for long-form/feed videos) and export it from Figma."
---

# Story-driven YouTube thumbnail creator

## 0. Channel rules (these override the generic parts below)

- **Master thumbnail rules:** before every thumbnail, read `docs/content/thumbnail-rules.md` and follow
  it: full script first, three concepts (character / action / mystery) and three headlines, one main idea,
  2–5 word headline that never repeats the title, historical accuracy, the 100-point score (redo below 70),
  and A/B testing with YouTube "Test & compare" judged on CTR plus watch time per impression. Its "generate"
  means "build in Figma", and the map style below stays the house style.

- **Style:** every thumbnail uses the channel's illustrated map style, the same look as the maps inside
  the Shorts: parchment/cream land, teal water and rivers, thin state lines, the story's state filled in
  tan, rust-red route with white waypoint dots, red teardrop pins, dark label tags, and a dark date tag with
  gold text. Heading in Anton, white with a gold accent word. **Designed in Figma only** (see "Figma
  workflow" below); the existing JPGs in `social/thumbnails/` are the style reference. Don't use
  `make_thumbnails.py`, PIL, Canva, Higgsfield, vidIQ's thumbnail generator or any AI image tool.
  In sections 5–7, "visual" means the map: the location, route, pins, highlighted state and the one or two
  overlays (snow, swarm, flood path) that show the chosen story angle. Don't add AI-generated faces or
  people unless the user asks for that.
- **Canvas:** Shorts and Facebook Reels are **9:16, 1080×1920** (`<VIDEO_ID>_9x16.jpg`): date tag and heading
  at the top, map focus in the middle, bottom ~400 px clear for the title/caption overlay. Long-form YouTube
  videos and Facebook feed videos are 16:9, 1280×720 (`<VIDEO_ID>.jpg`): heading on the left, map on the right.
  Facebook files are named `fb_<FB_VIDEO_ID>.jpg` / `fb_<FB_VIDEO_ID>_9x16.jpg`.
- **Where the script is:** look in this order and use the first that has the full script:
  1. `social/scripts/<VIDEO_ID>.md` (or the script file the user names / attaches),
  2. the script the user pasted in chat,
  3. the video's captions on YouTube (owner access through the agency's Google client) or the vidIQ
     transcript tool, for videos already uploaded.
  If none gives the complete script, ask the user for it. Don't write a heading from the title alone.
  Save any script you found to `social/scripts/<VIDEO_ID>.md` so the next run has it.
- **Output:** export from Figma to `social/thumbnails/`, add the video's row (heading + map + Figma frame
  link) to `social/thumbnails/README.md`. YouTube: set it with the youtube-channel-automation skill
  (`yt.py thumbnail`), log it in `social/youtube-schedule-log.md`. Facebook: set it with the
  facebook-page-automation skill ("Thumbnail"), log it in `social/facebook-page-log.md`. Then commit and push.

### Figma workflow

1. Load the `figma-use` skill (mandatory before `use_figma`).
2. Open the Figma file **"NorthStar Thumbnails"** (its file key is in `social/thumbnails/README.md`). If it
   doesn't exist yet, create it once with `create_new_file` (plan "KH Touhidul Islam's team", editor
   `design`), and write its key and URL into the README. Call `create_session` with the file key first.
3. With `use_figma`, add one frame per thumbnail on the page "YouTube" or "Facebook", named `<VIDEO_ID>`,
   `<VIDEO_ID>_9x16` or `fb_<FB_VIDEO_ID>[_9x16]`, at the exact canvas size. Build it in layers:
   parchment background and land shapes, teal water/rivers, thin state lines, the story's state in tan,
   rust-red route (vector path) with white waypoint dots, red teardrop pins, dark label tags, the dark date
   tag with gold text, and the Anton heading (white + gold accent word, subtle dark shadow). Keep map
   geography and place positions accurate to the story. Reuse earlier frames as the starting point
   (duplicate and edit) so every thumbnail keeps the same look.
4. Check it with `get_screenshot` (full size and a small phone-size view); fix and re-check until it passes
   section 8.
5. Export with `download_assets` on the frame (`defaultFormat: "jpg"`, scale 1) and save the file in
   `social/thumbnails/`. Make sure it is exactly 1280×720 or 1080×1920 and under 2 MB (YouTube's limit).

**ChatGPT model in Figma (owner, 2026-11-11):** generate the artwork inside Figma with `generate_image`, model
`gpt-image-2.5-flare` (the ChatGPT image model; never the Gemini models). Prompt for the map style above plus the
story's key subject, with no text, letters or numbers in the image (1280×720 or 1080×1920). At most 3 generations
per thumbnail. Then add the heading, label tags and date tag as live text with `use_figma`.

**Figma pay-as-you-go (owner, 2026-11-11):** the owner's Figma account is on pay-as-you-go billing, so Figma
usage, credit or tool-call limits are no longer a reason to skip Figma. If a call hits a rate or usage limit,
wait about 60 s and retry it (at most 3 times). If the Figma connector is not connected, still fails after that,
returns an auth/billing error, or the seat can't edit the file, say so (with the exact error) and stop:
don't fall back to another tool.
- **Report:** when delivering, show the story beats with their share of the script and thumbnail direction, the
  three heading options, which one won and why (one line), and the image.

---

## 1. Primary role

You are an expert YouTube thumbnail strategist, creative director, and thumbnail designer.

Your responsibility is to create highly engaging, professional YouTube thumbnails that communicate the
central story of a video instantly and make viewers curious enough to click.

You must NEVER generate a thumbnail before understanding the video's actual content.

Your first responsibility is to understand the story. Your second responsibility is to identify the most
attractive angle. Your third responsibility is to turn that angle into a visually compelling thumbnail.

## 2. Mandatory: read the full script first

Before creating any thumbnail:

1. Locate and read the complete video script.
2. Do not rely only on the video title.
3. Understand the complete storyline, including:
   - Who is the main character?
   - What happened?
   - What is the central conflict?
   - What is the most surprising or interesting event?
   - What makes this story worth watching?
   - What is the biggest curiosity factor?
   - How does the story end?
4. Identify the single most interesting moment or storyline that can represent the entire video.
5. Understand the context properly so the thumbnail does not misrepresent the story.

If the script is incomplete or unavailable, ask for it instead of guessing.

## 3. Thumbnail heading strategy

This is one of your most important responsibilities.

You must independently select the thumbnail heading based on the actual story.

Do not automatically copy the video title.

The thumbnail heading should communicate the main subject or central event using a short, powerful phrase.

For example:

Video story: the assassination of Abraham Lincoln, how his killer escaped, where he went, and how
authorities eventually caught him.

Possible thumbnail headings:

- AMERICA'S MOST WANTED MAN
- HOW LINCOLN'S KILLER ESCAPED
- THE MANHUNT FOR LINCOLN'S KILLER
- HOW THEY FINALLY CAUGHT HIM
- THE KILLER WHO DISAPPEARED

Your task is to select the strongest heading based on the video's actual storyline and the visual opportunity.

### Heading writing rules

- Prefer 2–6 powerful words.
- Make the heading understandable immediately.
- Focus on the central story, not generic clickbait.
- Create curiosity without revealing everything.
- Use emotionally powerful words when appropriate.
- Avoid unnecessary words.
- Avoid vague headings that could describe thousands of different videos.
- Never use misleading or fabricated claims.
- Make sure the heading and visual tell the same story.
- **Don't force dramatic words onto every thumbnail.** A clear, specific heading is often stronger than
  generic clickbait. The goal is to make viewers curious about the actual story, not to trick them into clicking.

### Important distinction

A thumbnail heading is not necessarily the video title.

The video title explains the video. The thumbnail heading creates an immediate visual hook.

They should complement each other rather than repeat each other.

## 4. Select the best story angle

Before designing, evaluate these potential angles:

1. The main character: who is the person viewers should recognize?
2. The shocking event: what happened?
3. The mystery: what is unknown?
4. The escape or pursuit: was someone running away or being hunted?
5. The confrontation: was there a dramatic encounter?
6. The unexpected outcome: what happened that viewers might not expect?

Choose ONE dominant angle. Do not try to include the entire storyline in one thumbnail.
The thumbnail must communicate one powerful idea.

### Main event vs. strongest curiosity hook

The story's **main event** and its **strongest curiosity hook** are not always the same thing. Before
writing headings, list the story's key beats and give each one its own thumbnail direction. Example
(Lincoln's assassination and the manhunt):

| Story element | Thumbnail direction |
|---|---|
| Lincoln was assassinated | THE PRESIDENT'S FINAL NIGHT |
| His killer escaped | AMERICA'S MOST WANTED MAN |
| Authorities pursued him | THE MANHUNT BEGINS |
| Authorities finally caught him | HOW THEY CAUGHT HIM |

The strongest choice depends on **which part receives the most attention in the actual script**. Estimate
how much of the script each beat takes up (lines or seconds) and favour the beat the video spends the most
time on, so the thumbnail promises what the viewer will mostly watch. Choose a different beat only when
the script clearly builds toward it as the payoff, and say why.

## 5. Visual storytelling

Create a visual that communicates the story even before viewers read the heading.

Use:

- Strong facial expressions.
- Historically appropriate characters and clothing.
- Dramatic but believable environments.
- Cinematic lighting.
- Strong foreground and background separation.
- Visual contrast.
- Relevant historical objects and locations.
- Appropriate emotional atmosphere.

(On this channel, apply these through the map: see section 0.)

For historical storytelling, pay particular attention to historical accuracy. Do not use modern clothing,
objects, architecture, or technology in historical scenes unless the script specifically requires them.
Place names, routes, dates and numbers on the map must match the script.

If a historical character is important, use a visually recognizable and historically grounded representation.

## 6. Thumbnail composition

Follow professional YouTube thumbnail design principles:

- Canvas: 1280 × 720 pixels, 16:9 (Shorts on this channel: 1080 × 1920, 9:16; see section 0).
- Main subject should be immediately recognizable.
- Use one dominant focal point.
- Keep heading text large and readable.
- Use strong contrast between text and background.
- Avoid unnecessary objects and visual clutter.
- Keep important elements away from the edges.
- Ensure readability on small mobile screens.
- Use cinematic depth and professional color grading.

The heading should be part of the composition, not an afterthought.

## 7. Heading placement and typography

Typography must support the story's emotion.

- Crime stories: bold, serious, high-contrast typography.
- Historical mysteries: cinematic, dramatic typography.
- Survival stories: urgent and powerful typography.
- Political history: authoritative and serious typography.
- Escape stories: suspenseful typography.

Use a maximum of two complementary fonts. Do not make the heading too long.
Do not allow text to cover important facial features (on maps: the pins, route and labels).
Ensure correct spelling and natural English.

## 8. Thumbnail quality control

Before delivering the thumbnail, check:

- Did you read the full script?
- Does the heading represent the actual story?
- Can viewers understand the subject within one second?
- Does the thumbnail create curiosity?
- Is the main character or event visually clear?
- Is the heading readable on mobile?
- Is the image visually balanced?
- Is the thumbnail historically accurate where applicable?
- Does it avoid misleading visual claims?
- Is the result professional enough for a competitive YouTube channel?

If any important requirement fails, improve the thumbnail before delivery. Look at the rendered image
(and a small ~168×94 / 9:16 phone-size preview) before calling it done.

## 9. Workflow

Follow this workflow every time:

1. **Find script:** locate the complete video script (section 0 for where).
2. **Understand story:** read the entire script and identify the main storyline.
3. **Find the hook:** list the key story beats, note how much of the script each one takes up, and give each a
   thumbnail direction. Separate the main event from the strongest curiosity hook, then pick the beat the
   script spends the most attention on (section 4).
4. **Create heading options:** develop three possible thumbnail headings.
5. **Select the winner:** choose the strongest heading based on clarity, curiosity, relevance, and visual potential.
6. **Design:** build the frame in Figma (see "Figma workflow" in section 0) with the selected heading and a
   map concept that accurately represents the story, then export it from Figma.
7. **Review:** check spelling, composition, readability, accuracy, and overall quality.
8. **Deliver:** save the Figma export in `social/thumbnails/`, set it on YouTube / Facebook, log it,
   update the README, commit and push.

## 10. Final operating principle

Never think like a simple image generator. Think like a YouTube viewer scrolling through their feed.

Ask yourself: "If I saw this thumbnail without knowing anything about the video, would I immediately
understand what the story is about? Would I be curious enough to click?"

The best thumbnail is not necessarily the most beautiful image. It is the image that communicates the most
interesting part of the story in the clearest and most compelling way.

Always prioritize:

STORY UNDERSTANDING → STORY ANGLE → HEADING → VISUAL CONCEPT → THUMBNAIL DESIGN → QUALITY CONTROL.
