# whatsapp-webhook (Cloudflare Worker)

Receives WhatsApp Cloud API webhooks at `/webhook/whatsapp` for the NorthStar Dizital numbers
(+880 1872-692783 and +65 8069 4543, Meta app "Northstar Dizital Automation").

On every inbound message it:
1. Verifies Meta's `X-Hub-Signature-256`.
2. Saves the message to D1 `northstar-whatsapp-inbox` (`inbox` table) and upserts the sender in `contacts`
   (`status = replied`, or `opted_out` for "stop", "unsubscribe", "not interested", etc. — opt-out is permanent).
3. Forwards the sanitized payload to Hermes, unchanged from the previous version.

The outreach follow-ups read `contacts` before each round and skip anyone who replied or opted out.

## Deploy

### Option A — Cloudflare dashboard
1. Workers & Pages → **whatsapp-webhook** → Settings → **Bindings** → Add → **D1 database**:
   variable name `DB`, database `northstar-whatsapp-inbox`.
2. **Edit code** → replace `worker.js` with `src/worker.js` from this folder → **Deploy**.

### Option B — Wrangler
```sh
cd workers/whatsapp-webhook
npx wrangler deploy
```
Existing secrets (`WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET`, `HERMES_WEBHOOK_URL`, `HERMES_WEBHOOK_SECRET`) are kept.

## Check it works
Send a WhatsApp message to either business number, then:
```sh
npx wrangler d1 execute northstar-whatsapp-inbox --remote --command "SELECT * FROM inbox ORDER BY received_at DESC LIMIT 5"
```
