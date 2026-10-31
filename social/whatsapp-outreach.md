# WhatsApp outreach & lead data

How WhatsApp marketing works for NorthStar Dizital (business ID 1845658569890247).

## Who does what
- **Replies:** the ElevenLabs agent **Inbound Lead Qualifier** (`agent_5501m54wm9rwepdvpfff5t9thf92`) answers every
  inbound WhatsApp message on both numbers. Claude does not send personal replies.
- **Outreach + follow-ups:** Claude sends approved templates only:
  day 0 intro, day 3 follow-up 1, day 7 follow-up 2 (last). Only to opted-in contacts.
- **Lead data:** Claude collects it from ElevenLabs, not from the Cloudflare webhook.

## Numbers
| Number | Phone number ID |
|---|---|
| +880 1872-692783 (Northstar Dizital Agency) | 1381202511747067 |
| +65 8069 4543 (NorthStar Dizital) | 1413101235214590 |

## Marketing database
Cloudflare D1 `northstar-whatsapp-inbox` (`59bce3ce-ccd8-4a08-9145-82946f72e188`), table `contacts`
(schema in `workers/whatsapp-webhook/schema.sql`).

The ElevenLabs agent extracts these fields from each chat (after 15 min idle): `customer_name`, `business_name`,
`business_type`, `service_interest`, `budget`, `timeline`, `interested`, `wants_call`, `opted_out`, `lead_stage`.

## Before every follow-up round
1. List ElevenLabs conversations with `conversation_initiation_source = whatsapp` since the last sync.
2. For each, read `metadata.whatsapp.whatsapp_user_id` (the sender) and `analysis.data_collection_results`,
   and upsert into `contacts` (`source = 'elevenlabs'`, status `replied`; `opted_out` / `declined` are permanent).
3. Send the next template only to contacts with no ElevenLabs conversation, `opted_out = 0`
   and `status` not in (`replied`, `opted_out`, `internal`).

## Never message
- `6585352026`: owner's own phone (status `internal`).

## Templates (submitted 31 Oct 2026, Bangla `bn`, MARKETING)
On the messaging account behind +880 1872-692783. Image headers: `northstar-videos/out/WA-*.jpg`
(served from the `ccr-f8f3fde4-4ghldu` branch on GitHub; keep the branch or merge it before sending).

| Day | Template | Template ID | Buttons |
|---|---|---|---|
| 0 | `northstar_intro_offer` | 1458456772885747 | হ্যাঁ, কথা বলতে চাই · আগ্রহী নই · AI assistant ট্রাই করুন (samplewebsite.tech) |
| 3 | `northstar_followup_1` | 1653154379861516 | হ্যাঁ, কথা বলি · আগ্রহী নই · AI assistant ট্রাই করুন |
| 7 | `northstar_followup_2` | 2622387644865741 | হ্যাঁ · আগ্রহী নই · AI assistant ট্রাই করুন |

Each body has one placeholder, `{{1}}` = contact's name. Footer: "বন্ধ করতে STOP লিখুন".
"আগ্রহী নই" or STOP = permanent opt-out.
