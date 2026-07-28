import { ResultSetHeader } from 'mysql2/promise';
import { Message, UpdateMessageRequest } from '@shared/types';
import { db } from '../dbNext.js';

class Message2Repository {
  // Create a new message
  static async create(conversationId: number, senderPassportId: number, text: string): Promise<Message> {
    const result = await db.execute<ResultSetHeader>(
      `INSERT INTO message2 (conversationId, senderPassportId, text)
       VALUES (?, ?, ?)`,
      [conversationId, senderPassportId, text],
    );

    return {
      id: result.insertId,
      conversationId,
      text,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Update message content
  static async update(id: number, update: UpdateMessageRequest): Promise<boolean> {
    const result = await db.execute<ResultSetHeader>(
      `UPDATE message2 
       SET text = ?, updatedAt = NOW()
       WHERE id = ?`,
      [update.content, id],
    );
    return result.affectedRows > 0;
  }

  // Soft delete message
  static async delete(id: number): Promise<boolean> {
    const result = await db.execute<ResultSetHeader>(
      `UPDATE message2 
       SET deletedAt = NOW()
       WHERE id = ?`,
      [id],
    );
    return result.affectedRows > 0;
  }

  // Get messages by conversation
  static async getByConversation(conversationId: number): Promise<Message[]> {
    return await db.query<Message>(
      `SELECT * 
       FROM message2 
       WHERE conversationId = ? 
         AND deletedAt IS NULL
       ORDER BY createdAt`,
      [conversationId],
    );
  }
}

export default Message2Repository;