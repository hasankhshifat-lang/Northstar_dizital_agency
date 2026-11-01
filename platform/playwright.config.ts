import { defineConfig } from "@playwright/test";

/**
 * End-to-end flows against `wrangler dev` with a fresh local D1 (state dir .wrangler/e2e).
 * Run: npm run e2e   (builds the SPA, applies migrations, starts the worker on :8788)
 */
export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  use: { baseURL: "http://localhost:8788", viewport: { width: 1360, height: 860 } },
  webServer: {
    command:
      "rm -rf .wrangler/e2e && npx vite build web && npx wrangler d1 migrations apply northstar-platform --local --persist-to .wrangler/e2e && npx wrangler dev --port 8788 --persist-to .wrangler/e2e --var BOOTSTRAP_TOKEN:e2e-bootstrap --var APP_URL:http://localhost:8788",
    url: "http://localhost:8788/api/health",
    timeout: 120_000,
    reuseExistingServer: false,
  },
});
