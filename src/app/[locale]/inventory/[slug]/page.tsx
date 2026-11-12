import type { Metadata } from "next";
import Link from "@/components/i18n/link";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { ArrowLeft, Phone, MessageCircle } from "lucide-react";
import { Gallery } from "@/components/site/gallery";
import { InquiryForm } from "@/components/site/inquiry-form";
import { RichText } from "@/components/site/rich-text";
import { VehicleCard } from "@/components/site/vehicle-card";
import { ShareButton } from "@/components/site/share-button";
import { Collapsible } from "@/components/site/collapsible";
import { MobileCtaBar } from "@/components/site/mobile-cta-bar";
import { KeySpecs, DetailSpecs, type SpecItem } from "@/components/site/vehicle-specs";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Reveal, Stagger, Item, SplitWords } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { bumpVehicleViews, getRelatedVehicles, getVehicleBySlug } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { pickLandscape } from "@/lib/images";
import { MARQUES, marqueMask } from "@/lib/marques";
import { formatKm, formatNumber, formatPrice, cn } from "@/lib/utils";
import { getI18n } from "@/i18n/server";
import { fmt } from "@/i18n/config";
import { driveLabel, localizeVehicle, tv } from "@/i18n/content";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { locale, t } = await getI18n();
  const raw = await getVehicleBySlug(slug);
  if (!raw) return { title: t.vehicle.notFound };
  const v = localizeVehicle(raw, locale);
  return {
    title: v.title, description: v.summary ?? undefined,
    alternates: { languages: { "en-CA": `/inventory/${v.slug}`, "fr-CA": `/fr/inventory/${v.slug}` } },
    openGraph: { title: v.title, description: v.summary ?? undefined, images: v.images.length ? [{ url: pickLandscape(v.images)!.url }] : undefined },
  };
}

export default async function VehiclePage({ params }: Props) {
  const { slug } = await params;
  const { locale, t, intl } = await getI18n();
  const [raw, s] = await Promise.all([getVehicleBySlug(slug), getSettings(locale)]);
  if (!raw) notFound();
  const v = localizeVehicle(raw, locale);
  after(() => bumpVehicleViews(v.id));
  const related = await getRelatedVehicles(v, 3);
  const sold = v.status === "sold";
  const price = v.priceOnRequest ? t.common.priceOnRequest : formatPrice(v.priceCents, s.currency, intl);

  const keySpecs: SpecItem[] = (
    [
      { kind: "odometer", label: t.vehicle.kilometres, value: v.mileageKm !== null && v.mileageKm !== undefined ? formatKm(v.mileageKm, intl) : "" },
      { kind: "condition", label: t.vehicle.condition, value: tv(t, "condition", v.condition) },
      { kind: "body", label: t.vehicle.bodyStyle, value: tv(t, "body", v.bodyStyle) },
      { kind: "drivetrain", label: t.vehicle.drivetrain, value: v.drivetrain ?? "", note: driveLabel(t, v.drivetrain) },
      { kind: "transmission", label: t.vehicle.transmission, value: tv(t, "transmission", v.transmission) },
      { kind: "fuel", label: t.vehicle.fuelType, value: tv(t, "fuel", v.fuelType) },
    ] as SpecItem[]
  ).filter((x) => x.value);
  const detailSpecs: SpecItem[] = (
    [
      { kind: "year", label: t.vehicle.year, value: String(v.year) },
      { kind: "power", label: t.vehicle.power, value: v.horsepower ? fmt(t.vehicle.hp, { n: formatNumber(v.horsepower, intl) }) : "" },
      { kind: "engine", label: t.vehicle.engine, value: v.engine ?? "" },
      { kind: "exterior", label: t.vehicle.exterior, value: v.exteriorColor ?? "" },
      { kind: "interior", label: t.vehicle.interior, value: v.interiorColor ?? "" },
      { kind: "stock", label: t.vehicle.stock, value: v.stockNumber ?? "" },
    ] as SpecItem[]
  ).filter((x) => x.value);

  const quickFacts = [
    { k: t.vehicle.year, v: String(v.year) },
    { k: t.vehicle.kilometres, v: v.mileageKm !== null && v.mileageKm !== undefined ? formatKm(v.mileageKm, intl) : "" },
    { k: t.vehicle.transmission, v: tv(t, "transmission", v.transmission) },
    v.horsepower ? { k: t.vehicle.power, v: fmt(t.vehicle.hp, { n: formatNumber(v.horsepower, intl) }) } : { k: t.vehicle.fuelType, v: tv(t, "fuel", v.fuelType) },
  ].filter((f) => f.v);

  const jsonLd = {
    "@context": "https://schema.org", "@type": "Car", name: v.title, brand: v.brand?.name, model: v.model, vehicleModelDate: v.year,
    mileageFromOdometer: v.mileageKm ? { "@type": "QuantitativeValue", value: v.mileageKm, unitCode: "KMT" } : undefined,
    image: v.images.map((i) => i.url), description: v.summary,
    offers: v.priceOnRequest ? undefined : { "@type": "Offer", priceCurrency: s.currency, price: v.priceCents / 100, availability: sold ? "https://schema.org/SoldOut" : "https://schema.org/InStock" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="container-x pt-[calc(var(--nav-h)+1rem)]">
        <div className="mb-4 flex items-center justify-between gap-4">
          <Link href="/inventory" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted hover:text-white"><ArrowLeft className="size-3.5" /> {t.vehicle.back}</Link>
          <ShareButton title={v.title} />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-7 xl:grid-cols-[minmax(0,1fr)_420px]">
          <Reveal amount={0.05} className="min-w-0"><Gallery images={v.images} title={v.title} /></Reveal>

          <aside className="min-w-0 lg:sticky lg:top-[calc(var(--nav-h)+1rem)] lg:self-start">
            <div className="flex flex-col gap-5 rounded-[20px] border border-line bg-surface p-5 shadow-card md:p-6">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2.5">
                  {v.brand && MARQUES.has(v.brand.slug) && <span aria-hidden className="block size-6 bg-white" style={marqueMask(v.brand.slug)} />}
                  <span className="eyebrow">{v.brand?.name ?? ""} · {v.year}</span>
                  {v.status !== "available" && <Badge tone={v.status}>{t.status[v.status]}</Badge>}
                  {v.condition === "New" && <Badge tone="accent">{t.common.newBadge}</Badge>}
                </div>
                <h1 className="display text-[clamp(1.7rem,3.2vw,2.6rem)]"><SplitWords text={v.model} /></h1>
              </div>

              <div className="flex items-end justify-between gap-4 border-t border-line pt-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">{t.common.price}</p>
                  <p className={cn("mt-1 text-[1.75rem] font-semibold leading-none tracking-tight", sold && "text-muted line-through")}>{v.priceOnRequest ? <span className="text-accent-2 text-[1.35rem]">{t.common.priceOnRequest}</span> : price}</p>
                </div>
                {!v.priceOnRequest && <p className="pb-0.5 text-right text-[11.5px] text-muted">{fmt(t.common.plusTaxes, { currency: s.currency })}</p>}
              </div>

              <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line text-[13px]">
                {quickFacts.map((f) => (
                  <div key={f.k} className="bg-bg-2 px-3.5 py-3">
                    <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted">{f.k}</dt>
                    <dd className="mt-1 truncate font-medium text-white">{f.v}</dd>
                  </div>
                ))}
              </dl>

              <div className="grid gap-2.5">
                <ButtonLink href="#inquire" size="lg" arrow>{sold ? t.vehicle.findSimilar : t.vehicle.inquire}</ButtonLink>
                <div className={cn("grid gap-2.5", s.whatsapp && "grid-cols-2")}>
                  <ButtonLink href={`tel:${s.phone}`} size="lg" variant="ghost"><Phone className="size-3.5" /> {s.whatsapp ? t.nav.call : s.phoneDisplay}</ButtonLink>
                  {s.whatsapp && <ButtonLink href={`https://wa.me/${s.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(fmt(t.vehicle.inquiryDefault, { title: v.title }))}`} size="lg" variant="subtle"><MessageCircle className="size-4" /> WhatsApp</ButtonLink>}
                </div>
              </div>
              <p className="-mt-2 text-[11.5px] leading-relaxed text-muted">{s.hoursNote} · {s.addressLine1}</p>
            </div>
          </aside>
        </div>

        <div className="mt-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <p className="eyebrow flex items-center gap-3"><span className="inline-block h-[2px] w-6 bg-accent" />{t.vehicle.specifications}</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">{v.year} · {v.brand?.name}</p>
          </div>
          <KeySpecs items={keySpecs} drive={v.drivetrain} fuel={v.fuelType} />
        </div>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-7 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="min-w-0">
            {v.highlights.length > 0 && (
              <Reveal className="mb-10">
                <p className="eyebrow mb-5">{t.vehicle.highlights}</p>
                <ul className="flex flex-wrap gap-2">{v.highlights.map((h) => <li key={h} className="rounded-full border border-line px-4 py-2 text-[13px] text-ink-2">{h}</li>)}</ul>
              </Reveal>
            )}
            <Reveal amount={0.05}>
              <p className="eyebrow mb-5">{t.vehicle.about}</p>
              <Collapsible collapsedHeight={220}><RichText text={v.description} className="max-w-3xl" /></Collapsible>
            </Reveal>
          </div>
          {detailSpecs.length > 0 && (
            <div>
              <p className="eyebrow mb-5">{t.vehicle.details}</p>
              <DetailSpecs items={detailSpecs} single />
            </div>
          )}
        </div>
      </section>

      <section id="inquire" className="container-x scroll-mt-28 pt-20">
        <div className="relative grid gap-10 overflow-hidden rounded-[26px] border border-line bg-surface p-6 md:grid-cols-[1fr_1.2fr] md:p-12">
          <div className="pointer-events-none absolute -left-24 -top-24 size-80 rounded-full bg-accent/15 blur-[100px]" />
          <div className="relative">
            <p className="eyebrow mb-5">{t.vehicle.inquire}</p>
            <h2 className="display text-[clamp(1.9rem,4.5vw,3.4rem)]">{v.model}<span className="text-accent">.</span></h2>
            <p className="mt-5 max-w-sm text-[15px] text-muted">{t.vehicle.inquireText}</p>
          </div>
          <InquiryForm type="vehicle" vehicleId={v.id} vehicleTitle={v.title} defaultMessage={fmt(t.vehicle.inquiryDefault, { title: v.title })} submitLabel={t.vehicle.sendInquiry} />
        </div>
      </section>

      {related.length > 0 && (
        <section className="container-x pt-20 pb-28 lg:pb-10">
          <SectionHeading eyebrow={t.vehicle.youMayLike} title={t.vehicle.similarCars} action={<ButtonLink href="/inventory" variant="ghost" arrow>{t.vehicle.allInventory}</ButtonLink>} />
          <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5">
            {related.map((r) => <Item key={r.id}><VehicleCard v={r} currency={s.currency} className="h-full" /></Item>)}
          </Stagger>
        </section>
      )}
      <MobileCtaBar price={price} phone={s.phone} />
    </>
  );
}
