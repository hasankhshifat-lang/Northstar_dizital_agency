import { Hono } from "hono";
import { z } from "zod";
import type { AppEnv, Channel, Feature } from "../env";
import { CHANNELS, FEATURES } from "../env";
import { requireAgency, requireAuth } from "../auth/middleware";
import { destroyTenantSessions } from "../auth/sessions";
import { enqueueEngineJob, retryJobNow } from "../engine/jobs";
import { ApiError } from "../lib/errors";
import { monthKey, nowIso } from "../lib/time";
import { loadTenantContext } from "../lib/tenant";
import { parseBody, parseValue } from "../lib/validate";
import { audit } from "./audit";
import { issueSetupToken, provisionTenant } from "./provision";

export const adminRoutes = new Hono<AppEnv>();
adminRoutes.use("*", requireAuth, requireAgency);

const featureSchema = z.enum(FEATURES as [Feature, ...Feature[]]);
const channelSchema = z.enum(CHANNELS as [Channel, ...Channel[]]);

async function clientView(db: D1Database, id: string) {
  const t = await loadTenantContext(db, id);
  if (!t) throw new ApiError(404, "NOT_FOUND");
  const owner = await db.prepare("SELECT id, name, email, phone, last_login_at FROM users WHERE tenant_id=? AND role='client_owner' LIMIT 1").bind(id).first();
  const usage = (await db.prepare("SELECT month, ai_replies, conversations, outbound_messages, orders FROM usage_monthly WHERE tenant_id=? ORDER BY month DESC LIMIT 12").bind(id).all()).results;
  return { ...t, owner, usage_history: usage };
}

adminRoutes.get("/clients", async (c) => {
  const q = c.req.query("q")?.trim();
  const status = c.req.query("status");
  const month = monthKey();
  const where: string[] = ["t.status != 'deleted'"];
  const binds: unknown[] = [month];
  if (status) { where.push(`t.status = ?${binds.length + 1}`); binds.push(status); }
  if (q) { where.push(`(t.business_name LIKE ?${binds.length + 1} OR u.email LIKE ?${binds.length + 1})`); binds.push(`%${q}%`); }
  const rows = (await c.env.DB.prepare(
    `SELECT t.id, t.business_name, t.slug, t.status, t.plan_label, t.created_at, u.email AS owner_email, u.name AS owner_name, u.last_login_at,
       (SELECT group_concat(feature) FROM tenant_features f WHERE f.tenant_id=t.id AND f.enabled=1) AS features,
       COALESCE(m.ai_replies,0) AS ai_replies, COALESCE(m.conversations,0) AS conversations,
       COALESCE(m.outbound_messages,0) AS outbound_messages, COALESCE(m.orders,0) AS orders
     FROM tenants t
     LEFT JOIN users u ON u.tenant_id=t.id AND u.role='client_owner'
     LEFT JOIN usage_monthly m ON m.tenant_id=t.id AND m.month=?1
     WHERE ${where.join(" AND ")} ORDER BY t.created_at DESC`,
  ).bind(...binds).all<any>()).results;
  return c.json({
    clients: rows.map((r) => ({
      id: r.id, business_name: r.business_name, slug: r.slug, status: r.status, plan_label: r.plan_label, created_at: r.created_at,
      owner_email: r.owner_email, owner_name: r.owner_name, last_login_at: r.last_login_at,
      features: r.features ? String(r.features).split(",").sort() : [],
      usage: { ai_replies: r.ai_replies, conversations: r.conversations, outbound_messages: r.outbound_messages, orders: r.orders },
    })),
  });
});

adminRoutes.post("/clients", async (c) => {
  const body = await parseBody(c, z.object({
    business_name: z.string().trim().min(1).max(120),
    owner_name: z.string().trim().min(1).max(120),
    email: z.string().trim().email(),
    phone: z.string().trim().max(30).optional(),
    plan_label: z.string().trim().max(60).optional().nullable(),
  }));
  const { tenantId, setupUrl } = await provisionTenant(c.env, body);
  await audit(c.env.DB, c.var.user.id, tenantId, "client.create", { business_name: body.business_name, email: body.email });
  await enqueueEngineJob(c.env, tenantId, "createWorkspace", {});
  return c.json({ client: await clientView(c.env.DB, tenantId), setup_url: setupUrl });
});

adminRoutes.get("/clients/:id", async (c) => c.json({ client: await clientView(c.env.DB, c.req.param("id")) }));

adminRoutes.patch("/clients/:id", async (c) => {
  const id = c.req.param("id");
  const body = await parseBody(c, z.object({ business_name: z.string().trim().min(1).max(120).optional(), plan_label: z.string().trim().max(60).nullable().optional() }));
  await clientView(c.env.DB, id);
  if (body.business_name !== undefined) await c.env.DB.prepare("UPDATE tenants SET business_name=? WHERE id=?").bind(body.business_name, id).run();
  if (body.plan_label !== undefined) await c.env.DB.prepare("UPDATE tenants SET plan_label=? WHERE id=?").bind(body.plan_label, id).run();
  await audit(c.env.DB, c.var.user.id, id, "client.update", body);
  return c.json({ client: await clientView(c.env.DB, id) });
});

adminRoutes.post("/clients/:id/suspend", async (c) => {
  const id = c.req.param("id");
  const body = await parseBody(c, z.object({ reason: z.string().max(300).optional() })).catch(() => ({ reason: undefined }));
  const t = await clientView(c.env.DB, id);
  if (t.status === "deleted") throw new ApiError(404, "NOT_FOUND");
  await c.env.DB.prepare("UPDATE tenants SET status='suspended', suspended_reason=? WHERE id=?").bind(body.reason ?? null, id).run();
  await destroyTenantSessions(c.env.DB, id);
  await audit(c.env.DB, c.var.user.id, id, "client.suspend", { reason: body.reason ?? null });
  await enqueueEngineJob(c.env, id, "pauseWorkspace", {});
  return c.json({ client: await clientView(c.env.DB, id) });
});

adminRoutes.post("/clients/:id/reactivate", async (c) => {
  const id = c.req.param("id");
  const t = await clientView(c.env.DB, id);
  if (t.status === "deleted") throw new ApiError(404, "NOT_FOUND");
  await c.env.DB.prepare("UPDATE tenants SET status='active', suspended_reason=NULL WHERE id=?").bind(id).run();
  await audit(c.env.DB, c.var.user.id, id, "client.reactivate");
  await enqueueEngineJob(c.env, id, "resumeWorkspace", {});
  return c.json({ client: await clientView(c.env.DB, id) });
});

adminRoutes.put("/clients/:id/features/:feature", async (c) => {
  const id = c.req.param("id");
  const feature = parseValue(featureSchema, c.req.param("feature"));
  const { enabled } = await parseBody(c, z.object({ enabled: z.boolean() }));
  await clientView(c.env.DB, id);
  await c.env.DB.prepare("UPDATE tenant_features SET enabled=? WHERE tenant_id=? AND feature=?").bind(enabled ? 1 : 0, id, feature).run();
  await audit(c.env.DB, c.var.user.id, id, "client.feature", { feature, enabled });
  if (feature === "ai_agent") await enqueueEngineJob(c.env, id, "setAiEnabled", { enabled });
  return c.json({ client: await clientView(c.env.DB, id) });
});

adminRoutes.put("/clients/:id/channels/:channel", async (c) => {
  const id = c.req.param("id");
  const channel = parseValue(channelSchema, c.req.param("channel"));
  const { enabled } = await parseBody(c, z.object({ enabled: z.boolean() }));
  await clientView(c.env.DB, id);
  await c.env.DB.prepare("UPDATE tenant_channels SET enabled=? WHERE tenant_id=? AND channel=?").bind(enabled ? 1 : 0, id, channel).run();
  await audit(c.env.DB, c.var.user.id, id, "client.channel", { channel, enabled });
  await enqueueEngineJob(c.env, id, "setChannelEnabled", { channel, enabled });
  return c.json({ client: await clientView(c.env.DB, id) });
});

adminRoutes.post("/clients/:id/reset-login", async (c) => {
  const id = c.req.param("id");
  const owner = await c.env.DB.prepare("SELECT id FROM users WHERE tenant_id=? AND role='client_owner' LIMIT 1").bind(id).first<{ id: string }>();
  if (!owner) throw new ApiError(404, "NOT_FOUND");
  await c.env.DB.prepare("UPDATE setup_tokens SET used_at=? WHERE user_id=? AND used_at IS NULL").bind(nowIso(), owner.id).run();
  const setupUrl = await issueSetupToken(c.env, owner.id);
  await audit(c.env.DB, c.var.user.id, id, "client.reset_login");
  return c.json({ setup_url: setupUrl });
});

adminRoutes.delete("/clients/:id", async (c) => {
  const id = c.req.param("id");
  const { confirm_name } = await parseBody(c, z.object({ confirm_name: z.string() }));
  const t = await clientView(c.env.DB, id);
  if (confirm_name.trim() !== t.business_name) throw new ApiError(400, "VALIDATION", { issues: [{ path: ["confirm_name"], message: "Name does not match" }] });
  await c.env.DB.prepare("UPDATE tenants SET status='deleted', deleted_at=? WHERE id=?").bind(nowIso(), id).run();
  await destroyTenantSessions(c.env.DB, id);
  await audit(c.env.DB, c.var.user.id, id, "client.delete", { business_name: t.business_name });
  await enqueueEngineJob(c.env, id, "pauseWorkspace", {});
  return c.json({ ok: true });
});

adminRoutes.get("/audit", async (c) => {
  const tenant = c.req.query("tenant_id");
  const actor = c.req.query("actor");
  const where: string[] = [];
  const binds: unknown[] = [];
  if (tenant) { binds.push(tenant); where.push(`a.tenant_id=?${binds.length}`); }
  if (actor) { binds.push(actor); where.push(`a.actor_user_id=?${binds.length}`); }
  const rows = (await c.env.DB.prepare(
    `SELECT a.*, u.name AS actor_name, t.business_name FROM audit_log a
     LEFT JOIN users u ON u.id=a.actor_user_id LEFT JOIN tenants t ON t.id=a.tenant_id
     ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY a.created_at DESC LIMIT 200`,
  ).bind(...binds).all<any>()).results;
  return c.json({ entries: rows.map((r) => ({ ...r, details: r.details ? JSON.parse(r.details) : {} })) });
});

adminRoutes.get("/engine-jobs", async (c) => {
  const status = c.req.query("status") ?? "failed";
  const rows = (await c.env.DB.prepare(
    "SELECT j.*, t.business_name FROM engine_jobs j LEFT JOIN tenants t ON t.id=j.tenant_id WHERE j.status=? ORDER BY j.created_at DESC LIMIT 200",
  ).bind(status).all()).results;
  return c.json({ jobs: rows });
});

adminRoutes.post("/engine-jobs/:id/retry", async (c) => {
  await retryJobNow(c.env, c.req.param("id"));
  await audit(c.env.DB, c.var.user.id, null, "engine_job.retry", { job_id: c.req.param("id") });
  const job = await c.env.DB.prepare("SELECT * FROM engine_jobs WHERE id=?").bind(c.req.param("id")).first();
  return c.json({ job });
});

const presetSchema = z.object({ label: z.string().trim().min(1).max(60), features: z.array(featureSchema), channels: z.array(channelSchema) });

adminRoutes.get("/presets", async (c) => {
  const rows = (await c.env.DB.prepare("SELECT * FROM plan_presets ORDER BY label").all<any>()).results;
  return c.json({ presets: rows.map((r) => ({ label: r.label, features: JSON.parse(r.features), channels: JSON.parse(r.channels) })) });
});

adminRoutes.post("/presets", async (c) => {
  const p = await parseBody(c, presetSchema);
  await c.env.DB.prepare("INSERT INTO plan_presets (label,features,channels) VALUES (?,?,?) ON CONFLICT(label) DO UPDATE SET features=excluded.features, channels=excluded.channels")
    .bind(p.label, JSON.stringify(p.features), JSON.stringify(p.channels)).run();
  await audit(c.env.DB, c.var.user.id, null, "preset.save", p);
  return c.json({ preset: p });
});

adminRoutes.put("/presets/:label", async (c) => {
  const p = await parseBody(c, presetSchema.omit({ label: true }));
  const label = c.req.param("label");
  const r = await c.env.DB.prepare("UPDATE plan_presets SET features=?, channels=? WHERE label=?").bind(JSON.stringify(p.features), JSON.stringify(p.channels), label).run();
  if (!r.meta.changes) throw new ApiError(404, "NOT_FOUND");
  await audit(c.env.DB, c.var.user.id, null, "preset.save", { label, ...p });
  return c.json({ preset: { label, ...p } });
});

adminRoutes.delete("/presets/:label", async (c) => {
  await c.env.DB.prepare("DELETE FROM plan_presets WHERE label=?").bind(c.req.param("label")).run();
  await audit(c.env.DB, c.var.user.id, null, "preset.delete", { label: c.req.param("label") });
  return c.json({ ok: true });
});
