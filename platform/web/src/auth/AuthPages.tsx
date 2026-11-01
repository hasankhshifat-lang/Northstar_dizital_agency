import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { api, ApiError } from "../api";
import { useT } from "../i18n";
import { Button, ErrorText, Field, Input, LangSwitch } from "../ui";
import { useSession } from "./session";

function Shell({ title, children }: { title: string; children: ReactNode }) {
  const { t } = useT();
  return (
    <div className="flex min-h-full items-center justify-center bg-gradient-to-br from-[#14244f] to-brand-600 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-7 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-brand-600">★ {t("app_name")}</div>
            <h1 className="mt-1 text-xl font-semibold">{title}</h1>
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
