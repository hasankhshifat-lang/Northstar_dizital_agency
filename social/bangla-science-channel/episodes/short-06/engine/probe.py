"""Render one test frame per candidate pose and report each visible hand's centre (world = screen here, camera identity)."""
import json, sys, subprocess
from pathlib import Path
S = Path(".."); chars = json.loads((S / "chars/chars3.json").read_text())
F = 1820
CAND = json.loads(sys.argv[1])          # [[name, x, pose5], ...]
shots = []
for k, (n, x, p) in enumerate(CAND):
    shots.append({"start": k, "end": k + 1, "cam": {"from": [0, 0, 1], "to": [0, 0, 1]}, "chars": {n: [x, F, .8]}, "turn": {n: 0},
                  "poses": {n: [[k, *p, 0], [k + 1, *p, 0]]}})
D = {"chars": {"mama": chars["Montu Mama"], "bithi": chars["Bithi"], "boltu": chars["Boltu"]}, "bg": '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920"></svg>',
     "lines": [], "mouth": "", "shots": shots, "dur": len(CAND)}
html = Path("engine.html").read_text().replace("__DATA__", json.dumps(D))
Path("/tmp/claude-0/probe.html").write_text(html)
js = r"""
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('file:///tmp/claude-0/probe.html');await p.waitForTimeout(300);const N=%d;const out=[];
for(let k=0;k<N;k++){await p.evaluate(t=>window.render(t),k+0.5);
 out.push(await p.evaluate(()=>{const r=[];document.querySelectorAll('.handOpen,.handRelax').forEach(e=>{const s=getComputedStyle(e);const bb=e.getBoundingClientRect();
  if(s.display!=='none'&&bb.width>0&&e.closest('div').style.display!=='none'){r.push([e.closest('.foreL')?'L':'R',Math.round(bb.x+bb.width/2),Math.round(bb.y+bb.height/2)])}});return r}));
 await p.screenshot({path:'/tmp/claude-0/probe'+k+'.jpg',type:'jpeg',quality:60});}
console.log(JSON.stringify(out));await b.close()})()""" % len(CAND)
Path("/tmp/claude-0/probe.js").write_text(js)
print(subprocess.run(["node", "/tmp/claude-0/probe.js"], capture_output=True, text=True).stdout)
