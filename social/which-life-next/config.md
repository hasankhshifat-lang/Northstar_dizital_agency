# Which Life Next — daily posting config

The daily job reads this file. Change the slots here, not in the job prompt.

## Publish slots (Asia/Singapore)

| Slot | SGT | US Eastern (EST, from Nov 1) | Post |
|---|---|---|---|
| 1 | 01:00 | 12:00 previous day | Short 4 |
| 2 | 03:00 | 14:00 previous day | Short 5 |
| 3 | 06:00 | 17:00 previous day | Long video (12–16 min) |
| 4 | 08:00 | 19:00 previous day | Short 1 |
| 5 | 09:00 | 20:00 previous day | Short 2 |
| 6 | 11:00 | 22:00 previous day | Short 3 |
| 7 | 21:00 | 08:00 same day | Short 6 |

All slots are on the publish date (the day after the run). Short 6 at 21:00 SGT goes out the evening
of the publish date.

Slots last changed: 2026-10-31 — user chose 6 Shorts + 1 long a day to chase the 10M-Shorts-views
path. The 3 new Short slots spread across the US day (noon, 2 pm, 8 am Eastern) to test which hours
bring the most US views. Original 4 slots (2026-10-29) unchanged.

## Rules for changing slots

- Review timing every Monday run, once the channel has at least 14 days of posts.
- Change a slot only when US views by hour show a clear better hour (≥20% more US views
  in the first 24h than the current slot, over at least 7 posts).
- Keep the long video in the slot with the most US views. Keep shorts at least 1 hour apart.
- Record every change in `timing-log.md` with the data behind it.
