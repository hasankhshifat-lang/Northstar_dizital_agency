# Characters v3: cartoon puppet style (test)

Redesign of মন্টু মামা, বিথী and বল্টু in a semi-realistic 2D cartoon style, after the two reference clips
(realistic proportions, warm brown outlines, one cel-shadow tone, big expressive eyes, mouths with teeth and tongue).
Same costumes and personalities as before. Not copied from the reference characters.

- **Figma:** page "Characters v3 — cartoon style" in https://www.figma.com/design/gtzo8iYxJ12edC39TR1FaX
  - 3 character components (rig layers: armL, armR, head; pivots at shoulders and neck)
  - "Face parts" board: Rest, A, E, O, Smile, Blink for each character (18 components)
- `gen3.py` draws the characters (SVG with rig groups) → `chars3.json`, `*_v3.svg`, `sheet3.png`.
- `puppet.html` is the puppet engine (written by the free LLM router, reviewed and fixed by Claude):
  lip-sync from voice loudness (rest/E/A/O), blinks every 2.6–4.2 s, eyebrow emphasis and worried/happy moods,
  talking-arm gestures, head nods, breathing, slow camera push-in per shot, background blur on close-ups, fades.
- `build_test.py` builds the 13.6 s test from Pilot 1 (Boltu's joke, Bithi explaining) → `v3_motion_test.mp4`.

Next, if approved: convert the full Pilot 1 to this style (more shots per scene, hand/object close-ups, painted
backgrounds), keeping the science boards and the Scientific Bithi banner/name plates.
