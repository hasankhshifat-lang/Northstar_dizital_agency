"""Assemble rendered frames + Bangla voiceover + Bangla captions/title into the final MP4.

python3 build_video.py out/frames_preview out/wari_bateshwar_preview.mp4
python3 build_video.py out/frames_final   out/wari_bateshwar_final.mp4

Captions are drawn with Pillow (raqm/HarfBuzz shaping) so Bangla conjuncts render correctly,
then overlaid with ffmpeg at the times the voiceover speaks each line (audio/take1.mp3).
"""
import os
import subprocess
import sys

from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
FPS = 24
AUDIO = os.path.join(HERE, "audio", "take1.mp3")
FONT_BOLD = "/usr/share/fonts/truetype/noto/NotoSerifBengali-Bold.ttf"
FONT_REG = "/usr/share/fonts/truetype/noto/NotoSansBengali-Regular.ttf"

# (start, end, text) — timings from silence detection on audio/take1.mp3
LINES = [
    (0.10, 6.75, "আড়াই হাজার বছর আগে, পুরোনো ব্রহ্মপুত্রের তীরে ছিল এক প্রাচীরঘেরা নগর… উয়ারী-বটেশ্বর।"),
    (7.90, 12.70, "এখানে মিত্রার মতো কারিগরেরা পাথর আর কাচ দিয়ে গড়ত ঝলমলে পুঁতি।"),
    (13.60, 17.10, "নদী বেয়ে আসত নৌকা, সঙ্গে দূর দেশের বণিকেরা।"),
    (17.95, 23.10, "দাম মিটত রুপার মুদ্রায়, আর বাংলার পুঁতি পৌঁছে যেত এশিয়ার নানা প্রান্তে।"),
    (24.00, 29.40, "অনেক ইতিহাসবিদের মতে, এটিই টলেমির লেখা সেই বাণিজ্যনগর… সৌনাগড়া।"),
]
TITLE = ("উয়ারী-বটেশ্বর", "খ্রিস্টপূর্ব আনুমানিক ৪৫০ অব্দ")
TITLE_TIME = (24.0, 30.0)
GOLD = (240, 196, 92, 255)


def wrap(draw, text, font, max_w):
    words, lines, cur = text.split(" "), [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if draw.textlength(trial, font=font) <= max_w or not cur:
            cur = trial
        else:
            lines.append(cur)
            cur = w
    lines.append(cur)
    return lines


def caption_png(text, W, H, path):
    s = W / 1080
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    font = ImageFont.truetype(FONT_BOLD, int(52 * s), layout_engine=ImageFont.Layout.RAQM)
    lines = wrap(d, text, font, int(900 * s))
    lh = int(78 * s)
    block_h = lh * len(lines) + int(40 * s)
    cy = int(1340 * H / 1920)                # centre of caption block; bottom ~400 px stays clear
    top = cy - block_h // 2
    d.rounded_rectangle([int(60 * s), top, W - int(60 * s), top + block_h], radius=int(26 * s), fill=(10, 8, 6, 170))
    y = top + int(20 * s)
    for ln in lines:
        w = d.textlength(ln, font=font)
        x = (W - w) / 2
        d.text((x + 2 * s, y + 3 * s), ln, font=font, fill=(0, 0, 0, 200))
        d.text((x, y), ln, font=font, fill=(255, 255, 255, 255))
        y += lh
    img.save(path)


def title_png(W, H, path):
    s = W / 1080
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    big = ImageFont.truetype(FONT_BOLD, int(118 * s), layout_engine=ImageFont.Layout.RAQM)
    small = ImageFont.truetype(FONT_REG, int(46 * s), layout_engine=ImageFont.Layout.RAQM)
    y = int(230 * H / 1920)
    for txt, font, col, gap in [(TITLE[0], big, GOLD, 170), (TITLE[1], small, (255, 255, 255, 255), 0)]:
        w = d.textlength(txt, font=font)
        x = (W - w) / 2
        d.text((x + 4 * s, y + 5 * s), txt, font=font, fill=(0, 0, 0, 170))
        d.text((x, y), txt, font=font, fill=col)
        y += int(gap * s)
    img.save(path)


def main(frames_dir, out_path):
    first = sorted(f for f in os.listdir(frames_dir) if f.endswith(".png"))[0]
    W, H = Image.open(os.path.join(frames_dir, first)).size
    tmp = os.path.join(os.path.dirname(os.path.abspath(out_path)), "overlays")
    os.makedirs(tmp, exist_ok=True)
    inputs, filters, last = [], [], "[0:v]"
    for i, (a, b, text) in enumerate(LINES):
        p = os.path.join(tmp, f"cap{i}.png")
        caption_png(text, W, H, p)
        inputs += ["-i", p]
    tp = os.path.join(tmp, "title.png")
    title_png(W, H, tp)
    inputs += ["-i", tp]
    timed = [(a, b) for a, b, _ in LINES] + [TITLE_TIME]
    for i, (a, b) in enumerate(timed):
        tag = f"[v{i}]"
        fade = f"[{i + 2}:v]format=rgba,fade=t=in:st={a}:d=0.25:alpha=1,fade=t=out:st={b - 0.25}:d=0.25:alpha=1[o{i}]"
        filters.append(fade)
        filters.append(f"{last}[o{i}]overlay=0:0:enable='between(t,{a},{b})'{tag}")
        last = tag
    cmd = ["ffmpeg", "-y", "-v", "error",
           "-framerate", str(FPS), "-i", os.path.join(frames_dir, "frame_%04d.png"),
           "-i", AUDIO, *[x for pair in zip(inputs[::2], inputs[1::2]) for x in ("-loop", "1", *pair)],
           "-filter_complex", ";".join(filters), "-map", last, "-map", "1:a",
           "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "medium",
           "-c:a", "aac", "-b:a", "192k", "-t", "30", "-movflags", "+faststart", out_path]
    subprocess.run(cmd, check=True)
    print("BUILT", out_path)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
