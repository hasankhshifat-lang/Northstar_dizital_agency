# Learning database: Which Life Next (YouTube @whichlifenext + Which Life Next Facebook Page)

Audience: US audience, English, American history. **Only this channel's lessons go here; never mix them with the other channel.**
Rules: `docs/content/animation-direction-rules.md` section 8. Read this file before making a new video.

How to write to it: this file lives on `main`. A task working on another branch reads it with
`git show origin/main:social/learning/which-life-next.md` and adds rows on main through a separate worktree:
`git fetch origin main && git worktree add -f /tmp/ns-main origin/main && cd /tmp/ns-main && git checkout -B main origin/main`,
edit this file only, commit, `git push origin main` (if rejected: `git pull --rebase origin main` and push again;
network errors: retry with backoff 2s/4s/8s/16s), then `cd -` and `git worktree remove --force /tmp/ns-main`.
Metrics are filled in later (analytics lag 2–3 days); write "n/a" for a metric the platform doesn't give, never a guess.

## Proven practices (evidence-backed; updated by the weekly review)

_None yet. Add a line only with the videos/metrics that support it._

## Experiments

| Tag | Variable changed (one only) | Variants | Videos so far | Status | Result |
|---|---|---|---|---|---|

## Weekly reviews

_Newest first: date, best/weakest video, patterns, comment themes, decisions._

## Videos

| Date (UTC) | Title | Platform + ID | Topic / bucket | Length | Opening hook (line + first visual) | Animation style + interaction techniques | Thumbnail concept | Views 24h / 72h / 7d | Retention (swipe-away %, avg % viewed, avg duration, drop-off point) | Engagement (likes, comments, shares, subs/follows) | Experiment | What worked | What failed | Change next time |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 2026-11-09 | The Titanic's Baker Was Having a Drink While It Sank #shorts | YT ctx0tm_C56c | Titanic baker Charles Joughin / TI | n/a | "The Titanic's baker drank whiskey…" (queue #1 hook) | Pony Express map + ground scenes | n/a | n/a / n/a / 1,256 (2026-11-13) | swipe-away 44% (engaged 704/1,251), avg 79.0% viewed, avg 44 s, drop-off n/a | n/a | none | Best % viewed of the week; topic travels (Titanic) | — | — |
| 2026-11-10 | The US Army Fooled Hitler With Rubber Tanks #shorts | YT vy-qRhRjnN0 · FB 2368013064009574 | Ghost Army inflatable tanks / WR | 57.5 s | "These tanks are made of rubber." + rubber tank on the field | Map + ground scenes (tank inflate, carry, speakers) | n/a | ~56 (analytics, 11-10) / 61 / n/a | swipe-away 66% (engaged 19/56), avg 43.6% viewed, avg 25 s, drop-off n/a | n/a | none | — | Very high swipe-away; object hook without a person in peril | Test a person-in-danger first frame vs an object first frame (one variable) |
| 2026-11-11 | This Chicken Lived 18 Months Without a Head #shorts | YT PKdcctcYjfw · FB 1501407483048801 | Mike the headless chicken / WD | 55.0 s | "In 1945 a farmer cut off a chicken's head. It kept walking." | Map + ground scenes (chicken rig) | 2D cartoon (owner) | n/a / ~170 (2026-11-13, ~54 h) / n/a | n/a (analytics lag) | n/a | none | — | — | — |
| 2026-11-12 | Left for Dead, He Crawled 200 Miles #shorts | YT _w_jqoz9elc · FB 1415038377023916 | Hugh Glass / WW | 58.8 s | "His own men left him for dead… and took his rifle." + Glass on the ground, men walking off | Map + ground scenes (bear rig, lying man, crawl) | none (Figma limit) | ~81 (2026-11-13, ~30 h) / n/a / n/a | n/a (analytics lag) | n/a | none | — | — | — |
| 2026-11-13 | The Night the Mississippi Ran Backward #shorts | YT ulARZlhrP30 · FB 1887036389329820 | New Madrid earthquake 1812 / SV | 54.0 s | "At 3:45 in the morning, the Mississippi River started flowing backward." + flatboat on a night river whose current flips (THE RIVER RAN BACKWARD) | Map + 11 ground scenes; new Kit arm angles with hand-attached props (pole, axe, bucket, rail, child's hand), cutaway of the uplift, seamless loop ending | Figma map art + "AN EARTHQUAKE / DID THIS" (not exported yet: Figma seat limit) | pending | pending | pending | none | — | — | — |
