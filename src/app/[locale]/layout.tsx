import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { fontVars } from "../fonts";
import { Nav, type NavFeatured } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { Intro } from "@/components/site/intro";
import { getI18n } from "@/i18n/server";
import { SmoothScroll } from "@/components/ui/smooth-scroll";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { I18nProvider } from "@/i18n/client";
import { SoundProvider } from "@/components/sound/sound-provider";
import { CreditSignature } from "@/components/brand/credit-signature";
import { isLocale, LOCALES } from "@/i18n/config";
import { localizeService } from "@/i18n/content";
import { getSettings } from "@/lib/settings";
import { getBrandsWithCounts, getServices, getVehicles } from "@/lib/queries";
import { pickLandscape } from "@/lib/images";
import { formatPrice } from "@/lib/utils";
import { hoverSoundFor } from "@/lib/sounds";

export const dynamic = "force-dynamic";

export const viewport: Viewport = { themeColor: "#050505", width: "device-width", initialScale: 1, viewportFit: "cover" };

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const l = isLocale(locale) ? locale : "en";
  const s = await getSettings(l);
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: { default: s.seoTitle, template: "%s · TOYZ autoart" },
    description: s.seoDescription,
    icons: { icon: "/icon.svg" },
    authors: [{ name: "Zulbera", url: "https://zulbera.com" }],
    creator: "Zulbera",
    generator: "Zulbera",
    openGraph: { type: "website", siteName: "TOYZ autoart", locale: l === "fr" ? "fr_CA" : "en_CA", images: ["/media/hero-bugatti-poster.jpg"] },
  };
}

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function SiteLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const intl = locale === "fr" ? "fr-CA" : "en-CA";
  const { t } = await getI18n();
  const [s, servicesRaw, brands, vehicles] = await Promise.all([getSettings(locale), getServices(), getBrandsWithCounts(), getVehicles({})]);
  const services = servicesRaw.map((x) => localizeService(x, locale));
  const newest = [...vehicles].sort((a, b) => +b.createdAt - +a.createdAt || a.sortOrder - b.sortOrder)[0];
  const cover = newest ? pickLandscape(newest.images) : undefined;
  const featured: NavFeatured = newest
    ? {
        title: newest.title, model: newest.model, brand: newest.brand?.name, slug: newest.slug,
        image: cover?.url, blur: cover?.blurDataUrl ?? null,
        price: newest.priceOnRequest ? (locale === "fr" ? "Prix sur demande" : "Price on request") : formatPrice(newest.priceCents, s.currency, intl),
      }
    : null;

  return (
    <html lang={locale === "fr" ? "fr-CA" : "en-CA"} suppressHydrationWarning className={`${fontVars} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg text-ink">
        <I18nProvider locale={locale}>
          <SoundProvider>
          <CreditSignature />
          <Intro credit={t.footer.craftedShort} />
          <SmoothScroll />
          <ScrollProgress />
          <Nav
            phone={s.phone}
            phoneDisplay={s.phoneDisplay}
            instagram={s.socials.instagram}
            announcement={s.announcement}
            address={s.addressLine1}
            marques={brands.map((b) => ({ name: b.name, slug: b.slug, count: b.count, sound: hoverSoundFor(b) }))}
            featured={featured}
            services={services.map((x) => ({ title: x.title, slug: x.slug, excerpt: x.excerpt, coverImage: x.coverImage }))}
            totalVehicles={vehicles.length}
          />
          <main className="flex-1">{children}</main>
          <Footer s={s} services={services} />
          </SoundProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
