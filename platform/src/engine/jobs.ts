import type { Channel, Env, TenantRow } from "../env";
import { newId } from "../lib/crypto";
import { ApiError } from "../lib/errors";
import { addMinutes, nowIso } from "../lib/time";
import { getEngine } from "./registry";
import type { AgentConfig } from "./types";

export type EngineCommand =
  | "createWorkspace" | "pauseWorkspace" | "resumeWorkspace" | "setChannelEnabled" | "setAiEnabled" | "pushAgentConfig";

const BACKOFF_MIN = [1, 5, 15, 60];
export const MAX_ATTEMPTS = 10;

interface JobRow {
  id: string;
  tenant_id: string;
  command: EngineCommand;
  payload: string | null;
  attempts: number;
  next_attempt_at: string;
  status: string;
}

/** Queue an engine command and try to run it (and any earlier due jobs for the tenant) right away. */
export async function enqueueEngineJob(env: Env, tenantId: string, command: EngineCommand, payload: Record<string, unknown>) {
  const now = nowIso();
  await env.DB.prepare("INSERT INTO engine_jobs (id,tenant_id,command,payload,next_attempt_at,created_at) VALUES (?,?,?,?,?,?)")
    .bind(newId(), tenantId, command, JSON.stringify(payload), now, now).run();
  await runTenantJobs(env, tenantId, new Date());
}

/** Cron entry: run every due pending job, in creation order per tenant, stopping a tenant's queue at its first failure. */
export async function runDueEngineJobs(env: Env, now: Date = new Date()) {
  const tenants = (await env.DB.prepare("SELECT DISTINCT tenant_id FROM engine_jobs WHERE status='pending' AND next_attempt_at<=?").bind(nowIso(now)).all<{ tenant_id: string }>()).results;
  for (const t of tenants) await runTenantJobs(env, t.tenant_id, now);
}

export async function retryJobNow(env: Env, jobId: string) {
  const job = await env.DB.prepare("SELECT tenant_id FROM engine_jobs WHERE id=?").bind(jobId).first<{ tenant_id: string }>();
  if (!job) throw new ApiError(404, "NOT_FOUND");
  await env.DB.prepare("UPDATE engine_jobs SET status='pending', attempts=0, next_attempt_at=? WHERE id=?").bind(nowIso(), jobId).run();
  await runTenantJobs(env, job.tenant_id, new Date());
}

async function runTenantJobs(env: Env, tenantId: string, now: Date) {
  // Jobs run strictly in order: a not-yet-due earlier job blocks later ones.
  const jobs = (await env.DB.prepare("SELECT * FROM engine_jobs WHERE tenant_id=? AND status='pending' ORDER BY created_at, rowid").bind(tenantId).all<JobRow>()).results;
  for (const job of jobs) {
    if (job.next_attempt_at > nowIso(now)) return;
    try {
      await execute(env, job);
      await env.DB.prepare("UPDATE engine_jobs SET status='done', attempts=attempts+1, last_error=NULL WHERE id=?").bind(job.id).run();
    } catch (e) {
      const attempts = job.attempts + 1;
      const err = e instanceof ApiError ? `${e.code}${e.extra.detail ? ": " + e.extra.detail : ""}` : String(e);
      const delay = BACKOFF_MIN[attempts - 1] ?? 60;
      const status = attempts >= MAX_ATTEMPTS ? "failed" : "pending";
      await env.DB.prepare("UPDATE engine_jobs SET attempts=?, status=?, last_error=?, next_attempt_at=? WHERE id=?")
        .bind(attempts, status, err, addMinutes(now, delay), job.id).run();
      return;
    }
  }
}

async function execute(env: Env, job: JobRow) {
  const tenant = await env.DB.prepare("SELECT * FROM tenants WHERE id=?").bind(job.tenant_id).first<TenantRow>();
  if (!tenant) throw new ApiError(404, "NOT_FOUND");
  const engine = getEngine(env, tenant);
  const p = job.payload ? JSON.parse(job.payload) : {};
  if (job.command === "createWorkspace") {
    if (tenant.engine_workspace_ref) return;
    const { workspaceRef } = await engine.createWorkspace({ id: tenant.id, business_name: tenant.business_name });
    await env.DB.prepare("UPDATE tenants SET engine_workspace_ref=? WHERE id=?").bind(workspaceRef, tenant.id).run();
    return;
  }
  const ref = tenant.engine_workspace_ref;
  if (!ref) throw new ApiError(503, "ENGINE_UNAVAILABLE", { detail: "workspace not ready" });
  switch (job.command) {
    case "pauseWorkspace": return engine.pauseWorkspace(ref);
    case "resumeWorkspace": return engine.resumeWorkspace(ref);
    case "setChannelEnabled": return engine.setChannelEnabled(ref, p.channel as Channel, !!p.enabled);
    case "setAiEnabled": return engine.setAiEnabled(ref, !!p.enabled);
    case "pushAgentConfig": return engine.pushAgentConfig(ref, p.config as AgentConfig);
  }
}
