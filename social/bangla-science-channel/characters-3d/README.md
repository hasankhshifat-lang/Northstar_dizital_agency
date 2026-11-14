# Scientific Bithi: 3D rigged characters (Spline, 2026-11-14)

## v2 (owner rule 2026-11-14): copy the reference characters top to bottom
Reference: `reference_owner_2026-11-14.jpg`. The owner said: follow these characters exactly, don't assume anything.
- **Mama = the tall man:** very tall and slim (~120 units vs Bithi ~76), tousled dark-brown hair with tufts, long face, big ears, long pointed nose, thin brows, small smile; white shirt with collar and striped dark-red tie; open dark green-grey blazer with lapels; dark belt with buckle; olive-brown straight trousers; brown messenger bag on his right hip with strap; black sneakers with white soles. (Mustache, panjabi, gamchha and lungi removed.)
- **Bithi = the girl:** dark-blonde chin-length bob with side-swept fringe and outward flicks, big brown eyes, thin brows, freckles and blush, small nose, small pout; white collar and brown tie under a khaki V-neck sweater with dark V trim; brown satchel with a strap across the chest; dark olive plaid skirt; thin legs; grey ankle socks; black sneakers with white soles. (Glasses, braids, sash and navy skirt removed.)
- **Boltu:** not in the reference; unchanged (v1) until the owner decides.
- Both rebuilt with the same joint names. Built blind (the Spline Free plan's 20 daily calls ran out); NOT yet verified on screen, and Mama's jacket back/side panels have a reported flush top face at y ≈ 87 to offset. Check and fix after the limit resets (2026-11-15 00:00 UTC).

## v1

Owner asked for 3D rigged characters made in Spline, with three reference images for the look
(stylised animated-feature style: sculpted soft forms, big expressive eyes with catch-lights, slender limbs, warm light).

Spline file: "Scientific Bithi 3D characters" — https://app.spline.design/file/4b45ea91-171a-4210-9e63-424c49bcb721

| Character | Look (kept from the 2D designs) | Height (Spline units, 1 m ≈ 50) |
|---|---|---|
| মন্টু মামা | bald head with dark side hair, thick brows and mustache, yellow panjabi with buttons, red gamchha with white stripes over the left shoulder, green lungi with red bands, brown sandals | ~92 |
| বিথী | black hair with fringe and two braids (red ties), round brown glasses, white school shirt with red badge, blue diagonal sash, navy skirt, white socks, black shoes | ~78 |
| বল্টু | curly/spiky black hair, very big eyes, red-and-yellow striped tee, khaki shorts, sandals | ~66 |

## Rig (same joint names on all three; rotate the pivot Empties)
`<Name> Root` (feet) → `<Name> Spine` → `<Name> Neck Pivot` (whole head) → `<Name> Mouth Ctrl` (scale Y to open the mouth for lip-sync);
`<Name> Spine` → `<Name> ShoulderL/R` → `<Name> ElbowL/R` (forearm + hand); `<Name> Root` → `<Name> HipL/R` (leg + shoe).
Every part is a separate named object parented under its joint, so posing = rotating the joint (tested: Boltu waving,
Bithi pointing, Mama hands on hips, Mama mouth open). Materials are shared assets per character (`B Skin`, `M Kurta`, …).

## Status / next steps
- v1 built and checked from screenshots (`characters_v1.jpg`). Known v1 limits: bodies are simple rounded cylinders
  (no sculpted torso folds yet), hands are mitten spheres, faces have no eyelids yet (blinks), lungi/skirt are rigid.
- Spline account is on the Free plan: 20 MCP tool calls per day.
- To use them in the video pipeline: export each character as GLB from Spline's Export panel (my tools can't download
  3D files), then they can be imported into the Blender environments (`../kit/env3d/`) and animated there with the same joint names.
