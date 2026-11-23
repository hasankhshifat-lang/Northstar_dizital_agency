# Growth experiment log: footallfc

One card per experiment (template in the skill, section 11). One major variable at a time; baseline first;
≥3 videos per arm or 28 days before deciding. Failed experiments stay here so they are not repeated.
Mirror each card as a row in `social/learning/<channel>.md` → Experiments.

### EXP-footallfc-001 Publish slot: 19:00 ET vs 21:00 ET (two Shorts a day)
- **Problem:** day 1: the 19:00 ET Short (j_ApWmdOq7A, score 92) had 308 public views at ~18 h; the 21:00 ET Short
  (Ee8NbFAdEfg, score 85, no project folder in the repo) had 29 at ~16 h (Data API, 2026-11-16 18:24 UTC). Slot, topic and
  production all differ, so this says nothing yet.
- **Baseline:** none with analytics (data to 11-14). Use the first 4 Shorts (11-15, 11-16) as the starting record.
- **Hypothesis:** with two Shorts two hours apart, the 21:00 ET Short gets less first-hour feed testing (the 19:00 one is
  still being tested), so it under-performs regardless of topic.
- **Change (one variable):** the slot. The existing times stay (no schedule change): alternate which Short gets the
  higher topic score each day so topic quality is balanced across slots.
- **Control:** 19:00 ET slot.
- **Expected outcome:** if the hypothesis holds, the 21:00 ET Shorts trail by >30% in engagedViews at 72 h even with
  balanced topics; then propose spacing the second Short later (e.g. next morning ET) to the owner.
- **Metric + checkpoint:** views, engagedViews and US share at 72 h and 7 d (`growth.py snapshot`).
- **Sample:** ≥5 Shorts per slot (about 5 days).
- **Status:** planned. No time change needed; topic assignment per the calendar.
- 2026-11-18 (day 4): 19:00 ET Tw7hVywh-88 (Maracanazo, 85), 21:00 ET hVYufhSqQwE (Anfield corner, 88): higher score at 21:00.
- **Result:** — **Decision:** — (filled in the 2026-11-23 weekly audit below)

### 2026-11-23 daily checkpoints (YouTube Analytics API via growth.py, data to 11-18…11-20)
- **EXP-footallfc-001 interim (status: running, the log said "planned"; slots alternate since day 1):** 72 h views, 19:00 ET slot: krePEx98iNA 171 · Tw7hVywh-88 196 · tNIQekn0giI 141 (median 171); 21:00 ET slot: hVYufhSqQwE 747 · bA8U2Sb4o20 91 · BrktyLaF4SI 70 (median 91). Engaged/views 19:00: 0.322 / 0.418 / 0.355; 21:00: 0.534 / 0.385 / 0.229. Day 1 at 7 d: j_ApWmdOq7A (19:00) 385 vs Ee8NbFAdEfg (21:00) 60. 21:00 trails on the median but has the single best Short (hVYufhSqQwE): mixed. n=3 per slot at 72 h, card needs ≥5 per slot: no decision. The day-5/6 pairs (22–23 Nov) complete the sample.
- **EXP-footallfc-001 closed as a clean test (2026-11-23, owner change):** from 24 Nov the channel moves to three Shorts a day (12:00 / 19:00 / 21:00 ET),
  a new animation style (Night Match Toon caricatures) and funny scripts, so slot, style and count change together. Final pairs in the old style: 22 Nov
  (H_TO2a6Sc1Y 19:00 / B5Y7KOCnJ7A 21:00) and 23 Nov (UpEfNjwpGAw 19:00 / Ouix6g_BXJc 21:00): fill their 72 h / 7 d views here for the record,
  no decision from them. Per-slot results keep being logged in `publishing/publish-time-log.md`. Next experiments start once the new format has ≥ 9 videos.

### 2026-11-23 weekly audit: EXP-footallfc-001 final record (status: **ended, inconclusive**)
- **Why it ended:** owner change on 2026-11-23 (CLAUDE.md, Foot All FC): from 24 Nov three Shorts a day at 12:00 / 19:00 / 21:00 ET,
  new style (Night Match Toon caricatures) and funny scripts. Slot, style, count and topic type all change at once, so the
  test can't continue cleanly. It ends as a clean test on 2026-11-23.
- **Sample reached:** 6 pairs published/scheduled (day 1–6), but only **3 per slot** have the 72 h checkpoint (card needed ≥5
  per slot); day 1 has only 7 d; day 5 (22 Nov) has Data API counts only; day 6 publishes 23/24 Nov UTC (no data).
  Uploads stopped 19–21 Nov, which is why the sample fell short.
- **Numbers (YouTube Analytics API via growth.py snapshots, 72 h, data to 11-19/11-20):**
  - 19:00 ET: tNIQekn0giI 141 views / 50 engaged · krePEx98iNA 171 / 55 · Tw7hVywh-88 196 / 82 → median **171 views, 55 engaged**
    (mean 169 views); US share 0% / 0% / 11.2%.
  - 21:00 ET: BrktyLaF4SI 70 / 16 · bA8U2Sb4o20 91 / 35 · hVYufhSqQwE 747 / 399 → median **91 views, 35 engaged** (mean 303 views);
    US share 0% / 14.3% / 6.7%.
  - Day 1 at 7 d: j_ApWmdOq7A (19:00) 385 views / 162 engaged vs Ee8NbFAdEfg (21:00) 60 / 19.
  - Day 5, Data API public counts at 2026-11-23 18:30 UTC: H_TO2a6Sc1Y (19:00) 137 at ~18.5 h vs B5Y7KOCnJ7A (21:00) 182 at ~16.5 h.
- **Reading:** the 21:00 slot trails on the median (−47% views, −36% engaged) and matches the card's ">30% behind" threshold,
  but it also holds the channel's best Short by far, and day 5 points the other way. Medians of n=3 with a 10× spread between
  topics can't separate slot from topic/hook. Hypothesis neither confirmed nor rejected.
- **Decision:** none (inconclusive; not a failure of the slot idea). **Learning:** topic/hook variance (70 → 747 views in the same
  slot) is far larger than any slot effect seen; a future slot test needs ≥5 per slot with the format held steady. Per-slot
  results keep being logged in `publishing/publish-time-log.md` (now three slots). No new slot test until the new format has
  ≥9 measured videos.

### EXP-footallfc-002 First frame: payoff-first freeze vs setup-first opening (Night Match Toon Shorts)
- **Problem:** the biggest leak is the first seconds of the Shorts feed: channel engagedViews/views is 0.43 (1,115 / 2,594,
  15–21 Nov, Analytics API), and per video 0.23–0.53 (median 0.37, n=8 at 72 h/7 d). The best Short (hVYufhSqQwE, 0.53) opened
  on the strange moment itself (defenders turned away, #66 walking from the ball); the weakest (BrktyLaF4SI, 0.23) opened on a
  slow push onto a napkin. Hypothesis only: several things differed between them.
- **Baseline:** old style median engaged/views 0.37 (n=8). New-style baseline: the first 9 Night Match Toon Shorts (24–26 Nov),
  measured before the test starts.
- **Hypothesis:** opening on a frozen frame of the funniest/most absurd moment (the punchline image, before the setup) keeps more
  viewers past the first seconds than opening on the setup with a comic contrast line.
- **Change (ONE variable):** the first 2–3 s visual + line order. Arm A: payoff-first freeze (e.g. Higuita mid-scorpion), then
  rewind to setup. Arm B: setup-first (comic contrast line over the build-up, payoff at the climax). Same style, voice, length
  band (45–60 s), thumbnail process.
- **Control:** Arm B. **Balance:** alternate arms by day and rotate them through all three slots so each arm has every slot;
  alternate the higher topic score between arms.
- **Expected outcome:** Arm A ≥ +15% engagedViews/views at 72 h and a higher watch ratio at 10 s.
- **Metric + checkpoint:** engagedViews/views, views and watch ratio at 3 s and 10 s (`growth.py retention`) at 72 h; 7 d views.
- **Sample:** ≥6 Shorts per arm (about 4 days at 3 a day), start once ≥9 new-style videos are measured (≈ 28–30 Nov).
- **Status:** planned (no schedule, slot or settings change needed; production direction only).
- **Result:** — **Decision:** —
