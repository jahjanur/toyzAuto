import Link from "@/components/i18n/link";
import { ArrowUpRight, Clock, Mail, MapPin, Phone, type LucideIcon } from "lucide-react";
import { Logo } from "./logo";
import { LogoDraw } from "@/components/brand/logo-draw";
import { ZulberaBand } from "@/components/brand/zulbera";
import { InstagramIcon, YoutubeIcon, LinkedinIcon, TiktokIcon, XIcon, FacebookIcon } from "./social-icons";
import { NAV_LINKS } from "@/lib/nav-links";
import type { SiteSettings } from "@/lib/settings";
import type { Service } from "@/db/schema";
import { getI18n } from "@/i18n/server";
import { cn } from "@/lib/utils";

const NAV_LABEL: Record<string, "inventory" | "services" | "about" | "contact"> = { "/inventory": "inventory", "/services": "services", "/about": "about", "/contact": "contact" };

export async function Footer({ s, services }: { s: SiteSettings; services: Service[] }) {
  const { t } = await getI18n();
  const socials = [
    { href: s.socials.instagram, label: "Instagram", Icon: InstagramIcon },
    { href: s.socials.tiktok, label: "TikTok", Icon: TiktokIcon },
    { href: s.socials.youtube, label: "YouTube", Icon: YoutubeIcon },
    { href: s.socials.x, label: "X", Icon: XIcon },
    { href: s.socials.linkedin, label: "LinkedIn", Icon: LinkedinIcon },
    { href: s.socials.facebook, label: "Facebook", Icon: FacebookIcon },
  ].filter((x) => x.href);
  const open = s.hours.filter((h) => !h.closed);
  const hoursLine = open.length ? `${t.daysShort[open[0].day] ?? open[0].day.slice(0, 3)}–${t.daysShort[open[open.length - 1].day] ?? open[open.length - 1].day.slice(0, 3)} · ${open[0].open}–${open[0].close}` : "";
  const explore = [...NAV_LINKS.map((l) => ({ href: l.href, label: NAV_LABEL[l.href] ? t.nav[NAV_LABEL[l.href]] : l.label })), { href: "/sell", label: t.nav.sell }];
  const emails = [s.email, s.emailSecondary].filter(Boolean) as string[];

  return (
    <footer className="relative overflow-hidden border-t border-line bg-bg">
      <div className="container-x grid gap-10 pt-14 pb-10 lg:grid-cols-12 lg:gap-12 lg:pt-24">
        {/* brand */}
        <div className="lg:col-span-3 xl:col-span-4">
          <Logo />
          <p className="mt-5 max-w-xs text-[14px] leading-relaxed text-muted lg:mt-6">{s.footerBlurb}</p>
          <div className="mt-6 flex flex-wrap gap-2 lg:gap-1.5 xl:gap-2">
            {socials.map(({ href, label, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="grid size-10 place-items-center lg:size-9 xl:size-10 rounded-full border border-line text-ink-2 transition-all hover:border-accent hover:bg-accent hover:text-white">
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        {/* link columns: side by side on phones, separate grid columns on desktop */}
        <div className="grid grid-cols-2 gap-x-6 border-t border-line pt-8 lg:contents">
          <FooterCol title={t.footer.explore} className="lg:col-span-2" links={explore} />
          <FooterCol title={t.footer.services} className="lg:col-span-3" links={services.map((x) => ({ href: `/services/${x.slug}`, label: x.title }))} />
        </div>

        {/* showroom: a contact card on phones, plain rows on desktop */}
        <div className="border-t border-line pt-8 lg:col-span-4 lg:border-0 lg:pt-0 xl:col-span-3">
          <p className="label">{t.footer.showroom}</p>
          <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface/70 lg:divide-y-0 lg:overflow-visible lg:rounded-none lg:border-0 lg:bg-transparent">
            <ContactRow href={s.mapUrl} external Icon={MapPin} label={t.footer.address}>{s.addressLine1}<br />{s.addressLine2}</ContactRow>
            <ContactRow href={`tel:${s.phone}`} Icon={Phone} label={t.contact.phone}>{s.phoneDisplay}</ContactRow>
            {emails.map((e) => <ContactRow key={e} href={`mailto:${e}`} Icon={Mail} label={t.contact.email}>{e}</ContactRow>)}
            {hoursLine && (
              <ContactRow Icon={Clock} label={t.contact.hours}>
                <span className="font-mono text-[12px] tracking-[0.06em]">{hoursLine}</span>
                {s.hoursNote && <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.2em] text-accent-2">{s.hoursNote}</span>}
              </ContactRow>
            )}
          </ul>
        </div>
      </div>

      <div aria-hidden className="container-x pointer-events-none select-none pb-8 pt-2 lg:pb-14 lg:pt-6">
        <LogoDraw />
      </div>

      <div className="container-x pb-6 lg:pb-10">
        <ZulberaBand label={t.footer.craftedBy} services={t.footer.zulberaServices} cta={t.footer.zulberaCta} />
      </div>

      <div className="container-x flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-line py-6 text-[12px] text-muted">
        <p>© {new Date().getFullYear()} {s.brandName}</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <Link href="/privacy" className="hover:text-white">{t.footer.privacy}</Link>
          <Link href="/admin" className="inline-flex items-center gap-1 hover:text-white">Admin <ArrowUpRight className="size-3" /></Link>
          <span className="hidden lg:inline">{t.footer.city}</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links, className }: { title: string; links: { href: string; label: string }[]; className?: string }) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="label">{title}</p>
      <ul className="mt-3 text-[14px] lg:mt-4 lg:space-y-1">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="group flex items-center py-1.5 leading-snug text-ink-2 transition-colors hover:text-white lg:inline-flex lg:py-1">
              <span aria-hidden className="h-[2px] w-0 shrink-0 bg-accent transition-all duration-500 group-hover:mr-2 group-hover:w-3" />
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** One line of the showroom card: icon, small label, value. Links get a tap-friendly row and an arrow. */
function ContactRow({ href, external, Icon, label, children }: { href?: string; external?: boolean; Icon: LucideIcon; label: string; children: React.ReactNode }) {
  const body = (
    <>
      <span className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-ink-2 transition-colors duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-white lg:size-8">
        <Icon className="size-[15px] lg:size-3.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-mono text-[9.5px] uppercase tracking-[0.22em] text-muted lg:sr-only">{label}</span>
        <span className="mt-1 block break-words text-[14px] leading-snug text-ink-2 transition-colors group-hover:text-white lg:mt-0">{children}</span>
      </span>
      {href && <ArrowUpRight aria-hidden className="size-4 shrink-0 text-muted transition-all duration-300 group-hover:rotate-45 group-hover:text-accent lg:hidden" />}
    </>
  );
  const cls = "group flex items-center gap-3 px-3.5 py-3.5 min-[380px]:gap-4 min-[380px]:px-4 lg:items-start lg:gap-3 lg:px-0 lg:py-2";
  return (
    <li>
      {href ? (
        <a href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})} className={cls}>{body}</a>
      ) : (
        <div className={cls}>{body}</div>
      )}
    </li>
  );
}
