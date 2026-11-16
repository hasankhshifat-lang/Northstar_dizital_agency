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
- **Result:** — **Decision:** —
