import { db } from '../utils/dbNext.js';
import type { PoolConnection, ResultSetHeader } from 'mysql2/promise';

class PlacePassportRepository {
  static async findMembership(passportId: number, placeId: number): Promise<{ id: number; role: 'admin' | 'teacher' } | null> {
    const rows = await db.query<{ id: number; role: 'admin' | 'teacher' }>(
      "SELECT id, role FROM placePassport WHERE passportId = ? AND placeId = ? ORDER BY role = 'admin' DESC LIMIT 1", [passportId, placeId],
    );
    return rows[0] ?? null;
  }
  static async create(data: { placeId: number; passportId: number; role: 'admin' | 'teacher' }, conn?: PoolConnection): Promise<number> {
    const result = await (conn ?? db).execute<ResultSetHeader>(
      `INSERT INTO placePassport (placeId, passportId, role)
       VALUES (?, ?, ?)`,
      [data.placeId, data.passportId, data.role],
    );

    return (Array.isArray(result) ? result[0] : result).insertId;
  }

  static async findTeachers(placeId: number): Promise<{ id: number, title: string }[]> {
    const rows = await db.query<{ id: number; title: string }>(
      `SELECT passport.id, passport.title
       FROM placePassport
       JOIN passport ON passport.id = placePassport.passportId
       WHERE placePassport.placeId = ?
         `, // AND placePassport.role = 'teacher'
      [placeId],
    );

    return rows;
  }

  static async removeTeacher(placeId: number, passportId: number) {
    await db.execute(
      `DELETE FROM placePassport
       WHERE placeId = ?
         AND passportId = ?
         AND role = 'teacher'`,
      [placeId, passportId],
    );
  }

  static async findAdminPlace(passportId: number): Promise<number | null> {
    const rows = await db.query(
      `SELECT placeId
     FROM placePassport
     WHERE passportId = ?
       AND role = 'admin'
     LIMIT 1`,
      [passportId],
    );

    return rows[0]?.placeId ?? null;
  }

  static async exists(passportId: number, placeId: number): Promise<number | boolean> {
    const rows = await db.query(
      `SELECT id
     FROM placePassport
     WHERE passportId = ?
       AND placeId = ?
     LIMIT 1`,
      [passportId, placeId],
    );

    return rows[0]?.id || false;
  }
}
export default PlacePassportRepository;

