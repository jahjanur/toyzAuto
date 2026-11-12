import { cache } from "react";
import { eq } from "drizzle-orm";
import { db, settings } from "@/db";

export type HeroVideo = { label?: string; src: string; srcMobile?: string; poster?: string };
export type OpeningHour = { day: string; open: string; close: string; closed?: boolean };

/** French versions of the editable marketing texts (English lives in the main fields). */
export type FrenchTexts = {
  tagline: string;
  heroEyebrow: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroPrimaryLabel: string;
  heroSecondaryLabel: string;
  statement: string;
  featureEyebrow: string;
  featureTitle: string;
  featureText: string;
  announcementText: string;
  hoursNote: string;
  statLabels: string[];
  aboutTitle: string;
  aboutBody: string;
  seoTitle: string;
  seoDescription: string;
  footerBlurb: string;
};

export type SiteSettings = {
  brandName: string;
  tagline: string;
  heroEyebrow: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroPrimaryCta: { label: string; href: string };
  heroSecondaryCta: { label: string; href: string };
  heroVideo: HeroVideo;
  statement: string;
  featureVideo: HeroVideo;
  featureEyebrow: string;
  featureTitle: string;
  featureText: string;
  announcement: { enabled: boolean; text: string; href: string };
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
  email: string;
  emailSecondary: string;
  addressLine1: string;
  addressLine2: string;
  mapUrl: string;
  mapEmbedUrl: string;
  hours: OpeningHour[];
  hoursNote: string;
  socials: { instagram: string; tiktok: string; youtube: string; x: string; linkedin: string; facebook: string };
  currency: string;
  locale: string;
  stats: { value: string; label: string }[];
  aboutTitle: string;
  aboutBody: string;
  partners: string[];
  seoTitle: string;
  seoDescription: string;
  footerBlurb: string;
  fr: FrenchTexts;
};

export const defaultSettings: SiteSettings = {
  brandName: "TOYZ autoart",
  tagline: "Where luxury meets performance",
  heroEyebrow: "Montréal · Sales · Leasing · Customization",
  heroHeadline: "Luxury meets\nperformance.",
  heroSubheadline: "Rare cars, sourced and personalized to perfection.",
  heroPrimaryCta: { label: "Explore inventory", href: "/inventory" },
  heroSecondaryCta: { label: "Our services", href: "/services" },
  heroVideo: { src: "/media/hero-bugatti-1080.mp4", srcMobile: "/media/hero-bugatti-720.mp4", poster: "/media/hero-bugatti-poster.jpg" },
  statement: "We source, protect and personalize the cars others only dream about.",
  featureVideo: { src: "/media/hero-wheels-1080.mp4", srcMobile: "/media/hero-wheels-720.mp4", poster: "/media/hero-wheels-poster.jpg" },
  featureEyebrow: "Wheel atelier",
  featureTitle: "Forged\nto order.",
  featureText: "HRE, Vossen and BRABUS forged wheels, specified for your chassis.",
  announcement: { enabled: false, text: "New arrival: 2026 Porsche 911 Targa 4S", href: "/inventory" },
  phone: "+15147313773",
  phoneDisplay: "+1 514-731-3773",
  whatsapp: "",
  email: "info@toyzautoart.com",
  emailSecondary: "max@toyzautoart.com",
  addressLine1: "4300 De la Côte-de-Liesse Rd",
  addressLine2: "Mount Royal, Québec H4N 2P8",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=4300+De+la+C%C3%B4te-de-Liesse+Rd+Mount+Royal+QC+H4N+2P8",
  mapEmbedUrl: "https://www.google.com/maps?q=4300+De+la+C%C3%B4te-de-Liesse+Rd,+Mount+Royal,+QC+H4N+2P8&output=embed",
  hours: [
    { day: "Monday", open: "09:00", close: "18:00" },
    { day: "Tuesday", open: "09:00", close: "18:00" },
    { day: "Wednesday", open: "09:00", close: "18:00" },
    { day: "Thursday", open: "09:00", close: "18:00" },
    { day: "Friday", open: "09:00", close: "18:00" },
    { day: "Saturday", open: "", close: "", closed: true },
    { day: "Sunday", open: "", close: "", closed: true },
  ],
  hoursNote: "By appointment only",
  socials: {
    instagram: "https://www.instagram.com/toyzautoart/",
    tiktok: "https://www.tiktok.com/@toyzautoartofficial",
    youtube: "https://www.youtube.com/channel/UCE7KWMxoky0hmAol2xtDfFA",
    x: "https://x.com/toyzautoart",
    linkedin: "https://www.linkedin.com/in/toyz-autoart-a057618/",
    facebook: "",
  },
  currency: "CAD",
  locale: "en-CA",
  stats: [{ value: "1,200", label: "HP · our wildest build" }],
  aboutTitle: "Who we are",
  aboutBody:
    "TOYZ autoart is Montréal's destination for high-end automotive sales, leasing and customization. We are an authorized Canadian distributor, personalizing luxury and sport vehicles with top-quality components.\n\nFrom aerodynamic packages and custom leather interiors to engine conversions and forged wheels from HRE, Vossen and BRABUS, every detail is tailored to its owner.",
  partners: ["HRE", "Vossen", "BRABUS", "Novitec", "XPEL", "Brembo", "KW", "Michelin"],
  seoTitle: "TOYZ autoart — Luxury & Performance Cars, Montréal",
  seoDescription:
    "Luxury and performance car sales, leasing and bespoke customization in Montréal. Porsche, Ferrari, Lamborghini, Rolls-Royce, Mercedes-AMG and 1-of-1 builds.",
  footerBlurb: "Luxury and performance cars, sourced and personalized in Montréal.",
  fr: {
    tagline: "Là où le luxe rencontre la performance",
    heroEyebrow: "Montréal · Vente · Location · Personnalisation",
    heroHeadline: "Luxe et\nperformance.",
    heroSubheadline: "Des voitures rares, sélectionnées et personnalisées à la perfection.",
    heroPrimaryLabel: "Explorer l'inventaire",
    heroSecondaryLabel: "Nos services",
    statement: "Nous trouvons, protégeons et personnalisons les voitures dont les autres ne font que rêver.",
    featureEyebrow: "Atelier de jantes",
    featureTitle: "Forgées\nsur mesure.",
    featureText: "Jantes forgées HRE, Vossen et BRABUS, spécifiées pour votre châssis.",
    announcementText: "Nouvel arrivage : Porsche 911 Targa 4S 2026",
    hoursNote: "Sur rendez-vous seulement",
    statLabels: ["ch · notre projet le plus fou"],
    aboutTitle: "Qui nous sommes",
    aboutBody:
      "TOYZ autoart est la référence montréalaise en vente, location et personnalisation automobile haut de gamme. Distributeur canadien autorisé, nous personnalisons des véhicules de luxe et sportifs avec des composants de première qualité.\n\nDes ensembles aérodynamiques et intérieurs en cuir sur mesure jusqu'aux conversions moteur et aux jantes forgées HRE, Vossen et BRABUS, chaque détail est pensé pour son propriétaire.",
    seoTitle: "TOYZ autoart — Voitures de luxe et de performance, Montréal",
    seoDescription:
      "Vente, location et personnalisation de voitures de luxe et de performance à Montréal. Porsche, Ferrari, Lamborghini, Rolls-Royce, Mercedes-AMG et projets uniques.",
    footerBlurb: "Voitures de luxe et de performance, sélectionnées et personnalisées à Montréal.",
  },
};

const KEY = "site";

function deepMerge<T>(base: T, patch: Partial<T> | undefined): T {
  if (!patch) return base;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(patch)) {
    const bv = out[k];
    if (v && typeof v === "object" && !Array.isArray(v) && bv && typeof bv === "object" && !Array.isArray(bv)) {
      out[k] = deepMerge(bv, v as Record<string, unknown>);
    } else if (v !== undefined) {
      out[k] = v;
    }
  }
  return out as T;
}

/** Raw settings (English fields + `fr` block), as edited in the admin. */
export const getRawSettings = cache(async (): Promise<SiteSettings> => {
  const row = db.select().from(settings).where(eq(settings.key, KEY)).get();
  return deepMerge(defaultSettings, (row?.value as Partial<SiteSettings>) ?? undefined);
});

/** Settings with marketing texts in the requested language (French falls back to English per field). */
export const getSettings = cache(async (locale: "en" | "fr" = "en"): Promise<SiteSettings> => {
  const s = await getRawSettings();
  if (locale !== "fr") return s;
  const f = s.fr;
  const pick = (fr: string | undefined, en: string) => (fr && fr.trim() ? fr : en);
  return {
    ...s,
    tagline: pick(f.tagline, s.tagline),
    heroEyebrow: pick(f.heroEyebrow, s.heroEyebrow),
    heroHeadline: pick(f.heroHeadline, s.heroHeadline),
    heroSubheadline: pick(f.heroSubheadline, s.heroSubheadline),
    heroPrimaryCta: { ...s.heroPrimaryCta, label: pick(f.heroPrimaryLabel, s.heroPrimaryCta.label) },
    heroSecondaryCta: { ...s.heroSecondaryCta, label: pick(f.heroSecondaryLabel, s.heroSecondaryCta.label) },
    statement: pick(f.statement, s.statement),
    featureEyebrow: pick(f.featureEyebrow, s.featureEyebrow),
    featureTitle: pick(f.featureTitle, s.featureTitle),
    featureText: pick(f.featureText, s.featureText),
    announcement: { ...s.announcement, text: pick(f.announcementText, s.announcement.text) },
    hoursNote: pick(f.hoursNote, s.hoursNote),
    stats: s.stats.map((st, i) => ({ ...st, label: pick(f.statLabels?.[i], st.label) })),
    aboutTitle: pick(f.aboutTitle, s.aboutTitle),
    aboutBody: pick(f.aboutBody, s.aboutBody),
    seoTitle: pick(f.seoTitle, s.seoTitle),
    seoDescription: pick(f.seoDescription, s.seoDescription),
    footerBlurb: pick(f.footerBlurb, s.footerBlurb),
  };
});

export function saveSettings(patch: Partial<SiteSettings>) {
  const row = db.select().from(settings).where(eq(settings.key, KEY)).get();
  const merged = deepMerge((row?.value as Partial<SiteSettings>) ?? {}, patch);
  db.insert(settings)
    .values({ key: KEY, value: merged, updatedAt: new Date() })
    .onConflictDoUpdate({ target: settings.key, set: { value: merged, updatedAt: new Date() } })
    .run();
}
