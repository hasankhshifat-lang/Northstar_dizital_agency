import { NavLink, Outlet, useNavigate } from "react-router";
import { useT } from "../i18n";
import { useSession } from "../auth/session";
import { LangSwitch, cx } from "../ui";

export function AdminLayout() {
  const { t } = useT();
  const { me, logout } = useSession();
  const nav = useNavigate();
  const link = ({ isActive }: { isActive: boolean }) => cx("block rounded-lg px-3 py-2 text-sm font-medium", isActive ? "bg-white/15 text-white" : "text-brand-100 hover:bg-white/10");
  return (
    <div className="flex min-h-full">
      <aside className="w-60 shrink-0 bg-brand-900 p-4 text-white">
        <div className="mb-6 px-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-brand-100">★ Northstar</div>
          <div className="text-lg font-semibold">{t("admin_panel")}</div>
        </div>
        <nav className="space-y-1">
          <NavLink to="/admin" end className={link}>{t("clients")}</NavLink>
          <NavLink to="/admin/clients/new" className={link}>{t("new_client")}</NavLink>
          <NavLink to="/admin/presets" className={link}>{t("plan_presets")}</NavLink>
          <NavLink to="/admin/audit" className={link}>{t("activity_log")}</NavLink>
          <NavLink to="/admin/engine-jobs" className={link}>{t("failed_jobs")}</NavLink>
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-end gap-3 border-b border-slate-200 bg-white px-6 py-3 text-sm">
          <span className="text-slate-600">{me?.user.name}</span>
          <LangSwitch />
          <button className="text-slate-600 hover:text-slate-900" onClick={async () => { await logout(); nav("/login"); }}>{t("logout")}</button>
        </header>
        <main className="flex-1 p-6"><Outlet /></main>
      </div>
    </div>
  );
}
