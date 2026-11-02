import { describe, it, expect } from "vitest";
import { call, json, makeAgency, makeClient, testEnv, uniq } from "./helpers";
import { tenantDb, ID_TABLES } from "../src/lib/db";

describe("route guards", () => {
  it("client cannot reach admin routes", async () => {
    const c = await makeClient();
    const r = await call("/api/admin/clients", { cookie: c.cookie });
    expect(r.status).toBe(403);
    expect((await json(r)).code).toBe("FORBIDDEN");
  });
  it("agency cannot reach client routes", async () => {
    const a = await makeAgency();
    const r = await call("/api/client/ping", { cookie: a.cookie });
    expect(r.status).toBe(403);
  });
  it("no session is 401", async () => {
    expect((await call("/api/client/ping")).status).toBe(401);
  });
  it("suspended tenant's live session gets ACCOUNT_SUSPENDED", async () => {
    const c = await makeClient();
    expect((await call("/api/client/ping", { cookie: c.cookie })).status).toBe(200);
    await testEnv.DB.prepare("UPDATE tenants SET status='suspended' WHERE id=?").bind(c.tenantId).run();
    const r = await call("/api/client/ping", { cookie: c.cookie });
    expect(r.status).toBe(403);
    expect((await json(r)).code).toBe("ACCOUNT_SUSPENDED");
  });
  it("deleted tenant is 401", async () => {
    const c = await makeClient({ status: "deleted" });
    expect((await call("/api/client/ping", { cookie: c.cookie })).status).toBe(401);
  });
  it("disabled feature is FEATURE_DISABLED", async () => {
    const c = await makeClient({ features: ["inbox"] });
    expect((await call("/api/test/feature/inbox", { cookie: c.cookie })).status).toBe(200);
    const r = await call("/api/test/feature/orders", { cookie: c.cookie });
    expect(r.status).toBe(403);
    expect((await json(r)).code).toBe("FEATURE_DISABLED");
  });
});

/** Minimal valid row per id-table, with tenant_id filled by insert(). */
function sampleRow(table: string, parents: { product: string; order: string }): Record<string, unknown> {
  const now = new Date().toISOString();
  const id = uniq("r");
  const rows: Record<string, Record<string, unknown>> = {
    engine_jobs: { id, command: "noop", next_attempt_at: now, created_at: now },
    faqs: { id, question: "q", answer: "a", created_at: now },
    unanswered_questions: { id, normalized_text: id, sample_text: "q", last_asked_at: now },
    conversation_state: { id, engine_conversation_id: id, state: "open" },
    quick_replies: { id, title: "t", body: "b" },
    products: { id, code: id, price: 100, created_at: now },
    product_variants: { id, product_id: parents.product, label: "L", stock: 1 },
    product_images: { id, product_id: parents.product, r2_key: "k" },
    customers: { id, name: "n", created_at: now },
    orders: { id, number: Math.floor(Math.random() * 1e9), source: "manual", subtotal: 0, total: 0, created_at: now },
    order_items: { id, order_id: parents.order, name_snapshot: "x", unit_price: 1, qty: 1 },
    followup_rules: { id, type: "win_back", delay_minutes: 1, message_template: "m" },
    broadcasts: { id, audience: "{}", message: "m", scheduled_for: now, created_at: now },
    followup_sends: { id, customer_id: "c", channel: "website", scheduled_for: now },
    knowledge_sources: { id, kind: "text", title: "t", added_by: "client", created_at: now, updated_at: now },
  };
  if (!rows[table]) throw new Error("no sample for " + table);
  return rows[table];
}

describe("tenantDb isolation", () => {
  it("tenant A can never read/update/delete tenant B rows, for every table", async () => {
    const A = await makeClient();
    const B = await makeClient();
    const bdb = tenantDb(testEnv.DB, B.tenantId);
    const parents = { product: uniq("p"), order: uniq("o") };
    const now = new Date().toISOString();
    await bdb.insert("products", { id: parents.product, code: parents.product, price: 1, created_at: now });
    await bdb.insert("orders", { id: parents.order, number: 1, source: "manual", subtotal: 0, total: 0, created_at: now });
    for (const table of ID_TABLES) {
      const row = sampleRow(table, parents);
      await tenantDb(testEnv.DB, B.tenantId).insert(table, row);
      const a = tenantDb(testEnv.DB, A.tenantId);
      expect(await a.get(table, row.id as string), table).toBeNull();
      expect(await a.update(table, row.id as string, {}), table).toBe(0);
      expect(await a.del(table, row.id as string), table).toBe(0);
      expect(await tenantDb(testEnv.DB, B.tenantId).get(table, row.id as string), table).not.toBeNull();
    }
  });
  it("raw queries without tenant_id throw", async () => {
    const A = await makeClient();
    const a = tenantDb(testEnv.DB, A.tenantId);
    await expect(a.all("SELECT * FROM products")).rejects.toThrow();
    await expect(a.all("SELECT * FROM products WHERE tenant_id=?1")).resolves.toEqual([]);
  });
});
