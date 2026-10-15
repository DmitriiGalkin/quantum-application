import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { db } from '../utils/dbNext.js';

import type { PassportRow, Passport, CreatePassportInput, UpdatePassportInput } from 'entities';
import { toPassport } from '../mappers/passport.mapper.js';

class PassportRepository {
  static async inspectDirectory(conn: PoolConnection): Promise<Pick<PassportRow, 'id' | 'title' | 'image' | 'provider' | 'providerId'>[]> {
    const [rows] = await conn.query<(RowDataPacket & Pick<PassportRow, 'id' | 'title' | 'image' | 'provider' | 'providerId'>)[]>(
      'SELECT id, title, image, provider, providerId FROM passport FOR UPDATE');
    return rows;
  }
  static async inspectSeedRows(conn: PoolConnection): Promise<Record<string, unknown>[]> {
    const [rows] = await conn.query<RowDataPacket[]>('SELECT * FROM passport FOR UPDATE');
    return rows;
  }

  static async removeSeedRows(ids: number[], conn: PoolConnection): Promise<void> {
    if (ids.length) await conn.query('DELETE FROM passport WHERE id IN (?)', [ids]);
  }

  static async lockByIds(ids: number[], conn: PoolConnection): Promise<void> {
    await conn.query('SELECT id FROM passport WHERE id IN (?) ORDER BY id FOR UPDATE', [ids]);
  }
  static async findByIds(ids: number[]): Promise<Passport[]> {
    if (!ids.length) return [];
    const rows = await db.query<PassportRow>(
      'SELECT * FROM passport WHERE id IN (?)',
      [[...new Set(ids)]],
    );
    return rows.map(toPassport);
  }

  // ✅ CREATE
  static async create(data: CreatePassportInput, conn?: PoolConnection): Promise<number> {
    const result = await (conn ?? db).execute<ResultSetHeader>(
      `INSERT INTO passport
         (providerId, provider, accessToken, title, email, image, description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [data.providerId, data.provider, data.accessToken, data.title ?? null, data.email, data.image, data.description ?? null],
    );

    return (Array.isArray(result) ? result[0] : result).insertId;
  }

  // ✅ UPDATE
  static async update(id: number, data: UpdatePassportInput, conn?: PoolConnection): Promise<boolean> {
    const keys = ['title', 'description', 'image'] as const;
    const entries = keys.filter(key => data[key] !== undefined).map(key => [key, data[key]] as const);

    if (entries.length === 0) return false;

    const fields = entries.map(([k]) => `${k} = ?`).join(', ');
    const values = entries.map(([, v]) => v ?? null);

    const result = await (conn ?? db).execute<ResultSetHeader>(`UPDATE passport SET ${fields} WHERE id = ?`, [...values, id]);

    return (Array.isArray(result) ? result[0] : result).affectedRows > 0;
  }

  // ✅ UPDATE TOKEN (оставляем отдельно — это нормально)
  static async updateTokenById(token: string, id: number): Promise<boolean> {
    const result = await db.execute<ResultSetHeader>(`UPDATE passport SET accessToken = ? WHERE id = ?`, [token, id]);

    return result.affectedRows > 0;
  }

  // ✅ FIND BY ID
  static async findById(id: number): Promise<Passport | null> {
    const rows = await db.query<PassportRow>(`SELECT * FROM passport WHERE id = ?`, [id]);

    return rows[0] ? toPassport(rows[0]) : null;
  }

  // ✅ FIND BY EMAIL
  static async findByEmail(email: string): Promise<Passport | null> {
    const rows = await db.query<PassportRow>(`SELECT * FROM passport WHERE email = ?`, [email]);

    return rows[0] ? toPassport(rows[0]) : null;
  }

  // ✅ FIND BY TOKEN
  static async findByAccessToken(accessToken: string): Promise<Passport | null> {
    const rows = await db.query<PassportRow>(`SELECT * FROM passport WHERE accessToken = ?`, [accessToken]);

    return rows[0] ? toPassport(rows[0]) : null;
  }
}

export default PassportRepository;
