"use client";

import { motion } from "motion/react";
import { SpecIcon, type SpecKind } from "./spec-icons";
import { cn } from "@/lib/utils";
import { FitText } from "@/components/ui/fit";

export type SpecItem = { kind: SpecKind; label: string; value: string; note?: string };

const tile = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const } },
};

/** Primary spec tiles with self-drawing icons (kilometres, condition, body, drivetrain, transmission, fuel). */
export function KeySpecs({ items, drive, fuel, className }: { items: SpecItem[]; drive?: string | null; fuel?: string | null; className?: string }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ staggerChildren: 0.07 }}
      className={cn("grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6", className)}
    >
      {items.map((s) => (
        <motion.div key={s.label} variants={tile} className="group relative overflow-hidden rounded-[20px] border border-line bg-surface p-5 transition-colors duration-500 hover:border-accent/50 md:p-6">
          <div className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full bg-accent/0 blur-2xl transition-colors duration-700 group-hover:bg-accent/20" />
          <span className="relative grid size-14 place-items-center rounded-2xl border border-line bg-bg/60 text-ink transition-colors duration-500 group-hover:border-accent/50 md:size-16">
            <SpecIcon kind={s.kind} drive={drive} fuel={fuel} className="size-9 md:size-10" />
          </span>
          <p className="relative mt-5 font-mono text-[9.5px] uppercase tracking-[0.22em] text-muted">{s.label}</p>
          <p className="display relative mt-2 text-[clamp(0.95rem,1.4vw,1.15rem)] leading-tight text-white"><FitText text={s.value} /></p>
          {s.note && <p className="relative mt-1.5 text-[11.5px] text-muted">{s.note}</p>}
        </motion.div>
      ))}
    </motion.div>
  );
}

/** Secondary details as an icon list. */
export function DetailSpecs({ items, single }: { items: SpecItem[]; single?: boolean }) {
  return (
    <motion.dl initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} transition={{ staggerChildren: 0.06 }} className={cn("grid gap-3", !single && "sm:grid-cols-2")}>
      {items.map((s) => (
        <motion.div key={s.label} variants={tile} className="group flex items-center gap-4 rounded-2xl border border-line bg-surface px-4 py-3.5 transition-colors duration-500 hover:border-accent/50">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-bg/60 text-ink transition-colors duration-500 group-hover:border-accent/50">
            <SpecIcon kind={s.kind} className="size-7" />
          </span>
          <div className="min-w-0">
            <dt className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-muted">{s.label}</dt>
            <dd className="mt-1 text-[14px] font-medium leading-snug text-white">{s.value}</dd>
          </div>
        </motion.div>
      ))}
    </motion.dl>
  );
}
