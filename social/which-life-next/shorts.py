"""Thumbnail + 3 vertical Shorts cut from the clean long video."""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build import OUT, IMG, W, run, dur, captions, SANS, SERIF
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

tm = json.load(open(f"{OUT}/timing.json"))

SHORTS = [
    ("short-1", "07", ["50°F TO −27°F", "IN ONE AFTERNOON"]),
    ("short-2", "08", ["SHE TIED 12 KIDS", "TOGETHER WITH TWINE"]),
    ("short-3", "09", ["HE DIED 12 FEET", "FROM HIS OWN DOOR"]),
]


def outlined(dr, xy, text, font, fill, stroke=8):
    dr.text(xy, text, font=font, fill=fill, stroke_width=stroke, stroke_fill=(10, 10, 10))


def thumbnail():
    st, _ = tm["starts"]["09"]
    run(f"ffmpeg -y -v error -ss {st + 3} -i {OUT}/clean.mp4 -frames:v 1 {OUT}/thumb_src.png")
    im = Image.open(f"{OUT}/thumb_src.png").convert("RGB").resize((1280, 720))
    im = ImageEnhance.Contrast(im).enhance(1.25)
    dr = ImageDraw.Draw(im)
    f1 = ImageFont.truetype(SANS, 118); f2 = ImageFont.truetype(SANS, 64)
    outlined(dr, (48, 40), "12 FEET", f1, (255, 214, 64), 9)
    outlined(dr, (54, 172), "FROM HOME", f2, (255, 255, 255), 7)
    outlined(dr, (54, 600), "1888", f2, (255, 255, 255), 7)
    im.save(f"{OUT}/thumbnail.jpg", quality=92)


def endcard():
    im = Image.new("RGB", (1080, 1920), (18, 16, 14))
    bg = Image.open(f"{IMG}/s01c.png").convert("RGB").resize((3430, 1920)).crop((1175, 0, 2255, 1920))
    im.paste(ImageEnhance.Brightness(bg.filter(ImageFilter.GaussianBlur(10))).enhance(0.35))
    dr = ImageDraw.Draw(im)
    f = ImageFont.truetype(SERIF, 92); f2 = ImageFont.truetype(SANS, 52)
    for i, ln in enumerate(["FULL STORY", "ON THE CHANNEL"]):
        w = dr.textlength(ln, font=f); dr.text(((1080 - w) / 2, 800 + i * 120), ln, font=f, fill=(245, 236, 214))
    s = "Which Life Next"; w = dr.textlength(s, font=f2)
    dr.text(((1080 - w) / 2, 1080), s, font=f2, fill=(214, 170, 96))
    im.save(f"{OUT}/short_end.png")


def hook_png(name, lines):
    im = Image.new("RGBA", (1080, 1920), (0, 0, 0, 0))
    dr = ImageDraw.Draw(im)
    f = ImageFont.truetype(SANS, 78)
    for i, ln in enumerate(lines):
        w = dr.textlength(ln, font=f)
        outlined(dr, ((1080 - w) / 2, 120 + i * 100), ln, f, (255, 214, 64) if i == 0 else (255, 255, 255), 7)
    im.save(f"{OUT}/{name}_hook.png")


def short(name, seg, hook):
    st, d = tm["starts"][seg]
    a, D = max(st - 0.15, 0), d + 0.5
    hook_png(name, hook)
    captions(vertical=True, only=[seg], offset=a, name=f"{name}_cap")
    fc = (f"[0:v]split[x][y];"
          f"[x]scale=-2:1920,crop=1080:1920,gblur=sigma=30,eq=brightness=-0.15[bg];"
          f"[y]scale=-2:1400,crop=1080:1400[fg];"
          f"[bg][fg]overlay=0:300[c];[c][1:v]overlay=0:0:enable='lt(t,4.5)'[h];"
          f"[h]ass={OUT}/{name}_cap.ass:fontsdir=/usr/share/fonts/opentype/inter,fps=30,format=yuv420p[v]")
    run(f"ffmpeg -y -ss {a} -t {D} -i {OUT}/clean.mp4 -loop 1 -i {OUT}/{name}_hook.png "
        f"-filter_complex \"{fc}\" -map [v] -map 0:a -t {D} -c:v libx264 -preset veryfast -crf 20 -c:a aac -b:a 160k -ar 48000 {OUT}/{name}_body.mp4")
    run(f"ffmpeg -y -loop 1 -framerate 30 -t 2 -i {OUT}/short_end.png -f lavfi -t 2 -i anullsrc=r=48000:cl=mono "
        f"-vf format=yuv420p -c:v libx264 -preset veryfast -crf 20 -c:a aac -b:a 160k -shortest {OUT}/{name}_end.mp4")
    with open(f"{OUT}/{name}.txt", "w") as f:
        f.write(f"file '{name}_body.mp4'\nfile '{name}_end.mp4'\n")
    run(f"ffmpeg -y -f concat -safe 0 -i {OUT}/{name}.txt -c:v libx264 -preset veryfast -crf 20 -c:a aac -b:a 160k -ar 48000 -movflags +faststart {OUT}/{name}.mp4")
    print(name, dur(f"{OUT}/{name}.mp4"))


if __name__ == "__main__":
    thumbnail(); endcard()
    for n, s, h in SHORTS: short(n, s, h)
