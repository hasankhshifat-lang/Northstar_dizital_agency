"""IBM Plex Mono 400/500, Plex Sans 400/500, Plex Serif 600 (SIL OFL 1.1) from Google Fonts into fonts/, Latin subset."""
import sys, os, re, urllib.request, urllib.parse
D = sys.argv[1]; os.makedirs(os.path.join(D, 'fonts'), exist_ok=True)
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
get = lambda u: urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': UA}), timeout=60).read()
txt = ''.join(chr(c) for c in range(32, 127)) + '·×→−—’“”<≈'
for fam, w, out in (('IBM Plex Mono', 400, 'IBMPlexMono-400.woff2'), ('IBM Plex Mono', 500, 'IBMPlexMono-500.woff2'),
                    ('IBM Plex Sans', 400, 'IBMPlexSans-400.woff2'), ('IBM Plex Sans', 500, 'IBMPlexSans-500.woff2'),
                    ('IBM Plex Serif', 600, 'IBMPlexSerif-600.woff2')):
    css = get('https://fonts.googleapis.com/css2?family=' + urllib.parse.quote(fam) + f':wght@{w}&text=' + urllib.parse.quote(txt)).decode()
    url = re.findall(r'url\((https://[^)]+)\)', css)[0]
    data = get(url); open(os.path.join(D, 'fonts', out), 'wb').write(data); print(out, len(data))
for fam in ('ibmplexmono', 'ibmplexsans', 'ibmplexserif'):
    try: open(os.path.join(D, 'fonts', f'OFL-{fam}.txt'), 'wb').write(get(f'https://raw.githubusercontent.com/google/fonts/main/ofl/{fam}/OFL.txt'))
    except Exception as e: print('licence', fam, e)
