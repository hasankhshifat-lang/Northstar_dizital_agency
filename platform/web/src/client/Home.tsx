import { Link } from "react-router";
import { taka } from "../api";
import { useT } from "../i18n";
import { useSession } from "../auth/session";
import { Card, PageHeader, Stat, useApi } from "../ui";

interface HomeData {
  new_chats_today?: number; waiting?: number; orders_today?: number; sales_today?: number; ai_replies_month: number; engine_unavailable?: boolean;
  alerts: { unanswered?: number; low_stock?: number; orders_to_confirm?: number; failed_sends?: number };
}

export function HomePage() {
  const { t } = useT();
  const { me } = useSession();
  const { data } = useApi<HomeData>("/api/client/home");
  const a = data?.alerts ?? {};
  const alerts: [number | undefined, string, string][] = [
    [a.unanswered, "alert_unanswered", "/app/agent?tab=unanswered"],
    [a.orders_to_confirm, "alert_to_confirm", "/app/orders"],
    [a.low_stock, "alert_low_stock", "/app/products"],
    [a.failed_sends, "alert_failed_sends", "/app/followups"],
  ];
  const active = alerts.filter(([n]) => n);
  return (
    <>
      <PageHeader title={`${t("today")} — ${me?.tenant?.business_name ?? ""}`} />
      {data?.engine_unavailable && <p className="mb-4 rounded-lg bg-amber-50 p-3 text-amber-900">{t("engine_down")}</p>}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data?.new_chats_today !== undefined && <Stat label={t("new_chats_today")} value={data.new_chats_today} />}
        {data?.waiting !== undefined && <Stat label={t("waiting_reply")} value={data.waiting} tone={data.waiting ? "text-amber-600" : undefined} />}
        {data?.orders_today !== undefined && <Stat label={t("orders_today")} value={<>{data.orders_today} <span className="text-base font-normal text-slate-500">{taka(data.sales_today)}</span></>} />}
        <Stat label={t("ai_replies_month")} value={data?.ai_replies_month ?? "—"} />
      </div>
      <Card title={t("alerts")} className="max-w-2xl">
        {active.length === 0 ? <p className="text-slate-600">{t("no_alerts")}</p> : (
          <ul className="space-y-2">
            {active.map(([n, key, to]) => (
              <li key={key}><Link to={to} className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-amber-900 hover:bg-amber-100">⚠ {t(key, { n: n! })} →</Link></li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
