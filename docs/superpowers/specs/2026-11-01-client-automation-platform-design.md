# Northstar Client Automation Platform — Design Spec

- **Date:** 2026-11-01
- **Status:** Draft, awaiting owner review
- **Owner:** Northstar Dizital Agency
- **Inspiration:** AiPraktor (one inbox for Messenger, Instagram, WhatsApp and website chat; an AI sales agent; orders and follow-ups in chat)

## 1. Purpose

A Northstar-branded web platform that the agency's clients (mainly Bangladeshi online shops selling through Facebook, Instagram and WhatsApp) use to automate customer chats and sales. The agency keeps full control over client accounts: it can create them, suspend or reactivate them, and turn individual features and channels on or off.

### Decisions made

| Topic | Decision |
|---|---|
| Delivery model | Own branded platform (not reselling another tool's UI) |
| Chat channels and AI engine | **Option B:** sit on top of an existing engine that Meta has already approved, because Northstar's Meta business is not verified yet. **Engine choice is deferred.** UChat White-label Partner is the leading candidate. |
| First release scope | Admin panel and access control, unified inbox, AI agent settings, products & orders, follow-ups & offers |
| Access control | Account on/off **plus** per-client feature and channel switches |
| Client logins | One owner login per client business (staff seats later) |
| Hosting | Cloudflare (Workers, D1, R2, Cron Triggers) |
| Billing | Manual invoicing outside the platform; the platform shows usage per client |

### Success criteria

1. The agency can create a client and send a setup link in under 2 minutes.
2. Suspending a client blocks their login immediately and pauses their engine workspace (AI replies and follow-ups stop) within 1 minute, or as soon as the engine can be reached.
3. A switched-off feature is blocked by the server, not just hidden in the menu.
4. No client can ever read or change another client's data (covered by automated tests).
5. The whole product can be demonstrated end to end with the Demo engine before any real engine is connected.

### Out of scope for the first release

Booking parcels directly with couriers, staff logins and roles, payment gateways or prepaid credits, product search from a photo or voice note, the real engine adapter (Phase 5), and Northstar's own Meta app integration.

## 2. Architecture

```
Browser (React SPA, bn/en)
        │  HTTPS, session cookie
        ▼
Cloudflare Worker  ── Hono API ──┬── D1 (all relational data, tenant-scoped)
  (serves SPA assets + /api/*)   ├── R2 (product images, CSV exports)
                                 ├── Cron Trigger (every 5 min: follow-ups, engine retry queue)
                                 └── ChatEngine adapter ──► DemoEngine (now) / UChatEngine (later)
```

- **Location:** a new `platform/` folder in this repository. The existing static agency site is not changed.
- **Deployment:** a single Worker serves both the static SPA (Workers static assets) and `/api/*`, at a subdomain such as `app.northstardizital.com`.
- **Frontend:** React + TypeScript + Vite, Tailwind CSS, and i18n with Bangla and English string files.
- **Backend:** TypeScript, the Hono router, and D1 accessed through plain prepared statements behind a tenant-scoped helper (`tenantDb`). This was changed from Drizzle during implementation because the helper is easier to audit for tenant isolation. Migrations are SQL files kept under `platform/migrations/`.
- **Storage:** R2 bucket `northstar-platform-media`, with keys prefixed `tenants/<tenant_id>/…`.

### 2.1 ChatEngine adapter

All chat, AI and channel work goes through one interface, so the engine can be replaced without touching the screens or business logic.

```ts
interface ChatEngine {
  createWorkspace(tenant): Promise<{ workspaceRef: string }>;
  pauseWorkspace(ref): Promise<void>;
  resumeWorkspace(ref): Promise<void>;
  setChannelEnabled(ref, channel, enabled): Promise<void>;
  setAiEnabled(ref, enabled): Promise<void>;
  pushAgentConfig(ref, config: AgentConfig): Promise<void>; // profile, tone, FAQs, rules, catalog summary
  listConversations(ref, filter): Promise<ConversationPage>;
  getConversation(ref, id): Promise<ConversationDetail>;
  sendMessage(ref, conversationId, message: OutboundMessage): Promise<void>;
  setHandler(ref, conversationId, handler: 'ai' | 'human'): Promise<void>;
  getUsage(ref, month): Promise<UsageCounts>;
  testChat(ref, messages): Promise<string>;
}
```

- `channel` is one of `messenger | instagram | whatsapp | website`.
- `OutboundMessage` can be text, a product card, or an order receipt.
- **DemoEngine:** stores seeded Bangla sample conversations in D1 tables prefixed `demo_`. It generates canned AI replies for the test chat and simulates new incoming chats. Used for demos and tests.
- **Engine webhooks:** `POST /api/engine/<engine>/webhook` takes incoming events (new message, order created by AI, unanswered question). Each engine verifies its own signature and maps events to internal events.
- **Engine per tenant:** `tenants.engine` stores which engine each tenant uses (`demo` by default), so tenants can be moved one at a time.

## 3. Data model (D1)

Every tenant-owned table has `tenant_id` and an index on it. Times are stored as UTC ISO strings and shown in Asia/Dhaka time. Money is stored as integer poisha.

| Table | Key columns |
|---|---|
| `users` | id, email (unique), password_hash (PBKDF2-SHA256, 100k iterations, per-user salt), role (`agency_admin` \| `client_owner`), tenant_id (null for agency), name, phone, last_login_at |
| `sessions` | id (random 256-bit), user_id, expires_at (30 days, sliding), created_at |
| `setup_tokens` | token_hash, user_id, expires_at (72 h), used_at |
| `tenants` | id, business_name, slug (for public product pages), status (`active` \| `suspended` \| `deleted`), suspended_reason, plan_label, engine, engine_workspace_ref, deleted_at, created_at |
| `tenant_features` | tenant_id, feature (`inbox` \| `ai_agent` \| `orders` \| `followups`), enabled |
| `tenant_channels` | tenant_id, channel, enabled |
| `plan_presets` | label, features JSON, channels JSON |
| `audit_log` | id, actor_user_id, tenant_id, action, details JSON, created_at |
| `engine_jobs` | id, tenant_id, command, payload JSON, attempts, next_attempt_at, status (`pending` \| `done` \| `failed`), last_error |
| `agent_config` | tenant_id, profile JSON, tone JSON, rules JSON, updated_at |
| `faqs` | id, tenant_id, question, answer |
| `unanswered_questions` | id, tenant_id, normalized_text, sample_text, count, last_asked_at, resolved_faq_id |
| `conversation_state` | tenant_id, engine_conversation_id, state (`open` \| `later` \| `done`), snooze_until (used only when the engine can't store this itself) |
| `quick_replies` | id, tenant_id, title, body |
| `products` | id, tenant_id, code (unique per tenant), name_bn, name_en, description, category, price, sale_price, status (`active` \| `hidden`) |
| `product_variants` | id, product_id, tenant_id, label (e.g. "L / Navy"), stock |
| `product_images` | id, product_id, tenant_id, r2_key, sort |
| `customers` | id, tenant_id, name, phones JSON, addresses JSON, tags JSON, engine_contact_refs JSON, total_orders, total_spent, last_order_at |
| `orders` | id, tenant_id, number (per tenant, starts at 1001), customer_id, source (`ai` \| `inbox` \| `manual`), status, subtotal, delivery_charge, discount, total, payment_method, payment_status, address, courier, tracking_number, notes, return_condition, timestamps per status |
| `order_items` | id, order_id, tenant_id, product_id, variant_id, name_snapshot, unit_price, qty |
| `followup_rules` | id, tenant_id, type (`price_no_order` \| `order_unconfirmed` \| `delivered_thanks` \| `win_back`), enabled, delay_minutes, message_template, offer_text, whatsapp_template_name |
| `followup_sends` | id, tenant_id, rule_id or broadcast_id, customer_id, channel, status (`scheduled` \| `sent` \| `skipped` \| `cancelled` \| `failed`), skip_reason, scheduled_for, sent_at |
| `broadcasts` | id, tenant_id, audience JSON, message, product_id, scheduled_for, status |
| `customer_last_inbound` | tenant_id, customer_id, channel, last_inbound_at (used for the 24-hour rule) |
| `usage_monthly` | tenant_id, month, ai_replies, conversations, outbound_messages, orders |

## 4. Authentication and access control

- **Login:** email and password, with an HttpOnly, Secure, SameSite=Lax session cookie. Login attempts are rate-limited per IP and per email (5 per 15 minutes).
- **Onboarding:** clients set their own password through a one-time setup link. Only a hash of the token is stored. Admins can generate a new link at any time ("Reset login").
- **Middleware order for every `/api/*` request:**
  1. Session is valid.
  2. Agency routes (`/api/admin/*`) need `agency_admin`.
  3. Client routes need `client_owner`, and `tenant_id` is taken from the session, never from the request.
  4. The tenant's status is `active`; otherwise respond 403 `ACCOUNT_SUSPENDED`.
  5. The route's required feature is enabled; otherwise respond 403 `FEATURE_DISABLED`.
- **Tenant scoping:** a data-access helper adds `tenant_id = ?` to every query on a tenant-owned table. Queries are never built without it, and tests check this for every table.
- **Effects of admin actions:**

| Action | Effect |
|---|---|
| Suspend | `status=suspended`; the client's sessions are deleted; `pauseWorkspace` is queued in `engine_jobs`; scheduled follow-ups are skipped. Data is kept. |
| Reactivate | `status=active`; `resumeWorkspace` is queued. |
| Feature off | The server blocks the feature's routes, the SPA hides its menu item, and the scheduler skips the tenant's follow-ups if `followups` is off. Turning `ai_agent` off queues `setAiEnabled(false)`. |
| Channel off | `setChannelEnabled(channel, false)` is queued. |
| Delete | Requires typing the business name. Sets `status=deleted` and `deleted_at`. Data is purged by cron 30 days later. |

- **Engine commands** are written to `engine_jobs` and tried right away. On failure they are retried by cron with backoff (1, 5, 15, 60 minutes, then hourly), and failures appear on the admin panel's "Failed engine jobs" list. Login blocking never depends on the engine.
- **Audit log:** every admin action, and every client change to settings, orders or broadcasts, is recorded.

## 5. Admin panel (agency)

1. **Clients list:** name, status, plan label, enabled features, this month's usage (AI replies, conversations, outbound messages, orders), last login. Search, and filter by status.
2. **Create client:** business name, owner name, email, phone, plan preset (sets the switches, each of which can then be changed). Creates the tenant, the owner user and the setup token, and queues `createWorkspace`. Shows the setup link with copy and "share via WhatsApp" buttons.
3. **Client detail:** account switch (with reason), feature switches, channel switches, plan label, usage by month, reset login, delete.
4. **Activity log:** filterable by client and by actor.
5. **Failed engine jobs:** list with a retry button.
6. **Plan presets:** create or edit labels such as Starter and Pro (feature and channel defaults only; no charging).

## 6. Client dashboard

The language switch (Bangla/English) is always visible. The menu only shows enabled features.

### 6.1 Home
Today's new chats, chats waiting for a reply, today's orders and AI replies, and alerts (unanswered questions, failed sends).

### 6.2 Unified inbox (`inbox`)
- **Conversation list** across enabled channels, each with a channel icon. Tabs: Waiting / Unread / Open / Done, with counts. Filters: channel, handler (AI/person), Later (snoozed).
- **Chat view:** message history including images, voice notes, product cards and order receipts. Actions: **Take over** (`setHandler human`), **Back to AI**, **Later** (1 h / 3 h / tomorrow), **Done**. Reply box with quick replies.
- **Customer panel:** details, tags, past orders, and **Create order** (opens a pre-filled order form).
- **Data:** read live from the engine through the adapter. Snooze and done state are stored by the engine if it supports them, otherwise locally in a `conversation_state` table (tenant_id, engine_conversation_id, state, snooze_until).

### 6.3 AI agent settings (`ai_agent`)
- **Business profile:** shop name, what's sold, delivery areas and charges, payment methods (cash on delivery, bKash, Nagad), return policy, opening hours.
- **Tone:** reply language (Bangla / English / match the customer), formality, and polite address terms (আপু/ভাইয়া).
- **FAQs** and **rules** (maximum discount, when to hand the chat to a human).
- **Unanswered questions:** grouped by normalized text, with count and date last asked. **Teach** turns one into an FAQ and marks it resolved.
- **Test chat** through `engine.testChat`.
- Any saved change, and any product change, triggers `pushAgentConfig` (debounced to at most once per minute per tenant).

## 7. Products, orders and returns (`orders`)

- **Products:** fields as in §3. Photos are uploaded to R2 through the Worker (max 5 MB, JPEG/PNG/WebP, max 8 per product). CSV import with a row-by-row error report. Hidden products are never sent to the engine.
- **Public product page:** `/p/<tenant-slug>/<product-code>` shows a server-rendered photo, price and a "message us to order" link. Only for active tenants and active products.
- **Orders:** created by the AI (engine webhook), from the inbox, or manually. Status flow: `new → confirmed → packed → shipped → delivered`, or `cancelled` from any state before shipped, or `returned` after shipped.
  - **Stock:** confirming takes stock off in one transaction and fails with `OUT_OF_STOCK` if any variant would go below zero. Cancelling a confirmed or packed order puts the stock back. A return with condition `good` puts the stock back.
  - **Courier:** chosen from a list (Steadfast, Pathao, RedX, Sundarban, Other) plus a tracking number, entered by hand.
  - **Customer updates:** on Confirmed and on Shipped, a receipt or tracking message is sent through the engine if the 24-hour rule allows. Each update can be turned on or off per tenant.
  - **Invoice/label:** printable HTML page.
- **Customers:** created or matched automatically by engine contact ID and phone number. Order totals are kept up to date as orders change.
- **Returns:** condition is one of `good` (back on the shelf), `in_transit` (on the way back), `damaged`, `unknown` (received, condition not noted). The returns report shows counts and percentages by condition and by product.
- **Reports:** sales by day and product, top products, status breakdown, return rate. Everything can be exported as CSV.

## 8. Follow-ups and offers (`followups`)

- **24-hour rule (enforced by the server):** on Messenger and Instagram, a message is only sent if the customer's last inbound message on that channel was less than 24 hours ago. On WhatsApp, messages outside 24 hours must use the rule's `whatsapp_template_name`. If no template is set, the send is skipped with reason `OUTSIDE_24H`.
- **Automatic follow-ups** (each can be switched on and edited):

  | Type | Trigger | Default delay |
  |---|---|---|
  | `price_no_order` | Product question with no order | 3 h |
  | `order_unconfirmed` | Order still `new` | 2 h |
  | `delivered_thanks` | Order marked `delivered` | 24 h (WhatsApp template) |
  | `win_back` | No order for 30 days | WhatsApp template |

  - Message templates can use `{name}`, `{product}`, `{order_number}` and `{offer}`.
  - Each rule sends at most once per customer per trigger.
  - A follow-up is cancelled if the customer replies or orders first.
- **Broadcasts:**
  - **Audience:** messaged in the last 24 h, tag, bought a product, or no order in N days.
  - **Content:** message plus an optional product card.
  - **Preview:** recipients by channel, and how many are excluded with the reason.
  - **Timing:** send now or schedule.
- **Scheduler:** cron runs every 5 minutes, takes due `followup_sends`, and skips (with a recorded reason) suspended tenants, tenants with the feature off, and sends that break the 24-hour rule. Sends go through the engine, with 3 tries before being marked `failed`.
- **Results:** for each rule and broadcast: sent, replied, orders within 3 days, and order value.
- **Usage:** each outbound message increases `usage_monthly.outbound_messages`.

## 9. Error handling

- **Engine calls:** 3 quick retries with backoff for actions the client is waiting on. Failure gives the user a plain bn/en message. Background work goes through `engine_jobs`, as described in §4.
- **API errors:** returned as `{ code, message_bn, message_en }`. Codes include `ACCOUNT_SUSPENDED`, `FEATURE_DISABLED`, `OUT_OF_STOCK`, `OUTSIDE_24H`, `VALIDATION`, `ENGINE_UNAVAILABLE`, `NOT_FOUND`. Stack traces are written to Worker logs only.
- **Validation:** Zod schemas, shared by the SPA and the API.
- **Backups:** D1 Time Travel (30 days), plus a weekly cron export of each tenant's data as CSV files in R2.

## 10. Testing

- **Unit and integration (Vitest with the Workers pool and a local D1):**
  - tenant isolation for every tenant-owned table
  - blocking of suspended tenants and switched-off features on every route group
  - stock changes on confirm, cancel and return
  - order numbering
  - 24-hour rule decisions
  - follow-up scheduling, cancellation and the once-only rule
  - engine job retry and backoff
- **DemoEngine** stands in as the engine for every test.
- **End-to-end (Playwright):**
  - admin creates a client → client sets a password → adds a product → a demo AI order arrives → client confirms and ships it → a follow-up is sent
  - admin suspends the client → the client is logged out and blocked → admin reactivates → the client can log in again

## 11. Build phases

| Phase | Deliverable |
|---|---|
| 1. Foundation + admin | Project setup, Cloudflare deploy, auth, tenants, feature and channel switches, suspend and reactivate, audit log, engine job queue, DemoEngine skeleton, bn/en |
| 2. Products & orders | Catalog, R2 images, CSV import, orders with status flow and stock, customers, returns, reports, public product pages |
| 3. Inbox + AI settings | Inbox screens on the DemoEngine, take over / back to AI / later / done, quick replies, agent settings, FAQs, rules, unanswered questions, test chat |
| 4. Follow-ups & offers | Follow-up rules, scheduler, 24-hour rule, broadcasts, results |
| 5. Real engine (deferred) | Adapter for the chosen engine (UChat is the candidate), webhooks, real channels, usage taken from the engine |

## 12. Open items (not blocking Phases 1–4)

1. **Engine choice and verification.** UChat White-label Partner ($199/month plus $10/month per client workspace) is the leading candidate. Before signing up, confirm with UChat that:
   - the partner API can create and suspend workspaces,
   - clients can connect Messenger, Instagram and WhatsApp through UChat's approved Meta app without their own business verification,
   - inbox conversations and AI settings are available through the API.
2. **Cloudflare account access.** The Cloudflare connector needs to be authorized, and a subdomain chosen (e.g. `app.northstardizital.com`).
3. **Long-term path.** Once Northstar's Meta business is verified, an in-house engine (Meta Graph API, WhatsApp Cloud API, Claude for AI replies) can be added as another `ChatEngine` and tenants moved over one at a time.
