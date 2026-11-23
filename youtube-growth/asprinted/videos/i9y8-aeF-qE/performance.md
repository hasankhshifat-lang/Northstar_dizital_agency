# Performance: i9y8-aeF-qE (asprinted)

The Comet That Was Supposed to Gas the Earth (1910) · long · 667 s · published 2026-11-20T00:00:28Z

Append-only checkpoint log (growth.py snapshots).

- 2026-11-23 · 72h · no analytics yet (data_through n/a: Analytics API lag or too few views); public views 0 · source: YouTube Data API + YouTube Analytics API (own OAuth client)

## Diagnostic report (weekly audit 2026-11-23): weakest long video
Median long-form views to date = 10 (nfI5VIM0wP8 10, 1xyUQOa6VgM 10, a9Hca04eBvw 22, this 0; `channel-report` top_videos,
data to 2026-11-21; public count 0 at ~90 h, Data API 2026-11-23 18:23 UTC).
1. **What went wrong?** No one watched: 0 public views ~3.8 days after publishing, the only As Printed video with zero.
2. **Metric:** public viewCount 0; no Analytics rows (data to 11-21). Impressions/CTR: n/a (not in API; vidIQ not connected).
3. **When:** from publish (Thu 19 Nov 19:00 ET); never started.
4. **Likely cause (hypothesis, priority order):** (1) topic demand: English long-form demand for the 1910 comet panic is
   small (last week's research: comet-pill Shorts 1–4k; no long-form hits), and the long video got essentially no browse
   impressions; (2) packaging: the title "…Supposed to Gas the Earth (1910)" is clear but competes with no search demand,
   and the channel (1 subscriber) gives no subscriber push. Can't separate (1) from (2) without impressions/CTR. Hook and
   story can't be judged: there are no viewers. Its Short (8h8BakYSZk0, 17 views) also stayed small, which points to
   topic/first frame rather than the long video's thumbnail alone.
5. **Evidence:** 0 views; Shorts feed supplied 681 of 750 channel views in 7d while related-video traffic gave longs only 28
   (`channel-report` traffic sources). Note for production (not the cause of 0 views): line 1 of the script is date-first
   ("In February, nineteen ten, a New York newspaper…"), which the RUNBOOK cold-open rule forbids.
6. **What can change:** pick topics whose event already has long-form demand (Galveston, Custer, Eastland; see
   research 2026-11-23); open with the surprise, not the date. Title/thumbnail changes on this video need owner approval;
   don't delete or re-upload.
7. **Test next:** EXP-asprinted-001 (title framing) once the owner OKs it, on high-demand topics.
