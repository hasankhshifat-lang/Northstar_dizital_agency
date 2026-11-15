# download Bain glass negatives (LoC P&P) with their catalogue record
import json, sys, urllib.request, time
def get(u, t=120):
    for i in range(4):
        try: return urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent':'archive-film-research'}), timeout=t).read()
        except Exception as e: print('retry', e, file=sys.stderr); time.sleep(4)
recs = {}
for key, iid in [a.split('=') for a in sys.argv[1:]]:
    j = json.loads(get(f'https://www.loc.gov/pictures/item/{iid}/?fo=json'))
    it = j['item']; res = j.get('resources', [{}])[0]
    big = res.get('larger') or res.get('large') or res.get('image')
    full = res.get('verylarge') or res.get('tiff') or big
    rec = {'id': iid, 'title': it.get('title'), 'date': it.get('created_published_date'), 'call': it.get('call_number'),
           'repro': it.get('reproduction_number'), 'rights': it.get('rights_information'), 'url': f'https://www.loc.gov/pictures/item/{iid}/', 'img': big, 'full': full}
    recs[key] = rec; print(key, rec['title'], rec['call'], big)
    open(f'raw/neg/{key}.jpg', 'wb').write(get(big))
json.dump(recs, open('raw/neg/records.json', 'w'), indent=1)
