import { describe, it, expect } from "vitest";
import { call, json, makeClient, makeOrder, makeProduct, setStatus, testEnv } from "./helpers";

const stockOf = async (variantId: string) =>
  (await testEnv.DB.prepare("SELECT stock FROM product_variants WHERE id=?").bind(variantId).first<{ stock: number }>())!.stock;

describe("orders", () => {
  it("numbers start at 1001 per tenant and totals are computed with snapshots", async () => {
    const A = await makeClient();
    const B = await makeClient();
    const p = await makeProduct(A.cookie, { price: 225000, sale_price: 199000 });
    const o1 = await makeOrder(A.cookie, [{ variant_id: p.variants[0].id, qty: 2 }], { discount: 5000 });
    const o2 = await makeOrder(A.cookie, [{ variant_id: p.variants[0].id, qty: 1 }]);
    expect([o1.number, o2.number]).toEqual([1001, 1002]);
    expect(o1.subtotal).toBe(398000);
    expect(o1.total).toBe(398000 + 6000 - 5000);
    expect(o1.items[0]).toMatchObject({ unit_price: 199000, qty: 2, name_snapshot: "নেভি পাঞ্জাবি — L" });
    expect(o1.status).toBe("new");
    const pb = await makeProduct(B.cookie);
    expect((await makeOrder(B.cookie, [{ variant_id: pb.variants[0].id, qty: 1 }])).number).toBe(1001);
  });

  it("rejects another tenant's variant and invalid transitions", async () => {
    const A = await makeClient();
    const B = await makeClient();
    const pb = await makeProduct(B.cookie);
    const r = await call("/api/orders", { method: "POST", cookie: A.cookie, json: { customer: { name: "x", phone: "01700000000" }, items: [{ variant_id: pb.variants[0].id, qty: 1 }] } });
    expect(r.status).toBe(400);
    const p = await makeProduct(A.cookie);
    const o = await makeOrder(A.cookie, [{ variant_id: p.variants[0].id, qty: 1 }]);
    const bad = await setStatus(A.cookie, o.id, "shipped");
    expect(bad.status).toBe(400);
    expect((await json(bad)).code).toBe("VALIDATION");
  });

  it("confirm reduces stock; cancel restores it", async () => {
    const c = await makeClient();
    const p = await makeProduct(c.cookie, { variants: [{ label: "L", stock: 5 }] });
    const v = p.variants[0].id;
    const o = await makeOrder(c.cookie, [{ variant_id: v, qty: 2 }]);
    expect(await stockOf(v)).toBe(5);
    expect((await setStatus(c.cookie, o.id, "confirmed")).status).toBe(200);
    expect(await stockOf(v)).toBe(3);
    expect((await setStatus(c.cookie, o.id, "packed")).status).toBe(200);
    expect((await setStatus(c.cookie, o.id, "cancelled")).status).toBe(200);
    expect(await stockOf(v)).toBe(5);
  });

  it("two confirmations for the last unit: second is OUT_OF_STOCK and stays new", async () => {
    const c = await makeClient();
    const p = await makeProduct(c.cookie, { variants: [{ label: "L", stock: 1 }] });
    const v = p.variants[0].id;
    const o1 = await makeOrder(c.cookie, [{ variant_id: v, qty: 1 }]);
    const o2 = await makeOrder(c.cookie, [{ variant_id: v, qty: 1 }]);
    const [r1, r2] = await Promise.all([setStatus(c.cookie, o1.id, "confirmed"), setStatus(c.cookie, o2.id, "confirmed")]);
    const codes = [r1.status, r2.status].sort();
    expect(codes).toEqual([200, 409]);
    const loser = r1.status === 409 ? r1 : r2;
    expect((await json(loser)).code).toBe("OUT_OF_STOCK");
    expect(await stockOf(v)).toBe(0);
    const loserId = r1.status === 409 ? o1.id : o2.id;
    expect((await json(await call(`/api/orders/${loserId}`, { cookie: c.cookie }))).order.status).toBe("new");
  });

  it("multi-item confirm is all-or-nothing", async () => {
    const c = await makeClient();
    const p = await makeProduct(c.cookie, { variants: [{ label: "S", stock: 5 }, { label: "M", stock: 0 }] });
    const o = await makeOrder(c.cookie, [{ variant_id: p.variants[0].id, qty: 2 }, { variant_id: p.variants[1].id, qty: 1 }]);
    expect((await setStatus(c.cookie, o.id, "confirmed")).status).toBe(409);
    expect(await stockOf(p.variants[0].id)).toBe(5);
  });

  it("shipping stores courier and tracking; returns restock only when good", async () => {
    const c = await makeClient();
    const p = await makeProduct(c.cookie, { variants: [{ label: "L", stock: 10 }] });
    const v = p.variants[0].id;
    const run = async (cond: string) => {
      const o = await makeOrder(c.cookie, [{ variant_id: v, qty: 1 }]);
      for (const s of ["confirmed", "packed"]) await setStatus(c.cookie, o.id, s);
      const sh = await json(await setStatus(c.cookie, o.id, "shipped", { courier: "Steadfast", tracking_number: "STD-1" }));
      expect(sh.order).toMatchObject({ courier: "Steadfast", tracking_number: "STD-1", status: "shipped" });
      expect((await setStatus(c.cookie, o.id, "returned")).status).toBe(400); // condition required
      expect((await setStatus(c.cookie, o.id, "returned", { return_condition: cond })).status).toBe(200);
    };
    await run("good");
    expect(await stockOf(v)).toBe(10);
    await run("damaged");
    expect(await stockOf(v)).toBe(9);
  });

  it("customer is matched by phone across orders and totals follow status", async () => {
    const c = await makeClient();
    const p = await makeProduct(c.cookie, { price: 100000, variants: [{ label: "L", stock: 10 }] });
    const v = p.variants[0].id;
    const o1 = await makeOrder(c.cookie, [{ variant_id: v, qty: 1 }], { delivery_charge: 0, customer: { name: "করিম", phone: "+8801812345678" } });
    const o2 = await makeOrder(c.cookie, [{ variant_id: v, qty: 1 }], { delivery_charge: 0, customer: { name: "করিম ভাই", phone: "01812345678" } });
    expect(o1.customer_id).toBe(o2.customer_id);
    for (const s of ["confirmed", "packed", "shipped", "delivered"]) await setStatus(c.cookie, o1.id, s);
    await setStatus(c.cookie, o2.id, "cancelled");
    const cust = (await json(await call(`/api/customers/${o1.customer_id}`, { cookie: c.cookie }))).customer;
    expect(cust.total_orders).toBe(1);
    expect(cust.total_spent).toBe(100000);
    expect(cust.orders.length).toBe(2);
    const tagged = await call(`/api/customers/${o1.customer_id}`, { method: "PATCH", cookie: c.cookie, json: { tags: ["VIP"] } });
    expect((await json(tagged)).customer.tags).toEqual(["VIP"]);
    expect((await json(await call("/api/customers?tag=VIP", { cookie: c.cookie }))).customers.length).toBe(1);
  });

  it("lists with filters and saves notification settings", async () => {
    const c = await makeClient();
    const p = await makeProduct(c.cookie);
    const o = await makeOrder(c.cookie, [{ variant_id: p.variants[0].id, qty: 1 }]);
    await setStatus(c.cookie, o.id, "confirmed");
    await makeOrder(c.cookie, [{ variant_id: p.variants[0].id, qty: 1 }]);
    const list = await json(await call("/api/orders?status=confirmed", { cookie: c.cookie }));
    expect(list.orders.map((x: any) => x.number)).toEqual([1001]);
    expect((await json(await call("/api/orders?q=1002", { cookie: c.cookie }))).orders.length).toBe(1);
    const s = await call("/api/orders/settings/notifications", { method: "PUT", cookie: c.cookie, json: { on_confirmed: false, on_shipped: true } });
    expect(await json(s)).toEqual({ on_confirmed: false, on_shipped: true });
  });

  it("order creation counts usage", async () => {
    const c = await makeClient();
    const p = await makeProduct(c.cookie);
    await makeOrder(c.cookie, [{ variant_id: p.variants[0].id, qty: 1 }]);
    const u = await testEnv.DB.prepare("SELECT orders FROM usage_monthly WHERE tenant_id=?").bind(c.tenantId).first<any>();
    expect(u.orders).toBe(1);
  });
});
