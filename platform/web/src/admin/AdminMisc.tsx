import { useState } from "react";
import { api, fmtDate } from "../api";
import { useT } from "../i18n";
import { Button, Card, ErrorText, Field, Input, PageHeader, Table, Toggle, useApi } from "../ui";

export function AuditPage() {
  const { t } = useT();
  const { data, error } = useApi<{ entries: any[] }>("/api/admin/audit");
  return (
    <>
      <PageHeader title={t("activity_log")} />
      <Card>
        <ErrorText error={error} />
        <Table empty={data?.entries.length === 0} head={[t("when"), t("who"), t("clients"), t("what")]}>
          {data?.entries.map((e) => (
            <tr key={e.id}>
              <td className="px-3 py-2 text-slate-500 whitespace-nowrap">{fmtDate(e.created_at)}</td>
              <td className="px-3 py-2">{e.actor_name ?? "—"}</td>
              <td className="px-3 py-2">{e.business_name ?? "—"}</td>
              <td className="px-3 py-2"><span className="font-mono text-xs">{e.action}</span> <span className="text-slate-500">{Object.entries(e.details).map(([k, v]) => `${k}: ${v}`).join(", ")}</span></td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}

export function EngineJobsPage() {
  const { t } = useT();
  const { data, error, reload } = useApi<{ jobs: any[] }>("/api/admin/engine-jobs?status=failed");
  const [err, setErr] = useState<unknown>(null);
  return (
    <>
      <PageHeader title={t("failed_jobs")} />
      <Card>
        <ErrorText error={error ?? err} />
        <Table empty={data?.jobs.length === 0} head={[t("when"), t("clients"), t("command"), t("attempts"), t("error"), ""]}>
          {data?.jobs.map((j) => (
            <tr key={j.id}>
              <td className="px-3 py-2 text-slate-500">{fmtDate(j.created_at)}</td>
              <td className="px-3 py-2">{j.business_name}</td>
              <td className="px-3 py-2 font-mono text-xs">{j.command}</td>
              <td className="px-3 py-2">{j.attempts}</td>
              <td className="px-3 py-2 text-xs text-red-700">{j.last_error}</td>
              <td className="px-3 py-2"><Button size="sm" variant="secondary" onClick={() => api(`/api/admin/engine-jobs/${j.id}/retry`, { method: "POST" }).then(reload, setErr)}>{t("retry")}</Button></td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}

const FEATURES = ["inbox", "ai_agent", "orders", "followups"];
const CHANNELS = ["messenger", "instagram", "whatsapp", "website"];

export function PresetsPage() {
  const { t } = useT();
  const { data, error, reload } = useApi<{ presets: { label: string; features: string[]; channels: string[] }[] }>("/api/admin/presets");
  const [draft, setDraft] = useState({ label: "", features: [...FEATURES], channels: [...CHANNELS] });
  const [err, setErr] = useState<unknown>(null);
  const flip = (list: string[], v: string, on: boolean) => (on ? [...new Set([...list, v])] : list.filter((x) => x !== v));
  const save = async (p: typeof draft) => {
    setErr(null);
    try { await api("/api/admin/presets", { json: p }); reload(); } catch (e) { setErr(e); }
  };
  return (
    <>
      <PageHeader title={t("plan_presets")} />
      <ErrorText error={error ?? err} />
      <div className="grid gap-6 lg:grid-cols-2">
        {[...(data?.presets ?? []), { ...draft, isNew: true }].map((p: any) => (
          <Card key={p.isNew ? "__new" : p.label} title={p.isNew ? `+ ${t("add")}` : p.label}
            actions={!p.isNew && <Button variant="ghost" size="sm" onClick={() => api(`/api/admin/presets/${encodeURIComponent(p.label)}`, { method: "DELETE" }).then(reload)}>{t("delete")}</Button>}>
            {p.isNew && <Field label={t("preset_label")}><Input value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} placeholder="Starter" /></Field>}
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              {FEATURES.map((f) => (
                <label key={f} className="flex items-center justify-between gap-2"><span>{t("f_" + f)}</span>
                  <Toggle checked={p.features.includes(f)} onChange={(v) => (p.isNew ? setDraft({ ...draft, features: flip(draft.features, f, v) }) : save({ ...p, features: flip(p.features, f, v) }))} /></label>
              ))}
              {CHANNELS.map((ch) => (
                <label key={ch} className="flex items-center justify-between gap-2"><span>{t("ch_" + ch)}</span>
                  <Toggle checked={p.channels.includes(ch)} onChange={(v) => (p.isNew ? setDraft({ ...draft, channels: flip(draft.channels, ch, v) }) : save({ ...p, channels: flip(p.channels, ch, v) }))} /></label>
              ))}
            </div>
            {p.isNew && <Button className="mt-4" disabled={!draft.label.trim()} onClick={() => save(draft).then(() => setDraft({ label: "", features: [...FEATURES], channels: [...CHANNELS] }))}>{t("save")}</Button>}
          </Card>
        ))}
      </div>
    </>
  );
}
