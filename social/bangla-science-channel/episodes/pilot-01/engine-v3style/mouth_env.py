"""Voice loudness -> mouth level per frame (0 closed, 1 half, 2 open), 24 fps, main-episode time."""
import sys, json, numpy as np, subprocess
src = sys.argv[1]; out = sys.argv[2]; FPS = 24
raw = subprocess.run(["ffmpeg","-v","error","-i",src,"-ac","1","-ar","16000","-f","s16le","-"],capture_output=True).stdout
x = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
# speech band only, so breaths/clicks do not open the mouth
X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1/16000); X[(f<250)|(f>3500)] = 0; x = np.fft.irfft(X, len(x))
hop = 16000 // FPS; n = len(x) // hop
rms = np.array([np.sqrt(np.mean(x[i*hop:(i+1)*hop]**2)) for i in range(n)])
rms = np.convolve(rms, [0.25,0.5,0.25], "same")
ref = np.percentile(rms[rms > 1e-4], 90)
lv = np.where(rms > 0.45*ref, 2, np.where(rms > 0.15*ref, 1, 0))
# hold each state at least 2 frames (max ~6 mouth changes per second, like real syllables)
for i in range(1, n-1):
    if lv[i] != lv[i-1] and lv[i+1] == lv[i-1]: lv[i] = lv[i-1]
json.dump("".join(map(str, lv)), open(out, "w"))
print(n, "frames", np.bincount(lv))
