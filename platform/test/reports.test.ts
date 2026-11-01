import { describe, it, expect } from "vitest";
import { call, json, makeClient, makeOrder, makeProduct, setStatus, testEnv } from "./helpers";

async function seed() {
  const c = await makeClient();
  const p1 = await makeProduct(c.cookie, { price: 125000, name: "মাস্টার্ড কিডস ড্রেস", variants: [{ label: "S", stock: 50 }] });
  const p2 = await makeProduct(c.cookie, { price: 225000, name: "নেভি পাঞ্জাবি", variants: [{ label: "L", stock: 50 }] });
  const v1 = p1.variants[0].id, v2 = p2.variants[0].id;
  const o1 = await makeOrder(c.cookie, [{ variant_id: v1, qty: 2 }], { delivery_charge: 0 }); // 250000
  const o2 = await makeOrder(c.cookie, [{ variant_id: v2, qty: 1 }], { delivery_charge: 0 }); // 225000
  const o3 = await makeOrder(c.cookie, [{ variant_id: v1, qty: 1 }], { delivery_charge: 0 }); // cancelled
  const o4 = await makeOrder(c.cookie, [{ variant_id: v2, qty: 1 }], { delivery_charge: 0 }); // returned damaged
  const o5 = await makeOrder(c.cookie, [{ variant_id: v1, qty: 1 }], { delivery_charge: 0 }); // returned good
  await setStatus(c.cookie, o3.id, "cancelled");
  for (const o of [o1, o4, o5]) for (const s of ["confirmed", "packed", "shipped"]) await setStatus(c.cookie, o.id, s);
  await setStatus(c.cookie, o1.id, "delivered");
  await setStatus(c.cookie, o4.id, "returned", { return_condition: "damaged" });
  await setStatus(c.cookie, o5.id, "returned", { return_condition: "good" });
  return { c, p1, p2 };
}

describe("reports", () => {
  it("summary totals match seeded orders", async () => {
    const { c } = await seed();
    const s = await json(await call("/api/reports/summary", { cookie: c.cookie }));
    const sum = s.sales_by_day.reduce((a: number, d: any) => a + d.total, 0);
    expect(sum).toBe(250000 + 225000 + 225000 + 125000); // non-cancelled
    expect(s.sales_by_day.reduce((a: number, d: any) => a + d.orders, 0)).toBe(4);
    expect(s.status_counts).toMatchObject({ new: 1, delivered: 1, cancelled: 1, returned: 2 });
    expect(s.top_products[0]).toMatchObject({ qty: 3 });
    expect(s.return_rate).toBeCloseTo(2 / 3, 3);
  });
  it("returns report percentages add up to 100", async () => {
    const { c } = await seed();
    const r = await json(await call("/api/reports/returns", { cookie: c.cookie }));
    expect(r.total).toBe(2);
    const pct = r.by_condition.reduce((a: number, x: any) => a + x.pct, 0);
    expect(pct).toBeCloseTo(100, 1);
    expect(r.by_condition.find((x: any) => x.condition === "good").count).toBe(1);
    expect(r.by_product.length).toBe(2);
  });
  it("CSV exports start with BOM and a header", async () => {
    const { c } = await seed();
    for (const kind of ["orders", "products", "customers", "returns"]) {
      const res = await call(`/api/reports/${kind}.csv`, { cookie: c.cookie });
      expect(res.status, kind).toBe(200);
      expect(res.headers.get("content-type")).toContain("text/csv");
      const bytes = new Uint8Array(await res.arrayBuffer());
      expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]); // UTF-8 BOM (text() would strip it)
      const text = new TextDecoder().decode(bytes);
      expect(text.split("\r\n").length).toBeGreaterThan(2);
    }
    const orders = await (await call("/api/reports/orders.csv", { cookie: c.cookie })).text();
    expect(orders.split("\r\n")[0]).toContain("number");
  });
});

describe("public product page", () => {
  it("shows active products of active tenants only", async () => {
    const c = await makeClient();
    const slug = (await testEnv.DB.prepare("SELECT slug FROM tenants WHERE id=?").bind(c.tenantId).first<any>()).slug;
    const p = await makeProduct(c.cookie, { price: 125000, name: "মাস্টার্ড কিডস ড্রেস" });
    const hidden = await makeProduct(c.cookie, { status: "hidden" });
    let r = await call(`/p/${slug}/${p.code}`);
    expect(r.status).toBe(200);
    const html = await r.text();
    expect(html).toContain("৳1,250");
    expect(html).toContain("মাস্টার্ড কিডস ড্রেস");
    expect((await call(`/p/${slug}/${hidden.code}`)).status).toBe(404);
    await testEnv.DB.prepare("UPDATE tenants SET status='suspended' WHERE id=?").bind(c.tenantId).run();
    expect((await call(`/p/${slug}/${p.code}`)).status).toBe(404);
  });
  it("escapes HTML in product fields", async () => {
    const c = await makeClient();
    const slug = (await testEnv.DB.prepare("SELECT slug FROM tenants WHERE id=?").bind(c.tenantId).first<any>()).slug;
    const p = await makeProduct(c.cookie, { name: "<script>alert(1)</script>" });
    const html = await (await call(`/p/${slug}/${p.code}`)).text();
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });
});

describe("invoice", () => {
  it("renders printable HTML for the tenant's order only", async () => {
    const c = await makeClient();
    const other = await makeClient();
    const p = await makeProduct(c.cookie, { price: 125000 });
    const o = await makeOrder(c.cookie, [{ variant_id: p.variants[0].id, qty: 1 }]);
    const r = await call(`/api/orders/${o.id}/invoice`, { cookie: c.cookie });
    expect(r.status).toBe(200);
    expect(r.headers.get("content-type")).toContain("text/html");
    const html = await r.text();
    expect(html).toContain("#1001");
    expect(html).toContain("৳1,310"); // 1250 + 60 delivery
    expect((await call(`/api/orders/${o.id}/invoice`, { cookie: other.cookie })).status).toBe(404);
  });
});
