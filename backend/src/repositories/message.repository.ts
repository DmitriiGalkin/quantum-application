import { RowDataPacket } from 'mysql2/promise';
import pool from '../db.js';
import { ResultSetHeader } from 'mysql2/promise';
import { ChatMessageRole, ChatTarget } from '@shared/types';

export interface MessageRow extends RowDataPacket {
  id: number;
  chatId: number;
  passportId: number | null;
  role: ChatMessageRole;
  content: string | null;
  metadata: string | null; // 👈 В БД это строка!
  target: ChatTarget;
  createdAt: string;
}

class MessageRepository {
  // ✅ CREATE
  static async create(data: {
    chatId: number;
    passportId?: number | null;
    role: string;
    content?: string | null;
    metadata?: object | null;
    target?: string | null;
  }): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO message
       (chatId, passportId, role, content, metadata, target)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.chatId,
        data.passportId ?? null,
        data.role,
        data.content ?? null,
        data.metadata ? JSON.stringify(data.metadata) : null,
        data.target ?? null,
      ],
    );

    return result.insertId;
  }

  // ✅ FIND BY ID
  static async findById(id: number): Promise<MessageRow | null> {
    const [rows] = await pool.query<MessageRow[]>('SELECT * FROM message WHERE id = ?', [id]);

    return rows[0] ?? null;
  }

  // ✅ FIND BY CHAT
  static async findByChatId(chatId: number): Promise<MessageRow[]> {
    const [rows] = await pool.query<MessageRow[]>(
      `SELECT *
       FROM message
       WHERE chatId = ?
       ORDER BY createdAt ASC, id ASC`,
      [chatId],
    );

    return rows;
  }

  // ✅ LAST MESSAGES
  static async findLastByChatId(chatId: number, limit: number): Promise<MessageRow[]> {
    const [rows] = await pool.query<MessageRow[]>(
      `SELECT *
       FROM message
       WHERE chatId = ?
       ORDER BY createdAt DESC, id DESC
       LIMIT ?`,
      [chatId, limit],
    );

    return rows.reverse(); // 👈 оставляем твою логику
  }

  // ✅ UPDATE
  static async update(
    id: number,
    updateData: {
      content?: string;
      metadata?: object;
    },
  ): Promise<number> {
    if (!updateData || Object.keys(updateData).length === 0) {
      throw new Error('Нет данных для обновления');
    }

    const sqlParts: string[] = [];
    const values: (string | number)[] = [];

    if (updateData.content !== undefined) {
      sqlParts.push('content = ?');
      values.push(updateData.content);
    }

    if (updateData.metadata !== undefined) {
      sqlParts.push('metadata = ?');
      values.push(JSON.stringify(updateData.metadata));
    }

    if (sqlParts.length === 0) {
      throw new Error('Нет валидных полей для обновления');
    }

    values.push(id);

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE message
       SET ${sqlParts.join(', ')}
       WHERE id = ?`,
      values,
    );

    return result.affectedRows;
  }
}

export default MessageRepository;