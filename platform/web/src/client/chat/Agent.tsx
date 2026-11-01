import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { api, fmtDate } from "../../api";
import { useT } from "../../i18n";
import { Button, Card, ErrorText, Field, Input, PageHeader, Select, Table, Textarea, Toggle, cx, useApi } from "../../ui";

const TABS = ["profile", "tone", "faqs", "rules", "unanswered", "test"] as const;
type Cfg = { profile: Record<string, any>; tone: Record<string, any>; rules: Record<string, any> };

export function AgentPage() {
  const { t } = useT();
  const [sp, setSp] = useSearchParams();
  const tab = (sp.get("tab") as (typeof TABS)[number]) || "profile";
  const cfg = useApi<Cfg>("/api/agent/config");
  const [draft, setDraft] = useState<Cfg | null>(null);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<unknown>(null);
  useEffect(() => { if (cfg.data) setDraft({ profile: cfg.data.profile, tone: cfg.data.tone, rules: cfg.data.rules }); }, [cfg.data]);
  const save = async () => {
    setErr(null);
    try { await api("/api/agent/config", { method: "PUT", json: draft }); setSaved(true); setTimeout(() => setSaved(false), 2000); } catch (e) { setErr(e); }
  };
  const setP = (k: string) => (e: { target: { value: string } }) => setDraft({ ...draft!, profile: { ...draft!.profile, [k]: e.target.value } });
  const pm: string[] = draft?.profile.payment_methods ?? [];
  const saveBar = (
    <div className="mt-6 flex items-center gap-3"><Button onClick={save}>{t("save")}</Button>{saved && <span className="text-sm text-emerald-700">{t("saved")}</span>}<span className="text-xs text-slate-500">{t("push_note")}</span></div>
  );
  return (
    <>
      <PageHeader title={t("ai_settings")} />
      <div className="mb-4 flex flex-wrap gap-1 border-b border-slate-200">
        {TABS.map((k) => (
          <button key={k} onClick={() => setSp({ tab: k })} className={cx("-mb-px border-b-2 px-3 py-2 text-sm font-medium", tab === k ? "border-brand-600 text-brand-700" : "border-transparent text-slate-600 hover:text-slate-900")}>{t("tab_" + k)}</button>
        ))}
      </div>
      <ErrorText error={cfg.error ?? err} />
      {draft && tab === "profile" && (
        <Card className="max-w-3xl">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("shop_name")}><Input value={draft.profile.shop_name ?? ""} onChange={setP("shop_name")} /></Field>
            <Field label={t("hours")}><Input value={draft.profile.hours ?? ""} onChange={setP("hours")} placeholder="সকাল ১০টা – রাত ১০টা" /></Field>
            <div className="sm:col-span-2"><Field label={t("sells")}><Textarea value={draft.profile.sells ?? ""} onChange={setP("sells")} /></Field></div>
            <Field label={t("delivery_areas")}><Input value={draft.profile.delivery_areas ?? ""} onChange={setP("delivery_areas")} /></Field>
            <Field label={t("delivery_charges")}><Input value={draft.profile.delivery_charges ?? ""} onChange={setP("delivery_charges")} placeholder="ঢাকা ৳৬০, বাইরে ৳১২০" /></Field>
            <div className="sm:col-span-2"><Field label={t("return_policy")}><Textarea value={draft.profile.return_policy ?? ""} onChange={setP("return_policy")} /></Field></div>
            <Field label={t("whatsapp_number")}><Input value={draft.profile.whatsapp ?? ""} onChange={setP("whatsapp")} /></Field>
            <Field label={t("messenger_url")}><Input value={draft.profile.messenger_url ?? ""} onChange={setP("messenger_url")} /></Field>
          </div>
          <h3 className="mt-4 mb-2 text-sm font-medium">{t("payment_methods")}</h3>
          <div className="flex flex-wrap gap-4">
            {["cod", "bkash", "nagad", "card", "bank"].map((m) => (
              <label key={m} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={pm.includes(m)} onChange={(e) => setDraft({ ...draft, profile: { ...draft.profile, payment_methods: e.target.checked ? [...pm, m] : pm.filter((x) => x !== m) } })} />
                {t("pm_" + m) === "pm_" + m ? m.toUpperCase() : t("pm_" + m)}
              </label>
            ))}
          </div>
          {saveBar}
        </Card>
      )}
      {draft && tab === "tone" && (
        <Card className="max-w-xl">
          <div className="space-y-4">
            <Field label={t("reply_language")}>
              <Select value={draft.tone.language ?? "match"} onChange={(e) => setDraft({ ...draft, tone: { ...draft.tone, language: e.target.value } })}>
                <option value="bn">{t("lang_bn")}</option><option value="en">{t("lang_en")}</option><option value="match">{t("lang_match")}</option>
              </Select>
            </Field>
            <Field label={t("formality")}>
              <Select value={draft.tone.formality ?? "friendly"} onChange={(e) => setDraft({ ...draft, tone: { ...draft.tone, formality: e.target.value } })}>
                <option value="friendly">{t("friendly")}</option><option value="formal">{t("formal")}</option>
              </Select>
            </Field>
            <label className="flex items-center justify-between">{t("address_terms")}<Toggle checked={!!draft.tone.address_terms} onChange={(v) => setDraft({ ...draft, tone: { ...draft.tone, address_terms: v } })} /></label>
          </div>
          {saveBar}
        </Card>
      )}
      {draft && tab === "rules" && (
        <Card className="max-w-xl">
          <div className="space-y-4">
            <Field label={t("max_discount")}><Input type="number" min="0" max="100" value={draft.rules.max_discount_pct ?? ""} onChange={(e) => setDraft({ ...draft, rules: { ...draft.rules, max_discount_pct: e.target.value === "" ? undefined : Number(e.target.value) } })} /></Field>
            <label className="flex items-center justify-between">{t("handoff_angry")}<Toggle checked={!!draft.rules.handoff_angry} onChange={(v) => setDraft({ ...draft, rules: { ...draft.rules, handoff_angry: v } })} /></label>
            <label className="flex items-center justify-between">{t("handoff_refund")}<Toggle checked={!!draft.rules.handoff_refund} onChange={(v) => setDraft({ ...draft, rules: { ...draft.rules, handoff_refund: v } })} /></label>
            <Field label={t("extra_rules")}><Textarea value={draft.rules.extra ?? ""} onChange={(e) => setDraft({ ...draft, rules: { ...draft.rules, extra: e.target.value } })} /></Field>
          </div>
          {saveBar}
        </Card>
      )}
      {tab === "faqs" && <Faqs />}
      {tab === "unanswered" && <Unanswered />}
      {tab === "test" && <TestChat />}
    </>
  );
}

function Faqs() {
  const { t } = useT();
  const { data, reload } = useApi<{ faqs: { id: string; question: string; answer: string }[] }>("/api/agent/faqs");
  const [f, setF] = useState({ question: "", answer: "" });
  const [err, setErr] = useState<unknown>(null);
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title={t("tab_faqs")}>
        <Table empty={data?.faqs.length === 0} head={[t("question"), t("answer"), ""]}>
          {data?.faqs.map((q) => (
            <tr key={q.id}><td className="px-3 py-2 font-medium">{q.question}</td><td className="px-3 py-2">{q.answer}</td>
              <td className="px-3 py-2"><button className="text-red-600" onClick={() => api(`/api/agent/faqs/${q.id}`, { method: "DELETE" }).then(reload)}>✕</button></td></tr>
          ))}
        </Table>
      </Card>
      <Card title={`+ ${t("add")}`}>
        <div className="space-y-3">
          <Field label={t("question")}><Input value={f.question} onChange={(e) => setF({ ...f, question: e.target.value })} /></Field>
          <Field label={t("answer")}><Textarea value={f.answer} onChange={(e) => setF({ ...f, answer: e.target.value })} /></Field>
          <ErrorText error={err} />
          <Button disabled={!f.question || !f.answer} onClick={async () => { try { await api("/api/agent/faqs", { json: f }); setF({ question: "", answer: "" }); reload(); } catch (e) { setErr(e); } }}>{t("save")}</Button>
        </div>
      </Card>
    </div>
  );
}

function Unanswered() {
  const { t } = useT();
  const { data, reload } = useApi<{ questions: { id: string; sample_text: string; count: number; last_asked_at: string }[] }>("/api/agent/unanswered");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  return (
    <Card title={t("tab_unanswered")}>
      <p className="mb-4 text-sm text-slate-600">{t("teach_hint")}</p>
      {data?.questions.length === 0 && <p className="text-slate-500">{t("no_alerts")}</p>}
      <ul className="space-y-3">
        {data?.questions.map((q) => (
          <li key={q.id} className="rounded-lg border border-slate-200 p-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-medium">{q.sample_text}</span>
              <span className="text-xs text-slate-500"><b className="text-brand-700">{t("asked_times", { n: q.count })}</b> · {t("last_asked")} {fmtDate(q.last_asked_at)}</span>
            </div>
            <div className="mt-2 flex gap-2">
              <Input placeholder={t("answer")} value={answers[q.id] ?? ""} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} />
              <Button disabled={!answers[q.id]?.trim()} onClick={() => api(`/api/agent/unanswered/${q.id}/teach`, { json: { answer: answers[q.id] } }).then(reload)}>{t("teach")}</Button>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function TestChat() {
  const { t } = useT();
  const [msgs, setMsgs] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [text, setText] = useState("");
  const [err, setErr] = useState<unknown>(null);
  const send = async () => {
    if (!text.trim()) return;
    const next = [...msgs, { role: "user" as const, text }];
    setMsgs(next);
    setText("");
    setErr(null);
    try { const r = await api<{ reply: string }>("/api/agent/test-chat", { json: { messages: next } }); setMsgs([...next, { role: "assistant", text: r.reply }]); } catch (e) { setErr(e); }
  };
  return (
    <Card title={t("tab_test")} className="max-w-2xl">
      <p className="mb-3 text-sm text-slate-600">{t("test_hint")}</p>
      <div className="mb-3 h-80 space-y-2 overflow-y-auto rounded-lg bg-slate-50 p-3">
        {msgs.map((m, i) => (
          <div key={i} className={cx("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cx("max-w-[75%] rounded-2xl px-3 py-2 text-sm", m.role === "user" ? "bg-brand-600 text-white" : "bg-violet-100")} data-testid={m.role === "assistant" ? "ai-reply" : undefined}>{m.text}</div>
          </div>
        ))}
      </div>
      <ErrorText error={err} />
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder={t("type_reply")} />
        <Button type="submit">{t("send")}</Button>
      </form>
    </Card>
  );
}
