"""SFX + music bed for Short 7 (plastic creaks, crunch, slurps, pin poke, air hiss, pop, bazaar murmur), reusing the synth
functions and folk loop from anim/sound.py. Times mirror build_s7.py. Usage: python3 sound_s6.py <kit dir>"""
import sys, json
from pathlib import Path
S = Path(sys.argv[1]); P = S / "s7"
tl = json.loads((S / "../voiceover/short-07/timeline.json").read_text()); L = {l["i"]: l for l in tl["lines"]}
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
b2 = L[1]["start"] - 0.05; b3 = L[1]["end"] + 0.15; a4 = b3; b4 = L[2]["start"]
t_tag = L[4]["start"] + 3.6; a8 = L[4]["end"] + 0.15; s5 = L[5]["start"]; t_low = s5 + 1.0; t_push = s5 + 4.0; t_rise = s5 + 4.8
b8 = L[5]["end"] + 0.2; b9 = L[6]["end"] + 0.15; s7 = L[7]["start"]; t_sq = s7 + 3.5; b10 = L[7]["end"] + 0.25
s8 = L[8]["start"]; t_poke = s8 + 1.25; t_back = t_poke + 0.35; t_suck = L[8]["end"] + 0.3; a12 = L[9]["start"] - 0.15
s11 = L[11]["start"]
E = [(0.1, slurp(1.8, 0.12))] + [(0.2 + k * 0.32, creak(0.14)) for k in range(6)] + [(2.0, slurp(1.3, 0.14)), (3.2, crunch(0.55)),
     (a4 + 0.12, slurp(0.6, 0.12)), (L[3]["start"] + 1.7, g["boing"](0.22)), (t_tag, g["ding"](1320, 0.25)),
     (a8, g["whoosh"](0.3, 0.15))] + [(t_low + k * 0.35 + 0.3, g["pop"](0.08)) for k in range(4)] + [
     (t_push, g["whoosh"](0.25, 0.12)), (t_rise, rising(0.22)), (b9, g["whoosh"](0.3, 0.15)), (s7 + 0.3, click(0.3)),
     (t_sq, creak(0.2)), (t_sq + 0.4, creak(0.18)), (t_sq + 0.9, creak(0.16)),
     (t_poke, click(0.45)), (t_poke + 0.08, hiss(0.9, 0.14)), (t_back + 0.4, g["pop"](0.3)),
     (t_suck, slurp(1.1, 0.16)), (t_suck + 0.1, rising(0.22)), (a12 + 0.3, g["chime"](0.22)),
     (s11 + 1.0, g["pop"](0.22)), (s11 + 3.0, g["pop"](0.25)), (s11 + 3.5, g["pop"](0.25)), (s11 + 4.4, g["chime"](0.25)),
     (VEND, g["whoosh"](0.5, 0.3)), (VEND + 0.1, g["chime"](0.3)), (VEND + 0.4, g["pop"](0.22)), (VEND + 0.6, g["pop"](0.22)), (VEND + 0.8, g["pop"](0.22))]
sfx = np.zeros(int(DUR * SR))
for t0, s in E: put(sfx, t0, s)
tt = g["tt"](DUR)
def mask(ranges):
    m_ = np.zeros(len(sfx))
    for a, b in ranges:
        i0, i1 = int(a * SR), int(min(b, DUR) * SR); m = np.ones(i1 - i0); r = int(0.3 * SR); m[:r] = np.linspace(0, 1, r); m[-r:] = np.linspace(1, 0, r); m_[i0:i1] = m
    return m_
bazaar = [(0, s11 - 0.4)]
crowd = g["lp"](g["noise"](DUR), 0.08) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.23 * tt)) 
sfx += crowd * mask(bazaar) * 0.05 * (1 - 0.6 * mask([(a8, b8), (b9, b10)]))   # quieter under the two cutaways
rng = np.random.default_rng(7)
for t0 in np.arange(4.0, s11 - 1, 6.5):          # distant rickshaw bells
    t = g["tt"](0.35); put(sfx, t0 + rng.uniform(0, 2), (np.sin(2 * np.pi * 2300 * t) + 0.5 * np.sin(2 * np.pi * 3450 * t)) * np.exp(-t * 9) * 0.03)
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
