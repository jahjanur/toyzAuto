"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { LazyVideo } from "@/components/ui/lazy-video";
import { ButtonLink } from "@/components/ui/button";
import { Headline } from "@/components/ui/headline";
import type { HeroVideo } from "@/lib/settings";
import { useI18n } from "@/i18n/client";

/** Pinned video that expands from a framed card to full-bleed as you scroll. */
export function FeatureVideo({ video, eyebrow, title, text }: { video: HeroVideo; eyebrow: string; title: string; text: string }) {
  const ref = useRef<HTMLElement>(null);
  const { t } = useI18n();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const clipPath = useTransform(scrollYProgress, [0, 0.55], ["inset(16% 7% 16% 7% round 28px)", "inset(0% 0% 0% 0% round 0px)"]);
  const scale = useTransform(scrollYProgress, [0, 0.55], [1.25, 1]);
  const titleScale = useTransform(scrollYProgress, [0, 0.55], [0.82, 1]);
  const titleOpacity = useTransform(scrollYProgress, [0.05, 0.4], [0, 1]);
  const bodyOpacity = useTransform(scrollYProgress, [0.45, 0.7], [0, 1]);
  const bodyY = useTransform(scrollYProgress, [0.45, 0.7], [30, 0]);
  const shade = useTransform(scrollYProgress, [0, 0.55], [0.15, 0.55]);

  return (
    <section ref={ref} className="relative h-[260svh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <motion.div style={{ clipPath }} className="absolute inset-0 will-change-[clip-path]">
          <motion.div style={{ scale }} className="absolute inset-0">
            <LazyVideo src={video.src} srcMobile={video.srcMobile} poster={video.poster} />
            <div className="cinema" />
          </motion.div>
          <motion.div style={{ opacity: shade }} className="absolute inset-0 bg-black" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
        </motion.div>
        <div className="container-x relative flex h-full flex-col items-center justify-center text-center">
          <motion.p style={{ opacity: titleOpacity }} className="eyebrow mb-6 flex items-center gap-3"><span className="inline-block h-[2px] w-6 bg-accent" />{eyebrow}<span className="inline-block h-[2px] w-6 bg-accent" /></motion.p>
          <motion.h2 style={{ scale: titleScale, opacity: titleOpacity }} className="display text-[clamp(2.6rem,11vw,10rem)]"><Headline text={title} /></motion.h2>
          <motion.div style={{ opacity: bodyOpacity, y: bodyY }} className="mt-8 flex flex-col items-center gap-7">
            <p className="max-w-md text-[15px] leading-relaxed text-ink-2 md:text-base">{text}</p>
            <ButtonLink href="/services/wheels-and-tires" arrow>{t.home.exploreWheels}</ButtonLink>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
