"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import type { VehicleImage } from "@/db/schema";
import { cn } from "@/lib/utils";
import { FramedImage } from "./framed-image";
import { useI18n } from "@/i18n/client";
import { fmt } from "@/i18n/config";

export function Gallery({ images, title }: { images: VehicleImage[]; title: string }) {
  const { t } = useI18n();
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);
  const n = images.length;
  const go = useCallback((d: number) => setI((x) => (x + d + n) % n), [n]);
  const startX = useRef<number | null>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => { document.documentElement.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const strip = thumbsRef.current;
    const el = strip?.children[i] as HTMLElement | undefined;
    if (strip && el) strip.scrollTo({ left: el.offsetLeft - strip.clientWidth / 2 + el.clientWidth / 2, behavior: "smooth" });
  }, [i]);

  if (!n) return <div className="aspect-[3/2] rounded-2xl border border-line bg-surface grid place-items-center text-muted font-mono text-xs uppercase">{t.common.noPhotos}</div>;
  const cur = images[i];

  const swipe = {
    onPointerDown: (e: React.PointerEvent) => { startX.current = e.clientX; },
    onPointerUp: (e: React.PointerEvent) => {
      if (startX.current === null) return;
      const dx = e.clientX - startX.current;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
      startX.current = null;
    },
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="group relative aspect-[3/2] overflow-hidden rounded-2xl border border-line bg-bg-2 touch-pan-y select-none" {...swipe}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div key={cur.id} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-0">
            <FramedImage img={cur} frame={1.5} alt={cur.alt ?? title} priority={i === 0} sizes="(max-width: 1024px) 100vw, 90vw" />
          </motion.div>
        </AnimatePresence>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/50 to-transparent opacity-60" />
        <button onClick={() => go(-1)} aria-label={t.common.previous} className="absolute left-3 top-1/2 -translate-y-1/2 grid size-11 place-items-center rounded-full glass text-ink opacity-0 transition-all hover:text-accent group-hover:opacity-100 focus-visible:opacity-100">
          <ChevronLeft className="size-5" />
        </button>
        <button onClick={() => go(1)} aria-label={t.common.next} className="absolute right-3 top-1/2 -translate-y-1/2 grid size-11 place-items-center rounded-full glass text-ink opacity-0 transition-all hover:text-accent group-hover:opacity-100 focus-visible:opacity-100">
          <ChevronRight className="size-5" />
        </button>
        <button onClick={() => setOpen(true)} aria-label={t.common.fullscreen} className="absolute right-3 top-3 grid size-10 place-items-center rounded-full glass text-ink hover:text-accent transition-colors">
          <Expand className="size-4" />
        </button>
        <div className="absolute bottom-3 left-4 font-mono text-[11px] tracking-[0.2em] text-ink-2">{String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}</div>
      </div>
      <div ref={thumbsRef} className="relative flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {images.map((img, idx) => (
          <button key={img.id} onClick={() => setI(idx)} aria-label={fmt(t.common.photo, { n: idx + 1 })} className={cn("relative aspect-[3/2] w-24 shrink-0 overflow-hidden rounded-lg border transition-all sm:w-28", idx === i ? "border-accent opacity-100" : "border-line opacity-55 hover:opacity-90")}>
            <Image src={img.url} alt="" fill sizes="120px" placeholder={img.blurDataUrl ? "blur" : "empty"} blurDataURL={img.blurDataUrl ?? undefined} className="object-cover" />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm" {...swipe}>
            <div className="flex items-center justify-between px-5 py-4 text-ink-2">
              <p className="font-mono text-[11px] tracking-[0.2em] uppercase">{title} — {i + 1}/{n}</p>
              <button onClick={() => setOpen(false)} aria-label={t.common.close} className="grid size-10 place-items-center rounded-full border border-line-2 hover:text-accent"><X className="size-5" /></button>
            </div>
            <div className="relative flex-1">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div key={cur.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="absolute inset-0 p-2 sm:p-8">
                  <Image src={cur.url} alt={cur.alt ?? title} fill sizes="100vw" quality={90} className="object-contain" />
                </motion.div>
              </AnimatePresence>
              <button onClick={() => go(-1)} aria-label={t.common.previous} className="absolute left-4 top-1/2 -translate-y-1/2 grid size-12 place-items-center rounded-full glass text-ink hover:text-accent"><ChevronLeft className="size-6" /></button>
              <button onClick={() => go(1)} aria-label={t.common.next} className="absolute right-4 top-1/2 -translate-y-1/2 grid size-12 place-items-center rounded-full glass text-ink hover:text-accent"><ChevronRight className="size-6" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
