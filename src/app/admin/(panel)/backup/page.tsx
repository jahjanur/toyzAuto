import fs from "node:fs";
import { sql } from "drizzle-orm";
import { Download } from "lucide-react";
import { databasePath, db, inquiries, users, vehicles } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { Card } from "@/components/admin/ui";
import { RestoreForm } from "@/components/admin/backup-forms";

export const metadata = { title: "Backup & restore" };

export default async function BackupAdmin() {
  const session = await requireAdmin();
  const owner = session.role === "owner";
  const count = (table: typeof vehicles | typeof users | typeof inquiries) => db.select({ n: sql<number>`count(*)` }).from(table).get()?.n ?? 0;
  const file = databasePath();
  const size = fs.existsSync(file) ? fs.statSync(file).size : 0;
  const stats = [
    { label: "Vehicles", value: count(vehicles) },
    { label: "Inquiries", value: count(inquiries) },
    { label: "Users", value: count(users) },
    { label: "File size", value: `${Math.max(1, Math.round(size / 1024))} KB` },
  ];

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <p className="eyebrow">Data</p>
        <h1 className="mt-2 font-display text-3xl font-light">Backup & restore</h1>
        <p className="mt-2 text-[13.5px] text-muted">Everything the admin manages (cars, services, inquiries, settings, users) lives in one database file. Download a copy regularly, and restore one to move or recover the site.</p>
      </div>

      <Card title="This database">
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-line bg-bg-2 p-3">
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">{s.label}</dt>
              <dd className="mt-1 font-display text-xl">{s.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 break-all font-mono text-[11.5px] text-muted">{file}</p>
      </Card>

      {owner ? (
        <>
          <Card title="Download a backup" description="A complete copy of the database as a .db file. Keep it somewhere safe.">
            <a href="/admin/backup/download" download className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-white hover:bg-accent-2">
              <Download className="size-4" /> Download backup
            </a>
          </Card>
          <Card title="Restore a backup" description="Replaces everything with the contents of a backup file. The current database is kept on the server as a safety copy. You will be signed out; sign in again with an account from the backup.">
            <RestoreForm />
          </Card>
        </>
      ) : (
        <p className="rounded-xl border border-line bg-surface p-4 text-[13px] text-muted">Only the owner can download or restore backups.</p>
      )}
    </div>
  );
}
