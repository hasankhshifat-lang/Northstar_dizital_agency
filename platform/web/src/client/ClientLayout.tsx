import type { ReactNode } from "react";
import { BarChart3, Bot, Home, Inbox, Megaphone, Package, ShoppingBag, Users } from "lucide-react";
import { useT } from "../i18n";
import { hasFeature, useSession } from "../auth/session";
import { useApi } from "../ui";
import { AppShell, SidebarCard, type NavItem } from "../shell/AppShell";

const NAV: (NavItem & { key: string; feature?: string })[] = [
  { to: "/app", key: "nav_home", label: "", icon: Home, end: true },
  { to: "/app/inbox", key: "f_inbox", label: "", icon: Inbox, feature: "inbox" },
  { to: "/app/agent", key: "f_ai_agent", label: "", icon: Bot, feature: "ai_agent" },
  { to: "/app/products", key: "nav_products", label: "", icon: Package, feature: "orders" },
  { to: "/app/orders", key: "nav_orders", label: "", icon: ShoppingBag, feature: "orders" },
  { to: "/app/customers", key: "nav_customers", label: "", icon: Users, feature: "orders" },
  { to: "/app/reports", key: "nav_reports", label: "", icon: BarChart3, feature: "orders" },
  { to: "/app/followups", key: "f_followups", label: "", icon: Megaphone, feature: "followups" },
];

export function ClientLayout() {
  const { t } = useT();
  const { me } = useSession();
  const home = useApi<{ alerts: Record<string, number> }>("/api/client/home");
  const alertCount = Object.values(home.data?.alerts ?? {}).filter((n) => n > 0).length;
  return (
    <AppShell
      brand={me?.tenant?.business_name ?? ""}
      subtitle="Northstar"
      searchTo={hasFeature(me, "orders") ? "/app/customers" : "/app/inbox"}
      searchPlaceholder={t("search_customers")}
      bell={{ to: "/app", count: alertCount }}
      nav={NAV.filter((n) => !n.feature || hasFeature(me, n.feature)).map((n) => ({ ...n, label: t(n.key) }))}
      helpCard={<SidebarCard title={t("help_title")} body={t("help_body")} />}
    />
  );
}

/** Wrap a page so it only renders when its feature is on (server also enforces). */
export function FeatureGate({ feature, children }: { feature: string; children: ReactNode }) {
  const { t } = useT();
  const { me } = useSession();
  if (!hasFeature(me, feature)) return <p className="rounded-2xl bg-amber-50 p-4 text-amber-900">{t("feature_off")}</p>;
  return <>{children}</>;
}
