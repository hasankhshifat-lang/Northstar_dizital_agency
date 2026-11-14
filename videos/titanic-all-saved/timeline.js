// "No Lives Lost" — the single timeline. 72 BPM, one beat = 0.8333 s; key actions sit on the grid.
// film.js (picture), tools/export.mjs (voice cues, subtitles) and mix.py (via out/timeline.json) read it.
export const BPM = 72, BEAT = 60 / BPM, DUR = 50.0;
export const b = n => +(n * BEAT).toFixed(4);

export const HIT = {
  lightOn: b(0.8),       // 0.667  tubes catch
  drop1: b(1.5),         // 1.25   loupe lands on the New Haven Union
  dive1: b(2.25),        // 1.875  push into the lens
  lineDate: b(3),        // 2.5    "MONDAY EVENING, APRIL 15, 1912" lights
  lineAfloat: b(5.5),    // 4.583  "TITANIC AFLOAT,"
  lineLost: b(7),        // 5.833  "NO LIVES LOST,"
  pull0: b(8),           // 6.667  0 lifts out as a reading
  rise1: b(10),          // 8.333  out of the lens
  lift1: b(10.75),       // 8.958  loupe lifts
  drop2: b(11.75),       // 9.792  loupe lands on the White Star office negative
  develop: b(12.25),     // 10.208 negative -> positive
  dive2: b(13),          // 10.833 push into the lens
  enter2: b(14.5),       // 12.083 inside the street photograph
  crowdLbl: b(15),       // 12.5   label: White Star Line office
  rise2: b(17.5),        // 14.583 out of the photograph
  sank: b(19),           // 15.833 back on the Union: "already sunk" pinned to its date line
  trib: b(23.5),         // 19.583 the Tribune line lights: 1,340
  med: b(28),            // 23.333 the Medford line lights: 1,492
  drop3: b(32.5),        // 27.083 loupe lands on the lifeboat negative
  develop3: b(33),       // 27.5
  dive3: b(34),          // 28.333 push into the lens
  suck: b(35.5),         // 29.583 breath in
  enter3: b(36),         // 30.0   inside the lifeboat photograph (the downbeat)
  boatLbl: b(37),        // 30.833 label: lifeboats
  count706: b(38),       // 31.667 706 picked up
  rise3: b(43.5),        // 36.25  out of the photograph
  compare: b(44.5),      // 37.083 both records side by side (held)
  hush: b(48.5),         // 40.417 silence before the verdict
  verdict: b(49.5),      // 41.25  0 struck, 1,517 held
  index: b(52.5),        // 43.75  pull back; index rows fly in
  endCard: b(54),        // 45.0   end card
};

// narration (Kokoro); t = start; durations come from voice/out at build time
export const VOICE = [
  { id: 'L1', t: 0.4, text: 'Monday evening, April fifteenth, nineteen twelve.' },
  { id: 'L2', t: 3.4, text: 'A New Haven paper tells its readers: Titanic afloat. No lives lost.' },
  { id: 'L3', t: 9.6, text: "In New York, crowds push into the White Star Line's office, waiting for names." },
  { id: 'L4', t: 15.4, text: 'But the ship had sunk before dawn, hours before that paper was printed.' },
  { id: 'L5', t: 19.8, text: 'Tuesday morning, the New-York Tribune: thirteen hundred and forty perish.' },
  { id: 'L6', t: 23.9, text: 'In Oregon, the count is fourteen ninety-two.' },
  { id: 'L7', t: 30.6, text: 'The Carpathia picked up seven hundred and six people from the lifeboats.' },
  { id: 'L8', t: 34.4, text: 'Everyone else was gone.' },
  { id: 'L9', t: 37.4, text: 'No lives lost, the paper said.' },
  { id: 'L10', t: 41.8, text: 'The National Archives count: of two thousand two hundred and twenty-three aboard, fifteen hundred and seventeen died.' },
];

// subtitles: one English line per cue, never wrapped (long lines split into cues; `from` = the word a cue starts on)
export const SUBS = [
  { id: 'S1', line: 'L1', en: 'Monday evening, April 15, 1912.' },
  { id: 'S2a', line: 'L2', en: 'A New Haven paper tells its readers:' },
  { id: 'S2b', line: 'L2', from: 'Titanic', en: 'Titanic afloat. No lives lost.' },
  { id: 'S3a', line: 'L3', en: 'In New York, crowds push into' },
  { id: 'S3b', line: 'L3', from: 'the', en: "the White Star Line's office, waiting for names." },
  { id: 'S4a', line: 'L4', en: 'But the ship had sunk before dawn,' },
  { id: 'S4b', line: 'L4', from: 'hours', en: 'hours before that paper was printed.' },
  { id: 'S5a', line: 'L5', en: 'Tuesday morning, the New-York Tribune:' },
  { id: 'S5b', line: 'L5', from: 'thirteen', en: '1,340 perish.' },
  { id: 'S6', line: 'L6', en: 'In Oregon, the count is 1,492.' },
  { id: 'S7a', line: 'L7', en: 'The Carpathia picked up 706 people' },
  { id: 'S7b', line: 'L7', from: 'from', en: 'from the lifeboats.' },
  { id: 'S8', line: 'L8', en: 'Everyone else was gone.' },
  { id: 'S9', line: 'L9', en: 'No lives lost, the paper said.' },
  { id: 'S10a', line: 'L10', en: 'The National Archives count:' },
  { id: 'S10b', line: 'L10', from: 'of', en: 'of 2,223 aboard, 1,517 died.' },
];
