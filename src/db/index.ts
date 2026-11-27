import { drizzle } from "drizzle-orm/node-postgres";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { Pool } from "pg";
import * as schema from "./schema";

export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

const globalForDb = globalThis as unknown as { pool?: Pool };

function getPool(): Pool {
  if (!globalForDb.pool) {
    globalForDb.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 10,
        // A database that accepts TCP but stalls in startup/auth would otherwise
        // hold a pool slot forever; repeated health probes can then exhaust it.
        connectionTimeoutMillis: 5_000,
      });
    // A pool emits "error" for idle clients that lose their connection. Without a listener
    // Node treats it as an unhandled error and exits; the health route now returns clients
    // to this pool, so that can happen in a process that only serves health checks.
    globalForDb.pool.on("error", (err) => {
      console.error("Postgres idle client error:", err);
    });
  }
  return globalForDb.pool;
}

export const pool = getPool();
export const pgDb = drizzle({ client: pool, schema });
export const db: Db = pgDb;
export { schema };
