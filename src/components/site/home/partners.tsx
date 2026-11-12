import { PartnerGrid } from "@/components/site/partner-logos";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getI18n } from "@/i18n/server";

/** Partner brands, shown right after the services they power. */
export async function Partners() {
  const { t } = await getI18n();
  return (
    <section className="container-x pb-24 md:pb-36">
      <SectionHeading eyebrow={t.home.partnersEyebrow} title={t.home.partnersTitle} description={t.home.partnersText} />
      <Reveal className="mt-10 md:mt-14"><PartnerGrid row /></Reveal>
    </section>
  );
}
