// "No Lives Lost" — the Titanic, April 1912, on an archive light table. render(t) for the whole film. 1080×1920.
// Engine adapted from the Lemo-Opuscar Archive Light Table demo (one WebGL2 shader for the table, glass negatives,
// backlit paper, the loupe and the photograph spaces; marks, readings, subtitles and the index on a 2D canvas).
// World units: pixels of the White Star office negative at 4000 px (one 7-inch plate). Every item sits on the table
// with a centre, a rotation and a scale (texture px -> world), at its true size.
import { HIT, DUR } from './timeline.js';

const W = 1080, H = 1920, CX = W / 2, CY = H / 2;
const ORANGE = '#ff5a1f', INK = '#15171a', PAPER = 'rgba(246,246,242,0.96)';

// ---------------- helpers ----------------
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const ss = x => x * x * (3 - 2 * x);
const eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const eo = x => 1 - Math.pow(1 - x, 3);
const lerp = (a, b, x) => a + (b - a) * x;
const lerp2 = (a, b, x) => [lerp(a[0], b[0], x), lerp(a[1], b[1], x)];
function track(keys) {                              // monotone cubic (Fritsch–Carlson), [t, v]
  const n = keys.length, d = [], m = [];
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
const rot = (v, a) => { const c = Math.cos(a), s = Math.sin(a); return [c * v[0] - s * v[1], s * v[0] + c * v[1]]; };

// ---------------- the table ----------------
// c: centre (world), r: rotation (deg), k: world units per texture px, size: texture px. Newspapers at true size
// (broadsheets about 17 in wide), plates 5×7 in (4000 px = 7 in; the two props at 2400 px, k 1.6).
const IT = {
  union:   { c: [0, 0], r: -1.5, k: 3.9, size: [2480, 3198] },
  tribune: { c: [10900, -1600], r: 2.5, k: 3.25, size: [3128, 4760] },
  medford: { c: [9900, 12600], r: -3.0, k: 3.35, size: [2834, 3542] },
  news:    { c: [-8600, -4300], r: 2.0, k: 1, size: [4000, 2909] },
  crowd:   { c: [-8900, -300], r: -3.0, k: 1.6, size: [2400, 1745] },
  boats:   { c: [-8400, 4100], r: -1.5, k: 1, size: [4000, 2897] },
  surv:    { c: [-8900, 8300], r: 3.0, k: 1.6, size: [2400, 1735] },
};
const toW = (it, p) => { const o = rot([(p[0] - it.size[0] / 2) * it.k, (p[1] - it.size[1] / 2) * it.k], it.r * Math.PI / 180); return [it.c[0] + o[0], it.c[1] + o[1]]; };
const centre = (it) => [it.c[0], it.c[1]];

// lines on the pages (texture px): [x0, y0, x1, y1]
const U_DATE = [762, 297, 1585, 330], U_AFLOAT = [115, 345, 682, 452], U_LOST = [177, 478, 700, 585];
const T_LINE = [45, 436, 2793, 559], T_NUM = [45, 436, 345, 559];
const M_LINE = [172, 486, 2672, 617], M_NUM = [172, 486, 475, 617];
const mid = b => [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2];

// photograph spaces: nearness 0 at the far edge (the street's horizon row / the top of the sea), 1 at the bottom
const NEWS_HZ = 1380, BOATS_HZ = 0;
const BOAT_A = [1130, 1340], BOAT_B = [2300, 1600];   // the two lifeboats (texture px, at the waterline)
const DOOR = [1240, 1000];                            // the White Star office door

// lens positions (world)
const L1W = toW(IT.union, [600, 470]);
const L2W = toW(IT.news, [1900, 1550]);
const L3W = toW(IT.boats, [1800, 1700]);
const LENS_RW = 900, MAG = 2.5;

// ---------------- camera ----------------
const UDW = toW(IT.union, mid(U_DATE));
const TNW = toW(IT.tribune, [330, 500]), TEW = toW(IT.tribune, [1500, 520]);
const MNW = toW(IT.medford, [420, 560]), MEW = toW(IT.medford, [1500, 560]);
const TABLE_C = [3000, 4300];
const CAM = [
  // t, centre, zoom, rotation (deg)
  [0.0, [L1W[0] + 2600, L1W[1] + 3600], 0.085, -2.0],
  [HIT.drop1, [L1W[0] + 150, L1W[1] + 160], 0.27, 1.2],
  [HIT.dive1, L1W, 0.29, 1.5],
  [HIT.dive1 + 1.2, L1W, 1.4, 1.5],
  [HIT.rise1, L1W, 1.4, 1.5],
  [HIT.lift1, [L1W[0] - 3200, L1W[1] - 1600], 0.2, 0.5],
  [HIT.drop2, [L2W[0] + 100, L2W[1] - 120], 0.27, -1.2],
  [HIT.dive2, L2W, 0.29, -1.0],
  [HIT.enter2, L2W, 1.4, 0],
  [HIT.rise2, L2W, 1.4, 0],
  [HIT.rise2 + 1.1, [UDW[0] - 300, UDW[1] + 700], 0.36, -1.0],
  [HIT.trib - 1.2, [UDW[0] - 200, UDW[1] + 640], 0.37, -1.5],
  [HIT.trib - 0.2, [TNW[0], TNW[1] + 500], 0.34, 2.0],
  [HIT.trib + 2.6, [TNW[0] + 300, TNW[1] + 500], 0.35, 2.2],
  [HIT.med - 1.0, [TEW[0], TEW[1] + 520], 0.32, 2.5],
  [HIT.med - 0.2, [MNW[0], MNW[1] + 480], 0.34, -2.5],
  [HIT.med + 2.4, [MNW[0] + 300, MNW[1] + 480], 0.35, -2.7],
  [HIT.drop3 - 1.2, [MEW[0], MEW[1] + 500], 0.32, -3.0],
  [HIT.drop3, [L3W[0] + 100, L3W[1] - 100], 0.27, -1.0],
  [HIT.dive3, L3W, 0.29, -1.5],
  [HIT.enter3, L3W, 1.4, -1.5],
  [HIT.rise3, L3W, 1.4, -1.5],
  [HIT.rise3 + 1.0, [L3W[0] + 2000, L3W[1] + 600], 0.14, -0.8],
  [HIT.index - 0.2, [L3W[0] + 4000, L3W[1] + 400], 0.12, -0.4],
  [HIT.endCard + 1.4, TABLE_C, 0.034, 0],
  [DUR, [TABLE_C[0] + 160, TABLE_C[1]], 0.0332, 0],
];
const camC = track2(CAM.map(k => [k[0], k[1]]));
const camLZ = track(CAM.map(k => [k[0], Math.log(k[2])]));
const camR = track(CAM.map(k => [k[0], k[3]]));
const camAt = t => ({ c: camC(t), z: Math.exp(camLZ(t)), th: camR(t) * Math.PI / 180 });
function w2s(w, cam) { const d = rot([(w[0] - cam.c[0]) * cam.z, (w[1] - cam.c[1]) * cam.z], cam.th); return [CX + d[0], CY + d[1]]; }

// ---------------- the three dives ----------------
const phys = (t, lw) => ({ S: camAt(t).z * MAG, ic: lw });
function dive(lw, tDrop, tLift, keysS, keysC) {
  const s0 = phys(tDrop, lw), s1 = phys(tLift, lw);
  return { lw, tDrop, tLift, S: track([[tDrop, s0.S], ...keysS, [tLift, s1.S]]), C: track2([[tDrop, lw], ...keysC, [tLift, lw]]) };
}
const UDATE_W = toW(IT.union, [1080, 313]), UHEAD_W = toW(IT.union, [400, 400]), ULOST_W = toW(IT.union, [440, 540]);
const D1 = dive(L1W, HIT.drop1, HIT.lift1,
  [[HIT.dive1, 0.74], [HIT.dive1 + 1.2, 0.30], [HIT.lineDate + 1.0, 0.30], [HIT.lineAfloat, 0.34], [HIT.lineLost + 0.4, 0.36], [HIT.rise1, 0.40]],
  [[HIT.dive1, L1W], [HIT.dive1 + 1.2, UDATE_W], [HIT.lineDate + 1.0, UDATE_W], [HIT.lineAfloat, UHEAD_W], [HIT.lineLost + 0.4, ULOST_W], [HIT.rise1, ULOST_W]]);
const NEWS_IN = toW(IT.news, [1650, 1455]), NEWS_IN2 = toW(IT.news, [1580, 1455]);
const D2 = dive(L2W, HIT.drop2, HIT.rise2 + 1.0,
  [[HIT.dive2, 0.82], [HIT.enter2, 0.74], [HIT.rise2, 0.78]],
  [[HIT.dive2, L2W], [HIT.enter2, NEWS_IN], [HIT.rise2, NEWS_IN2]]);
const BOATS_IN = toW(IT.boats, [1760, 1450]), BOATS_IN2 = toW(IT.boats, [1720, 1450]);
const D3 = dive(L3W, HIT.drop3, HIT.rise3 + 1.0,
  [[HIT.dive3, 0.80], [HIT.enter3, 0.74], [HIT.rise3, 0.80]],
  [[HIT.dive3, L3W], [HIT.enter3, BOATS_IN], [HIT.rise3, BOATS_IN2]]);
const DIVES = [D1, D2, D3];

function shot(t) {
  const cam = camAt(t);
  let dv = null; for (const d of DIVES) if (t >= d.tDrop - 0.4 && t <= d.tLift + 0.4) dv = d;
  const st = { cam, t, on: 0, A: 0, lift: 1, ls: [0, 0], R: 0, S: 1, ic: [0, 0], k: 0.16, mode: 0, enter: 0, sh: [0, 0], dz: 0, dev: 0, dive: dv };
  if (dv) {
    const inn = seg(t, dv.tDrop - 0.4, dv.tDrop), out = seg(t, dv.tLift, dv.tLift + 0.4);
    st.on = 1; st.A = eo(inn) * (1 - ss(out)); st.lift = 1 + 0.35 * (1 - eo(inn)) + 0.35 * eo(out);
    st.ls = w2s(dv.lw, cam); st.R = LENS_RW * cam.z * st.lift;
    const tt = clamp(t, dv.tDrop, dv.tLift);
    st.S = dv.S(tt); st.ic = dv.C(tt);
    if (t < dv.tDrop || t > dv.tLift) st.S = cam.z * MAG * st.lift;
  }
  if (dv === D1) st.k = 0.16 * (1 - ss(seg(t, HIT.dive1 + 0.3, HIT.dive1 + 1.1))) + 0.16 * ss(seg(t, HIT.rise1 + 0.2, HIT.lift1));
  if (dv === D2) {
    st.mode = 1;
    st.k = 0.16 * (1 - ss(seg(t, HIT.dive2 + 0.4, HIT.enter2 - 0.1))) + 0.16 * ss(seg(t, HIT.rise2 + 0.4, HIT.rise2 + 1.0));
    st.enter = ss(seg(t, HIT.dive2 + 0.5, HIT.enter2)) * (1 - ss(seg(t, HIT.rise2, HIT.rise2 + 0.9)));
    const p = ss(seg(t, HIT.dive2 + 0.6, HIT.rise2 + 0.4));
    st.sh = [-160 * p, -90 * p]; st.dz = 0.45 * p;
  }
  if (dv === D3) {
    st.mode = 2;
    st.k = 0.16 * (1 - ss(seg(t, HIT.dive3 + 0.4, HIT.enter3 - 0.1))) + 0.16 * ss(seg(t, HIT.rise3 + 0.4, HIT.rise3 + 1.0));
    st.enter = ss(seg(t, HIT.dive3 + 0.5, HIT.enter3)) * (1 - ss(seg(t, HIT.rise3, HIT.rise3 + 0.9)));
    const p = ss(seg(t, HIT.dive3 + 0.6, HIT.rise3 + 0.4));
    st.sh = [180 * p, -60 * p]; st.dz = 0.5 * p;
  }
  const devAt = (t0) => t < t0 ? 0 : (t < t0 + 0.85 ? 1.25 * eio(seg(t, t0, t0 + 0.8)) : 1.3);
  st.dev = dv === D3 ? devAt(HIT.develop3) : devAt(HIT.develop);
  return st;
}

// inside the lens: world point (with its nearness n in the photograph spaces) -> screen
function int2s(w, n, st, nf) {
  const dn = n - nf, sc = 1 + st.dz * st.enter * dn;
  const q = [((w[0] - st.ic[0]) * sc + st.sh[0] * st.enter * dn) * st.S, ((w[1] - st.ic[1]) * sc + st.sh[1] * st.enter * dn) * st.S];
  const r = rot(q, st.cam.th); return [st.ls[0] + r[0], st.ls[1] + r[1]];
}
const nNews = p => clamp((p[1] - NEWS_HZ) / (2909 - NEWS_HZ), 0, 1);
const nBoats = p => clamp((p[1] - BOATS_HZ) / (2897 - BOATS_HZ), 0, 1);
const NF_NEWS = 0.35, NF_BOATS = 0.62;              // focus planes (the crowd at the door; the boats)

// ---------------- WebGL ----------------
const cv = document.getElementById('gl');
const gl = cv.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false });
const ov = document.getElementById('ov').getContext('2d');
const VS = `#version 300 es
in vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }`;
const f = v => v.toFixed(4);
const v4 = b => `vec4(${b.map(x => x.toFixed(1)).join(',')})`;
const FS = `#version 300 es
precision highp float;
uniform sampler2D tUn, tTr, tMe, tNw, tNwm, tCr, tCrm, tBo, tBom, tSu, tSum;
uniform vec4 uUn, uTr, uMe, uNw, uCr, uBo, uSu;   // centre.xy, rotation (rad), world per texel
uniform vec2 uCam; uniform float uZ, uRot, uT, uLight;
uniform vec2 uLensC; uniform float uLensR, uLensOn, uLensA, uLift;
uniform vec2 uIntC; uniform float uS, uK, uDev, uEnter, uDz, uMode;
uniform vec2 uSh;
uniform vec3 uUnLit; uniform float uUnDim, uTrLit, uTrDim, uMeLit, uMeDim, uSceneDim;
out vec4 o;
float h21(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }
vec2 rot(vec2 v, float a){ float c=cos(a), s=sin(a); return vec2(c*v.x-s*v.y, s*v.x+c*v.y); }
vec4 tg(sampler2D t, vec2 uv, float fpx){ vec2 sz = vec2(textureSize(t, 0)); vec2 f = vec2(fpx)/sz; return textureGrad(t, uv, vec2(f.x, 0.), vec2(0., f.y)); }
vec2 itemUV(vec4 it, sampler2D t, vec2 w){ vec2 sz = vec2(textureSize(t, 0)); return (rot(w - it.xy, -it.z)/it.w + sz*0.5)/sz; }
bool inside(vec2 uv){ return uv.x > 0. && uv.y > 0. && uv.x < 1. && uv.y < 1.; }
float band(vec2 px, vec4 b, float p, float fe){
  float ex = smoothstep(b.x - 30., b.x + 10., px.x) * (1. - smoothstep(mix(b.x, b.z, p) - 10., mix(b.x, b.z, p) + 40., px.x));
  float ey = smoothstep(b.y - fe, b.y + fe*0.33, px.y) * (1. - smoothstep(b.w - fe*0.33, b.w + fe, px.y));
  return ex * ey * step(0.001, p);
}
vec3 lightTable(vec2 w){
  vec2 lo = vec2(-12200., -11200.), hi = vec2(17600., 20000.);
  vec2 d = min(w - lo, hi - w); float e = min(d.x, d.y);
  vec2 cd = (w - vec2(2700., 4400.)) / vec2(22000., 26000.);
  float L = (1. - 0.14*dot(cd, cd)) + (vn(w*0.015) - 0.5)*0.010 + (vn(w*0.0021) - 0.5)*0.012;
  vec3 lit = vec3(0.968, 0.976, 0.986)*L*uLight + vec3(0.035, 0.037, 0.04)*(1. - uLight);
  vec3 frame = vec3(0.33, 0.34, 0.35) + 0.05*vn(vec2(w.x*0.002, w.y*0.4)) - 0.14*smoothstep(0., 400., e + 400.);
  vec3 desk = vec3(0.055, 0.058, 0.062) + 0.012*vn(w*0.003);
  return e > 0. ? lit : (e > -400. ? frame : desk);
}
// newsprint, backlit: paper glows warm, ink stays dark; lit lines get darker ink and brighter paper
vec3 paper(vec3 L, float tex, float lit, float dim, vec2 uv){
  float edge = min(min(uv.x, 1. - uv.x), min(uv.y, 1. - uv.y));
  vec3 tone = vec3(1.0, 0.972, 0.915) * (0.93 + 0.07*smoothstep(0., 0.02, edge));
  vec3 base = L * tone * (0.10 + 0.86*tex) + vec3(0.02)*(1. - uLight);
  vec3 ink = L * tone * (0.04 + 0.96*pow(tex, 1.7)) * 1.12;
  return mix(base * mix(1., 0.62, dim), ink, lit);
}
vec3 negative(vec3 L, float pos, float m, float dev, vec3 col, vec2 lv){
  float T = 0.035 + 0.90*pow(clamp(1. - pos, 0., 1.), 1.25);
  vec3 neg = L*T*vec3(0.98, 0.93, 0.84);
  float pc = clamp((pos - lv.x)/(lv.y - lv.x), 0., 1.); pc = pow(pc, 1.12); pc = pc*pc*(3. - 2.*pc)*0.6 + pc*0.4;
  vec3 posc = mix(vec3(0.045, 0.040, 0.036), vec3(0.99, 0.982, 0.962), pc) * (0.25 + 0.75*uLight);
  return mix(col, mix(neg, posc, dev), m);
}
float nearN(vec2 w){ vec2 sz = vec2(textureSize(tNw, 0)); vec2 px = itemUV(uNw, tNw, w)*sz; return clamp((px.y - ${NEWS_HZ}.)/${2909 - NEWS_HZ}., 0., 1.); }
float nearB(vec2 w){ vec2 sz = vec2(textureSize(tBo, 0)); vec2 px = itemUV(uBo, tBo, w)*sz; return clamp((px.y - ${BOATS_HZ}.)/${2897 - BOATS_HZ}., 0., 1.); }
vec2 parallax(vec2 pf, float mode){                    // flat world point -> source world point (photograph space)
  vec2 d = pf - uIntC, p = pf;
  float nf = mode < 1.5 ? ${f(NF_NEWS)} : ${f(NF_BOATS)};
  for (int i=0;i<4;i++){ float n = (mode < 1.5 ? nearN(p) : nearB(p)) - nf; p = uIntC + (d - uSh*uEnter*n) / (1. + uDz*uEnter*n); }
  return p;
}
float speck(vec2 p, float cell, float thr){
  vec2 g = floor(p/cell), f = p/cell - g;
  if (h21(g) < thr) return 0.;
  vec2 c = vec2(.2) + .6*vec2(h21(g+3.1), h21(g+7.7)); float r = .05 + .12*h21(g+1.3);
  return smoothstep(r, r*.35, length(f - c));
}
vec3 scene(vec2 w, bool interior, float dev, float fp){
  vec3 L = lightTable(w), col = L;
  // newspapers (older under newer)
  vec2 u = itemUV(uUn, tUn, w);
  if (inside(u)){
    vec2 px = u*vec2(textureSize(tUn, 0));
    float lit = max(band(px, ${v4(U_DATE)}, uUnLit.x, 8.), max(band(px, ${v4(U_AFLOAT)}, uUnLit.y, 12.), band(px, ${v4(U_LOST)}, uUnLit.z, 12.)));
    col = paper(L, tg(tUn, u, fp/uUn.w).r, lit, uUnDim, u);
  }
  u = itemUV(uTr, tTr, w);
  if (inside(u)){
    vec2 px = u*vec2(textureSize(tTr, 0));
    col = paper(L, tg(tTr, u, fp/uTr.w).r, band(px, ${v4(T_LINE)}, uTrLit, 12.), uTrDim, u);
  }
  u = itemUV(uMe, tMe, w);
  if (inside(u)){
    vec2 px = u*vec2(textureSize(tMe, 0));
    col = paper(L, tg(tMe, u, fp/uMe.w).r, band(px, ${v4(M_LINE)}, uMeLit, 12.), uMeDim, u);
  }
  // the two prop plates
  u = itemUV(uCr, tCr, w);
  if (inside(u)) col = negative(L, tg(tCr, u, fp/uCr.w).r, tg(tCrm, u, fp/uCr.w).r, 0., col, vec2(0.03, 0.97));
  u = itemUV(uSu, tSu, w);
  if (inside(u)) col = negative(L, tg(tSu, u, fp/uSu.w).r, tg(tSum, u, fp/uSu.w).r, 0., col, vec2(0.03, 0.97));
  // the White Star office (photograph space in mode 1)
  vec2 w1 = (interior && uMode > 0.5 && uMode < 1.5) ? parallax(w, 1.) : w;
  u = itemUV(uNw, tNw, w1);
  if (inside(u)) col = negative(L, tg(tNw, u, fp).r, tg(tNwm, u, fp).r, interior ? dev : 0., col, vec2(0.04, 0.95));
  // the lifeboats (photograph space in mode 2): the swell moves
  vec2 w2 = (interior && uMode > 1.5) ? parallax(w, 2.) : w;
  u = itemUV(uBo, tBo, w2);
  if (inside(u)){
    float pos = tg(tBo, u, fp).r;
    if (interior && uMode > 1.5 && uEnter > 0.){
      vec2 px = u*vec2(textureSize(tBo, 0));
      float sw = vn(px*vec2(0.0035, 0.011) + vec2(uT*0.22, -uT*0.35)) - 0.5;
      float sw2 = vn(px*vec2(0.012, 0.03) + vec2(-uT*0.5, uT*0.2)) - 0.5;
      pos += uEnter*(0.045*sw + 0.02*sw2);
    }
    col = negative(L, pos, tg(tBom, u, fp).r, interior ? dev : 0., col, vec2(0.05, 0.92));
  }
  float dd = speck(w, 70., 0.955)*0.5 + speck(w + 31., 19., 0.975)*0.35;
  col *= 1. - dd*(interior ? (1. - uEnter) : 0.8)*0.6;
  return col;
}
void main(){
  vec2 s = vec2(gl_FragCoord.x, ${H}. - gl_FragCoord.y);
  vec2 w = uCam + rot(s - vec2(${CX}., ${CY}.), -uRot) / uZ;
  vec2 dl = s - uLensC; float r = length(dl), rho = r / max(uLensR, 1.);
  vec3 table = scene(w, false, 0., 1. / uZ);
  vec3 col = table;
  if (uLensOn > .5){
    vec2 sd = s - (uLensC + vec2(26., 34.)*(uLift - 1.)*uLensR/120.);
    float sr = length(sd)/uLensR;
    vec3 under = table * (1. - 0.22*(uLift - 1.)/0.35*uLensA*smoothstep(1.55, 1.05, sr));
    vec3 lc;
    if (rho < 1.0){
      float dev = uDev >= 1.25 ? 1. : 1. - smoothstep(uDev - 0.14, uDev, rho);
      vec3 c3;
      for (int i=0;i<3;i++){
        float k = uK*(1. + float(i-1)*0.10);
        vec2 q = dl / (1. + k*rho*rho) * (1. - float(i-1)*0.004*uK/0.16);
        vec2 wi = uIntC + rot(q, -uRot) / uS;
        c3[i] = scene(wi, true, dev, 1. / uS)[i];
      }
      lc = c3;
      float front = (uDev > 0.01 && uDev < 1.15) ? exp(-pow((rho - uDev)/0.022, 2.)) : 0.;
      lc += vec3(1.0, 0.62, 0.36)*0.22*front*smoothstep(0.05, 0.35, uDev);
      lc *= 1. - 0.30*smoothstep(0.78, 1.0, rho)*(1. - uEnter);
      vec2 hp = dl/uLensR - vec2(-0.38, -0.46); lc += vec3(0.06)*exp(-dot(hp,hp)*7.)*(1. - uEnter);
      vec2 hp2 = dl/uLensR - vec2(0.42, 0.50); lc += vec3(0.025)*exp(-dot(hp2,hp2)*14.)*(1. - uEnter);
      lc *= 1. - uSceneDim;
    } else if (rho < 1.065){
      float u = (rho - 1.0)/0.065; vec2 nd = dl / max(r, 1.);
      float lit = max(0., dot(nd, normalize(vec2(-0.55, -0.83))));
      float bev = exp(-pow((u - 0.18)/0.09, 2.))*0.9 + exp(-pow((u - 0.85)/0.07, 2.))*0.5;
      lc = vec3(0.040, 0.042, 0.046) + vec3(0.62, 0.64, 0.66)*pow(lit, 5.)*bev + 0.05*bev + vn(vec2(atan(dl.y, dl.x)*180., u*4.))*0.02;
    } else if (rho < 1.30){
      float u = (rho - 1.065)/0.235;
      vec2 s2 = uLensC + dl*(0.955 + 0.045*u);
      vec2 w2 = uCam + rot(s2 - vec2(${CX}., ${CY}.), -uRot) / uZ;
      lc = scene(w2, false, 0., 1. / uZ)*0.93 + 0.035*uLight;
      lc *= 1. - 0.45*exp(-pow(u/0.05, 2.));
      lc += vec3(0.20, 0.21, 0.22)*exp(-pow((u - 0.93)/0.035, 2.))*uLight;
      lc *= 1. - 0.25*exp(-pow((u - 1.0)/0.015, 2.));
    } else {
      lc = under * (1. - (0.07*exp(-pow((rho - 1.31)/0.05, 2.)) + 0.03*exp(-pow((rho - 1.3)/0.25, 2.)))*(2. - uLift));
    }
    col = mix(under, lc, uLensA);
  }
  col *= 1. - uSceneDim * (uLensOn > .5 && rho < 1.0 ? 0. : 1.);
  vec2 sv = (s - vec2(${CX}., ${CY}.)) / vec2(780., 1250.);
  col *= 1. - 0.10*dot(sv, sv);
  float g = h21(s + fract(uT*24.*0.6180339)*vec2(311.7, 217.3)) - 0.5;
  col += g*(0.018 + 0.016*uEnter);
  o = vec4(clamp(col, 0., 1.), 1.);
}`;
function shd(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
const prog = gl.createProgram();
gl.attachShader(prog, shd(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, shd(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
gl.useProgram(prog);
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
const aLoc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(aLoc); gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);
const U = n => gl.getUniformLocation(prog, n);
function tex(unit, src, mip = true) {
  const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false); gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
  if (mip) gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mip ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const ext = gl.getExtension('EXT_texture_filter_anisotropic'); if (mip && ext) gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, 8);
  return t;
}
const img = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('missing ' + src)); i.src = src; });
const itU = it => [it.c[0], it.c[1], it.r * Math.PI / 180, it.k];

// ---------------- overlay ----------------
let TXT = [];
function text(c, id, s, x, y, font, color, opt = {}) {
  c.font = font; c.fillStyle = color; c.textBaseline = opt.base || 'alphabetic'; c.textAlign = opt.align || 'left';
  c.fillText(s, x, y);
  if (id && c.globalAlpha * (opt.alpha ?? 1) > 0.6) {
    const m = c.measureText(s), wdt = m.width, x0 = opt.align === 'right' ? x - wdt : opt.align === 'center' ? x - wdt / 2 : x;
    const tf = c.getTransform(), p0 = tf.transformPoint({ x: x0, y: y - m.actualBoundingBoxAscent }), p1 = tf.transformPoint({ x: x0 + wdt, y: y + m.actualBoundingBoxDescent });
    TXT.push({ id, text: opt.full || s, pass: !!opt.pass, x0: Math.min(p0.x, p1.x), y0: Math.min(p0.y, p1.y), x1: Math.max(p0.x, p1.x), y1: Math.max(p0.y, p1.y) });
  }
  c.textAlign = 'left';
}
const tw = (c, s, font) => { c.font = font; return c.measureText(s).width; };
function wipe(c, x, y, w, h, k, right = false) { c.beginPath(); right ? c.rect(x + w * (1 - k), y, w * k, h) : c.rect(x, y, w * k, h); c.clip(); }
function ring(c, p, r, k, lw = 2.2, col = ORANGE) { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.arc(p[0], p[1], r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); c.stroke(); }
function dot(c, p, r = 3, col = ORANGE) { c.fillStyle = col; c.beginPath(); c.arc(p[0], p[1], r, 0, Math.PI * 2); c.fill(); }
function plate(c, x, y, w, h, a = 0.9) { c.fillStyle = `rgba(14,15,17,${Math.min(0.92, 0.74 * a)})`; c.beginPath(); c.roundRect(x, y, w, h, 3); c.fill(); }
function underline(c, p0, p1, k, lw = 3) { if (k <= 0) return; const b = lerp2(p0, p1, k); c.strokeStyle = ORANGE; c.lineWidth = lw; c.beginPath(); c.moveTo(p0[0], p0[1]); c.lineTo(b[0], b[1]); c.stroke(); }

let CUES = [];
const NOSUBS = /nosubs=1/.test(location.search);
const SUB_Y = 1372;                                   // the caption strip, above YouTube's bottom overlay
function subtitles(c, t) {
  if (NOSUBS) return;
  for (const q of CUES) {
    if (t < q.t0 || t >= q.t1) continue;
    const a = Math.min(seg(t, q.t0, q.t0 + 0.12), 1 - seg(t, q.t1 - 0.12, q.t1));
    c.save(); c.globalAlpha = a;
    const font = '500 40px PS', wm = tw(c, q.en, font) + 60, x0 = (W - wm) / 2;
    plate(c, x0, SUB_Y, wm, 74, 1.1);
    c.fillStyle = ORANGE; c.fillRect(x0, SUB_Y, 4, 74);
    text(c, null, q.en, W / 2 + 2, SUB_Y + 51, font, 'rgba(250,250,247,0.98)', { align: 'center' });
    c.restore();
  }
}

// world-anchored item tags, revealed when the camera first meets the item
const TAGS = [
  { it: IT.union, at: [-0.5, -0.5], t0: 0.9, no: '01', en: 'THE NEW HAVEN UNION · 15 APR 1912', id2: 'LCCN sn92051126' },
  { it: IT.news, at: [-0.5, -0.5], t0: 8.9, no: '02', en: 'WHITE STAR OFFICE, N.Y.', id2: 'LC-B2- 2391-30' },
  { it: IT.crowd, at: [-0.5, -0.5], t0: 8.9, no: '03', en: 'CROWD, WHITE STAR OFFICES', id2: 'LC-B2- 2391-19' },
  { it: IT.tribune, at: [-0.5, -0.5], t0: HIT.trib - 1.0, no: '04', en: 'NEW-YORK TRIBUNE · 16 APR 1912', id2: 'LCCN sn83030214' },
  { it: IT.medford, at: [-0.5, -0.5], t0: HIT.med - 1.2, no: '05', en: 'MEDFORD MAIL TRIBUNE · 16 APR 1912', id2: 'LCCN sn97071090' },
  { it: IT.boats, at: [-0.5, -0.5], t0: HIT.drop3 - 1.2, no: '06', en: 'LIFEBOATS ON WAY TO CARPATHIA', id2: 'LC-B2- 2485-4' },
  { it: IT.surv, at: [-0.5, -0.5], t0: HIT.drop3 - 1.0, no: '07', en: 'SURVIVORS ON CARPATHIA', id2: 'LC-B2- 2485-2' },
];
function tableTags(c, t, st) {
  const cam = st.cam;
  for (const g of TAGS) {
    const a = eo(seg(t, g.t0, g.t0 + 0.5)) * (1 - seg(t, HIT.index + 0.2, HIT.index + 0.7));
    if (a <= 0) continue;
    const corner = toW(g.it, [g.it.size[0] * (0.5 + g.at[0]), g.it.size[1] * (0.5 + g.at[1])]);
    const p = w2s([corner[0], corner[1]], cam);
    c.save(); c.translate(p[0], p[1]); c.rotate(cam.th + g.it.r * Math.PI / 180);
    const sc = clamp(cam.z / 0.3, 0.5, 1.4); c.scale(sc, sc); c.globalAlpha = a;
    text(c, null, g.no, 0, -18, '500 24px PM', ORANGE);
    text(c, null, g.en, 42, -18, '500 22px PS', INK);
    text(c, null, g.id2, 42, -46, '400 18px PM', 'rgba(21,23,26,0.65)');
    c.restore();
  }
}

function card(c, x, y, w, h, k, rows) {               // a dark reading plate wiped in from the left
  if (k <= 0) return;
  c.save(); wipe(c, x - 4, y - 4, w + 8, h + 8, eo(k)); plate(c, x, y, w, h, 1.1); rows(); c.restore();
}

function overlay(t, st) {
  const c = ov; TXT = [];
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H);
  if (t < 0.5) { subtitles(c, t); return; }
  const cam = st.cam, lensClip = () => { if (st.on && st.A > 0.5) { c.beginPath(); c.rect(0, 0, W, H); c.arc(st.ls[0], st.ls[1], st.R * 1.31, 0, Math.PI * 2, true); c.clip('evenodd'); } };

  // ---- table layer (hidden under the loupe)
  c.save(); lensClip(); tableTags(c, t, st);
  const atW = (it, p) => w2s(toW(it, p), cam);
  // persistent ring on the Union's "NO LIVES LOST" after the first dive
  if (t > HIT.lift1 && t < HIT.index + 0.6) {
    const k = eo(seg(t, HIT.lift1, HIT.lift1 + 0.45)), a = atW(IT.union, mid(U_LOST));
    c.save(); c.translate(a[0], a[1]); c.rotate(cam.th + IT.union.r * Math.PI / 180); c.scale(1, 0.32);
    ring(c, [0, 0], (U_LOST[2] - U_LOST[0]) * 0.62 * IT.union.k * cam.z, k, 2.4 / 0.6); c.restore();
  }
  // the turn: "already sunk" pinned to the Union's date line
  const sk = seg(t, HIT.sank - 0.2, HIT.sank + 0.3) * (1 - seg(t, HIT.trib - 1.2, HIT.trib - 0.7));
  if (sk > 0) {
    const a = atW(IT.union, [U_DATE[0], U_DATE[3] + 8]), b2 = atW(IT.union, [U_DATE[2], U_DATE[3] + 8]);
    c.save(); c.globalAlpha = Math.min(1, sk * 2); underline(c, a, b2, eo(sk), 3);
    const an = atW(IT.union, [1180, 280]), top = [an[0], an[1] - 150 * eo(sk)];
    c.strokeStyle = ORANGE; c.lineWidth = 2; c.beginPath(); c.moveTo(an[0], an[1]); c.lineTo(top[0], top[1]); c.stroke(); dot(c, an, 4);
    const k2 = seg(t, HIT.sank + 0.25, HIT.sank + 0.8);
    card(c, 150, 260, 780, 250, k2, () => {
      text(c, 'sank-a', 'PRINTED · MONDAY EVENING, 15 APRIL', 182, 312, '500 24px PM', 'rgba(250,250,247,0.75)');
      text(c, 'sank-b', 'ALREADY SUNK', 182, 398, '500 74px PM', ORANGE);
      text(c, 'sank-c', 'before dawn, 15 April 1912', 182, 446, '400 30px PS', 'rgba(250,250,247,0.95)');
      text(c, 'sank-d', 'NARA: sank < 3 h after the 11:40 p.m. sighting, 14 April', 182, 486, '400 19px PM', 'rgba(250,250,247,0.6)', { pass: true });
    });
    c.restore();
  }
  // the count: the Tribune and the Medford lines, read at table level
  const readLine = (it, L, N, t0, tOut) => {
    const k = eio(seg(t, t0, t0 + 0.9)), out = 1 - seg(t, tOut, tOut + 0.4); if (k <= 0 || out <= 0) return;
    c.save(); c.globalAlpha = out;
    underline(c, atW(it, [L[0], L[3] + 14]), atW(it, [lerp(L[0], L[2], k), L[3] + 14]), 1, 3.2);
    const rk = eo(seg(t, t0 + 0.2, t0 + 0.6)), nc = atW(it, mid(N));
    c.save(); c.translate(nc[0], nc[1]); c.rotate(cam.th + it.r * Math.PI / 180); c.scale(1, 0.55);
    ring(c, [0, 0], (N[2] - N[0]) * 0.66 * it.k * cam.z, rk, 2.6 / 0.75); c.restore();
    c.restore();
  };
  readLine(IT.tribune, T_LINE, T_NUM, HIT.trib, HIT.med - 1.4);
  readLine(IT.medford, M_LINE, M_NUM, HIT.med, HIT.drop3 - 1.0);
  c.restore();

  // the count card: 0 -> 1,340 -> 1,492 (screen-anchored, upper third)
  const ca = seg(t, HIT.trib + 0.3, HIT.trib + 0.8) * (1 - seg(t, HIT.drop3 - 0.2, HIT.drop3 + 0.3));
  if (ca > 0) {
    const n1 = seg(t, HIT.trib + 1.4, HIT.trib + 2.2), n2 = seg(t, HIT.med + 1.7, HIT.med + 2.3);
    const val = Math.round(n2 > 0 ? lerp(1340, 1492, eio(n2)) : lerp(0, 1340, eio(n1)));
    const src = n2 > 0 ? 'Medford Mail Tribune · 16 Apr: "1492 LIVES LOST"' : 'New-York Tribune · 16 Apr: "1,340 PERISH"';
    c.save(); c.globalAlpha = 1;
    card(c, 150, 250, 780, 250, ca, () => {
      text(c, 'cnt-a', 'DEAD, AS PRINTED', 182, 302, '500 24px PM', 'rgba(250,250,247,0.75)');
      text(c, null, val.toLocaleString('en-US'), 182, 410, '500 112px PM', ORANGE);
      if (n1 >= 1 && (n2 <= 0 || n2 >= 1)) TXT.push({ id: 'cnt-n', text: val.toLocaleString('en-US'), x0: 182, y0: 325, x1: 182 + tw(c, val.toLocaleString('en-US'), '500 112px PM'), y1: 412 });
      text(c, 'cnt-c', 'Mon 15 Apr: 0  →  Tue 16 Apr', 182, 454, '400 26px PS', 'rgba(250,250,247,0.92)');
      text(c, 'cnt-d', src, 182, 486, '400 18px PM', 'rgba(250,250,247,0.6)', { pass: true });
    });
    c.restore();
  }

  // ---- loupe readouts (screen space, beside the loupe) for the two negatives
  for (const [dv, td, tdv, tout] of [[D2, HIT.drop2, HIT.develop, HIT.dive2], [D3, HIT.drop3, HIT.develop3, HIT.dive3]]) {
    if (!(st.on && st.A > 0.3 && st.dive === dv)) continue;
    const la = seg(t, td + 0.05, td + 0.4) * (1 - ss(seg(t, tout + 0.3, tout + 0.7)));
    if (la <= 0) continue;
    const ang = -0.9, r0 = st.R * 1.34, r1 = r0 + 60;
    const a = [st.ls[0] + Math.cos(ang) * r0, st.ls[1] + Math.sin(ang) * r0], b2 = [st.ls[0] + Math.cos(ang) * r1, st.ls[1] + Math.sin(ang) * r1];
    const left = b2[0] > W - 300;
    c.save(); c.globalAlpha = la; c.strokeStyle = ORANGE; c.lineWidth = 2; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b2[0], b2[1]); c.lineTo(b2[0] + (left ? -46 : 46), b2[1]); c.stroke();
    const tx = left ? b2[0] - 58 : b2[0] + 58, al = left ? 'right' : 'left';
    text(c, null, '×2.5', tx, b2[1] + 10, '500 30px PM', ORANGE, { align: al });
    const d1 = seg(t, tdv, tdv + 0.3);
    c.globalAlpha = la * (1 - d1); text(c, null, 'NEGATIVE', tx, b2[1] + 44, '400 22px PM', INK, { align: al });
    c.globalAlpha = la * d1; text(c, null, 'NEGATIVE → POSITIVE', tx, b2[1] + 44, '400 22px PM', INK, { align: al });
    c.restore();
  }

  // ---- dive 1: the Union, read line by line; 0 lifts out
  if (st.dive === D1 && t > HIT.dive1 + 0.9) {
    const fade = 1 - seg(t, HIT.rise1 + 0.1, HIT.rise1 + 0.5);
    c.save(); c.globalAlpha = fade;
    for (const [bx, t0] of [[U_DATE, HIT.lineDate], [U_AFLOAT, HIT.lineAfloat], [U_LOST, HIT.lineLost]]) {
      const k = sweep(t, t0); if (k <= 0) continue;
      underline(c, int2s(toW(IT.union, [bx[0], bx[3] + 8]), 0, st, 0), int2s(toW(IT.union, [lerp(bx[0], bx[2], k), bx[3] + 8]), 0, st, 0), 1, 3);
    }
    c.restore();
  }
  const r0 = seg(t, HIT.pull0, HIT.pull0 + 0.45), out0 = seg(t, HIT.lift1 + 1.3, HIT.lift1 + 1.7);
  if (r0 > 0 && out0 < 1) {
    c.save(); c.globalAlpha = 1 - out0;
    card(c, 150, 250, 780, 250, seg(t, HIT.pull0 + 0.1, HIT.pull0 + 0.6), () => {
      text(c, 'r0-a', 'LIVES LOST, AS PRINTED', 182, 302, '500 24px PM', 'rgba(250,250,247,0.75)');
      text(c, 'r0-b', '0', 182, 410, '500 112px PM', ORANGE);
      text(c, 'r0-c', '"TITANIC AFLOAT, NO LIVES LOST"', 262, 400, '400 26px PM', 'rgba(250,250,247,0.92)');
      text(c, 'r0-d', 'The New Haven Union · Monday evening, 15 April 1912', 182, 470, '400 19px PM', 'rgba(250,250,247,0.6)', { pass: true });
    });
    c.restore();
  }

  // ---- dive 2: inside the White Star office photograph
  if (st.dive === D2 && st.enter > 0.5) {
    const p = int2s(toW(IT.news, DOOR), nNews(DOOR), st, NF_NEWS);
    annot(c, t, HIT.crowdLbl, 'door', p, 150, 'left', [
      ['600 40px SF', 'rgba(250,250,247,0.97)', 'White Star Line office'],
      ['400 26px PS', 'rgba(250,250,247,0.9)', 'New York · April 1912'],
    ], HIT.rise2 + 0.8, true);
    credit(c, t, HIT.crowdLbl + 0.5, HIT.rise2, 'Bain News Service', 'LC-B2- 2391-30', true);
  }

  // ---- dive 3: inside the lifeboat photograph
  if (st.dive === D3 && st.enter > 0.5) {
    for (const [bp, t0, id, al] of [[BOAT_A, HIT.boatLbl, 'boatA', 'left'], [BOAT_B, HIT.boatLbl + 0.4, 'boatB', 'right']]) {
      const p = int2s(toW(IT.boats, bp), nBoats(bp), st, NF_BOATS);
      annot(c, t, t0, id, p, 120, al, [['500 30px PS', 'rgba(250,250,247,0.97)', 'LIFEBOAT']], HIT.rise3 + 0.2, true);
    }
    const k = seg(t, HIT.count706, HIT.count706 + 0.5) * (1 - seg(t, HIT.rise3, HIT.rise3 + 0.4));
    card(c, 150, 250, 780, 250, k, () => {
      text(c, 'b-a', 'PICKED UP BY THE CARPATHIA', 182, 302, '500 24px PM', 'rgba(250,250,247,0.75)');
      text(c, null, String(Math.round(706 * eio(seg(t, HIT.count706 + 0.2, HIT.count706 + 1.2)))), 182, 410, '500 112px PM', ORANGE);
      if (t > HIT.count706 + 1.2) TXT.push({ id: 'b-n', text: '706', x0: 182, y0: 325, x1: 400, y1: 412 });
      text(c, 'b-c', 'from the lifeboats, morning of 15 April', 182, 454, '400 26px PS', 'rgba(250,250,247,0.92)');
      text(c, 'b-d', 'NARA, Prologue (2012)', 182, 486, '400 18px PM', 'rgba(250,250,247,0.6)', { pass: true });
    });
    credit(c, t, HIT.boatLbl + 0.6, HIT.rise3, 'Bain News Service', 'LC-B2- 2485-4', true);
  }

  if (t > HIT.compare - 0.1 && t < HIT.index + 0.5) compare(c, t);
  if (t > HIT.index - 0.1) indexPanel(c, t, st);
  if (t > HIT.endCard - 0.1) endCard(c, t);
  subtitles(c, t);
}
const sweep = (t, t0) => eio(seg(t, t0, t0 + 1.0));
function credit(c, t, t0, tOut, a, b, light = false) {
  const k = seg(t, t0, t0 + 0.5) * (1 - seg(t, tOut, tOut + 0.4)); if (k <= 0) return;
  c.save(); c.globalAlpha = k; wipe(c, 60, 1250, 980, 80, eo(k));
  const col = light ? 'rgba(250,250,247,0.9)' : 'rgba(21,23,26,0.85)', col2 = light ? 'rgba(250,250,247,0.65)' : 'rgba(21,23,26,0.6)';
  if (light) plate(c, 60, 1262, 40 + tw(c, a, '400 24px PS') + 24 + tw(c, b, '400 20px PM'), 50, 0.9);
  text(c, 'credit', a, 80, 1296, '400 24px PS', col);
  text(c, 'credit-id', b, 80 + tw(c, a, '400 24px PS') + 24, 1296, '400 20px PM', col2);
  c.restore();
}
function annot(c, t, t0, id, a, rise, align, lines, tOut, dark = false) {
  const k = seg(t, t0, t0 + 0.45), out = seg(t, tOut, tOut + 0.3); if (k <= 0 || out >= 1) return;
  c.save(); c.globalAlpha = 1 - out;
  const lineCol = dark ? 'rgba(250,250,247,0.95)' : INK;
  const pr = 9 * eo(seg(t, t0, t0 + 0.25)); ring(c, a, pr, 1, 2); dot(c, a, 3);
  const b = [a[0], a[1] - rise], lk = eo(seg(t, t0 + 0.08, t0 + 0.4));
  c.strokeStyle = lineCol; c.lineWidth = 1.6; c.beginPath(); c.moveTo(a[0], a[1] - pr); c.lineTo(a[0], lerp(a[1] - pr, b[1], lk)); c.stroke();
  if (lk >= 1) { c.beginPath(); c.moveTo(b[0], b[1]); c.lineTo(b[0] + (align === 'left' ? 34 : -34) * eo(seg(t, t0 + 0.4, t0 + 0.6)), b[1]); c.stroke(); }
  const tk = eo(seg(t, t0 + 0.35, t0 + 0.85));
  if (tk > 0) {
    let y = b[1] - 16; const blocks = [];
    for (let i = lines.length - 1; i >= 0; i--) { const [fnt, col, s] = lines[i]; c.font = fnt; blocks.push([fnt, col, s, y, c.measureText(s).width]); y -= (i > 0 ? parseFloat(lines[i - 1][0].split(' ')[1]) : 30) * 1.05 + 10; }
    const top = y, wmax = Math.max(...blocks.map(q => q[4]));
    if (dark) { c.save(); c.globalAlpha *= tk; plate(c, align === 'left' ? b[0] - 14 : b[0] - wmax - 14, top - 8, wmax + 28, b[1] - top, 1); c.restore(); }
    c.beginPath(); align === 'left' ? c.rect(b[0] - 14, top - 40, (wmax + 30) * tk, b[1] - top + 40) : c.rect(b[0] + 14 - (wmax + 30) * tk, top - 40, (wmax + 30) * tk, b[1] - top + 40); c.clip();
    blocks.forEach(([fnt, col, s, yy, ww], j) => text(c, `${id}${j}`, s, align === 'left' ? b[0] : b[0] - ww, yy, fnt, col, { alpha: tk >= 1 ? 1 - out : 0 }));
  }
  c.restore();
}

// the verdict: both records in frame and still, then 0 is struck
let UN_IMG = null;
function compare(c, t) {
  const a = eo(seg(t, HIT.compare - 0.1, HIT.compare + 0.4)) * (1 - seg(t, HIT.index + 0.18, HIT.index + 0.45));
  if (a <= 0) return;
  c.save(); c.globalAlpha = a;
  const x = 90, w = 900, y1 = 330, h1 = 380, y2 = y1 + h1 + 36, h2 = 400;
  plate(c, x, y1, w, h1, 1.2);
  text(c, 'c1a', 'THE NEW HAVEN UNION · 15 APR 1912', x + 32, y1 + 50, '500 24px PM', 'rgba(250,250,247,0.8)');
  if (UN_IMG) { c.save(); c.filter = 'invert(1) grayscale(1) contrast(1.1)'; c.globalAlpha = a * 0.92; c.drawImage(UN_IMG, 100, 330, 640, 270, x + 32, y1 + 74, 380, 160); c.restore(); }
  text(c, 'c1b', '0', x + 32, y1 + 340, '500 120px PM', 'rgba(250,250,247,0.97)');
  text(c, 'c1c', 'lives lost', x + 130, y1 + 336, '400 34px PS', 'rgba(250,250,247,0.9)');
  plate(c, x, y2, w, h2, 1.2);
  text(c, 'c2a', 'NATIONAL ARCHIVES · THE RECORD', x + 32, y2 + 50, '500 24px PM', 'rgba(250,250,247,0.8)');
  text(c, 'c2e', '"Of the 2,223 people aboard,', x + 32, y2 + 110, '400 30px PM', 'rgba(250,250,247,0.88)');
  text(c, 'c2f', '1,517 perished."', x + 32, y2 + 150, '400 30px PM', 'rgba(250,250,247,0.88)');
  text(c, 'c2b', '1,517', x + 32, y2 + 326, '500 120px PM', ORANGE);
  text(c, 'c2c', 'died', x + 412, y2 + 322, '400 34px PS', 'rgba(250,250,247,0.9)');
  text(c, 'c2d', 'NARA, Prologue, Spring 2012', x + 32, y2 + 372, '400 19px PM', 'rgba(250,250,247,0.6)', { pass: true });
  const v = seg(t, HIT.verdict, HIT.verdict + 0.35);
  if (v > 0) { c.strokeStyle = ORANGE; c.lineWidth = 8; c.beginPath(); c.moveTo(x + 20, y1 + 312); c.lineTo(x + 20 + 300 * eo(v), y1 + 312 - 44 * eo(v)); c.stroke(); }
  c.restore();
}

// the index: every item's tag flies from the table into one list
const ROWS = [
  ['01', 'The New Haven Union', '15 Apr 1912', '0 lost', 'LCCN sn92051126', IT.union, true],
  ['02', 'White Star office, N.Y.', 'Apr 1912', 'photo', 'LC-B2- 2391-30', IT.news, false],
  ['04', 'New-York Tribune', '16 Apr 1912', '1,340', 'LCCN sn83030214', IT.tribune, false],
  ['05', 'Medford Mail Tribune', '16 Apr 1912', '1,492', 'LCCN sn97071090', IT.medford, false],
  ['06', 'Lifeboats to Carpathia', 'Apr 1912', '706 saved', 'LC-B2- 2485-4', IT.boats, false],
];
function indexPanel(c, t, st) {
  const x0 = 120, y0 = 300, rw = 840, rh = 104;
  const pa = eo(seg(t, HIT.index, HIT.index + 0.5));
  c.save(); c.globalAlpha = pa;
  const arrived = ROWS.reduce((acc, r, i) => acc + eio(seg(t, HIT.index + 0.2 + i * 0.15, HIT.index + 0.65 + i * 0.15)), 0);
  plate(c, x0 - 32, y0 - 34, rw + 64, 84 + arrived * rh + 20 * Math.min(1, arrived), 1.2);
  text(c, 'ix-h', 'Archive index', x0, y0 + 22, '600 36px SF', 'rgba(250,250,247,0.97)');
  text(c, 'ix-h2', 'TITANIC · APRIL 1912', x0 + 270, y0 + 18, '500 20px PM', ORANGE);
  c.restore();
  ROWS.forEach((r, i) => {
    const t0 = HIT.index + 0.2 + i * 0.15, k = eio(seg(t, t0, t0 + 0.45)); if (k <= 0) return;
    const from = w2s(centre(r[5]), st.cam), to = [x0, y0 + 80 + i * rh];
    const p = lerp2(from, to, k);
    c.save(); c.globalAlpha = Math.min(1, k * 2);
    c.strokeStyle = 'rgba(250,250,247,0.18)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, to[1] - 26); c.lineTo(x0 + rw, to[1] - 26); c.stroke();
    const done = k >= 1 ? 1 : 0;
    text(c, done ? `ix${i}a` : null, r[0], p[0], p[1] + 14, '500 22px PM', ORANGE);
    text(c, done ? `ix${i}b` : null, r[1], p[0] + 50, p[1] + 14, '500 28px PS', 'rgba(250,250,247,0.97)');
    text(c, done ? `ix${i}c` : null, r[2], p[0] + 50, p[1] + 50, '400 19px PM', 'rgba(250,250,247,0.65)');
    text(c, done ? `ix${i}e` : null, r[4], p[0] + 250, p[1] + 50, '400 17px PM', 'rgba(250,250,247,0.5)');
    text(c, done ? `ix${i}d` : null, r[3], p[0] + rw, p[1] + 14, '500 28px PS', r[6] ? 'rgba(250,250,247,0.55)' : ORANGE, { align: 'right' });
    if (r[6] && done) { const sk = eo(seg(t, t0 + 0.6, t0 + 0.9)), ww = tw(c, r[3], '500 28px PS'); c.strokeStyle = ORANGE; c.lineWidth = 3; c.beginPath(); c.moveTo(p[0] + rw - ww - 4, p[1] + 4); c.lineTo(p[0] + rw - ww - 4 + (ww + 8) * sk, p[1] + 4); c.stroke(); }
    c.restore();
  });
}
function endCard(c, t) {
  const k = eo(seg(t, HIT.endCard, HIT.endCard + 0.6)); if (k <= 0) return;
  const x = 120, y = 1000;
  c.save(); c.globalAlpha = k; wipe(c, x - 40, y - 100, 920, 330, k);
  plate(c, x - 32, y - 92, 904, 312, 1.2);
  text(c, 'end-a', 'No Lives Lost', x, y, '600 80px SF', 'rgba(250,250,247,0.98)');
  text(c, 'end-b', 'The Titanic, April 1912', x, y + 52, '400 32px PS', 'rgba(250,250,247,0.9)');
  c.fillStyle = ORANGE; c.fillRect(x, y + 76, 760, 2);
  text(c, 'end-c', 'Library of Congress: Chronicling America;', x, y + 120, '400 22px PS', 'rgba(250,250,247,0.75)');
  text(c, 'end-d', 'Bain News Service negatives · National Archives', x, y + 152, '400 22px PS', 'rgba(250,250,247,0.75)');
  text(c, 'end-e', 'Piano: Salamander Grand Piano V3 (Alexander Holm, CC BY 3.0)', x, y + 190, '400 18px PS', 'rgba(250,250,247,0.6)', { pass: true });
  c.restore();
}

// ---------------- page contract ----------------
function setU(st, t) {
  const cam = st.cam;
  gl.uniform2f(U('uCam'), ...cam.c); gl.uniform1f(U('uZ'), cam.z); gl.uniform1f(U('uRot'), cam.th); gl.uniform1f(U('uT'), t);
  const fl = t < 0.17 ? 0.0 : t < 0.3 ? 0.55 : t < 0.42 ? 0.08 : t < 0.55 ? 0.8 : t < HIT.lightOn ? 0.45 : 1.0;
  gl.uniform1f(U('uLight'), fl);
  gl.uniform2f(U('uLensC'), ...st.ls); gl.uniform1f(U('uLensR'), st.R); gl.uniform1f(U('uLensOn'), st.on); gl.uniform1f(U('uLensA'), st.A); gl.uniform1f(U('uLift'), st.lift);
  gl.uniform2f(U('uIntC'), ...st.ic); gl.uniform1f(U('uS'), st.S); gl.uniform1f(U('uK'), st.k); gl.uniform1f(U('uDev'), st.dev);
  gl.uniform1f(U('uEnter'), st.enter); gl.uniform1f(U('uDz'), st.dz); gl.uniform1f(U('uMode'), st.mode);
  gl.uniform2f(U('uSh'), ...st.sh);
  gl.uniform3f(U('uUnLit'), sweep(t, HIT.lineDate), sweep(t, HIT.lineAfloat), sweep(t, HIT.lineLost));
  gl.uniform1f(U('uUnDim'), ss(seg(t, HIT.dive1 + 0.6, HIT.dive1 + 1.3)) * (1 - ss(seg(t, HIT.lift1 + 0.2, HIT.lift1 + 1.0))));
  gl.uniform1f(U('uTrLit'), eio(seg(t, HIT.trib, HIT.trib + 0.9)));
  gl.uniform1f(U('uTrDim'), ss(seg(t, HIT.trib - 0.3, HIT.trib + 0.3)) * (1 - ss(seg(t, HIT.med - 1.0, HIT.med - 0.3))));
  gl.uniform1f(U('uMeLit'), eio(seg(t, HIT.med, HIT.med + 0.9)));
  gl.uniform1f(U('uMeDim'), ss(seg(t, HIT.med - 0.3, HIT.med + 0.3)) * (1 - ss(seg(t, HIT.drop3 - 1.4, HIT.drop3 - 0.6))));
  gl.uniform1f(U('uSceneDim'), 0.45 * ss(seg(t, HIT.compare - 0.2, HIT.compare + 0.4)) * (1 - ss(seg(t, HIT.index - 0.2, HIT.index + 0.4))) + 0.35 * ss(seg(t, HIT.index, HIT.index + 0.5)));
}
window.DUR = DUR;
window.render = t => {
  const st = shot(t);
  gl.viewport(0, 0, W, H); setU(st, t);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  overlay(t, st);
  gl.finish();
};
window.TEXTS = t => { window.render(t); return TXT; };
async function load() {
  for (const fnt of ['400 20px PM', '500 20px PM', '400 20px PS', '500 20px PS', '600 20px SF']) await document.fonts.load(fnt);
  const files = ['union.jpg', 'tribune.jpg', 'medford.jpg', 'n_news.jpg', 'n_news_mask.png', 'n_crowd.jpg', 'n_crowd_mask.png', 'n_boats.jpg', 'n_boats_mask.png', 'n_surv.jpg', 'n_surv_mask.png'];
  const samp = ['tUn', 'tTr', 'tMe', 'tNw', 'tNwm', 'tCr', 'tCrm', 'tBo', 'tBom', 'tSu', 'tSum'];
  const ims = await Promise.all(files.map(n => img('assets/tex/' + n)));
  ims.forEach((im, i) => { tex(i, im); gl.uniform1i(U(samp[i]), i); });
  UN_IMG = ims[0];
  gl.uniform4f(U('uUn'), ...itU(IT.union)); gl.uniform4f(U('uTr'), ...itU(IT.tribune)); gl.uniform4f(U('uMe'), ...itU(IT.medford));
  gl.uniform4f(U('uNw'), ...itU(IT.news)); gl.uniform4f(U('uCr'), ...itU(IT.crowd)); gl.uniform4f(U('uBo'), ...itU(IT.boats)); gl.uniform4f(U('uSu'), ...itU(IT.surv));
  try { const r = await fetch('out/cues.json'); if (r.ok) CUES = await r.json(); } catch {}
  window.SUBCHECK_CUES = CUES;
}
load().then(() => { window.render(0); window.READY = true; });
