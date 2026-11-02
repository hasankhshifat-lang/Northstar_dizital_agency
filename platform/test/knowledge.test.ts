import { afterEach, describe, expect, it, vi } from "vitest";
import { makePdf, stubWeb } from "./web-stub";
import { call, json, makeAgency, makeClient, makeClientWithEngine, testEnv } from "./helpers";
import { runDuePushes } from "../src/agent/push";
import { addMinutes } from "../src/lib/time";
import { htmlToText, parsePublicUrl } from "../src/lib/fetch";

afterEach(() => vi.restoreAllMocks());

const SITE = `<html><head><title>Meghna Attire</title><meta name="description" content="Handmade panjabi in Dhaka"></head>
<body><nav>Home | Shop</nav><h1>Welcome</h1><p>We ship all over Bangladesh.</p>
<a href="/about">About</a> <a href="/delivery-policy">Delivery</a> <a href="https://other.com/x">Other</a>
<script>var x = "secret";</script></body></html>`;
const DELIVERY = `<html><head><title>Delivery</title></head><body><p>Delivery inside Dhaka takes 2 days and costs 60 taka.</p><p>Outside Dhaka delivery takes 4 days and costs 120 taka.</p></body></html>`;

describe("text helpers", () => {
  it("turns HTML into readable text without scripts or navigation", () => {
    const t = htmlToText(SITE);
    expect(t).toContain("We ship all over Bangladesh.");
    expect(t).not.toContain("secret");
    expect(t).not.toContain("Home | Shop");
  });
  it("accepts bare domains and refuses private addresses", () => {
    expect(parsePublicUrl("shop.com.bd/abc").toString()).toBe("https://shop.com.bd/abc");
    for (const bad of ["localhost:8787", "http://127.0.0.1/", "http://192.168.0.5", "ftp://x.com/a", "http://10.0.0.1"]) expect(() => parsePublicUrl(bad)).toThrow();
  });
});

describe("AI training sources (client)", () => {
  it("reads a website and its useful linked pages, then pushes the text to the engine", async () => {
    const c = await makeClientWithEngine();
    stubWeb({ "https://meghna.test/": { body: SITE }, "https://meghna.test/delivery-policy": { body: DELIVERY }, "https://meghna.test/about": { body: "<html><body><p>Family business since 2010, run by two sisters.</p></body></html>" } });
    const res = await call("/api/agent/knowledge/link", { method: "POST", cookie: c.cookie, json: { url: "meghna.test" } });
    expect(res.status).toBe(200);
    const { source } = await json(res);
    expect(source).toMatchObject({ kind: "website", title: "Meghna Attire", pages: 3, added_by: "client" });
    const full = await json(await call(`/api/agent/knowledge/${source.id}`, { cookie: c.cookie }));
    expect(full.source.content).toContain("Handmade panjabi");
    expect(full.source.content).toContain("Outside Dhaka delivery takes 4 days");

    await runDuePushes(testEnv, new Date(addMinutes(new Date(), 2)));
    const ws = await testEnv.DB.prepare("SELECT config FROM demo_workspaces WHERE ref=?").bind(c.ref).first<any>();
    expect(JSON.parse(ws.config).knowledge[0].content).toContain("costs 120 taka");

    const reply = await json(await call("/api/agent/test-chat", { method: "POST", cookie: c.cookie, json: { messages: [{ role: "user", text: "How many days does delivery outside Dhaka take?" }] } }));
    expect(reply.reply).toContain("Outside Dhaka delivery takes 4 days");
  });

  it("adds text and PDF sources, lists and deletes them", async () => {
    const c = await makeClientWithEngine();
    const text = await json(await call("/api/agent/knowledge/text", { method: "POST", cookie: c.cookie, json: { title: "Opening hours", content: "We are open every day from 10am to 10pm except Friday morning." } }));
    expect(text.source).toMatchObject({ kind: "text", chars: 62 });

    const fd = new FormData();
    fd.append("file", new File([makePdf("Warranty: all shoes have a 6 month warranty.")], "warranty.pdf", { type: "application/pdf" }));
    const pdfRes = await call("/api/agent/knowledge/pdf", { method: "POST", cookie: c.cookie, body: fd });
    expect(pdfRes.status).toBe(200);
    const pdf = (await json(pdfRes)).source;
    expect(pdf).toMatchObject({ kind: "pdf", title: "warranty.pdf", pages: 1 });
    expect((await call(`/api/agent/knowledge/${pdf.id}/file`, { cookie: c.cookie })).headers.get("content-type")).toBe("application/pdf");
    const full = await json(await call(`/api/agent/knowledge/${pdf.id}`, { cookie: c.cookie }));
    expect(full.source.content).toContain("6 month warranty");
    // Stored PDFs are not public media.
    const key = (await testEnv.DB.prepare("SELECT r2_key FROM knowledge_sources WHERE id=?").bind(pdf.id).first<any>()).r2_key;
    expect((await call("/media/" + key)).status).toBe(404);

    expect((await json(await call("/api/agent/knowledge", { cookie: c.cookie }))).sources).toHaveLength(2);
    expect((await call(`/api/agent/knowledge/${pdf.id}`, { method: "DELETE", cookie: c.cookie })).status).toBe(200);
    expect(await testEnv.MEDIA.get(key)).toBeNull();
    expect((await json(await call("/api/agent/knowledge", { cookie: c.cookie }))).sources).toHaveLength(1);
  });

  it("refuses non-PDF uploads and Facebook pages behind a login wall, with a readable reason", async () => {
    const c = await makeClient();
    const fd = new FormData();
    fd.append("file", new File(["hello"], "notes.pdf", { type: "application/pdf" }));
    const bad = await json(await call("/api/agent/knowledge/pdf", { method: "POST", cookie: c.cookie, body: fd }));
    expect(bad.issues[0].message).toMatch(/Only PDF/);
    stubWeb({ "https://www.facebook.com/meghna": { body: "<html><head><title>Facebook</title></head><body>Log in</body></html>" } });
    const fb = await json(await call("/api/agent/knowledge/link", { method: "POST", cookie: c.cookie, json: { url: "https://m.facebook.com/meghna" } }));
    expect(fb.code).toBe("VALIDATION");
    expect(fb.issues[0].message).toMatch(/About section/);
  });

  it("saves the public summary of a Facebook page", async () => {
    const c = await makeClient();
    stubWeb({ "https://www.facebook.com/meghna": { body: `<html><head><meta property="og:title" content="Meghna Attire"><meta property="og:description" content="Meghna Attire. 12K likes. Handmade panjabi and kids wear, home delivery all over Bangladesh."></head><body></body></html>` } });
    const r = await json(await call("/api/agent/knowledge/link", { method: "POST", cookie: c.cookie, json: { url: "facebook.com/meghna" } }));
    expect(r.source).toMatchObject({ kind: "facebook", title: "Meghna Attire" });
    expect(r.source.note).toMatch(/About text/);
  });

  it("needs the AI agent feature", async () => {
    const c = await makeClient({ features: ["inbox"] });
    expect((await call("/api/agent/knowledge", { cookie: c.cookie })).status).toBe(403);
  });
});

describe("AI training sources (agency)", () => {
  it("agency trains a client's chatbot, tests it, and the change is audited; clients can't use admin routes", async () => {
    const a = await makeAgency();
    const c = await makeClientWithEngine();
    const add = await call(`/api/admin/clients/${c.tenantId}/knowledge/text`, { method: "POST", cookie: a.cookie, json: { title: "Returns", content: "Returns are accepted within 7 days if the tag is still attached." } });
    expect(add.status).toBe(200);
    expect((await json(add)).source.added_by).toBe("agency");
    // The client sees it too.
    expect((await json(await call("/api/agent/knowledge", { cookie: c.cookie }))).sources[0].title).toBe("Returns");
    const reply = await json(await call(`/api/admin/clients/${c.tenantId}/test-chat`, { method: "POST", cookie: a.cookie, json: { messages: [{ role: "user", text: "Are returns accepted?" }] } }));
    expect(reply.reply).toContain("within 7 days");
    const audit = await json(await call(`/api/admin/audit?tenant_id=${c.tenantId}`, { cookie: a.cookie }));
    expect(audit.entries.map((e: any) => e.action)).toContain("knowledge.add");
    const list = await json(await call("/api/admin/clients", { cookie: a.cookie }));
    expect(list.clients.find((x: any) => x.id === c.tenantId).knowledge_sources).toBe(1);

    expect((await call(`/api/admin/clients/${c.tenantId}/knowledge`, { cookie: c.cookie })).status).toBe(403);
    expect((await call(`/api/admin/clients/nope/knowledge`, { cookie: a.cookie })).status).toBe(404);
  });
});
