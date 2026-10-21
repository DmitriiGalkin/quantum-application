import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { db } from '../utils/dbNext.js';

interface VisitRow extends RowDataPacket { campaignId: number; visitedAt: string }

export default class ProjectCampaignVisitRepository {
  static async record(campaignId: number, visitorId: string): Promise<void> {
    await db.execute<ResultSetHeader>(
      'INSERT INTO projectCampaignVisit (campaignId, visitorId, visitedOn) VALUES (?, ?, CURRENT_DATE()) ON DUPLICATE KEY UPDATE visitedAt = CURRENT_TIMESTAMP',
      [campaignId, visitorId],
    );
  }

  static async latestForCampaigns(visitorId: string, campaignIds: number[], conn: import('mysql2/promise').PoolConnection): Promise<number | null> {
    if (!campaignIds.length) return null;
    const [rows] = await conn.query<(RowDataPacket & { campaignId: number })[]>(
      `SELECT campaignId FROM projectCampaignVisit
       WHERE visitorId = ? AND campaignId IN (?) AND visitedAt >= NOW() - INTERVAL 7 DAY
       ORDER BY visitedAt DESC, id DESC LIMIT 1`, [visitorId, campaignIds],
    );
    return rows[0]?.campaignId ?? null;
  }

  static async findByCampaignIds(ids: number[], days?: number): Promise<VisitRow[]> {
    if (!ids.length) return [];
    const sql = `SELECT campaignId, visitedAt FROM projectCampaignVisit WHERE campaignId IN (?)${days ? ' AND visitedAt >= NOW() - INTERVAL ? DAY' : ''}`;
    return db.query<VisitRow>(sql, days ? [ids, days] : [ids]);
  }
}
