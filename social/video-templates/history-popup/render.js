// Renders the history pop-up overlay and composites it over a video.
// Usage: node render.js <config.json> [--guide]
// Needs Playwright (pre-installed in the cloud container) and ffmpeg.
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

(async () => {
  const cfgPath = path.resolve(process.argv[2] || 'config.example.json');
  const guide = process.argv.includes('--guide');
  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  const dir = path.dirname(cfgPath);
  const W = cfg.width || 1080, H = cfg.height || 1920, fps = cfg.fps || 30;
  const N = Math.round(cfg.duration * fps);

  // Image paths in the config are relative to the config file.
  cfg.pops.forEach(p => { p.image = 'file://' + path.resolve(dir, p.image); });
  cfg.width = W; cfg.height = H; cfg.guide = guide;

  const frames = fs.mkdtempSync(path.join(require('os').tmpdir(), 'popup-'));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.goto('file://' + path.join(__dirname, 'overlay.html'));
  await page.evaluate(c => init(c), cfg);
  await page.waitForLoadState('networkidle');
  for (let i = 0; i < N; i++) {
    await page.evaluate(t => setTime(t), i / fps);
    await page.screenshot({ path: path.join(frames, String(i).padStart(5, '0') + '.png'), omitBackground: true });
  }
  await browser.close();

  const out = path.resolve(dir, cfg.output || (guide ? 'preview-guide.mp4' : 'output.mp4'));
  const args = ['-y', '-loglevel', 'error'];
  // Base layer: the real footage, or a plain placeholder for previews.
  if (cfg.background) args.push('-i', path.resolve(dir, cfg.background));
  else args.push('-f', 'lavfi', '-i', `color=c=0x3a2716:s=${W}x${H}:r=${fps}:d=${cfg.duration}`);
  args.push('-framerate', String(fps), '-i', path.join(frames, '%05d.png'));
  if (cfg.audio) args.push('-i', path.resolve(dir, cfg.audio));
  else args.push('-f', 'lavfi', '-t', String(cfg.duration), '-i', 'anullsrc=r=48000:cl=stereo');
  args.push('-filter_complex',
    `[0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},fps=${fps}[bg];[bg][1:v]overlay=0:0:format=auto,format=yuv420p[v]`,
    '-map', '[v]', '-map', '2:a', '-t', String(cfg.duration),
    '-c:v', 'libx264', '-crf', '20', '-c:a', 'aac', out);
  execFileSync('ffmpeg', args, { stdio: 'inherit' });
  fs.rmSync(frames, { recursive: true, force: true });
  console.log('Wrote', out);
})();
