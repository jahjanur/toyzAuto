import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Marquee({ children, className, slow, reverse }: { children: ReactNode; className?: string; slow?: boolean; reverse?: boolean }) {
  return (
    <div className={cn("group/marquee overflow-hidden mask-fade-x", className)}>
      <div className={cn("flex w-max items-center", slow ? "animate-marquee-slow" : "animate-marquee", reverse && "[animation-direction:reverse]", "group-hover/marquee:[animation-play-state:paused]")}>
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>{children}</div>
      </div>
    </div>
  );
}
