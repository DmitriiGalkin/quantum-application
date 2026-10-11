import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';

import type { IdeaUserRow, IdeaUser, CreateIdeaUserInput } from 'entities';
import { mapIdeaUserRow } from '../mappers/idea-user.mapper.js';
import { db } from '../utils/dbNext.js';

class IdeaUserRepository {
  static async moveSeedLike(id: number, ideaId: number, conn: PoolConnection): Promise<void> {
    await conn.execute('UPDATE ideaUser SET ideaId = ? WHERE id = ?', [ideaId, id]);
  }

  static async removeSeedRows(ids: number[], conn: PoolConnection): Promise<void> {
    if (ids.length) await conn.query('DELETE FROM ideaUser WHERE id IN (?)', [ids]);
  }
  static async inspectSeedRows(conn: PoolConnection): Promise<Record<string, unknown>[]> {
    const [rows] = await conn.query<RowDataPacket[]>('SELECT * FROM ideaUser FOR UPDATE');
    return rows;
  }

  // ✅ CREATE
  static async create(data: CreateIdeaUserInput): Promise<number> {
    const result = await db.execute<ResultSetHeader>(
      `INSERT INTO ideaUser (ideaId, userId)
       VALUES (?, ?)`,
      [data.ideaId, data.userId],
    );

    // 👉 side-effect оставляем (это ок)
    await db.execute(
      `UPDATE idea
       SET userCount = COALESCE(userCount, 0) + 1
       WHERE id = ?`,
      [data.ideaId],
    );

    return result.insertId;
  }

  // ✅ DELETE
  static async delete(data: CreateIdeaUserInput): Promise<boolean> {
    const result= await db.execute<ResultSetHeader>(
      `DELETE FROM ideaUser
       WHERE ideaId = ? AND userId = ?`,
      [data.ideaId, data.userId],
    );

    if (result.affectedRows === 0) return false;

    await db.execute(
      `UPDATE idea
       SET userCount = COALESCE(userCount, 0) - 1
       WHERE id = ?`,
      [data.ideaId],
    );

    return true;
  }

  // ✅ DELETE BY USER
  static async deleteByUserId(userId: number): Promise<void> {
    await db.execute(`DELETE FROM ideaUser WHERE userId = ?`, [userId]);
  }

  // ✅ FIND BY ID
  static async findById(id: number): Promise<IdeaUser | null> {
    const rows = await db.query<IdeaUserRow>(`SELECT * FROM ideaUser WHERE id = ?`, [id]);

    return rows[0] ? mapIdeaUserRow(rows[0]) : null;
  }

  // ✅ FIND BY IDEA
  static async findByIdeaId(ideaId: number): Promise<IdeaUser[]> {
    const rows = await db.query<IdeaUserRow>(`SELECT * FROM ideaUser WHERE ideaId = ?`, [ideaId]);

    return rows.map(mapIdeaUserRow);
  }

  // ✅ FIND BY IDEA + USER
  static async findByIdeaAndUserIds(ideaId: number, userId: number): Promise<IdeaUser | null> {
    const rows = await db.query<IdeaUserRow>(
      `SELECT *
       FROM ideaUser
       WHERE ideaId = ? AND userId = ?`,
      [ideaId, userId],
    );

    return rows[0] ? mapIdeaUserRow(rows[0]) : null;
  }
}

export default IdeaUserRepository;
