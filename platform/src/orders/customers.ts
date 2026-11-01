import type { TenantDb } from "../lib/db";
import { newId } from "../lib/crypto";
import { nowIso } from "../lib/time";

export interface Customer {
  id: string; name: string; phones: string[]; addresses: string[]; tags: string[]; engine_contact_refs: string[];
  total_orders: number; total_spent: number; last_order_at: string | null; created_at: string;
}

/** Normalize a Bangladeshi phone number to 01XXXXXXXXX where possible. */
export function normalizePhone(p: string | null | undefined): string | null {
  if (!p) return null;
  let d = p.replace(/\D/g, "");
  if (d.startsWith("880")) d = d.slice(2);
  else if (d.startsWith("88")) d = d.slice(2);
  return d.length >= 6 ? d : null;
}

export function parseCustomer(r: any): Customer {
  return { ...r, phones: JSON.parse(r.phones), addresses: JSON.parse(r.addresses), tags: JSON.parse(r.tags), engine_contact_refs: JSON.parse(r.engine_contact_refs) };
}

const addUnique = (list: string[], v: string | null | undefined) => (v && !list.includes(v) ? [...list, v] : list);

/** Find a customer by engine contact ref, then by phone; create one if none matches. Merges new phone/address/ref. */
export async function upsertCustomer(tdb: TenantDb, input: { name: string; phone?: string | null; address?: string | null; engineRef?: string | null }): Promise<Customer> {
  const phone = normalizePhone(input.phone);
  let row: any = null;
  if (input.engineRef) row = await tdb.first("SELECT * FROM customers WHERE tenant_id=?1 AND engine_contact_refs LIKE ?2", `%${JSON.stringify(input.engineRef)}%`);
  if (!row && phone) row = await tdb.first("SELECT * FROM customers WHERE tenant_id=?1 AND phones LIKE ?2", `%"${phone}"%`);
  if (row) {
    const c = parseCustomer(row);
    const patch = {
      phones: addUnique(c.phones, phone), addresses: addUnique(c.addresses, input.address?.trim() || null),
      engine_contact_refs: addUnique(c.engine_contact_refs, input.engineRef),
    };
    await tdb.update("customers", c.id, patch);
    return { ...c, ...patch };
  }
  const c: Customer = {
    id: newId(), name: input.name.trim() || phone || "Customer", phones: phone ? [phone] : [], addresses: input.address?.trim() ? [input.address.trim()] : [],
    tags: [], engine_contact_refs: input.engineRef ? [input.engineRef] : [], total_orders: 0, total_spent: 0, last_order_at: null, created_at: nowIso(),
  };
  await tdb.insert("customers", c as unknown as Record<string, unknown>);
  return c;
}

/** Recompute denormalized totals: orders = non-cancelled orders, spent = delivered (not returned) totals. */
export async function refreshCustomerTotals(tdb: TenantDb, customerId: string | null) {
  if (!customerId) return;
  await tdb.run(
    `UPDATE customers SET
       total_orders = (SELECT COUNT(*) FROM orders o WHERE o.tenant_id=?1 AND o.customer_id=?2 AND o.status != 'cancelled'),
       total_spent = (SELECT COALESCE(SUM(total),0) FROM orders o WHERE o.tenant_id=?1 AND o.customer_id=?2 AND o.status = 'delivered'),
       last_order_at = (SELECT MAX(created_at) FROM orders o WHERE o.tenant_id=?1 AND o.customer_id=?2)
     WHERE tenant_id=?1 AND id=?2`,
    customerId,
  );
}
