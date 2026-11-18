"""Write the .srt from the captions in index.html (CAPS)."""
import os, re, json, subprocess
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(HERE, 'index.html'), encoding='utf-8').read()
caps = re.findall(r"\[([\d.]+), ([\d.]+), '((?:[^'\\]|\\.)*)'\]", src.split('const CAPS = [')[1].split('];')[0])
def ts(x):
    h, r = divmod(float(x), 3600); m, s = divmod(r, 60)
    return f"{int(h):02d}:{int(m):02d}:{int(s):02d},{int(round((s % 1) * 1000)):03d}".replace(',1000', ',999')
out = []
for i, (a, b, t) in enumerate(caps, 1):
    out.append(f"{i}\n{ts(a)} --> {ts(b)}\n{t}\n")
open(os.path.join(HERE, 'anfield-corner-short.srt'), 'w', encoding='utf-8').write('\n'.join(out))
print('srt', len(caps), 'cues')
