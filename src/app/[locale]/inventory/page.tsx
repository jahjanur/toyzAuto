import type { Metadata } from "next";
import Link from "@/components/i18n/link";
import { Suspense } from "react";
import { InventoryToolbar } from "@/components/site/inventory-filters";
import { VehicleCard } from "@/components/site/vehicle-card";
import { PageHeader } from "@/components/site/page-header";
import { Stagger, Item } from "@/components/ui/reveal";
import { getBrandsWithCounts, getInventoryFacets, getVehicles, type InventoryFilters } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { MARQUES } from "@/components/site/brand-showcase";
import { cn } from "@/lib/utils";
import { getI18n } from "@/i18n/server";
import { fmt } from "@/i18n/config";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.inventory.metaTitle, description: t.inventory.metaDescription, alternates: { languages: { "en-CA": "/inventory", "fr-CA": "/fr/inventory" } } };
}

type SP = Record<string, string | string[] | undefined>;
const arr = (v: string | string[] | undefined) => (v === undefined ? undefined : Array.isArray(v) ? v : [v]);
const num = (v: string | string[] | undefined) => { const n = Number(Array.isArray(v) ? v[0] : v); return Number.isFinite(n) && n > 0 ? n : undefined; };

export default async function InventoryPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const { locale, t } = await getI18n();
  const filters: InventoryFilters = {
    q: typeof sp.q === "string" ? sp.q : undefined,
    brand: arr(sp.brand), condition: arr(sp.condition), body: arr(sp.body), fuel: arr(sp.fuel), transmission: arr(sp.transmission),
    minPrice: num(sp.minPrice), maxPrice: num(sp.maxPrice), minYear: num(sp.minYear), maxYear: num(sp.maxYear),
    sold: sp.sold === "1",
    sort: (typeof sp.sort === "string" ? sp.sort : "featured") as InventoryFilters["sort"],
  };
  const [vehicles, facets, brands, s] = await Promise.all([getVehicles(filters), getInventoryFacets(), getBrandsWithCounts(), getSettings(locale)]);
  const activeBrands = new Set(filters.brand ?? []);

  return (
    <>
      <PageHeader eyebrow={fmt(vehicles.length === 1 ? t.common.vehicleOne : t.common.vehicleMany, { n: vehicles.length })} title={t.inventory.title} compact>
        <div className="mt-6 -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden">
          {brands.filter((b) => b.count > 0).map((b) => (
            <Link key={b.slug} href={activeBrands.has(b.slug) ? "/inventory" : `/inventory?brand=${b.slug}`} className={cn("flex shrink-0 items-center gap-2.5 rounded-full border py-2 pl-2.5 pr-4 text-[12px] font-medium uppercase tracking-[0.12em] transition-colors", activeBrands.has(b.slug) ? "border-accent bg-accent text-white" : "border-line text-ink-2 hover:border-white/40 hover:text-white")}>
              {MARQUES.has(b.slug) ? (
                <span aria-hidden className="block size-5 bg-current" style={{ maskImage: `url(/brand/marques/${b.slug}.svg)`, WebkitMaskImage: `url(/brand/marques/${b.slug}.svg)`, maskSize: "contain", WebkitMaskSize: "contain", maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat", maskPosition: "center", WebkitMaskPosition: "center" }} />
              ) : <span aria-hidden className="ml-1 block size-1.5 rounded-full bg-accent" />}
              {b.name}
            </Link>
          ))}
        </div>
      </PageHeader>
      <section className="container-x pt-6 pb-24">
        <div className="grid gap-8 lg:grid-cols-[250px_1fr] lg:gap-12">
          <Suspense>
            <div><InventoryToolbar total={vehicles.length} facets={facets} brands={brands} /></div>
          </Suspense>
          <div className="min-w-0 lg:col-start-2">
            {vehicles.length ? (
              <Stagger key={JSON.stringify(filters)} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 md:gap-5" stagger={0.05}>
                {vehicles.map((v, i) => <Item key={v.id}><VehicleCard v={v} currency={s.currency} priority={i < 3} className="h-full" /></Item>)}
              </Stagger>
            ) : (
              <div className="rounded-[20px] border border-dashed border-line-2 p-14 text-center">
                <p className="display text-2xl">{t.inventory.noMatch.replace(/\.$/, "")}<span className="text-accent">.</span></p>
                <p className="mt-3 text-sm text-muted">{t.inventory.noMatchText}</p>
                <div className="mt-6 flex justify-center gap-4 text-sm"><Link href="/inventory" className="text-accent-2 hover:text-white">{t.inventory.clearFilters}</Link><Link href="/contact" className="text-accent-2 hover:text-white">{t.inventory.requestCar}</Link></div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
