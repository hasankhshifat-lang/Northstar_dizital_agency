import { Hono } from "hono";
import { z } from "zod";
import type { AppEnv } from "../env";
import { clientGroup } from "../auth/middleware";
import { schedulePush } from "../agent/push";
import { newId } from "../lib/crypto";
import { parseCsvLines } from "../lib/csv";
import { tenantDb } from "../lib/db";
import { ApiError } from "../lib/errors";
import { nowIso } from "../lib/time";
import { parseBody } from "../lib/validate";
import { fetchUrl, fieldError, parsePublicUrl } from "../lib/fetch";
import { fromFeedText, scrapeProducts } from "./scrape";
import { loadProduct, loadProducts } from "./service";

export const catalogRoutes = new Hono<AppEnv>();
catalogRoutes.use("*", ...clientGroup("orders"));

const MAX_IMAGES = 8;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

const variantSchema = z.object({ id: z.string().optional(), label: z.string().trim().min(1).max(80), stock: z.number().int().min(0) });
const productSchema = z.object({
  code: z.string().trim().min(1).max(40),
  name_bn: z.string().trim().max(200).nullish(),
  name_en: z.string().trim().max(200).nullish(),
  description: z.string().max(4000).nullish(),
  category: z.string().trim().max(80).nullish(),
  price: z.number().int().min(0),
  sale_price: z.number().int().min(0).nullish(),
  status: z.enum(["active", "hidden"]).default("active"),
  variants: z.array(variantSchema).min(1).max(100).default([{ label: "Default", stock: 0 }]),
}).refine((p) => p.name_bn || p.name_en, { message: "name_bn or name_en is required", path: ["name_bn"] });

const dupError = () => new ApiError(400, "VALIDATION", { issues: [{ path: ["code"], message: "Product code already exists" }] });

catalogRoutes.get("/", async (c) => {
  const tdb = tenantDb(c.env.DB, c.var.tenant.id);
  const q = c.req.query("q")?.trim();
  const status = c.req.query("status");
  const category = c.req.query("category");
  const where: string[] = [];
  const binds: unknown[] = [];
  if (q) { binds.push(`%${q}%`); where.push(`(p.code LIKE ?${binds.length + 1} OR p.name_bn LIKE ?${binds.length + 1} OR p.name_en LIKE ?${binds.length + 1})`); }
  if (status) { binds.push(status); where.push(`p.status=?${binds.length + 1}`); }
  if (category) { binds.push(category); where.push(`p.category=?${binds.length + 1}`); }
  return c.json({ products: await loadProducts(tdb, where.join(" AND "), ...binds) });
});

catalogRoutes.post("/", async (c) => {
  const body = await parseBody(c, productSchema);
  const tdb = tenantDb(c.env.DB, c.var.tenant.id);
  if (await tdb.first("SELECT 1 FROM products WHERE tenant_id=?1 AND code=?2", body.code)) throw dupError();
  const id = newId();
  await c.env.DB.batch([
    tdb.insertStmt("products", { id, code: body.code, name_bn: body.name_bn, name_en: body.name_en, description: body.description, category: body.category, price: body.price, sale_price: body.sale_price, status: body.status, created_at: nowIso() }),
    ...body.variants.map((v) => tdb.insertStmt("product_variants", { id: newId(), product_id: id, label: v.label, stock: v.stock })),
  ]);
  await schedulePush(c.env.DB, c.var.tenant.id);
  return c.json({ product: await loadProduct(tdb, id) });
});

// ---------- Import from a link (website, Shopify/WooCommerce, catalog feed, Google Sheet) or a catalog file ----------

catalogRoutes.post("/import-link/preview", async (c) => {
  if ((c.req.header("content-type") ?? "").includes("multipart/form-data")) {
    const form = await c.req.formData().catch(() => null);
    const file = form?.get("file");
    if (!file || typeof file === "string") throw fieldError("file", "Choose a catalog file");
    if (file.size > 8 * 1024 * 1024) throw fieldError("file", "File must be 8 MB or smaller");
    const products = fromFeedText(await file.text());
    if (!products.length) throw fieldError("file", "No products found. The file needs at least title and price columns (Facebook / Google catalog format).");
    return c.json({ source: "file", products: products.slice(0, 300) });
  }
  const { url } = await parseBody(c, z.object({ url: z.string().trim().min(3).max(1000) }));
  return c.json(await scrapeProducts(url));
});

const foundSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().max(4000).nullish(),
  category: z.string().trim().max(80).nullish(),
  price: z.number().int().min(0),
  sale_price: z.number().int().min(0).nullish(),
  sku: z.string().trim().max(40).nullish(),
  images: z.array(z.string().max(1000)).max(8).default([]),
  variants: z.array(z.object({ label: z.string().trim().max(80), in_stock: z.boolean().nullish() })).max(100).default([]),
});
const IMAGES_PER_PRODUCT = 3;
const IMAGE_BUDGET = 24;

function imageExt(type: string, b: Uint8Array): [string, string] | null {
  if (IMAGE_TYPES[type]) return [IMAGE_TYPES[type], type];
  if (b[0] === 0xff && b[1] === 0xd8) return ["jpg", "image/jpeg"];
  if (b[0] === 0x89 && b[1] === 0x50) return ["png", "image/png"];
  if (b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return ["webp", "image/webp"];
  return null;
}

const hasBangla = (s: string) => /[\u0980-\u09FF]/.test(s);
const cleanCode = (s: string) => s.replace(/[^\w.-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);

/** Save confirmed products (at most 10 per call, so the browser sends large imports in batches). Copies up to 3 photos each. */
catalogRoutes.post("/import-link/save", async (c) => {
  const body = await parseBody(c, z.object({
    products: z.array(foundSchema).min(1).max(10),
    stock: z.number().int().min(0).max(100000).default(10),
    status: z.enum(["active", "hidden"]).default("active"),
  }));
  const tdb = tenantDb(c.env.DB, c.var.tenant.id);
  const imported: { id: string; code: string; name: string }[] = [];
  const skipped: { name: string; reason: string }[] = [];
  let budget = IMAGE_BUDGET;
  for (const p of body.products) {
    if (await tdb.first("SELECT 1 FROM products WHERE tenant_id=?1 AND (name_en=?2 OR name_bn=?2)", p.name)) { skipped.push({ name: p.name, reason: "Already in your products" }); continue; }
    let code = p.sku ? cleanCode(p.sku) : "";
    if (code && (await tdb.first("SELECT 1 FROM products WHERE tenant_id=?1 AND code=?2", code))) { skipped.push({ name: p.name, reason: `Code ${code} already exists` }); continue; }
    while (!code || (await tdb.first("SELECT 1 FROM products WHERE tenant_id=?1 AND code=?2", code))) code = "WEB-" + crypto.randomUUID().slice(0, 5).toUpperCase();
    const id = newId();
    const variants = p.variants.filter((v) => v.label).length
      ? p.variants.filter((v) => v.label).map((v) => ({ label: v.label, stock: v.in_stock === false ? 0 : body.stock }))
      : [{ label: "Default", stock: body.stock }];
    await c.env.DB.batch([
      tdb.insertStmt("products", {
        id, code, name_bn: hasBangla(p.name) ? p.name : null, name_en: hasBangla(p.name) ? null : p.name, description: p.description ?? null,
        category: p.category ?? null, price: p.price, sale_price: p.sale_price ?? null, status: body.status, created_at: nowIso(),
      }),
      ...variants.map((v) => tdb.insertStmt("product_variants", { id: newId(), product_id: id, label: v.label, stock: v.stock })),
    ]);
    let sort = 0;
    for (const src of p.images.slice(0, IMAGES_PER_PRODUCT)) {
      if (budget-- <= 0) break;
      try {
        const f = await fetchUrl(parsePublicUrl(src), { maxBytes: MAX_IMAGE_BYTES, accept: "image/webp,image/jpeg,image/png,image/*;q=0.8", timeoutMs: 10000 });
        const t = imageExt(f.contentType.split(";")[0].trim(), f.bytes);
        if (!t) continue;
        const key = `tenants/${c.var.tenant.id}/products/${id}/${newId()}.${t[0]}`;
        await c.env.MEDIA.put(key, f.bytes, { httpMetadata: { contentType: t[1] } });
        await tdb.insert("product_images", { id: newId(), product_id: id, r2_key: key, sort: sort++ });
      } catch { /* a photo that can't be copied doesn't stop the import */ }
    }
    imported.push({ id, code, name: p.name });
  }
  if (imported.length) await schedulePush(c.env.DB, c.var.tenant.id);
  return c.json({ imported, skipped });
});

catalogRoutes.get("/:id", async (c) => {
  const p = await loadProduct(tenantDb(c.env.DB, c.var.tenant.id), c.req.param("id"));
  if (!p) throw new ApiError(404, "NOT_FOUND");
  return c.json({ product: p });
});

catalogRoutes.patch("/:id", async (c) => {
  const tdb = tenantDb(c.env.DB, c.var.tenant.id);
  const id = c.req.param("id");
  const existing = await loadProduct(tdb, id);
  if (!existing) throw new ApiError(404, "NOT_FOUND");
  const body = await parseBody(c, z.object({
    code: z.string().trim().min(1).max(40).optional(),
    name_bn: z.string().trim().max(200).nullish(), name_en: z.string().trim().max(200).nullish(),
    description: z.string().max(4000).nullish(), category: z.string().trim().max(80).nullish(),
    price: z.number().int().min(0).optional(), sale_price: z.number().int().min(0).nullish(),
    status: z.enum(["active", "hidden"]).optional(),
    variants: z.array(variantSchema).min(1).max(100).optional(),
  }));
  if (body.code && body.code !== existing.code && (await tdb.first("SELECT 1 FROM products WHERE tenant_id=?1 AND code=?2", body.code))) throw dupError();
  const { variants, ...fields } = body;
  const stmts: D1PreparedStatement[] = [];
  if (Object.keys(fields).length) stmts.push(tdb.updateStmt("products", id, fields));
  if (variants) {
    const keep = new Set(variants.filter((v) => v.id).map((v) => v.id));
    for (const old of existing.variants) if (!keep.has(old.id)) stmts.push(tdb.prepare("DELETE FROM product_variants WHERE tenant_id=?1 AND id=?2", [old.id]));
    for (const v of variants) {
      if (v.id && existing.variants.some((o) => o.id === v.id)) stmts.push(tdb.updateStmt("product_variants", v.id, { label: v.label, stock: v.stock }));
      else stmts.push(tdb.insertStmt("product_variants", { id: newId(), product_id: id, label: v.label, stock: v.stock }));
    }
  }
  if (stmts.length) await c.env.DB.batch(stmts);
  await schedulePush(c.env.DB, c.var.tenant.id);
  return c.json({ product: await loadProduct(tdb, id) });
});

catalogRoutes.delete("/:id", async (c) => {
  const tdb = tenantDb(c.env.DB, c.var.tenant.id);
  const p = await loadProduct(tdb, c.req.param("id"));
  if (!p) throw new ApiError(404, "NOT_FOUND");
  if (p.images.length) await c.env.MEDIA.delete(p.images.map((i) => i.r2_key));
  await c.env.DB.batch([
    tdb.prepare("DELETE FROM product_images WHERE tenant_id=?1 AND product_id=?2", [p.id]),
    tdb.prepare("DELETE FROM product_variants WHERE tenant_id=?1 AND product_id=?2", [p.id]),
    tdb.prepare("DELETE FROM products WHERE tenant_id=?1 AND id=?2", [p.id]),
  ]);
  await schedulePush(c.env.DB, c.var.tenant.id);
  return c.json({ ok: true });
});

catalogRoutes.post("/:id/images", async (c) => {
  const tdb = tenantDb(c.env.DB, c.var.tenant.id);
  const p = await loadProduct(tdb, c.req.param("id"));
  if (!p) throw new ApiError(404, "NOT_FOUND");
  const form = await c.req.formData().catch(() => null);
  const file = form?.get("file");
  const invalid = (message: string) => new ApiError(400, "VALIDATION", { issues: [{ path: ["file"], message }] });
  if (!file || typeof file === "string") throw invalid("Image file is required");
  const ext = IMAGE_TYPES[file.type];
  if (!ext) throw invalid("Only JPEG, PNG or WebP images");
  if (file.size > MAX_IMAGE_BYTES) throw invalid("Image must be 5 MB or smaller");
  if (p.images.length >= MAX_IMAGES) throw invalid("At most 8 images per product");
  const key = `tenants/${c.var.tenant.id}/products/${p.id}/${newId()}.${ext}`;
  await c.env.MEDIA.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
  await tdb.insert("product_images", { id: newId(), product_id: p.id, r2_key: key, sort: p.images.length });
  return c.json({ product: await loadProduct(tdb, p.id) });
});

catalogRoutes.delete("/:id/images/:imageId", async (c) => {
  const tdb = tenantDb(c.env.DB, c.var.tenant.id);
  const img = await tdb.first<{ id: string; r2_key: string }>("SELECT id, r2_key FROM product_images WHERE tenant_id=?1 AND id=?2 AND product_id=?3", c.req.param("imageId"), c.req.param("id"));
  if (!img) throw new ApiError(404, "NOT_FOUND");
  await c.env.MEDIA.delete(img.r2_key);
  await tdb.del("product_images", img.id);
  return c.json({ product: await loadProduct(tdb, c.req.param("id")) });
});

const COLUMNS = ["code", "name_bn", "name_en", "category", "price", "sale_price", "variant", "stock", "description"] as const;

const takaToPoisha = (s: string): number | null => {
  const t = s.replace(/[,৳\s]/g, "");
  if (t === "") return null;
  if (!/^\d+(\.\d{1,2})?$/.test(t)) return NaN;
  return Math.round(Number(t) * 100);
};

catalogRoutes.post("/import", async (c) => {
  const tdb = tenantDb(c.env.DB, c.var.tenant.id);
  const form = await c.req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || typeof file === "string") throw new ApiError(400, "VALIDATION", { issues: [{ path: ["file"], message: "CSV file is required" }] });
  const records = parseCsvLines(await file.text());
  if (!records.length) throw new ApiError(400, "VALIDATION", { issues: [{ path: ["file"], message: "Empty file" }] });
  const header = records[0].cells.map((h) => h.trim().toLowerCase());
  const idx = Object.fromEntries(COLUMNS.map((k) => [k, header.indexOf(k)])) as Record<(typeof COLUMNS)[number], number>;
  if (idx.code < 0 || idx.price < 0) throw new ApiError(400, "VALIDATION", { issues: [{ path: ["file"], message: "Header must include code and price" }] });
  const get = (cells: string[], k: (typeof COLUMNS)[number]) => (idx[k] >= 0 ? (cells[idx[k]] ?? "").trim() : "");

  const errors: { line: number; message: string }[] = [];
  const groups = new Map<string, { line: number; cells: string[] }[]>();
  for (const r of records.slice(1)) {
    const code = get(r.cells, "code");
    if (!code) { errors.push({ line: r.line, message: "Missing code" }); continue; }
    const price = takaToPoisha(get(r.cells, "price"));
    const sale = takaToPoisha(get(r.cells, "sale_price"));
    const stockRaw = get(r.cells, "stock");
    if (price === null || Number.isNaN(price)) { errors.push({ line: r.line, message: "Invalid price" }); continue; }
    if (Number.isNaN(sale)) { errors.push({ line: r.line, message: "Invalid sale_price" }); continue; }
    if (stockRaw && !/^\d+$/.test(stockRaw)) { errors.push({ line: r.line, message: "Invalid stock" }); continue; }
    if (!get(r.cells, "name_bn") && !get(r.cells, "name_en")) { errors.push({ line: r.line, message: "Missing name" }); continue; }
    (groups.get(code) ?? groups.set(code, []).get(code)!).push(r);
  }

  let imported = 0;
  const now = nowIso();
  for (const [code, rows] of groups) {
    if (await tdb.first("SELECT 1 FROM products WHERE tenant_id=?1 AND code=?2", code)) {
      for (const r of rows) errors.push({ line: r.line, message: "Product code already exists" });
      continue;
    }
    const first = rows[0].cells;
    const id = newId();
    await c.env.DB.batch([
      tdb.insertStmt("products", {
        id, code, name_bn: get(first, "name_bn") || null, name_en: get(first, "name_en") || null, category: get(first, "category") || null,
        description: get(first, "description") || null, price: takaToPoisha(get(first, "price")), sale_price: takaToPoisha(get(first, "sale_price")),
        status: "active", created_at: now,
      }),
      ...rows.map((r) => tdb.insertStmt("product_variants", { id: newId(), product_id: id, label: get(r.cells, "variant") || "Default", stock: Number(get(r.cells, "stock") || 0) })),
    ]);
    imported++;
  }
  errors.sort((a, b) => a.line - b.line);
  if (imported) await schedulePush(c.env.DB, c.var.tenant.id);
  return c.json({ imported, errors });
});
