import pool from '../db.js';
import { ResultSetHeader } from 'mysql2/promise';
import type { ChatRow, ChatWithLastMessageRow } from '../entities/chat.db.js';
import { mapChatRow, mapChatWithLastMessage } from '../mappers/chat.mapper.js';
import { Chat, ChatWithLastMessage, CreateChatInput, UpdateChat } from '../entities/chat.js';
import { UpdateUserInput } from '../entities/user.types.js';

class ChatRepository {
  // ✅ CREATE
  static async create(data: CreateChatInput): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO chat (passportId, userId, target, context)
       VALUES (?, ?, ?, ?)`,
      [data.passportId, data.userId, data.target ?? null, JSON.stringify(data.context)],
    );

    return result.insertId;
  }

  // ✅ UPDATE (partial)
  static async update(id: number, data: UpdateChat): Promise<boolean> {
    const entries = Object.entries(data).filter(([, v]) => v !== undefined);

    if (entries.length === 0) return false;

    const fields = entries.map(([k]) => `${k} = ?`).join(', ');
    const values = entries.map(([k, v]) => (k === 'context' && v !== null ? JSON.stringify(v) : v));

    const [result] = await pool.query<ResultSetHeader>(`UPDATE chat SET ${fields} WHERE id = ?`, [...values, id]);
    //console.log(result, 'result');
    return result.affectedRows > 0;
  }

  // ✅ FIND BY ID
  static async findById(id: number): Promise<Chat | null> {
    const [rows] = await pool.query<ChatRow[]>(
      `SELECT *
       FROM chat
       WHERE id = ?
         AND deletedAt IS NULL
       LIMIT 1`,
      [id],
    );

    if (!rows[0]) return null;

    return mapChatRow(rows[0]);
  }

  // ✅ ACTIVE CHAT
  static async findActiveByPassportId(passportId: number): Promise<Chat | null> {
    const [rows] = await pool.query<ChatRow[]>(
      `SELECT *
       FROM chat
       WHERE passportId = ?
         AND deletedAt IS NULL
       ORDER BY updatedAt DESC
       LIMIT 1`,
      [passportId],
    );

    return rows[0] ? mapChatRow(rows[0]) : null;
  }

  // ✅ FIND BY ID + PASSPORT
  static async findByIdAndPassportId(id: number, passportId: number): Promise<Chat | null> {
    const [rows] = await pool.query<ChatRow[]>(
      `SELECT *
       FROM chat
       WHERE id = ?
         AND passportId = ?
         AND deletedAt IS NULL
       LIMIT 1`,
      [id, passportId],
    );

    return rows[0] ? mapChatRow(rows[0]) : null;
  }

  // ✅ TOUCH
  static async touch(id: number): Promise<void> {
    await pool.query(
      `UPDATE chat
       SET updatedAt = CURRENT_TIMESTAMP()
       WHERE id = ?`,
      [id],
    );
  }

}

export default ChatRepository;
