import { Link } from "react-router";
import { AlertTriangle, ArrowRight, Bot, MessageCircle, MessagesSquare, ShoppingBag } from "lucide-react";
import { taka } from "../api";
import { useT } from "../i18n";
import { hasFeature, useSession } from "../auth/session";
import { Avatar, Badge, Card, Donut, Stat, useApi } from "../ui";

interface HomeData {
  new_chats_today?: number; waiting?: number; orders_today?: number; sales_today?: number; ai_replies_month: number; engine_unavailable?: boolean;
  alerts: { unanswered?: number; low_stock?: number; orders_to_confirm?: number; failed_sends?: number };
}
interface Summary { sales_by_day: { day: string; total: number; orders: number }[]; status_counts: Record<string, number> }

const STATUS_COLORS: Record<string, string> = {
  new: "#7058f0", confirmed: "#a78bfa", packed: "#f2a93b", shipped: "#3b9cf0", delivered: "#16a394", cancelled: "#94a3b8", returned: "#ef4c7a",
};
const CH_ICON: Record<string, string> = { messenger: "💬", instagram: "📸", whatsapp: "🟢", website: "🌐" };

function Hero({ name, shop, waiting, canInbox }: { name: string; shop: string; waiting?: number; canInbox: boolean }) {
  const { t } = useT();
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#5b45e0] via-[#6d4fe8] to-[#8f6cf2] p-6 text-white shadow-lift sm:p-8">
      {/* decorative shapes, after the reference illustrations */}
      <div className="pointer-events-none absolute -top-10 right-10 h-40 w-40 rounded-full bg-[#fff]/10" />
      <div className="pointer-events-none absolute right-36 bottom-6 h-14 w-14 rotate-12 rounded-2xl bg-gradient-to-br from-[#ffc46b] to-[#f28c28] opacity-90" />
      <div className="pointer-events-none absolute top-8 right-16 h-20 w-20 rounded-full bg-gradient-to-br from-[#ff8fd0] to-[#e5469b] opacity-90" />
      <div className="pointer-events-none absolute right-6 bottom-8 h-10 w-10 rounded-xl bg-[#5ee0c8] opacity-90" />
      <div className="relative max-w-lg">
        <div className="text-sm text-white/75">{shop}</div>
        <h2 className="mt-1 text-2xl font-bold sm:text-3xl">{t("hero_title", { name })}</h2>
        <p className="mt-2 text-white/80">{waiting ? t("hero_waiting", { n: waiting }) : t("hero_all_clear")}</p>
        {canInbox && (
          <Link to="/app/inbox" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#fff] px-4 py-2.5 text-sm font-semibold text-[#4b36c9] shadow-lg hover:bg-[#fff]/90">
            {t("open_inbox")} <ArrowRight size={16} />
          </Link>
        )}
      </div>
    </div>
  );
}

function SalesBars({ data }: { data: { day: string; total: number }[] }) {
  const { t } = useT();
  const days = data.slice(-7);
  const max = Math.max(1, ...days.map((d) => d.total));
  if (!days.length) return <p className="py-10 text-center text-sm text-slate-500">{t("none_yet")}</p>;
  return (
    <div className="flex items-end gap-3">
      {days.map((d) => (
        <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-36 w-full max-w-12 items-end">
            <div className="w-full rounded-xl bg-gradient-to-t from-brand-600 to-[#a78bfa] transition-all" style={{ height: Math.max(8, Math.round((d.total / max) * 144)) }} title={`${d.day}: ${taka(d.total)}`} />
          </div>
          <span className="text-[11px] text-slate-500">{d.day.slice(8)}</span>
        </div>
      ))}
    </div>
  );
}

export function HomePage() {
  const { t } = useT();
  const { me } = useSession();
  const canOrders = hasFeature(me, "orders");
  const canInbox = hasFeature(me, "inbox");
  const { data } = useApi<HomeData>("/api/client/home");
  const summary = useApi<Summary>(canOrders ? "/api/reports/summary" : null);
  const waiting = useApi<{ conversations: { id: string; channel: string; customerName: string; lastMessage: string; lastAt: string }[] }>(canInbox ? "/api/inbox?tab=waiting" : null);
  const a = data?.alerts ?? {};
  const alerts: [number | undefined, string, string][] = [
    [a.unanswered, "alert_unanswered", "/app/agent?tab=unanswered"],
    [a.orders_to_confirm, "alert_to_confirm", "/app/orders"],
    [a.low_stock, "alert_low_stock", "/app/products"],
    [a.failed_sends, "alert_failed_sends", "/app/followups"],
  ];
  const active = alerts.filter(([n]) => n);
  const statusSegments = Object.entries(summary.data?.status_counts ?? {}).map(([k, v]) => ({ label: t("s_" + k), value: v, color: STATUS_COLORS[k] ?? "#94a3b8" }));
  const totalOrders = statusSegments.reduce((s, x) => s + x.value, 0);

  return (
    <div className="space-y-6">
      {data?.engine_unavailable && <p className="rounded-2xl bg-amber-50 p-3 text-amber-900">{t("engine_down")}</p>}
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Hero name={me?.user.name.split(" ")[0] ?? ""} shop={me?.tenant?.business_name ?? ""} waiting={data?.waiting} canInbox={canInbox} />
        </div>
        <Card title={t("alerts")} actions={active.length > 0 && <Badge tone="red">{active.length}</Badge>}>
          {active.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 text-slate-600">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-xl font-bold text-emerald-700">✓</div>
              {t("no_alerts")}
            </div>
          ) : (
            <ul className="space-y-2">
              {active.map(([n, key, to]) => (
                <li key={key}>
                  <Link to={to} className="flex items-center gap-3 rounded-2xl bg-amber-50 px-3 py-2.5 text-sm text-amber-900 transition hover:bg-amber-100">
                    <AlertTriangle size={16} className="shrink-0" /> <span className="flex-1">{t(key, { n: n! })}</span> <ArrowRight size={14} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data?.new_chats_today !== undefined && <Stat icon={MessagesSquare} chip="violet" label={t("new_chats_today")} value={data.new_chats_today} />}
        {data?.waiting !== undefined && <Stat icon={MessageCircle} chip="pink" label={t("waiting_reply")} value={data.waiting} />}
        {data?.orders_today !== undefined && <Stat icon={ShoppingBag} chip="amber" label={t("orders_today")} value={data.orders_today} hint={taka(data.sales_today)} />}
        <Stat icon={Bot} chip="teal" label={t("ai_replies_month")} value={data?.ai_replies_month ?? "—"} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {canOrders && (
          <Card title={t("status_breakdown")}>
            <div className="flex items-center gap-6">
              <Donut segments={statusSegments} center={<div><div className="text-2xl font-bold text-slate-900">{totalOrders}</div><div className="text-xs text-slate-500">{t("orders")}</div></div>} />
              <ul className="min-w-0 flex-1 space-y-1.5 text-sm">
                {statusSegments.length === 0 && <li className="text-slate-500">{t("none_yet")}</li>}
                {statusSegments.map((s) => (
                  <li key={s.label} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} /><span className="flex-1 truncate text-slate-600">{s.label}</span><b className="text-slate-900">{s.value}</b></li>
                ))}
              </ul>
            </div>
          </Card>
        )}
        {canOrders && (
          <Card title={t("sales_7_days")} actions={<Link to="/app/reports" className="text-sm font-medium text-brand-600 hover:underline">{t("view_all")}</Link>}>
            <SalesBars data={summary.data?.sales_by_day ?? []} />
          </Card>
        )}
        {canInbox && (
          <Card title={t("waiting_reply")} actions={<Link to="/app/inbox" className="text-sm font-medium text-brand-600 hover:underline">{t("view_all")}</Link>}>
            <ul className="space-y-1">
              {waiting.data?.conversations.length === 0 && <li className="py-6 text-center text-sm text-slate-500">{t("hero_all_clear")}</li>}
              {waiting.data?.conversations.slice(0, 5).map((c) => (
                <li key={c.id}>
                  <Link to={`/app/inbox/${c.id}`} className="flex items-center gap-3 rounded-2xl px-2 py-2 transition hover:bg-slate-50">
                    <Avatar name={c.customerName} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-900">{CH_ICON[c.channel]} {c.customerName}</span>
                      <span className="block truncate text-xs text-slate-500">{c.lastMessage}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
