# Learning database: Scientific Bithi / সাইন্টিফিক বিথী (Facebook Page 1497857623404891)

Audience: Bangladeshi audience, Bangla comic science (NCTB classes 6–10). **Only this channel's lessons go here; never mix them with the other channel.**
Rules: `docs/content/animation-direction-rules.md` section 8. Read this file before making a new video.

How to write to it: this file lives on `main`. A task working on another branch reads it with
`git show origin/main:social/learning/scientific-bithi.md` and adds rows on main through a separate worktree:
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

- 2026-11-14 (daily run note, not a full weekly review): first real retention data (FB video_insights now readable). All three posted Shorts lose 30–50% of viewers between 3 s and 6 s, and average watch time is 3–8 s of ~60 s. Samples are tiny (11–192 plays, 1 follower), so no conclusions yet; the first priority to watch is the first 3–6 s.

## Videos

| Date (UTC) | Title | Platform + ID | Topic / bucket | Length | Opening hook (line + first visual) | Animation style + interaction techniques | Thumbnail concept | Views 24h / 72h / 7d | Retention (swipe-away %, avg % viewed, avg duration, drop-off point) | Engagement (likes, comments, shares, subs/follows) | Experiment | What worked | What failed | Change next time |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 2026-11-09 | লজ্জাবতী কেন লজ্জা পায়? 🌿 (Short 3) | FB Reel 1980949426652411 | biology: plant movement (NCTB) | 59.5 s | Boltu: "আপু! আমি গাছটারে মাইরা ফেলছি!" — Boltu touches the plant and the leaves fold | puppet engine; hinge-cell board demo; insect-landing close-up; goat chews Mama's gamchha | style B (made outside Figma): Bithi amazed + folded plant, hook "গাছও কি লজ্জা পায়?!" | n/a / n/a / 11 plays by 11-14 (9 FB Reels plays, 2 replays) | avg watched 8.4 s of 59.5 (14%); 100% to 4 s, 67% at 6 s, 33% from 9 s to the end (only 11 plays) | 0 likes, 0 comments, 0 shares, 0 follows | – | n/a yet | n/a yet | n/a yet |
| 2026-11-10 | লোহার লঞ্চ ভাসে কেন? 🚢 (Short 1, v2) | FB Reel 2526369694510049 | physics: buoyancy (NCTB 9–10 ch.5) | 66.0 s | Mama: "পেরেক ডুইবা গেল! এই লঞ্চও তো লোহার!" — nail drops into the river and sinks | puppet engine; foil boat vs foil ball demo; Archimedes portal cameo (scientist) | n/a (not recorded by that run) | n/a / n/a / 126 plays by 11-14 | avg watched 8.4 s of 66 (13%); 100% to 3 s, 69% at 5 s, 44% at 10 s, 26% at 16 s, 15% at 30 s, 13% at the end; main drop 3–10 s | 1 like, 0 comments, 0 shares, 0 follows | – | n/a yet | n/a yet | n/a yet |
| 2026-11-11 | সাবান দিলেই হলুদ লাল! 😱 (Short 2) | FB Reel 1958131865150436 | chemistry: acid/base indicator (turmeric) | 59.2 s | Mama's new fatwa: turmeric stain turns red with soap — "রক্ত নাকি?" | n/a (that run's files are not in the repo) | n/a | n/a / n/a / 192 plays by 11-14 (12 replays) | avg watched 3.4 s of 59.2 (6%); 100% to 3 s, 59% at 4 s, 48% at 6 s, 31% at 12 s, 14% at 27 s, 3% at the end; main drop 3–6 s | 0 likes, 0 comments, 0 shares, 0 follows | – | n/a yet | n/a yet | n/a yet |
| 2026-11-14 | চমক আগে, গর্জন পরে কেন? ⚡ (Short 4) | FB Reel 1152017963974579 (scheduled 14:00 UTC) | physics: speed of light vs sound (NCTB 9–10 ch.7) | 61.5 s | Real phenomenon first: bolt + flash at 0.3 s, on-screen count ১-২-৩, thunder at 3.1 s; Mama: "চমক আগে আইলো, গর্জন আইলো তিন সেকেন্ড পরে! ক্যান?" | puppet engine; storyboard first; Mama's sky-road imagination (motorbike vs bus jam); board demo: light ray + sound rings leave the bolt together, eye lights first, ear later, 3 s ring along a 1 km ruler; safety icons; Boltu's paper-bag pop (prop held in hands); rain from the safety scene on; no scientist | style B preview made outside Figma (Figma limit): Bithi amazed + big bolt + stopwatch ৩, hook "আকাশে কি জ্যাম লেগেছে?!" | n/a yet | n/a (read_insights permission missing) | n/a yet | – | n/a yet | n/a yet | n/a yet |
| 2026-11-15 | চোখের সামনে মাছ, হাতে খালি পানি! 🐟 (Short 5) | FB Reel (awaiting owner approval; ID when posted) | physics: refraction / apparent depth (NCTB 9–10 ch.9) | 60.0 s | Visual first: Mama's hand plunges at a clearly visible fish at 0.3 s, splash, empty hand; line "আরে! চোখের সামনে মাছ, হাত দিলে খালি পানি!" by 4.8 s; Boltu's dive pose at ~9 s as a second hook | puppet engine; storyboard first; water close-up with hand + splash (visual rhyme at the payoff); Bithi's hand on Boltu's shoulder to stop the jump; ray board (fish→surface→eye, normal, image higher), depth board 4 ft vs ~3 ft; muddy chappal reveal with mud on Mama's nose; safety line; puzzle board with options ক/খ; no scientist | style B preview made outside Figma (Figma limit): Bithi amazed + big fish with dashed 'seen' fish above, hook "পানি কি চোখকে ঠকায়?!" | n/a yet | n/a yet | n/a yet | – (opening tuned to the 3–6 s drop seen in Shorts 1–3; not a controlled experiment) | n/a yet | n/a yet | n/a yet |
