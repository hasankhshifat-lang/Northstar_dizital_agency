import { createContext, useContext, useState, type ReactNode } from "react";

export type Theme = "light" | "dark";
const KEY = "ns_theme";

/** Light is the default; the choice is remembered per browser. index.html applies it before first paint. */
export function currentTheme(): Theme {
  return localStorage.getItem(KEY) === "dark" ? "dark" : "light";
}

export function applyTheme(t: Theme) {
  document.documentElement.classList.toggle("dark", t === "dark");
}

const Ctx = createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({ theme: "light", setTheme: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setState] = useState<Theme>(currentTheme());
  const setTheme = (t: Theme) => {
    localStorage.setItem(KEY, t);
    applyTheme(t);
    setState(t);
  };
  return <Ctx.Provider value={{ theme, setTheme }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
