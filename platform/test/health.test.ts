import { describe, it, expect } from "vitest";
import { call, json } from "./helpers";

describe("health", () => {
  it("returns ok", async () => {
    const res = await call("/api/health");
    expect(res.status).toBe(200);
    expect(await json(res)).toEqual({ ok: true });
  });
  it("unknown api route is NOT_FOUND with bilingual message", async () => {
    const res = await call("/api/nope");
    expect(res.status).toBe(404);
    const body = await json(res);
    expect(body.code).toBe("NOT_FOUND");
    expect(body.message_bn).toBeTruthy();
    expect(body.message_en).toBeTruthy();
  });
});
