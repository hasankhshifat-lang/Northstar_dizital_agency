# Learning database: Foot All FC (animated football stories, YouTube)

Audience: football fans worldwide, English. Format: true football stories retold as paper-puppet cartoons
(lemo-opuscar Comic History Cartoon style), no match footage, no club crests, no real likenesses; players are generic
puppets identified by shirt number. **Only this channel's lessons go here; never mix them with Which Life Next or
Scientific Bithi.** Rules: `docs/content/animation-direction-rules.md` section 8. Read this file before making a new video.

How to write to it: this file lives on `main`. A task working on another branch reads it with
`git show origin/main:social/learning/foot-all-fc.md` and adds rows on main through a separate worktree:
`git fetch origin main && git worktree add -f /tmp/ns-main origin/main && cd /tmp/ns-main && git checkout -B main origin/main`,
edit this file only, commit, `git push origin main` (if rejected: `git pull --rebase origin main` and push again;
network errors: retry with backoff 2s/4s/8s/16s), then `cd -` and `git worktree remove --force /tmp/ns-main`.
Metrics are filled in later (analytics lag 2–3 days); write "n/a" for a metric the platform doesn't give, never a guess.

## Channel facts

- Name: Foot All FC (chosen 2026-11-15). Handle: to confirm when the channel is created.
- Topic research (2026-11-15, YouTube Data API): animated football true stories and parodies draw millions of views as
  Shorts; candidate topics scored in `social/scripts/barca-6-1-psg-remontada.md` (Barcelona 6–1 PSG 92, Messi growth
  hormone 86, Istanbul 2005 85, Leicester 5000–1 84, Ronaldinho ovation 75, Agüero 93:20 72).
- Copyright: never use broadcast or league footage (Premier League/UEFA Content ID and strikes); facts are fine, footage is not.

## Proven practices (evidence-backed; updated by the weekly review)

_None yet. Add a line only with the videos/metrics that support it._

## Experiments

| Tag | Variable changed (one only) | Variants | Videos so far | Status | Result |
|---|---|---|---|---|---|
| EXP-footallfc-001 (card: youtube-growth/footallfc/experiments/experiment-log.md) | Publish slot (two Shorts a day) | 19:00 ET · 21:00 ET, higher topic score alternating between slots | day 1: higher score at 19:00 (j_ApWmdOq7A 92 / Ee8NbFAdEfg 85); day 2: higher at 21:00 (BrktyLaF4SI 86 / tNIQekn0giI 84); day 3: higher at 19:00 (krePEx98iNA 88 / bA8U2Sb4o20 84); day 4: higher at 21:00 (hVYufhSqQwE 88 / Tw7hVywh-88 85) | running (2026-11-18) | n/a yet |

## Weekly reviews

_Newest first: date, best/weakest video, patterns, comment themes, decisions._

## Videos

| Date (UTC) | Title | Platform + ID | Topic / bucket | Length | Opening hook (line + first visual) | Animation style + interaction techniques | Thumbnail concept | Views 24h / 72h / 7d | Retention (swipe-away %, avg % viewed, avg duration, drop-off point) | Engagement (likes, comments, shares, subs/follows) | Experiment | What worked | What failed | Change next time |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 2026-11-16 00:00 | Barcelona Needed 3 Goals in 7 Minutes #shorts | YouTube j_ApWmdOq7A | Greatest comebacks: Barcelona 6–1 PSG (92) | 48.5 s | "Barcelona needed three goals... in seven minutes." + 88:00 clock | Comic History paper puppets; aggregate scoreboard patches; freeze on #20's toe | Remotion fallback: "IT WAS OVER… RIGHT?" (not set: channel not verified) | 216 at ~10 h, 456 at ~34 h / 625 at ~58 h / n/a | per-video analytics n/a yet; channel day 2026-11-15 (PT, this + Ee8NbFAdEfg): 266 views, 104 engaged, avg 26 s, 54.7% viewed (Analytics API, 2026-11-18) | 2 likes, 0 comments at ~10 h | — | n/a yet | n/a yet | n/a yet |
| 2026-11-16 02:00 | Liverpool Were 3-0 Down at Half-Time #shorts | YouTube Ee8NbFAdEfg | Greatest comebacks: Istanbul 2005 (85) | n/a (not in repo) | n/a (no project folder or script in the repo) | n/a | n/a | 19 at ~8 h, 48 at ~32 h / 80 at ~56 h / n/a | see channel-day row of j_ApWmdOq7A | 0 likes, 0 comments at ~8 h | — | n/a yet | n/a yet | n/a yet |
| 2026-11-17 00:00 (scheduled) | Leicester Were 5000-1 to Win the League #shorts | YouTube tNIQekn0giI | Greatest upsets: Leicester 2015–16 (84) | 48.5 s | "Bookmakers gave Leicester City a five thousand to one chance..." + betting slip stamped 5000/1 | Comic History puppets; season board (odds, position, Vardy counter); sofa + TV reaction scene | Remotion fallback: "BOTTOM TO CHAMPIONS" sofa leap (not set: channel not verified) | 28 at ~10 h / n/a / n/a | pending (analytics lag; check 2026-11-19) | 0 likes, 0 comments at ~10 h | — | pending | pending | pending |
| 2026-11-17 02:00 (scheduled) | Messi's First Barcelona Contract Was a Napkin #shorts | YouTube BrktyLaF4SI | Before they were famous: Messi growth hormone + napkin (86) | 55.7 s | "Lionel Messi's first Barcelona contract... was written on a paper napkin." + hand writing on a napkin | Comic History puppets; file card (age, treatment, club); hand/pen contact; growth montage | Remotion fallback: "TOO SMALL TO PLAY?" (not set) | 75 at ~8 h / n/a / n/a | pending (check 2026-11-19) | 1 like, 0 comments at ~8 h | — | pending | pending | pending |
| 2026-11-18 00:00 (scheduled) | Man United Were Losing the Final at 90 Minutes #shorts | YouTube krePEx98iNA | Greatest comebacks: Man United 2–1 Bayern 1999 (88) | 45.9 s | "Ninety minutes gone... and Manchester United were losing the Champions League final." + 90:00 clock | Comic History puppets; score + match-minute patches; lateral slide (+3 board / ribbons on the cup / official leaving); high-angle corners; freeze on #20's toe | Skill Remotion engine: "2 GOALS, 2 MINUTES", #20 poking it in (set) | pending | pending | pending | EXP-footallfc-001 day 3 (19:00, higher score) | pending | pending | pending |
| 2026-11-18 02:00 (scheduled) | Real Madrid Fans Applauded a Barcelona Player #shorts | YouTube bA8U2Sb4o20 | Respect / rivalry: Ronaldinho's Bernabéu ovation 2005 (84) | 56.4 s | "Real Madrid fans... standing up to applaud a Barcelona player. In their own stadium." + stands on their feet clapping | Comic History puppets; payoff shown first; two mirrored goal runs past #4; stands rising row by row; scrapbook 1983/2005 | Skill Remotion engine: "THEY STOOD FOR HIM", #10 waving at the standing crowd (set) | pending | pending | pending | EXP-footallfc-001 day 3 (21:00) | pending | pending | pending |
| 2026-11-19 00:00 (scheduled) | Brazil Only Needed a Draw to Win the World Cup #shorts | YouTube Tw7hVywh-88 | World Cup upsets: Maracanazo 1950 (85) | 56.4 s | "Brazil only needed a draw... to win the World Cup. At home." + the cup waiting beside relaxed Brazil players | Comic History puppets; group table with 7–1/6–1 stamps; box from above for the near-post shot (freeze); full-panel crowd that freezes and greys for the silence; spotlight on #1 | Skill Remotion engine: "200,000 WENT SILENT", Uruguay #7 shooting past Brazil #1 (set) | pending | pending | pending | EXP-footallfc-001 day 4 (19:00) | pending | pending | pending |
| 2026-11-19 02:00 (scheduled) | Barcelona Lost Because Nobody Watched This Corner #shorts | YouTube hVYufhSqQwE | Greatest comebacks: Liverpool 4–0 Barcelona 2019, the quick corner (88) | 53.1 s | "Barcelona lost a Champions League semi-final... because they weren't watching a corner." + box from above, #66 walking away, defenders turned | Comic History puppets; tonight + aggregate patches; bench with OUT stamps; ball held at #66's real hand position then dropped; red sight-lines; spin + freeze on #27 | Skill Remotion engine: "THE SNEAKY CORNER", corner from above with ringed #27 (set) | pending | pending | pending | EXP-footallfc-001 day 4 (21:00, higher score) | pending | pending | pending |
