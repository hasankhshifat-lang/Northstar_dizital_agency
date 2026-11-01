import type { ReactNode } from "react";
import { useT } from "../i18n";
import { useSession } from "../auth/session";
import { PageHeader } from "../ui";

function HomePlaceholder() {
  const { t } = useT();
  const { me } = useSession();
  return <PageHeader title={`${t("nav_home")} — ${me?.tenant?.business_name ?? ""}`} />;
}

/** Client pages: path under /app ("" = index), element, required feature. */
export const clientRoutes: { path: string; element: ReactNode; feature?: string }[] = [
  { path: "", element: <HomePlaceholder /> },
];
