"""Split each take into lines at long pauses, transcribe each line with Groq Whisper, score against the script."""
import subprocess, re, json, sys, os, difflib, urllib.request, urllib.error, uuid
L = json.load(open("lines.json"))
def segs(f, d=0.55):
    out = subprocess.run(["ffmpeg","-i",f,"-af",f"silencedetect=noise=-38dB:d={d}","-f","null","-"],capture_output=True,text=True).stderr
    st=[float(x) for x in re.findall(r"silence_start: ([\d.]+)",out)]; en=[float(x) for x in re.findall(r"silence_end: ([\d.]+)",out)]
    m=re.search(r"Duration: (\d+):(\d+):([\d.]+)",out); dur=int(m.group(2))*60+float(m.group(3))
    s=[];cur=0.0
    for a,b in zip(st,en):
        if a-cur>0.3: s.append((cur,a))
        cur=b
    if dur-cur>0.3: s.append((cur,dur))
    return s
def whisper(path):
    bnd=uuid.uuid4().hex; data=open(path,"rb").read()
    body=(f"--{bnd}\r\nContent-Disposition: form-data; name=\"model\"\r\n\r\nwhisper-large-v3\r\n--{bnd}\r\nContent-Disposition: form-data; name=\"language\"\r\n\r\nbn\r\n"
          f"--{bnd}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"a.wav\"\r\nContent-Type: audio/wav\r\n\r\n").encode()+data+f"\r\n--{bnd}--\r\n".encode()
    req=urllib.request.Request("https://api.groq.com/openai/v1/audio/transcriptions",data=body,method="POST",
        headers={"Content-Type":f"multipart/form-data; boundary={bnd}","Authorization":"Bearer x","User-Agent":"Mozilla/5.0"})
    import time
    for k in range(8):
        try:
            r=json.load(urllib.request.urlopen(req,timeout=120))["text"]; time.sleep(2.5); return r
        except urllib.error.HTTPError as e:
            if e.code!=429: raise
            wait=float(e.headers.get("retry-after") or 10*(k+1)); time.sleep(min(wait,60))
    raise RuntimeError("Groq rate limit")
clean=lambda t: re.sub(r"\[[^\]]*\]","",t).strip()
os.makedirs("lines",exist_ok=True); report={}
for who,n in (("mama",4),("bithi",4),("boltu",2)):
    script=[clean(t) for s,w,t in L if w==who or (w=="both" and who in ("bithi","boltu"))]
    for take in (1,):
        f=f"takes/{who}_{take}.mp3"; s=segs(f)
        if len(s)!=n: report[f"{who}_{take}"]=f"{len(s)} segments (need {n}), skipped"; continue
        scores=[]
        for i,(a,b) in enumerate(s):
            out=f"lines/{who}_{take}_{i}.wav"
            subprocess.run(["ffmpeg","-y","-v","error","-i",f,"-ss",f"{max(0,a-0.08):.2f}","-to",f"{b+0.12:.2f}","-ac","1","-ar","44100",out])
            tx=whisper(out); r=difflib.SequenceMatcher(None,re.sub(r"[^ঀ-৿]","",tx),re.sub(r"[^ঀ-৿]","",script[i])).ratio()
            scores.append(round(r,2))
        report[f"{who}_{take}"]={"mean":round(sum(scores)/n,3),"lines":scores}
print(json.dumps(report,indent=1))
json.dump(report,open("take_scores.json","w"),indent=1)
