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
 dict(id="trib31", kind="paper", src="raw/trib31.jpg", label="NEW-YORK TRIBUNE · 31 JUL 1920", short="New-York Tribune, 31 July", catalog="LCCN sn83030214", row="$9,000,000"),
 dict(id="azrep", kind="paper", src="raw/azrep.jpg", label="ARIZONA REPUBLICAN · 27 JUL 1920", short="Arizona Republican", catalog="LCCN sn84020558", row="50% in 45 days"),
 dict(id="ponzi", kind="print", src="raw/ponzi.tif", crop=[160, 360, 4120, 5360], horizon=5000, nomask=True, inches=12, label="CHAS. PONZI · BAIN NEWS SERVICE", short="Chas. Ponzi (photograph)", catalog="LC-DIG-ggbain-30981", credit="Bain News Service"),
 dict(id="posq", kind="print", src="raw/posq.tif", crop=[280, 260, 4780, 3780], horizon=3160, nomask=True, inches=14, label="POST OFFICE SQUARE, BOSTON · 1900–1920", short="Post Office Square, Boston", catalog="LC-DIG-det-4a24026", credit="Detroit Publishing Co."),
 dict(id="cityhall", kind="print", src="raw/cityhall.tif", horizon=560, nomask=True, inches=16, label="BOSTON CITY HALL, SCHOOL STREET · c1903", short="Boston City Hall, School Street", catalog="LC pan 6a06421", credit="Panoramic photograph, c1903"),
 dict(id="trib28", kind="paper", src="raw/trib28.jpg", label="NEW-YORK TRIBUNE · 28 JUL 1920", short="New-York Tribune, 28 July", catalog="LCCN sn83030214", row="pays all claims"),
 dict(id="trib31b", kind="paper", src="raw/trib31b.jpg", label="NEW-YORK TRIBUNE · 31 JUL 1920 · PAGE 3", short="New-York Tribune, 31 July, p. 3", catalog="LCCN sn83030214", row="$30"),
 dict(id="wtimes2", kind="paper", src="raw/wtimes2.jpg", label="THE WASHINGTON TIMES · 2 AUG 1920", short="The Washington Times, 2 Aug", catalog="LCCN sn84026749", row="insolvent"),
 dict(id="wtimes3", kind="paper", src="raw/wtimes3.jpg", label="THE WASHINGTON TIMES · 3 AUG 1920", short="The Washington Times, 3 Aug", catalog="LCCN sn84026749", row="the run"),
 dict(id="trib10", kind="paper", src="raw/trib10.jpg", label="NEW-YORK TRIBUNE · 10 AUG 1920", short="New-York Tribune, 10 Aug", catalog="LCCN sn83030214", row="not one cent"),
 dict(id="trib13", kind="paper", src="raw/trib13.jpg", label="NEW-YORK TRIBUNE · 13 AUG 1920", short="New-York Tribune, 13 Aug", catalog="LCCN sn83030214", row="$20,000,000"),
 dict(id="star30", kind="paper", src="raw/star30.jpg", label="EVENING STAR (WASHINGTON) · 30 NOV 1920", short="Evening Star, 30 Nov", catalog="LCCN sn83045462", row="5 years"),
]
B = dict(
 t_head=L('trib31', (499, 501)), t_wiz=L('trib31', (511, 516)), t_smile=L('trib31', (524, 529)), t_barron=L('trib31', (573, 580)),
 a_head=L('azrep', (792, 794)), a_bar=L('azrep', (796, 800)), a_audit=L('azrep', (806, 810)), a_crowd=L('azrep', (814, 822)),
 a_sys=L('azrep', (823, 829)), a_400=L('azrep', (844, 847)),
 r_head=L('trib28', (111, 113)), r_thou=L('trib28', (147, 154)),
 p_head=L('trib31b', (746, 748)), p_30=L('trib31b', (750, 754)), p_stats=L('trib31b', (799, 801)),
 w_head=L('wtimes2', (503, 504)), w_charge=L('wtimes2', (525, 534)), w_deny=L('wtimes2', (554, 558)),
 x_head=L('wtimes3', (1, 2)), x_line=L('wtimes3', (6, 17)), x_cheer=L('wtimes3', (18, 22)),
 n_head=L('trib10', (331, 333)), n_cent=L('trib10', (343, 346)), n_bank=L('trib10', (347, 354)),
 k_head=L('trib13', (18, 20)), k_insol=L('trib13', (21, 24)), k_bank=L('trib13', (25, 26)), k_30k=L('trib13', (45, 47)), k_fraud=L('trib13', (70, 76)),
 s_head=L('star30', (819, 823)), s_plea=L('star30', (829, 834)), s_count=L('star30', (836, 842)), s_props=L('star30', (855, 864)), s_gloria=L('star30', (877, 881)),
)
long = [
 # HOOK: the surprise first (a "wizard" with $9 million from postage coupons), on the page that printed it
 dict(type="title", item="trib31", title="The Coupon King", sub="CHARLES PONZI · WHAT THE PAPERS PRINTED · 1920", chapterName="The financial wizard",
  say="In the summer of nineteen twenty, a New York front page called him the financial wizard. Nine million dollars, in a few months. From postage coupons."),
 # the printed claim, lit line by line
 dict(type="read", item="trib31", boxes=B['t_head'],
  say="U.S. searches for mystery in Ponzi coup."),
 dict(type="read", item="trib31", boxes=B['t_wiz'],
  say="New troubles are piling up for Charles Ponzi, the financial wizard, who is said to have made more than nine million dollars in a few months, by dealing in international postal coupons."),
 # the conflict and the question, no reveal
 dict(type="table", item="trib31", zoom=0.7,
  say="But the same story printed one more number, from the Boston post office. It should have ended everything that afternoon. Instead, people kept lining up at his door for nine more days. So what was that number? And how did one man keep a whole city believing?"),
 dict(type="chapter", kicker="PART 1", title="Fifty per cent", chapterName="Fifty per cent", item="azrep", say="Part one. Fifty per cent."),
 # the man (picture): who he was
 dict(type="photo", item="ponzi", focus=[2080, 1700], nf=0.5, drift=[0.2, -0.2], labels=[dict(at=[2080, 750], text="Charles Ponzi", sub="Bain News Service photograph")],
  say="This is Charles Ponzi, in a Bain News Service photograph. An Italian immigrant in Boston. Small, smiling, always well dressed. In nineteen twenty, his business had a plain name. The Securities Exchange Company."),
 # the headline far from Boston: even the number is off
 dict(type="read", item="azrep", boxes=B['a_head'],
  say="The wire story reached Phoenix, Arizona, under this headline. Makes dollars gain fifty cents, within fifty four days. Even the headline had the days wrong. Further down the column, it is forty five."),
 dict(type="read", item="azrep", boxes=B['a_crowd'],
  say="For several weeks, crowds have flocked to Ponzi's offices, and given their savings, in exchange for notes of the company, for the principal plus fifty per cent, payable in ninety days. Invariably, Ponzi is said to have paid off the note in forty five days. And there has been no complaint that any person has failed to receive money when due."),
 dict(type="table", item="azrep", zoom=0.85, boxes=B['a_crowd'][6:],
  say="No complaint. That was Ponzi's best argument. People put money in, and took more money out. But what was he buying with it?"),
 dict(type="read", item="azrep", boxes=B['a_sys'],
  say="Ponzi describes his exchange system, as being based on the use of the international reply coupon, authorized under the international postal agreement."),
 # the mechanism, on the building it depends on
 dict(type="photo", item="posq", focus=[2800, 2300], nf=0.45, drift=[0.4, 0], labels=[dict(at=[2800, 1250], text="Boston Post Office", sub="Post Office Square · Detroit Publishing Co.")],
  say="A reply coupon was a small slip sold at post offices around the world. You mailed it abroad, and the person who got it could trade it for a stamp at their own post office. Ponzi's story was simple. After the war, money in Europe was weak. Buy coupons cheaply there. Cash them for more here."),
 dict(type="read", item="azrep", boxes=B['a_400'],
  say="This usually takes forty five days, according to Ponzi, who says his profits have reached four hundred per cent in some transactions."),
 dict(type="table", item="azrep", zoom=0.75,
  say="Four hundred per cent. It sounded like a loophole that bankers had somehow missed. There was just one way to check it. Count the coupons."),
 dict(type="chapter", kicker="PART 2", title="He paid", chapterName="He paid", item="trib28", say="Part two. He paid."),
 # the first official move
 dict(type="read", item="azrep", boxes=B['a_bar'],
  say="On July twenty sixth, the district attorney stepped in. A bar was placed today, on the rush of people to give their money to Charles Ponzi, head of the Securities Exchange Company, on his promise to repay with fifty per cent."),
 dict(type="read", item="azrep", boxes=B['a_audit'],
  say="Ponzi agreed to accept no further deposits, until an auditor selected by the district attorney has examined his accounts, which are said to total millions."),
 # the place (picture): where the crowds stood
 dict(type="photo", item="cityhall", focus=[1320, 330], nf=0.45, drift=[0.5, 0], labels=[dict(at=[1320, 120], text="Boston City Hall", sub="School Street · c1903")],
  say="His offices were in the middle of Boston, near City Hall, with an entrance on a narrow lane called Pie Alley. When the news broke, that lane filled with people who wanted their money back. Ponzi did something nobody expected."),
 dict(type="read", item="trib28", boxes=B['r_head'],
  say="Money wizard pays all claims. Court denies injunction."),
 dict(type="read", item="trib28", boxes=B['r_thou'],
  say="Thousands of persons, in all stations of life, have invested money with Ponzi, ranging from ten dollars to fifty thousand. The notes call for fifty per cent on their investment within ninety days. But in most instances, Ponzi has paid principal and profit in full in that time."),
 dict(type="table", item="trib28", zoom=0.8,
  say="He paid every claim, in cash. To the crowd, that looked like proof. A swindler runs. This man stayed and paid. So where was the money coming from?"),
 dict(type="chapter", kicker="PART 3", title="Count the coupons", chapterName="Count the coupons", item="trib31b", say="Part three. Count the coupons."),
 # THE TURN: the record, printed under the same headline
 dict(type="read", item="trib31b", boxes=B['p_head'],
  say="Back to July thirty first. The wizard story jumps to page three, under the same headline."),
 dict(type="read", item="trib31b", boxes=B['p_30'], card=dict(label="BOSTON POST OFFICE · 3 MONTHS", value="30", unit="dollars of coupons", source="New-York Tribune, p. 3"),
  say="A statement came from Postmaster Roland Baker, that the Boston post office redeemed only thirty dollars worth of international postal reply coupons, in the last three months, for Ponzi's exchange company."),
 dict(type="table", item="trib31b", zoom=1.2, boxes=B['p_30'][2:4],
  say="Thirty dollars. Against a fortune said to be nine million. If his profits came from reply coupons, those coupons had to be cashed somewhere. In Boston, in three months, they barely existed."),
 dict(type="read", item="trib31b", boxes=B['p_stats'],
  say="The federal attorney added the national figures. Up to and including the year ending June thirtieth, nineteen eighteen, fifty four thousand, four hundred and thirty six dollars worth of coupons were redeemed by this government."),
 dict(type="table", item="trib31b", zoom=0.8,
  say="Fifty four thousand dollars, in about ten years, for the whole country. Ponzi was said to be holding millions of the public's money. Whatever was paying his investors, the record says it was not postal coupons."),
 dict(type="read", item="trib31", boxes=B['t_smile'],
  say="But the dapper little man who has them all guessing, continues to smile, nonchalantly signing thousands of dollars worth of checks, and declaring: I should worry."),
 dict(type="chapter", kicker="PART 4", title="Hopelessly insolvent", chapterName="Hopelessly insolvent", item="wtimes2", say="Part four. Hopelessly insolvent."),
 dict(type="read", item="wtimes2", boxes=B['w_head'],
  say="August second. A new headline. Claims Ponzi is insolvent."),
 dict(type="read", item="wtimes2", boxes=B['w_charge'],
  say="Charges, that Ponzi is unbalanced on one subject, is hopelessly insolvent, has not sufficient funds to meet his notes, and has sent or received no money from Europe recently. Written by William H. McMasters, who has been employed as a publicity man by Ponzi."),
 dict(type="table", item="wtimes2", zoom=0.9,
  say="The accusation came from inside. McMasters had worked for Ponzi. His article ran in the Boston Post. Ponzi answered the same day."),
 dict(type="read", item="wtimes2", boxes=B['w_deny'],
  say="McMasters' statement, that I have not sent money abroad, and that it has not taken the course of my system of operations, and returned to this country with heavy profits, is entirely false."),
 # the run: the crowd still trusts him
 dict(type="read", item="wtimes3", boxes=B['x_head'] + B['x_line'],
  say="The next day, the run got worse. Pays millions to investors. More than five hundred note holders, anxious to get their money back, lined up outside the Pie Alley entrance. A line which extended out to City Hall Avenue, and was constantly increasing."),
 dict(type="read", item="wtimes3", boxes=B['x_cheer'],
  say="A cheer went up from the waiting men and women, when the doors were opened."),
 dict(type="table", item="wtimes3", zoom=0.8,
  say="A cheer, for the man they were lining up to leave. But the window was about to close."),
 dict(type="chapter", kicker="PART 5", title="Not one cent", chapterName="Not one cent", item="trib10", say="Part five. Not one cent."),
 dict(type="read", item="trib10", boxes=B['n_head'],
  say="August tenth. Ponzi sued as bankrupt, by creditors."),
 dict(type="read", item="trib10", boxes=B['n_cent'],
  say="Charles Ponzi, financial wizard, announced tonight, that he would not pay out one cent of money tomorrow at his offices."),
 dict(type="read", item="trib10", boxes=B['n_bank'],
  say="Earlier in the day, involuntary bankruptcy proceedings had been instituted against Ponzi by three creditors. And the State Bank Commissioner had ordered the Hanover Trust Company, not to pay out any more money on checks of Ponzi or his agents."),
 dict(type="read", item="trib13", boxes=B['k_head'],
  say="Three days later. Ponzi is arrested. Took in twenty millions. Says he cannot pay."),
 dict(type="read", item="trib13", boxes=B['k_insol'],
  say="Financial wizard said to be hopelessly insolvent, by officials who scanned accounts."),
 dict(type="read", item="trib13", boxes=B['k_30k'], card=dict(label="INVESTORS · ESTIMATE", value="30,000", unit="people", source="New-York Tribune, 13 Aug 1920"),
  say="An estimate, that some thirty thousand persons entrusted upward of twenty million dollars to the promoter."),
 dict(type="read", item="trib13", boxes=B['k_fraud'],
  say="And a post office inspector declared, that Ponzi's claim that he had made millions by manipulating international reply coupons was a stupendous fraud. And that in six years, dealings in those coupons, throughout the international postal union, would not add up to five hundred thousand dollars."),
 dict(type="chapter", kicker="PART 6", title="Thus passes glory", chapterName="Thus passes glory", item="star30", say="Part six. Thus passes glory."),
 dict(type="read", item="star30", boxes=B['s_head'],
  say="November thirtieth, nineteen twenty. Ponzi gets five year term for fraud. Promoter changes plea to guilty."),
 dict(type="read", item="star30", boxes=B['s_count'],
  say="It was charged that Ponzi had represented falsely, that he was able to pay interest at the rate of fifty per cent in forty five days, from profits made in international postal reply coupons."),
 dict(type="read", item="star30", boxes=B['s_props'],
  say="And the paper explained what the coupons had hidden. The little Italian, with prison sentences in Canada and this country behind him, developed his supposed scheme, only to have his house of easy money topple over on him, when the props of income from investors were pulled out."),
 dict(type="table", item="star30", zoom=1.1, boxes=B['s_props'][-2:],
  say="The props of income from investors. That was the whole system. The money paid out to the early investors had come in from the later ones. When new money stopped, the payments stopped."),
 dict(type="read", item="star30", boxes=B['s_gloria'],
  say="As he faced the court, he wrote one line for the press. Sic transit gloria mundi. Thus passes the glory of the world."),
 dict(type="photo", item="ponzi", focus=[2080, 1750], nf=0.55, zoom=1.1, drift=[-0.2, 0],
  say="It was not the end of Charles Ponzi. In nineteen thirty four he was deported to Italy. He died in Rio de Janeiro in nineteen forty nine, nearly penniless. The Boston Post won the Pulitzer Prize for public service, for exposing him. And his name became the word for this kind of scheme."),
 # verdict: printed vs the record, printed one struck
 dict(type="compare", a=dict(label="NEW-YORK TRIBUNE · 31 JUL 1920 · PAGE 1", quote="\"…said to have made more than $9,000,000 … by dealing in international postal coupons.\"", value="9,000,000", unit="dollars · as printed"),
  b=dict(label="BOSTON POST OFFICE · SAME STORY · PAGE 3", quote="\"…redeemed only $30 worth of International Postal Reply coupons in the last three months…\"", value="30", unit="dollars · the record", source="New-York Tribune · Chronicling America"), strike="a",
  say="As printed: nine million dollars, from postal coupons. As recorded, under the same headline: thirty dollars worth of coupons, in three months. The answer was on page three all along."),
 # ending: answer the opening, then the comment question
 dict(type="read", item="trib31b", boxes=B['p_30'],
  say="So how did he keep a city believing? He paid. Every payment looked like proof, and every payment came from the next person in line. The thirty dollar figure was printed on July thirty first. Ponzi kept paying for nine more days. Here is my question. If you had been standing in Pie Alley, holding one of his notes, would you have taken your money out, or waited for the fifty per cent? Tell me in the comments."),
 dict(type="end", say="If you like history told from the papers themselves, give this video a like, and subscribe to As Printed. For what the papers said, and what the archive says."),
]
short = [
 dict(type="read", item="trib31", boxes=B['t_wiz'], card=dict(label="AS PRINTED", value="31 JUL 1920", source="New-York Tribune"),
  say="Charles Ponzi, the financial wizard, said to have made more than nine million dollars in a few months, by dealing in postal coupons."),
 dict(type="read", item="azrep", boxes=B['a_crowd'][:5],
  say="His promise: fifty per cent profit in forty five days. Crowds handed him their savings."),
 dict(type="photo", item="posq", focus=[2800, 2300], nf=0.45, drift=[0.4, 0],
  say="His secret, he said, was postal reply coupons. Bought cheap in Europe. Cashed for more at American post offices."),
 dict(type="read", item="trib31b", boxes=B['p_30'],
  say="But on page three, the same story quoted the Boston postmaster. In three months: thirty dollars worth of coupons, for Ponzi's company."),
 dict(type="read", item="trib13", boxes=B['k_head'],
  say="Two weeks later. Ponzi is arrested. Took in twenty millions. Says he cannot pay."),
 dict(type="compare", a=dict(label="PRINTED · 31 JUL 1920", quote="\"…more than $9,000,000 … in international postal coupons\"", value="9,000,000", unit="dollars"),
  b=dict(label="THE RECORD · SAME STORY", quote="\"…only $30 worth of International Postal Reply coupons…\"", value="30", unit="dollars", source="New-York Tribune, p. 3"), strike="a",
  say="Nine million, as printed. Thirty dollars, as recorded. So where did the wizard's money come from? From the next investor in line."),
]
ep = dict(slug="coupon-king", title="The Coupon King", indexTitle="Charles Ponzi · 1920", seed=24, items=items,
 end=dict(sub="Charles Ponzi, as printed, July – November 1920", credits=["Library of Congress · Chronicling America · Prints & Photographs", "Photos: Bain News Service · Detroit Publishing Co. · panoramic photograph c1903", "Narration: VibeVoice · Piano: Salamander Grand (CC BY 3.0)"]),
 films=dict(long=dict(size="1920x1080", shots=long), short=dict(size="1080x1920", shots=short)))
json.dump(ep, open(f'{H}/episode.json', 'w'), indent=1, ensure_ascii=False)
w = lambda f: sum(len(s.get('say', '').split()) for s in f)
print('long words', w(long), 'shots', len(long), 'short words', w(short), 'shots', len(short))
