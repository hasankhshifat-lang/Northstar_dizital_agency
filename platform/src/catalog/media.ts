import { Hono } from "hono";
import type { AppEnv } from "../env";
import { ApiError } from "../lib/errors";

/** Public media: product images (only) for active tenants (used by product pages, chat product cards). */
export const mediaRoutes = new Hono<AppEnv>();
mediaRoutes.get("/*", async (c) => {
  const key = decodeURIComponent(c.req.path.replace(/^\/media\//, ""));
  const m = /^tenants\/([^/]+)\/products\//.exec(key);
  if (!m || key.includes("..")) throw new ApiError(404, "NOT_FOUND");
  const t = await c.env.DB.prepare("SELECT status FROM tenants WHERE id=?").bind(m[1]).first<{ status: string }>();
  if (t?.status !== "active") throw new ApiError(404, "NOT_FOUND");
  const obj = await c.env.MEDIA.get(key);
  if (!obj) throw new ApiError(404, "NOT_FOUND");
  return new Response(obj.body, {
    headers: { "content-type": obj.httpMetadata?.contentType ?? "application/octet-stream", "cache-control": "public, max-age=86400", etag: obj.httpEtag },
  });
});
