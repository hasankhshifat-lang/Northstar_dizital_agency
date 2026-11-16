// Scene timing from the real voice. usage: node tools/timeline.mjs <episode_dir> <film>
//   reads script.json and voice/<film>/out/dur.json; writes out/<film>/timeline.json (scene times + subtitle cues),
//   out/<film>/cues_srt.json and out/<film>/chapters.txt (YouTube chapter list).
// A scene lasts lead + voice + tail (script fields `lead`, `tail`, `min` override). Scenes without a voice line:
// sting 2.2 s, chapter 2.6 s, end card 7 s (or `min`).
import fs from 'fs'; import path from 'path';
const [D0, film = 'long'] = process.argv.slice(2);
const D = path.resolve(D0);
const SCR = JSON.parse(fs.readFileSync(path.join(D, 'script.json'), 'utf8'))[film];
const dur = JSON.parse(fs.readFileSync(path.join(D, 'voice', film, 'out', 'dur.json'), 'utf8'));
const FIX = { sting: 2.2, chapter: 2.6, end: 7.0 };
const maxC = film === 'short' ? 30 : 46;
let t = 0; const shots = [], cues = [];
SCR.forEach((s, i) => {
  const sh = { id: s.id, type: s.type || 'line', t0: +t.toFixed(3) };
  if (s.num) sh.num = s.num; if (s.title) sh.title = s.title;
  let d;
  if (s.say) {
    const vd = dur[s.id]; if (!(vd > 0)) throw new Error('no voice for ' + s.id);
    const lead = s.lead ?? (i === 0 ? (film === 'short' ? 0.15 : 0.35) : 0.4), tail = s.tail ?? (film === 'short' ? 0.45 : 1.0);
    d = Math.max(s.min ?? 0, lead + vd + tail);
    sh.voice = s.id; sh.vt = +(t + lead).toFixed(3); sh.vdur = vd;
    const words = s.say.replace(/\.\.\./g, '…').replace(/\s+/g, ' ').trim().split(' '), chunks = []; let cur = '';
    for (const w of words) {
      const tst = cur ? cur + ' ' + w : w;
      if (tst.length > maxC && cur) { chunks.push(cur); cur = w; } else cur = tst;
      if (/[.!?;:…]$/.test(w) && cur.length > maxC * 0.4) { chunks.push(cur); cur = ''; }
    }
    if (cur) chunks.push(cur);
    const total = chunks.reduce((a, c) => a + c.length, 0); let acc = 0;
    chunks.forEach((c, k) => {
      const a = sh.vt + vd * acc / total; acc += c.length;
      const b = k === chunks.length - 1 ? sh.vt + vd + 0.35 : sh.vt + vd * acc / total;
      cues.push({ t0: +a.toFixed(3), t1: +b.toFixed(3), text: c.replace(/[,;:]$/, '').replace(/…$/, '...') });
    });
  } else d = s.min ?? FIX[s.type] ?? 2;
  sh.t1 = +(t + d).toFixed(3); shots.push(sh); t += d;
});
cues.forEach((c, i) => { const nx = cues[i + 1]; if (nx && c.t1 > nx.t0 - 0.04) c.t1 = +(nx.t0 - 0.04).toFixed(3); });
fs.mkdirSync(path.join(D, 'out', film), { recursive: true });
fs.writeFileSync(path.join(D, 'out', film, 'timeline.json'), JSON.stringify({ film, dur: +t.toFixed(3), shots, cues }, null, 1));
fs.writeFileSync(path.join(D, 'out', film, 'cues_srt.json'), JSON.stringify(cues, null, 1));
const mmss = x => `${Math.floor(x / 60)}:${String(Math.floor(x % 60)).padStart(2, '0')}`;
const ch = [`0:00 ${SCR[0].chapterName || 'Intro'}`].concat(shots.filter(s => s.type === 'chapter').map(s => `${mmss(s.t0)} ${s.title[0] + s.title.slice(1).toLowerCase()}`));
const endS = shots.find(s => s.id === 'end1'); if (endS) ch.push(`${mmss(endS.t0)} Back to the room`);
fs.writeFileSync(path.join(D, 'out', film, 'chapters.txt'), ch.join('\n') + '\n');
console.log(`${film}: ${shots.length} scenes, ${cues.length} cues, ${t.toFixed(1)} s (${(t / 60).toFixed(2)} min)`);
