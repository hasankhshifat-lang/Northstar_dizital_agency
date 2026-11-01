import { ApiError } from "../lib/errors";
import { addMinutes, nowIso } from "../lib/time";

const WINDOW_MIN = 15;
const MAX_FAILURES = 5;

export async function checkLoginRate(db: D1Database, keys: string[]) {
  const since = addMinutes(nowIso(), -WINDOW_MIN);
  for (const key of keys) {
    const r = await db.prepare("SELECT COUNT(*) AS n FROM login_attempts WHERE key=? AND at>?").bind(key, since).first<{ n: number }>();
    if ((r?.n ?? 0) >= MAX_FAILURES) throw new ApiError(429, "RATE_LIMITED");
  }
}

export async function recordLoginFailure(db: D1Database, keys: string[]) {
  const now = nowIso();
  await db.batch(keys.map((k) => db.prepare("INSERT INTO login_attempts (key,at) VALUES (?,?)").bind(k, now)));
  await db.prepare("DELETE FROM login_attempts WHERE at<?").bind(addMinutes(now, -WINDOW_MIN * 4)).run();
}
