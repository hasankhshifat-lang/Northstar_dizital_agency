# Daily cold email outreach: runbook

Goal: every day, pick one city in a first-tier country, find local businesses whose website has no AI chat or
voice assistant, email them a short personal note with a link to try our AI assistant, follow up, and turn replies
into calls.

Owner decisions (31 Oct 2026):
- Countries: **US, UK, Canada, Australia** only (no EU/Germany: B2B cold email there needs prior consent).
- Volume: **100 new emails per day** (owner chose this over a gradual ramp). Stop-loss rules below still apply.
- Sender: **contact@hasankhshifat.com**, added as the default "Send mail as" address in the connected Gmail
  (khshifat5@gmail.com). Never send if the From address is not contact@hasankhshifat.com.
- Booking: when someone replies with interest, draft a reply offering two times on the platform they asked for
  (Zoom, Google Meet, Teams, WhatsApp, phone, anything). The owner confirms and joins. Never confirm a meeting
  on the owner's behalf.

## Files
- `leads.csv`: every lead and its status. One row per business. Never delete rows; update status.
- `suppression.csv`: addresses that must never be emailed again (unsubscribed, bounced, complained, asked to stop).
- `templates.md`: first email and follow-ups per niche.
- `cities.md`: city rotation and which cities are done.
- `daily-log.md`: one line per day (city, leads found, sent, follow-ups, replies, bounces, meetings).

Status values: `queued`, `sent`, `fu1`, `fu2`, `fu3` (breakup), `replied`, `meeting`, `not_interested`,
`unsubscribed`, `bounced`, `skipped_has_chatbot`, `skipped_no_email`.

## Daily steps
1. **Pre-flight**
   - Read `daily-log.md`. If yesterday's bounces were over 3%, or any spam complaint or Gmail warning came in, or a
     reply came back "stop/spam": **pause new sends**, do only follow-ups and replies, and tell the owner.
   - Gmail: send a test from the connected account to contact@hasankhshifat.com and check the sent message's
     From. If it is not contact@hasankhshifat.com, do not send any outreach today; prepare the batch only.
   - `templates.md` must contain a real postal address (not `{POSTAL_ADDRESS}`). If not, prepare only; do not send.
2. **Replies first** (Gmail search `to:contact@hasankhshifat.com newer_than:2d -from:me` and replies in sent threads).
   Classify each: positive / question / not now / not interested / unsubscribe / out of office / bounce.
   - Unsubscribe, "not interested", bounce: add to `suppression.csv`, set status, stop all follow-ups.
   - Positive or question: set `replied`, draft (do not send) an answer that offers two times in the prospect's time zone on
     the platform they named, and list it for the owner in the daily summary.
   - Out of office: push `next_touch` by a week.
3. **Follow-ups due today** (`next_touch` = today, status `sent`/`fu1`/`fu2`): send the next template as a reply in
   the same Gmail thread. Schedule: first email day 0, follow-up 1 day 3, follow-up 2 day 7, breakup day 14.
4. **Find new leads**: next city in `cities.md`. For each of the 10 niches, use ClawLink `google-maps-data` /
   `contacts` (query = niche, location = city, website = withWebsite, limit = 20). Run a second query with a
   variant (e.g. "cosmetic dentist", "emergency plumber") if fewer than 10 usable emails.
   - Usable email: on the business's own domain or a clearly business mailbox. Skip masked (`**`), `privacy@`,
     `noreply@`, platform emails (joinblvd, wix, squarespace), big national chains, and anything in `suppression.csv`
     or already in `leads.csv`.
   - **Chatbot check**: open the homepage (WebFetch / page fetch) and look for chat or voice widgets (Intercom,
     Tidio, Drift, LiveChat, tawk.to, Podium, Birdeye, Zendesk, HubSpot chat, Weave, Ngage, Apex Chat, Smith.ai,
     "chat with us"). Has one: `skipped_has_chatbot`. If the site can't be opened (network blocked), mark
     `unknown` and use the template wording that does not claim they lack one.
5. **Write and send 100 first emails** (10 per niche). Personalise the first line from what we know (niche,
   neighbourhood, reviews, emergency service, opening hours). Plain text, no images, no tracking, one link
   (https://samplewebsite.tech). Space sends out (at least 20–30 seconds apart). Record `sent_date`, `thread_id`,
   `next_touch` = +3 days.
6. **Log and report**: append to `daily-log.md`, commit and push, then post a short summary: city, sent,
   follow-ups, replies that need the owner (with drafted answers), meetings to confirm.

## Compliance (every email)
- True sender name and address; honest subject (no fake "Re:"); no false claims about their site.
- Footer with postal address and a plain opt-out line ("Reply 'no thanks' and I won't email again").
- Honour opt-outs immediately and permanently.
- UK: email company addresses only (not sole traders' personal addresses). Canada (CASL): only addresses the
  business publishes on its site, message relevant to their business.

## Stop-loss
- Bounce rate over 3% in a day, any spam complaint, or a Gmail sending limit/warning: pause new sends, tell the
  owner. Gmail's daily limit is 500 (free) / 2,000 (Workspace); cold sending risks account restriction.
