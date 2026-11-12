"use client";

import Image from "next/image";
import Link from "@/components/i18n/link";
import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { useIsMobile } from "@/components/ui/lazy-video";
import type { HeroVideo } from "@/lib/settings";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/client";
import { useFitWords } from "@/components/ui/fit";

type Spotlight = { title: string; slug: string; image?: string | null } | null;

export function Hero({ video, eyebrow, headline, subheadline, primary, secondary, spotlight }: {
  video: HeroVideo; eyebrow: string; headline: string; subheadline: string;
  primary: { label: string; href: string }; secondary: { label: string; href: string }; spotlight?: Spotlight;
}) {
  const ref = useRef<HTMLElement>(null);
  const fitRef = useRef<HTMLSpanElement>(null);
  useFitWords(fitRef, headline);
  const { t } = useI18n();
  const mobile = useIsMobile();
  const [playing, setPlaying] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const clipPath = useTransform(scrollYProgress, [0, 0.9], ["inset(0% 0% 0% 0% round 0px)", "inset(7% 5% 7% 5% round 32px)"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-35%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const dim = useTransform(scrollYProgress, [0, 0.9], [0, 0.55]);

  let wordIndex = 0;
  const lines = headline.split("\n");

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[600px] w-full overflow-hidden bg-bg">
      <motion.div style={{ clipPath }} className="absolute inset-0 overflow-hidden will-change-[clip-path]">
        <motion.div style={{ scale }} className="absolute inset-0">
          {video.poster && <Image src={video.poster} alt="" fill priority sizes="100vw" className="object-cover" />}
          {mobile !== null && (
            <video
              className={cn("absolute inset-0 h-full w-full object-cover transition-opacity duration-1000", playing ? "opacity-100" : "opacity-0")}
              src={mobile && video.srcMobile ? video.srcMobile : video.src}
              poster={video.poster}
              muted
              loop
              playsInline
              autoPlay
              preload="auto"
              onPlaying={() => setPlaying(true)}
              aria-hidden
            />
          )}
          <div className="cinema" />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-bg/80 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-[78%] bg-gradient-to-t from-bg via-bg/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg/70 via-bg/10 to-transparent" />
          <motion.div style={{ opacity: dim }} className="absolute inset-0 bg-bg" />
        </motion.div>
      </motion.div>

      <motion.div style={{ y: contentY, opacity: contentOpacity }} className="container-x relative z-10 flex h-full flex-col justify-end pb-[max(7rem,14svh)] pt-[var(--nav-h)]">
        <p className="eyebrow fade-in-up mb-6 flex items-center gap-3" style={{ ["--d" as string]: "0.15s" }}>
          <span className="inline-block h-[2px] w-8 bg-accent" />{eyebrow}
        </p>
        <h1 className="display text-[clamp(1.95rem,8.3vw,8.25rem)]" aria-label={headline.replace(/\n/g, " ")}>
          <span ref={fitRef} className="block">
          {lines.map((line, li) => (
            <span key={li} className="block overflow-hidden pb-[0.04em]" aria-hidden>
              {line.split(" ").map((w, wi, arr) => {
                const d = 0.25 + wordIndex++ * 0.07;
                const m = /^(.*?)([.!?])$/.exec(w);
                return (
                  <span key={wi} data-fit-word className="word-up" style={{ ["--d" as string]: `${d}s` }}>
                    {m ? <>{m[1]}<span className="text-accent">{m[2]}</span></> : w}
                    {wi < arr.length - 1 ? " " : ""}
                  </span>
                );
              })}
            </span>
          ))}
          </span>
        </h1>
        <div className="mt-8 flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
          <p className="fade-in-up max-w-sm text-[15px] leading-relaxed text-ink-2 md:text-base" style={{ ["--d" as string]: "0.75s" }}>{subheadline}</p>
          <div className="fade-in-up flex flex-wrap gap-3" style={{ ["--d" as string]: "0.9s" }}>
            <ButtonLink href={primary.href} size="lg" arrow>{primary.label}</ButtonLink>
            <ButtonLink href={secondary.href} size="lg" variant="ghost">{secondary.label}</ButtonLink>
          </div>
        </div>
      </motion.div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
        <div className="container-x flex items-center justify-between pb-6">
          <div className="fade-in-up flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.26em] text-muted" style={{ ["--d" as string]: "1.2s" }}>
            <span className="relative block h-8 w-px overflow-hidden bg-white/15">
              <motion.span className="absolute inset-x-0 top-0 h-1/2 bg-accent" animate={{ y: ["-100%", "200%"] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} />
            </span>
            {t.common.scroll}
          </div>
          {spotlight && (
            <Link href={`/inventory/${spotlight.slug}`} className="fade-in-up pointer-events-auto group hidden items-center gap-3 rounded-full glass py-1.5 pl-1.5 pr-4 sm:flex" style={{ ["--d" as string]: "1.3s" }}>
              {spotlight.image && <span className="relative block size-9 overflow-hidden rounded-full"><Image src={spotlight.image} alt="" fill sizes="36px" className="object-cover" /></span>}
              <span className="flex flex-col leading-tight">
                <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-accent-2">{t.home.newArrival}</span>
                <span className="text-[12.5px] text-ink">{spotlight.title}</span>
              </span>
              <ArrowUpRight className="size-4 text-muted transition-colors group-hover:text-white" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
