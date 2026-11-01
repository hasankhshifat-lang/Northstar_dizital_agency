import type { ReactNode } from "react";
import { ProductFormPage, ProductsPage } from "./commerce/Products";
import { OrderDetailPage, OrderNewPage, OrdersPage } from "./commerce/Orders";
import { CustomerDetailPage, CustomersPage } from "./commerce/Customers";
import { ReportsPage } from "./commerce/Reports";
import { HomePage } from "./Home";
import { InboxPage } from "./chat/Inbox";
import { AgentPage } from "./chat/Agent";

/** Client pages: path under /app ("" = index), element, required feature. */
export const clientRoutes: { path: string; element: ReactNode; feature?: string }[] = [
  { path: "", element: <HomePage /> },
  { path: "inbox", element: <InboxPage />, feature: "inbox" },
  { path: "inbox/:cid", element: <InboxPage />, feature: "inbox" },
  { path: "agent", element: <AgentPage />, feature: "ai_agent" },
  { path: "products", element: <ProductsPage />, feature: "orders" },
  { path: "products/:id", element: <ProductFormPage />, feature: "orders" },
  { path: "orders", element: <OrdersPage />, feature: "orders" },
  { path: "orders/new", element: <OrderNewPage />, feature: "orders" },
  { path: "orders/:id", element: <OrderDetailPage />, feature: "orders" },
  { path: "customers", element: <CustomersPage />, feature: "orders" },
  { path: "customers/:id", element: <CustomerDetailPage />, feature: "orders" },
  { path: "reports", element: <ReportsPage />, feature: "orders" },
];
