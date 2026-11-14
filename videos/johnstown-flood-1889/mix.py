"""Sound for "Fourteen Miles" (the Johnstown Flood, 1889): narration + score + foley on one 49.5 s timeline.

A minor, 90 bpm (one bar = 2.667 s). Cues come from events.json (exported by the page) and voice/cues.json.
Shape: a plucked pulse that climbs the valley → a thin pedal under the section → near-silence → drums and cello
spiccato under the run → impact → one pizzicato per slab of the pile → a held low horn under the count.
Voice compressed; music carved at 300 Hz–4 kHz, ducked under each line and balanced ~10 dB under the voice.
usage (library root): LIB=<lib> .venv/bin/python <project>/mix.py      writes out/mix.wav
"""
import json, os, sys
import numpy as np, soundfile as sf, soxr
LIB = os.environ['LIB']
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio.sfx import SR, bp, lp, hp, add, compress, limit, click, whoosh, thump

HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, 'events.json')))
FULL = float(D['dur']); EV = D['ev']
CUES = json.load(open(os.path.join(HERE, 'voice', 'cues.json')))
N = int(FULL * SR) + SR
tt = np.arange(N) / SR
rng = np.random.default_rng(1889)
BEAT = 60 / 90; BAR = 4 * BEAT
one = lambda k: next(e for e in EV if e['type'] == k)
evs = lambda k: [e for e in EV if e['type'] == k]
CUT, CLOSE, BREACH, ARRIVE, FIRE, COUNT = one('cut')['t'], one('close')['t'], one('breach')['t'], one('impact')['t'], one('fire')['t'], one('count')['t']


def env(points):
    ts, vs = zip(*points); return np.interp(tt, ts, vs)


def st(x): return np.stack([x, np.roll(x, 1733)], 1)


mix = np.zeros((N, 2)); music = np.zeros((N, 2))

# ---------------- ambience ----------------
air = bp(rng.standard_normal(N), 300, 5000, 2) * env([(0, 0), (.5, .014), (8, .018), (12.9, .016), (CUT, .008), (CLOSE + .9, .008), (22, .016), (BREACH, .016), (31, .022), (ARRIVE, .02), (FULL, .016)])
under = lp(rng.standard_normal(N), 260, 2) * env([(0, 0), (CUT - .1, 0), (CUT + .5, .05), (CLOSE, .05), (CLOSE + .9, 0), (FULL, 0)])           # inside the section: a muffled hush
rk = np.clip((tt - BREACH - .25) / (ARRIVE - BREACH - .25), 0, 1)
_n = rng.standard_normal(N)
rumble = (lp(_n, 180, 2) * (1 - rk) + lp(_n, 650, 2) * rk) * env([(0, 0), (BREACH, 0), (BREACH + .4, .07), (ARRIVE - .3, .12), (ARRIVE + .4, .05), (ARRIVE + 3.5, .02), (FULL, .01)])
rush = bp(rng.standard_normal(N), 400, 3500, 2) * env([(0, 0), (BREACH + .2, 0), (BREACH + 1.2, .02), (ARRIVE - .2, .04), (ARRIVE + 1.5, .008), (FULL, 0)])
crackle = np.zeros(N)
for t in np.arange(FIRE, FULL - 1.5, .021):
    if rng.random() < .55:
        i = int((t + rng.random() * .02) * SR); n = int(.006 * SR); crackle[i:i + n] += rng.standard_normal(n) * np.exp(-np.arange(n) / (n / 4)) * rng.random()
crackle = hp(crackle, 1500) * env([(0, 0), (FIRE, 0), (FIRE + .6, .5), (43, .35), (46, .12), (FULL, 0)])
for x in (air, under, rumble, rush, crackle): mix += st(x)

# ---------------- score ----------------
ev = []
CH = {'Am': [33, 40, 45, 48, 52], 'F': [29, 36, 41, 45, 48], 'G': [31, 38, 43, 47, 50], 'E': [28, 35, 40, 44, 47], 'Dm': [26, 33, 38, 41, 45]}
# intro + climb: low plucked pulse on quarter notes from the pin, harp opens up when we start up the valley
CLIMB = ['Am', 'Am', 'F', 'G', 'Am', 'F']
for b, ch in enumerate(CLIMB):
    t0 = .5 + b * BAR; c = CH[ch]
    for q in range(4): ev.append((t0 + q * BEAT, 'contrabass_pizz', c[0] if q % 2 == 0 else c[1], .55, .5 if q == 0 else .38, -.05, .55))
    if b >= 2:
        for i, k in enumerate([2, 3, 4, 3, 2, 3, 4, 4]): ev.append((t0 + i * BEAT / 2, 'harp', c[k] + 12, 1.2, .3 + .05 * (i == 0), -.25 + .06 * i, .38))
    if b in (2, 4): ev.append((t0, 'frame_drum', 'large_muted', None, .36, 0, .45))
ev += [(.0, 'cellos', 'A1', 5.0, .3, 0, .26), (.0, 'vibraphone_bowed', 'E5', 5.0, .28, .3, .18)]
for e in evs('pin'): ev.append((e['t'], 'hand_chimes', 'A5', 2.5, .48, .3, .5))
for e in evs('lake'): ev += [(e['t'], 'hand_chimes', 'E6', 2.4, .42, .35, .42), (e['t'] + .12, 'glockenspiel', 'B5', 1.4, .26, .2, .26)]
for e in evs('dam'): ev += [(e['t'], 'horn', 'A2', 2.0, .42, 0, .32), (e['t'], 'contrabass', 'A1', 2.0, .42, 0, .32)]
# the section: the music thins to a pedal and slow bowed notes
ev += [(CUT - .3, 'contrabass', 'A1', CLOSE - CUT + .3, .42, 0, .36), (CUT - .28, 'cellos', 'E2', CLOSE - CUT + .3, .3, 0, .24),
       (CUT + 1.6, 'vibraphone_bowed', 'C5', 3.0, .3, -.3, .18), (CUT + 3.6, 'vibraphone_bowed', 'B4', 2.4, .28, .3, .16)]
# (CLOSE → BREACH: nothing but air and the clock)
# the breach: a low hit, then the run — drums on every downbeat, cello spiccato eighths, climbing
ev += [(BREACH, 'timpani', 'A2', 2.0, .6, 0, .7), (BREACH, 'frame_drum', 'large', None, .62, 0, .75), (BREACH, 'contrabass', 'A1', 2.6, .5, 0, .42)]
RUN = ['Am', 'Am', 'F', 'F', 'G']
for b, ch in enumerate(RUN):
    t0 = BREACH + .25 + b * BAR; c = CH[ch]
    if t0 > ARRIVE - .2: break
    ev.append((t0, 'frame_drum', 'large', None, .5 + .03 * b, 0, .6))
    ev.append((t0 + 2 * BEAT, 'frame_drum', 'large_muted', None, .34, 0, .45))
    for i in range(8):
        tn = t0 + i * BEAT / 2
        if tn > ARRIVE - .1: break
        ev.append((tn, 'cellos_spic', c[[2, 3, 2, 4, 2, 3, 4, 3][i]] + 12 + (2 if b == 4 else 0), .25, .3 + .04 * b + .08 * (i % 2 == 0), .2, .5))
        if i % 2 == 0: ev.append((tn, 'contrabass_pizz', c[0], .4, .42, -.1, .5))
for i, p in enumerate([69, 72, 76, 81]): ev.append((BREACH + .3 + i * BEAT / 2, 'glockenspiel', p, .9, .26 + .03 * i, .3 - .2 * i, .3))
for e in evs('stat'): ev += [(e['t'], 'horn', 'F3', 2.2, .4, -.1, .3), (e['t'], 'horn', 'C4', 2.2, .34, .1, .26)]
# the arrival: one big hit and half a bar of nothing but the rumble
ev += [(ARRIVE, 'timpani', 'E2', 2.4, .7, 0, .8), (ARRIVE, 'frame_drum', 'large', None, .7, 0, .8), (ARRIVE, 'contrabass', 'E1', 2.4, .5, 0, .45)]
# the pile: one pizzicato per slab, rising; a horn swell under "40 feet"
DSC = [57, 60, 62, 64, 67, 69, 72, 76]
for e in evs('slab'): ev.append((e['t'], 'violins_pizz', DSC[e['i']], .4, .32 + .02 * e['i'], .2, .4))
ev += [(38.6, 'horn', 'A2', 3.0, .4, -.1, .32), (38.6, 'horn', 'E3', 3.0, .36, .1, .28), (38.6, 'cellos', 'A1', 3.4, .32, 0, .26)]
ev += [(FIRE, 'cellos', 'F2', 2.0, .3, 0, .22), (FIRE, 'vibraphone_bowed', 'F4', 2.0, .24, .2, .14)]
# the count: everything drops to a held low horn and a pedal; one chime when the number lands
ev += [(COUNT - .4, 'horn', 'A2', FULL - COUNT, .42, 0, .34), (COUNT - .4, 'contrabass', 'A1', FULL - COUNT, .4, 0, .32), (COUNT - .4, 'cellos', 'E2', FULL - COUNT, .28, 0, .22),
       (COUNT, 'hand_chimes', 'A5', 3.0, .4, .3, .4), (COUNT + 2.7, 'vibraphone_bowed', 'C5', FULL - COUNT - 2.7, .24, -.2, .14)]
S.seed(31)
sc = S.render(ev, dur=FULL + 1, master=False)[:N]
f0 = 55.0
drone = np.sin(2 * np.pi * f0 * tt) + .45 * np.sin(4 * np.pi * f0 * tt) + .22 * np.sin(6 * np.pi * f0 * tt)
drone *= env([(0, 0), (1, .02), (CUT, .03), (CLOSE, .035), (CLOSE + .9, 0), (BREACH, 0), (BREACH + .3, .03), (ARRIVE, .035), (FULL - 1, .03), (FULL, 0)])
sc += st(drone)
swell = np.zeros(N); sw = bp(rng.standard_normal(N), 300, 3000, 1)
for a, b in [(CUT - 1.0, CUT), (BREACH - 1.0, BREACH), (ARRIVE - 1.4, ARRIVE)]: swell += np.clip((tt - a) / (b - a), 0, 1) ** 3 * (tt < b)
sc += st(sw * swell * .05)
# the silence before the breach: the score is gated off between the section closing and the breach
gate = env([(0, 1), (CLOSE + .6, 1), (CLOSE + 1.4, 0), (BREACH - .02, 0), (BREACH, 1), (FULL, 1)])
sc = np.stack([hp(sc[:, c], 32, 2) for c in range(2)], 1) * gate[:, None]
sc = S.room(sc, size=.55, mix=.22)
music += sc

# ---------------- foley tied to the picture ----------------
for e in EV:
    k, t = e['type'], e['t']
    if k == 'whoosh' or k == 'orbit': add(mix, lp(whoosh(1.6, 1.0), 1800) * .07, t, 1, 0)
    elif k == 'ruler':
        for i in range(10): add(mix, hp(click(pitch=1.0 + .05 * i, v=1.0), 1500) * .04, t + i * .38, 1, -.3 + .06 * i)
    elif k == 'tick':
        for d in (0, .07): add(mix, hp(click(pitch=.9, v=1.0), 1200) * .08, t + d, 1, .25)
    elif k == 'cut':                                   # the ground is sliced open: a low tearing sweep
        n = int(1.3 * SR); x = np.arange(n) / SR
        add(mix, bp(rng.standard_normal(n), 80, 900, 2) * np.exp(-x / .5) * np.minimum(1, x / .02) * .16, t, 1, 0); add(mix, thump(1.0, 40) * .2, t, 1, 0)
    elif k == 'sound':
        for i in range(5): add(mix, hp(click(pitch=1.3, v=1.0), 1800) * .035, t + i * .2, 1, .1)
    elif k == 'close': add(mix, lp(whoosh(1.2, .8), 900) * .06, t, 1, 0)
    elif k == 'breach':                                 # earth giving way: a deep thump and a short gravelly roar
        add(mix, thump(1.0, 38) * .32, t, 1, 0)
        n = int(1.8 * SR); x = np.arange(n) / SR
        add(mix, lp(rng.standard_normal(n), 900, 2) * np.exp(-x / .6) * np.minimum(1, x / .04) * .14, t, 1, 0)
    elif k == 'ignite':
        add(mix, thump(1.0, 50) * .2, t, 1, 0)
        n = int(2.0 * SR); x = np.arange(n) / SR
        add(mix, bp(np.sin(2 * np.pi * 110 * x) + .5 * np.sin(2 * np.pi * 220.7 * x) + .3 * rng.standard_normal(n), 150, 2400, 1) * np.exp(-x / .7) * np.minimum(1, x / .05) * .03, t, 1, .15)
    elif k == 'impact':
        add(mix, thump(1.0, 34) * .36, t, 1, 0)
        n = int(2.4 * SR); x = np.arange(n) / SR
        add(mix, lp(rng.standard_normal(n), 1400, 2) * np.exp(-x / .8) * np.minimum(1, x / .02) * .16, t, 1, 0)
    elif k == 'fire': add(mix, lp(whoosh(1.0, 1.0), 2500) * .06, t, 1, .2)

# carve the voice band out of the music, then duck it under every line
mid = np.stack([bp(music[:, c], 300, 4000, 2) for c in range(2)], 1)
music = music - mid * (1 - 10 ** (-4 / 20))

# ---------------- narration ----------------
voice = np.zeros(N); active = np.zeros(N)
for c in CUES:
    x, sr = sf.read(os.path.join(HERE, 'out', 'voice', c['id'] + '.wav'), dtype='float64')
    if x.ndim > 1: x = x.mean(1)
    if sr != SR: x = soxr.resample(x, sr, SR)
    i = int(c['t0'] * SR); j = min(N, i + len(x)); voice[i:j] += x[:j - i]; active[i:j] = 1
voice = compress(hp(voice, 80, 2), thr=.18, ratio=3.0)
duck = np.convolve(active, np.ones(int(.25 * SR)) / int(.25 * SR), 'same')
music = music * (1 - .45 * np.clip(duck * 1.4, 0, 1))[:, None]
voice *= .16 / np.sqrt((voice[active > 0] ** 2).mean())
music *= (.16 * 10 ** (-10 / 20)) / np.sqrt((music[active > 0] ** 2).mean())
fx_r = np.sqrt((mix[active > 0] ** 2).mean())
mix *= min(1.0, (.16 * 10 ** (-11 / 20)) / max(fx_r, 1e-9))
mix += music + np.stack([voice, voice], 1)

out = mix[:int(FULL * SR)].copy()
nf = int(1.4 * SR); out[-nf:] *= np.linspace(1, 0, nf)[:, None] ** 1.5
out = np.stack([limit(compress(out[:, c], thr=.35, ratio=2.0)) for c in range(2)], 1)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), out.astype(np.float32), SR)
used = ['hand_chimes', 'vibraphone_bowed', 'contrabass_pizz', 'cellos_spic', 'contrabass', 'cellos', 'glockenspiel', 'harp', 'frame_drum', 'timpani', 'violins_pizz', 'horn']
cr = S.credits(used)
open(os.path.join(HERE, 'out', 'instruments.txt'), 'w').write('\n'.join(cr) if isinstance(cr, list) else str(cr))
vo = 20 * np.log10(np.sqrt((voice[active > 0] ** 2).mean())); mu = 20 * np.log10(np.sqrt((music[active > 0] ** 2).mean()))
print(f'mix peak {np.abs(out).max():.3f}  voice {vo:.1f} dB  music {mu:.1f} dB  gap {vo - mu:.1f} dB')
