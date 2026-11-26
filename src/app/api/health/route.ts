import type { PoolClient } from "pg";
import { pool } from "@/db";

// The platform's health check (`.railway/railway.ts` -> healthcheck) calls this.
// It asks Postgres as well, so a bad or unreachable DATABASE_URL fails the
// deploy rather than going live and then 500ing on every request.
export const dynamic = "force-dynamic";

const DEADLINE_MS = 5_000;

// statement_timeout bounds server-side execution, but the client can still
// wait forever for response packets. Bound each await independently.
function withDeadline<T>(promise: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("health probe timed out")), DEADLINE_MS);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

export async function GET() {
  let client: PoolClient | undefined;
  let healthy = false;
  try {
    client = await pool.connect();
    // connectionTimeoutMillis covers connection setup; the statement timeout
    // covers execution on this checked-out session. Neither leaks because the
    // client is discarded in finally.
    await withDeadline(client.query("SET statement_timeout = 5000"));
    await withDeadline(client.query("select 1"));
    healthy = true;
    return Response.json({ ok: true });
  } catch (err) {
    // Log the cause but keep the response minimal: the platform only needs to
    // know whether the database answered.
    console.error("Health check failed: the database didn't answer", err);
    return Response.json({ ok: false }, { status: 503 });
  } finally {
    // Reuse the client only after a completed probe. A failed or timed-out
    // probe can leave a query pending, so destroy that client.
    client?.release(!healthy);
  }
}
