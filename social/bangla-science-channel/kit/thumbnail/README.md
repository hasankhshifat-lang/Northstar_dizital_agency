# Thumbnails (owner rule 2026-11-09: always made in Figma)

Every Short gets a 9:16 cover (1080×1920) that tells viewers at a glance what the video is about and hooks them. Facebook uses it as the Reel cover.

## Design
- **Hook question** at the top in big Bangla (Baloo Da 2 / Hind Siliguri, white + yellow with a thick dark outline). 2–5 words, about the actual mystery of the video, e.g. "ছুঁলেই গুটিয়ে যায় কেন?". It never just repeats the title, and never makes a misleading claim.
- A small "সাইন্টিফিক বিথী" badge above it.
- **The picture tells the story:** the key object large (before → after with "আগে" / "পরে" tags and a red arrow when there is a change), plus one character with a strong expression (shocked বল্টু, confused মামা, or the scientist on scientist days).
- The **bottom ~400 px stays clear** (Facebook puts the caption and buttons there). Everything stays inside the frame. No borders.

## How
1. Export the art layers from the kit as transparent PNGs: background, story object, character pose (see `../../episodes/short-03/thumbnail/` for the লজ্জাবতী layers).
2. In the Figma file "Scientific Bithi — Scientist Cameos" (https://www.figma.com/design/p7WBHQcFJpfyTNbWtS8Nsd), on the **Thumbnails** page:
   - create a 1080×1920 frame named `<short>-thumb`, upload the layers (`upload_assets`) and place them;
   - add the hook text and the badge as live text (`use_figma`);
   - export the PNG (`download_assets` / `get_screenshot`).
3. Look at it at phone size before using it.
4. Set it as the video cover: `POST /<video_id>/thumbnails` with `source=@thumb.png`, `is_preferred=true` and the page token.

If Figma refuses (for example "tool call limit" on the Collab seat), don't fall back silently. Tell the owner, include a preview made from `preview_template.html` with the same layers, and ask before using it.
