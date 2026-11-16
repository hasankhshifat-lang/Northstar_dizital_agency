"""The Overthinking Pad: sound for one film (long or short).
usage: $LIB/.venv/bin/python mix.py <episode_dir> <film>
Inputs: out/<film>/timeline.json, voice/<film>/out/<id>.wav (VibeVoice), out/<film>/events.json (strokes + cues).
Output: out/<film>/mix.wav (48 kHz stereo): narration + pen foley from the strokes + a small plucked score
(marimba / kalimba / pizzicato, chords follow the scenes) that ducks under the voice. Master loudness is set by mux.sh.
Adapted from the lemo-opuscar Sketchnote demo mix (MIT)."""
import json, os, sys
import numpy as np, soundfile as sf, soxr
LIB = os.environ.get('LIB', '/root/lemo-opuscar'); sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio.sfx import SR, bp, lp, hp, add, compress, limit, click, whoosh

EP, FILM = os.path.abspath(sys.argv[1]), sys.argv[2]
TL = json.load(open(os.path.join(EP, 'out', FILM, 'timeline.json')))
EV = json.load(open(os.path.join(EP, 'out', FILM, 'events.json')))['ev']
DUR = float(TL['dur']); N = int(DUR * SR); rng = np.random.default_rng(31); tt = np.arange(N) / SR
rms = lambda x: float(np.sqrt(np.mean(np.square(x)) + 1e-12)); db = lambda x: 20 * np.log10(x + 1e-12)
def smooth(x, sec): k = max(1, int(sec * SR)); return np.convolve(x, np.ones(k) / k, 'same')

# ---------- voice ----------
vo = np.zeros(N); vmask = np.zeros(N)
for sh in TL['shots']:
    if not sh.get('voice'): continue
    x, sr = sf.read(os.path.join(EP, 'voice', FILM, 'out', sh['voice'] + '.wav'), dtype='float32')
    if x.ndim > 1: x = x.mean(1)
    if sr != SR: x = soxr.resample(x, sr, SR)
    i = int(sh['vt'] * SR); n = min(len(x), N - i); vo[i:i + n] += x[:n]; vmask[i:i + n] = 1
vo = hp(vo, 80)
vo = compress(vo / (np.abs(vo).max() + 1e-9) * 0.9, thr=0.22, ratio=2.6, att=0.003, rel=0.12)
duck = smooth(np.maximum(vmask, np.roll(vmask, int(0.12 * SR))), 0.15)

# ---------- pen foley ----------
def activity(kind):
    a = np.zeros(N); pw = np.zeros(N)
    for e in EV:
        if e['type'] != kind: continue
        i0 = int(e['t'] * SR); i1 = min(N, int((e['t'] + max(e['d'], 0.03)) * SR))
        if i1 <= i0 or i0 >= N: continue
        n = i1 - i0; env = np.ones(n); r = min(n // 3, int(0.012 * SR))
        if r > 0: env[:r] = np.linspace(0, 1, r); env[-r:] = np.linspace(1, 0, r)
        a[i0:i1] += env; pw[i0:i1] += env * e.get('pan', 0)
    pan = np.where(a > 1e-6, pw / np.maximum(a, 1e-6), 0)
    return smooth(1 - np.exp(-a * 0.9), 0.02), smooth(pan, 0.02)
def scratch_noise(lo, hi, grain_hz, depth, seed):
    r = np.random.default_rng(seed); x = bp(r.standard_normal(N), lo, hi, 2)
    g = lp(np.abs(r.standard_normal(N)), grain_hz, 1); g = g / (np.percentile(g, 95) + 1e-9)
    return x * ((1 - depth) + depth * g)
def wobble(rate, seed):
    r = np.random.default_rng(seed)
    ph = np.cumsum(rate * (1 + 0.35 * lp(r.standard_normal(N), 3, 1) * 8) / SR) * 2 * np.pi
    return 0.55 + 0.45 * np.abs(np.sin(ph))
def pan_st(x, pan): th = (pan + 1) * np.pi / 4; return np.stack([x * np.cos(th), x * np.sin(th)], 1)
foley = np.zeros((N, 2))
for kind, (lo, hi, gh, dep, rate, pw, g, sd) in {
        'pen': (2400, 6500, 900, 0.85, 6, 1.0, 0.12, 1), 'write': (2000, 6000, 700, 0.9, 11, 1.5, 0.15, 3),
        'marker': (700, 3200, 300, 0.6, 14, 2.0, 0.12, 5)}.items():
    lv, pn = activity(kind)
    foley += pan_st(scratch_noise(lo, hi, gh, dep, sd) * wobble(rate, sd + 1) ** pw * lv, pn * 0.6) * g
for e in EV:
    if e['type'] in ('pen', 'write') and e['d'] >= 0.15 and e['t'] < DUR:
        add(foley, hp(click(pitch=0.55 + rng.random() * 0.2, v=1.0), 1500) * 0.015, e['t'], 1.0, e.get('pan', 0) * 0.6)
foley *= 0.22 * (1 - 0.8 * duck)[:, None]   # owner 2026-11-16: pens well under the voice (quieter overall, ducked ~14 dB while speaking)
room = lp(rng.standard_normal(N), 500, 2) * 0.004; foley += np.stack([room, np.roll(room, 997)], 1)
cues = [e for e in EV if e['type'] == 'cue']
for e in cues:
    if e['name'] == 'whoosh' and e['t'] < DUR - 0.5: add(foley, lp(whoosh(min(1.2, max(0.4, e.get('d', 0.7))), 1.0), 2800) * 0.07, max(0, e['t']), 1.0, 0.15)

# ---------- score ----------
B = 0.6
PROG = [[53, 60, 65, 69, 72], [50, 57, 62, 65, 69], [46, 58, 62, 65, 70], [48, 55, 60, 64, 67]]   # F, Dm, Bb, C
scenes = [s for s in TL['shots']]
first_music = next((s['t0'] for s in scenes if s['type'] == 'sting'), None)
if first_music is None: first_music = scenes[1]['t0'] if FILM == 'short' and len(scenes) > 1 else 0.0
ev = []
for i, s in enumerate(scenes):
    a, b = s['t0'], s['t1']
    if b <= first_music: continue
    a = max(a, first_music); ns = PROG[i % 4]
    if s['type'] in ('chapter', 'sting'):
        ev.append((a + 0.1, 'kalimba', ns[4] + 12, 1.4, 0.55, -0.25, 0.75)); ev.append((a + 0.1, 'cellos_pizz', ns[0] - 12 if ns[0] > 50 else ns[0], 0.9, 0.5, -0.1, 0.8))
        continue
    if s['type'] == 'end':
        for j, p in enumerate([53, 60, 65, 69, 72, 77]): ev.append((a + 0.4 + j * 0.035, 'harp', p, 3.0, 0.6, -0.3 + j * 0.12, 0.85))
        ev += [(a + 0.4, 'vibraphone', 65, 3.0, 0.5, 0.0, 0.6), (a + 0.42, 'glockenspiel', 89, 2.4, 0.5, 0.2, 0.5), (a + 0.4, 'cellos_pizz', 41, 1.6, 0.6, 0.0, 0.85)]
        continue
    ev.append((a, 'cellos_pizz', ns[0] if ns[0] < 52 else ns[0] - 12, 0.8, 0.42, -0.1, 0.7))
    t = a + B; k = 0
    while t < b - 0.05:
        ev.append((t, 'marimba', ns[1 + (k * 2) % 4], 0.4, 0.22 + 0.05 * (k % 2 == 0), 0.15, 0.42))
        if k % 8 == 7: ev.append((t, 'kalimba', ns[3] + 12, 0.8, 0.3, -0.25, 0.4))
        t += B; k += 1
S.seed(5)
music = S.render(ev, dur=DUR + 3, master=False)[:N]
music = S.room(music, size=0.4, mix=0.2)
music = music - 0.4 * np.stack([bp(music[:, 0], 300, 4000), bp(music[:, 1], 300, 4000)], 1)
music *= (1 - 0.5 * duck)[:, None]
fade_in = np.clip((tt - first_music) / 0.6, 0, 1); music *= fade_in[:, None]
music *= np.clip((DUR - tt) / 1.0, 0, 1)[:, None]

# ---------- balance ----------
spk = vmask > 0
vg = (rms(music[spk].mean(1)) * 10 ** (12 / 20)) / rms(vo[spk])
mix = foley + music + np.stack([vo * vg, vo * vg], 1)
print(f'{FILM}: voice vs music {db(rms(vo[spk]) * vg) - db(rms(music[spk].mean(1))):.1f} dB; voice vs pens {db(rms(vo[spk]) * vg) - db(rms(foley[spk].mean(1))):.1f} dB')
mix = np.stack([limit(compress(mix[:, c], thr=0.35, ratio=2.0)) for c in (0, 1)], 1)
mix *= np.clip((DUR - tt) / 0.25, 0, 1)[:, None]
sf.write(os.path.join(EP, 'out', FILM, 'mix.wav'), mix.astype(np.float32), SR)
cr = S.credits(['cellos_pizz', 'marimba', 'kalimba', 'glockenspiel', 'harp', 'vibraphone'])
open(os.path.join(EP, 'out', FILM, 'instruments.txt'), 'w').write('\n'.join(cr) if isinstance(cr, list) else str(cr))
print('mix', mix.shape, 'peak', round(float(np.abs(mix).max()), 3))
