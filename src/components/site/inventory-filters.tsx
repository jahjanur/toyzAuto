"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, SlidersHorizontal, X, Check } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import { useI18n } from "@/i18n/client";
import { fmt } from "@/i18n/config";
import { tv } from "@/i18n/content";

type Facets = { condition: string[]; body: string[]; fuel: string[]; transmission: string[]; minPrice: number; maxPrice: number; minYear: number; maxYear: number };
type BrandRow = { slug: string; name: string; count: number };

const SORTS = [
  { v: "featured", key: "sortFeatured" },
  { v: "newest", key: "sortNewest" },
  { v: "price_desc", key: "sortPriceDesc" },
  { v: "price_asc", key: "sortPriceAsc" },
  { v: "year_desc", key: "sortYear" },
  { v: "km_asc", key: "sortKm" },
] as const;

export function InventoryToolbar({ total, facets, brands }: { total: number; facets: Facets; brands: BrandRow[] }) {
  const { t, intl } = useI18n();
  const vehicles = (n: number) => fmt(n === 1 ? t.common.vehicleOne : t.common.vehicleMany, { n });
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(sp.get("q") ?? "");

  const update = useCallback((mutate: (p: URLSearchParams) => void) => {
    const p = new URLSearchParams(sp.toString());
    mutate(p);
    start(() => router.replace(`${pathname}${p.toString() ? `?${p}` : ""}`, { scroll: false }));
  }, [sp, router, pathname]);

  useEffect(() => {
    const t = setTimeout(() => { if ((sp.get("q") ?? "") !== q) update((p) => { q ? p.set("q", q) : p.delete("q"); }); }, 350);
    return () => clearTimeout(t);
  }, [q]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (key: string, val: string) => update((p) => {
    const cur = p.getAll(key);
    p.delete(key);
    (cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val]).forEach((x) => p.append(key, x));
  });
  const setOne = (key: string, val: string) => update((p) => { val ? p.set(key, val) : p.delete(key); });
  const activeCount = ["brand", "condition", "body", "fuel", "transmission", "minPrice", "maxPrice", "minYear", "maxYear", "sold"].reduce((n, k) => n + sp.getAll(k).length, 0);
  const clearAll = () => { setQ(""); start(() => router.replace(pathname, { scroll: false })); };

  const panel = (
    <div className="flex flex-col gap-7">
      <Group title={t.inventory.brand}>
        {brands.filter((b) => b.count > 0 || sp.getAll("brand").includes(b.slug)).map((b) => (
          <Chip key={b.slug} active={sp.getAll("brand").includes(b.slug)} onClick={() => toggle("brand", b.slug)}>{b.name}<span className="ml-1.5 text-muted-2">{b.count}</span></Chip>
        ))}
      </Group>
      <Group title={t.inventory.condition}>{facets.condition.map((c) => <Chip key={c} active={sp.getAll("condition").includes(c)} onClick={() => toggle("condition", c)}>{tv(t, "condition", c)}</Chip>)}</Group>
      <Group title={t.inventory.body}>{facets.body.map((c) => <Chip key={c} active={sp.getAll("body").includes(c)} onClick={() => toggle("body", c)}>{tv(t, "body", c)}</Chip>)}</Group>
      <Group title={t.inventory.powertrain}>{facets.fuel.map((c) => <Chip key={c} active={sp.getAll("fuel").includes(c)} onClick={() => toggle("fuel", c)}>{tv(t, "fuel", c)}</Chip>)}</Group>
      <Group title={t.inventory.transmission}>{facets.transmission.map((c) => <Chip key={c} active={sp.getAll("transmission").includes(c)} onClick={() => toggle("transmission", c)}>{tv(t, "transmission", c)}</Chip>)}</Group>
      <Group title={t.inventory.priceCad}>
        <div className="grid w-full grid-cols-2 gap-2">
          <Num placeholder={fmt(t.inventory.min, { n: formatNumber(facets.minPrice, intl) })} value={sp.get("minPrice") ?? ""} onCommit={(v) => setOne("minPrice", v)} />
          <Num placeholder={fmt(t.inventory.max, { n: formatNumber(facets.maxPrice, intl) })} value={sp.get("maxPrice") ?? ""} onCommit={(v) => setOne("maxPrice", v)} />
        </div>
      </Group>
      <Group title={t.inventory.year}>
        <div className="grid w-full grid-cols-2 gap-2">
          <Num placeholder={fmt(t.inventory.from, { n: facets.minYear })} value={sp.get("minYear") ?? ""} onCommit={(v) => setOne("minYear", v)} />
          <Num placeholder={fmt(t.inventory.to, { n: facets.maxYear })} value={sp.get("maxYear") ?? ""} onCommit={(v) => setOne("maxYear", v)} />
        </div>
      </Group>
      <label className="flex cursor-pointer items-center justify-between rounded-xl border border-line px-4 py-3 text-sm text-ink-2">
        {t.inventory.includeSold}
        <input type="checkbox" className="peer sr-only" checked={sp.get("sold") === "1"} onChange={(e) => setOne("sold", e.target.checked ? "1" : "")} />
        <span className="relative h-5 w-9 rounded-full bg-white/10 transition peer-checked:bg-accent after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-ink after:transition peer-checked:after:translate-x-4 peer-checked:after:bg-white" />
      </label>
      {activeCount > 0 && <button onClick={clearAll} className="text-left text-sm text-accent hover:text-accent-2">{t.inventory.clearAll}</button>}
    </div>
  );

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2.5 lg:flex-col lg:items-stretch">
      <div className="relative min-w-[180px] flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.inventory.search} className="input h-11 rounded-full! pl-10!" />
      </div>
      <select value={sp.get("sort") ?? "featured"} onChange={(e) => setOne("sort", e.target.value === "featured" ? "" : e.target.value)} className="input h-11 w-auto rounded-full! pr-9 text-[13px] lg:w-full">
        {SORTS.map((s) => <option key={s.v} value={s.v} className="bg-surface">{t.inventory[s.key]}</option>)}
      </select>
      <p className={cn("ml-auto font-mono text-[10px] uppercase tracking-[0.22em] text-muted transition-opacity lg:ml-0", pending && "opacity-40")}>{vehicles(total)}</p>
    </div>
  );

  return (
    <>
      <div className="lg:hidden">{toolbar}</div>
      <aside data-lenis-prevent className="hidden lg:sticky lg:top-[calc(var(--nav-h)+16px)] lg:block lg:max-h-[calc(100svh-var(--nav-h)-32px)] lg:self-start lg:overflow-y-auto lg:pr-2 lg:[scrollbar-width:none]">
        <div className="mb-8">{toolbar}</div>
        {panel}
      </aside>
      <button onClick={() => setOpen(true)} className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 z-40 inline-flex h-12 -translate-x-1/2 items-center gap-2 rounded-full bg-white px-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-black shadow-[0_20px_50px_-15px_rgba(0,0,0,.9)] lg:hidden">
        <SlidersHorizontal className="size-4" /> {t.inventory.filters} {activeCount > 0 && <span className="grid size-5 place-items-center rounded-full bg-accent text-[10px] text-white">{activeCount}</span>}
      </button>
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm lg:hidden" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 320, damping: 34 }} data-lenis-prevent className="fixed inset-y-0 right-0 z-[80] w-[88vw] max-w-sm overflow-y-auto border-l border-line bg-bg-2 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:hidden">
              <div className="mb-6 flex items-center justify-between">
                <p className="display text-xl">{t.inventory.filters}<span className="text-accent">.</span></p>
                <button onClick={() => setOpen(false)} aria-label={t.common.close} className="grid size-10 place-items-center rounded-full border border-line-2"><X className="size-4" /></button>
              </div>
              {panel}
              <button onClick={() => setOpen(false)} className="mt-8 h-12 w-full rounded-full bg-accent text-[11px] font-semibold uppercase tracking-[0.14em] text-white">{fmt(t.inventory.show, { n: vehicles(total) })}</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="label">{title}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] transition-all", active ? "border-accent bg-accent/15 text-accent-2" : "border-line text-ink-2 hover:border-line-2 hover:text-ink")}>
      {active && <Check className="size-3" />}{children}
    </button>
  );
}
function Num({ value, onCommit, placeholder }: { value: string; onCommit: (v: string) => void; placeholder: string }) {
  return <NumInner key={value} value={value} onCommit={onCommit} placeholder={placeholder} />;
}
function NumInner({ value, onCommit, placeholder }: { value: string; onCommit: (v: string) => void; placeholder: string }) {
  const [v, setV] = useState(value);
  return <input type="number" inputMode="numeric" value={v} placeholder={placeholder} onChange={(e) => setV(e.target.value)} onBlur={() => v !== value && onCommit(v)} onKeyDown={(e) => e.key === "Enter" && onCommit(v)} className="input text-[13px]" />;
}
