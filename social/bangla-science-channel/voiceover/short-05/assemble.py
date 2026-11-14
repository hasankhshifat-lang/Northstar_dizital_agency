"""Split the three takes into lines, normalise, speed up slightly, and lay them out with beat gaps -> vo.wav + timeline.json."""
import subprocess, re, json, os
import numpy as np
L = json.load(open("lines.json"))
TEMPO = 1.06
def segs(f, d):
    out = subprocess.run(["ffmpeg","-i",f,"-af",f"silencedetect=noise=-38dB:d={d}","-f","null","-"],capture_output=True,text=True).stderr
    st=[float(x) for x in re.findall(r"silence_start: ([\d.]+)",out)]; en=[float(x) for x in re.findall(r"silence_end: ([\d.]+)",out)]
    m=re.search(r"Duration: (\d+):(\d+):([\d.]+)",out); dur=int(m.group(2))*60+float(m.group(3))
    # speech chunks with the surrounding silences, so each clip can take generous padding inside the pauses
    s=[];cur=0.0;prev_mid=0.0
    for a,b in zip(st,en):
        if a-cur>0.3: s.append([cur,a,prev_mid,(a+b)/2])
        cur=b; prev_mid=(a+b)/2
    if dur-cur>0.3: s.append([cur,dur,prev_mid,dur])
    for k in range(len(s)-1): s[k][3]=min(s[k][3], s[k+1][2]) if s[k+1][2] > s[k][1] else s[k][3]
    return s
os.makedirs("lines", exist_ok=True)
clips = {}
for who, d in (("mama",0.55),("bithi",0.8),("boltu",0.55)):
    for k,(a,b,lo,hi) in enumerate(segs(f"takes/{who}_1.mp3", d)):
        out=f"lines/{who}_{k}.wav"
        t0=max(lo, a-0.18); t1=min(hi, b+0.40)          # keep breaths in and the full decay of the last syllable
        dd=(t1-t0)/TEMPO
        subprocess.run(["ffmpeg","-y","-v","error","-ss",f"{t0:.3f}","-to",f"{t1:.3f}","-i",f"takes/{who}_1.mp3",
                        "-af",f"atempo={TEMPO},afade=t=in:d=0.03,afade=t=out:st={dd-0.12:.3f}:d=0.12","-ac","1","-ar","44100",out])
        # one fixed gain per line (no dynamic loudnorm, which pumped the level at the clip edges)
        x=np.frombuffer(subprocess.run(["ffmpeg","-v","error","-i",out,"-f","f32le","-acodec","pcm_f32le","-"],capture_output=True).stdout,np.float32).copy()
        fr=x[:len(x)//441*441].reshape(-1,441); r=np.sqrt((fr**2).mean(1)); act=r[r>10**(-40/20)]
        g=10**(-20/20)/max(1e-6,np.sqrt((act**2).mean())); g=min(g, 10**(-1/20)/max(1e-6,np.abs(x).max()))
        subprocess.run(["ffmpeg","-y","-v","error","-i",out,"-af",f"volume={g:.4f}","-ar","44100","/tmp/claude-0/g.wav"]); os.replace("/tmp/claude-0/g.wav", out)
        clips.setdefault(who, []).append(out)
def dur(f): return float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",f],capture_output=True,text=True).stdout)
# gap BEFORE each line (beats): line 0 starts after the splash hook; extra beats for actions
START = 0.95
GAP = {1: .25, 2: .2, 3: .25, 4: .2, 5: .3, 6: .25, 7: 1.3, 8: .35, 9: .3, 10: .35}   # on top of the padded pauses inside each clip
idx = {"mama":0,"bithi":0,"boltu":0}; t = START; tl = []; parts = []
for i,(shot,who,text) in enumerate(L):
    t += GAP.get(i, 0)
    f = clips[who][idx[who]]; idx[who] += 1; d = dur(f)
    tl.append({"i":i,"shot":shot,"speaker":who,"start":round(t,2),"end":round(t+d,2),"text":text}); parts.append((t,f)); t += d
total = round(t + 0.1, 2)
inp = sum([["-i",f] for _,f in parts], [])
flt = "".join(f"[{k}]adelay={int(s*1000)}|{int(s*1000)}[d{k}];" for k,(s,_) in enumerate(parts)) + "".join(f"[d{k}]" for k in range(len(parts))) + f"amix=inputs={len(parts)}:normalize=0,apad=whole_dur={total}[o]"
subprocess.run(["ffmpeg","-y","-v","error",*inp,"-filter_complex",flt,"-map","[o]","-ar","44100","-ac","1","vo.wav"],check=True)
json.dump({"duration": total, "lines": tl}, open("timeline.json","w"), ensure_ascii=False, indent=1)
for l in tl: print(l["i"], l["speaker"], l["start"], l["end"])
print("voice end", total, "segments", {k:len(v) for k,v in clips.items()})
