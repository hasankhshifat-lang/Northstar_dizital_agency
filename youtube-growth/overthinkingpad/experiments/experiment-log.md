# Growth experiment log: overthinkingpad

One card per experiment (template in the skill, section 11). One major variable at a time; baseline first;
≥3 videos per arm or 28 days before deciding. Failed experiments stay here so they are not repeated.
Mirror each card as a row in `social/learning/<channel>.md` → Experiments.

### EXP-overthinkingpad-001 Shorts hook: "the study" vs "your moment" (first line + first frame)
- **Problem:** unknown yet; the first Short (8GYwZB1soxo, "Researchers made students wear an embarrassing shirt…")
  opens on the study set-up. The long video opens on a second-person moment ("You walk into a room…").
- **Baseline:** none yet (first Short goes live 2026-11-16 20:00 ET). Record engaged ÷ views and avg % viewed at 72 h for
  the first 3 Shorts (all study-first) as the control.
- **Hypothesis:** a second-person moment ("You sent the text. Then you reread it eleven times.") stops more scrolls than
  a study set-up, because the viewer sees themselves before the science.
- **Change (one variable):** first line + first frame: viewer's moment vs study set-up. Length, look, voice, publish time
  unchanged.
- **Control:** study-first Shorts.
- **Expected outcome:** engaged ÷ views higher by ≥5 pts at 72 h.
- **Metric + checkpoint:** engagedViews ÷ views and avg % viewed at 72 h and 7 d (`growth.py snapshot`).
- **Sample:** ≥3 Shorts per arm (alternate episodes), so about 3 weeks.
- **Data 2026-11-24 (daily checkpoints):** control 8GYwZB1soxo 7d = 377/638 = 59.1% engaged, 59.4% viewed (Analytics data_through 11-19, same as 72h); HpMzRZJs5So 24h Analytics not in yet. No treatment data yet. Still running, no decision.
- **Status 2026-11-24:** treatment arm started: kyphkB4zuzc ("You just read okay, with a period... fourteen times.", 20:00 ET 11-24). The 11-23 Short lMU813FS0FE has no run record (files missing); its title reads study-first, treat its arm as unknown.
- **Status:** planned (weekly audit 2026-11-23). Control arm published 3 of 3 (8GYwZB1soxo 11-16, q4cK6ZazDEo 11-17,
  HpMzRZJs5So 11-22). Control data (YouTube Analytics API via growth.py, own OAuth client):
  8GYwZB1soxo 72h engaged/views 377/638 = 59.1%, avg viewed 59.4% (data to 11-19); lifetime to 11-21 608/1,050 = 57.9%.
  q4cK6ZazDEo 72h only 7 views in Analytics (lagging; 3/7 engaged), lifetime to 11-21 131/281 = 46.6%, avg viewed 49.6%.
  HpMzRZJs5So: no Analytics yet (64 public views at 17.5 h); its 72h reading lands ~11-28 with the API lag.
  Note: the 72h checkpoint under-reported q4cK6ZazDEo (views came on day 4), so read both 72h and 7d for every arm.
  Recommendation: start the treatment arm on the next episode's Short (control videos are already fixed; waiting only
  delays the test). Alternate arms from then on.
- **Result:** none yet (control arm data incomplete; no treatment videos). **Decision:** —

### EXP-overthinkingpad-002 Long-form cold open: payoff-first vs scene-first
- **Problem:** long videos lose most viewers in the first 30 s. VSaFr4doR0M: −36 pts at 12.6 s ("That feeling has a
  name." right after the scene), watch ratio 0.14 at 69 s. b9ReSvwwjNw: −20 pts at 20.8 s and −40 pts at 27.7 s
  (recap + "Here's the strange part"), 0.10 at 76 s. Tiny samples (14 and ~10 engaged viewers): hypothesis only.
- **Baseline (scene-first, 3 videos):** VSaFr4doR0M avg viewed 16.8%, watch ratio ~0.93 at 6 s; b9ReSvwwjNw 5.75%;
  nbM4DVNyLo8 (opens "It's four in the afternoon...") pending its 72h/7d data. Source: growth.py snapshot/retention.
- **Hypothesis:** stating the surprising finding and what the viewer will get inside the first 10 s ("They guessed half
  the room noticed. It was a quarter. Here's why your brain gets this wrong, and the one thing that fixes it.") keeps
  more viewers past 30 s than opening on a relatable scene and naming the finding later.
- **Change (one variable):** the first 10–15 s of narration + visuals: payoff/promise first, then the scene. Topic
  bucket, length (10–12 min), look, voice (VibeVoice Frank), thumbnail rules and the 7 PM ET slot unchanged.
- **Control:** scene-first cold open (episodes 1–3).
- **Expected outcome:** watch ratio at 30 s higher by ≥10 pts, and avg % viewed at 7 d higher.
- **Metric + checkpoint:** `growth.py retention` watch ratio at 30 s and 60 s, avg % viewed and engaged ÷ views at 72 h
  and 7 d. Impressions/CTR from a Studio export if the owner provides one (not in API).
- **Sample:** ≥3 long videos per arm (alternate episodes), or 28 days; allow for topic differences.
- **Status:** planned (proposed 2026-11-23; does not touch the Shorts, so it does not confound EXP-001).
- **Result:** — **Decision:** —
