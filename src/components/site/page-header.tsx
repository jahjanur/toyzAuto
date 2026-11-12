import Image from "next/image";
import Link from "@/components/i18n/link";
import { Reveal, SplitWords } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";
import { getI18n } from "@/i18n/server";

export async function PageHeader({ eyebrow, title, description, image, crumbs, children, compact, className }: {
  eyebrow?: string; title: string; description?: string; image?: { src: string; blur?: string | null; alt?: string; prominent?: boolean };
  crumbs?: { href: string; label: string }[]; children?: React.ReactNode; compact?: boolean; className?: string;
}) {
  const { t } = await getI18n();
  return (
    <section className={cn("relative overflow-hidden border-b border-line", className)}>
      {image && (
        <>
          <Image src={image.src} alt={image.alt ?? ""} fill priority sizes="100vw" placeholder={image.blur ? "blur" : "empty"} blurDataURL={image.blur ?? undefined} className={cn("object-cover", image.prominent ? "opacity-75" : "opacity-35")} />
          <div className={cn("absolute inset-0 bg-gradient-to-b to-bg", image.prominent ? "from-bg/25 via-bg/35" : "from-bg/70 via-bg/50")} />
        </>
      )}
      <div className="pointer-events-none absolute -left-40 top-0 size-[420px] rounded-full bg-accent/10 blur-[120px]" />
      <div className={cn("container-x relative pt-[calc(var(--nav-h)+1.75rem)] md:pt-[calc(var(--nav-h)+2.25rem)]", compact ? "pb-8 md:pb-10" : "pb-10 md:pb-14")}>
        {crumbs && (
          <nav className="mb-4 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            <Link href="/" className="hover:text-white">{t.common.home}</Link>
            {crumbs.map((c) => <span key={c.href} className="flex items-center gap-2"><span className="text-accent">/</span><Link href={c.href} className="hover:text-white">{c.label}</Link></span>)}
          </nav>
        )}
        {eyebrow && <Reveal><p className="eyebrow mb-4 flex items-center gap-3"><span className="inline-block h-[2px] w-6 bg-accent" />{eyebrow}</p></Reveal>}
        <h1 className="display text-[clamp(2.1rem,6vw,4.75rem)]"><SplitWords text={title} /></h1>
        {description && <Reveal delay={0.25}><p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted">{description}</p></Reveal>}
        {children}
      </div>
    </section>
  );
}
