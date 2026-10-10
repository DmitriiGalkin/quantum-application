import { db } from '../utils/dbNext.js';
import type { PlaceSchedule, PlaceScheduleDayDto } from 'entities';
import type { PoolConnection } from 'mysql2/promise';

export default class PlaceScheduleRepository {
  static async findByPlaceId(placeId: number): Promise<PlaceSchedule[]> {
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
