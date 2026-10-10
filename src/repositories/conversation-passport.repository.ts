import { db } from '../utils/dbNext.js';
import type { PoolConnection, ResultSetHeader } from 'mysql2/promise';
import type { ConversationPassportRow } from 'entities';

class ConversationPassportRepository {
  static async findByPassportIds(passportIds: number[], conn?: PoolConnection): Promise<ConversationPassportRow[]> {
    const sql = 'SELECT * FROM conversationPassport WHERE passportId IN (?)';
    return conn ? (await conn.query<ConversationPassportRow[]>(sql, [passportIds]))[0] : db.query<ConversationPassportRow>(sql, [passportIds]);
  }
  // Add passport to conversation
  static async addPassport(
    conversationId: number,
    passportId: number,
    conn?: PoolConnection,
  ): Promise<void> {
    await (conn ?? db).execute<ResultSetHeader>(
      `INSERT INTO conversationPassport (conversationId, passportId)
       VALUES (?, ?)`,
      [conversationId, passportId]
    );
  }

  // Find passports in conversation
  static async findPassports(
    conversationId: number
  ): Promise<ConversationPassportRow[]> {
    const rows = await db.query<ConversationPassportRow>(
      `SELECT * FROM conversationPassport
       WHERE conversationId = ?`,
      [conversationId]
    );
    return rows;
  }
}

export default ConversationPassportRepository;
