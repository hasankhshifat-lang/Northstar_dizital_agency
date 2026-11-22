"""Build index.html = the shared Comic History page engine (tools/base.html, from videos/anfield-corner-short)
+ tools/timeline.js (DUR, T, CAPS) + tools/film.js (this film's scoreboard, scenes and sound events)."""
import os
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
b = open(os.path.join(HERE, 'tools', 'base.html'), encoding='utf-8').read()
tl = open(os.path.join(HERE, 'tools', 'timeline.js'), encoding='utf-8').read()
film = open(os.path.join(HERE, 'tools', 'film.js'), encoding='utf-8').read()
i1 = b.index('window.DUR = '); i2 = b.index('// ---------------------------------------------------------------- helpers')
i3 = b.index('// ---------------------------------------------------------------- film:'); i4 = b.index('// ---------------------------------------------------------------- captions')
name = os.path.basename(HERE)
head = b[:i1].replace('anfield-corner-short - Comic History Cartoon', f'{name} - Comic History Cartoon')
open(os.path.join(HERE, 'index.html'), 'w', encoding='utf-8').write(head + tl + '\n' + b[i2:i3] + film + '\n' + b[i4:])
print('index.html built')
