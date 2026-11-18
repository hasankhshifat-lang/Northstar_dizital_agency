"""Sound for a Foot All FC match Short: VibeVoice narration + paper foley on the page's events + a synthesized
stadium crowd (roars, applause) + a sampled brass-band score. Run from the library root ($LIB):
  .venv/bin/python <project>/mix.py --events out/events.json --out out/mix.wav
Score: a quiet oom-pah march under the set-up, brass hits on each goal ('net'), the full band on the big moment
('bigslap', or the last 'net'), a soft chord under the closing question.
"""
import json, os, sys, argparse
import numpy as np, soundfile as sf
from scipy.signal import resample_poly
LIB = os.environ['LIB']
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio.sfx import SR, bp, lp, hp, add, compress, limit, click, whoosh, thump, creak, t_, norm, ding

ap = argparse.ArgumentParser(); ap.add_argument('--events', default='out/events.json'); ap.add_argument('--out', default='out/mix.wav')
A = ap.parse_args()
HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, A.events)))
DUR = float(D['dur']); EV = D['ev']; N = int(round(DUR * SR))
rng = np.random.default_rng(31)
fx = np.zeros((N, 2)); vo = np.zeros((N, 2)); crowd = np.zeros((N, 2))
T = {e['type'] + str(i): e['t'] for i, e in enumerate(EV)}
first = lambda k, n=0: [e['t'] for e in EV if e['type'] == k][n]
W = [e['t'] for e in EV if e['type'] == 'whip']

def paper_slap(v=1.0, size=1.0):
    tt = t_(0.45)
    crack = hp(rng.standard_normal(len(tt)), 1800) * np.exp(-tt / 0.006)
    body = bp(rng.standard_normal(len(tt)), 500, 4500) * np.exp(-tt / (0.035 * size))
    knock = np.sin(2 * np.pi * 95 * tt * (1 - .4 * tt)) * np.exp(-tt / (0.06 * size))
    return norm(crack * .9 + body + knock * .8 * size) * v
def crinkle(d, v=1.0, density=0.004):
    n = int(d * SR); x = (rng.random(n) < density) * rng.standard_normal(n) * 3
    x = bp(x, 1500, 7500) + bp(rng.standard_normal(n), 800, 3000) * .08
    return x * np.sin(np.pi * np.arange(n) / n) ** .6 * v
def kick(v=1.0):
    tt = t_(0.25)
    return norm(np.sin(2 * np.pi * 120 * tt * (1 - 1.2 * tt)) * np.exp(-tt / .03) + hp(rng.standard_normal(len(tt)), 900) * np.exp(-tt / .008) * .7) * v
def net(v=1.0):
    n = int(.7 * SR); tt = np.arange(n) / SR
    x = bp(rng.standard_normal(n), 1500, 6000) * np.exp(-tt / .18) * (1 + .5 * np.sin(2 * np.pi * 14 * tt))
    return norm(x) * v
def whistle(v=1.0):
    tt = t_(0.55); f = 2900 + 120 * np.sin(2 * np.pi * 38 * tt)
    x = np.sin(np.cumsum(f) / SR * 2 * np.pi) * (1 + .3 * np.sin(2 * np.pi * 38 * tt))
    return x * np.minimum(1, tt / .02) * np.minimum(1, (.55 - tt) / .05) * v
def slide_whistle(d, f0, f1, v=1.0):
    tt = t_(d); f = f0 * (f1 / f0) ** (tt / d); ph = np.cumsum(f) / SR * 2 * np.pi
    return (np.sin(ph) + .25 * np.sin(2 * ph)) * np.minimum(1, tt / 0.02) * np.minimum(1, (d - tt) / 0.04) * v
def page_slide(d, v=1.0):
    n = int(d * SR); return lp(bp(rng.standard_normal(n), 300, 3000) * np.sin(np.pi * np.arange(n) / n) ** 2, 4000) * v
def scratch(d, v=1.0):        # seismograph pen on paper, wobbling harder in the middle
    n = int(d * SR); tt = np.arange(n) / SR
    amp = .3 + .7 * np.sin(np.clip((tt / d - .25) / .5, 0, 1) * np.pi)
    x = bp(rng.standard_normal(n), 2500, 8000) * (0.6 + 0.4 * np.sin(2 * np.pi * (9 + 20 * amp) * tt)) * amp
    return x * .25 * v
def roar(d, v=1.0):           # a crowd erupting: band-limited noise with a fast swell and a long tail
    n = int(d * SR); tt = np.arange(n) / SR
    env = np.minimum(1, tt / .18) * np.exp(-np.maximum(0, tt - .8) / (d * .45))
    x = bp(rng.standard_normal(n), 250, 2600) + .4 * bp(rng.standard_normal(n), 1500, 5000)
    x *= 1 + .15 * np.sin(2 * np.pi * 3.1 * tt)
    return x * env * v

def applause(d, v=1.0):       # many hands: dense random claps (short band-passed bursts) under a soft hiss
    n = int(d * SR); x = np.zeros(n)
    for _ in range(int(d * 260)):
        i = rng.integers(0, max(1, n - 800)); L = rng.integers(250, 700)
        x[i:i + L] += bp(rng.standard_normal(L), 900, 5000) * np.exp(-np.arange(L) / (L * .18)) * rng.uniform(.3, 1)
    x += bp(rng.standard_normal(n), 600, 4000) * .08
    env = np.minimum(1, np.arange(n) / (.5 * SR)) * np.minimum(1, (n - np.arange(n)) / (.8 * SR))
    return x * env * v * .5
def murmur(d, v=1.0):         # a crowd rising to its feet: low swell
    n = int(d * SR); tt = np.arange(n) / SR
    return bp(rng.standard_normal(n), 150, 1200) * np.sin(np.pi * tt / d) * v

for e in EV:
    t, k, pan = e['t'], e['type'], e.get('pan', 0) * .7
    if k == 'vo':
        y, sr = sf.read(os.path.join(HERE, 'vo', e['id'] + '.wav'), dtype='float32')
        if y.ndim > 1: y = y.mean(1)
        y = resample_poly(y, SR, sr); y = hp(y, 90); y = compress(y / (np.abs(y).max() + 1e-9) * .9, thr=.22, ratio=3.0)
        add(vo, y, t, 1.0, 0.0); continue
    if k == 'tick': add(fx, hp(click(pitch=1.6, v=1), 1500) * .35, t, 1, 0)
    elif k == 'scribble': add(fx, crinkle(e['d'], .22, .03), t, 1, .2)
    elif k == 'slip': add(fx, paper_slap(.25, .5), t, 1, pan)
    elif k == 'kick': add(fx, kick(.45 * e.get('v', 1)), t, 1, pan)
    elif k == 'net': add(fx, net(.25), t, 1, .3)
    elif k == 'stampdown': add(fx, lp(whoosh(e['d'], 1), 3000) * .08, t, 1, 0)
    elif k == 'stamp': add(fx, thump(.5, 90), t, 1, 0); add(fx, paper_slap(.45, .8), t, 1, 0)
    elif k == 'whip': add(fx, hp(whoosh(e['d'], 1), 400) * .2, t, 1, 0)
    elif k == 'windup': add(fx, creak(.08), t, 1, pan)
    elif k == 'slap': add(fx, paper_slap(.7 * e.get('v', 1), 1.3), t, 1, pan)
    elif k == 'bigslap': add(fx, paper_slap(1.0, 2.2), t, 1, 0); add(fx, thump(.9, 48), t, 1, 0)
    elif k == 'fall': add(fx, thump(.35, 80), t, 1, -.2)
    elif k == 'whistle': add(fx, whistle(.22), t, 1, .4)
    elif k in ('slide', 'pullback'): add(fx, page_slide(e['d'], .1), t, 1, 0)
    elif k == 'step': add(fx, lp(thump(.12, 160), 2000), t, 1, pan)
    elif k == 'lift': add(fx, slide_whistle(e['d'], 500, 900, .04), t, 1, 0)
    elif k == 'hop': add(fx, lp(click(pitch=.9 + .1 * (e.get('i', 0) % 3), v=1), 5000) * .1, t, 1, pan)
    elif k == 'scratch': add(fx, scratch(e['d'], 1), t, 1, .35)
    elif k == 'pin': add(fx, lp(click(pitch=1.5, v=1), 5000) * .2, t, 1, 0); add(fx, ding(.05), t + .01, 1, 0)
    elif k == 'write': add(fx, scratch(e['d'], .7), t, 1, .2)
    elif k == 'tear': add(fx, crinkle(.35, .5, .05), t, 1, .3)
    elif k == 'grow': add(fx, slide_whistle(e['d'], 300, 700, .03), t, 1, 0)
    elif k == 'ding': add(fx, ding(.06), t, 1, -.3 + .08 * e.get('i', 0))
    elif k == 'gavel': add(fx, thump(.8, 140), t, 1, 0); add(fx, hp(click(pitch=.8, v=1), 600) * .5, t, 1, 0)
    elif k == 'roar': add(crowd, roar(e['d'], .2 * e.get('v', 1)), t, 1, 0)
    elif k == 'clap': add(crowd, applause(e['d'], .22 * e.get('v', 1)), t, 1, 0)
    elif k == 'rise': add(crowd, murmur(e['d'], .12), t, 1, 0)
    elif k == 'whoosh': add(fx, hp(whoosh(.35, 1), 500) * .25, t, 1, .2)
    elif k == 'groan': add(crowd, murmur(1.2, .1), t, 1, 0)
    elif k in ('accordion', 'silence', 'band'): pass
    elif k == 'pullback': add(fx, page_slide(e['d'], .08), t, 1, 0)

# bed: a low stadium hum all the way through
tt = np.arange(N) / SR
bed = bp(rng.standard_normal(N), 300, 2500)
lvl = np.full(N, .02); lvl[W[-1] * SR < np.arange(N)] = .012
for e in EV:
    if e['type'] == 'silence': lvl[int(e['t'] * SR):int((e['t'] + e['d']) * SR)] = .002
lvl = np.convolve(lvl, np.ones(2400) / 2400, 'same')
crowd += np.stack([bed * lvl, np.roll(bed, 997) * lvl], 1)

# ---------------------------------------------------------------- score (film seconds), Bb major brass band
score = []
def ev(t, inst, p, d, v, pan=0.0, g=1.0): score.append((t, inst, p, d, v, pan, g))
CH = {'Bb': (34, [53, 58, 62]), 'F7': (29, [57, 63, 65]), 'Eb': (39, [55, 58, 63]), 'Gm': (31, [55, 58, 62]), 'Cm': (36, [55, 60, 63])}
def oompah(t, ch, beat, v=1.0):
    r, voic = CH[ch]
    ev(t, 'tuba_stac', r, .35, .6 * v, -.15)
    for i, p in enumerate(voic): ev(t + beat, ['trombone_stac', 'clarinet_stac'][i % 2], p, .16, .4 * v, .25 - .1 * i, .8)
nets = [e['t'] for e in EV if e['type'] == 'net']
big = [e['t'] for e in EV if e['type'] == 'bigslap']; tBig = big[0] if big else nets[-1]
freeze = [e['t'] for e in EV if e['type'] == 'freeze']; tHush = freeze[0] if freeze else tBig
tEnd = W[-1]
b = 60 / 116
prog = ['Bb', 'Gm', 'Eb', 'F7']
i = 0
while i * 2 * b < tHush - .4:
    tb = i * 2 * b; oompah(tb, prog[i % 4] if tb < W[min(2, len(W) - 1)] else ['Gm', 'Cm', 'Eb', 'F7'][i % 4], b, .45 + .35 * (tb / tHush)); i += 1
mel = [70, 72, 74, 77, 74, 72, 70, 74, 77, 79, 77, 74]
for j, p in enumerate(mel):
    tm = W[1] + .3 + j * b * 1.5
    if tm < tHush - .5: ev(tm, 'trumpet_stac', p, .2, .38, .2, .45)
for tn in nets:
    if abs(tn - tBig) < .05: continue
    ev(tn, 'gran_cassa', None, None, .7, 0, .8); ev(tn, 'clash', None, None, .35, .1, .35)
    for k2, p in enumerate([46, 53, 58, 62, 65]): ev(tn, ['tuba', 'trombone', 'trombone', 'horn', 'trumpet_stac'][k2], p, .6, .65, -.2 + .1 * k2, .7)
for k2, p in enumerate([34, 46, 53, 58, 62, 65, 70]): ev(tBig, ['tuba', 'trombone', 'trombone', 'horn', 'trumpet', 'trumpet', 'trumpet'][k2], p, 1.6, .85, -.3 + .1 * k2, .85)
ev(tBig, 'gran_cassa', None, None, 1.0, 0, 1.0); ev(tBig, 'clash', None, None, .6, 0, .5)
band = [e['t'] for e in EV if e['type'] == 'band']; tBand = band[0] if band else tBig + 1.6
b2 = 60 / 128; k2 = 0
while tBand + k2 * 2 * b2 < tEnd - .3:
    oompah(tBand + k2 * 2 * b2, ['Bb', 'Eb', 'Bb', 'F7'][k2 % 4], b2, .6); k2 += 1
for kk, p in enumerate([34, 46, 53, 58, 62]): ev(tEnd + .1, ['tuba', 'horn', 'clarinet', 'clarinet', 'horn'][kk], p, DUR - tEnd - .1, .36, -.2 + .1 * kk, .45)
for j, p in enumerate([70, 74, 77, 74, 82]): ev(tEnd + .6 + j * .55, 'glockenspiel', p + 12, .5, .22, .2, .35)
used = sorted({e[1] for e in score})
S.seed(11)
music = S.render(score, dur=DUR + 2, master=False)[:N]
if len(music) < N: music = np.pad(music, ((0, N - len(music)), (0, 0)))
music = S.room(music, size=0.3, mix=0.14)

# ---------------------------------------------------------------- mix: voice on top, music, crowd and foley duck under it
env = np.abs(vo).max(1); k = int(.03 * SR); env = np.convolve(env, np.ones(k) / k, 'same')
act = np.clip(env / (np.percentile(env[env > 1e-4], 50) + 1e-9), 0, 1)
dk = np.zeros(N); a = 0.0; att, rel = np.exp(-1 / (.05 * SR)), np.exp(-1 / (.35 * SR))
for i in range(0, N, 48):
    x = act[i]; a = att * a + (1 - att) * x if x > a else rel * a + (1 - rel) * x; dk[i:i + 48] = a
mid = np.stack([bp(music[:, c], 300, 4000) for c in (0, 1)], 1)
music_d = (music - mid * (1 - 10 ** (-7 / 20)) * dk[:, None]) * (1 - (1 - 10 ** (-3 / 20)) * dk[:, None])
fx_d = (fx + crowd) * (1 - (1 - 10 ** (-3 / 20)) * dk[:, None])
speak = dk > .5
vr = np.sqrt((vo[speak] ** 2).mean()); mr = np.sqrt((music_d[speak] ** 2).mean())
mg = (vr / 10 ** (10 / 20)) / (mr + 1e-9)
mix = vo + (music_d + fx_d) * mg
mix = np.stack([compress(mix[:, 0], thr=0.3, ratio=2.5, att=0.002), compress(mix[:, 1], thr=0.3, ratio=2.5, att=0.002)], 1)
mix *= np.clip((DUR - tt) / 1.5, 0, 1)[:, None] ** 1.5
mix *= 0.5 / np.abs(mix).max() * 2.2
mix = np.stack([limit(mix[:, 0], ceil=.8), limit(mix[:, 1], ceil=.8)], 1)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, A.out), mix.astype(np.float32), SR)
cr = S.credits(used)
open(os.path.join(HERE, 'out', 'instruments.txt'), 'w').write('\n'.join(cr) if isinstance(cr, list) else str(cr))
print('mix', mix.shape, 'music gain', round(float(mg), 3), 'instruments:', ', '.join(used))
