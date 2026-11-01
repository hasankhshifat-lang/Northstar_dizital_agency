import { describe, it, expect } from "vitest";
import { makeClient, testEnv } from "./helpers";
import { DemoEngine } from "../src/engine/demo";
import { enqueueEngineJob, runDueEngineJobs } from "../src/engine/jobs";
import { addMinutes } from "../src/lib/time";

const setFail = (ref: string, down: boolean) =>
  testEnv.DB.prepare("UPDATE demo_workspaces SET fail_mode=? WHERE ref=?").bind(down ? "down" : "none", ref).run();

async function tenantWithWorkspace() {
  const c = await makeClient();
  await enqueueEngineJob(testEnv, c.tenantId, "createWorkspace", {});
  const t = await testEnv.DB.prepare("SELECT engine_workspace_ref AS ref FROM tenants WHERE id=?").bind(c.tenantId).first<{ ref: string }>();
  return { ...c, ref: t!.ref };
}

describe("DemoEngine", () => {
  it("createWorkspace seeds 6 Bangla conversations over 4 channels", async () => {
    const { ref } = await tenantWithWorkspace();
    const e = new DemoEngine(testEnv.DB);
    const page = await e.listConversations(ref, {});
    expect(page.items.length).toBe(6);
    expect(new Set(page.items.map((c) => c.channel)).size).toBe(4);
    const detail = await e.getConversation(ref, page.items[0].id);
    expect(detail.messages.length).toBeGreaterThan(0);
  });
  it("paused workspace makes testChat throw ENGINE_UNAVAILABLE", async () => {
    const { ref } = await tenantWithWorkspace();
    const e = new DemoEngine(testEnv.DB);
    await e.pauseWorkspace(ref);
    await expect(e.testChat(ref, [{ role: "user", text: "দাম কত?" }])).rejects.toMatchObject({ code: "ENGINE_UNAVAILABLE" });
    await e.resumeWorkspace(ref);
    await expect(e.testChat(ref, [{ role: "user", text: "দাম কত?" }])).resolves.toBeTypeOf("string");
  });
  it("testChat answers from pushed FAQs, else Bangla fallback", async () => {
    const { ref } = await tenantWithWorkspace();
    const e = new DemoEngine(testEnv.DB);
    await e.pushAgentConfig(ref, { profile: {}, tone: {}, rules: {}, faqs: [{ question: "ডেলিভারি চার্জ কত?", answer: "ঢাকায় ৬০ টাকা" }], catalog: [] });
    expect(await e.testChat(ref, [{ role: "user", text: "ডেলিভারি চার্জ কত" }])).toBe("ঢাকায় ৬০ টাকা");
    expect(await e.testChat(ref, [{ role: "user", text: "আপনারা কি রবিবার খোলা?" }])).toContain("দুঃখিত");
  });
});

describe("engine job queue", () => {
  it("failed job retries with backoff and completes when engine recovers (engine down during suspend)", async () => {
    const { tenantId, ref } = await tenantWithWorkspace();
    await setFail(ref, true);
    const before = Date.now();
    await enqueueEngineJob(testEnv, tenantId, "pauseWorkspace", {});
    let job = await testEnv.DB.prepare("SELECT * FROM engine_jobs WHERE tenant_id=? AND command='pauseWorkspace'").bind(tenantId).first<any>();
    expect(job.status).toBe("pending");
    expect(job.attempts).toBe(1);
    const delayMs = new Date(job.next_attempt_at).getTime() - before;
    expect(delayMs).toBeGreaterThanOrEqual(59_000);
    expect(delayMs).toBeLessThan(70_000);
    await setFail(ref, false);
    await runDueEngineJobs(testEnv, new Date(addMinutes(new Date(), 2)));
    job = await testEnv.DB.prepare("SELECT * FROM engine_jobs WHERE id=?").bind(job.id).first<any>();
    expect(job.status).toBe("done");
    const ws = await testEnv.DB.prepare("SELECT paused FROM demo_workspaces WHERE ref=?").bind(ref).first<any>();
    expect(ws.paused).toBe(1);
  });
  it("10 failures marks the job failed", async () => {
    const { tenantId, ref } = await tenantWithWorkspace();
    await setFail(ref, true);
    await enqueueEngineJob(testEnv, tenantId, "setAiEnabled", { enabled: false });
    let t = new Date();
    for (let i = 0; i < 12; i++) {
      t = new Date(addMinutes(t, 61));
      await runDueEngineJobs(testEnv, t);
    }
    const job = await testEnv.DB.prepare("SELECT * FROM engine_jobs WHERE tenant_id=? AND command='setAiEnabled'").bind(tenantId).first<any>();
    expect(job.status).toBe("failed");
    expect(job.attempts).toBe(10);
    expect(job.last_error).toContain("ENGINE_UNAVAILABLE");
  });
});
