"""SFX + music bed for Short 5 (pond: splashes, jump whoosh, board dings, mud squelch), reusing the synth functions and
folk loop from anim/sound.py. Usage: python3 sound_s5.py <kit dir>"""
import sys, json
from pathlib import Path
S = Path(sys.argv[1]); P = S / "s5"
tl = json.loads((S / "../voiceover/short-05/timeline.json").read_text()); L = {l["i"]: l for l in tl["lines"]}
VEND = tl["duration"]; DUR_ = round(VEND + 2.66, 2)
src = (S / "anim/sound.py").read_text()
defs = src.split("# timeline")[0].replace("S = Path(sys.argv[1]); OFF = float(sys.argv[2]); DUR = OFF + 107.58 + 0.4", f"S = Path({str(S)!r}); OFF = 0; DUR = {DUR_}")
music = src.split("# ---------------- music bed")[1].split("\n", 1)[1].split("def save")[0]
ns = {}; exec(defs, ns)
g = ns; np = g["np"]; SR = g["SR"]; DUR = g["DUR"]
def put(buf, t0, s):
    st = int(t0 * SR)
    if st >= len(buf): return
    e = min(len(buf), st + len(s)); buf[st:e] += s[:e - st]
def squelch(gain=0.5):
    t = g["tt"](0.35)
    return (g["lp"](g["noise"](0.35), 0.08) * 3 * np.exp(-t * 12) + g["sweep"](300, 90, 0.35) * np.exp(-t * 10) * 0.4) * gain
s4, s5, s10 = L[4]["start"], L[5]["start"], L[10]["start"]
b5 = s5 + 2.45
a8 = L[6]["end"] + 0.1
E = [(0.3, g["splash"](0.6, 0.6)), (0.4, g["bubbles"](0.8, 5, 0.15)), (1.55, g["plop"](700, 300, 0.1, 0.25)),
     (L[1]["start"] + 3.75, g["whoosh"](0.35, 0.2)),                       # Boltu swings his arms up to jump
     (L[1]["end"] + 0.3, g["boing"](0.2)),                                 # Bithi's hand on his shoulder: freeze
     (L[3]["end"] + 0.15, g["whoosh"](0.45, 0.25)),                        # cut to the board
     (L[3]["end"] + 0.3, g["pop"](0.2)), (s4 + 2.7, g["ding"](990, 0.2)), (s4 + 3.4, g["ding"](1320, 0.22)),
     (s4 + 5.6, g["pop"](0.22)), (s4 + 7.1, g["chime"](0.25)), (s5 + 0.9, g["ding"](1180, 0.22)), (s5 + 1.2, g["pop"](0.2)),
     (b5, g["whoosh"](0.3, 0.15)), (b5 + 0.3, g["pop"](0.2)), (s5 + 4.4, g["ding"](880, 0.22)),
     (L[5]["end"] + 0.18, g["whoosh"](0.4, 0.2)),
     (a8 + 0.42, g["splash"](0.6, 0.6)), (a8 + 0.5, g["bubbles"](0.8, 5, 0.15)),
     (L[7]["start"] - 0.1, squelch(0.5)), (L[7]["end"] - 0.1, g["whoosh"](0.25, 0.15)), (L[7]["end"] + 0.18, squelch(0.35)),
     (L[8]["end"] + 0.25, g["whoosh"](0.3, 0.15)), (L[9]["start"] + 0.4, g["pop"](0.25)),
     (L[9]["end"] + 0.25, g["whoosh"](0.4, 0.25)), (s10 + 0.5, g["ding"](1320, 0.2)), (s10 + 1.4, g["pop"](0.25)), (s10 + 2.9, g["pop"](0.25)), (s10 + 3.8, g["chime"](0.25)),
     (VEND, g["whoosh"](0.5, 0.3)), (VEND + 0.1, g["chime"](0.3)), (VEND + 0.4, g["pop"](0.22)), (VEND + 0.6, g["pop"](0.22)), (VEND + 0.8, g["pop"](0.22))]
sfx = np.zeros(int(DUR * SR))
for t0, s in E: put(sfx, t0, s)
# pond ambience on every ghat shot: soft water lapping + occasional bird chirps
tt = g["tt"](DUR)
water = g["lp"](g["noise"](DUR), 0.02) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.23 * tt)) * 1.2
def mask(ranges):
    m_ = np.zeros(len(sfx))
    for a, b in ranges:
        i0, i1 = int(a * SR), int(min(b, DUR) * SR); m = np.ones(i1 - i0); r = int(0.3 * SR); m[:r] = np.linspace(0, 1, r); m[-r:] = np.linspace(1, 0, r); m_[i0:i1] = m
    return m_
ghat = [(0, L[3]["end"] + 0.15), (L[5]["end"] + 0.18, L[9]["end"] + 0.25)]
sfx += water * mask(ghat) * 0.10
rng = np.random.default_rng(3)
for t0 in np.arange(2.0, DUR, 3.7):
    if any(a < t0 < b for a, b in ghat):
        t = g["tt"](0.12); put(sfx, t0 + rng.uniform(0, 1), np.sin(2 * np.pi * (2600 + 900 * np.sin(2 * np.pi * 18 * t)) * t) * np.exp(-t * 25) * 0.05)
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
