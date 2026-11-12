import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema";

export type DB = BetterSQLite3Database<typeof schema>;

const globalForDb = globalThis as unknown as { __toyzDb?: DB };

function createDb(): DB {
  const dbPath = path.resolve(process.cwd(), process.env.DATABASE_PATH ?? "./data/toyz.db");
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle(sqlite, { schema });
  const migrationsFolder = path.resolve(process.cwd(), "drizzle");
  if (fs.existsSync(migrationsFolder)) {
    migrate(db, { migrationsFolder });
  }
  return db;
}

export const db: DB = globalForDb.__toyzDb ?? createDb();
if (process.env.NODE_ENV !== "production") globalForDb.__toyzDb = db;

export * from "./schema";
