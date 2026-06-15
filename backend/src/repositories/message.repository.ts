import pool from '../db.js';
import { ResultSetHeader } from 'mysql2/promise';
import { MessageRow } from '../entities/message.db.js';
import { mapMessageRow } from '../mappers/message.mapper.js';
import { Message } from '../entities/message.js';
import { CreateMessageInput, UpdateMessageInput } from '../entities/message.types.js';

class MessageRepository {
  // ✅ CREATE
  static async create(data: CreateMessageInput): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO message
         (chatId, passportId, role, content)
       VALUES (?, ?, ?, ?)`,
      [
        data.chatId,
        data.passportId ?? null,
        data.role,
        data.content ?? null,
      ],
    );

    return result.insertId;
  }

  // ✅ FIND BY ID
  static async findById(id: number): Promise<Message | null> {
    const [rows] = await pool.query<MessageRow[]>(`SELECT * FROM message WHERE id = ?`, [id]);

    return rows[0] ? mapMessageRow(rows[0]) : null;
  }

  // ✅ FIND BY CHAT
  static async findByChatId(chatId: number): Promise<Message[]> {
    const [rows] = await pool.query<MessageRow[]>(
      `SELECT *
       FROM message
       WHERE chatId = ?
       ORDER BY createdAt ASC, id ASC`,
      [chatId],
    );

    return rows.map(mapMessageRow);
  }

  // ✅ LAST MESSAGES
  static async findLastByChatId(chatId: number, limit: number): Promise<Message[]> {
    const [rows] = await pool.query<MessageRow[]>(
      `SELECT *
       FROM message
       WHERE chatId = ?
       ORDER BY createdAt DESC, id DESC
       LIMIT ?`,
      [chatId, limit],
    );

    return rows.reverse().map(mapMessageRow);
  }

  // ✅ UPDATE
  static async update(id: number, data: UpdateMessageInput): Promise<boolean> {
    const entries = Object.entries(data).filter(([, v]) => v !== undefined);

    if (entries.length === 0) return false;

    const fields = entries.map(([k]) => `${k} = ?`).join(', ');
    const values = entries.map(([k, v]) => (k === 'metadata' && v !== null ? JSON.stringify(v) : v));

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE message
       SET ${fields}
       WHERE id = ?`,
      [...values, id],
    );

    return result.affectedRows > 0;
  }
}

export default MessageRepository;
