import { expect, test } from "@playwright/test";

const ADMIN = { email: "admin@e2e.test", password: "password123" };

test.beforeAll(async ({ request }) => {
  const r = await request.post("/api/auth/bootstrap", { data: { token: "e2e-bootstrap", name: "Shifat", ...ADMIN } });
  expect([200, 403]).toContain(r.status());
});

test("English and light mode by default; sidebar toggles switch and remember language and theme", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Log in" })).toBeVisible();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await page.fill("input[type=email]", ADMIN.email);
  await page.fill("input[type=password]", ADMIN.password);
  await page.click("button[type=submit]");
  await page.waitForURL("**/admin");

  const sidebar = page.locator("aside");
  await expect(sidebar.getByTestId("lang-en")).toHaveAttribute("aria-checked", "true");
  await expect(sidebar.getByTestId("theme-light")).toHaveAttribute("aria-checked", "true");
  await expect(page.getByRole("heading", { name: "Clients" })).toBeVisible();

  await sidebar.getByTestId("lang-bn").click();
  await expect(page.getByRole("heading", { name: "ক্লায়েন্ট" })).toBeVisible();
  await sidebar.getByTestId("theme-dark").click();
  await expect(page.locator("html")).toHaveClass(/dark/);

  // remembered after reload, applied before the app renders
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.getByRole("heading", { name: "ক্লায়েন্ট" })).toBeVisible();
  await expect(sidebar.getByTestId("theme-dark")).toHaveAttribute("aria-checked", "true");

  await sidebar.getByTestId("lang-en").click();
  await sidebar.getByTestId("theme-light").click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await expect(page.getByRole("heading", { name: "Clients" })).toBeVisible();
});
