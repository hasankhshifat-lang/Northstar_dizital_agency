#!/usr/bin/env python3
"""Synthesize SFX + folk music bed for Pilot 1 (rickshaw version) and write wav stems.
All sounds are generated here (no samples), so there are no licensing issues."""
import numpy as np, wave, sys, json
from pathlib import Path
SR = 44100
S = Path(sys.argv[1]); OFF = float(sys.argv[2]); DUR = OFF + 107.58 + 0.4
rng = np.random.default_rng(7)
def tt(d): return np.arange(int(d*SR))/SR
def env(n, a=0.005, r=None):
    e = np.ones(n); k=int(a*SR); e[:k]=np.linspace(0,1,k) if k>0 else e[:k]
    return e
def lp(x, a):  # one-pole lowpass, a in (0,1): higher = brighter
    y=np.empty_like(x); s=0.0
    for i in range(len(x)): s += a*(x[i]-s); y[i]=s
    return y
def noise(d): return rng.standard_normal(int(d*SR))
def sweep(f0,f1,d,shape=1.0):
    t=tt(d); f=f0+(f1-f0)*(t/d)**shape; return np.sin(2*np.pi*np.cumsum(f)/SR)

# ---------------- SFX ----------------
def bell():  # rickshaw bell: two ratchet bursts of a bright inharmonic bell
    out=np.zeros(int(1.2*SR))
    for b0 in (0.0, 0.42):
        for k in range(6):
            st=int((b0+k*0.045)*SR); t=tt(0.35)
            s=sum(a*np.sin(2*np.pi*f*t) for f,a in ((2350,1),(3120,.6),(4180,.4),(5600,.25)))*np.exp(-t*14)
            out[st:st+len(s)]+=s*(0.55 if k else 1)
    return out*0.35
def horn():
    t=tt(1.7); vib=1+0.004*np.sin(2*np.pi*5*t)
    s=sum(np.sin(2*np.pi*f*vib*t)/k for k,f in enumerate((110,220,330,440,165,330),1))
    e=np.minimum(1,t/0.18)*np.minimum(1,(1.7-t)/0.4); return lp(s*e,0.25)*0.5
def plop(f0=900,f1=180,d=0.14,g=0.6):
    s=sweep(f0,f1,d,0.5)*np.exp(-tt(d)*18); return s*g
def bubbles(d=1.2,n=7,g=0.25):
    out=np.zeros(int(d*SR))
    for _ in range(n):
        st=rng.integers(0,len(out)-int(0.08*SR)); f=rng.uniform(500,1200)
        s=sweep(f,f*1.8,0.06)*np.exp(-tt(0.06)*30); out[st:st+len(s)]+=s
    return out*g
def splash(d=0.6,g=0.5):
    x=noise(d)*np.exp(-tt(d)*6); return lp(x,0.35)*g
def whoosh(d=0.45,g=0.35):
    t=tt(d); x=noise(d); e=np.sin(np.pi*t/d)**2
    y=np.empty_like(x); s=0.0
    for i in range(len(x)):
        a=0.03+0.25*e[i]; s+=a*(x[i]-s); y[i]=s
    return y*e*g*3
def pop(g=0.35):
    s=sweep(500,1300,0.06)*np.exp(-tt(0.06)*40); return s*g
def ding(f=1320,g=0.35,d=0.9):
    t=tt(d); return (np.sin(2*np.pi*f*t)+0.4*np.sin(2*np.pi*2.76*f*t))*np.exp(-t*5)*g
def chime(g=0.3):
    out=np.zeros(int(1.0*SR))
    for k,f in enumerate((1047,1319,1568,2093)):
        s=ding(f,1,0.7); st=int(k*0.08*SR); out[st:st+len(s)]+=s
    return out*g/2
def buzz(g=0.22):
    t=tt(0.38); s=np.sign(np.sin(2*np.pi*130*t))*0.6+np.sign(np.sin(2*np.pi*137*t))*0.4
    return lp(s,0.2)*np.minimum(1,(0.38-t)/0.05)*g
def boing(g=0.35):
    t=tt(0.55); f=320+180*np.sin(2*np.pi*9*t)*np.exp(-t*4)+t*200
    return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*5)*g
def thud(g=0.6):
    t=tt(0.3); s=sweep(90,38,0.3)*np.exp(-t*12)+lp(noise(0.3),0.1)*np.exp(-t*40)*0.5
    return s*g
def stamp(g=0.6): return thud(g)+np.pad(pop(0.15),(0,int(0.3*SR)-int(0.06*SR)))
def crinkle(d=1.3,g=0.25):
    out=np.zeros(int(d*SR))
    for _ in range(int(d*55)):
        st=rng.integers(0,len(out)-200); n=rng.integers(40,200); out[st:st+n]+=rng.standard_normal(n)*np.exp(-np.arange(n)/40)
    return out*g
def creak(g=0.22):
    t=tt(0.6); f=95-25*t; s=np.sign(np.sin(2*np.pi*np.cumsum(f)/SR))*(0.6+0.4*np.sin(2*np.pi*18*t))
    return lp(s,0.08)*np.sin(np.pi*t/0.6)*g
def beep(g=0.22):
    t=tt(0.16); return np.sin(2*np.pi*880*t)*np.minimum(1,(0.16-t)/0.02)*g
def glug(g=0.5):
    out=np.zeros(int(0.8*SR))
    for k,f in enumerate((520,420,330)):
        s=plop(f,f*0.4,0.16,1); st=int(k*0.18*SR); out[st:st+len(s)]+=s
    return out*g
def tick(g=0.15): return pop(g)

# timeline (main-episode times get +OFF)
H = [(0.0,whoosh(0.4,0.25)),(1.88,whoosh()),(2.25,plop()),(2.4,bubbles(1.0)),(3.37,whoosh()),(4.07,pop()),(4.77,boing()),(5.69,whoosh(0.35)),(7.05,whoosh(0.5,0.4)),(7.15,bell()),(7.25,pop(0.2)),(7.4,pop(0.2)),(7.55,pop(0.2))]
M = [(0.25,horn()),(5.15,plop()),(5.3,bubbles(1.6)),(11.5,boing()),(15.4,boing(0.3)),(16.2,whoosh(0.35,0.2)),(21.55,thud()),
 (24.9,pop()),(26.7,pop(0.25)),(28.5,buzz()),(29.1,pop(0.25)),(30.4,ding()),(32.0,boing(0.18)),
 (34.6,whoosh()),(35.1,pop(0.2)),(36.6,pop(0.25)),(37.7,crinkle()),(39.65,splash(0.5,0.35)),(40.6,pop(0.22)),(41.0,plop(700,150,0.16,0.5)),(41.3,bubbles(2.0,10)),(42.0,pop(0.22)),
 (42.6,whoosh(0.4,0.25)),(43.3,pop(0.2)),(43.6,pop(0.2)),(45.0,stamp()),
 (47.3,whoosh()),(48.4,whoosh(0.8,0.18)),(48.8,pop(0.22)),(51.2,splash(0.8,0.25)),(51.4,pop(0.22)),(53.5,creak()),(54.5,thud(0.35)),(54.6,pop(0.2)),
 (55.2,pop(0.25)),(55.4,whoosh(0.6,0.25)),(58.0,ding(1568)),(59.62,chime()),(60.94,whoosh(0.5,0.25)),(61.2,plop()),(61.6,pop(0.22)),(63.6,thud(0.5)),(64.2,pop(0.22)),
 (65.8,glug()),(66.0,bubbles(1.2,8)),(66.2,buzz(0.18)),
 (67.2,whoosh()),(69.0,chime()),(69.6,pop(0.25)),(71.9,ding(1760,0.35)),
 (73.6,whoosh()),(74.6,splash(0.4,0.2)),(76.9,plop(800,300,0.12,0.4)),(77.4,plop(700,260,0.12,0.4)),(77.9,plop(900,320,0.12,0.4)),(78.4,plop(650,240,0.12,0.4)),(78.6,glug(0.55)),(78.9,bubbles(1.0,8)),(79.3,pop(0.25)),
 (80.7,whoosh()),(81.2,pop(0.22)),(82.2,pop(0.25)),(84.0,creak()),(86.0,creak(0.28)),(85.1,whoosh(0.35,0.2)),(86.0,pop(0.2)),(87.3,beep()),(87.9,beep()),(88.5,beep()),
 (89.9,whoosh()),(95.0,boing(0.25)),(95.8,whoosh()),(97.8,pop(0.22)),(99.0,pop(0.22)),(101.7,whoosh()),(101.8,pop(0.25)),(103.4,pop(0.25)),(105.0,ding(1320,0.3)),
 (106.2,bell()),(106.25,whoosh(0.5,0.3))]
M += [(81.4+i*3.6/13, tick(0.12)) for i in range(13)]
sfx=np.zeros(int(DUR*SR))
def put(buf,t0,s):
    st=int(t0*SR)
    if st>=len(buf): return
    e=min(len(buf),st+len(s)); buf[st:e]+=s[:e-st]
for t0,s in H: put(sfx,t0,s)
for t0,s in M: put(sfx,t0+OFF,s)
# gentle water ambience under deck scenes
amb=lp(noise(DUR),0.02)*0.5; lfo=0.6+0.4*np.sin(2*np.pi*0.15*tt(DUR)); amb*=lfo
mask=np.zeros(int(DUR*SR))
for a,b in [(0,7.05),(OFF+0,OFF+34.6),(OFF+73.6,OFF+80.7),(OFF+89.9,OFF+95.8)]:
    i0,i1=int(a*SR),int(b*SR); m=np.ones(i1-i0); r=int(0.4*SR); m[:r]=np.linspace(0,1,r); m[-r:]=np.linspace(1,0,r); mask[i0:i1]=m
sfx+=amb*mask*0.12

# ---------------- music bed (D major pentatonic folk loop, 100 BPM) ----------------
BPM=100; beat=60/BPM; mus=np.zeros(int(DUR*SR))
def pluck(f,d=0.6,g=0.3):
    t=tt(d); s=sum(np.sin(2*np.pi*f*k*t)/k*np.exp(-t*(3+k*1.8)) for k in range(1,9)); return s*g*np.minimum(1,t/0.004)
def dha(g=0.5): t=tt(0.3); return (sweep(120,55,0.3,0.6)*np.exp(-t*10)+lp(noise(0.3),0.15)*np.exp(-t*30)*0.3)*g
def tin(g=0.25): t=tt(0.12); return (np.sin(2*np.pi*420*t)*np.exp(-t*35)+lp(noise(0.12),0.6)*np.exp(-t*60)*0.4)*g
def shk(g=0.05): t=tt(0.05); return lp(noise(0.05),0.9)*np.exp(-t*80)*g
N={"D4":293.66,"E4":329.63,"F#4":369.99,"A4":440.0,"B4":493.88,"D5":587.33,"E5":659.25,"F#5":739.99,"A3":220.0,"B3":246.94}
phr=[["D4","F#4","A4","B4","A4","F#4","E4","D4"],["E4","F#4","A4","D5","B4","A4","F#4","A4"],["D5","B4","A4","F#4","A4","B4","A4","F#4"],["E4","D4","E4","F#4","E4","D4","A3","D4"]]
start=7.1; t0=start; bar=0
while t0 < DUR:
    notes=phr[bar%4]
    for k,nm in enumerate(notes):   # 8th notes
        if (bar%2==1 and k in (3,7)) : continue
        put(mus,t0+k*beat/2,pluck(N[nm],0.55,0.22))
    for k,p in enumerate(["dha",None,"tin","tin","dha",None,"tin",None]):
        if p=="dha": put(mus,t0+k*beat/2,dha())
        if p=="tin": put(mus,t0+k*beat/2,tin())
    for k in range(16): put(mus,t0+k*beat/4,shk(0.05 if k%2 else 0.03))
    t0+=4*beat; bar+=1
dr=tt(DUR); drone=(np.sin(2*np.pi*73.42*dr)+0.5*np.sin(2*np.pi*110*dr)+0.25*np.sin(2*np.pi*146.8*dr))*0.06*(0.8+0.2*np.sin(2*np.pi*0.1*dr))
drone[:int(start*SR)]=0; mus+=drone
fade=np.ones(len(mus)); i0=int(start*SR); fade[:i0]=0; r=int(0.6*SR); fade[i0:i0+r]=np.linspace(0,1,r); fe=int((DUR-2.5)*SR); fade[fe:]=np.linspace(1,0,len(fade)-fe); mus*=fade

def save(name,x):
    x=x/ max(1e-9, np.max(np.abs(x))) * 0.89
    with wave.open(str(S/f"anim/{name}.wav"),"wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x*32767).astype(np.int16).tobytes())
save("sfx",sfx); save("music",mus)
print("ok", round(DUR,2), "s;", len(H)+len(M), "sfx events")
