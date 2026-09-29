import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { uiZh } from "./locales/ui";
import { reportZh } from "./locales/report";

export type Language = "en" | "zh";
export type Translate = (
  english: string,
  values?: Record<string, string | number>,
) => string;
const storageKey = "protocol-alpha-language";
const chinese = { ...uiZh, ...reportZh };
const LanguageContext = createContext<{
  language: Language;
  locale: string;
  setLanguage: (language: Language) => void;
  t: Translate;
} | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      return localStorage.getItem(storageKey) === "zh" ? "zh" : "en";
    } catch {
      return "en";
    }
  });
  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    try {
      localStorage.setItem(storageKey, language);
    } catch {
      // Language selection still works when browser storage is unavailable.
    }
  }, [language]);
  const value = useMemo(
    () => ({
      language,
      locale: language === "zh" ? "zh-CN" : "en-GB",
      setLanguage,
      t: ((english, values) => {
        const template =
          language === "zh" ? chinese[english] || english : english;
        return template.replace(/\{(\w+)\}/g, (match, key) =>
          String(values?.[key] ?? match),
        );
      }) as Translate,
    }),
    [language],
  );
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useI18n() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("LanguageProvider is required");
  return value;
}
