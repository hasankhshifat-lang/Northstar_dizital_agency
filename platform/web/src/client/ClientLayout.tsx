import { NavLink, Outlet, useNavigate } from "react-router";
import { useT } from "../i18n";
import { hasFeature, useSession } from "../auth/session";
import { LangSwitch, cx } from "../ui";

export const CLIENT_NAV: { to: string; key: string; feature?: string; end?: boolean }[] = [
  { to: "/app", key: "nav_home", end: true },
  { to: "/app/inbox", key: "f_inbox", feature: "inbox" },
  { to: "/app/agent", key: "f_ai_agent", feature: "ai_agent" },
  { to: "/app/products", key: "nav_products", feature: "orders" },
  { to: "/app/orders", key: "nav_orders", feature: "orders" },
  { to: "/app/customers", key: "nav_customers", feature: "orders" },
  { to: "/app/reports", key: "nav_reports", feature: "orders" },
  { to: "/app/followups", key: "f_followups", feature: "followups" },
];

export function ClientLayout() {
  const { t } = useT();
  const { me, logout } = useSession();
  const nav = useNavigate();
  const link = ({ isActive }: { isActive: boolean }) => cx("block rounded-lg px-3 py-2 text-sm font-medium", isActive ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-slate-100");
  return (
    <div className="flex min-h-full">
      <aside className="w-56 shrink-0 border-r border-slate-200 bg-white p-4">
        <div className="mb-6 px-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-brand-600">★ Northstar</div>
          <div className="truncate text-lg font-semibold" title={me?.tenant?.business_name}>{me?.tenant?.business_name}</div>
        </div>
        <nav className="space-y-1">
          {CLIENT_NAV.filter((n) => !n.feature || hasFeature(me, n.feature)).map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={link}>{t(n.key)}</NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-end gap-3 border-b border-slate-200 bg-white px-6 py-3 text-sm">
          <span className="text-slate-600">{me?.user.name}</span>
          <LangSwitch />
          <button className="text-slate-600 hover:text-slate-900" onClick={async () => { await logout(); nav("/login"); }}>{t("logout")}</button>
        </header>
        <main className="min-w-0 flex-1 p-6"><Outlet /></main>
      </div>
    </div>
  );
}

/** Wrap a page so it only renders when its feature is on (server also enforces). */
export function FeatureGate({ feature, children }: { feature: string; children: React.ReactNode }) {
  const { t } = useT();
  const { me } = useSession();
  if (!hasFeature(me, feature)) return <p className="rounded-lg bg-amber-50 p-4 text-amber-900">{t("feature_off")}</p>;
  return <>{children}</>;
}
