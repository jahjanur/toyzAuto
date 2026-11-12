import type { Metadata } from "next";
import Link from "@/components/i18n/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/site/page-header";
import { RichText } from "@/components/site/rich-text";
import { InquiryForm } from "@/components/site/inquiry-form";
import { Reveal } from "@/components/ui/reveal";
import { getServiceBySlug, getServices } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { getI18n } from "@/i18n/server";
import { fmt } from "@/i18n/config";
import { localizeService } from "@/i18n/content";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, t } = await getI18n();
  const raw = await getServiceBySlug((await params).slug);
  if (!raw) return { title: t.services.fallbackTitle };
  const sv = localizeService(raw, locale);
  return { title: sv.title, description: sv.excerpt ?? undefined, alternates: { languages: { "en-CA": `/services/${sv.slug}`, "fr-CA": `/fr/services/${sv.slug}` } } };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const { locale, t } = await getI18n();
  const [raw, allRaw] = await Promise.all([getServiceBySlug(slug), getServices()]);
  if (!raw || !raw.published) notFound();
  const sv = localizeService(raw, locale);
  const all = allRaw.map((x) => localizeService(x, locale));
  return (
    <>
      <PageHeader eyebrow={t.services.atelier} title={sv.title} description={sv.excerpt ?? undefined} crumbs={[{ href: "/services", label: t.nav.services }]} image={sv.coverImage ? { src: sv.coverImage, prominent: true } : undefined} />
      <section className="container-x py-10 md:py-14">
        <div className="grid gap-12 lg:grid-cols-[1fr_300px]">
          <Reveal amount={0.05}>
            <RichText text={sv.body} className="max-w-2xl text-[15.5px]" />
            <div className="relative mt-14 overflow-hidden rounded-[26px] border border-line bg-surface p-6 md:p-10">
              <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-accent/15 blur-[100px]" />
              <p className="eyebrow mb-4">{t.services.getQuote}</p>
              <h2 className="display mb-5 text-[clamp(1.5rem,3.5vw,2.4rem)]">{t.services.makeItYours.replace(/\.$/, "")}<span className="text-accent">.</span></h2>
              <p className="mb-8 max-w-lg text-sm leading-relaxed text-muted">{fmt(t.services.quoteText, { service: sv.title.toLowerCase() })}</p>
              <InquiryForm type="service" meta={{ service: raw.title }} submitLabel={t.services.requestQuote} defaultMessage={fmt(t.services.quoteDefault, { service: sv.title.toLowerCase() })} compact />
            </div>
          </Reveal>
          <aside className="lg:sticky lg:top-[calc(var(--nav-h)+1.5rem)] lg:self-start">
            <p className="label">{t.services.allServices}</p>
            <ul className="border-t border-line">
              {all.map((x, i) => (
                <li key={x.id}>
                  <Link href={`/services/${x.slug}`} aria-current={x.slug === sv.slug ? "page" : undefined} className={cn("flex items-center gap-3 border-b border-line py-4 text-[13px] font-semibold uppercase tracking-[0.12em] transition-colors", x.slug === sv.slug ? "text-white" : "text-muted hover:text-white")}>
                    <span className={cn("font-mono text-[10px]", x.slug === sv.slug ? "text-accent" : "text-muted-2")}>0{i + 1}</span>{x.title}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
    </>
  );
}
