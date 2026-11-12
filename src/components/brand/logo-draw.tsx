"use client";

import { motion } from "motion/react";
import { AUTOART_PATHS, CAR_PATHS, LOGO_VIEWBOX, TOYZ_PATHS } from "./logo-paths";
import { cn } from "@/lib/utils";

const ease = [0.65, 0, 0.35, 1] as const;

/** Outline of the logo that draws itself when scrolled into view (used as the giant footer mark). */
export function LogoDraw({ className }: { className?: string }) {
  const groups = [
    { paths: CAR_PATHS, stroke: "var(--color-accent)", delay: 0 },
    { paths: TOYZ_PATHS, stroke: "rgba(255,255,255,.22)", delay: 0.25 },
    { paths: AUTOART_PATHS, stroke: "rgba(255,255,255,.22)", delay: 0.55 },
  ];
  return (
    <motion.svg viewBox={LOGO_VIEWBOX} aria-hidden className={cn("h-auto w-full overflow-visible", className)} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.35 }}>
      {groups.map((g, gi) => (
        <g key={gi} fill="none" stroke={g.stroke} strokeWidth={1.4} strokeLinejoin="round">
          {g.paths.map((d, i) => (
            <motion.path
              key={i}
              d={d}
              vectorEffect="non-scaling-stroke"
              variants={{ hidden: { pathLength: 0, opacity: 0 }, show: { pathLength: 1, opacity: 1 } }}
              transition={{ pathLength: { duration: 2.2, delay: g.delay + i * 0.08, ease }, opacity: { duration: 0.3, delay: g.delay + i * 0.08 } }}
            />
          ))}
        </g>
      ))}
    </motion.svg>
  );
}
