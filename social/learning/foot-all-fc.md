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
| EXP-footallfc-001 (card: youtube-growth/footallfc/experiments/experiment-log.md) | Publish slot (two Shorts a day) | 19:00 ET · 21:00 ET, higher topic score alternating between slots | 0 balanced so far (day 1: j_ApWmdOq7A 19:00, Ee8NbFAdEfg 21:00, unbalanced) | planned (2026-11-16) | n/a yet |

## Weekly reviews

_Newest first: date, best/weakest video, patterns, comment themes, decisions._

## Videos

| Date (UTC) | Title | Platform + ID | Topic / bucket | Length | Opening hook (line + first visual) | Animation style + interaction techniques | Thumbnail concept | Views 24h / 72h / 7d | Retention (swipe-away %, avg % viewed, avg duration, drop-off point) | Engagement (likes, comments, shares, subs/follows) | Experiment | What worked | What failed | Change next time |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 2026-11-16 00:00 | Barcelona Needed 3 Goals in 7 Minutes #shorts | YouTube j_ApWmdOq7A | Greatest comebacks: Barcelona 6–1 PSG (92) | 48.5 s | "Barcelona needed three goals... in seven minutes." + 88:00 clock | Comic History paper puppets; aggregate scoreboard patches; freeze on #20's toe | Remotion fallback: "IT WAS OVER… RIGHT?" (not set: channel not verified) | 216 at ~10 h / n/a / n/a | n/a (analytics lag; check 2026-11-18) | 2 likes, 0 comments at ~10 h | — | n/a yet | n/a yet | n/a yet |
| 2026-11-16 02:00 | Liverpool Were 3-0 Down at Half-Time #shorts | YouTube Ee8NbFAdEfg | Greatest comebacks: Istanbul 2005 (85) | n/a (not in repo) | n/a (no project folder or script in the repo) | n/a | n/a | 19 at ~8 h / n/a / n/a | n/a | 0 likes, 0 comments at ~8 h | — | n/a yet | n/a yet | n/a yet |
| 2026-11-17 00:00 (scheduled) | Leicester Were 5000-1 to Win the League #shorts | YouTube tNIQekn0giI | Greatest upsets: Leicester 2015–16 (84) | 48.5 s | "Bookmakers gave Leicester City a five thousand to one chance..." + betting slip stamped 5000/1 | Comic History puppets; season board (odds, position, Vardy counter); sofa + TV reaction scene | Remotion fallback: "BOTTOM TO CHAMPIONS" sofa leap (not set: channel not verified) | pending | pending | pending | — | pending | pending | pending |
| 2026-11-17 02:00 (scheduled) | Messi's First Barcelona Contract Was a Napkin #shorts | YouTube BrktyLaF4SI | Before they were famous: Messi growth hormone + napkin (86) | 55.7 s | "Lionel Messi's first Barcelona contract... was written on a paper napkin." + hand writing on a napkin | Comic History puppets; file card (age, treatment, club); hand/pen contact; growth montage | Remotion fallback: "TOO SMALL TO PLAY?" (not set) | pending | pending | pending | — | pending | pending | pending |
