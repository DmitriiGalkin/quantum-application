import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { db } from '../utils/dbNext.js';
import type { PlaceSchedule, PlaceScheduleDayDto } from 'entities';

export default class PlaceScheduleRepository {
  static async saveSeedDay(id: number | undefined, placeId: number, day: PlaceScheduleDayDto, conn: PoolConnection): Promise<number> {
    const values = [placeId, day.weekday, day.enabled, day.startTime, day.endTime];
    if (id !== undefined) {
      await conn.execute('UPDATE placeSchedule SET placeId = ?, weekday = ?, enabled = ?, startTime = ?, endTime = ? WHERE id = ?', [...values, id]);
      return id;
    }
    const [result] = await conn.execute<ResultSetHeader>('INSERT INTO placeSchedule (placeId, weekday, enabled, startTime, endTime) VALUES (?, ?, ?, ?, ?)', values);
    return result.insertId;
  }
  static async inspectSeedRows(conn: PoolConnection): Promise<Record<string, unknown>[]> {
    const [rows] = await conn.query<RowDataPacket[]>('SELECT * FROM placeSchedule FOR UPDATE');
    return rows;
  }

  static async removeSeedRows(ids: number[], conn: PoolConnection): Promise<void> {
    if (ids.length) await conn.query('DELETE FROM placeSchedule WHERE id IN (?)', [ids]);
  }

  static async findByPlaceId(placeId: number, conn?: PoolConnection): Promise<PlaceSchedule[]> {
    if (conn) return (await conn.query<(PlaceSchedule & RowDataPacket)[]>('SELECT * FROM placeSchedule WHERE placeId = ? ORDER BY weekday', [placeId]))[0];
    return db.query<PlaceSchedule>(
      `
            SELECT *
            FROM placeSchedule
            WHERE placeId = ?
            ORDER BY weekday
        `,
      [placeId],
    );
  }

  static async replace(placeId: number, schedule: PlaceScheduleDayDto[], conn: PoolConnection) {
    await conn.execute('DELETE FROM placeSchedule WHERE placeId = ?', [placeId]);

    for (const day of schedule) {
      await conn.execute(
        `
            INSERT INTO placeSchedule
            (
                placeId,
                weekday,
                enabled,
                startTime,
                endTime
            )
            VALUES (?, ?, ?, ?, ?)
        `,
        [placeId, day.weekday, day.enabled, day.startTime, day.endTime],
      );
    }
  }
}
