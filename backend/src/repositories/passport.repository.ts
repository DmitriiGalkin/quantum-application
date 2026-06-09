import { RowDataPacket } from 'mysql2/promise';
import pool from '../db.js';
import { ResultSetHeader } from 'mysql2/promise';

export interface PassportRow extends RowDataPacket {
  id: number;
  providerId: string;
  provider: string;
  accessToken: string;
  title: string | null;
  email: string;
}

class PassportRepository {
  // ✅ CREATE
  static async create(data: { providerId: string; provider: string; accessToken: string; title?: string | null; email: string }): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO passport 
       (providerId, provider, accessToken, title, email)
       VALUES (?, ?, ?, ?, ?)`,
      [data.providerId, data.provider, data.accessToken, data.title ?? null, data.email],
    );

    return result.insertId;
  }

  // ✅ UPDATE (title)
  static async update(id: number, data: { title?: string | null }): Promise<void> {
    await pool.query(
      `UPDATE passport
       SET title = COALESCE(?, title)
       WHERE id = ?`,
      [data.title, id],
    );
  }

  // ✅ UPDATE TOKEN
  static async updateTokenById(token: string, id: number): Promise<void> {
    await pool.query('UPDATE passport SET accessToken = ? WHERE id = ?', [token, id]);
  }

  // ✅ FIND BY ID
  static async findById(id: number): Promise<PassportRow | null> {
    const [rows] = await pool.query<PassportRow[]>('SELECT * FROM passport WHERE id = ?', [id]);

    return rows[0] ?? null;
  }

  // ✅ FIND BY EMAIL
  static async findByEmail(email: string): Promise<PassportRow | null> {
    const [rows] = await pool.query<PassportRow[]>('SELECT * FROM passport WHERE email = ?', [email]);

    return rows[0] ?? null;
  }

  // ✅ FIND BY TOKEN
  static async findByAccessToken(accessToken: string): Promise<PassportRow | null> {
    const [rows] = await pool.query<PassportRow[]>('SELECT * FROM passport WHERE accessToken = ?', [accessToken]);

    return rows[0] ?? null;
  }
}

export default PassportRepository;