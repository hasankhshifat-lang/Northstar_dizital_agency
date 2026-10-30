"""Build the Which Life Next long video (2026-10-30, Homesteader Winter 1888).

Stages: narration -> snow layers -> title cards -> shot clips -> clean video -> captions -> final.
Run: python3 -I build.py <stage|all>
"""
import json, math, os, random, re, subprocess, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageEnhance

W = os.path.dirname(os.path.abspath(__file__))
IMG, VO, OUT = f"{W}/img", f"{W}/vo", f"{W}/out"
os.makedirs(OUT, exist_ok=True)
FPS, GAP, LEAD = 30, 0.8, 1.0
SERIF = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
SANS = "/usr/share/fonts/opentype/inter/Inter-Bold.otf"


def run(cmd):
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if r.returncode:
        print(r.stderr[-3000:]); raise SystemExit(f"failed: {cmd[:200]}")
    return r


def dur(p):
    return float(run(f"ffprobe -v error -show_entries format=duration -of csv=p=0 '{p}'").stdout)


SEGS = [f"{i:02d}" for i in range(1, 13)]

# ---------------------------------------------------------------- narration
def narration():
    starts, t = {}, LEAD
    parts = [f"-f lavfi -t {LEAD} -i anullsrc=r=44100:cl=mono"]
    n = 1
    for s in SEGS:
        d = dur(f"{VO}/{s}.mp3"); starts[s] = (t, d); t += d + GAP
        parts.append(f"-i {VO}/{s}.mp3"); parts.append(f"-f lavfi -t {GAP} -i anullsrc=r=44100:cl=mono"); n += 2
    filt = "".join(f"[{i}:a]aresample=44100,aformat=channel_layouts=mono[a{i}];" for i in range(n))
    filt += "".join(f"[a{i}]" for i in range(n)) + f"concat=n={n}:v=0:a=1[out]"
    run(f"ffmpeg -y {' '.join(parts)} -filter_complex \"{filt}\" -map [out] -c:a pcm_s16le {OUT}/narration.wav")
    total = dur(f"{OUT}/narration.wav")
    json.dump({"starts": starts, "total": total}, open(f"{OUT}/timing.json", "w"), indent=1)
    print("narration", total)


# ---------------------------------------------------------------- snow
def snow(name, count, size, speed, haze):
    d = f"{OUT}/snow_{name}"; os.makedirs(d, exist_ok=True)
    rnd = random.Random(7)
    flakes = [[rnd.uniform(0, 1920), rnd.uniform(0, 1080), rnd.uniform(*size), rnd.uniform(0.6, 1.4)] for _ in range(count)]
    frames = 6 * FPS
    for f in range(frames):
        im = Image.new("RGBA", (1920, 1080), (235, 240, 248, int(255 * haze)))
        dr = ImageDraw.Draw(im)
        for fl in flakes:
            x, y, r, sp = fl
            # wind blows left-to-right and down; loop seamlessly over 6s
            xx = (x + f * speed * 1.6 * sp) % 1980 - 30
            yy = (y + f * speed * sp) % 1140 - 30
            a = int(150 + 100 * (r / size[1]))
            dr.ellipse([xx - r, yy - r, xx + r, yy + r], fill=(255, 255, 255, min(a, 255)))
        im = im.filter(ImageFilter.GaussianBlur(0.8))
        im.save(f"{d}/{f:04d}.png")
    run(f"ffmpeg -y -framerate {FPS} -i {d}/%04d.png -c:v qtrle -pix_fmt argb {OUT}/snow_{name}.mov")
    print("snow", name)


# ---------------------------------------------------------------- cards
def card(name, bg, lines, sub=None):
    im = Image.open(f"{IMG}/{bg}.png").convert("RGB").resize((1920, 1080))
    im = ImageEnhance.Brightness(im.filter(ImageFilter.GaussianBlur(14))).enhance(0.35)
    dr = ImageDraw.Draw(im)
    big = ImageFont.truetype(SERIF, 112)
    y = 540 - (len(lines) * 130 + (70 if sub else 0)) // 2
    for ln in lines:
        w = dr.textlength(ln, font=big)
        dr.text(((1920 - w) / 2, y), ln, font=big, fill=(245, 236, 214))
        y += 130
    if sub:
        f2 = ImageFont.truetype(SANS, 44)
        w = dr.textlength(sub, font=f2)
        dr.text(((1920 - w) / 2, y + 20), sub, font=f2, fill=(214, 170, 96))
    im.save(f"{IMG}/card_{name}.png")


CARDS = {
    "date": ("s01a", ["JANUARY 12, 1888"], "DAKOTA TERRITORY"),
    "temp": ("s01b", ["50°F  →  −27°F"], "IN ONE DAY"),
    "deal": ("s02a", ["160 ACRES", "$18  ·  5 YEARS"], "THE HOMESTEAD ACT OF 1862"),
    "miles": ("s04a", ["3 TO 10 MILES"], "TO YOUR NEAREST NEIGHBOR"),
    "rope": ("s01c", ["TIE A ROPE"], "FROM THE HOUSE TO THE BARN"),
    "huron": ("s01b", ["−27°F"], "HURON, DAKOTA TERRITORY · THAT NIGHT"),
    "minnie": ("s01a", ["12 STUDENTS", "1 LENGTH OF TWINE"], "MINNIE FREEMAN, AGE 19 · ORD, NEBRASKA"),
    "yards": ("s03c", ["LESS THAN", "90 YARDS"], "PLAINVIEW, NEBRASKA"),
    "feet": ("s01c", ["12 FEET"], "OLE OLESEN TISLAND, 70 · BROOKINGS, DAKOTA TERRITORY"),
    "toll": ("s01b", ["~235 DEAD"], "MOST CITED ESTIMATE · SOME SAY UP TO 500"),
    "claims": ("s02b", ["4,000,000 CLAIMS", "270,000,000 ACRES"], "10% OF THE UNITED STATES"),
    "end": ("s01c", ["WOULD YOU", "HAVE MADE IT?"], "TELL US IN THE COMMENTS"),
}

# ---------------------------------------------------------------- shots
# (image, start fraction of segment, zoom from->to, pan dx,dy (fraction of spare), tint, snow)
# tint: None | "cold" | "fire" | "warm" | "night"
SHOTS = {
    "01": [("s01a", 0.00, 1.00, 1.10, 0.3, 0, None, None), ("card_date", 0.12, 1.0, 1.05, 0, 0, None, None),
           ("s01b", 0.28, 1.05, 1.18, -0.4, 0, None, None), ("card_temp", 0.45, 1.0, 1.05, 0, 0, None, None),
           ("s01c", 0.62, 1.12, 1.0, 0.2, 0, "cold", "light")],
    "02": [("s00town", 0.00, 1.0, 1.12, 0.4, 0, "warm", None), ("s02a", 0.18, 1.0, 1.15, -0.3, 0, None, None),
           ("card_deal", 0.42, 1.0, 1.05, 0, 0, None, None), ("s02a", 0.58, 1.25, 1.1, 0.5, 0.2, None, None),
           ("s02b", 0.76, 1.0, 1.12, 0.4, 0, None, None)],
    "03": [("s03a", 0.00, 1.0, 1.12, -0.3, 0, None, None), ("s03b", 0.36, 1.05, 1.18, 0.3, 0, None, None),
           ("s03c", 0.70, 1.0, 1.15, 0, -0.2, None, None)],
    "04": [("s04a", 0.00, 1.0, 1.15, 0.3, 0, None, None), ("s04a", 0.30, 1.3, 1.15, -0.5, 0.3, None, None),
           ("s03a", 0.48, 1.2, 1.05, 0.4, 0.4, "warm", None), ("s03c", 0.66, 1.2, 1.05, 0.6, 0.3, "night", "light")],
    "05": [("s01b", 0.00, 1.2, 1.05, -0.6, 0.5, None, None), ("card_miles", 0.22, 1.0, 1.05, 0, 0, None, None),
           ("s03b", 0.42, 1.25, 1.1, -0.4, -0.3, "fire", None), ("s02b", 0.72, 1.15, 1.0, -0.4, 0, None, None)],
    "06": [("s01c", 0.00, 1.0, 1.12, 0, 0, "cold", "heavy"), ("card_rope", 0.36, 1.0, 1.05, 0, 0, None, None),
           ("s01c", 0.52, 1.3, 1.12, 0.5, 0.2, "cold", "heavy"), ("s01b", 0.78, 1.1, 1.2, 0.3, 0, "cold", "heavy")],
    "07": [("s00town", 0.00, 1.15, 1.0, -0.3, 0, None, None), ("s01a", 0.20, 1.0, 1.12, 0.3, 0, None, None),
           ("s01b", 0.40, 1.0, 1.2, -0.3, 0, "cold", "light"), ("s01b", 0.62, 1.25, 1.35, 0.4, 0.3, "cold", "heavy"),
           ("card_huron", 0.86, 1.0, 1.05, 0, 0, None, None)],
    "08": [("s03c", 0.00, 1.0, 1.12, 0, 0, "cold", None), ("s01a", 0.20, 1.2, 1.3, 0.3, 0.3, "cold", "heavy"),
           ("card_minnie", 0.32, 1.0, 1.05, 0, 0, None, None), ("s01a", 0.48, 1.35, 1.2, 0.6, 0.4, "cold", "heavy"),
           ("card_yards", 0.66, 1.0, 1.05, 0, 0, None, None), ("s01b", 0.82, 1.2, 1.35, 0, 0.3, "night", "heavy")],
    "09": [("s01c", 0.00, 1.0, 1.15, -0.2, 0, "cold", "heavy"), ("card_feet", 0.26, 1.0, 1.06, 0, 0, None, None),
           ("s01c", 0.42, 1.35, 1.2, 0.3, 0.3, "night", "heavy"), ("s01b", 0.66, 1.3, 1.2, 0.5, 0.5, "night", "heavy"),
           ("s03c", 0.84, 1.15, 1.0, 0.3, 0, "warm", None)],
    "10": [("s01b", 0.00, 1.2, 1.05, 0.5, 0.4, "cold", "light"), ("card_toll", 0.24, 1.0, 1.05, 0, 0, None, None),
           ("s00town", 0.48, 1.0, 1.15, 0.3, 0, "cold", "light"), ("s02a", 0.72, 1.15, 1.0, 0.4, 0, "cold", None)],
    "11": [("s02b", 0.00, 1.25, 1.05, 0.5, 0, None, None), ("card_claims", 0.24, 1.0, 1.05, 0, 0, None, None),
           ("s03a", 0.50, 1.0, 1.15, 0.5, 0, None, None), ("s03b", 0.74, 1.15, 1.0, -0.4, 0, None, None)],
    "12": [("s01c", 0.00, 1.25, 1.0, 0.3, 0.2, "warm", "light"), ("s01a", 0.38, 1.0, 1.12, 0, 0, None, None),
           ("card_end", 0.66, 1.0, 1.05, 0, 0, None, None)],
}

TINT = {
    None: "",
    "cold": ",colorbalance=rs=-0.08:bs=0.12:rm=-0.05:bm=0.08,eq=saturation=0.75",
    "night": ",colorbalance=rs=-0.12:bs=0.18:rm=-0.08:bm=0.1,eq=brightness=-0.12:saturation=0.6",
    "fire": ",colorbalance=rs=0.25:gs=0.05:bs=-0.2:rh=0.2,eq=brightness=0.02:saturation=1.2",
    "warm": ",colorbalance=rs=0.08:bs=-0.06,eq=saturation=1.05",
}


def shot_list():
    tm = json.load(open(f"{OUT}/timing.json"))
    shots, total = [], tm["total"]
    for s in SEGS:
        st, d = tm["starts"][s]
        block_end = st + d + GAP
        for i, sh in enumerate(SHOTS[s]):
            t0 = 0.0 if (s == "01" and i == 0) else st + sh[1] * d
            nxt = SHOTS[s][i + 1][1] if i + 1 < len(SHOTS[s]) else None
            t1 = st + nxt * d if nxt is not None else (block_end if s != "12" else total)
            shots.append((t0, t1) + sh)
    return shots


def render_shots():
    shots = shot_list()
    for k, (t0, t1, img, _f, z0, z1, px, py, tint, sn) in enumerate(shots):
        D = round(t1 - t0, 3)
        # scale with per-frame zoom, then crop a 1920x1080 window that drifts by px/py of the spare margin
        z = f"({z0}+({z1}-{z0})*t/{D})"
        cx = f"(iw-1920)/2*(1+{px}*(2*t/{D}-1))"
        cy = f"(ih-1080)/2*(1+{py}*(2*t/{D}-1))"
        vf = (f"scale=w='trunc(1920*{z}*1.02/2)*2':h=-2:eval=frame,crop=1920:1080:'{cx}':'{cy}'"
              f"{TINT[tint]},format=yuv420p")
        inp = f"-loop 1 -framerate {FPS} -t {D} -i {IMG}/{img}.png"
        if sn:
            inp += f" -stream_loop -1 -i {OUT}/snow_{sn}.mov"
            fc = f"[0:v]{vf}[b];[1:v]format=argb[s];[b][s]overlay=shortest=1,format=yuv420p,fade=t=in:d=0.25,fade=t=out:st={max(D-0.25,0)}:d=0.25[v]"
        else:
            fc = f"[0:v]{vf},fade=t=in:d=0.25,fade=t=out:st={max(D-0.25,0)}:d=0.25[v]"
        run(f"ffmpeg -y {inp} -filter_complex \"{fc}\" -map [v] -t {D} -r {FPS} -c:v libx264 -preset veryfast -crf 18 {OUT}/shot_{k:03d}.mp4")
        print(k, img, D, flush=True)
    with open(f"{OUT}/shots.txt", "w") as f:
        for k in range(len(shots)):
            f.write(f"file 'shot_{k:03d}.mp4'\n")


def wind_bed():
    # quiet procedural wind under the storm segments (06-09), fading in and out
    tm = json.load(open(f"{OUT}/timing.json"))
    a = tm["starts"]["06"][0]; b = tm["starts"]["10"][0] + 4
    total = tm["total"]
    run(f"ffmpeg -y -f lavfi -i anoisesrc=color=brown:amplitude=0.6:d={total}:r=44100 "
        f"-af \"lowpass=f=500,highpass=f=60,tremolo=f=0.15:d=0.6,volume='if(between(t,{a},{b}),0.22*min(1,min((t-{a})/4,({b}-t)/4)),0)':eval=frame\" "
        f"-ac 1 {OUT}/wind.wav")


def clean():
    run(f"ffmpeg -y -f concat -safe 0 -i {OUT}/shots.txt -c copy {OUT}/video_noaudio.mp4")
    run(f"ffmpeg -y -i {OUT}/video_noaudio.mp4 -i {OUT}/narration.wav -i {OUT}/wind.wav "
        f"-filter_complex \"[1:a][2:a]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[a]\" "
        f"-map 0:v -map [a] -c:v copy -c:a aac -b:a 192k -ar 48000 -shortest {OUT}/clean.mp4")
    print("clean", dur(f"{OUT}/clean.mp4"))


# ---------------------------------------------------------------- captions
def sentences(text):
    text = re.sub(r"\[[a-z ]+\]\s*", "", text)
    parts = re.split(r"(?<=[.?!])\s+", text.strip())
    out = []
    for p in parts:  # keep caption lines short: split long sentences at commas
        words = p.split()
        while len(words) > 12:
            cut = next((i + 1 for i in range(6, min(12, len(words))) if words[i].endswith(",")), 9)
            out.append(" ".join(words[:cut])); words = words[cut:]
        if words: out.append(" ".join(words))
    return out


def speech_spans(path):
    r = run(f"ffmpeg -i '{path}' -af silencedetect=noise=-38dB:d=0.18 -f null - 2>&1")
    log = r.stdout + r.stderr
    ss = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]
    se = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
    return list(zip(ss, se))


def ts(t):
    h, m = divmod(t, 3600); m, s = divmod(m, 60)
    return f"{int(h)}:{int(m):02d}:{s:05.2f}"


def captions(vertical=False, only=None, offset=0.0, name="captions"):
    tm = json.load(open(f"{OUT}/timing.json"))
    segtext = json.load(open(f"{W}/segments.json"))
    events = []
    for s in SEGS:
        if only and s not in only: continue
        st, d = tm["starts"][s]
        sents = sentences(segtext[s])
        sil = [((a + b) / 2) for a, b in speech_spans(f"{VO}/{s}.mp3")]
        lens = [len(x) for x in sents]; tot = sum(lens)
        acc, bounds = 0, [0.0]
        for L in lens[:-1]:
            acc += L; guess = d * acc / tot
            near = min(sil, key=lambda x: abs(x - guess)) if sil else guess
            bounds.append(near if abs(near - guess) < 1.2 else guess)
        bounds.append(d)
        for i, line in enumerate(sents):
            a, b = st + bounds[i] - offset, st + bounds[i + 1] - offset
            if b - a > 0.3: events.append((a, b, line))
    if vertical:
        style = "Style: C,Inter,74,&H00FFFFFF,&H000000FF,&H00101010,&H80000000,-1,0,0,0,100,100,0,0,1,5,2,2,70,70,560,1"
        res = "PlayResX: 1080\nPlayResY: 1920"
    else:
        style = "Style: C,Inter,58,&H00FFFFFF,&H000000FF,&H00101010,&H80000000,-1,0,0,0,100,100,0,0,1,4,1,2,160,160,70,1"
        res = "PlayResX: 1920\nPlayResY: 1080"
    with open(f"{OUT}/{name}.ass", "w") as f:
        f.write(f"[Script Info]\nScriptType: v4.00+\n{res}\nWrapStyle: 0\n\n[V4+ Styles]\n"
                "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, "
                "Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n"
                f"{style}\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n")
        for a, b, line in events:
            f.write(f"Dialogue: 0,{ts(max(a,0))},{ts(b)},C,,0,0,0,,{line}\n")
    return events


def final():
    captions()
    run(f"ffmpeg -y -i {OUT}/clean.mp4 -vf \"ass={OUT}/captions.ass:fontsdir=/usr/share/fonts/opentype/inter\" "
        f"-c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p -c:a copy -movflags +faststart {OUT}/long.mp4")
    print("final", dur(f"{OUT}/long.mp4"))


if __name__ == "__main__":
    st = sys.argv[1]
    if st in ("narration", "all"): narration()
    if st in ("snow", "all"):
        snow("light", 160, (1.2, 3.0), 4.0, 0.0); snow("heavy", 700, (1.5, 4.5), 9.0, 0.28)
    if st in ("cards", "all"):
        for k, v in CARDS.items(): card(k, *v)
    if st in ("shots", "all"): render_shots()
    if st in ("wind", "all"): wind_bed()
    if st in ("clean", "all"): clean()
    if st in ("final", "all"): final()
