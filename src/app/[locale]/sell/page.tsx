import type { Metadata } from "next";
import { PageHeader } from "@/components/site/page-header";
import { InquiryForm } from "@/components/site/inquiry-form";
import { Reveal, Stagger, Item } from "@/components/ui/reveal";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.sell.metaTitle, description: t.sell.metaDescription, alternates: { languages: { "en-CA": "/sell", "fr-CA": "/fr/sell" } } };
}

export default async function SellPage() {
  const { t } = await getI18n();
  return (
    <>
      <PageHeader eyebrow={t.sell.eyebrow} title={t.sell.title} description={t.sell.description} compact />
      <section className="container-x py-10 md:py-14">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
          <Stagger className="grid gap-px self-start overflow-hidden rounded-2xl border border-line bg-line">
            {[
              ["01", t.sell.sell, t.sell.sellText],
              ["02", t.sell.trade, t.sell.tradeText],
              ["03", t.sell.consign, t.sell.consignText],
            ].map(([n, title, d]) => <Item key={n} className="bg-surface p-6 md:p-8"><span className="font-mono text-[11px] text-accent-2">{n}</span><p className="display mt-3 text-2xl">{title}</p><p className="mt-2 text-[14px] text-muted">{d}</p></Item>)}
          </Stagger>
          <Reveal className="rounded-[26px] border border-line bg-surface p-6 md:p-10">
            <p className="eyebrow mb-3">{t.sell.valuation}</p>
            <h2 className="display mb-8 text-[clamp(1.5rem,3.5vw,2.4rem)]">{t.sell.yourVehicle.replace(/\.$/, "")}<span className="text-accent">.</span></h2>
            <InquiryForm type="sell" submitLabel={t.sell.request} defaultMessage={t.sell.template} />
          </Reveal>
        </div>
      </section>
    </>
  );
}
