import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getInquiryCounts } from "@/lib/queries";
import { AdminShell } from "@/components/admin/shell";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · TOYZ Admin" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const counts = await getInquiryCounts();
  return <AdminShell user={session} newInquiries={counts.new ?? 0}>{children}</AdminShell>;
}
