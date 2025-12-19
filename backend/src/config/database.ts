import { Pool } from 'pg';

let pool: Pool;

export async function initDatabase(): Promise<void> {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  await pool.query('SELECT NOW()');
}

export function getPool(): Pool {
  if (!pool) throw new Error('Database not initialized');
  return pool;
}

export async function query(text: string, params?: any[]) {
  return getPool().query(text, params);
}
