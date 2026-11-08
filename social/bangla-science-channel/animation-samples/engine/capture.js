// Render frames: node capture.js <html> <style> <outDir> <fps> <seconds> [scale] [only=t1,t2,...]
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const [,, html, style, outDir, fps, secs, scale, only] = process.argv;
  fs.mkdirSync(outDir, { recursive: true });
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: Number(scale || 0.6667) });
  await p.goto('file://' + html + '?style=' + style);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  const times = only ? only.split(',').map(Number) : [...Array(Math.round(Number(fps) * Number(secs))).keys()].map(k => k / Number(fps));
  let k = 0;
  for (const t of times) {
    await p.evaluate(t => window.render(t), t);
    await p.screenshot({ path: `${outDir}/${String(k++).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 88 });
  }
  await b.close(); console.log(style, 'frames', k);
})();
