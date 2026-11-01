import { Hono } from "hono";
import type { AppEnv, Env } from "./env";
import { errorBody, errorHandler } from "./lib/errors";
import { authRoutes } from "./auth/routes";
import { clientPing, testRoutes } from "./client/ping";
import { adminRoutes } from "./admin/routes";

export const app = new Hono<AppEnv>();

app.get("/api/health", (c) => c.json({ ok: true }));
app.route("/api/auth", authRoutes);
app.route("/api/client", clientPing);
app.route("/api/test", testRoutes);
app.route("/api/admin", adminRoutes);

app.notFound((c) => c.json(errorBody("NOT_FOUND"), 404));
app.onError(errorHandler);

export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledController, _env: Env, _ctx: ExecutionContext) {},
} satisfies ExportedHandler<Env>;
