# b9ReSvwwjNw · Why Your Brain Replays That Awkward Moment at 2 A.M. (long 11:33, published 2026-11-17 19:00 ET)

Source: `growth.py --channel overthinkingpad snapshot --all / retention` (YouTube Analytics API, own OAuth client),
collected 2026-11-23 18:28 UTC. Impressions/CTR: n/a (not in API; vidIQ not connected).

| Checkpoint | data_through | Views | Engaged | Avg % viewed | Avg duration | Subs | Traffic |
|---|---|---|---|---|---|---|---|
| 72h | 2026-11-20 | 104 | 10 (9.6%) | 5.75% | 0:39 | 0 | SUBSCRIBER 101, RELATED 2 |
| lifetime to 11-21 (channel-report top_videos) | 2026-11-21 | 107 | 13 | 4.96% | — | 0 | — |

## Diagnostic report (weekly audit 2026-11-23; below the long-form median at 72h on engaged views and % viewed)
1. **What went wrong?** Almost nobody watched past the first 30 s; no discovery traffic.
2. **Metric:** avg % viewed 5.75% (ep 1: 16.8%), engaged 10 of 104; 101 of 104 views tagged SUBSCRIBER on a channel
   with 1 subscriber, 0 browse/search.
3. **When:** retention drops at 20.8 s (−20 pts) and 27.7 s (−40 pts); watch ratio 0.10 by 76 s.
4. **Likely cause (hypothesis, tiny sample ~10 real viewers):** the cold open ends on a recap line ("Your brain can't
   remember where you put your keys... kept a perfect copy of that", 16–24 s) then a stall ("Here's the strange part.
   Replaying it feels like you're working something out", 26–31 s) before any promise of what the video will give.
   The 101 "subscriber" views look like an attribution anomaly (or a notification/feed test), so the views are not
   reliable evidence of topic demand either way.
5. **Evidence:** caption timings `videos/overthinking-pad/2026-11-17-replay-loop/replay-loop_long.srt` lines 6–14;
   retention curve above; topic research 2026-11-16 scored this topic 74 ("average, find a stronger angle").
6. **What can change:** topic demand first (it was the weakest-scored topic of the week, crowded with small channels);
   then the opening: state the payoff (the step-back finding) inside 10 s.
7. **Test next:** EXP-overthinkingpad-002 (long-form cold open: payoff-first). No title/thumbnail change proposed
   (no impressions/CTR data to justify it).
