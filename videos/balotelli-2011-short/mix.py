"""Sound for the "Night Match Toon" style (Foot All FC): VibeVoice narration + synthesized stadium foley on the page's events
+ an original synthesized sports score (drums, bass, pads, keys), all made here in numpy (no samples).
Run from the library root ($LIB):  .venv/bin/python <project>/mix.py --events out/events.json --out out/mix.wav
Score sections come from 'mus' events: A (groove) -> build (rising kicks + riser) -> hush (heartbeat in the slow motion)
-> drop (the goal: full drums + bright chords) -> soft (flashback: warm keys) -> A2 (groove) -> end (held chord).
"""
import json, os, sys, argparse
import numpy as np, soundfile as sf
from scipy.signal import resample_poly
LIB = os.environ['LIB']
sys.path.insert(0, LIB)
from core.audio.sfx import SR, bp, lp, hp, add, compress, limit, click, whoosh, thump, t_, norm, ding

ap = argparse.ArgumentParser(); ap.add_argument('--events', default='out/events.json'); ap.add_argument('--out', default='out/mix.wav')
A = ap.parse_args()
HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, A.events)))
DUR = float(D['dur']); EV = D['ev']; N = int(round(DUR * SR))
rng = np.random.default_rng(7)
fx = np.zeros((N, 2)); vo = np.zeros((N, 2)); crowd = np.zeros((N, 2)); music = np.zeros((N, 2))

# ---------------------------------------------------------------- foley
def kick_ball(v=1.0):
    tt = t_(0.25)
    return norm(np.sin(2 * np.pi * 130 * tt * (1 - 1.2 * tt)) * np.exp(-tt / .03) + hp(rng.standard_normal(len(tt)), 900) * np.exp(-tt / .008) * .7) * v
def net(v=1.0):
    n = int(.7 * SR); tt = np.arange(n) / SR
    return norm(bp(rng.standard_normal(n), 1500, 6000) * np.exp(-tt / .18) * (1 + .5 * np.sin(2 * np.pi * 14 * tt))) * v
def whistle(v=1.0):
    tt = t_(0.6); f = 2900 + 120 * np.sin(2 * np.pi * 38 * tt)
    x = np.sin(np.cumsum(f) / SR * 2 * np.pi) * (1 + .3 * np.sin(2 * np.pi * 38 * tt))
    return x * np.minimum(1, tt / .02) * np.minimum(1, (.6 - tt) / .05) * v
def roar(d, v=1.0):
    n = int(d * SR); tt = np.arange(n) / SR
    env = np.minimum(1, tt / .15) * np.exp(-np.maximum(0, tt - .8) / (d * .45))
    x = bp(rng.standard_normal(n), 250, 2600) + .4 * bp(rng.standard_normal(n), 1500, 5000)
    return x * (1 + .15 * np.sin(2 * np.pi * 3.1 * tt)) * env * v
def groan(v=1.0):
    n = int(1.4 * SR); tt = np.arange(n) / SR
    return bp(rng.standard_normal(n), 150, 1100) * np.sin(np.pi * tt / 1.4) * v
def swoosh(v=1.0):
    n = int(.32 * SR); tt = np.arange(n) / SR
    f = np.linspace(600, 4000, n); x = rng.standard_normal(n)
    return hp(bp(x, 500, 6000), 400) * np.sin(np.pi * tt / .32) ** 2 * v
def pop(v=1.0):
    tt = t_(.12); f = 500 + 900 * tt / .12
    return np.sin(np.cumsum(f) / SR * 2 * np.pi) * np.exp(-tt / .04) * v
def hit(v=1.0):   # impact for big words: sub thump + snap
    tt = t_(.6)
    return norm(np.sin(2 * np.pi * 55 * tt * (1 - .5 * tt)) * np.exp(-tt / .18) + hp(rng.standard_normal(len(tt)), 2000) * np.exp(-tt / .02) * .5) * v
def boom(v=1.0):
    tt = t_(1.4)
    return norm(np.sin(2 * np.pi * 42 * tt * (1 - .3 * tt)) * np.exp(-tt / .5) + lp(rng.standard_normal(len(tt)), 300) * np.exp(-tt / .3) * .4) * v
def tick(v=1.0):
    return hp(click(pitch=1.4, v=1), 1200) * v
def slowmo(v=1.0):   # a pitch dive into the slow motion
    n = int(.9 * SR); tt = np.arange(n) / SR; f = 900 * (80 / 900) ** (tt / .9)
    return (np.sin(np.cumsum(f) / SR * 2 * np.pi) * .5 + lp(rng.standard_normal(n), 800) * .3) * np.exp(-tt / .5) * v
def crash(v=1.0):
    n = int(2.5 * SR); tt = np.arange(n) / SR
    return hp(rng.standard_normal(n), 4000) * np.exp(-tt / .7) * v

def fizz(v=1.0):   # a rocket going up: rising hiss
    n = int(.5 * SR); tt = np.arange(n) / SR
    return hp(rng.standard_normal(n), 2500) * np.minimum(1, tt / .05) * np.exp(-tt / .35) * (1 + .5 * np.sin(2 * np.pi * 40 * tt)) * v
def bang(v=1.0):  # the burst: thump + crackles
    tt = t_(1.3); x = norm(np.sin(2 * np.pi * 70 * tt * (1 - .4 * tt)) * np.exp(-tt / .12) + lp(rng.standard_normal(len(tt)), 900) * np.exp(-tt / .08))
    cr = (rng.random(len(tt)) < .004) * rng.standard_normal(len(tt)) * np.exp(-tt / .5)
    return (x + hp(cr, 3000) * 2.5) * v
def crackle(d, v=1.0):  # fire crackle bed
    n = int(d * SR); tt = np.arange(n) / SR
    x = (rng.random(n) < .002) * rng.standard_normal(n); x = hp(x, 1500) * 3 + lp(rng.standard_normal(n), 400) * .25
    return x * np.minimum(1, tt / .5) * np.minimum(1, (d - tt) / 1.0) * v
def siren(d, v=1.0):  # two-tone siren, fading in
    n = int(d * SR); tt = np.arange(n) / SR; f = np.where((tt % 1.0) < .5, 720, 960)
    x = np.sign(np.sin(np.cumsum(f) / SR * 2 * np.pi)) * .5; x = lp(x, 2500)
    return x * np.minimum(1, tt / 1.2) * np.minimum(1, (d - tt) / .5) * v
def register(v=1.0):  # cash-register ding
    return ding(1.0) * v

for e in EV:
    t, k = e['t'], e['type']
    if k == 'vo':
        y, sr = sf.read(os.path.join(HERE, 'vo', e['id'] + '.wav'), dtype='float32')
        if y.ndim > 1: y = y.mean(1)
        if sr != SR: y = resample_poly(y, SR, sr)
        add(vo, y, t, 1, 0)
    elif k == 'kick': add(fx, kick_ball(.5), t, 1, -.1)
    elif k == 'kickSoft': add(fx, kick_ball(.32), t, 1, 0)
    elif k == 'net': add(fx, net(.3), t, 1, .2)
    elif k == 'whistle': add(fx, whistle(.25), t, 1, .3)
    elif k == 'roar': add(crowd, roar(e.get('d', 3), .3), t, 1, 0)
    elif k == 'cheer': add(crowd, roar(e.get('d', .6), .12), t, 1, 0)
    elif k == 'groan': add(crowd, groan(.18), t, 1, 0)
    elif k == 'swoosh': add(fx, swoosh(.22), t, 1, 0)
    elif k == 'whoosh': add(fx, swoosh(.3), t, 1, .2)
    elif k == 'pop': add(fx, pop(.18), t, 1, 0)
    elif k == 'hit': add(fx, hit(.45), t, 1, 0)
    elif k == 'boom': add(fx, boom(.5), t, 1, 0)
    elif k == 'tick': add(fx, tick(.3), t, 1, .1)
    elif k == 'thud': add(fx, thump(.25, 120), t, 1, 0)
    elif k == 'slowmo': add(fx, slowmo(.35), t, 1, 0)
    elif k == 'fizz': add(fx, fizz(.14), t, 1, .2)
    elif k == 'bang': add(fx, bang(.3), t, 1, -.1)
    elif k == 'crackle': add(fx, crackle(e.get('d', 5), .12), t, 1, .2)
    elif k == 'siren': add(fx, siren(e.get('d', 3), .08), t, 1, -.3)
    elif k == 'register': add(fx, register(.3), t, 1, 0)
    elif k == 'drop': add(fx, hit(.8), t, 1, 0); add(fx, crash(.12), t, 1, 0)
# stadium bed: a low hum of the crowd all the way through
bed = bp(rng.standard_normal(N), 250, 2200) * .025
crowd += np.stack([bed, np.roll(bed, 1999)], 1)

# ---------------------------------------------------------------- the score
M = {e['n']: e['t'] for e in EV if e['type'] == 'mus'}
BPM = 100; B = 60 / BPM
def env_adsr(n, a=.005, r=.08):
    tt = np.arange(n) / SR; d = n / SR
    return np.minimum(1, tt / a) * np.minimum(1, np.maximum(0, (d - tt)) / r)
def place(buf, x, t, g=1.0, pan=0.0):
    i = int(t * SR);
    if i >= N: return
    x = x[:N - i]; l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[i:i + len(x), 0] += x * g * l * 1.414; buf[i:i + len(x), 1] += x * g * r * 1.414
def drum_kick():
    tt = t_(.4); return np.sin(2 * np.pi * (50 + 90 * np.exp(-tt / .04)) * tt) * np.exp(-tt / .16)
def drum_snare():
    tt = t_(.25); return (bp(rng.standard_normal(len(tt)), 1200, 7000) * np.exp(-tt / .07) + np.sin(2 * np.pi * 190 * tt) * np.exp(-tt / .05) * .6)
def drum_hat(open_=False):
    tt = t_(.25 if open_ else .06); return hp(rng.standard_normal(len(tt)), 7000) * np.exp(-tt / (.08 if open_ else .015))
def saw(f, d, det=0.0):
    tt = t_(d); ph = (f * (1 + det)) * tt; return 2 * (ph - np.floor(ph + .5))
def midi(m): return 440 * 2 ** ((m - 69) / 12)
KD, SN, HO = drum_kick(), drum_snare(), drum_hat(True)
CH = {'Am': [57, 60, 64], 'F': [53, 57, 60], 'C': [55, 60, 64], 'G': [55, 59, 62], 'Fmaj7': [53, 57, 60, 64], 'Em7': [52, 55, 59, 62], 'Dm7': [50, 53, 57, 60]}
ROOT = {'Am': 45, 'F': 41, 'C': 48, 'G': 43, 'Fmaj7': 41, 'Em7': 40, 'Dm7': 38}
def pad(ch, t, d, g=.06, cut=1600):
    x = sum(saw(midi(m), d, det) for m in CH[ch] for det in (-.004, .004)); x = lp(x, cut) * env_adsr(len(x), .25, .4)
    place(music, x, t, g, -.2); place(music, np.roll(x, 300), t, g, .2)
def bass(ch, t, d, g=.14):
    x = lp(saw(midi(ROOT[ch]), d), 500) * env_adsr(int(d * SR), .005, .05); place(music, x, t, g)
def keys(ch, t, d, g=.05):   # soft electric-piano-ish chord
    tt = t_(d); x = sum(np.sin(2 * np.pi * midi(m) * tt) * (1 + .3 * np.sin(2 * np.pi * 5 * tt)) for m in CH[ch]) * np.exp(-tt / 1.6) * env_adsr(len(tt), .01, .3)
    place(music, x, t, g)
def bar_groove(t0, ch, level=1.0, full=False):
    for b in range(4):
        tb = t0 + b * B
        if full or b % 2 == 0: place(music, KD, tb, .5 * level)
        if b % 2 == 1: place(music, SN, tb, .22 * level, .05)
        for h in range(2): place(music, drum_hat(), tb + h * B / 2, .05 * level, .3)
        for h in range(2): bass(ch, tb + h * B / 2, B / 2 * .9, .12 * level)
    pad(ch, t0, 4 * B, .045 * level)
def section(t0, t1, fn):
    prog = ['Am', 'F', 'C', 'G']; i = 0; t = t0
    while t < t1 - .2: fn(t, prog[i % 4], min(4 * B, t1 - t)); t += 4 * B; i += 1
tA, tBuild, tHush, tDrop, tSoft, tA2, tEnd = (M[k] for k in ('A', 'build', 'hush', 'drop', 'soft', 'A2', 'end'))
# hook sting, then the groove
place(music, KD, 0, .6); pad('Am', 0, 2.5, .05)
section(tA + 2.4, tBuild, lambda t, ch, d: bar_groove(t, ch, .75))
# build: kicks on every beat, rising pad, a noise riser into the kick
section(tBuild, tHush, lambda t, ch, d: (bar_groove(t, ch, .85, True), pad(ch, t, d, .05, 2400)))
nr = int((tHush - tBuild) * SR); place(music, hp(rng.standard_normal(nr), 2500) * np.linspace(0, 1, nr) ** 3 * .05, tBuild)
# hush: a heartbeat under the slow motion
t = tHush
while t < tDrop - .3: place(music, lp(KD, 200), t, .45); place(music, lp(KD, 200), t + .22, .3); t += .85
# drop: full kit and bright chords
section(tDrop, tSoft, lambda t, ch, d: (bar_groove(t, ch, 1.0, True), pad(ch, t, d, .07, 4000), [place(music, HO, t + b * B + B / 2, .03, .3) for b in range(4)]))
# soft: warm keys for the flashback
t = tSoft; soft = ['Fmaj7', 'Em7', 'Dm7', 'Em7']; i = 0
while t < tA2 - .2:
    keys(soft[i % 4], t, 2 * B * 1.05, .05); place(music, drum_hat(), t + B, .025, .3); i += 1; t += 2 * B
crack = (rng.random(int((tA2 - tSoft) * SR)) < .0006) * rng.standard_normal(int((tA2 - tSoft) * SR)); place(music, hp(crack, 2000) * .1, tSoft)
# A2: the groove again (lighter), then the end chord
section(tA2, tEnd, lambda t, ch, d: bar_groove(t, ch, .7))
pad('Am', tEnd, DUR - tEnd + .5, .06, 2000); keys('Am', tEnd, DUR - tEnd, .05)

# ---------------------------------------------------------------- mix: voice on top, music and stadium duck under it
env = np.abs(vo).max(1); kk = int(.03 * SR); env = np.convolve(env, np.ones(kk) / kk, 'same')
act = np.clip(env / (np.percentile(env[env > 1e-4], 50) + 1e-9), 0, 1)
dk = np.zeros(N); a = 0.0; att, rel = np.exp(-1 / (.05 * SR)), np.exp(-1 / (.35 * SR))
for i in range(0, N, 48):
    x = act[i]; a = att * a + (1 - att) * x if x > a else rel * a + (1 - rel) * x; dk[i:i + 48] = a
mid = np.stack([bp(music[:, c], 300, 4000) for c in (0, 1)], 1)
music_d = (music - mid * (1 - 10 ** (-7 / 20)) * dk[:, None]) * (1 - (1 - 10 ** (-3 / 20)) * dk[:, None])
fx_d = (fx + crowd) * (1 - (1 - 10 ** (-3 / 20)) * dk[:, None])
speak = dk > .5
vr = np.sqrt((vo[speak] ** 2).mean()); mr = np.sqrt((music_d[speak] ** 2).mean())
mg = (vr / 10 ** (11 / 20)) / (mr + 1e-9)
mix = vo + music_d * mg + fx_d * mg * .9
mix = np.stack([compress(mix[:, 0], thr=0.3, ratio=2.5, att=0.002), compress(mix[:, 1], thr=0.3, ratio=2.5, att=0.002)], 1)
tt = np.arange(N) / SR
mix *= np.clip((DUR - tt) / 1.2, 0, 1)[:, None] ** 1.5
mix *= 0.5 / np.abs(mix).max() * 2.2
mix = np.stack([limit(mix[:, 0], ceil=.8), limit(mix[:, 1], ceil=.8)], 1)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, A.out), mix.astype(np.float32), SR)
print('mix', mix.shape, 'music gain', round(float(mg), 3))
