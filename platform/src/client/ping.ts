import { engineFor } from "../engine/registry";
import { tenantDb } from "../lib/db";
import { monthKey } from "../lib/time";
import { Hono } from "hono";
import type { AppEnv, Feature } from "../env";
import { requireAuth, requireClient } from "../auth/middleware";
import { FEATURES } from "../env";
import { ApiError } from "../lib/errors";

export const clientPing = new Hono<AppEnv>();
clientPing.use("*", requireAuth, requireClient);
clientPing.get("/ping", (c) => c.json({ ok: true, tenant: c.var.tenant.id }));

/** Test-only route to exercise feature gates (mounted always, answers only when env.TEST === "1"). */
export const testRoutes = new Hono<AppEnv>();
testRoutes.use("*", async (c, next) => {
  if (c.env.TEST !== "1") throw new ApiError(404, "NOT_FOUND");
  await next();
});
testRoutes.get("/feature/:f", requireAuth, requireClient, (c) => {
  const f = c.req.param("f") as Feature;
  if (!FEATURES.includes(f)) throw new ApiError(404, "NOT_FOUND");
  if (!c.var.tenant.features.includes(f)) throw new ApiError(403, "FEATURE_DISABLED", { feature: f });
  return c.json({ ok: true });
});


/** Home dashboard numbers; each block only when its feature is on. Engine trouble never breaks the page. */
clientPing.get("/home", async (c) => {
  const t = c.var.tenant;
  const tdb = tenantDb(c.env.DB, t.id);
  const has = (f: Feature) => t.features.includes(f);
  const startOfDay = new Date(Math.floor((Date.now() + 6 * 3600_000) / 86400_000) * 86400_000 - 6 * 3600_000).toISOString();
  const out: Record<string, unknown> = { alerts: {} as Record<string, number> };
  const alerts = out.alerts as Record<string, number>;
  const usage = await tdb.first<{ ai_replies: number; conversations: number }>("SELECT ai_replies, conversations FROM usage_monthly WHERE tenant_id=?1 AND month=?2", monthKey());
  out.ai_replies_month = usage?.ai_replies ?? 0;
  if (has("inbox")) {
    try {
      const { engine, ref } = engineFor(c.env, t);
      const convs = (await engine.listConversations(ref, { channels: t.channels })).items;
      const states = await tdb.all<{ engine_conversation_id: string; state: string }>("SELECT engine_conversation_id, state FROM conversation_state WHERE tenant_id=?1");
      const closed = new Set(states.filter((s) => s.state !== "open").map((s) => s.engine_conversation_id));
      out.new_chats_today = convs.filter((x) => x.lastAt >= startOfDay).length;
      out.waiting = convs.filter((x) => !closed.has(x.id) && x.lastFrom === "customer").length;
    } catch {
      out.engine_unavailable = true;
    }
  }
  if (has("orders")) {
    const o = await tdb.first<{ n: number; total: number }>("SELECT COUNT(*) AS n, COALESCE(SUM(total),0) AS total FROM orders WHERE tenant_id=?1 AND created_at >= ?2 AND status != 'cancelled'", startOfDay);
    out.orders_today = o?.n ?? 0;
    out.sales_today = o?.total ?? 0;
    const pending = await tdb.first<{ n: number }>("SELECT COUNT(*) AS n FROM orders WHERE tenant_id=?1 AND status='new'");
    alerts.orders_to_confirm = pending?.n ?? 0;
    const low = await tdb.first<{ n: number }>("SELECT COUNT(*) AS n FROM product_variants v JOIN products p ON p.id=v.product_id WHERE v.tenant_id=?1 AND p.status='active' AND v.stock <= 2");
    alerts.low_stock = low?.n ?? 0;
  }
  if (has("ai_agent")) {
    const u = await tdb.first<{ n: number }>("SELECT COUNT(*) AS n FROM unanswered_questions WHERE tenant_id=?1 AND resolved_faq_id IS NULL");
    alerts.unanswered = u?.n ?? 0;
  }
  if (has("followups")) {
    const f = await tdb.first<{ n: number }>("SELECT COUNT(*) AS n FROM followup_sends WHERE tenant_id=?1 AND status='failed' AND scheduled_for >= ?2", new Date(Date.now() - 7 * 86400_000).toISOString());
    alerts.failed_sends = f?.n ?? 0;
  }
  return c.json(out);
});
