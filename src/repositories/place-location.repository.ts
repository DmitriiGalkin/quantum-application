import type { PoolConnection, RowDataPacket } from 'mysql2/promise';
import { db } from '../utils/dbNext.js';

class PlaceLocationRepository {
  static async inspectSeedRows(conn: PoolConnection): Promise<Record<string, unknown>[]> {
    const [rows] = await conn.query<RowDataPacket[]>('SELECT * FROM placeLocation FOR UPDATE');
    return rows;
  }

  static async create(data: { placeId: number; title: string }): Promise<number> {
    const result = await db.execute(
      `INSERT INTO placeLocation (placeId, title)
       VALUES (?, ?)`,
      [data.placeId, data.title],
    );

    return result.insertId;
  }

  static async findLocations(placeId: number): Promise<{ id: number; title: string; placeId: number; deletedAt: string | null }[]> {
    const rows = await db.query<{ id: number; title: string; placeId: number; deletedAt: string | null }>(
      `SELECT *
       FROM placeLocation
       WHERE placeLocation.placeId = ?`,
      [placeId],
    );

    return rows;
  }

  // ✅ DELETE (soft)
  static async delete(id: number): Promise<void> {
    await db.execute(`UPDATE placeLocation SET deletedAt = CURRENT_TIMESTAMP() WHERE id = ?`, [id]);
  }
}
export default PlaceLocationRepository;

