import pool from '../db.js';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

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

      return result.insertId;
    } catch (err) {
      console.error('IdeaUser.create error:', err);
      throw err;
    }
  }

  // ✅ DELETE by id
  static async delete(id: number): Promise<void> {
    try {
      await pool.query('DELETE FROM ideaUser WHERE id = ?', [id]);
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
}

export default IdeaUserRepository;
