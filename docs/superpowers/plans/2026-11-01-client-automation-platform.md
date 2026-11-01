# Northstar Client Automation Platform: Implementation Plan (Phases 1–4)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the multi-tenant client automation platform: the admin panel with access control, products and orders, an inbox and AI settings on a demo engine, and follow-ups and offers. Everything runs on Cloudflare.

**Architecture:** One Cloudflare Worker (Hono) serves `/api/*` and `/p/*`, and also the React SPA built into `platform/web/dist` as static assets. Data lives in D1 (plain prepared statements behind a tenant-scoped helper) and images in R2. A cron trigger runs every 5 minutes. All chat, AI and channel work goes through the `ChatEngine` interface, which `DemoEngine` implements for now.

**Tech Stack:** TypeScript 5, Hono 4, Zod 4, Wrangler 4, Vitest 4.1 with `@cloudflare/vitest-pool-workers`, React 19, Vite, Tailwind 4, React Router, Playwright (end-to-end).

**Spec:** `docs/superpowers/specs/2026-11-01-client-automation-platform-design.md`

**Deviation from the spec:** plain D1 statements instead of Drizzle ORM. The tenant-scoping helper is easier to audit and test without an ORM layer, and the spec is updated to match.

## Global Constraints

- All code lives under `platform/`. The existing static site files are not touched.
- Money is integer poisha. Times are stored as UTC ISO strings and shown in `Asia/Dhaka`.
- Every tenant-owned table has `tenant_id`. Client routes take `tenant_id` from the session only, never from the request.
- API errors look like `{ code, message_bn, message_en }`. Codes: `ACCOUNT_SUSPENDED`, `FEATURE_DISABLED`, `OUT_OF_STOCK`, `OUTSIDE_24H`, `VALIDATION`, `ENGINE_UNAVAILABLE`, `NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`, `RATE_LIMITED`.
- Passwords: PBKDF2-SHA256, 100,000 iterations, 16-byte salt per user. Sessions: random 256-bit ID, 30-day sliding expiry, cookie `ns_session` (HttpOnly, Secure, SameSite=Lax). Setup tokens expire after 72 h and only a SHA-256 hash is stored.
- Login rate limit: 5 attempts per 15 minutes, per IP and per email.
- Features: `inbox | ai_agent | orders | followups`. Channels: `messenger | instagram | whatsapp | website`.
- Order numbers per tenant start at 1001. Order statuses: `new, confirmed, packed, shipped, delivered, cancelled, returned`. Return conditions: `good | in_transit | damaged | unknown`.
- Images: at most 5 MB, JPEG/PNG/WebP only, at most 8 per product. R2 keys `tenants/<tenant_id>/…`.
- 24-hour rule: Messenger and Instagram may only send if the last inbound message on that channel was less than 24 h ago. WhatsApp after 24 h needs a template name, otherwise the send is skipped with `OUTSIDE_24H`.
- Engine job backoff: 1, 5, 15, 60 minutes, then hourly.
- Everything the user sees has Bangla and English text.

## Review Focus

1. **A suspended client's open browser tab:** the next API call must return 403 `ACCOUNT_SUSPENDED` and the SPA must show the "Account paused, contact Northstar" screen, not a blank page. *Test in Task 3 (middleware) and Task 6 (SPA handling of 403).*
2. **Two confirmations racing for the last item in stock:** exactly one succeeds and the other gets `OUT_OF_STOCK`. Use a conditional `UPDATE … WHERE stock >= ?` inside a `batch`. *Test in Task 8.*
3. **CSV import with a Bangla name, quoted commas, or a duplicate code:** good rows are imported and bad rows are reported with their line number. *Test in Task 7.*
4. **Turning a feature off while follow-ups are already scheduled:** the scheduler marks them `skipped` with reason `FEATURE_DISABLED` and sends nothing. *Test in Task 15.*
5. **Admin suspends a client while the engine is down:** the login is blocked straight away and the `pauseWorkspace` job stays `pending` with `attempts` going up. *Test in Task 4.*

---

## File Structure

```
platform/
  package.json, tsconfig.json, wrangler.jsonc, vitest.config.ts, README.md
  migrations/0001_init.sql            all tables from spec §3
  src/
    index.ts                          Hono app, route mounting, scheduled() handler
    env.ts                            Env bindings type
    lib/errors.ts                     ApiError, error codes, bn/en messages, onError handler
    lib/crypto.ts                     hashPassword, verifyPassword, randomToken, sha256Hex
    lib/db.ts                         tenantDb(), TENANT_TABLES
    lib/validate.ts                   zod helpers (parse body or throw VALIDATION)
    lib/csv.ts                        parseCsv, toCsv
    lib/time.ts                       nowIso, addMinutes, monthKey
    auth/sessions.ts                  createSession, getSession, destroyUserSessions
    auth/middleware.ts                requireAuth, requireAgency, requireClient, requireFeature
    auth/routes.ts                    /api/auth/*
    auth/ratelimit.ts                 checkLoginRate
    engine/types.ts                   ChatEngine interface and DTOs
    engine/demo.ts                    DemoEngine
    engine/registry.ts                getEngine(env, tenant)
    engine/jobs.ts                    enqueueEngineJob, runDueEngineJobs
    admin/routes.ts                   /api/admin/*
    admin/audit.ts                    audit()
    catalog/routes.ts                 /api/products/*
    catalog/images.ts                 R2 upload and serve
    orders/routes.ts, orders/service.ts, orders/customers.ts
    reports/routes.ts                 /api/reports/*, CSV exports
    public/routes.ts                  /p/:slug/:code, /api/orders/:id/invoice
    inbox/routes.ts                   /api/inbox/*, quick replies
    agent/routes.ts, agent/push.ts    /api/agent/*, debounced pushAgentConfig
    engine/webhook.ts                 /api/engine/:engine/webhook
    followups/rule24h.ts, followups/routes.ts, followups/scheduler.ts, followups/broadcasts.ts
    usage.ts                          bumpUsage()
    maintenance.ts                    purge of deleted tenants, weekly backup export
  test/
    setup.ts                          applyD1Migrations, helpers: makeAgency(), makeClient(), login()
    *.test.ts                         one file per task area
  web/
    index.html, vite.config.ts, src/main.tsx, src/api.ts, src/i18n/{bn,en}.ts, src/i18n.tsx
    src/auth/*, src/admin/*, src/client/{home,inbox,agent,products,orders,customers,reports,followups}/*
  e2e/flows.spec.ts, playwright.config.ts
```

---

## Phase 1: Foundation and admin

### Task 1: Scaffold, schema and test harness

**Files:** Create `platform/package.json`, `tsconfig.json`, `wrangler.jsonc`, `vitest.config.ts`, `migrations/0001_init.sql`, `src/index.ts`, `src/env.ts`, `src/lib/errors.ts`, `test/setup.ts`, `test/health.test.ts`.

**Interfaces:**
- Produces: `Env { DB: D1Database; MEDIA: R2Bucket; ASSETS: Fetcher; BOOTSTRAP_TOKEN: string; APP_URL: string }`.
- Produces: `class ApiError(status: number, code: ErrorCode, extra?)`; `errorHandler` returns `{code,message_bn,message_en}`.
- Produces: `app: Hono<{Bindings: Env; Variables: Vars}>`.
- Produces: `wrangler.jsonc` with D1 `DB`, R2 `MEDIA`, assets dir `./web/dist` with `not_found_handling: "single-page-application"`, `run_worker_first: ["/api/*", "/p/*"]`, and cron `*/5 * * * *`.

- [ ] Step 1: Write `test/health.test.ts`. `GET /api/health` → 200 `{ok:true}`. `GET /api/nope` → 404 with `code:"NOT_FOUND"` and both message fields present.
- [ ] Step 2: Run `npm test`. Expected: FAIL.
- [ ] Step 3: Write the schema in `0001_init.sql` (every table in spec §3, plus `login_attempts(key, at)` and `tenant_counters(tenant_id, next_order_number)`). Write the app with a health route, `notFound` and `onError`. The test setup applies migrations through `applyD1Migrations`.
- [ ] Step 4: Run `npm test`. Expected: PASS.
- [ ] Step 5: Commit `feat(platform): scaffold worker, schema, test harness`.

### Task 2: Crypto, sessions, auth routes, bootstrap

**Files:** Create `src/lib/crypto.ts`, `src/auth/sessions.ts`, `src/auth/ratelimit.ts`, `src/auth/routes.ts`, `test/auth.test.ts`.

**Interfaces:**
- Produces: `hashPassword(pw): Promise<string>`, stored as `pbkdf2$100000$<saltB64>$<hashB64>`.
- Produces: `verifyPassword(pw, stored): Promise<boolean>`, `randomToken(bytes=32): string` (base64url), `sha256Hex(s): Promise<string>`.
- Produces: `createSession(db, userId): Promise<string>`, `getSession(db, id): Promise<SessionUser|null>` (slides the expiry), `destroyUserSessions(db, userId)`.
- Produces: `SessionUser { id, email, name, role: 'agency_admin'|'client_owner', tenantId: string|null }`.
- Routes:
  - `POST /api/auth/bootstrap {token, email, name, password}`: works only when the users table is empty and the token equals `BOOTSTRAP_TOKEN`.
  - `POST /api/auth/login {email, password}`
  - `POST /api/auth/logout`
  - `GET /api/auth/me` → `{user, tenant?: {id, business_name, status, features: string[], channels: string[]}}`
  - `POST /api/auth/setup {token, password}`: password at least 8 characters.

- [ ] Step 1: Tests:
  - hash then verify gives true; a wrong password gives false
  - bootstrap with the wrong token → 403; bootstrap twice → second call 403
  - login sets the `ns_session` cookie; `me` returns the user
  - wrong password → 401 `UNAUTHORIZED`; the 6th failed attempt in 15 minutes → 429 `RATE_LIMITED`
  - setup token: works once; reusing it → 400; an expired token (73 h old) → 400
- [ ] Step 2: Run. Expected: FAIL.
- [ ] Step 3: Implement with WebCrypto `deriveBits` (PBKDF2).
- [ ] Step 4: Run. Expected: PASS.
- [ ] Step 5: Commit `feat(platform): auth, sessions, bootstrap`.

### Task 3: Middleware, tenant-scoped DB, isolation

**Files:** Create `src/auth/middleware.ts`, `src/lib/db.ts`, `src/lib/validate.ts`, `test/access.test.ts`.

**Interfaces:**
- Produces: `requireAuth` (sets `c.var.user`), `requireAgency`, and `requireClient`. `requireClient` loads the tenant into `c.var.tenant`; a suspended tenant → 403 `ACCOUNT_SUSPENDED`, a deleted one → 401.
- Produces: `requireFeature(f: Feature)`, which returns 403 `FEATURE_DISABLED`.
- Produces: `tenantDb(db, tenantId)` → `{ all<T>(sql, ...binds), first<T>(sql, ...binds), run(sql, ...binds), insert(table, row), update(table, id, patch), get(table, id), del(table, id) }`.
  - `insert` adds `tenant_id` automatically. `update`, `get` and `del` add `AND tenant_id=?`.
  - Raw `all`, `first` and `run` throw if the SQL lacks a `tenant_id` reference.
- Produces: `TENANT_TABLES: string[]`, `parseBody(c, schema)`.

- [ ] Step 1: Tests:
  - a client calling `/api/admin/*` → 403 `FORBIDDEN`
  - a suspended tenant's session on any client route → 403 `ACCOUNT_SUSPENDED` (Review Focus 1)
  - a feature switched off → 403 `FEATURE_DISABLED`
  - `tenantDb(A).get('products', idOfB)` returns null for every table in `TENANT_TABLES` (seed one row of B per table)
  - raw `all('SELECT * FROM products')` throws
- [ ] Step 2: Run. Expected: FAIL.
- [ ] Step 3: Implement. Add `GET /api/client/ping` (client, no feature needed) and `GET /api/test/feature/:f` (test-only, mounted when `env.TEST === "1"`) to exercise the gates.
- [ ] Step 4: Run. Expected: PASS.
- [ ] Step 5: Commit `feat(platform): access middleware and tenant isolation`.

### Task 4: ChatEngine, DemoEngine, engine job queue

**Files:** Create `src/engine/types.ts`, `src/engine/demo.ts`, `src/engine/registry.ts`, `src/engine/jobs.ts`, `test/engine.test.ts`.

**Interfaces:**
- Produces: the `ChatEngine` interface exactly as in spec §2.1.
  - `Conversation {id, channel, customerName, customerRef, lastMessage, lastAt, unread, handler, state}`
  - `Message {id, direction: 'in'|'out', kind: 'text'|'image'|'voice'|'product'|'receipt', text?, url?, payload?, at, by: 'customer'|'ai'|'human'}`
- Produces: `DemoEngine(env)`, backed by tables `demo_workspaces`, `demo_conversations`, `demo_messages` (migration `0002_demo.sql`).
  - `createWorkspace` seeds 6 Bangla conversations across 4 channels.
  - `testChat` answers from the pushed FAQs (match by keyword), otherwise `"দুঃখিত, এটা আমি জানি না — একজন মানুষ শীঘ্রই উত্তর দেবেন।"`.
  - Has a `failNext` flag for tests.
- Produces: `getEngine(env, tenant): ChatEngine`.
- Produces: `enqueueEngineJob(env, tenantId, command, payload)`, which tries straight away and schedules a retry on failure.
- Produces: `runDueEngineJobs(env, now)`. Backoff is `[1, 5, 15, 60]` minutes, then 60. After 10 attempts the status becomes `failed`.

- [ ] Step 1: Tests:
  - `createWorkspace` gives 6 conversations
  - `pauseWorkspace` makes `testChat` throw `ENGINE_UNAVAILABLE`
  - with the engine failing, the job is `pending`, attempts=1 and `next_attempt_at` is now+1 min; after the engine recovers, `runDueEngineJobs` gives `done` (Review Focus 5)
  - 10 failures → `failed`
- [ ] Step 2: Run. Expected: FAIL.
- [ ] Step 3: Implement.
- [ ] Step 4: Run. Expected: PASS.
- [ ] Step 5: Commit `feat(platform): chat engine adapter, demo engine, job queue`.

### Task 5: Admin API

**Files:** Create `src/admin/routes.ts`, `src/admin/audit.ts`, `src/usage.ts`, `test/admin.test.ts`.

**Interfaces:**
- Consumes: Tasks 2–4.
- Produces: `audit(db, actorId, tenantId|null, action, details)`, `bumpUsage(db, tenantId, field, n=1)`.
- Routes (all `requireAgency`):
  - `GET /api/admin/clients?q=&status=` → list with features, `usage` for the current month and `last_login_at`
  - `POST /api/admin/clients {business_name, owner_name, email, phone, plan_label}` → `{client, setup_url}`. Creates the tenant, a unique slug, the owner, a setup token, switches from the preset (default: all on) and the `tenant_counters` row; queues `createWorkspace`.
  - `GET /api/admin/clients/:id`
  - `PATCH /api/admin/clients/:id {plan_label?, business_name?}`
  - `POST /api/admin/clients/:id/suspend {reason?}` and `/reactivate`
  - `PUT /api/admin/clients/:id/features/:feature {enabled}` and `.../channels/:channel {enabled}`
  - `POST /api/admin/clients/:id/reset-login` → `{setup_url}`
  - `DELETE /api/admin/clients/:id {confirm_name}`
  - `GET /api/admin/audit?tenant_id=&actor=`
  - `GET /api/admin/engine-jobs?status=failed`, `POST /api/admin/engine-jobs/:id/retry`
  - `GET/POST/PUT/DELETE /api/admin/presets`
- Side effects follow spec §4's table.

- [ ] Step 1: Tests:
  - creating a client returns a setup URL, and the owner can finish setup and log in
  - suspend: the client's session gets 403, the client gets 403 on new login, `pauseWorkspace` is queued and an audit row is written
  - reactivate brings back access
  - turning `ai_agent` off queues `setAiEnabled(false)`; turning a channel off queues `setChannelEnabled`
  - delete with the wrong name → 400; the right name → status `deleted`
  - presets apply their switches
- [ ] Step 2: Run. Expected: FAIL.
- [ ] Step 3: Implement.
- [ ] Step 4: Run. Expected: PASS.
- [ ] Step 5: Commit `feat(platform): admin API for clients and access control`.

### Task 6: SPA foundation, auth screens, admin screens

**Files:** Create `platform/web/*` (Vite + React + Tailwind + React Router), `src/api.ts`, `src/i18n.tsx`, `src/i18n/bn.ts`, `src/i18n/en.ts`, `src/auth/{Login,Setup,Bootstrap,Paused}.tsx`, `src/admin/{Layout,Clients,ClientNew,ClientDetail,Audit,EngineJobs,Presets}.tsx`, `src/ui/*` (Button, Input, Toggle, Table, Badge, Card, Modal).

**Interfaces:**
- Consumes: the Task 2 and Task 5 routes.
- Produces: `api<T>(path, opts): Promise<T>`, which throws `ApiError {code, message}` using the current language. A global handler sends `ACCOUNT_SUSPENDED` to `/paused` and `UNAUTHORIZED` to `/login`.
- Produces: `useT()` → `t(key)`, with a language switch saved in localStorage (default `bn`).
- Produces: `useMe()`.
- Routes: `/login`, `/setup/:token`, `/bootstrap`, `/paused`, `/admin/*`, `/app/*` (the client shell; its menu only shows enabled features).

- [ ] Step 1: Build each screen to the spec §5 list. ClientNew shows the setup link with Copy and WhatsApp-share (`https://wa.me/?text=`) buttons. ClientDetail has the account toggle plus a reason prompt, the feature and channel toggles, usage, reset login, and delete with name confirmation.
- [ ] Step 2: `npm run build` (tsc + vite). Expected: success with no type errors.
- [ ] Step 3: Commit `feat(platform): SPA foundation and admin screens`.

## Phase 2: Products and orders

### Task 7: Products API, images, CSV import

**Files:** Create `src/catalog/routes.ts`, `src/catalog/images.ts`, `src/lib/csv.ts`, `test/catalog.test.ts`.

**Interfaces:**
- Produces: `parseCsv(text): string[][]` (RFC 4180, quotes, UTF-8 BOM stripped), `toCsv(rows): string` (adds a BOM so Excel shows Bangla).
- Routes (client + `orders` feature):
  - `GET/POST /api/products`; `GET/PATCH/DELETE /api/products/:id`. The body includes `variants: [{id?, label, stock}]`.
  - `POST /api/products/:id/images` (multipart `file`); `DELETE /api/products/:id/images/:imageId`
  - `GET /media/:key+` serves R2 objects for active tenants only. It is mounted under `run_worker_first`, so add `/media/*` there.
  - `POST /api/products/import` (CSV columns `code,name_bn,name_en,category,price,sale_price,variant,stock,description`) → `{imported, errors: [{line, message}]}`. Rows with the same code become variants of one product.
- Prices in the API are poisha integers. CSV prices are taka decimals and are converted.

- [ ] Step 1: Tests:
  - CRUD with variants
  - duplicate code → `VALIDATION`
  - a 9th image → 400; a 6 MB file → 400; a GIF → 400
  - CSV with `"Navy, Kids"` quoted, a Bangla name and one duplicate-in-database row → 2 imported, 1 error on line 4 (Review Focus 3)
  - tenant B can't read A's product
- [ ] Step 2: Run. Expected: FAIL.
- [ ] Step 3: Implement.
- [ ] Step 4: Run. Expected: PASS.
- [ ] Step 5: Commit `feat(platform): products, images, CSV import`.

### Task 8: Orders, customers, stock, returns

**Files:** Create `src/orders/service.ts`, `src/orders/customers.ts`, `src/orders/routes.ts`, `test/orders.test.ts`.

**Interfaces:**
- Produces: `createOrder(env, tenantId, input: {customer: {id?, name, phone, address}, items: [{variant_id, qty}], delivery_charge, discount, payment_method, notes, source}): Promise<Order>`. Takes the next number from `tenant_counters`, snapshots names and prices, and upserts the customer by phone.
- Produces: `changeStatus(env, tenantId, orderId, to, opts?: {courier?, tracking_number?, return_condition?}): Promise<Order>`.
  - Allowed moves: new→confirmed|cancelled; confirmed→packed|cancelled; packed→shipped|cancelled; shipped→delivered|returned; delivered→returned.
  - Confirming takes stock off with conditional updates in one `batch`; if any `meta.changes === 0`, the decrements are rolled back and `OUT_OF_STOCK` is thrown.
  - Cancelling from confirmed or packed restocks; returning with `good` restocks.
  - Customer totals are updated on delivered, cancelled and returned.
  - Fires the `onOrderEvent` hook (Tasks 11 and 14 attach notifications and follow-ups here).
- Produces: `upsertCustomer(db, tenantId, {name, phone, address, engineRef?})`.
- Routes (`orders` feature):
  - `GET /api/orders?status=&q=&from=&to=`, `POST /api/orders`, `GET /api/orders/:id`, `POST /api/orders/:id/status`
  - `PUT /api/orders/settings/notifications {on_confirmed, on_shipped}`
  - `GET /api/customers?q=&tag=`, `GET/PATCH /api/customers/:id` (tags)

- [ ] Step 1: Tests:
  - numbers 1001, 1002 per tenant, and tenant B starts at 1001 too
  - an invalid move (new→shipped) → `VALIDATION`
  - confirm reduces stock; cancel restores it
  - two confirmations for the last unit, one after the other → the second gives `OUT_OF_STOCK` and its order stays `new` (Review Focus 2)
  - return `good` restocks; `damaged` doesn't
  - the customer is matched by phone across two orders
- [ ] Step 2: Run. Expected: FAIL.
- [ ] Step 3: Implement.
- [ ] Step 4: Run. Expected: PASS.
- [ ] Step 5: Commit `feat(platform): orders, stock, customers, returns`.

### Task 9: Reports, CSV export, public product page, invoice

**Files:** Create `src/reports/routes.ts`, `src/public/routes.ts`, `test/reports.test.ts`.

**Interfaces:**
- Routes (`orders` feature):
  - `GET /api/reports/summary?from=&to=` → `{sales_by_day:[{day,total,orders}], top_products:[{name,qty,total}], status_counts:{}, return_rate}`
  - `GET /api/reports/returns` → `{by_condition:[{condition,count,pct}], by_product:[…]}`
  - `GET /api/reports/:kind.csv` for kind in `orders|products|customers|returns`
  - `GET /api/orders/:id/invoice` → printable HTML
- `GET /p/:slug/:code` → server-rendered HTML (photo, name, price, sale price, "message us to order"). 404 if the tenant or product isn't active.

- [ ] Step 1: Tests:
  - summary totals match the seeded orders
  - returns percentages add up to 100
  - `orders.csv` starts with a BOM and has a header row
  - a public page for a hidden product → 404; for a suspended tenant → 404; for an active one → 200 containing the price `৳1,250`
- [ ] Step 2: Run. Expected: FAIL.
- [ ] Step 3: Implement.
- [ ] Step 4: Run. Expected: PASS.
- [ ] Step 5: Commit `feat(platform): reports, exports, public product pages`.

### Task 10: Client screens for products, orders, customers, returns and reports

**Files:** Create `web/src/client/{Layout,products/*,orders/*,customers/*,reports/*}.tsx`.

- [ ] Step 1:
  - Product list and form: variants editor, image upload, CSV import with the error table.
  - Order list: status tabs and filters. Order detail: status buttons for allowed moves only, courier and tracking prompt, return-condition prompt, invoice link. New-order form: product/variant picker, customer, live totals.
  - Customers: list and detail with tag editing.
  - Reports: sales chart (simple SVG bars), top products, returns report, CSV download buttons.
- [ ] Step 2: `npm run build`. Expected: success.
- [ ] Step 3: Commit `feat(platform): client commerce screens`.

## Phase 3: Inbox and AI settings

### Task 11: Inbox API, quick replies, engine webhook

**Files:** Create `src/inbox/routes.ts`, `src/engine/webhook.ts`, `test/inbox.test.ts`.

**Interfaces:**
- Consumes: `getEngine`, `createOrder`, `upsertCustomer`.
- Routes (`inbox` feature):
  - `GET /api/inbox?tab=waiting|unread|open|done&channel=&handler=` → conversations from the engine, channels limited to the tenant's enabled channels, state merged from `conversation_state`, `counts` per tab
  - `GET /api/inbox/:cid`
  - `POST /api/inbox/:cid/messages {text}|{product_id}|{order_id}`
  - `POST /api/inbox/:cid/handler {handler}`
  - `POST /api/inbox/:cid/state {state, snooze_hours?}`
  - CRUD `/api/quick-replies`
- `POST /api/engine/demo/webhook` (demo signature: header `x-demo-secret` equal to `BOOTSTRAP_TOKEN`). Events:
  - `message.in {tenant_id, conversation_id, channel, customer}`: updates `customer_last_inbound`, cancels pending follow-ups for that customer (Task 15 hook) and counts a conversation in usage
  - `ai.reply`: counts usage `ai_replies`
  - `order.created {items, customer}`: `createOrder` with source `ai`
  - `question.unanswered {text}`: upserts into `unanswered_questions` by normalized text (lowercase, whitespace collapsed, punctuation stripped), increases `count`
- Order notifications: an `onOrderEvent` hook sends the receipt on confirmed and tracking on shipped through the engine, if the setting is on and `rule24h` allows (uses Task 14's `canSend`). Otherwise the send is skipped silently.

- [ ] Step 1: Tests:
  - the list hides channels that are switched off
  - the done tab shows only done chats; snoozed chats come back after `snooze_until`
  - sending a message adds it to the demo conversation
  - handler change is reflected
  - the webhook `order.created` makes order #1001 with source `ai`
  - two unanswered questions differing only in case and punctuation → one row with count 2
  - a webhook with the wrong secret → 401
- [ ] Step 2: Run. Expected: FAIL.
- [ ] Step 3: Implement.
- [ ] Step 4: Run. Expected: PASS.
- [ ] Step 5: Commit `feat(platform): inbox API and engine webhook`.

### Task 12: AI agent settings API

**Files:** Create `src/agent/routes.ts`, `src/agent/push.ts`, `test/agent.test.ts`.

**Interfaces:**
- Produces: `schedulePush(env, tenantId)`, which sets `agent_config.push_due_at = now+1min` if not already set. `runDuePushes(env, now)` builds the `AgentConfig {profile, tone, faqs, rules, catalog: [{code, name, price, sale_price, variants:[{label, stock}]}]}` from active products only and calls `pushAgentConfig`. It is called from cron and once at the end of each request that changed something.
- Routes (`ai_agent` feature):
  - `GET/PUT /api/agent/config {profile, tone, rules}`
  - CRUD `/api/agent/faqs`
  - `GET /api/agent/unanswered`
  - `POST /api/agent/unanswered/:id/teach {answer}`: creates an FAQ and sets `resolved_faq_id`
  - `POST /api/agent/test-chat {messages}`
- Product changes (Task 7) call `schedulePush`.

- [ ] Step 1: Tests:
  - saving the config twice within a minute → one push
  - the pushed catalog leaves out hidden products
  - teach creates an FAQ and the question drops off the unresolved list
  - after teaching "ডেলিভারি চার্জ কত?", test-chat answers with the taught answer
- [ ] Step 2: Run. Expected: FAIL.
- [ ] Step 3: Implement.
- [ ] Step 4: Run. Expected: PASS.
- [ ] Step 5: Commit `feat(platform): AI agent settings and config push`.

### Task 13: Client home, inbox and AI settings screens

**Files:** Create `web/src/client/{home,inbox,agent}/*.tsx` and a home stats route `GET /api/client/home` (in `src/inbox/routes.ts`, no feature gate; returns only the stats for enabled features).

- [ ] Step 1:
  - Home: stat cards and alerts.
  - Inbox: three panes (list with tabs, counts and filters; chat with Take over / Back to AI / Later / Done and a reply box with quick replies and a product-card picker; customer panel with past orders and a "Create order" button that pre-fills the order form).
  - AI settings: tabs for Profile / Tone / FAQs / Rules / Unanswered (Teach) / Test chat.
  - The inbox polls the list every 15 s.
- [ ] Step 2: `npm run build`. Expected: success.
- [ ] Step 3: Commit `feat(platform): inbox and AI settings screens`.

## Phase 4: Follow-ups and offers

### Task 14: 24-hour rule and follow-up rules

**Files:** Create `src/followups/rule24h.ts`, `src/followups/routes.ts`, `test/followups.test.ts`.

**Interfaces:**
- Produces: `canSend({channel, lastInboundAt, now, whatsappTemplate?}): {ok: true, viaTemplate: boolean} | {ok: false, reason: 'OUTSIDE_24H'}`.
- Produces: `renderTemplate(tpl, vars)`, which replaces `{name}`, `{product}`, `{order_number}` and `{offer}`.
- Produces: `scheduleFollowup(env, tenantId, type, customerId, context)`. It adds a `followup_sends` row with status `scheduled` at now+delay, using the dedup key `type:customerId:contextId`, so a second call for the same trigger does nothing.
- Produces: `cancelPendingForCustomer(db, tenantId, customerId)`.
- Default rules are seeded on tenant creation, all disabled: price_no_order 180 min, order_unconfirmed 120 min, delivered_thanks 1440 min, win_back 43200 min.
- Routes (`followups` feature): `GET /api/followups/rules`, `PUT /api/followups/rules/:id {enabled, delay_minutes, message_template, offer_text, whatsapp_template_name}`.
- Hooks:
  - `order.created` with status new → schedules `order_unconfirmed`
  - confirmation → cancels it
  - delivered → schedules `delivered_thanks`
  - webhook `message.in` carrying `intent: "product_question"` → schedules `price_no_order`
  - any new order → cancels the `price_no_order` follow-ups for that customer

- [ ] Step 1: Tests:
  - `canSend` messenger at 23h59m → ok; at 24h01m → OUTSIDE_24H
  - WhatsApp at 30h with a template → ok, viaTemplate; without one → OUTSIDE_24H
  - scheduling the same trigger twice → one row
  - the customer orders → the pending `price_no_order` is cancelled
  - the template renders all variables
- [ ] Step 2: Run. Expected: FAIL.
- [ ] Step 3: Implement.
- [ ] Step 4: Run. Expected: PASS.
- [ ] Step 5: Commit `feat(platform): 24h rule and follow-up rules`.

### Task 15: Scheduler, broadcasts, results, maintenance cron

**Files:** Create `src/followups/scheduler.ts`, `src/followups/broadcasts.ts`, `src/maintenance.ts`, `test/scheduler.test.ts`.

**Interfaces:**
- Produces: `runScheduler(env, now)`. For due `scheduled` sends it skips with a reason in these cases: `ACCOUNT_SUSPENDED`, `FEATURE_DISABLED`, `RULE_DISABLED`, `CHANNEL_DISABLED`, `OUTSIDE_24H`. Otherwise it sends through the engine (3 tries, then `failed`), bumps `outbound_messages` and sets `sent_at`. It also handles broadcasts that are due.
- Produces: `scheduled(event, env)` in `index.ts`, which calls `runDueEngineJobs`, `runDuePushes`, `runScheduler` and `runMaintenance`. Purge runs once a day: tenants with `deleted_at` older than 30 days and their R2 objects. Backup runs on Sundays: each tenant's CSVs go to `backups/<date>/<tenant>/…`.
- Routes (`followups` feature):
  - `POST /api/broadcasts/preview {audience}` → `{by_channel:{}, excluded:[{reason,count}]}`. Audience is `{type: 'recent24h'|'tag'|'bought_product'|'inactive_days', value?}`.
  - `POST /api/broadcasts {audience, message, product_id?, scheduled_for?}`
  - `GET /api/broadcasts`
  - `GET /api/followups/results` → for each rule and broadcast: `{sent, replied, orders, order_value}`. Replied means an inbound after `sent_at`; orders means orders by that customer within 3 days of `sent_at`.

- [ ] Step 1: Tests:
  - a due send for a suspended tenant → skipped `ACCOUNT_SUSPENDED`
  - feature switched off after scheduling → skipped `FEATURE_DISABLED` (Review Focus 4)
  - Messenger past 24 h → skipped `OUTSIDE_24H`
  - a good send → `sent`, and the demo conversation has the message, and usage is +1
  - broadcast preview excludes customers who are out of the window
  - results count an order placed 2 days after sending
  - purge removes a tenant deleted 31 days ago and keeps one deleted 29 days ago
- [ ] Step 2: Run. Expected: FAIL.
- [ ] Step 3: Implement.
- [ ] Step 4: Run. Expected: PASS.
- [ ] Step 5: Commit `feat(platform): scheduler, broadcasts, maintenance cron`.

### Task 16: Follow-up screens, end-to-end tests, deploy docs

**Files:** Create `web/src/client/followups/*.tsx`, `e2e/flows.spec.ts`, `playwright.config.ts`, `platform/README.md`. Modify the spec (the Drizzle deviation).

- [ ] Step 1: Screens:
  - Follow-up rules: toggle, delay, message with a variable helper, offer, WhatsApp template name, and a warning badge explaining the 24-hour rule.
  - Broadcasts: wizard covering audience → message → preview with exclusions → send or schedule.
  - Results table.
- [ ] Step 2: Playwright against `wrangler dev` (local D1 with migrations applied), with two flows from spec §10:
  1. bootstrap → admin creates a client → client sets a password → adds a product → a demo webhook order arrives → client confirms and ships it
  2. admin suspends → the client's next action shows the Paused page → admin reactivates → the client logs in
- [ ] Step 3: Run `npm run e2e`. Expected: 2 passed.
- [ ] Step 4: README: local dev, `wrangler d1 create`, `r2 bucket create`, migrations, secrets (`BOOTSTRAP_TOKEN`), deploy, custom domain, first admin bootstrap.
- [ ] Step 5: Commit `feat(platform): follow-up screens, e2e, deploy docs`.
