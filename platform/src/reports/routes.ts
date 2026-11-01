import { Hono } from "hono";
import type { AppEnv } from "../env";
import { clientGroup } from "../auth/middleware";
import { csvResponse } from "../lib/csv";
import { tenantDb, type TenantDb } from "../lib/db";
import { ApiError } from "../lib/errors";
import { addMinutes, dayKey, nowIso } from "../lib/time";

export const reportRoutes = new Hono<AppEnv>();
reportRoutes.use("*", ...clientGroup("orders"));

const range = (q: Record<string, string>) => ({ from: q.from || addMinutes(nowIso(), -30 * 24 * 60), to: q.to || nowIso() });
const t2 = (p: number) => (p / 100).toFixed(2);

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

async function returnsData(tdb: TenantDb, from: string, to: string) {
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
  const tdb = tenantDb(c.env.DB, c.var.tenant.id);
  const kind = c.req.param("file").replace(/\.csv$/, "");
  const q = c.req.query();
  const from = q.from || "0000";
  const to = q.to || "9999";
  if (kind === "orders") {
    const rows = await tdb.all<any>(
      `SELECT o.*, cu.name AS customer_name, cu.phones AS phones,
         (SELECT group_concat(i.name_snapshot || ' x' || i.qty, '; ') FROM order_items i WHERE i.order_id=o.id) AS items
       FROM orders o LEFT JOIN customers cu ON cu.id=o.customer_id WHERE o.tenant_id=?1 AND o.created_at BETWEEN ?2 AND ?3 ORDER BY o.number`, from, to,
    );
    return csvResponse("orders.csv", [
      ["number", "date", "customer", "phone", "address", "status", "items", "subtotal", "delivery_charge", "discount", "total", "payment_method", "payment_status", "courier", "tracking_number", "source"],
      ...rows.map((o) => [o.number, o.created_at, o.customer_name, JSON.parse(o.phones ?? "[]")[0], o.address, o.status, o.items, t2(o.subtotal), t2(o.delivery_charge), t2(o.discount), t2(o.total), o.payment_method, o.payment_status, o.courier, o.tracking_number, o.source]),
    ]);
  }
  if (kind === "products") {
    const rows = await tdb.all<any>(
      `SELECT p.*, v.label, v.stock FROM products p LEFT JOIN product_variants v ON v.product_id=p.id WHERE p.tenant_id=?1 ORDER BY p.code, v.rowid`,
    );
    return csvResponse("products.csv", [
      ["code", "name_bn", "name_en", "category", "price", "sale_price", "variant", "stock", "description", "status"],
      ...rows.map((p) => [p.code, p.name_bn, p.name_en, p.category, t2(p.price), p.sale_price == null ? "" : t2(p.sale_price), p.label, p.stock, p.description, p.status]),
    ]);
  }
  if (kind === "customers") {
    const rows = await tdb.all<any>("SELECT * FROM customers WHERE tenant_id=?1 ORDER BY created_at");
    return csvResponse("customers.csv", [
      ["name", "phones", "addresses", "tags", "total_orders", "total_spent", "last_order_at"],
      ...rows.map((r) => [r.name, JSON.parse(r.phones).join(" / "), JSON.parse(r.addresses).join(" / "), JSON.parse(r.tags).join(", "), r.total_orders, t2(r.total_spent), r.last_order_at]),
    ]);
  }
  if (kind === "returns") {
    const rows = await tdb.all<any>(
      `SELECT o.number, o.returned_at, o.return_condition, cu.name AS customer, i.name_snapshot, i.qty
       FROM orders o JOIN order_items i ON i.order_id=o.id LEFT JOIN customers cu ON cu.id=o.customer_id
       WHERE o.tenant_id=?1 AND o.status='returned' AND o.created_at BETWEEN ?2 AND ?3 ORDER BY o.number`, from, to,
    );
    const summary = await returnsData(tdb, from, to);
    return csvResponse("returns.csv", [
      ["order_number", "returned_at", "condition", "customer", "item", "qty"],
      ...rows.map((r) => [r.number, r.returned_at, r.return_condition, r.customer, r.name_snapshot, r.qty]),
      [],
      ["condition", "count", "percent"],
      ...summary.by_condition.map((b) => [b.condition, b.count, b.pct]),
    ]);
  }
  throw new ApiError(404, "NOT_FOUND");
});
