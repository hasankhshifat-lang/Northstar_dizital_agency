// chars.js — the Scientific Bithi cast redrawn in the Sci-Fi Sitcom Toon grammar:
// thick constant-width boiling ink, flat fills + one hard shadow shape per form, big white eyes with tiny pupils,
// parametric elastic mouths, noodle limbs. Designs follow the channel's characters (kit/chars) — মন্টু মামা, বিথী, বল্টু —
// and the Newton cameo rig (long grey wig, brown coat, white cravat). Origin at the feet, y down.
import { clamp, lerp, hash, TAU } from '/core/lib.js';
import { INK, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, noodle, quad, dot, text } from './toon.js';

export const PAL = {
  white: '#ffffff', mouthIn: '#4a1a2a', tongue: '#e8637a',
  skinM: '#c98a5a', skinMs: '#a86b40', skinB: '#c68a5e', skinBs: '#a56a40', skinT: '#d39a6c', skinTs: '#b07a4e', skinN: '#f0cfae', skinNs: '#d4ab86',
  kurta: '#f5b81c', kurtaS: '#d6950b', gam: '#d8343c', gamS: '#a61f2a', lungiR: '#d23a3f', lungiG: '#2f9b55',
  shirt: '#fbfbf6', shirtS: '#d9d9cf', sash: '#2b67c9', sashS: '#1f4c99', skirt: '#24459a', skirtS: '#17306e', hair: '#1d1a24',
  stripeY: '#f7c52a', stripeR: '#e2453a', shorts: '#c9a874', shortsS: '#a3844f', frame: '#e0a24a', lens: '#f4fbff', eyeLine: '#8a6a58',
  coat: '#7a4a28', coatS: '#5a3418', wig: '#d9d9de', wigS: '#a9a9b2', stock: '#f4f1ea', shoe: '#2a2230', sandal: '#8a5a2b',
};

// —— face parts (the style's parametric eye and mouth) ——
export function eye(cx, cy, rx, ry, { lid = 0, look = [0, 0], pupil = 4.5, skin = PAL.skinM, closed = false, lw = 3, jitter = 0, line = PAL.eyeLine } = {}) {
  if (closed) { stroke(arc(cx, cy + ry * .15, rx * .8, ry * .45, Math.PI * .1, Math.PI * .9, 14), lw, { line }); return; }
  shape(ell(cx, cy, rx, ry, 36), {
    fill: PAL.white, lw, line, shade: () => {
      dot(cx + look[0] * rx * .55 + jitter, cy + look[1] * ry * .5, pupil);
      if (lid > 0) {
        const yl = cy - ry + lid * 2 * ry;
        fillOnly([[cx - rx * 1.3, cy - ry * 1.4], [cx + rx * 1.3, cy - ry * 1.4], [cx + rx * 1.3, yl], [cx - rx * 1.3, yl + ry * .08]], skin, { boil: .5 });
        stroke([[cx - rx * 1.2, yl + ry * .08], [cx + rx * 1.2, yl]], lw, { line });
      }
    }
  });
}
export function mouth(cx, cy, mw, { o = 0, w = 1, sm = 0, skew = 0, lw = 6, teeth = true } = {}) {
  const hw = mw * w / 2, k = mw * .22, lc = [cx - hw, cy - sm * k + skew * k], rc = [cx + hw, cy - sm * k - skew * k];
  if (o < .07) { stroke(quad(lc, [cx, cy + sm * k * 1.2], rc, 12), lw); return; }
  const h = o * mw * .62;
  const P = [...quad(lc, [cx, cy - h * .25 + sm * k * .4], rc, 12), ...quad(rc, [cx, cy + h + sm * k * .6], lc, 14)];
  shape(P, {
    fill: PAL.mouthIn, lw, shade: () => {
      if (teeth && o > .22) fillOnly(rect(cx - hw * 1.2, cy - h, hw * 2.4, h * .3 + 6), PAL.white, { boil: .3 });
      fillOnly(ell(cx + hw * .15, cy + h * .95, hw * .6, h * .45, 20), PAL.tongue, { boil: .3 });
    }
  });
}
export function hand(x, y, ang, r = 18, col = PAL.skinM, { fist = false, lw = 6 } = {}) {
  push(); translate(x, y); rotate(ang);
  const pts = fist ? spline([[-r * .6, -r * .8], [r * .7, -r * .9], [r * 1.1, -r * .1], [r * .8, r * .8], [-r * .5, r * .9], [-r * .9, 0]])
    : spline([[-r * .5, -r * .85], [r * .5, -r * 1.05], [r * 1.35, -r * .75], [r * 1.05, -r * .3], [r * 1.5, -r * .1], [r * 1.1, r * .3], [r * 1.35, r * .7], [r * .6, r * .95], [-r * .6, r * .8], [-r * .95, 0]]);
  shape(pts, { fill: col, lw }); pop();
}
export const sweat = (x, y, s = 1) => shape(spline([[x, y - 16 * s], [x + 9 * s, y + 4 * s], [x, y + 12 * s], [x - 9 * s, y + 4 * s]]), { fill: '#bfe9ff', lw: 5 });

// —— props ——
export function pumpkin(x, y, s = 1, { rot = 0 } = {}) {   // (x, y) = centre
  push(); translate(x, y); rotate(rot); scale(s);
  const R = 62;
  shape(spline([[0, -R * .78], [R * .75, -R * .72], [R * 1.08, 0], [R * .8, R * .76], [0, R * .82], [-R * .8, R * .76], [-R * 1.08, 0], [-R * .75, -R * .72]]), {
    fill: '#f08a24', lw: 7, shade: () => { fillOnly(ell(R * .45, R * .2, R * .7, R * .85, 24), '#c96512', { boil: .3 }); fillOnly(ell(-R * .5, -R * .3, R * .14, R * .22, 12), '#ffc073', { boil: .2 }); }
  });
  for (const k of [-.5, 0, .5]) stroke(spline([[k * R * .9, -R * .7], [k * R * 1.25, 0], [k * R * .9, R * .74]], false), 5);
  shape(spline([[-8, -R * .7], [8, -R * .72], [12, -R * 1.05], [-2, -R * 1.12]]), { fill: '#4f8a2b', lw: 6 });
  pop();
}
export function lemon(x, y, s = 1, { rot = 0 } = {}) {
  push(); translate(x, y); rotate(rot); scale(s);
  shape(spline([[-26, 0], [-16, -17], [12, -18], [27, -4], [33, 0], [27, 5], [12, 18], [-16, 17]]), { fill: '#d8e23a', lw: 6, shade: () => fillOnly(ell(8, 8, 20, 12, 16), '#a9b51c', { boil: .3 }) });
  shape(ell(-31, 0, 6, 5, 10), { fill: '#d8e23a', lw: 5 });
  pop();
}
export function stool(x, y, s = 1) {   // মোড়া, (x,y) = floor centre
  push(); translate(x, y); scale(s);
  const P = [[-64, -120], [64, -120], [40, -60], [64, 0], [-64, 0], [-40, -60]];
  shape(P, { fill: '#c9954f', lw: 7, shade: () => { fillOnly([[10, -130], [70, -130], [48, -60], [70, 10], [10, 10]], '#a8742f', { boil: .3 }); for (let k = -3; k <= 3; k++) { stroke([[k * 18 - 40, -120], [k * 18 + 40, 0]], 3.5, { line: '#7e5520' }); stroke([[k * 18 + 40, -120], [k * 18 - 40, 0]], 3.5, { line: '#7e5520' }); } } });
  shape(ell(0, -120, 64, 14, 30), { fill: '#d9a862', lw: 7 });
  pop();
}
export function tubBack(x, y, w = 360) { shape(ell(x, y - 52, w / 2, 24, 40), { fill: '#e0c48a', lw: 7, shade: () => fillOnly(ell(x + 30, y - 47, w * .35, 13, 30), '#c9a96a', { boil: .3 }) }); }
export function tubFront(x, y, w = 360) {   // blue plastic গামলা full of sand; front wall drawn over whatever fell in
  shape([...arc(x, y - 52, w / 2, 24, Math.PI, 0, 24), [x + w * .42, y], [x - w * .42, y]], {
    fill: '#2f8fd8', lw: 7, shade: () => { fillOnly(rect(x + w * .12, y - 80, w * .45, 100), '#2370ad', { boil: .3 }); fillOnly(rect(x - w * .38, y - 36, w * .08, 24), '#7ec4f2', { boil: .2 }); }
  });
}

// —— shared person rig ——
// P: {x,y,s,face,lean,bob,sq, look,lid,blink,brow,mouth:{o,w,sm,skew}, armL:{h,bend}, armR, legL, legR, headTilt, turn, sweat, t, nerv}
function arm(sh, a, D, sleeveLen = .45) {
  const hp = [sh[0] + a.h[0], sh[1] + a.h[1]];
  const el = [sh[0] + a.h[0] * sleeveLen, sh[1] + a.h[1] * sleeveLen];
  shape(noodle(sh, hp, a.bend ?? 0, D.armW, D.armW * .85), { fill: D.skin, lw: 6 });
  shape(noodle(sh, el, (a.bend ?? 0) * sleeveLen, D.armW + 12, D.armW + 8), { fill: D.sleeve, lw: 6 });
  hand(hp[0], hp[1], Math.atan2(hp[1] - sh[1], hp[0] - sh[0]), D.handR, D.skin, { fist: !!a.fist });
  return hp;
}
export function person(P, D) {
  const f = P.face ?? 1, ner = P.nerv ?? 0;
  const jit = ner ? (hash(Math.floor((P.t || 0) * 12) * 3.3) - .5) * 6 * ner : 0;
  push(); translate(P.x + jit, P.y + (P.bob || 0)); scale((P.s ?? 1) * f, (P.s ?? 1) * (P.sq ?? 1));
  const legL = P.legL || [0, 0], legR = P.legR || [0, 0];
  D.lower(P, legL, legR);
  push(); rotate(P.lean ?? 0);
  const shB = [-D.shW, -D.shY], shF = [D.shW, -D.shY];
  const armB = P.armL || { h: [-16, D.armL], bend: -14 }, armF = P.armR || { h: [16, D.armL], bend: 14 };
  const hB = arm(shB, armB, D, D.sleeveLen);
  D.torso(P);
  push(); translate(0, -D.headY); rotate(P.headTilt ?? 0); D.head(P); pop();
  const hF = arm(shF, armF, D, D.sleeveLen);
  if (P.holdL) P.holdL(hB); if (P.holdR) P.holdR(hF);
  pop();
  if (P.sweat != null) { const u = P.sweat % 1; sweat(-D.shW - 30, -D.headY - 40 + u * 40, 1); }
  pop();
}
// eyes + brows + mouth common to all faces. turn shifts the features (a hint of 3/4 view)
function face(P, o) {
  const tn = (P.turn ?? 0) * 14, look = P.look || [0, 0];
  const lid = P.blink ? 1 : clamp(P.lid ?? o.lid ?? .1, 0, 1);
  const shake = P.nerv ? (hash(Math.floor((P.t || 0) * 24) * 1.7) - .5) * 3 * P.nerv : 0;
  for (const ex of [-o.ex, o.ex]) {
    if (o.glasses) shape(ell(ex + tn, o.ey, o.er + 10, o.er + 10, 32), { fill: PAL.lens, lw: 3.5, line: PAL.frame });
    eye(ex + tn, o.ey, o.er * (P.eyeS ?? 1), o.er * 1.08 * (P.eyeS ?? 1), { lid, look, pupil: P.pupil ?? o.pupil, skin: o.glasses ? PAL.lens : o.skin, jitter: shake, lw: 2.5 });
    if (o.glasses) { shape(ell(ex + tn, o.ey, o.er + 10, o.er + 10, 32), { line: PAL.frame, lw: 3.5 }); stroke(arc(ex + tn - 8, o.ey - 8, o.er * .55, o.er * .55, Math.PI * 1.1, Math.PI * 1.45, 6), 4, { line: '#fff' }); }
  }
  if (o.glasses) stroke([[-o.ex + o.er + 10 + tn, o.ey], [o.ex - o.er - 10 + tn, o.ey]], 3.5, { line: PAL.frame });
  const br = P.brow ?? 0, by = o.ey - o.er - 16;
  for (const sx of [-1, 1]) stroke([[sx * (o.ex + o.er * .8) + tn, by + 4 - br * 3], [sx * (o.ex - o.er * .5) + tn, by - 4 - br * 9 * (o.worry ? -1 : 1)]], o.browW ?? 7, { line: o.browCol ?? INK });
  // nose
  shape(spline([[tn * 1.3 - 6, o.ey + 8], [tn * 1.3 + 6, o.ey + 8], [tn * 1.3 + 12, o.ey + 34], [tn * 1.3, o.ey + 40], [tn * 1.3 - 12, o.ey + 34]]), { fill: o.skin, lw: 5, shade: () => fillOnly(ell(tn * 1.3 + 6, o.ey + 34, 8, 6, 10), o.skinS, { boil: .3 }) });
  if (o.must) shape(spline([[tn - 46, o.ey + 66], [tn - 30, o.ey + 46], [tn, o.ey + 52], [tn + 30, o.ey + 46], [tn + 46, o.ey + 66], [tn + 26, o.ey + 60], [tn, o.ey + 64], [tn - 26, o.ey + 60]]), { fill: PAL.hair, lw: 5 });
  const m = P.mouth || {};
  mouth(tn, o.ey + (o.must ? 76 : 66), o.mw, { o: m.o || 0, w: m.w ?? 1, sm: m.sm ?? .2, skew: m.skew || 0, lw: 5 });
}

// —— মন্টু মামা: stout, bald top with side hair, thick moustache, yellow kurta, red-check gamchha, checked lungi, sandals
export const MAMA = {
  skin: PAL.skinM, sleeve: PAL.kurta, armW: 26, handR: 19, shW: 74, shY: 318, armL: 150, sleeveLen: .5, headY: 410,
  lower(P, lL, lR) {
    for (const [sx, lg] of [[-1, lL], [1, lR]]) shape(spline([[sx * 22 + lg[0] - 26, 6 + lg[1]], [sx * 22 + lg[0] - 22, -12 + lg[1]], [sx * 22 + lg[0] + 18, -14 + lg[1]], [sx * 22 + lg[0] + 32, 4 + lg[1]]]), { fill: PAL.sandal, lw: 6 });
    for (const [sx, lg] of [[-1, lL], [1, lR]]) shape(noodle([sx * 22, -60], [sx * 22 + lg[0], -12 + lg[1]], 0, 22, 20), { fill: PAL.skinM, lw: 6 });
    shape([[-78, -190], [78, -190], [86, -48], [-86, -48]], { fill: PAL.lungiG, lw: 7, shade: () => {
      for (let k = 0; k < 9; k++) fillOnly(rect(-100 + k * 24, -200, 11, 170), PAL.lungiR, { boil: .2 });
      for (let k = 0; k < 6; k++) fillOnly(rect(-100, -186 + k * 24, 200, 7), '#f2e2c4', { boil: .2 });
      fillOnly(rect(30, -200, 70, 170), 'rgba(0,0,0,.18)', { boil: .2 });
    } });
  },
  torso(P) {
    shape(spline([[0, -342], [70, -330], [96, -260], [100, -180], [80, -150], [0, -146], [-80, -150], [-100, -180], [-96, -260], [-70, -330]]), {
      fill: PAL.kurta, lw: 7, shade: () => { fillOnly(spline([[30, -360], [110, -330], [118, -150], [50, -140], [70, -250]]), PAL.kurtaS, { boil: .4 }); }
    });
    stroke([[0, -340], [0, -250]], 4); for (const yy of [-322, -296, -270]) dot(0, yy, 5, '#7a5a10');
    // gamchha over the left shoulder
    shape([[-78, -336], [-40, -344], [-58, -170], [-92, -176]], { fill: PAL.gam, lw: 6, shade: () => { for (let k = 0; k < 6; k++) fillOnly(rect(-110, -330 + k * 28, 80, 5), '#ffffff', { boil: .2 }); fillOnly(rect(-70, -350, 6, 190), '#ffffff', { boil: .2 }); } });
    shape(noodle([0, -340], [0, -372], 0, 34, 34), { fill: PAL.skinM, lw: 6 });
  },
  head(P) {
    for (const sx of [-1, 1]) shape(ell(sx * 78, -6, 16, 22, 16), { fill: PAL.skinM, lw: 6 });
    shape(spline([[0, -96], [56, -88], [84, -40], [86, 22], [64, 76], [0, 96], [-64, 76], [-86, 22], [-84, -40], [-56, -88]]), {
      fill: PAL.skinM, lw: 7, shade: () => { fillOnly(ell(52, 26, 50, 70, 30), PAL.skinMs, { boil: .3 }); fillOnly(ell(-24, -74, 22, 10, 14), '#e0a77a', { boil: .2 }); }
    });
    for (const sx of [-1, 1]) shape(spline([[sx * 86, -6], [sx * 94, -48], [sx * 70, -78], [sx * 60, -50], [sx * 74, -20]]), { fill: PAL.hair, lw: 6 });
    face(P, { ex: 32, ey: -14, er: 22, pupil: 4.2, mw: 50, must: true, skin: PAL.skinM, skinS: PAL.skinMs, lid: .18, browW: 9 });
  },
};
// —— বিথী: glasses, black hair with headband and two plaits, white shirt, blue sash with a red badge, navy pleated skirt
export const BITHI = {
  skin: PAL.skinT, sleeve: PAL.shirt, armW: 18, handR: 15, shW: 54, shY: 330, armL: 140, sleeveLen: .32, headY: 418,
  lower(P, lL, lR) {
    for (const [sx, lg] of [[-1, lL], [1, lR]]) {
      shape(noodle([sx * 20, -150], [sx * 20 + lg[0], -16 + lg[1]], 0, 20, 18), { fill: PAL.skinT, lw: 6, shade: () => fillOnly(rect(-100, -64 + lg[1], 200, 50), PAL.stock, { boil: .3 }) });
      shape(spline([[sx * 20 + lg[0] - 22, 4 + lg[1]], [sx * 20 + lg[0] - 18, -16 + lg[1]], [sx * 20 + lg[0] + 18, -18 + lg[1]], [sx * 20 + lg[0] + 30, 2 + lg[1]]]), { fill: PAL.shoe, lw: 6 });
    }
    shape([[-62, -236], [62, -236], [88, -132], [-88, -132]], { fill: PAL.skirt, lw: 7, shade: () => { fillOnly([[20, -240], [70, -240], [96, -128], [30, -128]], PAL.skirtS, { boil: .3 }); for (const k of [-.6, -.2, .2, .6]) stroke([[k * 62, -230], [k * 88, -134]], 3.5); } });
  },
  torso(P) {
    shape(spline([[0, -352], [52, -344], [66, -300], [62, -232], [0, -226], [-62, -232], [-66, -300], [-52, -344]]), {
      fill: PAL.shirt, lw: 7, shade: () => {
        fillOnly(spline([[20, -360], [76, -340], [80, -226], [30, -222], [44, -300]]), PAL.shirtS, { boil: .4 });
        fillOnly([[-60, -340], [-40, -352], [64, -238], [42, -226]], PAL.sash, { boil: .3 });
      }
    });
    shape(rr(24, -316, 26, 22, 4), { fill: '#ffffff', lw: 4 }); dot(37, -305, 6, '#d8343c');
    shape([[-20, -356], [0, -340], [-14, -326], [-30, -344]], { fill: PAL.shirt, lw: 5 }); shape([[20, -356], [0, -340], [14, -326], [30, -344]], { fill: PAL.shirt, lw: 5 });
    shape(noodle([0, -350], [0, -376], 0, 24, 24), { fill: PAL.skinT, lw: 6 });
  },
  head(P) {
    for (const sx of [-1, 1]) shape(noodle([sx * 66, -10], [sx * 74, 120], sx * 6, 22, 16), { fill: PAL.hair, lw: 6 });   // plaits
    for (const sx of [-1, 1]) shape(ell(sx * 70, 4, 13, 18, 14), { fill: PAL.skinT, lw: 6 });
    shape(spline([[0, -92], [52, -84], [72, -36], [72, 24], [52, 70], [0, 86], [-52, 70], [-72, 24], [-72, -36], [-52, -84]]), { fill: PAL.skinT, lw: 7, shade: () => fillOnly(ell(44, 24, 40, 60, 24), PAL.skinTs, { boil: .3 }) });
    shape(spline([[-80, 0], [-74, -70], [-30, -104], [30, -104], [74, -70], [80, 0], [62, -40], [20, -66], [-20, -66], [-62, -40]]), { fill: PAL.hair, lw: 6 });
    stroke(arc(0, -36, 70, 62, Math.PI * 1.08, Math.PI * 1.92, 18), 8, { line: '#2b67c9' });   // headband
    face(P, { ex: 28, ey: -4, er: 18, pupil: 3.6, mw: 38, glasses: true, skin: PAL.skinT, skinS: PAL.skinTs, lid: 0, browW: 6 });
    for (const sx of [-1, 1]) fillOnly(ell(sx * 40 + (P.turn ?? 0) * 14, 34, 11, 6, 10), 'rgba(230,110,110,.45)', { boil: .2 });
  },
};
// —— বল্টু: small, spiky hair, round glasses, yellow-red striped T-shirt, khaki shorts, sandals
export const BOLTU = {
  skin: PAL.skinB, sleeve: PAL.stripeY, armW: 17, handR: 14, shW: 52, shY: 236, armL: 100, sleeveLen: .35, headY: 312,
  lower(P, lL, lR) {
    for (const [sx, lg] of [[-1, lL], [1, lR]]) {
      shape(noodle([sx * 22, -96], [sx * 22 + lg[0], -14 + lg[1]], 0, 20, 18), { fill: PAL.skinB, lw: 6 });
      shape(spline([[sx * 22 + lg[0] - 22, 4 + lg[1]], [sx * 22 + lg[0] - 18, -14 + lg[1]], [sx * 22 + lg[0] + 18, -16 + lg[1]], [sx * 22 + lg[0] + 28, 2 + lg[1]]]), { fill: PAL.sandal, lw: 6 });
    }
    shape([[-58, -150], [58, -150], [64, -86], [6, -86], [0, -110], [-6, -86], [-64, -86]], { fill: PAL.shorts, lw: 6, shade: () => fillOnly(rect(20, -160, 60, 80), PAL.shortsS, { boil: .3 }) });
  },
  torso(P) {
    shape(spline([[0, -256], [52, -246], [64, -200], [60, -144], [0, -138], [-60, -144], [-64, -200], [-52, -246]]), {
      fill: PAL.stripeY, lw: 7, shade: () => { for (let k = 0; k < 5; k++) fillOnly(rect(-90, -240 + k * 22, 180, 10), PAL.stripeR, { boil: .2 }); fillOnly(rect(28, -260, 50, 130), 'rgba(0,0,0,.14)', { boil: .2 }); }
    });
    shape(noodle([0, -254], [0, -276], 0, 22, 22), { fill: PAL.skinB, lw: 6 });
  },
  head(P) {
    for (const sx of [-1, 1]) shape(ell(sx * 66, 4, 13, 18, 14), { fill: PAL.skinB, lw: 6 });
    shape(ell(0, 0, 70, 68, 48), { fill: PAL.skinB, lw: 7, shade: () => fillOnly(ell(40, 22, 40, 52, 24), PAL.skinBs, { boil: .3 }) });
    const sp = []; for (let i = 0; i <= 12; i++) { const a = Math.PI * (1.05 + .9 * i / 12), r = i % 2 ? 78 : 102; sp.push([Math.cos(a) * r, Math.sin(a) * r - 16]); }
    shape([[-72, -14], ...sp, [72, -14], [40, -40], [0, -46], [-40, -40]], { fill: PAL.hair, lw: 6 });
    face(P, { ex: 27, ey: 2, er: 18, pupil: 3.4, mw: 34, glasses: true, skin: PAL.skinB, skinS: PAL.skinBs, lid: 0, worry: true, browW: 6 });
  },
};
// —— Isaac Newton cameo: long grey curled wig, brown coat with gold buttons, white cravat, breeches, white stockings
export const NEWTON = {
  skin: PAL.skinN, sleeve: PAL.coat, armW: 20, handR: 16, shW: 64, shY: 336, armL: 150, sleeveLen: .78, headY: 430,
  lower(P, lL, lR) {
    for (const [sx, lg] of [[-1, lL], [1, lR]]) {
      shape(noodle([sx * 24, -120], [sx * 24 + lg[0], -16 + lg[1]], 0, 22, 20), { fill: PAL.stock, lw: 6 });
      shape(spline([[sx * 24 + lg[0] - 24, 4 + lg[1]], [sx * 24 + lg[0] - 20, -16 + lg[1]], [sx * 24 + lg[0] + 20, -18 + lg[1]], [sx * 24 + lg[0] + 32, 2 + lg[1]]]), { fill: PAL.shoe, lw: 6 });
      dot(sx * 24 + lg[0] + 4, -10 + lg[1], 5, '#d9b04a');
    }
  },
  torso(P) {
    shape(spline([[0, -360], [62, -350], [80, -260], [88, -110], [0, -100], [-88, -110], [-80, -260], [-62, -350]]), {
      fill: PAL.coat, lw: 7, shade: () => { fillOnly(spline([[24, -370], [96, -350], [104, -100], [40, -96], [56, -250]]), PAL.coatS, { boil: .4 }); fillOnly(rect(-30, -360, 60, 220), '#8a5a33', { boil: .3 }); }
    });
    for (let k = 0; k < 6; k++) dot(14, -330 + k * 32, 5.5, '#d9b04a');
    stroke([[-30, -350], [-30, -130]], 4); stroke([[30, -350], [30, -130]], 4);
    shape(spline([[-24, -360], [24, -360], [16, -300], [0, -280], [-16, -300]]), { fill: '#ffffff', lw: 5 });   // cravat
    shape(noodle([0, -360], [0, -390], 0, 26, 26), { fill: PAL.skinN, lw: 6 });
  },
  head(P) {
    for (const sx of [-1, 1]) shape(spline([[sx * 50, -80], [sx * 96, -40], [sx * 104, 40], [sx * 96, 120], [sx * 80, 160], [sx * 56, 130], [sx * 60, 40]]), { fill: PAL.wig, lw: 6, shade: () => { fillOnly(ell(sx * 90, 60, 18, 70, 16), PAL.wigS, { boil: .3 }); } });
    shape(spline([[0, -92], [50, -84], [68, -36], [68, 24], [50, 72], [0, 90], [-50, 72], [-68, 24], [-68, -36], [-50, -84]]), { fill: PAL.skinN, lw: 7, shade: () => fillOnly(ell(42, 24, 36, 60, 24), PAL.skinNs, { boil: .3 }) });
    shape(spline([[-74, -20], [-70, -80], [-24, -108], [24, -108], [70, -80], [74, -20], [52, -62], [0, -76], [-52, -62]]), { fill: PAL.wig, lw: 6, shade: () => fillOnly(ell(30, -86, 30, 14, 14), PAL.wigS, { boil: .3 }) });
    for (const k of [-1, 1]) stroke(arc(k * 82, 20 + 0, 14, 14, 0, TAU * .8, 10), 4, { line: PAL.wigS });
    face(P, { ex: 27, ey: -6, er: 18, pupil: 3.6, mw: 40, skin: PAL.skinN, skinS: PAL.skinNs, lid: .42, browW: 6, browCol: '#8a8a94' });
  },
};
export const mama = P => person(P, MAMA), bithi = P => person(P, BITHI), boltu = P => person(P, BOLTU), newton = P => person(P, NEWTON);
