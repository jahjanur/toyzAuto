import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/site/page-header";
import { PartnerGrid } from "@/components/site/partner-logos";
import { CountUp } from "@/components/site/home/statement";
import { Reveal, Stagger, Item } from "@/components/ui/reveal";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { getSettings } from "@/lib/settings";
import { getBrandsWithCounts, getVehicles } from "@/lib/queries";
import { pickLandscape } from "@/lib/images";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.nav.about, description: t.about.metaDescription, alternates: { languages: { "en-CA": "/about", "fr-CA": "/fr/about" } } };
}

export default async function AboutPage() {
  const { locale, t } = await getI18n();
  const [s, vehicles, brands] = await Promise.all([getSettings(locale), getVehicles({}), getBrandsWithCounts()]);
  const paras = s.aboutBody.split(/\n{2,}/);
  const photos = vehicles.slice(0, 5).map((v) => pickLandscape(v.images, 3)).filter((x): x is NonNullable<typeof x> => !!x);
  const stats = [
    { value: String(vehicles.length), label: t.home.statCars },
    { value: String(brands.filter((b) => b.count > 0).length), label: t.home.statMarques },
    ...s.stats,
  ].slice(0, 4);
  return (
    <>
      <PageHeader eyebrow={s.aboutTitle} title={t.about.title} image={{ src: "/media/hero-bugatti-poster.jpg" }} />
      <section className="container-x py-14 md:py-20">
        <div className="grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-6"><p className="display-soft text-[clamp(1.4rem,3vw,2.3rem)] leading-snug">{paras[0]}</p></Reveal>
          <div className="space-y-5 text-[15px] leading-relaxed text-muted lg:col-span-5 lg:col-start-8">
            {paras.slice(1).map((p, i) => <Reveal key={i} delay={0.05 * i}><p>{p}</p></Reveal>)}
            <Reveal delay={0.1}><ButtonLink href="/inventory" arrow>{t.about.cta}</ButtonLink></Reveal>
          </div>
        </div>
        <div className="mt-16 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-line pt-10 md:mt-24 md:grid-cols-4">
          {stats.map((st) => (
            <div key={st.label}><p className="display text-[clamp(2rem,5vw,3.6rem)]"><CountUp value={st.value} /></p><p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted">{st.label}</p></div>
          ))}
        </div>
      </section>
      {photos.length > 0 && (
        <section className="container-x pb-20 md:pb-28">
          <Stagger className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {photos.map((img, i) => (
              <Item key={img.id} className={i === 0 ? "col-span-2 row-span-2" : ""}>
                <div className="relative aspect-[4/3] h-full overflow-hidden rounded-2xl border border-line">
                  <Image src={img.url} alt={img.alt ?? ""} fill sizes="(max-width:768px) 50vw, 33vw" placeholder={img.blurDataUrl ? "blur" : "empty"} blurDataURL={img.blurDataUrl ?? undefined} className="object-cover transition-transform duration-[1.5s] hover:scale-105" />
                </div>
              </Item>
            ))}
          </Stagger>
        </section>
      )}
      <section className="container-x pb-24">
        <SectionHeading eyebrow={t.about.partnersEyebrow} title={t.about.partnersTitle} />
        <Reveal className="mt-10"><PartnerGrid /></Reveal>
      </section>
    </>
  );
}
