// render the channel art: node src/shoot.mjs  (writes banner.png/jpg and profile.png)
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright'); import http from 'http'; import fs from 'fs'; import path from 'path';
const D = path.dirname(new URL(import.meta.url).pathname), OUT = path.resolve(D, '..');
const mime = { '.html': 'text/html', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.mjs': 'text/javascript' };
const srv = http.createServer((q, r) => { const f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': mime[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); }).listen(0);
const port = srv.address().port, b = await chromium.launch();
for (const [w, W, H, file] of [['banner', 2560, 1440, 'banner.png'], ['avatar', 800, 800, 'profile.png']]) {
  const p = await b.newPage({ viewport: { width: W, height: H } });
  await p.goto(`http://127.0.0.1:${port}/art.html?w=${w}`); await p.waitForFunction(() => window.READY, null, { timeout: 60000 });
  await p.locator('canvas').screenshot({ path: path.join(OUT, file) }); console.log(file);
}
await b.close(); srv.close();
