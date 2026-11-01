import type { TenantDb } from "../lib/db";

export interface Variant { id: string; label: string; stock: number }
export interface ProductImage { id: string; r2_key: string; url: string; sort: number }
export interface Product {
  id: string; code: string; name_bn: string | null; name_en: string | null; description: string | null; category: string | null;
  price: number; sale_price: number | null; status: "active" | "hidden"; created_at: string;
  variants: Variant[]; images: ProductImage[];
}

export const mediaUrl = (key: string) => `/media/${key}`;
export const productName = (p: { name_bn: string | null; name_en: string | null; code: string }) => p.name_bn || p.name_en || p.code;

/** Load products (with variants and images) matching an optional extra WHERE on `p`. Extra params start at ?2. */
export async function loadProducts(tdb: TenantDb, where = "", ...binds: unknown[]): Promise<Product[]> {
  const products = await tdb.all<Omit<Product, "variants" | "images">>(
    `SELECT * FROM products p WHERE p.tenant_id=?1 ${where ? "AND " + where : ""} ORDER BY p.created_at DESC`, ...binds,
  );
  if (!products.length) return [];
  const [variants, images] = await Promise.all([
    tdb.all<Variant & { product_id: string }>("SELECT id, product_id, label, stock FROM product_variants WHERE tenant_id=?1 ORDER BY rowid"),
    tdb.all<{ id: string; product_id: string; r2_key: string; sort: number }>("SELECT id, product_id, r2_key, sort FROM product_images WHERE tenant_id=?1 ORDER BY sort, rowid"),
  ]);
  const vBy = new Map<string, Variant[]>();
  for (const v of variants) (vBy.get(v.product_id) ?? vBy.set(v.product_id, []).get(v.product_id)!).push({ id: v.id, label: v.label, stock: v.stock });
  const iBy = new Map<string, ProductImage[]>();
  for (const i of images) (iBy.get(i.product_id) ?? iBy.set(i.product_id, []).get(i.product_id)!).push({ id: i.id, r2_key: i.r2_key, url: mediaUrl(i.r2_key), sort: i.sort });
  return products.map((p) => ({ ...p, variants: vBy.get(p.id) ?? [], images: iBy.get(p.id) ?? [] }));
}

export async function loadProduct(tdb: TenantDb, id: string): Promise<Product | null> {
  return (await loadProducts(tdb, "p.id=?2", id))[0] ?? null;
}
