"""Sound design for the no-voiceover Pony Express Short: synth music bed + SFX on every visual event."""
import numpy as np, subprocess, math, json
OUT_WAV = "/home/user/Northstar_dizital_agency/social/which-life-next/remotion/public/pony-voiced/sound.wav"
SR = 48000
D = "/home/user/Northstar_dizital_agency/social/which-life-next/remotion/public/sfx/"
END = 118.0
N = int(END * SR)
out = np.zeros((N, 2), np.float32)   # SFX bus (music is mixed in at the end)
VOICE = "/home/user/Northstar_dizital_agency/.work/pony-voiced/narration.wav"

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
section(0.0, 15.3, prog_major, 0.20)
section(16.7, 85.6, prog_major, 0.20)
section(90.2, END, prog_minor, 0.17, drums=False, half=True)
# fades
def env(t0, t1, v0, v1):
    a, b = int(t0 * SR), int(t1 * SR); music[a:b] *= np.linspace(v0, v1, b - a)[:, None]
env(15.0, 15.3, 1, 0); env(85.2, 85.6, 1, 0); env(END - 1.5, END, 1, 0)
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


# ---------- SFX cues (voiced Pony Express; big hits sit in the gaps between lines) ----------
loop("gallop", 4.6, 15.3, 0.6)
put("pop", 2.18, 0.6); put("pop", 2.82, 0.6); put("pop", 1.7, 0.4); put("pop", 3.8, 0.5)
put("whoosh", 4.6, 0.7); put("neigh", 4.9, 0.5)
put("boom", 6.32, 0.6); put("ding", 6.35, 0.4)            # 10 DAYS
put("ding", 11.3, 0.5)                                       # It worked
put("whoosh", 12.4, 0.6); put("zap", 12.7, 0.6); put("boom", 13.98, 0.6)
put("rewind", 15.3, 0.95, dur=1.4)                           # gap: rewind
put("boom", 18.38, 0.5)                                      # April 3, 1860
put("whoosh", 19.6, 0.5); put("pop", 20.58, 0.6); put("pop", 22.6, 0.5)
put("whoosh", 24.0, 0.5); put("pop", 25.3, 0.6)
for tt in (27.14, 27.9, 28.64): put("pop", tt, 0.45)
put("pop", 30.16, 0.6)
put("ding", 34.16, 0.4)                                      # company name
for i in range(24): put("pop", 37.3 + i * (4.6 / 24), 0.28)  # stations
put("ding", 38.22, 0.35); put("pop", 40.82, 0.4)
put("whoosh", 42.6, 0.6); loop("gallop", 42.6, 44.2, 0.5)
put("neigh", 44.3, 0.6); put("pop", 45.0, 0.6); put("ding", 45.05, 0.4)   # fresh horse
loop("gallop", 46.3, 54.6, 0.35)
put("pop", 48.86, 0.5); put("pop", 52.24, 0.5)
loop("gallop", 54.7, 69.0, 0.5)
for tt in (57.06, 57.92, 58.92, 60.84, 62.62, 64.46): put("pop", tt, 0.45)
loop("wind", 64.3, 66.3, 0.55)
put("cheer", 69.6, 0.8); put("ding", 69.7, 0.4)            # arrival scene (gap)
put("boom", 73.76, 0.5)                                      # 10 DAYS
put("whoosh", 74.6, 0.5); put("pop", 76.34, 0.6); put("ding", 76.4, 0.3)
put("pop", 81.4, 0.5); put("ding", 84.8, 0.5)               # Lincoln news + 7d17h
# 85.6–86.6: silence beat before the twist (music already out)
put("boom", 90.2, 0.75)                                      # gap: the turn
put("telegraph", 98.4, 0.45, dur=3.4)          # telegraph office scene
for k in range(16): put("pop", 91.4 + 6.0 * ((k + 0.5) / 16) ** 0.8, 0.22)
put("boom", 94.68, 0.5)
put("zap", 97.3, 0.7)                                        # wire finished
put("zap", 99.0, 0.6, speed=1.2)                             # message in minutes
put("boom", 101.5, 0.6)                                      # gap
put("pop", 104.2, 0.6); put("whoosh", 104.4, 0.4); put("boom", 104.5, 0.45)   # CLOSED
put("ding", 106.48, 0.4); put("boom", 108.34, 0.45)
put("whoosh", 110.6, 0.5); put("neigh", 111.0, 0.45)
put("whoosh", 115.6, 0.5); put("ding", 116.0, 0.35)


# ---------- scene transitions (dive = whoosh before the scene; whip = whoosh at the cut; pull-out after) ----------
SC = [(4.9,12.4),(21.4,24.2),(32.6,37.2),(42.6,47.8),(47.8,54.6),(62.5,64.3),(64.3,66.2),(66.2,69.5),(69.5,75.0),(75.0,78.7),(78.7,81.4),(86.3,90.9),(90.9,94.4),(98.2,101.9),(101.9,105.6),(105.6,110.6),(110.6,116.0)]
starts = {round(a, 2) for a, b in SC}; ends = {round(b, 2) for a, b in SC}
for a, b in SC:
    if round(a, 2) in ends: put("whoosh", a - 0.08, 0.45)          # whip pan between scenes
    else: put("whoosh", a - 0.45, 0.65)                             # dive from the map
    if round(b, 2) not in starts: put("whoosh", b - 0.05, 0.45)     # pull back out to the map
loop("gallop", 4.9, 12.4, 0.45)
loop("gallop", 42.6, 44.0, 0.5); loop("gallop", 46.1, 47.6, 0.5)
loop("gallop", 69.5, 70.8, 0.45)
loop("gallop", 110.6, 116.0, 0.4)
put("pop", 34.06, 0.4); put("pop", 34.4, 0.4); put("pop", 34.9, 0.4)   # owners' names
put("pop", 76.3, 0.5); put("pop", 77.4, 0.4)                            # $5, ½ ounce
put("pop", 78.9, 0.5)                                                    # newspaper
for i in range(7): put("pop", 86.7 + i * 0.35, 0.25)                     # poles on the horizon
put("ding", 52.2, 0.4)                                                   # scale needle

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
