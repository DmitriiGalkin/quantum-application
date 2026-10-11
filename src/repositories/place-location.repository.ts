import type { PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { db } from '../utils/dbNext.js';

class PlaceLocationRepository {
  static async lockByIds(ids: number[], conn: PoolConnection): Promise<void> {
    for (const id of [...new Set(ids)].sort((a, b) => a - b)) {
      await conn.query('SELECT id FROM placeLocation WHERE id = ? FOR UPDATE', [id]);
    }
  }
  static async findByIds(ids: number[], conn?: PoolConnection): Promise<{ id: number; title: string; placeId: number; deletedAt: string | null }[]> {
    if (!ids.length) return [];
    if (conn) return (await conn.query<(RowDataPacket & { id: number; title: string; placeId: number; deletedAt: string | null })[]>(
      'SELECT * FROM placeLocation WHERE id IN (?)', [[...new Set(ids)]],
    ))[0];
    return db.query('SELECT * FROM placeLocation WHERE id IN (?)', [[...new Set(ids)]]);
  }

  static async inspectSeedRows(conn: PoolConnection): Promise<Record<string, unknown>[]> {
    const [rows] = await conn.query<RowDataPacket[]>('SELECT * FROM placeLocation FOR UPDATE');
    return rows;
  }

  static async create(data: { placeId: number; title: string }, conn?: PoolConnection): Promise<number> {
    const result = await (conn ?? db).execute<ResultSetHeader>(
      `INSERT INTO placeLocation (placeId, title)
       VALUES (?, ?)`,
      [data.placeId, data.title],
    );

    return (Array.isArray(result) ? result[0] : result).insertId;
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

