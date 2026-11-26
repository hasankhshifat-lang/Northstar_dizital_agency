import json, os
# Storyboard = the shot list below. Each shot's purpose is in the comment above it.
# Newspaper line boxes come from the Library of Congress OCR (ALTO TextLine coordinates) of each page, scaled to
# raw/<id>.jpg (raw/<id>.lines.json, made by the research step; raw/ is git-ignored). Every quoted line was read on the
# scan itself (the OCR text is noisy); see FACTS.md.
H = os.path.dirname(os.path.abspath(__file__))
LN = {}
def L(item, *ranges):
    if item not in LN: LN[item] = json.load(open(f'{H}/raw/{item}.lines.json'))
    out = []
    for r in ranges:
        a, b = (r, r) if isinstance(r, int) else r
        out += [LN[item][i][1:] for i in range(a, b + 1)]
    return out

items = [
 dict(id="herald7", kind="paper", src="raw/herald7.jpg", label="THE NEW YORK HERALD · 7 JUL 1876 · P. 3", short="The New York Herald, 7 July 1876", catalog="LCCN sn83030313", row="\"could not believe it\""),
 dict(id="sheridan", kind="print", src="raw/3c31934u.tif", crop=[150, 150, 3100, 3850], horizon=0, nomask=True, inches=8, label="LT. GEN. PHILIP H. SHERIDAN · ENGRAVING", short="Lieut. Gen. Philip H. Sheridan (engraving)", catalog="LC-USZ62-131934", credit="Library of Congress, Prints & Photographs"),
 dict(id="trib6", kind="paper", src="raw/trib6.jpg", label="NEW-YORK TRIBUNE · 6 JUL 1876", short="New-York Tribune, 6 July 1876", catalog="LCCN sn83030214", row="\"315 in number\""),
 dict(id="sbull", kind="print", src="raw/3c22859u.tif", crop=[400, 150, 2900, 3550], horizon=0, nomask=True, inches=7, label="SITTING BULL · HUNKPAPA LAKOTA · 1884", short="Sitting Bull, photographed 1884", catalog="LC-USZ62-122859", credit="Palmquist & Jurgens, 1884"),
 dict(id="boz7", kind="paper", src="raw/boz7.jpg", label="BOZEMAN AVANT COURIER · 7 JUL 1876", short="Bozeman Avant Courier, 7 July 1876", catalog="LCCN sn84038123", row="the rider, Monday 3 July"),
 dict(id="trib5", kind="paper", src="raw/trib5.jpg", label="NEW-YORK TRIBUNE · 5 JUL 1876", short="New-York Tribune, 5 July 1876", catalog="LCCN sn83030214", row="the hundredth Fourth"),
 dict(id="centen", kind="print", src="raw/1s01695u.tif", crop=[520, 200, 2480, 2050], horizon=1100, nomask=True, inches=6, label="MAIN BUILDING, CENTENNIAL EXHIBITION · PHILADELPHIA 1876", short="Centennial Exhibition, Main Building (stereograph)", catalog="LC-DIG-stereo-1s01695", credit="Centennial Photographic Co., 1876"),
 dict(id="helena6", kind="paper", src="raw/helena6.jpg", label="HELENA WEEKLY HERALD · 6 JUL 1876", short="Helena Weekly Herald, 6 July 1876", catalog="LCCN sn84036143", row="\"literally true\""),
 dict(id="sherman", kind="print", src="raw/56337u.tif", crop=[100, 180, 1930, 2980], horizon=0, nomask=True, inches=6, label="GEN. WILLIAM T. SHERMAN · CARTE DE VISITE", short="Gen. William Tecumseh Sherman (photograph)", catalog="LC-DIG-ppmsca-56337", credit="Library of Congress, Prints & Photographs"),
 dict(id="natrep7", kind="paper", src="raw/natrep7.jpg", label="NATIONAL REPUBLICAN · WASHINGTON · 7 JUL 1876", short="National Republican, 7 July 1876", catalog="LCCN sn86053573", row="\"confirm the newspaper reports\""),
 dict(id="star7", kind="paper", src="raw/star7.jpg", label="EVENING STAR · WASHINGTON · 7 JUL 1876", short="Evening Star, 7 July 1876", catalog="LCCN sn83045462", row="261 buried"),
 dict(id="ford", kind="print", src="raw/3a13422u.tif", crop=[100, 40, 1270, 1500], horizon=500, nomask=True, inches=6, label="CAMP AT THE FORD, CUSTER'S BATTLEFIELD · S. J. MORROW", short="Captain Sanderson's camp at the ford (S. J. Morrow)", catalog="LC-USZ62-11021", credit="S. J. Morrow, Yankton, D.T."),
 dict(id="trib7", kind="paper", src="raw/trib7.jpg", label="NEW-YORK TRIBUNE · 7 JUL 1876", short="New-York Tribune, 7 July 1876", catalog="LCCN sn83030214", row="\"some doubt\""),
 dict(id="boards", kind="print", src="raw/1s41973u.tif", crop=[480, 330, 2700, 2800], horizon=1090, nomask=True, inches=6, label="CUSTER'S BATTLEFIELD · LETTERING THE HEAD-BOARDS · 1879", short="Custer's battlefield, lettering the head-boards (stereograph)", catalog="LC-DIG-stereo-1s41973", credit="S. J. Morrow, 1879"),
 dict(id="custer", kind="print", src="raw/33129u.tif", crop=[60, 120, 3220, 4700], horizon=0, nomask=True, inches=7, label="GEORGE ARMSTRONG CUSTER", short="George Armstrong Custer (photograph)", catalog="LC-DIG-ppmsca-33129", credit="Library of Congress, Prints & Photographs"),
]
B = dict(
 h_head=L('herald7', (0, 3)), h_papers=L('herald7', (27, 29)), h_incred=L('herald7', (31, 34)), h_round=L('herald7', (34, 37)),
 h_cred=L('herald7', (46, 52)), h_horrible=L('herald7', (56, 61)), h_nosuch=L('herald7', (66, 72)),
 h_istrue=L('herald7', (223, 224)), h_terrible=L('herald7', (228, 230)), h_rap=L('herald7', (292, 295)),
 t6_head=L('trib6', (493, 497)), t6_boz=L('trib6', (563, 566)), t6_315=L('trib6', (576, 580)),
 b_head=L('boz7', (175, 178)), b_taylor=L('boz7', (212, 216)),
 t5_cent=L('trib5', (14, 16)),
 he_gloom=L('helena6', (732, 735)), he_true=L('helena6', (736, 738)),
 n_adv=L('natrep7', (222, 224)), n_idle=L('natrep7', (241, 243)), n_conf=L('natrep7', (252, 255)),
 s_261=L('star7', (316, 321)),
 t7_doubt=L('trib7', (230, 234)),
)
long = [
 # COLD OPEN (variation from the last five: opens on a face, not a page or a title card): the surprise is the person
 dict(type="photo", item="sheridan", focus=[1640, 1230], nf=0.6, zoom=1.15, drift=[0, -0.2],
  say="On the morning of July sixth, eighteen seventy six, General Philip Sheridan found out that Custer was dead. He read it in the newspaper. Like everyone else."),
 # the printed proof of the hook
 dict(type="read", item="herald7", boxes=B['h_papers'],
  say="That's how the New York Herald put it. He said he had read the painful narrative, in the morning papers."),
 dict(type="read", item="herald7", boxes=B['h_incred'],
  say="He had no news at all. The whole thing was a surprise to him, a mystery, and so incredible that he could not believe it."),
 # title: the conflict and the two questions (no answer yet)
 dict(type="title", item="herald7", title="Read It in the Papers", sub="LITTLE BIGHORN · JULY 1876 · AS PRINTED", chapterName="Morning papers",
  say="Sheridan commanded the army's Division of the Missouri. The war against the Lakota and the Northern Cheyenne was his. So how did a newspaper know before he did? And when the papers and the generals disagreed, who turned out to be right?"),
 dict(type="chapter", kicker="PART 1", title="Every man killed", chapterName="Every man killed", item="trib6", say="Part one. Every man killed."),
 # the printed claim, exactly as the readers saw it
 dict(type="read", item="trib6", boxes=B['t6_head'],
  say="The New York Tribune, Thursday morning, July sixth. Fearful massacre by Indians. General Custer killed. Every man killed. Three hundred and fifteen in number."),
 # the main subject, seen: who the headline is about
 dict(type="photo", item="custer", focus=[1560, 1950], nf=0.6, zoom=1.1, drift=[0, -0.2], labels=[dict(at=[1560, 1250], text="George Armstrong Custer", sub="Lt. Col., 7th Cavalry · 1839–1876")],
  say="George Armstrong Custer was thirty six. In the Civil War he had been made a general at twenty three, and he was one of the best known soldiers in the country. Now the paper said he was dead, with every man around him."),
 # where it came from: not the army
 dict(type="read", item="trib6", boxes=B['t6_boz'],
  say="Further down, the source. A dispatch from Bozeman, Montana Territory, dated July third, seven p.m. A Mister Taylor, bearer of dispatches from the Little Horn to Fort Ellis, had arrived that evening."),
 dict(type="read", item="trib6", boxes=B['t6_315'], card=dict(label="AS PRINTED · 6 JUL 1876", value="315", unit="killed", source="New-York Tribune"),
  say="Custer, and thirteen officers, and every man belonging to the five companies were killed. Reno retreated. The whole number killed, was three hundred and fifteen."),
 # the open loop: the number we will check at the end
 dict(type="table", item="trib6", zoom=0.8,
  say="Notice what's missing. No army source. No official list. Just a rider, a town in Montana, and a telegraph wire. And three hundred and fifteen is a very exact number for a story like that. Keep it in mind. We'll check it at the end."),
 dict(type="chapter", kicker="PART 2", title="The rider", chapterName="The rider", item="boz7", say="Part two. The rider."),
 # context, from the other side of the river: who won, and where
 dict(type="photo", item="sbull", focus=[1590, 1900], nf=0.5, zoom=1.1, drift=[0, 0.2], labels=[dict(at=[1650, 1150], text="Sitting Bull", sub="Hunkpapa Lakota · photographed 1884")],
  say="First, what had happened. On June twenty fifth, Custer's Seventh Cavalry attacked a large village of Lakota and Northern Cheyenne people, on the Little Bighorn River, in what is now Montana. Sitting Bull, the Hunkpapa Lakota leader, was in that village. The warriors who defended it won the battle."),
 dict(type="read", item="boz7", boxes=B['b_head'],
  say="The papers called it a massacre. This is Bozeman's own weekly, the Avant Courier, on July seventh. The gallant Custer, killed."),
 # the rider, named, with the day he arrived
 dict(type="read", item="boz7", boxes=B['b_taylor'],
  say="We give below the report of Mister H. M. Taylor, bearer of dispatches from General Gibbon to Fort Ellis. Mister Taylor arrived here Monday evening."),
 dict(type="table", item="boz7", zoom=0.75,
  say="That Monday was July third. The battle was eight days old. Taylor was a civilian scout, carrying army mail from Colonel John Gibbon's column. Bozeman had a telegraph. And the next day, the whole country was throwing the biggest party in its history."),
 dict(type="chapter", kicker="PART 3", title="The hundredth Fourth", chapterName="The hundredth Fourth", item="trib5", say="Part three. The hundredth Fourth."),
 dict(type="read", item="trib5", boxes=B['t5_cent'],
  say="July fifth. The national celebration of the hundredth anniversary of our existence as an independent republic took place yesterday at Philadelphia."),
 # the place: where the generals were when the news arrived
 dict(type="photo", item="centen", focus=[1500, 1100], nf=0.4, drift=[0.25, 0], labels=[dict(at=[1500, 700], text="Main Building", sub="Centennial Exhibition · Philadelphia, 1876")],
  say="Philadelphia was hosting the Centennial Exhibition. This is its Main Building, in eighteen seventy six. That week the city was full of veterans, politicians, and generals. Remember that. It matters in a minute."),
 # Montana believes it
 dict(type="read", item="helena6", boxes=B['he_gloom'],
  say="Out in Helena, Montana, the news arrived in the middle of the party. The news received last evening, of the defeat of Custer, fell upon the festivities of the day, with a gloom that could not be shaken off."),
 dict(type="read", item="helena6", boxes=B['he_true'],
  say="There is only too much reason to believe, that the facts given in the extras of last evening, are literally true."),
 dict(type="table", item="helena6", zoom=0.75,
  say="Montana believed it. The men who brought the news were known there. The story went out on the wire, through Salt Lake City, and east. To a hotel in Philadelphia, where the two most senior generals in the army were staying."),
 dict(type="chapter", kicker="PART 4", title="Too terrible", chapterName="Too terrible", item="herald7", say="Part four. Too terrible."),
 dict(type="read", item="herald7", boxes=B['h_head'],
  say="The New York Herald, the next morning. The massacre. The gallant cavalry leader's death officially confirmed. An interview with General Sheridan."),
 # the doubt, in Sheridan's words: what the print lacked
 dict(type="read", item="herald7", boxes=B['h_round'],
  say="He was the more surprised, the Herald wrote, because the news came in such a roundabout way. Why were there no narratives in the New York papers, from the special correspondents?"),
 dict(type="read", item="herald7", boxes=B['h_cred'],
  say="If you will analyze the despatch, you will see that it comes without any of the marks of credence. It does not come to headquarters. It does not come to the leading papers from special correspondents. It appears first in a Salt Lake and Montana paper."),
 dict(type="read", item="herald7", boxes=B['h_nosuch'],
  say="Even if Custer had fallen into an engagement, he said, there would not have been the slaughter here described. A fight was probable, and a defeat possible. But no such defeat, as is here described."),
 # the second general, and the scene the reporter saw
 dict(type="photo", item="sherman", focus=[1008, 1330], nf=0.6, zoom=1.15, drift=[0, -0.15],
  say="His superior was in Philadelphia too. William Tecumseh Sherman, the commanding general of the army. The Herald found him at his hotel, coat and boots off, in an easy chair by the window. And before the reporter could ask a thing, Sherman asked him."),
 dict(type="read", item="herald7", boxes=B['h_istrue'],
  say="Is it true? What news have you got? What about Custer?"),
 dict(type="read", item="herald7", boxes=B['h_terrible'],
  say="It seems almost too terrible to be entirely true. It must be exaggerated. I cannot believe that Custer, and his whole command, would be swept away."),
 # THE TURN (about mid-video): the confirmation arrives during the interview
 dict(type="read", item="herald7", boxes=B['h_rap'],
  say="Sherman explained how real news would travel: by telegraph, to Sheridan, and then to him. Even while the General was finishing this sentence, there was a rap at the door, and a telegram was brought to him. The death of Custer was confirmed."),
 dict(type="table", item="herald7", zoom=0.8,
  say="The story he had just called exaggerated was confirmed in the middle of the interview. So where had the army's own news been all this time?"),
 dict(type="chapter", kicker="PART 5", title="Without advices", chapterName="Without advices", item="natrep7", say="Part five. Without advices."),
 dict(type="read", item="natrep7", boxes=B['n_adv'],
  say="In Washington, the War Department, as well as the Indian office, was without advices, indicating a possible event of this character."),
 dict(type="read", item="natrep7", boxes=B['n_idle'],
  say="Throughout the day, it was hoped that the reports were idle, or else that they were vastly exaggerated."),
 # the record: the army's own telegram admits the papers were first
 dict(type="read", item="natrep7", boxes=B['n_conf'], card=dict(label="TERRY'S DISPATCH · WRITTEN 2 JUL", value="6 JUL", unit="reached Washington", source="National Republican, 7 Jul 1876"),
  say="Then, late in the afternoon, a telegram from Sheridan's staff in Chicago. Dispatches from General Terry, dated at his camp, mouth of Big Horn, July second, confirm the newspaper reports of a fight on the twenty fifth of June, on the Little Big Horn, and of Custer's death."),
 dict(type="table", item="natrep7", zoom=0.8,
  say="Confirm the newspaper reports. That's the army's own telegram. General Terry's dispatch was written on July second. It reached the War Department on the afternoon of July sixth. After the papers."),
 dict(type="read", item="star7", boxes=B['s_261'],
  say="Washington's Evening Star printed Sherman's own message that day. The dispatch, sent by Captain Smith to Bismarck, confirms the report of the scout from Fort Ellis. Two hundred and sixty one of the dead are buried, and fifty wounded have been carried from the field to the steamboat."),
 dict(type="chapter", kicker="PART 6", title="Boat against rider", chapterName="Boat against rider", item="star7", say="Part six. Boat against rider."),
 # why the army was slow: the place itself (picture), and the two roads out
 dict(type="photo", item="ford", focus=[600, 700], nf=0.45, drift=[0.2, 0], labels=[dict(at=[600, 560], text="Camp at the ford", sub="Custer's battlefield · photographed a few years later")],
  say="Sent to Bismarck. That's the answer. The army's report went with the wounded, down the Bighorn, the Yellowstone and the Missouri, on the steamboat Far West. This photograph, from a few years later, shows how far from anything this place was. The boat reached Bismarck, in Dakota Territory, late on July fifth."),
 dict(type="read", item="boz7", boxes=B['b_taylor'][-1:],
  say="Taylor went overland instead, to Fort Ellis and Bozeman, where a telegraph office was waiting. He reached a wire about two days before the boat did."),
 # Sheridan's own question, answered
 dict(type="read", item="herald7", boxes=B['h_round'][2:],
  say="And Sheridan's question? Why no narratives from the special correspondents? There was one. Mark Kellogg, a reporter writing for the Bismarck Tribune, rode with Custer. He was killed with him, on June twenty fifth."),
 dict(type="chapter", kicker="PART 7", title="The count", chapterName="The count", item="trib6", say="Part seven. The count."),
 # VERDICT: the printed number against the record, printed one struck
 dict(type="compare", a=dict(label="NEW-YORK TRIBUNE · 6 JUL 1876", quote="\"The whole number killed was 315.\"", value="315", unit="killed, as printed"),
  b=dict(label="THE RECORD · NATIONAL PARK SERVICE", quote="7th Cavalry soldiers, scouts and civilians killed or mortally wounded", value="268", unit="killed", source="NPS, Little Bighorn Battlefield"), strike="a",
  say="So, the number. As printed: three hundred and fifteen killed. As counted today by the National Park Service: two hundred and sixty eight soldiers, scouts and civilians. About two hundred and ten of them were in Custer's five companies, and none of those men survived. Lakota and Cheyenne losses are estimated at somewhere between thirty and about a hundred."),
 dict(type="read", item="herald7", boxes=B['h_horrible'],
  say="Remember what Sheridan said. The story was so horrible that he could only accept it when it came officially. And when the truth was known, it would be found less alarming than is here printed."),
 # what the doubt cost (picture), non-graphic: the head-boards, three years on
 dict(type="photo", item="boards", focus=[1600, 1500], nf=0.5, drift=[-0.2, 0], labels=[dict(at=[1600, 1250], text="Lettering the head-boards", sub="Custer's battlefield · 1879")],
  say="On the number, he was right. The papers had it too high. On everything else, the scout was right and the generals were wrong. The defeat they called incredible had happened, much as the rider described it."),
 # why they doubted: the assumption printed in the Tribune
 dict(type="read", item="trib7", boxes=B['t7_doubt'],
  say="Why did the men in charge doubt it? The Tribune's Washington correspondent printed one reason. It was supposed to be impossible, for four thousand Indians to have been at the point where the battle is said to have taken place."),
 dict(type="table", item="trib7", zoom=0.8,
  say="The army had badly misjudged how many people had gathered in that village. And it trusted its own channels, which were running on a riverboat. The rider's story didn't look official. So it didn't look true."),
 # ENDING: answer the opening questions, then the comment question and the CTA
 dict(type="read", item="herald7", boxes=B['h_papers'],
  say="So how did a newspaper know before the general? A scout found a telegraph two days before the army's boat. And the men in charge read it in the morning papers, and called it too terrible to be true. Here's my question. If you had read every man killed on July sixth, with no word from the army, would you have believed it? Tell me in the comments."),
 dict(type="end", say="If you like history told from the papers themselves, give this video a like, and subscribe to As Printed. For what the papers said, and what the archive says."),
]
short = [
 # 0-1 s: the printed line, mid-action
 dict(type="read", item="herald7", boxes=B['h_incred'][2:], card=dict(label="AS PRINTED · 7 JUL 1876", value="NEW YORK HERALD", source="Gen. Sheridan, interviewed"),
  say="So incredible that he could not believe it."),
 dict(type="photo", item="sheridan", focus=[1640, 1230], nf=0.6, zoom=1.2,
  say="That's General Sheridan, the man running the war on the northern plains. July eighteen seventy six. He had just read that Custer was dead. In the morning paper. So how did the paper know first?"),
 dict(type="read", item="trib6", boxes=B['t6_head'][1:],
  say="Custer killed. Every man killed. Three hundred and fifteen."),
 dict(type="read", item="boz7", boxes=B['b_taylor'][-2:],
  say="The source: a civilian scout, who rode to the telegraph in Bozeman, Montana. Monday evening, July third."),
 dict(type="read", item="herald7", boxes=B['h_terrible'][:2],
  say="General Sherman, in his hotel: it must be exaggerated."),
 dict(type="read", item="herald7", boxes=B['h_rap'][1:],
  say="Then, mid-interview, a rap at the door. A telegram. Custer's death, confirmed."),
 dict(type="read", item="natrep7", boxes=B['n_conf'][1:],
  say="The army's own dispatch was coming by steamboat. It confirmed, the newspaper reports."),
 dict(type="compare", a=dict(label="PRINTED · 6 JUL 1876", quote="\"…killed was 315.\"", value="315", unit="killed"),
  b=dict(label="THE RECORD", quote="soldiers, scouts and civilians", value="268", unit="killed", source="National Park Service"), strike="a",
  say="The papers' count was too high. Two hundred and sixty eight died. But the defeat was real. And the general? He read it in the paper."),
]
ep = dict(slug="custer-news", title="Read It in the Papers", indexTitle="Little Bighorn · July 1876", seed=26, items=items,
 end=dict(sub="How the news of the Little Bighorn reached the army, as printed, July 1876", credits=["Library of Congress · Chronicling America (New York Herald, New-York Tribune, National Republican, Evening Star, Helena Weekly Herald, Bozeman Avant Courier)", "Library of Congress · Prints & Photographs (Sheridan, Sherman, Sitting Bull, Centennial Exhibition, S. J. Morrow)", "Casualty figures: National Park Service, Little Bighorn Battlefield National Monument", "Narration: VibeVoice · Piano: Salamander Grand (CC BY 3.0)"]),
 films=dict(long=dict(size="1920x1080", shots=long), short=dict(size="1080x1920", shots=short)))
json.dump(ep, open(f'{H}/episode.json', 'w'), indent=1, ensure_ascii=False)
w = lambda f: sum(len(s.get('say', '').split()) for s in f)
print('long words', w(long), 'shots', len(long), 'short words', w(short), 'shots', len(short))
