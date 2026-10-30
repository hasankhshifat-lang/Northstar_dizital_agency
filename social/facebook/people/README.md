# People cut-outs for ad posts

Transparent PNG cut-outs of real people (owner's own photos, or Figma AI generated models)
used by the `ad` photo theme (`design.person = "social/facebook/people/<file>.png"`).

How to add one:
1. Owner's photo → save the original here as `<name>-src.jpg`, or generate with Figma
   `generate_image` into the FigJam board `K3BjX6h1ajBWJV2Gq9dExd` (owner has a Collab seat,
   which edits FigJam, not Design files), model `gemini-3.1-flash-image`, 1024x1280. Prompt:
   photorealistic Bangladeshi person, waist-up, holding a phone/laptop, plain flat white studio
   background, no text/logos. figma.com downloads are blocked here, so fetch the full image with
   `get_screenshot` (nodeId from generate_image, `contentsOnly: true`, `maxDimension: 1152`,
   `enableBase64Response: true`) and copy the PNG the tool result saves locally.
2. Cut out (venv outside the repo): `python3 -m venv /tmp/rv && /tmp/rv/bin/pip install rembg onnxruntime pillow`, then
   `remove(Image.open(src).convert('RGB'))`, crop to `getbbox()`, save `<name>.png`.
3. Check the edges, commit the PNG, and list it below.

| File | Who | Pose | Notes |
|---|---|---|---|
| man-blue-shirt-phone.png | Young male business owner, light-blue shirt, smiling | Waist-up, phone held up on his left (viewer's right) | Figma AI, 2026-10-30. Put him on the right; cards on the left. |
