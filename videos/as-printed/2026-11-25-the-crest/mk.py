import json, os
# Storyboard = the shot list below. Each shot's purpose is in the comment above it.
# Newspaper line boxes come from the Library of Congress OCR (ALTO TextLine coordinates) of each Evening Public Ledger
# page, scaled to raw/<id>.jpg (raw/<id>.lines.json, made by the research step; raw/ is git-ignored). Every quoted
# line was read on the scan itself (the OCR text is noisy). The Public Health Reports boxes were drawn by hand on the
# 400 dpi page render and checked with engine/tools/boxes.py.
H = os.path.dirname(os.path.abspath(__file__))
LN = {}
def L(item, *ranges):
    if item not in LN: LN[item] = json.load(open(f'{H}/raw/{item}.lines.json'))
    out = []
    for r in ranges:
        a, b = (r, r) if isinstance(r, int) else r
        out += [LN[item][i][1:] for i in range(a, b + 1)]
    return out

EPL = "LCCN sn83045211"
items = [
 dict(id="sep30", kind="paper", src="raw/sep30.jpg", label="EVENING PUBLIC LEDGER · 30 SEP 1918", short="Evening Public Ledger, 30 Sept", catalog=EPL, row="\"reached its crest\""),
 dict(id="oct7", kind="paper", src="raw/oct7.jpg", label="EVENING PUBLIC LEDGER · 7 OCT 1918", short="Evening Public Ledger, 7 Oct", catalog=EPL, row="\"reached its peak\""),
 dict(id="oct9", kind="paper", src="raw/oct9.jpg", label="EVENING PUBLIC LEDGER · 9 OCT 1918", short="Evening Public Ledger, 9 Oct", catalog=EPL, row="\"high tide\""),
 dict(id="sep19", kind="paper", src="raw/sep19.jpg", label="EVENING PUBLIC LEDGER · 19 SEP 1918", short="Evening Public Ledger, 19 Sept", catalog=EPL, row="\"not alarmed\""),
 dict(id="broad", kind="print", src="raw/1s14647u.tif", crop=[660, 720, 2880, 2640], horizon=1200, nomask=True, inches=11, label="BROAD STREET, PHILADELPHIA · STEREOGRAPH c1906", short="Broad Street from City Hall (stereograph)", catalog="LC-USZ62-57370", credit="Universal View Co., c1906"),
 dict(id="sep28", kind="paper", src="raw/sep28.jpg", label="EVENING PUBLIC LEDGER · 28 SEP 1918", short="Evening Public Ledger, 28 Sept", catalog=EPL, row="parade day"),
 dict(id="oct3", kind="paper", src="raw/oct3.jpg", label="EVENING PUBLIC LEDGER · 3 OCT 1918", short="Evening Public Ledger, 3 Oct", catalog=EPL, row="city closed"),
 dict(id="stlouis", kind="print", src="raw/01290u.tif", crop=[100, 180, 7590, 6050], horizon=2560, nomask=True, inches=12, label="ST. LOUIS RED CROSS MOTOR CORPS · OCT 1918", short="St. Louis Red Cross Motor Corps (photograph)", catalog="LC-DIG-ds-01290", credit="American National Red Cross collection"),
 dict(id="seattle", kind="negative", src="raw/02654u.tif", crop=[320, 320, 6900, 9500], horizon=7170, nomask=True, inches=7, label="SEATTLE STREETCAR · MASKS REQUIRED · 1918", short="Seattle streetcar, masks required (photograph)", catalog="LC-DIG-anrc-02654", credit="American National Red Cross collection"),
 dict(id="oct8", kind="paper", src="raw/oct8.jpg", label="EVENING PUBLIC LEDGER · 8 OCT 1918", short="Evening Public Ledger, 8 Oct", catalog=EPL, row="\"over top\""),
 dict(id="oct12", kind="paper", src="raw/oct12.jpg", label="EVENING PUBLIC LEDGER · 12 OCT 1918", short="Evening Public Ledger, 12 Oct", catalog=EPL, row="3,234 deaths"),
 dict(id="dcamb", kind="negative", src="raw/18662u.tif", crop=[260, 220, 5040, 4040], horizon=2715, nomask=True, inches=8, label="RED CROSS AMBULANCE STATION, WASHINGTON · 1918", short="Red Cross Emergency Ambulance Station, Washington (photograph)", catalog="LC-DIG-npcc-18662", credit="National Photo Company"),
 dict(id="oct16", kind="paper", src="raw/oct16.jpg", label="EVENING PUBLIC LEDGER · 16 OCT 1918", short="Evening Public Ledger, 16 Oct", catalog=EPL, row="\"less grip here\""),
 dict(id="phr", kind="paper", src="raw/phr.jpg", inches=9, label="PUBLIC HEALTH REPORTS · 22 NOV 1918 · P. 2032", short="Public Health Reports, 22 Nov 1918", catalog="U.S. Public Health Service, vol. 33 no. 47", row="4,218 in one week"),
]
B = dict(
 s19_head=L('sep19', (26, 30)), s19_alarm=L('sep19', (914, 917)),
 s28_head=L('sep28', (304, 305)), s28_pg=L('sep28', (318, 323)), s28_march=L('sep28', (379, 382)),
 s30_head=L('sep30', (36, 38)), s30_sub=L('sep30', (39, 41)), s30_crest=L('sep30', (46, 53)),
 o3_head=L('oct3', (25, 27)), o3_order=L('oct3', (41, 47)), o3_alarm=L('oct3', (55, 58)),
 o7_head=L('oct7', (42, 47)), o7_175=L('oct7', (49, 50)), o7_peak=L('oct7', (76, 84)), o7_alarm=L('oct7', (85, 88)),
 o8_head=L('oct8', (42, 47)), o8_check=L('oct8', (52, 55)), o8_top=L('oct8', (57, 61)),
 o9_head=L('oct9', (302, 304)), o9_sub=L('oct9', (305, 308)), o9_wane=L('oct9', (316, 319)), o9_tide=L('oct9', (320, 325)),
 o12_head=L('oct12', (921, 927)), o12_great=L('oct12', (932, 935)), o12_ctrl=L('oct12', (936, 940)),
 o12_after=L('oct12', (963, 968)), o12_week=L('oct12', (969, 971)), o12_loan=L('oct12', (333, 334)),
 o16_head=L('oct16', (9, 10)), o16_sub=L('oct16', (12, 15)), o16_burial=L('oct16', (16, 18)),
 phr_title=[[270, 170, 1960, 275]], phr_weeks=[[730, 505, 2000, 620]], phr_row=[[220, 1282, 2000, 1330]],
)
long = [
 # HOOK (variation from the last five episodes: no title card first; three printed "crests" in a row on three pages)
 dict(type="read", item="sep30", boxes=B['s30_head'],
  say="Grip decreasing. Danger passing, doctors believe. That was the front page of Philadelphia's Evening Public Ledger, on September thirtieth, nineteen eighteen."),
 dict(type="read", item="oct7", boxes=B['o7_peak'][-2:],
  say="A week later, the same paper said the disease had reached its peak."),
 dict(type="read", item="oct9", boxes=B['o9_tide'][2:4],
  say="Two days after that, it had reached high tide, and would begin to recede."),
 # title card: the conflict and the question, no answer yet
 dict(type="title", item="sep30", title="The Crest", sub="PHILADELPHIA · THE 1918 FLU · AS PRINTED", chapterName="Danger passing",
  say="Three times in ten days, the city was told the worst was over. But a government table, printed a few weeks later, counts the dead week by week. And it says something very different. So when did Philadelphia's flu really peak? And why did the papers keep calling it early?"),
 dict(type="chapter", kicker="PART 1", title="Not alarmed", chapterName="Not alarmed", item="sep19", say="Part one. Not alarmed."),
 # the start: a sailor, a thousand cases, a calm official
 dict(type="read", item="sep19", boxes=B['s19_head'],
  say="September nineteenth. One sailor dies. One thousand grip cases. Disease spreads to civilian population. Krusen not alarmed."),
 dict(type="read", item="sep19", boxes=B['s19_alarm'][:3],
  say="Doctor Krusen said there was no occasion for alarm, over the spread of the disease downtown."),
 dict(type="table", item="sep19", zoom=0.75,
  say="Wilmer Krusen ran the city's Department of Health and Charities. Grip was the everyday word for influenza. The first cases were sailors and marines. Now the disease was in the city. And nine days later, Philadelphia held a parade."),
 dict(type="chapter", kicker="PART 2", title="Broad Street", chapterName="Broad Street", item="sep28", say="Part two. Broad Street."),
 dict(type="read", item="sep28", boxes=B['s28_head'],
  say="September twenty eighth. Pageant on Broad Street will start campaign."),
 dict(type="read", item="sep28", boxes=B['s28_pg'],
  say="The Victory Pageant, along Broad Street, to introduce the fourth Liberty Loan here today, will start at Broad and Diamond streets at two o'clock."),
 # the place (picture): the street the crowd filled
 dict(type="photo", item="broad", focus=[1770, 1500], nf=0.4, drift=[0, -0.35], labels=[dict(at=[1770, 1150], text="Broad Street", sub="looking south from City Hall · stereograph c1906")],
  say="This is Broad Street, looking south from City Hall, about twelve years earlier. The Liberty Loan sold war bonds, and the parade was there to sell them. Historians put the crowd that afternoon at about two hundred thousand people."),
 dict(type="read", item="sep28", boxes=B['s28_march'],
  say="The line of march extends for twenty three blocks along Broad Street. And the marchers, in parade order, will stretch along twelve city squares."),
 dict(type="table", item="sep28", zoom=0.8,
  say="Two days after the parade, the paper printed its first good news. Remember the headline from the start. Here is the rest of it."),
 dict(type="chapter", kicker="PART 3", title="Danger passing", chapterName="Danger passing", item="sep30", say="Part three. Danger passing."),
 dict(type="read", item="sep30", boxes=B['s30_sub'],
  say="Fewer deaths reported in city and naval district."),
 dict(type="read", item="sep30", boxes=B['s30_crest'],
  say="The epidemic of Spanish influenza in this city and district seems to have reached its crest. Reports received by the Bureau of Vital Statistics, and by the medical staff of the Fourth Naval District, show a falling off in the number of new cases."),
 dict(type="table", item="sep30", zoom=0.75,
  say="Notice what the crest was measured in. New cases. Not deaths. Hold on to that. Because three days later, the same paper printed this."),
 # the first contradiction: the city closes
 dict(type="read", item="oct3", boxes=B['o3_head'],
  say="Order closes schools, theatres, and meeting places, in grip fight."),
 dict(type="read", item="oct3", boxes=B['o3_order'],
  say="All theatres, schools, churches, motion picture houses, dance halls, and other places of public gathering in Philadelphia must close immediately, in the hope of checking the spread of Spanish influenza."),
 dict(type="read", item="oct3", boxes=B['o3_alarm'],
  say="Realizing that the epidemic is spreading to a most alarming degree, this action was decided upon."),
 # the picture: what the same weeks looked like in other American cities (labelled)
 dict(type="photo", item="stlouis", focus=[4800, 3000], nf=0.5, drift=[-0.3, 0], labels=[dict(at=[4900, 1900], text="St. Louis, October 1918", sub="Red Cross Motor Corps, masked, with stretchers")],
  say="The same weeks, in other American cities. This is the Red Cross Motor Corps in St. Louis, in October nineteen eighteen. Masks, stretchers, and ambulances lined up at the curb."),
 dict(type="photo", item="seattle", focus=[3000, 3700], nf=0.45, drift=[0.3, -0.2], labels=[dict(at=[3000, 2950], text="Seattle, 1918", sub="no mask, no ride")],
  say="In Seattle, no one could ride a streetcar without a mask. In Philadelphia, the city was shut. And yet, the headlines were about to turn hopeful again."),
 dict(type="chapter", kicker="PART 4", title="Peak after peak", chapterName="Peak after peak", item="oct7", say="Part four. Peak after peak."),
 dict(type="read", item="oct7", boxes=B['o7_head'][:3],
  say="October seventh. Krusen hopeful of curbing grip. Public aids fight."),
 dict(type="read", item="oct7", boxes=B['o7_head'][3:] + B['o7_175'],
  say="Five thousand, five hundred and sixty one new cases, reported in the last forty eight hours. One hundred and seventy five thousand persons in city stricken, is estimate."),
 dict(type="read", item="oct7", boxes=B['o7_peak'],
  say="Health Director Krusen expressed the belief today, that the disease had reached its peak."),
 dict(type="read", item="oct8", boxes=B['o8_head'],
  say="The next day. City over top in fight on grip, Doctor Krusen says. Reports show epidemic has been considerably checked."),
 dict(type="read", item="oct8", boxes=B['o8_check'],
  say="There has been a decided check to the influenza epidemic in Philadelphia. Indications point to a daily decrease in the number of cases."),
 dict(type="read", item="oct9", boxes=B['o9_head'] + B['o9_sub'][:3],
  say="And the day after that. Church closing order modified. Grip on decline. Health Director Krusen confident disease will slowly disappear."),
 dict(type="read", item="oct9", boxes=B['o9_wane'],
  say="Officials believing, that the influenza epidemic is waning in Philadelphia."),
 dict(type="table", item="oct9", zoom=0.8,
  say="The crest. The peak. Over the top. High tide. Four times in ten days. Each one based on the count of new cases. But a different number was coming in every day too. And on Saturday, October twelfth, the paper printed it."),
 dict(type="chapter", kicker="PART 5", title="Trebled", chapterName="Trebled", item="oct12", say="Part five. Trebled."),
 # THE TURN: the paper's own death count
 dict(type="read", item="oct12", boxes=B['o12_head'][:2],
  say="City death toll trebled by grip."),
 dict(type="read", item="oct12", boxes=B['o12_head'][2:], card=dict(label="PHILADELPHIA · DEATHS IN ONE WEEK", value="3234", unit="all causes", note="week ended 11 Oct 1918", source="Evening Public Ledger, 12 Oct"),
  say="Fatalities mount, from eleven hundred and ninety one, to three thousand, two hundred and thirty four. Influenza causing sixteen hundred and ninety seven. Pneumonia kills nine hundred and thirty eight."),
 dict(type="read", item="oct12", boxes=B['o12_great'],
  say="The week's mortality was the greatest ever known in Philadelphia, far exceeding last week's, which was the highest up to that time."),
 dict(type="read", item="oct12", boxes=B['o12_ctrl'],
  say="The figures were given today by Health Director Krusen, who warned against public alarm, however, asserting that the influenza epidemic was under control."),
 dict(type="table", item="oct12", zoom=0.8,
  say="Under control. Printed under the worst week the city had ever recorded. And the paper had already explained, in its own words, why the deaths would keep coming."),
 dict(type="read", item="oct12", boxes=B['o12_after'][3:],
  say="Pneumonia, the frequent aftermath of the grip plague."),
 dict(type="photo", item="dcamb", focus=[2830, 2300], nf=0.5, drift=[0.25, 0], labels=[dict(at=[1500, 600], text="Red Cross Ambulance Station", sub="Washington, D.C., 1918 · a demonstration")],
  say="Many of the deaths came from pneumonia that followed the flu, often a week or more after someone fell ill. So a fall in new cases did not mean a fall in deaths. Not yet. The deaths were still on their way."),
 dict(type="chapter", kicker="PART 6", title="Less grip here", chapterName="Less grip here", item="oct16", say="Part six. Less grip here."),
 dict(type="read", item="oct16", boxes=B['o16_head'],
  say="Wednesday, October sixteenth. Less grip here, reports show."),
 dict(type="read", item="oct16", boxes=B['o16_sub'],
  say="Sixteen hundred and fifty six new cases in last twenty four hours. Four thousand and thirteen last Wednesday. List four hundred and sixty six deaths today."),
 dict(type="read", item="oct16", boxes=B['o16_burial'],
  say="Doctor Krusen announces burial situation in this city has greatly improved."),
 dict(type="table", item="oct16", zoom=0.8,
  say="The cases really were falling. The paper was right about that. But four hundred and sixty six deaths, in a single day. So which week was the worst? For that, we need a record that wasn't written for the next morning's front page."),
 dict(type="chapter", kicker="PART 7", title="The record", chapterName="The record", item="phr", say="Part seven. The record."),
 # the record: the government's weekly table
 dict(type="read", item="phr", boxes=B['phr_title'],
  say="Public Health Reports, November twenty second, nineteen eighteen. Cases of influenza and deaths from influenza and pneumonia, as reported to the United States Public Health Service."),
 dict(type="read", item="phr", boxes=B['phr_weeks'] + B['phr_row'], card=dict(label="PHILADELPHIA · WEEK ENDING 19 OCT", value="4218", unit="deaths", note="influenza and pneumonia", source="Public Health Reports, 22 Nov 1918"),
  say="Philadelphia, deaths, week by week. Week ending October fifth: sixteen hundred and twenty five. October twelfth: three thousand and sixty. October nineteenth: four thousand, two hundred and eighteen. Then the numbers fall. Two thousand three hundred and forty one. Twelve hundred and three."),
 dict(type="table", item="phr", zoom=0.85,
  say="The deadliest week of all ended on October nineteenth. Nineteen days after danger passing. Twelve days after the peak. Ten days after high tide. And the Public Health Service warned that its own figures were probably considerably below the actual ones. Added up, from October to mid November, this one row counts nearly thirteen thousand deaths."),
 # verdict: printed vs the record, the printed one struck
 dict(type="compare", a=dict(label="EVENING PUBLIC LEDGER · 30 SEP 1918", quote="\"…seems to have reached its crest.\"", value="30 Sep", unit="crest, as printed"),
  b=dict(label="PUBLIC HEALTH REPORTS · 22 NOV 1918", quote="Philadelphia deaths, week ending Oct. 19: 4,218 — the highest week in the table", value="19 Oct", unit="the deadliest week", source="U.S. Public Health Service"), strike="a",
  say="As printed: the crest, on September thirtieth. As recorded: the deadliest week, ending October nineteenth."),
 # why: fair to the paper, then the payoff
 dict(type="read", item="sep30", boxes=B['s30_crest'][6:],
  say="So why did they keep calling it early? Not because the cases were invented. They counted new cases, from doctors too busy to report them all. And the deaths followed the cases, by a week or more. Every crest was real on the chart in front of them. It just wasn't the number that mattered most."),
 dict(type="read", item="oct12", boxes=B['o12_loan'],
  say="It was also wartime. On the same front page as the death toll, the paper warned that the Liberty Loan was nearly one hundred million dollars behind schedule in this district. Good news helped sell bonds. Whether that shaped the health headlines, the page doesn't say. But it was printed right beside them."),
 # ending: answer the opening question, then the comment question and the CTA
 dict(type="read", item="sep30", boxes=B['s30_head'],
  say="So when did Philadelphia's flu peak? Not on September thirtieth. The worst week came almost three weeks later, after four front pages had already called the crest. Here is my question. If you had been reading this paper in October nineteen eighteen, which headline would have made you stop believing it? Tell me in the comments."),
 dict(type="end", say="If you like history told from the papers themselves, give this video a like, and subscribe to As Printed. For what the papers said, and what the archive says."),
]
short = [
 # 0-1 s: the printed line, mid-action
 dict(type="read", item="sep30", boxes=B['s30_head'], card=dict(label="AS PRINTED", value="30 SEP 1918", source="Evening Public Ledger"),
  say="Grip decreasing. Danger passing, doctors believe."),
 dict(type="read", item="sep30", boxes=B['s30_crest'][:2],
  say="Philadelphia, nineteen eighteen. The flu, said the paper, had reached its crest. So why was the worst still coming?"),
 dict(type="read", item="oct7", boxes=B['o7_peak'][-2:],
  say="A week later: the disease had reached its peak."),
 dict(type="read", item="oct9", boxes=B['o9_tide'][2:4],
  say="Then: high tide. It will begin to recede."),
 dict(type="read", item="oct12", boxes=B['o12_head'][:2],
  say="Then, October twelfth, on the front page. City death toll trebled by grip. Three thousand, two hundred and thirty four deaths in one week."),
 dict(type="read", item="phr", boxes=B['phr_row'], card=dict(label="WEEK ENDING 19 OCT", value="4218", unit="deaths", source="Public Health Reports"),
  say="The government's weekly table shows the deadliest week came after that. Four thousand, two hundred and eighteen deaths."),
 dict(type="compare", a=dict(label="PRINTED · 30 SEP 1918", quote="\"…reached its crest.\"", value="30 Sep", unit="the crest"),
  b=dict(label="THE RECORD", quote="deadliest week ends Oct. 19", value="19 Oct", unit="the real peak", source="Public Health Reports"), strike="a",
  say="They were counting new cases. The deaths came a week or more later. Danger passing? Not for almost three more weeks."),
]
ep = dict(slug="the-crest", title="The Crest", indexTitle="Philadelphia · The 1918 flu", seed=25, items=items,
 end=dict(sub="Philadelphia's flu, as printed, September – October 1918", credits=["Library of Congress · Chronicling America (Evening Public Ledger) · Prints & Photographs", "U.S. Public Health Service · Public Health Reports, 22 Nov 1918 (via CDC Stacks)", "Photos: American National Red Cross collection · National Photo Company · Universal View Co.", "Narration: VibeVoice · Piano: Salamander Grand (CC BY 3.0)"]),
 films=dict(long=dict(size="1920x1080", shots=long), short=dict(size="1080x1920", shots=short)))
json.dump(ep, open(f'{H}/episode.json', 'w'), indent=1, ensure_ascii=False)
w = lambda f: sum(len(s.get('say', '').split()) for s in f)
print('long words', w(long), 'shots', len(long), 'short words', w(short), 'shots', len(short))
