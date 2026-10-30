# People cut-outs for ad posts

Transparent PNG cut-outs of real people (owner's own photos, or Figma AI generated models)
used by the `ad` photo theme (`design.person = "social/facebook/people/<file>.png"`).

How to add one:
1. Owner's photo → save the original here as `<name>-src.jpg`, or generate with Figma
   `generate_image` (file Y53p31hlKataaWZzOhkMOu; prompt: photorealistic Bangladeshi person,
   waist-up, holding a phone/laptop, plain flat white studio background, no text).
2. Cut out: `pip install rembg onnxruntime` then
   `python3 -c "from rembg import remove; open('X.png','wb').write(remove(open('X-src.jpg','rb').read()))"`
3. Check the edges, commit the PNG, and list it below.

| File | Who | Pose | Notes |
|---|---|---|---|
