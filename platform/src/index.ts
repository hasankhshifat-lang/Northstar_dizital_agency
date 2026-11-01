import { Hono } from "hono";
import type { AppEnv, Env } from "./env";
import { errorBody, errorHandler } from "./lib/errors";
import { authRoutes } from "./auth/routes";
import { clientPing, testRoutes } from "./client/ping";
import { adminRoutes } from "./admin/routes";
import { catalogRoutes } from "./catalog/routes";
import { mediaRoutes } from "./catalog/media";
import { customerRoutes, orderRoutes } from "./orders/routes";
import { reportRoutes } from "./reports/routes";
import { publicRoutes } from "./public/routes";
import { inboxRoutes, quickReplyRoutes } from "./inbox/routes";
import { webhookRoutes } from "./engine/webhook";
import "./inbox/notifications";
import { agentRoutes } from "./agent/routes";
import { broadcastRoutes, followupRoutes } from "./followups/routes";
import { runScheduler } from "./followups/scheduler";
import { runMaintenance } from "./maintenance";
import "./followups/rules";
import { runDuePushes } from "./agent/push";
import { runDueEngineJobs } from "./engine/jobs";

export const app = new Hono<AppEnv>();

app.get("/api/health", (c) => c.json({ ok: true }));
app.route("/api/auth", authRoutes);
app.route("/api/client", clientPing);
app.route("/api/test", testRoutes);
app.route("/api/admin", adminRoutes);
app.route("/api/products", catalogRoutes);
app.route("/media", mediaRoutes);
app.route("/api/orders", orderRoutes);
app.route("/api/customers", customerRoutes);
app.route("/api/reports", reportRoutes);
app.route("/p", publicRoutes);
app.route("/api/inbox", inboxRoutes);
app.route("/api/quick-replies", quickReplyRoutes);
app.route("/api/engine", webhookRoutes);
app.route("/api/agent", agentRoutes);
app.route("/api/followups", followupRoutes);
app.route("/api/broadcasts", broadcastRoutes);

app.notFound((c) => c.json(errorBody("NOT_FOUND"), 404));
app.onError(errorHandler);

export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledController, env: Env, _ctx: ExecutionContext) {
    const now = new Date();
    // Each step is independent: one failing must not stop the others.
    for (const [name, step] of [
      ["engine-jobs", () => runDueEngineJobs(env, now)],
      ["agent-push", () => runDuePushes(env, now)],
      ["scheduler", () => runScheduler(env, now)],
      ["maintenance", () => runMaintenance(env, now)],
    ] as const) {
      try { await step(); } catch (e) { console.error(`cron ${name} failed`, e); }
    }
  },
} satisfies ExportedHandler<Env>;
