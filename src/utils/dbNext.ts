import mysql, { type Pool, PoolConnection, type QueryResult, type ResultSetHeader } from 'mysql2/promise';

const RETRY_ERRORS = [
    'PROTOCOL_CONNECTION_LOST',
    'ECONNRESET',
    'ETIMEDOUT',
    'EPIPE',
];

export class DatabaseService {
  private pool: Pool;

  constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST ?? 'localhost',
      user: process.env.DB_USER ?? 'root',
      password: process.env.DB_PASSWORD ?? 'password',
      database: process.env.DB_DATABASE ?? 'my_database',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      namedPlaceholders: true,
    });
  }

  // 🔥 Универсальный retry wrapper
  private async retry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
    try {
      return await fn();
    } catch (err: any) {
      const shouldRetry = RETRY_ERRORS.includes(err.code);

      this.logError(err, { retriesLeft: retries });

      if (!shouldRetry || retries === 0) {
        throw err;
      }

      await this.delay(300);
      return this.retry(fn, retries - 1);
    }
  }

  // ✅ SELECT
  async query<T = any>(sql: string, params?: any): Promise<T[]> {
    return this.retry(async () => {
      const start = Date.now();

      const [rows] = await this.pool.query(sql, params);

      this.logQuery(sql, params, Date.now() - start);

      return rows as T[];
    });
  }

  // ✅ INSERT / UPDATE / DELETE
  async execute<T extends QueryResult = ResultSetHeader>(sql: string, params?: any): Promise<T> {
    return this.retry(async () => {
      const start = Date.now();

      const [result] = await this.pool.execute<T>(sql, params);

      this.logQuery(sql, params, Date.now() - start);

      return result;
    });
  }

  // 🔥 Транзакции
  async transaction<T>(fn: (conn: PoolConnection) => Promise<T>): Promise<T> {
    const connection = await this.pool.getConnection();

    try {
      await connection.beginTransaction();

      const result = await fn(connection);

      await connection.commit();

      return result;
    } catch (err) {
      await connection.rollback();
      this.logError(err, { type: 'transaction' });
      throw err;
    } finally {
      connection.release();
    }
  }

  // 🧠 delay для retry
  private delay(ms: number) {
    return new Promise(res => setTimeout(res, ms));
  }

  // 📊 логирование запросов
  private logQuery(_sql: string, _params: any, _duration: number) {
    //console.log('🟢 SQL:', sql);
    //if (params) console.log('📦 params:', params);
    //console.log('⏱ duration:', duration, 'ms');
  }

  // ❌ логирование ошибок
  private logError(err: any, context?: any) {
    console.error('🔴 DB ERROR:', {
      message: err.message,
      code: err.code,
      context,
    });
  }
}

export const db = new DatabaseService();