"""Portal sound effects (synth, no samples): rising whoosh + hum on opening, sparkle chimes when the scientist
materialises, a steady hum while open, and a zap on closing. Usage: python3 portal_sfx.py out.wav OPEN_T CLOSE_T DUR"""
import sys, wave, numpy as np
out, o, c, D = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), float(sys.argv[4])
SR = 44100; x = np.zeros(int(D * SR)); rng = np.random.default_rng(1)
def put(t0, s):
    i = int(t0 * SR); e = min(len(x), i + len(s)); x[i:e] += s[:e - i]
t = np.arange(int(1.2 * SR)) / SR; f = 120 + 380 * (t / 1.2) ** 1.5
hum = np.sin(2*np.pi*np.cumsum(f)/SR)*0.35 + np.sin(2*np.pi*np.cumsum(f*2.01)/SR)*0.15
noise = np.convolve(rng.standard_normal(len(t)), np.ones(40)/40, 'same') * np.linspace(0, 1, len(t)) * 0.6
put(o - 0.05, (hum + noise) * np.minimum(1, t / 0.3))
t = np.arange(int(max(0.1, c - o - 1.3) * SR)) / SR; put(o + 1.1, (np.sin(2*np.pi*90*t)*0.18 + np.sin(2*np.pi*180.5*t)*0.08) * (0.7 + 0.3*np.sin(2*np.pi*3*t)))
for k, tt in enumerate((0.75, 0.9, 1.05, 1.2)):
    t = np.arange(int(0.5 * SR)) / SR; put(o + tt, np.sin(2*np.pi*(1800 + k*300)*t) * np.exp(-t*8) * 0.25)
t = np.arange(int(0.45 * SR)) / SR; f = 600*np.exp(-t*6) + 80; put(c - 0.4, np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-t*5) * 0.5)
x = x / max(1e-9, np.max(np.abs(x))) * 0.8
with wave.open(out, "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())
print("ok", out)
