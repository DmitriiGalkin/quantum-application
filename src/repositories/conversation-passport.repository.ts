import { db } from '../dbNext.js';
import { ResultSetHeader } from 'mysql2/promise';
import { ConversationPassportRow } from '../entities/conversation-passport.db.js';

class ConversationPassportRepository {
  // Add passport to conversation
  static async addPassport(
    conversationId: number,
    passportId: number
  ): Promise<void> {
    await db.execute<ResultSetHeader>(
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
