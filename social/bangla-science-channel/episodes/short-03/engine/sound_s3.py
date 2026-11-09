"""SFX + music bed for Short 3, reusing the synth functions and folk loop from anim/sound.py (no samples)."""
import sys
from pathlib import Path
S = Path(sys.argv[1]); P = S / "s3"
src = (S / "anim/sound.py").read_text()
defs = src.split("# timeline")[0].replace("S = Path(sys.argv[1]); OFF = float(sys.argv[2]); DUR = OFF + 107.58 + 0.4", f"S = Path({str(S)!r}); OFF = 0; DUR = 59.5")
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

E = [(0.1, g["bell"]()), (0.75, g["pop"](0.2)), (0.85, g["crinkle"](0.6, 0.15)), (1.0, g["boing"](0.25)),
     (4.4, g["boing"](0.2)), (10.7, g["whoosh"](0.3, 0.15)), (11.0, g["beep"](0.15)),
     (13.0, g["whoosh"](0.35, 0.2)), (17.8, g["pop"](0.3)), (17.9, g["ding"](1320, 0.3)),
     (20.0, g["whoosh"](0.5, 0.3)), (20.2, g["pop"](0.25)), (20.35, g["pop"](0.25)), (23.7, g["pop"](0.25)), (24.0, g["crinkle"](0.5, 0.15)), (24.4, g["pop"](0.22)), (25.4, g["pop"](0.22)),
     (27.7, g["chime"](0.3)), (27.9, g["pop"](0.22)), (28.3, g["pop"](0.22)),
     (29.9, g["whoosh"](0.35, 0.2)), (33.0, g["whoosh"](0.35, 0.2)), (33.3, g["pop"](0.25)), (34.5, g["plop"](900, 300, 0.12, 0.3)), (35.5, g["crinkle"](0.6, 0.18)), (36.5, g["boing"](0.25)), (37.0, g["plop"](500, 200, 0.12, 0.3)),
     (39.6, g["whoosh"](0.4, 0.25)), (40.0, g["thud"](0.25)), (42.8, g["boing"](0.3)),
     (48.6, g["whoosh"](0.5, 0.3)), (48.9, g["chime"](0.3)), (49.3, g["pop"](0.3)), (52.0, g["pop"](0.25)),
     (56.23, g["whoosh"](0.5, 0.3)), (56.3, g["bell"]()), (56.6, g["pop"](0.22)), (56.8, g["pop"](0.22)), (57.0, g["pop"](0.22))]
sfx = np.zeros(int(DUR * SR))
for t0, s in E: g["put"](sfx, t0, s)
# village ambience on the story shots: soft water noise + birds
amb = g["lp"](g["noise"](DUR), 0.02) * 0.5 * (0.6 + 0.4 * np.sin(2 * np.pi * 0.15 * g["tt"](DUR)))
mask = np.zeros(len(sfx))
for a, b in [(0, 20.0), (29.9, 48.6), (51.5, 56.23)]:
    i0, i1 = int(a * SR), int(b * SR); m = np.ones(i1 - i0); r = int(0.4 * SR); m[:r] = np.linspace(0, 1, r); m[-r:] = np.linspace(1, 0, r); mask[i0:i1] = m
sfx += amb * mask * 0.12
rng = np.random.default_rng(3)
for t0 in np.arange(1.5, 56, 3.7):
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
