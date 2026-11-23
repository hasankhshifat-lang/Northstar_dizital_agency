# Growth experiment log: asprinted

One card per experiment (template in the skill, section 11). One major variable at a time; baseline first;
≥3 videos per arm or 28 days before deciding. Failed experiments stay here so they are not repeated.
Mirror each card as a row in `social/learning/<channel>.md` → Experiments.

### EXP-asprinted-001 Title framing: event-first vs press-first (long-form)
- **Problem:** the first long video (press-first title "What America Read the Morning After Titanic Sank") had 8 public
  views at ~18 h, while its Short had 445 (Data API, 2026-11-16 18:24 UTC). Search demand for press framing ("newspaper
  got it wrong", "Dewey defeats Truman") is near zero in the last 90 days; event searches have demand.
- **Baseline:** n=1 long (nfI5VIM0wP8), no analytics yet (data to 11-14). **Not usable until the channel can set custom
  thumbnails** (HTTP 403, channel not verified): a default-frame thumbnail confounds any packaging test.
- **Hypothesis:** titles that lead with the event and its human stakes (press angle as the twist) get more browse and
  search clicks than titles that lead with the newspaper.
- **Change (one variable):** long-form title framing. Thumbnail style (archive), length, publish time unchanged.
- **Control:** press-first titles ("What the papers said…", "The headline that…").
- **Expected outcome:** higher long-form views and engagedViews at 72 h and 7 d; CTR if vidIQ/Studio becomes available.
- **Metric + checkpoint:** views + engagedViews at 72 h / 7 d (`growth.py snapshot`), YouTube search share.
- **Sample:** ≥3 long videos per arm, alternating days, after custom thumbnails work.
- **Status:** planned (needs: channel verification for thumbnails; owner OK on title approach).
- **Update 2026-11-23 (weekly audit):** precondition 1 is met: custom thumbnails have been set on every upload since
  2026-11-17 (schedule log; 1xyUQOa6VgM onward). Still waiting for the owner's OK on the title approach, so the test has
  **not started**. The titles published so far were mixed without a plan, so they are **not** experiment data. For the
  record only (observational, different topics, n=2 per side, analytics lag): press-first longs nfI5VIM0wP8 (Titanic) 10
  views at 7d, a9Hca04eBvw (Twain) 17 views at 72h; event-first longs 1xyUQOa6VgM (False Armistice) 6 views at 72h,
  i9y8-aeF-qE (Comet) 0 (public 0 at ~90 h). Source: `growth.py snapshot` (YouTube Analytics API, own OAuth client, data
  through 2026-11-18…11-20) and Data API public counts 2026-11-23 18:23 UTC. All four are far below any useful level; the
  bigger problem is that long videos get almost no impressions at all (topic demand, see weekly audit), so this test
  should run on high-demand topics, or its signal will be lost in near-zero counts. pnyrzN9UnR8 (USS Maine, 11-23,
  event-first) is the next long video, also outside the test.
- **Result:** — **Decision:** — (no data from the card's sample yet)

### EXP-asprinted-002 Short beat 2: spoken date line vs straight to the conflict
- **Problem:** every Short so far spends seconds ~2–9 on a spoken provenance line ("That is a real front page, printed on
  the evening of April fifteenth, nineteen twelve."). In the only Short with a retention curve, I3uM_6UVWp0, the three
  biggest drops are at 6.4 s (−0.086), 7.9 s (−0.060) and 9.5 s (−0.051), exactly on "evening of April fifteenth /
  nineteen twelve." (srt lines 4–5), and watch ratio falls from 1.137 at 5.8 s to 0.761 at 11.1 s, relative retention
  0.46 vs similar Shorts (`growth.py retention`, data through 2026-11-21). The RUNBOOK's own timing wants 3–10 s to be the
  conflict, not background.
- **Baseline:** Shorts, channel 7d (11-15…11-21): engagedViews/views 242/712 = 0.34, avg % viewed 54.7%, avg view
  duration 29 s (`channel-report`, Analytics API). Per video at 72h: XxaVSsEPZ9Y 6/24 = 0.25, 40.5%; I3uM_6UVWp0 at 7d
  117/364 = 0.32, 57.0%. n=4 Shorts, two with near-zero data.
- **Hypothesis:** cutting the spoken date/provenance sentence (keeping the date and paper name as on-screen text on the
  page label) and going from the headline straight to the conflict question raises the share of viewers past 10 s.
- **Change (one variable):** Short beat 2 narration only: no spoken "That is a real front page, printed on <date>"; the
  date stays on screen. Hook line, length (45–60 s), thumbnail look, music, voice (VibeVoice Frank) and 8 PM ET slot
  unchanged.
- **Control:** current structure (spoken date line in beat 2).
- **Expected outcome:** higher watch ratio at 10 s and higher avg % viewed; engagedViews/views at least as high.
- **Metric + checkpoint:** `growth.py retention` watch ratio at ~10 s, avg % viewed and engagedViews/views at 72 h and 7 d.
- **Sample:** ≥3 Shorts per arm, alternating days (6 episodes), topics balanced by demand where possible.
- **Status:** planned (proposed 2026-11-23; production change in the Short script only; owner may veto).
- **Result:** — **Decision:** —
