import type { SessionUser } from "../env";
import { randomToken } from "../lib/crypto";
import { addMinutes, nowIso } from "../lib/time";

const SESSION_DAYS = 30;
export const COOKIE = "ns_session";

export async function createSession(db: D1Database, userId: string): Promise<string> {
  const id = randomToken(32);
  const now = nowIso();
  await db.prepare("INSERT INTO sessions (id,user_id,expires_at,created_at) VALUES (?,?,?,?)")
    .bind(id, userId, addMinutes(now, SESSION_DAYS * 24 * 60), now).run();
  return id;
}

export async function getSession(db: D1Database, id: string): Promise<SessionUser | null> {
  const row = await db.prepare(
    "SELECT s.expires_at, u.id, u.email, u.name, u.role, u.tenant_id FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=?",
  ).bind(id).first<{ expires_at: string; id: string; email: string; name: string; role: SessionUser["role"]; tenant_id: string | null }>();
  if (!row) return null;
  const now = nowIso();
  if (row.expires_at <= now) {
    await db.prepare("DELETE FROM sessions WHERE id=?").bind(id).run();
    return null;
  }
  // Sliding expiry: extend at most once per hour to avoid a write on every request.
  const target = addMinutes(now, SESSION_DAYS * 24 * 60);
  if (new Date(target).getTime() - new Date(row.expires_at).getTime() > 3600_000) {
    await db.prepare("UPDATE sessions SET expires_at=? WHERE id=?").bind(target, id).run();
  }
  return { id: row.id, email: row.email, name: row.name, role: row.role, tenantId: row.tenant_id };
}

export async function destroySession(db: D1Database, id: string) {
  await db.prepare("DELETE FROM sessions WHERE id=?").bind(id).run();
}

export async function destroyUserSessions(db: D1Database, userId: string) {
  await db.prepare("DELETE FROM sessions WHERE user_id=?").bind(userId).run();
}

export async function destroyTenantSessions(db: D1Database, tenantId: string) {
  await db.prepare("DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE tenant_id=?)").bind(tenantId).run();
}
