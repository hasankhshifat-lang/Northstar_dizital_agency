"""Barlow Condensed (SIL OFL 1.1) from github.com/google/fonts. usage: python -I tools/fonts.py <project>"""
import os, sys, urllib.request
F = os.path.join(sys.argv[1], 'fonts'); os.makedirs(F, exist_ok=True)
for w in ('Regular', 'Medium', 'SemiBold', 'Bold'):
    p = os.path.join(F, f'BarlowCondensed-{w}.ttf')
    if not os.path.exists(p):
        u = f'https://raw.githubusercontent.com/google/fonts/main/ofl/barlowcondensed/BarlowCondensed-{w}.ttf'
        open(p, 'wb').write(urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'}), timeout=60).read())
    print(p, os.path.getsize(p))
