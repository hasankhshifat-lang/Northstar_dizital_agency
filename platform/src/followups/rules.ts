import type { Env } from "../env";
import { tenantSeeders } from "../admin/provision";
import { inboundHooks } from "../engine/events";
import { newId } from "../lib/crypto";
import { tenantDb } from "../lib/db";
import { addMinutes } from "../lib/time";
import { orderHooks } from "../orders/service";

export type RuleType = "price_no_order" | "order_unconfirmed" | "delivered_thanks" | "win_back";
export const RULE_TYPES: RuleType[] = ["price_no_order", "order_unconfirmed", "delivered_thanks", "win_back"];

export const DEFAULT_RULES: Record<RuleType, { delay_minutes: number; message_template: string }> = {
  price_no_order: { delay_minutes: 180, message_template: "{name}, আপনি {product} সম্পর্কে জানতে চেয়েছিলেন — এখনো নিতে চাইলে জানাবেন? {offer}" },
  order_unconfirmed: { delay_minutes: 120, message_template: "{name}, আপনার অর্ডার #{order_number} কনফার্ম করতে একটি রিপ্লাই দিন 🙏 {offer}" },
  delivered_thanks: { delay_minutes: 1440, message_template: "{name}, অর্ডার #{order_number} পেয়ে কেমন লাগলো? আপনার মতামত আমাদের কাছে অনেক দামি ❤️" },
  win_back: { delay_minutes: 43200, message_template: "{name}, অনেকদিন দেখা নেই! নতুন কালেকশন এসেছে। {offer}" },
};

export interface RuleRow {
  id: string; type: RuleType; enabled: number; delay_minutes: number; message_template: string; offer_text: string | null; whatsapp_template_name: string | null;
}

export function renderTemplate(tpl: string, vars: Record<string, string | number | null | undefined>): string {
  return tpl.replace(/\{(name|product|order_number|offer)\}/g, (_, k) => (vars[k] == null ? "" : String(vars[k]))).replace(/[ \t]+/g, " ").trim();
}

const seedStmts = (db: D1Database, tenantId: string) =>
  RULE_TYPES.map((type) =>
    db.prepare("INSERT OR IGNORE INTO followup_rules (id, tenant_id, type, enabled, delay_minutes, message_template) VALUES (?, ?, ?, 0, ?, ?)")
      .bind(newId(), tenantId, type, DEFAULT_RULES[type].delay_minutes, DEFAULT_RULES[type].message_template));

tenantSeeders.push(seedStmts);

/** Idempotent: older tenants (or test fixtures) get default rules on first use. */
export async function ensureDefaultRules(db: D1Database, tenantId: string) {
  await db.batch(seedStmts(db, tenantId));
}

export interface FollowupContext {
  contextId: string;
  channel?: string | null;
  conversationId?: string | null;
  product?: string | null;
  orderNumber?: number | null;
}

/** Schedule a rule's follow-up once per (type, customer, context). A cancelled one is revived; a sent one never repeats. */
export async function scheduleFollowup(env: Env, tenantId: string, type: RuleType, customerId: string, ctx: FollowupContext, now = new Date()) {
  await ensureDefaultRules(env.DB, tenantId);
  const tdb = tenantDb(env.DB, tenantId);
  const rule = await tdb.first<RuleRow>("SELECT * FROM followup_rules WHERE tenant_id=?1 AND type=?2", type);
  if (!rule?.enabled) return;
  let channel = ctx.channel ?? null;
  let conversationId = ctx.conversationId ?? null;
  if (!channel || !conversationId) {
    const li = await tdb.first<{ channel: string; conversation_id: string }>(
      "SELECT channel, conversation_id FROM customer_last_inbound WHERE tenant_id=?1 AND customer_id=?2 AND conversation_id IS NOT NULL ORDER BY last_inbound_at DESC LIMIT 1", customerId,
    );
    if (!li) return; // no chat to send into
    channel = li.channel;
    conversationId = li.conversation_id;
  }
  const dedup = `${type}:${customerId}:${ctx.contextId}`;
  await env.DB.prepare(
    `INSERT INTO followup_sends (id, tenant_id, rule_id, dedup_key, customer_id, channel, conversation_id, context, status, scheduled_for)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, 'scheduled', ?9)
     ON CONFLICT (tenant_id, dedup_key) DO UPDATE SET status='scheduled', skip_reason=NULL, scheduled_for=excluded.scheduled_for,
       channel=excluded.channel, conversation_id=excluded.conversation_id
     WHERE followup_sends.status='cancelled'`,
  ).bind(newId(), tenantId, rule.id, dedup, customerId, channel, conversationId,
    JSON.stringify({ product: ctx.product ?? null, order_number: ctx.orderNumber ?? null }), addMinutes(now, rule.delay_minutes)).run();
}

/** Cancel this customer's still-scheduled follow-ups of the given types (optionally only for one context). */
export async function cancelPendingForCustomer(db: D1Database, tenantId: string, customerId: string, types: RuleType[] = RULE_TYPES, contextId?: string) {
  const tdb = tenantDb(db, tenantId);
  for (const type of types) {
    if (contextId) {
      await tdb.run("UPDATE followup_sends SET status='cancelled' WHERE tenant_id=?1 AND status='scheduled' AND dedup_key=?2", `${type}:${customerId}:${contextId}`);
    } else {
      await tdb.run("UPDATE followup_sends SET status='cancelled' WHERE tenant_id=?1 AND status='scheduled' AND customer_id=?2 AND dedup_key LIKE ?3", customerId, `${type}:%`);
    }
  }
}

orderHooks.push(async (env, tenantId, e) => {
  const o = e.order;
  if (!o.customer_id) return;
  const ctx = { contextId: o.id, channel: o.channel, conversationId: o.conversation_id, orderNumber: o.number };
  if (e.type === "created") {
    await cancelPendingForCustomer(env.DB, tenantId, o.customer_id, ["price_no_order", "win_back"]);
    if (o.status === "new") await scheduleFollowup(env, tenantId, "order_unconfirmed", o.customer_id, ctx);
    return;
  }
  if (e.to === "confirmed" || e.to === "cancelled") await cancelPendingForCustomer(env.DB, tenantId, o.customer_id, ["order_unconfirmed"], o.id);
  if (e.to === "delivered") {
    await scheduleFollowup(env, tenantId, "delivered_thanks", o.customer_id, ctx);
    await scheduleFollowup(env, tenantId, "win_back", o.customer_id, ctx);
  }
});

inboundHooks.push(async (env, e) => {
  // The customer answered: chasing them is no longer needed.
  await cancelPendingForCustomer(env.DB, e.tenantId, e.customerId, ["price_no_order", "order_unconfirmed"]);
  if (e.intent === "product_question") {
    const product = e.productCode
      ? (await tenantDb(env.DB, e.tenantId).first<{ name_bn: string | null; name_en: string | null; code: string }>("SELECT name_bn, name_en, code FROM products WHERE tenant_id=?1 AND code=?2", e.productCode))
      : null;
    await scheduleFollowup(env, e.tenantId, "price_no_order", e.customerId, {
      contextId: e.productCode ?? e.conversationId, channel: e.channel, conversationId: e.conversationId,
      product: product ? product.name_bn || product.name_en || product.code : e.productCode ?? null,
    });
  }
});

