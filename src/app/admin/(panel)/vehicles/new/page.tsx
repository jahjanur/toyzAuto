import { getBrands } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { VehicleForm } from "@/components/admin/vehicle-form";

export default async function NewVehicle() {
  const [brands, s] = await Promise.all([getBrands(), getSettings()]);
  return <VehicleForm vehicle={null} images={[]} brands={brands} currency={s.currency} />;
}
