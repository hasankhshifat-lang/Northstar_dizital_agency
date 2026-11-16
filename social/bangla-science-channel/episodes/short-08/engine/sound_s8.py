"""SFX + music bed for Short 8 (ambulance siren, paper rustles, fold swooshes, street traffic, horns, rickshaw bells), reusing the synth
functions and folk loop from anim/sound.py. Times mirror build_s7.py. Usage: python3 sound_s6.py <kit dir>"""
import sys, json
from pathlib import Path
S = Path(sys.argv[1]); P = S / "s8"
tl = json.loads((S / "../voiceover/short-08/timeline.json").read_text()); L = {l["i"]: l for l in tl["lines"]}
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
# shot boundaries (same formulas as build_s7.py)
def creak(gain=0.16):
    d = 0.18; t = g["tt"](d); n = g["noise"](d)
    return n * (np.sin(2 * np.pi * 37 * t) > 0.3) * np.exp(-t * 9) * gain
def crunch(gain=0.5):
    out = np.zeros(int(0.45 * SR))
    for k in range(7):
        s = creak(gain * (1 - k * 0.1)); st = int((k * 0.05 + np.random.default_rng(k).uniform(0, 0.02)) * SR); out[st:st + len(s)] += s[:len(out) - st]
    return out
def slurp(d=0.9, gain=0.14):
    t = g["tt"](d); return g["lp"](g["noise"](d), 0.18) * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * t)) * np.sin(np.pi * t / d) * gain
def hiss(d=0.8, gain=0.12):
    n = g["noise"](d); t = g["tt"](d); return (n - g["lp"](n, 0.3)) * np.minimum(1, t / 0.03) * np.exp(-t * 2.2) * gain

sh = json.loads((P / "shots.json").read_text())["shots"]
def siren_tone(d, gain):
    """Two-tone wail (hi-lo, 0.5 s each), slightly buzzy, with soft edges."""
    t = g["tt"](d); f = np.where((t % 1.0) < 0.5, 960.0, 770.0)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = (np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.15 * np.sin(3 * ph)) * gain
    env = np.minimum(1, t / 0.15) * np.minimum(1, (d - t) / 0.3)
    return s * env
def horn(gain=0.12):
    t = g["tt"](0.35); return (np.sign(np.sin(2 * np.pi * 420 * t)) * 0.5 + np.sin(2 * np.pi * 523 * t)) * np.minimum(1, t / 0.02) * np.minimum(1, (0.35 - t) / 0.05) * gain
def rustle(d=0.35, gain=0.14):
    n = g["noise"](d); t = g["tt"](d); return (n - g["lp"](n, 0.2)) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 13 * t))) * np.sin(np.pi * t / d) * gain
s5 = L[5]["start"]; t_f = s5 + 0.5; t_lab = s5 + 2.2; s7 = L[7]["start"]; t_f2 = s7 + 4.4; t_ok = s7 + 6.2; s10 = L[10]["start"]
a4, a4b, a5, a6, a7, a8, a9, a10, a11, a12 = sh[3][0], sh[4][0], sh[5][0], sh[6][0], sh[7][0], sh[8][0], sh[9][0], sh[10][0], sh[11][0], sh[12][0]
E = [(a4, rustle(0.4, 0.16)), (a4b + 0.1, rustle(0.4, 0.14)), (a5, g["whoosh"](0.25, 0.1)),
     (L[4]["end"] - 0.2, g["boing"](0.2)), (a7, g["whoosh"](0.3, 0.15)), (t_f, g["whoosh"](0.5, 0.18)), (t_f + 1.1, g["pop"](0.2)),
     (t_lab, g["ding"](1320, 0.25)), (a9, g["whoosh"](0.3, 0.15)), (t_f2, g["whoosh"](0.5, 0.18)), (t_f2 + 1.1, g["pop"](0.2)),
     (t_ok, g["ding"](1320, 0.25)), (L[8]["start"] + 0.3, g["chime"](0.25)), (a12, g["whoosh"](0.4, 0.2)),
     (s10 + 4.0, g["pop"](0.25)), (s10 + 4.5, g["pop"](0.25)), (s10 + 5.3, g["chime"](0.25)),
     (VEND, g["whoosh"](0.5, 0.3)), (VEND + 0.1, g["chime"](0.3)), (VEND + 0.4, g["pop"](0.22)), (VEND + 0.6, g["pop"](0.22)), (VEND + 0.8, g["pop"](0.22))]
sfx = np.zeros(int(DUR * SR))
for t0, s in E: put(sfx, t0, s)
# siren: loud on the hook, softer under the wide shots, far away during Boltu's question, loud again for the reveal, fading as it passes
sir = siren_tone(DUR, 1.0); tt = g["tt"](DUR)
lvl = np.interp(tt, [0, 2.25, 2.6, 7.0, 9.0, a8, a8 + 0.5, a9, a9 + 1, a10 - 0.5, a10 + 0.3, a10 + 2.5, a11, a11 + 2.5, a12],
                    [0.10, 0.10, 0.045, 0.03, 0.0, 0.0, 0.015, 0.015, 0.04, 0.05, 0.08, 0.13, 0.07, 0.01, 0.0])
sfx += sir * lvl
def mask(ranges):
    m_ = np.zeros(len(sfx))
    for a, b in ranges:
        i0, i1 = int(a * SR), int(min(b, DUR) * SR); m = np.ones(i1 - i0); r = int(0.3 * SR); m[:r] = np.linspace(0, 1, r); m[-r:] = np.linspace(1, 0, r); m_[i0:i1] = m
    return m_
traffic = g["lp"](g["noise"](DUR), 0.05) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.17 * tt))
sfx += traffic * mask([(0, a12 - 0.3)]) * 0.07 * (1 - 0.6 * mask([(a7, a8), (a9, a10)]))
rng = np.random.default_rng(8)
for t0 in (1.2, 5.0, 11.0, 18.5, 27.5, 44.5): put(sfx, t0 + rng.uniform(0, 0.6), horn(0.05))
for t0 in np.arange(3.0, a12 - 1, 7.0):
    t = g["tt"](0.35); put(sfx, t0 + rng.uniform(0, 2), (np.sin(2 * np.pi * 2300 * t) + 0.5 * np.sin(2 * np.pi * 3450 * t)) * np.exp(-t * 9) * 0.03)
g["put"] = put
ns2 = dict(g); exec(music.replace("start=7.1", "start=2.3"), ns2)
mus = ns2["mus"]
import wave
def save(name, x):
    x = x / max(1e-9, np.max(np.abs(x))) * 0.89
    with wave.open(str(P / f"{name}.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())
save("sfx", sfx); save("music", mus)
print("ok", DUR, "s,", len(E), "sfx events")
