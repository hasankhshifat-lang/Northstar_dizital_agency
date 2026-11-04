# YouTube thumbnails (map view + hook heading)

1280×720 JPGs for every Which Life Next video, built by `make_thumbnails.py`. Each one is a satellite map
of where the story happened (Esri World Imagery, credited on the image), with the route or place pinned
and a 2–4 word hook that adds to the title and doesn't repeat it.

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
