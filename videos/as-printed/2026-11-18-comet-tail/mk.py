import json, os
# Storyboard = the shot list below. Each shot's purpose is in the comment above it.
# Line boxes come from the Library of Congress OCR (ALTO word coordinates) of each page, scaled to raw/<id>.jpg
# (raw/<id>.lines.json, made by the research step; raw/ is git-ignored). Every box range was checked on the scan.
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
 dict(id="tribune", kind="paper", src="raw/tribune.jpg", label="NEW-YORK TRIBUNE · 8 FEB 1910", short="New-York Tribune", catalog="LCCN sn83030214", row="bands of poison"),
 dict(id="laherald", kind="paper", src="raw/laherald.jpg", label="LOS ANGELES HERALD · 2 FEB 1910", short="Los Angeles Herald", catalog="LCCN sn85042462", row="will strike earth"),
 dict(id="yerkes", kind="print", src="raw/yerkes.tif", crop=[300, 0, 3500, 704], horizon=307, inches=14, nomask=True, label="YERKES OBSERVATORY · LAKE GENEVA, WIS. · c. 1910", short="Yerkes Observatory", catalog="LC-USZ62 pan 6a16220 (PAN US GEOG - Wisconsin)", credit="W. S. Beguelin"),
 dict(id="nhunion", kind="paper", src="raw/nhunion.jpg", label="THE NEW HAVEN UNION · 10 FEB 1910", short="The New Haven Union", catalog="LCCN sn92051126", row="snuff out life"),
 dict(id="wherald", kind="paper", src="raw/wherald.jpg", label="THE WASHINGTON HERALD · 9 FEB 1910", short="The Washington Herald", catalog="LCCN sn83045433", row="no danger"),
 dict(id="gatecity", kind="paper", src="raw/gatecity.jpg", label="THE DAILY GATE CITY (KEOKUK, IOWA) · 17 MAY 1910", short="The Daily Gate City", catalog="LCCN sn83025182", row="comet pills"),
 dict(id="newsboy", kind="print", src="raw/newsboy.tif", horizon=1300, nomask=True, label="HARPER'S WEEKLY · COVER · 21 MAY 1910", short="Harper's Weekly, May 1910", catalog="LC-USZ62-89904", credit="Sidney H. Riesenberg"),
 dict(id="seeing", kind="print", src="raw/seeing.tif", horizon=269, label="HARPER'S WEEKLY · 4 JUNE 1910", short="Harper's Weekly, June 1910", catalog="LC-USZ62-89906", credit="Ralph O. Yardley"),
 dict(id="seekers", kind="print", src="raw/seekers.tif", crop=[99, 186, 987, 1426], horizon=702, label="ILLUSTRATED LONDON NEWS · 28 MAY 1910", short="Illustrated London News", catalog="LC-USZ62-89891", credit="G. D'Amato"),
 dict(id="lick", kind="print", src="raw/lick.tif", crop=[515, 279, 2981, 2810], horizon=2500, label="36-INCH TELESCOPE · LICK OBSERVATORY · 1902", short="Lick Observatory", catalog="LC-DIG-stereo-1s10755", credit="Underwood & Underwood"),
 dict(id="coeur", kind="paper", src="raw/coeur.jpg", label="COEUR D'ALENE EVENING PRESS · 19 MAY 1910", short="Coeur d'Alene Evening Press", catalog="LCCN sn88056094", row="passes safely"),
 dict(id="detroit", kind="paper", src="raw/detroit.jpg", label="THE DETROIT TIMES · 19 MAY 1910", short="The Detroit Times", catalog="LCCN sn83016689", row="no swishing"),
 dict(id="bridgeport", kind="paper", src="raw/bridgeport.jpg", label="THE BRIDGEPORT EVENING FARMER · 19 MAY 1910", short="Bridgeport Evening Farmer", catalog="LCCN sn84022472", row="very tame affair"),
 dict(id="topeka", kind="paper", src="raw/topeka.jpg", label="THE TOPEKA STATE JOURNAL · 19 MAY 1910", short="Topeka State Journal", catalog="LCCN sn82016014", row="did not pass"),
 dict(id="bisbee", kind="paper", src="raw/bisbee.jpg", label="BISBEE DAILY REVIEW · 20 MAY 1910", short="Bisbee Daily Review", catalog="LCCN sn84024827", row="not gone through"),
 dict(id="breck", kind="paper", src="raw/breck.jpg", label="THE BRECKENRIDGE NEWS (CLOVERPORT, KY.) · 25 MAY 1910", short="The Breckenridge News", catalog="LCCN sn86069309", row="a newspaper lie"),
]
B = dict(
 tr_head=L('tribune', (352, 354)), tr_yerkes=L('tribune', (356, 365)), tr_poison=L('tribune', (369, 372)),
 tr_flam=L('tribune', (378, 384), 388),
 la_head=L('laherald', (48, 49)), la_sub=L('laherald', (50, 53)), la_lede=L('laherald', (54, 58)),
 la_imm=L('laherald', (59, 62)), la_little=L('laherald', (68, 70)),
 nh=L('nhunion', (526, 530)), nh_snuff=L('nhunion', (528, 530)),
 wh_head=L('wherald', 218, 220, 221), wh_lede=L('wherald', (227, 235)), wh_quote=L('wherald', (247, 251)),
 wh_cheap=L('wherald', (252, 255), 257),
 gc_head=L('gatecity', (287, 290)), gc_rx=L('gatecity', (300, 305)),
 co_head=L('coeur', (4, 7)), co_hale=L('coeur', (104, 111)), co_instr=L('coeur', (111, 114), (119, 128)),
 de_head=L('detroit', (281, 285)), de_naught=L('detroit', (291, 294)), de_night=L('detroit', (300, 307)),
 br_head=L('bridgeport', (47, 48)), br_jacoby=L('bridgeport', (52, 58)),
 tk_head=L('topeka', (681, 685)), tk_lede=L('topeka', (691, 697)), tk_experts=L('topeka', (698, 704)),
 bi_head=L('bisbee', (284, 286)), bi_hale=L('bisbee', (287, 293)), bi_know=L('bisbee', (304, 305)),
 bk_head=L('breck', (100, 101)), bk_quote=L('breck', (111, 118)), bk_pills=L('breck', (126, 131)),
)
long = [
 # HOOK: the surprise first (poison found in the comet's tail), on the item that printed it
 dict(type="title", item="tribune", title="The Poison Tail", sub="HALLEY'S COMET · WHAT THE PAPERS PRINTED · 1910", chapterName="The poison tail",
  say="In February, nineteen ten, a New York newspaper told its readers that astronomers had found poison in the sky. Not just any poison. It was in the tail of a comet. And in May, the Earth was going to pass right through that tail."),
 # the printed claim, lit line by line
 dict(type="read", item="tribune", boxes=B['tr_head'],
  say="Comet's cyanogen... Photograph of Halley's, said to show bands of poison."),
 dict(type="read", item="tribune", boxes=B['tr_poison'],
  say="Cyanogen is perhaps the deadliest poison known. A grain of its potassium salt, touched to the tongue, being sufficient to cause instant death."),
 # the conflict and the question; promise of the strange answer (no reveal)
 dict(type="table", item="tribune", zoom=0.7,
  say="By May, there were pills for sale to survive it. So what really happened, the night the world went through the tail? The answer is stranger than the scare. Because when that night was over, the astronomers could not even agree on whether it had happened at all."),
 dict(type="chapter", kicker="PART 1", title="Poison in the tail", chapterName="Poison in the tail", item="tribune", say="Part one. Poison in the tail."),
 # where the claim came from: a real observation
 dict(type="read", item="tribune", boxes=B['tr_yerkes'],
  say="The story came by telegraph, from Boston. A telegram received there today from the Yerkes Observatory states that spectra of the comet, obtained by the director and his assistant, show very prominent cyanogen bands."),
 # the place where the discovery was made (photograph)
 dict(type="photo", item="yerkes", focus=[1800, 560], nf=0.35, drift=[0.6, 0], labels=[dict(at=[1798, 520], text="Yerkes Observatory", sub="Lake Geneva, Wisconsin · photographed c. 1910")],
  say="This is the view from the great dome of the Yerkes Observatory, in Wisconsin, around nineteen ten. Its astronomers had split the comet's light into a spectrum. And in it, they found cyanogen."),
 dict(type="read", item="tribune", boxes=B['tr_flam'],
  say="The news has been communicated to Camille Flammarion, the distinguished French scientist, and is causing a great deal of discussion, as to the probable effect on the earth, should it pass through the comet's tail."),
 # loop: the date with the tail was already set, by the same Frenchman
 dict(type="read", item="laherald", boxes=B['la_head'] + B['la_sub'],
  say="Should it pass through. But a week earlier, the same French scientist had already announced the date. The Los Angeles Herald. Tail of comet will strike earth in May."),
 dict(type="read", item="laherald", boxes=B['la_lede'],
  say="New York, February first. Camille Flammarion, the French astronomer, in a letter published here today, says that the vaporous tail of Halley's comet will envelop the earth, May nineteenth. In America, that meant the night of Wednesday, May eighteenth."),
 dict(type="read", item="laherald", boxes=B['la_imm'],
  say="For several hours, he says, we will be immersed in the gaseous caudal appendage, whose chemical constitution is still little known."),
 dict(type="table", item="laherald", zoom=0.9,
  say="Caudal appendage means tail. A week later came the poison. A tail of poison gas, and a date with the Earth. Somebody was about to put the two together."),
 dict(type="chapter", kicker="PART 2", title="Snuff out life", chapterName="Snuff out life", item="nhunion", say="Part two. Snuff out life."),
 # the claim at its peak, told through the denial that quotes it
 dict(type="read", item="nhunion", boxes=B['nh'],
  say="February tenth. The New Haven Union. Professor W. H. Pickering, of Harvard, today denied that there is the slightest fear that the cyanogen gas in the tail of Halley's comet may snuff out life upon the earth."),
 dict(type="read", item="wherald", boxes=B['wh_head'] + B['wh_lede'],
  say="That was the claim going around. And it had a famous name attached. The Washington Herald. No danger from comet. Professor Pickering does not believe Flammarion was rightly quoted. Flammarion, it was reported, had declared that wholesale extinction of life will follow the passing of the earth through the comet, on May eighteenth."),
 dict(type="read", item="wherald", boxes=B['wh_quote'],
  say="I do not believe that Flammarion said that. However, if he did, it will have no weight with astronomers of standing, as they concur in the belief that there is absolutely no danger to be feared."),
 dict(type="read", item="wherald", boxes=B['wh_cheap'],
  say="Mother earth had the experience once, of passing through a comet's tail, and she is still with us. Too many of these rumors are owing to the efforts of cheap sensationalists, who desire free advertising."),
 # the turn: the accused man's own words, in print before the scare
 dict(type="table", item="wherald", zoom=0.8,
  say="Did Flammarion ever say it? These pages do not settle that. But they do hold his own letter, printed a week before the scare. And its last lines said the opposite."),
 dict(type="read", item="laherald", boxes=B['la_little'], card=dict(label="FLAMMARION'S OWN LETTER", value="1 FEB 1910", source="Los Angeles Herald"),
  say="Little danger may need be expected, however, for the tail probably will be so rarified as to be inoffensive."),
 dict(type="table", item="laherald", zoom=1.4, boxes=B['la_little'][-1:],
  say="Too thin to hurt anyone. That was in print, from the man himself, before the panic began. But a harmless tail does not sell papers. And by May, the story had a life of its own."),
 dict(type="chapter", kicker="PART 3", title="Pills and parties", chapterName="Pills and parties", item="gatecity", say="Part three... Pills and parties."),
 dict(type="read", item="gatecity", boxes=B['gc_head'],
  say="May seventeenth, the day before. The Daily Gate City, in Keokuk, Iowa. Comet pills on sale. Whatever the comet may or may not do to this old earth of ours, when its tail sweeps it Wednesday."),
 dict(type="read", item="gatecity", boxes=B['gc_rx'],
  say="The wire story said a man in Haiti was selling comet pills faster than he could make them. The prescription is one pill for every hour, up to the time the comet begins to recede from the earth. Some took one every half hour."),
 dict(type="table", item="gatecity", zoom=0.9,
  say="A secondhand story, from a ship's officers, and it ran across the country. But most Americans were not hiding from the comet. They were looking up."),
 # what people actually did: looked (illustrations of the time)
 dict(type="photo", item="newsboy", focus=[558, 843], nf=0.5, zoom=1.05, drift=[0, -0.4], labels=[dict(at=[760, 1010], text="Harper's Weekly", sub="cover · 21 May 1910")],
  say="This is the cover of Harper's Weekly, for May twenty first, nineteen ten. A newsboy, his arm full of extras, at a street telescope. The sign says: See Halley's comet."),
 dict(type="photo", item="seeing", focus=[932, 417], nf=0.55, drift=[-0.3, -0.1], labels=[dict(at=[560, 230], text="Harper's Weekly", sub="4 June 1910 · drawing by Ralph O. Yardley")],
  say="Harper's printed this drawing a few weeks later. Seeing Halley's comet. The chance of a lifetime."),
 dict(type="photo", item="seekers", focus=[494, 768], nf=0.5, drift=[0.3, 0], labels=[dict(at=[520, 700], text="Hampstead Heath, London", sub="Illustrated London News · 28 May 1910")],
  say="In London, the Illustrated London News drew the crowds on Hampstead Heath. Hampstead Heath on a comet night. The crowd about the flagstaff."),
 dict(type="photo", item="lick", focus=[1900, 1500], nf=0.4, drift=[-0.3, -0.1], labels=[dict(at=[1700, 1150], text="36-inch telescope", sub="Lick Observatory, California · stereo card, 1902")],
  say="The professionals were waiting, too. This is the great thirty six inch telescope at Lick Observatory, in California, on a stereo card from nineteen oh two. On May eighteenth, telescopes like it waited for the tail."),
 dict(type="chapter", kicker="PART 4", title="The night of May 18", chapterName="The night of May 18", item="coeur", say="Part four. The night of May eighteenth."),
 dict(type="read", item="coeur", boxes=B['co_head'],
  say="Thursday. The Coeur d'Alene Evening Press, in Idaho. World passes safely through tail of comet. No unusual disturbance noted by any of the astronomers."),
 dict(type="read", item="coeur", boxes=B['co_hale'],
  say="Pasadena, California. According to the computations of Doctor George E. Hale, and his associates at Carnegie observatory, Halley's comet passed on beyond the sun at eight thirty five o'clock last night, and at the same time, the earth was in the midst of the wanderer's tenuous tail."),
 dict(type="read", item="coeur", boxes=B['co_instr'],
  say="But not one of the delicate instruments set to detect phenomena showed the slightest variation. Metal plates coated with glycerine, on the peak of Mount Wilson, waited to catch the tail's dust. The astronomers found nothing, so far."),
 dict(type="read", item="detroit", boxes=B['de_head'] + B['de_night'],
  say="The Detroit Times. No swishing of comet's tail here. Wednesday night, May eighteenth, variously touted as a day of general suffocation, and finally toned down to the very guarded statement of most astronomers that something might happen, bloomed forth as an ideal early summer night."),
 dict(type="read", item="detroit", boxes=B['de_naught'],
  say="The paper quoted one stargazer of high renown. The tail of Halley's comet is the veriest approach to nothing, set in the midst of naught."),
 dict(type="read", item="bridgeport", boxes=B['br_head'] + B['br_jacoby'],
  say="A Columbia University astronomer, Harold Jacoby, wrote: Transit of comet's tail is very tame affair. It vindicated the general belief of astronomers, that the tail is so thin that its presence is undetectable."),
 dict(type="table", item="bridgeport", zoom=0.8,
  say="So the Earth went through, and nobody felt a thing. Case closed. Except that the same day, a paper in Kansas printed a very different headline."),
 dict(type="chapter", kicker="PART 5", title="Did it touch us?", chapterName="Did it touch us?", item="topeka", say="Part five. Did it touch us at all?"),
 dict(type="read", item="topeka", boxes=B['tk_head'],
  say="The Topeka State Journal. Comet was late. Earth did not pass through the tail yesterday. Astronomers are unable to explain the failure."),
 dict(type="read", item="topeka", boxes=B['tk_lede'],
  say="Williams Bay, Wisconsin. That is Yerkes. Shattering all scientific calculations, the glowing tail of Halley's comet appeared in the eastern sky today, at a time when the world's comet authorities had agreed it would be in the west."),
 dict(type="read", item="bisbee", boxes=B['bi_head'],
  say="The next morning, in Arizona, the Bisbee Daily Review. Earth has not gone through tail of comet. And may not come anywhere near doing so."),
 dict(type="read", item="bisbee", boxes=B['bi_hale'],
  say="Mount Wilson Observatory. Doctor George E. Hale said that the latest observations did not indicate that the earth had passed through the tail of Halley's comet."),
 # the contradiction made visible: same man, two printed versions
 dict(type="table", item="coeur", zoom=1.3, boxes=B['co_hale'][1:3],
  say="Remember the Pasadena story? According to the computations of Doctor Hale, the earth was in the midst of the tail. Now Hale himself was saying this."),
 dict(type="read", item="bisbee", boxes=B['bi_know'], card=dict(label="DR. GEORGE E. HALE", value="19 MAY 1910", source="Bisbee Daily Review"),
  say="I do not know whether the earth passed through the tail of the comet today, or not. I have seen no indication of it."),
 dict(type="table", item="bisbee", zoom=0.8,
  say="Months of warnings. Pills, parties and front pages. And the director of Mount Wilson could not say whether the Earth had touched the tail at all."),
 # verdict: printed claim vs the record, printed one struck
 dict(type="compare", a=dict(label="THE NEW HAVEN UNION · FEB. 1910", quote="\"…may snuff out life upon the earth.\"", value="FEB.", unit="1910 · printed"),
  b=dict(label="COEUR D'ALENE EVENING PRESS · MAY 1910", quote="\"…not one of the delicate instruments … showed the slightest variation.\"", value="MAY", unit="1910 · measured", source="Chronicling America · Library of Congress"), strike="a",
  say="Printed in February: the gas may snuff out life upon the earth. Measured in May: not one of the delicate instruments showed the slightest variation. The poison was real. What the scare left out was the amount."),
 # ending: a reader's verdict on the papers, then answer the opening
 dict(type="read", item="breck", boxes=B['bk_head'] + B['bk_quote'],
  say="A week later, the Breckenridge News, in Kentucky, printed what one reader thought of it all. Comet business, a newspaper lie. This here comet business is a newspaper lie. The papers have made up all this just to make their sales large, 'cause I heard a newspaper seller say he would rather have a good lie any day than a good dinner."),
 dict(type="read", item="breck", boxes=B['bk_pills'],
  say="And below it: Last Wednesday, those who took the comet pills to protect themselves from the disastrous effects of Halley's comet, found them to be a bitter dose, and made them see stars galore."),
 dict(type="table", item="tribune", zoom=1.0, boxes=B['tr_poison'][:1],
  say="That reader was wrong about the comet. It was real. But he was not entirely wrong about the papers. The deadliest poison known really was in that tail. Just never enough of it to matter, and that was in print in February. So who do you blame for the great comet scare? The papers, the scientists they quoted, or the people selling pills? Tell me in the comments."),
 dict(type="end", say="If you like history, told from the papers themselves, give this video a like, and subscribe to As Printed. For what the papers said, and what the archive says."),
]
short = [
 dict(type="read", item="tribune", boxes=B['tr_poison'][:2], card=dict(label="AS PRINTED", value="8 FEB 1910", source="New-York Tribune"),
  say="Cyanogen is perhaps the deadliest poison known. In nineteen ten, it was found in the tail of Halley's comet. And Earth would fly through it."),
 dict(type="read", item="nhunion", boxes=B['nh_snuff'],
  say="Papers spread the claim that the gas may snuff out life upon the earth."),
 dict(type="read", item="gatecity", boxes=B['gc_rx'][:3],
  say="Papers reported comet pills for sale. One every hour, until the comet left."),
 dict(type="read", item="coeur", boxes=B['co_head'][:2],
  say="May eighteenth came. Not one instrument showed the slightest change."),
 dict(type="read", item="bisbee", boxes=B['bi_know'],
  say="A day later, the director at Mount Wilson said: I do not know whether the earth passed through the tail, or not."),
 dict(type="compare", a=dict(label="PRINTED · FEB. 1910", quote="\"…may snuff out life upon the earth.\"", value="FEB.", unit="the scare"),
  b=dict(label="FLAMMARION'S LETTER · 1 FEB 1910", quote="\"…so rarified as to be inoffensive.\"", value="1 FEB", unit="his letter", source="Chronicling America"), strike="a",
  say="The astronomer blamed for the scare had already written: so rarified as to be inoffensive. The deadliest poison known, too thin to matter."),
]
ep = dict(slug="comet-tail", title="The Poison Tail", indexTitle="Halley's Comet · 1910", seed=13, items=items,
 end=dict(sub="Halley's comet, as printed, February–May 1910", credits=["Library of Congress · Chronicling America · Prints & Photographs", "Pictures: Harper's Weekly (S. H. Riesenberg, R. O. Yardley), Illustrated London News (G. D'Amato), Underwood & Underwood, W. S. Beguelin", "Narration: VibeVoice · Piano: Salamander Grand (CC BY 3.0)"]),
 films=dict(long=dict(size="1920x1080", shots=long), short=dict(size="1080x1920", shots=short)))
json.dump(ep, open(f'{H}/episode.json', 'w'), indent=1, ensure_ascii=False)
w = lambda f: sum(len(s.get('say', '').split()) for s in f)
print('long words', w(long), 'shots', len(long), 'short words', w(short), 'shots', len(short))
