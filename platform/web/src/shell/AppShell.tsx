import { useState, type FormEvent, type ReactNode } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router";
import { Bell, LogOut, Search, Sparkles, type LucideIcon } from "lucide-react";
import { useT } from "../i18n";
import { useSession } from "../auth/session";
import { Avatar, SidebarToggles, cx } from "../ui";

export interface NavItem { to: string; label: string; icon: LucideIcon; end?: boolean }

/**
 * Layout after the reference designs: a violet frame holding the sidebar, and a large rounded content panel.
 * The active nav item is a panel-coloured tab that flows into the panel.
 */
export function AppShell({ brand, subtitle, nav, helpCard, searchTo, searchPlaceholder, bell }: {
  brand: string;
  subtitle: string;
  nav: NavItem[];
  helpCard?: ReactNode;
  /** Where the top search submits to, e.g. "/app/customers" → "/app/customers?q=…". */
  searchTo: string;
  searchPlaceholder: string;
  bell?: { to: string; count: number };
}) {
  const { t } = useT();
  const { me, logout } = useSession();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const firstName = me?.user.name.split(" ")[0] ?? "";
  const search = (e: FormEvent) => {
    e.preventDefault();
    navigate(`${searchTo}?q=${encodeURIComponent(q.trim())}`);
  };
  return (
    <div className="app-frame flex h-screen overflow-hidden p-2 sm:p-3">
      <aside className="flex w-[4.5rem] shrink-0 flex-col py-3 pl-2 text-white lg:w-60 lg:pl-3">
        <Link to={nav[0].to} className="mb-8 flex items-center gap-3 px-2">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#fff] p-1.5 shadow-lg"><img src="/logo.png" alt="Northstar" className="h-full w-full object-contain" /></span>
          <span className="hidden min-w-0 lg:block">
            <span className="block truncate text-base font-semibold leading-tight" title={brand}>{brand}</span>
            <span className="block truncate text-xs text-white/60">{subtitle}</span>
          </span>
        </Link>
        <nav className="space-y-1.5">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} title={n.label}
              className={({ isActive }) => cx(
                "flex items-center gap-3 rounded-l-2xl py-3 pl-4 pr-3 text-sm font-medium transition",
                isActive ? "nav-tab-active text-brand-700" : "mr-2 rounded-r-2xl text-white/75 hover:bg-[#fff]/10 hover:text-white lg:mr-3",
              )}>
              <n.icon size={19} strokeWidth={2} className="shrink-0" />
              <span className="hidden truncate lg:inline">{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto space-y-4 pr-2 pt-6 lg:pr-3">
          {helpCard && <div className="hidden lg:block">{helpCard}</div>}
          <SidebarToggles />
        </div>
      </aside>

      <div className="app-panel flex min-w-0 flex-1 flex-col overflow-hidden rounded-4xl">
        <header className="flex flex-wrap items-center gap-3 px-5 pb-2 pt-5 sm:px-8">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-brand-600">{t("welcome_back", { name: firstName })} 👋</div>
          </div>
          <form onSubmit={search} className="relative hidden md:block">
            <Search size={16} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={searchPlaceholder} aria-label={searchPlaceholder}
              className="w-64 rounded-full bg-white py-2.5 pr-4 pl-10 text-sm shadow-soft outline-none ring-1 ring-slate-200/60 transition focus:ring-4 focus:ring-brand-100" />
          </form>
          {bell && (
            <Link to={bell.to} className="relative grid h-10 w-10 place-items-center rounded-full bg-white text-slate-600 shadow-soft ring-1 ring-slate-200/60 hover:text-brand-600" aria-label={t("alerts")}>
              <Bell size={18} />
              {bell.count > 0 && <span className="absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-[#ef4c7a] px-1 text-[10px] font-bold text-white ring-2 ring-[var(--panel)]">{bell.count > 9 ? "9+" : bell.count}</span>}
            </Link>
          )}
          <div className="flex items-center gap-2 rounded-full bg-white py-1 pr-1.5 pl-1 shadow-soft ring-1 ring-slate-200/60">
            <Avatar name={me?.user.name ?? "?"} size="sm" />
            <span className="hidden max-w-32 truncate text-sm font-medium text-slate-800 sm:inline">{me?.user.name}</span>
            <button className="grid h-8 w-8 place-items-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900" title={t("logout")} aria-label={t("logout")}
              onClick={async () => { await logout(); navigate("/login"); }}>
              <LogOut size={16} />
            </button>
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto px-5 pt-3 pb-8 sm:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/** Sidebar promo/help card with a small illustration, after the reference "Support 24/7" card. */
export function SidebarCard({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#fff]/10 p-4 ring-1 ring-[#fff]/15">
      <div className="pointer-events-none absolute -top-6 -right-6 h-20 w-20 rounded-full bg-gradient-to-br from-[#ff8fd0] to-[#f28c28] opacity-80 blur-[2px]" />
      <div className="pointer-events-none absolute top-6 right-8 h-6 w-6 rotate-12 rounded-lg bg-[#5ee0c8]" />
      <Sparkles size={20} className="relative mb-2 text-[#ffd36b]" />
      <div className="relative text-sm font-semibold">{title}</div>
      <p className="relative mt-1 text-xs leading-relaxed text-white/70">{body}</p>
      {action && <div className="relative mt-3">{action}</div>}
    </div>
  );
}
