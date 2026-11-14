"""Score, foley, beds and voice for "No Lives Lost" -> out/mix.wav (+ out/stems/*.wav).
Reads out/timeline.json (tools/export.mjs) and voice/out/*.wav. Run with the library's Python: python mix.py
Score: 72 BPM, D minor. Felt piano (Salamander), strings (VSCO 2 CE), glass and bowed vibraphone (VCSL).
Foley: light-table hum and starter, the loupe on glass, paper, counter clicks, a pen stroke for the verdict.
Beds: hum on the table, a muffled street inside the White Star photograph, sea wind and swell inside the lifeboats.
Mix structure adapted from the Lemo-Opuscar Archive Light Table demo."""
import sys, os, json
import numpy as np, soundfile as sf, soxr
HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB') or '/root/lemo-opuscar'
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio.sfx import SR, add, noise, bp, lp, hp, env_exp, t_, norm, compress, clack, whoosh, brown

TL = json.load(open(os.path.join(HERE, 'out', 'timeline.json')))
HIT, BEAT, DUR = TL['hit'], TL['beat'], TL['dur']
N = int((DUR + 0.5) * SR)
S.seed(19)
st = lambda: np.zeros((N, 2), np.float32)
music, foley, beds, voice = st(), st(), st(), st()
b = lambda n: n * BEAT
def seg(t, a, c): return np.clip((t - a) / (c - a), 0, 1)
tt = np.arange(N) / SR

# ---------------- score ----------------
EV = []
def P(t, pitch, dur, vel, pan=0.0, inst='piano', gain=1.0): EV.append((t, inst, pitch, dur, vel, pan, gain))
def L(t, inst, pitch, dur, vel, pan=0.0, attack=1.0, release=.3): EV.append(dict(t=t, inst=inst, pitch=pitch, dur=dur, vel=vel, pan=pan, attack=attack, release=release))
CH = {'Dm': ['D3', 'A3', 'D4', 'F4'], 'Bb': ['Bb2', 'F3', 'Bb3', 'D4'], 'F': ['F3', 'A3', 'C4', 'F4'], 'A': ['A2', 'E3', 'A3', 'C#4'],
      'Gm': ['G2', 'D3', 'G3', 'Bb3'], 'Dm2': ['D3', 'F3', 'A3', 'D4']}
order = [0, 2, 1, 3]
def pulse(t0, t1, ch, vel=.30, pan=-.1, step=1.0):
    i = 0; t = t0
    while t < t1 - 0.01:
        P(t, CH[ch][order[i % 4]], b(step) * 1.5, vel * (1.1 if i % 4 == 0 else .9), pan + .12 * ((i % 2) * 2 - 1)); i += 1; t += b(step)

# Table on: one low note on the flicker
P(HIT['lightOn'], 'D2', 4.0, .45, 0); P(HIT['lightOn'], 'A2', 4.0, .3, 0)
# The claim (Union): felt quarter-note pulse Dm - Bb - F - A
prog = ['Dm', 'Bb', 'F', 'A']
t = b(2)
for i in range(4): pulse(t + i * b(4), t + (i + 1) * b(4), prog[i]);
P(HIT['pull0'], 'A5', 2.5, .42, .3, 'glass', .7)
# The crowd: pad under the negative turning positive, pulse continues
pulse(b(18), HIT['rise2'], 'Dm', .26, .1)
for pitch, inst, pan, v in [('D3', 'cellos', -.35, .30), ('A3', 'violas', -.1, .26), ('F4', 'violins', .3, .22)]:
    L(HIT['develop'], inst, pitch, HIT['rise2'] - HIT['develop'] + .5, v, pan, 1.6, .8)
P(HIT['develop'], 'D6', 2.5, .38, .2, 'vibraphone_bowed', .7)
# The turn: pulse stops; one held low note under "sank before dawn"
L(HIT['sank'] - 0.4, 'cellos', 'D2', 4.4, .42, 0, .6, 1.2); L(HIT['sank'] - 0.4, 'contrabass', 'D2', 4.4, .35, 0, .8, 1.2)
P(HIT['sank'], 'D3', 4.0, .4, 0); P(HIT['sank'], 'A3', 4.0, .3, 0)
# The count: pulse returns a step higher (Gm - Bb - A), glass on each number
for i, ch in enumerate(['Gm', 'Bb', 'Gm', 'A', 'Gm', 'A']): pulse(HIT['trib'] - b(1) + i * b(2), HIT['trib'] - b(1) + (i + 1) * b(2), ch, .30 + .015 * i, .15, 0.5)
P(HIT['trib'] + 1.4, 'G5', 2.0, .45, .2, 'glass', .7); P(HIT['med'] + 1.7, 'A5', 2.0, .48, -.2, 'glass', .7)
# Signature: riser strings from the develop through the push, cut for the breath, arrive on D minor
T0 = HIT['develop3']
for pitch, inst, pan, v in [('D4', 'violins', .35, .28), ('A3', 'violas', -.2, .28), ('D3', 'cellos', -.35, .30), ('F4', 'violins', .5, .22)]:
    L(T0, inst, pitch, HIT['suck'] - T0, v, pan, 1.6, .08)
for i in range(5): P(HIT['dive3'] + i * b(0.5), ['D4', 'F4', 'A4', 'D5', 'F5'][i], b(1), .28 + .04 * i, .1 * (i % 2 * 2 - 1))
E = HIT['enter3']
for p in ['D2', 'A2', 'D3', 'F3', 'A3', 'D4', 'F4', 'A4']: P(E, p, 3.4, .58, 0)
for pitch, inst, pan, v in [('D3', 'cellos', -.35, .5), ('A3', 'violas', -.15, .46), ('F4', 'violins', .25, .44), ('A4', 'violins', .4, .42), ('D2', 'contrabass', 0, .42)]:
    L(E, inst, pitch, 5.0, v, pan, .05, 2.0)
P(E, 'D6', 3.0, .45, .2, 'glass', .7); P(E, 'hit', None, .3, 0, 'sus_cymbal', .4)
for i, n in enumerate(['A4', 'F4', 'E4', 'D4', 'C#4', 'D4']): P(E + b(3) + i * b(1.5), n, b(2), .26 - .015 * i, .15)
P(HIT['count706'] + 1.2, 'F5', 2.0, .4, .2, 'glass', .6)
# Verdict: strings low and soft under "No lives lost", hush, then the strike lands on low D
L(HIT['compare'], 'cellos', 'D3', HIT['hush'] - HIT['compare'], .26, -.3, 1.2, .1)
L(HIT['compare'], 'violas', 'A3', HIT['hush'] - HIT['compare'], .22, .3, 1.4, .1)
L(HIT['hush'] + 1.0, 'cellos', 'D2', HIT['verdict'] - HIT['hush'] - 1.0, .22, 0, 1.5, .1)
P(HIT['verdict'], 'D2', 3.0, .68, 0); P(HIT['verdict'], 'D3', 3.0, .55, 0); P(HIT['verdict'], 'A3', 3.0, .42, 0)
P(HIT['verdict'], 'D6', 2.5, .5, .3, 'glass', .8); P(HIT['verdict'], 'D3', 2.5, .42, 0, 'timpani', .5)
# Index and end card: the figure resolves
for i, n in enumerate(['F4', 'A4', 'D5', 'C#5', 'D5']): P(HIT['index'] + i * b(1), n, b(1.8), .32, .15 * (i % 2 * 2 - 1))
for p in ['D3', 'A3', 'D4', 'F4', 'A4', 'D5']: P(HIT['endCard'], p, 4.0, .40, 0)
for pitch, inst, pan, v in [('D3', 'cellos', -.3, .34), ('A3', 'violas', -.1, .30), ('F4', 'violins', .25, .28)]:
    L(HIT['endCard'], inst, pitch, 3.2, v, pan, .3, 1.0)
P(HIT['endCard'], 'A5', 3.5, .40, -.2, 'vibraphone_bowed', .6)

mus = S.render(EV, dur=DUR + 0.5, master=False)
mus = mus[:N] if len(mus) >= N else np.pad(mus, ((0, N - len(mus)), (0, 0)))
mus = S.room(mus, size=.5, mix=.22)
gate = np.ones(N)
for a, c in [(HIT['suck'] - 0.1, HIT['enter3'] - 0.01), (HIT['hush'], HIT['hush'] + 1.0)]:
    gate *= 1 - (seg(tt, a, a + 0.12) * (1 - seg(tt, c, c + 0.005)))
music += (mus * gate[:, None]).astype(np.float32)

# ---------------- foley ----------------
def glass_tap(v=1.0, pitch=1.0):
    d = .5; x = clack(1.6 * pitch, v); x = np.pad(x, (0, int(d * SR) - len(x)))
    ring_ = sum(a * np.sin(2 * np.pi * f * pitch * t_(d)) * env_exp(d, tau) for f, a, tau in [(3150, .25, .09), (5230, .15, .05), (1870, .12, .12)])
    return norm(x * .8 + ring_ * .5) * v
def paper(d=.45, v=1.0):
    x = bp(noise(d), 1800, 7000) * np.sin(np.pi * np.linspace(0, 1, int(round(d * SR)))) ** 1.5
    return norm(x) * v
def tick(v=1.0):
    d = .05; x = bp(noise(d), 2500, 9000) * env_exp(d, .003) + np.sin(2 * np.pi * 2200 * t_(d)) * env_exp(d, .006) * .4
    return norm(x) * v
def starter(v=1.0):
    d = .07; x = hp(noise(d), 800) * env_exp(d, .006) + np.sin(2 * np.pi * 900 * t_(d)) * env_exp(d, .01) * .5
    return norm(x) * v
def pen(d=.3, v=1.0):
    x = bp(noise(d), 2500, 6500) * (1 + .5 * np.sin(2 * np.pi * 37 * t_(d))) * np.sin(np.pi * np.linspace(0, 1, int(round(d * SR)))) ** .6
    return norm(x) * v
def swell(d=.8, v=1.0):
    x = lp(noise(d), 900) * np.linspace(0, 1, int(round(d * SR))) ** 2
    return norm(x) * v

for t0, v in [(0.0, .5), (0.17, .35), (0.30, .3), (0.42, .4), (0.55, .3)]: add(foley, starter(v), t0, .5, .35)
for k in ('drop1', 'drop2', 'drop3'): add(foley, glass_tap(1.0), HIT[k] - 0.02, .62, .1)
for t0 in (HIT['lift1'], HIT['rise2'] + 1.0, HIT['rise3'] + 1.0): add(foley, glass_tap(.5, 1.2), t0, .25, .1); add(foley, whoosh(.4, .6), t0, .25, -.2)
for k in ('lineDate', 'lineAfloat', 'lineLost', 'trib', 'med'): add(foley, paper(1.0, .8), HIT[k], .22, .25)
add(foley, glass_tap(.7, 1.5), HIT['pull0'], .3, .3)
add(foley, glass_tap(.6, 1.3), HIT['sank'], .3, -.2)
for t0 in (HIT['trib'] - 1.0, HIT['med'] - 1.0): add(foley, whoosh(.7, .6), t0, .3, .2); add(foley, paper(.8, .7), t0 + .3, .2, -.3)
for k, d in (('dive1', .8), ('dive2', 1.2), ('dive3', 1.4)): add(foley, whoosh(d, .7), HIT[k], .32, 0)
add(foley, swell(.8, .9), HIT['develop'] - 0.05, .35, 0); add(foley, swell(.8, .9), HIT['develop3'] - 0.05, .35, 0)
rd = HIT['suck'] - HIT['dive3']; ns = noise(rd); ramp = np.linspace(0, 1, len(ns))
riser = (bp(ns, 400, 2400) * .6 + hp(ns, 2400) * .4) * ramp ** 2.2
add(foley, (norm(riser) * .9).astype(np.float32), HIT['dive3'], .5, 0)
# counter clicks while the printed count climbs (0 -> 1,340, 1,340 -> 1,492, 0 -> 706)
for a, c, n in [(HIT['trib'] + 1.4, HIT['trib'] + 2.2, 12), (HIT['med'] + 1.7, HIT['med'] + 2.3, 6), (HIT['count706'] + .2, HIT['count706'] + 1.2, 9)]:
    for i in range(n): add(foley, tick(.7), a + (c - a) * (i / n) ** 1.3, .26, .15)
add(foley, pen(.32, 1.0), HIT['verdict'], .4, -.2)
for i in range(5): add(foley, tick(.6), HIT['index'] + 0.2 + i * 0.15 + 0.45, .22, .3)

# ---------------- beds ----------------
hum = sum(a * np.sin(2 * np.pi * f * tt + p) for f, a, p in [(100, .5, 0), (200, .35, 1), (300, .2, 2), (400, .12, 3), (1200, .03, 0)])
hum = hum * (1 + .1 * np.sin(2 * np.pi * .7 * tt)) + bp(noise(DUR + .5)[:N], 3000, 8000) * .05
on = seg(tt, HIT['lightOn'] - 0.25, HIT['lightOn'])
def inside(a, c): return seg(tt, a, a + 0.6) * (1 - seg(tt, c - 0.6, c))
street = inside(HIT['enter2'] - 0.6, HIT['rise2'] + 0.6)       # J-cut: the street comes in before we arrive
sea = inside(HIT['enter3'] - 0.05, HIT['rise3'] + 0.8)          # the sea starts on the downbeat after the breath
ins = np.maximum(street, sea)
beds += np.stack([hum * on * (1 - .85 * ins) * .05] * 2, 1).astype(np.float32)
murmur = lp(bp(noise(DUR + .5)[:N], 250, 2200), 1500) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.37 * tt) ** 2)
hooves = np.zeros(N)
for k in range(10):
    t0 = HIT['enter2'] - 0.4 + k * 0.42 + (0.07 if k % 2 else 0)
    i0 = int(t0 * SR); d = int(.06 * SR)
    if 0 <= i0 < N - d: hooves[i0:i0 + d] += lp(noise(.06), 500)[:d] * env_exp(.06, .012)[:d] * (1 if k % 2 else .7)
st_bed = (norm(murmur) * .8 + norm(hooves) * .35) * street
wind = lp(brown(DUR + .5)[:N], 700) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.23 * tt + 1) ** 2)
swellw = lp(bp(noise(DUR + .5)[:N], 120, 900), 600) * (0.4 + 0.6 * np.sin(2 * np.pi * 0.09 * tt) ** 4)
sea_bed = (norm(wind) * .6 + norm(swellw) * .5) * sea
bed2 = st_bed * .12 + sea_bed * .18
beds[:, 0] += bed2.astype(np.float32); beds[:, 1] += np.roll(bed2, 900).astype(np.float32)

# ---------------- voice ----------------
for v in TL['voice']:
    x, sr = sf.read(os.path.join(HERE, 'voice', 'out', v['id'] + '.wav'), dtype='float32')
    if x.ndim > 1: x = x.mean(1)
    x = soxr.resample(x, sr, SR)
    x = compress(x / max(1e-6, np.abs(x).max()) * .9, thr=.22, ratio=3.0)
    x = hp(x, 70)
    add(voice, x.astype(np.float32), v['t'], 1.0, 0)

# ---------------- mix ----------------
def rms(x): return float(np.sqrt(np.mean(x ** 2)) + 1e-12)
vo = voice.mean(1); env = np.convolve(np.abs(vo) > .02, np.ones(int(.25 * SR)) / (.25 * SR), 'same'); env = np.clip(env * 3, 0, 1)
duck = 1 - 0.45 * env
vr = rms(voice[np.abs(voice).max(1) > .01])
mr = rms(music[np.abs(music).max(1) > .005])
music *= (vr / mr) * 10 ** (-11 / 20)
music *= duck[:, None].astype(np.float32)
foley *= (vr / max(rms(foley[np.abs(foley).max(1) > .01]), 1e-6)) * 10 ** (-9 / 20)
beds *= (vr / max(rms(beds[np.abs(beds).max(1) > .002]), 1e-6)) * 10 ** (-20 / 20)
from scipy.signal import butter, sosfilt
hpf = butter(4, 38, 'high', fs=SR, output='sos')
for x in (music, foley, beds): x[:] = sosfilt(hpf, x, axis=0)
mix = music + foley + beds + voice
from core.audio.sfx import limit
pk0 = np.abs(mix).max(); vr_lvl = rms(mix)
ceil = min(pk0, vr_lvl * 10 ** (11.5 / 20))
mix = np.stack([limit(mix[:, 0], ceil), limit(mix[:, 1], ceil)], 1).astype(np.float32)
peak = np.abs(mix).max(); mix *= .89 / peak
os.makedirs(os.path.join(HERE, 'out', 'stems'), exist_ok=True)
for nm, x in (('music', music), ('foley', foley), ('beds', beds), ('voice', voice)): sf.write(os.path.join(HERE, 'out', 'stems', nm + '.wav'), (x / peak * .89).astype(np.float32), SR)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix.astype(np.float32), SR)
print('mix written', round(len(mix) / SR, 2), 's; peak', round(float(peak), 3))
print('\n'.join(S.credits(sorted({e[1] if isinstance(e, tuple) else e['inst'] for e in EV}))))
