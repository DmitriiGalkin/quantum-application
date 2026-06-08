import { RowDataPacket } from 'mysql2/promise';
import pool from '../db.js';
import { ResultSetHeader } from 'mysql2/promise';

export interface ChatRow extends RowDataPacket {
  id: number;
  passportId: number;
  title: string | null;
  target: string | null;
  deletedAt: string | null;
  updatedAt: string;

  lastMessage?: string | null;
  lastMessageAt?: string | null;
  lastMessageRole?: string | null;
}

class ChatRepository {
  // ✅ CREATE
  static async create(data: { passportId: number; title?: string | null; target?: string | null }): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO chat (passportId, title, target)
       VALUES (?, ?, ?)`,
      [data.passportId, data.title ?? null, data.target ?? null],
    );

    return result.insertId;
  }

  // ✅ FIND BY ID
  static async findById(id: number): Promise<ChatRow | null> {
    const [rows] = await pool.query<ChatRow[]>(
      `SELECT *
       FROM chat
       WHERE id = ?
         AND deletedAt IS NULL
       LIMIT 1`,
      [id],
    );

    return rows[0] ?? null;
  }

  // ✅ ACTIVE CHAT
  static async findActiveByPassportId(passportId: number): Promise<ChatRow | null> {
    const [rows] = await pool.query<ChatRow[]>(
      `SELECT *
       FROM chat
       WHERE passportId = ?
         AND deletedAt IS NULL
       ORDER BY updatedAt DESC
       LIMIT 1`,
      [passportId],
    );

    return rows[0] ?? null;
  }

  // ✅ FIND BY ID + PASSPORT
  static async findByIdAndPassportId(id: number, passportId: number): Promise<ChatRow | null> {
    const [rows] = await pool.query<ChatRow[]>(
      `SELECT *
       FROM chat
       WHERE id = ?
         AND passportId = ?
         AND deletedAt IS NULL
       LIMIT 1`,
      [id, passportId],
    );

    return rows[0] ?? null;
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
  static async findAllByPassportId(passportId: number): Promise<ChatRow[]> {
    const [rows] = await pool.query<ChatRow[]>(
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

    // 👉 чистая сортировка (без cast)
    return rows.sort((a, b) => {
      const dateA = new Date(a.lastMessageAt ?? a.updatedAt).getTime();
      const dateB = new Date(b.lastMessageAt ?? b.updatedAt).getTime();
      return dateB - dateA;
    });
  }
}

export default ChatRepository;