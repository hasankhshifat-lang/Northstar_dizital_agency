"""Write the .srt from the captions in index.html (CAPS = [[start, 'text'], ...]; each line ends where the next starts)."""
import os, re
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = open(os.path.join(HERE, 'index.html'), encoding='utf-8').read()
dur = float(re.search(r'window\.DUR = ([\d.]+)', src).group(1))
caps = [(float(a), t) for a, t in re.findall(r"\[([\d.]+), '((?:[^'\\]|\\.)*)'\]", src.split('const CAPS = [')[1].split('];')[0])]
def ts(x):
    h, r = divmod(x, 3600); m, s = divmod(r, 60); ms = min(999, int(round((s % 1) * 1000)))
    return f"{int(h):02d}:{int(m):02d}:{int(s):02d},{ms:03d}"
out = [f"{i}\n{ts(a)} --> {ts((caps[i][0] if i < len(caps) else dur) - .05)}\n{t}\n" for i, (a, t) in enumerate(caps, 1)]
open(os.path.join(HERE, 'panenka-1976-short.srt'), 'w', encoding='utf-8').write('\n'.join(out))
print('srt', len(caps), 'cues')
