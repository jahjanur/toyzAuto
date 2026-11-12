// Applies pending Drizzle migrations to the SQLite database (the app also does this on boot).
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
const file = path.resolve(process.env.DATABASE_PATH ?? "./data/toyz.db");
const sqlite = new Database(file);
migrate(drizzle(sqlite), { migrationsFolder: path.resolve("drizzle") });
console.log("migrations applied to", file);
