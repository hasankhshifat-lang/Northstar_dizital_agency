# Upload package — Spotlight Effect (Marker on Paper) · psychology channel

Status: **draft, waiting for approval and for the channel to be connected.** Nothing has been uploaded.

| Field | Draft |
|---|---|
| File | `videos/spotlight-effect/marker/spotlight-marker.mp4` (1080×1920, 11.2 s, −14 LUFS) |
| Channel | new psychology channel, `yt.py --channel psychology` (token `YT_REFRESH_TOKEN_PSYCHOLOGY`, not connected yet) |
| Title | **Why You Think Everyone Noticed #shorts** |
| Thumbnail | `social/thumbnails/spotlight-marker_9x16.jpg` (ready), made in Spline, heading "ALL EYES ON ME?" (no word shared with the title); score 83/100 |
| Privacy / time | scheduled; proposed **Mon 2026-11-16, 6:00 PM US Eastern** (to be confirmed) |
| Category | 27 Education |
| Made for kids | no |
| Synthetic media | declare **yes** (AI narration) |

Title options considered: "Why You Think Everyone Noticed" (chosen: speaks to the viewer's own feeling) ·
"Nobody Was Looking (Science Says So)" · "The Spotlight Effect in 11 Seconds".

## Description

```
You walk into a room in an embarrassing T-shirt. How many people actually notice?

In a Cornell study, students wearing an embarrassing shirt guessed that about half the room had noticed it. The real number was about one in four. Psychologists call this the spotlight effect: we think others notice us far more than they do.

Source: Gilovich, T., Medvec, V. H., & Savitsky, K. (2000). The spotlight effect in social judgment. Journal of Personality and Social Psychology, 78(2), 211–222.

Narration voiced with AI.

#psychology #spotlighteffect #shorts
```

## Tags

spotlight effect, psychology, psychology facts, cognitive bias, social anxiety, overthinking, self conscious,
embarrassment, social psychology, shorts

## Upload command (after approval and once the token is saved)

```
python3 .claude/skills/youtube-channel-automation/yt.py --channel psychology upload \
  videos/spotlight-effect/marker/spotlight-marker.mp4 \
  --title "Why You Think Everyone Noticed #shorts" --description "<description above>" \
  --tags "spotlight effect,psychology,psychology facts,cognitive bias,social anxiety,overthinking,self conscious,embarrassment,social psychology,shorts" \
  --category 27 --privacy private --publish-at 2026-11-16T23:00:00Z
python3 .claude/skills/youtube-channel-automation/yt.py --channel psychology thumbnail VIDEO_ID social/thumbnails/spotlight-marker_9x16.jpg
```

Then log the result in `social/youtube-schedule-log.md` and add a row to the channel's learning database.
