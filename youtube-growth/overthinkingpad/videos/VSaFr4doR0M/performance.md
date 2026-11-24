# VSaFr4doR0M · Why You Feel Like Everyone Is Watching You (long 10:31, published 2026-11-16 19:00 ET)

Source: `growth.py` snapshot/retention (YouTube Analytics API, own OAuth client), 2026-11-23. Impressions/CTR: n/a.

| Checkpoint | data_through | Views | Engaged | Avg % viewed | Avg duration | Subs | Traffic |
|---|---|---|---|---|---|---|---|
| 72h | 2026-11-19 | 20 | 14 (70%) | 16.8% | 1:45 | 0 | RELATED 10, external 5, SUBSCRIBER 3, CHANNEL 2 |
| lifetime to 11-21 | 2026-11-21 | 31 | 22 | 12.5% | — | 1 | — |

## Diagnostic report (2026-11-23; long-form median of 2 measured; weaker than the Short by far, best long on engagement)
1. **What went wrong?** Very little reach (20 views at 72h); most viewers left in the first 20 s.
2. **Metric:** views 20; watch ratio 0.93 at 6 s → 0.14 at 69 s; avg 16.8%.
3. **When:** drops at 12.6 s (−36 pts), 18.9 s (−14), 170 s (−14); small rewatch at 164 s and 25 s.
4. **Likely cause (hypothesis; 14 engaged viewers, one viewer = 7 pts):** 12.6 s is "That feeling has a name." right
   after the cold open; viewers who came for the answer heard a set-up instead of the number. 170 s is "This time,
   students wore a shirt they actually liked" (second study, same design repeated).
5. **Evidence:** `videos/overthinking-pad/2026-11-16-spotlight-effect/spotlight-effect_long.srt` lines 6–10 and 70–72.
6. **What can change:** reach first (no browse/search traffic: topic demand for long-form vs packaging can't be split
   without impressions/CTR); then payoff-first opening; shorten repeated study designs.
7. **Test next:** EXP-overthinkingpad-002 (payoff-first cold open). Get impressions/CTR from a Studio export.
- 2026-11-24 · 7d (age 184.8 h) · views 21 · engagedViews/views 15/21 = 0.714 · avg % viewed 17.8% · avg duration 112 s · US share 0.0% · subs gained 0 · data_through 2026-11-21 · source: YouTube Data API + YouTube Analytics API (own OAuth client)
  - retention (growth.py retention, 15 engaged viewers so very noisy): biggest drops at 12.6 s (-0.333), 18.9 s (-0.133), 170.4 s (-0.133), 44.2 s, 208.2 s (-0.067); script overthinking-pad-2026-11-16-spotlight-effect.md: 12.6–18.9 s = scene 2 "That feeling has a name. And in the year two thousand, a team of psychologists at Cornell…" (0:12.5–0:23.0), i.e. the turn from the second-person cold open to the study; 170.4 s = scene 19–20 "Maybe we only inflate the bad stuff… So the team ran it again" (2:37.8–2:54.3, chapter 2 restart of a similar study design). Watch ratio 0.93 at 6 s → 0.20 at 69 s.
  - Compare: too few videos to compare (n=1 long at 7d).
