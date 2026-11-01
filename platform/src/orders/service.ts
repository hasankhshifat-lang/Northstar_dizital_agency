import type { Env } from "../env";
import { productName } from "../catalog/service";
import { newId } from "../lib/crypto";
import { tenantDb, type TenantDb } from "../lib/db";
import { ApiError } from "../lib/errors";
import { nowIso } from "../lib/time";
import { bumpUsage } from "../usage";
import { refreshCustomerTotals, upsertCustomer } from "./customers";

export type OrderStatus = "new" | "confirmed" | "packed" | "shipped" | "delivered" | "cancelled" | "returned";
export type ReturnCondition = "good" | "in_transit" | "damaged" | "unknown";

export const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  new: ["confirmed", "cancelled"],
  confirmed: ["packed", "cancelled"],
  packed: ["shipped", "cancelled"],
  shipped: ["delivered", "returned"],
  delivered: ["returned"],
  cancelled: [],
  returned: [],
};

export interface OrderItem { id: string; product_id: string | null; variant_id: string | null; name_snapshot: string; unit_price: number; qty: number }
export interface Order {
  id: string; number: number; customer_id: string | null; source: "ai" | "inbox" | "manual"; status: OrderStatus;
  subtotal: number; delivery_charge: number; discount: number; total: number; payment_method: string; payment_status: string;
  address: string | null; courier: string | null; tracking_number: string | null; notes: string | null; return_condition: ReturnCondition | null;
  conversation_id: string | null; channel: string | null; created_at: string;
  confirmed_at: string | null; packed_at: string | null; shipped_at: string | null; delivered_at: string | null; cancelled_at: string | null; returned_at: string | null;
  items: OrderItem[];
  customer?: { id: string; name: string; phones: string[] } | null;
}

export interface CreateOrderInput {
  customer: { id?: string; name: string; phone?: string | null; address?: string | null; engineRef?: string | null };
  items: { variant_id: string; qty: number }[];
  delivery_charge?: number;
  discount?: number;
  payment_method?: string;
  payment_status?: string;
  notes?: string | null;
  source: Order["source"];
  conversation_id?: string | null;
  channel?: string | null;
}

export type OrderEvent =
  | { type: "created"; order: Order }
  | { type: "status"; order: Order; from: OrderStatus; to: OrderStatus };

/** Other modules (notifications, follow-ups) subscribe here. Hook failures never break the order flow. */
export const orderHooks: ((env: Env, tenantId: string, e: OrderEvent) => Promise<void>)[] = [];

async function fireHooks(env: Env, tenantId: string, e: OrderEvent) {
  for (const h of orderHooks) {
    try { await h(env, tenantId, e); } catch (err) { console.error("order hook failed", err); }
  }
}

const invalid = (message: string, path: (string | number)[] = []) => new ApiError(400, "VALIDATION", { issues: [{ path, message }] });

export async function loadOrder(tdb: TenantDb, id: string): Promise<Order | null> {
  const o = await tdb.first<Order>("SELECT * FROM orders WHERE tenant_id=?1 AND id=?2", id);
  if (!o) return null;
  const items = await tdb.all<OrderItem>("SELECT id, product_id, variant_id, name_snapshot, unit_price, qty FROM order_items WHERE tenant_id=?1 AND order_id=?2 ORDER BY rowid", id);
  const cust = o.customer_id ? await tdb.first<{ id: string; name: string; phones: string }>("SELECT id, name, phones FROM customers WHERE tenant_id=?1 AND id=?2", o.customer_id) : null;
  return { ...o, items, customer: cust ? { id: cust.id, name: cust.name, phones: JSON.parse(cust.phones) } : null };
}

export async function createOrder(env: Env, tenantId: string, input: CreateOrderInput): Promise<Order> {
  const tdb = tenantDb(env.DB, tenantId);
  if (!input.items.length) throw invalid("At least one item", ["items"]);
  const lines: Omit<OrderItem, "id">[] = [];
  for (const [i, it] of input.items.entries()) {
    if (!Number.isInteger(it.qty) || it.qty < 1) throw invalid("Quantity must be at least 1", ["items", i, "qty"]);
    const v = await tdb.first<{ id: string; label: string; product_id: string; code: string; name_bn: string | null; name_en: string | null; price: number; sale_price: number | null }>(
      `SELECT v.id, v.label, v.product_id, p.code, p.name_bn, p.name_en, p.price, p.sale_price
       FROM product_variants v JOIN products p ON p.id=v.product_id AND p.tenant_id=v.tenant_id
       WHERE v.tenant_id=?1 AND v.id=?2`, it.variant_id,
    );
    if (!v) throw invalid("Unknown product variant", ["items", i, "variant_id"]);
    const name = productName(v) + (v.label && v.label !== "Default" ? ` — ${v.label}` : "");
    lines.push({ product_id: v.product_id, variant_id: v.id, name_snapshot: name, unit_price: v.sale_price ?? v.price, qty: it.qty });
  }
  const customer = input.customer.id
    ? await tdb.get<{ id: string }>("customers", input.customer.id).then((c) => { if (!c) throw invalid("Unknown customer", ["customer", "id"]); return c; })
    : await upsertCustomer(tdb, input.customer);
  const subtotal = lines.reduce((s, l) => s + l.unit_price * l.qty, 0);
  const delivery = Math.max(0, input.delivery_charge ?? 0);
  const discount = Math.max(0, input.discount ?? 0);
  const total = Math.max(0, subtotal + delivery - discount);
  const counter = await tdb.first<{ n: number }>("UPDATE tenant_counters SET next_order_number = next_order_number + 1 WHERE tenant_id=?1 RETURNING next_order_number - 1 AS n");
  if (!counter) throw new Error("tenant counter missing");
  const id = newId();
  await env.DB.batch([
    tdb.insertStmt("orders", {
      id, number: counter.n, customer_id: customer.id, source: input.source, status: "new", subtotal, delivery_charge: delivery, discount, total,
      payment_method: input.payment_method ?? "cod", payment_status: input.payment_status ?? "unpaid", address: input.customer.address ?? null,
      notes: input.notes ?? null, conversation_id: input.conversation_id ?? null, channel: input.channel ?? null, created_at: nowIso(),
    }),
    ...lines.map((l) => tdb.insertStmt("order_items", { id: newId(), order_id: id, ...l })),
  ]);
  await refreshCustomerTotals(tdb, customer.id);
  await bumpUsage(env.DB, tenantId, "orders");
  const order = (await loadOrder(tdb, id))!;
  await fireHooks(env, tenantId, { type: "created", order });
  return order;
}

export async function changeStatus(
  env: Env, tenantId: string, orderId: string, to: OrderStatus,
  opts: { courier?: string | null; tracking_number?: string | null; return_condition?: ReturnCondition | null; payment_status?: string } = {},
): Promise<Order> {
  const tdb = tenantDb(env.DB, tenantId);
  const order = await loadOrder(tdb, orderId);
  if (!order) throw new ApiError(404, "NOT_FOUND");
  const from = order.status;
  if (!TRANSITIONS[from].includes(to)) throw invalid(`Cannot change status from ${from} to ${to}`, ["to"]);
  if (to === "returned" && !opts.return_condition) throw invalid("Return condition is required", ["return_condition"]);
  const stamp = nowIso();
  const patch: Record<string, unknown> = { status: to, [`${to}_at`]: stamp };
  if (to === "shipped") { patch.courier = opts.courier ?? order.courier; patch.tracking_number = opts.tracking_number ?? order.tracking_number; }
  if (to === "returned") patch.return_condition = opts.return_condition;
  if (to === "delivered" && order.payment_method === "cod") patch.payment_status = "paid";
  if (opts.payment_status) patch.payment_status = opts.payment_status;

  const cols = Object.keys(patch);
  // Guarded update: only applies if the order is still in `from` (protects against concurrent changes).
  const statusStmt = env.DB.prepare(`UPDATE orders SET ${cols.map((c, i) => `${c}=?${i + 4}`).join(",")} WHERE tenant_id=?1 AND id=?2 AND status=?3`)
    .bind(tenantId, orderId, from, ...cols.map((c) => patch[c] ?? null));
  const stockItems = order.items.filter((i) => i.variant_id);
  const stockStmts: D1PreparedStatement[] = [];
  const takeStock = to === "confirmed";
  const restock = (to === "cancelled" && (from === "confirmed" || from === "packed")) || (to === "returned" && opts.return_condition === "good");
  if (takeStock || restock) {
    const sign = takeStock ? "-" : "+";
    for (const it of stockItems) {
      // Applies only when this batch actually moved the order (status + stamp match), so a lost race never touches stock.
      stockStmts.push(env.DB.prepare(
        `UPDATE product_variants SET stock = stock ${sign} ?3 WHERE tenant_id=?1 AND id=?2
         AND EXISTS (SELECT 1 FROM orders WHERE tenant_id=?1 AND id=?4 AND status=?5 AND ${to}_at=?6)`,
      ).bind(tenantId, it.variant_id, it.qty, orderId, to, stamp));
    }
  }
  let results: D1Result[];
  try {
    results = await env.DB.batch([statusStmt, ...stockStmts]);
  } catch (e) {
    // CHECK (stock >= 0) aborts the whole batch atomically.
    if (String(e).includes("CHECK constraint failed")) throw new ApiError(409, "OUT_OF_STOCK");
    throw e;
  }
  if (!results[0].meta.changes) throw invalid("Order was changed by someone else, please reload", ["to"]);
  await refreshCustomerTotals(tdb, order.customer_id);
  const updated = (await loadOrder(tdb, orderId))!;
  await fireHooks(env, tenantId, { type: "status", order: updated, from, to });
  return updated;
}
