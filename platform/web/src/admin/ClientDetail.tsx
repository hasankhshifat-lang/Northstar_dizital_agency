import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { BrainCircuit } from "lucide-react";
import { api, fmtDate } from "../api";
import { useT } from "../i18n";
import { Badge, Button, Card, CopyButton, ErrorText, Field, Input, Modal, PageHeader, Select, Table, Toggle, useApi } from "../ui";

const FEATURES = ["inbox", "ai_agent", "orders", "followups"];
const CHANNELS = ["messenger", "instagram", "whatsapp", "website"];

interface ClientDetail {
  id: string; business_name: string; slug: string; status: string; suspended_reason: string | null; plan_label: string | null; created_at: string;
  features: string[]; channels: string[];
  owner: { name: string; email: string; phone: string | null; last_login_at: string | null } | null;
  usage_history: { month: string; ai_replies: number; conversations: number; outbound_messages: number; orders: number }[];
}

export function ClientDetailPage() {
  const { t } = useT();
  const { id } = useParams();
  const nav = useNavigate();
  const { data, error, setData } = useApi<{ client: ClientDetail }>(`/api/admin/clients/${id}`);
  const presets = useApi<{ presets: { label: string }[] }>("/api/admin/presets");
  const [actionError, setActionError] = useState<unknown>(null);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [confirmName, setConfirmName] = useState("");
  const [setupUrl, setSetupUrl] = useState<string | null>(null);

  const act = async (path: string, init: { method?: string; json?: unknown }) => {
    setActionError(null);
    try {
      const r = await api<{ client: ClientDetail }>(`/api/admin/clients/${id}${path}`, init);
      if (r.client) setData({ client: r.client });
      return r;
    } catch (e) {
      setActionError(e);
      throw e;
    }
  };

  if (error) return <ErrorText error={error} />;
  if (!data) return <p>{t("loading")}</p>;
  const c = data.client;
  return (
    <>
      <PageHeader title={c.business_name} actions={<Badge tone={c.status === "active" ? "green" : "red"}>{t(c.status)}</Badge>} />
      <ErrorText error={actionError} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title={t("account")}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-medium">{c.status === "active" ? t("active") : t("suspended")}</div>
              {c.suspended_reason && <div className="text-sm text-slate-500">{c.suspended_reason}</div>}
            </div>
            <Toggle label={t("account")} checked={c.status === "active"} onChange={(on) => (on ? act("/reactivate", { method: "POST" }) : setSuspendOpen(true))} />
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <dt className="text-slate-500">{t("owner")}</dt><dd>{c.owner?.name} · {c.owner?.email}</dd>
            <dt className="text-slate-500">{t("phone")}</dt><dd>{c.owner?.phone ?? "—"}</dd>
            <dt className="text-slate-500">{t("last_login")}</dt><dd>{fmtDate(c.owner?.last_login_at)}</dd>
          </dl>
          <div className="mt-4 flex items-end gap-2">
            <Field label={t("plan")}>
              <Select value={c.plan_label ?? ""} onChange={(e) => act("", { method: "PATCH", json: { plan_label: e.target.value || null } })}>
                <option value="">—</option>
                {presets.data?.presets.map((p) => <option key={p.label} value={p.label}>{p.label}</option>)}
              </Select>
            </Field>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={async () => setSetupUrl((await act("/reset-login", { method: "POST" }) as any).setup_url)}>{t("reset_login")}</Button>
          </div>
          {setupUrl && <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-100 p-2 text-xs break-all">{setupUrl} <CopyButton text={setupUrl} /></div>}
        </Card>

        <Card title={`${t("features")} & ${t("channels")}`}>
          <div className="space-y-3">
            {FEATURES.map((f) => (
              <div key={f} className="flex items-center justify-between">
                <span>{t("f_" + f)}</span>
                <Toggle label={t("f_" + f)} checked={c.features.includes(f)} onChange={(v) => act(`/features/${f}`, { method: "PUT", json: { enabled: v } })} />
              </div>
            ))}
            <hr className="border-slate-200" />
            {CHANNELS.map((ch) => (
              <div key={ch} className="flex items-center justify-between">
                <span>{t("ch_" + ch)}</span>
                <Toggle label={t("ch_" + ch)} checked={c.channels.includes(ch)} onChange={(v) => act(`/channels/${ch}`, { method: "PUT", json: { enabled: v } })} />
              </div>
            ))}
          </div>
        </Card>

        <Card title={t("ai_training")} className="lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-2xl text-sm text-slate-600">{t("training_intro")}</p>
            <Link to={`/admin/clients/${c.id}/train`}><Button><BrainCircuit size={16} className="mr-1.5 inline" />{t("train_ai")}</Button></Link>
          </div>
        </Card>

        <Card title={t("usage_history")} className="lg:col-span-2">
          <Table empty={c.usage_history.length === 0} head={[t("month"), t("ai_replies"), t("conversations"), t("outbound_messages"), t("orders_count")]}>
            {c.usage_history.map((u) => (
              <tr key={u.month}><td className="px-3 py-2">{u.month}</td><td className="px-3 py-2">{u.ai_replies}</td><td className="px-3 py-2">{u.conversations}</td><td className="px-3 py-2">{u.outbound_messages}</td><td className="px-3 py-2">{u.orders}</td></tr>
            ))}
          </Table>
        </Card>

        <Card title={t("danger_zone")} className="lg:col-span-2 border-red-200">
          <Button variant="danger" onClick={() => setDeleteOpen(true)}>{t("delete_client")}</Button>
        </Card>
      </div>

      <Modal open={suspendOpen} title={t("suspend")} onClose={() => setSuspendOpen(false)}>
        <p className="mb-3 text-sm text-slate-600">{t("suspend_confirm")}</p>
        <Field label={t("suspend_reason")}><Input value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setSuspendOpen(false)}>{t("cancel")}</Button>
          <Button variant="danger" onClick={async () => { await act("/suspend", { method: "POST", json: { reason: reason || undefined } }); setSuspendOpen(false); }}>{t("suspend")}</Button>
        </div>
      </Modal>

      <Modal open={deleteOpen} title={t("delete_client")} onClose={() => setDeleteOpen(false)}>
        <p className="mb-3 text-sm text-slate-600">{t("delete_confirm")}</p>
        <Input value={confirmName} onChange={(e) => setConfirmName(e.target.value)} placeholder={c.business_name} />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteOpen(false)}>{t("cancel")}</Button>
          <Button variant="danger" disabled={confirmName.trim() !== c.business_name}
            onClick={async () => { await act("", { method: "DELETE", json: { confirm_name: confirmName } }); nav("/admin"); }}>{t("delete")}</Button>
        </div>
      </Modal>
    </>
  );
}
