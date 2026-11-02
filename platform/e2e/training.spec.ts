import { expect, test, type Page } from "@playwright/test";

const ADMIN = { email: "admin@e2e.test", password: "password123" };
const shot = async (page: Page, name: string) => { if (process.env.SHOTS) await page.screenshot({ path: `${process.env.SHOTS}/${name}.png`, fullPage: true }); };

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.fill("input[type=email]", email);
  await page.fill("input[type=password]", password);
  await page.click("button[type=submit]");
}

test.use({ viewport: { width: 412, height: 900 } });

test.beforeAll(async ({ request }) => {
  const r = await request.post("/api/auth/bootstrap", { data: { token: "e2e-bootstrap", name: "Shifat", ...ADMIN } });
  expect([200, 403]).toContain(r.status());
});

test("country code, agency trains a client's chatbot, client imports products from a catalog file", async ({ page }) => {
  const email = `train${Date.now()}@shop.test`;
  await login(page, ADMIN.email, ADMIN.password);
  await page.waitForURL("**/admin");
  await expect(page.locator("aside img[alt=Northstar]")).toBeVisible();

  // New client: Bangladesh (+880) is the default; the local 0 is dropped.
  await page.goto("/admin/clients/new");
  await page.fill("input[name=business_name]", "Rupkotha Fashion");
  await page.fill("input[name=owner_name]", "Rupa");
  await page.fill("input[name=email]", email);
  await page.fill("input[name=phone]", "01712-345678");
  await expect(page.getByText("+8801712345678")).toBeVisible();
  await shot(page, "1-new-client");
  await page.click("button[type=submit]");
  await expect(page.getByRole("link", { name: "Share on WhatsApp" })).toHaveAttribute("href", /wa\.me\/8801712345678\?/);
  const setupUrl = (await page.textContent("[data-testid=setup-url]"))!.trim();

  // Agency: Train AI from the clients list.
  await page.goto("/admin");
  await page.getByRole("row", { name: /Rupkotha Fashion/ }).getByRole("button", { name: /Train AI/ }).click();
  await expect(page.getByRole("heading", { name: "Train chatbot — Rupkotha Fashion" })).toBeVisible();
  await page.fill("input[name=training_title]", "Delivery");
  await page.fill("textarea[name=training_text]", "Delivery inside Dhaka costs 70 taka and takes 2 days. Outside Dhaka costs 130 taka.");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByTestId("training-source")).toContainText("Added by Northstar");
  await page.getByPlaceholder("Type a reply").fill("How much is delivery inside Dhaka?");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByTestId("ai-reply")).toContainText("70 taka");
  await shot(page, "2-admin-train");

  // Client sets a password and sees the same source on the AI page.
  await page.context().clearCookies();
  await page.goto(new URL(setupUrl).pathname);
  await page.fill("input[type=password]", "clientpass1");
  await page.click("button[type=submit]");
  await login(page, email, "clientpass1");
  await page.waitForURL("**/app");
  await page.goto("/app/agent?tab=training");
  await expect(page.getByTestId("training-source")).toContainText("Delivery");
  await shot(page, "3-client-training");

  // Products → Import from link → upload a Facebook catalog export.
  await page.goto("/app/products");
  await page.getByRole("button", { name: "Import from link" }).click();
  await shot(page, "4-import-modal");
  await page.locator("input[type=file][accept*=xml]").setInputFiles({
    name: "catalog.csv", mimeType: "text/csv",
    buffer: Buffer.from("id,title,description,availability,price,sale_price,image_link\nRK-1,Jamdani Saree,Handwoven,in stock,8500 BDT,7900 BDT,\nRK-2,Cotton Kurti,Daily wear,in stock,1450 BDT,,\n"),
  });
  await expect(page.getByText("2 products found")).toBeVisible();
  await shot(page, "5-import-preview");
  await page.getByRole("button", { name: "Import 2" }).click();
  await expect(page.getByText("2 products added")).toBeVisible();
  await page.getByRole("button", { name: "Close" }).last().click();
  await expect(page.getByRole("link", { name: "Jamdani Saree" })).toBeVisible();
  await shot(page, "6-products");
});
