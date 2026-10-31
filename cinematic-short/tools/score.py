"""Synthesize the 20s cinematic score for NorthstarShort (deterministic)."""
import sys, wave
import numpy as np

SR = 48000
DUR = 20.0
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(7)

def env(a, b, attack, release):
    e = np.zeros(N)
    i0, i1 = int(a * SR), int(b * SR)
    seg = np.arange(i1 - i0) / SR
    e[i0:i1] = np.minimum(1, seg / max(attack, 1e-4)) * np.exp(-seg / release)
    return e

def ramp(a, b):
    return np.clip((t - a) / (b - a), 0, 1)

def lowpass(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y

out = np.zeros((N, 2))

# 1. Drone: A minor bed, slowly swelling, detuned for stereo width
for f, g in [(55, 0.12), (82.4, 0.06), (110, 0.045), (164.8, 0.02)]:
    l = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)
    r = np.sin(2 * np.pi * f * 1.003 * t) + 0.3 * np.sin(2 * np.pi * 2 * f * 1.003 * t)
    swell = (0.4 + 0.6 * ramp(0, 7)) * (1 + 0.15 * np.sin(2 * np.pi * 0.2 * t))
    out[:, 0] += g * l * swell; out[:, 1] += g * r * swell
out *= ((1 - 0.7 * ramp(7.6, 8.0)) + 0.7 * ramp(8.0, 8.6))[:, None]  # dip before the jump

# 2. Shimmer pad (high harmonics) from the constellation onwards
for f in [880, 1318.5, 1760]:
    s = np.sin(2 * np.pi * f * t + 3 * np.sin(2 * np.pi * 0.3 * t))
    out[:, 0] += 0.018 * s * ramp(5.5, 7.5) * (1 - ramp(7.8, 8.0))
    out[:, 1] += 0.018 * np.roll(s, 300) * ramp(5.5, 7.5) * (1 - ramp(7.8, 8.0))

# 3. Ignite: bright ping at 0.3s
ping = np.sin(2 * np.pi * 1760 * t) * env(0.27, 3.5, 0.005, 0.8)
out += 0.15 * ping[:, None]

# 4. Risers (filtered noise with rising pitch sweep)
def riser(a, b, gain):
    m = (t >= a) & (t < b)
    p = np.zeros(N); p[m] = ((t[m] - a) / (b - a)) ** 2
    noise = rng.standard_normal(N) * p
    hp = noise - lowpass(noise, 400)
    sweep_f = 200 + 1800 * p
    phase = 2 * np.pi * np.cumsum(sweep_f) / SR
    tone = np.sin(phase) * p * 0.5
    return gain * (hp * 0.5 + tone)
out += riser(5.8, 8.0, 0.35)[:, None]
out += riser(11.6, 13.0, 0.45)[:, None]

# 5. Booms: pitched-down sine sub + noise thump
def boom(at, gain, length=3.0):
    seg = np.clip(t - at, 0, None)
    f = 30 + 90 * np.exp(-seg * 12)
    phase = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(phase) * env(at, min(DUR, at + length), 0.002, 0.9)
    click = rng.standard_normal(N) * env(at, min(DUR, at + 0.4), 0.001, 0.05)
    return gain * (body + 0.4 * lowpass(click, 2500))
out += boom(8.0, 0.9)[:, None]
out += boom(13.0, 1.0, 5.0)[:, None]

# 6. Word hits (Design / Code / AI)
for at in [9.33, 10.4, 11.47]:
    h = boom(at, 0.45, 1.2)
    metal = np.sin(2 * np.pi * 440 * t) * np.sin(2 * np.pi * 622 * t) * env(at, at + 1.2, 0.002, 0.25)
    out += (h + 0.12 * metal)[:, None]

# 7. Warp rumble 8-13s
rum = lowpass(rng.standard_normal(N), 180) * (ramp(8.0, 9.0) * (1 - ramp(12.9, 13.0)))
out += 0.35 * rum[:, None]

# 8. Final resolution chord (A major lift) from 13s
for f in [220, 277.2, 329.6, 440, 554.4]:
    c = np.sin(2 * np.pi * f * t) + 0.2 * np.sin(2 * np.pi * 3 * f * t)
    e = ramp(13.0, 14.5) * (1 - ramp(17.5, 20.0))
    out[:, 0] += 0.06 * c * e
    out[:, 1] += 0.06 * np.roll(c, 120) * e

# Simple stereo reverb: convolve with decaying noise
ir_len = int(SR * 2.2)
ir_t = np.arange(ir_len) / SR
for ch in range(2):
    ir = rng.standard_normal(ir_len) * np.exp(-ir_t * 2.8); ir[0] = 0
    wet = np.fft.irfft(np.fft.rfft(out[:, ch], 2 * N) * np.fft.rfft(ir, 2 * N))[:N]
    out[:, ch] = out[:, ch] + 0.02 * wet

out *= (1 - ramp(19.2, 20.0))[:, None]
out = np.tanh(out)
out /= np.max(np.abs(out)) / 0.89
pcm = (out * 32767).astype("<i2")
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("wrote", sys.argv[1])
