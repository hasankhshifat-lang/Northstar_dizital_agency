// "No Lives Lost" — the single timeline. 72 BPM, one beat = 0.8333 s; key actions sit on the grid.
// film.js (picture), tools/export.mjs (voice cues, subtitles) and mix.py (via out/timeline.json) read it.
export const BPM = 72, BEAT = 60 / BPM, DUR = 57.0;
export const b = n => +(n * BEAT).toFixed(4);

export const HIT = {
  lightOn: b(1),       // 0.667  tubes catch
  drop1: b(1.5),         // 1.25   loupe lands on the New Haven Union
  dive1: b(2.5),        // 1.875  push into the lens
  lineDate: b(3),        // 2.5    "MONDAY EVENING, APRIL 15, 1912" lights
  lineAfloat: b(7),    // 4.583  "TITANIC AFLOAT,"
  lineLost: b(9),        // 5.833  "NO LIVES LOST,"
  pull0: b(10.5),           // 6.667  0 lifts out as a reading
  rise1: b(12),          // 8.333  out of the lens
  lift1: b(13),       // 8.958  loupe lifts
  drop2: b(13.5),       // 9.792  loupe lands on the White Star office negative
  develop: b(14),     // 10.208 negative -> positive
  dive2: b(15),          // 10.833 push into the lens
  enter2: b(16.5),       // 12.083 inside the street photograph
  crowdLbl: b(16),       // 12.5   label: White Star Line office
  rise2: b(20.5),        // 14.583 out of the photograph
  sank: b(21.5),           // 15.833 back on the Union: "already sunk" pinned to its date line
  trib: b(27),         // 19.583 the Tribune line lights: 1,340
  med: b(32),            // 23.333 the Medford line lights: 1,492
  drop3: b(37),        // 27.083 loupe lands on the lifeboat negative
  develop3: b(37.5),       // 27.5
  dive3: b(38.5),          // 28.333 push into the lens
  suck: b(40),         // 29.583 breath in
  enter3: b(40.5),         // 30.0   inside the lifeboat photograph (the downbeat)
  boatLbl: b(41.5),        // 30.833 label: lifeboats
  count706: b(42),       // 31.667 706 picked up
  rise3: b(49.5),        // 36.25  out of the photograph
  compare: b(50.5),      // 37.083 both records side by side (held)
  hush: b(54),         // 40.417 silence before the verdict
  verdict: b(59),      // 41.25  0 struck, 1,517 held
  index: b(61.5),        // 43.75  pull back; index rows fly in
  endCard: b(63),        // 45.0   end card
};

// narration (Kokoro); t = start; durations come from voice/out at build time
export const VOICE = [
  { id: 'L1', t: 0.5, text: 'Monday evening, April fifteenth, nineteen twelve.' },
  { id: 'L2', t: 4.1, text: 'A New Haven paper tells its readers: Titanic afloat. No lives lost.' },
  { id: 'L3', t: 10.9, text: "In New York, crowds push into the White Star Line's office, waiting for names." },
  { id: 'L4', t: 16.7, text: 'But the ship had sunk before dawn, hours before that paper was printed.' },
  { id: 'L5', t: 21.8, text: 'Tuesday morning, the New-York Tribune: thirteen hundred and forty dead.' },
  { id: 'L6', t: 26.8, text: 'In Oregon, the count is fourteen ninety-two.' },
  { id: 'L7', t: 34.5, text: 'The Carpathia picked up seven hundred and six people from the lifeboats.' },
  { id: 'L8', t: 39.5, text: 'Everyone else was gone.' },
  { id: 'L9', t: 42.6, text: 'No lives lost, the paper said.' },
  { id: 'L10', t: 46.0, text: 'The National Archives count: fifteen hundred and seventeen died.' },
];

// subtitles: one English line per cue, never wrapped (long lines split into cues; `from` = the word a cue starts on)
export const SUBS = [
  { id: 'S1', line: 'L1', en: 'Monday evening, April 15, 1912.' },
  { id: 'S2a', line: 'L2', en: 'A New Haven paper tells its readers:' },
  { id: 'S2b', line: 'L2', from: 'Titanic', en: 'Titanic afloat. No lives lost.' },
  { id: 'S3a', line: 'L3', en: 'In New York, crowds push into the' },
  { id: 'S3b', line: 'L3', from: 'White', en: "White Star Line's office, waiting for names." },
  { id: 'S4a', line: 'L4', en: 'But the ship had sunk before dawn,' },
  { id: 'S4b', line: 'L4', from: 'hours', en: 'hours before that paper was printed.' },
  { id: 'S5a', line: 'L5', en: 'Tuesday morning, the New-York Tribune:' },
  { id: 'S5b', line: 'L5', from: '1340', en: '1,340 dead.' },
  { id: 'S6', line: 'L6', en: 'In Oregon, the count is 1,492.' },
  { id: 'S7a', line: 'L7', en: 'The Carpathia picked up 706 people' },
  { id: 'S7b', line: 'L7', from: 'from', en: 'from the lifeboats.' },
  { id: 'S8', line: 'L8', en: 'Everyone else was gone.' },
  { id: 'S9', line: 'L9', en: 'No lives lost, the paper said.' },
  { id: 'S10a', line: 'L10', en: 'The National Archives count:' },
  { id: 'S10b', line: 'L10', from: '1500', en: '1,517 died.' },
];
