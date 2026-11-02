import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { api } from "../api";
import { useT } from "../i18n";
import { COUNTRY_CODES, toInternational } from "../countryCodes";
import { Button, Card, CopyButton, ErrorText, Field, Input, PageHeader, Select, useApi } from "../ui";

export function ClientNewPage() {
  const { t } = useT();
  const presets = useApi<{ presets: { label: string }[] }>("/api/admin/presets");
  const [f, setF] = useState({ business_name: "", owner_name: "", email: "", dial: "880", phone: "", plan_label: "" });
  const fullPhone = toInternational(f.dial, f.phone);
  const [result, setResult] = useState<{ client: { id: string; business_name: string }; setup_url: string } | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      setResult(await api("/api/admin/clients", { json: { business_name: f.business_name, owner_name: f.owner_name, email: f.email, phone: fullPhone || undefined, plan_label: f.plan_label || null } }));
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };
  if (result) {
    const msg = `${t("setup_link_msg")} ${result.setup_url}`;
    return (
      <>
        <PageHeader title={t("new_client")} />
        <Card className="max-w-2xl">
          <p className="mb-3 text-emerald-800">{t("client_created")}</p>
          <div className="flex items-center gap-2 rounded-lg bg-slate-100 p-3 font-mono text-sm break-all" data-testid="setup-url">{result.setup_url}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <CopyButton text={result.setup_url} />
            <a href={`https://wa.me/${fullPhone.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noreferrer"><Button variant="secondary" size="sm">{t("share_whatsapp")}</Button></a>
            <Link to={`/admin/clients/${result.client.id}`}><Button size="sm">{result.client.business_name} →</Button></Link>
          </div>
        </Card>
      </>
    );
  }
  return (
    <>
      <PageHeader title={t("new_client")} />
      <Card className="max-w-2xl">
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <Field label={t("business_name")}><Input required value={f.business_name} onChange={set("business_name")} name="business_name" /></Field>
          <Field label={t("owner_name")}><Input required value={f.owner_name} onChange={set("owner_name")} name="owner_name" /></Field>
          <Field label={t("email")}><Input type="email" required value={f.email} onChange={set("email")} name="email" /></Field>
          <Field label={t("phone")} hint={fullPhone || undefined}>
            <div className="flex gap-2">
              <div className="w-32 shrink-0">
                <Select aria-label={t("country_code")} value={f.dial} onChange={set("dial")} name="dial">
                  {COUNTRY_CODES.map((c) => <option key={c.code} value={c.dial} title={c.name}>{c.flag} +{c.dial}</option>)}
                </Select>
              </div>
              <Input value={f.phone} onChange={set("phone")} name="phone" type="tel" inputMode="tel" placeholder={f.dial === "880" ? "1XXXXXXXXX" : ""} />
            </div>
          </Field>
          <Field label={t("plan")}>
            <Select value={f.plan_label} onChange={set("plan_label")}>
              <option value="">{t("plan_none")}</option>
              {presets.data?.presets.map((p) => <option key={p.label} value={p.label}>{p.label}</option>)}
            </Select>
          </Field>
          <div className="sm:col-span-2 space-y-3">
            <ErrorText error={error} />
            <Button type="submit" disabled={busy}>{t("create_client")}</Button>
          </div>
        </form>
      </Card>
    </>
  );
}
