import { describe, it, expect } from "vitest";
import { call, json, makeClientWithEngine, makeOrder, makeProduct, setStatus, testEnv, webhook } from "./helpers";
import { canSend } from "../src/followups/rule24h";
import { renderTemplate } from "../src/followups/rules";

const H = 3600_000;
const now = new Date("2026-11-01T12:00:00Z");
const ago = (ms: number) => new Date(now.getTime() - ms).toISOString();

describe("24h rule", () => {
  it("messenger/instagram need an inbound message within 24h", () => {
    expect(canSend({ channel: "messenger", lastInboundAt: ago(23 * H + 59 * 60_000), now })).toEqual({ ok: true, viaTemplate: false });
    expect(canSend({ channel: "messenger", lastInboundAt: ago(24 * H + 60_000), now })).toEqual({ ok: false, reason: "OUTSIDE_24H" });
    expect(canSend({ channel: "instagram", lastInboundAt: null, now })).toEqual({ ok: false, reason: "OUTSIDE_24H" });
  });
  it("whatsapp outside 24h needs a template", () => {
    expect(canSend({ channel: "whatsapp", lastInboundAt: ago(30 * H), now, whatsappTemplate: "order_thanks" })).toEqual({ ok: true, viaTemplate: true });
    expect(canSend({ channel: "whatsapp", lastInboundAt: ago(30 * H), now })).toEqual({ ok: false, reason: "OUTSIDE_24H" });
    expect(canSend({ channel: "whatsapp", lastInboundAt: ago(2 * H), now })).toEqual({ ok: true, viaTemplate: false });
  });
  it("website chat has no window", () => {
    expect(canSend({ channel: "website", lastInboundAt: null, now }).ok).toBe(true);
  });
});

describe("templates", () => {
  it("renders all variables and blanks unknown ones", () => {
    expect(renderTemplate("{name} — {product} #{order_number} {offer}", { name: "রহিম", product: "পাঞ্জাবি", order_number: 1001, offer: "ফ্রি ডেলিভারি" }))
      .toBe("রহিম — পাঞ্জাবি #1001 ফ্রি ডেলিভারি");
    expect(renderTemplate("{name}, {offer}", { name: "রহিম" })).toBe("রহিম,");
  });
});

const sends = (tenantId: string) =>
  testEnv.DB.prepare("SELECT s.*, r.type FROM followup_sends s LEFT JOIN followup_rules r ON r.id=s.rule_id WHERE s.tenant_id=? ORDER BY s.rowid").bind(tenantId).all<any>().then((r) => r.results);

async function enableRule(cookie: string, type: string, patch: Record<string, unknown> = {}) {
  const rules = (await json(await call("/api/followups/rules", { cookie }))).rules;
  const r = rules.find((x: any) => x.type === type);
  const res = await call(`/api/followups/rules/${r.id}`, { method: "PUT", cookie, json: { enabled: true, delay_minutes: r.delay_minutes, message_template: r.message_template, offer_text: r.offer_text, whatsapp_template_name: r.whatsapp_template_name, ...patch } });
  expect(res.status).toBe(200);
  return (await json(res)).rule;
}

async function chatCustomer(c: { cookie: string; tenantId: string }, channel = "messenger") {
  const conv = (await json(await call("/api/inbox?tab=open", { cookie: c.cookie }))).conversations.find((x: any) => x.channel === channel);
  return conv;
}

describe("follow-up rules", () => {
  it("lists 4 default rules, all off, with defaults from the spec", async () => {
    const c = await makeClientWithEngine();
    const rules = (await json(await call("/api/followups/rules", { cookie: c.cookie }))).rules;
    expect(Object.fromEntries(rules.map((r: any) => [r.type, [r.enabled, r.delay_minutes]]))).toEqual({
      price_no_order: [false, 180], order_unconfirmed: [false, 120], delivered_thanks: [false, 1440], win_back: [false, 43200],
    });
  });

  it("product question schedules price_no_order once; ordering cancels it", async () => {
    const c = await makeClientWithEngine();
    await enableRule(c.cookie, "price_no_order", { offer_text: "আজ রাত ১১টা পর্যন্ত ফ্রি ডেলিভারি" });
    const conv = await chatCustomer(c);
    const ev = { type: "message.in", tenant_id: c.tenantId, conversation_id: conv.id, channel: "messenger", customer: { name: conv.customerName, ref: conv.customerRef }, intent: "product_question", product_code: "KD9101" };
    await webhook(ev);
    await webhook(ev);
    let s = (await sends(c.tenantId)).filter((x: any) => x.type === "price_no_order");
    expect(s.length).toBe(1);
    expect(s[0].status).toBe("scheduled");
    const delay = new Date(s[0].scheduled_for).getTime() - Date.now();
    expect(delay).toBeGreaterThan(179 * 60_000);
    expect(delay).toBeLessThan(181 * 60_000);
    const p = await makeProduct(c.cookie);
    const custId = s[0].customer_id;
    await call("/api/orders", { method: "POST", cookie: c.cookie, json: { customer: { id: custId, name: "x" }, items: [{ variant_id: p.variants[0].id, qty: 1 }] } });
    s = (await sends(c.tenantId)).filter((x: any) => x.type === "price_no_order");
    expect(s[0].status).toBe("cancelled");
  });

  it("disabled rules schedule nothing", async () => {
    const c = await makeClientWithEngine();
    const conv = await chatCustomer(c);
    await webhook({ type: "message.in", tenant_id: c.tenantId, conversation_id: conv.id, channel: "messenger", customer: { name: "x", ref: conv.customerRef }, intent: "product_question" });
    expect((await sends(c.tenantId)).length).toBe(0);
  });

  it("order_unconfirmed is scheduled on new order and cancelled on confirm; delivered schedules thanks + win_back", async () => {
    const c = await makeClientWithEngine();
    for (const t of ["order_unconfirmed", "delivered_thanks", "win_back"]) await enableRule(c.cookie, t);
    const conv = await chatCustomer(c, "whatsapp");
    await webhook({ type: "message.in", tenant_id: c.tenantId, conversation_id: conv.id, channel: "whatsapp", customer: { name: "x", ref: conv.customerRef } });
    const p = await makeProduct(c.cookie, { variants: [{ label: "L", stock: 5 }] });
    const order = (await json(await webhook({ type: "order.created", tenant_id: c.tenantId, conversation_id: conv.id, channel: "whatsapp", customer: { name: "x", ref: conv.customerRef }, items: [{ code: p.code, qty: 1 }] }))).order;
    let s = await sends(c.tenantId);
    expect(s.find((x: any) => x.type === "order_unconfirmed")).toMatchObject({ status: "scheduled", channel: "whatsapp", conversation_id: conv.id });
    for (const st of ["confirmed", "packed", "shipped", "delivered"]) await setStatus(c.cookie, order.id, st);
    s = await sends(c.tenantId);
    expect(s.find((x: any) => x.type === "order_unconfirmed").status).toBe("cancelled");
    expect(s.find((x: any) => x.type === "delivered_thanks").status).toBe("scheduled");
    expect(s.find((x: any) => x.type === "win_back").status).toBe("scheduled");
    expect(JSON.parse(s.find((x: any) => x.type === "delivered_thanks").context).order_number).toBe(order.number);
  });

  it("customer reply cancels pending price_no_order", async () => {
    const c = await makeClientWithEngine();
    await enableRule(c.cookie, "price_no_order");
    const conv = await chatCustomer(c);
    const base = { type: "message.in", tenant_id: c.tenantId, conversation_id: conv.id, channel: "messenger", customer: { name: "x", ref: conv.customerRef } };
    await webhook({ ...base, intent: "product_question" });
    await webhook({ ...base, text: "ঠিক আছে, ভেবে দেখি" });
    expect((await sends(c.tenantId))[0].status).toBe("cancelled");
  });

  it("validates rule updates and requires followups feature", async () => {
    const c = await makeClientWithEngine();
    const rules = (await json(await call("/api/followups/rules", { cookie: c.cookie }))).rules;
    const bad = await call(`/api/followups/rules/${rules[0].id}`, { method: "PUT", cookie: c.cookie, json: { enabled: true, delay_minutes: 0, message_template: "" } });
    expect(bad.status).toBe(400);
    const off = await makeClientWithEngine({ features: ["inbox"] });
    expect((await call("/api/followups/rules", { cookie: off.cookie })).status).toBe(403);
  });
});
