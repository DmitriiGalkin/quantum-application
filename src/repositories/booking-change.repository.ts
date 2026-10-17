import type { PoolConnection } from 'mysql2/promise';
import type { Meet } from 'entities';
export class BookingChangeRepository {
  static async create(previous: Meet, next: Meet, actor: number, reason: string, conn: PoolConnection) {
    await conn.execute(`INSERT INTO meetBookingChange (meetId,revision,oldPlaceId,oldLocationId,newPlaceId,newLocationId,actorPassportId,reason)
      VALUES (?,?,?,?,?,?,?,?)`,[previous.id,next.bookingRevision ?? 0,previous.placeId,previous.locationId,next.placeId,next.locationId,actor,reason]);
  }
}
