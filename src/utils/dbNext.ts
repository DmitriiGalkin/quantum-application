import mysql, { type Pool, PoolConnection, type QueryResult, type ResultSetHeader, type RowDataPacket } from 'mysql2/promise';
import type { ExecuteValues } from 'mysql2';

const RETRY_ERRORS = ['PROTOCOL_CONNECTION_LOST', 'ECONNRESET', 'ETIMEDOUT', 'EPIPE'];

export class DatabaseService {
  private pool: Pool;

  constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST ?? 'localhost',
      user: process.env.DB_USER ?? 'root',
      password: process.env.DB_PASSWORD ?? 'password',
      database: process.env.DB_DATABASE ?? 'my_database',
      port: Number(process.env.DB_PORT || 3306),
      connectTimeout: 45000,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      namedPlaceholders: true,
    });
  }

  // Retry reads only: a disconnected write may already have been committed.
  private async retry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
    try {
      return await fn();
    } catch (err: unknown) {
      const shouldRetry = err instanceof Error && 'code' in err && typeof err.code === 'string' && RETRY_ERRORS.includes(err.code);

      this.logError(err, { retriesLeft: retries });

      if (!shouldRetry || retries === 0) {
        throw err;
      }

      await this.delay(300);
      return this.retry(fn, retries - 1);
    }
  }

  // ✅ SELECT
  async query<T = RowDataPacket>(sql: string, params?: unknown[]): Promise<T[]> {
    const read = async () => {
      const [rows] = await this.pool.query(sql, params);
      return rows as T[];
    };
    return /^\s*SELECT\b/i.test(sql) ? this.retry(read) : read();
  }

  // ✅ INSERT / UPDATE / DELETE
  async execute<T extends QueryResult = ResultSetHeader>(sql: string, params?: ExecuteValues[]): Promise<T> {
    try {
      const [result] = await this.pool.execute<T>(sql, params);
      return result;
    } catch (error) {
      this.logError(error, { type: 'write' });
      throw error;
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  async transaction<T>(fn: (conn: PoolConnection) => Promise<T>): Promise<T> {
    const connection = await this.pool.getConnection();

    try {
      await connection.beginTransaction();

      const result = await fn(connection);

      await connection.commit();

      return result;
    } catch (err) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        this.logError(rollbackError, { type: 'rollback' });
      }
      this.logError(err, { type: 'transaction' });
      throw err;
    } finally {
      connection.release();
    }
  }

  private delay(ms: number) {
    return new Promise(res => setTimeout(res, ms));
  }

  private logError(err: unknown, context?: Record<string, unknown>) {
    console.error('🔴 DB ERROR:', {
      message: err instanceof Error ? err.message : String(err),
      code: err instanceof Error && 'code' in err ? err.code : undefined,
      context,
    });
  }
}

export const db = new DatabaseService();
