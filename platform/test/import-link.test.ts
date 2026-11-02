import { afterEach, describe, expect, it, vi } from "vitest";
import { call, json, makeClient, testEnv } from "./helpers";
import { stubWeb } from "./web-stub";
import { fromFeedText, fromHtml, parseMoney } from "../src/catalog/scrape";

afterEach(() => vi.restoreAllMocks());

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);

describe("product scraping", () => {
  it("parses money in taka formats", () => {
    expect(parseMoney("৳ 1,250.50")).toBe(125050);
    expect(parseMoney("1250 BDT")).toBe(125000);
    expect(parseMoney("Tk. ১২৫০")).toBe(125000);
    expect(parseMoney(99)).toBe(9900);
    expect(parseMoney("free")).toBeNull();
  });

  it("reads schema.org products from a page", () => {
    const html = `<script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"Product","name":"Blue Panjabi","sku":"BP-1","image":["/img/bp.jpg"],
      "description":"<p>Cotton &amp; silk</p>","offers":{"@type":"Offer","price":"2500","priceCurrency":"BDT","availability":"https://schema.org/InStock"}}]}</script>`;
    expect(fromHtml(html, "https://shop.test/x")).toEqual([expect.objectContaining({ name: "Blue Panjabi", sku: "BP-1", price: 250000, description: "Cotton & silk", images: ["https://shop.test/img/bp.jpg"] })]);
  });

  it("reads a Facebook catalog CSV with variants grouped by item_group_id", () => {
    const csv = `id,title,description,availability,condition,price,sale_price,link,image_link,brand,item_group_id,size
S-1,Kids Dress,Soft cotton,in stock,new,1200.00 BDT,950.00 BDT,https://shop.test/kd,https://shop.test/kd.jpg,Meghna,KD,S
S-2,Kids Dress,Soft cotton,out of stock,new,1200.00 BDT,950.00 BDT,https://shop.test/kd,https://shop.test/kd.jpg,Meghna,KD,M
T-1,Tote Bag,Jute bag,in stock,new,450 BDT,,https://shop.test/tb,https://shop.test/tb.jpg,Meghna,,`;
    const ps = fromFeedText(csv);
    expect(ps).toHaveLength(2);
    expect(ps[0]).toMatchObject({ name: "Kids Dress", sku: "KD", price: 120000, sale_price: 95000, variants: [{ label: "S", in_stock: true }, { label: "M", in_stock: false }] });
    expect(ps[1]).toMatchObject({ name: "Tote Bag", sku: "T-1", price: 45000, sale_price: null, variants: [] });
  });

  it("reads an XML (RSS) catalog feed", () => {
    const xml = `<?xml version="1.0"?><rss xmlns:g="http://base.google.com/ns/1.0"><channel><item><g:id>N1</g:id><g:title><![CDATA[Nakshi Kantha]]></g:title>
      <g:price>3,000 BDT</g:price><g:image_link>https://shop.test/n.jpg</g:image_link><g:product_type>Home &amp; Living</g:product_type></item></channel></rss>`;
    expect(fromFeedText(xml)).toEqual([expect.objectContaining({ name: "Nakshi Kantha", sku: "N1", price: 300000, category: "Home & Living" })]);
  });
});

describe("import products from a link", () => {
  it("finds Shopify products, then imports them with photos, skipping duplicates", async () => {
    const c = await makeClient();
    stubWeb({
      "https://store.test/collections/kids": { body: `<html><body><script src="https://cdn.shopify.com/x.js"></script></body></html>` },
      "https://store.test/collections/kids/products.json?limit=250": { type: "application/json", body: JSON.stringify({ products: [
        { title: "Mustard Kids Dress", handle: "mustard", body_html: "<p>For 2-6 years</p>", product_type: "Kids", images: [{ src: "https://cdn.test/m.png" }],
          variants: [{ title: "2Y", sku: "MK-2", price: "950.00", compare_at_price: "1200.00", available: true }, { title: "4Y", sku: "MK-4", price: "950.00", compare_at_price: "1200.00", available: false }] },
        { title: "পাঞ্জাবি", handle: "p", body_html: "", images: [], variants: [{ title: "Default Title", sku: "", price: "2500.00" }] },
      ] }) },
      "https://cdn.test/m.png": { type: "image/png", body: PNG },
    });
    const prev = await json(await call("/api/products/import-link/preview", { method: "POST", cookie: c.cookie, json: { url: "store.test/collections/kids" } }));
    expect(prev.source).toBe("shopify");
    expect(prev.products).toHaveLength(2);
    expect(prev.products[0]).toMatchObject({ name: "Mustard Kids Dress", price: 120000, sale_price: 95000, category: "Kids" });

    const save = await json(await call("/api/products/import-link/save", { method: "POST", cookie: c.cookie, json: { products: prev.products, stock: 7 } }));
    expect(save.imported).toHaveLength(2);
    expect(save.imported[0].code).toBe("MK-2");
    const list = (await json(await call("/api/products", { cookie: c.cookie }))).products;
    const dress = list.find((p: any) => p.name_en === "Mustard Kids Dress");
    expect(dress.variants.map((v: any) => [v.label, v.stock])).toEqual([["2Y", 7], ["4Y", 0]]);
    expect(dress.images).toHaveLength(1);
    expect((await call(dress.images[0].url)).status).toBe(200);
    expect(list.find((p: any) => p.name_bn === "পাঞ্জাবি").code).toMatch(/^WEB-/);

    const again = await json(await call("/api/products/import-link/save", { method: "POST", cookie: c.cookie, json: { products: prev.products } }));
    expect(again.imported).toHaveLength(0);
    expect(again.skipped).toHaveLength(2);
  });

  it("follows product links on a plain category page", async () => {
    const c = await makeClient();
    const page = (n: string, price: string) => ({ body: `<html><head><meta property="og:type" content="product"><meta property="og:title" content="${n}"><meta property="product:price:amount" content="${price}"></head><body></body></html>` });
    stubWeb({
      "https://plain.test/shop": { body: `<html><body><a href="/product/a">A</a><a href="/product/b">B</a><a href="/about">About</a></body></html>` },
      "https://plain.test/product/a": page("Shirt A", "800"),
      "https://plain.test/product/b": page("Shirt B", "900"),
    });
    const prev = await json(await call("/api/products/import-link/preview", { method: "POST", cookie: c.cookie, json: { url: "https://plain.test/shop" } }));
    expect(prev.products.map((p: any) => [p.name, p.price])).toEqual([["Shirt A", 80000], ["Shirt B", 90000]]);
  });

  it("accepts an uploaded catalog file and explains Facebook links", async () => {
    const c = await makeClient();
    const fd = new FormData();
    fd.append("file", new File(["id,title,price\nA1,Saree,4500 BDT\n"], "catalog.csv", { type: "text/csv" }));
    const prev = await json(await call("/api/products/import-link/preview", { method: "POST", cookie: c.cookie, body: fd }));
    expect(prev.products[0]).toMatchObject({ name: "Saree", price: 450000, sku: "A1" });
    const fb = await json(await call("/api/products/import-link/preview", { method: "POST", cookie: c.cookie, json: { url: "https://www.facebook.com/meghna/shop" } }));
    expect(fb.issues[0].message).toMatch(/Commerce Manager/);
  });

  it("needs the orders feature and caps batches at 10", async () => {
    const off = await makeClient({ features: ["inbox"] });
    expect((await call("/api/products/import-link/preview", { method: "POST", cookie: off.cookie, json: { url: "x.test" } })).status).toBe(403);
    const c = await makeClient();
    const many = Array.from({ length: 11 }, (_, i) => ({ name: "P" + i, price: 100 }));
    expect((await call("/api/products/import-link/save", { method: "POST", cookie: c.cookie, json: { products: many } })).status).toBe(400);
    void testEnv;
  });
});
