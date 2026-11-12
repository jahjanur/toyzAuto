import { ArrowUpRight } from "lucide-react";
import { ZULBERA_EMBLEM, ZULBERA_URL, ZULBERA_VIEWBOX, ZULBERA_WORD } from "./zulbera-paths";
import { cn } from "@/lib/utils";

/** Box around the emblem alone (used for the large watermark). */
const EMBLEM_VIEWBOX = "229.7 173.8 250 222.2";
const SPIN = "[transform-box:fill-box] [transform-origin:center] [transition-timing-function:cubic-bezier(.16,1,.3,1)]";

/** Zulbera logo: emblem in the accent red, wordmark in the current text color. Hovering a parent `.group/zul` spins the emblem. */
export function ZulberaLogo({ className, emblemClassName, wordClassName }: { className?: string; emblemClassName?: string; wordClassName?: string }) {
  return (
    <svg viewBox={ZULBERA_VIEWBOX} role="img" aria-label="Zulbera" className={cn("h-4 w-auto overflow-visible", className)}>
      <g className={cn("fill-accent transition-transform duration-700 group-hover/zul:rotate-180", SPIN, emblemClassName)}>
        {ZULBERA_EMBLEM.map((d, i) => <path key={i} d={d} />)}
      </g>
      <g className={cn("fill-current", wordClassName)}>
        {ZULBERA_WORD.map((d, i) => <path key={i} d={d} />)}
      </g>
    </svg>
  );
}

const SIZES = {
  sm: { logo: "h-[18px]", label: "text-[10px]", rule: "h-3" },
  md: { logo: "h-6", label: "text-[10.5px]", rule: "h-4" },
  lg: { logo: "h-8", label: "text-[11px]", rule: "h-5" },
} as const;

/** "Crafted by | zulbera ↗" credit that links to zulbera.com. */
export function ZulberaCredit({ label, size = "md", className }: { label: string; size?: keyof typeof SIZES; className?: string }) {
  const s = SIZES[size];
  return (
    <a
      href={ZULBERA_URL}
      target="_blank"
      rel="noopener"
      aria-label={`${label} Zulbera (zulbera.com)`}
      className={cn("group/zul inline-flex items-center gap-3 text-white", className)}
    >
      <span className={cn("whitespace-nowrap font-mono uppercase tracking-[0.22em] text-muted transition-colors duration-300 group-hover/zul:text-ink-2", s.label)}>{label}</span>
      <span aria-hidden className={cn("w-px shrink-0 bg-white/15 transition-colors duration-300 group-hover/zul:bg-accent/60", s.rule)} />
      <span className="inline-flex items-center gap-1.5">
        <ZulberaLogo className={s.logo} />
        <ArrowUpRight aria-hidden className="size-3.5 shrink-0 -translate-x-0.5 translate-y-0.5 text-muted transition-all duration-300 group-hover/zul:translate-x-0 group-hover/zul:translate-y-0 group-hover/zul:text-accent" />
      </span>
    </a>
  );
}

/** Compact card for narrow spots (admin sidebar and admin phone menu): label over the logo, round arrow on the right. */
export function ZulberaBadge({ label, className }: { label: string; className?: string }) {
  return (
    <a
      href={ZULBERA_URL}
      target="_blank"
      rel="noopener"
      aria-label={`${label} Zulbera (zulbera.com)`}
      className={cn("group/zul relative flex items-center justify-between gap-3 overflow-hidden rounded-xl border border-line bg-surface px-4 py-3.5 transition-colors duration-300 hover:border-accent/40", className)}
    >
      <span aria-hidden className="pointer-events-none absolute -left-10 top-1/2 size-28 -translate-y-1/2 rounded-full bg-accent/[.06] blur-2xl transition-colors duration-500 group-hover/zul:bg-accent/20" />
      <span className="relative flex min-w-0 flex-col gap-2">
        <span className="whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.28em] text-muted transition-colors duration-300 group-hover/zul:text-ink-2">{label}</span>
        <ZulberaLogo className="h-5 text-white" />
      </span>
      <span aria-hidden className="relative grid size-8 shrink-0 place-items-center rounded-full border border-line text-muted transition-all duration-300 group-hover/zul:rotate-45 group-hover/zul:border-accent group-hover/zul:bg-accent group-hover/zul:text-white">
        <ArrowUpRight className="size-3.5" />
      </span>
    </a>
  );
}

/** Footer signature card: gradient hairline, large logo, what Zulbera does, a visit button, and a giant emblem watermark. */
export function ZulberaBand({ label, services, cta }: { label: string; services: string; cta: string }) {
  const items = services.split("·").map((x) => x.trim()).filter(Boolean);
  return (
    <a
      href={ZULBERA_URL}
      target="_blank"
      rel="noopener"
      aria-label={`${label} Zulbera — zulbera.com`}
      className="group/zul relative block rounded-[24px] bg-[linear-gradient(115deg,rgba(227,18,31,.55),rgba(255,255,255,.09)_30%,rgba(255,255,255,.04)_60%,rgba(227,18,31,.28))] p-px shadow-[0_30px_80px_-40px_rgba(227,18,31,.35)] transition-shadow duration-700 hover:shadow-[0_40px_100px_-36px_rgba(227,18,31,.6)]"
    >
      <span className="relative flex flex-col items-center gap-7 overflow-hidden rounded-[23px] bg-[#0a0a0a] px-6 py-9 text-center lg:flex-row lg:justify-between lg:gap-10 lg:px-11 lg:py-10 lg:text-left">
        {/* soft red light behind the logo */}
        <span aria-hidden className="pointer-events-none absolute left-1/2 top-0 size-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[.14] blur-[90px] transition-colors duration-700 group-hover/zul:bg-accent/25 lg:-left-16 lg:top-1/2 lg:translate-x-0" />
        {/* giant emblem watermark */}
        <svg aria-hidden viewBox={EMBLEM_VIEWBOX} className="pointer-events-none absolute -bottom-16 -right-14 h-56 w-auto overflow-visible lg:-right-6 lg:bottom-auto lg:top-1/2 lg:h-[230%] lg:-translate-y-1/2">
          <g className={cn("fill-white/[.028] transition-[transform,fill] duration-[1.6s] group-hover/zul:-rotate-90 group-hover/zul:fill-accent/[.07]", SPIN)}>
            {ZULBERA_EMBLEM.map((d, i) => <path key={i} d={d} />)}
          </g>
        </svg>
        {/* light sweep on hover */}
        <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-[160%] -skew-x-12 bg-gradient-to-r from-transparent via-white/[.07] to-transparent transition-transform duration-[1.3s] ease-out group-hover/zul:translate-x-[420%]" />

        {/* signature */}
        <span className="relative flex shrink-0 flex-col items-center gap-3.5 lg:items-start">
          <span className="flex items-center gap-3 whitespace-nowrap font-mono text-[10.5px] uppercase tracking-[0.3em] text-muted">
            <span aria-hidden className="h-px w-6 bg-accent lg:hidden" />
            {label}
            <span aria-hidden className="h-px w-6 bg-accent" />
          </span>
          <ZulberaLogo className="h-10 text-white md:h-11" />
        </span>

        {/* what we do */}
        <span className="relative flex flex-wrap items-center justify-center gap-2 lg:max-w-[24rem] lg:justify-start xl:max-w-none">
          {items.map((x) => (
            <span key={x} className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-white/[.03] px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink-2 transition-colors duration-500 group-hover/zul:border-white/20">
              <span aria-hidden className="size-1 rounded-full bg-accent" />
              {x}
            </span>
          ))}
        </span>

        {/* visit button */}
        <span className="relative inline-flex h-12 shrink-0 items-center gap-3 rounded-full border border-white/20 bg-white/[.03] pl-6 pr-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm transition-colors duration-500 group-hover/zul:border-accent group-hover/zul:bg-accent">
          {cta}
          <span className="grid size-9 place-items-center rounded-full bg-white/10 transition-[transform,background-color] duration-500 group-hover/zul:rotate-45 group-hover/zul:bg-black/25"><ArrowUpRight className="size-4" /></span>
        </span>
      </span>
    </a>
  );
}
