# NorthStar Dizital — Facebook Page playbook

Page: **NorthStar Dizital** (`1390585830800081`), posted through Clawlink (`integration: facebook`).
Audience: local business owners in Bangladesh — salons, parlours, clinics, doctors, restaurants,
cleaning and other service businesses.

The owner approved daily publishing without further approval (2026-10-29).
Follow this file exactly; it is the brief. Voice and audience: `brand-voice.md`.

## Use the marketing skills every time

Load these with the Skill tool before writing — they make the output better, and the owner asked
for them to be used on every post:

| Step | Skill |
|---|---|
| Pick topic / angle | `social-media-skills:facebook-strategy`, `social-media-skills:content-pillars` |
| Caption | `social-media-skills:caption-writer` (+ `social-media-skills:hook-writer` for the first line) |
| Video script | `social-media-skills:short-form-video-script` |
| Persuasion check | `marketing-psychology` (one principle per post, never manipulative) |
| Final polish | `humanizer:humanizer` — the caption and script must read like a person wrote them |

If a skill is unavailable, say so in the log row and continue with this playbook.

## Schedule (Asia/Dhaka, UTC+6)

| What | When |
|---|---|
| 1 photo post | every day, 12:30 |
| 1 explainer video | Sat, Mon, Wed, Thu at 20:30 (4 per week) |

Create both in the morning run and hand them to Facebook with `published: false` +
`scheduled_publish_time` (Unix seconds, UTC), so they go live on time.

## Language and voice

- **Always Bangla.** Write the way a Bangladeshi business owner actually talks. Do not force-translate:
  keep technical words in English (website, Facebook page, Google, search, WhatsApp, booking,
  online, AI, chatbot, landing page, SEO, domain, hosting, mobile, click, algorithm, design).
- Use Bangla digits in Bangla text (৳৮,০০০, ৩–৫ দিন). Phone number and URL stay in Latin.
- Friendly, practical, no hype. Every post gives one useful idea, then a soft call to action.
- Only facts from the website (services, prices, timelines, projects). **Never invent** statistics,
  client names, reviews, ratings or results. Project screenshots in `assets/projects/` are real
  portfolio/demo work; the doctor and cleaning sites are demos — never call them clients.
- Prices: Starter ৳৮,০০০–১২,০০০ (৩–৫ দিন) · Business ৳১৮,০০০–৩০,০০০ (৭–১২ দিন) ·
  Premium AI ৳৩৫,০০০–৬০,০০০+ (২–৪ সপ্তাহ). Services: business website, landing page, e-commerce,
  UI/UX, maintenance, AI solutions, AI voice assistant / chatbot.
## Captions: short, human, problem → CTA

Every caption, photo or video, is **3–5 short lines, under ~300 characters**:

1. **Line 1 = the problem**, in the owner's words, inside Facebook's ~80-character preview.
   A specific moment beats a general statement ("রাত ১১টায় customer message দিল… সকালে দেখলেন।").
2. **1–2 lines** that twist the knife or show the fix — no feature lists, no long checklists.
3. **One CTA** with the WhatsApp number: `👉 WhatsApp করুন: +880 1872-692783` (vary the wording).
4. Optional: 1 hashtag `#NorthStarDizital` (Facebook hashtags do little; max 2).

Example:
> Customer আপনার নাম Google করলো... পেলো শুধু একটা পুরনো Facebook post। 😬
> তারপর? সে call দিলো পাশের দোকানে।
> আপনার নিজের website — ৩–৫ দিনে ready, শুরু ৳৮,০০০।
> 👉 এখনই WhatsApp করুন: +880 1872-692783
> #NorthStarDizital

Write 3 first-line options, keep the strongest, then run the humanizer pass.

## Design: never the same look twice in a row

Photo themes (`design.theme` in post.json, rendered by `templates/photo.html`, 1080×1350):
`pop` (cream bento) · `brutal` (yellow neo-brutalism, `sticker` optional) · `mesh` (vivid gradient glass) ·
`editorial` (magazine serif, `issue` optional) · `retro` (rickshaw-art sunburst, Galada) ·
`device` (phone mockup, `image` = a file in `assets/projects/`).

Video themes (`templates/video.html`, 1080×1920): `pop` · `brutal` · `mesh` · `retro`.

Rotate: pick a theme that is **not** among the last 3 used for that format (see the log).
Headline: `*word*` marks the highlighted part. Keep headlines ≤ 8 words, points ≤ 4 words each.

## Videos

- 35–55 seconds, 5–7 scenes. Scene types: `hook`, `search`, `statement`, `showcase`, `features`, `cta`.
  Start with a hook that names a real pain; end with `cta` (price + WhatsApp).
- Each scene has `say` (the spoken Bangla line, human and conversational — short sentences,
  rhetorical questions, "..." for natural pauses) and optional `tone` (`curious`, `warmly`,
  `excited`, `serious`…). On-screen text is shorter than the spoken line.
- Voiceover: ElevenLabs `creative_generate_speech`, model `eleven_v4`,
  voice **Tazim – Natural Bangla & Banglish** `yBrGXLW1RaXDUjUf3kQi`.
  Prompt = exact output of `node social/facebook/render.js prompt <post.json>`. Call it **once**
  with **`generations_count: 1`** (one take per video — owner's instruction; never call again to
  retry), poll `creative_get_flow_run_status`, download the take to `voice.mp3` beside post.json.
- Check layout first: `PREVIEW=2,10,20 node social/facebook/render.js <post.json>` and look at the
  stills; delete the preview PNGs after. Then render (≈10 min): `node social/facebook/render.js <post.json>`.

## Daily run, step by step

1. `git pull`. Read `post-log.md`: which topics and themes were used recently.
2. Pick today's photo topic (and video topic on video days) from the topic bank below — one not used
   in the last 20 posts. Vary the business type you speak to.
3. Create `posts/NNN-photo-<slug>/post.json` (and `NNN-video-<slug>/post.json`), next number in sequence.
4. Render. Look at every image / preview still yourself: no overflowing or clipped text, no awkward
   line breaks, contrast fine. Fix and re-render if needed.
5. Commit and push the post folders to the working branch (media must be on GitHub so Facebook can
   fetch it). Media URL:
   `https://raw.githubusercontent.com/hasankhshifat-lang/Northstar_dizital_agency/<branch>/social/facebook/posts/<folder>/<file>`
   — confirm it returns HTTP 200 before posting.
6. Schedule with Clawlink:
   - photo: `create_photo_post` {page_id, url, message: caption, published: false, scheduled_publish_time}
   - video: `create_video_post` {page_id, file_url, title, description: caption, published: false, scheduled_publish_time}
7. Set `status: "scheduled"` and the returned post id in post.json, add a row to `post-log.md`,
   commit and push.
8. If something fails (voice credits, Clawlink, render), still post the photo if you can, log what
   failed in `post-log.md`, and never post a half-finished or broken video.

## Topic bank

Websites: Facebook page বনাম website · Google-এ খুঁজে পাওয়া · mobile-friendly কেন জরুরি ·
WhatsApp button দিয়ে বেশি enquiry · Google Maps-এ location · service/price page কেন দরকার ·
landing page কী, কখন লাগে · domain আর hosting সহজ ভাষায় · website বানাতে কী কী লাগে (owner checklist) ·
slow website-এ customer হারানো · পুরনো website-এর ৫টা লক্ষণ · e-commerce: Facebook order বনাম online shop ·
maintenance কেন লাগে · SEO-friendly structure সহজ ভাষায়.
AI: AI voice assistant কীভাবে call ধরে · রাত ১১টার enquiry-ও miss না করা · chatbot দিয়ে booking ·
AI কোথায় সত্যি সময় বাঁচায় (আর কোথায় না).
Industry: salon/parlour · bridal studio · clinic/doctor appointment · restaurant menu & booking ·
cleaning service quote form · coaching centre · freelancer/personal brand portfolio.
Agency: আমাদের ৪ ধাপের process · ৩টা package তুলনা · portfolio project spotlight (bridal, doctor demo,
cleaning concept, personal portfolio) · FAQ (কত দিন লাগে? কী দিতে হবে?) · behind the scenes.
Seasonal: Eid/Pohela Boishakh/wedding season offers — only if the owner has given an offer; otherwise
seasonal tips without discounts.
