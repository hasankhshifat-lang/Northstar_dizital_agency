import { ApiError } from "./errors";

/** A validation error tied to one input field, shown to the user as-is. */
export const fieldError = (path: string, message: string) => new ApiError(400, "VALIDATION", { issues: [{ path: [path], message }] });

const PRIVATE_HOST = /^(localhost|.*\.local|.*\.internal|.*\.localhost)$/i;
const PRIVATE_V4 = /^(0|10|127)\.|^169\.254\.|^172\.(1[6-9]|2\d|3[01])\.|^192\.168\.|^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./;

/** Parse a user-typed link ("shop.com/abc" is fine) and refuse anything that isn't a public http(s) address. */
export function parsePublicUrl(raw: string, field = "url"): URL {
  let s = raw.trim();
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) s = "https://" + s;
  let u: URL;
  try { u = new URL(s); } catch { throw fieldError(field, "That doesn't look like a web address"); }
  if (u.protocol !== "https:" && u.protocol !== "http:") throw fieldError(field, "Only http and https links are supported");
  const host = u.hostname.replace(/^\[|\]$/g, "");
  if (!host.includes(".") || PRIVATE_HOST.test(host) || PRIVATE_V4.test(host) || host.includes(":")) {
    throw fieldError(field, "Use a public website address");
  }
  u.hash = "";
  return u;
}

export const isFacebookUrl = (u: URL) => /(^|\.)(facebook\.com|fb\.com|fb\.me|fb\.watch)$/i.test(u.hostname);

export interface Fetched { url: string; status: number; contentType: string; bytes: Uint8Array }

const UA = "Mozilla/5.0 (compatible; NorthstarBot/1.0; +https://northstardizital.com)";

/** GET a public URL with a size cap and timeout. Throws a field error the user can read on network failure. */
export async function fetchUrl(u: URL, opts: { maxBytes?: number; accept?: string; field?: string; timeoutMs?: number } = {}): Promise<Fetched> {
  const max = opts.maxBytes ?? 3 * 1024 * 1024;
  const field = opts.field ?? "url";
  let res: Response;
  try {
    res = await fetch(u.toString(), {
      headers: { "user-agent": UA, accept: opts.accept ?? "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8", "accept-language": "en,bn;q=0.8" },
      redirect: "follow",
      signal: AbortSignal.timeout(opts.timeoutMs ?? 15000),
    });
  } catch {
    throw fieldError(field, `Couldn't open ${u.hostname}. Check the link and try again.`);
  }
  if (!res.ok) {
    await res.body?.cancel();
    throw fieldError(field, `${u.hostname} answered with error ${res.status}. Check the link is public and try again.`);
  }
  const reader = res.body?.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  if (reader) {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > max) { await reader.cancel(); throw fieldError(field, `The file at this link is larger than ${Math.round(max / 1024 / 1024)} MB`); }
      chunks.push(value);
    }
  }
  const bytes = new Uint8Array(size);
  let off = 0;
  for (const c of chunks) { bytes.set(c, off); off += c.byteLength; }
  return { url: res.url || u.toString(), status: res.status, contentType: (res.headers.get("content-type") ?? "").toLowerCase(), bytes };
}

export function decodeText(f: Fetched): string {
  const m = /charset=([^;]+)/.exec(f.contentType);
  try { return new TextDecoder(m?.[1]?.trim() || "utf-8").decode(f.bytes); } catch { return new TextDecoder().decode(f.bytes); }
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ndash: "–", mdash: "—", hellip: "…", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", copy: "©", reg: "®", trade: "™", bull: "•", middot: "·" };

export function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (all, e: string) => {
    if (e[0] === "#") {
      const n = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : all;
    }
    return ENTITIES[e.toLowerCase()] ?? all;
  });
}

/** Collapse whitespace but keep paragraph breaks. */
export function tidy(s: string): string {
  return s.replace(/[ \t\f\v ]+/g, " ").replace(/ *\n */g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

/** HTML → readable text: drops scripts, styles, nav/footer chrome and tags; keeps block breaks. */
export function htmlToText(html: string): string {
  let s = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|svg|template|iframe|canvas|form|select|button)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<(nav|header|footer)\b[\s\S]*?<\/\1>/gi, " ");
  const body = /<body\b[^>]*>([\s\S]*)<\/body>/i.exec(s);
  if (body) s = body[1];
  s = s
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<li\b[^>]*>/gi, "\n• ")
    .replace(/<\/(p|div|section|article|h[1-6]|li|tr|table|ul|ol|blockquote|dd|dt|main)>/gi, "\n")
    .replace(/<(td|th)\b[^>]*>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  return tidy(decodeEntities(s));
}

export function metaContent(html: string, name: string): string | null {
  const re = new RegExp(`<meta\\b[^>]*(?:name|property|itemprop)=["']${name.replace(/[.:]/g, "\\$&")}["'][^>]*>`, "i");
  const tag = re.exec(html)?.[0];
  const v = tag && /content=["']([^"']*)["']/i.exec(tag)?.[1];
  return v ? tidy(decodeEntities(v)) : null;
}

export function pageTitle(html: string): string | null {
  const t = metaContent(html, "og:title") ?? /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1];
  return t ? tidy(decodeEntities(t)).slice(0, 200) || null : null;
}

/** Same-site links on a page, absolute, without fragments, de-duplicated, in page order. */
export function sameSiteLinks(html: string, base: string): string[] {
  const origin = new URL(base);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of html.matchAll(/<a\b[^>]*href=["']([^"'#][^"']*)["']/gi)) {
    let u: URL;
    try { u = new URL(decodeEntities(m[1]), base); } catch { continue; }
    if (u.hostname.replace(/^www\./, "") !== origin.hostname.replace(/^www\./, "") || !/^https?:$/.test(u.protocol)) continue;
    u.hash = "";
    if (/\.(jpe?g|png|gif|webp|svg|pdf|zip|mp4|mp3|css|js|xml|ico)$/i.test(u.pathname)) continue;
    const key = u.toString().replace(/\/$/, "");
    if (key === origin.toString().replace(/\/$/, "") || seen.has(key)) continue;
    seen.add(key);
    out.push(u.toString());
  }
  return out;
}

/** Run async work over items with a small concurrency limit; failures become null. */
export async function mapLimit<T, R>(items: T[], limit: number, fn: (x: T) => Promise<R>): Promise<(R | null)[]> {
  const out: (R | null)[] = new Array(items.length).fill(null);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const k = i++;
      try { out[k] = await fn(items[k]); } catch { out[k] = null; }
    }
  }));
  return out;
}
