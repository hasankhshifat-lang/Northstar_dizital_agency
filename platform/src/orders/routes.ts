import { Hono } from "hono";
import { z } from "zod";
import type { AppEnv } from "../env";
import { clientGroup } from "../auth/middleware";
import { tenantDb } from "../lib/db";
import { ApiError } from "../lib/errors";
import { parseBody } from "../lib/validate";
import { parseCustomer } from "./customers";
import { changeStatus, createOrder, loadOrder, type OrderStatus } from "./service";
import { renderInvoice } from "../public/routes";

export const orderRoutes = new Hono<AppEnv>();
orderRoutes.use("*", ...clientGroup("orders"));

const STATUSES = ["new", "confirmed", "packed", "shipped", "delivered", "cancelled", "returned"] as const;

orderRoutes.get("/", async (c) => {
  const tdb = tenantDb(c.env.DB, c.var.tenant.id);
  const { status, q, from, to } = c.req.query();
  const where: string[] = [];
  const binds: unknown[] = [];
  const add = (sql: string, v: unknown) => { binds.push(v); where.push(sql.replaceAll("?", `?${binds.length + 1}`)); };
  if (status) add("o.status = ?", status);
  if (from) add("o.created_at >= ?", from);
  if (to) add("o.created_at <= ?", to);
  if (q) {
    if (/^\d+$/.test(q.trim())) add("(o.number = CAST(? AS INTEGER) OR cu.phones LIKE '%' || ? || '%')", q.trim());
    else add("(cu.name LIKE '%' || ? || '%')", q.trim());
  }
  const rows = await tdb.all(
    `SELECT o.*, cu.name AS customer_name, cu.phones AS customer_phones,
       (SELECT COUNT(*) FROM order_items i WHERE i.order_id=o.id) AS item_count
     FROM orders o LEFT JOIN customers cu ON cu.id=o.customer_id
     WHERE o.tenant_id=?1 ${where.length ? "AND " + where.join(" AND ") : ""}
     ORDER BY o.number DESC LIMIT 500`, ...binds,
  );
  const counts = await tdb.all<{ status: string; n: number }>("SELECT status, COUNT(*) AS n FROM orders WHERE tenant_id=?1 GROUP BY status");
  return c.json({ orders: rows, counts: Object.fromEntries(counts.map((r) => [r.status, r.n])) });
});

orderRoutes.post("/", async (c) => {
  const body = await parseBody(c, z.object({
    customer: z.object({ id: z.string().optional(), name: z.string().trim().min(1).max(120), phone: z.string().trim().max(30).nullish(), address: z.string().trim().max(500).nullish() }),
    items: z.array(z.object({ variant_id: z.string(), qty: z.number().int().min(1).max(1000) })).min(1).max(50),
    delivery_charge: z.number().int().min(0).default(0),
    discount: z.number().int().min(0).default(0),
    payment_method: z.enum(["cod", "bkash", "nagad", "paid", "other"]).default("cod"),
    notes: z.string().max(1000).nullish(),
    source: z.enum(["inbox", "manual"]).default("manual"),
    conversation_id: z.string().nullish(),
    channel: z.string().nullish(),
  }));
  const order = await createOrder(c.env, c.var.tenant.id, {
    ...body, payment_status: body.payment_method === "paid" ? "paid" : "unpaid",
  });
  return c.json({ order });
});

orderRoutes.get("/settings/notifications", (c) =>
  c.json({ on_confirmed: !!c.var.tenant.notify_on_confirmed, on_shipped: !!c.var.tenant.notify_on_shipped }));

orderRoutes.put("/settings/notifications", async (c) => {
  const body = await parseBody(c, z.object({ on_confirmed: z.boolean(), on_shipped: z.boolean() }));
  await c.env.DB.prepare("UPDATE tenants SET notify_on_confirmed=?, notify_on_shipped=? WHERE id=?").bind(body.on_confirmed ? 1 : 0, body.on_shipped ? 1 : 0, c.var.tenant.id).run();
  return c.json(body);
});

orderRoutes.get("/:id", async (c) => {
  const o = await loadOrder(tenantDb(c.env.DB, c.var.tenant.id), c.req.param("id"));
  if (!o) throw new ApiError(404, "NOT_FOUND");
  return c.json({ order: o });
});

orderRoutes.get("/:id/invoice", async (c) => {
  const o = await loadOrder(tenantDb(c.env.DB, c.var.tenant.id), c.req.param("id"));
  if (!o) throw new ApiError(404, "NOT_FOUND");
  return c.html(renderInvoice(o, c.var.tenant));
});

orderRoutes.post("/:id/status", async (c) => {
  const body = await parseBody(c, z.object({
    to: z.enum(STATUSES),
    courier: z.string().trim().max(60).nullish(),
    tracking_number: z.string().trim().max(80).nullish(),
    return_condition: z.enum(["good", "in_transit", "damaged", "unknown"]).nullish(),
    payment_status: z.enum(["unpaid", "paid"]).optional(),
  }));
  const order = await changeStatus(c.env, c.var.tenant.id, c.req.param("id"), body.to as OrderStatus, body);
  return c.json({ order });
});

export const customerRoutes = new Hono<AppEnv>();
customerRoutes.use("*", ...clientGroup("orders"));

customerRoutes.get("/", async (c) => {
  const tdb = tenantDb(c.env.DB, c.var.tenant.id);
  const { q, tag } = c.req.query();
  const where: string[] = [];
  const binds: unknown[] = [];
  if (q) { binds.push(`%${q.trim()}%`); where.push(`(name LIKE ?${binds.length + 1} OR phones LIKE ?${binds.length + 1})`); }
  if (tag) { binds.push(`%${JSON.stringify(tag)}%`); where.push(`tags LIKE ?${binds.length + 1}`); }
  const rows = await tdb.all(`SELECT * FROM customers WHERE tenant_id=?1 ${where.length ? "AND " + where.join(" AND ") : ""} ORDER BY COALESCE(last_order_at, created_at) DESC LIMIT 500`, ...binds);
  return c.json({ customers: rows.map(parseCustomer) });
});

customerRoutes.get("/:id", async (c) => {
  const tdb = tenantDb(c.env.DB, c.var.tenant.id);
  const row = await tdb.get("customers", c.req.param("id"));
  if (!row) throw new ApiError(404, "NOT_FOUND");
  const orders = await tdb.all("SELECT id, number, status, total, created_at FROM orders WHERE tenant_id=?1 AND customer_id=?2 ORDER BY number DESC", row.id);
  return c.json({ customer: { ...parseCustomer(row), orders } });
});

customerRoutes.patch("/:id", async (c) => {
  const tdb = tenantDb(c.env.DB, c.var.tenant.id);
  const body = await parseBody(c, z.object({ name: z.string().trim().min(1).max(120).optional(), tags: z.array(z.string().trim().min(1).max(40)).max(20).optional() }));
  if (!(await tdb.update("customers", c.req.param("id"), body))) throw new ApiError(404, "NOT_FOUND");
  const row = await tdb.get("customers", c.req.param("id"));
  return c.json({ customer: parseCustomer(row) });
});
