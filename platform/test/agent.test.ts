import { describe, it, expect } from "vitest";
import { call, json, makeClientWithEngine, makeProduct, testEnv, webhook } from "./helpers";
import { runDuePushes } from "../src/agent/push";
import { addMinutes } from "../src/lib/time";

const ws = (ref: string) => testEnv.DB.prepare("SELECT config, config_pushes FROM demo_workspaces WHERE ref=?").bind(ref).first<any>();

const config = {
  profile: { shop_name: "Meghna Attire", sells: "পাঞ্জাবি, কিডস ড্রেস", delivery_charges: "ঢাকা ৬০, বাইরে ১২০", payment_methods: ["cod", "bkash"] },
  tone: { language: "bn", formality: "friendly", address_terms: true },
  rules: { max_discount_pct: 10, handoff_angry: true, handoff_refund: true },
};

describe("agent config", () => {
  it("saves config; two saves within a minute produce one push", async () => {
    const c = await makeClientWithEngine();
    expect((await call("/api/agent/config", { method: "PUT", cookie: c.cookie, json: config })).status).toBe(200);
    await call("/api/agent/config", { method: "PUT", cookie: c.cookie, json: { ...config, rules: { ...config.rules, max_discount_pct: 5 } } });
    const got = await json(await call("/api/agent/config", { cookie: c.cookie }));
    expect(got.rules.max_discount_pct).toBe(5);
    const before = (await ws(c.ref)).config_pushes;
    await runDuePushes(testEnv, new Date(addMinutes(new Date(), 2)));
    await runDuePushes(testEnv, new Date(addMinutes(new Date(), 3)));
    const after = await ws(c.ref);
    expect(after.config_pushes - before).toBe(1);
    expect(JSON.parse(after.config).rules.max_discount_pct).toBe(5);
  });

  it("pushed catalog excludes hidden products", async () => {
    const c = await makeClientWithEngine();
    const shown = await makeProduct(c.cookie, { name: "দেখানো" });
    await makeProduct(c.cookie, { name: "লুকানো", status: "hidden" });
    await runDuePushes(testEnv, new Date(addMinutes(new Date(), 2)));
    const cfg = JSON.parse((await ws(c.ref)).config);
    expect(cfg.catalog.map((p: any) => p.code)).toEqual([shown.code]);
    expect(cfg.catalog[0].variants[0]).toMatchObject({ label: "L", stock: 5 });
  });

  it("does not push for suspended tenants", async () => {
    const c = await makeClientWithEngine();
    await call("/api/agent/config", { method: "PUT", cookie: c.cookie, json: config });
    await testEnv.DB.prepare("UPDATE tenants SET status='suspended' WHERE id=?").bind(c.tenantId).run();
    const before = (await ws(c.ref)).config_pushes;
    await runDuePushes(testEnv, new Date(addMinutes(new Date(), 2)));
    expect((await ws(c.ref)).config_pushes).toBe(before);
  });

  it("FAQ CRUD", async () => {
    const c = await makeClientWithEngine();
    const f = (await json(await call("/api/agent/faqs", { method: "POST", cookie: c.cookie, json: { question: "রিটার্ন পলিসি?", answer: "৩ দিনের মধ্যে" } }))).faq;
    await call(`/api/agent/faqs/${f.id}`, { method: "PUT", cookie: c.cookie, json: { question: "রিটার্ন পলিসি?", answer: "৭ দিনের মধ্যে" } });
    const list = (await json(await call("/api/agent/faqs", { cookie: c.cookie }))).faqs;
    expect(list).toEqual([expect.objectContaining({ answer: "৭ দিনের মধ্যে" })]);
    await call(`/api/agent/faqs/${f.id}`, { method: "DELETE", cookie: c.cookie });
    expect((await json(await call("/api/agent/faqs", { cookie: c.cookie }))).faqs).toEqual([]);
  });

  it("teach turns an unanswered question into an FAQ and test-chat uses it", async () => {
    const c = await makeClientWithEngine();
    await webhook({ type: "question.unanswered", tenant_id: c.tenantId, text: "ডেলিভারি চার্জ কত?" });
    let un = (await json(await call("/api/agent/unanswered", { cookie: c.cookie }))).questions;
    expect(un.length).toBe(1);
    const fallback = (await json(await call("/api/agent/test-chat", { method: "POST", cookie: c.cookie, json: { messages: [{ role: "user", text: "ডেলিভারি চার্জ কত?" }] } }))).reply;
    expect(fallback).toContain("দুঃখিত");
    const r = await call(`/api/agent/unanswered/${un[0].id}/teach`, { method: "POST", cookie: c.cookie, json: { answer: "ঢাকায় ৳৬০, ঢাকার বাইরে ৳১২০" } });
    expect(r.status).toBe(200);
    un = (await json(await call("/api/agent/unanswered", { cookie: c.cookie }))).questions;
    expect(un.length).toBe(0);
    const reply = (await json(await call("/api/agent/test-chat", { method: "POST", cookie: c.cookie, json: { messages: [{ role: "user", text: "ডেলিভারি চার্জ কত?" }] } }))).reply;
    expect(reply).toBe("ঢাকায় ৳৬০, ঢাকার বাইরে ৳১২০");
  });

  it("requires ai_agent feature", async () => {
    const c = await makeClientWithEngine({ features: ["inbox"] });
    expect((await call("/api/agent/config", { cookie: c.cookie })).status).toBe(403);
  });
});
