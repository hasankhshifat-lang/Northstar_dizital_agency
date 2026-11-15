# Foot All FC: channel banner and profile picture

| File | Size | Use |
|---|---|---|
| `banner.png` | 2560 × 1440 | YouTube channel banner. Name card and puppets sit inside the centre 1546 × 423 strip every device shows |
| `profile.png` | 800 × 800 | YouTube profile picture (shown as a circle; still reads at 98 px) |

How they're made (2026-11-15):
- Art: the film's paper-puppet engine (`videos/barca-remontada-short/index.html?brand=banner|profile`, rendered with
  lemo-opuscar `still.mjs`). Puppets wear the channel's own red-and-cream kit (`tools/recolor.py`), so the brand isn't
  tied to any real club. No crests, sponsors or real likenesses. Puppet art: generated with the ChatGPT image model in Figma.
- Text: live type composed in Remotion (`remotion/src/Root.tsx`): Lilita One + IM FELL English SC (SIL OFL).
- Figma wasn't used for the layout: the account hit its MCP tool-call limit for the Collab seat (2026-11-15).

Rebuild: render the art stills, copy them to `remotion/public/`, then in `remotion/`:
`npx remotion still src/index.ts Banner ../banner.png --browser-executable=/opt/pw-browsers/chromium` (and `Profile ../profile.png`).
