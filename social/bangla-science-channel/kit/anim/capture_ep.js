// node capture_ep.js <html> <outDir> <fps> <startFrame> <endFrame> <scale>
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const [,, html, outDir, fps, s0, s1, scale] = process.argv; fs.mkdirSync(outDir, { recursive: true });
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: Number(scale) });
  await p.goto('file://' + html); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
  for (let k = Number(s0); k < Number(s1); k++) {
    await p.evaluate(t => window.render(t), k / Number(fps));
    await p.screenshot({ path: `${outDir}/${String(k).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 90 });
  }
  await b.close(); console.log('done', s0, s1);
})();
