import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { useEffect } from "react";
import { api, fmtDate, taka } from "../../api";
import { useT } from "../../i18n";
import { Badge, Card, ErrorText, Input, PageHeader, Table, useApi } from "../../ui";
import { statusTone } from "./Orders";

interface Customer { id: string; name: string; phones: string[]; addresses: string[]; tags: string[]; total_orders: number; total_spent: number; last_order_at: string | null; orders?: any[] }

export function CustomersPage() {
  const { t } = useT();
  const [sp] = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");
  useEffect(() => setQ(sp.get("q") ?? ""), [sp]);
  const { data, error } = useApi<{ customers: Customer[] }>(`/api/customers?q=${encodeURIComponent(q)}`);
  return (
    <>
      <PageHeader title={t("customers")} actions={<a href="/api/reports/customers.csv" className="text-sm text-brand-700 hover:underline">{t("download_csv")}</a>} />
      <Card>
        <Input placeholder={t("search")} value={q} onChange={(e) => setQ(e.target.value)} className="mb-4 max-w-xs" />
        <ErrorText error={error} />
        <Table empty={data?.customers.length === 0} head={[t("name"), t("phone"), t("tags"), t("total_orders"), t("total_spent"), t("last_order")]}>
          {data?.customers.map((c) => (
            <tr key={c.id} className="hover:bg-slate-50">
              <td className="px-3 py-2"><Link to={`/app/customers/${c.id}`} className="font-medium text-brand-700 hover:underline">{c.name}</Link></td>
              <td className="px-3 py-2">{c.phones[0] ?? "—"}</td>
              <td className="px-3 py-2">{c.tags.map((tg) => <Badge key={tg} tone="violet">{tg}</Badge>)}</td>
              <td className="px-3 py-2">{c.total_orders}</td>
              <td className="px-3 py-2">{taka(c.total_spent)}</td>
              <td className="px-3 py-2 text-slate-500">{fmtDate(c.last_order_at)}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}

export function CustomerDetailPage() {
  const { t } = useT();
  const { id } = useParams();
  const { data, error, setData } = useApi<{ customer: Customer }>(`/api/customers/${id}`);
  const [tag, setTag] = useState("");
  if (error) return <ErrorText error={error} />;
  if (!data) return <p>{t("loading")}</p>;
  const c = data.customer;
  const saveTags = async (tags: string[]) => {
    const r = await api<{ customer: Customer }>(`/api/customers/${id}`, { method: "PATCH", json: { tags } });
    setData({ customer: { ...c, tags: r.customer.tags } });
  };
  return (
    <>
      <PageHeader title={c.name} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <div className="space-y-2 text-sm">
            <div>{t("phone")}: {c.phones.join(", ") || "—"}</div>
            <div>{t("address")}: {c.addresses.join(" / ") || "—"}</div>
            <div>{t("total_orders")}: {c.total_orders}</div>
            <div>{t("total_spent")}: {taka(c.total_spent)}</div>
          </div>
          <h3 className="mt-4 mb-2 font-medium">{t("tags")}</h3>
          <div className="mb-2 flex flex-wrap gap-1">
            {c.tags.map((tg) => <button key={tg} onClick={() => saveTags(c.tags.filter((x) => x !== tg))}><Badge tone="violet">{tg} ✕</Badge></button>)}
          </div>
          <Input placeholder={t("add_tag")} value={tag} onChange={(e) => setTag(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && tag.trim()) { e.preventDefault(); saveTags([...new Set([...c.tags, tag.trim()])]); setTag(""); } }} />
        </Card>
        <Card className="lg:col-span-2" title={t("orders")}>
          <Table empty={!c.orders?.length} head={["#", t("date"), t("total"), t("status")]}>
            {c.orders?.map((o) => (
              <tr key={o.id}>
                <td className="px-3 py-2"><Link to={`/app/orders/${o.id}`} className="text-brand-700 hover:underline">#{o.number}</Link></td>
                <td className="px-3 py-2 text-slate-500">{fmtDate(o.created_at)}</td>
                <td className="px-3 py-2">{taka(o.total)}</td>
                <td className="px-3 py-2"><Badge tone={statusTone(o.status)}>{t("s_" + o.status)}</Badge></td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </>
  );
}
