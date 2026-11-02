import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Bot, BrainCircuit, MessagesSquare, PauseCircle, ShoppingBag, Users } from "lucide-react";
import { fmtDate } from "../api";
import { useT } from "../i18n";
import { Avatar, Badge, Button, Card, ErrorText, Input, PageHeader, Stat, Table, cx, useApi } from "../ui";

export interface ClientSummary {
  id: string; business_name: string; status: string; plan_label: string | null; owner_email: string; last_login_at: string | null;
  features: string[]; knowledge_sources: number; usage: { ai_replies: number; conversations: number; outbound_messages: number; orders: number };
}

export function ClientsPage() {
  const { t } = useT();
  const [sp] = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [status, setStatus] = useState("");
  useEffect(() => setQ(sp.get("q") ?? ""), [sp]);
  const all = useApi<{ clients: ClientSummary[] }>("/api/admin/clients");
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status) params.set("status", status);
  const { data, error } = useApi<{ clients: ClientSummary[] }>(`/api/admin/clients?${params}`);
  const list = all.data?.clients ?? [];
  const sum = (k: keyof ClientSummary["usage"]) => list.reduce((s, c) => s + c.usage[k], 0);
  const active = list.filter((c) => c.status === "active").length;
  return (
    <>
      <PageHeader title={t("clients")} subtitle={t("admin_panel")} actions={<Link to="/admin/clients/new"><Button>+ {t("new_client")}</Button></Link>} />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Users} chip="violet" label={t("clients")} value={list.length} hint={`${active} ${t("active").toLowerCase()}`} />
        <Stat icon={PauseCircle} chip="red" label={t("suspended")} value={list.length - active} />
        <Stat icon={Bot} chip="teal" label={t("ai_replies")} value={sum("ai_replies")} hint={t("usage_month")} />
        <Stat icon={ShoppingBag} chip="amber" label={t("orders_count")} value={sum("orders")} hint={t("usage_month")} />
      </div>
      <Card>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
            {[["", t("all")], ["active", t("active")], ["suspended", t("suspended")]].map(([v, label]) => (
              <button key={v} onClick={() => setStatus(v)}
                className={cx("rounded-lg px-3 py-1.5 text-sm font-medium transition", status === v ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900")}>{label}</button>
            ))}
          </div>
          <Input placeholder={t("search")} value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        </div>
        <ErrorText error={error} />
        <Table empty={data?.clients.length === 0} head={[t("business_name"), t("status"), t("plan"), t("features"), <MessagesSquare key="c" size={14} />, t("ai_replies"), t("orders_count"), t("last_login"), t("ai_training")]}>
          {data?.clients.map((c) => (
            <tr key={c.id}>
              <td className="px-3 py-3">
                <Link to={`/admin/clients/${c.id}`} className="flex items-center gap-3">
                  <Avatar name={c.business_name} />
                  <span className="min-w-0">
                    <span className="block font-semibold text-slate-900 hover:text-brand-700">{c.business_name}</span>
                    <span className="block text-xs text-slate-500">{c.owner_email}</span>
                  </span>
                </Link>
              </td>
              <td className="px-3 py-3"><Badge tone={c.status === "active" ? "green" : "red"}>{t(c.status)}</Badge></td>
              <td className="px-3 py-3">{c.plan_label ?? "—"}</td>
              <td className="px-3 py-3"><div className="flex max-w-56 flex-wrap gap-1">{c.features.map((f) => <Badge key={f} tone="blue">{t("f_" + f)}</Badge>)}</div></td>
              <td className="px-3 py-3">{c.usage.conversations}</td>
              <td className="px-3 py-3">{c.usage.ai_replies}</td>
              <td className="px-3 py-3">{c.usage.orders}</td>
              <td className="px-3 py-3 whitespace-nowrap text-slate-500">{fmtDate(c.last_login_at)}</td>
              <td className="px-3 py-3">
                <Link to={`/admin/clients/${c.id}/train`} title={t("train_ai")}>
                  <Button size="sm" variant="secondary" className="whitespace-nowrap"><BrainCircuit size={15} className="mr-1 inline" />{t("train_ai")}{c.knowledge_sources ? ` · ${c.knowledge_sources}` : ""}</Button>
                </Link>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
