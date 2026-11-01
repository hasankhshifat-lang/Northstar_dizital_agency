import { expect, test, type Page } from "@playwright/test";

const ADMIN = { email: "admin@e2e.test", password: "password123" };

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.fill("input[type=email]", email);
  await page.fill("input[type=password]", password);
  await page.click("button[type=submit]");
}

/** Admin creates a client and the client sets a password. Returns the client's email. */
async function createClientAndSetup(page: Page, business: string): Promise<string> {
  const email = `owner${Date.now()}@shop.test`;
  await login(page, ADMIN.email, ADMIN.password);
  await page.waitForURL("**/admin");
  await page.goto("/admin/clients/new");
  await page.fill("input[name=business_name]", business);
  await page.fill("input[name=owner_name]", "Meghna");
  await page.fill("input[name=email]", email);
  await page.click("button[type=submit]");
  const setupUrl = (await page.textContent("[data-testid=setup-url]"))!.trim();
  await page.context().clearCookies();
  await page.goto(new URL(setupUrl).pathname);
  await page.fill("input[type=password]", "clientpass1");
  await page.click("button[type=submit]");
  await expect(page.getByText("পাসওয়ার্ড সেট হয়েছে")).toBeVisible();
  return email;
}

// These flows use the Bangla UI labels; English is the default, so pin Bangla here.
const pinBangla = () => localStorage.setItem("ns_lang", "bn");
test.beforeEach(async ({ context }) => { await context.addInitScript(pinBangla); });

test.beforeAll(async ({ request }) => {
  const r = await request.post("/api/auth/bootstrap", { data: { token: "e2e-bootstrap", name: "Shifat", ...ADMIN } });
  expect([200, 403]).toContain(r.status()); // 403 if a previous test in this server already bootstrapped
});

test("client onboarding → product → AI order in chat → confirm & ship", async ({ page, request }) => {
  const email = await createClientAndSetup(page, "Meghna Attire");
  await login(page, email, "clientpass1");
  await page.waitForURL("**/app");

  // add a product
  await page.goto("/app/products/new");
  await page.fill("input[name=code]", "KD9101");
  await page.fill("input[name=name_bn]", "মাস্টার্ড কিডস ড্রেস");
  await page.fill("input[name=price]", "1250");
  await page.getByLabel("ভ্যারিয়েন্ট", { exact: true }).fill("S");
  await page.getByLabel("স্টক", { exact: true }).fill("5");
  await page.click("button[type=submit]");
  await page.waitForURL(/\/app\/products\/[0-9a-f-]{36}$/);

  // the AI (demo engine) takes an order in a Messenger chat
  const me = await (await page.request.get("/api/auth/me")).json();
  const inbox = await (await page.request.get("/api/inbox?tab=open")).json();
  const conv = inbox.conversations.find((c: any) => c.channel === "messenger");
  const hook = (data: object) => request.post("/api/engine/demo/webhook", { headers: { "x-demo-secret": "e2e-bootstrap" }, data });
  expect((await hook({ type: "message.in", tenant_id: me.tenant.id, conversation_id: conv.id, channel: "messenger", customer: { name: conv.customerName, ref: conv.customerRef }, text: "একটা S সাইজ দিন" })).status()).toBe(200);
  expect((await hook({ type: "order.created", tenant_id: me.tenant.id, conversation_id: conv.id, channel: "messenger", customer: { name: conv.customerName, ref: conv.customerRef, phone: "01712345678", address: "মিরপুর" }, items: [{ code: "KD9101", variant: "S", qty: 1 }] })).status()).toBe(200);

  // the order shows up; confirm and ship it
  await page.goto("/app/orders");
  await page.click("text=#1001");
  await page.click("text=→ কনফার্ম");
  await page.click("text=→ প্যাক");
  await page.click("text=→ পাঠানো হয়েছে");
  await page.fill("input >> nth=-1", "STD-1001");
  await page.getByRole("button", { name: "সেভ করুন" }).click();
  await expect(page.getByText("Steadfast · STD-1001")).toBeVisible();

  // the customer got the receipt in the chat
  await page.goto(`/app/inbox/${conv.id}`);
  await expect(page.getByText("অর্ডার #1001").first()).toBeVisible();
});

test("admin suspends → client sees Paused → admin reactivates → client logs in", async ({ page, browser }) => {
  const email = await createClientAndSetup(page, "Rangdhanu Fashion");
  const client = await browser.newPage();
  await client.addInitScript(pinBangla);
  await login(client, email, "clientpass1");
  await client.waitForURL("**/app");

  await login(page, ADMIN.email, ADMIN.password);
  await page.waitForURL("**/admin");
  await page.click("text=Rangdhanu Fashion");
  await page.getByRole("switch", { name: "অ্যাকাউন্ট" }).click();
  await page.fill("input >> nth=-1", "payment due");
  await page.getByRole("button", { name: "বন্ধ করুন" }).click();
  await expect(page.getByText("payment due")).toBeVisible();

  // client's next action: logged out → login shows the Paused screen
  await client.goto("/app/products");
  await client.waitForURL("**/login");
  await login(client, email, "clientpass1");
  await expect(client.getByTestId("paused")).toBeVisible();

  await page.getByRole("switch", { name: "অ্যাকাউন্ট" }).click();
  await expect(page.getByText("চালু").first()).toBeVisible();
  await login(client, email, "clientpass1");
  await client.waitForURL("**/app");
});
