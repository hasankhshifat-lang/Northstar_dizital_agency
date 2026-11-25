"""Sound design for the Niagara barrel voiced map Short: synth music bed + SFX on every visual event, ducked under the voice."""
import numpy as np, subprocess, math, json
OUT_WAV = "/home/user/Northstar_dizital_agency/social/which-life-next/remotion/public/niagara/sound.wav"
SR = 48000
D = "/home/user/Northstar_dizital_agency/social/which-life-next/remotion/public/sfx/"
END = 51.5
N = int(END * SR)
out = np.zeros((N, 2), np.float32)   # SFX bus (music is mixed in at the end)
VOICE = "/home/user/Northstar_dizital_agency/social/which-life-next/shorts/niagara-barrel-2026-11-25/voice.wav"

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
section(0.0, 5.6, prog_major, 0.13, half=True)
section(5.6, 32.8, prog_major, 0.15)
section(32.8, 37.5, prog_minor, 0.12, drums=False, half=True)
section(37.5, 43.2, prog_major, 0.15)
section(43.2, END, prog_minor, 0.11, drums=False, half=True)
def env(t0, t1, v0, v1):
    a, b = int(t0 * SR), int(t1 * SR); music[a:b] *= np.linspace(v0, v1, b - a)[:, None]
env(32.8, 33.2, 1, 0.5); env(END - 0.3, END, 1, 0.5)
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

# ---------- SFX cues (New Madrid) — timed to the visual events in madridScenes.tsx ----------
def noise(t, dur, vol, smooth=1, bright=False, a_=0.05, r_=0.1):
    n = int(dur * SR); tt = np.arange(n) / SR
    x = np.random.default_rng(int(t * 100) + 3).normal(0, 1, n)
    if smooth > 1: x = np.convolve(x, np.ones(smooth) / smooth, mode="same")
    if bright: x = np.diff(np.concatenate([[0], x]))
    x = x / (np.abs(x).max() + 1e-9)
    x = x * np.minimum(1, tt / a_) * np.minimum(1, (tt[-1] - tt) / r_)
    a = int(t * SR); b = min(N, a + n); out[a:b] += (x[: b - a] * vol)[:, None].astype(np.float32)
def water(t0, t1, vol): noise(t0, t1 - t0, vol, smooth=40, a_=0.3, r_=0.3)
def crash(t, vol): noise(t, 0.35, vol, bright=True, a_=0.003, r_=0.3); step(t, vol * 0.8)
def rattle(t0, t1, vol):
    t = t0; rng = np.random.default_rng(11)
    while t < t1: noise(t, 0.03, vol * rng.uniform(0.5, 1), bright=True, a_=0.002, r_=0.02); t += rng.uniform(0.04, 0.09)
import math as _m
def fizz(t0, t1, vol): noise(t0, t1 - t0, vol, bright=True, smooth=3, a_=0.2, r_=0.3)
def clang(t, vol):
    n = int(0.9 * SR); tt = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt * d) for f, d in [(1180, 6), (1730, 8), (2510, 10), (3320, 13)])
    x = x / np.abs(x).max(); a = int(t * SR); b = min(N, a + n); out[a:b] += (x[: b - a] * vol)[:, None].astype(np.float32)
    noise(t, 0.04, vol * 0.8, bright=True, a_=0.001, r_=0.03)
def gunshot(t, vol): noise(t, 0.25, vol, bright=False, smooth=2, a_=0.001, r_=0.22); put("boom", t, vol * 0.5, dur=0.6)
def walk_steps(t0, t1, vol):
    k = 0
    while True:
        tt = k * _m.pi / 0.22 / 30
        if tt > t1: break
        if tt >= t0: step(tt, vol)
        k += 1
def hum(t0, t1, vol): noise(t0, t1 - t0, vol, smooth=200, a_=0.2, r_=0.2)
def scrape(t0, t1, vol, rate=11):
    t = t0
    while t < t1: noise(t, 0.12, vol, bright=True, smooth=2, a_=0.01, r_=0.06); t += 2 * _m.pi / rate
def splash(t, vol): noise(t, 0.3, vol, smooth=6, a_=0.01, r_=0.25)
# ---------- SFX cues (Robert Smalls) — timed to the visual events in smallsScenes.tsx ----------
def paddle(t0, t1, vol, rate=1.6):
    water(t0, t1, vol * 0.7); t = t0
    while t < t1: splash(t, vol); t += 1 / rate
def whistle(t, dur, vol):
    n = int(dur * SR); tt = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * f * tt + 0.3 * np.sin(2 * np.pi * 5 * tt)) * a for f, a in [(392, 1), (494, 0.8), (587, 0.6), (784, 0.25)])
    x = x / np.abs(x).max() * 0.8 + np.random.default_rng(7).normal(0, 0.15, n)
    x = x * np.minimum(1, tt / 0.08) * np.minimum(1, (tt[-1] - tt) / 0.25)
    a = int(t * SR); b = min(N, a + n); out[a:b] += (x[: b - a] * vol)[:, None].astype(np.float32)
def fire(t0, t1, vol): noise(t0, t1 - t0, vol, smooth=60, a_=0.2, r_=0.2); rattle(t0, t1, vol * 0.25)
def flutter(t0, t1, vol, rate=13):
    t = t0
    while t < t1: noise(t, 0.035, vol, bright=True, smooth=2, a_=0.004, r_=0.03); t += 1 / rate
def drone(t0, t1, vol): noise(t0, t1 - t0, vol, smooth=120, a_=0.3, r_=0.3)
def thud(t, vol): step(t, vol); noise(t, 0.12, vol * 0.6, smooth=20, a_=0.002, r_=0.1)
def scratch(t0, t1, vol): scrape(t0, t1, vol, rate=9)
def tick(t0, t1, vol):
    t = t0
    while t < t1: clang(t, vol); t += 0.25
# 1 hook: shed room tone, the bat squirms (flutter), label
def creak(t, vol): noise(t, 0.35, vol, smooth=14, a_=0.05, r_=0.2)
def ratchet(t0, t1, vol, rate=6):
    t = t0
    while t < t1: clang(t, vol); noise(t + 0.02, 0.05, vol * 0.6, bright=True, smooth=2, a_=0.003, r_=0.04); t += 1 / rate
def crowd(t0, t1, vol): noise(t0, t1 - t0, vol, smooth=30, a_=0.3, r_=0.3)
# ---------- SFX cues (Black Bart) — timed to bartScenes.tsx ----------
def walk(t0, t1, vol, rate=1.0):
    k = 0
    while True:
        tt = t0 + k * _m.pi / 0.22 / 30 / rate
        if tt > t1: break
        step(tt, vol); k += 1
def hooves(t0, t1, vol):
    t = t0
    while t < t1: step(t, vol); step(t + 0.09, vol * 0.7); t += 0.33
def jingle(t0, t1, vol): rattle(t0, t1, vol)
# ---------- SFX cues (Niagara barrel) — timed to niagaraScenes.tsx ----------
def roar(t0, t1, vol): noise(t0, t1 - t0, vol, smooth=8, a_=0.2, r_=0.3)
def wood(t, vol): thud(t, vol); noise(t, 0.05, vol * 0.6, bright=True, smooth=2, a_=0.002, r_=0.04)
# 1 hook: river + distant roar, creak of the barrel as she steps in, then the roar swells at the edge, splash, she lives
water(0.0, 2.75, 0.05); roar(0.0, 2.75, 0.02); creak(0.6, 0.06); wood(2.2, 0.08)
roar(2.75, 5.6, 0.07); hiss(2.9, 1.0, 0.04); splash(4.0, 0.10); put("ding", 4.95, 0.22)
# map: WHY?, 1901, pin
put("whoosh", 5.65, 0.25); put("ding", 5.85, 0.25); put("ding", 7.35, 0.18); put("pop", 8.0, 0.3); put("pop", 8.2, 0.2)
# 3 broke: purse flips (1.2–1.7), moth flutter, labels
noise(10.6, 0.3, 0.04, bright=True, smooth=2, a_=0.02, r_=0.2); flutter(11.1, 11.9, 0.02); put("pop", 9.5, 0.2); put("pop", 10.7, 0.2); put("pop", 12.2, 0.22); put("pop", 12.9, 0.22)
# 4 plan: pen scratching while she draws
scratch(14.5, 17.5, 0.03); put("pop", 15.5, 0.22); put("ding", 17.2, 0.15)
# 5 cooper: three hammer hits on the hoop, cushion stuffed
for ht in (0.25, 0.65, 1.05): clang(19.2 + ht, 0.05); wood(19.2 + ht, 0.10)
noise(21.1, 0.6, 0.04, smooth=10, a_=0.05, r_=0.3); put("pop", 19.6, 0.2); put("pop", 21.2, 0.2)
# 6 cat: lid closes (1.3–1.8), later lid off (3.0), cat jumps out, cheer
wood(24.3, 0.08); creak(25.5, 0.06); noise(25.8, 0.2, 0.04, bright=True, smooth=2, a_=0.01, r_=0.15); put("ding", 26.1, 0.22); put("cheer", 26.2, 0.04, dur=0.8, fade=0.3)
# 7 adrift: river, hammering the lid shut (1.4–2.4), rope let go (3.15), roar ahead
water(27.0, 32.8, 0.05); roar(30.0, 32.8, 0.04)
for k in range(5): wood(28.4 + k * 0.22, 0.07)
noise(30.15, 0.15, 0.04, bright=True, smooth=2, a_=0.01, r_=0.1); put("pop", 30.35, 0.2)
# 8 edge: roar, the drop
roar(32.8, 34.4, 0.12); hiss(33.25, 1.0, 0.05)
# 9 rescue: pole hooks the barrel, drag on the rocks, lid pried off (2.0)
water(34.4, 37.5, 0.04); wood(34.8, 0.08); noise(35.0, 1.0, 0.04, smooth=6, a_=0.1, r_=0.3); creak(36.4, 0.08); put("pop", 34.7, 0.2)
# 10 alive: crowd cheers
put("cheer", 38.3, 0.08, dur=1.5, fade=0.5); put("ding", 37.7, 0.25); put("pop", 38.5, 0.2)
# 11 warning: pencils on notebooks
scratch(40.2, 42.8, 0.02); put("pop", 40.1, 0.22); put("pop", 41.0, 0.25)
# 12 stolen: fair murmur, cart wheels rolling away (2.2–), footsteps
crowd(43.2, 47.3, 0.03); rattle(45.4, 47.3, 0.03); walk(45.4, 47.3, 0.06); put("pop", 43.4, 0.2); put("pop", 45.5, 0.22)
# 13 poor: quiet wind
put("wind", 47.3, 0.05, dur=1.4, fade=0.4); put("ding", 48.0, 0.15)
# 14 loop
water(48.7, 51.5, 0.05); roar(48.7, 51.5, 0.02)

# ---------- scene transitions ----------
SC = [(0,5.6),(9.3,13.9),(13.9,19.2),(19.2,22.5),(22.5,27.0),(27.0,32.8),(32.8,34.4),(34.4,37.5),(37.5,39.8),(39.8,43.2),(43.2,47.3),(47.3,48.7),(48.7,52.5)]
starts = {round(a, 2) for a, b in SC}; ends = {round(b, 2) for a, b in SC}
for a, b in SC:
    if a == 0: pass
    elif round(a, 2) in ends: put("whoosh", a - 0.08, 0.45)
    else: put("whoosh", a - 0.45, 0.65)
    if round(b, 2) not in starts and b < END: put("whoosh", b - 0.05, 0.45)

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
