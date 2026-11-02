import { useEffect, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import { api, ApiError } from "./api";
import { useT, type Lang } from "./i18n";
import { useTheme, type Theme } from "./theme";

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" | "ghost"; size?: "sm" | "md" };
export function Button({ variant = "primary", size = "md", className, ...p }: BtnProps) {
  const v = {
    primary: "bg-brand-600 text-white shadow-[0_6px_16px_-6px_rgb(91_69_224/0.6)] hover:bg-brand-700 disabled:bg-brand-600/50 disabled:shadow-none",
    secondary: "bg-white text-slate-800 shadow-soft ring-1 ring-slate-200/70 hover:bg-slate-50",
    danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-600/50",
    ghost: "text-slate-700 hover:bg-slate-100",
  }[variant];
  const s = size === "sm" ? "px-3 py-1.5 text-sm rounded-lg" : "px-4 py-2.5 rounded-xl";
  return <button className={cx("inline-flex items-center gap-1.5 font-medium transition disabled:cursor-not-allowed", v, s, className)} {...p} />;
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint && <span className="block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

const inputCls = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100";
export const Input = (p: InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={cx(inputCls, p.className)} />;
export const Textarea = (p: TextareaHTMLAttributes<HTMLTextAreaElement> & { ref?: React.Ref<HTMLTextAreaElement> }) => <textarea rows={3} {...p} className={cx(inputCls, p.className)} />;
export const Select = (p: SelectHTMLAttributes<HTMLSelectElement>) => <select {...p} className={cx(inputCls, "pr-8", p.className)} />;

export function Toggle({ checked, onChange, disabled, label }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; label?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled} onClick={() => onChange(!checked)}
      className={cx("relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition", checked ? "bg-brand-600" : "bg-slate-300", disabled && "opacity-50")}>
      <span className={cx("inline-block h-5 w-5 rounded-full bg-[#fff] shadow transition", checked ? "translate-x-5" : "translate-x-0.5")} />
    </button>
  );
}

export function Card({ title, actions, children, className }: { title?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cx("rounded-3xl bg-white p-5 shadow-soft ring-1 ring-slate-200/40 sm:p-6", className)}>
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function Badge({ tone = "slate", children }: { tone?: "slate" | "green" | "red" | "amber" | "blue" | "violet"; children: ReactNode }) {
  const t = {
    slate: "bg-slate-100 text-slate-700", green: "bg-emerald-100 text-emerald-800", red: "bg-red-100 text-red-700",
    amber: "bg-amber-100 text-amber-800", blue: "bg-brand-100 text-brand-700", violet: "bg-violet-100 text-violet-700",
  }[tone];
  return <span className={cx("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", t)}>{children}</span>;
}

export function Table({ head, children, empty }: { head: ReactNode[]; children: ReactNode; empty?: boolean }) {
  const { t } = useT();
  return (
    <div className="-mx-2 overflow-x-auto">
      <table className="w-full border-separate border-spacing-y-1 px-2 text-left text-sm">
        <thead className="text-xs text-slate-500">
          <tr>{head.map((h, i) => <th key={i} className="px-3 pb-2 font-medium">{h}</th>)}</tr>
        </thead>
        <tbody className="[&>tr]:transition [&>tr:hover]:bg-slate-50 [&>tr>td:first-child]:rounded-l-xl [&>tr>td:last-child]:rounded-r-xl">{children}</tbody>
      </table>
      {empty && <EmptyState />}
    </div>
  );

  function EmptyState() {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-slate-500">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-xl text-brand-600">✦</div>
        <p>{t("none_yet")}</p>
      </div>
    );
  }
}

export function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-lift" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="close">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ErrorText({ error }: { error: unknown }) {
  if (!error) return null;
  const issues: { message?: string }[] = error instanceof ApiError && Array.isArray(error.body?.issues) ? error.body.issues : [];
  // Field messages from the server are specific ("Facebook only shows…"); prefer them to the generic one.
  const specific = issues.map((i) => i.message).filter((m): m is string => !!m && !/^(Invalid|Required|Too|Expected)/.test(m));
  const msg = specific.length ? specific.join(" ") : error instanceof ApiError || error instanceof Error ? error.message : String(error);
  return <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{msg}</p>;
}

/** Coloured gradient tiles for icons, as in the reference stat cards. */
export const CHIP = {
  violet: "from-[#8b7bff] to-[#5b45e0]",
  pink: "from-[#ff8fd0] to-[#e5469b]",
  amber: "from-[#ffc46b] to-[#f28c28]",
  teal: "from-[#5ee0c8] to-[#159b8f]",
  blue: "from-[#7cc0ff] to-[#3b74f0]",
  red: "from-[#ff9a8b] to-[#e5484d]",
} as const;
export type ChipTone = keyof typeof CHIP;

export function IconChip({ icon: Icon, tone = "violet", size = "md" }: { icon: LucideIcon; tone?: ChipTone; size?: "sm" | "md" }) {
  const s = size === "sm" ? "h-9 w-9 rounded-xl" : "h-11 w-11 rounded-2xl";
  return (
    <span className={cx("grid shrink-0 place-items-center bg-gradient-to-br text-white shadow-[0_8px_16px_-8px_rgb(0_0_0/0.4)]", CHIP[tone], s)}>
      <Icon size={size === "sm" ? 17 : 20} strokeWidth={2.2} />
    </span>
  );
}

export function Stat({ label, value, tone, icon, chip = "violet", hint }: { label: string; value: ReactNode; tone?: string; icon?: LucideIcon; chip?: ChipTone; hint?: ReactNode }) {
  return (
    <div className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-soft ring-1 ring-slate-200/40">
      {icon && <IconChip icon={icon} tone={chip} />}
      <div className="min-w-0">
        <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
        <div className={cx("mt-1 text-2xl font-semibold leading-tight text-slate-900", tone)}>{value}</div>
        {hint && <div className="mt-0.5 text-xs text-slate-500">{hint}</div>}
      </div>
    </div>
  );
}

const AVATAR_TONES = ["bg-violet-100 text-violet-700", "bg-emerald-100 text-emerald-800", "bg-amber-100 text-amber-800", "bg-red-100 text-red-700", "bg-brand-100 text-brand-700"];
export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((w) => [...w][0] ?? "").join("").toUpperCase() || "?";
  const tone = AVATAR_TONES[[...name].reduce((a, ch) => a + ch.charCodeAt(0), 0) % AVATAR_TONES.length];
  const s = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-14 w-14 text-lg" }[size];
  return <span className={cx("grid shrink-0 place-items-center rounded-full font-semibold", tone, s)} aria-hidden>{initials}</span>;
}

export function Progress({ value, tone = "bg-brand-600" }: { value: number; tone?: string }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div className={cx("h-full rounded-full transition-all", tone)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

/** Donut chart: segments are drawn in order around the ring. */
export function Donut({ segments, center, size = 150 }: { segments: { value: number; color: string; label: string }[]; center?: ReactNode; size?: number }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const r = 42, c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="-rotate-90" width={size} height={size} role="img">
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="11" className="stroke-slate-100" />
        {total > 0 && segments.map((s) => {
          const len = (s.value / total) * c;
          const el = <circle key={s.label} cx="50" cy="50" r={r} fill="none" stroke={s.color} strokeWidth="11" strokeLinecap="round"
            strokeDasharray={`${Math.max(0, len - 2)} ${c}`} strokeDashoffset={-offset}><title>{`${s.label}: ${s.value}`}</title></circle>;
          offset += len;
          return el;
        })}
      </svg>
      {center && <div className="absolute inset-0 grid place-items-center text-center">{center}</div>}
    </div>
  );
}

/** Fetch JSON on mount / when deps change. */
export function useApi<T>(path: string | null, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!path) return;
    const ctl = new AbortController();
    setLoading(true);
    api<T>(path, { signal: ctl.signal })
      .then((d) => { setData(d); setError(null); })
      .catch((e) => { if (e.name !== "AbortError") setError(e); })
      .finally(() => setLoading(false));
    return () => ctl.abort();
  }, [path, tick, ...deps]);
  return { data, error, loading, reload: () => setTick((x) => x + 1), setData };
}

export function PageHeader({ title, actions, subtitle }: { title: string; actions?: ReactNode; subtitle?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        {subtitle && <div className="mb-1 text-sm font-medium text-brand-600">{subtitle}</div>}
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
      </div>
      {actions}
    </div>
  );
}

export function LangSwitch() {
  const { lang, setLang } = useT();
  return (
    <button onClick={() => setLang(lang === "bn" ? "en" : "bn")} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100">
      {lang === "bn" ? "English" : "বাংলা"}
    </button>
  );
}

export function CopyButton({ text }: { text: string }) {
  const { t } = useT();
  const [done, setDone] = useState(false);
  return (
    <Button variant="secondary" size="sm" onClick={async () => { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); }}>
      {done ? t("copied") : t("copy")}
    </Button>
  );
}

/** Two-option segmented control used for the sidebar settings (drawn on the violet frame). */
/** One control for every width: full labels on large screens, short ones when the sidebar is collapsed. */
function Segmented<T extends string>({ label, value, options, onChange }: {
  label: string; value: T; options: { value: T; label: string; short: string; testId: string }[]; onChange: (v: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label}>
      <div className="mb-1.5 hidden px-1 text-[11px] font-semibold uppercase tracking-wider text-white/60 lg:block">{label}</div>
      <div className="grid grid-cols-1 gap-1 rounded-xl bg-[#fff]/10 p-1 lg:grid-cols-2">
        {options.map((o) => {
          const on = o.value === value;
          return (
            <button key={o.value} type="button" role="radio" aria-checked={on} data-testid={o.testId} onClick={() => onChange(o.value)} title={o.label}
              className={cx("rounded-lg px-2 py-1.5 text-xs font-medium transition", on ? "bg-[#fff] text-[#3b2aa8] shadow-sm" : "text-white/80 hover:bg-[#fff]/10")}>
              <span className="hidden lg:inline">{o.label}</span><span className="lg:hidden">{o.short}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Language + theme toggles shown at the bottom of the left sidebar. */
export function SidebarToggles() {
  const { t, lang, setLang } = useT();
  const { theme, setTheme } = useTheme();
  return (
    <div className="space-y-3">
      <Segmented<Lang> label={t("language")} value={lang} onChange={setLang}
        options={[{ value: "en", label: "English", short: "EN", testId: "lang-en" }, { value: "bn", label: "বাংলা", short: "বাং", testId: "lang-bn" }]} />
      <Segmented<Theme> label={t("theme")} value={theme} onChange={setTheme}
        options={[{ value: "light", label: `☀ ${t("light")}`, short: "☀", testId: "theme-light" }, { value: "dark", label: `☾ ${t("dark")}`, short: "☾", testId: "theme-dark" }]} />
    </div>
  );
}
