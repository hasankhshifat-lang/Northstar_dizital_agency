"""Score, foley, beds and voice for one film of an As Printed episode -> out/<film>/mix.wav.
usage: python mix.py <episode_dir> <film>     (library Python: /root/lemo-opuscar/.venv/bin/python)
Reads out/<film>/timeline.json and voice/<film>/out/*.wav. Score: D minor, felt piano (Salamander), strings (VSCO 2 CE),
glass and bowed vibraphone (VCSL), chosen per shot type so a 10-minute film keeps changing:
  title: one low note, then a slow pulse · read: quarter-note piano pulse on a 4-chord loop (key moves each chapter)
  photo: strings rise from the develop, a breath before the push, a chord inside the photograph
  table: arpeggio in eighths · chapter: a single held chord · compare: low strings, near-silence, the strike on low D
  end: the figure resolves.
Foley: table hum and starter, glass taps on loupe drops, paper on lit lines, ticks on counting cards, pen on the strike.
Beds: hum on the table; wind and room inside photographs (sea swell when the item has "water")."""
import sys, os, json
import numpy as np, soundfile as sf, soxr
LIB = os.environ.get('LIB') or '/root/lemo-opuscar'
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio.sfx import SR, add, noise, bp, lp, hp, env_exp, t_, norm, compress, clack, whoosh, brown, limit
D, FILM = os.path.abspath(sys.argv[1]), sys.argv[2]
TL = json.load(open(os.path.join(D, 'out', FILM, 'timeline.json')))
EP = json.load(open(os.path.join(D, 'episode.json'))); KIND = {i['id']: i for i in EP['items']}
SH, DUR = TL['shots'], TL['dur']
N = int((DUR + 0.6) * SR); S.seed(abs(hash(EP.get('slug', 'x'))) % 1000)
st = lambda: np.zeros((N, 2), np.float32)
music, foley, beds, voice = st(), st(), st(), st()
BEAT = 60 / 72; b = lambda n: n * BEAT
tt = np.arange(N) / SR
def seg(t, a, c): return np.clip((t - a) / (c - a), 0, 1)

EV = []
def P(t, pitch, dur, vel, pan=0.0, inst='piano', gain=1.0): EV.append((t, inst, pitch, dur, vel, pan, gain))
def L(t, inst, pitch, dur, vel, pan=0.0, attack=1.0, release=.4): EV.append(dict(t=t, inst=inst, pitch=pitch, dur=dur, vel=vel, pan=pan, attack=attack, release=release))
KEYS = [  # chord loops (roots move each chapter): D minor, F major, G minor, A minor feel
    [['D3', 'A3', 'D4', 'F4'], ['Bb2', 'F3', 'Bb3', 'D4'], ['F3', 'A3', 'C4', 'F4'], ['A2', 'E3', 'A3', 'C#4']],
    [['F3', 'C4', 'F4', 'A4'], ['D3', 'A3', 'D4', 'F4'], ['Bb2', 'F3', 'Bb3', 'D4'], ['C3', 'G3', 'C4', 'E4']],
    [['G2', 'D3', 'G3', 'Bb3'], ['Eb3', 'Bb3', 'Eb4', 'G4'], ['Bb2', 'F3', 'Bb3', 'D4'], ['D3', 'A3', 'D4', 'F#4']],
]
order = [0, 2, 1, 3]
key = 0; chord_i = 0
def pulse(t0, t1, vel=.28, step=1.0, pan=-.1):
    global chord_i
    t = t0; i = 0
    while t < t1 - 0.05:
        ch = KEYS[key][chord_i % 4]
        P(t, ch[order[i % 4]], b(step) * 1.5, vel * (1.1 if i % 4 == 0 else .9), pan + .12 * ((i % 2) * 2 - 1))
        i += 1; t += b(step)
        if i % 4 == 0: chord_i += 1
def pad(t0, t1, vel=.24):
    ch = KEYS[key][chord_i % 4]
    for pitch, inst, pan in [(ch[0], 'cellos', -.35), (ch[1], 'violas', -.1), (ch[2], 'violins', .3)]: L(t0, inst, pitch, max(.5, t1 - t0), vel, pan, 1.4, 1.0)

gates = []
for i, s in enumerate(SH):
    t0, t1, ty = s['t0'], s['t1'], s['type']
    if ty == 'title':
        P(0.67, 'D2', 4.0, .45); P(0.67, 'A2', 4.0, .3); pulse(t0 + 1.5, t1, .22, 2.0)
    elif ty == 'read':
        pulse(t0, t1, .28)
        if s.get('card'): P(t0 + 2.8, 'A5', 2.0, .38, .3, 'glass', .6)
    elif ty == 'table':
        pulse(t0, t1, .26, 0.5, .15)
        if s.get('card'): P(t0 + 1.2, 'G5', 2.0, .38, -.2, 'glass', .6)
    elif ty == 'photo':
        tDrop, tDive, tIn = t0 + 0.9, t0 + 1.4, t0 + 2.6
        ch = KEYS[key][chord_i % 4]
        for pitch, inst, pan, v in [(ch[2], 'violins', .35, .26), (ch[1], 'violas', -.2, .26), (ch[0], 'cellos', -.35, .28)]: L(tDrop, inst, pitch, tIn - 0.15 - tDrop, v, pan, 1.0, .08)
        gates.append((tIn - 0.3, tIn - 0.01))
        for p in ch: P(tIn, p, 3.0, .5, 0)
        for pitch, inst, pan, v in [(ch[0], 'cellos', -.35, .4), (ch[1], 'violas', -.15, .36), (ch[2], 'violins', .25, .34)]: L(tIn, inst, pitch, max(1.0, t1 - tIn - 0.4), v, pan, .05, 1.6)
        P(tIn, 'D6', 2.5, .4, .2, 'glass', .6)
        for j, n in enumerate([ch[3], ch[2], ch[1]]): P(tIn + b(3) + j * b(1.5), n.replace('3', '4').replace('2', '3'), b(2), .22, .15)
    elif ty == 'chapter':
        key = (key + 1) % len(KEYS); chord_i = 0
        ch = KEYS[key][0]
        for p in ch: P(t0 + 0.3, p, min(4.0, t1 - t0), .36, 0)
        P(t0 + 0.3, ch[3].replace('4', '6'), 2.5, .34, .2, 'vibraphone_bowed', .6)
    elif ty == 'compare':
        L(t0, 'cellos', 'D3', t1 - t0, .24, -.3, 1.2, .2); L(t0, 'violas', 'A3', t1 - t0, .2, .3, 1.4, .2)
        ts = t0 + (s.get('strikeAt') or (t1 - t0) * 0.62)
        gates.append((ts - 0.9, ts - 0.01))
        P(ts, 'D2', 3.0, .66); P(ts, 'D3', 3.0, .52); P(ts, 'D6', 2.5, .48, .3, 'glass', .7)
    elif ty == 'end':
        for j, n in enumerate(['F4', 'A4', 'D5', 'C#5', 'D5']): P(t0 + 1.4 + j * b(1), n, b(1.8), .3, .15 * (j % 2 * 2 - 1))
        for p in ['D3', 'A3', 'D4', 'F4', 'A4', 'D5']: P(t0 + 2.6, p, 4.5, .38, 0)
        for pitch, inst, pan, v in [('D3', 'cellos', -.3, .3), ('A3', 'violas', -.1, .28), ('F4', 'violins', .25, .26)]: L(t0 + 2.6, inst, pitch, max(1, t1 - t0 - 2.8), v, pan, .3, 1.5)

mus = S.render(EV, dur=DUR + 0.6, master=False)
mus = mus[:N] if len(mus) >= N else np.pad(mus, ((0, N - len(mus)), (0, 0)))
mus = S.room(mus, size=.5, mix=.22)
gate = np.ones(N)
for a, c in gates: gate *= 1 - (seg(tt, a, a + 0.12) * (1 - seg(tt, c, c + 0.005)))
music += (mus * gate[:, None]).astype(np.float32)

def glass_tap(v=1.0, pitch=1.0):
    d = .5; x = clack(1.6 * pitch, v); x = np.pad(x, (0, int(d * SR) - len(x)))
    r = sum(a * np.sin(2 * np.pi * f * pitch * t_(d)) * env_exp(d, tau) for f, a, tau in [(3150, .25, .09), (5230, .15, .05), (1870, .12, .12)])
    return norm(x * .8 + r * .5) * v
def paper(d=.45, v=1.0): return norm(bp(noise(d), 1800, 7000) * np.sin(np.pi * np.linspace(0, 1, int(round(d * SR)))) ** 1.5) * v
def tick(v=1.0): d = .05; return norm(bp(noise(d), 2500, 9000) * env_exp(d, .003) + np.sin(2 * np.pi * 2200 * t_(d)) * env_exp(d, .006) * .4) * v
def starter(v=1.0): d = .07; return norm(hp(noise(d), 800) * env_exp(d, .006) + np.sin(2 * np.pi * 900 * t_(d)) * env_exp(d, .01) * .5) * v
def pen(d=.3, v=1.0): return norm(bp(noise(d), 2500, 6500) * (1 + .5 * np.sin(2 * np.pi * 37 * t_(d))) * np.sin(np.pi * np.linspace(0, 1, int(round(d * SR)))) ** .6) * v
def swell(d=.8, v=1.0): return norm(lp(noise(d), 900) * np.linspace(0, 1, int(round(d * SR))) ** 2) * v
if SH and SH[0]['type'] == 'title':
    for t0, v in [(0.0, .5), (0.17, .35), (0.30, .3), (0.42, .4), (0.55, .3)]: add(foley, starter(v), t0, .5, .35)
inside = np.zeros(N); sea = np.zeros(N)
for s in SH:
    t0, t1, ty = s['t0'], s['t1'], s['type']
    if ty in ('read', 'photo'):
        add(foley, glass_tap(1.0), t0 + 0.88, .6, .1); add(foley, whoosh(1.1, .7), t0 + 1.4, .3, 0)
        add(foley, glass_tap(.5, 1.2), t1 - 0.55, .25, .1)
    if ty == 'read':
        n = len(s.get('boxes') or []); span = max(.5, (t1 - 1.3) - (t0 + 2.6) - .6)
        for j in range(n): add(foley, paper(.9, .8), t0 + 2.8 + j * span / max(1, n), .2, .25)
    if ty == 'table':
        add(foley, whoosh(.7, .6), t0, .28, .2); add(foley, paper(.8, .7), t0 + 1.2, .2, -.3)
    if ty == 'photo':
        it = KIND.get(s['item'], {})
        if it.get('kind') == 'negative': add(foley, swell(.8, .9), t0 + 1.25, .32, 0)
        rd = 1.1; ns = noise(rd); riser = (bp(ns, 400, 2400) * .6 + hp(ns, 2400) * .4) * np.linspace(0, 1, len(ns)) ** 2.2
        add(foley, (norm(riser) * .8).astype(np.float32), t0 + 2.6 - 0.3 - rd, .45, 0)
        m = seg(tt, t0 + 2.3, t0 + 2.9) * (1 - seg(tt, t1 - 1.4, t1 - 0.6))
        (sea if it.get('water') else inside)[:] = np.maximum(sea if it.get('water') else inside, m)
    if ty == 'chapter': add(foley, whoosh(.8, .5), t0, .25, -.2)
    if ty == 'compare':
        ts = t0 + (s.get('strikeAt') or (t1 - t0) * 0.62); add(foley, pen(.32, 1.0), ts, .4, -.2)
    c = s.get('card')
    if c and c.get('value'):
        at = t0 + (c.get('at') or (2.8 if ty in ('read', 'photo') else 1.2))
        if c['value'].replace(',', '').isdigit():
            for i in range(10): add(foley, tick(.6), at + 0.2 + 1.0 * (i / 10) ** 1.3, .2, .15)
    if ty == 'end':
        for i in range(sum(1 for it in EP['items'] if it.get('row'))): add(foley, tick(.6), t0 + 1.85 + i * 0.12, .2, .3)
hum = sum(a * np.sin(2 * np.pi * f * tt + p) for f, a, p in [(100, .5, 0), (200, .35, 1), (300, .2, 2), (400, .12, 3), (1200, .03, 0)])
hum = hum * (1 + .1 * np.sin(2 * np.pi * .7 * tt)) + bp(noise(DUR + .6)[:N], 3000, 8000) * .05
on = seg(tt, 0.45, 0.7) if SH and SH[0]['type'] == 'title' else np.ones(N)
ins = np.maximum(inside, sea)
beds += np.stack([hum * on * (1 - .85 * ins) * .05] * 2, 1).astype(np.float32)
room = lp(bp(noise(DUR + .6)[:N], 150, 1800), 1200) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.31 * tt) ** 2)
wind = lp(brown(DUR + .6)[:N], 700) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.23 * tt + 1) ** 2)
swl = lp(bp(noise(DUR + .6)[:N], 120, 900), 600) * (0.4 + 0.6 * np.sin(2 * np.pi * 0.09 * tt) ** 4)
bed2 = (norm(room) * .6 + norm(wind) * .4) * inside * .12 + (norm(wind) * .6 + norm(swl) * .5) * sea * .18
beds[:, 0] += bed2.astype(np.float32); beds[:, 1] += np.roll(bed2, 900).astype(np.float32)

for s in SH:
    if not s.get('voice'): continue
    x, sr = sf.read(os.path.join(D, 'voice', FILM, 'out', s['voice'] + '.wav'), dtype='float32')
    if x.ndim > 1: x = x.mean(1)
    x = soxr.resample(x, sr, SR); x = compress(x / max(1e-6, np.abs(x).max()) * .9, thr=.22, ratio=3.0); x = hp(x, 70)
    add(voice, x.astype(np.float32), s['vt'], 1.0, 0)

def rms(x): return float(np.sqrt(np.mean(x ** 2)) + 1e-12)
vo = voice.mean(1); from scipy.signal import fftconvolve; env = fftconvolve((np.abs(vo) > .02).astype(np.float64), np.ones(int(.25 * SR)) / (.25 * SR), 'same')   # fft: direct np.convolve took hours on CPU; env = np.clip(env * 3, 0, 1)
vr = rms(voice[np.abs(voice).max(1) > .01])
music *= (vr / rms(music[np.abs(music).max(1) > .005])) * 10 ** (-12 / 20); music *= (1 - 0.45 * env)[:, None].astype(np.float32)
foley *= (vr / max(rms(foley[np.abs(foley).max(1) > .01]), 1e-6)) * 10 ** (-10 / 20)
beds *= (vr / max(rms(beds[np.abs(beds).max(1) > .002]), 1e-6)) * 10 ** (-21 / 20)
from scipy.signal import butter, sosfilt
hpf = butter(4, 38, 'high', fs=SR, output='sos')
for x in (music, foley, beds): x[:] = sosfilt(hpf, x, axis=0)
mix = music + foley + beds + voice
pk0 = np.abs(mix).max(); ceil = min(pk0, rms(mix) * 10 ** (11.5 / 20))
mix = np.stack([limit(mix[:, 0], ceil), limit(mix[:, 1], ceil)], 1).astype(np.float32)
mix *= .89 / np.abs(mix).max()
sf.write(os.path.join(D, 'out', FILM, 'mix.wav'), mix, SR)
print(FILM, 'mix', round(len(mix) / SR, 2), 's')
print('\n'.join(S.credits(sorted({e[1] if isinstance(e, tuple) else e['inst'] for e in EV}))))
