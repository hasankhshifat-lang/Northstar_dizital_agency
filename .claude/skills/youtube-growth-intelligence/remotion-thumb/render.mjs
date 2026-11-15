// Render a thumbnail still and convert it to JPG at the exact size, under YouTube's 2 MB limit.
// Usage: node render.mjs props.json out/<VIDEO_ID>.jpg [asset files to copy into public/...]
import {execFileSync} from 'node:child_process';
import {mkdirSync, copyFileSync, readFileSync, statSync, existsSync} from 'node:fs';
import {basename, dirname, resolve} from 'node:path';

const [propsFile, outJpg, ...assets] = process.argv.slice(2);
if (!propsFile || !outJpg) { console.error('usage: node render.mjs props.json out.jpg [assets...]'); process.exit(2); }
mkdirSync('public', {recursive: true}); mkdirSync('out', {recursive: true}); mkdirSync(dirname(resolve(outJpg)), {recursive: true});
for (const a of assets) copyFileSync(a, `public/${basename(a)}`);
const props = JSON.parse(readFileSync(propsFile, 'utf8'));
const png = `out/${basename(outJpg).replace(/\.\w+$/, '')}.png`;
const browser = existsSync('/opt/pw-browsers/chromium') ? ['--browser-executable', '/opt/pw-browsers/chromium'] : [];
execFileSync('npx', ['remotion', 'still', 'src/index.ts', 'Thumb', png, `--props=${resolve(propsFile)}`, ...browser], {stdio: 'inherit'});
let q = 2;
for (;;) {
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', png, '-vf', `scale=${props.width}:${props.height}`, '-q:v', String(q), outJpg]);
  if (statSync(outJpg).size < 2_000_000 || q >= 10) break;
  q += 2;
}
console.log(JSON.stringify({out: outJpg, bytes: statSync(outJpg).size, width: props.width, height: props.height}));
