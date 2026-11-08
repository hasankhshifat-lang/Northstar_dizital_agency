#!/usr/bin/env python3
"""Build anim/index.html: one animation engine, four visual styles (?style=cutout|comic|doodle|paper)."""
import json, sys
from pathlib import Path
S = Path(sys.argv[1])          # scratchpad
FONTS = S / "fonts"
chars = json.loads((S / "chars/chars.json").read_text())
tl = json.loads((S / "vo/timeline.json").read_text())
lines = [l for l in tl["lines"] if l["end"] <= 35.2]

def font(fam, file):
    return f"@font-face{{font-family:{fam};src:url(file://{FONTS}/{file})}}"

FONT_CSS = "\n".join([
    font("Baloo", "fontsource-baloo-da-2-5.3.0/files/baloo-da-2-bengali-800-normal.woff2"),
    font("Baloo", "fontsource-baloo-da-2-5.3.0/files/baloo-da-2-latin-800-normal.woff2"),
    font("Atma", "fontsource-atma-5.3.0/files/atma-bengali-600-normal.woff2"),
    font("Atma", "fontsource-atma-5.3.0/files/atma-latin-600-normal.woff2"),
    font("Hind", "fontsource-hind-siliguri-5.3.0/files/hind-siliguri-bengali-700-normal.woff2"),
    font("Hind", "fontsource-hind-siliguri-5.3.0/files/hind-siliguri-latin-700-normal.woff2"),
])

# ---- background (1080x1920), rickshaw-art Sadarghat --------------------------------
def bunting():
    cols = ["#D7263D", "#FFC300", "#F72585", "#2BA84A", "#00A6A6"]
    s = '<path d="M0 250 Q540 330 1080 250" fill="none" stroke="#1A1A1A" stroke-width="5"/>'
    for i in range(15):
        x = 36 + i * 72; y = 250 + 80 * (1 - ((x - 540) / 540) ** 2)
        s += f'<path d="M{x-28:.0f} {y-3:.0f} L{x+28:.0f} {y-3:.0f} L{x:.0f} {y+50:.0f} Z" fill="{cols[i%5]}" stroke="#1A1A1A" stroke-width="4"/>'
    return s
BG = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920"><g stroke="#1A1A1A" stroke-linejoin="round" stroke-linecap="round">
<rect width="1080" height="1060" fill="#4CC9F0" stroke="none"/>
<g fill="#FFC300" stroke-width="5"><path d="M860 120 L878 70 L896 120Z"/><path d="M980 300 L1035 318 L980 336Z"/><path d="M740 300 L685 318 L740 336Z"/><path d="M860 500 L878 550 L896 500Z"/></g>
<circle cx="878" cy="318" r="118" fill="#D7263D" stroke-width="7"/><circle cx="878" cy="318" r="80" fill="none" stroke="#FFC300" stroke-width="7" stroke-dasharray="16 14"/>
<g fill="#fff" stroke-width="5"><path d="M110 470 q12 -60 72 -48 q24 -48 84 -18 q60 -12 66 42 q48 12 24 54 h-240 q-48 -6 -6 -30z"/><path d="M470 600 q10 -46 58 -36 q22 -36 66 -12 q48 -8 50 34 q36 10 17 41 h-192 q-36 -5 1 -27z"/></g>
{bunting()}
<rect y="1000" width="1080" height="330" fill="#1F8FD1" stroke="none"/>
<g fill="none" stroke="#fff" stroke-width="5" opacity=".85"><path d="M60 1150 q24 -14 48 0 t48 0"/><path d="M720 1120 q24 -14 48 0 t48 0"/><path d="M420 1250 q24 -14 48 0 t48 0"/></g>
<g id="bigLaunch" stroke-width="6">
 <path d="M70 1000 L700 1000 L655 1085 L120 1085 Z" fill="#D7263D"/><rect x="120" y="1040" width="535" height="14" fill="#FFC300"/>
 <rect x="140" y="890" width="490" height="110" fill="#fff"/><rect x="200" y="810" width="370" height="80" fill="#00A6A6"/>
 <g fill="#4CC9F0">{''.join(f'<rect x="{160+i*76}" y="915" width="50" height="50" rx="8"/>' for i in range(6))}</g>
 <g fill="#FFC300">{''.join(f'<circle cx="{255+i*76}" cy="850" r="15"/>' for i in range(4))}</g>
 <rect x="530" y="730" width="48" height="80" fill="#D7263D"/><rect x="530" y="730" width="48" height="18" fill="#1A1A1A"/>
 <path d="M200 810 {' '.join('q20 -24 40 0' for _ in range(9))}" fill="none" stroke="#F72585" stroke-width="7"/></g>
<g stroke-width="5"><path d="M760 1140 Q860 1185 990 1140 L965 1172 Q860 1205 785 1172Z" fill="#8B4A1F"/><path d="M845 1140 L845 1040 L912 1122Z" fill="#fff"/></g>
<rect y="1330" width="1080" height="590" fill="#F4B942" stroke="none"/>
<g stroke="#B9791A" stroke-width="5"><path d="M0 1420 H1080 M0 1530 H1080 M0 1660 H1080 M0 1800 H1080"/><path d="M200 1330 V1420 M620 1420 V1530 M330 1530 V1660 M880 1530 V1660 M150 1660 V1800 M700 1660 V1800"/></g>
<rect y="1255" width="1080" height="28" fill="#00A6A6" stroke-width="6"/>
<path d="M0 1283 {' '.join('q45 46 90 0' for _ in range(12))}" fill="none" stroke="#D7263D" stroke-width="8"/>
<g fill="#FFC300" stroke-width="4">{''.join(f'<rect x="{80+i*180}" y="1255" width="12" height="78"/>' for i in range(6))}</g>
<path d="M0 1333 H1080" stroke-width="7"/>
</g></svg>'''

# Life-jacket overlay for Mama (420x600 canvas, belly ellipse cx210 cy330)
JACKETS = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 600" width="420" height="600"><g stroke="#1A1A1A" stroke-width="7" stroke-linejoin="round">
<circle cx="210" cy="330" r="150" fill="#FF7A00"/>
<path d="M70 270 Q210 220 350 270 M60 335 Q210 285 360 335 M70 400 Q210 355 350 400" fill="none" stroke-width="6"/>
<g fill="#FFC300" stroke-width="5"><rect x="105" y="262" width="210" height="18" rx="7"/><rect x="95" y="328" width="230" height="18" rx="7"/><rect x="108" y="392" width="204" height="18" rx="7"/></g>
<g fill="#fff" stroke-width="4"><rect x="199" y="257" width="22" height="28" rx="4"/><rect x="199" y="323" width="22" height="28" rx="4"/><rect x="199" y="387" width="22" height="28" rx="4"/></g>
<ellipse cx="390" cy="380" rx="58" ry="62" fill="#C1440E"/><rect x="368" y="305" width="44" height="24" rx="6" fill="#C1440E" stroke-width="5"/><ellipse cx="390" cy="305" rx="28" ry="9" fill="#8A2E08" stroke-width="5"/>
</g></svg>'''

PROPS = {
 "bucket": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 260" width="220" height="260"><g stroke="#1A1A1A" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">
<path d="M20 70 L200 70 L178 250 L42 250 Z" fill="#9AA7B0"/><path d="M28 130 H192 M34 190 H186" stroke-width="5"/><path d="M20 70 Q110 -20 200 70" fill="none" stroke-width="6"/>
<ellipse cx="110" cy="72" rx="90" ry="22" fill="#4CC9F0"/>
<g class="boat"><path d="M66 50 L154 50 L138 74 L82 74 Z" fill="#E4E9ED" stroke-width="6"/><path d="M74 54 L90 62 L106 52 L122 62 L140 54" fill="none" stroke="#9AA7B0" stroke-width="3"/></g></g></svg>''',
 "nail": '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 200" width="60" height="200"><g stroke="#1A1A1A" stroke-width="6" stroke-linejoin="round"><rect x="8" y="6" width="44" height="16" rx="5" fill="#9AA7B0"/><path d="M22 22 L38 22 L34 170 L30 196 L26 170 Z" fill="#B8C2C9"/></g></svg>''',
}

DATA = {"chars": chars, "bg": BG, "jackets": JACKETS, "props": PROPS, "lines": lines}

HTML = r'''<!doctype html><html><head><meta charset="utf-8"><style>
__FONTS__
:root{--red:#D7263D;--pink:#F72585;--teal:#00A6A6;--yel:#FFC300;--ink:#1A1A1A;--paper:#FFF6E5;--pencil:#2B4C8C}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;background:#000}
#stage{position:absolute;inset:0;overflow:hidden;font-family:Hind}
#world{position:absolute;left:0;top:0;width:1080px;height:1920px;transform-origin:0 0}
.layer{position:absolute;left:0;top:0}
.ch{position:absolute;transform-origin:50% 100%}
.ch svg,.prop svg{display:block;width:100%;height:100%;overflow:visible}
.prop{position:absolute}
#title{position:absolute;top:44px;left:50%;transform:translateX(-50%) rotate(-1.5deg);padding:14px 56px 4px;background:var(--red);border:7px solid var(--ink);
 border-radius:40px 40px 70px 70px/40px 40px 90px 90px;box-shadow:0 10px 0 var(--ink);font-family:Baloo;font-size:84px;line-height:1.15;color:var(--yel);
 -webkit-text-stroke:5px var(--ink);paint-order:stroke fill;text-shadow:5px 5px 0 var(--ink);white-space:nowrap;z-index:20}
#label{position:absolute;top:248px;left:50%;transform:translateX(-50%);z-index:20;font-family:Hind;font-size:34px;color:#fff;background:rgba(26,26,26,.85);
 padding:6px 24px 2px;border-radius:30px;white-space:nowrap;border:3px solid var(--yel)}
#sub{position:absolute;left:50%;top:330px;transform:translateX(-50%);max-width:980px;text-align:center;z-index:20;font-family:Hind;font-size:48px;line-height:1.3;
 color:#fff;background:rgba(26,26,26,.85);border:4px solid var(--yel);border-radius:36px;padding:14px 34px 8px;opacity:0}
#sub .who{display:block;font-size:30px;color:var(--yel)}
.sfx{position:absolute;font-family:Baloo;font-size:120px;color:var(--yel);-webkit-text-stroke:7px var(--ink);paint-order:stroke fill;text-shadow:7px 7px 0 var(--pink);z-index:15;opacity:0;white-space:nowrap}
#inset{position:absolute;width:640px;height:640px;left:220px;top:520px;border-radius:50%;border:12px solid var(--ink);overflow:hidden;background:#1F8FD1;opacity:0;z-index:12;
 box-shadow:0 0 0 14px var(--yel),0 0 0 22px var(--ink)}
#inset .nail{position:absolute;left:290px;width:60px;height:200px}
#inset .waves{position:absolute;inset:0}
#qmark{position:absolute;left:640px;top:560px;font-family:Baloo;font-size:360px;color:var(--red);-webkit-text-stroke:10px var(--ink);paint-order:stroke fill;opacity:0;z-index:14}
#frameBorder{position:absolute;inset:0;pointer-events:none;z-index:18}
.cutout #stage{background:#F4B942}
/* ---------- style: comic ---------- */
.comic #stage{background:radial-gradient(circle,#F72585 22%,transparent 24%) 0 0/36px 36px,#FFC300}
.comic #world{border:14px solid var(--ink);box-shadow:0 0 0 14px #fff, 18px 18px 0 14px var(--ink);overflow:hidden;background:#fff}
.comic #sub{display:none}
.balloon{position:absolute;z-index:16;background:#fff;border:7px solid var(--ink);border-radius:60px;padding:22px 34px 12px;font-family:Hind;font-size:44px;line-height:1.3;max-width:640px;opacity:0;box-shadow:8px 8px 0 var(--ink)}
.balloon:after{content:"";position:absolute;bottom:-46px;left:var(--tail,80px);border:22px solid transparent;border-top:30px solid var(--ink)}
.comic .sfx{color:#fff;text-shadow:8px 8px 0 var(--ink);-webkit-text-stroke:8px var(--red)}
.caption{position:absolute;z-index:17;background:var(--yel);border:6px solid var(--ink);font-family:Baloo;font-size:40px;padding:10px 26px 2px;box-shadow:6px 6px 0 var(--ink);opacity:0}
/* ---------- style: doodle ---------- */
.doodle #stage{background:linear-gradient(90deg,transparent 116px,#E8A0A8 116px,#E8A0A8 121px,transparent 121px),repeating-linear-gradient(180deg,#FFF9EC 0,#FFF9EC 77px,#B9D3E8 77px,#B9D3E8 80px)}
.doodle #title{background:none;border:none;box-shadow:none;color:var(--red);-webkit-text-stroke:0;text-shadow:none;font-family:Atma;transform:translateX(-50%) rotate(-2deg)}
.doodle #sub{background:rgba(255,249,236,.94);border:4px dashed var(--pencil);color:var(--pencil);font-family:Atma;font-size:50px}
.doodle #sub .who{color:var(--red)}
.doodle .sfx{font-family:Atma;color:var(--red);-webkit-text-stroke:0;text-shadow:none}
.doodle #inset{background:#FFF9EC;box-shadow:none;border:6px dashed var(--pencil)}
.doodle #qmark{font-family:Atma;-webkit-text-stroke:0;color:var(--red)}
.doodle #label{background:var(--pencil);border-color:var(--pencil)}
/* ---------- style: paper ---------- */
.paper #stage{background:#E9DCC0}
.paper .ch,.paper .prop{filter:drop-shadow(5px 0 0 #fff) drop-shadow(-5px 0 0 #fff) drop-shadow(0 5px 0 #fff) drop-shadow(0 -5px 0 #fff) drop-shadow(10px 14px 6px rgba(0,0,0,.35)) saturate(.85) sepia(.12)}
.paper #bgLayer{filter:url(#rough) saturate(.75) sepia(.25) contrast(.95)}
.paper .ch svg,.paper .prop svg{filter:url(#rough)}
.paper #sub{background:#fff;color:var(--ink);border:none;border-radius:4px;box-shadow:6px 8px 0 rgba(0,0,0,.25);transform:translateX(-50%) rotate(-1.2deg)}
.paper #sub .who{color:var(--red)}
.paper #title{box-shadow:8px 12px 0 rgba(0,0,0,.3);border-color:#fff}
#grain{position:absolute;inset:0;z-index:19;pointer-events:none;opacity:0;mix-blend-mode:multiply}
.paper #grain{opacity:.35}
</style></head><body><div id="stage">
<div id="world"><div id="inner" style="position:absolute;left:0;top:0;width:1080px;height:1920px;transform-origin:0 0"><div id="bgLayer" class="layer"></div>
 <div class="ch" id="mama"></div><div class="ch" id="boltu"></div><div class="ch" id="tuni"></div>
 <div class="prop" id="bucket"></div>
</div></div>
<div id="inset"><svg class="waves" viewBox="0 0 640 640"><g fill="none" stroke="#fff" stroke-width="6" opacity=".8"><path d="M60 140 q30 -18 60 0 t60 0"/><path d="M380 260 q30 -18 60 0 t60 0"/><path d="M160 460 q30 -18 60 0 t60 0"/></g></svg><div class="nail"></div></div>
<div id="qmark">?</div>
<div class="sfx" id="sfx1" style="left:560px;top:430px">ভোঁ-ও-ও!</div>
<div class="sfx" id="sfx2" style="left:640px;top:1130px">টুপ!</div>
<div class="sfx" id="sfx3" style="left:90px;top:1000px">ধপাস!</div>
<div class="sfx" id="sfx4" style="left:745px;top:1010px">টুং!</div>
<div class="balloon" id="bal"></div><div class="caption" id="cap"></div>
<div id="title">লঞ্চ ডুববে?</div><div id="label"></div>
<div id="sub"><span class="who"></span><span class="txt"></span></div>
<svg id="frameBorder" viewBox="0 0 1080 1920"></svg>
<svg id="grain" viewBox="0 0 1080 1920"><filter id="rough" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="9"/></filter><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" seed="4"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .36  0 0 0 0 .25  0 0 0 .9 0"/></filter><rect width="1080" height="1920" filter="url(#n)"/></svg>
</div>
<script>
const D = __DATA__;
const STYLE = new URLSearchParams(location.search).get("style") || "cutout";
document.documentElement.className = STYLE;
const LABELS = {cutout:"নমুনা ১ · রিকশা-আর্ট কাট-আউট অ্যানিমেশন", comic:"নমুনা ২ · মোশন কমিক", doodle:"নমুনা ৩ · খাতার ডুডল (হোয়াইটবোর্ড)", paper:"নমুনা ৪ · কাগজের কোলাজ স্টপ-মোশন"};
document.getElementById("label").textContent = LABELS[STYLE];
const NAMES = {mama:"মন্টু মামা", tuni:"টুনি", boltu:"বল্টু"};
const $ = id => document.getElementById(id);
$("bgLayer").innerHTML = D.bg;
$("bucket").innerHTML = D.props.bucket; $("inset").querySelector(".nail").innerHTML = D.props.nail;
// characters: each expression stacked, show one at a time
const SIZE = {mama:[420,600], tuni:[360,600], boltu:[320,600]};
const KEY = {mama:"Montu Mama", tuni:"Tuni", boltu:"Boltu"};
for (const c of ["mama","tuni","boltu"]) {
  const el = $(c); el.style.width = SIZE[c][0]+"px"; el.style.height = SIZE[c][1]+"px";
  for (const e of ["Default","Happy","Worried"]) {
    const w = document.createElement("div"); w.className = "expr e"+e; w.style.cssText = "position:absolute;inset:0;display:none";
    w.innerHTML = D.chars[KEY[c]][e]; el.appendChild(w);
  }
  if (c === "mama") { const j = document.createElement("div"); j.className="jackets"; j.style.cssText="position:absolute;inset:0;display:none"; j.innerHTML = D.jackets; el.appendChild(j); }
}
if (STYLE === "cutout") {   // floral rickshaw border
  let s = ""; const cols=["#F72585","#FFC300"];
  for (let i=0;i<14;i++){ const x=40+i*77; s+=`<g transform="translate(${x} 1585)">${flower(cols[i%2])}</g>`; }
  $("frameBorder").innerHTML = s;
}
function flower(c){ return `<g stroke="#1A1A1A" stroke-width="3"><ellipse cx="0" cy="-14" rx="9" ry="13" fill="${c}"/><ellipse cx="0" cy="14" rx="9" ry="13" fill="${c}"/><ellipse cx="-14" cy="0" rx="13" ry="9" fill="${c}"/><ellipse cx="14" cy="0" rx="13" ry="9" fill="${c}"/><circle r="8" fill="${c=="#FFC300"?"#D7263D":"#FFC300"}"/></g>`; }
// doodle: line-art treatment + stroke drawing
let drawables = [];
if (STYLE === "doodle") {
  for (const sel of ["#bgLayer svg", ".ch svg", ".prop svg", "#inset .nail svg"]) document.querySelectorAll(sel).forEach(svg => {
    svg.querySelectorAll("path,circle,ellipse,rect,line,polygon").forEach(p => {
      const fill = p.getAttribute("fill"); p.dataset.fill = fill || "";
      p.setAttribute("fill", "none"); p.setAttribute("stroke", "#1A1A1A");
      if (!p.getAttribute("stroke-width")) p.setAttribute("stroke-width", "5");
      try { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; drawables.push([p, L, svg]); } catch(e) {}
    });
  });
}
// ---------- helpers ----------
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const ease=x=>{x=clamp(x);return x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2};
const back=x=>{x=clamp(x);const c1=1.7,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2)};
const lerp=(a,b,x)=>a+(b-a)*x;
function rnd(seed){ const x=Math.sin(seed*12.9898)*43758.5453; return x-Math.floor(x); }
function speaking(who,t){ return D.lines.find(l=>l.speaker===who && t>=l.start && t<=l.end); }
function setExpr(c, e){ $(c).querySelectorAll(".expr").forEach(w=>w.style.display = w.classList.contains("e"+e)?"block":"none"); }
function place(c, x, y, s, rot=0, extra=""){ const el=$(c); el.style.left=(x-SIZE[c][0]/2)+"px"; el.style.top=(y-SIZE[c][1])+"px"; el.style.transform=`scale(${s}) rotate(${rot}deg) ${extra}`; }
function pop(id, t, t0, t1){ const el=$(id); const v = t>=t0&&t<=t1; el.style.opacity = v?1:0; if(v){ const k=back((t-t0)/0.25); el.style.transform=`scale(${0.3+0.7*k}) rotate(-8deg)`; } }
function drawIn(svg, t0, dur, t){ // doodle progressive stroke reveal for one svg root
  const items = drawables.filter(d=>d[2]===svg); const n=items.length;
  items.forEach(([p,L],i)=>{ const st=t0+dur*i/n*0.85; const k=clamp((t-st)/(dur*0.35)); p.style.strokeDashoffset = L*(1-k);
    if (p.dataset.fill && p.dataset.fill!=="none" && k>=1) { const f=clamp((t-st-dur*0.35)/0.4); p.setAttribute("fill", p.dataset.fill); p.style.fillOpacity = (0.55*f).toFixed(2); } });
}
// ---------- per-frame render ----------
window.render = function(t){
  if (STYLE === "paper") t = Math.floor(t*12)/12;          // stop-motion: 12 fps holds
  const J = STYLE==="paper" ? (k)=> (rnd(Math.floor(t*12)*7+k)-.5) : ()=>0;   // jitter
  const shot = t<5 ? 1 : t<7.5 ? 2 : t<15.4 ? 3 : t<23.0 ? 4 : 5;
  // camera
  const BASE = {s:1.3, x:-162, y:-729};
  let cam = {...BASE};
  if (shot===1) cam = {s:1.3+0.05*ease(t/5), x:-162-27*ease(t/5), y:-729-60*ease(t/5)};
  if (shot===2) cam = {s:1.35, x:-189, y:-789};
  if (shot===3) { const k=ease((t-7.5)/1.6), k2=ease((t-11)/1.4);
    const A={s:1.15,x:-81,y:-292}, B={s:1.7,x:-21,y:-1072};
    const s0=lerp(1.35,A.s,k), x0=lerp(-189,A.x,k), y0=lerp(-789,A.y,k);
    cam = {s:lerp(s0,B.s,k2), x:lerp(x0,B.x,k2), y:lerp(y0,B.y,k2)}; }
  if (shot===4) cam = {s:1.3, x:-162, y:-729};
  if (shot===5) cam = {s:1.3, x:-162, y:-729};
  if (STYLE==="comic") { // panel framing: world shown inside an inset panel that changes per shot
    const P = [50,330,980,1260];
    const w=$("world"); w.style.left=P[0]+"px"; w.style.top=P[1]+"px"; w.style.width=P[2]+"px"; w.style.height=P[3]+"px";
    const shotStart=[0,0,5,7.5,15.4,23][shot]; const slide=back((t-shotStart)/0.45);
    w.style.transform = `translate(${(1-slide)*1150}px,0) rotate(${(shot%2?-1:1)*0.8}deg)`;
    $("inner").style.transform = `translate(${cam.x-P[0]}px,${cam.y-P[1]}px) scale(${cam.s})`;
  } else {
    $("inner").style.transform = `translate(${cam.x+J(1)*6}px,${cam.y+J(2)*6}px) scale(${cam.s})`;
  }
  const off = {x:0,y:0};
  // ----- characters -----
  const bob = (k)=> STYLE==="comic"?0:Math.sin(t*9+k)*4;
  // Mama
  let mx = 330, ms = 1.0, mExpr="Default", jackets=false, mrot=0;
  if (shot===1){ mx = lerp(-260, 330, ease(t/2.4)); mExpr = "Happy"; }
  if (shot===2||shot===3){ mExpr="Worried"; }
  if (shot===4){ jackets=true; mExpr="Worried"; mx=300; if(t>21.3&&t<22.6) mrot = -14*Math.sin(clamp((t-21.3)/1.3)*Math.PI); }
  if (shot===5){ jackets=true; mExpr="Worried"; mx=150; ms=0.9; }
  const ms_ = speaking("mama",t);
  if (ms_ && STYLE!=="comic") { const open = Math.floor(t*7)%2===0; mExpr = open ? (shot===1?"Happy":"Worried") : "Default"; }
  setExpr("mama", mExpr); $("mama").querySelector(".jackets").style.display = jackets?"block":"none";
  place("mama", mx+off.x + J(3)*8, 1720+off.y+bob(0) + J(4)*6, ms, mrot + J(5)*2.5);
  // Boltu
  const bVis = shot>=4; $("boltu").style.display = bVis?"block":"none";
  if (bVis){ let bx = shot===4 ? lerp(1300, 820, ease((t-16.2)/1.4)) : 370; let be = "Default";
    const bs = speaking("boltu",t); if (bs) be = (shot===4) ? "Happy" : (STYLE==="comic"?"Default":(Math.floor(t*7)%2?"Happy":"Default"));
    if (shot===4 && t>18.4) be="Happy";
    setExpr("boltu", be); place("boltu", bx+off.x+J(6)*8, 1730+off.y+bob(2)+J(7)*6, 0.82, J(8)*2.5 + (bs&&shot===4? Math.sin(t*20)*3:0)); }
  // Tuni
  const tVis = shot===5; $("tuni").style.display = tVis?"block":"none";
  if (tVis){ let tx = lerp(1300, 600, ease((t-23)/1.2)); let te="Default"; const ts=speaking("tuni",t);
    if (ts && STYLE!=="comic") te = Math.floor(t*7)%2?"Happy":"Default"; if (STYLE==="comic"&&ts) te="Happy";
    setExpr("tuni", te); place("tuni", tx+off.x+J(9)*8, 1725+off.y+bob(4)+J(10)*6, 0.86, J(11)*2.5); }
  // bucket + boat
  const bk=$("bucket"); bk.style.display = shot===5?"block":"none";
  bk.style.left=(740+off.x+J(12)*6)+"px"; bk.style.top=(1470+off.y+J(13)*6)+"px"; bk.style.width="220px"; bk.style.height="260px";
  const boat=bk.querySelector(".boat"); if(boat) boat.setAttribute("transform", `translate(0 ${Math.sin(t*3)*4})`);
  // inset: nail sinking
  const inS = shot===2; $("inset").style.opacity = inS?1:0;
  if (inS){ const k=clamp((t-5.2)/2.0); $("inset").querySelector(".nail").style.top = lerp(-40, 520, ease(k))+"px";
    $("inset").style.transform = `scale(${back((t-5)/0.35)})`; }
  pop("qmark", t, 12.2, 15.3);
  pop("sfx1", t, 0.2, 1.8); pop("sfx2", t, 6.3, 7.4); pop("sfx3", t, 21.5, 22.6); pop("sfx4", t, 29.0, 30.2);
  // subtitles / balloons
  const L = D.lines.find(l=>t>=l.start-0.1 && t<=l.end+0.3);
  if (STYLE==="comic"){
    const b=$("bal");
    if (L){ const k=back((t-L.start+0.1)/0.3); b.style.opacity=1; b.style.transform=`scale(${0.4+0.6*k})`;
      const n = Math.ceil(L.text.length*clamp((t-L.start)/(Math.min(1.8,(L.end-L.start)*0.6))));  // typewriter
      b.textContent = L.text.slice(0,Math.max(n,1));
      const pos = {mama:[70,560,150], boltu:[300,600,300], tuni:[300,560,380]}[L.speaker]; b.style.left=pos[0]+"px"; b.style.top=pos[1]+"px"; b.style.setProperty("--tail",pos[2]+"px");
    } else b.style.opacity=0;
    const caps = {1:"সদরঘাট, ঈদের আগে...", 3:"এদিকে মামার মাথায় চিন্তা!", 5:"টুনির হাতে-কলমে পরীক্ষা"};
    const c=$("cap"); const cs={1:0,3:7.5,5:23}[shot];
    if (caps[shot] && t-cs<3.5){ c.style.opacity=1; c.textContent=caps[shot]; c.style.left="70px"; c.style.top="350px"; } else c.style.opacity=0;
  } else {
    const sub=$("sub");
    if (L){ sub.style.opacity=1; sub.querySelector(".who").textContent=NAMES[L.speaker]; sub.querySelector(".txt").textContent=L.text; }
    else sub.style.opacity=0;
  }
  // doodle drawing per shot
  if (STYLE==="doodle"){
    const bgSvg=document.querySelector("#bgLayer svg"); drawIn(bgSvg, 0, 3.2, t);
    drawIn(document.querySelector("#mama .eDefault svg"),0.8,1.6,t); drawIn(document.querySelector("#mama .eHappy svg"),0.8,1.6,t); drawIn(document.querySelector("#mama .eWorried svg"),0.8,1.6,t);
    document.querySelectorAll("#mama .jackets svg").forEach(s=>drawIn(s,15.5,1.2,t));
    document.querySelectorAll("#boltu svg").forEach(s=>drawIn(s,16.0,1.4,t));
    document.querySelectorAll("#tuni svg").forEach(s=>drawIn(s,23.0,1.4,t));
    document.querySelectorAll("#bucket svg").forEach(s=>drawIn(s,24.0,1.4,t));
    document.querySelectorAll("#inset .nail svg").forEach(s=>drawIn(s,5.0,0.6,t));
  }
};
window.render(0);
</script></body></html>'''

out = S / "anim/index.html"
out.write_text(HTML.replace("__FONTS__", FONT_CSS).replace("__DATA__", json.dumps(DATA, ensure_ascii=False)), encoding="utf-8")
print("wrote", out, out.stat().st_size, "bytes;", len(lines), "lines in excerpt")
