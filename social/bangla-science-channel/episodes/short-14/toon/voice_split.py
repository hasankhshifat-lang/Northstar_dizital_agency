"""Cut the three ElevenLabs takes into lines, speed up slightly, fixed gain per line, lay out with beats ->
voices/<id>.wav, voices/vo.wav, timeline.json (start/end per line) and voices/lips.json (o/b per 1/24 s)."""
import subprocess, re, json, os, numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); os.chdir(HERE)
SR = 48000
def segs(f, d=0.7):
    out = subprocess.run(["ffmpeg","-i",f,"-af",f"silencedetect=noise=-38dB:d={d}","-f","null","-"],capture_output=True,text=True).stderr
    st=[float(x) for x in re.findall(r"silence_start: ([\d.]+)",out)]; en=[float(x) for x in re.findall(r"silence_end: ([\d.]+)",out)]
    m=re.search(r"Duration: (\d+):(\d+):([\d.]+)",out); dur=int(m.group(2))*60+float(m.group(3))
    s=[];cur=0.0
    for a,b in zip(st,en):
        if a-cur>0.3: s.append([cur,a])
        cur=b
    if dur-cur>0.3: s.append([cur,dur])
    return s
def load(f, t0, t1, tempo):
    x = np.frombuffer(subprocess.run(["ffmpeg","-v","error","-ss",f"{t0:.3f}","-to",f"{t1:.3f}","-i",f,"-af",f"atempo={tempo}","-ac","1","-ar",str(SR),"-f","f32le","-"],capture_output=True).stdout, np.float32).copy()
    # trim silence at the edges (-45 dB), keep 60 ms
    fr = SR // 100; e = np.array([np.sqrt((x[i:i+fr]**2).mean()) for i in range(0, len(x)-fr, fr)]); on = np.where(e > 10**(-45/20))[0]
    a = max(0, on[0]*fr - int(.06*SR)); b = min(len(x), (on[-1]+1)*fr + int(.12*SR)); x = x[a:b]
    f = int(.03*SR); x[:f] *= np.linspace(0,1,f); f2 = int(.1*SR); x[-f2:] *= np.linspace(1,0,f2)
    fr = x[:len(x)//480*480].reshape(-1,480); r = np.sqrt((fr**2).mean(1)); act = r[r > 10**(-40/20)]
    g = 10**(-20/20)/max(1e-6, np.sqrt((act**2).mean())); g = min(g, 10**(-1/20)/max(1e-6, np.abs(x).max()))
    return x * g
TEMPO = {"mama": 1.06, "boltu": 1.06, "bithi": 1.10}
# explicit cuts per take (seconds), from silencedetect (-38 dB) / RMS minima + Whisper segment times
CUT = {"mama": [(0, 2.72), (4.13, 7.84), (8.79, 11.84)],
       "boltu": [(0, 2.42), (4.13, 8.06), (9.19, 12.58), (13.67, 16.64)],
       "bithi": [(0, 5.72), (7.79, 20.70), (22.04, 28.8)]}
ORDER = [("m1","mama",0),("b1","boltu",0),("m2","mama",1),("b2","boltu",1),("t1","bithi",0),
         ("b3","boltu",2),("t2","bithi",1),("m3","mama",2),("b4","boltu",3),("t3","bithi",2)]
TEXT = {"m1":"চামচটার জ্বর আইছে! ধরলেই ছ্যাঁকা!","b1":"মামা, হাতে গামছা প্যাঁচাইছো ক্যান?",
        "m2":"স্টিলের চামচ রাগী! কাঠের হাতা ভদ্র, কিচ্ছু করে না!","b2":"আপু, একই হাঁড়িতে স্টিলেরটা গরম, কাঠেরটা না কেন?",
        "t1":"রাগ না, তাপ পরিবহন! চলো, দুটোর হাতলে মোম লাগিয়ে গরম পানিতে রাখি।",
        "b3":"স্টিলের মোম গইলা পড়লো! কাঠেরটা ঠিক আছে!",
        "t2":"ধাতু তাপের সুপরিবাহী, কাঠ কুপরিবাহী। তাপ এক কণা থেকে পাশের কণায় যায়; ধাতুতে খুব দ্রুত, কাঠে খুব ধীরে। তাই হাঁড়ির হাতল হয় কাঠ বা প্লাস্টিকের।",
        "m3":"তাইলে কাঠের হাঁড়িতেই পিঠা বানামু! হাত পুড়বো না!",
        "b4":"মামা, কাঠের হাঁড়ি তো চুলায় পুইড়া যাইবো।",
        "t3":"ধাঁধা! শীতের সকালে লোহার গ্রিল কাঠের দরজার চেয়ে বেশি ঠান্ডা লাগে কেন? কমেন্টে লেখো!"}
# beat BEFORE each line: first visual; wax time-lapse (a little later); cold pause before the deadpan
GAP = {"m1": .3, "b1": .2, "m2": .2, "b2": .3, "t1": .35, "b3": 3.0, "t2": .3, "m3": .45, "b4": 1.6, "t3": .6}
S = {w: CUT[w] for w in TEMPO}
os.makedirs("voices", exist_ok=True)
t = 0; tl = []; clips = []
for lid, who, k in ORDER:
    a, b = S[who][k]; x = load(f"takes/{who}.mp3", max(0, a-.02), b+.03, TEMPO[who])
    t += GAP[lid]; tl.append({"id": lid, "who": who, "t0": round(t,3), "t1": round(t+len(x)/SR,3), "text": TEXT[lid]})
    clips.append((t, x)); t += len(x)/SR
    import soundfile as sf; sf.write(f"voices/{lid}.wav", x, SR)
END = round(t + .2, 3)
vo = np.zeros(int((END + 3) * SR), np.float32)
for t0, x in clips: i = int(t0*SR); vo[i:i+len(x)] += x
import soundfile as sf; sf.write("voices/vo.wav", vo, SR)
# lip sync envelopes (style: RMS openness + spectral brightness at 24 Hz)
lips = {}
for (t0, x), L in zip(clips, tl):
    hop = SR // 24; o, bb = [], []
    p = None; R = []; C = []
    for i in range(0, len(x), hop):
        w = x[i:i+int(.05*SR)]
        if len(w) < 64: w = np.pad(w, (0, 64-len(w)))
        R.append(np.sqrt((w**2).mean())); sp = np.abs(np.fft.rfft(w * np.hanning(len(w)))); fq = np.fft.rfftfreq(len(w), 1/SR)
        C.append((sp*fq).sum()/(sp.sum()+1e-9))
    R = np.array(R); p = np.percentile(R, 95) + 1e-9
    lips[L["id"]] = {"o": [round(float(np.clip((r/p-.1)/.8,0,1)),2) for r in R], "b": [round(float(np.clip((c-1200)/2600,0,1)),2) for c in C]}
json.dump({"voice_end": END, "lines": tl}, open("timeline.json","w"), ensure_ascii=False, indent=1)
json.dump(lips, open("voices/lips.json","w"))
for L in tl: print(L["id"], L["who"], L["t0"], L["t1"])
print("voice end", END)
