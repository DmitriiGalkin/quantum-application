import type { PoolConnection, RowDataPacket } from 'mysql2/promise';
import { db } from '../utils/dbNext.js';

export interface CampaignBookingRow extends RowDataPacket { meetUserId: number; campaignId: number; createdAt: string }

export default class ProjectCampaignBookingRepository {
  static async create(meetUserId: number, campaignId: number, conn: PoolConnection): Promise<void> {
    await conn.execute('INSERT INTO projectCampaignBooking (meetUserId, campaignId) VALUES (?, ?)', [meetUserId, campaignId]);
  }

  static async findByCampaignIds(ids: number[], days?: number): Promise<CampaignBookingRow[]> {
    if (!ids.length) return [];
    const sql = `SELECT * FROM projectCampaignBooking WHERE campaignId IN (?)${days ? ' AND createdAt >= NOW() - INTERVAL ? DAY' : ''}`;
    return db.query<CampaignBookingRow>(sql, days ? [ids, days] : [ids]);
  }
}
