/**
 * Tenant-scoped data access. Every query on a tenant-owned table goes through tenantDb().
 * Raw SQL must reference `tenant_id` and use numbered parameters; ?1 is always bound to the tenant id,
 * so callers' own parameters start at ?2.
 */
export const ID_TABLES = [
  "engine_jobs", "faqs", "unanswered_questions", "conversation_state", "quick_replies", "products",
  "product_variants", "product_images", "customers", "orders", "order_items", "followup_rules",
  "broadcasts", "followup_sends", "knowledge_sources",
] as const;

export const TENANT_TABLES = [
  ...ID_TABLES, "tenant_features", "tenant_channels", "tenant_counters", "agent_config",
  "customer_last_inbound", "usage_monthly",
] as const;

const IDENT = /^[a-z_][a-z0-9_]*$/;

function assertScoped(sql: string) {
  if (!/tenant_id/.test(sql) || !/\?1\b/.test(sql)) throw new Error("tenantDb: query must filter on tenant_id = ?1");
  if (/\?(?!\d)/.test(sql)) throw new Error("tenantDb: use numbered parameters (?2, ?3, …), not bare ?");
}

function assertTable(table: string) {
  if (!(TENANT_TABLES as readonly string[]).includes(table)) throw new Error(`tenantDb: ${table} is not a tenant table`);
}

export type TenantDb = ReturnType<typeof tenantDb>;

export function tenantDb(db: D1Database, tenantId: string) {
  const prep = (sql: string, binds: unknown[]) => {
    assertScoped(sql);
    return db.prepare(sql).bind(tenantId, ...binds);
  };
  return {
    tenantId,
    raw: db,
    prepare: prep,
    async all<T = Record<string, unknown>>(sql: string, ...binds: unknown[]): Promise<T[]> {
      return (await prep(sql, binds).all<T>()).results;
    },
    async first<T = Record<string, unknown>>(sql: string, ...binds: unknown[]): Promise<T | null> {
      return prep(sql, binds).first<T>();
    },
    async run(sql: string, ...binds: unknown[]): Promise<number> {
      return (await prep(sql, binds).run()).meta.changes ?? 0;
    },
    insertStmt(table: string, row: Record<string, unknown>) {
      assertTable(table);
      const cols = Object.keys(row).filter((k) => k !== "tenant_id");
      cols.forEach((c) => { if (!IDENT.test(c)) throw new Error("bad column " + c); });
      const sql = `INSERT INTO ${table} (tenant_id${cols.map((c) => "," + c).join("")}) VALUES (?1${cols.map((_, i) => ",?" + (i + 2)).join("")})`;
      return db.prepare(sql).bind(tenantId, ...cols.map((c) => toDb(row[c])));
    },
    async insert(table: string, row: Record<string, unknown>) {
      await this.insertStmt(table, row).run();
    },
    updateStmt(table: string, id: string, patch: Record<string, unknown>) {
      assertTable(table);
      const cols = Object.keys(patch).filter((k) => k !== "tenant_id" && k !== "id");
      cols.forEach((c) => { if (!IDENT.test(c)) throw new Error("bad column " + c); });
      const set = cols.length ? cols.map((c, i) => `${c}=?${i + 3}`).join(",") : "id=id";
      return db.prepare(`UPDATE ${table} SET ${set} WHERE tenant_id=?1 AND id=?2`).bind(tenantId, id, ...cols.map((c) => toDb(patch[c])));
    },
    async update(table: string, id: string, patch: Record<string, unknown>): Promise<number> {
      return (await this.updateStmt(table, id, patch).run()).meta.changes ?? 0;
    },
    async get<T = Record<string, unknown>>(table: string, id: string): Promise<T | null> {
      assertTable(table);
      return db.prepare(`SELECT * FROM ${table} WHERE tenant_id=?1 AND id=?2`).bind(tenantId, id).first<T>();
    },
    async del(table: string, id: string): Promise<number> {
      assertTable(table);
      return (await db.prepare(`DELETE FROM ${table} WHERE tenant_id=?1 AND id=?2`).bind(tenantId, id).run()).meta.changes ?? 0;
    },
  };
}

function toDb(v: unknown): unknown {
  if (v === undefined) return null;
  if (typeof v === "boolean") return v ? 1 : 0;
  if (v !== null && typeof v === "object") return JSON.stringify(v);
  return v;
}
