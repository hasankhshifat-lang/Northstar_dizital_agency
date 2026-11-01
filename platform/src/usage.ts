import { monthKey } from "./lib/time";

export type UsageField = "ai_replies" | "conversations" | "outbound_messages" | "orders";

export async function bumpUsage(db: D1Database, tenantId: string, field: UsageField, n = 1, at: Date = new Date()) {
  await db.prepare(
    `INSERT INTO usage_monthly (tenant_id, month, ${field}) VALUES (?1, ?2, ?3)
     ON CONFLICT (tenant_id, month) DO UPDATE SET ${field} = ${field} + ?3`,
  ).bind(tenantId, monthKey(at), n).run();
}
