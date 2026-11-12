"use client";

import Image from "next/image";
import Link from "@/components/i18n/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { ArrowUpRight, ChevronDown, Phone } from "lucide-react";
import { LogoSvg } from "@/components/brand/logo-svg";
import { InstagramIcon } from "./social-icons";
import { lockScroll } from "@/components/ui/smooth-scroll";
import { NAV_LINKS } from "@/lib/nav-links";
import { MARQUES, marqueMask } from "@/lib/marques";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/client";
import { EngineHover, SoundToggle } from "@/components/sound/sound-ui";
import { FitText, useFitWords } from "@/components/ui/fit";
import { ZulberaCredit } from "@/components/brand/zulbera";
import { LOCALE_COOKIE, localizeHref, stripLocale } from "@/i18n/config";

const ease = [0.16, 1, 0.3, 1] as const;

export type NavMarque = { name: string; slug: string; count: number; sound?: string | null };
export type NavFeatured = { title: string; model: string; brand?: string; slug: string; image?: string; blur?: string | null; price: string } | null;
export type NavService = { title: string; slug: string; excerpt: string | null; coverImage: string | null };

type MenuKey = "inventory" | "services";
const MENU_FOR: Record<string, MenuKey | undefined> = { "/inventory": "inventory", "/services": "services" };

type NavProps = {
  phone: string;
  phoneDisplay: string;
  instagram?: string;
  address?: string;
  announcement?: { enabled: boolean; text: string; href: string };
  marques: NavMarque[];
  featured: NavFeatured;
  services: NavService[];
  totalVehicles: number;
};

const isActive = (fullPath: string, href: string) => {
  const pathname = stripLocale(fullPath).path;
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
};
type LinkKey = "inventory" | "services" | "about" | "contact";
const LABEL_KEY: Record<string, LinkKey> = { "/inventory": "inventory", "/services": "services", "/about": "about", "/contact": "contact" };

export function Nav(props: NavProps) {
  const { phone, phoneDisplay, announcement } = props;
  const pathname = usePathname();
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menu, setMenu] = useState<MenuKey | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { scrollY } = useScroll();
  const hasBar = !!(announcement?.enabled && announcement.text);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    if (y > 480 && y > prev + 4 && !menu && !mobileOpen) setHidden(true);
    else if (y < prev - 4 || y < 480) setHidden(false);
  });

  useEffect(() => { lockScroll(mobileOpen); return () => lockScroll(false); }, [mobileOpen]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setMenu(null); setMobileOpen(false); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openMenu = (key: MenuKey | null) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMenu(key);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => { setMenu(null); setHover(null); }, 140);
  };

  const activeHref = NAV_LINKS.find((l) => isActive(pathname, l.href))?.href ?? null;
  const indicator = hover ?? activeHref;
  const solid = scrolled || !!menu || mobileOpen;

  return (
    <>
      {hasBar && (
        <Link href={announcement!.href || "/inventory"} className="relative z-[60] flex items-center justify-center gap-2 bg-accent px-4 py-2 text-center font-mono text-[10.5px] uppercase tracking-[0.2em] text-white transition-colors hover:bg-accent-2">
          {announcement!.text} <ArrowUpRight className="size-3.5" />
        </Link>
      )}

      <motion.header
        onMouseLeave={scheduleClose}
        animate={{ y: hidden ? "-110%" : "0%" }}
        transition={{ duration: 0.55, ease }}
        className={cn("fixed inset-x-0 z-50", hasBar && !scrolled ? "top-[34px]" : "top-0")}
      >
        {/* surfaces */}
        <div aria-hidden className={cn("pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/70 to-transparent transition-opacity duration-500", solid ? "opacity-0" : "opacity-100")} />
        <div aria-hidden className={cn("absolute inset-0 transition-[opacity,background-color] duration-500 [backdrop-filter:blur(22px)_saturate(160%)] [-webkit-backdrop-filter:blur(22px)_saturate(160%)]", solid ? "opacity-100" : "opacity-0", menu ? "bg-[#070707]/95" : "bg-[#050505]/72")} />
        <div aria-hidden className={cn("absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent transition-opacity duration-500", solid ? "opacity-100" : "opacity-0")} />

        <div className={cn("container-x relative flex items-center justify-between gap-6 transition-[height] duration-500 [transition-timing-function:cubic-bezier(.16,1,.3,1)] lg:grid lg:grid-cols-[1fr_auto_1fr]", scrolled ? "h-16 lg:h-[68px]" : "h-[72px] lg:h-[84px]")}>
          <Link href="/" aria-label="TOYZ autoart — Home" onClick={() => setMobileOpen(false)} className="group relative z-10 shrink-0 justify-self-start text-white">
            <LogoSvg className={cn("transition-[height] duration-500 [transition-timing-function:cubic-bezier(.16,1,.3,1)]", scrolled ? "h-7 lg:h-8" : "h-8 lg:h-10")} carClassName="transition-[fill] duration-500 group-hover:fill-accent" />
          </Link>

          {/* desktop links */}
          <nav aria-label="Main" className="hidden lg:block" onMouseLeave={() => setHover(null)}>
            <ul className="flex items-center gap-1">
              {NAV_LINKS.map((l) => {
                const key = MENU_FOR[l.href];
                const active = isActive(pathname, l.href);
                return (
                  <li key={l.href} className="relative" onMouseEnter={() => { setHover(l.href); openMenu(key ?? null); }}>
                    <Link
                      href={l.href}
                      onClick={() => openMenu(null)}
                      onFocus={() => { setHover(l.href); openMenu(key ?? null); }}
                      aria-current={active ? "page" : undefined}
                      aria-expanded={key ? menu === key : undefined}
                      className={cn("group relative flex items-center gap-1.5 px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors duration-300 xl:px-4", active || menu === key ? "text-white" : "text-white/65 hover:text-white")}
                    >
                      <span className="relative block h-[1.25em] overflow-hidden leading-[1.25em]">
                        <span className="block transition-transform duration-500 [transition-timing-function:cubic-bezier(.16,1,.3,1)] group-hover:-translate-y-full">{t.nav[LABEL_KEY[l.href]] ?? l.label}</span>
                        <span aria-hidden className="absolute inset-0 block translate-y-full text-white transition-transform duration-500 [transition-timing-function:cubic-bezier(.16,1,.3,1)] group-hover:translate-y-0">{t.nav[LABEL_KEY[l.href]] ?? l.label}</span>
                      </span>
                      {key && <ChevronDown className={cn("size-3 opacity-60 transition-transform duration-500", menu === key && "rotate-180 opacity-100")} />}
                      {indicator === l.href && (
                        <motion.span layoutId="nav-indicator" transition={{ type: "spring", stiffness: 420, damping: 36 }} className="absolute inset-x-3 -bottom-0.5 h-[2px] rounded-full bg-accent xl:inset-x-4" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="relative z-10 flex items-center gap-2.5 justify-self-end">
            <SoundToggle className="hidden sm:flex" />
            <LanguageSwitch className="hidden sm:flex" />
            <a href={`tel:${phone}`} aria-label={`${t.nav.call} ${phoneDisplay}`} title={phoneDisplay} className="group grid size-10 shrink-0 place-items-center rounded-full border border-white/15 text-white transition-colors duration-300 hover:border-accent hover:bg-accent">
              <Phone className="size-4 transition-transform duration-500 group-hover:rotate-12" />
            </a>
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? t.nav.closeMenu : t.nav.openMenu}
              aria-expanded={mobileOpen}
              className="relative flex h-10 items-center gap-3 rounded-full border border-white/15 pl-4 pr-3 text-white lg:hidden"
            >
              <span className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] min-[380px]:block">{mobileOpen ? t.nav.close : t.nav.menu}</span>
              <span className="relative block h-3 w-5">
                <span className={cn("absolute left-0 top-0 h-[1.5px] w-5 bg-white transition-transform duration-500 [transition-timing-function:cubic-bezier(.16,1,.3,1)]", mobileOpen && "translate-y-[5px] rotate-45")} />
                <span className={cn("absolute bottom-0 left-0 h-[1.5px] bg-white transition-all duration-500 [transition-timing-function:cubic-bezier(.16,1,.3,1)]", mobileOpen ? "w-5 -translate-y-[5px] -rotate-45" : "w-3")} />
              </span>
            </button>
          </div>
        </div>

        {/* desktop mega panels */}
        <AnimatePresence>
          {menu && (
            <motion.div
              key="mega"
              initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
              animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
              exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
              transition={{ duration: 0.55, ease }}
              onMouseEnter={() => openMenu(menu)}
              className="relative hidden border-t border-white/[.06] bg-[#070707]/95 [backdrop-filter:blur(22px)] lg:block"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={menu} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35, ease }} className="container-x py-10">
                  {menu === "inventory" ? <InventoryPanel {...props} onNavigate={() => openMenu(null)} /> : <ServicesPanel services={props.services} onNavigate={() => openMenu(null)} />}
                </motion.div>
              </AnimatePresence>
              {/* signature strip: shared by both panels so it stays put while switching */}
              <div className="border-t border-white/[.06]">
                <div className="container-x flex items-center justify-between gap-6 py-4">
                  <a href={`tel:${phone}`} className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted transition-colors hover:text-white">
                    <span className="size-1.5 rounded-full bg-accent" />
                    {t.footer.city} · {phoneDisplay}
                  </a>
                  <ZulberaCredit label={t.footer.craftedBy} size="md" />
                </div>
              </div>
              <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* page dim behind mega panel */}
      <AnimatePresence>
        {menu && (
          <motion.div key="dim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} onMouseEnter={scheduleClose} onClick={() => openMenu(null)} className="fixed inset-0 z-40 hidden bg-black/55 backdrop-blur-[2px] lg:block" />
        )}
      </AnimatePresence>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} pathname={pathname} {...props} />
    </>
  );
}

/* ---------------- mega panels ---------------- */

function InventoryPanel({ marques, featured, totalVehicles, onNavigate }: NavProps & { onNavigate: () => void }) {
  const { t } = useI18n();
  const list = marques.filter((m) => m.count > 0 && MARQUES.has(m.slug));
  return (
    <div className="grid grid-cols-12 gap-10">
      <div className="col-span-3 flex flex-col">
        <p className="eyebrow mb-5">{t.nav.inventory}</p>
        <ul className="space-y-1">
          {[
            { href: "/inventory", label: t.nav.allVehicles, meta: String(totalVehicles) },
            { href: "/inventory?sort=newest", label: t.nav.newArrivals },
            { href: "/inventory?condition=New", label: t.nav.newCars },
            { href: "/inventory?sort=price_desc", label: t.nav.priceHighLow },
            { href: "/sell", label: t.nav.sellTrade },
          ].map((l) => (
            <li key={l.href}>
              <Link href={l.href} onClick={onNavigate} className="group flex items-center justify-between rounded-lg py-2.5 pr-2 text-[15px] text-ink-2 transition-colors hover:text-white">
                <span className="flex items-center gap-3"><span className="h-[2px] w-0 bg-accent transition-all duration-500 group-hover:w-4" />{l.label}</span>
                {l.meta && <span className="font-mono text-[10px] text-muted">{l.meta}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="col-span-5">
        <p className="eyebrow mb-5">{t.nav.shopByMarque}</p>
        <div className="grid grid-cols-4 border-l border-t border-white/[.07]">
          {list.map((m) => (
            <EngineHover key={m.slug} id={`nav-${m.slug}`} src={m.sound ?? null} className="border-b border-r border-white/[.07]">
            <Link href={`/inventory?brand=${m.slug}`} onClick={onNavigate} className="group flex h-full flex-col items-center justify-center gap-2.5 px-2 py-5 text-center transition-colors hover:bg-white/[.03]">
              <span aria-hidden className="block size-9 bg-white/70 transition-colors duration-500 group-hover:bg-accent" style={marqueMask(m.slug)} />
              <span className="display text-[9.5px] leading-tight text-white/75 group-hover:text-white">{m.name}</span>
              <span className="font-mono text-[9px] text-muted-2">{m.count}</span>
            </Link>
            </EngineHover>
          ))}
        </div>
      </div>
      <div className="col-span-4">
        <p className="eyebrow mb-5">{t.nav.newArrival}</p>
        {featured ? (
          <Link href={`/inventory/${featured.slug}`} onClick={onNavigate} className="group block overflow-hidden rounded-2xl border border-white/[.08] bg-surface">
            <div className="relative aspect-[16/9] overflow-hidden">
              {featured.image && <Image src={featured.image} alt={featured.title} fill sizes="420px" placeholder={featured.blur ? "blur" : "empty"} blurDataURL={featured.blur ?? undefined} className="object-cover transition-transform duration-[1.4s] [transition-timing-function:cubic-bezier(.16,1,.3,1)] group-hover:scale-105" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <div className="flex items-end justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-accent-2">{featured.brand}</p>
                <p className="display mt-1.5 text-[15px]"><FitText text={featured.model} /></p>
                <p className="mt-1 text-[13px] text-ink-2">{featured.price}</p>
              </div>
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent transition-transform duration-500 group-hover:rotate-45"><ArrowUpRight className="size-4" /></span>
            </div>
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function ServicesPanel({ services, onNavigate }: { services: NavService[]; onNavigate: () => void }) {
  const { t } = useI18n();
  const line = t.nav.atelierLine.replace(/\.$/, "");
  const words = line.split(/\s+/);
  const lineRef = useRef<HTMLParagraphElement>(null);
  useFitWords(lineRef, line);
  return (
    <div className="grid grid-cols-12 gap-10">
      <div className="col-span-3 flex flex-col">
        <p className="eyebrow mb-5">{t.nav.atelier}</p>
        <p ref={lineRef} className="display text-[1.6rem] leading-[1.05]">
          {words.map((w, i) => (
            <Fragment key={i}>
              <span data-fit-word className="inline-block">{w}{i === words.length - 1 && <span className="text-accent">.</span>}</span>
              {i < words.length - 1 && " "}
            </Fragment>
          ))}
        </p>
        <Link href="/services" onClick={onNavigate} className="mt-auto inline-flex items-center gap-2 pt-8 font-mono text-[10px] uppercase tracking-[0.22em] text-muted hover:text-white">{t.nav.allServices} <ArrowUpRight className="size-3.5" /></Link>
      </div>
      <div className="col-span-9 grid grid-cols-5 gap-3">
        {services.map((s, i) => (
          <Link key={s.slug} href={`/services/${s.slug}`} onClick={onNavigate} className="group relative block overflow-hidden rounded-2xl border border-white/[.08] bg-surface">
            <div className="relative aspect-[4/5] min-h-full overflow-hidden">
              {s.coverImage && <Image src={s.coverImage} alt="" fill sizes="220px" className="object-cover opacity-70 transition-[transform,opacity] duration-[1.2s] [transition-timing-function:cubic-bezier(.16,1,.3,1)] group-hover:scale-105 group-hover:opacity-100" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <div className="absolute inset-x-4 bottom-4">
                <p className="font-mono text-[9.5px] text-accent-2">0{i + 1}</p>
                <p className="display mt-1.5 text-[13px] leading-tight"><FitText text={s.title} /></p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ---------------- language switch ---------------- */

/** Remember the visitor's language so the proxy stops auto-detecting, then load the page in that language. */
function switchLanguage(target: "en" | "fr", path: string) {
  document.cookie = `${LOCALE_COOKIE}=${target}; path=/; max-age=31536000; samesite=lax`;
  window.location.assign(localizeHref(path, target) + window.location.search);
}

/** EN | FR pill. */
function LanguageSwitch({ className, onSwitch }: { className?: string; onSwitch?: () => void }) {
  const pathname = usePathname();
  const { locale, t } = useI18n();
  const path = stripLocale(pathname).path;
  const go = (target: "en" | "fr") => {
    onSwitch?.();
    switchLanguage(target, path);
  };
  return (
    <div role="group" aria-label={t.nav.language} className={cn("items-center rounded-full border border-white/15 p-0.5 font-mono text-[10px] uppercase tracking-[0.18em]", className)}>
      {(["en", "fr"] as const).map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          onClick={() => l !== locale && go(l)}
          aria-pressed={l === locale}
          aria-label={l === "en" ? "English" : "Français"}
          className={cn("h-8 rounded-full px-3 transition-colors duration-300", l === locale ? "bg-white text-black" : "text-white/60 hover:text-white")}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

/* ---------------- mobile menu ---------------- */

function MobileMenu({ open, onClose, pathname, phone, phoneDisplay, instagram, address, marques }: NavProps & { open: boolean; onClose: () => void; pathname: string }) {
  const { t } = useI18n();
  const links = [{ href: "/", label: t.nav.home }, ...NAV_LINKS.map((l) => ({ ...l, label: t.nav[LABEL_KEY[l.href]] ?? l.label }))];
  const list = marques.filter((m) => m.count > 0 && MARQUES.has(m.slug));
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="mobile-menu"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
          data-lenis-prevent
          className="fixed inset-0 z-40 overflow-y-auto bg-[#060606] lg:hidden"
        >
          <div aria-hidden className="pointer-events-none absolute -right-32 top-1/4 size-96 rounded-full bg-accent/20 blur-[120px]" />
          <div className="container-x relative flex min-h-full flex-col pt-[calc(var(--nav-h)+1.25rem)] pb-[max(1.75rem,env(safe-area-inset-bottom))]">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}><div className="flex items-center gap-2"><LanguageSwitch className="inline-flex" onSwitch={onClose} /><SoundToggle withLabel /></div></motion.div>
            <ul className="mt-6">
              {links.map((l, i) => {
                const active = isActive(pathname, l.href);
                return (
                  <li key={l.href} className="overflow-hidden border-b border-white/[.08]">
                    <motion.div initial={{ y: "105%" }} animate={{ y: 0 }} transition={{ delay: 0.22 + i * 0.055, duration: 0.8, ease }}>
                      <Link href={l.href} onClick={onClose} className="group flex items-center gap-4 py-4">
                        <span className="w-6 font-mono text-[10px] text-accent-2">0{i + 1}</span>
                        <span className={cn("display text-[clamp(1.8rem,8.5vw,3rem)] transition-colors", active ? "text-white" : "text-white/60 group-active:text-white")}>{l.label}</span>
                        {active ? <span className="ml-auto size-2 rounded-full bg-accent" /> : <ArrowUpRight className="ml-auto size-5 text-white/30" />}
                      </Link>
                    </motion.div>
                  </li>
                );
              })}
            </ul>

            {list.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.7, ease }} className="mt-8">
                <p className="eyebrow mb-4">{t.nav.shopByMarque}</p>
                <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {list.map((m) => (
                    <EngineHover key={m.slug} id={`mnav-${m.slug}`} src={m.sound ?? null} className="shrink-0">
                    <Link href={`/inventory?brand=${m.slug}`} onClick={onClose} className="flex flex-col items-center gap-2 rounded-2xl border border-white/[.08] px-4 py-3.5">
                      <span aria-hidden className="block size-8 bg-white/80" style={marqueMask(m.slug)} />
                      <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">{m.name}</span>
                    </Link>
                    </EngineHover>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.7, ease }} className="mt-auto pt-10">
              <div className="grid grid-cols-[1fr_auto] gap-2.5">
                <Link href="/inventory" onClick={onClose} className="flex h-13 items-center justify-between rounded-full bg-accent pl-6 pr-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                  {t.nav.browseInventory} <span className="grid size-9 place-items-center rounded-full bg-white/15"><ArrowUpRight className="size-4" /></span>
                </Link>
                <a href={`tel:${phone}`} aria-label={`${t.nav.call} ${phoneDisplay}`} className="grid size-13 place-items-center rounded-full border border-white/15"><Phone className="size-4" /></a>
              </div>
              <div className="mt-6 flex items-end justify-between gap-4 text-[12px] leading-relaxed text-muted">
                <span>{address}<br />{phoneDisplay}</span>
                {instagram && <a href={instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="grid size-10 place-items-center rounded-full border border-white/15 text-white"><InstagramIcon className="size-4" /></a>}
              </div>
              <div className="mt-5 border-t border-white/[.08] pt-5"><ZulberaCredit label={t.footer.craftedBy} size="md" /></div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
