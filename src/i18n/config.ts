/** Locale settings shared by server, client and proxy (no server-only imports here). */
export const LOCALES = ["en", "fr"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const isLocale = (x: string | undefined | null): x is Locale => !!x && (LOCALES as readonly string[]).includes(x);
export const intlLocale = (l: Locale) => (l === "fr" ? "fr-CA" : "en-CA");

/** Paths that are never localized (admin, APIs, uploaded/static files). */
const UNLOCALIZED = /^\/(admin|api|uploads|_next|media|vehicles|brand|services\/[^/]+\.\w+)(\/|$)|\.\w{2,5}($|\?)/;

/** Removes a leading /fr or /en from a pathname. */
export function stripLocale(pathname: string): { locale: Locale | null; path: string } {
  const m = /^\/(en|fr)(?=\/|$)/.exec(pathname);
  if (!m) return { locale: null, path: pathname || "/" };
  const rest = pathname.slice(m[0].length);
  return { locale: m[1] as Locale, path: rest === "" ? "/" : rest };
}

/** English lives at the root (/inventory); French under /fr (/fr/inventory). */
export function localizeHref(href: string, locale: Locale): string {
  if (!href.startsWith("/") || href.startsWith("//") || UNLOCALIZED.test(href)) return href;
  const [pathAndQuery, hash = ""] = href.split("#");
  const qIndex = pathAndQuery.indexOf("?");
  const path = qIndex === -1 ? pathAndQuery : pathAndQuery.slice(0, qIndex);
  const query = qIndex === -1 ? "" : pathAndQuery.slice(qIndex);
  const bare = stripLocale(path).path;
  const localized = locale === "en" ? bare : bare === "/" ? "/fr" : `/fr${bare}`;
  return `${localized}${query}${hash ? `#${hash}` : ""}`;
}

/** Fill {placeholders} in a dictionary string. */
export function fmt(str: string, vars: Record<string, string | number>): string {
  return str.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}
