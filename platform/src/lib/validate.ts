import type { Context } from "hono";
import { z } from "zod";
import { ApiError } from "./errors";

export async function parseBody<T extends z.ZodTypeAny>(c: Context, schema: T): Promise<z.infer<T>> {
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    throw new ApiError(400, "VALIDATION", { issues: [{ path: [], message: "Invalid JSON" }] });
  }
  return parseValue(schema, raw);
}

export function parseValue<T extends z.ZodTypeAny>(schema: T, raw: unknown): z.infer<T> {
  const r = schema.safeParse(raw);
  if (!r.success) throw new ApiError(400, "VALIDATION", { issues: r.error.issues.map((i) => ({ path: i.path, message: i.message })) });
  return r.data;
}
