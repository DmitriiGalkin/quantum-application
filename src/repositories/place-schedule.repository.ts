import { db } from '../dbNext.js';
import { PlaceSchedule } from '../entities/place-schedule.db.js';
import { PlaceScheduleDayDto } from 'dto';

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