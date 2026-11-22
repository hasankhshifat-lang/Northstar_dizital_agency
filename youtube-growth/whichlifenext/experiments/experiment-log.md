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
- **Result:** — **Decision:** — (read-out about 2026-11-24, decision about 2026-11-28)

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
- **Result:** — **Decision:** —

_No new experiment proposed this week: two are running on the same Shorts, and a third would confound both._


### 2026-11-22 update: EXP-whichlifenext-001 confounded
Owner moved Which Life Next to 3 Shorts a day (08:00 / 13:00 / 17:00 ET) on 2026-11-22, so the one-Short-a-day test stops being clean. Interim data (YouTube Analytics to 11-19, read 2026-11-22): 08:00 ET arm 11-14…11-16 = 1,645 / 1,523 / 1,201 views, swipe-away 48–51%; 17:00 ET arm 11-17…11-19 = 573 / 349 / 52 (lycDlMhOJ_M only ~2 h of data), swipe-away 52–56%. 17:00 ET reach is clearly lower so far; no Shorts were scheduled 11-20…11-22 (missed runs). Keep logging per-slot results; decide in the weekly review.
