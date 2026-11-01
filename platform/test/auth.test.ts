import { describe, it, expect } from "vitest";
import { call, json, login, makeAgency, makeClient, testEnv, uniq, randomIp } from "./helpers";
import { hashPassword, verifyPassword, sha256Hex } from "../src/lib/crypto";

describe("crypto", () => {
  it("hash then verify", async () => {
    const h = await hashPassword("secret-pass");
    expect(h.startsWith("pbkdf2$100000$")).toBe(true);
    expect(await verifyPassword("secret-pass", h)).toBe(true);
    expect(await verifyPassword("wrong", h)).toBe(false);
  });
});

describe("bootstrap", () => {
  it("rejects wrong token, works once, then refuses", async () => {
    await testEnv.DB.prepare("DELETE FROM sessions").run();
    await testEnv.DB.prepare("DELETE FROM setup_tokens").run();
    await testEnv.DB.prepare("DELETE FROM users").run();
    const body = { email: "boss@northstar.test", name: "Boss", password: "password123" };
    let res = await call("/api/auth/bootstrap", { method: "POST", json: { ...body, token: "nope" } });
    expect(res.status).toBe(403);
    res = await call("/api/auth/bootstrap", { method: "POST", json: { ...body, token: "test-bootstrap-token" } });
    expect(res.status).toBe(200);
    res = await call("/api/auth/bootstrap", { method: "POST", json: { ...body, email: "b2@x.test", token: "test-bootstrap-token" } });
    expect(res.status).toBe(403);
  });
});

describe("login / me / logout", () => {
  it("logs in and returns me", async () => {
    const a = await makeAgency();
    const res = await call("/api/auth/me", { cookie: a.cookie });
    expect(res.status).toBe(200);
    const me = await json(res);
    expect(me.user.email).toBe(a.email);
    expect(me.user.role).toBe("agency_admin");
  });
  it("client me includes tenant features", async () => {
    const c = await makeClient({ features: ["orders"] });
    const me = await json(await call("/api/auth/me", { cookie: c.cookie }));
    expect(me.tenant.features).toEqual(["orders"]);
    expect(me.tenant.channels.length).toBe(4);
  });
  it("cookie flags", async () => {
    const a = await makeAgency();
    const res = await call("/api/auth/login", { method: "POST", json: { email: a.email, password: "password123" }, headers: { "cf-connecting-ip": randomIp() } });
    const set = res.headers.get("set-cookie")!;
    expect(set).toMatch(/ns_session=/);
    expect(set).toMatch(/HttpOnly/i);
    expect(set).toMatch(/Secure/i);
    expect(set).toMatch(/SameSite=Lax/i);
  });
  it("wrong password is 401 and 6th failure is 429", async () => {
    const a = await makeAgency();
    const ip = randomIp();
    for (let i = 0; i < 5; i++) {
      const r = await call("/api/auth/login", { method: "POST", json: { email: a.email, password: "bad" }, headers: { "cf-connecting-ip": ip } });
      expect(r.status).toBe(401);
      expect((await json(r)).code).toBe("UNAUTHORIZED");
    }
    const r = await call("/api/auth/login", { method: "POST", json: { email: a.email, password: "password123" }, headers: { "cf-connecting-ip": randomIp() } });
    expect(r.status).toBe(429);
    expect((await json(r)).code).toBe("RATE_LIMITED");
  });
  it("logout ends the session", async () => {
    const a = await makeAgency();
    await call("/api/auth/logout", { method: "POST", cookie: a.cookie });
    expect((await call("/api/auth/me", { cookie: a.cookie })).status).toBe(401);
  });
});

describe("setup token", () => {
  async function seedToken(hoursValid: number) {
    const c = await makeClient();
    const token = uniq("tok");
    const exp = new Date(Date.now() + hoursValid * 3600_000).toISOString();
    await testEnv.DB.prepare("INSERT INTO setup_tokens (token_hash,user_id,expires_at) VALUES (?,?,?)").bind(await sha256Hex(token), c.userId, exp).run();
    return { ...c, token };
  }
  it("works once", async () => {
    const s = await seedToken(72);
    let r = await call("/api/auth/setup", { method: "POST", json: { token: s.token, password: "newpassword1" } });
    expect(r.status).toBe(200);
    expect(await login(s.email, "newpassword1")).toMatch(/ns_session=/);
    r = await call("/api/auth/setup", { method: "POST", json: { token: s.token, password: "another-pass" } });
    expect(r.status).toBe(400);
  });
  it("expired token is rejected", async () => {
    const s = await seedToken(-1);
    const r = await call("/api/auth/setup", { method: "POST", json: { token: s.token, password: "newpassword1" } });
    expect(r.status).toBe(400);
  });
  it("short password is VALIDATION", async () => {
    const s = await seedToken(72);
    const r = await call("/api/auth/setup", { method: "POST", json: { token: s.token, password: "short" } });
    expect(r.status).toBe(400);
    expect((await json(r)).code).toBe("VALIDATION");
  });
});
