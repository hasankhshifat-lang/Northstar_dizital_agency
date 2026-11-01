import { addMinutes, nowIso } from "../lib/time";

/** Debounce: mark the tenant's AI config as needing a push in ~1 minute (no-op if already scheduled). */
export async function schedulePush(db: D1Database, tenantId: string, now: Date = new Date()) {
  await db.prepare(
    `INSERT INTO agent_config (tenant_id, push_due_at, updated_at) VALUES (?1, ?2, ?3)
     ON CONFLICT (tenant_id) DO UPDATE SET push_due_at = COALESCE(agent_config.push_due_at, ?2)`,
  ).bind(tenantId, addMinutes(now, 1), nowIso(now)).run();
}
