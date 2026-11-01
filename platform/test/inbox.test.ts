import { describe, it, expect } from "vitest";
import { call, json, makeClientWithEngine, makeProduct, setStatus, testEnv, webhook } from "./helpers";

describe("inbox", () => {
  it("lists conversations, hiding switched-off channels, with tab counts", async () => {
    const c = await makeClientWithEngine({ channels: ["messenger", "instagram", "website"] });
    const r = await json(await call("/api/inbox?tab=open", { cookie: c.cookie }));
    expect(r.conversations.length).toBe(4); // 6 seeded minus 2 whatsapp
    expect(r.conversations.every((x: any) => x.channel !== "whatsapp")).toBe(true);
    expect(r.counts.open).toBe(4);
    expect(r.counts.unread).toBeGreaterThan(0);
    const waiting = await json(await call("/api/inbox?tab=waiting", { cookie: c.cookie }));
    expect(waiting.conversations.every((x: any) => x.lastFrom === "customer")).toBe(true);
  });

  it("done tab only shows done; snoozed chats return after snooze_until", async () => {
    const c = await makeClientWithEngine();
    const all = (await json(await call("/api/inbox?tab=open", { cookie: c.cookie }))).conversations;
    const [a, b] = all;
    await call(`/api/inbox/${a.id}/state`, { method: "POST", cookie: c.cookie, json: { state: "done" } });
    await call(`/api/inbox/${b.id}/state`, { method: "POST", cookie: c.cookie, json: { state: "later", snooze_hours: 3 } });
    const done = (await json(await call("/api/inbox?tab=done", { cookie: c.cookie }))).conversations;
    expect(done.map((x: any) => x.id)).toEqual([a.id]);
    let open = (await json(await call("/api/inbox?tab=open", { cookie: c.cookie }))).conversations.map((x: any) => x.id);
    expect(open).not.toContain(a.id);
    expect(open).not.toContain(b.id);
    expect((await json(await call("/api/inbox?tab=later", { cookie: c.cookie }))).conversations.map((x: any) => x.id)).toEqual([b.id]);
    await testEnv.DB.prepare("UPDATE conversation_state SET snooze_until=? WHERE engine_conversation_id=?").bind(new Date(Date.now() - 1000).toISOString(), b.id).run();
    open = (await json(await call("/api/inbox?tab=open", { cookie: c.cookie }))).conversations.map((x: any) => x.id);
    expect(open).toContain(b.id);
  });

  it("sends text and product messages; changes handler", async () => {
    const c = await makeClientWithEngine();
    const conv = (await json(await call("/api/inbox?tab=open", { cookie: c.cookie }))).conversations[0];
    let r = await call(`/api/inbox/${conv.id}/messages`, { method: "POST", cookie: c.cookie, json: { text: "জি, আছে!" } });
    expect(r.status).toBe(200);
    const p = await makeProduct(c.cookie, { price: 125000 });
    r = await call(`/api/inbox/${conv.id}/messages`, { method: "POST", cookie: c.cookie, json: { product_id: p.id } });
    expect(r.status).toBe(200);
    const d = (await json(await call(`/api/inbox/${conv.id}`, { cookie: c.cookie }))).conversation;
    const last2 = d.messages.slice(-2);
    expect(last2[0]).toMatchObject({ kind: "text", text: "জি, আছে!", by: "human" });
    expect(last2[1]).toMatchObject({ kind: "product" });
    r = await call(`/api/inbox/${conv.id}/handler`, { method: "POST", cookie: c.cookie, json: { handler: "human" } });
    expect((await json(r)).conversation.handler).toBe("human");
    const u = await testEnv.DB.prepare("SELECT outbound_messages FROM usage_monthly WHERE tenant_id=?").bind(c.tenantId).first<any>();
    expect(u.outbound_messages).toBe(2);
  });

  it("requires inbox feature", async () => {
    const c = await makeClientWithEngine({ features: ["orders"] });
    expect((await call("/api/inbox", { cookie: c.cookie })).status).toBe(403);
  });

  it("quick replies CRUD", async () => {
    const c = await makeClientWithEngine();
    const r = await json(await call("/api/quick-replies", { method: "POST", cookie: c.cookie, json: { title: "ডেলিভারি", body: "ঢাকায় ডেলিভারি চার্জ ৳৬০" } }));
    expect((await json(await call("/api/quick-replies", { cookie: c.cookie }))).quick_replies.length).toBe(1);
    await call(`/api/quick-replies/${r.quick_reply.id}`, { method: "DELETE", cookie: c.cookie });
    expect((await json(await call("/api/quick-replies", { cookie: c.cookie }))).quick_replies.length).toBe(0);
  });
});

describe("engine webhook", () => {
  it("rejects wrong secret", async () => {
    expect((await webhook({ type: "ai.reply", tenant_id: "x" }, "nope")).status).toBe(401);
  });

  it("order.created makes an AI order #1001 linked to the chat customer", async () => {
    const c = await makeClientWithEngine();
    const p = await makeProduct(c.cookie, { variants: [{ label: "L", stock: 3 }] });
    const conv = (await json(await call("/api/inbox?tab=open", { cookie: c.cookie }))).conversations[0];
    const r = await webhook({
      type: "order.created", tenant_id: c.tenantId, conversation_id: conv.id, channel: conv.channel,
      customer: { name: conv.customerName, ref: conv.customerRef, phone: "01712345678", address: "ধানমন্ডি" },
      items: [{ code: p.code, variant: "L", qty: 1 }],
    });
    expect(r.status).toBe(200);
    const order = (await json(r)).order;
    expect(order).toMatchObject({ number: 1001, source: "ai", conversation_id: conv.id, channel: conv.channel });
    const detail = (await json(await call(`/api/inbox/${conv.id}`, { cookie: c.cookie })));
    expect(detail.customer.id).toBe(order.customer_id);
    expect(detail.customer.orders.length).toBe(1);
  });

  it("unanswered questions are grouped by normalized text", async () => {
    const c = await makeClientWithEngine();
    await webhook({ type: "question.unanswered", tenant_id: c.tenantId, text: "চট্টগ্রামে কত দিনে পাব?" });
    await webhook({ type: "question.unanswered", tenant_id: c.tenantId, text: "  চট্টগ্রামে কত দিনে পাব  " });
    const rows = (await testEnv.DB.prepare("SELECT * FROM unanswered_questions WHERE tenant_id=?").bind(c.tenantId).all<any>()).results;
    expect(rows.length).toBe(1);
    expect(rows[0].count).toBe(2);
  });

  it("message.in records last inbound, links customer, counts usage; ai.reply counts usage", async () => {
    const c = await makeClientWithEngine();
    const conv = (await json(await call("/api/inbox?tab=open", { cookie: c.cookie }))).conversations[0];
    await webhook({ type: "message.in", tenant_id: c.tenantId, conversation_id: conv.id, channel: conv.channel, customer: { name: conv.customerName, ref: conv.customerRef }, text: "হ্যালো", new_conversation: true });
    await webhook({ type: "ai.reply", tenant_id: c.tenantId, conversation_id: conv.id });
    const li = await testEnv.DB.prepare("SELECT * FROM customer_last_inbound WHERE tenant_id=?").bind(c.tenantId).first<any>();
    expect(li.channel).toBe(conv.channel);
    expect(li.conversation_id).toBe(conv.id);
    const u = await testEnv.DB.prepare("SELECT * FROM usage_monthly WHERE tenant_id=?").bind(c.tenantId).first<any>();
    expect(u.conversations).toBe(1);
    expect(u.ai_replies).toBe(1);
    const d = (await json(await call(`/api/inbox/${conv.id}`, { cookie: c.cookie }))).conversation;
    expect(d.messages.at(-1)).toMatchObject({ text: "হ্যালো", by: "customer" });
  });

  it("order status updates are sent to the chat when the 24h window allows", async () => {
    const c = await makeClientWithEngine();
    const p = await makeProduct(c.cookie, { variants: [{ label: "L", stock: 3 }] });
    const conv = (await json(await call("/api/inbox?tab=open", { cookie: c.cookie }))).conversations.find((x: any) => x.channel === "messenger");
    await webhook({ type: "message.in", tenant_id: c.tenantId, conversation_id: conv.id, channel: "messenger", customer: { name: "x", ref: conv.customerRef } });
    const order = (await json(await webhook({ type: "order.created", tenant_id: c.tenantId, conversation_id: conv.id, channel: "messenger", customer: { name: "x", ref: conv.customerRef }, items: [{ code: p.code, qty: 1 }] }))).order;
    await setStatus(c.cookie, order.id, "confirmed");
    let msgs = (await json(await call(`/api/inbox/${conv.id}`, { cookie: c.cookie }))).conversation.messages;
    expect(msgs.at(-1)).toMatchObject({ kind: "receipt" });
    // outside 24h: no shipped update
    await testEnv.DB.prepare("UPDATE customer_last_inbound SET last_inbound_at=? WHERE tenant_id=?").bind(new Date(Date.now() - 25 * 3600_000).toISOString(), c.tenantId).run();
    await setStatus(c.cookie, order.id, "packed");
    await setStatus(c.cookie, order.id, "shipped", { courier: "Pathao", tracking_number: "PTH-9" });
    msgs = (await json(await call(`/api/inbox/${conv.id}`, { cookie: c.cookie }))).conversation.messages;
    expect(msgs.filter((m: any) => m.kind === "receipt").length).toBe(1);
  });
});
