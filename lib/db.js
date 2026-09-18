import pg from 'pg';

const { Pool } = pg;

// Reuse a single pool across invocations (and across hot reloads in dev)
// instead of opening a new connection per request/serverless invocation.
const globalForDb = globalThis;

const pool =
  globalForDb.__priceAlatPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
    max: Number(process.env.PG_POOL_MAX ?? 10),
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.__priceAlatPool = pool;
}

export default pool;
