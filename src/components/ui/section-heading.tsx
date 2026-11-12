import type { ReactNode } from "react";
import { Reveal, SplitWords } from "./reveal";
import { cn } from "@/lib/utils";

export function SectionHeading({ eyebrow, title, description, action, align = "left", className, index }: { eyebrow?: string; title: string; description?: ReactNode; action?: ReactNode; align?: "left" | "center"; className?: string; index?: string }) {
  return (
    <div className={cn("flex flex-col gap-6 md:flex-row md:items-end md:justify-between", align === "center" && "items-center text-center md:flex-col md:items-center", className)}>
      <div className={cn("max-w-3xl", align === "center" && "mx-auto")}>
        {eyebrow && (
          <Reveal>
            <p className={cn("eyebrow mb-5 flex items-center gap-3", align === "center" && "justify-center")}>
              {index && <span className="text-muted">{index}</span>}
              <span className="inline-block h-[2px] w-6 bg-accent" />
              {eyebrow}
            </p>
          </Reveal>
        )}
        <h2 className="display text-[clamp(1.9rem,6.2vw,4.6rem)]"><SplitWords text={title} inView /></h2>
        {description && (
          <Reveal delay={0.15}>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted">{description}</p>
          </Reveal>
        )}
      </div>
      {action && <Reveal delay={0.2}>{action}</Reveal>}
    </div>
  );
}
