import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { api, fmtDate, taka } from "../../api";
import { useT } from "../../i18n";
import { useSession } from "../../auth/session";
import { Badge, Button, ErrorText, Field, Input, Modal, Select, Textarea, cx, useApi } from "../../ui";
import { statusTone } from "../commerce/Orders";
import { pname, type Product } from "../commerce/Products";

interface Conv { id: string; channel: string; customerName: string; customerRef: string; lastMessage: string; lastAt: string; lastFrom: string; unread: number; handler: "ai" | "human"; state: string; snoozeUntil?: string | null }
interface Msg { id: string; direction: "in" | "out"; kind: string; text?: string; url?: string; payload?: any; at: string; by: "customer" | "ai" | "human" }
const TABS = ["waiting", "unread", "open", "later", "done"] as const;
const CH_ICON: Record<string, string> = { messenger: "💬", instagram: "📸", whatsapp: "🟢", website: "🌐" };

export function InboxPage() {
  const { t } = useT();
  const { me } = useSession();
  const { cid } = useParams();
  const nav = useNavigate();
  const [tab, setTab] = useState<(typeof TABS)[number]>("open");
  const [channel, setChannel] = useState("");
  const [handler, setHandler] = useState("");
  const [tick, setTick] = useState(0);
  const list = useApi<{ conversations: Conv[]; counts: Record<string, number> }>(`/api/inbox?tab=${tab}&channel=${channel}&handler=${handler}`, [tick]);
  useEffect(() => { const i = setInterval(() => setTick((x) => x + 1), 15000); return () => clearInterval(i); }, []);
  return (
    <div className="-m-6 flex h-[calc(100vh-49px)]">
      <div className="flex w-80 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="flex flex-wrap gap-1 border-b border-slate-200 p-2">
          {TABS.map((k) => (
            <button key={k} onClick={() => setTab(k)} className={cx("rounded-md px-2 py-1 text-xs font-medium", tab === k ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-100")}>
              {t("tab_" + k)} <span className="opacity-70">{list.data?.counts[k] ?? ""}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-2 border-b border-slate-200 p-2">
          <Select value={channel} onChange={(e) => setChannel(e.target.value)} className="py-1 text-xs">
            <option value="">{t("all_channels")}</option>
            {me?.tenant?.channels.map((c) => <option key={c} value={c}>{t("ch_" + c)}</option>)}
          </Select>
          <Select value={handler} onChange={(e) => setHandler(e.target.value)} className="py-1 text-xs">
            <option value="">{t("everyone")}</option><option value="ai">{t("by_ai")}</option><option value="human">{t("by_person")}</option>
          </Select>
        </div>
        <ErrorText error={list.error} />
        <ul className="flex-1 overflow-y-auto">
          {list.data?.conversations.map((c) => (
            <li key={c.id}>
              <button onClick={() => nav(`/app/inbox/${c.id}`)} className={cx("w-full border-b border-slate-100 px-3 py-2.5 text-left hover:bg-slate-50", cid === c.id && "bg-brand-50")}>
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium">{CH_ICON[c.channel]} {c.customerName}</span>
                  <span className="shrink-0 text-[10px] text-slate-400">{new Date(c.lastAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm text-slate-500">{c.lastMessage}</span>
                  <span className="flex shrink-0 gap-1">
                    {c.unread > 0 && <Badge tone="blue">{c.unread}</Badge>}
                    <Badge tone={c.handler === "ai" ? "violet" : "amber"}>{c.handler === "ai" ? t("by_ai") : t("by_person")}</Badge>
                  </span>
                </div>
              </button>
            </li>
          ))}
          {list.data?.conversations.length === 0 && <li className="p-6 text-center text-sm text-slate-500">{t("none_yet")}</li>}
        </ul>
      </div>
      {cid ? <ChatPane key={cid} cid={cid} onChange={() => setTick((x) => x + 1)} /> : <div className="flex flex-1 items-center justify-center text-slate-500">{t("select_chat")}</div>}
    </div>
  );
}

function MessageBubble({ m }: { m: Msg }) {
  const { t } = useT();
  const mine = m.direction === "out";
  return (
    <div className={cx("flex", mine ? "justify-end" : "justify-start")}>
      <div className={cx("max-w-[70%] rounded-2xl px-3 py-2 text-sm", mine ? (m.by === "ai" ? "bg-violet-100" : "bg-brand-600 text-white") : "bg-white border border-slate-200")}>
        {m.kind === "product" && m.payload ? (
          <div className="w-56 rounded-lg bg-white p-2 text-slate-900">
            {m.payload.image_url && <img src={m.payload.image_url} className="mb-2 h-32 w-full rounded object-cover" alt="" />}
            <div className="font-medium">{m.payload.name}</div>
            <div>{taka(m.payload.sale_price ?? m.payload.price)}</div>
          </div>
        ) : m.kind === "receipt" && m.payload ? (
          <div className="w-60 rounded-lg bg-white p-2 text-slate-900">
            <div className="font-semibold">{t("order")} #{m.payload.number} · {t("s_" + m.payload.status)}</div>
            {m.payload.items?.map((i: any, k: number) => <div key={k} className="flex justify-between text-xs"><span>{i.name} ×{i.qty}</span><span>{taka(i.unit_price * i.qty)}</span></div>)}
            <div className="mt-1 flex justify-between font-medium"><span>{t("total")}</span><span>{taka(m.payload.total)}</span></div>
            {m.payload.tracking && <div className="mt-1 text-xs">{m.payload.courier}: {m.payload.tracking}</div>}
          </div>
        ) : m.kind === "image" && m.url ? <img src={m.url} className="max-h-60 rounded" alt="" />
          : <span className="whitespace-pre-wrap">{m.text}</span>}
        <div className={cx("mt-0.5 text-[10px]", mine && m.by !== "ai" ? "text-brand-100" : "text-slate-400")}>{m.by === "ai" ? "AI · " : ""}{new Date(m.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
      </div>
    </div>
  );
}

function ChatPane({ cid, onChange }: { cid: string; onChange: () => void }) {
  const { t } = useT();
  const { me } = useSession();
  const { data, error, reload } = useApi<{ conversation: Conv & { messages: Msg[] }; customer: any }>(`/api/inbox/${cid}`);
  const qr = useApi<{ quick_replies: { id: string; title: string; body: string }[] }>("/api/quick-replies");
  const products = useApi<{ products: Product[] }>(me?.tenant?.features.includes("orders") ? "/api/products?status=active" : null);
  const [text, setText] = useState("");
  const [err, setErr] = useState<unknown>(null);
  const [laterOpen, setLaterOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView(); }, [data?.conversation.messages.length]);
  const act = async (path: string, json: unknown) => {
    setErr(null);
    try { await api(`/api/inbox/${cid}${path}`, { json }); reload(); onChange(); } catch (e) { setErr(e); }
  };
  if (error) return <div className="flex-1 p-6"><ErrorText error={error} /></div>;
  if (!data) return <div className="flex-1 p-6">{t("loading")}</div>;
  const c = data.conversation;
  const cust = data.customer;
  const orderLink = `/app/orders/new?${new URLSearchParams({ name: cust?.name ?? c.customerName, phone: cust?.phones?.[0] ?? "", address: cust?.addresses?.[0] ?? "", conversation_id: c.id, channel: c.channel, ...(cust ? { customer_id: cust.id } : {}) })}`;
  const tomorrow = Math.max(1, Math.round((new Date(new Date().setHours(33, 0, 0, 0)).getTime() - Date.now()) / 3600_000));
  return (
    <>
      <div className="flex min-w-0 flex-1 flex-col bg-slate-50">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-2">
          <div>
            <div className="font-semibold">{CH_ICON[c.channel]} {c.customerName}</div>
            <div className="text-xs text-slate-500">{t("ch_" + c.channel)} · {t("handled_by", { h: c.handler === "ai" ? t("by_ai") : t("by_person") })}</div>
          </div>
          <div className="flex gap-2">
            {c.handler === "ai"
              ? <Button size="sm" variant="secondary" onClick={() => act("/handler", { handler: "human" })}>{t("take_over")}</Button>
              : <Button size="sm" variant="secondary" onClick={() => act("/handler", { handler: "ai" })}>{t("back_to_ai")}</Button>}
            <Button size="sm" variant="secondary" onClick={() => setLaterOpen(true)}>{t("later")}</Button>
            {c.state === "done"
              ? <Button size="sm" variant="secondary" onClick={() => act("/state", { state: "open" })}>{t("reopen")}</Button>
              : <Button size="sm" onClick={() => act("/state", { state: "done" })}>{t("done")} ✓</Button>}
          </div>
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {c.messages.map((m) => <MessageBubble key={m.id} m={m} />)}
          <div ref={endRef} />
        </div>
        <ErrorText error={err} />
        <div className="border-t border-slate-200 bg-white p-3">
          <div className="mb-2 flex flex-wrap gap-1">
            {qr.data?.quick_replies.map((q) => <button key={q.id} onClick={() => setText(q.body)} className="rounded-full border border-slate-300 px-2 py-0.5 text-xs hover:bg-slate-100">{q.title}</button>)}
            <button onClick={() => setQrOpen(true)} className="px-2 py-0.5 text-xs text-brand-700 hover:underline">{t("manage_quick_replies")}</button>
          </div>
          <form className="flex gap-2" onSubmit={async (e) => { e.preventDefault(); if (!text.trim()) return; await act("/messages", { text }); setText(""); }}>
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder={t("type_reply")} aria-label={t("type_reply")} />
            {products.data && products.data.products.length > 0 && (
              <Select aria-label={t("send_product")} value="" onChange={(e) => e.target.value && act("/messages", { product_id: e.target.value })} className="max-w-40">
                <option value="">{t("send_product")}</option>
                {products.data.products.map((p) => <option key={p.id} value={p.id}>{pname(p)}</option>)}
              </Select>
            )}
            <Button type="submit">{t("send")}</Button>
          </form>
        </div>
      </div>
      <aside className="w-72 shrink-0 overflow-y-auto border-l border-slate-200 bg-white p-4">
        <h3 className="mb-2 font-semibold">{t("customer_panel")}</h3>
        {cust ? (
          <div className="space-y-1 text-sm">
            <Link to={`/app/customers/${cust.id}`} className="font-medium text-brand-700 hover:underline">{cust.name}</Link>
            <div>{cust.phones.join(", ")}</div>
            <div className="text-slate-600">{cust.addresses[0]}</div>
            <div className="flex flex-wrap gap-1">{cust.tags.map((tg: string) => <Badge key={tg} tone="violet">{tg}</Badge>)}</div>
            <h4 className="mt-3 font-medium">{t("past_orders")}</h4>
            {cust.orders.map((o: any) => (
              <Link key={o.id} to={`/app/orders/${o.id}`} className="flex justify-between rounded px-1 py-0.5 hover:bg-slate-50">
                <span>#{o.number} <Badge tone={statusTone(o.status)}>{t("s_" + o.status)}</Badge></span><span>{taka(o.total)}</span>
              </Link>
            ))}
          </div>
        ) : <p className="text-sm text-slate-500">{t("no_customer_yet")}</p>}
        {me?.tenant?.features.includes("orders") && <Link to={orderLink}><Button className="mt-4 w-full justify-center">+ {t("create_order")}</Button></Link>}
        <p className="mt-4 text-xs text-slate-400">{fmtDate(c.lastAt)}</p>
      </aside>
      <Modal open={laterOpen} title={t("later")} onClose={() => setLaterOpen(false)}>
        <div className="flex flex-wrap gap-2">
          {[[1, "later_1h"], [3, "later_3h"], [tomorrow, "later_tomorrow"]].map(([h, k]) => (
            <Button key={k} variant="secondary" onClick={async () => { await act("/state", { state: "later", snooze_hours: h }); setLaterOpen(false); }}>{t(k as string)}</Button>
          ))}
        </div>
      </Modal>
      <QuickRepliesModal open={qrOpen} onClose={() => { setQrOpen(false); qr.reload(); }} items={qr.data?.quick_replies ?? []} />
    </>
  );
}

function QuickRepliesModal({ open, onClose, items }: { open: boolean; onClose: () => void; items: { id: string; title: string; body: string }[] }) {
  const { t } = useT();
  const [f, setF] = useState({ title: "", body: "" });
  const [list, setList] = useState(items);
  useEffect(() => setList(items), [items]);
  return (
    <Modal open={open} title={t("quick_replies")} onClose={onClose}>
      <ul className="mb-4 space-y-1">
        {list.map((q) => (
          <li key={q.id} className="flex items-start justify-between gap-2 rounded bg-slate-50 p-2 text-sm">
            <span><b>{q.title}</b> — {q.body}</span>
            <button className="text-red-600" onClick={async () => { await api(`/api/quick-replies/${q.id}`, { method: "DELETE" }); setList(list.filter((x) => x.id !== q.id)); }}>✕</button>
          </li>
        ))}
      </ul>
      <div className="space-y-2">
        <Field label={t("title")}><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
        <Field label={t("message")}><Textarea value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></Field>
        <Button disabled={!f.title || !f.body} onClick={async () => { const r = await api("/api/quick-replies", { json: f }); setList([...list, r.quick_reply]); setF({ title: "", body: "" }); }}>{t("add")}</Button>
      </div>
    </Modal>
  );
}
