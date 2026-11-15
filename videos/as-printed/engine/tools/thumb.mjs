// Render the episode thumbnails: node tools/thumb.mjs <episode_dir>  -> thumb_long.jpg (1280x720), thumb_short.jpg (1080x1920)
// Needs <episode_dir>/thumb.json {image: "assets/thumb_src.jpg", heading, tag, ring: [fx, fy, fr], rot}
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
import http from 'http'; import fs from 'fs'; import path from 'path'; import { execFileSync } from 'child_process';
const D = path.resolve(process.argv[2] || '.');
const mime = { '.html': 'text/html', '.jpg': 'image/jpeg', '.png': 'image/png', '.json': 'application/json', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { const f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': mime[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); }).listen(0);
const b = await chromium.launch();
for (const [fmt, w, h] of [['long', 1280, 720], ['short', 1080, 1920]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(`http://127.0.0.1:${srv.address().port}/thumb.html?fmt=${fmt}`); await p.waitForFunction(() => window.READY, null, { timeout: 60000 });
  const png = path.join(D, 'out', `thumb_${fmt}.png`); fs.mkdirSync(path.dirname(png), { recursive: true });
  await p.locator('canvas').screenshot({ path: png });
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', png, '-q:v', '3', path.join(D, `thumb_${fmt}.jpg`)]);
  console.log(`thumb_${fmt}.jpg`);
}
await b.close(); srv.close();
