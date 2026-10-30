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
| woman-fcommerce-phone.png | Young woman, teal kurti + orna, online clothing seller | Looking down at phone in both hands, smiling | Figma AI. F-commerce / order-taking posts. |
| salon-owner-thumbsup.png | Woman salon owner, black tunic, hair bun | Thumbs-up, phone in other hand | Figma AI. Salon / booking posts. |
| doctor-tablet.png | Male doctor, white coat, stethoscope | Holding a tablet at his side | Figma AI. Clinic / appointment posts. |
| shopkeeper-elder-phone.png | Older shopkeeper, grey beard, cream punjabi | Smiling at phone in both hands | Figma AI. Offline shop / "even my father can use it" angles. |
| receptionist-headset.png | Young woman receptionist, navy blazer, headset | Waving / welcoming hand | Figma AI. "AI receptionist" concept posts (the human job it does). |
| man-laptop.png | Young entrepreneur, glasses, green shirt | Holding open laptop | Figma AI. Setup / website / dashboard posts. |
| it-support-call.png | IT technician, blue polo | Phone to ear, pointing at viewer | Figma AI. ISP / IT troubleshooting, phone-call posts. |

Rotation: don't use the same person in two posts in a row; match the person to the post's industry.
