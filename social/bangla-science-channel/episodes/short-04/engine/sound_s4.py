"""SFX + music bed for Short 4 (thunder, rain, bag pop), reusing the synth functions and folk loop from anim/sound.py.
Usage: python3 sound_s4.py <kit dir>"""
import sys, json
from pathlib import Path
S = Path(sys.argv[1]); P = S / "s4"
DUR_ = 61.5
src = (S / "anim/sound.py").read_text()
defs = src.split("# timeline")[0].replace("S = Path(sys.argv[1]); OFF = float(sys.argv[2]); DUR = OFF + 107.58 + 0.4", f"S = Path({str(S)!r}); OFF = 0; DUR = {DUR_}")
music = src.split("# ---------------- music bed")[1].split("\n", 1)[1].split("def save")[0]
ns = {}; exec(defs, ns)
g = ns; np = g["np"]; SR = g["SR"]; DUR = g["DUR"]
def put(buf, t0, s):
    st = int(t0 * SR)
    if st >= len(buf): return
    e = min(len(buf), st + len(s)); buf[st:e] += s[:e - st]

def thunder(d=3.2, gain=0.9):
    """Crack, then a long rolling low rumble (filtered noise with slow random swells)."""
    t = g["tt"](d)
    crack = g["lp"](g["noise"](d), 0.5) * np.exp(-t * 14) * 0.6
    rum = g["lp"](g["lp"](g["noise"](d), 0.03), 0.05) * 6
    sw = 0.55 + 0.45 * np.sin(2 * np.pi * 1.7 * t) * np.sin(2 * np.pi * 0.6 * t + 1)
    rum *= sw * np.minimum(1, t / 0.08) * np.exp(-t * 0.9)
    return (crack + rum) * gain
def bagpop(gain=0.9):
    t = g["tt"](0.25)
    return (g["noise"](0.25) * np.exp(-t * 60) + np.sin(2 * np.pi * 140 * t) * np.exp(-t * 25) * 0.6) * gain
def zip_(d=0.7, gain=0.3):
    t = g["tt"](d); f = 180 + 260 * t / d
    return np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.3 * np.minimum(1, t / 0.05) * np.exp(-t * 2) * gain

tl = json.loads((S / "../voiceover/short-04/timeline.json").read_text()); L = {l["i"]: l for l in tl["lines"]}
tm = L[1]["start"] + 2.1
t_same = L[3]["start"] + 2.3; t_light = L[3]["start"] + 5.0; t_sound = L[3]["start"] + 8.0
t_hear = L[4]["start"] + 2.0; t_3s = L[4]["start"] + 3.2; t_pop = L[7]["start"] - 0.55
E = [(0.9, g["tick"](0.2)), (1.9, g["tick"](0.2)), (2.9, g["tick"](0.2)), (3.1, thunder()),
     (7.5, g["whoosh"](0.4, 0.25)), (7.6, g["pop"](0.2)), (tm, zip_()), (L[1]["start"] + 3.3, g["horn"]()),
     (12.5, g["whoosh"](0.3, 0.15)), (12.9, g["boing"](0.15)), (15.6, g["whoosh"](0.3, 0.15)),
     (17.4, g["whoosh"](0.5, 0.3)), (17.6, g["pop"](0.22)), (t_same, g["chime"](0.25)), (t_light, g["ding"](1320, 0.25)), (t_sound, g["ding"](990, 0.25)),
     (t_hear, thunder(1.4, 0.35)), (t_3s, g["pop"](0.2))] + [(t_3s + 0.25 + 0.62 * (i + 1), g["tick"](0.18)) for i in range(3)] + [
     (t_3s + 2.2, g["chime"](0.25)),
     (L[4]["end"] + 0.3, g["whoosh"](0.35, 0.2)), (L[5]["start"] + 1.2, g["pop"](0.22)),
     (L[5]["end"] + 0.2, g["whoosh"](0.3, 0.15)), (L[6]["start"] + 2.1, g["pop"](0.25)), (L[6]["start"] + 3.0, g["pop"](0.22)), (L[6]["start"] + 4.3, g["pop"](0.22)),
     (t_pop, bagpop()), (t_pop + 0.15, g["boing"](0.3)),
     (L[8]["start"] + 2.6, g["pop"](0.22)),
     (L[8]["end"] + 0.3, g["whoosh"](0.4, 0.25)), (L[9]["start"] + 0.75, g["pop"](0.25)), (L[9]["start"] + 1.4, g["pop"](0.25)), (L[9]["start"] + 2.0, g["pop"](0.25)), (L[9]["start"] + 2.5, g["chime"](0.25)),
     (tl["duration"], g["whoosh"](0.5, 0.3)), (tl["duration"] + 0.1, g["bell"]()), (tl["duration"] + 0.4, g["pop"](0.22)), (tl["duration"] + 0.6, g["pop"](0.22)), (tl["duration"] + 0.8, g["pop"](0.22))]
sfx = np.zeros(int(DUR * SR))
for t0, s in E: put(sfx, t0, s)
# storm ambience: wind on all street shots, rain hiss from the safety scene on
tt = g["tt"](DUR)
wind = g["lp"](g["noise"](DUR), 0.015) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.11 * tt)) * 1.4
rainn = g["lp"](g["noise"](DUR), 0.35) * 0.25
def mask(ranges):
    m_ = np.zeros(len(sfx))
    for a, b in ranges:
        i0, i1 = int(a * SR), int(min(b, DUR) * SR); m = np.ones(i1 - i0); r = int(0.4 * SR); m[:r] = np.linspace(0, 1, r); m[-r:] = np.linspace(1, 0, r); m_[i0:i1] = m
    return m_
street = [(0, 7.49), (12.51, 17.38), (L[4]["end"] + 0.3, L[8]["end"] + 0.3), (L[9]["start"] + 2.9, tl["duration"])]
sfx += wind * mask(street) * 0.10
sfx += rainn * mask([(L[5]["end"] + 0.2, L[8]["end"] + 0.3), (L[9]["start"] + 2.9, tl["duration"])]) * 0.12

g["put"] = put
ns2 = dict(g); exec(music.replace("start=7.1", "start=7.4"), ns2)
mus = ns2["mus"]
import wave
def save(name, x):
    x = x / max(1e-9, np.max(np.abs(x))) * 0.89
    with wave.open(str(P / f"{name}.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())
save("sfx", sfx); save("music", mus)
print("ok", DUR, "s,", len(E), "sfx events")
