import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "../api";

export interface Me {
  user: { id: string; email: string; name: string; role: "agency_admin" | "client_owner"; tenantId: string | null };
  tenant?: { id: string; business_name: string; slug: string; status: string; features: string[]; channels: string[] };
}

const Ctx = createContext<{ me: Me | null; loading: boolean; refresh: () => Promise<Me | null>; logout: () => Promise<void> }>(null!);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const refresh = async () => {
    try {
      const m = await api<Me>("/api/auth/me", { quiet: true });
      setMe(m);
      return m;
    } catch {
      setMe(null);
      return null;
    } finally {
      setLoading(false);
    }
  };
  const logout = async () => {
    await api("/api/auth/logout", { method: "POST", quiet: true }).catch(() => {});
    setMe(null);
  };
  useEffect(() => { refresh(); }, []);
  return <Ctx.Provider value={{ me, loading, refresh, logout }}>{children}</Ctx.Provider>;
}

export const useSession = () => useContext(Ctx);
export const hasFeature = (me: Me | null, f: string) => !!me?.tenant?.features.includes(f);
