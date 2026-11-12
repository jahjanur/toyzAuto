import "server-only";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { closeDb, databasePath, sqliteClient } from "@/db";
import { openSqlite } from "@/db/sqlite";

/** SQL string literal for a file path. */
const quote = (p: string) => `'${p.replace(/'/g, "''")}'`;
const SQLITE_HEADER = Buffer.from("SQLite format 3\0", "latin1");
const REQUIRED_TABLES = ["vehicles", "vehicle_images", "brands", "services", "users", "settings", "inquiries"];

/** Consistent copy of the live database, safe while the site is running. Returns a temp file the caller deletes. */
export function snapshotDatabase(): string {
  const out = path.join(/*turbopackIgnore: true*/ os.tmpdir(), `toyz-backup-${Date.now()}-${process.pid}.db`);
  sqliteClient().exec(`VACUUM INTO ${quote(out)}`);
  return out;
}

export type DatabaseSummary = { vehicles: number; users: number; owners: number };

/** Opens a database file read-only-style and checks it is an intact TOYZ database with someone who can sign in. */
function inspect(file: string): DatabaseSummary {
  const { client } = openSqlite(file);
  try {
    const check = client.prepare("PRAGMA integrity_check").get() as { integrity_check?: string } | undefined;
    if (check?.integrity_check !== "ok") throw new Error("The file is damaged (SQLite integrity check failed).");
    const tables = new Set((client.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all() as { name: string }[]).map((t) => t.name));
    const missing = REQUIRED_TABLES.filter((t) => !tables.has(t));
    if (missing.length) throw new Error(`This is not a TOYZ backup (missing: ${missing.join(", ")}).`);
    const count = (sql: string) => Number((client.prepare(sql).get() as { n: number }).n);
    const summary = {
      vehicles: count("SELECT count(*) AS n FROM vehicles"),
      users: count("SELECT count(*) AS n FROM users"),
      owners: count("SELECT count(*) AS n FROM users WHERE role = 'owner'"),
    };
    if (!summary.owners) throw new Error("The backup has no owner account, so nobody could sign in. Choose another backup.");
    // Fold any write-ahead log into the main file so a single file holds everything.
    client.exec("PRAGMA journal_mode = DELETE");
    return summary;
  } finally {
    client.close();
  }
}

/**
 * Replaces the live database with an uploaded backup.
 * The current database is kept next to it as toyz-before-restore-<date>.db, so nothing is lost.
 */
export function restoreDatabase(data: Buffer): DatabaseSummary & { safetyCopy: string } {
  if (data.length < 512 || !data.subarray(0, 16).equals(SQLITE_HEADER)) throw new Error("This is not a SQLite database file (.db).");
  const target = databasePath();
  const dir = path.dirname(target);
  fs.mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const incoming = path.join(dir, `.restore-${stamp}.db`);
  const removeSidecars = (f: string) => ["-wal", "-shm", "-journal"].forEach((ext) => fs.rmSync(f + ext, { force: true }));

  fs.writeFileSync(incoming, data);
  let summary: DatabaseSummary;
  try {
    summary = inspect(incoming);
  } catch (err) {
    fs.rmSync(incoming, { force: true });
    removeSidecars(incoming);
    throw err;
  }
  removeSidecars(incoming);

  // Safety copy of what is being replaced, then swap the files while no connection is open.
  const safetyCopy = path.join(dir, `toyz-before-restore-${stamp}.db`);
  if (fs.existsSync(target)) sqliteClient().exec(`VACUUM INTO ${quote(safetyCopy)}`);
  closeDb();
  removeSidecars(target);
  fs.renameSync(incoming, target);
  return { ...summary, safetyCopy };
}
