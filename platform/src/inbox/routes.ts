import { Hono } from "hono";
import { z } from "zod";
import type { AppEnv, Channel, TenantContext } from "../env";
import { clientGroup } from "../auth/middleware";
import { loadProduct, productName } from "../catalog/service";
import { engineFor } from "../engine/registry";
import type { Conversation, OutboundMessage } from "../engine/types";
import { newId } from "../lib/crypto";
import { tenantDb, type TenantDb } from "../lib/db";
import { ApiError } from "../lib/errors";
import { addHours, nowIso } from "../lib/time";
import { parseBody } from "../lib/validate";
import { parseCustomer } from "../orders/customers";
import { loadOrder } from "../orders/service";
import { bumpUsage } from "../usage";

export const inboxRoutes = new Hono<AppEnv>();
inboxRoutes.use("*", ...clientGroup("inbox"));

type State = "open" | "later" | "done";
type Tab = "waiting" | "unread" | "open" | "later" | "done";

async function withState(tdb: TenantDb, convs: Conversation[], now = nowIso()) {
  const rows = await tdb.all<{ engine_conversation_id: string; state: State; snooze_until: string | null }>(
    "SELECT engine_conversation_id, state, snooze_until FROM conversation_state WHERE tenant_id=?1",
  );
  const map = new Map(rows.map((r) => [r.engine_conversation_id, r]));
  return convs.map((c) => {
    const s = map.get(c.id);
    let state: State = s?.state ?? c.state ?? "open";
    if (state === "later" && s?.snooze_until && s.snooze_until <= now) state = "open";
    return { ...c, state, snoozeUntil: state === "later" ? s?.snooze_until ?? null : null };
  });
}

const inTab = (c: { state: State; unread: number; lastFrom: string }, tab: Tab) => {
  switch (tab) {
    case "waiting": return c.state === "open" && c.lastFrom === "customer";
    case "unread": return c.state !== "done" && c.unread > 0;
    case "open": return c.state === "open";
    case "later": return c.state === "later";
    case "done": return c.state === "done";
  }
};

function allowedChannels(t: TenantContext, requested?: string): Channel[] {
  return requested ? t.channels.filter((c) => c === requested) : t.channels;
}

inboxRoutes.get("/", async (c) => {
  const t = c.var.tenant;
  const { engine, ref } = engineFor(c.env, t);
  const tdb = tenantDb(c.env.DB, t.id);
  const tab = (c.req.query("tab") ?? "open") as Tab;
  const handler = c.req.query("handler") as "ai" | "human" | undefined;
  const page = await engine.listConversations(ref, { channels: allowedChannels(t, c.req.query("channel")), handler: handler || undefined });
  const convs = await withState(tdb, page.items);
  const tabs: Tab[] = ["waiting", "unread", "open", "later", "done"];
  const counts = Object.fromEntries(tabs.map((k) => [k, convs.filter((x) => inTab(x, k)).length]));
  return c.json({ conversations: convs.filter((x) => inTab(x, tab)), counts });
});

async function customerPanel(tdb: TenantDb, customerRef: string) {
  const row = await tdb.first("SELECT * FROM customers WHERE tenant_id=?1 AND engine_contact_refs LIKE ?2", `%${JSON.stringify(customerRef)}%`);
  if (!row) return null;
  const orders = await tdb.all("SELECT id, number, status, total, created_at FROM orders WHERE tenant_id=?1 AND customer_id=?2 ORDER BY number DESC LIMIT 20", row.id);
  return { ...parseCustomer(row), orders };
}

async function ensureVisible(t: TenantContext, conv: Conversation) {
  if (!t.channels.includes(conv.channel)) throw new ApiError(404, "NOT_FOUND");
}

inboxRoutes.get("/:cid", async (c) => {
  const t = c.var.tenant;
  const { engine, ref } = engineFor(c.env, t);
  const tdb = tenantDb(c.env.DB, t.id);
  const conv = await engine.getConversation(ref, c.req.param("cid"));
  await ensureVisible(t, conv);
  const [withS] = await withState(tdb, [conv]);
  return c.json({ conversation: { ...conv, state: withS.state, snoozeUntil: withS.snoozeUntil }, customer: await customerPanel(tdb, conv.customerRef) });
});

inboxRoutes.post("/:cid/messages", async (c) => {
  const t = c.var.tenant;
  const { engine, ref } = engineFor(c.env, t);
  const tdb = tenantDb(c.env.DB, t.id);
  const body = await parseBody(c, z.union([
    z.object({ text: z.string().trim().min(1).max(4000) }),
    z.object({ product_id: z.string() }),
    z.object({ order_id: z.string() }),
  ]));
  const cid = c.req.param("cid");
  await ensureVisible(t, await engine.getConversation(ref, cid));
  let msg: OutboundMessage;
  if ("text" in body) msg = { kind: "text", text: body.text, by: "human" };
  else if ("product_id" in body) {
    const p = await loadProduct(tdb, body.product_id);
    if (!p) throw new ApiError(404, "NOT_FOUND");
    msg = { kind: "product", product: { code: p.code, name: productName(p), price: p.price, sale_price: p.sale_price, image_url: p.images[0]?.url ?? null, url: `/p/${t.slug}/${encodeURIComponent(p.code)}` } };
  } else {
    const o = await loadOrder(tdb, body.order_id);
    if (!o) throw new ApiError(404, "NOT_FOUND");
    msg = { kind: "receipt", order: { number: o.number, total: o.total, status: o.status, items: o.items.map((i) => ({ name: i.name_snapshot, qty: i.qty, unit_price: i.unit_price })), tracking: o.tracking_number, courier: o.courier } };
  }
  await engine.sendMessage(ref, cid, msg);
  await bumpUsage(c.env.DB, t.id, "outbound_messages");
  return c.json({ ok: true });
});

inboxRoutes.post("/:cid/handler", async (c) => {
  const t = c.var.tenant;
  const { engine, ref } = engineFor(c.env, t);
  const { handler } = await parseBody(c, z.object({ handler: z.enum(["ai", "human"]) }));
  const cid = c.req.param("cid");
  await ensureVisible(t, await engine.getConversation(ref, cid));
  await engine.setHandler(ref, cid, handler);
  return c.json({ conversation: await engine.getConversation(ref, cid) });
});

inboxRoutes.post("/:cid/state", async (c) => {
  const t = c.var.tenant;
  const { engine, ref } = engineFor(c.env, t);
  const body = await parseBody(c, z.object({ state: z.enum(["open", "later", "done"]), snooze_hours: z.number().positive().max(24 * 14).optional() }));
  const cid = c.req.param("cid");
  await ensureVisible(t, await engine.getConversation(ref, cid));
  const snooze = body.state === "later" ? addHours(nowIso(), body.snooze_hours ?? 3) : null;
  await c.env.DB.prepare(
    `INSERT INTO conversation_state (id, tenant_id, engine_conversation_id, state, snooze_until) VALUES (?1, ?2, ?3, ?4, ?5)
     ON CONFLICT (tenant_id, engine_conversation_id) DO UPDATE SET state=excluded.state, snooze_until=excluded.snooze_until`,
  ).bind(newId(), t.id, cid, body.state, snooze).run();
  return c.json({ state: body.state, snooze_until: snooze });
});

export const quickReplyRoutes = new Hono<AppEnv>();
quickReplyRoutes.use("*", ...clientGroup("inbox"));
const qr = z.object({ title: z.string().trim().min(1).max(80), body: z.string().trim().min(1).max(2000) });

quickReplyRoutes.get("/", async (c) =>
  c.json({ quick_replies: await tenantDb(c.env.DB, c.var.tenant.id).all("SELECT id, title, body FROM quick_replies WHERE tenant_id=?1 ORDER BY title") }));
quickReplyRoutes.post("/", async (c) => {
  const body = await parseBody(c, qr);
  const row = { id: newId(), ...body };
  await tenantDb(c.env.DB, c.var.tenant.id).insert("quick_replies", row);
  return c.json({ quick_reply: row });
});
quickReplyRoutes.put("/:id", async (c) => {
  const body = await parseBody(c, qr);
  if (!(await tenantDb(c.env.DB, c.var.tenant.id).update("quick_replies", c.req.param("id"), body))) throw new ApiError(404, "NOT_FOUND");
  return c.json({ quick_reply: { id: c.req.param("id"), ...body } });
});
quickReplyRoutes.delete("/:id", async (c) => {
  if (!(await tenantDb(c.env.DB, c.var.tenant.id).del("quick_replies", c.req.param("id")))) throw new ApiError(404, "NOT_FOUND");
  return c.json({ ok: true });
});
