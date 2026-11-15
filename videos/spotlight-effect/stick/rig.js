// Stick-figure rig, copied from the style's demo (styles/stick-explainer/demo/index.html): skeleton, even-hose figure, springs, pop-in. Canvas 1080×1920.
const W = 1080, H = 1920;
const cv = document.getElementById('c'), g = cv.getContext('2d');
const C = { paper:'#F3F0EA', ink:'#24242C', mute:'#9C978C', tint:'#E2DDD2', sig:'#EB4A2A', soft:'#F4C3B4' };
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)), lerp=(a,b,t)=>a+(b-a)*t;
const seg=(t,a,b)=>clamp((t-a)/(b-a)), ss=t=>{t=clamp(t);return t*t*(3-2*t)};
const bell=(t,a,b)=>{const u=seg(t,a,b);return Math.sin(Math.PI*u)**2};   // 0→1→0, smooth start and end
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function hex(h){return [1,3,5].map(i=>parseInt(h.slice(i,i+2),16))}
function mix(a,b,t){const A=hex(a),B=hex(b);return 'rgb('+A.map((v,i)=>Math.round(lerp(v,B[i],clamp(t)))).join(',')+')'}

// ---------------- Paper: only a very fine matte grain, no vignette, no fibres ----------------
let paperC=null;
function paper(){
  if(!paperC){
    paperC=document.createElement('canvas');paperC.width=W;paperC.height=H;
    const x=paperC.getContext('2d');x.fillStyle=C.paper;x.fillRect(0,0,W,H);
    const id=x.getImageData(0,0,W,H),d=id.data,r=mulberry(11);
    for(let i=0;i<d.length;i+=4){const n=(r()+r()-1)*3.2;d[i]+=n;d[i+1]+=n;d[i+2]+=n;}
    x.putImageData(id,0,0);
  }
  g.drawImage(paperC,0,0);
}

// ---------------- Skeleton ----------------
const GEO = { thigh:.215, shin:.215, hipH:.42, spine:.285, sh:.065, upper:.18, fore:.155, gap:0, headR:.112, stance:.09 };
function rest(){ return { hx:0, hy:0, lean:0, bend:0, head:0,
  la:-.56, lb:.24, ra:.56, rb:-.24, lfx:0, lfy:0, rfx:0, rfy:0, hdx:0, hdy:0 }; }
const KEYS = Object.keys(rest());
const dirv=a=>[Math.sin(a),Math.cos(a)];

// Two-segment IK: hip H, foot F, knee toward side (-1 left / +1 right)
function ik(H,F,L1,L2,side){
  let dx=F[0]-H[0],dy=F[1]-H[1],d=Math.hypot(dx,dy);const m=(L1+L2)*.9995;
  if(d>m){F=[H[0]+dx/d*m,H[1]+dy/d*m];dx=F[0]-H[0];dy=F[1]-H[1];d=m;}
  const a=(L1*L1-L2*L2+d*d)/(2*d),h=Math.sqrt(Math.max(0,L1*L1-a*a));
  const px=H[0]+a*dx/d,py=H[1]+a*dy/d;let nx=-dy/d,ny=dx/d;
  if(nx*side<0){nx=-nx;ny=-ny}
  return [[px+nx*h,py+ny*h],F];
}
// Compute all joints of one figure (pixels). The head sits right on the neck (no gap); its lag only rotates, never translates, so the head always stays attached to the body.
function joints(f,p){
  const S=f.S, bx=f.x, gy=f.gy, prof=!!f.prof, face=f.face||1;
  const Hp=[bx+p.hx*S, gy-(GEO.hipH-p.hy)*S];
  const sd=dirv(Math.PI-p.lean);                      // spine points up: lean>0 leans right
  const N=[Hp[0]+sd[0]*GEO.spine*S, Hp[1]+sd[1]*GEO.spine*S];
  const mid=[(Hp[0]+N[0])/2,(Hp[1]+N[1])/2], perp=[-sd[1],sd[0]];
  const Cc=[mid[0]+perp[0]*p.bend*S, mid[1]+perp[1]*p.bend*S];
  const u=1-GEO.sh/GEO.spine;                           // shoulder point on the spine curve
  const Sh=[(1-u)*(1-u)*Hp[0]+2*(1-u)*u*Cc[0]+u*u*N[0],(1-u)*(1-u)*Hp[1]+2*(1-u)*u*Cc[1]+u*u*N[1]];
  const lag=clamp(p.hdx/GEO.headR*.9,-.35,.35);         // head follow-through: turns a little about the neck
  const hd=dirv(Math.PI-(p.lean+p.head+lag)), hr=GEO.headR*S;
  const Hd=[N[0]+hd[0]*hr, N[1]+hd[1]*hr];
  const arm=(a,b)=>{const e=dirv(a),E=[Sh[0]+e[0]*GEO.upper*S,Sh[1]+e[1]*GEO.upper*S];const w=dirv(a+b);return [E,[E[0]+w[0]*GEO.fore*S,E[1]+w[1]*GEO.fore*S]]};
  const st=prof?0:GEO.stance;
  const footL=[bx+(-st+p.lfx)*S, gy-p.lfy*S], footR=[bx+(st+p.rfx)*S, gy-p.rfy*S];
  const kL=prof?face:-1, kR=prof?face:1;
  return { Hp,N,Cc,Sh,Hd, aL:arm(p.la,p.lb), aR:arm(p.ra,p.rb),
    lL:ik(Hp,footL,GEO.thigh*S,GEO.shin*S,kL), lR:ik(Hp,footR,GEO.thigh*S,GEO.shin*S,kR) };
}

// ---------------- Figure drawing (parameter): ?fig=A | B | C ----------------
// The three drawings share one skeleton and one set of springs and change only how the joints are joined into lines. Nowhere is there a polyline:
// A even hose: each limb is one quadratic curve (the joint as control point), one line width for the whole body.
// B tapered stroke: limbs grow out of the torso, thick at the root and thin at hands and feet, like one stroke of a brush or marker; curved at the joints too.
// C one-line body: both legs are one stroke (foot→knee→hip→knee→foot), both arms one stroke (hand→elbow→shoulder→elbow→hand), the spine runs on into the head circle in one stroke.
const FIGS = {
  A:{ kind:'hose',  name:'Even hose',      zh:'等粗软管', w:8, head:7.5, k:.8 },
  B:{ kind:'taper', name:'Tapered stroke', zh:'渐细笔触', torso:[12.5,8.5], leg:[12.5,3.6], arm:[10.5,3.4], head:7, k:.6 },
  C:{ kind:'line',  name:'One-line body',  zh:'一笔连体', w:6.5, head:6.5, soft:.7 },
};
const FIGKEY = new URLSearchParams(location.search).get('fig') || 'A';   // this style uses A, the even hose; B and C are two other drawings of the same skeleton
let FS = FIGS[FIGKEY] || FIGS.A;
// Joint control point: at k=0 the curve only bends toward the joint, at k=1 it passes exactly through it. In between = a soft bent hose.
function ctrl(A,B,E,k){ const m=[(A[0]+E[0])/2,(A[1]+E[1])/2]; return [B[0]+(B[0]-m[0])*k, B[1]+(B[1]-m[1])*k]; }
const qpt=(A,Q,E,t)=>{const s=1-t;return [s*s*A[0]+2*s*t*Q[0]+t*t*E[0], s*s*A[1]+2*s*t*Q[1]+t*t*E[1]]};
const qder=(A,Q,E,t)=>[2*(1-t)*(Q[0]-A[0])+2*t*(E[0]-Q[0]), 2*(1-t)*(Q[1]-A[1])+2*t*(E[1]-Q[1])];
function headDisc(j,S,fill){ g.beginPath();g.arc(j.Hd[0],j.Hd[1],GEO.headR*S,0,Math.PI*2);g.fillStyle=fill;g.fill(); }
function figure(f,p){
  const S=f.S, j=joints(f,p), col=f.col||C.ink, fill=f.fill||C.paper;
  // line width scales with the square root of figure size (big figures a little thicker, small ones thinner, but never so thin they blur); hand and foot tips at least 3 px
  // f.lws: in the film, line width scales in proportion to figure size (in the fractal ring big and small figures look equally thick); default is the square root
  const sc=(f.lws ?? clamp(Math.sqrt(S/380),.6,1.05))*(f.lwk??1), F0=f.fs||FS, W=(v,m=3)=>Math.max(m*(f.lwk??1)*(f.lws??1),v*sc);
  const fs={...F0, w:W(F0.w||0,5), head:W(F0.head,5)};
  if(F0.kind==='taper'){ fs.torso=[W(F0.torso[0]),W(F0.torso[1])]; fs.leg=[W(F0.leg[0]),W(F0.leg[1])]; fs.arm=[W(F0.arm[0]),W(F0.arm[1])]; }
  g.save(); g.strokeStyle=col; g.fillStyle=col; g.lineCap='round'; g.lineJoin='round';
  const legs=[j.lL,j.lR], arms=[j.aL,j.aR];
  if(fs.kind==='hose'){
    g.lineWidth=fs.w; g.beginPath();
    for(const [K,F] of legs){ const Q=ctrl(j.Hp,K,F,fs.k); g.moveTo(j.Hp[0],j.Hp[1]); g.quadraticCurveTo(Q[0],Q[1],F[0],F[1]); }
    g.moveTo(j.Hp[0],j.Hp[1]); g.quadraticCurveTo(j.Cc[0],j.Cc[1],j.N[0],j.N[1]);
    arms.forEach(([El,Hn],ai)=>{ if(ai===0&&f.noL||ai===1&&f.noR)return; const Q=ctrl(j.Sh,El,Hn,fs.k); g.moveTo(j.Sh[0],j.Sh[1]); g.quadraticCurveTo(Q[0],Q[1],Hn[0],Hn[1]); });
    g.stroke();
    headDisc(j,S,fill); g.lineWidth=fs.head; g.beginPath(); g.arc(j.Hd[0],j.Hd[1],GEO.headR*S,0,Math.PI*2); g.stroke();
  } else if(fs.kind==='taper'){
    for(const [K,F] of legs) taper(j.Hp,ctrl(j.Hp,K,F,fs.k),F,fs.leg[0],fs.leg[1]);
    taper(j.Hp,j.Cc,j.N,fs.torso[0],fs.torso[1]);
    for(const [El,Hn] of arms) taper(j.Sh,ctrl(j.Sh,El,Hn,fs.k),Hn,fs.arm[0],fs.arm[1]);
    headDisc(j,S,fill); g.lineWidth=fs.head; g.beginPath(); g.arc(j.Hd[0],j.Hd[1],GEO.headR*S,0,Math.PI*2); g.stroke();
  } else {
    g.lineWidth=fs.w; g.beginPath();
    spline([j.lL[1],j.lL[0],j.Hp,j.lR[0],j.lR[1]],fs.soft);                 // both legs in one stroke
    spline([j.aL[1],j.aL[0],j.Sh,j.aR[0],j.aR[1]],fs.soft);                 // both arms in one stroke
    g.stroke();
    headDisc(j,S,fill);
    // the spine is drawn up from the hip and, without lifting the pen, goes once round the head
    const a0=Math.atan2(j.N[1]-j.Hd[1],j.N[0]-j.Hd[0]);
    g.lineWidth=fs.head; g.beginPath(); g.moveTo(j.Hp[0],j.Hp[1]); g.quadraticCurveTo(j.Cc[0],j.Cc[1],j.N[0],j.N[1]);
    g.arc(j.Hd[0],j.Hd[1],GEO.headR*S,a0,a0+Math.PI*2); g.stroke();
  }
  g.restore();
  return j;
}

// ---------------- Spring drive ----------------
// One damped spring per parameter (ω angular frequency, ζ damping ratio). Upper arm fast, forearm slow, head loosest → natural follow-through and overlap.
const SPR = { hx:[20,.8], hy:[24,.62], lean:[13,.6], bend:[12,.55], head:[9,.42],
  la:[13,.58], ra:[13,.58], lb:[9.5,.46], rb:[9.5,.46], lfx:[30,.85], lfy:[30,.85], rfx:[30,.85], rfy:[30,.85] };
const HEADSPR=[16,.38];               // secondary follow of the head in world space (the body stops, the head arrives a little later)
function simulate(n,target,t0,t1){
  const dt=1/1200, every=5, out=[];   // record at 240 Hz
  const st=[];for(let i=0;i<n;i++){const p=target(i,t0),v={};for(const k in p)v[k]=0;
    st.push({p:{...p},v,hp:null,hv:[0,0]});}
  const rigidHead=p=>{const hy=GEO.hipH-p.hy,s=GEO.spine,r=GEO.headR;
    return [p.hx+Math.sin(p.lean)*s+Math.sin(p.lean+p.head)*r, hy+Math.cos(p.lean)*s+Math.cos(p.lean+p.head)*r]};
  let step=0;
  for(let t=t0;t<=t1+1e-9;t+=dt,step++){
    if(step%every===0) out.push(st.map(s=>({...s.p})));
    for(let i=0;i<n;i++){
      const s=st[i],tg=target(i,t);
      for(const k in SPR){const [w,z]=SPR[k];const a=w*w*(tg[k]-s.p[k])-2*z*w*s.v[k];s.v[k]+=a*dt;s.p[k]+=s.v[k]*dt;}
      const R=rigidHead(s.p);
      if(!s.hp)s.hp=[...R];
      const [w,z]=HEADSPR;
      for(let q=0;q<2;q++){const a=w*w*(R[q]-s.hp[q])-2*z*w*s.hv[q];s.hv[q]+=a*dt;s.hp[q]+=s.hv[q]*dt;}
      s.p.hdx=clamp(s.hp[0]-R[0],-.03,.03); s.p.hdy=clamp(s.hp[1]-R[1],-.03,.03);
    }
  }
  return {t0,rate:240,frames:out,at(t){const f=(t-this.t0)*this.rate,i=clamp(Math.floor(f),0,this.frames.length-2),u=clamp(f-i);
    const A=this.frames[i],B=this.frames[i+1];return A.map((p,k)=>{const q={};for(const key of KEYS)q[key]=lerp(p[key],B[k][key],u);return q})}};
}

// Target poses of the signature move: figure s changes first (anticipation crouch → jump with arms up → lands with one hand left on top of the head), the wave spreads to both sides, and finally the whole row turns toward it.
function popS(tau,w=17,z=.45){ if(tau<=0)return 0; const wd=w*Math.sqrt(1-z*z); return 1-Math.exp(-z*w*tau)*(Math.cos(wd*tau)+z*w/wd*Math.sin(wd*tau)); }
const L2D=(a,b,t)=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t)];
