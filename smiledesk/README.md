# SmileDesk

**A dental clinic's front office, run by AI bots.** SmileDesk is a fork of [Bops](https://github.com/OrgoAI/bops) (FSL-1.1-ALv2), customised for dental practices by NorthStar Dizital. It is based on Bops but is not the official Bops app.

Every workspace starts with a four-bot team:

| Bot | Role | What it does |
|---|---|---|
| **Molly** | Practice Manager (main bot) | Runs the team, hands each job to the right bot, reports back to you. |
| **Rosa** | Receptionist | Answers patients by chat, email, text and phone (Pro/Max number). Books, moves and cancels appointments on Google Calendar. Sends emergencies straight to the emergency line. Takes messages. Never diagnoses or quotes prices. |
| **Remi** | Reminders | Drafts tomorrow's reminders ("Reply C to confirm or R to reschedule") and same-day nudges. Follows up on no-shows. Runs the 6-month check-up and cleaning recall. |
| **Ruby** | Reviews | Drafts a thank-you with your Google review link the day after each visit. Drafts replies to new Google Business Profile reviews. Flags 1 and 2 star reviews at once. Sends a weekly summary. |

Each bot's procedure lives in its **How I work** (Settings for that bot), so you can edit it in the app.

## Set it up for a clinic

1. **Clinic details.** Edit `CLINIC` in [`lib/dental-clinic.ts`](lib/dental-clinic.ts): name, phone, address, hours, services and their lengths, insurance, cancellation policy, emergency line, Google review link and recall interval. The bots quote these to patients, so replace every placeholder before going live.
2. **Run it.** Follow [Run it yourself](UPSTREAM-README.md#run-it-yourself) (`npm run setup`, then `npm run app`). It needs an Orgo account and OpenAI keys, plus Composio for connected apps.
3. **Connect the apps** in the Vault and give each one to the right bot:
   - **Google Calendar** (the clinic's appointment calendar) to Rosa, Remi and Ruby.
   - **Gmail** (the clinic inbox) to Rosa.
   - **Google Business Profile** to Ruby.
4. **Turn on the starters.** When an app finishes connecting, SmileDesk offers its dental routines:

| Starter | App | When (default) | Bot |
|---|---|---|---|
| Tomorrow's appointment reminders | Google Calendar | Daily 4 PM | Remi |
| Same day reminders | Google Calendar | 2 h before each appointment | Remi |
| No shows and late cancels | Google Calendar | Weekdays 9 AM | Remi |
| Check up and cleaning recall | Google Calendar | Mondays 10 AM | Remi |
| Ask for reviews after visits | Google Calendar | Weekdays 11 AM | Ruby |
| New Google reviews | Google Business Profile | Every 2 h, 8 AM to 8 PM | Ruby |
| Weekly reviews summary | Google Business Profile | Fridays 4 PM | Ruby |
| Patient booking requests | Gmail | Every 15 min, weekday office hours | Rosa |

5. **Phone and text (optional).** On Pro and Max the main bot gets a phone number (AgentPhone). Point the clinic's after-hours line at it, or hand phone work to Rosa.

## Safety rules built in

- **Asks before acting.** Every starter only reads and *drafts* messages, with a Send card in the chat. Nothing goes to a patient, and no booking changes, until you approve it, unless you set a bot to *Just do it*.
- **Patient privacy.** Messages to patients carry only first name, time and service: no diagnosis or treatment details. Public review replies never confirm someone is a patient. Check your local rules (HIPAA, GDPR) and sign a BAA or DPA with each provider before you put real patient data through it.
- **No medical advice.** The receptionist never diagnoses or quotes prices. Pain, swelling, bleeding or trauma always gets the emergency line first.
- **Honest reviews.** No discounts or gifts for reviews (against Google's policy and FTC rules). Patients with a complaint are not asked.

## What changed from Bops

- `lib/dental-clinic.ts`: new. Clinic settings and the four-bot team with their How I work.
- `lib/server/store.ts`, `lib/server/workspaces.ts`: a fresh install and every new workspace start with the dental team, not Boppy alone.
- `lib/routine-catalog.ts`: the eight dental starters (`DENTAL_ROUTINES`), plus Google Business Profile as a known app.
- `scripts/test-dental-clinic.mjs`: new tests. `scripts/test-routine-suggestions.mjs`: updated for the extra starters.
- `package.json`: renamed to SmileDesk (app id `com.northstardizital.smiledesk`, no publishing to OrgoAI's releases).

Tests: `node --conditions=react-server scripts/test-dental-clinic.mjs` and `scripts/test-routine-suggestions.mjs`.

## Before you distribute it

Bops' [TRADEMARK.md](TRADEMARK.md) says a modified version you distribute or offer as a service needs its own name and logo. This fork renames the package and app bundle. **Still to do before you ship it to clinics:**

- The in-app text still says "Bops" in many places.
- The icon (`desktop/icon.png`, `build/`) and the bot mascots are still Bops'.
- `scripts/release.sh` signs with Orgo's Apple Developer team. Use your own.

Also note: the FSL license allows using, changing and self-hosting this fork, but not offering it as a product or hosted service that competes with Bops. Running it for a clinic yourself is fine. Check the [LICENSE](LICENSE) before you sell it as a hosted service.

The original Bops README is in [UPSTREAM-README.md](UPSTREAM-README.md).
