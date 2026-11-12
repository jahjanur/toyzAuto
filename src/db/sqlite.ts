import path from "node:path";
import { createRequire } from "node:module";

/**
 * Opens a SQLite file with whichever driver this server can run:
 *  - better-sqlite3 (native module), used when it is installed and loads (local Node 20 setups), or
 *  - node:sqlite, built into Node 22.13+, which needs no native build (used on hosts such as Hostinger,
 *    where better-sqlite3's prebuilt binary needs a newer glibc than the server has).
 * Both are exposed through the small better-sqlite3-style API that Drizzle's better-sqlite3 session uses.
 * Set SQLITE_DRIVER=node or SQLITE_DRIVER=better-sqlite3 to force one.
 */

type Params = unknown[];
type RunResult = { changes: number | bigint; lastInsertRowid: number | bigint };
type Reader = { all(...params: Params): unknown[]; get(...params: Params): unknown };
export type SqliteStatement = Reader & { run(...params: Params): RunResult; raw(): Reader };
export type SqliteClient = {
  prepare(sql: string): SqliteStatement;
  exec(sql: string): unknown;
  transaction(fn: (...args: never[]) => unknown): unknown;
  close(): unknown;
};
export type SqliteDriver = "better-sqlite3" | "node:sqlite";

type NodeStatement = {
  run(...params: Params): RunResult;
  all(...params: Params): unknown[];
  get(...params: Params): unknown;
  setReturnArrays(enabled: boolean): void;
};
type NodeDatabase = { prepare(sql: string): NodeStatement; exec(sql: string): void; close(): void; readonly isTransaction: boolean };
type NodeSqliteModule = { DatabaseSync: new (file: string) => NodeDatabase };

/** node:sqlite only binds numbers, strings, bigints, buffers and null. */
const bind = (params: Params) => params.map((v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v));
/** node:sqlite rows have a null prototype; hand out plain objects like better-sqlite3 does. */
const plain = (row: unknown) => (row && typeof row === "object" && !Array.isArray(row) ? { ...(row as object) } : row);

function openNodeSqlite(file: string): SqliteClient | null {
  const getBuiltin = (process as unknown as { getBuiltinModule?: (id: string) => unknown }).getBuiltinModule;
  const mod = getBuiltin?.call(process, "node:sqlite") as NodeSqliteModule | undefined;
  if (!mod?.DatabaseSync) return null;
  const db = new mod.DatabaseSync(file);

  return {
    prepare(sql) {
      const st = db.prepare(sql);
      const read = (arrays: boolean): Reader => ({
        all: (...p) => { st.setReturnArrays(arrays); const rows = st.all(...bind(p)); return arrays ? rows : rows.map(plain); },
        get: (...p) => { st.setReturnArrays(arrays); const row = st.get(...bind(p)); return arrays ? row : plain(row); },
      });
      const objects = read(false);
      return { run: (...p) => st.run(...bind(p)), all: objects.all, get: objects.get, raw: () => read(true) };
    },
    exec: (sql) => db.exec(sql),
    // Same shape as better-sqlite3's db.transaction(fn): callable, plus .deferred/.immediate/.exclusive.
    transaction(fn) {
      const run = (mode: string) => (...args: never[]) => {
        if (db.isTransaction) return fn(...args); // nested: Drizzle already uses savepoints
        db.exec(`BEGIN ${mode}`);
        try {
          const result = fn(...args);
          db.exec("COMMIT");
          return result;
        } catch (err) {
          if (db.isTransaction) db.exec("ROLLBACK");
          throw err;
        }
      };
      return Object.assign(run("DEFERRED"), { deferred: run("DEFERRED"), immediate: run("IMMEDIATE"), exclusive: run("EXCLUSIVE") });
    },
    close: () => db.close(),
  };
}

function openBetterSqlite(file: string): SqliteClient {
  // Loaded at runtime (not imported) so builds and hosts without the native module still work.
  const load = createRequire(path.join(/*turbopackIgnore: true*/ process.cwd(), "package.json"));
  const name = ["better", "sqlite3"].join("-");
  const Database = load(name) as new (f: string) => SqliteClient;
  return new Database(file);
}

export function openSqlite(file: string): { client: SqliteClient; driver: SqliteDriver } {
  const forced = process.env.SQLITE_DRIVER;
  let betterError: unknown = null;
  if (forced !== "node") {
    try {
      return { client: openBetterSqlite(file), driver: "better-sqlite3" };
    } catch (err) {
      if (forced === "better-sqlite3") throw err;
      betterError = err;
    }
  }
  const client = openNodeSqlite(file);
  if (client) return { client, driver: "node:sqlite" };
  const reason = betterError instanceof Error ? betterError.message : String(betterError ?? "not tried");
  throw new Error(`No SQLite driver available. better-sqlite3: ${reason}. node:sqlite needs Node 22.13 or newer (this is ${process.version}).`);
}
