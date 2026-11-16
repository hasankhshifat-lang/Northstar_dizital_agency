// Storyboard table from the episode file. usage: node tools/storyboard.mjs <episode_dir> <film>  -> prints Markdown
import fs from 'fs'; import path from 'path'; import { pathToFileURL } from 'url';
const [D0, film = 'long'] = process.argv.slice(2); const D = path.resolve(D0);
const EPI = (await import(pathToFileURL(path.join(D, 'episode.js')).href)).default;
const SCR = JSON.parse(fs.readFileSync(path.join(D, 'script.json'), 'utf8'))[film];
let TL = null; try { TL = JSON.parse(fs.readFileSync(path.join(D, 'out', film, 'timeline.json'), 'utf8')); } catch {}
const mmss = x => `${Math.floor(x / 60)}:${String((x % 60).toFixed(1)).padStart(4, '0')}`;
const esc = s => String(s || '').replace(/\|/g, '/').replace(/\n/g, ' ');
console.log(`| # | Time | Line | Purpose | Shot + camera (why) | What is drawn, in order (from episode.js) | SFX / music |`);
console.log(`|---|---|---|---|---|---|---|`);
SCR.forEach((s, i) => {
  const d = EPI[film].scenes[s.id] || {}; const sh = TL ? TL.shots.find(x => x.id === s.id) : null;
  const src = d.draw ? d.draw.toString() : '';
  const drawn = [...src.matchAll(/L\.(person|student|head|tshirt|door|spotlight|bubble|bars|eyeIcon|anchor|mirror|scar|brush|stage|cup|clock|ball|controller|sheet|ribbon|box|fatArrow|inkArrow|swash|loop|react|qmark|check|cross|motion|TXT)\(\s*('([^']*)'|"([^"]*)")?/g)].map(m => m[1] === 'TXT' ? `"${m[3] || m[4] || ''}"` : m[1]);
  const named = [...src.matchAll(/\b(tshirt|headRow|highlight|tag|numDot|room|lampHeld)\(/g)].map(m => m[1]);
  const what = [...new Set([...named, ...drawn])].slice(0, 14).join(', ');
  console.log(`| ${i + 1} | ${sh ? mmss(sh.t0) + '–' + mmss(sh.t1) : ''} | ${esc(s.say || s.title || s.type)} | ${esc(d.purpose)} | ${esc(d.shot)} | ${esc(what)} | ${esc(d.sfx)} |`);
});
