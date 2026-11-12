import { locale as rootLocale } from "next/root-params";
import { notFound } from "next/navigation";
import { en } from "./dictionaries/en";
import { fr } from "./dictionaries/fr";
import { intlLocale, isLocale, localizeHref, type Locale } from "./config";

/** Current locale from the [locale] root segment (server components only). */
export async function getLocale(): Promise<Locale> {
  const l = await rootLocale();
  if (!isLocale(l)) notFound();
  return l;
}

export async function getI18n() {
  const locale = await getLocale();
  const t = locale === "fr" ? fr : en;
  return { locale, t, intl: intlLocale(locale), href: (p: string) => localizeHref(p, locale) };
}
