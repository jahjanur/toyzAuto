import fs from "node:fs";
import { getSession } from "@/lib/auth";
import { snapshotDatabase } from "@/lib/backup";

export const dynamic = "force-dynamic";

/** Owner only: download a consistent copy of the live database. */
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "owner") return new Response("Only the owner can download backups.", { status: 403 });
  const file = snapshotDatabase();
  try {
    const data = fs.readFileSync(file);
    const date = new Date().toISOString().slice(0, 10);
    return new Response(new Uint8Array(data), {
      headers: {
        "content-type": "application/vnd.sqlite3",
        "content-disposition": `attachment; filename="toyz-backup-${date}.db"`,
        "cache-control": "no-store",
      },
    });
  } finally {
    fs.rmSync(file, { force: true });
  }
}
