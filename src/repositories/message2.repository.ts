import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import type { Message, Message2Row, UpdateMessageRequest } from 'entities';
import { db } from '../utils/dbNext.js';

class Message2Repository {
  static async countByConversation(conversationId: number, conn: PoolConnection): Promise<number> {
    const [rows] = await conn.query<(RowDataPacket & { count: number })[]>(
      'SELECT COUNT(*) AS count FROM message2 WHERE conversationId = ?', [conversationId]);
    return Number(rows[0].count);
  }
  static async unread(conversationId: number, passportId: number, lastReadId: number, lastReadAt: string | null) {
    const [row] = await db.query<{ count: number }>(`SELECT COUNT(*) count FROM message2 WHERE conversationId=? AND senderPassportId<>? AND deletedAt IS NULL
      AND id>? AND (? IS NULL OR createdAt>?)`, [conversationId,passportId,lastReadId,lastReadId ? null : lastReadAt,lastReadId ? null : lastReadAt]);
    return Number(row.count);
  }
  static async latestByConversations(ids: number[]): Promise<Message[]> {
    if (!ids.length) return [];
    return db.query<Message>(`SELECT id, conversationId, senderPassportId, text, createdAt, updatedAt FROM (
      SELECT id, conversationId, senderPassportId, text, createdAt, updatedAt,
        ROW_NUMBER() OVER (PARTITION BY conversationId ORDER BY createdAt DESC, id DESC) AS position
      FROM message2 WHERE conversationId IN (?) AND deletedAt IS NULL
    ) ranked WHERE position = 1`, [ids]);
  }
  static async inspectSeedRows(conn: PoolConnection): Promise<Record<string, unknown>[]> {
    const [rows] = await conn.query<RowDataPacket[]>('SELECT * FROM message2 FOR UPDATE');
    return rows;
  }

  static async findById(id: number): Promise<Message2Row | null> {
    const rows = await db.query<Message2Row>('SELECT * FROM message2 WHERE id = ? AND deletedAt IS NULL', [id]);
    return rows[0] ?? null;
  }
  // Create a new message
  static async create(conversationId: number, senderPassportId: number, text: string, conn?: PoolConnection): Promise<Message> {
    const result = await (conn ?? db).execute<ResultSetHeader>(
      `INSERT INTO message2 (conversationId, senderPassportId, text)
       VALUES (?, ?, ?)`,
      [conversationId, senderPassportId, text],
    );

    return {
      id: (Array.isArray(result) ? result[0] : result).insertId,
      conversationId,
      senderPassportId,
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
       ORDER BY createdAt, id`,
      [conversationId],
    );
  }
}

export default Message2Repository;
