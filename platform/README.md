# Northstar Client Automation Platform

This is a multi-client dashboard that Northstar's clients use to automate their chats and sales. It covers:

- one inbox for Messenger, Instagram, WhatsApp and website chat
- AI agent settings
- products, orders and returns
- follow-ups and offers

The agency admin panel lets you create clients, suspend or reactivate them, and switch features and channels on or off for each client.

The design is in `../docs/superpowers/specs/2026-11-01-client-automation-platform-design.md` and the build plan in `../docs/superpowers/plans/2026-11-01-client-automation-platform.md`.

> **Chat engine:** for now every client runs on the built-in **Demo engine**, which has sample Bangla chats. That means everything can be shown and tested before a real engine (for example UChat White-label) is connected in Phase 5. See `src/engine/types.ts` for the interface a real engine must implement.

## Stack

| Piece | Tech |
|---|---|
| API + web hosting | One Cloudflare Worker (Hono) that serves `/api/*`, `/p/*` (public product pages), `/media/*` (images) and the React app |
| Database | Cloudflare D1, with migrations in `migrations/` |
| Images, backups | Cloudflare R2 |
| Scheduled work | Cron every 5 min: engine retries, AI config pushes, follow-ups/broadcasts, purge of deleted clients, Sunday CSV backups |
| Web app | React 19 + Vite + Tailwind, Bangla/English |

## Local development

```bash
cd platform
npm install                       # uses .npmrc legacy-peer-deps
cp .dev.vars.example .dev.vars    # sets BOOTSTRAP_TOKEN for local use
npm run build                     # builds the web app into web/dist
npx wrangler d1 migrations apply northstar-platform --local
npm run dev                       # http://localhost:8787
```

Open `http://localhost:8787/bootstrap` once and enter the bootstrap token from `.dev.vars` to create the first agency admin. This only works while no users exist.

To work on the web app with hot reload, run `npx vite web` (port 5173, proxies `/api` to 8787) alongside `npm run dev`.

Try the AI order flow locally. The demo engine accepts the same events a real engine would send, so you can post one with curl (copy `tenant_id` from `/api/auth/me`, and `conversation_id` and `customer.ref` from `/api/inbox`):

```bash
curl -X POST localhost:8787/api/engine/demo/webhook -H "x-demo-secret: <BOOTSTRAP_TOKEN>" -H "content-type: application/json" \
  -d '{"type":"order.created","tenant_id":"…","conversation_id":"…","channel":"messenger","customer":{"name":"রহিম","ref":"…"},"items":[{"code":"KD9101","qty":1}]}'
```

Trigger the cron locally with `curl "http://localhost:8787/cdn-cgi/local/scheduled"`.

## Tests

```bash
npm test             # API tests (Vitest inside the Workers runtime, real local D1 + R2)
npm run typecheck    # worker types
npm run typecheck:web
npm run e2e          # Playwright: builds, starts a fresh local worker on :8788, runs the two main flows
```

## Deploying to Cloudflare (first time)

1. Authorize Wrangler: `npx wrangler login` (or set `CLOUDFLARE_API_TOKEN`).
2. Create the database and bucket:
   ```bash
   npx wrangler d1 create northstar-platform          # copy the database_id into wrangler.jsonc
   npx wrangler r2 bucket create northstar-platform-media
   ```
3. Set the bootstrap secret: `npx wrangler secret put BOOTSTRAP_TOKEN` (use a long random value).
4. Set `vars.APP_URL` in `wrangler.jsonc` to your real address (it's used in client setup links).
5. Apply migrations and deploy:
   ```bash
   npx wrangler d1 migrations apply northstar-platform --remote
   npm run deploy
   ```
6. Custom domain: in the Cloudflare dashboard go to Workers & Pages → northstar-platform → Settings → Domains & Routes → Add custom domain, e.g. `app.northstardizital.com`.
7. Visit `https://app.northstardizital.com/bootstrap` once to create the first admin, then delete or rotate the `BOOTSTRAP_TOKEN` secret if you like. The demo webhook also uses it.

## Everyday admin tasks

| Task | Where |
|---|---|
| Add a client | Admin → New client. Send the setup link (valid 72 h) by WhatsApp. |
| Payment overdue | Client page → Account switch off, with reason "payment due". The client is logged out immediately and their AI and follow-ups stop. No data is lost. |
| Change what a client gets | Client page → Feature / Channel switches, or set up Plan presets. |
| Client forgot password | Client page → Reset login (new setup link). |
| Something didn't reach the chat engine | Admin → Failed engine jobs → Retry. |
| Monthly invoicing | Clients list shows this month's AI replies, conversations, messages sent and orders. The client page shows 12 months. |
