import Link from "next/link";
import Image from "next/image";
import { desc, asc, like, or, eq, and, type SQL } from "drizzle-orm";
import { Plus, Pencil, Eye } from "lucide-react";
import { db, vehicles, VEHICLE_STATUSES } from "@/db";
import { getSettings } from "@/lib/settings";
import { formatPrice, formatKm, STATUS_LABEL, timeAgo, cn } from "@/lib/utils";
import { FeaturedToggle, StatusSelect } from "@/components/admin/vehicle-row-controls";
import { Badge } from "@/components/ui/badge";

export default async function VehiclesAdmin({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const { q, status } = await searchParams;
  const s = await getSettings();
  const where: SQL[] = [];
  if (q) where.push(or(like(vehicles.title, `%${q}%`), like(vehicles.model, `%${q}%`))!);
  if (status && (VEHICLE_STATUSES as readonly string[]).includes(status)) where.push(eq(vehicles.status, status as (typeof VEHICLE_STATUSES)[number]));
  const rows = await db.query.vehicles.findMany({ where: where.length ? and(...where) : undefined, with: { brand: true, images: { limit: 1, orderBy: (i, { asc }) => [asc(i.sortOrder)] } }, orderBy: [asc(vehicles.sortOrder), desc(vehicles.createdAt)] });
  const counts = Object.fromEntries(db.select({ s: vehicles.status, n: vehicles.id }).from(vehicles).all().reduce((m, r) => m.set(r.s, (m.get(r.s) ?? 0) + 1), new Map<string, number>()));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow">Inventory</p><h1 className="mt-2 font-display text-3xl font-light">Vehicles <span className="text-muted">({rows.length})</span></h1></div>
        <Link href="/admin/vehicles/new" className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-white hover:bg-accent-2"><Plus className="size-4" /> Add vehicle</Link>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <form className="relative"><input name="q" defaultValue={q} placeholder="Search…" className="input h-10 w-56" />{status && <input type="hidden" name="status" value={status} />}</form>
        <div className="flex flex-wrap gap-1.5">
          <Link href="/admin/vehicles" className={cn("rounded-full border px-3 py-1.5 text-[12px]", !status ? "border-accent text-accent-2" : "border-line text-ink-2")}>All</Link>
          {VEHICLE_STATUSES.map((st) => <Link key={st} href={`/admin/vehicles?status=${st}`} className={cn("rounded-full border px-3 py-1.5 text-[12px]", status === st ? "border-accent text-accent-2" : "border-line text-ink-2")}>{STATUS_LABEL[st]} <span className="text-muted-2">{counts[st] ?? 0}</span></Link>)}
        </div>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
        <table className="w-full min-w-[860px] text-left text-[13px]">
          <thead className="border-b border-line font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            <tr><th className="px-4 py-3">Vehicle</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Specs</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Featured</th><th className="px-4 py-3">Views</th><th className="px-4 py-3">Updated</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((v) => (
              <tr key={v.id} className="hover:bg-white/[.02]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-bg-2">{v.images[0] && <Image src={v.images[0].url} alt="" fill sizes="64px" className="object-cover" />}</div>
                    <div className="min-w-0"><Link href={`/admin/vehicles/${v.id}`} className="block truncate font-medium hover:text-accent">{v.title}</Link><p className="text-[11.5px] text-muted">{v.brand?.name ?? "No brand"} · {v.images.length ? "photos" : "no photos"}</p></div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{v.priceOnRequest ? <span className="text-accent-2">On request</span> : formatPrice(v.priceCents, s.currency)}</td>
                <td className="px-4 py-3 text-muted whitespace-nowrap">{v.year} · {formatKm(v.mileageKm)} · {v.transmission ?? "—"}</td>
                <td className="px-4 py-3">
                  <StatusSelect id={v.id} status={v.status} />
                </td>
                <td className="px-4 py-3">
                  <FeaturedToggle id={v.id} featured={v.featured} />
                </td>
                <td className="px-4 py-3 text-muted">{v.views}</td>
                <td className="px-4 py-3 text-muted whitespace-nowrap">{timeAgo(v.updatedAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <a href={`/inventory/${v.slug}`} target="_blank" className="grid size-8 place-items-center rounded-md border border-line text-muted hover:text-ink" aria-label="View"><Eye className="size-3.5" /></a>
                    <Link href={`/admin/vehicles/${v.id}`} className="grid size-8 place-items-center rounded-md border border-line text-muted hover:text-ink" aria-label="Edit"><Pencil className="size-3.5" /></Link>
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={8} className="px-4 py-10 text-center text-muted">No vehicles found.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-2 text-[11.5px] text-muted"><Badge tone="available">Available</Badge> shown publicly · <Badge tone="reserved">Reserved</Badge> shown with badge · <Badge tone="sold">Sold</Badge> shown only when visitors tick “include sold” · <Badge tone="hidden">Hidden</Badge> never shown</div>
    </div>
  );
}
