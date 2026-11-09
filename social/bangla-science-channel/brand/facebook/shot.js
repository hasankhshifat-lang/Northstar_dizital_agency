const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  for (const [f, w, h] of [['cover', 1640, 624], ['profile', 1080, 1080]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto('file://' + process.argv[2] + '/' + f + '.html'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500);
    await p.screenshot({ path: process.argv[2] + '/' + f + '.png' }); }
  await b.close(); })();
