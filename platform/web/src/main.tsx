import { StrictMode, useEffect, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router";
import "./styles.css";
import { I18nProvider, useT } from "./i18n";
import { ThemeProvider } from "./theme";
import { SessionProvider, useSession } from "./auth/session";
import { BootstrapPage, LoginPage, PausedPage, SetupPage } from "./auth/AuthPages";
import { AdminLayout } from "./admin/AdminLayout";
import { ClientsPage } from "./admin/Clients";
import { ClientNewPage } from "./admin/ClientNew";
import { ClientDetailPage } from "./admin/ClientDetail";
import { ClientTrainPage } from "./admin/ClientTrain";
import { AuditPage, EngineJobsPage, PresetsPage } from "./admin/AdminMisc";
import { ClientLayout, FeatureGate } from "./client/ClientLayout";
import { clientRoutes } from "./client/clientRoutes";

function AuthEvents() {
  const nav = useNavigate();
  const { refresh } = useSession();
  useEffect(() => {
    const h = (e: Event) => {
      const code = (e as CustomEvent).detail;
      if (code === "ACCOUNT_SUSPENDED") nav("/paused", { replace: true });
      else if (code === "UNAUTHORIZED") refresh().then(() => nav("/login", { replace: true }));
    };
    window.addEventListener("ns:auth", h);
    return () => window.removeEventListener("ns:auth", h);
  }, [nav, refresh]);
  return null;
}

function RequireRole({ role, children }: { role: "agency_admin" | "client_owner"; children: ReactNode }) {
  const { me, loading } = useSession();
  const { t } = useT();
  if (loading) return <p className="p-6">{t("loading")}</p>;
  if (!me) return <Navigate to="/login" replace />;
  if (me.user.role !== role) return <Navigate to={me.user.role === "agency_admin" ? "/admin" : "/app"} replace />;
  return <>{children}</>;
}

function Home() {
  const { me, loading } = useSession();
  if (loading) return null;
  if (!me) return <Navigate to="/login" replace />;
  return <Navigate to={me.user.role === "agency_admin" ? "/admin" : "/app"} replace />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
    <I18nProvider>
      <SessionProvider>
        <BrowserRouter>
          <AuthEvents />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/setup/:token" element={<SetupPage />} />
            <Route path="/bootstrap" element={<BootstrapPage />} />
            <Route path="/paused" element={<PausedPage />} />
            <Route path="/admin" element={<RequireRole role="agency_admin"><AdminLayout /></RequireRole>}>
              <Route index element={<ClientsPage />} />
              <Route path="clients/new" element={<ClientNewPage />} />
              <Route path="clients/:id" element={<ClientDetailPage />} />
              <Route path="clients/:id/train" element={<ClientTrainPage />} />
              <Route path="presets" element={<PresetsPage />} />
              <Route path="audit" element={<AuditPage />} />
              <Route path="engine-jobs" element={<EngineJobsPage />} />
            </Route>
            <Route path="/app" element={<RequireRole role="client_owner"><ClientLayout /></RequireRole>}>
              {clientRoutes.map((r) => (
                <Route key={r.path} index={r.path === ""} path={r.path || undefined}
                  element={r.feature ? <FeatureGate feature={r.feature}>{r.element}</FeatureGate> : r.element} />
              ))}
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SessionProvider>
    </I18nProvider>
    </ThemeProvider>
  </StrictMode>,
);
