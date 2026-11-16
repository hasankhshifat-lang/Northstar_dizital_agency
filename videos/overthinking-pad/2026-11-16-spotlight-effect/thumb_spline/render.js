const { chromium } = require('playwright');
(async () => { const b = await chromium.launch();
 for (const [f, w, h, out] of [['long.html', 1280, 720, '../thumb_long.jpg'], ['short.html', 1080, 1920, '../thumb_short.jpg']]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await p.goto('file://' + __dirname + '/' + f); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
  await p.screenshot({ path: out, type: 'jpeg', quality: 90, clip: { x: 0, y: 0, width: w, height: h } }); }
 await b.close(); })();
