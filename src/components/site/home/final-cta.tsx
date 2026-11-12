import { Phone } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { SplitWords, Reveal } from "@/components/ui/reveal";
import { getI18n } from "@/i18n/server";

export async function FinalCta({ phone, phoneDisplay }: { phone: string; phoneDisplay: string }) {
  const { t } = await getI18n();
  return (
    <section className="relative overflow-hidden py-28 md:py-44">
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[60vw] max-h-[700px] max-w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/15 blur-[140px]" />
      <div className="container-x relative text-center">
        <Reveal><p className="eyebrow mb-6 flex items-center justify-center gap-3"><span className="inline-block h-[2px] w-6 bg-accent" />{t.home.conciergeEyebrow}<span className="inline-block h-[2px] w-6 bg-accent" /></p></Reveal>
        <h2 className="display text-[clamp(2.4rem,9vw,8rem)]"><SplitWords text={t.home.conciergeTitle} inView /></h2>
        <Reveal delay={0.2} className="mt-10 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/contact" size="lg" arrow>{t.home.conciergeCta}</ButtonLink>
          <ButtonLink href={`tel:${phone}`} size="lg" variant="ghost"><Phone className="size-3.5" />{phoneDisplay}</ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
