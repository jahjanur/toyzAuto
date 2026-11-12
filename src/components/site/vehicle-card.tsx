"use client";

import Image from "next/image";
import Link from "@/components/i18n/link";
import { ArrowUpRight } from "lucide-react";
import type { VehicleWithRelations } from "@/db/schema";
import { formatKm, formatPrice, cn } from "@/lib/utils";
import { useI18n } from "@/i18n/client";
import { tv } from "@/i18n/content";
import { Badge } from "@/components/ui/badge";
import { isLandscape, nextLandscape } from "@/lib/images";
import { FramedImage } from "./framed-image";
import { FitText } from "@/components/ui/fit";

export function VehicleCard({ v, currency = "CAD", priority, className }: { v: VehicleWithRelations; currency?: string; priority?: boolean; className?: string }) {
  const { t, intl } = useI18n();
  const cover = v.images[0];
  const second = cover && isLandscape(cover) ? nextLandscape(v.images, cover) : undefined;
  const sold = v.status === "sold";
  return (
    <div className={cn("group relative overflow-hidden rounded-[20px] border border-line bg-surface card-hover", sold && "opacity-75", className)}>
    <Link href={`/inventory/${v.slug}`} className="flex h-full flex-col">
      <div className="relative aspect-[3/2] overflow-hidden bg-bg-2">
        {cover ? (
          <>
            <FramedImage mode="focus" img={cover} frame={1.5} alt={cover.alt ?? v.title} priority={priority} sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
              imgClassName={cn("transition-[transform,opacity] duration-[1.4s] [transition-timing-function:cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.05]", second && "md:group-hover:opacity-0", sold && "grayscale")} />
            {second && <Image src={second.url} alt="" fill placeholder={second.blurDataUrl ? "blur" : "empty"} blurDataURL={second.blurDataUrl ?? undefined} sizes="(max-width: 1280px) 50vw, 33vw" className="hidden object-cover opacity-0 scale-[1.08] transition-[transform,opacity] duration-[1.4s] [transition-timing-function:cubic-bezier(.16,1,.3,1)] md:block md:group-hover:opacity-100 md:group-hover:scale-100" />}
          </>
        ) : <div className="absolute inset-0 grid place-items-center font-mono text-xs uppercase text-muted-2">{t.common.noPhotos}</div>}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
        <div className="absolute left-4 top-4 flex gap-2">
          {v.status !== "available" && <Badge tone={v.status}>{t.status[v.status]}</Badge>}
          {v.condition === "New" && v.status === "available" && <Badge tone="accent">{t.common.newBadge}</Badge>}
        </div>
        <span className="absolute right-4 top-4 grid size-9 place-items-center rounded-full glass transition-all duration-500 group-hover:border-accent group-hover:bg-accent"><ArrowUpRight className="size-4" /></span>
        <p className="absolute bottom-4 left-4 font-mono text-[10px] uppercase tracking-[0.22em] text-accent-2">{v.brand?.name ?? "—"}</p>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="display text-[1.05rem] leading-[1.05] text-white"><FitText text={v.model} /></h3>
        <p className="mt-2 text-[12.5px] text-muted">{v.year} · {formatKm(v.mileageKm, intl)}{v.transmission ? ` · ${tv(t, "transmission", v.transmission)}` : ""}</p>
        <div className="mt-auto flex items-end justify-between pt-5">
          <p className={cn("text-[17px] font-semibold tracking-tight", sold ? "text-muted line-through" : "text-white")}>
            {v.priceOnRequest ? <span className="text-accent-2">{t.common.priceOnRequest}</span> : formatPrice(v.priceCents, currency, intl)}
          </p>
        </div>
      </div>
    </Link>
    </div>
  );
}
