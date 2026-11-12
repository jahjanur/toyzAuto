import Link from "@/components/i18n/link";
import { Reveal, Stagger, Item } from "@/components/ui/reveal";
import { getI18n } from "@/i18n/server";
import { fmt } from "@/i18n/config";
import { EngineHover, SoundHint } from "@/components/sound/sound-ui";
import { hoverSoundFor } from "@/lib/sounds";

import { MARQUES } from "@/lib/marques";
export { MARQUES };

function maskStyle(slug: string): React.CSSProperties {
  const url = `url(/brand/marques/${slug}.svg)`;
  return { maskImage: url, WebkitMaskImage: url, maskSize: "contain", WebkitMaskSize: "contain", maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat", maskPosition: "center", WebkitMaskPosition: "center" };
}

/** Marques currently in stock that have an emblem, as a clean grid directly under the hero. */
export async function BrandShowcase({ brands }: { brands: { name: string; slug: string; count: number; soundUrl?: string | null }[] }) {
  const { t } = await getI18n();
  const marques = brands.filter((b) => b.count > 0 && MARQUES.has(b.slug));
  if (!marques.length) return null;
  return (
    <section className="relative bg-bg py-14 md:py-20">
      <div className="container-x">
        <div className="mb-8 flex items-end justify-between gap-4 md:mb-10">
          <Reveal><p className="eyebrow flex items-center gap-3"><span className="inline-block h-[2px] w-6 bg-accent" />{t.home.inShowroom}</p></Reveal>
          <Reveal className="flex items-center gap-4"><SoundHint className="hidden sm:inline-flex" /><Link href="/inventory" className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted transition-colors hover:text-white">{t.home.allInventory}</Link></Reveal>
        </div>
        <SoundHint className="mb-5 sm:hidden" />
        <Stagger stagger={0.05} className="grid grid-cols-4 border-l border-t border-line md:grid-cols-[repeat(auto-fit,minmax(140px,1fr))]">
          {marques.map((b) => (
            <Item key={b.slug} className="border-b border-r border-line">
              <EngineHover id={`brand-${b.slug}`} src={hoverSoundFor(b)} className="h-full">
              <Link href={`/inventory?brand=${b.slug}`} aria-label={`${b.name}: ${fmt(t.common.inStock, { n: b.count })}`} className="group relative flex h-full flex-col items-center justify-center gap-3 px-1.5 py-6 text-center transition-colors duration-500 hover:bg-surface md:gap-4 md:px-2 md:py-9">
                <span aria-hidden className="block size-8 bg-white/75 transition-[background-color,transform] duration-500 group-hover:-translate-y-0.5 group-hover:bg-accent sm:size-10 md:size-12" style={maskStyle(b.slug)} />
                <span className="flex flex-col items-center gap-1.5">
                  <span className="display text-[8.5px] leading-[1.15] text-white/80 transition-colors group-hover:text-white sm:text-[10.5px] md:text-[11.5px]">{b.name}</span>
                  <span className="hidden font-mono text-[9px] uppercase tracking-[0.2em] text-muted-2 transition-colors group-hover:text-accent-2 sm:block">{fmt(t.common.inStock, { n: b.count })}</span>
                </span>
                <span className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-accent transition-transform duration-500 [transition-timing-function:cubic-bezier(.16,1,.3,1)] group-hover:scale-x-100" />
              </Link>
              </EngineHover>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
