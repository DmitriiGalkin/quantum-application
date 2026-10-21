import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { db } from '../utils/dbNext.js';

export interface CampaignRow extends RowDataPacket {
  id: number;
  projectId: number;
  creatorPassportId: number;
  initiator: 'teacher' | 'place';
  channel: string;
  token: string;
  createdAt: string;
}

export default class ProjectCampaignRepository {
  static async create(projectId: number, creatorPassportId: number, initiator: 'teacher' | 'place', channel: string, token: string): Promise<number> {
    const result = await db.execute<ResultSetHeader>(
      'INSERT INTO projectCampaign (projectId, creatorPassportId, initiator, channel, token) VALUES (?, ?, ?, ?, ?)',
      [projectId, creatorPassportId, initiator, channel, token],
    );
    return result.insertId;
  }

  static async findByToken(token: string, conn?: PoolConnection): Promise<CampaignRow | null> {
    const sql = 'SELECT * FROM projectCampaign WHERE token = ?';
    const rows = conn ? (await conn.query<CampaignRow[]>(sql, [token]))[0] : await db.query<CampaignRow>(sql, [token]);
    return rows[0] ?? null;
  }

  static async findByProjectIds(projectIds: number[], conn?: PoolConnection): Promise<CampaignRow[]> {
    if (!projectIds.length) return [];
    const sql = 'SELECT * FROM projectCampaign WHERE projectId IN (?) ORDER BY createdAt DESC';
    return conn ? (await conn.query<CampaignRow[]>(sql, [projectIds]))[0] : db.query<CampaignRow>(sql, [projectIds]);
  }
}
