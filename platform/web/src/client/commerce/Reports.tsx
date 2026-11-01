import { taka } from "../../api";
import { useT } from "../../i18n";
import { Button, Card, ErrorText, PageHeader, Stat, Table, useApi } from "../../ui";

interface Summary { sales_by_day: { day: string; total: number; orders: number }[]; top_products: { name: string; qty: number; total: number }[]; status_counts: Record<string, number>; return_rate: number }
interface Returns { total: number; by_condition: { condition: string; count: number; pct: number }[]; by_product: { name: string; qty: number; good: number; damaged: number; in_transit: number; unknown: number }[] }

function Bars({ data }: { data: { day: string; total: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.total));
  const w = 640, h = 180, bw = data.length ? Math.max(4, Math.floor(w / data.length) - 4) : 0;
  return (
    <svg viewBox={`0 0 ${w} ${h + 20}`} className="w-full" role="img">
      {data.map((d, i) => {
        const bh = Math.round((d.total / max) * h);
        const x = i * (w / Math.max(1, data.length)) + 2;
        return (
          <g key={d.day}>
            <rect x={x} y={h - bh} width={bw} height={bh} rx="3" className="fill-brand-500"><title>{`${d.day}: ${taka(d.total)}`}</title></rect>
            {(i === 0 || i === data.length - 1 || data.length < 10) && <text x={x} y={h + 14} className="fill-slate-500 text-[10px]">{d.day.slice(5)}</text>}
          </g>
        );
      })}
    </svg>
  );
}

export function ReportsPage() {
  const { t } = useT();
  const s = useApi<Summary>("/api/reports/summary");
  const r = useApi<Returns>("/api/reports/returns");
  const sales = s.data?.sales_by_day.reduce((a, d) => a + d.total, 0) ?? 0;
  const orders = s.data?.sales_by_day.reduce((a, d) => a + d.orders, 0) ?? 0;
  return (
    <>
      <PageHeader title={t("reports")} actions={<div className="flex flex-wrap gap-2">
        {["orders", "products", "customers", "returns"].map((k) => <a key={k} href={`/api/reports/${k}.csv`}><Button variant="secondary" size="sm">{k}.csv</Button></a>)}
      </div>} />
      <ErrorText error={s.error ?? r.error} />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label={t("sales_total")} value={taka(sales)} />
        <Stat label={t("orders")} value={orders} />
        <Stat label={t("return_rate")} value={`${Math.round((s.data?.return_rate ?? 0) * 1000) / 10}%`} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title={t("sales_by_day")} className="lg:col-span-2">{s.data && (s.data.sales_by_day.length ? <Bars data={s.data.sales_by_day} /> : <p className="text-slate-500">{t("none_yet")}</p>)}</Card>
        <Card title={t("top_products")}>
          <Table empty={s.data?.top_products.length === 0} head={[t("name"), t("qty"), t("total")]}>
            {s.data?.top_products.map((p) => <tr key={p.name}><td className="px-3 py-2">{p.name}</td><td className="px-3 py-2">{p.qty}</td><td className="px-3 py-2">{taka(p.total)}</td></tr>)}
          </Table>
        </Card>
        <Card title={t("status_breakdown")}>
          <Table head={[t("status"), t("count")]}>
            {Object.entries(s.data?.status_counts ?? {}).map(([k, v]) => <tr key={k}><td className="px-3 py-2">{t("s_" + k)}</td><td className="px-3 py-2">{v}</td></tr>)}
          </Table>
        </Card>
        <Card title={`${t("returns_report")} (${r.data?.total ?? 0})`} className="lg:col-span-2">
          <div className="mb-4 space-y-2">
            {r.data?.by_condition.map((b) => (
              <div key={b.condition}>
                <div className="flex justify-between text-sm"><span>{t("rc_" + b.condition)}</span><span>{b.count} · {b.pct}%</span></div>
                <div className="h-2 rounded bg-slate-100"><div className="h-2 rounded bg-brand-500" style={{ width: `${b.pct}%` }} /></div>
              </div>
            ))}
          </div>
          <Table empty={r.data?.by_product.length === 0} head={[t("name"), t("qty"), t("rc_good"), t("rc_damaged"), t("rc_in_transit"), t("rc_unknown")]}>
            {r.data?.by_product.map((p) => <tr key={p.name}><td className="px-3 py-2">{p.name}</td><td className="px-3 py-2">{p.qty}</td><td className="px-3 py-2">{p.good}</td><td className="px-3 py-2">{p.damaged}</td><td className="px-3 py-2">{p.in_transit}</td><td className="px-3 py-2">{p.unknown}</td></tr>)}
          </Table>
        </Card>
      </div>
    </>
  );
}
