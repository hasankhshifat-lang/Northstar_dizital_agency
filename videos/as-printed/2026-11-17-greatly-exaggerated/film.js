// As Printed — Archive Light Table template engine. One page renders any episode, long (16:9) or Short (9:16).
//   index.html?film=long|short[&t0=&t1=][&nosubs=1]
// Reads episode.json (items, shots), assets/tex/items.json (textures, table layout) and out/<film>/timeline.json
// (shot times and subtitle cues, written by tools/export.mjs from the real voice durations).
// Picture: WebGL2 in passes (table → FBO, the inside of the loupe → FBO, composite with the lens), marks and text on a
// 2D canvas. Engine derived from the Lemo-Opuscar Archive Light Table demo; adapted for data-driven episodes.
const Q = new URLSearchParams(location.search);
const FILM = Q.get('film') || 'long', NOSUBS = Q.get('nosubs') === '1';
const T0 = +(Q.get('t0') || 0);
const W = window.innerWidth || 1920, H = window.innerHeight || 1080, CX = W / 2, CY = H / 2, VERT = H > W;
const ORANGE = '#ff5a1f', INK = '#15171a', LIGHT = 'rgba(250,250,247,0.97)';

// ---------------- helpers ----------------
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const ss = x => x * x * (3 - 2 * x);
const eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const eo = x => 1 - Math.pow(1 - x, 3);
const lerp = (a, b, x) => a + (b - a) * x;
const lerp2 = (a, b, x) => [lerp(a[0], b[0], x), lerp(a[1], b[1], x)];
const rot = (v, a) => { const c = Math.cos(a), s = Math.sin(a); return [c * v[0] - s * v[1], s * v[0] + c * v[1]]; };
function track(keys) {                               // monotone cubic (Fritsch–Carlson) over [t, v]
  keys = keys.filter((k, i) => i === 0 || k[0] > keys[i - 1][0] + 1e-4);
  const n = keys.length, d = [], m = [];
  if (n === 1) return () => keys[0][1];
  for (let i = 0; i < n - 1; i++) d.push((keys[i + 1][1] - keys[i][1]) / (keys[i + 1][0] - keys[i][0]));
  for (let i = 0; i < n; i++) m.push(i === 0 || i === n - 1 ? 0 : (d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2));
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
    if (s > 9) { const k = 3 / Math.sqrt(s); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; }
  }
  return t => {
    if (t <= keys[0][0]) return keys[0][1];
    if (t >= keys[n - 1][0]) return keys[n - 1][1];
    let i = 0; while (t > keys[i + 1][0]) i++;
    const h = keys[i + 1][0] - keys[i][0], u = (t - keys[i][0]) / h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * keys[i][1] + (u3 - 2 * u2 + u) * h * m[i] + (-2 * u3 + 3 * u2) * keys[i + 1][1] + (u3 - u2) * h * m[i + 1];
  };
}
const track2 = keys => { const x = track(keys.map(k => [k[0], k[1][0]])), y = track(keys.map(k => [k[0], k[1][1]])); return t => [x(t), y(t)]; };
const fmtNum = (v, like) => /,/.test(like) ? Math.round(v).toLocaleString('en-US') : String(Math.round(v));

// ---------------- data ----------------
let EP, TEX, TL, IT = {}, SHOTS = [], CUES = [], DUR = 10, TABLE = { lo: [-5000, -5000], hi: [5000, 5000], c: [0, 0] };
const toW = (it, p) => { const o = rot([(p[0] - it.size[0] / 2) * it.k, (p[1] - it.size[1] / 2) * it.k], it.r); return [it.c[0] + o[0], it.c[1] + o[1]]; };
const src2tex = (it, p) => [(p[0] - it.crop[0]) * it.s, (p[1] - it.crop[1]) * it.s];
const boxTex = (it, b) => [...src2tex(it, [b[0], b[1]]), ...src2tex(it, [b[2], b[3]])];
const mid = b => [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2];

// ---------------- camera, dives, per-shot state ----------------
const LENS_RW = 900, MAG = 2.5;
const zApp = () => 0.28 * Math.min(W, H) / LENS_RW;                 // loupe about a quarter of the short side
const zFull = () => 1.06 * Math.hypot(W, H) / 2 / LENS_RW;          // the lens fills the frame
let camAt, DIVES = [];
function fitZoom(it, f = 0.82) { return f * Math.min(W / (it.size[0] * it.k), H / (it.size[1] * it.k)); }
function buildCamera() {
  const K = [];
  const allW = [TABLE.hi[0] - TABLE.lo[0], TABLE.hi[1] - TABLE.lo[1]];
  const zWide = 0.92 * Math.min(W / allW[0], H / allW[1]);
  let last = { c: TABLE.c, z: zWide * 1.6, r: 0 };
  const push = (t, c, z, r = 0) => { K.push([t, c, Math.log(z), r]); last = { c, z, r }; };
  push(0, TABLE.c, zWide * 1.4, -1.2);
  SHOTS.forEach((s, i) => {
    const it = s.item && IT[s.item], d = s.t1 - s.t0, rr = (i % 2 ? 1 : -1) * 1.2;
    s.focusW = it ? toW(it, s.focus) : TABLE.c;
    if (s.type === 'read' || s.type === 'photo') {
      const lw = s.focusW, za = zApp(), zf = zFull();
      const tDrop = s.t0 + 0.9, tDive = s.t0 + 1.4, tIn = tDive + 1.2, tRise = s.t1 - 1.3, tLift = s.t1 - 0.55;
      push(Math.max(s.t0 + 0.05, tDrop - 0.9), [lw[0] + 160 / za * 0.3, lw[1] + 120 / za * 0.3], za * 0.92, rr);
      push(tDrop, [lw[0] + 30 / za, lw[1] + 20 / za], za, rr * 0.5);
      push(tDive, lw, za * 1.06, rr * 0.4);
      push(tIn, lw, zf, rr * 0.4);
      push(tRise, lw, zf, rr * 0.4);
      push(s.t1 - 0.05, [lw[0] - 200 / za, lw[1] - 120 / za], za * 0.72, rr * 0.3);
      // inside the lens: scale S (px per world unit) and centre, as tracks from the loupe's own view
      const phys = t0 => camAt0(t0) * MAG;
      let Sin, cin;
      if (s.type === 'read') {
        const bw = Math.max(...s.boxesT.map(b => (b[2] - b[0]) * it.k));
        Sin = clamp(0.86 * W / bw, 0.06, 1.7 / it.k);   // 0.06: wide headlines still fit a 9:16 frame
        cin = s.boxesT.map(b => toW(it, mid(b)));
      } else {
        const pw = it.size[0] * it.k, ph = it.size[1] * it.k;
        Sin = Math.min(1.08 * Math.max(W / pw, H / ph) * (s.zoom || 1), 1.7 / it.k);
        cin = [toW(it, s.focus)];
        const half = [W / 2 / Sin, H / 2 / Sin];                    // keep the frame inside the plate
        const cc = rot([cin[0][0] - it.c[0], cin[0][1] - it.c[1]], -it.r);
        cc[0] = clamp(cc[0], -pw / 2 + half[0] * 1.02, pw / 2 - half[0] * 1.02); cc[1] = clamp(cc[1], -ph / 2 + half[1] * 1.02, ph / 2 - half[1] * 1.02);
        const back = rot(cc, it.r); cin = [[it.c[0] + back[0], it.c[1] + back[1]]];
      }
      const n = cin.length, span = Math.max(0.5, tRise - tIn - 0.6);
      const kS = [[tDive, null], [tIn, Sin]], kC = [[tIn, cin[0]]];
      s.lineT = [];
      for (let j = 0; j < n; j++) { const tj = tIn + 0.2 + j * span / Math.max(1, n); s.lineT.push(tj); if (j) { kC.push([tj, cin[j]]); kS.push([tj, Sin]); } }
      kS.push([tRise, Sin * 1.04]); kC.push([tRise, cin[n - 1]]);
      DIVES.push({ s, lw, tDrop, tDive, tIn, tRise, tLift, kS, kC, it });
    } else if (s.type === 'table') {
      const z = (s.boxesT && s.boxesT.length) ? Math.min(0.86 * W / (Math.max(...s.boxesT.map(b => (b[2] - b[0]))) * it.k), fitZoom(it) * 3) : fitZoom(it) * (s.zoom || 1);
      const c = s.focusW;
      push(s.t0 + Math.min(1.4, d * 0.35), c, z, rr * 0.6);
      push(s.t1 - 0.05, [c[0] + 0.03 * W / z, c[1]], z * 1.03, rr * 0.7);
    } else if (s.type === 'title') {
      const z = it ? fitZoom(it, 0.9) : zWide * 2;
      push(Math.min(s.t0 + 1.2, s.t1), s.focusW, z * 0.9, -0.8);
      push(s.t1 - 0.05, s.focusW, z, 0.4);
    } else if (s.type === 'chapter' || s.type === 'compare') {
      const c = it ? s.focusW : [lerp(last.c[0], TABLE.c[0], 0.4), lerp(last.c[1], TABLE.c[1], 0.4)];
      const z = it ? fitZoom(it, 1.1) : Math.max(zWide * 2.2, last.z * 0.45);
      push(s.t0 + Math.min(1.4, d * 0.4), c, z, rr * 0.5);
      push(s.t1 - 0.05, [c[0] + 0.04 * W / z, c[1] + 0.02 * H / z], z * 1.05, rr * 0.4);
    } else if (s.type === 'end') {
      push(s.t0 + Math.min(2.2, d * 0.4), TABLE.c, zWide, 0);
      push(s.t1, [TABLE.c[0] + 0.03 * W / zWide, TABLE.c[1]], zWide * 0.97, 0);
    }
  });
  const c2 = track2(K.map(k => [k[0], k[1]])), lz = track(K.map(k => [k[0], k[2]])), rt = track(K.map(k => [k[0], k[3]]));
  camAt = t => ({ c: c2(t), z: Math.exp(lz(t)), th: rt(t) * Math.PI / 180 });
  // finish the dive tracks now that the camera exists
  for (const dv of DIVES) {
    const pS = t => camAt(t).z * MAG;
    dv.S = track([[dv.tDrop, pS(dv.tDrop)], [dv.tDive, pS(dv.tDive)], ...dv.kS.slice(1), [dv.tLift, pS(dv.tLift)]]);
    dv.C = track2([[dv.tDrop, dv.lw], [dv.tDive, dv.lw], ...dv.kC, [dv.tLift, dv.lw]]);
  }
}
function camAt0(t) { return zApp(); }
function w2s(w, cam) { const d = rot([(w[0] - cam.c[0]) * cam.z, (w[1] - cam.c[1]) * cam.z], cam.th); return [CX + d[0], CY + d[1]]; }
function shotAt(t) { let s = SHOTS[0]; for (const x of SHOTS) if (t >= x.t0) s = x; return s; }

function state(t) {
  const cam = camAt(t);
  let dv = null; for (const d of DIVES) if (t >= d.tDrop - 0.4 && t <= d.tLift + 0.4) dv = d;
  const st = { cam, t, on: 0, A: 0, lift: 1, ls: [0, 0], R: 0, S: 1, ic: [0, 0], k: 0.16, enter: 0, sh: [0, 0], dz: 0, dev: 0, dive: dv };
  if (dv) {
    const inn = seg(t, dv.tDrop - 0.4, dv.tDrop), out = seg(t, dv.tLift, dv.tLift + 0.4);
    st.on = 1; st.A = eo(inn) * (1 - ss(out)); st.lift = 1 + 0.35 * (1 - eo(inn)) + 0.35 * eo(out);
    st.ls = w2s(dv.lw, cam); st.R = LENS_RW * cam.z * st.lift;
    const tt = clamp(t, dv.tDrop, dv.tLift); st.S = dv.S(tt); st.ic = dv.C(tt);
    if (t < dv.tDrop || t > dv.tLift) st.S = cam.z * MAG * st.lift;
    st.k = 0.16 * (1 - ss(seg(t, dv.tDive + 0.3, dv.tIn - 0.1))) + 0.16 * ss(seg(t, dv.tRise + 0.2, dv.tLift));
    if (dv.s.type === 'photo') {
      st.enter = ss(seg(t, dv.tDive + 0.5, dv.tIn)) * (1 - ss(seg(t, dv.tRise, dv.tRise + 0.8)));
      const p = ss(seg(t, dv.tDive + 0.6, dv.tRise + 0.4)), dir = dv.s.drift || [1, -0.4];
      st.sh = [140 * dir[0] * p, 140 * dir[1] * p]; st.dz = 0.42 * p;
      if (dv.it.kind === 'negative') st.dev = t < dv.tDrop + 0.4 ? 0 : (t < dv.tDrop + 1.25 ? 1.25 * eio(seg(t, dv.tDrop + 0.4, dv.tDrop + 1.2)) : 1.3);
      else st.dev = 1.3;
    }
  }
  return st;
}
const near = (it, p) => clamp((p[1] - (it.horizon ?? 0)) / (it.size[1] - (it.horizon ?? 0)), 0, 1);   // p in texture px
function int2s(w, n, st, nf) {
  const dn = n - nf, sc = 1 + st.dz * st.enter * dn;
  const q = [((w[0] - st.ic[0]) * sc + st.sh[0] * st.enter * dn) * st.S, ((w[1] - st.ic[1]) * sc + st.sh[1] * st.enter * dn) * st.S];
  const r = rot(q, st.cam.th); return [st.ls[0] + r[0], st.ls[1] + r[1]];
}

// ---------------- WebGL ----------------
const cv = document.getElementById('gl'); cv.width = W; cv.height = H;
const ovc = document.getElementById('ov'); ovc.width = W; ovc.height = H;
const gl = cv.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false });
const ov = ovc.getContext('2d');
const COMMON = `
float h21(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }
vec2 rot(vec2 v, float a){ float c=cos(a), s=sin(a); return vec2(c*v.x-s*v.y, s*v.x+c*v.y); }
uniform vec2 uLo, uHi, uTc; uniform float uLight;
vec3 lightTable(vec2 w){
  vec2 d = min(w - uLo, uHi - w); float e = min(d.x, d.y);
  vec2 cd = (w - uTc) / max(uHi - uLo, vec2(1.));
  float L = (1. - 0.5*dot(cd, cd)) + (vn(w*0.015) - 0.5)*0.010 + (vn(w*0.0021) - 0.5)*0.012;
  vec3 lit = vec3(0.968, 0.976, 0.986)*L*uLight + vec3(0.035, 0.037, 0.04)*(1. - uLight);
  vec3 frame = vec3(0.33, 0.34, 0.35) + 0.05*vn(vec2(w.x*0.002, w.y*0.4)) - 0.14*smoothstep(0., 400., e + 400.);
  vec3 desk = vec3(0.055, 0.058, 0.062) + 0.012*vn(w*0.003);
  return e > 0. ? lit : (e > -400. ? frame : desk);
}
vec3 negative(vec3 L, float pos, float dev, vec2 lv){
  float T = 0.035 + 0.90*pow(clamp(1. - pos, 0., 1.), 1.25);
  vec3 neg = L*T*vec3(0.98, 0.93, 0.84);
  float pc = clamp((pos - lv.x)/(lv.y - lv.x), 0., 1.); pc = pow(pc, 1.12); pc = pc*pc*(3. - 2.*pc)*0.6 + pc*0.4;
  vec3 posc = mix(vec3(0.045, 0.040, 0.036), vec3(0.99, 0.982, 0.962), pc) * (0.25 + 0.75*uLight);
  return mix(neg, posc, dev);
}
vec3 printc(vec3 L, float pos){ return L*vec3(1.0, 0.975, 0.93)*(0.05 + 0.93*pos); }
vec3 paperc(vec3 L, float tex, float lit, float dim, vec2 uv){
  float edge = min(min(uv.x, 1. - uv.x), min(uv.y, 1. - uv.y));
  vec3 tone = vec3(1.0, 0.972, 0.915) * (0.93 + 0.07*smoothstep(0., 0.02, edge));
  vec3 base = L * tone * (0.10 + 0.86*tex) + vec3(0.02)*(1. - uLight);
  vec3 ink = L * tone * (0.04 + 0.96*pow(tex, 1.7)) * 1.12;
  return mix(base * mix(1., 0.62, dim), ink, lit);
}
float band(vec2 px, vec4 b, float p, float fe){
  float ex = smoothstep(b.x - 30., b.x + 10., px.x) * (1. - smoothstep(mix(b.x, b.z, p) - 10., mix(b.x, b.z, p) + 40., px.x));
  float ey = smoothstep(b.y - fe, b.y + fe*0.33, px.y) * (1. - smoothstep(b.w - fe*0.33, b.w + fe, px.y));
  return ex * ey * step(0.001, p);
}`;
const VS_FULL = `#version 300 es
in vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }`;
// background (the table) for a camera
const FS_BG = `#version 300 es
precision highp float;
${COMMON}
uniform vec2 uCam, uRes; uniform float uZ, uRot, uDust; out vec4 o;
float speck(vec2 p, float cell, float thr){ vec2 g = floor(p/cell), f = p/cell - g; if (h21(g) < thr) return 0.;
  vec2 c = vec2(.2) + .6*vec2(h21(g+3.1), h21(g+7.7)); float r = .05 + .12*h21(g+1.3); return smoothstep(r, r*.35, length(f - c)); }
void main(){ vec2 s = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y); vec2 w = uCam + rot(s - uRes*0.5, -uRot) / uZ;
  vec3 col = lightTable(w); float dd = speck(w, 70., 0.955)*0.5 + speck(w + 31., 19., 0.975)*0.35; col *= 1. - dd*0.5*uDust;
  o = vec4(col, 1.); }`;
// one archive item (a textured quad) for a camera
const VS_ITEM = `#version 300 es
in vec2 p; uniform vec2 uC, uSize, uCam, uRes; uniform float uRotI, uZ, uRot; out vec2 vUV; out vec2 vW;
vec2 rot(vec2 v, float a){ float c=cos(a), s=sin(a); return vec2(c*v.x-s*v.y, s*v.x+c*v.y); }
void main(){ vUV = p; vec2 w = uC + rot((p - 0.5)*uSize, uRotI); vW = w;
  vec2 sc = rot((w - uCam)*uZ, uRot) + uRes*0.5; gl_Position = vec4(sc.x/uRes.x*2. - 1., 1. - sc.y/uRes.y*2., 0., 1.); }`;
const FS_ITEM = `#version 300 es
precision highp float;
${COMMON}
uniform sampler2D tI; uniform vec2 uRes, uLensC; uniform float uKind, uDim, uDevOn, uDev, uLensR, uZ, uK2;
uniform vec4 uB[6]; uniform float uBP[6]; uniform vec2 uLv;
in vec2 vUV; in vec2 vW; out vec4 o;
void main(){
  vec2 sz = vec2(textureSize(tI, 0)); float fp = 1./(uZ*uK2);
  vec4 tx = textureGrad(tI, vUV, vec2(fp/sz.x, 0.), vec2(0., fp/sz.y));
  float pos = tx.r, m = tx.g; vec3 L = lightTable(vW); vec3 col;
  if (uKind < 0.5){ vec2 px = vUV*sz; float lit = 0.; for (int i=0;i<6;i++) lit = max(lit, band(px, uB[i], uBP[i], 12.)); col = paperc(L, pos, lit, uDim, vUV); }
  else if (uKind < 1.5){ float dev = 0.; if (uDevOn > 0.5){ vec2 s = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y); float rho = length(s - uLensC)/max(uLensR,1.);
      dev = uDev >= 1.25 ? 1. : 1. - smoothstep(uDev - 0.14, uDev, rho); } col = mix(L, negative(L, pos, dev, uLv), m); }
  else { col = mix(L, printc(L, pos), m); }
  o = vec4(col, 1.); }`;
// the active photograph as a space with depth (inside the lens)
const FS_PHOTO = `#version 300 es
precision highp float;
${COMMON}
uniform sampler2D tI; uniform vec2 uRes, uIC, uSh, uSizeT, uCi; uniform float uS, uRot, uRotI, uK2, uEnter, uDz, uHz, uNf, uKind, uT, uWater; uniform vec2 uLv;
out vec4 o;
vec2 itemUV(vec2 w){ return (rot(w - uCi, -uRotI)/uK2 + uSizeT*0.5)/uSizeT; }
float nearP(vec2 w){ vec2 px = itemUV(w)*uSizeT; return clamp((px.y - uHz)/(uSizeT.y - uHz), 0., 1.); }
void main(){
  vec2 s = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y); vec2 pf = uIC + rot(s - uRes*0.5, -uRot) / uS;
  vec2 d = pf - uIC, p = pf;
  for (int i=0;i<4;i++){ float n = nearP(p) - uNf; p = uIC + (d - uSh*uEnter*n) / (1. + uDz*uEnter*n); }
  vec2 uv = itemUV(p); if (uv.x < 0. || uv.y < 0. || uv.x > 1. || uv.y > 1.) discard;
  float fp = 1./(uS*uK2); vec4 tx = textureGrad(tI, uv, vec2(fp/uSizeT.x, 0.), vec2(0., fp/uSizeT.y));
  float pos = tx.r;
  if (uWater > 0.5 && uEnter > 0.){ vec2 px = uv*uSizeT; pos += uEnter*(0.045*(vn(px*vec2(0.0035, 0.011) + vec2(uT*0.22, -uT*0.35)) - 0.5) + 0.02*(vn(px*vec2(0.012, 0.03) + vec2(-uT*0.5, uT*0.2)) - 0.5)); }
  vec3 L = lightTable(p);
  vec3 col = uKind < 1.5 ? negative(L, pos, 1., uLv) : printc(L, pos);
  o = vec4(mix(L, col, tx.g), 1.); }`;
// composite: the table, and the loupe with its distortion, ring, skirt and shadow
const FS_COMP = `#version 300 es
precision highp float;
uniform sampler2D tTable, tIn; uniform vec2 uRes, uLensC; uniform float uLensR, uLensOn, uLensA, uLift, uK, uEnter, uDev, uT, uDim, uLight, uRot;
out vec4 o;
float h21(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }
vec3 tab(vec2 s){ return texture(tTable, vec2(s.x, uRes.y - s.y)/uRes).rgb; }
vec3 inn(vec2 s){ return texture(tIn, vec2(s.x, uRes.y - s.y)/uRes).rgb; }
void main(){
  vec2 s = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec3 table = tab(s), col = table;
  vec2 dl = s - uLensC; float r = length(dl), rho = r / max(uLensR, 1.);
  bool inLens = false;
  if (uLensOn > .5){
    vec2 sd = s - (uLensC + vec2(26., 34.)*(uLift - 1.)*uLensR/120.); float sr = length(sd)/uLensR;
    vec3 under = table * (1. - 0.22*(uLift - 1.)/0.35*uLensA*smoothstep(1.55, 1.05, sr));
    vec3 lc;
    if (rho < 1.0){
      inLens = true; vec3 c3;
      for (int i=0;i<3;i++){ float k = uK*(1. + float(i-1)*0.10); vec2 q = dl / (1. + k*rho*rho) * (1. - float(i-1)*0.004*uK/0.16); c3[i] = inn(uRes*0.5 + q)[i]; }
      lc = c3;
      float front = (uDev > 0.01 && uDev < 1.15) ? exp(-pow((rho - uDev)/0.022, 2.)) : 0.;
      lc += vec3(1.0, 0.62, 0.36)*0.22*front*smoothstep(0.05, 0.35, uDev);
      lc *= 1. - 0.30*smoothstep(0.78, 1.0, rho)*(1. - uEnter);
      vec2 hp = dl/uLensR - vec2(-0.38, -0.46); lc += vec3(0.06)*exp(-dot(hp,hp)*7.)*(1. - uEnter);
      vec2 hp2 = dl/uLensR - vec2(0.42, 0.50); lc += vec3(0.025)*exp(-dot(hp2,hp2)*14.)*(1. - uEnter);
    } else if (rho < 1.065){
      float u = (rho - 1.0)/0.065; vec2 nd = dl / max(r, 1.);
      float lit = max(0., dot(nd, normalize(vec2(-0.55, -0.83))));
      float bev = exp(-pow((u - 0.18)/0.09, 2.))*0.9 + exp(-pow((u - 0.85)/0.07, 2.))*0.5;
      lc = vec3(0.040, 0.042, 0.046) + vec3(0.62, 0.64, 0.66)*pow(lit, 5.)*bev + 0.05*bev + vn(vec2(atan(dl.y, dl.x)*180., u*4.))*0.02;
    } else if (rho < 1.30){
      float u = (rho - 1.065)/0.235;
      lc = tab(uLensC + dl*(0.955 + 0.045*u))*0.93 + 0.035*uLight;
      lc *= 1. - 0.45*exp(-pow(u/0.05, 2.)); lc += vec3(0.20, 0.21, 0.22)*exp(-pow((u - 0.93)/0.035, 2.))*uLight;
      lc *= 1. - 0.25*exp(-pow((u - 1.0)/0.015, 2.));
    } else lc = under * (1. - (0.07*exp(-pow((rho - 1.31)/0.05, 2.)) + 0.03*exp(-pow((rho - 1.3)/0.25, 2.)))*(2. - uLift));
    col = mix(under, lc, uLensA);
  }
  col *= 1. - uDim * (inLens ? 0. : 1.);
  vec2 sv = (s - uRes*0.5) / (uRes*vec2(0.72, 0.65)); col *= 1. - 0.10*dot(sv, sv);
  col += (h21(s + fract(uT*24.*0.6180339)*vec2(311.7, 217.3)) - 0.5)*(0.018 + 0.016*uEnter);
  o = vec4(clamp(col, 0., 1.), 1.); }`;
function shd(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
function prog(vs, fs) { const p = gl.createProgram(); gl.attachShader(p, shd(gl.VERTEX_SHADER, vs)); gl.attachShader(p, shd(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); const u = {}; p.U = n => (u[n] ??= gl.getUniformLocation(p, n)); return p; }
const P_BG = prog(VS_FULL, FS_BG), P_ITEM = prog(VS_ITEM, FS_ITEM), P_PHOTO = prog(VS_FULL, FS_PHOTO), P_COMP = prog(VS_FULL, FS_COMP);
const triBuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, triBuf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
const quadBuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), gl.STATIC_DRAW);
function bindGeom(p, buf) { gl.bindBuffer(gl.ARRAY_BUFFER, buf); const a = gl.getAttribLocation(p, 'p'); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0); }
function fbo() { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0); return { f, t }; }
const F_TABLE = fbo(), F_IN = fbo();
function texRG(img) { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
  gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG8, gl.RG, gl.UNSIGNED_BYTE, img); gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const ext = gl.getExtension('EXT_texture_filter_anisotropic'); if (ext) gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, 8); return t; }
function common(p, light) { gl.uniform2f(p.U('uLo'), ...TABLE.lo); gl.uniform2f(p.U('uHi'), ...TABLE.hi); gl.uniform2f(p.U('uTc'), ...TABLE.c); gl.uniform1f(p.U('uLight'), light); gl.uniform2f(p.U('uRes'), W, H); }

// band progress per item at time t (lines lit by read and table shots)
function bandsFor(id, t) {
  const B = [], P = [];
  for (const s of SHOTS) {
    if (s.item !== id || !s.boxesT || !(s.type === 'read' || s.type === 'table')) continue;
    if (t < s.t0 - 0.1 || t > s.t1 + 0.6) continue;
    s.boxesT.forEach((b, j) => { const tj = s.type === 'read' ? s.lineT[j] : s.t0 + 1.2 + j * 0.9; B.push(b); P.push(eio(seg(t, tj, tj + 0.9)) * (1 - seg(t, s.t1, s.t1 + 0.6))); });
  }
  while (B.length < 6) { B.push([0, 0, 0, 0]); P.push(0); }
  return { B: B.slice(0, 6), P: P.slice(0, 6) };
}
function dimFor(id, t) { const s = shotAt(t); if (s.item !== id || !s.boxesT) return 0; return ss(seg(t, s.t0 + 0.4, s.t0 + 1.2)) * (1 - ss(seg(t, s.t1 - 0.6, s.t1))) * (s.type === 'read' ? 1 : 0.8); }

function drawScene(target, cam, t, light, lensInfo) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, target.f); gl.viewport(0, 0, W, H);
  gl.useProgram(P_BG); bindGeom(P_BG, triBuf); common(P_BG, light);
  gl.uniform2f(P_BG.U('uCam'), ...cam.c); gl.uniform1f(P_BG.U('uZ'), cam.z); gl.uniform1f(P_BG.U('uRot'), cam.th); gl.uniform1f(P_BG.U('uDust'), lensInfo ? 0.4 : 1);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  gl.useProgram(P_ITEM); bindGeom(P_ITEM, quadBuf); common(P_ITEM, light);
  gl.uniform2f(P_ITEM.U('uCam'), ...cam.c); gl.uniform1f(P_ITEM.U('uZ'), cam.z); gl.uniform1f(P_ITEM.U('uRot'), cam.th);
  for (const it of ITEMS) {
    const { B, P } = bandsFor(it.id, t);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, it.tex); gl.uniform1i(P_ITEM.U('tI'), 0);
    gl.uniform2f(P_ITEM.U('uC'), ...it.c); gl.uniform2f(P_ITEM.U('uSize'), it.size[0] * it.k, it.size[1] * it.k); gl.uniform1f(P_ITEM.U('uRotI'), it.r);
    gl.uniform1f(P_ITEM.U('uK2'), it.k); gl.uniform1f(P_ITEM.U('uKind'), it.kindN); gl.uniform1f(P_ITEM.U('uDim'), dimFor(it.id, t));
    gl.uniform4fv(P_ITEM.U('uB'), B.flat()); gl.uniform1fv(P_ITEM.U('uBP'), P); gl.uniform2f(P_ITEM.U('uLv'), ...(it.levels || [0.04, 0.95]));
    const dv = lensInfo && lensInfo.dive && lensInfo.dive.it === it;
    gl.uniform1f(P_ITEM.U('uDevOn'), dv ? 1 : 0); gl.uniform1f(P_ITEM.U('uDev'), lensInfo ? lensInfo.dev : 0);
    gl.uniform2f(P_ITEM.U('uLensC'), CX, CY); gl.uniform1f(P_ITEM.U('uLensR'), lensInfo ? lensInfo.Rin : 1);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}
function drawPhoto(target, st, t, light) {
  const it = st.dive.it;
  gl.bindFramebuffer(gl.FRAMEBUFFER, target.f); gl.viewport(0, 0, W, H);
  gl.useProgram(P_PHOTO); bindGeom(P_PHOTO, triBuf); common(P_PHOTO, light);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, it.tex); gl.uniform1i(P_PHOTO.U('tI'), 0);
  gl.uniform2f(P_PHOTO.U('uIC'), ...st.ic); gl.uniform1f(P_PHOTO.U('uS'), st.S); gl.uniform1f(P_PHOTO.U('uRot'), st.cam.th);
  gl.uniform2f(P_PHOTO.U('uCi'), ...it.c); gl.uniform1f(P_PHOTO.U('uRotI'), it.r); gl.uniform1f(P_PHOTO.U('uK2'), it.k); gl.uniform2f(P_PHOTO.U('uSizeT'), ...it.size);
  gl.uniform2f(P_PHOTO.U('uSh'), ...st.sh); gl.uniform1f(P_PHOTO.U('uEnter'), st.enter); gl.uniform1f(P_PHOTO.U('uDz'), st.dz);
  gl.uniform1f(P_PHOTO.U('uHz'), it.horizon ?? 0); gl.uniform1f(P_PHOTO.U('uNf'), st.dive.s.nf ?? 0.5); gl.uniform1f(P_PHOTO.U('uKind'), it.kindN);
  gl.uniform1f(P_PHOTO.U('uT'), t); gl.uniform1f(P_PHOTO.U('uWater'), it.water ? 1 : 0); gl.uniform2f(P_PHOTO.U('uLv'), ...(it.levels || [0.04, 0.95]));
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}
function lightAt(t) { return t < 0.17 ? 0 : t < 0.3 ? 0.55 : t < 0.42 ? 0.08 : t < 0.55 ? 0.8 : t < 0.7 ? 0.45 : 1; }
function dimAt(t) { const s = shotAt(t); if (s.type === 'compare') return 0.45 * ss(seg(t, s.t0, s.t0 + 0.5)) * (1 - ss(seg(t, s.t1 - 0.4, s.t1))); if (s.type === 'end') return 0.35 * ss(seg(t, s.t0 + 1.2, s.t0 + 2.2)); if (s.type === 'chapter') return 0.25 * ss(seg(t, s.t0, s.t0 + 0.5)) * (1 - ss(seg(t, s.t1 - 0.5, s.t1))); return 0; }
function frame(t) {
  const st = state(t), light = FILM === 'long' || FILM === 'short' ? lightAt(t) : 1;
  drawScene(F_TABLE, st.cam, t, light, null);
  if (st.on) {
    drawScene(F_IN, { c: st.ic, z: st.S, th: st.cam.th }, t, light, { dive: st.dive, dev: st.dev, Rin: st.R / (st.cam.z * MAG) * st.S });
    if (st.dive.s.type === 'photo') drawPhoto(F_IN, st, t, light);
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, W, H);
  gl.useProgram(P_COMP); bindGeom(P_COMP, triBuf);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, F_TABLE.t); gl.uniform1i(P_COMP.U('tTable'), 0);
  gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, F_IN.t); gl.uniform1i(P_COMP.U('tIn'), 1);
  gl.uniform2f(P_COMP.U('uRes'), W, H); gl.uniform2f(P_COMP.U('uLensC'), ...st.ls); gl.uniform1f(P_COMP.U('uLensR'), st.R);
  gl.uniform1f(P_COMP.U('uLensOn'), st.on); gl.uniform1f(P_COMP.U('uLensA'), st.A); gl.uniform1f(P_COMP.U('uLift'), st.lift); gl.uniform1f(P_COMP.U('uK'), st.k);
  gl.uniform1f(P_COMP.U('uEnter'), st.enter); gl.uniform1f(P_COMP.U('uDev'), st.dev); gl.uniform1f(P_COMP.U('uT'), t); gl.uniform1f(P_COMP.U('uDim'), dimAt(t)); gl.uniform1f(P_COMP.U('uLight'), light);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  return st;
}
// the inside FBO is drawn centred: the composite samples it around the frame centre, so the lens centre maps to CX, CY.

// ---------------- overlay ----------------
let TXT = [];
function text(c, id, s, x, y, font, color, opt = {}) {
  c.font = font; c.fillStyle = color; c.textBaseline = 'alphabetic'; c.textAlign = opt.align || 'left'; c.fillText(s, x, y);
  if (id && c.globalAlpha * (opt.alpha ?? 1) > 0.6) {
    const m = c.measureText(s), wd = m.width, x0 = opt.align === 'right' ? x - wd : opt.align === 'center' ? x - wd / 2 : x;
    const tf = c.getTransform(), p0 = tf.transformPoint({ x: x0, y: y - m.actualBoundingBoxAscent }), p1 = tf.transformPoint({ x: x0 + wd, y: y + m.actualBoundingBoxDescent });
    TXT.push({ id, text: opt.full || s, pass: !!opt.pass, x0: Math.min(p0.x, p1.x), y0: Math.min(p0.y, p1.y), x1: Math.max(p0.x, p1.x), y1: Math.max(p0.y, p1.y) });
  }
  c.textAlign = 'left';
}
const tw = (c, s, f) => { c.font = f; return c.measureText(s).width; };
function wipe(c, x, y, w, h, k) { c.beginPath(); c.rect(x, y, w * k, h); c.clip(); }
function ring(c, p, r, k, lw = 2.4) { c.strokeStyle = ORANGE; c.lineWidth = lw; c.beginPath(); c.arc(p[0], p[1], r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); c.stroke(); }
function dot(c, p, r = 3.5) { c.fillStyle = ORANGE; c.beginPath(); c.arc(p[0], p[1], r, 0, 7); c.fill(); }
function plate(c, x, y, w, h, a = 1) { c.fillStyle = `rgba(14,15,17,${Math.min(0.9, 0.78 * a)})`; c.beginPath(); c.roundRect(x, y, w, h, 4); c.fill(); }
function underline(c, p0, p1, k, lw = 3) { if (k <= 0) return; const b = lerp2(p0, p1, k); c.strokeStyle = ORANGE; c.lineWidth = lw; c.beginPath(); c.moveTo(p0[0], p0[1]); c.lineTo(b[0], b[1]); c.stroke(); }
// layout (scaled to the frame)
const U = Math.min(W, H) / 1080;                                   // 1 unit = 1 px at 1080 short side
const SAFE_TOP = VERT ? 250 : 80 * U;
const CARD = VERT ? { x: 130, y: 250, w: 820 } : { x: 90 * U, y: 90 * U, w: 760 * U };
function wrapLines(c, s, font, maxW) { c.font = font; const out = []; let line = ''; for (const w of String(s).split(/\s+/)) { const tst = line ? line + ' ' + w : w; if (c.measureText(tst).width > maxW && line) { out.push(line); line = w; } else line = tst; } if (line) out.push(line); return out; }
function card(c, t, s, cd, id) {                                   // label · big value (counts up) · note · source
  const t0 = s.t0 + (cd.at ?? (s.type === 'read' || s.type === 'photo' ? 2.8 : 1.2)), t1 = s.t1 - 0.25;
  const k = seg(t, t0, t0 + 0.5) * (1 - seg(t, t1, t1 + 0.35)); if (k <= 0) return;
  const x = CARD.x, y = CARD.y, w = CARD.w, pad = 32 * U;
  const fL = `500 ${Math.round(24 * U)}px PM`, fV = `500 ${Math.round(104 * U)}px PM`, fN = `400 ${Math.round(28 * U)}px PS`, fS = `400 ${Math.round(18 * U)}px PM`;
  const notes = cd.note ? wrapLines(c, cd.note, fN, w - 2 * pad) : [];
  const h = pad + 30 * U + (cd.value ? 112 * U : 0) + notes.length * 36 * U + (cd.source ? 34 * U : 0) + pad * 0.6;
  c.save(); c.globalAlpha = Math.min(1, k * 1.4); wipe(c, x - 4, y - 4, w + 8, h + 8, eo(Math.min(1, k * 1.2)));
  plate(c, x, y, w, h); c.fillStyle = ORANGE; c.fillRect(x, y, 4 * U, h);
  let yy = y + pad + 18 * U;
  text(c, `${id}l`, cd.label || '', x + pad, yy, fL, 'rgba(250,250,247,0.75)');
  if (cd.value) {
    yy += 104 * U; const num = parseFloat(String(cd.value).replace(/,/g, ''));
    const cnt = !isNaN(num) && /^[\d,.]+$/.test(cd.value) && cd.count !== false;
    const kv = cnt ? eio(seg(t, t0 + 0.2, t0 + 1.2)) : 1, shown = cnt ? fmtNum(num * kv, cd.value) : cd.value;
    const fU = `400 ${Math.round(34 * U)}px PS`, room = w - 2 * pad - (cd.unit ? tw(c, cd.unit, fU) + 18 * U : 0);
    const fit = Math.min(104 * U, 104 * U * room / Math.max(1, tw(c, cd.value, fV))), fV2 = `500 ${Math.round(fit)}px PM`;   // shrink long values to the card
    text(c, kv >= 1 ? `${id}v` : null, shown, x + pad, yy, fV2, ORANGE);
    if (cd.unit) text(c, `${id}u`, cd.unit, x + pad + tw(c, shown, fV2) + 18 * U, yy - 6 * U, fU, LIGHT);
  }
  for (const n of notes) { yy += 36 * U; text(c, `${id}n`, n, x + pad, yy, fN, 'rgba(250,250,247,0.93)'); }
  if (cd.source) { yy += 32 * U; text(c, `${id}s`, cd.source, x + pad, yy, fS, 'rgba(250,250,247,0.6)', { pass: true }); }
  c.restore();
}
function annot(c, t, t0, tOut, id, a, lines, align = 'left') {
  const k = seg(t, t0, t0 + 0.45), out = seg(t, tOut, tOut + 0.3); if (k <= 0 || out >= 1) return;
  c.save(); c.globalAlpha = 1 - out;
  const pr = 9 * eo(seg(t, t0, t0 + 0.25)); ring(c, a, pr, 1, 2); dot(c, a, 3);
  const rise = 130 * U, b = [a[0], a[1] - rise], lk = eo(seg(t, t0 + 0.08, t0 + 0.4));
  c.strokeStyle = 'rgba(250,250,247,0.95)'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(a[0], a[1] - pr); c.lineTo(a[0], lerp(a[1] - pr, b[1], lk)); c.stroke();
  const tk = eo(seg(t, t0 + 0.35, t0 + 0.85));
  if (tk > 0) {
    const f1 = `600 ${Math.round(40 * U)}px SF`, f2 = `400 ${Math.round(24 * U)}px PS`;
    const w1 = tw(c, lines[0], f1), w2 = lines[1] ? tw(c, lines[1], f2) : 0, wm = Math.max(w1, w2) + 28 * U, hh = (lines[1] ? 92 : 60) * U;
    let x0 = align === 'left' ? b[0] - 14 * U : b[0] - wm + 14 * U; x0 = clamp(x0, 24, W - wm - 24);
    c.globalAlpha = (1 - out) * tk; plate(c, x0, b[1] - hh, wm, hh);
    text(c, tk >= 1 ? `${id}0` : null, lines[0], x0 + 14 * U, b[1] - hh + 44 * U, f1, LIGHT);
    if (lines[1]) text(c, tk >= 1 ? `${id}1` : null, lines[1], x0 + 14 * U, b[1] - 18 * U, f2, 'rgba(250,250,247,0.85)');
  }
  c.restore();
}
function tags(c, t, st, lensClip) {
  const cam = st.cam;
  for (const it of ITEMS) {
    if (t < it.firstT - 0.4) continue;
    const endS = SHOTS[SHOTS.length - 1], a = eo(seg(t, it.firstT - 0.4, it.firstT + 0.2)) * (endS.type === 'end' ? 1 - seg(t, endS.t0 + 1.2, endS.t0 + 1.8) : 1);
    if (a <= 0) continue;
    const p = w2s(toW(it, [0, 0]), cam);
    c.save(); c.translate(p[0], p[1]); c.rotate(cam.th + it.r); const sc = clamp(cam.z / 0.3, 0.45, 1.4) * U; c.scale(sc, sc); c.globalAlpha = a;
    text(c, null, it.no, 0, -18, '500 24px PM', ORANGE); text(c, null, it.label, 42, -18, '500 22px PS', INK);
    if (it.catalog) text(c, null, it.catalog, 42, -46, '400 18px PM', 'rgba(21,23,26,0.65)');
    c.restore();
  }
}
function subtitles(c, t) {
  if (NOSUBS) return;
  for (const q of CUES) {
    if (t < q.t0 || t >= q.t1) continue;
    const a = Math.min(seg(t, q.t0, q.t0 + 0.12), 1 - seg(t, q.t1 - 0.12, q.t1));
    const f = `500 ${Math.round((VERT ? 40 : 38) * U)}px PS`, wd = tw(c, q.text, f) + 60 * U, x0 = (W - wd) / 2, y0 = VERT ? 1372 : H - 150 * U, h = 70 * U;
    c.save(); c.globalAlpha = a; plate(c, x0, y0, wd, h, 1.1); c.fillStyle = ORANGE; c.fillRect(x0, y0, 4 * U, h);
    text(c, null, q.text, W / 2 + 2, y0 + h * 0.69, f, LIGHT, { align: 'center' }); c.restore();
  }
}
function overlay(t, st) {
  const c = ov; TXT = []; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H);
  if (t < 0.5) return;
  const s = shotAt(t), cam = st.cam;
  c.save(); if (st.on && st.A > 0.5) { c.beginPath(); c.rect(0, 0, W, H); c.arc(st.ls[0], st.ls[1], st.R * 1.31, 0, Math.PI * 2, true); c.clip('evenodd'); }
  tags(c, t, st);
  // table-level marks: underline + ring on the boxes of a table shot
  if (s.type === 'table' && s.boxesT) {
    const it = IT[s.item];
    s.boxesT.forEach((b, j) => {
      const tj = s.t0 + 1.2 + j * 0.9, k = eio(seg(t, tj, tj + 0.9)) * (1 - seg(t, s.t1 - 0.3, s.t1));
      underline(c, w2s(toW(it, [b[0], b[3] + 10]), cam), w2s(toW(it, [lerp(b[0], b[2], 1), b[3] + 10]), cam), k, 3.2);
    });
    if (s.ring) { const rb = boxTex(it, s.ring), cc = w2s(toW(it, mid(rb)), cam), k = eo(seg(t, s.t0 + 1.6, s.t0 + 2.1)) * (1 - seg(t, s.t1 - 0.3, s.t1));
      c.save(); c.translate(cc[0], cc[1]); c.rotate(cam.th + it.r); c.scale(1, 0.55); ring(c, [0, 0], (rb[2] - rb[0]) * 0.66 * it.k * cam.z, k, 2.6 / 0.75); c.restore(); }
  }
  c.restore();
  // loupe readout
  if (st.on && st.A > 0.3) {
    const dv = st.dive, la = seg(t, dv.tDrop + 0.05, dv.tDrop + 0.4) * (1 - ss(seg(t, dv.tDive + 0.3, dv.tDive + 0.7)));
    if (la > 0) {
      const ang = -0.9, r0 = st.R * 1.34, r1 = r0 + 60 * U, a = [st.ls[0] + Math.cos(ang) * r0, st.ls[1] + Math.sin(ang) * r0], b2 = [st.ls[0] + Math.cos(ang) * r1, st.ls[1] + Math.sin(ang) * r1];
      const left = b2[0] > W - 340 * U, tx = left ? b2[0] - 58 * U : b2[0] + 58 * U, al = left ? 'right' : 'left';
      c.save(); c.globalAlpha = la; c.strokeStyle = ORANGE; c.lineWidth = 2; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b2[0], b2[1]); c.lineTo(b2[0] + (left ? -46 : 46) * U, b2[1]); c.stroke();
      text(c, null, '×2.5', tx, b2[1] + 10 * U, `500 ${Math.round(30 * U)}px PM`, ORANGE, { align: al });
      if (dv.it.kind === 'negative') { const d1 = seg(t, dv.tDrop + 0.4, dv.tDrop + 0.7);
        c.globalAlpha = la * (1 - d1); text(c, null, 'NEGATIVE', tx, b2[1] + 44 * U, `400 ${Math.round(22 * U)}px PM`, INK, { align: al });
        c.globalAlpha = la * d1; text(c, null, 'NEGATIVE → POSITIVE', tx, b2[1] + 44 * U, `400 ${Math.round(22 * U)}px PM`, INK, { align: al }); }
      c.restore();
    }
    // read: underline each lit line inside the lens
    if (dv.s.type === 'read') {
      const fade = 1 - seg(t, dv.tRise, dv.tRise + 0.4);
      c.save(); c.globalAlpha = fade;
      dv.s.boxesT.forEach((b, j) => { const tj = dv.s.lineT[j], k = eio(seg(t, tj, tj + 0.9)); if (k <= 0 || t < dv.tIn - 0.3) return;
        underline(c, int2s(toW(dv.it, [b[0], b[3] + 8]), 0, st, 0), int2s(toW(dv.it, [lerp(b[0], b[2], k), b[3] + 8]), 0, st, 0), 1, 3); });
      c.restore();
    }
    // photo: labels inside the photograph
    if (dv.s.type === 'photo' && st.enter > 0.5 && dv.s.labels) {
      dv.s.labels.forEach((L, j) => { const pt = src2tex(dv.it, L.at);
        annot(c, t, dv.tIn + 0.3 + j * 0.5, dv.tRise, `lb${dv.s.i}_${j}`, int2s(toW(dv.it, pt), near(dv.it, pt), st, dv.s.nf ?? 0.5), [L.text, L.sub].filter(Boolean), L.align || 'left'); });
    }
    if (dv.s.type === 'photo' && st.enter > 0.5 && dv.it.credit) {
      const k = seg(t, dv.tIn + 0.6, dv.tIn + 1.1) * (1 - seg(t, dv.tRise, dv.tRise + 0.4));
      if (k > 0) { const f1 = `400 ${Math.round(22 * U)}px PS`, f2 = `400 ${Math.round(18 * U)}px PM`, y = VERT ? 1290 : H - 230 * U;
        c.save(); c.globalAlpha = k; plate(c, 40 * U, y - 34 * U, tw(c, dv.it.credit, f1) + tw(c, dv.it.catalog || '', f2) + 70 * U, 48 * U);
        text(c, `cr${dv.s.i}`, dv.it.credit, 60 * U, y, f1, 'rgba(250,250,247,0.9)'); text(c, null, dv.it.catalog || '', 60 * U + tw(c, dv.it.credit, f1) + 22 * U, y, f2, 'rgba(250,250,247,0.65)'); c.restore(); }
    }
  }
  if (s.card) card(c, t, s, s.card, `c${s.i}`);
  if (s.type === 'title') titleCard(c, t, s);
  if (s.type === 'chapter') chapterCard(c, t, s);
  if (s.type === 'compare') compareCards(c, t, s);
  if (s.type === 'end') endPanel(c, t, s, st);
  subtitles(c, t);
}
function titleCard(c, t, s) {
  const k = eo(seg(t, s.t0 + 0.9, s.t0 + 1.5)) * (1 - seg(t, s.t1 - 0.4, s.t1)); if (k <= 0) return;
  const fT = `600 ${Math.round((VERT ? 84 : 92) * U)}px SF`, fS = `500 ${Math.round(28 * U)}px PM`;
  const lines = wrapLines(c, s.title, fT, (VERT ? 860 : 1300) * U), wm = Math.max(...lines.map(l => tw(c, l, fT)), tw(c, s.sub || '', fS)) + 80 * U;
  const h = (lines.length * 100 + 90) * U, x = (W - wm) / 2, y = VERT ? 560 : (H - h) / 2 - 40 * U;
  c.save(); c.globalAlpha = k; plate(c, x, y, wm, h, 1.1); c.fillStyle = ORANGE; c.fillRect(x + 40 * U, y + h - 70 * U, wm - 80 * U, 3 * U);
  lines.forEach((l, i) => text(c, `tt${i}`, l, W / 2, y + (96 + i * 100) * U, fT, LIGHT, { align: 'center' }));
  if (s.sub) text(c, 'ts', s.sub, W / 2, y + h - 26 * U, fS, ORANGE, { align: 'center' });
  c.restore();
}
function chapterCard(c, t, s) {
  const k = eo(seg(t, s.t0 + 0.3, s.t0 + 0.9)) * (1 - seg(t, s.t1 - 0.45, s.t1)); if (k <= 0) return;
  const fK = `500 ${Math.round(26 * U)}px PM`, fT = `600 ${Math.round(70 * U)}px SF`;
  const lines = wrapLines(c, s.title, fT, (VERT ? 820 : 1200) * U), wm = Math.max(...lines.map(l => tw(c, l, fT)), 300 * U) + 90 * U, h = (70 + lines.length * 80 + 30) * U;
  const x = (W - wm) / 2, y = VERT ? 640 : (H - h) / 2 - 30 * U;
  c.save(); c.globalAlpha = k; wipe(c, x - 4, y - 4, wm + 8, h + 8, eo(k)); plate(c, x, y, wm, h, 1.1);
  text(c, `ck${s.i}`, s.kicker || '', x + 45 * U, y + 50 * U, fK, ORANGE);
  lines.forEach((l, i) => text(c, `ct${s.i}_${i}`, l, x + 45 * U, y + (126 + i * 80) * U, fT, LIGHT));
  c.restore();
}
function compareCards(c, t, s) {
  const a = eo(seg(t, s.t0 + 0.2, s.t0 + 0.8)) * (1 - seg(t, s.t1 - 0.35, s.t1)); if (a <= 0) return;
  const two = [s.a, s.b], gap = 32 * U, fL = `500 ${Math.round(24 * U)}px PM`, fQ = `400 ${Math.round(28 * U)}px PM`, fV = `500 ${Math.round(110 * U)}px PM`, fU = `400 ${Math.round(32 * U)}px PS`, fS = `400 ${Math.round(18 * U)}px PM`;
  const w = VERT ? 900 : (W - 2 * 90 * U - gap) / 2, x0 = VERT ? 90 : 90 * U;
  const blocks = two.map(r => ({ r, q: r.quote ? wrapLines(c, r.quote, fQ, w - 64 * U) : [] }));
  const hOf = b => (40 + 40 + b.q.length * 38 + 130 + 40) * U;
  let y = VERT ? 330 : 160 * U;
  c.save(); c.globalAlpha = a;
  blocks.forEach((b, i) => {
    const h = VERT ? hOf(b) : Math.max(...blocks.map(hOf)), x = VERT ? x0 : x0 + i * (w + gap), yy0 = VERT ? y : y;
    plate(c, x, yy0, w, h, 1.15);
    let yy = yy0 + 52 * U; text(c, `cp${i}l`, b.r.label || '', x + 32 * U, yy, fL, 'rgba(250,250,247,0.8)');
    for (const q of b.q) { yy += 40 * U; text(c, `cp${i}q`, q, x + 32 * U, yy, fQ, 'rgba(250,250,247,0.9)'); }
    yy += 128 * U; const col = (s.strike === (i ? 'b' : 'a')) ? LIGHT : ORANGE;
    text(c, `cp${i}v`, b.r.value || '', x + 32 * U, yy, fV, col);
    if (b.r.unit) text(c, `cp${i}u`, b.r.unit, x + 32 * U + tw(c, b.r.value || '', fV) + 18 * U, yy - 6 * U, fU, LIGHT);
    if (b.r.source) text(c, `cp${i}s`, b.r.source, x + 32 * U, yy + 34 * U, fS, 'rgba(250,250,247,0.6)', { pass: true });
    if (s.strike === (i ? 'b' : 'a')) { const v = seg(t, s.t0 + (s.strikeAt ?? (s.t1 - s.t0) * 0.62), s.t0 + (s.strikeAt ?? (s.t1 - s.t0) * 0.62) + 0.35);
      if (v > 0) { const vw = tw(c, b.r.value || '', fV) + 24 * U; c.strokeStyle = ORANGE; c.lineWidth = 8 * U; c.beginPath(); c.moveTo(x + 22 * U, yy - 30 * U); c.lineTo(x + 22 * U + vw * eo(v), yy - 30 * U - 40 * U * eo(v)); c.stroke(); } }
    if (VERT) y += h + gap;
  });
  c.restore();
}
function endPanel(c, t, s, st) {
  const rows = ITEMS.filter(it => it.row), x0 = VERT ? 110 : 110 * U, rw = VERT ? 860 : 900 * U, rh = (VERT ? 96 : 76) * U, y0 = VERT ? 260 : 90 * U;
  const pa = eo(seg(t, s.t0 + 1.2, s.t0 + 1.7)); if (pa <= 0) return;
  const arrived = rows.reduce((acc, r, i) => acc + eio(seg(t, s.t0 + 1.4 + i * 0.12, s.t0 + 1.85 + i * 0.12)), 0);
  c.save(); c.globalAlpha = pa; plate(c, x0 - 32 * U, y0 - 34 * U, rw + 64 * U, 84 * U + arrived * rh + 20 * U, 1.2);
  text(c, 'ix-h', 'Archive index', x0, y0 + 22 * U, `600 ${Math.round(34 * U)}px SF`, LIGHT);
  text(c, 'ix-h2', (EP.indexTitle || '').toUpperCase(), x0 + 260 * U, y0 + 18 * U, `500 ${Math.round(19 * U)}px PM`, ORANGE);
  c.restore();
  rows.forEach((r, i) => {
    const t0 = s.t0 + 1.4 + i * 0.12, k = eio(seg(t, t0, t0 + 0.45)); if (k <= 0) return;
    const from = w2s(r.c, st.cam), to = [x0, y0 + 76 * U + i * rh], p = lerp2(from, to, k), done = k >= 1;
    c.save(); c.globalAlpha = Math.min(1, k * 2);
    text(c, done ? `ix${i}a` : null, r.no, p[0], p[1] + 14 * U, `500 ${Math.round(20 * U)}px PM`, ORANGE);
    text(c, done ? `ix${i}b` : null, r.short || r.label, p[0] + 46 * U, p[1] + 14 * U, `500 ${Math.round(24 * U)}px PS`, LIGHT);
    text(c, done ? `ix${i}c` : null, r.catalog || '', p[0] + 46 * U, p[1] + 42 * U, `400 ${Math.round(16 * U)}px PM`, 'rgba(250,250,247,0.55)');
    text(c, done ? `ix${i}d` : null, r.row, p[0] + rw, p[1] + 14 * U, `500 ${Math.round(24 * U)}px PS`, ORANGE, { align: 'right' });
    c.restore();
  });
  const k = eo(seg(t, s.t0 + 2.6, s.t0 + 3.2)); if (k <= 0) return;
  const ec = EP.end || {}, x = VERT ? 110 : W - 860 * U, y = VERT ? 1000 : H - 330 * U, wd = 780 * U;
  c.save(); c.globalAlpha = k; plate(c, x - 32 * U, y - 92 * U, wd + 64 * U, 300 * U, 1.2);
  text(c, 'end-a', 'As Printed', x, y, `600 ${Math.round(76 * U)}px SF`, LIGHT);
  text(c, 'end-b', ec.sub || EP.title, x, y + 50 * U, `400 ${Math.round(28 * U)}px PS`, 'rgba(250,250,247,0.9)');
  c.fillStyle = ORANGE; c.fillRect(x, y + 74 * U, wd, 2 * U);
  (ec.credits || []).forEach((l, i) => text(c, `end-c${i}`, l, x, y + (112 + i * 30) * U, `400 ${Math.round(20 * U)}px PS`, 'rgba(250,250,247,0.72)', { pass: i > 1 }));
  c.restore();
}

// ---------------- page contract ----------------
let ITEMS = [];
window.render = tl => { const t = tl + T0; const st = frame(t); overlay(t, st); gl.finish(); };
window.TEXTS = tl => { window.render(tl); return TXT; };
const img = s => new Promise((r, j) => { const i = new Image(); i.onload = () => r(i); i.onerror = () => j(new Error('missing ' + s)); i.src = s; });
(async () => {
  for (const f of ['400 20px PM', '500 20px PM', '400 20px PS', '500 20px PS', '600 20px SF']) await document.fonts.load(f);
  [EP, TEX, TL] = await Promise.all(['episode.json', 'assets/tex/items.json', `out/${FILM}/timeline.json`].map(u => fetch(u).then(r => { if (!r.ok) throw new Error('missing ' + u); return r.json(); })));
  TABLE = TEX.table;
  EP.items.forEach((e, i) => { const t = TEX.items[e.id]; if (!t) throw new Error('no texture for ' + e.id);
    IT[e.id] = { ...e, ...t, r: t.rDeg * Math.PI / 180, kindN: { paper: 0, negative: 1, print: 2 }[e.kind] ?? 0, no: String(i + 1).padStart(2, '0') }; });
  SHOTS = TL.shots.map((s, i) => ({ ...s, i }));
  CUES = TL.cues; DUR = TL.dur;
  for (const s of SHOTS) {
    const it = s.item && IT[s.item];
    if (it) {
      s.boxesT = s.boxes ? s.boxes.map(b => boxTex(it, b)) : null;
      s.focus = s.focus ? src2tex(it, s.focus) : (s.boxesT ? mid([Math.min(...s.boxesT.map(b => b[0])), Math.min(...s.boxesT.map(b => b[1])), Math.max(...s.boxesT.map(b => b[2])), Math.max(...s.boxesT.map(b => b[3]))]) : [it.size[0] / 2, it.size[1] / 2]);
    }
  }
  ITEMS = Object.values(IT).filter(it => SHOTS.some(s => s.item === it.id) || it.always);
  ITEMS.forEach(it => { const f = SHOTS.find(s => s.item === it.id); it.firstT = f ? f.t0 : 0; });
  ITEMS.forEach(it => { it.tex = null; });
  const ims = await Promise.all(ITEMS.map(it => img('assets/tex/' + it.id + '.png')));
  ims.forEach((im, i) => { ITEMS[i].tex = texRG(im); });
  buildCamera();
  const t1 = Q.get('t1') ? +Q.get('t1') : DUR;
  window.DUR = Math.max(0.04, Math.min(t1, DUR) - T0);
  window.SUBCHECK_CUES = CUES;
  window.render(0); window.READY = true;
})().catch(e => { console.error(e.message); throw e; });
