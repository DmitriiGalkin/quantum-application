import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { db } from '../utils/dbNext.js';
import type { ConversationRow } from 'entities';

class ConversationRepository {
  static async inspectSeedRows(conn: PoolConnection): Promise<Record<string, unknown>[]> {
    const [rows] = await conn.query<RowDataPacket[]>('SELECT * FROM conversation FOR UPDATE');
    return rows;
  }

  static async findByIds(ids: number[], conn?: PoolConnection): Promise<ConversationRow[]> {
    if (!ids.length) return [];
    const sql = "SELECT * FROM conversation WHERE id IN (?) AND deletedAt IS NULL AND type = 'direct'";
    return conn ? (await conn.query<ConversationRow[]>(sql, [ids]))[0] : db.query<ConversationRow>(sql, [ids]);
  }
  // Create a new conversation
  static async create(conn?: PoolConnection): Promise<number> {
    const result = await (conn ?? db).execute<ResultSetHeader>(
      `INSERT INTO conversation (type, createdAt, updatedAt)
       VALUES ('direct', NOW(), NOW())`,
    );
    return Array.isArray(result) ? result[0].insertId : result.insertId;
  }

  // Find conversation by ID
  static async findById(id: number): Promise<ConversationRow | null> {
    const rows = await db.query<ConversationRow>(
      `SELECT * FROM conversation
       WHERE id = ? AND deletedAt IS NULL`,
      [id],
    );
    return rows[0] || null;
  }
}

export default ConversationRepository;
