import { db } from '../dbNext.js';

class PlacePassportRepository {
  static async create(data: { placeId: number; passportId: number; role: 'admin' | 'teacher' }): Promise<number> {
    const result = await db.execute(
      `INSERT INTO placePassport (placeId, passportId, role)
       VALUES (?, ?, ?)`,
      [data.placeId, data.passportId, data.role],
    );

    return result.insertId;
  }

  static async findTeachers(placeId: number) {
    const rows = await db.query(
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
}
export default PlacePassportRepository;

