# Northstar Dizital AI — cinematic short

A 20-second, 1920×1080, 30fps brand teaser built in code with [Remotion](https://remotion.dev).
Final render: `../social/videos/northstar-cinematic-short.mp4`.

## Shot list

| Time | Scene | What happens |
|------|-------|--------------|
| 0–4s | Cold open | Letterbox closes in, a star ignites with an anamorphic flare, slow camera push through a 3D starfield. "Every brand has a direction." |
| 4–9s | Constellation | Scattered stars move into place and lines draw the four-point North Star from the logo. "Most never find it." |
| 8–13s | Warp | Hyperspace jump with streaks in the brand colours, camera shake, and the words DESIGN / CODE / AI timed to the beat. |
| 13–20s | Reveal | White flash cut, logo resolves from blur, light sweeps across it, then the gradient tagline lands. Fade to black. |

Applied on every shot: 2.39:1 letterbox, animated film grain, vignette, a contrast/saturation grade,
and an original synthesized score (drone, risers, sub booms, a hit on each word, resolving chord), made by `tools/score.py`.

## Commands

```bash
npm i
npx remotion studio                    # live preview + timeline editing
npx remotion render NorthstarShort out/northstar-cinematic-short.mp4 --crf=16
python3 tools/score.py public/score.wav  # regenerate the soundtrack
```

Each scene is also registered on its own (`ColdOpen`, `Constellation`, `Warp`, `Reveal`), so you can preview and render scenes one at a time.
Brand colours and the font live in `src/theme.ts`. Change the copy in `src/scenes/*.tsx`.
