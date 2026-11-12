import Image from "next/image";
import { cn } from "@/lib/utils";

export const PARTNERS = [
  { slug: "brabus", name: "BRABUS", h: "h-12 md:h-[72px]", hRow: "h-10 lg:h-12" },
  { slug: "hre", name: "HRE Performance Wheels", h: "h-14 md:h-20", hRow: "h-12 lg:h-14" },
  { slug: "vossen", name: "Vossen", h: "h-7 md:h-10", hRow: "h-6 lg:h-7" },
  { slug: "novitec", name: "Novitec", h: "h-6 md:h-8", hRow: "h-5 lg:h-6" },
  { slug: "techart", name: "TECHART", h: "h-3.5 md:h-[22px]", hRow: "h-3 lg:h-[15px]" },
  { slug: "urban", name: "Urban Automotive", h: "h-7 md:h-10", hRow: "h-6 lg:h-7" },
];

/** Partner logo grid. `row` puts all six in one line on large screens (used on the homepage). */
export function PartnerGrid({ className, row }: { className?: string; row?: boolean }) {
  return (
    <div className={cn("grid grid-cols-2 border-l border-t border-line sm:grid-cols-3", row && "lg:grid-cols-6", className)}>
      {PARTNERS.map((p) => (
        <div key={p.slug} className={cn("group relative grid place-items-center border-b border-r border-line px-4 transition-colors duration-500 hover:bg-surface", row ? "h-32 md:h-40" : "h-36 md:h-52")}>
          <Image src={`/brand/partners/${p.slug}.png`} alt={p.name} width={400} height={160} className={cn(row ? p.hRow : p.h, "w-auto max-w-full opacity-65 transition-opacity duration-500 group-hover:opacity-100")} />
          <span className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-accent transition-transform duration-500 [transition-timing-function:cubic-bezier(.16,1,.3,1)] group-hover:scale-x-100" />
        </div>
      ))}
    </div>
  );
}
