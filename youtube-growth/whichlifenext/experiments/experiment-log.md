# Growth experiment log: whichlifenext

One card per experiment (template in the skill, section 11). One major variable at a time; baseline first;
≥3 videos per arm or 28 days before deciding. Failed experiments stay here so they are not repeated.
Mirror each card as a row in `social/learning/<channel>.md` → Experiments.

### EXP-whichlifenext-001 Publish window: 08:00 ET vs 17:00 ET (Shorts)
- **Problem:** US share of views fell from 2,624 (prev. 7 d) to 71 (last 7 d) when uploads moved to 08:00 ET.
- **Baseline:** Shorts at 17:00–23:00 ET (n=8, 10-28…11-04): US share 6–49%. Shorts at about 08:00 ET with ≥1,000
  views (n=2): US share 2.1–2.4%. Small, confounded sample (format, cadence and topic also changed).
- **Hypothesis:** publishing at 17:00 ET puts the first Shorts-feed test in front of US viewers, which raises the
  US share and engaged views.
- **Change (one variable):** publish time 17:00 ET (22:00 UTC; 06:00 SGT) instead of 08:00 ET. Same format, one per
  day, same bucket mix.
- **Control:** the 08:00 ET Shorts of 11-09…11-15.
- **Expected outcome:** US share ≥15% and higher engaged views at 72 h.
- **Metric + checkpoint:** US share of views and engagedViews at 72 h and 7 d (`growth.py snapshot`), plus vidIQ
  Shorts-feed impressions if available.
- **Sample:** ≥5 Shorts per arm (alternate days or a straight week), compared at the same checkpoints.
- **Status:** running. Owner approved 2026-11-15. Control arm: the 08:00 ET Shorts of 11-09…11-16 (the last one is uBHrZaAZw4A Alcatraz, 2026-11-16 13:00 UTC, left in place). Test arm: Shorts at 17:00 ET (22:00 UTC while EST is in effect) from 2026-11-17, one a day, with format, cadence and bucket rotation unchanged. The daily Shorts task "Which Life Next — 1 YouTube Short a day" was updated the same day; the Facebook cross-post uses the same moment. First read-out after ≥5 test Shorts reach 72 h (about 2026-11-24); decision after 7 d (about 2026-11-28).
- **Interim note (weekly audit 2026-11-16, no result yet):** (1) Reach came back **at the control slot**: the 08:00 ET
  Shorts of 11-14, 11-15 and 11-16 have 1,633 / 1,493 / 1,136 public views at about 53 h / 29 h / 5 h (Data API public
  counts, 2026-11-16 18:24 UTC), after 61–170 views for 11-10…11-12. Their US share is not readable yet (Analytics data
  runs to 2026-11-14). So "08:00 ET kills reach" is weaker than it looked; the card still tests **US share**, which is
  the question that matters. (2) **Confound:** the narration voice changed to VibeVoice from uBHrZaAZw4A (11-16, control
  arm). Every test-arm Short will be VibeVoice while 7 of 8 control Shorts were ElevenLabs. Compare the test arm with
  the whole control arm *and* with uBHrZaAZw4A separately, and write "hypothesis" if they disagree. (3) Control 72 h
  numbers so far (Analytics, data to 11-12/11-14): ctx0tm_C56c 1,255 views, US 2.4% · vy-qRhRjnN0 61, US 64% (39 of 61)
  · PKdcctcYjfw 168, US 0% · _w_jqoz9elc 81, US 0%.
- **Result (weekly audit 2026-11-23; full pre-2026-11-22 sample only; YouTube Analytics API via growth.py snapshots, data to 11-14…11-20):**
  control 08:00 ET, n=7 with analytics (7 d): ctx0tm_C56c 1,256 (US 2.4%) · vy-qRhRjnN0 62 (62.9%) · PKdcctcYjfw 174 (0%) ·
  _w_jqoz9elc 82 (0%) · ulARZlhrP30 1,645 (25.1%) · vIm7ATNVI4o 1,523 (9.6%) · uBHrZaAZw4A 1,201 (0%). Test 17:00 ET, n=3
  (72 h; no Shorts 11-20…11-22): 5BAbL0eYfRQ 574 (US 27.0%) · VgIgGbrvjKc 351 (11.1%) · lycDlMhOJ_M 53 (0%).
  Views per Short: median 1,201 vs 351 (test lower; checkpoints differ, but these Shorts stall by ~72 h). Pooled US share:
  628/5,943 = 10.6% vs 194/978 = 19.8% (test higher); median US share 2.4% vs 11.1%. Pooled engagedViews/views:
  3,218/5,943 = 0.541 vs 451/978 = 0.461 (test lower).
  **Not a valid result:** the test arm has 3 of the ≥5 Shorts the card required, and is confounded by the VibeVoice voice
  (3/3 test vs 1/7 control) and topics. Hypothesis only: 17:00 ET may raise the US share but did not raise reach or the
  engaged ratio; the expected "higher engaged views at 72 h" **failed** in this sample; "US share ≥15%" was met pooled
  (19.8%) but not by the median (11.1%).
- **Decision:** **ended 2026-11-22, inconclusive** (owner moved the channel to 3 Shorts a day at 08:00 / 13:00 / 17:00 ET,
  which ends the clean one-a-day test). Don't re-run it as a one-a-day test. **Learning:** keep logging per slot in
  `publishing/publish-time-log.md`; the three daily slots now give a running per-slot comparison (same days, mixed
  topics). Read it after ≥5 Shorts per slot have 7 d data (about 2026-12-07), as an observation, not a decided test.

### EXP-firstframe-person-vs-object First frame + hook subject: person vs object/place (Shorts)
Card added 2026-11-16 to mirror the learning-database row (the experiment was tagged retroactively on 2026-11-14).
- **Problem:** swipe-away varies 44–66% between Shorts; the worst (Ghost Army, 66%) opened on an object.
- **Baseline:** person-first ctx0tm_C56c 44% swipe-away (engaged 708/1,256) · _w_jqoz9elc 53% (38/81); object-first
  vy-qRhRjnN0 66% (21/61). Analytics to 11-12/11-14.
- **Hypothesis:** a person in danger (or menacing) in the first frame and first line keeps more viewers past second 1.
- **Change (one variable):** first frame + hook subject = a person vs an object/place. Topic bucket rotates normally.
- **Control:** object/place-first Shorts (vy-qRhRjnN0, ulARZlhrP30, uBHrZaAZw4A).
- **Expected outcome:** engaged/views ratio ≥ 0.60 for person-first vs ≤ 0.50 for object-first.
- **Metric + checkpoint:** engagedViews ÷ views at 72 h and 7 d; avg % viewed as a secondary.
- **Sample:** ≥3 per arm with analytics, then ≥5 per arm before a decision. Note it overlaps EXP-001 (publish time):
  keep both frame types in both time arms so neither experiment confounds the other.
- **Status:** running. Person arm: ctx0tm_C56c, _w_jqoz9elc, vIm7ATNVI4o, 5BAbL0eYfRQ (scheduled). Object/place arm:
  vy-qRhRjnN0, ulARZlhrP30, uBHrZaAZw4A.
- **Interim (2026-11-16):** mixed. Swipe-away favours person (44%, 53% vs 66%, n=2 vs 1). Public reach favours object
  ulARZlhrP30 (1,633 at ~53 h) over person vIm7ATNVI4o (1,493 at ~29 h), ages differ. Not enough analytics yet.
- **Interim (weekly audit 2026-11-23; growth.py snapshots, data to 11-16…11-20):** person arm with analytics, n=5:
  ctx0tm_C56c 0.564 (7 d) · _w_jqoz9elc 0.463 (7 d) · vIm7ATNVI4o 0.601 (7 d) · 5BAbL0eYfRQ 0.470 (72 h) · VgIgGbrvjKc
  0.442 (72 h; Violet in a lifeboat) → median 0.470. Object/place arm, n=4: vy-qRhRjnN0 0.339 · ulARZlhrP30 0.519 ·
  uBHrZaAZw4A 0.487 (7 d) · lycDlMhOJ_M 0.491 (72 h; pickup at the border sign) → median 0.489. The earlier lean towards
  person-first (0.564 vs 0.487 on 11-23 morning) disappears with the two new 72 h rows. Pending: t6fR0H1yYJo (person),
  nJopWLqMnJU (object/place) from 11-26; FrsAQmXpo4o (GI holding a bat) is mixed: exclude from both arms. Still running;
  the object arm needs one more Short with 72 h data. No decision.
- **Data 2026-11-24 (daily checkpoints):** t6fR0H1yYJo (person) 24h: Analytics not in yet (public 877 at ~28 h); vy-qRhRjnN0 (object) 14d unchanged at 0.339. No new arm readings; still running, no decision.
- **Result:** — **Decision:** —

_No new experiment proposed on 2026-11-16: two are running on the same Shorts, and a third would confound both._


### 2026-11-22 update: EXP-whichlifenext-001 confounded
Owner moved Which Life Next to 3 Shorts a day (08:00 / 13:00 / 17:00 ET) on 2026-11-22, so the one-Short-a-day test stops being clean. Interim data (YouTube Analytics to 11-19, read 2026-11-22): 08:00 ET arm 11-14…11-16 = 1,645 / 1,523 / 1,201 views, swipe-away 48–51%; 17:00 ET arm 11-17…11-19 = 573 / 349 / 52 (lycDlMhOJ_M only ~2 h of data), swipe-away 52–56%. 17:00 ET reach is clearly lower so far; no Shorts were scheduled 11-20…11-22 (missed runs). Keep logging per-slot results; decide in the weekly review.

### 2026-11-23 daily checkpoints (YouTube Analytics API via growth.py, data to 11-16…11-20)
- **EXP-whichlifenext-001 (confounded, still running for the record):** test arm (17:00 ET) at 72 h: 5BAbL0eYfRQ 574 views, US 27.0% · VgIgGbrvjKc 351, US 11.1% · lycDlMhOJ_M 53, US 0% (n=3, median 351, the card needs ≥5). Control arm (08:00 ET) at 72 h: ctx0tm_C56c 1,255 · vy-qRhRjnN0 61 · PKdcctcYjfw 168 · _w_jqoz9elc 81; at 7 d: ulARZlhrP30 1,645 (US 25.1%) · vIm7ATNVI4o 1,523 (US 9.6%) · uBHrZaAZw4A 1,201 (US 0%). Hypothesis only: US share is not clearly higher at 17:00 ET and reach is lower. No decision (test arm < 5 and confounded by the 3-a-day change).
- **EXP-firstframe-person-vs-object:** engaged/views at 7 d, person arm: ctx0tm_C56c 0.564 · _w_jqoz9elc 0.463 · vIm7ATNVI4o 0.601 (+ 5BAbL0eYfRQ 0.47 at 72 h); object/place arm: vy-qRhRjnN0 0.339 · ulARZlhrP30 0.519 · uBHrZaAZw4A 0.487. Medians 0.564 vs 0.487: leaning person-first on the opening, while reach (views) is mixed. n=3–4 vs 3, the card needs ≥5 per arm: still running, no decision.

### 2026-11-23 weekly audit
- EXP-whichlifenext-001: **ended, inconclusive** (result recorded on the card from the full pre-11-22 sample; confounds:
  3-a-day change, VibeVoice voice, test arm n=3 < 5). Failure recorded: 17:00 ET did not raise reach or the engaged ratio.
- EXP-firstframe-person-vs-object: running; medians now 0.470 (person, n=5) vs 0.489 (object/place, n=4): no difference yet.
- New: EXP-whichlifenext-002 proposed as **planned** (below). It changes the script beat at 2–6 s, not the first frame,
  so it can run alongside EXP-firstframe if both frame types appear in both arms.

### EXP-whichlifenext-002 Second beat: open question vs explanation (Shorts, 2–6 s)
- **Problem:** the 5–12 s window loses the most viewers on recent Shorts. Retention (growth.py retention, data to 11-20):
  VgIgGbrvjKc watch ratio 0.93 at 5.7 s → 0.59 at 10.9 s, relative retention vs similar Shorts 0.27–0.30 at 5–16 s;
  5BAbL0eYfRQ 1.02 → 0.71 (6.3 → 12.0 s), vs similar 0.40–0.45; lycDlMhOJ_M biggest drop at 9.7 s (−0.15). Earlier:
  vy-qRhRjnN0 drops at 5.2 s and 7.0 s, uBHrZaAZw4A at 5.6 s and 7.5 s, PKdcctcYjfw 6.2–12.9 s. In these Shorts the hook
  line states the whole payoff (e.g. "…and on both of its sister ships when they were hit") and the next beat explains
  (map/background) instead of asking the question the plan calls for at 1–5 s (`plan-60-days.md`, script step 2).
- **Baseline:** median engagedViews/views 0.487 and avg % viewed 57.5% on this week's 5 Shorts (11-15…11-19); watch ratio at
  ~10 s: 0.59 (Jessop), 0.71 (Balloons), ~1.3 incl. replays (Northwest Angle). Relative retention vs similar at the 20%
  point: 0.27 (Jessop), 0.40 (Balloons), 0.78 (Northwest Angle).
- **Hypothesis:** keeping part of the payoff back and saying one open question between 2 and 6 s ("…so how did she live
  through all three?") holds more viewers through 5–12 s than going straight into explanation.
- **Change (one variable):** the 2–6 s line is an open question (test) vs the current statement/explanation (control).
  First frame, first line length, voice (VibeVoice Frank), length 45–60 s, map + ground-scene look and slots unchanged.
- **Control:** alternate Shorts written the current way, same days, same slots rotated (so no slot sits in one arm).
- **Expected outcome:** relative retention vs similar at the 20% point ≥ 0.60 for the test arm vs control; avg % viewed
  +5 pts.
- **Metric + checkpoint:** `growth.py retention` (watch ratio and relativeRetentionPerformance at the 10% and 20% points)
  and avg % viewed at 72 h; engagedViews/views secondary (it measures the first second, which this test doesn't change).
- **Sample:** ≥5 Shorts per arm with 72 h data (at 3 a day: about 4 days of production + 3 days of lag), both frame types
  (person / object) in each arm to keep EXP-firstframe clean.
- **Status:** planned (proposed 2026-11-23). Starts when the daily Shorts task adopts it; it's a script variable within the
  owner's existing format, so no publishing change is needed. Owner may veto.
- **Result:** — **Decision:** —
