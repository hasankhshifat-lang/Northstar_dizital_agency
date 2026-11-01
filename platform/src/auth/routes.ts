import { Hono } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { z } from "zod";
import type { AppEnv } from "../env";
import { ApiError } from "../lib/errors";
import { hashPassword, newId, sha256Hex, verifyPassword } from "../lib/crypto";
import { parseBody } from "../lib/validate";
import { nowIso } from "../lib/time";
import { loadTenantContext } from "../lib/tenant";
import { COOKIE, createSession, destroySession, destroyUserSessions, getSession } from "./sessions";
import { checkLoginRate, recordLoginFailure } from "./ratelimit";

export const authRoutes = new Hono<AppEnv>();

const password = z.string().min(8).max(200);

function setSessionCookie(c: any, id: string) {
  setCookie(c, COOKIE, id, { httpOnly: true, secure: true, sameSite: "Lax", path: "/", maxAge: 30 * 24 * 3600 });
}

authRoutes.post("/bootstrap", async (c) => {
  const body = await parseBody(c, z.object({ token: z.string(), email: z.string().email(), name: z.string().min(1), password }));
  const count = await c.env.DB.prepare("SELECT COUNT(*) AS n FROM users").first<{ n: number }>();
  if (!c.env.BOOTSTRAP_TOKEN || body.token !== c.env.BOOTSTRAP_TOKEN || (count?.n ?? 0) > 0) throw new ApiError(403, "FORBIDDEN");
  const id = newId();
  await c.env.DB.prepare("INSERT INTO users (id,email,password_hash,role,name,created_at) VALUES (?,?,?,?,?,?)")
    .bind(id, body.email.toLowerCase(), await hashPassword(body.password), "agency_admin", body.name, nowIso()).run();
  setSessionCookie(c, await createSession(c.env.DB, id));
  return c.json({ ok: true });
});

authRoutes.post("/login", async (c) => {
  const body = await parseBody(c, z.object({ email: z.string().min(3), password: z.string().min(1) }));
  const email = body.email.toLowerCase().trim();
  const ip = c.req.header("cf-connecting-ip") ?? "unknown";
  const keys = [`ip:${ip}`, `email:${email}`];
  await checkLoginRate(c.env.DB, keys);
  const user = await c.env.DB.prepare("SELECT id, password_hash, tenant_id FROM users WHERE email=?").bind(email)
    .first<{ id: string; password_hash: string | null; tenant_id: string | null }>();
  if (!user || !(await verifyPassword(body.password, user.password_hash))) {
    await recordLoginFailure(c.env.DB, keys);
    throw new ApiError(401, "UNAUTHORIZED");
  }
  if (user.tenant_id) {
    const t = await c.env.DB.prepare("SELECT status FROM tenants WHERE id=?").bind(user.tenant_id).first<{ status: string }>();
    if (t?.status === "suspended") throw new ApiError(403, "ACCOUNT_SUSPENDED");
    if (!t || t.status === "deleted") throw new ApiError(401, "UNAUTHORIZED");
  }
  await c.env.DB.prepare("UPDATE users SET last_login_at=? WHERE id=?").bind(nowIso(), user.id).run();
  setSessionCookie(c, await createSession(c.env.DB, user.id));
  return c.json({ ok: true });
});

authRoutes.post("/logout", async (c) => {
  const id = getCookie(c, COOKIE);
  if (id) await destroySession(c.env.DB, id);
  deleteCookie(c, COOKIE, { path: "/" });
  return c.json({ ok: true });
});

authRoutes.get("/me", async (c) => {
  const id = getCookie(c, COOKIE);
  const user = id ? await getSession(c.env.DB, id) : null;
  if (!user) throw new ApiError(401, "UNAUTHORIZED");
  if (!user.tenantId) return c.json({ user });
  const t = await loadTenantContext(c.env.DB, user.tenantId);
  if (!t || t.status === "deleted") throw new ApiError(401, "UNAUTHORIZED");
  if (t.status === "suspended") throw new ApiError(403, "ACCOUNT_SUSPENDED");
  return c.json({ user, tenant: { id: t.id, business_name: t.business_name, slug: t.slug, status: t.status, features: t.features, channels: t.channels } });
});

authRoutes.post("/setup", async (c) => {
  const body = await parseBody(c, z.object({ token: z.string().min(10), password }));
  const hash = await sha256Hex(body.token);
  const row = await c.env.DB.prepare("SELECT user_id, expires_at, used_at FROM setup_tokens WHERE token_hash=?").bind(hash)
    .first<{ user_id: string; expires_at: string; used_at: string | null }>();
  if (!row || row.used_at || row.expires_at <= nowIso()) throw new ApiError(400, "VALIDATION", { reason: "TOKEN_INVALID" });
  await c.env.DB.batch([
    c.env.DB.prepare("UPDATE users SET password_hash=? WHERE id=?").bind(await hashPassword(body.password), row.user_id),
    c.env.DB.prepare("UPDATE setup_tokens SET used_at=? WHERE token_hash=?").bind(nowIso(), hash),
  ]);
  await destroyUserSessions(c.env.DB, row.user_id);
  return c.json({ ok: true });
});
