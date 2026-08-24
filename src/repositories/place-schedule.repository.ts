import { db } from '../utils/dbNext.js';
import type { PlaceSchedule, PlaceScheduleDayDto } from 'entities';

export default class PlaceScheduleRepository {
  static async findByPlaceId(placeId: number): Promise<PlaceSchedule[]> {
    return db.query(
      `
            SELECT *
            FROM placeSchedule
            WHERE placeId = ?
            ORDER BY weekday
        `,
      [placeId],
    );
  }

  static async replace(placeId: number, schedule: PlaceScheduleDayDto[]) {
    await db.query('DELETE FROM placeSchedule WHERE placeId = ?', [placeId]);

    for (const day of schedule) {
      await db.query(
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