import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, services } from "@/db";
import { ServiceForm } from "@/components/admin/service-form";

export default async function EditService({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id === "new") return <ServiceForm service={null} />;
  const sv = db.select().from(services).where(eq(services.id, Number(id))).get();
  if (!sv) notFound();
  return <ServiceForm service={sv} />;
}
