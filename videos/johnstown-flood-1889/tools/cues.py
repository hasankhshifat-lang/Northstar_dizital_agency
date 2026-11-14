"""Subtitle cues: voice/subs.json start times + out/voice/dur.json lengths -> voice/cues.json (the page and the .srt read it).
Each cue holds until just before the next line, never shorter than the spoken line + 0.6 s or 1.8 s. usage: python3 tools/cues.py"""
import json, os, sys
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
subs = json.load(open(os.path.join(HERE, 'voice', 'subs.json')))
dur = json.load(open(os.path.join(HERE, 'out', 'voice', 'dur.json')))
cues, bad = [], 0
for i, s in enumerate(subs):
    d = dur[s['id']]
    end = min(subs[i + 1]['t'] - .08, s['t'] + d + 1.6) if i + 1 < len(subs) else s['t'] + d + 1.2
    if end - s['t'] < max(1.8, d + .6) - 1e-6 or (i + 1 < len(subs) and s['t'] + d > subs[i + 1]['t'] - .3):
        print('TOO SHORT', s['id'], round(end - s['t'], 2)); bad += 1
    cues.append({'id': s['id'], 't0': s['t'], 't1': round(end, 3), 'vo_end': round(s['t'] + d, 3), 'en': s['en'], 'text': s['en'].replace('|', '\n')})
json.dump(cues, open(os.path.join(HERE, 'voice', 'cues.json'), 'w'), indent=1)
print('cues', len(cues), 'shortest', round(min(c['t1'] - c['t0'] for c in cues), 2), 's'); sys.exit(1 if bad else 0)
