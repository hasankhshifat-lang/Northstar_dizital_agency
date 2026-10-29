#!/usr/bin/env node
// Render a Facebook post from its post.json.
//   node social/facebook/render.js social/facebook/posts/<slug>/post.json
// type "photo" -> image.png (1080x1350); type "video" -> video.mp4 (1080x1920, 30fps) + cover.png
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const FPS = 30;

async function main() {
  const postFile = path.resolve(process.argv[2]);
  const post = JSON.parse(fs.readFileSync(postFile, 'utf8'));
  const outDir = path.dirname(postFile);
  const tpl = path.join(__dirname, 'templates', post.type === 'video' ? 'video.html' : 'photo.html');
  const size = post.type === 'video' ? { width: 1080, height: 1920 } : { width: 1080, height: 1350 };

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: size });
  await page.addInitScript(d => { window.POST = d; window.VIDEO = d; }, post.design);
  await page.goto('file://' + tpl);
  await page.evaluate(() => document.fonts.ready);

  if (post.type !== 'video') {
    await page.screenshot({ path: path.join(outDir, 'image.png') });
  } else {
    const duration = await page.evaluate(() => window.DURATION);
    const out = path.join(outDir, 'video.mp4');
    // Silent AAC track keeps Facebook's uploader happy (it expects H.264 + AAC).
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error',
      '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
      '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo',
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-preset', 'medium',
      '-c:a', 'aac', '-shortest', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const frames = Math.ceil(duration * FPS);
    for (let f = 0; f < frames; f++) {
      await page.evaluate(t => window.seek(t), f / FPS);
      const buf = await page.screenshot({ type: 'jpeg', quality: 92 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    }
    ff.stdin.end();
    await new Promise((res, rej) => ff.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg exited ' + c))));
    // Cover frame: middle of the first scene, once its text has animated in.
    await page.evaluate(t => window.seek(t), post.design.cover_at ?? 1.5);
    await page.screenshot({ path: path.join(outDir, 'cover.png') });
  }
  await browser.close();
  console.log('rendered', outDir);
}

main().catch(e => { console.error(e); process.exit(1); });
