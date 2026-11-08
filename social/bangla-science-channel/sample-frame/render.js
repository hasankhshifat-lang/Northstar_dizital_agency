const { chromium } = require('playwright');
(async () => {
  const [,, html, out, scale] = process.argv;
  const b = await chromium.launch({ args:['--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport:{width:1080,height:1920}, deviceScaleFactor:Number(scale||1) });
  await p.goto('file://'+html); await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(400);
  const f = await p.evaluate(()=>[...document.fonts].filter(x=>x.status==='loaded').map(x=>x.family+' '+x.weight));
  console.log('fonts loaded:', JSON.stringify(f));
  await p.screenshot({ path: out }); await b.close();
})();
