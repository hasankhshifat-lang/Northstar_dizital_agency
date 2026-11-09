#!/usr/bin/env python3
"""Prompts for the hero illustration of each Shorts thumbnail (STYLE + ART[VIDEO_ID]).

The 2026-11-09 images were generated with Figma's image AI (Figma MCP `generate_image`, gpt-image-2.5-flare,
1152x2048 requested) from these prompts and saved to social/thumbnails/art/<VIDEO_ID>.png.
Running this file tries OpenRouter instead (needs OpenRouter credits):
    python3 social/thumbnails/gen_art.py VIDEO_ID   -> social/thumbnails/art/<VIDEO_ID>.png
"""
import base64, json, os, sys, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
MODEL = os.environ.get("ART_MODEL", "google/gemini-3-pro-image-preview")
STYLE = ("Vertical 9:16 portrait illustration for a YouTube Shorts thumbnail. Rich painted history-illustration "
         "style, dramatic cinematic lighting, warm parchment and amber tones with deep teal water and sky, "
         "rust-red accents, crisp clear silhouette of the main subject, high contrast, readable at small size. "
         "The top 30% of the frame is calm and uncluttered (sky or dark background) so a headline can sit there; "
         "the main subject fills the middle; the bottom 20% is dark and simple. Absolutely no text, letters, "
         "numbers, logos, watermarks or captions anywhere in the image. No close-up faces; people only as small "
         "or back-facing figures. Historically accurate clothing, vehicles and objects. ")
ART = {
    "ctx0tm_C56c": "Night, April 1912, North Atlantic. The RMS Titanic's stern rises almost vertically out of a "
                   "flat, black, icy sea, lights still glowing in its portholes, its four funnels gone under, "
                   "three huge bronze propellers lifted high in the air. One tiny lone figure in a white baker's "
                   "jacket clings to the railing at the very top of the stern. Small iceberg in the distance, stars, "
                   "cold mist on the water.",
    "vy-qRhRjnN0": "1944, a misty farm field in France at dawn. Four American WWII soldiers, seen from behind and "
                   "from the side, effortlessly lift a full-size inflatable rubber M4 Sherman tank above their heads "
                   "with their arms; the tank is clearly an olive-drab inflated decoy with soft rounded seams and "
                   "slight wrinkles. In the background a row of more rubber tanks, half inflated, and a canvas air "
                   "hose on the grass. Sense of humour and surprise.",
    "ahJknPq0Z_g": "1849, a wooden steamboat freight dock at dusk. A plain, small nailed wooden shipping crate, "
                   "about three feet long, sits upside down among barrels and sacks, rough rope around it. "
                   "A cutaway view of the crate shows a man inside folded tightly with knees to chest, shown only "
                   "as a dark silhouette with no visible face, a small water bladder beside him. Lantern light, "
                   "paddle-wheel steamboat behind, tension and claustrophobia.",
    "5cj7cAPSqw0": "January 1925, Alaska, howling blizzard at night. A team of sled dogs led by a strong black "
                   "husky charges straight toward the viewer through driving snow across sea ice, pulling a wooden "
                   "dog sled; the musher in a fur parka is a small hooded figure behind, face hidden. A small "
                   "wrapped package is lashed to the sled and glows warmly in a lantern's light. Ice crystals, wind, "
                   "frozen breath, heroic urgency.",
}


def main(vid):
    body = {"model": MODEL, "modalities": ["image", "text"],
            "messages": [{"role": "user", "content": STYLE + ART[vid]}],
            "image_config": {"aspect_ratio": "9:16"}}
    req = urllib.request.Request("https://openrouter.ai/api/v1/chat/completions", data=json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json", "Authorization": "Bearer x"})
    r = json.load(urllib.request.urlopen(req, timeout=600))
    msg = r["choices"][0]["message"]
    url = msg["images"][0]["image_url"]["url"]
    out = os.path.join(HERE, "art", f"{vid}.png")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, "wb").write(base64.b64decode(url.split(",", 1)[1]))
    print(out)


if __name__ == "__main__":
    for v in sys.argv[1:]:
        main(v)
