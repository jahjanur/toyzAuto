import { db, users } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { AccountForms } from "@/components/admin/account-forms";

export default async function AccountAdmin() {
  const session = await requireAdmin();
  const list = db.select({ id: users.id, email: users.email, name: users.name, role: users.role, lastLoginAt: users.lastLoginAt }).from(users).all();
  return <AccountForms session={session} users={list.map((u) => ({ ...u, lastLoginAt: u.lastLoginAt ? u.lastLoginAt.getTime() : null }))} />;
}
