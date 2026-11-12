"use client";

import Image from "next/image";
import Link from "@/components/i18n/link";
import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import type { Service } from "@/db/schema";
import { SectionHeading } from "@/components/ui/section-heading";
import { useI18n } from "@/i18n/client";
import { FitText } from "@/components/ui/fit";

/** Sticky cards that stack and recede as you scroll — reads beautifully on phones. */
export function ServicesStack({ services }: { services: Service[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useI18n();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  if (!services.length) return null;
  return (
    <section className="relative py-24 md:py-36">
      <div className="container-x">
        <SectionHeading eyebrow={t.home.whatWeDo} title={t.home.servicesTitle} action={<Link href="/services" className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted hover:text-white">{t.home.allServices}</Link>} />
      </div>
      <div ref={ref} className="container-x mt-12 md:mt-16">
        {services.map((s, i) => (
          <Card key={s.id} s={s} i={i} n={services.length} progress={scrollYProgress} />
        ))}
      </div>
    </section>
  );
}

function Card({ s, i, n, progress }: { s: Service; i: number; n: number; progress: MotionValue<number> }) {
  const target = 1 - (n - 1 - i) * 0.04;
  const scale = useTransform(progress, [i / n, 1], [1, target]);
  const dim = useTransform(progress, [i / n, Math.min(1, (i + 1) / n)], [0, i === n - 1 ? 0 : 0.5]);
  return (
    <div className="sticky h-[72svh] md:h-[78svh]" style={{ top: `calc(var(--nav-h) + ${12 + i * 14}px)` }}>
      <motion.div style={{ scale }} className="relative h-[calc(100%-2rem)] origin-top overflow-hidden rounded-[26px] border border-line bg-surface">
        <Link href={`/services/${s.slug}`} className="group absolute inset-0 block">
          {s.coverImage && <Image src={s.coverImage} alt="" fill sizes="(max-width:768px) 100vw, 90vw" className="object-cover transition-transform duration-[1.6s] [transition-timing-function:cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04]" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/10" />
          <motion.div style={{ opacity: dim }} className="absolute inset-0 bg-black" />
          <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-12">
            <div className="flex items-start justify-between">
              <span className="display text-[clamp(3rem,9vw,7rem)] text-white/10" style={{ WebkitTextStroke: "1px rgba(255,255,255,.35)", color: "transparent" }}>0{i + 1}</span>
              <span className="grid size-12 place-items-center rounded-full border border-white/25 transition-colors duration-500 group-hover:border-accent group-hover:bg-accent"><ArrowUpRight className="size-5" /></span>
            </div>
            <div className="max-w-2xl">
              <h3 className="display text-[clamp(1.9rem,5.5vw,4.4rem)]"><FitText text={s.title} /></h3>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-2">{s.excerpt}</p>
            </div>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
