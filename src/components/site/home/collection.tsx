"use client";

import Link from "@/components/i18n/link";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import type { VehicleWithRelations } from "@/db/schema";
import { formatKm, formatPrice } from "@/lib/utils";
import { useI18n } from "@/i18n/client";
import { fmt } from "@/i18n/config";
import { tv } from "@/i18n/content";
import { Headline } from "@/components/ui/headline";
import { FitText } from "@/components/ui/fit";
import { FramedImage } from "@/components/site/framed-image";

/** Pinned section: vertical scroll drives a horizontal rail of cars. Works the same on phones. */
export function Collection({ vehicles, currency, total }: { vehicles: VehicleWithRelations[]; currency: string; total: number }) {
  const section = useRef<HTMLElement>(null);
  const { t, intl } = useI18n();
  const track = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setDist(Math.max(0, el.scrollWidth - window.innerWidth)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const x = useTransform(smooth, [0, 1], [0, -dist]);
  const bar = useTransform(smooth, [0, 1], ["0%", "100%"]);

  return (
    <section ref={section} className="relative" style={{ height: `calc(100svh + ${dist}px)` }}>
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        <div className="container-x mb-8 flex items-end justify-between gap-6 md:mb-12">
          <div>
            <p className="eyebrow mb-4 flex items-center gap-3"><span className="inline-block h-[2px] w-6 bg-accent" />{t.home.collectionEyebrow}</p>
            <h2 className="display text-[clamp(2rem,6.5vw,5rem)]"><Headline text={t.home.collectionTitle} /></h2>
          </div>
          <div className="hidden w-48 md:block">
            <p className="mb-3 text-right font-mono text-[10px] uppercase tracking-[0.22em] text-muted">{fmt(total === 1 ? t.common.vehicleOne : t.common.vehicleMany, { n: total })}</p>
            <div className="h-[2px] bg-white/10"><motion.div style={{ width: bar }} className="h-full bg-accent" /></div>
          </div>
        </div>

        <motion.div ref={track} data-overflow-ok style={{ x }} className="flex w-max gap-4 pl-5 pr-5 will-change-transform sm:pl-8 sm:pr-8 md:gap-6 xl:pl-14 xl:pr-14">
          {vehicles.map((v, i) => {
            const img = v.images[0];
            return (
              <Link key={v.id} href={`/inventory/${v.slug}`} className="group relative block w-[84vw] shrink-0 sm:w-[62vw] md:w-[46vw] lg:w-[38vw] xl:w-[32vw]">
                <div className="relative aspect-[3/2] overflow-hidden rounded-[22px] border border-line bg-surface">
                  {img && <FramedImage mode="focus" img={img} frame={1.5} alt={v.title} sizes="(max-width:640px) 84vw, (max-width:1024px) 50vw, 34vw" imgClassName="transition-transform duration-[1.6s] [transition-timing-function:cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.05]" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/25" />
                  <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/85">{String(i + 1).padStart(2, "0")} / {String(vehicles.length).padStart(2, "0")}</span>
                    <span className="grid size-10 place-items-center rounded-full glass transition-colors duration-500 group-hover:border-accent group-hover:bg-accent"><ArrowUpRight className="size-4" /></span>
                  </div>
                </div>
                <div className="px-1 pt-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent-2">{v.brand?.name} · {v.year}</p>
                  <h3 className="display mt-2 text-[clamp(1.2rem,2vw,1.7rem)] leading-[0.98] transition-colors duration-500 group-hover:text-white"><FitText text={v.model} /></h3>
                  <div className="mt-4 flex items-center justify-between border-t border-line pt-4 text-[13px]">
                    <span className="text-muted">{formatKm(v.mileageKm, intl)}{v.transmission ? ` · ${tv(t, "transmission", v.transmission)}` : ""}</span>
                    <span className="font-semibold text-white">{v.priceOnRequest ? t.common.onRequest : formatPrice(v.priceCents, currency, intl)}</span>
                  </div>
                </div>
              </Link>
            );
          })}
          <Link href="/inventory" className="group flex aspect-[3/2] w-[70vw] shrink-0 flex-col items-start justify-end self-start rounded-[22px] border border-line bg-surface p-7 transition-colors hover:border-accent sm:w-[44vw] md:w-[30vw] lg:w-[24vw]">
            <span className="grid size-14 place-items-center rounded-full bg-accent transition-transform duration-500 group-hover:rotate-45"><ArrowUpRight className="size-6" /></span>
            <p className="display mt-8 text-[clamp(1.6rem,3vw,2.6rem)]"><Headline text={fmt(t.home.viewAllCars, { n: total })} /></p>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
