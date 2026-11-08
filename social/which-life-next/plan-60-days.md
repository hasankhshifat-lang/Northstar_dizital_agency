# Which Life Next: 1 Short a day, 10M views in 60 days

Owner request (2026-11-08): **one Short per day**, an interesting and unique script every time,
target **10M views in 60 days** (2026-11-09 → 2027-01-07). Research topics, scripts and thumbnails properly.

## Data sources used (2026-11-08)

- **vidIQ: not usable today.** 4 credits left, every call costs 5; credits renew 2026-11-30
  (150/month on the current plan). A daily vidIQ step needs a bigger plan.
- **YouTube Analytics API: disabled** in Google Cloud project 168994544641, so retention / CTR /
  traffic sources are not available.
- **Used instead:** YouTube Data API search through our own client: 18 history queries, US region,
  English, Shorts published since 2026-08-10, top 25 by views each → **430 Shorts from 361 channels**.
  Raw data: `research/history-shorts-2026-11-08.json`.

## Where we are

18 videos, 12 subscribers, ~7.2K channel views. The public Shorts get **~1,000–1,700 views each and stop**:
YouTube tests them with a small audience, and they don't get pushed further.
Best so far: *They Carried Mail 1,900 Miles in 10 Days… on Horseback* (1,698), *He Mailed Himself to
Freedom in a Wooden Box (1849)* (1,512), the 1888 blizzard POVs (~1,200–1,300).
The common thread in the best ones: **one unbelievable true feat or survival story about one person or one group.**

**The math:** 10M in 60 days = **~167K views a day** = an average of 167K per Short at 1 a day. Today
we average ~1.2K. That only happens if a few Shorts break out to millions (the usual way:
1–3 Shorts with 2–5M carry the total). The plan below is built to raise the odds of a breakout every day;
it is not a guarantee, and on today's numbers it is unlikely without a breakout in the first 2–3 weeks.

## What the winners do (430 history Shorts, last 90 days)

1. **They are short.** Of the 241 English history Shorts with 1M+ views, the median length is **60 s**;
   77 of them run under 35 s, and most of the biggest small-channel outliers run **7–35 s**
   (*How Roman Sailors Made Seawater Drinkable*: 23 s, 12.4M views, 46K-sub channel, 99× its average;
   *The Oldest Wine In The World*: 8 s, 10.5M, 13K subs, 138×). Ours run **~2 minutes**.
   Shorts are pushed on % watched and replays; a 2-minute Short has to hold people 4× longer than a 30 s one.
2. **One clear question or claim in the first second**, readable without sound:
   "How did X do Y?", "The REAL story of…", "Why there are two…", "He survived the Titanic drunk".
3. **Topics that travel:** Titanic (23 of the 1M+ hits), Wild West / gunfighters, WW2 inventions and
   true war stories, "how people in the past did X" (water, food, hygiene, medicine), cruel punishments
   and worst jobs, maps / borders / "why America looks like this", unsolved mysteries, pirates.
4. **Small channels break out all the time** (30–140× their average), so the channel size is not what holds us back.
5. **Titles are short and curious** (5–9 words, one emoji at most, no year at the start).

## The new daily recipe

### Topic (pick from `topic-queue-60d.md`, top to bottom, unless a research pass finds better)
- One person or one object, one unbelievable true outcome, explained by a map or a place.
- Must pass the "would a stranger stop scrolling?" test in 6 words.
- Rotate the winning buckets: Titanic / Wild West / war stories & inventions / how-they-did-it /
  punishments & jobs / maps & borders / mysteries / survival feats. Never the same bucket 2 days running.
- Prefer US stories (our audience) but take the best story in a winning bucket.

### Script: 45–60 seconds, 110–150 words (recommended; the owner decides, see below)
1. **0–1 s:** the most shocking true fact as on-screen text + voice, mid-action. No date card, no "rewind".
2. **1–5 s:** the question that makes them stay ("…so how did he get out?").
3. **5–45 s:** 4–6 beats, each a new image every 2–4 s; one number or name per beat.
4. **Last 5 s:** the payoff in one line, ending on a sentence that loops back into the first line.
5. No "subscribe", no outro, no sources on screen (sources go in the description).
6. Real facts only, 2+ sources that agree; no invented quotes.

### Visuals and sound
Keep the approved channel look (map + ground scenes, Jesse voiceover, ducked SFX, captions in 1–4-word chunks),
but cut harder: a new shot every 2–4 s, and the first frame must already show the hook text and the main subject.

### Thumbnail and title
- Shorts in the feed show the video, not the thumbnail, so **the first frame is the real thumbnail**:
  big 2–5-word hook text + the subject, readable at phone size.
- Still make the map-style 9:16 thumbnail (youtube-thumbnail-creator skill) for search, the channel page and the Shorts shelf.
- Title: 5–9 words, curiosity first, `#shorts` at the end. E.g. "He Survived the Titanic Drunk", not "POV: April 15, 1912…".

### Posting
- 1 Short a day at the slot with the most US views so far (start with **21:00 SGT = 08:00 ET**,
  test 06:00 SGT = 17:00 ET in week 2).
- Cross-post the same file to the Which Life Next Facebook Page (existing rule).

### Measure and adjust (every day, 2 minutes)
- Views at 24 h and 72 h per Short (YouTube Data API until Analytics is enabled).
- A Short that passes **10K in 24 h**: make 2 follow-ups in the same bucket within 3 days ("Part 2", same title pattern).
- A bucket that stays under 2K for 3 Shorts: drop it for 2 weeks.
- Weekly: re-rank the buckets and rewrite the next 7 topics in the queue.

## What the owner needs to do to make this work properly

1. **vidIQ credits:** upgrade the plan (or wait for the 150 credits on 2026-11-30). With credits,
   the daily job adds keyword checks, outliers and title/thumbnail scoring for each Short.
2. **Enable the YouTube Analytics API** in project 168994544641 and re-authorize with
   `yt-analytics.readonly`, so the job can see retention and swipe-away rates, the numbers that decide Shorts.
3. **Claude usage:** the daily Shorts task failed on 2026-11-07 and 11-08 with "usage limit reached",
   so nothing has been posted since 2026-11-05. Moving to 1 Short a day cuts the work by ~75%, but the
   task still needs plan usage left when it fires.
4. **Decide the length:** 45–60 s (what the data supports) vs the approved ~2-minute format.
