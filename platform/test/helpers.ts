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
