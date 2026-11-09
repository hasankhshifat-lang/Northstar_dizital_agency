"""SFX + music bed for Pilot 5, reusing the synth functions and folk loop from anim/sound.py (no samples)."""
import sys
from pathlib import Path
S = Path(sys.argv[1]); P = S / "p5"
src = (S / "anim/sound.py").read_text()
defs = src.split("# timeline")[0].replace("S = Path(sys.argv[1]); OFF = float(sys.argv[2]); DUR = OFF + 107.58 + 0.4", f"S = Path({str(S)!r}); OFF = 0; DUR = 144.5")
music = src.split("# ---------------- music bed")[1].split("\n",1)[1].split("def save")[0]
ns = {}; exec(defs, ns)
g = ns; np = g["np"]; SR = g["SR"]; DUR = g["DUR"]
def _put(buf, t0, s):
    st = int(t0 * SR)
    if st >= len(buf): return
    e = min(len(buf), st + len(s)); buf[st:e] += s[:e - st]
g["put"] = _put

def chirp(g_=0.12):   # small bird chirp for the village ambience
    t = g["tt"](0.12); f = 2600 + 1400 * np.sin(np.pi * t / 0.12)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 18) * g_

E = [(0.1, g["bell"]()), (0.9, g["whoosh"](0.4, 0.2)),
     (12.8, g["boing"](0.25)), (17.95, g["splash"](0.7, 0.55)), (18.05, g["bubbles"](1.0, 6, 0.2)), (19.75, g["boing"](0.22)),
     (23.4, g["splash"](0.5, 0.4)), (25.0, g["splash"](0.5, 0.4)), (26.3, g["whoosh"](0.35, 0.2)),
     (36.3, g["pop"](0.3)), (44.5, g["glug"](0.45)), (45.2, g["glug"](0.4)), (46.6, g["whoosh"](0.5, 0.3)), (47.2, g["pop"](0.25)), (47.4, g["ding"](1320, 0.3)),
     (56.4, g["chime"](0.3)), (61.9, g["pop"](0.25)), (63.0, g["pop"](0.25)),
     (66.4, g["whoosh"](0.4, 0.25)), (67.1, g["crinkle"](0.6, 0.18)), (70.9, g["pop"](0.25)), (71.3, g["ding"](1568, 0.3)),
     (73.6, g["whoosh"](0.5, 0.3)), (73.8, g["pop"](0.25)), (76.9, g["plop"](900, 300, 0.12, 0.4)), (78.0, g["plop"](700, 260, 0.12, 0.4)), (79.6, g["chime"](0.3)),
     (85.4, g["whoosh"](0.35, 0.2)), (89.6, g["beep"](0.2)), (94.4, g["boing"](0.25)),
     (100.35, g["splash"](0.7, 0.55)), (101.6, g["whoosh"](0.4, 0.3)), (101.9, g["ding"](1760, 0.3)), (103.8, g["plop"](260, 90, 0.2, 0.6)), (104.0, g["thud"](0.35)),
     (105.5, g["boing"](0.3)), (111.4, g["pop"](0.3)), (119.8, g["pop"](0.3)), (125.3, g["thud"](0.3)),
     (130.0, g["pop"](0.25)), (139.9, g["whoosh"](0.5, 0.3)), (140.2, g["bell"]()), (140.6, g["pop"](0.22)), (140.8, g["pop"](0.22)), (141.0, g["pop"](0.22))]
sfx = np.zeros(int(DUR * SR))
for t0, s in E: g["put"](sfx, t0, s)
# village ambience on the story shots: soft water noise + birds
amb = g["lp"](g["noise"](DUR), 0.02) * 0.5 * (0.6 + 0.4 * np.sin(2 * np.pi * 0.15 * g["tt"](DUR)))
mask = np.zeros(len(sfx))
for a, b in [(0, 46.6), (66.4, 73.6), (85.4, 140.2)]:
    i0, i1 = int(a * SR), int(b * SR); m = np.ones(i1 - i0); r = int(0.4 * SR); m[:r] = np.linspace(0, 1, r); m[-r:] = np.linspace(1, 0, r); mask[i0:i1] = m
sfx += amb * mask * 0.12
rng = np.random.default_rng(3)
for t0 in np.arange(1.5, 140, 3.7):
    if mask[int(t0 * SR)] > 0.5: g["put"](sfx, t0 + rng.uniform(0, 1.5), chirp(0.08))

ns2 = dict(g); exec(music.replace("start=7.1", "start=0.3"), ns2)
mus = ns2["mus"]

import wave
def save(name, x):
    x = x / max(1e-9, np.max(np.abs(x))) * 0.89
    with wave.open(str(P / f"{name}.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())
save("sfx", sfx); save("music", mus)
print("ok", DUR, "s,", len(E), "sfx events")
