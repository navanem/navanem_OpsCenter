"use client";

import { createContext, useContext } from "react";
import type { Dictionary } from "./dictionaries/en";
import { en } from "./dictionaries/en";
import type { Locale } from "./config";

interface I18nValue {
  dict: Dictionary;
  locale: Locale;
}

const I18nContext = createContext<I18nValue>({ dict: en, locale: "en" });

export function I18nProvider({ dict, locale, children }: { dict: Dictionary; locale: Locale; children: React.ReactNode }) {
  return <I18nContext.Provider value={{ dict, locale }}>{children}</I18nContext.Provider>;
}

// Client components: const t = useT(); t.nav.dashboard
export function useT(): Dictionary {
  return useContext(I18nContext).dict;
}

export function useLocale(): Locale {
  return useContext(I18nContext).locale;
}
