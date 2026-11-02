import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { api, ApiError } from "../api";
import { useT } from "../i18n";
import { Button, ErrorText, Field, Input, LangSwitch } from "../ui";
import { useSession } from "./session";

function Shell({ title, children }: { title: string; children: ReactNode }) {
  const { t } = useT();
  return (
    <div className="app-frame relative flex min-h-full items-center justify-center overflow-hidden p-4">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#fff]/10" />
      <div className="pointer-events-none absolute right-[12%] bottom-[12%] h-24 w-24 rotate-12 rounded-3xl bg-gradient-to-br from-[#ffc46b] to-[#f28c28] opacity-80" />
      <div className="pointer-events-none absolute top-[14%] right-[18%] h-16 w-16 rounded-full bg-gradient-to-br from-[#ff8fd0] to-[#e5469b] opacity-80" />
      <div className="pointer-events-none absolute bottom-[18%] left-[14%] h-12 w-12 rounded-2xl bg-[#5ee0c8] opacity-80" />
      <div className="relative w-full max-w-sm rounded-4xl bg-white p-8 shadow-lift">
        <div className="mb-7 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#fff] p-1.5 shadow-soft ring-1 ring-slate-200/70"><img src="/logo.png" alt="Northstar" className="h-full w-full object-contain" /></span>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-brand-600">{t("app_name")}</div>
              <h1 className="text-xl font-bold text-slate-900">{title}</h1>
            </div>
          </div>
          <LangSwitch />
        </div>
        {children}
      </div>
    </div>
  );
}

export function LoginPage() {
  const { t } = useT();
  const nav = useNavigate();
  const { refresh } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/api/auth/login", { json: { email, password }, quiet: true });
      const me = await refresh();
      nav(me?.user.role === "agency_admin" ? "/admin" : "/app", { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.code === "ACCOUNT_SUSPENDED") nav("/paused");
      else setError(err);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Shell title={t("login_title")}>
      <form onSubmit={submit} className="space-y-4">
        <Field label={t("email")}><Input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Field label={t("password")}><Input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
        <ErrorText error={error} />
        <Button type="submit" disabled={busy} className="w-full justify-center">{t("login_btn")}</Button>
      </form>
    </Shell>
  );
}

export function SetupPage() {
  const { t } = useT();
  const { token = "" } = useParams();
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api("/api/auth/setup", { json: { token, password }, quiet: true });
      setDone(true);
    } catch (err) {
      setError(err);
    }
  };
  return (
    <Shell title={t("setup_title")}>
      {done ? (
        <div className="space-y-4">
          <p className="rounded-lg bg-emerald-50 p-3 text-emerald-800">{t("setup_done")}</p>
          <Link to="/login"><Button className="w-full justify-center">{t("login_btn")}</Button></Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Field label={t("password")} hint={t("password_min")}><Input type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
          <ErrorText error={error} />
          <Button type="submit" className="w-full justify-center">{t("setup_btn")}</Button>
        </form>
      )}
    </Shell>
  );
}

export function BootstrapPage() {
  const { t } = useT();
  const nav = useNavigate();
  const { refresh } = useSession();
  const [f, setF] = useState({ token: "", name: "", email: "", password: "" });
  const [error, setError] = useState<unknown>(null);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api("/api/auth/bootstrap", { json: f, quiet: true });
      await refresh();
      nav("/admin", { replace: true });
    } catch (err) {
      setError(err);
    }
  };
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  return (
    <Shell title={t("bootstrap_title")}>
      <form onSubmit={submit} className="space-y-4">
        <Field label={t("bootstrap_token")}><Input required value={f.token} onChange={set("token")} /></Field>
        <Field label={t("name")}><Input required value={f.name} onChange={set("name")} /></Field>
        <Field label={t("email")}><Input type="email" required value={f.email} onChange={set("email")} /></Field>
        <Field label={t("password")} hint={t("password_min")}><Input type="password" minLength={8} required value={f.password} onChange={set("password")} /></Field>
        <ErrorText error={error} />
        <Button type="submit" className="w-full justify-center">{t("create_client").replace(/.*/, t("bootstrap_title"))}</Button>
      </form>
    </Shell>
  );
}

export function PausedPage() {
  const { t } = useT();
  return (
    <Shell title={t("paused_title")}>
      <div className="space-y-4">
        <p className="rounded-lg bg-amber-50 p-3 text-amber-900" data-testid="paused">{t("paused_body")}</p>
        <Link to="/login"><Button variant="secondary" className="w-full justify-center">{t("back_to_login")}</Button></Link>
      </div>
    </Shell>
  );
}
