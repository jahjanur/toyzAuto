"use client";

import { createContext, useContext, useMemo } from "react";
import { en } from "./dictionaries/en";
import { fr } from "./dictionaries/fr";
import { intlLocale, localizeHref, type Locale } from "./config";

const Ctx = createContext<Locale>("en");

export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <Ctx.Provider value={locale}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const locale = useContext(Ctx);
  return useMemo(() => ({ locale, t: locale === "fr" ? fr : en, intl: intlLocale(locale), href: (p: string) => localizeHref(p, locale) }), [locale]);
}
