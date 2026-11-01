import type { Env } from "./env";
import { TENANT_TABLES, tenantDb } from "./lib/db";
import { toCsv } from "./lib/csv";
import { buildCsvRows, CSV_KINDS } from "./reports/csv";

const PURGE_AFTER_DAYS = 30;

/** Permanently remove tenants deleted more than 30 days ago (data + media). Audit log is kept. */
export async function purgeDeletedTenants(env: Env, now: Date) {
  const cutoff = new Date(now.getTime() - PURGE_AFTER_DAYS * 86400_000).toISOString();
  const rows = (await env.DB.prepare("SELECT id, engine_workspace_ref FROM tenants WHERE status='deleted' AND deleted_at < ?").bind(cutoff).all<{ id: string; engine_workspace_ref: string | null }>()).results;
  for (const t of rows) {
    let cursor: string | undefined;
    do {
      const page = await env.MEDIA.list({ prefix: `tenants/${t.id}/`, cursor });
      if (page.objects.length) await env.MEDIA.delete(page.objects.map((o) => o.key));
      cursor = page.truncated ? page.cursor : undefined;
    } while (cursor);
    // Children before parents (FKs).
    const order = ["order_items", "orders", "product_images", "product_variants", "products", "customers"];
    const tables = [...order, ...TENANT_TABLES.filter((x) => !order.includes(x))];
    const stmts = tables.map((tbl) => env.DB.prepare(`DELETE FROM ${tbl} WHERE tenant_id=?`).bind(t.id));
    stmts.push(
      env.DB.prepare("DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE tenant_id=?)").bind(t.id),
      env.DB.prepare("DELETE FROM setup_tokens WHERE user_id IN (SELECT id FROM users WHERE tenant_id=?)").bind(t.id),
      env.DB.prepare("DELETE FROM users WHERE tenant_id=?").bind(t.id),
    );
    if (t.engine_workspace_ref) {
      stmts.push(
        env.DB.prepare("DELETE FROM demo_messages WHERE conversation_id IN (SELECT id FROM demo_conversations WHERE workspace_ref=?)").bind(t.engine_workspace_ref),
        env.DB.prepare("DELETE FROM demo_conversations WHERE workspace_ref=?").bind(t.engine_workspace_ref),
        env.DB.prepare("DELETE FROM demo_workspaces WHERE ref=?").bind(t.engine_workspace_ref),
      );
    }
    stmts.push(env.DB.prepare("DELETE FROM tenants WHERE id=?").bind(t.id));
    await env.DB.batch(stmts);
  }
}

/** Weekly (Sunday, first cron run after 00:00 Dhaka): each tenant's CSVs to R2 under backups/<date>/<tenant>/. */
export async function weeklyBackup(env: Env, now: Date) {
  const dhaka = new Date(now.getTime() + 6 * 3600_000);
  if (dhaka.getUTCDay() !== 0 || dhaka.getUTCHours() !== 0 || dhaka.getUTCMinutes() >= 5) return;
  const date = dhaka.toISOString().slice(0, 10);
  const tenants = (await env.DB.prepare("SELECT id FROM tenants WHERE status != 'deleted'").all<{ id: string }>()).results;
  for (const t of tenants) {
    const tdb = tenantDb(env.DB, t.id);
    for (const kind of CSV_KINDS) {
      await env.MEDIA.put(`backups/${date}/${t.id}/${kind}.csv`, toCsv(await buildCsvRows(tdb, kind)), { httpMetadata: { contentType: "text/csv; charset=utf-8" } });
    }
  }
}

export async function runMaintenance(env: Env, now: Date = new Date()) {
  await purgeDeletedTenants(env, now);
  await weeklyBackup(env, now);
}
