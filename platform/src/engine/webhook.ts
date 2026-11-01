import { Hono } from "hono";
import { z } from "zod";
import type { AppEnv, TenantRow } from "../env";
import { newId } from "../lib/crypto";
import { tenantDb } from "../lib/db";
import { ApiError } from "../lib/errors";
import { nowIso } from "../lib/time";
import { parseBody } from "../lib/validate";
import { upsertCustomer } from "../orders/customers";
import { createOrder } from "../orders/service";
import { bumpUsage } from "../usage";
import { DemoEngine } from "./demo";
import { fireInbound } from "./events";

export const webhookRoutes = new Hono<AppEnv>();

export const normalizeQuestion = (s: string) => s.toLowerCase().replace(/[\p{P}\p{S}]/gu, " ").replace(/\s+/g, " ").trim();

const customer = z.object({ name: z.string().max(120).default(""), ref: z.string().max(200), phone: z.string().max(30).nullish(), address: z.string().max(500).nullish() });
const event = z.discriminatedUnion("type", [
  z.object({ type: z.literal("message.in"), tenant_id: z.string(), conversation_id: z.string(), channel: z.string(), customer, text: z.string().max(4000).optional(), intent: z.string().max(60).optional(), product_code: z.string().max(40).optional(), new_conversation: z.boolean().optional() }),
  z.object({ type: z.literal("ai.reply"), tenant_id: z.string(), conversation_id: z.string().optional() }),
  z.object({
    type: z.literal("order.created"), tenant_id: z.string(), conversation_id: z.string().optional(), channel: z.string().optional(), customer,
    items: z.array(z.object({ variant_id: z.string().optional(), code: z.string().optional(), variant: z.string().optional(), qty: z.number().int().min(1) })).min(1),
    delivery_charge: z.number().int().min(0).optional(), payment_method: z.string().optional(), notes: z.string().optional(),
  }),
  z.object({ type: z.literal("question.unanswered"), tenant_id: z.string(), text: z.string().min(1).max(1000) }),
]);

/** Demo engine webhook. Real engines get their own route with their own signature check, mapping to the same internal events. */
webhookRoutes.post("/demo/webhook", async (c) => {
  if (!c.env.BOOTSTRAP_TOKEN || c.req.header("x-demo-secret") !== c.env.BOOTSTRAP_TOKEN) throw new ApiError(401, "UNAUTHORIZED");
  const e = await parseBody(c, event);
  const t = await c.env.DB.prepare("SELECT * FROM tenants WHERE id=?").bind(e.tenant_id).first<TenantRow>();
  if (!t) throw new ApiError(404, "NOT_FOUND");
  if (t.status !== "active") return c.json({ ok: true, ignored: "tenant not active" });
  const tdb = tenantDb(c.env.DB, t.id);

  switch (e.type) {
    case "message.in": {
      if (t.engine === "demo" && t.engine_workspace_ref && e.text) await new DemoEngine(c.env.DB).simulateInbound(t.engine_workspace_ref, e.conversation_id, e.text);
      const cust = await upsertCustomer(tdb, { name: e.customer.name, phone: e.customer.phone, address: e.customer.address, engineRef: e.customer.ref });
      await c.env.DB.prepare(
        `INSERT INTO customer_last_inbound (tenant_id, customer_id, channel, conversation_id, last_inbound_at) VALUES (?1, ?2, ?3, ?4, ?5)
         ON CONFLICT (tenant_id, customer_id, channel) DO UPDATE SET conversation_id=excluded.conversation_id, last_inbound_at=excluded.last_inbound_at`,
      ).bind(t.id, cust.id, e.channel, e.conversation_id, nowIso()).run();
      if (e.new_conversation) await bumpUsage(c.env.DB, t.id, "conversations");
      await fireInbound(c.env, { tenantId: t.id, customerId: cust.id, conversationId: e.conversation_id, channel: e.channel, text: e.text, intent: e.intent, productCode: e.product_code });
      return c.json({ ok: true, customer_id: cust.id });
    }
    case "ai.reply":
      await bumpUsage(c.env.DB, t.id, "ai_replies");
      return c.json({ ok: true });
    case "order.created": {
      const items: { variant_id: string; qty: number }[] = [];
      for (const it of e.items) {
        if (it.variant_id) { items.push({ variant_id: it.variant_id, qty: it.qty }); continue; }
        const v = await tdb.first<{ id: string }>(
          `SELECT v.id FROM product_variants v JOIN products p ON p.id=v.product_id WHERE v.tenant_id=?1 AND p.code=?2 ${it.variant ? "AND v.label=?3" : ""} ORDER BY v.rowid LIMIT 1`,
          ...(it.variant ? [it.code, it.variant] : [it.code]),
        );
        if (!v) throw new ApiError(400, "VALIDATION", { issues: [{ path: ["items"], message: `Unknown product ${it.code} ${it.variant ?? ""}` }] });
        items.push({ variant_id: v.id, qty: it.qty });
      }
      const order = await createOrder(c.env, t.id, {
        customer: { name: e.customer.name, phone: e.customer.phone, address: e.customer.address, engineRef: e.customer.ref },
        items, delivery_charge: e.delivery_charge, payment_method: e.payment_method, notes: e.notes, source: "ai",
        conversation_id: e.conversation_id, channel: e.channel,
      });
      return c.json({ ok: true, order });
    }
    case "question.unanswered": {
      const norm = normalizeQuestion(e.text);
      await c.env.DB.prepare(
        `INSERT INTO unanswered_questions (id, tenant_id, normalized_text, sample_text, count, last_asked_at) VALUES (?1, ?2, ?3, ?4, 1, ?5)
         ON CONFLICT (tenant_id, normalized_text) DO UPDATE SET count = count + 1, last_asked_at = excluded.last_asked_at, resolved_faq_id = NULL`,
      ).bind(newId(), t.id, norm, e.text.trim(), nowIso()).run();
      return c.json({ ok: true });
    }
  }
});
