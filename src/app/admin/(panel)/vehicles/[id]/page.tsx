import { notFound } from "next/navigation";
import { eq, asc } from "drizzle-orm";
import { db, vehicles, vehicleImages } from "@/db";
import { getBrands } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { VehicleForm } from "@/components/admin/vehicle-form";

export default async function EditVehicle({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isFinite(id)) notFound();
  const v = db.select().from(vehicles).where(eq(vehicles.id, id)).get();
  if (!v) notFound();
  const [images, brands, s] = await Promise.all([
    db.select().from(vehicleImages).where(eq(vehicleImages.vehicleId, id)).orderBy(asc(vehicleImages.sortOrder)).all(),
    getBrands(), getSettings(),
  ]);
  return <VehicleForm key={v.id} vehicle={v} images={images} brands={brands} currency={s.currency} />;
}
