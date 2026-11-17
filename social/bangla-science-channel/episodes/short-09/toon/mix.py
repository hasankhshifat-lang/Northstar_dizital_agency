"""Score + foley + voice mix for Short 9 (tablecloth / inertia) -> out/mix.wav (48 kHz stereo).
Score (style §7): theremin-like lead (sine + 2nd/3rd harmonics, portamento, delayed vibrato) over analog bass,
a square-wave arpeggio and a drum machine, 120 BPM, D minor. Hard cuts: on the splat reveal and in the cold pause.
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

# ---------------- score ----------------
BPM = 120; BEAT = 60 / BPM
mus = np.zeros(N)
def theremin(notes, gain=.16):   # notes: [(t, midi, dur)] legato with portamento
    out = np.zeros(N)
    for i, (t0, m, d) in enumerate(notes):
        n = int(d * SR); t = np.arange(n) / SR
        prev = notes[i - 1][1] if i else m
        f = mid(m) + (mid(prev) - mid(m)) * np.exp(-t / .07)
        vib = 1 + .012 * np.sin(2 * np.pi * 5.5 * t) * np.clip((t - .15) / .2, 0, 1)
        ph = 2 * np.pi * np.cumsum(f * vib) / SR
        x = (np.sin(ph) + .25 * np.sin(2 * ph) + .1 * np.sin(3 * ph)) * env(n, .04, .12)
        put(out, t0, x, gain)
    d = int(.045 * SR); out[d:] += .25 * out[:-d]   # small spring-ish slap
    return out
def bass(t0, m, d, g=.22):
    n = int(d * SR); t = np.arange(n) / SR; f = mid(m)
    x = np.sign(np.sin(2 * np.pi * f * t)) * .5 + np.sin(2 * np.pi * f * t) + .4 * np.sin(4 * np.pi * f * t)
    return lp(x * env(n, .005, .08), 900) * g
def sq(t0, m, d, g=.05):
    n = int(d * SR); t = np.arange(n) / SR
    return np.sign(np.sin(2 * np.pi * mid(m) * t)) * env(n, .002, .05) * np.exp(-t * 6) * g
def kick(): t = tt(.25); return np.sin(2 * np.pi * (50 + 90 * np.exp(-t * 30)) * t) * np.exp(-t * 14) * .5
def snare(): t = tt(.18); return (bp(rng.standard_normal(len(t)), 1500, 6000) * .5 + np.sin(2 * np.pi * 190 * t) * .3) * np.exp(-t * 22) * .35
def hat(): t = tt(.05); return bp(rng.standard_normal(len(t)), 7000, 11000) * np.exp(-t * 80) * .12
def section(a, b, root=62, lead=None, drums=True, g=1.0):
    seq = [0, 3, 7, 10, 7, 3, 0, -2]                          # D minor arpeggio steps
    prog = [0, 0, -4, -2]                                     # i  i  VI  VII
    t = a; k = 0
    while t < b - 1e-6:
        bar = int((t - a) / (4 * BEAT)) % 4; r = root + prog[bar]
        if k % 2 == 0: put(mus, t, bass(t, r - 24, BEAT * .9), g)
        put(mus, t, sq(t, r + seq[k % 8], BEAT / 2 * .9), g)
        if drums:
            if k % 4 == 0: put(mus, t, kick(), g)
            if k % 4 == 2: put(mus, t, snare(), g)
            put(mus, t, hat(), g)
        t += BEAT / 2; k += 1
    if lead: put(mus, 0, theremin([(a + x * BEAT, m, d * BEAT) for x, m, d in lead]), g)
L = {l["id"]: l for l in TL["lines"]}
crash0 = T["items"][0]["tl"]
# opening groove up to the first crash: hard music cut on the smash (the reveal of the wrong way)
section(0.0, crash0, lead=[(0, 74, 1), (1, 69, .5), (1.5, 70, 1), (2.5, 72, 1.5)], drums=True)
section(SH["mamaCU"][0], SH["summonWide"][0], root=62, lead=[(0, 69, 2), (2, 72, 1), (3, 70, 1), (4, 69, 2), (6, 65, 2), (8, 67, 2), (10, 69, 4)], g=.75)
# portal: rising saws swell into the summon
a, b = SH["summonWide"][1] - 1.2, SH["portal"][1]; t = tt(b - a); f = np.linspace(mid(62), mid(74), len(t))
saw = sum((2 * ((np.cumsum(f * dt) / SR) % 1) - 1) for dt in (1, 1.004, .996)) / 3
put(mus, a, lp(saw * (1 + .4 * np.sin(2 * np.pi * 12 * t)), 3000) * np.clip(t / (b - a), 0, 1) * .12)
section(SH["newtonCU"][0], SH["yank"][0], root=62, lead=[(0, 62, 2), (2, 65, 2), (4, 69, 4), (8, 67, 2), (10, 65, 2), (12, 64, 2.5), (16, 62, 4)], drums=False, g=.65)
# yank: drums + a short triumphant phrase, then the cold pause (no music) before Mama's deadpan
section(T["yank"] + .05, SH["pause"][0], root=62, lead=[(0, 74, .5), (.5, 78, .5), (1, 81, 1.5)], drums=True, g=.85)
section(SH["puzzle"][0], T["VEND"], root=62, lead=[(0, 69, 2), (2, 67, 2), (4, 65, 2), (6, 64, 2)], drums=False, g=.6)
def pluck(f0, d=1.2, g=.25):
    n = int(d * SR); L_ = int(SR / f0); buf = rng.uniform(-1, 1, L_); out = np.zeros(n)
    for i in range(n): out[i] = buf[i % L_]; buf[i % L_] = .5 * (buf[i % L_] + buf[(i + 1) % L_]) * .996
    return out * g
e0 = T["VEND"]
for k, m in enumerate([62, 69, 74, 72, 74]): put(mus, e0 + .1 + k * .18, pluck(mid(m)))
section(e0, DUR, root=62, lead=[(0, 74, 1), (1, 78, 1), (2, 81, 1.8)], drums=True, g=.8)

# ---------------- foley ----------------
fx = np.zeros(N)
def whoosh(d=.4, g=.25): t = tt(d); return bp(rng.standard_normal(len(t)), 400, 2500) * np.sin(np.pi * t / d) * g
def smash(kind):
    t = tt(.9); base = bp(rng.standard_normal(len(t)), 2500, 9000) * np.exp(-t * 6) * .55
    tinkle = sum(np.sin(2 * np.pi * (2400 + 2600 * rng.random()) * t) * np.exp(-t * (14 + 10 * rng.random())) * (t > .03 * k) for k in range(6)) * .05
    thud = np.sin(2 * np.pi * (70 + 60 * np.exp(-t * 30)) * t) * np.exp(-t * 18) * .5
    return base + tinkle + thud * (1.3 if kind == "jug" else 1)
t = tt(T["pd"]); put(fx, T["ps"], bp(rng.standard_normal(len(t)), 800, 4000) * np.sin(np.pi * t / T["pd"]) * .12)   # cloth drag
for it in T["items"]: put(fx, it["tl"], smash(it["kind"]), .9)
po = T["pOpen"]; t = tt(1.2)
put(fx, po, np.sin(2 * np.pi * (38 + 30 * np.exp(-t * 4)) * t) * np.exp(-t * 3) * .7)
put(fx, po, bp(rng.standard_normal(len(t)), 300, 3000) * np.linspace(1, 0, len(t)) * .25)
t = tt(max(.3, T["pClose"] - po)); put(fx, po + .2, np.sin(2 * np.pi * np.cumsum(220 + 30 * np.sin(2 * np.pi * 3 * t)) / SR) * .06)
t = tt(.25); put(fx, T["pClose"], np.sin(2 * np.pi * (90 * np.exp(-t * 8)) * t) * np.exp(-t * 12) * .5)
t = tt(.12); blip = np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 40) * .18
put(fx, T["label"], blip)
t = tt(.05); put(fx, T["coinFlick"], bp(rng.standard_normal(len(t)), 2000, 8000) * np.exp(-t * 90) * .5)   # flick
put(fx, T["coinFlick"] + .01, whoosh(.25, .18))
t = tt(.8); clink = (np.sin(2 * np.pi * 3100 * t) + .6 * np.sin(2 * np.pi * 4700 * t) + .3 * np.sin(2 * np.pi * 7300 * t)) * np.exp(-t * 7) * .22
put(fx, T["coinLand"], clink); put(fx, T["coinLand"] + .09, clink * .35)
ra = SH["replay"][0]
for k in range(7): put(fx, ra + .2 + k * .32, blip * .7)
ea = L["t3"]["t0"]; put(fx, ea + .2, whoosh(2.2, .07)); put(fx, ea + (L["t3"]["t1"] - ea) * .55, whoosh(.2, .22))
put(fx, T["yank"], whoosh(.22, .45))
t = tt(.4); put(fx, T["yank"] + .12, (np.sin(2 * np.pi * 1900 * t) + np.sin(2 * np.pi * 2450 * t)) * np.exp(-t * 18) * .08)
put(fx, e0 + .15, whoosh(.5, .2))
# pandal ambience: crowd murmur bed, low on the screens, the cold pause and the end card
amb = lp(rng.standard_normal(N), 700) * .05
m = np.ones(N)
for a, b in (SH["replay"], SH["explain"], (e0, DUR)): m[int(a * SR):int(b * SR)] = .15
m[int(SH["pause"][0] * SR):int(L["m4"]["t0"] * SR)] = .5
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
mix = vo * 1.0 + mus * .42 * duck + fx * .55 + amb
mix = mix / (np.abs(mix).max() + 1e-9) * .9
st = np.stack([mix, mix], 1)
os.makedirs("out", exist_ok=True); sf.write("out/mix.wav", st.astype(np.float32), SR)
print("mix", DUR, "s")
