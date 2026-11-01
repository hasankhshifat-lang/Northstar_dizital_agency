import { useState } from "react";
import { Link } from "react-router";
import { fmtDate } from "../api";
import { useT } from "../i18n";
import { Badge, Button, Card, ErrorText, Input, PageHeader, Select, Table, useApi } from "../ui";

export interface ClientSummary {
  id: string; business_name: string; status: string; plan_label: string | null; owner_email: string; last_login_at: string | null;
  features: string[]; usage: { ai_replies: number; conversations: number; outbound_messages: number; orders: number };
}

export function ClientsPage() {
  const { t } = useT();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status) params.set("status", status);
  const { data, error } = useApi<{ clients: ClientSummary[] }>(`/api/admin/clients?${params}`);
  return (
    <>
      <PageHeader title={t("clients")} actions={<Link to="/admin/clients/new"><Button>+ {t("new_client")}</Button></Link>} />
      <Card>
        <div className="mb-4 flex flex-wrap gap-3">
          <Input placeholder={t("search")} value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="max-w-[12rem]">
            <option value="">{t("all")}</option>
            <option value="active">{t("active")}</option>
            <option value="suspended">{t("suspended")}</option>
          </Select>
        </div>
        <ErrorText error={error} />
        <Table empty={data?.clients.length === 0} head={[t("business_name"), t("status"), t("plan"), t("features"), t("ai_replies"), t("conversations"), t("orders_count"), t("last_login")]}>
          {data?.clients.map((c) => (
            <tr key={c.id} className="hover:bg-slate-50">
              <td className="px-3 py-2"><Link className="font-medium text-brand-700 hover:underline" to={`/admin/clients/${c.id}`}>{c.business_name}</Link><div className="text-xs text-slate-500">{c.owner_email}</div></td>
              <td className="px-3 py-2"><Badge tone={c.status === "active" ? "green" : "red"}>{t(c.status)}</Badge></td>
              <td className="px-3 py-2">{c.plan_label ?? "—"}</td>
              <td className="px-3 py-2"><div className="flex flex-wrap gap-1">{c.features.map((f) => <Badge key={f} tone="blue">{t("f_" + f)}</Badge>)}</div></td>
              <td className="px-3 py-2">{c.usage.ai_replies}</td>
              <td className="px-3 py-2">{c.usage.conversations}</td>
              <td className="px-3 py-2">{c.usage.orders}</td>
              <td className="px-3 py-2 text-slate-500">{fmtDate(c.last_login_at)}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
