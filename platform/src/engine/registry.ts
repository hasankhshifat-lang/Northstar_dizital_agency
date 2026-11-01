import type { Env } from "../env";
import { ApiError } from "../lib/errors";
import { DemoEngine } from "./demo";
import type { ChatEngine } from "./types";

export function getEngine(env: Env, tenant: { engine: string }): ChatEngine {
  switch (tenant.engine) {
    case "demo":
      return new DemoEngine(env.DB);
    default:
      throw new ApiError(503, "ENGINE_UNAVAILABLE", { detail: `engine ${tenant.engine} not configured` });
  }
}

/** Resolve engine + workspace ref for a tenant, or throw ENGINE_UNAVAILABLE if the workspace isn't created yet. */
export function engineFor(env: Env, tenant: { engine: string; engine_workspace_ref: string | null }) {
  if (!tenant.engine_workspace_ref) throw new ApiError(503, "ENGINE_UNAVAILABLE", { detail: "workspace not ready" });
  return { engine: getEngine(env, tenant), ref: tenant.engine_workspace_ref };
}
