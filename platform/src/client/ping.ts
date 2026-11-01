import { Hono } from "hono";
import type { AppEnv, Feature } from "../env";
import { requireAuth, requireClient } from "../auth/middleware";
import { FEATURES } from "../env";
import { ApiError } from "../lib/errors";

export const clientPing = new Hono<AppEnv>();
clientPing.use("*", requireAuth, requireClient);
clientPing.get("/ping", (c) => c.json({ ok: true, tenant: c.var.tenant.id }));

/** Test-only route to exercise feature gates (mounted always, answers only when env.TEST === "1"). */
export const testRoutes = new Hono<AppEnv>();
testRoutes.use("*", async (c, next) => {
  if (c.env.TEST !== "1") throw new ApiError(404, "NOT_FOUND");
  await next();
});
testRoutes.get("/feature/:f", requireAuth, requireClient, (c) => {
  const f = c.req.param("f") as Feature;
  if (!FEATURES.includes(f)) throw new ApiError(404, "NOT_FOUND");
  if (!c.var.tenant.features.includes(f)) throw new ApiError(403, "FEATURE_DISABLED", { feature: f });
  return c.json({ ok: true });
});
