# As Printed — daily episode runbook

One episode a day: a **long video (8–12 min, 16:9)** and a **Short (45–60 s, 9:16)** cut from the same story, for the
YouTube channel **As Printed** (`yt.py --channel asprinted`). Owner decisions (2026-11-15):
- **No approval needed to publish** (owner, 2026-11-18): when the videos pass every check, upload and schedule them
  at the fixed slots yourself, then send the owner the files, links, titles, descriptions and publish times as a report. (Replaces the 2026-11-15 approval-first rule.)
- **Publish:** long video **7:00 PM US Eastern**, Short **8:00 PM US Eastern** the same day (`TZ=America/New_York`;
  daylight saving is handled by `date`). If the videos are ready after 7 PM ET, use the next free day's slots.
- **Voice: VibeVoice, always** (`engine/voice/vv_tts.py`, the channel's narrator reference `narrator_ref.wav`).
- **Look: the Archive Light Table template** (`engine/`), never the 3D map style.
- **Thumbnails: archive look, made with the universal thumbnail skill** (owner, 2026-11-16:
  `.claude/skills/youtube-thumbnail-creator/SKILL.md`, Remotion `style: "archive"`): the real front page plus the
  person, ship, place or object it is about (public-domain photo, cut out) as the dominant subject; never text-only.
  `engine/thumb.html` is kept only as a last-resort fallback. Examples: `social/thumbnails/demos/universal-2026-11-16/`.

Read these before writing a script: `CLAUDE.md`, **`docs/content/scriptwriting-rules.md`** (the master script rules: they win
over anything here), `docs/content/animation-direction-rules.md`, this file, `videos/as-printed/topics.md` and
`social/youtube-schedule-log.md` (what is already out).

## 1. Topic (15 min)

The channel's promise is in its name: **what the papers printed, against what the archive shows.** A good topic has:
1. A **printed claim** in a real newspaper (or poster, telegram, bulletin) that was wrong, early, exaggerated,
   hidden or later corrected — and a record that answers it (an official report, census, court record, photo,
   later edition).
2. **Material that is free to use:** Library of Congress Chronicling America pages (US newspapers to 1963; use pre-1929
   pages, public domain), LoC Prints & Photographs items marked "No known restrictions" (Bain News Service, Harris & Ewing,
   etc., pre-1929), National Archives (US government works), Smithsonian Open Access (CC0). Name anything else to the
   owner before using it. At least **5 items, including 2+ photographs**.
3. American history first (the audience), any era with printed sources; one clear question a stranger would click.
4. Not already covered (check the schedule log). Rotate eras and themes; never two disasters in a row.
Take the next topic from `topics.md` unless research finds a better one that fits; add new finds to the queue.
Score it out of 100 and write the topic research report (scriptwriting rules §2.G–H) as `TOPIC.md` in the episode
folder; below 65, pick another topic.

## 2. Research (45 min)

- Find the pages: `https://www.loc.gov/collections/chronicling-america/?q=…&dates=YYYY-MM-DD/YYYY-MM-DD&fo=json&c=40&at=results`;
  a page record is `<resource url>&fo=json` (image URL in `resource.image`, swap `pct:6.25` for `pct:50`).
  Photographs: `https://www.loc.gov/pictures/search/?q=…&fo=json`, item JSON `…/pictures/item/<id>/?fo=json`
  (`resources[0].larger` is the TIFF master). Keep downloads in `raw/` (git-ignored); store each item's record.
- Every number, date, name and quotation on screen or in narration goes into `FACTS.md` with its source URL and the
  quoted wording (2 sources that agree for anything that isn't a quotation of the item itself). Quote printed
  headlines exactly. No invented quotes, no guessed numbers. If sources disagree, say so or leave it out.

## 3. Script — long video (8–12 min, about 1,250–1,800 words)

VibeVoice reads at about 155 words a minute; shots add 1–3 s of picture around each line.
1. **Cold open (0:00–0:30):** the first sentence is the surprise itself (rules §3: no date-first background, no channel
   intro, no "in this video"), then the printed claim quoted on the first item (`title` then `read`), the conflict, and
   the question the video answers. Don't reveal the answer.
2. **3–5 chapters** (`chapter` shot, a kicker like "PART 2" and a 2–5 word title). Each chapter is built around 1–3
   archive items: a `read` (the line that matters, lit), a `photo` (inside the photograph), a `table` (a detail pinned).
   One new item or one new reading every 20–40 s. Each chapter ends on an open question or a new problem.
3. **The turn** near the middle: the record that contradicts the print.
4. **The verdict:** a `compare` shot (printed value vs. the record, the printed one struck), then why it went wrong.
5. **End:** the payoff answers the opening; then one specific comment question about the story and one short like +
   subscribe line (rules §12), never earlier in the video; the `end` shot shows the archive index.
6. A curiosity loop every 30–45 s, a new development every 30–60 s (rules §6, §10); never invent thoughts or quotes.
7. Plain spoken English, short sentences, one fact per sentence, numbers as words where they are spoken
   ("fifteen hundred and seventeen"), dates spoken naturally. Write `say` per shot: 1–4 sentences.

## 4. Script — Short (45–60 s, 110–150 words) — the channel's Shorts rules

1. **0–1 s:** the most surprising printed line, on screen and in the voice, mid-action (start on a `read` shot).
2. **1–5 s:** the question that makes people stay.
3. **5–45 s:** 3–5 beats, a new image every 3–5 s, one number or name per beat (`photo`, `table`, `read`).
4. **Last 5 s:** the payoff (`compare` with the strike), ending on a line that loops back to the first.
5. Rules §14 timing (0–3 s hook, 3–10 s conflict, 10–35 s development, 35–50 s payoff); no subscribe; the last line can be a
   question. The description points to the long video.

## 5. The episode folder

`videos/as-printed/<YYYY-MM-DD>-<slug>/` with `episode.json`, `FACTS.md`, `TOPIC.md`, `thumb.json`, `raw/` (ignored), `out/` (ignored).
Save both scripts in `social/scripts/<working-title>.md` (rename to `<VIDEO_ID>.md` after upload). The shot list is the
storyboard (animation rules): every shot has a reason; look at stills of every shot before the full render.
`episode.json`:
```json
{ "slug": "no-lives-lost", "title": "…", "indexTitle": "Titanic · April 1912", "seed": 7,
  "items": [ {"id": "union", "kind": "paper|negative|print", "src": "raw/union.jpg", "crop": [x0,y0,x1,y1],
              "inches": 17, "label": "THE NEW HAVEN UNION · 15 APR 1912", "short": "The New Haven Union",
              "catalog": "LCCN sn92051126", "row": "0 lost", "credit": "Bain News Service",
              "horizon": 2010, "water": false, "levels": [0.04, 0.95], "autolevel": false } ],
  "end": {"sub": "…", "credits": ["Library of Congress · Chronicling America", "…"]},
  "films": {
    "long":  {"size": "1920x1080", "shots": [ … ]},
    "short": {"size": "1080x1920", "shots": [ … ]} } }
```
Coordinates (`boxes`, `focus`, `ring`, label `at`, `horizon`) are in **source image pixels** of `src` before `crop`.
Shot types (each may have `say`; the voice sets the length):
- `title` `{item, title, sub, chapterName}` — the table lights up on the first item, title card.
- `read` `{item, boxes: [[x0,y0,x1,y1], …], card?}` — the loupe lands, the lines light one by one inside the lens.
- `photo` `{item, focus?, nf (focus-plane nearness 0..1), drift?: [dx,dy], zoom?, labels?: [{at, text, sub, align}], card?}`
  — negative turns positive, the camera goes into the photograph (parallax from `horizon`).
- `table` `{item, boxes?, ring?, zoom?, card?}` — a glide to the item, lines underlined at table level.
- `chapter` `{kicker, title, chapterName, item?}` — a chapter card over the table.
- `compare` `{a: {label, quote, value, unit, source}, b: {…}, strike: "a", strikeAt?}`.
- `end` — pull back, archive index (items with `row`), end card.
`card`: `{label, value, unit, note, source, at}`; numeric values count up.
Find line boxes by drawing candidates on the scan (`tools/boxes.py <image> x0,y0,x1,y1 …` → a preview) and looking
at them. For photos, set `horizon` to the street/ground horizon row (0 for a sea seen from above).

## 6. Build and check

```sh
E=videos/as-printed/engine; EP=videos/as-printed/<folder>
sh $E/build.sh $EP voice     # in the background; ~60 min (VibeVoice ~5× real time on this CPU)
sh $E/build.sh $EP render    # in the background; ~45 min
sh $E/build.sh $EP finish
```
Before rendering, look at stills: `cd /root/lemo-opuscar && node core/render/still.mjs $EP <t…> --size 1920x1080 --q film=long`.
After finishing, look at `out/sheet_long.jpg`, `out/sheet_short.jpg` and both thumbnails. Fix: ASR differences that are
real mispronunciations (reword the line), reading-check failures, labels off screen, a camera that misses its line.
Long video 8–12 minutes, Short 45–60 s; files under 100 MB (re-encode with a higher CRF if not).

## 7. Report to the owner (after section 8; no waiting)

Send both MP4s and both thumbnails (SendUserFile), then: the two titles, both descriptions (with sources, chapters
from `out/long/chapters.txt`, and the Short's pointer to the long video), tags, and the publish times in ET and UTC.
Titles: 5–9 words, curious, true; never repeat the thumbnail heading. Descriptions: 2–3 sentence summary,
chapters, "Sources:" with each item's holder and catalogue number, "Narration: synthetic voice (VibeVoice)."

## 8. Upload, schedule, thumbnails, log (no approval needed)

```sh
Y=".claude/skills/youtube-channel-automation/yt.py --channel asprinted"
LONG_AT=$(TZ=UTC date -d "$(TZ=America/New_York date -d 'today 19:00' '+%F %T %z')" +%FT%TZ)   # 7 PM ET in UTC
SHORT_AT=$(TZ=UTC date -d "$(TZ=America/New_York date -d 'today 20:00' '+%F %T %z')" +%FT%TZ)
python3 $Y whoami                                   # must say As Printed
python3 $Y upload $EP/<slug>_long.mp4 --title "…" --description "…" --tags "…" --publish-at $LONG_AT --category 27
python3 $Y thumbnail <LONG_ID> $EP/thumb_long.jpg
python3 $Y upload $EP/<slug>_short.mp4 --title "… #shorts" --description "… Full story: https://youtu.be/<LONG_ID>" --publish-at $SHORT_AT --category 27
python3 $Y thumbnail <SHORT_ID> $EP/thumb_short.jpg
```
Captions: upload the `.srt` files if `yt.py` has a captions command; otherwise note it in the log.
Log both in `social/youtube-schedule-log.md` (channel **As Printed**, IDs, titles, publish times ET/UTC, thumbnail),
mark the topic done in `topics.md`, commit the episode folder (videos, srt, thumbnails, FACTS.md, episode.json) and push.
Never delete a video, comment or playlist.
