import type { PoolConnection } from 'mysql2/promise';

export class MeetVenueQuoteRepository {
  static async supersede(meetId: number, conn: PoolConnection): Promise<void> {
    await conn.execute("UPDATE meetVenueQuote SET status = 'superseded', resolvedAt = NOW() WHERE meetId = ? AND status = 'offered'", [meetId]);
  }

}
