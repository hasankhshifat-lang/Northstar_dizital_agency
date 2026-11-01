import { currentLang } from "./i18n";

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public body: any) {
    super(message);
  }
}

type Opts = { method?: string; json?: unknown; body?: BodyInit; signal?: AbortSignal; quiet?: boolean };

export async function api<T = any>(path: string, opts: Opts = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (opts.json !== undefined) headers["content-type"] = "application/json";
  const res = await fetch(path, {
    method: opts.method ?? (opts.json !== undefined || opts.body ? "POST" : "GET"),
    headers,
    body: opts.json !== undefined ? JSON.stringify(opts.json) : opts.body,
    credentials: "same-origin",
    signal: opts.signal,
  });
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const code = (isJson && body?.code) || "INTERNAL";
    const msg = (isJson && (currentLang() === "bn" ? body.message_bn : body.message_en)) || res.statusText;
    if (!opts.quiet && (code === "ACCOUNT_SUSPENDED" || code === "UNAUTHORIZED")) {
      window.dispatchEvent(new CustomEvent("ns:auth", { detail: code }));
    }
    throw new ApiError(res.status, code, msg, body);
  }
  return body as T;
}

export const taka = (poisha: number | null | undefined) =>
  poisha == null ? "—" : "৳" + (poisha / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 });

export const toPoisha = (taka: string | number) => Math.round(Number(taka) * 100);

export const fmtDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString(currentLang() === "bn" ? "bn-BD" : "en-GB", { timeZone: "Asia/Dhaka", dateStyle: "medium", timeStyle: "short" }) : "—";
