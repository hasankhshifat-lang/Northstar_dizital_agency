import json, os
# Storyboard = the shot list below. Each shot's purpose is in the comment above it.
# Line boxes come from the Library of Congress OCR (ALTO line coordinates) of each page, scaled to raw/<id>.jpg
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
 dict(id="ejournal", kind="paper", src="raw/ejournal.jpg", label="NEW YORK EVENING JOURNAL · 17 FEB 1898", short="New York Evening Journal", catalog="LCCN sn86071545", row="torpedo hole"),
 dict(id="wilm", kind="paper", src="raw/wilm.jpg", label="EVENING JOURNAL (WILMINGTON, DEL.) · 16 FEB 1898", short="Evening Journal, Wilmington", catalog="LCCN sn85042354", row="suspend opinion"),
 dict(id="maineship", kind="print", src="raw/maineship.tif", horizon=5010, nomask=True, inches=16, label="THE U.S. BATTLESHIP MAINE · PRINT · 1898", short="The U.S. Battleship Maine (print)", catalog="LC-DIG-ppmsca-58665", credit="H. C. Miner Litho. Co."),
 dict(id="sigsbee", kind="print", src="raw/sigsbee.tif", horizon=6000, nomask=True, inches=13, label="CAPT. CHARLES D. SIGSBEE · PRINT · 1898", short="Capt. Charles D. Sigsbee", catalog="LC-DIG-ppmsca-46572", credit="Tobin Artworks"),
 dict(id="kcj", kind="paper", src="raw/kcj.jpg", label="KANSAS CITY JOURNAL · 17 FEB 1898", short="Kansas City Journal", catalog="LCCN sn86063615", row="cause a mystery"),
 dict(id="divers1", kind="print", src="raw/divers1.tif", crop=[370, 740, 2005, 2540], horizon=1495, inches=9, label="WRECK OF THE \"MAINE.\" FIRST DAY OF THE DIVERS · 1898", short="First day of the divers", catalog="LC-USZ62-104733", credit="Griffith & Griffith"),
 dict(id="diversup", kind="print", src="raw/diversup.tif", horizon=660, inches=9, label="WRECK OF THE \"MAINE.\" DIVERS COMING UP TO REPORT · 1898", short="Divers coming up to report", catalog="LC-USZ62-56593", credit="Griffith & Griffith"),
 dict(id="age", kind="paper", src="raw/age.jpg", label="THE AGE-HERALD (BIRMINGHAM, ALA.) · 29 MAR 1898", short="The Age-Herald", catalog="LCCN sn86072192", row="no evidence"),
 dict(id="sun", kind="paper", src="raw/sun.jpg", label="THE SUN (NEW YORK) · 29 MAR 1898", short="The Sun", catalog="LCCN sn83030272", row="internal"),
 dict(id="barre", kind="paper", src="raw/barre.jpg", label="BARRE EVENING ENTERPRISE (VT.) · 25 APR 1898", short="Barre Evening Enterprise", catalog="LCCN sn98060036", row="war declared"),
 dict(id="wreck1911", kind="print", src="raw/wreck1911.tif", crop=[0, 300, 13586, 3366], horizon=1250, inches=20, label="WRECK, U.S.S. MAINE · 18 NOV 1911", short="Wreck, U.S.S. Maine, 1911", catalog="LC-DIG-pan-6a22711", credit="American Photo Co., Havana"),
 dict(id="norwich", kind="paper", src="raw/norwich.jpg", label="NORWICH BULLETIN (CONN.) · 9 DEC 1911", short="Norwich Bulletin", catalog="LCCN sn82014086", row="from the outside"),
 dict(id="annap", kind="paper", src="raw/annap.jpg", label="EVENING CAPITAL (ANNAPOLIS, MD.) · 15 DEC 1911", short="Evening Capital, Annapolis", catalog="LCCN sn88065726", row="frames 28–31"),
 dict(id="wreckjuly", kind="print", src="raw/wreckjuly1911.tif", horizon=300, inches=16, label="WRECK OF THE U.S.S. MAINE · 18 JULY 1911", short="Wreck of the U.S.S. Maine, July 1911", catalog="LC-USZ62-128041", credit="American Photo Co., Havana"),
]
B = dict(
 ej_head=L('ejournal', (3, 8)), ej_treach=L('ejournal', (9, 11)), ej_hole=L('ejournal', (13, 14)), ej_torp=L('ejournal', (15, 16)),
 ej_fanatic=L('ejournal', (17, 18)), ej_board=L('ejournal', (63, 67)), ej_divers=L('ejournal', (70, 72)), ej_divline=L('ejournal', 72),
 ej_supp=L('ejournal', (85, 86), (90, 93)), ej_reward=L('ejournal', 163, 164),
 wi_head=L('wilm', (853, 856)), wi_boil=L('wilm', (867, 870)), wi_tel=L('wilm', (902, 905)), wi_susp=L('wilm', (912, 913)),
 kc_head=L('kcj', (12, 17)), kc_sigs=L('kcj', (35, 38), (41, 42)), kc_crew=L('kcj', (27, 29)),
 ag_head=L('age', (4, 7)), ag_keel=L('age', (244, 247)), ag_opinion=L('age', (249, 251)), ag_concl=L('age', (252, 255)), ag_resp=L('age', (256, 258)),
 sn_head=L('sun', (488, 490)), sn_fish=L('sun', (495, 505)),
 ba_rem=L('barre', 157, (171, 173)), ba_war=L('barre', 419, (446, 452)),
 no_head=L('norwich', (108, 114)), no_myst=L('norwich', (149, 157)),
 an_head=L('annap', (331, 336)), an_find=L('annap', (373, 377)), an_diff=L('annap', (387, 392)),
)
long = [
 # HOOK: the surprise first (a torpedo hole "found" two days after), on the page that printed it
 dict(type="title", item="ejournal", title="The Torpedo Hole", sub="USS MAINE · WHAT THE PAPERS PRINTED · 1898", chapterName="The torpedo hole",
  say="Two days after the battleship Maine blew up in Havana harbor, a New York paper told its readers that divers had found the hole. An eight inch hole, in one of her plates. Proof, it said, of a torpedo."),
 # the printed claim, lit line by line
 dict(type="read", item="ejournal", boxes=B['ej_head'],
  say="Torpedo hole. Discovered by government divers in the Maine. Fortune offered for evidence."),
 dict(type="read", item="ejournal", boxes=B['ej_treach'],
  say="Startling evidence of Spanish treachery revealed. The battleship and hundreds of American lives sacrificed in Havana harbor."),
 # the stakes and the question, no reveal
 dict(type="table", item="ejournal", zoom=0.7,
  say="Within ten weeks, America and Spain were at war. So who found that hole? What did the Navy's divers see, when they went down? The answer is printed on this same front page. And the rest of the story took seventy eight years, and it still has no ending."),
 dict(type="chapter", kicker="PART 1", title="Blown up in Havana", chapterName="Blown up in Havana", item="wilm", say="Part one. Blown up in Havana."),
 # the ship (picture): what was lost and why she was there
 dict(type="photo", item="maineship", focus=[5450, 4140], nf=0.4, drift=[0.4, 0], labels=[dict(at=[5450, 3300], text="U.S.S. Maine", sub="print sold in 1898")],
  say="This is the Maine, on a print sold that year. A new American battleship. Since January twenty fifth, eighteen ninety eight, she had been moored in Havana harbor, while Cuba fought a war against Spain."),
 # first report: an accident was the first guess
 dict(type="read", item="wilm", boxes=B['wi_head'],
  say="February sixteenth. The Evening Journal, in Wilmington, Delaware. A horrible fatality. Battleship Maine blown up and burning at Havana. Over one hundred sailors reported dead."),
 dict(type="read", item="wilm", boxes=B['wi_boil'],
  say="The explosion occurred about ten o'clock last night. It is supposed that it was caused by the bursting of the boilers."),
 # the captain (picture), then his own words
 dict(type="photo", item="sigsbee", focus=[3190, 3360], nf=0.5, zoom=1.05, drift=[0, -0.3], labels=[dict(at=[3360, 6900], text="Capt. Charles D. Sigsbee", sub="commander of the Maine · print, 1898")],
  say="The first guess was an accident. The man in command was Captain Charles D. Sigsbee. He survived. That night, he telegraphed the Secretary of the Navy."),
 dict(type="read", item="wilm", boxes=B['wi_tel'],
  say="The telegram said: Maine blown up in Havana harbor, at nine forty, and destroyed. Many wounded, and doubtless more killed and drowned."),
 dict(type="read", item="wilm", boxes=B['wi_susp'], card=dict(label="CAPT. SIGSBEE'S TELEGRAM", value="15 FEB 1898", source="Evening Journal, Wilmington"),
  say="And then, this line. Public opinion should be suspended till further report."),
 dict(type="table", item="kcj", zoom=1.3, boxes=B['kc_crew'],
  say="Wait for the facts. Out of three hundred and fifty four men aboard, two hundred and sixty six would die. And the country was in no mood to wait."),
 dict(type="chapter", kicker="PART 2", title="Eight-inch hole", chapterName="Eight-inch hole", item="ejournal", say="Part two. The eight inch hole."),
 # the claim in full
 dict(type="read", item="ejournal", boxes=B['ej_hole'],
  say="February seventeenth. The New York Evening Journal. Havana. Divers who have descended and inspected the hull of the sunken battle ship Maine have discovered an eight inch percussion hole in one of her plates."),
 dict(type="read", item="ejournal", boxes=B['ej_torp'],
  say="This indicates that the Maine was destroyed by a torpedo. It makes clear that the destruction of the Maine was not brought about by an accidental explosion aboard the battle ship."),
 dict(type="read", item="ejournal", boxes=B['ej_fanatic'],
  say="It is very clear, that either a Spanish fanatic, or a secret emissary of the Spanish government, floated the torpedo under the waterline."),
 dict(type="table", item="ejournal", zoom=1.0, boxes=B['ej_reward'],
  say="And on the right of the page, a reward. Fifty thousand dollars, for the detection of whoever did it."),
 # same morning, another paper: the mystery, and the captain on the record
 dict(type="read", item="kcj", boxes=B['kc_head'],
  say="The same day, in Missouri, the Kansas City Journal. About two hundred and sixty dead. Maine disaster even more terrible than was feared. Cause is still a mystery. Sigsbee said to believe it was a floating torpedo."),
 dict(type="read", item="kcj", boxes=B['kc_sigs'],
  say="But here is what Captain Sigsbee told the Associated Press. I cannot determine the cause, but competent investigators will decide whether the explosion was produced from an interior or exterior cause. I will not, and cannot conscientiously anticipate the decision."),
 # fairness: his private guess, called a guess
 dict(type="table", item="kcj", zoom=0.8, card=dict(label="SIGSBEE TO SECRETARY LONG", value="17 FEB 1898", source="quoted in Rickover, 1976"),
  say="Privately, Sigsbee did suspect a mine. That day he cabled Washington: Probably the Maine destroyed by mine, perhaps by accident. And then: I can only surmise this. A guess. And he called it one."),
 dict(type="chapter", kicker="PART 3", title="The same page", chapterName="The same page", item="ejournal", say="Part three. The same page."),
 # the turn: the Journal's own page says the board was only just named and the divers had not gone down
 dict(type="table", item="ejournal", zoom=0.75, boxes=B['ej_board'][:1],
  say="Now go back to the Evening Journal. Bottom left corner. Same front page. Same day."),
 dict(type="read", item="ejournal", boxes=B['ej_board'],
  say="Secretary Long has instructed Admiral Sicard to detail the above named officers of the North Atlantic fleet, as a board to investigate the disaster to the Maine."),
 dict(type="read", item="ejournal", boxes=B['ej_divline'], card=dict(label="SAME FRONT PAGE", value="17 FEB 1898", source="New York Evening Journal"),
  say="Part of that corner is torn away. Still, the words can be read. Divers will go down today, at the wreck."),
 dict(type="table", item="ejournal", zoom=1.5, boxes=B['ej_divline'],
  say="The court of inquiry had only just been named. And on the very page that announced the hole, the Navy's divers had not yet gone down."),
 # when the divers really arrived (picture)
 dict(type="photo", item="divers1", focus=[983, 1556], nf=0.5, drift=[0.3, 0], labels=[dict(at=[1000, 900], text="\"First day of the divers\"", sub="stereograph, Griffith & Griffith, 1898")],
  say="According to the Navy's own history, its divers from the North Atlantic Squadron reached Havana on February nineteenth. Two days after the torpedo hole was in print. This stereo card was sold as: Wreck of the Maine. First day of the divers."),
 dict(type="read", item="ejournal", boxes=B['ej_supp'],
  say="The Journal had another headline on that page. Dispatch from Sigsbee suppressed. A dispatch was received by the Navy Department from Captain Sigsbee early this morning, which is still suppressed."),
 dict(type="table", item="ejournal", zoom=0.8,
  say="So the official word was not out. The paper printed a verdict anyway. Where did the eight inch hole come from? The story names no diver, and no source. And the court's findings, when they came, did not mention it."),
 dict(type="chapter", kicker="PART 4", title="Mine, or no mine", chapterName="Mine, or no mine", item="age", say="Part four. Mine, or no mine."),
 dict(type="photo", item="diversup", focus=[522, 1198], nf=0.45, drift=[0.2, -0.2], labels=[dict(at=[700, 1380], text="Divers coming up to report", sub="stereograph, Griffith & Griffith, 1898")],
  say="For weeks, Navy divers worked in the wreck, in the mud of the harbor. Wreck of the Maine. Divers coming up to report."),
 dict(type="read", item="age", boxes=B['ag_keel'],
  say="On March twenty eighth, President McKinley sent the court's findings to Congress. The Age-Herald, in Birmingham, printed them. At frame eighteen, the vertical keel is broken in two, and the flat keel is bent."),
 dict(type="read", item="age", boxes=B['ag_opinion'],
  say="In the opinion of the court, this effect could have been produced only by the explosion of a mine, situated under the bottom of the ship."),
 dict(type="read", item="age", boxes=B['ag_concl'],
  say="That the ship was destroyed by the explosion of a submarine mine, which caused the partial explosion of two or more of her forward magazines."),
 dict(type="read", item="age", boxes=B['ag_resp'], card=dict(label="NAVAL COURT OF INQUIRY", value="MARCH 1898", source="The Age-Herald, Birmingham"),
  say="Responsibility not fixed. That no evidence has been obtainable fixing the responsibility for the destruction of the Maine upon any person or persons."),
 dict(type="table", item="age", zoom=1.3, boxes=B['ag_resp'][1:],
  say="So the court blamed a mine under the ship. Not a torpedo hole in her side. And it had no evidence of who."),
 # the other side's inquiry
 dict(type="read", item="sun", boxes=B['sn_head'] + B['sn_fish'],
  say="Spain held its own inquiry. The Sun printed its reasons. No dead fish were found in the harbor, as would have been the case if a mine or torpedo had exploded. No column of water arose. The explosion, Spain said, was internal."),
 # the mood: the country had already decided
 dict(type="read", item="age", boxes=B['ag_head'],
  say="But the country had already decided. Across the top of the same Age-Herald: McKinley backs down. Will Congress uphold national honor? He is being cursed by both Republicans and Democrats, for his cowardly message to Congress."),
 dict(type="read", item="barre", boxes=B['ba_rem'],
  say="In Vermont, a crowd marched through town with an effigy of a Spanish general. It was labelled: Remember the Maine. Down with Spain."),
 dict(type="read", item="barre", boxes=B['ba_war'],
  say="April twenty fifth. Declaration of war. It took just one minute and forty one seconds to pass a declaration of war. The vote was unanimous."),
 dict(type="table", item="barre", zoom=0.8,
  say="From declaration to armistice, the war lasted one hundred and ten days. The Maine stayed where she sank, in Havana harbor. And so did the question."),
 dict(type="chapter", kicker="PART 5", title="Raising the Maine", chapterName="Raising the Maine", item="wreck1911", say="Part five. Raising the Maine."),
 dict(type="photo", item="wreck1911", focus=[6800, 1500], nf=0.35, drift=[0.6, 0], labels=[dict(at=[6800, 1100], text="The Maine, exposed", sub="Havana harbor · 18 November 1911")],
  say="Thirteen years later, in nineteen eleven, Army engineers built a wall of steel around the wreck, and pumped out the water. For the first time, the hull could be seen. This is the Maine on November eighteenth, nineteen eleven."),
 dict(type="read", item="norwich", boxes=B['no_head'],
  say="A new Navy board studied it. December ninth. The Norwich Bulletin. The Maine blown up from the outside. External explosion caused explosion of magazine, says government."),
 dict(type="read", item="annap", boxes=B['an_find'],
  say="The board finds that the injuries to the bottom of the Maine were caused by the explosion of a charge of a low form of explosive, exterior to the ship, between frames twenty eight and thirty one."),
 dict(type="read", item="annap", boxes=B['an_diff'],
  say="But the Evening Capital, in Annapolis, noticed something. The Vreeland board report, fixing the position of the mine on the port side, between frames twenty eight and thirty one, differs from the Sampson court finding, which fixed the position of the mine at frame eighteen."),
 dict(type="read", item="norwich", boxes=B['no_myst'],
  say="Two boards. A mine in two different places. The Norwich Bulletin wrote: This only deepens the mystery of the destruction of the Maine."),
 dict(type="photo", item="wreckjuly", focus=[1600, 400], nf=0.4, drift=[-0.5, 0], labels=[dict(at=[1600, 160], text="Inside the cofferdam", sub="Havana harbor · 18 July 1911")],
  say="In March, nineteen twelve, the hull was floated, towed out to sea, and sunk in about six hundred fathoms of water. Whatever it could still tell us went down with it."),
 dict(type="chapter", kicker="PART 6", title="Seventy-eight years", chapterName="Seventy-eight years", item="maineship", say="Part six. Seventy eight years."),
 # the modern record (no picture rights needed: a text card on the ship print)
 dict(type="photo", item="maineship", focus=[5450, 4400], nf=0.45, zoom=1.1, drift=[-0.3, 0], card=dict(label="HOW THE BATTLESHIP MAINE WAS DESTROYED", value="1976", source="Rickover · Naval History Division"),
  say="In nineteen seventy four, Admiral Hyman Rickover asked two engineers to study the old drawings, photographs and testimony again. The Navy published their work in nineteen seventy six. They found no technical evidence of an external explosion. Most likely, they said, heat from a fire in a coal bunker, next to a magazine."),
 dict(type="photo", item="maineship", focus=[5450, 4140], nf=0.4, zoom=0.9,
  say="Rickover's conclusion was blunt. There is no evidence that a mine destroyed the Maine. In nineteen ninety eight, a computer study for National Geographic came back inconclusive. A mine. Or a fire inside. Either could have done it."),
 # verdict: printed vs the record, printed one struck
 dict(type="compare", a=dict(label="NEW YORK EVENING JOURNAL · 17 FEB 1898", quote="\"Torpedo hole discovered by government divers\"", value="2", unit="days after · printed"),
  b=dict(label="NAVAL COURT OF INQUIRY · MARCH 1898", quote="\"…no evidence … fixing the responsibility … upon any person or persons.\"", value="23", unit="days of inquiry", source="The Age-Herald · Chronicling America"), strike="a",
  say="Printed, two days after: torpedo hole discovered by government divers. Found by the court, after twenty three days of work: no evidence fixing the responsibility upon any person. And seventy eight years later, no proof there was a mine at all."),
 # ending: answer the opening, then the comment question
 dict(type="read", item="wilm", boxes=B['wi_susp'],
  say="So who found the torpedo hole? The page does not say, and no later report ever confirmed it. On the night his ship went down, Captain Sigsbee asked for one thing. Public opinion should be suspended, till further report. The papers did not wait. Here is my question. If they had, would America still have gone to war in eighteen ninety eight? Tell me in the comments."),
 dict(type="end", say="If you like history told from the papers themselves, give this video a like, and subscribe to As Printed. For what the papers said, and what the archive says."),
]
short = [
 dict(type="read", item="ejournal", boxes=B['ej_head'][:3], card=dict(label="AS PRINTED", value="17 FEB 1898", source="New York Evening Journal"),
  say="Torpedo hole. Discovered by government divers in the Maine. A New York front page, two days after the battleship Maine blew up in Havana."),
 dict(type="read", item="ejournal", boxes=B['ej_hole'],
  say="Divers found an eight inch hole in her plates, the paper said. Proof of a torpedo. Spanish treachery."),
 dict(type="read", item="ejournal", boxes=B['ej_divline'],
  say="But look lower, on the same front page. Divers will go down today at the wreck."),
 dict(type="photo", item="divers1", focus=[983, 1556], nf=0.5, drift=[0.3, 0],
  say="The Navy's divers reached Havana two days later. The paper never named a source."),
 dict(type="read", item="age", boxes=B['ag_resp'],
  say="Ten weeks later, America and Spain were at war. In March, the Navy's court had found a mine, but no evidence of who."),
 dict(type="compare", a=dict(label="PRINTED · 17 FEB 1898", quote="\"Torpedo hole discovered\"", value="1898", unit="the headline"),
  b=dict(label="NAVY STUDY · 1976", quote="\"There is no evidence that a mine destroyed the Maine.\"", value="1976", unit="the record", source="Rickover, How the Battleship Maine Was Destroyed"), strike="a",
  say="In nineteen seventy six, a Navy study said: there is no evidence that a mine destroyed the Maine. So who found that torpedo hole?"),
]
ep = dict(slug="torpedo-hole", title="The Torpedo Hole", indexTitle="USS Maine · 1898", seed=17, items=items,
 end=dict(sub="The USS Maine, as printed, February 1898 – December 1911", credits=["Library of Congress · Chronicling America · Prints & Photographs", "Photos: Griffith & Griffith · American Photo Co. · H. C. Miner Litho. · Tobin Artworks", "Narration: VibeVoice · Piano: Salamander Grand (CC BY 3.0)"]),
 films=dict(long=dict(size="1920x1080", shots=long), short=dict(size="1080x1920", shots=short)))
json.dump(ep, open(f'{H}/episode.json', 'w'), indent=1, ensure_ascii=False)
w = lambda f: sum(len(s.get('say', '').split()) for s in f)
print('long words', w(long), 'shots', len(long), 'short words', w(short), 'shots', len(short))
