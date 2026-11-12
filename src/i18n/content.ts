import type { Dictionary } from "./dictionaries/en";
import type { Locale } from "./config";

type ValueKind = "condition" | "body" | "transmission" | "fuel";

/** Translates a stored spec value (e.g. "Convertible") for display; unknown values pass through. */
export function tv(t: Dictionary, kind: ValueKind, value?: string | null): string {
  if (!value) return "";
  return t.values[kind][value] ?? value;
}

export const driveLabel = (t: Dictionary, code?: string | null) => (code ? t.values.drive[code.toUpperCase()] : undefined);

type VehicleText = { summary: string | null; description: string | null; highlights: string[]; summaryFr?: string | null; descriptionFr?: string | null; highlightsFr?: string[] | null };

/** Swap in French copy when available (falls back to English per field). */
export function localizeVehicle<V extends VehicleText>(v: V, locale: Locale): V {
  if (locale !== "fr") return v;
  return {
    ...v,
    summary: v.summaryFr || v.summary,
    description: v.descriptionFr || v.description,
    highlights: v.highlightsFr && v.highlightsFr.length ? v.highlightsFr : v.highlights,
  };
}

type ServiceText = { title: string; excerpt: string | null; body: string | null; titleFr?: string | null; excerptFr?: string | null; bodyFr?: string | null };

export function localizeService<S extends ServiceText>(s: S, locale: Locale): S {
  if (locale !== "fr") return s;
  return { ...s, title: s.titleFr || s.title, excerpt: s.excerptFr || s.excerpt, body: s.bodyFr || s.body };
}
