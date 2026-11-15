# The Overthinking Pad: channel art

Psychology channel (new, 2026-11-15). Marker on Paper style, drawn with the same pen engine as the channel's Shorts
(`pen.js`, from the Lemo-Opuscar Marker on Paper style): warm white paper, black marker, one red accent.

| File | Size | Use |
|---|---|---|
| `banner_2560x1440.jpg` | 2560×1440, 309 KB | YouTube banner. Name, figure and tagline sit inside the 1546×423 safe area, so they show on phones, desktop and TV; faint blue doodles fill the TV-only margins |
| `profile_800x800.png` | 800×800, 261 KB | Profile picture: an eye looking up at a red "?"; everything sits inside the circle crop |

- Name: **The Overthinking Pad** · tagline: "Your brain, one sheet at a time." · suggested handle `@overthinkingpad`.
- Fonts: Kalam (OFL, `fonts/OFL-Kalam.txt`). No AI imagery.
- Re-render (from the Lemo-Opuscar library folder):
  `node core/render/still.mjs <this folder> 0 --size 2560x1440 --q 'kind=banner&w=2560&h=1440'` and
  `node core/render/still.mjs <this folder> 0 --size 800x800 --q 'kind=profile&w=800&h=800'`.
- Upload them in YouTube Studio → Customization → Branding (the API key setup here can't change channel art).
