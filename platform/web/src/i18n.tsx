import { createContext, useContext, useState, type ReactNode } from "react";
import { STRINGS } from "./i18n/strings";

export type Lang = "bn" | "en";
const KEY = "ns_lang";

export function currentLang(): Lang {
  return localStorage.getItem(KEY) === "bn" ? "bn" : "en";
}

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: "en", setLang: () => {} });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(currentLang());
  const setLang = (l: Lang) => {
    localStorage.setItem(KEY, l);
    document.documentElement.lang = l;
    setLangState(l);
  };
  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

export type StringKey = keyof typeof STRINGS;

export function useT() {
  const { lang, setLang } = useContext(Ctx);
  const t = (key: StringKey | string, vars?: Record<string, string | number>) => {
    const entry = (STRINGS as Record<string, readonly [string, string]>)[key];
    let s = entry ? entry[lang === "bn" ? 0 : 1] : key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
    return s;
  };
  return { t, lang, setLang };
}
