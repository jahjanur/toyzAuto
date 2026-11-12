import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/i18n/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import type { Service } from "@/db/schema";
import { InquiryForm } from "@/components/site/inquiry-form";
import { ButtonLink } from "@/components/ui/button";
import { SplitWords } from "@/components/ui/reveal";
import { getServices } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { Headline } from "@/components/ui/headline";
import { FitText } from "@/components/ui/fit";
import styles from "./services.module.css";
import { getI18n } from "@/i18n/server";
import { fmt } from "@/i18n/config";
import { localizeService } from "@/i18n/content";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.nav.services, description: t.services.metaDescription, alternates: { languages: { "en-CA": "/services", "fr-CA": "/fr/services" } } };
}

export default async function ServicesPage() {
  const { locale, t } = await getI18n();
  const services = (await getServices()).map((x) => localizeService(x, locale));
  return (
    <>
      <section className={cn("container-x", styles.intro)} aria-labelledby="services-title">
        <div>
          <p className={cn("eyebrow", styles.kicker)}><span />{t.services.kicker}</p>
          <h1 id="services-title" className={cn("display", styles.headline)}>
            <SplitWords text={t.services.title} />
          </h1>
        </div>
        <div className={styles.introAside}>
          <p className={styles.introCopy}>{t.services.introLine1}<br />{t.services.introLine2}</p>
          <p className={styles.introDetail}>{t.services.introDetail}</p>
          <ButtonLink href="#service-inquiry" variant="ghost" arrow>{t.services.discuss}</ButtonLink>
        </div>
      </section>

      {services.length > 0 && (
        <section id="services-collection" className={cn("container-x", styles.collection)} aria-labelledby="expertise-title">
          <div className={styles.collectionHeading}>
            <h2 id="expertise-title">{t.services.explore}</h2>
            <span>{fmt(t.services.count, { n: String(services.length).padStart(2, "0") })} <ArrowDown aria-hidden="true" /></span>
          </div>
          <div className={styles.gallery}>
            {services.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} lastWide={services.length % 2 === 1 && index === services.length - 1} discover={t.common.discover} />
            ))}
          </div>
          <p className={styles.collectionNote}><span aria-hidden="true" />{t.services.note}</p>
        </section>
      )}

      <section id="service-inquiry" className={cn("container-x", styles.inquiry)} aria-labelledby="inquiry-title">
        <div className={styles.inquiryLayout}>
          <div className={styles.inquiryIntro}>
            <p className="eyebrow">{t.services.startConversation}</p>
            <h2 id="inquiry-title" className={cn("display", styles.inquiryTitle)}><Headline text={t.services.inquiryTitle} /></h2>
            <p>{t.services.inquiryText}</p>
            <a href="#services-collection" className={styles.backLink}>{t.services.findService} <ArrowUpRight aria-hidden="true" /></a>
          </div>
          <div className={styles.formPanel}>
            <div className={styles.formHeading}>
              <span className="eyebrow">{t.services.nextChapter}</span>
              <p>{t.services.personalQuote}</p>
            </div>
            <InquiryForm type="service" submitLabel={t.services.requestQuote} />
          </div>
        </div>
      </section>
    </>
  );
}

function ServiceCard({ service, index, lastWide, discover }: { service: Service; index: number; lastWide: boolean; discover: string }) {
  const featured = index < 2;
  const titleId = `service-title-${service.id}`;
  return (
    <article className={cn(styles.card, index === 0 && styles.primary, index === 1 && styles.secondary, lastWide && styles.lastWide)}>
      <Link href={`/services/${service.slug}`} className={styles.cardLink} aria-labelledby={titleId}>
        <div className={styles.cardMedia}>
          {service.coverImage && (
            <Image
              src={service.coverImage}
              alt=""
              fill
              loading={featured ? "eager" : "lazy"}
              sizes={index === 0 ? "(min-width:1536px) 815px, (min-width:1100px) 55vw, (min-width:700px) 50vw, 100vw" : index === 1 ? "(min-width:1536px) 580px, (min-width:1100px) 40vw, (min-width:700px) 50vw, 100vw" : "(min-width:1536px) 460px, (min-width:1100px) 33vw, (min-width:700px) 50vw, 100vw"}
              className={cn(styles.cardImage, service.slug === "vehicle-customization" && styles.interiorImage)}
            />
          )}
          <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
          <span className={styles.imageCta}>{discover} <ArrowUpRight aria-hidden="true" /></span>
        </div>
        <div className={styles.cardBody}>
          <h3 id={titleId} className={cn("display", styles.cardTitle)}><FitText text={service.title} /></h3>
          <span className={styles.cardArrow}><ArrowUpRight aria-hidden="true" /></span>
          <p>{service.excerpt}</p>
        </div>
      </Link>
    </article>
  );
}
