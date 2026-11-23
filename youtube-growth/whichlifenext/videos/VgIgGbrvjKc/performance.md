# Performance: VgIgGbrvjKc (whichlifenext)

She Survived the Titanic and Both Its Sister Ships #shorts · short · 52 s · published 2026-11-18T22:00:03Z

Append-only checkpoint log (growth.py snapshots).

- 2026-11-23 · 72h (age 114.8 h) · views 351 · engagedViews/views 155/351 = 0.442 · avg % viewed 53.0% · avg duration 27 s · US share 11.1% · subs gained 0 · data_through 2026-11-20 · source: YouTube Data API + YouTube Analytics API (own OAuth client)
  - retention (growth.py retention): biggest drops at 1.6 s (-0.077), 1.0 s (-0.077), 5.2 s (-0.077); no script file in social/scripts/ for this video, not mapped · impressions/CTR/stayed-to-watch: n/a (vidIQ not connected)

## Diagnostic report (weekly audit 2026-11-23; growth.py snapshot + retention, data to 11-20; script not on main, hook line from the learning database)
1. **What went wrong:** a high-demand topic (Titanic) lost viewers fast: lowest engaged ratio and % viewed of the week.
2. **Metric:** engaged/views 0.442 (week median 0.487); avg % viewed 53.0% (week's lowest; Balloons 57.5%, week median 74.0%); relative retention vs similar Shorts 0.27–0.30 from 5.7 s to 16 s.
3. **When:** first second (drops at 1.0 s and 1.6 s), then 5.2–6.8 s (watch ratio 0.93 at 5.7 s → 0.59 at 10.9 s).
4. **Likely cause (priority order):** demand is fine (Titanic; Violet Jessop Shorts are common, so competition is a secondary factor). Hook (priority 3): a long first line that gives away the payoff ("…and on both of its sister ships when they were hit") over a dark night lifeboat frame. Story (priority 4): the next beat is the 1911 Solent map (Olympic/Hawke) with no open question.
5. **Evidence:** the 5–11 s fall is the steepest relative to similar Shorts on the channel this week; same 5–8 s pattern on Balloons, Alcatraz and Ghost Army.
6. **Change:** hold back the "three ships" payoff and ask one question by second 4; brighter first frame.
7. **Test:** EXP-whichlifenext-002 (planned): open question at 2–6 s vs explanation.
