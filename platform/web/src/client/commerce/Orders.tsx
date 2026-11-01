import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { api, fmtDate, taka, toPoisha } from "../../api";
import { useT } from "../../i18n";
import { Badge, Button, Card, ErrorText, Field, Input, Modal, PageHeader, Select, Table, Textarea, Toggle, cx, useApi } from "../../ui";
import { pname, type Product } from "./Products";

export const STATUSES = ["new", "confirmed", "packed", "shipped", "delivered", "cancelled", "returned"] as const;
const NEXT: Record<string, string[]> = {
  new: ["confirmed", "cancelled"], confirmed: ["packed", "cancelled"], packed: ["shipped", "cancelled"],
  shipped: ["delivered", "returned"], delivered: ["returned"], cancelled: [], returned: [],
};
export const statusTone = (s: string) => (({ new: "blue", confirmed: "violet", packed: "amber", shipped: "amber", delivered: "green", cancelled: "slate", returned: "red" }) as const)[s as "new"] ?? "slate";
const COURIERS = ["Steadfast", "Pathao", "RedX", "Sundarban", "Other"];

export function OrdersPage() {
  const { t } = useT();
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const { data, error } = useApi<{ orders: any[]; counts: Record<string, number> }>(`/api/orders?status=${status}&q=${encodeURIComponent(q)}`);
  const notif = useApi<{ on_confirmed: boolean; on_shipped: boolean }>("/api/orders/settings/notifications");
  const saveNotif = async (patch: Partial<{ on_confirmed: boolean; on_shipped: boolean }>) =>
    notif.setData(await api("/api/orders/settings/notifications", { method: "PUT", json: { ...notif.data!, ...patch } }));
  return (
    <>
      <PageHeader title={t("orders")} actions={<div className="flex gap-2">
        <a href="/api/reports/orders.csv"><Button variant="secondary">{t("download_csv")}</Button></a>
        <Link to="/app/orders/new"><Button>+ {t("new_order")}</Button></Link>
      </div>} />
      <div className="mb-4 flex flex-wrap gap-2">
        {["", ...STATUSES].map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={cx("rounded-full px-3 py-1 text-sm", status === s ? "bg-brand-600 text-white" : "bg-white border border-slate-300 text-slate-700")}>
            {s ? t("s_" + s) : t("all")} {s && data?.counts[s] ? <span className="opacity-70">({data.counts[s]})</span> : null}
          </button>
        ))}
      </div>
      <Card>
        <Input placeholder={t("search")} value={q} onChange={(e) => setQ(e.target.value)} className="mb-4 max-w-xs" />
        <ErrorText error={error} />
        <Table empty={data?.orders.length === 0} head={["#", t("date"), t("customer"), t("items"), t("total"), t("payment"), t("source"), t("status")]}>
          {data?.orders.map((o) => (
            <tr key={o.id} className="hover:bg-slate-50">
              <td className="px-3 py-2"><Link to={`/app/orders/${o.id}`} className="font-medium text-brand-700 hover:underline">#{o.number}</Link></td>
              <td className="px-3 py-2 text-slate-500">{fmtDate(o.created_at)}</td>
              <td className="px-3 py-2">{o.customer_name}<div className="text-xs text-slate-500">{JSON.parse(o.customer_phones ?? "[]")[0]}</div></td>
              <td className="px-3 py-2">{o.item_count}</td>
              <td className="px-3 py-2 font-medium">{taka(o.total)}</td>
              <td className="px-3 py-2">{t("pm_" + o.payment_method)} · <span className={o.payment_status === "paid" ? "text-emerald-700" : "text-slate-500"}>{t(o.payment_status)}</span></td>
              <td className="px-3 py-2">{t("src_" + o.source)}</td>
              <td className="px-3 py-2"><Badge tone={statusTone(o.status)}>{t("s_" + o.status)}</Badge></td>
            </tr>
          ))}
        </Table>
      </Card>
      {notif.data && (
        <Card title={t("customer_updates")} className="mt-6 max-w-xl">
          <div className="space-y-3">
            <label className="flex items-center justify-between">{t("notify_confirmed")}<Toggle checked={notif.data.on_confirmed} onChange={(v) => saveNotif({ on_confirmed: v })} /></label>
            <label className="flex items-center justify-between">{t("notify_shipped")}<Toggle checked={notif.data.on_shipped} onChange={(v) => saveNotif({ on_shipped: v })} /></label>
          </div>
        </Card>
      )}
    </>
  );
}

export function OrderDetailPage() {
  const { t } = useT();
  const { id } = useParams();
  const { data, error, setData } = useApi<{ order: any }>(`/api/orders/${id}`);
  const [err, setErr] = useState<unknown>(null);
  const [prompt, setPrompt] = useState<null | "shipped" | "returned">(null);
  const [ship, setShip] = useState({ courier: "Steadfast", tracking_number: "" });
  const [cond, setCond] = useState("good");
  const move = async (to: string, extra: Record<string, unknown> = {}) => {
    setErr(null);
    try { setData(await api(`/api/orders/${id}/status`, { json: { to, ...extra } })); setPrompt(null); } catch (e) { setErr(e); }
  };
  if (error) return <ErrorText error={error} />;
  if (!data) return <p>{t("loading")}</p>;
  const o = data.order;
  return (
    <>
      <PageHeader title={`${t("order")} #${o.number}`} actions={<div className="flex items-center gap-2">
        <Badge tone={statusTone(o.status)}>{t("s_" + o.status)}</Badge>
        <a href={`/api/orders/${o.id}/invoice`} target="_blank" rel="noreferrer"><Button variant="secondary">{t("invoice")} ↗</Button></a>
      </div>} />
      <ErrorText error={err} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" title={t("items")}>
          <Table head={[t("items"), t("qty"), t("price"), t("total")]}>
            {o.items.map((i: any) => <tr key={i.id}><td className="px-3 py-2">{i.name_snapshot}</td><td className="px-3 py-2">{i.qty}</td><td className="px-3 py-2">{taka(i.unit_price)}</td><td className="px-3 py-2">{taka(i.unit_price * i.qty)}</td></tr>)}
          </Table>
          <dl className="mt-4 ml-auto grid max-w-xs grid-cols-2 gap-1 text-sm">
            <dt>{t("subtotal")}</dt><dd className="text-right">{taka(o.subtotal)}</dd>
            <dt>{t("delivery_charge")}</dt><dd className="text-right">{taka(o.delivery_charge)}</dd>
            {o.discount > 0 && <><dt>{t("discount")}</dt><dd className="text-right">-{taka(o.discount)}</dd></>}
            <dt className="font-semibold">{t("total")}</dt><dd className="text-right font-semibold">{taka(o.total)}</dd>
          </dl>
          <div className="mt-6 flex flex-wrap gap-2">
            {NEXT[o.status].map((s) => (
              <Button key={s} variant={s === "cancelled" || s === "returned" ? "secondary" : "primary"}
                onClick={() => (s === "shipped" || s === "returned" ? setPrompt(s) : move(s))}>{t("move_to", { s: t("s_" + s) })}</Button>
            ))}
          </div>
        </Card>
        <div className="space-y-6">
          <Card title={t("customer")}>
            {o.customer ? <Link to={`/app/customers/${o.customer.id}`} className="font-medium text-brand-700 hover:underline">{o.customer.name}</Link> : "—"}
            <div className="text-sm text-slate-600">{o.customer?.phones?.[0]}</div>
            <div className="mt-2 text-sm">{o.address}</div>
            <div className="mt-3 text-sm">{t("payment")}: {t("pm_" + o.payment_method)} · {t(o.payment_status)}</div>
            {o.courier && <div className="mt-1 text-sm">{t("courier")}: {o.courier} · {o.tracking_number}</div>}
            {o.return_condition && <div className="mt-1 text-sm">{t("return_condition")}: {t("rc_" + o.return_condition)}</div>}
            {o.notes && <div className="mt-2 text-sm text-slate-600">{o.notes}</div>}
          </Card>
          <Card title={t("timeline")}>
            <ul className="space-y-1 text-sm">
              {STATUSES.map((s) => (s === "new" ? o.created_at : o[`${s}_at`]) && (
                <li key={s} className="flex justify-between"><span>{t("s_" + s)}</span><span className="text-slate-500">{fmtDate(s === "new" ? o.created_at : o[`${s}_at`])}</span></li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
      <Modal open={prompt === "shipped"} title={t("s_shipped")} onClose={() => setPrompt(null)}>
        <div className="space-y-3">
          <Field label={t("courier")}><Select value={ship.courier} onChange={(e) => setShip({ ...ship, courier: e.target.value })}>{COURIERS.map((c) => <option key={c}>{c}</option>)}</Select></Field>
          <Field label={t("tracking_number")}><Input value={ship.tracking_number} onChange={(e) => setShip({ ...ship, tracking_number: e.target.value })} /></Field>
          <Button onClick={() => move("shipped", ship)}>{t("save")}</Button>
        </div>
      </Modal>
      <Modal open={prompt === "returned"} title={t("s_returned")} onClose={() => setPrompt(null)}>
        <div className="space-y-3">
          <Field label={t("return_condition")}><Select value={cond} onChange={(e) => setCond(e.target.value)}>{["good", "in_transit", "damaged", "unknown"].map((c) => <option key={c} value={c}>{t("rc_" + c)}</option>)}</Select></Field>
          <Button onClick={() => move("returned", { return_condition: cond })}>{t("save")}</Button>
        </div>
      </Modal>
    </>
  );
}

export function OrderNewPage() {
  const { t } = useT();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const products = useApi<{ products: Product[] }>("/api/products?status=active");
  const [cust, setCust] = useState({ name: sp.get("name") ?? "", phone: sp.get("phone") ?? "", address: sp.get("address") ?? "" });
  const [items, setItems] = useState<{ variant_id: string; qty: number }[]>([{ variant_id: "", qty: 1 }]);
  const [delivery, setDelivery] = useState("60");
  const [discount, setDiscount] = useState("0");
  const [pm, setPm] = useState("cod");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<unknown>(null);
  const variants = (products.data?.products ?? []).flatMap((p) => p.variants.map((v) => ({ ...v, product: p, unit: p.sale_price ?? p.price })));
  const byId = new Map(variants.map((v) => [v.id, v]));
  const subtotal = items.reduce((s, i) => s + (byId.get(i.variant_id)?.unit ?? 0) * i.qty, 0);
  const total = Math.max(0, subtotal + toPoisha(delivery || 0) - toPoisha(discount || 0));
  useEffect(() => { const v = sp.get("variant_id"); if (v) setItems([{ variant_id: v, qty: 1 }]); }, []);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const r = await api<{ order: { id: string } }>("/api/orders", { json: {
        customer: { ...(sp.get("customer_id") ? { id: sp.get("customer_id") } : {}), name: cust.name, phone: cust.phone || null, address: cust.address || null },
        items: items.filter((i) => i.variant_id), delivery_charge: toPoisha(delivery || 0), discount: toPoisha(discount || 0), payment_method: pm, notes: notes || null,
        source: sp.get("conversation_id") ? "inbox" : "manual", conversation_id: sp.get("conversation_id"), channel: sp.get("channel"),
      } });
      nav(`/app/orders/${r.order.id}`);
    } catch (err) { setError(err); }
  };
  return (
    <>
      <PageHeader title={t("new_order")} />
      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" title={t("items")}>
          <div className="space-y-2">
            {items.map((it, i) => (
              <div key={i} className="flex gap-2">
                <Select required aria-label={t("choose_product")} value={it.variant_id} onChange={(e) => setItems(items.map((x, j) => (j === i ? { ...x, variant_id: e.target.value } : x)))}>
                  <option value="">{t("choose_product")}</option>
                  {variants.map((v) => <option key={v.id} value={v.id} disabled={v.stock < 1}>{pname(v.product)}{v.label !== "Default" ? ` — ${v.label}` : ""} · {taka(v.unit)} ({t("stock")}: {v.stock})</option>)}
                </Select>
                <Input aria-label={t("qty")} type="number" min="1" className="max-w-24" value={it.qty} onChange={(e) => setItems(items.map((x, j) => (j === i ? { ...x, qty: Number(e.target.value) } : x)))} />
                <Button type="button" variant="ghost" disabled={items.length === 1} onClick={() => setItems(items.filter((_, j) => j !== i))}>✕</Button>
              </div>
            ))}
            <Button type="button" variant="secondary" size="sm" onClick={() => setItems([...items, { variant_id: "", qty: 1 }])}>{t("add_item")}</Button>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Field label={t("delivery_charge")}><Input type="number" min="0" value={delivery} onChange={(e) => setDelivery(e.target.value)} /></Field>
            <Field label={t("discount")}><Input type="number" min="0" value={discount} onChange={(e) => setDiscount(e.target.value)} /></Field>
            <Field label={t("payment")}><Select value={pm} onChange={(e) => setPm(e.target.value)}>{["cod", "bkash", "nagad", "paid", "other"].map((p) => <option key={p} value={p}>{t("pm_" + p)}</option>)}</Select></Field>
          </div>
          <div className="mt-4 text-right">
            <div className="text-sm text-slate-500">{t("subtotal")}: {taka(subtotal)}</div>
            <div className="text-xl font-semibold" data-testid="order-total">{t("total")}: {taka(total)}</div>
          </div>
        </Card>
        <Card title={t("customer")}>
          <div className="space-y-3">
            <Field label={t("name")}><Input required value={cust.name} onChange={(e) => setCust({ ...cust, name: e.target.value })} name="customer_name" /></Field>
            <Field label={t("phone")}><Input value={cust.phone} onChange={(e) => setCust({ ...cust, phone: e.target.value })} name="customer_phone" /></Field>
            <Field label={t("address")}><Textarea value={cust.address} onChange={(e) => setCust({ ...cust, address: e.target.value })} /></Field>
            <Field label={t("notes")}><Input value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
            <ErrorText error={error} />
            <Button type="submit" className="w-full justify-center">{t("create_order")}</Button>
          </div>
        </Card>
      </form>
    </>
  );
}
