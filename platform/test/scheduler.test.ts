import { describe, it, expect } from "vitest";
import { call, json, makeClientWithEngine, makeProduct, testEnv, webhook } from "./helpers";
import { runScheduler } from "../src/followups/scheduler";
import { runMaintenance } from "../src/maintenance";
import { addMinutes } from "../src/lib/time";

const later = (min: number) => new Date(addMinutes(new Date(), min));
const send = (id: string) => testEnv.DB.prepare("SELECT * FROM followup_sends WHERE id=?").bind(id).first<any>();
const firstSend = (tenantId: string) => testEnv.DB.prepare("SELECT * FROM followup_sends WHERE tenant_id=? ORDER BY rowid LIMIT 1").bind(tenantId).first<any>();

async function enable(cookie: string, type: string, patch: Record<string, unknown> = {}) {
  const r = (await json(await call("/api/followups/rules", { cookie }))).rules.find((x: any) => x.type === type);
  await call(`/api/followups/rules/${r.id}`, { method: "PUT", cookie, json: { enabled: true, delay_minutes: r.delay_minutes, message_template: r.message_template, offer_text: "ফ্রি ডেলিভারি", ...patch } });
}

/** Client with a scheduled price_no_order follow-up on a messenger chat. */
async function withScheduled() {
  const c = await makeClientWithEngine();
  await enable(c.cookie, "price_no_order");
  const conv = (await json(await call("/api/inbox?tab=open", { cookie: c.cookie }))).conversations.find((x: any) => x.channel === "messenger");
  await webhook({ type: "message.in", tenant_id: c.tenantId, conversation_id: conv.id, channel: "messenger", customer: { name: "তানভীর", ref: conv.customerRef }, intent: "product_question" });
  const s = await firstSend(c.tenantId);
  return { ...c, conv, s };
}

describe("scheduler", () => {
  it("sends a due follow-up into the chat with rendered text and counts usage", async () => {
    const { tenantId, cookie, conv, s } = await withScheduled();
    // keep the 24h window open: inbound happened just now, run 3h later (< 24h)
    await runScheduler(testEnv, later(181));
    expect((await send(s.id)).status).toBe("sent");
    const msgs = (await json(await call(`/api/inbox/${conv.id}`, { cookie }))).conversation.messages;
    expect(msgs.at(-1).text).toContain("তানভীর");
    expect(msgs.at(-1).text).toContain("ফ্রি ডেলিভারি");
    const u = await testEnv.DB.prepare("SELECT outbound_messages FROM usage_monthly WHERE tenant_id=?").bind(tenantId).first<any>();
    expect(u.outbound_messages).toBe(1);
  });
  it("does not send before it is due", async () => {
    const { s } = await withScheduled();
    await runScheduler(testEnv, later(60));
    expect((await send(s.id)).status).toBe("scheduled");
  });
  it("skips suspended tenants", async () => {
    const { tenantId, s } = await withScheduled();
    await testEnv.DB.prepare("UPDATE tenants SET status='suspended' WHERE id=?").bind(tenantId).run();
    await runScheduler(testEnv, later(181));
    expect(await send(s.id)).toMatchObject({ status: "skipped", skip_reason: "ACCOUNT_SUSPENDED" });
  });
  it("skips when the feature is switched off after scheduling", async () => {
    const { tenantId, s } = await withScheduled();
    await testEnv.DB.prepare("UPDATE tenant_features SET enabled=0 WHERE tenant_id=? AND feature='followups'").bind(tenantId).run();
    await runScheduler(testEnv, later(181));
    expect(await send(s.id)).toMatchObject({ status: "skipped", skip_reason: "FEATURE_DISABLED" });
  });
  it("skips when the rule was switched off", async () => {
    const { tenantId, s } = await withScheduled();
    await testEnv.DB.prepare("UPDATE followup_rules SET enabled=0 WHERE tenant_id=?").bind(tenantId).run();
    await runScheduler(testEnv, later(181));
    expect(await send(s.id)).toMatchObject({ status: "skipped", skip_reason: "RULE_DISABLED" });
  });
  it("skips messenger sends outside the 24h window", async () => {
    const { s } = await withScheduled();
    await runScheduler(testEnv, later(25 * 60));
    expect(await send(s.id)).toMatchObject({ status: "skipped", skip_reason: "OUTSIDE_24H" });
  });
  it("marks failed after 3 engine failures", async () => {
    const { ref, s } = await withScheduled();
    await testEnv.DB.prepare("UPDATE demo_workspaces SET fail_mode='down' WHERE ref=?").bind(ref).run();
    await runScheduler(testEnv, later(181));
    expect(await send(s.id)).toMatchObject({ status: "scheduled", attempts: 1 });
    await runScheduler(testEnv, later(200));
    await runScheduler(testEnv, later(220));
    expect(await send(s.id)).toMatchObject({ status: "failed", attempts: 3 });
  });
});

describe("broadcasts", () => {
  async function setup() {
    const c = await makeClientWithEngine();
    const convs = (await json(await call("/api/inbox?tab=open", { cookie: c.cookie }))).conversations;
    const m = convs.find((x: any) => x.channel === "messenger");
    const ig = convs.find((x: any) => x.channel === "instagram");
    await webhook({ type: "message.in", tenant_id: c.tenantId, conversation_id: m.id, channel: "messenger", customer: { name: "A", ref: m.customerRef } });
    const old = await json(await webhook({ type: "message.in", tenant_id: c.tenantId, conversation_id: ig.id, channel: "instagram", customer: { name: "B", ref: ig.customerRef } }));
    await testEnv.DB.prepare("UPDATE customer_last_inbound SET last_inbound_at=? WHERE customer_id=?").bind(new Date(Date.now() - 48 * 3600_000).toISOString(), old.customer_id).run();
    await call(`/api/customers/${old.customer_id}`, { method: "PATCH", cookie: c.cookie, json: { tags: ["VIP"] } });
    return { ...c, m, ig, oldCustomer: old.customer_id };
  }
  it("preview counts recipients by channel and excludes customers outside the window", async () => {
    const c = await setup();
    const p = await json(await call("/api/broadcasts/preview", { method: "POST", cookie: c.cookie, json: { audience: { type: "tag", value: "VIP" } } }));
    expect(p.by_channel).toEqual({});
    expect(p.excluded).toEqual([{ reason: "OUTSIDE_24H", count: 1 }]);
    const p2 = await json(await call("/api/broadcasts/preview", { method: "POST", cookie: c.cookie, json: { audience: { type: "recent24h" } } }));
    expect(p2.by_channel).toEqual({ messenger: 1 });
  });
  it("send now delivers to eligible customers; results count orders within 3 days", async () => {
    const c = await setup();
    const prod = await makeProduct(c.cookie, { price: 100000 });
    const r = await call("/api/broadcasts", { method: "POST", cookie: c.cookie, json: { audience: { type: "recent24h" }, message: "আজ রাত ১১টা পর্যন্ত ফ্রি ডেলিভারি!", product_id: prod.id } });
    expect(r.status).toBe(200);
    const b = (await json(r)).broadcast;
    expect(b.status).toBe("sent");
    const msgs = (await json(await call(`/api/inbox/${c.m.id}`, { cookie: c.cookie }))).conversation.messages;
    expect(msgs.slice(-2).map((m: any) => m.kind)).toEqual(["text", "product"]);
    const s = await testEnv.DB.prepare("SELECT * FROM followup_sends WHERE broadcast_id=?").bind(b.id).first<any>();
    // customer orders 2 days after the send
    const order = (await json(await call("/api/orders", { method: "POST", cookie: c.cookie, json: { customer: { id: s.customer_id, name: "A" }, items: [{ variant_id: prod.variants[0].id, qty: 1 }] } }))).order;
    await testEnv.DB.prepare("UPDATE orders SET created_at=? WHERE id=?").bind(new Date(new Date(s.sent_at).getTime() + 2 * 86400_000).toISOString(), order.id).run();
    const res = await json(await call("/api/followups/results", { cookie: c.cookie }));
    const row = res.broadcasts.find((x: any) => x.id === b.id);
    expect(row).toMatchObject({ sent: 1, orders: 1, order_value: 100000 });
    expect((await json(await call("/api/broadcasts", { cookie: c.cookie }))).broadcasts[0].id).toBe(b.id);
  });
  it("scheduled broadcast waits until its time", async () => {
    const c = await setup();
    const at = addMinutes(new Date(), 60);
    const b = (await json(await call("/api/broadcasts", { method: "POST", cookie: c.cookie, json: { audience: { type: "recent24h" }, message: "অফার!", scheduled_for: at } }))).broadcast;
    expect(b.status).toBe("scheduled");
    await runScheduler(testEnv, later(30));
    expect((await testEnv.DB.prepare("SELECT status FROM broadcasts WHERE id=?").bind(b.id).first<any>()).status).toBe("scheduled");
    await runScheduler(testEnv, later(61));
    expect((await testEnv.DB.prepare("SELECT status FROM broadcasts WHERE id=?").bind(b.id).first<any>()).status).toBe("sent");
  });
});

describe("maintenance", () => {
  it("purges tenants deleted more than 30 days ago, keeps newer ones", async () => {
    const old = await makeClientWithEngine();
    const recent = await makeClientWithEngine();
    await makeProduct(old.cookie);
    const day = 86400_000;
    await testEnv.DB.prepare("UPDATE tenants SET status='deleted', deleted_at=? WHERE id=?").bind(new Date(Date.now() - 31 * day).toISOString(), old.tenantId).run();
    await testEnv.DB.prepare("UPDATE tenants SET status='deleted', deleted_at=? WHERE id=?").bind(new Date(Date.now() - 29 * day).toISOString(), recent.tenantId).run();
    await runMaintenance(testEnv, new Date());
    expect(await testEnv.DB.prepare("SELECT 1 FROM tenants WHERE id=?").bind(old.tenantId).first()).toBeNull();
    expect(await testEnv.DB.prepare("SELECT 1 FROM products WHERE tenant_id=?").bind(old.tenantId).first()).toBeNull();
    expect(await testEnv.DB.prepare("SELECT 1 FROM users WHERE tenant_id=?").bind(old.tenantId).first()).toBeNull();
    expect(await testEnv.DB.prepare("SELECT 1 FROM tenants WHERE id=?").bind(recent.tenantId).first()).not.toBeNull();
  });
  it("writes weekly CSV backups to R2 on Sunday", async () => {
    const c = await makeClientWithEngine();
    await makeProduct(c.cookie);
    const sunday = new Date("2026-11-07T18:02:00Z"); // 00:02 Sunday in Dhaka
    await runMaintenance(testEnv, sunday);
    const list = await testEnv.MEDIA.list({ prefix: `backups/2026-11-08/${c.tenantId}/` });
    expect(list.objects.map((o) => o.key.split("/").pop()).sort()).toEqual(["customers.csv", "orders.csv", "products.csv", "returns.csv"]);
  });
});
