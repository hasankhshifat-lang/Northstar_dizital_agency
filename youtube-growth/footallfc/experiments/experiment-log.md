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
- **Result:** — **Decision:** —
