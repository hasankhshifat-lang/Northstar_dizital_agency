import { describe, it, expect } from "vitest";
import { call, json, login, makeAgency, testEnv, uniq } from "./helpers";

async function createClient(cookie: string, extra: Record<string, unknown> = {}) {
  const email = `${uniq("o")}@shop.test`;
  const res = await call("/api/admin/clients", {
    method: "POST", cookie,
    json: { business_name: "Meghna Attire", owner_name: "Meghna", email, phone: "01700000000", ...extra },
  });
  expect(res.status).toBe(200);
  const body = await json(res);
  return { ...body, email };
}

async function setupAndLogin(setupUrl: string, email: string) {
  const token = setupUrl.split("/setup/")[1];
  const r = await call("/api/auth/setup", { method: "POST", json: { token, password: "clientpass1" } });
  expect(r.status).toBe(200);
  return login(email, "clientpass1");
}

const jobs = (tenantId: string) =>
  testEnv.DB.prepare("SELECT command, payload, status FROM engine_jobs WHERE tenant_id=? ORDER BY created_at, rowid").bind(tenantId).all<any>().then((r) => r.results);

describe("admin clients", () => {
  it("creates a client with setup link; owner can set password and log in", async () => {
    const a = await makeAgency();
    const c = await createClient(a.cookie);
    expect(c.setup_url).toMatch(/\/setup\/[A-Za-z0-9_-]{20,}$/);
    expect(c.client.slug).toMatch(/^meghna-attire/);
    expect(c.client.features.sort()).toEqual(["ai_agent", "followups", "inbox", "orders"]);
    const cookie = await setupAndLogin(c.setup_url, c.email);
    const me = await json(await call("/api/auth/me", { cookie }));
    expect(me.tenant.id).toBe(c.client.id);
    const j = await jobs(c.client.id);
    expect(j[0]).toMatchObject({ command: "createWorkspace", status: "done" });
  });

  it("slugs are unique", async () => {
    const a = await makeAgency();
    const c1 = await createClient(a.cookie, { business_name: "Same Name Shop" });
    const c2 = await createClient(a.cookie, { business_name: "Same Name Shop" });
    expect(c1.client.slug).not.toBe(c2.client.slug);
  });

  it("duplicate owner email is VALIDATION", async () => {
    const a = await makeAgency();
    const c = await createClient(a.cookie);
    const r = await call("/api/admin/clients", { method: "POST", cookie: a.cookie, json: { business_name: "X", owner_name: "Y", email: c.email } });
    expect(r.status).toBe(400);
  });

  it("lists clients with usage and filters by status", async () => {
    const a = await makeAgency();
    const c = await createClient(a.cookie, { business_name: "Listable " + uniq() });
    const list = await json(await call(`/api/admin/clients?q=${encodeURIComponent(c.client.business_name)}`, { cookie: a.cookie }));
    expect(list.clients.length).toBe(1);
    expect(list.clients[0].usage).toMatchObject({ ai_replies: 0, conversations: 0, outbound_messages: 0, orders: 0 });
    const susp = await json(await call(`/api/admin/clients?status=suspended&q=${encodeURIComponent(c.client.business_name)}`, { cookie: a.cookie }));
    expect(susp.clients.length).toBe(0);
  });

  it("suspend blocks session + login, pauses engine, audits; reactivate restores", async () => {
    const a = await makeAgency();
    const c = await createClient(a.cookie);
    const cookie = await setupAndLogin(c.setup_url, c.email);
    let r = await call(`/api/admin/clients/${c.client.id}/suspend`, { method: "POST", cookie: a.cookie, json: { reason: "payment due" } });
    expect(r.status).toBe(200);
    expect((await call("/api/client/ping", { cookie })).status).toBe(401); // session deleted
    r = await call("/api/auth/login", { method: "POST", json: { email: c.email, password: "clientpass1" }, headers: { "cf-connecting-ip": "10.9.9.9" } });
    expect(r.status).toBe(403);
    expect((await json(r)).code).toBe("ACCOUNT_SUSPENDED");
    expect((await jobs(c.client.id)).map((j: any) => j.command)).toContain("pauseWorkspace");
    const audit = await json(await call(`/api/admin/audit?tenant_id=${c.client.id}`, { cookie: a.cookie }));
    expect(audit.entries.some((e: any) => e.action === "client.suspend" && e.details.reason === "payment due")).toBe(true);
    const detail = await json(await call(`/api/admin/clients/${c.client.id}`, { cookie: a.cookie }));
    expect(detail.client.status).toBe("suspended");
    expect(detail.client.suspended_reason).toBe("payment due");

    await call(`/api/admin/clients/${c.client.id}/reactivate`, { method: "POST", cookie: a.cookie });
    expect(await login(c.email, "clientpass1")).toMatch(/ns_session/);
    expect((await jobs(c.client.id)).map((j: any) => j.command)).toContain("resumeWorkspace");
  });

  it("feature and channel switches queue engine commands", async () => {
    const a = await makeAgency();
    const c = await createClient(a.cookie);
    let r = await call(`/api/admin/clients/${c.client.id}/features/ai_agent`, { method: "PUT", cookie: a.cookie, json: { enabled: false } });
    expect(r.status).toBe(200);
    r = await call(`/api/admin/clients/${c.client.id}/channels/whatsapp`, { method: "PUT", cookie: a.cookie, json: { enabled: false } });
    expect(r.status).toBe(200);
    const j = await jobs(c.client.id);
    expect(j.find((x: any) => x.command === "setAiEnabled")).toMatchObject({ payload: JSON.stringify({ enabled: false }), status: "done" });
    expect(j.find((x: any) => x.command === "setChannelEnabled")).toMatchObject({ payload: JSON.stringify({ channel: "whatsapp", enabled: false }) });
    const d = await json(await call(`/api/admin/clients/${c.client.id}`, { cookie: a.cookie }));
    expect(d.client.features).not.toContain("ai_agent");
    expect(d.client.channels).not.toContain("whatsapp");
    expect((await call(`/api/admin/clients/${c.client.id}/features/bogus`, { method: "PUT", cookie: a.cookie, json: { enabled: false } })).status).toBe(400);
  });

  it("reset-login issues a fresh setup link", async () => {
    const a = await makeAgency();
    const c = await createClient(a.cookie);
    const r = await json(await call(`/api/admin/clients/${c.client.id}/reset-login`, { method: "POST", cookie: a.cookie }));
    expect(r.setup_url).not.toBe(c.setup_url);
    expect(await setupAndLogin(r.setup_url, c.email)).toMatch(/ns_session/);
  });

  it("delete requires exact business name", async () => {
    const a = await makeAgency();
    const c = await createClient(a.cookie);
    let r = await call(`/api/admin/clients/${c.client.id}`, { method: "DELETE", cookie: a.cookie, json: { confirm_name: "wrong" } });
    expect(r.status).toBe(400);
    r = await call(`/api/admin/clients/${c.client.id}`, { method: "DELETE", cookie: a.cookie, json: { confirm_name: "Meghna Attire" } });
    expect(r.status).toBe(200);
    const row = await testEnv.DB.prepare("SELECT status, deleted_at FROM tenants WHERE id=?").bind(c.client.id).first<any>();
    expect(row.status).toBe("deleted");
    expect(row.deleted_at).toBeTruthy();
  });

  it("presets apply switches on create", async () => {
    const a = await makeAgency();
    const label = uniq("Starter");
    let r = await call("/api/admin/presets", { method: "POST", cookie: a.cookie, json: { label, features: ["inbox", "orders"], channels: ["messenger"] } });
    expect(r.status).toBe(200);
    const c = await createClient(a.cookie, { plan_label: label });
    expect(c.client.features.sort()).toEqual(["inbox", "orders"]);
    expect(c.client.channels).toEqual(["messenger"]);
    const presets = await json(await call("/api/admin/presets", { cookie: a.cookie }));
    expect(presets.presets.some((p: any) => p.label === label)).toBe(true);
  });

  it("failed engine jobs are listed and can be retried", async () => {
    const a = await makeAgency();
    const c = await createClient(a.cookie);
    const t = await testEnv.DB.prepare("SELECT engine_workspace_ref AS ref FROM tenants WHERE id=?").bind(c.client.id).first<any>();
    await testEnv.DB.prepare("UPDATE demo_workspaces SET fail_mode='down' WHERE ref=?").bind(t.ref).run();
    await call(`/api/admin/clients/${c.client.id}/features/ai_agent`, { method: "PUT", cookie: a.cookie, json: { enabled: false } });
    await testEnv.DB.prepare("UPDATE engine_jobs SET status='failed' WHERE tenant_id=? AND command='setAiEnabled'").bind(c.client.id).run();
    const list = await json(await call("/api/admin/engine-jobs?status=failed", { cookie: a.cookie }));
    const job = list.jobs.find((j: any) => j.tenant_id === c.client.id);
    expect(job.business_name).toBe("Meghna Attire");
    await testEnv.DB.prepare("UPDATE demo_workspaces SET fail_mode='none' WHERE ref=?").bind(t.ref).run();
    await call(`/api/admin/engine-jobs/${job.id}/retry`, { method: "POST", cookie: a.cookie });
    const after = await testEnv.DB.prepare("SELECT status FROM engine_jobs WHERE id=?").bind(job.id).first<any>();
    expect(after.status).toBe("done");
  });
});
