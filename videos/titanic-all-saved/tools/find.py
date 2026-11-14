# find 15 April 1912 front pages about the Titanic on Chronicling America and save previews
import json, sys, urllib.request, os, time
def get(u, t=90):
    for i in range(3):
        try: return urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent':'archive-film-research'}), timeout=t).read()
        except Exception as e: print('retry', e, file=sys.stderr); time.sleep(3)
date = sys.argv[1]; q = sys.argv[2]
d = json.loads(get(f"https://www.loc.gov/collections/chronicling-america/?q={q}&dates={date}/{date}&fo=json&c=40&at=results"))
os.makedirs('raw/prev', exist_ok=True); out = []
for r in d['results']:
    u = r['id'].replace('http://','https://')
    if not u.endswith('sp=1'): continue
    try: j = json.loads(get(u + '&fo=json'))
    except Exception as e: print('skip', u, e); continue
    img = j['resource']['image'].replace('pct:6.25', 'pct:12.5')
    name = u.split('/resource/')[1].split('/')[0] + '_' + date
    open(f'raw/prev/{name}.jpg', 'wb').write(get(img))
    out.append({'name': name, 'title': (r.get('partof_title') or [''])[0], 'url': u, 'page': j['page'][0]['url'], 'text': j['resource'].get('fulltext_file')})
    print(name, out[-1]['title'])
json.dump(out, open(f'raw/prev_{date}.json', 'w'), indent=1)
