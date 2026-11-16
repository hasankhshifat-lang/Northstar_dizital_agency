---
name: youtube-thumbnail-creator
description: "Universal thumbnail creator: high-CTR, story-driven YouTube and Facebook thumbnails for every niche and every channel the agency runs (Which Life Next, As Printed, The Overthinking Pad, Foot All FC, Scientific Bithi and any new one). Use for ANY thumbnail task: new video or Short, Facebook video or Reel, redesign, heading change, A/B variant. Reads the full script, builds three concepts, and always leads with a dominant visual subject (a recognisable face, character cutout, historical portrait, key object or location) instead of a text-only design. Collects real or generated assets, cuts subjects out, composes and renders the still in Remotion (Figma ChatGPT-model art and Spline as asset/fallback tools), runs the mobile-size test and delivers a scored, logged JPG."
---

# Universal YouTube thumbnail creation skill (Remotion-powered)

Owner instruction, 2026-11-16: this skill replaces the older "Figma-only, map-only" thumbnail skill for every
channel, in chat and in every scheduled task. Read section 0 first (agency rules), then follow sections 1–15.
`docs/content/thumbnail-rules.md` (three concepts, headline rules, 100-point score, A/B testing) still applies;
where it and this skill differ, this skill and `CLAUDE.md` win.

---

## 0. Agency rules (these sit on top of the universal sections)

### 0.1 Tools, in this order

| Step | Tool | Notes |
|---|---|---|
| Assets: real images | Library of Congress, National Archives, Wikimedia Commons public-domain files, licensed stock, official product/location images, the channel's own character art | Record the source URL and rights line for every image in the thumbnail record. |
| Assets: generated art | **Figma `generate_image`, model `gpt-image-2.5-flare`** (always passed explicitly, never the Gemini models) | No text, letters or numbers in the image; max 3 generations per thumbnail. Never generate a fake face for a specific real person. If Figma is not connected or still fails after ~60 s waits and 3 retries, use Spline `2d_generate_images` (same limits). |
| Cutouts | `scripts/cutout.py` (rembg, model `isnet-general-use`) | Clean edges, no white halo; check the PNG on a red background before use. |
| Composition + render | **Remotion engine in `remotion/`** (section 8) | Default for every thumbnail. Output exactly 1280×720 (16:9) or 1080×1920 (9:16), JPG under 2 MB. |
| Fallback composition | Figma frame (`use_figma`, file "NorthStar Thumbnails"), then Spline 2D (`2d_*`) | Only if Remotion can't render in the container. Same layout, sizes and checks; say which tool and the exact error. |

Never: Canva, Higgsfield, vidIQ's thumbnail generator, `make_thumbnails.py`/PIL drawing, AI image tools outside
Figma/Spline, or an arbitrary frame grabbed from the video as the thumbnail.

### 0.2 Channel house looks

The dominant visual subject (section 3) is mandatory on every channel. The house look sets type, colours and
supporting graphics so each channel stays recognisable. Pick the Remotion `style` to match.

| Channel | `style` | Look | Subject rules |
|---|---|---|---|
| Which Life Next (US history) | `map` | Parchment map background (real period maps from LoC or the channel's map art), rust-red route, red teardrop pins, dark label tags, dark date tag with gold text, Anton white + gold headline | Authentic portrait or historical photo of the main person, cut out, large, with the map as the location layer. Use the illustrated-map-only design only when there is no person or object to show. |
| As Printed (archive newspapers) | `archive` | Light-table grey, the real front page or clipping, orange evidence rings/arrows, IBM Plex Serif headline in a dark panel, mono date tag | The real newspaper headline plus the person, ship, place or object it's about (public-domain photo). |
| The Overthinking Pad (psychology) | `notebook` | Dot-grid paper, marker type, yellow highlighter, doodles from the channel engine | The channel's notebook character (rendered from `videos/overthinking-pad/engine/`) showing the emotion, or the study's key object. No photos of real researchers unless public domain. |
| Foot All FC (football stories) | `toon` | Flat cartoon, bold outlined type, red tag | The channel's puppet players (render from the film project), identified by shirt number. **Never real players' faces, club crests, sponsors or league marks.** |
| Scientific Bithi (Bangla science, Facebook) | `toon` | Bright flat cartoon matching the Sci-Fi Sitcom Toon video, Bangla hook as live text, সাইন্টিফিক বিথী badge | বিথী on every thumbnail, amazed, rendered from the episode's toon project (never drawn by a model); the scientist beside her on scientist days; feet on one ground line; bottom ~400 px clear. Bangla text renders through the engine's Hind Siliguri fallback (accent words work in Bangla too). Follow `social/bangla-science-channel/kit/thumbnail/README.md` for the rest. |
| Any other channel / niche | `cinematic` | Style adapted to the niche (section 9) | Sections 3–5. |

### 0.3 Canvas, names, script, output

- **Canvas:** long-form YouTube and Facebook feed videos 16:9, **1280×720**. Shorts and Facebook Reels 9:16,
  **1080×1920**, with the hook at the top, the subject in the middle and the **bottom ~400 px clear** for the
  title/caption overlay.
- **File names:** `<VIDEO_ID>.jpg`, `<VIDEO_ID>_9x16.jpg`, Facebook `fb_<FB_VIDEO_ID>.jpg` / `fb_<FB_VIDEO_ID>_9x16.jpg`,
  As Printed and Overthinking Pad episodes may keep `thumb_long.jpg` / `thumb_short.jpg` in the episode folder.
- **Script first:** `social/scripts/<VIDEO_ID>.md` (or the episode folder's script), else the script pasted in chat,
  else the video's captions / vidIQ transcript for uploaded videos. If none is complete, ask. Save any script found
  to `social/scripts/<VIDEO_ID>.md`.
- **Never overwrite** an existing thumbnail file without the owner's permission: write `<name>_v2.jpg` etc.
- **Output:** save to `social/thumbnails/` (or the episode folder), keep the Remotion props JSON next to it
  (`<name>.props.json`) so it can be re-rendered, add the row to `social/thumbnails/README.md`, write
  `youtube-growth/<channel>/videos/<VIDEO_ID>/thumbnail-record.md` when that folder exists (concept, alternatives,
  text, subject, sources and rights, tool, scores). YouTube: `yt.py thumbnail VIDEO_ID FILE`, log in
  `social/youtube-schedule-log.md`. Facebook: facebook-page-automation skill ("Thumbnail"), log in
  `social/facebook-page-log.md`. Commit and push.
- **Approvals stay as they are:** channels that need the owner's approval before upload (As Printed, The Overthinking
  Pad, Scientific Bithi) send the thumbnail with the videos and wait.
- **Score:** the 100-point score in `docs/content/thumbnail-rules.md` §14; redo anything below 70.

---

## 1. Core mission

Create visually outstanding, professional, high-click-potential YouTube thumbnails for ANY video niche:
American history, science and education, documentary, technology and AI, business and finance, news and politics,
entertainment, gaming, mystery and storytelling, biography, tutorials, lifestyle and travel, health and fitness,
comedy and animation, and general YouTube content.

Every thumbnail must communicate the video's central idea visually within about one second.

**MANDATORY RULE: NEVER CREATE A GENERIC TEXT-BASED THUMBNAIL.**

Every thumbnail must contain at least one dominant visual subject:

1. The main character's face or a character cutout.
2. A real person's face, when the video is about a real person.
3. A historical figure's portrait.
4. The main topic-related object or product.
5. A relevant location, environment or landmark.
6. A custom-created character or visual illustration when appropriate.

Prefer combining two or more relevant visual elements when it improves storytelling.
Text must support the visual story, not replace it.

## 2. Understand the video before designing

Before creating anything:

1. Read the complete video script.
2. Understand the voiceover and narrative.
3. Identify the central subject.
4. Identify the most interesting, surprising, emotional, mysterious or controversial moment.
5. Decide what would make someone curious enough to click.
6. Identify the main person, character, object or location.
7. Identify the visual contrast between the beginning and the outcome of the story.
8. Develop at least three different thumbnail concepts (section 12).
9. Select the strongest concept on visual clarity, curiosity and relevance.

Never create a thumbnail from the title alone. The thumbnail must represent the actual video, not an unrelated
clickbait idea. List the story beats with their share of the script and favour the beat the video spends the most
time on, unless the script clearly builds toward another beat as the payoff (say why).

## 3. Visual subject selection

This is one of the most important rules. Always look for suitable visual assets before designing.

Priority order:

- **Biography and historical videos:** the main historical figure's face → a historical character cutout → the
  relevant historical location → important historical objects → supporting characters when necessary.
- **Science videos:** the main scientific subject → a human or animated character demonstrating the concept → the
  relevant scientific object → a visually interesting environment → a before-and-after scientific comparison.
- **Documentary videos:** the main person involved → the main location → event imagery → objects or evidence.
- **Technology videos:** the actual device, product, software interface or technology → a relevant human face where
  appropriate → strong environmental context.
- **Storytelling videos:** the main character → character expressions → the important location → a visual of the
  story's biggest turning point.
- **Tutorials:** the actual product, software or tool → a person demonstrating it → a clear visual result.

Never force a human face into a thumbnail when it has no relevance to the subject. Then use the strongest
recognisable object, location or visual representation of the topic.

## 4. Face and character design

Faces are powerful attention-grabbing elements. When relevant:

- Use large, recognisable faces; prefer close-up or medium close-up compositions.
- Preserve the person's recognisable features; no excessive distortion.
- Use expressive but believable emotions that match the story.
- Use clean transparent-background cutouts when appropriate.
- Separate subjects from the background with lighting, depth, shadows or a subtle outline.
- Avoid random AI-generated faces when the video discusses a specific real person: use an authentic reference
  portrait instead of inventing a replacement.
- Keep recurring channel characters consistent across thumbnails (render them from the channel's own project).

## 5. Storytelling through composition

Every thumbnail should tell a miniature visual story. Suitable compositions:

- Main character on one side, the important event on the other.
- Face in the foreground, location in the background.
- Character looking toward an important object.
- Before-and-after composition.
- Two opposing people or forces.
- The main object dramatically enlarged.
- A character reacting to an unexpected event.
- A mysterious location with a recognisable foreground subject.

The viewer should immediately know where to look. Use strong foreground/background separation, clear visual
hierarchy, controlled negative space, cinematic depth, natural perspective, directional lighting and strong
subject–background contrast. Don't place elements randomly.

## 6. Thumbnail text

- 2–5 words (channel maximum 6); one primary headline; a secondary line only when necessary.
- Large, readable typography; no long sentences.
- Never repeat the video title: the title explains, the headline hooks. They complement each other.
- Avoid generic phrases ("Amazing Story", "You Won't Believe"); use strong, specific wording about the actual story.
- Never a misleading or fabricated claim; the headline and picture must tell the same story.
- Don't cover the main face (or the map's focus point) with text.

Examples:

| Video | Headline | Visual |
|---|---|---|
| How Abraham Lincoln's assassin escaped | THE MANHUNT | Historical portrait of the assassin, a relevant historical location behind him |
| How black holes work | NOTHING ESCAPES | A large black hole with a recognisable spacecraft or scale reference |
| Why Rome collapsed | THE FALL OF ROME | Roman emperor or soldier cutout, ancient Rome in the background |

Text must never be the only interesting element.

## 7. Image asset research

Collect suitable assets before opening Remotion. Search in this order:

1. User-provided reference images.
2. Existing channel character assets.
3. Licensed stock photography.
4. Public-domain historical photographs and portraits (LoC Prints & Photographs "No known restrictions",
   National Archives, Wikimedia Commons PD files; LoC JSON API: `https://www.loc.gov/pictures/search/?q=<terms>&fo=json`,
   full-size TIFFs under `tile.loc.gov/storage-services/master/...u.tif`).
5. Official product and location imagery.
6. AI-generated custom assets (Figma `gpt-image-2.5-flare`, section 0.1).

- Historical subjects: authentic portraits and period-appropriate imagery; no modern clothing, objects or
  technology. Locations: recognisable landmarks, the correct geography; no generic unrelated landscapes. Place
  names, routes, dates and numbers must match the script.
- Cutouts: `python3 .claude/skills/youtube-thumbnail-creator/scripts/cutout.py in.jpg out.png` (removes the
  background, trims, checks the edge on red: look at `out_check.jpg`). Preserve hair and fine detail; no white halos.
- Put the files in `social/thumbnails/assets/<name>/` (or the episode's `assets/`), with a `SOURCES.md` listing
  each file's source URL and rights line. Never use copyrighted images without checking usage rights; for living
  people use only images we're allowed to use.

## 8. Remotion production workflow

Remotion is the rendering engine for a static still, not a reason to make an animated thumbnail.

**Step 1 — Project check.** The engine lives in `.claude/skills/youtube-thumbnail-creator/remotion/` (own
`package.json`; it doesn't touch any video project). Once per container:
```bash
cd .claude/skills/youtube-thumbnail-creator/remotion && npm ci
```
Chromium is preinstalled (`/opt/pw-browsers/chromium`; `render.mjs` passes it).

**Step 2 — Assets.** Portraits, cutouts, locations, objects, backgrounds at enough resolution (section 7).

**Step 3 — Composition.** Write a props JSON (examples in `remotion/examples/`):
```json
{"width":1280,"height":720,"style":"map|archive|notebook|toon|cinematic",
 "background":{"src":"map.jpg","crop":[x,y,w,h],"grade":"none|mono|sepia|warm|cool","blur":2,"darken":0.1,"side":"left|right|top|none"},
 "layers":[
  {"type":"image","src":"clipping.jpg","x":40,"y":320,"w":880,"aspect":2.82,"rotate":-3,"crop":[x,y,w,h],"paper":true},
  {"type":"cutout","src":"person.png","x":760,"y":-30,"h":780,"grade":"sepia","glow":"rgba(255,226,170,0.5)","outline":"#fff"},
  {"type":"pin","x":560,"y":290,"label":"WASHINGTON"},
  {"type":"ring","x":500,"y":570,"rx":300,"ry":40},
  {"type":"arrow","from":[900,330],"to":[760,540],"bend":-0.25}],
 "headline":{"lines":["THE 12-DAY","MANHUNT"],"accent":["MANHUNT"],"x":48,"y":380,"size":118,"align":"left","panel":false},
 "tags":[{"text":"APRIL 1865","x":52,"y":318,"variant":"date|label|stamp","rotate":0}]}
```
Layers draw back to front: background location → objects/evidence → pins/rings/arrows → the subject cutout →
headline → tags. `crop` values are fractions of the source; set `aspect` to the pixel aspect of what is shown so
nothing is stretched. Pins, rings and arrows must sit on the real place or the real words.

**Step 4 — Visual polish.** Directional gradient behind the text side, a vignette for depth, a soft glow and
drop shadow on the cutout, grading that fits the period (mono/sepia for archives, warm for parchment maps).
No excessive glow, random particles, unnecessary shapes or generic AI-looking effects.

**Step 5 — Render.**
```bash
node render.mjs props.json ../../../../social/thumbnails/<VIDEO_ID>.jpg path/to/asset1 path/to/asset2 ...
```
The assets are copied into `public/`. The script renders the still, converts it to JPG at the exact size under
2 MB, and writes `out/<name>_check.png` (50 % and phone-feed size side by side) for section 11.

## 9. Visual style adaptation

Don't use the same template for every niche or every video; adapt to the subject:

- **Historical documentary:** cinematic historical environment, authentic faces, dramatic but believable light,
  period details.
- **Science explanation:** an interesting scientific subject, a clear educational visual, bright controlled contrast.
- **Business:** the relevant entrepreneur or subject; money, products, charts or business setting where relevant;
  clean premium composition.
- **Technology:** real devices and interfaces, modern environments, product-focused composition.
- **Mystery:** the key character or location, darker atmosphere where appropriate, visual clues and suspense.
- **Travel:** the recognisable destination, a person or landmark as the dominant subject, rich environmental photos.

The style serves the story, not the other way around (within the channel's house look, section 0.2).

## 10. Quality control (before the final render)

- **Subject:** is the main person, character, object or location clearly visible, relevant, attention-getting?
- **Story:** can viewers understand the central idea quickly? Does it create curiosity? Is it accurate?
- **Composition:** clear hierarchy, balance, foreground separated from background?
- **Text:** readable on a phone, short, complementing the image, not repeating the title?
- **Technical:** exactly 1280×720 or 1080×1920, sharp images, clean cutout edges, no artifacts, under 2 MB,
  9:16 bottom ~400 px clear?
- **Accuracy:** dates, numbers, names, places, clothing and objects match the script and the sources?

## 11. Mobile-size test (mandatory)

Look at the full-resolution render, the 50 % view and the phone-size view (`out/<name>_check.png`, about 246×138
for 16:9 and 180×320 for 9:16). If the main face, object or location becomes unrecognisable small, redesign the
composition. If the text is hard to read, simplify it. If it looks like a generic poster rather than a YouTube
thumbnail, redesign it.

## 12. Three-concept internal comparison

Develop three distinct concepts before choosing:

- Concept A: face-focused storytelling.
- Concept B: location and environment-focused storytelling.
- Concept C: character/object-focused storytelling.

These are starting directions, not mandatory compositions: choose the three strongest approaches for the actual
video. Rate each on visual attention, story relevance, curiosity, readability, uniqueness and mobile visibility,
pick the strongest, and write three headline options for it. Render one excellent final thumbnail unless several
are requested (A/B tests: make the second variant change one thing only).

## 13. Continuous improvement from channel analytics

When analytics are available (vidIQ `thumbnail_ctr` first, else YouTube Analytics through `yt.py`; impressions and
CTR are not in the public API, write n/a when missing):

1. Analyse previously published thumbnails; compare impressions and CTR, and similar topics.
2. Find recurring patterns in strong thumbnails and weaknesses in weak ones.
3. Judge per channel and niche whether faces, locations, objects, text or compositions do better.
4. Feed the findings into the next designs and the channel's learning database (`social/learning/<channel>.md`).

CTR alone doesn't decide success: consider traffic source, impressions, topic, audience and watch time per
impression. Never claim a thumbnail caused a change without enough evidence. Learn separately for each channel.

## 14. Final deliverable

For every thumbnail, report:

1. The final rendered thumbnail (send it with SendUserFile).
2. The headline (and the two alternatives).
3. The main visual subject used, with its source and rights line.
4. A short explanation of the concept (and why it beat the other two).
5. Output dimensions.
6. File location.
7. A brief quality-control report: score out of 100, mobile test result, tool used (Remotion / Figma / Spline) and
   any errors.

## 15. Absolute rules

- Never create text-only thumbnails.
- Never use generic backgrounds as a substitute for relevant visual storytelling.
- Never ignore the main character or person when one is central to the video.
- Never use unrelated faces just to attract clicks.
- Never create thumbnails without reading the complete script.
- Never sacrifice story accuracy for clickbait.
- Never use the same composition for every video.
- Never use tiny faces when a face is the primary subject.
- Never overcrowd the thumbnail.
- Never publish a low-quality render.
- Never overwrite existing assets without approval.

**Final objective:** every thumbnail must look like a professionally art-directed YouTube thumbnail, not a generic
AI-generated poster. The main person, character, object or location carries the visual story; typography, lighting,
composition and effects strengthen it. Make viewers curious about the video before they read its title.

---

Demo set (2026-11-16): `social/thumbnails/demos/universal-2026-11-16/` with the props in `remotion/examples/`.
