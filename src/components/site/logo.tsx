import Link from "@/components/i18n/link";
import { LogoSvg } from "@/components/brand/logo-svg";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string; href?: string; priority?: boolean }) {
  return (
    <Link href={href} aria-label="TOYZ autoart — Home" className={cn("group relative z-10 inline-flex items-center text-white", className)}>
      <LogoSvg className="h-8 sm:h-9 md:h-10" carClassName="transition-[fill] duration-500 group-hover:fill-accent" />
    </Link>
  );
}
