import { Hono } from "hono";
import type { AppEnv, Env } from "./env";
import { errorBody, errorHandler } from "./lib/errors";
import { authRoutes } from "./auth/routes";
import { clientPing, testRoutes } from "./client/ping";
import { requireAuth, requireAgency } from "./auth/middleware";

export const app = new Hono<AppEnv>();

app.get("/api/health", (c) => c.json({ ok: true }));
app.route("/api/auth", authRoutes);
app.route("/api/client", clientPing);
app.route("/api/test", testRoutes);
// Placeholder so guard tests have an admin route until Task 5 mounts the real admin API.
app.get("/api/admin/clients", requireAuth, requireAgency, (c) => c.json({ clients: [] }));

app.notFound((c) => c.json(errorBody("NOT_FOUND"), 404));
app.onError(errorHandler);

export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledController, _env: Env, _ctx: ExecutionContext) {},
} satisfies ExportedHandler<Env>;
