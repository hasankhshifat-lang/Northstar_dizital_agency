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
TEMPO = {"mama": 1.12, "boltu": 1.12, "bithi": 1.17, "newton": 1.08}
# explicit cuts per take (seconds), from silencedetect (-38 dB, d=0.4) + Whisper segment times
CUT = {"mama": [(0, 2.53), (3.41, 6.47), (7.10, 9.74), (10.30, 13.6)],
       "boltu": [(0, 2.65), (4.40, 6.65), (7.90, 12.24), (13.35, 16.24)],
       "bithi": [(0, 6.12), (7.86, 19.43), (21.01, 26.53), (27.66, 33.76)],
       "newton": [(0, 6.8)]}
ORDER = [("m1","mama",0),("m2","mama",1),("b1","boltu",0),("b2","boltu",1),("t1","bithi",0),
         ("b3","boltu",2),("t2","bithi",1),("n1","newton",0),("t3","bithi",2),("m4","mama",3),("b4","boltu",3),("t4","bithi",3)]
TEXT = {"m1":"রংধনুটা আজকে বস্তায় ভরমুই!","m2":"আরে! আমি আগাই, রংধনুও পিছায়!",
        "b1":"মামা, রংধনু কি তোমারে দেইখা পালায়?",
        "b2":"আপু, রংধনু ধরা যায় না ক্যান?",
        "t1":"রংধনু কোনো জিনিস না, আলোর খেলা! সূর্য পেছনে, সামনে পানির ফোঁটা। দেখো!",
        "b3":"ছোট্ট রংধনু! কিন্তু সাদা রোদে এত রং আসে কই থিকা?",
        "t2":"এটা তো আমি জানি না… কিন্তু আমি জানি কে জানে! নিউটন স্যার! আপনি কি আমাদের শিখিয়ে দেবেন? আমাদের আপনার সাহায্য দরকার… প্লিজ, আমাদের জন্য একটু নেমে আসুন!",
        "n1":"সাদা আলো আসলে অনেক রঙের মিশ্রণ। প্রিজমে আলো বেঁকে রংগুলো আলাদা হয়ে যায়।",
        "t3":"বৃষ্টির প্রতিটা ফোঁটা ছোট্ট প্রিজমের মতো। তাই আকাশে সাত রঙের রংধনু!",
        "m4":"তাইলে প্রিজমটা বস্তায় ভরি, রংধনু ফ্রি!",
        "b4":"মামা, বস্তার ভিতরে তো রোদই নাই।",
        "t4":"ধাঁধা! সকালে রংধনু দেখতে হলে কোন দিকে তাকাবে, পূর্বে না পশ্চিমে? কমেন্টে লেখো!"}
# m3 ("ভয় পাইছে! আমার মতো বীর দেইখা!") was voiced but cut for length; Mama answers b1 silently (chest puffed, proud nod) in the 0.9 s before b2.
# beat BEFORE each line: Mama's run before m2; the spray rainbow before b3; the portal before n1; the sack + cold pause before b4
GAP = {"m1": .45, "m2": .7, "b1": .2, "b2": .75, "t1": .3, "b3": .9, "t2": .3, "n1": 1.9, "t3": .3, "m4": .4, "b4": 1.5, "t4": .4}
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
