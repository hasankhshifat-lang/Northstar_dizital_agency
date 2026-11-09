# The Bead Makers of Wari-Bateshwar — 30 s 3D Short

- Format: 9:16 (1080×1920), 24 fps, 30 s, Blender 4.5 EEVEE, stylised toy-like characters
- Voiceover: Bangla, ElevenLabs `eleven_v4`, voice "Hamim - Deep, Mature, Calm Bengali" (`audio/take1.mp3`, 29.4 s)
- Captions: Bangla, Noto Serif Bengali Bold, drawn by `build_video.py`; bottom ~400 px kept clear for the Shorts UI
- Characters: **Mitra** (young bead maker, red saree, orange blouse) and **the Merchant** (white dhoti, blue shawl, saffron turban), plus two villagers

## Shots and narration

| # | Time | Shot | Narration (Bangla) | English |
|---|---|---|---|---|
| 1 | 0–7.3 s | Dawn; camera glides over the old Brahmaputra toward the walled town, huts and palms | আড়াই হাজার বছর আগে, পুরোনো ব্রহ্মপুত্রের তীরে ছিল এক প্রাচীরঘেরা নগর… উয়ারী-বটেশ্বর। | Two and a half thousand years ago, on the banks of the old Brahmaputra, stood a walled town: Wari-Bateshwar. |
| 2 | 7.3–13.1 s | Close on Mitra polishing a glowing carnelian bead at her bench | এখানে মিত্রার মতো কারিগরেরা পাথর আর কাচ দিয়ে গড়ত ঝলমলে পুঁতি। | Here, craftspeople like Mitra shaped stone and glass into bright beads. |
| 3 | 13.1–17.5 s | A sailing boat glides in and docks; the Merchant steps onto the jetty | নদী বেয়ে আসত নৌকা, সঙ্গে দূর দেশের বণিকেরা। | Boats came up the river, bringing traders from distant lands. |
| 4 | 17.5–23.5 s | Mitra meets him on the bank; silver coin for a string of beads; a small bow | দাম মিটত রুপার মুদ্রায়, আর বাংলার পুঁতি পৌঁছে যেত এশিয়ার নানা প্রান্তে। | They paid in silver coins, and Bengal's beads reached far corners of Asia. |
| 5 | 23.5–30 s | Camera cranes up over the town at sunset; title card | অনেক ইতিহাসবিদের মতে, এটিই টলেমির লেখা সেই বাণিজ্যনগর… সৌনাগড়া। | Many historians think this is the trading town Ptolemy wrote of: Sounagoura. |

Title card: **উয়ারী-বটেশ্বর** · খ্রিস্টপূর্ব আনুমানিক ৪৫০ অব্দ (Wari-Bateshwar · c. 450 BCE)

## Historical notes

- Wari-Bateshwar (Belabo, Narsingdi) is a fortified settlement on the old course of the Brahmaputra, with a mud
  rampart and moat. Radiocarbon dates put occupation at around 450 BCE.
- Finds include semi-precious stone beads (carnelian, agate, quartz), glass beads, rouletted ware and silver
  punch-marked coins, pointing to long-distance trade.
- The link to Ptolemy's "Sounagoura" is a proposal by some historians, not settled fact. The narration says so.
- The characters and the huts' look are artistic reconstruction.

## Re-render

```bash
blender -b -P scene.py -- --out out/frames_preview/ --preview      # half-res draft (~4 s/frame)
blender -b -P scene.py -- --out out/frames_final/ --samples 24     # full 1080×1920
python3 build_video.py out/frames_final out/wari_bateshwar_final.mp4
```
