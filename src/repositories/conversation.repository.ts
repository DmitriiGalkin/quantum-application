import { db } from '../dbNext.js';
import { ResultSetHeader } from 'mysql2/promise';
import { ConversationRow } from '../entities/conversation.db.js';

class ConversationRepository {
  // Create a new conversation
  static async create(): Promise<number> {
    const result = await db.execute<ResultSetHeader>(
        `INSERT INTO conversation (type, createdAt, updatedAt)
       VALUES ('direct', NOW(), NOW())`
    );
    return result.insertId;
  }

  // Find conversation by ID
  static async findById(id: number): Promise<ConversationRow | null> {
    const rows = await db.query<ConversationRow>(
        `SELECT * FROM conversation 
       WHERE id = ? AND deletedAt IS NULL`,
      [id]
    );
    return rows[0] || null;
  }

  // Find conversation between two passports
  static async findBetweenPassports(
    passportA: number, 
    passportB: number
  ): Promise<ConversationRow | null> {
    const rows = await db.query<ConversationRow>(
      `SELECT c.* 
       FROM conversation c
       JOIN conversationPassport cp1 ON c.id = cp1.conversationId
       JOIN conversationPassport cp2 ON c.id = cp2.conversationId
       WHERE cp1.passportId = ? 
         AND cp2.passportId = ?
         AND c.type = 'direct'
         AND c.deletedAt IS NULL
       LIMIT 1`,
      [passportA, passportB],
    );
    return rows[0] || null;
  }

  // Find all conversations for a passport
  static async findUserConversations(
    passportId: number
  ): Promise<ConversationRow[]> {
    const rows = await db.query<ConversationRow>(
        `SELECT c.* 
       FROM conversation c
       JOIN conversationPassport cp ON c.id = cp.conversationId
       WHERE cp.passportId = ?
         AND c.deletedAt IS NULL`,
      [passportId]
    );
    return rows;
  }

  // Create a new individual conversation
  static async createIndividual(passportId: number): Promise<number> {
    const result = await db.execute<ResultSetHeader>(
        `INSERT INTO conversation (type, createdAt, updatedAt)
       VALUES ('direct', NOW(), NOW())`
    );
    const conversationId = result.insertId;
    
    // Add passport to conversation
    await db.execute(
      `INSERT INTO conversationPassport (conversationId, passportId)
       VALUES (?, ?)`,
      [conversationId, passportId]
    );
    
    return conversationId;
  }

  // Get conversation by ID with messages
  static async getConversationWithMessages(id: number): Promise<any> {
    const conversation = await this.findById(id);
    if (!conversation) return null;
    
    const messages = await db.query(
      `SELECT * FROM message2 
       WHERE conversationId = ? 
       AND deletedAt IS NULL
       ORDER BY createdAt`,
      [id]
    );
    
    return {
      ...conversation,
      messages
    };
  }
}

export default ConversationRepository;
