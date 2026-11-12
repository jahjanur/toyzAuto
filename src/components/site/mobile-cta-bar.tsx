"use client";

import { useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { Phone } from "lucide-react";
import { useI18n } from "@/i18n/client";

export function MobileCtaBar({ price, phone }: { price: string; phone: string }) {
  const { t } = useI18n();
  const { scrollY } = useScroll();
  const [show, setShow] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => {
    const nearEnd = y + window.innerHeight > document.documentElement.scrollHeight - 320;
    setShow(y > 500 && !nearEnd);
  });
  return (
    <motion.div initial={false} animate={{ y: show ? 0 : 120 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="fixed inset-x-0 bottom-0 z-40 border-t border-line glass px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted">{t.common.price}</p>
          <p className="truncate text-[15px] font-semibold">{price}</p>
        </div>
        <a href={`tel:${phone}`} aria-label={t.nav.call} className="grid size-11 place-items-center rounded-full border border-white/20"><Phone className="size-4" /></a>
        <a href="#inquire" className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">{t.vehicle.inquire}</a>
      </div>
    </motion.div>
  );
}
