import type { Env } from "../env";
import { loadProducts, productName } from "../catalog/service";
import { tenantDb } from "../lib/db";
import { enqueueEngineJob } from "../engine/jobs";
import type { AgentConfig } from "../engine/types";
import { addMinutes, nowIso } from "../lib/time";

/** Debounce: mark the tenant's AI config as needing a push in ~1 minute (no-op if already scheduled). */
export async function schedulePush(db: D1Database, tenantId: string, now: Date = new Date()) {
  await db.prepare(
    `INSERT INTO agent_config (tenant_id, push_due_at, updated_at) VALUES (?1, ?2, ?3)
     ON CONFLICT (tenant_id) DO UPDATE SET push_due_at = COALESCE(agent_config.push_due_at, ?2)`,
  ).bind(tenantId, addMinutes(now, 1), nowIso(now)).run();
}


export async function buildAgentConfig(db: D1Database, tenantId: string): Promise<AgentConfig> {
  const tdb = tenantDb(db, tenantId);
  const row = await tdb.first<{ profile: string; tone: string; rules: string }>("SELECT profile, tone, rules FROM agent_config WHERE tenant_id=?1");
  const faqs = await tdb.all<{ question: string; answer: string }>("SELECT question, answer FROM faqs WHERE tenant_id=?1 ORDER BY created_at");
  const products = await loadProducts(tdb, "p.status='active'");
  const knowledge = await tdb.all<{ kind: string; title: string; url: string | null; content: string }>("SELECT kind, title, url, content FROM knowledge_sources WHERE tenant_id=?1 ORDER BY created_at");
  return {
    profile: row ? JSON.parse(row.profile) : {},
    tone: row ? JSON.parse(row.tone) : {},
    rules: row ? JSON.parse(row.rules) : {},
    faqs,
    catalog: products.map((p) => ({ code: p.code, name: productName(p), price: p.price, sale_price: p.sale_price, variants: p.variants.map((v) => ({ label: v.label, stock: v.stock })), description: p.description })),
    knowledge,
  };
}

/** Push now (through the engine job queue, so failures retry). Clears the pending flag first. */
export async function pushNow(env: Env, tenantId: string) {
  await env.DB.prepare("UPDATE agent_config SET push_due_at=NULL WHERE tenant_id=?").bind(tenantId).run();
  await enqueueEngineJob(env, tenantId, "pushAgentConfig", { config: await buildAgentConfig(env.DB, tenantId) });
}

/** Cron: push configs whose debounce window has passed, for active tenants with a workspace. */
export async function runDuePushes(env: Env, now: Date = new Date()) {
  const due = (await env.DB.prepare(
    `SELECT a.tenant_id FROM agent_config a JOIN tenants t ON t.id=a.tenant_id
     WHERE a.push_due_at IS NOT NULL AND a.push_due_at <= ? AND t.status='active' AND t.engine_workspace_ref IS NOT NULL`,
  ).bind(nowIso(now)).all<{ tenant_id: string }>()).results;
  for (const r of due) await pushNow(env, r.tenant_id);
}
