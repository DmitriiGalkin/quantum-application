import pool from '../db';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { Chat } from '../../../application/src/types';

class ChatModel {
  static async create(data: Chat): Promise<number> {
    const sql = `
      INSERT INTO \`chat\`
        (passportId, title, target)
      VALUES
        (?, ?, ?)
    `;
    const values = [data.passportId, data.title || null, data.target || null];

    try {
      const [result] = await pool.query<ResultSetHeader>(sql, values);
      return result.insertId;
    } catch (err) {
      console.error('Chat.create error:', err);
      throw err;
    }
  }

  static async findById(id: string): Promise<Chat | null> {
    const sql = 'SELECT * FROM chat WHERE id = ? AND deletedAt IS NULL LIMIT 1';

    try {
      const [rows]= await pool.query<RowDataPacket[]>(sql, [id]);
      return rows.length > 0 ? rows[0] as Chat : null;
    } catch (err) {
      console.error('Chat.findById error:', err);
      throw err;
    }
  }

  static async findActiveByPassportId(passportId: string): Promise<Chat | null> {
    const sql = `
      SELECT *
      FROM chat
      WHERE passportId = ?
        AND deletedAt IS NULL
      ORDER BY updatedAt DESC
      LIMIT 1
    `;

    try {
      const [rows] = await pool.query<RowDataPacket[]>(sql, [passportId]);
      return rows.length > 0 ? (rows[0] as Chat) : null;
    } catch (err) {
      console.error('Chat.findActiveByPassportId error:', err);
      throw err;
    }
  }

  static async findByIdAndPassportId(id: string | number, passportId: string | number): Promise<Chat | null> {
    const sql = `
      SELECT *
      FROM chat
      WHERE id = ?
        AND passportId = ?
        AND deletedAt IS NULL
      LIMIT 1
    `;

    try {
      const [rows] = await pool.query<RowDataPacket[]>(sql, [id, passportId]);
      return rows.length > 0 ? rows[0] as Chat : null;
    } catch (err) {
      console.error('Chat.findByIdAndPassportId error:', err);
      throw err;
    }
  }

  static async touch(id: string | number): Promise<void> {
    const sql = 'UPDATE chat SET updatedAt = CURRENT_TIMESTAMP() WHERE id = ?';

    try {
      await pool.query(sql, [id]);
    } catch (err) {
      console.error('Chat.touch error:', err);
      throw err;
    }
  }

  static async findAllByPassportId(passportId: string | number): Promise<Chat[]> {
    const sql = `
      SELECT
        chat.*,
        lastMessage.content AS lastMessage,
        lastMessage.createdAt AS lastMessageAt,
        lastMessage.role AS lastMessageRole
      FROM chat
             LEFT JOIN (
        SELECT chatId, content, createdAt, role
        FROM message cm_inner
        WHERE id IN (
          SELECT id
          FROM message
          WHERE chatId = cm_inner.chatId
          ORDER BY createdAt DESC, id DESC
          LIMIT 1
        )
      ) AS lastMessage ON lastMessage.chatId = chat.id
      WHERE chat.passportId = ?
        AND chat.deletedAt IS NULL
    `;

    try {
      const [rows] = await pool.query<RowDataPacket[]>(sql, [passportId]);

      // Преобразуем строки в объекты Chat и сортируем по дате последнего сообщения или обновлению чата.
      return rows.sort((a, b) => {
        const dateA = b.lastMessageAt || b.updatedAt;
        const dateB = a.lastMessageAt || a.updatedAt;
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      }) as Chat[];
    } catch (err) {
      console.error('Chat.findAllByPassportId error:', err);
      throw err;
    }
  }
}

export default ChatModel;