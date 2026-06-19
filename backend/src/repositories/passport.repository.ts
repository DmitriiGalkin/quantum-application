import { db } from '../dbNext.js';
import { ResultSetHeader } from 'mysql2/promise';

import { PassportRow } from '../entities/passport.db.js';
import { toPassport } from '../mappers/passport.mapper.js';

import { Passport } from '../entities/passport.js';
import { CreatePassportInput, UpdatePassportInput } from '../entities/passport.types.js';

class PassportRepository {
  // ✅ CREATE
  static async create(data: CreatePassportInput): Promise<number> {
    const result = await db.execute<ResultSetHeader>(
      `INSERT INTO passport
         (providerId, provider, accessToken, title, email)
       VALUES (?, ?, ?, ?, ?)`,
      [data.providerId, data.provider, data.accessToken, data.title ?? null, data.email],
    );

    return result.insertId;
  }

  // ✅ UPDATE
  static async update(id: number, data: UpdatePassportInput): Promise<boolean> {
    const entries = Object.entries(data).filter(([, v]) => v !== undefined);

    if (entries.length === 0) return false;

    const fields = entries.map(([k]) => `${k} = ?`).join(', ');
    const values = entries.map(([, v]) => v);

    const result = await db.execute<ResultSetHeader>(`UPDATE passport SET ${fields} WHERE id = ?`, [...values, id]);

    return result.affectedRows > 0;
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
