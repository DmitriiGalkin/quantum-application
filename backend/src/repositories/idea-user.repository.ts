import pool from '../db.js';
import { ResultSetHeader } from 'mysql2/promise';

import { IdeaUserRow } from '../entities/idea-user.db.js';
import { mapIdeaUserRow } from '../mappers/idea-user.mapper.js';

import { IdeaUser } from '../entities/idea-user.js';
import { CreateIdeaUserInput } from '../entities/idea-user.types.js';

class IdeaUserRepository {
  // ✅ CREATE
  static async create(data: CreateIdeaUserInput): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO ideaUser (ideaId, userId)
       VALUES (?, ?)`,
      [data.ideaId, data.userId],
    );

    // 👉 side-effect оставляем (это ок)
    await pool.query(
      `UPDATE idea
       SET userCount = COALESCE(userCount, 0) + 1
       WHERE id = ?`,
      [data.ideaId],
    );

    return result.insertId;
  }

  // ✅ DELETE
  static async delete(data: CreateIdeaUserInput): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      `DELETE FROM ideaUser
       WHERE ideaId = ? AND userId = ?`,
      [data.ideaId, data.userId],
    );

    if (result.affectedRows === 0) return false;

    await pool.query(
      `UPDATE idea
       SET userCount = COALESCE(userCount, 0) - 1
       WHERE id = ?`,
      [data.ideaId],
    );

    return true;
  }

  // ✅ DELETE BY USER
  static async deleteByUserId(userId: number): Promise<void> {
    await pool.query(`DELETE FROM ideaUser WHERE userId = ?`, [userId]);
  }

  // ✅ FIND BY ID
  static async findById(id: number): Promise<IdeaUser | null> {
    const [rows] = await pool.query<IdeaUserRow[]>(`SELECT * FROM ideaUser WHERE id = ?`, [id]);

    return rows[0] ? mapIdeaUserRow(rows[0]) : null;
  }

  // ✅ FIND BY IDEA
  static async findByIdeaId(ideaId: number): Promise<IdeaUser[]> {
    const [rows] = await pool.query<IdeaUserRow[]>(`SELECT * FROM ideaUser WHERE ideaId = ?`, [ideaId]);

    return rows.map(mapIdeaUserRow);
  }

  // ✅ FIND BY IDEA + USER
  static async findByIdeaAndUserIds(ideaId: number, userId: number): Promise<IdeaUser | null> {
    const [rows] = await pool.query<IdeaUserRow[]>(
      `SELECT *
       FROM ideaUser
       WHERE ideaId = ? AND userId = ?`,
      [ideaId, userId],
    );

    return rows[0] ? mapIdeaUserRow(rows[0]) : null;
  }
}

export default IdeaUserRepository;
