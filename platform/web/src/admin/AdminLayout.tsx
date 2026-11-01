import { Link } from "react-router";
import { AlertTriangle, History, Layers, UserPlus, Users } from "lucide-react";
import { useT } from "../i18n";
import { useApi } from "../ui";
import { AppShell, SidebarCard } from "../shell/AppShell";

export function AdminLayout() {
  const { t } = useT();
  const failed = useApi<{ jobs: unknown[] }>("/api/admin/engine-jobs?status=failed");
  return (
    <AppShell
      brand="Northstar"
      subtitle={t("admin_panel")}
      searchTo="/admin"
      searchPlaceholder={t("search_clients")}
      bell={{ to: "/admin/engine-jobs", count: failed.data?.jobs.length ?? 0 }}
      nav={[
        { to: "/admin", label: t("clients"), icon: Users, end: true },
        { to: "/admin/clients/new", label: t("new_client"), icon: UserPlus },
        { to: "/admin/presets", label: t("plan_presets"), icon: Layers },
        { to: "/admin/audit", label: t("activity_log"), icon: History },
        { to: "/admin/engine-jobs", label: t("failed_jobs"), icon: AlertTriangle },
      ]}
      helpCard={
        <SidebarCard title={t("grow_title")} body={t("grow_body")}
          action={<Link to="/admin/clients/new" className="inline-flex rounded-xl bg-[#fff] px-3 py-1.5 text-xs font-semibold text-[#4b36c9] hover:bg-[#fff]/90">+ {t("new_client")}</Link>} />
      }
    />
  );
}
