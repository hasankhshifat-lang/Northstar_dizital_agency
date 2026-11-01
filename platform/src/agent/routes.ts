import { Hono } from "hono";
import { z } from "zod";
import type { AppEnv } from "../env";
import { clientGroup } from "../auth/middleware";
import { engineFor } from "../engine/registry";
import { newId } from "../lib/crypto";
import { tenantDb } from "../lib/db";
import { ApiError } from "../lib/errors";
import { nowIso } from "../lib/time";
import { parseBody } from "../lib/validate";
import { pushNow, schedulePush } from "./push";

export const agentRoutes = new Hono<AppEnv>();
agentRoutes.use("*", ...clientGroup("ai_agent"));

const str = (max = 1000) => z.string().trim().max(max).optional();
const configSchema = z.object({
  profile: z.object({
    shop_name: str(120), sells: str(1000), delivery_areas: str(500), delivery_charges: str(500),
    payment_methods: z.array(z.enum(["cod", "bkash", "nagad", "card", "bank"])).optional(),
    return_policy: str(1000), hours: str(200), whatsapp: str(30), messenger_url: str(300), website_url: str(300),
  }).default({}),
  tone: z.object({
    language: z.enum(["bn", "en", "match"]).optional(),
    formality: z.enum(["friendly", "formal"]).optional(),
    address_terms: z.boolean().optional(),
  }).default({}),
  rules: z.object({
    max_discount_pct: z.number().min(0).max(100).optional(),
    handoff_angry: z.boolean().optional(),
    handoff_refund: z.boolean().optional(),
    extra: str(2000),
  }).default({}),
});

agentRoutes.get("/config", async (c) => {
  const row = await tenantDb(c.env.DB, c.var.tenant.id).first<{ profile: string; tone: string; rules: string; updated_at: string }>(
    "SELECT profile, tone, rules, updated_at FROM agent_config WHERE tenant_id=?1",
  );
  return c.json({ profile: row ? JSON.parse(row.profile) : {}, tone: row ? JSON.parse(row.tone) : {}, rules: row ? JSON.parse(row.rules) : {}, updated_at: row?.updated_at ?? null });
});

agentRoutes.put("/config", async (c) => {
  const body = await parseBody(c, configSchema);
  const t = c.var.tenant.id;
  await c.env.DB.prepare(
    `INSERT INTO agent_config (tenant_id, profile, tone, rules, updated_at) VALUES (?1, ?2, ?3, ?4, ?5)
     ON CONFLICT (tenant_id) DO UPDATE SET profile=excluded.profile, tone=excluded.tone, rules=excluded.rules, updated_at=excluded.updated_at`,
  ).bind(t, JSON.stringify(body.profile), JSON.stringify(body.tone), JSON.stringify(body.rules), nowIso()).run();
  await schedulePush(c.env.DB, t);
  return c.json(body);
});

const faqSchema = z.object({ question: z.string().trim().min(1).max(500), answer: z.string().trim().min(1).max(2000) });

agentRoutes.get("/faqs", async (c) =>
  c.json({ faqs: await tenantDb(c.env.DB, c.var.tenant.id).all("SELECT id, question, answer, created_at FROM faqs WHERE tenant_id=?1 ORDER BY created_at DESC") }));

agentRoutes.post("/faqs", async (c) => {
  const body = await parseBody(c, faqSchema);
  const faq = { id: newId(), ...body, created_at: nowIso() };
  await tenantDb(c.env.DB, c.var.tenant.id).insert("faqs", faq);
  await schedulePush(c.env.DB, c.var.tenant.id);
  return c.json({ faq });
});

agentRoutes.put("/faqs/:id", async (c) => {
  const body = await parseBody(c, faqSchema);
  if (!(await tenantDb(c.env.DB, c.var.tenant.id).update("faqs", c.req.param("id"), body))) throw new ApiError(404, "NOT_FOUND");
  await schedulePush(c.env.DB, c.var.tenant.id);
  return c.json({ faq: { id: c.req.param("id"), ...body } });
});

agentRoutes.delete("/faqs/:id", async (c) => {
  const tdb = tenantDb(c.env.DB, c.var.tenant.id);
  if (!(await tdb.del("faqs", c.req.param("id")))) throw new ApiError(404, "NOT_FOUND");
  await tdb.run("UPDATE unanswered_questions SET resolved_faq_id=NULL WHERE tenant_id=?1 AND resolved_faq_id=?2", c.req.param("id"));
  await schedulePush(c.env.DB, c.var.tenant.id);
  return c.json({ ok: true });
});

agentRoutes.get("/unanswered", async (c) =>
  c.json({ questions: await tenantDb(c.env.DB, c.var.tenant.id).all(
    "SELECT id, sample_text, count, last_asked_at FROM unanswered_questions WHERE tenant_id=?1 AND resolved_faq_id IS NULL ORDER BY count DESC, last_asked_at DESC LIMIT 200",
  ) }));

agentRoutes.post("/unanswered/:id/teach", async (c) => {
  const { answer } = await parseBody(c, z.object({ answer: z.string().trim().min(1).max(2000) }));
  const tdb = tenantDb(c.env.DB, c.var.tenant.id);
  const q = await tdb.get<{ id: string; sample_text: string }>("unanswered_questions", c.req.param("id"));
  if (!q) throw new ApiError(404, "NOT_FOUND");
  const faq = { id: newId(), question: q.sample_text, answer, created_at: nowIso() };
  await c.env.DB.batch([tdb.insertStmt("faqs", faq), tdb.updateStmt("unanswered_questions", q.id, { resolved_faq_id: faq.id })]);
  await schedulePush(c.env.DB, c.var.tenant.id);
  return c.json({ faq });
});

agentRoutes.post("/test-chat", async (c) => {
  const { messages } = await parseBody(c, z.object({ messages: z.array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().max(2000) })).min(1).max(50) }));
  const t = c.var.tenant;
  // Make the test reflect the latest saved settings.
  const pending = await tenantDb(c.env.DB, t.id).first<{ push_due_at: string | null }>("SELECT push_due_at FROM agent_config WHERE tenant_id=?1");
  if (pending?.push_due_at) await pushNow(c.env, t.id);
  const { engine, ref } = engineFor(c.env, t);
  return c.json({ reply: await engine.testChat(ref, messages) });
});
