"use client";

import Image from "next/image";
import Link from "@/components/i18n/link";
import { useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { useI18n } from "@/i18n/client";
import { animate, motion, useInView, useMotionValue, useScroll, useTransform, type MotionValue } from "motion/react";

type ShowcaseImg = { url: string; blurDataUrl?: string | null; alt?: string | null };
export type StatementFeature = { title: string; href: string; price: string; brand?: string; main: ShowcaseImg; detail?: ShowcaseImg };

/** Big statement whose words light up as you scroll, a layered photo composition on the right, and count-up stats. */
export function Statement({ text, stats, feature }: { text: string; stats: { value: string; label: string }[]; feature?: StatementFeature | null }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const section = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "end 0.45"] });
  const words = text.split(" ");
  return (
    <section ref={section} className="container-x pt-28 pb-12 md:pt-40 md:pb-20">
      <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <p ref={ref} className="display-soft text-[clamp(1.75rem,4.6vw,4.4rem)] leading-[1.08]">
            {words.map((w, i) => (
              <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>{w}</Word>
            ))}
          </p>
          {stats.length > 0 && (
            <div className="mt-14 grid grid-cols-3 gap-x-6 gap-y-10 border-t border-line pt-10 md:mt-20">
              {stats.slice(0, 3).map((s) => (
                <div key={s.label}>
                  <p className="display text-[clamp(1.8rem,4.2vw,3.4rem)] text-white"><CountUp value={s.value} /></p>
                  <p className="mt-3 font-mono text-[9.5px] uppercase leading-relaxed tracking-[0.2em] text-muted">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        {feature && <Showcase feature={feature} target={section} />}
      </div>
    </section>
  );
}

/** Tall portrait photo that unmasks + settles on scroll, an overlapping detail shot on a faster layer, and a glass link card. */
function Showcase({ feature, target }: { feature: StatementFeature; target: React.RefObject<HTMLElement | null> }) {
  const { t } = useI18n();
  const { scrollYProgress } = useScroll({ target, offset: ["start end", "end start"] });
  const clipPath = useTransform(scrollYProgress, [0.05, 0.45], ["inset(18% 10% 18% 10% round 28px)", "inset(0% 0% 0% 0% round 28px)"]);
  const imgScale = useTransform(scrollYProgress, [0.05, 0.6], [1.35, 1.05]);
  const imgY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const detailY = useTransform(scrollYProgress, [0, 1], ["40%", "-35%"]);
  const detailRotate = useTransform(scrollYProgress, [0, 1], [4, -3]);
  const cardOpacity = useTransform(scrollYProgress, [0.3, 0.45], [0, 1]);
  const cardY = useTransform(scrollYProgress, [0.3, 0.45], [20, 0]);
  const lineScale = useTransform(scrollYProgress, [0.15, 0.55], [0, 1]);

  return (
    <div className="relative lg:col-span-5">
      <div className="relative mx-auto w-full max-w-[520px] lg:ml-auto lg:mr-0">
        <motion.div style={{ clipPath }} className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-surface will-change-[clip-path]">
          <motion.div style={{ scale: imgScale, y: imgY }} className="absolute inset-0">
            <Image src={feature.main.url} alt={feature.main.alt ?? feature.title} fill sizes="(max-width:1024px) 90vw, 40vw" placeholder={feature.main.blurDataUrl ? "blur" : "empty"} blurDataURL={feature.main.blurDataUrl ?? undefined} className="object-cover" style={{ objectPosition: "50% 62%" }} />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
          <motion.div style={{ opacity: cardOpacity, y: cardY }} className="absolute inset-x-4 bottom-4 md:inset-x-5 md:bottom-5">
            <Link href={feature.href} className="group flex items-center justify-between gap-4 rounded-2xl glass px-4 py-3.5 transition-colors hover:border-accent/50 md:px-5 md:py-4">
              <span className="min-w-0">
                <span className="block font-mono text-[9.5px] uppercase tracking-[0.22em] text-accent-2">{t.common.featured}{feature.brand ? ` · ${feature.brand}` : ""}</span>
                <span className="display mt-1.5 block truncate text-[15px] leading-tight md:text-[17px]">{feature.title}</span>
                <span className="mt-1 block text-[13px] text-ink-2">{feature.price}</span>
              </span>
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent transition-transform duration-500 group-hover:rotate-45"><ArrowUpRight className="size-4" /></span>
            </Link>
          </motion.div>
        </motion.div>

        {feature.detail && (
          <motion.div style={{ y: detailY, rotate: detailRotate }} className="absolute -left-2 top-[14%] w-[40%] overflow-hidden rounded-2xl border border-white/10 shadow-[0_30px_60px_-20px_rgba(0,0,0,.9)] sm:-left-10 lg:-left-16">
            <div className="relative aspect-[3/4]">
              <Image src={feature.detail.url} alt="" fill sizes="(max-width:1024px) 40vw, 18vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          </motion.div>
        )}

        <div className="pointer-events-none absolute -right-3 top-6 bottom-6 hidden w-px bg-white/10 md:block">
          <motion.div style={{ scaleY: lineScale }} className="h-full w-full origin-top bg-accent" />
        </div>
        <p className="pointer-events-none absolute -right-8 bottom-6 hidden rotate-180 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.32em] text-muted [writing-mode:vertical-rl] md:block">
          {t.home.location}
        </p>
      </div>
    </div>
  );
}

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const last = /[.!?]$/.test(children);
  return (
    <span className="relative mr-[0.25em] inline-block">
      <motion.span style={{ opacity }}>
        {last ? <>{children.slice(0, -1)}<span className="text-accent">{children.slice(-1)}</span></> : children}
      </motion.span>
    </span>
  );
}

export function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { intl } = useI18n();
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const m = /^([\d,.]+)(.*)$/.exec(value.trim());
  const target = m ? Number(m[1].replace(/,/g, "")) : NaN;
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => Math.round(v).toLocaleString(intl));
  useEffect(() => {
    if (!inView || !Number.isFinite(target)) return;
    const c = animate(mv, target, { duration: 1.8, ease: [0.16, 1, 0.3, 1] });
    return () => c.stop();
  }, [inView, target, mv]);
  if (!m || !Number.isFinite(target)) return <span ref={ref}>{value}</span>;
  return <span ref={ref}><motion.span>{text}</motion.span><span className="text-accent">{m[2]}</span></span>;
}
