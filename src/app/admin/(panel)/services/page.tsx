import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getServices } from "@/lib/queries";
import { Badge } from "@/components/ui/badge";

export default async function ServicesAdmin() {
  const rows = await getServices(false);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow">Atelier</p><h1 className="mt-2 font-display text-3xl font-light">Services</h1></div>
        <Link href="/admin/services/new" className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-white hover:bg-accent-2"><Plus className="size-4" /> Add service</Link>
      </div>
      <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
        {rows.map((sv) => (
          <li key={sv.id} className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="min-w-0"><p className="truncate font-medium">{sv.title} <span className="ml-2 font-mono text-[10px] text-muted">/services/{sv.slug}</span></p><p className="truncate text-[12.5px] text-muted">{sv.excerpt}</p></div>
            <div className="flex shrink-0 items-center gap-3">{!sv.published && <Badge tone="hidden">Hidden</Badge>}<Link href={`/admin/services/${sv.id}`} className="grid size-8 place-items-center rounded-md border border-line text-muted hover:text-ink"><Pencil className="size-3.5" /></Link></div>
          </li>
        ))}
      </ul>
    </div>
  );
}
