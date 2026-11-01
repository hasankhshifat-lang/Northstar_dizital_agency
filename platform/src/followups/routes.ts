import { Hono } from "hono";
import { z } from "zod";
import type { AppEnv } from "../env";
import { clientGroup } from "../auth/middleware";
import { tenantDb } from "../lib/db";
import { ApiError } from "../lib/errors";
import { parseBody } from "../lib/validate";
import { ensureDefaultRules, RULE_TYPES, type RuleRow } from "./rules";
import { resolveAudience } from "./broadcasts";
import { runScheduler } from "./scheduler";
import { newId } from "../lib/crypto";
import { nowIso } from "../lib/time";

export const followupRoutes = new Hono<AppEnv>();
followupRoutes.use("*", ...clientGroup("followups"));

const view = (r: RuleRow) => ({ ...r, enabled: !!r.enabled });

followupRoutes.get("/rules", async (c) => {
  await ensureDefaultRules(c.env.DB, c.var.tenant.id);
  const rows = await tenantDb(c.env.DB, c.var.tenant.id).all<RuleRow>("SELECT id, type, enabled, delay_minutes, message_template, offer_text, whatsapp_template_name FROM followup_rules WHERE tenant_id=?1");
  rows.sort((a, b) => RULE_TYPES.indexOf(a.type) - RULE_TYPES.indexOf(b.type));
  return c.json({ rules: rows.map(view) });
});

followupRoutes.put("/rules/:id", async (c) => {
  const body = await parseBody(c, z.object({
    enabled: z.boolean(),
    delay_minutes: z.number().int().min(5).max(60 * 24 * 365),
    message_template: z.string().trim().min(1).max(1000),
    offer_text: z.string().trim().max(300).nullish(),
    whatsapp_template_name: z.string().trim().max(120).nullish(),
  }));
  const tdb = tenantDb(c.env.DB, c.var.tenant.id);
  if (!(await tdb.update("followup_rules", c.req.param("id"), { ...body, offer_text: body.offer_text || null, whatsapp_template_name: body.whatsapp_template_name || null }))) throw new ApiError(404, "NOT_FOUND");
  return c.json({ rule: view((await tdb.get<RuleRow>("followup_rules", c.req.param("id")))!) });
});

const audienceSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("recent24h") }),
  z.object({ type: z.literal("tag"), value: z.string().trim().min(1).max(40) }),
  z.object({ type: z.literal("bought_product"), value: z.string().min(1) }),
  z.object({ type: z.literal("inactive_days"), value: z.number().int().min(1).max(3650) }),
]);

export const broadcastRoutes = new Hono<AppEnv>();
broadcastRoutes.use("*", ...clientGroup("followups"));

broadcastRoutes.post("/preview", async (c) => {
  const { audience } = await parseBody(c, z.object({ audience: audienceSchema }));
  const r = await resolveAudience(c.env, c.var.tenant.id, audience, c.var.tenant.channels);
  return c.json({ by_channel: r.by_channel, excluded: r.excluded, total: r.recipients.length });
});

broadcastRoutes.post("/", async (c) => {
  const body = await parseBody(c, z.object({
    audience: audienceSchema,
    message: z.string().trim().min(1).max(1000),
    product_id: z.string().nullish(),
    scheduled_for: z.string().datetime({ offset: true }).nullish(),
  }));
  const tdb = tenantDb(c.env.DB, c.var.tenant.id);
  if (body.product_id && !(await tdb.get("products", body.product_id))) throw new ApiError(400, "VALIDATION", { issues: [{ path: ["product_id"], message: "Unknown product" }] });
  const now = new Date();
  const at = body.scheduled_for ? new Date(body.scheduled_for) : now;
  const id = newId();
  await tdb.insert("broadcasts", { id, audience: body.audience, message: body.message, product_id: body.product_id ?? null, scheduled_for: nowIso(at < now ? now : at), status: "scheduled", created_at: nowIso(now) });
  if (at <= now) await runScheduler(c.env, now, { broadcastId: id });
  return c.json({ broadcast: await tdb.get("broadcasts", id) });
});

broadcastRoutes.get("/", async (c) => {
  const rows = await tenantDb(c.env.DB, c.var.tenant.id).all<any>("SELECT * FROM broadcasts WHERE tenant_id=?1 ORDER BY created_at DESC LIMIT 100");
  return c.json({ broadcasts: rows.map((r) => ({ ...r, audience: JSON.parse(r.audience) })) });
});

/** Per rule / broadcast: sent, replied (customer wrote after the send), orders within 3 days and their value. */
followupRoutes.get("/results", async (c) => {
  const tdb = tenantDb(c.env.DB, c.var.tenant.id);
  const sql = (group: "rule_id" | "broadcast_id") => `
    SELECT s.${group} AS id, COUNT(*) AS sent,
      SUM(CASE WHEN EXISTS (SELECT 1 FROM customer_last_inbound li WHERE li.tenant_id=s.tenant_id AND li.customer_id=s.customer_id AND li.last_inbound_at > s.sent_at) THEN 1 ELSE 0 END) AS replied,
      SUM((SELECT COUNT(*) FROM orders o WHERE o.tenant_id=s.tenant_id AND o.customer_id=s.customer_id AND o.status != 'cancelled'
           AND o.created_at > s.sent_at AND o.created_at <= strftime('%Y-%m-%dT%H:%M:%fZ', s.sent_at, '+3 days'))) AS orders,
      SUM((SELECT COALESCE(SUM(o.total),0) FROM orders o WHERE o.tenant_id=s.tenant_id AND o.customer_id=s.customer_id AND o.status != 'cancelled'
           AND o.created_at > s.sent_at AND o.created_at <= strftime('%Y-%m-%dT%H:%M:%fZ', s.sent_at, '+3 days'))) AS order_value
    FROM followup_sends s WHERE s.tenant_id=?1 AND s.status='sent' AND s.${group} IS NOT NULL GROUP BY s.${group}`;
  const [rules, bstats, ruleRows, bRows, skipped] = await Promise.all([
    tdb.all<any>(sql("rule_id")), tdb.all<any>(sql("broadcast_id")),
    tdb.all<{ id: string; type: string }>("SELECT id, type FROM followup_rules WHERE tenant_id=?1"),
    tdb.all<{ id: string; message: string; created_at: string }>("SELECT id, message, created_at FROM broadcasts WHERE tenant_id=?1 ORDER BY created_at DESC LIMIT 100"),
    tdb.all<{ reason: string; n: number }>("SELECT skip_reason AS reason, COUNT(*) AS n FROM followup_sends WHERE tenant_id=?1 AND status IN ('skipped','failed') GROUP BY skip_reason"),
  ]);
  const zero = { sent: 0, replied: 0, orders: 0, order_value: 0 };
  const pick = (list: any[], id: string) => { const r = list.find((x) => x.id === id); return r ? { sent: r.sent, replied: r.replied, orders: r.orders, order_value: r.order_value } : zero; };
  return c.json({
    rules: ruleRows.map((r) => ({ id: r.id, type: r.type, ...pick(rules, r.id) })),
    broadcasts: bRows.map((b) => ({ id: b.id, message: b.message, created_at: b.created_at, ...pick(bstats, b.id) })),
    skipped: Object.fromEntries(skipped.map((s) => [s.reason ?? "UNKNOWN", s.n])),
  });
});
