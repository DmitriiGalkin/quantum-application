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
      `INSERT INTO chat (passportId, userId, target)
       VALUES (?, ?, ?)`,
      [data.passportId, data.userId, data.target ?? null],
    );

    return result.insertId;
  }

  // ✅ UPDATE (partial)
  static async update(id: number, data: UpdateChat): Promise<boolean> {
    const entries = Object.entries(data).filter(([, v]) => v !== undefined);

    if (entries.length === 0) return false;

    const fields = entries.map(([k]) => `${k} = ?`).join(', ');
    const values = entries.map(([k, v]) => (k === 'metadata' && v !== null ? JSON.stringify(v) : v));

    const [result] = await pool.query<ResultSetHeader>(`UPDATE chat SET ${fields} WHERE id = ?`, [...values, id]);

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

  // 🔥 FIND ALL (с last message)
  static async findAllByPassportId(passportId: number): Promise<ChatWithLastMessage[]> {
    const [rows] = await pool.query<ChatWithLastMessageRow[]>(
      `SELECT
         chat.*,
         lastMessage.content AS lastMessage,
         lastMessage.createdAt AS lastMessageAt,
         lastMessage.role AS lastMessageRole
       FROM chat
              LEFT JOIN (
         SELECT m.chatId, m.content, m.createdAt, m.role
         FROM message m
         WHERE m.id = (
           SELECT id
           FROM message
           WHERE chatId = m.chatId
           ORDER BY createdAt DESC, id DESC
           LIMIT 1
         )
       ) AS lastMessage ON lastMessage.chatId = chat.id
       WHERE chat.passportId = ?
         AND chat.deletedAt IS NULL`,
      [passportId],
    );

    return rows.map(mapChatWithLastMessage).sort((a, b) => {
      const dateA = new Date(a.lastMessageAt ?? a.updatedAt).getTime();
      const dateB = new Date(b.lastMessageAt ?? b.updatedAt).getTime();
      return dateB - dateA;
    });
  }
}

export default ChatRepository;
