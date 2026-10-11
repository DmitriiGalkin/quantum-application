import 'dotenv/config';
import mysql from 'mysql2/promise';
import { createConnection } from 'node:net';

/** Shared lock, Moscow time and rollback; disconnected writes are never retried. */
export async function withDemoConnection<T>(operation: (conn: mysql.PoolConnection) => Promise<T>): Promise<T> {
  for (const key of ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_DATABASE']) if (process.env[key] === undefined) throw new Error(`Missing ${key}`);
  const pool = mysql.createPool({ host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE, port: Number(process.env.DB_PORT || 3306), timezone: '+03:00', connectTimeout: 120000, connectionLimit: 1,
    stream: () => createConnection({ host: process.env.DB_HOST!, port: Number(process.env.DB_PORT || 3306) }),
  });
  let conn: mysql.PoolConnection | undefined;
  let locked = false;
  try {
    conn = await pool.getConnection();
    await conn.query("SET time_zone = '+03:00'");
    const [rows] = await conn.query<(mysql.RowDataPacket & { acquired: number })[]>('SELECT GET_LOCK(?, 10) AS acquired', ['quantum:demo-seed']);
    if (rows[0].acquired !== 1) throw new Error('Demo lock unavailable');
    locked = true;
    await conn.query('SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE');
    return await operation(conn);
  } finally {
    if (conn) {
      await conn.rollback().catch(() => undefined);
      if (locked) await conn.query('SELECT RELEASE_LOCK(?)', ['quantum:demo-seed']).catch(() => undefined);
      conn.release();
    }
    await pool.end();
  }
}

export function reportCliError(error: unknown): void {
  console.error(error instanceof Error && 'code' in error ? String(error.code) : error instanceof Error ? error.message : 'Unknown error');
  process.exitCode = 1;
}
