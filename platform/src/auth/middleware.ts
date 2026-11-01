import { createMiddleware } from "hono/factory";
import { getCookie } from "hono/cookie";
import type { AppEnv, Feature } from "../env";
import { ApiError } from "../lib/errors";
import { loadTenantContext } from "../lib/tenant";
import { COOKIE, getSession } from "./sessions";

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const id = getCookie(c, COOKIE);
  const user = id ? await getSession(c.env.DB, id) : null;
  if (!user) throw new ApiError(401, "UNAUTHORIZED");
  c.set("user", user);
  c.set("sessionId", id!);
  await next();
});

export const requireAgency = createMiddleware<AppEnv>(async (c, next) => {
  if (c.var.user?.role !== "agency_admin") throw new ApiError(403, "FORBIDDEN");
  await next();
});

export const requireClient = createMiddleware<AppEnv>(async (c, next) => {
  const u = c.var.user;
  if (u?.role !== "client_owner" || !u.tenantId) throw new ApiError(403, "FORBIDDEN");
  const t = await loadTenantContext(c.env.DB, u.tenantId);
  if (!t || t.status === "deleted") throw new ApiError(401, "UNAUTHORIZED");
  if (t.status === "suspended") throw new ApiError(403, "ACCOUNT_SUSPENDED");
  c.set("tenant", t);
  await next();
});

export const requireFeature = (f: Feature) =>
  createMiddleware<AppEnv>(async (c, next) => {
    if (!c.var.tenant?.features.includes(f)) throw new ApiError(403, "FEATURE_DISABLED", { feature: f });
    await next();
  });

/** Convenience: auth + client + (optional) feature gate for a route group. */
export const clientGroup = (f?: Feature) => (f ? [requireAuth, requireClient, requireFeature(f)] : [requireAuth, requireClient]);
