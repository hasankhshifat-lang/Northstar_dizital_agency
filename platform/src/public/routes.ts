import { Hono } from "hono";
import type { AppEnv } from "../env";
import { loadProducts, productName } from "../catalog/service";
import { tenantDb } from "../lib/db";
import { esc, page, taka } from "../lib/html";
import type { Order } from "../orders/service";

export const publicRoutes = new Hono<AppEnv>();

const notFound = () =>
  new Response(page("Not found", `<div class="card"><h1>পাওয়া যায়নি</h1><p class="muted">Not found</p></div>`), { status: 404, headers: { "content-type": "text/html; charset=utf-8" } });

publicRoutes.get("/:slug/:code", async (c) => {
  const t = await c.env.DB.prepare("SELECT id, business_name, status FROM tenants WHERE slug=?").bind(c.req.param("slug")).first<{ id: string; business_name: string; status: string }>();
  if (!t || t.status !== "active") return notFound();
  const tdb = tenantDb(c.env.DB, t.id);
  const [p] = await loadProducts(tdb, "p.code=?2 AND p.status='active'", c.req.param("code"));
  if (!p) return notFound();
  const cfg = await tdb.first<{ profile: string }>("SELECT profile FROM agent_config WHERE tenant_id=?1");
  const profile = cfg ? JSON.parse(cfg.profile) : {};
  const name = productName(p);
  const contact = profile.whatsapp
    ? `https://wa.me/${String(profile.whatsapp).replace(/\D/g, "")}?text=${encodeURIComponent(`${name} (${p.code}) অর্ডার করতে চাই`)}`
    : profile.messenger_url || profile.website_url || null;
  const stock = p.variants.reduce((s, v) => s + v.stock, 0);
  const imgs = p.images.map((i) => i.url);
  const body = `<div class="card">
    ${imgs[0] ? `<img class="hero" src="${esc(imgs[0])}" alt="${esc(name)}">` : ""}
    ${imgs.length > 1 ? `<div class="thumbs">${imgs.slice(1).map((u) => `<img src="${esc(u)}" alt="">`).join("")}</div>` : ""}
    <p class="muted" style="margin-top:16px">${esc(t.business_name)} · ${esc(p.code)}</p>
    <h1 style="margin:4px 0 8px">${esc(name)}</h1>
    <div><span class="price">${taka(p.sale_price ?? p.price)}</span>${p.sale_price != null ? `<span class="old">${taka(p.price)}</span>` : ""}</div>
    ${p.variants.length > 1 || p.variants[0]?.label !== "Default" ? `<p>${p.variants.map((v) => `<span style="display:inline-block;border:1px solid #cbd5e1;border-radius:8px;padding:2px 8px;margin:2px;${v.stock ? "" : "opacity:.4"}">${esc(v.label)}</span>`).join("")}</p>` : ""}
    <p class="muted">${stock > 0 ? "স্টকে আছে · In stock" : "স্টক শেষ · Out of stock"}</p>
    ${p.description ? `<p style="white-space:pre-line">${esc(p.description)}</p>` : ""}
    <p style="margin-top:20px">${contact ? `<a class="btn" href="${esc(contact)}">অর্ডার করতে মেসেজ করুন · Message us to order</a>` : `<strong>অর্ডার করতে আমাদের পেজে মেসেজ করুন · Message our page to order</strong>`}</p>
  </div>`;
  return c.html(page(`${name} — ${t.business_name}`, body, `<meta property="og:title" content="${esc(name)}">${imgs[0] ? `<meta property="og:image" content="${esc(new URL(imgs[0], c.req.url).toString())}">` : ""}`));
});

export function renderInvoice(order: Order, tenant: { business_name: string }): string {
  const rows = order.items.map((i) => `<tr><td>${esc(i.name_snapshot)}</td><td class="right">${i.qty}</td><td class="right">${taka(i.unit_price)}</td><td class="right">${taka(i.unit_price * i.qty)}</td></tr>`).join("");
  const body = `<div class="card">
    <div style="display:flex;justify-content:space-between;align-items:flex-start">
      <div><h2 style="margin:0">${esc(tenant.business_name)}</h2><p class="muted">ইনভয়েস · Invoice</p></div>
      <div class="right"><h2 style="margin:0">#${order.number}</h2><p class="muted">${esc(new Date(order.created_at).toLocaleDateString("en-GB", { timeZone: "Asia/Dhaka" }))}</p></div>
    </div>
    <p><strong>${esc(order.customer?.name ?? "")}</strong><br>${esc(order.customer?.phones?.[0] ?? "")}<br>${esc(order.address ?? "")}</p>
    <table><thead><tr><th>পণ্য · Item</th><th class="right">পরিমাণ</th><th class="right">দাম</th><th class="right">মোট</th></tr></thead><tbody>${rows}</tbody></table>
    <table style="margin-top:12px;max-width:320px;margin-left:auto">
      <tr><td>সাবটোটাল</td><td class="right">${taka(order.subtotal)}</td></tr>
      <tr><td>ডেলিভারি</td><td class="right">${taka(order.delivery_charge)}</td></tr>
      ${order.discount ? `<tr><td>ছাড়</td><td class="right">-${taka(order.discount)}</td></tr>` : ""}
      <tr><th>মোট · Total</th><th class="right">${taka(order.total)}</th></tr>
    </table>
    <p class="muted">পেমেন্ট: ${esc(order.payment_method.toUpperCase())} · ${esc(order.payment_status)}${order.courier ? ` · কুরিয়ার: ${esc(order.courier)} ${esc(order.tracking_number ?? "")}` : ""}</p>
    <p class="noprint"><a class="btn" href="javascript:print()">প্রিন্ট · Print</a></p>
  </div>`;
  return page(`Invoice #${order.number}`, body);
}
