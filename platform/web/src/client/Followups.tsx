import { useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { api, fmtDate, taka } from "../api";
import { useT } from "../i18n";
import { Badge, Button, Card, ErrorText, Field, Input, PageHeader, Select, Table, Textarea, Toggle, cx, useApi } from "../ui";
import { pname, type Product } from "./commerce/Products";

const TABS = ["rules", "broadcast", "history", "results"] as const;
interface Rule { id: string; type: string; enabled: boolean; delay_minutes: number; message_template: string; offer_text: string | null; whatsapp_template_name: string | null }

export function FollowupsPage() {
  const { t } = useT();
  const [sp, setSp] = useSearchParams();
  const tab = (sp.get("tab") as (typeof TABS)[number]) || "rules";
  const labels: Record<string, string> = { rules: "tab_rules_fu", broadcast: "tab_broadcast", history: "tab_history", results: "tab_results" };
  return (
    <>
      <PageHeader title={t("followups")} />
      <div className="mb-4 flex flex-wrap gap-1 border-b border-slate-200">
        {TABS.map((k) => (
          <button key={k} onClick={() => setSp({ tab: k })} className={cx("-mb-px border-b-2 px-3 py-2 text-sm font-medium", tab === k ? "border-brand-600 text-brand-700" : "border-transparent text-slate-600")}>{t(labels[k])}</button>
        ))}
      </div>
      <p className="mb-4 max-w-3xl rounded-lg bg-brand-50 p-3 text-sm text-brand-900">ⓘ {t("rule_24h_warn")}</p>
      {tab === "rules" && <Rules />}
      {tab === "broadcast" && <Broadcast onSent={() => setSp({ tab: "history" })} />}
      {tab === "history" && <History />}
      {tab === "results" && <Results />}
    </>
  );
}

function splitDelay(min: number): [number, string] {
  if (min % 1440 === 0) return [min / 1440, "days"];
  if (min % 60 === 0) return [min / 60, "hours"];
  return [min, "minutes"];
}
const UNIT_MIN: Record<string, number> = { minutes: 1, hours: 60, days: 1440 };

function RuleCard({ rule }: { rule: Rule }) {
  const { t } = useT();
  const [r, setR] = useState(rule);
  const [amount, setAmount] = useState(splitDelay(rule.delay_minutes)[0]);
  const [unit, setUnit] = useState(splitDelay(rule.delay_minutes)[1]);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<unknown>(null);
  const ta = useRef<HTMLTextAreaElement>(null);
  const save = async (patch: Partial<Rule> = {}) => {
    setErr(null);
    const next = { ...r, ...patch, delay_minutes: Math.round(amount * UNIT_MIN[unit]) };
    try {
      const res = await api<{ rule: Rule }>(`/api/followups/rules/${r.id}`, { method: "PUT", json: {
        enabled: next.enabled, delay_minutes: next.delay_minutes, message_template: next.message_template, offer_text: next.offer_text || null, whatsapp_template_name: next.whatsapp_template_name || null,
      } });
      setR(res.rule);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (e) { setErr(e); }
  };
  const insert = (v: string) => {
    const el = ta.current;
    const pos = el?.selectionStart ?? r.message_template.length;
    setR({ ...r, message_template: r.message_template.slice(0, pos) + v + r.message_template.slice(pos) });
  };
  const past24h = amount * UNIT_MIN[unit] >= 1440;
  return (
    <Card title={<span>{t("rule_" + r.type)} {r.enabled ? <Badge tone="green">{t("on")}</Badge> : <Badge>{t("off")}</Badge>}</span>}
      actions={<Toggle checked={r.enabled} label={t("rule_" + r.type)} onChange={(v) => save({ enabled: v })} />}>
      <p className="mb-3 text-sm text-slate-500">{t("rule_" + r.type + "_help")}</p>
      <div className="space-y-3">
        <Field label={t("delay")}>
          <div className="flex gap-2">
            <Input type="number" min="1" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="max-w-28" />
            <Select value={unit} onChange={(e) => setUnit(e.target.value)} className="max-w-36">
              <option value="minutes">{t("minutes")}</option><option value="hours">{t("hours_unit")}</option><option value="days">{t("days_unit")}</option>
            </Select>
          </div>
        </Field>
        <Field label={t("message_template")}>
          <Textarea ref={ta} value={r.message_template} onChange={(e) => setR({ ...r, message_template: e.target.value })} />
        </Field>
        <div className="flex flex-wrap items-center gap-1 text-xs">
          <span className="text-slate-500">{t("insert_var")}</span>
          {["{name}", "{product}", "{order_number}", "{offer}"].map((v) => <button key={v} type="button" onClick={() => insert(v)} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono hover:bg-slate-200">{v}</button>)}
        </div>
        <Field label={t("offer_text")}><Input value={r.offer_text ?? ""} onChange={(e) => setR({ ...r, offer_text: e.target.value })} /></Field>
        <Field label={t("wa_template")}><Input value={r.whatsapp_template_name ?? ""} onChange={(e) => setR({ ...r, whatsapp_template_name: e.target.value })} /></Field>
        {past24h && !r.whatsapp_template_name && <p className="rounded bg-amber-50 px-2 py-1 text-xs text-amber-900">⚠ {t("rule_needs_template")}</p>}
        <ErrorText error={err} />
        <div className="flex items-center gap-2"><Button size="sm" onClick={() => save()}>{t("save")}</Button>{saved && <span className="text-sm text-emerald-700">{t("saved")}</span>}</div>
      </div>
    </Card>
  );
}

function Rules() {
  const { data, error } = useApi<{ rules: Rule[] }>("/api/followups/rules");
  return (
    <>
      <ErrorText error={error} />
      <div className="grid gap-6 lg:grid-cols-2">{data?.rules.map((r) => <RuleCard key={r.id} rule={r} />)}</div>
    </>
  );
}

function Broadcast({ onSent }: { onSent: () => void }) {
  const { t } = useT();
  const products = useApi<{ products: Product[] }>("/api/products?status=active");
  const [type, setType] = useState("recent24h");
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");
  const [productId, setProductId] = useState("");
  const [when, setWhen] = useState("");
  const [preview, setPreview] = useState<{ by_channel: Record<string, number>; excluded: { reason: string; count: number }[]; total: number } | null>(null);
  const [err, setErr] = useState<unknown>(null);
  const [done, setDone] = useState<string | null>(null);
  const audience = () => (type === "recent24h" ? { type } : type === "inactive_days" ? { type, value: Number(value) } : { type, value });
  const doPreview = async () => {
    setErr(null);
    try { setPreview(await api("/api/broadcasts/preview", { json: { audience: audience() } })); } catch (e) { setErr(e); }
  };
  const send = async () => {
    setErr(null);
    try {
      const r = await api<{ broadcast: { status: string } }>("/api/broadcasts", { json: { audience: audience(), message, product_id: productId || null, scheduled_for: when ? new Date(when).toISOString() : null } });
      setDone(r.broadcast.status === "sent" ? t("broadcast_sent") : t("broadcast_scheduled"));
      setTimeout(onSent, 1200);
    } catch (e) { setErr(e); }
  };
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title={`1. ${t("audience")}`}>
        <div className="space-y-3">
          <Select value={type} onChange={(e) => { setType(e.target.value); setValue(""); setPreview(null); }}>
            {["recent24h", "tag", "bought_product", "inactive_days"].map((a) => <option key={a} value={a}>{t("aud_" + a)}</option>)}
          </Select>
          {type === "tag" && <Input placeholder="VIP" value={value} onChange={(e) => { setValue(e.target.value); setPreview(null); }} />}
          {type === "inactive_days" && <Input type="number" min="1" placeholder="30" value={value} onChange={(e) => { setValue(e.target.value); setPreview(null); }} />}
          {type === "bought_product" && (
            <Select value={value} onChange={(e) => { setValue(e.target.value); setPreview(null); }}>
              <option value="">—</option>{products.data?.products.map((p) => <option key={p.id} value={p.id}>{pname(p)}</option>)}
            </Select>
          )}
          <Button variant="secondary" onClick={doPreview} disabled={type !== "recent24h" && !value}>{t("preview")}</Button>
          {preview && (
            <div className="rounded-lg bg-slate-50 p-3 text-sm" data-testid="preview">
              <div className="font-semibold">{t("will_receive", { n: preview.total })}</div>
              <div className="mt-1 flex flex-wrap gap-1">{Object.entries(preview.by_channel).map(([ch, n]) => <Badge key={ch} tone="blue">{t("ch_" + ch)}: {n}</Badge>)}</div>
              {preview.excluded.length > 0 && (
                <div className="mt-2"><span className="text-slate-500">{t("excluded")}:</span> {preview.excluded.map((x) => <span key={x.reason} className="mr-2">{t("ex_" + x.reason)} ({x.count})</span>)}</div>
              )}
            </div>
          )}
        </div>
      </Card>
      <Card title={`2. ${t("message")}`}>
        <div className="space-y-3">
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="আজ রাত ১১টা পর্যন্ত ফ্রি ডেলিভারি! 🎉" />
          <Field label={t("attach_product")}>
            <Select value={productId} onChange={(e) => setProductId(e.target.value)}>
              <option value="">—</option>{products.data?.products.map((p) => <option key={p.id} value={p.id}>{pname(p)} · {taka(p.sale_price ?? p.price)}</option>)}
            </Select>
          </Field>
          <Field label={t("schedule_for")}><Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} /></Field>
          <ErrorText error={err} />
          {done ? <p className="text-emerald-700">{done}</p> : <Button disabled={!message.trim() || !preview} onClick={send}>{when ? t("schedule") : t("send_now")}</Button>}
        </div>
      </Card>
    </div>
  );
}

function History() {
  const { t } = useT();
  const { data } = useApi<{ broadcasts: { id: string; message: string; audience: any; scheduled_for: string; status: string }[] }>("/api/broadcasts");
  return (
    <Card>
      <Table empty={data?.broadcasts.length === 0} head={[t("when"), t("audience"), t("message"), t("status")]}>
        {data?.broadcasts.map((b) => (
          <tr key={b.id}>
            <td className="px-3 py-2 whitespace-nowrap text-slate-500">{fmtDate(b.scheduled_for)}</td>
            <td className="px-3 py-2">{t("aud_" + b.audience.type)}{b.audience.value ? `: ${b.audience.value}` : ""}</td>
            <td className="px-3 py-2">{b.message}</td>
            <td className="px-3 py-2"><Badge tone={b.status === "sent" ? "green" : "amber"}>{t("bs_" + b.status)}</Badge></td>
          </tr>
        ))}
      </Table>
    </Card>
  );
}

function Results() {
  const { t } = useT();
  const { data } = useApi<{ rules: any[]; broadcasts: any[]; skipped: Record<string, number> }>("/api/followups/results");
  const head = [t("name"), t("sent"), t("replied"), t("orders_after"), t("order_value")];
  const row = (label: string, r: any) => (
    <tr key={r.id}><td className="px-3 py-2">{label}</td><td className="px-3 py-2">{r.sent}</td><td className="px-3 py-2">{r.replied}</td><td className="px-3 py-2">{r.orders}</td><td className="px-3 py-2">{taka(r.order_value)}</td></tr>
  );
  return (
    <div className="space-y-6">
      <Card title={t("tab_rules_fu")}><Table head={head}>{data?.rules.map((r) => row(t("rule_" + r.type), r))}</Table></Card>
      <Card title={t("tab_history")}><Table empty={data?.broadcasts.length === 0} head={head}>{data?.broadcasts.map((b) => row(b.message, b))}</Table></Card>
      {data && Object.keys(data.skipped).length > 0 && (
        <Card title={t("skipped_summary")}>
          <div className="flex flex-wrap gap-2">{Object.entries(data.skipped).map(([k, n]) => <Badge key={k} tone="amber">{t("sk_" + k)}: {n}</Badge>)}</div>
        </Card>
      )}
    </div>
  );
}
