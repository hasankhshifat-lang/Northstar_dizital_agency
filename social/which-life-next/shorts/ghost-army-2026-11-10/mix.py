"""Sound design for the no-voiceover Pony Express Short: synth music bed + SFX on every visual event."""
import numpy as np, subprocess, math, json
OUT_WAV = "/home/user/Northstar_dizital_agency/social/which-life-next/remotion/public/ghost/sound.wav"
SR = 48000
D = "/home/user/Northstar_dizital_agency/social/which-life-next/remotion/public/sfx/"
END = 57.4
N = int(END * SR)
out = np.zeros((N, 2), np.float32)   # SFX bus (music is mixed in at the end)
VOICE = "/tmp/gh/narration.wav"

def load(name):
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", D + name + ".mp3", "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"])
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
S = {n: load(n) for n in ["gallop", "whoosh", "pop", "rewind", "telegraph", "zap", "neigh", "boom", "cheer", "ding", "wind"]}
for k, v in S.items():  # normalise peaks
    S[k] = v / (np.abs(v).max() + 1e-9)

def put(name, t, vol=1.0, dur=None, fade=0.05, speed=1.0):
    x = S[name]
    if speed != 1.0:
        idx = np.arange(0, len(x) - 1, speed); x = x[idx.astype(int)]
    if dur: x = x[: int(dur * SR)]
    x = x.copy(); f = int(fade * SR)
    if f and len(x) > 2 * f: x[-f:] *= np.linspace(1, 0, f)[:, None]
    a = int(t * SR); b = min(N, a + len(x))
    out[a:b] += x[: b - a] * vol

def loop(name, t0, t1, vol, xf=0.08):
    x = S[name]; L = len(x); t = t0
    while t < t1:
        seg = min(L / SR, t1 - t)
        put(name, t, vol, dur=seg + xf, fade=xf)
        t += L / SR - xf

# ---------- music bed (synth, royalty-free) ----------
def pluck(freq, dur, amp):
    n = int(dur * SR); p = max(2, int(SR / freq))
    buf = np.random.default_rng(int(freq)).uniform(-1, 1, p).astype(np.float32)
    y = np.zeros(n, np.float32)
    for i in range(n):
        y[i] = buf[i % p]; buf[i % p] = 0.5 * (buf[i % p] + buf[(i + 1) % p]) * 0.996
    return y * amp
cache = {}
def note(m, t, dur, amp, music):
    f = 440 * 2 ** ((m - 69) / 12); key = (m, dur)
    if key not in cache: cache[key] = pluck(f, dur, 1.0)
    y = cache[key] * amp; a = int(t * SR); b = min(len(music), a + len(y))
    music[a:b, 0] += y[: b - a] * 0.9; music[a:b, 1] += y[: b - a]
def kick(t, amp, music):
    n = int(0.18 * SR); tt = np.arange(n) / SR
    y = np.sin(2 * np.pi * (50 + 60 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 18) * amp
    a = int(t * SR); b = min(len(music), a + n); music[a:b] += y[: b - a, None]
def shaker(t, amp, music):
    n = int(0.06 * SR); y = np.random.default_rng(int(t * 1000)).normal(0, 1, n) * np.exp(-np.arange(n) / SR * 60) * amp
    y = np.diff(np.concatenate([[0], y]))  # brighter
    a = int(t * SR); b = min(len(music), a + n); music[a:b] += y[: b - a, None]

music = np.zeros((N, 2), np.float32)
bpm = 112; beat = 60 / bpm
prog_major = [[60, 64, 67, 72], [57, 60, 64, 69], [53, 57, 60, 65], [55, 59, 62, 67]]   # C Am F G
prog_minor = [[57, 60, 64, 69], [53, 57, 60, 65], [52, 55, 59, 64], [57, 60, 64, 69]]   # Am F Em Am
def section(t0, t1, prog, amp, drums=True, half=False):
    t = t0; i = 0
    step = beat / (1 if half else 2)
    while t < t1 - 0.05:
        bar = int((t - t0) / (beat * 4)) % len(prog); ch = prog[bar]
        note(ch[i % 4] + (12 if (i % 8) in (5, 7) else 0), t, 0.5, amp, music)
        if i % (2 if not half else 1) == 0:
            note(ch[0] - 12, t, 0.7, amp * 0.8, music) if (i % 8 == 0) else None
            if drums: kick(t, 0.35, music) if i % 4 == 0 else None
        if drums: shaker(t + step / 2, 0.05, music)
        t += step; i += 1
section(0.0, 44.0, prog_major, 0.20)
section(44.4, END, prog_minor, 0.17, drums=False, half=True)
def env(t0, t1, v0, v1):
    a, b = int(t0 * SR), int(t1 * SR); music[a:b] *= np.linspace(v0, v1, b - a)[:, None]
env(43.7, 44.0, 1, 0); env(END - 1.5, END, 1, 0)
music /= (np.abs(music).max() + 1e-9)

def voice_env(path):
    """0..1 envelope of where the narrator is speaking (smoothed, with 120 ms look-ahead/hold)."""
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"])
    v = np.frombuffer(raw, np.float32)
    v = np.pad(v, (0, max(0, N - len(v))))[:N]
    win = int(0.05 * SR)
    rms = np.sqrt(np.convolve(v * v, np.ones(win) / win, mode="same"))
    on = (rms > 0.02).astype(np.float32)
    hold = int(0.12 * SR)
    on = np.convolve(on, np.ones(2 * hold), mode="same") > 0      # look-ahead + hold
    sm = int(0.08 * SR)
    return np.convolve(on.astype(np.float32), np.ones(sm) / sm, mode="same"), v


# ---------- synthesized extras (royalty-free): air hiss, engine rumble, marching steps, tick ----------
def hiss(t, dur, vol, rising=True):
    n = int(dur * SR); x = np.random.default_rng(int(t * 100)).normal(0, 1, n).astype(np.float32)
    x = np.diff(np.concatenate([[0], x])).astype(np.float32)   # brighter
    env_ = np.linspace(0.2, 1, n) if rising else np.linspace(1, 0.2, n)
    x = x * env_ * np.minimum(1, np.linspace(0, 1, n) * 20) * np.minimum(1, np.linspace(1, 0, n) * 10)
    a = int(t * SR); b = min(N, a + n); out[a:b] += (x[: b - a] * vol * 0.5)[:, None]
def rumble(t0, t1, vol):
    n = int((t1 - t0) * SR); tt = np.arange(n) / SR
    x = (np.sign(np.sin(2 * np.pi * 38 * tt)) * 0.5 + np.sin(2 * np.pi * 57 * tt + np.sin(tt * 9)) * 0.5) * (0.7 + 0.3 * np.sin(2 * np.pi * 7 * tt))
    x = x * np.minimum(1, tt * 4) * np.minimum(1, (tt[-1] - tt) * 4)
    a = int(t0 * SR); b = min(N, a + n); out[a:b] += (x[: b - a] * vol * 0.6)[:, None].astype(np.float32)
def step(t, vol):
    n = int(0.09 * SR); tt = np.arange(n) / SR
    x = np.random.default_rng(int(t * 1000)).normal(0, 1, n) * np.exp(-tt * 55) + np.sin(2 * np.pi * 90 * tt) * np.exp(-tt * 40)
    a = int(t * SR); b = min(N, a + n); out[a:b] += (x[: b - a] * vol)[:, None].astype(np.float32)

# ---------- SFX cues (Ghost Army; big hits sit in the gaps between lines) ----------
put("boom", 0.05, 0.5); put("pop", 0.5, 0.5)
put("whoosh", 2.3, 0.5); put("boom", 2.5, 0.5)                      # 1944
put("pop", 5.3, 0.5)                                                  # ARTISTS
put("pop", 7.0, 0.5); put("ding", 7.7, 0.4)                           # Germany / fake an army
for i in range(12): put("pop", 7.6 + i * 0.17, 0.3)
put("boom", 10.5, 0.6); put("pop", 11.4, 0.5)                         # GHOST ARMY
put("ding", 12.42, 0.5)
for tt in (14.1, 14.96, 15.85): put("pop", tt, 0.5)
hiss(17.5, 2.1, 0.9); put("pop", 17.5, 0.4)                           # inflating
put("boom", 18.84, 0.6); put("ding", 18.9, 0.4)                       # 93 pounds
put("pop", 20.85, 0.5)
for i, tt in enumerate((0.3, 0.6, 0.9, 1.2, 1.5, 1.8)): hiss(22.26 + tt, 0.7, 0.5); put("pop", 22.26 + tt + 0.7, 0.3)
put("pop", 24.56, 0.5)
for k in range(10): step(25.66 + k * 0.13, 0.5)                       # tracks
put("pop", 25.98, 0.5)
put("pop", 27.94, 0.5)
rumble(28.6, 32.2, 0.8); put("pop", 30.5, 0.5); put("pop", 31.22, 0.5)
for k in range(5): step(31.3 + k * 0.22, 0.6)
put("boom", 32.5, 0.6); put("zap", 33.0, 0.5, dur=1.2)               # March 1945, Rhine draws
put("pop", 36.04, 0.5)
put("pop", 39.5, 0.5); put("pop", 40.0, 0.5); put("whoosh", 39.9, 0.4); put("ding", 40.22, 0.5)
for i in range(20): put("pop", 41.9 + i * 0.1, 0.25)
put("boom", 42.4, 0.6)
put("boom", 44.55, 0.8)                                               # TOP SECRET stamp
for k in range(12): put("pop", 44.8 + k * 0.24, 0.18)                 # years ticking
put("ding", 46.0, 0.4)
put("boom", 47.75, 0.8)                                               # DECLASSIFIED
put("boom", 49.7, 0.5); put("cheer", 49.9, 0.7); put("ding", 51.8, 0.5)
put("boom", 54.4, 0.6)

# ---------- scene transitions ----------
SC = [(0,2.3),(4.2,6.9),(12.4,17.0),(17.0,20.7),(20.7,22.26),(22.26,25.6),(27.3,32.4),(37.0,39.5),(44.2,49.6),(49.6,54.2),(54.2,58.0)]
starts = {round(a, 2) for a, b in SC}; ends = {round(b, 2) for a, b in SC}
for a, b in SC:
    if a == 0: pass
    elif round(a, 2) in ends: put("whoosh", a - 0.08, 0.45)
    else: put("whoosh", a - 0.45, 0.65)
    if round(b, 2) not in starts and b < 57.4: put("whoosh", b - 0.05, 0.45)

# ---------- final mix: ducking happens AFTER every SFX cue is placed ----------
if VOICE:
    env_v, vo = voice_env(VOICE)
    # RULE (user, 2026-11-01): sound effects must never cover the voiceover.
    # Under the voice: SFX at -14 dB, music at -20 dB. Between lines they come back up.
    sfx_gain = 1 - env_v * (1 - 10 ** (-14 / 20))
    mus_gain = 1 - env_v * (1 - 10 ** (-20 / 20))
    out *= sfx_gain[:, None]
    out = out * 0.55 + music * 0.30 * mus_gain[:, None]
    out = out / (np.abs(out).max() + 1e-9) * 0.35          # bed sits well below the voice
    out += vo[:, None] * 0.9
else:
    out += music * 0.32
peak = np.abs(out).max(); out = (out / peak * 0.89).astype(np.float32)   # MUST be float32: ffmpeg reads f32le (float64 here = garbled noise)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
                OUT_WAV], input=out.tobytes(), check=True)
# ---------- safety check: the voice must be clearly present in the written file ----------
if VOICE:
    chk = np.frombuffer(subprocess.check_output(["ffmpeg", "-v", "error", "-i", OUT_WAV, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"]), np.float32)[:N]
    vv = vo[: len(chk)]
    k = float(chk @ vv) / float(vv @ vv + 1e-9)
    resid = chk - k * vv
    snr = 10 * math.log10(float((k * vv) @ (k * vv)) / float(resid @ resid + 1e-9))
    print(f"voice gain in file {k:.2f}, voice-to-background {snr:.1f} dB")
    assert k > 0.3 and snr > 6, "VOICE NOT CLEAR IN THE MIX — do not render"
print("ok", out.shape[0] / SR)
