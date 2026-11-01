import { Hono } from "hono";
import type { AppEnv } from "../env";
import { clientGroup } from "../auth/middleware";
import { csvResponse } from "../lib/csv";
import { buildCsvRows, CSV_KINDS, type CsvKind } from "./csv";
import { tenantDb, type TenantDb } from "../lib/db";
import { ApiError } from "../lib/errors";
import { addMinutes, dayKey, nowIso } from "../lib/time";

export const reportRoutes = new Hono<AppEnv>();
reportRoutes.use("*", ...clientGroup("orders"));

const range = (q: Record<string, string>) => ({ from: q.from || addMinutes(nowIso(), -30 * 24 * 60), to: q.to || nowIso() });

reportRoutes.get("/summary", async (c) => {
  const tdb = tenantDb(c.env.DB, c.var.tenant.id);
  const { from, to } = range(c.req.query());
  const orders = await tdb.all<{ total: number; created_at: string }>(
    "SELECT total, created_at FROM orders WHERE tenant_id=?1 AND status != 'cancelled' AND created_at BETWEEN ?2 AND ?3", from, to,
  );
  const byDay = new Map<string, { day: string; total: number; orders: number }>();
  for (const o of orders) {
    const d = dayKey(o.created_at);
    const e = byDay.get(d) ?? byDay.set(d, { day: d, total: 0, orders: 0 }).get(d)!;
    e.total += o.total; e.orders += 1;
  }
  const top = await tdb.all(
    `SELECT i.name_snapshot AS name, SUM(i.qty) AS qty, SUM(i.qty * i.unit_price) AS total
     FROM order_items i JOIN orders o ON o.id=i.order_id
     WHERE i.tenant_id=?1 AND o.status != 'cancelled' AND o.created_at BETWEEN ?2 AND ?3
     GROUP BY i.name_snapshot ORDER BY qty DESC, total DESC LIMIT 10`, from, to,
  );
  const counts = await tdb.all<{ status: string; n: number }>("SELECT status, COUNT(*) AS n FROM orders WHERE tenant_id=?1 AND created_at BETWEEN ?2 AND ?3 GROUP BY status", from, to);
  const status_counts = Object.fromEntries(counts.map((r) => [r.status, r.n]));
  const delivered = status_counts.delivered ?? 0;
  const returned = status_counts.returned ?? 0;
  return c.json({
    from, to,
    sales_by_day: [...byDay.values()].sort((a, b) => a.day.localeCompare(b.day)),
    top_products: top,
    status_counts,
    return_rate: delivered + returned ? returned / (delivered + returned) : 0,
  });
});

export async function returnsData(tdb: TenantDb, from: string, to: string) {
  const rows = await tdb.all<{ condition: string; n: number }>(
    "SELECT return_condition AS condition, COUNT(*) AS n FROM orders WHERE tenant_id=?1 AND status='returned' AND created_at BETWEEN ?2 AND ?3 GROUP BY return_condition", from, to,
  );
  const total = rows.reduce((s, r) => s + r.n, 0);
  const by_condition = ["good", "in_transit", "damaged", "unknown"].map((cond) => {
    const n = rows.find((r) => r.condition === cond)?.n ?? 0;
    return { condition: cond, count: n, pct: total ? Math.round((n / total) * 1000) / 10 : 0 };
  });
  const by_product = await tdb.all(
    `SELECT i.name_snapshot AS name, SUM(i.qty) AS qty,
       SUM(CASE WHEN o.return_condition='good' THEN i.qty ELSE 0 END) AS good,
       SUM(CASE WHEN o.return_condition='damaged' THEN i.qty ELSE 0 END) AS damaged,
       SUM(CASE WHEN o.return_condition='in_transit' THEN i.qty ELSE 0 END) AS in_transit,
       SUM(CASE WHEN o.return_condition='unknown' THEN i.qty ELSE 0 END) AS unknown
     FROM order_items i JOIN orders o ON o.id=i.order_id
     WHERE i.tenant_id=?1 AND o.status='returned' AND o.created_at BETWEEN ?2 AND ?3
     GROUP BY i.name_snapshot ORDER BY qty DESC`, from, to,
  );
  return { total, by_condition, by_product };
}

reportRoutes.get("/returns", async (c) => {
  const { from, to } = range(c.req.query());
  return c.json({ from, to, ...(await returnsData(tenantDb(c.env.DB, c.var.tenant.id), from, to)) });
});

reportRoutes.get("/:file{[a-z]+\\.csv}", async (c) => {
  const kind = c.req.param("file").replace(/\.csv$/, "") as CsvKind;
  if (!CSV_KINDS.includes(kind)) throw new ApiError(404, "NOT_FOUND");
  const q = c.req.query();
  return csvResponse(`${kind}.csv`, await buildCsvRows(tenantDb(c.env.DB, c.var.tenant.id), kind, q.from || undefined, q.to || undefined));
});
