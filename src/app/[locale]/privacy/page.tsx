import type { Metadata } from "next";
import { PageHeader } from "@/components/site/page-header";
import { getSettings } from "@/lib/settings";
import { getI18n } from "@/i18n/server";
import { fmt } from "@/i18n/config";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.privacy.title, alternates: { languages: { "en-CA": "/privacy", "fr-CA": "/fr/privacy" } } };
}

export default async function PrivacyPage() {
  const { locale, t } = await getI18n();
  const s = await getSettings(locale);
  return (
    <>
      <PageHeader eyebrow={t.privacy.eyebrow} title={t.privacy.title} compact />
      <section className="container-x py-14">
        <div className="prose-dark max-w-3xl text-[15px]">
          <p>{fmt(t.privacy.intro, { brand: s.brandName })}</p>
          <h3>{t.privacy.collectTitle}</h3>
          <p>{t.privacy.collect}</p>
          <h3>{t.privacy.useTitle}</h3>
          <p>{t.privacy.use}</p>
          <h3>{t.privacy.retentionTitle}</h3>
          <p>{fmt(t.privacy.retention, { email: s.email })}</p>
          <h3>{t.privacy.contactTitle}</h3>
          <p>{s.brandName}, {s.addressLine1}, {s.addressLine2}. {s.phoneDisplay} · {s.email}</p>
        </div>
      </section>
    </>
  );
}
