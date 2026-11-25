# YouTube thumbnails (map view + hook heading)

Figma file "NorthStar Thumbnails": key `Kg0Qo4VpVpS5Ufwk0wr4Or`, https://www.figma.com/design/Kg0Qo4VpVpS5Ufwk0wr4Or (created 2026-11-11).

1280×720 JPGs for every Which Life Next video, built by `make_thumbnails.py`. Each one uses the same
illustrated map style as the channel's Shorts (parchment land, teal water, thin state lines, the story's
state highlighted in tan, a rust-red route with white waypoints, red teardrop pins, dark label tags), drawn
from Natural Earth vector data (public domain), plus a 2–4 word hook that adds to the title and doesn't repeat it.

Re-render: `python3 social/thumbnails/make_thumbnails.py [VIDEO_ID ...]` (writes `<VIDEO_ID>.jpg` + `contact-sheet.jpg`).
Vertical Shorts versions: `python3 social/thumbnails/make_thumbnails.py --vertical` (writes `<VIDEO_ID>_9x16.jpg`, 1080×1920, + `contact-sheet-9x16.jpg`).
Apply: `python3 .claude/skills/youtube-channel-automation/yt.py thumbnail VIDEO_ID social/thumbnails/VIDEO_ID.jpg`

| Video ID | Title | Hook | Map |
|---|---|---|---|
| A7IMwfCRwjg | The 12-Day Manhunt for Lincoln's Assassin | WHERE IS BOOTH? | Ford's Theatre → Garrett farm, VA |
| bwhHw3tLIDQ | The Shortcut That Trapped 87 People in the Snow | THE DEADLY SHORTCUT | Trail + Hastings Cutoff → Truckee Lake |
| ctoVTthJ_2w | They Carried Mail 1,900 Miles in 10 Days… | NEVER STOP RIDING | Pony Express, St. Joseph → Sacramento |
| dDlQidQ1y00 | The Fever That Emptied America's Capital (1793) | 20,000 FLED | Philadelphia outbreak rings |
| Fh02fn61e-w | A 60-Foot Wall of Water Hit This Town in 1889 | 57 MINUTES TO IMPACT | South Fork Dam → Johnstown |
| qL-ohGQCXDA | She Crawled Across a Flooded Bridge to Stop a Train | MIDNIGHT TRAIN DUE | Des Moines River bridge, Iowa |
| pXOy92KjJt4 | POV: Trillions of Them. Then They Vanished. | WHERE DID THEY GO? | 1875 locust swarm band |
| LhQtj0tc_q8 | POV: The Day the Sky Went Dark With Locusts | WHAT IS THAT CLOUD? | Kansas, swarm rolling in |
| Bxq73rQ54xk | POV: The Corn Was Gone by Morning (1874) | GONE OVERNIGHT | Nebraska under the swarm |
| NtC-QGdCfG0 | Could You Survive the Biggest Locust Swarm in History? | BIGGER THAN CALIFORNIA | Swarm band vs California outline |
| qbtwhG8IDL8 | POV: Found 12 Feet From His Own Door (1888) | TIE THE ROPE. | Dakota plains, house → barn rope |
| J5rJThy08hk | POV: She Tied 12 Kids Together to Survive a Blizzard | WALK OR FREEZE | Valley County, Nebraska |
| HyqmpcvzHKI | POV: 50°F to -27°F in One Afternoon (1888) | A 77° DROP | Huron, Dakota Territory |
| kQzq9g26F6Q | POV: Your First Winter as a Homesteader (1888) | 160 ACRES. ONE CATCH | Dakotas, 160-acre claim |
| pGNi9O6MFIA | POV: Miss July 4th on the Oregon Trail and Winter Wins | BEAT THE SNOW | Oregon Trail, Independence Rock |
| XiUBmGYlWOE | POV: You Have $300 to Survive the Oregon Trail | 600 LB OF FLOUR? | Full Oregon Trail |
| 7kxCubu2UdI | POV: The Oregon Trail Killer That Can Take You in 12 Hours | FINE AT BREAKFAST | Platte River Road, cholera graves |
| Dd6icXr-dW0 | POV: You Survive 30 Days on the Oregon Trail | WHAT KILLS YOU FIRST? | Day 1 → Day 30 on the trail |

Note: on Shorts, YouTube shows the custom thumbnail in search, the channel page and suggested videos;
the Shorts feed itself still shows a frame from the video.

## 9:16 Shorts thumbnails (public Shorts only)

1080×1920, same hook and map as the 16:9 version. The heading sits at the top and the map focus is in the middle;
the bottom ~400 px is kept clear for YouTube's title overlay.

| Video ID | Length | File |
|---|---|---|
| A7IMwfCRwjg | 1:53 | A7IMwfCRwjg_9x16.jpg |
| bwhHw3tLIDQ | 1:54 | bwhHw3tLIDQ_9x16.jpg |
| ctoVTthJ_2w | 1:59 | ctoVTthJ_2w_9x16.jpg |
| pXOy92KjJt4 | 0:31 | pXOy92KjJt4_9x16.jpg |
| qbtwhG8IDL8 | 0:54 | qbtwhG8IDL8_9x16.jpg |
| J5rJThy08hk | 0:51 | J5rJThy08hk_9x16.jpg |
| HyqmpcvzHKI | 0:50 | HyqmpcvzHKI_9x16.jpg |
| 7kxCubu2UdI | 0:40 | 7kxCubu2UdI_9x16.jpg |

Not included: Dd6icXr-dW0 (3:09), NtC-QGdCfG0 and kQzq9g26F6Q (8:39) are long-form; the other 7 videos are private.

| vy-qRhRjnN0 | THE GHOST ARMY (options: "1,100 ARTISTS", "FAKE ARMY, REAL WAR") | Normandy → Rhine route, 1944-45 | 9:16 |
| MIKECHICKEN | "NO HEAD / 18 MONTHS ALIVE" (2D cartoon, Remotion composition MikeThumb: headless rooster, cut-off head + axe on block) | PKdcctcYjfw |
| ulARZlhrP30_9x16.jpg (+ fb_1887036389329820_9x16.jpg) | The Night the Mississippi Ran Backward | AN EARTHQUAKE / DID THIS · FEB 7, 1812 · NEW MADRID | Figma "NorthStar Thumbnails" Kg0Qo4VpVpS5Ufwk0wr4Or node 2:3 (gpt-image-2.5-flare, 1 generation); saved from the Figma screenshot (432×768, upscaled) since export was blocked |
| balloon-bombs-2026-11-17_9x16.jpg (+ FB 1867753887551647) | Japan Bombed Oregon With Paper Balloons | SENT BY / THE WIND · MAY 5, 1945 · JAPAN · BLY, OREGON (options: "6 DIED ON A PICNIC", "NO PLANE. NO PILOT.") | **Made in Spline** (Figma seat limit): file NorthStar Thumbnails 1ef44a69-009a-4ebb-9ef4-f7f5e67e64dc, frame balloon-bombs-2026-11-17_9x16; vector map from real geodata (Spline AI: not enough credits); 0 generations |
| violet-jessop-2026-11-18_9x16.jpg (+ .props.json; YT VgIgGbrvjKc, FB 1139472315483528) | She Survived the Titanic and Both Its Sister Ships | SHE WOULDN'T / SINK · 1911 · 1912 · 1916 · pin SOUTHAMPTON (options: "3 SHIPS. 1 WOMAN.", "THE BABY IN BOAT 16?" rejected: disputed boat number) | **Remotion** (universal thumbnail skill, style map): portrait Violet Jessop in VAD uniform c.1915–17 (Wikimedia Commons, PD in the US: published before 1931; PD-UKGov) cut out with cutout.py; background Rand-McNally map of Europe 1912 (Library of Congress G&M, loc.gov/item/2007627462, no known restrictions); 0 AI generations; score 86/100 |
| northwest-angle-2026-11-19_9x16.jpg (+ .props.json; YT lycDlMhOJ_M, FB 41184886317776890) | Why Part of Minnesota Is Stuck in Canada | BLAME / THIS MAP · 1755 MAP · 1783 TREATY · label NORTHWEST ANGLE, MINN.; ring on the Mitchell Map's oval Lake of the Woods, arrow to the real Angle (options: "ONLY VIA CANADA", "CUT OFF BY A LINE" rejected: weaker subject / repeats the narration) | **Remotion** (universal thumbnail skill, style map): object = the 1755 Mitchell Map (Wikimedia Commons File:Mitchell_Map-06full2.jpg, public domain, published 1755), crop around Lake Superior/Lake of the Woods as a paper card; background = the channel's own map art (Natural Earth 10m lakes, us-atlas, world-atlas; still from the Short's map layer with no text); 0 AI generations; score 84/100 |
| t6fR0H1yYJo_9x16.jpg (+ .props.json; YT t6fR0H1yYJo, FB 1111102915088402) | He Stole a Confederate Warship and Sailed Past Fort Sumter | DISGUISED / AS CAPTAIN · date tag MAY 13, 1862 · label ROBERT SMALLS · pin CHARLESTON on the city (options: "HE FOOLED FORT SUMTER", "PAST 5 FORTS" rejected: weaker / count not in the script) | **Remotion** (universal thumbnail skill, style map): portrait Robert Smalls, Brady–Handy studio c.1870s (Library of Congress loc.gov/item/2017893186, via Wikimedia Commons, public domain) cut out with cutout.py; background US Coast Survey "Charleston Harbor and its approaches" 1863 (Wikimedia Commons, public domain); 0 AI generations; score 80/100 |
| FrsAQmXpo4o_9x16.jpg (+ .props.json; YT FrsAQmXpo4o, FB 1140531628523497) | The US Army Strapped Bombs to Bats | BATS BURNED / THIS BASE · date tag MAY 1943 · label REAL PHOTO · pin CARLSBAD, N.M. (options: "IT BACKFIRED", "THE DENTIST'S WEAPON" rejected: no image of the subject / weaker) | **Remotion** (universal thumbnail skill, style map): location = USAAF photo of the Carlsbad AAF fire after the bat bomb accident, 1943 (Wikimedia Commons File:Carlsbad_AAF_Fire_after_Bat_Bomb_Accident.jpg, PD-USGov, from Couffer 1992) as a paper print; object = the channel's own bat art with its capsule (Remotion still, transparent); background = the channel's New Mexico map art (us-atlas/world-atlas still, no text); 0 AI generations; score 84/100 |
| nJopWLqMnJU_9x16.jpg (+ .props.json; YT nJopWLqMnJU, FB 1169007055562745) | Chicago Lifted an Entire City Block | SHOPS STAYED / OPEN · label ON JACKSCREWS · tag REAL 1857 PRINT · pin CHICAGO (options: "ON 6,000 SCREWS", "THE CITY ROSE" rejected: number-only / vague) | **Remotion** (universal thumbnail skill, style map): object/location = Edward Mendel, "Street Raising on Lake Street", 1857 print (Chicago Historical Society, via Wikimedia Commons File:Street_Raising_on_Lake_Street.jpg, public domain in the US) cropped on the raised block, ring on the timbers + arrow; background = the channel's Great Lakes map art (us-atlas, world-atlas, Natural Earth 50m lakes; still with no text); 0 AI generations; score 80/100 |
| HyHsDj9vsYY_9x16.jpg (+ .props.json; YT HyHsDj9vsYY, FB 1655279699715872) | A Wave of Molasses Killed 21 People | ALL THIS FROM / SYRUP · date tag JAN 15, 1919 · label REAL 1919 PHOTO · pin NORTH END, BOSTON (options: "THE TANK BURST", "21 DEAD BY SYRUP" rejected: weaker / too close to the title) | **Remotion** (universal thumbnail skill, style map): location = aftermath on Commercial Street, 15 January 1919 (Boston Public Library via Wikimedia Commons File:BostonMolassesDisaster.jpg, public domain) as a paper print with a ring on the wreckage; background = the channel's Boston map art (us-atlas, clean still, no text); 0 AI generations; score 87/100 |
| g4FVyyqeJkg_9x16.jpg (+ .props.json; YT g4FVyyqeJkg, FB 1514865577177791) | The Olympic Marathon Winner Was Fed Rat Poison | HE STILL / WON GOLD · date tag AUG 30, 1904 · label RAT POISON IN HIS CUP · pin ST. LOUIS (options: "HIS TRAINERS DID IT", "POISONED AND WON" rejected: weaker / repeats the title) | **Remotion** (universal thumbnail skill, style map): face = Thomas J. Hicks, 1904 (Official Olympic Report via Wikimedia Commons File:1904_Thomas_J_Hicks.jpg, public domain in the US; 319×358 original, shown as an old paper print) over the channel's Missouri map art (us-atlas clean still), pin on St. Louis; 0 AI generations; score 82/100 (soft source photo) |
| zQ83JK9BaD8_9x16.jpg (+ .props.json; YT zQ83JK9BaD8, FB 2086095525415961) | He Robbed 28 Stagecoaches and Left Poems | CAUGHT BY / HIS LAUNDRY · date tag 1875–1883 · stamp MARK: F.X.O.7 · label BLACK BART · pin COPPEROPOLIS (options: "THE POET BANDIT", "NEVER FIRED A SHOT" rejected: weaker twist) | **Remotion** (universal thumbnail skill, style map): face = Charles E. Boles (Black Bart), 1888 or earlier (Wikimedia Commons File:Charles_Bowles_aka_Black_Bart.jpg, public domain in the US, published before 1931) as a paper print over the channel's California map art (us-atlas clean still), pin on Copperopolis; 0 AI generations; score 85/100 (a rembg cutout was tried first and dropped: jagged collar edge) |
| k-qXJ1fIzEI_9x16.jpg (+ .props.json; YT k-qXJ1fIzEI, FB 3624500004397728) | The Key That Left the Titanic Too Early | THEY HAD NO / BINOCULARS · date tag APRIL 1912 · label THE CROW'S NEST KEY · pin SOUTHAMPTON (options: "ONE MISSING KEY", "THE KEY THAT LEFT" rejected: repeat the title) | **Remotion** (universal thumbnail skill, style map): subject = RMS Titanic departing Southampton, 10 April 1912, F. G. O. Stuart (Wikimedia Commons File:RMS_Titanic_3_(cropped_to_ship).jpg, public domain) as a paper print + the film's own brass key art (TitanicKeyCut composition) over the channel's Atlantic map (clean still, 2× crop so the pin sits on Southampton); 0 AI generations; score 85/100 (first try with the Solent close-up dropped: clip line, mostly sea) |
| J96VCDgNvZg_9x16.jpg (+ .props.json; YT J96VCDgNvZg, FB 1496024465828975) | The Colony That Vanished, Leaving One Word | NO SIGN / OF DANGER · date tag AUGUST 1590 · label CARVED: CROATOAN · ring on the carved word · pin ROANOKE ISLAND (options: "WHERE DID / THEY GO?", "ONE WORD LEFT" rejected: generic / repeats the title) | **Remotion** (universal thumbnail skill, style map): subject = "CROATOAN, The Lost Colony", engraving by W. L. Sheppard & W. J. Linton, 1876 (Wikimedia Commons, public domain: published 1876, both artists died before 1913) as a paper print over the channel's Outer Banks map (clean still, 1.25× crop so the pin sits on Roanoke Island); 0 AI generations; score 84/100 (first try fixed: crop clipped the C, ring missed the word) |
| 09dDXApuIGM_9x16.jpg (+ .props.json; YT 09dDXApuIGM, FB 1112249251650407) | A Teacher in Her 60s Went Over Niagara Falls | SURVIVED IT, / DIED POOR · date tag OCT 24, 1901 · label REAL 1901 PHOTO · pin NIAGARA FALLS (options: "AND SHE LIVED", "HER MANAGER STOLE IT" rejected: weaker / spoils less) | **Remotion** (universal thumbnail skill, style map): face = Annie Edson Taylor with her barrel, 1901 (Wikimedia Commons File:Annie_Taylor.jpg, public domain, published 1901) as a paper print over the channel's Great Lakes map (clean still, 1.25× crop so the pin sits on Niagara Falls); 0 AI generations; score 87/100 (accent fixed to word-level on the second render) |
