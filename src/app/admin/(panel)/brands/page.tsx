import { getBrandsWithCounts } from "@/lib/queries";
import { BrandRow, NewBrandForm } from "@/components/admin/brand-forms";
import { hoverSoundFor } from "@/lib/sounds";

export default async function BrandsAdmin() {
  const rows = await getBrandsWithCounts();
  return (
    <div className="max-w-3xl space-y-6">
      <div><p className="eyebrow">Taxonomy</p><h1 className="mt-2 font-display text-3xl font-light">Brands</h1><p className="mt-2 text-sm text-muted">Brands power the inventory filters and the marquee on the homepage. Only brands with live vehicles are shown publicly.</p></div>
      <NewBrandForm />
      <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
        {rows.map((b) => <BrandRow key={b.id} brand={{ ...b, defaultSound: hoverSoundFor({ slug: b.slug }) }} />)}
      </ul>
    </div>
  );
}
