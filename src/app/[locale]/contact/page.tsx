import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { InquiryForm } from "@/components/site/inquiry-form";
import { Reveal } from "@/components/ui/reveal";
import { getSettings } from "@/lib/settings";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.nav.contact, description: t.contact.metaDescription, alternates: { languages: { "en-CA": "/contact", "fr-CA": "/fr/contact" } } };
}

export default async function ContactPage() {
  const { locale, t } = await getI18n();
  const s = await getSettings(locale);
  return (
    <>
      <PageHeader eyebrow={t.contact.eyebrow} title={t.contact.title} description={t.contact.description} compact />
      <section className="container-x py-10 md:py-14">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div className="space-y-8">
            <Reveal className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
              <a href={s.mapUrl} target="_blank" rel="noreferrer" className="group bg-surface p-6 transition-colors hover:bg-surface-2"><MapPin className="size-5 text-accent" /><p className="label mt-4">{t.contact.showroom}</p><p className="text-sm text-ink-2">{s.addressLine1}<br />{s.addressLine2}</p><p className="mt-2 text-xs text-accent opacity-0 transition-opacity group-hover:opacity-100">{t.contact.openMaps}</p></a>
              <a href={`tel:${s.phone}`} className="bg-surface p-6 transition-colors hover:bg-surface-2"><Phone className="size-5 text-accent" /><p className="label mt-4">{t.contact.phone}</p><p className="text-sm text-ink-2">{s.phoneDisplay}</p></a>
              <div className="bg-surface p-6"><Mail className="size-5 text-accent" /><p className="label mt-4">{t.contact.email}</p><a href={`mailto:${s.email}`} className="block text-sm text-ink-2 hover:text-accent">{s.email}</a>{s.emailSecondary && <a href={`mailto:${s.emailSecondary}`} className="block text-sm text-ink-2 hover:text-accent">{s.emailSecondary}</a>}</div>
              <div className="bg-surface p-6"><Clock className="size-5 text-accent" /><p className="label mt-4">{t.contact.hours}</p>
                <ul className="space-y-1 text-[13px] text-ink-2">
                  {s.hours.map((h) => <li key={h.day} className="flex justify-between gap-4"><span>{t.days[h.day] ?? h.day}</span><span className={h.closed ? "text-muted" : ""}>{h.closed ? t.contact.closed : `${h.open} – ${h.close}`}</span></li>)}
                </ul>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">{s.hoursNote}</p>
              </div>
            </Reveal>
            {s.mapEmbedUrl && (
              <Reveal delay={0.1} className="overflow-hidden rounded-2xl border border-line">
                <iframe title={t.contact.map} src={s.mapEmbedUrl} className="h-72 w-full grayscale invert-[.9] contrast-[.95]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </Reveal>
            )}
          </div>
          <Reveal delay={0.05} className="relative overflow-hidden rounded-[26px] border border-line bg-surface p-6 md:p-10">
            <p className="eyebrow mb-3">{t.contact.message}</p>
            <h2 className="display mb-8 text-[clamp(1.5rem,3.5vw,2.4rem)]">{t.contact.help.replace(/\?$/, "")}<span className="text-accent">?</span></h2>
            <InquiryForm type="contact" submitLabel={t.contact.send} />
          </Reveal>
        </div>
      </section>
    </>
  );
}
