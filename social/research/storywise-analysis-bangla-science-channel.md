# Storywise (@storywiseacademy): breakdown, and a blueprint for a Bangla comic science channel

Prepared 8 Nov 2026 for NorthStar Dizital.

**Data sources.** vidIQ is connected but had no credits left, so the numbers come from the
YouTube Data API through the agency's own client (public stats for all 158 public videos).
For the visual analysis I studied thumbnails plus YouTube's auto-generated mid-video frames
(at 25 %, 50 % and 75 % of each video) for 12 top videos. That makes 36+ real frames. I could
not download full videos (YouTube blocked the download with a bot check), so the notes on
motion come from those frames, the credits and the video lengths, not from frame-by-frame playback.

---

## 1. The channel in numbers

| Metric | Value |
|---|---|
| Created | 11 Nov 2024 (India) |
| Subscribers | **1.53 M** |
| Total views | **293.6 M** |
| Public videos | 158 (166 incl. private/members) |
| Format split | 143 Shorts (≤ 3 min), 15 long/landscape |
| Median views, Shorts | **924 K** |
| Median views, long-form | 247 K |
| Like rate | **4.25 %** of views (very high; 2 % is normal) |
| Positioning | "Concept-driven stories aligned with CBSE syllabus for 11th & 12th Physics" |
| Keywords | Physics, NCERT, JEE, NEET, 11th/12th Physics, fun learning |
| Team (from credits) | Gaurav Pant (creator / voice), Aditya Pandit (sketches, storyboard), Subin Philip (animation), script assistants, an educator for accuracy |

They reached 1.5 M subscribers in **under 2 years with only ~160 videos**. They won on quality per video, not volume.

### Top 10 videos

| Views | Length | Title (story hook + concept) | Physics concept |
|---|---|---|---|
| 21.2 M | 2:07 | पृथ्वी का circumference | Eratosthenes measures the Earth |
| 12.5 M | 1:41 | खजाने की खोज (Treasure hunt) | Refraction, total internal reflection |
| 12.3 M | 2:56 | गयी भैंस कुंए में (Buffalo fell in the well, a Hindi idiom) | Pulley systems, tension |
| 11.7 M | 1:13 | Torque या Speed? | Rotational power, gears |
| 11.1 M | 3:00 | मूँछों वाले glass (Moustache glasses) | Standing waves, resonance |
| 9.3 M | 2:07 | तांगे का चक्कर (Horse-cart race) | Moment of inertia |
| 8.6 M | 3:00 | Wheatstone bridge | Bulbs in a bridge circuit |
| 8.5 M | 1:14 | एक बिजली से कितने फ़ोन चार्ज? (How many phones can one lightning bolt charge?) | Static electricity |
| 7.5 M | 2:59 | Prison break | Rotational equilibrium |
| 7.5 M | 2:58 | Geyser का तार (The geyser wire) | Resistance ∝ 1/Area |

### What the numbers say

1. **Length sweet spot: 60–180 s.** Median by length: < 60 s = 124 K, 60–120 s = 1.10 M,
   120–170 s = 777 K, **170–180 s = 1.34 M** (57 videos, their most used length). The 15–50 s
   clips flopped. These are **story Shorts that use the full 3-minute Shorts limit**, not quick clips.
2. **Their decline is a warning.** Monthly median views: about 2–3 M in early 2025 →
   about 1 M in late 2025 → **83 K in Oct 2026**. The fall lines up with the shift to app
   promotion, sponsors (LPU, Physics Wallah cameos), behind-the-scenes posts, live streams and
   ads. Their 18 app/meta videos have a median of only **62 K**. Lesson: the audience subscribed for stories.
   Keep promotion inside the stories, never as standalone videos.
3. **Comments come from puzzles.** The top videos end on a question, such as which bulb glows
   brightest or where lightning will strike. The 3,687 comments on the buffalo video are mostly
   viewers answering.
4. **Long-form is secondary.** The 5–7 min landscape "deep dives" (Volta's frog battery, earthing)
   get 80–120 K. Start Shorts-first and add long-form later.

---

## 2. Visual style: graphics and art direction

### 2.1 Screen layout (the "Storywise frame")
Every Short uses the same vertical 9:16 template:

```
┌──────────────────────────┐
│  [orange title tag]  (S) │  ← small orange label with the Hindi story title, logo badge top-right
│                          │
│   DIAGRAM / CONCEPT ZONE │  ← top ~45%: clean cream/white background, minimal vector diagram,
│   (arrows, formula,      │     red arrows, labels, formulas, zoom circles
│    zoom-in circle)       │
├──────────── soft fade ───┤
│                          │
│   STORY SCENE ZONE       │  ← bottom ~55%: illustrated scene with the characters
│   (watercolour scene,    │
│    characters acting)    │
│                          │
└──────────────────────────┘
```

- The **story** and the **science** are on screen together. While the characters act, the concept
  builds above them. The viewer never leaves the story to get a lecture.
- Sometimes the scene fills the whole frame (opening and ending), and the diagram
  panel slides in only at the "explain" moment.
- A **circular magnifier inset** (a circle with a thin border) zooms in on a detail, such as
  a moustache mark on a glass, a spanner, or a wire cross-section.

### 2.2 Illustration style
- **Hand-drawn ink line art** with slightly uneven, sketchy black outlines (drawn by a
  sketch artist, not vector-perfect).
- **Watercolour/gouache backgrounds**: soft washes, paper texture, muted warm palette
  (cream, ochre, terracotta, sage green, dusty blue). Backgrounds are rich and detailed
  (Rajasthani havelis, bazaars, village wells, mechanic shops, jail cells, kitchens).
- **Characters are flatter and brighter than the backgrounds** so they stand out: flat fills,
  little shading, bold silhouettes.
- **Diagram zone is the opposite of the scenes**: flat, clean and almost textbook-like, on a cream/white
  background. A thin dark line, **one red accent colour** for arrows and the key variable,
  and a simple sans-serif for labels and formulas (I = mr², r = ρl/A, ln(T−Tr)/(T0−Tr) = −kt).
- Cultural specificity: every scene is clearly *North Indian*. Turbans, dhotis, tongas,
  buffaloes, geysers, chai, "PURE VEG" dhabas. Viewers see their own world.

### 2.3 Typography and branding
- Title tag: small **orange rounded rectangle** with dark text, top-centre, always on screen.
- Logo: a small circular badge (a swan/"S" mark) in the top-right corner, plus a faint "Storywise"
  watermark inside the art.
- Credits in a handwriting font, overlaid near the end.
- Thumbnails (the Short cover) = a strong frame from the video with the title tag. No big
  clickbait text on Shorts. Long-form covers use bold hand-lettered text ("THIS MIGHT SHOCK YOU!",
  "WORLD'S FIRST BATTERY") over a watercolour object illustration.

---

## 3. Motion and animation

From the frames, the credits ("Animation: Subin Philip") and the pacing, this is **limited 2D
animation (cut-out/puppet style)**, not full frame-by-frame:

- **Camera moves on still art**: slow push-ins, pans across wide watercolour scenes, and cuts
  between wide and close shots.
- **Cut-out character rigs**: heads, arms and mouths move separately (puppet rigs in After
  Effects or similar). Big readable poses: shouting, pointing, scratching the head, falling.
- **Diagram build-ups**: arrows draw in, vectors grow, formulas appear term by term, and a
  red arrow taps the important variable. Concentric circles pulse for sound or waves. A glowing bulb
  is the "idea" cue.
- **Comic devices**: speech bubbles, thought bubbles (a character imagines the solution),
  question marks, motion lines, a light-bulb "aha".
- **Gag animation**: exaggerated physical comedy at key beats (a man flying off a bike, a buffalo
  dangling from a rope, a king splashing in the bathroom).
- **Sound**: one narrator voice (the creator, in conversational Hinglish) plus character
  voices, Creative Commons stings and horns (Kevin MacLeod, Audionautix), and comic SFX.

The pacing is **one new visual beat every 2–4 seconds**, which keeps 2–3 min Shorts watchable.

---

## 4. Characters

| Type | Examples seen | Role |
|---|---|---|
| The **confused common man** | Moustached uncle in dhoti/kurta, a tonga driver, a mechanic's customer | Has the everyday problem; asks the viewer's question |
| The **royalty/boss** | A Maharaj in a vest, a fat king in the bath | Comic authority who makes absurd demands |
| The **clever solver** | Young student (later branded "Mr. Verto", the LPU mascot), bespectacled moustached engineer | Uses physics to solve the problem |
| The **teacher cameo** | Real educators drawn as cartoons (a Physics Wallah teacher in a "PW" T-shirt, "MR Sir", "Rajwant Sir ki class") | Credibility and cross-promotion. Appears in thought bubbles or classrooms |
| **Historical scientists** | Eratosthenes in the Library of Alexandria, Volta/Galvani with frogs | "Story of discovery" episodes |
| **Animals as props/jokes** | Buffalo, horses, donkey | The physical-comedy object |

Design rules they follow: **big noses, moustaches, turbans and caps as silhouettes**, 2–3 head-tall
proportions for adults, simple dot eyes with expressive eyebrows, clothing that tells you the
character's role at once. There is **no single permanent mascot** in most episodes. The cast is
an "ensemble of familiar types", which keeps each story fresh.

---

## 5. Storyline formula

Nearly every top video follows this 6-beat structure (2–3 min):

1. **Cold open with a funny or tense situation (0–10 s).** The buffalo has fallen in the well, a
   prisoner plans an escape, a thief steals sherbet, a king's geyser wire burns out.
2. **The impossible question (10–25 s).** "How do we pull it out with only 3 men?"
   "Which wire should he buy?" The viewer now wants an answer.
3. **Wrong attempt and comedy (25–60 s).** The obvious solution fails in a funny way.
4. **The science turn (60–120 s).** A clever character or teacher spots the principle. The
   diagram zone builds the concept (free-body diagram, formula, comparison). The story keeps going below.
5. **Resolution with a twist (120–160 s).** The principle solves the problem, often with a
   surprise (the buffalo is out, but the man falls in).
6. **Puzzle for the comments (last 10 s).** "Now tell me: which bulb will glow brightest?"

**Title formula:** `[Hindi idiom or story hook] | [English concept name]` with
#hashtags for the concept, exam and class (`#jee #neet #class11physics`).
Examples: "गयी भैंस कुंए में | Pulley problem", "दूध की चोरी | Newton's law of cooling".

**Tone:** gentle desi humour, never mocking the viewer. The narrator talks *with* the student.
Formulas appear but are always justified by the story.

**Syllabus alignment:** every episode maps to a chapter (playlists "11th Physics", 71 videos,
and "12th Physics", 55). Parents and teachers can trust it, and students find it by searching their chapter.

---

## 6. Why it works (the parts to borrow, not copy)

1. **Story first, concept second.** The viewer watches for the story and learns the physics along the way.
2. **Diagram and story in one frame** (split vertical layout).
3. **Familiar local settings and characters.** The audience sees their own world.
4. **Syllabus-mapped topics.** Every video answers something a student must learn.
5. **3-minute Shorts** with a beat every few seconds.
6. **A comment puzzle at the end** that drives engagement.
7. **Premium hand-made art** stands out in a feed full of stock and AI clips.
8. **Consistent template.** The orange tag and layout make every video recognisable.

---

## 7. Bangla market: the gap

A YouTube search (Bangla relevance, Bangladesh region) for science cartoon and animation channels:

| Channel | Subs | What it is |
|---|---|---|
| Alakh Pandey - Class 9 & 10 | 2.19 M | Lecture (Hindi), not Bangla stories |
| Mr. BonGrow Science | 1.59 M | Live-action experiments |
| Funny Toons Bangla Bhoutik | 891 K | Cartoon *ghost/horror* stories, not science |
| PW Bangla / PW Bangla 9 & 10 | 604 K / 277 K | Lectures (West Bengal board) |
| Science Bangla | 454 K | Space/universe documentaries |
| Classvel | 165 K | Class 6–12 lectures |
| Small channels ("মজার বিজ্ঞান 3D", "Science and cartoon bangla", "SciTales বাংলা", etc.) | < 40 K | Mostly generic AI 3D cartoons, few videos, no clear format |

**Conclusion:** there is **no strong Bangla channel doing story-driven, syllabus-mapped comic
science Shorts**. Demand is clearly there: lecture channels have millions of subscribers, and Bangla
cartoon stories (Bengali Fairy Tales, 10.5 M) prove the audience loves animated stories. The new
channel can be the first to combine the two.

---

## 8. Blueprint for the new Bangla channel

> **Important:** Use the *formula* (story + concept, split layout, local humour, syllabus
> mapping), but build an **original look, original characters and an original name**. Do not
> copy Storywise's art style, orange tag, cast or titles. Copying would hurt the brand and
> invite copyright and reuse problems.

### 8.1 Positioning
- **Promise:** "হাসতে হাসতে বিজ্ঞান। গল্পে গল্পে Physics, Chemistry, Biology।" ("Learn science while you laugh: physics, chemistry and biology through stories.")
- **Audience:** Class 6–10 (Bangladesh NCTB / SSC) first, then HSC. Also curious adults.
  A wider age range than Storywise's 11–12, so more evergreen everyday topics.
- **Subjects:** Physics, Chemistry, Biology (and simple Earth/space science). Rotate them by day.
- **Name ideas** (check availability as a handle, Facebook page and domain):
  "গল্পে বিজ্ঞান (Golpe Biggan)", "বিজ্ঞান বাবু", "হাসির ল্যাব (Hashir Lab)", "কেন রে? (Keno Re?)",
  "মজার মামা বিজ্ঞান", "Biggan Golpo Toons".

### 8.2 Original art direction (distinct from Storywise)
Pick one and keep it consistent:
- **Option A, "Rickshaw-art comic" (recommended).** Bold black outlines, saturated flat colours
  inspired by Dhaka rickshaw paintings (hot pink, teal, yellow, red), floral border motifs on
  title cards. It is instantly Bangladeshi and the opposite of Storywise's muted watercolour.
- **Option B, "Nakshi kantha paper."** Off-white paper texture, stitched-line borders, earthy
  red/indigo/mustard, cut-paper characters. Gentle, good for Biology and nature.
- **Option C, "Comic-book panels."** Scenes in classic comic panels with halftone dots, sound
  words in Bangla ("ধপাস!", "ঠাস!", "ভোঁ-ও-ও!"), and speech balloons. Very "comic" and fun.

**Layout (your own template):**
- 9:16 Shorts. A **story panel on top, the concept "lab notebook" panel at the bottom**
  (the reverse of Storywise), styled like a lined exercise-book page with a pencil/chalk
  font for formulas. One accent colour of your own (for example, rickshaw teal).
- Your own badge: for example, a small round "test tube with a moustache" logo, bottom-right.
- Keep the bottom ~15 % clear of key info (YouTube's Shorts UI covers it).

### 8.3 Original recurring cast (Bangladeshi everyday types)
| Character | Look | Personality / role |
|---|---|---|
| **মন্টু মামা (Montu Mama)** | Big belly, lungi and fotua, gamchha on shoulder, thick moustache | Runs a tea stall. Always has a "brilliant" wrong idea (the confused common man) |
| **টুনি (Tuni)** | Class 8 girl, two braids, school uniform, oversized glasses | The clever solver who explains with experiments |
| **বল্টু (Boltu)** | Tuni's little brother, round face, missing tooth | Asks the funny "keno?" (why?) questions, does the slapstick |
| **হেডস্যার (Headsir)** | Bald, punjabi, umbrella always under arm | Strict but loving. Sets up exam-chapter context |
| **রহিম চাচা (Rahim Chacha)** | Rickshaw puller / farmer, cap, sharp eyes | Practical village wisdom that turns out to be real science |
| **Guest scientists** | Jagadish Chandra Bose, Satyendra Nath Bose, Newton, Marie Curie, Darwin | "Story of discovery" specials. Bose episodes are a strong local hook |

Keep **3 core characters in every episode** (Montu Mama, Tuni, Boltu) for recognisability, and
rotate guests. Make a character sheet (front, side, 6 expressions, 6 poses) before episode 1.

### 8.4 Bangladeshi story settings
Tea stall, rickshaw, CNG auto, launch/ferry on the river, haor during the flood season, load-shedding
nights, the mango season in Rajshahi, hilsa market, Eid shopping crowds, cricket in an alley,
pond bathing, a jhalmuri seller, a monsoon rooftop, a village pitha festival, school science fair.

### 8.5 Episode script template (2:00–2:50)
| Time | Beat | Example ("লোডশেডিংয়ে মামার ফ্রিজ" / Mama's fridge in a power cut, Chemistry/Physics: heat transfer) |
|---|---|---|
| 0–8 s | Funny cold open | Load-shedding. Montu Mama's ice for the tea stall is melting. He wraps the ice in a **thick blanket**. Customers laugh: "কম্বল দিলে তো গরম হবে!" ("A blanket will just make it warmer!") |
| 8–20 s | The question | Boltu: "মামা, কম্বল তো গরম রাখে, বরফ গলে যাবে না?" ("Mama, a blanket keeps things warm. Won't the ice melt?") Hold on Boltu's face, then cut to the "?" |
| 20–60 s | Wrong idea / comedy | Mama tries a fan on the ice instead. It melts faster and a puddle soaks his lungi |
| 60–120 s | Science turn | Tuni: "কম্বল গরম তৈরি করে না, তাপ আটকে রাখে!" ("A blanket doesn't make heat, it traps it!") The notebook panel draws the arrows: heat from the air → blocked by the insulator. Conduction and convection labelled |
| 120–150 s | Resolution + twist | The blanket-wrapped ice survives. Mama now wraps *himself* in a blanket to "stay cold" and sweats |
| 150–165 s | Comment puzzle | Tuni: "বলো তো, কোনটা তাড়াতাড়ি গলবে: স্টিলের প্লেটে বরফ নাকি কাঠের প্লেটে? কমেন্টে লেখো!" ("Tell us: which melts faster, ice on a steel plate or on a wooden plate? Write it in the comments!") |

**Title formula (your version):** `[Bangla story hook] | [Concept in Bangla + English]`
for example: "কম্বলে বরফ? | তাপ পরিবহন (Heat Transfer)" ("Ice in a blanket? | Heat transfer").
Hashtags: `#বিজ্ঞান #ssc #class9 #physics #banglascience`.

### 8.6 First 30 topics (mixed subjects, everyday hooks, NCTB-relevant)
**Physics:** 1. Why the rickshaw bell rings (sound/vibration) · 2. Why a launch floats but a nail sinks (buoyancy) ·
3. Load-shedding and the IPS battery (current, power) · 4. Why a kite flies (pressure, Bernoulli) ·
5. Cricket swing (air flow) · 6. Why rods in a pond look bent (refraction) · 7. The tube-well handle (lever, torque) ·
8. Why pressure-cooker rice cooks faster (pressure, boiling point) · 9. Lightning in Kalbaishakhi storms (static charge) ·
10. A rainbow after rain (dispersion).
**Chemistry:** 11. Why rice burns and blackens (carbon) · 12. Why lemon cleans a brass pot (acid-base) ·
13. Rust on the rickshaw (oxidation) · 14. Why fish gets salted (osmosis/preservation) · 15. Bubbles in soda (CO₂, pressure) ·
16. Turmeric changes colour with soap (indicator) · 17. Why the gas stove flame is blue (combustion) ·
18. Why ice floats (density of water) · 19. Alum (phitkiri) cleans pond water (coagulation) · 20. How mosquito coils work (combustion, insecticide).
**Biology:** 21. Why we sneeze from pepper (reflex) · 22. Why the "lojjaboti" (touch-me-not) plant shrinks · 23. How a mango ripens (ethylene) ·
24. Why mosquitoes pick some people (CO₂, smell) · 25. Hilsa swimming upriver (migration) · 26. Why we get goosebumps ·
27. How a cut heals (blood clotting) · 28. Why onions make us cry · 29. Photosynthesis in the paddy field · 30. Jagadish Chandra Bose: plants feel pain? (history special).

### 8.7 Production pipeline (small team or solo)
1. **Research and script** (Bangla, about 250–350 words, the 6-beat formula). Get a science teacher to check facts.
2. **Storyboard**: 25–40 frames per Short, one per beat.
3. **Art**: draw it yourself or hire an illustrator (Fiverr/local), *or* use AI image generation
   **with a fixed style guide and character reference sheets** to keep it consistent. Do a hand clean-up
   pass so it doesn't look like generic AI.
4. **Animation**: cut-out rigs in **After Effects** (Duik/Joysticks) or **Moho / Cartoon
   Animator**. A budget route is **CapCut / Canva** keyframes and pan/zoom on layered PNGs.
   The diagram panel can be built in **Remotion** or After Effects templates so arrows and formulas animate the same way every time.
5. **Voice**: real Bangla voice actors strongly preferred (the creator's own voice is part of
   Storywise's charm). AI voice (ElevenLabs Bangla) is OK for drafts only.
6. **Sound**: CC0/licensed music and comic SFX, and credit them in the description.
7. **Captions**: burned-in Bangla subtitles (many people watch Shorts muted).
8. **Publish**: one Short every 2–3 days at first (about 12/month, the same pace Storywise used to
   grow), each in a class/chapter playlist. Later, one long-form compilation a month
   ("Class 9 Physics in 10 stories").
9. **Repurpose**: the same vertical video to Facebook Reels (very big in Bangladesh), TikTok and Instagram.

### 8.8 Growth and monetisation lessons from Storywise
- **Do:** syllabus playlists, puzzles at the end, consistent template, 3-min Shorts, local humour.
- **Don't:** put the channel's energy into app ads, behind-the-scenes and live streams. Their
  views fell from ~2–3 M to ~80 K per video once that happened. Fit sponsors (coaching centres,
  EdTech, stationery brands) *inside* a story as a short 5–8 s mention.
- Monetisation later: Shorts revenue, Facebook in-stream, brand integrations, a members-only
  "chapter pack", and eventually books/comics in Bangla.

---

## 9. Next steps (proposed)
1. Choose the name, art direction (A/B/C) and core cast → I can write the style guide and character sheet prompts.
2. Write and storyboard the first 3 pilot scripts in Bangla.
3. Make a pilot Short, test it on YouTube Shorts and Facebook Reels, and compare retention.
4. Once vidIQ credits are topped up: run Bangla keyword research for each of the 30 topics and order them by search demand.
