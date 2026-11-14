"""SFX + music bed for Short 6 (paper ticks, pin clicks, comb swishes, tap water, reveal chime), reusing the synth
functions and folk loop from anim/sound.py. Times mirror build_s6.py. Usage: python3 sound_s6.py <kit dir>"""
import sys, json
from pathlib import Path
S = Path(sys.argv[1]); P = S / "s6"
tl = json.loads((S / "../voiceover/short-06/timeline.json").read_text()); L = {l["i"]: l for l in tl["lines"]}
VEND = tl["duration"]; DUR_ = round(VEND + 2.66, 2)
src = (S / "anim/sound.py").read_text()
defs = src.split("# timeline")[0].replace("S = Path(sys.argv[1]); OFF = float(sys.argv[2]); DUR = OFF + 107.58 + 0.4", f"S = Path({str(S)!r}); OFF = 0; DUR = {DUR_}")
music = src.split("# ---------------- music bed")[1].split("\n", 1)[1].split("def save")[0]
ns = {}; exec(defs, ns)
g = ns; np = g["np"]; SR = g["SR"]; DUR = g["DUR"]
def put(buf, t0, s):
    st = int(t0 * SR)
    if st >= len(buf) or st < 0: return
    e = min(len(buf), st + len(s)); buf[st:e] += s[:e - st]
def click(gain=0.35):
    t = g["tt"](0.06); return (np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 90) + g["noise"](0.06) * np.exp(-t * 120) * 0.3) * gain
def swish(d=0.3, gain=0.18):
    t = g["tt"](d); return g["lp"](g["noise"](d), 0.4) * np.sin(np.pi * t / d) * gain
def rising(gain=0.3):
    t = g["tt"](0.9); f = 600 + 700 * t / 0.9
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.5) * np.minimum(1, t / 0.03) * gain
# shot boundaries (same formulas as build_s6.py)
b3 = L[1]["end"] + 0.15; b4 = L[2]["end"] + 0.15; a5 = b4; b5 = L[3]["start"] + 0.9; b6 = L[3]["end"] + 0.55
a7 = b6; tp = a7 + 0.6; b7 = L[4]["start"] + 1.45; b8 = L[4]["end"] + 0.3; b9 = L[5]["end"] + 0.25
s6 = L[6]["start"]; a10 = b9; t_split = s6 + 3.9; b10 = L[6]["end"] + 0.2; b11 = L[7]["end"] + 0.15
a12 = b11; b12 = L[8]["start"] - 0.7; a13 = b12; t_b = a13 + 0.5; b13 = L[8]["end"] + 0.25; b14 = L[9]["end"] + 0.25
s10 = L[10]["start"]; t_name = L[5]["start"] + 4.0; t_pt = L[7]["start"] + 2.0
E = [(0.3, swish(0.3, 0.15))] + [(0.45 + k * 0.08 + 0.1, g["tick"](0.18)) for k in range(5)] + [
     (2.6, g["whoosh"](0.3, 0.15)), (b4 - 3.0, g["pop"](0.15)),
     (a5 + 0.4, g["whoosh"](0.25, 0.12)), (b5 + 0.05, g["boing"](0.25)),
     (tp - 0.1, g["whoosh"](0.25, 0.12))] + [(tp + k * 0.05 + 0.08, click()) for k in range(3)] + [
     (t_name, g["ding"](1320, 0.25))] + [(a10 + i * 0.8, swish(0.6, 0.2)) for i in range(4)] + [
     (s6 + 2.6, g["pop"](0.2)), (t_split, g["whoosh"](0.3, 0.15))] + [(t_split + 1.35 + k * 0.07 + 0.1, g["tick"](0.18)) for k in range(5)] + [
     (s6 + 5.2, g["pop"](0.2)), (t_pt, g["whoosh"](0.25, 0.12))] + [(a12 + i * 0.3, swish(0.25, 0.14)) for i in range(int((b12 - a12) / 0.3))] + [
     (t_b, rising()), (t_b + 0.5, g["chime"](0.25)),
     (s10 + 2.6, g["pop"](0.25)), (s10 + 3.4, g["pop"](0.25)), (s10 + 4.3, g["chime"](0.25)),
     (VEND, g["whoosh"](0.5, 0.3)), (VEND + 0.1, g["chime"](0.3)), (VEND + 0.4, g["pop"](0.22)), (VEND + 0.6, g["pop"](0.22)), (VEND + 0.8, g["pop"](0.22))]
sfx = np.zeros(int(DUR * SR))
for t0, s in E: put(sfx, t0, s)
tt = g["tt"](DUR)
def mask(ranges):
    m_ = np.zeros(len(sfx))
    for a, b in ranges:
        i0, i1 = int(a * SR), int(min(b, DUR) * SR); m = np.ones(i1 - i0); r = int(0.3 * SR); m[:r] = np.linspace(0, 1, r); m[-r:] = np.linspace(1, 0, r); m_[i0:i1] = m
    return m_
yard = [(0, a10), (b10, b14)]
tap = g["lp"](g["noise"](DUR), 0.25) * (0.8 + 0.2 * np.sin(2 * np.pi * 3.1 * tt))
sfx += tap * mask(yard) * 0.035 + tap * mask([(a12, b13)]) * 0.07       # running tap, louder near the drum
rng = np.random.default_rng(5)
for t0 in np.arange(1.5, DUR, 3.3):
    if any(a < t0 < b for a, b in yard):
        t = g["tt"](0.12); put(sfx, t0 + rng.uniform(0, 1), np.sin(2 * np.pi * (2800 + 900 * np.sin(2 * np.pi * 18 * t)) * t) * np.exp(-t * 25) * 0.05)
g["put"] = put
ns2 = dict(g); exec(music.replace("start=7.1", "start=0.4"), ns2)
mus = ns2["mus"]
import wave
def save(name, x):
    x = x / max(1e-9, np.max(np.abs(x))) * 0.89
    with wave.open(str(P / f"{name}.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())
save("sfx", sfx); save("music", mus)
print("ok", DUR, "s,", len(E), "sfx events")
