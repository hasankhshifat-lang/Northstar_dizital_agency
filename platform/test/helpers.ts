import { exports, env } from "cloudflare:workers";

export const testEnv = env as unknown as import("../src/env").Env;

export async function call(path: string, init: RequestInit & { json?: unknown; cookie?: string } = {}) {
  const headers = new Headers(init.headers);
  if (init.json !== undefined) headers.set("content-type", "application/json");
  if (init.cookie) headers.set("cookie", init.cookie);
  const res = await (exports as any).default.fetch(
    new Request("http://localhost" + path, {
      ...init,
      headers,
      body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
    }),
  );
  return res as Response;
}

export async function json<T = any>(res: Response): Promise<T> {
  return (await res.json()) as T;
}

let seq = 0;
export function uniq(prefix = "x") {
  seq += 1;
  return `${prefix}${Date.now().toString(36)}${seq}${Math.random().toString(36).slice(2, 6)}`;
}

export function randomIp() {
  return `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

export async function login(email: string, password: string): Promise<string> {
  const res = await call("/api/auth/login", { method: "POST", json: { email, password }, headers: { "cf-connecting-ip": randomIp() } });
  if (res.status !== 200) throw new Error(`login failed ${res.status} ${await res.text()}`);
  const set = res.headers.get("set-cookie") ?? "";
  return set.split(";")[0];
}

/** Insert an agency admin directly and return its session cookie. */
export async function makeAgency(): Promise<{ cookie: string; id: string; email: string }> {
  const { hashPassword } = await import("../src/lib/crypto");
  const id = uniq("u");
  const email = `${id}@agency.test`;
  await testEnv.DB.prepare("INSERT INTO users (id,email,password_hash,role,name,created_at) VALUES (?,?,?,?,?,?)")
    .bind(id, email, await hashPassword("password123"), "agency_admin", "Admin", new Date().toISOString()).run();
  return { cookie: await login(email, "password123"), id, email };
}

/** Insert a tenant + owner directly (all features & channels on unless given) and return a session cookie. */
export async function makeClient(opts: { features?: string[]; channels?: string[]; status?: string } = {}) {
  const { hashPassword } = await import("../src/lib/crypto");
  const tenantId = uniq("t");
  const now = new Date().toISOString();
  await testEnv.DB.prepare("INSERT INTO tenants (id,business_name,slug,status,created_at) VALUES (?,?,?,?,?)")
    .bind(tenantId, "Shop " + tenantId, tenantId, "active", now).run();
  await testEnv.DB.prepare("INSERT INTO tenant_counters (tenant_id) VALUES (?)").bind(tenantId).run();
  for (const f of ["inbox", "ai_agent", "orders", "followups"]) {
    const on = opts.features ? opts.features.includes(f) : true;
    await testEnv.DB.prepare("INSERT INTO tenant_features (tenant_id,feature,enabled) VALUES (?,?,?)").bind(tenantId, f, on ? 1 : 0).run();
  }
  for (const ch of ["messenger", "instagram", "whatsapp", "website"]) {
    const on = opts.channels ? opts.channels.includes(ch) : true;
    await testEnv.DB.prepare("INSERT INTO tenant_channels (tenant_id,channel,enabled) VALUES (?,?,?)").bind(tenantId, ch, on ? 1 : 0).run();
  }
  const userId = uniq("u");
  const email = `${userId}@client.test`;
  await testEnv.DB.prepare("INSERT INTO users (id,email,password_hash,role,tenant_id,name,created_at) VALUES (?,?,?,?,?,?,?)")
    .bind(userId, email, await hashPassword("password123"), "client_owner", tenantId, "Owner", now).run();
  const cookie = await login(email, "password123");
  if (opts.status) await testEnv.DB.prepare("UPDATE tenants SET status=? WHERE id=?").bind(opts.status, tenantId).run();
  return { cookie, tenantId, userId, email };
}
