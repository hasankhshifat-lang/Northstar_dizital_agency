"""Sound design for the no-voiceover Pony Express Short: synth music bed + SFX on every visual event."""
import numpy as np, subprocess, math, json
SR = 48000
D = "/home/user/Northstar_dizital_agency/social/which-life-next/remotion/public/sfx/"
END = 43.5
N = int(END * SR)
out = np.zeros((N, 2), np.float32)   # SFX bus (music is mixed in at the end)
VOICE = None  # path to the narration wav (required for voiced Shorts, user rule 2026-11-01): SFX + music are ducked under it

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
section(0.0, 3.6, prog_major, 0.22)
section(4.9, 31.0, prog_major, 0.20)
section(32.4, END, prog_minor, 0.17, drums=False, half=True)
# fades
def env(t0, t1, v0, v1):
    a, b = int(t0 * SR), int(t1 * SR); music[a:b] *= np.linspace(v0, v1, b - a)[:, None]
env(3.3, 3.6, 1, 0); env(30.6, 31.0, 1, 0); env(END - 1.2, END, 1, 0)
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


# ---------- SFX cues ----------
x = lambda u: math.acos(1 - 2 * u) / math.pi       # inverse of the ride easing
ride = lambda u: 13.4 + (27.6 - 13.4) * x(u)
loop("gallop", 0.0, 3.6, 0.75)
put("neigh", 0.05, 0.6)
for tt in (0.15, 1.55): put("pop", tt, 0.7); put("ding", tt + 0.02, 0.25)
put("pop", 2.7, 0.6)
put("rewind", 3.6, 0.9, dur=1.1)
put("whoosh", 4.55, 0.8)
put("boom", 4.9, 0.75)                      # 1860
put("pop", 6.2, 0.7); put("pop", 7.0, 0.7)  # pins
put("pop", 8.5, 0.6)                        # 1,900 miles label
put("whoosh", 8.0, 0.5)
put("ding", 10.4, 0.45)                     # "Unless…"
put("whoosh", 10.45, 0.7)
put("neigh", 11.0, 0.8); put("pop", 11.0, 0.6)
put("boom", 12.0, 0.55)                     # April 3, 1860
put("pop", 11.6, 0.5)                       # day badge
loop("gallop", 13.4, 27.6, 0.5)
for i in range(13):
    u = 0.04 + i * 0.075
    if u <= 1: put("pop", ride(u), 0.45)    # relay station appears (fresh horse)
for i in range(2, 11):                      # day counter ticks
    u = (i - 1) / 9.2
    if u <= 1: put("ding", ride(u), 0.18)
for nm, u in (("kearny", 0.11), ("laramie", 0.33), ("slc", 0.56), ("carson", 0.92)):
    put("pop", ride(u), 0.55)
loop("wind", ride(0.86), 27.4, 0.45)
put("cheer", 28.1, 0.7); put("ding", 28.2, 0.55)   # 10 DAYS
put("whoosh", 28.4, 0.5)
# silence beat 31.0–32.4 (only room tone)
put("boom", 32.4, 0.8)                       # Oct 24, 1861
put("telegraph", 32.6, 0.55, dur=3.6)
put("zap", 32.8, 0.7); put("zap", 33.6, 0.7, speed=1.15)
for k in range(16):
    put("pop", 32.8 + 1.8 * ((k + 0.5) / 16) ** 0.5, 0.3)   # poles
put("whoosh", 36.4, 0.6)
put("pop", 37.8, 0.7)                        # sign appears
put("whoosh", 39.0, 0.4); put("boom", 39.05, 0.45)  # flips to CLOSED
put("pop", 39.6, 0.5)                        # thought bubble
put("whoosh", 40.6, 0.6)
put("boom", 41.0, 0.7)                       # 18 months
put("ding", 41.05, 0.35)

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
peak = np.abs(out).max(); out = out / peak * 0.89
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
                "/home/user/Northstar_dizital_agency/social/which-life-next/remotion/public/pony/sound.wav"], input=out.tobytes(), check=True)
print("ok", out.shape[0] / SR)
