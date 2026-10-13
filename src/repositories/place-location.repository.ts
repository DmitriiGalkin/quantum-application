import type { PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { db } from '../utils/dbNext.js';
import type { PlaceLocation, UpdateLocation } from 'entities';

const room = (row: PlaceLocation): PlaceLocation => ({ ...row, description: row.description ?? null,
  capacity: row.capacity == null ? null : Number(row.capacity),
  hourlyRate: row.hourlyRate == null ? null : Number(row.hourlyRate), rentalEnabled: Boolean(row.rentalEnabled) });

class PlaceLocationRepository {
  static async lockByIds(ids: number[], conn: PoolConnection): Promise<void> {
    for (const id of [...new Set(ids)].sort((a, b) => a - b)) {
      await conn.query('SELECT id FROM placeLocation WHERE id = ? FOR UPDATE', [id]);
    }
  }
  static async findByIds(ids: number[], conn?: PoolConnection): Promise<PlaceLocation[]> {
    if (!ids.length) return [];
    if (conn) return (await conn.query<(RowDataPacket & PlaceLocation)[]>(
      'SELECT * FROM placeLocation WHERE id IN (?)', [[...new Set(ids)]],
    ))[0].map(room);
    return (await db.query<PlaceLocation>('SELECT * FROM placeLocation WHERE id IN (?)', [[...new Set(ids)]])).map(room);
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

  static async findLocations(placeId: number): Promise<PlaceLocation[]> {
    const rows = await db.query<PlaceLocation>(
      `SELECT *
       FROM placeLocation
       WHERE placeLocation.placeId = ? AND deletedAt IS NULL ORDER BY id`,
      [placeId],
    );

    return rows.map(room);
  }

  static async update(id: number, data: Omit<UpdateLocation, 'photoUrls'>, conn: PoolConnection): Promise<void> {
    await conn.execute('UPDATE placeLocation SET title = ?, description = ?, capacity = ?, hourlyRate = ?, rentalEnabled = ? WHERE id = ?',
      [data.title, data.description, data.capacity, data.hourlyRate, data.rentalEnabled, id]);
  }

  // ✅ DELETE (soft)
  static async delete(id: number, conn?: PoolConnection): Promise<void> {
    await (conn ?? db).execute(`UPDATE placeLocation SET deletedAt = CURRENT_TIMESTAMP() WHERE id = ?`, [id]);
  }
}
export default PlaceLocationRepository;

