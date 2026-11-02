# History pop-up template

The approved style (2026-11-02) for showing a historical figure or place in a corner pop-up
when the voice-over names it. See the rules in `CLAUDE.md`.

## Look

- **Card:** white card with a 6 px frame, rounded corners (22 px), soft drop shadow.
- **Image:** the real photo or painting. People get a tall portrait crop; places get a wide crop.
- **Name strip:** under the image. The name is in bold dark brown (`#1b130c`), with a smaller
  grey-brown line under it (`#6b5a48`): years for people ("1801–1877"), and region and role for
  places ("Nebraska · Oregon Trail landmark").
- **Animation:** pops in with a springy scale-up from 50% (250 ms), holds, then shrinks and
  fades out (200 ms).
- **Shorts (9:16):** top-left, 30% of the width, 220 px from the top and 60 px from the left.
- **Long videos (16:9):** top-right, 22% of the width.
- **Captions (optional):** bold white with a black shadow in the lower middle. The spoken name
  is highlighted in yellow (`#ffd23f`) with `<span class="hl">…</span>`.

## Use

1. Copy `config.example.json` into `social/video-assets/<video-slug>/config.json`.
2. Set `background` (the edited footage), `audio` (the voice-over, or leave it as `null` for
   silent), `duration`, the captions and one entry in `pops` per mention. Paths are relative to
   the config file. Set `kind` to `"person"` or `"place"`. Use `focus` to aim the crop, for
   example `"50% 20%"` keeps a face in view.
3. Set each pop-up's `start` to the timestamp of the name's first word, and its `end` 3 to 5
   seconds later, or at the next pop-up's `start` if that comes sooner.
4. Render:
   ```bash
   node social/video-templates/history-popup/render.js social/video-assets/<slug>/config.json
   # add --guide to draw a mock of the YouTube Shorts buttons, to check placement
   ```
