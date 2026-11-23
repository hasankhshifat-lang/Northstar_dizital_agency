"""Assign a role to every extracted part and compute its joints from its shape -> parts/rig.json.
Coordinates are in part-PNG pixels. Limbs: 'pivot' (own joint, near the body), 'end' (attach point for the child),
'ang' (angle of the pivot->end axis, radians, 0 = pointing +x, image coords)."""
import json, os, math
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
idx = json.load(open(os.path.join(HERE, 'parts', 'index.json')))
def mask(sh, i):
    a = np.asarray(Image.open(os.path.join(HERE, 'parts', f'{sh}_{i}.png')).convert('RGBA'))[..., 3] > 128
    return a
def limb(sh, i, near):
    m = mask(sh, i); ys, xs = np.nonzero(m); pts = np.stack([xs, ys], 1).astype(float)
    c = pts.mean(0); u, s, vt = np.linalg.svd(pts - c, full_matrices=False); ax = vt[0]
    proj = (pts - c) @ ax; perp = (pts - c) @ np.array([-ax[1], ax[0]])
    thick = np.percentile(np.abs(perp), 90)
    e1 = c + ax * proj.min(); e2 = c + ax * proj.max()
    # 'near' is a direction hint: the end closer to the body comes first
    if np.dot(e1 - e2, near) < 0: e1, e2 = e2, e1
    d = (e2 - e1) / np.linalg.norm(e2 - e1)
    piv = e1 + d * thick * 0.9; end = e2 - d * thick * 0.9
    return {'pivot': [round(piv[0], 1), round(piv[1], 1)], 'end': [round(end[0], 1), round(end[1], 1)],
            'ang': round(math.atan2(d[1], d[0]), 4), 'len': round(float(np.linalg.norm(end - piv)), 1)}
def torso(sh, i):
    m = mask(sh, i); ys, xs = np.nonzero(m); y0, y1 = ys.min(), ys.max(); x0, x1 = xs.min(), xs.max()
    h = y1 - y0; w = x1 - x0
    top = m[y0:int(y0 + h * 0.18)]; tys, txs = np.nonzero(top)
    return {'neck': [round((x0 + x1) / 2, 1), float(y0 + h * 0.03)],
            'shL': [float(txs.min() + w * 0.13), float(y0 + h * 0.12)], 'shR': [float(txs.max() - w * 0.13), float(y0 + h * 0.12)],
            'hipL': [float(x0 + w * 0.3), float(y1 - h * 0.06)], 'hipR': [float(x0 + w * 0.7), float(y1 - h * 0.06)],
            'w': float(w), 'h': float(h), 'c': [float((x0 + x1) / 2), float((y0 + y1) / 2)]}
def head(sh, i):
    m = mask(sh, i); ys, xs = np.nonzero(m); y1 = ys.max(); y0 = ys.min()
    low = xs[ys > y1 - (y1 - y0) * 0.08]
    return {'neck': [float(low.mean()), float(y1 - (y1 - y0) * 0.07)], 'h': float(y1 - y0)}
def leg(sh, i):
    m = mask(sh, i); ys, xs = np.nonzero(m); y0, y1 = ys.min(), ys.max(); h = y1 - y0
    tx = xs[ys < y0 + h * 0.15].mean(); bx = xs[(ys > y0 + h * 0.80) & (ys < y0 + h * 0.9)].mean()
    piv = np.array([tx, y0 + min(h * 0.12, 40)]); end = np.array([bx, y1 - min(h * 0.10, 30)])
    d = end - piv
    return {'pivot': [round(piv[0], 1), round(piv[1], 1)], 'end': [round(end[0], 1), round(end[1], 1)],
            'ang': round(math.atan2(d[1], d[0]), 4), 'len': round(float(np.linalg.norm(d)), 1)}
out = {}
for sh, d in idx.items():
    P = d['parts']
    for p in P: p['cx'] = p['x'] + p['w'] / 2; p['cy'] = p['y'] + p['h'] / 2; p['area'] = p['w'] * p['h']
    H = max(p['y'] + p['h'] for p in P)
    top = sorted([p for p in P if p['y'] < 0.12 * H and p['h'] < 0.4 * H], key=lambda p: p['cx'])
    rest = [p for p in P if p not in top]
    cand = [p for p in rest if p['cy'] < 0.6 * H]; amax = max(p['area'] for p in cand)
    T = min([p for p in cand if p['area'] > 0.5 * amax], key=lambda p: abs(p['cx'] - top[0]['cx'])); rest.remove(T)
    tl, tr, tb, tcx = T['x'], T['x'] + T['w'], T['y'] + T['h'], T['cx']
    legs = [p for p in rest if p['cy'] > tb - 20 and abs(p['cx'] - tcx) < (tr - tl) * 1.05]
    others = [p for p in rest if p not in legs]
    span = tr - tl
    props = [p for p in others if p['cx'] > tr + span * 1.1]
    arms = [p for p in others if p not in props]
    o = {'torso': dict(id=T['id'], **torso(sh, T['id']))}
    o['head'] = dict(id=top[0]['id'], **head(sh, top[0]['id']))
    for k, p in enumerate(top[1:4]): o[f'expr{k+1}'] = dict(id=p['id'], **head(sh, p['id']))
    def tow(p): return [T['cx'] - p['cx'], T['y'] - p['cy']]
    for side, sel in (('L', lambda p: p['cx'] < tcx), ('R', lambda p: p['cx'] >= tcx)):
        a = sorted([p for p in arms if sel(p)], key=lambda p: p['cy'])
        outward = [-1, -0.3] if side == 'L' else [1, -0.3]
        if len(a) == 1:
            o[f'uarm{side}'] = dict(id=a[0]['id'], **limb(sh, a[0]['id'], tow(a[0]))); o[f'uarm{side}']['whole'] = True
        else:
            o[f'uarm{side}'] = dict(id=a[0]['id'], **limb(sh, a[0]['id'], tow(a[0])))
            o[f'farm{side}'] = dict(id=a[1]['id'], **limb(sh, a[1]['id'], [a[0]['cx'] - a[1]['cx'], a[0]['cy'] - a[1]['cy']]))
        l = sorted([p for p in legs if sel(p)], key=lambda p: p['cy'])
        o[f'thigh{side}'] = dict(id=l[0]['id'], **leg(sh, l[0]['id']))
        o[f'shin{side}'] = dict(id=l[1]['id'], **leg(sh, l[1]['id']))
    for k, p in enumerate(props): o[f'prop{k}'] = {'id': p['id']}
    out[sh] = o
    print(sh, {k: v['id'] for k, v in o.items()})
json.dump(out, open(os.path.join(HERE, 'parts', 'rig.json'), 'w'), indent=1)
