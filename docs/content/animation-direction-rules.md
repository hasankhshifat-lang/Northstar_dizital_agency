# Master production rulebook: animation direction, visual storytelling, audience retention and continuous improvement

Owner rule, 2026-11-13: this is the **default for every video we generate** (YouTube long-form and Shorts,
Facebook Page videos and Reels), in chat and in every scheduled task. Read it together with
`docs/content/scriptwriting-rules.md` (topic + script) and `docs/content/thumbnail-rules.md` (packaging).

You are not just a video generator. You work as an animation director, visual storyteller, cinematographer,
character animator, editor and social-media data analyst. The goal is videos that feel intentionally
directed, visually satisfying, emotionally engaging, physically believable and right for the story, not
scenes that merely look animated.

## 0. How this fits the channel house rules

The two brands are different audiences. **Never mix their styles or their performance lessons.**

| | Which Life Next | Scientific Bithi (Bangla comic science) |
|---|---|---|
| Platforms | YouTube @whichlifenext + the Which Life Next Facebook Page (cross-posts) | Facebook Page সাইন্টিফিক বিথী (`1497857623404891`) |
| Audience | USA, English | Bangladesh, Bangla (NCTB classes 6–10 level) |
| Content | American history: events, people, mysteries, politics, wars, inventions, forgotten stories | Comic science explanations with recurring characters (বিথী, বল্টু, মামা, scientist cameos) |
| House look | Pony Express style map Short: continuous-camera real map that dives into ground scenes with the recoloured Kit rig (`social/which-life-next/RUNBOOK.md`) | The kit's puppet engine and rigged characters (`social/bangla-science-channel/kit/README.md`) |
| Learning database | `social/learning/which-life-next.md` | `social/learning/scientific-bithi.md` |

- These rules raise the quality bar **inside** each channel's approved format and tools. They don't replace
  the format, the tool rules in `CLAUDE.md` (Figma thumbnails, YouTube API, Graph API, ElevenLabs voices,
  no Clawlink/Metricool) or the approval rules in a scheduled task.
- A rule that a format can't do (for example finger-level grips in a 2D puppet rig) is met with the closest
  honest equivalent: the object is attached to the hand, faces the right way, moves with it, and never
  floats or passes through a body. If it can't be done believably, stage the shot so it isn't needed
  (cut to the result, frame it off-screen) rather than show a broken interaction.

### Priority order when a video underperforms

Better animation cannot rescue an uninteresting topic or a weak opening. Investigate in this order:

1. Topic selection and audience interest.
2. The first 1–3 seconds (first visual + first line).
3. Storytelling and retention through the middle.
4. Thumbnail and packaging (title + cover).
5. Character animation and visual quality.
6. Sound design and editing.

This is the order to investigate, not a guaranteed ranking of the cause. Use the data (section 8) to decide.

---

## 1. Golden rules of animation

### 1.1 Never use generic animation

No characters that move their hands randomly, walk without a destination, nod repeatedly, stand still while
talking, sway continuously without purpose, hold objects without using them, and no repeated zoom-in/zoom-out.

Before animating any movement, answer:

- What is the character trying to do?
- What are they looking at?
- What emotion should the movement show?
- What object are they interacting with?
- What happens right after the movement?
- How does it help tell the story?

If a movement doesn't improve storytelling, emotion, realism or visual engagement, remove it.

### 1.2 Every scene has a visual purpose

Each scene shows at least one of: new information, emotional development, character interaction, a change in
the environment, a surprising visual event, a demonstration or explanation, or a transition to the next
story event. Never add scenes just to fill time.

### 1.3 Natural movement over excessive movement

Use subtle breathing, natural head movement, eye movement and blinks, weight shifts, fitting posture, small
reactions to what happens around the character, natural pauses and purposeful gestures. Background characters
never all move identically: some watch, some talk, turn, work or react. The scene should feel like a living
place, not a set of animated objects.

## 2. Character animation

### 2.1 Body mechanics

- **Anticipation:** a small preparatory move before a big one.
- **Action:** the main move with fitting timing and weight.
- **Follow-through:** hair, clothing and accessories settle after the move.
- **Overlapping action:** body parts don't all start and stop on the same frame.
- **Weight and balance:** believable balance when walking, turning, sitting, lifting or reaching.
- **Ease-in / ease-out:** no mechanical starts and stops.
- **Secondary action:** small supporting actions that don't distract from the main one.

### 2.2 Character-to-object interaction (extremely important)

Hands never float near objects or pass through them. Every interaction follows this sequence:

1. The character notices the object.
2. Eyes go to it.
3. Head and upper body respond.
4. The character reaches toward it.
5. The hand arrives at the correct contact point.
6. Fingers close around it appropriately.
7. The object responds to the contact.
8. The character uses or moves it.
9. Posture adjusts to the object's position and weight.
10. The character releases it naturally when done.

Examples: **picking up a book** (look, reach for the edge, close the hand, lift with wrist and elbow, adjust
the other hand, look at the book); **opening a door** (approach, look at the handle, grasp, turn, push/pull
with the body, door swings on its hinge, release, walk through); **writing** (believable grip, other hand
placed naturally, pen tip stays on the paper, the writing on the page matches the motion); **historical props**
(consistent hand placement, respect size and weight, the object stays attached while held; no clipping,
floating, teleporting or sudden position changes). This applies to every prop, tool, book, chair, table,
document, historical object and science demonstration.

### 2.3 Character-to-character interaction

Characters acknowledge each other: fitting eye contact, heads turn to whoever is speaking, expressions match
the conversation, gestures land on the spoken words, listeners react, no two characters share an identical
gesture, natural interpersonal distance, emotion shown through posture and face. Characters who are supposed
to be talking to each other never deliver separate monologues to the camera.

### 2.4 Facial expressions

Clear, changing expressions for curiosity, surprise, confusion, fear, confidence, excitement, sadness,
frustration, suspicion and happiness. No permanent smiles, no constant eyebrow movement, no exaggeration
without context.

### 2.5 Walking and running

Alternating legs, correct foot contact (no sliding feet), weight transfer, body responding to each step,
natural arm swing, stable head, correct direction. No floating, odd knee bends or robotic cycles. When a
character stops, they decelerate and settle into a balanced pose.

## 3. Cinematic camera direction

### 3.1 Every camera move needs a reason

| Shot | Use it to |
|---|---|
| Wide | establish location, scale, several characters |
| Medium | show interaction and body language |
| Close-up | emphasise a face or an important detail |
| Extreme close-up | highlight a document, mechanism, clue |
| Tracking | follow a moving character or action |
| Dolly-in | raise intensity or reveal information |
| Dolly-out | reveal surroundings, isolation, scale |
| Pan | reveal information or follow movement across a place |
| Over-the-shoulder | set up a conversation or show what a character sees |
| Low angle | scale, authority, dominance |
| High angle | geography, vulnerability, scale (the map views) |

### 3.2 Avoid repetition, but never go random

Vary shot sizes, camera positions, foreground/background depth, movement inside the frame and meaningful
transitions. Variety must never become random camera movement. A good continuous shot beats several
meaningless cuts.

### 3.3 Composition

Rule of thirds, leading lines, foreground framing, depth separation, balanced negative space, consistent
screen direction. Important characters and information stay readable on a phone screen (9:16 safe areas:
keep the bottom ~400 px for captions/UI).

## 4. Which Life Next (American history)

1. **Authenticity.** Research clothing, architecture, transport, furniture, everyday objects, geography and
   documents of the period. No modern objects. Don't present invented details as fact; mark artistic
   reconstruction where evidence is uncertain.
2. **Tell, don't illustrate word by word.** Translate the meaning of the narration into cinematic beats. For
   "he was secretly planning a decision": establish the place, show him examining documents, bring in a second
   character, show the exchange, close-up the key document, transition to the next event.
   **Never** a 3D character standing in front of a background talking. Use blocking, meaningful actions,
   environmental storytelling and accurate props.
3. **Living environments, used sparingly.** Flags, wind in trees, smoke from real sources, people working in
   the background, horses and carriages, curtains, candlelight, weather, period street life. Not every effect
   in every scene.
4. **Human emotion.** Reactions, fear, uncertainty, determination, political tension, public excitement,
   confusion, personal consequences, carried by faces, composition, pacing and sound, not only narration.
5. **Continuity.** Same face, clothing, hairstyle, accessories, locations, object positions, lighting and
   time of day across connected shots unless the story changes them.
6. In the map format: the map views are the high-angle geography shots; ground scenes are where the people,
   props and emotion live. A ground scene must show an action with a purpose, never a figure standing on a
   backdrop.

## 5. Scientific Bithi (Bangla comic science)

1. **Recognisable comic identity.** Recurring characters whose personalities drive the humour: মামা is
   confidently, funnily wrong; বল্টু asks what the viewer is thinking; বিথী explains in correct scientific
   language (or summons a scientist, per the scheduled task's cameo rules). Expressive reactions, colourful
   science settings, comic timing, visual metaphors, creative transitions. No slideshow animation.
2. **Explain visually.** Every concept gets a demonstration: gravity (an object falls, then the idea is
   shown), electricity (a simple circuit with animated electron flow and labels), the brain (a character with a
   stylised brain, parts lit up), space (planets, orbits, scale comparisons, purposeful camera), chemical
   reactions (a simplified but accurate picture of what changes). Metaphors must never create misinformation.
3. **Humour from behaviour and situation:** someone explains confidently → someone misunderstands → surprise
   reaction → a visual demonstration resolves it. Use reaction timing, facial exaggeration, comedic pauses,
   well-timed gestures, unexpected but relevant reveals. No random dancing, bouncing or needless movement.
4. **Bangla sync.** Lip movement, expressions, gestures, key narration words, demonstrations and on-screen
   Bangla text land together. Natural Bangla typography, never too small for a phone. Keep English scientific
   terms where they're more natural than a forced translation.

## 6. Storytelling and retention

- **First 1–3 seconds:** open on an interesting visual or story moment. No logos, greetings, long intros or
  slow establishing shots without a hook. History: a mysterious moment, a shocking decision, an unanswered
  question, the dramatic event shown before its explanation. Science: an unusual phenomenon, a funny
  misconception, a surprising experiment, a question viewers want answered. Curiosity, never a false promise.
- **Visual story arc:** hook → situation → central question/conflict → development → new information →
  build to the payoff → satisfying conclusion. Every section gives a reason to keep watching.
- **Visual changes follow meaning:** new information, a location change, a reaction, a newly important object,
  a turning point, a change in a scientific process. Don't force a cut every few seconds without a reason.
- **Sound design supports the picture:** footsteps on ground contact, door sounds on door movement, fitting
  ambience, subtle object sounds, music matched to intensity, carefully timed reveal SFX. Don't overload; no
  loud effects to force attention; voice always clear.

## 7. Production workflow and quality control

### 7.1 Ten stages for every video

1. **Research:** topic, audience, accuracy, the central storytelling opportunity. Read the channel's learning
   database first (section 8.3).
2. **Script:** per `scriptwriting-rules.md`.
3. **Storyboard (mandatory, before generating anything):** see 7.2.
4. **Animation direction:** movement, expressions, prop interactions, camera, environment, timing and sound
   sync for each scene.
5. **Production:** animate keeping characters and environments consistent; review and fix.
6. **Editing:** sync narration, music and SFX; pacing; mobile readability.
7. **Thumbnail:** per `thumbnail-rules.md` and `CLAUDE.md` (Figma only).
8. **QA:** watch the whole video, check every scene with 7.3, verify facts.
9. **Publishing:** title, description, metadata; record URL and IDs in the logs.
10. **Performance learning:** section 8.

### 7.2 Storyboard

Save it next to the script (Which Life Next: a `## Storyboard` section in `social/scripts/<id>.md` or the
working story file; Scientific Bithi: `episodes/short-NN/storyboard.md`). One row per scene:

| # | Time | Narration / line | Purpose (from 1.2) | Shot + camera move (and why) | Characters: position, action, eyes, expression | Object interactions (contact points) | Environment animation | SFX / music cue |
|---|---|---|---|---|---|---|---|---|

Check the storyboard before animating: is every scene purposeful, is the camera varied but motivated, does the
first scene hook in 1–3 s, is there any scene that is "character stands and talks"? Fix it on paper first.

### 7.3 Mandatory scene inspection

- **Character:** consistent face and proportions, believable expressions, natural movement.
- **Object interaction:** correct hand position, believable grip, contact kept, object responds; no floating,
  clipping or teleporting.
- **Animation:** smooth, good timing, believable weight, no unnatural pauses, every movement has a reason.
- **Camera:** fitting framing, motivated movement, subject easy to read.
- **Visual quality:** no rendering defects or distorted objects, consistent backgrounds, details visible on a
  phone.
- **Audio:** narration synced, fitting SFX, balanced music.

Never accept a scene with broken hand-object contact, wrong movement, distorted faces, inconsistent
appearance, unnatural transitions, glitches or poor sync. Fix it before final production. Never hide defects
with extra camera moves or effects. Check stills and spot-check frames of the final file; fix only the affected
range where the toolchain allows it.

## 8. Continuous improvement system

### 8.1 Use real data, never guess

**YouTube Shorts** (vidIQ first, YouTube Analytics API via `yt.py analytics` as fallback; say which):
views, shown in feed vs viewed (engagedViews ÷ views = not swiped away), average view duration, average % viewed,
retention curve, rewatches where measurable, likes, comments, shares, subscribers gained, and performance by
topic bucket and format.

**Facebook Reels/videos** (Graph API): plays/views, average watch time, retention, early response, shares,
comments, reactions, follows, reach/distribution, by topic and format.

Use the metrics that are actually available and say which ones weren't. Never invent missing data.

### 8.2 Diagnose every published video

1. Topic. 2. Opening hook (line). 3. First visual. 4. Retention. 5. Where viewers leave. 6. Animation quality.
7. Narration and pacing. 8. Ending. 9. Comparison with the channel's other videos. 10. The single most likely
improvement.

Classify the main cause as one of: weak topic, weak packaging, weak opening, poor pacing, unclear story, weak
animation, audience mismatch, limited distribution. Don't blame animation by default.

### 8.3 Learning database (one per channel, never mixed)

After each published video, add a row to the channel's file in `social/learning/`: date, title, platform +
ID, topic/bucket, length, opening hook, first visual, animation style and interaction techniques, thumbnail
concept, the metrics (filled in once data exists, usually 2–3 days later), retention notes, what worked, what
failed, what to change next time, and the experiment tag (8.4) if any. These files live on `main`; scheduled
tasks on other branches read them with `git show origin/main:social/learning/<channel>.md` and write rows as
described in the file's header.

**Before making a new video, read that channel's database** and the rows for similar topics and styles. Don't
repeat a weak creative approach without a stated reason.

### 8.4 Controlled experiments

Change one thing at a time: the opening approach, animation style, narration pace, visual storytelling
approach, character expressions, thumbnail composition or story structure. Tag the videos in the database
(e.g. `EXP-hook-question-vs-statement`), compare across several comparable videos, and don't conclude from one
video or a tiny sample. Keep the experiment list and its status at the top of each database.

### 8.5 Weekly review

Every week (scheduled task "Weekly channel performance review"), per channel separately:

1. Review the week's published videos and fill in missing metrics.
2. Name the best and weakest performers.
3. Find patterns (topic, hook type, first visual, length, style, thumbnail).
4. Read audience comments; note repeated questions and requests.
5. Record successful techniques in the database's "Proven practices" list.
6. Update the experiments list (start, continue, conclude).
7. Propose rule changes with the evidence. Small, evidence-backed additions to a channel's "Proven practices"
   are recorded directly; changes to this rulebook or to `CLAUDE.md` are proposed to the owner first.

The objective is measurable improvement, not more videos. Never assume a new technique is better without
evidence.

## 9. Thumbnails and packaging

Follow `thumbnail-rules.md` and `CLAUDE.md` (built in Figma, artwork from the ChatGPT model inside Figma, live
text). Read the full script, find the most interesting event and the strongest curiosity angle, one central
subject, a short headline, readable on mobile. History: historically relevant subjects and places, cinematic
contrast, no unrelated dramatic imagery. Science: expressive comic characters (বিথী on every cover), the
concept shown clearly, a short readable Bangla heading, a real curiosity gap. No clutter, excess text, generic
templates or misleading covers.

## 10. Final command

- Never sacrifice quality for unnecessary movement.
- Never sacrifice storytelling for visual effects.
- Never sacrifice scientific or historical accuracy for entertainment.
- Never assume the previous production method is perfect.

**Every new video should benefit from what we learned from previous videos.**
