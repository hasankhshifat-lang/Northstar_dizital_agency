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
- `build_test.py` builds the 13.6 s test from Pilot 1 (Boltu's joke, Bithi explaining) → `v3_motion_test3.mp4`.

Next, if approved: convert the full Pilot 1 to this style (more shots per scene, hand/object close-ups, painted
backgrounds), keeping the science boards and the Scientific Bithi banner/name plates.

## Test 2 changes
- **Elbows:** each arm is an upper arm (`armL`/`armR`, shoulder pivot) with a nested forearm (`foreL`/`foreR`, elbow pivot) and a joint cap.
  Talking poses bend at the elbow (Mama's hand in front of the belly, Boltu's arm thrown up, Bithi's hand raised to explain).
- **Turning:** the face (`face`), front hair (`hairF`) and ears (`earL`/`earR`) are separate layers. The head turns toward whoever is speaking,
  with smooth transitions (the face slides across and the far ear hides). Characters can be mirrored to face the other way.
- **Painted background:** `ghat_painted.py` uses the same ghat layout with soft gradient light, a hazy and blurred distance,
  water reflections, soft outlines, a shaded deck, warm light, vignette and paper grain (see `background_flat_vs_painted.jpg`).
- The free LLM router wrote the engine changes; Claude drew the art, reviewed the code and fixed Bithi's gesture angle.
- The Figma components still have the older layer structure (no separate forearm/face layers); they look the same.

## Test 3 changes (hands and feet)
- **Hands:** two poses per hand, both with four separate fingers and a thumb:
  relaxed (back of hand, curled fingers, knuckle shading) and open (palm out, spread fingers, palm lines).
  The engine opens the hand on the talking arm during a gesture and relaxes it otherwise. The hand now overlaps the
  forearm, so there's no seam at the wrist. See `hands_feet.png`.
- **Feet:** Bithi wears school shoes (toe box turned slightly out, strap with buckle, sole, shine) with folded socks.
  Mama and Boltu have bare feet in chappals: five toes with toenails, a thong strap and a visible sole edge.
