import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { createTableRelationsHelpers, extractTablesRelationalConfig } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { BetterSQLiteSession } from "drizzle-orm/better-sqlite3/session";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { BaseSQLiteDatabase, SQLiteSyncDialect } from "drizzle-orm/sqlite-core";
import * as schema from "./schema";
import { openSqlite, type SqliteClient } from "./sqlite";

export type DB = BetterSQLite3Database<typeof schema>;

const globalForDb = globalThis as unknown as { __toyzDb?: DB; __toyzClient?: SqliteClient };

/** Absolute path of the live database file (DATABASE_PATH, default ./data/toyz.db). */
export function databasePath(): string {
  // Runtime data, not part of the build: tell the bundler not to trace these paths.
  return path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.DATABASE_PATH ?? "./data/toyz.db");
}

function createDb(): DB {
  const dbPath = databasePath();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const { client, driver } = openSqlite(dbPath);
  client.exec("PRAGMA journal_mode = WAL");
  client.exec("PRAGMA foreign_keys = ON");
  console.log(`[db] SQLite (${driver}) at ${dbPath}`);
  globalForDb.__toyzClient = client;
  const db = drizzleFor(client);
  const migrationsFolder = path.resolve(/*turbopackIgnore: true*/ process.cwd(), "drizzle");
  if (fs.existsSync(migrationsFolder)) {
    migrate(db, { migrationsFolder });
  } else {
    console.warn(`[db] No migrations folder at ${migrationsFolder}; the schema was not updated.`);
  }
  bootstrapOwner(db);
  return db;
}

/**
 * Same setup as drizzle(client, { schema }) from "drizzle-orm/better-sqlite3", but without importing that entry,
 * which loads the better-sqlite3 native module even when another driver is used.
 */
function drizzleFor(client: SqliteClient): DB {
  const dialect = new SQLiteSyncDialect();
  const tables = extractTablesRelationalConfig(schema, createTableRelationsHelpers);
  const relational = { fullSchema: schema, schema: tables.tables, tableNamesMap: tables.tableNamesMap };
  // The session only calls prepare/run/all/get/raw/transaction, which both drivers provide.
  const session = new BetterSQLiteSession(client as never, dialect, relational);
  return new BaseSQLiteDatabase("sync", dialect, session as never, relational as never) as unknown as DB;
}

/** On a brand-new database, create the owner account from ADMIN_EMAIL / ADMIN_PASSWORD so someone can sign in. */
function bootstrapOwner(db: DB) {
  try {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password || password.length < 8) return;
    if (db.select({ id: schema.users.id }).from(schema.users).limit(1).get()) return;
    db.insert(schema.users).values({ email, name: "Administrator", passwordHash: bcrypt.hashSync(password, 11), role: "owner" }).run();
    console.log(`[db] Created owner account ${email}.`);
  } catch (e) {
    console.error("[db] Could not create the owner account:", e);
  }
}

/** Opens the database on first use (not on import), so `next build` never touches the live database. */
function getDb(): DB {
  if (!globalForDb.__toyzDb) globalForDb.__toyzDb = createDb();
  return globalForDb.__toyzDb;
}

/** The open SQLite connection (opens it if needed). Used for backups. */
export function sqliteClient(): SqliteClient {
  getDb();
  return globalForDb.__toyzClient!;
}

/** Closes the connection; the next query reopens the file (and applies migrations). Used when restoring a backup. */
export function closeDb() {
  try { globalForDb.__toyzClient?.close(); } catch { /* already closed */ }
  globalForDb.__toyzClient = undefined;
  globalForDb.__toyzDb = undefined;
}

export const db: DB = new Proxy({} as DB, {
  get(_target, prop) {
    const real = getDb();
    const value = Reflect.get(real, prop, real);
    return typeof value === "function" ? value.bind(real) : value;
  },
});

export * from "./schema";
