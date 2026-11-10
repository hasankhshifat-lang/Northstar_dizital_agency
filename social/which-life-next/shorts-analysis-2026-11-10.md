# Why our Shorts stop at ~1.5K views (analysis 2026-11-10)

**Sources:** vidIQ (channel Shorts list, per-video analytics 2026-09-01 → 11-10, traffic sources,
small-channel history outliers). vidIQ ran out of credits partway through, so the retention curves come from the
YouTube Analytics API (youtube-channel-automation skill, `audienceWatchRatio` by `elapsedVideoTimeRatio`).

## The numbers

| Short | Length | Views | Engaged ÷ views (stayed past the first second) | Avg % watched | Likes | Shares | Subs |
|---|---|---|---|---|---|---|---|
| Mail 1,900 miles on horseback (`ctoVTthJ_2w`) | 1:59 | 1,696 | 63% | 70% | 44 | 0 | 1 |
| Mailed himself to freedom (`ahJknPq0Z_g`) | 1:31 | 1,512 | 71% | 63% | 34 | 0 | 0 |
| Tied 12 kids together (`J5rJThy08hk`) | 0:51 | 1,318 | 61% | 66% | 25 | 0 | 1 |
| 50°F to -27°F (`HyqmpcvzHKI`) | 0:50 | 1,283 | 58% | **85%** | 28 | 0 | 3 |
| Oregon Trail killer (`7kxCubu2UdI`) | 0:40 | 1,249 | **45%** | 65% | 22 | 1 | 2 |
| Found 12 feet from his door (`qbtwhG8IDL8`) | 0:54 | 1,205 | **44%** | 74% | 20 | 0 | 4 |
| Lincoln manhunt (`A7IMwfCRwjg`) | 1:53 | 1,080 | 61% | 56% | 21 | 0 | 1 |
| Donner shortcut (`bwhHw3tLIDQ`) | 1:54 | 1,037 | 75% | 62% | 9 | 0 | 0 |
| Trillions vanished (`pXOy92KjJt4`) | 0:31 | 627 | 42% | **104%** (replays) | 11 | 0 | 1 |
| Titanic baker (`ctx0tm_C56c`, first Short on the new 45–60 s recipe) | 0:56 | 1,233 in ~17 h | (data 2–3 days behind) | | 20 | | |

- **Traffic:** 12,404 of ~12,800 views (97%) come from the Shorts feed. YouTube search: 212 (1.7%). Channel page and subscribers: 24.
- **Shares: 1 in total across ~12K Shorts views. Comments: 4. Subscribers: 13.**

## Retention curves (share of starting viewers still watching)

| Short | 10% | 20% | 50% | 90% | 100% |
|---|---|---|---|---|---|
| Mail on horseback | 1.01 | **0.79** | 0.67 | 0.56 | 0.34 |
| 50°F to -27°F | 1.27 | **1.00** | 0.80 | 0.68 | 0.46 |
| Donner shortcut | 0.89 | **0.68** | 0.61 | 0.50 | **0.20** |
| Mailed himself | 0.91 | **0.72** | 0.59 | 0.52 | **0.16** |

## What is holding us back (in order of impact)

1. **Nobody shares or comments.** YouTube tests a Short with ~1–1.5K viewers and widens it when those
   viewers react. Retention is decent (56–85%), but with ~0 shares and ~0 comments the test ends there. This is the
   main reason every Short stops at the same number.
2. **35–55% swipe away in the first second.** The opening frame doesn't stop the scroll. The worst ones (44–45%)
   open on a scene with no hook text; the "POV:" framing doesn't help either.
3. **A drop of about 20 points between 10% and 20% of the video**, on every curve. That is the second beat, where the
   script switches from the hook to background ("In 1860, the Pony Express…"). People who stayed for the hook
   leave when the story stops moving.
4. **The ending loses people.** Only 16–46% are left at the last frame, so there are almost no replays. Replays are what
   pushed the 31 s Short to 104% watched. Endings run past the payoff, or the payoff comes too early.
5. **Titles aren't searchable** ("POV: …", years, `#shorts` only), so search adds almost nothing after the feed test ends.
6. **Posting gaps.** Nothing went up 11-05 → 11-09 (the daily task hit usage limits). Each gap resets the momentum.

## What the small history channels that break out do (vidIQ outliers, last 90 days, under 100K subs)

- **"X. Then Y." contrast titles:** *He Was Only Allowed to Serve Food. Then He Shot Down Japanese Planes* (58-sub channel, 11.6K views).
- **List and compilation hooks** that invite "I didn't know that": *Crazy Historical Coincidences…* (8.6K subs, 39K, 8×),
  *Famous Things With a Detail Nobody Told You About* (3K subs, 60K), *Rare Photos Nobody Ever Showed You* (3K subs, 70K).
- **One emotional hero story**: *Sergeant Stubby: America's Real War Hero* (23K subs, 4.9M, 50×).
- **Questions people want to argue about in the comments** (*What's that school rule you hated the most*, 121K).

## Changes made (now in `plan-60-days.md`, the daily recipe)

1. **Comment and share trigger in every Short:** the last line asks a real choice question that fits the channel
   name ("Which life would you pick?", "Would you have taken the shortcut?"), plus a pinned comment asking the same question.
   The aim is comments and shares, not likes.
2. **First frame = hook text and the subject in motion**, no POV label, no date card. A target to stay under 35% swipe-away.
3. **No background beat.** Background is one on-screen line that runs over the action. Every 2–4 s something new happens.
4. **Loop ending:** the payoff comes in the last 2 s, there is nothing after it, and the last words lead back into the first frame.
5. **Searchable titles:** name the person, event or place ("Titanic", "Pony Express", "Donner Party"), and use "X. Then Y." contrast titles.
6. **Add a list/compilation format** ("3 Titanic survivors who shouldn't have lived") once a week as a test.
7. **Daily check** adds shares, comments and the 10–20% drop next to views and swipe-away.

## Needs the owner

- **Length:** the data favours shorter Shorts (31 s → 104% watched, 50 s → 85%; 1:50+ → 56–62%). The current owner
  rule is 45–60 s. Recommendation: test **25–35 s** on 2 of every 7 Shorts for two weeks.
- **vidIQ credits** are used up until 2026-11-30 (150/month). A bigger plan is needed for daily keyword and title scoring.
- **Pinned comments on the existing Shorts** (one question each) are a cheap way to start comments. They need the owner's OK, because they post publicly.
