import { newId } from "../lib/crypto";
import { nowIso } from "../lib/time";

export async function audit(db: D1Database, actorId: string | null, tenantId: string | null, action: string, details: Record<string, unknown> = {}) {
  await db.prepare("INSERT INTO audit_log (id,actor_user_id,tenant_id,action,details,created_at) VALUES (?,?,?,?,?,?)")
    .bind(newId(), actorId, tenantId, action, JSON.stringify(details), nowIso()).run();
}
