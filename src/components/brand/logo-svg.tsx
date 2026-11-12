import { AUTOART_PATHS, CAR_PATHS, LOGO_VIEWBOX, TOYZ_PATHS } from "./logo-paths";
import { cn } from "@/lib/utils";

/** The official TOYZ autoart mark as inline SVG (fills with currentColor). */
export function LogoSvg({ className, carClassName, title = "TOYZ autoart" }: { className?: string; carClassName?: string; title?: string }) {
  return (
    <svg viewBox={LOGO_VIEWBOX} role="img" aria-label={title} className={cn("h-auto w-auto", className)} fill="currentColor">
      <g className={carClassName}>{CAR_PATHS.map((d, i) => <path key={i} d={d} />)}</g>
      <g>{TOYZ_PATHS.map((d, i) => <path key={i} d={d} />)}</g>
      <g>{AUTOART_PATHS.map((d, i) => <path key={i} d={d} />)}</g>
    </svg>
  );
}
