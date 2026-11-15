"""Sound for "Need 3 Goals" (Barcelona 6-1 PSG Short): VibeVoice narration + paper foley on the page's events
+ a synthesized stadium crowd + the score.  Run from the library root ($LIB):
  .venv/bin/python <project>/mix.py --events out/events.json --out out/mix.wav
Accents: Barcelona = tuba/trombone oom-pah (brass); PSG = accordion stabs. The last chance drops to a string tremolo
and a heartbeat; the freeze is silent; the sixth goal brings the full band and the crowd.
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
tF = next(e['t'] for e in EV if e['type'] == 'freeze'); tG = next(e['t'] for e in EV if e['type'] == 'bigslap')

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
    elif k == 'roar': add(crowd, roar(e['d'], .2 * e.get('v', 1)), t, 1, 0)

# stadium murmur bed under everything except the freeze; a hushed crowd during the last chance
tt = np.arange(N) / SR
bed = bp(rng.standard_normal(N), 200, 1800)
lvl = np.full(N, .03)
tE = next(e['t'] for e in EV if e['type'] == 'step') - .3
lvl[(tt > tE) & (tt < tF)] = .015
lvl[(tt >= tF) & (tt < tG)] = 0.0
lvl[tt >= tG] = .045
lvl = np.convolve(lvl, np.ones(2400) / 2400, 'same')
crowd += np.stack([bed * lvl, np.roll(bed, 997) * lvl], 1)

# ---------------------------------------------------------------- score (film seconds), Bb major
score = []
def ev(t, inst, p, d, v, pan=0.0, g=1.0): score.append((t, inst, p, d, v, pan, g))
CH = {'Bb': (34, [53, 58, 62]), 'F7': (29, [57, 63, 65]), 'Eb': (39, [55, 58, 63]), 'Gm': (31, [55, 58, 62])}
def oompah(t, ch, beat, v=1.0):
    r, voic = CH[ch]
    ev(t, 'tuba_stac', r, .35, .62 * v, -.15)
    for i, p in enumerate(voic): ev(t + beat, ['trombone_stac', 'clarinet_stac'][i % 2], p, .16, .42 * v, .25 - .1 * i, .8)
def accordion_stab(t, notes, v=.6):
    for p in notes: ev(t, 'accordion', p, .3, v, -.45, .55)

# 0-11.6: the maths. Sparse, low brass at 112 bpm; PSG's accordion answers the away goal
b = 60 / 112
for i, ch in enumerate(['Bb', 'Gm', 'Eb', 'F7', 'Bb', 'Gm']):
    oompah(0.0 + i * 2 * b, ch, b, .55)
for i, ch in enumerate(['Eb', 'F7', 'Gm']):
    oompah(6.43 + i * 2 * b, ch, b, .5)
tAway = next(e['t'] for e in EV if e['type'] == 'net')
accordion_stab(tAway, [58, 62, 65], .7); accordion_stab(tAway + .25, [60, 63, 67], .65); accordion_stab(tAway + .5, [62, 65, 70], .75)
tStamp = next(e['t'] for e in EV if e['type'] == 'stamp')
ev(tStamp, 'tuba', 34, .25, .7, -.1, .8); ev(tStamp + .35, 'tuba', 33, .8, .65, -.1, .8)   # the sinking "oh no"
# 11.6-24.6: the burst. The march speeds up to 132 bpm, snare under it; hits on each goal
b2 = 60 / 132
t0 = 11.6
chs = ['Bb', 'F7', 'Bb', 'Eb', 'Bb', 'F7', 'Gm', 'Eb', 'Bb', 'F7', 'Bb', 'Eb', 'F7', 'Bb']
for i, ch in enumerate(chs):
    tb = t0 + i * 2 * b2 * 1.0
    if tb > 24.4: break
    oompah(tb, ch, b2, .8)
    ev(tb, 'snare', 'on', None, .25, .1, .35); ev(tb + b2, 'snare', 'on', None, .2, .1, .3)
mel = [70, 72, 74, 77, 74, 72, 70, 74, 77, 79, 77, 74, 72, 70, 72, 74]
for i, p in enumerate(mel): ev(12.5 + i * b2 * 1.5, 'trumpet_stac', p, .2, .45, .2, .5)
nets = [e['t'] for e in EV if e['type'] == 'net']
for tn in nets[1:3]:
    ev(tn, 'gran_cassa', None, None, .8, 0, .9); ev(tn, 'clash', None, None, .4, .1, .4)
    for i, p in enumerate([46, 53, 58, 62, 65]): ev(tn, ['tuba', 'trombone', 'trombone', 'horn', 'trumpet_stac'][i], p, .6, .7, -.2 + .1 * i, .75)
accordion_stab(21.0, [57, 60, 63], .55); accordion_stab(21.3, [57, 60, 63], .5)   # PSG still through
# 24.6-31.75: the last chance. String tremolo rising, a heartbeat on the timpani
for p, v in [(58, .2), (65, .18)]: ev(24.7, 'violins_trem', p, tF - 24.7, v, .2, .35)
ev(26.2, 'violins_trem', 70, tF - 26.2, .2, -.2, .35)
for j in range(int((tF - 25.0) / .8)):
    ev(25.0 + j * .8, 'timpani', 41, .4, .35, 0, .5); ev(25.0 + j * .8 + .22, 'timpani', 41, .3, .22, 0, .4)
# 31.75-33.3: silence. 33.3: the full band
for i, p in enumerate([34, 46, 53, 58, 62, 65, 70]):
    ev(tG, ['tuba', 'trombone', 'trombone', 'horn', 'trumpet', 'trumpet', 'trumpet'][i], p, 1.6, .85, -.3 + .1 * i, .85)
ev(tG, 'gran_cassa', None, None, 1.0, 0, 1.0); ev(tG, 'clash', None, None, .6, 0, .5)
for i, ch in enumerate(['Bb', 'Eb', 'Bb', 'F7', 'Bb', 'Eb', 'Bb', 'F7', 'Bb']):
    oompah(tG + 1.6 + i * 2 * b2, ch, b2, .85)
fan = [70, 74, 77, 82, 77, 79, 81, 82]
for i, p in enumerate(fan): ev(tG + 1.6 + i * b2 * 2, 'trumpet', p, b2 * 1.8, .55, .2, .6)
# 41-48.5: resolve. Brass chord under the question, the glockenspiel on the pin
tPin = next(e['t'] for e in EV if e['type'] == 'pin')
for i, p in enumerate([34, 46, 53, 58, 62]): ev(41.0, ['tuba', 'trombone', 'trombone', 'horn', 'clarinet'][i], p, 3.6, .45, -.2 + .1 * i, .5)
ev(tPin, 'glockenspiel', 89, 1.2, .4, .2, .5); ev(tPin + .15, 'glockenspiel', 94, 1.2, .35, .2, .45)
for i, p in enumerate([34, 46, 53, 58, 62, 65]): ev(45.0, ['tuba', 'trombone', 'trombone', 'horn', 'accordion', 'clarinet'][i], p, 3.3, .5, -.25 + .1 * i, .55)
ev(45.0, 'glockenspiel', 82, 3.0, .3, .3, .4)
used = sorted({e[1] for e in score})
S.seed(11)
music = S.render(score, dur=DUR + 2, master=False)[:N]
if len(music) < N: music = np.pad(music, ((0, N - len(music)), (0, 0)))
music = S.room(music, size=0.3, mix=0.14)
music[(tt >= tF) & (tt < tG)] *= 0          # the freeze is silent

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
