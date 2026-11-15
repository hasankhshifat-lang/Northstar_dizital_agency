"""Sound for the three Spotlight Effect Shorts (shared): VibeVoice narration + foley from the page's events + a small synthesised score.

usage (from the library root, $LIB):  .venv/bin/python <project>/mix.py <film folder>   → <film folder>/out/mix.wav
The film folder holds out/events.json (exported by core/render/events.mjs). Event types used:
  vo {id}            the narration take (audio/narration_final.wav) starts here
  stroke {kind,col,d,pan}   a marker / pen stroke (squeak), length d
  peel {d}           a paper sheet pulled away
  magnet / click / pop / step / wipe / tick {pan}   object sounds
  cue {name}         music: 'music' starts the pluck pattern, 'drop' stops it (silence before the turn), 'reveal' = the answer hit
Mix order (TECHNIQUE.md §4–6): voice compressed first, music ~13 dB under the voice by RMS and kept out of 300 Hz–4 kHz,
foley ~8 dB under the voice, limiter. mux.sh then masters to −14 LUFS.
"""
import json, os, sys
import numpy as np, soundfile as sf, soxr
LIB = os.environ.get('LIB') or os.path.expanduser('~/lemo-opuscar')
sys.path.insert(0, LIB)
from core.audio.sfx import SR, bp, lp, hp, add, limit, compress, click, clack, pop, step, whoosh, ding, thump, noise, env_exp

HERE = os.path.dirname(os.path.abspath(__file__))
FILM = os.path.abspath(sys.argv[1])
D = json.load(open(os.path.join(FILM, 'out', 'events.json')))
EV, DUR = D['ev'], float(D['dur'])
N = int(round(DUR * SR))
rng = np.random.default_rng(11)
cue = {e['name']: e['t'] for e in EV if e['type'] == 'cue'}


def buf(): return np.zeros((N + SR, 2), np.float32)
def place(b, x, at, gain=1.0, pan=0.0):
    if at * SR < len(b): add(b, np.asarray(x, np.float32), max(0.0, at), gain, float(np.clip(pan, -1, 1)))
def rms(x): return float(np.sqrt(np.mean(np.square(x)) + 1e-12))


# ── voice
vo = buf()
x, sr = sf.read(os.path.join(HERE, 'audio', 'narration_final.wav'))
if x.ndim > 1: x = x.mean(1)
if sr != SR: x = soxr.resample(x, sr, SR)
x = hp(x, 80)
x = compress(x / (np.abs(x).max() + 1e-9) * .9, thr=.22, ratio=3.2)
for e in EV:
    if e['type'] == 'vo': place(vo, x, e['t'])
vrms = rms(vo[vo[:, 0] != 0]) if np.any(vo) else .1

# ── foley
fx = buf()
def squeak(d, col):
    """felt-tip marker on paper / board: narrow-band hiss with a little pitch wobble, soft attack and release"""
    d = max(.04, min(d, 1.2)); s = noise(d); n = len(s)
    f0 = 2600 if col == 'black' else 3000 if col == 'blue' else 3300
    s = bp(s, f0 * .55, f0 * 1.35) + .35 * bp(s, 700, 1400)
    env = np.minimum(1, np.arange(n) / (.012 * SR)) * np.minimum(1, (n - np.arange(n)) / (.03 * SR))
    env *= .75 + .25 * np.sin(np.arange(n) / SR * 2 * np.pi * 9 + rng.random() * 6)
    return s * env
for e in EV:
    t, ty, pan = e['t'], e['type'], e.get('pan', 0) * .5
    if ty == 'stroke': place(fx, squeak(e['d'], e.get('col', 'black')), t, .55 if e.get('kind') != 'write' else .4, pan)
    elif ty == 'peel':
        d = e['d']; s = bp(noise(d), 1800, 7000); s = s * np.hanning(len(s)); place(fx, s, t, .9, .3)
    elif ty == 'magnet': place(fx, clack(1.3 + .2 * rng.random(), .8), t, .9, pan)
    elif ty == 'click': place(fx, click(1.0 + .3 * rng.random(), .8), t, .7, pan)
    elif ty == 'pop': place(fx, pop(.8), t, .8, pan)
    elif ty == 'step': place(fx, step(.7), t, .7, pan)
    elif ty == 'tick': place(fx, click(1.6, .5), t, .5, pan)
    elif ty == 'whoosh': place(fx, whoosh(e.get('d', .3), .6), t, .6, pan)
    elif ty == 'wipe':
        d = e['d']; s = bp(noise(d), 300, 2500); n = len(s); s = s * np.minimum(1, np.minimum(np.arange(n), n - np.arange(n)) / (.05 * SR))
        place(fx, s, t, .9, pan)

# ── music: soft plucked mallet notes at 100 bpm (beat .6 s), from 'music' to 'drop'; resolve on 'reveal'
mu = buf()
def pluck(f, d=1.4, v=1.0):
    t = np.arange(int(d * SR)) / SR
    s = (np.sin(2 * np.pi * f * t) + .35 * np.sin(4 * np.pi * f * t) * np.exp(-t / .12) + .12 * np.sin(6 * np.pi * f * t) * np.exp(-t / .05))
    return s * np.exp(-t / (.35 + 120 / f)) * np.minimum(1, t / .004) * v
midi = lambda m: 440 * 2 ** ((m - 69) / 12)
if 'music' in cue:
    a, b, beat = cue['music'], cue.get('drop', DUR), .6
    pat = [64, 67, 71, 67, 62, 67, 69, 67]              # E G B G D G A G: open, curious, unresolved
    k, t = 0, a
    while t < b - .05:
        place(mu, pluck(midi(pat[k % len(pat)]), 1.2, .5 + .2 * (k % 2 == 0)), t, 1, -.25 + .5 * (k % 2))
        if k % 4 == 0: place(mu, pluck(midi(pat[k % len(pat)] - 24), 1.6, .45), t, 1, 0)
        k += 1; t += beat / 2 if k % 4 == 3 else beat
if 'reveal' in cue:
    r = cue['reveal']
    for m, g in ((60, .55), (64, .45), (67, .45), (72, .5), (48, .5)):    # C major: the relief
        place(mu, pluck(midi(m), 2.4, g), r, 1, (m - 62) / 30)
mu[:, 0] = hp(lp(mu[:, 0], 6000), 120); mu[:, 1] = hp(lp(mu[:, 1], 6000), 120)

# ── reveal hit + faint room tone from the music cue
hit = buf()
if 'reveal' in cue:
    place(hit, ding(.7), cue['reveal'], .5, 0); place(hit, thump(.8, 62), cue['reveal'], .8, 0)
room = buf()
if 'music' in cue:
    a = cue['music']; d = DUR - a; s = lp(noise(d), 500) * .5
    s *= np.minimum(1, np.arange(len(s)) / (.4 * SR)); place(room, s, a, 1, 0)

# ── balance by RMS against the voice
def at_db(x, db):
    r = rms(x[np.any(x != 0, 1)]) if np.any(x) else 0
    return x * (vrms * 10 ** (db / 20) / r) if r > 0 else x
# duck foley and music under the voice (a smoothed voice envelope; ~-8 dB on foley, ~-4 dB on music while speaking)
env = np.abs(vo).max(1); k = int(.06 * SR); env = np.convolve(env, np.ones(k) / k, 'same'); env = np.clip(env / (env.max() * .25 + 1e-9), 0, 1)
duck_fx, duck_mu = (1 - .6 * env)[:, None], (1 - .37 * env)[:, None]
mix = vo + at_db(mu, -13) * duck_mu + at_db(fx, -11) * duck_fx + at_db(hit, -6) + at_db(room, -30)
mix = mix[:N]
for c in range(2): mix[:, c] = limit(mix[:, c], .92)
os.makedirs(os.path.join(FILM, 'out'), exist_ok=True)
sf.write(os.path.join(FILM, 'out', 'mix.wav'), mix, SR, subtype='PCM_24')
print('mix', os.path.join(FILM, 'out', 'mix.wav'), f'{DUR:.2f}s', 'events', len(EV))
