import Link from "@/components/i18n/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "white" | "link" | "danger" | "subtle";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn relative isolate inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-semibold uppercase tracking-[0.14em] transition-[color,border-color,background-color,transform,box-shadow] duration-500 [transition-timing-function:cubic-bezier(.16,1,.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[.98]";
const sweep =
  "before:absolute before:inset-0 before:-z-10 before:origin-left before:scale-x-0 before:transition-transform before:duration-500 before:[transition-timing-function:cubic-bezier(.16,1,.3,1)] hover:before:scale-x-100";
const variants: Record<Variant, string> = {
  primary: cn("bg-accent text-white shadow-[0_14px_40px_-14px_rgba(227,18,31,.75)] before:bg-white hover:text-black", sweep),
  ghost: cn("border border-white/20 text-ink before:bg-white hover:text-black hover:border-white", sweep),
  white: cn("bg-white text-black before:bg-accent hover:text-white", sweep),
  subtle: "bg-white/[.06] text-ink hover:bg-white/[.1] border border-transparent hover:border-line-2",
  danger: "bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25",
  link: "text-accent-2 hover:text-white px-0! py-0! h-auto! rounded-none underline-offset-4 hover:underline",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[10.5px]",
  md: "h-11 px-6 text-[11px]",
  lg: "h-13 px-7 text-[11.5px] sm:px-8",
};

function Inner({ children, arrow }: { children: ReactNode; arrow?: boolean }) {
  return (
    <>
      {children}
      {arrow && <ArrowUpRight className="size-4 transition-transform duration-500 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />}
    </>
  );
}

export function Button({ variant = "primary", size = "md", className, children, arrow, ...rest }: ComponentProps<"button"> & { variant?: Variant; size?: Size; arrow?: boolean }) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      <Inner arrow={arrow}>{children}</Inner>
    </button>
  );
}

export function ButtonLink({ variant = "primary", size = "md", className, children, arrow, href, ...rest }: Omit<ComponentProps<typeof Link>, "href"> & { href: string; variant?: Variant; size?: Size; arrow?: boolean; children: ReactNode }) {
  const external = href.startsWith("http") || href.startsWith("tel:") || href.startsWith("mailto:");
  const cls = cn(base, variants[variant], sizes[size], className);
  if (external) return <a href={href} className={cls} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer"><Inner arrow={arrow}>{children}</Inner></a>;
  return <Link href={href} className={cls} {...rest}><Inner arrow={arrow}>{children}</Inner></Link>;
}
