import { Hero } from "@/components/site/hero";
import { BrandShowcase } from "@/components/site/brand-showcase";
import { Statement, type StatementFeature } from "@/components/site/home/statement";
import { Collection } from "@/components/site/home/collection";
import { FeatureVideo } from "@/components/site/home/feature-video";
import { ServicesStack } from "@/components/site/home/services-stack";
import { Partners } from "@/components/site/home/partners";
import { FinalCta } from "@/components/site/home/final-cta";
import { getSettings } from "@/lib/settings";
import { getBrandsWithCounts, getServices, getVehicles } from "@/lib/queries";
import { isLandscape, pickLandscape } from "@/lib/images";
import { formatPrice } from "@/lib/utils";
import { getI18n } from "@/i18n/server";
import { localizeService } from "@/i18n/content";

export default async function HomePage() {
  const { locale, t, intl } = await getI18n();
  const [s, vehicles, servicesRaw, brands] = await Promise.all([getSettings(locale), getVehicles({}), getServices(), getBrandsWithCounts()]);
  const services = servicesRaw.map((x) => localizeService(x, locale));
  const featured = vehicles.filter((v) => v.featured);
  const rail = (featured.length >= 4 ? featured : vehicles).slice(0, 8);
  const newest = [...vehicles].sort((a, b) => +b.createdAt - +a.createdAt || a.sortOrder - b.sortOrder)[0];
  const liveBrands = brands.filter((b) => b.count > 0);
  // Showcase beside the statement: a featured car that has a portrait (tall) photo, plus a detail shot of it.
  const showcaseCar = featured.find((v) => v.images.some((i) => !isLandscape(i))) ?? vehicles.find((v) => v.images.some((i) => !isLandscape(i)));
  const showcaseMain = showcaseCar?.images.find((i) => !isLandscape(i));
  const showcaseDetail = showcaseCar?.images.filter((i) => i !== showcaseMain && !isLandscape(i))[1] ?? showcaseCar?.images.find((i) => i !== showcaseMain);
  const showcase: StatementFeature | null = showcaseCar && showcaseMain ? {
    title: showcaseCar.model, brand: showcaseCar.brand?.name, href: `/inventory/${showcaseCar.slug}`,
    price: showcaseCar.priceOnRequest ? t.common.priceOnRequest : formatPrice(showcaseCar.priceCents, s.currency, intl),
    main: showcaseMain, detail: showcaseDetail,
  } : null;
  const stats = [
    { value: String(vehicles.length), label: t.home.statCars },
    { value: String(liveBrands.length), label: t.home.statMarques },
    ...s.stats,
  ].slice(0, 4);

  return (
    <>
      <Hero
        video={s.heroVideo}
        eyebrow={s.heroEyebrow}
        headline={s.heroHeadline}
        subheadline={s.heroSubheadline}
        primary={s.heroPrimaryCta}
        secondary={s.heroSecondaryCta}
        spotlight={newest ? { title: newest.title, slug: newest.slug, image: pickLandscape(newest.images)?.url } : null}
      />
      <BrandShowcase brands={brands} />
      <Statement text={s.statement} stats={stats} feature={showcase} />
      <Collection vehicles={rail} currency={s.currency} total={vehicles.length} />
      <FeatureVideo
        video={s.featureVideo}
        eyebrow={s.featureEyebrow}
        title={s.featureTitle}
        text={s.featureText}
      />
      <ServicesStack services={services} />
      <Partners />
      <FinalCta phone={s.phone} phoneDisplay={s.phoneDisplay} />
    </>
  );
}
