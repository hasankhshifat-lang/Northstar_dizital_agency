"""Sound for "The Napkin" (Lionel Messi Short): VibeVoice narration + paper foley on the page's events
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
first = lambda k, n=0: [e['t'] for e in EV if e['type'] == k][n]
tSign = first('bigslap'); tGrow = first('grow'); tBall = first('ding'); tGavel = first('gavel'); W = [e['t'] for e in EV if e['type'] == 'whip']

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
    elif k == 'write': add(fx, scratch(e['d'], .7), t, 1, .2)
    elif k == 'tear': add(fx, crinkle(.35, .5, .05), t, 1, .3)
    elif k == 'grow': add(fx, slide_whistle(e['d'], 300, 700, .03), t, 1, 0)
    elif k == 'ding': add(fx, ding(.06), t, 1, -.3 + .08 * e.get('i', 0))
    elif k == 'gavel': add(fx, thump(.8, 140), t, 1, 0); add(fx, hp(click(pitch=.8, v=1), 600) * .5, t, 1, 0)
    elif k == 'roar': add(crowd, roar(e['d'], .2 * e.get('v', 1)), t, 1, 0)

# beds: a youth-pitch breeze outdoors, quiet cafe murmur at the table; a crowd only for the World Cup
tt = np.arange(N) / SR
bed = bp(rng.standard_normal(N), 300, 2500)
lvl = np.full(N, .012)
lvl = np.convolve(lvl, np.ones(2400) / 2400, 'same')
crowd += np.stack([bed * lvl, np.roll(bed, 997) * lvl], 1)

# ---------------------------------------------------------------- score (film seconds), D minor -> F major: a guitar-and-accordion tango-waltz from Rosario that turns into Barcelona brass
score = []
def ev(t, inst, p, d, v, pan=0.0, g=1.0): score.append((t, inst, p, d, v, pan, g))
CH = {'Dm': (38, [57, 62, 65]), 'A7': (33, [55, 61, 64]), 'Gm': (31, [55, 58, 62]), 'F': (29, [57, 60, 65]), 'Bb': (34, [53, 58, 62]), 'C7': (36, [55, 58, 64])}
def waltz(t, ch, beat, v=1.0, inst='accordion'):
    r, voic = CH[ch]
    ev(t, 'contrabass_pizz' if False else 'tuba_stac', r, .3, .45 * v, -.15)
    for j in (1, 2):
        for i, p in enumerate(voic): ev(t + j * beat, inst, p, .18, .32 * v, .2 - .1 * i, .6)
b = 60 / 138                               # 3/4, one bar = 3 beats
prog = ['Dm', 'Dm', 'A7', 'A7', 'Gm', 'Dm', 'A7', 'Dm']
i = 0
while i * 3 * b < tSign - .3:
    tb = i * 3 * b
    if not (W[2] - .1 < tb < W[3]):         # the night calendar gets only a music-box line
        waltz(tb, prog[i % 8], b, .5 if tb < W[1] else .7)
    i += 1
mel = [69, 72, 74, 72, 69, 67, 69, 65, 64, 65, 67, 69]
for j, p in enumerate(mel): ev(W[0] + .2 + j * b * 1.5, 'clarinet', p, b * 1.3, .32, .2, .45)
for j in range(10): ev(W[2] + .3 + j * .32, 'glockenspiel', [81, 77, 74, 77][j % 4], .3, .22, .3, .35)
ev(first('stamp'), 'tuba', 38, .25, .6, -.1, .7); ev(first('stamp') + .35, 'tuba', 37, .8, .55, -.1, .7)
# the signature: the band turns to F major brass
for k, p in enumerate([29, 41, 48, 53, 57, 60, 65]): ev(tSign, ['tuba', 'trombone', 'trombone', 'horn', 'trumpet', 'trumpet', 'trumpet'][k], p, 1.4, .75, -.3 + .1 * k, .8)
ev(tSign, 'gran_cassa', None, None, .9, 0, .9); ev(tSign, 'clash', None, None, .5, 0, .45)
b2 = 60 / 120
def oompah(t, ch, beat, v=1.0):
    r, voic = CH[ch]
    ev(t, 'tuba_stac', r, .35, .6 * v, -.15)
    for i, p in enumerate(voic): ev(t + beat, ['trombone_stac', 'clarinet_stac'][i % 2], p, .16, .4 * v, .25 - .1 * i, .8)
k = 0
while tSign + 1.4 + k * 2 * b2 < W[-1] - .2:
    oompah(tSign + 1.4 + k * 2 * b2, ['F', 'Bb', 'F', 'C7'][k % 4], b2, .75); k += 1
fan = [65, 69, 72, 77, 72, 74, 76, 77]
for j, p in enumerate(fan): ev(tBall + j * .28, 'trumpet_stac', p, .25, .5, .2, .6)
# the auction: a quiet accordion chord, the waltz theme once more, and a button on the gavel
for kk, p in enumerate([29, 41, 53, 57, 60]): ev(W[-1] + .1, ['tuba', 'horn', 'accordion', 'accordion', 'clarinet'][kk], p, DUR - W[-1] - .1, .38, -.2 + .1 * kk, .45)
for j, p in enumerate([69, 72, 74, 72, 77]): ev(W[-1] + 1.0 + j * b * 1.5, 'clarinet', p, b * 1.3, .3, .2, .4)
ev(tGavel, 'glockenspiel', 89, 1.2, .35, .2, .45); ev(tGavel + .15, 'glockenspiel', 93, 1.2, .3, .2, .4)
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
