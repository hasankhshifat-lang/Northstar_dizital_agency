# Performance: 5BAbL0eYfRQ (whichlifenext)

Japan Bombed Oregon With Paper Balloons #shorts · short · 57 s · published 2026-11-17T22:00:09Z

Append-only checkpoint log (growth.py snapshots).

- 2026-11-23 · 72h (age 138.8 h) · views 574 · engagedViews/views 270/574 = 0.47 · avg % viewed 57.5% · avg duration 32 s · US share 27.0% · subs gained 0 · data_through 2026-11-20 · source: YouTube Data API + YouTube Analytics API (own OAuth client)
  - retention (growth.py retention): biggest drops at 6.8 s (-0.085), 6.3 s (-0.063), 5.1 s (-0.056); no script file in social/scripts/ for this video, not mapped · impressions/CTR/stayed-to-watch: n/a (vidIQ not connected)
- 2026-11-25 · 7d (age 186.8 h) · views 574 · engagedViews/views 270/574 = 0.47 · avg % viewed 57.5% · avg duration 32 s · US share 27.0% · subs gained 0 · data_through 2026-11-20 · source: YouTube Data API + YouTube Analytics API (own OAuth client)
  - retention (growth.py retention): biggest drops at 6.8 s (-0.085), 6.3 s (-0.063), 5.1 s (-0.056); same curve as 72h (same data_through); no script file in social/scripts/ for this video, not mapped · impressions/CTR/stayed-to-watch: n/a (vidIQ not connected)
  - **Flag (2026-11-25):** below channel median at 7d, Shorts (574 vs 968 views, n=13; engaged 0.470 vs 0.564; 57.5% vs 68.6% viewed).

## Diagnostic report (daily checkpoints 2026-11-25; skill section 10)
1. **What went wrong:** reach about 40% below the channel's 7d Shorts median, and fewer viewers stayed past second 1.
2. **Metric:** 574 views vs median 968 (7d, n=13); engagedViews/views 0.470 vs median 0.564; avg viewed 57.5% vs 68.6%; 97% of views from the Shorts feed (556/574); US 27% (Analytics API, data to 11-20).
3. **When:** at the first frame (engaged ratio) and 5.1–6.8 s (three biggest drops, -0.056 to -0.085).
4. **Likely cause (hypothesis):** topic first: the Fu-Go balloon-bomb story is known but niche, and it was the only Short at 17:00 ET (EXP-001 test arm, where the 17:00 slot did not raise reach). Next in order, the hook: "Six people on a church picnic in Oregon... were killed by a bomb from Japan" spends the first 5 s on set-up before the balloon (the strange part) appears, which matches the drops at 5–7 s.
5. **Evidence:** engaged ratio and avg % viewed both below median, so this isn't distribution alone; drops cluster where the hook line ends and the balloon reveal starts. One video: hypothesis only.
6. **What can change:** put the odd object (paper balloon) in the first frame and first line for strange-weapon topics.
7. **Test next:** already covered by EXP-firstframe-person-vs-object (this video is in the person arm); don't open a new test.
