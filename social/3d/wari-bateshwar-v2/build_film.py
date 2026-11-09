"""Join the rendered shots into the finished 16:9 film with voiceover, title and Bangla captions.

python3 build_film.py out/prev out/wari_bateshwar_v2_preview.mp4
python3 build_film.py out/final out/wari_bateshwar_v2.mp4 --no-captions
"""
import os
import subprocess
import sys

from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
V1 = os.path.join(HERE, "..", "wari-bateshwar")
sys.path.insert(0, V1)
from build_video import LINES  # noqa: E402  (narration lines + timings from v1)

FPS = 24
W, H = 1280, 720
SHOTS = ["S1", "S2a", "S2b", "S3a", "S3b", "S4a", "S4b", "S5"]
AUDIO = os.path.join(V1, "audio", "take1.mp3")
TITLE_FONT = os.path.join(HERE, "fonts", "Galada-Regular.ttf")
CAP_FONT = "/usr/share/fonts/truetype/noto/NotoSansBengali-Bold.ttf"
TITLE = "উয়ারী-বটেশ্বর, খ্রিস্টপূর্ব ৪৫০"
END_TITLE = ("উয়ারী-বটেশ্বর", "বাংলার আড়াই হাজার বছরের পুরোনো বাণিজ্যনগর")


def title_png(path, text, size, y, sub=None):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    font = ImageFont.truetype(TITLE_FONT, size, layout_engine=ImageFont.Layout.RAQM)
    d = ImageDraw.Draw(img)
    tw = d.textlength(text, font=font)
    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).text(((W - tw) / 2 + 3, y + 4), text, font=font, fill=(40, 20, 5, 200))
    img = Image.alpha_composite(img, shadow.filter(ImageFilter.GaussianBlur(5)))
    d = ImageDraw.Draw(img)
    d.text(((W - tw) / 2, y), text, font=font, fill=(255, 248, 236, 245))
    if sub:
        f2 = ImageFont.truetype(CAP_FONT, int(size * 0.32), layout_engine=ImageFont.Layout.RAQM)
        sw = d.textlength(sub, font=f2)
        d.text(((W - sw) / 2 + 2, y + size * 1.15 + 2), sub, font=f2, fill=(30, 15, 5, 180))
        d.text(((W - sw) / 2, y + size * 1.15), sub, font=f2, fill=(246, 214, 150, 255))
    img.save(path)


def caption_png(path, text):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    font = ImageFont.truetype(CAP_FONT, 30, layout_engine=ImageFont.Layout.RAQM)
    words, lines, cur = text.split(" "), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if d.textlength(t, font=font) <= 1000 or not cur:
            cur = t
        else:
            lines.append(cur)
            cur = w
    lines.append(cur)
    y = H - 40 - 46 * len(lines)
    for ln in lines:
        tw = d.textlength(ln, font=font)
        for dx, dy in ((2, 2), (-1, 1), (1, -1), (0, 3)):
            d.text(((W - tw) / 2 + dx, y + dy), ln, font=font, fill=(0, 0, 0, 190))
        d.text(((W - tw) / 2, y), ln, font=font, fill=(255, 255, 255, 255))
        y += 46
    img.save(path)


def main(src, out, captions=True):
    tmp = os.path.join(os.path.dirname(os.path.abspath(out)), "film_tmp")
    os.makedirs(tmp, exist_ok=True)
    # 1. one image sequence in shot order
    lst = os.path.join(tmp, "frames.txt")
    with open(lst, "w") as fh:
        for s in SHOTS:
            for f in sorted(os.listdir(os.path.join(src, s))):
                if f.endswith(".png"):
                    fh.write(f"file '{os.path.abspath(os.path.join(src, s, f))}'\nduration {1 / FPS:.6f}\n")
    # 2. overlays
    overlays = []
    p = os.path.join(tmp, "title.png")
    title_png(p, TITLE, 78, 46)
    overlays.append((p, 0.6, 6.8))
    p = os.path.join(tmp, "end.png")
    title_png(p, END_TITLE[0], 96, 70, END_TITLE[1])
    overlays.append((p, 25.0, 30.0))
    if captions:
        for i, (a, b, text) in enumerate(LINES):
            p = os.path.join(tmp, f"cap{i}.png")
            caption_png(p, text)
            overlays.append((p, a, b))
    inputs, filt = [], []
    # painterly grade: upscale, gentle edge-preserving smoothing, warm curves, saturation, vignette, grain
    filt.append(f"[0:v]scale={W}:{H}:flags=lanczos,smartblur=lr=1.2:ls=-0.25,"
                "curves=r='0/0 0.5/0.55 1/1':g='0/0 0.5/0.5 1/0.97':b='0/0.02 0.5/0.45 1/0.9',"
                "eq=saturation=1.12:contrast=1.04,unsharp=5:5:0.6,vignette=PI/5,noise=alls=4:allf=t,"
                "format=yuv420p[g]")
    last = "[g]"
    for i, (path, a, b) in enumerate(overlays):
        inputs += ["-loop", "1", "-i", path]
        idx = i + 2
        filt.append(f"[{idx}:v]format=rgba,fade=t=in:st={a}:d=0.5:alpha=1,fade=t=out:st={b - 0.5}:d=0.5:alpha=1[o{i}]")
        filt.append(f"{last}[o{i}]overlay=0:0:enable='between(t,{a},{b})'[v{i}]")
        last = f"[v{i}]"
    cmd = ["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lst, "-i", AUDIO, *inputs,
           "-filter_complex", ";".join(filt), "-map", last, "-map", "1:a", "-r", str(FPS),
           "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p",
           "-c:a", "aac", "-b:a", "192k", "-t", "30", "-movflags", "+faststart", out]
    subprocess.run(cmd, check=True)
    print("BUILT", out)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], captions="--no-captions" not in sys.argv)
