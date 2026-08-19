import { ResultSetHeader } from 'mysql2/promise';
import { MessageRow } from '../entities/message.db.js';
import { mapMessageRow } from '../mappers/message.mapper.js';
import { Message } from '../entities/message.js';
import { CreateMessageInput } from '../entities/message.types.js';
import { db } from '../dbNext.js';

class MessageRepository {

  static async create(data: CreateMessageInput): Promise<number> {
    const result = await db.execute<ResultSetHeader>(
      `INSERT INTO message
         (chatId, role, content)
       VALUES (?, ?, ?)`,
      [data.chatId, data.role, data.content],
    );

    return result.insertId;
  }

  // ✅ FIND BY ID
  static async findById(id: number): Promise<Message | null> {
    const rows = await db.query<MessageRow>(`SELECT * FROM message WHERE id = ?`, [id]);

    return rows[0] ? mapMessageRow(rows[0]) : null;
  }

  // ✅ FIND BY CHAT
  static async findByChatId(chatId: number): Promise<Message[]> {
    const rows = await db.query<MessageRow>(
      `SELECT *
       FROM message
       WHERE chatId = ?
       ORDER BY createdAt ASC, id ASC`,
      [chatId],
    );

    return rows.map(mapMessageRow);
  }

  // ✅ LAST NOT READ MESSAGES
  static async findLastByChatId(chatId: number, limit: number): Promise<Message[]> {
    const rows = await db.query<MessageRow>(
      `SELECT *
       FROM message
       WHERE chatId = ?
       AND COALESCE(isRead, FALSE) = FALSE
       ORDER BY createdAt DESC, id DESC
       LIMIT ?`,
      [chatId, limit],
    );

    return rows.reverse().map(mapMessageRow);
  }

  static async markChatAsRead(chatId: number): Promise<number> {
    const result = await db.execute<ResultSetHeader>(
      `UPDATE message
     SET isRead = TRUE
     WHERE chatId = ?
       AND isRead = FALSE`,
      [chatId],
    );

    return result.affectedRows;
  }
}

export default MessageRepository;
