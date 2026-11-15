// Episode timing. usage:
//   node tools/export.mjs <episode_dir> lines <film>      -> voice/<film>/lines.json (one voice line per shot that has `say`)
//   node tools/export.mjs <episode_dir> timeline <film>   -> out/<film>/timeline.json (shot times from the real voice
//                                                            durations in voice/<film>/out/dur.json, subtitle cues)
// A shot lasts lead + voice + tail, at least its type's minimum. Subtitles: the line split into one-line cues
// (≤ 42 characters long-form, ≤ 32 in a Short), timed by their share of the line.
import fs from 'fs'; import path from 'path';
const [D0, mode, film = 'long'] = process.argv.slice(2);
const D = path.resolve(D0 || '.');
const EP = JSON.parse(fs.readFileSync(path.join(D, 'episode.json'), 'utf8'));
const F = EP.films[film]; if (!F) throw new Error(`no film "${film}" in episode.json`);
const shots = F.shots;
const id = i => `${film}_${String(i).padStart(3, '0')}`;
if (mode === 'lines') {
  const lines = shots.map((s, i) => s.say ? { id: id(i), text: s.say } : null).filter(Boolean);
  fs.mkdirSync(path.join(D, 'voice', film), { recursive: true });
  fs.writeFileSync(path.join(D, 'voice', film, 'lines.json'), JSON.stringify(lines, null, 1));
  console.log(lines.length, 'lines,', lines.reduce((a, l) => a + l.text.split(/\s+/).length, 0), 'words');
  process.exit(0);
}
const dur = JSON.parse(fs.readFileSync(path.join(D, 'voice', film, 'out', 'dur.json'), 'utf8'));
const MIN = { title: 4.5, table: 4.5, read: 6.5, photo: 8.5, chapter: 3.4, compare: 7.5, end: 8.5 };
const LEAD = { title: 1.0, table: 0.5, read: 0.9, photo: 1.2, chapter: 0.6, compare: 0.6, end: 1.0 };
const TAIL = 0.75, maxC = film === 'short' ? 32 : 42;
let t = 0, bad = 0; const out = [], cues = [];
shots.forEach((s, i) => {
  const vd = s.say ? dur[id(i)] : 0;
  if (s.say && !(vd > 0)) throw new Error(`no voice duration for ${id(i)}`);
  const lead = s.lead ?? LEAD[s.type] ?? 0.6;
  const d = Math.max(MIN[s.type] ?? 4, lead + vd + TAIL, s.min ?? 0);
  const sh = { ...s, t0: +t.toFixed(3), t1: +(t + d).toFixed(3) };
  if (s.say) { sh.voice = id(i); sh.vt = +(t + lead).toFixed(3); sh.vdur = vd; }
  out.push(sh);
  if (s.say) {                                                    // one-line cues
    const words = s.say.replace(/\s+/g, ' ').trim().split(' '), chunks = []; let cur = '';
    for (const w of words) {
      const tst = cur ? cur + ' ' + w : w;
      if (tst.length > maxC && cur) { chunks.push(cur); cur = w; } else cur = tst;
      if (/[.!?;:]$/.test(w) && cur.length > maxC * 0.45) { chunks.push(cur); cur = ''; }
    }
    if (cur) chunks.push(cur);
    const total = chunks.reduce((a, c) => a + c.length, 0); let acc = 0;
    chunks.forEach((c, j) => {
      const a = sh.vt + vd * acc / total; acc += c.length;
      const b = j === chunks.length - 1 ? sh.vt + vd + 0.6 : sh.vt + vd * acc / total;
      cues.push({ t0: +a.toFixed(3), t1: +b.toFixed(3), text: c.replace(/[,;:]$/, '') });
    });
  }
  t += d;
});
cues.forEach((c, i) => { const nx = cues[i + 1]; if (nx && c.t1 > nx.t0 - 0.04) c.t1 = +(nx.t0 - 0.04).toFixed(3); if (c.t1 - c.t0 < 0.9) { console.error('short cue', c.text, (c.t1 - c.t0).toFixed(2)); } });
const [Wd, Ht] = (F.size || (film === 'short' ? '1080x1920' : '1920x1080')).split('x').map(Number);
fs.mkdirSync(path.join(D, 'out', film), { recursive: true });
fs.writeFileSync(path.join(D, 'out', film, 'timeline.json'), JSON.stringify({ film, W: Wd, H: Ht, dur: +t.toFixed(3), shots: out, cues }, null, 1));
fs.writeFileSync(path.join(D, 'out', film, 'cues_srt.json'), JSON.stringify(cues.map(c => ({ t0: c.t0, t1: c.t1, text: c.text })), null, 1));
const chapters = out.filter(s => s.type === 'chapter' || s.type === 'title').map(s => `${String(Math.floor(s.t0 / 60)).padStart(1, '0')}:${String(Math.floor(s.t0 % 60)).padStart(2, '0')} ${s.chapterName || s.title}`);
fs.writeFileSync(path.join(D, 'out', film, 'chapters.txt'), chapters.join('\n') + '\n');
console.log(`${film}: ${out.length} shots, ${cues.length} cues, ${t.toFixed(1)} s (${(t / 60).toFixed(2)} min)`);
process.exit(bad);
