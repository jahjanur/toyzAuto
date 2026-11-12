import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema";

export type DB = BetterSQLite3Database<typeof schema>;

const globalForDb = globalThis as unknown as { __toyzDb?: DB };

function createDb(): DB {
  // Runtime data, not part of the build: tell the bundler not to trace these paths.
  const dbPath = path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.DATABASE_PATH ?? "./data/toyz.db");
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle(sqlite, { schema });
  const migrationsFolder = path.resolve(/*turbopackIgnore: true*/ process.cwd(), "drizzle");
  if (fs.existsSync(migrationsFolder)) {
    migrate(db, { migrationsFolder });
  } else {
    console.warn(`[db] No migrations folder at ${migrationsFolder}; the schema was not updated.`);
  }
  bootstrapOwner(db);
  return db;
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

export const db: DB = new Proxy({} as DB, {
  get(_target, prop) {
    const real = getDb();
    const value = Reflect.get(real, prop, real);
    return typeof value === "function" ? value.bind(real) : value;
  },
});

export * from "./schema";
