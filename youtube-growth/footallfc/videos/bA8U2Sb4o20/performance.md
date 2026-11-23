# Performance: bA8U2Sb4o20 (footallfc)

Real Madrid Fans Applauded a Barcelona Player #shorts · short · 57 s · published 2026-11-18T02:00:38Z

Append-only checkpoint log (growth.py snapshots).

- 2026-11-23 · 72h (age 134.8 h) · views 91 · engagedViews/views 35/91 = 0.385 · avg % viewed 36.0% · avg duration 20 s · US share 14.3% · subs gained 1 · data_through 2026-11-19 · source: YouTube Data API + YouTube Analytics API (own OAuth client)
  - retention (growth.py retention): biggest drops at 11.4 s (-0.086), 10.8 s (-0.086), 6.3 s (-0.086); script ronaldinho-bernabeu-ovation.md: 6.3 s and 10.8–11.4 s = line 2 (5.8–14.4 s) "November nineteenth, two thousand five. The Clasico, at the Bernabeu. Barcelona were already one nil up."
  - **Flag:** below median at 72h (91 vs 156, n=6). Hypothesis: story/production after a proven topic: avg 36% viewed is the channel's lowest, losing viewers at the date/context line (6–11 s).

## Diagnostic report (weekly audit 2026-11-23; skill section 10)
1. **What went wrong?** Second-fewest views at 72 h and the lowest average % viewed on the channel.
2. **Metric:** 91 views vs median 156 (72 h, n=6); avg % viewed 36.0% vs median 50%; avg duration 20 s of 57 s; engaged ratio 0.385 (above median, so the hook worked) (Analytics API, data to 11-19).
3. **When:** 6.3 s and 10.8–11.4 s: watch ratio 0.91 at 6 s → 0.46 at 12 s, then 0.20 by 29 s.
4. **Likely cause:** topic demand proven (Ronaldinho ovation, 19.7M top video) but heavily covered; packaging set at launch. Most likely: **story/pacing**: after a strong payoff-first hook, line 2 (5.8–14.4 s) is date + place + score context ("November nineteenth, two thousand five. The Clasico, at the Bernabeu. Barcelona were already one nil up.") with no new image, and half the viewers leave there. The two goals then repeat the same staging.
5. **Evidence:** the drop sits exactly on the context line; same 5–12 s drop pattern on BrktyLaF4SI, Ee8NbFAdEfg and (smaller) tNIQekn0giI.
6. **What can change:** move date/place into an on-screen tag while action continues; go from hook straight to the first goal.
7. **Test next:** production direction for all new scripts (no context-only line in 4–12 s); measured through the watch ratio at 10 s in EXP-footallfc-002.
