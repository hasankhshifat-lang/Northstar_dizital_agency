import type { TenantDb } from "../lib/db";
import { returnsData } from "./routes";

export const CSV_KINDS = ["orders", "products", "customers", "returns"] as const;
export type CsvKind = (typeof CSV_KINDS)[number];
type Rows = (string | number | null | undefined)[][];
const t2 = (p: number) => (p / 100).toFixed(2);

/** Rows (header first) for each downloadable/backup CSV. */
export async function buildCsvRows(tdb: TenantDb, kind: CsvKind, from = "0000", to = "9999"): Promise<Rows> {
  if (kind === "orders") {
    const rows = await tdb.all<any>(
      `SELECT o.*, cu.name AS customer_name, cu.phones AS phones,
         (SELECT group_concat(i.name_snapshot || ' x' || i.qty, '; ') FROM order_items i WHERE i.order_id=o.id) AS items
       FROM orders o LEFT JOIN customers cu ON cu.id=o.customer_id WHERE o.tenant_id=?1 AND o.created_at BETWEEN ?2 AND ?3 ORDER BY o.number`, from, to,
    );
    return ([
      ["number", "date", "customer", "phone", "address", "status", "items", "subtotal", "delivery_charge", "discount", "total", "payment_method", "payment_status", "courier", "tracking_number", "source"],
      ...rows.map((o) => [o.number, o.created_at, o.customer_name, JSON.parse(o.phones ?? "[]")[0], o.address, o.status, o.items, t2(o.subtotal), t2(o.delivery_charge), t2(o.discount), t2(o.total), o.payment_method, o.payment_status, o.courier, o.tracking_number, o.source]),
    ]);
  }
  if (kind === "products") {
    const rows = await tdb.all<any>(
      `SELECT p.*, v.label, v.stock FROM products p LEFT JOIN product_variants v ON v.product_id=p.id WHERE p.tenant_id=?1 ORDER BY p.code, v.rowid`,
    );
    return ([
      ["code", "name_bn", "name_en", "category", "price", "sale_price", "variant", "stock", "description", "status"],
      ...rows.map((p) => [p.code, p.name_bn, p.name_en, p.category, t2(p.price), p.sale_price == null ? "" : t2(p.sale_price), p.label, p.stock, p.description, p.status]),
    ]);
  }
  if (kind === "customers") {
    const rows = await tdb.all<any>("SELECT * FROM customers WHERE tenant_id=?1 ORDER BY created_at");
    return ([
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
    return ([
      ["order_number", "returned_at", "condition", "customer", "item", "qty"],
      ...rows.map((r) => [r.number, r.returned_at, r.return_condition, r.customer, r.name_snapshot, r.qty]),
      [],
      ["condition", "count", "percent"],
      ...summary.by_condition.map((b) => [b.condition, b.count, b.pct]),
    ]);
  }
  throw new Error("unknown csv kind " + kind);
}
