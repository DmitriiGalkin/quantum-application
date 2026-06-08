import pool from '../db.js';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { MeetUserRow } from './meetUser.repository.js';

interface IdeaUserRow extends RowDataPacket {
  id: number;
  ideaId: number;
  userId: number;
}

class IdeaUserRepository {
  // ✅ CREATE
  static async create(data: { userId: number; ideaId: number }): Promise<number> {
    try {
      const [result] = await pool.query<ResultSetHeader>('INSERT INTO ideaUser (ideaId, userId) VALUES (?, ?)', [data.ideaId, data.userId]);
      await pool.query(
        `UPDATE idea
       SET userCount = COALESCE(userCount, 0) + 1
       WHERE id = ?`,
        [Number(data.ideaId)],
      );

      return result.insertId;
    } catch (err) {
      console.error('IdeaUser.create error:', err);
      throw err;
    }
  }

  // ✅ DELETE by id
  static async delete(data: { userId: number; ideaId: number }): Promise<void> {
    try {
      await pool.query('DELETE FROM ideaUser WHERE ideaId = ? AND userId = ?', [data.ideaId, data.userId]);
      await pool.query(
        `UPDATE idea
       SET userCount = COALESCE(userCount, 0) - 1
       WHERE id = ?`,
        [Number(data.ideaId)],
      );
    } catch (err) {
      console.error('IdeaUser.delete error:', err);
      throw err;
    }
  }

  // ✅ DELETE by userId
  static async deleteByUserId(userId: number): Promise<void> {
    try {
      await pool.query('DELETE FROM ideaUser WHERE userId = ?', [userId]);
    } catch (err) {
      console.error('IdeaUser.deleteByUserId error:', err);
      throw err;
    }
  }

  // ✅ FIND BY ID
  static async findById(id: number): Promise<IdeaUserRow | null> {
    try {
      const [rows] = await pool.query<IdeaUserRow[]>('SELECT * FROM ideaUser WHERE id = ?', [id]);

      return rows[0] ?? null;
    } catch (err) {
      console.error('IdeaUser.findById error:', err);
      throw err;
    }
  }

  // ✅ FIND BY IDEA ID
  static async findByIdeaId(ideaId: number): Promise<IdeaUserRow[]> {
    try {
      const [rows] = await pool.query<IdeaUserRow[]>('SELECT * FROM ideaUser WHERE ideaId = ?', [ideaId]);

      return rows;
    } catch (err) {
      console.error('IdeaUser.findByIdeaId error:', err);
      throw err;
    }
  }

  static async findByIdeaAndUserIds(ideaId: number, userId: number): Promise<IdeaUserRow | null> {
    const [rows] = await pool.query<IdeaUserRow[]>('SELECT * FROM ideaUser WHERE ideaId = ? AND userId = ?', [ideaId, userId]);

    return rows[0] ?? null;
  }
}

export default IdeaUserRepository;
