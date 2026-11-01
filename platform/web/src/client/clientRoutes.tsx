import type { ReactNode } from "react";
import { useT } from "../i18n";
import { useSession } from "../auth/session";
import { PageHeader } from "../ui";
import { ProductFormPage, ProductsPage } from "./commerce/Products";
import { OrderDetailPage, OrderNewPage, OrdersPage } from "./commerce/Orders";
import { CustomerDetailPage, CustomersPage } from "./commerce/Customers";
import { ReportsPage } from "./commerce/Reports";

function HomePlaceholder() {
  const { t } = useT();
  const { me } = useSession();
  return <PageHeader title={`${t("nav_home")} — ${me?.tenant?.business_name ?? ""}`} />;
}

/** Client pages: path under /app ("" = index), element, required feature. */
export const clientRoutes: { path: string; element: ReactNode; feature?: string }[] = [
  { path: "", element: <HomePlaceholder /> },
  { path: "products", element: <ProductsPage />, feature: "orders" },
  { path: "products/:id", element: <ProductFormPage />, feature: "orders" },
  { path: "orders", element: <OrdersPage />, feature: "orders" },
  { path: "orders/new", element: <OrderNewPage />, feature: "orders" },
  { path: "orders/:id", element: <OrderDetailPage />, feature: "orders" },
  { path: "customers", element: <CustomersPage />, feature: "orders" },
  { path: "customers/:id", element: <CustomerDetailPage />, feature: "orders" },
  { path: "reports", element: <ReportsPage />, feature: "orders" },
];
