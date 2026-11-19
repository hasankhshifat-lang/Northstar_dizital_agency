"""Score + foley + voice mix for Short 11 (rust / মরিচা) -> out/mix.wav (48 kHz stereo).
Score: comic cartoon style (owner 2026-11-18), see the score section;
oom-pah tuba, pizzicato, xylophone, kazoo lead, woodblocks, gag stingers, 132 BPM, C major. Hard cut in the cold pause.
A Karplus-Strong dotara-like pluck on the end card for a Bangla touch. Foley is synthesized at the cue times."""
import json, os, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
HERE = os.path.dirname(os.path.abspath(__file__)); os.chdir(HERE)
SR = 48000; T = json.load(open("cues.json")); TL = json.load(open("timeline.json"))
DUR = T["DUR"]; N = int(DUR * SR); rng = np.random.default_rng(9)
SH = {n: (a, b) for a, b, n in T["shots"]}
def tt(d): return np.arange(int(d * SR)) / SR
def put(buf, t0, x, g=1.0):
    i = int(t0 * SR);
    if i >= len(buf): return
    e = min(len(buf), i + len(x)); buf[i:e] += x[:e - i] * g
def lp(x, f): return sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x)
def hp(x, f): return sosfilt(butter(2, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b): return sosfilt(butter(2, [a, b], 'band', fs=SR, output='sos'), x)
def env(n, a=.005, r=.1):
    e = np.ones(n); ia = max(1, int(a * SR)); ir = max(1, int(r * SR)); e[:ia] = np.linspace(0, 1, ia); e[-ir:] *= np.linspace(1, 0, min(ir, n)); return e
mid = lambda m: 440 * 2 ** ((m - 69) / 12)

# ---------------- score: comic cartoon style (owner 2026-11-18: "use comic style musics") ----------------
# C major / F major, 132 BPM, bouncy and staccato: oom-pah tuba bass, pizzicato chords, xylophone runs, a kazoo-like
# reedy lead, woodblock/temple-block + snare-brush groove; gag stingers (slide whistle, wah-wah trombone, boing, ding).
# Hard music cut into the cold pause stays (comedy grammar).
BPM = 132; BEAT = 60 / BPM
mus = np.zeros(N)
PROG = [(60, [0, 4, 7]), (65, [0, 4, 7]), (67, [0, 4, 7, 10]), (60, [0, 4, 7])]   # C  F  G7  C
def tuba(m, d=.28, g=.20):
    n = int(d * SR); t = np.arange(n) / SR; f = mid(m - 24)
    ph = 2 * np.pi * f * t; x = np.sin(ph) + .5 * np.sin(2 * ph) + .25 * np.sin(3 * ph)
    return lp(x * np.minimum(1, t / .015) * np.exp(-t * 5), 900) * g
def pizz(m, g=.05):
    t = tt(.25); f = mid(m); return (np.sin(2 * np.pi * f * t) + .4 * np.sin(4 * np.pi * f * t)) * np.exp(-t * 22) * g
def xylo(m, g=.07):
    t = tt(.35); f = mid(m); return (np.sin(2 * np.pi * f * t) + .3 * np.sin(2 * np.pi * 3.93 * f * t) * np.exp(-t * 30)) * np.exp(-t * 14) * g
def wood(f=1100, g=.09): t = tt(.06); return np.sin(2 * np.pi * f * t) * np.exp(-t * 90) * g
def brush(g=.035): t = tt(.1); return hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 35) * g
def kick(g=.18): t = tt(.15); return np.sin(2 * np.pi * (50 + 70 * np.exp(-t * 35)) * t) * np.exp(-t * 20) * g
def kazoo(notes, gain=.07):                                                 # reedy buzzing lead (square + nasal formant)
    out = np.zeros(N)
    for t0, m, d in notes:
        n = int(d * SR); t = np.arange(n) / SR
        vib = 1 + .012 * np.sin(2 * np.pi * 6 * t)
        ph = np.cumsum(mid(m) * vib) / SR
        x = np.sign(np.sin(2 * np.pi * ph)) * .6 + np.sin(2 * np.pi * ph)
        x = bp(x, 500, 2600) + .3 * bp(rng.standard_normal(n), 800, 1600) * .05
        put(out, t0, x * env(n, .02, .06), gain)
    return out
def section(a, b, lead=None, drums=True, g=1.0, xyl=True):
    t = a; k = 0
    while t < b - 1e-6:
        bar = int((t - a) / (4 * BEAT)) % 4; r, ivs = PROG[bar]; beat = k % 4
        put(mus, t, tuba(r if beat in (0, 2) and k % 8 < 4 else r + 7 if beat in (0, 2) else r), g) if beat in (0, 2) else None
        if beat in (1, 3):                                                  # the "pah": pizzicato chord on the off-beat
            for iv in ivs[:3]: put(mus, t, pizz(r + iv), g)
        if xyl and k % 8 == 7:                                              # little xylophone run into each bar
            for j, iv in enumerate([0, 4, 7, 12]): put(mus, t - BEAT * .5 + j * BEAT / 8, xylo(r + 12 + iv), g * .8)
        if drums:
            if beat == 0: put(mus, t, kick(), g)
            put(mus, t, wood(1100 if beat % 2 == 0 else 800), g); put(mus, t + BEAT / 2, brush(), g)
        t += BEAT; k += 1
    if lead: put(mus, 0, kazoo([(a + x * BEAT, m, d * BEAT) for x, m, d in lead]), g)
# gag stingers
def slide_whistle(t0, d=.45, up=True, g=.10):
    t = tt(d); f = (700 + 1100 * (t / d)) if up else (1800 - 1100 * (t / d)); put(mus, t0, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) * g)
def wahwah(t0, g=.10):                                                      # sad trombone: 4 falling notes, last one wobbles
    for j, (m, d) in enumerate([(58, .28), (57, .28), (56, .28), (55, .9)]):
        n = int(d * SR); tt_ = np.arange(n) / SR; vib = 1 + (.03 * np.sin(2 * np.pi * 7 * tt_) if j == 3 else 0)
        ph = np.cumsum(mid(m) * vib) / SR; x = lp(np.sign(np.sin(2 * np.pi * ph)) + np.sin(4 * np.pi * ph), 1400)
        put(mus, t0 + j * .3, x * env(n, .03, .12), g)
def boing(t0, g=.14): t = tt(.5); f = 180 + 120 * np.sin(2 * np.pi * 9 * t) * np.exp(-t * 5); put(mus, t0, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5) * g)
def ding(t0, g=.12): t = tt(1.0); put(mus, t0, (np.sin(2 * np.pi * 2093 * t) + .4 * np.sin(2 * np.pi * 4186 * t)) * np.exp(-t * 4) * g)
L = {l["id"]: l for l in TL["lines"]}
section(0.0, SH["enter"][0], lead=[(0, 72, .5), (.5, 74, .5), (1, 76, 1), (2, 79, .5), (2.5, 76, .5), (3, 72, 1), (6, 77, .5), (6.5, 76, .5), (7, 74, 1)], g=.85)
section(SH["enter"][0], SH["lapse"][0], lead=[(0, 67, .5), (.5, 69, .5), (1, 72, 1), (4, 74, .5), (4.5, 72, .5), (5, 71, 1), (8, 72, .5), (8.5, 76, .5), (9, 79, 1.5)], g=.6)
section(SH["lapse"][0], SH["board"][0], lead=[(0, 72, .25), (.25, 74, .25), (.5, 76, .25), (.75, 77, .25), (1, 79, .25), (1.25, 81, .25), (1.5, 83, .25), (1.75, 84, 1)], g=.8)   # time-lapse run
section(SH["board"][0], SH["gosol"][0], drums=False, g=.5)            # lighter under the explanation
section(SH["gosol"][0], SH["pause"][0] + .02, lead=[(0, 79, .5), (.5, 77, .5), (1, 76, .5), (1.5, 74, .5), (2, 72, 1)], g=.85)   # hard cut -> cold pause
section(SH["puzzle"][0], T["VEND"], lead=[(0, 72, .5), (.5, 76, .5), (1, 79, 1), (4, 77, .5), (4.5, 74, .5), (5, 72, 1.5)], drums=True, g=.55)
ding(T["flake"] + .1, g=.08)                          # first flake drops
slide_whistle(T["hide"] - .05, .35, up=False)         # new dao whipped behind his back
ding(T["hide"] + .35, g=.10)                          # glint
ding(T["lapse1"] - .15, g=.12)                        # only jar 3 rusted: the clue
ding(L["t3"]["t1"] - 1.2, g=.10)                      # "রোগ না"
wahwah(L["b4"]["t1"] + .05)                           # deadpan landed
def pluck(f0, d=1.2, g=.25):
    n = int(d * SR); L_ = int(SR / f0); buf = rng.uniform(-1, 1, L_); out = np.zeros(n)
    for i in range(n): out[i] = buf[i % L_]; buf[i % L_] = .5 * (buf[i % L_] + buf[(i + 1) % L_]) * .996
    return out * g
e0 = T["VEND"]
for k, m in enumerate([62, 66, 69, 74, 78]): put(mus, e0 + .1 + k * .18, pluck(mid(m)))   # dotara-like pluck, major
section(e0, DUR, lead=[(0, 72, .5), (.5, 76, .5), (1, 79, .5), (1.5, 84, 1.5)], drums=True, g=.8)

# ---------------- foley ----------------
fx = np.zeros(N)
def whoosh(d=.4, g=.25): t = tt(d); return bp(rng.standard_normal(len(t)), 400, 2500) * np.sin(np.pi * t / d) * g
def tick(g=.2): t = tt(.05); return bp(rng.standard_normal(len(t)), 2000, 6000) * np.exp(-t * 80) * g
def clink(g=.2): t = tt(.7); return (np.sin(2 * np.pi * 3100 * t) + .6 * np.sin(2 * np.pi * 4700 * t) + .3 * np.sin(2 * np.pi * 7300 * t)) * np.exp(-t * 8) * g
def thunk(g=.4): t = tt(.2); return (np.sin(2 * np.pi * 90 * t) * np.exp(-t * 25) + bp(rng.standard_normal(len(t)), 200, 1200) * np.exp(-t * 40) * .5) * g
def scrape(d=.45, g=.25): t = tt(d); return bp(rng.standard_normal(len(t)), 300, 2000) * (.6 + .4 * np.sin(2 * np.pi * 30 * t)) * np.sin(np.pi * t / d) * g
def step(g=.12): t = tt(.08); return lp(rng.standard_normal(len(t)), 500) * np.exp(-t * 50) * g
for k in range(3): put(fx, T["flake"] + k * .35 + .35, tick(.18))                         # flakes hit the floor
t = tt(.25); put(fx, .9, bp(rng.standard_normal(len(t)), 300, 1500) * np.sin(np.pi * t / .25) * .1)   # Mama's gasp-ish breath
for k in range(4): put(fx, SH["boltuQ"][0] + k * .17, step())
put(fx, T["hide"], whoosh(.3, .35))
for k in range(8): put(fx, SH["enter"][0] + .3 + k * .25, step(.1))
for k in range(3): put(fx, SH["enter"][0] + .4 + k * .5, clink(.06))
put(fx, T["setDown"], thunk()); put(fx, T["setDown"] + .05, clink(.15))
for tj in (T["j1"], T["j2"], T["j3"]): put(fx, tj, clink(.12))
for k in range(int((T["lapse1"] - T["lapse0"]) / .12)): put(fx, T["lapse0"] + k * .12, tick(.12))   # clock ticking fast
put(fx, T["lapse0"], whoosh(.6, .2))
t = tt(.12); blip = np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 40) * .16
for k in range(10): put(fx, SH["board"][0] + .7 + k * .35, blip * .6)                       # molecules land on the iron
put(fx, T["bucket"], scrape())
t = tt(1.2); put(fx, SH["puzzle"][0] + .4, lp(np.sign(np.sin(2 * np.pi * 220 * t)) * np.sin(np.pi * t / 1.2), 900) * .08)   # launch horn
put(fx, e0 + .15, whoosh(.5, .2))
# haat ambience: distant market murmur + river lapping + forge crackle; low on the board, the cold pause and the end card
amb = lp(rng.standard_normal(N), 600) * .04 + bp(rng.standard_normal(N), 2000, 5000) * (rng.random(N) > .9995) * .4
m = np.ones(N)
for a, b in (SH["board"], (e0, DUR)): m[int(a * SR):int(b * SR)] = .15
m[int(SH["pause"][0] * SR):int(SH["pause"][1] * SR)] = .6
amb *= lp(m, 5)

# ---------------- voice ----------------
vo = np.zeros(N); x, sr = sf.read("voices/vo.wav"); x = x[:N]; vo[:len(x)] = x
def comp(x, th=.12, ratio=3.5):
    e = np.abs(x); e = lp(e, 30); g = np.where(e > th, (th + (e - th) / ratio) / np.maximum(e, 1e-9), 1); return x * g
vo = comp(vo); vo = hp(vo, 90)
d = int(.018 * SR); vo[d:] += .12 * vo[:-d]                          # short early reflection: voices sit in the space
# duck the music under dialogue (~ -7 dB)
act = np.zeros(N)
for l in TL["lines"]: act[int(l["t0"] * SR):int(l["t1"] * SR)] = 1
duck = 1 - .55 * lp(act, 3)
mix = vo * 1.0 + mus * .55 * duck + fx * .55 + amb
mix = mix / (np.abs(mix).max() + 1e-9) * .9
st = np.stack([mix, mix], 1)
os.makedirs("out", exist_ok=True); sf.write("out/mix.wav", st.astype(np.float32), SR)
print("mix", DUR, "s")
