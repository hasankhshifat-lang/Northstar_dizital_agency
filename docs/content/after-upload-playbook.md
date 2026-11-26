# Video playbook: 6 steps before upload + 9 steps after (owner, 2026-11-25/26)

Owner: "Now follow all the steps for my YouTube channels as default" (after-upload, 2026-11-25) and "Follow the steps
for making videos for all of my YouTube channels and FB pages, make them as default" (before-upload, 2026-11-26).
Sources: "9 Things You Must Do After Uploading a YouTube Video" (8WrFkUODe1w) and "Stop Uploading Videos Like This,
Do These 6 Things First" (hEokaxsqaYo), same strategist; transcripts in the sessions of those dates. Their numbers are
one strategist's experience, not YouTube policy, so we treat them as **defaults and starting benchmarks**, measured
with `growth.py` like everything else and changed when our own data says so.

Applies to **every channel** (Which Life Next, As Printed, The Overthinking Pad, Foot All FC) **and every Facebook
Page** (see the Facebook sections), in chat and in every scheduled task. **The compliance rulebook
(`youtube-monetization-compliance.md`) wins** over anything here, and so do CLAUDE.md's owner rules (AI disclosure
YES on every upload, fixed slots, approval rules, channel looks and formats) except where this file says otherwise.
The scriptwriting rules (topic report + score ≥65), animation rules and the universal thumbnail skill still apply in
full; this playbook adds to them.

What the API can and can't do (checked 2026-11-25): `yt.py` can check processing/HD (`check`), post a comment
(`comment`), make and fill playlists (`playlist-create`, `playlist-add`), edit titles/descriptions/thumbnails. It
**cannot** pin a comment, add end screens, set a Short's "related video", run Test & Compare, or read copyright-check
results, impressions or CTR. Studio's Insights → **Research** tab ("What my viewers watched", "Outliers in my niche",
"Analyze title patterns") is also Studio-only; we use **vidIQ outliers** for the same job. Studio-only items are
**owner actions** (listed in step 10) or come from vidIQ.

---

# Part A: before upload (6 steps, owner 2026-11-26)

## A1. Topic from proven demand, not a hunch

- Before choosing a topic, research what has already worked, then make it **better and our own** (new research, our
  angle, our format; never a copy of the other video's script, structure or title: reused/inauthentic-content rules).
- **YouTube:** `vidiq_outliers` with the channel's niche keyword and `contentType` long or short, `publishedWithin:
  "oneYear"`, `minOutlierScore: 5`, `minViews: 10000`, `maxViews: 100000`, `maxSubscribers: 10000` (small channels
  whose video beat their own average because of the **topic**); then a second pass with `minOutlierScore: 10`.
  `minEngagementRate: 0.02` filters re-upload farms. 5 credits a call: one or two calls per run.
- **Facebook (Scientific Bithi, Bangla):** `vidiq_instagram_tiktok_outlier_search` with the science topic as `query`,
  `descriptionLanguage: ["bn"]`, `audienceQuery: "Culture/Region: Bangladesh/Bangla; Global: false; Demographics:
  school students classes 6-10 and families;"`, `outlierScoreMin: 5`, `followersMax: 10000`, `viewsMin: 10000`; plus
  `vidiq_outliers` (language `hi` or a Bangla keyword) when that finds too little. Which Life Next FB uses its YouTube
  research.
- If vidIQ is not connected or out of credits: YouTube Data API search (`yt.py`-style client) for recent videos on
  the topic, compare each video's views with its channel's average, and say vidIQ was unavailable.
- Owner (Studio, optional): Insights → Research → "What my viewers watched" shows what our own audience watches
  elsewhere; the weekly audit asks the owner for a screenshot/export when useful.
- Write a **topic list of ~10** in the channel's research folder (`youtube-growth/<ch>/research/topic-opportunities/
  <date>.md`; Bithi: the queue file) with four columns: **topic, that channel's subscribers, the video's views, outlier
  score** (+ link). Pick the highest-scoring topic we can make best, then run the usual topic report and score (≥65).
  Organise picks into sets of three (step 3 below).

## A2. Title before the video

- Before the script: write **5 titles**, then check each for: (1) the searched words at the start; (2) curiosity
  ("I have to see this"); (3) a promise the video really delivers (no clickbait: compliance section 4); (4) the key
  part inside the first ~40 characters (phones cut the rest). Pick one; keep a curiosity variant for the thumbnail
  headline or a later repackage. Optional: `vidiq_score_title`; owner can use Studio's "Analyze title patterns".
- The chosen title is the script's promise: the script must deliver it early (it is also the hook check).
- Save the 5 titles + the pick and why in the episode folder (`metadata.md`, step A4). Facebook: the same for the
  video title and the caption's first line (Bangla for Bithi).

## A3. Thumbnail before the video

- Decide the thumbnail concept and headline **before production** (universal thumbnail skill: three concepts, score
  ≥70): **3–4 words** (never more than 5), one clear eye-catching subject, and it **adds to the title, never repeats
  it** (title = promise, thumbnail = the emotion/urgency or the visual proof). Plan the shot/frame or asset it needs so
  production makes it.
- **Phone test:** put the rendered thumbnail next to 3–5 thumbnails of the research videos (from A1; `vidiq_get_images`
  or `vidiq_similar_thumbnails`) at phone size and ask honestly which gets clicked; redo if ours loses.
- Facebook covers: the same (Bithi style B rules stay).

## A4. All details ready before the upload starts

- Write `metadata.md` in the episode folder before uploading: final title; description whose **first two lines** say
  what the video is about with the searched words, then details, sources (as required), chapters with timestamps
  (long videos), "Narration voiced with AI."; tags; playlist/set; the end-screen target (A5); the question comment
  (after step 5); thumbnail file. The upload then copies from it, no improvising.
- Thumbnail and playlist are set in the same run as the upload. Facebook: caption, title, hashtags, cover and the
  set's previous video in `post.md`.

## A5. Settings, including the end screen

- Made for kids: **No** (`selfDeclaredMadeForKids=false`, yt.py default) unless a video really is for children.
- **AI disclosure: YES on every upload** (owner rule 2026-11-17; this overrides the video's advice to answer No).
  Paid promotion: No (yt.py sets both).
- Automatic chapters / featured places / automatic concepts: leave on (YouTube defaults); chapters in the description
  anyway.
- **End screen (never skipped):** pick the video that naturally comes **next** (the next video of the set, not the
  most popular one), write it in `metadata.md` and the log row. The API can't set end screens, so the report lists
  "owner: end screen → <video>" until the owner sets it (or sets a channel-wide end-screen template in Studio:
  Settings → Upload defaults). The last ~20 s of every long video must leave room for it (no key info or captions
  there). Shorts: the long video goes in the description (related video = owner, step 10). Facebook: no end screens;
  the caption links the next/previous video of the set.

## A6. Let the checks finish, then schedule off the round minute

- Upload as private with `--publish-at` at least 2 h ahead, 2–9 min after the slot (step 1 below); wait for
  `yt.py check` = ready. Copyright and Community Guidelines check results are Studio-only: if the owner reports a
  claim or the upload shows a rejection/failure reason, don't let it go public; report.

---

# Part B: after upload (9 steps, owner 2026-11-25)

---

## 1. Private first, public only when ready; publish off the round minute

- Upload with `--publish-at` (private until then; this is what yt.py already does). Never upload straight to public.
- Upload at least **2 h before** the slot. Before the run ends: `yt.py --channel CH check VIDEO_ID` must say
  `"ready": true` (processed, HD, Paid promotion No). Not ready → wait and re-check; still not ready ~30 min before
  the slot → move it to the channel's next free slot and say so. Look at title, thumbnail and description one last
  time against the compliance checklist.
- **Off-the-minute publishing (owner-approved change to the fixed slots):** publish **2–9 minutes after** the slot,
  never on :00/:15/:30/:45 (e.g. 7:00 PM slot → 7:03 PM ET; 8:00 PM → 8:06 PM). Vary the offset between videos. The
  slot keeps its name in the logs (e.g. "19:00 slot, published 19:03"), so publish-time results stay comparable.
- Slot choice stays with the owner; the weekly audit may propose a slot change from Studio's "When your viewers are
  on YouTube" (vidIQ `audience` report) as an experiment.

## 2. Share only where the audience is

- Never mass-send links (contact lists, unrelated groups, spam comments on other channels). Cross-posting to our own
  Facebook Pages stays as it is.
- If the owner shares a video in a community, it goes only to places about that topic, with one line on what the
  viewer gets from it. No link-dropping.

## 3. Schedule topics, not only times: sets of three

- Plan topics in **sets of three** for the same viewer interest (e.g. three 1918 stories, three money-scam stories),
  each with **its own story, angle and research** (no near-duplicates: the inauthentic-content rule wins). After
  three, move on or come back later from a new angle.
- Every set gets a **playlist**: create it with `yt.py --channel CH playlist-create "TITLE"` when the first video of
  the set is uploaded (check `yt.py playlists` first; never a duplicate), add each video with `playlist-add`, record
  the set in the channel's content calendar (`youtube-growth/<ch>/content-strategy/content-calendar.md`).
- Each description links the previous video of the set (and the long video for a Short).
- End screens pointing to the next video of the set: owner in Studio (step 10).
- Keep the fixed days and times (they are the channel's rhythm).

## 4. Don't touch it for 4 hours; first verdict at 12 h

- **No edits in the first 4 hours after publishing** (title, description, thumbnail, tags), except to fix a spelling
  mistake, wrong information or a compliance problem: fix those immediately.
- **First check at ≥12 h** (the next "YouTube growth: daily checkpoints" run): a video is a **repackage candidate**
  when impressions are flat (vidIQ `thumbnail_ctr` where connected) or, where impressions aren't available, its
  views/engagedViews at the 24 h checkpoint are in the bottom third of the channel's comparable videos (same format,
  ≥5 videos; otherwise no verdict). Label which signal was used; never invent impressions or CTR.
- Repackage = **one big, clear change** of title + thumbnail together (new concept, not a small tweak), still honest
  (compliance section 4/9), made with the universal thumbnail skill, scored ≥70. Prefer making the change in the
  evening (around 8–9 PM ET) so impressions arrive the next morning; if no run happens then, the next production run
  makes it.
- Studio **Test & Compare** (A/B of titles/thumbnails) beats guessing: the owner can start it in Studio; recommend it
  in the report for long videos.

## 5. Ask one 5-second question in a comment

- Every video gets **one channel comment with a question viewers can answer in 5 seconds**, specific to that video
  (e.g. "Would you have trusted the 1918 headline: yes or no?"). Never "thanks for watching, like and subscribe",
  never bait ("comment YES", "like if…"), never a link; a different question every video.
- Write it during production (save it as `pin_question` in the episode folder / log row). It is posted when the video
  is public: the comment-reply task posts it on any video public for <72 h that has no channel comment yet, with
  `yt.py --channel CH comment VIDEO_ID "QUESTION"`, and logs it in `social/youtube-comments-log.md`.
- Pinning: owner in Studio (step 10). Reply to the answers (the comment-reply task already does, each reply written
  for that comment).

## 6. Cut a Short from every long video

- Every long video gets one Short (15–60 s) cut from its most useful or surprising point, **with its own hook** (not a
  random clip), that teaches something on its own and promises only what the long video delivers. As Printed and The
  Overthinking Pad already do this; Which Life Next long videos fill one of that day's Short slots with it.
- The Short's description links the long video. The "related video" link under the Short: owner in Studio (step 10).

## 7. Not working? Change the style or length, not only the topic

- When a channel's last ~5 comparable videos sit below its median, the weekly audit proposes one experiment that
  changes **presentation**, one variable at a time: length (e.g. 8 → 12 min), pacing/edit density, opening type,
  visual approach within the channel's style. Never keep repeating what isn't working; never break the channel's
  fixed look rules in CLAUDE.md without the owner.

## 8. Don't spend the week on one video

- At most **3 packaging changes per video in its lifetime, at least 12 h apart**; then leave it and put the effort
  into the next video. Never delete an under-performing video (many find their audience later).
- Never delay or skip the next scheduled video to keep fiddling with an old one.

## 9. Read two numbers together: average view duration and CTR

- **Average view duration (AVD):** starting benchmark for 10–12 min videos is **> 3 min**; more important, it should
  beat the channel's previous comparable video. (Shorts: use engagedViews/views and average % viewed.)
- **CTR** (vidIQ or Studio only, never computed by us): **> 5 %** on track, **> 10 %** strong. Only judge it after
  **≥ 1,000 impressions**.
- Diagnosis matrix (in every daily/weekly report where the data exists):

  | CTR | AVD | Problem is in |
  |---|---|---|
  | low | good | title + thumbnail (the video is good) |
  | good | viewers leave in the first ~30 s | the hook / the promise not delivered early |
  | low | low | topic or the whole package |
  | good | good | working: make the next video of the set |

## 10. Owner actions in YouTube Studio (no API)

Per video, when the owner has a minute (the report lists the videos): **pin** the question comment; add an **end
screen** to the next video of the set or the playlist; set the Short's **related video** to the long video; start
**Test & Compare** on long videos when a repackage is proposed. Once per channel: end-screen template (Settings →
Upload defaults) and remixing = audio only (see CLAUDE.md).

## Log fields

Each upload row in `social/youtube-schedule-log.md` adds: `slot 19:00 → published 19:03`, `check: ready`,
`set: <playlist title> (n/3)`, `question: "<text>"`. Repackages get their own row ("repackage 1/3", old → new title,
signal used) and an experiment note in `youtube-growth/<ch>/experiments/experiment-log.md`.

---

## Facebook Page videos and Reels: same rules (owner, 2026-11-25; before-upload steps A1–A6 added 2026-11-26)

Part A applies to Facebook as written in its Facebook notes: A1 topic research (Bithi: Instagram/TikTok outliers in
Bangla), A2 five titles (title + caption first line), A3 cover decided before production with the phone test, A4
`post.md` complete before upload, A5 no end screens (caption links the set; no branded-content label), A6 schedule
off the round minute after processing completes.

Owner: "Same rules goes for fb page videos also." Applies to every video/Reel on our Facebook Pages (Scientific Bithi
1497857623404891, Which Life Next 1342776542260801, and any other NorthStar Page), in chat and in every scheduled task,
through the facebook-page-automation skill (Graph API v21.0). Meta's rules and the compliance rulebook (section 8) win.

What the Graph API can and can't do (checked 2026-11-25): it can upload unpublished/scheduled
(`published=false` + `scheduled_publish_time`), read processing status (`GET /<video>?fields=status`), post a comment
as the Page (`POST /<video>/comments`), edit title/description (`POST /<video>` title=, description=) and set the cover
(`/thumbnails`). It **cannot** pin a comment, make video playlists/series (`/video_lists` is read-only for us), set the
Reels remix option, or give a thumbnail CTR. Those are **owner actions in Meta Business Suite / the Facebook app**.

| Step | On Facebook |
|---|---|
| 1. Ready before public, off the round minute | Upload scheduled at least 2 h ahead. Before the run ends, `GET /<video>?fields=status` must show `processing_phase: complete` and `video_status` ready/scheduled; not ready ~30 min before → next slot. Publish **2–9 min after the slot**, never :00/:15/:30/:45 (Scientific Bithi 20:00 Dhaka → e.g. 20:04 = 14:04 UTC). Which Life Next cross-posts keep the **same moment as the YouTube publishAt** (which is already off the round minute). |
| 2. No mass sharing | Never spam groups or other Pages with links; share only where the topic fits, with one line of value. |
| 3. Sets of three | Same planning as YouTube (each its own topic/story); the caption names the set and the previous video. Facebook series/playlists: owner in Meta Business Suite. |
| 4. Hands off for 4 h, verdict at ≥12 h | No edits for 4 h (typos, wrong facts, compliance excepted). At ≥12 h a video is a repackage candidate when its 3-second views / reach are in the bottom third of the Page's comparable videos (≥5; else no verdict); repackage = one big title/caption-first-line + cover change (`POST /<video>` title/description, `/thumbnails` is_preferred=true), honest, compliance pass. |
| 5. One 5-second question comment | Once the video is public, the Page posts one question comment specific to the video (`POST /<video>/comments`); for Scientific Bithi this is the episode's puzzle question in Bangla. No bait ("share if…", "comment YES"), no links, varied wording. Pinning: owner. |
| 6. Reel from every long video | Every longer feed video gets a Reel cut from its best moment with its own hook, linking the full video in the caption. |
| 7. Not working → change style/length | Weekly review proposes one presentation experiment (one variable) when the last ~5 comparable videos are below the Page's median. |
| 8. Max 3 changes, never delete | Max 3 packaging changes per video, ≥12 h apart; never delete or hide an under-performing video. |
| 9. Two numbers | Facebook has no thumbnail CTR in the API: read **average watch time** (`total_video_avg_time_watched`, vs the Page's previous comparable video) together with **3-second views ÷ reach** (hook/cover pull) and the retention graph. Low pull + good watch time = cover/title; good pull + early drop = hook. |

**Paid promotion / branded content (owner, 2026-11-25):** none of our Facebook videos is sponsored: never add a branded
content / paid partnership label or tag a sponsor; if a video ever has one, ask the owner first.
**Remixing:** Facebook's Reels remix option is set in the Facebook app / Meta Business Suite, not the API. Owner to-do:
set it to the most restrictive option that matches YouTube's "audio only" choice (if Facebook offers no audio-only
choice, say which option was picked). Never claim the API set it.

Log fields (in the Page's log): `slot 20:00 → published 20:04`, `status: ready`, `set (n/3)`, `question: ...`,
`repackage n/3` rows.
