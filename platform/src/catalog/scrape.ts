import { parseCsvLines } from "../lib/csv";
import { decodeEntities, decodeText, fetchUrl, fieldError, htmlToText, isFacebookUrl, mapLimit, metaContent, pageTitle, parsePublicUrl, sameSiteLinks, tidy, type Fetched } from "../lib/fetch";

/** A product found at a link, before the user confirms the import. Money in poisha. */
export interface FoundProduct {
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  sale_price: number | null;
  sku: string | null;
  images: string[];
  url: string | null;
  variants: { label: string; in_stock: boolean | null }[];
}

export interface ScrapeResult { source: string; products: FoundProduct[] }

const MAX_PRODUCTS = 300;
const MAX_PRODUCT_PAGES = 20;
const BN_DIGITS = /[০-৯]/g;

/** "৳ 1,250.00", "1250 BDT", "Tk. ১২৫০", 1250 → 125000 poisha. Null when there's no number. */
export function parseMoney(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) && v >= 0 ? Math.round(v * 100) : null;
  if (typeof v !== "string") return null;
  const s = v.replace(BN_DIGITS, (d) => String(d.charCodeAt(0) - 0x09e6));
  const m = /\d[\d,]*(?:\.\d+)?/.exec(s);
  if (!m) return null;
  const n = Number(m[0].replace(/,/g, ""));
  return Number.isFinite(n) ? Math.round(n * 100) : null;
}

const str = (v: unknown): string | null => (typeof v === "string" && v.trim() ? tidy(decodeEntities(v)) : typeof v === "number" ? String(v) : null);
const textOf = (html: unknown): string | null => { const s = str(html); return s ? htmlToText(s).slice(0, 4000) || null : null; };
const abs = (u: unknown, base: string): string | null => { const s = str(u); if (!s) return null; try { return new URL(s.startsWith("//") ? "https:" + s : s, base).toString(); } catch { return null; } };
const uniq = <T,>(xs: T[]) => [...new Set(xs)];

type Draft = Omit<Partial<FoundProduct>, "name" | "price"> & { name: string | null; price: number | null };

function product(p: Draft): FoundProduct | null {
  if (!p.name || p.price == null) return null;
  let price = p.price;
  let sale = p.sale_price ?? null;
  if (sale != null && sale > price) [price, sale] = [sale, price];
  if (sale != null && sale === price) sale = null;
  return {
    name: p.name.slice(0, 200), description: p.description ?? null, category: p.category?.slice(0, 80) ?? null, price, sale_price: sale,
    sku: p.sku ? p.sku.slice(0, 40) : null, images: uniq(p.images ?? []).slice(0, 8), url: p.url ?? null, variants: p.variants ?? [],
  };
}

// ---------- Shopify (/products.json) ----------
export function fromShopify(json: any, base: string): FoundProduct[] {
  const list: any[] = Array.isArray(json?.products) ? json.products : json?.product ? [json.product] : [];
  return list.map((p) => {
    const vs: any[] = Array.isArray(p.variants) ? p.variants : [];
    const v0 = vs[0] ?? {};
    const compare = parseMoney(v0.compare_at_price);
    const price = parseMoney(v0.price);
    return product({
      name: str(p.title), description: textOf(p.body_html), category: str(p.product_type), sku: str(v0.sku),
      price: compare && price != null && compare > price ? compare : price, sale_price: compare && price != null && compare > price ? price : null,
      images: (p.images ?? []).map((i: any) => abs(i?.src, base)).filter(Boolean),
      url: p.handle ? new URL(`/products/${p.handle}`, base).toString() : null,
      variants: vs.length > 1 || (v0.title && v0.title !== "Default Title") ? vs.map((v) => ({ label: String(v.title ?? "").slice(0, 80), in_stock: typeof v.available === "boolean" ? v.available : null })) : [],
    });
  }).filter((x): x is FoundProduct => !!x);
}

// ---------- WooCommerce Store API ----------
export function fromWoo(json: any, base: string): FoundProduct[] {
  if (!Array.isArray(json)) return [];
  return json.map((p: any) => {
    const pr = p.prices ?? {};
    const unit = 10 ** Number(pr.currency_minor_unit ?? 2);
    const minor = (v: unknown) => { const n = Number(v); return v === "" || v == null || !Number.isFinite(n) ? null : Math.round((n / unit) * 100); };
    const regular = minor(pr.regular_price);
    const current = minor(pr.price);
    return product({
      name: str(p.name), description: textOf(p.short_description) ?? textOf(p.description), category: str(p.categories?.[0]?.name), sku: str(p.sku),
      price: regular ?? current, sale_price: regular != null && current != null && current < regular ? current : null,
      images: (p.images ?? []).map((i: any) => abs(i?.src, base)).filter(Boolean), url: str(p.permalink),
      variants: [], 
    });
  }).filter((x): x is FoundProduct => !!x);
}

// ---------- schema.org JSON-LD and Open Graph in HTML ----------
function ldNodes(html: string): any[] {
  const out: any[] = [];
  const walk = (n: any) => {
    if (!n || typeof n !== "object") return;
    if (Array.isArray(n)) return n.forEach(walk);
    out.push(n);
    if (n["@graph"]) walk(n["@graph"]);
    if (n.itemListElement) walk(n.itemListElement);
    if (n.item) walk(n.item);
    if (n.hasVariant) walk(n.hasVariant);
  };
  for (const m of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { walk(JSON.parse(m[1].trim())); } catch { /* broken JSON-LD on the page: skip it */ }
  }
  return out;
}

const isType = (n: any, t: string) => [n?.["@type"]].flat().some((x) => typeof x === "string" && x.toLowerCase() === t.toLowerCase());

function ldProduct(n: any, base: string): FoundProduct | null {
  const offers = [n.offers].flat().filter(Boolean);
  const o = offers[0] ?? {};
  const price = parseMoney(o.price ?? o.lowPrice ?? o.priceSpecification?.price ?? [o.priceSpecification].flat()[0]?.price);
  const listPrice = parseMoney(o.highPrice) ?? null;
  const img = [n.image].flat().map((i: any) => abs(typeof i === "object" ? i?.url ?? i?.contentUrl : i, base)).filter(Boolean) as string[];
  const avail = (x: any) => (typeof x?.availability === "string" ? !/OutOfStock|SoldOut|Discontinued/i.test(x.availability) : null);
  return product({
    name: str(n.name), description: textOf(n.description), category: str(typeof n.category === "object" ? n.category?.name : n.category),
    sku: str(n.sku ?? n.mpn ?? n.productID), price, sale_price: listPrice && price != null && listPrice > price && o["@type"] !== "AggregateOffer" ? price : null,
    images: img, url: abs(n.url ?? o.url, base),
    variants: offers.length > 1 ? offers.map((x: any, i: number) => ({ label: str(x.name) ?? str(x.sku) ?? `Option ${i + 1}`, in_stock: avail(x) })) : [],
  });
}

export function fromHtml(html: string, base: string): FoundProduct[] {
  const found = ldNodes(html).filter((n) => isType(n, "Product") || isType(n, "ProductGroup")).map((n) => ldProduct(n, base)).filter((x): x is FoundProduct => !!x);
  if (found.length) return found;
  const ogType = metaContent(html, "og:type");
  const price = parseMoney(metaContent(html, "product:price:amount") ?? metaContent(html, "og:price:amount") ?? metaContent(html, "price"));
  if ((ogType && /product/i.test(ogType)) || price != null) {
    const p = product({
      name: pageTitle(html), price, sale_price: parseMoney(metaContent(html, "product:sale_price:amount")), description: metaContent(html, "og:description") ?? metaContent(html, "description"),
      images: [abs(metaContent(html, "og:image"), base)].filter(Boolean) as string[], url: abs(metaContent(html, "og:url"), base) ?? base,
      category: metaContent(html, "product:category"), sku: metaContent(html, "product:retailer_item_id"),
    });
    if (p) return [p];
  }
  return [];
}

// ---------- Catalog feeds (Facebook/Meta Commerce Manager, Google Merchant): CSV, TSV or XML ----------
type Row = Record<string, string>;

function feedRows(rows: Row[], base: string): FoundProduct[] {
  const pick = (r: Row, ...keys: string[]) => { for (const k of keys) if (r[k]?.trim()) return r[k].trim(); return ""; };
  const groups = new Map<string, Row[]>();
  for (const r of rows) {
    const key = pick(r, "item_group_id", "g:item_group_id") || pick(r, "id", "g:id", "sku") || pick(r, "title", "g:title", "name");
    if (!key) continue;
    (groups.get(key) ?? groups.set(key, []).get(key)!).push(r);
  }
  const out: FoundProduct[] = [];
  for (const [group, rs] of groups) {
    const r = rs[0];
    const inStock = (x: Row) => { const a = pick(x, "availability", "g:availability").toLowerCase(); return a ? !/out|discontinued/.test(a) : null; };
    const label = (x: Row) => [pick(x, "size", "g:size"), pick(x, "color", "g:color"), pick(x, "pattern", "material")].filter(Boolean).join(" / ");
    const imgs = [pick(r, "image_link", "g:image_link", "image", "image_url"), ...pick(r, "additional_image_link", "g:additional_image_link").split(/[,\s]+/)];
    const p = product({
      name: pick(r, "title", "g:title", "name") || null, description: textOf(pick(r, "description", "g:description", "rich_text_description")),
      category: pick(r, "product_type", "g:product_type", "custom_label_0", "category") || null,
      sku: rs.length > 1 ? group : pick(r, "id", "g:id", "sku", "retailer_id") || null,
      price: parseMoney(pick(r, "price", "g:price")), sale_price: parseMoney(pick(r, "sale_price", "g:sale_price")),
      images: imgs.map((i) => abs(i, base)).filter(Boolean) as string[], url: abs(pick(r, "link", "g:link", "url"), base),
      variants: rs.length > 1 ? rs.map((x, i) => ({ label: label(x) || pick(x, "id", "g:id") || `Option ${i + 1}`, in_stock: inStock(x) })) : [],
    });
    if (p) out.push(p);
  }
  return out;
}

export function fromCsvFeed(text: string, base: string): FoundProduct[] {
  const firstLine = text.slice(0, text.indexOf("\n") >>> 0);
  const tsv = firstLine.split("\t").length > firstLine.split(",").length;
  const records = tsv
    ? text.split(/\r?\n/).filter((l) => l.trim()).map((l, i) => ({ line: i + 1, cells: l.split("\t") }))
    : parseCsvLines(text);
  if (records.length < 2) return [];
  const head = records[0].cells.map((h) => h.trim().replace(/^﻿/, "").toLowerCase());
  if (!head.some((h) => /^(g:)?(title|name)$/.test(h)) || !head.some((h) => /^(g:)?price$/.test(h))) return [];
  return feedRows(records.slice(1).map((r) => Object.fromEntries(head.map((h, i) => [h, r.cells[i] ?? ""]))), base);
}

export function fromXmlFeed(xml: string, base: string): FoundProduct[] {
  const items = [...xml.matchAll(/<(item|entry)\b[^>]*>([\s\S]*?)<\/\1>/gi)].map((m) => m[2]);
  const rows = items.map((body) => {
    const r: Row = {};
    for (const f of body.matchAll(/<([a-z_:]+)\b[^>]*>([\s\S]*?)<\/\1>/gi)) {
      const k = f[1].toLowerCase();
      const v = f[2].replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, "$1").trim();
      if (!(k in r)) r[k] = decodeEntities(v);
      else if (/additional_image_link$/.test(k)) r[k] += "," + decodeEntities(v);
    }
    for (const [k, v] of Object.entries(r)) if (k.startsWith("g:") && !r[k.slice(2)]) r[k.slice(2)] = v;
    return r;
  });
  return feedRows(rows, base);
}

/** Parse an uploaded catalog file (CSV/TSV/XML) exported from Facebook Commerce Manager or similar. */
export function fromFeedText(text: string, base = "https://example.invalid/"): FoundProduct[] {
  return /^\s*(<\?xml|<rss|<feed)/i.test(text) ? fromXmlFeed(text, base) : fromCsvFeed(text, base);
}

// ---------- Orchestration ----------
const PRODUCT_LINK = /\/(products?|item|items|shop|p|dp|store)\/[^/?#]+/i;

/** Google Sheets share links → CSV export of the same tab. */
function sheetCsvUrl(u: URL): URL | null {
  const m = /^\/spreadsheets\/d\/([\w-]+)/.exec(u.pathname);
  if (u.hostname !== "docs.google.com" || !m) return null;
  const gid = /gid=(\d+)/.exec(u.hash + u.search)?.[1] ?? "0";
  return new URL(`https://docs.google.com/spreadsheets/d/${m[1]}/export?format=csv&gid=${gid}`);
}

async function tryJson(u: URL): Promise<any | null> {
  try {
    const f = await fetchUrl(u, { accept: "application/json", timeoutMs: 12000 });
    return /json/.test(f.contentType) ? JSON.parse(decodeText(f)) : null;
  } catch { return null; }
}

function parseFetched(f: Fetched, base: string): FoundProduct[] {
  const text = decodeText(f);
  if (/json/.test(f.contentType) || /^\s*[[{]/.test(text.slice(0, 50))) {
    try { const j = JSON.parse(text); return [...fromShopify(j, base), ...fromWoo(j, base)]; } catch { return []; }
  }
  if (/xml|rss/.test(f.contentType) || /^\s*(<\?xml|<rss|<feed)/i.test(text)) return fromXmlFeed(text, base);
  if (/csv|tab-separated|text\/plain/.test(f.contentType)) return fromCsvFeed(text, base);
  return fromHtml(text, base);
}

/** Find products at a link: a shop or category page, a single product page, a catalog feed, or a Google Sheet. */
export async function scrapeProducts(raw: string): Promise<ScrapeResult> {
  let u = parsePublicUrl(raw);
  if (isFacebookUrl(u)) {
    throw fieldError("url", "Facebook doesn't let other sites read shop pages. In Meta Commerce Manager go to Catalog → Data sources, then copy your data feed link and paste it here, or export the catalog and upload the file below.");
  }
  u = sheetCsvUrl(u) ?? u;
  const first = await fetchUrl(u, { maxBytes: 8 * 1024 * 1024 });
  const base = first.url;
  const text = decodeText(first);
  const isHtml = /html/.test(first.contentType) || /<html|<body/i.test(text.slice(0, 3000));
  if (!isHtml) {
    const products = parseFetched(first, base);
    return { source: /json/.test(first.contentType) ? "json" : "feed", products: products.slice(0, MAX_PRODUCTS) };
  }

  const origin = new URL("/", base);
  // Shopify and WooCommerce publish the whole catalogue as JSON, with all details.
  if (/cdn\.shopify\.com|Shopify\.shop|shopify-section/i.test(text)) {
    const col = /^\/collections\/[^/]+/.exec(new URL(base).pathname)?.[0] ?? "";
    const j = await tryJson(new URL(`${col}/products.json?limit=250`, origin));
    const products = j ? fromShopify(j, base) : [];
    if (products.length) return { source: "shopify", products: products.slice(0, MAX_PRODUCTS) };
  }
  if (/woocommerce|wp-content/i.test(text)) {
    const j = await tryJson(new URL("/wp-json/wc/store/v1/products?per_page=100", origin));
    const products = j ? fromWoo(j, base) : [];
    if (products.length) return { source: "woocommerce", products: products.slice(0, MAX_PRODUCTS) };
  }

  const onPage = fromHtml(text, base);
  if (onPage.length >= 3) return { source: "page", products: onPage.slice(0, MAX_PRODUCTS) };

  // A category page without structured data: open the product pages it links to.
  const links = sameSiteLinks(text, base).filter((l) => PRODUCT_LINK.test(new URL(l).pathname) && l !== base).slice(0, MAX_PRODUCT_PAGES);
  const pages = await mapLimit(links, 5, async (l) => {
    const f = await fetchUrl(new URL(l), { maxBytes: 3 * 1024 * 1024, timeoutMs: 10000 });
    return fromHtml(decodeText(f), f.url).slice(0, 1);
  });
  const seen = new Set(onPage.map((p) => p.url ?? p.name));
  const all = [...onPage];
  for (const p of pages.flat()) if (p && !seen.has(p.url ?? p.name)) { seen.add(p.url ?? p.name); all.push(p); }
  if (!all.length) {
    throw fieldError("url", "No products with prices were found at this link. Try a shop or category page, a single product page, your catalog feed link, or upload a catalog file.");
  }
  return { source: "page", products: all.slice(0, MAX_PRODUCTS) };
}
