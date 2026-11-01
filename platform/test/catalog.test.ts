import { describe, it, expect } from "vitest";
import { call, json, makeClient, testEnv, uniq } from "./helpers";
import { parseCsv, toCsv } from "../src/lib/csv";

const product = (extra: Record<string, unknown> = {}) => ({
  code: uniq("KD"), name_bn: "মাস্টার্ড কিডস ড্রেস", name_en: "Mustard Kids Dress", category: "Kids", price: 125000,
  variants: [{ label: "S", stock: 3 }, { label: "M", stock: 2 }], ...extra,
});

async function upload(cookie: string, pid: string, type: string, bytes: number) {
  const fd = new FormData();
  fd.append("file", new File([new Uint8Array(bytes)], "x", { type }));
  return call(`/api/products/${pid}/images`, { method: "POST", cookie, body: fd });
}

describe("csv lib", () => {
  it("parses quotes, commas, BOM, Bangla", () => {
    expect(parseCsv('﻿a,b\n"Navy, Kids","He said ""hi"""\nপাঞ্জাবি,2\n')).toEqual([["a", "b"], ["Navy, Kids", 'He said "hi"'], ["পাঞ্জাবি", "2"]]);
  });
  it("toCsv adds BOM and escapes", () => {
    const s = toCsv([["a", "b,c"], ["x\"y", "1"]]);
    expect(s.charCodeAt(0)).toBe(0xfeff);
    expect(s).toContain('"b,c"');
    expect(s).toContain('"x""y"');
  });
});

describe("products API", () => {
  it("CRUD with variants", async () => {
    const c = await makeClient();
    let r = await call("/api/products", { method: "POST", cookie: c.cookie, json: product() });
    expect(r.status).toBe(200);
    const p = (await json(r)).product;
    expect(p.variants.map((v: any) => v.label)).toEqual(["S", "M"]);
    const vS = p.variants[0];
    r = await call(`/api/products/${p.id}`, { method: "PATCH", cookie: c.cookie, json: { price: 130000, variants: [{ id: vS.id, label: "S", stock: 9 }, { label: "L", stock: 1 }] } });
    const up = (await json(r)).product;
    expect(up.price).toBe(130000);
    expect(up.variants.map((v: any) => [v.label, v.stock])).toEqual([["S", 9], ["L", 1]]);
    expect(up.variants[0].id).toBe(vS.id);
    const list = await json(await call("/api/products?q=Mustard", { cookie: c.cookie }));
    expect(list.products.length).toBe(1);
    expect((await call(`/api/products/${p.id}`, { method: "DELETE", cookie: c.cookie })).status).toBe(200);
    expect((await call(`/api/products/${p.id}`, { cookie: c.cookie })).status).toBe(404);
  });
  it("duplicate code is VALIDATION", async () => {
    const c = await makeClient();
    const body = product();
    await call("/api/products", { method: "POST", cookie: c.cookie, json: body });
    const r = await call("/api/products", { method: "POST", cookie: c.cookie, json: body });
    expect(r.status).toBe(400);
    expect((await json(r)).code).toBe("VALIDATION");
  });
  it("orders feature is required", async () => {
    const c = await makeClient({ features: ["inbox"] });
    expect((await call("/api/products", { cookie: c.cookie })).status).toBe(403);
  });
  it("tenant B cannot read tenant A's product", async () => {
    const A = await makeClient();
    const B = await makeClient();
    const p = (await json(await call("/api/products", { method: "POST", cookie: A.cookie, json: product() }))).product;
    expect((await call(`/api/products/${p.id}`, { cookie: B.cookie })).status).toBe(404);
    expect((await call(`/api/products/${p.id}`, { method: "PATCH", cookie: B.cookie, json: { price: 1 } })).status).toBe(404);
  });
});

describe("product images", () => {
  it("accepts jpeg/png/webp up to 5MB, max 8, rejects gif and big files; serves via /media", async () => {
    const c = await makeClient();
    const p = (await json(await call("/api/products", { method: "POST", cookie: c.cookie, json: product() }))).product;
    expect((await upload(c.cookie, p.id, "image/gif", 100)).status).toBe(400);
    expect((await upload(c.cookie, p.id, "image/jpeg", 6 * 1024 * 1024)).status).toBe(400);
    let last: any;
    for (let i = 0; i < 8; i++) {
      const r = await upload(c.cookie, p.id, ["image/jpeg", "image/png", "image/webp"][i % 3], 1000);
      expect(r.status).toBe(200);
      last = await json(r);
    }
    expect((await upload(c.cookie, p.id, "image/png", 1000)).status).toBe(400);
    const img = last.product.images[0];
    expect(img.url).toMatch(new RegExp(`^/media/tenants/${c.tenantId}/`));
    const m = await call(img.url);
    expect(m.status).toBe(200);
    expect((await call(`/api/products/${p.id}/images/${img.id}`, { method: "DELETE", cookie: c.cookie })).status).toBe(200);
    expect((await call(img.url)).status).toBe(404);
  });
});

describe("CSV import", () => {
  it("imports good rows, groups variants by code, reports bad rows by line", async () => {
    const c = await makeClient();
    const dupCode = uniq("DUP");
    await call("/api/products", { method: "POST", cookie: c.cookie, json: product({ code: dupCode }) });
    const csv = [
      "code,name_bn,name_en,category,price,sale_price,variant,stock,description",
      `KD9101,মাস্টার্ড কিডস ড্রেস,Mustard Kids Dress,Kids,1250,,"Navy, Kids",4,সুতি কাপড়`,
      `PJ8101,নেভি পাঞ্জাবি,Navy Panjabi,Men,2250,1990,L,5,`,
      `${dupCode},ডুপ্লিকেট,Dup,Men,100,,M,1,`,
      `KD9101,মাস্টার্ড কিডস ড্রেস,Mustard Kids Dress,Kids,1250,,S,2,`,
      `BAD1,খারাপ,Bad,Men,notaprice,,M,1,`,
    ].join("\n");
    const fd = new FormData();
    fd.append("file", new File([csv], "p.csv", { type: "text/csv" }));
    const r = await call("/api/products/import", { method: "POST", cookie: c.cookie, body: fd });
    expect(r.status).toBe(200);
    const body = await json(r);
    expect(body.imported).toBe(2);
    expect(body.errors.map((e: any) => e.line)).toEqual([4, 6]);
    const list = await json(await call("/api/products?q=KD9101", { cookie: c.cookie }));
    const kd = list.products[0];
    expect(kd.price).toBe(125000);
    expect(kd.variants.map((v: any) => v.label)).toEqual(["Navy, Kids", "S"]);
    const pj = (await json(await call("/api/products?q=PJ8101", { cookie: c.cookie }))).products[0];
    expect(pj.sale_price).toBe(199000);
  });
});
