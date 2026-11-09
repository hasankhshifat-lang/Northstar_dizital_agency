# Thumbnails (owner rule 2026-11-09: always made in Figma)

Every Short gets a 9:16 cover (1080×1920) that tells viewers at a glance what the video is about and hooks them. Facebook uses it as the Reel cover.

## Design: style B is the default (owner chose it on 2026-11-09)
See `../../episodes/short-03/thumbnail/option_B.png` (the লজ্জাবতী cover):
- A short, punchy hook question on top in big Bangla, e.g. "গাছও কি লজ্জা পায়?!" (one key word in white, the rest yellow).
- **One big story object** filling the middle-right, showing the surprising moment (e.g. the folded লজ্জাবতী), with a small red tag that says what happened ("ছুঁতেই গুটিয়ে গেল!").
- **বিথী on the left, amazed** (both arms up, mouth open). On scientist days the scientist stands beside her.
- **Everyone stands on the ground** (feet on the same ground line, about y 1480). Never floating in the air.

General rules:
- **Hook question** at the top in big Bangla (Baloo Da 2 / Hind Siliguri, white + yellow with a thick dark outline). 2–5 words, about the actual mystery of the video, e.g. "ছুঁলেই গুটিয়ে যায় কেন?". It never just repeats the title, and never makes a misleading claim.
- A small "সাইন্টিফিক বিথী" badge above it.
- **The picture tells the story:** the key object large (before → after with "আগে" / "পরে" tags and a red arrow when there is a change).
- **Characters (owner rule 2026-11-09): বিথী is on EVERY thumbnail**, with an expressive pose (surprised, pointing at the object, curious). On days when a scientist appears in the video, put the scientist on the thumbnail too, next to বিথী. No other characters are needed.
- The **bottom ~400 px stays clear** (Facebook puts the caption and buttons there). Everything stays inside the frame. No borders.

## How
1. Export the art layers from the kit as transparent PNGs: background, story object, বিথী pose (and the scientist on scientist days; see `../../episodes/short-03/thumbnail/` for the লজ্জাবতী layers).
2. In the Figma file "Scientific Bithi — Scientist Cameos" (https://www.figma.com/design/p7WBHQcFJpfyTNbWtS8Nsd), on the **Thumbnails** page:
   - create a 1080×1920 frame named `<short>-thumb`, upload the layers (`upload_assets`) and place them;
   - add the hook text and the badge as live text (`use_figma`);
   - export the PNG (`download_assets` / `get_screenshot`).
3. Look at it at phone size before using it.
4. Set it as the video cover: `POST /<video_id>/thumbnails` with `source=@thumb.png`, `is_preferred=true` and the page token.

If Figma refuses (for example "tool call limit" on the Collab seat), don't fall back silently. Tell the owner, include a preview made from `preview_template.html` with the same layers, and ask before using it.
