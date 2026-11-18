"""Generate one green-screen part sheet through OpenRouter (Google Gemini image model).
Usage: python3 tools/gen_sheet.py <name>   (reads tools/sheets.json, writes src/sheet-<name>.png)"""
import json, os, sys, base64, urllib.request
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cfg = json.load(open(os.path.join(HERE, 'tools', 'sheets.json')))
s = next(x for x in cfg['sheets'] if x['name'] == sys.argv[1])
content = [{"type": "text", "text": s['prompt']}]
if s.get('reference'):
    b = base64.b64encode(open(os.path.join(HERE, s['reference']), 'rb').read()).decode()
    content.append({"type": "image_url", "image_url": {"url": "data:image/png;base64," + b}})
body = {"model": cfg['model'], "modalities": ["image", "text"],
        "messages": [{"role": "user", "content": content}],
        "image_config": {"aspect_ratio": s.get('aspect', '16:9')}}
req = urllib.request.Request("https://openrouter.ai/api/v1/chat/completions", json.dumps(body).encode(),
                             {"Content-Type": "application/json", "Authorization": "Bearer x"})
r = json.load(urllib.request.urlopen(req, timeout=300))
imgs = r['choices'][0]['message'].get('images') or []
if not imgs:
    sys.exit("no image: " + json.dumps(r)[:600])
url = imgs[0]['image_url']['url']
out = os.path.join(HERE, 'src', f"sheet-{s['name']}.png")
open(out, 'wb').write(base64.b64decode(url.split(',', 1)[1]))
print(out)
