"""Score + foley + voice mix for Short 16 (rainbow / রংধনু, Newton cameo) -> out/mix.wav (48 kHz stereo).
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
# bouncy opening (Mama's sugar suspicion), lighter under the explanation, hard cut into the cold pause
section(0, SH["chew"][0], lead=[(0, 72, .5), (.5, 74, .5), (1, 76, 1), (2, 79, .5), (2.5, 77, .5), (3, 76, 1), (6, 74, .5), (6.5, 72, .5), (7, 71, 1)], g=.5)
section(SH["chew"][0], SH["mouth"][0], drums=False, g=.35)
section(SH["mouth"][0], SH["tea"][0], drums=False, g=.4)
section(SH["tea"][0], SH["pause"][0] - .05, lead=[(0, 79, .5), (.5, 77, .5), (1, 76, .5), (1.5, 74, .5)], g=.6)   # music stops at the cold pause
section(SH["puzzle"][0], T["VEND"], lead=[(0, 72, .5), (.5, 76, .5), (1, 79, 1), (4, 77, .5), (4.5, 74, .5), (5, 72, 1.5)], drums=True, g=.5)
ding(T["pop"])                                                  # the rice tastes sweet (frame-1 event)
for k, m in enumerate([84, 88, 91, 96]): put(mus, T["pop"] + .05 + k * .06, xylo(m, .05))
for k, m in enumerate([84, 88, 91, 96, 100]): put(mus, T["sweetB"] + k * .07, xylo(m, .06))   # sweetness reaches Boltu
slide_whistle(T["zoom0"], .45, up=False)                        # dive into the mouth
for k, m in enumerate([79, 83, 86, 91, 95, 98]): put(mus, T["sugar"] + k * .06, xylo(m, .05))  # maltose sparkles
boing(T["shots"][[s[2] for s in T["shots"]].index("deadpan")][0] + .7, g=.08)
wahwah(L["m4"]["t1"] + .05)                                     # "…পানসা।" landed
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
def step(g=.12): t = tt(.08); return lp(rng.standard_normal(len(t)), 500) * np.exp(-t * 50) * g
def chomp(g=.10): t = tt(.07); return bp(rng.standard_normal(len(t)), 700, 2500) * np.exp(-t * 60) * g
def snip(g=.25): t = tt(.06); return (bp(rng.standard_normal(len(t)), 3000, 9000) + np.sin(2 * np.pi * 3200 * t)) * np.exp(-t * 70) * g
def clink(g=.15): t = tt(.4); return (np.sin(2 * np.pi * 2400 * t) + .5 * np.sin(2 * np.pi * 3700 * t)) * np.exp(-t * 18) * g
def slurp(g=.12): t = tt(.5); return bp(rng.standard_normal(len(t)), 500, 3000) * np.sin(np.pi * t / .5) * (.5 + .5 * np.sin(2 * np.pi * 14 * t)) * g
for k in range(4): put(fx, .05 + k * .24, chomp(.08))           # Mama chewing in frame 1
put(fx, T["spoonB"] - .25, clink())                            # Boltu's spoon on the plate
for k in range(3): put(fx, T["spoonB"] + .2 + k * .24, chomp())
for k in range(int((T["sweetB"] - T["chew0"]) / .22)): put(fx, T["chew0"] + .1 + k * .22, chomp(.12))   # the long chew
t = tt(.12); put(fx, T["chew0"] + .2, np.sin(2 * np.pi * 1000 * t) * np.exp(-t * 60) * .06)
for k in range(8): put(fx, SH["turn"][0] + k * .27, step(.1))     # Bithi walks in
for k in range(3): put(fx, SH["enter"][0] + .1 + k * .25, step(.1))
for k in range(4): put(fx, T["cut"] + k * .08, snip())            # ptyalin snips the chain
put(fx, T["sip"], slurp())
for k in range(6): put(fx, T["sip"] + .4 + k * .22, chomp(.1))    # chewing tea in the cold pause
put(fx, e0 + .15, whoosh(.5, .2))
# hotel ambience: low room tone + distant road; low inside the mouth, the cold pause and the end card
amb = lp(rng.standard_normal(N), 350) * .03
m = np.ones(N)
for a_, b_ in (SH["mouth"], (e0, DUR)): m[int(a_ * SR):int(b_ * SR)] = .15
m[int(SH["pause"][0] * SR):int(SH["pause"][1] * SR)] = .6
amb *= lp(m, 5)

# ---------------- voice ----------------
vo = np.zeros(N); x, sr = sf.read("voices/vo.wav"); x = x[:N]; vo[:len(x)] = x
def comp(x, th=.12, ratio=3.5):
    e = np.abs(x); e = lp(e, 30); g = np.where(e > th, (th + (e - th) / ratio) / np.maximum(e, 1e-9), 1); return x * g
vo = comp(vo); vo = hp(vo, 90)
d = int(.018 * SR); vo[d:] += .12 * vo[:-d]
# duck the music under dialogue (~ -7 dB)
act = np.zeros(N)
for l in TL["lines"]: act[int(l["t0"] * SR):int(l["t1"] * SR)] = 1
duck = 1 - .55 * lp(act, 3)
mix = vo * 1.0 + mus * .55 * duck + fx * .55 + amb
mix = mix / (np.abs(mix).max() + 1e-9) * .9
st = np.stack([mix, mix], 1)
os.makedirs("out", exist_ok=True); sf.write("out/mix.wav", st.astype(np.float32), SR)
print("mix", DUR, "s")
