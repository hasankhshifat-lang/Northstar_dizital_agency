#!/usr/bin/env node
// Facebook post renderer.
//   node social/facebook/render.js prompt <post.json>   -> prints the ElevenLabs voiceover prompt for a video
//   node social/facebook/render.js <post.json>          -> photo: image.png (1080x1350; theme "ad" is 1080x1080)
//                                                          video: video.mp4 (1080x1920, 30fps) + cover.png,
//                                                                 needs voice.mp3 next to post.json
//   PREVIEW=2,8,15 node social/facebook/render.js <post.json>  -> video stills only, for checking layout
const { chromium } = require('playwright');
const { spawn, execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const FPS = 30;
const TAIL = 1.4; // seconds of picture after the voice ends
const stripTags = s => s.replace(/\[[^\]]*\]\s*/g, '').trim();

// One continuous voiceover; [pause] between scenes gives clean gaps to cut on.
const voicePrompt = post => post.design.scenes.map(s => (s.tone ? `[${s.tone}] ` : '') + s.say).join(' [pause] ');

function ffmpeg(args) {
  return execFileSync('ffmpeg', ['-hide_banner', '-nostats', ...args], { stdio: ['ignore', 'pipe', 'pipe'] });
}

function audioInfo(file) {
  const dur = parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString());
  const log = require('child_process').spawnSync('ffmpeg', ['-hide_banner', '-i', file, '-af', 'silencedetect=noise=-38dB:d=0.25', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  const sil = [];
  for (const m of log.matchAll(/silence_end: ([\d.]+) \| silence_duration: ([\d.]+)/g)) {
    const end = +m[1], d = +m[2];
    sil.push({ start: end - d, end, d });
  }
  return { dur, sil: sil.filter(s => s.start > 0.2 && s.end < dur - 0.1) };
}

// Pick one silence per scene boundary. Expected positions come from each scene's share of the
// spoken text; longer silences are preferred. Small DP over the ordered silences.
function align(scenes, { dur, sil }) {
  const len = scenes.map(s => stripTags(s.say).length);
  const total = len.reduce((a, b) => a + b, 0);
  const expected = [];
  let acc = 0;
  for (let i = 0; i < scenes.length - 1; i++) { acc += len[i]; expected.push(dur * acc / total); }
  const K = expected.length, N = sil.length;
  if (N < K) throw new Error(`voiceover has ${N} pauses but ${K} scene breaks are needed`);
  const cost = (k, j) => Math.abs((sil[j].start + sil[j].end) / 2 - expected[k]) - 3 * sil[j].d;
  const dp = Array.from({ length: K }, () => Array(N).fill(Infinity));
  const from = Array.from({ length: K }, () => Array(N).fill(-1));
  for (let j = 0; j < N; j++) dp[0][j] = cost(0, j);
  for (let k = 1; k < K; k++) for (let j = k; j < N; j++) for (let p = k - 1; p < j; p++) {
    const v = dp[k - 1][p] + cost(k, j);
    if (v < dp[k][j]) { dp[k][j] = v; from[k][j] = p; }
  }
  let j = dp[K - 1].indexOf(Math.min(...dp[K - 1]));
  const picked = [];
  for (let k = K - 1; k >= 0; k--) { picked.unshift(sil[j]); j = from[k][j]; }
  return picked;
}

// Captions: split each scene's line into short phrases, timed by length inside the scene's speech.
function captions(scenes, picked, dur) {
  const out = [];
  scenes.forEach((s, i) => {
    const a = i === 0 ? 0.05 : picked[i - 1].end;
    const b = i < picked.length ? picked[i].start : dur;
    let parts = stripTags(s.say).split(/(?<=[।?!])\s+/).flatMap(p => p.length > 46 ? p.split(/(?<=,|—)\s+/) : [p]).filter(Boolean);
    const L = parts.reduce((x, p) => x + p.length, 0);
    let t = a;
    for (const p of parts) { out.push({ t: +t.toFixed(3), text: p }); t += (b - a) * p.length / L; }
  });
  return out;
}

async function renderVideo(page, post, outDir) {
  const voice = path.join(outDir, 'voice.mp3');
  if (!fs.existsSync(voice)) throw new Error('voice.mp3 missing; generate it from `render.js prompt` first');
  const info = audioInfo(voice);
  const picked = align(post.design.scenes, info);
  const timing = [0, ...picked.map(s => +((s.start + s.end) / 2).toFixed(3))];
  const total = +(info.dur + TAIL).toFixed(3);
  const video = { ...post.design, timing, total, captions: captions(post.design.scenes, picked, info.dur) };
  fs.writeFileSync(path.join(outDir, 'timing.json'), JSON.stringify({ timing, total, captions: video.captions }, null, 1));

  await page.addInitScript(d => { window.VIDEO = d; }, video);
  await page.goto('file://' + path.join(__dirname, 'templates', 'video.html'));
  await page.evaluate(() => document.fonts.ready);

  if (process.env.PREVIEW) {
    // Quick QA: PREVIEW=1.5,6,12 saves stills instead of encoding the video.
    for (const t of process.env.PREVIEW.split(',')) {
      await page.evaluate(x => window.seek(x), +t);
      await page.screenshot({ path: path.join(outDir, `preview-${t}.png`) });
    }
    return;
  }

  // Sound: voice + soft whoosh on each scene change + a quiet pad underneath.
  const sfx = path.join(outDir, '.whoosh.wav');
  ffmpeg(['-y', '-f', 'lavfi', '-i', 'anoisesrc=d=0.7:c=pink:a=0.6', '-af', 'highpass=f=400,lowpass=f=4000,afade=t=in:d=0.35:curve=exp,afade=t=out:st=0.35:d=0.35,volume=0.22', sfx]);
  const cuts = timing.slice(1).map(t => Math.max(0, t - 0.35));
  const inputs = ['-i', voice, ...cuts.flatMap(() => ['-i', sfx]),
    '-f', 'lavfi', '-i', `aevalsrc=0.5*(sin(2*PI*196*t)+0.7*sin(2*PI*246.94*t)+0.6*sin(2*PI*293.66*t)+0.4*sin(2*PI*392*t))*(0.75+0.25*sin(2*PI*0.08*t)):s=44100:d=${total}`];
  const fc = [
    '[0]adelay=0|0,apad[v]',
    ...cuts.map((c, i) => `[${i + 1}]adelay=${Math.round(c * 1000)}|${Math.round(c * 1000)}[w${i}]`),
    `[${cuts.length + 1}]lowpass=f=700,volume=0.035,afade=t=in:d=1.5,afade=t=out:st=${total - 1.5}:d=1.5[p]`,
    `[v]${cuts.map((_, i) => `[w${i}]`).join('')}[p]amix=inputs=${cuts.length + 2}:normalize=0:duration=first,atrim=0:${total},loudnorm=I=-14:TP=-1.5:LRA=11[a]`,
  ];
  const mix = path.join(outDir, '.mix.wav');
  ffmpeg(['-y', ...inputs, '-filter_complex', fc.join(';'), '-map', '[a]', '-ac', '2', '-ar', '44100', mix]);

  const out = path.join(outDir, 'video.mp4');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-i', mix,
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '19', '-preset', 'medium',
    '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const frames = Math.ceil(total * FPS);
  for (let f = 0; f < frames; f++) {
    await page.evaluate(t => window.seek(t), f / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 90 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await new Promise((res, rej) => ff.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg exited ' + c))));
  fs.rmSync(sfx); fs.rmSync(mix);
  await page.evaluate(t => window.seek(t), post.design.cover_at ?? 2.5);
  await page.screenshot({ path: path.join(outDir, 'cover.png') });
}

async function main() {
  if (process.argv[2] === 'prompt') {
    console.log(voicePrompt(JSON.parse(fs.readFileSync(process.argv[3], 'utf8'))));
    return;
  }
  const postFile = path.resolve(process.argv[2]);
  const post = JSON.parse(fs.readFileSync(postFile, 'utf8'));
  const outDir = path.dirname(postFile);
  const browser = await chromium.launch();
  const theme = post.design && post.design.theme;
  const isAd = theme === 'ad' || theme === 'layout';
  const size = post.type === 'video' ? { width: 1080, height: 1920 } : isAd ? { width: 1080, height: 1080 } : { width: 1080, height: 1350 };
  const page = await browser.newPage({ viewport: size });
  if (post.type === 'video') {
    await renderVideo(page, post, outDir);
  } else {
    await page.addInitScript(d => { window.POST = d; }, post.design);
    await page.goto('file://' + path.join(__dirname, 'templates', theme === 'layout' ? 'layouts.html' : isAd ? 'ad.html' : 'photo.html'));
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(outDir, 'image.png') });
  }
  await browser.close();
  console.log('rendered', outDir);
}

main().catch(e => { console.error(e); process.exit(1); });
