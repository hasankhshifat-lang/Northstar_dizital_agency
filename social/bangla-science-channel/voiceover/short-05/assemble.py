"""Split the three takes into lines, normalise, speed up slightly, and lay them out with beat gaps -> vo.wav + timeline.json."""
import subprocess, re, json, os
L = json.load(open("lines.json"))
TEMPO = 1.06
def segs(f, d):
    out = subprocess.run(["ffmpeg","-i",f,"-af",f"silencedetect=noise=-38dB:d={d}","-f","null","-"],capture_output=True,text=True).stderr
    st=[float(x) for x in re.findall(r"silence_start: ([\d.]+)",out)]; en=[float(x) for x in re.findall(r"silence_end: ([\d.]+)",out)]
    m=re.search(r"Duration: (\d+):(\d+):([\d.]+)",out); dur=int(m.group(2))*60+float(m.group(3))
    s=[];cur=0.0
    for a,b in zip(st,en):
        if a-cur>0.3: s.append((cur,a))
        cur=b
    if dur-cur>0.3: s.append((cur,dur))
    return s
os.makedirs("lines", exist_ok=True)
clips = {}
for who, d in (("mama",0.55),("bithi",0.8),("boltu",0.55)):
    for k,(a,b) in enumerate(segs(f"takes/{who}_1.mp3", d)):
        out=f"lines/{who}_{k}.wav"
        subprocess.run(["ffmpeg","-y","-v","error","-i",f"takes/{who}_1.mp3","-ss",f"{max(0,a-0.06):.2f}","-to",f"{b+0.1:.2f}",
                        "-af",f"atempo={TEMPO},loudnorm=I=-16:TP=-2","-ac","1","-ar","44100",out])
        clips.setdefault(who, []).append(out)
def dur(f): return float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",f],capture_output=True,text=True).stdout)
# gap BEFORE each line (beats): line 0 starts after the splash hook; extra beats for actions
START = 1.05
GAP = {1: .35, 2: .3, 3: .35, 4: .3, 5: .45, 6: .35, 7: 1.5, 8: .5, 9: .4, 10: .5}
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
