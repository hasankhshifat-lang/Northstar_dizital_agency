import { describe, it, expect } from "vitest";
import { call, json, makeClientWithEngine, makeOrder, makeProduct, webhook } from "./helpers";

describe("client home", () => {
  it("returns stats only for enabled features", async () => {
    const c = await makeClientWithEngine();
    const p = await makeProduct(c.cookie, { variants: [{ label: "L", stock: 1 }] });
    await makeOrder(c.cookie, [{ variant_id: p.variants[0].id, qty: 1 }]);
    await webhook({ type: "question.unanswered", tenant_id: c.tenantId, text: "রবিবার খোলা?" });
    const h = await json(await call("/api/client/home", { cookie: c.cookie }));
    expect(h.orders_today).toBe(1);
    expect(h.waiting).toBeGreaterThan(0);
    expect(h.alerts.unanswered).toBe(1);
    expect(h.alerts.low_stock).toBe(1);
    const only = await makeClientWithEngine({ features: ["inbox"] });
    const h2 = await json(await call("/api/client/home", { cookie: only.cookie }));
    expect(h2.orders_today).toBeUndefined();
    expect(h2.alerts.unanswered).toBeUndefined();
    expect(h2.waiting).toBeGreaterThan(0);
  });
});
